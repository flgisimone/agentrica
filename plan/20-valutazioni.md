# F20 — Valutazioni degli agenti

**Obiettivo**: chi usa `@agentrica/mcp` può dare a un agente un voto da 1 a 5 e un commento facoltativo, che arrivano al titolare in forma anonima, così si capisce quali agenti funzionano e cosa migliorare. La parte pubblica (classifiche, statistiche nelle schede, commenti pubblicati) è in F21.

> **Stato: completata** il 2026-11-17 su `fase/f20-valutazioni`; sito in produzione con la PR #4 di `agentrica-site` (`31cd892`), pacchetto 0.5.0 con il tag `v0.5.0`. Design deciso con l'utente il 2026-11-17 (analisi in sessione e bozza «F20 — Community Ratings & Agent Reputation» dell'utente); backlog confermato all'apertura (2026-11-17).

**Agenzie**: business (Product Manager per obiettivo e misura); privacy (GDPR, Legal, Vendor Compliance, Data Governance) prima e dopo; cybersecurity (AppSec, Cloud Security) sull'endpoint pubblico e sui segreti; software (Backend, Database, DevOps, QA, Security, Code Reviewer).

## Situazione di partenza

- Il server MCP è solo stdio locale, «non scrive file, non apre connessioni e non raccoglie dati» (README del pacchetto, F5); decisione «nessuna telemetria» (F5, F14). Il pannello locale (`--panel`) tiene in memoria gli agenti usati (`Activity` in `packages/mcp/src/panel.ts`).
- Il sito (`agentrica-site`, Next.js 16 su Vercel Hobby) è statico, senza database né route server; le note legali dicono che non raccoglie dati. Nessun DPA con Vercel su Hobby (PRIV-PUB-01, rischio accettato).
- Un database Postgres su Neon era già stato progettato e rinviato in F11 (commit `bede00f`).
- Decisione «Privacy dei trasporti» (PRIV-MCP-02): qualsiasi telemetria richiede una revisione privacy prima del design. Questo piano la applica: i requisiti privacy sotto vengono prima del codice.

## Decisioni dell'utente (2026-11-17)

| Tema | Decisione |
|---|---|
| Canale | Endpoint del sito con database (non issue GitHub né file locale) |
| Perimetro | F20 raccolta privata; F21 reputazione pubblica, quando i voti bastano |
| Ingresso | Tool `rate_agent` per tutti, con conferma nel terminale; pulsante «Valuta» nel pannello per chi usa `--panel` |
| Momenti | Proposta a fine lavoro (al massimo una volta per agente per sessione) e promemoria dopo 30 minuti di uso di un agente non ancora votato |
| Consenso | Conferma dell'utente a ogni invio, mostrando cosa parte; nessun invio automatico |
| Identità | Anonimo: nessun id di installazione né di sessione. Un id casuale per utilizzo solo contro i doppi invii in buona fede |
| Offline | Nessuna coda: se l'invio fallisce il tool lo dice e l'utente riprova; il server non scrive file |
| Conservazione | 12 mesi, poi cancellazione automatica |
| Database | Neon dal Marketplace di Vercel, regione UE (Francoforte), piano gratuito; `@neondatabase/serverless` nel sito (dipendenza nuova, versione esatta) |
| Rate limit | Un voto per agente per IP al giorno: hash dell'IP con un sale giornaliero salvato nel database e distrutto a fine giornata insieme agli hash, così il limite vale su tutte le istanze. Sostituisce il sale solo in memoria (scelta dell'utente, 2026-11-17) |
| Conferma dal tool | Due passi decisi dal server: anteprima con il testo esatto e un codice valido 10 minuti, poi invio solo con il codice e solo del contenuto mostrato; niente elicitation (F20-01) |
| Vercel | Resta Hobby senza DPA, rischio PRIV-PUB-01 rinnovato e dichiarato nelle note legali, anche per la route delle valutazioni; da rivedere con un legale |
| Diritti e basi giuridiche | Proposte privacy di F20-02 accettate: codice della valutazione dopo l'invio, legittimo interesse per voto, commento e limite per IP, consenso per la pubblicazione, screening DPIA e voce di registro |
| Presentazione dell'agente | Durante il lavoro l'agente dice chi è (es. «AISA-02 · ALTAIR — Backend Developer, reparto AISA (AI Software)») all'inizio, ai cambi di agente o di ruolo e nel riepilogo; entra in F20 (F20-12), così chi vota sa chi sta valutando |
| Credenziali della route | Route e job usano `DATABASE_URL` dell'integrazione (proprietario) invece dei ruoli `ratings_writer` e `ratings_purger`, per non gestire variabili a mano (scelta dell'utente, 2026-11-17). Rischio accettato: una falla della route ha i permessi del proprietario; mitigato da SQL fisso (solo `submit_rating` e `purge_ratings`) e validazione prima del database. I ruoli restano nel database, pronti per tornare al privilegio minimo |
| Voti gonfiati | Non si possono impedire senza account: in F20 solo il limite per agente, IP e giorno. Proof of work e segnalazione in lettura non entrano; la media robusta resta in F21 |
| Pubblicazione | Casella facoltativa, spenta di default, «puoi pubblicare il mio commento sul sito», per F21; in F20 nessun commento è pubblico |
| Disattivazione | Flag `--no-ratings`: niente tool, niente promemoria, nessuna connessione possibile |

