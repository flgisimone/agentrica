// Schermate del pannello locale per la pagina /pannello del sito (F47-02, script aggiunto dopo F48): un progetto di prova
// creato con `init`, il server di questo repository avviato con un client MCP vero, la pagina fotografata con Playwright.
// Uso: npm run -s panel-screenshots -- [--site ../aigentrica-site]
// Scrive <site>/src/assets/pannello/pannello-<vista>-<lingua>.png, sette viste per lingua. Playwright e il Chrome installato
// vengono dal repository del sito, come per i suoi e2e: qui non c'è una dipendenza in più.
// Tutto avviene in cartelle temporanee: HOME (configurazione di AIgentrica) e CLAUDE_CONFIG_DIR (file di sessione finti)
// non sono quelli dell'utente, e un `open` finto nel PATH impedisce al server di aprire il browser.
// ponytail: il comando finto è uno script sh, quindi lo script gira su macOS e Linux; su Windows serve un open.cmd.
import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { claudeProjectDir } from "../packages/mcp/src/usage.ts";

type Lang = "it" | "en";

// Le poche parti di Playwright che servono: i tipi stanno nel repository del sito.
// Solo locator: la CSP del pannello non ammette `unsafe-eval`, e un'attesa scritta come stringa non girerebbe.
interface Locator {
  filter(options: { hasText: RegExp }): Locator;
  waitFor(options: { state: "visible"; timeout: number }): Promise<void>;
  boundingBox(): Promise<{ height: number } | null>;
  click(): Promise<void>;
}
interface Page {
  goto(url: string): Promise<unknown>;
  locator(selector: string): Locator;
  waitForTimeout(ms: number): Promise<void>;
  screenshot(options: { path: string; clip?: { x: number; y: number; width: number; height: number } }): Promise<unknown>;
}
interface Browser {
  newPage(options: { viewport: { width: number; height: number }; colorScheme: "dark"; permissions: string[] }): Promise<Page>;
  close(): Promise<void>;
}
interface Playwright {
  chromium: { launch(options: { channel: string }): Promise<Browser> };
}

const { values } = parseArgs({ options: { site: { type: "string", default: join(import.meta.dirname, "..", "..", "aigentrica-site") } } });
const site = resolve(values.site);
const out = join(site, "src", "assets", "pannello");
const server = join(import.meta.dirname, "..", "packages", "mcp", "src", "server.ts");
const { chromium } = (await import(pathToFileURL(join(site, "node_modules", "playwright", "index.mjs")).href)) as Playwright;

