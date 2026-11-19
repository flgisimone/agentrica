# Revisione di sicurezza delle configurazioni di deploy: Fatture Lite

**Ruolo:** Senior Cloud Security Engineer (AICA)
**Perimetro:** i file della cartella del progetto (Dockerfile, docker-compose.yml, nginx.conf, bucket-policy.json, .gitignore, .env, .env.example, README.md).
**Modalità:** solo lettura, analisi statica. Non ho modificato nulla, non ho eseguito container e non ho contattato AWS né altri servizi. Del file `.env` ho letto solo i nomi delle variabili, non i valori.

## Segnalazione P0 immediata

Il **bucket S3 dei documenti di fatturazione è leggibile da chiunque** (bucket-policy.json:6-9). Le fatture contengono dati personali e fiscali di clienti. Se questa policy è già applicata in un ambiente reale, va tolta subito. Coinvolgere anche Privacy & Compliance, che valuterà se si tratta di una possibile violazione di dati (art. 33 GDPR).

## Registro delle misconfigurazioni

| # | Priorità | File:riga | Misconfigurazione | Rischio | Remediation |
|---|---|---|---|---|---|
| 1 | P0 | bucket-policy.json:6-9 | `Principal: "*"` con `s3:GetObject` su `fatture-lite-documenti/*` | Chiunque conosca o indovini una chiave può scaricare le fatture: dati personali e fiscali esposti su Internet | Togliere lo statement pubblico, attivare S3 Block Public Access a livello di account e di bucket, dare accesso solo al ruolo IAM dell'app, servire i download con URL prefirmati di breve durata. Attivare SSE (SSE-S3 o KMS) e aggiungere una condizione `aws:SecureTransport` |
| 2 | P1 | .gitignore:1-2 | `.env` non è ignorato da git, e il file `.env` è presente con `POSTGRES_PASSWORD`, `DATABASE_URL` e `STRIPE_SECRET_KEY` | Un `git add .` pubblica i segreti nel repository, compresa la chiave segreta di Stripe | Aggiungere `.env` al `.gitignore` (tenere `.env.example`). Se è mai stato committato, ruotare tutti i segreti e ripulire la cronologia. In produzione usare un secret manager |
| 3 | P1 | Dockerfile:5 (manca `.dockerignore`) | `COPY . .` senza `.dockerignore` | `.env` con i segreti finisce dentro l'immagine (insieme a `.git` e agli altri file locali). Chi ottiene l'immagine dal registry ottiene anche i segreti | Creare un `.dockerignore` con `.env`, `.git`, `node_modules` e `*.log`; passare i segreti solo a runtime |
| 4 | P1 | docker-compose.yml:12-13 | Postgres pubblica `5432:5432` su tutte le interfacce | Database esposto alla rete o a Internet, raggiungibile con brute force e con eventuali CVE. L'app lo raggiunge già sulla rete interna | Togliere `ports`. Se serve per la manutenzione, usare `127.0.0.1:5432:5432` oppure un tunnel SSH |
| 5 | P1 | nginx.conf:3-4 | Il `log_format` registra `$http_authorization` | Token e credenziali in chiaro nei log di accesso: chi legge i log può impersonare gli utenti | Togliere `$http_authorization` dal formato, ruotare i token già registrati e ripulire i log esistenti |
| 6 | P1 | nginx.conf:11 | `ssl_protocols TLSv1 TLSv1.1 TLSv1.2` | TLS 1.0 e 1.1 sono deprecati (RFC 8996), con rischi di downgrade e di cifrari deboli | `ssl_protocols TLSv1.2 TLSv1.3;` con una suite di cifrari moderna (es. il profilo Mozilla Intermediate) |
| 7 | P2 | docker-compose.yml:17-19 | Redis senza password né ACL | Qualsiasi container della rete `interna` (compreso nginx) può leggere e scrivere sessioni e cache; se viene esposto per errore, è un'esecuzione di comandi senza autenticazione | `requirepass` o ACL presi da un segreto, `REDIS_URL` con le credenziali, rete separata solo app↔redis |
| 8 | P2 | docker-compose.yml:6,16,19,27 | Una sola rete piatta `interna` per tutti i servizi | Nginx, che è esposto a Internet, raggiunge direttamente db e redis: niente segmentazione | Due reti: `frontend` (nginx e app) e `backend` (app, db e redis, con `internal: true`) |
| 9 | P2 | Dockerfile:1 | `FROM node:latest` | Build non riproducibili, immagine grande con molti pacchetti e possibili CVE, rischio di salti di versione major | Usare una versione LTS fissata, slim o alpine, possibilmente con digest (es. `node:22-slim@sha256:...`) e una build multi-stage |
| 10 | P2 | Dockerfile:7 (manca `USER`) | Il container gira come root | Se l'app viene compromessa, l'attaccante ha i privilegi di root nel container, e l'escape è più facile | `USER node`; in compose aggiungere `read_only: true`, `cap_drop: [ALL]` e `security_opt: no-new-privileges:true` |
| 11 | P2 | docker-compose.yml:22-25 | Certificati referenziati in nginx.conf:9-10 (`/etc/nginx/certs/`) ma non montati | Nginx non parte, oppure i certificati vengono inseriti in modo improvvisato (ad esempio nell'immagine) | Montare i certificati in sola lettura da un segreto o da un volume dedicato, con un rinnovo automatico (ACME) |
| 12 | P2 | nginx.conf:6-20 | Nessun server sulla porta 80 con redirect, nessun header di sicurezza oltre HSTS (CSP, X-Content-Type-Options, X-Frame-Options/frame-ancestors, Referrer-Policy), `server_tokens` attivo, manca `X-Forwarded-Proto` | La prima visita in HTTP non viene reindirizzata; protezione debole contro clickjacking e MIME sniffing; la versione di nginx è visibile | Aggiungere un server :80 con `return 301 https://...`, gli header elencati, `server_tokens off;` e `proxy_set_header X-Forwarded-Proto $scheme;` |
| 13 | P3 | docker-compose.yml:8 | Postgres con `POSTGRES_USER` superuser usato anche dall'app (vedi .env.example:2) | Un'SQL injection nell'app ha i privilegi completi sul database | Creare un ruolo applicativo con privilegi minimi, separato dall'utente amministrativo |
| 14 | P3 | docker-compose.yml:2-27 | Nessun limite di risorse, `restart` o healthcheck; logging del container non configurato | Il servizio è meno disponibile e il rilevamento degli incidenti è limitato | Aggiungere `restart: unless-stopped`, un healthcheck, limiti di CPU e memoria e la rotazione dei log |
| 15 | P3 | bucket-policy.json (generale) | Nessuna evidenza di versioning, server access logging o CloudTrail data events sul bucket | Senza questi controlli non si possono ricostruire gli accessi ai documenti né recuperare quelli cancellati | Attivare versioning, logging degli accessi e CloudTrail data events per S3 (da verificare sull'account: qui non è verificabile) |

## Hardening plan (ordine proposto)

1. **Subito:** rilievo 1 (bucket privato con Block Public Access). Se la policy è stata applicata, analizzare i log di accesso al bucket e coinvolgere Privacy & Compliance.
2. **Prima del go-live:** rilievi 2-6 (segreti fuori da git e dall'immagine, database non esposto, log senza Authorization, TLS 1.2+). Se i segreti sono reali, ruotarli.
3. **Hardening:** rilievi 7-12 (Redis autenticato, reti separate, immagine fissata e non-root, certificati, header).
4. **Miglioramenti:** rilievi 13-15.

**Criteri di verifica:**
- `aws s3api get-bucket-policy-status` restituisce `IsPublic: false`, e un GET anonimo riceve 403.
- `git check-ignore .env` trova il file.
- `docker history` e un'ispezione dell'immagine non contengono `.env`.
- Un `nmap` dall'esterno sulla 5432 trova la porta chiusa (lo esegue l'utente, con la sua autorizzazione).
- `testssl.sh` non accetta TLS 1.0 e 1.1.
- I log di nginx non contengono l'header Authorization.

## Assunzioni e limiti

- Secondo il README le chiavi sono finte: per questo il rilievo 2 è P1 e non P0. Se i valori fossero reali, la priorità salirebbe e la rotazione sarebbe immediata.
- Non è un repository git: non ho potuto verificare se `.env` è già stato committato.
- Non ho visto il codice dell'app (`src/`), le policy IAM, le impostazioni dell'account AWS (Block Public Access, cifratura, logging) né l'ambiente host (firewall). I rilievi che li riguardano sono da confermare su quegli asset.
- Non ho eseguito test attivi né scansioni.

Le correzioni sono proposte: decide l'utente se e quando applicarle, e le implementa la Software Agency.
