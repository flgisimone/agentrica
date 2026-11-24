AICA-03 · BETELGEUSE — Senior Application Security Engineer, reparto AICA (AI Cybersecurity)

# Revisione sicurezza applicativa di `app/` (portale-ordini 2.4.1), sola lettura

## Sintesi
Ho trovato 6 rilievi P1, 5 P2 e 5 P3. Il più grave è `requireAdmin`: un operatore o un auditor passa come amministratore, può dare a sé il ruolo `admin` ed esportare l'anagrafica clienti. Seguono SQL injection nell'ordinamento, scrittura di file arbitrari nell'upload e SSRF nel test del webhook. Due dipendenze raggiungibili hanno vulnerabilità note (multipart-lite, già sfruttata in rete; xml-mapper).
Ho agito come specialista (modello Sonnet) e non ho eseguito il codice. Ci sono rilievi P1, quindi propongo il riesame del direttore AICA-01 (VEGA) o di un revisore su Opus prima che diventino definitivi.

## Perimetro e metodo
- **Perimetro:** codice in `app/` (`server.js`, `auth.js`, `orders.js`, `upload.js`, `db.js`, `Dockerfile`, `package.json`, `package-lock.json`). Ho letto `security/scan-2026-11-20.json` e `security/scanner-ignore.yml` solo per le dipendenze e il README per i ruoli.
- **Metodo:** lettura statica manuale. Nessun test attivo, nessuna scansione, nessun processo avviato, nessuna modifica ai file.
- **Biblioteca:** non ho letto le schede (OWASP Top 10:2025, ASVS 5.0.0, CVSS v4.0), perché il tool library non era disponibile. Le gravità sono quindi mie, a giudizio, senza punteggio CVSS.
- **Fonti:** i dati sulle dipendenze vengono solo dalla scansione interna del 2026-11-20, che non ho potuto confrontare con advisory esterni.

## Rilievi

**1. P1 — `requireAdmin` è una denylist: operator e auditor passano come admin.**
- File: `app/auth.js:54-57`. Il controllo è `if (req.user.role !== "customer") return next();`.
- Le rotte `/api/admin/*` (`server.js:32-34`) valgono quindi per `operator` e `auditor`.
- Impatto: un operatore o un auditor (sola lettura per README) elenca gli utenti (`listUsers`, `auth.js:59`), si promuove ad `admin` con `setRole` (`auth.js:63-68`) ed esporta i dati dei clienti (`orders.js:51-55`).
- Correzione: allowlist esplicita, `role === "admin"`. Per `setRole` aggiungere un controllo sul ruolo di partenza e un log di audit.

**2. P1 — SQL injection in `ORDER BY` (`sort`).**
- File: `app/orders.js:7-13`.
- Si controlla solo il primo token di `sort.split(" ")`, ma tutto `sort` finisce nella query con `${sort}`. Un valore come `created_at DESC,(SELECT ...)` passa.
- Impatto: SQL injection (non esclusa la lettura via blind) per qualunque utente autenticato, compreso `customer`. Può leggere altre tabelle, ad esempio `password_hash` in `users`.
- Correzione: mappa chiusa `{created_at, total, status}` × `{ASC, DESC}` con valori fissi, costruita dal server.

**3. P1 — Path traversal nel salvataggio dei file caricati.**
- File: `app/upload.js:14-15`.
- `file.filename` arriva dal client senza pulizia. `path.join` normalizza in modo lessicale, quindi `a/../../x` dentro il nome esce da `/srv/uploads`.
- Impatto: scrittura di file arbitrari, con il contenuto scelto dall'attaccante, ovunque l'utente `node` abbia i permessi. Il record in `files` conserva poi il nome manipolato.
- Aggravanti:
  - il tipo si controlla solo su `file.contentType` dichiarato dal client (`upload.js:13`), senza magic bytes;
  - l'estensione resta quella dell'attaccante (`.html`, `.svg`), con rischio di XSS persistente se nginx serve `/files/` con tipi dedotti dall'estensione (da verificare in `infra/nginx.conf`, fuori da `app/`).
- Correzione: nome generato dal server (UUID più estensione da allowlist), `path.basename`, verifica che il percorso risolto resti sotto `UPLOAD_DIR`, controllo dei magic bytes.

**4. P1 — SSRF in `testWebhook`.**
- File: `app/orders.js:42-49`.
- Il filtro blocca solo l'hostname `localhost` e gli schemi non http/https.
- Non sono bloccati `127.0.0.1`, `[::1]`, `169.254.169.254` (metadata del cloud), `admin:8081`, `db`, `cache`, gli IP privati e i nomi che risolvono a IP interni. `fetch` segue i redirect e il corpo della risposta (2000 caratteri) torna al chiamante.
- Impatto: qualunque utente autenticato può sondare il pannello admin interno e la rete `backend` e leggere i metadati della VM, con possibile furto di credenziali cloud.
- Correzione: allowlist dei destinatari, oppure risoluzione DNS con blocco degli intervalli privati e link-local e fissaggio dell'IP risolto. Inoltre `redirect: "manual"`, timeout, e limitare l'endpoint a un ruolo che ne ha bisogno.

