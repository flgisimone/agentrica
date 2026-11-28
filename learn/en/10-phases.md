# Working in phases

Slug: working-in-phases · Description: How to split a project into phases with a backlog and acceptance criteria, so every session with an agent starts and ends at a clear point.

## In short
A [phase](glossary.md#phase) is a piece of work with a goal, a [backlog](glossary.md#backlog) of tasks and [acceptance criteria](glossary.md#acceptance-criteria) to check at the end. Written in project files, phases give the agent the state the chat does not remember. One session per phase keeps the context small.

## The idea
An agent works well on a clear task and badly on «build the project». Phases turn a large project into clear tasks, in the right order. Each phase answers four questions:

- **Goal**: what will be true at the end, in one sentence.
- **Backlog**: the tasks, each with a priority and an identifier, so you can say precisely what is done.
- **Acceptance criteria**: sentences that can be checked, ideally with a command. «The site is fast» cannot be checked; «the page passes the accessibility test with no serious violations» can.
- **Status**: to do, in progress, completed.

Phases live in files, not in the chat. From the [lesson on context](03-context.md) you know the conversation gets lost; a `plan/` folder with the decisions taken and the phases stays, and the next session rereads it in seconds. The same goes for people: whoever joins the project tomorrow reads the plan.

A rhythm that works:

1. **Plan** in a separate session: the phase gets written, you confirm it, and that is all. No code.
2. **Develop** in a new session, on a branch dedicated to the phase, with the plan as a guide. Anything outside the scope becomes a backlog item, not a change made in passing.
3. **Verify** with [deterministic checks](glossary.md#deterministic-check): tests, typecheck, lint, and a single command that runs them all.
4. **Close**: the plan is updated with what was done and the evidence, then commit and merge with your confirmation. Then a new session opens for the next phase.

The biggest benefit is trust. When the agent says «done», you can check a precise list instead of trusting a sentence.

## In AIgentrica
AIgentrica was built this way, from the first phase to the latest. The plan is in [plan/README.md](../../plan/README.md): decisions with date and reason, and the table of phases. Each phase has its own file, modelled on [plan/00-base.md](../../plan/00-base.md), with «Fatto» (done), «Verifiche» (checks) and «Rilievi aperti» (open findings) at closure. The closing procedure is in [CONVENTIONS.md](../../CONVENTIONS.md), section 13.7: updated plan, `npm run verify`, a single confirmation question for commit, merge and push, then a new session. Since phase F16 the method is written there; findings phases, such as F15, close the problems left open by earlier ones.

The method reaches your projects too. Since phase F18 the `init` command copies a template with the plan already set up, [starter/plan/README.md](../../starter/plan/README.md); since F35 `init --existing` adds it to a project already under way, with the plan created by reading the code. Since F42 the `check` tool checks the shape of `plan/` without models, and the local panel shows phases, backlog and findings.

This course follows the phases too: at every closure the affected lesson is updated and the phase's row is added to [learn/fasi.md](../../learn/fasi.md), and `npm run verify` fails if a completed phase does not have one.

## Try it
Pick the next thing you want to do in your project and write it as a phase, in a `plan/01-name.md` file:

```markdown
# F1 — Short name

**Goal**: one sentence on what will be true at the end.

## Backlog

| # | Task | Priority |
|---|---|---|
| F1-01 | First task | P1 |

## Acceptance criteria

- A sentence that can be checked with a command.
```

Then open a new session and ask your assistant to develop only that phase. If you want it done with AIgentrica's agents, the server installs with one command: [install AIgentrica](/installa).

## Terms
- [Phase](glossary.md#phase)
- [Backlog](glossary.md#backlog)
- [Acceptance criteria](glossary.md#acceptance-criteria)
- [Deterministic check](glossary.md#deterministic-check)
