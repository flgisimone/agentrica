import Link from "next/link";
import { loadCatalog } from "@agentrica/catalog";
import type { Metadata } from "next";
import { DepartmentCard } from "@/components/department-card";
import { DirectorsMosaic } from "@/components/directors-mosaic";
import { PageTransition } from "@/components/page-transition";
import { Simulation } from "@/components/simulation";
import { SiteFooter } from "@/components/site-footer";
import { Terminal } from "@/components/terminal";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { spanInRows } from "@/lib/grid";
import { flowNodes, mcp, mcpDemoScript, simulationScript } from "@/lib/scripts";
import { cn } from "@/lib/utils";

const departments = loadCatalog();
const total = departments.reduce((sum, d) => sum + d.agents.length, 0);

export const metadata: Metadata = {
  description: `Agentrica è una società fittizia di consulenza agentica: ${departments.length} reparti e ${total} agenti specializzati in business, design, privacy, software e sicurezza.`,
};

const principles = [
  {
    title: "Su richiesta",
    text: "Nessun agente parte senza un'attività che lo richieda. Agentrica non è un sistema sempre acceso.",
  },
  {
    title: "Solo gli specialisti che servono",
    text: "Per ogni attività si sceglie il reparto e, al suo interno, i soli agenti pertinenti. Mai tutti insieme.",
  },
  {
    title: "Decidi tu",
    text: "Ogni conclusione di un agente è una proposta: priorità, requisiti, scelte tecniche e rilasci passano dalla tua conferma.",
  },
];

const simulation = simulationScript(departments);
const mcpDemo = mcpDemoScript(departments);

const limits = [
  "Gira solo sul tuo computer: lo avvia il client e i due parlano con stdio.",
  "Legge solo i file di agents/ del pacchetto. Non scrive file, non apre connessioni, nessuna telemetria.",
  "Il compito e i file del progetto vanno al fornitore del modello attraverso il tuo client, non ad Agentrica.",
  "Gli agenti sono IA: le loro conclusioni sono proposte da verificare.",
];

// Prove del 2026-11-15 (examples/risultati/): numeri veri, da aggiornare solo con una nuova esecuzione.
const trials = [
  { agent: "AISA-09 · REGULUS", role: "Application Security", project: "API REST in Node", found: "6 su 6", falsePositives: 0, extra: 2 },
  { agent: "AIWDA-08 · GACRUX", role: "Accessibility", project: "Form di iscrizione", found: "8 su 8", falsePositives: 0, extra: 2 },
  { agent: "AIPCA-02 · ALIOTH", role: "GDPR", project: "Prenotazioni di una palestra", found: "7 su 7", falsePositives: 0, extra: 3 },
];

const sectionTitle = "mt-2 mb-4 text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] font-bold";
const lead = "max-w-2xl text-muted-foreground";
const pill = "rounded-lg h-12 px-6 text-base font-semibold";

