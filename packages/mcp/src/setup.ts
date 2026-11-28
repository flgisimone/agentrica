// `aigentrica-mcp add` e `aigentrica-mcp install` (F23): registrano il server in Claude Code con un solo comando, uguale su
// Mac, Windows e Linux. Chiamano `claude mcp add` (e per install `npm install -g`) senza shell, con gli argomenti in un
// array: niente quoting di PowerShell, cmd, zsh o bash. La versione è sempre quella di questo pacchetto, fissata.
// - add: il server parte con npx (su Windows `cmd /c npx`, perché npx è npx.cmd); ambito user, --project o --local.
// - install: installa questa versione con npm -g e registra `node <cartella globale>/…/server.js` con ambito user.
// Una registrazione con lo stesso nome nello stesso ambito si sostituisce: rilanciare con una versione nuova aggiorna.
// Se mancano Node ≥ 22, npm o claude, lo dice e stampa i comandi da lanciare a mano.
// Se AIgentrica è registrato anche in un altro ambito, lo dice dopo la registrazione (F30-08): Claude Code usa quello
// più vicino al progetto e l'utente vedrebbe due comandi diversi.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { VERSION } from "./prompt.ts";
import { isLang, T } from "./texts/index.ts";

const NAME = "aigentrica";
// Il nome di prima di F54: la sua voce nello stesso ambito si toglie, in un altro ambito si segnala.
const LEGACY = "agentrica";
const PACKAGE = `@aigentrica/mcp@${VERSION}`;
const SERVER_IN_PACKAGE = ["@aigentrica", "mcp", "dist", "mcp", "src", "server.js"];

export type Scope = "user" | "project" | "local";
export interface RunResult {
  status: number | null;
  stdout: string;
  stderr: string;
  /** Il programma non c'è (ENOENT). */
  missing?: boolean;
}
export interface SetupDeps {
  platform: NodeJS.Platform;
  nodeVersion: string;
  run(command: string, args: string[]): RunResult;
  exists(path: string): boolean;
  out(text: string): void;
  /** Gli ambiti in cui un server con quel nome è già registrato in Claude Code; assente nei test che non lo usano. */
  registered?(name: string): Scope[];
}

/**
 * Su Windows npm e (se installato con npm) claude sono file .cmd, che Node non avvia senza shell: si passa da
 * cmd.exe con ogni argomento fra virgolette. Gli argomenti sono nostri; con " o % (che cmd espande anche fra
 * virgolette) il comando non parte e si stampa quello da lanciare a mano.
 * Il nome del comando resta senza virgolette: con `"npm"` cmd dà al .cmd un %~dp0 sbagliato (la cartella corrente
 * invece della sua), e npm.cmd cerca node_modules\npm\bin\npm-cli.js nel progetto dell'utente.
 */
