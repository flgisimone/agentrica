// F29-08: proposta di un progetto dal server MCP. Validazione, invio e ritiro con fetch finto; poi il comando progetto e
// submit_project con un client MCP vero e l'endpoint finto su 127.0.0.1.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ElicitRequestSchema, type ElicitResult } from "@modelcontextprotocol/sdk/types.js";
import { createShowcase, DEFAULT_AUTHOR, httpsUrl, parseProjectFields, type ProjectFields } from "./showcase.ts";

const known = { departments: new Set(["AISA", "AIWDA"]), agents: new Set(["AISA-02", "AIWDA-08"]) };
const valid = { name: "Orto", url: "https://codeberg.org/ada/orto", description: "Un diario dell'orto, fatto con gli agenti software.", departments: "aisa, aiwda", consent: true, license: true };

test("httpsUrl: solo https con un dominio, senza porta né credenziali, al più 200 caratteri", () => {
  assert.equal(httpsUrl("https://ada.example/orto/"), "https://ada.example/orto");
  assert.equal(httpsUrl(" https://gitlab.com/ada/orto "), "https://gitlab.com/ada/orto");
  for (const bad of ["http://ada.example", "https://ada@ada.example", "https://ada.example:8443", "https://localhost/x", "javascript:alert(1)", "https://ada.example/a b", `https://ada.example/${"a".repeat(200)}`, 3]) {
    assert.equal(httpsUrl(bad), null, String(bad));
  }
});

test("parseProjectFields: consenso e licenza obbligatori, testi semplici, reparti e agenti del catalogo", () => {
  assert.deepEqual(parseProjectFields(valid, known), {
    name: "Orto",
    url: "https://codeberg.org/ada/orto",
    description: "Un diario dell'orto, fatto con gli agenti software.",
    departments: ["AISA", "AIWDA"],
    agents: [],
    author: DEFAULT_AUTHOR,
    consent: true,
    license: true,
  });
  assert.deepEqual((parseProjectFields({ ...valid, agents: "aisa-02 AIWDA-08", author: " Ada " }, known) as ProjectFields).agents, ["AISA-02", "AIWDA-08"]);
  assert.equal((parseProjectFields({ ...valid, author: " Ada " }, known) as ProjectFields).author, "Ada");
  const reasons: [Record<string, unknown>, RegExp][] = [
    [{ ...valid, consent: false }, /consenso/],
    [{ ...valid, license: undefined }, /licenza/],
    [{ ...valid, name: "<b>Orto</b>" }, /nome/],
    [{ ...valid, description: "Vedi www.orto.example" }, /descrizione/],
    [{ ...valid, description: "x".repeat(281) }, /descrizione/],
    [{ ...valid, url: "http://orto.example" }, /https/],
    [{ ...valid, departments: "" }, /reparti/],
    [{ ...valid, departments: "AICA" }, /reparti/],
    [{ ...valid, agents: "AISA-99" }, /agenti/],
    [{ ...valid, author: "ada.dev" }, /nome da mostrare/],
  ];
  for (const [input, reason] of reasons) assert.match(parseProjectFields(input, known) as string, reason, JSON.stringify(input));
});

test("invio: l'anteprima con codice parte una volta, esattamente; errori chiari; il ritiro manda solo il codice", async () => {
  const calls: { url: string; body: unknown }[] = [];
  let status = 201;
  const fakeFetch = (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: String(url), body: JSON.parse(String(init?.body)) });
    return new Response(null, { status });
  }) as typeof fetch;
  const showcase = createShowcase({ version: "9.9.9", url: "https://example.test/api/projects", fetch: fakeFetch });
  const fields = parseProjectFields(valid, known) as ProjectFields;
  const draft = showcase.draft(fields);
  assert.match(draft.payload.code, /^[0-9a-f-]{36}$/);
  const sent = await showcase.confirm(draft.code);
  assert.deepEqual(sent, { ok: true, code: draft.payload.code, name: "Orto" });
  assert.deepEqual(calls[0], { url: "https://example.test/api/projects", body: { ...fields, code: draft.payload.code, mcpVersion: "9.9.9" } });
  assert.match((await showcase.confirm(draft.code) as { message: string }).message, /scaduto o già usato/);
  status = 429;
  assert.match((await showcase.send(showcase.build(fields)) as { message: string }).message, /Limite/);
  status = 200;
  assert.deepEqual(await showcase.withdraw(draft.payload.code), { ok: true, message: "Richiesta di ritiro registrata." });
  assert.deepEqual(calls.at(-1), { url: "https://example.test/api/projects/withdraw", body: { code: draft.payload.code } });
  const offline = createShowcase({ version: "9.9.9", fetch: (async () => { throw new Error("rete"); }) as typeof fetch });
  assert.match((await offline.send(offline.build(fields)) as { message: string }).message, /non è raggiungibile/);
});

