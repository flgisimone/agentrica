# F45 — Misura prima di Code Mode

**Obiettivo**: capire dai dati se Code Mode serve, cioè se un client orchestra i tool di Agentrica in modo programmatico, fuori dal contesto del modello. Si misurano, sulle sessioni reali, le catene di chiamate ai tool di Agentrica e i byte dei risultati che il modello riceve ma non usa. Si decide su Code Mode solo con questi numeri.

> **Stato: completata il 2026-11-25.** Soglia, esito e regole di conteggio confermati dall'utente. Fase nata il 2026-11-25 dalla proposta «Code Mode Architecture & Implementation Plan» (documento esterno, non versionato), che prevedeva un Core con registry e dispatcher, un pacchetto `@agentrica/openai` (Responses API) e un tool `run_workflow` con runtime JavaScript isolato. L'utente ha scelto di misurare prima di progettare.

**Agenzie (proposta)**: software (QA per le misure e i test, Backend per lo script, Code Reviewer). Nessuna funzione visibile e nessun dato personale nel risultato: design e privacy non sono coinvolte. Lo script legge però i file di sessione di Claude Code dell'utente, quindi nel resoconto vanno solo conteggi e byte, mai testi di sessione.

## Situazione di partenza (verificata il 2026-11-25)

- Tool del server (`packages/mcp/src/server.ts`): `list_agents`, `agent`, `library` e `check` in sola lettura; `report`, `open_panel` e `ask_user` con il pannello; `rate_agent`, `share_usage` e `submit_project` inviano solo dopo l'anteprima e il codice di conferma.
- I tool più usati restituiscono istruzioni che il modello deve leggere: sono il prodotto, non dati intermedi da filtrare. Baseline di F40: un agente pesa da 6 a 9 KB, `list_agents` con tutto il catalogo 8,5 KB, una scheda di `library` da 0,9 a 2,3 KB.
- `usage.ts` legge già i file di sessione di Claude Code per i token. Gli stessi file contengono le chiamate ai tool (`tool_use`) e i risultati (`tool_result`).
- La decisione «Confini del Core (F40)» dice che il server non chiama modelli e non usa chiavi API. Un pacchetto OpenAI che si collega alla Responses API la contraddice. La Responses API, inoltre, usa server MCP remoti (URL), mentre Agentrica è un server stdio locale.

## Decisioni dell'utente (2026-11-25)

- **Soglia** confermata com'è proposta sotto: catene di almeno 4 chiamate in più del 20% delle sessioni, oppure risultati intermedi oltre il 30% dei byte di Agentrica per sessione.
- **Esito sulla proposta esterna** confermato com'è proposto sotto. Va nelle decisioni di `plan/README.md` con F45-04.
- **Cosa conta come intermedio** (dopo la prima lettura di F45-01): i testi di `agent` (e del vecchio `agente`) e le schede di `library` sono istruzioni che il modello deve leggere, non dati da filtrare, quindi non contano fra i byte intermedi.
- **Cosa conta nella lunghezza di una catena**: solo le chiamate che un programma potrebbe fare da solo, cioè senza istruzioni e senza `ask_user`, che aspetta l'utente. La distribuzione delle lunghezze nel resoconto resta su tutte le chiamate.

## Proposte (all'apertura)

- **Fonte**: i file di sessione di Claude Code, gli stessi di `usage.ts`, limitati ai progetti scelti dall'utente. Nessun altro client: per gli altri il dato è «non disponibile», come per il consumo.
- **Cosa si conta**, per sessione: le chiamate ai tool di Agentrica in ordine; le catene, cioè le chiamate consecutive senza un messaggio dell'utente nel mezzo; i byte di ogni risultato; i risultati seguiti da un'altra chiamata di Agentrica nella stessa catena. Questi ultimi sono il limite superiore di ciò che Code Mode potrebbe togliere dal contesto.
- **Soglia per riaprire Code Mode**: da decidere con l'utente sui numeri. Una proposta: catene di almeno 4 chiamate in più del 20% delle sessioni, oppure risultati intermedi oltre il 30% dei byte di Agentrica per sessione.
- **Esito sulla proposta esterna**, da riportare nelle decisioni del piano: pacchetto OpenAI escluso finché vale «Confini del Core (F40)»; `run_workflow` e la sandbox rinviati con la soglia sopra; registry e dispatcher generici non si fanno senza un secondo modo di esecuzione confermato.

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F45-01 | Script `npm run tool-chains` che legge i file di sessione di Claude Code e conta le chiamate ai tool di Agentrica per sessione, le catene e i byte dei risultati, riusando la lettura dei file di `usage.ts` | P0 — senza misura non si decide |
| F45-02 | Resoconto in `examples/risultati/<data>-catene-tool.md`: distribuzione della lunghezza delle catene, byte per tool, quota di byte intermedi. Solo conteggi e byte, nessun testo di sessione | P0 |
| F45-03 | Test dello script su sessioni di esempio costruite a mano (nessuna sessione reale nel repository) | P1 |
| F45-04 | Decisione sulla soglia e sull'esito di Code Mode con l'utente, poi riga nelle decisioni di `plan/README.md` | P0 |

