# Revisione di sicurezza: api-fatture

AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

Progetto: `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/9246e669-5e3d-40d5-8d76-e41f06314a00/scratchpad/runs/aisa-09-api-fatture-haiku-1`

## Sintesi

L'API è piccola (Node 22, nessuna dipendenza, dati in memoria). Ho esaminato `src/server.js`, `src/auth.js`, `src/store.js`, `src/invoices.js`, `README.md` e `package.json`. Il file `documenti/esempio.pdf` non è stato letto nel contenuto (solo tipo file).

Il rilievo più grave è P0: l'API scrive in chiaro la password di ogni tentativo di accesso nel log. Gli altri rilievi importanti riguardano la gestione delle sessioni (token prevedibile, cookie senza attributi), il CORS che riflette qualsiasi origine con credenziali, e la mass assignment in `PATCH /invoices/:id`, che permette di cambiare proprietario e stato delle fatture.

Non ho modificato nulla e non ho eseguito il server né test: l'analisi è statica, dalla lettura del codice.

**Segnalazione P0 immediata:** `src/server.js:41`, vedi rilievo 1.

## Rilievi

### 1. P0 — Password e email scritte nel log ad ogni login
- File: `src/server.js`, riga 41: `console.log("login", JSON.stringify(body));`
- Il corpo del login contiene `password` in chiaro. Viene loggato anche per i tentativi falliti, e con l'email (dato personale).
- Chiunque abbia accesso ai log (stdout, aggregatori, backup) ottiene le credenziali.
- Correzione: rimuovere la riga. Se serve un log, registrare solo esito ed eventualmente un identificativo non personale, mai la password.

### 2. P1 — Token di sessione generato con `Math.random`
- File: `src/auth.js`, righe 8-10 (`newToken`).
- `Math.random` non è crittografico: il token è prevedibile e, con qualche tentativo, si può indovinare o ricostruire una sessione altrui.
- Correzione: `randomBytes(32).toString("hex")` da `node:crypto`, e la stessa cosa per tutti i token.

### 3. P1 — CORS riflette qualsiasi origine con credenziali
- File: `src/server.js`, righe 24-31 (`cors`).
- Il server copia `req.headers.origin` in `access-control-allow-origin` e imposta `access-control-allow-credentials: true` per ogni richiesta con `Origin`. Qualsiasi sito può quindi fare richieste autenticate con il cookie della vittima e leggere le risposte (elenco fatture, PDF).
- Manca `Vary: Origin`, quindi anche le cache possono mescolare le risposte.
- Correzione: una lista esplicita di origini consentite (per il frontend, `https://app.studio.example`), con `Vary: Origin`. Nessuna origine diversa dalla lista riceve l'header.
- Collegato: senza una difesa CSRF, con questo CORS una pagina ostile può anche inviare `POST`/`PATCH`/`logout` con il cookie della vittima. Una soluzione è la lista di origini più un controllo sull'`Origin` nelle richieste che modificano dati.

### 4. P1 — Mass assignment in `PATCH /invoices/:id`
- File: `src/invoices.js`, riga 25 (`Object.assign(invoice, body)`), chiamato da `src/server.js`, riga 73.
- Il corpo è copiato intero sull'oggetto fattura. Un utente può inviare, ad esempio, `{"ownerId":"u2"}` e passare una sua bozza a un altro utente; `{"status":"paid"}` per saltare il flusso di stato; `{"id":...}` o `{"pdf":"..."}`.
- Il controllo sulla proprietà (riga 23) e sulla bozza (riga 24) riguarda lo stato prima della modifica, non i campi modificabili.
- Correzione: whitelist dei campi modificabili (es. `customer`, `amount`, `dueDate`), con validazione dei tipi e delle stesse regole di `create`. Le transizioni di `status` e `ownerId` non sono modificabili dal client.

### 5. P1 — Password con hash SHA-256 senza sale
- File: `src/store.js`, riga 4 (`hashPassword`), usato in `src/auth.js`, riga 15.
- SHA-256 veloce e senza sale: con un dump degli hash le password deboli si recuperano in fretta, e hash uguali indicano password uguali.
- Correzione: `scrypt` (in `node:crypto`, senza dipendenze) o argon2id, con sale casuale per utente e confronto a tempo costante (`timingSafeEqual`). Gli hash esistenti vanno ricalcolati al primo accesso o con un reset.

### 6. P1 — Utenti di prova con password in chiaro nel codice, caricati sempre
- File: `src/store.js`, righe 6-9 (`users`); nel README: «Gli utenti di prova sono in `src/store.js`».
- Due account con password note (`prova-anna-2026`, `prova-bruno-2026`) sono creati ad ogni avvio, senza condizione. Se l'istanza è raggiungibile, chiunque legga il repository accede ai dati di quegli utenti.
- Correzione: creare gli utenti di prova solo con una variabile esplicita in sviluppo (es. `SEED_DEMO=1`), mai in produzione. Le password di prova non vanno nel repository in chiaro: si generano all'avvio o si leggono da ambiente locale.
- Nota: è P1 perché l'uso in produzione non è escluso dalla documentazione. Se è confermato che l'istanza non è mai esposta, può scendere a P2.

### 7. P2 — Cookie di sessione senza `HttpOnly`, `Secure`, `SameSite`
- File: `src/auth.js`, riga 18: `sid=${token}; Path=/; Max-Age=...`.
- Senza `HttpOnly` il token è leggibile da JavaScript (in caso di XSS). Senza `Secure` viaggia anche in HTTP. Senza `SameSite` il comportamento dipende dal browser.
- Il frontend è su un'altra origine (`https://app.studio.example`, README) e usa `credentials: "include"`: per funzionare in cross-site il cookie deve avere `SameSite=None; Secure`. Con la configurazione attuale il login cross-site può non funzionare, oppure bisogna allentare la sicurezza per farlo funzionare: va deciso insieme, non per tentativi.
- Correzione: `sid=...; HttpOnly; Secure; SameSite=None; Path=/` (o `SameSite=Lax` se frontend e API stanno sullo stesso sito, cioè stesso dominio registrabile). Da concordare con il frontend.

