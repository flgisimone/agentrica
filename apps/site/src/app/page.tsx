import Link from "next/link";
import { loadCatalog } from "@agentrica/catalog";
import type { Metadata } from "next";
import { DepartmentCard } from "@/components/department-card";
import { DirectorsMosaic } from "@/components/directors-mosaic";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { spanInRows } from "@/lib/grid";
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

const flow: { label: string; code?: string }[] = [
  { label: "Business", code: "AIBPD" },
  { label: "Design", code: "AIWDA" },
  { label: "Privacy", code: "AIPCA" },
  { label: "La tua conferma" },
  { label: "Software", code: "AISA" },
  { label: "Revisioni di design, privacy e codice" },
  { label: "La tua conferma" },
];

const sectionTitle = "mt-2 mb-4 text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] font-bold";
const lead = "max-w-2xl text-muted-foreground";
const pill = "rounded-lg h-12 px-6 text-base font-semibold";

export default function Home() {
  return (
    <PageTransition>
      <div className="hero wrap grid items-center gap-14 pt-20 pb-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:pt-24">
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
        <section id="reparti" aria-labelledby="reparti-titolo" className="wrap py-16">
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
          <ul className="mt-8 grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
            {principles.map((p) => (
              <li key={p.title}>
                <Card className="h-full gap-2 p-6 text-base">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="text-muted-foreground">{p.text}</p>
                </Card>
              </li>
            ))}
          </ul>

          <h3 className="mt-12 text-lg font-semibold">Una richiesta che coinvolge più reparti</h3>
          <ol className="mt-4 flex flex-wrap gap-2">
            {flow.map((step, index) => (
              <li
                key={index}
                data-dept={step.code}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-l-[3px] bg-card px-4 py-2 text-[0.9375rem]",
                  step.code ? "border-l-dept" : "border-l-foreground font-semibold",
                )}
              >
                <span className="font-mono text-[0.8125rem] text-muted-foreground">{index + 1}.</span>
                {step.code && <span className="font-mono text-[0.8125rem] font-bold text-dept">{step.code}</span>}
                <span>{step.label}</span>
              </li>
            ))}
          </ol>
          <p className={cn(lead, "mt-4 text-[0.9375rem]")}>
            I passaggi che non servono si saltano. La sicurezza (AICA) entra per gli audit e le nuove integrazioni.
          </p>
        </section>

        <section id="mcp" aria-labelledby="mcp-titolo" className="wrap py-16">
          <div className="rounded-xl border border-dashed bg-linear-135 from-aisa/6 to-aipca/6 p-8">
            <Badge variant="outline" className="border-aisa font-mono text-xs font-bold uppercase text-aisa">
              In sviluppo
            </Badge>
            <h2 id="mcp-titolo" className={sectionTitle}>
              Presto nei tuoi progetti
            </h2>
            <p className={lead}>
              Stiamo portando gli agenti di Agentrica in un server MCP: potrai chiamarli da Claude Code o da altri
              client compatibili, con gli stessi ruoli che vedi qui.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </PageTransition>
  );
}
