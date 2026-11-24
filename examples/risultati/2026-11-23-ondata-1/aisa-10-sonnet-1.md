AISA-10 · CASTOR — Senior DevOps / Infrastructure Engineer, reparto AISA (AI Software)

Rapporto in sola lettura su CI/CD, immagine e deploy. Ho letto `.github/workflows/ci.yml`, `.github/workflows/preview.yml`, `Dockerfile`, `deploy/*`, `package.json`, `db/migrate.js` e `server/app.js`. Non ho eseguito comandi e non ho modificato nulla. Il file `.dockerignore` non esiste. Non ho consultato la biblioteca (tool non disponibile in questa prova). Le schede del ruolo riguardano TypeScript 7 e il calendario Node.js, che qui non incidono sui rilievi.

Nota di verifica: `data/listino.json` nella copia pesa 2 KB, mentre il README parla di circa 30 MB. Il rilievo sul listino nell'immagine si basa quindi sul README.

## Rilievi

**P0 — `ci.yml` righe 39-42 e 48-53: segreti di produzione scritti in `.env` e pubblicati come artifact**
- Il job `build` scrive `PROD_DATABASE_URL` e `PAYMENTS_WEBHOOK_SECRET` in `.env`. Poi `upload-artifact` carica `.env` e `deploy/` in chiaro.
- Gli artifact sono scaricabili da chiunque possa leggere il repository, quindi un lettore ottiene le credenziali del database di produzione e il segreto del webhook dei pagamenti.
- Con `COPY server ./server`, `COPY web`, `COPY db`, `COPY data` (righe 10-13 del `Dockerfile`) `.env` non finisce nell'immagine. Il rischio resta l'artifact.
- Anche l'interpolazione `${{ secrets.X }}` dentro `run` espone il valore nel comando della shell.
- Azione: ruotare subito `PROD_DATABASE_URL` e `PAYMENTS_WEBHOOK_SECRET`, perché vanno considerati compromessi.
- Poi eliminare il passo e togliere `.env` dall'artifact. I segreti devono arrivare a runtime da `/etc/magazzino/app.env`, che il compose già usa.

**P0 — `preview.yml` righe 5-23: `pull_request_target` esegue codice della PR con segreti**
- Il workflow fa il checkout di `head.sha`, cioè del codice del fork. Poi lancia `npm ci && npm test` con `STAGING_DATABASE_URL` e `./deploy/preview.sh` con `PREVIEW_TOKEN`.
- Chiunque apra una PR può mettere uno script `postinstall` o un test che legge e invia i segreti. Il commento alla riga 3 dice che gira anche per fork di collaboratori esterni.
- Manca `permissions:` esplicito, quindi il `GITHUB_TOKEN` può avere permessi ampi, a seconda dell'impostazione di default del repository.
- Azione: usare `pull_request` senza segreti, oppure richiedere un'approvazione prima dell'esecuzione tramite un environment protetto, e non fare mai il checkout del codice del fork in questo contesto.
- Azione: ruotare `STAGING_DATABASE_URL` e `PREVIEW_TOKEN` se il workflow è già stato attivo.

**P1 — `preview.yml` riga 21: `deploy/preview.sh` non esiste**
- Nella cartella `deploy/` ci sono solo `deploy.sh`, `rollback.sh` e il compose. Il passo fallisce sempre; con un fork il checkout della PR potrebbe invece fornire lo script, cioè codice scelto dall'autore della PR.
- `${{ github.event.pull_request.number }}` è numerico, quindi l'iniezione è improbabile.

**P1 — `preview.yml` riga 20: i test usano il database di staging**
- `npm test` con `STAGING_DATABASE_URL` può alterare dati di staging. Nel job `test` di `ci.yml` i test usano invece un Postgres di servizio.

