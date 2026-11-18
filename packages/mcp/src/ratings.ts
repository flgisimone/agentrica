// Valutazioni degli agenti (F20): anteprima con codice monouso, invio all'endpoint del sito, promemoria. Da F23 anche il
// modulo dell'elicitation MCP: inviare il modulo vale come conferma, e parte solo ciò che c'è nel modulo.
// È l'unico punto del server che apre una connessione, e solo dopo la conferma dell'utente: l'invio parte con il codice
// dell'anteprima e manda esattamente il contenuto mostrato. Niente compito, file o percorsi: solo i campi di Rating.
// Tutto resta in memoria (nessun file); i tempi e fetch si passano dall'esterno per i test.
import { randomBytes, randomUUID } from "node:crypto";

export const RATINGS_URL = "https://agentrica.vercel.app/api/ratings";
export const PRIVACY_URL = "https://agentrica.vercel.app/note-legali#valutazioni";
export const MAX_COMMENT = 1000;
const CODE_TTL_MS = 10 * 60_000;
const SEND_TIMEOUT_MS = 5_000;
export const REMINDER_AFTER_MS = 30 * 60_000;

/** Quello che parte verso Agentrica, e nient'altro. */
export interface Rating {
  usageId: string;
  agentId: string;
  rating: number;
  comment: string;
  publish: boolean;
  mcpVersion: string;
}

export interface RatingInput {
  agentId: string;
  rating: number;
  comment?: string | undefined;
  publish?: boolean | undefined;
}

export type SendResult = { ok: true; usageId: string } | { ok: false; message: string };

export interface RatingsOptions {
  version: string;
  url?: string;
  fetch?: typeof fetch;
  now?: () => number;
}

export const NOTICE =
  "Parte solo ciò che vedi qui: niente compito, codice o file del progetto. " +
  `Non scrivere nel commento nomi, dati personali o parti del progetto. Informativa: ${PRIVACY_URL}`;

export function createRatings({ version, url = RATINGS_URL, fetch: doFetch = fetch, now = Date.now }: RatingsOptions) {
  // Un id casuale per agente e sessione: non collega sessioni né agenti diversi, ferma solo i doppi invii.
  const usage = new Map<string, string>();
  const loadedAt = new Map<string, number>();
  const rated = new Set<string>();
  const reminded = new Set<string>();
  // Agenti per cui il server ha già mostrato il modulo (F23): una volta per agente, un rifiuto basta.
  const asked = new Set<string>();
  const drafts = new Map<string, { rating: Rating; expires: number }>();

  const build = (input: RatingInput): Rating => ({
    usageId: usageId(input.agentId),
    agentId: input.agentId,
    rating: input.rating,
    comment: (input.comment ?? "").trim(),
    publish: input.publish ?? false,
    mcpVersion: version,
  });

  const usageId = (agentId: string) => {
    let id = usage.get(agentId);
    if (!id) usage.set(agentId, (id = randomUUID()));
    return id;
  };

  return {
    /** L'agente è stato caricato: da qui parte il conto del promemoria. */
    loaded(agentId: string) {
      if (!loadedAt.has(agentId)) loadedAt.set(agentId, now());
      usageId(agentId);
    },

    isRated: (agentId: string) => rated.has(agentId),

    /** Il modulo si può mostrare per questo agente? Se sì, da qui in poi conta come mostrato. */
    claimAsk(agentId: string): boolean {
      if (!loadedAt.has(agentId) || rated.has(agentId) || asked.has(agentId)) return false;
      asked.add(agentId);
      return true;
    },

    /** Il client non ha mostrato il modulo: torna possibile il promemoria (e un altro modulo). */
    unclaimAsk: (agentId: string) => void asked.delete(agentId),

    /** La valutazione senza codice: per il pannello, dove l'invio dalla pagina è già la conferma. */
    build,

    /** Primo passo: prepara il contenuto e restituisce il codice da usare per inviarlo. */
    draft(input: RatingInput): { code: string; rating: Rating } {
      for (const [code, entry] of drafts) if (entry.expires <= now()) drafts.delete(code);
      const rating = build(input);
      const code = randomBytes(4).toString("hex");
      drafts.set(code, { rating, expires: now() + CODE_TTL_MS });
      return { code, rating };
    },

    /** Secondo passo: invia il contenuto del codice, una volta sola. */
    async confirm(code: string, agentId: string): Promise<SendResult> {
      const entry = drafts.get(code);
      if (entry && entry.rating.agentId !== agentId) return { ok: false, message: "Codice non valido per questo agente: prepara di nuovo l'anteprima." };
      drafts.delete(code);
      if (!entry || entry.expires <= now()) return { ok: false, message: "Codice scaduto o già usato: prepara di nuovo l'anteprima." };
      return this.send(entry.rating);
    },

    /** Invio di un contenuto già confermato dall'utente (dal secondo passo o dal pannello). */
    async send(rating: Rating): Promise<SendResult> {
      if (rated.has(rating.agentId)) return { ok: false, message: `${rating.agentId} è già stato valutato in questa sessione.` };
      let response: Response;
      try {
        response = await doFetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rating),
          signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        });
      } catch {
        // Offline, endpoint giù, timeout o rete negata dal permission model di Node (--permission senza --allow-net).
        return { ok: false, message: "Invio non riuscito: Agentrica non è raggiungibile (rete assente, timeout o rete non permessa). Riprova più tardi." };
      }
      if (response.ok || response.status === 409) {
        // 409: lo stesso usageId è già registrato, quindi il voto c'è.
        rated.add(rating.agentId);
        return { ok: true, usageId: rating.usageId };
      }
      if (response.status === 429) return { ok: false, message: "Hai già valutato questo agente oggi da questa rete." };
      if (response.status === 400) return { ok: false, message: "Valutazione respinta: dati non validi." };
      return { ok: false, message: `Invio non riuscito (errore ${response.status} del servizio). Riprova più tardi.` };
    },

    /** Agenti caricati da almeno 30 minuti, non valutati e non ancora ricordati: si ricordano una volta sola. */
    due(): string[] {
      const ids = [...loadedAt].filter(([id, at]) => now() - at >= REMINDER_AFTER_MS && !rated.has(id) && !reminded.has(id) && !asked.has(id)).map(([id]) => id);
      for (const id of ids) reminded.add(id);
      return ids;
    },
  };
}

