# F56 — File di lavoro nel repository privato e badge di mcprush

**Obiettivo**: `plan/`, `audit/` e `docs/` passano, con la loro storia, nella radice del repository privato `flgisimone/aigentrica-site` ed escono dal ramo del repository pubblico; i badge di mcprush puntano alla scheda `aigentrica-mcp`.

> **Stato: da fare.** Registrata il 2026-11-28. Riprende F19 (abbandonata il 2026-11-16, che resta sospesa) e il rilievo #61 di F54. Si può fare prima o dopo F55: non dipendono l'una dall'altra.

**Agenzie**: software (DevOps per lo spostamento e la CI, QA, Code Reviewer); cybersecurity (Cloud Security) per cosa resta visibile nella storia pubblica; privacy (Legal Specialist) per le note legali, che citano il repository e mcprush.

## Decisioni dell'utente

| Tema | Decisione | Data |
|---|---|---|
| Sede | Radice di `aigentrica-site`: `plan/`, `audit/`, `docs/`. Pianificazione e audit si fanno da una sessione aperta lì, così il pannello li trova | 2026-11-28 |
| Storia | Le cartelle passano con i loro commit (`git filter-repo`, come in F17). Il repository pubblico non si riscrive: tag `v*`, provenance e link del registro restano validi; ciò che è già pushato resta visibile nella storia | 2026-11-28 |
| Cosa resta pubblico | `agents/`, `.claude/agents/`, `starter/`, `examples/`, `learn/`, `packages/`, `scripts/`, `.github/`, `AGENTS.md`, `CONVENTIONS.md`, `CLAUDE.md` (decisioni di F19) | 2026-11-28 |
| Controllo di `learn/fasi.md` | Esce da `packages/mcp/src/learn.test.ts` e va nel `verify` del sito, che legge `plan/README.md` locale e `learn/fasi.md` dal pacchetto a versione esatta | 2026-11-28 |
| Badge di mcprush | Aggiornati ad `aigentrica-mcp` nei README e nel footer del sito (l'utente ha visto la scheda) | 2026-11-28 |
| Compatibilità col vecchio nome (#62) | Non in questa fase: resta fino alla prossima major per altri motivi | 2026-11-28 |

## Backlog

| # | Task | Priorità |
|---|---|---|
| F56-01 | Estrarre `plan/`, `audit/` e `docs/` con la storia e unirli alla radice di `aigentrica-site` (su `develop`), poi toglierli dal ramo di questo repository | P1 |
| F56-02 | Link e regole: `AGENTS.md`, `CONVENTIONS.md` (§13.7 e percorsi), `README.md`, `README.it.md`, i commenti nel codice che citano `plan/`, `docs/` (es. `departments.ts`, `study.yml`) e `.claude/agents/` che rimandano a `docs/`; `AGENTS.md` del sito con la sezione sul piano | P1 |
| F56-03 | Controllo di `learn/fasi.md` spostato nel `verify` del sito; `learn.test.ts` senza la lettura di `plan/`; CI di entrambi verde | P1 |
| F56-04 | Badge `agentrica-mcp` → `aigentrica-mcp`: `README.md`, `README.it.md`, `packages/mcp/README.md`, `packages/mcp/README.it.md`; footer del sito (`site-footer.tsx`) ed `e2e/pubblicazione.spec.ts` | P2 |
| F56-05 | Note legali del sito e testi pubblici che dicono che piano e audit sono pubblici: rilettura e correzione | P2 |
| F56-06 | Revisione: Cloud Security su cosa resta nella storia pubblica, Code Reviewer sui diff dei due repository | P1 |

## Criteri di accettazione

- In `aigentrica-site` ci sono `plan/`, `audit/` e `docs/` con la storia (`git log -- plan/` mostra i commit di prima).
- Il ramo `develop` di questo repository non contiene più `plan/`, `audit/` né `docs/`; la storia pubblica non è riscritta.
- `npm run verify` passa in entrambi i repository; `npm run verify:e2e` passa nel sito.
- Il pacchetto si costruisce come prima (`npm pack` con lo stesso contenuto, meno nulla che servisse).
- Nessun link rotto nei README pubblicati (pacchetto, registro MCP, sito).
- I badge e il footer puntano a `aigentrica-mcp`; issue #61 chiusa con l'evidenza.

## Rilievi aperti

- Nessuno.
