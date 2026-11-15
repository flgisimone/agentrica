import Link from "next/link";
import type { Department } from "@agentrica/catalog";
import { ArrowRightIcon } from "lucide-react";
import { StarGlyph } from "@/components/star-glyph";
import { cn } from "@/lib/utils";

export const agentHref = (id: string) => `/agenti/${id.toLowerCase()}`;

/**
 * Nome in codice e ruolo. Con `link` il nome porta alla pagina dell'agente e copre l'intero contenitore,
 * che deve avere `relative` e `rounded-xl` (scheda tutta cliccabile, un solo link per la tastiera, focus sull'intera scheda).
 */
export function AgentLine({ id, star, role, link }: { id: string; star: string; role: string; link?: boolean }) {
  const name = `${id} · ${star}`;
  return (
    <p>
      <span className="block font-mono font-semibold tracking-wide text-dept">
        {link ? (
          <Link
            href={agentHref(id)}
            className="outline-none after:absolute after:inset-0 after:rounded-xl after:outline-offset-3 hover:underline focus-visible:after:outline-2 focus-visible:after:outline-ring"
          >
            {name}
          </Link>
        ) : (
          name
        )}
      </span>
      <span className="block text-[0.9375rem]">{role}</span>
    </p>
  );
}

/** Scheda di un reparto: il simbolo del direttore e i dati essenziali; la scheda intera porta alla pagina del reparto. */
export function DepartmentCard({ department: d, className }: { department: Department; className?: string }) {
  return (
    <article
      data-dept={d.code}
      aria-labelledby={`reparto-${d.code}`}
      className={cn(
        // L'anello del focus sta sulla scheda: sul link (dentro overflow-hidden) verrebbe tagliato.
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-[translate,border-color] duration-200 hover:-translate-y-1 hover:border-dept motion-reduce:transition-none has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-3 has-[a:focus-visible]:outline-ring",
        className,
      )}
    >
      <div className="grid h-56 place-items-center border-b-[3px] border-b-dept bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--dept)_14%,var(--muted)),var(--muted))]">
        <StarGlyph star={d.director.star} director className="size-40" />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-6">
        <p className="flex items-baseline justify-between gap-4">
          <span className="font-mono text-sm font-bold tracking-wide text-dept">{d.code}</span>
          <span className="text-[0.875rem] text-muted-foreground">{d.agents.length} agenti</span>
        </p>
        <h3 id={`reparto-${d.code}`} className="text-[1.375rem] font-bold">
          <Link
            href={`/reparti/${d.slug}`}
            aria-label={`Vai al reparto ${d.code} · ${d.name}`}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl"
          >
            {d.name}
          </Link>
        </h3>
        <p className="text-muted-foreground">{d.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-4 border-t pt-4 text-[0.9375rem]">
          <p>
            <span className="block text-[0.8125rem] text-muted-foreground">Direttore</span>
            <span className="block font-mono font-bold">
              {d.director.id} · {d.director.star}
            </span>
            <span className="block text-[0.875rem] text-muted-foreground">{d.director.role}</span>
          </p>
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full border text-dept transition-colors group-hover:bg-dept group-hover:text-card"
          >
            <ArrowRightIcon className="size-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
