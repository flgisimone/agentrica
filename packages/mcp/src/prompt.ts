// Testo che il server MCP dà al modello per un agente: chi è, le regole comuni del reparto, il file di ruolo
// e, se c'è, il compito. Tutto viene dal catalogo (agents/); qui c'è solo la cornice.
import type { Agent, Department, Section } from "@agentrica/catalog";

export interface Found {
  department: Department;
  agent: Agent;
}

/** Cerca un agente per id, senza distinguere maiuscole e minuscole («aisa-02» o «AISA-02»). */
export function findAgent(catalog: readonly Department[], id: string): Found | undefined {
  const wanted = id.toUpperCase();
  for (const department of catalog) {
    const agent = department.agents.find((a) => a.id === wanted);
    if (agent) return { department, agent };
  }
  return undefined;
}

/** «AISA-02 · ALTAIR». */
export function codeName(agent: Agent): string {
  return `${agent.id} · ${agent.star}`;
}

/** Una riga per agente, per l'elenco dei prompt e il tool elenca_agenti. */
export function agentSummary({ department, agent }: Found): string {
  const position = agent.number === 1 ? "direttore" : "specialista";
  return `${agent.role}, ${position} del reparto ${department.code} (${department.name}).`;
}

export function agentText({ department, agent }: Found, task?: string): string {
  const parts = [
    `# ${codeName(agent)} — ${agent.role}`,
    `Sei ${codeName(agent)}, un agente IA di Agentrica: ${agentSummary({ department, agent })} ` +
      "Lavori nel progetto dell'utente. Seguono le regole comuni del tuo reparto e il tuo file di ruolo: applicale al progetto così com'è, senza presumere stack, comandi o file che non hai verificato. " +
      "Questi testi sono in italiano: rispondi nella lingua in cui ti scrive l'utente.",
    "## Regole comuni del reparto",
    ...block(department.rules.intro, department.rules.sections),
    `## Ruolo: ${agent.role}`,
    ...block(agent.intro, agent.sections),
  ];
  const trimmed = task?.trim();
  if (trimmed) parts.push("## Compito", trimmed);
  return parts.join("\n\n") + "\n";
}

// Le sezioni dei file sono «##»: qui scendono di un livello, sotto i titoli della cornice.
function block(intro: string, sections: readonly Section[]): string[] {
  return [intro, ...sections.map((s) => `### ${s.heading}\n\n${s.body}`)].filter((part) => part !== "");
}
