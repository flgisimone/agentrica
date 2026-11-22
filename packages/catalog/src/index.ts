// Catalogo di Agentrica: reparti e agenti letti dai file di agents/.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { DEPARTMENTS, type DepartmentCode, type DepartmentInfo, type Lang, type Model } from "./departments.ts";
import { parseCard, parseSources, type Card, type Source } from "./library.ts";
import { parseRole, type Section } from "./markdown.ts";

export { DEPARTMENTS, LANGS, type DepartmentCode, type DepartmentInfo, type Lang, type Model } from "./departments.ts";
export { isExpired, type Card, type Source, type SourceLevel } from "./library.ts";
export type { Section } from "./markdown.ts";

export interface Agent {
  /** Es. «AISA-02». */
  id: string;
  /** Es. «ALTAIR». */
  star: string;
  /** Numero del file di ruolo: 1 è il direttore. */
  number: number;
  /** Nome del file senza numero ed estensione, es. «senior-software-architect». */
  slug: string;
  department: DepartmentCode;
  /** Titolo del ruolo, dal «# …» del file. */
  role: string;
  intro: string;
  sections: Section[];
  /** Percorso del file rispetto alla root del repository. */
  source: string;
  /** Modello consigliato (F24); «inherit» se il ruolo non è stato misurato. */
  model: Model;
}

export interface Department extends Omit<DepartmentInfo, "stars" | "models" | "summary"> {
  /** Cosa fa il reparto, in una riga, nella lingua del catalogo. */
  summary: string;
  /** Sigla in minuscolo, per l'indirizzo della pagina: es. «aisa». */
  slug: string;
  /** Introduzione del README. */
  mission: string;
  /** «## Flusso di lavoro» («## Workflow» in inglese) del README, in Markdown. */
  workflow: string;
  /** «## Collaborazione con le altre agenzie» («## Collaboration with the other agencies») del README, in Markdown. */
  collaboration: string;
  /** 00-common-rules.md: introduzione e sezioni. */
  rules: { intro: string; sections: Section[] };
  agents: Agent[];
  director: Agent;
  /** Schede della biblioteca (F25), in ordine di numero; vuota se il reparto non ha biblioteca/. */
  library: Card[];
}

// Sezioni del README che il catalogo legge, per lingua.
const README_SECTIONS: Record<Lang, { workflow: string; collaboration: string }> = {
  it: { workflow: "Flusso di lavoro", collaboration: "Collaborazione con le altre agenzie" },
  en: { workflow: "Workflow", collaboration: "Collaboration with the other agencies" },
};
/** Sottocartella dei file inglesi in ogni agenzia, con gli stessi nomi di quelli italiani. */
const EN_FOLDER = "en";

const ROLE_FILE = /^(\d{2})-([a-z0-9-]+)\.md$/;

/**
 * Cerca la cartella agents/ risalendo da `from`.
 * Serve dentro il repository (sito, test, sviluppo). Il server MCP non la usa: passa a loadCatalog una cartella
 * fissa, perché la cartella corrente è il progetto dell'utente (packages/mcp/src/server.ts).
 */
export function findAgentsDir(from: string = process.cwd()): string {
  // turbopackIgnore: il sito legge il catalogo solo al build (pagine pre-generate), quindi Next non deve tracciare
  // l'intero repository nel pacchetto server. Un MCP remoto in Next dovrà includere agents/ esplicitamente.
  let dir = resolve(/*turbopackIgnore: true*/ from);
  for (;;) {
    const candidate = join(dir, "agents");
    if (existsSync(join(candidate, DEPARTMENTS[0]!.folder))) return candidate;
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`cartella agents/ non trovata risalendo da ${from}`);
    dir = parent;
  }
}

/**
 * Reparti e agenti nella lingua `lang`. In inglese legge anche l'italiano e si ferma se un file non ha il gemello o se i
 * due gemelli non hanno la stessa struttura (twinProblems).
 */
export function loadCatalog(agentsDir: string = findAgentsDir(), lang: Lang = "it"): Department[] {
  const catalog = DEPARTMENTS.map((info) => loadDepartment(agentsDir, info, lang));
  if (lang === "en") {
    const problems = twinProblems(DEPARTMENTS.map((info) => loadDepartment(agentsDir, info, "it")), catalog);
    if (problems.length > 0) throw new Error(`file inglesi diversi dagli italiani: ${problems.join("; ")}`);
  }
  return catalog;
}

