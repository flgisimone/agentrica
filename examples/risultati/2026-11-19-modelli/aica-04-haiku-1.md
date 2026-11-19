# AICA-04 · ALNILAM — Senior Cloud Security Engineer, reparto AICA (AI Cybersecurity)

Report di revisione read-only delle configurazioni di deploy di «Fatture Lite».

## Executive summary

Ho esaminato i 8 file di configurazione presenti nella cartella (nessun codice applicativo, nessuna cartella `src/`, nessun certificato, nessun `.git`). Ho trovato **1 rilievo P0** e **4 rilievi P1** che vanno corretti prima di qualsiasi messa in produzione.

- **P0 (da segnalare subito):** il bucket S3 `fatture-lite-documenti` concede lettura pubblica (`Principal: "*"`) a tutti gli oggetti. Sono documenti di fatturazione, quindi dati personali e fiscali di terzi.
- **P1:** la chiave Stripe in `.env` ha il prefisso di una chiave *live* (`sk_live_`), in un file che `.gitignore` non esclude. Il README dice che le chiavi sono finte: va verificato subito. Se la chiave è reale, il rilievo diventa P0 e la chiave va ruotata.
- **P1:** nginx scrive l'header `Authorization` in chiaro nel log di accesso.
- **P1:** `.env` viene copiato nell'immagine Docker dal `COPY . .`, senza `.dockerignore`.
- **P1:** la porta 5432 di Postgres è pubblicata sull'host (`0.0.0.0`), non solo sulla rete interna.

Non è una certificazione: le analisi non dicono che il progetto sia sicuro nel suo insieme, e i controlli verificati valgono solo per i file esaminati.

## Scope e autorizzazioni

