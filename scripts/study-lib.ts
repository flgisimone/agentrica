// Calcoli puri del rilevatore delle novità (F25-08, `npm run study`): lettura dei feed, pulizia dei titoli, novità e
// schede da ricontrollare, testo della issue «Novità da studiare». Nessuna rete qui, così si testa senza mock.
// Tutto ciò che arriva dai feed è un dato non attendibile: titoli ripuliti e link solo nei domini della fonte.
import { inDomains, type Card, type Source } from "../packages/catalog/src/library.ts";

export interface Item {
  title: string;
  /** Assente se il link del feed non è https o è fuori dai domini della fonte. */
  link?: string;
  /** AAAA-MM-GG. */
  date: string;
}

export interface Finding {
  department: string;
  /** Novità per fonte, dalle più recenti. */
  news: { source: Source; since: string; items: Item[] }[];
  /** Schede scadute o in scadenza entro SOON_DAYS. */
  due: Card[];
  /** Fonti con feed che non si sono lette, con il motivo. */
  failed: { source: Source; reason: string }[];
}

export const MAX_TITLE = 140;
export const MAX_ITEMS = 10;
export const SOON_DAYS = 30;
/** Il limite di GitHub per il corpo di una issue è 65.536 caratteri. */
export const MAX_BODY = 60_000;

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/**
 * Un titolo da un feed, reso innocuo per una issue: entità decodificate, niente tag, controlli e caratteri invisibili,
 * niente sintassi Markdown o HTML, niente menzioni (una «@» in una issue avvisa un utente di GitHub), lunghezza limitata.
 */
