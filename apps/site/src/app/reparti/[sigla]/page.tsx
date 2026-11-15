import Link from "next/link";
import { loadCatalog } from "@agentrica/catalog";
import { ArrowLeftIcon, MinusIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentLine } from "@/components/department-card";
import { Markdown } from "@/components/markdown";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const departments = loadCatalog();

// Solo le cinque sigle del catalogo: le altre danno 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return departments.map((d) => ({ sigla: d.slug }));
}

async function findDepartment(params: PageProps<"/reparti/[sigla]">["params"]) {
  const { sigla } = await params;
  return departments.find((d) => d.slug === sigla) ?? notFound();
}

export async function generateMetadata(props: PageProps<"/reparti/[sigla]">): Promise<Metadata> {
  const d = await findDepartment(props.params);
  return { title: `${d.code} · ${d.name} · Agentrica`, description: d.mission };
}

const sectionTitle = "mb-4 text-[clamp(1.5rem,1.1rem+1.5vw,2rem)] font-bold";

export default async function DepartmentPage(props: PageProps<"/reparti/[sigla]">) {
  const d = await findDepartment(props.params);
  const team = d.agents.slice(1);
  const others = departments.filter((o) => o.code !== d.code);

  return (
    <div data-dept={d.code}>
      <header className="wrap pt-10 pb-12">
        <Link
          href="/#reparti"
          className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden className="size-4" />
          Tutti i reparti
        </Link>
        <p className="mt-8 font-mono text-sm font-bold tracking-wide text-dept">
          {d.code} · {d.agents.length} agenti
        </p>
        <h1 className="mt-2 text-[clamp(2.25rem,1.4rem+4vw,3.75rem)] font-extrabold tracking-[-0.03em]">{d.name}</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{d.mission}</p>
      </header>

      <main id="contenuto" className="wrap grid gap-16 pb-16">
        <section aria-labelledby="squadra">
          <h2 id="squadra" className={sectionTitle}>
            La squadra
          </h2>
          <Card className="gap-1 border-t-[3px] border-t-dept p-6 text-base">
            <p className="text-[0.8125rem] text-muted-foreground">Direttore</p>
            <AgentLine id={d.director.id} star={d.director.star} role={d.director.role} />
          </Card>
          <ul className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,17rem),1fr))]">
            {team.map((a) => (
              <li key={a.id} className="rounded-xl border bg-card p-5">
                <AgentLine id={a.id} star={a.star} role={a.role} />
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <section aria-labelledby="flusso">
            <h2 id="flusso" className={sectionTitle}>
              Flusso di lavoro
            </h2>
            <Markdown text={d.workflow} />
          </section>

          <section aria-labelledby="collaborazione">
            <h2 id="collaborazione" className={sectionTitle}>
              Con gli altri reparti
            </h2>
            <Markdown text={d.collaboration} />
          </section>
        </div>

        <section aria-labelledby="regole">
          <h2 id="regole" className={sectionTitle}>
            Regole comuni
          </h2>
          <p className="max-w-3xl text-muted-foreground">
            Le regole che valgono per tutti gli agenti di {d.code}, così come sono scritte nel loro file.
          </p>
          <Collapsible className="mt-4 rounded-xl border bg-card px-6 py-2">
            <CollapsibleTrigger className="group flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 text-left font-semibold">
              Leggi le regole comuni
              <span className="grid size-7 shrink-0 place-items-center rounded-full border text-dept group-hover:border-dept">
                <PlusIcon aria-hidden className="size-4 group-data-[panel-open]:hidden" />
                <MinusIcon aria-hidden className="hidden size-4 group-data-[panel-open]:block" />
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="min-w-0">
              <div className="grid gap-6 border-t py-4">
                {d.rules.intro && <Markdown text={d.rules.intro} />}
                {d.rules.sections.map((s) => (
                  <div key={s.heading} className="min-w-0">
                    <h3 className="mb-2 text-lg font-semibold">{s.heading}</h3>
                    <Markdown text={s.body} />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>

        <nav aria-labelledby="altri">
          <h2 id="altri" className={sectionTitle}>
            Gli altri reparti
          </h2>
          <ul className="flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.code} data-dept={o.code}>
                <Link
                  href={`/reparti/${o.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.9375rem] no-underline hover:border-dept"
                >
                  <span className="font-mono text-sm font-bold text-dept">{o.code}</span>
                  {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
