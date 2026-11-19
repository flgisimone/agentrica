# Revisione di sicurezza delle configurazioni di deploy: Fatture Lite

Ruolo: Senior Cloud Security Engineer (AICA). Ho fatto una revisione read-only dei file in `aica-04-config-deploy-opus-basso-2/` (Dockerfile, docker-compose.yml, nginx.conf, bucket-policy.json, .gitignore, .env.example, README.md, nomi delle chiavi di .env). Non ho modificato niente e non ho eseguito nessun test attivo. Non ho letto i valori di `.env`.

## Rilievi P0 (da segnalare subito)

| # | Gravità | File:riga | Misconfigurazione | Remediation |
|---|---|---|---|---|
| 1 | P0 | bucket-policy.json:6-9 | `Principal: "*"` con `s3:GetObject` su `fatture-lite-documenti/*`: chiunque su Internet può leggere tutte le fatture, che contengono dati personali e fiscali. | Togliere lo statement pubblico, attivare S3 Block Public Access a livello di bucket e di account, servire i documenti con URL prefirmati a scadenza breve generati dall'app. Si verifica con una richiesta anonima, che deve rispondere 403. |
| 2 | P0 | docker-compose.yml:12-13 | Postgres pubblicato su `5432:5432`, quindi su tutte le interfacce dell'host: il database con i dati di fatturazione è raggiungibile da fuori. | Rimuovere `ports` (l'app lo raggiunge sulla rete `interna`). Se serve l'accesso per amministrarlo: `127.0.0.1:5432:5432` o un tunnel SSH. |
| 3 | P0 | .gitignore:1-2; .env | `.env` contiene segreti reali (password del DB, `DATABASE_URL`, `STRIPE_SECRET_KEY`) e non è in `.gitignore`: basta un `git add .` per committarlo. | Aggiungere `.env` (e `.env.*` con l'eccezione `!.env.example`) a `.gitignore`. Se è già finito nella storia o è stato condiviso, ruotare la chiave Stripe e la password del DB. Il README dice che sono finte, ma la regola va messa comunque prima della produzione. |

## Altri rilievi

| # | Gravità | File:riga | Misconfigurazione | Remediation |
|---|---|---|---|---|
| 4 | P1 | Dockerfile:5 (manca `.dockerignore`) | `COPY . .` senza `.dockerignore` copia nell'immagine `.env` con i segreti, oltre a `.git` e ai file locali. Chi ha accesso all'immagine o al registry legge i segreti. | Creare un `.dockerignore` con `.env`, `.git`, `node_modules`, `*.log`. I segreti arrivano solo a runtime (env_file o secrets di compose). |
| 5 | P1 | nginx.conf:3-4 | Il `log_format` registra `$http_authorization`: token e credenziali dei client finiscono in chiaro nei log d'accesso. | Togliere `"$http_authorization"` dal formato e ruotare i token che sono già stati registrati. Purgare i log esistenti secondo la policy di conservazione. |
| 6 | P1 | nginx.conf:11 | `ssl_protocols TLSv1 TLSv1.1 TLSv1.2`: TLS 1.0 e 1.1 sono deprecati (RFC 8996). | `ssl_protocols TLSv1.2 TLSv1.3;` con suite moderne (profilo Mozilla «intermediate»). Si verifica con `testssl.sh` o SSL Labs, previa autorizzazione. |
| 7 | P1 | docker-compose.yml:17-19 | Redis senza password né ACL (`REDIS_URL=redis://redis:6379`, .env.example:3). Non è pubblicato all'esterno, ma qualunque container della rete può leggerlo e scriverci. | `requirepass` o ACL, con l'URL `redis://:<pwd>@redis:6379`. Valutare una rete separata per il backend. |
| 8 | P2 | Dockerfile:1 | `node:latest`: immagine non fissata (build non riproducibili, major che cambiano da sole) e completa, quindi con una superficie d'attacco ampia. | Usare un tag LTS slim fissato con digest, es. `node:22-slim@sha256:...`, e aggiornarlo in modo controllato. |
| 9 | P2 | Dockerfile:7 | Manca `USER`: il processo gira come root nel container. | `USER node` (con `COPY --chown=node:node`). In compose, valutare `read_only: true`, `cap_drop: [ALL]` e `no-new-privileges`. |
| 10 | P2 | docker-compose.yml:6,16,19,27 | Una sola rete `interna` per tutti: nginx raggiunge direttamente db e redis, quindi non c'è segmentazione. | Due reti: `frontend` (nginx e app) e `backend` (app, db, redis, con `internal: true`). |
| 11 | P2 | nginx.conf:6-20 | Manca il server su `:80` che reindirizza a HTTPS (e compose non pubblica la porta 80). Mancano header di sicurezza (`X-Content-Type-Options`, `X-Frame-Options`/CSP frame-ancestors, `Referrer-Policy`), `server_tokens off` e `X-Forwarded-Proto` verso l'app. | Aggiungere il redirect 301, gli header, `server_tokens off;` e `proxy_set_header X-Forwarded-Proto $scheme;`. |
| 12 | P2 | docker-compose.yml:20-25 | I certificati `/etc/nginx/certs/*` (nginx.conf:9-10) non sono montati: nginx non parte, oppure qualcuno li inserisce in modo non tracciato. | Montare i certificati in sola lettura da un percorso con permessi ristretti, o usare i secrets di compose. |
| 13 | P3 | bucket-policy.json | Non risultano cifratura (SSE-KMS), un deny per le richieste senza TLS (`aws:SecureTransport` false), versioning né logging degli accessi al bucket. | Aggiungere uno statement Deny su `aws:SecureTransport=false`, la cifratura predefinita, il versioning e i server access log o CloudTrail data events. |
| 14 | P3 | docker-compose.yml | Mancano `restart`, healthcheck e limiti di risorse, e i log non hanno una rotazione configurata. | Aggiungere `restart: unless-stopped`, `healthcheck` sul db e `logging` con `max-size`. |

## Assunzioni e limiti

- Non ho letto i valori di `.env`, solo i nomi delle chiavi. Il README dice che le chiavi sono finte, ma non l'ho verificato.
- Non so se la cartella è un repository git, quindi non ho verificato se `.env` è già stato committato.
- Non ho visto la configurazione reale dell'account AWS (Block Public Access, KMS, IAM dell'app) né il codice dell'app.
- Le fatture contengono dati personali, quindi i rilievi 1, 2 e 5 vanno passati anche alla Privacy & Compliance Agency (AIPCA) per valutare se c'è stata una violazione, nel caso la configurazione fosse già in uso.

Le correzioni sono proposte: decide l'utente se e quando applicarle.
