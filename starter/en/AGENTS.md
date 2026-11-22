# Rules for agents

Before implementing, read the relevant sections of [CONVENTIONS.md](CONVENTIONS.md) and the phase file in [plan/](plan/README.md): these rules complete them, they do not replace them (CONVENTIONS §16).

**Main rule: all work on the project goes through Agentrica's agents, even if the user does not name them.** A new feature, a change, a stack choice, phase F0, an audit or a finding to fix starts from the Agentrica MCP server: load its tools with ToolSearch (`mcp__agentrica__`), then `list_agents` and the department director with `agent`, as «How to consult an agent» says. Questions to the user are asked with `ask_user`, which shows them in the panel. Work without agents only if the user asks for it, or for short answers that do not touch the project.

<!-- If the framework writes its own block of rules here at the top (for example Next.js with `next dev`), leave it and commit it. -->

## Exploring the code: tokensave

The project is indexed with tokensave (the `.tokensave/` folder, ignored by git). Everything runs on the workstation: it calls no models or paid services and reduces tokens, because it returns only the code that is needed. To explore the code use the `tokensave_*` tools before Grep and Read:

- `tokensave_context` for a concept or a task, in natural language;
- `tokensave_search` for a symbol by name, with `literal: true` for exact text;
- `tokensave_callers`, `tokensave_callees` and `tokensave_impact` for who uses what.

The MCP server has no default project: pass `graph_root: "{{PROJECT_PATH}}"`, or use the CLI from the root (`tokensave tool search <query>`). At the end of every phase the index is updated with `tokensave sync` from the root, as a step of the closure (CONVENTIONS §13.7); also after major changes in the middle of a phase. The index is created in F0 with `tokensave init`, when the first code exists. If tokensave is not installed, explore by searching and reading files.

## Writing code: Ponytail

Before writing code, stop at the first step that holds:

1. Is it really needed? If the need is hypothetical, it is not done.
2. Is it already in the project? Reuse existing helpers, types and schemas.
3. Does the standard library do it?
4. Does the platform do it (HTML, CSS, the browser, the framework)?
5. Does a dependency already installed do it? No new dependencies for a few lines.
6. Is one line enough?
7. Only then: the minimal code that works.

A bug is fixed at its cause, at the point all callers go through. No abstractions nobody asked for, no code «for later». Deliberate simplifications are marked with a `ponytail:` comment that states the limit and when to go beyond it.

## Efficiency

The cost of a session grows with the number of calls and the size of the context: every call rereads all of it. The subscription has five-hour and weekly limits.

- **Agents**: they are the most expensive item. They are started only when a task needs them and only the relevant specialists, never all the agencies together (section «Agencies»).
- One session per phase: after the closure (CONVENTIONS §13.7) a new one is opened (`/clear`). The state is in the plan, in git and in memory.
- Within the phase, `/compact` when the context gets large.
- During development, targeted tests (one test file, one e2e spec); the full check with `npm run verify`, in a single command.
- Independent reads in the same call; targeted lines instead of whole files; do not reread a file already in the context.
- Screenshots only for a visual check, not repeated on the same screen.
- `CONVENTIONS.md` for the sections relevant to the task, not the whole file.

## Verification

- `npm run verify` (typecheck, lint, unit tests, build) must pass before every commit.
- `npm run verify:e2e` (Playwright) before merging a phase, from the phase that introduces it.
- Visible changes are tried in the app (`npm run dev`) before declaring them done. If a check was not done, say so.
- CI (`.github/workflows/ci.yml`) runs the same two commands: the names `verify` and `verify:e2e` are the contract between the project and CI.

## Agencies

Five teams of roles. The role files are in `agents/`, in English in the `en/` subfolder of each agency (in each folder `README.md`, `00-common-rules.md` with the common rules and one numbered file per role; the Italian files sit next to `en/`); the agents are consulted through the Agentrica MCP server (`.mcp.json`), as «How to consult an agent» says. The full picture is in `docs/AI Multi-Agency System.md`.

| Agency | Roles | Prefix | What it does | Active |
|---|---|---|---|---|
| Software (`agents/ai_software_agency/en/`) | 12 | `sw-` | analysis, development and verification. It is the only one that changes the code | yes |
| Web Design (`agents/ai_web_design_agency/en/`) | 10 | `design-` | audits of UX, UI, information architecture, design system, data and charts, accessibility, usability and copy. Read-only | <!-- yes/no --> |
| Privacy & Compliance (`agents/ai_privacy_compliance_agency/en/`) | 10 | `privacy-` | data processing, legal bases, retention, vendors, data security, DPIA. Read-only, does not declare compliance | <!-- yes/no --> |
| Business & Product (`agents/ai_business_product_development_agency/en/`) | 12 | `biz-` | goals, requirements, priorities, roadmap, business case, market. Read-only, no external contact | <!-- yes/no --> |
| Cybersecurity (`agents/ai_cybersecurity_agency/en/`) | 12 | `sec-` | threat model, hosting and database configuration, access, dependencies and vulnerabilities, logs, incident response. Read-only, no active tests without written authorisation | <!-- yes/no --> |

