# F51 — Misura dei modelli, quarta ondata: cyber, privacy e software

**Obiettivo**: chiudere le ondate per reparto decise in F49 con gli otto specialisti che restano di cybersecurity, privacy e software, sui tre progetti di F37 estesi. Dopo F51 ogni ruolo è misurato o è `inherit` per una decisione scritta.

> **Stato: completata** (2026-11-27). Versione 0.20.0 preparata, da pubblicare insieme al sito. Branch `fase/f51-misura-cyber-privacy-software`, aperto il 2026-11-26 dal branch di F50 (commit `f8d44dc`) per preparare materiali e scheda, allineato a `develop` il 2026-11-27 dopo la chiusura di F50. Perimetro e configurazioni decisi con l'utente il 2026-11-26 all'apertura di F49; proposte e backlog decisi lo stesso giorno e confermati all'apertura delle esecuzioni (2026-11-27).

**Agenzie**: software (QA per casi e conteggi, Backend per catalogo e subagent, Code Reviewer). Cybersecurity, privacy e software sono l'**oggetto** della misura, non revisori.

## Situazione di partenza

- In F37 AICA-06 e AISA-04 sono rimasti `inherit` per un falso in più su Sonnet. Le schede sono state chiarite dopo la prima ondata: questa è la nuova misura.
- Progetti di F37: [portale-ordini](../examples/progetti/portale-ordini/) (AICA), [scuola-lingue](../examples/progetti/scuola-lingue/) (AIPCA), [gestionale-magazzino](../examples/progetti/gestionale-magazzino/) (AISA), con le schede in `examples/casi/`.

## Decisioni dell'utente (2026-11-26, all'apertura di F49)

| Tema | Decisione |
|---|---|
| Perimetro | Otto ruoli. Cyber: AICA-06 IAM (di nuovo), 08 Incident Response, 12 Security Awareness. Privacy: AIPCA-03 Legal, 09 Data Breach. Software: AISA-03 Functional Analyst, 04 Backend (di nuovo), 06 Full Stack |
| Auditor e ruoli di giudizio | AICA-10 e AIPCA-10 restano `inherit` senza misura, come i direttori, Architect, Security Architect, Code Reviewer, DPIA e Pentest |
| Configurazioni | Opus 5.5 effort medio e Sonnet 5.5, due esecuzioni ciascuna: 32 esecuzioni, circa 8M token |
| Casi | Si estendono i tre progetti di F37 invece di crearne di nuovi |

## Proposte (decise il 2026-11-26)

| Proposta | Esito |
|---|---|
| Materiali nuovi per i ruoli nuovi nei progetti di F37 | Accettata dopo un chiarimento: solo file nuovi, in cartelle nuove che i compiti di F37 non toccano |
| AICA-06 e AISA-04 sulle schede chiarite, con gli stessi compiti e difetti di F37 | Accettata |
| Haiku per AICA-12 (+2 esecuzioni) | Accettata |
| I difetti nuovi non toccano quelli di F37 | Accettata |

In tutto 34 esecuzioni: 8 ruoli × 2 Opus medio, 8 × 2 Sonnet, 2 Haiku su AICA-12.

## Backlog

Stessa forma di F49.

| ID | Attività | Priorità |
|---|---|---|
| F51-01 | Materiali nuovi nei tre progetti di F37 per AICA-08, 12, AIPCA-03, 09, AISA-03, 06, senza cambiare i file esistenti | P0 |
| F51-02 | Scheda dell'ondata in `examples/casi/` (ruoli nuovi; AICA-06 e AISA-04 sulle schede di F37) e riga nella tabella dei casi | P0 |
| F51-03 | Esecuzioni Opus medio: 8 ruoli × 2, in gruppi di al più 7, rapporti in `examples/risultati/<data>-ondata-4/` | P0 |
| F51-04 | Esecuzioni Sonnet: 8 ruoli × 2, più Haiku su AICA-12 × 2 | P0 |
| F51-05 | Conteggio con un valutatore per ruolo e risultato in `examples/risultati/<data>-ondata-4.md`, con il confronto di AICA-06 e AISA-04 con F37 | P0 |
| F51-06 | Tabella dei modelli per gli 8 ruoli, decisa con l'utente dai risultati | P0 |
| F51-07 | `models` in `departments.ts`, `model:` nei subagent di `.claude/agents/` e `starter/en/.claude/agents/`, test del catalogo | P1 |
| F51-08 | Proposte di modifica ai file di ruolo dai mancati e dai falsi, da confermare prima di cambiare `agents/` | P2 |
| F51-09 | README del pacchetto e voce del `CHANGELOG` | P2 |
| F51-10 | Riga «Modelli» di [README.md](README.md) con il motivo di ogni ruolo `inherit`; rilievo P2 di F24 e F37 chiuso con l'evidenza | P1 |

## Criteri di accettazione

Come in F49, e in più: nella riga «Modelli» di [README.md](README.md) ogni ruolo `inherit` ha il suo motivo (direttore, ruolo di giudizio, auditor o soglia non superata).

## Fatto

