// Lingua del server (F32): scelta da flag, file e sistema; testi italiani e inglesi con la stessa forma.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { chooseLang, systemLang, TEXTS } from "./texts/index.ts";

test("systemLang: LC_ALL, poi LC_MESSAGES, poi LANG, poi Intl; italiano solo per it", () => {
  assert.equal(systemLang({ LANG: "it_IT.UTF-8" }, "en-US"), "it");
  assert.equal(systemLang({ LC_ALL: "en_US.UTF-8", LANG: "it_IT.UTF-8" }, "it-IT"), "en");
  assert.equal(systemLang({ LC_ALL: "", LC_MESSAGES: "it_CH", LANG: "en_GB" }, "en-US"), "it");
  assert.equal(systemLang({}, "it-IT"), "it", "Windows: niente variabili, vale Intl");
  assert.equal(systemLang({}, "en-US"), "en");
  assert.equal(systemLang({ LANG: "C" }, "it-IT"), "en", "C è una lingua: inglese");
  assert.equal(systemLang({ LANG: "item" }, "en-US"), "en");
  assert.equal(systemLang({ LANG: "it" }, "en-US"), "it");
});

test("chooseLang: flag, poi file salvato (vuoto o non valido non conta), poi sistema", () => {
  const system = () => "it" as const;
  assert.equal(chooseLang("en", "it", system), "en");
  assert.equal(chooseLang(undefined, "en", system), "en");
  assert.equal(chooseLang(undefined, "", system), "it");
  assert.equal(chooseLang(undefined, "fr", system), "it");
  assert.equal(chooseLang(undefined, undefined, () => "en"), "en");
});

/** Le chiavi annidate di un oggetto di testi, con il tipo di ogni valore. */
function shape(value: unknown, path = ""): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [`${path}:${Array.isArray(value) ? `array${value.length}` : typeof value}`];
  return Object.entries(value).flatMap(([key, v]) => shape(v, path ? `${path}.${key}` : key));
}

test("testi del server: italiano e inglese con le stesse chiavi e gli stessi tipi", () => {
  assert.deepEqual(shape(TEXTS.en), shape(TEXTS.it));
});

test("testi della pagina del pannello: stesse chiavi in texts.it.js e texts.en.js", () => {
  const load = (lang: string) => runInNewContext(`${readFileSync(join(import.meta.dirname, "page", `texts.${lang}.js`), "utf8")}\nTEXTS`);
  assert.deepEqual(shape(load("en")), shape(load("it")));
});

test("pagina del pannello: stessi id in index.it.html e index.en.html, lingua dichiarata", () => {
  const ids = (lang: string) => {
    const html = readFileSync(join(import.meta.dirname, "page", `index.${lang}.html`), "utf8");
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    return [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  };
  assert.deepEqual(ids("en"), ids("it"));
});
