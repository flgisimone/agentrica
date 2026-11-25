# F41 — Contesto compatto

**Obiettivo**: ridurre il testo che Agentrica restituisce in una sessione, senza togliere regole né peggiorare i risultati. La leva principale sono le regole comuni del reparto. Pesano più della metà del testo di ogni agente, e nel flusso di F34 (direttore, poi specialisti uno alla volta) si ripetono a ogni agente caricato.

> **Stato: da aprire, dopo F40.** Fase nata dall'analisi della roadmap consolidata il 2026-11-25 (era «F38 — Context Optimization»). Il meccanismo, cioè le regole comuni inviate una volta per sessione dal server senza cambiare `agents/`, è stato scelto dall'utente il 2026-11-25.

**Agenzie (proposta)**: software (Architect per il meccanismo e il caso dei subagent, Backend per server e testi, QA per le misure e i test, Code Reviewer). I file di `agents/` non cambiano.

## Situazione di partenza

- Il testo di un agente pesa da 6,2 a 8,7 KB, di cui da 3,5 a 5 KB di regole comuni (misura a campione del 2026-11-25; la baseline completa arriva da F40).
- `agentText` (`packages/mcp/src/prompt.ts`) mette sempre le regole del reparto. Il tool `agent` e i prompt lo chiamano a ogni uso.
- Un server stdio vive quanto la sessione del client, quindi può ricordare quali regole ha già inviato. Con `--subagents` (F34), però, lo stesso server risponde anche ai subagent, che hanno un contesto separato e non hanno visto le regole inviate alla sessione principale.
- Dopo un `/compact`, il client può perdere le regole che aveva ricevuto.

## Proposte da confermare

- **Come si riconosce chi ha già le regole.** Una possibilità è la memoria del server: il primo agente di un reparto riceve le regole intere, i successivi un riferimento di una riga. Un'altra è un parametro del tool `agent`, con cui il client dice di averle già. Una terza unisce le due: la memoria del server di predefinito, il parametro per forzare il testo intero.
- **Subagent**: con `--subagents` regole sempre intere, oppure riferimento anche lì con il parametro per chiederle.
- **Ripristino dopo `/compact`**: un parametro di `agent` che restituisce le regole intere, citato nelle istruzioni del server (entro 4096 caratteri).
- **Prompt MCP** (`aisa-04-software` ecc.): si invocano a mano, uno alla volta; proposta di lasciarli con il testo intero.
- **Passaggi di consegne fra agenti**: formato breve e strutturato (esito, rilievi con riferimento all'evidenza, domande aperte) al posto della risposta intera del precedente.
- **Versione del pacchetto** e rilascio insieme al sito, se il sito ne parla.

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F41-01 | Regole comuni una volta per sessione nel tool `agent`: intere al primo agente del reparto, poi un riferimento che dice che valgono le regole già ricevute | P0 — è la riduzione più grande |
| F41-02 | Parametro di `agent` per avere le regole intere (dopo `/compact` o in un contesto nuovo), con la frase nelle istruzioni del server (it, en) entro 4096 caratteri | P0 — senza, una sessione compressa resta senza regole |
| F41-03 | Comportamento con `--subagents` deciso all'apertura e coperto dai test: un subagent non resta mai senza regole | P0 |
| F41-04 | Indice della biblioteca più compatto, se la baseline di F40 lo giustifica, senza perdere la capacità del client di trovare le schede | P1 |
| F41-05 | Formato dei passaggi di consegne nel testo di orchestrazione di F34 (it, en): breve, strutturato, con riferimenti alle evidenze invece della risposta intera | P1 |
| F41-06 | Test di regressione: regole intere al primo agente, riferimento al secondo dello stesso reparto, intere per un reparto diverso e con il parametro; gemelli it/en; soglia dei 10 KB invariata; nessuna regola di sicurezza o limite di ruolo tolto | P0 |
| F41-07 | Confronto prima e dopo: byte con il comando di F40 su `orchestrazione-newsletter` e sui casi scelti in F40-06; qualità con la soglia di F40-06, stesso modello e stessa configurazione; risultato in `examples/risultati/` | P0 — non si dichiara un risparmio se la qualità peggiora |
| F41-08 | README del pacchetto (it, en), `CHANGELOG` e versione | P2 |

## Criteri di accettazione

- Nel flusso di `orchestrazione-newsletter` il testo restituito da Agentrica scende, misurato con lo stesso comando di F40, e la riduzione è riportata per componente.
- Nessun peggioramento oltre la soglia di F40-06 sui casi di confronto.
- Nessun agente, principale o subagent, lavora senza le regole del suo reparto; dopo `/compact` le regole si recuperano con una chiamata.
- Le versioni italiana e inglese restano equivalenti.
- `npm run verify` verde.

## Fuori perimetro

Riscrivere i file di `agents/` (scelta dell'utente del 2026-11-25), troncare un testo per stare sotto una soglia, sintesi che sostituiscono le evidenze.
