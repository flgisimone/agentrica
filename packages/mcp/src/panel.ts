// Pannello locale: server HTTP nello stesso processo del server MCP, attivo di predefinito da F29 (prima solo con --panel), spento con --no-panel.
// Chi raggiunge la pagina risponde alle domande dell'agente, quindi le difese sono strette: ascolto solo su 127.0.0.1
// con porta casuale; token casuale nell'URL aperto dal tool, scambiato con un cookie HttpOnly e SameSite=Strict;
// Host fisso contro il DNS rebinding; Origin fisso e JSON obbligatorio per le POST; CSP 'self' e nessuna risorsa
// esterna. Le rotte sono un elenco chiuso: nessun percorso dell'URL diventa un percorso di file.
import { spawn } from "node:child_process";
import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { readProject } from "./project.ts";
import { MAX_COMMENT, NOTICE, type SendResult } from "./ratings.ts";
import { SHARE_NOTICE, type SharePayload, type ShareResult } from "./share.ts";
import { usageReport } from "./usage.ts";

export interface Choice {
  label: string;
  description: string;
}

export interface QuestionInput {
  header: string;
  question: string;
  options: Choice[];
  multiple: boolean;
}

export interface Question extends QuestionInput {
  id: string;
  askedAt: string;
}

export interface Answer {
  choices: string[];
  note: string;
}

export interface Activity {
  time: string;
  id: string;
  codeName: string;
  role: string;
  department: string;
  task: string;
}

/** Le valutazioni viste dal pannello (F20): il server MCP le passa, il pannello non apre connessioni da solo. */
export interface PanelRatings {
  isRated(agentId: string): boolean;
  /** Invia una valutazione confermata nella pagina. */
  rate(input: RateInput): Promise<SendResult>;
  /** Totali di token (F27): fissa le righe e dà il codice; la conferma nella pagina le invia. */
  previewShare(): Promise<{ code: string; payload: SharePayload; omitted: number }>;
  confirmShare(code: string): Promise<ShareResult>;
}

export interface RateInput {
  agentId: string;
  rating: number;
  comment: string;
  publish: boolean;
}

export interface Panel {
  /** URL con il token: apre la sessione del browser. */
  url: string;
  /** Mostra la domanda nella pagina e aspetta la risposta; con `signal` interrotto la domanda sparisce. */
  ask(question: QuestionInput, signal: AbortSignal): Promise<Answer>;
  record(activity: Omit<Activity, "time">): void;
  hasViewers(): boolean;
  close(): Promise<void>;
}

const MAX_BODY_BYTES = 16_000;
const MAX_NOTE = 2000;
const MAX_ACTIVITY = 20;

/**
 * Le ultime `max` chiamate più l'ultima di ogni agente uscito da quelle (F30-09): ogni agente usato nella sessione resta
 * nell'elenco e si può valutare. Al più `max` voci più una per agente del catalogo.
 */
export function keepActivity<T extends { id: string }>(list: T[], max = MAX_ACTIVITY): T[] {
  const seen = new Set<string>();
  return list.filter((entry, i) => {
    const first = !seen.has(entry.id);
    seen.add(entry.id);
    return i < max || first;
  });
}
const KEEPALIVE_MS = 25_000;

const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Cache-Control": "no-store",
  "Cross-Origin-Resource-Policy": "same-origin",
} as const;

const PAGE_FILES = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/app.js": ["app.js", "text/javascript; charset=utf-8"],
  "/style.css": ["style.css", "text/css; charset=utf-8"],
} as const;

function sameSecret(given: string | undefined, token: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

function cookie(req: IncomingMessage, name: string): string | undefined {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return undefined;
}

function send(res: ServerResponse, status: number, body = "", type = "text/plain; charset=utf-8") {
  res.writeHead(status, { ...SECURITY_HEADERS, "Content-Type": type });
  res.end(body);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("corpo troppo grande"));
        req.destroy();
      } else chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/** Controlla una risposta della pagina contro la domanda: etichette esistenti, una sola se la scelta è singola. */
export function parseAnswer(question: QuestionInput, body: unknown): Answer | null {
  if (typeof body !== "object" || body === null) return null;
  const { choices, note = "" } = body as { choices?: unknown; note?: unknown };
  if (!Array.isArray(choices) || typeof note !== "string" || note.length > MAX_NOTE) return null;
  const labels = new Set(question.options.map((o) => o.label));
  const picked = [...new Set(choices)];
  if (!picked.every((c): c is string => typeof c === "string" && labels.has(c))) return null;
  if (picked.length === 0 && note.trim() === "") return null;
  if (!question.multiple && picked.length > 1) return null;
  return { choices: picked, note: note.trim() };
}

