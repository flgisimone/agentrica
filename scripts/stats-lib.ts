// Calcoli puri di `npm run stats`: nessuna rete qui, così si testano senza mock.

export type DailyDownloads = { day: string; downloads: number };
export type WeeklyDownloads = { weekStart: string; downloads: number };

const DAY_MS = 86_400_000;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Periodo di `months` mesi che finisce ieri (UTC): npm pubblica i conteggi del giorno dopo. */
export function lastMonthsRange(today: Date, months: number): { start: string; end: string } {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - DAY_MS);
  const start = new Date(end);
  start.setUTCMonth(start.getUTCMonth() - months);
  start.setUTCDate(start.getUTCDate() + 1);
  return { start: isoDate(start), end: isoDate(end) };
}

/** Lunedì (UTC) della settimana di `day` (AAAA-MM-GG). */
export function weekStartOf(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return isoDate(new Date(date.getTime() - daysSinceMonday * DAY_MS));
}

/** Somma i giorni per settimana (da lunedì), in ordine cronologico. Prima e ultima settimana possono essere parziali. */
export function toWeekly(days: readonly DailyDownloads[]): WeeklyDownloads[] {
  const totals = new Map<string, number>();
  for (const { day, downloads } of days) {
    const week = weekStartOf(day);
    totals.set(week, (totals.get(week) ?? 0) + downloads);
  }
  return [...totals]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, downloads]) => ({ weekStart, downloads }));
}

/** Righe di testo con una barra proporzionale al massimo della serie. */
export function formatWeekly(weeks: readonly WeeklyDownloads[], barWidth = 30): string[] {
  const max = Math.max(0, ...weeks.map((w) => w.downloads));
  const digits = String(max).length;
  return weeks.map(({ weekStart, downloads }) => {
    const bar = max === 0 ? "" : "█".repeat(Math.round((downloads / max) * barWidth));
    return `${weekStart}  ${String(downloads).padStart(digits)}  ${bar}`;
  });
}
