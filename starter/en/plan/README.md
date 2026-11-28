# Plan of {{PROJECT_NAME}}

<!-- One or two sentences: what the product is and who it is for. -->

This plan collects the decisions taken and the work phases, one per file.

## How we work on a phase

- Phases are created in a planning session, which writes only `plan/` and ends with the user's confirmation and the suggestion of `/clear`; then one phase per session, each in a new session.
- Each phase has a file `NN-name.md` with goal, status, agencies, backlog, acceptance criteria and, at the end of the phase, «Done», «Checks» and «Open findings» (template: [00-base.md](00-base.md)).
- Work happens on a `phase/fN-name` branch, starting from `develop`; fixes outside a phase on `fix/name`.
- The «proposals to confirm» in the phase files are decided with the user when each phase opens.
- The phase closes with the procedure in CONVENTIONS §13.7: plan updated, checks, **a single confirmation from the user**, then commit, merge into `develop`, push, `tokensave sync` and `/clear`.
- Merging into `main` is a separate release, only when the user asks (CONVENTIONS §13.8).

## Decisions

| Topic | Decision | Reason |
|---|---|---|
| Structure | Repository created with `npx @aigentrica/mcp init`: AGENTS, CONVENTIONS, plan, agencies, audit and docs versioned; `.mcp.json` with the AIgentrica server and the panel | User's choice ({{DATE}}) |
| Agencies | <!-- which are active, which removed --> ; brought in only when a task needs them; every final decision goes through the user's confirmation | <!-- F0 --> |
| Stack | <!-- to decide in F0 --> | |
| Tests | <!-- e.g. unit tests with `node --test` on `src/lib`, e2e with Playwright on fake data --> | |
| Release | <!-- local only until FN; then hosting, deploy only after the user's approval --> | |
| Language | Documentation, plans, conventions and interface texts in English | Default of `init --lang en` |
| Branches | `develop` for development, `main` for stable versions; one phase = one `phase/fN-name` branch | Default of `init` |

## Glossary

<!-- Interface and domain terms, with the user's choices and the date. -->

## Phases

| Phase | File | Content | Status |
|---|---|---|---|
| F0 | [00-base.md](00-base.md) | Technical base: stack, structure, verify, CI, tokensave, active agencies | to do |

Order: F0 → FN in sequence; each phase opens after the previous one is merged.
