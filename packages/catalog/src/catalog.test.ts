import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { DEPARTMENTS, findAgentsDir, loadCatalog, twinProblems } from "./index.ts";
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
  assert.equal(catalog.find((d) => d.code === "AIBPD")?.director.star, "ALDERAMIN");
});

test("ogni reparto ha missione, flusso, collaborazione e regole comuni dai suoi file", () => {
  for (const d of catalog) {
    assert.equal(d.slug, d.code.toLowerCase());
    assert.ok(d.mission.length > 0 && !d.mission.startsWith("#"), d.code);
    assert.match(d.workflow, /^1\. /, d.code);
    assert.match(d.collaboration, /^- /, d.code);
    assert.ok(d.rules.sections.length > 0, d.code);
  }
});

test("un README senza flusso di lavoro fa fallire il caricamento", () => {
  const copy = mkdtempSync(join(tmpdir(), "agentrica-"));
  try {
    cpSync(findAgentsDir(), join(copy, "agents"), { recursive: true });
    const readme = join(copy, "agents", DEPARTMENTS[4]!.folder, "README.md");
    writeFileSync(readme, readFileSync(readme, "utf8").replace("## Flusso di lavoro", "## Workflow"));
    assert.throws(() => loadCatalog(join(copy, "agents")), /AIWDA: README.md senza «## Flusso di lavoro»/);
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
});

test("un file di ruolo senza nome in codice fa fallire il caricamento", () => {
  const copy = mkdtempSync(join(tmpdir(), "agentrica-"));
  try {
    cpSync(findAgentsDir(), join(copy, "agents"), { recursive: true });
    const folder = join(copy, "agents", DEPARTMENTS[3]!.folder);
    writeFileSync(join(folder, "13-nuovo-ruolo.md"), "# Nuovo ruolo\n\n## Missione\nProva.\n");
    assert.throws(() => loadCatalog(join(copy, "agents")), /13 file di ruolo in agents\/ai_software_agency\/ ma 12 nomi in codice/);
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

test("il catalogo inglese ha gli stessi reparti, agenti, nomi in codice e schede di quello italiano", () => {
  const en = loadCatalog(findAgentsDir(), "en");
  assert.deepEqual(en.map((d) => d.agents.map((a) => [a.id, a.star, a.slug])), catalog.map((d) => d.agents.map((a) => [a.id, a.star, a.slug])));
  assert.deepEqual(twinProblems(catalog, en), []);
  for (const d of en) {
    assert.equal(d.summary, DEPARTMENTS.find((i) => i.code === d.code)!.summary.en);
    assert.match(d.workflow, /^1\. /, d.code);
    assert.match(d.collaboration, /^- /, d.code);
    for (const a of d.agents) assert.match(a.source, new RegExp(`^agents/${DEPARTMENTS.find((i) => i.code === d.code)!.folder}/en/`));
  }
});

test("il catalogo inglese si ferma se manca un gemello o se le sezioni non coincidono", () => {
  const copy = mkdtempSync(join(tmpdir(), "agentrica-"));
  try {
    cpSync(findAgentsDir(), join(copy, "agents"), { recursive: true });
    const en = join(copy, "agents", DEPARTMENTS[3]!.folder, "en");
    const role = join(en, "02-senior-software-architect.md");
    writeFileSync(role, `${readFileSync(role, "utf8")}\n## Extra\nOne more.\n`);
    assert.throws(() => loadCatalog(join(copy, "agents"), "en"), /en\/02-senior-software-architect\.md: numero di sezioni diversi/);
    rmSync(role);
    assert.throws(() => loadCatalog(join(copy, "agents"), "en"), /AISA: 11 file di ruolo in agents\/ai_software_agency\/en\//);
    rmSync(en, { recursive: true });
    assert.throws(() => loadCatalog(join(copy, "agents"), "en"), /AISA: cartella agents\/ai_software_agency\/en\/ mancante/);
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
});

test("parseRole: un «## » dentro un blocco di codice resta nel corpo della sezione (F53)", () => {
  const { sections } = parseRole("# T\n\n## Prova\n```markdown\n## Backlog\n```\n\n## Termini\n- x");
  assert.deepEqual(sections.map((s) => s.heading), ["Prova", "Termini"]);
  assert.equal(sections[0]!.body, "```markdown\n## Backlog\n```");
});
