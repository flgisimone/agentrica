AICA-04 · ALNILAM — Senior Cloud Security Engineer, reparto AICA (AI Cybersecurity)

(Il direttore AICA-01 · VEGA è già caricato nella sessione e mi ha assegnato il compito.)

## Sintesi per la direzione
Ho fatto una revisione documentale in sola lettura delle configurazioni di deploy di «Fatture Lite» (app Node, Postgres, Redis, nginx, documenti su S3). Ho trovato 3 rilievi P1, 4 P2 e 2 P3. I più urgenti sono il bucket S3 con documenti di fatturazione leggibili da chiunque, il log di nginx che scrive le credenziali e il database esposto sull'host. Qui non dichiaro sicuro nessun elemento dell'insieme.

## Perimetro e autorizzazioni
- Perimetro: i file nella cartella `config-deploy-2`: Dockerfile, docker-compose.yml, nginx.conf, bucket-policy.json, .env, .env.example, .gitignore, README.md.
- Autorizzazione: il compito me l'ha assegnato il direttore e chiede esplicitamente una revisione in sola lettura.
- Il README dice che chiavi e password sono finte. Lo tratto come un'ipotesi, perché i valori hanno la forma di quelli reali.
- Non ho toccato risorse live (AWS, host, rete), non ho eseguito scansioni né modificato file, e non ho avviato processi.

## Metodologia e risorse esaminate
Ho letto ogni file per intero e ho confrontato le configurazioni tra loro, ad esempio compose con nginx e .env con .gitignore. Ho consultato solo i file della cartella. La biblioteca del reparto non ha schede segnate per il mio ruolo e non l'ho usata. Per versioni e protocolli mi baso quindi sulle mie conoscenze, che non sono una fonte e vanno verificate.

## Rilievi

**1. P1. Bucket S3 con lettura pubblica**
- Dove: `bucket-policy.json` righe 6-9.
- Evidenza (fatto): `"Effect": "Allow"`, `"Principal": "*"`, `"Action": "s3:GetObject"`, `"Resource": "arn:aws:s3:::fatture-lite-documenti/*"`.
- Impatto: ogni oggetto del bucket dei documenti di un servizio di fatturazione è leggibile da chiunque conosca o indovini la chiave. Le fatture contengono dati personali e fiscali. È una potenziale violazione di dati, quindi coinvolgere Privacy & Compliance.
- Correzione: restringere il Principal al ruolo IAM dell'app. In alternativa usare URL pre-firmati con scadenza breve. Attivare il blocco dell'accesso pubblico del bucket e la cifratura lato server.
- Da verificare: non so se Block Public Access sia attivo a livello di account o bucket. È un controllo compensativo possibile, ma non è provato dai file.

**2. P1. Il log di nginx registra l'header Authorization**
- Dove: `nginx.conf` riga 3, usata dalla riga 4.
- Evidenza: il `log_format` include `"$http_authorization"`.
- Impatto: token e credenziali di ogni richiesta finiscono in chiaro in `/var/log/nginx/access.log`. Chi legge i log, o li riceve da un aggregatore, può riusarli.
- Correzione: togliere `$http_authorization` dal formato. Se i log sono già stati prodotti, trattarli come contenenti segreti, ruotare le credenziali interessate e verificare dove sono stati copiati.

**3. P1. Segreti reali in `.env` non esclusi da git**
- Dove: `.gitignore` righe 1-2 (contiene solo `node_modules/` e `*.log`) e `.env` righe 1, 2, 5.
- Evidenza redatta: il file `.env` presente nel progetto contiene `POSTGRES_PASSWORD`, una `DATABASE_URL` con la password incorporata e `STRIPE_SECRET_KEY=sk_live_…`. Il prefisso `sk_live_` indica una chiave di produzione, anche se il valore sembra finto. Non riporto i valori.
- Impatto: il file può finire nel repository o nella storia di git. Una chiave Stripe live permette operazioni sui pagamenti. La stessa password compare due volte.
- Correzione: aggiungere `.env` al `.gitignore` e verificare che non sia già nella storia di git. Ruotare le credenziali se sono mai state committate. Usare un gestore di segreti (Secrets Manager, Parameter Store) o i secrets di Docker. Se la chiave è davvero live, usare una restricted key.
- Limite: non so se `.env` sia tracciato, perché nella cartella non c'è `.git`.

**4. P2. Postgres esposto sull'host**
- Dove: `docker-compose.yml` righe 12-13.
- Evidenza: `ports: "5432:5432"` sul servizio `db`.
- Impatto: la porta è pubblicata su tutte le interfacce dell'host. Il database di fatturazione è raggiungibile dall'esterno se il firewall non lo blocca, con un'unica password a protezione. Il servizio è già sulla rete interna `interna`, quindi la pubblicazione non serve all'app.
- Correzione: rimuovere `ports` dal servizio `db`. Se serve l'accesso amministrativo, legare a `127.0.0.1:5432:5432` o usare un tunnel.
- Da verificare: i security group e il firewall dell'host, non visibili qui. Ho classificato P2 solo per la possibile mitigazione esterna.

**5. P2. Password debole e riusata**
- Dove: `.env` righe 1-2.
- Evidenza: la password è breve, derivata dal nome del servizio e dall'anno, ed è la stessa in `POSTGRES_PASSWORD` e in `DATABASE_URL`. L'utente è `fatture`, come il nome del database. Non riporto il valore.
- Impatto: combinato con il rilievo 4, è un obiettivo facile per tentativi di accesso.
- Correzione: generare una password lunga e casuale, mantenerla in un solo posto e costruire l'URL da quella.

