import Link from "next/link";
import { loadCatalog } from "@agentrica/catalog";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { agentHref } from "@/components/department-card";
import { Markdown } from "@/components/markdown";
import { PageTransition } from "@/components/page-transition";
import { Portrait } from "@/components/portrait";
import { SiteFooter } from "@/components/site-footer";

const departments = loadCatalog();
const agents = departments.flatMap((department) => department.agents.map((agent) => ({ agent, department })));

// Solo i 56 agenti del catalogo: gli altri indirizzi danno 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return agents.map(({ agent }) => ({ id: agent.id.toLowerCase() }));
}

async function findAgent(params: PageProps<"/agenti/[id]">["params"]) {
  const { id } = await params;
  return agents.find(({ agent }) => agent.id.toLowerCase() === id) ?? notFound();
}

export async function generateMetadata(props: PageProps<"/agenti/[id]">): Promise<Metadata> {
  const { agent: a, department: d } = await findAgent(props.params);
  return {
    title: `${a.id} · ${a.star} · Agentrica`,
    description: `${a.role}, agente IA del reparto ${d.code} · ${d.name} di Agentrica.`,
  };
}

const navLink =
  "flex min-h-11 flex-col justify-center gap-0.5 rounded-xl border px-5 py-3 no-underline hover:border-dept";

export default async function AgentPage(props: PageProps<"/agenti/[id]">) {
  const { agent: a, department: d } = await findAgent(props.params);
  const prev = d.agents[a.number - 2];
  const next = d.agents[a.number];

  return (
    <PageTransition>
    <div data-dept={d.code}>
      <div className="page-intro wrap pt-10 pb-12">
        <Link
          href={`/reparti/${d.slug}`}
          className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden className="size-4" />
          {d.code} · {d.name}
        </Link>
        <div className="mt-8 grid items-start gap-8 sm:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
        <Portrait
          id={a.id}
          star={a.star}
          sizes="(min-width: 1024px) 18rem, (min-width: 640px) 13rem, 100vw"
          eager
          position="50% 25%"
          className="aspect-[4/5] max-w-72 rounded-2xl border shadow-card sm:max-w-none"
        />
        <div>
        <p className="font-mono text-sm font-bold tracking-wide text-dept">
          {a.id} · {a.number === 1 ? "Direttore" : "Specialista"}
        </p>
        <h1 className="mt-2 font-mono text-[clamp(2.25rem,1.4rem+4vw,3.75rem)] font-extrabold tracking-[-0.02em]">
          {a.star}
        </h1>
        <p className="mt-3 text-xl font-semibold">{a.role}</p>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          {a.star} è un agente IA del reparto {d.name}. Qui sotto c&apos;è il suo file di ruolo, così come è scritto: sono
          le istruzioni che lo guidano quando lavora.
        </p>
        </div>
        </div>
      </div>

      <main id="contenuto" className="wrap grid gap-16">
        <article aria-label={`File di ruolo di ${a.star}`} className="grid max-w-3xl gap-10">
          {a.intro && <Markdown text={a.intro} />}
          {a.sections.map((s) => (
            <section key={s.heading} className="min-w-0">
              <h2 className="mb-3 text-[1.375rem] font-semibold">{s.heading}</h2>
              <Markdown text={s.body} />
            </section>
          ))}
        </article>

        <nav aria-label={`Altri agenti di ${d.code}`} data-dept={d.code} className="band py-12">
          <ul className="grid gap-4 sm:grid-cols-2">
            {prev && (
              <li>
                <Link href={agentHref(prev.id)} className={navLink}>
                  <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground">
                    <ArrowLeftIcon aria-hidden className="size-4" />
                    Precedente
                  </span>
                  <span className="font-mono font-semibold tracking-wide text-dept">
                    {prev.id} · {prev.star}
                  </span>
                  <span className="text-[0.9375rem]">{prev.role}</span>
                </Link>
              </li>
            )}
            {next && (
              <li className="sm:col-start-2">
                <Link href={agentHref(next.id)} className={`${navLink} sm:text-right`}>
                  <span className="inline-flex items-center gap-1.5 self-start text-[0.8125rem] text-muted-foreground sm:self-end">
                    Successivo
                    <ArrowRightIcon aria-hidden className="size-4" />
                  </span>
                  <span className="font-mono font-semibold tracking-wide text-dept">
                    {next.id} · {next.star}
                  </span>
                  <span className="text-[0.9375rem]">{next.role}</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </main>

      <SiteFooter />
    </div>
    </PageTransition>
  );
}
