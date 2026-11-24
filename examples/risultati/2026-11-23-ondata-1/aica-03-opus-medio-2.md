AICA-03 · BETELGEUSE — Senior Application Security Engineer, reparto AICA (AI Cybersecurity)

# Revisione della sicurezza applicativa di `app/` (Portale ordini «Ferramenta Nord»)

## Sintesi per la direzione
Ho letto il codice in `app/` senza eseguirlo. Ho trovato **6 rilievi P1**, 7 P2 e 8 P3. Quelli più urgenti:
- **Controllo di autorizzazione invertito.** `operator` e `auditor`, che è un account esterno, possono usare le API riservate agli admin, assegnarsi il ruolo `admin` ed esportare l'anagrafica dei clienti.
- **SQL injection** nell'ordinamento degli ordini, sfruttabile da qualunque cliente.
- **SSRF con lettura della risposta** nel test dei webhook. Può raggiungere servizi interni e i metadati della VM, che hanno accesso ai segreti di produzione.
- **Crash del processo con una sola richiesta.** Le eccezioni asincrone non sono gestite e una richiesta malformata, anche senza autenticazione, ferma il server.
- **Due dipendenze vulnerabili raggiungibili.** `multipart-lite` ha un ReDoS sfruttato in rete. `xml-mapper` ha una prototype pollution e non esiste una correzione nella linea 1.x.

Questa revisione non dichiara sicura l'applicazione nel suo insieme. Vale per i controlli e le evidenze descritti qui.

## Perimetro e autorizzazioni
- **Perimetro:** sola lettura del codice in `app/`, come chiesto dal compito.
- **Contesto letto, non esaminato:** `infra/`, `iam/` e `security/`, solo per valutare esposizione e impatto.
- **Nessuna attività attiva:** niente esecuzione, test dinamici o scansioni.
- Il progetto dichiara che dati, chiavi e indirizzi sono finti.

## Metodologia
- Revisione manuale dei file di `app/`: autenticazione, sessioni, autorizzazione, dati in ingresso, file, chiamate in uscita, log e dipendenze.
- Confronto delle dipendenze con `security/scan-2026-11-20.json` e con `app/package-lock.json`.
- La biblioteca del reparto (OWASP Top 10:2025, ASVS 5.0.0, CVSS 4.0) non era disponibile in questa prova e non ho accesso al web. I richiami a OWASP e CWE vengono dalle mie conoscenze e vanno ricontrollati sulle schede.

## Risorse esaminate
`app/server.js`, `auth.js`, `orders.js`, `db.js`, `upload.js`, `package.json`, `package-lock.json`, `Dockerfile`.

Il modulo `./mail`, richiesto in `auth.js:5`, non è nella copia: non l'ho verificato.

## Rilievi

### P1

**R1 — `requireAdmin` lascia passare tutti i ruoli tranne `customer`** (Broken Access Control, CWE-285)
- **Dove:** `app/auth.js:54-57`, usato in `app/server.js:32-34`.
- **Evidenza:** `if (req.user.role !== "customer") return next();`
- **Impatto:**
  - `operator` e `auditor` possono elencare gli utenti, cambiare il ruolo di chiunque, compreso il proprio, ed esportare i clienti (`setRole`, `auth.js:63-68`).
  - Un revisore esterno può quindi diventare `admin`, aggirando l'MFA richiesta da `iam/roles.yaml`.
  - Viola la regola 3 di `iam/README.md`: le esportazioni dei clienti sono solo per `admin`.
- **Correzione:**
  - Lista di ruoli ammessi: `if (req.user.role === "admin") return next();`.
  - Meglio ancora, un controllo per permesso basato su `roles.yaml`.
  - Su `setRole`: impedire di modificare il proprio ruolo e registrare l'evento nel log.
- **Verifica:** test che restituiscono 403 per `operator`, `auditor` e `customer` su tutte le rotte `/api/admin/*`.

