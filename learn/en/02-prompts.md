# Prompts and instructions

Slug: prompts-and-instructions · Description: How to write a request the model understands, and why stable instructions belong in a file.

## In short
A [prompt](glossary.md#prompt) is the text you give the model: the question, but also the material and the rules. The more precise it is, the less the model has to guess. Rules that always apply are written once, in a [system prompt](glossary.md#system-prompt) or in a file the assistant reads on its own.

## The idea
From the [previous lesson](01-language-model.md) you know that the model continues the text it receives. The prompt is that text. If you write «fix it», the model has to guess what, how and how far. If you write «in `cart.ts` the `total` function ignores the discount when the cart is empty: fix it without changing the signature and add a test», you have given it almost everything.

A good working prompt answers a few questions:

- **What** you need, with a result that can be checked.
- **On what** to work: file, function, page, sample data.
- **With which constraints**: what not to touch, which tools to use, which style to follow.
- **In what form** you want the answer: a change, a list of findings, a short explanation.

You do not need a special style or magic phrases. You need what you would tell a capable person joining the project today. Examples help a lot: one input case and the expected result are worth more than an adjective like «robust».

Some rules apply to every request: the language of comments, the test commands, the folders not to change. Repeating them every time is tiring and sooner or later you forget one. That is why models distinguish between the user's message and the system prompt, a text that comes before the conversation and steers all of it. [Coding assistants](glossary.md#coding-assistant) apply the same principle with files: Claude Code, for example, reads the project's `CLAUDE.md` file on its own at the start of every session.

Instructions written in a file have three advantages. You can reread and improve them like code. They are the same for everyone in the team. And you can version them with git, so you know when a rule changed and why.

One limit to know: long, contradictory instructions confuse the model as much as a person. If two rules clash, the model picks one, not always the one you meant. Better a few clear rules, each with its reason.

## In AIgentrica
In AIgentrica the agents are instructions written in files. Each department has a file of common rules, for example [agents/ai_software_agency/00-common-rules.md](../../agents/ai_software_agency/00-common-rules.md), with rules such as «do not add dependencies without a reason» or «do not read real personal data unless the task requires it». Then there is a [role file](glossary.md#role-file) for each agent, with its mission and way of working: see [agents/ai_software_agency/02-senior-software-architect.md](../../agents/ai_software_agency/02-senior-software-architect.md).

When you ask for an agent, the server assembles the prompt: the department's common rules, the role file and your task, in this order. The code that does it is in [packages/mcp/src/prompt.ts](../../packages/mcp/src/prompt.ts). You can see the exact text that reaches the model with the script [scripts/agent-text.ts](../../scripts/agent-text.ts), the same one used in the measurements.

The project's own instructions follow the same idea: [AGENTS.md](../../AGENTS.md) tells assistants how to work in this repository, and `CLAUDE.md` simply includes it. Since phase F32 every role file has an English twin with the same name in the `en/` folder, and the catalog stops if one is missing: a prompt has to say the same thing in both languages. The agent pages on the site, born in F4, also show the role file as it is: see [/agenti](/agenti).

## Try it
Take a request you recently made to your assistant and rewrite it with the four questions: what, on what, with which constraints, in what form. Send both in two new chats and compare the results.

Then open or create your project's instructions file (`CLAUDE.md` for Claude Code) and write three rules you often repeat, each with its reason in one line. For example:

```markdown
- Run `npm test` before saying a change is done: CI runs it anyway.
- Do not edit files in `generated/`: they are regenerated from the schema.
- Comments in English, names in the code in English.
```

Open a new session and check that the assistant follows them without you repeating them.

## Terms
- [Prompt](glossary.md#prompt)
- [System prompt](glossary.md#system-prompt)
- [Coding assistant](glossary.md#coding-assistant)
- [Role file](glossary.md#role-file)