- Scope: i file in `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/9246e669-5e3d-40d5-8d76-e41f06314a00/scratchpad/runs/aica-04-config-deploy-haiku-1`, in sola lettura.
- Esaminati: `README.md`, `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `.gitignore`, `.env.example`, `bucket-policy.json`, `.env`.
- Nessuna modifica ai file, nessuna chiamata di rete, nessuna verifica sul cloud reale (AWS, Stripe, host).
- Proprietario degli asset e finestre di manutenzione: non indicati. La cartella è una copia locale delle configurazioni.
- Il `.env` contiene segreti: ne ho letto solo le chiavi e la lunghezza del valore, senza riportarne i contenuti. Il rapporto non contiene segreti.

## Metodologia

Revisione documentale e statica dei file di configurazione. Ho confrontato ogni impostazione con le pratiche più diffuse per container, reverse proxy, bucket S3 e gestione dei segreti. Non ho eseguito `docker compose`, `nginx -t` o strumenti di scansione.

## Asset esaminati

| Asset | File |
|---|---|
| Immagine applicativa Node | `Dockerfile` |
| Stack Compose (app, Postgres, Redis, nginx) | `docker-compose.yml` |
| Reverse proxy TLS | `nginx.conf` |
| Bucket documenti S3 | `bucket-policy.json` |
| Segreti e variabili | `.env`, `.env.example` |
| Controllo versioni | `.gitignore` |

## Rilievi e severità

Ogni rilievo indica file e riga. La severità è la sigla di priorità (P0–P3), motivata dal contesto e dall'esposizione.

### F-01 · P0 · Bucket documenti leggibile da chiunque
- **File:** `bucket-policy.json`, righe 4–10 (in particolare riga 7 `"Principal": "*"` e riga 8 `"Action": "s3:GetObject"`).
- **Evidenza:** la policy concede `s3:GetObject` a tutti i principali su `arn:aws:s3:::fatture-lite-documenti/*`.
- **Impatto:** chiunque conosca o intercetti il nome di un oggetto può scaricare fatture, che contengono dati personali e fiscali di clienti, con un link diretto e senza autenticazione. Il rischio è grave e già attivo se la policy è applicata al bucket reale.
- **Perché P0:** esposizione diretta di dati personali di terzi, senza controlli compensativi visibili nei file. Va verificata sul bucket reale (Block Public Access, ACL, altre policy) e corretta subito.

### F-02 · P1 · Chiave Stripe in `.env` non esclusa da git, con prefisso live
- **File:** `.env`, riga 5 (`STRIPE_SECRET_KEY`); `.gitignore`, righe 1–2 (esclude solo `node_modules/` e `*.log`).
- **Evidenza:** il valore della chiave ha il prefisso `sk_live_` (formato di chiave di produzione) e lunghezza 35 caratteri. Il file contiene anche `POSTGRES_PASSWORD` e `DATABASE_URL`. `.env` non è escluso da `.gitignore`, quindi può finire in un commit.
- **Contraddizione:** il README dichiara «chiavi e password sono finte». Il prefisso non è coerente con questa dichiarazione.
- **Impatto:** se la chiave è reale, chi accede al repository o al file può usare l'account Stripe (addebiti, rimborsi, dati dei clienti). Se la chiave è reale il rilievo passa a **P0**.
- **Azione immediata:** verificare nel dashboard Stripe se la chiave è attiva e, se lo è, ruotarla. Aggiungere `.env` al `.gitignore`. Controllare la storia di git (qui assente) per eventuali commit del file.

### F-03 · P1 · Header `Authorization` scritto nel log di accesso di nginx
- **File:** `nginx.conf`, riga 3 (`log_format completo ... "$http_authorization" ...`) e riga 4 (`access_log`).
- **Impatto:** ogni richiesta autenticata scrive in chiaro nel log il token o le credenziali (Bearer o Basic). Chiunque legga i log, o il sistema di log centralizzato, può riutilizzare le sessioni finché non scadono.
- **Remediation:** rimuovere `$http_authorization` dal formato e mantenere solo i campi necessari (metodo, percorso senza query string sensibile, stato, tempo di risposta). Verificare che i log già scritti non contengano token e, se li contengono, ruotarli.

### F-04 · P1 · `.env` copiato nell'immagine Docker
- **File:** `Dockerfile`, riga 5 (`COPY . .`). Non esiste un `.dockerignore`.
- **Impatto:** il comando copia `.env` (con segreti) nei layer dell'immagine. Chiunque abbia accesso all'immagine (registry, `docker history`, export) recupera i segreti. Il `env_file` in Compose non rimuove questo problema, perché il segreto resta nel layer.
- **Remediation:** aggiungere un `.dockerignore` con `.env`, `.env.*`, `.git`, `node_modules` e i file di log. Passare i segreti solo a runtime (variabili d'ambiente o secret di Compose/orchestratore), mai nell'immagine.

### F-05 · P1 · Porta Postgres pubblicata sull'host
- **File:** `docker-compose.yml`, righe 12–13 (`"5432:5432"`).
- **Impatto:** il database è raggiungibile da ogni interfaccia dell'host, anche dalla rete esterna se l'host è esposto. Il servizio non deve essere visibile dall'esterno: l'app lo raggiunge già sulla rete `interna`.
- **Remediation:** rimuovere la voce `ports` del servizio `db`, oppure legarla a `127.0.0.1:5432:5432` solo per l'uso locale di amministrazione. Verificare il firewall dell'host.

### F-06 · P2 · TLS 1.0 e 1.1 abilitati
- **File:** `nginx.conf`, riga 11 (`ssl_protocols TLSv1 TLSv1.1 TLSv1.2;`).
- **Impatto:** protocolli deprecati, con vulnerabilità note e non più accettati dai browser moderni.
- **Remediation:** `ssl_protocols TLSv1.2 TLSv1.3;` e cifrari moderni. Verificare con un test TLS esterno dopo la modifica (retest).

### F-07 · P2 · Immagine base non fissata e processo come root
- **File:** `Dockerfile`, riga 1 (`FROM node:latest`); assenza di `USER` (il processo gira come root).
- **Impatto:** `latest` cambia nel tempo e rende le build non riproducibili, con rischio di supply chain. Eseguire come root aumenta l'effetto di un eventuale compromissione dell'app.
- **Remediation:** fissare una versione LTS (es. `node:<major>-<variante>`), idealmente con digest, e aggiungere un utente non privilegiato con `USER node`.

### F-08 · P2 · Redis senza autenticazione
- **File:** `docker-compose.yml`, righe 17–19 (servizio `redis`, nessuna password); `.env.example`, riga 3 (`REDIS_URL=redis://redis:6379`, senza credenziali).
- **Impatto:** su una rete condivisa, chiunque raggiunga Redis legge o altera sessioni e code. Oggi Redis non è pubblicato sull'host (positivo), quindi il rischio è limitato alla rete interna.
- **Remediation:** `requirepass` o ACL con segreto da `.env`, e `REDIS_URL` con credenziali.

### F-09 · P2 · Rete interna con accesso verso l'esterno
- **File:** `docker-compose.yml`, righe 28–29 (`networks: interna:` senza `internal: true`).
- **Impatto:** db e redis possono effettuare connessioni in uscita verso internet. Se un servizio viene compromesso, l'esfiltrazione dei dati è più semplice.
- **Remediation:** separare le reti: una rete `internal: true` per db e redis, e una rete con uscita per l'app (che deve raggiungere Stripe) e per nginx.

### F-10 · P3 · Hardening generale dei container e del proxy
- Nessun `read_only`, `cap_drop`, `security_opt`, `mem_limit` o `healthcheck` nei servizi (`docker-compose.yml`).
- Nessun reindirizzamento da HTTP a HTTPS (nginx ascolta solo sulla 443). Nessun header di sicurezza oltre a HSTS (`nginx.conf`, riga 13): mancano ad esempio `X-Content-Type-Options`, `Referrer-Policy` e una CSP.
- Postgres senza TLS sulla connessione interna (`DATABASE_URL` senza `sslmode`). Rischio basso sulla rete interna, da valutare se la rete diventa condivisa.

### Punti positivi osservati
- Porte di app e Redis non pubblicate sull'host (solo la 443 di nginx).
- Immagini Postgres, Redis e nginx con tag di versione fissati (`postgres:17.6`, `redis:8.2`, `nginx:1.29`).
- `npm ci --omit=dev` nel Dockerfile.
- HSTS attivo con `max-age` di un anno.
- `POSTGRES_PASSWORD` letto da variabile d'ambiente e non scritto nel compose.
- `.env.example` senza valori reali.

## Impatto

- **Dati personali di terzi:** la combinazione di F-01 (documenti pubblici) con F-03 (token nei log) e F-04 (segreti nell'immagine) porta a una violazione di dati personali potenzialmente notificabile al Garante (art. 33 GDPR, 72 ore dalla conoscenza). Per questo punto coinvolgere la Privacy & Compliance Agency e il responsabile umano.
- **Sistemi di pagamento:** se la chiave Stripe è reale (F-02), la compromissione riguarda l'account di pagamento.
- **Continuità:** il rilievo sul database esposto (F-05) è un rischio per la disponibilità e l'integrità dei dati, oltre che per la riservatezza.

## Remediation (ordine di priorità)

1. **F-01 (P0):** rimuovere `Principal: "*"` dalla policy, bloccare l'accesso pubblico al bucket (Block Public Access) e verificare nei log di S3 chi ha letto gli oggetti. Usare URL pre-firmati per i download. Criterio di verifica: una richiesta anonima a un oggetto deve ricevere `403`.
2. **F-02 (P1, P0 se reale):** verificare la chiave Stripe, ruotarla se attiva, aggiungere `.env` a `.gitignore`, controllare la storia di git.
3. **F-03 (P1):** togliere `$http_authorization` dal log format; ruotare i token eventualmente già scritti nei log. Criterio: `grep -i authorization` sui log nuovi non trova valori.
4. **F-04 (P1):** aggiungere `.dockerignore`; ricostruire l'immagine e controllare che `.env` non sia presente (`docker run --rm <img> ls -la /app`); considerare le immagini già pubblicate come compromesse per i segreti.
5. **F-05 (P1):** rimuovere la pubblicazione della porta 5432; verifica con `docker compose port db 5432` e con una scansione esterna autorizzata.
6. **F-06 (P2):** limitare TLS a 1.2 e 1.3; retest con test TLS esterno.
7. **F-07 (P2):** fissare l'immagine base e aggiungere `USER`.
8. **F-08 (P2):** autenticazione Redis.
9. **F-09 (P2):** reti separate con `internal: true` per i dati.
10. **F-10 (P3):** hardening dei container, redirect HTTP, header di sicurezza, TLS verso Postgres.

## Rischio residuo

Con i rilievi P0 e P1 risolti, il rischio sui file esaminati scende da alto a medio. Restano: la gestione dei segreti fuori dai file (manca un secret manager), l'assenza di codice applicativo da esaminare, e l'assenza di controlli su cloud reale.

## Limiti e aree non verificate

- Non ho esaminato il codice dell'applicazione: `src/server.js` (indicato dal Dockerfile) non è presente. Autenticazione, autorizzazione, validazione dell'input e gestione delle sessioni non sono valutate.
- Non ho esaminato l'ambiente reale: stato effettivo del bucket S3, dashboard Stripe, host, firewall, DNS, certificati (`/etc/nginx/certs/` non è montato in Compose né presente nella cartella), backup e log centralizzati.
- Il `.gitignore` è l'unico controllo di versione visibile: nessun `.git` nella cartella, quindi non ho potuto verificare se `.env` sia già stato committato.
- Il README dice che le chiavi sono finte: non ho potuto verificarlo. La lettura del prefisso `sk_live_` è un'osservazione, non una conferma.
- Nessun test attivo, nessuna scansione, nessuna chiamata di rete.
- Lo stack Compose è di prova: alcuni rilievi (es. porta 5432) valgono solo se l'host è davvero esposto. Va confermato.

## Piano di retest

1. Dopo F-01: richiesta anonima a un oggetto del bucket, attesa `403`; verifica di Block Public Access.
2. Dopo F-02: conferma nel dashboard Stripe che la chiave è stata ruotata; `git log --all -- .env` vuoto.
3. Dopo F-03 e F-04: `docker run --rm <immagine> ls /app` senza `.env`; log di nginx senza valori `Authorization`.
4. Dopo F-05: `docker compose port db 5432` vuoto; connessione dall'esterno rifiutata.
5. Dopo F-06: test TLS esterno con solo TLS 1.2 e 1.3.
6. Riesame completo dopo le correzioni, con il codice applicativo e l'ambiente reale, prima di qualsiasi messa in produzione.

Le modifiche e le verifiche in produzione richiedono l'approvazione esplicita del responsabile umano e un piano di rollback. Non ho modificato nulla.

AICA-04 · ALNILAM
