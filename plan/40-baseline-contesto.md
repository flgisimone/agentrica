# F40 — Baseline del contesto e confini del Core

**Obiettivo**: sapere quanto testo restituisce Agentrica, componente per componente, prima di ridurlo. Mettere per scritto cosa fa il server senza un modello e cosa resta al client. La baseline è il «prima» con cui si confrontano F41 e F42.

> **Stato: completata il 2026-11-25.** Fase nata dall'analisi della roadmap consolidata (documento locale, non versionato) il 2026-11-25. Nella roadmap era «F37 — Baseline», rinumerata perché F37–F39 esistevano già.

**Agenzie (proposta)**: software (QA per le misure e i test, Backend per lo script, Code Reviewer). Nessuna funzione visibile e nessun dato personale: design e privacy non sono coinvolte.

## Situazione di partenza (verificata il 2026-11-25)

- `npm run agent-text -- <id> "<compito>"` stampa il testo che il server dà per un agente (`scripts/agent-text.ts`, `agentText` in `packages/mcp/src/prompt.ts`). Il testo è composto da intestazione, presentazione e gerarchia, consiglio del modello, regole comuni del reparto, ruolo, indice della biblioteca, compito, resoconto e valutazione.
- Misura a campione, con compito di una lettera: AISA-04 6,2 KB, AIPCA-05 6,8 KB, AIBPD-05 8,2 KB, AICA-03 8,7 KB, AIWDA-01 8,7 KB. Le regole comuni (`00-common-rules.md`) pesano da 3,5 a 5 KB, cioè il 55–60% del testo; un file di ruolo circa 0,6 KB.
- Esiste già una soglia: nessun agente supera i 10 KB (`prompt.test.ts`, F25).
- I casi di prova sono in `examples/casi/` (11), con il metodo e la soglia di qualità in `examples/README.md`; l'ultima ondata è quella del 2026-11-23. Il caso `orchestrazione-newsletter.md` copre il flusso di F34, con il direttore e poi gli specialisti.
- La distinzione fra dati «misurati» e «dichiarati» c'è già (F24 e F27). I token di sessione arrivano solo dai file di Claude Code (`usage.ts`).
- Il server non chiama modelli: è una decisione del piano (stdio locale, nessuna telemetria), ma oggi non esiste un testo unico che dica dove passa il confine fra il Core e il client.

## Decisioni dell'utente (2026-11-25)

- **Unità di misura**: byte misurati, token stimati come byte / 4, scritti accanto al numero.
- **Soglia di qualità** per F41: quella di F24 sullo stesso modello e configurazione prima e dopo (difetti di prima meno uno, nessun falso in più, formato dei rilievi).
- **Casi di confronto**: `orchestrazione-newsletter` più uno per reparto (`aibpd-05-requisiti-abbonamenti`, `aica-04-config-deploy`, `aipca-02-prenotazioni-palestra`, `aisa-09-api-fatture`, `aiwda-08-form-iscrizione`).
- **Confini del Core**: nelle decisioni di `plan/README.md` e in una sezione dei README del pacchetto (it, en). Backlog confermato com'era.

## Proposte (all'apertura)

- **Unità di misura**: i byte sono il dato esatto, i token una stima dichiarata (byte / 4, scritto accanto al numero). Un tokenizer esatto richiederebbe l'API di un provider con una chiave, contro il vincolo «nessun costo LLM».
- **Soglia di qualità** per le riduzioni di F41: riusare quella di F24 («difetti di Opus meno uno, nessun falso in più») sullo stesso modello, prima e dopo, oppure una tolleranza nuova.
- **Dove si scrivono i confini**: nelle decisioni di [README.md](README.md) e in una sezione dei README del pacchetto (it, en).

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F40-01 | `npm run agent-text -- --sizes`: byte per componente (intestazione e presentazione, regole comuni, ruolo, indice della biblioteca, compito, resoconto e valutazione) per tutti i 56 agenti, in italiano e in inglese; i componenti si ricavano dalla stessa funzione che compone il testo, non da una copia | P0 — senza misura non si sa cosa ridurre |
| F40-02 | Baseline in `examples/risultati/<data>-baseline-contesto.md`: tabella per agente e per reparto, più il totale del testo Agentrica nel flusso di `orchestrazione-newsletter` (direttore e specialisti) e la quota ripetuta fra un agente e l'altro | P0 |
| F40-03 | Misura degli altri testi che il server restituisce: istruzioni (entro 4096 caratteri), `list_agents` con e senza squadra, una scheda di `library` | P1 |
| F40-04 | Confini del Core: decisione nel piano e sezione nei README del pacchetto (it, en). Il server compone testi, stato e controlli senza chiamare modelli e senza chiavi; il ragionamento resta al client e al modello dell'utente; le integrazioni facoltative si ammettono solo senza costi né dipendenze obbligatorie | P0 |
| F40-05 | Dati di consumo: controllare che pannello e README dicano «non disponibile» per i client diversi da Claude Code, invece di stimarli | P1 |
| F40-06 | Soglia di qualità e casi di confronto per F41, decisi con l'utente | P0 |
| F40-07 | Test: la somma dei componenti di `--sizes` è uguale alla lunghezza del testo, per ogni agente e lingua | P1 |

