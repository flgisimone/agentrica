AISA-10 · CASTOR — Senior DevOps / Infrastructure Engineer, reparto AISA (AI Software)

Nota sulla prova: come previsto, AISA-01 · SIRIUS e il tool library non sono stati caricati. Le schede `nodejs-calendario` e `typescript-7` non le ho lette, quindi quello che dico sulle versioni di Node viene dalle mie conoscenze e può essere superato. Ho lavorato in sola lettura, senza avviare processi e senza eseguire test. La copia non è un repository git: lo stato Git non è verificabile.

Perimetro esaminato: `.github/workflows/ci.yml`, `.github/workflows/preview.yml`, `Dockerfile`, `deploy/deploy.sh`, `deploy/rollback.sh` e `deploy/docker-compose.prod.yml`. Per il contesto ho letto anche `package.json`, `db/migrate.js`, `db/migrations/*`, `server/app.js` e `server/db.js`.

## P0: da segnalare subito

**CASTOR-01 · P0 · `.github/workflows/preview.yml` righe 4-23.** Il workflow usa `pull_request_target` e fa checkout di `github.event.pull_request.head.sha` (riga 14). Poi esegue codice della PR (`npm ci && npm test`, riga 18) con `secrets.STAGING_DATABASE_URL` nell'ambiente, e `./deploy/preview.sh` con `secrets.PREVIEW_TOKEN`. Il commento della riga 3 conferma che girano anche le PR da fork esterni. Chiunque apra una PR può quindi eseguire codice arbitrario e portarsi via i segreti, compresi gli script `postinstall` di `npm ci`. Manca anche il blocco `permissions:`, quindi il `GITHUB_TOKEN` ha i permessi predefiniti del repository, forse anche in scrittura.
Proposta: passare a `pull_request` senza segreti, oppure separare la build non fidata dal deploy con `workflow_run` o con un environment che richiede approvazione. Aggiungere `permissions: contents: read`. Ruotare `STAGING_DATABASE_URL` e `PREVIEW_TOKEN`, perché vanno considerati esposti.

**CASTOR-02 · P0 · `.github/workflows/ci.yml` righe 39-53.** Il job `build` scrive `PROD_DATABASE_URL` e `PAYMENTS_WEBHOOK_SECRET` in chiaro in `.env` (righe 41-42). Poi lo carica come artifact `build-${sha}` (righe 48-53). Chiunque abbia accesso in lettura al repository o alle Actions può scaricare le credenziali del database di produzione e il segreto HMAC dei webhook di pagamento. Con quel segreto si possono firmare webhook `payment.succeeded` falsi e segnare come pagati ordini che non lo sono. Il `.env` non serve nemmeno alla build: il `Dockerfile` non lo copia, e la produzione legge `/etc/magazzino/app.env` (compose, riga 4).
Proposta: togliere lo step e il file dall'artifact. Ruotare subito i due segreti ed eliminare gli artifact già caricati.

## P1

**CASTOR-03 · P1 · `ci.yml` righe 31-36 e 55-58.** `build` non ha `needs: test` e `deploy` dipende solo da `build`. Un push su `main` con test o lint rossi viene comunque costruito, pubblicato come `:latest` e mandato in produzione.

**CASTOR-04 · P1 · `deploy/deploy.sh` riga 8.** `StrictHostKeyChecking=yes` è giusto, ma nessuno step popola `known_hosts` sul runner. Il deploy fallisce sempre con "Host key verification failed". Va aggiunto un `known_hosts` con l'impronta fissa, preso da un secret o da una variabile, mantenendo la verifica attiva.

**CASTOR-05 · P1 · Rollback non funzionante (`deploy/rollback.sh` riga 5).**
- Punta al tag `:previous`, che la CI non produce mai (`ci.yml` riga 46 crea solo `latest` e `sha`).
- Usa `ssh` senza chiave né `known_hosts`.
- Non tocca lo schema del database: `004_stock.down.sql` esiste, ma nessuno lo applica (`db/migrate.js` riga 9 scarta i `.down.sql`).

Tornare all'immagine precedente dopo la 004 la lascerebbe su uno schema in cui la colonna `qty` non esiste più.
Proposta: rollback per digest o sha (`docker service rollback` oppure `--image ...:<sha>`) e una procedura documentata per lo schema.

**CASTOR-06 · P1 · `Dockerfile` riga 17 e compose righe 6-9.** Le migrazioni girano nel `CMD` di ogni replica. Con 2 repliche e `order: start-first` più processi possono applicare le migrazioni insieme. `db/migrate.js` non ha lock (righe 10-15, per esempio con `pg_advisory_lock`) e non usa transazioni: migrazione e `INSERT` in `schema_migrations` sono separate, quindi può succedere di applicarne una due volte o di lasciarla a metà. Inoltre `main()` (riga 20) non ha `.catch`: in caso di errore `pool.end()` non viene chiamato.
Proposta: un job di migrazione unico prima dell'aggiornamento del servizio, con lock e transazione.

**CASTOR-07 · P1 · Migrazioni non compatibili con il rolling update.**
- `004_stock.sql` riga 2 rinomina `qty` in `stock`. Con `start-first` la nuova replica migra e la vecchia, ancora in servizio, continua a usare `qty`. Gli errori 500 durano per tutta la sovrapposizione. Serve il pattern expand/contract: aggiungere la colonna, scrivere su entrambe, poi togliere la vecchia.
- `003_sku.sql` riga 2 aggiunge `ADD COLUMN sku text NOT NULL` senza default su una tabella con circa 12.000 righe. Fallisce, il container esce e il servizio entra in un ciclo di riavvii.

Il modello dei dati è di competenza del Database Engineer: lo segnalo per l'effetto sul rilascio.

