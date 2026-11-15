// Difese del pannello locale e giro completo con un client MCP vero: ask_user, risposta dalla pagina, risultato al client.
// Il browser non si apre: il server gira con un PATH vuoto, quindi open/xdg-open non si trovano (errore ignorato).
import assert from "node:assert/strict";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { parseAnswer, startPanel } from "./panel.ts";

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
    assert.equal(state.project.name, root.split("/").pop());
    assert.match(state.project.problems[0], /Non trovo plan\/README\.md/);

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

test("con --panel: open_panel, ask_user con risposta dalla pagina e agenti in uso", async () => {
  const client = new Client({ name: "test", version: "0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [join(import.meta.dirname, "server.ts"), "--panel", "--agents", "aisa"],
      cwd: repo,
      env: { PATH: root },
      stderr: "pipe",
    }),
  );
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name).sort(), ["agente", "ask_user", "elenca_agenti", "open_panel"]);
    const opened = await client.callTool({ name: "open_panel" });
    const url = /(http:\/\/127\.0\.0\.1:\d+\/\?t=[0-9a-f]{64})/.exec((opened.content as { text: string }[])[0]!.text)![1]!;
    const base = new URL(url).origin;
    const cookie = await login(url);
    await client.getPrompt({ name: "aisa-02", arguments: { compito: "Rivedi   i confini\ndel modulo." } });

    const result = client.callTool({ name: "ask_user", arguments: question });
    let state: { questions: { id: string }[]; activity: { id: string; task: string }[]; project: { problems: string[] } };
    do {
      state = JSON.parse((await call(`${base}/api/state`, { headers: { Cookie: cookie } })).body);
    } while (state.questions.length === 0);
    assert.deepEqual(state.project.problems, [], "il piano di questo repository si legge");
    assert.deepEqual(state.activity.map((a) => [a.id, a.task]), [["AISA-02", "Rivedi i confini del modulo."]]);

    const headers = { Cookie: cookie, Origin: base, "Content-Type": "application/json" };
    const body = JSON.stringify({ id: state.questions[0]!.id, choices: ["A (Consigliata)"], note: "procedi" });
    assert.equal((await call(`${base}/api/answer`, { method: "POST", headers, body })).status, 204);
    assert.equal(
      ((await result).content as { text: string }[])[0]!.text,
      "L'utente ha scelto: A (Consigliata).\nNota dell'utente: procedi",
    );
  } finally {
    await client.close();
  }
});
