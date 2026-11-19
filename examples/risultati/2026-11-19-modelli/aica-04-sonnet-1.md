AICA-04 · ALNILAM — Senior Cloud Security Engineer, reparto AICA (AI Cybersecurity)

# Revisione read-only delle configurazioni di deploy di «Fatture Lite»

## Executive summary
Ho trovato 12 rilievi: 2 P1 gravi (bucket S3 leggibile da chiunque, token di autenticazione scritti nei log), 5 P1, 4 P2 e 1 P3, elencati sotto. Il nucleo: dati di fatturazione esposti pubblicamente, credenziali nei log e nel repository, database raggiungibile da fuori, TLS obsoleto. Nessun P0 certo, ma il rilievo 1 diventa P0 se il bucket contiene già documenti reali e non è protetto da Block Public Access. Questo è un controllo sui file di configurazione, non una certificazione.

## Scope, autorizzazioni, metodologia
- Scope: i soli file nella cartella del progetto (Dockerfile, docker-compose.yml, nginx.conf, bucket-policy.json, .env, .env.example, .gitignore, README.md), che il README indica come progetto di prova con chiavi finte. Autorizzazione presunta dal compito dell'utente.
- Metodo: lettura statica, nessuna scansione, nessun accesso ad AWS o ad altri servizi, nessuna modifica. Il file `.env` è stato letto solo per i nomi delle variabili; i valori non sono riportati e non li ho valutati.
- Fatti e ipotesi: i punti sotto sono fatti letti nei file, salvo dove scrivo "ipotesi".

## Rilievi (registro delle misconfigurazioni)

| # | Gravità | File:riga | Rilievo |
|---|---|---|---|
| 1 | P1 | bucket-policy.json:7-9 | `Principal: "*"` con `s3:GetObject` su `fatture-lite-documenti/*`: chiunque conosca o indovini una chiave legge i documenti. Sono fatture, quindi dati personali e finanziari. Diventa P0 se il bucket contiene già documenti reali. |
| 2 | P1 | nginx.conf:3-4 | Il log_format registra `$http_authorization`: token e credenziali dei clienti finiscono in chiaro in access.log (con IP e user agent), per sempre e con chi legge i log. |
| 3 | P1 | docker-compose.yml:12-13 | Postgres pubblicato su `5432:5432` su tutte le interfacce dell'host: il database è raggiungibile da fuori, mentre dovrebbe stare solo sulla rete `interna`. |
| 4 | P1 | nginx.conf:11 | `ssl_protocols TLSv1 TLSv1.1 TLSv1.2`: TLS 1.0 e 1.1 sono deprecati e vulnerabili. Meglio solo TLSv1.2 e TLSv1.3, con cifrari moderni. |
| 5 | P1 | .gitignore:1-2 (e .env) | `.env` non è ignorato da git. Nella cartella c'è un `.env` con 5 variabili, tra cui password del database e chiave Stripe (`STRIPE_SECRET_KEY`). Non è un repository git, quindi non posso dire se sia già stato committato (ipotesi: rischio alto). Se i segreti fossero reali andrebbero ruotati. |
| 6 | P1 | Dockerfile:1,5,7 | `FROM node:latest` (immagine non fissata, non riproducibile) e nessun `USER`: l'app gira come root nel container. Inoltre `COPY . .` (riga 5) senza `.dockerignore` copia nell'immagine anche `.env` e i segreti. |
| 7 | P2 | docker-compose.yml:4 | `env_file: .env`: la chiave Stripe e la password del database passano come variabili d'ambiente (visibili con `docker inspect`). Preferibili secret di Docker o un gestore di segreti. |
| 8 | P2 | docker-compose.yml:17-19 | Redis senza password né `requirepass`. Resta solo sulla rete interna, ma ogni container della rete vi accede senza autenticazione. |
| 9 | P2 | nginx.conf:13-19 | Mancano header di sicurezza (X-Content-Type-Options, X-Frame-Options/frame-ancestors, CSP, Referrer-Policy). HSTS c'è. Non c'è nemmeno la porta 80 con redirect a HTTPS (ipotesi: serve a evitare il primo accesso in chiaro). |
| 10 | P2 | nginx.conf:15-19 | Il proxy non imposta `X-Forwarded-Proto` né limiti (`limit_req`, `client_max_body_size`, timeout): nessuna protezione da abusi o da richieste enormi. `server_tokens` non è disattivato. |
| 11 | P2 | bucket-policy.json (intero) | Nessun controllo di cifratura (es. condizione `aws:SecureTransport`), nessuna indicazione di versioning, log di accesso o SSE. Non verificabile dai soli file, quindi limite della revisione. |
| 12 | P3 | docker-compose.yml:8,18,21 | Immagini fissate per versione minore ma non per digest, senza healthcheck né limiti di risorse; l'app non ha `restart` né utente non privilegiato nel compose. Hardening. |