**P1 — `Dockerfile` riga 17 e `deploy/docker-compose.prod.yml` righe 5-9: migrazioni all'avvio con due repliche, senza protezione**
- Ogni replica, a ogni avvio, esegue `npm run migrate` prima del server.
- `db/migrate.js` (righe 10-15) non usa un lock (`pg_advisory_lock`) e non avvolge migrazione e `INSERT` in una transazione.
- Due repliche (anche con `start-first`) possono applicare la stessa migrazione in parallelo, con errori o doppia applicazione.
- Una migrazione fallita a metà, senza transazione, lascia lo schema in stato incoerente. Il container esce con errore e, se la CI ha già pubblicato `latest`, il rilascio è bloccato.
- La migrazione gira anche durante un rollback dell'immagine. Con una migrazione già applicata e senza controllo di compatibilità, una versione vecchia può trovarsi su uno schema nuovo.
- Azione: separare la migrazione dall'avvio (job dedicato prima del deploy) e aggiungere lock e transazione.
- Nota: `main()` in `migrate.js` non gestisce il rifiuto della promessa, quindi un errore può non dare un exit code non zero chiaro. Va verificato.

**P1 — `deploy/rollback.sh` riga 5 e `deploy/docker-compose.prod.yml` riga 3: rollback non affidabile**
- Il rollback punta al tag `:previous`. La CI pubblica solo `:latest` e `:${{ github.sha }}` (`ci.yml` riga 46): nessun passo crea o sposta `:previous`.
- Il rollback fallisce, oppure riporta a una versione imprecisa, e il tag mobile non è tracciabile.
- Il compose di produzione usa `:latest`, che è mutabile: nessun rilascio è riproducibile e non si sa quale versione giri.
- Azione: distribuire per `sha` o per versione, e fare il rollback sull'ultimo `sha` noto buono.
- Il rollback non considera le migrazioni del database: `004_stock.down.sql` esiste, ma `migrate.js` ignora i file `.down.sql`, quindi non c'è un percorso di annullamento dello schema.
- `rollback.sh` non usa chiave né `StrictHostKeyChecking`, a differenza di `deploy.sh`: dipende da un agente SSH o da una chiave già presente sulla macchina.
- Lo script non è collegato alla CI: nessun rollback automatico o manuale tracciato.

