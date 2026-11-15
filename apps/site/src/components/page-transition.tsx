import { ViewTransition } from "react";

/**
 * Contenuto di una pagina che entra ed esce con la transizione `.page` di globals.css.
 * Va in ogni page.tsx, non nel layout: il layout resta fra le navigazioni e lì enter ed exit non scattano.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      {children}
    </ViewTransition>
  );
}
