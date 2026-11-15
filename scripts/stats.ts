// `npm run stats`: download npm di @agentrica/mcp e stelle del repository, da API pubbliche senza chiavi.
// ponytail: i download npm contano anche CI, mirror e bot e `npx -y` riscarica a ogni versione nuova:
// sono una tendenza, non persone. Un numero più preciso richiede un MCP remoto (F15).
import { formatWeekly, lastMonthsRange, toWeekly, type DailyDownloads } from "./stats-lib.ts";

const PACKAGE = "@agentrica/mcp";
const REPOSITORY = "flgisimone/agentrica";
const MONTHS = 3;

async function getJson(url: string): Promise<{ status: number; body: unknown }> {
  const response = await fetch(url, { headers: { "user-agent": "agentrica-stats" } });
  return { status: response.status, body: await response.json() };
}

function isDailyList(value: unknown): value is DailyDownloads[] {
  return (
    Array.isArray(value) &&
    value.every((d) => typeof d?.day === "string" && typeof d?.downloads === "number")
  );
}

async function printDownloads(): Promise<void> {
  const { start, end } = lastMonthsRange(new Date(), MONTHS);
  const { status, body } = await getJson(`https://api.npmjs.org/downloads/range/${start}:${end}/${PACKAGE}`);
  const downloads = (body as { downloads?: unknown } | null)?.downloads;

  console.log(`Download npm di ${PACKAGE}, ${start} → ${end}`);
  if (status === 404) {
    // npm non ha ancora dati per un pacchetto pubblicato da meno di un giorno o due.
    console.log("  Nessun dato da npm per ora (il pacchetto è recente).");
    return;
  }
  if (status !== 200 || !isDailyList(downloads)) {
    throw new Error(`Risposta inattesa da npm (HTTP ${status}).`);
  }

  const weeks = toWeekly(downloads);
  const total = weeks.reduce((sum, w) => sum + w.downloads, 0);
  console.log(`  Totale: ${total}`);
  console.log("  Settimana (dal lunedì):");
  for (const line of formatWeekly(weeks)) console.log(`  ${line}`);
}

async function printRepository(): Promise<void> {
  const { status, body } = await getJson(`https://api.github.com/repos/${REPOSITORY}`);
  const repo = body as { stargazers_count?: unknown; forks_count?: unknown } | null;
  if (status !== 200 || typeof repo?.stargazers_count !== "number" || typeof repo.forks_count !== "number") {
    // Senza token GitHub concede 60 richieste l'ora: un limite superato non deve far fallire i download.
    console.log(`GitHub non disponibile (HTTP ${status}).`);
    return;
  }
  console.log(`GitHub ${REPOSITORY}: ${repo.stargazers_count} stelle, ${repo.forks_count} fork`);
}

await printDownloads();
console.log();
await printRepository();
