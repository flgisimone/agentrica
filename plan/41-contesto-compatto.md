# F41 — Contesto compatto

**Obiettivo**: ridurre il testo che Agentrica restituisce in una sessione, senza togliere regole né peggiorare i risultati. La leva principale sono le regole comuni del reparto. Pesano più della metà del testo di ogni agente, e nel flusso di F34 (direttore, poi specialisti uno alla volta) si ripetono a ogni agente caricato.

> **Stato: completata il 2026-11-25** (la prova a mano del flusso resta all'utente, rilievo aperto). Fase nata dall'analisi della roadmap consolidata il 2026-11-25 (era «F38 — Context Optimization»). Il meccanismo, cioè le regole comuni inviate una volta per sessione dal server senza cambiare `agents/`, è stato scelto dall'utente il 2026-11-25.

**Agenzie (proposta)**: software (Architect per il meccanismo e il caso dei subagent, Backend per server e testi, QA per le misure e i test, Code Reviewer). I file di `agents/` non cambiano.

## Situazione di partenza

- Il testo di un agente pesa da 6,2 a 8,7 KB, di cui da 3,5 a 5 KB di regole comuni (misura a campione del 2026-11-25; la baseline completa arriva da F40).
- `agentText` (`packages/mcp/src/prompt.ts`) mette sempre le regole del reparto. Il tool `agent` e i prompt lo chiamano a ogni uso.
- Un server stdio vive quanto la sessione del client, quindi può ricordare quali regole ha già inviato. Con `--subagents` (F34), però, lo stesso server risponde anche ai subagent, che hanno un contesto separato e non hanno visto le regole inviate alla sessione principale.
- Dopo un `/compact`, il client può perdere le regole che aveva ricevuto.

## Decisioni dell'utente (2026-11-25)

- **Chi ha già le regole**: memoria del server più un parametro. Il primo agente di un reparto riceve regole comuni e indice interi, i successivi un riferimento che dice come riaverli; `full_rules` del tool `agent` li forza interi, citato nelle istruzioni del server.
- **Subagent**: sempre interi. Il primo passo scritto da `init --subagents` chiama `agent` con `full_rules` true; per i progetti già creati il riferimento dice di richiamare `agent` con `full_rules` se le regole mancano.
- **Biblioteca**: l'indice una volta per reparto, come le regole; ai successivi la riga con le schede del ruolo.
- **Soglia di `list_agents`** (rilievo P2 di F40): 12 KB con tutto il catalogo; oltre si riapre la selezione con metadati e ricerca. Controllata da un test.
- **Confronto di qualità**: i 5 casi di F40-06, due esecuzioni ciascuno, con lo specialista dopo il direttore del reparto (testo intero del direttore, poi quello compatto dello specialista), con il modello della misura di F24.
- **Flusso `orchestrazione-newsletter`**: prova a mano dell'utente, con i passi preparati nella fase.
- Senza domanda, come da proposta: prompt MCP interi, passaggi di consegne brevi, versione 0.14.0.

## Proposte (all'apertura)

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

## Fatto

- **F41-01** `agentParts` (`packages/mcp/src/prompt.ts`) ha l'opzione `known`: al posto delle regole comuni il riferimento `rulesKnown` (reparto, come riaverle). Il server (`server.ts`, `agentOptions`) ricorda i reparti inviati nella sessione (`rulesSent`): il primo agente li riceve interi, i successivi il riferimento. I prompt sono sempre interi e segnano il reparto come inviato.
- **F41-02** Parametro `full_rules` del tool `agent`; istruzioni del server (it, en) con la frase «dopo /compact o /clear… richiama agent con full_rules true»: 2.869 caratteri su 4096. `/clear` è esplicito perché in Claude Code apre una conversazione nuova con lo stesso server (rilievo della revisione del diff).
- **F41-03** `subagentFirst` (init, it e en): il primo passo dei subagent chiama `agent` con `full_rules` true; il riferimento dice di richiamarlo se le regole mancano, per i progetti già creati. README: come rigenerare i subagent (`init --existing --subagents` dopo aver tolto `.claude/agents/`).
- **F41-04** `libraryKnown`: ai successivi solo le schede del ruolo e come leggerle, al posto dell'indice.
- **F41-05** Passaggi di consegne brevi (esito, rilievi con l'evidenza, domande aperte) nelle istruzioni del server, nei testi del direttore e dello specialista e in `starter/AGENTS.md` (it, en).
- **F41-06** Test: `prompt.test.ts` (riferimento al posto di regole e indice per tutti i 56 agenti nelle due lingue, cornice, ruolo, compito e chiusura identici, sezioni del ruolo intere, schede del ruolo nominate, somma dei componenti anche con `known`, `list_agents` entro 12 KB); `server.test.ts` (intere al primo, riferimento al secondo dello stesso reparto, intere con `full_rules`, per un altro reparto e nei prompt; parametro nello schema; frase nelle istruzioni); `init.test.ts` (`full_rules` nel primo passo dei subagent); `agent-text-lib.test.ts` (flusso: riferimento solo per AISA-06). Soglia dei 10 KB invariata.
- **F41-07** `examples/risultati/2026-11-25-contesto-compatto.md`: flusso da 47.676 a 44.395 byte (−6,9%), AISA-06 da 6.301 a 2.604; uno specialista in più di un reparto già caricato dal 54 al 59% in meno. Qualità: 5 casi × 2, specialista dopo il direttore con il testo compatto (`agent-text --after`), stesso modello di F24: tutti i difetti trovati, nessun falso in più, formato rispettato. Rapporti in `2026-11-25-contesto-compatto/`.
- **F41-08** README del pacchetto (it, en): sezione «Regole comuni una volta per reparto», parametro nella tabella dei tool, passaggi di consegne; `CHANGELOG` (it, en) e versione 0.14.0.
- Decisioni nel piano: riga «Contesto compatto (F41)» e soglia di `list_agents` nella «Roadmap consolidata».

## Verifiche

- `npm run verify` (typecheck, lint, 182 test) verde.
- `npm run -s agent-text -- --sizes --date 2026-11-25` ripetibile (test).
- Revisione del diff (Code Reviewer, nella sessione): un rilievo, `/clear` non nominato nel riferimento e nelle istruzioni, corretto.
- Nessuna modifica al sito, quindi niente `verify:e2e`. `agents/` invariato.

## Rilievi aperti

- P1 — Prova a mano del flusso `orchestrazione-newsletter` (C1–C7 più C8 riferimento al secondo agente del reparto e C9 `full_rules` dopo `/compact`), passi in `examples/risultati/2026-11-25-contesto-compatto.md`. Va fatta prima del rilascio della 0.14.0. Chiuso in F43-01 (2026-11-25): prova fatta, esito in `examples/risultati/2026-11-25-contesto-compatto.md`; segnato in `fix/rilievi-prerilascio`.
- P2 — Il risparmio dipende dal modello che richiama `agent` con `full_rules` dopo `/clear` o `/compact`: la memoria del server non vede la conversazione. Se la prova a mano mostra un agente senza regole, si valuta di azzerare la memoria dopo un periodo senza chiamate o di tornare alle regole intere di predefinito. Chiuso con l'evidenza di F43-02 (C9 e la prova dopo `/clear`: il modello richiama `full_rules`), segnato in F48-01.
- P3 — Il confronto di qualità usa come «prima» la misura di F24 (0.6.0, schede di allora): dice che il testo compatto non peggiora, non lo isola da tutti gli altri cambiamenti. Chiuso come accettato (2026-11-26, scelta dell'utente): il limite è scritto nel resoconto di F41; si riapre se serve isolare l'effetto del testo compatto, con una misura a parità di schede e versione.

## Fuori perimetro

Riscrivere i file di `agents/` (scelta dell'utente del 2026-11-25), troncare un testo per stare sotto una soglia, sintesi che sostituiscono le evidenze.
