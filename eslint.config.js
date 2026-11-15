import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/dist/", "**/.astro/", "**/node_modules/", "**/*.astro"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    // Il catalogo è la fonte comune di sito e server MCP: non dipende da Astro né dal browser.
    files: ["packages/catalog/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: ["astro", "astro/*", "@astrojs/*"] }],
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
    },
  },
);