// --- Con il server vero ---

const root = mkdtempSync(join(tmpdir(), "agentrica-progetti-"));
const servers: Server[] = [];
const clients: Client[] = [];
after(async () => {
  for (const c of clients) await c.close();
  for (const s of servers) s.close();
  rmSync(root, { recursive: true, force: true });
});
// Configurazione già salvata: niente modulo della prima chiamata.
mkdirSync(join(root, ".agentrica"));
writeFileSync(join(root, ".agentrica", "config.json"), JSON.stringify({ version: 1 }));

async function endpoint() {
  const requests: { path: string; body: Record<string, unknown> }[] = [];
  const server = createServer((req, res) => {
    let data = "";
    req.on("data", (chunk: Buffer) => (data += chunk.toString()));
    req.on("end", () => {
      requests.push({ path: req.url ?? "", body: JSON.parse(data) });
      res.writeHead(201).end();
    });
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/projects`, requests };
}

async function start(url: string, forms?: () => ElicitResult) {
  const client = new Client({ name: "test-progetti", version: "0" }, forms ? { capabilities: { elicitation: { form: {} } } } : {});
  // Una persona chiude il modulo in più di 300 ms: più in fretta vale come non mostrato (server.ts, UNSEEN_MS).
  if (forms) {
    client.setRequestHandler(ElicitRequestSchema, async () => {
      const answer = forms();
      if (answer.action !== "accept") await new Promise((resolve) => setTimeout(resolve, 350));
      return answer;
    });
  }
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [join(import.meta.dirname, "server.ts"), "--no-update-check"],
      cwd: root,
      env: { ...process.env, HOME: root, USERPROFILE: root, AGENTRICA_PROJECTS_URL: url } as Record<string, string>,
      stderr: "pipe",
    }),
  );
  clients.push(client);
  return client;
}
const said = (result: { messages: { content: unknown }[] }) => (result.messages[0]!.content as { text: string }).text;
const text = (result: Record<string, unknown>) => (result.content as { text: string }[])[0]!.text;

test("progetto: il modulo inviato parte con la versione e dà il codice; chiuso o non valido non parte nulla; rimuovi", async () => {
  const site = await endpoint();
  let answer: ElicitResult = { action: "accept", content: { ...valid, agents: "AISA-02" } };
  const client = await start(site.url, () => answer);
  const sent = said(await client.getPrompt({ name: "progetto" }));
  const code = sent.match(/Codice della proposta: ([0-9a-f-]{36})\./)?.[1];
  assert.ok(code, sent);
  assert.equal(site.requests.length, 1);
  assert.equal(site.requests[0]!.path, "/api/projects");
  assert.deepEqual(Object.keys(site.requests[0]!.body).sort(), ["agents", "author", "code", "consent", "departments", "description", "license", "mcpVersion", "name", "url"]);
  answer = { action: "accept", content: { ...valid, consent: false } };
  assert.match(said(await client.getPrompt({ name: "progetto" })), /non è partita: servono il consenso e la licenza/);
  answer = { action: "cancel" };
  assert.match(said(await client.getPrompt({ name: "progetto" })), /non parte nulla/);
  assert.equal(site.requests.length, 1);
  assert.match(said(await client.getPrompt({ name: "progetto", arguments: { rimuovi: code! } })), /Richiesta di ritiro registrata/);
  assert.deepEqual(site.requests[1], { path: "/api/projects/withdraw", body: { code } });
  assert.match(said(await client.getPrompt({ name: "progetto", arguments: { rimuovi: "123" } })), /formato giusto/);
  assert.equal(site.requests.length, 2);
});

test("senza moduli: progetto rimanda a submit_project, che invia solo con il codice dell'anteprima", async () => {
  const site = await endpoint();
  const client = await start(site.url);
  assert.match(said(await client.getPrompt({ name: "progetto" })), /usa submit_project/);
  const preview = await client.callTool({ name: "submit_project", arguments: valid });
  assert.match(text(preview), /^Anteprima della proposta del progetto:\n- nome: Orto\n- link: https:\/\/codeberg\.org\/ada\/orto\n/);
  assert.equal(site.requests.length, 0);
  const code = text(preview).match(/code "([0-9a-f]{8})"/)![1]!;
  assert.match(text(await client.callTool({ name: "submit_project", arguments: { code } })), /Proposta del progetto «Orto» inviata/);
  assert.equal(site.requests.length, 1);
  assert.equal((await client.callTool({ name: "submit_project", arguments: { ...valid, license: false } })).isError, true);
});
