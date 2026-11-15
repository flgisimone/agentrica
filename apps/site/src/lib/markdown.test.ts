import assert from "node:assert/strict";
import { test } from "node:test";
import { parseInline, parseMarkdown } from "./markdown.ts";

test("paragrafi su più righe, separati da righe vuote", () => {
  assert.deepEqual(parseMarkdown("Una\nriga.\n\nDue."), [
    { type: "p", inlines: [{ type: "text", text: "Una riga." }] },
    { type: "p", inlines: [{ type: "text", text: "Due." }] },
  ]);
});

test("elenchi puntati e numerati, anche subito dopo un paragrafo", () => {
  const blocks = parseMarkdown("Intro:\n- a\n- b\n1. uno\n2. due");
  assert.deepEqual(
    blocks.map((b) => b.type),
    ["p", "ul", "ol"],
  );
  assert.equal(blocks[1]?.type === "ul" && blocks[1].items.length, 2);
  assert.equal(blocks[2]?.type === "ol" && blocks[2].items.length, 2);
});

test("blocco di codice preservato così com'è", () => {
  assert.deepEqual(parseMarkdown('Prima\n```json\n{\n  "a": 1\n}\n```\nDopo'), [
    { type: "p", inlines: [{ type: "text", text: "Prima" }] },
    { type: "code", text: '{\n  "a": 1\n}' },
    { type: "p", inlines: [{ type: "text", text: "Dopo" }] },
  ]);
});

test("grassetto e codice in linea", () => {
  assert.deepEqual(parseInline("Non **modificare** il file `00-common-rules.md`."), [
    { type: "text", text: "Non " },
    { type: "strong", text: "modificare" },
    { type: "text", text: " il file " },
    { type: "code", text: "00-common-rules.md" },
    { type: "text", text: "." },
  ]);
});
