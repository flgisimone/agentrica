# Agentrica MCP

[![Agentrica MCP on mcprush](https://mcprush.com/badge/agentrica-mcp/compact.svg)](https://mcprush.com/to/agentrica-mcp?ref=badge)

[Italiano](README.md)

The Agentrica MCP server: the 56 AI agents of the five departments (AIBPD, AICA, AIPCA, AISA, AIWDA), usable in your project from Claude Code or any MCP client.

Each agent is a role with a declared method and limits, for example `AISA-02 · ALTAIR`, Senior Software Architect, or `AIPCA-03 · DUBHE`, Senior Privacy Legal Specialist. The server gives the model the department's common rules and the agent's role file, taken from [`agents/`](https://github.com/flgisimone/agentrica/tree/main/agents), and the model works in your project with those instructions.

The agent files are in Italian. The agent answers in the language you write in.

## What it does and does not do

- The server runs only locally: the client starts it on your computer and the two talk over stdio. The server has no remote part.
- The only content it reads is the `agents/` files included in the package, once, at startup. The text that reaches the model is the text of those files: you can read it before using it.
- The server writes a single file, your [configuration](#configuration) in `~/.agentrica/config.json`, and only after you answer the form; other files are written only by the [`init`](#new-project) command, when you run it. It logs nothing and has no telemetry. It connects to the internet in two cases:
  - to Agentrica, when you confirm an [agent rating](#ratings), and it sends only the score, the comment and the version, or when you confirm sending your [token totals](#token-totals), and it sends only token counts per day, agent, model and effort, or when you confirm proposing [a project of yours](#show-your-project), and it sends only the form's fields; `--no-ratings` turns all three off;
  - to the npm registry, at startup, to find out whether there is a [new version](#updating-and-uninstalling): a request with no data, npm only sees your IP address and program, as when npx downloads the package; `--no-update-check` turns it off.

  With `--no-ratings --no-update-check` it never connects. By default it also opens a page on your computer only: see [Local panel](#local-panel); `--no-panel` turns it off.
- It runs nothing in your project. It only gives instructions to the model: what the model does in the project depends on the client and on the permissions you grant it.
- **Where the data goes.** The agent's text, the task and the files the model reads in your project go to the model provider through your client, under that provider's terms. Agentrica does not receive them. Leave personal data, secrets and customer data out of the task unless they are needed.
- The agents are AI: their conclusions are proposals to check. The privacy and security agents do not replace a DPO, a lawyer or a security officer, and their findings are not a compliance certification.

## Installation

You need Node 22 or later, with npm. The commands are the same on Mac, Windows (PowerShell or cmd) and Linux.

**On the whole computer (recommended)**, for Claude Code:

```sh
npx -y @agentrica/mcp@0.8.0 install
```

It installs the package with `npm install -g` and registers it in Claude Code with `user` scope: every project you open already has Agentrica. The server starts with `node` from npm's global folder: it starts fast and also works offline. Restart Claude Code and check with `claude mcp list`.

**Without installing anything**, for Claude Code:

```sh
npx -y @agentrica/mcp@0.8.0 add
```

It registers the server started with npx (on Windows `cmd /c npx`), which downloads the package to its cache on first start. The scope is `user`, all your projects; with `--project` it writes `.mcp.json` in the current folder, to share with your team (it works on the system it was created on), with `--local` it applies to the current project and to you only. For your team, from the project folder:

```sh
npx -y @agentrica/mcp@0.8.0 add --project
```

The server options (`--agents`, `--no-panel`, `--no-ratings`, `--no-update-check`) go at the end of `install` and `add`, which pass them to the server. Run again, they replace Agentrica's registration in the same scope. If Node 22, npm or the `claude` command are missing, they say so and print the commands to run by hand.

The version stays the one you set until you change it: role updates do not arrive unless you choose them. See [Updating and uninstalling](#updating-and-uninstalling).

**By hand in Claude Code**, without `install` or `add`:

```sh
claude mcp add --scope user agentrica -- npx -y @agentrica/mcp@0.8.0
```

On Windows: `claude mcp add --scope user agentrica -- cmd /c npx -y @agentrica/mcp@0.8.0`.

**Other MCP clients**: add the server to the client configuration, usually a JSON file like this:

```json
{
  "mcpServers": {
    "agentrica": {
      "command": "npx",
      "args": ["-y", "@agentrica/mcp@0.8.0"]
    }
  }
}
```

On Windows:

```json
{
  "mcpServers": {
    "agentrica": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@agentrica/mcp@0.8.0"]
    }
  }
}
```

**Least privilege (recommended).** Install the package in its own folder and start it with Node's permission model: the server can only read that folder, and Node blocks file writes, network connections and child processes. The server needs none of them, so it works the same; the permissions limit the damage of any future defect. With these permissions, sending a [rating](#ratings) fails with a clear message and the version check does not run: to rate agents add `--allow-net`, otherwise add `--no-ratings --no-update-check` at the end of the command. The [panel](#local-panel) does not start with these permissions.

```sh
npm install -g --ignore-scripts @agentrica/mcp@0.8.0
npm root -g
```

With the folder printed by `npm root -g` in place of `/global/folder`:

```sh
claude mcp add --scope user agentrica -- node --permission --allow-fs-read=/global/folder/@agentrica/mcp /global/folder/@agentrica/mcp/dist/mcp/src/server.js
```

On Windows the folder is usually `C:\Users\<name>\AppData\Roaming\npm\node_modules`; if it contains spaces, quote the path and the whole option:

```sh
claude mcp add --scope user agentrica -- node --permission "--allow-fs-read=C:\Users\<name>\AppData\Roaming\npm\node_modules\@agentrica\mcp" "C:\Users\<name>\AppData\Roaming\npm\node_modules\@agentrica\mcp\dist\mcp\src\server.js"
```

**Provenance.** The package is published by the repository CI with provenance: npm shows which commit it was built from, and `npm audit signatures` in your project verifies its signature.

**From a clone**, to work on Agentrica: `npm ci` at the repository root, then instead of the npx command `node --permission --allow-fs-read=/path/to/agentrica /path/to/agentrica/packages/mcp/src/server.ts` (Node 26, as in `.nvmrc`).

## Usage

**Prompts.** Each agent is a prompt named after its lowercase id and its department (`aisa-02-software`, `aica-01-cybersecurity`, `aibpd-01-business`, `aipca-02-privacy`, `aiwda-08-design`) with one optional argument, `compito` (the task). In Claude Code prompts become commands, and the menu shows the department:

```
/mcp__agentrica__aisa-02-software "Review the boundaries between the modules in src/"
```

Up to 0.5.0 the name was the id alone (`aisa-02`).

Put the task in quotes: Claude Code splits arguments on spaces.

**Squad.** With `--agents` the server loads only the agents you list: agent ids and department codes, comma-separated, case-insensitive. For example the whole software department plus the accessibility agent:

```sh
npx -y @agentrica/mcp@0.8.0 install --agents aisa,aiwda-08
```

The command menu shows only the squad's prompts, and `elenca_agenti` and `agente` see only those agents too. Without `--agents` all 56 agents are available. An unknown id or code stops the server with a message naming it, in the client's logs. In Claude Code prompts do not enter the model's context (we checked with `/context`): a squad makes the menu shorter, it does not save tokens.

**Tools**, for clients that do not show prompts, or when you want the model to pick the agent:

| Tool | Input | Returns |
|---|---|---|
| `elenca_agenti` (list agents) | optional `reparto` (department: `AIBPD`, `AICA`, `AIPCA`, `AISA`, `AIWDA`) | id, code name, role and department of each agent |
| `agente` (agent) | `id` (e.g. `AISA-02`), optional `compito` (task) | the agent's full instructions, with the index of the department's library |
| `library` | the agent's `id`, `cards` (card ids, at most 10) | the cards of the agent's department [library](#library), with source, version and dates |
| `rate_agent` | `id`, `rating` from 1 to 5, optional `comment` and `publish`; then `code` | a preview of the rating and a code; with the code, the sending (see [Ratings](#ratings)) |
| `share_usage` | none; then `code` | a preview of the project's token totals and a code; with the code, the sending (see [Token totals](#token-totals)) |
| `submit_project` | `name`, `url`, `description`, `departments`, optional `agents` and `author`, `consent`, `license`; then `code` | a preview of a project proposal and a code; with the code, the sending (see [Show your project](#show-your-project)) |

For example: "Use elenca_agenti, pick the right Agentrica agent and check the accessibility of the login form".

Number 01 in each department is the director: it coordinates the specialists and consolidates their findings.

**Commands.** Besides the agents' prompts there are `/mcp__agentrica__valuta` (rate), which opens the [rating](#ratings) form for the last agent used (or the one you name, e.g. `/mcp__agentrica__valuta AISA-02`), `/mcp__agentrica__progetto` (project), which proposes a project of yours for the site without a GitHub account (see [Show your project](#show-your-project)), and `/mcp__agentrica__configura` (configure), which opens the [configuration](#configuration) form.

While working, the agent says who it is, for example "AISA-02 · ALTAIR — Senior Software Architect, reparto AISA (AI Software)": at the start, when it hands over to another agent and in the final summary.

## Configuration

Squad, panel, ratings and the new-version notice can be chosen with a form, without running `add` or `install` again.

- **When.** If the client shows forms (MCP elicitation, like Claude Code), the form appears at the first call to Agentrica in a session, until a configuration is saved. After that, reopen it with `/mcp__agentrica__configura`. If you close the first form without choosing, the defaults are saved and it does not come back.
- **Where.** Your choices are saved on your computer in `~/.agentrica/config.json` (on Windows `C:\Users\<name>\.agentrica\config.json`), readable only by your user, and apply from the next session in every project. It holds only the four choices, for example `{"version": 1, "agents": "aisa,aiwda-08", "panel": false, "ratings": true, "updateCheck": true}`; no paths, projects or dates. Nothing reaches Agentrica.
- **Precedence.** Options written in the server command (`--agents`, `--panel`, `--no-panel`, `--no-ratings`, `--no-update-check`) win over the file, one by one, and are not shown in the form.
- **Ratings on** only means the server may ask you for a score: every sending still needs your confirmation.
- **Without forms** (including the Claude Code VS Code extension, which declares forms but closes them without showing them: the server notices and saves nothing) `/mcp__agentrica__configura` shows the configuration to the model, which can write the file for you with your permission; or write it by hand, or use the options.
- An invalid file (wrong format, keys or squad) is ignored, with a line in the client's logs, and the form rewrites it. To go back to the defaults, delete the file.
- With Node's [least privilege](#installation) permissions the server neither reads nor writes the file: use the command options.

## Recommended models

The server does not choose the model: your client does. For some agents, though, we recommend a model smaller than Opus, because on the same test cases it finds the same defects with no more false positives and costs less (of your subscription limits, or in dollars with the API).

| Agent | Recommended model | Cost on the task compared with Opus |
|---|---|---|
| AISA-08 · DENEB, QA | Haiku | −96% |
| AISA-09 · REGULUS, Application Security | Sonnet | −52% |
| AICA-04 · ALNILAM, Cloud Security | Sonnet | −52% |
| AIPCA-02 · ALIOTH, GDPR | Sonnet | −52% |
| AIBPD-05 · ALGIEBA, Business Analyst | Sonnet | −52% |

The other 51 agents have not been measured: they work with your session's model. The cost is the average over the test cases of 2026-11-19 (API prices of 2026-11-03); measurements, cases and reports are in [`examples/risultati/2026-11-19-modelli.md`](https://github.com/flgisimone/agentrica/blob/main/examples/risultati/2026-11-19-modelli.md) (in Italian).

- **Where you see it.** In `elenca_agenti` and at the top of the agent's text ("Modello consigliato: Sonnet…"): if the client allows it, the model hands the task to a subagent with that model.
- **Subagents.** The subagents copied by [`init`](#new-project) into `.claude/agents/` already have `model:` set to the recommended model (the others `inherit`). To change it, edit that line (`opus`, `sonnet`, `haiku` or `inherit`).
- **Session.** In Claude Code you change the session's model with `/model`.
- **Review.** The departments' rules ask an agent on a smaller model to propose a review on Opus when it finds a P0 or P1 finding or is unsure.

## Ratings

You can give an agent a score from 1 to 5 and a comment on what to improve: ratings are used to fix the role files.

- **The form.** If the client shows forms (MCP elicitation, like Claude Code), the server asks you itself, with a form: score, comment and whether to publish it. It asks when you load another agent, for the previous one, which has finished, and after 30 minutes of use. Once per agent per session: if you decline, it does not ask again for that agent. Submitting the form is the confirmation, and only what is in the form is sent.
- **Without forms.** With clients that do not show forms, the agent suggests a rating when it has finished the task, once per session; if it has been working for more than 30 minutes, the server reminds the model once. `rate_agent` first shows a preview of what will be sent and a code valid for 10 minutes; the model shows it to you and sends only with the code, exactly that content.
- You can also ask yourself, with the `/mcp__agentrica__valuta` command (the last agent used, or the one you name) or in words ("rate AISA-02"), or rate from the [panel](#local-panel), in the "Valuta gli agenti" section.
- **What is sent.** The agent id, the score, the comment, whether you allow the comment to be published on the site (off by default), the package version and a random rating code. No task, files, paths or project name, no account. Do not write names, personal data or parts of your project in the comment.
- **On the site.** Every agent with at least 5 ratings shows the average, the number of ratings and their distribution, and a ranking appears once at least 5 agents pass that threshold. A comment appears only if you allowed it to be published and after it is approved (criteria in the [legal notes](https://agentrica.vercel.app/note-legali#valutazioni), in Italian), with the score and the month.
- **After sending** you get the rating code: with it you can ask for the rating to be deleted or for the comment not to be published. An agent can be rated once per session and once a day from the same network.
- **If sending fails** (offline, service down) the tool says so and the work goes on; the rating is not stored anywhere.
- **To drop the tool**, the form and the suggestions, add `--no-ratings` to the command: the server no longer connects to Agentrica.

How ratings are handled: [legal notes](https://agentrica.vercel.app/note-legali#valutazioni) (in Italian).

## Token totals

You can send Agentrica your project's token totals: the site adds them to other users' totals on the [token usage page](https://agentrica.vercel.app/consumo) (in Italian), next to the results measured in our trials.

- **How.** Ask the agent ("send the token totals to Agentrica"): `share_usage` first shows the preview, row by row, and a code valid for 10 minutes; the model shows it to you and sends only with the code, exactly those rows. At the end of a session the agent may suggest it once, together with the rating. In the [panel](#local-panel) there is also the «Prepara l'anteprima» (prepare the preview) button in the Consumo view: confirming on the page counts as your yes.
- **What is sent.** The last 30 days, at most 300 rows: for each Claude Code session, day, agent, model and effort, the input, output, cache-read and cache-write tokens, plus the package version. The agent is the Agentrica id (e.g. `AISA-02`), `sessione` for the main conversation or `altro` (other) for your own subagents, whose names are not sent; the model is `opus`, `sonnet`, `haiku` or `altro`. Each row has a key, a SHA-256 fingerprint computed on your computer: the site uses it to replace a row already sent instead of counting it twice. No text, files, paths, project name or session id.
- **On the site** only sums by month, model and agent appear, once there are at least 10 submissions, labelled as declared by users. At most 5 submissions a day from the same network.
- **If sending fails** the tool says so and the work goes on; nothing is stored. `--no-ratings` removes this tool too.

How the totals are handled: [legal notes](https://agentrica.vercel.app/note-legali#consumo) (in Italian).

## Library

A model's knowledge stops at its training date. Each department has a library of cards with recent knowledge (standards, laws, releases), each one checked against an allowed source of level 1 (standards bodies, authorities, legal texts) or 2 (official vendor documentation), with version, verification date and a date by which to recheck it. For example OWASP Top 10:2025, TypeScript 7.0, the AI Act dates after the AI Omnibus, WCAG 2.2. Cards are in Italian, like the agent files.

- Every agent's text contains, after the role file, the index of its department's cards; the model reads the ones the task needs with `library` and cites source and date. A card past its date is flagged for rechecking.
- Cards ship in the package (`agents/<department>/biblioteca/`) and follow the same rules as role files: no links, HTML or commands. Source addresses live in `agents/<department>/fonti.json` and never reach the model. The server stays offline: the library opens no connection.
- It is updated with package versions: a weekly detector, with no model, reads the sources' feeds and lists what is new; new cards go in only after the owner's review.

## Local panel

The server also opens a page on your computer where you follow the project and make the choices the agent asks you for, instead of answering in the terminal. From 0.8.0 it is on by default: ask "open the Agentrica panel". At the first choice to make, if the page is not open, the server opens the browser. To turn it off, choose so in the [configuration](#configuration) form or add `--no-panel`:

```sh
npx -y @agentrica/mcp@0.8.0 install --no-panel
```

Then ask the agent to open the panel (`open_panel` tool): the page opens in your browser. It has three pages, with a menu at the top counting pending choices and findings:

- **Sessione** (session): pending choices (*Da decidere*, to decide), with options and reasons, whose answer, with an optional note, goes back to the agent; next to them, the Agentrica agents called in this session (*Agenti in uso*, agents in use), with the department and the start of the task;
- **Piano** (plan): the open phase with backlog and acceptance criteria, and all project phases;
- **Rilievi** (findings): open findings from phases and audits, by priority and department.

With the panel the model has two more tools:

| Tool | Input | What it does |
|---|---|---|
| `open_panel` | none | opens the page in the browser and returns its URL |
| `ask_user` | `question`, 2–4 `options` (`label`, `description`), optional `header` and `multiple` | shows the choice in the page and returns the answer |

If the page is not open, `ask_user` opens it. The client waits for the answer as long as the server sends progress notifications (up to 4 hours; 25 minutes with a client that does not request them), then the agent asks in the terminal. The client's own questions, such as tool permissions, stay in the client.

**What the panel does.** The server opens a random port on `127.0.0.1` only, reads `plan/`, `audit/` and the git status (`git status`) of the project folder, and keeps the last 20 agent calls in memory. It writes no files and sends no data off your computer, except the ratings and token totals you send from the page. The page opens only with the random token in the URL, valid for that session; requests from other sites or with another `Host` are refused. The panel needs the local network and `git`: with the Node permission model recommended above it does not start, and the server works without it (with an explicit `--panel`, instead, it stops with a message).

**Format of `plan/` and `audit/`.** The panel reads the plan format created by `init`, in Italian, the same as Agentrica's own [`plan/`](https://github.com/flgisimone/agentrica/tree/main/plan) and [`audit/`](https://github.com/flgisimone/agentrica/tree/main/audit); if something is missing, the page says what.

- `plan/README.md` with a `## Fasi` section and a `| Fase | File | Contenuto | Stato |` table, the file as a link (`[14-pannello.md](14-pannello.md)`). The open phase is the first one whose status is neither `completata` nor `sospesa`.
- In the phase file: `# Title`, a `**Obiettivo**: …` line, `## Backlog` with the `| # | Task | Priorità |` table, `## Criteri di accettazione` and `## Fatto` as lists; a task is done when its id appears in bold under «Fatto» (`- **F14-01** …`). `## Rilievi aperti` is a list, with the priority (`P0`–`P3`) in the text; an item that says «risolto» or «chiuso» (resolved, closed; e.g. «Risolto in F6.») stays in the plan but the panel does not show it.
- `audit/<folder>/<file>.json` with `agente` (e.g. `"AICA-02 · …"`, which gives the department) and a `rilievi` list of objects with `id`, `titolo`, `priorita` and optional `stato`; a finding whose `stato` says «risolto» or «chiuso» is not shown.

## New project

`init` creates a project with Agentrica's way of working, ready for Claude Code:

```sh
npx -y @agentrica/mcp@0.8.0 init my-project --name "My project"
```

Without a folder it uses the current one; without `--name` the name is the folder's. It writes, in Italian:

- `AGENTS.md` and `CLAUDE.md` (rules for agents: tokensave, the Ponytail ladder, efficiency, checks, agencies) and `CONVENTIONS.md` (code, tests, phases, closing and release), with the stack-specific parts marked «da compilare» (to fill in);
- `plan/` with `README.md` (decisions, glossary, phases) and `00-base.md`, the F0 phase to start from; `audit/` and `docs/`;
- `agents/` and `.claude/agents/`: the 56 roles of this version and one subagent per role, with the project name;
- `.github/workflows/ci.yml` (`npm run verify` and `verify:e2e`, skipped until F0 creates them), `.gitignore`, `.nvmrc`, `.env.example`;
- `.mcp.json` with this server at an exact version (the panel is on by default and reads the plan right away) (on Windows with `cmd /c npx`).

If even one file already exists, `init` writes nothing and lists them. Outside a git repository it makes the first commit on `main` and leaves `develop` checked out; inside one it does not commit. Then open Claude Code in the folder and ask it to open phase F0. `init` is the only command that writes files in the project: the server writes only its [configuration](#configuration). It replaces agentic-starter, which is no longer updated.

## Show your project

Built something with Agentrica's agents? The site can show it on the projects page, after our approval, in three ways:

- open the [«Mostra il tuo progetto»](https://github.com/flgisimone/agentrica/issues/new?template=progetto.yml) issue: name, link to the public repository, a short description, departments and agents used, with your consent to publish them (the form is in Italian);
- or add the `agentrica` topic to the public repository: it counts as a request to appear, and we show only the repository's name, description, link and owner;
- or, without a GitHub account, from the server: `/mcp__agentrica__progetto` opens a form with the same fields and any `https://` link (repository, site or page); without forms the `submit_project` tool does the same, with a preview and confirmation. You get a code: keep it, it is how you withdraw the proposal with `/mcp__agentrica__progetto` and the `rimuovi` (remove) argument. Nothing is sent without your confirmation; `--no-ratings` turns this off too.

The description and results stay yours: we do not verify them. You can ask for removal at any time; how we handle this data is in the [legal notes](https://agentrica.vercel.app/note-legali#progetti) (in Italian). If you like, add the badge to your README:

```markdown
[![Made with Agentrica](https://img.shields.io/badge/made%20with-Agentrica-0b1020)](https://agentrica.vercel.app)
```

## Updating and uninstalling

The agents' text comes from the `agents/` files of the installed version. When a new version is out the server tells you once per session, in a tool response and in the panel, with the right command for how you installed it. Ids and code names do not change.

- **Installed with `install`**: run `install` again with the new version, e.g. `npx -y @agentrica/mcp@<version> install`, then restart Claude Code.
- **With `add` or `init`**: run `add` again with the new version, or change the version in the server command or in `.mcp.json`, then restart the client.
then restart the client.

If Agentrica is registered in more than one scope (for example with `install` and then `add --local`), `add` and `install` say so after registering: Claude Code uses the one closest to the project (local, then project, then user), and you remove the one you don't need with `claude mcp remove agentrica --scope <scope>`.

To uninstall:

```sh
claude mcp remove agentrica --scope user
npm uninstall -g @agentrica/mcp
```

The second command is needed only if you used `install`; with `add --project` or `--local` use that scope instead of `user`. If you saved a [configuration](#configuration), also delete the `~/.agentrica` folder.

The same catalog can be read from code, without starting the server: `import { loadCatalog } from "@agentrica/mcp/catalog"` returns departments and agents (with the `Department` and `Agent` types) from the package's `agents/`. The Agentrica site uses it.

## Versions

What changed in each version, with its date, is in [CHANGELOG.md](https://github.com/flgisimone/agentrica/blob/main/packages/mcp/CHANGELOG.md) (in Italian). 0.6.0 renames the prompts (`aisa-02` becomes `aisa-02-software`).

## License

MIT. Agentrica is a fictional company: the agents are AI models guided by role files.
