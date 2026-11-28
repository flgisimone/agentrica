# Cost and usage

Slug: cost-and-usage · Description: Where the cost of a session with an assistant comes from, how to read it and how to cut it without losing quality.

## In short
Every token the model reads or writes is [inference](glossary.md#inference) that somebody pays for: you through the API, or the [subscription's limits](glossary.md#subscription-limits). The cost grows with the context reread at every step, with the size of the model and with the text produced. The [cache](glossary.md#cache) and a tidy context are the main levers.

## The idea
With the API the price is per million [tokens](glossary.md#token), split between input tokens (what the model reads) and output tokens (what it writes); output costs more. With a subscription you do not see dollars, but you use up an allowance that resets after a few hours and one that resets every week. The principle is the same: more tokens, more usage, and large models use it up faster.

Where do the tokens go in a session with an agent? Less than you think into answers, much more into rereading. Remember from the [lesson on context](03-context.md) that at every step the model rereads the whole context. An agent taking twenty actions rereads twenty times the instructions, files and earlier results. That is why:

- the stable part at the top of the context, read from the cache, costs a fraction of the first read;
- a large file read at the start weighs on every following step, not just one;
- a long session that changes topic keeps paying for a context that is no longer needed.

And a cost you do not see: redone work. A session interrupted halfway, a wrong result to fix, a false finding to chase cost tokens and give nothing back.

What you can do, in order of effect:

1. Relevant context: only the files and lines needed, one session per task.
2. The model that fits the task, chosen by measuring (lesson [choosing a model](07-models.md)).
3. Stable parts kept stable: instructions and rules in files that do not change at every step, so they stay in the cache.
4. Tools that return less text: a targeted search instead of reading a whole folder.

Finally, measure. Without numbers you optimize at random. Many assistants save the tokens of each answer; looking at them once a week is enough to understand where they go.

## In Agentrica
In Agentrica's calculations the API prices are those of 2026-11-03, per million input and output tokens: Opus 5.5 4 and 20 dollars, Sonnet 5.5 2 and 10, Haiku 5.5 0.10 and 0.50; reading from the cache costs a tenth of input. They are written with their date in [packages/mcp/src/usage.ts](../../packages/mcp/src/usage.ts), the same file that reads usage: Claude Code saves for each answer the model, reasoning effort and tokens in the project's files under `~/.claude/projects/`, and the local panel shows them per agent, model, session and day. Only the numbers are read from those files, never the text of the conversations.

In the F24 measurement, in [examples/risultati/2026-11-19-modelli.md](../../examples/risultati/2026-11-19-modelli.md), the cache covered 75 to 82% of tokens, depending on the configuration. The same measurement also tells the cost of redone work: 27 attempts stopped by the subscription's five-hour limit spent 532 thousand tokens with no result, and were rerun from scratch.

Since phase F27 you can send your token totals to the site, only after a preview of what leaves and your yes: totals per day, agent, model and reasoning effort, no text or paths. The decisions are in [plan/27-consumo-sito.md](../../plan/27-consumo-sito.md). And the project's working rules, in the «Efficienza» (efficiency) section of [AGENTS.md](../../AGENTS.md), start from here: a session's cost grows with the calls and with the size of the context, because every call rereads all of it.

## Try it
Look at your usage over the last week. In Claude Code the `/cost` command shows the session's cost with the API, and with a subscription `/usage` shows the limits. With Agentrica, the local panel shows the project's usage with charts.

Then run a test on any task:

1. Do it in a long session already full of other work, and note the usage.
2. Do it again in a new session, giving only the files needed.

Compare the two numbers. The difference is the price of the context you did not need.

## Terms
- [Inference](glossary.md#inference)
- [Subscription limits](glossary.md#subscription-limits)
- [Cache](glossary.md#cache)
- [Token](glossary.md#token)
