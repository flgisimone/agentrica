AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

# Revisione di sicurezza: api-fatture

Perimetro: README.md, package.json, src/server.js, src/auth.js, src/invoices.js, src/store.js. Ho fatto solo analisi statica, a sola lettura. Non ho eseguito il server né test, e non ho modificato file. Non ho aperto documenti/esempio.pdf. Riferimenti: OWASP Top 10 e ASVS.

## Sintesi

Nessun P0 confermato nel codice. Ci sono però sei rilievi P1, tutti sfruttabili da un utente autenticato o da un sito terzo:
- lettura delle fatture altrui;
- mass assignment in PATCH;
- CORS con credenziali verso qualsiasi origine;
- token di sessione prevedibile;
- password in chiaro nei log;
- cookie di sessione senza attributi di protezione.

Il livello di esposizione dipende da dove gira il servizio: verifica se i log vanno a un servizio condiviso.

## Rilievi

### 1. P1 — Accesso alle fatture altrui (IDOR), OWASP A01
File: src/server.js:71.
`GET /invoices/:id` restituisce la fattura a qualunque utente autenticato, senza controllare `ownerId`. PDF (server.js:77) e PATCH (invoices.js:23) lo controllano, il dettaglio no. Gli id sono UUID e quindi non indovinabili, ma finiscono in log, URL e screenshot. Con la modifica dell'`ownerId` (rilievo 2) diventano enumerabili.
Correzione: applicare il controllo di proprietà nel punto comune (`invoices.get(id, user)`, che restituisce 404 se la fattura non è dell'utente), non per singolo handler.

### 2. P1 — Mass assignment in PATCH, OWASP A01/A04
File: src/invoices.js:25 (`Object.assign(invoice, body)`).
Il corpo non ha una lista di campi ammessi né validazione. Un utente può quindi:
- cambiare `status` (bypass del flusso bozza/emessa);
- cambiare `ownerId` e spostare la fattura a un altro utente, o prendere possesso di fatture altrui già note;
- cambiare `id` e `amount` senza i controlli della creazione;
- impostare `pdf`. Il `basename` impedisce il path traversal, ma permette di puntare a qualunque file in `documenti/`, cioè ai PDF di altri utenti, che poi scarica con `/invoices/:id/pdf`;
- inserire una chiave `__proto__` dal JSON, che con `Object.assign` imposta il prototipo dell'oggetto (effetto limitato a quell'oggetto, non globale).
Correzione: lista bianca (`customer`, `amount`, `dueDate`) con le stesse validazioni di `create`, da riusare.

### 3. P1 — CORS riflette qualsiasi origine con credenziali, OWASP A05
File: src/server.js:26-27.
`access-control-allow-origin` riprende l'`Origin` della richiesta e `allow-credentials` è `true`. Qualunque sito visitato da un utente loggato può leggere e modificare le sue fatture. Il README dice che il frontend è solo `https://app.studio.example`.
Correzione: lista bianca esatta di origini (`https://app.studio.example`), aggiungere `Vary: Origin`, e non emettere nulla per le altre origini.

### 4. P1 — Token di sessione prevedibile, OWASP A02/A07
File: src/auth.js:9.
Il token è `Math.random()` più il timestamp: non è un generatore crittografico e il timestamp è noto. Entropia bassa, tentabile e ricostruibile da qualche token osservato.
Correzione: `randomBytes(32).toString("hex")` o `randomUUID()` da `node:crypto`, già importato altrove.

### 5. P1 — Password in chiaro nei log, OWASP A09
File: src/server.js:41 (`console.log("login", JSON.stringify(body))`).
Ogni accesso, riuscito o no, scrive email e password in chiaro nei log. È anche un trattamento di dati personali eccedente: coinvolgere Privacy & Compliance.
Correzione: rimuovere la riga o registrare solo esito ed eventuale id utente. Se il servizio ha già girato fuori dalla postazione, considerare compromesse le password registrate.

### 6. P1 — Cookie di sessione senza attributi di protezione, OWASP A05/A07
File: src/auth.js:18.
Il cookie è `sid=...; Path=/; Max-Age=...` senza `HttpOnly`, `Secure` né `SameSite`. Il frontend è su un altro sito, quindi serve `SameSite=None; Secure` solo se necessario, altrimenti `Lax`/`Strict`. Senza `SameSite`, con il rilievo 3, il CSRF è praticamente aperto. In più `readJson` (server.js:13) non richiede `content-type: application/json`, e POST, PATCH e logout possono essere innescati da altri siti.
Correzione: `HttpOnly; Secure; SameSite=...`, richiedere il content-type JSON sulle scritture, valutare un token anti-CSRF. Lo stesso per il cookie di logout (server.js:59).

### 7. P2 — Hash delle password debole, OWASP A02
File: src/store.js:4.
SHA-256 senza sale e senza costo: password uguali danno hash uguali e il brute force è veloce. I commenti dicono che è un deposito di prova, ma il codice non lo marca come tale.
Correzione: `scrypt` di `node:crypto` (nessuna dipendenza) con sale casuale e confronto a tempo costante. Le password di prova in store.js:7-8 sono dati sintetici e vanno bene, ma non vanno riusate altrove.

