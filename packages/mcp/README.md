# Agentrica MCP

[![Agentrica MCP on mcprush](https://mcprush.com/badge/agentrica-mcp/compact.svg)](https://mcprush.com/to/agentrica-mcp?ref=badge)

[Italiano](README.it.md)

The Agentrica MCP server: the AI agents of the departments (AIBPD, AICA, AIPCA, AISA, AIWDA), usable in your project from Claude Code or any MCP client.

Each agent is a role with a declared method and limits, for example `AISA-02 · ALTAIR`, Senior Software Architect, or `AIPCA-03 · DUBHE`, Senior Privacy Legal Specialist. The server gives the model the department's common rules and the agent's role file, taken from [`agents/`](https://github.com/flgisimone/agentrica/tree/main/agents), and the model works in your project with those instructions.

The agent files, the server's texts and the panel exist in English and in Italian. The server uses your system's language (Italian if it is Italian, otherwise English), or the one you choose with `--lang en` or `--lang it` or in the [configuration](#configuration). Whatever the language of the texts, the agent answers in the language you write in.

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

### What the server does and what the model does

The server calls no models, uses no API keys and pays for no inference. It composes the agents' texts from the catalog, keeps the session state (agents in use, reports, panel questions) and runs the checks that need no model. The reasoning, that is reading the project, deciding and writing, stays with your client and the model you use, on your subscription or your key. An optional integration comes in only if it costs nothing and does not become a mandatory dependency.

How much text the server returns, per agent and per component (common rules, role, library…): `npm run -s agent-text -- --sizes` in a clone of the repository. Bytes are measured, tokens estimated (bytes / 4).

### What stays on your computer

For each tool, command and page: whether it stays on your computer or what leaves it, to whom and when. The text the model reads and writes still goes to the model provider through your client (see above).

| Tool, command or page | What leaves your computer, and when |
|---|---|
| `list_agents`, `agent`, `library` and the agent prompts | nothing: they read the package's `agents/` |
| `check`, tool and command | nothing: they read `plan/` and `audit/` of the project folder |
| `report`, `ask_user`, `open_panel` and the [panel](#local-panel) | nothing: server memory and a page on `127.0.0.1`, which reads `plan/`, `audit/`, `git status` and Claude Code's token counts |
| `/mcp__agentrica__configure` | nothing: it writes only `~/.agentrica/config.json` |
| `rate_agent`, `/mcp__agentrica__rate`, «Rate the agents» in the panel | score, comment and version, to Agentrica, after the preview and your yes |
| `share_usage`, «Prepare the preview» in the panel | token totals per day, agent, model and effort, to Agentrica, after the preview and the confirmation code |
| `submit_project`, `/mcp__agentrica__project` | the form's fields, to Agentrica, after your confirmation |
| version check | at startup a request with no data to the npm registry; `--no-update-check` turns it off |
| `init` and the [reminder](#reminder) it writes | nothing: it writes the project files; the hook prints a line locally |
| `add`, `install` | `install` downloads the package from npm (`npm install -g`), like `npx`; then they register the server with `claude mcp add` |

`--no-ratings` removes the three rows that send to Agentrica: with `--no-ratings --no-update-check` nothing leaves.

## Installation

You need Node 22 or later, with npm. The commands are the same on Mac, Windows (PowerShell or cmd) and Linux.

**On the whole computer (recommended)**, for Claude Code:

```sh
npx -y @agentrica/mcp@0.13.0 install
```

It installs the package with `npm install -g` and registers it in Claude Code with `user` scope: every project you open already has Agentrica. The server starts with `node` from npm's global folder: it starts fast and also works offline. Restart Claude Code and check with `claude mcp list`.

**Without installing anything**, for Claude Code:

```sh
npx -y @agentrica/mcp@0.13.0 add
```

It registers the server started with npx (on Windows `cmd /c npx`), which downloads the package to its cache on first start. The scope is `user`, all your projects; with `--project` it writes `.mcp.json` in the current folder, to share with your team (it works on the system it was created on), with `--local` it applies to the current project and to you only. For your team, from the project folder:

```sh
npx -y @agentrica/mcp@0.13.0 add --project
```

The server options (`--lang`, `--agents`, `--no-panel`, `--no-ratings`, `--no-update-check`) go at the end of `install` and `add`, which pass them to the server. Run again, they replace Agentrica's registration in the same scope. If Node 22, npm or the `claude` command are missing, they say so and print the commands to run by hand.

The version stays the one you set until you change it: role updates do not arrive unless you choose them. See [Updating and uninstalling](#updating-and-uninstalling).

**By hand in Claude Code**, without `install` or `add`:

```sh
claude mcp add --scope user agentrica -- npx -y @agentrica/mcp@0.13.0
```

On Windows: `claude mcp add --scope user agentrica -- cmd /c npx -y @agentrica/mcp@0.13.0`.

**Other MCP clients**: add the server to the client configuration, usually a JSON file like this:

```json
{
  "mcpServers": {
    "agentrica": {
      "command": "npx",
      "args": ["-y", "@agentrica/mcp@0.13.0"]
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
      "args": ["/c", "npx", "-y", "@agentrica/mcp@0.13.0"]
    }
  }
}
```

**Least privilege (recommended).** Install the package in its own folder and start it with Node's permission model: the server can only read that folder, and Node blocks file writes, network connections and child processes. The server needs none of them, so it works the same; the permissions limit the damage of any future defect. With these permissions, sending a [rating](#ratings) fails with a clear message and the version check does not run: to rate agents add `--allow-net`, otherwise add `--no-ratings --no-update-check` at the end of the command. The [panel](#local-panel) does not start with these permissions.

```sh
npm install -g --ignore-scripts @agentrica/mcp@0.13.0
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

**Prompts.** Each agent is a prompt named after its lowercase id and its department (`aisa-02-software`, `aica-01-cybersecurity`, `aibpd-01-business`, `aipca-02-privacy`, `aiwda-08-design`) with one optional argument, `task`. In Claude Code prompts become commands, and the menu shows the department:

```
/mcp__agentrica__aisa-02-software "Review the boundaries between the modules in src/"
```

Up to 0.5.0 the name was the id alone (`aisa-02`).

Put the task in quotes: Claude Code splits arguments on spaces.

**Squad.** With `--agents` the server loads only the agents you list: agent ids and department codes, comma-separated, case-insensitive. For example the whole software department plus the accessibility agent:

```sh
npx -y @agentrica/mcp@0.13.0 install --agents aisa,aiwda-08
```

The command menu shows only the squad's prompts, and `list_agents` and `agent` see only those agents too. Without `--agents` all the agents are available. An unknown id or code stops the server with a message naming it, in the client's logs. In Claude Code prompts do not enter the model's context (we checked with `/context`): a squad makes the menu shorter, it does not save tokens.

**Tools**, for clients that do not show prompts, or when you want the model to pick the agent:

| Tool | Input | Returns |
|---|---|---|
| `list_agents` | optional `department` (`AIBPD`, `AICA`, `AIPCA`, `AISA`, `AIWDA`) | id, code name, role and department of each agent, with the recommended model where it was measured |
| `agent` | `id` (e.g. `AISA-02`), optional `task` and `full_rules` | the agent's instructions, with the department's common rules and library index (see [Common rules](#common-rules-once-per-department)) |
| `library` | the agent's `id`, `cards` (card ids, at most 10) | the cards of the agent's department [library](#library), with source, version and dates |
| `check` | none | the format errors and contradictions of `plan/` and `audit/` in the project folder, with file and line (see [Format check](#format-check)) |
| `rate_agent` | `id`, `rating` from 1 to 5, optional `comment` and `publish`; then `code` | a preview of the rating and a code; with the code, the sending (see [Ratings](#ratings)) |
| `share_usage` | none; then `code` | a preview of the project's token totals and a code; with the code, the sending (see [Token totals](#token-totals)) |
| `submit_project` | `name`, `url`, `description`, `departments`, optional `agents` and `author`, `consent`, `license`; then `code` | a preview of a project proposal and a code; with the code, the sending (see [Show your project](#show-your-project)) |

For example: "Use list_agents, pick the right Agentrica agent and check the accessibility of the login form".

**Orchestration.** Number 01 in each department is the director, and `list_agents` marks it: for a task of the department the model loads it first, then loads with `agent` the specialists the director chooses, one at a time, each from the previous one's handover (outcome, findings with the reference to the evidence, open questions) instead of their whole answer; at the end the director consolidates the results and presents them to you. Across departments the order is business → design → privacy → your confirmation → software → design and privacy reviews → Code Reviewer → your confirmation. The server's instructions ask the model to use `agent` and not local subagents, unless you ask for them; the [panel](#local-panel) shows the chain of agents.

#### Common rules once per department

A department's common rules are more than half of the text of each of its agents and are the same for all of them. From 0.14.0 the server remembers, for the length of the session, the departments whose rules and library index it has already sent: the first agent of the department receives them in full, the next ones a two-line reference that says which rules apply and how to get them back, plus the cards marked for their role. The role file and the task always come in full.

- With `full_rules` true, `agent` returns everything in full: after `/compact` or `/clear` (in Claude Code `/clear` starts a new conversation but the server stays the same), or when the model no longer has the rules in its context. The server's instructions and the reference itself say so.
- The subagents of `init --subagents` have their own context: their first step calls `agent` with `full_rules` true. In projects created with an earlier version the reference tells the subagent to call `agent` again with `full_rules` if it lacks the rules; to get the new first step, delete `.claude/agents/` and run `init --existing --subagents`, which writes only the missing files.
- The agents' prompts (`/mcp__agentrica__aisa-04-software`…) stay in full: they are invoked by hand, one at a time.

The measurement is in `examples/risultati/`: the saving is the repeated part, that is 4 to 5.7 KB of rules and index for each specialist of a department already loaded.

**Commands.** Besides the agents' prompts there are `/mcp__agentrica__rate`, which opens the [rating](#ratings) form for the last agent used (or the one you name, e.g. `/mcp__agentrica__rate AISA-02`), `/mcp__agentrica__project`, which proposes a project of yours for the site without a GitHub account (see [Show your project](#show-your-project)), and `/mcp__agentrica__configure`, which opens the [configuration](#configuration) form.

**Renamed in 0.9.0.** Tools, prompts and arguments now have English names, without aliases: update any instructions or scripts that use the old ones.

| Up to 0.8.1 | From 0.9.0 |
|---|---|
| tool `elenca_agenti`, argument `reparto` | `list_agents`, `department` |
| tool `agente`, argument `compito` | `agent`, `task` |
| argument `compito` of the agents' prompts | `task` |
| command `valuta`, argument `agente` | `rate`, `agent` |
| command `progetto`, argument `rimuovi` | `project`, `remove` |
| command `configura` | `configure` |

The agents' prompt names (`aisa-02-software`) do not change.

While working, the agent says who it is, for example "AISA-02 · ALTAIR — Senior Software Architect, AISA department (AI Software)": at the start, when it hands over to another agent and in the final summary.

## Configuration

Language, squad, panel, ratings and the new-version notice can be chosen with a form, without running `add` or `install` again.

- **When.** If the client shows forms (MCP elicitation, like Claude Code), the form appears at the first call to Agentrica in a session, until a configuration is saved. After that, reopen it with `/mcp__agentrica__configure`. If you close the first form without choosing, the defaults are saved and it does not come back.
- **Where.** Your choices are saved on your computer in `~/.agentrica/config.json` (on Windows `C:\Users\<name>\.agentrica\config.json`), readable only by your user, and apply from the next session in every project. It holds only the five choices, for example `{"version": 1, "lang": "en", "agents": "aisa,aiwda-08", "panel": false, "ratings": true, "updateCheck": true}` (`lang` empty: the system language); no paths, projects or dates. Nothing reaches Agentrica.
- **Precedence.** Options written in the server command (`--lang`, `--agents`, `--panel`, `--no-panel`, `--no-ratings`, `--no-update-check`) win over the file, one by one, and are not shown in the form.
- **Ratings on** only means the server may ask you for a score: every sending still needs your confirmation.
- **Without forms** (including the Claude Code VS Code extension, which declares forms but closes them without showing them: the server notices and saves nothing) `/mcp__agentrica__configure` shows the configuration to the model, which can write the file for you with your permission; or write it by hand, or use the options.
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
| AICA-09 · WEZEN, Vulnerability Management | Haiku | −95% |
| AICA-03 · BETELGEUSE, Application Security | Sonnet | −62% |
| AICA-05 · ALNITAK, Network Security | Sonnet | −54% |
| AICA-07 · SAIPH, SOC & Threat Detection | Sonnet | −52% |
| AIPCA-05 · MIZAR, Privacy Security | Sonnet | −58% |
| AIPCA-06 · MERAK, Data Governance & Retention | Sonnet | −49% |
| AIPCA-07 · ALCOR, Third-Party & Vendor Compliance | Sonnet | −61% |
| AIPCA-08 · PHECDA, Data Subject Rights | Sonnet | −54% |
| AISA-05 · SPICA, Frontend | Sonnet | −66% |
| AISA-07 · FOMALHAUT, Database | Sonnet | −56% |
| AISA-10 · CASTOR, DevOps | Sonnet | −62% |
| AISA-11 · BELLATRIX, Performance | Sonnet | −54% |

The other 39 agents work with your session's model: the five department directors and the judgment roles (Architect, Security Architect, Code Reviewer, DPIA, Pentest) by choice, because a mistake there costs a lot, and the rest because they have not been measured yet or did not pass the threshold. The cost is the average over each agent's test cases (API prices of 2026-11-03); measurements, cases and reports are in [`examples/risultati/2026-11-19-modelli.md`](https://github.com/flgisimone/agentrica/blob/main/examples/risultati/2026-11-19-modelli.md) and [`examples/risultati/2026-11-23-ondata-1.md`](https://github.com/flgisimone/agentrica/blob/main/examples/risultati/2026-11-23-ondata-1.md) (in Italian).

- **Where you see it.** In `list_agents` and at the top of the agent's text ("Recommended model: Sonnet…"). You choose the session model; the subagents of `init --subagents` already have it.
- **Subagents.** The subagents copied by [`init --subagents`](#new-project) into `.claude/agents/` already have `model:` set to the recommended model (the others `inherit`). To change it, edit that line (`opus`, `sonnet`, `haiku` or `inherit`).
- **Session.** In Claude Code you change the session's model with `/model`.
- **Review.** The departments' rules ask an agent on a smaller model to propose a review on Opus when it finds a P0 or P1 finding or is unsure.

## Ratings

You can give an agent a score from 1 to 5 and a comment on what to improve: ratings are used to fix the role files.

- **The form.** If the client shows forms (MCP elicitation, like Claude Code), the server asks you itself, with a form: score, comment and whether to publish it. It asks when you load another agent, for the previous one, which has finished, and after 30 minutes of use. Once per agent per session: if you decline, it does not ask again for that agent. Submitting the form is the confirmation, and only what is in the form is sent.
- **Without forms.** With clients that do not show forms, the agent suggests a rating when it has finished the task, once per session; if it has been working for more than 30 minutes, the server reminds the model once. `rate_agent` first shows a preview of what will be sent and a code valid for 10 minutes; the model shows it to you and sends only with the code, exactly that content.
- You can also ask yourself, with the `/mcp__agentrica__rate` command (the last agent used, or the one you name) or in words ("rate AISA-02"), or rate from the [panel](#local-panel), in the "Rate the agents" section.
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

A model's knowledge stops at its training date. Each department has a library of cards with recent knowledge (standards, laws, releases), each one checked against an allowed source of level 1 (standards bodies, authorities, legal texts) or 2 (official vendor documentation), with version, verification date and a date by which to recheck it. For example OWASP Top 10:2025, TypeScript 7.0, the AI Act dates after the AI Omnibus, WCAG 2.2. Cards exist in English and in Italian, like the agent files.

- Every agent's text contains, after the role file, the index of its department's cards; the model reads the ones the task needs with `library` and cites source and date. A card past its date is flagged for rechecking.
- Cards ship in the package (`agents/<department>/biblioteca/`, in English in `agents/<department>/en/biblioteca/`) and follow the same rules as role files: no links, HTML or commands. Source addresses live in `agents/<department>/fonti.json` and never reach the model. The server stays offline: the library opens no connection.
- It is updated with package versions: a weekly detector, with no model, reads the sources' feeds and lists what is new; new cards go in only after the owner's review.

## Local panel

The server also opens a page on your computer where you follow the project and make the choices the agent asks you for, instead of answering in the terminal. From 0.8.0 it is on by default: ask "open the Agentrica panel". At the first choice to make, if the page is not open, the server opens the browser. To turn it off, choose so in the [configuration](#configuration) form or add `--no-panel`:

```sh
npx -y @agentrica/mcp@0.13.0 install --no-panel
```

Then ask the agent to open the panel (`open_panel` tool): the page opens in your browser. It has six pages, with a menu at the top counting pending choices, agents called, findings and agents to rate:

- **Session**: pending choices (*To decide*), with options and reasons, whose answer, with an optional note, goes back to the agent; next to them, the last three Agentrica agents called (*Agents in use*); below, in a separate section, the Claude Code subagents started in the session (*Claude Code subagents*), with type, description and state;
- **Agents**: all the agents called in the session, in a tree by department: one column per department in the order they came in (a department that comes back, like the review after software, opens a column marked «return»), the director at the top and the specialists below. Each card has the call order number, the director and the active agent marked, the whole task and the report of what it did, if the agent sent one with the `report` tool (for a director whose department is still working: «coordinating the department»);
- **Plan**: the open phase with backlog and acceptance criteria, and all project phases;
- **Findings**: open findings from phases and audits, by priority and department;
- **Ratings**: a form for each agent used and not yet rated (see [Ratings](#ratings)); absent with `--no-ratings`;
- **Usage**: the tokens spent in the project with Claude Code, by day, agent (subagent), model and session, with the share read from cache, the cost in dollars equivalent to API prices, the cache saving (measured) and the model saving (an estimate: the same tokens at Opus prices). Every chart is also a table. With a client other than Claude Code usage is not available: the server does not estimate it.

When a new agent starts working or there is one more agent to rate, the page says so with a notice at the bottom. With «Turn on notifications» it also shows a system notification when the panel tab is not in view; it needs the browser's permission, and the browser shows it, without external services.

With the panel the model has three more tools:

| Tool | Input | What it does |
|---|---|---|
| `open_panel` | none | opens the page in the browser and returns its URL |
| `ask_user` | `question`, 2–4 `options` (`label`, `description`), optional `header` and `multiple` | shows the choice in the page and returns the answer |
| `report` | agent `id`, `summary` (at most 4000 characters) | saves in the panel the report of what the agent did; each agent's text asks to send it at the end of the task. From 0.15.0, if the handover lacks an outcome, findings or open questions, it saves it anyway and tells the model |

If the page is not open, `ask_user` opens it. The client waits for the answer as long as the server sends progress notifications (up to 4 hours; 25 minutes with a client that does not request them), then the agent asks in the terminal. The client's own questions, such as tool permissions, stay in the client.

**What the panel does.** The server opens a random port on `127.0.0.1` only, reads `plan/`, `audit/` and the git status (`git status`) of the project folder and, with the page open, every 5 seconds the transcripts of the subagents started after the server, in the folder where Claude Code saves the project (`~/.claude/projects/<project>/<session>/subagents/agent-<id>.jsonl`, reading only the time of the first line), and their `.meta.json` files, taking only type, description and state. Claude Code does not document the content of the `.meta.json` files: if it changes, the subagent still appears, with «format not recognised». It keeps the last 20 agent calls in memory, with the task and the report, and looks at the modification time of the files in `plan/` for the [notice](#reminder) when they change without agents. It writes no files and sends no data off your computer, except the ratings and token totals you send from the page. The page opens only with the random token in the URL, valid for that session; requests from other sites or with another `Host` are refused. The panel needs the local network and `git`: with the Node permission model recommended above it does not start, and the server works without it (with an explicit `--panel`, instead, it stops with a message).

**Format of `plan/` and `audit/`.** The panel reads the plan format created by `init`, in English or in Italian (shown here in English, with the Italian names in brackets), the same as Agentrica's own [`plan/`](https://github.com/flgisimone/agentrica/tree/main/plan) and [`audit/`](https://github.com/flgisimone/agentrica/tree/main/audit); if something is missing, the page says what. If the plan is missing or has no phases yet, the page says so as information, with the ways to create it ([existing project](#existing-project)).

- `plan/README.md` with a `## Phases` (`## Fasi`) section and a `| Phase | File | Content | Status |` table, the file as a link (`[00-base.md](00-base.md)`). The open phase is the first one whose status is not `completed` or `suspended` (`completata`, `sospesa`).
- In the phase file: `# Title`, a `**Goal**: …` (`**Obiettivo**`) line, `## Backlog` with the `| # | Task | Priority |` table, `## Acceptance criteria` (`## Criteri di accettazione`) and `## Done` (`## Fatto`) as lists; a task is done when its id appears in bold under «Done» (`- **F0-01** …`). `## Open findings` (`## Rilievi aperti`) is a list, with the priority (`P0`–`P3`) in the text; an item that says «resolved» or «closed» («risolto», «chiuso») stays in the plan but the panel does not show it.
- `audit/<folder>/<file>.json` with `agent` (`agente`, e.g. `"AICA-02 · …"`, which gives the department) and a `findings` (`rilievi`, or `observations` in the design department's format) list of objects with `id`, `title`, `priority` and optional `status` (`titolo`, `priorita`, `stato`); a finding whose status says «resolved» or «closed» is not shown.

#### Format check

From 0.15.0 the server checks, without models, the shape of the `plan/` and `audit/` files: tables and sections of the format above, required fields, unique ids, phase files that exist, `P0`–`P3` priorities where the backlog has the «Priority» column and, for a closed finding, the evidence (`evidence`, `evidenza`). It also reports three contradictions, with both locations and without choosing which one holds: the same finding id in two files with a different title, priority or status; a closed finding without evidence; a `completed` phase with `P0` tasks that do not appear in «Done». It checks the structure, not the content, and changes nothing. The same check works in three ways: the `check` tool, which the server instructions ask to use after writing in `plan/` or `audit/`; the panel, which shows the errors at the top of the page; the command, for CI, which prints `file:line: cause` and exits with 1 if it finds something:

```sh
npx -y @agentrica/mcp@0.15.0 check [project folder]
```

## New project

`init` creates a project with Agentrica's way of working, ready for Claude Code:

```sh
npx -y @agentrica/mcp@0.13.0 init my-project --name "My project"
```

Without a folder it uses the current one; without `--name` the name is the folder's. It writes, in the server's language (`--lang en` or `--lang it` to choose):

- `AGENTS.md` and `CLAUDE.md` (rules for agents: tokensave, the Ponytail ladder, efficiency, checks, agencies) and `CONVENTIONS.md` (code, tests, phases, closing and release), with the stack-specific parts marked «to fill in»;
- `plan/` with `README.md` (decisions, glossary, phases) and `00-base.md`, the F0 phase to start from; `audit/` and `docs/`;
- `agents/`: the 56 roles of this version, in both languages (English in each agency's `en/` folder), which the model loads from the server with `agent`;
- only with `--subagents`, `.claude/agents/`: one Claude Code subagent per role in the chosen language, with the project name, which as its first step loads its agent from the server (so it appears in the panel). Since 0.10.0 they are not copied without the flag: the agents are consulted from the server one at a time, and subagents start only if you ask for them or for a parallel audit;
- `.github/workflows/ci.yml` (`npm run verify` and `verify:e2e`, skipped until F0 creates them), `.gitignore`, `.nvmrc`, `.env.example`;
- `.mcp.json` with this server at an exact version (the panel is on by default and reads the plan right away) (on Windows with `cmd /c npx`);
- `.claude/settings.json` with the [reminder](#reminder) on every request, unless `--no-reminder`.

If even one file already exists, `init` writes nothing and lists them. Outside a git repository it makes the first commit on `main` and leaves `develop` checked out; inside one it does not commit. Then open Claude Code in the folder and ask it to open phase F0. `init` is the only command that writes files in the project: the server writes only its [configuration](#configuration). It replaces agentic-starter, which is no longer updated.

### Reminder

The server instructions reach the model once, when the session starts. So that it remembers to load an agent for each new request, `init` (also with `--existing`) writes `.claude/settings.json` with a Claude Code `UserPromptSubmit` hook: on every request it prints one line, which Claude Code adds to the context (about forty tokens). The command uses `node`, which is already there because it starts the server, and is the same on Mac, Windows and Linux. It sends nothing off your computer.

- `--no-reminder` does not write the file; to remove it later, delete the hook from `.claude/settings.json`.
- If `.claude/settings.json` already exists, `init --existing` leaves it alone and says so. With [`add`](#installation) or `install`, without `init`, there is no reminder. In both cases add the `hooks` part by hand (the Italian line is in the Italian README):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"console.log('Agentrica: if this request is work on the project, first load the right agent with the Agentrica agent tool (choose it with list_agents); work without agents only if the user asks.')\""
          }
        ]
      }
    ]
  }
}
```

With the [panel](#local-panel) open, if a file in `plan/` changes after the server started and no agent has been loaded in the session, the Session page says so at the top; the notice goes away when the first agent is loaded.

### Existing project

In a project that already exists (for example one installed with [`add`](#installation)) `init --existing` adds Agentrica's rules without touching your files:

```sh
npx -y @agentrica/mcp@0.13.0 init --existing
```

It writes only the missing files and skips those already there, listing them in the output: your own `AGENTS.md` or `CLAUDE.md` stays as it is (if you already have `CLAUDE.md`, add a line `@AGENTS.md`). It does not commit and does not copy the technical base of a new project: no F0 «technical base», CI, `.nvmrc` or `.env.example`. The `plan/README.md` starts without phases: ask Claude «Create the project phases from the existing code». Even without `init --existing` the server instructions describe the `plan/` format and, if the plan is missing, Claude offers to create it.

**Sessions per phase.** Planning is a session of its own: Claude writes only `plan/` (phases with backlog and criteria), has you confirm it and suggests `/clear` without starting development. Then one phase per session, each in a new session, and `/clear` again at its close. The rule is in the server instructions and in the `AGENTS.md` and `CONVENTIONS.md` written by `init`.

## Show your project

Built something with Agentrica's agents? The site can show it on the projects page, after our approval, in three ways:

- open the [«Show your project»](https://github.com/flgisimone/agentrica/issues/new?template=project.yml) issue: name, link to the public repository, a short description, departments and agents used, with your consent to publish them;
- or add the `agentrica` topic to the public repository: it counts as a request to appear, and we show only the repository's name, description, link and owner;
- or, without a GitHub account, from the server: `/mcp__agentrica__project` opens a form with the same fields and any `https://` link (repository, site or page); without forms the `submit_project` tool does the same, with a preview and confirmation. You get a code: keep it, it is how you withdraw the proposal with `/mcp__agentrica__project` and the `remove` argument. Nothing is sent without your confirmation; `--no-ratings` turns this off too.

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

What changed in each version, with its date, is in [CHANGELOG.en.md](https://github.com/flgisimone/agentrica/blob/main/packages/mcp/CHANGELOG.en.md) (in Italian: [CHANGELOG.md](https://github.com/flgisimone/agentrica/blob/main/packages/mcp/CHANGELOG.md)). 0.6.0 renames the prompts (`aisa-02` becomes `aisa-02-software`); 0.9.0 renames tools, commands and arguments into English (table in [Usage](#usage)); since 0.10.0 `init` does not copy the subagents without `--subagents`.

## License

MIT. Agentrica is an MCP server with AI agents organised in departments, for use in your projects: the agents are AI models guided by role files, not people.
