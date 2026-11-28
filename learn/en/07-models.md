# Choosing a model

Slug: choosing-a-model · Description: Large and small models, reasoning effort, and how to choose by measuring instead of by gut feeling.

## In short
Not every task needs the biggest [language model](glossary.md#language-model). A smaller model, or the same model with a lower [reasoning effort](glossary.md#reasoning-effort), costs less and is often enough. To know when it is enough, you measure on [test cases](glossary.md#test-case) with known answers.

## The idea
Providers offer families of models in different sizes. For Anthropic, in the 2026-11-03 prices collected in phase F24, they are Opus, the most capable, Sonnet, in between, and Haiku, the smallest and fastest. The larger the model, the more each token costs and the faster it uses up a subscription's limits.

Besides the model, you can choose how much it should reason before answering. With a higher reasoning effort the model writes more intermediate steps: on hard problems it helps, on mechanical tasks it is extra spending.

The temptation is to always use the best model «to be safe». But a mechanical check, such as verifying that every function has its test, does not become more correct with the most expensive model. Conversely, a difficult judgment, such as assessing an architecture, can get worse with a small model in ways you do not see right away.

The honest way to choose is to measure:

1. Prepare cases where you know the answer: projects with planted defects, documents with known errors.
2. Run the same task with the same text on different configurations, several times, because there is an element of chance.
3. Count the defects found and the [false findings](glossary.md#false-finding), that is the made-up defects.
4. Set a threshold beforehand, for example «all the defects of the large model minus one, no extra false finding», and pick the smallest model that passes it.

A false finding weighs more than a missed one: it makes you work on a problem that does not exist and undermines trust in the rest of the report.

Finally, the choice is not forever. New models come out, prices change, role texts change: a measurement holds for the version you ran it on.

## In AIgentrica
Phase F24 made the first measurement, with this method: seven test cases, four configurations (Opus with medium reasoning as the reference, Opus with low reasoning, Sonnet, Haiku), two runs each, 56 in all. The results are in [examples/risultati/2026-11-19-modelli.md](../../examples/risultati/2026-11-19-modelli.md). Compared with Opus at medium reasoning, on the finished task and at 2026-11-03 prices, Sonnet cost 52% less and Haiku 96% less, while using more tokens.

But the threshold decides role by role. In the third wave, on design, Sonnet found the same defects as Opus for three roles but with one extra false finding in one run, and those roles stayed on your session's model: see [examples/risultati/2026-11-27-ondata-3.md](../../examples/risultati/2026-11-27-ondata-3.md).

The recommended model lives in the catalog, in the `models` field of [packages/catalog/src/departments.ts](../../packages/catalog/src/departments.ts), only for measured roles. The others have `inherit`, meaning they use the model you chose, each with its reason: directors and judgment roles, such as the architect or the Code Reviewer, were not measured because a mistake there is costly; auditors neither, because a mistake of theirs closes an unresolved finding. The server says so in the agent's text, and the choice stays with you. The site's [/agenti](/agenti) catalog lets you filter by model.

## Try it
Pick a repetitive task you often do with your assistant, for example «find the functions without tests in this folder». Prepare a test folder where you already know the answer.

Run it twice with the model you usually use and twice with a smaller one (in Claude Code the `/model` command switches it). For each run note:

- how many right functions it found;
- how many it flagged by mistake;
- how much it used, if your assistant shows it.

If the small model passes the threshold you set beforehand, use it for that task.

## Terms
- [Language model](glossary.md#language-model)
- [Reasoning effort](glossary.md#reasoning-effort)
- [Test case](glossary.md#test-case)
- [False finding](glossary.md#false-finding)
