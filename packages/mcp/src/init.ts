// `agentrica-mcp init [cartella] [--name "Nome"]` (F18, al posto di agentic-starter): crea un progetto con la governance
// di Agentrica. Copia starter/ (AGENTS, CONVENTIONS, plan/, audit/, docs/, CI), gli agents/ del pacchetto e i subagent
// di .claude/agents/ con il nome del progetto, scrive .mcp.json con questo pacchetto a versione esatta e, fuori da un
// repository git, fa il primo commit su main e lascia attivo develop. È l'unico comando che scrive: il server resta in
// sola lettura. Se anche un solo file esiste già non scrive nulla.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import { AGENTS_DIR, SUBAGENTS_DIR } from "./catalog.ts";
import { VERSION } from "./prompt.ts";

// starter/, agents/ e .claude/agents/ stanno nella root del repository e, copiati da prepack, in quella del pacchetto.
const ROOT = dirname(AGENTS_DIR);
const STARTER_DIR = join(ROOT, "starter");
/** I subagent di Agentrica nominano il progetto solo in questa frase (lo controlla init.test.ts). */
export const SUBAGENT_PROJECT = "del progetto Agentrica.";
// npm non pubblica i file .gitignore: in starter/ si chiama gitignore (e non vale per il repository di Agentrica).
const RENAMED: Record<string, string> = { gitignore: ".gitignore" };

function filesIn(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== ".DS_Store")
    // Percorsi con «/» anche su Windows: sono le chiavi dei file del progetto.
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join("/"))
    .sort();
}

/** I file del progetto nuovo, per percorso relativo, con i segnaposto già sostituiti. */
export function projectFiles(name: string, path: string, date: string, platform: NodeJS.Platform = process.platform): Map<string, string> {
  const values: Record<string, string> = { "{{PROJECT_NAME}}": name, "{{PROJECT_PATH}}": path, "{{DATE}}": date };
  const fill = (text: string) => Object.entries(values).reduce((out, [key, value]) => out.split(key).join(value), text);
  const files = new Map<string, string>();
  for (const file of filesIn(STARTER_DIR)) files.set(RENAMED[file] ?? file, fill(readFileSync(join(STARTER_DIR, file), "utf8")));
  for (const file of filesIn(AGENTS_DIR)) files.set(`agents/${file}`, readFileSync(join(AGENTS_DIR, file), "utf8"));
  for (const file of filesIn(SUBAGENTS_DIR)) {
    const text = readFileSync(join(SUBAGENTS_DIR, file), "utf8");
    files.set(`.claude/agents/${file}`, text.split(SUBAGENT_PROJECT).join(`del progetto ${name}.`));
  }
  // Su Windows npx è npx.cmd, che Claude Code non avvia senza cmd /c (F23).
  const npx = ["-y", `@agentrica/mcp@${VERSION}`, "--panel"];
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
    if (git(dir, ["rev-parse", "--is-inside-work-tree"]) === "true") return "git: la cartella è già in un repository, nessun commit";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "git: non installato, repository non creato";
  }
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["add", "-A"]);
  try {
    git(dir, ["commit", "-q", "-m", "Progetto creato con @agentrica/mcp init"]);
  } catch {
    return "git: commit non riuscito (configura user.name e user.email), file lasciati in stage su main";
  }
  git(dir, ["checkout", "-q", "-b", "develop"]);
  return "git: commit iniziale su main, branch develop attivo";
}

/** Esegue il comando; restituisce il codice di uscita. */
export function runInit(args: string[]): number {
  try {
    const { values, positionals } = parseArgs({ args, options: { name: { type: "string" } }, allowPositionals: true });
    if (positionals.length > 1) throw new Error("uso: agentrica-mcp init [cartella] [--name \"Nome\"]");
    const dir = resolve(positionals[0] ?? ".");
    const name = (values.name ?? basename(dir)).trim();
    if (!name || /\p{Cc}/u.test(name)) throw new Error("--name: serve un nome su una riga");

    const files = projectFiles(name, dir, new Date().toISOString().slice(0, 10));
    const taken = [...files.keys()].filter((file) => existsSync(join(dir, file)));
    if (taken.length > 0) {
      const more = taken.length > 5 ? ` e altri ${taken.length - 5}` : "";
      throw new Error(`nessun file scritto, esistono già: ${taken.slice(0, 5).join(", ")}${more}`);
    }
    for (const [file, text] of files) {
      mkdirSync(dirname(join(dir, file)), { recursive: true });
      writeFileSync(join(dir, file), text, { flag: "wx" });
    }

    process.stdout.write(
      [
        `Progetto «${name}» creato in ${dir}: ${files.size} file.`,
        initGit(dir),
        "",
        "Prossimi passi:",
        `  1. cd "${dir}" e apri Claude Code (.mcp.json registra il server di Agentrica con il pannello)`,
        "  2. chiedi di aprire la fase F0 (plan/00-base.md): stack, agenzie attive, sezioni «da compilare»",
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
