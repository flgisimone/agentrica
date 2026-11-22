# {{PROJECT_NAME}}

<!-- What it is, who it is for, current status. -->

## Getting started

<!-- To fill in during F0: requirements (Node from .nvmrc), npm ci, npm run dev, variables from .env.example. -->

## How we work

| File | Content |
|---|---|
| [AGENTS.md](AGENTS.md) | rules for the agents: tokensave, Ponytail, efficiency, verification, agencies (`CLAUDE.md` imports it) |
| [CONVENTIONS.md](CONVENTIONS.md) | conventions for code, tests, release |
| [plan/](plan/README.md) | decisions and phases, one per file |
| [agents/](agents/) and [.claude/agents/](.claude/agents/) | agency roles and subagents |
| [audit/](audit/README.md) | audit findings and reports |
| [docs/](docs/README.md) | reference material |

Branches: `develop` for development, `main` for stable versions, `phase/fN-name` and `fix/name` starting from `develop`. Checks: `npm run verify` before every commit, `npm run verify:e2e` before merging a phase.
