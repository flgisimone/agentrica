#!/usr/bin/env node
// Server MCP di Agentrica su stdio: un prompt per agente e due tool (elenca_agenti, agente).
// Con --agents (es. --agents aisa,aiwda-08) prompt e tool vedono solo la squadra; senza, tutti gli agenti.
// Legge solo i file di agents/ all'avvio; non scrive file, non apre connessioni e non registra dati.
import { join } from "node:path";
import { parseArgs } from "node:util";
import { loadCatalog, type Department, type DepartmentCode } from "../../catalog/src/index.ts";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { agentSummary, agentText, codeName, findAgent, selectSquad, VERSION } from "./prompt.ts";

// agents/ è in un punto fisso rispetto a questo file, senza risalire le cartelle: la cartella corrente è il progetto
// dell'utente e non deve poter fornire un'altra agents/. Tre livelli sopra c'è agents/ sia da un clone
// (packages/mcp/src → la root del repository) sia nel pacchetto (dist/mcp/src → la root del pacchetto, dove prepack
// copia agents/). Il catalogo è importato per percorso relativo, così tsc lo compila dentro dist e il pacchetto non
// dipende da @agentrica/catalog.
const AGENTS_DIR = join(import.meta.dirname, "..", "..", "..", "agents");

// Un errore all'avvio ferma il server con una riga sola su stderr, che il client mostra nei log. Il messaggio può
// contenere argomenti della configurazione del client: i caratteri di controllo (a capo, escape) diventano \uXXXX.
function fail(message: string): never {
  const safe = message.replace(/\p{Cc}/gu, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
  process.stderr.write(`agentrica: ${safe}\n`);
  process.exit(1);
}
const reason = (error: unknown) => (error instanceof Error ? error.message : String(error));

let spec: string | undefined;
try {
  spec = parseArgs({ options: { agents: { type: "string" } } }).values.agents;
} catch (error) {
  fail(reason(error));
}

let full: Department[];
try {
  full = loadCatalog(AGENTS_DIR);
} catch (error) {
  // Senza catalogo completo il server non parte: niente contenuti parziali.
  fail(`catalogo non leggibile in ${AGENTS_DIR}: ${reason(error)}`);
}

let catalog: Department[];
try {
  catalog = selectSquad(full, spec);
} catch (error) {
  fail(reason(error));
}
const all = catalog.flatMap((department) => department.agents.map((agent) => ({ department, agent })));
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const codes = catalog.map((d) => d.code) as [DepartmentCode, ...DepartmentCode[]];

const server = new McpServer(
  { name: "agentrica", version: VERSION },
  {
    instructions:
      `Agentrica: ${count(all.length, "agente IA", "agenti IA")} in ${count(catalog.length, "reparto", "reparti")} (${codes.join(", ")}). ` +
      "Per scegliere un agente usa elenca_agenti; per lavorare come quell'agente carica le sue istruzioni con agente. " +
      `I prompt hanno il nome dell'id dell'agente, es. ${all[0]!.agent.id.toLowerCase()}.`,
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
