# Agentrica

[![Agentrica MCP on mcprush](https://mcprush.com/badge/agentrica-mcp/compact.svg)](https://mcprush.com/to/agentrica-mcp?ref=badge)

[Italiano](README.it.md)

**Agentrica is an MCP server with AI agents organised in departments, for use in your projects.** Each department covers one area of expertise and each agent has a precise role, a working method and declared limits.

This repository contains:

1. **The MCP server** `@agentrica/mcp`: the agents, usable as tools in any project (Claude Code or another MCP client), without copying their prompts by hand. It is installed with `npx -y @agentrica/mcp@0.18.0 install` (see [packages/mcp/README.md](packages/mcp/README.md)).
2. **The catalogue**: the role files in [`agents/`](agents/) and the `packages/catalog` package that reads them. The website https://agentrica.vercel.app presents the agents from this catalogue.

The website and the MCP server read the **same source**: the Markdown files in [`agents/`](agents/). A role is edited in one place and changes in both. Since F17 the website code lives in a private repository that reads the catalogue from `@agentrica/mcp/catalog`: an edited role reaches the website with the next package version.

## Departments

| Code | Department | What it does | Folder |
|---|---|---|---|
| **AIBPD** | AI Business & Product Development | goals, requirements, priorities, roadmap, business case, market | [`agents/ai_business_product_development_agency/`](agents/ai_business_product_development_agency/) |
| **AICA** | AI Cybersecurity | threat model, configuration, access, vulnerabilities, incident response | [`agents/ai_cybersecurity_agency/`](agents/ai_cybersecurity_agency/) |
| **AIPCA** | AI Privacy & Compliance | GDPR, legal bases, retention, vendors, DPIA | [`agents/ai_privacy_compliance_agency/`](agents/ai_privacy_compliance_agency/) |
| **AISA** | AI Software | analysis, architecture, development, testing, application security, code review | [`agents/ai_software_agency/`](agents/ai_software_agency/) |
| **AIWDA** | AI Web Design | UX research, UI, information architecture, design system, accessibility, copy | [`agents/ai_web_design_agency/`](agents/ai_web_design_agency/) |

Every agent has a **star code name**: the department code, the number of its role file and a star, for example `AISA-02 · ALTAIR` for the Senior Software Architect. Number 01 of each department is the director.

Agentrica has no people, clients or success stories, and the website does not make any up.

The role files, the libraries and the MCP server exist in English and in Italian (F32; English files in each agency's `en/` folder); the website is bilingual too (F33).

## Structure

```
agentrica/
├── agents/              # the roles: the single source of content (one .md per agent, 00-common-rules.md per department, biblioteca/ and fonti.json)
├── packages/catalog/    # TypeScript: reads agents/ and returns typed departments and agents, with code names
├── packages/mcp/        # the agents' MCP server (stdio), npm package @agentrica/mcp with the ./catalog export: see packages/mcp/README.md
├── plan/                # project decisions and phases (in Italian)
├── scripts/             # command-line tools: stats, ratings, agent-text, study (library watcher)
├── .claude/agents/      # the same roles as Claude Code subagents, for working on this repository
└── AGENTS.md, CONVENTIONS.md, CLAUDE.md   # working rules (in Italian)
```

The departments serve twice: they are the **content** of the product and also the **team** the project is developed with in Claude Code (the active departments are listed in [AGENTS.md](AGENTS.md)).

## Status

Phases F0–F48 are complete (F44: small and medium open findings of F37–F42, with the `reminder` command, goes out with 0.16.0); the full list, with what each one did, is in [README.it.md](README.it.md#stato) and [plan/README.md](plan/README.md). F34 (agents orchestrated from the MCP server one at a time, director first, subagents only with `init --subagents` and shown in the panel) is complete and released with 0.10.0. F35 (projects already under way with `init --existing`, the panel without an error when the plan is missing, one phase per session) is complete and released with 0.11.0. F36 (animated hero on the website, the library and `report` on the website, README and documents aligned with the positioning) is complete and released with 0.11.1. F37 (model measurement, first wave: 14 cyber, privacy and software specialists, a smaller recommended model for 12 of them) is complete and goes out with 0.12.0. F38 (website only: agent ratings in a circle with comments at the bottom, usage charts in tabs, the install page laid out like documentation) is complete. F39 (a reminder to load an agent on every request, a panel notice when `plan/` changes without agents, what stays on your computer) is complete and goes out with 0.13.0. F40 (a context baseline: bytes per component of every agent's text with `agent-text --sizes`, the orchestration flow, the quality threshold for F41; what the server does without a model and what stays with the client) is complete. F41 (common rules and library index once per department, `full_rules` to get them back, short handovers; about 55% less for each specialist of a department already loaded, same quality on the test cases) is complete and goes out with 0.14.0. F42 (deterministic validation: `check`, as a tool, a command for CI and in the panel, checks the format of `plan/` and `audit/` and reports three kinds of contradiction with both locations, without models; `report` warns when a handover is incomplete) is complete and goes out with 0.15.0. F45 (a measurement before Code Mode: `npm run tool-chains` counts chains of Agentrica tool calls and intermediate bytes in Claude Code sessions; below the threshold, so Code Mode stays deferred and an OpenAI package is out) is complete. F46 (local panel UI and UX: notices in one area with an action, the Session with what needs attention at the top, plan progress, a priority filter, usage in tabs, accessibility; the right open phase with «completed (…)») is complete and goes out with 0.17.0.

## Getting started

Requirements: Node (version in `.nvmrc`) and npm.

```sh
npm ci
npm run verify    # typecheck, lint, tests: before every commit
npm run stats     # npm downloads of @agentrica/mcp and GitHub stars
```

## How we work

The working method is the same one `npx @agentrica/mcp init` brings to new projects (see [packages/mcp/README.md](packages/mcp/README.md)):

- **one phase at a time**: a file in `plan/` with a backlog (tasks `FN-NN` with priority `P0`–`P3`) and acceptance criteria confirmed by the user, a `fase/fN-name` branch from `develop`, closed with the procedure in [CONVENTIONS §13.7](CONVENTIONS.md); the method is in [CONVENTIONS §2.6](CONVENTIONS.md);
- **departments on demand**: roles are a way of working, subagents start only for audits;
- **every final decision is confirmed by the user**, commits and pushes included.

To resume work in Claude Code: open the repository, read `plan/README.md` and the file of the current phase.

## License

MIT, see [LICENSE](LICENSE).