/** I testi del progetto di prova in una lingua: piano, audit, compiti degli agenti, domanda. Nessun dato reale. */
function fixture(lang: Lang) {
  const it = lang === "it";
  const row = (id: string, task: string, priority: string) => `| ${id} | ${task} | ${priority} |`;
  const tasks = it
    ? [
        row("F1-01", "Schema dei prodotti e migrazione", "P1 — base del catalogo"),
        row("F1-02", "Pagina del catalogo con le schede", "P1"),
        row("F1-03", "Ricerca per nome e categoria", "P1"),
        row("F1-04", "Filtri per prezzo e disponibilità", "P2"),
        row("F1-05", "Pagina del prodotto", "P2"),
        row("F1-06", "e2e del catalogo a 390 px", "P1 — obbligatoria"),
      ]
    : [
        row("F1-01", "Product schema and migration", "P1 — base of the catalog"),
        row("F1-02", "Catalog page with product cards", "P1"),
        row("F1-03", "Search by name and category", "P1"),
        row("F1-04", "Filters for price and availability", "P2"),
        row("F1-05", "Product page", "P2"),
        row("F1-06", "e2e of the catalog at 390 px", "P1 — required"),
      ];
  const phase = (title: string, goal: string, backlog: string[], extra = "") =>
    `# ${title}\n\n**${it ? "Obiettivo" : "Goal"}**: ${goal}\n\n## Backlog\n\n| ID | ${it ? "Attività | Priorità" : "Task | Priority"} |\n|---|---|---|\n${backlog.join("\n")}\n${extra}`;
  const name = it ? "negozio-online" : "online-shop";
  const [f0, f1, f2] = it ? ["00-base.md", "01-catalogo.md", "02-carrello.md"] : ["00-base.md", "01-catalog.md", "02-cart.md"];
  return {
    name,
    phaseFile: f1,
    tasks,
    files: {
      "plan/README.md": it
        ? `# Piano di ${name}\n\n## Fasi\n\n| Fase | File | Contenuto | Stato |\n|---|---|---|---|\n| F0 | [${f0}](${f0}) | Base tecnica | completata |\n| F1 | [${f1}](${f1}) | Catalogo dei prodotti | in corso |\n| F2 | [${f2}](${f2}) | Carrello e ordine | da fare |\n`
        : `# Plan of ${name}\n\n## Phases\n\n| Phase | File | Content | Status |\n|---|---|---|---|\n| F0 | [${f0}](${f0}) | Technical base | completed |\n| F1 | [${f1}](${f1}) | Product catalog | in progress |\n| F2 | [${f2}](${f2}) | Cart and order | to do |\n`,
      [`plan/${f0}`]: phase(it ? "F0 — Base tecnica" : "F0 — Technical base", it ? "stack, test e CI pronti." : "stack, tests and CI ready.", [row("F0-01", it ? "Stack e struttura" : "Stack and structure", "P1")], `\n## ${it ? "Fatto" : "Done"}\n\n- **F0-01** ${it ? "fatto" : "done"}.\n`),
      [`plan/${f1}`]: phase(
        it ? "F1 — Catalogo dei prodotti" : "F1 — Product catalog",
        it ? "chi visita il negozio trova un prodotto in pochi secondi." : "a visitor finds a product in a few seconds.",
        tasks,
        it
          ? "\n## Criteri di accettazione\n\n- La ricerca risponde in meno di 300 ms su 1000 prodotti.\n- Catalogo usabile da tastiera e a 390 px.\n\n## Fatto\n\n- **F1-01** Schema e migrazione.\n- **F1-02** Pagina del catalogo.\n- **F1-03** Ricerca.\n\n## Rilievi aperti\n\n- P2: AISA, la ricerca non ignora gli accenti («caffe» non trova «caffè»).\n- P3: le immagini dei prodotti non hanno ancora la versione per lo schermo piccolo.\n"
          : "\n## Acceptance criteria\n\n- Search answers in less than 300 ms on 1000 products.\n- Catalog usable by keyboard and at 390 px.\n\n## Done\n\n- **F1-01** Schema and migration.\n- **F1-02** Catalog page.\n- **F1-03** Search.\n\n## Open findings\n\n- P2: AISA, search does not ignore accents («cafe» does not find «café»).\n- P3: product images have no small screen version yet.\n",
      ),
      [`plan/${f2}`]: phase(it ? "F2 — Carrello e ordine" : "F2 — Cart and order", it ? "un ordine in tre passi." : "an order in three steps.", [row("F2-01", it ? "Carrello" : "Cart", "P1")]),
      "audit/2026-11-20-catalogo/design-ux-designer.json": `${JSON.stringify(
        {
          agent: "AIWDA-03",
          findings: [
            { id: "F1-UX-01", title: it ? "I filtri non mostrano quanti prodotti restano" : "Filters do not show how many products are left", priority: "P1", status: it ? "aperto" : "open", evidence: "catalogo, 1280 px" },
            { id: "F1-UX-02", title: it ? "Il pulsante «Svuota» è poco visibile" : "The «Clear» button is hard to see", priority: "P3", status: it ? "aperto" : "open", evidence: "catalogo, 390 px" },
          ],
        },
        null,
        2,
      )}\n`,
    },
    agents: it
      ? [
          ["AISA-01", "Apri la fase F1, catalogo dei prodotti"],
          ["AISA-02", "Schema dei prodotti e ricerca"],
          ["AISA-05", "Pagina del catalogo e ricerca"],
          ["AIWDA-03", "Revisione del catalogo"],
        ]
      : [
          ["AISA-01", "Open phase F1, product catalog"],
          ["AISA-02", "Product schema and search"],
          ["AISA-05", "Catalog page and search"],
          ["AIWDA-03", "Catalog review"],
        ],
    report: it
      ? "Esito: fatto. Rilievi: nessuno nuovo, evidenza nei test. Domande aperte: nessuna."
      : "Outcome: done. Findings: none new, evidence in the tests. Open questions: none.",
    question: it
      ? {
          header: "Filtri",
          question: "I filtri per prezzo e disponibilità (F1-04) vanno in questa fase o nella F2?",
          options: [
            { label: "In F1 (Consigliata)", description: "Il rilievo UX P1 riguarda proprio i filtri: si chiude con il catalogo." },
            { label: "In F2", description: "F1 si chiude prima; i filtri arrivano con il carrello." },
          ],
        }
      : {
          header: "Filters",
          question: "Do the price and availability filters (F1-04) go in this phase or in F2?",
          options: [
            { label: "In F1 (Recommended)", description: "The UX P1 finding is about the filters: it closes with the catalog." },
            { label: "In F2", description: "F1 closes first; the filters come with the cart." },
          ],
        },
    subagent: it ? "Test del catalogo" : "Catalog tests",
  };
}

const usage = { input_tokens: 50, output_tokens: 1500, cache_read_input_tokens: 52_000, cache_creation_input_tokens: 3000 };
const reply = (id: string, model: string, timestamp: string) => JSON.stringify({ type: "assistant", requestId: id, timestamp, message: { id: `msg_${id}`, model, content: [], usage } });
const SUBAGENT_SESSION = "00000003-0000-4000-8000-000000000000";

/** File di sessione finti di Claude Code: solo conteggi di token, modello e giorno, come quelli veri. */
function writeSessions(dir: string) {
  mkdirSync(dir, { recursive: true });
  const at = (day: number, i: number) => `2026-11-${day}T${String(9 + (i % 10)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}:00.000Z`;
  [18, 19, 20, 21].forEach((day, s) => {
    const lines = Array.from({ length: 86 }, (_, i) => reply(`req_${day}_${i}`, day > 18 && i % 4 === 0 ? "claude-sonnet-5-5" : "claude-opus-5-5", at(day, i)));
    writeFileSync(join(dir, `0000000${s}-0000-4000-8000-000000000000.jsonl`), `${lines.join("\n")}\n`);
  });
}

