# Conventions of {{PROJECT_NAME}}

Rules for whoever works on the code of {{PROJECT_NAME}}, people or agents. `AGENTS.md` completes them with the rules for agents and agencies (§16). The parts marked «to fill in» depend on the stack and are written in F0; the rest applies to every project.

## 1. Purpose

<!-- To fill in: what the product is, who it is for, and what must never break (real data, saved games, published content…). -->

The rules serve three things, in this order: not losing or altering the user's data and work, keeping the code simple and readable, delivering verified changes.

## 2. Workflow

### 2.1 Read first
Before changing the code, read this document (the relevant sections), `AGENTS.md`, the phase file in `plan/` and the acceptance criteria. A script, a library or a configuration exists only if you find it in the repository, not because a document describes it.

### 2.2 Understand the existing code
Look at the files involved and their dependencies, look for helpers, types and components that already solve the problem, understand how the data flows. Follow the existing patterns, unless there is a concrete reason not to.

### 2.3 Clarify the ambiguities that matter
Go ahead on your own when the requirements are clear and the choices are low-risk and reversible. Ask the user when an ambiguity can change visible behaviour, data integrity, security, the data model or the scope. Product decisions are not taken silently.

### 2.4 The smallest solution that holds
Apply the Ponytail ladder in `AGENTS.md`. No unrelated refactoring, no unnecessary abstractions or dependencies, existing behaviour preserved.

### 2.5 Verify
Reread the diff, run the checks (§13), verify the acceptance criteria on the real implementation. Do not claim a check passed if it was not run.

### 2.6 Phases and backlog
Work is divided into phases, one at a time, listed in `plan/README.md` (table «Phases») with the decisions taken.
- **Phase file.** Each phase has `plan/NN-name.md` with goal, status, agencies, starting situation, the user's decisions, `## Backlog`, `## Acceptance criteria` and, at closure, «Done», «Checks» and «Open findings» (template: `plan/00-base.md`).
- **Backlog.** A table with id `FN-NN`, task and priority (`P0`–`P3`, as in `AGENTS.md`), confirmed by the user when the phase opens. A task is done when «Done» cites its id in bold (`**FN-NN**`) with the evidence: the panel of `@agentrica/mcp` (on by default) reads this format.
- **Planning.** Phases are created in a session of their own, which writes only `plan/` (in a project already under way, by reading the existing code): phases in «Phases», phase files with backlog and criteria, no change to the code. Have the plan confirmed by the user and stop by suggesting `/clear`.
- **Opening.** Each phase opens in a new session, only one phase per session. The «proposals to confirm» in the file are decided with the user; `phase/fN-name` is opened from `develop`.
- **During.** Whatever falls outside the scope becomes a backlog item or an open finding, not a change in passing (§14). Fixes outside a phase go on `fix/name`.
- **Closure.** Procedure in §13.7; the «Open findings» stay visible until a later phase closes them with evidence.

## 3. Writing code

- **Readability first**: names that say what they contain, short functions with one responsibility, linear flow with early returns.
- **Simplicity**: the shortest code that stays clear. Nothing «for later».
- **DRY without overdoing it**: extract at the third repetition or when the logic must stay identical.
- **Constants**: no repeated magic values; domain strings live in a single place.
- **Comments**: they explain why, not what. Short, in English. A deliberate simplification is marked with `ponytail:`, stating the limit and when to go beyond it.
- **Dead code**: removed, not commented out.
- **Defences**: input data is validated at the boundaries (server-side actions, routes, imports, user input); inside, use the types.

## 4. TypeScript

- `strict` stays on, with `noUncheckedIndexedAccess`. No `any`; `unknown` at the boundaries, then narrowing.
- Assertions (`as`, `!`) only where a previous check guarantees them, with a comment if it is not obvious.
- A type is defined once and derived (`Pick`, `Omit`, types inferred from the schema) instead of being redefined.
- <!-- To fill in: domain units and formats (e.g. integer amounts in cents, `YYYY-MM-DD` dates, units of measure of the game world). -->

