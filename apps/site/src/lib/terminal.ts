// Righe di un terminale finto e ritmo della scrittura (components/terminal.tsx). Logica pura, senza React.
import type { DepartmentCode } from "@agentrica/catalog";

/**
 * command: «$ …», scritto lettera per lettera; prompt: «> …», un messaggio nel client, scritto anche lui;
 * agent: sigla e nome in codice nel colore del reparto; output e ok: testo che compare intero; confirm: una domanda all'utente.
 */
export type LineKind = "command" | "prompt" | "agent" | "output" | "ok" | "confirm";

export interface TerminalLine {
  kind: LineKind;
  text: string;
  /** Per agent: «AISA-05 · SPICA» o la sola sigla del reparto. */
  label?: string;
  dept?: DepartmentCode;
  /** Passo del diagramma a cui appartiene la riga. */
  step?: number;
}

/** Righe complete e lettere scritte di quella in corso. */
export interface Progress {
  shown: number;
  typed: number;
}

const TYPED: ReadonlySet<LineKind> = new Set(["command", "prompt"]);
// Attesa prima che una riga compaia, in ms: la domanda di conferma si ferma di più.
const BEFORE: Record<LineKind, number> = { command: 500, prompt: 500, agent: 650, output: 300, ok: 300, confirm: 1100 };
const CHAR = 28;
// Al massimo tante battute per riga: un comando lungo scrive più lettere per battuta invece di durare di più.
const MAX_KEYSTROKES = 45;
const AFTER_TYPING = 400;

export function isTyped(line: TerminalLine): boolean {
  return TYPED.has(line.kind);
}

/** Il passo successivo della scrittura e quanto aspettare prima di farlo; null quando il copione è finito. */
export function advance(lines: readonly TerminalLine[], { shown, typed }: Progress): { next: Progress; delay: number } | null {
  const line = lines[shown];
  if (!line) return null;
  if (isTyped(line) && typed < line.text.length) {
    const chunk = Math.ceil(line.text.length / MAX_KEYSTROKES);
    return { next: { shown, typed: Math.min(typed + chunk, line.text.length) }, delay: typed === 0 ? BEFORE[line.kind] : CHAR };
  }
  return { next: { shown: shown + 1, typed: 0 }, delay: isTyped(line) ? AFTER_TYPING : BEFORE[line.kind] };
}

/** Passo del diagramma per lo stato dato: quello della riga in corso, o dell'ultima a fine copione. */
export function stepAt(lines: readonly TerminalLine[], { shown }: Progress): number | undefined {
  return lines[Math.min(shown, lines.length - 1)]?.step;
}