- **F51-01** File nuovi nei progetti di F37, in cartelle nuove: `portale-ordini/incidente/` (rapporto e estratto dei log in UTC) e `portale-ordini/formazione/` (regole per il personale, piano di formazione); `scuola-lingue/legale/` (informativa, cookie policy, banner) e `scuola-lingue/violazione/` (scheda dell'evento, registro); `gestionale-magazzino/richieste/resi.md` e `gestionale-magazzino/funzioni/resi/` (migrazione, rotte, pagina). Da 7 a 9 difetti per ruolo, 49 in tutto; i file e i compiti di F37 non cambiano.
- **F51-02** Scheda [ondata-4-cyber-privacy-software](../examples/casi/ondata-4-cyber-privacy-software.md): compiti dei sei ruoli nuovi, difetti attesi, 13 trappole, accettabili, regole di conteggio; AICA-06 e AISA-04 rimandano alle schede di F37; riga nella tabella dei casi.
- **F51-03**, **F51-04** 34 esecuzioni (16 Opus effort medio, 16 Sonnet, 2 Haiku su AICA-12), un subagent per esecuzione su una copia nuova con il nome senza il modello, al più 7 insieme, nessuna fermata dal limite delle cinque ore; rapporti e token in [`2026-11-27-ondata-4/`](../examples/risultati/2026-11-27-ondata-4/), letti dai file dei subagent.
- **F51-05** Conteggio con un valutatore Opus per ruolo, istruzioni uguali, rapporti anonimi senza le frasi sul modello (24 righe); falsi ricontrollati a mano. Risultato in [`2026-11-27-ondata-4.md`](../examples/risultati/2026-11-27-ondata-4.md): Sonnet supera la soglia in 6 ruoli su 8 (−57% del costo equivalente, −20% di token), Haiku su AICA-12 (9/9, nessun falso, 3% del costo di Opus). Confronto con F37: AICA-06 ora senza falsi su Sonnet; AISA-04 ripete l'errore sulla migrazione 003 e ne aggiunge due. Scheda chiarita con le proposte dei valutatori («Chiarimenti dopo F51»).
- **F51-06** Tabella decisa con l'utente (2026-11-27): soglia alla lettera, Sonnet per AICA-06, 08, AIPCA-03, AISA-03 e 06, Haiku per AICA-12; `inherit` per AIPCA-09 e AISA-04.
- **F51-07** `models` di AICA, AIPCA e AISA in `departments.ts`, `model:` nei sei subagent di `.claude/agents/` e `starter/en/.claude/agents/`, test del catalogo; `npm run verify` verde.
- **F51-08** Nessuna proposta ai file di ruolo: i falsi (un considerando citato per la cifratura, tre fatti sbagliati su migrazioni, runtime e tipi in AISA-04) e i due mancati (Q4, B6) sono casi singoli o già noti dalla scheda di F37 (T16), chiariti nelle schede.
- **F51-09** README del pacchetto (it, en) con i sei agenti nella tabella dei modelli consigliati e il motivo dei 17 `inherit`; voce 0.20.0 del `CHANGELOG`; versione 0.20.0 in `package.json`, `server.json`, `prompt.ts` e nei README della root.
- **F51-10** Riga «Modelli» di [README.md](README.md) con il motivo di ogni ruolo `inherit` (direttori, ruoli di giudizio, auditor, soglia non superata); rilievo P2 di F24 e di F37 chiuso con l'evidenza.

## Verifiche

- `npm run verify` verde il 2026-11-27: typecheck, lint e 204 test, compreso il test che lega i `model:` dei subagent al catalogo e l'elenco dei ruoli misurati.
- `check` sul piano: nessun problema di formato.
- `npm run verify:e2e` non serve: la fase non tocca il sito (da F17 nel repository del sito). Il sito prende la 0.20.0 al rilascio in parallelo.
- I quattro falsi dei valutatori ricontrollati a mano sul progetto (`003_sku.sql`, `reports.js`, `migrate.js`) e sul testo del GDPR (considerando 75-76).

## Rilievi aperti

- ~~P3~~ Chiuso come accettato in `fix/rilievi-f51` (2026-11-28, scelta dell'utente): caso singolo, si riapre se una prossima prova lo ripete. Un rapporto Opus di AISA-06 è uscito in inglese, con il compito in italiano: primo caso nelle ondate. Da guardare se si ripete; il testo dell'agente chiede già di rispondere nella lingua dell'utente.
- P3 · Il sito mostra la tabella delle prove di `/consumo` fino a F50: va aggiornata con F51 al rilascio della 0.20.0. Issue [#52](https://github.com/flgisimone/agentrica/issues/52).

## Dopo la chiusura: `fix/rilievi-f51` (2026-11-28)

Su scelta dell'utente, prima del rilascio 0.20.0: chiusi i rilievi che non chiedono una prova umana. Rapporto in inglese (P3 di F51) e prove con un lettore di schermo vero (P3 di F46 e F47) chiusi come accettati; misura delle catene rifatta (P3 di F48, [2026-11-28-catene-tool.md](../examples/risultati/2026-11-28-catene-tool.md)), soglia non superata, e con lei chiuso come accettato il P2 di F45 su `list_agents`, con la condizione per riaprirlo. Restano aperti: la tabella di `/consumo` (P3 di F51), da aggiornare nel sito con il rilascio, e C6 e C7 nel client con il pannello aperto (P3 di F48), che chiedono una prova dell'utente. Da qui i rilievi aperti sono anche issue su GitHub (#51, #52; scelta dell'utente, 2026-11-28).