**6. P2. TLS 1.0 e 1.1 abilitati**
- Dove: `nginx.conf` riga 11.
- Evidenza: `ssl_protocols TLSv1 TLSv1.1 TLSv1.2;`
- Impatto: due protocolli deprecati e vulnerabili restano disponibili per un servizio che tratta dati finanziari. Questo è un controllo noto da riverificare sulla fonte ufficiale, perché non ho accesso alla biblioteca per questo tema.
- Correzione: `ssl_protocols TLSv1.2 TLSv1.3;` e un elenco di cifrari moderno.

**7. P2. Immagine base non fissata e container come root**
- Dove: `Dockerfile` riga 1 e assenza di `USER`.
- Evidenza: `FROM node:latest`, nessuna istruzione `USER`, `COPY . .` alla riga 5.
- Impatto: build non riproducibili, con aggiornamenti di versione maggiore non controllati. Il processo gira come root nel container, quindi una compromissione dell'app ha più privilegi del necessario. `COPY . .` copia nell'immagine anche `.env`, se non c'è un `.dockerignore`, e inserisce i segreti nei livelli dell'immagine. Nella cartella non c'è `.dockerignore`.
- Correzione: fissare una versione e meglio il digest, ad esempio `node:<LTS>-slim`. Aggiungere `USER node`. Creare un `.dockerignore` che escluda `.env`, `.git` e i file non necessari. Usare un build multi-stage.

**8. P3. Mancano header di sicurezza e limiti in nginx**
- Dove: `nginx.conf` righe 13-19.
- Evidenza: c'è solo HSTS. Mancano `X-Content-Type-Options`, `X-Frame-Options` o `frame-ancestors` in una CSP, e `Referrer-Policy`. Mancano anche `limit_req` e `client_max_body_size`. Inoltre `X-Forwarded-For` è accodato con `$proxy_add_x_forwarded_for` senza `X-Forwarded-Proto`.
- Impatto: difesa in profondità ridotta. Alcuni header possono comunque essere impostati dall'app.
- Correzione: aggiungere gli header mancanti e un limite di frequenza almeno sulle rotte di autenticazione. Impostare `server_tokens off`.

**9. P3. Redis senza autenticazione, nessun healthcheck né limiti di risorse**
- Dove: `docker-compose.yml` righe 17-19 e 1-31.
- Evidenza: Redis non ha `requirepass`, `REDIS_URL` non ha credenziali (`.env.example` riga 3) e la porta non è pubblicata. I servizi non hanno limiti di risorse né `read_only`, e non c'è `security_opt: no-new-privileges`. Nginx è sulla stessa rete dell'app e dei database, senza segmentazione.
- Impatto: il rischio è circoscritto perché Redis è raggiungibile solo dalla rete interna. Un container compromesso, però, accede a Redis e a Postgres senza barriere.
- Correzione: abilitare l'autenticazione su Redis, separare le reti (una `frontend` per nginx e app, una `backend` per db e redis) e applicare l'hardening dei container.

## Impatto complessivo
Il rischio principale è l'accesso non autorizzato a documenti e dati di fatturazione, per tre vie indipendenti: il bucket pubblico, le credenziali nei log e il database esposto con una password debole.

## Rischio residuo, limiti e aree non verificate
- Non ho verificato lo stato reale di AWS (Block Public Access, IAM, cifratura e versioning del bucket, log di accesso), né firewall e security group dell'host. I rilievi 1 e 4 dipendono da questi elementi.
- Non ho il codice dell'app (`src/server.js`): autenticazione, validazione degli input e gestione dei segreti nel codice sono fuori perimetro.
- Non ho `package.json` né lockfile, quindi non ho esaminato le dipendenze. Le versioni delle immagini (postgres, redis, nginx) vanno controllate contro gli advisory correnti.
- Nessun controllo su backup, rotazione dei log, monitoraggio e certificati.
- Non ho consultato la biblioteca né il web, quindi le nozioni su TLS e sulle versioni possono essere superate.
- Lavoro su Sonnet. Tre rilievi sono P1: li propongo per il riesame del direttore VEGA o di un revisore su Opus prima che siano definitivi.
- Un controllo verificato vale solo per quel controllo e per le evidenze raccolte. Questa analisi non è una certificazione.

## Piano della nuova verifica
Dopo le correzioni: rileggere `bucket-policy.json`, `nginx.conf`, `docker-compose.yml`, `Dockerfile` e `.gitignore`. Verificare che `.env` non sia nella storia di git. Controllare in sola lettura le impostazioni AWS del bucket e la regola di firewall su 5432. Verificare l'effettiva rotazione delle credenziali.

## Domande aperte per VEGA e per l'utente
1. Il bucket e l'host sono già in produzione? In tal caso i rilievi 1, 2, 3 e 5 passano a segnalazione immediata e alla rotazione delle credenziali.
2. `.env` è tracciato in un repository?
3. Chi è il proprietario del bucket e dell'host, e c'è autorizzazione per verifiche in sola lettura sull'ambiente reale?
4. Il rilievo 1 coinvolge dati personali: serve Privacy & Compliance (art. 32 e valutazione di una violazione).

Non ho modificato nulla, come richiesto.

Firmato: AICA-04 · ALNILAM — Senior Cloud Security Engineer, reparto AICA (AI Cybersecurity)
