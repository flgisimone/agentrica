// Prova con un client MCP vero: avvia server.ts su stdio da una cartella fuori dal repository, come un progetto dell'utente.
// Il server gira con il permission model di Node in sola lettura del clone, come consiglia il README: una scrittura,
// una connessione o un processo figlio farebbero fallire le prove. L'ultima prova controlla stderr e la cartella.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const cwd = mkdtempSync(join(tmpdir(), "agentrica-mcp-"));
const repo = join(import.meta.dirname, "..", "..", "..");
const client = new Client({ name: "test", version: "0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["--permission", `--allow-fs-read=${repo}`, join(import.meta.dirname, "server.ts"), "--lang", "it"],
  cwd,
  stderr: "pipe",
});
let stderr = "";
transport.stderr?.on("data", (chunk: Buffer) => (stderr += chunk.toString()));

before(async () => {
  await client.connect(transport);
});

after(async () => {
  await client.close();
  rmSync(cwd, { recursive: true, force: true });
});

const text = (result: Record<string, unknown>) => (result.content as { type: string; text: string }[])[0]!.text;

test("56 prompt degli agenti con id in minuscolo e reparto, argomento compito facoltativo, più valuta, progetto e configura", async () => {
  const { prompts } = await client.listPrompts();
  assert.equal(prompts.length, 59);
  assert.deepEqual(prompts.slice(-3).map((p) => p.name), ["rate", "project", "configure"]);
  const altair = prompts.find((p) => p.name === "aisa-02-software");
  assert.equal(altair?.title, "AISA-02 · ALTAIR — Senior Software Architect");
  assert.deepEqual(altair?.arguments?.map((a) => [a.name, a.required ?? false]), [["task", false]]);
});

