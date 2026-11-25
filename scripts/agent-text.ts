// Stampa il testo che il server MCP dà per un agente, con il compito: è l'ingresso delle prove di examples/
// (F24), così un subagent riceve lo stesso testo di un client. Uso: npm run agent-text -- aisa-09 "<compito>"
// Con --sizes (F40) stampa in Markdown i byte di ogni componente per tutti gli agenti, in italiano e in inglese, e gli
// altri testi del server: npm run -s agent-text -- --sizes [--date AAAA-MM-GG]. La data fissa le schede scadute.
import { parseArgs } from "node:util";
import { loadCatalog } from "../packages/mcp/src/catalog.ts";
import { sizesReport } from "./agent-text-lib.ts";
import { agentText, findAgent, selectSquad, today } from "../packages/mcp/src/prompt.ts";

const { values, positionals } = parseArgs({ allowPositionals: true, options: { sizes: { type: "boolean" }, date: { type: "string" } } });

if (values.sizes) {
  console.log(sizesReport(values.date ?? today()));
} else {
  const [id, task] = positionals;
  const found = id ? findAgent(selectSquad(loadCatalog()), id) : undefined;
  if (!found) {
    console.error('Uso: npm run agent-text -- <id agente> "<compito>" | --sizes [--date AAAA-MM-GG]');
    process.exit(1);
  }
  console.log(agentText(found, task));
}
