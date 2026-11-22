// F29: configurazione salvata (config.ts) e comandi valuta e configura, con un client MCP vero. Ogni server gira con
// una cartella personale finta (HOME, USERPROFILE): la configurazione vera dell'utente non si legge e non si tocca.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ElicitRequestSchema, type ElicitResult } from "@modelcontextprotocol/sdk/types.js";
import { configForm, configPath, DEFAULTS, parseConfig, parseConfigForm, readConfig, writeConfig } from "./config.ts";

const root = mkdtempSync(join(tmpdir(), "agentrica-config-"));
const clients: Client[] = [];
after(async () => {
  for (const c of clients) await c.close();
  rmSync(root, { recursive: true, force: true });
});

let homes = 0;
const newHome = () => {
  const home = join(root, `home-${++homes}`);
  mkdirSync(home);
  return home;
};

type Form = { message: string; requestedSchema: { properties: Record<string, { default?: unknown }> } };

// Una persona che chiude il modulo ci mette più di 300 ms (UNSEEN_MS in server.ts): `instant` simula invece un client
// che dichiara i moduli e li chiude senza mostrarli, come l'estensione VS Code (prova F29-07).
const human = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

async function start(home: string, args: string[] = [], forms?: (params: Form) => ElicitResult, instant = false) {
  const client = new Client({ name: "test-config", version: "0" }, forms ? { capabilities: { elicitation: { form: {} } } } : {});
  if (forms) {
    client.setRequestHandler(ElicitRequestSchema, async (request) => {
      const answer = forms(request.params as Form);
      if (answer.action !== "accept" && !instant) await human();
      return answer;
    });
  }
  let stderr = "";
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(import.meta.dirname, "server.ts"), "--lang", "it", "--no-update-check", ...args],
    cwd: root,
    env: { ...process.env, HOME: home, USERPROFILE: home } as Record<string, string>,
    stderr: "pipe",
  });
  transport.stderr?.on("data", (chunk: Buffer) => (stderr += chunk.toString()));
  await client.connect(transport);
  clients.push(client);
  return { client, stderr: () => stderr };
}

const texts = (result: Record<string, unknown>) => (result.content as { text: string }[]).map((c) => c.text);
const promptText = (result: { messages: { content: unknown }[] }) => (result.messages[0]!.content as { text: string }).text;
const agentPrompts = async (client: Client) => (await client.listPrompts()).prompts.filter((p) => /^ai[a-z]+-\d{2}-/.test(p.name)).length;

test("parseConfig: solo version 1, chiavi note e tipi giusti", () => {
  assert.deepEqual(parseConfig('{"version":1}'), DEFAULTS);
  assert.deepEqual(parseConfig('{"version":1,"agents":"aisa","panel":true}'), { ...DEFAULTS, agents: "aisa", panel: true });
  for (const raw of ["", "[]", "null", '{"version":2}', '{"agents":"aisa"}', '{"version":1,"panel":"sì"}', '{"version":1,"extra":1}', `{"version":1,"agents":"${"a".repeat(501)}"}`]) {
    assert.equal(parseConfig(raw), undefined, raw);
  }
  assert.equal(parseConfig(`{"version":1,"agents":"${" ".repeat(5000)}"}`), undefined, "oltre 4 KB");
});

test("writeConfig: cartella e file solo per l'utente, nessun file temporaneo lasciato; readConfig lo rilegge", () => {
  const path = configPath(newHome());
  assert.deepEqual(readConfig(path), { missing: true });
  writeConfig(path, { ...DEFAULTS, agents: "aisa" });
  assert.deepEqual(readConfig(path), { config: { ...DEFAULTS, agents: "aisa" } });
  assert.deepEqual(readdirSync(join(path, "..")), ["config.json"]);
  if (process.platform !== "win32") {
    assert.equal(statSync(path).mode & 0o777, 0o600);
    assert.equal(statSync(join(path, "..")).mode & 0o777, 0o700);
  }
  writeFileSync(path, "{rotto");
  assert.deepEqual(readConfig(path), { invalid: "formato non valido" });
});