## 5. Repository architecture

| Folder | Content |
|---|---|
| `src/lib/` | pure, tested logic: no DOM, network, database or clock (it receives `today` or `dt` as a parameter) |
| <!-- to fill in --> | <!-- pages, components, scene, server… --> |
| `e2e/` | end-to-end tests and capture of audit evidence |
| `scripts/` | project scripts (migrations, test data, utilities) |
| `plan/` | decisions and phases |
| `agents/`, `.claude/agents/` | agency roles and subagents |
| `audit/` | audit findings and reports |
| `docs/` | reference material |

Logic that can be tested without framework, network or database goes in `src/lib`. A lint rule enforces it when the stack allows.

## 6. Data and state

<!-- To fill in: where data is read and written, where state lives (URL, server, local client), how it is invalidated after a write. Common rule: state that must survive a link lives in the URL; no global state libraries without a reason recorded in plan/README.md. -->

## 7. Boundaries: APIs, actions, input data

<!-- To fill in: how data and commands come in (Server Actions, APIs, input events, imported files). Common rules: -->

- Every write goes through a single point per area, validates its input data and returns a true outcome: an update that touches nothing does not answer «updated».
- Multi-step writes are atomic (transaction or equivalent).

## 8. Forms and interactions

<!-- To fill in: form components, formats of the data entered (e.g. amounts in the local format), behaviour after saving; or, for a game, command map and feedback. -->

## 9. Components

- A component does one thing. Reuse shared components before creating new ones.
- List keys are stable and unique. No effects to compute values that can be derived.
- <!-- To fill in: framework rules (Server/Client Components, scene lifecycle…). -->

## 10. Access and protection

- No secrets in the code or in the logs. `.env*` files (except `.env.example`) do not go into git.
- Every access check is repeated where the data is used, not only at the first filter.
- <!-- To fill in when accounts or per-user data arrive: how users sign in, where the session lives, how data is separated. -->

## 11. Interface, consistency and accessibility

- Use the design system tokens, never hand-written colours.
- State is never conveyed by colour alone: there is always a sign, a shape or a text.
- Semantic HTML: one `h1` per page, section headings, tables with headers, labels on fields.
- Keyboard: every action is reachable, focus is visible, dialogs trap it and give it back.
- WCAG 2.2 AA contrast: at least 4.5:1 for text, 3:1 for graphical elements.
- Responsive down to 390 px without horizontal page scrolling. <!-- adapt to the project's devices -->
- Every piece of data has its states: loading, empty, error.
- Texts in English, short, with the glossary in `plan/README.md`.

## 12. Performance and reliability

- Optimise only on measurements.
- New dependencies require a reason and the user's go-ahead; first look at the standard library and the platform. Versions are pinned exactly.
- Destructive operations (imports, deletions, migrations, save resets) have confirmation, outcome and a way back.

## 13. Tests and checks

### 13.1 What to test
Test behaviour and risks, with the domain's edge cases. A fixed bug has its regression test.

### 13.2 Unit tests
<!-- To fill in: tool and location, e.g. «`node --test` in `src/lib/*.test.ts` (`npm test`), with no extra dependencies». -->

### 13.3 Schema and migrations
<!-- To fill in if there is a database: how they are generated, reread and tried on a copy before applying them. -->

### 13.4 End-to-end tests
With Playwright in `e2e/`. Tests use only fake data and never touch the user's real data. Accessibility is checked with axe where there is an HTML interface: no serious or critical violations, except the listed open findings.

### 13.5 Checks before commit and merge
- `npm run verify`: typecheck, lint, unit tests and build. Before every commit. Prints only errors and summaries.
- `npm run verify:e2e`: end-to-end tests. Before merging a phase.

CI runs the same two scripts: if one is missing, that CI step is skipped.

### 13.6 Reporting results
Report the commands run and the real outcome, and say explicitly what was not checked.

### 13.7 Closing a phase
Work happens on `phase/fN-name` (or `fix/name` for a fix outside a phase), starting from `develop`. When the acceptance criteria are met, the phase is closed with these steps, in this order:

