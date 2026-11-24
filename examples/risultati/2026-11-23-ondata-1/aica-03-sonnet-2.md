AICA-03 · BETELGEUSE — Senior Application Security Engineer, reparto AICA (AI Cybersecurity)

# Revisione read-only della sicurezza applicativa di `app/` (portale-ordini 2.4.1)

## Sintesi
La revisione ha trovato 5 rilievi P1, 6 P2 e 4 P3. I più gravi sono un controllo admin con la condizione invertita, un crash non autenticato del processo e una scrittura di file fuori dalla cartella degli upload. Ci sono poi SQL injection sull'ordinamento, SSRF nel test del webhook e reset password senza scadenza. Questo rapporto non è una certificazione: ogni rilievo vale solo per il codice letto.

## Perimetro e metodo
- **Perimetro:** `app/` (server.js, auth.js, orders.js, db.js, upload.js, Dockerfile, package.json, package-lock.json). Ho letto tutto il codice.
- **Metodo:** revisione manuale del codice, sola lettura, nessuna esecuzione e nessuna scansione attiva.
- **Fuori da `app/`:** ho guardato solo `security/scan-2026-11-20.json`, per i rilievi sulle dipendenze.
- **Scheda biblioteca:** il tool library non era disponibile in questa prova. Non cito quindi versioni di OWASP Top 10, ASVS o CVSS dalla biblioteca. Le classificazioni sono mie, per contesto e sfruttabilità.
- **Segreti:** nel codice non ci sono segreti hardcoded. `JWT_SECRET` e `DATABASE_URL` vengono dall'ambiente.

## Rilievi

### P1
1. **Controllo admin invertito** (`app/auth.js:55`, `requireAdmin`).
   - **Fatto:** il controllo è `if (req.user.role !== "customer") return next();`. Passano quindi anche `operator` e `auditor`, non solo `admin`.
   - **Impatto:** un operatore o un auditor può chiamare `/api/admin/users/:id/role` (`auth.js:63`) e farsi promuovere ad admin. Può inoltre elencare gli utenti ed esportare l'anagrafica clienti (`orders.js:51`).
   - **Correzione:** `if (req.user.role === "admin") return next();`, più un test per ciascun ruolo.
2. **Crash non autenticato del processo** (tutti gli handler `async`, in particolare `auth.js:10-22`).
   - **Fatto:** Express 4 non intercetta le promise rifiutate e non c'è un error handler. Con `POST /login` senza `password`, o con tipi sbagliati, `bcrypt.compare` lancia un errore. La rejection non gestita termina il processo Node.
   - **Altri punti che falliscono nello stesso modo:** `resetPassword` (`auth.js:38`, `password` assente), `importXml` con XML malformato (`orders.js:36-37`, `doc.order.items` indefinito), `get` con `:id` non numerico (`orders.js:20`) e `setRole` con `:id` non valido.
   - **Impatto:** DoS ripetibile da chiunque, anche senza account.
   - **Correzione:** wrapper async comune (o Express 5) con error handler, validazione dei tipi in ingresso (`typeof === "string"`, lunghezza, `Number.isInteger` per gli id) e `process.on("unhandledRejection")` solo come rete di sicurezza.
3. **SQL injection nell'ordinamento** (`app/orders.js:7-13`).
   - **Fatto:** viene controllata solo la prima parola di `sort` (`sort.split(" ")[0]`). Il resto della stringa va in `ORDER BY ${sort}` senza controlli, per esempio `total DESC, (SELECT ...)`.
   - **Impatto:** lettura di dati arbitrari con tecniche blind/booleane da qualunque utente autenticato, clienti compresi. Il protocollo parametrico di `pg` blocca le stacked query, ma non le subquery.
   - **Correzione:** accettare solo `colonna` più `ASC|DESC` da una lista chiusa, ricostruendo la clausola lato server.
4. **SSRF nel test del webhook** (`app/orders.js:42-49`).
   - **Fatto:** si blocca solo l'hostname `localhost` e si accettano http e https. Restano ammessi `127.0.0.1`, `[::1]`, `10.x`, `169.254.169.254` (metadata cloud), i nomi interni di Docker/compose e i redirect, che `fetch` segue. Il body della risposta (2000 caratteri) torna al chiamante.
   - **Esposizione:** l'endpoint è aperto a qualsiasi utente autenticato, anche `customer`.
   - **Impatto:** accesso a servizi interni e ai metadata, con lettura della risposta.
   - **Correzione:** limitare l'endpoint a un ruolo. Risolvere il DNS e rifiutare IP privati, loopback e link-local. Usare `redirect: "manual"`, un timeout e un'allowlist di domini se possibile.