## Criteri di accettazione

- La baseline si ripete con un comando e dà gli stessi numeri a parità di catalogo.
- Ogni numero dice la sua fonte: byte misurati, token stimati, dati del client.
- Nessuna misura richiede una chiave API o una chiamata a un modello.
- I confini fra Core e client sono scritti nel piano e nei README.
- `npm run verify` verde.

## Fatto

- **F40-01** `npm run -s agent-text -- --sizes [--date AAAA-MM-GG]` (`scripts/agent-text.ts`, `sizesReport` in `scripts/agent-text-lib.ts`): byte e token stimati per agente e componente, per tutti i 56 agenti in italiano e in inglese. I componenti (cornice, regole comuni, ruolo, biblioteca, compito, resoconto e valutazione) vengono da `agentParts` in `packages/mcp/src/prompt.ts`, che ora compone anche `agentText`; `agentSizes` attribuisce a ogni paragrafo il suo separatore. Il testo restituito non cambia (test di `prompt.test.ts` e `server.test.ts` invariati e verdi).
- **F40-02** Baseline in `examples/risultati/2026-11-25-baseline-contesto.md`: tabella per agente e per reparto, flusso di `orchestrazione-newsletter` (sequenza della prova di F34, `FLOW` in `agent-text-lib.ts`) con 47,7 KB in italiano, di cui 19,7 KB di regole comuni (54% del testo degli agenti) e 4,3 KB ripetuti (regole e biblioteca di AISA con AISA-06).
- **F40-03** Nella stessa baseline: istruzioni del server (2.625 caratteri su 4096 in italiano, con pannello e valutazioni; 1.838 senza), `list_agents` con tutto il catalogo (8,5 KB) e per reparto o squadra di un reparto (1,2–1,9 KB), schede di `library` per reparto (0,9–2,3 KB). Il testo di `list_agents` è passato da `server.ts` ad `agentList` in `prompt.ts`, così lo script misura la stessa funzione.
- **F40-04** Confini del Core: riga «Confini del Core (F40)» nelle Decisioni di `plan/README.md` e sezione «Cosa fa il server e cosa fa il modello» / «What the server does and what the model does» nei README del pacchetto.
- **F40-05** Pannello: con zero risposte lette mostra «il consumo si vede solo con Claude Code» (`noClaudeFiles`), senza stime. README: nella voce Consumo/Usage del pannello, «con un client diverso da Claude Code il consumo non è disponibile: il server non lo stima».
- **F40-06** Soglia e casi decisi con l'utente (sopra), riportati anche nella baseline.
- **F40-07** `prompt.test.ts`: la somma dei componenti è la lunghezza in byte del testo per ogni agente, nelle due lingue, con e senza compito, resoconto e valutazione. `scripts/agent-text-lib.test.ts`: quota ripetuta solo per AISA-06, stessi numeri a parità di data, token come byte / 4.

## Verifiche

- `npm run verify` (typecheck, lint, 179 test) verde.
- `npm run -s agent-text -- --sizes --date 2026-11-25` lanciato due volte con lo stesso risultato (anche nel test).
- Nessuna misura chiede una chiave o un modello. Nessuna modifica al sito, quindi niente `verify:e2e`; nessun cambio di versione del pacchetto (cambiano solo README e codice interno).

## Rilievi aperti

- P2 — `list_agents` con tutto il catalogo pesa 8,5 KB, più di ogni agente. La decisione «Roadmap consolidata» rinvia la selezione con metadati finché `list_agents` non supera una soglia misurata in F40: la soglia non è stata fissata. Da decidere con l'utente (all'apertura di F41 o in una fase a sé). Chiuso in F41: soglia fissata a 12 KB all'apertura di F41 e controllata da `prompt.test.ts` (decisione «Roadmap consolidata»); segnato in `fix/rilievi-prerilascio`.
- P3 — La sequenza del flusso è quella della prova di F34 (solo direttori più AISA-06): con più specialisti dello stesso reparto la quota ripetuta cresce di 4–5,7 KB per agente. Il confronto di F41 usa la stessa sequenza, così prima e dopo restano confrontabili.

## Fuori perimetro

Riduzione del testo (F41), nuovi provider, nuova dashboard, parallelismo, memoria.
