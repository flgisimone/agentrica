# Tools and MCP

Slug: tools-and-mcp · Description: How an assistant uses external tools, and what the Model Context Protocol standardizes.

## In short
A [tool](glossary.md#tool) is an action the model can ask to run: read a file, search the code, call a service. [MCP](glossary.md#mcp) is an open standard for offering tools, and ready-made texts too, to any compatible assistant. An [MCP server](glossary.md#mcp-server) is the program that offers them.

## The idea
On its own the model only produces text. To act it needs an agreement with the assistant: «if I write a request in this form, you run the action and send me back the result». Every tool has a name, a description in words and the schema of its parameters. The model reads the descriptions, picks the right tool, fills in the parameters; the assistant runs it and puts the result back into its context.

That is why tool descriptions matter as much as a prompt: if they explain badly what a tool is for, the model uses it badly or not at all.

Before MCP every assistant had its own way of connecting tools, and whoever wrote an integration had to redo it for each one. The Model Context Protocol sets a common way. There are two parts:

- the **client**, that is your assistant (Claude Code, an editor, a chat app), which talks to the model and to the servers;
- the **server**, a program that declares what it offers: tools to run, [MCP prompts](glossary.md#mcp-prompt) ready to call by name, resources to read.

A server can run on your computer, started by the client and connected through the process's standard input and output (this is called the stdio transport), or over the network. A local server sees what your user account sees on the computer; a remote one receives the data you send it. Either way you are giving a program the ability to act on the model's behalf, so it is worth knowing what each tool does and what it sends out.

The specification changes over time. As of 2026-11-19 the current revision is 2026-07-28, which makes the protocol stateless and changes how a server asks the user for data during a call; the source is the [MCP specification](https://modelcontextprotocol.io/specification). SDKs can lag behind the specification: when you build a server, check which revision yours supports.

## In AIgentrica
AIgentrica is a local MCP server, stdio only, written with the official SDK, in [packages/mcp/src/server.ts](../../packages/mcp/src/server.ts). It offers one prompt per agent and a few tools:

- `list_agents` lists the agents, `agent` returns a role's text with your task, `library` a department's library cards, `check` checks the shape of the plan files;
- `rate_agent`, `share_usage` and `submit_project` send something to AIgentrica's site, and only after a preview and your yes;
- with the local panel (phase F14), `ask_user` shows a choice on the page, `open_panel` gives its address, `report` saves an agent's report.

The package README, [packages/mcp/README.md](../../packages/mcp/README.md), has the table of what stays on the computer and what leaves, tool by tool.

The software department's library keeps the notion on the specification up to date: [agents/ai_software_agency/biblioteca/01-mcp-2026-07-28.md](../../agents/ai_software_agency/biblioteca/01-mcp-2026-07-28.md), with verification date and expiry. In phase F23 the server used for the first time a request for user data during a call, to suggest rating an agent: exactly the mechanism the 2026-07-28 revision replaces.

An external proposal asked for a tool that would run chains of calls in a single program, to keep intermediate results out of the context. Before building it, phase F45 measured how often that happens in real sessions: in [examples/risultati/2026-11-28-catene-tool.md](../../examples/risultati/2026-11-28-catene-tool.md) long chains show up in 4 sessions out of 42, below the set threshold. The tool is postponed until the numbers change.

## Try it
Look at which MCP servers your assistant has: in Claude Code the `/mcp` command lists them with their tools. For each one ask yourself: is it local or remote? What does it send out?

Then connect a server in a test project. With AIgentrica, in the project folder:

```sh
claude mcp add aigentrica -- npx -y @aigentrica/mcp
```

Open a session and ask «list AIgentrica's agents». Watch which tool the model picks and what comes back to it.

## Terms
- [Tool](glossary.md#tool)
- [MCP](glossary.md#mcp)
- [MCP server](glossary.md#mcp-server)
- [MCP prompt](glossary.md#mcp-prompt)
