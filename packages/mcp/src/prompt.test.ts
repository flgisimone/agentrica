import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { loadCatalog } from "../../catalog/src/index.ts";
import { loadCatalog as loadPackaged } from "./catalog.ts";
import { setLang } from "./texts/index.ts";
import { agentList, agentSizes, agentText, cardText, directorOf, findAgent, introLine, libraryIndex, modelAdvice, promptName, selectSquad, VERSION } from "./prompt.ts";

const catalog = loadCatalog();

test("findAgent: id senza distinguere maiuscole, sconosciuto → undefined", () => {
  assert.equal(findAgent(catalog, "aisa-02")?.agent.star, "ALTAIR");
  assert.equal(findAgent(catalog, "aisa-99"), undefined);
  assert.equal(findAgent(catalog, ""), undefined);
});

test("agentText: cornice, regole comuni e file di ruolo nell'ordine, testi dal catalogo", () => {
  for (const department of catalog) {
    for (const agent of department.agents) {
      const text = agentText({ department, agent });
      assert.ok(text.startsWith(`# ${agent.id} · ${agent.star} — ${agent.role}\n`), agent.id);
      const order = [
        "## Regole comuni del reparto",
        department.rules.intro,
        ...department.rules.sections.map((s) => `### ${s.heading}\n\n${s.body}`),
        `## Ruolo: ${agent.role}`,
        agent.intro,
        ...agent.sections.map((s) => `### ${s.heading}\n\n${s.body}`),
      ];
      let from = 0;
      for (const piece of order) {
        const at = text.indexOf(piece, from);
        assert.ok(at >= from, `${agent.id}: manca o fuori ordine «${piece.slice(0, 40)}»`);
        from = at + piece.length;
      }
      assert.ok(!text.includes("## Compito"), agent.id);
      const empty = text.indexOf("Se il progetto è vuoto o manca ciò che il tuo ruolo deve esaminare");
      assert.ok(empty > 0 && empty < text.indexOf("## Regole comuni del reparto"), agent.id);
      assert.match(text, /non inventare rilievi né scegliere lo stack da solo/);
      const language = text.indexOf("rispondi nella lingua in cui ti scrive l'utente");
      assert.ok(language > 0 && language < text.indexOf("## Regole comuni del reparto"), agent.id);
    }
  }
});

test("agentText: l'agente si presenta con nome in codice, ruolo e reparto, prima delle regole (F20-12)", () => {
  for (const department of catalog) {
    for (const agent of department.agents) {
      const text = agentText({ department, agent });
      const line = `«${agent.id} · ${agent.star} — ${agent.role}, reparto ${department.code} (${department.name})»`;
      const at = text.indexOf(`Presentati all'inizio con questa riga: ${line}`);
      assert.ok(at > 0 && at < text.indexOf("## Regole comuni del reparto"), agent.id);
      assert.match(text, /Ripetila quando passi a un altro agente o lasci il ruolo, e firma con il tuo nome in codice i rilievi e il riepilogo finale\./);
    }
  }
  assert.equal(introLine(findAgent(catalog, "AISA-02")!), "AISA-02 · ALTAIR — Senior Software Architect, reparto AISA (AI Software)");
});

