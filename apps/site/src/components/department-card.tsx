import Link from "next/link";
import type { Department } from "@agentrica/catalog";
import { ArrowRightIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AgentLine({ id, star, role }: { id: string; star: string; role: string }) {
  return (
    <p>
      <span className="block font-mono font-semibold tracking-wide text-dept">
        {id} · {star}
      </span>
      <span className="block text-[0.9375rem]">{role}</span>
    </p>
  );
}

export function DepartmentCard({ department: d }: { department: Department }) {
  const team = d.agents.slice(1);

  return (
    <article data-dept={d.code} aria-labelledby={`reparto-${d.code}`} className="flex">
      <Card className="w-full gap-4 border-t-[3px] border-t-dept p-6 text-base">
        <header className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1">
          <p className="col-span-full font-mono text-sm font-bold tracking-wide text-dept">{d.code}</p>
          <h3 id={`reparto-${d.code}`} className="text-[1.375rem] font-semibold">
            {d.name}
          </h3>
          <p className="text-[0.9375rem] whitespace-nowrap text-muted-foreground">{d.agents.length} agenti</p>
        </header>

        <p className="text-muted-foreground">{d.summary}</p>

        <Link
          href={`/reparti/${d.slug}`}
          className="inline-flex min-h-11 items-center gap-1.5 self-start font-semibold text-dept underline-offset-4 hover:underline"
        >
          Vai al reparto {d.code}
          <ArrowRightIcon aria-hidden className="size-4" />
        </Link>

        <div className="rounded-lg bg-muted px-4 py-3">
          <p className="text-[0.8125rem] text-muted-foreground">Direttore</p>
          <AgentLine id={d.director.id} star={d.director.star} role={d.director.role} />
        </div>

        <Collapsible className="mt-auto border-t pt-3">
          <CollapsibleTrigger className="group flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 text-left font-semibold">
            Gli altri {team.length} agenti
            <span className="grid size-7 place-items-center rounded-full border text-dept group-hover:border-dept">
              <PlusIcon aria-hidden className="size-4 group-data-[panel-open]:hidden" />
              <MinusIcon aria-hidden className="hidden size-4 group-data-[panel-open]:block" />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-2 grid gap-3">
              {team.map((a) => (
                <li key={a.id}>
                  <AgentLine id={a.id} star={a.star} role={a.role} />
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </article>
  );
}
