#!/usr/bin/env node
// Server MCP di Agentrica su stdio: un prompt per agente e tre tool in sola lettura (list_agents, agent e, da F25,
// library, che dà le schede della biblioteca del reparto; gli URL delle fonti restano in fonti.json, mai al modello).
// Con --agents (es. --agents aisa,aiwda-08) prompt e tool vedono solo la squadra; senza, tutti gli agenti.
// Legge i file di agents/ all'avvio e non registra dati. Da F29 legge e, solo dopo il modulo, scrive la configurazione
// in ~/.agentrica/config.json (config.ts): le scelte senza flag vengono da lì; i comandi rate e configure sono prompt
// e il modulo della configurazione compare alla prima chiamata se il file manca. Due tipi di connessione:
// l'invio di una valutazione (F20, ratings.ts) o, da F27, dei totali di token (share.ts), solo dopo la conferma
// dell'utente, e da F23 il controllo della versione sul registro npm all'avvio (update.ts). --no-ratings toglie i tool
// di invio, il modulo e i promemoria; --no-update-check il controllo.
// Da F23 la valutazione la chiede il server con il modulo dell'elicitation MCP, se il client lo supporta: quando si
// carica un altro agente (per il precedente) e dopo 30 minuti d'uso, una volta per agente.
// Da F29 apre di predefinito (prima solo con --panel, F14; --no-panel lo spegne) il pannello locale su 127.0.0.1 (panel.ts), che legge plan/, audit/ e lo stato di git
// della cartella corrente e aggiunge i tool open_panel e ask_user; le chiamate agli agenti restano solo in memoria.
// Da F32 nomi e parametri di tool e prompt sono in inglese (0.9.0, senza alias) e i testi sono nella lingua scelta con
// --lang, con «lang» del file di configurazione o con quella del sistema (texts/): istruzioni, risposte, agenti, pannello.
import { realpathSync } from "node:fs";
import { parseArgs } from "node:util";
import { AGENTS_DIR, loadCatalog, subagentIds, type Department, type DepartmentCode } from "./catalog.ts";
import { canUseConfig, configForm, configMessage, configPath, DEFAULTS, KEYS, parseConfigForm, readConfig, shownPath, writeConfig, type Config, type ConfigKey } from "./config.ts";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { openBrowser, startPanel, type Panel } from "./panel.ts";
import { agentSummary, agentText, cardText, codeName, directorOf, findAgent, introLine, modelAdvice, promptName, selectSquad, today, VERSION, type Found, type SquadDepartment } from "./prompt.ts";
import { createRatings, formMessage, MAX_COMMENT, parseForm, previewText, ratingForm, RATINGS_URL, REMINDER_AFTER_MS, type RatingInput, type Ratings } from "./ratings.ts";
import { createShare, SHARE_URL, sharePreviewText, type Share } from "./share.ts";
import { createShowcase, parseProjectFields, projectForm, PROJECTS_URL, projectFormMessage, projectPreviewText, sentText, type Showcase } from "./showcase.ts";
import { chooseLang, isLang, lang, setLang, T } from "./texts/index.ts";
import { claudeProjectDir, readUsage, shareRows, subagentRuns, type Usage } from "./usage.ts";
import { fetchLatest, installKind, isNewer, REGISTRY_URL, updateMessage } from "./update.ts";