**R2 — SQL injection in `ORDER BY`** (Injection, CWE-89)
- **Dove:** `app/orders.js:7-8` e `:13`.
- **Evidenza:** il codice controlla solo la prima parola di `sort` (`sort.split(" ")[0]`) e poi interpola la stringa intera: `ORDER BY ${sort}`.
- **Esempio:** `created_at, (CASE WHEN (SELECT ...) THEN 1 ELSE 1/0 END)` supera il controllo.
- **Impatto:** qualunque cliente autenticato, circa 1.400 aziende, può estrarre dati alla cieca da tutto il database: hash delle password, token di reset in chiaro (R7), ordini di altri clienti, tabella `customers`.
- **Correzione:**
  - Mappa chiusa da valore a SQL, per esempio `{ "created_at": "created_at", ... }`.
  - Direzione validata a parte (`ASC`/`DESC`) e mai interpolata dall'input.
- **Verifica:** test che restituiscono 400 per qualunque `sort` fuori dalle combinazioni ammesse.

**R3 — SSRF con risposta restituita al chiamante** (CWE-918)
- **Dove:** `app/orders.js:42-48` e `app/server.js:30`.
- **Evidenza:**
  - Il codice blocca solo `hostname === "localhost"`.
  - Restano raggiungibili `127.0.0.1`, `[::1]`, `169.254.169.254`, i nomi interni `admin:8081`, `db`, `cache` e `10.8.0.1:9100`, su qualunque porta.
  - `fetch` segue i redirect per impostazione predefinita.
  - Il corpo della risposta torna al chiamante (`slice(0, 2000)`).
- **Impatto:**
  - Qualunque cliente può leggere servizi interni.
  - Se i metadati dell'istanza sono raggiungibili dal container, può ottenere le credenziali del ruolo `vm-portale-ordini`, che ha `secretsmanager:GetSecretValue` su `portale-ordini/prod/*` (`iam/cloud-iam.json`): database, `JWT_SECRET` e altri segreti.
  - Non ho verificato se i metadati sono raggiungibili dal container (IMDSv2, hop limit).
- **Correzione:**
  - Solo `https`, porte 443 e 8443.
  - Risolvere il DNS e rifiutare gli IP privati, loopback, link-local e ULA, poi connettersi all'IP verificato.
  - `redirect: "manual"`, timeout breve.
  - Restituire solo lo status, non il corpo.
  - In infrastruttura: IMDSv2 con hop limit 1 e un proxy di uscita.
- **Verifica:** test con `127.0.0.1`, `169.254.169.254`, `http://admin:8081`, un redirect verso un IP interno e un IP in forma decimale o IPv6. Tutti devono restituire 400.

**R4 — Crash del processo con una richiesta: errori asincroni non gestiti** (CWE-248, DoS)
- **Dove:** tutte le rotte asincrone di `app/server.js:18-34`. Manca un gestore degli errori.
- **Causa:** Express 4.21.2 non intercetta le promise rifiutate. Su Node 22 una `unhandledRejection` termina il processo.
- **Esempi di innesco:**
  - `POST /login` **senza autenticazione**, con un'email esistente e senza `password`: `bcrypt.compare(undefined, ...)` lancia un'eccezione (`auth.js:13`).
  - `POST /api/webhooks/test` con `url: "x"`: `new URL` lancia (`orders.js:43`).
  - `POST /api/orders/import` senza `order`: `doc.order.items` lancia (`orders.js:37`).
  - `limit=-1`: `LIMIT -1` fa fallire la query (`orders.js:9`).
  - `qty` non numerico: errore del database in `createOrder`.
- **Impatto:** portale fermo per tutti. In `infra/docker-compose.yml` il servizio `app` non ha `restart:`, quindi può restare giù.
- **Correzione:**
  - Avvolgere i gestori asincroni (oppure passare a Express 5) e aggiungere un middleware di errore che risponde 400 o 500.
  - Validare il corpo delle richieste con uno schema.
  - In compose, `restart: unless-stopped`.
- **Verifica:** test con i corpi malformati elencati sopra: il server risponde 4xx e resta in piedi.

**R5 — `multipart-lite` 2.3.0: ReDoS sfruttato in rete (FNSA-2026-0287)**
- **Dove:** `app/package.json:16`, raggiungibile da `upload.js:11` tramite `POST /api/files`.
- **Evidenza:** CVSS 5.3, ma EPSS 0.71, `known_exploited: true` da ottobre 2026 (`security/scan-2026-11-20.json`).
- **Perché P1:** il ciclo degli eventi si blocca per decine di secondi e c'è un solo processo. Il punteggio CVSS medio non basta a decidere: lo sfruttamento è attivo e la rotta è raggiungibile da qualunque account cliente.
- **Correzione:** aggiornare a ≥ 2.3.4 e rigenerare il lockfile.
- **Verifica:** nuova scansione pulita e lockfile con la versione 2.3.4.

