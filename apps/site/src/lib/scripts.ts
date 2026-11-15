// Copioni dei due terminali della landing: la simulazione in «Come lavoriamo» e la dimostrazione del server MCP.
// Nomi in codice e ruoli vengono dal catalogo; il copione della simulazione è quello confermato dall'utente (plan/08-sezioni.md).
import type { Agent, Department, DepartmentCode } from "@agentrica/catalog";
import type { TerminalLine } from "./terminal.ts";

export interface FlowNode {
  label: string;
  detail?: string;
  dept?: DepartmentCode;
  /** «La tua conferma»: in evidenza nel diagramma. */
  confirm?: boolean;
  /** Reparto non necessario per questo compito. */
  skipped?: boolean;
}

function find(catalog: readonly Department[], id: string): Agent {
  const agent = catalog.flatMap((d) => d.agents).find((a) => a.id === id);
  if (!agent) throw new Error(`copione: agente ${id} non nel catalogo`);
  return agent;
}

function agentLine(catalog: readonly Department[], id: string, step: number, text?: string): TerminalLine {
  const agent = find(catalog, id);
  return { kind: "agent", label: `${agent.id} · ${agent.star}`, text: text ?? agent.role, dept: agent.department, step };
}

export const flowNodes: readonly FlowNode[] = [
  { label: "La tua richiesta" },
  { label: "Business", detail: "obiettivo e requisiti", dept: "AIBPD" },
  { label: "Design", detail: "rilievi di interfaccia e accessibilità", dept: "AIWDA" },
  { label: "Privacy", detail: "saltata: nessun dato personale", dept: "AIPCA", skipped: true },
  { label: "La tua conferma", detail: "su requisiti e rilievi", confirm: true },
  { label: "Software", detail: "branch, sviluppo, test e verify", dept: "AISA" },
  { label: "Revisione del codice", detail: "il Code Reviewer sul diff", dept: "AISA" },
  { label: "La tua conferma", detail: "su commit e merge", confirm: true },
];

/** Il compito di F9, i simboli degli agenti, rifatto con i passi del metodo. */
export function simulationScript(catalog: readonly Department[]): TerminalLine[] {
  return [
    { kind: "command", text: 'claude "Dai a ogni agente un simbolo calcolato dal nome della stella"', step: 0 },
    agentLine(catalog, "AIBPD-04", 1),
    { kind: "output", text: "Obiettivo: un glifo diverso per agente, sempre uguale fra un build e l'altro.", step: 1 },
    agentLine(catalog, "AIWDA-05", 2),
    agentLine(catalog, "AIWDA-08", 2),
    { kind: "output", text: "Rilievo: il nome in codice resta accanto al simbolo; tratto ≥ 3:1 sul fondo.", step: 2 },
    { kind: "agent", label: "AIPCA", text: "saltata: nessun dato personale nel compito.", dept: "AIPCA", step: 3 },
    { kind: "confirm", text: "Confermi requisiti e rilievi? › Sì", step: 4 },
    { kind: "command", text: "git switch -c fase/f9-simboli", step: 5 },
    agentLine(catalog, "AISA-05", 5),
    { kind: "output", text: "Generatore del glifo in lib/ e componente StarGlyph.", step: 5 },
    agentLine(catalog, "AISA-08", 5),
    { kind: "output", text: "Test: 56 glifi distinti, stesso nome stesso disegno; axe.", step: 5 },
    { kind: "command", text: "npm run verify", step: 5 },
    { kind: "ok", text: "✓ typecheck  ✓ lint  ✓ test  ✓ build", step: 5 },
    agentLine(catalog, "AISA-12", 6),
    { kind: "output", text: "Esito sul diff: APPROVE.", step: 6 },
    { kind: "confirm", text: "Commit e merge in develop? › Sì", step: 7 },
    { kind: "command", text: 'git commit -m "F9: simboli degli agenti"', step: 7 },
    { kind: "command", text: "git switch develop && git merge fase/f9-simboli", step: 7 },
  ];
}

/** Comandi del README di packages/mcp, uguali carattere per carattere. */
export const mcp = {
  add: "claude mcp add agentrica -- npx -y @agentrica/mcp@0.2.1",
  squad: "claude mcp add agentrica -- npx -y @agentrica/mcp@0.2.1 --agents aisa,aiwda-08",
  use: '/mcp__agentrica__aisa-02 "Rivedi i confini fra i moduli di src/"',
} as const;

/** Claude Code con il prompt aisa-02: le istruzioni che il server dà al modello, abbreviate, con i titoli di packages/mcp/src/prompt.ts. */
export function mcpDemoScript(catalog: readonly Department[]): TerminalLine[] {
  const agent = find(catalog, "AISA-02");
  const mission = agent.sections[0];
  if (!mission) throw new Error("copione: AISA-02 senza sezioni");
  const firstSentence = mission.body.split(/(?<=\.)\s/)[0]!;
  return [
    { kind: "command", text: mcp.add },
    { kind: "command", text: "claude" },
    { kind: "prompt", text: mcp.use },
    agentLine(catalog, "AISA-02", 0, `${agent.role}, istruzioni dal server (abbreviate):`),
    { kind: "output", text: "## Regole comuni del reparto" },
    { kind: "output", text: `## Ruolo: ${agent.role}` },
    { kind: "output", text: `### ${mission.heading}` },
    { kind: "output", text: `${firstSentence} …` },
    { kind: "output", text: "## Compito" },
    { kind: "output", text: "Rivedi i confini fra i moduli di src/" },
  ];
}
