#!/usr/bin/env node
// Server MCP di Agentrica su stdio: un prompt per agente e due tool (elenca_agenti, agente).
// Con --agents (es. --agents aisa,aiwda-08) prompt e tool vedono solo la squadra; senza, tutti gli agenti.
// Legge solo i file di agents/ all'avvio; non scrive file e non registra dati (scrive solo init). L'unica connessione
// è l'invio di una valutazione (F20, ratings.ts), solo dopo la conferma dell'utente; --no-ratings toglie tool e promemoria.
// Con --panel (F14) apre anche il pannello locale su 127.0.0.1 (panel.ts), che legge plan/, audit/ e lo stato di git
// della cartella corrente e aggiunge i tool open_panel e ask_user; le chiamate agli agenti restano solo in memoria.
import { realpathSync } from "node:fs";
import { parseArgs } from "node:util";
import { AGENTS_DIR, loadCatalog, type Department, type DepartmentCode } from "./catalog.ts";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { openBrowser, startPanel, type Panel } from "./panel.ts";
import { agentSummary, agentText, codeName, findAgent, introLine, selectSquad, VERSION, type Found, type SquadDepartment } from "./prompt.ts";
import { createRatings, MAX_COMMENT, previewText, RATINGS_URL, type RatingInput, type Ratings } from "./ratings.ts";

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
let withRatings = true;
// `init` (F18) crea un progetto e termina, senza avviare il server: è l'unico comando che scrive file (init.ts).
if (process.argv[2] === "init") {
  const { runInit } = await import("./init.ts");
  process.exit(runInit(process.argv.slice(3)));
}
try {
  const { values } = parseArgs({ options: { agents: { type: "string" }, panel: { type: "boolean" }, "no-ratings": { type: "boolean" } } });
  spec = values.agents;
  withPanel = values.panel ?? false;
  withRatings = !values["no-ratings"];
} catch (error) {
  fail(reason(error));
}

