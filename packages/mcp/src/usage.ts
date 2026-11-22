// Consumo di token del progetto (F24): legge i file che Claude Code salva in ~/.claude/projects/<progetto>/ e ne
// estrae solo numeri, modello, effort e giorno di ogni risposta. I testi delle conversazioni non escono da qui:
// di ogni riga si tengono i campi elencati in `Usage`, il resto si scarta subito.
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";

/** Prezzi API in dollari per milione di token, con la data del listino. Servono solo per le stime in dollari equivalenti. */
export const PRICES = {
  date: "2026-11-03",
  models: {
    opus: { input: 4, output: 20 },
    sonnet: { input: 2, output: 10 },
    haiku: { input: 0.1, output: 0.5 },
  },
  // Moltiplicatori del prezzo d'ingresso: lettura della cache e scrittura (la scrittura a un'ora costa il doppio).
  cacheRead: 0.1,
  cacheWrite5m: 1.25,
  cacheWrite1h: 2,
} as const;

export type Family = keyof typeof PRICES.models;

/** Una risposta del modello, solo con i campi numerici che servono. */
export interface Usage {
  day: string; // AAAA-MM-GG (UTC)
  session: string;
  agent: string; // tipo del subagent, o MAIN per la conversazione principale
  model: string;
  effort: string;
  input: number;
  output: number;
  thinking: number;
  cacheRead: number;
  cacheWrite5m: number;
  cacheWrite1h: number;
}

export const MAIN = "sessione";

/** Limite per file: un file più grande si salta (e si conta fra gli esclusi), così una lettura non blocca il pannello. */
export const MAX_FILE_BYTES = 64 * 1024 * 1024;

/** Cartella di Claude Code per il progetto `root`: il percorso con ogni carattere non alfanumerico sostituito da «-». */
export function claudeProjectDir(root: string, env: NodeJS.ProcessEnv = process.env): string {
  const base = env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude");
  return join(base, "projects", root.replace(/[^a-zA-Z0-9]/g, "-"));
}

/** «claude-opus-5-5» → opus; un modello sconosciuto non ha prezzo. */
export function family(model: string): Family | undefined {
  return (Object.keys(PRICES.models) as Family[]).find((f) => model.includes(f));
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);
const label = (v: unknown, fallback: string) => (typeof v === "string" && /^[\w.:-]{1,64}$/.test(v) ? v : fallback);

/**
 * Una riga di un file .jsonl → la risposta con la sua chiave (requestId), o null se non è una risposta del
 * modello con `usage`. Claude Code scrive una riga per blocco di contenuto con lo stesso usage: la chiave
 * serve a contarla una volta.
 */
export function parseLine(line: string, session: string, agent: string): [string, Usage] | null {
  let o: unknown;
  try {
    o = JSON.parse(line);
  } catch {
    return null;
  }
  if (typeof o !== "object" || o === null) return null;
  const r = o as Record<string, unknown>;
  const message = r.message as Record<string, unknown> | undefined;
  const u = message?.usage as Record<string, unknown> | undefined;
  if (r.type !== "assistant" || !u || typeof u !== "object") return null;
  // «<synthetic>» sono i messaggi che Claude Code scrive da solo (errori, interruzioni): nessun token speso.
  if (message?.model === "<synthetic>") return null;
  const model = label(message?.model, "sconosciuto");
  const key = label(r.requestId, "") || label(message?.id, "") || label(r.uuid, "");
  if (!key) return null;
  const write = (u.cache_creation ?? {}) as Record<string, unknown>;
  const written = num(u.cache_creation_input_tokens);
  const w1h = num(write.ephemeral_1h_input_tokens);
  const w5m = write.ephemeral_5m_input_tokens === undefined ? written - w1h : num(write.ephemeral_5m_input_tokens);
  const ts = typeof r.timestamp === "string" && /^\d{4}-\d{2}-\d{2}/.test(r.timestamp) ? r.timestamp.slice(0, 10) : "sconosciuto";
  return [
    key,
    {
      day: ts,
      session,
      agent,
      model,
      effort: label(r.effort, "predefinito"),
      input: num(u.input_tokens),
      output: num(u.output_tokens),
      thinking: num((u.output_tokens_details as Record<string, unknown> | undefined)?.thinking_tokens),
      cacheRead: num(u.cache_read_input_tokens),
      cacheWrite5m: Math.max(0, w5m),
      cacheWrite1h: w1h,
    },
  ];
}

