// Reparti di Agentrica e nomi in codice degli agenti.
// I testi dei ruoli non stanno qui: si leggono da agents/ (plan/README.md, «Fonte unica»).

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
  /** Cosa fa il reparto, in una riga. */
  summary: string;
  /** Una stella per file di ruolo: l'indice 0 è il file 01, cioè il direttore. */
  stars: readonly string[];
  /**
   * Modello consigliato per numero di file di ruolo; gli altri ruoli restano «inherit». Ogni voce ha una misura che
   * supera la soglia in examples/risultati/ (F24, 2026-11-19-modelli.md): un ruolo nuovo entra solo dopo una misura.
   */
  models?: Readonly<Record<number, Model>>;
}

export const DEPARTMENTS: readonly DepartmentInfo[] = [
  {
    code: "AIBPD",
    name: "AI Business & Product Development",
    short: "Business",
    folder: "ai_business_product_development_agency",
    summary: "Obiettivi, requisiti, priorità, roadmap, business case e mercato.",
    stars: ["ALDERAMIN", "PROCYON", "ALPHARD", "HAMAL", "ALGIEBA", "DIPHDA", "MENKENT", "MIRACH", "ALPHERATZ", "RASALHAGUE", "KOCHAB", "DENEBOLA"],
    models: { 5: "sonnet" },
  },
  {
    code: "AICA",
    name: "AI Cybersecurity",
    short: "Cybersecurity",
    folder: "ai_cybersecurity_agency",
    summary: "Threat model, configurazioni, accessi, vulnerabilità e risposta agli incidenti.",
    stars: ["VEGA", "RIGEL", "BETELGEUSE", "ALNILAM", "ALNITAK", "MINTAKA", "SAIPH", "ELNATH", "WEZEN", "SARGAS", "ATRIA", "NUNKI"],
    models: { 4: "sonnet" },
  },
  {
    code: "AIPCA",
    name: "AI Privacy & Compliance",
    short: "Privacy",
    folder: "ai_privacy_compliance_agency",
    summary: "GDPR, basi giuridiche, conservazione dei dati, fornitori e DPIA.",
    stars: ["ARCTURUS", "ALIOTH", "DUBHE", "ALKAID", "MIZAR", "MERAK", "ALCOR", "PHECDA", "MEGREZ", "THUBAN"],
    models: { 2: "sonnet" },
  },
  {
    code: "AISA",
    name: "AI Software",
    short: "Software",
    folder: "ai_software_agency",
    summary: "Analisi, architettura, sviluppo, test, sicurezza applicativa e revisione del codice.",
    stars: ["SIRIUS", "ALTAIR", "ALDEBARAN", "ANTARES", "SPICA", "POLLUX", "FOMALHAUT", "DENEB", "REGULUS", "CASTOR", "BELLATRIX", "MIRFAK"],
    models: { 8: "haiku", 9: "sonnet" },
  },
  {
    code: "AIWDA",
    name: "AI Web Design",
    short: "Design",
    folder: "ai_web_design_agency",
    summary: "Ricerca UX, interfacce, architettura informativa, design system, accessibilità e testi.",
    stars: ["CANOPUS", "ACHERNAR", "HADAR", "ACRUX", "MIMOSA", "ADHARA", "SHAULA", "GACRUX", "ALNAIR", "AVIOR"],
  },
];