/** Controlla una valutazione dalla pagina: agente fra quelli usati, voto intero 1–5, commento corto, casella booleana. */
export function parseRate(used: ReadonlySet<string>, body: unknown): RateInput | null {
  if (typeof body !== "object" || body === null) return null;
  const { agentId, rating, comment = "", publish = false } = body as Record<string, unknown>;
  if (typeof agentId !== "string" || !used.has(agentId)) return null;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  if (typeof comment !== "string" || comment.length > MAX_COMMENT || typeof publish !== "boolean") return null;
  return { agentId, rating, comment: comment.trim(), publish };
}

/** Apre l'URL nel browser predefinito; se non riesce (es. sessione remota) l'URL resta nella risposta del tool. */
export function openBrowser(url: string): void {
  const [command, args] =
    process.platform === "darwin" ? ["open", [url]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : ["xdg-open", [url]];
  try {
    const child = spawn(command, args, { stdio: "ignore", detached: true });
    child.on("error", () => {});
    child.unref();
  } catch {
    // Nessun browser: l'utente apre l'URL a mano.
  }
}

/** `update` dà l'avviso di versione nuova (F23), se c'è: il pannello lo mostra in un banner. */
export async function startPanel(root: string, ratings?: PanelRatings, update: () => string | undefined = () => undefined): Promise<Panel> {
  const pageDir = join(import.meta.dirname, "page");
  const token = randomBytes(32).toString("hex");
  const pages = Object.fromEntries(Object.entries(PAGE_FILES).map(([route, [file, type]]) => [route, { body: readFileSync(join(pageDir, file)), type }]));
  const pending = new Map<string, { question: Question; resolve: (answer: Answer) => void }>();
  const activity: Activity[] = [];
  const viewers = new Set<ServerResponse>();

  const changed = () => {
    for (const viewer of viewers) viewer.write("event: change\ndata: {}\n\n");
  };

  const server = createServer((req, res) => {
    // Un errore in una richiesta non deve fermare il processo, che è anche il server MCP della sessione.
    handle(req, res).catch(() => {
      if (!res.headersSent) send(res, 500, "Errore del pannello.");
      else res.end();
    });
  });

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const port = (server.address() as AddressInfo).port;
    const origin = `http://127.0.0.1:${port}`;
    if (req.headers.host !== `127.0.0.1:${port}`) return send(res, 421, "Host non valido.");
    const url = new URL(req.url ?? "/", origin);
    const cookieName = `agentrica_panel_${port}`;

    if (req.method === "GET" && url.pathname === "/" && url.searchParams.has("t")) {
      if (!sameSecret(url.searchParams.get("t") ?? undefined, token)) return send(res, 403, "Token non valido.");
      // Il token esce dalla barra degli indirizzi e dalla cronologia: da qui vale il cookie.
      res.writeHead(303, { ...SECURITY_HEADERS, Location: "/", "Set-Cookie": `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/` });
      res.end();
      return;
    }
    if (!sameSecret(cookie(req, cookieName), token)) {
      return send(res, 403, "Apri il pannello dall'URL che dà il tool open_panel dell'agente.");
    }

    if (req.method === "GET" && url.pathname in pages) {
      const page = pages[url.pathname]!;
      return send(res, 200, page.body.toString("utf8"), page.type);
    }
    if (req.method === "GET" && url.pathname === "/api/state") {
      const project = await readProject(root);
      const questions = [...pending.values()].map((p) => p.question);
      const rated = ratings ? [...new Set(activity.map((a) => a.id))].filter((id) => ratings.isRated(id)) : [];
      const rating = ratings ? { notice: NOTICE, maxComment: MAX_COMMENT, rated } : null;
      return send(res, 200, JSON.stringify({ project, questions, activity, rating, update: update() ?? null }), "application/json; charset=utf-8");
    }
    // Consumo di token dai file di Claude Code del progetto (F24): si legge solo quando la pagina apre la vista.
    if (req.method === "GET" && url.pathname === "/api/usage") {
      return send(res, 200, JSON.stringify(await usageReport(root)), "application/json; charset=utf-8");
    }
    if (req.method === "GET" && url.pathname === "/api/events") {
      res.writeHead(200, { ...SECURITY_HEADERS, "Content-Type": "text/event-stream; charset=utf-8", Connection: "keep-alive" });
      res.write("retry: 3000\n\n");
      viewers.add(res);
      req.on("close", () => viewers.delete(res));
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/rate" && ratings) {
      if (req.headers.origin !== origin) return send(res, 403, "Origine non valida.");
      if (!req.headers["content-type"]?.startsWith("application/json")) return send(res, 415, "Serve JSON.");
      let body: unknown;
      try {
        body = JSON.parse(await readBody(req));
      } catch {
        return send(res, 400, "Richiesta non valida.");
      }
      const input = parseRate(new Set(activity.map((a) => a.id)), body);
      if (!input) return send(res, 400, "Valutazione non valida.");
      // L'invio dalla pagina è la conferma dell'utente: la pagina mostra l'avviso accanto al pulsante.
      const result = await ratings.rate(input);
      changed();
      return send(res, result.ok ? 200 : 502, JSON.stringify(result), "application/json; charset=utf-8");
    }
    // Totali di token (F27): l'anteprima fissa le righe nel server; la conferma manda solo il codice, quindi parte
    // esattamente ciò che la pagina ha mostrato.
    if (req.method === "POST" && (url.pathname === "/api/share/preview" || url.pathname === "/api/share") && ratings) {
      if (req.headers.origin !== origin) return send(res, 403, "Origine non valida.");
      if (!req.headers["content-type"]?.startsWith("application/json")) return send(res, 415, "Serve JSON.");
      let body: { code?: unknown };
      try {
        body = JSON.parse(await readBody(req));
      } catch {
        return send(res, 400, "Richiesta non valida.");
      }
      if (url.pathname === "/api/share/preview") {
        const { code, payload, omitted } = await ratings.previewShare();
        return send(res, 200, JSON.stringify({ code, rows: payload.rows, omitted, version: payload.mcpVersion, notice: SHARE_NOTICE }), "application/json; charset=utf-8");
      }
      if (typeof body?.code !== "string" || !/^[0-9a-f]{8}$/.test(body.code)) return send(res, 400, "Codice non valido.");
      const result = await ratings.confirmShare(body.code);
      return send(res, result.ok ? 200 : 502, JSON.stringify(result), "application/json; charset=utf-8");
    }
    if (req.method === "POST" && url.pathname === "/api/answer") {
      if (req.headers.origin !== origin) return send(res, 403, "Origine non valida.");
      if (!req.headers["content-type"]?.startsWith("application/json")) return send(res, 415, "Serve JSON.");
      let body: { id?: unknown };
      try {
        body = JSON.parse(await readBody(req));
      } catch {
        return send(res, 400, "Richiesta non valida.");
      }
      const entry = typeof body?.id === "string" ? pending.get(body.id) : undefined;
      if (!entry) return send(res, 404, "La domanda non è più in attesa.");
      const answer = parseAnswer(entry.question, body);
      if (!answer) return send(res, 400, "Risposta non valida.");
      entry.resolve(answer);
      res.writeHead(204, SECURITY_HEADERS);
      res.end();
      return;
    }
    return send(res, 404, "Non trovato.");
  }

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = (server.address() as AddressInfo).port;
  const keepalive = setInterval(() => viewers.forEach((viewer) => viewer.write(": ping\n\n")), KEEPALIVE_MS);
  keepalive.unref();
  server.unref();

  return {
    url: `http://127.0.0.1:${port}/?t=${token}`,
    ask(input, signal) {
      return new Promise((resolve, reject) => {
        const id = randomUUID();
        const done = () => {
          pending.delete(id);
          signal.removeEventListener("abort", abort);
          changed();
        };
        const abort = () => {
          done();
          reject(signal.reason);
        };
        if (signal.aborted) return reject(signal.reason);
        signal.addEventListener("abort", abort);
        pending.set(id, {
          question: { ...input, id, askedAt: new Date().toISOString() },
          resolve: (answer) => {
            done();
            resolve(answer);
          },
        });
        changed();
      });
    },
    record(entry) {
      activity.unshift({ ...entry, time: new Date().toISOString() });
      activity.splice(0, activity.length, ...keepActivity(activity));
      changed();
    },
    hasViewers: () => viewers.size > 0,
    close() {
      clearInterval(keepalive);
      for (const viewer of viewers) viewer.end();
      return new Promise((resolve) => server.close(() => resolve()));
    },
  };
}
