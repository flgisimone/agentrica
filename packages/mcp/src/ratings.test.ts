import assert from "node:assert/strict";
import { test } from "node:test";
import { createRatings, NOTICE, previewText, REMINDER_AFTER_MS, type Rating } from "./ratings.ts";

/** fetch finto: registra le richieste e risponde con lo stato dato (o fallisce come la rete assente). */
function fakeFetch(status: number | "offline") {
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(init.body as string) });
    if (status === "offline") throw new TypeError("fetch failed");
    return new Response(null, { status });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

function setup(status: number | "offline" = 201) {
  let clock = 1_000_000;
  const net = fakeFetch(status);
  const ratings = createRatings({ version: "9.9.9", url: "https://example.test/api/ratings", fetch: net.fn, now: () => clock });
  return { ratings, net, advance: (ms: number) => (clock += ms) };
}

test("due passi: l'anteprima non invia nulla, la conferma manda esattamente i campi di Rating", async () => {
  const { ratings, net } = setup();
  ratings.loaded("AISA-02");
  const { code, rating } = ratings.draft({ agentId: "AISA-02", rating: 4, comment: "  Chiaro, ma lento.  ", publish: true });
  assert.equal(net.calls.length, 0);
  assert.match(code, /^[0-9a-f]{8}$/);
  const result = await ratings.confirm(code, "AISA-02");
  assert.deepEqual(result, { ok: true, usageId: rating.usageId });
  assert.equal(net.calls.length, 1);
  assert.equal(net.calls[0]!.url, "https://example.test/api/ratings");
  assert.deepEqual(Object.keys(net.calls[0]!.body).sort(), ["agentId", "comment", "mcpVersion", "publish", "rating", "usageId"]);
  assert.deepEqual(net.calls[0]!.body, { usageId: rating.usageId, agentId: "AISA-02", rating: 4, comment: "Chiaro, ma lento.", publish: true, mcpVersion: "9.9.9" });
  assert.match(rating.usageId, /^[0-9a-f-]{36}$/);
  assert.equal(ratings.isRated("AISA-02"), true);
});

test("codice: monouso, legato all'agente, scade dopo 10 minuti", async () => {
  const { ratings, net, advance } = setup();
  const first = ratings.draft({ agentId: "AISA-02", rating: 5 });
  assert.equal((await ratings.confirm(first.code, "AISA-03")).ok, false);
  assert.equal((await ratings.confirm("deadbeef", "AISA-02")).ok, false);
  const late = ratings.draft({ agentId: "AISA-04", rating: 3 });
  advance(10 * 60_000);
  assert.equal((await ratings.confirm(late.code, "AISA-04")).ok, false);
  assert.equal(net.calls.length, 0);
  // Anche il primo codice, preparato prima, è scaduto.
  assert.equal((await ratings.confirm(first.code, "AISA-02")).ok, false);
  const again = ratings.draft({ agentId: "AISA-02", rating: 5 });
  assert.equal((await ratings.confirm(again.code, "AISA-02")).ok, true);
  assert.equal((await ratings.confirm(again.code, "AISA-02")).ok, false);
  assert.equal(net.calls.length, 1);
});

test("un voto per agente per sessione, stesso usageId per lo stesso agente, diverso fra agenti", async () => {
  const { ratings, net } = setup();
  const a = ratings.draft({ agentId: "AISA-02", rating: 2 });
  const b = ratings.draft({ agentId: "AISA-02", rating: 3 });
  const c = ratings.draft({ agentId: "AIWDA-08", rating: 3 });
  assert.equal(a.rating.usageId, b.rating.usageId);
  assert.notEqual(a.rating.usageId, c.rating.usageId);
  assert.equal((await ratings.send(a.rating)).ok, true);
  const second = await ratings.send(b.rating);
  assert.equal(second.ok, false);
  assert.equal(net.calls.length, 1);
  assert.equal((await ratings.send(c.rating)).ok, true);
});

test("errori: offline, 429, 400, 500 non segnano l'agente come valutato; 409 sì", async () => {
  const draft = (r: ReturnType<typeof setup>["ratings"]): Rating => r.draft({ agentId: "AISA-02", rating: 1 }).rating;
  for (const [status, pattern] of [
    ["offline", /non è raggiungibile/],
    [429, /già valutato questo agente oggi/],
    [400, /dati non validi/],
    [500, /errore 500/],
  ] as const) {
    const { ratings } = setup(status);
    const result = await ratings.send(draft(ratings));
    assert.equal(result.ok, false, String(status));
    assert.match(result.ok ? "" : result.message, pattern);
    assert.equal(ratings.isRated("AISA-02"), false);
  }
  const { ratings } = setup(409);
  assert.equal((await ratings.send(draft(ratings))).ok, true);
  assert.equal(ratings.isRated("AISA-02"), true);
});

test("promemoria: dopo 30 minuti, una volta sola, mai per gli agenti valutati", async () => {
  const { ratings, advance } = setup();
  ratings.loaded("AISA-02");
  ratings.loaded("AIWDA-08");
  advance(REMINDER_AFTER_MS - 1);
  assert.deepEqual(ratings.due(), []);
  await ratings.send(ratings.draft({ agentId: "AIWDA-08", rating: 5 }).rating);
  advance(1);
  assert.deepEqual(ratings.due(), ["AISA-02"]);
  assert.deepEqual(ratings.due(), []);
  // Ricaricare l'agente non riparte da zero né ripete il promemoria.
  ratings.loaded("AISA-02");
  advance(REMINDER_AFTER_MS);
  assert.deepEqual(ratings.due(), []);
});

test("anteprima: campi, avviso con l'informativa, codice e istruzione di chiedere il sì", () => {
  const { ratings } = setup();
  const { code, rating } = ratings.draft({ agentId: "AISA-02", rating: 4 });
  const text = previewText("AISA-02 · ALTAIR — Senior Software Architect, reparto AISA (AI Software)", code, rating);
  assert.match(text, /voto: 4\/5/);
  assert.match(text, /commento: \(nessuno\)/);
  assert.match(text, /pubblicazione del commento sul sito: no/);
  assert.ok(text.includes(NOTICE));
  assert.match(NOTICE, /note-legali#valutazioni/);
  assert.ok(text.includes(`code "${code}"`));
  assert.match(text, /Solo dopo il suo sì/);
});