test("un prompt con compito restituisce il testo dell'agente", async () => {
  const { messages } = await client.getPrompt({ name: "aisa-02-software", arguments: { task: "Rivedi i confini." } });
  assert.equal(messages.length, 1);
  const content = messages[0]!.content as { type: string; text: string };
  assert.match(content.text, /^# AISA-02 · ALTAIR — Senior Software Architect\n/);
  // Il client di prova non ha l'elicitation: in fondo, dopo il compito, c'è l'invito a valutare (F23-03).
  assert.match(content.text, /## Compito\n\nRivedi i confini\.\n\n## Valutazione\n\n.*rate_agent, id AISA-02.*\n$/);
});

test("tre tool in sola lettura; rate_agent, share_usage e submit_project, gli unici che aprono una connessione", async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["agent", "library", "list_agents", "rate_agent", "share_usage", "submit_project"]);
  const sending = ["rate_agent", "share_usage", "submit_project"];
  for (const t of tools.filter((t) => !sending.includes(t.name))) assert.equal(t.annotations?.readOnlyHint, true, t.name);
  for (const name of sending) {
    const tool = tools.find((t) => t.name === name)!;
    assert.equal(tool.annotations?.readOnlyHint, false, name);
    assert.equal(tool.annotations?.openWorldHint, true, name);
  }
  assert.match(client.getInstructions() ?? "", /rate_agent/);
  assert.match(client.getInstructions() ?? "", /share_usage/);
  // F39-04: cosa esce dal computer.
  assert.match(client.getInstructions() ?? "", /I dati restano sul computer: inviano ad Agentrica solo rate_agent, share_usage e submit_project, dopo l'anteprima e il sì dell'utente; fuori va solo, se attivo, il controllo delle versioni nuove sul registro npm\./);
  // F35: formato di plan/ e sessioni per fase anche nei progetti installati con add.
  assert.match(client.getInstructions() ?? "", /plan\/: README\.md con la tabella «## Fasi».+id F0, F1.+«## Backlog» in tabella.+proponi di crearlo leggendo il codice/);
  assert.match(client.getInstructions() ?? "", /Pianificare è una sessione a sé: solo plan\/.+proponi \/clear senza sviluppare\. Una fase per sessione; alla chiusura proponi \/clear/);
});

test("istruzioni del server entro 4096 caratteri in tutte e due le lingue, con pannello e valutazioni (F35-R1)", async () => {
  // Claude Code (2.1.330) tronca le istruzioni di un server stdio a 4096 caratteri, salvo CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH:
  // il numero non è documentato, viene dal codice del client. ponytail: se Claude Code lo cambia, si aggiorna qui.
  const { it } = await import("./texts/it.ts");
  const { en } = await import("./texts/en.ts");
  const o = { agents: 56, departments: 5, codes: "AIBPD, AICA, AIPCA, AISA, AIWDA", example: "aibpd-01-business", exampleId: "AIBPD-01", panel: true, ratings: true };
  for (const texts of [it, en]) assert.ok(texts.server.instructions(o).length <= 4096, texts.locale);
});

test("share_usage: senza file di Claude Code nulla da inviare; un codice sconosciuto è un errore", async () => {
  // Il server non può leggere la cartella di Claude Code (--permission solo sul clone): nessuna riga.
  const preview = await client.callTool({ name: "share_usage", arguments: {} });
  assert.notEqual(preview.isError, true);
  assert.match(text(preview), /non c'è nulla da inviare/);
  const unknown = await client.callTool({ name: "share_usage", arguments: { code: "00000000" } });
  assert.equal(unknown.isError, true);
  assert.match(text(unknown), /scaduto o già usato/);
  assert.equal((await client.callTool({ name: "share_usage", arguments: { code: "NO" } })).isError, true);
});

test("rate_agent: anteprima con codice, poi invio; senza rete un errore chiaro e il lavoro continua", async () => {
  // Il server gira con --permission senza --allow-net: la conferma prova a inviare e la rete viene negata.
  const preview = await client.callTool({ name: "rate_agent", arguments: { id: "aisa-02", rating: 4, comment: "Utile." } });
  assert.notEqual(preview.isError, true);
  assert.match(text(preview), /^Anteprima della valutazione di AISA-02 · ALTAIR — Senior Software Architect, reparto AISA \(AI Software\):/);
  assert.match(text(preview), /commento: Utile\./);
  const code = /code "([0-9a-f]{8})"/.exec(text(preview))![1]!;
  const wrong = await client.callTool({ name: "rate_agent", arguments: { id: "aisa-03", code } });
  assert.equal(wrong.isError, true);
  const sent = await client.callTool({ name: "rate_agent", arguments: { id: "aisa-02", code } });
  assert.equal(sent.isError, true);
  assert.match(text(sent), /non è raggiungibile/);
  const used = await client.callTool({ name: "rate_agent", arguments: { id: "aisa-02", code } });
  assert.match(text(used), /scaduto o già usato/);
  const noVote = await client.callTool({ name: "rate_agent", arguments: { id: "aisa-02" } });
  assert.match(text(noVote), /Serve il voto/);
  for (const rating of [0, 6, 2.5]) {
    const bad = await client.callTool({ name: "rate_agent", arguments: { id: "aisa-02", rating } });
    assert.equal(bad.isError, true, String(rating));
  }
  const long = await client.callTool({ name: "rate_agent", arguments: { id: "aisa-02", rating: 3, comment: "x".repeat(1001) } });
  assert.equal(long.isError, true);
  assert.notEqual((await client.callTool({ name: "agent", arguments: { id: "aisa-02" } })).isError, true);
});

test("--no-ratings: niente rate_agent, share_usage né submit_project, niente proposta di valutazione o di invio", async () => {
  const quiet = new Client({ name: "test-senza-voti", version: "0" });
  await quiet.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: ["--permission", `--allow-fs-read=${repo}`, join(import.meta.dirname, "server.ts"), "--lang", "it", "--no-ratings"],
      cwd,
      stderr: "pipe",
    }),
  );
  try {
    const { tools } = await quiet.listTools();
    assert.deepEqual(tools.map((t) => t.name).sort(), ["agent", "library", "list_agents"]);
    assert.ok(!(quiet.getInstructions() ?? "").includes("rate_agent"));
    assert.ok(!(quiet.getInstructions() ?? "").includes("share_usage"));
    assert.deepEqual((await quiet.listPrompts()).prompts.slice(-1).map((p) => p.name), ["configure"], "senza valutazioni niente valuta né progetto");
    assert.ok(!text(await quiet.callTool({ name: "agent", arguments: { id: "aisa-02" } })).includes("rate_agent"));
  } finally {
    await quiet.close();
  }
});

