import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: { next: { rootDir: "apps/site/" } },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
    },
  },
  {
    // Il catalogo è la fonte comune di sito e server MCP: non dipende da Next, React o dal browser.
    files: ["packages/catalog/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: ["next", "next/*", "react", "react/*", "react-dom", "react-dom/*"] }],
    },
  },
  globalIgnores(["**/.next/**", "**/out/**", "**/build/**", "**/next-env.d.ts", "**/node_modules/**", "test-results/**", "playwright-report/**"]),
]);
