import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// Solo TypeScript per Node: il sito, con le regole di Next, è nel repository privato agentrica-site (F17).
export default defineConfig([
  ...tseslint.configs.recommended,
  {
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
  // I progetti di examples/ sono difettosi di proposito (casi di prova degli agenti): non si controllano.
  globalIgnores(["**/dist/**", "**/node_modules/**", "packages/mcp/agents/**", "examples/progetti/**"]),
]);
