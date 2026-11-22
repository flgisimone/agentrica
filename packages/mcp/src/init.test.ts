// Prove di `init` (F18): file del progetto nuovo, segnaposto, subagent con il nome del progetto, conflitti e git.
// Il comando gira come lo lancia npx: server.ts con «init», da una cartella temporanea.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { AGENTS_DIR } from "./catalog.ts";
import { projectFiles, subagentProject } from "./init.ts";
import { readPlan } from "./project.ts";
import { VERSION } from "./prompt.ts";

const tmp = mkdtempSync(join(tmpdir(), "agentrica-init-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

const server = join(import.meta.dirname, "server.ts");
const identity = { GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };
const init = (...args: string[]) =>
  spawnSync(process.execPath, [server, "init", "--lang", "it", ...args], { cwd: tmp, encoding: "utf8", env: { ...process.env, ...identity } });

test("i subagent di Agentrica nominano il progetto una volta sola, nella frase che init sostituisce", () => {
  const files = [...projectFiles("X", "/x", "2026-01-01").keys()].filter((file) => file.startsWith(".claude/"));
  assert.equal(files.length, 56);
  const dir = join(AGENTS_DIR, "..");
  for (const file of files) assert.equal(readFileSync(join(dir, file), "utf8").split(subagentProject("it")).length, 2, file);
});

test("file del progetto: starter, agents/ del pacchetto, subagent e .mcp.json, senza segnaposto", () => {
  const files = projectFiles("Prova App", "/tmp/prova", "2026-01-01", "linux");
  // I file di ruolo, le schede della biblioteca e i fonti.json dei reparti (F25).
  const agents = readdirSync(AGENTS_DIR, { recursive: true }).filter((f) => /\.md$|(^|[\\/])fonti\.json$/.test(String(f))).length;
  assert.equal([...files.keys()].filter((file) => file.startsWith("agents/")).length, agents);
  assert.ok(files.has(".gitignore") && !files.has("gitignore"));
  assert.match(files.get("AGENTS.md")!, /graph_root: "\/tmp\/prova"/);
  assert.match(files.get("plan/README.md")!, /^# Piano di Prova App/);
  assert.match(files.get("CONVENTIONS.md")!, /### 2\.6 Fasi e backlog/);
  assert.match(files.get(".claude/agents/software/sw-cto.md")!, /del progetto Prova App\./);
  assert.deepEqual(JSON.parse(files.get(".mcp.json")!).mcpServers.agentrica.args, ["-y", `@agentrica/mcp@${VERSION}`]);
  const windows = JSON.parse(projectFiles("X", "C:\\x", "2026-01-01", "win32").get(".mcp.json")!).mcpServers.agentrica;
  assert.deepEqual([windows.command, ...windows.args], ["cmd", "/c", "npx", "-y", `@agentrica/mcp@${VERSION}`]);
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

test("docs: il quadro delle agenzie di starter/ è uguale a quello del repository (F18-R1, F30)", () => {
  const repo = join(import.meta.dirname, "..", "..", "..");
  const name = join("docs", "AI Multi-Agency System.md");
  assert.equal(readFileSync(join(repo, "starter", name), "utf8"), readFileSync(join(repo, name), "utf8"), "aggiorna le due copie insieme");
});

test("init in inglese (F32): starter e subagent di starter/en/, agents/ intero, stessi file dell'italiano", () => {
  const it = projectFiles("X", "/x", "2026-01-01", "linux", "it");
  const en = projectFiles("Test App", "/tmp/test", "2026-01-01", "linux", "en");
  assert.deepEqual([...en.keys()].sort(), [...it.keys()].sort(), "stessi percorsi nelle due lingue");
  assert.ok(![...it.keys()].some((file) => file.startsWith("en/")), "l'italiano non copia starter/en/");
  assert.match(en.get("AGENTS.md")!, /^# Rules for agents/);
  assert.match(en.get("AGENTS.md")!, /graph_root: "\/tmp\/test"/);
  assert.match(en.get("CONVENTIONS.md")!, /### 2\.6 Phases and backlog/);
  assert.match(en.get("plan/README.md")!, /^# Plan of Test App/);
  assert.match(en.get(".claude/agents/software/sw-cto.md")!, /of the Test App project\..*`agents\/ai_software_agency\/en\/01-/s);
  for (const [file, text] of en) {
    assert.doesNotMatch(text, /\{\{(PROJECT_|DATE)/, file);
    if (file.startsWith(".claude/")) assert.doesNotMatch(text, /Agentrica project/, file);
  }
  const dir = join(AGENTS_DIR, "..", "starter", "en", ".claude", "agents");
  for (const file of readdirSync(dir, { recursive: true }).map(String).filter((f) => f.endsWith(".md"))) {
    assert.equal(readFileSync(join(dir, file), "utf8").split(subagentProject("en")).length, 2, file);
  }
});

test("init --lang en: il pannello legge il piano inglese senza problemi", () => {
  const result = spawnSync(process.execPath, [server, "init", "--lang", "en", "english", "--name", "English"], { cwd: tmp, encoding: "utf8", env: { ...process.env, ...identity } });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Project «English» created/);
  const plan = readPlan(realpathSync(join(tmp, "english")));
  assert.deepEqual(plan.problems, []);
  assert.equal(plan.phases[0]?.id, "F0");
  assert.equal(plan.openPhase?.tasks.length, 7);
  assert.equal(plan.openPhase?.goal.startsWith("a project that starts"), true);
});
