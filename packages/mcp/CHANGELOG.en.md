# What's new in @agentrica/mcp

Each version with its npm publication date and its changes by type: Added, Changed, Fixed, Breaking. The version is pinned in the server command (`@agentrica/mcp@<version>`): an update arrives only when you change it. The Italian version is [CHANGELOG.md](CHANGELOG.md).

## 0.18.0 — 2026-11-27

### Changed
- Recommended model for 10 more agents, measured on the test cases (F49, `examples/risultati/2026-11-27-ondata-2.md`): Sonnet for AIBPD-02 Market Research, AIBPD-03 Product Innovation, AIBPD-04 Product Manager, AIBPD-06 Business & Financial, AIBPD-07 Growth & Monetization, AIBPD-08 Product Marketing, AIBPD-09 Sales & Revenue, AIBPD-10 Business Development, AIBPD-11 Customer Success, AIBPD-12 Portfolio & Roadmap. It shows in `list_agents`, in the agent's text and in the subagents of `init --subagents`.
- README: table of recommended models with the 27 measured agents; the other 29 stay on the session's model.

## 0.17.1 — 2026-11-26

### Changed
- Server instructions: a request for a new feature starts from the business director even on a new project, with no stack chosen yet or F0 to do. Before, the model often started from software for the technical base.

### Fixed
- `check` tells a missing file from one it cannot read. With the README's least privilege permissions (Node's permission model) it says access is denied and how to grant it, instead of answering «no format problems». A phase file that is a link outside the project is now reported as «cannot be read», not «not found». The command with a folder it cannot read no longer says «Folder not found».

## 0.17.0 — 2026-11-25

### Added
- Panel: alerts in a single area, the same on every page (new version, `plan/` changed without agents, plan to create, format errors and contradictions), each on one line with the count and what to do, and a collapsible «Where» with the `file:line` points to copy.
- Panel, Session: at the top «Needs your attention» with the choices to make and the agents to rate, only when there is something.
- Panel, header: server version, time of the last update, link to the site in the panel's language.
- Panel, Findings: priority filter next to the department one.

### Changed
- Panel, Plan: tasks done out of the total with a bar, priority with its rationale under the task, outcome with the ✓ sign, completed phases out of the total and a collapsible list of the phases. On a phone the page is about a third as long.
- Panel, Usage: summary at the top, breakdown in tabs (day, agent, model, session) with one table at a time, sharing at the bottom; the model saving appears only when there is one.
- Panel: targets of at least 44 px, live regions that speak only when something changes, tabs that wrap on a phone.

### Fixed
- A phase's status is read from its first word: «completed (0.10.0)» is completed, in the panel and in `check`. Before, the «Current phase» could be a phase already closed.
- With `--no-ratings` the «Ratings» tab no longer appears.

## 0.16.0 — 2026-11-25

### Added
- `npx @agentrica/mcp reminder [folder]` command: adds the reminder to `.claude/settings.json` of a project already under way (set up with `add`, or with a `settings.json` that `init --existing` leaves alone). It keeps the rest of the file, with its indentation and line endings, does not repeat the reminder if it is already there, and leaves untouched a file that is not in the shape Claude Code uses.

### Changed
- Panel: contradictions are in a box of their own, separate from format errors, each with its title.

### Fixed
- `check` gives the line of an unreadable JSON file when Node writes it in the error message.

## 0.15.1 — 2026-11-25

### Fixed
- The package READMEs show the commands of this version: 0.15.0 had those of 0.13.0. npm description without the number of agents.

## 0.15.0 — 2026-11-25

### Added
- Format check of `plan/` and `audit/`, without models: tables and sections, required fields, unique ids, phase files that exist, priorities, evidence of closed findings; with file and line. It also reports contradictions (same finding with different values in two files, closed finding without evidence, completed phase with P0 tasks without an outcome) with both locations, without choosing. Use it with the `check` tool, with the command `npx @agentrica/mcp check [folder]` (exits with 1 if it finds something, for CI) and in the panel.
- The `report` tool always saves the report and, if the handover lacks an outcome, findings or open questions, tells the model.

### Changed
- Panel: format errors come from the check, so a malformed file shows up even outside the open phase. Findings in the design department's format (`observations`) are read.
- Server instructions: after writing in `plan/` or `audit/`, check their format with `check`.

### Fixed
- A backslash-escaped `|` (`it\|en`) stays in the table cell instead of splitting it.

## 0.14.0 — 2026-11-25

### Added
- Common rules once per department: the server remembers, for the session, the departments whose common rules and library index it has already sent. The first agent of the department receives them in full, the next ones a reference that says how to get them back, with the cards of their role; role file and task stay in full. One more specialist of a department already loaded weighs 54 to 59% less (3.6 to 5.1 KB).
- `full_rules` parameter of the `agent` tool: rules and index in full even if already sent, after `/compact` or in a new context. The server's instructions and the reference mention it.