let full: Department[];
try {
  full = loadCatalog();
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

// AGENTRICA_RATINGS_URL serve solo ai test (un endpoint finto) e vale solo su 127.0.0.1: un .mcp.json di un progetto
// non può dirottare le valutazioni verso un altro server. In uso resta l'URL fisso del sito.
const testUrl = process.env.AGENTRICA_RATINGS_URL;
const ratings: Ratings | undefined = withRatings
  ? createRatings({ version: VERSION, url: testUrl && /^http:\/\/127\.0\.0\.1:\d+\//.test(testUrl) ? testUrl : RATINGS_URL })
  : undefined;

let panel: Panel | undefined;
if (withPanel) {
  try {
    const panelRatings = ratings && {
      isRated: ratings.isRated,
      rate: (input: RatingInput) => ratings.send(ratings.build(input)),
    };
    panel = await startPanel(realpathSync(process.cwd()), panelRatings);
  } catch (error) {
    fail(`pannello non avviato: ${reason(error)}`);
  }
}

/** Registra nel pannello che un agente è stato usato: id, nome in codice, ruolo e l'inizio del compito. */
function used({ department, agent }: Found, task: string | undefined) {
  ratings?.loaded(agent.id);
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
        : "") +
      (ratings
        ? " Quando un agente ha finito il compito, proponi all'utente di valutarlo con rate_agent (una volta per agente per sessione); niente parte senza il suo sì all'anteprima."
        : ""),
  },
);

const TASK = z.string().max(20_000).optional().describe("Il compito da affidare all'agente nel progetto corrente.");
const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;
// Id ammesso: una sigla di tutto il catalogo (non solo della squadra, così fuori squadra è «non trovato») e due cifre.
const ID = new RegExp(`^(?:${full.map((d) => d.code).join("|")})-\\d{2}$`, "i");
const AGENT_ID = z.string().regex(ID, "Formato dell'id: SIGLA-NN, es. AISA-02.").describe("Id dell'agente, es. AISA-02.");
type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

/** Promemoria (F20): agenti in uso da 30 minuti e non valutati, in coda alla risposta di un tool, una volta per agente. */
function remind<T extends ToolResult>(result: T): T {
  const due = ratings?.due() ?? [];
  if (due.length === 0) return result;
  const names = due.map((id) => findAgent(catalog, id)).filter((f) => f !== undefined).map((f) => codeName(f.agent));
  const line = `Promemoria per il modello: ${names.join(", ")} ${names.length === 1 ? "è" : "sono"} in uso da più di 30 minuti. A un punto naturale del lavoro proponi all'utente di valutarl${names.length === 1 ? "o" : "i"} con rate_agent; se rifiuta, non chiedere più.`;
  return { ...result, content: [...result.content, { type: "text", text: line }] };
}

for (const found of all) {
  const title = `${codeName(found.agent)} — ${found.agent.role}`;
  server.registerPrompt(
    found.agent.id.toLowerCase(),
    { title, description: agentSummary(found), argsSchema: { compito: TASK } },
    ({ compito }) => {
      used(found, compito);
      return {
        description: title,
        messages: [{ role: "user", content: { type: "text", text: agentText(found, compito, { ratings: Boolean(ratings) }) } }],
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
    return remind({ content: [{ type: "text", text: lines.join("\n") }] });
  },
);

server.registerTool(
  "agente",
  {
    title: "Istruzioni di un agente",
    description:
      "Restituisce le istruzioni complete di un agente (regole comuni del reparto e file di ruolo), da seguire per lavorare come quell'agente.",
    inputSchema: {
      id: AGENT_ID,
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
    return remind({ content: [{ type: "text", text: agentText(found, compito, { ratings: Boolean(ratings) }) }] });
  },
);

if (ratings) registerRatingTool(ratings);

function registerRatingTool(ratings: Ratings) {
  server.registerTool(
    "rate_agent",
    {
      title: "Valuta un agente di Agentrica",
      description:
        "Invia ad Agentrica la valutazione di un agente (voto 1–5, commento facoltativo), in forma anonima, in due passi. " +
        "1) Senza code: restituisce l'anteprima di ciò che parte e un codice. 2) Mostra l'anteprima all'utente, chiedigli se inviarla " +
        "e solo dopo il suo sì richiama il tool con quel code. Non inviare mai senza il sì dell'utente; non mettere nel commento codice, " +
        "file o dati del progetto, solo le parole dell'utente.",
      inputSchema: {
        id: AGENT_ID,
        rating: z.number().int().min(1).max(5).optional().describe("Voto da 1 a 5 (primo passo)."),
        comment: z.string().max(MAX_COMMENT).optional().describe("Cosa è andato bene o cosa migliorare, con le parole dell'utente (primo passo)."),
        publish: z.boolean().optional().describe("true se l'utente permette di pubblicare il commento sul sito; predefinito false (primo passo)."),
        code: z.string().regex(/^[0-9a-f]{8}$/).optional().describe("Il codice dell'anteprima, solo dopo il sì dell'utente (secondo passo)."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async ({ id, rating, comment, publish, code }) => {
      const found = findAgent(catalog, id);
      const fail = (text: string): ToolResult => ({ isError: true, content: [{ type: "text", text }] });
      if (!found) return fail("Agente non trovato: usa elenca_agenti per vedere gli id.");
      if (ratings.isRated(found.agent.id)) return fail(`${codeName(found.agent)} è già stato valutato in questa sessione.`);
      if (code) {
        const result = await ratings.confirm(code, found.agent.id);
        if (!result.ok) return fail(result.message);
        return {
          content: [
            {
              type: "text",
              text:
                `Valutazione di ${codeName(found.agent)} inviata, grazie. Codice della valutazione: ${result.usageId}. ` +
                "Dillo all'utente: con questo codice può chiedere di cancellarla o di non pubblicare il commento (note legali di Agentrica).",
            },
          ],
        };
      }
      if (rating === undefined) return fail("Serve il voto da 1 a 5 per preparare l'anteprima.");
      const draft = ratings.draft({ agentId: found.agent.id, rating, comment, publish });
      return { content: [{ type: "text", text: previewText(introLine(found), draft.code, draft.rating) }] };
    },
  );
}

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
      return remind({
        content: [{ type: "text", text: `Pannello aperto nel browser. Se non si è aperto, l'utente può aprire questo URL, valido solo su questo computer: ${panel.url}` }],
      });
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
        return remind({ content: [{ type: "text", text: answer.note ? `${chosen}\nNota dell'utente: ${answer.note}` : chosen }] });
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
