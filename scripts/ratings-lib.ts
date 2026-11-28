// Calcoli di `npm run ratings` (F20-08, F21-06): dalle righe della tabella `ratings` al riepilogo per agente e per
// versione, alle anomalie e ai comandi di moderazione. Funzioni pure, senza database: lo script le chiama sulle righe
// lette con il ruolo in sola lettura o con quello del moderatore.

export interface RatingRow {
  usage_id: string;
  agent_id: string;
  rating: number;
  comment: string;
  mcp_version: string;
  created_at: string;
  publish_consent: boolean;
  comment_status: "pending" | "approved" | "rejected";
  /** Voto anomalo escluso dalle medie (F21): resta nel database, non conta. */
  excluded: boolean;
}

export interface AgentSummary {
  agentId: string;
  /** Solo i voti non esclusi. */
  count: number;
  mean: number;
  excluded: number;
  /** Voti da 1 a 5: distribution[0] conta gli 1. */
  distribution: [number, number, number, number, number];
  byVersion: { version: string; count: number; mean: number }[];
  comments: { rating: number; version: string; date: string; status: string; text: string }[];
}

const mean = (values: number[]) => (values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0);

/** Ordine semver semplice (x.y.z), le versioni più nuove prima. */
function newerFirst(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pb[i] ?? 0) - (pa[i] ?? 0);
  return 0;
}

/** Stato di un commento per il titolare: privato senza consenso, altrimenti lo stato della moderazione. */
export function commentStatus(r: Pick<RatingRow, "publish_consent" | "comment_status">): string {
  if (!r.publish_consent) return "privato";
  return { pending: "in attesa", approved: "pubblicato", rejected: "rifiutato" }[r.comment_status];
}

/** Un riepilogo per agente, dalla media più bassa: in cima gli agenti da correggere. I voti esclusi non contano. */
export function summarize(rows: readonly RatingRow[]): AgentSummary[] {
  const byAgent = Map.groupBy(rows, (r) => r.agent_id);
  return [...byAgent]
    .map(([agentId, all]) => {
      const list = all.filter((r) => !r.excluded);
      const distribution: AgentSummary["distribution"] = [0, 0, 0, 0, 0];
      for (const r of list) distribution[r.rating - 1]!++;
      const byVersion = [...Map.groupBy(list, (r) => r.mcp_version)]
        .map(([version, v]) => ({ version, count: v.length, mean: mean(v.map((r) => r.rating)) }))
        .sort((a, b) => newerFirst(a.version, b.version));
      const comments = list
        .filter((r) => r.comment.trim() !== "")
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((r) => ({
          rating: r.rating,
          version: r.mcp_version,
          date: r.created_at.slice(0, 10),
          status: commentStatus(r),
          text: r.comment.trim(),
        }));
      return {
        agentId,
        count: list.length,
        mean: mean(list.map((r) => r.rating)),
        excluded: all.length - list.length,
        distribution,
        byVersion,
        comments,
      };
    })
    .sort((a, b) => a.mean - b.mean || b.count - a.count || a.agentId.localeCompare(b.agentId));
}

/** Righe di testo per il terminale: una testata per agente, le versioni, poi i commenti (il più recente prima). */
export function formatSummary(summaries: readonly AgentSummary[]): string[] {
  if (summaries.length === 0) return ["Nessuna valutazione."];
  const total = summaries.reduce((sum, s) => sum + s.count, 0);
  const lines = [`${total} ${total === 1 ? "valutazione" : "valutazioni"} per ${summaries.length} ${summaries.length === 1 ? "agente" : "agenti"}.`];
  for (const s of summaries) {
    const excluded = s.excluded ? `  esclusi ${s.excluded}` : "";
    const average = s.count ? s.mean.toFixed(2) : "–";
    lines.push("", `${s.agentId}  media ${average}  su ${s.count}  [${s.distribution.map((n, i) => `${i + 1}★ ${n}`).join("  ")}]${excluded}`);
    for (const v of s.byVersion) lines.push(`  ${v.version}: media ${v.mean.toFixed(2)} su ${v.count}`);
    for (const c of s.comments) lines.push(`  - ${c.date} ${c.rating}★ (${c.version}) [${c.status}] ${c.text.replace(/\s+/g, " ")}`);
  }
  return lines;
}

// --- Anomalie (F21): da controllare a mano ed eventualmente escludere con --exclude. Nessuna esclusione automatica.

