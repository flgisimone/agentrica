// `agentrica-mcp init [cartella] [--name "Nome"] [--subagents]` (F18, al posto di agentic-starter): crea un progetto con la
// governance di Agentrica. Copia starter/ (AGENTS, CONVENTIONS, plan/, audit/, docs/, CI), gli agents/ del pacchetto e, solo
// con --subagents (F34-05), i subagent di .claude/agents/ con il nome del progetto e il tool agent del server come primo
// passo; scrive .mcp.json con questo pacchetto a versione esatta e, fuori da un repository git, fa il primo commit su main
// e lascia attivo develop. È l'unico comando che scrive: il server resta in sola lettura. Se anche un solo file esiste già
// non scrive nulla.
// Da F32 nella lingua scelta (--lang, configurazione o sistema): in inglese starter e subagent vengono da starter/en/
// (i subagent in starter/en/.claude/agents/); agents/ si copia intero, con i file italiani e quelli di en/.
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
/** I subagent di Agentrica nominano il progetto solo in questa frase, per lingua (lo controlla init.test.ts). */
export const subagentProject = (lang: Lang, name = "Agentrica") => TEXTS[lang].init.subagentProject(name);
// npm non pubblica i file .gitignore: in starter/ si chiama gitignore (e non vale per il repository di Agentrica).
const RENAMED: Record<string, string> = { gitignore: ".gitignore" };

function filesIn(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== ".DS_Store")
    // Percorsi con «/» anche su Windows: sono le chiavi dei file del progetto.
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join("/"))
    .sort();
}

// I tool del server che un subagent copiato con --subagents può chiamare: il nome «agentrica» è quello di .mcp.json.
const SERVER_TOOLS = ["mcp__agentrica__agent", "mcp__agentrica__library"];

/**
 * Un subagent copiato con --subagents (F34-05): i tool del server fra i `tools` e, prima del testo, il primo passo che
 * carica il suo agente con agent. Così passa dal server e il pannello lo mostra fra gli agenti in uso.
 */
export function serverSubagent(text: string, id: string, lang: Lang): string {
  const end = text.indexOf("\n---\n", 4) + "\n---\n".length;
  const head = text.slice(0, end).replace(/^tools: (.+)$/m, (_, tools: string) => `tools: ${[tools, ...SERVER_TOOLS].join(", ")}`);
  return `${head}\n${TEXTS[lang].init.subagentFirst(id)}\n${text.slice(end)}`;
}

/** I file del progetto nuovo, per percorso relativo, con i segnaposto già sostituiti; i subagent solo con `subagents`. */
export function projectFiles(name: string, path: string, date: string, platform: NodeJS.Platform = process.platform, lang: Lang = "it", subagents = false): Map<string, string> {
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
  const npx = ["-y", `@agentrica/mcp@${VERSION}`];
  const server = platform === "win32" ? { command: "cmd", args: ["/c", "npx", ...npx] } : { command: "npx", args: npx };
  files.set(".mcp.json", `${JSON.stringify({ mcpServers: { agentrica: server } }, null, 2)}\n`);
  return files;
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

/** Esegue il comando; restituisce il codice di uscita. */
export function runInit(args: string[]): number {
  try {
    const { values, positionals } = parseArgs({ args, options: { name: { type: "string" }, lang: { type: "string" }, subagents: { type: "boolean" } }, allowPositionals: true });
    if (positionals.length > 1) throw new Error(T.init.usage);
    if (values.lang !== undefined && !isLang(values.lang)) throw new Error(T.server.langInvalid(values.lang));
    const dir = resolve(positionals[0] ?? ".");
    const name = (values.name ?? basename(dir)).trim();
    if (!name || /\p{Cc}/u.test(name)) throw new Error(T.init.badName);

    // La lingua è già quella del server (server.ts legge --lang prima di init): qui serve solo a scegliere i file.
    const files = projectFiles(name, dir, new Date().toISOString().slice(0, 10), process.platform, serverLang, values.subagents);
    const taken = [...files.keys()].filter((file) => existsSync(join(dir, file)));
    if (taken.length > 0) throw new Error(T.init.taken(taken.slice(0, 5).join(", "), Math.max(0, taken.length - 5)));
    for (const [file, text] of files) {
      mkdirSync(dirname(join(dir, file)), { recursive: true });
      writeFileSync(join(dir, file), text, { flag: "wx" });
    }

    process.stdout.write(
      [
        T.init.created(name, dir, files.size),
        initGit(dir),
        "",
        T.init.next,
        T.init.step1(dir),
        T.init.step2,
        "",
      ].join("\n"),
    );
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`agentrica init: ${message.replace(/\p{Cc}/gu, " ")}\n`);
    return 1;
  }
}
