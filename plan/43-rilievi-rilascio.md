# F43 — Rilievi di F40–F42 e rilascio 0.15.0

**Obiettivo**: chiudere i rilievi che bloccano il rilascio di F41 e F42 (prova a mano del flusso con il contesto compatto) e portare pacchetto e sito insieme alla 0.15.0.

> **Stato: in corso.** Aperta il 2026-11-25 su scelta dell'utente («F43 rilievi + rilascio»).

**Agenzie (proposta)**: software (Backend per eventuali correzioni del server, DevOps per il rilascio, QA, Code Reviewer); design (UX Writer) solo per i testi del sito che cambiano.

## Situazione di partenza

- `main` è alla v0.13.0; `develop` ha la 0.14.0 (F41) e la 0.15.0 (F42) non rilasciate. Il sito dipende da `@agentrica/mcp` 0.13.0.
- F41, rilievo P1: la prova a mano di `orchestrazione-newsletter` (C1–C9) va fatta prima del rilascio; i passi sono in `examples/risultati/2026-11-25-contesto-compatto.md`. Si fa in una sessione interattiva di Claude Code (pannello, `/compact`): la esegue l'utente, l'analisi del transcript con `npm run -s orchestration` la fa la sessione.
- F41, rilievo P2: la memoria del server non vede `/clear` né `/compact`; si decide dopo la prova.
- F36-R5: la descrizione npm in `packages/mcp/package.json` dice ancora «Agentrica's 56 AI agents».
- F42: i tre rilievi aperti hanno una condizione per riaprirli che non si è verificata.

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F43-01 | Prova a mano di `orchestrazione-newsletter` sul server di `develop` (C1–C9), esito con data, versione e modello in `examples/risultati/2026-11-25-contesto-compatto.md` | P1 — rilievo P1 di F41, blocca il rilascio |
| F43-02 | Rilievo P2 di F41: se la prova mostra un agente senza regole dopo `/clear` o `/compact`, correzione decisa con l'utente; altrimenti chiuso con l'evidenza della prova | P2 |
| F43-03 | F36-R5: descrizione npm senza numero di agenti | P3 |
| F43-04 | Sito: testi che dipendono da 0.14.0 e 0.15.0 (tool `check`, `full_rules`, «Cosa resta sul computer»), dipendenza a 0.15.0 | P1 — rilascio in parallelo |
| F43-05 | Rilascio 0.15.0: PR in `main`, tag `v0.15.0`, npm con provenance, sito in `main`, `develop` riallineato nei due repository (CONVENTIONS §13.8) | P1 |

## Criteri di accettazione

- C1–C9 della prova a mano superati, o un difetto trovato e corretto prima del rilascio.
- Pacchetto su npm e sito in produzione alla 0.15.0; `develop` e `main` allineati nei due repository.
- `npm run verify` verde; `npm run verify:e2e` verde nel repository del sito.

## Decisioni dell'utente (2026-11-25)

- **C5 rosso** nella prova a mano: rilievo P2 aperto, il rilascio procede (la regola sull'ordine è quella della 0.13.0, il caso era verde il 2026-11-22).
- **F43-02**: provare anche `/clear` prima di chiudere il rilievo.

## Fatto

- **F43-01** Prova a mano del 2026-11-25 (Opus 5.5, Claude Code 2.1.330, server di `develop`), esito in `examples/risultati/2026-11-25-contesto-compatto.md`: C1–C4, C6, C7, C8 e C9 verdi, C5 rosso (AISA → AIPCA). C8: regole intere ai primi agenti di AISA e AIPCA (7.046 e 7.599 byte), riferimento ad AISA-02 (3.376 byte). C9: dopo `/compact` AISA-12 con `full_rules: true` (6.737 byte). Il modello ha usato `check` da solo dopo aver scritto `plan/`.
- **F43-02** Dopo `/clear` (transcript nuovo, stesso server) AISA-12 con `full_rules: true` (6.694 byte), poi AISA-01 con il riferimento, giusto perché le regole erano già arrivate nella conversazione. Rilievo P2 di F41 chiuso con questa evidenza.
- **F43-03** `packages/mcp/package.json`: «Agentrica's AI agents, organized in departments, as a local MCP server…», senza numero (chiude F36-R5).
- **F43-04** Sito, branch `fase/f43-rilievi-rilascio`: riga di `check` in «Cosa resta sul computer» di Installa (it, en); in Orchestrazione la frase sulle regole comuni intere al primo agente del reparto, il riferimento ai successivi e la richiesta intera dopo `/compact` o `/clear` (it, en). Dipendenza a 0.15.0 dopo la pubblicazione su npm.

## Verifiche

- `npm run verify` in questo repository: verde (191 test nell'ultimo workspace).
- `npm run verify` nel sito: verde. `verify:e2e` e la prova con `npm run dev` dopo l'aggiornamento della dipendenza, nel rilascio.

## Rilievi aperti

- P2 — C5 di `orchestrazione-newsletter` rosso in un'esecuzione su Opus 5.5: il modello parte dal direttore software per «aggiungi una pagina» e salta business e design. Prima di cambiare le istruzioni del server, rifare il caso con più esecuzioni; se si ripete, una frase nelle istruzioni (entro 4096 caratteri).
- I tre rilievi di F42 restano aperti con le loro condizioni.
