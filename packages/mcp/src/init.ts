// `aigentrica-mcp init [cartella] [--name "Nome"] [--subagents] [--existing] [--no-reminder]` (F18, al posto di agentic-starter): crea un
// progetto con la governance di AIgentrica. Copia starter/ (AGENTS, CONVENTIONS, plan/, audit/, docs/, CI), gli agents/ del
// pacchetto e, solo con --subagents (F34-05), i subagent di .claude/agents/ con il nome del progetto e il tool agent del
// server come primo passo; scrive .mcp.json con questo pacchetto a versione esatta e, fuori da un repository git, fa il
// primo commit su main e lascia attivo develop. È l'unico comando che scrive: il server resta in sola lettura. Senza
// --existing, se anche un solo file esiste già non scrive nulla.
// Da F32 nella lingua scelta (--lang, configurazione o sistema): in inglese starter e subagent vengono da starter/en/
// (i subagent in starter/en/.claude/agents/); agents/ si copia intero, con i file italiani e quelli di en/.
// Da F35 `--existing` porta le regole in un progetto già avviato: scrive solo i file che mancano, salta gli altri e li
// elenca, non fa commit; il piano parte senza fasi (niente F0 «base tecnica») e niente CI, .nvmrc ed .env.example, che
// sono la base tecnica di un progetto nuovo.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import { AGENTS_DIR, loadCatalog, SUBAGENTS_DIR, subagentIds } from "./catalog.ts";
import { VERSION } from "./prompt.ts";
import { isLang, lang as serverLang, T, TEXTS, type Lang } from "./texts/index.ts";

// starter/, agents/ e .claude/agents/ stanno nella root del repository e, copiati da prepack, in quella del pacchetto.
const ROOT = dirname(AGENTS_DIR);
const STARTER_DIR = join(ROOT, "starter");
const EN = "en";
/** I subagent di AIgentrica nominano il progetto solo in questa frase, per lingua (lo controlla init.test.ts). */
export const subagentProject = (lang: Lang, name = "AIgentrica") => TEXTS[lang].init.subagentProject(name);
// npm non pubblica i file .gitignore: in starter/ si chiama gitignore (e non vale per il repository di AIgentrica).
const RENAMED: Record<string, string> = { gitignore: ".gitignore" };

function filesIn(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== ".DS_Store")
    // Percorsi con «/» anche su Windows: sono le chiavi dei file del progetto.
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join("/"))
    .sort();
}

// I tool del server che un subagent copiato con --subagents può chiamare: il nome «aigentrica» è quello di .mcp.json.
const SERVER_TOOLS = ["mcp__aigentrica__agent", "mcp__aigentrica__library"];

/**
 * Un subagent copiato con --subagents (F34-05): i tool del server fra i `tools` e, prima del testo, il primo passo che
 * carica il suo agente con agent. Così passa dal server e il pannello lo mostra fra gli agenti in uso.
 */
export function serverSubagent(text: string, id: string, lang: Lang): string {
  const end = text.indexOf("\n---\n", 4) + "\n---\n".length;
  const head = text.slice(0, end).replace(/^tools: (.+)$/m, (_, tools: string) => `tools: ${[tools, ...SERVER_TOOLS].join(", ")}`);
  return `${head}\n${TEXTS[lang].init.subagentFirst(id)}\n${text.slice(end)}`;
}

/**
 * Il comando dell'hook UserPromptSubmit (F39-01): Claude Code aggiunge al contesto ciò che stampa, a ogni richiesta.
 * node c'è perché avvia il server; lo stesso comando va in sh, PowerShell e cmd: il testo è fra virgolette singole
 * dentro le doppie, e i caratteri non ASCII diventano \uXXXX, che nessuna shell tocca.
 */
