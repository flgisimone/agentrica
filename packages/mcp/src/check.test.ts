import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { checkProject, checkText, formatIssue, missingHandoff, type Issue } from "./check.ts";

const dirs: string[] = [];
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

/** Un progetto in una cartella nuova con i file dati (percorso → testo). */
function project(files: Record<string, string>): string {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "aigentrica-check-")));
  dirs.push(root);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const README = (rows: string) => `# Piano\n\n## Fasi\n\n| Fase | File | Contenuto | Stato |\n|---|---|---|---|\n${rows}\n`;
const PHASE = (backlog: string, done = "") =>
  `# F1 — Uno\n\n**Obiettivo**: fare.\n\n## Backlog\n\n| # | Attività | Priorità |\n|---|---|---|\n${backlog}\n\n## Fatto\n\n${done}\n`;
const json = (value: unknown) => JSON.stringify(value, null, 2);
const where = (issues: Issue[]) => issues.map(formatIssue);

test("un piano e un audit validi passano, in italiano, in inglese e nel formato del design", () => {
  const root = project({
    "plan/README.md": README("| F1 | [01-uno.md](01-uno.md) | Uno | completata |\n| F2 | — | Senza file | da fare |"),
    "plan/01-uno.md": PHASE("| F1-01 | A | P0 |\n| F1-02 | B `it\\|en` | P2 (per F6) |", "- **F1-01** fatto."),
    "audit/2026-01-01/sec.json": json({ agente: "AICA-02", rilievi: [{ id: "S-1", titolo: "Uno", priorita: "P1", stato: "Risolto in F1", evidenza: "file.ts:3" }] }),
    "audit/2026-01-01/en.json": json({ agent: "AICA-03", findings: [{ id: "E-1", title: "One", priority: "P2", status: null }] }),
    "audit/2026-01-01/design.json": json({ agent: "AIWDA-02", observations: [{ id: "D-1", title: "Uno", priority: "P3", status: "Nuova", evidence: { url: "/" } }] }),
  });
  assert.deepEqual(checkProject(root), []);
  assert.match(checkText([]), /nessun problema/);
});

test("senza plan/ né audit/ non c'è niente da segnalare", () => {
  assert.deepEqual(checkProject(project({})), []);
});

// chmod non toglie la lettura su Windows né a root: lì il caso lo copre il test del permission model.
const noChmod = process.platform === "win32" || process.getuid?.() === 0;

test("un file che c'è ma non si legge è un errore, non un piano assente", { skip: noChmod }, () => {
  const root = project({
    "plan/README.md": README("| F1 | [01-uno.md](01-uno.md) | Uno | da fare |"),
    "plan/01-uno.md": PHASE("| F1-01 | A | P1 |"),
    "audit/2026-01-01/sec.json": json({ agent: "AICA-02", findings: [] }),
  });
  const unreadable = ["plan/01-uno.md", "audit/2026-01-01/sec.json"].map((file) => join(root, file));
  unreadable.forEach((file) => chmodSync(file, 0o000));
  try {
    assert.deepEqual(where(checkProject(root)), ["plan/01-uno.md: non si può leggere: EACCES.", "audit/2026-01-01/sec.json: non si può leggere: EACCES."]);
    chmodSync(join(root, "plan", "README.md"), 0o000);
    assert.deepEqual(where(checkProject(root)).slice(0, 1), ["plan/README.md: non si può leggere: EACCES."]);
  } finally {
    [...unreadable, join(root, "plan", "README.md")].forEach((file) => chmodSync(file, 0o644));
  }
});

test("piano malformato: ogni errore con file, riga e causa", () => {
  const root = project({
    "plan/README.md": README(
      ["| F1 | [01-uno.md](01-uno.md) | Uno | in corso |", "| F1 | [02-due.md](02-due.md) | Doppio | |", "|  | x | y | z |", "| F3 | [../fuori.md](../fuori.md) | Fuori | da fare |", "| F4 | [04-manca.md](04-manca.md) | Manca | da fare |"].join("\n"),
    ),
    "plan/01-uno.md": "# F1\n\n## Backlog\n\n| # | Attività | Priorità |\n|---|---|---|\n| F1-01 | A | alta |\n| F1-01 | B | P1 |\n|  | C | P1 |\n",
    "plan/02-due.md": "**Obiettivo**: senza titolo né backlog.\n",
  });
  assert.deepEqual(where(checkProject(root)), [
    "plan/01-uno.md: manca la riga «**Obiettivo**: …».",
    "plan/01-uno.md:7: l'attività F1-01 non ha una priorità P0–P3.",
    "plan/01-uno.md:8: l'id F1-01 compare già alla riga 7.",
    "plan/01-uno.md:9: riga del backlog senza id dell'attività.",
    "plan/README.md:8: l'id F1 compare già alla riga 7.",
    "plan/README.md:8: la fase F1 non ha lo stato.",
    "plan/02-due.md: manca il titolo «# …».",
    "plan/02-due.md: manca la sezione «## Backlog» con la tabella (# | Attività | Priorità).",
    "plan/README.md:9: riga della tabella «Fasi» senza id della fase.",
    "plan/README.md:10: il file della fase F3 (../fuori.md) deve essere un nome di file .md dentro plan/.",
    "plan/README.md:11: non trovo plan/04-manca.md, il file della fase F4.",
  ]);
  assert.deepEqual(where(checkProject(project({ "plan/README.md": "# Piano\n" }))), ["plan/README.md: manca la tabella «## Fasi» (Fase | File | Contenuto | Stato)."]);
});

