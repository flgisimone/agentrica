# F50 — Misura dei modelli, terza ondata: design

**Obiettivo**: continuare le ondate per reparto decise in F49 con otto specialisti di design, con lo stesso metodo e la stessa soglia di F24, F37 e F49. Un ruolo passa a un modello più piccolo solo dove la qualità regge.

> **Stato: da fare**. Perimetro e configurazioni decisi con l'utente il 2026-11-26 all'apertura di F49; le proposte e il backlog si confermano all'apertura.

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

## Proposte da confermare

- **Progetto**: un'interfaccia web piccola ma completa (pagine HTML e CSS, componenti, una dashboard con grafici, testi, note di ricerca con interviste fittizie dichiarate come tali), così ogni ruolo ha la sua parte.
- **AIWDA-08 nello stesso progetto**: aggiungere difetti di accessibilità e misurarlo, così ha il secondo caso che aspetta da F30 (+4 esecuzioni).
- **Haiku per AIWDA-10**: testi e messaggi sono un risultato quasi meccanico; due esecuzioni in più.
- **Prova nel browser**: nessuna. I ruoli leggono i file, come nelle ondate precedenti, perché uno screenshot per esecuzione costa troppo.

## Backlog

Da confermare all'apertura. Stessa forma di F49 (progetto, scheda, esecuzioni Opus e Sonnet in gruppi di al più 7, conteggio con un valutatore per ruolo, tabella dei modelli, `models` di AIWDA e `model:` nei subagent, proposte ai file di ruolo, README e CHANGELOG, rilievo aggiornato).

## Criteri di accettazione

Come in F49: soglia di F24 per ogni modello diverso da `inherit`, token misurati dai file di Claude Code, lo stesso modello in catalogo, testo dell'agente, `list_agents` e subagent, `npm run verify` verde.
