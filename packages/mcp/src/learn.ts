// Export pubblico «@agentrica/mcp/learn» (F53): le lezioni di «Impara» lette dai learn/ di questo pacchetto, per il
// sito. Formato in learn/README.md. Come catalog.ts non importa l'SDK né zod, e learn/ è in un punto fisso: tre livelli
// sopra questo file sia da un clone sia nel pacchetto, dove prepack la copia.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { LANGS, type Lang } from "../../catalog/src/index.ts";
import { parseRole, type Section } from "../../catalog/src/markdown.ts";

export { LANGS, type Lang, type Section };

export const LEARN_DIR = join(import.meta.dirname, "..", "..", "..", "learn");

/** Le sezioni di ogni lezione, in quest'ordine, per lingua. */
export const LESSON_SECTIONS: Record<Lang, readonly string[]> = {
  it: ["In breve", "L'idea", "In Agentrica", "Prova", "Termini"],
  en: ["In short", "The idea", "In Agentrica", "Try it", "Terms"],
};

/** Il file del glossario per lingua: le lezioni lo citano nei link «glossario.md#id». */
export const GLOSSARY_FILE: Record<Lang, string> = { it: "glossario.md", en: "glossary.md" };

/** La nota di learn/fasi.md per una fase che non porta concetti nuovi. */
export const NO_NEW_CONCEPT = "nessun concetto nuovo";

const META: Record<Lang, { slug: string; description: string }> = {
  it: { slug: "Slug", description: "Descrizione" },
  en: { slug: "Slug", description: "Description" },
};
const LESSON_FILE = /^(\d{2})-([a-z0-9-]+)\.md$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Parole al minuto per il tempo di lettura.
const WORDS_PER_MINUTE = 200;

export interface Lesson {
  /** Il nome del file senza numero, uguale nelle due lingue: es. «language-model». */
  id: string;
  number: number;
  /** Segmento dell'indirizzo nella lingua della lezione. */
  slug: string;
  title: string;
  description: string;
  /** Le cinque sezioni di LESSON_SECTIONS, nell'ordine; i corpi in Markdown. */
  sections: Section[];
  /** Le fasi collegate, da learn/fasi.md. */
  phases: string[];
  words: number;
  minutes: number;
  /** Percorso del file rispetto alla root del repository. */
  path: string;
}

export interface Term {
  /** Uguale nelle due lingue: è l'ancora dei link «glossario.md#id». */
  id: string;
  term: string;
  definition: string;
}

const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n");

/** learn/fasi.md: fase → id delle lezioni collegate, o vuoto con la nota «nessun concetto nuovo». */
export function loadPhaseIndex(dir = LEARN_DIR): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const line of read(join(dir, "fasi.md")).split("\n")) {
    const row = /^\| (F\d+) \| (.+?) \|$/.exec(line);
    if (!row) continue;
    const [, phase, value] = row as unknown as [string, string, string];
    if (index.has(phase)) throw new Error(`learn/fasi.md: ${phase} due volte`);
    index.set(phase, value === NO_NEW_CONCEPT ? [] : value.split(",").map((id) => id.trim()));
  }
  return index;
}

/** Le lezioni nella lingua `lang`, in ordine di numero. Si ferma su un file malformato. */
export function loadLessons(lang: Lang = "it", dir = LEARN_DIR): Lesson[] {
  const phases = loadPhaseIndex(dir);
  const files = readdirSync(join(dir, lang)).filter((name) => LESSON_FILE.test(name)).sort();
  return files.map((file, position) => {
    const [, number, id] = LESSON_FILE.exec(file)!;
    const path = `learn/${lang}/${file}`;
    if (Number(number) !== position + 1) throw new Error(`${path}: numero ${number}, atteso ${position + 1}`);
    const { title, intro, sections } = parseRole(read(join(dir, lang, file)));
    const meta = parseMeta(intro, lang, path);
    const headings = sections.map((s) => s.heading);
    if (headings.join("|") !== LESSON_SECTIONS[lang].join("|"))
      throw new Error(`${path}: sezioni «${headings.join(", ")}», attese «${LESSON_SECTIONS[lang].join(", ")}»`);
    const words = sections.reduce((sum, s) => sum + s.body.split(/\s+/).filter(Boolean).length, 0);
    return {
      id: id!,
      number: Number(number),
      ...meta,
      title,
      sections,
      phases: [...phases].filter(([, ids]) => ids.includes(id!)).map(([phase]) => phase),
      words,
      minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
      path,
    };
  });
}

function parseMeta(intro: string, lang: Lang, path: string): { slug: string; description: string } {
  const labels = META[lang];
  const fields = new Map(
    intro.split(" · ").map((part) => {
      const at = part.indexOf(": ");
      return [part.slice(0, at), part.slice(at + 2).trim()] as const;
    }),
  );
  const slug = fields.get(labels.slug) ?? "";
  const description = fields.get(labels.description) ?? "";
  if (!SLUG.test(slug)) throw new Error(`${path}: «${labels.slug}: …» mancante o non valido`);
  if (!description) throw new Error(`${path}: «${labels.description}: …» mancante`);
  return { slug, description };
}

/** Il glossario nella lingua `lang`: «## Termine», la riga «Id: …», poi la definizione. */
export function loadGlossary(lang: Lang = "it", dir = LEARN_DIR): Term[] {
  const path = `learn/${lang}/${GLOSSARY_FILE[lang]}`;
  return parseRole(read(join(dir, lang, GLOSSARY_FILE[lang]))).sections.map(({ heading, body }) => {
    const [first = "", ...rest] = body.split("\n");
    const id = /^Id: ([a-z0-9-]+)$/.exec(first)?.[1];
    const definition = rest.join("\n").trim();
    if (!id || !definition) throw new Error(`${path}: «${heading}» senza «Id: …» o senza definizione`);
    return { id, term: heading, definition };
  });
}

/** I link Markdown `[testo](destinazione)` di un testo, nell'ordine. */
export function links(markdown: string): { text: string; target: string }[] {
  return [...markdown.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].map((m) => ({ text: m[1]!, target: m[2]! }));
}

/** Il genere di una destinazione di link in una lezione o nel glossario. */
export type LinkKind =
  | { kind: "term"; id: string }
  | { kind: "lesson"; id: string }
  | { kind: "repo"; path: string }
  | { kind: "site"; path: string }
  | { kind: "web"; url: string };

/** Classifica un link di learn/<lang>/: glossario, altra lezione, file del repository, pagina del sito o web. */
export function linkKind(target: string, lang: Lang): LinkKind {
  if (target.startsWith("https://")) return { kind: "web", url: target };
  if (target.startsWith("/")) return { kind: "site", path: target };
  if (target.startsWith(`${GLOSSARY_FILE[lang]}#`)) return { kind: "term", id: target.slice(GLOSSARY_FILE[lang].length + 1) };
  const lesson = LESSON_FILE.exec(target);
  if (lesson) return { kind: "lesson", id: lesson[2]! };
  if (target.startsWith("../../")) return { kind: "repo", path: target.slice("../../".length) };
  throw new Error(`link non riconosciuto: ${target}`);
}
