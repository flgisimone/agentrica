# F50 — Misura dei modelli, terza ondata: design

**Obiettivo**: continuare le ondate per reparto decise in F49 con otto specialisti di design, con lo stesso metodo e la stessa soglia di F24, F37 e F49. Un ruolo passa a un modello più piccolo solo dove la qualità regge.

> **Stato: in corso** (esecuzioni dal 2026-11-27). Branch `fase/f50-misura-design`, aperto il 2026-11-26 dal branch di F49 (commit `79245d1`), per preparare progetto e scheda mentre F49 aspetta le esecuzioni. Perimetro e configurazioni decisi con l'utente il 2026-11-26 all'apertura di F49; proposte decise lo stesso giorno. Le esecuzioni partono dopo quelle di F49; il merge in `develop` dopo F49.

**Agenzie**: software (QA per casi e conteggi, Backend per catalogo e subagent, Code Reviewer). Design è l'**oggetto** della misura, non un revisore.

## Situazione di partenza

- In design, finora, nessun ruolo ha un modello consigliato. AIWDA-08 resta `inherit` in attesa di un secondo caso ([24-modelli.md](24-modelli.md), F30-05).
- Metodo, soglia e regole di conteggio in [`examples/README.md`](../examples/README.md) («Confronto di modelli»), con le eventuali correzioni di F49.

## Decisioni dell'utente (2026-11-26, all'apertura di F49)

| Tema | Decisione |
|---|---|
| Perimetro | Otto ruoli: AIWDA-02 UX Researcher, 03 UX Designer, 04 Information Architect, 05 UI Designer, 06 Design System, 07 Dashboard e Data Visualization, 09 Usability Auditor, 10 UX Writer. AIWDA-01 resta `inherit` senza misura come gli altri direttori |
| Configurazioni | Opus 5.5 effort medio e Sonnet 5.5, due esecuzioni ciascuna: 32 esecuzioni, circa 8M token. Haiku solo per un ruolo con un risultato meccanico, se la scheda lo indica |
| Casi | Un progetto realistico nuovo per il reparto, con difetti sottili per ciascun ruolo, trappole e accettabili |

## Proposte (decise il 2026-11-26)

| Proposta | Esito |
|---|---|
| Interfaccia web piccola ma completa (pagine HTML e CSS, componenti, dashboard con grafici, testi, ricerca con interviste inventate e dichiarate tali) | Accettata |
| AIWDA-08 nello stesso progetto, come secondo caso che aspetta da F30 (+4 esecuzioni) | Accettata: nove ruoli |
| Haiku per AIWDA-10 (+2 esecuzioni) | Accettata |
| Nessuna prova nel browser | Non accettata: schermate fisse, decise il 2026-11-27 (F50-03) |

In tutto 38 esecuzioni: 9 ruoli × 2 Opus medio, 9 × 2 Sonnet, 2 Haiku su AIWDA-10.

## Backlog

Stessa forma di F49.

| ID | Attività | Priorità |
|---|---|---|
| F50-01 | Progetto in `examples/progetti/` per AIWDA, con da 6 a 9 difetti per ciascuno dei 9 ruoli, trappole e accettabili | P0 |
| F50-02 | Scheda in `examples/casi/` e riga nella tabella dei casi di `examples/README.md` | P0 |
| F50-03 | Decisione sull'uso del browser nelle esecuzioni | P1 |
| F50-04 | Esecuzioni Opus medio: 9 ruoli × 2, in gruppi di al più 7, rapporti in `examples/risultati/<data>-ondata-3/` | P0 |
| F50-05 | Esecuzioni Sonnet: 9 ruoli × 2, più Haiku su AIWDA-10 × 2 | P0 |
| F50-06 | Conteggio con un valutatore per ruolo e risultato in `examples/risultati/<data>-ondata-3.md` | P0 |
| F50-07 | Tabella dei modelli per i 9 ruoli, decisa con l'utente dai risultati | P0 |
| F50-08 | `models` di AIWDA in `departments.ts`, `model:` nei subagent di `.claude/agents/` e `starter/en/.claude/agents/`, test del catalogo | P1 |
| F50-09 | Proposte di modifica ai file di ruolo dai mancati e dai falsi, da confermare prima di cambiare `agents/` | P2 |
| F50-10 | README del pacchetto e voce del `CHANGELOG` | P2 |

## Criteri di accettazione

Come in F49: soglia di F24 per ogni modello diverso da `inherit`, token misurati dai file di Claude Code, lo stesso modello in catalogo, testo dell'agente, `list_agents` e subagent, `npm run verify` verde.

## Fatto

- **F50-01** Progetto [turnio-pannello](../examples/progetti/turnio-pannello/): pannello web di Turnio per i responsabili, con quattro pagine HTML, token e stili, `js/app.js`, mappa, componenti, glossario e ricerca (protocollo, cinque interviste, sintesi). Da 6 a 9 difetti per ruolo, 61 in tutto; date e conti dei grafici controllati (giorni della settimana, scale degli assi, rapporto costo/incassi).
- **F50-02** Scheda [aiwda-turnio-pannello](../examples/casi/aiwda-turnio-pannello.md): compiti, difetti attesi per ruolo (con il criterio WCAG per AIWDA-08), 12 trappole, accettabili, regole di conteggio; riga nella tabella dei casi.
- **F50-03** Browser (2026-11-27): schermate fisse delle quattro pagine a 1280 e a 390 px, a pagina intera, generate una volta con Playwright in [`schermate/`](../examples/progetti/turnio-pannello/schermate/) e uguali per tutte le esecuzioni; i subagent non aprono il browser. Il ramo è allineato a `develop` dopo la chiusura di F49.
