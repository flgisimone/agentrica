# F49 — Misura dei modelli, seconda ondata: business

**Obiettivo**: continuare il rilievo P2 di F37 sui ruoli non misurati, a ondate piccole, una per reparto. Questa ondata misura dieci specialisti di business con lo stesso metodo e la stessa soglia di F24 e F37. Un ruolo passa a un modello più piccolo solo dove la qualità regge.

> **Stato: in corso** (2026-11-26). Perimetro, ondate, configurazioni, casi e auditor decisi con l'utente il 2026-11-26; backlog e proposte confermati lo stesso giorno.

**Agenzie**: software (QA per casi e conteggi, Backend per catalogo e subagent, Code Reviewer). Business è l'**oggetto** della misura, non un revisore. Le altre agenzie non sono coinvolte.

## Situazione di partenza

- Misurati: 22 ruoli (F24, F30, F37); in business solo AIBPD-05 su Sonnet ([37-misura-modelli.md](37-misura-modelli.md), rilievo aperto P2).
- Metodo, soglia e regole di conteggio in [`examples/README.md`](../examples/README.md) («Confronto di modelli»): testo da `npm run agent-text`, schede con `--cards`, un subagent per esecuzione su una copia nuova, copie senza il modello nel nome, gruppi di al più 7, token dai file dei subagent per `requestId`, un valutatore per ruolo con rapporti anonimi.
- Costo osservato in F37 sul compito finito: Sonnet −58% del costo equivalente e −15% di token rispetto a Opus medio.

## Decisioni dell'utente (2026-11-26)

| Tema | Decisione |
|---|---|
| Ondate | I 26 ruoli che restano si misurano a ondate piccole, una per reparto: business (F49), poi design (8 ruoli: AIWDA-02–07, 09, 10), poi cyber, privacy e software (8 ruoli: AICA-06, 08, 12, AIPCA-03, 09, AISA-03, 04, 06) |
| Perimetro F49 | Dieci ruoli: AIBPD-02 Market Research, 03 Product Innovation, 04 Product Manager, 06 Financial, 07 Growth & Monetization, 08 Product Marketing, 09 Sales & Revenue, 10 Business Development, 11 Customer Success, 12 Portfolio & Roadmap. AIBPD-01 resta `inherit` senza misura come gli altri direttori |
| Auditor | AICA-10 e AIPCA-10 restano `inherit` senza misura, come i ruoli di giudizio: un errore dell'auditor chiude un rilievo che non è risolto |
| Configurazioni | Opus 5.5 effort medio (riferimento) e Sonnet 5.5, due esecuzioni ciascuna: 40 esecuzioni, circa 10M token. Haiku solo per un ruolo con un risultato meccanico, se la scheda lo indica |
| Casi | Un progetto realistico nuovo per il reparto, come in F37, con difetti sottili per ciascun ruolo, trappole e accettabili |

## Proposte all'apertura (2026-11-26)

| Proposta | Esito |
|---|---|
| Un solo prodotto con tutti i documenti di business (sintesi di mercato con fonti e date, concorrenti, business case con i numeri, prezzi e imbuto, posizionamento e messaggi, pipeline commerciale, accordi con i partner, dati di fidelizzazione, roadmap e portafoglio, PRD); ogni ruolo ha la sua parte, con prove sparse fra i file | Accettata |
| Ruoli con la ricerca sul web (02, 06–10) solo sui dati del progetto, con il compito che lo dice | Non accettata: i compiti non vietano il web. Il risultato dice quali esecuzioni l'hanno usato |
| Un errore di calcolo nel rapporto conta come falso | Non accettata: restano le regole di conteggio di `examples/README.md` |

## Backlog

Confermato all'apertura (2026-11-26).

| ID | Attività | Priorità |
|---|---|---|
| F49-01 | Progetto in `examples/progetti/` per AIBPD, realistico, con da 5 a 8 difetti sottili per ciascuno dei 10 ruoli, trappole e accettabili | P0 |
| F49-02 | Scheda in `examples/casi/`: compito per ruolo, difetti attesi per ruolo, trappole con i ruoli a cui valgono, accettabili e regole di conteggio; riga nella tabella dei casi di `examples/README.md` | P0 |
| F49-03 | Esecuzioni Opus medio: 10 ruoli × 2, in gruppi di al più 7, rapporti in `examples/risultati/<data>-ondata-2/` | P0 |
| F49-04 | Esecuzioni Sonnet: 10 ruoli × 2, nello stesso formato | P0 |
| F49-05 | Conteggio con un valutatore per ruolo e risultato in `examples/risultati/<data>-ondata-2.md`, con i token sul compito finito per configurazione | P0 |
| F49-06 | Tabella dei modelli per i 10 ruoli, decisa con l'utente dai risultati | P0 |
| F49-07 | `models` di AIBPD in `packages/catalog/src/departments.ts`, `model:` nei subagent di `.claude/agents/` e `starter/en/.claude/agents/`, test del catalogo con i ruoli misurati | P1 |
| F49-08 | Proposte di modifica ai file di ruolo dai mancati e dai falsi, da confermare prima di cambiare `agents/` | P2 |
| F49-09 | README del pacchetto (it, en) con i modelli consigliati e voce del `CHANGELOG` per il rilascio | P2 |
| F49-10 | Decisioni su ondate e auditor nella riga «Modelli» di [README.md](README.md); rilievo di F37 aggiornato con le ondate che restano | P3 |

## Criteri di accettazione

- Ogni modello diverso da `inherit` assegnato in F49 ha un risultato in `examples/risultati/` che supera la soglia di F24: almeno i difetti di Opus meno uno, nessun falso in più, formato dei rilievi rispettato.
- Token sul compito finito riportati per ogni configurazione, dai file di Claude Code, senza stime presentate come misure.
- Catalogo, testo dell'agente, `list_agents` e subagent mostrano lo stesso modello.
- `npm run verify` verde.

## Fatto

- **F49-01** Progetto [turnio](../examples/progetti/turnio/): documenti di business di un'app per i turni dei locali, in dieci cartelle (mercato, innovazione, prodotto, finanza, crescita, marketing, vendite, partner, clienti, roadmap), con numeri coerenti fra i file salvo i difetti piantati. Da 6 a 7 difetti per ruolo, 66 in tutto, molti visibili solo confrontando due file o rifacendo un conto.
- **F49-02** Scheda [aibpd-turnio](../examples/casi/aibpd-turnio.md): compito per ruolo, difetti attesi con il punto del documento, 17 trappole con i ruoli a cui valgono, accettabili per ruolo, regole di conteggio del README senza aggiunte; riga nella tabella dei casi di `examples/README.md`. I conti della scheda (previsione pesata, copertura, ritenzione con la coorte di marzo, margini degli accordi, significatività del test A/B) sono rifatti a mano.
