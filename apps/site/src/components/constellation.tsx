import Link from "next/link";
import type { Department, DepartmentCode } from "@agentrica/catalog";
import { cn } from "@/lib/utils";

// Una stella per reparto, in percentuale del riquadro quadrato; `left` mette l'etichetta a sinistra della stella.
// ponytail: posizioni scritte a mano per i cinque reparti; un reparto nuovo va aggiunto qui.
const STARS: Record<DepartmentCode, { x: number; y: number; left?: boolean }> = {
  AIBPD: { x: 12, y: 20 },
  AIWDA: { x: 30, y: 58 },
  AIPCA: { x: 58, y: 30 },
  AISA: { x: 86, y: 62, left: true },
  AICA: { x: 56, y: 86 },
};

// Le linee seguono il flusso di lavoro (business → design → privacy → software); la sicurezza sta fra privacy e software.
const LINES: [DepartmentCode, DepartmentCode][] = [
  ["AIBPD", "AIWDA"],
  ["AIWDA", "AIPCA"],
  ["AIPCA", "AISA"],
  ["AISA", "AICA"],
  ["AICA", "AIPCA"],
];

/** Costellazione dei reparti nella hero, da 1024 px: ogni stella porta alla pagina del suo reparto. */
export function Constellation({ departments, className }: { departments: readonly Department[]; className?: string }) {
  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full text-foreground/20"
      >
        {LINES.map(([a, b]) => (
          <line
            key={a + b}
            x1={STARS[a].x}
            y1={STARS[a].y}
            x2={STARS[b].x}
            y2={STARS[b].y}
            stroke="currentColor"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <ul aria-label="I reparti">
        {departments.map((d) => {
          const star = STARS[d.code];
          // Il centro della stella (riquadro di 2,5 rem) cade sul punto.
          const side = star.left ? { right: `calc(${100 - star.x}% - 1.25rem)` } : { left: `calc(${star.x}% - 1.25rem)` };
          return (
            <li key={d.code} data-dept={d.code} className="absolute -translate-y-1/2" style={{ ...side, top: `${star.y}%` }}>
              <Link
                href={`/reparti/${d.slug}`}
                className={cn(
                  "group flex min-h-11 items-center gap-3 rounded-full no-underline",
                  star.left && "flex-row-reverse text-right",
                )}
              >
                <span aria-hidden className="grid size-10 place-items-center">
                  <span className="size-3.5 rounded-full bg-dept shadow-[0_0_0_6px_color-mix(in_oklab,var(--dept)_18%,transparent),0_0_24px_var(--dept)] transition-transform group-hover:scale-125" />
                </span>
                <span className="grid">
                  <span className="font-mono text-sm font-bold tracking-wide text-dept group-hover:underline">
                    {d.code}
                  </span>
                  <span className="sr-only">{d.name},</span>
                  <span className="text-[0.8125rem] text-muted-foreground">{d.agents.length} agenti</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
