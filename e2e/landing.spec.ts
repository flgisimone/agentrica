import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { loadCatalog } from "../packages/catalog/src/index.ts";

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
});

test("mostra i cinque reparti con direttore e agenti", async ({ page }) => {
  for (const d of departments) {
    const card = page.locator(`article[data-dept="${d.code}"]`);
    await expect(card.getByRole("heading", { name: d.name })).toBeVisible();
    await expect(card).toContainText(`${d.agents.length} agenti`);
    await expect(card).toContainText(`${d.director.id} · ${d.director.star}`);
    await card.getByText(/Gli altri \d+ agenti/).click();
    for (const a of d.agents.slice(1)) await expect(card).toContainText(`${a.id} · ${a.star}`);
  }
});

test("i link della hero portano alle sezioni", async ({ page }) => {
  await page.getByRole("link", { name: "Scopri i reparti" }).click();
  await expect(page).toHaveURL(/#reparti$/);
  await page.getByRole("link", { name: "AISA", exact: true }).click();
  await expect(page).toHaveURL(/#reparto-AISA$/);
});

test("nessuno scorrimento orizzontale", async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});

test("nessuna violazione di accessibilità serious o critical", async ({ page }) => {
  await page.locator("details").evaluateAll((all) => all.forEach((d) => d.setAttribute("open", "")));
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
