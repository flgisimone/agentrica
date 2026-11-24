AISA-10 · CASTOR — Senior DevOps / Infrastructure Engineer, reparto AISA (AI Software)

**Rapporto sola lettura: CI/CD, immagine e deploy** (progetto: gestionale di magazzino, Node 22 + Postgres 16, 2 repliche in Docker Swarm)

Ho letto `.github/workflows/ci.yml`, `.github/workflows/preview.yml`, `Dockerfile`, `deploy/*`, `package.json` e `db/migrate.js`. Non ho eseguito nulla né modificato file. La scheda della biblioteca (Node/TypeScript) non è stata consultata, perché in questa prova non era disponibile. Il rilievo sulla versione di Node (P3) va ricontrollato sul calendario ufficiale.

**Rilievi**

1. **P0 · `.github/workflows/preview.yml:5-23`, `pull_request_target` con checkout del codice della PR.**
   - Il workflow esegue `npm ci && npm test` e `./deploy/preview.sh` sul codice della PR, anche da fork esterni. Lo fa con i segreti `STAGING_DATABASE_URL` e `PREVIEW_TOKEN`, nel contesto del repository di destinazione. Chi apre una PR può eseguire codice arbitrario, per esempio uno script `postinstall` o un test, e leggere quei segreti.
   - Il workflow non ha un blocco `permissions`, quindi `GITHUB_TOKEN` prende i permessi predefiniti del repository, che possono essere in scrittura.
   - Nei test passa la `DATABASE_URL` di staging: un test malevolo può scrivere o cancellare sul database di staging.
   - Anche `${{ github.event.pull_request.number }}` è interpolato direttamente nello script. Il numero è sicuro, ma l'abitudine è da evitare.
   - Correzione proposta: usare `pull_request` senza segreti per i test. Per l'anteprima, un flusso a due passi (`workflow_run`) che non esegue codice non fidato con i segreti. In alternativa, richiedere l'approvazione di un maintainer sulle PR dei fork.

2. **P0 · `.github/workflows/ci.yml:39-42` e `:48-53`, segreti di produzione scritti in `.env` e caricati come artifact.**
   - `PROD_DATABASE_URL` e `PAYMENTS_WEBHOOK_SECRET` finiscono in un file `.env`, che `upload-artifact` pubblica insieme a `deploy/`. L'artifact è scaricabile da chiunque abbia accesso in lettura al repository, e i log di Actions non lo mascherano.
   - Il job `build` non ha l'ambiente `production` e non ha approvazioni, quindi i segreti di produzione sono disponibili a un job che gira a ogni push su main.
   - Il `.env` non serve alla build: il `Dockerfile` non copia `.env`, ma senza `.dockerignore` (vedi rilievo 7) `docker build .` lo include nel contesto.
   - Correzione proposta: eliminare il passo e l'upload. Il deploy legge già `env_file: /etc/magazzino/app.env` sul server. Considerare la rotazione dei due segreti, se esposti.

3. **P1 · `deploy/rollback.sh:4-5` e `ci.yml:46`, il rollback usa un tag `:previous` che nessuno crea.**
   - La CI pubblica solo `:latest` e `:<sha>`. Il tag `:previous` non viene mai assegnato (nessun `docker tag` nel repository), quindi il rollback fallisce o prende un'immagine non voluta.
   - Il compose usa `:latest`, mutabile, quindi non si sa quale versione gira.
   - Lo script non ha chiave SSH, non ha `StrictHostKeyChecking` e non ha un controllo di salute dopo il rollback. È diverso da `deploy.sh`, che gestisce la chiave. Non è collegato a nessun workflow.
   - Il rollback del database non è previsto (vedi rilievo 4).
   - Correzione proposta: deploy con tag `${{ github.sha }}` (o digest), memorizzare la versione corrente, rollback verso un tag esplicito.

4. **P1 · `Dockerfile:17` e `db/migrate.js:6-20`, le migrazioni partono a ogni avvio del container, in ogni replica.**
   - Con 2 repliche e `start-first` partono due `npm run migrate` in parallelo. `migrate.js` non usa transazioni né un lock (`pg_advisory_lock`), quindi i due processi possono applicare la stessa migrazione. Il `INSERT` su `schema_migrations` può fallire per chiave duplicata dopo che il DDL è già stato eseguito.
   - Un errore in `main()` non è gestito (`main();` senza `.catch`, `migrate.js:20`): niente codice di uscita diverso da zero garantito.
   - `004_stock.sql` rinomina la colonna `qty` in `stock`. Con `start-first` e rolling update, le repliche vecchie (che usano `qty`) continuano a girare su uno schema nuovo: rottura per tutta la durata dell'aggiornamento.
   - Le `.down.sql` non vengono mai eseguite da nessuno script, quindi il rollback dell'immagine non riporta lo schema indietro.
   - Correzione proposta: passo di migrazione separato e unico, con lock e transazione. Migrazioni compatibili con la versione precedente (espandi e poi contrai).

