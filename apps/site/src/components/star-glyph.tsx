import { glyph } from "@/lib/glyph";
import { cn } from "@/lib/utils";

/**
 * Simbolo di un agente: la costellazione calcolata dal nome della stella, nell'accento del reparto (`data-dept` di un antenato).
 * I direttori hanno l'anello doppio. Decorativo: il nome in codice sta sempre accanto, quindi `aria-hidden`.
 */
export function StarGlyph({ star, director, className }: { star: string; director?: boolean; className?: string }) {
  const { dots, line, extra } = glyph(star);
  const [main] = dots;

  return (
    <svg viewBox="0 0 100 100" data-star={star} aria-hidden focusable="false" className={cn("text-dept", className)}>
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.75">
        <polyline points={line} />
        {extra && <line x1={extra[0].x} y1={extra[0].y} x2={extra[1].x} y2={extra[1].y} />}
      </g>
      {main && <circle cx={main.x} cy={main.y} r="6" fill="currentColor" opacity="0.25" />}
      <g fill="currentColor">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} />
        ))}
      </g>
      {director && (
        <g fill="none" stroke="currentColor">
          <circle cx="50" cy="50" r="47" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="43" strokeWidth="0.8" opacity="0.6" />
        </g>
      )}
    </svg>
  );
}
