# F0 — Technical base

**Goal**: a project that starts and already has all the quality checks, so that later phases only add product.

> **Status: to do.** <!-- At the end of the phase: «completed (`hash`, in `develop`)», with date, the user's confirmations and deviations from the plan. -->

**Agencies**: software (Architect for the structure, DevOps for scripts, build and CI, QA, Code Reviewer).

## Proposals to confirm

<!-- When the phase opens the software director proposes them (AISA-01, with Agentrica's `agent` tool) and they are decided with the user with `ask_user`, in the panel. -->

- Stack and dependency versions (current stable, pinned exactly).
- Active agencies for this project (AGENTS.md, «Agencies»).
- Data: mocks and fake data, or the user's real data (it changes the rules for the agents and the `.gitignore`).

## Backlog

| # | Task | Priority |
|---|---|---|
| F0-01 | `package.json` with the approved dependencies, exact versions; `.nvmrc` aligned | P1 |
| F0-02 | strict `tsconfig.json` (`noUncheckedIndexedAccess`); lint; scripts `dev`, `build`, `typecheck`, `lint`, `test`, `verify` (and `verify:e2e` when Playwright arrives) | P1 |
| F0-03 | Folder structure (CONVENTIONS §5) with `src/lib` for pure logic and the lint rule that protects it; the first test page or scene | P1 |
| F0-04 | First unit test in `src/lib`, so that `npm run verify` also runs the tests | P1 |
| F0-05 | «To fill in» sections of `CONVENTIONS.md` and «Adaptations» of `AGENTS.md`; inactive agencies removed from `agents/` and `.claude/agents/`; «Stack» row in `plan/README.md` | P1 |
| F0-06 | `.gitignore` completed with the stack's build folders; CI green on the first push | P2 |
| F0-07 | `tokensave init` from the root, first commit of the phase on `develop` | P2 |

## Acceptance criteria

- `npm run dev` starts the app without errors in the console.
- `npm run verify` passes with at least one unit test.
- No file in `src/lib` imports the framework, the DOM or the network (checked by the lint with a test file).
- No «to fill in» section left in `CONVENTIONS.md` and `AGENTS.md` for the parts F0 decided.
- CI on `develop` is green (after the push approved by the user).

## Done

<!-- At the end of the phase: one line per task, with installed versions, files created and choices made. -->

## Checks

<!-- At the end of the phase: commands run with the real outcome; what was not checked and why. -->

## Open findings

<!-- At the end of the phase: findings with reasoned priority (P0–P3) and where they will be addressed. -->
