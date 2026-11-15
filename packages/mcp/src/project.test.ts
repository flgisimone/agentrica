import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { readGit, readPlan } from "./project.ts";

const root = realpathSync(mkdtempSync(join(tmpdir(), "agentrica-project-")));
const outside = realpathSync(mkdtempSync(join(tmpdir(), "agentrica-outside-")));
after(() => {
  rmSync(root, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
});

const write = (path: string, text: string) => {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), text);
};

test("senza plan/ il pannello dice cosa manca", () => {
  const empty = realpathSync(mkdtempSync(join(tmpdir(), "agentrica-empty-")));
  const plan = readPlan(empty);
  rmSync(empty, { recursive: true });
  assert.deepEqual(plan.phases, []);
  assert.equal(plan.openPhase, null);
  assert.match(plan.problems[0]!, /Non trovo plan\/README\.md/);
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
      "| F0 | [00-base.md](00-base.md) | Base | completata |",
      "| F1 | [01-uno.md](01-uno.md) | Prima | aperta |",
      "| F2 | [../fuori.md](../fuori.md) | Fuori | da aprire |",
      "",
      "## Glossario",
    ].join("\n"),
  );
  write("plan/00-base.md", "# F0 — Base\n\n## Rilievi aperti\n\n- P3: un dettaglio di AISA.\n- Nessuno altro.\n");
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
  write("audit/2026-01-01/sec.json", JSON.stringify({ agente: "AICA-02 · sec", rilievi: [{ id: "S-1", titolo: "Uno", priorita: "P2 (per F6)", stato: "Accettata" }, null] }));
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
    { id: "S-1", title: "Uno", priority: "P2", department: "AICA", source: "2026-01-01/sec.json", status: "Accettata" },
  ]);
  assert.deepEqual(plan.problems, ["audit/2026-01-01/rotto.json non è un JSON leggibile: saltato."]);
});

test("un file di fase che è un link fuori dal progetto non si legge", () => {
  writeFileSync(join(outside, "segreto.md"), "# Segreto\n## Rilievi aperti\n- P0: segreto\n");
  write("plan/README.md", "## Fasi\n| Fase | File | Contenuto | Stato |\n|---|---|---|---|\n| F9 | [09-link.md](09-link.md) | Link | aperta |\n");
  symlinkSync(join(outside, "segreto.md"), join(root, "plan", "09-link.md"));
  const plan = readPlan(root);
  assert.equal(plan.openPhase, null);
  assert.ok(!plan.findings.some((f) => f.title.includes("segreto")));
  assert.match(plan.problems[0]!, /Non trovo plan\/09-link\.md/);
});

test("il piano di questo repository si legge senza problemi", async () => {
  const repo = realpathSync(join(import.meta.dirname, "..", "..", ".."));
  const plan = readPlan(repo);
  assert.deepEqual(plan.problems, []);
  assert.ok(plan.phases.length >= 15);
  assert.ok(plan.findings.some((f) => f.source.endsWith("sec-release.json")));
  const git = await readGit(repo);
  assert.ok(git && git.branch.length > 0);
  assert.equal(await readGit(outside), null);
});
