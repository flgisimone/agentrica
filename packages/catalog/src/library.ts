// Biblioteca di un reparto (F25): schede in agents/<agenzia>/biblioteca/NN-nome.md e fonti ammesse in
// agents/<agenzia>/fonti.json. Le schede vanno al modello e seguono SEC-ARCH-01 (content.ts) come i file di ruolo;
// fonti.json porta gli URL e non va mai al modello: servono al controllo delle fonti e al rilevatore delle novità.
// Formato e ciclo di studio: docs/Biblioteca degli agenti.md.
import { contentProblems } from "./content.ts";
import { parseRole } from "./markdown.ts";

/** 1 fonti primarie, 2 documentazione ufficiale, 3 solo segnale, «citata» a pagamento: solo titolo e versione. */
export type SourceLevel = 1 | 2 | 3 | "citata";

export interface Source {
  /** Es. «owasp-top10»: lo cita la riga «Fonte:» di una scheda. */
  id: string;
  /** Nome della fonte, che va al modello. */
  name: string;
  level: SourceLevel;
  /** Pagina della fonte; facoltativa solo per le fonti citate. */
  url?: string;
  /** Domini ammessi per url e feed (anche i sottodomini). */
  domains: string[];
  /** Come si scoprono le novità: feed RSS o Atom, release di GitHub (API JSON), o solo la scadenza delle schede. */
  update: "rss" | "github" | "page";
  /** Indirizzo del feed o dell'API, per «rss» e «github». */
  feed?: string;
  access: "libero" | "pagamento";
  /** Ultima verifica della fonte (AAAA-MM-GG): il rilevatore segnala solo le novità successive. */
  checked: string;
}

export interface Card {
  /** Il nome del file senza numero, es. «owasp-top-10-2025»: è l'id per il tool library. */
  id: string;
  number: number;
  title: string;
  /** La fonte, senza URL. */
  source: { id: string; name: string; level: 1 | 2 };
  version: string;
  /** AAAA-MM-GG. */
  verified: string;
  /** AAAA-MM-GG: dopo questa data la scheda va ricontrollata sulla fonte. */
  review: string;
  /** Id degli agenti del reparto interessati, es. «AICA-04». */
  roles: string[];
  notion: string;
  application: string;
  /** Percorso del file rispetto alla root del repository. */
  path: string;
}

export const CARD_FILE = /^(\d{2})-([a-z0-9-]+)\.md$/;
const ID = /^[a-z0-9][a-z0-9-]{0,59}$/;
const HOST = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
// Nomi di parametri che portano credenziali: un URL di fonte non ne ha mai bisogno.
const SECRET_PARAM = /token|key|secret|pass|auth|sig|session|code/i;
const FIELDS = ["Fonte", "Versione", "Verificata il", "Da ricontrollare entro", "Ruoli"] as const;
const NOTION = "Nozione";
const APPLICATION = "Come si applica";

/** Una data AAAA-MM-GG esistente. */
export function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

/** Il dominio dell'URL è uno di `domains` o un loro sottodominio. */
export function inDomains(hostname: string, domains: readonly string[]): boolean {
  return domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

/** I problemi di un URL di fonte: solo https, nei domini ammessi, senza credenziali, porta o parametri segreti. */
export function urlProblems(value: unknown, domains: readonly string[]): string[] {
  if (typeof value !== "string") return ["non è una stringa"];
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return ["URL non valido"];
  }
  const problems: string[] = [];
  if (url.protocol !== "https:") problems.push("non è https");
  if (url.username || url.password) problems.push("contiene credenziali");
  if (url.port) problems.push("porta esplicita");
  if (!inDomains(url.hostname, domains)) problems.push(`dominio ${url.hostname} fuori da quelli ammessi`);
  for (const key of url.searchParams.keys()) if (SECRET_PARAM.test(key)) problems.push(`parametro «${key}» non ammesso`);
  return problems;
}