export function reminderCommand(text: string): string {
  if (/['"$`%!\\]/.test(text)) throw new Error(`promemoria con caratteri della shell: ${text}`);
  const ascii = text.replace(/[^\x20-\x7e]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
  return `node -e "console.log('${ascii}')"`;
}

/** I file del progetto nuovo, per percorso relativo, con i segnaposto già sostituiti; i subagent solo con `subagents`. */
export function projectFiles(name: string, path: string, date: string, platform: NodeJS.Platform = process.platform, lang: Lang = "it", subagents = false, reminder = true): Map<string, string> {
  const values: Record<string, string> = { "{{PROJECT_NAME}}": name, "{{PROJECT_PATH}}": path, "{{DATE}}": date };
  const fill = (text: string) => Object.entries(values).reduce((out, [key, value]) => out.split(key).join(value), text);
  const files = new Map<string, string>();
  const starter = lang === "en" ? join(STARTER_DIR, EN) : STARTER_DIR;
  const subagentDir = lang === "en" ? join(starter, ".claude", "agents") : SUBAGENTS_DIR;
  const inStarter = filesIn(starter).filter((file) => !file.startsWith(lang === "en" ? ".claude/" : `${EN}/`));
  for (const file of inStarter) files.set(RENAMED[file] ?? file, fill(readFileSync(join(starter, file), "utf8")));
  for (const file of filesIn(AGENTS_DIR)) files.set(`agents/${file}`, readFileSync(join(AGENTS_DIR, file), "utf8"));
  const ids = subagents ? subagentIds(loadCatalog(), subagentDir) : new Map<string, string>();
  for (const file of subagents ? filesIn(subagentDir) : []) {
    const text = readFileSync(join(subagentDir, file), "utf8").split(subagentProject(lang)).join(subagentProject(lang, name));
    const id = ids.get(/^name: ([\w-]+)$/m.exec(text)?.[1] ?? "");
    if (!id) throw new Error(`subagent senza agente: ${file}`);
    files.set(`.claude/agents/${file}`, serverSubagent(text, id, lang));
  }
  // Su Windows npx è npx.cmd, che Claude Code non avvia senza cmd /c (F23).
  // Da F29 il pannello parte di predefinito: niente --panel, così la configurazione salvata dell'utente vale anche qui.
  const npx = ["-y", `@aigentrica/mcp@${VERSION}`];
  const server = platform === "win32" ? { command: "cmd", args: ["/c", "npx", ...npx] } : { command: "npx", args: npx };
  files.set(".mcp.json", `${JSON.stringify({ mcpServers: { aigentrica: server } }, null, 2)}\n`);
  if (reminder) {
    const hooks = { UserPromptSubmit: [{ hooks: [{ type: "command", command: reminderCommand(TEXTS[lang].init.reminder) }] }] };
    files.set(".claude/settings.json", `${JSON.stringify({ hooks }, null, 2)}\n`);
  }
  return files;
}

// I file della base tecnica di un progetto nuovo: in un progetto avviato ci sono già, o li sceglie chi lo mantiene.
const NEW_ONLY = [/^\.github\//, /^\.nvmrc$/, /^\.env\.example$/, /^plan\/00-base\.md$/];

/** I file di `init --existing`: niente base tecnica e un piano senza fasi, con l'indicazione di crearle. */
export function existingFiles(files: Map<string, string>, lang: Lang): Map<string, string> {
  const out = new Map([...files].filter(([file]) => !NEW_ONLY.some((pattern) => pattern.test(file))));
  const plan = out.get("plan/README.md")!
    .split("`npx @aigentrica/mcp init`").join("`npx @aigentrica/mcp init --existing`")
    .replace(/^\| F0 \|.*\n/m, "")
    .replace(/^(Ordine|Order): F0 .*$/m, TEXTS[lang].init.noPhases);
  out.set("plan/README.md", plan);
  return out;
}

function git(dir: string, args: string[]): string {
  return execFileSync("git", args, { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

// Repository nuovo solo se la cartella non è già dentro uno: un progetto creato in un monorepo resta del monorepo.
function initGit(dir: string): string {
  try {
    if (git(dir, ["rev-parse", "--is-inside-work-tree"]) === "true") return T.init.inRepo;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return T.init.noGit;
  }
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["add", "-A"]);
  try {
    git(dir, ["commit", "-q", "-m", T.init.commit]);
  } catch {
    return T.init.commitFailed;
  }
  git(dir, ["checkout", "-q", "-b", "develop"]);
  return T.init.committed;
}

// I file saltati per cartella: agents/ e .claude/agents/ contano decine di file, l'elenco resta di poche righe.
function summarize(files: string[]): string {
  const groups = new Map<string, number>();
  for (const file of files) {
    const key = /^(agents|\.claude\/agents)\//.exec(file)?.[0] ?? file;
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  return [...groups].map(([key, count]) => (key.endsWith("/") ? `${key} (${count})` : key)).join(", ");
}

/**
 * Aggiunge il promemoria a `.claude/settings.json` di un progetto che c'è già (F44-08, comando `reminder`): crea il file
 * se manca, altrimenti aggiunge l'hook a `hooks.UserPromptSubmit` lasciando il resto com'è. Se il promemoria c'è già,
 * in una delle due lingue, non lo ripete. Un file che non è un oggetto JSON non si tocca. Il file riscritto tiene il
 * rientro (il primo della prima riga rientrata, 2 spazi se non ce n'è), il fine riga e l'a capo finale che aveva.
 */
export function addReminder(dir: string, lang: Lang): "added" | "present" {
  const file = join(dir, ".claude", "settings.json");
  const hook = { type: "command", command: reminderCommand(TEXTS[lang].init.reminder) };
  if (!existsSync(file)) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify({ hooks: { UserPromptSubmit: [{ hooks: [hook] }] } }, null, 2)}\n`, { flag: "wx" });
    return "added";
  }
  let settings: unknown;
  let text: string;
  try {
    text = readFileSync(file, "utf8");
    settings = JSON.parse(text);
  } catch {
    throw new Error(T.init.reminderBadSettings);
  }
  const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
  if (!isObject(settings)) throw new Error(T.init.reminderBadSettings);
  const hooks = settings.hooks ?? {};
  if (!isObject(hooks)) throw new Error(T.init.reminderBadSettings);
  const groups = hooks.UserPromptSubmit ?? [];
  if (!Array.isArray(groups)) throw new Error(T.init.reminderBadSettings);
  const ours = new Set(Object.values(TEXTS).map((texts) => reminderCommand(texts.init.reminder)));
  const present = groups.some((group) => isObject(group) && Array.isArray(group.hooks) && group.hooks.some((h) => isObject(h) && ours.has(String(h.command))));
  if (present) return "present";
  settings.hooks = { ...hooks, UserPromptSubmit: [...groups, { hooks: [hook] }] };
  const indent = /^([ \t]+)\S/m.exec(text)?.[1] ?? 2;
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const json = JSON.stringify(settings, null, indent).replace(/\n/g, eol);
  writeFileSync(file, /\r?\n$/.test(text) ? `${json}${eol}` : json);
  return "added";
}

/** `aigentrica-mcp reminder [cartella]`: il promemoria in un progetto già avviato; restituisce il codice di uscita. */
export function runReminder(args: string[]): number {
  try {
    const { values, positionals } = parseArgs({ args, options: { lang: { type: "string" } }, allowPositionals: true });
    if (positionals.length > 1) throw new Error(T.init.reminderUsage);
    if (values.lang !== undefined && !isLang(values.lang)) throw new Error(T.server.langInvalid(values.lang));
    const dir = resolve(positionals[0] ?? ".");
    const done = addReminder(dir, serverLang);
    process.stdout.write(`${done === "added" ? T.init.reminderAdded(join(dir, ".claude", "settings.json")) : T.init.reminderPresent}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`aigentrica reminder: ${message.replace(/\p{Cc}/gu, " ")}\n`);
    return 1;
  }
}

/** Esegue il comando; restituisce il codice di uscita. */
export function runInit(args: string[]): number {
  try {
    const { values, positionals } = parseArgs({ args, options: { name: { type: "string" }, lang: { type: "string" }, subagents: { type: "boolean" }, existing: { type: "boolean" }, "no-reminder": { type: "boolean" } }, allowPositionals: true });
    if (positionals.length > 1) throw new Error(T.init.usage);
    if (values.lang !== undefined && !isLang(values.lang)) throw new Error(T.server.langInvalid(values.lang));
    const dir = resolve(positionals[0] ?? ".");
    const name = (values.name ?? basename(dir)).trim();
    if (!name || /\p{Cc}/u.test(name)) throw new Error(T.init.badName);

    // La lingua è già quella del server (server.ts legge --lang prima di init): qui serve solo a scegliere i file.
    const all = projectFiles(name, dir, new Date().toISOString().slice(0, 10), process.platform, serverLang, values.subagents, !values["no-reminder"]);
    const files = values.existing ? existingFiles(all, serverLang) : all;
    const taken = [...files.keys()].filter((file) => existsSync(join(dir, file)));
    if (taken.length > 0 && !values.existing) throw new Error(T.init.taken(taken.slice(0, 5).join(", "), Math.max(0, taken.length - 5)));
    const written = [...files].filter(([file]) => !taken.includes(file));
    for (const [file, text] of written) {
      mkdirSync(dirname(join(dir, file)), { recursive: true });
      writeFileSync(join(dir, file), text, { flag: "wx" });
    }

    // Un CLAUDE.md dell'utente non importa l'AGENTS.md appena scritto: lo si dice, senza toccarlo.
    const claude = [
      ...(taken.includes("CLAUDE.md") && !taken.includes("AGENTS.md") ? [T.init.importAgents] : []),
      ...(taken.includes(".claude/settings.json") ? [T.init.reminderSkipped] : []),
    ];
    const lines = values.existing
      ? [T.init.added(name, dir, written.length), ...(taken.length > 0 ? [T.init.skipped(summarize(taken))] : []), ...claude, T.init.noCommit, "", T.init.next, taken.includes(".mcp.json") ? T.init.step1Registered(dir) : T.init.step1(dir), T.init.stepExisting]
      : [T.init.created(name, dir, files.size), initGit(dir), "", T.init.next, T.init.step1(dir), T.init.step2];
    process.stdout.write([...lines, ""].join("\n"));
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`aigentrica init: ${message.replace(/\p{Cc}/gu, " ")}\n`);
    return 1;
  }
}
