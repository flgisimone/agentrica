import assert from "node:assert/strict";
import { test } from "node:test";
import { advance, stepAt, type Progress, type TerminalLine } from "./terminal.ts";

const lines: TerminalLine[] = [
  { kind: "command", text: "ls", step: 0 },
  { kind: "output", text: "a b", step: 0 },
  { kind: "confirm", text: "Ok? › Sì", step: 1 },
];

function run(): Progress[] {
  const states: Progress[] = [];
  let state: Progress = { shown: 0, typed: 0 };
  for (let next = advance(lines, state); next; next = advance(lines, state)) {
    assert.ok(next.delay > 0);
    state = next.next;
    states.push(state);
  }
  return states;
}

test("advance: i comandi si scrivono lettera per lettera, le altre righe compaiono intere", () => {
  assert.deepEqual(run(), [
    { shown: 0, typed: 1 },
    { shown: 0, typed: 2 },
    { shown: 1, typed: 0 },
    { shown: 2, typed: 0 },
    { shown: 3, typed: 0 },
  ]);
});

test("advance: a fine copione si ferma", () => {
  assert.equal(advance(lines, { shown: lines.length, typed: 0 }), null);
  assert.equal(advance([], { shown: 0, typed: 0 }), null);
});

test("advance: la conferma aspetta più di un output", () => {
  assert.ok(advance(lines, { shown: 2, typed: 0 })!.delay > advance(lines, { shown: 1, typed: 0 })!.delay);
});

test("stepAt: il passo della riga in corso, l'ultimo a fine copione", () => {
  assert.equal(stepAt(lines, { shown: 0, typed: 1 }), 0);
  assert.equal(stepAt(lines, { shown: 2, typed: 0 }), 1);
  assert.equal(stepAt(lines, { shown: 3, typed: 0 }), 1);
});

test("advance: un comando lungo non supera le 45 battute", () => {
  const long: TerminalLine[] = [{ kind: "command", text: "x".repeat(200) }];
  let state: Progress = { shown: 0, typed: 0 };
  let keystrokes = 0;
  while (state.shown === 0) {
    state = advance(long, state)!.next;
    keystrokes++;
  }
  assert.ok(keystrokes <= 46, `${keystrokes} battute`);
});