**5. P1 — Reset password: token senza scadenza applicata e riutilizzabile.**
- File: `app/auth.js:35-41`.
- `resetPassword` legge `expires_at` ma non lo confronta mai con la data corrente, e non cancella né marca come usato il token.
- Impatto: un link di reset trapelato (log, cronologia del browser, posta) vale per sempre e si usa più volte. Il takeover dell'account resta a disposizione di chi lo ha avuto.
- Correzione: controllare `expires_at > now()`, consumare il token in modo atomico (`DELETE ... RETURNING`), invalidare le sessioni. Meglio conservare l'hash del token (oggi è in chiaro, `auth.js:29`).

**6. P1 — Dipendenze vulnerabili raggiungibili dall'input esterno.** Fonte: `security/scan-2026-11-20.json`.
- `multipart-lite` 2.3.0, FNSA-2026-0287 (ReDoS sul boundary, sfruttamento osservato in rete da ottobre 2026, EPSS 0.71). È usato da `upload.js:11` per qualunque utente autenticato. Corretto in 2.3.4. Il CVSS 5.3 sottostima il rischio perché lo sfruttamento è reale.
- `xml-mapper` 1.8.2, FNSA-2026-0254 (prototype pollution, "con qualunque opzione"). `resolveExternal: false` in `orders.js:36` non mitiga, e il commento nel codice dà una falsa sicurezza. Il fix è solo nella 2.0.0 e cambia l'API (`parseDocument`). Esiste anche una seconda copia dentro `multipart-lite`.
- `pino-abstract-transport`: l'eccezione in `security/scanner-ignore.yml` è scaduta il 2026-09-30 e pino 9.6.0 è disponibile. Qui il rischio concreto è basso, perché la destinazione del transport non è controllata dall'esterno (`server.js:7`). Resta comunque una scadenza non rispettata.
- Nota sull'affidabilità della scansione: gira sul commit del 2026-08-14 e riporta express 4.19.2, mentre il lockfile attuale ha 4.21.2. Va rieseguita sul codice corrente prima di dare i numeri per definitivi.

**7. P2 — Il body non è validato e i handler async non gestiscono le eccezioni (DoS).**
- File: `app/auth.js:10-22`, `app/auth.js:35-39`, `app/orders.js:36-37`, `app/server.js` (assenza di error handler). Express 4.21 non intercetta le promise rifiutate.
- Esempio: `POST /login` con un `email` esistente e senza `password` fa lanciare `bcrypt.compare`. Stesso effetto per `password` mancante in `resetPassword` e per `xml` o `doc.order.items` non validi in `importXml`.
- Impatto: unhandled rejection, che in Node 22 termina il processo. Se non esiste riavvio automatico e `/login` è raggiungibile senza autenticazione, un singolo utente anonimo mette giù l'API. Non ho verificato la restart policy in `infra/` (fuori perimetro).
- Correzione: validazione dello schema in ingresso (tipi e lunghezze), wrapper per gli handler async o middleware di errore.

**8. P2 — Nessuna limitazione dei tentativi su `/login`, `/password/forgot` e `/password/reset`.**
- File: `app/server.js:18-20`.
- Impatto: brute force e credential stuffing senza freni, spam di email di reset.
- Correzione: rate limit per IP e per account, con blocco progressivo. Per i log vedi il rilievo 14 (IP).

**9. P2 — Quantità degli articoli non validate: totali negativi o NaN.**
- File: `app/orders.js:26-30`, `app/db.js:19-31`, `app/orders.js:36-38`.
- `qty` non viene controllata (né intera né positiva), `sku` non ha tipo verificato. I prezzi sono letti correttamente dal database, ma una `qty` negativa riduce il totale. Gli SKU inesistenti vengono scartati senza errore.
- Correzione: `Number.isInteger(qty) && qty > 0`, errore se lo SKU non esiste.

**10. P2 — I token JWT restano validi dopo un cambio di ruolo o la disattivazione dell'utente.**
- File: `app/auth.js:19`, `app/auth.js:43-52`.
- Il ruolo sta nel JWT con scadenza di 8 ore e `requireUser` non rilegge il database. Un utente declassato o disattivato (`active`) mantiene i privilegi fino alla scadenza.
- Correzione: ricaricare ruolo e stato attivo a ogni richiesta, oppure token brevi con revoca. Il rilievo cresce di peso insieme al n. 1.