**P1 — `deploy/docker-compose.prod.yml` righe 10-13: controllo di salute inadeguato**
- Il `healthcheck` fa `wget` su `/`, che serve la pagina statica. Non verifica database né applicazione (non c'è un endpoint di salute in `server/app.js`).
- Non ha `start_period` né `timeout`. Se la migrazione dura più di 45 secondi (15 s × 3), il container viene marcato non sano durante l'avvio e riavviato.
- Mancano `update_config.failure_action: rollback` e `monitor`. Con `order: start-first` il deploy considera la nuova replica pronta senza verificare davvero la salute, e un deploy fallito non torna indietro da solo.
- Mancano `rollback_config`, limiti di risorse, `restart_policy` e `stop_grace_period`.

**P2 — `ci.yml` righe 12-29 e 31-33: nessun legame fra test e build**
- Il job `build` non ha `needs: test`. Su `main` si costruisce e si pubblica `latest` anche se i test falliscono: i due job partono in parallelo, e `deploy` dipende solo da `build`.
- Un commit con test rotti può quindi andare in produzione.

**P2 — `ci.yml` riga 34-36 e 45-47: pubblicazione senza controlli sull'immagine**
- `docker build` con `docker login` a mano, senza buildx, cache o attestazione. Nessuna scansione delle vulnerabilità (trivy/grype) né SBOM, né firma dell'immagine.
- `docker push --all-tags` pubblica anche `latest` prima di qualsiasi verifica.
- L'immagine non viene provata (nessun avvio di prova né controllo di salute) prima della pubblicazione.

**P2 — `ci.yml` righe 55-64 e `deploy/deploy.sh`: deploy poco controllato**
- Il job `deploy` usa `environment: production` (bene: consente approvazione), ma non ha `concurrency` per evitare deploy sovrapposti. Non c'è un passo di verifica dopo il deploy (smoke test) né notifiche.
- `deploy.sh` riga 6: la chiave privata passa da variabile d'ambiente a un file temporaneo, con `trap` per la pulizia: accettabile. `StrictHostKeyChecking=yes` è corretto, ma `known_hosts` non viene fornito nel workflow, quindi la connessione fallisce a meno che l'host non sia già noto sul runner.
- Il deploy gira con `ubuntu-24.04` ospitato da GitHub e raggiunge un host di produzione: servono regole di rete o un runner dedicato.
- Lo script usa `latest` implicitamente (il compose sul server è fisso in `/srv/magazzino/docker-compose.prod.yml` e non viene copiato dal repository). Il compose versionato in `deploy/` può divergere da quello in produzione.
- Il job `deploy` fa un checkout inutile (serve solo `deploy.sh`).

**P2 — `Dockerfile` righe 10-14 e assenza di `.dockerignore`: contesto e immagine troppo larghi**
- Senza `.dockerignore`, il contesto include `.git`, `.github`, eventuali `.env`, `node_modules` locali e il resto. Un `.env` locale, se presente, non entra nell'immagine con le `COPY` attuali, ma finisce comunque nel contesto inviato al demone.
- `COPY data ./data` mette nell'immagine il listino (circa 30 MB secondo il README), che un job esterno aggiorna ogni giorno: il listino nell'immagine è subito vecchio e ogni aggiornamento richiederebbe un'altra build. Va montato come volume o letto da archivio esterno.
- `COPY db ./db` include anche i file `.down.sql`.
- Manca `HEALTHCHECK` nell'immagine e l'immagine non fissa il digest della base (`node:22.11.0-alpine3.20` è un tag, non un digest).
- Node 22.11.0 è una versione puntuale vecchia: verificare le patch di sicurezza di Node 22 aggiornate.

**P2 — `ci.yml` righe 14-19: servizio Postgres senza controllo di salute**
- Il servizio `postgres` non ha `options: --health-cmd pg_isready`. Il passo di migrazione può partire prima che il database accetti connessioni, con fallimenti intermittenti.
- Postgres 16.6 coincide con la major del README: ok. `POSTGRES_PASSWORD: test` è accettabile (dato sintetico, solo CI).

**P3 — `ci.yml` e `preview.yml`: igiene dei workflow**
- Nessun `timeout-minutes` sui job, nessun `concurrency` per annullare le esecuzioni superate. `preview.yml` non ha `permissions:`.
- Le azioni sono fissate per hash (bene). Controllare che gli hash corrispondano alle versioni dichiarate nei commenti e aggiornarle (`checkout` v4.2.2, `setup-node` v4.1.0).
- Nel job `test` manca un passo di audit delle dipendenze (`npm audit`) e il caching non protegge dai pacchetti compromessi. `npm ci` è corretto.
- `deploy.sh` e `rollback.sh` richiedono il bit eseguibile nel repository per `./deploy/deploy.sh` (ci.yml riga 62): non verificabile da questa copia.

**P3 — `deploy/docker-compose.prod.yml` righe 14-18: log solo locali**
- `json-file` con rotazione (50m × 5) evita di riempire il disco, ma i log restano sull'host: non c'è raccolta centralizzata, né metriche, tracciamento o allarmi nei file esaminati. Mancano anche una procedura di backup e il ripristino del database di produzione: nei file di `deploy/` non c'è nulla.

## Limiti e rischi
- Non ho potuto verificare le impostazioni del repository (permessi predefiniti del token, regole sull'environment `production`, protezione di `main`, accesso ai fork) né il contenuto di `/etc/magazzino/app.env` e di `/srv/magazzino/docker-compose.prod.yml` sul server.
- La conclusione P0 su `preview.yml` e sull'artifact dipende da come è configurato il repository (visibilità, regole sui workflow dei fork).

## Passi proposti (da confermare con l'utente, non eseguiti)
1. Ruotare ora i segreti elencati nei due rilievi P0 e rimuovere `.env` dalla CI.
2. Mettere `needs: test` su `build`, proteggere `preview.yml` e rendere reale lo script di anteprima, oppure rimuoverlo.
3. Rilasciare per `sha`, con rollback automatico (`failure_action: rollback`), un controllo di salute reale e migrazioni in un job separato.

Rilievi P0 e P1: lavorando su un modello più piccolo, propongo il riesame del direttore AISA-01 · SIRIUS o di un revisore su Opus prima che diventino definitivi.

— AISA-10 · CASTOR
