«AICA-04 · ALNILAM — Senior Cloud Security Engineer, reparto AICA (AI Cybersecurity)»

# Revisione delle configurazioni di deploy di «Fatture Lite»

## Sintesi
Ho letto i 7 file di configurazione senza modificarli. Ho trovato **4 rilievi P1**, **4 P2** e **5 P3**. I più gravi:
- il bucket S3 dei documenti è leggibile da chiunque;
- `.env` finisce dentro l'immagine Docker;
- la porta di Postgres è aperta all'host;
- nginx scrive nei log l'header `Authorization`.

Nessun rilievo è P0: il README dice che il progetto non è ancora in produzione. Se la policy del bucket fosse già applicata a documenti reali, il rilievo F1 diventerebbe P0 e andrebbe contenuto subito.

## Perimetro e autorizzazioni
- **Autorizzazione:** la revisione in sola lettura richiesta dal compito.
- **File esaminati:** `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `bucket-policy.json`, `.gitignore`, `.env.example`, `README.md`.
- **`.env`:** ho letto solo i nomi delle variabili, non i valori. Un controllo successivo sui prefissi dei valori è stato bloccato dai permessi e non l'ho ripetuto. Nessun segreto compare in questo rapporto.
- **Non fatto:** nessuna scansione attiva, nessun accesso a cloud, container o bucket reali.

## Metodo
Revisione documentale riga per riga, confrontata con le buone pratiche note:
- CIS Docker;
- Mozilla TLS guidelines;
- AWS S3 Block Public Access;
- OWASP Logging.

## Registro delle misconfigurazioni

| ID | Gravità | File:riga | Rilievo | Impatto | Correzione proposta |
|---|---|---|---|---|---|
| F1 | P1 | `bucket-policy.json:5-9` | `Principal: "*"` con `s3:GetObject` su `fatture-lite-documenti/*`: lettura pubblica di tutti i documenti di fatturazione. | Chiunque conosca o indovini una chiave scarica le fatture, che contengono dati personali e fiscali. È un possibile data breach. | Togliere lo statement pubblico. Attivare Block Public Access su account e bucket. Dare accesso solo al ruolo IAM dell'app e servire i file tramite URL presigned a scadenza breve. |
| F2 | P1 | `Dockerfile:5` con `.gitignore:1-2` | `COPY . .` senza `.dockerignore`: `.env` (con `POSTGRES_PASSWORD`, `DATABASE_URL`, `STRIPE_SECRET_KEY`) entra in un layer dell'immagine. `.env` non è nemmeno in `.gitignore`. | Chi ottiene l'immagine (registry, cache CI) ottiene i segreti. C'è anche il rischio di commit accidentale. La cartella non è un repository git, quindi non ho potuto verificare la storia. | Creare `.dockerignore` con `.env`, `.git`, `node_modules`. Aggiungere `.env` a `.gitignore`. Passare i segreti a runtime con un secret manager o i Docker/compose secrets. Se un `.env` reale è mai finito in un'immagine o in un commit, ruotare le chiavi. |
| F3 | P1 | `docker-compose.yml:12-13` | `ports: "5432:5432"` pubblica Postgres su tutte le interfacce dell'host. | Il database è raggiungibile da fuori, esposto a brute force e a exploit. Docker scrive regole iptables che di solito scavalcano ufw. | Togliere `ports` (l'app usa la rete `interna`). Se serve l'accesso dall'host: `127.0.0.1:5432:5432` o un tunnel SSH. |
| F4 | P1 | `nginx.conf:3-4` | Il `log_format completo` registra `$http_authorization`. | Token e credenziali Basic o Bearer finiscono in chiaro nei log di accesso, e nella pipeline dei log se vengono raccolti. | Togliere `$http_authorization` dal formato. Trattare i log già prodotti come contenenti segreti: cancellarli o restringerne l'accesso, ed eventualmente ruotare i token. |
| F5 | P2 | `nginx.conf:11` | `ssl_protocols TLSv1 TLSv1.1 TLSv1.2`. | TLS 1.0 e 1.1 sono deprecati (RFC 8996) e vulnerabili a downgrade. | `ssl_protocols TLSv1.2 TLSv1.3;` con cipher suite moderne (profilo Mozilla «intermediate»). |
| F6 | P2 | `Dockerfile:1-7` | Nessuna istruzione `USER`: il processo Node gira come root nel container. | Una RCE nell'app ottiene root nel container e una superficie maggiore per l'escape. | `USER node` (l'utente esiste nelle immagini ufficiali), file in sola lettura per l'utente. In compose valutare `read_only: true`, `cap_drop: [ALL]`, `security_opt: [no-new-privileges:true]`. |
| F7 | P2 | `Dockerfile:1` | `FROM node:latest`: immagine non fissata, completa e non slim. | Build non riproducibili, aggiornamenti non controllati, superficie di CVE ampia. | Versione LTS fissata e variante slim o alpine, possibilmente per digest (es. `node:<LTS>-slim@sha256:…`). Scansione dell'immagine in CI. |
| F8 | P2 | `docker-compose.yml:10-11` con `.env.example:2` | L'app si connette con `POSTGRES_USER` (`fatture`), che l'immagine postgres crea come superuser. | Una SQL injection o un furto della connection string danno pieni poteri sul cluster. | Un ruolo applicativo separato con i soli privilegi necessari su schema e tabelle. Il superuser solo per migrazioni e amministrazione. |
| F9 | P3 | `docker-compose.yml:17-19` con `.env.example:3` | Redis senza password né ACL (`redis://redis:6379`). | Il rischio è mitigato perché la porta non è pubblicata, ma chiunque arrivi sulla rete `interna` (es. tramite SSRF o un container compromesso) legge e scrive in Redis. | `requirepass` o un utente ACL, URL con credenziali da secret. |
| F10 | P3 | `docker-compose.yml:6, 16, 19, 27-29` | Un'unica rete `interna` per nginx, app, db e redis. | Nessuna segmentazione: nginx raggiunge direttamente db e redis. | Due reti: `frontend` (nginx e app) e `backend` (app, db, redis), con `internal: true` sulla rete backend. |
| F11 | P3 | `nginx.conf:6-19` | Solo HSTS. Mancano `server_tokens off`, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy` e `X-Forwarded-Proto` verso l'app. Manca anche un server su :80 con redirect a HTTPS. | Hardening incompleto, e l'app può non sapere che la richiesta è arrivata in HTTPS. | Aggiungere gli header e `proxy_set_header X-Forwarded-Proto $scheme;`. Aggiungere il blocco `listen 80` con `return 301 https://$host$request_uri;`. |
| F12 | P3 | `bucket-policy.json:3-11` | Manca un `Deny` su `aws:SecureTransport = false`. | Sono possibili accessi in HTTP. | Aggiungere lo statement Deny per il transport non cifrato. |
| F13 | P3 | `.env.example:2` | `DATABASE_URL` senza `sslmode`. | Il traffico app-db passa in chiaro. Oggi resta sulla rete Docker locale, ma diventa un problema se il db viene spostato su un host o un servizio gestito. | `sslmode=require` o `verify-full` quando il db non è più sullo stesso host. |

Osservazione: `.env.example` non contiene valori ed è corretto.

## Piano di hardening
1. **Prima di qualunque pubblicazione:** F1, F2, F3, F4.
2. **Prima del go-live:** F5, F6, F7, F8.
3. **Hardening successivo:** F9 a F13.

## Rischio residuo e aree non verificate
- Senza il codice non ho potuto valutare l'applicazione (`src/server.js`, gestione delle sessioni, uso di Stripe).
- Non ho visto la configurazione AWS: Block Public Access, cifratura SSE e KMS, versioning, access logging, CloudTrail, ruoli IAM dell'app. Non so nemmeno se la policy è già applicata.
- Non ho controllato il firewall dell'host, i certificati, la rotazione dei log, i backup del volume `dati`, né la storia git (la cartella non è un repository).
- Questa revisione riguarda solo i controlli elencati. Non certifica che il deploy sia sicuro nel suo insieme.
- Le fatture contengono dati personali: per F1 e F4 conviene coinvolgere il reparto Privacy & Compliance (AIPCA) per valutare se c'è stata una violazione, nel caso la configurazione sia già stata usata.

## Retest
Dopo le correzioni, i controlli da ripetere:
- rilettura dei file;
- `docker history` o ispezione dei layer, per confermare che `.env` non c'è più;
- `docker compose config`, per confermare che db non ha porte pubblicate;
- con autorizzazione: test TLS (es. testssl.sh) sul dominio, verifica della policy del bucket con IAM Access Analyzer, e un GET anonimo su un oggetto di prova, che deve rispondere 403.

Non ho modificato nessun file. Tutte le correzioni sono proposte da confermare con l'utente.

— AICA-04 · ALNILAM