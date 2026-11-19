import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { claudeProjectDir, family, groupTotals, MAIN, parseLine, readUsage, totals, usageReport } from "./usage.ts";

const dir = realpathSync(mkdtempSync(join(tmpdir(), "agentrica-usage-")));
const outside = realpathSync(mkdtempSync(join(tmpdir(), "agentrica-usage-out-")));
after(() => {
  rmSync(dir, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
});

// Una risposta come la scrive Claude Code, con il testo della conversazione che non deve uscire.
const reply = (requestId: string, model: string, usage: object, extra: object = {}) =>
  JSON.stringify({
    type: "assistant",
    requestId,
    timestamp: "2026-11-18T20:31:45.530Z",
    effort: "medium",
    message: { id: `msg_${requestId}`, model, content: [{ type: "text", text: "SEGRETO della conversazione" }], usage },
    ...extra,
  });

const opusUsage = {
  input_tokens: 10,
  output_tokens: 1000,
  output_tokens_details: { thinking_tokens: 200 },
  cache_read_input_tokens: 100_000,
  cache_creation_input_tokens: 20_000,
  cache_creation: { ephemeral_1h_input_tokens: 20_000, ephemeral_5m_input_tokens: 0 },
};
const haikuUsage = { input_tokens: 1000, output_tokens: 2000, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };

mkdirSync(join(dir, "s1", "subagents"), { recursive: true });
writeFileSync(
  join(dir, "s1.jsonl"),
  [
    JSON.stringify({ type: "user", message: { content: "testo dell'utente" } }),
    reply("req_a", "claude-opus-5-5", opusUsage),
    // La stessa risposta, un altro blocco di contenuto: si conta una volta.
    reply("req_a", "claude-opus-5-5", opusUsage),
    "riga non JSON",
    reply("req_s", "<synthetic>", opusUsage),
  ].join("\n"),
);
writeFileSync(join(dir, "s1", "subagents", "agent-x1.jsonl"), reply("req_b", "claude-haiku-5-5", haikuUsage, { isSidechain: true }));
writeFileSync(join(dir, "s1", "subagents", "agent-x1.meta.json"), JSON.stringify({ agentType: "sw-qa-engineer", description: "testo" }));
// Un link simbolico che esce dalla cartella non si segue.
writeFileSync(join(outside, "fuori.jsonl"), reply("req_c", "claude-opus-5-5", opusUsage));
symlinkSync(join(outside, "fuori.jsonl"), join(dir, "link.jsonl"));

test("cartella di Claude Code del progetto", () => {
  // Il separatore è quello del sistema (join): su Windows «\c\projects\…».
  assert.equal(claudeProjectDir("/Users/a/lavoro/agentrica", { CLAUDE_CONFIG_DIR: "/c" }), join("/c", "projects", "-Users-a-lavoro-agentrica"));
  assert.equal(claudeProjectDir("C:\\Users\\a b\\x.y", { CLAUDE_CONFIG_DIR: "/c" }), join("/c", "projects", "C--Users-a-b-x-y"));
});

test("famiglia del modello", () => {
  assert.equal(family("claude-opus-5-5"), "opus");
  assert.equal(family("claude-haiku-5-5"), "haiku");
  assert.equal(family("gpt-x"), undefined);
});

test("una riga dà solo numeri, modello, effort e giorno", () => {
  const parsed = parseLine(reply("req_a", "claude-opus-5-5", opusUsage), "s1", MAIN);
  assert.deepEqual(parsed, [
    "req_a",
    {
      day: "2026-11-18",
      session: "s1",
      agent: MAIN,
      model: "claude-opus-5-5",
      effort: "medium",
      input: 10,
      output: 1000,
      thinking: 200,
      cacheRead: 100_000,
      cacheWrite5m: 0,
      cacheWrite1h: 20_000,
    },
  ]);
  assert.ok(!JSON.stringify(parsed).includes("SEGRETO"));
  assert.equal(parseLine(JSON.stringify({ type: "user" }), "s1", MAIN), null);
  assert.equal(parseLine("{", "s1", MAIN), null);
  // Valori negativi o non numerici valgono 0.
  assert.equal(parseLine(reply("r", "claude-opus-5-5", { input_tokens: -5, output_tokens: "9" }), "s", MAIN)![1].input, 0);
});

test("lettura: righe deduplicate, subagent con il tipo, link simbolici saltati", async () => {
  const { records, skipped } = await readUsage(dir);
  assert.equal(skipped, 1);
  assert.deepEqual(records.map((r) => [r.agent, r.model]).sort(), [
    ["sessione", "claude-opus-5-5"],
    ["sw-qa-engineer", "claude-haiku-5-5"],
  ]);
  assert.deepEqual(await readUsage(join(dir, "manca")), { dir: join(dir, "manca"), records: [], skipped: 0 });
});

test("somme e risparmi coincidono con il calcolo a mano", async () => {
  const { records } = await readUsage(dir);
  const opus = totals(records.filter((r) => r.agent === MAIN));
  // Opus: 10×4 + 1000×20 + 100000×0,4 + 20000×8 = 220040 $/M → 0,22004 $.
  assert.equal(opus.costUsd.toFixed(5), "0.22004");
  // Cache: 100000 × (4 − 0,4) = 360000 $/M → 0,36 $; quota 100000 / 120010.
  assert.equal(opus.cacheSavingUsd.toFixed(5), "0.36000");
  assert.equal(opus.cacheShare.toFixed(4), (100_000 / 120_010).toFixed(4));
  assert.equal(opus.modelSavingUsd, 0);
  const haiku = totals(records.filter((r) => r.agent !== MAIN));
  // Haiku: 1000×0,1 + 2000×0,5 = 1100 $/M; a prezzo Opus 1000×4 + 2000×20 = 44000 $/M; stima 0,0429 $.
  assert.equal(haiku.costUsd.toFixed(4), "0.0011");
  assert.equal(haiku.modelSavingUsd.toFixed(4), "0.0429");
  const all = totals(records);
  assert.equal(all.requests, 2);
  assert.equal(all.totalInput, 10 + 100_000 + 20_000 + 1000);
});

test("gruppi per agente, modello e giorno", async () => {
  const { records } = await readUsage(dir);
  assert.deepEqual(groupTotals(records, "agent").map((g) => g.key), ["sessione", "sw-qa-engineer"]);
  assert.deepEqual(groupTotals(records, "day").map((g) => g.key), ["2026-11-18"]);
  const report = await usageReport("/non/usato", dir);
  assert.equal(report.total.requests, 2);
  assert.equal(report.byModel.length, 2);
  assert.equal(report.prices.date, "2026-11-03");
});
