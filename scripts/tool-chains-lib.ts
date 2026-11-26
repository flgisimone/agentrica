// Catene di chiamate ai tool di Agentrica nei file di sessione di Claude Code (F45-01). Di ogni riga si tengono solo
// il nome del tool, il chiamante e i byte del risultato: testi, input e id di sessione non escono da qui.

/** Una chiamata a un tool di Agentrica: nome senza il prefisso del server, chiamante, byte del testo restituito. */
export interface Call {
  tool: string;
  caller: string;
  bytes: number;
  error: boolean;
}

/** Le chiamate ad Agentrica fra un messaggio dell'utente e il successivo, in ordine. */
export type Chain = Call[];

/**
 * «mcp__agentrica-dev__agent» → «agent»; undefined se il server non è Agentrica. Senza `server` conta i server con
 * «agentrica» nel nome, come nelle configurazioni dello starter e del README; con `server` (opzione --server, F48-04)
 * solo quello con quel nome esatto, per chi l'ha registrato in un altro modo.
 */
export function agentricaTool(name: unknown, server?: string): string | undefined {
  if (typeof name !== "string") return undefined;
  const [prefix, named, ...rest] = name.split("__");
  const tool = rest.join("__");
  const ours = server === undefined ? /agentrica/i.test(named ?? "") : named === server;
  return prefix === "mcp" && named !== undefined && ours && /^[\w-]{1,64}$/.test(tool) ? tool : undefined;
}

type Block = Record<string, unknown>;

const blocks = (content: unknown): Block[] => (Array.isArray(content) ? content.filter((b): b is Block => typeof b === "object" && b !== null) : []);

/** Byte UTF-8 del testo di un risultato: una stringa, o i blocchi di tipo text (le immagini non contano). */
function resultBytes(content: unknown): number {
  if (typeof content === "string") return Buffer.byteLength(content);
  return blocks(content).reduce((n, b) => n + (b.type === "text" && typeof b.text === "string" ? Buffer.byteLength(b.text) : 0), 0);
}

/** Un messaggio scritto dall'utente: non un risultato di tool, non un testo aggiunto da Claude Code (isMeta, riassunti). */
function isUserTurn(r: Record<string, unknown>, content: unknown): boolean {
  if (r.type !== "user" || r.isMeta === true || r.isCompactSummary === true) return false;
  return typeof content === "string" || blocks(content).some((b) => b.type !== "tool_result");
}

/** Le catene di un file di sessione (conversazione principale o subagent), dalle sue righe in ordine. */
export function fileChains(lines: Iterable<string>, server?: string): Chain[] {
  const mark = server === undefined ? "agentrica" : `mcp__${server}__`;
  const chains: Chain[] = [];
  let current: Chain = [];
  const pending = new Map<string, Call>();
  const close = () => {
    if (current.length > 0) chains.push(current);
    current = [];
  };
  for (const line of lines) {
    // Le righe che non sono dell'utente e non nominano Agentrica non servono: non si analizzano nemmeno.
    if (!line.includes('"user"') && !line.includes(mark)) continue;
    let r: Record<string, unknown>;
    try {
      const o: unknown = JSON.parse(line);
      if (typeof o !== "object" || o === null) continue;
      r = o as Record<string, unknown>;
    } catch {
      continue;
    }
    const content = (r.message as Record<string, unknown> | undefined)?.content;
    if (isUserTurn(r, content)) {
      close();
      continue;
    }
    for (const b of blocks(content)) {
      if (r.type === "assistant" && b.type === "tool_use") {
        const tool = agentricaTool(b.name, server);
        if (tool === undefined || typeof b.id !== "string") continue;
        const callerType = (b.caller as Record<string, unknown> | undefined)?.type;
        const call: Call = { tool, caller: typeof callerType === "string" && /^[\w-]{1,32}$/.test(callerType) ? callerType : "non indicato", bytes: 0, error: false };
        current.push(call);
        pending.set(b.id, call);
      } else if (r.type === "user" && b.type === "tool_result" && typeof b.tool_use_id === "string") {
        const call = pending.get(b.tool_use_id);
        if (!call) continue;
        call.bytes = resultBytes(b.content);
        call.error = b.is_error === true;
        pending.delete(b.tool_use_id);
      }
    }
  }
  close();
  return chains;
}

/** Le catene di una sessione: della conversazione principale e dei suoi subagent, ognuno con le sue. */
export interface SessionChains {
  chains: Chain[];
  subagentChains: number; // quante di queste catene vengono dai subagent
}

