# F27 — Consumo di token sul sito

**Obiettivo**: i totali di token spesi e risparmiati da chi usa Agentrica, inviati in forma anonima e solo con la conferma dell'utente, si vedono sul sito accanto ai risultati misurati nelle prove di F24.

> **Stato: completata** il 2026-11-19 su `fase/f27-consumo-sito` (in entrambi i repository); requisiti, design e backlog confermati all'apertura. Il pacchetto con `share_usage` arriva su npm con il rilascio 0.7.0, a parte (CONVENTIONS §13.8), dopo `003-usage.sql` su Neon e il deploy del sito. Nata all'apertura di F24 (2026-11-18), che si è divisa: qui le voci F24-12…F24-15 della proposta, con le decisioni dell'utente già prese in [24-modelli.md](24-modelli.md) («Misure», «Sito», «Frase sul sito»). Dipende dalla lettura dei token (F24-10) e dal pannello (F24-11).

**Agenzie**: privacy (GDPR, Data Governance, DPIA, Legal) per l'invio anonimo; cybersecurity (AppSec, Cloud Security) per l'endpoint; design (Dashboard e Data Visualization, UX Writer, Accessibility) per frase e grafici; software (Backend, Database, Frontend, QA, Code Reviewer). Ruoli nella sessione principale.

## Decisioni all'apertura (2026-11-19)

| Tema | Decisione |
|---|---|
| Doppi invii | Una chiave per riga: SHA-256 di sessione di Claude Code, giorno, agente, modello ed effort. Il sito sostituisce la riga con la stessa chiave, quindi reinviare è innocuo e un giorno in corso si aggiorna al prossimo invio. Le righe non si collegano fra loro, come `usageId` delle valutazioni. Il server continua a non scrivere file |
| Ingresso | Tool `share_usage` in due passi (anteprima con codice, poi invio) e pulsante «Invia i totali» nel pannello; proposta a fine sessione insieme alla valutazione. `--no-ratings` spegne valutazioni e totali insieme: un solo flag per «nessuna connessione» |
| Soglia | Almeno 10 invii accettati negli ultimi 12 mesi; sotto, il sito mostra solo i risultati misurati nelle prove di F24 |
| Pagina | `/consumo` con frase, grafici e prove di F24; in home una riga con la frase e il link; link nel menu, entrambi solo sopra la soglia |

## Requisiti delle agenzie (proposte, ruoli nella sessione)

