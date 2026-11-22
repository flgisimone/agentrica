// Lettura del progetto dell'utente per il pannello: fasi e backlog da plan/, rilievi da plan/ e audit/, stato di git.
// Il formato è quello che crea `init` (init.ts), descritto nel README del pacchetto. Si legge solo dentro plan/ e audit/
// della cartella del progetto: i link simbolici che escono sono rifiutati e ogni file ha un limite di dimensione.
// Un file mancante o fuori formato diventa un problema in `problems`, mai un errore che ferma il pannello.
import { execFile } from "node:child_process";
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { basename, join, sep } from "node:path";
import { promisify } from "node:util";

export interface Phase {
  id: string;
  file: string | null;
  summary: string;
  status: string;
}

export interface Task {
  id: string;
  task: string;
  priority: string;
  done: boolean;
}

export interface OpenPhase {
  id: string;
  title: string;
  goal: string;
  status: string;
  tasks: Task[];
  criteria: string[];
}

export interface Finding {
  id: string;
  title: string;
  /** «P0»…«P3», oppure "" se il testo non la dice. */
  priority: string;
  department: string | null;
  /** La fase («F13») o l'audit con il file («2026-11-15-mcp/sec-release.json»). */
  source: string;
  status: string | null;
}

export interface GitState {
  branch: string;
  /** File tracciati con modifiche. */
  changed: number;
  /** File nuovi non ancora aggiunti a git. */
  untracked: number;
}

export interface Project {
  name: string;
  git: GitState | null;
  phases: Phase[];
  openPhase: OpenPhase | null;
  findings: Finding[];
  problems: string[];
}

const MAX_FILE_BYTES = 1_000_000;
const DEPARTMENT = /\b(AIBPD|AICA|AIPCA|AISA|AIWDA)\b/;
const PRIORITY = /\bP[0-3]\b/;
const CLOSED = new Set(["completata", "sospesa"]);
// Un rilievo è chiuso quando il testo (fasi) o lo stato (audit) dice «risolto» o «chiuso», in qualsiasi genere e
// numero, e non «non risolto»: la voce resta nel piano come storia ma il pannello non la mostra fra gli aperti.
const CLOSED_FINDING = /(?<!\bnon )\b(risolt|chius)[oaie]\b/i;

/** true se il testo dice che il rilievo è risolto o chiuso (README del pacchetto, «Formato»). */
export const isClosedFinding = (text: string) => CLOSED_FINDING.test(text);

/** Legge un file di testo sotto `root`, rifiutando link simbolici che escono e file troppo grandi. */
function readInside(root: string, path: string): string {
  const real = realpathSync(path);
  if (!real.startsWith(root + sep)) throw new Error("fuori dalla cartella del progetto");
  if (statSync(real).size > MAX_FILE_BYTES) throw new Error("file troppo grande");
  return readFileSync(real, "utf8");
}

/** Le righe di una sezione «## Titolo», fino alla sezione successiva dello stesso livello. */
export function section(markdown: string, heading: string): string[] | null {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return null;
  const end = lines.findIndex((line, i) => i > start && line.startsWith("## "));
  return lines.slice(start + 1, end === -1 ? undefined : end);
}

/** Le righe di dati della prima tabella Markdown fra `lines`, senza intestazione e separatore. */
export function tableRows(lines: readonly string[]): string[][] {
  const rows = lines.filter((line) => line.trim().startsWith("|"));
  return rows.slice(2).map((row) => row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
}

/** Gli elementi di primo livello di un elenco puntato. */
export function bullets(lines: readonly string[]): string[] {
  return lines.filter((line) => line.startsWith("- ")).map((line) => line.slice(2).trim());
}

const linkTarget = (cell: string) => /\]\(([^)]+)\)/.exec(cell)?.[1] ?? null;
const priorityOf = (text: string) => PRIORITY.exec(text)?.[0] ?? "";

function readPhases(root: string, plan: string, problems: string[]): Phase[] {
  let readme: string;
  try {
    readme = readInside(root, join(plan, "README.md"));
  } catch {
    problems.push("Non trovo plan/README.md: il pannello legge il formato creato da `agentrica-mcp init` (vedi il README del pacchetto).");
    return [];
  }
  const phasesSection = section(readme, "Fasi");
  const rows = phasesSection ? tableRows(phasesSection) : [];
  if (rows.length === 0) {
    problems.push("In plan/README.md manca la tabella «## Fasi» (Fase | File | Contenuto | Stato).");
    return [];
  }
  return rows.map(([id = "", file = "", summary = "", status = ""]) => {
    const target = linkTarget(file);
    // Solo un nome di file dentro plan/: niente cartelle né percorsi che risalgono.
    const safe = target && /^[\w.-]+\.md$/.test(target) && target !== "README.md" ? target : null;
    return { id, file: safe, summary, status };
  });
}

