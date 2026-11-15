import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCatalog } from "@agentrica/catalog";
import { agentText, findAgent } from "./prompt.ts";

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
