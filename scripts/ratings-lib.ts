// Calcoli di `npm run ratings` (F20-08): dalle righe della tabella `ratings` al riepilogo per agente e per versione.
// Funzioni pure, senza database: lo script le chiama sulle righe lette con il ruolo in sola lettura.

export interface RatingRow {
  agent_id: string;
  rating: number;
  comment: string;
  mcp_version: string;
  created_at: string;
}

export interface AgentSummary {
  agentId: string;
  count: number;
  mean: number;
  /** Voti da 1 a 5: distribution[0] conta gli 1. */
  distribution: [number, number, number, number, number];
  byVersion: { version: string; count: number; mean: number }[];
  comments: { rating: number; version: string; date: string; text: string }[];
}

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

/** Ordine semver semplice (x.y.z), le versioni più nuove prima. */
function newerFirst(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pb[i] ?? 0) - (pa[i] ?? 0);
  return 0;
}

/** Un riepilogo per agente, dalla media più bassa: in cima gli agenti da correggere. */
export function summarize(rows: readonly RatingRow[]): AgentSummary[] {
  const byAgent = Map.groupBy(rows, (r) => r.agent_id);
  return [...byAgent]
    .map(([agentId, list]) => {
      const distribution: AgentSummary["distribution"] = [0, 0, 0, 0, 0];
      for (const r of list) distribution[r.rating - 1]!++;
      const byVersion = [...Map.groupBy(list, (r) => r.mcp_version)]
        .map(([version, v]) => ({ version, count: v.length, mean: mean(v.map((r) => r.rating)) }))
        .sort((a, b) => newerFirst(a.version, b.version));
      const comments = list
        .filter((r) => r.comment.trim() !== "")
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((r) => ({ rating: r.rating, version: r.mcp_version, date: r.created_at.slice(0, 10), text: r.comment.trim() }));
      return { agentId, count: list.length, mean: mean(list.map((r) => r.rating)), distribution, byVersion, comments };
    })
    .sort((a, b) => a.mean - b.mean || b.count - a.count || a.agentId.localeCompare(b.agentId));
}

/** Righe di testo per il terminale: una testata per agente, le versioni, poi i commenti (il più recente prima). */
export function formatSummary(summaries: readonly AgentSummary[]): string[] {
  if (summaries.length === 0) return ["Nessuna valutazione."];
  const total = summaries.reduce((sum, s) => sum + s.count, 0);
  const lines = [`${total} ${total === 1 ? "valutazione" : "valutazioni"} per ${summaries.length} ${summaries.length === 1 ? "agente" : "agenti"}.`];
  for (const s of summaries) {
    lines.push("", `${s.agentId}  media ${s.mean.toFixed(2)}  su ${s.count}  [${s.distribution.map((n, i) => `${i + 1}★ ${n}`).join("  ")}]`);
    for (const v of s.byVersion) lines.push(`  ${v.version}: media ${v.mean.toFixed(2)} su ${v.count}`);
    for (const c of s.comments) lines.push(`  - ${c.date} ${c.rating}★ (${c.version}) ${c.text.replace(/\s+/g, " ")}`);
  }
  return lines;
}
