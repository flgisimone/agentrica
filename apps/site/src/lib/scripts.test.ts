import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadCatalog } from "../../../../packages/catalog/src/index.ts";
import { flowNodes, mcp, mcpDemoScript, simulationScript } from "./scripts.ts";

const catalog = loadCatalog();

test("simulazione: ogni riga ha un passo del diagramma, in ordine, e ogni passo ha righe", () => {
  const steps = simulationScript(catalog).map((line) => line.step);
  assert.ok(steps.every((s) => s !== undefined && s >= 0 && s < flowNodes.length));
  assert.deepEqual(steps, [...steps].sort((a, b) => a! - b!));
  assert.deepEqual([...new Set(steps)], flowNodes.map((_, i) => i));
});

test("simulazione: le righe degli agenti hanno il nome in codice e il reparto del catalogo", () => {
  for (const line of simulationScript(catalog).filter((l) => l.kind === "agent" && l.label?.includes("·"))) {
    const id = line.label!.split(" · ")[0]!;
    const agent = catalog.flatMap((d) => d.agents).find((a) => a.id === id)!;
    assert.equal(line.label, `${agent.id} · ${agent.star}`);
    assert.equal(line.dept, agent.department);
  }
});

test("MCP: i comandi sono quelli del README di packages/mcp", () => {
  const readme = readFileSync(new URL("../../../../packages/mcp/README.md", import.meta.url), "utf8");
  for (const command of [mcp.add, mcp.use]) assert.ok(readme.includes(command), command);
  const pkg = JSON.parse(readFileSync(new URL("../../../../packages/mcp/package.json", import.meta.url), "utf8")) as { version: string };
  assert.ok(mcp.add.endsWith(`@agentrica/mcp@${pkg.version}`), "versione del pacchetto nel comando");
});

test("MCP: la dimostrazione cita il file di ruolo vero di AISA-02", () => {
  const text = mcpDemoScript(catalog).map((l) => l.text).join("\n");
  const agent = catalog.flatMap((d) => d.agents).find((a) => a.id === "AISA-02")!;
  assert.ok(text.includes(agent.sections[0]!.body.split(". ")[0]!));
});