/** Soglia di F45 per riaprire Code Mode (decisione dell'utente del 2026-11-25). */
export const THRESHOLD = { chainLength: 4, sessionsShare: 0.2, intermediateShare: 0.3 } as const;

/**
 * Tool che restituiscono istruzioni: il modello le deve leggere per lavorare come quell'agente, quindi non sono dati
 * intermedi che Code Mode potrebbe filtrare (decisione dell'utente del 2026-11-25). `agente` è il vecchio nome di `agent`.
 */
export const INSTRUCTION_TOOLS: ReadonlySet<string> = new Set(["agent", "agente", "library"]);

/** Un risultato è intermedio se un'altra chiamata ad Agentrica lo segue nella stessa catena e non è un testo di istruzioni. */
/**
 * Chiamate che un programma potrebbe fare da solo, senza il modello e senza l'utente: niente testi di istruzioni e
 * niente `ask_user`, che aspetta la risposta dell'utente (decisione dell'utente del 2026-11-25). Solo queste contano
 * nella lunghezza di una catena per la soglia.
 */
export const programmableCalls = (chain: Chain): number => chain.filter((c) => !INSTRUCTION_TOOLS.has(c.tool) && c.tool !== "ask_user").length;

const isIntermediate = (chain: Chain, i: number): boolean => i < chain.length - 1 && !INSTRUCTION_TOOLS.has(chain[i]!.tool);

/** Byte intermedi di una catena: ciò che Code Mode potrebbe togliere dal contesto, al più. */
export const intermediateBytes = (chain: Chain): number => chain.reduce((n, c, i) => n + (isIntermediate(chain, i) ? c.bytes : 0), 0);

const chainBytes = (chain: Chain): number => chain.reduce((n, c) => n + c.bytes, 0);

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export interface ChainStats {
  projects: number;
  sessions: number; // sessioni con almeno una chiamata ad Agentrica
  chains: number;
  calls: number;
  bytes: number;
  intermediate: number;
  /** Catene per lunghezza: 1, 2, 3, 4–5, 6 e oltre. */
  lengths: Record<string, number>;
  longSessions: number; // sessioni con almeno una catena di THRESHOLD.chainLength chiamate programmabili
  medianIntermediateShare: number;
  byTool: { tool: string; calls: number; bytes: number; intermediate: number; errors: number }[];
  byCaller: { caller: string; calls: number }[];
  subagentChains: number;
  skipped: number;
}

const BUCKETS = ["1", "2", "3", "4–5", "6+"] as const;
const bucket = (n: number): string => (n <= 3 ? String(n) : n <= 5 ? "4–5" : "6+");

export function chainStats(sessions: readonly SessionChains[], projects: number, skipped: number): ChainStats {
  const lengths: Record<string, number> = Object.fromEntries(BUCKETS.map((b) => [b, 0]));
  const tools = new Map<string, { calls: number; bytes: number; intermediate: number; errors: number }>();
  const callers = new Map<string, number>();
  const shares: number[] = [];
  let chains = 0, calls = 0, bytes = 0, intermediate = 0, longSessions = 0, subagentChains = 0, active = 0;
  for (const s of sessions) {
    if (s.chains.length === 0) continue;
    active++;
    subagentChains += s.subagentChains;
    let sBytes = 0, sIntermediate = 0;
    for (const chain of s.chains) {
      chains++;
      lengths[bucket(chain.length)]!++;
      sBytes += chainBytes(chain);
      sIntermediate += intermediateBytes(chain);
      chain.forEach((c, i) => {
        calls++;
        const t = tools.get(c.tool) ?? { calls: 0, bytes: 0, intermediate: 0, errors: 0 };
        t.calls++;
        t.bytes += c.bytes;
        if (isIntermediate(chain, i)) t.intermediate += c.bytes;
        if (c.error) t.errors++;
        tools.set(c.tool, t);
        callers.set(c.caller, (callers.get(c.caller) ?? 0) + 1);
      });
    }
    if (s.chains.some((c) => programmableCalls(c) >= THRESHOLD.chainLength)) longSessions++;
    bytes += sBytes;
    intermediate += sIntermediate;
    shares.push(sBytes === 0 ? 0 : sIntermediate / sBytes);
  }
  return {
    projects,
    sessions: active,
    chains,
    calls,
    bytes,
    intermediate,
    lengths,
    longSessions,
    medianIntermediateShare: median(shares),
    byTool: [...tools].map(([tool, t]) => ({ tool, ...t })).sort((a, b) => b.bytes - a.bytes || a.tool.localeCompare(b.tool)),
    byCaller: [...callers].map(([caller, n]) => ({ caller, calls: n })).sort((a, b) => b.calls - a.calls || a.caller.localeCompare(b.caller)),
    subagentChains,
    skipped,
  };
}

