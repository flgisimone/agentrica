// Prove di `init` (F18): file del progetto nuovo, segnaposto, subagent con il nome del progetto, conflitti e git.
// Il comando gira come lo lancia npx: server.ts con «init», da una cartella temporanea.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { AGENTS_DIR } from "./catalog.ts";
import { projectFiles, SUBAGENT_PROJECT } from "./init.ts";
import { readPlan } from "./project.ts";
import { VERSION } from "./prompt.ts";

const tmp = mkdtempSync(join(tmpdir(), "agentrica-init-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

const server = join(import.meta.dirname, "server.ts");
const identity = { GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };
const init = (...args: string[]) =>
  spawnSync(process.execPath, [server, "init", ...args], { cwd: tmp, encoding: "utf8", env: { ...process.env, ...identity } });

test("i subagent di Agentrica nominano il progetto una volta sola, nella frase che init sostituisce", () => {
  const files = [...projectFiles("X", "/x", "2026-01-01").keys()].filter((file) => file.startsWith(".claude/"));
  assert.equal(files.length, 56);
  const dir = join(AGENTS_DIR, "..");
  for (const file of files) assert.equal(readFileSync(join(dir, file), "utf8").split(SUBAGENT_PROJECT).length, 2, file);
});

test("file del progetto: starter, agents/ del pacchetto, subagent e .mcp.json, senza segnaposto", () => {
  const files = projectFiles("Prova App", "/tmp/prova", "2026-01-01");
  const agents = readdirSync(AGENTS_DIR, { recursive: true }).filter((f) => String(f).endsWith(".md")).length;
  assert.equal([...files.keys()].filter((file) => file.startsWith("agents/")).length, agents);
  assert.ok(files.has(".gitignore") && !files.has("gitignore"));
  assert.match(files.get("AGENTS.md")!, /graph_root: "\/tmp\/prova"/);
  assert.match(files.get("plan/README.md")!, /^# Piano di Prova App/);
  assert.match(files.get("CONVENTIONS.md")!, /### 2\.6 Fasi e backlog/);
  assert.match(files.get(".claude/agents/software/sw-cto.md")!, /del progetto Prova App\./);
  assert.deepEqual(JSON.parse(files.get(".mcp.json")!).mcpServers.agentrica.args, ["-y", `@agentrica/mcp@${VERSION}`, "--panel"]);
  const windows = JSON.parse(projectFiles("X", "C:\\x", "2026-01-01", "win32").get(".mcp.json")!).mcpServers.agentrica;
  assert.deepEqual([windows.command, ...windows.args], ["cmd", "/c", "npx", "-y", `@agentrica/mcp@${VERSION}`, "--panel"]);
  for (const [file, text] of files) {
    assert.doesNotMatch(text, /\{\{(PROJECT_|DATE)/, file);
    if (file.startsWith(".claude/")) assert.doesNotMatch(text, /Agentrica/, file);
  }
});

test("init crea il progetto con git su main e develop, e il pannello ne legge il piano", () => {
  const result = init("nuovo", "--name", "Nuovo");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Progetto «Nuovo» creato/);
  const dir = join(tmp, "nuovo");
  const git = (...args: string[]) => spawnSync("git", args, { cwd: dir, encoding: "utf8" }).stdout.trim();
  assert.equal(git("branch", "--show-current"), "develop");
  assert.equal(git("log", "--format=%s", "main"), "Progetto creato con @agentrica/mcp init");
  assert.equal(git("status", "--porcelain"), "");
  const plan = readPlan(realpathSync(dir));
  assert.deepEqual(plan.problems, []);
  assert.equal(plan.phases[0]?.id, "F0");
});

test("con un file già presente init non scrive nulla e dice quale", () => {
  const dir = join(tmp, "occupato");
  const first = init("occupato");
  assert.equal(first.status, 0, first.stderr);
  rmSync(join(dir, "plan"), { recursive: true });
  writeFileSync(join(dir, "nota.txt"), "");
  const second = init("occupato");
  assert.equal(second.status, 1);
  assert.match(second.stderr, /nessun file scritto, esistono già: .*AGENTS\.md/);
  assert.throws(() => readdirSync(join(dir, "plan")));
});

test("argomenti non validi: due cartelle, nome vuoto", () => {
  assert.match(init("a", "b").stderr, /uso: agentrica-mcp init/);
  assert.match(init("c", "--name", " ").stderr, /--name/);
});
