import assert from "node:assert/strict";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { DEPARTMENTS, findAgentsDir, loadCatalog } from "./index.ts";
import { parseRole } from "./markdown.ts";

const catalog = loadCatalog();
const agents = catalog.flatMap((d) => d.agents);

test("cinque reparti e 56 agenti", () => {
  assert.deepEqual(catalog.map((d) => d.code), ["AIBPD", "AICA", "AIPCA", "AISA", "AIWDA"]);
  assert.deepEqual(catalog.map((d) => d.agents.length), [12, 12, 10, 12, 10]);
  assert.equal(agents.length, 56);
});

test("nomi in codice unici, id nel formato SIGLA-NN", () => {
  assert.equal(new Set(agents.map((a) => a.star)).size, agents.length);
  assert.equal(new Set(agents.map((a) => a.id)).size, agents.length);
  for (const a of agents) assert.match(a.id, /^(AIBPD|AICA|AIPCA|AISA|AIWDA)-\d{2}$/);
});

test("ogni agente ha ruolo e almeno una sezione", () => {
  for (const a of agents) {
    assert.ok(a.role.length > 0, a.source);
    assert.ok(a.sections.length > 0, a.source);
  }
});

test("il direttore è il file 01", () => {
  for (const d of catalog) assert.equal(d.director.number, 1, d.code);
  assert.equal(catalog.find((d) => d.code === "AISA")?.agents[1]?.star, "ALTAIR");
});

test("un file di ruolo senza nome in codice fa fallire il caricamento", () => {
  const copy = mkdtempSync(join(tmpdir(), "agentrica-"));
  try {
    cpSync(findAgentsDir(), join(copy, "agents"), { recursive: true });
    const folder = join(copy, "agents", DEPARTMENTS[3]!.folder);
    writeFileSync(join(folder, "13-nuovo-ruolo.md"), "# Nuovo ruolo\n\n## Missione\nProva.\n");
    assert.throws(() => loadCatalog(join(copy, "agents")), /13 file di ruolo ma 12 nomi in codice/);
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
});

test("parseRole separa titolo, introduzione e sezioni", () => {
  const role = parseRole("# Titolo\n\nAgisci come prova.\n\n## Missione\nUna.\n\n## Limiti\n- due\n");
  assert.equal(role.title, "Titolo");
  assert.equal(role.intro, "Agisci come prova.");
  assert.deepEqual(role.sections, [
    { heading: "Missione", body: "Una." },
    { heading: "Limiti", body: "- due" },
  ]);
    assert.throws(() => parseRole("senza titolo"), /senza titolo/);
});
