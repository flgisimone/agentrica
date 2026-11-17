# Agentrica MCP

[Italiano](README.md)

The Agentrica MCP server: the 56 AI agents of the five departments (AIBPD, AICA, AIPCA, AISA, AIWDA), usable in your project from Claude Code or any MCP client.

Each agent is a role with a declared method and limits, for example `AISA-02 · ALTAIR`, Senior Software Architect, or `AIPCA-03 · DUBHE`, Senior Privacy Legal Specialist. The server gives the model the department's common rules and the agent's role file, taken from [`agents/`](https://github.com/flgisimone/agentrica/tree/main/agents), and the model works in your project with those instructions.

The agent files are in Italian. The agent answers in the language you write in.

## What it does and does not do

- The server runs only locally: the client starts it on your computer and the two talk over stdio. The server has no remote part.
- The only content it reads is the `agents/` files included in the package, once, at startup. The text that reaches the model is the text of those files: you can read it before using it.
- The server writes no files (only the [`init`](#new-project) command does, when you run it), logs nothing and has no telemetry. It connects to Agentrica in one case only: when you confirm an [agent rating](#ratings), and it sends only the score, the comment and the version. With `--no-ratings` it never connects. With `--panel` it opens a page on your computer only: see [Local panel](#local-panel).
- It runs nothing in your project. It only gives instructions to the model: what the model does in the project depends on the client and on the permissions you grant it.
- **Where the data goes.** The agent's text, the task and the files the model reads in your project go to the model provider through your client, under that provider's terms. Agentrica does not receive them. Leave personal data, secrets and customer data out of the task unless they are needed.
- The agents are AI: their conclusions are proposals to check. The privacy and security agents do not replace a DPO, a lawyer or a security officer, and their findings are not a compliance certification.

## Installation

You need Node 22 or later, with npm.

**Claude Code**, from your project folder:

```sh
claude mcp add agentrica -- npx -y @agentrica/mcp@0.5.0
```

On first start npx downloads the package from npm. The version stays the one you set until you change it: role updates do not arrive unless you choose them.

**Other MCP clients**: add the server to the client configuration, usually a JSON file like this:

```json
{
  "mcpServers": {
    "agentrica": {
      "command": "npx",
      "args": ["-y", "@agentrica/mcp@0.5.0"]
    }
  }
}
```

**Least privilege (recommended).** Install the package in its own folder and start it with Node's permission model: the server can only read that folder, and Node blocks file writes, network connections and child processes. The server needs none of them, so it works the same; the permissions limit the damage of any future defect. With these permissions, sending a [rating](#ratings) fails with a clear message: to rate agents add `--allow-net`, otherwise add `--no-ratings` at the end of the command.

```sh
npm install -g --ignore-scripts @agentrica/mcp@0.5.0
npm root -g
```

With the folder printed by `npm root -g` in place of `/global/folder`:

```sh
claude mcp add agentrica -- node --permission --allow-fs-read=/global/folder/@agentrica/mcp /global/folder/@agentrica/mcp/dist/mcp/src/server.js
```

**Provenance.** The package is published by the repository CI with provenance: npm shows which commit it was built from, and `npm audit signatures` in your project verifies its signature.

**From a clone**, to work on Agentrica: `npm ci` at the repository root, then instead of the npx command `node --permission --allow-fs-read=/path/to/agentrica /path/to/agentrica/packages/mcp/src/server.ts` (Node 26, as in `.nvmrc`).

## Usage

**Prompts.** Each agent is a prompt named after its lowercase id (`aisa-02`, `aica-01`…) with one optional argument, `compito` (the task). In Claude Code prompts become commands:

```
/mcp__agentrica__aisa-02 "Review the boundaries between the modules in src/"
```

Put the task in quotes: Claude Code splits arguments on spaces.

**Squad.** With `--agents` the server loads only the agents you list: agent ids and department codes, comma-separated, case-insensitive. For example the whole software department plus the accessibility agent:

```sh
claude mcp add agentrica -- npx -y @agentrica/mcp@0.5.0 --agents aisa,aiwda-08
```

The command menu shows only the squad's prompts, and `elenca_agenti` and `agente` see only those agents too. Without `--agents` all 56 agents are available. An unknown id or code stops the server with a message naming it, in the client's logs. In Claude Code prompts do not enter the model's context (we checked with `/context`): a squad makes the menu shorter, it does not save tokens.

**Tools**, for clients that do not show prompts, or when you want the model to pick the agent:

| Tool | Input | Returns |
|---|---|---|
| `elenca_agenti` (list agents) | optional `reparto` (department: `AIBPD`, `AICA`, `AIPCA`, `AISA`, `AIWDA`) | id, code name, role and department of each agent |
| `agente` (agent) | `id` (e.g. `AISA-02`), optional `compito` (task) | the agent's full instructions |
| `rate_agent` | `id`, `rating` from 1 to 5, optional `comment` and `publish`; then `code` | a preview of the rating and a code; with the code, the sending (see [Ratings](#ratings)) |

For example: "Use elenca_agenti, pick the right Agentrica agent and check the accessibility of the login form".

Number 01 in each department is the director: it coordinates the specialists and consolidates their findings.

While working, the agent says who it is, for example "AISA-02 · ALTAIR — Senior Software Architect, reparto AISA (AI Software)": at the start, when it hands over to another agent and in the final summary.

## Ratings

You can give an agent a score from 1 to 5 and a comment on what to improve: ratings are used to fix the role files. When the agent has finished the task it suggests a rating, once per session; if it has been working for more than 30 minutes, the server reminds the model once. You can also ask ("rate AISA-02").

- **Nothing is sent without your yes.** `rate_agent` first shows a preview of what will be sent and a code valid for 10 minutes; the model shows it to you and sends only with the code, exactly that content. With `--panel` you rate from the page, in the "Valuta gli agenti" section.
- **What is sent.** The agent id, the score, the comment, whether you allow the comment to be published on the site (off by default), the package version and a random rating code. No task, files, paths or project name, no account. Do not write names, personal data or parts of your project in the comment.
- **On the site.** Every agent with at least 5 ratings shows the average, the number of ratings and their distribution, and a ranking appears once at least 5 agents pass that threshold. A comment appears only if you allowed it to be published and after it is approved (criteria in the [legal notes](https://agentrica.vercel.app/note-legali#valutazioni), in Italian), with the score and the month.
- **After sending** you get the rating code: with it you can ask for the rating to be deleted or for the comment not to be published. An agent can be rated once per session and once a day from the same network.
- **If sending fails** (offline, service down) the tool says so and the work goes on; the rating is not stored anywhere.
- **To drop the tool** and the suggestions, add `--no-ratings` to the command: the server never connects.

How ratings are handled: [legal notes](https://agentrica.vercel.app/note-legali#valutazioni) (in Italian).

## Local panel

With `--panel` the server also opens a page on your computer where you follow the project and make the choices the agent asks you for, instead of answering in the terminal:

```sh
claude mcp add agentrica -- npx -y @agentrica/mcp@0.5.0 --panel
```

Then ask the agent to open the panel (`open_panel` tool): the page opens in your browser. It has three pages, with a menu at the top counting pending choices and findings:

- **Sessione** (session): pending choices (*Da decidere*, to decide), with options and reasons, whose answer, with an optional note, goes back to the agent; next to them, the Agentrica agents called in this session (*Agenti in uso*, agents in use), with the start of the task;
- **Piano** (plan): the open phase with backlog and acceptance criteria, and all project phases;
- **Rilievi** (findings): open findings from phases and audits, by priority and department.

With the panel the model has two more tools:

| Tool | Input | What it does |
|---|---|---|
| `open_panel` | none | opens the page in the browser and returns its URL |
| `ask_user` | `question`, 2–4 `options` (`label`, `description`), optional `header` and `multiple` | shows the choice in the page and returns the answer |

If the page is not open, `ask_user` opens it. The client waits for the answer as long as the server sends progress notifications (up to 4 hours; 25 minutes with a client that does not request them), then the agent asks in the terminal. The client's own questions, such as tool permissions, stay in the client.

**What changes with `--panel`.** The server opens a random port on `127.0.0.1` only, reads `plan/`, `audit/` and the git status (`git status`) of the project folder, and keeps the last 20 agent calls in memory. It writes no files and sends no data off your computer, except the ratings you send from the page. The page opens only with the random token in the URL, valid for that session; requests from other sites or with another `Host` are refused. The Node permission model recommended above does not apply with `--panel`, which needs the local network and `git`.

**Format of `plan/` and `audit/`.** The panel reads the plan format created by `init`, in Italian, the same as Agentrica's own [`plan/`](https://github.com/flgisimone/agentrica/tree/main/plan) and [`audit/`](https://github.com/flgisimone/agentrica/tree/main/audit); if something is missing, the page says what.

- `plan/README.md` with a `## Fasi` section and a `| Fase | File | Contenuto | Stato |` table, the file as a link (`[14-pannello.md](14-pannello.md)`). The open phase is the first one whose status is neither `completata` nor `sospesa`.
- In the phase file: `# Title`, a `**Obiettivo**: …` line, `## Backlog` with the `| # | Task | Priorità |` table, `## Criteri di accettazione` and `## Fatto` as lists; a task is done when its id appears in bold under «Fatto» (`- **F14-01** …`). `## Rilievi aperti` is a list, with the priority (`P0`–`P3`) in the text; an item that says «risolto» or «chiuso» (resolved, closed; e.g. «Risolto in F6.») stays in the plan but the panel does not show it.
- `audit/<folder>/<file>.json` with `agente` (e.g. `"AICA-02 · …"`, which gives the department) and a `rilievi` list of objects with `id`, `titolo`, `priorita` and optional `stato`; a finding whose `stato` says «risolto» or «chiuso» is not shown.

## New project

`init` creates a project with Agentrica's way of working, ready for Claude Code:

```sh
npx -y @agentrica/mcp@0.5.0 init my-project --name "My project"
```

Without a folder it uses the current one; without `--name` the name is the folder's. It writes, in Italian:

- `AGENTS.md` and `CLAUDE.md` (rules for agents: tokensave, the Ponytail ladder, efficiency, checks, agencies) and `CONVENTIONS.md` (code, tests, phases, closing and release), with the stack-specific parts marked «da compilare» (to fill in);
- `plan/` with `README.md` (decisions, glossary, phases) and `00-base.md`, the F0 phase to start from; `audit/` and `docs/`;
- `agents/` and `.claude/agents/`: the 56 roles of this version and one subagent per role, with the project name;
- `.github/workflows/ci.yml` (`npm run verify` and `verify:e2e`, skipped until F0 creates them), `.gitignore`, `.nvmrc`, `.env.example`;
- `.mcp.json` with this server at an exact version and `--panel`, so the panel reads the plan right away.

If even one file already exists, `init` writes nothing and lists them. Outside a git repository it makes the first commit on `main` and leaves `develop` checked out; inside one it does not commit. Then open Claude Code in the folder and ask it to open phase F0. `init` is the only command that writes files: the server stays read-only. It replaces agentic-starter, which is no longer updated.

## Put to the test

Three agents tested on 2026-11-15 against three small projects with planted, documented defects, using `@agentrica/mcp@0.2.0 --agents <id>`, Claude Code for VS Code and Opus 5.5 (medium reasoning). One run per case, counted by hand.

| Agent | Project | Defects found | False findings | Other valid findings |
|---|---|---|---|---|
| AISA-09 · REGULUS, Application Security | Node REST API | 6 of 6 | 0 | 2 |
| AIWDA-08 · GACRUX, Accessibility | sign-up form | 8 of 8 | 0 | 2 |
| AIPCA-02 · ALIOTH, GDPR | gym booking service | 7 of 7 | 0 | 3 |

Limits: the defects are few, known and fairly obvious; one model and one run per case; a result like this says nothing about how an agent does on a large project. Projects, expected defects, counting rules and the agents' full reports (in Italian) are in [`examples/`](https://github.com/flgisimone/agentrica/tree/main/examples): you can repeat the tests.

## Updates

The agents' text comes from the `agents/` files of the installed version. To update, change the version in the command (or reinstall with `npm install -g`) and restart the client. Ids and code names do not change.

The same catalog can be read from code, without starting the server: `import { loadCatalog } from "@agentrica/mcp/catalog"` returns departments and agents (with the `Department` and `Agent` types) from the package's `agents/`. The Agentrica site uses it.

## Versions

- **0.5.0**: agent ratings (two-step `rate_agent` tool with preview and code, "Valuta gli agenti" section in the panel, suggestion at the end of the work and a reminder after 30 minutes), the server's only connection and only after your confirmation; `--no-ratings` removes it. The agent says who it is (code name, role, department) at the start, at handovers and in the summary.
- **0.4.0**: `init` command that creates a project with rules, phased plan, agencies, subagents, CI and `.mcp.json` (replaces agentic-starter); the server is unchanged.
- **0.3.3**: `@agentrica/mcp/catalog` export to read departments and agents from code (used by the site, now in a separate repository); agents and server behaviour unchanged.
- **0.3.2**: the panel has three pages (Sessione, Piano, Rilievi) with a menu counting pending choices and findings; agents and server behaviour unchanged.
- **0.3.1**: the panel hides closed findings and counts new files separately; the `agente` tool only accepts department codes in ids; common rules with a shared severity scale (P0–P3) and a scale for the software department.
- **0.3.0**: local panel with `--panel`: phases, backlog, findings, agents in use and choices made from the page (`open_panel` and `ask_user` tools). Without `--panel` nothing changes.
- **0.2.1**: name `io.github.flgisimone/agentrica` for the official MCP registry; agents and behaviour unchanged.
- **0.2.0**: `--agents` argument to load only a squad of agents or departments; in an empty project, or when what the role must examine is missing, the agent says so and proposes first steps to confirm, without inventing findings.
- **0.1.0**: first published version. 56 agents in five departments, one prompt per agent and the `elenca_agenti` and `agente` tools.

## License

MIT. Agentrica is a fictional company: the agents are AI models guided by role files.
