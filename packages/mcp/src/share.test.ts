// Invio dei totali di token (F27): parte solo con il codice dell'anteprima e manda esattamente quelle righe.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createShare, sharePreviewText } from "./share.ts";
import type { ShareRow } from "./usage.ts";

const row: ShareRow = { key: "a".repeat(64), day: "2026-11-18", agent: "AISA-02", model: "sonnet", effort: "medium", input: 12000, output: 30, cacheRead: 5, cacheWrite: 0 };

function fakeFetch(status: number) {
  const calls: { url: string; body: unknown }[] = [];
  const fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(init.body as string) });
    return new Response("", { status });
  }) as unknown as typeof globalThis.fetch;
  return { calls, fetch };
}

test("draft e confirm: invia esattamente l'anteprima, una volta sola", async () => {
  const { calls, fetch } = fakeFetch(201);
  const share = createShare({ version: "0.7.0", url: "http://127.0.0.1:1/api/usage", fetch });
  const { code, payload } = share.draft([row]);
  assert.match(code, /^[0-9a-f]{8}$/);
  assert.deepEqual(await share.confirm(code), { ok: true, rows: 1 });
  assert.deepEqual(calls, [{ url: "http://127.0.0.1:1/api/usage", body: payload }]);
  assert.deepEqual(payload, { mcpVersion: "0.7.0", rows: [row] });
  assert.equal((await share.confirm(code)).ok, false, "il codice vale una volta");
  assert.equal(calls.length, 1);
});

test("confirm: codice scaduto, nessuna riga, limite, dati respinti, rete assente", async () => {
  let now = 0;
  const { calls, fetch } = fakeFetch(429);
  const share = createShare({ version: "0.7.0", fetch, now: () => now });
  const old = share.draft([row]).code;
  now = 10 * 60_000;
  const expired = await share.confirm(old);
  assert.match(expired.ok ? "" : expired.message, /scaduto/);
  assert.equal(calls.length, 0);
  const empty = share.draft([]).code;
  assert.deepEqual(await share.confirm(empty), { ok: false, message: "Nessuna riga da inviare." });
  const limited = await share.confirm(share.draft([row]).code);
  assert.match(limited.ok ? "" : limited.message, /Limite/);
  const bad = createShare({ version: "0.7.0", fetch: fakeFetch(400).fetch });
  const rejected = await bad.confirm(bad.draft([row]).code);
  assert.match(rejected.ok ? "" : rejected.message, /respinti/);
  const offline = createShare({ version: "0.7.0", fetch: (async () => { throw new TypeError("fetch failed"); }) as unknown as typeof fetch });
  const failed = await offline.confirm(offline.draft([row]).code);
  assert.match(failed.ok ? "" : failed.message, /non è raggiungibile/);
});

test("sharePreviewText: ogni riga, l'avviso con l'informativa e il codice", () => {
  const text = sharePreviewText("0123abcd", { mcpVersion: "0.7.0", rows: [row] }, 2);
  assert.match(text, /1 righe, ultimi 30 giorni, versione 0\.7\.0/);
  assert.match(text, /- 2026-11-18 · AISA-02 · sonnet · medium: ingresso 12\.000, uscita 30, letti dalla cache 5, scritti in cache 0/);
  assert.match(text, /2 righe più vecchie restano fuori/);
  assert.match(text, /note-legali#consumo/);
  assert.match(text, /code "0123abcd"/);
  assert.match(sharePreviewText("0123abcd", { mcpVersion: "0.7.0", rows: [] }, 0), /non c'è nulla da inviare/);
});
