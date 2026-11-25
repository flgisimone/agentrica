// Catene di chiamate ai tool di Agentrica nelle sessioni di Claude Code (F45-01): quante chiamate in fila fa il modello
// e quanti byte dei risultati sono intermedi, cioè seguiti da un'altra chiamata. È la misura per decidere su Code Mode.
// Uso: npm run -s tool-chains -- [<cartella progetto> ...] [--all] [--date AAAA-MM-GG]
// Senza cartelle legge il progetto corrente; --all legge tutti i progetti di Claude Code. Stampa Markdown su stdout,
// solo conteggi e byte.
import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import { today } from "../packages/mcp/src/prompt.ts";
import { claudeProjectDir, MAIN, readable, sessionFiles } from "../packages/mcp/src/usage.ts";
import { chainsReport, chainStats, fileChains, type SessionChains } from "./tool-chains-lib.ts";

const { values, positionals } = parseArgs({ allowPositionals: true, options: { all: { type: "boolean" }, date: { type: "string" } } });

const projectsDir = dirname(claudeProjectDir(process.cwd()));
const dirs = values.all
  ? (await readdir(projectsDir, { withFileTypes: true }).catch(() => [])).filter((e) => e.isDirectory()).map((e) => join(projectsDir, e.name))
  : (positionals.length > 0 ? positionals : [process.cwd()]).map((root) => claudeProjectDir(root));

const sessions: SessionChains[] = [];
let skipped = 0;
for (const dir of dirs) {
  const byId = new Map<string, SessionChains>();
  for (const file of await sessionFiles(dir)) {
    if (!(await readable(file.path))) {
      skipped++;
      continue;
    }
    const lines: string[] = [];
    for await (const line of createInterface({ input: createReadStream(file.path, { encoding: "utf8" }), crlfDelay: Infinity })) lines.push(line);
    const chains = fileChains(lines);
    const s = byId.get(file.session) ?? { chains: [], subagentChains: 0 };
    s.chains.push(...chains);
    if (file.agent !== MAIN) s.subagentChains += chains.length;
    byId.set(file.session, s);
  }
  sessions.push(...byId.values());
}

console.log(chainsReport(chainStats(sessions, dirs.length, skipped), values.date ?? today()));
