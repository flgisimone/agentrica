# {{PROJECT_NAME}}

<!-- Cos'è, per chi, stato attuale. -->

## Avvio

<!-- Da compilare in F0: requisiti (Node da .nvmrc), npm ci, npm run dev, variabili da .env.example. -->

## Come si lavora

| File | Contenuto |
|---|---|
| [AGENTS.md](AGENTS.md) | regole per gli agenti: tokensave, Ponytail, efficienza, verifica, agenzie (`CLAUDE.md` lo importa) |
| [CONVENTIONS.md](CONVENTIONS.md) | convenzioni del codice, test, pubblicazione |
| [plan/](plan/README.md) | decisioni e fasi, una per file |
| [agents/](agents/) e [.claude/agents/](.claude/agents/) | ruoli delle agenzie e subagent |
| [audit/](audit/README.md) | rilievi e report degli audit |
| [docs/](docs/README.md) | materiale di riferimento |

Branch: `develop` per lo sviluppo, `main` per le versioni stabili, `fase/fN-nome` e `fix/nome` partendo da `develop`. Controlli: `npm run verify` prima di ogni commit, `npm run verify:e2e` prima del merge di una fase.
