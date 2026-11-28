// «Impara» (F53): formato delle lezioni e del glossario, stesse sezioni e stessi link in italiano e inglese, link al
// repository che esistono, termini nel glossario, e una lezione collegata (o la nota) per ogni fase completata del piano.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { GLOSSARY_FILE, LANGS, LEARN_DIR, LESSON_SECTIONS, linkKind, links, loadGlossary, loadLessons, loadPhaseIndex, type Lang } from "./learn.ts";

const ROOT = dirname(LEARN_DIR);
const lessons = { it: loadLessons("it"), en: loadLessons("en") };
const glossary = { it: loadGlossary("it"), en: loadGlossary("en") };

/** I link di un testo in una forma uguale nelle due lingue: il file del glossario diventa «term:». */
const sameForm = (markdown: string, lang: Lang) =>
  links(markdown).map(({ target }) => {
    const link = linkKind(target, lang);
    return link.kind === "term" ? `term:${link.id}` : target;
  });

test("lezioni: dieci per lingua, stessi id e numeri, slug unici, le cinque sezioni", () => {
  for (const lang of LANGS) {
    assert.equal(lessons[lang].length, 10, lang);
    assert.equal(new Set(lessons[lang].map((l) => l.slug)).size, 10, `${lang}: slug ripetuti`);
    for (const lesson of lessons[lang]) assert.deepEqual(lesson.sections.map((s) => s.heading), LESSON_SECTIONS[lang]);
  }
  assert.deepEqual(lessons.en.map((l) => `${l.number}-${l.id}`), lessons.it.map((l) => `${l.number}-${l.id}`));
});

test("lezioni: stessi link in italiano e inglese, sezione per sezione", () => {
  lessons.it.forEach((it, i) => {
    const en = lessons.en[i]!;
    it.sections.forEach((section, s) => {
      assert.deepEqual(sameForm(en.sections[s]!.body, "en"), sameForm(section.body, "it"), `${en.path}, sezione ${s + 1}`);
    });
  });
});

test("lezioni: lunghezza fra 600 e 1200 parole", () => {
  for (const lang of LANGS)
    for (const lesson of lessons[lang]) assert.ok(lesson.words >= 600 && lesson.words <= 1200, `${lesson.path}: ${lesson.words} parole`);
});

test("lezioni: «In Agentrica» ha almeno un link al repository, e ogni link porta a un file che esiste", () => {
  for (const lang of LANGS)
    for (const lesson of lessons[lang]) {
      const repo = links(lesson.sections[2]!.body).map((l) => linkKind(l.target, lang)).filter((l) => l.kind === "repo");
      assert.ok(repo.length > 0, `${lesson.path}: nessun link al repository in «${LESSON_SECTIONS[lang][2]}»`);
      for (const link of lesson.sections.flatMap((s) => links(s.body)).map((l) => linkKind(l.target, lang))) {
        if (link.kind === "repo") assert.ok(existsSync(join(ROOT, link.path.split("#")[0]!)), `${lesson.path}: ${link.path} non esiste`);
        if (link.kind === "lesson") assert.ok(lessons[lang].some((l) => l.id === link.id), `${lesson.path}: lezione ${link.id} non esiste`);
      }
    }
});

test("lezioni: ogni termine marcato è nel glossario, e «Termini» elenca solo termini", () => {
  for (const lang of LANGS) {
    const ids = new Set(glossary[lang].map((t) => t.id));
    for (const lesson of lessons[lang]) {
      for (const link of lesson.sections.flatMap((s) => links(s.body)).map((l) => linkKind(l.target, lang)))
        if (link.kind === "term") assert.ok(ids.has(link.id), `${lesson.path}: «${link.id}» non è in ${GLOSSARY_FILE[lang]}`);
      const terms = links(lesson.sections[4]!.body).map((l) => linkKind(l.target, lang));
      assert.ok(terms.length > 0 && terms.every((l) => l.kind === "term"), `${lesson.path}: «${LESSON_SECTIONS[lang][4]}»`);
    }
  }
});

test("lezioni: l'ultima porta a /installa", () => {
  for (const lang of LANGS) assert.ok(sameForm(lessons[lang].at(-1)!.sections.map((s) => s.body).join("\n"), lang).includes("/installa"));
});

test("glossario: stessi id nelle due lingue, unici, e i link delle definizioni ai termini esistono", () => {
  assert.deepEqual(glossary.en.map((t) => t.id), glossary.it.map((t) => t.id));
  assert.equal(new Set(glossary.it.map((t) => t.id)).size, glossary.it.length);
  for (const lang of LANGS) {
    const ids = new Set(glossary[lang].map((t) => t.id));
    for (const term of glossary[lang])
      for (const link of links(term.definition).map((l) => linkKind(l.target, lang)))
        if (link.kind === "term") assert.ok(ids.has(link.id), `${GLOSSARY_FILE[lang]}: ${link.id}`);
  }
});

test("fasi: ogni fase completata di plan/README.md ha una lezione collegata o la nota «nessun concetto nuovo»", () => {
  const index = loadPhaseIndex();
  const ids = new Set(lessons.it.map((l) => l.id));
  const completed = readFileSync(join(ROOT, "plan", "README.md"), "utf8")
    .split("\n")
    .map((line) => /^\| (F\d+) \|.*\| completata[^|]*\|$/.exec(line)?.[1])
    .filter((phase) => phase !== undefined);
  assert.ok(completed.length > 50);
  for (const phase of completed) assert.ok(index.has(phase), `learn/fasi.md: manca ${phase}`);
  for (const [phase, lessonIds] of index) for (const id of lessonIds) assert.ok(ids.has(id), `learn/fasi.md: ${phase} → ${id} non è una lezione`);
  assert.ok(lessons.it.every((l) => l.phases.length > 0), "ogni lezione ha almeno una fase collegata");
});

test("exports: ./learn porta a JavaScript e tipi di src/learn.ts, learn/ è nel pacchetto", () => {
  const pkg = JSON.parse(readFileSync(join(import.meta.dirname, "..", "package.json"), "utf8")) as {
    exports: Record<string, unknown>;
    files: string[];
    scripts: { prepack: string };
  };
  assert.deepEqual(pkg.exports["./learn"], { types: "./dist/mcp/src/learn.d.ts", default: "./dist/mcp/src/learn.js" });
  assert.ok(pkg.files.includes("learn") && pkg.scripts.prepack.includes("cp -R ../../learn learn"));
});