## Requisiti delle agenzie (proposte, ruoli nella sessione)

**Business (Product Manager)**
- Obiettivo: individuare gli agenti con voto basso e il motivo, per correggere i file di ruolo. Misura: numero di voti e di commenti per agente; revisione dopo 4 settimane dalla 0.5.0 per decidere se aprire F21.
- La valutazione non deve rallentare il lavoro: una domanda, al massimo una volta per agente per sessione.

**Privacy (GDPR, Legal, Vendor, Data Governance)** — non dichiara conformità
- Dati raccolti: id agente, voto, commento facoltativo (max 1000 caratteri), versione del pacchetto, id casuale dell'utilizzo, data. Niente compito, prompt, codice, percorsi, nome del progetto, IP salvato.
- Il commento libero può contenere dati personali anche se anonimo: avviso prima dell'invio («non scrivere nomi, codice o dati del progetto»).
- Base giuridica proposta: legittimo interesse al miglioramento del prodotto (art. 6.1.f), con invio volontario e confermato; da verificare con un legale.
- Informativa: nuova sezione delle note legali (titolare, dati, finalità, base, conservazione 12 mesi, fornitori Vercel e Neon, log tecnici di Vercel con IP, diritti); il link compare nel testo di conferma dell'invio e nel README.
- Fornitori: Neon con regione UE (Francoforte) e suo DPA; Vercel resta Hobby senza DPA (PRIV-PUB-01 da rivalutare: ora la route tratta dati).
- Diritti: senza identificativi un voto non è riconducibile a una persona; la cancellazione si chiede indicando agente, data e testo del commento.
- Conservazione: cancellazione automatica dopo 12 mesi (job giornaliero).
- Hash dell'IP: dato pseudonimo per al massimo 24 ore (sale e hash del giorno si cancellano insieme), poi non riconducibile; nell'informativa. Da valutare in F20-02.
- La decisione «nessuna telemetria» in `plan/README.md` e la riga «non apre connessioni» del README vanno riscritte: il server apre una connessione solo quando l'utente conferma un voto.

**Cybersecurity (AppSec, Cloud Security)**
- Endpoint pubblico: corpo JSON fino a 4 KB, validazione con zod (agente presente nel catalogo, voto intero 1–5, versione semver, id UUID), risposta senza dettagli interni, nessun commento nei log.
- Abusi: vincolo unico su `usage_id` (doppi invii in buona fede) e un voto per agente per IP al giorno, senza salvare l'IP. Limite dichiarato: chi usa molti IP (VPN, botnet) passa comunque; in F20 i voti non sono pubblici, quindi l'interesse a manipolarli è basso. Se in lettura compaiono picchi, si riapre con proof of work e segnalazione dei voti anomali.
- Database: ruolo della route solo `INSERT`, ruolo del job solo `DELETE` oltre i 12 mesi, ruolo dello script solo `SELECT`; `DATABASE_URL` solo nelle variabili di Vercel, mai nel repository.
- MCP: URL dell'endpoint fisso nel codice, sostituibile solo da una variabile d'ambiente per i test; `fetch` con timeout di 5 secondi, nessun ritentativo. Contro l'iniezione di istruzioni (un file del progetto che spinge il modello a mettere contenuti nel commento): l'utente vede e conferma il testo esatto che parte.

