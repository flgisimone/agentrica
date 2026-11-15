import { test } from "node:test";
import assert from "node:assert/strict";
import { formatWeekly, lastMonthsRange, toWeekly, weekStartOf } from "./stats-lib.ts";

test("il periodo finisce ieri e copre i mesi richiesti", () => {
  assert.deepEqual(lastMonthsRange(new Date("2026-11-15T10:00:00Z"), 3), { start: "2026-08-15", end: "2026-11-14" });
  assert.deepEqual(lastMonthsRange(new Date("2026-03-01T00:00:00Z"), 1), { start: "2026-01-29", end: "2026-02-28" });
});

test("la settimana parte dal lunedì", () => {
  assert.equal(weekStartOf("2026-11-16"), "2026-11-16"); // lunedì
  assert.equal(weekStartOf("2026-11-15"), "2026-11-09"); // domenica
  assert.equal(weekStartOf("2026-01-01"), "2025-12-29"); // a cavallo dell'anno
});

test("i giorni si sommano per settimana in ordine cronologico", () => {
  const weekly = toWeekly([
    { day: "2026-11-16", downloads: 4 },
    { day: "2026-11-09", downloads: 1 },
    { day: "2026-11-15", downloads: 2 },
    { day: "2026-11-17", downloads: 0 },
  ]);
  assert.deepEqual(weekly, [
    { weekStart: "2026-11-09", downloads: 3 },
    { weekStart: "2026-11-16", downloads: 4 },
  ]);
  assert.deepEqual(toWeekly([]), []);
});

test("le barre sono proporzionali al massimo e vuote se tutto è zero", () => {
  const lines = formatWeekly(
    [
      { weekStart: "2026-11-02", downloads: 10 },
      { weekStart: "2026-11-09", downloads: 5 },
    ],
    10,
  );
  assert.deepEqual(lines, ["2026-11-02  10  ██████████", "2026-11-09   5  █████"]);
  assert.deepEqual(formatWeekly([{ weekStart: "2026-11-02", downloads: 0 }]), ["2026-11-02  0  "]);
});
