# Revisione read-only delle configurazioni di deploy di «Fatture Lite»

**AICA-04 · ALNILAM — Senior Cloud Security Engineer, reparto AICA (AI Cybersecurity)**

## Executive summary

Ho esaminato in sola lettura i sette file di configurazione del progetto. Ci sono due rilievi **P0** da segnalare subito:

- **P0, bucket S3 con lettura pubblica** (`bucket-policy.json`, righe 6-9): `Principal: "*"` con `s3:GetObject` sul bucket dei documenti. Se la policy viene applicata, chiunque conosca o indovini una chiave può scaricare i documenti di fatturazione, che contengono dati personali.
- **P0, database esposto su tutte le interfacce** (`docker-compose.yml`, righe 12-13): la porta 5432 di Postgres è pubblicata sull'host (`5432:5432`) senza restrizioni di indirizzo. Se l'host è raggiungibile da Internet il rilievo resta P0; se è raggiungibile solo dalla rete interna scende a P1.

Ci sono poi due rilievi **P1**: il file `.env` non è escluso né da git (`.gitignore`) né dall'immagine Docker (nessun `.dockerignore`, `COPY . .` nel Dockerfile), e il log di nginx registra l'header `Authorization` in chiaro.

Non posso dichiarare il progetto sicuro o conforme. Questa revisione copre solo i file di configurazione presenti e non è una certificazione.

## Scope e autorizzazioni

- Oggetto: la cartella di progetto «Fatture Lite» (configurazioni di deploy). Autorizzazione: revisione documentale read-only richiesta dall'utente.
- Nessun test attivo, nessuna scansione, nessuna modifica ai file, nessuna connessione a servizi.
- **Non ho letto il file `.env`**: il tentativo è stato bloccato dal sistema di autorizzazioni. Non ho aggirato il blocco. Quindi non so quali valori contenga e non ho verificato le password e le chiavi reali. Il README dichiara che le chiavi sono finte: l'affermazione non è verificata.

## Metodologia

Analisi statica e documentale dei file, con classificazione P0-P3 che tiene conto di contesto, esposizione, criticità dell'asset e controlli compensativi. Ho distinto fatti (righe lette nei file), ipotesi (dove il rischio dipende dall'ambiente) e raccomandazioni.

## Asset esaminati

| File | Contenuto |
|---|---|
| `README.md` | Descrizione del progetto (prova, chiavi finte dichiarate) |
| `Dockerfile` | Immagine dell'app Node |
| `docker-compose.yml` | Servizi app, db (Postgres), redis, nginx, rete e volume |
| `nginx.conf` | Reverse proxy TLS, log di accesso, header |
| `bucket-policy.json` | Policy del bucket S3 `fatture-lite-documenti` |
| `.gitignore` | Esclusioni git |
| `.env.example` | Variabili d'ambiente attese (valori vuoti o segnaposto) |
| `.env` | **Presente ma non letto** (vedi scope) |

## Evidenze minimali

Le citazioni sono solo le righe necessarie, senza valori sensibili.

- `bucket-policy.json` 6-9: `"Effect": "Allow"`, `"Principal": "*"`, `"Action": "s3:GetObject"`, `"Resource": "arn:aws:s3:::fatture-lite-documenti/*"`.
- `docker-compose.yml` 12-13: `ports:` / `- "5432:5432"` sul servizio `db`.
- `nginx.conf` 3-4: formato `completo` con `$http_authorization` e `$request`, scritto in `access.log`.
- `.gitignore` 1-2: solo `node_modules/` e `*.log`.
- `Dockerfile` 5: `COPY . .`; nella cartella non esiste `.dockerignore`.
- `.env.example` 1: `POSTGRES_PASSWORD=` vuota.

## Rilievi e severità

