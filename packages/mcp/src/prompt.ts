// Testo che il server MCP dà al modello per un agente: chi è, le regole comuni del reparto, il file di ruolo
// e, se c'è, il compito. Tutto viene dal catalogo (agents/); qui c'è solo la cornice.
import type { Agent, Department, Section } from "../../catalog/src/index.ts";

/** Versione del server, uguale a quella di package.json (lo controlla prompt.test.ts). */
export const VERSION = "0.3.1";

/**
 * Un reparto della squadra di --agents. Non ha `director`: con un reparto filtrato il direttore può essere fuori
 * squadra, così il tipo impedisce di usarlo senza controllare (rilievo di F12).
 */
export type SquadDepartment = Omit<Department, "director">;

export interface Found {
  department: SquadDepartment;
  agent: Agent;
}

/** Cerca un agente per id, senza distinguere maiuscole e minuscole («aisa-02» o «AISA-02»). */
export function findAgent(catalog: readonly SquadDepartment[], id: string): Found | undefined {
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

/**
 * La squadra di --agents: id di agenti e sigle di reparti separati da virgole, senza distinguere maiuscole
 * («aisa,aiwda-08»). Restituisce il catalogo ridotto alla squadra, nell'ordine del catalogo e senza doppioni;
 * senza elenco, tutto il catalogo. Un nome sconosciuto o un elenco vuoto è un errore che lo nomina.
 */
export function selectSquad(catalog: readonly Department[], spec?: string): SquadDepartment[] {
  if (spec === undefined) return catalog.map(({ director: _, ...d }) => d);
  const names = spec.split(",").map((name) => name.trim()).filter((name) => name !== "");
  if (names.length === 0) throw new Error("--agents è vuoto: indica id di agenti o sigle di reparti, es. --agents aisa,aiwda-08");
  const wanted = new Set<string>();
  const unknown: string[] = [];
  for (const name of names) {
    const department = catalog.find((d) => d.code === name.toUpperCase());
    const found = department ? undefined : findAgent(catalog, name);
    if (department) for (const agent of department.agents) wanted.add(agent.id);
    else if (found) wanted.add(found.agent.id);
    else unknown.push(name);
  }
  // Fra virgolette (JSON.stringify), così nei log del client si vedono anche spazi e caratteri strani.
  if (unknown.length > 0) throw new Error(`agente o reparto sconosciuto in --agents: ${unknown.map((n) => JSON.stringify(n)).join(", ")}`);
  return catalog
    .map(({ director: _, ...d }) => ({ ...d, agents: d.agents.filter((a) => wanted.has(a.id)) }))
    .filter((d) => d.agents.length > 0);
}

export function agentText({ department, agent }: Found, task?: string): string {
  const parts = [
    `# ${codeName(agent)} — ${agent.role}`,
    `Sei ${codeName(agent)}, un agente IA di Agentrica: ${agentSummary({ department, agent })} ` +
      "Lavori nel progetto dell'utente. Seguono le regole comuni del tuo reparto e il tuo file di ruolo: applicale al progetto così com'è, senza presumere stack, comandi o file che non hai verificato. " +
      "Se il progetto è vuoto o manca ciò che il tuo ruolo deve esaminare, dillo e proponi i primi passi (obiettivo, stack, struttura) da confermare con l'utente; non inventare rilievi né scegliere lo stack da solo. " +
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
