// Misure di F40 (baseline del contesto): byte dei testi che il server MCP restituisce, dalle stesse funzioni che li
// compongono. I token sono una stima (byte / 4), scritta come tale accanto al numero: un conteggio esatto chiederebbe
// il tokenizer di un provider, con una chiave.
import { cardText, agentList, agentSizes, COMPONENTS, findAgent, promptName, selectSquad, type Component, type Found, type SquadDepartment } from "../packages/mcp/src/prompt.ts";
import { loadCatalog } from "../packages/mcp/src/catalog.ts";
import { setLang, T, type Lang } from "../packages/mcp/src/texts/index.ts";

const LABELS: Record<Component, string> = {
  frame: "Cornice",
  rules: "Regole comuni",
  role: "Ruolo",
  library: "Biblioteca",
  task: "Compito",
  closing: "Resoconto e valutazione",
};

/**
 * Il flusso di orchestrazione-newsletter come l'ha percorso la prova di F34 (examples/risultati/2026-11-22-orchestrazione.md):
 * i direttori di business, design e privacy, poi il direttore software e lo specialista che scrive il codice.
 */
export const FLOW = ["AIBPD-01", "AIWDA-01", "AIPCA-01", "AISA-01", "AISA-06"] as const;

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);
export const tokens = (bytes: number) => Math.round(bytes / 4);
const pct = (part: number, whole: number) => `${Math.round((part / whole) * 100)}%`;
const row = (cells: readonly (string | number)[]) => `| ${cells.join(" | ")} |`;
const table = (head: readonly string[], rows: readonly (readonly (string | number)[])[]) =>
  [row(head), row(head.map((_, i) => (i === 0 ? "---" : "---:"))), ...rows.map(row)].join("\n");

const total = (sizes: Record<Component, number>) => sum(Object.values(sizes));

/** Byte del testo di ogni agente del flusso e quota ripetuta: regole e biblioteca di un reparto già caricato. */
export function flowSizes(catalog: readonly SquadDepartment[], date: string) {
  const seen = new Set<string>();
  return FLOW.map((id) => {
    const found = findAgent(catalog, id)!;
    // Le opzioni predefinite del server con un client che ha i moduli (Claude Code): pannello sì, valutazione nel modulo.
    const sizes = agentSizes(found, undefined, { report: true, date });
    const repeated = seen.has(found.department.code) ? sizes.rules + sizes.library : 0;
    seen.add(found.department.code);
    return { id, sizes, total: total(sizes), repeated };
  });
}

function instructions(catalog: readonly SquadDepartment[], panel: boolean, ratings: boolean): string {
  const all: Found[] = catalog.flatMap((department) => department.agents.map((agent) => ({ department, agent })));
  return T.server.instructions({
    agents: all.length,
    departments: catalog.length,
    codes: catalog.map((d) => d.code).join(", "),
    example: promptName(all[0]!),
    exampleId: all[0]!.agent.id,
    panel,
    ratings,
  });
}

