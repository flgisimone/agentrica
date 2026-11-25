// Stampa il testo che il server MCP dà per un agente, con il compito: è l'ingresso delle prove di examples/
// (F24), così un subagent riceve lo stesso testo di un client. Uso: npm run agent-text -- aisa-09 "<compito>"
// Con --sizes (F40) stampa in Markdown i byte di ogni componente per tutti gli agenti, in italiano e in inglese, e gli
// altri testi del server: npm run -s agent-text -- --sizes [--date AAAA-MM-GG]. La data fissa le schede scadute.
// Con --after <id> (F41-07) prima il testo intero di quell'agente, poi quello dell'agente del compito come lo dà il server
// dopo di lui: regole e indice come riferimento se il reparto è lo stesso. È il contesto del flusso direttore → specialista.
// Con --cards <id,id> (F44-05) stampa le schede della biblioteca come il tool library, per i subagent di prova che non
// hanno il server: npm run -s agent-text -- aisa-09 --cards mcp-2026-07-28
import { parseArgs } from "node:util";
import { loadCatalog } from "../packages/mcp/src/catalog.ts";
import { sizesReport } from "./agent-text-lib.ts";
import { agentText, cardText, findAgent, selectSquad, today } from "../packages/mcp/src/prompt.ts";

const { values, positionals } = parseArgs({ allowPositionals: true, options: { sizes: { type: "boolean" }, date: { type: "string" }, after: { type: "string" }, cards: { type: "string" } } });

if (values.sizes) {
  console.log(sizesReport(values.date ?? today()));
} else {
  const [id, task] = positionals;
  const catalog = selectSquad(loadCatalog());
  const found = id ? findAgent(catalog, id) : undefined;
  const before = values.after === undefined ? undefined : findAgent(catalog, values.after);
  if (!found || (values.after !== undefined && !before)) {
    console.error('Uso: npm run agent-text -- <id agente> "<compito>" [--after <id>] | <id agente> --cards <schede> | --sizes [--date AAAA-MM-GG]');
    process.exit(1);
  }
  if (values.cards !== undefined) {
    const library = found.department.library;
    const wanted = values.cards.split(",");
    const unknown = wanted.filter((id) => !library.some((card) => card.id === id));
    if (unknown.length > 0) {
      console.error(`Schede non trovate in ${found.department.code}: ${unknown.join(", ")}. Ci sono: ${library.map((card) => card.id).join(", ")}`);
      process.exit(1);
    }
    console.log(wanted.map((id) => cardText(library.find((card) => card.id === id)!, today())).join("\n\n---\n\n"));
    process.exit(0);
  }
  if (before) console.log(agentText(before) + "\n---\n");
  console.log(agentText(found, task, { known: before?.department.code === found.department.code }));
}
