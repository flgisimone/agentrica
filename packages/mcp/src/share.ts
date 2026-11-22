// Invio dei totali di token ad Agentrica (F27): come le valutazioni (ratings.ts), parte solo dopo la conferma
// dell'utente e manda esattamente le righe dell'anteprima. Ogni riga ha la sua chiave (usage.ts, shareRows): il sito
// sostituisce quella con la stessa chiave, quindi un secondo invio non conta due volte. Niente file, tutto in memoria.
import { randomBytes } from "node:crypto";
import { T } from "./texts/index.ts";
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

export const shareNotice = () => T.share.notice(SHARE_PRIVACY_URL);

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
      if (!entry || entry.expires <= now()) return { ok: false, message: T.share.expired };
      if (entry.payload.rows.length === 0) return { ok: false, message: T.share.noRows };
      let response: Response;
      try {
        response = await doFetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry.payload),
          signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        });
      } catch {
        return { ok: false, message: T.share.unreachable };
      }
      if (response.ok) return { ok: true, rows: entry.payload.rows.length };
      if (response.status === 429) return { ok: false, message: T.share.tooMany };
      if (response.status === 400) return { ok: false, message: T.share.rejected };
      return { ok: false, message: T.share.serviceError(response.status) };
    },
  };
}

export type Share = ReturnType<typeof createShare>;

const n = (v: number) => v.toLocaleString(T.locale);

/** Una riga dell'anteprima, uguale nel terminale e nel pannello. */
export function rowText(r: ShareRow): string {
  return T.share.row({ ...r, input: n(r.input), output: n(r.output), cacheRead: n(r.cacheRead), cacheWrite: n(r.cacheWrite) });
}

/** Testo dell'anteprima: cosa parte, l'avviso e il codice. */
export function sharePreviewText(code: string, payload: SharePayload, omitted: number): string {
  if (payload.rows.length === 0) return T.share.nothing;
  return [
    T.share.previewHead(payload.rows.length, payload.mcpVersion),
    ...payload.rows.map((r) => `- ${rowText(r)}`),
    ...(omitted > 0 ? [T.share.omitted(omitted)] : []),
    "",
    shareNotice(),
    "",
    T.share.confirm(code),
  ].join("\n");
}
