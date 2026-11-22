import assert from "node:assert/strict";
import { test } from "node:test";
import { DEPARTMENTS, findAgentsDir, loadCatalog, loadSources } from "./index.ts";
import { isDate, isExpired, parseCard, sourceProblems, urlProblems, type Source } from "./library.ts";

const SOURCE: Source = {
  id: "owasp-top10",
  name: "OWASP Top 10",
  level: 1,
  url: "https://owasp.org/Top10/",
  domains: ["owasp.org"],
  update: "page",
  access: "libero",
  checked: "2026-11-19",
};
const ROLES = new Set(["AICA-04", "AICA-05"]);
const CARD = [
  "# OWASP Top 10:2025",
  "",
  "Fonte: owasp-top10 · Versione: 2025 · Verificata il: 2026-11-19 · Da ricontrollare entro: 2027-05-19 · Ruoli: AICA-04, AICA-05",
  "",
  "## Nozione",
  "Sintesi.",
  "",
  "## Come si applica",
  "Uso.",
  "",
].join("\n");

test("le biblioteche dei cinque reparti: schede valide, fonti di livello 1 o 2, ruoli del reparto", () => {
  const catalog = loadCatalog();
  const dir = findAgentsDir();
  for (const department of catalog) {
    const info = DEPARTMENTS.find((d) => d.code === department.code)!;
    const sources = loadSources(dir, info);
    assert.ok(sources.length > 0, `${department.code}: fonti.json`);
    assert.ok(department.library.length >= 3, `${department.code}: almeno tre schede`);
    const ids = new Set(department.agents.map((a) => a.id));
    for (const card of department.library) {
      assert.ok(card.roles.every((r) => ids.has(r)), card.path);
      assert.ok(sources.some((s) => s.id === card.source.id && (s.level === 1 || s.level === 2)), card.path);
    }
  }
});

test("parseCard: metadati, sezioni e fonte senza URL", () => {
  const card = parseCard(CARD, "01-owasp-top-10-2025.md", "agents/x/biblioteca/01-owasp-top-10-2025.md", [SOURCE], ROLES);
  assert.equal(card.id, "owasp-top-10-2025");
  assert.equal(card.title, "OWASP Top 10:2025");
  assert.deepEqual(card.source, { id: "owasp-top10", name: "OWASP Top 10", level: 1 });
  assert.deepEqual(card.roles, ["AICA-04", "AICA-05"]);
  assert.equal(card.notion, "Sintesi.");
  assert.equal(card.application, "Uso.");
  assert.ok(!JSON.stringify(card).includes("https"));
});

test("parseCard: gli errori nominano il problema", () => {
  const parse = (text: string, sources: Source[] = [SOURCE], file = "01-prova.md") => () => parseCard(text, file, "p", sources, ROLES);
  assert.throws(parse(CARD, [SOURCE], "prova.md"), /NN-nome\.md/);
  assert.throws(parse(CARD.replace("owasp-top10 ·", "altra ·")), /fonte «altra» non in fonti\.json/);
  assert.throws(parse(CARD, [{ ...SOURCE, level: 3 }]), /livello 3: serve una fonte di livello 1 o 2/);
  assert.throws(parse(CARD.replace("AICA-05", "AISA-02")), /ruoli non del reparto: AISA-02/);
  assert.throws(parse(CARD.replace("2027-05-19", "2026-11-01")), /deve venire dopo/);
  assert.throws(parse(CARD.replace("2027-05-19", "2027-02-30")), /AAAA-MM-GG/);
  assert.throws(parse(CARD.replace(" · Ruoli: AICA-04, AICA-05", "")), /riga dei metadati/);
  assert.throws(parse(CARD.replace("## Come si applica", "## Uso")), /sezioni/);
  assert.throws(parse(CARD.replace("Sintesi.", "Vedi https://owasp.org")), /URL o link/);
});

test("urlProblems: solo https nei domini ammessi, senza credenziali né parametri segreti", () => {
  assert.deepEqual(urlProblems("https://owasp.org/Top10/", ["owasp.org"]), []);
  assert.deepEqual(urlProblems("https://cheatsheetseries.owasp.org/x", ["owasp.org"]), []);
  assert.deepEqual(urlProblems("https://example.org/feed?page=2", ["example.org"]), []);
  const cases: [string, RegExp][] = [
    ["http://owasp.org/", /https/],
    ["https://owasp.org.evil.test/", /fuori/],
    ["https://evilowasp.org/", /fuori/],
    ["https://user:pw@owasp.org/", /credenziali/],
    ["https://owasp.org:8443/", /porta/],
    ["https://owasp.org/feed?api_key=x", /parametro/],
    ["https://owasp.org/feed?access_token=x", /parametro/],
    ["non un url", /non valido/],
  ];
  for (const [url, expected] of cases) assert.ok(urlProblems(url, ["owasp.org"]).some((p) => expected.test(p)), url);
});