5. **Reset password senza scadenza né monouso** (`app/auth.js:35-41`).
   - **Fatto:** il token è letto da `password_resets` ma `expires_at` non viene mai confrontata. Dopo l'uso il token non viene cancellato. Il token è salvato in chiaro e la nuova password non ha alcuna regola di lunghezza.
   - **Impatto:** un link vecchio o trapelato (log della posta, cronologia) vale per sempre e può essere riusato.
   - **Correzione:** `AND expires_at > now()`, cancellare il token dopo l'uso, salvarne l'hash, imporre una lunghezza minima, invalidare le sessioni attive.

### P2
6. **Path traversal in scrittura nell'upload** (`app/upload.js:14-15`).
   - **Fatto:** `file.filename` arriva dal client e entra senza pulizia in `path.join(UPLOAD_DIR, name)`. Una `filename` come `/../../x` fa risolvere il percorso fuori da `/srv/uploads` (`path.join` normalizza in modo lessicale).
   - **Impatto:** scrittura di file con estensione e contenuto scelti dal chiamante, limitata dall'utente `node` nel container. Lo classifico P2 perché l'uso dipende dai permessi del filesystem, che non ho verificato. Se `/srv` è scrivibile e contiene codice o configurazioni, sale a P1.
   - **Correzione:** usare `path.basename`, oppure generare il nome con un UUID e tenere il nome originale solo nel database. Verificare che il percorso finale resti dentro `UPLOAD_DIR`.
7. **Tipo di file non verificato, con rischio di XSS memorizzato** (`app/upload.js:13`, `:24`).
   - **Fatto:** `contentType` è quello dichiarato dal client. `sendFile` serve il file con il tipo ricavato dall'estensione del nome. Un file `x.html` caricato come `application/pdf` viene servito come HTML sulla stessa origine dell'API.
   - **Correzione:** controllare i magic bytes, forzare estensione e `Content-Type` da una lista, aggiungere `Content-Disposition: attachment` e `X-Content-Type-Options: nosniff`.
8. **Dipendenze con vulnerabilità note raggiungibili dal codice.** Fonte: `security/scan-2026-11-20.json`, data del scan 2026-11-20. Non ho potuto ricontrollare gli advisory su fonti ufficiali.
   - `multipart-lite` 2.3.0 (`upload.js:11`): ReDoS FNSA-2026-0287, `known_exploited: true`, EPSS 0.71, correzione 2.3.4. È raggiungibile da `POST /api/files` con un account autenticato. Il CVSS 5.3 sottostima il rischio reale, perché lo sfruttamento è osservato. Va aggiornato presto.
   - `xml-mapper` 1.8.2 (`orders.js:36`): prototype pollution FNSA-2026-0254, CVSS 7.5, correzione solo con la 2.0.0, che cambia l'API (`parse` diventa `parseDocument`). Il rischio è raggiungibile da `POST /api/orders/import` con XML non fidato. `resolveExternal: false` non mitiga questo problema.
   - **Nota sul scan:** il scan è su un commit del 2026-08-14 e riporta `express` 4.19.2, mentre il lockfile attuale ha 4.21.2. Il rilievo express è quindi probabilmente superato. Il scan va rifatto sul lockfile corrente prima di darlo per buono.
