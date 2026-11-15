import type { Department } from "@agentrica/catalog";
import { StarGlyph } from "@/components/star-glyph";
import { cn } from "@/lib/utils";

// Disposizione scelta dall'utente fra quattro provate (plan/07-identita.md): griglia a 6 colonne, fascia larga in basso.
// ponytail: posizioni per cinque reparti; con un reparto in più la griglia va ridisegnata.
const TILES = [
  "col-span-3 row-span-2",
  "col-span-3",
  "col-span-3 row-span-2",
  "col-span-3",
  "col-span-6",
];

/** I cinque direttori nella hero, da 1024 px. Decorativo rispetto ai link: i reparti sono raggiungibili da header e card. */
export function DirectorsMosaic({ departments, className }: { departments: readonly Department[]; className?: string }) {
  return (
    <ul
      aria-label="I direttori dei reparti"
      className={cn("grid grid-cols-6 grid-rows-[7.5rem_7.5rem_7.5rem_10.5rem] gap-3", className)}
    >
      {departments.map((d, index) => (
        <li
          key={d.code}
          data-dept={d.code}
          className={cn(
            "relative grid place-items-center overflow-hidden rounded-[0.9rem] border pt-2 pb-9 shadow-card bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--dept)_14%,var(--muted)),var(--muted))]",
            TILES[index],
          )}
        >
          <StarGlyph star={d.director.star} director className="h-full max-h-36 w-auto" />
          <p className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-card/90 px-2 py-1 font-mono text-[0.6875rem] font-bold whitespace-nowrap text-dept backdrop-blur-sm">
            <span aria-hidden className="size-1.5 rounded-full bg-dept" />
            {d.director.id} · {d.director.star}
          </p>
        </li>
      ))}
    </ul>
  );
}
