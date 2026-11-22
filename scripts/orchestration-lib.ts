// Controllo dell'orchestrazione su un transcript di Claude Code (F34-01): dalla sessione principale tiene solo le chiamate
// ai tool, in ordine, e verifica i criteri del caso examples/casi/orchestrazione-newsletter.md. Dei testi non tiene nulla.

export interface Call {
  /** Id del messaggio del modello: due chiamate con lo stesso id sono partite insieme. */
  message: string;
  name: string;
  /** Id dell'agente per il tool `agent` del server (in maiuscolo), tipo del subagent per il tool `Agent`. */
  target?: string;
}

/** Ordine fra reparti di AGENTS.md: business → design → privacy → software (la sicurezza dopo la privacy). */
export const ORDER = ["AIBPD", "AIWDA", "AIPCA", "AICA", "AISA"] as const;

const isServerAgent = (name: string) => /^mcp__.+__agent$/.test(name);
const isSubagent = (name: string) => name === "Agent" || name === "Task";
const isConfirmation = (name: string) => name === "AskUserQuestion" || /^mcp__.+__ask_user$/.test(name);

/** Le chiamate ai tool della sessione principale, dalle righe di un file .jsonl. */
export function toolCalls(lines: Iterable<string>): Call[] {
  const calls: Call[] = [];
  for (const line of lines) {
    if (!line.includes('"tool_use"')) continue;
    let row: Record<string, unknown>;
    try {
      row = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (row.type !== "assistant" || row.isSidechain === true) continue;
    const message = row.message as { id?: unknown; content?: unknown } | undefined;
    if (!Array.isArray(message?.content)) continue;
    for (const block of message.content as Record<string, unknown>[]) {
      if (block.type !== "tool_use" || typeof block.name !== "string") continue;
      const input = (block.input ?? {}) as Record<string, unknown>;
      const raw = isServerAgent(block.name) ? input.id : isSubagent(block.name) ? input.subagent_type : undefined;
      calls.push({
        message: String(message.id ?? row.uuid ?? calls.length),
        name: block.name,
        ...(typeof raw === "string" ? { target: isServerAgent(block.name) ? raw.toUpperCase() : raw } : {}),
      });
    }
  }
  return calls;
}

export interface Check {
  criterion: string;
  ok: boolean;
  detail: string;
}

const department = (id: string) => id.split("-")[0]!;

/** I criteri del caso. `subagentsAsked`: l'utente ha chiesto i subagent, quindi il tool `Agent` è ammesso. */
export function checkOrchestration(calls: readonly Call[], subagentsAsked = false): Check[] {
  const agents = calls.filter((c) => isServerAgent(c.name) && c.target);
  const ids = agents.map((c) => c.target!);
  const subagents = calls.filter((c) => isSubagent(c.name));
  const firstList = calls.findIndex((c) => /^mcp__.+__list_agents$/.test(c.name));
  const firstAgent = calls.findIndex((c) => isServerAgent(c.name));

  const parallel = new Set(agents.map((c) => c.message).filter((m, i, all) => all.indexOf(m) !== i));

  const wrongLead: string[] = [];
  for (const code of new Set(ids.map(department))) {
    const first = ids.find((id) => department(id) === code)!;
    if (!first.endsWith("-01")) wrongLead.push(`${code}: primo ${first}`);
  }

  const firstSeen = [...new Set(ids.map(department))];
  const known = firstSeen.filter((code) => (ORDER as readonly string[]).includes(code));
  const inOrder = known.every((code, i) => i === 0 || ORDER.indexOf(code as never) > ORDER.indexOf(known[i - 1] as never));

  // La conferma serve prima che il software lavori: il direttore AISA-01 può prepararla e chiederla, lo specialista no.
  const firstSoftware = calls.findIndex((c) => isServerAgent(c.name) && c.target && department(c.target) === "AISA" && !c.target.endsWith("-01"));
  const before = firstSoftware < 0 ? [] : calls.slice(0, firstSoftware);
  const othersBefore = before.some((c) => isServerAgent(c.name) && c.target && department(c.target) !== "AISA");
  // Dopo l'ultimo agente degli altri reparti (il direttore software può stare in mezzo).
  const lastOther = before.findLastIndex((c) => isServerAgent(c.name) && c.target !== undefined && department(c.target) !== "AISA");
  const confirmed = !othersBefore || before.slice(lastOther).some((c) => isConfirmation(c.name));

  return [
    {
      criterion: "Nessun subagent senza richiesta",
      ok: subagentsAsked || subagents.length === 0,
      detail: subagents.length === 0 ? "0 chiamate ad Agent" : `${subagents.length} chiamate ad Agent: ${subagents.map((c) => c.target ?? "?").join(", ")}`,
    },
    {
      criterion: "list_agents prima di agent",
      ok: firstAgent >= 0 && firstList >= 0 && firstList < firstAgent,
      detail: firstAgent < 0 ? "nessuna chiamata ad agent" : firstList < 0 ? "list_agents mai chiamato" : `list_agents alla chiamata ${firstList + 1}, agent alla ${firstAgent + 1}`,
    },
    {
      criterion: "Direttore prima degli specialisti",
      ok: ids.length > 0 && wrongLead.length === 0,
      detail: wrongLead.length === 0 ? `agenti: ${ids.join(" → ") || "nessuno"}` : wrongLead.join("; "),
    },
    {
      criterion: "Un agente alla volta",
      ok: parallel.size === 0,
      detail: parallel.size === 0 ? "nessun messaggio con più di un agent" : `${parallel.size} messaggi con più agent insieme`,
    },
    {
      criterion: "Ordine fra reparti",
      ok: inOrder,
      detail: `reparti nell'ordine: ${firstSeen.join(" → ") || "nessuno"}`,
    },
    {
      criterion: "Conferma dell'utente prima del software",
      ok: confirmed,
      detail: firstSoftware < 0 ? "nessuno specialista software" : confirmed ? "domanda all'utente prima del primo specialista software" : "nessuna domanda fra gli altri reparti e lo specialista software",
    },
  ];
}
