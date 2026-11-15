// Griglie senza caselle vuote: 2 colonne sul tablet (md), 3 per riga sul computer (lg, su 6 colonne).
// L'ultima riga incompleta si allarga fino a riempire la riga, senza lasciare una scheda sola.

/** Classi di colonna per l'elemento `index` di `count`, in una griglia `md:grid-cols-2 lg:grid-cols-6`. */
export function spanInRows(index: number, count: number): string {
  const tablet = count % 2 === 1 && index === count - 1 ? "md:col-span-2" : "";
  // Sul computer le righe sono da 3; se ne avanza uno, le ultime quattro schede vanno 2 + 2 invece di 3 + 1.
  const rest = count % 3;
  const wide = rest === 1 && count >= 4 ? 4 : rest;
  const inWideRows = index >= count - wide;
  const desktop = !inWideRows ? "lg:col-span-2" : wide === 1 ? "lg:col-span-6" : "lg:col-span-3";
  return `${tablet} ${desktop}`.trim();
}