**11. P2 — Export clienti senza traccia di audit e con CSV non sicuro.**
- File: `app/orders.js:51-55`.
- L'evento è a livello `debug` e non contiene l'utente, quindi l'esportazione di dati personali può non arrivare al SIEM. I campi non sono escapati: un `;` nel testo rompe il file e un valore che inizia con `=`, `+`, `-` o `@` è formula injection in Excel.
- Correzione: log `info` con utente, ruolo e numero di righe, escape corretto del CSV e neutralizzazione dei prefissi pericolosi. Coinvolgere Privacy & Compliance (dati personali dei clienti, base giuridica ed estensione dell'export).

**12. P3 — Enumerazione degli account tramite tempo di risposta del login.**
- File: `app/auth.js:12-13`. Se l'utente non esiste, `bcrypt.compare` non viene eseguito e la risposta è molto più veloce. Il messaggio è identico, ma il tempo no.
- Correzione: confronto contro un hash fittizio quando l'utente manca.

**13. P3 — Redirect aperto potenziale con `next`.**
- File: `app/auth.js:20`. Basta `startsWith("/")`, quindi `//evil.example` o `/\evil` passano. Il server restituisce solo il valore: il rischio dipende da come il client lo usa.
- Correzione: accettare solo percorsi relativi allo stesso sito, rifiutando `//` e `\`.

**14. P3 — Qualità dei log.**
- File: `app/server.js:12`, `app/auth.js:15,18`.
- Si registra `req.socket.remoteAddress`, che dietro il bilanciatore è l'IP del bilanciatore, non del client (`trust proxy` non impostato). I login falliti riportano il campo `email` così come digitato (può contenere una password per errore o dati personali). Mancano i log per `setRole` e per i reset di password.
- Correzione: `app.set("trust proxy", ...)` con il numero esatto di hop, log dei cambi di ruolo e dei reset, e non loggare l'identificativo grezzo.

**15. P3 — `db.createOrder` e gli SKU.**
- File: `app/db.js:25-28`. Un SKU non trovato non produce errore e un ordine può restare senza righe, con `total` NULL (e `sum` su zero righe). Il codice è corretto sul fronte SQL (query parametrizzate), ma la logica va chiusa insieme al rilievo 9.

**16. P3 — Hardening del container e del codice.**
- File: `app/Dockerfile`. L'immagine `node:22.11.0-bookworm-slim` non è fissata per digest, e c'è libssl3 con fix disponibile (IMG-2026-4471, da aggiornare ricostruendo l'immagine). Non ho visto un `.dockerignore` (verificare che `COPY . .` non porti dentro segreti).
- File: `app/auth.js:5`. `require("./mail")` punta a un file che non c'è in `app/`: se la copia è completa, l'app non parte.
- File: `app/server.js`. Mancano gli header di sicurezza (`helmet` o equivalente) e un error handler.

## Cosa è risultato corretto
- Query parametrizzate in tutti gli accessi tranne il rilievo 2.
- JWT con algoritmo fissato a HS256 in firma e verifica, scadenza presente, `bcrypt` con costo 12.
- Controllo di proprietà in `orders.get` e in `upload.download` (risposta 404 per gli altri utenti).
- Messaggio di login generico, risposta uniforme su `forgotPassword`, token di reset da 32 byte casuali.
- `sameApiKey` usa `timingSafeEqual` (non è usata).
- Dockerfile con `USER node` e `npm ci --omit=dev`.

## Rischio residuo, limiti e non verificato
- Non ho verificato `infra/nginx.conf` (come serve `/files/`, header, rate limit), i ruoli in `iam/`, la restart policy in `docker-compose.yml`, il codice delle librerie (`multipart-lite`, `xml-mapper`) né il `mail.js` mancante.
- Nessun test dinamico: i rilievi 2, 3, 4 e 7 sono dedotti dal codice e andrebbero confermati in un ambiente di test autorizzato con regole di ingaggio scritte.
- Questa analisi non è una certificazione. Un controllo verificato vale solo per i file letti.

## Piano di nuova verifica
1. Correggere nell'ordine 1, 2, 3, 4, 5 e 6 (aggiornare `multipart-lite` a 2.3.4, pianificare `xml-mapper` 2.0.0).
2. Rieseguire la scansione sul commit corrente e aggiornare o chiudere le eccezioni scadute.
3. Test autorizzati sui rilievi 1-5 con regole di ingaggio scritte, poi nuova revisione del diff.
4. Passaggio a Privacy & Compliance per l'export clienti (rilievo 11) e i log con dati personali (rilievo 14), poi consegna a AICA-01 · VEGA.

Firmato: AICA-03 · BETELGEUSE — Senior Application Security Engineer, reparto AICA (AI Cybersecurity)
