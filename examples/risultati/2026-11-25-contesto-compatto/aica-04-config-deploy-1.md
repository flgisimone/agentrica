AICA-04 · ALNILAM — Senior Cloud Security Engineer, reparto AICA (AI Cybersecurity)

Nota: il direttore AICA-01 · VEGA era già caricato nella sessione e mi ha assegnato il compito. Non ho usato i tool di Agentrica, nemmeno la biblioteca, perché nessuna scheda è segnata per il mio ruolo.

## Sintesi per la direzione
Ho rivisto in sola lettura le configurazioni di deploy di «Fatture Lite» (app Node, Postgres, Redis, nginx, documenti su S3). Ho trovato 2 rilievi P1 e 4 rilievi P2 che vanno chiusi prima della produzione, più 4 rilievi P3 di rafforzamento. Il rilievo più grave è il bucket S3 dei documenti con lettura pubblica (P1). Subito dopo viene il log di nginx che scrive l'header `Authorization` in chiaro (P1).

## Perimetro e autorizzazioni
- **Perimetro:** i soli file nella cartella di lavoro assegnata: `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `bucket-policy.json`, `.gitignore`, `.env.example`, `.env`, `README.md`.
- **Autorizzazione:** il compito è una revisione read-only richiesta dal direttore. Non ho fatto scansioni attive, non ho avviato processi e non ho modificato nulla.
- **Contesto:** il README dichiara che è un progetto di prova con chiavi e password finte.

## Metodologia
Ho fatto un'analisi documentale dei file, senza accedere ad alcuna risorsa cloud reale. Di `.env` ho letto solo i nomi delle variabili: i valori sono redatti e non compaiono in questo rapporto.

## Rilievi

**1. P1. Bucket S3 con lettura pubblica**
- **Dove:** `bucket-policy.json` righe 5-10. La Statement `LetturaDocumenti` ha `Effect: Allow`, `Principal: "*"`, `Action: s3:GetObject` su `arn:aws:s3:::fatture-lite-documenti/*`.
- **Fatto:** chiunque, senza autenticazione, può leggere ogni oggetto del bucket.
- **Impatto:** il bucket contiene i documenti di un servizio di fatturazione, quindi probabilmente dati personali e finanziari di terzi. Se il bucket è raggiungibile, i documenti sono scaricabili da chiunque conosca o indovini la chiave. Coinvolgere Privacy & Compliance (possibile violazione dei dati, se è già in produzione).
- **Correzione:** sostituire `Principal: "*"` con il ruolo IAM dell'app. Attivare S3 Block Public Access. Se servono link per i clienti, usare URL pre-firmati con scadenza breve. Aggiungere cifratura lato server e log di accesso al bucket.
- **Verifica:** controllare che un `GetObject` anonimo restituisca 403.
- **Limite:** non ho potuto verificare l'ACL né il Block Public Access effettivi dell'account, perché ho esaminato solo il file.

**2. P1. Il log di nginx registra l'header Authorization**
- **Dove:** `nginx.conf` riga 3, `log_format completo` con `"$http_authorization"`, usato alla riga 4.
- **Fatto:** token e credenziali Basic o Bearer finiscono in chiaro in `/var/log/nginx/access.log`.
- **Impatto:** chi legge i log (o un backup o un sistema di log centralizzato) può riusare le sessioni o i token. Si crea anche un'altra copia di dati sensibili.
- **Correzione:** togliere `$http_authorization` dal formato, ruotare i token già passati nei log, e fissare la conservazione e l'accesso ai log.

**3. P2. Postgres pubblicato sull'host**
- **Dove:** `docker-compose.yml` righe 12-13, `ports: "5432:5432"`.
- **Fatto:** la porta è mappata su tutte le interfacce dell'host, mentre l'app raggiunge `db` già sulla rete interna.
- **Impatto:** il database è esposto in rete, con la sola password come difesa. Se l'host ha un IP pubblico o un firewall permissivo, aumenta molto il rischio.
- **Correzione:** rimuovere `ports` dal servizio `db`. Se serve l'accesso per amministrazione, usare `127.0.0.1:5432:5432` o un tunnel.

**4. P2. Protocolli TLS obsoleti**
- **Dove:** `nginx.conf` riga 11, `ssl_protocols TLSv1 TLSv1.1 TLSv1.2;`.
- **Fatto:** sono abilitati TLS 1.0 e 1.1, deprecati e vietati da RFC 8996. Mancano anche `ssl_ciphers` e `ssl_prefer_server_ciphers`.
- **Correzione:** usare `ssl_protocols TLSv1.2 TLSv1.3;` con una suite di cifrari moderna.

**5. P2. Segreti reali in `.env` non esclusi da git**
- **Dove:** `.gitignore` righe 1-2 (contiene solo `node_modules/` e `*.log`); `.env` presente nella cartella con `POSTGRES_PASSWORD`, `DATABASE_URL` e `STRIPE_SECRET_KEY` valorizzate (il prefisso `sk_` indica una chiave Stripe).
- **Fatto:** `.env` non è ignorato. In questa copia non c'è una cartella `.git`, quindi non posso dire se sia già stato committato.
- **Impatto:** se `.env` finisce nel repository, i segreti restano nella storia di git. Anche se i valori di prova sono finti, la configurazione è quella che andrebbe in produzione. Inoltre `COPY . .` nel Dockerfile (riga 5) copia `.env` dentro l'immagine, e non c'è un `.dockerignore`.
- **Correzione:** aggiungere `.env` a `.gitignore` e un `.dockerignore`. Verificare nella storia di git e ruotare i segreti se sono già stati committati. In produzione usare un gestore di segreti (per esempio AWS Secrets Manager) al posto del file.
- **Nota:** non riporto i valori. `.env.example` è corretto, perché ha valori vuoti.

**6. P2. App senza protezioni di base sul reverse proxy**
- **Dove:** `nginx.conf` righe 13-19.
- **Fatto:** c'è solo HSTS. Mancano `X-Content-Type-Options`, `X-Frame-Options` o CSP e `Referrer-Policy`. Mancano anche limiti di richiesta (`limit_req`), `client_max_body_size` e `server_tokens off`. Non c'è un redirect da 80 a 443, perché la porta 80 non è esposta.
- **Impatto:** mancano difese in profondità. L'assenza di rate limit rende possibili brute force e DoS applicativo.
- **Nota:** la gravità P2 dipende dalla CSP e dai limiti che l'app applica già, e questo non l'ho verificato.
- **Correzione:** aggiungere gli header, i limiti e `server_tokens off`. Con `X-Forwarded-For` valutare anche `X-Forwarded-Proto`.

**7. P3. Immagine base non fissata e processo come root**
- **Dove:** `Dockerfile` riga 1, `FROM node:latest`; nessuna istruzione `USER`.
- **Fatto:** `latest` cambia nel tempo, quindi le build non sono riproducibili e può portare cambi di versione major. L'app gira come root nel container.
- **Correzione:** fissare una versione LTS (meglio con digest), per esempio `node:<lts>-slim`, e aggiungere `USER node`. Valutare una build multi-stage.

**8. P3. Redis senza autenticazione**
- **Dove:** `docker-compose.yml` righe 17-19; `.env.example` riga 3, `redis://redis:6379`.
- **Fatto:** nessuna password. Redis non pubblica porte ed è sulla rete `interna`, quindi il rischio è circoscritto.
- **Correzione:** `requirepass` o ACL, specie se la rete interna ospita altri servizi.

**9. P3. Nessun limite di risorse né healthcheck**
- **Dove:** `docker-compose.yml`, tutti i servizi.
- **Fatto:** mancano limiti di memoria e CPU, `restart`, `healthcheck` e `read_only`.
- **Correzione:** aggiungerli. Con `cap_drop: [ALL]` e `no-new-privileges` si riduce la superficie.

**10. P3. Tag delle immagini non fissati al digest e `.env.example` con dettagli di connessione**
- **Dove:** `docker-compose.yml` righe 8, 18, 21 (tag di minor, non digest); `.env.example` riga 2.
- **Fatto:** i tag sono ragionevoli (versione specifica), ma non immutabili.
- **Correzione:** fissare i digest e una scansione periodica delle immagini.

## Controlli osservati senza rilievi
- HSTS presente con `always` (`nginx.conf` riga 13).
- Rete `interna` condivisa da tutti i servizi.
- Config nginx montata in sola lettura (`docker-compose.yml` riga 25).
- `POSTGRES_PASSWORD` letta da variabile d'ambiente e non scritta nel compose.
- `.env.example` senza valori.

Ognuno vale solo per quel controllo, non per il progetto nel suo insieme.

## Rischio residuo e limiti
- **Non verificato:** l'infrastruttura reale (IAM, Block Public Access, security group, cifratura di S3 e del volume Postgres), il codice dell'app (`src/server.js` non è nella cartella), il contenuto di `package.json`, la gestione degli errori e le dipendenze.
- **Non verificato:** i certificati TLS in `/etc/nginx/certs/` e il resto della conservazione dei log.
- **Non eseguito:** nessuna scansione attiva e nessuna lettura dei valori dei segreti.
- Questa analisi non è una certificazione né una dichiarazione di conformità.

## Piano di nuova verifica
Dopo le correzioni, rivedere in sola lettura i file modificati e controllare dall'esterno (con autorizzazione scritta) l'accesso anonimo al bucket, la porta 5432 e i protocolli TLS. Poi passare al diff.

## Domande aperte per VEGA
1. Il bucket e i servizi sono già in produzione o solo da distribuire? Se sono attivi, il rilievo 1 va trattato come possibile esposizione di dati.
2. `.env` è già stato committato in un repository? Se sì, va ruotata la chiave Stripe.
3. Chi è il responsabile umano per le correzioni (IAM e S3)?

Priorità proposte da confermare con l'utente. Dato che i rilievi 1 e 2 sono P1 e io lavoro su Sonnet, propongo il riesame di VEGA o di un revisore su Opus prima che diventino definitivi.

AICA-04 · ALNILAM — Senior Cloud Security Engineer, reparto AICA (AI Cybersecurity)