9. **Open redirect nel login** (`app/auth.js:20`). `next.startsWith("/")` accetta `//evil.example` e `/\evil.example`, che il browser interpreta come host esterni. Correzione: accettare solo percorsi che iniziano con `/` e non con `//` o `/\`, oppure una lista di rotte note.
10. **Nessuna validazione né limite su quantità e righe d'ordine** (`app/orders.js:26-31`, `:37`, `app/db.js:25-30`).
    - **Fatto:** `qty` non è controllata. Una quantità negativa riduce il totale dell'ordine, e un valore non numerico fa fallire la query.
    - **Impatto:** manipolazione dell'importo di un ordine e righe con SKU inesistenti ignorate in silenzio. È un rilievo di logica di business, non di iniezione.
    - **Correzione:** `Number.isInteger(qty) && qty > 0 && qty <= limite`. Rifiutare lo SKU non trovato e dare un tetto ai duplicati.
11. **Sessione JWT senza revoca** (`app/auth.js:19`, `:43-52`). `requireUser` non rilegge l'utente dal database: un account disattivato o declassato mantiene il ruolo del token per 8 ore. Correzione: controllare `active` e ruolo a ogni richiesta, oppure accorciare la durata e usare un identificatore di sessione revocabile.

### P3
12. **Nessun rate limit** su `/login`, `/password/forgot`, `/password/reset`, né limiti sui costi di bcrypt (`app/server.js:18-20`, `auth.js:10`). Possibili brute force e abuso del invio mail. Correzione: `express-rate-limit` per IP e per account.
13. **Enumerazione utenti per tempo di risposta** (`app/auth.js:12-13`). Se l'utente non esiste non si esegue `bcrypt.compare`, e la risposta è sensibilmente più veloce. Correzione: confronto con un hash fittizio.
14. **Export clienti non sicuro e poco tracciato** (`app/orders.js:51-54`). Il CSV non quota i campi (un `;` nei dati rompe le colonne, e `=`, `+`, `@` all'inizio abilitano formula injection in Excel). L'evento `admin_export` è registrato a livello `debug`, quindi probabilmente non finisce nei log di produzione. L'evento di cambio ruolo (`auth.js:63`) non è registrato affatto. Correzione: quotare e neutralizzare i campi, registrare export e cambi di ruolo a livello `info` con l'identità di chi li ha eseguiti.
15. **Hardening mancante**, come rafforzamento: nessun header di sicurezza (`helmet`, `server.js`), nessun `trust proxy` (l'IP loggato sarà quello del proxy, `server.js:12`), immagine `node:22.11.0` non aggiornata e senza digest (`Dockerfile:1`), nessun `HEALTHCHECK`. `JWT_SECRET` non viene verificato all'avvio: se manca, il processo parte comunque e fallisce solo al primo login.

## Fatti verificati e controlli che reggono
Questi controlli valgono solo per il codice letto, non per l'applicazione nel suo insieme.
- Le query usano parametri (`$1…`), tranne il caso di `ORDER BY` del rilievo 3.
- `jwt.verify` fissa `algorithms: ["HS256"]`. La password è confrontata con bcrypt (cost 12).
- `forgotPassword` risponde allo stesso modo con email esistente o no.
- `get` ordine e `download` file controllano la proprietà per il ruolo `customer` e rispondono 404.
- `sameApiKey` usa `timingSafeEqual` (`auth.js:70-74`) ma non è usata da nessuna rotta di `server.js`.

## Limiti e aree non verificate
- **`./mail`:** `auth.js:5` richiede un modulo `./mail` che non esiste in `app/`. Non so se è un file mancante nella copia o se l'app non parte così com'è. Il contenuto del modulo (invio dei link di reset) non è stato esaminato.
- **Altro non letto:** configurazione di nginx, security group, IAM, log e CORS. `security/` e `infra/` sono fuori dal perimetro, e la verifica di quel che riguarda quei file spetta agli specialisti competenti del reparto.
- **Non verificato:** le impostazioni di `xml-mapper` e `multipart-lite` oltre alle opzioni viste nel codice, lo schema del database, i permessi del filesystem di `/srv/uploads` e il comportamento di `pg`. Nessun codice è stato eseguito.

## Nuova verifica proposta
Dopo le correzioni dei rilievi 1-5: test automatici per ruolo su `/api/admin/*`, test dei casi limite di login e reset (campi assenti, token scaduto o riusato), test dell'ordinamento e del webhook con input ostili, nuovo scan delle dipendenze sul lockfile corrente.

## Nota per il direttore
Questa analisi è stata fatta su un modello più piccolo (Sonnet). Ci sono rilievi P1: propongo il riesame del direttore AICA-01 o di un revisore su Opus prima che diventino definitivi. In particolare il rilievo 3 (SQL injection) e il rilievo 6 (path traversal) dipendono da comportamenti di `pg` e di `path.join` che qui sono stati ragionati e non provati.

Firmato: AICA-03 · BETELGEUSE
