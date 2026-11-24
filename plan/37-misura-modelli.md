# F37 — Misura dei modelli, prima ondata

**Obiettivo**: chiudere una parte del rilievo aperto di F24 sui 50 ruoli non misurati. Quattordici specialisti di cybersecurity, privacy e software, simili a quelli che in F24 sono passati su Sonnet, si provano con lo stesso metodo e la stessa soglia. Un ruolo riceve un modello più piccolo solo dove la qualità regge.

> **Stato: completata** (aperta il 2026-11-23, chiusa il 2026-11-24). Perimetro, configurazioni, casi e trattamento dei direttori decisi con l'utente il 2026-11-23; backlog confermato lo stesso giorno. Esecuzioni del 2026-11-23 e 2026-11-24; tabella dei modelli, versione e trattamento delle schede decisi con l'utente il 2026-11-24.

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

## Decisioni dai risultati (2026-11-24)

| Tema | Decisione |
|---|---|
| Modelli per ruolo | Soglia stretta: Haiku ad AICA-09; Sonnet ad AICA-03, 05, 07, AIPCA-05, 06, 07, 08, AISA-05, 07, 10, 11. AICA-06 e AISA-04 restano `inherit` (un falso in più su Sonnet) |
| Mancati e falsi | Nessun cambio ai file di ruolo: i falsi sono su trappole vicine a un consiglio di irrobustimento o sul file `004_stock.down.sql`. Si chiariscono le schede e si aggiungono gli extra validi ricorrenti fra gli accettabili; i conteggi del 2026-11-24 restano |
| Versione | 0.12.0, minore come in F24 (0.7.0): cambia il modello consigliato di 12 agenti |

## Fatto

- **F37-01** Tre progetti in `examples/progetti/`: [portale-ordini](../examples/progetti/portale-ordini/) (cyber: API Node, nginx, Compose, security group, WireGuard, IAM, log e regole del SIEM, rapporto dello scanner), [scuola-lingue](../examples/progetti/scuola-lingue/) (privacy: codice, schema, configurazioni, registro dei fornitori, procedura dei diritti, studenti minorenni e note di salute), [gestionale-magazzino](../examples/progetti/gestionale-magazzino/) (software: Express e Postgres, pagina web, migrazioni, CI, immagine e deploy). Da 5 a 8 difetti sottili per ruolo.
- **F37-02** Tre schede in `examples/casi/` ([aica](../examples/casi/aica-portale-ordini.md), [aipca](../examples/casi/aipca-scuola-lingue.md), [aisa](../examples/casi/aisa-gestionale-magazzino.md)): compito per ruolo, difetti attesi per ruolo, trappole con i ruoli a cui valgono, accettabili per ruolo, regole di conteggio; tabella dei casi in `examples/README.md`.
- **F37-03, F37-04** 58 esecuzioni (28 Opus effort medio, 28 Sonnet, 2 Haiku su AICA-09), un subagent per esecuzione su una copia nuova, in gruppi di 7; rapporti e token in [`2026-11-23-ondata-1/`](../examples/risultati/2026-11-23-ondata-1/), letti dai file dei subagent (anche quando il rapporto arriva con la consegna del subagent invece che come testo).
- **F37-05** Conteggio con un valutatore Opus per ruolo, istruzioni uguali e rapporti anonimi; falsi ricontrollati sul progetto. Risultato in [`2026-11-23-ondata-1.md`](../examples/risultati/2026-11-23-ondata-1.md): Sonnet supera la soglia in 12 ruoli su 14, Haiku su AICA-09; sul compito finito Sonnet −58% del costo equivalente e −15% di token, Haiku −95% del costo e +28% di token.
- **F37-06** Tabella dei modelli decisa con l'utente (sopra).
- **F37-07** `models` in [`departments.ts`](../packages/catalog/src/departments.ts) per AICA, AIPCA e AISA; `model:` nei 12 subagent di `.claude/agents/` e di `starter/en/.claude/agents/`; test del catalogo aggiornato con i 17 ruoli misurati. Il testo dell'agente e `list_agents` leggono il modello dal catalogo.
- **F37-08** Nessuna proposta ai file di ruolo. Schede chiarite (sezione «Chiarimenti dopo la prima ondata»: trappole T4, T7, T11, T13, T14, T15, T16, T19, una trappola nuova sui `.down.sql`, descrizioni di F5, S7 e D7 corrette) e accettabili aggiunti per ogni ruolo. Metodo in `examples/README.md`: un valutatore per ruolo e copie senza il modello nel nome.
- **F37-09** README del pacchetto (it, en) con i 17 agenti e i 39 che restano sul modello della sessione; CHANGELOG 0.12.0 (it, en); versione 0.12.0 in `package.json`, `server.json`, lockfile e README.
- **F37-10** Direttori e ruoli di giudizio nelle decisioni di [README.md](README.md) («Modelli»); rilievo di F24 aggiornato con i ruoli che restano.
- `eslint.config.js`: `examples/progetti/**` escluso dal lint (progetti difettosi di proposito, in CommonJS).

## Verifiche

- `npm run verify` verde: 173 test, compreso il confronto fra i subagent e il catalogo.
- `npm run agent-text -- aica-09 …` mostra «Modello consigliato: Haiku».
- Falsi ricontrollati a mano sul progetto: la riga `RENAME COLUMN stock TO qty` è solo in `004_stock.down.sql` (copia identica all'originale).
- Non fatto: la prova nel sito, che legge il catalogo dal pacchetto e mostra il modello solo dopo il rilascio in parallelo; il rilascio 0.12.0, che è a parte (CONVENTIONS §13.8).

## Rilievi aperti

- P2 · Seconda ondata di misure: 26 ruoli non misurati (business e design, più AICA-08, 10, 12, AIPCA-03, 09, 10, AISA-03, 06) e le nuove misure di AICA-06 e AISA-04 dopo il chiarimento delle schede; AIWDA-08 resta in attesa di un secondo caso.
- P3 · Anonimato parziale verso il valutatore: alcuni rapporti dicono il modello (percorso della copia, regola di riesame). Metodo corretto in `examples/README.md` per le prossime ondate.
- P3 · Il subagent non ha il tool `library`: nessun rapporto ha letto le schede della biblioteca (come in F24 e F30). Da valutare se dare il tool ai subagent di prova.
- P3 · `portale-ordini`: manca `app/mail.js` e il README descrive il bilanciatore in modo incoerente (TCP e `X-Forwarded-For`). Non toccano i difetti attesi; da correggere prima della seconda ondata, con le schede.
