// Difese del pannello locale e giro completo con un client MCP vero: ask_user, risposta dalla pagina, risultato al client.
// Il browser non si apre: il server gira con un PATH vuoto, quindi open/xdg-open non si trovano (errore ignorato).
import assert from "node:assert/strict";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { createServer, request } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { after, test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { VERSION } from "./prompt.ts";
import { keepActivity, parseAnswer, parseRate, startPanel, type RateInput } from "./panel.ts";

const root = realpathSync(mkdtempSync(join(tmpdir(), "agentrica-panel-")));
const repo = realpathSync(join(import.meta.dirname, "..", "..", ".."));
after(() => rmSync(root, { recursive: true, force: true }));

interface Reply {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}

/** Richiesta HTTP con header liberi (fetch non lascia cambiare Host). */
function call(url: string, options: { method?: string; headers?: Record<string, string>; body?: string } = {}): Promise<Reply> {
  return new Promise((resolve, reject) => {
    const req = request(url, { method: options.method ?? "GET", headers: options.headers }, (res) => {
      let body = "";
      res.on("data", (chunk: Buffer) => (body += chunk.toString()));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }));
    });
    req.on("error", reject);
    req.end(options.body);
  });
}

/** Apre la sessione con il token e restituisce il cookie. */
async function login(url: string): Promise<string> {
  const reply = await call(url);
  assert.equal(reply.status, 303);
  const setCookie = reply.headers["set-cookie"]![0]!;
  assert.match(setCookie, /HttpOnly; SameSite=Strict; Path=\//);
  return setCookie.split(";")[0]!;
}

const question = {
  header: "Strada",
  question: "Quale strada?",
  options: [
    { label: "A (Consigliata)", description: "La prima." },
    { label: "B", description: "La seconda." },
  ],
  multiple: false,
};

test("parseAnswer accetta solo etichette della domanda, una sola se la scelta è singola", () => {
  assert.deepEqual(parseAnswer(question, { choices: ["B"], note: " ok " }), { choices: ["B"], note: "ok" });
  assert.deepEqual(parseAnswer(question, { choices: [], note: "Nessuna delle due" }), { choices: [], note: "Nessuna delle due" });
  assert.equal(parseAnswer(question, { choices: ["C"] }), null);
  assert.equal(parseAnswer(question, { choices: ["A (Consigliata)", "B"] }), null);
  assert.equal(parseAnswer(question, { choices: [] }), null);
  assert.equal(parseAnswer(question, { choices: "B" }), null);
  assert.equal(parseAnswer(question, { choices: ["B"], note: "x".repeat(2001) }), null);
  assert.deepEqual(parseAnswer({ ...question, multiple: true }, { choices: ["B", "B", "A (Consigliata)"] })?.choices, ["B", "A (Consigliata)"]);
});

test("parseRate: agente usato, voto intero 1–5, commento fino a 1000 caratteri, casella booleana", () => {
  const used = new Set(["AISA-02"]);
  assert.deepEqual(parseRate(used, { agentId: "AISA-02", rating: 5, comment: " ok ", publish: true }), { agentId: "AISA-02", rating: 5, comment: "ok", publish: true });
  assert.deepEqual(parseRate(used, { agentId: "AISA-02", rating: 1 }), { agentId: "AISA-02", rating: 1, comment: "", publish: false });
  for (const body of [
    { agentId: "AISA-03", rating: 3 },
    { agentId: "AISA-02", rating: 0 },
    { agentId: "AISA-02", rating: 6 },
    { agentId: "AISA-02", rating: 2.5 },
    { agentId: "AISA-02", rating: "3" },
    { agentId: "AISA-02", rating: 3, comment: "x".repeat(1001) },
    { agentId: "AISA-02", rating: 3, publish: "sì" },
    null,
  ]) {
    assert.equal(parseRate(used, body), null, JSON.stringify(body));
  }
});

test("valutazioni nel pannello: stato, difese e invio con le valutazioni del server", async () => {
  const sent: RateInput[] = [];
  const shared: string[] = [];
  const rated = new Set<string>();
  const shareRow = { key: "a".repeat(64), day: "2026-11-18", agent: "AISA-02", model: "opus" as const, effort: "medium", input: 1, output: 2, cacheRead: 3, cacheWrite: 4 };
  const panel = await startPanel(root, {
    isRated: (id) => rated.has(id),
    rate: async (input) => {
      sent.push(input);
      rated.add(input.agentId);
      return { ok: true, usageId: "00000000-0000-4000-8000-000000000000" };
    },
    previewShare: async () => ({ code: "0123abcd", payload: { mcpVersion: "0.7.0", rows: [shareRow] }, omitted: 0 }),
    confirmShare: async (code) => {
      shared.push(code);
      return { ok: true, rows: 1 };
    },
  });
  const base = new URL(panel.url).origin;
  try {
    const cookie = await login(panel.url);
    const state = async () => JSON.parse((await call(`${base}/api/state`, { headers: { Cookie: cookie } })).body);
    panel.record({ id: "AISA-02", codeName: "AISA-02 · ALTAIR", role: "Senior Software Architect", department: "AISA", task: "" });
    assert.match((await state()).rating.notice, /note-legali#valutazioni/);
    assert.deepEqual((await state()).rating.rated, []);
    const json = { Cookie: cookie, Origin: base, "Content-Type": "application/json" };
    const rate = (headers: Record<string, string>, body: unknown) => call(`${base}/api/rate`, { method: "POST", headers, body: JSON.stringify(body) });
    const good = { agentId: "AISA-02", rating: 4, comment: "Chiaro", publish: false };
    assert.equal((await rate({ ...json, Origin: "http://evil.example" }, good)).status, 403);
    assert.equal((await rate({ ...json, "Content-Type": "text/plain" }, good)).status, 415);
    assert.equal((await rate(json, { ...good, agentId: "AISA-03" })).status, 400, "agente non usato");
    assert.equal(sent.length, 0);
    const ok = await rate(json, good);
    assert.equal(ok.status, 200);
    assert.equal(JSON.parse(ok.body).usageId, "00000000-0000-4000-8000-000000000000");
    assert.deepEqual(sent, [good]);
    assert.deepEqual((await state()).rating.rated, ["AISA-02"]);

    // Totali di token (F27): l'anteprima dà righe e codice, la conferma manda solo il codice.
    const share = (path: string, headers: Record<string, string>, body: unknown) => call(`${base}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
    assert.equal((await share("/api/share/preview", { ...json, Origin: "http://evil.example" }, {})).status, 403);
    const preview = JSON.parse((await share("/api/share/preview", json, {})).body);
    assert.deepEqual(preview.rows, [shareRow]);
    assert.equal(preview.code, "0123abcd");
    assert.match(preview.notice, /note-legali#consumo/);
    assert.equal((await share("/api/share", json, { code: "<script>" })).status, 400);
    assert.equal(shared.length, 0);
    assert.equal((await share("/api/share", json, { code: "0123abcd" })).status, 200);
    assert.deepEqual(shared, ["0123abcd"]);
  } finally {
    await panel.close();
  }
  const without = await startPanel(root);
  try {
    const cookie = await login(without.url);
    const origin = new URL(without.url).origin;
    const empty = JSON.parse((await call(`${origin}/api/state`, { headers: { Cookie: cookie } })).body);
    assert.equal(empty.rating, null);
    assert.equal(empty.update, null);
    const headers = { Cookie: cookie, Origin: origin, "Content-Type": "application/json" };
    assert.equal((await call(`${origin}/api/rate`, { method: "POST", headers, body: "{}" })).status, 404, "senza valutazioni la rotta non c'è");
    assert.equal((await call(`${origin}/api/share/preview`, { method: "POST", headers, body: "{}" })).status, 404, "né quella dei totali");
  } finally {
    await without.close();
  }
});

test("avviso di versione nuova nello stato, per il banner (F23)", async () => {
  const panel = await startPanel(root, undefined, () => "È uscita la versione 9.9.9 di Agentrica.");
  try {
    const cookie = await login(panel.url);
    const state = JSON.parse((await call(`${new URL(panel.url).origin}/api/state`, { headers: { Cookie: cookie } })).body);
    assert.equal(state.update, "È uscita la versione 9.9.9 di Agentrica.");
  } finally {
    await panel.close();
  }
});

test("difese: token, cookie, Host, Origin, tipo e dimensione del corpo", async () => {
  const panel = await startPanel(root);
  const base = new URL(panel.url).origin;
  try {
    assert.equal(new URL(panel.url).hostname, "127.0.0.1");
    assert.equal((await call(`${base}/`)).status, 403, "senza cookie");
    assert.equal((await call(`${base}/?t=sbagliato`)).status, 403, "token sbagliato");
    assert.equal((await call(panel.url, { headers: { Host: "evil.example" } })).status, 421, "DNS rebinding");
    assert.equal((await call(panel.url, { headers: { Host: "localhost" } })).status, 421);

    const cookie = await login(panel.url);
    const page = await call(`${base}/`, { headers: { Cookie: cookie } });
    assert.equal(page.status, 200);
    assert.match(String(page.headers["content-security-policy"]), /default-src 'self'.*frame-ancestors 'none'/);
    assert.equal(page.headers["x-content-type-options"], "nosniff");
    assert.match(page.body, /<html lang="it">/);
    assert.equal((await call(`${base}/../server.ts`, { headers: { Cookie: cookie } })).status, 404);
    assert.equal((await call(`${base}/%2e%2e/package.json`, { headers: { Cookie: cookie } })).status, 404);
    assert.equal((await call(`${base}/api/state`, { headers: { Cookie: "agentrica_panel_1=x" } })).status, 403);

    const state = JSON.parse((await call(`${base}/api/state`, { headers: { Cookie: cookie } })).body);
    assert.equal(state.project.name, basename(root));
    assert.match(state.project.problems[0], /Non trovo plan\/README\.md/);
    // Consumo (F24): stesso cookie delle altre rotte; un progetto senza file di Claude Code dà zero risposte.
    assert.equal((await call(`${base}/api/usage`, { headers: { Cookie: "agentrica_panel_1=x" } })).status, 403);
    const usage = JSON.parse((await call(`${base}/api/usage`, { headers: { Cookie: cookie } })).body);
    assert.equal(usage.total.requests, 0);
    assert.equal(usage.prices.date, "2026-11-03");

    const json = { Cookie: cookie, Origin: base, "Content-Type": "application/json" };
    const post = (headers: Record<string, string>, body = "{}") => call(`${base}/api/answer`, { method: "POST", headers, body });
    assert.equal((await post({ ...json, Origin: "http://evil.example" })).status, 403, "altro sito");
    assert.equal((await post({ Cookie: cookie, "Content-Type": "application/json" })).status, 403, "senza Origin");
    assert.equal((await post({ ...json, "Content-Type": "text/plain" })).status, 415, "form da un altro sito");
    assert.equal((await post({ ...json, Cookie: "x=y" })).status, 403);
    assert.equal((await post(json, JSON.stringify({ id: "nessuna" }))).status, 404);
    assert.equal((await post(json, "x".repeat(20_000)).catch(() => ({ status: 400 }))).status, 400, "corpo troppo grande");

    const controller = new AbortController();
    const answered = panel.ask(question, controller.signal);
    const waiting = JSON.parse((await call(`${base}/api/state`, { headers: { Cookie: cookie } })).body).questions;
    assert.equal(waiting.length, 1);
    assert.equal((await post(json, JSON.stringify({ id: waiting[0].id, choices: ["C"] }))).status, 400);
    assert.equal((await post(json, JSON.stringify({ id: waiting[0].id, choices: ["B"], note: "va bene" }))).status, 204);
    assert.deepEqual(await answered, { choices: ["B"], note: "va bene" });
    assert.equal((await post(json, JSON.stringify({ id: waiting[0].id, choices: ["B"] }))).status, 404, "una risposta sola");

    const dropped = panel.ask(question, controller.signal);
    controller.abort();
    await assert.rejects(dropped);
    assert.deepEqual(JSON.parse((await call(`${base}/api/state`, { headers: { Cookie: cookie } })).body).questions, []);
  } finally {
    await panel.close();
  }
});

test("con --panel: open_panel, ask_user con risposta dalla pagina, agenti in uso e voto fino all'endpoint", async () => {
  // Endpoint finto delle valutazioni: riceve ciò che il server invierebbe al sito.
  const received: Record<string, unknown>[] = [];
  const endpoint = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk: Buffer) => (body += chunk.toString()));
    req.on("end", () => {
      received.push(JSON.parse(body));
      res.writeHead(201).end();
    });
  });
  await new Promise<void>((resolve) => endpoint.listen(0, "127.0.0.1", resolve));
  const ratingsUrl = `http://127.0.0.1:${(endpoint.address() as AddressInfo).port}/api/ratings`;
  const client = new Client({ name: "test", version: "0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [join(import.meta.dirname, "server.ts"), "--panel", "--agents", "aisa", "--no-update-check"],
      cwd: repo,
      // HOME senza configurazione salvata (F29): conta solo ciò che dicono i flag, la cartella personale vera resta fuori.
      env: { PATH: root, HOME: root, USERPROFILE: root, AGENTRICA_RATINGS_URL: ratingsUrl },
      stderr: "pipe",
    }),
  );
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name).sort(), ["agente", "ask_user", "elenca_agenti", "library", "open_panel", "rate_agent", "share_usage", "submit_project"]);
    const opened = await client.callTool({ name: "open_panel" });
    const url = /(http:\/\/127\.0\.0\.1:\d+\/\?t=[0-9a-f]{64})/.exec((opened.content as { text: string }[])[0]!.text)![1]!;
    const base = new URL(url).origin;
    const cookie = await login(url);
    await client.getPrompt({ name: "aisa-02-software", arguments: { compito: "Rivedi   i confini\ndel modulo." } });

    const result = client.callTool({ name: "ask_user", arguments: question });
    let state: { questions: { id: string }[]; activity: { id: string; task: string; department: string }[]; project: { problems: string[] } };
    do {
      state = JSON.parse((await call(`${base}/api/state`, { headers: { Cookie: cookie } })).body);
    } while (state.questions.length === 0);
    assert.deepEqual(state.project.problems, [], "il piano di questo repository si legge");
    assert.deepEqual(state.activity.map((a) => [a.id, a.department, a.task]), [["AISA-02", "AISA · Software", "Rivedi i confini del modulo."]]);

    const headers = { Cookie: cookie, Origin: base, "Content-Type": "application/json" };
    const body = JSON.stringify({ id: state.questions[0]!.id, choices: ["A (Consigliata)"], note: "procedi" });
    assert.equal((await call(`${base}/api/answer`, { method: "POST", headers, body })).status, 204);
    assert.equal(
      ((await result).content as { text: string }[])[0]!.text,
      "L'utente ha scelto: A (Consigliata).\nNota dell'utente: procedi",
    );

    const vote = JSON.stringify({ agentId: "AISA-02", rating: 5, comment: "Ottimo", publish: true });
    const voted = await call(`${base}/api/rate`, { method: "POST", headers, body: vote });
    assert.equal(voted.status, 200);
    const { usageId } = JSON.parse(voted.body);
    assert.deepEqual(received, [{ usageId, agentId: "AISA-02", rating: 5, comment: "Ottimo", publish: true, mcpVersion: VERSION }]);
    const again = await client.callTool({ name: "rate_agent", arguments: { id: "aisa-02", rating: 1 } });
    assert.equal(again.isError, true, "già valutato dal pannello");
  } finally {
    await client.close();
    endpoint.close();
  }
});

test("keepActivity: le ultime chiamate più l'ultima di ogni agente uscito, così resta valutabile (F30-09)", () => {
  const calls = (ids: string[]) => ids.map((id, n) => ({ id, n }));
  // Dalla più recente: tre chiamate di AISA-02, poi AIWDA-08 e AICA-04 più vecchie, con max 3.
  const list = calls(["AISA-02", "AISA-02", "AISA-02", "AIWDA-08", "AISA-02", "AICA-04", "AIWDA-08"]);
  assert.deepEqual(keepActivity(list, 3).map((a) => a.n), [0, 1, 2, 3, 5]);
  assert.deepEqual(keepActivity(calls(["A", "B"]), 3).map((a) => a.id), ["A", "B"]);
  const many = calls(Array.from({ length: 40 }, () => "AISA-02"));
  assert.equal(keepActivity(many).length, 20);
});