/** I problemi di un fonti.json già letto come JSON; vuoto se è valido. */
export function sourceProblems(data: unknown): string[] {
  if (!Array.isArray(data)) return ["fonti.json deve essere un elenco"];
  const problems: string[] = [];
  const ids = new Set<string>();
  data.forEach((entry: Record<string, unknown> | null, index) => {
    const at = `fonte ${typeof entry?.id === "string" ? entry.id : index + 1}`;
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return void problems.push(`${at}: non è un oggetto`);
    const known = new Set(["id", "name", "level", "url", "domains", "update", "feed", "access", "checked"]);
    for (const key of Object.keys(entry)) if (!known.has(key)) problems.push(`${at}: campo sconosciuto «${key}»`);
    if (typeof entry.id !== "string" || !ID.test(entry.id)) problems.push(`${at}: id non valido`);
    else if (ids.has(entry.id)) problems.push(`${at}: id ripetuto`);
    else ids.add(entry.id);
    // Il nome va al modello: stesse regole delle schede, su una riga e corto.
    if (typeof entry.name !== "string" || entry.name.trim() === "" || entry.name.length > 120 || entry.name.includes("\n")) {
      problems.push(`${at}: nome mancante o troppo lungo`);
    } else {
      for (const p of contentProblems(entry.name)) problems.push(`${at}: nome con ${p.replace(/^riga \d+: /, "")}`);
    }
    if (![1, 2, 3, "citata"].includes(entry.level as SourceLevel)) problems.push(`${at}: livello non valido`);
    if (entry.access !== "libero" && entry.access !== "pagamento") problems.push(`${at}: accesso non valido`);
    if (entry.access === "pagamento" && entry.level !== "citata") problems.push(`${at}: una fonte a pagamento è solo citata`);
    if (!isDate(entry.checked)) problems.push(`${at}: data «checked» non valida`);
    const domains = entry.domains;
    if (!Array.isArray(domains) || domains.length === 0 || !domains.every((d) => typeof d === "string" && HOST.test(d))) {
      problems.push(`${at}: domini non validi`);
      return;
    }
    if (entry.url === undefined) {
      if (entry.level !== "citata") problems.push(`${at}: url mancante`);
    } else {
      for (const p of urlProblems(entry.url, domains)) problems.push(`${at}: url ${p}`);
    }
    if (entry.update === "rss" || entry.update === "github") {
      if (entry.feed === undefined) problems.push(`${at}: feed mancante per «${entry.update}»`);
      else for (const p of urlProblems(entry.feed, domains)) problems.push(`${at}: feed ${p}`);
      if (entry.update === "github" && typeof entry.feed === "string" && !/^https:\/\/api\.github\.com\/repos\/[\w.-]+\/[\w.-]+\/releases$/.test(entry.feed)) {
        problems.push(`${at}: feed github nella forma api.github.com/repos/<owner>/<repo>/releases`);
      }
    } else if (entry.update === "page") {
      if (entry.feed !== undefined) problems.push(`${at}: feed senza «rss» o «github»`);
    } else {
      problems.push(`${at}: update non valido`);
    }
  });
  return problems;
}

/** Legge fonti.json; un errore elenca tutti i problemi. */
export function parseSources(text: string, where: string): Source[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`${where}: JSON non valido (${error instanceof Error ? error.message : error})`);
  }
  const problems = sourceProblems(data);
  if (problems.length > 0) throw new Error(`${where}: ${problems.join("; ")}`);
  return data as Source[];
}

/**
 * Legge una scheda: titolo, riga dei metadati (Fonte · Versione · Verificata il · Da ricontrollare entro · Ruoli),
 * «## Nozione» e «## Come si applica». `roles` sono gli id del reparto; la fonte deve essere di livello 1 o 2.
 */
export function parseCard(text: string, file: string, path: string, sources: readonly Source[], roles: ReadonlySet<string>): Card {
  const match = CARD_FILE.exec(file);
  if (!match) throw new Error(`${path}: nome del file nella forma NN-nome.md`);
  const fail = (message: string): never => {
    throw new Error(`${path}: ${message}`);
  };
  const problems = contentProblems(text);
  if (problems.length > 0) fail(problems.join("; "));
  const { title, intro, sections } = parseRole(text);
  const fields = new Map<string, string>();
  for (const part of intro.split(" · ")) {
    const colon = part.indexOf(": ");
    if (colon === -1) fail(`riga dei metadati: «${part}» senza «: »`);
    fields.set(part.slice(0, colon).trim(), part.slice(colon + 2).trim());
  }
  if (fields.size !== FIELDS.length || FIELDS.some((f) => !fields.get(f))) fail(`riga dei metadati con ${FIELDS.join(" · ")}`);
  const source = sources.find((s) => s.id === fields.get("Fonte"));
  if (!source) fail(`fonte «${fields.get("Fonte")}» non in fonti.json`);
  if (source!.level !== 1 && source!.level !== 2) fail(`fonte «${source!.id}» di livello ${source!.level}: serve una fonte di livello 1 o 2`);
  const verified = fields.get("Verificata il")!;
  const review = fields.get("Da ricontrollare entro")!;
  if (!isDate(verified) || !isDate(review)) fail("date nella forma AAAA-MM-GG");
  if (review <= verified) fail("«Da ricontrollare entro» deve venire dopo «Verificata il»");
  const cardRoles = fields.get("Ruoli")!.split(",").map((r) => r.trim());
  const unknown = cardRoles.filter((r) => !roles.has(r));
  if (unknown.length > 0) fail(`ruoli non del reparto: ${unknown.join(", ")}`);
  if (sections.length !== 2 || sections[0]!.heading !== NOTION || sections[1]!.heading !== APPLICATION) {
    fail(`sezioni «## ${NOTION}» e «## ${APPLICATION}», in quest'ordine`);
  }
  if (!sections[0]!.body || !sections[1]!.body) fail("sezioni vuote");
  return {
    id: match[2]!,
    number: Number(match[1]),
    title,
    source: { id: source!.id, name: source!.name, level: source!.level as 1 | 2 },
    version: fields.get("Versione")!,
    verified,
    review,
    roles: cardRoles,
    notion: sections[0]!.body,
    application: sections[1]!.body,
    path,
  };
}

/** La scheda è oltre la data «da ricontrollare entro» (`today` AAAA-MM-GG). */
export function isExpired(card: Pick<Card, "review">, today: string): boolean {
  return card.review < today;
}
