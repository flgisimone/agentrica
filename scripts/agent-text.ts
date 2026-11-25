// Stampa il testo che il server MCP dà per un agente, con il compito: è l'ingresso delle prove di examples/
// (F24), così un subagent riceve lo stesso testo di un client. Uso: npm run agent-text -- aisa-09 "<compito>"
// Con --sizes (F40) stampa in Markdown i byte di ogni componente per tutti gli agenti, in italiano e in inglese, e gli
// altri testi del server: npm run -s agent-text -- --sizes [--date AAAA-MM-GG]. La data fissa le schede scadute.
// Con --after <id> (F41-07) prima il testo intero di quell'agente, poi quello dell'agente del compito come lo dà il server
// dopo di lui: regole e indice come riferimento se il reparto è lo stesso. È il contesto del flusso direttore → specialista.
import { parseArgs } from "node:util";
import { loadCatalog } from "../packages/mcp/src/catalog.ts";
import { sizesReport } from "./agent-text-lib.ts";
import { agentText, findAgent, selectSquad, today } from "../packages/mcp/src/prompt.ts";

const { values, positionals } = parseArgs({ allowPositionals: true, options: { sizes: { type: "boolean" }, date: { type: "string" }, after: { type: "string" } } });

if (values.sizes) {
  console.log(sizesReport(values.date ?? today()));
} else {
  const [id, task] = positionals;
  const catalog = selectSquad(loadCatalog());
  const found = id ? findAgent(catalog, id) : undefined;
  const before = values.after === undefined ? undefined : findAgent(catalog, values.after);
  if (!found || (values.after !== undefined && !before)) {
    console.error('Uso: npm run agent-text -- <id agente> "<compito>" [--after <id>] | --sizes [--date AAAA-MM-GG]');
    process.exit(1);
  }
  if (before) console.log(agentText(before) + "\n---\n");
  console.log(agentText(found, task, { known: before?.department.code === found.department.code }));
}
