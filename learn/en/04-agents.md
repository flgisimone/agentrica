# From assistants to agents

Slug: from-assistants-to-agents · Description: What changes when the model does not just answer but reads files, runs commands and checks the result.

## In short
An [agent](glossary.md#agent) is a model working in a loop: it decides an action, carries it out with a tool, looks at the result and decides the next one. Today's [coding assistants](glossary.md#coding-assistant) work this way. More autonomy means more work done and more things to check.

## The idea
In a plain chat you ask, the model answers, and you are the one who copies the code into the project and tries it. An agent does those steps itself. You ask it «the test for `orders.ts` fails, find out why and fix it», and it:

1. reads the test and the file;
2. runs the test and reads the error;
3. changes the code;
4. runs the test again;
5. if it still fails, goes back to step 1 with what it learned.

The model is the same as in the chat. Two things change: it has tools to act (read, write, run commands), which you will see in the lesson on [tools and MCP](05-mcp.md), and a loop that sends the results of its actions back to it as new context.

This brings clear benefits: the agent checks its work instead of imagining it, and solves multi-step tasks without you acting as the go-between. It also brings new risks. A wrong command does not stay a suggestion on the screen: it gets run. That is why assistants ask for permission before actions that matter, and you can decide which actions to approve once and for all and which each time.

Two more tools make agents more reliable.

- **Sub-agents.** An agent can hand part of the work to another agent with its own clean context, and get back only the result. In Claude Code they are called [subagents](glossary.md#subagent). Useful for a wide search that would fill the main context; expensive, because each sub-agent starts from scratch and rereads what it needs.
- **Hooks.** A [hook](glossary.md#hook) is a command the assistant runs on its own at a precise moment, for example at every request of yours or after every change to a file. It does not depend on the model: it always happens.

And one ground rule: what a program can check should be checked by a program. A [deterministic check](glossary.md#deterministic-check), like a test or a format validator, always gives the same answer to the same input. The model does not. The best agent uses the model to understand and decide, and checks to verify.

## In AIgentrica
AIgentrica's agents are roles your assistant takes on: the server provides the role's text, your assistant works with its own tools. The roles also exist as Claude Code subagents, for example [.claude/agents/software/sw-architect.md](../../.claude/agents/software/sw-architect.md), a short file that points to the role file. The project starts them only when you ask: the rules in [AGENTS.md](../../AGENTS.md) call them «the most expensive item».

A real problem: the server's instructions arrive only at startup, and after a few requests the model tended to work alone, without loading the agents. Phase F39 solved it with a hook: the `init` command writes into your project's `.claude/settings.json` a reminder that Claude Code adds to every request. The code is in [packages/mcp/src/init.ts](../../packages/mcp/src/init.ts).

And an example of a deterministic check: since phase F42 the server verifies the shape of plan and audit files without asking a model anything, in [packages/mcp/src/check.ts](../../packages/mcp/src/check.ts). The same check is a tool, `check`, that the agent calls after writing those files: if a table is malformed it knows right away, instead of hoping the model notices.

## Try it
Give your assistant a task that takes several steps and watch it work, without stepping in. For example:

```text
Run the project's tests. If any fail, find the cause and propose the
smallest fix, but do not change anything before showing it to me.
```

While it works, count the actions: how many reads, how many commands, how many times it checks again. Then look at your assistant's permission settings and decide which commands to always approve (for example the tests) and which you want to see every time (for example those that delete or publish).

## Terms
- [Agent](glossary.md#agent)
- [Coding assistant](glossary.md#coding-assistant)
- [Subagent](glossary.md#subagent)
- [Hook](glossary.md#hook)
- [Deterministic check](glossary.md#deterministic-check)
