// Invio dei totali di token ad Agentrica (F27): come le valutazioni (ratings.ts), parte solo dopo la conferma
// dell'utente e manda esattamente le righe dell'anteprima. Ogni riga ha la sua chiave (usage.ts, shareRows): il sito
// sostituisce quella con la stessa chiave, quindi un secondo invio non conta due volte. Niente file, tutto in memoria.
import { randomBytes } from "node:crypto";
import type { ShareRow } from "./usage.ts";

export const SHARE_URL = "https://agentrica.vercel.app/api/usage";
export const SHARE_PRIVACY_URL = "https://agentrica.vercel.app/note-legali#consumo";
const CODE_TTL_MS = 10 * 60_000;
const SEND_TIMEOUT_MS = 5_000;

/** Quello che parte verso Agentrica, e nient'altro. */
export interface SharePayload {
  mcpVersion: string;
  rows: ShareRow[];
}

export type ShareResult = { ok: true; rows: number } | { ok: false; message: string };

export const SHARE_NOTICE =
  "Partono solo questi numeri: niente testi, nomi di file, percorsi, progetto né id di sessione; i subagent che non sono di Agentrica diventano «altro». " +
  `Sul sito si vedono solo somme di tutti gli invii. Informativa: ${SHARE_PRIVACY_URL}`;

export interface ShareOptions {
  version: string;
  url?: string;
  fetch?: typeof fetch;
  now?: () => number;
}

export function createShare({ version, url = SHARE_URL, fetch: doFetch = fetch, now = Date.now }: ShareOptions) {
  const drafts = new Map<string, { payload: SharePayload; expires: number }>();

  return {
    /** Primo passo: fissa le righe e restituisce il codice per inviarle. */
    draft(rows: ShareRow[]): { code: string; payload: SharePayload } {
      for (const [code, entry] of drafts) if (entry.expires <= now()) drafts.delete(code);
      const payload = { mcpVersion: version, rows };
      const code = randomBytes(4).toString("hex");
      drafts.set(code, { payload, expires: now() + CODE_TTL_MS });
      return { code, payload };
    },

    /** Secondo passo: invia le righe del codice, una volta sola. */
    async confirm(code: string): Promise<ShareResult> {
      const entry = drafts.get(code);
      drafts.delete(code);
      if (!entry || entry.expires <= now()) return { ok: false, message: "Codice scaduto o già usato: prepara di nuovo l'anteprima." };
      if (entry.payload.rows.length === 0) return { ok: false, message: "Nessuna riga da inviare." };
      let response: Response;
      try {
        response = await doFetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry.payload),
          signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        });
      } catch {
        return { ok: false, message: "Invio non riuscito: Agentrica non è raggiungibile (rete assente, timeout o rete non permessa). Riprova più tardi." };
      }
      if (response.ok) return { ok: true, rows: entry.payload.rows.length };
      if (response.status === 429) return { ok: false, message: "Limite di invii di oggi raggiunto da questa rete. Riprova domani." };
      if (response.status === 400) return { ok: false, message: "Totali respinti: dati non validi." };
      return { ok: false, message: `Invio non riuscito (errore ${response.status} del servizio). Riprova più tardi.` };
    },
  };
}

export type Share = ReturnType<typeof createShare>;

const n = (v: number) => v.toLocaleString("it-IT");

/** Una riga dell'anteprima, uguale nel terminale e nel pannello. */
export function rowText(r: ShareRow): string {
  return `${r.day} · ${r.agent} · ${r.model} · ${r.effort}: ingresso ${n(r.input)}, uscita ${n(r.output)}, letti dalla cache ${n(r.cacheRead)}, scritti in cache ${n(r.cacheWrite)}`;
}

/** Testo dell'anteprima: cosa parte, l'avviso e il codice. */
export function sharePreviewText(code: string, payload: SharePayload, omitted: number): string {
  if (payload.rows.length === 0) return "Nessun consumo di token negli ultimi 30 giorni per questo progetto: non c'è nulla da inviare.";
  return [
    `Anteprima dei totali di token da inviare ad Agentrica (${payload.rows.length} righe, ultimi 30 giorni, versione ${payload.mcpVersion}):`,
    ...payload.rows.map((r) => `- ${rowText(r)}`),
    ...(omitted > 0 ? [`(${omitted} righe più vecchie restano fuori: al più 300 per invio)`] : []),
    "",
    SHARE_NOTICE,
    "",
    `Mostra questa anteprima all'utente e chiedigli se inviarla. Solo dopo il suo sì richiama share_usage con code "${code}" (valido 10 minuti, una volta). Se dice no, non fare nulla.`,
  ].join("\n");
}