// Un errore all'avvio ferma il server con una riga sola su stderr, che il client mostra nei log. Il messaggio può
// contenere argomenti della configurazione del client: i caratteri di controllo (a capo, escape) diventano \uXXXX.
function fail(message: string): never {
  const safe = message.replace(/\p{Cc}/gu, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
  process.stderr.write(`agentrica: ${safe}\n`);
  process.exit(1);
}
const reason = (error: unknown) => (error instanceof Error ? error.message : String(error));

// La lingua (F32) si sceglie prima di tutto, anche per init, add e install: --lang, poi il file salvato, poi il sistema.
// Qui --lang si cerca a mano fra gli argomenti; il valore lo controllano poi parseArgs dei comandi.
{
  const args = process.argv.slice(2);
  const at = args.findIndex((arg) => arg === "--lang" || arg.startsWith("--lang="));
  const flag = at === -1 ? undefined : args[at]!.includes("=") ? args[at]!.slice("--lang=".length) : args[at + 1];
  const file = configPath();
  const read = canUseConfig(file) ? readConfig(file) : undefined;
  setLang(chooseLang(isLang(flag) ? flag : undefined, read && "config" in read ? read.config.lang : undefined));
}

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
      lang: { type: "string" },
      agents: { type: "string" },
      panel: { type: "boolean" },
      "no-panel": { type: "boolean" },
      "no-ratings": { type: "boolean" },
      "no-update-check": { type: "boolean" },
    },
  });
  if (values.panel && values["no-panel"]) throw new Error(T.server.panelBoth);
  if (values.lang !== undefined) {
    if (!isLang(values.lang)) throw new Error(T.server.langInvalid(values.lang));
    flags.lang = values.lang;
  }
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
  full = loadCatalog(lang);
} catch (error) {
  // Senza catalogo completo il server non parte: niente contenuti parziali.
  fail(T.server.catalogUnreadable(AGENTS_DIR, reason(error)));
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
      invalid = T.server.squadInvalid;
    }
  }
  if (invalid) process.stderr.write(`agentrica: ${T.server.configIgnored(shownPath, invalid)}\n`);
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
    notes.push(T.server.updateNote(update));
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
    const root = realpathSync(process.cwd());
    const started = Date.now();
    panel = await startPanel(root, panelRatings, () => update, () => subagentRuns(claudeProjectDir(root), started));
  } catch (error) {
    if (flags.panel) fail(T.server.panelFailed(reason(error)));
    process.stderr.write(`agentrica: ${T.server.panelSkipped(reason(error).replace(/\p{Cc}/gu, " "))}\n`);
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
  panel?.record({
    id: agent.id,
    codeName: codeName(agent),
    role: agent.role,
    department: `${department.code} · ${department.short}`,
    director: agent.number === 1,
    // Il compito intero (fino a 20.000 caratteri, il limite di TASK): la pagina mostra la prima riga e il resto a richiesta.
    task: (task ?? "").trim(),
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
 * `asked` (il comando rate) lo mostra anche per un agente non caricato o per cui era già comparso.
 */
async function askRating(agentId: string, asked = false): Promise<string | undefined> {
  const found = findAgent(catalog, agentId);
  if (!ratings || !found || !canAsk()) return undefined;
  if (asked) {
    ratings.loaded(agentId);
    ratings.claimAsk(agentId);
  } else if (!ratings.claimAsk(agentId)) return undefined;
  const name = codeName(found.agent);
  const result = await elicit({ message: formMessage(introLine(found)), requestedSchema: ratingForm() });
  if (result.action !== "accept") return undefined;
  const input = parseForm(agentId, result.content);
  if (!input) return T.server.ratingInvalid(name);
  const sent = await ratings.send(ratings.build(input));
  return sent.ok ? T.server.ratingSent(name, sent.usageId) : T.server.ratingFailed(name, sent.message);
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
let configAsked = !configUsable || saved !== undefined || fixed.size === KEYS.length;

/**
 * Mostra il modulo della configurazione e salva le scelte. Alla prima chiamata (`first`) un modulo chiuso salva i
 * valori proposti, così non ricompare; dal comando configure non salva nulla. Restituisce la frase per il modello.
 */
async function askConfig(first: boolean): Promise<string> {
  configAsked = true;
  const base = { ...DEFAULTS, ...saved };
  const result = await elicit({ message: configMessage(fixed), requestedSchema: configForm(base, fixed) });
  if (result.action !== "accept" && !first) return T.server.configClosed;
  const chosen = result.action === "accept" ? parseConfigForm(base, result.content) : base;
  if (!chosen) return T.server.configInvalid;
  try {
    selectSquad(full, chosen.agents || undefined, true);
  } catch (error) {
    return T.server.configBadSquad(reason(error));
  }
  try {
    writeConfig(configFile, chosen);
  } catch (error) {
    return T.server.configWriteFailed(shownPath, (error as NodeJS.ErrnoException).code ?? reason(error));
  }
  saved = chosen;
  return result.action === "accept" ? T.server.configSaved(shownPath) : T.server.configDefaultsSaved(shownPath);
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
    instructions: T.server.instructions({
      agents: all.length,
      departments: catalog.length,
      codes: codes.join(", "),
      example: promptName(all[0]!),
      exampleId: all[0]!.agent.id,
      panel: Boolean(panel),
      ratings: Boolean(ratings),
    }),
  },
);

const TASK = z.string().max(20_000).optional().describe(T.server.task);
const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;
// Id ammesso: una sigla di tutto il catalogo (non solo della squadra, così fuori squadra è «non trovato») e due cifre.
const ID = new RegExp(`^(?:${full.map((d) => d.code).join("|")})-\\d{2}$`, "i");
const AGENT_ID = z.string().regex(ID, T.server.agentIdFormat).describe(T.server.agentId);
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
    lines.push(T.server.reminder(names));
  }
  if (lines.length === 0) return result;
  return { ...result, content: [...result.content, ...lines.map((text) => ({ type: "text" as const, text }))] };
}

/** La proposta di valutazione nel testo dell'agente serve solo ai client senza moduli. */
const textOptions = () => ({ ratings: Boolean(ratings) && !canAsk(), report: Boolean(panel) });

for (const found of all) {
  const title = `${codeName(found.agent)} — ${found.agent.role}`;
  server.registerPrompt(
    promptName(found),
    { title, description: agentSummary(found), argsSchema: { task: TASK } },
    async ({ task }) => {
      // Un prompt non ha una risposta di tool: l'esito dei moduli va alla prossima.
      for (const note of [await firstCall(), await used(found, task)]) if (note) notes.push(note);
      return {
        description: title,
        messages: [{ role: "user", content: { type: "text", text: agentText(found, task, textOptions()) } }],
      };
    },
  );
}

/** La risposta di un comando (rate, project, configure): un messaggio per il modello. */
const said = (title: string, text: string) => ({ description: title, messages: [{ role: "user" as const, content: { type: "text" as const, text } }] });

if (ratings) {
  const t = T.server.rate;
  server.registerPrompt(
    "rate",
    {
      title: t.title,
      description: t.description,
      argsSchema: { agent: z.string().max(20).optional().describe(t.agent) },
    },
    async ({ agent }) => {
      const id = agent?.trim() || current;
      if (!id) return said(t.title, t.noneUsed);
      const found = ID.test(id) ? findAgent(catalog, id) : undefined;
      if (!found) return said(t.title, t.notInSquad);
      const name = codeName(found.agent);
      if (ratings.isRated(found.agent.id)) return said(t.title, t.alreadyRated(name));
      const manual = t.manual(name, found.agent.id);
      if (!canAsk()) return said(t.title, manual);
      try {
        const note = await askRating(found.agent.id, true);
        return said(t.title, note ?? t.closed(name));
      } catch {
        ratings.unclaimAsk(found.agent.id);
        return said(t.title, manual);
      }
    },
  );
}

if (showcase) registerShowcase(showcase);

/** Il comando project e il tool submit_project (F29-08): proporre un progetto senza account GitHub, o ritirarlo. */
function registerShowcase(showcase: Showcase) {
  const t = T.server.project;
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  server.registerPrompt(
    "project",
    {
      title: t.title,
      description: t.description,
      argsSchema: { remove: z.string().max(40).optional().describe(t.remove) },
    },
    async ({ remove }) => {
      if (remove !== undefined) {
        if (!UUID.test(remove.trim())) return said(t.title, t.badCode);
        const result = await showcase.withdraw(remove.trim().toLowerCase());
        return said(t.title, result.ok ? t.withdrawn : t.tellUser(result.message));
      }
      if (!canAsk()) return said(t.title, t.manual);
      let result;
      try {
        result = await elicit({ message: projectFormMessage(), requestedSchema: projectForm() });
      } catch {
        return said(t.title, t.manual);
      }
      if (result.action !== "accept") return said(t.title, t.closed);
      const fields = parseProjectFields(result.content ?? {}, known);
      if (typeof fields === "string") return said(t.title, t.badFields(fields));
      const sent = await showcase.send(showcase.build(fields));
      return said(t.title, sent.ok ? sentText(fields.name, sent.code) : t.failed(sent.message));
    },
  );

  const u = T.server.submit;
  server.registerTool(
    "submit_project",
    {
      title: u.title,
      description: u.description,
      inputSchema: {
        name: z.string().max(200).optional().describe(u.name),
        url: z.string().max(300).optional().describe(u.url),
        description: z.string().max(1000).optional().describe(u.projectDescription),
        departments: z.string().max(100).optional().describe(u.departments),
        agents: z.string().max(200).optional().describe(u.agents),
        author: z.string().max(100).optional().describe(u.author),
        consent: z.boolean().optional().describe(u.consent),
        license: z.boolean().optional().describe(u.license),
        code: z.string().regex(/^[0-9a-f]{8}$/).optional().describe(u.code),
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
      if (typeof fields === "string") return { isError: true, content: [{ type: "text", text: u.invalid(fields) }] };
      const draft = showcase.draft(fields);
      return { content: [{ type: "text", text: projectPreviewText(draft.code, draft.payload) }] };
    },
  );
}

{
  const t = T.server.configure;
  server.registerPrompt("configure", { title: t.title, description: t.description(shownPath) }, async () => {
    if (!configUsable) return said(t.title, t.noPermission(shownPath));
    if (fixed.size === KEYS.length) return said(t.title, t.allFixed(shownPath));
    if (!canAsk()) return said(t.title, t.noForms(JSON.stringify({ version: 1, ...DEFAULTS, ...saved }), shownPath, t.flagsNote));
    try {
      return said(t.title, await askConfig(false));
    } catch {
      return said(t.title, t.formNotShown(shownPath, t.flagsNote));
    }
  });
}

server.registerTool(
  "list_agents",
  {
    title: T.server.listAgents.title,
    description: T.server.listAgents.description,
    inputSchema: { department: z.enum(codes).optional().describe(T.server.listAgents.department) },
    annotations: READ_ONLY,
  },
  async ({ department }) => {
    const setup = await firstCall();
    const lines = catalog
      .filter((d) => !department || d.code === department)
      .flatMap((d) => [
        `## ${d.code} — ${d.name}`,
        d.summary,
        ...[directorOf(d)].filter((a) => a !== undefined).map((a) => T.server.listAgents.lead(codeName(a))),
        ...d.agents.map((agent) => [`- ${codeName(agent)}: ${agentSummary({ department: d, agent })}`, modelAdvice(agent)].filter(Boolean).join(" ")),
        "",
      ]);
    return remind({ content: [{ type: "text", text: lines.join("\n") }] }, setup);
  },
);

server.registerTool(
  "agent",
  {
    title: T.server.agent.title,
    description: T.server.agent.description,
    inputSchema: {
      id: AGENT_ID,
      task: TASK,
    },
    annotations: READ_ONLY,
  },
  async ({ id, task }) => {
    const found = findAgent(catalog, id);
    if (!found) return { isError: true, content: [{ type: "text", text: T.server.agent.notFound }] };
    const setup = await firstCall();
    const note = await used(found, task);
    return remind({ content: [{ type: "text", text: agentText(found, task, textOptions()) }] }, setup, note);
  },
);

const CARD_ID = z.string().regex(/^[a-z0-9][a-z0-9-]{0,59}$/, T.server.library.cardIdFormat);

server.registerTool(
  "library",
  {
    title: T.server.library.title,
    description: T.server.library.description,
    inputSchema: {
      id: AGENT_ID,
      cards: z.array(CARD_ID).min(1).max(10).describe(T.server.library.cards),
    },
    annotations: READ_ONLY,
  },
  ({ id, cards: wanted }) => {
    const found = findAgent(catalog, id);
    const fail = (text: string): ToolResult => ({ isError: true, content: [{ type: "text", text }] });
    if (!found) return fail(T.server.agent.notFound);
    const { library, code } = found.department;
    if (library.length === 0) return fail(T.server.library.empty(code));
    const unknown = wanted.filter((card) => !library.some((c) => c.id === card));
    if (unknown.length > 0) return fail(T.server.library.unknown(code, unknown.join(", "), library.map((c) => c.id).join(", ")));
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
      title: T.server.share.title,
      description: T.server.share.description,
      inputSchema: {
        code: z.string().regex(/^[0-9a-f]{8}$/).optional().describe(T.server.share.code),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ code }) => {
      if (code) {
        const result = await share.confirm(code);
        if (!result.ok) return { isError: true, content: [{ type: "text", text: result.message }] };
        return { content: [{ type: "text", text: T.server.share.sent(result.rows) }] };
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
      title: T.server.rateAgent.title,
      description: T.server.rateAgent.description,
      inputSchema: {
        id: AGENT_ID,
        rating: z.number().int().min(1).max(5).optional().describe(T.server.rateAgent.rating),
        comment: z.string().max(MAX_COMMENT).optional().describe(T.server.rateAgent.comment),
        publish: z.boolean().optional().describe(T.server.rateAgent.publish),
        code: z.string().regex(/^[0-9a-f]{8}$/).optional().describe(T.server.rateAgent.code),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async ({ id, rating, comment, publish, code }) => {
      const found = findAgent(catalog, id);
      const fail = (text: string): ToolResult => ({ isError: true, content: [{ type: "text", text }] });
      if (!found) return fail(T.server.agent.notFound);
      if (ratings.isRated(found.agent.id)) return fail(T.server.rateAgent.alreadyRated(codeName(found.agent)));
      if (code) {
        const result = await ratings.confirm(code, found.agent.id);
        if (!result.ok) return fail(result.message);
        return { content: [{ type: "text", text: T.server.rateAgent.sent(codeName(found.agent), result.usageId) }] };
      }
      if (rating === undefined) return fail(T.server.rateAgent.needRating);
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
      title: T.server.openPanel.title,
      description: T.server.openPanel.description,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    () => {
      openBrowser(panel.url);
      return remind({
        content: [{ type: "text", text: T.server.openPanel.opened(panel.url) }],
      });
    },
  );

  const r = T.server.report;
  server.registerTool(
    "report",
    {
      title: r.title,
      description: r.description,
      inputSchema: { id: AGENT_ID, summary: z.string().min(1).max(4000).describe(r.summary) },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ id, summary }) => {
      const found = findAgent(catalog, id);
      if (!found || !panel.report(found.agent.id, summary.trim())) return { isError: true, content: [{ type: "text", text: r.notLoaded }] };
      return remind({ content: [{ type: "text", text: r.saved(codeName(found.agent)) }] });
    },
  );

  const a = T.server.askUser;
  const option = z.object({
    label: z.string().min(1).max(80).describe(a.label),
    description: z.string().max(500).describe(a.optionDescription),
  });

  server.registerTool(
    "ask_user",
    {
      title: a.title,
      description: a.description,
      inputSchema: {
        question: z.string().min(1).max(2000).describe(a.question),
        header: z.string().max(40).optional().describe(a.header),
        options: z.array(option).min(2).max(4).describe(a.options),
        multiple: z.boolean().optional().describe(a.multiple),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ question, header, options, multiple }, extra) => {
      const labels = options.map((o) => o.label);
      if (new Set(labels).size !== labels.length) {
        return { isError: true, content: [{ type: "text", text: a.duplicate }] };
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
                  params: { progressToken, progress: ++progress, message: a.waiting },
                })
                .catch(() => {});
            }, PROGRESS_MS);
      if (!panel.hasViewers()) openBrowser(panel.url);
      try {
        const answer = await panel.ask(
          { question, header: header ?? "", options, multiple: multiple ?? false },
          AbortSignal.any([extra.signal, AbortSignal.timeout(wait)]),
        );
        const chosen = answer.choices.length ? a.chosen(answer.choices.join("; ")) : a.none;
        return remind({ content: [{ type: "text", text: answer.note ? `${chosen}\n${a.note(answer.note)}` : chosen }] });
      } catch {
        return {
          content: [{ type: "text", text: a.timeout(Math.round(wait / 60_000)) }],
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