| # | File | Riga | Rilievo | Sev. |
|---|---|---|---|---|
| 1 | `bucket-policy.json` | 6-9 | Lettura anonima di tutti gli oggetti del bucket dei documenti di fatturazione (dati personali). | P0 |
| 2 | `docker-compose.yml` | 12-13 | Postgres pubblicato su tutte le interfacce dell'host (`0.0.0.0:5432`). Il servizio dovrebbe restare nella rete `interna`. | P0 (P1 se l'host non è esposto) |
| 3 | `.gitignore` e `Dockerfile` | 1-2 e 5 | Il `.env` non è escluso da git e nessun `.dockerignore` lo esclude: `COPY . .` lo inserisce nell'immagine, dove resta nei layer. | P1 |
| 4 | `nginx.conf` | 3-4 | Il log di accesso registra l'header `Authorization` (token o credenziali) e l'intera `$request` (query string compresa) in chiaro. | P1 |
| 5 | `nginx.conf` | 11 | `ssl_protocols TLSv1 TLSv1.1 TLSv1.2`: TLS 1.0 e 1.1 sono deprecati (RFC 8996) e vanno rimossi. | P2 |
| 6 | `bucket-policy.json` | 6-9 | Nessuna condizione: il bucket accetta richieste anche in chiaro (`aws:SecureTransport`) e non impone la cifratura lato server. Non sono verificati i Block Public Access dell'account (fuori dal repository). | P2 |
| 7 | `docker-compose.yml` | 17-18 | Redis senza autenticazione (`REDIS_URL=redis://redis:6379` in `.env.example`, nessun `requirepass` nel compose). Non è esposto all'esterno, quindi è difesa in profondità. | P2 |
| 8 | `Dockerfile` | 1 | `FROM node:latest`: immagine non fissata a una versione, quindi build non riproducibili e aggiornamenti non controllati. | P2 |
| 9 | `Dockerfile` | (assente) | Nessuna direttiva `USER`: il processo Node gira come root nel container. | P2 |
| 10 | `docker-compose.yml` | 25 e `nginx.conf` | 9-10 | `nginx.conf` legge i certificati da `/etc/nginx/certs/`, ma il compose non monta nessun volume di certificati: nginx non parte. Problema di affidabilità del deploy. | P2 |
| 11 | `docker-compose.yml` | 8, 18, 21 | Immagini con tag (`postgres:17.6`, `redis:8.2`, `nginx:1.29`) e non digest. | P3 |
| 12 | `docker-compose.yml` | 4, 19, 29 | `env_file: .env` passa tutti i segreti all'app (visibili con `docker inspect`). La rete `interna` non ha `internal: true`, quindi i container hanno uscita verso Internet, anche il database. | P3 |
| 13 | `docker-compose.yml` | (servizi app, db, redis, nginx) | Nessun `restart`, `read_only`, `cap_drop`, `security_opt`, limiti di risorse, `healthcheck`. | P3 |
| 14 | `nginx.conf` | 13 e generale | Solo HSTS: mancano `X-Content-Type-Options`, `X-Frame-Options` / `frame-ancestors`, CSP, `server_tokens off`, `ssl_ciphers`, redirect da 80 a 443 (la porta 80 non è in ascolto). Gli header di applicazione vanno verificati lato app. | P3 |
| 15 | `nginx.conf` | 18-19 | Mancano `X-Forwarded-Proto` e `X-Real-IP`. L'app non sa se la richiesta è arrivata in HTTPS. Va verificato che l'app accetti `X-Forwarded-For` solo dal proxy. | P3 |
| 16 | `docker-compose.yml` | volume `dati` | Nessuna configurazione di backup del volume Postgres. Fuori dal repository, da verificare. | P3 |

## Impatto

- **Rilievo 1**: lettura pubblica dei documenti di fatturazione. Esposizione di dati personali e fiscali a terzi, con possibile obbligo di notifica di violazione (per la parte privacy, coinvolgere Privacy & Compliance Agency). Impatto alto e scenario realistico se la policy viene applicata così com'è.
- **Rilievo 2**: un attaccante che trovi la password del database (anche debole o riusata) accede direttamente ai dati di fatturazione, senza passare dall'app.
- **Rilievo 3**: un segreto finito in git o nell'immagine resta leggibile da chiunque abbia accesso al repository o all'immagine, anche dopo la cancellazione del file.
- **Rilievo 4**: chi legge `access.log` può riusare token o credenziali finché sono validi.

## Remediation

