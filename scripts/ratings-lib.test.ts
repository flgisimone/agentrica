import assert from "node:assert/strict";
import { test } from "node:test";
import {
  commentStatus,
  findAnomalies,
  formatAnomalies,
  formatSummary,
  parseCommand,
  resultMessage,
  summarize,
  type RatingRow,
} from "./ratings-lib.ts";

let next = 0;
const row = (
  agent_id: string,
  rating: number,
  mcp_version = "0.5.0",
  comment = "",
  created_at = "2026-12-01T10:00:00Z",
  extra: Partial<RatingRow> = {},
): RatingRow => ({
  usage_id: `00000000-0000-4000-8000-${String(next++).padStart(12, "0")}`,
  agent_id,
  rating,
  comment,
  mcp_version,
  created_at,
  publish_consent: false,
  comment_status: "pending",
  excluded: false,
  ...extra,
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
    { rating: 5, version: "0.5.1", date: "2026-12-02", status: "privato", text: "Ottimo" },
    { rating: 2, version: "0.5.0", date: "2026-12-01", status: "privato", text: "Troppo generico" },
  ]);
});

test("formatSummary: vuoto, totale, testata, versioni e commenti su una riga", () => {
  assert.deepEqual(formatSummary([]), ["Nessuna valutazione."]);
  const lines = formatSummary(summarize([row("AISA-02", 3, "0.5.0", "Riga\nspezzata")]));
  assert.equal(lines[0], "1 valutazione per 1 agente.");
  assert.equal(lines[2], "AISA-02  media 3.00  su 1  [1★ 0  2★ 0  3★ 1  4★ 0  5★ 0]");
  assert.equal(lines[3], "  0.5.0: media 3.00 su 1");
  assert.equal(lines[4], "  - 2026-12-01 3★ (0.5.0) [privato] Riga spezzata");
});

test("summarize: i voti esclusi non contano e si vedono a parte", () => {
  const [s] = summarize([row("AISA-02", 5), row("AISA-02", 1, "0.5.0", "spam", undefined, { excluded: true })]);
  assert.equal(s!.count, 1);
  assert.equal(s!.mean, 5);
  assert.equal(s!.excluded, 1);
  assert.deepEqual(s!.comments, []);
  assert.match(formatSummary([s!])[2]!, /esclusi 1$/);
  const [only] = summarize([row("AISA-03", 1, "0.5.0", "", undefined, { excluded: true })]);
  assert.match(formatSummary([only!])[2]!, /^AISA-03  media –  su 0 /);
});

test("commentStatus: privato senza consenso, poi lo stato della moderazione", () => {
  assert.equal(commentStatus({ publish_consent: false, comment_status: "approved" }), "privato");
  assert.equal(commentStatus({ publish_consent: true, comment_status: "pending" }), "in attesa");
  assert.equal(commentStatus({ publish_consent: true, comment_status: "approved" }), "pubblicato");
  assert.equal(commentStatus({ publish_consent: true, comment_status: "rejected" }), "rifiutato");
});

test("findAnomalies: 5 voti allo stesso agente in meno di un'ora sono un picco, 4 no", () => {
  const at = (minute: number) => `2026-12-01T10:${String(minute).padStart(2, "0")}:00Z`;
  const spike = [0, 10, 20, 30, 59].map((m) => row("AISA-02", 5, "0.5.0", "", at(m)));
  const [a] = findAnomalies([...spike, row("AISA-02", 5, "0.5.0", "", "2026-12-01T12:00:00Z")]);
  assert.equal(a!.kind, "picco");
  assert.deepEqual(a!.usageIds, spike.map((r) => r.usage_id));
  assert.deepEqual(findAnomalies(spike.slice(0, 4)), []);
  assert.deepEqual(findAnomalies(spike.map((r) => ({ ...r, excluded: true }))), []);
  const late = [0, 15, 30, 45].map((m) => row("AISA-02", 5, "0.5.0", "", at(m))).concat(row("AISA-02", 5, "0.5.0", "", "2026-12-01T11:00:00Z"));
  assert.deepEqual(findAnomalies(late), []);
});

test("findAnomalies: commenti uguali dopo la normalizzazione, anche su agenti diversi", () => {
  const a = row("AISA-02", 5, "0.5.0", "Il migliore!");
  const b = row("AIWDA-08", 5, "0.5.0", "  il MIGLIORE ", "2026-12-05T10:00:00Z");
  const [d] = findAnomalies([a, b, row("AISA-02", 4, "0.5.0", "Altro")]);
  assert.equal(d!.kind, "commento duplicato");
  assert.match(d!.detail, /^2 volte \(AISA-02, AIWDA-08\): «il migliore»$/);
  assert.deepEqual(d!.usageIds, [a.usage_id, b.usage_id]);
  assert.deepEqual(formatAnomalies([]), []);
  assert.match(formatAnomalies([d!])[1]!, /--exclude/);
});

test("parseCommand: riepilogo, moderazione, azioni con un codice valido", () => {
  const id = "3f2b9c1e-8a4d-4f6b-9c2e-1d7a5b8e0f42";
  assert.deepEqual(parseCommand([]), { kind: "summary" });
  assert.deepEqual(parseCommand(["--moderate"]), { kind: "moderate" });
  assert.deepEqual(parseCommand(["--revoke", id.toUpperCase()]), { kind: "action", action: "revoke", usageId: id });
  for (const flag of ["--exclude", "--include", "--delete"]) assert.equal(parseCommand([flag, id]).kind, "action");
  for (const args of [["--approve", id], ["--exclude"], ["--exclude", "x"], ["--moderate", id], ["--delete", id, id]]) {
    assert.deepEqual(parseCommand(args), { kind: "usage" }, args.join(" "));
  }
});

test("resultMessage: esiti di moderate_rating", () => {
  assert.match(resultMessage("ok"), /entro un'ora/);
  assert.match(resultMessage("not_found"), /Nessuna valutazione/);
  assert.match(resultMessage("not_publishable"), /consenso/);
  assert.match(resultMessage(undefined), /inatteso/);
});