5. **P1 · `deploy/docker-compose.prod.yml:10-13`, controllo di salute inadeguato.**
   - Controlla `GET /`, cioè la pagina statica (`server/app.js:8`). Non verifica database né applicazione. Non esiste un endpoint di salute (nessuna rotta `/health` in `server/app.js`).
   - Mancano `start_period` e `timeout`: durante la migrazione all'avvio il controllo può segnare il container come non sano.
   - `update_config` non ha `failure_action: rollback`, `monitor` né `delay`, e manca `rollback_config`. Un deploy con repliche non sane non torna indietro da solo.
   - Mancano limiti di risorse (`resources`) e `restart_policy`.
   - Il `wget` esiste in alpine (busybox), quindi il comando funziona. Il problema è cosa controlla.

6. **P2 · `ci.yml:12-29`, il job `test` non protegge il rilascio.**
   - `build` e `deploy` hanno `if: github.ref == 'refs/heads/main'` ma `build` non ha `needs: test`. L'immagine viene costruita e pubblicata anche se i test falliscono.
   - Il servizio Postgres non ha `options: --health-cmd pg_isready`: `npm run migrate` può partire prima che il database sia pronto.
   - Mancano `concurrency` (due push ravvicinati possono sovrapporre i deploy) e `timeout-minutes`.
   - Non c'è alcuna scansione dell'immagine o delle dipendenze (`npm audit`, Trivy) né test sull'immagine costruita.
   - `deploy` usa `./deploy/deploy.sh` ma non verifica l'esito dopo lo stack deploy.

7. **P2 · `Dockerfile`, build e immagine.**
   - Manca `.dockerignore` (verificato: non c'è nel progetto). `COPY server ./server` e simili non portano `.env` o `.git` nell'immagine, ma il contesto di build sì, ed espone `.env` al demone (vedi rilievo 2).
   - `data/listino.json` (circa 30 MB, aggiornato ogni giorno da un job esterno) è copiato nell'immagine (`Dockerfile:13`). Il listino viene quindi congelato alla data della build, e ogni build porta 30 MB. Andrebbe in un volume o in un'archiviazione esterna. Inoltre `products.js:24` lo rilegge e rianalizza con `readFileSync` + `JSON.parse` a ogni richiesta (problema di applicazione, fuori dal mio perimetro: lo segnalo ad AISA-01).
   - Le immagini base sono fissate per versione ma non per digest.
   - `HEALTHCHECK` assente nel Dockerfile (c'è solo nel compose). Nessun `tini` o gestione di SIGTERM (`server/app.js:20` non gestisce l'arresto ordinato): in un rolling update le richieste in corso possono cadere.
   - L'avvio con `sh -c "... && node ..."` fa sì che il processo principale sia `sh`, non `node`, e riceva i segnali al suo posto.
   - L'utente è `node`, non root: va bene.

8. **P2 · `ci.yml:45-47`, pubblicazione dell'immagine.**
   - `docker login` con `GITHUB_TOKEN` e `docker push --all-tags` senza `docker/build-push-action`, senza cache, senza firma o provenienza (SBOM).
   - L'organizzazione `ortofrutta-emilia` nel nome dell'immagine è scritta a mano, non derivata da `github.repository`.
   - Il tag `:latest` viene sovrascritto a ogni push.

9. **P2 · `deploy/deploy.sh:4-9`, deploy via SSH.**
   - La chiave è scritta su file temporaneo con `chmod 600` e rimossa al termine (bene). Con `StrictHostKeyChecking=yes` serve però un `known_hosts` che nel repository non esiste: il passo o fallisce o dipende da un file non versionato.
   - Il deploy parte con la chiave in una variabile d'ambiente. L'ambiente `production` è dichiarato (`ci.yml:59`), ma non risulta che richieda approvazioni: va verificato nelle impostazioni del repository (non leggibile da qui).
   - Nessuna verifica dopo `docker stack deploy` (esito dei servizi, stato delle repliche), nessun rollback automatico, nessuna notifica.

10. **P3 · Varie.**
   - `node:22.11.0` (`Dockerfile`, `ci.yml:24`, `preview.yml:17`): versione di patch datata. Controllare il calendario Node ufficiale (scheda nodejs-calendario) per le versioni supportate.
   - `preview.yml` richiama `./deploy/preview.sh` che non esiste nel repository (`deploy/` contiene solo `deploy.sh`, `docker-compose.prod.yml`, `rollback.sh`): il passo fallirebbe.
   - Mancano `.nvmrc`/`engines` in `package.json`, un workflow per gli aggiornamenti delle dipendenze, e metriche, allarmi e backup del database nel repository.

**Cosa regge**: azioni fissate per SHA con commento di versione; `permissions: contents: read` di default nel CI; utente non root nell'immagine; `npm ci --omit=dev` in un build a più fasi; log con rotazione; chiave SSH temporanea rimossa con `trap`.

**Riesame consigliato**: i rilievi 1 e 2 (P0) e il rilievo 4 sono conclusioni da sottoporre al riesame del direttore AISA-01 o di un revisore su Opus, dato che lavoro con Sonnet. Il P0 sul `pull_request_target` e quello sugli artifact con segreti vanno segnalati subito all'utente. Se i segreti di produzione sono già stati caricati come artifact, vanno ruotati.

**Limiti**: non ho potuto verificare le impostazioni del repository GitHub (protezioni, approvazioni dell'ambiente `production`, retention degli artifact) né lo stato del server. Non ho eseguito alcun test o comando di build.

— AISA-10 · CASTOR