1. **Plan.** The phase file moves to «completed» with «Done», «Checks» and «Open findings»; the row in «Phases» is updated and, if needed, «Decisions» and «Glossary» in `plan/README.md`.
2. **Checks.** `npm run verify` and `npm run verify:e2e` (once it exists), with the real outcome.
3. **Proposal.** Present the user with the summary (§19) and the sequence of steps 4–7, with a single confirmation question. Without the go-ahead, stop; if the user asks for changes, start again from step 1.
4. **Commit** on the phase branch, with a message that says what changes.
5. **Merge** into `develop` with `--no-ff` and the message «Merge phase/fN-name into develop».
6. **Push** `develop` and the phase branch; CI (`.github/workflows/ci.yml`) must turn green (`gh run list`, `gh run watch`). If it is red, fix it on a `fix/…` branch before opening the next phase.
7. **Index.** `tokensave sync` from the root.
8. **New session.** Suggest `/clear` to the user: the state is complete in `plan/` and in git. The next phase opens in a new session, by reading `plan/README.md` and its own file.

If a step fails, stop, report the error and do not skip to the next steps. A `fix/…` follows the same steps; the merge message is «Merge fix/name into develop».

### 13.8 Release to `main`
It is not part of closing a phase: it is done only when the user asks, with `develop` CI green.
1. Pull request from `develop` to `main` (`gh pr create --base main --head develop --title "Release: FN short description"`), merged with a merge commit when CI is green (`gh pr merge --merge`). A ruleset on `main` that forbids direct pushes and force pushes is advisable. **Right after, `develop` goes back to the same commit as `main`**: `git fetch`, on `develop` `git merge --ff-only origin/main`, push `develop`, and `origin/develop` and `origin/main` must have the same hash. A note written after the release goes into `main` with another PR, then realign again. `develop` and `main` are always aligned.
2. <!-- To fill in: hosting, what `main` publishes, steps for migrations, check after the deploy. -->

Deploys and production migrations always start with an explicit go-ahead, separate from the phase one.

## 14. Scope and existing defects

- Do what the phase asks. A directly related defect is fixed in the same task and reported; the others become backlog items in `plan/`, not changes in passing.
- Existing behaviour is preserved, unless the phase changes it.

## 15. Repository configuration

### 15.1 Stack
<!-- To fill in during F0: framework, versions, configuration files and their quirks. One subsection per tool (15.2, 15.3…). -->

### 15.x Evidence for audits
<!-- When needed: an `audit:capture` script (Playwright) that saves screenshots, axe reports and the accessibility tree in `audit/<audit_id>/evidence/`, on fake data. -->

### 15.y Agencies
Roles, activation and coordination of the agencies are in `AGENTS.md`, section «Agencies», and in `docs/AI Multi-Agency System.md`. The agencies' rules add to this document, they do not replace it.

## 16. Instructions and conflicts

The order of precedence is: the user's explicit request, then decisions recorded in `plan/`, then this document, then `AGENTS.md` and the agencies' role files. If two rules contradict each other, report the conflict to the user instead of silently choosing one. `CLAUDE.md` imports `AGENTS.md`.

## 17. Definition of Done

**Implementation**: acceptance criteria met, code according to these rules, no dead code, no secrets.

**Experience and reliability**: loading, empty and error states; keyboard and contrast; the project's devices tried; true outcomes; no user data lost or altered.

**Verification**: `npm run verify` passed; `npm run verify:e2e` passed for the merge; new tests for new behaviour; review by the Code Reviewer.

**Communication**: phase file updated; open findings listed; user confirmation for commit, merge and push.

## 18. Exceptions

An exception to these rules is written in the «Decisions» table of `plan/README.md` or in the phase file, with the reason, before the code.

## 19. Final answer

Whoever closes a task reports, in this order: what was done, files touched, checks run with the real outcome, agency roles consulted, findings left open and decisions the user needs to take.
