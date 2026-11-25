// Testo che il server MCP dà al modello per un agente: chi è, le regole comuni del reparto, il file di ruolo
// e, se c'è, il compito. Tutto viene dal catalogo (agents/); qui c'è solo la cornice.
import { isExpired, type Agent, type Card, type Department, type Section } from "../../catalog/src/index.ts";
import { T } from "./texts/index.ts";

/** Versione del server, uguale a quella di package.json (lo controlla prompt.test.ts). */
export const VERSION = "0.13.0";

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

/** Il direttore del reparto nella squadra: è l'agente 01, assente se --agents l'ha lasciato fuori. */
export function directorOf(department: SquadDepartment): Agent | undefined {
  return department.agents.find((a) => a.number === 1);
}

/** Il posto dell'agente nella gerarchia (F34-04): il direttore coordina, lo specialista riporta al direttore. */
function hierarchy({ department, agent }: Found): string {
  if (agent.number === 1) return T.prompt.lead(department.code);
  const director = directorOf(department);
  return director ? T.prompt.reportsTo(codeName(director), director.id) : T.prompt.noLead;
}

/** I componenti del testo di un agente, nell'ordine (F40-01): la misura di --sizes viene da qui, non da una copia. */
export const COMPONENTS = ["frame", "rules", "role", "library", "task", "closing"] as const;
export type Component = (typeof COMPONENTS)[number];
export type TextOptions = { ratings?: boolean; report?: boolean; date?: string };

/** Il testo di un agente diviso per componente: ogni voce ha i suoi paragrafi, uniti poi da agentText. */
export function agentParts(found: Found, task?: string, { ratings = false, report = false, date = today() }: TextOptions = {}): [Component, string[]][] {
  const { department, agent } = found;
  const advice = modelAdvice(agent);
  const trimmed = task?.trim();
  return [
    [
      "frame",
      [
        `# ${codeName(agent)} — ${agent.role}`,
        T.prompt.you(codeName(agent), agentSummary({ department, agent })),
        hierarchy(found),
        ...(advice ? [T.prompt.subagent(advice)] : []),
        T.prompt.present(introLine(found)),
      ],
    ],
    ["rules", [`## ${T.prompt.rules}`, ...block(department.rules.intro, department.rules.sections)]],
    ["role", [`## ${T.prompt.role(agent.role)}`, ...block(agent.intro, agent.sections)]],
    ["library", libraryIndex(found, date)],
    ["task", trimmed ? [`## ${T.prompt.task}`, trimmed] : []],
    // In fondo (F23-03), dopo il compito: è l'ultima cosa che il modello legge. La valutazione solo se il client non ha
    // l'elicitation (con l'elicitation la chiede il server con un modulo); con il pannello, prima il resoconto (tool report).
    [
      "closing",
      [...(report ? [`## ${T.prompt.report}`, T.prompt.reportAsk(agent.id)] : []), ...(ratings ? [`## ${T.prompt.rating}`, T.prompt.ratingAsk(agent.id)] : [])],
    ],
  ];
}

export function agentText(found: Found, task?: string, options: TextOptions = {}): string {
  return agentParts(found, task, options).flatMap(([, parts]) => parts).join("\n\n") + "\n";
}

/**
 * Byte di ogni componente nel testo di agentText (F40-01). Ogni paragrafo conta con il separatore che lo segue («\n\n»,
 * «\n» per l'ultimo), così la somma è la lunghezza del testo.
 */
export function agentSizes(found: Found, task?: string, options: TextOptions = {}): Record<Component, number> {
  const parts = agentParts(found, task, options);
  const sizes = Object.fromEntries(COMPONENTS.map((c) => [c, 0])) as Record<Component, number>;
  for (const [component, texts] of parts) for (const text of texts) sizes[component] += Buffer.byteLength(text) + 2;
  sizes[parts.findLast(([, texts]) => texts.length > 0)![0]] -= 1;
  return sizes;
}

/** Il testo di list_agents: reparti, direttore e agenti della squadra, o di un reparto solo. */
export function agentList(catalog: readonly SquadDepartment[], department?: string): string {
  return catalog
    .filter((d) => !department || d.code === department)
    .flatMap((d) => [
      `## ${d.code} — ${d.name}`,
      d.summary,
      ...[directorOf(d)].filter((a) => a !== undefined).map((a) => T.server.listAgents.lead(codeName(a))),
      ...d.agents.map((agent) => [`- ${codeName(agent)}: ${agentSummary({ department: d, agent })}`, modelAdvice(agent)].filter(Boolean).join(" ")),
      "",
    ])
    .join("\n");
}

// Le sezioni dei file sono «##»: qui scendono di un livello, sotto i titoli della cornice.
function block(intro: string, sections: readonly Section[]): string[] {
  return [intro, ...sections.map((s) => `### ${s.heading}\n\n${s.body}`)].filter((part) => part !== "");
}