test("configForm toglie i campi fissati dai flag; parseConfigForm rifiuta i tipi sbagliati", () => {
  assert.deepEqual(Object.keys(configForm(DEFAULTS, new Set()).properties), ["lang", "agents", "panel", "ratings", "updateCheck"]);
  assert.deepEqual(Object.keys(configForm(DEFAULTS, new Set(["lang", "agents", "panel"])).properties), ["ratings", "updateCheck"]);
  assert.deepEqual(parseConfigForm(DEFAULTS, { agents: " aisa ", ratings: false }), { ...DEFAULTS, agents: "aisa", ratings: false });
  assert.equal(parseConfigForm(DEFAULTS, { panel: "true" }), undefined);
});

test("primo modulo: compare una volta, salva le scelte, la sessione dopo le usa e non lo mostra più", async () => {
  const home = newHome();
  const shown: Form[] = [];
  const first = await start(home, [], (form) => {
    shown.push(form);
    return { action: "accept", content: { agents: "aisa", panel: false, ratings: true, updateCheck: false } };
  });
  const list = await first.client.callTool({ name: "list_agents", arguments: {} });
  assert.equal(shown.length, 1);
  assert.match(shown[0]!.message, /^Configura Agentrica\. .*~\/\.agentrica\/config\.json.*prossima sessione\. Ad Agentrica non arriva nulla\./);
  assert.match(texts(list).at(-1)!, /salvata in ~\/\.agentrica\/config\.json: vale dalla prossima sessione/);
  await first.client.callTool({ name: "agent", arguments: { id: "AISA-02" } });
  assert.equal(shown.length, 1, "una volta per sessione");
  assert.equal(await agentPrompts(first.client), 56, "nella stessa sessione non cambia nulla");
  assert.deepEqual(JSON.parse(readFileSync(configPath(home), "utf8")), { version: 1, lang: "", agents: "aisa", panel: false, ratings: true, updateCheck: false });

  const second = await start(home, [], (form) => {
    shown.push(form);
    return { action: "cancel" };
  });
  assert.equal(await agentPrompts(second.client), 12, "la squadra salvata");
  await second.client.callTool({ name: "list_agents", arguments: {} });
  assert.equal(shown.length, 1, "con il file il modulo non ricompare");

  const flagged = await start(home, ["--agents", "aiwda"]);
  assert.equal(await agentPrompts(flagged.client), 10, "il flag vince sul file");
});

test("primo modulo chiuso: salva i predefiniti e non ricompare; senza moduli nessun file", async () => {
  const home = newHome();
  const { client } = await start(home, [], () => ({ action: "cancel" }));
  const result = await client.callTool({ name: "agent", arguments: { id: "AISA-02" } });
  assert.match(texts(result).join("\n"), /salvati i valori predefiniti/);
  assert.deepEqual(readConfig(configPath(home)), { config: DEFAULTS });

  const plain = newHome();
  const noForms = await start(plain);
  await noForms.client.callTool({ name: "list_agents", arguments: {} });
  assert.deepEqual(readdirSync(plain), []);
});

test("moduli chiusi dal client senza mostrarli (VS Code): niente file, poi i flussi senza moduli", async () => {
  const home = newHome();
  let shown = 0;
  const { client } = await start(home, [], () => (shown++, { action: "cancel" }), true);
  const first = await client.callTool({ name: "agent", arguments: { id: "AISA-02" } });
  assert.equal(shown, 1);
  assert.deepEqual(readdirSync(home), [], "nessun predefinito salvato senza che l'utente veda il modulo");
  assert.match(texts(first)[0]!, /rate_agent, id AISA-02/, "il testo dell'agente torna a proporre rate_agent");
  assert.match(promptText(await client.getPrompt({ name: "rate" })), /Chiedigli il voto.*rate_agent con id AISA-02/);
  assert.match(promptText(await client.getPrompt({ name: "configure" })), /non mostra i moduli/);
  assert.equal(shown, 1, "dopo il primo, nessun altro modulo nella sessione");
});

