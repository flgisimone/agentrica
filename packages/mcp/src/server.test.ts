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
  args: ["--permission", `--allow-fs-read=${repo}`, join(import.meta.dirname, "server.ts")],
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

test("56 prompt con id in minuscolo e argomento compito facoltativo", async () => {
  const { prompts } = await client.listPrompts();
  assert.equal(prompts.length, 56);
  const altair = prompts.find((p) => p.name === "aisa-02");
  assert.equal(altair?.title, "AISA-02 · ALTAIR — Senior Software Architect");
  assert.deepEqual(altair?.arguments?.map((a) => [a.name, a.required ?? false]), [["compito", false]]);
});

test("un prompt con compito restituisce il testo dell'agente", async () => {
  const { messages } = await client.getPrompt({ name: "aisa-02", arguments: { compito: "Rivedi i confini." } });
  assert.equal(messages.length, 1);
  const content = messages[0]!.content as { type: string; text: string };
  assert.match(content.text, /^# AISA-02 · ALTAIR — Senior Software Architect\n/);
  assert.match(content.text, /## Compito\n\nRivedi i confini\.\n$/);
});

test("due tool in sola lettura", async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["agente", "elenca_agenti"]);
  for (const t of tools) assert.equal(t.annotations?.readOnlyHint, true);
});

test("elenca_agenti: tutti o un reparto", async () => {
  const all = text(await client.callTool({ name: "elenca_agenti", arguments: {} }));
  assert.equal(all.match(/^- /gm)?.length, 56);
  const aipca = text(await client.callTool({ name: "elenca_agenti", arguments: { reparto: "AIPCA" } }));
  assert.equal(aipca.match(/^- /gm)?.length, 10);
  assert.ok(!aipca.includes("AISA-"));
  const wrong = await client.callTool({ name: "elenca_agenti", arguments: { reparto: "XYZ" } });
  assert.equal(wrong.isError, true);
});

test("agente: id in minuscolo funziona, id sconosciuto dà un errore chiaro", async () => {
  const ok = await client.callTool({ name: "agente", arguments: { id: "aica-01" } });
  assert.notEqual(ok.isError, true);
  assert.match(text(ok), /^# AICA-01 · VEGA — /);
  const missing = await client.callTool({ name: "agente", arguments: { id: "AISA-99" } });
  assert.equal(missing.isError, true);
  assert.match(text(missing), /non trovato/);
  assert.ok(!text(missing).includes("AISA-99"));
  for (const id of ["../../etc", "AIXX-01", "AISA-2", "AISA-02\n", " AISA-02", "AISA-002"]) {
    const malformed = await client.callTool({ name: "agente", arguments: { id } });
    assert.equal(malformed.isError, true, JSON.stringify(id));
    assert.match(text(malformed), /Formato dell'id/);
    // Nessuna eco dell'input (tolto l'esempio del messaggio, che è un id valido).
    assert.ok(!text(malformed).replace("es. AISA-02", "").includes(id.trim()), JSON.stringify(id));
  }
});

test("compito: fino a 20.000 caratteri, oltre è un errore", async () => {
  const ok = await client.callTool({ name: "agente", arguments: { id: "AISA-02", compito: "x".repeat(20_000) } });
  assert.notEqual(ok.isError, true);
  const long = await client.callTool({ name: "agente", arguments: { id: "AISA-02", compito: "x".repeat(20_001) } });
  assert.equal(long.isError, true);
  await assert.rejects(client.getPrompt({ name: "aisa-02", arguments: { compito: "x".repeat(20_001) } }));
});

test("senza agents/ accanto al pacchetto il server non parte: una riga su stderr, codice 1", () => {
  // Stessa struttura del repository (packages/mcp/src) ma senza agents/: il server non deve cercarla altrove.
  const root = mkdtempSync(join(tmpdir(), "agentrica-vuoto-"));
  try {
    const src = join(root, "packages", "mcp", "src");
    mkdirSync(src, { recursive: true });
    for (const file of ["server.ts", "prompt.ts", "panel.ts", "project.ts"]) copyFileSync(join(import.meta.dirname, file), join(src, file));
    const catalogSrc = join(import.meta.dirname, "..", "..", "catalog", "src");
    mkdirSync(join(root, "packages", "catalog", "src"), { recursive: true });
    for (const file of ["index.ts", "departments.ts", "markdown.ts"]) {
      copyFileSync(join(catalogSrc, file), join(root, "packages", "catalog", "src", file));
    }
    symlinkSync(join(import.meta.dirname, "..", "..", "..", "node_modules"), join(root, "node_modules"));
    // La cartella corrente è la root del repository, che ha una agents/ valida: il server non deve usarla.
    const run = spawnSync(process.execPath, [join(src, "server.ts")], { cwd: repo, input: "", encoding: "utf8" });
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
    args: ["--permission", `--allow-fs-read=${repo}`, join(import.meta.dirname, "server.ts"), "--agents", "aiwda,aisa-02"],
    cwd,
    stderr: "pipe",
  });
  await squad.connect(squadTransport);
  try {
    const { prompts } = await squad.listPrompts();
    assert.equal(prompts.length, 11);
    assert.equal(prompts[0]!.name, "aisa-02");
    assert.ok(prompts.slice(1).every((p) => p.name.startsWith("aiwda-")));
    assert.match(squad.getInstructions() ?? "", /^Agentrica: 11 agenti IA in 2 reparti \(AISA, AIWDA\)\./);
    const list = text(await squad.callTool({ name: "elenca_agenti", arguments: {} }));
    assert.equal(list.match(/^- /gm)?.length, 11);
    const outside = await squad.callTool({ name: "elenca_agenti", arguments: { reparto: "AICA" } });
    assert.equal(outside.isError, true);
    const missing = await squad.callTool({ name: "agente", arguments: { id: "AISA-03" } });
    assert.equal(missing.isError, true);
    assert.match(text(await squad.callTool({ name: "agente", arguments: { id: "aisa-02" } })), /^# AISA-02 · ALTAIR/);
  } finally {
    await squad.close();
  }
});

test("--agents sbagliato o opzione sconosciuta: il server non parte, una riga su stderr che li nomina", () => {
  const start = (...args: string[]) =>
    spawnSync(process.execPath, [join(import.meta.dirname, "server.ts"), ...args], { cwd, input: "", encoding: "utf8" });
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

// Ultima prova, dopo tutte le chiamate: il server non ha scritto niente su stderr né nella cartella del progetto.
test("dopo tutte le chiamate: stderr vuoto, nessun file nella cartella del progetto", () => {
  assert.equal(stderr, "");
  assert.deepEqual(readdirSync(cwd), []);
});
