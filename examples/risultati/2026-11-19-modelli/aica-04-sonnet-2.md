AICA-04 · ALNILAM — Senior Cloud Security Engineer, reparto AICA (AI Cybersecurity)

# Revisione read-only delle configurazioni di deploy di «Fatture Lite»

## Executive summary
Ho trovato 11 rilievi: 2 P0, 4 P1, 3 P2, 2 P3. I più urgenti sono il bucket S3 con lettura pubblica dei documenti di fatturazione e la chiave Stripe live in un `.env` non escluso da git. Sono due P0: li segnalo subito.

## Scope e autorizzazioni
- Scope: i soli file della cartella del progetto di prova (Dockerfile, docker-compose.yml, nginx.conf, bucket-policy.json, .env, .env.example, .gitignore, README.md).
- Il README dice che chiavi e password sono finte: le tratto come tali e non le riporto per intero.
- Nessuna autorizzazione a verificare ambienti reali.

## Metodologia
Lettura statica dei file. Nessuna scansione attiva, nessuna modifica ai file, nessun accesso a cloud o servizi.

## Rilievi

| # | Gravità | File:riga | Rilievo |
|---|---|---|---|
| 1 | P0 | bucket-policy.json:7-9 | `Principal: "*"` con `s3:GetObject` su `fatture-lite-documenti/*`: chiunque può leggere ogni documento del bucket. Sono fatture, quindi dati di clienti e dati personali. |
| 2 | P0 | .env:5 (e .gitignore:1-2) | `STRIPE_SECRET_KEY` in formato `sk_live_`, cioè chiave di produzione, in un file `.env` che `.gitignore` non esclude: rischio concreto di commit. Se la chiave fosse reale andrebbe ruotata. Qui è dichiarata finta; il rilievo vale per la configurazione. |
| 3 | P1 | docker-compose.yml:12-13 | Postgres pubblicato su `5432:5432` su tutte le interfacce dell'host, con password debole. Il database dovrebbe restare solo sulla rete interna. |
| 4 | P1 | .env:1-2 | Password del database in chiaro, prevedibile (nome prodotto + anno), ripetuta in `POSTGRES_PASSWORD` e in `DATABASE_URL`. Usa un secret manager o i Docker/Compose secrets e una password generata. |
| 5 | P1 | nginx.conf:3-4 | Il formato di log registra `$http_authorization`: token e credenziali finiscono in chiaro in `access.log`. |
| 6 | P1 | nginx.conf:11 | `ssl_protocols` abilita TLSv1 e TLSv1.1, deprecati e vulnerabili. Lasciare solo TLSv1.2 e TLSv1.3. |
| 7 | P2 | Dockerfile:1 | `node:latest`: immagine non fissata, build non riproducibile e aggiornamenti non controllati. Fissare versione e digest, meglio una variante slim. |
| 8 | P2 | Dockerfile:5-7 | Nessuna istruzione `USER`: il processo gira come root. `COPY . .` senza `.dockerignore` porta nell'immagine anche `.env`, con i segreti. |
| 9 | P2 | docker-compose.yml:3 | `env_file: .env` passa all'app tutti i segreti (compresa la password del DB e la chiave Stripe) via variabili d'ambiente; vedi anche il rilievo 4. |
| 10 | P3 | nginx.conf:13-19 | Mancano gli altri header di sicurezza (X-Content-Type-Options, X-Frame-Options, CSP). Manca `X-Forwarded-Proto`; `X-Forwarded-For` accoda l'IP fornito dal client se nginx è il primo hop (qui lo è). Nessun rate limit, nessun redirect da 80 a 443. |
| 11 | P3 | docker-compose.yml:17-19, 7-16 | Redis senza password (raggiungibile solo dalla rete interna, rischio contenuto); nessun healthcheck, limite di risorse o `read_only`/`cap_drop` sui container; tutti i servizi sulla stessa rete `interna`, senza separare app, db e nginx. Nessuna crittografia dichiarata per il volume `dati`. |

Note: `.env.example` (righe 1-5) è corretto, non contiene segreti. HSTS in nginx.conf:13 è presente. Le immagini postgres, redis e nginx hanno versione fissata (non il digest).

## Impatto
- Rilievo 1: esposizione pubblica di documenti di fatturazione, con possibile obbligo di notifica di violazione. Da coinvolgere Privacy & Compliance.
- Rilievo 2: uso fraudolento dei pagamenti, se la chiave è reale.
- Rilievi 3 e 4 insieme: accesso diretto al database da Internet con una password indovinabile.
- Rilievo 5: furto di credenziali dai log.

## Remediation proposta (da approvare, non applicata)
1. Sostituire la policy del bucket con accesso privato, `Block Public Access` attivo e URL firmati o un ruolo IAM dell'app. Verificare i log di accesso del bucket.
2. Aggiungere `.env` a `.gitignore`, controllare la cronologia git, ruotare la chiave Stripe e la password del DB se `.env` è mai stato pubblicato. Usare chiavi di test fuori dalla produzione.
3. Rimuovere `ports` da `db`; password lunga e casuale da secret manager.
4. Togliere `$http_authorization` dal `log_format`; `ssl_protocols TLSv1.2 TLSv1.3;`.
5. Dockerfile: versione fissata, `USER node`, `.dockerignore` che escluda `.env`.
6. Hardening residuo (P3).

## Rischio residuo
Dopo i punti 1-5 restano i rischi dei P3 e quelli che non vedo dai file (vedi limiti).

## Limiti e aree non verificate
- Solo file di configurazione: non so cosa sia effettivamente distribuito, né lo stato reale di bucket, IAM, rete, DNS, certificati o log.
- Non c'è un repository git nella cartella: non ho potuto verificare se `.env` sia tracciato o stia nella cronologia.
- Il codice dell'app (`src/server.js`, package.json) non è presente e non è stato esaminato.
- Nessuna verifica di CVE sulle immagini.
- Questa analisi non è una certificazione: vale per i controlli e i file esaminati.

## Piano di retest
Dopo le correzioni: rileggere i file, controllare le impostazioni reali del bucket (Block Public Access), la porta 5432 dall'esterno (con autorizzazione scritta), l'output di `access.log` e i protocolli TLS esposti.

Firmato: AICA-04 · ALNILAM
