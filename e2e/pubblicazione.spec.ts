// F10: header di sicurezza, nessuna violazione della CSP e pagina delle note legali.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/reparti/aisa", "/agenti/aisa-02", "/note-legali"];

test("header di sicurezza su ogni pagina", async ({ request }) => {
  for (const path of PAGES) {
    const headers = (await request.get(path)).headers();
    expect(headers["content-security-policy"], path).toContain("default-src 'self'");
    expect(headers["content-security-policy"], path).toContain("frame-ancestors 'none'");
    expect(headers["strict-transport-security"], path).toContain("max-age=");
    expect(headers["x-content-type-options"], path).toBe("nosniff");
    expect(headers["x-powered-by"], path).toBeUndefined();
  }
});

test("la CSP non blocca niente e il sito non chiama altri domini", async ({ page, baseURL }) => {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("request", (request) => {
    if (!request.url().startsWith(baseURL!) && !request.url().startsWith("data:")) problems.push(request.url());
  });
  for (const path of PAGES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  expect(problems).toEqual([]);
});

test("note legali: titolare, hosting e log, nessun cookie; raggiungibili dal footer", async ({ page, context }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Note legali" }).click();
  await expect(page).toHaveURL(/\/note-legali$/);
  // Dopo la navigazione client Next aggiorna il titolo in modo asincrono: axe va lanciato dopo.
  await expect(page).toHaveTitle("Note legali · Agentrica");
  await expect(page.getByRole("heading", { level: 1, name: "Note legali" })).toBeVisible();
  const main = page.locator("main");
  await expect(main).toContainText("Giulio Simone Floresta");
  await expect(main).toContainText("Vercel");
  await expect(main).toContainText("indirizzo IP");
  // Piano gratuito di Vercel: nessun DPA, e le note lo dicono (PRIV-PUB-01).
  await expect(main).toContainText("non offre un accordo sul trattamento dei dati");
  await expect(main).toContainText("non usa cookie");
  expect(await context.cookies()).toEqual([]);
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});