### 8. P2 — Nessun limite ai tentativi di login ed enumerazione degli utenti, OWASP A07
File: src/auth.js:14-15; src/server.js:39.
I messaggi distinguono «Utente inesistente» da «Password errata», quindi si scoprono le email valide. Non c'è limite ai tentativi né blocco temporaneo; il confronto dell'hash (auth.js:15) non è a tempo costante.
Correzione: messaggio unico («Credenziali non valide»), rate limit per IP e per account, confronto con `timingSafeEqual`.

### 9. P2 — Iniezione di formule e CSV non escapato nell'esportazione, OWASP A03
File: src/invoices.js:35.
I campi (`customer`) sono uniti con `;` senza escape: un cliente con `;`, virgolette o a capo rompe il file, e uno che inizia con `=`, `+`, `-`, `@` viene eseguito come formula in Excel quando l'amministrazione lo apre. `customer` è scelto dagli utenti.
Correzione: virgolettare i campi, raddoppiare le virgolette, anteporre `'` ai valori che iniziano con i caratteri di formula.

### 10. P2 — Sessioni: nessuna pulizia né rotazione, OWASP A07
File: src/auth.js:5, 17, 28.
Le sessioni scadute non sono mai rimosse dalla mappa (crescita illimitata, DoS lento) e sono solo in memoria. Non c'è invalidazione delle sessioni quando cambia la password (non esiste ancora la funzione) né un tetto per utente.
Correzione: eliminare la sessione scaduta alla lettura, pulizia periodica, tetto per utente.

### 11. P2 — Chiave amministrativa: debolezze di gestione, OWASP A05/A07
File: src/auth.js:32-36; README.md:6.
- Il controllo è corretto (confronto a tempo costante, rifiuto se vuota), ma la lunghezza è rivelata dal confronto preliminare e non c'è una lunghezza minima.
- Una chiave statica unica, senza rotazione né log degli accessi.
- Nessun limite ai tentativi e nessun rate limit su `/admin/export`.
- L'esportazione contiene tutte le fatture di tutti gli utenti: è un dato personale e finanziario in un solo file.
Correzione: lunghezza minima verificata all'avvio (rifiutare l'avvio senza chiave valida), registrare gli accessi senza la chiave, limitare la rete, valutare un ruolo admin al posto della chiave (il campo `role` di store.js è inutilizzato).

### 12. P3 — Validazione incompleta in creazione, OWASP A03
File: src/invoices.js:13-19.
- `Number(body.amount)` accetta `""`, `null`, `[]`, `"0x10"`, valori negativi o zero e importi enormi o senza limite di decimali.
- `dueDate` ha il formato giusto ma non è verificato come data reale (`2026-99-99`).
Correzione: tipo numerico stretto, intervallo, due decimali; verifica della data.

### 13. P3 — Intestazioni di sicurezza e cache assenti
File: src/server.js:8-10, 80.
Mancano `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` sulle risposte con dati personali e `Content-Disposition` sul PDF; il CSV (server.js:49) non ha `no-store`.
Correzione: aggiungere le intestazioni in `send` e nelle risposte file.

### 14. P3 — Metodi e id: piccole fughe di informazione
File: src/server.js:67-69, 83.
Per un id esistente con metodo non previsto (es. DELETE) la risposta è 405, per un id inesistente 404: si può verificare l'esistenza di un id. Il 405 non invia `Allow`. Gli errori generici nascondono i dettagli (bene), ma ogni errore non previsto restituisce 400 anziché 500 (server.js:89).
Correzione: controllare il metodo prima della ricerca, usare 500 per gli errori interni.

## Cosa è a posto
- Path traversal sul PDF: `basename` più cartella fissa (invoices.js:31); il rischio resta solo via rilievo 2.
- Limite al corpo (64 KB) e gestione degli errori di parsing senza stack trace al client.
- Confronto della chiave admin con `timingSafeEqual`; admin disabilitato se `ADMIN_KEY` è vuota.
- Nessuna dipendenza (superficie di catena di fornitura nulla; nessun lockfile da verificare).
- Segreti: nessuno nel codice, a parte le password di prova sintetiche.

## Limiti e prossimi passi
- Non ho eseguito l'applicazione né test dinamici (nessuna autorizzazione); i rilievi sono da lettura del codice.
- Non ho verificato ambiente di deploy, HTTPS, reverse proxy, né i log reali.
- Ordine di correzione proposto: 5 e 6, poi 1, 2, 3, 4 (tutti piccoli e indipendenti), poi 7-11, infine 12-14. Il rilievo 5 va inoltre valutato dalla Privacy & Compliance.
- Le correzioni vanno all'agente sviluppo (backend) e poi a QA e Code Reviewer; nulla è stato applicato.

— AISA-09 · REGULUS
