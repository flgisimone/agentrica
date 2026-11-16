# Agentrica MCP

[Italiano](README.md)

The Agentrica MCP server: the 56 AI agents of the five departments (AIBPD, AICA, AIPCA, AISA, AIWDA), usable in your project from Claude Code or any MCP client.

Each agent is a role with a declared method and limits, for example `AISA-02 · ALTAIR`, Senior Software Architect, or `AIPCA-03 · DUBHE`, Senior Privacy Legal Specialist. The server gives the model the department's common rules and the agent's role file, taken from [`agents/`](https://github.com/flgisimone/agentrica/tree/main/agents), and the model works in your project with those instructions.

The agent files are in Italian. The agent answers in the language you write in.

## What it does and does not do

- The server runs only locally: the client starts it on your computer and the two talk over stdio. The server has no remote part.
- The only content it reads is the `agents/` files included in the package, once, at startup. The text that reaches the model is the text of those files: you can read it before using it.
- It writes no files, opens no network connections, logs nothing, collects and sends no data, and has no telemetry. With `--panel` it opens a page on your computer only: see [Local panel](#local-panel).
- It runs nothing in your project. It only gives instructions to the model: what the model does in the project depends on the client and on the permissions you grant it.
- **Where the data goes.** The agent's text, the task and the files the model reads in your project go to the model provider through your client, under that provider's terms. Agentrica does not receive them. Leave personal data, secrets and customer data out of the task unless they are needed.
- The agents are AI: their conclusions are proposals to check. The privacy and security agents do not replace a DPO, a lawyer or a security officer, and their findings are not a compliance certification.

## Installation

You need Node 22 or later, with npm.

**Claude Code**, from your project folder:

```sh
claude mcp add agentrica -- npx -y @agentrica/mcp@0.3.2
```

On first start npx downloads the package from npm. The version stays the one you set until you change it: role updates do not arrive unless you choose them.

**Other MCP clients**: add the server to the client configuration, usually a JSON file like this:

```json
{
  "mcpServers": {
    "agentrica": {
      "command": "npx",
      "args": ["-y", "@agentrica/mcp@0.3.2"]
    }
  }
}
```

**Least privilege (recommended).** Install the package in its own folder and start it with Node's permission model: the server can only read that folder, and Node blocks file writes, network connections and child processes. The server needs none of them, so it works the same; the permissions limit the damage of any future defect.

```sh
npm install -g --ignore-scripts @agentrica/mcp@0.3.2
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
claude mcp add agentrica -- npx -y @agentrica/mcp@0.3.2 --agents aisa,aiwda-08
```

The command menu shows only the squad's prompts, and `elenca_agenti` and `agente` see only those agents too. Without `--agents` all 56 agents are available. An unknown id or code stops the server with a message naming it, in the client's logs. In Claude Code prompts do not enter the model's context (we checked with `/context`): a squad makes the menu shorter, it does not save tokens.

**Tools**, for clients that do not show prompts, or when you want the model to pick the agent:

| Tool | Input | Returns |
|---|---|---|
| `elenca_agenti` (list agents) | optional `reparto` (department: `AIBPD`, `AICA`, `AIPCA`, `AISA`, `AIWDA`) | id, code name, role and department of each agent |
| `agente` (agent) | `id` (e.g. `AISA-02`), optional `compito` (task) | the agent's full instructions |

For example: "Use elenca_agenti, pick the right Agentrica agent and check the accessibility of the login form".

Number 01 in each department is the director: it coordinates the specialists and consolidates their findings.

## Local panel

With `--panel` the server also opens a page on your computer where you follow the project and make the choices the agent asks you for, instead of answering in the terminal:

```sh
claude mcp add agentrica -- npx -y @agentrica/mcp@0.3.2 --panel
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

**What changes with `--panel`.** The server opens a random port on `127.0.0.1` only, reads `plan/`, `audit/` and the git status (`git status`) of the project folder, and keeps the last 20 agent calls in memory. It writes no files and sends no data off your computer. The page opens only with the random token in the URL, valid for that session; requests from other sites or with another `Host` are refused. The Node permission model recommended above does not apply with `--panel`, which needs the local network and `git`.

**Format of `plan/` and `audit/`.** The panel reads the agentic-starter plan format, in Italian, the same as Agentrica's own [`plan/`](https://github.com/flgisimone/agentrica/tree/main/plan) and [`audit/`](https://github.com/flgisimone/agentrica/tree/main/audit); if something is missing, the page says what.

- `plan/README.md` with a `## Fasi` section and a `| Fase | File | Contenuto | Stato |` table, the file as a link (`[14-pannello.md](14-pannello.md)`). The open phase is the first one whose status is neither `completata` nor `sospesa`.
- In the phase file: `# Title`, a `**Obiettivo**: …` line, `## Backlog` with the `| # | Task | Priorità |` table, `## Criteri di accettazione` and `## Fatto` as lists; a task is done when its id appears in bold under «Fatto» (`- **F14-01** …`). `## Rilievi aperti` is a list, with the priority (`P0`–`P3`) in the text; an item that says «risolto» or «chiuso» (resolved, closed; e.g. «Risolto in F6.») stays in the plan but the panel does not show it.
- `audit/<folder>/<file>.json` with `agente` (e.g. `"AICA-02 · …"`, which gives the department) and a `rilievi` list of objects with `id`, `titolo`, `priorita` and optional `stato`; a finding whose `stato` says «risolto» or «chiuso» is not shown.

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

## Versions

- **0.3.2**: the panel has three pages (Sessione, Piano, Rilievi) with a menu counting pending choices and findings; agents and server behaviour unchanged.
- **0.3.1**: the panel hides closed findings and counts new files separately; the `agente` tool only accepts department codes in ids; common rules with a shared severity scale (P0–P3) and a scale for the software department.
- **0.3.0**: local panel with `--panel`: phases, backlog, findings, agents in use and choices made from the page (`open_panel` and `ask_user` tools). Without `--panel` nothing changes.
- **0.2.1**: name `io.github.flgisimone/agentrica` for the official MCP registry; agents and behaviour unchanged.
- **0.2.0**: `--agents` argument to load only a squad of agents or departments; in an empty project, or when what the role must examine is missing, the agent says so and proposes first steps to confirm, without inventing findings.
- **0.1.0**: first published version. 56 agents in five departments, one prompt per agent and the `elenca_agenti` and `agente` tools.

## License

MIT. Agentrica is a fictional company: the agents are AI models guided by role files.
