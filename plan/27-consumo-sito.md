# F27 — Consumo di token sul sito

**Obiettivo**: i totali di token spesi e risparmiati da chi usa Agentrica, inviati in forma anonima e solo con la conferma dell'utente, si vedono sul sito accanto ai risultati misurati nelle prove di F24.

> **Stato: da aprire**. Nata all'apertura di F24 (2026-11-18), che si è divisa: qui le voci F24-12…F24-15 della proposta, con le decisioni dell'utente già prese in [24-modelli.md](24-modelli.md) («Misure», «Sito», «Frase sul sito»). Dipende dalla lettura dei token (F24-10) e dal pannello (F24-11).

**Agenzie**: privacy (GDPR, Data Governance, DPIA, Legal) per l'invio anonimo; cybersecurity (AppSec, Cloud Security) per l'endpoint; design (Dashboard e Data Visualization, UX Writer, Accessibility) per frase e grafici; software (Backend, Database, Frontend, QA, Code Reviewer).

## Proposte da confermare all'apertura

- **Invio dei totali**: un tool o un pulsante del pannello (come «Valuta») prepara l'anteprima dei totali dall'ultimo invio, e l'utente conferma. Si può proporre a fine sessione insieme alla valutazione; con `--no-ratings` o un flag apposito non si propone mai.

## Requisiti da definire all'apertura

- Privacy: voce di registro, base giuridica, bilanciamento e screening DPIA per i totali anonimi, come per le valutazioni in F20. Note legali e README aggiornati. Conservazione e aggregazione: sul sito solo somme, mai il singolo invio.
- Cybersecurity: l'endpoint ha validazione stretta, limiti di frequenza come quello delle valutazioni ed esclusione dalle somme degli invii fuori scala, senza cancellarli.
- Design: le stime hanno un'etichetta visibile che le distingue dalle misure; i totali sono «dichiarati dagli utenti».

## Backlog

Proposta da confermare all'apertura.

| ID | Attività | Priorità |
|---|---|---|
| F27-01 | Invio anonimo confermato dei totali (tool e pulsante del pannello, anteprima, flag per spegnerlo), con test | P1 |
| F27-02 | Endpoint e tabella dei totali nel sito, somme per agente, modello e mese, limiti di plausibilità; requisiti privacy e cyber | P1 |
| F27-03 | Sito: misure di consumo con la frase, i grafici e i risultati delle prove di F24; nascoste sotto una soglia di invii, come la reputazione | P1 |
| F27-04 | Note legali, README e e2e del sito per le misure | P1 |

## Criteri di accettazione

- Un invio parte solo dopo la conferma e contiene esattamente l'anteprima; con il flag spento non si propone.
- Il sito mostra la frase e i grafici solo sopra la soglia; i totali sono indicati come dichiarati dagli utenti e i risultati delle prove come misurati.
- `npm run verify` verde, e2e del sito verdi.
