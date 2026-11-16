// L'export «@agentrica/mcp/catalog» (F17): legge gli agents/ del pacchetto e package.json punta ai file che tsc produce.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { AGENTS_DIR, loadCatalog } from "./catalog.ts";

test("loadCatalog: gli agents/ tre livelli sopra, cinque reparti e 56 agenti", () => {
  assert.equal(AGENTS_DIR, join(import.meta.dirname, "..", "..", "..", "agents"));
  const catalog = loadCatalog();
  assert.equal(catalog.length, 5);
  assert.equal(catalog.flatMap((d) => d.agents).length, 56);
});

test("exports: ./catalog porta a JavaScript e tipi di src/catalog.ts dentro dist", () => {
  const pkg = JSON.parse(readFileSync(join(import.meta.dirname, "..", "package.json"), "utf8")) as {
    exports: Record<string, { types: string; default: string }>;
    files: string[];
  };
  assert.deepEqual(pkg.exports["./catalog"], { types: "./dist/mcp/src/catalog.d.ts", default: "./dist/mcp/src/catalog.js" });
  assert.ok(existsSync(join(import.meta.dirname, "catalog.ts")));
  assert.ok(pkg.files.includes("dist") && pkg.files.includes("agents"));
});