**Privacy (GDPR, Data Governance, DPIA, Legal)** — non dichiara conformità
- Dati inviati, per riga: chiave (esadecimale, 64 caratteri), giorno, agente (id di Agentrica se il subagent è uno dei 56, `sessione` per la conversazione principale, `altro` per ogni altro subagent: i nomi dei subagent dell'utente non partono), famiglia del modello (`opus`, `sonnet`, `haiku`, `altro`), effort (`low`, `medium`, `high`, `xhigh`, `max`, `predefinito`, `altro`), token in ingresso, in uscita, letti e scritti in cache. Per invio: versione del pacchetto. Niente id di sessione in chiaro, progetto, percorsi, testi, nomi di file.
- Finestra: gli ultimi 30 giorni del progetto, al più 300 righe (le più vecchie si lasciano fuori, e l'anteprima lo dice).
- Base giuridica proposta: legittimo interesse (art. 6.1.f) a mostrare l'uso reale e a scegliere i modelli dei ruoli; invio volontario e confermato. Da verificare con un legale.
- Bilanciamento: i numeri di token non descrivono una persona; la chiave è l'impronta di un id casuale di Claude Code, non reversibile e diversa per ogni riga; l'hash dell'IP per il limite dura al più 24 ore, come per le valutazioni. Screening DPIA: nessun criterio dell'art. 35 (niente profilazione, dati sensibili, larga scala di persone identificabili, monitoraggio): DPIA non necessaria.
- Voce di registro dei trattamenti e sezione «Consumo di token» delle note legali (`/note-legali#consumo`): titolare, dati, finalità, base, conservazione, fornitori Vercel e Neon (Hobby senza DPA, PRIV-PUB-01 come per le valutazioni), diritti. Link nell'anteprima, nel pannello e nel README.
- Conservazione: 12 mesi per righe e invii, cancellati dal job giornaliero già attivo. Sul sito solo somme per mese, modello e agente, mai la riga; sopra la soglia.
- Diritti: senza identificativi una riga non è riconducibile a una persona; la cancellazione si chiede con giorno, agente, modello e numeri della riga come visti nell'anteprima (le chiavi non si mostrano: ponytail, rischio basso, nessun dato personale).

**Cybersecurity (AppSec, Cloud Security)**
- Route `POST /api/usage`: JSON fino a 96 KB (300 righe ne pesano circa 65), al più 300 righe, campi esatti (come `parseRating`), interi non negativi, giorno negli ultimi 31 giorni (fino a domani UTC), agente dal catalogo o `sessione`/`altro`, enumerazioni chiuse, versione semver, chiavi distinte nell'invio. Risposta senza dettagli interni, niente dati della richiesta nei log.
- Limiti di plausibilità: riga fuori scala (ingresso totale oltre 2 miliardi di token o uscita oltre 100 milioni in un giorno) salvata con `excluded = true` e fuori dalle somme, non cancellata.
- Frequenza: al più 5 invii per IP al giorno, con l'hash dell'IP e il sale del giorno già usati dalle valutazioni; nessun IP salvato.
- Database: una funzione `submit_usage` SECURITY DEFINER con SQL fisso (righe come JSON, upsert per chiave), una `usage_stats` per la lettura con il ruolo `reputation_reader`; la route usa `DATABASE_URL` come quella delle valutazioni (rischio già accettato in F20).
- MCP: URL fisso, `fetch` con timeout di 5 secondi, nessun ritentativo; l'invio parte con il codice dell'anteprima e manda esattamente quel contenuto.

**Design (Dashboard e Data Visualization, UX Writer, Accessibility)**
- Ogni numero dice da dove viene: «dichiarato dagli utenti» per i totali, «misurato nelle nostre prove» per F24, «stima» per qualsiasi conto fatto con i prezzi.
- La frase decisa in F24 dice «ha ridotto il consumo del Z%»; nelle prove il costo equivalente scende ma i token salgono. Proposta del UX Writer: «Con Agentrica sono stati usati X token (dichiarati dagli utenti, ultimi 12 mesi); la cache ne ha fatto pagare l'equivalente di Y in meno; nelle nostre prove la scelta del modello ha ridotto il costo del 50%, con il 25% di token in più».
- Y = token letti dalla cache × 0,9 (sconto della lettura della cache sul prezzo d'ingresso, F24): misurato sui totali dichiarati, non un prezzo.
- Grafici: token per mese (barre), per modello e per agente (barre orizzontali, primi 10 più «altri»); ogni grafico ha la tabella equivalente per i lettori di schermo, contrasto AA, colori del reparto o neutri, senza librerie nuove (SVG o HTML e CSS).
- Prove di F24: tabella per ruolo misurato (modello assegnato, costo e token contro Opus effort medio), dai dati di `examples/risultati/2026-11-19-modelli.md`, sempre visibile.

## Design

**Server MCP** (`packages/mcp`, versione 0.7.0)
- `usage.ts`: le righe per l'invio (`shareRows`), raggruppate per sessione, giorno, agente, modello ed effort, con la chiave calcolata, l'agente ricondotto al catalogo dal nome del subagent (`.claude/agents/` del pacchetto) e le enumerazioni chiuse.
- `share.ts` (o in `ratings.ts`, se più corto): bozza con codice monouso di 10 minuti, invio a `https://agentrica.vercel.app/api/usage`, esiti 201/429/400 come le valutazioni.
- Tool `share_usage` (senza argomenti → anteprima e codice; con `code` → invio), assente con `--no-ratings`; una riga nelle `instructions` per la proposta a fine sessione.
- Pannello: nella sezione del consumo, «Invia i totali ad Agentrica» mostra l'anteprima riga per riga e «Conferma l'invio»; la conferma dalla pagina vale come sì.

**Sito** (`agentrica-site`)
- `db/003-usage.sql`: tabelle `usage_rows` (chiave, giorno, agente, modello, effort, token, versione, `excluded`, `updated_at`), `usage_sends` (giorno dell'invio, righe), `usage_daily_sends` (giorno, hash dell'IP, numero); funzioni `submit_usage`, `usage_stats`, cancellazione dentro il job giornaliero.
- `src/lib/usage.ts` (validazione e somme, con test), `src/app/api/usage/route.ts`, `src/lib/usage-data.ts` (lettura ISR a un'ora, come la reputazione, con fixture in sviluppo), pagina `/consumo`, riga in home e link nel menu sopra la soglia, sezione delle note legali, e2e.

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F27-01 | Invio anonimo confermato dei totali: righe con chiave, tool `share_usage`, pulsante del pannello con anteprima, spento da `--no-ratings`, con test | P1 |
| F27-02 | Endpoint e tabelle dei totali nel sito, somme per agente, modello e mese, limiti di plausibilità e di frequenza; requisiti privacy e cyber | P1 |
| F27-03 | Sito: pagina `/consumo` con la frase, i grafici e le prove di F24; frase in home e link nel menu sopra la soglia | P1 |
| F27-04 | Note legali, README, `CHANGELOG.md` (0.7.0) e e2e del sito per le misure | P1 |

## Criteri di accettazione

- Un invio parte solo dopo la conferma e contiene esattamente l'anteprima; con il flag spento non si propone.
- Il sito mostra la frase e i grafici solo sopra la soglia; i totali sono indicati come dichiarati dagli utenti e i risultati delle prove come misurati.
- `npm run verify` verde, e2e del sito verdi.

## Fatto

- **F27-01** [`usage.ts`](../packages/mcp/src/usage.ts) `shareRows`: righe per sessione, giorno, agente, modello ed effort degli ultimi 30 giorni, al più 300, chiave SHA-256, subagent ricondotti all'id con `subagentIds` ([`catalog.ts`](../packages/mcp/src/catalog.ts), dai file di `.claude/agents/`), il resto `altro`. [`share.ts`](../packages/mcp/src/share.ts): bozza con codice monouso di 10 minuti, invio a `/api/usage`, esiti 201/429/400, anteprima testuale. Tool `share_usage` e riga nelle `instructions` in [`server.ts`](../packages/mcp/src/server.ts), assenti con `--no-ratings`; la cartella di Claude Code si legge solo all'anteprima (con il permission model del README restano zero righe). Pannello: rotte `POST /api/share/preview` e `/api/share` (Origin e JSON obbligatori, solo il codice nella conferma), sezione «Condividi i totali con Agentrica» nella vista Consumo con la tabella delle righe esatte. Test: righe e chiavi, nomi dei subagent che non escono, finestra e limite, invio una volta sola, errori, rotte del pannello, tool e `--no-ratings`.
- **F27-02** Sito: `db/003-usage.sql` del repository del sito (tabelle `usage_rows`, `usage_sends`, `usage_daily_sends`; `submit_usage` con upsert per chiave, 5 invii per IP al giorno con il sale delle valutazioni, righe fuori scala marcate; `usage_stats`, `usage_send_count`; `purge_ratings` che cancella anche i totali oltre i 12 mesi), provato su PGlite: sostituzione per chiave, limite, esclusione dalle somme, permessi di `reputation_reader`. `src/lib/usage.ts` (validazione con campi esatti, somme, soglia di 10 invii, prove di F24) con test; route `POST /api/usage`; lettura ISR in `src/lib/usage-data.ts` con fixture in sviluppo; passo in `db/README.md`.
- **F27-03** Pagina `/consumo` (`src/components/usage-view.tsx`): totali dichiarati con etichetta, barre per mese, modello e agente (primi 10 più «conversazione principale e altri») fatte come tabelle, prove di F24 misurate per caso (−50% di costo, +25% di token) con il link ai risultati, come inviare. Frase in home e link «Consumo» nel menu solo sopra la soglia.
- **F27-04** Note legali (sezione `#consumo`, «Quali dati tratta il sito», «Il server MCP»), home («Non ha telemetria…»), README IT ed EN del pacchetto (connessioni, tool, sezione «Totali di token», pannello), descrizione del pacchetto; e2e `consumo.spec.ts` (senza invii, route senza database, con i dati finti: frase, tabelle, menu, axe, niente scorrimento orizzontale).

## Verifiche

- `npm run verify` verde in entrambi i repository (qui 127 test; nel sito anche il build).
- `npx playwright test` del sito: tutte verdi dopo l'aggiornamento della frase della landing e del contenitore scorrevole delle prove (focalizzabile su telefono).
- Viste nel browser: `/consumo` e frase in home con i dati finti, a 1440 e 360 px; sezione del pannello con le righe vere di questo progetto e un invio finto.
- Anteprima sui file reali di questo progetto: 50 righe, circa 10 KB, nomi dei subagent non di Agentrica diventati `altro`.
- Non fatto: invio vero verso il sito (serve `003-usage.sql` su Neon e il deploy); prova in un client diverso da Claude Code.

## Rilievi aperti

- Risolto (2026-11-19, su richiesta dell'utente): `003-usage.sql` eseguito su Neon dall'utente (`usage_send_count()` = 0); sito in produzione con la PR #8 di `agentrica-site` (`/consumo` 200, `POST /api/usage` non valido 400); rilascio 0.7.0 con la voce del `CHANGELOG.md` per F24–F27: PR #19, tag `v0.7.0`, pubblicazione dalla CI con provenance dopo l'approvazione dell'ambiente `npm`. Da fare al PC: `io.github.flgisimone/agentrica` 0.7.0 nel registro MCP con `mcp-publisher`. Superato in F30 (F30-01): 0.8.0 è latest nel registro MCP.
- P2: base giuridica e bilanciamento dei totali da far verificare a un legale, come per le valutazioni; Vercel Hobby senza DPA resta PRIV-PUB-01. Chiuso in F30 (F30-04): rischio accettato dall'utente il 2026-11-21, senza revisione legale; riaprire con i casi scritti in PRIV-PUB-01.
- P3: la soglia conta gli invii, non gli utenti: lo stesso utente che invia ogni giorno la fa salire (le righe no, si sostituiscono). Da rivedere se i totali crescono in modo strano. Chiuso in F30 (F30-12): accettato dall'utente il 2026-11-21, si riapre se i totali crescono in modo strano.
- P3: i grafici non hanno tooltip: ogni barra ha etichetta e valore scritti, quindi un tooltip ripeterebbe il dato. Chiuso in F30 (F30-12): accettato dall'utente il 2026-11-21.