test("elenca_agenti: tutti o un reparto", async () => {
  const all = text(await client.callTool({ name: "list_agents", arguments: {} }));
  assert.equal(all.match(/^- /gm)?.length, 56);
  const aipca = text(await client.callTool({ name: "list_agents", arguments: { department: "AIPCA" } }));
  assert.equal(aipca.match(/^- /gm)?.length, 10);
  assert.ok(!aipca.includes("AISA-"));
  const wrong = await client.callTool({ name: "list_agents", arguments: { department: "XYZ" } });
  assert.equal(wrong.isError, true);
});

test("agente: id in minuscolo funziona, id sconosciuto dà un errore chiaro", async () => {
  const ok = await client.callTool({ name: "agent", arguments: { id: "aica-01" } });
  assert.notEqual(ok.isError, true);
  assert.match(text(ok), /^# AICA-01 · VEGA — /);
  const missing = await client.callTool({ name: "agent", arguments: { id: "AISA-99" } });
  assert.equal(missing.isError, true);
  assert.match(text(missing), /non trovato/);
  assert.ok(!text(missing).includes("AISA-99"));
  for (const id of ["../../etc", "AIXX-01", "AISA-2", "AISA-02\n", " AISA-02", "AISA-002"]) {
    const malformed = await client.callTool({ name: "agent", arguments: { id } });
    assert.equal(malformed.isError, true, JSON.stringify(id));
    assert.match(text(malformed), /Formato dell'id/);
    // Nessuna eco dell'input (tolto l'esempio del messaggio, che è un id valido).
    assert.ok(!text(malformed).replace("es. AISA-02", "").includes(id.trim()), JSON.stringify(id));
  }
});

test("library: le schede del reparto con fonte e data, mai URL; errori chiari per id sconosciuti", async () => {
  const agent = text(await client.callTool({ name: "agent", arguments: { id: "AICA-03" } }));
  assert.match(agent, /## Biblioteca del reparto\n\n.*tool library \(id AICA-03/);
  assert.match(agent, /^- owasp-top-10-2025 \*: OWASP Top 10:2025 \(2025, \d{4}-\d{2}-\d{2}/m);
  const ok = await client.callTool({ name: "library", arguments: { id: "aica-03", cards: ["owasp-top-10-2025", "cvss-4"] } });
  assert.notEqual(ok.isError, true);
  assert.match(text(ok), /^# OWASP Top 10:2025\n\nFonte: OWASP Top 10 \(livello 1\), versione 2025\. Verificata il /);
  assert.match(text(ok), /\n---\n\n# CVSS v4\.0\n/);
  assert.match(text(ok), /## Nozione\n\n.*## Come si applica\n\n/s);
  assert.ok(!/https?:|www\./.test(text(ok)));
  const other = await client.callTool({ name: "library", arguments: { id: "AISA-02", cards: ["owasp-top-10-2025"] } });
  assert.equal(other.isError, true);
  assert.match(text(other), /Schede non trovate nel reparto AISA: owasp-top-10-2025\. Disponibili: mcp-2026-07-28, /);
  const agentMissing = await client.callTool({ name: "library", arguments: { id: "AISA-99", cards: ["x"] } });
  assert.match(text(agentMissing), /Agente non trovato/);
  for (const cards of [[], ["../fonti"], ["A"], Array(11).fill("cvss-4")]) {
    const bad = await client.callTool({ name: "library", arguments: { id: "AICA-03", cards } });
    assert.equal(bad.isError, true, JSON.stringify(cards));
  }
});

test("compito: fino a 20.000 caratteri, oltre è un errore", async () => {
  const ok = await client.callTool({ name: "agent", arguments: { id: "AISA-02", task: "x".repeat(20_000) } });
  assert.notEqual(ok.isError, true);
  const long = await client.callTool({ name: "agent", arguments: { id: "AISA-02", task: "x".repeat(20_001) } });
  assert.equal(long.isError, true);
  await assert.rejects(client.getPrompt({ name: "aisa-02-software", arguments: { task: "x".repeat(20_001) } }));
});

test("senza agents/ accanto al pacchetto il server non parte: una riga su stderr, codice 1", () => {
  // Stessa struttura del repository (packages/mcp/src) ma senza agents/: il server non deve cercarla altrove.
  const root = mkdtempSync(join(tmpdir(), "agentrica-vuoto-"));
  try {
    const src = join(root, "packages", "mcp", "src");
    mkdirSync(src, { recursive: true });
    for (const file of ["server.ts", "catalog.ts", "config.ts", "prompt.ts", "panel.ts", "project.ts", "ratings.ts", "share.ts", "showcase.ts", "update.ts", "usage.ts"]) copyFileSync(join(import.meta.dirname, file), join(src, file));
    mkdirSync(join(src, "texts"));
    for (const file of ["index.ts", "it.ts", "en.ts"]) copyFileSync(join(import.meta.dirname, "texts", file), join(src, "texts", file));
    const catalogSrc = join(import.meta.dirname, "..", "..", "catalog", "src");
    mkdirSync(join(root, "packages", "catalog", "src"), { recursive: true });
    for (const file of ["index.ts", "departments.ts", "markdown.ts", "library.ts", "content.ts"]) {
      copyFileSync(join(catalogSrc, file), join(root, "packages", "catalog", "src", file));
    }
    // "junction": su Windows un link a una cartella senza permessi di amministratore; altrove si ignora.
    symlinkSync(join(import.meta.dirname, "..", "..", "..", "node_modules"), join(root, "node_modules"), "junction");
    // La cartella corrente è la root del repository, che ha una agents/ valida: il server non deve usarla.
    const run = spawnSync(process.execPath, [join(src, "server.ts"), "--lang", "it"], { cwd: repo, input: "", encoding: "utf8" });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /^agentrica: catalogo non leggibile in .*agents: /);
    assert.equal(run.stderr.trim().split("\n").length, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("--agents: prompt e tool vedono solo la squadra", async () => {
  const squad = new Client({ name: "test-squadra", version: "0" });
  const squadTransport = new StdioClientTransport({
    command: process.execPath,
    args: ["--permission", `--allow-fs-read=${repo}`, join(import.meta.dirname, "server.ts"), "--lang", "it", "--agents", "aiwda,aisa-02"],
    cwd,
    stderr: "pipe",
  });
  await squad.connect(squadTransport);
  try {
    const { prompts } = await squad.listPrompts();
    assert.equal(prompts.length, 14);
    assert.equal(prompts[0]!.name, "aisa-02-software");
    assert.ok(prompts.slice(1, -3).every((p) => /^aiwda-\d{2}-design$/.test(p.name)));
    assert.match(squad.getInstructions() ?? "", /^Agentrica: 11 agenti IA in 2 reparti \(AISA, AIWDA\)\./);
    const list = text(await squad.callTool({ name: "list_agents", arguments: {} }));
    assert.equal(list.match(/^- /gm)?.length, 11);
    const outside = await squad.callTool({ name: "list_agents", arguments: { department: "AICA" } });
    assert.equal(outside.isError, true);
    const missing = await squad.callTool({ name: "agent", arguments: { id: "AISA-03" } });
    assert.equal(missing.isError, true);
    assert.match(text(await squad.callTool({ name: "agent", arguments: { id: "aisa-02" } })), /^# AISA-02 · ALTAIR/);
  } finally {
    await squad.close();
  }
});

test("--agents sbagliato o opzione sconosciuta: il server non parte, una riga su stderr che li nomina", () => {
  const start = (...args: string[]) =>
    spawnSync(process.execPath, [join(import.meta.dirname, "server.ts"), "--lang", "it", ...args], { cwd, input: "", encoding: "utf8" });
  const unknown = start("--agents", "aisa-02,aisa-99");
  assert.equal(unknown.status, 1);
  assert.equal(unknown.stderr, 'agentrica: agente o reparto sconosciuto in --agents: "aisa-99"\n');
  const empty = start("--agents=");
  assert.equal(empty.status, 1);
  assert.match(empty.stderr, /^agentrica: --agents è vuoto/);
  const option = start("--agent", "aisa");
  assert.equal(option.status, 1);
  assert.match(option.stderr, /^agentrica: .*--agent\b/);
  assert.equal(option.stderr.trim().split("\n").length, 1);
  const control = start("--x\n\u001b[31m");
  assert.equal(control.status, 1);
  assert.equal(control.stderr.split("\n").length, 2);
  assert.ok(!control.stderr.includes("\u001b") && control.stderr.includes("\\u001b"));
});

test("--lang en: istruzioni, descrizioni, testo dell'agente e schede in inglese", async () => {
  const english = new Client({ name: "test", version: "0" });
  await english.connect(
    new StdioClientTransport({ command: process.execPath, args: ["--permission", `--allow-fs-read=${repo}`, join(import.meta.dirname, "server.ts"), "--lang", "en"], cwd, stderr: "pipe" }),
  );
  try {
    assert.match(english.getInstructions() ?? "", /^Agentrica: 56 AI agents in 5 departments/);
    const { tools } = await english.listTools();
    assert.match(tools.find((t) => t.name === "list_agents")!.description!, /^Lists the Agentrica agents/);
    const agent = text(await english.callTool({ name: "agent", arguments: { id: "AICA-03", task: "Check the login." } }));
    assert.match(agent, /^# AICA-03 · BETELGEUSE — Senior Application Security Engineer\n\nYou are AICA-03/);
    assert.match(agent, /## Department common rules\n\n.*### Mandatory rules/s);
    assert.match(agent, /## Role: Senior Application Security Engineer\n\n### Mission/);
    assert.match(agent, /## Department library\n/);
    assert.match(agent, /## Task\n\nCheck the login\./);
    assert.doesNotMatch(agent, /[àèéìòù]/);
    const card = text(await english.callTool({ name: "library", arguments: { id: "AICA-03", cards: ["owasp-top-10-2025"] } }));
    assert.match(card, /^# OWASP Top 10:2025\n\nSource: OWASP Top 10 \(level 1\)/);
    assert.match(card, /## Notion\n\n.*## How it applies/s);
  } finally {
    await english.close();
  }
});

// Ultima prova, dopo tutte le chiamate: il server non ha scritto niente su stderr né nella cartella del progetto.
test("pannello acceso di predefinito, ma con il permission model senza rete né processi figli si salta in silenzio", async () => {
  // Il client principale gira con --permission solo in lettura: niente open_panel né ask_user, nessuna riga su stderr
  // (lo controlla la prova finale). Con --panel esplicito, invece, un pannello che non parte ferma il server.
  const { tools } = await client.listTools();
  assert.ok(!tools.some((t) => t.name === "open_panel"));
  const run = spawnSync(process.execPath, ["--permission", `--allow-fs-read=${repo}`, join(import.meta.dirname, "server.ts"), "--lang", "it", "--panel"], { cwd, input: "", encoding: "utf8" });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /^agentrica: pannello non avviato: /);
  const both = spawnSync(process.execPath, [join(import.meta.dirname, "server.ts"), "--lang", "it", "--panel", "--no-panel"], { cwd, input: "", encoding: "utf8" });
  assert.match(both.stderr, /--panel o --no-panel/);
});

test("dopo tutte le chiamate: stderr vuoto, nessun file nella cartella del progetto", () => {
  assert.equal(stderr, "");
  assert.deepEqual(readdirSync(cwd), []);
});

