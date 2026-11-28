// Reparti di AIgentrica e nomi in codice degli agenti.
// I testi dei ruoli non stanno qui: si leggono da agents/ (decisione «Fonte unica» del piano).

/** Lingue dei contenuti (F32): l'italiano in agents/<agenzia>/, l'inglese in agents/<agenzia>/en/. */
export type Lang = "it" | "en";
export const LANGS: readonly Lang[] = ["it", "en"];

export type DepartmentCode = "AIBPD" | "AICA" | "AIPCA" | "AISA" | "AIWDA";

/** Modello consigliato per un agente (F24): «inherit» lascia quello della sessione dell'utente. */
export type Model = "inherit" | "opus" | "sonnet" | "haiku";

export interface DepartmentInfo {
  code: DepartmentCode;
  name: string;
  /** Nome breve, nel nome dei prompt dell'MCP («aisa-02-software») e nel pannello: non cambia dopo la pubblicazione (0.6.0). */
  short: string;
  /** Cartella in agents/. */
  folder: string;
  /** Cosa fa il reparto, in una riga, per lingua. */
  summary: Readonly<Record<Lang, string>>;
  /** Una stella per file di ruolo: l'indice 0 è il file 01, cioè il direttore. */
  stars: readonly string[];
  /**
   * Modello consigliato per numero di file di ruolo; gli altri ruoli restano «inherit». Ogni voce ha una misura che
   * supera la soglia in examples/risultati/ (F24, 2026-11-19-modelli.md; F37, F49, F50 e F51, i file ondata-1…4): un ruolo nuovo
   * entra solo dopo una misura.
   */
  models?: Readonly<Record<number, Model>>;
}

export const DEPARTMENTS: readonly DepartmentInfo[] = [
  {
    code: "AIBPD",
    name: "AI Business & Product Development",
    short: "Business",
    folder: "ai_business_product_development_agency",
    summary: {
      it: "Obiettivi, requisiti, priorità, roadmap, business case e mercato.",
      en: "Goals, requirements, priorities, roadmap, business case and market.",
    },
    stars: ["ALDERAMIN", "PROCYON", "ALPHARD", "HAMAL", "ALGIEBA", "DIPHDA", "MENKENT", "MIRACH", "ALPHERATZ", "RASALHAGUE", "KOCHAB", "DENEBOLA"],
    models: { 2: "sonnet", 3: "sonnet", 4: "sonnet", 5: "sonnet", 6: "sonnet", 7: "sonnet", 8: "sonnet", 9: "sonnet", 10: "sonnet", 11: "sonnet", 12: "sonnet" },
  },
  {
    code: "AICA",
    name: "AI Cybersecurity",
    short: "Cybersecurity",
    folder: "ai_cybersecurity_agency",
    summary: {
      it: "Threat model, configurazioni, accessi, vulnerabilità e risposta agli incidenti.",
      en: "Threat model, configurations, access, vulnerabilities and incident response.",
    },
    stars: ["VEGA", "RIGEL", "BETELGEUSE", "ALNILAM", "ALNITAK", "MINTAKA", "SAIPH", "ELNATH", "WEZEN", "SARGAS", "ATRIA", "NUNKI"],
    models: { 3: "sonnet", 4: "sonnet", 5: "sonnet", 6: "sonnet", 7: "sonnet", 8: "sonnet", 9: "haiku", 12: "haiku" },
  },
  {
    code: "AIPCA",
    name: "AI Privacy & Compliance",
    short: "Privacy",
    folder: "ai_privacy_compliance_agency",
    summary: {
      it: "GDPR, basi giuridiche, conservazione dei dati, fornitori e DPIA.",
      en: "GDPR, legal bases, data retention, vendors and DPIA.",
    },
    stars: ["ARCTURUS", "ALIOTH", "DUBHE", "ALKAID", "MIZAR", "MERAK", "ALCOR", "PHECDA", "MEGREZ", "THUBAN"],
    models: { 2: "sonnet", 3: "sonnet", 5: "sonnet", 6: "sonnet", 7: "sonnet", 8: "sonnet" },
  },
  {
    code: "AISA",
    name: "AI Software",
    short: "Software",
    folder: "ai_software_agency",
    summary: {
      it: "Analisi, architettura, sviluppo, test, sicurezza applicativa e revisione del codice.",
      en: "Analysis, architecture, development, testing, application security and code review.",
    },
    stars: ["SIRIUS", "ALTAIR", "ALDEBARAN", "ANTARES", "SPICA", "POLLUX", "FOMALHAUT", "DENEB", "REGULUS", "CASTOR", "BELLATRIX", "MIRFAK"],
    models: { 3: "sonnet", 5: "sonnet", 6: "sonnet", 7: "sonnet", 8: "haiku", 9: "sonnet", 10: "sonnet", 11: "sonnet" },
  },
  {
    code: "AIWDA",
    name: "AI Web Design",
    short: "Design",
    folder: "ai_web_design_agency",
    summary: {
      it: "Ricerca UX, interfacce, architettura informativa, design system, accessibilità e testi.",
      en: "UX research, interfaces, information architecture, design system, accessibility and copy.",
    },
    stars: ["CANOPUS", "ACHERNAR", "HADAR", "ACRUX", "MIMOSA", "ADHARA", "SHAULA", "GACRUX", "ALNAIR", "AVIOR"],
    models: { 4: "sonnet", 5: "sonnet", 6: "sonnet", 7: "sonnet", 8: "sonnet", 10: "sonnet" },
  },
];
