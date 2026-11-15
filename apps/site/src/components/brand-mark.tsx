/** Colori del marchio: gli stessi di --primary e --background in globals.css. Espliciti perché il simbolo serve anche fuori dal CSS (ImageResponse). */
export const brand = { light: "#e8ebf4", night: "#0b1020" } as const;

/**
 * Marchio di Agentrica: tre stelle unite in costellazione su un quadrato chiaro. Tratti spessi perché resti leggibile a 16 px.
 * Stessa geometria di src/app/icon.svg: se cambia qui, va cambiata anche lì.
 */
export function BrandMark({ size, className }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 32 32" width={size} height={size} className={className}>
      <rect width="32" height="32" rx="8" fill={brand.light} />
      <g fill={brand.night} stroke={brand.night} strokeWidth="2.2" strokeLinecap="round">
        <line x1="9" y1="22" x2="16" y2="9" />
        <line x1="16" y1="9" x2="23" y2="20" />
        <line x1="9" y1="22" x2="23" y2="20" opacity=".45" />
        <circle cx="9" cy="22" r="3" stroke="none" />
        <circle cx="16" cy="9" r="3" stroke="none" />
        <circle cx="23" cy="20" r="3" stroke="none" />
      </g>
    </svg>
  );
}