Nota su .env.example: righe 1, 2 e 5 sono vuote o con segnaposto, quindi ok. Il `DATABASE_URL` richiede di scrivere la password in un secondo posto (duplicata rispetto a `POSTGRES_PASSWORD`), cosa che favorisce la divergenza e la fuga.

## Impatto
- Rilievo 1: lettura pubblica di fatture (dati personali, coinvolgere Privacy & Compliance Agency).
- Rilievi 2, 5: compromissione di credenziali e account.
- Rilievo 3: accesso diretto al database da internet con una sola password.
- Rilievi 4, 6: indebolimento del canale cifrato e del contenimento in caso di compromissione dell'app.

## Remediation proposta (da approvare, nulla è stato modificato)
1. Bucket: togliere `Principal: "*"`, abilitare S3 Block Public Access, usare accesso con ruolo IAM dedicato dell'app (o URL firmati a scadenza) e cifratura SSE. Verificare gli oggetti già presenti.
2. nginx: rimuovere `$http_authorization` dal log_format; ruotare i token eventualmente già finiti nei log e cancellare quei log.
3. Compose: rimuovere `ports` da `db` (o usare `127.0.0.1:5432:5432`); aggiungere password a Redis.
4. nginx: `ssl_protocols TLSv1.2 TLSv1.3;`, aggiungere header di sicurezza, redirect 80 a 443, `X-Forwarded-Proto`, limiti di richiesta.
5. Aggiungere `.env` al `.gitignore`; se fosse già nella cronologia git, ruotare tutti i segreti e ripulire la cronologia.
6. Dockerfile: immagine fissata (es. `node:22-slim` con versione o digest), `USER node`, file `.dockerignore` con `.env`, `.git`, `node_modules`.
7. Segreti tramite secret manager o Docker secret al posto di `env_file`.
Criteri di verifica: ripetere la revisione dei file; test passivi dall'esterno (porta 5432 chiusa, `ssl_protocols`, header) solo con autorizzazione.

## Rischio residuo
Se le correzioni 1-5 sono applicate resta un rischio medio-basso su dipendenze dell'app e segreti. Non è dichiarato sicuro il progetto nel suo insieme.

## Limiti e aree non verificate
Non esaminati: il codice dell'app (`src/server.js` e `package.json` non ci sono), IAM reale e impostazioni dell'account AWS, Block Public Access, security group e firewall dell'host, certificati, backup, contenuto del bucket, valori reali dei segreti. Non c'è un repository git: non so se `.env` sia stato committato.

## Piano di retest
Dopo le correzioni: rileggere i file, controllare la configurazione effettiva (`nginx -T`, `docker compose config`, policy e Block Public Access del bucket) e, con autorizzazione scritta, una verifica passiva da fuori.

Decisioni (priorità, ordine delle correzioni, approvazione delle modifiche) restano all'utente.

— AICA-04 · ALNILAM
