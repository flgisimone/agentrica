// Testo che il server MCP dà al modello per un agente: chi è, le regole comuni del reparto, il file di ruolo
// e, se c'è, il compito. Tutto viene dal catalogo (agents/); qui c'è solo la cornice.
import { isExpired, type Agent, type Card, type Department, type Section } from "../../catalog/src/index.ts";
import { T } from "./texts/index.ts";

/** Versione del server, uguale a quella di package.json (lo controlla prompt.test.ts). */
export const VERSION = "0.9.0";

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

/** Nome del prompt (da 0.6.0): id in minuscolo e reparto, «aisa-02-software», così il menu dei comandi mostra il reparto. */
export function promptName({ department, agent }: Found): string {
  return `${agent.id.toLowerCase()}-${department.short.toLowerCase()}`;
}

/** Una riga per agente, per l'elenco dei prompt e il tool list_agents. */
export function agentSummary({ department, agent }: Found): string {
  const position = agent.number === 1 ? T.prompt.director : T.prompt.specialist;
  return T.prompt.summary(agent.role, position, department.code, department.name);
}

/**
 * La squadra di --agents: id di agenti e sigle di reparti separati da virgole, senza distinguere maiuscole
 * («aisa,aiwda-08»). Restituisce il catalogo ridotto alla squadra, nell'ordine del catalogo e senza doppioni;
 * senza elenco, tutto il catalogo. Un nome sconosciuto o un elenco vuoto è un errore che lo nomina.
 */
export function selectSquad(catalog: readonly Department[], spec?: string, form = false): SquadDepartment[] {
  if (spec === undefined) return catalog.map(({ director: _, ...d }) => d);
  const names = spec.split(",").map((name) => name.trim()).filter((name) => name !== "");
  if (names.length === 0) throw new Error(T.prompt.squadEmpty(form));
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
  if (unknown.length > 0) throw new Error(T.prompt.squadUnknown(unknown.map((n) => JSON.stringify(n)).join(", "), form));
  return catalog
    .map(({ director: _, ...d }) => ({ ...d, agents: d.agents.filter((a) => wanted.has(a.id)) }))
    .filter((d) => d.agents.length > 0);
}

/** La riga con cui l'agente si presenta: «AISA-02 · ALTAIR — Senior Software Architect, reparto AISA (Software)». */
export function introLine({ department, agent }: Found): string {
  return T.prompt.intro(codeName(agent), agent.role, department.code, department.name);
}

const MODEL_NAMES = { opus: "Opus", sonnet: "Sonnet", haiku: "Haiku" } as const;

/**
 * Il modello consigliato dal catalogo (F24), in una frase; niente per i ruoli non misurati («inherit»). La scelta resta
 * all'utente: il server non vede né sceglie il modello del client.
 */
export function modelAdvice(agent: Agent): string | undefined {
  if (agent.model === "inherit") return undefined;
  return T.prompt.model(MODEL_NAMES[agent.model]);
}

/** Oggi (AAAA-MM-GG, ora locale): serve a segnalare le schede da ricontrollare. */
export function today(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/**
 * La biblioteca del reparto nel testo dell'agente (F25-03): come usarla e l'indice delle schede (id, titolo, fonte,
 * versione, data). Le schede si leggono con il tool library; niente se il reparto non ha schede.
 */
export function libraryIndex({ department, agent }: Found, date: string): string[] {
  if (department.library.length === 0) return [];
  const lines = department.library.map((card) => {
    // Riga corta (F25, soglia di 10 KB): la fonte la dà il tool library. «*» segna le schede del ruolo.
    const mine = card.roles.includes(agent.id) ? " *" : "";
    const expired = isExpired(card, date) ? T.prompt.libraryExpired : "";
    return `- ${card.id}${mine}: ${card.title} (${card.version}, ${card.verified}${expired})`;
  });
  return [`## ${T.prompt.libraryHeading}`, T.prompt.libraryHelp(agent.id), lines.join("\n")];
}

/** Il testo di una scheda per il tool library: titolo, fonte senza URL, date, ruoli e le due sezioni. */
export function cardText(card: Card, date: string): string {
  const expired = isExpired(card, date) ? T.prompt.cardExpired : "";
  const { name, level } = card.source;
  return [
    `# ${card.title}`,
    T.prompt.cardSource({ name, level, version: card.version, verified: card.verified, review: card.review, expired, roles: card.roles.join(", ") }),
    `## ${T.prompt.notion}\n\n${card.notion}`,
    `## ${T.prompt.application}\n\n${card.application}`,
  ].join("\n\n");
}

export function agentText(
  found: Found,
  task?: string,
  { ratings = false, date = today() }: { ratings?: boolean; date?: string } = {},
): string {
  const { department, agent } = found;
  const advice = modelAdvice(agent);
  const parts = [
    `# ${codeName(agent)} — ${agent.role}`,
    T.prompt.you(codeName(agent), agentSummary({ department, agent })),
    ...(advice ? [T.prompt.subagent(advice)] : []),
    T.prompt.present(introLine(found)),
    `## ${T.prompt.rules}`,
    ...block(department.rules.intro, department.rules.sections),
    `## ${T.prompt.role(agent.role)}`,
    ...block(agent.intro, agent.sections),
    ...libraryIndex(found, date),
  ];
  const trimmed = task?.trim();
  if (trimmed) parts.push(`## ${T.prompt.task}`, trimmed);
  // In fondo (F23-03), dopo il compito: è l'ultima cosa che il modello legge. Solo se il client non ha l'elicitation;
  // con l'elicitation la valutazione la chiede il server con un modulo.
  if (ratings) parts.push(`## ${T.prompt.rating}`, T.prompt.ratingAsk(agent.id));
  return parts.join("\n\n") + "\n";
}

// Le sezioni dei file sono «##»: qui scendono di un livello, sotto i titoli della cornice.
function block(intro: string, sections: readonly Section[]): string[] {
  return [intro, ...sections.map((s) => `### ${s.heading}\n\n${s.body}`)].filter((part) => part !== "");
}