const pct = (n: number) => `${(n * 100).toLocaleString("it-IT", { maximumFractionDigits: 1 })}%`;
const kb = (n: number) => `${(n / 1024).toLocaleString("it-IT", { maximumFractionDigits: 1 })} KB`;
const int = (n: number) => n.toLocaleString("it-IT");

/** Il resoconto in Markdown: solo conteggi e byte, nessun testo, percorso o id di sessione. */
export function chainsReport(s: ChainStats, date: string): string {
  const longShare = s.sessions === 0 ? 0 : s.longSessions / s.sessions;
  const overChains = longShare > THRESHOLD.sessionsShare;
  const overBytes = s.medianIntermediateShare > THRESHOLD.intermediateShare;
  const verdict =
    s.sessions === 0
      ? "Nessuna chiamata ad Agentrica nei progetti letti: nessun dato."
      : overChains || overBytes
        ? `**Soglia superata** (${[overChains && "catene lunghe", overBytes && "byte intermedi"].filter(Boolean).join(" e ")}): Code Mode si può riaprire.`
        : "**Soglia non superata**: Code Mode resta rinviato.";
  return [
    `# Catene di chiamate ai tool di Agentrica — ${date}`,
    "",
    `Fonte: file di sessione di Claude Code di ${int(s.projects)} progetti (${int(s.skipped)} file saltati). Byte misurati sul testo dei risultati; token stimati come byte / 4. Nessun testo di sessione, percorso o id.`,
    "",
    `Intermedio: un risultato seguito da un'altra chiamata ad Agentrica prima del messaggio successivo dell'utente, esclusi i testi di istruzioni (${[...INSTRUCTION_TOOLS].map((t) => `\`${t}\``).join(", ")}) che il modello deve leggere. È il limite superiore di ciò che Code Mode toglierebbe dal contesto.`,
    "",
    "## Esito",
    "",
    verdict,
    "",
    "| Misura | Valore | Soglia |",
    "|---|---|---|",
    `| Sessioni con almeno una catena di ${THRESHOLD.chainLength}+ chiamate programmabili (senza istruzioni né \`ask_user\`) | ${int(s.longSessions)} su ${int(s.sessions)} (${pct(longShare)}) | oltre ${pct(THRESHOLD.sessionsShare)} |`,
    `| Quota di byte intermedi per sessione (mediana) | ${pct(s.medianIntermediateShare)} | oltre ${pct(THRESHOLD.intermediateShare)} |`,
    "",
    "## Totali",
    "",
    `- Sessioni con chiamate ad Agentrica: ${int(s.sessions)}; catene: ${int(s.chains)} (${int(s.subagentChains)} nei subagent); chiamate: ${int(s.calls)}.`,
    `- Byte dei risultati: ${kb(s.bytes)} (~${int(Math.round(s.bytes / 4))} token); intermedi: ${kb(s.intermediate)} (${pct(s.bytes === 0 ? 0 : s.intermediate / s.bytes)}).`,
    "",
    "## Lunghezza delle catene",
    "",
    "Tutte le chiamate ad Agentrica della catena, comprese istruzioni e `ask_user`.",
    "",
    "| Chiamate | Catene |",
    "|---|---|",
    ...BUCKETS.map((b) => `| ${b} | ${int(s.lengths[b] ?? 0)} |`),
    "",
    "## Per tool",
    "",
    "| Tool | Chiamate | Byte | Media | Intermedi | Errori |",
    "|---|---|---|---|---|---|",
    ...s.byTool.map((t) => `| \`${t.tool}\` | ${int(t.calls)} | ${kb(t.bytes)} | ${kb(t.calls === 0 ? 0 : t.bytes / t.calls)} | ${kb(t.intermediate)} | ${int(t.errors)} |`),
    "",
    "## Chiamante",
    "",
    "Il campo `caller` di Claude Code: `direct` è la chiamata del modello; un altro valore è una chiamata programmatica del client.",
    "",
    "| Chiamante | Chiamate |",
    "|---|---|",
    ...s.byCaller.map((c) => `| \`${c.caller}\` | ${int(c.calls)} |`),
    "",
  ].join("\n");
}
