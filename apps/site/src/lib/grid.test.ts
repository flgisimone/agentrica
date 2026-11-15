import assert from "node:assert/strict";
import { test } from "node:test";
import { spanInRows } from "./grid.ts";

const spans = (count: number, prefix: string) =>
  Array.from({ length: count }, (_, i) => {
    const match = new RegExp(`${prefix}:col-span-(\\d)`).exec(spanInRows(i, count));
    return match ? Number(match[1]) : 1;
  });

test("spanInRows: ogni riga sul computer somma 6 colonne", () => {
  for (const count of [1, 2, 4, 5, 7, 9, 10, 11, 12]) {
    const sum = spans(count, "lg").reduce((a, b) => a + b, 0);
    assert.equal(sum % 6, 0, `${count} elementi`);
  }
  assert.deepEqual(spans(5, "lg"), [2, 2, 2, 3, 3]);
  assert.deepEqual(spans(9, "lg"), Array(9).fill(2));
});

test("spanInRows: sul computer mai una scheda sola nell'ultima riga, se ce ne sono altre", () => {
  assert.deepEqual(spans(1, "lg"), [6]);
  assert.deepEqual(spans(4, "lg"), [3, 3, 3, 3]);
  assert.deepEqual(spans(7, "lg"), [2, 2, 2, 3, 3, 3, 3]);
  assert.deepEqual(spans(10, "lg"), [2, 2, 2, 2, 2, 2, 3, 3, 3, 3]);
});

test("spanInRows: sul tablet solo l'ultimo di un numero dispari prende la riga", () => {
  assert.deepEqual(spans(5, "md"), [1, 1, 1, 1, 2]);
  assert.deepEqual(spans(4, "md"), [1, 1, 1, 1]);
});
