#!/usr/bin/env node
// Server MCP di Agentrica su stdio: un prompt per agente e tre tool in sola lettura (elenca_agenti, agente e, da F25,
// library, che dà le schede della biblioteca del reparto; gli URL delle fonti restano in fonti.json, mai al modello).
// Con --agents (es. --agents aisa,aiwda-08) prompt e tool vedono solo la squadra; senza, tutti gli agenti.
// Legge i file di agents/ all'avvio e non registra dati. Da F29 legge e, solo dopo il modulo, scrive la configurazione
// in ~/.agentrica/config.json (config.ts): le scelte senza flag vengono da lì; i comandi valuta e configura sono prompt
// e il modulo della configurazione compare alla prima chiamata se il file manca. Due tipi di connessione:
// l'invio di una valutazione (F20, ratings.ts) o, da F27, dei totali di token (share.ts), solo dopo la conferma
// dell'utente, e da F23 il controllo della versione sul registro npm all'avvio (update.ts). --no-ratings toglie i tool
// di invio, il modulo e i promemoria; --no-update-check il controllo.
// Da F23 la valutazione la chiede il server con il modulo dell'elicitation MCP, se il client lo supporta: quando si
// carica un altro agente (per il precedente) e dopo 30 minuti d'uso, una volta per agente.
// Da F29 apre di predefinito (prima solo con --panel, F14; --no-panel lo spegne) il pannello locale su 127.0.0.1 (panel.ts), che legge plan/, audit/ e lo stato di git
// della cartella corrente e aggiunge i tool open_panel e ask_user; le chiamate agli agenti restano solo in memoria.
import { realpathSync } from "node:fs";
import { parseArgs } from "node:util";
import { AGENTS_DIR, loadCatalog, subagentIds, type Department, type DepartmentCode } from "./catalog.ts";
import { canUseConfig, configForm, configMessage, configPath, DEFAULTS, parseConfigForm, readConfig, shownPath, writeConfig, type Config, type ConfigKey } from "./config.ts";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { openBrowser, startPanel, type Panel } from "./panel.ts";
import { agentSummary, agentText, cardText, codeName, findAgent, introLine, modelAdvice, promptName, selectSquad, today, VERSION, type Found, type SquadDepartment } from "./prompt.ts";
import { createRatings, formMessage, MAX_COMMENT, parseForm, previewText, RATING_FORM, RATINGS_URL, REMINDER_AFTER_MS, type RatingInput, type Ratings } from "./ratings.ts";
import { createShare, SHARE_URL, sharePreviewText, type Share } from "./share.ts";
import { createShowcase, parseProjectFields, PROJECT_FORM, PROJECTS_URL, projectFormMessage, projectPreviewText, sentText, type Showcase } from "./showcase.ts";
import { claudeProjectDir, readUsage, shareRows, type Usage } from "./usage.ts";
import { fetchLatest, installKind, isNewer, REGISTRY_URL, updateMessage } from "./update.ts";