/** File regolare non troppo grande; un link simbolico non si segue (potrebbe uscire dalla cartella). */
async function readable(path: string): Promise<boolean> {
  const s = await lstat(path).catch(() => undefined);
  return s !== undefined && s.isFile() && s.size <= MAX_FILE_BYTES;
}

async function readFileUsage(path: string, session: string, agent: string, into: Map<string, Usage>): Promise<boolean> {
  if (!(await readable(path))) return false;
  const lines = createInterface({ input: createReadStream(path, { encoding: "utf8" }), crlfDelay: Infinity });
  for await (const line of lines) {
    // Solo le righe delle risposte: le altre (testi dell'utente, risultati dei tool) non si analizzano nemmeno.
    if (!line.includes('"assistant"')) continue;
    const parsed = parseLine(line, session, agent);
    if (parsed) into.set(parsed[0], parsed[1]);
  }
  return true;
}

export interface UsageRead {
  dir: string;
  records: Usage[];
  skipped: number; // file saltati: link simbolici, troppo grandi, illeggibili
}

/** Legge tutte le sessioni del progetto e i loro subagent (`<sessione>/subagents/agent-*.jsonl` con il tipo nel .meta.json). */
export async function readUsage(dir: string): Promise<UsageRead> {
  const byKey = new Map<string, Usage>();
  let skipped = 0;
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    // Anche i link simbolici entrano qui: readable() li scarta e li conta fra gli esclusi.
    if (!entry.isDirectory() && entry.name.endsWith(".jsonl")) {
      const session = entry.name.slice(0, -".jsonl".length);
      if (!(await readFileUsage(join(dir, entry.name), session, MAIN, byKey))) skipped++;
    } else if (entry.isDirectory()) {
      const sub = join(dir, entry.name, "subagents");
      const files = await readdir(sub, { withFileTypes: true }).catch(() => []);
      for (const file of files) {
        if (file.isDirectory() || !/^agent-[\w-]+\.jsonl$/.test(file.name)) continue;
        const metaPath = join(sub, file.name.replace(/\.jsonl$/, ".meta.json"));
        const meta = (await readable(metaPath)) ? await readFile(metaPath, "utf8").then(JSON.parse).catch(() => ({})) : {};
        const agent = label((meta as Record<string, unknown>).agentType, "subagent");
        if (!(await readFileUsage(join(sub, file.name), entry.name, agent, byKey))) skipped++;
      }
    }
  }
  return { dir, records: [...byKey.values()], skipped };
}

/** Un subagent di Claude Code visto dal pannello (F34-06): solo tipo, descrizione breve, stato e ora. */
export interface SubagentRun {
  time: string;
  type: string;
  description: string;
  finished: boolean;
}

const MAX_RUNS = 50;
const MAX_DESCRIPTION = 120;

/**
 * I subagent avviati da `since` (ms) nelle sessioni del progetto, dal più vecchio: Claude Code scrive per ognuno
 * `<sessione>/subagents/agent-*.meta.json` con il tipo. Si leggono solo le cartelle cambiate da `since`, e dei file
 * solo i campi di `SubagentRun`; un subagent avviato prima di `since` e finito dopo può comparire (ora di nascita
 * del file non disponibile, es. su alcuni Linux).
 */