function readOpenPhase(root: string, plan: string, phase: Phase, problems: string[]): OpenPhase | null {
  if (!phase.file) return null;
  let text: string;
  try {
    text = readInside(root, join(plan, phase.file));
  } catch {
    problems.push(`Non trovo plan/${phase.file}, il file della fase ${phase.id}.`);
    return null;
  }
  const title = /^# (.+)$/m.exec(text)?.[1] ?? phase.id;
  const goal = /^\*\*Obiettivo\*\*:\s*(.+)$/m.exec(text)?.[1] ?? "";
  const done = (section(text, "Fatto") ?? []).join("\n");
  const backlog = section(text, "Backlog");
  if (!backlog) problems.push(`In plan/${phase.file} manca la sezione «## Backlog».`);
  const tasks = tableRows(backlog ?? []).map(([id = "", task = "", priority = ""]) => ({
    id,
    task,
    priority,
    done: id !== "" && done.includes(`**${id}**`),
  }));
  return { id: phase.id, title, goal, status: phase.status, tasks, criteria: bullets(section(text, "Criteri di accettazione") ?? []) };
}

/** I «Rilievi aperti» dei file di fase, che sono l'elenco curato dei rilievi ancora da chiudere. */
function readPhaseFindings(root: string, plan: string, phases: readonly Phase[]): Finding[] {
  return phases.flatMap((phase) => {
    if (!phase.file) return [];
    let text: string;
    try {
      text = readInside(root, join(plan, phase.file));
    } catch {
      return [];
    }
    return bullets(section(text, "Rilievi aperti") ?? [])
      .filter((item) => !/^nessuno\b/i.test(item) && !isClosedFinding(item))
      .map((item) => ({
        id: "",
        title: item,
        priority: priorityOf(item),
        department: DEPARTMENT.exec(item)?.[1] ?? null,
        source: phase.id,
        status: null,
      }));
  });
}

const asText = (value: unknown) => (typeof value === "string" ? value : "");

function readAuditFindings(root: string, problems: string[]): Finding[] {
  const audit = join(root, "audit");
  let folders: string[];
  try {
    folders = readdirSync(audit, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch {
    return [];
  }
  return folders.flatMap((folder) => {
    const files = readdirSync(join(audit, folder)).filter((name) => name.endsWith(".json")).sort();
    return files.flatMap((file) => {
      const source = `${folder}/${file}`;
      let data: unknown;
      try {
        data = JSON.parse(readInside(root, join(audit, folder, file)));
      } catch {
        problems.push(`audit/${source} non è un JSON leggibile: saltato.`);
        return [];
      }
      const record = data as { agente?: unknown; rilievi?: unknown };
      if (!Array.isArray(record.rilievi)) {
        problems.push(`audit/${source} non ha l'elenco «rilievi»: saltato.`);
        return [];
      }
      const department = DEPARTMENT.exec(asText(record.agente))?.[1] ?? null;
      const items = record.rilievi
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .filter((item) => !isClosedFinding(asText(item.stato)));
      return items.map((item) => ({
        id: asText(item.id),
        title: asText(item.titolo),
        priority: priorityOf(asText(item.priorita)),
        department,
        source,
        status: asText(item.stato) || null,
      }));
    });
  });
}

const run = promisify(execFile);

/** Branch e numero di file modificati; null se la cartella non è un repository git o git non c'è. */
export async function readGit(root: string): Promise<GitState | null> {
  try {
    // Niente fsmonitor (un comando scelto dalla config del repository) e niente lock: il pannello legge e basta.
    const args = ["--no-optional-locks", "-c", "core.fsmonitor=false", "status", "--porcelain=v1", "--branch"];
    const { stdout } = await run("git", args, { cwd: root, timeout: 2000 });
    const [head = "", ...rest] = stdout.split("\n").filter(Boolean);
    const branch = head.replace(/^## /, "").replace(/^No commits yet on /, "").split("...")[0] ?? "";
    const untracked = rest.filter((line) => line.startsWith("??")).length;
    return { branch, changed: rest.length - untracked, untracked };
  } catch {
    return null;
  }
}

/** Legge plan/ e audit/ di `root` (la cartella del progetto, già risolta con realpath). */
export function readPlan(root: string): Omit<Project, "git"> {
  const problems: string[] = [];
  const plan = join(root, "plan");
  const phases = readPhases(root, plan, problems);
  const open = phases.find((phase) => !CLOSED.has(phase.status.toLowerCase()));
  return {
    name: basename(root),
    phases,
    openPhase: open ? readOpenPhase(root, plan, open, problems) : null,
    findings: [...readPhaseFindings(root, plan, phases), ...readAuditFindings(root, problems)],
    problems,
  };
}

export async function readProject(root: string): Promise<Project> {
  return { ...readPlan(root), git: await readGit(root) };
}