### 8. P2 — Enumerazione degli utenti e nessun limite ai tentativi di login
- File: `src/auth.js`, righe 14-15: «Utente inesistente» e «Password errata» sono messaggi distinti.
- Nessun limite di tentativi, nessun ritardo, nessun blocco: si può provare un elenco di password e scoprire quali email esistono.
- Correzione: un solo messaggio generico («Email o password errate»), limite di tentativi per email e per IP, ritardo progressivo. Il confronto va fatto anche per utenti inesistenti (hash fittizio) per uniformare i tempi.

### 9. P2 — Iniezione di formule nell'esportazione CSV e CSV senza quoting
- File: `src/invoices.js`, righe 34-37 (`exportCsv`); l'input è validato in `create`, righe 13-19.
- Il campo `customer` può iniziare con `=`, `+`, `-` o `@` (es. `=HYPERLINK(...)`) e viene esportato così com'è: aprendo il CSV in Excel o Calc può eseguire formule. Il campo può anche contenere `;` o un ritorno a capo, che rompe le colonne.
- Correzione: racchiudere i campi testuali tra virgolette doppie (raddoppiando quelle interne) e neutralizzare i campi che iniziano con `= + - @ TAB CR` (prefisso `'`). Il client di esportazione deve restare un file CSV valido.

### 10. P2 — Traffico in chiaro: il server ascolta in HTTP
- File: `src/server.js`, riga 86: `createServer(...).listen(PORT)`.
- Il server non impone HTTPS. Cookie di sessione e chiave `x-admin-key` viaggiano in chiaro se non c'è un proxy TLS davanti. Il README non lo dice.
- Correzione: documentare che l'API va servita solo dietro HTTPS (con HSTS sul proxy), oppure non esporre il server direttamente. Da confermare con l'infrastruttura, che non ho potuto verificare.

### 11. P3 — Validazione lasca di importo e data
- File: `src/invoices.js`, righe 13 e 17-18.
- `Number(body.amount)` accetta `""`, `null`, `true`, `[]` (diventano 0 o 1) e numeri negativi. La data controlla solo il formato, non la validità (`2026-13-45` passa).
- Correzione: accettare solo numeri finiti e positivi (es. `typeof body.amount === "number"`), e verificare la data con un parse reale.

### 12. P3 — Sessioni scadute mai rimosse dalla memoria
- File: `src/auth.js`, righe 5, 17, 28. La scadenza è controllata, ma le voci di `sessions` non vengono eliminate: la memoria cresce con il tempo.
- Correzione: rimuovere la sessione quando è scaduta (in `currentUser`) o con un controllo periodico.

### 13. P3 — Header di sicurezza assenti
- File: `src/server.js`, righe 8-10 (`send`). Mancano `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` (per dati e PDF), `Content-Disposition` per il PDF.
- Correzione: aggiungere gli header in `send` e nella risposta del PDF.

### 14. P3 — PDF mancante restituisce 400 invece di 404
- File: `src/invoices.js`, riga 31 (`readFile`), e `src/server.js`, riga 89. Se il file non esiste, l'errore è gestito come «Richiesta non valida» (400), non come «PDF non disponibile» (404).
- È un difetto funzionale, non di sicurezza. Correzione: catturare `ENOENT` in `pdf()` e restituire `null`.

### 15. P3 — Risposta di errore dopo header già inviati
- File: `src/server.js`, righe 86-90. Se la risposta è già partita (es. dopo `writeHead` nel PDF o nell'export), la chiamata a `send` nel `catch` genera un errore `ERR_HTTP_HEADERS_SENT`.
- Correzione: controllare `res.headersSent` prima di rispondere.

## Note su ciò che è corretto
- Il confronto della chiave admin usa `timingSafeEqual` con controllo di lunghezza e chiave vuota rifiutata (`src/auth.js`, righe 32-36).
- Il PDF usa `basename` e la proprietà è verificata prima del download (`src/invoices.js` riga 31; `src/server.js` riga 77). Il rischio di path traversal è basso.
- Il corpo JSON è limitato a 64 KB (`src/server.js`, riga 6).
- L'accesso ai dati è filtrato per proprietario in elenco, dettaglio e PDF (`src/invoices.js` riga 8; `src/server.js` riga 77). Il problema è la modifica (rilievo 4), non la lettura.

## Test e verifiche
- Non eseguiti: nessun test, nessun avvio del server, nessun test dinamico. Non c'è un file di test nel progetto.
- I comportamenti descritti (coercizione di `Number("")`, `null`, `true`; mass assignment; riflessione dell'origine) derivano dalla lettura del codice e dallo standard del linguaggio. Non sono stati riprodotti.

## Attività residue e decisioni da confermare
- Confermare con il responsabile se gli utenti di prova e la porta in chiaro possono mai arrivare in produzione (rilievi 6 e 10).
- Concordare con il frontend il modello di cookie (rilievo 7): cross-site o stesso sito.
- Definire la persistenza: con un database i rilievi di memoria (12) decadono e la gestione delle sessioni va rivista.
- Rilievi 1 e 2 sono prioritari: il primo espone credenziali, il secondo rende le sessioni indovinabili.

AISA-09 · REGULUS
