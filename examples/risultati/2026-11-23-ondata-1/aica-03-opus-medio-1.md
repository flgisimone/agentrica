AICA-03 · BETELGEUSE — Senior Application Security Engineer, reparto AICA (AI Cybersecurity)

# Revisione della sicurezza applicativa di `app/`, portale ordini «Ferramenta Nord»

## Sintesi per la direzione
Ho rivisto in sola lettura il codice in `app/`. Ho trovato 6 rilievi P1, 7 P2 e 5 P3. Nessuno è P0: non ho prove di una compromissione in corso, ma le prime tre catene sono semplici da sfruttare.
- **Controllo admin invertito.** Operatori e revisori esterni (`auditor`) passano il controllo degli amministratori, possono farsi admin da soli ed esportare i dati dei clienti.
- **SQL injection.** Qualunque cliente autenticato può farla sul parametro di ordinamento degli ordini e leggere tutto il database, compresi hash delle password e token di reset.
- **Webhook di prova (SSRF).** Fa richieste lato server verso reti interne e metadati del cloud.
- **Documenti dei clienti.** Sono serviti da nginx senza autenticazione, e il caricamento accetta qualunque estensione (XSS memorizzato, cioè salvato nel sito).
- **Crash del processo.** Ogni eccezione nei gestori async lo fa cadere: Express 4 non intercetta le promise rifiutate. Il login ne apre uno anche senza autenticazione.
- **Dipendenze.** `xml-mapper` 1.8.2 ha una prototype pollution che si raggiunge dall'import XML; `multipart-lite` 2.3.0 ha un ReDoS sfruttato in rete.

Questa analisi copre i controlli e le evidenze elencati sotto: non è una certificazione e non dichiara sicura l'applicazione.

## Perimetro e autorizzazioni
- Perimetro: `app/` (`server.js`, `auth.js`, `orders.js`, `db.js`, `upload.js`, `Dockerfile`, `package.json`, `package-lock.json`), secondo il compito assegnato.
- Contesto letto per capire quanto è esposta l'app, senza valutarlo come perimetro: `README.md`, `infra/nginx.conf`, `infra/docker-compose.yml`, `infra/security-group.json`, `security/scan-2026-11-20.json`, `security/scanner-ignore.yml`.
- Analisi statica e documentale. Nessun processo avviato, nessuna richiesta di rete, nessun file modificato.
- Il progetto dichiara che nomi, chiavi e log sono finti. Non riporto segreti.

## Metodologia
Ho letto riga per riga i flussi di autenticazione, sessione, autorizzazione, validazione dell'input, file, chiamate in uscita e dipendenze. Ho incrociato il codice con il rapporto dello scanner e con la configurazione di nginx e Compose. Come riferimenti ho usato le categorie OWASP Top 10 e ASVS. Le schede della biblioteca (`owasp-top-10-2025`, `owasp-asvs-5`, `cvss-4`) non erano disponibili in questa prova e non ho accesso al web: i riferimenti agli standard vengono dalle mie conoscenze e possono essere superati.

## Rilievi

### P1

**1. `requireAdmin` ha la logica invertita: chiunque non sia `customer` passa per admin.** File `app/auth.js:54-57` (riga 55: `if (req.user.role !== "customer") return next();`). Lo usano `server.js:32-34`.
- Fatto: `operator` e `auditor` superano il controllo. Possono chiamare `POST /api/admin/users/:id/role` sul proprio id con `role: "admin"` e diventare admin; leggono `GET /api/admin/users`; scaricano l'export completo dei clienti (`ragione_sociale`, `piva`, `email`, `telefono`, `indirizzo`).
- Impatto: chi è nel ruolo `auditor`, un revisore esterno, prende il controllo completo dell'app e dei dati dei clienti.
- Correzione: `if (req.user.role === "admin") return next();` (lista dei ruoli ammessi). Aggiungere test per ogni ruolo su ogni rotta admin.
- Verifica: richieste con token `operator` e `auditor` alle tre rotte rispondono 403.