export async function subagentRuns(dir: string, since: number): Promise<SubagentRun[]> {
  const runs: SubagentRun[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    if (!entry.isDirectory()) continue;
    const sub = join(dir, entry.name, "subagents");
    const changed = await lstat(sub).catch(() => undefined);
    if (!changed?.isDirectory() || changed.mtimeMs < since) continue;
    for (const file of await readdir(sub).catch(() => [])) {
      if (!/^agent-[\w-]+\.meta\.json$/.test(file)) continue;
      const path = join(sub, file);
      const s = await lstat(path).catch(() => undefined);
      const born = s ? s.birthtimeMs || s.mtimeMs : 0;
      if (!s?.isFile() || s.size > 64 * 1024 || born < since) continue;
      const meta = (await readFile(path, "utf8").then(JSON.parse).catch(() => ({}))) as Record<string, unknown>;
      const description = typeof meta.description === "string" ? meta.description.replace(/\p{Cc}/gu, " ").trim() : "";
      runs.push({
        time: new Date(born).toISOString(),
        type: label(meta.agentType, "subagent"),
        description: description.length > MAX_DESCRIPTION ? `${description.slice(0, MAX_DESCRIPTION - 1)}…` : description,
        finished: meta.finished === true,
      });
    }
  }
  return runs.sort((a, b) => a.time.localeCompare(b.time)).slice(-MAX_RUNS);
}

/** Somme di un gruppo di risposte. Ogni numero è misurato, tranne `modelSavingUsd`, che è una stima. */
export interface Totals {
  requests: number;
  input: number;
  output: number;
  thinking: number;
  cacheRead: number;
  cacheWrite: number;
  /** Token in ingresso pagati per intero, letti dalla cache e scritti in cache: il totale dell'ingresso. */
  totalInput: number;
  /** Quota dell'ingresso letta dalla cache, da 0 a 1. */
  cacheShare: number;
  /** Costo in dollari equivalenti ai prezzi API; 0 per i modelli senza prezzo. */
  costUsd: number;
  /** Misurato: token letti dalla cache × (prezzo pieno − prezzo di lettura). */
  cacheSavingUsd: number;
  /** Stima: gli stessi token al prezzo di Opus meno il costo con il modello usato. */
  modelSavingUsd: number;
}

function cost(u: Usage, f: Family): number {
  const p = PRICES.models[f];
  return (
    (u.input * p.input +
      u.output * p.output +
      u.cacheRead * p.input * PRICES.cacheRead +
      u.cacheWrite5m * p.input * PRICES.cacheWrite5m +
      u.cacheWrite1h * p.input * PRICES.cacheWrite1h) /
    1e6
  );
}

export function totals(records: readonly Usage[]): Totals {
  const t = { requests: 0, input: 0, output: 0, thinking: 0, cacheRead: 0, cacheWrite: 0, costUsd: 0, cacheSavingUsd: 0, modelSavingUsd: 0 };
  for (const u of records) {
    t.requests++;
    t.input += u.input;
    t.output += u.output;
    t.thinking += u.thinking;
    t.cacheRead += u.cacheRead;
    t.cacheWrite += u.cacheWrite5m + u.cacheWrite1h;
    const f = family(u.model);
    if (!f) continue;
    const c = cost(u, f);
    t.costUsd += c;
    t.cacheSavingUsd += (u.cacheRead * PRICES.models[f].input * (1 - PRICES.cacheRead)) / 1e6;
    if (f !== "opus") t.modelSavingUsd += cost(u, "opus") - c;
  }
  const totalInput = t.input + t.cacheRead + t.cacheWrite;
  return { ...t, totalInput, cacheShare: totalInput === 0 ? 0 : t.cacheRead / totalInput };
}

export type GroupBy = "agent" | "model" | "session" | "day";

/** Totali per agente, modello, sessione o giorno, dal gruppo che costa di più (per il giorno, in ordine di data). */
export function groupTotals(records: readonly Usage[], by: GroupBy): { key: string; totals: Totals }[] {
  const groups = new Map<string, Usage[]>();
  for (const u of records) {
    const key = by === "agent" ? u.agent : by === "model" ? u.model : by === "session" ? u.session : u.day;
    groups.set(key, [...(groups.get(key) ?? []), u]);
  }
  const rows = [...groups].map(([key, list]) => ({ key, totals: totals(list) }));
  return by === "day" ? rows.sort((a, b) => a.key.localeCompare(b.key)) : rows.sort((a, b) => b.totals.costUsd - a.totals.costUsd);
}

