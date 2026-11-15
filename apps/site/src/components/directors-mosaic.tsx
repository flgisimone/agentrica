import type { Department } from "@agentrica/catalog";
import { Portrait } from "@/components/portrait";
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
          className={cn("relative overflow-hidden rounded-[0.9rem] border shadow-card", TILES[index])}
        >
          <Portrait
            id={d.director.id}
            star={d.director.star}
            sizes="(min-width: 1024px) 34rem, 1px"
            tag="short"
            eager
            position={index === TILES.length - 1 ? "50% 40%" : "50% 18%"}
            className="size-full"
          />
          <p className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-card/90 px-2 py-1 font-mono text-[0.6875rem] font-bold whitespace-nowrap text-dept backdrop-blur-sm">
            <span aria-hidden className="size-1.5 rounded-full bg-dept" />
            {d.director.id} · {d.director.star}
          </p>
        </li>
      ))}
    </ul>
  );
}
