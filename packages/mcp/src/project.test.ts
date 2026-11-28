import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { checkProject } from "./check.ts";
import { readGit, readPlan } from "./project.ts";

const root = realpathSync(mkdtempSync(join(tmpdir(), "aigentrica-project-")));
const outside = realpathSync(mkdtempSync(join(tmpdir(), "aigentrica-outside-")));
after(() => {
  rmSync(root, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
});

const write = (path: string, text: string) => {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), text);
};

test("senza plan/ il pannello dà un'informazione con le due strade, non un problema (F35)", () => {
  const empty = realpathSync(mkdtempSync(join(tmpdir(), "aigentrica-empty-")));
  const plan = readPlan(empty);
  const noPlanIssues = checkProject(empty);
  mkdirSync(join(empty, "plan"));
  writeFileSync(join(empty, "plan", "README.md"), "# Piano\n\n## Fasi\n\n| Fase | File | Contenuto | Stato |\n|---|---|---|---|\n");
  const noPhases = readPlan(empty);
  const noPhasesIssues = checkProject(empty);
  writeFileSync(join(empty, "plan", "README.md"), "# Piano\n");
  const noTable = readPlan(empty);
  const noTableIssues = checkProject(empty);
  rmSync(empty, { recursive: true });
  assert.deepEqual(plan.phases, []);
  assert.equal(plan.openPhase, null);
  assert.deepEqual(noPlanIssues, []);
  assert.deepEqual(noPhasesIssues, []);
  assert.match(plan.notice!, /init --existing.*Crea il piano del progetto dal codice esistente/);
  assert.match(noPhases.notice!, /non ha ancora fasi/);
  assert.equal(noTable.notice, null, "un README senza la tabella «Fasi» resta un problema di formato");
  assert.match(noTableIssues[0]!.message, /manca la tabella «## Fasi»/);
});

test("fasi, fase aperta con backlog e criteri, rilievi di fasi e audit", () => {
  write(
    "plan/README.md",
    [
      "# Piano",
      "## Fasi",
      "",
      "| Fase | File | Contenuto | Stato |",
      "|---|---|---|---|",
      // Lo stato vale per la prima parola: «completata (0.1.0)» è chiusa (F46-UX-01).
      "| F0 | [00-base.md](00-base.md) | Base | completata (0.1.0) |",
      "| F1 | [01-uno.md](01-uno.md) | Prima | aperta |",
      "| F2 | [../fuori.md](../fuori.md) | Fuori | da aprire |",
      "",
      "## Glossario",
    ].join("\n"),
  );
  write("plan/00-base.md", "# F0 — Base\n\n## Rilievi aperti\n\n- P3: un dettaglio di AISA.\n- P2: la CI. Risolto in F6.\n- P3: i rilievi chiusi senza azione.\n- P3: non risolto, va ripreso.\n- Nessuno altro.\n");
  write(
    "plan/01-uno.md",
    [
      "# F1 — Prima",
      "**Obiettivo**: fare la prima cosa.",
      "## Backlog",
      "| # | Task | Priorità |",
      "|---|---|---|",
      "| F1-01 | Scrivere `a` | P1 |",
      "| F1-02 | Scrivere b | P2 |",
      "## Criteri di accettazione",
      "- Funziona.",
      "## Fatto",
      "- **F1-01** fatto.",
    ].join("\n"),
  );
  write("audit/2026-01-01/sec.json", JSON.stringify({ agente: "AICA-02 · sec", rilievi: [{ id: "S-1", titolo: "Uno", priorita: "P2 (per F6)", stato: "Accettata" }, { id: "S-2", titolo: "Due", priorita: "P1", stato: "Risolta in F10" }, null] }));
  write("audit/2026-01-01/rotto.json", "{");
  symlinkSync(outside, join(root, "audit", "link"));

  const plan = readPlan(root);
  assert.equal(plan.phases.length, 3);
  assert.equal(plan.phases[2]!.file, null, "un percorso che risale non è un file di fase");
  assert.deepEqual(plan.openPhase, {
    id: "F1",
    title: "F1 — Prima",
    goal: "fare la prima cosa.",
    status: "aperta",
    tasks: [
      { id: "F1-01", task: "Scrivere `a`", priority: "P1", done: true },
      { id: "F1-02", task: "Scrivere b", priority: "P2", done: false },
    ],
    criteria: ["Funziona."],
  });
  assert.deepEqual(plan.findings, [
    { id: "", title: "P3: un dettaglio di AISA.", priority: "P3", department: "AISA", source: "F0", status: null },
    { id: "", title: "P3: non risolto, va ripreso.", priority: "P3", department: null, source: "F0", status: null },
    { id: "S-1", title: "Uno", priority: "P2", department: "AICA", source: "2026-01-01/sec.json", status: "Accettata" },
  ]);
});

test("un file di fase che è un link fuori dal progetto non si legge", () => {
  writeFileSync(join(outside, "segreto.md"), "# Segreto\n## Rilievi aperti\n- P0: segreto\n");
  write("plan/README.md", "## Fasi\n| Fase | File | Contenuto | Stato |\n|---|---|---|---|\n| F9 | [09-link.md](09-link.md) | Link | aperta |\n");
  symlinkSync(join(outside, "segreto.md"), join(root, "plan", "09-link.md"));
  const plan = readPlan(root);
  assert.equal(plan.openPhase, null);
  assert.ok(!plan.findings.some((f) => f.title.includes("segreto")));
  const [issue] = checkProject(root);
  assert.equal(issue!.file, "plan/09-link.md");
  assert.match(issue!.message, /non si può leggere: è un link fuori dalla cartella del progetto/);
});

// Il piano di AIgentrica sta da F56 nel repository del sito, che lo controlla con `aigentrica-mcp check` nel suo verify.
test("il piano del modello starter/ si legge senza problemi, git di questo repository sì", async () => {
  const repo = realpathSync(join(import.meta.dirname, "..", "..", ".."));
  for (const starter of [join(repo, "starter"), join(repo, "starter", "en")]) {
    assert.deepEqual(checkProject(starter), [], `${starter}: plan/ e audit/ passano il controllo (F42)`);
    assert.ok(readPlan(starter).phases.length >= 1);
  }
  const git = await readGit(repo);
  assert.ok(git && git.branch.length > 0 && git.changed >= 0 && git.untracked >= 0);
  assert.equal(await readGit(outside), null);
});
