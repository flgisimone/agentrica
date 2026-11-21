// Proposta di un progetto dal server MCP (F29-08), per chi non ha un account GitHub: gli stessi campi della issue
// «Mostra il tuo progetto» (F26), con consenso e licenza obbligatori, verso POST /api/projects del sito, che la tiene
// in attesa finché il titolare non la approva con `npm run projects`. Come le valutazioni, parte solo dopo la conferma
// dell'utente (il modulo inviato, o il codice dell'anteprima di submit_project) e manda esattamente l'anteprima.
// Il codice della proposta (UUID casuale) è l'unico modo per ritirarla: lo vede solo l'utente (PRIV-PRJ-03).
// ponytail: la validazione dei testi copia plainText di agentrica-site (src/lib/projects.ts), che resta il controllo
// finale. Se cambia una delle due, cambiare anche l'altra; da unire se il sito legge un giorno le regole dal pacchetto.
import { randomBytes, randomUUID } from "node:crypto";

export const PROJECTS_URL = "https://agentrica.vercel.app/api/projects";
export const PROJECTS_PRIVACY_URL = "https://agentrica.vercel.app/note-legali#progetti";
export const PROJECT_LIMITS = { name: 60, description: 280, author: 40, agents: 10, url: 200 } as const;
export const DEFAULT_AUTHOR = "Utente di Agentrica";
const CODE_TTL_MS = 10 * 60_000;
const SEND_TIMEOUT_MS = 5_000;

export const CONSENT_TEXT =
  "Acconsento a che Agentrica pubblichi sul suo sito i dati di questo modulo (nome da mostrare, nome, link, descrizione, reparti, agenti, versione) e la data di approvazione, finché non chiedo di toglierli.";
export const LICENSE_TEXT =
  "Concedo ad Agentrica, senza compenso, il permesso di mostrare sul sito nome e descrizione del progetto finché non chiedo di toglierli, e dichiaro di poterlo fare.";

/** Quello che parte verso Agentrica, e nient'altro. */
export interface ProjectPayload {
  code: string;
  name: string;
  url: string;
  description: string;
  departments: string[];
  agents: string[];
  author: string;
  mcpVersion: string;
  consent: true;
  license: true;
}
export type ProjectFields = Omit<ProjectPayload, "code" | "mcpVersion">;
export interface Known {
  departments: ReadonlySet<string>;
  agents: ReadonlySet<string>;
}

const INVISIBLE = /[\p{Cc}\p{Cf}]/gu;
const MARKUP = /[<>`[\]]|https?:|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|dev|app|it|eu|co|me|xyz)\b/i;

/** Testo semplice su una riga: senza invisibili, spazi compattati, nei limiti, senza markup né link. */
export function plainText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.normalize("NFC").replace(INVISIBLE, " ").replace(/\s+/g, " ").trim();
  if (text.length === 0 || text.length > max || MARKUP.test(text)) return null;
  return text;
}

/** Un link https senza credenziali né porta, con un dominio vero, al più 200 caratteri (SEC-PRJ-03). */
export function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (raw.length > PROJECT_LIMITS.url || /[\s\p{Cc}\p{Cf}]/u.test(raw)) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(url.hostname)) return null;
  return url.href.replace(/\/$/, "");
}

/** Sigle o id separati da virgole o spazi, in maiuscolo e senza doppioni. */
const list = (value: unknown) =>
  typeof value === "string" ? [...new Set(value.split(/[\s,;]+/).map((s) => s.trim().toUpperCase()).filter(Boolean))] : [];

/** I campi della proposta, validati; altrimenti il motivo dello scarto, da dire all'utente. */
export function parseProjectFields(input: Record<string, unknown>, known: Known): ProjectFields | string {
  if (input.consent !== true || input.license !== true) return "servono il consenso e la licenza";
  const name = plainText(input.name, PROJECT_LIMITS.name);
  if (!name) return `nome mancante, oltre ${PROJECT_LIMITS.name} caratteri o con link e simboli < > [ ] \``;
  const url = httpsUrl(input.url);
  if (!url) return "il link deve essere un indirizzo https:// completo, senza porta né credenziali, al più 200 caratteri";
  const description = plainText(input.description, PROJECT_LIMITS.description);
  if (!description) return `descrizione mancante, oltre ${PROJECT_LIMITS.description} caratteri o con link e simboli < > [ ] \``;
  const departments = list(input.departments);
  if (departments.length === 0 || departments.some((d) => !known.departments.has(d))) return "reparti mancanti o sconosciuti (sigle come AISA, AIWDA)";
  const agents = list(input.agents);
  if (agents.length > PROJECT_LIMITS.agents || agents.some((a) => !known.agents.has(a))) return `agenti sconosciuti o più di ${PROJECT_LIMITS.agents} (id come AISA-02)`;
  const given = typeof input.author === "string" && input.author.trim() !== "";
  const author = given ? plainText(input.author, PROJECT_LIMITS.author) : DEFAULT_AUTHOR;
  if (!author) return `nome da mostrare oltre ${PROJECT_LIMITS.author} caratteri o con link e simboli`;
  return { name, url, description, departments, agents, author, consent: true, license: true };
}

export type SendResult = { ok: true; code: string; name: string } | { ok: false; message: string };

export interface ShowcaseOptions {
  version: string;
  url?: string;
  fetch?: typeof fetch;
  now?: () => number;
}