/** Le differenze di struttura fra il catalogo italiano e quello inglese; vuoto se ogni file ha il gemello giusto. */
export function twinProblems(it: readonly Department[], en: readonly Department[]): string[] {
  const problems: string[] = [];
  const differ = (where: string, what: string, a: unknown, b: unknown) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) problems.push(`${where}: ${what} diversi (${JSON.stringify(a)} / ${JSON.stringify(b)})`);
  };
  it.forEach((dIt, index) => {
    const dEn = en[index]!;
    differ(dIt.code, "regole comuni: numero di sezioni", dIt.rules.sections.length, dEn.rules.sections.length);
    dIt.agents.forEach((aIt, i) => {
      const aEn = dEn.agents[i]!;
      differ(aEn.source, "nome del file", aIt.slug, aEn.slug);
      differ(aEn.source, "numero di sezioni", aIt.sections.length, aEn.sections.length);
    });
    // La versione no: è un testo, a volte con parole («Decreto legislativo …») che si traducono.
    const shape = (cards: readonly Card[]) => cards.map((c) => [c.id, c.source.id, c.verified, c.review, c.roles]);
    differ(dIt.code, "schede della biblioteca (id, fonte, date, ruoli)", shape(dIt.library), shape(dEn.library));
  });
  return problems;
}

function loadDepartment(agentsDir: string, info: DepartmentInfo, lang: Lang): Department {
  const base = lang === "en" ? `${info.folder}/${EN_FOLDER}` : info.folder;
  const folder = join(agentsDir, base);
  if (!existsSync(folder)) throw new Error(`${info.code}: cartella agents/${base}/ mancante`);
  const files = readdirSync(folder)
    .map((file) => ROLE_FILE.exec(file))
    .filter((match): match is RegExpExecArray => match !== null && match[1] !== "00")
    .sort((a, b) => a[1]!.localeCompare(b[1]!));

  if (files.length !== info.stars.length) {
    throw new Error(`${info.code}: ${files.length} file di ruolo in agents/${base}/ ma ${info.stars.length} nomi in codice`);
  }

  const agents = files.map((match, index): Agent => {
    const number = Number(match[1]);
    if (number !== index + 1) throw new Error(`${info.code}: numerazione dei file non continua a ${match[0]}`);
    const { title, intro, sections } = parseRole(readFileSync(join(folder, match[0]), "utf8"));
    return {
      id: `${info.code}-${match[1]}`,
      star: info.stars[index]!,
      number,
      slug: match[2]!,
      department: info.code,
      role: title,
      intro,
      sections,
      source: `agents/${base}/${match[0]}`,
      model: info.models?.[number] ?? "inherit",
    };
  });

  const read = (file: string): string => {
    const path = join(folder, file);
    if (!existsSync(path)) throw new Error(`${info.code}: agents/${base}/${file} mancante`);
    return readFileSync(path, "utf8");
  };
  const readme = parseRole(read("README.md"));
  const readmeSection = (heading: string): string => {
    const body = readme.sections.find((s) => s.heading === heading)?.body;
    if (!body) throw new Error(`${info.code}: README.md senza «## ${heading}»`);
    return body;
  };
  const { intro, sections } = parseRole(read("00-common-rules.md"));

  const library = loadLibrary(agentsDir, base, info, new Set(agents.map((a) => a.id)), lang);

  const { stars: _stars, models: _models, summary, ...rest } = info;
  return {
    ...rest,
    summary: summary[lang],
    slug: info.code.toLowerCase(),
    mission: readme.intro,
    workflow: readmeSection(README_SECTIONS[lang].workflow),
    collaboration: readmeSection(README_SECTIONS[lang].collaboration),
    rules: { intro, sections },
    agents,
    director: agents[0]!,
    library,
  };
}

const LIBRARY = "biblioteca";
const SOURCES = "fonti.json";

/** Le fonti ammesse di un reparto, da fonti.json; vuoto se il file non c'è. Contengono URL: mai al modello. */
export function loadSources(agentsDir: string, info: DepartmentInfo): Source[] {
  const path = join(agentsDir, info.folder, SOURCES);
  if (!existsSync(path)) return [];
  return parseSources(readFileSync(path, "utf8"), `agents/${info.folder}/${SOURCES}`);
}

function loadLibrary(agentsDir: string, base: string, info: DepartmentInfo, roles: ReadonlySet<string>, lang: Lang): Card[] {
  const dir = join(agentsDir, base, LIBRARY);
  if (!existsSync(dir)) return [];
  // fonti.json è uno solo per reparto, nella cartella italiana: le fonti non cambiano con la lingua.
  const sources = loadSources(agentsDir, info);
  const files = readdirSync(dir).filter((file) => file.endsWith(".md")).sort();
  const cards = files.map((file) => parseCard(readFileSync(join(dir, file), "utf8"), file, `agents/${base}/${LIBRARY}/${file}`, sources, roles, lang));
  cards.forEach((card, index) => {
    if (card.number !== index + 1) throw new Error(`${info.code}: numerazione delle schede non continua a ${card.path}`);
  });
  const ids = new Set(cards.map((c) => c.id));
  if (ids.size !== cards.length) throw new Error(`${info.code}: due schede con lo stesso nome`);
  return cards;
}
