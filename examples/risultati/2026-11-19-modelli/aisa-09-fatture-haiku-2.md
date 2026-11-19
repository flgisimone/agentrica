# Revisione di sicurezza dell'API api-fatture

AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

## Sintesi

Ho esaminato l'API (Node 22, senza dipendenze) in `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/9246e669-5e3d-40d5-8d76-e41f06314a00/scratchpad/runs/aisa-09-api-fatture-haiku-2`: `src/server.js`, `src/auth.js`, `src/invoices.js`, `src/store.js`, `package.json` e `README.md`. Non ho aperto `documenti/esempio.pdf`, che non serve alla revisione.

Ho trovato **due rilievi P0**, da segnalare subito: un accesso non autorizzato ai dati di altri utenti e le password scritte in chiaro nei log. Ho verificato entrambi, insieme ad altri rilievi, con un'istanza locale su una porta di prova e dati sintetici (utenti di prova di `store.js`). Il server è stato fermato al termine e non ho modificato alcun file del progetto.

Nel complesso l'impianto ha alcune scelte giuste: il confronto della chiave admin usa `timingSafeEqual`, con chiave vuota l'export è negato, il percorso del PDF è ridotto al basename e il PDF controlla il proprietario, la lettura del body è limitata a 64 KB, gli errori non espongono stack e non ci sono dipendenze da controllare.

## Rilievi