## Criteri di accettazione

- La misura si ripete con un comando e dà gli stessi numeri sugli stessi file.
- Nessuna misura richiede una chiave API o una chiamata a un modello.
- Il resoconto non contiene testo delle sessioni né percorsi personali.
- `npm run verify` verde.

## Fatto

- **F45-01** `npm run -s tool-chains -- [<cartella progetto> ...] [--all] [--date AAAA-MM-GG]` (`scripts/tool-chains.ts`, logica in `scripts/tool-chains-lib.ts`): legge i file di sessione di Claude Code (elenco dei file da `sessionFiles` in `packages/mcp/src/usage.ts`, estratto da `readUsage` senza cambiarne il comportamento) e stampa in Markdown catene, lunghezze, byte per tool con la quota intermedia, chiamante (`caller`) ed esito rispetto alla soglia. Il server si riconosce dal nome che contiene «agentrica» (`ponytail:`), così si contano anche i vecchi nomi dei tool (`agente`, `elenca_agenti`). Di ogni riga si tengono solo nome del tool, chiamante e byte del risultato. Test in `scripts/tool-chains-lib.test.ts` con righe costruite a mano.
- Lettura con `--all` (28 progetti, 2026-11-25), con le regole decise sopra: 24 sessioni con chiamate ad Agentrica, 177 chiamate, 535,6 KB di risultati. Catene di 4+ chiamate programmabili in 4 sessioni su 24 (16,7%, soglia 20%); quota intermedia mediana per sessione 4,4% (soglia 30%); intermedi in tutto 79,7 KB (14,9%), quasi tutti di `list_agents` (74,7 KB). **Soglia non superata.** Tutte le 177 chiamate hanno `caller` `direct`. Con la regola di partenza la soglia risultava superata (37,5% e 61,3%), ma per i testi di `agent` e `library` (367 KB dei 455 KB intermedi) e per catene fatte di `agent`, `ask_user` e `report`, cioè il flusso di orchestrazione.
- **F45-02** Resoconto in `examples/risultati/2026-11-25-catene-tool.md`, prodotto con `npm run -s tool-chains -- --all --date 2026-11-25`: solo conteggi e byte, senza nomi di progetti, id di sessione o testi.
- **F45-03** `scripts/tool-chains-lib.test.ts`, 8 test su righe costruite a mano: riconoscimento del server, confini delle catene (messaggi dell'utente sì; `isMeta`, riassunti e altri tool no), byte UTF-8 dei risultati, esclusione di istruzioni e `ask_user`, soglia, nessun input dei tool nel resoconto.
- **F45-04** Riga «Code Mode (F45)» nelle Decisioni di `plan/README.md`, con la soglia e il comando per riaprire la questione.

## Verifiche

- `npm run verify` (typecheck, lint, 202 test) verde.
- `npm run -s tool-chains -- --all --date 2026-11-25` lanciato più volte con lo stesso resoconto.
- Nessuna chiave API né chiamata a un modello. Nessuna modifica al sito né al comportamento del pacchetto (`sessionFiles` è estratta da `readUsage`, test di `usage.test.ts` invariati e verdi), quindi niente `verify:e2e` e nessun cambio di versione.

## Rilievi aperti

- P2 — `list_agents` è quasi tutta la quota intermedia (74,7 KB su 79,7 KB, 5,8 KB in media per chiamata). È il tema della «selezione con metadati» rinviata in «Roadmap consolidata» (si riapre oltre 12 KB con tutto il catalogo): la misura per chiamata resta sotto, ma conviene guardarla all'apertura di una fase sul catalogo.
- P3 — Lo script riconosce Agentrica dal nome del server che contiene «agentrica» (`ponytail:` in `agentricaTool`); con un altro nome le chiamate non si contano. I dati vengono solo da Claude Code. Chiuso in F48-04: opzione `--server <nome>` per un server registrato con un altro nome.
- P3 — La misura copre 24 sessioni: va ripetuta quando l'uso cresce, con lo stesso comando, prima di riaprire Code Mode. Ripetuta in F48-04 il 2026-11-26: 29 sessioni, le 5 nuove sono le prove di C5 di F48, quindi nessun uso reale in più; soglia non superata (13,8% e 8,8%). Resta da ripetere quando l'uso cresce. Chiuso come doppione: la voce aperta è quella di F48.
