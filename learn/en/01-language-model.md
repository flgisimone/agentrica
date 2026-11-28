# What a language model is

Slug: language-model · Description: What the program answering you in the chat really does, and why it is sometimes confidently wrong.

## In short
A [language model](glossary.md#language-model) is a program that, given a text, predicts how to continue it. It does not look the answer up in an archive: it builds it one piece at a time. That makes it fast and often useful, but what it writes has to be checked.

## The idea
When you type a question to an assistant such as Claude, the text goes to a language model. The model does not read whole words: it reads [tokens](glossary.md#token), pieces of text that can be a word, part of a word or a punctuation mark. A function name like `loadCatalog` can become several tokens.

The model does one thing, many times over: it looks at all the tokens in front of it and works out which token is most likely to come next. It picks one, adds it to the text and starts again. A ten-line answer is hundreds of these steps. The computation that produces the answer is called [inference](glossary.md#inference), and it costs: every token read or written uses computing power that somebody pays for.

Where does the ability to predict well come from? From [training](glossary.md#training): before it reaches you, the model has seen a huge amount of text, code included, and has adjusted billions of internal numbers to predict the continuation better. The architecture used today by the most common models is called the Transformer and was described in a 2017 paper, [Attention Is All You Need](https://arxiv.org/abs/1706.03762) (Vaswani et al., 2017). After this first stage, assistant models are trained further, to follow instructions and answer as a dialogue.

Three practical consequences to keep in mind throughout this course:

- **The model has no archive of verified facts.** It has learned what plausible text looks like. Plausible is almost always true too; sometimes it is not. When it confidently makes up a detail (a function that does not exist, a regulation with the wrong number) it is called a [hallucination](glossary.md#hallucination).
- **The model knows the world up to its training date.** A library released or changed later does not exist for it, unless somebody puts it in front of it.
- **The model does not know your project.** It only knows what arrives in the text of the request. How it gets there, and how much it can read, is the topic of the lesson on [context and tokens](03-context.md).

The same question can give different answers: there is an element of chance in choosing the next token. That is not a defect to fix, but one more reason to check the result instead of trusting the first version.

None of this makes models useless. It makes them tools to use the way you would use a very fast and very well-read colleague who has not seen your code and does not always say when they do not know: you give them the right material, you ask for things that can be checked, and you check.

## In AIgentrica
AIgentrica is built on this idea of a boundary. Its server does not call any model: it assembles texts, keeps the state of the session and runs checks that do not depend on chance. The reasoning is done by your assistant's model. It is a decision written in the plan, «Confini del Core (F40)» (boundaries of the Core), in [plan/README.md](../../plan/README.md).

An AIgentrica agent, then, is not a program that thinks: it is a text the server hands to your model. For example the software architect's role is in [agents/ai_software_agency/02-senior-software-architect.md](../../agents/ai_software_agency/02-senior-software-architect.md). The model reads it and tries to behave as described.

Since models make mistakes, AIgentrica tests them. In [examples/README.md](../../examples/README.md) there are small projects with defects planted on purpose: an agent gets the project and we count how many defects it finds and how many it makes up. In the measurement of 2026-11-19, in [examples/risultati/2026-11-19-modelli.md](../../examples/risultati/2026-11-19-modelli.md), on the case of requirements for a subscription service the smallest model, Haiku, reported one more non-existent defect than Opus in one of its two runs. Haiku was not chosen for that role. A made-up error matters, because it makes you waste time chasing it.

## Try it
Run two experiments with your assistant, in two new chats.

1. Ask the same thing twice, for example «explain in three lines what a promise is in JavaScript». Compare the answers: the meaning is the same, the words are not.
2. Ask «what does the main function of my project do?» without giving it any file. Then repeat, giving it the file. Notice the difference between a plausible answer and an answer based on your code.

If an answer mentions a function, an option or a law, look it up in the source before using it.

## Terms
- [Language model](glossary.md#language-model)
- [Token](glossary.md#token)
- [Inference](glossary.md#inference)
- [Training](glossary.md#training)
- [Hallucination](glossary.md#hallucination)
