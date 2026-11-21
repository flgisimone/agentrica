// Configurazione salvata (F29): le scelte del modulo in ~/.agentrica/config.json, una per utente, valide dalla sessione
// successiva. I flag del comando del server hanno la precedenza, chiave per chiave. È l'unico file che il server scrive,
// e solo dopo il modulo; il contenuto è a schema fisso, senza percorsi, progetti o date (PRIV-CFG-01).
// Il percorso viene solo da os.homedir(): nessuna variabile d'ambiente di Agentrica lo sposta (SEC-CFG-01).
import { chmodSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export interface Config {
  /** La squadra, come --agents; vuota o assente: tutti gli agenti. */
  agents: string;
  panel: boolean;
  ratings: boolean;
  updateCheck: boolean;
}
export type ConfigKey = keyof Config;

// Da F29 tutto acceso alla prima installazione (scelta dell'utente, 2026-11-21): pannello, valutazioni, avviso.
export const DEFAULTS: Config = { agents: "", panel: true, ratings: true, updateCheck: true };
export const MAX_CONFIG_BYTES = 4096;
export const MAX_AGENTS = 500;
const KEYS = ["agents", "panel", "ratings", "updateCheck"] as const satisfies readonly ConfigKey[];

export const configPath = (home = homedir()) => join(home, ".agentrica", "config.json");
/** Il percorso da mostrare all'utente, con ~ al posto della cartella personale. */
export const shownPath = "~/.agentrica/config.json";

/**
 * Con il permission model di Node (--permission) il server legge e scrive il file solo se gli è permesso: senza
 * permesso niente lettura né modulo (SEC-CFG-04). Senza --permission, process.permission non c'è.
 */
export function canUseConfig(path: string): boolean {
  const permission = (process as { permission?: { has(scope: string, reference?: string): boolean } }).permission;
  if (!permission) return true;
  const dir = dirname(path);
  return permission.has("fs.read", dir) && permission.has("fs.write", dir);
}

/** Lettura stretta (SEC-CFG-02): solo version 1 e le chiavi note con il tipo giusto. Altrimenti undefined. */
export function parseConfig(raw: string): Config | undefined {
  if (Buffer.byteLength(raw) > MAX_CONFIG_BYTES) return undefined;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return undefined;
  const { version, ...rest } = data as Record<string, unknown>;
  if (version !== 1 || Object.keys(rest).some((key) => !(KEYS as readonly string[]).includes(key))) return undefined;
  const config = { ...DEFAULTS };
  for (const key of KEYS) {
    const value = rest[key];
    if (value === undefined) continue;
    if (typeof value !== typeof DEFAULTS[key]) return undefined;
    (config as Record<string, unknown>)[key] = value;
  }
  return config.agents.length > MAX_AGENTS ? undefined : config;
}

export type ReadResult = { config: Config } | { missing: true } | { invalid: string };

/** Il file salvato: mancante, valido o non valido (con il motivo, mai il contenuto). */
export function readConfig(path: string): ReadResult {
  try {
    if (statSync(path).size > MAX_CONFIG_BYTES) return { invalid: "più grande di 4 KB" };
    const config = parseConfig(readFileSync(path, "utf8"));
    return config ? { config } : { invalid: "formato non valido" };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { missing: true };
    return { invalid: (error as NodeJS.ErrnoException).code ?? "non leggibile" };
  }
}

/** Scrittura atomica (SEC-CFG-03): cartella 0700, file temporaneo 0600 nella stessa cartella, poi rename. */
export function writeConfig(path: string, config: Config): void {
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const temp = join(dir, `config.${process.pid}.tmp`);
  writeFileSync(temp, `${JSON.stringify({ version: 1, ...config }, null, 2)}\n`, { mode: 0o600 });
  chmodSync(temp, 0o600);
  renameSync(temp, path);
}

/** I campi del modulo, senza quelli fissati da un flag; i valori proposti sono quelli di `base`. */
export function configForm(base: Config, fixed: ReadonlySet<ConfigKey>) {
  const fields = {
    agents: {
      type: "string" as const,
      title: "Squadra",
      description: "Id di agenti e sigle di reparti separati da virgole, es. aisa,aiwda-08. Vuoto: tutti gli agenti.",
      maxLength: MAX_AGENTS,
      default: base.agents,
    },
    panel: {
      type: "boolean" as const,
      title: "Pannello locale",
      description: "Una pagina su questo computer con fasi, rilievi, agenti in uso e le scelte da prendere.",
      default: base.panel,
    },
    ratings: {
      type: "boolean" as const,
      title: "Valutazioni degli agenti",
      description: "Il server ti chiede ogni tanto un voto sugli agenti. Non parte nulla senza la tua conferma.",
      default: base.ratings,
    },
    updateCheck: {
      type: "boolean" as const,
      title: "Avviso di versione nuova",
      description: "All'avvio il server controlla sul registro npm se c'è una versione più recente.",
      default: base.updateCheck,
    },
  };
  return { type: "object" as const, properties: Object.fromEntries(KEYS.filter((key) => !fixed.has(key)).map((key) => [key, fields[key]])) };
}

/** Le risposte del modulo sopra `base` (SEC-CFG-05): un valore del tipo sbagliato rende tutto non valido. */
export function parseConfigForm(base: Config, content: Record<string, unknown> | undefined): Config | undefined {
  const config = { ...base };
  for (const key of KEYS) {
    const value = content?.[key];
    if (value === undefined) continue;
    if (typeof value !== typeof DEFAULTS[key]) return undefined;
    (config as Record<string, unknown>)[key] = typeof value === "string" ? value.trim() : value;
  }
  return config.agents.length > MAX_AGENTS ? undefined : config;
}

export const configMessage = (fixed: ReadonlySet<ConfigKey>) =>
  [
    "Configura Agentrica.",
    `Le scelte si salvano sul tuo computer in ${shownPath} e valgono dalla prossima sessione. Ad Agentrica non arriva nulla.`,
    "Per cambiarle usa il comando configura di Agentrica (in Claude Code /mcp__<nome del server>__configura); per tornare ai valori predefiniti cancella il file.",
    fixed.size > 0 ? "Le opzioni scritte nel comando del server non compaiono qui: hanno la precedenza." : "",
  ]
    .filter(Boolean)
    .join(" ");
