import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { loadCatalog } from "../packages/catalog/src/index.ts";
import { expectFullRows } from "./grid.ts";

const departments = loadCatalog();

for (const d of departments) {
  test(`${d.code}: titolo, missione, squadra, flusso e regole dal catalogo`, async ({ page }) => {
    await page.goto(`/reparti/${d.slug}`);
    await expect(page).toHaveTitle(`${d.code} · ${d.name} · Agentrica`);
    await expect(page.getByRole("heading", { level: 1, name: d.name })).toBeVisible();
    await expect(page.locator(".page-intro")).toContainText(d.mission);
    for (const a of d.agents) await expect(page.getByRole("main")).toContainText(`${a.id} · ${a.star}`);
    const steps = d.workflow.split("\n").filter((line) => /^\d+\. /.test(line)).length;
    await expect(page.locator("section[aria-labelledby=flusso] ol > li")).toHaveCount(steps);
    await expectFullRows(page.locator("section[aria-labelledby=squadra] ul"));

    const rules = page.getByRole("button", { name: "Leggi le regole comuni" });
    await rules.click();
    for (const s of d.rules.sections) await expect(page.getByRole("heading", { level: 3, name: s.heading })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);

    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("dalla landing al reparto e agli altri reparti", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Vai al reparto AICA" }).click();
  await expect(page).toHaveURL(/\/reparti\/aica$/);
  await page.getByRole("navigation", { name: "Gli altri reparti" }).getByRole("link", { name: /AISA/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI Software");
  await page.getByRole("link", { name: "Tutti i reparti" }).click();
  await expect(page).toHaveURL(/\/#reparti$/);
});

test("il focus da tastiera contorna l'intera scheda dell'agente", async ({ page }) => {
  await page.goto("/reparti/aisa");
  const card = page.locator("section[aria-labelledby=squadra] li").first();
  await card.getByRole("link").focus();
  const ring = await card.getByRole("link").evaluate((link) => {
    const after = getComputedStyle(link, "::after");
    return { link: getComputedStyle(link).outlineStyle, style: after.outlineStyle, width: after.width, height: after.height };
  });
  const box = await card.evaluate((el) => ({ width: el.clientWidth, height: el.clientHeight }));
  expect(ring.link).toBe("none");
  expect(ring.style).toBe("solid");
  // Lo pseudo-elemento copre la scheda fino al bordo (clientWidth esclude il bordo di 1 px).
  expect(Math.abs(parseFloat(ring.width) - box.width)).toBeLessThan(1);
  expect(Math.abs(parseFloat(ring.height) - box.height)).toBeLessThan(1);
});

test("una sigla sconosciuta dà 404", async ({ page }) => {
  const response = await page.goto("/reparti/xyz");
  expect(response?.status()).toBe(404);
});