**R6 — `xml-mapper` 1.8.2: prototype pollution in `parse()` (FNSA-2026-0254)**
- **Dove:** `app/orders.js:2` e `:36`, raggiungibile da `POST /api/orders/import` con XML del cliente. È presente anche come dipendenza annidata di `multipart-lite`.
- **Evidenza:**
  - L'advisory vale «con qualunque opzione».
  - Il commento `resolveExternal: false` alle righe 34-35 protegge solo dalle entità esterne, non da questo difetto.
  - Non esiste una correzione nella linea 1.x.
- **Impatto:** inquinamento di `Object.prototype` nel processo condiviso. Gli effetti possibili vanno dal crash all'alterazione di controlli che leggono proprietà non proprie. Non ho verificato una catena concreta.
- **Correzione:**
  - Migrare a 2.0.0, dove `parseDocument` restituisce un oggetto senza prototipo, e adeguare il codice.
  - Verificare che la versione annidata in `multipart-lite` 2.3.4 sia corretta.
  - Nel frattempo, valutare di disattivare l'import.
- **Verifica:** test con un elemento `__proto__` o `constructor` nell'XML: nessuna proprietà compare su `{}`.

### P2

**R7 — Reset della password: scadenza non controllata, token riusabile, token in chiaro**
- **Dove:** `app/auth.js:29` e `:36-40`.
- **Evidenza:**
  - `expires_at` viene letto ma mai confrontato con l'ora corrente.
  - Il token non viene eliminato né marcato come usato.
  - Le altre richieste di reset restano valide.
  - Il token è salvato in chiaro, quindi è leggibile con R2.
  - Non c'è nessuna regola sulla nuova password.
- **Impatto:** un link vecchio, per esempio in una casella email compromessa, prende il controllo dell'account in qualunque momento.
- **Correzione:**
  - `WHERE token_hash = sha256($1) AND expires_at > now() AND used_at IS NULL`, poi `DELETE` di tutti i reset dell'utente nella stessa transazione.
  - Lunghezza minima della password.
  - Invalidare le sessioni attive (vedi R13).

**R8 — Upload: XSS memorizzato e possibile path traversal**
- **Dove:** `app/upload.js:13-15` e `:17`. I file sono serviti da `infra/nginx.conf:39-41`.
- **Evidenza:**
  - Il controllo usa il `contentType` dichiarato dal client, non il contenuto.
  - `file.filename` è usato senza ripulirlo. Un file `x.html` o `x.svg` dichiarato come `image/png` viene servito da nginx sullo stesso dominio, con il tipo ricavato dall'estensione.
  - Con `filename` = `../../../tmp/x`, `path.join` esce da `/srv/uploads`. Non ho verificato se `multipart-lite` ripulisce il nome: se non lo fa, la gravità sale.
- **Impatto:** script eseguiti nel dominio del portale e furto del token se il frontend lo tiene accessibile a JavaScript. Scrittura nei percorsi scrivibili dall'utente `node`.
- **Correzione:**
  - Nome generato dal server (UUID) con estensione ricavata dal tipo verificato sui magic bytes.
  - `path.basename` e un controllo che il percorso finale stia sotto `UPLOAD_DIR`.
  - `Content-Disposition: attachment` e `X-Content-Type-Options: nosniff`.

**R9 — `/files/` serviti da nginx senza controllo d'accesso**
- **Dove:** `app/upload.js:17` restituisce l'URL `/files/...`, che `infra/nginx.conf:39-41` serve in modo statico.
- **Impatto:** il controllo del proprietario in `download` (`upload.js:23`) viene scavalcato. Chi conosce o indovina il nome (`id-timestamp-nomefile`) scarica DDT e ordini firmati senza autenticazione.
- **Correzione:**
  - Restituire `/api/files/:name`.
  - Togliere l'`alias` pubblico, oppure usare `internal` con `X-Accel-Redirect` dall'app.

