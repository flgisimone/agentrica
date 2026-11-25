# F42 — Validazione deterministica

**Obiettivo**: controllare senza un modello che i file prodotti dagli agenti abbiano la forma giusta, così un errore di formato si vede subito invece di sparire nel pannello: rilievi di audit, file di fase e passaggi di consegne. Il controllo verifica la struttura, non il contenuto, e non riscrive le risposte.

> **Stato: da aprire, dopo F41.** Fase nata dall'analisi della roadmap consolidata il 2026-11-25 (era «F42 — Validazione, governance e benchmark»). La parte sui benchmark è già in F40 e F41.

**Agenzie (proposta)**: software (Architect per gli schemi, Backend per il validatore, QA, Code Reviewer); design (UX Writer) solo se gli errori compaiono nel pannello.

## Situazione di partenza (da verificare all'apertura)

- Il formato di `plan/` e `audit/` è documentato nel README del pacchetto (F14, F35), e il pannello lo legge (`packages/mcp/src/panel.ts`). Va verificato cosa succede oggi a un file malformato: viene ignorato, segnalato o fa fallire la lettura.
- I rilievi di audit sono un JSON per agente in `audit/<audit_id>/`. Lo schema è nelle regole comuni dei reparti, non in un tipo del codice.
- `zod` è già una dipendenza a versione esatta di `packages/mcp`.
- Il formato dei passaggi di consegne nasce in F41-05.

## Proposte da confermare

- **Interfaccia**: un comando (`npx @agentrica/mcp check`), un tool MCP, o tutti e due sullo stesso modulo.
- **Contraddizioni da segnalare**, solo con regole esplicite: stesso id di rilievo con valori diversi, rilievo chiuso senza evidenza, fase «completata» con attività P0 senza esito.
- **CI di questo repository**: controllare `plan/` e `audit/` a ogni push.

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F42-01 | Schemi con `zod` per rilievo di audit, file di fase di `plan/` e passaggio di consegne, ricavati dai formati già documentati | P1 |
| F42-02 | Validatore: struttura, campi obbligatori, id univoci, riferimenti a file che esistono; messaggi con file e riga, in italiano e inglese | P1 |
| F42-03 | Contraddizioni dalle regole decise all'apertura: si segnalano entrambe le evidenze, senza scegliere | P1 |
| F42-04 | Pannello: un file malformato mostra l'errore invece di sparire | P2 |
| F42-05 | Controllo di `plan/` e `audit/` di questo repository nella CI | P2 |
| F42-06 | Test sui casi validi e malformati di ogni schema, Code Reviewer sul diff; README, `CHANGELOG` e versione | P1 |

## Criteri di accettazione

- Un file malformato viene segnalato con la causa; uno valido passa.
- Le contraddizioni si segnalano senza inventare una risposta.
- Nessuna chiamata a un modello.
- `plan/` e `audit/` di questo repository passano il controllo.
- `npm run verify` verde.

## Fuori perimetro

Valutazione semantica dei risultati, LLM come giudice, una seconda chiamata a un modello.