<!-- In F0 decide with the user which agencies stay active. Inactive ones are removed from agents/ and, if the project has subagents, from .claude/agents/ (when needed they can be copied again from the same folders of the `@agentrica/mcp` package) and the decision goes in the table of plan/README.md. If there are subagents, also remove the roles the project does not use. -->

### Two rules that always apply

- **Only the relevant agents.** All work on the project goes through the agents (main rule, at the top), but never all agencies or all agents together. For each task choose the agency and only the relevant specialists, at the moment they are needed.
- **User confirmation.** Every final decision of the agencies is a proposal until the user confirms it: priorities and content of the backlog, requirements and specifications, architecture and data model choices, findings accepted or rejected, closing a task, new dependencies, commits, merges, pushes, deploys and migrations. Present the alternatives with their reasons (with `ask_user`, in Agentrica's panel; AskUserQuestion only if the panel is off) and proceed only after the user's go-ahead. At the end of a phase, commit, merge into `develop`, push and `tokensave sync` are confirmed with a single question (CONVENTIONS §13.7).

### How to consult an agent

Agents are loaded from the Agentrica MCP server, which shows them in the local panel. In Claude Code the server's tools are loaded with ToolSearch (`mcp__agentrica__`).

1. `list_agents` to choose: the director of each department is marked as such.
2. `agent` with the id of the department's **director** (`-01`) and the task: it says which specialists are needed and in what order.
3. `agent` with the id of each specialist, **one at a time**: each starts from the previous one's result, and two agents are never loaded in the same response.
4. The director consolidates the results and presents them to the user. Across departments the order in «How to use them» applies.
5. The user's choices are asked with `ask_user`, which shows them in the panel (`open_panel` gives the address). If an agent's text offers a rating, use `rate_agent`.

For Agentrica's agents do not use Claude Code's `Agent` tool (subagents): the panel shows the agents loaded from the server, and subagents only in a separate section. The subagents in `.claude/agents/` exist only if the project was created with `init --subagents`; they are started only when the user asks for them or for a parallel audit, and each one loads its agent from the server.

### How to use them

- In everyday work the roles are a way of working of the main session, loaded with `agent` as above.
- New features or initiatives: business roles for goal, value, requirements and priorities, before design.
- Changes with visible effects: the relevant design roles before (checks) and after (review in the app).
- Processing of personal data (new data, import and export, vendors, retention): privacy roles before (requirements) and after (check of the measures).
- Code changes: development in the software roles matching the files touched, then QA (always), Security and Performance when affected, finally the Code Reviewer on the diff (`APPROVE`, `REQUEST_CHANGES` or `COMMENT`).
- Security of the whole application (periodic audits, new integrations or vendors, secrets and access, dependency updates, incidents): cybersecurity roles. The diff of a single change stays with the software agency's Security; personal data stays with privacy.
- Order for a cross-cutting request: business → design → privacy → **user confirmation** → software → design review → privacy review → Code Reviewer → **user confirmation**. Skip the steps that are not relevant or that belong to inactive agencies.
- Design and privacy findings are requirements: if one is not feasible it goes back to the agency or to the user; it is not changed silently.
- Priorities: `P0` critical, `P1` high, `P2` medium, `P3` low, always with a reason. Technical severity, privacy risk, UX impact and business impact are separate dimensions.

### Adaptations to this repository

<!-- To fill in during F0 and update when they change. -->

- **Stack.** <!-- e.g. «Vite and strict TypeScript; pure, tested logic in src/lib» -->
- **Data.** <!-- Mocks and fake data, or the user's real data: where it is, what the agents must never do (save, import, delete, copy into the repository). -->
- **Audit.** Findings are in `audit/<audit_id>/` (one JSON per agent, the directors' reports in `report-*.md`), evidence in `audit/<audit_id>/evidence/`.
- **Versioned.** `agents/`, `.claude/agents/` (if present), `audit/`, `docs/` and `plan/` are in the repository. If audit evidence shows personal data, enable the `audit/*/evidence/` line in `.gitignore`.
- Push, deploy and production migrations require the user's explicit approval.
