import { test } from "node:test";
import assert from "node:assert/strict";
import { checkOrchestration, toolCalls, type Call } from "./orchestration-lib.ts";

const line = (id: string, blocks: object[], extra: object = {}) =>
  JSON.stringify({ type: "assistant", message: { id, content: blocks }, ...extra });
const use = (name: string, input: object = {}) => ({ type: "tool_use", name, input });
const ok = (calls: Call[], asked = false) => Object.fromEntries(checkOrchestration(calls, asked).map((c) => [c.criterion, c.ok]));

test("le chiamate si leggono in ordine, senza i subagent e senza testi", () => {
  const calls = toolCalls([
    line("m1", [{ type: "text", text: "ciao" }, use("mcp__aigentrica__list_agents")]),
    line("m2", [use("mcp__aigentrica__agent", { id: "aiwda-01", task: "segreto" })]),
    line("m3", [use("Read", { file_path: "x" })], { isSidechain: true }),
    line("m4", [use("Agent", { subagent_type: "Explore", prompt: "x" })]),
    "non json con \"tool_use\"",
    JSON.stringify({ type: "user", message: { content: [use("Bash")] } }),
  ]);
  assert.deepEqual(calls, [
    { message: "m1", name: "mcp__aigentrica__list_agents" },
    { message: "m2", name: "mcp__aigentrica__agent", target: "AIWDA-01" },
    { message: "m4", name: "Agent", target: "Explore" },
  ]);
});

const agent = (message: string, id: string): Call => ({ message, name: "mcp__aigentrica__agent", target: id });
const list: Call = { message: "m0", name: "mcp__aigentrica__list_agents" };
const ask: Call = { message: "mq", name: "mcp__aigentrica__ask_user" };

test("una sessione in ordine passa tutti i criteri", () => {
  const calls = [list, agent("z", "AIBPD-01"), agent("a", "AIWDA-01"), agent("b", "AIWDA-03"), agent("c", "AIPCA-01"), ask, agent("d", "AISA-01"), agent("e", "AISA-05"), agent("f", "AIWDA-01")];
  assert.ok(Object.values(ok(calls)).every(Boolean));
});

test("subagent, specialista prima del direttore, agenti insieme, ordine e conferma mancanti non passano", () => {
  const calls: Call[] = [
    { message: "s", name: "Agent", target: "sw-cto" },
    agent("a", "AISA-05"),
    agent("b", "AIWDA-01"),
    agent("b", "AIWDA-02"),
  ];
  const result = ok(calls);
  assert.equal(result["Nessun subagent senza richiesta"], false);
  assert.equal(result["list_agents prima di agent"], false);
  assert.equal(result["Direttore prima degli specialisti"], false);
  assert.equal(result["Un agente alla volta"], false);
  assert.equal(result["Ordine fra reparti"], false);
  // Un reparto solo che non è il business non è in ordine: il software da solo è il rosso di F43 e F48.
  assert.equal(ok([list, agent("a", "AISA-01")])["Ordine fra reparti"], false);
  assert.equal(ok([list, agent("a", "AIBPD-01")])["Ordine fra reparti"], true);
  assert.equal(ok([list, agent("a", "AIWDA-01"), agent("b", "AISA-01"), agent("c", "AISA-02")])["Conferma dell'utente prima del software"], false);
  // Il direttore software può chiedere la conferma prima degli specialisti (prova di VS Code del 2026-11-22).
  assert.equal(ok([list, agent("a", "AIWDA-01"), agent("b", "AISA-01"), ask, agent("c", "AISA-02")])["Conferma dell'utente prima del software"], true);
  assert.equal(ok([{ message: "s", name: "Task" }], true)["Nessun subagent senza richiesta"], true);
});

test("senza agenti i criteri sugli agenti non passano", () => {
  const result = ok([list]);
  assert.equal(result["list_agents prima di agent"], false);
  assert.equal(result["Direttore prima degli specialisti"], false);
});
