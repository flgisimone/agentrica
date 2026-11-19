AICA-04 · ALNILAM — Senior Cloud Security Engineer, reparto AICA (AI Cybersecurity)

# Revisione read-only delle configurazioni di deploy di «Fatture Lite»

## Executive summary
Ho rivisto le configurazioni di deploy di un servizio di fatturazione (app Node, Postgres, Redis, nginx, documenti su S3) che non è ancora in produzione. Ho trovato 4 rilievi P1, 6 P2 e alcuni P3. I più gravi:
- il bucket S3 delle fatture è leggibile da chiunque;
- `.env` contiene segreti, non è escluso da git e finisce dentro l'immagine Docker;
- Postgres è raggiungibile dall'esterno sulla porta 5432;
- l'app usa un utente del database con privilegi di superuser.

Non c'è nessun P0: non ho trovato prove che queste configurazioni siano già in uso. Se però la policy del bucket fosse già applicata a un bucket con fatture reali, il rilievo C-01 diventa P0 e va segnalato subito. Questa revisione copre solo i controlli elencati qui sotto e non è una certificazione di sicurezza del progetto.

## Scope e autorizzazioni
- Il compito era una revisione read-only dei file nella cartella del progetto. Non ho fatto scansioni, non ho avuto accesso a cloud o container e non ho modificato nulla.
- Ho esaminato `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `bucket-policy.json`, `.env`, `.env.example`, `.gitignore` e `README.md`.
- Per `.env` ho controllato solo il formato e i prefissi delle variabili, con i valori mascherati. Nessun segreto è riportato in questo rapporto.

## Metodologia
Ho letto riga per riga i file e li ho confrontati con le buone pratiche: CIS Docker, Mozilla TLS (profilo intermediate), le best practice AWS S3 e OWASP sulla gestione dei segreti e sui log.

## Rilievi

| ID | Priorità | File:riga | Misconfigurazione | Impatto | Remediation |
|---|---|---|---|---|---|
| C-01 | P1 (P0 se già applicata) | `bucket-policy.json:6-9` | `"Principal": "*"` con `s3:GetObject` su `fatture-lite-documenti/*`. | Chiunque abbia, indovini o trovi l'URL di un oggetto può scaricare le fatture, che contengono dati personali e fiscali. | Togliere la statement pubblica e attivare S3 Block Public Access a livello di account e di bucket. Servire i documenti con URL presigned di breve durata generati dall'app, oppure tramite CloudFront con OAC. Aggiungere una statement Deny per `aws:SecureTransport=false`. |
| C-02 | P1 | `.gitignore:1-2`, `.env:2,5` | `.env` non è in `.gitignore` e contiene `POSTGRES_PASSWORD`, una `DATABASE_URL` con la password in chiaro e una `STRIPE_SECRET_KEY` con prefisso `sk_live_`. Il README dice che sono finte. | Al primo commit i segreti finiscono nella storia del repository, chiave live di Stripe compresa. | Aggiungere `.env` e `.env.*` a `.gitignore`, tenendo tracciato solo `!.env.example`. Se una di queste chiavi è o è stata reale, va ruotata. In produzione conviene un secret manager. |
| C-03 | P1 | `Dockerfile:5` (manca `.dockerignore`) | `COPY . .` senza `.dockerignore` copia nell'immagine `.env`, i file di configurazione e un eventuale `.git`. | Chi può scaricare l'immagine (registry, cache di CI) legge i segreti. | Creare un `.dockerignore` che escluda `.env*`, `.git`, `node_modules` e `*.log`, e passare i segreti solo a runtime. Il compose lo fa già con `env_file`. |
| C-04 | P1 | `docker-compose.yml:12-13` | `ports: "5432:5432"` pubblica Postgres su tutte le interfacce dell'host. Docker scrive regole iptables che di solito scavalcano il firewall dell'host (ufw). | Il database delle fatture è raggiungibile da Internet e resta protetto solo dalla password, quindi esposto a brute force e a eventuali CVE. | Togliere `ports`: l'app raggiunge `db` sulla rete interna. Per l'amministrazione usare un tunnel SSH, o al massimo `127.0.0.1:5432:5432`. |
| C-05 | P2 | `docker-compose.yml:10`, `.env.example:2` | `POSTGRES_USER: fatture` crea un superuser, e l'app si collega proprio con quell'utente. | Se l'app viene compromessa (per esempio con una SQL injection), l'attaccante ha il controllo completo del database, comprese funzioni come `COPY ... PROGRAM`. | Tenere il superuser solo per l'amministrazione e creare per l'app un ruolo con i soli privilegi DML sullo schema. |
| C-06 | P2 | `nginx.conf:3-4` | Il `log_format` registra `$http_authorization`. | Token e credenziali Basic o Bearer restano in chiaro nei log di accesso, che di solito hanno protezioni e tempi di conservazione più deboli. | Togliere `$http_authorization` dal formato del log. Ruotare i log già raccolti, se esistono. |
| C-07 | P2 | `nginx.conf:11` | `ssl_protocols TLSv1 TLSv1.1 TLSv1.2`. | TLS 1.0 e 1.1 sono deprecati (RFC 8996) e permettono attacchi di downgrade. | Usare `ssl_protocols TLSv1.2 TLSv1.3;` con le cipher del profilo Mozilla intermediate. |
| C-08 | P2 | `docker-compose.yml:17-19`, `.env.example:3` | Redis gira senza autenticazione (`REDIS_URL` non ha credenziali e non c'è `requirepass` né ACL). | Il rischio è ridotto perché la porta non è pubblicata, ma qualunque container sulla rete `interna`, nginx compreso, può leggere e scrivere sessioni e cache. | Attivare ACL o `requirepass` e passare la password tramite `.env`. Vedi anche C-11. |
| C-09 | P2 | `Dockerfile:1-7` | Nel `Dockerfile` mancano due cose: un utente non privilegiato (non c'è `USER`, quindi il processo gira come root nel container) e una versione fissata dell'immagine. | Un'evasione dal container o un bug dell'app ha più impatto. Le build non sono riproducibili e possono cambiare versione maggiore di Node senza preavviso. | Usare un'immagine LTS fissata, meglio con digest (per esempio `node:<LTS>-slim@sha256:…`), aggiungere `USER node` e valutare una build multi-stage. |
| C-10 | P2 | `docker-compose.yml:24-25`, `nginx.conf:9-10` | nginx si aspetta i certificati in `/etc/nginx/certs/`, ma il compose monta solo `nginx.conf`. | nginx non parte. C'è anche il rischio che, per sistemare il problema, la chiave privata venga copiata nell'immagine o nel repository. | Montare i certificati in sola lettura da un percorso fuori dal repository, oppure da un secret. Tenere `privkey.pem` con permessi ristretti. |
| C-11 | P3 | `docker-compose.yml:6,16,19,27` | C'è una sola rete piatta (`interna`) per tutti i servizi. | nginx raggiunge direttamente db e redis, quindi la segmentazione è assente. | Creare due reti: `frontend` (nginx e app) e `backend` (app, db e redis, con `internal: true`). |
| C-12 | P3 | `nginx.conf:6-20` | Mancano gli header di sicurezza (`X-Content-Type-Options`, `Content-Security-Policy`, `frame-ancestors`/`X-Frame-Options`, `Referrer-Policy`) e `server_tokens off`. Manca anche il server sulla porta 80 con il redirect a HTTPS, e non c'è `X-Forwarded-Proto`. | Hardening HTTP incompleto e versione di nginx visibile. L'app non sa che la richiesta arriva in HTTPS, il che conta per i cookie `Secure`. | Aggiungere gli header e `server_tokens off`, aggiungere un server `listen 80` con `return 301 https://…`, e impostare `proxy_set_header X-Forwarded-Proto $scheme;`. Valutare `limit_req` sulle rotte di login. |
| C-13 | P3 | `docker-compose.yml` (tutti i servizi) | Nessun servizio ha `restart`, `read_only`, `cap_drop`, `no-new-privileges` né limiti di risorse, e il `Dockerfile` non ha `HEALTHCHECK`. | Resilienza e hardening dei container ridotti. | Aggiungere `security_opt: [no-new-privileges:true]`, `cap_drop: [ALL]` dove possibile, i limiti di memoria e CPU e un healthcheck. |
| C-14 | P3 | `.env.example:2` | La `DATABASE_URL` non ha `sslmode`. | Il traffico tra app e database viaggia in chiaro, ma solo sulla rete Docker locale. | Va bene finché il database resta locale. Se il database diventa gestito o remoto, usare `sslmode=verify-full`. |

## Rischio residuo e priorità di remediation
1. Prima del go-live: C-01, C-02, C-03 e C-04. Ruotare subito ogni segreto che sia stato reale.
2. Poi C-05, C-06, C-07, C-08, C-09 e C-10.
3. I P3 sono hardening da pianificare.

Anche con tutti i rilievi chiusi restano rischi che questi file non mostrano: il codice dell'app, la configurazione IAM AWS e la gestione degli host.

## Limiti e aree non verificate
- Non ci sono il codice dell'app (`src/`) né `package.json`/`package-lock.json`, quindi la build così com'è fallirebbe e le dipendenze non sono valutabili.
- Non sono definiti cifratura, versioning, logging degli accessi, Object Ownership/ACL e lifecycle del bucket S3.
- Non sono definiti IAM (ruoli e credenziali con cui l'app accede a S3), backup del volume `dati`, cifratura a riposo del database e gestione dei certificati.
- La cartella non è un repository git, quindi non ho potuto controllare se `.env` sia già stato committato in passato.
- Non ho verificato se queste configurazioni siano già applicate in un ambiente reale.

## Piano di retest
Dopo le correzioni, rileggere i file modificati e verificare che:
- `bucket-policy.json` non abbia più un Principal `*` e che Block Public Access sia attivo (`aws s3api get-public-access-block`, in sola lettura e con l'ok dell'utente);
- `git check-ignore .env` dia esito positivo;
- l'immagine non contenga `.env` (per esempio `docker run --rm <img> ls -a /app`);
- non ci siano più `ports` su db;
- l'utente del container non sia root;
- un test TLS, passivo e autorizzato, accetti solo TLS 1.2 e 1.3.

## Handoff
- **Privacy & Compliance**: le fatture contengono dati personali. Se il bucket è già stato pubblico con dati reali, va valutata una possibile violazione (art. 33 GDPR) insieme al privacy-breach-response. Lo stesso vale per i log con header Authorization (C-06) e per la loro conservazione.
- **Software Agency (DevOps)**: le correzioni le implementa la Software Agency dopo il tuo ok. Io non ho modificato nessun file.

Firmato: ALNILAM (AICA-04)