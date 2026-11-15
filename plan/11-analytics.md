# F11 — Statistiche

**Obiettivo**: sapere se `@agentrica/mcp` viene installato, con il segnale che conta davvero (i download npm), senza database, senza route server e senza toccare la promessa «niente cookie, niente analytics» del sito.

> **Stato: completata** (2026-11-15).

**Agenzie**: software (Backend per lo script, QA, Code Reviewer). Privacy e design non servono: il sito non cambia e lo script legge solo dati pubblici e aggregati di npm.

## Decisione dell'utente (2026-11-15)

Il piano iniziale (contatori di pagine viste in Postgres su Neon, route `POST /api/pageviews`, revisione privacy ed ePrivacy, testi del sito riscritti) è **rinviato**: con il traffico di un sito appena pubblicato le pagine viste dicono poco, costano un database e una revisione privacy, e fanno perdere «niente cookie, niente analytics». Il design rinviato resta nella storia di git (commit `bede00f`); si riprende solo se un obiettivo misurabile lo richiede.

## Design

- **Script** `npm run stats` (Node, `fetch` della libreria standard, nessuna dipendenza): legge dall'API pubblica di npm i download di `@agentrica/mcp` (`https://api.npmjs.org/downloads/range/<periodo>/@agentrica/mcp`) e stampa totale e andamento per settimana dell'ultimo periodo (predefinito: ultimi 3 mesi).
- **Opzionale**: stelle e fork del repository dall'API pubblica di GitHub, senza token.
- **Limiti** (`ponytail:`): i download npm contano anche CI, mirror e bot e non distinguono gli utenti; `npx -y` scarica a ogni versione nuova. È una tendenza, non un numero di persone. Passare a qualcosa di più preciso solo con un MCP remoto (F16).
- Il sito, la CSP, il footer e `/note-legali` restano come sono.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F11-01 | Script `npm run stats` con i download npm per settimana; calcolo in una funzione pura con test | P1 |
| F11-02 | Stelle e fork da GitHub nello stesso script | P3 |
| F11-03 | Prove: test unitario del calcolo, `npm run verify`, una lettura reale | P1 |

## Criteri di accettazione

- `npm run stats` stampa i download settimanali di `@agentrica/mcp` senza chiavi né variabili d'ambiente.
- Nessuna dipendenza nuova, nessun cambio al sito né all'MCP.
- `npm run verify` verde.

## Fatto

- **F11-01** `scripts/stats.ts` (`npm run stats`): download giornalieri di `@agentrica/mcp` dall'API pubblica di npm per gli ultimi 3 mesi fino a ieri, totale e righe per settimana (dal lunedì) con una barra. Se npm risponde 404 (pacchetto pubblicato da meno di un giorno o due) lo dice e non fallisce. Calcoli puri in `scripts/stats-lib.ts` (periodo, inizio settimana, somma, formato). Limiti dei conteggi nel commento `ponytail:`.
- **F11-02** Stelle e fork di `flgisimone/agentrica` dall'API pubblica di GitHub, senza token; se GitHub non risponde (limite di 60 richieste l'ora) lo script lo dice e i download restano.
- **F11-03** `scripts/stats-lib.test.ts` in `npm test`; `scripts/` nel typecheck della root (`tsconfig.json`).

## Verifiche

- `npm run verify`: superato (44 test unitari, 4 nuovi).
- `npm run stats` reale: npm non ha ancora dati per `@agentrica/mcp` (pubblicato oggi, risposta 404 gestita); GitHub 0 stelle, 0 fork.
- Formato provato con dati reali su una copia dello script puntata a `@modelcontextprotocol/sdk` (13 settimane, totale e barre corretti).
- `npm run verify:e2e`: 59 superati, 1 saltato (come in F10).
- **Non verificato**: la lettura dei download di `@agentrica/mcp` con dati veri, che arriveranno nei prossimi giorni.

## Rilievi aperti

- Nessuno. La prima settimana del periodo appare con il suo lunedì anche se parziale (voluto, scritto in `toWeekly`).
