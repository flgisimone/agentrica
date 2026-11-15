import assert from "node:assert/strict";
import { test } from "node:test";
import { DEPARTMENTS } from "../../../../packages/catalog/src/departments.ts";
import { glyph } from "./glyph.ts";

const stars = DEPARTMENTS.flatMap((d) => d.stars);

test("glyph: stesso nome, stesso disegno", () => {
  for (const star of stars) assert.deepEqual(glyph(star), glyph(star));
});

test("glyph: 56 stelle, 56 disegni diversi", () => {
  assert.equal(stars.length, 56);
  assert.equal(new Set(stars.map((s) => JSON.stringify(glyph(s)))).size, 56);
});

test("glyph: da 4 a 7 punti dentro la cornice, tutti sulla linea", () => {
  for (const star of stars) {
    const { dots, line } = glyph(star);
    assert.ok(dots.length >= 4 && dots.length <= 7, star);
    assert.equal(line.split(" ").length, dots.length * 2, star);
    for (const d of dots) {
      assert.ok(Math.hypot(d.x - 50, d.y - 50) + d.r <= 40, star);
      assert.ok(line.includes(`${d.x} ${d.y}`), star);
    }
  }
});
