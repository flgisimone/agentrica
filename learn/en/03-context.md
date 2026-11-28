# Context and tokens

Slug: context-and-tokens · Description: What the model actually reads at each request, how much it can read and why it pays to keep it tidy.

## In short
The [context](glossary.md#context) is all the text the model reads to answer: instructions, conversation, files, tool results. It has a limit, the [context window](glossary.md#context-window), and it is measured in [tokens](glossary.md#token). A small, relevant context gives better answers and costs less.

## The idea
The model remembers nothing between one request and the next. It seems to remember because, at every message, the assistant sends it the whole conversation so far: the system prompt, your messages, its answers, the files it has read. That bundle is the context.

Two consequences. First: the longer the conversation, the more text the model rereads at each step, and every token read is paid for, in money or in the subscription's limits. Second: the context window has a maximum. When the conversation gets close to it, the assistant has to summarize or cut, and some details are lost.

To estimate how many tokens a text weighs, a rough rule is enough: on average a token is a few characters. AIgentrica uses «bytes divided by four», and states that it is an estimate. The exact count depends on the model and the language.

The [cache](glossary.md#cache) helps. The start of the context stays the same from one message to the next: instructions, files already read. Providers keep it ready and charge much less for it than for the first read. That is why stable parts should sit at the top and not change at every step.

What you can do in practice:

- **Give the model only what it needs.** A whole two-thousand-line file when thirty lines are needed is noise: the model reads it, pays for it and can get distracted.
- **One conversation per task.** When you move to different work, open a new session. In Claude Code `/clear` empties the conversation; `/compact` summarizes it when it has grown long but you want to continue.
- **Write the state outside the chat.** Decisions, to-do list and results in project files: the new session rereads them and you lose nothing.

The context is also why an assistant seems «not to know» something you told it an hour ago: maybe it was summarized away. It is not carelessness, it is the limit of the window.

## In AIgentrica
AIgentrica measured how much its texts weigh before reducing them. In phase F40 the baseline counted the bytes of each part of an agent's text, in [examples/risultati/2026-11-25-baseline-contesto.md](../../examples/risultati/2026-11-25-baseline-contesto.md): from 6.2 to 8.7 KB per agent, of which 3.5 to 5 KB were the department's common rules.

The common rules were repeated identically for every agent of the same department. Since phase F41 the server remembers, for the session, which departments it has already sent them for: the first agent gets them in full, the following ones only a reference. The result, in [examples/risultati/2026-11-25-contesto-compatto.md](../../examples/risultati/2026-11-25-contesto-compatto.md): a software specialist went from 6,301 to 2,604 bytes, and a full flow from 47,676 to 44,395 bytes (6.9% less), with the same defects found in the tests. The reference also says how to get everything back with the `full_rules` parameter: after a `/compact` the rules may have been summarized.

Something that looked like a saving and was not: in F12 the `--agents` option limits the agents the server offers, but in Claude Code server prompts do not enter the context until you use them, so the benefit is a shorter menu, not fewer tokens.

The way of working on this repository keeps the context in check too: in [AGENTS.md](../../AGENTS.md), section «Efficienza» (efficiency), there are one session per phase, targeted reads instead of whole files and a local tool, tokensave, that returns only the code needed.

## Try it
Take a long conversation with your assistant and ask yourself how much of that text is still needed. Then try this flow for your next task:

1. Write in a `NOTES.md` file in the project what you are doing and what you decided.
2. Open a new session and ask the assistant to read `NOTES.md` and continue.
3. When you give a file, point to the lines or the function: «read `parseOrder` in `orders.ts`», not «read the folder».

If your assistant shows how much context is in use (in Claude Code the `/context` command), look at it before and after reading a large file.

## Terms
- [Context](glossary.md#context)
- [Context window](glossary.md#context-window)
- [Token](glossary.md#token)
- [Cache](glossary.md#cache)