test("sourceProblems: campi, livelli, accesso, feed e id unici", () => {
  assert.deepEqual(sourceProblems([SOURCE]), []);
  assert.deepEqual(sourceProblems([{ id: "iso-27001", name: "ISO/IEC 27001", level: "citata", domains: ["iso.org"], update: "page", access: "pagamento", checked: "2026-11-19" }]), []);
  const github = { ...SOURCE, id: "node", url: "https://nodejs.org/", domains: ["nodejs.org", "api.github.com"], update: "github", feed: "https://api.github.com/repos/nodejs/node/releases" };
  assert.deepEqual(sourceProblems([github]), []);
  const cases: [unknown, RegExp][] = [
    [{}, /elenco/],
    [[SOURCE, SOURCE], /id ripetuto/],
    [[{ ...SOURCE, level: 4 }], /livello/],
    [[{ ...SOURCE, access: "pagamento" }], /solo citata/],
    [[{ ...SOURCE, url: undefined }], /url mancante/],
    [[{ ...SOURCE, name: "Vedi www.x.test" }], /name con URL/],
    [[{ ...SOURCE, nameEn: "See www.x.test" }], /nameEn con URL/],
    [[{ ...SOURCE, nameEn: "" }], /nameEn mancante/],
    [[{ ...SOURCE, extra: 1 }], /campo sconosciuto/],
    [[{ ...SOURCE, update: "rss" }], /feed mancante/],
    [[{ ...SOURCE, update: "rss", feed: "https://altro.test/rss" }], /feed dominio/],
    [[{ ...github, feed: "https://api.github.com/repos/nodejs/node/tags" }], /feed github/],
    [[{ ...SOURCE, feed: "https://owasp.org/rss" }], /feed senza/],
    [[{ ...SOURCE, domains: ["https://owasp.org"] }], /domini/],
    [[{ ...SOURCE, checked: "ieri" }], /checked/],
  ];
  for (const [data, expected] of cases) {
    const problems = sourceProblems(data);
    assert.ok(problems.some((p) => expected.test(p)), `${JSON.stringify(data).slice(0, 80)} → ${problems.join("; ")}`);
  }
});

test("isDate e isExpired", () => {
  assert.ok(isDate("2028-02-29"));
  assert.ok(!isDate("2027-02-29"));
  assert.ok(!isExpired({ review: "2027-05-19" }, "2027-05-19"));
  assert.ok(isExpired({ review: "2027-05-19" }, "2027-05-20"));
});

test("parseCard in inglese: etichette inglesi, quelle italiane non valgono", () => {
  const en = CARD.replace("Fonte:", "Source:").replace("Versione:", "Version:").replace("Verificata il:", "Verified on:")
    .replace("Da ricontrollare entro:", "Recheck by:").replace("Ruoli:", "Roles:").replace("## Nozione", "## Notion").replace("## Come si applica", "## How it applies");
  const card = parseCard(en, "01-owasp-top-10-2025.md", "p", [SOURCE], ROLES, "en");
  assert.equal(card.review, "2027-05-19");
  assert.equal(card.notion, "Sintesi.");
  assert.throws(() => parseCard(CARD, "01-x.md", "p", [SOURCE], ROLES, "en"), /Source · Version/);
});

test("nameEn (F32): le schede inglesi usano il nome inglese della fonte, quelle italiane il nome", () => {
  const source = { ...SOURCE, name: "OWASP, progetto", nameEn: "OWASP, project" };
  const en = CARD.replace("Fonte:", "Source:").replace("Versione:", "Version:").replace("Verificata il:", "Verified on:")
    .replace("Da ricontrollare entro:", "Recheck by:").replace("Ruoli:", "Roles:").replace("## Nozione", "## Notion").replace("## Come si applica", "## How it applies");
  assert.equal(parseCard(en, "01-x.md", "p", [source], ROLES, "en").source.name, "OWASP, project");
  assert.equal(parseCard(CARD, "01-x.md", "p", [source], ROLES).source.name, "OWASP, progetto");
  assert.equal(parseCard(en, "01-x.md", "p", [SOURCE], ROLES, "en").source.name, "OWASP Top 10", "senza nameEn vale name");
});