**R10 — Nessun limite ai tentativi su login, reset e richiesta di reset** (CWE-307)
- **Dove:** `app/auth.js:10-41`.
- **Impatto:** brute force e credential stuffing, invio massivo di email di reset.
- **Correzione:** limite per IP e per account e un ritardo progressivo. L'IP reale va ricavato correttamente: oggi `server.js:12` usa l'IP di nginx e nginx si fida di qualunque `X-Forwarded-For` (`set_real_ip_from 0.0.0.0/0`).

**R11 — Quantità non validate negli ordini**
- **Dove:** `app/orders.js:27-29` e `:37`, `app/db.js:26`.
- **Evidenza:**
  - `qty` può essere negativo, zero, decimale o NaN.
  - `sku` non è validato.
  - L'import non applica il limite di 100 righe.
- **Impatto:** quantità negative abbassano il totale dell'ordine (manipolazione del prezzo). NaN causa un crash (R4).
- **Correzione:** `qty` intero tra 1 e un massimo, `sku` con un formato e una lunghezza ammessi, stesse regole in `create` e `importXml`.

**R12 — MFA prevista per `admin` ma non implementata**
- **Dove:** `app/auth.js:10-22`. Lo richiedono `iam/roles.yaml` (`admin: mfa: true`) e la regola 2 di `iam/README.md`.
- **Impatto:** l'accesso admin è protetto da una sola password. Con R1 bastano credenziali `operator` o `auditor`.
- **Correzione:** secondo fattore per `admin` e per chi esporta dati dei clienti.
- **Da chiarire con l'utente:** `roles.yaml` dà `customers:export` a `operator`, mentre `iam/README.md` lo riserva ad `admin`.

**R13 — Eventi di sicurezza non registrati in modo utile**
- **Dove:** `app/orders.js:53` e `app/auth.js:63-68`.
- **Evidenza:**
  - L'esportazione dell'anagrafica clienti è registrata a livello `debug`, quindi probabilmente non viene emessa con il livello predefinito `info`.
  - Il cambio di ruolo non è registrato.
  - L'IP nei log è quello del proxy (`server.js:12`).
- **Correzione:**
  - Log a livello `info` o superiore con l'autore (`req.user.sub`), il destinatario e l'esito, per export, `setRole` e reset.
  - IP del client ricavato da `X-Forwarded-For` con `trust proxy` impostato sulla sola rete di nginx.

### P3

- **R14 — Open redirect** (`app/auth.js:20`): `startsWith("/")` accetta `//evil.example`. Correzione: rifiutare `//` e `/\`, oppure usare una lista di percorsi ammessi.
- **R15 — Enumerazione degli utenti per tempo di risposta** (`app/auth.js:12-13` e `:25-31`): bcrypt e l'invio dell'email partono solo se l'utente esiste. Correzione: confronto con un hash fittizio e invio dell'email asincrono, con tempo costante.
- **R16 — JWT di 8 ore non revocabili** (`app/auth.js:19` e `:47`):
  - `requireUser` non controlla `active` né il ruolo attuale, quindi un account disattivato o declassato resta valido fino a 8 ore.
  - Contrasta con la regola 5 di `iam/README.md` (disattivazione lo stesso giorno).
  - Correzione: durata breve e controllo di `active` e `role` sul database, oppure una versione del token.
- **R17 — CSV injection e CSV non quotato** (`app/orders.js:54`):
  - Campi che iniziano con `= + - @` vengono eseguiti come formule nel foglio di calcolo.
  - `;` e i ritorni a capo non sono gestiti.
  - Correzione: quotare i campi e anteporre `'` ai valori che iniziano con quei caratteri.
- **R18 — Header di sicurezza mancanti** (`app/server.js:8`): c'è `X-Powered-By`, mancano `nosniff`, `frame-ancestors` e CSP. Correzione: `app.disable("x-powered-by")` e header impostati in nginx o nell'app.
- **R19 — `pino` 9.5.0 con `pino-abstract-transport` 2.0.0 (FNSA-2026-0102)**:
  - L'eccezione in `security/scanner-ignore.yml` è **scaduta il 2026-09-30**. Il motivo indicato non vale più: pino 9.6.0 è uscito il 2026-10-07.
  - Nel codice non c'è un transport con destinazione esterna (`server.js:7`), quindi oggi il difetto non sembra raggiungibile.
  - Correzione: aggiornare a ≥ 9.6.0 e chiudere l'eccezione.
