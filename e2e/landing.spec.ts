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

test("mostra i cinque reparti con il simbolo del direttore", async ({ page }) => {
  for (const d of departments) {
    const card = page.locator(`article[data-dept="${d.code}"]`);
    await expect(card.getByRole("heading", { name: d.name })).toBeVisible();
    await expect(card).toContainText(`${d.agents.length} agenti`);
    await expect(card).toContainText(`${d.director.id} · ${d.director.star}`);
    // Il simbolo è decorativo: il nome in codice gli sta accanto (plan/09-simboli.md).
    await expect(card.locator(`svg[data-star="${d.director.star}"][aria-hidden="true"]`)).toBeVisible();
    await expect(card.getByRole("link")).toHaveAttribute("href", `/reparti/${d.slug}`);
  }
});

test("la griglia dei reparti non lascia caselle vuote", async ({ page }) => {
  await expectFullRows(page.locator("#reparti > div.grid"));
});

test("la hero porta ai reparti, il menu dell'header a ciascun reparto", async ({ page }) => {
  await page.getByRole("link", { name: "Scopri i reparti" }).click();
  await expect(page).toHaveURL(/#reparti$/);
  // Sul computer il menu «Reparti», sul telefono il pannello del menu: un solo pulsante visibile.
  await page.getByRole("button", { name: /^(Reparti|Apri il menu)$/ }).click();
  await page.locator(":popover-open").getByRole("link", { name: /^AISA\b/ }).click();
  await expect(page).toHaveURL(/\/reparti\/aisa$/);
  await expect(page.locator(":popover-open")).toHaveCount(0);
});

test("i cinque direttori nella hero del computer", async ({ page, isMobile }) => {
  test.skip(isMobile, "Sotto i 1024 px la hero mostra le scorciatoie ai reparti al posto del mosaico.");
  await expect(page.getByRole("list", { name: "I direttori dei reparti" }).locator("svg[data-star]")).toHaveCount(departments.length);
});

test("nessuno scorrimento orizzontale", async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});

test("nessuna violazione di accessibilità serious o critical", async ({ page }) => {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});

test.describe("Come lavoriamo e MCP", () => {
  test("la simulazione è etichettata, parte quando entra nello schermo e si mette in pausa da tastiera", async ({ page }) => {
    const terminal = page.locator("#metodo figure");
    await expect(terminal).toContainText("Simulazione");
    await terminal.scrollIntoViewIfNeeded();
    await expect(page.locator('#metodo li[aria-current="step"]')).toHaveCount(1);
    const pause = terminal.getByRole("button", { name: "Pausa" });
    await pause.focus();
    await page.keyboard.press("Enter");
    const resume = terminal.getByRole("button", { name: "Riprendi" });
    await expect(resume).toBeVisible();
    const step = await page.locator('#metodo li[aria-current="step"]').innerText();
    await page.waitForTimeout(1500);
    await expect(page.locator('#metodo li[aria-current="step"]')).toHaveText(step);
    await terminal.getByRole("button", { name: "Ricomincia" }).press("Enter");
    await expect(terminal.getByRole("button", { name: "Pausa" })).toBeEnabled();
    await expect(page.locator('#metodo li[aria-current="step"]')).toContainText("La tua richiesta");
  });

  test("con riduci movimento il terminale è completo e fermo", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const terminal = page.locator("#metodo figure");
    await expect(terminal.getByRole("button")).toHaveCount(0);
    await expect(terminal.locator("ol[aria-hidden] > li.invisible")).toHaveCount(0);
    await expect(page.locator('#metodo li[aria-current="step"]')).toHaveCount(0);
    await context.close();
  });

  test("i lettori di schermo hanno il testo intero della simulazione", async ({ page }) => {
    await expect(page.locator("#metodo figure .sr-only")).toContainText("git switch develop && git merge fase/f9-simboli");
  });

  test("la sezione MCP mostra i passi del README e i limiti", async ({ page }) => {
    const mcp = page.locator("#mcp");
    await expect(mcp).toContainText("Pacchetto npm");
    await expect(mcp.locator("pre").first()).toContainText("claude mcp add agentrica -- npx -y @agentrica/mcp@");
    await expect(mcp).toContainText("--agents aisa,aiwda-08");
    await expect(mcp).toContainText("nessuna telemetria");
    const trials = mcp.getByRole("table");
    await expect(trials.getByRole("row")).toHaveCount(4);
    await expect(trials.getByRole("rowheader", { name: /AIPCA-02 · ALIOTH/ })).toBeVisible();
  });
});