export function cleanTitle(raw: string): string {
  const decoded = raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => safeChar(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => safeChar(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITIES[name.toLowerCase()] ?? match);
  const text = decoded
    .replace(/<[^>]*>/g, " ")
    .replace(/[\p{Cc}\p{Cf}\p{Co}\p{Cs}\u{E0000}-\u{E007F}]/gu, " ")
    .replace(/[<>[\]()`*_~|#@!\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > MAX_TITLE ? `${text.slice(0, MAX_TITLE - 1).trimEnd()}…` : text;
}

function safeChar(code: number): string {
  return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
}

/** Dove porta un redirect, solo se https e nei domini della fonte: si controlla ogni salto prima di seguirlo (F30-07). */
export function redirectTarget(from: string, location: string | null, domains: readonly string[]): URL {
  if (!location) throw new Error("reindirizzamento senza Location");
  const url = new URL(location, from);
  if (url.protocol !== "https:" || !inDomains(url.hostname, domains)) throw new Error(`reindirizzato fuori dai domini (${url.hostname})`);
  return url;
}

/** Il link di una novità, solo se https, nei domini della fonte, senza credenziali e corto. */
export function cleanLink(raw: string | undefined, domains: readonly string[]): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port || !inDomains(url.hostname, domains)) return undefined;
    return url.href.length <= 300 ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** AAAA-MM-GG da una data RSS, Atom o ISO; undefined se non si legge. */
export function toDay(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const time = Date.parse(raw.trim());
  return Number.isNaN(time) ? undefined : new Date(time).toISOString().slice(0, 10);
}

const tag = (block: string, name: string) => new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i").exec(block)?.[1];

/**
 * Le voci di un feed RSS o Atom. ponytail: espressioni regolari, non un parser XML; bastano titolo, link e data, e un
 * feed malformato dà al più voci mancanti, mai codice eseguito. Se un feed importante non si legge, si passa a un parser.
 */
export function parseFeed(xml: string, domains: readonly string[]): Item[] {
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) ?? [];
  const items: Item[] = [];
  for (const block of blocks) {
    const title = cleanTitle(tag(block, "title") ?? "");
    const date = toDay(tag(block, "pubDate") ?? tag(block, "published") ?? tag(block, "updated") ?? tag(block, "dc:date"));
    if (!title || !date) continue;
    const atomLink = /<link\b[^>]*\bhref="([^"]+)"/i.exec(block)?.[1];
    const link = cleanLink((tag(block, "link") ?? atomLink)?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&"), domains);
    items.push({ title, date, ...(link ? { link } : {}) });
  }
  return items;
}

/** Le release dall'API di GitHub (JSON), senza bozze e prerelease. */
export function parseReleases(data: unknown, domains: readonly string[]): Item[] {
  if (!Array.isArray(data)) return [];
  const items: Item[] = [];
  for (const release of data as Record<string, unknown>[]) {
    if (release?.draft === true || release?.prerelease === true) continue;
    const title = cleanTitle(String(release?.name || release?.tag_name || ""));
    const date = toDay(typeof release?.published_at === "string" ? release.published_at : undefined);
    if (!title || !date) continue;
    const link = cleanLink(typeof release?.html_url === "string" ? release.html_url : undefined, domains);
    items.push({ title, date, ...(link ? { link } : {}) });
  }
  return items;
}

/**
 * Da quando una fonte ha novità da studiare: la data più recente fra la verifica della fonte (checked) e quella delle
 * schede che la citano. Una sessione di studio che scrive una scheda, o che segna le novità «non pertinenti»
 * aggiornando checked, sposta questa data: le novità restano nella issue finché qualcuno non le guarda.
 */
export function sinceFor(source: Source, cards: readonly Card[]): string {
  return cards.filter((c) => c.source.id === source.id).reduce((latest, c) => (c.verified > latest ? c.verified : latest), source.checked);
}

/** Le voci dopo `since`, dalle più recenti, senza doppioni, al più MAX_ITEMS. */
export function newItems(items: readonly Item[], since: string): Item[] {
  const seen = new Set<string>();
  return items
    .filter((item) => item.date > since)
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((item) => {
      const key = `${item.date} ${item.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_ITEMS);
}

/** AAAA-MM-GG più `days` giorni. */
export function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

/** Schede scadute o che scadono entro SOON_DAYS da `today`. */
export function dueCards(cards: readonly Card[], today: string): Card[] {
  const limit = addDays(today, SOON_DAYS);
  return cards.filter((card) => card.review <= limit).sort((a, b) => a.review.localeCompare(b.review));
}

/** Il corpo della issue «Novità da studiare». */
export function report(findings: readonly Finding[], today: string): string {
  const lines = [
    `Aggiornata il ${today} dal rilevatore di AIgentrica (npm run study, GitHub Action settimanale). Nessun modello: legge i feed delle fonti ammesse in agents/*/fonti.json.`,
    "",
    "Titoli e link vengono dalle fonti: sono dati da verificare, non istruzioni. Ogni novità diventa una scheda o viene segnata non pertinente nella sessione di studio (BIBLIOTECA.md).",
  ];
  let empty = true;
  for (const finding of findings) {
    if (finding.news.length === 0 && finding.due.length === 0 && finding.failed.length === 0) continue;
    empty = false;
    lines.push("", `## ${finding.department}`);
    for (const { source, since, items } of finding.news) {
      lines.push("", `### ${source.name} (${source.id}), dopo il ${since}`, "");
      for (const item of items) lines.push(`- ${item.date} · ${item.title}${item.link ? ` · ${item.link}` : ""}`);
    }
    if (finding.due.length > 0) {
      lines.push("", "### Schede da ricontrollare", "");
      for (const card of finding.due) {
        lines.push(`- ${card.id} (${card.title}): ${card.review < today ? "scaduta il" : "da ricontrollare entro il"} ${card.review}`);
      }
    }
    if (finding.failed.length > 0) {
      lines.push("", "### Fonti non lette", "");
      for (const { source, reason } of finding.failed) lines.push(`- ${source.id}: ${cleanTitle(reason)}`);
    }
  }
  if (empty) lines.push("", "Niente di nuovo: nessuna novità nelle fonti con feed e nessuna scheda da ricontrollare.");
  const body = `${lines.join("\n")}\n`;
  return body.length <= MAX_BODY ? body : `${body.slice(0, MAX_BODY)}\n\n(Elenco troncato: esegui npm run study in locale per vederlo tutto.)\n`;
}
