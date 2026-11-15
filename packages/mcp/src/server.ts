#!/usr/bin/env node
// Server MCP di Agentrica su stdio: un prompt per agente e due tool (elenca_agenti, agente).
// Con --agents (es. --agents aisa,aiwda-08) prompt e tool vedono solo la squadra; senza, tutti gli agenti.
// Legge solo i file di agents/ all'avvio; non scrive file, non apre connessioni e non registra dati.
// Con --panel (F14) apre anche il pannello locale su 127.0.0.1 (panel.ts), che legge plan/, audit/ e lo stato di git
// della cartella corrente e aggiunge i tool open_panel e ask_user; le chiamate agli agenti restano solo in memoria.
import { realpathSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { loadCatalog, type Department, type DepartmentCode } from "../../catalog/src/index.ts";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { openBrowser, startPanel, type Panel } from "./panel.ts";
import { agentSummary, agentText, codeName, findAgent, selectSquad, VERSION, type Found, type SquadDepartment } from "./prompt.ts";

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
let withPanel = false;
try {
  const { values } = parseArgs({ options: { agents: { type: "string" }, panel: { type: "boolean" } } });
  spec = values.agents;
  withPanel = values.panel ?? false;
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

let catalog: SquadDepartment[];
try {
  catalog = selectSquad(full, spec);
} catch (error) {
  fail(reason(error));
}
const all = catalog.flatMap((department) => department.agents.map((agent) => ({ department, agent })));
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const codes = catalog.map((d) => d.code) as [DepartmentCode, ...DepartmentCode[]];

let panel: Panel | undefined;
if (withPanel) {
  try {
    panel = await startPanel(realpathSync(process.cwd()));
  } catch (error) {
    fail(`pannello non avviato: ${reason(error)}`);
  }
}

/** Registra nel pannello che un agente è stato usato: id, nome in codice, ruolo e l'inizio del compito. */
function used({ department, agent }: Found, task: string | undefined) {
  const line = (task ?? "").replace(/\s+/g, " ").trim();
  panel?.record({
    id: agent.id,
    codeName: codeName(agent),
    role: agent.role,
    department: department.code,
    task: line.length > 120 ? `${line.slice(0, 119)}…` : line,
  });
}

const server = new McpServer(
  { name: "agentrica", version: VERSION },
  {
    instructions:
      `Agentrica: ${count(all.length, "agente IA", "agenti IA")} in ${count(catalog.length, "reparto", "reparti")} (${codes.join(", ")}). ` +
      "Per scegliere un agente usa elenca_agenti; per lavorare come quell'agente carica le sue istruzioni con agente. " +
      `I prompt hanno il nome dell'id dell'agente, es. ${all[0]!.agent.id.toLowerCase()}.` +
      (panel
        ? " Il pannello locale è attivo: per le scelte che spettano all'utente usa ask_user, che mostra la domanda nella pagina; open_panel dà l'URL della pagina."
        : ""),
  },
);

const TASK = z.string().max(20_000).optional().describe("Il compito da affidare all'agente nel progetto corrente.");
const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;
// Id ammesso: una sigla di tutto il catalogo (non solo della squadra, così fuori squadra è «non trovato») e due cifre.
const ID = new RegExp(`^(?:${full.map((d) => d.code).join("|")})-\\d{2}$`, "i");

for (const found of all) {
  const title = `${codeName(found.agent)} — ${found.agent.role}`;
  server.registerPrompt(
    found.agent.id.toLowerCase(),
    { title, description: agentSummary(found), argsSchema: { compito: TASK } },
    ({ compito }) => {
      used(found, compito);
      return {
        description: title,
        messages: [{ role: "user", content: { type: "text", text: agentText(found, compito) } }],
      };
    },
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
      id: z.string().regex(ID, "Formato dell'id: SIGLA-NN, es. AISA-02.").describe("Id dell'agente, es. AISA-02."),
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
    used(found, compito);
    return { content: [{ type: "text", text: agentText(found, compito) }] };
  },
);

if (panel) registerPanelTools(panel);

function registerPanelTools(panel: Panel) {
  const PROGRESS_MS = 30_000;
  // Claude Code interrompe un tool stdio dopo 30 minuti senza risposta né avanzamento (plan/14-pannello.md, F14-01).
  const WAIT_WITH_PROGRESS_MS = 4 * 60 * 60_000;
  const WAIT_WITHOUT_PROGRESS_MS = 25 * 60_000;

  server.registerTool(
    "open_panel",
    {
      title: "Apri il pannello di Agentrica",
      description: "Apre nel browser il pannello locale del progetto (fasi, backlog, rilievi, agenti in uso, scelte in attesa) e ne restituisce l'URL.",
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    () => {
      openBrowser(panel.url);
      return {
        content: [{ type: "text", text: `Pannello aperto nel browser. Se non si è aperto, l'utente può aprire questo URL, valido solo su questo computer: ${panel.url}` }],
      };
    },
  );

  const option = z.object({
    label: z.string().min(1).max(80).describe("Etichetta breve dell'opzione."),
    description: z.string().max(500).describe("Cosa comporta l'opzione, con la motivazione."),
  });

  server.registerTool(
    "ask_user",
    {
      title: "Chiedi una scelta all'utente nel pannello",
      description:
        "Mostra all'utente, nel pannello locale, una scelta con 2–4 opzioni e aspetta la risposta (le etichette scelte e una nota facoltativa). " +
        "Metti per prima l'opzione consigliata, con « (Consigliata)» alla fine dell'etichetta. Se l'utente non risponde, chiedi nel terminale.",
      inputSchema: {
        question: z.string().min(1).max(2000).describe("La domanda completa, comprensibile da sola."),
        header: z.string().max(40).optional().describe("Titolo breve, es. «Strada»."),
        options: z.array(option).min(2).max(4).describe("Le opzioni, la consigliata per prima."),
        multiple: z.boolean().optional().describe("true se si può scegliere più di un'opzione."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ question, header, options, multiple }, extra) => {
      const labels = options.map((o) => o.label);
      if (new Set(labels).size !== labels.length) {
        return { isError: true, content: [{ type: "text", text: "Le etichette delle opzioni devono essere diverse." }] };
      }
      const progressToken = extra._meta?.progressToken;
      const wait = progressToken === undefined ? WAIT_WITHOUT_PROGRESS_MS : WAIT_WITH_PROGRESS_MS;
      let progress = 0;
      const ticker =
        progressToken === undefined
          ? undefined
          : setInterval(() => {
              extra
                .sendNotification({
                  method: "notifications/progress",
                  params: { progressToken, progress: ++progress, message: "In attesa della risposta nel pannello" },
                })
                .catch(() => {});
            }, PROGRESS_MS);
      if (!panel.hasViewers()) openBrowser(panel.url);
      try {
        const answer = await panel.ask(
          { question, header: header ?? "", options, multiple: multiple ?? false },
          AbortSignal.any([extra.signal, AbortSignal.timeout(wait)]),
        );
        const chosen = answer.choices.length ? `L'utente ha scelto: ${answer.choices.join("; ")}.` : "L'utente non ha scelto un'opzione.";
        return { content: [{ type: "text", text: answer.note ? `${chosen}\nNota dell'utente: ${answer.note}` : chosen }] };
      } catch {
        return {
          content: [{ type: "text", text: `Nessuna risposta dal pannello entro ${Math.round(wait / 60_000)} minuti: chiedi all'utente nel terminale.` }],
        };
      } finally {
        clearInterval(ticker);
      }
    },
  );
}

await server.connect(new StdioServerTransport());
// Con il pannello, una pagina aperta tiene vivo il processo: quando il client chiude stdio, il server esce.
if (panel) process.stdin.on("close", () => process.exit(0));