test("agentText: la proposta di valutazione c'è solo con le valutazioni attive", () => {
  const found = findAgent(catalog, "AIWDA-08")!;
  assert.ok(!agentText(found).includes("rate_agent"));
  const text = agentText(found, undefined, { ratings: true });
  assert.match(text, /proponi all'utente di valutarti da 1 a 5 .*\(tool rate_agent, id AIWDA-08\), una volta sola in questa sessione/);
  // In fondo, anche dopo il compito (F23-03).
  assert.ok(text.indexOf("rate_agent") > text.indexOf(`## Ruolo: ${found.agent.role}`));
  assert.ok(agentText(found, "Rivedi il menu.", { ratings: true }).endsWith("una volta sola in questa sessione; se rifiuta, non insistere.\n"));
});

test("promptName: id in minuscolo e nome breve del reparto, uno per agente", () => {
  assert.equal(promptName(findAgent(catalog, "AISA-02")!), "aisa-02-software");
  assert.equal(promptName(findAgent(catalog, "AIBPD-01")!), "aibpd-01-business");
  assert.equal(promptName(findAgent(catalog, "AICA-03")!), "aica-03-cybersecurity");
  assert.equal(promptName(findAgent(catalog, "AIPCA-02")!), "aipca-02-privacy");
  assert.equal(promptName(findAgent(catalog, "AIWDA-04")!), "aiwda-04-design");
  const names = catalog.flatMap((department) => department.agents.map((agent) => promptName({ department, agent })));
  assert.equal(new Set(names).size, 56);
  for (const name of names) assert.match(name, /^[a-z]+-\d{2}-[a-z]+$/);
});

test("agentText: il compito va in fondo, vuoto si omette", () => {
  const found = findAgent(catalog, "AISA-02")!;
  assert.ok(agentText(found, "  Rivedi i confini dei moduli.  ").endsWith("## Compito\n\nRivedi i confini dei moduli.\n"));
  assert.ok(!agentText(found, "   ").includes("## Compito"));
});

test("README del pacchetto e della radice (it, en): ogni comando @aigentrica/mcp@x.y.z ha VERSION", () => {
  // Il sito confronta i suoi comandi con il README pubblicato: la 0.15.0 è uscita con quelli della 0.13.0 (F43).
  for (const file of ["README.md", "README.it.md", "../../README.md", "../../README.it.md"]) {
    const text = readFileSync(join(import.meta.dirname, "..", file), "utf8");
    const versions = [...text.matchAll(/@aigentrica\/mcp@(\d+\.\d+\.\d+)/g)].map((m) => m[1]);
    assert.ok(versions.length > 0, file);
    assert.deepEqual([...new Set(versions)], [VERSION], file);
  }
});

test("VERSION e nome nel registro MCP uguali in package.json e server.json", () => {
  const read = (file: string) => JSON.parse(readFileSync(join(import.meta.dirname, "..", file), "utf8"));
  const pkg = read("package.json") as { name: string; version: string; mcpName: string };
  const server = read("server.json") as { name: string; version: string; packages: { identifier: string; version: string }[] };
  assert.equal(VERSION, pkg.version);
  assert.equal(server.name, pkg.mcpName);
  assert.equal(server.version, pkg.version);
  assert.deepEqual(
    server.packages.map((p) => [p.identifier, p.version]),
    [[pkg.name, pkg.version]],
  );
});

const ids = (squad: ReturnType<typeof selectSquad>) => squad.flatMap((d) => d.agents.map((a) => a.id));

test("selectSquad: senza elenco tutto il catalogo", () => {
  assert.equal(ids(selectSquad(catalog)).length, 56);
});

test("selectSquad: agenti e reparti, maiuscole indifferenti, ordine del catalogo, niente doppioni", () => {
  const squad = selectSquad(catalog, " aiwda-08 , AISA,aisa-02,");
  assert.deepEqual(squad.map((d) => d.code), ["AISA", "AIWDA"]);
  assert.equal(squad[0]!.agents.length, 12);
  assert.deepEqual(squad[1]!.agents.map((a) => a.id), ["AIWDA-08"]);
  assert.equal(ids(squad).length, 13);
  assert.deepEqual(ids(selectSquad(catalog, "aica-03,aibpd-01")), ["AIBPD-01", "AICA-03"]);
});
test("selectSquad: i reparti della squadra non portano il direttore, che può essere fuori squadra", () => {
  for (const squad of [selectSquad(catalog), selectSquad(catalog, "aica-03")]) {
    for (const department of squad) assert.ok(!("director" in department), department.code);
  }
});

test("selectSquad: nomi sconosciuti o elenco vuoto sono errori che li nominano", () => {
  assert.throws(() => selectSquad(catalog, "aisa-02,aisa-99,xyz"), /sconosciuto in --agents: "aisa-99", "xyz"$/);
  assert.throws(() => selectSquad(catalog, "\u001b[31m"), /"\\u001b\[31m"/);
  assert.throws(() => selectSquad(catalog, ""), /--agents è vuoto/);
  assert.throws(() => selectSquad(catalog, " , "), /--agents è vuoto/);
});

// F33: CHANGELOG.en.md è il gemello inglese, con le stesse versioni e date e gli stessi tipi nello stesso ordine.
const KINDS = { "CHANGELOG.md": ["Nuovo", "Cambiato", "Corretto", "Incompatibile"], "CHANGELOG.en.md": ["Added", "Changed", "Fixed", "Breaking"] };
const changelogShape = (file: keyof typeof KINDS) => {
  const text = readFileSync(join(import.meta.dirname, "..", file), "utf8");
  return [...text.matchAll(/^(##|###) (.+)$|^- /gm)].map((m) => (m[1] === "###" ? KINDS[file].indexOf(m[2]!) : m[1] ? m[2]! : "-"));
};

test("CHANGELOG.md e CHANGELOG.en.md: la prima voce è VERSION, ogni voce «## x.y.z — AAAA-MM-GG» con i tipi ammessi, dalla 0.1.0", () => {
  for (const file of ["CHANGELOG.md", "CHANGELOG.en.md"] as const) {
    const shape = changelogShape(file);
    const versions = shape.filter((x): x is string => typeof x === "string" && x !== "-");
    for (const line of versions) assert.match(line, /^\d+\.\d+\.\d+ — \d{4}-\d{2}-\d{2}$/, `${file}: ${line}`);
    assert.equal(versions[0]!.split(" ")[0], VERSION, file);
    assert.equal(versions.at(-1)!.split(" ")[0], "0.1.0", file);
    assert.ok(!shape.includes(-1), `${file}: tipo sconosciuto`);
  }
  assert.deepEqual(changelogShape("CHANGELOG.en.md"), changelogShape("CHANGELOG.md"));
});

// F24-08: il testo di un agente entra nel contesto a ogni uso. Da F25 la soglia è di 10 KB (decisione dell'utente del
// 2026-11-19): l'indice della biblioteca aggiunge circa 0,8 KB e circa 60 byte per scheda. Chi la supera la cambia con una decisione.
test("agentText: nessun agente supera i 10 KB, con la proposta di valutazione e la biblioteca", () => {
  const big = selectSquad(catalog).flatMap((department) =>
    department.agents.map((agent) => ({ id: agent.id, bytes: Buffer.byteLength(agentText({ department, agent }, undefined, { ratings: true })) })),
  );
  assert.equal(big.length, 56);
  assert.deepEqual(big.filter((a) => a.bytes > 10_240), []);
});

// F24-06: il modello consigliato viene dal catalogo, solo per i ruoli misurati; i subagent di .claude/agents/ (copiati
// anche da init) hanno lo stesso modello del catalogo per il loro file di ruolo.
test("modelAdvice: modello consigliato solo per i ruoli misurati, nel testo dell'agente", () => {
  const qa = findAgent(catalog, "aisa-08")!;
  assert.equal(qa.agent.model, "haiku");
  assert.match(agentText(qa), /Modello consigliato: Haiku, misurato sui casi di prova di AIgentrica\. Se il progetto ha i subagent di AIgentrica \(init --subagents\)/);
  const architect = findAgent(catalog, "aisa-02")!;
  assert.equal(architect.agent.model, "inherit");
  assert.equal(modelAdvice(architect.agent), undefined);
  assert.doesNotMatch(agentText(architect), /Modello consigliato/);
  const measured = catalog.flatMap((d) => d.agents.filter((a) => a.model !== "inherit").map((a) => `${a.id}:${a.model}`));
  // F24 (2026-11-19-modelli.md), F37 (2026-11-23-ondata-1.md), F49 (2026-11-27-ondata-2.md), F50 (2026-11-27-ondata-3.md) e F51 (2026-11-27-ondata-4.md): solo i ruoli che superano la soglia.
  assert.deepEqual(measured, [
    ...["AIBPD-02", "AIBPD-03", "AIBPD-04", "AIBPD-05", "AIBPD-06", "AIBPD-07"].map((id) => `${id}:sonnet`),
    ...["AIBPD-08", "AIBPD-09", "AIBPD-10", "AIBPD-11", "AIBPD-12"].map((id) => `${id}:sonnet`),
    ...["AICA-03:sonnet", "AICA-04:sonnet", "AICA-05:sonnet", "AICA-06:sonnet", "AICA-07:sonnet", "AICA-08:sonnet"],
    ...["AICA-09:haiku", "AICA-12:haiku"],
    ...["AIPCA-02:sonnet", "AIPCA-03:sonnet", "AIPCA-05:sonnet", "AIPCA-06:sonnet", "AIPCA-07:sonnet", "AIPCA-08:sonnet"],
    ...["AISA-03:sonnet", "AISA-05:sonnet", "AISA-06:sonnet", "AISA-07:sonnet", "AISA-08:haiku", "AISA-09:sonnet", "AISA-10:sonnet", "AISA-11:sonnet"],
    ...["AIWDA-04", "AIWDA-05", "AIWDA-06", "AIWDA-07", "AIWDA-08", "AIWDA-10"].map((id) => `${id}:sonnet`),
  ]);
});

test("resoconto: con il pannello il testo chiede il tool report, prima della valutazione", () => {
  const qa = findAgent(catalog, "aisa-08")!;
  assert.doesNotMatch(agentText(qa), /tool report/);
  const text = agentText(qa, "Prova", { report: true, ratings: true });
  assert.match(text, /## Resoconto\n\n.*tool report \(id AISA-08\)/);
  assert.ok(text.indexOf("## Resoconto") < text.indexOf("## Valutazione"));
});

test("gerarchia (F34-04): il direttore coordina, lo specialista riporta al direttore o, fuori squadra, all'utente", () => {
  assert.match(agentText(findAgent(catalog, "aisa-01")!), /Sei il direttore del reparto: .*department AISA/);
  assert.match(agentText(findAgent(catalog, "aiwda-08")!), /Riporti a AIWDA-01 · [A-Z]+, il direttore del reparto: .*agent \(id AIWDA-01\)/);
  const alone = findAgent(selectSquad(loadCatalog(), "aiwda-08"), "aiwda-08")!;
  assert.match(agentText(alone), /Il direttore del reparto non è nella squadra/);
  assert.equal(directorOf(alone.department), undefined);
});

test("subagent: model: uguale al modello consigliato del catalogo per il file di ruolo", () => {
  const dir = join(import.meta.dirname, "..", "..", "..", ".claude", "agents");
  const files = readdirSync(dir, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".md"));
  assert.equal(files.length, 56);
  for (const file of files) {
    const text = readFileSync(join(dir, file), "utf8");
    const source = /`(agents\/[^`]+\/\d\d-[^`]+\.md)`/.exec(text)?.[1];
    const agent = catalog.flatMap((d) => d.agents).find((a) => a.source === source);
    assert.ok(agent, `${file}: file di ruolo non trovato`);
    assert.equal(/^model: (\w+)$/m.exec(text)?.[1], agent.model, file);
  }
});

test("libraryIndex: una riga per scheda del reparto, ruolo e scadenza segnati, prima del compito", () => {
  const found = findAgent(catalog, "AISA-08")!;
  const [heading, intro, list] = libraryIndex(found, "2026-11-19");
  assert.equal(heading, "## Biblioteca del reparto");
  assert.match(intro!, /tool library \(id AISA-08/);
  assert.equal(list!.split("\n").length, found.department.library.length);
  assert.match(list!, /^- typescript-7 \*: TypeScript 7\.0 \(7\.0, 2026-11-19\)$/m);
  assert.match(list!, /^- mcp-2026-07-28: [^\n]*\(2026-07-28, 2026-11-19\)$/m);
  const later = libraryIndex(found, "2030-01-01")[2]!;
  assert.match(later, /, 2026-11-19, da ricontrollare\)$/m);
  const text = agentText(found, "Rivedi i test.", { date: "2026-11-19" });
  assert.ok(text.indexOf("## Biblioteca del reparto") > text.indexOf("## Ruolo:"));
  assert.ok(text.indexOf("## Biblioteca del reparto") < text.indexOf("## Compito"));
  const empty = { ...found, department: { ...found.department, library: [] } };
  assert.deepEqual(libraryIndex(empty, "2026-11-19"), []);
});

test("cardText: fonte con livello e date, niente URL, avviso se scaduta", () => {
  for (const department of catalog) {
    for (const card of department.library) {
      const text = cardText(card, card.verified);
      assert.ok(text.startsWith(`# ${card.title}\n\nFonte: ${card.source.name} (livello ${card.source.level}), versione ${card.version}.`), card.path);
      assert.ok(!/https?:|www\./.test(text), card.path);
      assert.ok(!text.includes("Scaduta"), card.path);
    }
  }
  const card = catalog[0]!.library[0]!;
  assert.match(cardText(card, "2099-01-01"), /Scaduta: verificala sulla fonte/);
});

// F40-07: i componenti di --sizes vengono da agentParts; la loro somma è il testo intero, per ogni agente e lingua.
test("agentSizes: la somma dei componenti è la lunghezza del testo, in italiano e in inglese", () => {
  const variants = [
    [undefined, {}],
    ["Compito «è»", { ratings: true, report: true }],
    [undefined, { report: true }],
    ["Compito", { report: true, known: true }],
  ] as const;
  try {
    for (const lang of ["it", "en"] as const) {
      setLang(lang);
      for (const department of selectSquad(loadPackaged(lang))) {
        for (const agent of department.agents) {
          for (const [task, options] of variants) {
            const sizes = agentSizes({ department, agent }, task, { ...options, date: "2026-11-25" });
            const text = agentText({ department, agent }, task, { ...options, date: "2026-11-25" });
            assert.equal(Object.values(sizes).reduce((a, b) => a + b, 0), Buffer.byteLength(text), `${lang} ${agent.id}`);
            assert.equal(sizes.task > 0, task !== undefined, `${lang} ${agent.id}`);
            assert.ok(sizes.rules > 0 && sizes.role > 0 && sizes.frame > 0, `${lang} ${agent.id}`);
          }
        }
      }
    }
  } finally {
    setLang("it");
  }
});

// F41-01, 04 e 06: con le regole già inviate, al loro posto e al posto dell'indice un riferimento; il resto non cambia.
test("known: regole e indice come riferimento, cornice, ruolo, compito e chiusura identici, nelle due lingue", () => {
  try {
    for (const lang of ["it", "en"] as const) {
      setLang(lang);
      for (const department of selectSquad(loadPackaged(lang))) {
        for (const agent of department.agents) {
          const found = { department, agent };
          const options = { report: true, ratings: true, date: "2026-11-25" };
          const full = agentText(found, "Compito", options);
          const known = agentText(found, "Compito", { ...options, known: true });
          const [fullSizes, knownSizes] = [agentSizes(found, "Compito", options), agentSizes(found, "Compito", { ...options, known: true })];
          for (const c of ["frame", "role", "task", "closing"] as const) assert.equal(knownSizes[c], fullSizes[c], `${lang} ${agent.id} ${c}`);
          assert.ok(knownSizes.rules < fullSizes.rules / 5, `${lang} ${agent.id}`);
          assert.ok(knownSizes.library <= fullSizes.library, `${lang} ${agent.id}`);
          // Le regole intere non ci sono più; il file di ruolo, con i suoi limiti e le regole di sicurezza, sì.
          for (const section of department.rules.sections) assert.ok(!known.includes(section.body), `${lang} ${agent.id} ${section.heading}`);
          for (const section of agent.sections) assert.ok(known.includes(`### ${section.heading}\n\n${section.body}`), `${lang} ${agent.id} ${section.heading}`);
          assert.ok(known.includes(`${agent.id}`) && /full_rules true/.test(known), `${lang} ${agent.id}`);
          assert.ok(known.includes(department.code), `${lang} ${agent.id}`);
          // Le schede del ruolo restano nominate.
          for (const card of department.library.filter((c) => c.roles.includes(agent.id))) assert.ok(known.includes(card.id), `${lang} ${agent.id} ${card.id}`);
          assert.equal(agentText(found, "Compito", { ...options, known: false }), full);
        }
      }
    }
  } finally {
    setLang("it");
  }
});

// Rilievo di F40 (P2), decisione dell'utente del 2026-11-25: oltre 12 KB con tutto il catalogo si riapre la selezione
// con metadati e ricerca (decisione «Roadmap consolidata» del piano). Chi la supera apre quella fase.
test("list_agents: tutto il catalogo entro 12 KB, nelle due lingue", () => {
  try {
    for (const lang of ["it", "en"] as const) {
      setLang(lang);
      assert.ok(Buffer.byteLength(agentList(selectSquad(loadPackaged(lang)))) <= 12_288, lang);
    }
  } finally {
    setLang("it");
  }
});