- **R20 — `docgen-lite` 0.9.4 (FNSA-2026-0311, CVSS 9.8)**:
  - È una devDependency, fuori dall'immagine di produzione (`npm ci --omit=dev`), e gira in CI su sorgenti del repository.
  - Il CVSS alto non giustifica da solo una priorità più alta.
  - Correzione: aggiornare a 0.9.6 nella CI.
- **R21 — Immagine e build** (`app/Dockerfile:1` e `:5`):
  - `COPY . .` senza `.dockerignore` può includere `.env` o `node_modules` locali.
  - L'immagine base `node:22.11.0-bookworm-slim` contiene `libssl3` vulnerabile (IMG-2026-4471). Il difetto è raggiungibile perché `testWebhook` apre connessioni TLS verso server scelti dal cliente: con R3 aperto conviene trattarlo come P2.
  - Correzione: aggiungere `.dockerignore`, ricostruire con una base aggiornata e fissare il digest.

## Osservazioni sulle evidenze dello scanner
- Lo scanner riporta `express` 4.19.2 (FNSA-2026-0198), ma ha analizzato il lockfile al commit `3f2a9c1` del 2026-08-14. Il lockfile attuale ha 4.21.2, già corretta, e l'app non usa `res.redirect`. Probabilmente è un rilievo superato: va confermato con una nuova scansione sul commit corrente.
- La scansione delle dipendenze non riflette il lockfile attuale. Va riallineata all'HEAD.
- `minimatch` (devDependency, eccezione valida fino al 2027-02-28) e `perl-base` non sono raggiungibili dall'app: nessun rilievo.

## Rischio residuo
- R1, R2 e R3 combinati permettono a un account cliente o revisore di arrivare ai dati di tutti i clienti e potenzialmente ai segreti di produzione.
- R4 e R5 permettono di fermare il servizio a piacere.
- Le correzioni di R1, R2, R4 e R7 sono piccole e locali e conviene farle per prime.
- I tempi concordati in `security/README.md` sono 7 giorni per i P1 e 30 per i P2.

## Limiti e aree non verificate
- Nessuna esecuzione né test dinamico.
- Non ho visto il modulo `mail`, il frontend (dove sta il token), il pannello `admin` e lo schema del database.
- Non ho verificato il comportamento interno di `multipart-lite` (pulizia del nome file) e di `xml-mapper`, né la raggiungibilità dei metadati della VM dal container.
- Le schede della biblioteca (OWASP Top 10:2025, ASVS 5.0.0, CVSS 4.0) non erano disponibili: i riferimenti alle categorie vanno ricontrollati.
- Problemi di infrastruttura visti di passaggio e da affidare ai colleghi cloud e rete, non approfonditi:
  - `set_real_ip_from 0.0.0.0/0` in nginx;
  - `admin` con la porta 8081 pubblicata e il security group 8000-8100 aperto a tutti;
  - `db` sulla rete `frontend`;
  - `/metrics` proxato pubblicamente;
  - SSH aperto a 0.0.0.0/0.

## Piano della nuova verifica
1. Test automatici per R1 (matrice ruoli × rotte admin), R2 (valori di `sort` malevoli), R3 (elenco di destinazioni interne e redirect), R4 (corpi malformati, il processo resta attivo), R7 (token scaduto e token riusato), R8 e R9 (nome con `../`, file HTML dichiarato PNG, accesso a `/files/` senza token) e R11 (quantità negative e NaN).
2. Nuova scansione delle dipendenze e dell'immagine sul commit corrente, dopo gli aggiornamenti di `multipart-lite`, `xml-mapper`, `pino` e dell'immagine base.
3. Riesame del diff delle correzioni da parte della Software Agency (Security Engineer e Code Reviewer).

Rilievi e riepilogo a firma di BETELGEUSE (AICA-03). Sono proposte: priorità e correzioni restano da confermare all'utente o al responsabile umano competente.
