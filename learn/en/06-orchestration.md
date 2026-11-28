# Many agents together: orchestration

Slug: orchestration · Description: Why split a job across different roles, in what order to run them and how information gets passed along.

## In short
[Orchestration](glossary.md#orchestration) is how several agents share a job: who starts, who follows, what they pass on. A coordinating role picks the specialists; each one works on the previous one's result with a clear [handover](glossary.md#handover). The important decisions stay with you.

## The idea
A single model can write code, check security and review texts. But if you ask for everything at once, it mixes viewpoints and tends to side with the first one it took. Splitting the work into roles helps for the same reason it helps in a team of people: each role has a narrow task, its own criteria and its own questions.

Splitting has a cost, though. Every extra role is extra text in the context, and moving from one role to the next can lose information. So three rules are needed.

- **Who coordinates.** A role that does not do the work but decides who does it and in what order. In AIgentrica's scheme it is the department's [director](glossary.md#director).
- **One at a time.** Specialists work in sequence, each starting from what the previous one left, instead of all together on the original task. That way the second sees the problems the first found and does not repeat them.
- **What gets passed.** At the end of each role, a handover in three parts: the outcome, the [findings](glossary.md#finding) with their evidence (file, line, command) and the open questions. Without evidence a finding cannot be checked; without open questions whoever follows believes everything is settled.

The order between different skills matters too. If you build first and ask afterwards what was needed, you redo the work. A reasonable order for a new feature: first whoever defines goal and requirements, then whoever designs the experience, then whoever assesses personal data, then your confirmation, then development, then the reviews. Skip the steps that do not apply to that task.

Finally, the point that makes orchestration safe: agents propose, you decide. Priorities, architecture choices, findings accepted or rejected, commits and releases go through your confirmation.

## In AIgentrica
The order is written in the server's instructions and in [AGENTS.md](../../AGENTS.md): business, design, privacy, user confirmation, software, design and privacy reviews, Code Reviewer, user confirmation. Each department has its workflow in its README, for example [agents/ai_software_agency/README.md](../../agents/ai_software_agency/README.md); since phase F3 the department READMEs share the same shape.

The rules did not enforce themselves. The test case [examples/casi/orchestrazione-newsletter.md](../../examples/casi/orchestrazione-newsletter.md) asks a model to build a feature in a new project, and the run of 2026-11-22 in [examples/risultati/2026-11-22-orchestrazione.md](../../examples/risultati/2026-11-22-orchestrazione.md) shows the before and after. With version 0.9.0 the model started two subagents on its own and never called the server. After phase F34, [plan/34-orchestrazione.md](../../plan/34-orchestrazione.md), the same task went like this: list of agents, business, design and privacy directors one at a time, a question to the user, then the software director and one specialist. No subagents.

To watch orchestration as it happens there is the local panel: since phase F52 the «Map» view draws each loaded agent in a lane per department, in the order of the calls. The code is in [packages/mcp/src/page/app.js](../../packages/mcp/src/page/app.js); the site's [/orchestrazione](/orchestrazione) page explains the flow with a diagram.

## Try it
Take a small feature you want to add to your project, for example a contact form. Before asking for the code, ask your assistant for three separate steps, in this order:

1. «List the requirements and acceptance criteria, with the open questions.»
2. «Starting from these requirements, list the risks for personal data and security.»
3. «Starting from requirements and risks, propose the smallest implementation.»

Between steps, answer the open questions. Compare the result with what you would have got by asking for the code straight away. With AIgentrica connected, you can ask for the same work and watch in the panel which agents get loaded and in what order.

## Terms
- [Orchestration](glossary.md#orchestration)
- [Handover](glossary.md#handover)
- [Director](glossary.md#director)
- [Finding](glossary.md#finding)
