import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { claudeProjectDir, family, groupTotals, MAIN, MAX_SHARE_ROWS, parseLine, readUsage, shareRows, subagentRuns, totals, usageReport, type Usage } from "./usage.ts";

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

const usage = (over: Partial<Usage>): Usage => ({
  day: "2026-11-18", session: "s1", agent: MAIN, model: "claude-opus-5-5", effort: "medium",
  input: 1, output: 2, thinking: 0, cacheRead: 3, cacheWrite5m: 4, cacheWrite1h: 5, ...over,
});
const ids = new Map([["sw-architect", "AISA-02"]]);

test("shareRows: una riga per sessione, giorno, agente, modello ed effort, con le somme e la chiave", () => {
  const { rows, omitted } = shareRows(
    [usage({}), usage({ input: 10 }), usage({ session: "s2" }), usage({ agent: "sw-architect", model: "claude-haiku-5-5", effort: "low" })],
    ids,
    "2026-11-19",
  );
  assert.equal(omitted, 0);
  assert.equal(rows.length, 3);
  const main = rows.filter((r) => r.agent === MAIN);
  assert.equal(main.length, 2, "due sessioni, due righe");
  const s1 = main.find((r) => r.input === 11)!;
  assert.deepEqual({ ...s1, key: undefined }, { key: undefined, day: "2026-11-18", agent: MAIN, model: "opus", effort: "medium", input: 11, output: 4, cacheRead: 6, cacheWrite: 18 });
  assert.match(s1.key, /^[0-9a-f]{64}$/);
  assert.notEqual(main[0]!.key, main[1]!.key);
  assert.deepEqual(rows.find((r) => r.agent === "AISA-02")!.model, "haiku");
  // La stessa riga ha la stessa chiave a ogni lettura: il sito la sostituisce invece di sommarla.
  assert.equal(shareRows([usage({})], ids, "2026-11-19").rows[0]!.key, shareRows([usage({ input: 99 })], ids, "2026-11-19").rows[0]!.key);
});

test("shareRows: nomi dei subagent dell'utente, modelli ed effort sconosciuti diventano «altro»; niente session id", () => {
  const { rows } = shareRows([usage({ agent: "il-mio-progetto-segreto", model: "gpt-x", effort: "turbo", session: "abc-123" })], ids, "2026-11-19");
  assert.deepEqual([rows[0]!.agent, rows[0]!.model, rows[0]!.effort], ["altro", "altro", "altro"]);
  assert.ok(!JSON.stringify(rows).includes("segreto") && !JSON.stringify(rows).includes("abc-123"));
});

test("shareRows: solo gli ultimi 30 giorni, senza righe vuote, al più 300 dalle più recenti", () => {
  const { rows } = shareRows(
    [usage({ day: "2026-10-20" }), usage({ day: "2026-10-21" }), usage({ day: "2026-11-20" }), usage({ day: "sconosciuto" }), usage({ day: "2026-11-01", input: 0, output: 0, cacheRead: 0, cacheWrite5m: 0, cacheWrite1h: 0 })],
    ids,
    "2026-11-19",
  );
  assert.deepEqual(rows.map((r) => r.day), ["2026-10-21"]);
  const many = Array.from({ length: MAX_SHARE_ROWS + 5 }, (_, i) => usage({ session: `s${i}`, day: i < 5 ? "2026-11-01" : "2026-11-18" }));
  const cut = shareRows(many, ids, "2026-11-19");
  assert.equal(cut.rows.length, MAX_SHARE_ROWS);
  assert.equal(cut.omitted, 5);
  assert.ok(cut.rows.every((r) => r.day === "2026-11-18"), "restano fuori le più vecchie");
});

test("subagentRuns (F34-06): solo i subagent della sessione, con tipo, descrizione corta e stato, dal più vecchio", async () => {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "agentrica-runs-")));
  try {
    const sub = join(dir, "sessione-1", "subagents");
    mkdirSync(sub, { recursive: true });
    const meta = (name: string, body: object) => writeFileSync(join(sub, `${name}.meta.json`), JSON.stringify(body));
    meta("agent-a1", { agentType: "design-ux-writer", description: "Testi\ndel modulo", finished: true, prompt: "segreto" });
    meta("agent-b2", { agentType: "<script>", description: "x".repeat(300) });
    const start = new Date(Date.now() - 10_000).toISOString();
    writeFileSync(join(sub, "agent-a1.jsonl"), `${JSON.stringify({ type: "user", timestamp: start })}\n{}\n`);
    // Avviato prima della sessione, .meta.json scritto dopo (F34-R4): l'ora è quella del transcript, quindi resta fuori.
    meta("agent-d4", { agentType: "Explore", finished: true });
    writeFileSync(join(sub, "agent-d4.jsonl"), `${JSON.stringify({ type: "user", timestamp: "2020-01-01T00:00:00.000Z" })}\n`);
    writeFileSync(join(sub, "nota.meta.json"), "{}");
    mkdirSync(join(dir, "vecchia", "subagents"), { recursive: true });
    const old = join(dir, "vecchia", "subagents");
    writeFileSync(join(old, "agent-c3.meta.json"), JSON.stringify({ agentType: "Explore" }));
    utimesSync(old, new Date(0), new Date(0));

    const runs = await subagentRuns(dir, Date.now() - 60_000);
    assert.deepEqual(runs.map(({ type, finished }) => [type, finished]).sort(), [["design-ux-writer", true], ["subagent", false]]);
    const writer = runs.find((r) => r.type === "design-ux-writer")!;
    assert.equal(writer.description, "Testi del modulo");
    assert.equal(writer.time, start, "ora di avvio dal transcript");
    assert.equal(runs.find((r) => r.type === "subagent")!.description.length, 120);
    assert.ok(!JSON.stringify(runs).includes("segreto"), "il prompt non esce");
    assert.deepEqual(await subagentRuns(dir, Date.now() + 60_000), [], "avviati prima della sessione");
    assert.deepEqual(await subagentRuns(join(dir, "manca"), 0), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
