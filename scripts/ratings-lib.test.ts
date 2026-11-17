import assert from "node:assert/strict";
import { test } from "node:test";
import { formatSummary, summarize, type RatingRow } from "./ratings-lib.ts";

const row = (agent_id: string, rating: number, mcp_version = "0.5.0", comment = "", created_at = "2026-12-01T10:00:00Z"): RatingRow => ({
  agent_id,
  rating,
  comment,
  mcp_version,
  created_at,
});

test("summarize: media, distribuzione, versioni dalla più nuova, agenti dalla media più bassa", () => {
  const out = summarize([
    row("AISA-02", 5),
    row("AISA-02", 4, "0.10.0"),
    row("AISA-02", 3, "0.9.1"),
    row("AIWDA-08", 2),
    row("AIWDA-08", 1),
  ]);
  assert.deepEqual(out.map((s) => s.agentId), ["AIWDA-08", "AISA-02"]);
  const altair = out[1]!;
  assert.equal(altair.count, 3);
  assert.equal(altair.mean, 4);
  assert.deepEqual(altair.distribution, [0, 0, 1, 1, 1]);
  assert.deepEqual(altair.byVersion.map((v) => v.version), ["0.10.0", "0.9.1", "0.5.0"]);
});

test("summarize: solo i commenti non vuoti, il più recente prima, data corta", () => {
  const [s] = summarize([
    row("AISA-02", 2, "0.5.0", "Troppo generico", "2026-12-01T10:00:00Z"),
    row("AISA-02", 4, "0.5.0", "   ", "2026-12-03T10:00:00Z"),
    row("AISA-02", 5, "0.5.1", " Ottimo ", "2026-12-02T10:00:00Z"),
  ]);
  assert.deepEqual(s!.comments, [
    { rating: 5, version: "0.5.1", date: "2026-12-02", text: "Ottimo" },
    { rating: 2, version: "0.5.0", date: "2026-12-01", text: "Troppo generico" },
  ]);
});

test("formatSummary: vuoto, totale, testata, versioni e commenti su una riga", () => {
  assert.deepEqual(formatSummary([]), ["Nessuna valutazione."]);
  const lines = formatSummary(summarize([row("AISA-02", 3, "0.5.0", "Riga\nspezzata")]));
  assert.equal(lines[0], "1 valutazione per 1 agente.");
  assert.equal(lines[2], "AISA-02  media 3.00  su 1  [1★ 0  2★ 0  3★ 1  4★ 0  5★ 0]");
  assert.equal(lines[3], "  0.5.0: media 3.00 su 1");
  assert.equal(lines[4], "  - 2026-12-01 3★ (0.5.0) Riga spezzata");
});
