// `npm run study`: il rilevatore delle novità della biblioteca (F25-08). Legge i feed RSS o Atom e le release di
// GitHub delle fonti ammesse (agents/*/fonti.json), confronta con le date delle schede e stampa in Markdown il testo
// della issue «Novità da studiare»: novità, schede scadute o in scadenza, fonti non lette. Nessun modello, nessuna
// chiave: solo richieste GET a indirizzi di fonti.json, con timeout e limite di dimensione; il contenuto scaricato
// non viene mai eseguito. La GitHub Action settimanale (.github/workflows/study.yml) pubblica questo testo nella issue.
// Uso: npm run study [-- --today AAAA-MM-GG]
import { parseArgs } from "node:util";
import { DEPARTMENTS, findAgentsDir, loadCatalog, loadSources } from "../packages/catalog/src/index.ts";
import { isDate, type Source } from "../packages/catalog/src/library.ts";
import { dueCards, newItems, parseFeed, parseReleases, redirectTarget, report, sinceFor, type Finding, type Item } from "./study-lib.ts";

const TIMEOUT_MS = 15_000;
// Alcuni feed portano il testo intero degli articoli (noyb, 2,5 MB a novembre 2026).
const MAX_BYTES = 5_000_000;

const MAX_REDIRECTS = 5;

/** Scarica un feed: solo https, risposta 200 entro il timeout e il limite; ogni redirect resta nei domini della fonte. */
async function download(source: Source): Promise<string> {
  let url = source.feed!;
  let response: Response;
  for (let hops = 0; ; hops++) {
    response = await fetch(url, {
      headers: { "user-agent": "agentrica-study", accept: "application/rss+xml, application/atom+xml, application/xml, application/json;q=0.9, */*;q=0.5" },
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.status < 300 || response.status >= 400) break;
    if (hops === MAX_REDIRECTS) throw new Error("troppi reindirizzamenti");
    await response.body?.cancel();
    url = redirectTarget(url, response.headers.get("location"), source.domains).href;
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (Number(response.headers.get("content-length") ?? 0) > MAX_BYTES) throw new Error("risposta oltre il limite");
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      throw new Error("risposta oltre il limite");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readSource(source: Source): Promise<Item[]> {
  const body = await download(source);
  return source.update === "github" ? parseReleases(JSON.parse(body), source.domains) : parseFeed(body, source.domains);
}

const { values } = parseArgs({ options: { today: { type: "string" } } });
const today = values.today ?? new Date().toISOString().slice(0, 10);
if (!isDate(today)) {
  console.error("Uso: npm run study [-- --today AAAA-MM-GG]");
  process.exit(1);
}

const dir = findAgentsDir();
const catalog = loadCatalog(dir);
const findings: Finding[] = [];
for (const info of DEPARTMENTS) {
  const department = catalog.find((d) => d.code === info.code)!;
  const sources = loadSources(dir, info).filter((s) => s.update !== "page");
  const finding: Finding = { department: `${info.code} — ${info.name}`, news: [], due: dueCards(department.library, today), failed: [] };
  // Una fonte alla volta: poche richieste in tutto, nessun carico sulle fonti.
  findings.push(finding);
  for (const source of sources) {
    try {
      const since = sinceFor(source, department.library);
      const items = newItems(await readSource(source), since);
      if (items.length > 0) finding.news.push({ source, since, items });
    } catch (error) {
      finding.failed.push({ source, reason: error instanceof Error ? error.message : String(error) });
    }
  }
}
process.stdout.write(report(findings, today));
