import Image from "next/image";
import { portraitSrc } from "@/lib/portraits";
import { cn } from "@/lib/utils";

const TAGS = { long: "Volto generato con IA", short: "Volto IA", mini: "IA" } as const;

/**
 * Ritratto di un agente: la foto, se c'è, con l'etichetta che dice che il volto è generato con IA (piano, «Volti»);
 * altrimenti un segnaposto con l'iniziale della stella. Il contenitore decide forma e dimensioni con `className`.
 */
export function Portrait({
  id,
  star,
  sizes,
  tag = "long",
  eager,
  position = "50% 22%",
  className,
}: {
  id: string;
  star: string;
  sizes: string;
  tag?: keyof typeof TAGS;
  eager?: boolean;
  position?: string;
  className?: string;
}) {
  const src = portraitSrc(id);

  if (!src) {
    return (
      <div
        aria-hidden
        className={cn(
          "grid place-items-center overflow-hidden border border-dashed border-dept/45 bg-[radial-gradient(circle_at_30%_25%,color-mix(in_srgb,var(--dept)_18%,var(--muted)),var(--muted))] font-mono font-bold text-dept",
          className,
        )}
      >
        <span className={tag === "mini" ? "text-lg" : "text-[clamp(2rem,6vw,4rem)]"}>{star[0]}</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={`Ritratto generato con IA di ${id} · ${star}`}
        fill
        sizes={sizes}
        loading={eager ? "eager" : undefined}
        className="object-cover"
        style={{ objectPosition: position }}
      />
      <span
        aria-hidden
        className={cn(
          "absolute rounded-md bg-[#0b0f18c4] font-semibold text-white backdrop-blur-sm",
          tag === "mini" ? "right-0.5 bottom-0.5 px-1 text-[0.625rem] leading-4" : "top-2.5 right-2.5 px-2 py-1 text-xs leading-none",
        )}
      >
        {TAGS[tag]}
      </span>
    </div>
  );
}
