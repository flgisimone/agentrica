// Prove di fumo e accessibilità del sito costruito (CONVENTIONS §13.4), con il Chrome installato.
import { defineConfig, devices } from "@playwright/test";

const PORT = 4329;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "dot" : "list",
  use: { baseURL: `http://127.0.0.1:${PORT}`, channel: "chrome" },
  projects: [
    { name: "computer", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 } } },
    { name: "telefono", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 360, height: 780 }, hasTouch: true, isMobile: true } },
  ],
  webServer: {
    // --ignore-lock: Astro 7 manda in background l'anteprima quando la lancia un agente (Claude Code) e Playwright
    // la vedrebbe terminare subito; così resta in primo piano ovunque (astro/dist/cli/preview/index.js).
    command: `npm run build && npm run preview -w @agentrica/site -- --port ${PORT} --ignore-lock`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
