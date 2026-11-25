import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCatalog } from "../packages/mcp/src/catalog.ts";
import { selectSquad } from "../packages/mcp/src/prompt.ts";
import { flowSizes, sizesReport, tokens } from "./agent-text-lib.ts";

test("flowSizes: ripetuti solo regole e biblioteca di un reparto già caricato (AISA-06 dopo AISA-01)", () => {
  const flow = flowSizes(selectSquad(loadCatalog()), "2026-11-25");
  assert.deepEqual(flow.map((f) => f.id), ["AIBPD-01", "AIWDA-01", "AIPCA-01", "AISA-01", "AISA-06"]);
  assert.deepEqual(flow.filter((f) => f.repeated > 0).map((f) => f.id), ["AISA-06"]);
  const last = flow.at(-1)!;
  assert.equal(last.repeated, last.sizes.rules + last.sizes.library);
});

test("sizesReport: stessa data, stessi numeri; token stimati come byte / 4", () => {
  assert.equal(sizesReport("2026-11-25"), sizesReport("2026-11-25"));
  assert.match(sizesReport("2026-11-25"), /## Italiano[\s\S]*## Inglese/);
  assert.equal(tokens(10), 3);
});
