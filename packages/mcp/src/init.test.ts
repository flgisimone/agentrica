// Prove di `init` (F18): file del progetto nuovo, segnaposto, subagent con il nome del progetto (con --subagents, F34), conflitti e git.
// Il comando gira come lo lancia npx: server.ts con «init», da una cartella temporanea.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { AGENTS_DIR } from "./catalog.ts";
import { existingFiles, projectFiles, reminderCommand, subagentProject } from "./init.ts";
import { checkProject } from "./check.ts";
import { readPlan } from "./project.ts";
import { VERSION } from "./prompt.ts";
import { TEXTS } from "./texts/index.ts";

const tmp = mkdtempSync(join(tmpdir(), "agentrica-init-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

const server = join(import.meta.dirname, "server.ts");
const identity = { GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };
const init = (...args: string[]) =>
  spawnSync(process.execPath, [server, "init", "--lang", "it", ...args], { cwd: tmp, encoding: "utf8", env: { ...process.env, ...identity } });

test("i subagent di Agentrica nominano il progetto una volta sola, nella frase che init sostituisce", () => {
  const files = [...projectFiles("X", "/x", "2026-01-01", "linux", "it", true).keys()].filter((file) => file.startsWith(".claude/agents/"));
  assert.equal(files.length, 56);
  const dir = join(AGENTS_DIR, "..");
  for (const file of files) assert.equal(readFileSync(join(dir, file), "utf8").split(subagentProject("it")).length, 2, file);
});

test("file del progetto: starter, agents/ del pacchetto, subagent e .mcp.json, senza segnaposto", () => {
  const files = projectFiles("Prova App", "/tmp/prova", "2026-01-01", "linux", "it", true);
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
    if (file.startsWith(".claude/")) assert.doesNotMatch(text, /progetto Agentrica/, file);
  }
});

test("subagent solo con --subagents (F34-05): con il flag caricano il loro agente dal server per primo", () => {
  assert.ok(![...projectFiles("X", "/x", "2026-01-01", "linux", "it").keys()].some((file) => file.startsWith(".claude/agents/")));
  for (const lang of ["it", "en"] as const) {
    const files = [...projectFiles("X", "/x", "2026-01-01", "linux", lang, true)].filter(([file]) => file.startsWith(".claude/agents/"));
    assert.equal(files.length, 56, lang);
    for (const [file, text] of files) {
      assert.match(text, /^tools: .+, mcp__agentrica__agent, mcp__agentrica__library$/m, file);
      assert.match(text, /^---\n[\s\S]+?\n---\n\n(Primo passo|First step): .+`mcp__agentrica__agent`.+`A[A-Z]+-\d{2}`.+\n\n\S/, file);
      // F41-03: un subagent ha un contesto suo, quindi chiede sempre le regole intere.
      assert.match(text, /^(Primo passo|First step): .+`A[A-Z]+-\d{2}`, `full_rules` true /m, file);
    }
    const cto = new Map(files).get(".claude/agents/software/sw-cto.md")!;
    assert.match(cto, /id `AISA-01`/);
  }
});

test("init crea il progetto con git su main e develop, e il pannello ne legge il piano", () => {
  const result = init("nuovo", "--name", "Nuovo");
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readdirSync(join(tmp, "nuovo", ".claude")), ["settings.json"], "senza --subagents in .claude/ solo il promemoria");
  assert.equal(init("con-subagent", "--subagents").status, 0);
  assert.equal(readdirSync(join(tmp, "con-subagent", ".claude", "agents"), { recursive: true }).filter((f) => String(f).endsWith(".md")).length, 56);
  assert.match(result.stdout, /Progetto «Nuovo» creato/);
  const dir = join(tmp, "nuovo");
  const git = (...args: string[]) => spawnSync("git", args, { cwd: dir, encoding: "utf8" }).stdout.trim();
  assert.equal(git("branch", "--show-current"), "develop");
  assert.equal(git("log", "--format=%s", "main"), "Progetto creato con @agentrica/mcp init");
  assert.equal(git("status", "--porcelain"), "");
  const plan = readPlan(realpathSync(dir));
  assert.deepEqual(checkProject(realpathSync(dir)), []);
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
  const it = projectFiles("X", "/x", "2026-01-01", "linux", "it", true);
  const en = projectFiles("Test App", "/tmp/test", "2026-01-01", "linux", "en", true);
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
  assert.deepEqual(checkProject(realpathSync(join(tmp, "english"))), []);
  assert.equal(plan.phases[0]?.id, "F0");
  assert.equal(plan.openPhase?.tasks.length, 7);
  assert.equal(plan.openPhase?.goal.startsWith("a project that starts"), true);
});