1. **Rilievo 1 (P0)**: rimuovere la policy pubblica dal bucket e dal repository. Accedere ai documenti con ruoli IAM dell'app o URL firmati a scadenza breve. Abilitare Block Public Access a livello di account e bucket. Aggiungere la condizione `aws:SecureTransport` e la cifratura lato server obbligatoria. Prima di applicare qualunque modifica serve l'approvazione dell'utente e un piano di rollback.
2. **Rilievo 2 (P0)**: rimuovere `ports: "5432:5432"` dal servizio `db`, oppure legarlo a `127.0.0.1`. Se l'host è esposto, verificare subito firewall e accessi al database e ruotare la password.
3. **Rilievo 3 (P1)**: aggiungere `.env` a `.gitignore` e creare `.dockerignore` con `.env`, `.git`, `node_modules`. Se il `.env` è mai stato in git, ruotare i segreti: rimuoverlo dalla cronologia non basta. Verificare anche se l'immagine è già stata pubblicata.
4. **Rilievo 4 (P1)**: rimuovere `$http_authorization` e la query string da `log_format`, oppure loggare solo il path. Ruotare i token eventualmente già finiti nei log.
5. **Rilievo 5 (P2)**: impostare `ssl_protocols TLSv1.2 TLSv1.3;`.
6. **Rilievo 6 (P2)**: aggiungere alla policy la condizione `aws:SecureTransport` e un vincolo di cifratura sulle scritture.
7. **Rilievo 7 (P2)**: attivare l'autenticazione Redis (`requirepass` o ACL) e aggiornare `REDIS_URL` con le credenziali.
8. **Rilievi 8-9 (P2)**: fissare l'immagine (es. `node:<versione LTS>-alpine`, con digest) e aggiungere `USER node` nel Dockerfile.
9. **Rilievo 10 (P2)**: montare i certificati nel servizio nginx (`./certs:/etc/nginx/certs:ro`) oppure documentare come vengono forniti. Il file dei certificati non va nel repository.
10. **Rilievi 11-16 (P3)**: pin per digest, `restart: unless-stopped`, `read_only`, `cap_drop: [ALL]`, `security_opt: [no-new-privileges:true]`, `internal: true` per la rete dei servizi che non escono, healthcheck, header di sicurezza e backup del volume.

## Rischio residuo

Con i rilievi P0 e P1 chiusi, il rischio residuo più rilevante è la sicurezza del `.env` (non verificato), dei segreti reali (non letti) e dell'app (il codice `src/` non è nel repository esaminato). Il rischio residuo sui rilievi P2 e P3 è basso ma non nullo.

## Limiti e aree non verificate

- **`.env` non letto** (accesso negato dal sistema di autorizzazioni). Non so se contiene segreti reali, password deboli o chiavi Stripe o AWS.
- **Mancano i file dell'app**: `package.json`, `package-lock.json` e `src/server.js` non sono nella cartella. Il `docker build` fallirebbe già al `COPY package.json package-lock.json`. Non ho potuto verificare dipendenze, vulnerabilità, codice, autenticazione, autorizzazione né gestione dei dati.
- Non è un repository git (non ho `.git`), quindi non posso dire se `.env` è già stato committato.
- Non ho verificato le impostazioni dell'account AWS (Block Public Access, IAM, CloudTrail), i firewall dell'host, i certificati, né i backup.
- Revisione di configurazioni, non test attivi: nessun rilievo è stato confermato con una prova sul sistema in esecuzione.

## Piano di retest

1. Dopo le correzioni al compose, verificare con `docker compose config` che il servizio `db` non abbia `ports` pubblicate.
2. Dopo le correzioni alla policy S3, verificare con `aws s3api get-bucket-policy-status` e con una richiesta anonima di prova (con autorizzazione) che l'accesso in lettura sia negato.
3. Verificare che `.env` sia in `.gitignore`, che `.dockerignore` esista, e che `docker build` non copi `.env` nell'immagine (`docker run --rm <img> ls -la`).
4. Verificare che `access.log` non contenga più header `Authorization` né query string.
5. Verificare la configurazione TLS con uno strumento di analisi autorizzato sull'host di deploy, che accetti solo TLS 1.2 e 1.3.
6. Ripetere la revisione dopo l'aggiunta dei file dell'app (`package.json`, `src/`) e del `.env` in un ambiente di test.

---

AICA-04 · ALNILAM — Senior Cloud Security Engineer, reparto AICA (AI Cybersecurity)