export interface UsageReport {
  prices: typeof PRICES;
  skipped: number;
  total: Totals;
  byAgent: { key: string; totals: Totals }[];
  byModel: { key: string; totals: Totals }[];
  bySession: { key: string; totals: Totals }[];
  byDay: { key: string; totals: Totals }[];
}

/** Il rapporto del pannello per il progetto `root`. */
export async function usageReport(root: string, dir = claudeProjectDir(root)): Promise<UsageReport> {
  const { records, skipped } = await readUsage(dir);
  return {
    prices: PRICES,
    skipped,
    total: totals(records),
    byAgent: groupTotals(records, "agent"),
    byModel: groupTotals(records, "model"),
    bySession: groupTotals(records, "session"),
    byDay: groupTotals(records, "day"),
  };
}

/** Una riga dei totali che si possono inviare ad Agentrica (F27): solo questi campi, con valori da elenchi chiusi. */
export interface ShareRow {
  /** SHA-256 di sessione, giorno, agente, modello ed effort: il sito sostituisce la riga con la stessa chiave. */
  key: string;
  day: string;
  /** Id di Agentrica (es. AISA-02), «sessione» per la conversazione principale, «altro» per gli altri subagent. */
  agent: string;
  model: Family | "altro";
  effort: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export const SHARE_DAYS = 30;
export const MAX_SHARE_ROWS = 300;
export const SHARE_EFFORTS = ["low", "medium", "high", "xhigh", "max", "predefinito", "altro"] as const;
const OTHER = "altro";

/**
 * Le righe da inviare: gli ultimi SHARE_DAYS giorni fino a `today` (AAAA-MM-GG), una per sessione, giorno, agente,
 * modello ed effort, dalle più recenti, al più MAX_SHARE_ROWS (`omitted` dice quante restano fuori). `agentIds` porta
 * il nome di un subagent all'id di Agentrica: i nomi dei subagent dell'utente diventano «altro» e non partono.
 */
export function shareRows(records: readonly Usage[], agentIds: ReadonlyMap<string, string>, today: string): { rows: ShareRow[]; omitted: number } {
  const from = new Date(Date.parse(`${today}T00:00:00Z`) - (SHARE_DAYS - 1) * 86_400_000).toISOString().slice(0, 10);
  const groups = new Map<string, ShareRow>();
  for (const u of records) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(u.day) || u.day < from || u.day > today) continue;
    const agent = u.agent === MAIN ? MAIN : (agentIds.get(u.agent) ?? OTHER);
    const model = family(u.model) ?? OTHER;
    const effort = (SHARE_EFFORTS as readonly string[]).includes(u.effort) ? u.effort : OTHER;
    const id = [u.session, u.day, agent, model, effort].join("\n");
    let row = groups.get(id);
    if (!row) {
      const key = createHash("sha256").update(id).digest("hex");
      groups.set(id, (row = { key, day: u.day, agent, model, effort, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }));
    }
    row.input += u.input;
    row.output += u.output;
    row.cacheRead += u.cacheRead;
    row.cacheWrite += u.cacheWrite5m + u.cacheWrite1h;
  }
  const rows = [...groups.values()]
    .filter((r) => r.input + r.output + r.cacheRead + r.cacheWrite > 0)
    .sort((a, b) => b.day.localeCompare(a.day) || a.agent.localeCompare(b.agent) || a.model.localeCompare(b.model) || a.key.localeCompare(b.key));
  return { rows: rows.slice(0, MAX_SHARE_ROWS), omitted: Math.max(0, rows.length - MAX_SHARE_ROWS) };
}
