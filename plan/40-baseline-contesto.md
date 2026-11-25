# F40 — Baseline del contesto e confini del Core

**Obiettivo**: sapere quanto testo restituisce Agentrica, componente per componente, prima di ridurlo. Mettere per scritto cosa fa il server senza un modello e cosa resta al client. La baseline è il «prima» con cui si confrontano F41 e F42.

> **Stato: da aprire.** Fase nata dall'analisi della roadmap consolidata (documento locale, non versionato) il 2026-11-25. Nella roadmap era «F37 — Baseline», rinumerata perché F37–F39 esistevano già.

**Agenzie (proposta)**: software (QA per le misure e i test, Backend per lo script, Code Reviewer). Nessuna funzione visibile e nessun dato personale: design e privacy non sono coinvolte.

## Situazione di partenza (verificata il 2026-11-25)

- `npm run agent-text -- <id> "<compito>"` stampa il testo che il server dà per un agente (`scripts/agent-text.ts`, `agentText` in `packages/mcp/src/prompt.ts`). Il testo è composto da intestazione, presentazione e gerarchia, consiglio del modello, regole comuni del reparto, ruolo, indice della biblioteca, compito, resoconto e valutazione.
- Misura a campione, con compito di una lettera: AISA-04 6,2 KB, AIPCA-05 6,8 KB, AIBPD-05 8,2 KB, AICA-03 8,7 KB, AIWDA-01 8,7 KB. Le regole comuni (`00-common-rules.md`) pesano da 3,5 a 5 KB, cioè il 55–60% del testo; un file di ruolo circa 0,6 KB.
- Esiste già una soglia: nessun agente supera i 10 KB (`prompt.test.ts`, F25).
- I casi di prova sono in `examples/casi/` (11), con il metodo e la soglia di qualità in `examples/README.md`; l'ultima ondata è quella del 2026-11-23. Il caso `orchestrazione-newsletter.md` copre il flusso di F34, con il direttore e poi gli specialisti.
- La distinzione fra dati «misurati» e «dichiarati» c'è già (F24 e F27). I token di sessione arrivano solo dai file di Claude Code (`usage.ts`).
- Il server non chiama modelli: è una decisione del piano (stdio locale, nessuna telemetria), ma oggi non esiste un testo unico che dica dove passa il confine fra il Core e il client.

## Proposte da confermare

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

## Fuori perimetro

Riduzione del testo (F41), nuovi provider, nuova dashboard, parallelismo, memoria.
