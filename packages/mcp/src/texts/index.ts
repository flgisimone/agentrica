// Lingua del server (F32): --lang, poi «lang» in ~/.agentrica/config.json, poi la lingua del sistema. Italiano se è
// it, altrimenti inglese. Un processo ha una lingua sola: T è un binding vivo che setLang sostituisce all'avvio.
import type { Lang } from "../../../catalog/src/index.ts";
import { en } from "./en.ts";
import { it, type Texts } from "./it.ts";

export type { Lang } from "../../../catalog/src/index.ts";
export type { Texts } from "./it.ts";

export const TEXTS: Record<Lang, Texts> = { it, en };

// ponytail: prima di setLang vale l'italiano, come prima di F32, così i test dei moduli non dipendono dal sistema.
export let T: Texts = it;
export let lang: Lang = "it";

export function setLang(value: Lang): void {
  lang = value;
  T = TEXTS[value];
}

export const isLang = (value: unknown): value is Lang => value === "it" || value === "en";

/**
 * La lingua del sistema: LC_ALL, LC_MESSAGES e LANG (Mac, Linux), poi la locale di Intl (anche Windows, dove quelle
 * variabili di solito mancano). «it», «it_IT.UTF-8» o «it-CH» → italiano; tutto il resto, anche «C», → inglese.
 */
export function systemLang(env: NodeJS.ProcessEnv = process.env, locale = Intl.DateTimeFormat().resolvedOptions().locale): Lang {
  const value = [env.LC_ALL, env.LC_MESSAGES, env.LANG].find((v) => v !== undefined && v !== "") ?? locale;
  return /^it(?:[_.@-]|$)/i.test(value) ? "it" : "en";
}

/** La lingua scelta: flag, poi file salvato (vuoto vale come assente), poi sistema. */
export function chooseLang(flag: Lang | undefined, saved: string | undefined, system: () => Lang = systemLang): Lang {
  return flag ?? (isLang(saved) ? saved : system());
}