export function createShowcase({ version, url = PROJECTS_URL, fetch: doFetch = fetch, now = Date.now }: ShowcaseOptions) {
  const drafts = new Map<string, { payload: ProjectPayload; expires: number }>();
  const post = (path: string, body: unknown) =>
    doFetch(new URL(path, `${url}/`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
  const unreachable = "Invio non riuscito: Agentrica non è raggiungibile (rete assente, timeout o rete non permessa). Riprova più tardi.";

  const showcase = {
    build: (fields: ProjectFields): ProjectPayload => ({ code: randomUUID(), ...fields, mcpVersion: version }),

    /** Primo passo di submit_project: fissa la proposta e restituisce il codice dell'anteprima. */
    draft(fields: ProjectFields): { code: string; payload: ProjectPayload } {
      for (const [code, entry] of drafts) if (entry.expires <= now()) drafts.delete(code);
      const payload = showcase.build(fields);
      const code = randomBytes(4).toString("hex");
      drafts.set(code, { payload, expires: now() + CODE_TTL_MS });
      return { code, payload };
    },

    /** Secondo passo: invia la proposta dell'anteprima, una volta sola. */
    async confirm(code: string): Promise<SendResult> {
      const entry = drafts.get(code);
      drafts.delete(code);
      if (!entry || entry.expires <= now()) return { ok: false, message: "Codice scaduto o già usato: prepara di nuovo l'anteprima." };
      return showcase.send(entry.payload);
    },

    /** Invio di una proposta già confermata dall'utente. */
    async send(payload: ProjectPayload): Promise<SendResult> {
      let response: Response;
      try {
        response = await doFetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        });
      } catch {
        return { ok: false, message: unreachable };
      }
      if (response.ok || response.status === 409) return { ok: true, code: payload.code, name: payload.name };
      if (response.status === 429) return { ok: false, message: "Limite di proposte di oggi raggiunto da questa rete. Riprova domani." };
      if (response.status === 400) return { ok: false, message: "Proposta respinta: dati non validi." };
      return { ok: false, message: `Invio non riuscito (errore ${response.status} del servizio). Riprova più tardi.` };
    },

    /** Ritiro con il codice della proposta: il sito non dice se il codice esisteva (SEC-PRJ-04). */
    async withdraw(code: string): Promise<{ ok: boolean; message: string }> {
      try {
        const response = await post("withdraw", { code });
        if (response.ok) return { ok: true, message: "Richiesta di ritiro registrata." };
        return { ok: false, message: `Ritiro non riuscito (errore ${response.status} del servizio). Riprova più tardi.` };
      } catch {
        return { ok: false, message: unreachable.replace("Invio", "Ritiro") };
      }
    },
  };
  return showcase;
}

export type Showcase = ReturnType<typeof createShowcase>;

export const PROJECT_NOTICE =
  "Il progetto compare sul sito solo dopo l'approvazione del titolare; descrizione e risultati restano tuoi e non li verifichiamo. " +
  `Parte solo ciò che vedi, con la versione del pacchetto; niente email né account. Informativa: ${PROJECTS_PRIVACY_URL}`;

/** Il modulo della proposta (elicitation). */
export const PROJECT_FORM = {
  type: "object" as const,
  properties: {
    name: { type: "string" as const, title: "Nome del progetto", maxLength: PROJECT_LIMITS.name },
    url: { type: "string" as const, title: "Link", description: "Un indirizzo https:// pubblico: repository, sito o pagina del progetto.", maxLength: PROJECT_LIMITS.url },
    description: {
      type: "string" as const,
      title: "Descrizione",
      description: "Cosa fa il progetto e come hai usato gli agenti. Testo semplice, senza link.",
      maxLength: PROJECT_LIMITS.description,
    },
    departments: { type: "string" as const, title: "Reparti usati", description: "Sigle separate da virgole: AIBPD, AICA, AIPCA, AISA, AIWDA." },
    agents: { type: "string" as const, title: "Agenti usati (facoltativo)", description: "Id separati da virgole, es. AISA-02, AIWDA-08; al più 10." },
    author: { type: "string" as const, title: "Nome da mostrare (facoltativo)", description: `Vuoto: «${DEFAULT_AUTHOR}».`, maxLength: PROJECT_LIMITS.author },
    consent: { type: "boolean" as const, title: "Consenso", description: CONSENT_TEXT, default: false },
    license: { type: "boolean" as const, title: "Licenza", description: LICENSE_TEXT, default: false },
  },
  required: ["name", "url", "description", "departments", "consent", "license"],
};

export const projectFormMessage = () => `Mostra il tuo progetto sul sito di Agentrica. ${PROJECT_NOTICE}`;

/** Testo dell'anteprima di submit_project: cosa parte, l'avviso e il codice. */
export function projectPreviewText(code: string, p: ProjectPayload): string {
  return [
    "Anteprima della proposta del progetto:",
    `- nome: ${p.name}`,
    `- link: ${p.url}`,
    `- descrizione: ${p.description}`,
    `- reparti: ${p.departments.join(", ")}`,
    `- agenti: ${p.agents.join(", ") || "(nessuno)"}`,
    `- nome da mostrare: ${p.author}`,
    `- versione: ${p.mcpVersion}`,
    `- consenso e licenza: sì («${CONSENT_TEXT}» «${LICENSE_TEXT}»)`,
    "",
    PROJECT_NOTICE,
    "",
    `Mostra questa anteprima all'utente e chiedigli se inviarla. Solo dopo il suo sì richiama submit_project con code "${code}" (valido 10 minuti, una volta). Se dice no, non fare nulla.`,
  ].join("\n");
}

/** La frase per il modello dopo un invio riuscito, con il codice per ritirare la proposta. */
export const sentText = (name: string, code: string) =>
  `Proposta del progetto «${name}» inviata ad Agentrica: comparirà sul sito dopo l'approvazione. Codice della proposta: ${code}. ` +
  `Dillo all'utente e digli di conservarlo: è l'unico modo per ritirarla, con il comando progetto di Agentrica e l'argomento rimuovi (${PROJECTS_PRIVACY_URL}).`;
