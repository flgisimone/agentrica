import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { loadCatalog } from "../packages/catalog/src/index.ts";

const departments = loadCatalog();

for (const d of departments) {
  test(`${d.code}: pagine degli agenti dal catalogo`, async ({ page }) => {
    for (const a of d.agents) {
      await page.goto(`/agenti/${a.id.toLowerCase()}`);
      await expect(page).toHaveTitle(`${a.id} · ${a.star} · Agentrica`);
      await expect(page.getByRole("heading", { level: 1, name: a.star })).toBeVisible();
      await expect(page.locator("header")).toContainText(a.role);
      const headings = page.getByRole("article").getByRole("heading", { level: 2 });
      await expect(headings).toHaveText(a.sections.map((s) => s.heading));

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, a.id).toBe(0);
    }

    // axe sul direttore e su uno specialista: le pagine hanno la stessa struttura.
    for (const a of [d.director, d.agents.at(-1)!]) {
      await page.goto(`/agenti/${a.id.toLowerCase()}`);
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`), a.id).toEqual([]);
    }
  });
}

test("dal reparto all'agente, al successivo e ritorno", async ({ page }) => {
  await page.goto("/reparti/aisa");
  await page.getByRole("link", { name: "AISA-01 · SIRIUS" }).click();
  await expect(page).toHaveURL(/\/agenti\/aisa-01$/);
  const nav = page.getByRole("navigation", { name: "Altri agenti di AISA" });
  await expect(nav.getByRole("link", { name: /Precedente/ })).toHaveCount(0);
  await nav.getByRole("link", { name: /Successivo/ }).click();
  await expect(page).toHaveURL(/\/agenti\/aisa-02$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ALTAIR");
  await page.getByRole("link", { name: "AISA · AI Software" }).click();
  await expect(page).toHaveURL(/\/reparti\/aisa$/);
});

test("un id sconosciuto dà 404", async ({ page }) => {
  const response = await page.goto("/agenti/aisa-99");
  expect(response?.status()).toBe(404);
});
