// Proposta di un progetto dal server MCP (F29-08), per chi non ha un account GitHub: gli stessi campi della issue
// «Mostra il tuo progetto» (F26), con consenso e licenza obbligatori, verso POST /api/projects del sito, che la tiene
// in attesa finché il titolare non la approva con `npm run projects`. Come le valutazioni, parte solo dopo la conferma
// dell'utente (il modulo inviato, o il codice dell'anteprima di submit_project) e manda esattamente l'anteprima.
// Il codice della proposta (UUID casuale) è l'unico modo per ritirarla: lo vede solo l'utente (PRIV-PRJ-03).
// ponytail: la validazione dei testi copia plainText di agentrica-site (src/lib/projects.ts), che resta il controllo
// finale. Se cambia una delle due, cambiare anche l'altra; da unire se il sito legge un giorno le regole dal pacchetto.
import { randomBytes, randomUUID } from "node:crypto";
import { T } from "./texts/index.ts";

export const PROJECTS_URL = "https://agentrica.vercel.app/api/projects";
export const PROJECTS_PRIVACY_URL = "https://agentrica.vercel.app/note-legali#progetti";
export const PROJECT_LIMITS = { name: 60, description: 280, author: 40, agents: 10, url: 200 } as const;
const CODE_TTL_MS = 10 * 60_000;
const SEND_TIMEOUT_MS = 5_000;


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
  const t = T.showcase;
  if (input.consent !== true || input.license !== true) return t.needConsent;
  const name = plainText(input.name, PROJECT_LIMITS.name);
  if (!name) return t.badName(PROJECT_LIMITS.name);
  const url = httpsUrl(input.url);
  if (!url) return t.badUrl;
  const description = plainText(input.description, PROJECT_LIMITS.description);
  if (!description) return t.badDescription(PROJECT_LIMITS.description);
  const departments = list(input.departments);
  if (departments.length === 0 || departments.some((d) => !known.departments.has(d))) return t.badDepartments;
  const agents = list(input.agents);
  if (agents.length > PROJECT_LIMITS.agents || agents.some((a) => !known.agents.has(a))) return t.badAgents(PROJECT_LIMITS.agents);
  const given = typeof input.author === "string" && input.author.trim() !== "";
  // ponytail: il nome predefinito parte nella lingua del server e il sito lo mostra così com'è; da rivedere in F33.
  const author = given ? plainText(input.author, PROJECT_LIMITS.author) : t.defaultAuthor;
  if (!author) return t.badAuthor(PROJECT_LIMITS.author);
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
      if (!entry || entry.expires <= now()) return { ok: false, message: T.showcase.expired };
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
        return { ok: false, message: T.showcase.unreachable };
      }
      if (response.ok || response.status === 409) return { ok: true, code: payload.code, name: payload.name };
      if (response.status === 429) return { ok: false, message: T.showcase.tooMany };
      if (response.status === 400) return { ok: false, message: T.showcase.rejected };
      return { ok: false, message: T.showcase.serviceError(response.status) };
    },

    /** Ritiro con il codice della proposta: il sito non dice se il codice esisteva (SEC-PRJ-04). */
    async withdraw(code: string): Promise<{ ok: boolean; message: string }> {
      try {
        const response = await post("withdraw", { code });
        if (response.ok) return { ok: true, message: T.showcase.withdrawn };
        return { ok: false, message: T.showcase.withdrawError(response.status) };
      } catch {
        return { ok: false, message: T.showcase.withdrawUnreachable };
      }
    },
  };
  return showcase;
}

export type Showcase = ReturnType<typeof createShowcase>;

export const projectNotice = () => T.showcase.notice(PROJECTS_PRIVACY_URL);

/** Il modulo della proposta (elicitation). */
export function projectForm() {
  const f = T.showcase.form;
  return {
    type: "object" as const,
    properties: {
      name: { type: "string" as const, title: f.name, maxLength: PROJECT_LIMITS.name },
      url: { type: "string" as const, title: f.url, description: f.urlHelp, maxLength: PROJECT_LIMITS.url },
      description: { type: "string" as const, title: f.description, description: f.descriptionHelp, maxLength: PROJECT_LIMITS.description },
      departments: { type: "string" as const, title: f.departments, description: f.departmentsHelp },
      agents: { type: "string" as const, title: f.agents, description: f.agentsHelp },
      author: { type: "string" as const, title: f.author, description: f.authorHelp(T.showcase.defaultAuthor), maxLength: PROJECT_LIMITS.author },
      consent: { type: "boolean" as const, title: f.consent, description: T.showcase.consent, default: false },
      license: { type: "boolean" as const, title: f.license, description: T.showcase.license, default: false },
    },
    required: ["name", "url", "description", "departments", "consent", "license"],
  };
}

export const projectFormMessage = () => T.showcase.formMessage(projectNotice());

/** Testo dell'anteprima di submit_project: cosa parte, l'avviso e il codice. */
export function projectPreviewText(code: string, p: ProjectPayload): string {
  return T.showcase.preview({
    code,
    name: p.name,
    url: p.url,
    description: p.description,
    departments: p.departments.join(", "),
    agents: p.agents.join(", "),
    author: p.author,
    version: p.mcpVersion,
    consent: T.showcase.consent,
    license: T.showcase.license,
    notice: projectNotice(),
  });
}

/** La frase per il modello dopo un invio riuscito, con il codice per ritirare la proposta. */
export const sentText = (name: string, code: string) => T.showcase.sent(name, code, PROJECTS_PRIVACY_URL);
