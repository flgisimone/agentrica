import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { VERSION } from "./prompt.ts";
import { cmdLine, runSetup, serverCommand, type RunResult, type SetupDeps } from "./setup.ts";

const PKG = `@agentrica/mcp@${VERSION}`;

/** Dipendenze finte: registra i comandi e risponde con `answers` (per programma) o con successo. */
function fake(platform: NodeJS.Platform, answers: Record<string, Partial<RunResult>> = {}, nodeVersion = "22.12.0") {
  const calls: string[][] = [];
  let output = "";
  const deps: SetupDeps = {
    platform,
    nodeVersion,
    run(command, args) {
      calls.push([command, ...args]);
      const key = [command, ...args.slice(0, 2)].join(" ");
      return { status: 0, stdout: "", stderr: "", ...(answers[key] ?? answers[command]) };
    },
    exists: () => true,
    out: (text) => (output += text),
  };
  return { deps, calls, output: () => output };
}

test("add: npx su Mac e Linux, cmd /c npx su Windows, ambito user, registrazione precedente sostituita", () => {
  for (const platform of ["darwin", "linux", "win32"] as const) {
    const { deps, calls, output } = fake(platform);
    assert.equal(runSetup("add", [], deps), 0, platform);
    const server = platform === "win32" ? ["cmd", "/c", "npx", "-y", PKG] : ["npx", "-y", PKG];
    assert.deepEqual(calls, [
      ["claude", "mcp", "remove", "agentrica", "--scope", "user"],
      ["claude", "mcp", "add", "--scope", "user", "agentrica", "--", ...server],
    ]);
    assert.match(output(), /registrato in Claude Code \(ambito user: tutti i tuoi progetti\), al posto della registrazione precedente/);
  }
});

test("add: --project e --local, flag del server inoltrati; prima registrazione senza «al posto»", () => {
  const { deps, calls, output } = fake("darwin", { "claude mcp remove": { status: 1 } });
  assert.equal(runSetup("add", ["--project", "--agents", "aisa,aiwda-08", "--panel", "--no-ratings", "--no-update-check"], deps), 0);
  assert.deepEqual(calls[1], ["claude", "mcp", "add", "--scope", "project", "agentrica", "--", "npx", "-y", PKG, "--agents", "aisa,aiwda-08", "--panel", "--no-ratings", "--no-update-check"]);
  assert.ok(!output().includes("al posto"));
  const local = fake("linux");
  assert.equal(runSetup("add", ["--local"], local.deps), 0);
  assert.equal(local.calls[1]![4], "local");
});

test("install: npm install -g della stessa versione, poi node <cartella globale>/…/server.js con ambito user", () => {
  for (const [platform, root] of [
    ["darwin", "/opt/homebrew/lib/node_modules"],
    ["win32", "C:\\Users\\Ada Rossi\\AppData\\Roaming\\npm\\node_modules"],
  ] as const) {
    const { deps, calls } = fake(platform, { "npm root -g": { stdout: `${root}\n` } });
    assert.equal(runSetup("install", ["--panel"], deps), 0, platform);
    assert.deepEqual(calls.slice(0, 2), [["npm", "install", "-g", PKG], ["npm", "root", "-g"]]);
    assert.deepEqual(calls[3], ["claude", "mcp", "add", "--scope", "user", "agentrica", "--", "node", join(root, "@agentrica", "mcp", "dist", "mcp", "src", "server.js"), "--panel"]);
  }
});

test("install: --from installa un .tgz; ambiti di progetto non ammessi", () => {
  const { deps, calls } = fake("linux", { "npm root -g": { stdout: "/usr/lib/node_modules" } });
  assert.equal(runSetup("install", ["--from", "./agentrica-mcp-0.6.0.tgz"], deps), 0);
  assert.deepEqual(calls[0], ["npm", "install", "-g", "./agentrica-mcp-0.6.0.tgz"]);
  for (const args of [["--project"], ["--local"]]) {
    const run = fake("linux");
    assert.equal(runSetup("install", args, run.deps), 1);
    assert.deepEqual(run.calls, []);
    assert.match(run.output(), /ambito user/);
  }
  const from = fake("linux");
  assert.equal(runSetup("add", ["--from", "x.tgz"], from.deps), 1);
});

test("senza claude: codice 1 e il comando da lanciare a mano per quel sistema", () => {
  const { deps, calls, output } = fake("win32", { claude: { missing: true, status: null } });
  assert.equal(runSetup("add", [], deps), 1);
  assert.equal(calls.length, 1);
  assert.match(output(), new RegExp(`claude mcp add --scope user agentrica -- cmd /c npx -y ${PKG.replace(/[.@/]/g, "\\$&")}`));
});

test("senza npm, npm che fallisce o Node vecchio: niente registrazione, un messaggio chiaro", () => {
  const noNpm = fake("darwin", { npm: { missing: true, status: null } });
  assert.equal(runSetup("install", [], noNpm.deps), 1);
  assert.match(noNpm.output(), /npm non trovato/);
  const failing = fake("linux", { "npm install -g": { status: 243, stderr: "EACCES" } });
  assert.equal(runSetup("install", [], failing.deps), 1);
  assert.match(failing.output(), /npm config set prefix[\s\S]*EACCES/);
  assert.ok(!failing.calls.some((c) => c[0] === "claude"));
  const old = fake("linux", {}, "20.11.1");
  assert.equal(runSetup("add", [], old.deps), 1);
  assert.deepEqual(old.calls, []);
  assert.match(old.output(), /Node\.js 22 o più recente \(in uso 20\.11\.1\)/);
});

test("claude mcp add che fallisce: codice 1, errore di claude e comando manuale", () => {
  const { deps, output } = fake("linux", { "claude mcp add": { status: 1, stderr: "MCP server agentrica already exists" } });
  assert.equal(runSetup("add", [], deps), 1);
  assert.match(output(), /already exists[\s\S]*claude mcp add/);
});

test("opzioni sbagliate: codice 1 senza comandi", () => {
  for (const args of [["--project", "--local"], ["--agents", "aisa;rm -rf /"], ["--agents", "a b"], ["--sconosciuta"]]) {
    const { deps, calls } = fake("linux");
    assert.equal(runSetup("add", args, deps), 1, args.join(" "));
    assert.deepEqual(calls, []);
  }
});

test("serverCommand e cmdLine: argomenti fra virgolette per cmd, rifiutati se contengono \" o %", () => {
  assert.deepEqual(serverCommand("add", "win32", []), ["cmd", "/c", "npx", "-y", PKG]);
  assert.equal(cmdLine("claude", ["mcp", "add", "C:\\Users\\Ada Rossi\\x.js"]), '""claude" "mcp" "add" "C:\\Users\\Ada Rossi\\x.js""');
  assert.equal(cmdLine("claude", ["%PATH%"]), undefined);
  assert.equal(cmdLine("claude", ['a"b']), undefined);
});
