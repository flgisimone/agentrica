# Glossary

The terms of the «Learn» course, in the order they appear in the lessons.

## Language model
Id: language-model

A program trained on large amounts of text that, given a text, predicts how it continues one [token](glossary.md#token) at a time. It is the engine of assistants such as Claude.

## Token
Id: token

The piece of text the model reads and writes: a word, part of a word or a symbol. Prices, limits and context size are measured in tokens.

## Inference
Id: inference

The computation by which the model produces an answer. Every token read or written is inference, and it has a cost.

## Training
Id: training

The stage, before use, in which the model learns from large amounts of text by adjusting its internal parameters. What happened afterwards, the model does not know.

## Hallucination
Id: hallucination

A false but plausible claim the model makes confidently, such as a function or a regulation that does not exist.

## Prompt
Id: prompt

The text you give the model: request, material and constraints.

## System prompt
Id: system-prompt

Text that comes before the conversation and steers all of it: rules, role, answer format.

## Coding assistant
Id: coding-assistant

A program such as Claude Code that uses a model to read, change and test your project's code, with your permission.

## Role file
Id: role-file

In AIgentrica, the file in `agents/` that describes an agent: mission, way of working, limits. The server hands it to the model together with the department's common rules.

## Context
Id: context

All the text the model reads to answer: instructions, conversation, files, [tool](glossary.md#tool) results.

## Context window
Id: context-window

The maximum amount of [context](glossary.md#context), in tokens, a model can read at once.

## Cache
Id: cache

The opening part of the context that the provider keeps ready between one request and the next, and charges much less for than the first read.

## Agent
Id: agent

A model working in a loop: it decides an action, carries it out with a tool, looks at the result, decides the next. In AIgentrica it is also a role in a department.

## Subagent
Id: subagent

In Claude Code, an agent started by another one with its own context; it returns only the result.

## Hook
Id: hook

In Claude Code, a command the assistant runs on its own at a precise moment, for example at every request, without going through the model.

## Deterministic check
Id: deterministic-check

A check done by a program, which always gives the same outcome for the same input: a test, a format validator, a typecheck.

## Tool
Id: tool

An action the model can ask the assistant to run, described by a name, an explanation and its parameters.

## MCP
Id: mcp

Model Context Protocol: an open standard by which a program offers tools, prompts and resources to any compatible assistant.

## MCP server
Id: mcp-server

The program that offers tools and prompts through [MCP](glossary.md#mcp). It can run on your computer or over the network.

## MCP prompt
Id: mcp-prompt

A ready-made text offered by an MCP server, called by name. In AIgentrica there is one prompt per agent.

## Orchestration
Id: orchestration

How several agents share a job: who coordinates, in what order they work, what they pass on.

## Handover
Id: handover

What an agent leaves to the next one: outcome, [findings](glossary.md#finding) with evidence and open questions.

## Director
Id: director

In AIgentrica, the agent that coordinates a department: it picks the specialists and the order, and consolidates the results.

## Finding
Id: finding

A problem found by an agent, with its evidence (file, line, command) and a priority.

## Reasoning effort
Id: reasoning-effort

How much the model reasons before answering. Higher helps on hard problems and uses more tokens.

## Test case
Id: test-case

A project or document with known defects, used to measure how many an agent finds and how many it makes up.

## False finding
Id: false-finding

A reported defect that does not exist. It weighs more than a missed one, because it makes you work on a problem that is not there.

## Subscription limits
Id: subscription-limits

The usage allowances of an assistant subscription, which reset after a few hours or every week. Large models use them up faster.

## Prompt injection
Id: prompt-injection

Text read by the model (in a file, a page, an issue) that tries to give it instructions other than the user's.

## Least privilege
Id: least-privilege

Giving an agent, a program or a person only the permissions the task needs, and nothing more.

## Personal data
Id: personal-data

Any information about an identified or identifiable person: name, email, IP address, health data. In the European Union it is protected by the GDPR.

## Source
Id: source

Where a piece of information comes from. Primary if it is the origin (specification, text of the law), with a verification date for things that change.

## Phase
Id: phase

A piece of work with a goal, a [backlog](glossary.md#backlog), acceptance criteria and a status, written in a plan file.

## Backlog
Id: backlog

The list of a phase's tasks, each with an identifier and a priority.

## Acceptance criteria
Id: acceptance-criteria

The checkable conditions that say when a phase or a task is done.
