import assert from "node:assert/strict";
import { test } from "node:test";
import type { Card, Source } from "../packages/catalog/src/library.ts";
import { addDays, cleanLink, cleanTitle, dueCards, MAX_BODY, MAX_ITEMS, MAX_TITLE, newItems, parseFeed, parseReleases, redirectTarget, report, sinceFor, toDay } from "./study-lib.ts";

const SOURCE: Source = { id: "prova", name: "Fonte di prova", level: 1, url: "https://esempio.org/", domains: ["esempio.org", "github.com"], update: "rss", feed: "https://esempio.org/rss", access: "libero", checked: "2026-11-01" };
const card = (id: string, verified: string, review: string): Card => ({
  id, number: 1, title: `Scheda ${id}`, source: { id: "prova", name: "Fonte di prova", level: 1 }, version: "1", verified, review, roles: ["AISA-02"], notion: "n", application: "a", path: `p/${id}`,
});

test("cleanTitle: entità, tag, Markdown, menzioni, invisibili e lunghezza", () => {
  assert.equal(cleanTitle("<![CDATA[Release <b>4.1</b> &amp; note]]>"), "Release 4.1 & note");
  assert.equal(cleanTitle("[clicca](https://x.test) @utente #12 `rm`"), "clicca https://x.test utente 12 rm");
  assert.equal(cleanTitle("&lt;script&gt;alert(1)&lt;/script&gt;"), "alert 1");
  assert.equal(cleanTitle("a‮b​c\u0007d"), "a b c d");
  assert.equal(cleanTitle("&#0; &#x110000; ok"), "ok");
  const long = cleanTitle("x".repeat(500));
  assert.equal(long.length, MAX_TITLE);
  assert.ok(long.endsWith("…"));
});

test("cleanLink: solo https nei domini della fonte, senza credenziali né porta", () => {
  assert.equal(cleanLink("https://blog.esempio.org/a?b=1", SOURCE.domains), "https://blog.esempio.org/a?b=1");
  for (const raw of ["http://esempio.org/", "https://esempio.org.evil.test/", "javascript:alert(1)", "https://u:p@esempio.org/", "https://esempio.org:444/", `https://esempio.org/${"a".repeat(400)}`, "", undefined]) {
    assert.equal(cleanLink(raw, SOURCE.domains), undefined, String(raw));
  }
});

test("toDay: date RSS, Atom e ISO", () => {
  assert.equal(toDay("Wed, 18 Nov 2026 01:00:00 GMT"), "2026-11-18");
  assert.equal(toDay("2026-07-28T16:47:49Z"), "2026-07-28");
  assert.equal(toDay("ieri"), undefined);
});

test("parseFeed: RSS e Atom, voci senza titolo o data saltate, link fuori dominio tolti", () => {
  const rss = `<rss><channel><title>Canale</title>
    <item><title>Uno &amp; due</title><link>https://esempio.org/1</link><pubDate>Wed, 18 Nov 2026 01:00:00 GMT</pubDate></item>
    <item><title>Fuori</title><link>https://altro.test/2</link><pubDate>Tue, 17 Nov 2026 01:00:00 GMT</pubDate></item>
    <item><title>Senza data</title><link>https://esempio.org/3</link></item>
  </channel></rss>`;
  assert.deepEqual(parseFeed(rss, SOURCE.domains), [
    { title: "Uno & due", link: "https://esempio.org/1", date: "2026-11-18" },
    { title: "Fuori", date: "2026-11-17" },
  ]);
  const atom = `<feed><entry><title type="html">Nuova versione</title><link rel="alternate" href="https://esempio.org/v"/><updated>2026-11-10T00:00:00Z</updated></entry></feed>`;
  assert.deepEqual(parseFeed(atom, SOURCE.domains), [{ title: "Nuova versione", link: "https://esempio.org/v", date: "2026-11-10" }]);
  assert.deepEqual(parseFeed("non è xml", SOURCE.domains), []);
});

