import assert from "node:assert/strict";
import { test } from "node:test";
import { agentricaTool, chainsReport, chainStats, fileChains, intermediateBytes, programmableCalls, type SessionChains } from "./tool-chains-lib.ts";

// Righe nel formato dei file di Claude Code, costruite a mano: nessuna sessione reale.
const user = (text: string, extra: Record<string, unknown> = {}) => JSON.stringify({ type: "user", message: { role: "user", content: text }, ...extra });
const use = (id: string, name: string, caller = "direct") =>
  JSON.stringify({ type: "assistant", message: { content: [{ type: "tool_use", id, name, input: { segreto: "non deve uscire" }, caller: { type: caller } }] } });
const result = (id: string, content: unknown, isError = false) =>
  JSON.stringify({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: id, content, is_error: isError }] } });

test("agentricaTool: solo i server con agentrica nel nome, nome del tool senza prefisso", () => {
  assert.equal(agentricaTool("mcp__agentrica-dev__agent"), "agent");
  assert.equal(agentricaTool("mcp__agentrica__list_agents"), "list_agents");
  assert.equal(agentricaTool("mcp__tokensave__tokensave_search"), undefined);
  assert.equal(agentricaTool("Bash"), undefined);
  assert.equal(agentricaTool("mcp__agentrica__nome con spazi"), undefined);
  assert.equal(agentricaTool(42), undefined);
});

test("fileChains: un messaggio dell'utente chiude la catena; meta, riassunti e altri tool no", () => {
  const chains = fileChains([
    user("primo compito"),
    use("a", "mcp__agentrica__list_agents"),
    result("a", "x".repeat(100)),
    use("b", "Bash"),
    result("b", "y".repeat(5000)),
    user("testo aggiunto da Claude Code", { isMeta: true }),
    user("riassunto", { isCompactSummary: true }),
    use("c", "mcp__agentrica__agent"),
    result("c", [{ type: "text", text: "è" }, { type: "image", source: {} }]),
    user("secondo compito"),
    use("d", "mcp__agentrica__library", "code_execution"),
    result("d", "errore", true),
    "riga non valida {",
  ]);
  assert.deepEqual(chains, [
    [
      { tool: "list_agents", caller: "direct", bytes: 100, error: false },
      { tool: "agent", caller: "direct", bytes: 2, error: false },
    ],
    [{ tool: "library", caller: "code_execution", bytes: 6, error: true }],
  ]);
});

test("fileChains: una chiamata senza risultato vale zero byte", () => {
  assert.deepEqual(fileChains([use("a", "mcp__agentrica__agent")]), [[{ tool: "agent", caller: "direct", bytes: 0, error: false }]]);
});

test("intermediateBytes: tutti i risultati tranne l'ultimo della catena, senza i testi di istruzioni", () => {
  const call = (bytes: number, tool = "list_agents") => ({ tool, caller: "direct", bytes, error: false });
  assert.equal(intermediateBytes([call(10), call(20), call(30)]), 30);
  assert.equal(intermediateBytes([call(10)]), 0);
  assert.equal(intermediateBytes([call(10), call(100, "agent"), call(200, "agente"), call(300, "library"), call(20)]), 10);
});

const call = (bytes: number) => ({ tool: "list_agents", caller: "direct", bytes, error: false });
const session = (...lengths: number[]): SessionChains => ({ chains: lengths.map((n) => Array.from({ length: n }, () => call(100))), subagentChains: 0 });

test("chainStats: sessioni con catene lunghe e mediana della quota intermedia", () => {
  // Quote intermedie per sessione: 3/4, 0, 0, 1/2 → mediana 1/4.
  const s = chainStats([session(4), session(1), session(1, 1), session(2), { chains: [], subagentChains: 0 }], 1, 2);
  assert.equal(s.sessions, 4);
  assert.equal(s.longSessions, 1);
  assert.equal(s.chains, 5);
  assert.equal(s.calls, 9);
  assert.equal(s.bytes, 900);
  assert.equal(s.intermediate, 400);
  assert.equal(s.medianIntermediateShare, 0.25);
  assert.deepEqual(s.lengths, { "1": 3, "2": 1, "3": 0, "4–5": 1, "6+": 0 });
  assert.equal(s.skipped, 2);
});

test("chainsReport: esito secondo la soglia, stessi numeri, nessun input dei tool", () => {
  const under = chainsReport(chainStats([session(1), session(1), session(2)], 1, 0), "2026-11-25");
  assert.match(under, /Soglia non superata/);
  const over = chainsReport(chainStats([session(4), session(1)], 1, 0), "2026-11-25");
  assert.match(over, /Soglia superata\*\* \(catene lunghe e byte intermedi\)/);
  assert.match(chainsReport(chainStats([], 3, 0), "2026-11-25"), /nessun dato/);
  assert.equal(over, chainsReport(chainStats([session(4), session(1)], 1, 0), "2026-11-25"));
  const fromLines = chainsReport(chainStats([{ chains: fileChains([use("a", "mcp__agentrica__agent"), result("a", "contenuto-riservato")]), subagentChains: 0 }], 1, 0), "2026-11-25");
  assert.doesNotMatch(fromLines, /segreto|non deve uscire|contenuto-riservato/);
});

test("chainStats: byte intermedi per tool, senza i testi di agent", () => {
  const c = (tool: string, bytes: number) => ({ tool, caller: "direct", bytes, error: false });
  const s = chainStats([{ chains: [[c("list_agents", 10), c("agent", 100), c("agent", 200)], [c("agent", 50)]], subagentChains: 0 }], 1, 0);
  assert.deepEqual(s.byTool, [
    { tool: "agent", calls: 3, bytes: 350, intermediate: 0, errors: 0 },
    { tool: "list_agents", calls: 1, bytes: 10, intermediate: 10, errors: 0 },
  ]);
});

test("programmableCalls: senza testi di istruzioni e senza ask_user; solo queste fanno una catena lunga", () => {
  const c = (tool: string) => ({ tool, caller: "direct", bytes: 1, error: false });
  const orchestration = ["agent", "ask_user", "report", "agent", "ask_user", "report", "library", "agente"].map(c);
  assert.equal(programmableCalls(orchestration), 2);
  const s = chainStats([{ chains: [orchestration], subagentChains: 0 }, { chains: [["list_agents", "check", "report", "list_agents"].map(c)], subagentChains: 0 }], 1, 0);
  assert.equal(s.longSessions, 1);
  assert.equal(s.lengths["6+"], 1);
});
