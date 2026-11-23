# F37 — Misura dei modelli, prima ondata

**Obiettivo**: chiudere una parte del rilievo aperto di F24 sui 50 ruoli non misurati. Quattordici specialisti di cybersecurity, privacy e software, simili a quelli che in F24 sono passati su Sonnet, si provano con lo stesso metodo e la stessa soglia. Un ruolo riceve un modello più piccolo solo dove la qualità regge.

> **Stato: in pianificazione** (aperta il 2026-11-23). Perimetro, configurazioni, casi e trattamento dei direttori decisi con l'utente il 2026-11-23; backlog confermato lo stesso giorno. La pianificazione si ferma al backlog: le esecuzioni partono in una sessione nuova.

**Agenzie**: software (QA per casi e conteggi, Backend per catalogo e subagent, Code Reviewer); cybersecurity, privacy e software come **oggetto** della misura, non come revisori. Business e design non sono coinvolti.

## Situazione di partenza

- Misurati in F24 e F30: AIBPD-05, AICA-04, AIPCA-02 e AISA-09 su Sonnet, AISA-08 su Haiku, AIWDA-08 rimasto `inherit`. Gli altri 50 sono `inherit` ([24-modelli.md](24-modelli.md), rilievo aperto P2).
- Metodo, soglia e regole di conteggio sono in [`examples/README.md`](../examples/README.md) («Confronto di modelli»): testo dell'agente da `npm run agent-text`, un subagent per esecuzione su una copia del progetto, gruppi di al più 7, token dai file dei subagent per `requestId`, valutatore unico.
- Costo osservato in F24, per esecuzione: Opus medio 202k token ($0,42 equivalenti), Sonnet 245k ($0,20), Haiku 330k ($0,02).

## Decisioni dell'utente (2026-11-23)

| Tema | Decisione |
|---|---|
| Perimetro | Prima ondata di 14 ruoli. Cyber: AICA-03 AppSec, 05 Network, 06 IAM, 07 SOC, 09 Vulnerability Management. Privacy: AIPCA-05 Privacy Security, 06 Data Governance, 07 Vendor, 08 Data Subject Rights. Software: AISA-04 Backend, 05 Frontend, 07 Database, 10 DevOps, 11 Performance. Design e business in un'ondata successiva |
| Configurazioni | Opus 5.5 effort medio (riferimento) e Sonnet 5.5, due esecuzioni ciascuna; Haiku solo per AICA-09, che ha un risultato meccanico (triage delle vulnerabilità). In tutto 58 esecuzioni, circa 14M token |
| Casi | Un progetto realistico per reparto (AICA, AIPCA, AISA), con difetti sottili piantati e assegnati a ciascun ruolo, più trappole e accettabili; ogni ruolo lavora sulla sua parte con un compito suo |
| Direttori e ruoli di giudizio | Restano `inherit` senza misura: i cinque direttori, Architect, Security Architect, Code Reviewer, DPIA e Pentest. Un errore costa caro e un modello più piccolo non porta abbastanza risparmio |

## Backlog

Confermato all'apertura (2026-11-23).

| ID | Attività | Priorità |
|---|---|---|
| F37-01 | Tre progetti in `examples/progetti/` (uno per AICA, AIPCA, AISA), realistici, con difetti sottili per ciascuno dei 14 ruoli, trappole e accettabili | P0 |
| F37-02 | Schede in `examples/casi/`, una per progetto: compito per ruolo, difetti attesi per ruolo, trappole, accettabili e regole di conteggio | P0 |
| F37-03 | Esecuzioni Opus medio: 14 ruoli × 2, in gruppi di al più 7, rapporti salvati in `examples/risultati/<data>-ondata-1/` | P0 |
| F37-04 | Esecuzioni Sonnet: 14 ruoli × 2, più Haiku su AICA-09 × 2, nello stesso formato | P0 |
| F37-05 | Conteggio del valutatore unico e risultato in `examples/risultati/<data>-ondata-1.md`, con token sul compito finito per configurazione | P0 |
| F37-06 | Tabella dei modelli per i 14 ruoli, decisa con l'utente dai risultati | P0 |
| F37-07 | `models` in `packages/catalog/src/departments.ts` e `model:` nei subagent di `.claude/agents/`, con i test esistenti di confronto | P1 |
| F37-08 | Proposte di modifica ai file di ruolo dai mancati e dai falsi, da confermare prima di cambiare `agents/` | P2 |
| F37-09 | README del pacchetto (modelli consigliati) e voce del `CHANGELOG` per il rilascio | P2 |
| F37-10 | Decisione sui direttori e sui ruoli di giudizio scritta nelle decisioni di [README.md](README.md); rilievo di F24 aggiornato con i ruoli che restano (design e business) | P3 |

## Criteri di accettazione

- Ogni modello diverso da `inherit` assegnato in F37 ha un risultato in `examples/risultati/` che supera la soglia di F24: almeno i difetti di Opus meno uno, nessun falso in più, formato dei rilievi rispettato.
- Token sul compito finito riportati per ogni configurazione, dai file di Claude Code, senza stime presentate come misure.
- Catalogo, testo dell'agente, `list_agents` e subagent mostrano lo stesso modello.
- `npm run verify` verde.
