import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog } from "./catalog.ts";
import { agentText, findAgent, selectSquad } from "./prompt.ts";

const SERVER = fileURLToPath(new URL("./server.ts", import.meta.url));
// Una casa vuota: niente configurazione dell'utente, lingua dal flag.
const HOME = mkdtempSync(join(tmpdir(), "aigentrica-cli-"));
const run = (...args: string[]) =>
  spawnSync(process.execPath, [SERVER, ...args, "--lang", "it"], { encoding: "utf8", env: { ...process.env, HOME, USERPROFILE: HOME } });

test("list: tutti i reparti o uno solo, sigla in minuscolo; reparto sconosciuto: 1", () => {
  const all = run("list");
  assert.equal(all.status, 0, all.stderr);
  for (const code of ["AIBPD", "AICA", "AIPCA", "AISA", "AIWDA"]) assert.match(all.stdout, new RegExp(`^## ${code} — `, "m"));
  const one = run("list", "aisa");
  assert.equal(one.status, 0);
  assert.match(one.stdout, /^## AISA — /m);
  assert.doesNotMatch(one.stdout, /^## AICA/m);
  const bad = run("list", "xyz");
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /Reparto sconosciuto: xyz/);
  assert.equal(bad.stdout, "");
});

test("agent: lo stesso testo del tool, con regole intere, compito in fondo e senza valutazione né resoconto", () => {
  const found = findAgent(selectSquad(loadCatalog("it")), "AISA-12")!;
  const plain = run("agent", "aisa-12");
  assert.equal(plain.status, 0, plain.stderr);
  assert.equal(plain.stdout, agentText(found));
  const withTask = run("agent", "AISA-12", "--task", "rivedi il diff");
  assert.equal(withTask.stdout, agentText(found, "rivedi il diff"));
  assert.doesNotMatch(withTask.stdout, /rate_agent|report/);
  const missing = run("agent", "aisa-99");
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Agente non trovato/);
});

test("library: le schede chieste; scheda o reparto senza schede danno 1, argomenti sbagliati 2", () => {
  const card = loadCatalog("it").find((d) => d.code === "AICA")!.library[0]!;
  const ok = run("library", "aica-02", card.id);
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, new RegExp(`^# ${card.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.doesNotMatch(ok.stdout, /https?:\/\//);
  const unknown = run("library", "aica-02", "xyz");
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr, /xyz/);
  for (const args of [["library", "aica-02"], ["agent"], ["agent", "aisa-12", "extra"], ["list", "aisa", "aica"], ["list", "--task", "x"]]) {
    const wrong = run(...args);
    assert.equal(wrong.status, 2, args.join(" "));
    assert.match(wrong.stderr, /^Uso: aigentrica-mcp list/);
  }
});
