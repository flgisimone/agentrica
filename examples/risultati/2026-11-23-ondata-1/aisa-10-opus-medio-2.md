AISA-10 · CASTOR — Senior DevOps / Infrastructure Engineer, reparto AISA (AI Software)

**Prova interna (F37).** Come da istruzioni, non ho caricato AISA-01 · SIRIUS né il tool library. Ho lavorato in sola lettura sulla copia `<cartella di prova>/copie/aisa-10-opus-medio-2`. Non ho modificato file, avviato processi o usato la rete. La copia non è un repository git, quindi non ho potuto leggere lo stato Git. Non c'è un CLAUDE.md e non ci sono test.

**Cosa ho letto:** README.md, package.json, package-lock.json, Dockerfile, .github/workflows/ci.yml, .github/workflows/preview.yml, deploy/deploy.sh, deploy/docker-compose.prod.yml, deploy/rollback.sh, db/migrate.js, db/migrations/*, server/app.js, server/db.js, server/auth.js e server/routes/webhooks.js. Gli ultimi tre file del server li ho letti solo per capire i controlli di salute e i segreti.

**Due rilievi P0 da segnalare subito all'utente:** il punto 1 (esecuzione di codice dai fork con i segreti) e il punto 2 (segreti di produzione in un artifact scaricabile).

## Rilievi

### 1. P0 — `pull_request_target` esegue il codice delle PR dei fork con i segreti
- **Dove:** `.github/workflows/preview.yml` righe 4-5, 12-14, 18-23.
- **Problema:** l'evento `pull_request_target` gira nel contesto del repository base, quindi con i segreti. Il checkout prende però `github.event.pull_request.head.sha`, cioè il codice del fork. Poi vengono eseguiti:
  - `npm ci && npm test`: gli script npm, i test e le dipendenze li controlla l'autore della PR, che riceve `STAGING_DATABASE_URL`;
  - `./deploy/preview.sh` con `PREVIEW_TOKEN`. Questo file non esiste nel repository (in `deploy/` ci sono solo deploy.sh, docker-compose.prod.yml e rollback.sh), quindi lo fornisce la PR stessa.
- **Aggravante:** manca un blocco `permissions:`, quindi il `GITHUB_TOKEN` ha i permessi predefiniti del repository, che possono includere la scrittura.
- **Effetto:** chiunque apra una PR da un fork può esfiltrare le credenziali dello staging e il token di anteprima, e forse scrivere nel repository.
- **Direzione:**
  - usare `pull_request`, senza segreti, per build e test;
  - pubblicare l'anteprima in un workflow separato (`workflow_run` o un'etichetta messa da un maintainer), che non esegue il codice della PR;
  - impostare `permissions: {}`, o i permessi minimi, a livello di workflow;
  - ruotare subito `STAGING_DATABASE_URL` e `PREVIEW_TOKEN` se il workflow ha già girato su PR esterne.

### 2. P0 — Segreti di produzione scritti in `.env` e caricati come artifact
- **Dove:** `.github/workflows/ci.yml` righe 39-42 e 48-53.
- **Problema:** il job `build` scrive `PROD_DATABASE_URL` e `PAYMENTS_WEBHOOK_SECRET` in `.env` e poi lo carica con `actions/upload-artifact`.
  - Gli artifact li scarica chiunque abbia accesso in lettura al repository: in un repository pubblico, qualunque utente GitHub autenticato.
  - Restano conservati per il periodo predefinito, di solito 90 giorni.
  - GitHub maschera i segreti solo nei log, non nel contenuto degli artifact.
- **`.env` non serve a niente:**
  - il Dockerfile non lo copia;
  - il server usa `/etc/magazzino/app.env` (`deploy/docker-compose.prod.yml:4`);
  - nessun job scarica l'artifact.
- **Problema collegato:** non c'è un `.dockerignore`, quindi `.env` finisce anche nel contesto di build mandato al daemon Docker (P3 da solo).
- **Direzione:**
  - togliere i passi alle righe 39-42 e il file `.env` dall'artifact;
  - cancellare gli artifact `build-*` già creati;
  - ruotare la password del database di produzione e il segreto del webhook;
  - aggiungere un `.dockerignore` (`.env`, `.git`, `node_modules`).

### 3. P1 — Build e deploy partono anche con i test falliti
- **Dove:** `.github/workflows/ci.yml` righe 31-33.
- **Problema:** il job `build` non ha `needs: test`. Con un push su `main` build e push dell'immagine partono in parallelo ai test, e `deploy` dipende solo da `build` (riga 58). Un commit rosso arriva in produzione.
- **Problema collegato:** `:latest` viene pubblicato (righe 46-47) prima dell'approvazione dell'environment `production` (riga 59). Qualunque riavvio o ripianificazione di un task Swarm può quindi prendere l'immagine nuova prima dell'ok.
- **Direzione:** aggiungere `needs: test` a `build`. Pubblicare i tag mobili (`latest`) solo dopo un deploy riuscito, oppure non usarli affatto (vedi punto 4).

### 4. P1 — Rilascio su `:latest`: niente versioni immutabili e compose del server fuori controllo
- **Dove:** `deploy/docker-compose.prod.yml:3`, `deploy/deploy.sh:8-9`.
- **Problema:** il servizio usa `ghcr.io/.../magazzino:latest`. Il deploy non è legato a `github.sha`, quindi due pipeline ravvicinate possono rilasciare la versione sbagliata e non si sa con certezza quale versione gira.
- **Problema collegato:** `deploy.sh` applica `/srv/magazzino/docker-compose.prod.yml`, che sta sul server, non il file del repository. Le modifiche a `deploy/docker-compose.prod.yml` non arrivano in produzione e il file versionato può divergere da quello reale.
- **Direzione:**
  - rilasciare per digest o per tag `${{ github.sha }}`, passato a `deploy.sh`;
  - mandare il compose del repository al server, oppure generarlo, invece di affidarsi a una copia locale;
  - aggiungere `concurrency: { group: deploy-production, cancel-in-progress: false }` al job `deploy` (P2 da solo).

### 5. P1 — Il rollback non funziona
- **Dove:** `deploy/rollback.sh:4-5`, `.github/workflows/ci.yml:46-47`, `db/migrate.js:9`, `db/migrations/004_stock.sql`, `db/migrations/004_stock.down.sql`.
- **Il tag `:previous` non esiste.** La CI pubblica solo `latest` e lo SHA, nessuno crea `previous`, quindi `docker service update --image ...:previous` fallisce.
- **Manca la chiave SSH.** `ssh` è lanciato senza `-i` e senza `DEPLOY_SSH_KEY`. Lo script non è collegato a nessun workflow e funziona solo da una macchina che ha già accesso.
- **Il database non torna indietro.** Il rollback ripristina solo l'immagine. La 004 rinomina `qty` in `stock`, e la versione precedente (prima della 3.2.0, secondo il commento della 004) usa `qty`: dopo la migrazione, un rollback dell'immagine rompe l'app. Esiste `004_stock.down.sql`, ma `migrate.js` lo esclude (riga 9) e non c'è un comando di discesa.
- **Direzione:**
  - rollback per SHA o digest noto, oppure `docker service rollback magazzino_app`, con la stessa gestione della chiave di `deploy.sh`;
  - migrazioni compatibili all'indietro (expand/contract: aggiungere `stock`, scrivere su entrambe le colonne, togliere `qty` in un rilascio successivo);
  - una procedura documentata per le migrazioni di discesa.

### 6. P1 — Migrazioni all'avvio del container: concorrenza, niente transazione, rottura durante l'aggiornamento
- **Dove:** `Dockerfile:17`, `db/migrate.js:10-15`, `deploy/docker-compose.prod.yml:6-9`.
- **Esecuzione concorrente.** Ogni replica esegue `npm run migrate` all'avvio. Le repliche sono 2, ma con `parallelism: 1` e i riavvii dopo un errore più task possono migrare insieme. Non c'è un lock (es. `pg_advisory_lock`).
- **Applicazioni parziali.** Ogni file viene eseguito senza `BEGIN/COMMIT` e l'insert in `schema_migrations` è separato (righe 13-14). Un errore a metà lascia la migrazione applicata in parte e non registrata.
- **Rottura durante l'aggiornamento.** Con `order: start-first` la replica nuova rinomina la colonna mentre la vecchia, che usa `qty`, serve ancora traffico: errori per tutta la durata dell'aggiornamento.
- **Errori non gestiti.** `main()` non ha un `catch` e non chiude il pool se qualcosa fallisce.
- **Direzione:** migrazioni in un passo separato del deploy, eseguito una volta sola prima dell'aggiornamento del servizio. Ogni migrazione in una transazione, con un lock consultivo. Schema compatibile con le due versioni durante il rolling update.

### 7. P1 — Il deploy fallisce per la verifica della chiave dell'host
- **Dove:** `deploy/deploy.sh:8`.
- **Problema:** `StrictHostKeyChecking=yes` è corretto, ma nessun passo prepara `known_hosts` sul runner. Il runner GitHub non conosce `magazzino.ortofrutta-emilia.example`, quindi `ssh` dovrebbe fermarsi con «Host key verification failed». È una deduzione dalla configurazione: non l'ho eseguito.
- **Direzione:** salvare l'impronta dell'host in un secret o una variabile e scriverla in un file `known_hosts` temporaneo, passato con `-o UserKnownHostsFile=`. Non passare a `StrictHostKeyChecking=no`.

### 8. P2 — Il controllo di salute non verifica l'applicazione e non c'è rollback automatico
- **Dove:** `deploy/docker-compose.prod.yml:6-13`, `server/app.js:8`.
- **Problema:** il healthcheck chiama `/`, cioè `web/index.html` servito da `express.static`. Risulta sano anche se il database non risponde o le API falliscono. Per esempio, se manca `PAYMENTS_WEBHOOK_SECRET`, `createHmac` lancia un errore a ogni webhook (`server/routes/webhooks.js:8`) senza che il controllo se ne accorga.
- **Mancano anche:**
  - `start_period`, perché le migrazioni girano all'avvio;
  - `update_config.failure_action: rollback` e `monitor`;
  - `rollback_config`.
- **Direzione:**
  - un endpoint `/healthz` che faccia `SELECT 1` sul pool;
  - un controllo all'avvio delle variabili obbligatorie, con uscita immediata se mancano;
  - `failure_action: rollback`.

### 9. P2 — Il gate della CI è vuoto o rotto
- **Dove:** `.github/workflows/ci.yml:14-29`, `package.json:9-10`.
- **Test.** Nel progetto non ci sono file di test. `node --test` probabilmente termina con successo senza eseguire nulla (non verificato).
- **Lint.** ESLint 9 richiede `eslint.config.js`, che manca. `npm run lint` dovrebbe fallire sempre (non eseguito).
- **Postgres nella CI.** Il servizio non ha `options: --health-cmd pg_isready ...`, quindi la migrazione può partire prima che il database sia pronto (instabile). Inoltre `npm test` non riceve `DATABASE_URL`.
- **Migrazioni provate su database vuoto.** Questo non intercetta errori come `003_sku.sql`, che aggiunge `sku text NOT NULL` senza default: su una tabella con circa 12.000 prodotti fallisce, a meno che sia già stata applicata.

### 10. P2 — Lockfile incompleto e senza integrità
- **Dove:** `package-lock.json:18-30`.
- **Problema:** mancano le dipendenze transitive di express e pg e i campi `integrity`. `npm ci` non garantisce build riproducibili né verifica dei pacchetti. A seconda della versione di npm può fallire o installare un albero diverso (non verificato).
- **Direzione:** rigenerarlo con `npm install` e versionarlo completo.

### 11. P2 — Listino nell'immagine
- **Dove:** `Dockerfile:13`, README riga 21.
- **Problema:** `data/listino.json` (circa 30 MB secondo il README) viene copiato nell'immagine, ma un job esterno lo aggiorna ogni giorno. In produzione resta il listino del giorno della build, e ogni immagine cresce di 30 MB.
- **Direzione:** montarlo come volume o configurazione e toglierlo dalla `COPY`.

### 12. P2 — Arresto non pulito durante gli aggiornamenti
- **Dove:** `Dockerfile:17`, `server/app.js:20`.
- **Problema:** con `sh -c "npm run migrate && node ..."` il processo 1 è `sh`, che non inoltra SIGTERM a node. In più l'app non gestisce SIGTERM, cioè non chiude il server e il pool. Swarm la uccide dopo il timeout e le richieste in corso cadono, webhook di pagamento compresi (il fornitore ritenta, ma intanto si generano 5xx).
- **Direzione:** `CMD ["node", "server/app.js"]` con le migrazioni separate (punto 6), oppure `exec node ...`. Aggiungere un gestore di SIGTERM con `server.close()` e `pool.end()`.

### 13. P2 — Nessun backup prima delle migrazioni
- **Dove:** deploy (`deploy/`, `ci.yml:55-64`).
- **Problema:** non c'è una procedura di backup del database prima delle migrazioni né una procedura di ripristino documentata. Con migrazioni non transazionali (punto 6) un errore non si recupera.

### 14. P2 — Immagine base vecchia e senza digest
- **Dove:** `Dockerfile:1,6`, `ci.yml:24`, `preview.yml:17`.
- **Problema:** `node:22.11.0-alpine3.20` è una patch vecchia di Node 22, senza digest. Mancano gli aggiornamenti di sicurezza successivi.
- **Avvertenza:** la scheda `nodejs-calendario` non era disponibile in questa prova. Supporto di v22 e ultima patch vanno verificati sulla fonte ufficiale (nodejs.org) prima di decidere. Le mie conoscenze potrebbero essere superate.
- **Direzione:** aggiornare all'ultima patch supportata e fissarla per digest, allineata fra Dockerfile e CI.

### 15. P3 — Segreto interpolato nello script
- **Dove:** `ci.yml:45`.
- **Problema:** `echo "${{ secrets.GITHUB_TOKEN }}"` mette il valore direttamente nello script.
- **Direzione:** passarlo come `env:` (es. `REGISTRY_TOKEN`) o usare `docker/login-action`. La stessa cosa vale per `github.actor`.

### 16. P3 — Osservabilità minima
- **Dove:** `server/app.js:15-17`, `deploy/docker-compose.prod.yml:14-18`.
- **Problema:** i log sono solo `console.error` non strutturati, senza ID di richiesta, metriche, allarmi o invio a un sistema centrale. I log `json-file` restano sul nodo, con un massimo di 250 MB per container.
- **Direzione:** log JSON con ID di richiesta, invio centralizzato e allarmi almeno sugli errori 5xx e sui webhook falliti.

### 17. P3 — Immagine non verificata
- **Dove:** `ci.yml:43-47`.
- **Problema:** non c'è scansione delle vulnerabilità né provenienza o firma dell'immagine.

## Riepilogo
- **Sintesi:** 17 rilievi (2 P0, 5 P1, 7 P2, 3 P3).
  - Gli urgenti: segreti esposti nell'anteprima delle PR da fork e nell'artifact `.env`. Vanno ruotati e i workflow corretti.
  - Il rilascio va in produzione anche con test rossi, su un tag mobile, con un rollback che non funziona e migrazioni non sicure durante il rolling update.
- **File modificati:** nessuno (sola lettura).
- **Test eseguiti:** nessuno. Lint, test, `ssh` e `npm ci` non li ho eseguiti, quindi le conclusioni dei punti 7, 9 e 10 sono deduzioni dalla configurazione.
- **Limiti:** niente direttore, niente biblioteca, niente rete. Le nozioni datate (versioni di Node, comportamento di ESLint 9 e di npm) non sono verificate su fonte e possono essere superate.
- **Attività residue proposte:**
  1. ruotare i segreti e cancellare gli artifact (punti 1 e 2);
  2. aggiungere `needs: test` e passare a tag immutabili (punti 3 e 4);
  3. separare le migrazioni con lock e transazione e rifare il rollback (punti 5 e 6);
  4. configurare `known_hosts`, `/healthz` e `failure_action` (punti 7 e 8);
  5. sistemare il gate della CI e il lockfile (punti 9 e 10).

  Tutto da confermare con l'utente prima di implementare. Deploy e rotazione in produzione richiedono la sua approvazione esplicita.

— AISA-10 · CASTOR
