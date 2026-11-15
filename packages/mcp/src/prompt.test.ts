import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { loadCatalog } from "../../catalog/src/index.ts";
import { agentText, findAgent, selectSquad, VERSION } from "./prompt.ts";

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

test("agentText: il compito va in fondo, vuoto si omette", () => {
  const found = findAgent(catalog, "AISA-02")!;
  assert.ok(agentText(found, "  Rivedi i confini dei moduli.  ").endsWith("## Compito\n\nRivedi i confini dei moduli.\n"));
  assert.ok(!agentText(found, "   ").includes("## Compito"));
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