/** Un subagent finito: il pannello mostra solo quelli avviati dopo il server, quindi si scrive dopo la connessione. */
function writeSubagent(dir: string, description: string) {
  const sub = join(dir, SUBAGENT_SESSION, "subagents");
  mkdirSync(sub, { recursive: true });
  writeFileSync(join(sub, "agent-q1.jsonl"), `${reply("req_sub", "claude-haiku-5-5", new Date().toISOString())}\n`);
  writeFileSync(join(sub, "agent-q1.meta.json"), JSON.stringify({ agentType: "sw-qa-engineer", description, finished: true }));
}

async function shoot(lang: Lang, browser: Browser) {
  const tmp = realpathSync(mkdtempSync(join(tmpdir(), "aigentrica-shots-")));
  try {
    const home = join(tmp, "home");
    const bin = join(tmp, "bin");
    const f = fixture(lang);
    const project = join(tmp, f.name);
    mkdirSync(home);
    mkdirSync(bin);
    mkdirSync(project);
    for (const name of ["open", "xdg-open"]) {
      writeFileSync(join(bin, name), "#!/bin/sh\nexit 0\n");
      chmodSync(join(bin, name), 0o755);
    }
    const env = { ...process.env, HOME: home, CLAUDE_CONFIG_DIR: join(tmp, "claude"), PATH: `${bin}${delimiter}${process.env.PATH ?? ""}` } as Record<string, string>;
    execFileSync(process.execPath, [server, "init", "--name", f.name, "--lang", lang], { cwd: project, env, stdio: "ignore" });
    rmSync(join(project, "plan"), { recursive: true, force: true });
    for (const [path, text] of Object.entries(f.files)) {
      mkdirSync(join(project, path, ".."), { recursive: true });
      writeFileSync(join(project, path), text);
    }
    execFileSync("git", ["add", "-A"], { cwd: project, env });
    execFileSync("git", ["-c", "user.name=prova", "-c", "user.email=prova@example.invalid", "commit", "-qm", "piano"], { cwd: project, env });
    writeSessions(claudeProjectDir(project, env));

    const client = new Client({ name: "panel-screenshots", version: "1.0.0" });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [server, "--lang", lang, "--no-update-check"], cwd: project, env, stderr: "ignore" }));
    try {
      const opened = (await client.callTool({ name: "open_panel", arguments: {} })) as { content: { text: string }[] };
      const url = /https?:\/\/127\.0\.0\.1:\d+\/\S*/.exec(opened.content[0]!.text)?.[0];
      if (!url) throw new Error("URL del pannello non trovato");
      const base = new URL(url).origin;
      writeSubagent(claudeProjectDir(project, env), f.subagent);
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: "dark", permissions: ["notifications"] });
      await page.goto(url);
      for (const [i, [id, task]] of f.agents.entries()) {
        await client.callTool({ name: "agent", arguments: { id, task } });
        if (i < f.agents.length - 1) await client.callTool({ name: "report", arguments: { id, summary: f.report } });
      }
      // La domanda resta aperta: il client la aspetta finché non si chiude, e la pagina la mostra in Sessione.
      void client.callTool({ name: "ask_user", arguments: f.question }, undefined, { timeout: 600_000 }).catch(() => {});

      const view = async (hash: string) => {
        await page.goto(`${base}/#${hash}`);
        await page.locator("#count-agents").filter({ hasText: /^4$/ }).waitFor({ state: "visible", timeout: 20_000 });
        await page.waitForTimeout(1500);
      };
      const save = async (name: string, maxHeight = 800) => {
        const height = Math.min(maxHeight, Math.ceil((await page.locator("body").boundingBox())?.height ?? maxHeight));
        await page.screenshot({ path: join(out, `pannello-${name}-${lang}.png`), clip: { x: 0, y: 0, width: 1280, height } });
      };
      for (const [hash, name] of [["session", "session"], ["agents", "agents"], ["plan", "plan"], ["findings", "findings"], ["usage", "usage"]] as const) {
        await view(hash);
        await save(name);
      }
      // La mappa a corsie della pagina Agenti (F52-03).
      await view("agents/map");
      await save("agents-map", 520);
      // Avvisi: un id doppio nel backlog, come un errore di formato vero; il pannello lo mostra sopra la vista.
      const phaseFile = join(project, "plan", f.phaseFile);
      writeFileSync(phaseFile, readFileSync(phaseFile, "utf8").replace(f.tasks[3]!, `${f.tasks[3]!}\n${f.tasks[3]!}`));
      await view("plan");
      await page.locator("#alerts").waitFor({ state: "visible", timeout: 20_000 });
      await page.locator("#alerts summary").click();
      await save("avvisi", 520);
    } finally {
      await client.close();
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const lang of ["it", "en"] as const) await shoot(lang, browser);
} finally {
  await browser.close();
}
console.log(`Schermate in ${out}`);