export type Ratings = ReturnType<typeof createRatings>;

/** Testo dell'anteprima: cosa parte, l'avviso e il codice. */
export function previewText(name: string, code: string, rating: Rating): string {
  return [
    `Anteprima della valutazione di ${name}:`,
    `- voto: ${rating.rating}/5`,
    `- commento: ${rating.comment || "(nessuno)"}`,
    `- pubblicazione del commento sul sito: ${rating.publish ? "sì" : "no"}`,
    `- versione: ${rating.mcpVersion}`,
    "",
    NOTICE,
    "",
    `Mostra questa anteprima all'utente e chiedigli se inviarla. Solo dopo il suo sì richiama rate_agent con code "${code}" (valido 10 minuti, una volta). Se dice no, non fare nulla.`,
  ].join("\n");
}

/** Campi del modulo di valutazione (elicitation MCP): solo tipi semplici, la pubblicazione parte spenta. */
export const RATING_FORM = {
  type: "object" as const,
  properties: {
    // Una scelta e non un numero: Claude Code mostra un intero come campo di testo libero (prova F23-01).
    rating: {
      type: "string" as const,
      title: "Voto",
      enum: ["5", "4", "3", "2", "1"],
      enumNames: ["5 · benissimo", "4 · bene", "3 · così così", "2 · male", "1 · malissimo"],
    },
    comment: { type: "string" as const, title: "Commento (facoltativo)", description: "Cosa è andato bene o cosa migliorare", maxLength: MAX_COMMENT },
    publish: { type: "boolean" as const, title: "Pubblica il commento sul sito di Agentrica", default: false },
  },
  required: ["rating"],
};

/** Il testo in cima al modulo: chi si valuta e cosa parte. */
export function formMessage(name: string): string {
  return `Valuta ${name}. Invia il modulo per mandare la valutazione ad Agentrica, in forma anonima; rifiuta e non te la chiediamo più per questo agente. ${NOTICE}`;
}

/** La risposta del modulo, validata come il resto: voto intero 1–5, commento al più MAX_COMMENT, booleano. */
export function parseForm(agentId: string, content: Record<string, unknown> | undefined): RatingInput | undefined {
  if (!content) return undefined;
  const { comment = "", publish = false } = content;
  const rating = typeof content.rating === "string" && /^[1-5]$/.test(content.rating) ? Number(content.rating) : undefined;
  if (rating === undefined) return undefined;
  if (typeof comment !== "string" || comment.length > MAX_COMMENT || typeof publish !== "boolean") return undefined;
  return { agentId, rating, comment, publish };
}