export default function Home() {
  return (
    <PageTransition>
      <div className="hero wrap grid items-center gap-14 pt-20 pb-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div>
          {/* A capo solo fra i segmenti, mai dentro «56 agenti IA». */}
          <p className="eyebrow">
            <span className="whitespace-nowrap">Consulenza digitale</span> ·{" "}
            <span className="whitespace-nowrap">{departments.length} reparti</span> ·{" "}
            <span className="whitespace-nowrap">{total} agenti IA</span>
          </p>
          <h1 className="mt-4 text-[clamp(2.75rem,1.4rem+5vw,4.75rem)] font-extrabold tracking-[-0.045em]">Agentrica</h1>
          <p className="mt-1 text-[clamp(1.75rem,1rem+3vw,3rem)] leading-[1.1] font-extrabold tracking-[-0.035em] text-muted-foreground">
            Consulenza agentica, con te al comando.
          </p>
          <p className={cn(lead, "mt-4 text-lg")}>
            Business, design, privacy, software e sicurezza: {total} specialisti con un ruolo, un metodo e dei limiti
            dichiarati. Li attivi quando servono, decidi tu ogni passo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#reparti" className={cn(buttonVariants(), pill)}>
              Scopri i reparti
            </a>
            <a href="#metodo" className={cn(buttonVariants({ variant: "outline" }), pill)}>
              Come lavoriamo
            </a>
          </div>
          {/* Sotto i 1024 px, al posto del mosaico dei direttori: scorciatoie ai reparti. */}
          <ul aria-label="I reparti" className="mt-12 flex flex-wrap gap-2 lg:hidden">
            {departments.map((d) => (
              <li key={d.code} data-dept={d.code}>
                <Link
                  href={`/reparti/${d.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-mono text-sm font-bold text-dept no-underline hover:border-dept"
                >
                  <span aria-hidden className="size-2 rounded-full bg-dept" />
                  {d.code}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <DirectorsMosaic departments={departments} className="hidden lg:grid" />
      </div>

      <main id="contenuto">
        <section id="reparti" aria-labelledby="reparti-titolo" className="wrap band py-16">
          <p className="eyebrow">I reparti</p>
          <h2 id="reparti-titolo" className={sectionTitle}>
            Cinque competenze, un&apos;unica squadra
          </h2>
          <p className={lead}>
            Ogni reparto ha un direttore che coordina e specialisti con un compito preciso. Ogni agente ha un nome in
            codice di stella: la sigla del reparto, il suo numero e una stella.
          </p>
          {/* Cinque schede: 2 + 2 + 1 larga sul tablet, 3 + 2 sul computer, senza caselle vuote. */}
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
            {departments.map((d, index) => (
              <DepartmentCard key={d.code} department={d} className={spanInRows(index, departments.length)} />
            ))}
          </div>
        </section>

        <section id="metodo" aria-labelledby="metodo-titolo" className="wrap py-16">
          <p className="eyebrow">Come lavoriamo</p>
          <h2 id="metodo-titolo" className={sectionTitle}>
            Pochi agenti alla volta, con te al comando
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {principles.map((p) => (
              <li key={p.title}>
                <Card className="h-full gap-2 p-6 text-base">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="text-muted-foreground">{p.text}</p>
                </Card>
              </li>
            ))}
          </ul>

          <h3 className="mt-12 text-lg font-semibold">Una richiesta, dall&apos;idea al merge</h3>
          <p className={cn(lead, "mt-2 text-[0.9375rem]")}>
            Simulazione di un compito vero di questo sito, i simboli degli agenti: i passi e i comandi sono quelli del
            metodo, il testo degli agenti è abbreviato. I passaggi che non servono si saltano; la sicurezza (AICA) entra
            per gli audit e le nuove integrazioni.
          </p>
          <Simulation nodes={flowNodes} lines={simulation} />
        </section>

        <section id="mcp" aria-labelledby="mcp-titolo" className="wrap band py-16">
          <Badge variant="outline" className="border-aisa font-mono text-xs font-bold uppercase text-aisa">
            Pacchetto npm
          </Badge>
          <h2 id="mcp-titolo" className={sectionTitle}>
            Gli agenti nei tuoi progetti
          </h2>
          <p className={lead}>
            Il server MCP di Agentrica porta i {total} agenti in Claude Code e negli altri client MCP: ogni agente è un
            prompt con il suo id, e due tool aiutano il modello a sceglierlo. Si installa da npm con un comando.
          </p>
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
            <Terminal lines={mcpDemo} title="il tuo progetto" label="Dimostrazione" />
            <ol className="grid gap-6">
              <li>
                <h3 className="font-semibold">1. Aggiungilo a Claude Code</h3>
                <p className="text-[0.9375rem] text-muted-foreground">
                  Dalla cartella del tuo progetto; serve Node 22 o successivo. Al primo avvio npx scarica il pacchetto,
                  alla versione indicata. Gli altri client e l&apos;avvio con i permessi minimi di Node sono nel{" "}
                  <a href="https://www.npmjs.com/package/@agentrica/mcp" className="underline">
                    README del pacchetto
                  </a>
                  .
                </p>
                <CodeBlock lines={[mcp.add]} />
              </li>
              <li>
                <h3 className="font-semibold">2. Se vuoi, scegli la squadra</h3>
                <p className="text-[0.9375rem] text-muted-foreground">
                  Con <code className="font-mono text-[0.875rem]">--agents</code> carichi solo gli agenti che ti servono:
                  id di agenti o reparti interi, separati da virgole. Nel menu dei comandi restano solo quelli, e i tool
                  vedono solo la squadra.
                </p>
                <CodeBlock lines={[mcp.squad]} />
              </li>
              <li>
                <h3 className="font-semibold">3. Chiama un agente</h3>
                <p className="text-[0.9375rem] text-muted-foreground">
                  Con il suo prompt, il compito fra virgolette, oppure chiedi al modello di usare i tool{" "}
                  <code className="font-mono text-[0.875rem]">elenca_agenti</code> e{" "}
                  <code className="font-mono text-[0.875rem]">agente</code>.
                </p>
                <CodeBlock lines={[mcp.use]} />
              </li>
              <li>
                <h3 className="font-semibold">4. Se vuoi, segui il lavoro da una pagina</h3>
                <p className="text-[0.9375rem] text-muted-foreground">
                  Con <code className="font-mono text-[0.875rem]">--panel</code> il server apre sul tuo computer una
                  pagina con fasi, backlog e rilievi del progetto, gli agenti in uso e le scelte che l&apos;agente ti chiede:
                  rispondi da lì invece che nel terminale. Niente account, nessun dato fuori dal computer.
                </p>
                <CodeBlock lines={[mcp.panel]} />
              </li>
            </ol>
          </div>
          <h3 className="mt-10 text-lg font-semibold">Cosa fa e cosa non fa</h3>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {limits.map((text) => (
              <li key={text} className="flex gap-3 text-[0.9375rem]">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-aisa" />
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ul>
          <h3 id="prove-titolo" className="mt-10 text-lg font-semibold">
            Messi alla prova
          </h3>
          <p className={cn(lead, "mt-2 text-[0.9375rem]")}>
            Tre agenti su tre piccoli progetti con difetti piantati e documentati, il 2026-11-15, con la versione 0.2.0,
            Claude Code e Opus 5.5. Un&apos;esecuzione per caso, contata a mano: i difetti sono pochi ed evidenti, e il
            risultato non dice come va un agente su un progetto grande. Progetti, rapporti completi e regole di conteggio
            sono nella cartella{" "}
            <a href="https://github.com/flgisimone/agentrica/tree/main/examples" className="underline">
              examples del repository
            </a>
            .
          </p>
          {/* Sul telefono la tabella scorre: la regione si raggiunge con Tab per scorrerla da tastiera. */}
          <div role="region" aria-labelledby="prove-titolo" tabIndex={0} className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-[0.9375rem]">
              <thead className="bg-card text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Agente</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Progetto</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Difetti trovati</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Rilievi falsi</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Altri rilievi validi</th>
                </tr>
              </thead>
              <tbody>
                {trials.map((t) => (
                  <tr key={t.agent} className="border-t">
                    <th scope="row" className="px-4 py-3 font-normal">
                      <span className="block font-mono text-[0.8125rem] font-bold whitespace-nowrap">{t.agent}</span>
                      <span className="text-muted-foreground">{t.role}</span>
                    </th>
                    <td className="px-4 py-3">{t.project}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{t.found}</td>
                    <td className="px-4 py-3">{t.falsePositives}</td>
                    <td className="px-4 py-3">{t.extra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <SiteFooter />
    </PageTransition>
  );
}

function CodeBlock({ lines }: { lines: readonly string[] }) {
  return (
    <pre className="mt-2 rounded-lg border bg-card px-4 py-3 font-mono text-[0.8125rem] leading-6 whitespace-pre-wrap wrap-anywhere">
      <code>{lines.join("\n")}</code>
    </pre>
  );
}
