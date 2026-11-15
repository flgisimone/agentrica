"use client";

import { useEffect, useRef, useState } from "react";
import { glyph } from "@/lib/glyph";
import { cn } from "@/lib/utils";

/**
 * Simbolo di un agente: la costellazione calcolata dal nome della stella, nell'accento del reparto (`data-dept` di un antenato).
 * I direttori hanno l'anello doppio. Decorativo: il nome in codice sta sempre accanto, quindi `aria-hidden`.
 * Quando entra nello schermo la linea si traccia e le stelle si accendono, poi brillano piano (stili `.glyph` in
 * globals.css); con «riduci movimento» il simbolo è fermo e completo.
 */
export function StarGlyph({ star, director, className }: { star: string; director?: boolean; className?: string }) {
  const { dots, line, extra } = glyph(star);
  const [main] = dots;
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setDrawn(true);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      data-star={star}
      data-draw={drawn ? "done" : "wait"}
      aria-hidden
      focusable="false"
      className={cn("glyph text-dept", className)}
    >
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.75">
        <polyline className="glyph-line" pathLength={1} points={line} />
        {extra && <line className="glyph-line" pathLength={1} x1={extra[0].x} y1={extra[0].y} x2={extra[1].x} y2={extra[1].y} />}
      </g>
      {main && <circle className="glyph-halo" cx={main.x} cy={main.y} r="6" fill="currentColor" opacity="0.25" />}
      <g fill="currentColor">
        {dots.map((d, i) => (
          <circle key={i} className="glyph-dot" style={{ "--i": i } as React.CSSProperties} cx={d.x} cy={d.y} r={d.r} />
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