test("squadra non valida nel modulo: niente file; file non valido: ignorato con una riga su stderr e riscritto", async () => {
  const home = newHome();
  const { client } = await start(home, [], () => ({ action: "accept", content: { agents: "aisa,xyz" } }));
  const result = await client.callTool({ name: "list_agents", arguments: {} });
  assert.match(texts(result).at(-1)!, /^Configurazione non salvata: agente o reparto sconosciuto nella squadra: "xyz"/);
  assert.deepEqual(readdirSync(home), []);

  mkdirSync(join(home, ".agentrica"));
  writeFileSync(configPath(home), JSON.stringify({ version: 1, agents: "xyz" }));
  const shown: Form[] = [];
  const again = await start(home, ["--panel"], (form) => {
    shown.push(form);
    return { action: "accept", content: {} };
  });
  assert.equal(await agentPrompts(again.client), 56);
  await again.client.callTool({ name: "list_agents", arguments: {} });
  assert.match(again.stderr(), /^agentrica: ~\/\.agentrica\/config\.json ignorato \(squadra non valida\)\n/);
  assert.ok(!again.stderr().includes("xyz"), "senza il contenuto del file");
  assert.deepEqual(Object.keys(shown[0]!.requestedSchema.properties), ["agents", "ratings"], "--panel e --no-update-check non compaiono nel modulo");
  assert.deepEqual(readConfig(configPath(home)), { config: DEFAULTS });
});

test("configura: il modulo con i valori salvati; chiuso non cambia nulla; senza moduli le istruzioni per il file", async () => {
  const home = newHome();
  mkdirSync(join(home, ".agentrica"));
  writeFileSync(configPath(home), JSON.stringify({ version: 1, panel: false, ratings: false }));
  let answer: ElicitResult = { action: "cancel" };
  const shown: Form[] = [];
  const { client } = await start(home, ["--no-ratings"], (form) => {
    shown.push(form);
    return answer;
  });
  const closed = await client.getPrompt({ name: "configure" });
  assert.match(promptText(closed), /chiuso il modulo della configurazione: non cambia nulla/);
  assert.equal(shown[0]!.requestedSchema.properties.agents?.default, "");
  assert.equal(shown[0]!.requestedSchema.properties.panel?.default, false, "il valore salvato, non il predefinito");
  assert.ok(!("ratings" in shown[0]!.requestedSchema.properties), "fissato da --no-ratings");
  answer = { action: "accept", content: { panel: true } };
  assert.match(promptText(await client.getPrompt({ name: "configure" })), /salvata/);
  assert.deepEqual(readConfig(configPath(home)), { config: { ...DEFAULTS, ratings: false } });
  await client.callTool({ name: "list_agents", arguments: {} });
  assert.equal(shown.length, 2, "dopo configura il primo modulo non compare");

  const plain = await start(newHome());
  assert.match(promptText(await plain.client.getPrompt({ name: "configure" })), /non mostra i moduli\. Configurazione attuale: \{"version":1,"lang":"","agents":"","panel":true,"ratings":true,"updateCheck":true\}/);
});

test("valuta: il modulo per l'ultimo agente o per quello indicato; senza moduli rate_agent; errori chiari", async () => {
  const home = newHome();
  writeConfig(configPath(home), DEFAULTS);
  const shown: Form[] = [];
  const { client } = await start(home, [], (form) => {
    shown.push(form);
    return { action: "decline" };
  });
  assert.match(promptText(await client.getPrompt({ name: "rate" })), /non ne è stato usato nessuno/);
  await client.callTool({ name: "agent", arguments: { id: "AISA-02" } });
  assert.match(promptText(await client.getPrompt({ name: "rate" })), /chiuso il modulo di valutazione di AISA-02 · ALTAIR/);
  assert.match(shown[0]!.message, /^Valuta AISA-02 · ALTAIR/);
  await client.getPrompt({ name: "rate", arguments: { agent: "aiwda-03" } });
  assert.match(shown[1]!.message, /^Valuta AIWDA-03 /, "anche un agente non caricato");
  await client.getPrompt({ name: "rate", arguments: { agent: "AISA-02" } });
  assert.equal(shown.length, 3, "su richiesta anche dopo un modulo già chiuso");
  assert.match(promptText(await client.getPrompt({ name: "rate", arguments: { agent: "AISA-99" } })), /non è fra gli agenti/);

  const plain = await start(newHome());
  await plain.client.callTool({ name: "agent", arguments: { id: "AICA-03" } });
  assert.match(promptText(await plain.client.getPrompt({ name: "rate" })), /Chiedigli il voto.*rate_agent con id AICA-03/);
});