## P2

**CASTOR-08 · P2 · `deploy/docker-compose.prod.yml` riga 3 e `ci.yml` righe 46-47.** Il deploy usa `:latest`, non lo `sha` appena costruito. Due push ravvicinati possono quindi mandare in produzione un'immagine diversa da quella del run. Inoltre non resta traccia di quale versione è in esercizio. Manca anche un gruppo `concurrency` sul job `deploy`.

**CASTOR-09 · P2 · Il compose versionato non è quello usato.** `deploy.sh` riga 9 usa `/srv/magazzino/docker-compose.prod.yml` sul server, non `deploy/docker-compose.prod.yml` del repository. Le due configurazioni possono divergere senza che nessuno se ne accorga.

**CASTOR-10 · P2 · Controllo di salute (`docker-compose.prod.yml` righe 10-13).**
- Interroga `/`, cioè l'`index.html` statico (`server/app.js` riga 8). Risponde 200 anche con il database irraggiungibile.
- Manca `start_period`: con le migrazioni all'avvio, la replica può essere segnata come non sana prima di partire.
- Il server non ha un endpoint di salute (`/healthz` con `SELECT 1`).

**CASTOR-11 · P2 · `update_config` (`docker-compose.prod.yml` righe 7-9).** Mancano `failure_action: rollback`, `monitor` e `rollback_config`. Un aggiornamento difettoso non si ferma e non torna indietro da solo.

**CASTOR-12 · P2 · Arresto non pulito (`server/app.js` riga 20).** Non c'è gestione di `SIGTERM`: nessun `server.close()` e nessun `pool.end()`. In più `sh -c` (`Dockerfile` riga 17) resta PID 1 e potrebbe non inoltrare il segnale. A ogni aggiornamento si perdono le richieste in corso, compresi i webhook di pagamento, che però il fornitore ritenta.
Proposta: `exec node server/app.js` oppure `init: true`, più la gestione del segnale.

**CASTOR-13 · P2 · `ci.yml` righe 14-29.**
- Il servizio `postgres` non ha `options: --health-cmd pg_isready ...`, quindi la migrazione della riga 28 può partire prima che il database sia pronto e la CI diventa instabile.
- `DATABASE_URL` è passato solo allo step `migrate`, non a `npm test` (riga 29): i test che usano il database non lo trovano.

**CASTOR-14 · P2 · Dati nell'immagine (`Dockerfile` riga 13).** `COPY data ./data` mette nell'immagine il listino (circa 30 MB secondo il README), che però un job esterno aggiorna ogni giorno. In produzione il listino è vecchio fino al build successivo, e ogni immagine pesa 30 MB in più. Meglio un volume o una fonte esterna.

**CASTOR-15 · P2 · Versioni (`Dockerfile` righe 1 e 6, `ci.yml` righe 24 e `preview.yml` riga 17).** Node è fissato a `22.11.0` e Alpine a `3.20`, senza un meccanismo di aggiornamento come Dependabot o Renovate. Restano fuori le patch di sicurezza uscite dopo. Non ho potuto leggere la scheda `nodejs-calendario`: va verificato lì l'ultimo patch della 22 e la sua finestra di supporto.

**CASTOR-16 · P2 · `deploy/preview.sh` non esiste.** È richiamato in `preview.yml` riga 21, quindi il workflow fallisce comunque. Il fallimento arriva però dopo l'esecuzione del codice non fidato, quindi CASTOR-01 resta valido.

## P3

**CASTOR-17 · P3 · Manca `.dockerignore`.** I `COPY` sono selettivi, ma il contesto di build include `.env` (creato nella riga 41 di `ci.yml`) e viene inviato al daemon.

**CASTOR-18 · P3 · `ci.yml` riga 45.** Il login viene fatto a mano con `echo` del token. Si può sostituire con `docker/login-action` fissato a uno sha. Inoltre l'immagine pubblicata non è quella su cui girano i test e manca una scansione delle vulnerabilità.

**CASTOR-19 · P3 · Osservabilità.** I log sono solo `json-file` locali, per nodo (compose righe 14-18), e in formato `console.error` non strutturato. Mancano metriche, allarmi e tracciamento delle richieste. Non risulta nemmeno un backup del database né una procedura di ripristino.

**Nota fuori perimetro, per il Backend o il Performance Engineer.** `server/routes/reports.js` riga 9 crea un nuovo `Pool` a ogni richiesta e non lo chiude mai. Così si esauriscono le connessioni di Postgres, aggravate dal pool da 20 per replica in `server/db.js` riga 3.

## Riepilogo (CASTOR)

- **Sintesi:** 2 rilievi P0 sui segreti (preview da fork con segreti, `.env` di produzione caricato come artifact), da trattare subito con la rotazione delle credenziali. 5 rilievi P1 rendono deploy e rollback inaffidabili o rotti: deploy senza test, SSH che fallisce sempre, rollback verso un tag inesistente, migrazioni concorrenti e non compatibili con il rolling update. Seguono 9 rilievi P2 e 3 P3.
- **File modificati:** nessuno.
- **Test eseguiti:** nessuno. L'analisi è statica.
- **Limiti:** non ho visto il compose usato sul server, lo script `preview.sh` (assente), le impostazioni del repository GitHub (permessi predefiniti del token, protezione dell'environment `production`) né le schede della biblioteca.
- **Riesame:** lavoro sulla stessa classe di modello della sessione, quindi non lo richiedo per regola. Consiglio comunque che AISA-01 o un revisore confermino i P0 e i P1 prima di aprire le correzioni.
- **Attività residue:** l'ordine, la rotazione dei segreti e le correzioni vanno decisi dall'utente.
