import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchLatest, installKind, isNewer, updateMessage } from "./update.ts";

const reply = (body: string, status = 200): typeof fetch => async () => new Response(body, { status });

test("isNewer: confronto numerico di x.y.z, formati diversi mai più nuovi", () => {
  assert.equal(isNewer("0.6.1", "0.6.0"), true);
  assert.equal(isNewer("0.10.0", "0.9.9"), true);
  assert.equal(isNewer("1.0.0", "0.99.0"), true);
  assert.equal(isNewer("0.6.0", "0.6.0"), false);
  assert.equal(isNewer("0.5.9", "0.6.0"), false);
  for (const bad of ["0.7.0-beta.1", "v0.7.0", "0.7", "", "0.7.0\n", "9999999.0.0"]) assert.equal(isNewer(bad, "0.6.0"), false, bad);
});

test("fetchLatest: solo una versione x.y.z dal campo latest", async () => {
  assert.equal(await fetchLatest("http://x", reply('{"latest":"0.7.0","next":"0.8.0-rc.1"}')), "0.7.0");
  for (const body of ['{"latest":"0.7.0 <script>"}', '{"latest":7}', '{"next":"0.7.0"}', "[]", "null", "non json", '"0.7.0"']) {
    assert.equal(await fetchLatest("http://x", reply(body)), undefined, body);
  }
  assert.equal(await fetchLatest("http://x", reply('{"latest":"0.7.0"}', 500)), undefined);
});

test("fetchLatest: risposta troppo grande, rete assente o timeout → undefined", async () => {
  assert.equal(await fetchLatest("http://x", reply(`{"latest":"0.7.0","x":"${"a".repeat(5000)}"}`)), undefined);
  assert.equal(await fetchLatest("http://x", async () => Promise.reject(new TypeError("fetch failed"))), undefined);
  const aborted: typeof fetch = async (_url, init) => {
    assert.ok(init?.signal, "serve un timeout");
    throw new DOMException("timeout", "TimeoutError");
  };
  assert.equal(await fetchLatest("http://x", aborted), undefined);
});

test("installKind: cartella globale di npm, cache di npx o clone, su Mac, Linux e Windows", () => {
  assert.equal(installKind("/opt/homebrew/lib/node_modules/@aigentrica/mcp/dist/mcp/src/server.js"), "global");
  assert.equal(installKind("C:\\Users\\Ada Rossi\\AppData\\Roaming\\npm\\node_modules\\@aigentrica\\mcp\\dist\\mcp\\src\\server.js"), "global");
  assert.equal(installKind("/home/ada/.npm/_npx/1a2b/node_modules/@aigentrica/mcp/dist/mcp/src/server.js"), "npx");
  assert.equal(installKind("C:\\Users\\ada\\AppData\\Local\\npm-cache\\_npx\\1a2b\\node_modules\\@aigentrica\\mcp\\dist\\mcp\\src\\server.js"), "npx");
  assert.equal(installKind("/Users/ada/aigentrica/packages/mcp/src/server.ts"), "source");
});

test("updateMessage: versioni e comando per come è installato il server", () => {
  assert.match(updateMessage("0.6.0", "0.7.0", "global"), /versione 0\.7\.0 .*in uso la 0\.6\.0.*npx -y @aigentrica\/mcp@0\.7\.0 install/);
  assert.match(updateMessage("0.6.0", "0.7.0", "npx"), /@aigentrica\/mcp@0\.7\.0 nel comando del server/);
  assert.match(updateMessage("0.6.0", "0.7.0", "source"), /git pull/);
});
