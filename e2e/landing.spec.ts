import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { loadCatalog } from "../packages/catalog/src/index.ts";
import { expectFullRows } from "./grid.ts";

const departments = loadCatalog();
const total = departments.reduce((sum, d) => sum + d.agents.length, 0);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("presenta Agentrica con i numeri del catalogo", async ({ page }) => {
  await expect(page).toHaveTitle(/Agentrica/);
  await expect(page.getByRole("heading", { level: 1, name: "Agentrica" })).toBeVisible();
  await expect(page.locator(".hero")).toContainText(`${departments.length} reparti`);
  await expect(page.locator(".hero")).toContainText(`${total} agenti IA`);
  // Ogni segmento della riga sopra il titolo sta su una riga sola, anche a 360 px.
  for (const segment of await page.locator(".hero .eyebrow > span").all()) {
    const lines = await segment.evaluate((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
    expect(lines, await segment.innerText()).toBeLessThan(1.5);
  }
});

test("mostra i cinque reparti con direttore e agenti", async ({ page }) => {
  for (const d of departments) {
    const card = page.locator(`article[data-dept="${d.code}"]`);
    await expect(card.getByRole("heading", { name: d.name })).toBeVisible();
    await expect(card).toContainText(`${d.agents.length} agenti`);
    await expect(card).toContainText(`${d.director.id} · ${d.director.star}`);
    await card.getByRole("button", { name: /Gli altri \d+ agenti/ }).click();
    for (const a of d.agents.slice(1)) await expect(card).toContainText(`${a.id} · ${a.star}`);
  }
});

test("la griglia dei reparti non lascia caselle vuote", async ({ page }) => {
  await expectFullRows(page.locator("#reparti > div.grid"));
});

test("i link della hero portano alle sezioni", async ({ page }) => {
  await page.getByRole("link", { name: "Scopri i reparti" }).click();
  await expect(page).toHaveURL(/#reparti$/);
  // Sul telefono i reparti sono pillole, sul computer stelle della costellazione: un solo link visibile per reparto.
  const hero = page.locator(".hero");
  await expect(hero.getByRole("link", { name: /^AISA\b/ })).toHaveCount(1);
  await hero.getByRole("link", { name: /^AISA\b/ }).click();
  await expect(page).toHaveURL(/\/reparti\/aisa$/);
});

test("nessuno scorrimento orizzontale", async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});

test("nessuna violazione di accessibilità serious o critical", async ({ page }) => {
  for (const trigger of await page.getByRole("button", { name: /Gli altri \d+ agenti/ }).all()) await trigger.click();
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
