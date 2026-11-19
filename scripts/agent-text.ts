// Stampa il testo che il server MCP dà per un agente, con il compito: è l'ingresso delle prove di examples/
// (F24), così un subagent riceve lo stesso testo di un client. Uso: npm run agent-text -- aisa-09 "<compito>"
import { loadCatalog } from "../packages/catalog/src/index.ts";
import { agentText, findAgent, selectSquad } from "../packages/mcp/src/prompt.ts";

const [id, task] = process.argv.slice(2);
const found = id ? findAgent(selectSquad(loadCatalog()), id) : undefined;
if (!found) {
  console.error('Uso: npm run agent-text -- <id agente> "<compito>"');
  process.exit(1);
}
console.log(agentText(found, task));