// Un errore all'avvio ferma il server con una riga sola su stderr, che il client mostra nei log. Il messaggio può
// contenere argomenti della configurazione del client: i caratteri di controllo (a capo, escape) diventano \uXXXX.
function fail(message: string): never {
  const safe = message.replace(/\p{Cc}/gu, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
  process.stderr.write(`agentrica: ${safe}\n`);
  process.exit(1);
}
const reason = (error: unknown) => (error instanceof Error ? error.message : String(error));

// `init` (F18) crea un progetto e termina, senza avviare il server: scrive i file del progetto (init.ts).
// `add` e `install` (F23) registrano il server in Claude Code e terminano (setup.ts).
if (process.argv[2] === "init") {
  const { runInit } = await import("./init.ts");
  process.exit(runInit(process.argv.slice(3)));
}
if (process.argv[2] === "add" || process.argv[2] === "install") {
  const { runSetup } = await import("./setup.ts");
  process.exit(runSetup(process.argv[2], process.argv.slice(3)));
}
// I flag fissano una scelta; quelle senza flag vengono dal file salvato (F29, config.ts) o dai predefiniti.
const flags: Partial<Config> = {};
try {
  const { values } = parseArgs({
    options: {
      agents: { type: "string" },
      panel: { type: "boolean" },
      "no-panel": { type: "boolean" },
      "no-ratings": { type: "boolean" },
      "no-update-check": { type: "boolean" },
    },
  });
  if (values.panel && values["no-panel"]) throw new Error("scegli --panel o --no-panel, non entrambi");
  if (values.agents !== undefined) flags.agents = values.agents;
  if (values.panel) flags.panel = true;
  if (values["no-panel"]) flags.panel = false;
  if (values["no-ratings"]) flags.ratings = false;
  if (values["no-update-check"]) flags.updateCheck = false;
} catch (error) {
  fail(reason(error));
}
const fixed = new Set(Object.keys(flags) as ConfigKey[]);

let full: Department[];
try {
  full = loadCatalog();
} catch (error) {
  // Senza catalogo completo il server non parte: niente contenuti parziali.
  fail(`catalogo non leggibile in ${AGENTS_DIR}: ${reason(error)}`);
}

const configFile = configPath();
const configUsable = canUseConfig(configFile);
// Il file salvato, se c'è ed è valido (anche la squadra). Uno non valido vale come mancante: una riga su stderr, senza
// il contenuto, e il modulo lo riscrive (SEC-CFG-02).
let saved: Config | undefined;
if (configUsable) {
  const read = readConfig(configFile);
  let invalid = "invalid" in read ? read.invalid : undefined;
  if ("config" in read) {
    try {
      selectSquad(full, read.config.agents || undefined);
      saved = read.config;
    } catch {
      invalid = "squadra non valida";
    }
  }
  if (invalid) process.stderr.write(`agentrica: ${shownPath} ignorato (${invalid})\n`);
}
const settings: Config = { ...DEFAULTS, ...saved, ...flags };
const spec = flags.agents ?? (settings.agents || undefined);
const { panel: withPanel, ratings: withRatings, updateCheck: withUpdateCheck } = settings;

let catalog: SquadDepartment[];
try {
  catalog = selectSquad(full, spec);
} catch (error) {
  fail(reason(error));
}
const all = catalog.flatMap((department) => department.agents.map((agent) => ({ department, agent })));
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const codes = catalog.map((d) => d.code) as [DepartmentCode, ...DepartmentCode[]];

// AGENTRICA_RATINGS_URL e AGENTRICA_REGISTRY_URL servono solo ai test (endpoint finti) e valgono solo su 127.0.0.1:
// un .mcp.json di un progetto non può dirottare le connessioni verso un altro server. In uso restano gli URL fissi.
const local = (name: string, fixed: string) => {
  const url = process.env[name];
  return url && /^http:\/\/127\.0\.0\.1:\d+\//.test(url) ? url : fixed;
};
const ratings: Ratings | undefined = withRatings ? createRatings({ version: VERSION, url: local("AGENTRICA_RATINGS_URL", RATINGS_URL) }) : undefined;
const share: Share | undefined = withRatings ? createShare({ version: VERSION, url: local("AGENTRICA_USAGE_URL", SHARE_URL) }) : undefined;
const showcase: Showcase | undefined = withRatings ? createShowcase({ version: VERSION, url: local("AGENTRICA_PROJECTS_URL", PROJECTS_URL) }) : undefined;
// Reparti e agenti di tutto il catalogo, non solo della squadra: un progetto può averne usati altri.
const known = { departments: new Set(full.map((d) => d.code)), agents: new Set(full.flatMap((d) => d.agents.map((a) => a.id))) };

/**
 * Le righe dei totali del progetto, fissate in una bozza con il codice per inviarle (tool e pannello). La cartella si
 * legge solo qui: con il permission model di Node senza lettura del progetto restano zero righe.
 */
async function draftShare(share: Share) {
  let records: Usage[] = [];
  let agentIds = new Map<string, string>();
  try {
    records = (await readUsage(claudeProjectDir(realpathSync(process.cwd())))).records;
    agentIds = subagentIds(full);
  } catch {
    // Lettura non permessa: nulla da inviare.
  }
  const { rows, omitted } = shareRows(records, agentIds, new Date().toISOString().slice(0, 10));
  return { ...share.draft(rows), omitted };
}

// Frasi per il modello in coda alla risposta del prossimo tool di Agentrica: l'avviso di versione nuova (una volta) e
// l'esito di un modulo di valutazione mostrato fuori da una chiamata.
const notes: string[] = [];
let update: string | undefined;
if (withUpdateCheck) {
  void fetchLatest(local("AGENTRICA_REGISTRY_URL", REGISTRY_URL)).then((version) => {
    if (!version || !isNewer(version, VERSION)) return;
    update = updateMessage(VERSION, version, installKind(import.meta.filename));
    notes.push(`Avviso per l'utente, da riferire una volta: ${update}`);
  });
}

// Il pannello serve rete locale e git (processo figlio). Con il permission model senza questi permessi, se non l'ha
// chiesto un flag, si salta in silenzio: il modo con i permessi minimi del README resta com'è. Con --panel un errore
// ferma il server come prima; acceso dal file o dal predefinito, una riga su stderr e il server continua.
const permission = (process as { permission?: { has(scope: string): boolean } }).permission;
const panelAllowed = !permission || (permission.has("net") && permission.has("child"));
let panel: Panel | undefined;
if (withPanel && (panelAllowed || flags.panel)) {
  try {
    const panelRatings = ratings && share && {
      isRated: ratings.isRated,
      rate: (input: RatingInput) => ratings.send(ratings.build(input)),
      previewShare: () => draftShare(share),
      confirmShare: (code: string) => share.confirm(code),
    };
    panel = await startPanel(realpathSync(process.cwd()), panelRatings, () => update);
  } catch (error) {
    if (flags.panel) fail(`pannello non avviato: ${reason(error)}`);
    process.stderr.write(`agentrica: pannello non avviato (${reason(error).replace(/\p{Cc}/gu, " ")}), il server continua senza\n`);
  }
}

let current: string | undefined;

/**
 * Un agente è stato caricato: lo registra nel pannello (id, nome in codice, ruolo, reparto e l'inizio del compito) e,
 * se prima ne era in uso un altro, chiede la valutazione di quello, che ha finito. Restituisce l'esito del modulo.
 */
async function used({ department, agent }: Found, task: string | undefined): Promise<string | undefined> {
  const previous = current;
  current = agent.id;
  if (ratings && !ratings.isRated(agent.id) && canAsk()) {
    // Il timer dei 30 minuti (unref: non tiene vivo il processo). Solo al primo caricamento dell'agente.
    if (!timers.has(agent.id)) timers.set(agent.id, setTimeout(() => void askLater(agent.id), REMINDER_AFTER_MS).unref());
  }
  ratings?.loaded(agent.id);
  const line = (task ?? "").replace(/\s+/g, " ").trim();
  panel?.record({
    id: agent.id,
    codeName: codeName(agent),
    role: agent.role,
    department: `${department.code} · ${department.short}`,
    task: line.length > 120 ? `${line.slice(0, 119)}…` : line,
  });
  if (!previous || previous === agent.id) return undefined;
  try {
    return await askRating(previous);
  } catch {
    // Il client non ha mostrato il modulo (errore o tempo scaduto): l'agente si carica lo stesso, resta il promemoria.
    ratings?.unclaimAsk(previous);
    return undefined;
  }
}

const timers = new Map<string, NodeJS.Timeout>();
const FORM_TIMEOUT_MS = 5 * 60_000;

// Un client può dichiarare i moduli e chiuderli senza mostrarli: l'estensione VS Code di Claude Code gira in «print
// mode» e risponde cancel in pochi millisecondi (prova F29-07, 2026-11-21). Un modulo chiuso prima di UNSEEN_MS non
// l'ha visto nessuno: vale come non mostrato, e per il resto della sessione si usano i flussi senza moduli.
const UNSEEN_MS = 300;
let formsShown = true;

/** Il client mostra moduli (elicitation MCP)? Senza, resta il flusso di F20: rate_agent proposto dal modello. */
function canAsk(): boolean {
  return formsShown && Boolean(server.server.getClientCapabilities()?.elicitation?.form);
}

/** Mostra un modulo. Se torna chiuso troppo presto per una persona, lancia un errore come un modulo non mostrato. */
async function elicit(params: Parameters<typeof server.server.elicitInput>[0]) {
  const started = Date.now();
  const result = await server.server.elicitInput(params, { timeout: FORM_TIMEOUT_MS });
  if (result.action !== "accept" && Date.now() - started < UNSEEN_MS) {
    formsShown = false;
    throw new Error("modulo chiuso dal client senza mostrarlo");
  }
  return result;
}

/**
 * Mostra il modulo di valutazione per un agente, una volta; restituisce la frase per il modello con l'esito. Con
 * `asked` (il comando valuta) lo mostra anche per un agente non caricato o per cui era già comparso.
 */
async function askRating(agentId: string, asked = false): Promise<string | undefined> {
  const found = findAgent(catalog, agentId);
  if (!ratings || !found || !canAsk()) return undefined;
  if (asked) {
    ratings.loaded(agentId);
    ratings.claimAsk(agentId);
  } else if (!ratings.claimAsk(agentId)) return undefined;
  const name = codeName(found.agent);
  const result = await elicit({ message: formMessage(introLine(found)), requestedSchema: RATING_FORM });
  if (result.action !== "accept") return undefined;
  const input = parseForm(agentId, result.content);
  if (!input) return `La valutazione di ${name} non è partita: il modulo aveva dati non validi.`;
  const sent = await ratings.send(ratings.build(input));
  return sent.ok
    ? `L'utente ha valutato ${name} con il modulo: inviata, codice ${sent.usageId}. Diglielo: con questo codice può chiedere di cancellarla o di non pubblicare il commento (note legali di Agentrica).`
    : `La valutazione di ${name} non è partita: ${sent.message}`;
}

/** Il modulo dei 30 minuti, fuori da una chiamata. Se il client non lo accetta, resta il promemoria in coda (remind). */
async function askLater(agentId: string) {
  try {
    const note = await askRating(agentId);
    if (note) notes.push(note);
  } catch {
    ratings?.unclaimAsk(agentId);
  }
}

// Il modulo della configurazione alla prima chiamata della sessione: solo se il file manca (o non è valido), se si può
// salvare e se resta almeno una scelta senza flag.
let configAsked = !configUsable || saved !== undefined || fixed.size === 4;

/**
 * Mostra il modulo della configurazione e salva le scelte. Alla prima chiamata (`first`) un modulo chiuso salva i
 * valori proposti, così non ricompare; dal comando configura non salva nulla. Restituisce la frase per il modello.
 */
async function askConfig(first: boolean): Promise<string> {
  configAsked = true;
  const base = { ...DEFAULTS, ...saved };
  const result = await elicit({ message: configMessage(fixed), requestedSchema: configForm(base, fixed) });
  if (result.action !== "accept" && !first) return "L'utente ha chiuso il modulo della configurazione: non cambia nulla.";
  const chosen = result.action === "accept" ? parseConfigForm(base, result.content) : base;
  if (!chosen) return "Configurazione non salvata: il modulo aveva dati non validi.";
  try {
    selectSquad(full, chosen.agents || undefined);
  } catch (error) {
    return `Configurazione non salvata: ${reason(error).replace("in --agents", "nella squadra").replace("--agents è vuoto", "la squadra è vuota")}. Dillo all'utente: può riprovare con il comando configura di Agentrica.`;
  }
  try {
    writeConfig(configFile, chosen);
  } catch (error) {
    return `Configurazione non salvata in ${shownPath}: ${(error as NodeJS.ErrnoException).code ?? reason(error)}.`;
  }
  saved = chosen;
  return result.action === "accept"
    ? `Configurazione di Agentrica salvata in ${shownPath}: vale dalla prossima sessione. Dillo all'utente in una riga.`
    : `L'utente ha chiuso il modulo della configurazione: salvati i valori predefiniti in ${shownPath}, il modulo non ricompare. Si cambiano con il comando configura di Agentrica.`;
}

/** Alla prima chiamata di Agentrica nella sessione, il modulo della configurazione se serve. */
async function firstCall(): Promise<string | undefined> {
  if (configAsked || !canAsk()) return undefined;
  configAsked = true;
  try {
    return await askConfig(true);
  } catch {
    // Il client non ha mostrato il modulo: si riprova alla prossima sessione.
    return undefined;
  }
}


const server = new McpServer(
  { name: "agentrica", version: VERSION },
  {
    instructions:
      `Agentrica: ${count(all.length, "agente IA", "agenti IA")} in ${count(catalog.length, "reparto", "reparti")} (${codes.join(", ")}). ` +
      "Per scegliere un agente usa elenca_agenti; per lavorare come quell'agente carica le sue istruzioni con agente. " +
      "Le istruzioni contengono l'indice della biblioteca del reparto: le schede che servono al compito si leggono con library. " +
      `I prompt hanno il nome dell'id dell'agente e del reparto, es. ${promptName(all[0]!)}; il tool agente vuole l'id, es. ${all[0]!.agent.id}.` +
      (panel
        ? " Il pannello locale è attivo: per le scelte che spettano all'utente usa ask_user, che mostra la domanda nella pagina; open_panel dà l'URL della pagina."
        : "") +
      (ratings
        ? " Se il testo di un agente chiede di proporre la valutazione, fallo con rate_agent (una volta per agente per sessione); niente parte senza il sì dell'utente all'anteprima." +
          " A fine sessione, insieme alla valutazione e una volta sola, puoi proporre di inviare i totali di token del progetto con share_usage; se l'utente rifiuta, non insistere."
        : ""),
  },
);

const TASK = z.string().max(20_000).optional().describe("Il compito da affidare all'agente nel progetto corrente.");
const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;
// Id ammesso: una sigla di tutto il catalogo (non solo della squadra, così fuori squadra è «non trovato») e due cifre.
const ID = new RegExp(`^(?:${full.map((d) => d.code).join("|")})-\\d{2}$`, "i");
const AGENT_ID = z.string().regex(ID, "Formato dell'id: SIGLA-NN, es. AISA-02.").describe("Id dell'agente, es. AISA-02.");
type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

/**
 * In coda alla risposta di un tool: le frasi in attesa (versione nuova, esito di un modulo) e il promemoria di F20
 * (agenti in uso da 30 minuti e non valutati, una volta per agente) per i client senza moduli.
 */
function remind<T extends ToolResult>(result: T, ...extra: (string | undefined)[]): T {
  const lines = [...extra.filter((line) => line !== undefined), ...notes.splice(0)];
  const due = ratings?.due() ?? [];
  if (due.length > 0) {
    const names = due.map((id) => findAgent(catalog, id)).filter((f) => f !== undefined).map((f) => codeName(f.agent));
    lines.push(
      `Promemoria per il modello: ${names.join(", ")} ${names.length === 1 ? "è" : "sono"} in uso da più di 30 minuti. A un punto naturale del lavoro proponi all'utente di valutarl${names.length === 1 ? "o" : "i"} con rate_agent; se rifiuta, non chiedere più.`,
    );
  }
  if (lines.length === 0) return result;
  return { ...result, content: [...result.content, ...lines.map((text) => ({ type: "text" as const, text }))] };
}

/** La proposta di valutazione nel testo dell'agente serve solo ai client senza moduli. */
const textOptions = () => ({ ratings: Boolean(ratings) && !canAsk() });

for (const found of all) {
  const title = `${codeName(found.agent)} — ${found.agent.role}`;
  server.registerPrompt(
    promptName(found),
    { title, description: agentSummary(found), argsSchema: { compito: TASK } },
    async ({ compito }) => {
      // Un prompt non ha una risposta di tool: l'esito dei moduli va alla prossima.
      for (const note of [await firstCall(), await used(found, compito)]) if (note) notes.push(note);
      return {
        description: title,
        messages: [{ role: "user", content: { type: "text", text: agentText(found, compito, textOptions()) } }],
      };
    },
  );
}

/** La risposta di un comando (valuta, configura): un messaggio per il modello. */
const said = (title: string, text: string) => ({ description: title, messages: [{ role: "user" as const, content: { type: "text" as const, text } }] });

if (ratings) {
  const title = "Valuta un agente di Agentrica";
  server.registerPrompt(
    "valuta",
    {
      title,
      description: "Apre il modulo di valutazione per l'agente in uso o per quello indicato.",
      argsSchema: { agente: z.string().max(20).optional().describe("Id dell'agente, es. AISA-02. Senza: l'ultimo agente in uso.") },
    },
    async ({ agente }) => {
      const id = agente?.trim() || current;
      if (!id) return said(title, "L'utente vuole valutare un agente di Agentrica, ma in questa sessione non ne è stato usato nessuno. Chiedigli quale (id come AISA-02) e poi usa rate_agent.");
      const found = ID.test(id) ? findAgent(catalog, id) : undefined;
      if (!found) return said(title, "L'utente vuole valutare un agente, ma l'id non è fra gli agenti di questa squadra. Chiedigli quale (elenca_agenti dà gli id) e poi usa rate_agent.");
      const name = codeName(found.agent);
      if (ratings.isRated(found.agent.id)) return said(title, `${name} è già stato valutato in questa sessione: dillo all'utente.`);
      const manual =
        `L'utente vuole valutare ${name}. Chiedigli il voto da 1 a 5, un commento facoltativo e se permette di pubblicarlo sul sito, ` +
        `poi usa rate_agent con id ${found.agent.id}: mostragli l'anteprima e invia solo dopo il suo sì.`;
      if (!canAsk()) return said(title, manual);
      try {
        const note = await askRating(found.agent.id, true);
        return said(title, note ?? `L'utente ha chiuso il modulo di valutazione di ${name}: non fare altro.`);
      } catch {
        ratings.unclaimAsk(found.agent.id);
        return said(title, manual);
      }
    },
  );
}

if (showcase) registerShowcase(showcase);

/** Il comando progetto e il tool submit_project (F29-08): proporre un progetto senza account GitHub, o ritirarlo. */
function registerShowcase(showcase: Showcase) {
  const title = "Mostra il tuo progetto sul sito di Agentrica";
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  server.registerPrompt(
    "progetto",
    {
      title,
      description: "Propone un progetto fatto con Agentrica per la pagina dei progetti del sito, senza account GitHub; con rimuovi lo ritira.",
      argsSchema: { rimuovi: z.string().max(40).optional().describe("Il codice della proposta da ritirare.") },
    },
    async ({ rimuovi }) => {
      if (rimuovi !== undefined) {
        if (!UUID.test(rimuovi.trim())) return said(title, "Il testo dopo il comando progetto è il codice di una proposta da ritirare, e questo non lo è (serve un UUID come 3f2a…-…). Dillo all'utente: per proporre un progetto si lancia il comando progetto senza argomenti; per ritirarne uno serve il codice ricevuto all'invio.");
        const result = await showcase.withdraw(rimuovi.trim().toLowerCase());
        return said(
          title,
          result.ok
            ? "Richiesta di ritiro registrata: se il codice è giusto, la proposta non compare più; se era già sul sito, si toglie con il prossimo aggiornamento, entro 30 giorni. Dillo all'utente."
            : `${result.message} Dillo all'utente.`,
        );
      }
      const manual =
        "L'utente vuole proporre un suo progetto fatto con Agentrica per il sito. Chiedigli nome, link https, descrizione (280 caratteri, senza link), " +
        "reparti usati, agenti usati e nome da mostrare (facoltativi), e se dà consenso e licenza (testi nella descrizione di submit_project). " +
        "Poi usa submit_project: mostragli l'anteprima e invia solo dopo il suo sì.";
      if (!canAsk()) return said(title, manual);
      let result;
      try {
        result = await elicit({ message: projectFormMessage(), requestedSchema: PROJECT_FORM });
      } catch {
        return said(title, manual);
      }
      if (result.action !== "accept") return said(title, "L'utente ha chiuso il modulo del progetto: non parte nulla.");
      const fields = parseProjectFields(result.content ?? {}, known);
      if (typeof fields === "string") return said(title, `La proposta non è partita: ${fields}. Dillo all'utente: può riprovare con il comando progetto di Agentrica.`);
      const sent = await showcase.send(showcase.build(fields));
      return said(title, sent.ok ? sentText(fields.name, sent.code) : `La proposta non è partita: ${sent.message}`);
    },
  );

  server.registerTool(
    "submit_project",
    {
      title: "Proponi un progetto per il sito di Agentrica",
      description:
        "Propone un progetto fatto con Agentrica per la pagina dei progetti del sito, se l'utente lo chiede (anche senza account GitHub). " +
        "In due passi: 1) con i campi restituisce l'anteprima e un codice; 2) mostra l'anteprima all'utente e solo dopo il suo sì richiama il tool con quel code. " +
        "consent e license sono true solo se l'utente li ha accettati con le sue parole: consenso alla pubblicazione dei dati del modulo e permesso di mostrare nome e descrizione.",
      inputSchema: {
        name: z.string().max(200).optional().describe("Nome del progetto, al più 60 caratteri."),
        url: z.string().max(300).optional().describe("Link https:// pubblico del progetto."),
        description: z.string().max(1000).optional().describe("Cosa fa e come ha usato gli agenti, al più 280 caratteri, senza link."),
        departments: z.string().max(100).optional().describe("Sigle dei reparti usati separate da virgole, es. AISA, AIWDA."),
        agents: z.string().max(200).optional().describe("Id degli agenti usati separati da virgole, facoltativo, al più 10."),
        author: z.string().max(100).optional().describe("Nome da mostrare, facoltativo, al più 40 caratteri."),
        consent: z.boolean().optional().describe("Consenso dell'utente alla pubblicazione dei dati della proposta."),
        license: z.boolean().optional().describe("Permesso dell'utente di mostrare nome e descrizione."),
        code: z.string().regex(/^[0-9a-f]{8}$/).optional().describe("Il codice dell'anteprima, solo dopo il sì dell'utente (secondo passo)."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async ({ code, ...input }) => {
      if (code) {
        const result = await showcase.confirm(code);
        if (!result.ok) return { isError: true, content: [{ type: "text", text: result.message }] };
        return { content: [{ type: "text", text: sentText(result.name, result.code) }] };
      }
      const fields = parseProjectFields(input, known);
      if (typeof fields === "string") return { isError: true, content: [{ type: "text", text: `Proposta non valida: ${fields}.` }] };
      const draft = showcase.draft(fields);
      return { content: [{ type: "text", text: projectPreviewText(draft.code, draft.payload) }] };
    },
  );
}

{
  const title = "Configura Agentrica";
  server.registerPrompt(
    "configura",
    { title, description: `Sceglie squadra, pannello, valutazioni e avviso di versione; le scelte si salvano in ${shownPath}.` },
    async () => {
      const flagsNote = "Le opzioni del comando del server (--agents, --panel, --no-panel, --no-ratings, --no-update-check) hanno la precedenza sul file.";
      if (!configUsable) {
        return said(
          title,
          `Il server gira con il permission model di Node senza accesso a ${shownPath}: la configurazione non si salva. Dillo all'utente: può usare le opzioni del comando del server (--agents, --no-panel, --no-ratings, --no-update-check).`,
        );
      }
      if (fixed.size === 4) return said(title, `Tutte le scelte sono fissate dalle opzioni del comando del server: il file ${shownPath} non conta. Dillo all'utente.`);
      if (!canAsk()) {
        const base = { ...DEFAULTS, ...saved };
        return said(
          title,
          `L'utente vuole configurare Agentrica, ma questo client non mostra i moduli. Configurazione attuale: ${JSON.stringify({ version: 1, ...base })}. ` +
            `Chiedigli cosa cambiare (agents: squadra come --agents, vuota per tutti; panel, ratings, updateCheck: true o false) e scrivi il JSON in ${shownPath}, ` +
            `con le stesse chiavi e version 1. Vale dalla prossima sessione. ${flagsNote}`,
        );
      }
      try {
        return said(title, await askConfig(false));
      } catch {
        return said(title, `Il modulo non è comparso. L'utente può scrivere a mano ${shownPath} o usare le opzioni del comando del server. ${flagsNote}`);
      }
    },
  );
}

server.registerTool(
  "elenca_agenti",
  {
    title: "Elenca gli agenti di Agentrica",
    description: "Elenca gli agenti di Agentrica con id, nome in codice, ruolo, reparto e, dove è stato misurato, il modello consigliato. Il reparto è facoltativo.",
    inputSchema: { reparto: z.enum(codes).optional().describe("Sigla del reparto.") },
    annotations: READ_ONLY,
  },
  async ({ reparto }) => {
    const setup = await firstCall();
    const lines = catalog
      .filter((d) => !reparto || d.code === reparto)
      .flatMap((d) => [
        `## ${d.code} — ${d.name}`,
        d.summary,
        ...d.agents.map((agent) => [`- ${codeName(agent)}: ${agentSummary({ department: d, agent })}`, modelAdvice(agent)].filter(Boolean).join(" ")),
        "",
      ]);
    return remind({ content: [{ type: "text", text: lines.join("\n") }] }, setup);
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
  async ({ id, compito }) => {
    const found = findAgent(catalog, id);
    if (!found) {
      return {
        isError: true,
        content: [{ type: "text", text: "Agente non trovato: usa elenca_agenti per vedere gli id." }],
      };
    }
    const setup = await firstCall();
    const note = await used(found, compito);
    return remind({ content: [{ type: "text", text: agentText(found, compito, textOptions()) }] }, setup, note);
  },
);

const CARD_ID = z.string().regex(/^[a-z0-9][a-z0-9-]{0,59}$/, "Id di una scheda, es. owasp-top-10-2025.");

server.registerTool(
  "library",
  {
    title: "Schede della biblioteca di un reparto",
    description:
      "Restituisce le schede della biblioteca del reparto di un agente: nozioni recenti con fonte, versione e data di verifica. " +
      "Gli id delle schede sono nella sezione «Biblioteca del reparto» delle istruzioni dell'agente (tool agente).",
    inputSchema: {
      id: AGENT_ID,
      cards: z.array(CARD_ID).min(1).max(10).describe("Gli id delle schede da leggere, al più 10."),
    },
    annotations: READ_ONLY,
  },
  ({ id, cards: wanted }) => {
    const found = findAgent(catalog, id);
    const fail = (text: string): ToolResult => ({ isError: true, content: [{ type: "text", text }] });
    if (!found) return fail("Agente non trovato: usa elenca_agenti per vedere gli id.");
    const { library, code } = found.department;
    if (library.length === 0) return fail(`Il reparto ${code} non ha ancora schede.`);
    const unknown = wanted.filter((card) => !library.some((c) => c.id === card));
    if (unknown.length > 0) {
      return fail(`Schede non trovate nel reparto ${code}: ${unknown.join(", ")}. Disponibili: ${library.map((c) => c.id).join(", ")}.`);
    }
    const date = today();
    const cards = [...new Set(wanted)].map((card) => cardText(library.find((c) => c.id === card)!, date));
    return remind({ content: [{ type: "text", text: cards.join("\n\n---\n\n") }] });
  },
);

if (ratings) registerRatingTool(ratings);
if (share) registerShareTool(share);

function registerShareTool(share: Share) {
  server.registerTool(
    "share_usage",
    {
      title: "Invia ad Agentrica i totali di token",
      description:
        "Invia ad Agentrica, in forma anonima, i totali di token di questo progetto negli ultimi 30 giorni (per giorno, agente, modello ed effort), " +
        "che il sito somma a quelli degli altri utenti. In due passi: 1) senza code restituisce l'anteprima di ciò che parte e un codice; " +
        "2) mostra l'anteprima all'utente, chiedigli se inviarla e solo dopo il suo sì richiama il tool con quel code. Non inviare mai senza il sì dell'utente.",
      inputSchema: {
        code: z.string().regex(/^[0-9a-f]{8}$/).optional().describe("Il codice dell'anteprima, solo dopo il sì dell'utente (secondo passo)."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ code }) => {
      if (code) {
        const result = await share.confirm(code);
        if (!result.ok) return { isError: true, content: [{ type: "text", text: result.message }] };
        return { content: [{ type: "text", text: `Totali inviati ad Agentrica (${result.rows} righe), grazie. Dillo all'utente.` }] };
      }
      const draft = await draftShare(share);
      return { content: [{ type: "text", text: sharePreviewText(draft.code, draft.payload, draft.omitted) }] };
    },
  );
}

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
