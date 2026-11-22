# TypeScript 7.0

Source: typescript · Version: 7.0 · Verified on: 2026-11-19 · Recheck by: 2027-02-19 · Roles: AISA-02, AISA-04, AISA-05, AISA-06, AISA-08, AISA-10, AISA-12

## Notion
TypeScript 7.0, announced on 8 July 2026, is the compiler rewritten in Go, about ten times faster than 6.0; it is still installed as the typescript package and the command is still tsc. 6.0 was the last version built on the JavaScript code; to keep it next to 7 there is the @typescript/typescript6 package, with the tsc6 command.

Some defaults change: strict is on, module is esnext, types is an empty list (restored with the value «*»), rootDir is the project folder. Options that were already deprecated become errors, among them target es5, downlevelIteration, moduleResolution node or node10 and classic, baseUrl, esModuleInterop set to false. 7.0 has no programmatic API: the tools that use it (for example typescript-eslint or the Vue, Astro, Svelte and Angular support in editors) stay on 6.0 for now.

## How it applies
- Before proposing the move to 7, check the TypeScript version and the tools that use its API (lint, editor, framework): if they depend on the API, the project stays on 6.0 or uses the typescript6 package alias for those tools.
- The recommended path goes through 6.0: a project that compiles cleanly on 6.0, without ignoreDeprecations, should compile the same way on 7.0.
- In an upgrade, list the tsconfig options that become errors and the defaults that change (types, rootDir, strict), with the proposed change.
- Do not treat the 7.1 beta as a stable version.
