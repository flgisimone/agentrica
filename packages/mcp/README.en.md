# Agentrica MCP

[Italiano](README.md)

The Agentrica MCP server: the 56 AI agents of the five departments (AIBPD, AICA, AIPCA, AISA, AIWDA), usable in your project from Claude Code or any MCP client.

Each agent is a role with a declared method and limits, for example `AISA-02 · ALTAIR`, Senior Software Architect, or `AIPCA-03 · DUBHE`, Senior Privacy Legal Specialist. The server gives the model the department's common rules and the agent's role file, taken from [`agents/`](../../agents/), and the model works in your project with those instructions.

The agent files are in Italian. The agent answers in the language you write in.

## What it does and does not do

- The server runs only locally: the client starts it on your computer and the two talk over stdio. The server has no remote part.
- The only content it reads is the files in this repository's `agents/`, once, at startup. The text that reaches the model is the text of those files: you can read it before using it.
- It writes no files, opens no network connections, logs nothing, collects and sends no data, and has no telemetry.
- It runs nothing in your project. It only gives instructions to the model: what the model does in the project depends on the client and on the permissions you grant it.
- **Where the data goes.** The agent's text, the task and the files the model reads in your project go to the model provider through your client, under that provider's terms. Agentrica does not receive them. Leave personal data, secrets and customer data out of the task unless they are needed.
- The agents are AI: their conclusions are proposals to check. The privacy and security agents do not replace a DPO, a lawyer or a security officer, and their findings are not a compliance certification.

## Installing from a clone

You need Node 26 (the version in `.nvmrc`) and npm.

```sh
git clone <repository url> agentrica
cd agentrica
npm ci --omit=dev --ignore-scripts -w @agentrica/mcp
```

This installs only the server's dependencies, without the site and the development tools, and without running install scripts.

**Claude Code**, from your project's folder:

```sh
claude mcp add agentrica -- node --permission --allow-fs-read=/path/to/agentrica /path/to/agentrica/packages/mcp/src/server.ts
```

**Other MCP clients**: add the server to the client's configuration, usually a JSON file like this one:

```json
{
  "mcpServers": {
    "agentrica": {
      "command": "node",
      "args": [
        "--permission",
        "--allow-fs-read=/path/to/agentrica",
        "/path/to/agentrica/packages/mcp/src/server.ts"
      ]
    }
  }
}
```

The path must be absolute: the client starts the server from your project's folder.

**Least privilege.** `--permission` and `--allow-fs-read` turn on Node's permission model: the server can only read the Agentrica clone, and Node blocks file writes, network connections and child processes. The server needs none of them, so it works the same; the permissions limit the damage of any future defect. The server's tests start it this way. You can remove them, but we advise against it.

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

The agents' text comes from the files in `agents/`. After a `git pull`, restart the server, that is the client, to load the updated roles. Ids and code names do not change.
