// Catalogo di Agentrica: reparti e agenti letti dai file di agents/.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { DEPARTMENTS, type DepartmentCode, type DepartmentInfo, type Model } from "./departments.ts";
import { parseCard, parseSources, type Card, type Source } from "./library.ts";
import { parseRole, type Section } from "./markdown.ts";

export { DEPARTMENTS, type DepartmentCode, type DepartmentInfo, type Model } from "./departments.ts";
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

export interface Department extends Omit<DepartmentInfo, "stars" | "models"> {
  /** Sigla in minuscolo, per l'indirizzo della pagina: es. «aisa». */
  slug: string;
  /** Introduzione del README. */
  mission: string;
  /** «## Flusso di lavoro» del README, in Markdown. */
  workflow: string;
  /** «## Collaborazione con le altre agenzie» del README, in Markdown. */
  collaboration: string;
  /** 00-common-rules.md: introduzione e sezioni. */
  rules: { intro: string; sections: Section[] };
  agents: Agent[];
  director: Agent;
  /** Schede della biblioteca (F25), in ordine di numero; vuota se il reparto non ha biblioteca/. */
  library: Card[];
}

const WORKFLOW = "Flusso di lavoro";
const COLLABORATION = "Collaborazione con le altre agenzie";

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

export function loadCatalog(agentsDir: string = findAgentsDir()): Department[] {
  return DEPARTMENTS.map((info) => loadDepartment(agentsDir, info));
}

function loadDepartment(agentsDir: string, info: DepartmentInfo): Department {
  const folder = join(agentsDir, info.folder);
  const files = readdirSync(folder)
    .map((file) => ROLE_FILE.exec(file))
    .filter((match): match is RegExpExecArray => match !== null && match[1] !== "00")
    .sort((a, b) => a[1]!.localeCompare(b[1]!));

  if (files.length !== info.stars.length) {
    throw new Error(`${info.code}: ${files.length} file di ruolo ma ${info.stars.length} nomi in codice`);
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
      source: `agents/${info.folder}/${match[0]}`,
      model: info.models?.[number] ?? "inherit",
    };
  });

  const readme = parseRole(readFileSync(join(folder, "README.md"), "utf8"));
  const readmeSection = (heading: string): string => {
    const body = readme.sections.find((s) => s.heading === heading)?.body;
    if (!body) throw new Error(`${info.code}: README.md senza «## ${heading}»`);
    return body;
  };
  const { intro, sections } = parseRole(readFileSync(join(folder, "00-common-rules.md"), "utf8"));

  const library = loadLibrary(folder, info, new Set(agents.map((a) => a.id)));

  const { stars: _stars, models: _models, ...rest } = info;
  return {
    ...rest,
    slug: info.code.toLowerCase(),
    mission: readme.intro,
    workflow: readmeSection(WORKFLOW),
    collaboration: readmeSection(COLLABORATION),
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

function loadLibrary(folder: string, info: DepartmentInfo, roles: ReadonlySet<string>): Card[] {
  const dir = join(folder, LIBRARY);
  if (!existsSync(dir)) return [];
  const sources = loadSources(dirname(folder), info);
  const files = readdirSync(dir).filter((file) => file.endsWith(".md")).sort();
  const cards = files.map((file) => parseCard(readFileSync(join(dir, file), "utf8"), file, `agents/${info.folder}/${LIBRARY}/${file}`, sources, roles));
  cards.forEach((card, index) => {
    if (card.number !== index + 1) throw new Error(`${info.code}: numerazione delle schede non continua a ${card.path}`);
  });
  const ids = new Set(cards.map((c) => c.id));
  if (ids.size !== cards.length) throw new Error(`${info.code}: due schede con lo stesso nome`);
  return cards;
}