### Changed
- The subagents of `init --subagents` call `agent` with `full_rules` true as their first step, because they have their own context. In projects already created the reference says to call `agent` again with `full_rules` if the rules are missing.
- Handovers between agents: the server's instructions, the director's and the specialist's text and the `AGENTS.md` of new projects ask for a short handover (outcome, findings with their evidence, open questions) instead of the previous agent's whole answer.
- The agents' prompts keep the full text.

## 0.13.0 — 2026-11-24

### Added
- A reminder on every request: `init` (also `--existing`) writes `.claude/settings.json` with a Claude Code `UserPromptSubmit` hook that reminds the model to load the right agent, because the server instructions arrive only at startup. The command is the same on Mac, Windows and Linux and sends nothing out; `--no-reminder` leaves it out, and if the file already exists `init --existing` leaves it alone and says how to add it by hand.
- Panel: if a file in `plan/` changes after the server started and no agent has been loaded in the session, the Session page says so at the top; the notice goes away with the first agent.
- README: a «What stays on your computer» table, with what leaves for each tool, command and page, to whom and when.

### Changed
- Server instructions: one sentence on what leaves the computer (only `rate_agent`, `share_usage` and `submit_project` after the user's yes, and the version check).

## 0.12.0 — 2026-11-24

### Changed
- Recommended model for 12 more agents, measured on the test cases (F37, `examples/risultati/2026-11-23-ondata-1.md`): Haiku for AICA-09 Vulnerability Management; Sonnet for AICA-03 AppSec, AICA-05 Network, AICA-07 SOC, AIPCA-05 Privacy Security, AIPCA-06 Data Governance, AIPCA-07 Vendor, AIPCA-08 Data Subject Rights, AISA-05 Frontend, AISA-07 Database, AISA-10 DevOps, AISA-11 Performance. It shows in `list_agents`, in the agent's text and in the subagents of `init --subagents`.
- README: the recommended-models table lists the 17 measured agents; the other 39 (directors and judgment roles by choice, the rest not measured or below the threshold) stay on the session's model.

## 0.11.1 — 2026-11-23

### Changed
- Server instructions and README: the order across departments includes the Code Reviewer before the last confirmation, as in `AGENTS.md`.
- README: Agentrica presents itself as an MCP server with AI agents organised in departments, no longer as a fictional company.

## 0.11.0 — 2026-11-22

### Added
- `init --existing` for a project already under way: it writes only the missing files, skips and lists those already there, and does not commit; no F0 «technical base», CI, `.nvmrc` or `.env.example`, and the plan starts without phases. If a `CLAUDE.md` already exists it says to add `@AGENTS.md`.
- Server instructions: the `plan/` format, with the offer to create it by reading the code if it is missing, and sessions per phase: planning writes only `plan/`, gets confirmed and suggests `/clear`; one phase per session, with `/clear` at its close.

### Changed
- Panel: without `plan/README.md`, or with a plan without phases, a piece of information with the ways to create it (`init --existing` or the request to Claude) instead of an error.
- `AGENTS.md`, `CONVENTIONS.md` and `plan/README.md` of new projects: planning is a session of its own and each phase opens in a new session.
- Server instructions with a length test: within the 4096 characters beyond which Claude Code truncates them.

## 0.10.0 — 2026-11-22

### Breaking
- `init` no longer copies the subagents into `.claude/agents/`: agents are consulted from the server with `agent`, one at a time. With `--subagents` it copies them, and each subagent has `mcp__agentrica__agent` and `mcp__agentrica__library` among its `tools` and, as its first step, loads its agent from the server, so it appears in the panel.

### Added
- Hierarchy: `list_agents` marks the director of each department; the director's text says how to coordinate the specialists, a specialist's text whom it reports to and to load the director first.
- Panel: the agents in use in call order, with the director marked, and a separate «Claude Code subagents» section with type, description and state of the subagents started in the session, read from the files Claude Code saves for the project.
- `report` tool, with the panel: the report of what an agent did, which the agent's text asks for at the end of the task; the panel shows it under the agent, with the whole task.
- Panel: the agents on a page of their own, «Agents», as a tree by department (one column per department, the director at the top, the call order number on the card); the Session shows the last three.
- Panel: ratings on a page of their own, «Ratings», with the number of agents to rate in the menu; a notice when a new agent starts working or there is an agent to rate, also as a system notification if you turn it on.

### Changed
- Agents are used even without naming them: a main rule at the top of `AGENTS.md` of new projects and in the server instructions, all work on the project goes through the agents; F0 decisions are proposed by the software director, and questions to the user go through `ask_user`.
- Server instructions: director before the specialists, one agent at a time, order across departments, `agent` instead of local subagents unless the user asks.
- The recommended model no longer asks to hand the task to a subagent.
- `AGENTS.md` of new projects: «How to consult an agent» section; department READMEs without subagents by default.

### Fixed
- Panel: the department colour in the agents in use and in the rating forms; the task is no longer cut at 120 characters; the start time of subagents comes from their transcript, and a subagent whose files Claude Code writes in a different format still appears, with «format not recognised», instead of disappearing.

## 0.9.0 — 2026-11-22

### Breaking
- Tools, commands and arguments in English, without aliases: `elenca_agenti` → `list_agents` (`reparto` → `department`), `agente` → `agent` (`compito` → `task`), the `compito` argument of the agents' prompts → `task`, `/mcp__agentrica__valuta` → `/mcp__agentrica__rate` (`agente` → `agent`), `/mcp__agentrica__progetto` → `/mcp__agentrica__project` (`rimuovi` → `remove`), `/mcp__agentrica__configura` → `/mcp__agentrica__configure`. The agents' prompt names (`aisa-02-software`) do not change.

### Added
- Agents in two languages: role files, common rules, department READMEs and library cards also in English, in `agents/<agency>/en/`. The server stops with a clear error if a file has no twin or if the sections do not match.
- Server language: instructions, tool replies, agent text, forms, messages of `install`, `add` and `init` and the panel in Italian or in English. By default the system language (Italian if it is Italian, English otherwise); you choose it with `--lang it` or `--lang en`, also in `install` and `add`, or with the «Language» item of the configuration (`lang` in `~/.agentrica/config.json`).
- `init` creates the project in the chosen language: in English the starter and the subagents come from `starter/en/`; `agents/` is copied with both languages.
- The panel reads plans and audits in Italian and in English (`## Phases`, `**Goal**`, `## Done`, keys `findings`, `title`, `priority`, `status`).
- This file, `CHANGELOG.en.md`, the English version of `CHANGELOG.md`, with every version since 0.1.0.

### Changed
- The links to the legal notice in the rating, token totals and project forms point to the page in the server's language (`/it/note-legali` or `/en/legal`).
- A project proposed without a display name is sent with an empty author: the site shows «Agentrica user» or «Utente di Agentrica» in the language of the page.

## 0.8.1 — 2026-11-22

### Fixed
- Panel: an agent used at the start of a long session stays among those to rate; before, it left the list after 20 calls to other agents.
- `/mcp__agentrica__progetto` with a text that is not the code of a proposal: the message explains that to propose a project the command runs without arguments.

### Changed
- `add` and `install` warn if Agentrica is also registered in another Claude Code scope (user, project or local), with the command to remove the registration you do not need.
- Departments' common rules: an agent stops only the processes it started, by PID, never by name.
- AIWDA-08 · GACRUX cites the right WCAG criteria for the focus indicator (2.4.7) and for `autocomplete` (1.3.5).
- AIWDA library: EN 301 549 (the Official Journal cites V3.2.1, not yet V4.1.1) and Legislative Decree 82/2022 (micro-enterprises, transition periods, supervision and penalties).
- The subagents copied by `init` refer to their department's library cards.
- English README: section on the recommended models.

## 0.8.0 — 2026-11-21

### Added
- Configuration with a form: team, panel, ratings and version notice are chosen at the session's first call to Agentrica (if the client shows forms) or with the `/mcp__agentrica__configura` command. The choices are saved in `~/.agentrica/config.json`, only on your computer, and apply from the next session; the options of the server command take precedence.
- `/mcp__agentrica__progetto` command and `submit_project` tool: propose one of your projects for the site's projects page even without a GitHub account, with any https link, consent and licence. It leaves only after the form or the confirmed preview; you get a code to withdraw it (`/mcp__agentrica__progetto` with `rimuovi`). `--no-ratings` removes it.
- `/mcp__agentrica__valuta` command: opens the rating form for the last agent used or for the one given, even in a session with a single agent; without forms it falls back to `rate_agent`.

### Fixed
- Clients that declare forms but close them without showing them (the Claude Code extension for VS Code): a form closed in less than 300 ms counts as not shown. The configuration is not saved, and for the rest of the session rating goes back to the `rate_agent` flow proposed by the agent.

### Changed
- Local panel on by default, with `open_panel` and `ask_user`: «open the panel» works right after installation. `--no-panel` or the configuration turn it off; `--panel` is still accepted. With Node's permission model without network or child processes the panel does not start and the server carries on. `init` no longer writes `--panel` in `.mcp.json`.
- The server writes one file, the configuration, and only after the form; with Node's permission model it neither reads nor writes it.

## 0.7.1 — 2026-11-19

### Fixed
- `install` and `add` on Windows: npm and claude installed with npm (`.cmd` files) started in the wrong folder and looked for `node_modules\npm\bin\npm-cli.js` in the current project, and `install` stopped with «npm install -g non riuscito». Now the command name goes to cmd without quotes.

## 0.7.0 — 2026-11-19

### Added
- Recommended model per role, measured on the trial cases: Haiku for AISA-08, Sonnet for AICA-04, AIPCA-02, AISA-09 and AIBPD-05, the session's model for the others. `elenca_agenti`, the agent text and the `model:` field of the subagents copied by `init` say so; the choice stays yours.
- «Consumo» page in the panel: tokens spent per agent, model, session and day, read from the project's Claude Code files (numbers only), with the cache saving and the estimated saving of the model.
- Agents' library: cards of recent notions for each department, with source, version and check and expiry dates. The agent text has their index; the read-only `library` tool returns one card of the agent's department.
- `share_usage` tool and «Condividi i totali con Agentrica» button in the panel: after the preview of the exact rows, they send the site the token totals of the last 30 days per session, day, agent, model and effort, without texts or file names. It leaves only after your confirmation; `--no-ratings` removes it together with `rate_agent`.

### Changed
- Departments' common rules: on a smaller model, a P0 or P1 finding or a doubt goes to the director or a reviewer on the larger model for a second look; dated notions are cited from the library, with source and date.
- README: the «Messi alla prova» section becomes «Mostra il tuo progetto», with the issue and the `agentrica` topic to appear on the site.

## 0.6.0 — 2026-11-18

### Added
- `npx -y @agentrica/mcp@0.6.0 install`: installs the package on the computer with `npm install -g` and registers it in Claude Code for all your projects. The same command on Mac, Windows and Linux; to update, run it again with the new version.
- `npx -y @agentrica/mcp@0.6.0 add`: registers in Claude Code the server started with npx, without installing anything; `--project` writes `.mcp.json` for the team, `--local` applies only to the current project.
- The server asks for the rating with a client form (MCP elicitation): when you load another agent, for the previous one, and after 30 minutes of use. Once per agent; if you decline it does not ask again. Clients without forms keep the previous flow.
- New version notice: at startup the server asks the npm registry for the latest version (no data sent) and, if there is a newer one, says so with the command to update, in a tool reply and in the panel's banner. `--no-update-check` turns the check off.
- This file, `CHANGELOG.md`, in place of the README's «Versioni» section.

### Changed
- The panel writes the department name next to its code: «reparto AISA · Software».
- Without forms, the invitation to rate the agent is at the end of its text, after the task.

### Fixed
- On Windows `init` writes `cmd /c npx` in `.mcp.json`: with `npx` alone Claude Code did not start the server.

### Breaking
- Prompts have the department in their name: `aisa-02` becomes `aisa-02-software` (also `-business`, `-cybersecurity`, `-privacy`, `-design`), so the command menu shows the department. The agent id (`AISA-02`), the code name, the argument of the `agente` tool and `--agents` stay the same.

## 0.5.0 — 2026-11-17

### Added
- Agents' rating: `rate_agent` tool in two steps, with preview and code; «Valuta gli agenti» section in the panel; proposal at the end of the work and reminder after 30 minutes. It is the server's only connection, and it leaves only after your confirmation; `--no-ratings` removes it.
- The agent says who it is (code name, role, department) at the start, when it switches to another agent and in the summary.

## 0.4.0 — 2026-11-16

### Added
- `init` command: creates a project with rules, phased plan, agencies, subagents, CI and `.mcp.json`. It replaces agentic-starter. The server is unchanged.

## 0.3.3 — 2026-11-16

### Added
- `@agentrica/mcp/catalog` export to read departments and agents from code. Agents and server behaviour unchanged.

## 0.3.2 — 2026-11-16

### Changed
- Panel in three pages (Sessione, Piano, Rilievi), with a menu and counters of pending choices and findings. Agents and server behaviour unchanged.

## 0.3.1 — 2026-11-15

### Changed
- Common rules with a shared severity scale (P0–P3) and a scale for the software department.

### Fixed
- The panel hides closed findings and counts new files separately.
- The id of the `agente` tool accepts only the department codes.

## 0.3.0 — 2026-11-15

### Added
- Local panel with `--panel`: phases, backlog, findings, agents in use and choices to make from the page (`open_panel` and `ask_user` tools). Without `--panel` nothing changes.

## 0.2.1 — 2026-11-15

### Added
- Name `io.github.flgisimone/agentrica` for the official MCP registry. Agents and behaviour unchanged.

## 0.2.0 — 2026-11-15

### Added
- `--agents` argument to load only a team of agents or departments.

### Changed
- With an empty project, or without what the role has to examine, the agent says so and proposes the first steps to confirm, without making up findings.

## 0.1.0 — 2026-11-15

### Added
- First published version: 56 agents in five departments, one prompt per agent and the `elenca_agenti` and `agente` tools.