export function cmdLine(command: string, args: string[]): string | undefined {
  if (!/^[A-Za-z0-9._-]+$/.test(command) || args.some((arg) => /["%\r\n]/.test(arg))) return undefined;
  return `"${[command, ...args.map((arg) => `"${arg}"`)].join(" ")}"`;
}

function realRun(platform: NodeJS.Platform) {
  return (command: string, args: string[]): RunResult => {
    const direct = spawnSync(command, args, { encoding: "utf8" });
    const missing = (direct.error as NodeJS.ErrnoException | undefined)?.code === "ENOENT";
    if (!(missing && platform === "win32")) return { status: direct.status, stdout: direct.stdout ?? "", stderr: direct.stderr ?? "", missing };
    const line = cmdLine(command, args);
    if (!line) return { status: null, stdout: "", stderr: "", missing: true };
    const viaCmd = spawnSync("cmd.exe", ["/d", "/s", "/c", line], { encoding: "utf8", windowsVerbatimArguments: true });
    // cmd risponde 9009 quando il comando non esiste.
    return { status: viaCmd.status, stdout: viaCmd.stdout ?? "", stderr: viaCmd.stderr ?? "", missing: viaCmd.status === 9009 };
  };
}

/**
 * Gli ambiti con una voce «aigentrica» nei file di Claude Code: `mcpServers` di ~/.claude.json (user), della cartella
 * corrente in `projects` dello stesso file (local) e di ./.mcp.json (project). Un file illeggibile non conta.
 * ponytail: non segue CLAUDE_CONFIG_DIR, un cambio di formato di Claude Code né, su Windows, una chiave di `projects` scritta
 * in altra forma (barre /): l'avviso è un aiuto, non un controllo; da rivedere con la prova su Windows (F23-10).
 */
export function registeredScopes(home: string, cwd: string, read = (path: string) => readFileSync(path, "utf8"), name = NAME): Scope[] {
  const json = (path: string): Record<string, unknown> | undefined => {
    try {
      const value: unknown = JSON.parse(read(path));
      return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : undefined;
    } catch {
      return undefined;
    }
  };
  const has = (config: unknown) => {
    const servers = (config as { mcpServers?: unknown } | undefined)?.mcpServers;
    return typeof servers === "object" && servers !== null && Object.hasOwn(servers, name);
  };
  const user = json(join(home, ".claude.json"));
  const local = (user?.projects as Record<string, unknown> | undefined)?.[cwd];
  return (["user", "project", "local"] as const).filter((scope) =>
    scope === "user" ? has(user) : scope === "project" ? has(json(join(cwd, ".mcp.json"))) : has(local),
  );
}

const REAL: SetupDeps = {
  platform: process.platform,
  nodeVersion: process.versions.node,
  run: realRun(process.platform),
  exists: existsSync,
  out: (text) => process.stdout.write(text),
  registered: (name) => registeredScopes(homedir(), process.cwd(), undefined, name),
};

/** Il comando con cui il client avvia il server. */
export function serverCommand(mode: "add" | "install", platform: NodeJS.Platform, flags: string[], globalRoot = ""): string[] {
  if (mode === "install") return ["node", join(globalRoot, ...SERVER_IN_PACKAGE), ...flags];
  const npx = ["npx", "-y", PACKAGE, ...flags];
  return platform === "win32" ? ["cmd", "/c", ...npx] : npx;
}

/** Il comando da scrivere nel terminale, per i messaggi: gli argomenti con spazi fra virgolette. */
const shown = (args: string[]) => args.map((arg) => (/[\s"]/.test(arg) ? `"${arg}"` : arg)).join(" ");

/** Esegue il comando; restituisce il codice di uscita. */
export function runSetup(mode: "add" | "install", args: string[], deps: SetupDeps = REAL): number {
  const say = (line = "") => deps.out(`${line}\n`);
  let scope: Scope = "user";
  const flags: string[] = [];
  let from: string | undefined;
  try {
    const { values } = parseArgs({
      args,
      options: {
        project: { type: "boolean" },
        local: { type: "boolean" },
        lang: { type: "string" },
        agents: { type: "string" },
        panel: { type: "boolean" },
        "no-panel": { type: "boolean" },
        "no-ratings": { type: "boolean" },
        "no-update-check": { type: "boolean" },
        // ponytail: --from installa da un .tgz di npm pack, per provare install prima del rilascio (F23-10).
        from: { type: "string" },
      },
    });
    if (values.project && values.local) throw new Error(T.setup.projectAndLocal);
    if (mode === "install" && (values.project || values.local)) throw new Error(T.setup.installScope);
    if (mode === "add" && values.from) throw new Error(T.setup.fromOnlyInstall);
    scope = values.project ? "project" : values.local ? "local" : "user";
    if (values.lang !== undefined) {
      if (!isLang(values.lang)) throw new Error(T.server.langInvalid(values.lang));
      flags.push("--lang", values.lang);
    }
    if (values.agents !== undefined) {
      if (!/^[A-Za-z0-9,-]{1,300}$/.test(values.agents)) throw new Error(T.setup.badAgents);
      flags.push("--agents", values.agents);
    }
    if (values.panel && values["no-panel"]) throw new Error(T.server.panelBoth);
    if (values.panel) flags.push("--panel");
    if (values["no-panel"]) flags.push("--no-panel");
    if (values["no-ratings"]) flags.push("--no-ratings");
    if (values["no-update-check"]) flags.push("--no-update-check");
    from = values.from;
  } catch (error) {
    say(`aigentrica ${mode}: ${(error instanceof Error ? error.message : String(error)).replace(/\p{Cc}/gu, " ")}`);
    return 1;
  }

  const win = deps.platform === "win32";
  const manual = (steps: string[]) => {
    say(T.setup.manual);
    for (const step of steps) say(`  ${step}`);
  };

  if (Number(deps.nodeVersion.split(".")[0]) < 22) {
    say(T.setup.oldNode(mode, deps.nodeVersion));
    say(`  npx -y ${PACKAGE} ${mode}`);
    return 1;
  }

  let command: string[];
  if (mode === "install") {
    const install = deps.run("npm", ["install", "-g", from ?? PACKAGE]);
    if (install.missing) {
      say(T.setup.noNpm);
      return 1;
    }
    if (install.status !== 0) {
      say(T.setup.npmFailed(win));
      if (install.stderr.trim()) say(install.stderr.trim());
      return 1;
    }
    const root = deps.run("npm", ["root", "-g"]).stdout.trim();
    command = serverCommand("install", deps.platform, flags, root);
    if (!root || !deps.exists(command[1]!)) {
      say(T.setup.serverMissing(root || T.setup.unknownRoot));
      return 1;
    }
    say(T.setup.installed(from ? from : PACKAGE, root));
  } else {
    command = serverCommand("add", deps.platform, flags);
  }

  const addArgs = ["mcp", "add", "--scope", scope, NAME, "--", ...command];
  const removed = deps.run("claude", ["mcp", "remove", NAME, "--scope", scope]);
  if (removed.missing) {
    say(T.setup.noClaude);
    manual([shown(["claude", ...addArgs])]);
    say(T.setup.otherClients);
    return 1;
  }
  const added = deps.run("claude", addArgs);
  if (added.status !== 0) {
    say(T.setup.addFailed);
    if ((added.stderr || added.stdout).trim()) say((added.stderr || added.stdout).trim());
    manual([shown(["claude", ...addArgs])]);
    return 1;
  }
  say(T.setup.registered(VERSION, T.setup.scope[scope], removed.status === 0));
  say(T.setup.command(shown(command)));
  for (const other of deps.registered?.(NAME).filter((s) => s !== scope) ?? []) say(T.setup.otherScope(T.setup.scope[other], NAME, other));
  for (const old of deps.registered?.(LEGACY) ?? []) {
    if (old !== scope) say(T.setup.otherScope(T.setup.scope[old], LEGACY, old));
    else if (deps.run("claude", ["mcp", "remove", LEGACY, "--scope", scope]).status === 0) say(T.setup.legacyRemoved(T.setup.scope[scope]));
  }
  say(T.setup.restart);
  return 0;
}
