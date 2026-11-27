# F53 — Impara: percorso di studio sull'IA costruito su Agentrica

**Obiettivo**: un'area del sito con un percorso a lezioni che porta chi non sa nulla di IA fino agli agenti e a MCP, usando come esempio quello che è stato costruito in Agentrica. I contenuti stanno in questo repository, il sito li legge dal pacchetto e restano aggiornati a ogni fase.

> **Stato: da fare**. Registrata il 2026-11-27 con le decisioni sotto; si pianifica in una sessione dedicata dopo F52, partendo dal business (pubblico, obiettivo, criteri di successo), poi design (architettura dell'informazione, UX Writer). Backlog e criteri si confermano lì.

**Agenzie**: business (direttore, Product Manager, Customer Success per il primo utilizzo); web design (Information Architect, UX Writer, UI, Accessibility); software (Backend per il pacchetto, Frontend nel sito, QA, Code Reviewer).

## Situazione di partenza

- Il sito legge il catalogo da `@agentrica/mcp/catalog` a versione esatta; pacchetto e sito si rilasciano insieme, alla stessa versione.
- Il materiale per le lezioni c'è già: `plan/` (decisioni e fasi), `examples/` (misure dei modelli), `agents/` con la biblioteca, `docs/`, il codice del server MCP e del pannello.
- Il sito è in due lingue (`/it`, `/en`) e non usa numeri di agenti o reparti nei testi scritti a mano (decisione «Posizionamento nei testi»).

## Decisioni dell'utente (2026-11-27)

| Tema | Decisione |
|---|---|
| Fonte | Lezioni in Markdown in una cartella di questo repository, esportate dal pacchetto (`@agentrica/mcp/learn` o nome da decidere) come il catalogo; il sito le legge a versione esatta. Il pacchetto cresce di qualche decina di KB |
| Aggiornamento | Passo nuovo nella chiusura di fase (CONVENTIONS §13.7): si aggiorna la lezione toccata. Un controllo in `npm run verify` vuole per ogni fase completata una lezione collegata o la nota «nessun concetto nuovo» |
| Forma | Percorso a lezioni in ordine dall'ABC, ognuna con «come l'abbiamo fatto in Agentrica» e i link a fasi, file e codice; più un glossario |
| Lingue | Italiano e inglese, due testi equivalenti per lezione |
| Ordine | Dopo F52 |

## Proposte da confermare

- Percorso di partenza: cos'è un modello linguistico; prompt e istruzioni; contesto e token; dagli assistenti agli agenti; tool e MCP; orchestrazione e reparti; scelta del modello e misure (F24, F37, F49–F51); costi e consumo; sicurezza, privacy e fonti (biblioteca); come si lavora per fasi.
- Ogni lezione con: idea in parole semplici, esempio da Agentrica con link al repository, cosa provare, termini del glossario.
- Fatti sull'IA con fonte e data, come le schede della biblioteca; nessun risultato inventato (CONVENTIONS §1).
- Pagina `/impara` (`/en/learn`) e posto nell'header da decidere con il design (per esempio sotto «Come funziona»).

## Backlog

Da confermare alla pianificazione.

| ID | Attività | Priorità |
|---|---|---|
| F53-01 | Obiettivo, pubblico e criteri di successo (business) | P0 |
| F53-02 | Struttura del percorso, nomi e posto nel sito (design) | P0 |
| F53-03 | Formato delle lezioni, cartella ed export nel pacchetto, test | P0 |
| F53-04 | Prime lezioni in italiano e inglese, glossario | P1 |
| F53-05 | Pagine nel sito che leggono le lezioni dal pacchetto | P1 |
| F53-06 | Controllo in `npm run verify` sul collegamento fase–lezione e passo in CONVENTIONS §13.7 | P1 |

## Criteri di accettazione

- Le lezioni stanno in questo repository e il sito le mostra dal pacchetto a versione esatta, senza copie dei testi.
- Una persona senza basi di IA può seguire il percorso dalla prima lezione, senza termini non spiegati (ogni termine tecnico è nel glossario).
- Ogni lezione ha almeno un esempio da Agentrica con link al repository e testo equivalente in italiano e inglese.
- `npm run verify` fallisce se una fase completata non ha una lezione collegata né la nota «nessun concetto nuovo».