### P0 · Lettura di fatture di altri utenti (IDOR)
- **File:** `src/server.js`, riga 71 (riga 77 è l'unico controllo del proprietario, ed è solo per il PDF).
- **Problema:** `GET /invoices/:id` restituisce la fattura a qualunque utente autenticato che ne conosca l'ID, senza verificare `ownerId`. Espone cliente, importo, scadenza e proprietario.
- **Verifica:** Anna (u1) ha letto con `GET /invoices/<id>` la fattura di Bruno (u2): risposta 200 con tutti i campi. Lo stesso tentativo sul PDF dà 404, quindi il controllo lì funziona.
- **Nota:** lo sfruttamento richiede l'ID (UUID v4), che non è esposto dalle rotte utente. La protezione attuale è solo quella; il rilievo resta P0 perché il controllo di autorizzazione manca del tutto ed è corretto con una riga.
- **Correzione proposta:** spostare il controllo `invoice.ownerId !== user.id` (→ 404) prima della risposta per `GET /invoices/:id`.

### P0 · Password in chiaro nei log
- **File:** `src/server.js`, riga 41: `console.log("login", JSON.stringify(body))`.
- **Problema:** ogni tentativo di login scrive nel log email e password in chiaro, anche quando l'utente non esiste o la password è errata.
- **Verifica:** nei log compaiono tutte le richieste di login, con il campo `password` valorizzato (il testo non è riportato qui).
- **Correzione proposta:** rimuovere la riga o registrare solo l'esito e un identificativo non sensibile.

### P1 · Mass assignment nella modifica delle bozze
- **File:** `src/invoices.js`, riga 25: `Object.assign(invoice, body)`, con `body` preso così com'è da `src/server.js` riga 73.
- **Problema:** il proprietario di una bozza può modificare qualunque campo: `ownerId`, `id`, `status`, `pdf`, e anche `amount` e `customer` senza validazione.
- **Verifica:** Anna ha inviato `PATCH {"ownerId":"u2"}` su una sua bozza: la fattura è passata a Bruno (200), sparita dalla lista di Anna e comparsa in quella di Bruno. Con `PATCH {"pdf":"esempio.pdf"}` ha allegato alla sua fattura un file della cartella `documenti/` (200, il PDF è scaricabile). Il controllo della riga 23 impedisce di toccare fatture altrui, ma non limita i campi.
- **Correzione proposta:** modificare solo una lista di campi ammessi (es. `customer`, `amount`, `dueDate`) con validazione come in `create`.

### P1 · Token di sessione non crittografici
- **File:** `src/auth.js`, righe 8-10: `Math.random().toString(36)` più `Date.now()`.
- **Problema:** il token di sessione è prevedibile e non ha entropia sufficiente per un cookie di autenticazione (ASVS V3).
- **Correzione proposta:** `randomBytes(32).toString("base64url")` o `randomUUID()` da `node:crypto`.

### P1 · CORS con riflessione di qualunque origine e credenziali
- **File:** `src/server.js`, righe 24-31: `access-control-allow-origin` copia l'`Origin` della richiesta e imposta `access-control-allow-credentials: true`; manca `Vary: Origin`.
- **Verifica:** con `Origin: https://sito-esterno.example` la risposta include `ACAO: https://sito-esterno.example` e `ACAC: true`, anche nel preflight.
- **Problema:** qualunque sito può fare richieste autenticate e leggerne le risposte. Oggi il rischio è contenuto dal fatto che il cookie non ha `SameSite` (i browser lo trattano come `Lax`, che non si invia nelle richieste cross-site). Lo stesso comportamento con un sottodominio dello stesso sito, o con un cookie `SameSite=None` per un frontend su un altro sito, rende lo sfruttamento diretto.
- **Correzione proposta:** una lista di origini consentite (es. `https://app.studio.example`), nessuna riflessione, `Vary: Origin`.

### P1 · Hash delle password non adeguato
- **File:** `src/store.js`, riga 4: SHA-256 senza sale, uguale per tutti gli utenti.
- **Problema:** un hash veloce e senza sale si decifra in modo rapido e confrontabile se lo store esce; `store.js` dice che in produzione ci sarà un database.
- **Correzione proposta:** `scrypt` (da `node:crypto`) o argon2id, con sale per utente e confronto a tempo costante. Da fare prima della persistenza.

### P2 · Enumerazione degli utenti al login
- **File:** `src/auth.js`, righe 14-15: messaggi diversi per utente inesistente (`Utente inesistente`) e password errata (`Password errata`).
- **Verifica:** le due risposte sono diverse (401 con testo diverso).
- **Correzione proposta:** un solo messaggio generico, es. «Credenziali non valide».

### P2 · Nessun limite ai tentativi di login
- **File:** `src/server.js`, riga 39 (`POST /login`); la chiave admin in `src/server.js` riga 47 non ha limiti.
- **Verifica:** 30 tentativi errati di seguito, tutti 401, nessun blocco né ritardo.
- **Correzione proposta:** limite per IP e per account con ritardo progressivo; per la chiave admin valutare un limite e un log dei tentativi.

### P2 · Cookie di sessione senza attributi di sicurezza
- **File:** `src/auth.js`, riga 18: `sid=...; Path=/; Max-Age=28800`.
- **Verifica:** il `Set-Cookie` non ha `HttpOnly`, `Secure` né `SameSite`.
- **Correzione proposta:** `HttpOnly; Secure; SameSite=Lax` (o `None; Secure` se il frontend è su un sito diverso, da confermare con la configurazione di deploy).

### P2 · Body letto senza controllo del Content-Type (CSRF)
- **File:** `src/server.js`, righe 13-22 (`readJson`), usato da `/login` e dalle richieste di scrittura.
- **Verifica:** `POST /login` con `content-type: text/plain` e body JSON risponde 200. Le richieste da form cross-site non portano cookie `Lax`, quindi il rischio è oggi mitigato dal default del browser, ma non c'è una difesa propria.
- **Correzione proposta:** accettare solo `application/json` (415 altrimenti), e valutare un token CSRF o la verifica di `Origin`.

### P2 · Validazione insufficiente di importo e scadenza
- **File:** `src/invoices.js`, righe 13, 17 e 18.
- **Verifica:** `Number(null)` diventa 0, quindi `amount: null` è accettato e salvato come `0` (201). La scadenza `2026-13-45` passa il controllo sul formato (201). Non c'è controllo di segno né di intervallo, quindi sono ammessi importi negativi.
- **Correzione proposta:** importo numerico finito e positivo, controllo di data reale (anno, mese, giorno), limite massimo.

### P2 · Esportazione CSV senza escape (CSV injection e separatori)
- **File:** `src/invoices.js`, riga 35: campi uniti con `;` senza escape.
- **Verifica:** il cliente `=1+1;Test` finisce nel CSV così com'è (`...;=1+1;Test;0;...`), con un separatore in più che sposta le colonne. Un cliente come `=HYPERLINK(...)` verrebbe interpretato come formula da un foglio di calcolo aperto dall'amministrazione.
- **Correzione proposta:** escape CSV (virgolette per i campi con separatori o a capo) e prefisso `'` per i valori che iniziano con `= + - @`; limitare i caratteri di `customer`.

### P2 · Credenziali di prova nel codice sorgente
- **File:** `src/store.js`, righe 7-8: password in chiaro nel sorgente per gli utenti di prova, caricati all'avvio.
- **Problema:** se l'app parte con questo store, questi account restano attivi con credenziali note. Il README rimanda a questo file per gli utenti di prova.
- **Correzione proposta:** caricare gli utenti di prova solo in ambiente locale con una variabile esplicita, o generarli a ogni avvio.

### P3 · Confronto della password non a tempo costante
- **File:** `src/auth.js`, riga 15 (`!==` sull'hash). Basso impatto, dato l'hash SHA-256 già da sostituire (rilievo P1 sopra).

### P3 · Sessioni scadute mai rimosse dalla mappa
- **File:** `src/auth.js`, riga 5 (`sessions`), righe 28 e 17: le sessioni scadute restano in memoria fino al riavvio.

### P3 · Confronto della chiave admin con lunghezza rivelata
- **File:** `src/auth.js`, righe 33-35: il confronto esce prima se la lunghezza è diversa, che rivela la lunghezza della chiave. Impatto basso.

### P3 · Esportazione admin senza traccia
- **File:** `src/server.js`, righe 47-51: l'export di tutti i dati non lascia traccia di chi l'ha fatto.

### P3 · Errori su PDF mancante
- **File:** `src/server.js`, righe 78-79 e 89: un `readFile` fallito (es. file assente) finisce nel catch e risponde 400 «Richiesta non valida» invece di 404.

### P3 · Configurazione HTTP
- **File:** `src/server.js`, righe 86-91: il server ascolta su tutte le interfacce, senza timeout di richiesta né header di sicurezza (es. `X-Content-Type-Options`). Va chiarito che in produzione c'è un proxy con TLS davanti.

## Test eseguiti

Istanza locale di prova (`PORT=3999`, chiave admin di prova), avviata e fermata dentro un unico script `node` in memoria, con richieste HTTP reali e dati sintetici. Esiti riportati sopra: enumerazione (1a/1b), cookie (2), tentativi ripetuti (3), IDOR (5, 5b), mass assignment (6b, 6d, 6e, 6f), content-type (7), CORS (8, 8b), export (9, 9b), log (10, 10b). Nessun file del progetto modificato.

Non eseguiti: test nel browser (il comportamento di `SameSite` è stato dedotto, non verificato), test TLS e di carico, `npm audit` (nessuna dipendenza), e un test automatico nel progetto (non ci sono script di test in `package.json`).

## Limiti e decisioni

- Ho valutato solo l'API. Non ho visto il frontend su `app.studio.example`, né la configurazione di deploy, né il dominio dell'API: la gravità di CORS e del cookie dipende da questi dati, da confermare.
- Non ho proposto né applicato correzioni al codice: il perimetro è solo di revisione.
- I rilievi P0 (IDOR e log delle password) vanno corretti prima di qualunque uso, anche in staging.

## Attività residue

1. Correggere P0 e P1 (IDOR, log delle password, mass assignment, token di sessione, CORS, hash delle password) e riverificare con gli stessi test.
2. Valutare P2: cookie, Content-Type, validazione, CSV, rate limit, enumerazione, credenziali di prova.
3. Decidere con l'utente la configurazione di deploy (dominio, TLS, `SameSite`) per chiudere il dubbio su CORS e cookie.

Firmato: AISA-09 · REGULUS