**2. SQL injection nell'`ORDER BY` di `GET /api/orders`.** File `app/orders.js:7-8` e `:13`.
- Fatto: si controlla solo il primo token di `sort` (`sort.split(" ")[0]`), poi `sort` intero finisce interpolato in `ORDER BY ${sort}`. Un valore come `created_at DESC, (CASE WHEN (SELECT …) THEN total ELSE id END)` passa il controllo.
- Ipotesi: si estrae anche per errore. `NODE_ENV` non è impostato nel `Dockerfile`, quindi il gestore di errori predefinito di Express restituisce lo stack, che contiene il messaggio di Postgres. Questo va confermato in esercizio.
- Impatto: qualunque cliente autenticato legge l'intero database (`users.password_hash`, `password_resets.token`, i dati di tutti i clienti). Con i token di reset prende gli account admin, vedi rilievo 5.
- Correzione: sostituire il testo libero con una mappa chiusa, per esempio `{ "created_at": "created_at", "total": "total", "status": "status" }`, e una direzione `ASC|DESC` validata a parte.
- Verifica: ogni valore fuori dalla lista risponde 400. Un test con il payload sopra.

**3. SSRF in `POST /api/webhooks/test`.** File `app/orders.js:42-49`.
- Fatto: si blocca solo il nome `localhost`. Passano `127.0.0.1`, `[::1]`, `169.254.169.254`, `admin:8081`, `app:3000` e nomi DNS che risolvono su IP interni. `fetch` segue i redirect senza rivalidarli: un 301 o 302 da un server dell'attaccante trasforma il POST in GET verso qualunque destinazione. La risposta torna al chiamante (fino a 2000 caratteri). La rotta richiede solo un utente autenticato, quindi anche un cliente.
- Impatto: lettura di servizi interni. Il pannello `admin` raggiunto dall'interno aggira il vincolo VPN. Possibile lettura delle credenziali dai metadati del cloud, se l'endpoint di metadati della VM risponde a GET semplici: dipende dal provider, non verificato. Il security group in uscita filtra solo il traffico esterno, non le reti Docker né i metadati locali.
- Correzione:
  - Risolvere il DNS e rifiutare gli indirizzi privati, loopback, link-local e ULA sull'IP risolto, poi collegarsi a quell'IP.
  - `redirect: "manual"`.
  - Solo `https:`, porta 443.
  - Timeout.
  - Non restituire il corpo della risposta, solo lo stato.
  - Valutare se limitare la rotta agli admin.
- Verifica: test con `127.0.0.1`, `169.254.169.254`, `admin`, IPv6 e un redirect verso un IP interno: tutti rifiutati.

**4. Documenti dei clienti pubblici e caricamento senza vincolo sull'estensione.** File `app/upload.js:13-17`, con il contesto di `infra/nginx.conf:39-41`.
- Fatto: nginx serve `/files/` direttamente dal volume, senza autenticazione. L'URL restituito dall'upload (`upload.js:17`) punta lì, quindi il controllo del proprietario in `download` (`upload.js:23`) non si applica.
- Fatto: il nome del file è prevedibile: id utente sequenziale, timestamp in millisecondi e nome originale.
- Fatto: il tipo si controlla solo sul `contentType` dichiarato dal client (`upload.js:13`), mentre l'estensione viene da `file.filename`. Un `x.html` o `x.svg` dichiarato `application/pdf` è servito da nginx come HTML o SVG sullo stesso dominio: XSS memorizzato. Il JWT restituito nel JSON sta presumibilmente nello storage del browser, quindi lo script può rubarlo (ipotesi: il frontend non è nel perimetro).
- Impatto: DDT e ordini firmati di tutti i clienti leggibili da chiunque; furto di sessioni, anche di operatori e admin.
- Correzione:
  - Togliere `location /files/` da nginx e servire i file solo da `GET /api/files/:name`, con il controllo del proprietario.
  - Nome sul disco generato dal server (UUID), estensione dedotta dal tipo verificato sul contenuto (magic bytes).
  - `Content-Disposition: attachment` e `X-Content-Type-Options: nosniff`.
- Verifica: `/files/…` senza token risponde 403 o 404; un file `.html` viene rifiutato o salvato come `.pdf` scaricabile.

**5. Crash del processo su qualunque eccezione nei gestori async (DoS, anche senza autenticazione).** File `app/server.js:18-34`: tutti i gestori sono `async` e passati a Express 4.21.2 senza wrapper.
- Fatto: Express 4 non intercetta le promise rifiutate. Con Node 22 una rejection non gestita, per impostazione predefinita, fa terminare il processo. In Compose il servizio `app` non ha `restart:`.
- Punti che lanciano eccezioni:
  - `login` con un'email esistente e `password` non stringa: `bcrypt.compare` lancia (`auth.js:13`). Non serve autenticazione.
  - `new URL()` su un URL malformato (`orders.js:43`).
  - XML malformato o senza `order.items` (`orders.js:36-37`).
  - `qty` NaN o SKU strani che fanno fallire la query (`db.js:25-28`).
  - `resetPassword` senza `password` (`auth.js:38`).
