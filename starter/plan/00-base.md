# F0 — Base tecnica

**Obiettivo**: un progetto che si avvia e ha già tutti i controlli di qualità, così le fasi successive aggiungono solo prodotto.

> **Stato: da fare.** <!-- A fine fase: «completata (`hash`, in `develop`)», con data, conferme dell'utente e scostamenti dal piano. -->

**Agenzie**: software (Architect per la struttura, DevOps per script, build e CI, QA, Code Reviewer).

## Proposte da confermare

<!-- All'apertura della fase le propone il direttore software (AISA-01, con il tool `agent` di AIgentrica) e si decidono con l'utente con `ask_user`, nel pannello. -->

- Stack e versioni delle dipendenze (stabili correnti, fissate esatte).
- Agenzie attive per questo progetto (AGENTS.md, «Agenzie»).
- Dati: mock e dati finti, oppure dati reali dell'utente (cambia le regole per gli agenti e il `.gitignore`).

## Backlog

| # | Attività | Priorità |
|---|---|---|
| F0-01 | `package.json` con le dipendenze approvate, versioni esatte; `.nvmrc` allineato | P1 |
| F0-02 | `tsconfig.json` strict (`noUncheckedIndexedAccess`); lint; script `dev`, `build`, `typecheck`, `lint`, `test`, `verify` (e `verify:e2e` quando arriva Playwright) | P1 |
| F0-03 | Struttura delle cartelle (CONVENTIONS §5) con `src/lib` per la logica pura e il lint che la protegge; la prima pagina o scena di prova | P1 |
| F0-04 | Primo test unitario in `src/lib`, così `npm run verify` prova anche i test | P1 |
| F0-05 | Sezioni «da compilare» di `CONVENTIONS.md` e «Adattamenti» di `AGENTS.md`; agenzie non attive tolte da `agents/` e `.claude/agents/`; riga «Stack» in `plan/README.md` | P1 |
| F0-06 | `.gitignore` completato con le cartelle di build dello stack; CI verde al primo push | P2 |
| F0-07 | `tokensave init` dalla root, primo commit della fase su `develop` | P2 |

## Criteri di accettazione

- `npm run dev` avvia l'app senza errori in console.
- `npm run verify` passa con almeno un test unitario.
- Nessun file in `src/lib` importa il framework, il DOM o la rete (verificato dal lint con un file di prova).
- Nessuna sezione «da compilare» rimasta in `CONVENTIONS.md` e `AGENTS.md` per le parti che F0 ha deciso.
- La CI su `develop` è verde (dopo il push approvato dall'utente).

## Fatto

<!-- A fine fase: una riga per attività, con versioni installate, file creati e scelte prese. -->

## Verifiche

<!-- A fine fase: comandi eseguiti con l'esito reale; cosa non è stato verificato e perché. -->

## Rilievi aperti

<!-- A fine fase: rilievi con priorità motivata (P0–P3) e dove verranno affrontati. -->