/** Picco: almeno SPIKE_VOTES voti allo stesso agente entro SPIKE_WINDOW_MS. */
export const SPIKE_VOTES = 5;
export const SPIKE_WINDOW_MS = 60 * 60 * 1000;

export interface Anomaly {
  kind: "picco" | "commento duplicato";
  detail: string;
  usageIds: string[];
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

/** Picchi di voti per agente e commenti uguali dopo la normalizzazione, fra i voti non ancora esclusi. */
export function findAnomalies(rows: readonly RatingRow[]): Anomaly[] {
  const valid = rows.filter((r) => !r.excluded);
  const anomalies: Anomaly[] = [];

  for (const [agentId, list] of Map.groupBy(valid, (r) => r.agent_id)) {
    const sorted = list.toSorted((a, b) => a.created_at.localeCompare(b.created_at));
    const time = sorted.map((r) => Date.parse(r.created_at));
    for (let i = 0; i < sorted.length; ) {
      let j = i;
      while (j + 1 < sorted.length && time[j + 1]! - time[i]! < SPIKE_WINDOW_MS) j++;
      if (j - i + 1 >= SPIKE_VOTES) {
        anomalies.push({
          kind: "picco",
          detail: `${agentId}: ${j - i + 1} voti dalle ${sorted[i]!.created_at.slice(0, 16).replace("T", " ")} in meno di un'ora`,
          usageIds: sorted.slice(i, j + 1).map((r) => r.usage_id),
        });
        i = j + 1;
      } else i++;
    }
  }

  const withText = valid.filter((r) => normalize(r.comment) !== "");
  for (const [text, list] of Map.groupBy(withText, (r) => normalize(r.comment))) {
    if (list.length < 2) continue;
    const agents = [...new Set(list.map((r) => r.agent_id))].join(", ");
    anomalies.push({
      kind: "commento duplicato",
      detail: `${list.length} volte (${agents}): «${text.slice(0, 60)}»`,
      usageIds: list.map((r) => r.usage_id),
    });
  }
  return anomalies;
}

export function formatAnomalies(anomalies: readonly Anomaly[]): string[] {
  if (anomalies.length === 0) return [];
  const lines = ["", `Anomalie da controllare (${anomalies.length}): per escludere un voto, npm run ratings -- --exclude <codice>`];
  for (const a of anomalies) {
    lines.push(`  ${a.kind}: ${a.detail}`);
    for (const id of a.usageIds) lines.push(`    ${id}`);
  }
  return lines;
}

// --- Comandi (F21): moderazione con il ruolo ratings_moderator, che può solo chiamare moderate_rating.

export type Action = "approve" | "reject" | "exclude" | "include" | "revoke" | "delete";

export type Command =
  | { kind: "summary" }
  | { kind: "moderate" }
  | { kind: "action"; action: Action; usageId: string }
  | { kind: "usage" };

const FLAGS: Record<string, Action> = {
  "--exclude": "exclude",
  "--include": "include",
  "--revoke": "revoke",
  "--delete": "delete",
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function parseCommand(args: readonly string[]): Command {
  if (args.length === 0) return { kind: "summary" };
  if (args.length === 1 && args[0] === "--moderate") return { kind: "moderate" };
  const action = FLAGS[args[0] ?? ""];
  const usageId = args[1]?.trim().toLowerCase();
  if (args.length === 2 && action && usageId && UUID.test(usageId)) return { kind: "action", action, usageId };
  return { kind: "usage" };
}

export const USAGE = [
  "Uso:",
  "  npm run ratings                           riepilogo e anomalie (DATABASE_URL_READONLY)",
  "  npm run ratings -- --moderate             commenti in attesa, uno per volta (DATABASE_URL_MODERATOR)",
  "  npm run ratings -- --exclude <codice>     esclude un voto anomalo dalle medie",
  "  npm run ratings -- --include <codice>     lo rimette nelle medie",
  "  npm run ratings -- --revoke <codice>      l'utente ritira il consenso: il commento non si pubblica, il voto resta",
  "  npm run ratings -- --delete <codice>      l'utente chiede di cancellare la valutazione",
];

/** Esito di moderate_rating (aigentrica-site/db/002-reputation.sql) in italiano. */
export function resultMessage(result: unknown): string {
  switch (result) {
    case "ok":
      return "Fatto. Il sito si aggiorna entro un'ora.";
    case "not_found":
      return "Nessuna valutazione con questo codice.";
    case "not_publishable":
      return "Questa valutazione non ha un commento con il consenso alla pubblicazione.";
    default:
      return `Esito inatteso: ${String(result)}`;
  }
}