- Impatto: con una sola richiesta il portale resta fermo finché qualcuno non lo riavvia.
- Correzione:
  - Wrapper che inoltra l'errore a `next(err)`, oppure Express 5.
  - Un gestore di errori finale che risponda 500 senza stack.
  - `NODE_ENV=production`.
  - Validazione dello schema dei body (tipi stringa e numero).
  - `restart: unless-stopped` come mitigazione.
- Verifica: le richieste sopra rispondono 400 o 500 e il processo resta vivo.

**6. Dipendenze di produzione vulnerabili raggiungibili.** Fonte: `security/scan-2026-11-20.json`; uso in `app/orders.js:2,36` e `app/upload.js:3,11`.
- `xml-mapper` 1.8.2, FNSA-2026-0254: prototype pollution su qualunque `parse()`, con qualunque opzione. Si raggiunge da `POST /api/orders/import` con XML del client autenticato. `resolveExternal: false` non mitiga questo problema. Non c'è correzione nella linea 1.x: serve la 2.0.0, che cambia l'API (`parseDocument`). È anche una dipendenza annidata di `multipart-lite` (`package-lock.json:43-46`).
- `multipart-lite` 2.3.0, FNSA-2026-0287: ReDoS sul boundary che blocca il ciclo degli eventi, sfruttato in rete (EPSS 0.71). Lo raggiunge qualunque utente autenticato su `POST /api/files`. Correzione nella 2.3.4.
- Impatto: la pollution del prototipo nel processo che gestisce autenticazione e permessi può portare ad aggiramenti dei controlli o a DoS, secondo i gadget presenti (non verificato: `node_modules` non c'è nella copia). Il ReDoS blocca il servizio per tutti.
- Correzione: `multipart-lite` alla 2.3.4 subito; migrare a `xml-mapper` 2.0.0 (`parseDocument`), anche nella versione annidata, oppure disattivare l'import XML fino alla migrazione. Riavviare la scansione sul lockfile corrente.
- Nota: il CVSS dice "medium" per il ReDoS; lo classifico P1 per lo sfruttamento attivo e l'esposizione.

### P2

**7. Reset della password: scadenza non controllata, token riutilizzabile, token in chiaro e negli URL.** File `app/auth.js:35-41`, `:27-30`.
- Fatto: `resetPassword` legge `expires_at` ma non lo controlla. Non cancella e non segna il token dopo l'uso. Non invalida gli altri token né le sessioni esistenti. Non c'è un controllo minimo sulla password. Il token è salvato in chiaro nel database, quindi è leggibile con il rilievo 2.
- Fatto: il token viaggia come query string. nginx registra `$request` intero (`nginx.conf:13`), quindi i token finiscono nel log degli accessi e, tramite Vector, nel SIEM.
- Impatto: chi accede ai log o al database reimposta senza limiti di tempo la password di qualunque utente, admin compresi.
- Correzione:
  - Controllo `expires_at > now()`.
  - Uso singolo, con `DELETE … RETURNING` in transazione.
  - Salvare l'hash SHA-256 del token.
  - Invalidare gli altri token e le sessioni.
  - Lunghezza minima della password.
  - Token nel frammento `#` o in un POST, non nella query; oppure escludere quel percorso dai log.

**8. Nessun limite ai tentativi su login e reset, ed enumerazione degli account.** File `app/auth.js:10-22`, `:24-33`.
- Fatto: non ci sono rate limit né blocchi sul login, sul reset e su `/password/forgot`, che invia email senza limiti.
- Fatto: il tempo di risposta del login cambia a seconda che l'utente esista (bcrypt solo se esiste); `forgotPassword` invia la mail solo agli utenti esistenti, con tempi diversi.
- Correzione: limiti per IP e per account (attenzione: oggi l'IP del client non è affidabile, vedi rilievo 14). Confronto bcrypt anche con un hash fittizio. Invio della mail in modo asincrono.

**9. Redirect aperto dopo il login.** File `app/auth.js:20`.
- Fatto: `startsWith("/")` accetta `//evil.example` e `/\evil.example`.
- Impatto: phishing subito dopo un login legittimo, se il frontend esegue il redirect (ipotesi: frontend non visto).
- Correzione: accettare solo percorsi che iniziano con `/` seguito da un carattere diverso da `/` e `\`, oppure una lista di destinazioni ammesse.

**10. Sessioni JWT non revocabili e ruolo letto dal token.** File `app/auth.js:19`, `:43-52`.
- Fatto: il token dura 8 ore e porta il ruolo. `requireUser` non ricontrolla `active` né il ruolo attuale nel database.
- Impatto: un utente disattivato o declassato (per esempio dopo l'abuso del rilievo 1) mantiene l'accesso fino alla scadenza. Non c'è logout lato server.
- Correzione: rileggere ruolo e `active` a ogni richiesta (o con una cache breve), oppure una versione del token per utente da incrementare a ogni cambio di ruolo, password o stato.

**11. `auditor` non è in sola lettura e manca un controllo dei ruoli sulle azioni.** File `app/server.js:24-30`.
- Fatto: il README definisce `auditor` in sola lettura, ma chiunque sia autenticato può creare ordini, importare XML, caricare file e usare il webhook di prova. `operator` e `auditor` creano ordini a proprio nome.
- Fatto: `orders.get` restituisce `SELECT *` (`orders.js:20`).
- Correzione: matrice ruoli × azioni applicata con un middleware `requireRole(...)`; colonne esplicite nelle risposte.

**12. Quantità e righe degli ordini non validate.** File `app/orders.js:27-29`, `:37`; `app/db.js:24-30`.
- Fatto: `qty` non viene controllato. Passano negativi, decimali, zero, NaN e stringhe, quindi sono possibili totali negativi o falsati. Gli SKU inesistenti vengono scartati in silenzio (`INSERT … SELECT` senza righe), quindi un ordine può risultare vuoto con totale `NULL`.
- Correzione: `qty` intero tra 1 e un massimo, `sku` stringa con formato definito, errore se lo SKU non esiste, vincolo `CHECK (qty > 0)` nel database.

**13. Path traversal nella scrittura dei file caricati.** File `app/upload.js:14-15`.
- Fatto: `file.filename` viene dal client e finisce in `path.join(UPLOAD_DIR, name)`. Con un nome come `../../tmp/x` si scrive fuori da `/srv/uploads`, ovunque l'utente `node` abbia permessi di scrittura.
- Osservazione: `/app` viene copiato da root, quindi l'impatto è limitato, ma non verificato nell'immagine. La stessa stringa viene salvata nel database e riusata in `download` (`:24`).
- Correzione: la stessa del rilievo 4 (nome generato dal server). Controllare inoltre che `path.resolve` resti sotto `UPLOAD_DIR`.

### P3

**14. Log poco utili per le indagini.**
- `ip: req.socket.remoteAddress` (`server.js:12`) registra sempre l'IP di nginx: manca `trust proxy`. Va configurato solo dopo aver corretto `set_real_ip_from 0.0.0.0/0` in nginx, vedi la sezione fuori perimetro.
- L'export dei dati personali è registrato a livello `debug` (`orders.js:53`), quindi assente con il livello predefinito `info`. Non vengono registrati cambi di ruolo (`auth.js:63-68`), reset della password né chi ha eseguito l'export.
- Il login registra l'email in chiaro: va valutato con la Privacy.
- Correzione: eventi di sicurezza a livello `info` o superiore, con id utente, attore e destinatario.

**15. CSV injection e formato fragile nell'export.** File `app/orders.js:54`.
- Fatto: i campi non sono quotati. Un `;` o un a capo rompe le righe, e i valori che iniziano con `= + - @` vengono eseguiti come formule in Excel.
- Correzione: quotare i campi secondo RFC 4180 e anteporre `'` ai valori a rischio.

**16. Avvio senza configurazione obbligatoria e modulo mancante.**
- Fatto: `JWT_SECRET` non viene validato all'avvio (`auth.js:7`). Il login fallisce a runtime, senza fail-open, ma conviene validare lunghezza ed entropia all'avvio.
- Fatto: `require("./mail")` (`auth.js:5`) punta a un file che non c'è in `app/`: o il modulo manca o è fuori dalla copia. Non verificato.

**17. Il `Dockerfile` può vanificare `--omit=dev`.** File `app/Dockerfile:4-5`.
- Fatto: `COPY . .` dopo `npm ci`, senza `.dockerignore` in `app/`. Un `node_modules` locale (con le dipendenze di sviluppo, tra cui `docgen-lite` 0.9.4 con FNSA-2026-0311 a 9.8) sovrascrive quello installato, e nell'immagine finiscono anche altri file locali.
- Correzione: `.dockerignore` con `node_modules`, `.env*` e `.git`, oppure una build multi-stage.
- Fuori immagine: `docgen-lite` resta da aggiornare alla 0.9.6 nella CI, P3, perché elabora template del repository.

**18. Processo delle vulnerabilità** (osservazioni da `security/`).
- L'eccezione su FNSA-2026-0102 (`pino-abstract-transport`) è scaduta il 2026-09-30 ed è ancora attiva. La correzione esiste da pino 9.6.0 (2026-10-07), mentre l'app usa ancora `pino` 9.5.0. Il rischio reale è basso: l'app non configura transport con destinazioni esterne. Va comunque aggiornata ed eliminata l'eccezione.
- La scansione del lockfile riguarda il commit `3f2a9c1` del 2026-08-14 e riporta `express` 4.19.2, mentre il lockfile attuale ha 4.21.2. La scansione non rappresenta il codice corrente: va rifatta.
- `libssl3` nell'immagine (IMG-2026-4471): ipotesi da verificare, le build ufficiali di Node includono un proprio OpenSSL, quindi il pacchetto di sistema probabilmente non viene usato da `fetch` (controllare con `node -p process.versions.openssl`).
- Node 22.11.0: verificare se ci sono rilasci di sicurezza successivi. Non ho potuto farlo senza web.
- L'eccezione su `minimatch` è motivata: P3.

## Fuori perimetro, da passare a Network, Cloud e IAM (non valutati a fondo)
Li ho notati leggendo il contesto e cambiano l'esposizione dell'app. Il primo può valere P1 o più: suggerisco una verifica prioritaria.
- `infra/nginx.conf:9-11`: `set_real_ip_from 0.0.0.0/0` con `real_ip_recursive on` fa fidare nginx di qualunque `X-Forwarded-For`. Un client può dichiararsi `10.8.0.x` e superare `allow 10.8.0.0/24` su `/admin/` (da confermare con un test autorizzato).
- `docker-compose.yml:24-25`: `admin` pubblica la porta `8081` sull'host e il security group apre `8000-8100` a `0.0.0.0/0`, quindi il pannello sembra raggiungibile senza nginx e senza VPN.
- `db` è anche sulla rete `frontend` (`docker-compose.yml:34`). SSH è aperto a `0.0.0.0/0`.
- `/metrics` viene inoltrato da nginx senza restrizioni (`nginx.conf:54-56`). L'app oggi non ha quella rotta.

## Rischio residuo
Finché i rilievi 1-6 restano aperti, un cliente o un revisore esterno con credenziali valide può arrivare al controllo amministrativo e ai dati di tutti i clienti, e chiunque conosca un'email registrata può fermare il servizio.

## Limiti
- Non ho a disposizione `node_modules`, il frontend, `mail.js`, lo schema del database, il pannello `admin` e la configurazione del bilanciatore.
- Nessun test dinamico.
- Il comportamento delle librerie (`xml-mapper`, `multipart-lite`) viene dal rapporto dello scanner, non dal loro codice.
- Riferimenti OWASP, ASVS e CVSS non verificati sulle schede della biblioteca né sul web.
- Le severità sono una proposta e vanno confermate dall'utente. Il direttore AICA-01 non era disponibile per il riesame.

## Piano della nuova verifica
1. Dopo le correzioni dei rilievi 1-5: test automatici per ogni ruolo su ogni rotta, test con payload di SQL injection e SSRF, test di robustezza sui body malformati (il processo deve restare vivo).
2. Scansione delle dipendenze sul lockfile e sull'immagine correnti, con conferma di `multipart-lite` ≥ 2.3.4 e `xml-mapper` 2.x anche nella versione annidata.
3. Revisione di nginx e Compose con lo specialista di rete.
4. Con un'autorizzazione scritta: un test attivo mirato su `/admin/` (`X-Forwarded-For`), sulla porta 8081 e su `/files/`.

Firmato: AICA-03 · BETELGEUSE
