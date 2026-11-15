import { expect, type Locator } from "@playwright/test";

/** Le righe della griglia sono piene: in ogni riga gli elementi, con gli spazi fra loro, coprono tutta la larghezza. */
export async function expectFullRows(grid: Locator) {
  const result = await grid.evaluate((el) => {
    const width = el.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const rows = new Map<number, number[]>();
    for (const child of el.children) {
      const box = child.getBoundingClientRect();
      const top = Math.round(box.top);
      rows.set(top, [...(rows.get(top) ?? []), box.width]);
    }
    return [...rows.values()].map((widths) => widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1) - width);
  });
  for (const missing of result) expect(Math.abs(missing)).toBeLessThan(2);
}
