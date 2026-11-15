// Griglie senza caselle vuote: 2 colonne sul tablet (md), 3 per riga sul computer (lg, su 6 colonne).
// L'ultima riga incompleta si allarga fino a riempire la riga.

/** Classi di colonna per l'elemento `index` di `count`, in una griglia `md:grid-cols-2 lg:grid-cols-6`. */
export function spanInRows(index: number, count: number): string {
  const tablet = count % 2 === 1 && index === count - 1 ? "md:col-span-2" : "";
  const rest = count % 3;
  const inLastRow = rest > 0 && index >= count - rest;
  // ponytail: con un solo elemento nell'ultima riga resta una scheda sola, larga; oggi non capita (5, 9 e 11 elementi).
  const desktop = !inLastRow ? "lg:col-span-2" : rest === 2 ? "lg:col-span-3" : "lg:col-span-6";
  return `${tablet} ${desktop}`.trim();
}
