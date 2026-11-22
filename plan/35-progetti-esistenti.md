# F35 — Progetti esistenti e sessioni per fase

**Obiettivo**: Agentrica funziona anche in un progetto già avviato. Il piano si crea senza ricominciare da `init` e il pannello lo legge. Il lavoro segue sempre il ritmo previsto: in una sessione si pianifica (fasi e backlog), poi `/clear`, poi una fase per sessione, chiusa con la proposta di `/clear`. Nasce da due segnalazioni dell'utente del 2026-11-22 (0.10.0, progetto beaflow installato con `add`).

> **Stato: da fare.**

**Agenzie**: software (Architect per il formato del piano e `init --existing`; Backend per `init`, `project.ts` e istruzioni del server; Frontend per il messaggio del pannello; QA, Code Reviewer); design (UX Writer per istruzioni, messaggio del pannello e testi dello starter).

## Situazione di partenza

Verifica del 2026-11-22 sul codice della 0.10.0:

- **Il pannello vuole `plan/README.md`.** Lo legge `readPhases()` in `packages/mcp/src/project.ts`; se manca, mostra `project.noPlan` («Non trovo plan/README.md… creato da `agentrica-mcp init`»). In un progetto installato con `add` `plan/` non c'è, e `init` non si può usare: si ferma se anche un solo file esiste già.
- **La regola delle sessioni sta solo nello starter.** «Una sessione per fase» (`starter/AGENTS.md`, «Efficienza») e la proposta di `/clear` alla chiusura (`starter/CONVENTIONS.md` §13.7, passo 8) non compaiono nelle istruzioni del server (`texts/it.ts` ed `en.ts`, `server.instructions`). Un progetto installato con `add` non le riceve.
- **Pianificare e sviluppare non sono separati.** Nessun testo dice che la sessione in cui si creano le fasi si ferma al backlog. Così, quando l'utente chiede le fasi, Claude le scrive e poi comincia anche a svilupparle.

## Decisioni prese (2026-11-22)

- **Progetti esistenti: `init --existing` e istruzioni del server.** `init --existing` scrive solo i file dello starter che mancano, salta quelli presenti senza errore, non fa commit e dice cosa ha saltato. Per un progetto avviato non copia la F0 «base tecnica»: il `plan/README.md` parte senza fasi. Le istruzioni del server descrivono il formato di `plan/`. Se il piano manca, Claude propone di crearlo leggendo il codice esistente.
- **Regola delle sessioni nel server e nello starter.** Nelle istruzioni del server (it/en) e in `AGENTS.md`, `plan/README.md` e `CONVENTIONS.md` dello starter (it/en): quando si chiede di pianificare, si scrivono solo le fasi con backlog e criteri, si fa confermare all'utente e ci si ferma con la proposta di `/clear`. Ogni fase si apre in una sessione nuova, una sola fase per sessione, e alla chiusura si propone `/clear`.
- **Lavoro in una fase**, non su `fix/`.

## Proposte da confermare

- Testo del messaggio del pannello quando manca il piano: un'informazione con le due strade (`init --existing` oppure chiedere a Claude di creare il piano), non un errore.
- Cosa fa `init --existing` con un `AGENTS.md` o un `CLAUDE.md` già presenti: li salta e lo segnala, oppure aggiunge in fondo un blocco con le regole di Agentrica.

## Backlog

| # | Attività | Priorità |
|---|---|---|
| F35-01 | `init --existing`: scrive solo i file mancanti, salta quelli presenti (elenco nell'output), niente commit, niente F0 «base tecnica» (riga «Fasi» vuota con l'indicazione di crearle); `.mcp.json` solo se manca. Test in `init.test.ts` | P1 |
| F35-02 | Istruzioni del server (it/en): formato di `plan/` (tabella «Fasi», file di fase con obiettivo, backlog, criteri) e proposta di crearlo se manca; regola delle sessioni (la pianificazione si ferma al backlog e propone `/clear`; una fase per sessione; alla chiusura `/clear`). Test sulle istruzioni | P1 |
| F35-03 | Starter (it/en): regola delle sessioni in `AGENTS.md` («Efficienza»), `plan/README.md` («Come si lavora a una fase») e `CONVENTIONS.md` (apertura e §13.7) | P1 |
| F35-04 | Pannello: messaggio informativo quando manca `plan/README.md`, con `init --existing` e la frase da chiedere a Claude; testi it/en (UX Writer) | P2 |
| F35-05 | README del pacchetto (it/en) e pagina `/installa` del sito: progetti già avviati con `add` e `init --existing`; voce nel `CHANGELOG` | P2 |
| F35-06 | Prova in un progetto già avviato (una copia senza dati reali): `add`, `init --existing`, pannello senza errori; richiesta «crea le fasi» che si ferma al backlog e propone `/clear`; apertura di una fase in una sessione nuova. Esito nel piano | P1 |

## Criteri di accettazione

- In un progetto con file già presenti `init --existing` termina con codice 0, non sovrascrive nulla e dice cosa ha saltato.
- Il pannello in un progetto senza `plan/` mostra un'informazione con le strade per creare il piano, non un errore.
- Dopo una richiesta di pianificazione Claude scrive solo `plan/` e propone `/clear`, senza modificare il codice.
- Alla chiusura di una fase Claude propone `/clear`.
- `npm run verify` passa.

## Fatto

## Verifiche

## Rilievi aperti
