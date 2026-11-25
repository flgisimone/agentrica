// Validazione deterministica (F42) di plan/ e audit/: controlla la forma dei file che scrivono gli agenti, non il loro
// contenuto, e non riscrive nulla. Il formato è quello del README del pacchetto («Formato di plan/ e audit/»), lo stesso
// che legge il pannello (project.ts). Due tipi di segnalazione: errori di formato e contraddizioni fra due punti dei
// file, delle quali si riportano entrambe le posizioni senza scegliere quale valga. Nessuna chiamata a un modello.
// Lo usano il comando `check` (CI di questo repository), il tool MCP `check` e il pannello.
import { readdirSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { z } from "zod";
import { CELL, HEADINGS, isClosedFinding, linkTarget, PRIORITY, readInside, section } from "./project.ts";
import { T } from "./texts/index.ts";

export interface Issue {
  /** Percorso relativo alla cartella del progetto, con «/». */
  file: string;
  /** Riga (da 1), se il punto si trova. */
  line?: number | undefined;
  message: string;
  kind: "error" | "contradiction";
}

/** «plan/01-uno.md:12: …», la forma dei compilatori: gli editor la rendono cliccabile. */
export const formatIssue = (issue: Issue) => `${issue.file}${issue.line ? `:${issue.line}` : ""}: ${issue.message}`;

const COMPLETED = new Set(["completata", "completed"]);
const SAFE_FILE = /^[\w.-]+\.md$/;

const cellsOf = (line: string) => line.trim().replace(/^\||\|$/g, "").split(CELL).map((c) => c.replaceAll("\\|", "|").trim());

/** La prima tabella sotto il titolo `## …`: l'intestazione e le righe di dati con il numero di riga (da 1). */
function tableAt(lines: readonly string[], headings: readonly string[]): { header: string[]; rows: { line: number; cells: string[] }[] } | null {
  const wanted = new Set(headings.map((h) => `## ${h}`));
  const start = lines.findIndex((line) => wanted.has(line.trim()));
  if (start === -1) return null;
  const rows: { line: number; cells: string[] }[] = [];
  for (let i = start + 1; i < lines.length && !lines[i]!.startsWith("## "); i++) {
    if (lines[i]!.trim().startsWith("|")) rows.push({ line: i + 1, cells: cellsOf(lines[i]!) });
  }
  return { header: rows[0]?.cells ?? [], rows: rows.slice(2) };
}

function checkPhaseFile(root: string, file: string, phase: { id: string; status: string; line: number }, issues: Issue[]) {
  const path = `plan/${file}`;
  let text: string;
  try {
    text = readInside(root, join(root, "plan", file));
  } catch {
    issues.push({ file: "plan/README.md", line: phase.line, message: T.check.missingPhaseFile(file, phase.id), kind: "error" });
    return;
  }
  const lines = text.split("\n");
  const error = (message: string, line?: number) => issues.push({ file: path, line, message, kind: "error" });
  if (!/^# .+/m.test(text)) error(T.check.noTitle);
  if (!/^\*\*(?:Obiettivo|Goal)\*\*:\s*\S/m.test(text)) error(T.check.noGoal);
  const backlog = tableAt(lines, HEADINGS.backlog);
  if (!backlog) return error(T.check.noBacklog);
  // La priorità si cerca per intestazione: alcune fasi chiuse hanno al suo posto «Repository» o «Ruoli» (F28, F29), e
  // lì non c'è una priorità da controllare.
  const priorityColumn = backlog.header.findIndex((h) => /^(priorità|priority)$/i.test(h));
  const done = (section(text, HEADINGS.done) ?? []).join("\n");
  const seen = new Map<string, number>();
  for (const { line, cells } of backlog.rows) {
    const id = cells[0] ?? "";
    const priority = priorityColumn === -1 ? "" : (cells[priorityColumn] ?? "");
    if (!id) {
      error(T.check.taskNoId, line);
      continue;
    }
    const first = seen.get(id);
    if (first) error(T.check.duplicate(id, first), line);
    seen.set(id, line);
    if (priorityColumn !== -1 && !PRIORITY.test(priority)) error(T.check.taskPriority(id), line);
    // Contraddizione: la fase si dice completata e un'attività P0 non ha esito in «Fatto».
    if (COMPLETED.has(phase.status.toLowerCase()) && /\bP0\b/.test(priority) && !done.includes(`**${id}**`)) {
      issues.push({ file: path, line, message: T.check.openP0(id, phase.id, phase.line), kind: "contradiction" });
    }
  }
}

function checkPlan(root: string, issues: Issue[]) {
  let readme: string;
  try {
    readme = readInside(root, join(root, "plan", "README.md"));
  } catch {
    // Un piano che manca è un'informazione del pannello (F35), non un errore di formato.
    return;
  }
  const rows = tableAt(readme.split("\n"), HEADINGS.phases)?.rows;
  if (!rows) return issues.push({ file: "plan/README.md", message: T.check.noPhases, kind: "error" });
  const seen = new Map<string, number>();
  for (const { line, cells } of rows) {
    const [id = "", fileCell = "", , status = ""] = cells;
    const error = (message: string) => issues.push({ file: "plan/README.md", line, message, kind: "error" });
    if (!id) {
      error(T.check.phaseNoId);
      continue;
    }
    const first = seen.get(id);
    if (first) error(T.check.duplicate(id, first));
    seen.set(id, line);
    if (!status) error(T.check.phaseNoStatus(id));
    const target = linkTarget(fileCell);
    if (!target) continue;
    if (!SAFE_FILE.test(target) || target === "README.md") {
      error(T.check.badLink(target, id));
      continue;
    }
    checkPhaseFile(root, target, { id, status, line }, issues);
  }
}

// Lo schema di un file di rilievi, sulle chiavi già ricondotte a una sola lingua (normalize): italiano (rilievi, agente,
// titolo, priorita, stato, evidenza), inglese (findings, agent, title, priority, status, evidence) e il formato del
// reparto design (observations). Un campo in più non è un errore: ogni ruolo ha i suoi.
const nonEmpty = z.string().trim().min(1);
const FindingSchema = z.object({
  id: nonEmpty,
  title: nonEmpty,
  priority: z.string().regex(PRIORITY),
  status: z.string().nullish(),
  evidence: z.unknown(),
});
const AuditSchema = z.object({ agent: nonEmpty, findings: z.array(FindingSchema) });
type AuditFinding = z.infer<typeof FindingSchema>;

/** Il nome del campo nei due formati, per i messaggi: «titolo/title». */
const FIELD_NAMES: Record<string, string> = {
  agent: "agente/agent",
  findings: "rilievi/findings/observations",
  id: "id",
  title: "titolo/title",
  priority: "priorita/priority",
  status: "stato/status",
};

function normalize(data: unknown): unknown {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return data;
  const record = data as Record<string, unknown>;
  const list = record.rilievi ?? record.findings ?? record.observations;
  return {
    agent: record.agente ?? record.agent,
    findings: Array.isArray(list)
      ? list.map((item) => {
          if (typeof item !== "object" || item === null) return item;
          const r = item as Record<string, unknown>;
          return { id: r.id, title: r.titolo ?? r.title, priority: r.priorita ?? r.priority, status: r.stato ?? r.status, evidence: r.evidenza ?? r.evidenze ?? r.evidence };
        })
      : list,
  };
}

const isEmpty = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.every(isEmpty)) ||
  (typeof value === "object" && !Array.isArray(value) && Object.values(value).every(isEmpty));

/** La riga della `nth`-esima (da 0) comparsa dell'id del rilievo, per portare l'editor al punto. */
const lineOf = (text: string, id: string, nth = 0) => {
  const lines = text.split("\n").flatMap((line, i) => (line.includes(`"${id}"`) ? [i + 1] : []));
  return lines[nth];
};

function checkAudit(root: string, issues: Issue[]) {
  const audit = join(root, "audit");
  let folders: string[];
  try {
    folders = readdirSync(audit, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch {
    return;
  }
  // Per le contraddizioni fra file: id → la prima volta che compare.
  const byId = new Map<string, { file: string; line?: number | undefined; finding: AuditFinding }>();
  for (const folder of folders) {
    for (const name of readdirSync(join(audit, folder)).filter((n) => n.endsWith(".json")).sort()) {
      const file = `audit/${folder}/${name}`;
      const error = (message: string, line?: number) => issues.push({ file, line, message, kind: "error" });
      let text: string;
      let data: unknown;
      try {
        text = readInside(root, join(audit, folder, name));
        data = JSON.parse(text);
      } catch (e) {
        // ponytail: la riga solo quando il messaggio di JSON.parse la scrive («line 3 column 2»); «Unexpected token» e
        // «Unexpected end» di Node 26 non la hanno. Calcolarla da sé chiede un parser: solo se un progetto ne ha bisogno.
        const line = /\(line (\d+) column \d+\)/.exec(e instanceof Error ? e.message : "")?.[1];
        error(T.check.badJson, line === undefined ? undefined : Number(line));
        continue;
      }
      const parsed = AuditSchema.safeParse(normalize(data));
      if (!parsed.success) {
        const list = (normalize(data) as { findings?: unknown[] } | undefined)?.findings;
        for (const problem of parsed.error.issues) {
          const [top, index, field] = problem.path;
          if (top === "findings" && typeof index === "number") {
            const raw = list?.[index] as { id?: unknown } | undefined;
            const id = typeof raw?.id === "string" && raw.id ? raw.id : `#${index + 1}`;
            error(T.check.badField(id, FIELD_NAMES[String(field)] ?? String(field ?? "")), typeof raw?.id === "string" ? lineOf(text, raw.id) : undefined);
          } else error(T.check.badField("", FIELD_NAMES[String(top)] ?? String(top ?? "")));
        }
        continue;
      }
      const seen = new Map<string, number>();
      for (const finding of parsed.data.findings) {
        const count = seen.get(finding.id) ?? 0;
        const line = lineOf(text, finding.id, count);
        if (count > 0) error(T.check.duplicateFinding(finding.id), line);
        seen.set(finding.id, count + 1);
        if (finding.status && isClosedFinding(finding.status) && isEmpty(finding.evidence)) {
          issues.push({ file, line, message: T.check.closedNoEvidence(finding.id), kind: "contradiction" });
        }
        const first = byId.get(finding.id);
        if (!first) {
          byId.set(finding.id, { file, line, finding });
          continue;
        }
        if (first.file === file) continue;
        const differs = (["title", "priority", "status"] as const).filter((key) => (first.finding[key] ?? "") !== (finding[key] ?? ""));
        if (differs.length > 0) {
          const where = `${first.file}${first.line ? `:${first.line}` : ""}`;
          issues.push({ file, line, message: T.check.sameIdDiffers(finding.id, where, differs.map((k) => FIELD_NAMES[k]!).join(", ")), kind: "contradiction" });
        }
      }
    }
  }
}

/** Controlla plan/ e audit/ di `root` (la cartella del progetto, già risolta con realpath). */
export function checkProject(root: string): Issue[] {
  const issues: Issue[] = [];
  checkPlan(root, issues);
  checkAudit(root, issues);
  return issues;
}

/** Il testo del risultato per il comando e il tool: «nessun problema» o le segnalazioni, prima gli errori. */
export function checkText(issues: readonly Issue[]): string {
  if (issues.length === 0) return T.check.ok;
  const errors = issues.filter((i) => i.kind === "error");
  const contradictions = issues.filter((i) => i.kind === "contradiction");
  const block = (title: string, list: readonly Issue[]) => (list.length ? [title, ...list.map((i) => `- ${formatIssue(i)}`)] : []);
  return [...block(T.check.errors(errors.length), errors), ...block(T.check.contradictions(contradictions.length), contradictions)].join("\n");
}

// Le tre parti del passaggio di consegne (F41-05), in italiano o in inglese, qualunque sia la lingua del server.
const HANDOFF_PARTS = [
  ["outcome", /\b(esito|outcome)\b/i],
  ["findings", /\b(rilievi|findings)\b/i],
  ["questions", /\b(domande|questions)\b/i],
] as const;

/** Le parti del passaggio di consegne che mancano in un resoconto: il tool report lo dice, ma il testo lo salva. */
export function missingHandoff(summary: string): ("outcome" | "findings" | "questions")[] {
  return HANDOFF_PARTS.filter(([, pattern]) => !pattern.test(summary)).map(([part]) => part);
}

/** Il comando `agentrica-mcp check [cartella]`: stampa le segnalazioni; 1 se ce ne sono, 0 se no. */
export function runCheck(args: string[]): number {
  let dir: string;
  try {
    // --lang l'ha già letto il server all'avvio; qui si accetta e basta.
    const { positionals } = parseArgs({ args, options: { lang: { type: "string" } }, allowPositionals: true });
    if (positionals.length > 1) throw new Error("troppe cartelle");
    dir = positionals[0] ?? ".";
  } catch {
    process.stderr.write(`${T.check.usage}\n`);
    return 2;
  }
  let root: string;
  try {
    root = realpathSync(dir);
  } catch {
    process.stderr.write(`${T.check.noDir(dir)}\n`);
    return 2;
  }
  const issues = checkProject(root);
  process.stdout.write(`${checkText(issues)}\n`);
  return issues.length === 0 ? 0 : 1;
}