## Design

**Server MCP** (`packages/mcp`, rilascio 0.5.0)
- Tool `rate_agent` (`id`, `rating` 1–5, `comment` e `publish` facoltativi), assente con `--no-ratings`: conferma dell'utente con il riepilogo di ciò che parte, poi POST all'endpoint. Annotazioni `readOnlyHint: false`, `openWorldHint: true`.
- Conferma in due passi: `rate_agent` senza `code` restituisce l'anteprima (agente, voto, commento, pubblicazione, versione, avviso e link all'informativa) e un codice monouso valido 10 minuti, tenuto in memoria con il contenuto; con `code` invia esattamente quel contenuto. La descrizione del tool obbliga il modello a mostrare l'anteprima e chiedere il sì (tendina del client o `ask_user`) prima del secondo passo. `ponytail:` che la domanda venga fatta dipende dal modello; la conferma garantita dal server è quella del pannello.
- Dopo l'invio il tool restituisce il codice della valutazione (`usage_id`), da conservare per chiedere cancellazione o revoca del consenso alla pubblicazione.
- Proposta a fine lavoro: una riga nelle `instructions` del server e in `agentText`.
- Promemoria: il server ricorda quando ogni agente è stato caricato e se è stato votato; dopo 30 minuti la prossima risposta di un tool Agentrica aggiunge una riga che invita a proporre il voto, una volta per agente. `ponytail:` arriva solo se il modello chiama ancora un tool Agentrica; un server MCP non può interrompere la sessione.
- Pannello: accanto a ogni agente in «agenti in uso», stelle, commento e «Invia»; l'invio dal pannello vale come conferma.