test("parseReleases: release pubblicate, senza bozze e prerelease", () => {
  const data = [
    { name: "v2.0", tag_name: "v2.0", html_url: "https://github.com/o/r/releases/tag/v2.0", published_at: "2026-11-10T00:00:00Z" },
    { name: "", tag_name: "v2.1-rc", prerelease: true, published_at: "2026-11-12T00:00:00Z" },
    { name: "bozza", draft: true, published_at: "2026-11-13T00:00:00Z" },
    { tag_name: "v1.9", html_url: "https://evil.test/x", published_at: "2026-10-01T00:00:00Z" },
  ];
  assert.deepEqual(parseReleases(data, SOURCE.domains), [
    { title: "v2.0", link: "https://github.com/o/r/releases/tag/v2.0", date: "2026-11-10" },
    { title: "v1.9", date: "2026-10-01" },
  ]);
  assert.deepEqual(parseReleases({ message: "rate limit" }, SOURCE.domains), []);
});

test("sinceFor e newItems: dopo l'ultima verifica, dalle più recenti, senza doppioni, al più MAX_ITEMS", () => {
  assert.equal(sinceFor(SOURCE, []), "2026-11-01");
  assert.equal(sinceFor(SOURCE, [card("a", "2026-11-05", "2027-05-05"), card("b", "2026-10-01", "2027-04-01")]), "2026-11-05");
  const items = [
    { title: "vecchia", date: "2026-11-05" },
    { title: "nuova", date: "2026-11-06" },
    { title: "nuova", date: "2026-11-06" },
    { title: "più nuova", date: "2026-11-09" },
  ];
  assert.deepEqual(newItems(items, "2026-11-05").map((i) => i.title), ["più nuova", "nuova"]);
  const many = Array.from({ length: 30 }, (_, i) => ({ title: `v${i}`, date: addDays("2026-11-06", i) }));
  assert.equal(newItems(many, "2026-11-05").length, MAX_ITEMS);
});

test("dueCards: scadute ed entro trenta giorni, in ordine di scadenza", () => {
  const cards = [card("lontana", "2026-11-01", "2027-05-01"), card("presto", "2026-06-01", "2026-12-10"), card("scaduta", "2026-01-01", "2026-11-01")];
  assert.deepEqual(dueCards(cards, "2026-11-19").map((c) => c.id), ["scaduta", "presto"]);
});

test("report: sezioni per reparto, niente di nuovo, motivi ripuliti, limite di GitHub", () => {
  const finding = {
    department: "AISA — AI Software",
    news: [{ source: SOURCE, since: "2026-11-01", items: [{ title: "Uno", link: "https://esempio.org/1", date: "2026-11-18" }, { title: "Due", date: "2026-11-17" }] }],
    due: [card("scaduta", "2026-01-01", "2026-11-01")],
    failed: [{ source: SOURCE, reason: "HTTP 503 <b>@admin</b>" }],
  };
  const text = report([finding, { department: "AIWDA — AI Web Design", news: [], due: [], failed: [] }], "2026-11-19");
  assert.match(text, /^Aggiornata il 2026-11-19 /);
  assert.match(text, /## AISA — AI Software\n\n### Fonte di prova \(prova\), dopo il 2026-11-01\n\n- 2026-11-18 · Uno · https:\/\/esempio\.org\/1\n- 2026-11-17 · Due\n/);
  assert.match(text, /### Schede da ricontrollare\n\n- scaduta \(Scheda scaduta\): scaduta il 2026-11-01\n/);
  assert.match(text, /### Fonti non lette\n\n- prova: HTTP 503 admin\n/);
  assert.ok(!text.includes("AIWDA"));
  assert.match(report([], "2026-11-19"), /Niente di nuovo/);
  const huge = { ...finding, news: Array.from({ length: 600 }, () => finding.news[0]!) };
  assert.ok(report([huge], "2026-11-19").length < MAX_BODY + 200);
});

test("redirectTarget: segue solo https nei domini della fonte, anche con Location relativa (F30-07)", () => {
  const domains = ["esempio.org"];
  assert.equal(redirectTarget("https://esempio.org/rss", "/feed.xml", domains).href, "https://esempio.org/feed.xml");
  assert.equal(redirectTarget("https://esempio.org/rss", "https://www.esempio.org/rss", domains).href, "https://www.esempio.org/rss");
  assert.throws(() => redirectTarget("https://esempio.org/rss", "https://altro.net/rss", domains), /fuori dai domini \(altro\.net\)/);
  assert.throws(() => redirectTarget("https://esempio.org/rss", "http://esempio.org/rss", domains), /fuori dai domini/);
  assert.throws(() => redirectTarget("https://esempio.org/rss", "https://esempio.org.altro.net/", domains), /fuori dai domini/);
  assert.throws(() => redirectTarget("https://esempio.org/rss", null, domains), /senza Location/);
});
