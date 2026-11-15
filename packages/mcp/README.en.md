# Agentrica MCP

[Italiano](README.md)

The Agentrica MCP server: the 56 AI agents of the five departments (AIBPD, AICA, AIPCA, AISA, AIWDA), usable in your project from Claude Code or any MCP client.

Each agent is a role with a declared method and limits, for example `AISA-02 · ALTAIR`, Senior Software Architect, or `AIPCA-03 · DUBHE`, Senior Privacy Legal Specialist. The server gives the model the department's common rules and the agent's role file, taken from [`agents/`](https://github.com/flgisimone/agentrica/tree/main/agents), and the model works in your project with those instructions.

The agent files are in Italian. The agent answers in the language you write in.

## What it does and does not do

- The server runs only locally: the client starts it on your computer and the two talk over stdio. The server has no remote part.
- The only content it reads is the `agents/` files included in the package, once, at startup. The text that reaches the model is the text of those files: you can read it before using it.
- It writes no files, opens no network connections, logs nothing, collects and sends no data, and has no telemetry.
- It runs nothing in your project. It only gives instructions to the model: what the model does in the project depends on the client and on the permissions you grant it.
- **Where the data goes.** The agent's text, the task and the files the model reads in your project go to the model provider through your client, under that provider's terms. Agentrica does not receive them. Leave personal data, secrets and customer data out of the task unless they are needed.
- The agents are AI: their conclusions are proposals to check. The privacy and security agents do not replace a DPO, a lawyer or a security officer, and their findings are not a compliance certification.

## Installation

You need Node 22 or later, with npm.

**Claude Code**, from your project folder:

```sh
claude mcp add agentrica -- npx -y @agentrica/mcp@0.1.0
```

On first start npx downloads the package from npm. The version stays the one you set until you change it: role updates do not arrive unless you choose them.

**Other MCP clients**: add the server to the client configuration, usually a JSON file like this:

```json
{
  "mcpServers": {
    "agentrica": {
      "command": "npx",
      "args": ["-y", "@agentrica/mcp@0.1.0"]
    }
  }
}
```

**Least privilege (recommended).** Install the package in its own folder and start it with Node's permission model: the server can only read that folder, and Node blocks file writes, network connections and child processes. The server needs none of them, so it works the same; the permissions limit the damage of any future defect.

```sh
npm install -g --ignore-scripts @agentrica/mcp@0.1.0
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

**Tools**, for clients that do not show prompts, or when you want the model to pick the agent:

| Tool | Input | Returns |
|---|---|---|
| `elenca_agenti` (list agents) | optional `reparto` (department: `AIBPD`, `AICA`, `AIPCA`, `AISA`, `AIWDA`) | id, code name, role and department of each agent |
| `agente` (agent) | `id` (e.g. `AISA-02`), optional `compito` (task) | the agent's full instructions |

For example: "Use elenca_agenti, pick the right Agentrica agent and check the accessibility of the login form".

Number 01 in each department is the director: it coordinates the specialists and consolidates their findings.

## Updates

The agents' text comes from the `agents/` files of the installed version. To update, change the version in the command (or reinstall with `npm install -g`) and restart the client. Ids and code names do not change.

## Versions

- **0.1.0**: first published version. 56 agents in five departments, one prompt per agent and the `elenca_agenti` and `agente` tools.

## License

MIT. Agentrica is a fictional company: the agents are AI models guided by role files.