**Sito** (`agentrica-site`)
- Route `POST /api/ratings` (Node runtime), tabella `ratings` (`id`, `usage_id` unico, `agent_id`, `rating`, `comment`, `publish_consent`, `mcp_version`, `created_at`), tabella `daily_salt` (giorno, sale casuale) e tabella `daily_votes` (giorno, hash dell'IP con il sale del giorno, agente; vincolo unico sui tre), svuotate a ogni cambio di giorno; job giornaliero di cancellazione, sezione delle note legali.

**Lettura** (questo repository)
- `npm run ratings`: media, numero di voti e commenti per agente e per versione, con il ruolo in sola lettura; calcolo in una funzione pura con test, come `npm run stats`.

## Proposte da confermare all'apertura

- Job di cancellazione: Vercel Cron giornaliero, oppure cancellazione a ogni inserimento.
- Base giuridica: legittimo interesse per voto e commento, consenso per la pubblicazione (casella); esito di F20-02.
- Cambio di giorno in UTC: sale e hash del giorno prima si cancellano al primo voto del giorno nuovo (nella stessa transazione), oppure con il job giornaliero.

## Backlog

| Id | Task | Priorità |
|---|---|---|
| F20-01 | Verifica: elicitation MCP in Claude Code (e negli altri client citati nel README) per la conferma dell'invio; esito e scelta nel piano | P0 |
| F20-02 | Privacy prima del codice: dati, base giuridica, informativa, fornitori (Neon UE, PRIV-PUB-01), conservazione; testi dell'avviso e delle note legali | P0 |
| F20-03 | Sito: database Neon, tabelle `ratings`, `daily_salt` e `daily_votes` con ruoli separati, route `POST /api/ratings` con validazione, limite di dimensione e un voto per agente per IP al giorno; test | P0 |
| F20-04 | Sito: job di cancellazione dopo 12 mesi; sezione delle note legali | P1 |
| F20-05 | MCP: tool `rate_agent` con conferma, invio con timeout, errori che non interrompono il lavoro; test con un endpoint finto | P0 |
| F20-06 | MCP: proposta a fine lavoro (`instructions`, `agentText`) e promemoria dopo 30 minuti, una volta per agente; test | P1 |
| F20-07 | Pannello: stelle, commento e invio accanto agli agenti in uso; test | P1 |
| F20-08 | Script `npm run ratings` con ruolo in sola lettura; calcolo puro con test | P1 |
| F20-09 | Documenti: README del pacchetto (IT ed EN) senza «non apre connessioni», con `--no-ratings` e con `--allow-net` per chi avvia con `--permission` (senza, l'invio fallisce con un messaggio chiaro); decisioni in `plan/README.md` (Server MCP, Monitoraggio, Privacy dei trasporti) | P1 |
| F20-10 | Revisioni: privacy sulle misure, cybersecurity sull'endpoint e sui segreti, Security e Code Reviewer sui diff | P0 |
| F20-12 | Presentazione dell'agente: nella cornice di `agentText` (non in `agents/`) l'agente dice nome in codice, ruolo e reparto all'inizio, quando passa a un altro agente o lascia il ruolo, e firma rilievi e riepilogo finale; nel pannello l'agente attivo (l'ultimo caricato) è evidenziato; test | P1 |
| F20-11 | Rilascio 0.5.0 (§13.8) e sito in `main`, dopo una prova reale di invio dal pacchetto pubblicato | P1 |

Ordine: F20-01/02 → conferma dell'utente → F20-03/04 → F20-05/06/07/12 → F20-08/09 → F20-10 → chiusura in `develop` → F20-11.

## Esito di F20-02 (privacy, ruoli nella sessione; non è una dichiarazione di conformità)

**Voce di registro (art. 30)**: titolare Giulio Simone Floresta; finalità: migliorare i file di ruolo degli agenti; interessati: utenti del server MCP che inviano un voto; dati: voto, commento facoltativo, consenso alla pubblicazione, versione, codice casuale della valutazione, data; per 24 ore l'hash dell'IP con sale giornaliero; basi: legittimo interesse (art. 6.1.f) per voto, commento e limite per IP, consenso (art. 6.1.a) per la pubblicazione in F21; destinatari: Vercel (hosting della route, senza DPA su Hobby) e Neon (database, Francoforte); conservazione: 12 mesi per le valutazioni, 1 giorno per sale e hash; misure: ruoli del database separati, nessun IP in chiaro, nessun commento nei log, segreti solo su Vercel.

**Bilanciamento del legittimo interesse**: invio volontario e confermato, dati minimi e non collegabili fra loro, nessuna profilazione; impatto basso per l'interessato; il commento libero è il rischio residuo (avviso prima dell'invio).

**Screening DPIA**: non necessaria (nessuna categoria particolare, nessuna profilazione né decisione automatizzata, scala ridotta, nessun dato di minori raccolto di proposito). Da rifare in F21 per la pubblicazione.

**Diritti**: con il codice della valutazione si chiede cancellazione o revoca della pubblicazione (issue o contatto privato, come nelle note legali); senza codice il voto non è riconducibile a una persona.

**Da verificare in F20-03**: DPA di Neon sul piano gratuito e copertura dei trasferimenti (Neon è di una società statunitense).

**Bozza dell'avviso** (anteprima del tool e pannello): «Stai per inviare ad Agentrica questa valutazione. Parte solo ciò che vedi qui: niente compito, codice o file del progetto. Non scrivere nel commento nomi, dati personali o parti del progetto. Informativa: https://agentrica.vercel.app/note-legali#valutazioni»

**Note legali da cambiare** (F20-04, `agentrica-site`): descrizione della pagina e introduzione («non raccoglie dati dai visitatori»); «non usa… moduli»; sezione «Il server MCP» («nessuna connessione di rete»: diventa «si collega ad Agentrica solo quando confermi una valutazione»); nuova sezione «Le valutazioni degli agenti» (`#valutazioni`) con i contenuti della voce di registro, il codice della valutazione per i diritti, il limite per IP e la casella di pubblicazione; PRIV-PUB-01 esteso alla route. Il commento `ponytail:` della pagina chiede una revisione legale quando arrivano moduli o un MCP remoto: resta un rilievo aperto da chiudere con un legale.

## Fatto

- **F20-01** L'elicitation non si usa. Claude Code 2.1.325 gestisce `elicitation/create` (modulo e URL; verificato nel binario installato), e l'SDK ha `elicitInput` e `getClientCapabilities`. Sono però segnalati rifiuti automatici senza dialogo nelle sessioni VS Code (claudeissues 79174) e nel terminale con la 2.1.144 (62319), e Claude Desktop non la supporta (41110). Un rifiuto automatico non si distingue dal no dell'utente, quindi la conferma passa ai due passi con codice (scelta dell'utente, 2026-11-17).
- **F20-02** Requisiti privacy sopra, accettati dall'utente il 2026-11-17; testi in bozza, da pubblicare in F20-04.
- **F20-03** Database Neon `agentrica-ratings` (Frankfurt, piano Free, Auth e Realtime spenti, senza branch per i deploy) collegato al progetto Vercel dall'utente il 2026-11-17; variabili del proprietario `DATABASE_*` Sensitive, non usate dal sito. `agentrica-site/db/001-ratings.sql`: tabelle `ratings`, `daily_salt`, `daily_votes`, funzioni SECURITY DEFINER `submit_rating` (doppione → `duplicate`, stesso IP e agente nel giorno → `limited`, poi l'inserimento) e `purge_ratings`; i tre ruoli creati con SQL (non dalla console, che darebbe `neon_superuser`) hanno solo `execute` sulla propria funzione o `select` su `ratings`. Provato su Postgres 17 (PGlite): esiti, vincoli, pulizia e permessi negati. Route `POST /api/ratings` (`src/lib/ratings.ts` con test: campi esatti, agente del catalogo, voto, commento, versione; 415, 413, 400, 201/409/429/500), IP da `x-real-ip` di Vercel solo per l'hash; nei log solo il tipo di errore. Prove locali con un database irraggiungibile: tutte le risposte attese, nessun header CORS. Variabili `RATINGS_WRITER_URL` e `RATINGS_PURGER_URL` (Sensitive) su Vercel; la stringa di `ratings_reader` resta all'utente. `@neondatabase/serverless` 1.2.0 esatta nel sito.
- **F20-04** Job `GET /api/ratings/purge` con `CRON_SECRET` (confronto a tempo costante, 401 senza) e `vercel.json` alle 3:00 UTC. Note legali: descrizione e introduzione, «moduli» tolto dall'elenco, sezione `#valutazioni` (dati, limite per IP, basi giuridiche, 12 mesi, Neon a Francoforte, Vercel senza DPA, codice della valutazione per i diritti), sezione «Il server MCP» con `--no-ratings`. `verify` e la spec e2e di pubblicazione verdi. Restano: DPA di Neon da verificare (controparte e trasferimenti) e revisione legale del testo.
- **Prova reale** (2026-11-17, deploy di anteprima di `agentrica-site` `44a02ea`, protetto da Vercel Authentication, raggiunto con il segreto di bypass): primo voto 201, stesso codice 409, stesso agente e rete con codice nuovo 429. Prima due 500: il trace di Next non includeva i `.md` di `agents/` letti dal catalogo mentre la route gira; corretto con `outputFileTracingIncludes` in `next.config.ts` (66 file nella funzione).
- **F20-05** `packages/mcp/src/ratings.ts`: anteprima con codice monouso (8 cifre esadecimali, 10 minuti, legato all'agente), invio dei soli campi di `Rating` con timeout di 5 secondi, un voto per agente per sessione, `usageId` casuale per agente e sessione; 409 vale come già registrato, 429, 400, 5xx e rete assente danno un messaggio senza segnare il voto. Tool `rate_agent` in `server.ts` (`readOnlyHint: false`, `openWorldHint: true`); dopo l'invio restituisce il codice della valutazione. URL fisso, `AGENTRICA_RATINGS_URL` solo per i test. Flag `--no-ratings`. Test: `ratings.test.ts` (fetch e orologio finti), `server.test.ts` (giro con il permission model senza rete: errore chiaro, il resto funziona; `--no-ratings`).
- **F20-06** Proposta a fine lavoro in `agentText` (solo con le valutazioni attive) e nelle `instructions`; promemoria dopo 30 minuti in coda alle risposte di `agente`, `elenca_agenti`, `open_panel` e `ask_user`, una volta per agente. Test in `ratings.test.ts` e `prompt.test.ts`.
- **F20-07** Pannello: sezione «Valuta gli agenti» con un modulo per agente usato (voti 1–5, commento, casella di pubblicazione, avviso), creato una volta sola perché l'aggiornamento non cancelli un commento a metà; rotta `POST /api/rate` con le difese di `/api/answer` e `parseRate`; il pannello non apre connessioni, invia tramite il server. Test in `panel.test.ts`, anche il giro pagina → server → endpoint finto con il payload esatto. Provato nel browser con Playwright a 1280 e 390 px (i voti vanno a capo su mobile).
- **F20-08** `npm run ratings` (`scripts/ratings.ts`): legge `ratings` con `DATABASE_URL_READONLY` (ruolo in sola lettura) tramite `@neondatabase/serverless` 1.2.0, devDependency esatta della root (scelta dell'utente, 2026-11-17; la 1.2.1 aveva 4 giorni); calcoli puri in `scripts/ratings-lib.ts` (media, distribuzione, versioni dalla più nuova, commenti dal più recente, agenti dalla media più bassa) con test. Senza la variabile si ferma con un messaggio. Lettura reale da fare quando il database esiste (F20-03).
- **F20-09** README del pacchetto (IT ed EN): «Cosa fa e cosa non fa» con l'unica connessione, sezione «Valutazioni», `rate_agent` fra i tool, `--allow-net` o `--no-ratings` con i permessi minimi, presentazione dell'agente, pannello. Descrizione in `package.json`. Decisioni «Server MCP», «Monitoraggio» e «Privacy dei trasporti» in `plan/README.md`. La voce «Versioni» si scrive al rilascio (F20-11).
- **F20-10** Revisioni di Code Reviewer, Security e Privacy nella sessione (sezione «Revisioni»), con due correzioni applicate e verificate.
- **F20-11** Sito in produzione prima del pacchetto (PR #4 di `agentrica-site`, CI verde): in produzione `POST /api/ratings` non valido → 400, job senza segreto → 401, note legali con «Le valutazioni degli agenti». Pacchetto: versione 0.5.0, PR #12 `develop` → `main` (`27fb6a2`), tag `v0.5.0`, pubblicazione dalla CI con provenance (run 44168689998, voce Sigstore 3952983130); `latest` su npm 0.5.0. Restano all'utente: registro MCP con `mcp-publisher`, e nel sito `@agentrica/mcp` 0.5.0 con la PR di Dependabot (con i comandi di `src/lib/scripts.ts`). Prima della chiusura in CI la fase F21, diventata la prima non completata, non aveva `## Backlog` e il test del pannello sul piano falliva: corretto in `fix/f21-backlog`.
- **F20-12** `introLine` e istruzione di presentazione nella cornice di `agentText`; nel pannello l'agente attivo ha il nome nel colore del reparto e l'etichetta «attivo», e ogni riga dice il reparto. Test in `prompt.test.ts`.

## Verifiche

- `npm run verify` verde in questo repository (65 test: unitari di valutazioni, prompt, pannello, server MCP con un client vero; script `ratings`); `npm pack --dry-run` con `ratings.js` e la pagina del pannello, versione 0.5.0.
- `agentrica-site`: `npm run verify` (typecheck, lint, test, build) verde; spec e2e di pubblicazione verde su computer e telefono; prove locali della route (415, 400, 413, 405, nessun CORS, 401 del job); prova reale sull'anteprima 201/409/429.
- Schema SQL provato su Postgres 17 (PGlite).
- Pannello provato nel browser a 1280 e 390 px.

## Revisioni (F20-10, ruoli nella sessione)

- **Code Reviewer — APPROVE** dopo una correzione: dal pannello il server preparava anche un codice d'anteprima mai usato, valido 10 minuti; ora il pannello usa `build` senza codice.
- **Security (software)** — una correzione: `AGENTRICA_RATINGS_URL` accettava qualsiasi indirizzo, quindi un `.mcp.json` di un progetto poteva dirottare le valutazioni; ora vale solo `http://127.0.0.1:porta/`. Verificati: SQL solo parametrico e fisso, nessun CORS, limiti di dimensione, confronto a tempo costante del segreto del job, nessun dato della richiesta nei log. Resta il rischio accettato delle credenziali del proprietario nella route.
- **Privacy (verifica delle misure)** — conformi ai requisiti di F20-02: nessun IP salvato (solo hash con sale giornaliero, cancellato in giornata), commento fuori dai log, cancellazione a 12 mesi (job solo in produzione, dove stanno i dati), avviso prima dell'invio, informativa `#valutazioni`, codice della valutazione per i diritti, `--no-ratings`. Aperti: DPA di Neon e revisione legale.

## Rilievi aperti

- (P2) DPA di Neon da verificare: controparte (Neon o Databricks) e copertura dei trasferimenti fuori dallo SEE; poi aggiornare F20-02 e le note legali se serve. Chiuso in F30 (**F30-03**): controparte Databricks, Inc., SCC 2021 e Data Privacy Framework, note legali aggiornate; copertura del piano gratuito non confermata, rischio accettato dall'utente il 2026-11-21.
- (P2) Note legali, sezione `#valutazioni`: testo non rivisto da un legale (come il resto della pagina, PRIV-PUB-01). Chiuso in F30 (F30-04): rischio accettato dall'utente il 2026-11-21, senza revisione legale; riaprire con i casi scritti in PRIV-PUB-01.
- (P3) Con F21 un modello manipolato da un file del progetto potrebbe mettere dati del progetto nel commento con `publish: true`: la moderazione di F21 deve tenerne conto (l'anteprima mostra il testo all'utente, ma la conferma dipende dal modello). Chiuso in F30 (F30-12): `npm run ratings -- --moderate` mostra ogni commento al titolare e chiede di rifiutare codice, percorsi, dettagli di un progetto o testo che sembra scritto da un file del progetto; nel dubbio si rifiuta (`scripts/ratings.ts`).
- (P3) Il pannello tiene le ultime 20 chiamate: un agente usato molto prima non compare più fra quelli da valutare nella pagina (resta `rate_agent`). Chiuso in F30 (F30-09): il pannello tiene anche l'ultima chiamata di ogni agente uscito dalle ultime 20.

- (P2) Route e job con le credenziali del proprietario del database (rischio accettato, Decisioni). Da rivedere in F20-10 con Security; per tornare al privilegio minimo servono le stringhe di `ratings_writer` e `ratings_purger` in variabili Sensitive. Chiuso in F30 (F30-02, P5, 2026-11-22): route e job con `ratings_writer` e `ratings_purger`, provati in produzione.
- (P3) Variabili `RATINGS_WRITER_URL` e `RATINGS_PURGER_URL` su Vercel non più usate: da cancellare. Chiuso in F30 (F30-02): le variabili tornano in uso, reimpostate dall'utente il 2026-11-21.

- `npm audit` (dipendenze di sviluppo): minimatch e tinyglobby moderati sotto typescript-eslint 8.72.2, la correzione porta a 8.73.0. Già presente prima di F20, fuori perimetro: P3, da un aggiornamento delle dipendenze. Chiuso in F29 (SEC09-F5-04, 2026-11-19): typescript-eslint 8.73.0 con minimatch ^11.0.1, deepmerge non è più nell'albero; `npm audit` a 0.

## Criteri di accettazione

- Un utente vota un agente dal terminale (con e senza pannello) e dal pannello; nulla parte senza la sua conferma, e vede il testo esatto prima dell'invio.
- Il payload contiene solo id agente, voto, commento, versione, id dell'utilizzo; nessun contenuto del progetto (test sul corpo della richiesta).
- Senza rete il tool risponde con un errore chiaro entro 5 secondi e il resto dell'MCP funziona; il server non scrive file.
- Lo stesso id di utilizzo non viene registrato due volte; un secondo voto allo stesso agente dallo stesso IP nello stesso giorno viene respinto con un messaggio chiaro; corpi non validi o troppo grandi vengono respinti.
- Nel database non c'è nessun IP in chiaro, e nessun sale o hash più vecchio di un giorno.
- La proposta del voto arriva al massimo una volta per agente per sessione; il promemoria dopo 30 minuti una volta sola.
- Le righe più vecchie di 12 mesi vengono cancellate; informativa pubblicata e linkata dalla conferma.
- `npm run ratings` mostra media e commenti per agente.
- Il testo di ogni agente chiede di presentarsi con nome in codice, ruolo e reparto all'inizio, ai cambi e nel riepilogo (test su `agentText`); il pannello evidenzia l'agente attivo.
- `npm run verify` verde qui; `verify` e `verify:e2e` verdi nel sito.
