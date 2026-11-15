#!/usr/bin/env node
// Server MCP di Agentrica su stdio: un prompt per agente e due tool (elenca_agenti, agente).
// Legge solo i file di agents/ all'avvio; non scrive file, non apre connessioni e non registra dati.
import { join } from "node:path";
import { DEPARTMENTS, loadCatalog, type Department, type DepartmentCode } from "@agentrica/catalog";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { agentSummary, agentText, codeName, findAgent } from "./prompt.ts";

// agents/ è in un punto fisso rispetto a questo file, senza risalire le cartelle: la cartella corrente è il progetto
// dell'utente e non deve poter fornire un'altra agents/.
// ponytail: vale per l'uso da un clone (packages/mcp/src → agents/); il pacchetto pubblicato (F6) includerà agents/.
const AGENTS_DIR = join(import.meta.dirname, "..", "..", "..", "agents");

let catalog: Department[];
try {
  catalog = loadCatalog(AGENTS_DIR);
} catch (error) {
  // Senza catalogo completo il server non parte: niente contenuti parziali. Una riga sola, il client la mostra nei log.
  process.stderr.write(`agentrica: catalogo non leggibile in ${AGENTS_DIR}: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
const all = catalog.flatMap((department) => department.agents.map((agent) => ({ department, agent })));
const codes = DEPARTMENTS.map((d) => d.code) as [DepartmentCode, ...DepartmentCode[]];

const server = new McpServer(
  // ponytail: versione scritta a mano; in F6 si allinea a quella del pacchetto pubblicato.
  { name: "agentrica", version: "0.1.0" },
  {
    instructions:
      `Agentrica: ${all.length} agenti IA specializzati in ${catalog.length} reparti (${codes.join(", ")}). ` +
      "Per scegliere un agente usa elenca_agenti; per lavorare come quell'agente carica le sue istruzioni con agente. " +
      "I prompt hanno il nome dell'id dell'agente, es. aisa-02.",
  },
);

const TASK = z.string().max(20_000).optional().describe("Il compito da affidare all'agente nel progetto corrente.");
const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;

for (const found of all) {
  const title = `${codeName(found.agent)} — ${found.agent.role}`;
  server.registerPrompt(
    found.agent.id.toLowerCase(),
    { title, description: agentSummary(found), argsSchema: { compito: TASK } },
    ({ compito }) => ({
      description: title,
      messages: [{ role: "user", content: { type: "text", text: agentText(found, compito) } }],
    }),
  );
}

server.registerTool(
  "elenca_agenti",
  {
    title: "Elenca gli agenti di Agentrica",
    description: "Elenca gli agenti di Agentrica con id, nome in codice, ruolo e reparto. Il reparto è facoltativo.",
    inputSchema: { reparto: z.enum(codes).optional().describe("Sigla del reparto.") },
    annotations: READ_ONLY,
  },
  ({ reparto }) => {
    const lines = catalog
      .filter((d) => !reparto || d.code === reparto)
      .flatMap((d) => [
        `## ${d.code} — ${d.name}`,
        d.summary,
        ...d.agents.map((agent) => `- ${codeName(agent)}: ${agentSummary({ department: d, agent })}`),
        "",
      ]);
    return { content: [{ type: "text", text: lines.join("\n") }] };
  },
);

server.registerTool(
  "agente",
  {
    title: "Istruzioni di un agente",
    description:
      "Restituisce le istruzioni complete di un agente (regole comuni del reparto e file di ruolo), da seguire per lavorare come quell'agente.",
    inputSchema: {
      id: z.string().regex(/^[A-Za-z]{4,5}-\d{2}$/, "Formato dell'id: SIGLA-NN, es. AISA-02.").describe("Id dell'agente, es. AISA-02."),
      compito: TASK,
    },
    annotations: READ_ONLY,
  },
  ({ id, compito }) => {
    const found = findAgent(catalog, id);
    if (!found) {
      return {
        isError: true,
        content: [{ type: "text", text: "Agente non trovato: usa elenca_agenti per vedere gli id." }],
      };
    }
    return { content: [{ type: "text", text: agentText(found, compito) }] };
  },
);

await server.connect(new StdioServerTransport());