test("backlog senza colonna Priorità (fasi vecchie): la priorità non si controlla", () => {
  const root = project({
    "plan/README.md": README("| F1 | [01-uno.md](01-uno.md) | Uno | completata |"),
    "plan/01-uno.md": "# F1\n\n**Obiettivo**: x.\n\n## Backlog\n\n| ID | Attività | Repository |\n|---|---|---|\n| F1-01 | A | sito |\n",
  });
  assert.deepEqual(checkProject(root), []);
});

test("audit malformato: JSON rotto con la riga quando Node la dà, campi mancanti con l'id, id doppi", () => {
  const root = project({
    "audit/a/rotto.json": '{\n  "agente": "AICA-02"\n  "rilievi": []\n}',
    "audit/a/vuoto.json": "",
    "audit/a/campi.json": json({ agente: "AICA-02", rilievi: [{ id: "S-1", priorita: "alta" }, { titolo: "Senza id", priorita: "P1" }] }),
    "audit/a/lista.json": json({ agente: "AICA-02", elenco: [] }),
    "audit/a/doppio.json": json({ agente: "AICA-02", rilievi: [{ id: "S-9", titolo: "Uno", priorita: "P1" }, { id: "S-9", titolo: "Uno", priorita: "P1" }] }),
  });
  assert.deepEqual(where(checkProject(root)), [
    "audit/a/campi.json:5: il rilievo S-1: campo titolo/title mancante o non valido.",
    "audit/a/campi.json:5: il rilievo S-1: campo priorita/priority mancante o non valido.",
    "audit/a/campi.json: il rilievo #2: campo id mancante o non valido.",
    "audit/a/doppio.json:10: il rilievo S-9 compare due volte nel file.",
    "audit/a/lista.json: campo rilievi/findings/observations mancante o non valido.",
    "audit/a/rotto.json:3: non è un JSON leggibile.",
    "audit/a/vuoto.json: non è un JSON leggibile.",
  ]);
});

test("contraddizioni: si segnalano entrambe le posizioni, senza scegliere", () => {
  const root = project({
    "plan/README.md": README("| F1 | [01-uno.md](01-uno.md) | Uno | completata (0.1.0) |"),
    "plan/01-uno.md": PHASE("| F1-01 | A | P0 |\n| F1-02 | B | P0 — la più grande |\n| F1-03 | C | P1 |", "- **F1-01** fatto."),
    "audit/a/uno.json": json({ agente: "AICA-02", rilievi: [{ id: "S-1", titolo: "Uno", priorita: "P1", stato: "Nuova", evidenza: "x" }, { id: "S-2", titolo: "Due", priorita: "P2", stato: "Chiuso", evidenza: "" }] }),
    "audit/b/due.json": json({ agente: "AICA-03", rilievi: [{ id: "S-1", titolo: "Uno", priorita: "P0", stato: "Risolto", evidenza: ["y"] }, { id: "S-3", titolo: "Tre", priorita: "P2", stato: "non risolto" }] }),
  });
  const issues = checkProject(root);
  assert.ok(issues.every((i) => i.kind === "contradiction"));
  assert.deepEqual(where(issues), [
    "plan/01-uno.md:10: la fase F1 è completata (plan/README.md:7), ma l'attività P0 F1-02 non è in «Fatto».",
    "audit/a/uno.json:12: il rilievo S-2 è chiuso ma non ha l'evidenza (evidenza/evidence).",
    "audit/b/due.json:5: il rilievo S-1 c'è anche in audit/a/uno.json:5, con valori diversi in priorita/priority, stato/status.",
  ]);
  assert.match(checkText(issues), /^3 contraddizioni \(entrambe le posizioni/);
});

test("passaggio di consegne: le parti che mancano, in italiano o in inglese", () => {
  assert.deepEqual(missingHandoff("Esito: fatto. Rilievi: nessuno. Domande aperte: nessuna."), []);
  assert.deepEqual(missingHandoff("Outcome: done. Findings: none. Open questions: none."), []);
  assert.deepEqual(missingHandoff("Ho scritto il codice e i rilievi sono due."), ["outcome", "questions"]);
});

test("il comando check: 0 senza problemi, 1 con problemi, 2 con argomenti sbagliati", () => {
  const server = join(import.meta.dirname, "server.ts");
  const run = (...args: string[]) => spawnSync(process.execPath, [server, "check", ...args, "--lang", "it"], { encoding: "utf8" });
  const good = run(project({ "plan/README.md": README("| F1 | — | Uno | da fare |") }));
  const bad = run(project({ "plan/README.md": "# Piano\n" }));
  assert.equal(good.status, 0, good.stderr);
  assert.match(good.stdout, /nessun problema/);
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /^1 errore di formato:\n- plan\/README\.md: manca la tabella/);
  assert.equal(run("a", "b").status, 2);
  assert.equal(run(join(tmpdir(), "aigentrica-non-esiste")).status, 2);
  // Permission model di Node senza lettura del progetto: non è «non trovo la cartella» (F48-02).
  const denied = spawnSync(process.execPath, ["--permission", `--allow-fs-read=${join(import.meta.dirname, "..", "..", "..")}`, server, "check", project({}), "--lang", "it"], { encoding: "utf8" });
  assert.equal(denied.status, 2);
  assert.match(denied.stderr, /non si può leggere: accesso negato dal permission model di Node/);
});
