# F42 — Validazione deterministica

**Obiettivo**: controllare senza un modello che i file prodotti dagli agenti abbiano la forma giusta, così un errore di formato si vede subito invece di sparire nel pannello: rilievi di audit, file di fase e passaggi di consegne. Il controllo verifica la struttura, non il contenuto, e non riscrive le risposte.

> **Stato: completata il 2026-11-25.** Fase nata dall'analisi della roadmap consolidata il 2026-11-25 (era «F42 — Validazione, governance e benchmark»). La parte sui benchmark è già in F40 e F41.

**Agenzie (proposta)**: software (Architect per gli schemi, Backend per il validatore, QA, Code Reviewer); design (UX Writer) solo se gli errori compaiono nel pannello.

## Situazione di partenza (da verificare all'apertura)

- Il formato di `plan/` e `audit/` è documentato nel README del pacchetto (F14, F35), e il pannello lo legge (`packages/mcp/src/panel.ts`). Va verificato cosa succede oggi a un file malformato: viene ignorato, segnalato o fa fallire la lettura.
- I rilievi di audit sono un JSON per agente in `audit/<audit_id>/`. Lo schema è nelle regole comuni dei reparti, non in un tipo del codice.
- `zod` è già una dipendenza a versione esatta di `packages/mcp`.
- Il formato dei passaggi di consegne nasce in F41-05.

## Decisioni dell'utente (2026-11-25)

- **Interfaccia**: comando e tool sullo stesso modulo (`check.ts`), con gli stessi errori nel pannello.
- **Contraddizioni**: tutte e tre, cioè stesso id con valori diversi, rilievo chiuso senza evidenza e fase completata con attività P0 senza esito.
- **Passaggi di consegne**: non sono file. Il tool `report` salva sempre il resoconto e avvisa il modello se mancano esito, rilievi o domande aperte; non rifiuta niente.
- **Formato del design** (`observations`): accettato dallo schema dei rilievi accanto a `rilievi` e `findings`; `agents/` invariato. Campi obbligatori: id, titolo e priorità; l'evidenza solo per i rilievi chiusi.

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

## Fatto

- **F42-01** `packages/mcp/src/check.ts`: schema zod del file di rilievi su chiavi ricondotte a una lingua (`agente`/`agent`, `rilievi`/`findings`/`observations`, `titolo`/`title`, `priorita`/`priority`, `stato`/`status`, `evidenza`/`evidence`). Per i file di fase e il passaggio di consegne niente zod: sono Markdown e testo, e i controlli sulle righe danno il numero di riga che uno schema perderebbe.
- **F42-02** Validatore: tabella «Fasi» (id, stato, id doppi, link a file `.md` dentro `plan/` che esistono), file di fase (titolo, `**Obiettivo**:`, backlog con id univoci e priorità P0–P3 dove l'intestazione ha «Priorità»), audit (JSON leggibile, campi obbligatori, id doppi nel file). Messaggi `file:riga: causa` in `texts/` (it, en). Tool `check` sempre presente, in sola lettura; comando `agentrica-mcp check [cartella]` (0 senza problemi, 1 con problemi, 2 con argomenti sbagliati); frase nelle istruzioni del server (2.945 caratteri su 4096). Sulla tabella di F32-05 il validatore ha trovato una `|` dentro il codice che spezzava la cella: corretta con `\|`, e `tableRows` non divide più sulle barre con l'escape.
- **F42-03** Contraddizioni con entrambe le posizioni, segnate a parte dagli errori: stesso id di rilievo in due file con titolo, priorità o stato diversi; rilievo chiuso senza evidenza; fase completata con attività P0 che non è in grassetto in «Fatto».
- **F42-04** Pannello: i problemi vengono da `checkProject` (`panel.ts`), quindi si vedono anche i file delle fasi chiuse; `project.ts` legge e salta senza più calcolarli, e legge i rilievi `observations`. Così si evita anche un import circolare fra `check.ts` e `project.ts`.
- **F42-05** Nessun passo nuovo nella CI: `project.test.ts` controlla che `checkProject` su questo repository dia un elenco vuoto, e `npm test` gira in CI su Linux e Windows. Le prove di `init` controllano lo stesso sui piani nuovi, in italiano e in inglese.
- **F42-06** `check.test.ts` (casi validi in italiano, inglese e nel formato del design; ogni errore del piano e dell'audit con file e riga; backlog senza colonna Priorità; le tre contraddizioni; passaggio di consegne; codici di uscita del comando), `server.test.ts` (tool nell'elenco, cartella illeggibile con il permission model, frase nelle istruzioni), `panel.test.ts` (`check` sul repository, `report` con e senza avviso). README (it, en) con la sezione «Controllo del formato», il tool e la riga in «Cosa resta sul computer»; `CHANGELOG` (it, en); versione 0.15.0 in `package.json`, `server.json` e `VERSION`.
- Decisioni nel piano: riga «Validazione (F42)».

## Verifiche

- `npm run verify` (typecheck, lint, 191 test) verde.
- `node packages/mcp/src/server.ts check` su questo repository: nessun problema di formato, codice 0.
- Revisione del diff (Code Reviewer, nella sessione): un import circolare fra `check.ts` e `project.ts` (risolto spostando la chiamata in `panel.ts`), un parametro superfluo di `runCheck` (tolto), un test di F35 che controllava una cartella già cancellata (corretto).
- Nessuna modifica al sito, quindi niente `verify:e2e`. Pannello non provato a mano nel browser: la casella dei problemi è quella di prima, e il contenuto lo controlla `panel.test.ts`.

## Rilievi aperti

- P2 — Con il permission model di Node senza lettura della cartella del progetto, `check` dice che non può leggerla. Se invece la cartella si apre ma non si legge `plan/README.md`, il piano vale come assente e il risultato è «nessun problema». Si riapre se qualcuno usa il permission model con letture parziali.
- P3 — Nel pannello le contraddizioni stanno nella stessa casella degli errori, distinte solo dal testo del messaggio. Si separano se un progetto reale ne mostra abbastanza da confondere.
- P3 — Per un JSON illeggibile manca la riga: Node 26 non la dice più nel messaggio di `JSON.parse`.

## Fuori perimetro

Valutazione semantica dei risultati, LLM come giudice, una seconda chiamata a un modello.
