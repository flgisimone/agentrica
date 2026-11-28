// CLI di sola lettura del catalogo (F58-07): `list`, `agent` e `library` stampano su stdout gli stessi testi dei tool
// list_agents, agent e library, senza avviare il server. Servono fuori da un client MCP, per esempio
// `npx @aigentrica/mcp agent aisa-12 | claude -p "…"`. Il testo dell'agente ha sempre regole comuni e indice interi
// (ogni comando è una sessione a sé) e niente proposta di valutazione né resoconto, che vivono solo nel server.
import { parseArgs } from "node:util";
import { loadCatalog } from "./catalog.ts";
import { agentList, agentText, cardText, findAgent, selectSquad, today } from "./prompt.ts";
import { lang, T } from "./texts/index.ts";

export const CLI_COMMANDS = ["list", "agent", "library"] as const;
export type CliCommand = (typeof CLI_COMMANDS)[number];

const out = (text: string) => process.stdout.write(text.endsWith("\n") ? text : `${text}\n`);
const err = (text: string) => process.stderr.write(`${text}\n`);

/** Esegue un comando della CLI e dà il codice d'uscita: 0 riuscito, 1 agente o scheda non trovati, 2 uso sbagliato. */
export function runCli(command: CliCommand, args: string[]): number {
  let positionals: string[];
  let task: string | undefined;
  try {
    // --lang l'ha già letto il server all'avvio; qui si accetta e basta.
    const parsed = parseArgs({ args, options: { lang: { type: "string" }, task: { type: "string" } }, allowPositionals: true });
    positionals = parsed.positionals;
    task = parsed.values.task;
    if (task !== undefined && command !== "agent") throw new Error("--task");
  } catch {
    err(T.cli.usage);
    return 2;
  }
  const squad = selectSquad(loadCatalog(lang));

  if (command === "list") {
    if (positionals.length > 1) return (err(T.cli.usage), 2);
    const code = positionals[0]?.toUpperCase();
    if (code && !squad.some((d) => d.code === code)) return (err(T.cli.unknownDepartment(positionals[0]!, squad.map((d) => d.code).join(", "))), 1);
    out(agentList(squad, code));
    return 0;
  }

  const [id, ...cards] = positionals;
  if (!id || (command === "agent" && cards.length > 0) || (command === "library" && cards.length === 0)) return (err(T.cli.usage), 2);
  const found = findAgent(squad, id);
  if (!found) return (err(T.cli.agentNotFound), 1);

  if (command === "agent") {
    out(agentText(found, task));
    return 0;
  }

  const { library, code } = found.department;
  if (library.length === 0) return (err(T.server.library.empty(code)), 1);
  const unknown = cards.filter((card) => !library.some((c) => c.id === card));
  if (unknown.length > 0) return (err(T.server.library.unknown(code, unknown.join(", "), library.map((c) => c.id).join(", "))), 1);
  const date = today();
  out([...new Set(cards)].map((card) => cardText(library.find((c) => c.id === card)!, date)).join("\n\n---\n\n"));
  return 0;
}
