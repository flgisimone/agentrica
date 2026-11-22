// Controlla l'orchestrazione di una sessione di Claude Code (F34-01): npm run -s orchestration -- <sessione.jsonl> [--subagents-asked]
// Il file è in ~/.claude/projects/<progetto>/; si legge solo il file principale, non quelli dei subagent.
import { readFileSync } from "node:fs";
import { checkOrchestration, toolCalls } from "./orchestration-lib.ts";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
if (!file) {
  console.error("Uso: npm run -s orchestration -- <sessione.jsonl> [--subagents-asked]");
  process.exit(1);
}
const calls = toolCalls(readFileSync(file, "utf8").split("\n"));
console.log(`Chiamate ai tool: ${calls.length}`);
console.log(calls.map((c, i) => `${i + 1}. ${c.name}${c.target ? ` ${c.target}` : ""}`).join("\n"));
console.log("");
const checks = checkOrchestration(calls, args.includes("--subagents-asked"));
for (const c of checks) console.log(`${c.ok ? "OK " : "NO "} ${c.criterion}: ${c.detail}`);
process.exit(checks.every((c) => c.ok) ? 0 : 2);