function section(lang: Lang, date: string): string {
  setLang(lang);
  const catalog = selectSquad(loadCatalog(lang));
  const out: string[] = [`## ${lang === "it" ? "Italiano" : "Inglese"}`];

  // Il caso più pesante, come la soglia dei 10 KB: resoconto e valutazione nel testo, nessun compito.
  const agents = catalog.flatMap((department) =>
    department.agents.map((agent) => ({ department, agent, sizes: agentSizes({ department, agent }, undefined, { ratings: true, report: true, date }) })),
  );
  out.push(
    "### Per agente (byte; resoconto e valutazione inclusi, senza compito)",
    table(
      ["Agente", "Totale", "~token", ...COMPONENTS.map((c) => LABELS[c])],
      agents.map(({ agent, sizes }) => [agent.id, total(sizes), tokens(total(sizes)), ...COMPONENTS.map((c) => sizes[c])]),
    ),
  );

  out.push(
    "### Per reparto (media sugli agenti)",
    table(
      ["Reparto", "Agenti", "Totale medio", "~token", "Regole comuni", "Quota delle regole", "Ruolo medio", "Biblioteca media"],
      catalog.map((d) => {
        const mine = agents.filter((a) => a.department.code === d.code);
        const avg = (pick: (s: Record<Component, number>) => number) => Math.round(sum(mine.map((a) => pick(a.sizes))) / mine.length);
        const mean = avg(total);
        return [d.code, mine.length, mean, tokens(mean), mine[0]!.sizes.rules, pct(mine[0]!.sizes.rules, mean), avg((s) => s.role), avg((s) => s.library)];
      }),
    ),
  );

  const flow = flowSizes(catalog, date);
  const flowTotal = sum(flow.map((f) => f.total));
  const repeated = sum(flow.map((f) => f.repeated));
  const list = Buffer.byteLength(agentList(catalog));
  const instr = Buffer.byteLength(instructions(catalog, true, true));
  out.push(
    "### Flusso di orchestrazione-newsletter (pannello sì, valutazione con il modulo, senza compito)",
    table(
      ["Testo", "Byte", "~token", ...COMPONENTS.map((c) => LABELS[c]), "Ripetuto"],
      [
        ["Istruzioni del server", instr, tokens(instr), ...COMPONENTS.map(() => ""), ""],
        ["list_agents", list, tokens(list), ...COMPONENTS.map(() => ""), ""],
        ...flow.map((f) => [`agent ${f.id}`, f.total, tokens(f.total), ...COMPONENTS.map((c) => f.sizes[c]), f.repeated]),
        [
          "**Totale**",
          instr + list + flowTotal,
          tokens(instr + list + flowTotal),
          ...COMPONENTS.map((c) => sum(flow.map((f) => f.sizes[c]))),
          repeated,
        ],
      ],
    ),
    `Testo degli agenti nel flusso: ${flowTotal} byte, di cui regole comuni ${sum(flow.map((f) => f.sizes.rules))} (${pct(sum(flow.map((f) => f.sizes.rules)), flowTotal)}) e ripetuti ${repeated} (${pct(repeated, flowTotal)}: regole e biblioteca di un reparto già caricato). Le schede lette con \`library\` dipendono dal modello e non sono contate.`,
  );

  const chars = (panel: boolean, ratings: boolean) => instructions(catalog, panel, ratings).length;
  out.push(
    "### Altri testi del server",
    table(
      ["Testo", "Byte", "~token", "Nota"],
      [
        ["Istruzioni, pannello e valutazioni", instr, tokens(instr), `${chars(true, true)} caratteri su 4096`],
        ["Istruzioni, senza pannello né valutazioni", Buffer.byteLength(instructions(catalog, false, false)), tokens(Buffer.byteLength(instructions(catalog, false, false))), `${chars(false, false)} caratteri su 4096`],
        ["list_agents, tutto il catalogo", list, tokens(list), `${catalog.length} reparti`],
        ...catalog.map((d) => {
          const bytes = Buffer.byteLength(agentList(catalog, d.code));
          return [`list_agents, ${d.code} (o squadra di un reparto)`, bytes, tokens(bytes), `${d.agents.length} agenti`];
        }),
      ],
    ),
    "### Schede della biblioteca (tool library, una scheda)",
    table(
      ["Reparto", "Schede", "Minimo", "Medio", "Massimo", "~token medi"],
      catalog.map((d) => {
        const bytes = d.library.map((card) => Buffer.byteLength(cardText(card, date)));
        const mean = bytes.length ? Math.round(sum(bytes) / bytes.length) : 0;
        return [d.code, bytes.length, bytes.length ? Math.min(...bytes) : 0, mean, bytes.length ? Math.max(...bytes) : 0, tokens(mean)];
      }),
    ),
  );
  return out.join("\n\n");
}

/** Il resoconto di --sizes: le stesse tabelle in italiano e in inglese, alla data `date`. */
export function sizesReport(date: string): string {
  const report = [
    `Misure del ${date} con \`npm run -s agent-text -- --sizes --date ${date}\`. Byte misurati (UTF-8); «~token» è una stima, byte / 4.`,
    section("it", date),
    section("en", date),
  ].join("\n\n");
  setLang("it");
  return report;
}