test("init --existing (F35): scrive solo i file mancanti, salta gli altri e li elenca, niente commit", () => {
  const dir = join(tmp, "avviato");
  mkdirSync(join(dir, "agents", "mio"), { recursive: true });
  writeFileSync(join(dir, "CLAUDE.md"), "# Regole mie\n");
  writeFileSync(join(dir, ".gitignore"), "node_modules\n");
  writeFileSync(join(dir, "agents", "mio", "README.md"), "mio\n");
  spawnSync("git", ["init", "-q", "-b", "main"], { cwd: dir });
  const result = init("avviato", "--existing");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Regole di Agentrica aggiunte a «avviato»/);
  assert.match(result.stdout, /Saltati perché esistono già: .*CLAUDE\.md/);
  assert.match(result.stdout, /aggiungi una riga «@AGENTS\.md»/);
  assert.match(result.stdout, /git: nessun commit/);
  assert.equal(readFileSync(join(dir, "CLAUDE.md"), "utf8"), "# Regole mie\n", "file dell'utente intatti");
  assert.equal(readFileSync(join(dir, ".gitignore"), "utf8"), "node_modules\n");
  assert.match(readFileSync(join(dir, "AGENTS.md"), "utf8"), /^# Regole per gli agenti/);
  // Niente base tecnica di un progetto nuovo.
  for (const file of [".github", ".nvmrc", ".env.example", join("plan", "00-base.md")]) assert.throws(() => readFileSync(join(dir, file)), file);
  assert.equal(spawnSync("git", ["log"], { cwd: dir, encoding: "utf8" }).status, 128, "nessun commit");
  const plan = readPlan(realpathSync(dir));
  assert.deepEqual(checkProject(realpathSync(dir)), []);
  assert.deepEqual(plan.phases, []);
  assert.match(plan.notice!, /non ha ancora fasi/);
  assert.match(readFileSync(join(dir, "plan", "README.md"), "utf8"), /`npx @agentrica\/mcp init --existing`[\s\S]+Nessuna fase ancora/);
  // Una seconda volta non scrive nulla e non si ferma.
  const again = init("avviato", "--existing");
  assert.equal(again.status, 0, again.stderr);
  assert.match(again.stdout, /0 file nuovi/);
  assert.match(again.stdout, /agents\/ \(\d+\)/, "i file di agents/ contati per cartella");
  // F35-R2: un .mcp.json già presente non si dà per scritto.
  assert.match(again.stdout, /\.mcp\.json c'era già ed è stato saltato/);
  assert.doesNotMatch(result.stdout, /c'era già/);
});

test("init --existing in inglese: piano senza fasi con la stessa indicazione", () => {
  for (const lang of ["it", "en"] as const) {
    const files = existingFiles(projectFiles("X", "/x", "2026-01-01", "linux", lang), lang);
    const plan = files.get("plan/README.md")!;
    assert.doesNotMatch(plan, /^\| F0 \|/m, lang);
    assert.doesNotMatch(plan, /^(Ordine|Order): F0/m, lang);
    assert.match(plan, /init --existing/, lang);
    assert.ok(!files.has("plan/00-base.md") && !files.has(".nvmrc") && files.has(".mcp.json"), lang);
  }
});

test("promemoria (F39-01): hook UserPromptSubmit in .claude/settings.json, che stampa la riga della lingua; --no-reminder lo toglie", () => {
  for (const lang of ["it", "en"] as const) {
    const settings = JSON.parse(projectFiles("X", "/x", "2026-01-01", "linux", lang).get(".claude/settings.json")!);
    const command: string = settings.hooks.UserPromptSubmit[0].hooks[0].command;
    assert.equal(settings.hooks.UserPromptSubmit[0].hooks[0].type, "command", lang);
    assert.match(command, /^node -e "console\.log\('[\x20-\x7e]+'\)"$/, `${lang}: solo ASCII, uguale in sh, PowerShell e cmd`);
    // Lo stesso comando in una shell vera stampa il testo, con gli accenti.
    const out = spawnSync(command, { shell: true, encoding: "utf8" });
    assert.equal(out.stdout.trim(), TEXTS[lang].init.reminder, lang);
  }
  assert.ok(!projectFiles("X", "/x", "2026-01-01", "linux", "it", false, false).has(".claude/settings.json"));
  assert.throws(() => reminderCommand("l'agente"), /caratteri della shell/);
  const result = init("senza-promemoria", "--no-reminder");
  assert.equal(result.status, 0, result.stderr);
  assert.throws(() => readFileSync(join(tmp, "senza-promemoria", ".claude", "settings.json")));
});

test("reminder (F44-08): crea settings.json o aggiunge l'hook tenendo il resto, una volta sola; un file illeggibile resta com'è", () => {
  const reminder = (dir: string, lang = "it") => spawnSync(process.execPath, [server, "reminder", dir, "--lang", lang], { cwd: tmp, encoding: "utf8" });
  const read = (dir: string) => JSON.parse(readFileSync(join(tmp, dir, ".claude", "settings.json"), "utf8"));
  const ours = (lang: "it" | "en") => reminderCommand(TEXTS[lang].init.reminder);

  mkdirSync(join(tmp, "rem-nuovo"));
  let result = reminder("rem-nuovo");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Promemoria aggiunto/);
  assert.deepEqual(read("rem-nuovo"), { hooks: { UserPromptSubmit: [{ hooks: [{ type: "command", command: ours("it") }] }] } });

  const other = { type: "command", command: "echo altro" };
  mkdirSync(join(tmp, "rem-pieno", ".claude"), { recursive: true });
  writeFileSync(join(tmp, "rem-pieno", ".claude", "settings.json"), JSON.stringify({ permissions: { allow: ["Bash(ls)"] }, hooks: { Stop: [{ hooks: [other] }], UserPromptSubmit: [{ hooks: [other] }] } }));
  assert.equal(reminder("rem-pieno").status, 0);
  result = reminder("rem-pieno", "en");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /already in/, "il promemoria italiano conta anche per l'inglese");
  assert.deepEqual(read("rem-pieno"), {
    permissions: { allow: ["Bash(ls)"] },
    hooks: { Stop: [{ hooks: [other] }], UserPromptSubmit: [{ hooks: [other] }, { hooks: [{ type: "command", command: ours("it") }] }] },
  });

  // Rientro, fine riga e a capo finale del file restano quelli di prima: tab e CRLF senza a capo, 4 spazi con a capo.
  mkdirSync(join(tmp, "rem-stile", ".claude"), { recursive: true });
  const style = join(tmp, "rem-stile", ".claude", "settings.json");
  for (const [indent, eol, end] of [["\t", "\r\n", ""], ["    ", "\n", "\n"]] as const) {
    writeFileSync(style, JSON.stringify({ permissions: { allow: [] } }, null, indent).replace(/\n/g, eol) + end);
    assert.equal(reminder("rem-stile").status, 0);
    const after = readFileSync(style, "utf8");
    const expected = { permissions: { allow: [] }, hooks: { UserPromptSubmit: [{ hooks: [{ type: "command", command: ours("it") }] }] } };
    assert.equal(after, JSON.stringify(expected, null, indent).replace(/\n/g, eol) + end, JSON.stringify(indent));
  }

  mkdirSync(join(tmp, "rem-rotto", ".claude"), { recursive: true });
  for (const text of ["{ rotto", "[]", '{"hooks": []}', '{"hooks": {"UserPromptSubmit": {}}}']) {
    writeFileSync(join(tmp, "rem-rotto", ".claude", "settings.json"), text);
    result = reminder("rem-rotto");
    assert.equal(result.status, 1, text);
    assert.match(result.stderr, /non l'ho toccato/, text);
    assert.equal(readFileSync(join(tmp, "rem-rotto", ".claude", "settings.json"), "utf8"), text);
  }
});

test("init --existing con .claude/settings.json già presente: non lo tocca e dice come aggiungere il promemoria", () => {
  const dir = join(tmp, "con-impostazioni");
  mkdirSync(join(dir, ".claude"), { recursive: true });
  writeFileSync(join(dir, ".claude", "settings.json"), "{}\n");
  const result = init("con-impostazioni", "--existing");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Il promemoria non è stato aggiunto.+npx @agentrica\/mcp reminder/);
  assert.equal(readFileSync(join(dir, ".claude", "settings.json"), "utf8"), "{}\n");
  const fresh = init("con-hook", "--existing");
  assert.doesNotMatch(fresh.stdout, /promemoria non è stato aggiunto/);
  assert.match(readFileSync(join(tmp, "con-hook", ".claude", "settings.json"), "utf8"), /UserPromptSubmit/);
});
