AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

# Revisione di sicurezza di api-note

**Cosa ho esaminato.** Ho letto `README.md`, `package.json` e `server.js`, che è l'unico file di codice. Non ci sono `CLAUDE.md`, documenti di convenzioni né un repository Git. Lo stack è Node senza dipendenze, con server HTTP di `node:http` e note tenute solo in memoria. Non ho aperto il contenuto di `allegati/verbale.txt`: per la revisione non serviva e potrebbe contenere dati di persone.

**Prove eseguite.** Ho avviato il server in locale (`PORT=39517 node server.js`, Node v26.12.1) e l'ho provato con `curl` usando dati inventati. Poi l'ho fermato. Non ho modificato nessun file.

## Rilievi

### 1. P0 — Si possono scaricare file fuori da `allegati/` (path traversal)
- **Dove:** `server.js:51`
- **Problema:** il valore di `name` passa a `join(ATTACHMENTS, …)` senza controlli, e `join` interpreta i `../`. Chi ha il token può leggere qualunque file che il processo può aprire: codice sorgente, `.env`, chiavi, file di sistema.
- **Prova:** `GET /attachments?name=../package.json` ha restituito il contenuto di `package.json`.
- **Peso:** il rischio aumenta perché il token è scritto nel codice (rilievo 3).
- **Correzione proposta:**
  - calcolare il percorso con `resolve(ATTACHMENTS, name)` e rifiutare con 400 o 404 ogni percorso che non inizia con `ATTACHMENTS + sep`;
  - in alternativa, accettare solo `basename(name)` oppure i file di una lista ammessa;
  - rifiutare i nomi vuoti.

### 2. P1 — `DELETE /notes/:id` funziona senza autenticazione
- **Dove:** `server.js:44-47`. Manca il controllo `authorized(req)` che hanno le altre rotte.
- **Prova:** una `DELETE` senza intestazione `Authorization` ha risposto 204 e la nota è sparita.
- **Perché P1 e non P0:** gli id sono UUID casuali, quindi chi attacca deve prima conoscerne uno. Resta comunque un controllo di accesso mancante, e gli id possono circolare (log, client, URL).
- **Correzione proposta:** aggiungere `if (!authorized(req)) return send(res, 401, …)` come prima istruzione del ramo. Meglio ancora, controllare l'autenticazione una volta sola all'inizio di `handle`, così una rotta nuova non può dimenticarla.

### 3. P1 — Token API scritto nel codice
- **Dove:** `server.js:7` (`API_TOKEN = "note-api-…"`)
- **Problema:** il segreto sta nel sorgente. Chiunque veda il codice ha accesso completo, e il rilievo 1 permette anche di leggere `server.js` stesso. Per cambiarlo bisogna modificare il codice.
- **Correzione proposta:**
  - leggere il token da `process.env.API_TOKEN` e non avviare il server se manca;
  - considerare compromesso il token attuale e sostituirlo;
  - se il codice è già stato condiviso o versionato altrove, toglierlo anche dalla cronologia.

### 4. P2 — Gli errori 500 mostrano lo stack trace al client
- **Dove:** `server.js:60-63`, in particolare `res.end(err.stack)`
- **Problema:** il client vede percorsi assoluti del server e dettagli interni.
- **Prova:** un corpo non JSON sulla `POST` ha restituito lo stack di `JSON.parse`. Un allegato inesistente ha restituito il percorso assoluto completo (`ENOENT … open '/private/tmp/…/allegati/nonesiste'`).
- **Correzione proposta:**
  - rispondere con un messaggio generico (`{ "error": "internal error" }`) e scrivere lo stack solo nel log del server;
  - restituire 400 per un JSON non valido e 404 per `ENOENT`.

### 5. P2 — L'input della `POST /notes` non viene controllato
- **Dove:** `server.js:21-25` e `server.js:38-39`
- **Problemi:**
  - `readBody` accumula il corpo senza limite di dimensione, quindi una richiesta enorme può esaurire la memoria;
  - non si controlla `content-type`;
  - `title` e `text` non vengono validati.
- **Prova:** `{"title":{"a":1},"text":[1,2]}` è stato salvato così com'era.
- **Conseguenze:** non c'è limite al numero di note, che restano in memoria: è un altro modo di saturarla. Inoltre i client che mostrano le note senza fare escaping rischiano XSS.
- **Correzione proposta:**
  - mettere un tetto al corpo (ad esempio 100 KB; oltre si risponde 413);
  - accettare solo stringhe, non vuote e di lunghezza massima definita, rispondendo 400 altrimenti;
  - fissare un limite al numero di note.

### 6. P2 — Il token viaggia in chiaro
- **Dove:** `server.js:59-64`. Il server usa HTTP semplice e ascolta su tutte le interfacce.
- **Problema:** se l'API viene usata fuori da `localhost`, il token Bearer passa sulla rete senza cifratura.
- **Correzione proposta:**
  - esporre il servizio solo dietro TLS, ad esempio con un reverse proxy;
  - oppure fare `listen(PORT, "127.0.0.1")` se l'uso è solo locale.

### 7. P3 — Il token si confronta in tempo non costante
- **Dove:** `server.js:18`
- **Problema:** il confronto con `===` può in teoria rivelare il token attraverso i tempi di risposta. In pratica il rischio è basso.
- **Correzione proposta:** usare `crypto.timingSafeEqual` su buffer di uguale lunghezza.

### 8. P3 — Mancano limiti ai tentativi e intestazioni di sicurezza
- **Dove:** `server.js` in generale
- **Problemi:**
  - non c'è limite ai tentativi sul token;
  - mancano `X-Content-Type-Options: nosniff` e `Content-Disposition: attachment` sul download (`server.js:52`);
  - un unico token condiviso dà a tutti gli stessi permessi, senza utenti né ruoli. Va bene solo se è una scelta voluta per un team piccolo.
- **Correzione proposta:** aggiungere le due intestazioni e un limite di base ai tentativi falliti.

### Fuori dall'ambito della sicurezza
- `server.js:46` invia un corpo `{}` con lo stato 204, che per definizione non ne ha.
- Le note si perdono a ogni riavvio, perché stanno solo in memoria.

## Riepilogo
- **Sintesi:** ci sono due problemi gravi da correggere prima di esporre l'API. Il primo è la lettura di file arbitrari (rilievo 1, P0). Il secondo è la cancellazione delle note senza autenticazione (rilievo 2, P1). A questi si aggiunge il token scritto nel codice (rilievo 3, P1).
- **File modificati:** nessuno.
- **Test eseguiti:** le prove manuali con `curl` sul server avviato in locale, descritte nei rilievi 1, 2, 4 e 5. Il progetto non ha test automatici.
- **Limiti:**
  - non ho fatto analisi delle dipendenze, perché non ce ne sono;
  - non ho provato TLS né il comportamento dietro un proxy;
  - i rilievi 6, 7 e 8 vengono dalla sola lettura del codice e non li ho verificati con prove.
- **Prossimi passi da confermare:**
  1. correggere i rilievi 1, 2 e 3 e sostituire il token;
  2. correggere i rilievi 4 e 5;
  3. aggiungere test automatici per il path traversal, l'autenticazione su ogni rotta e la validazione dell'input;
  4. far rivedere il diff a un Code Reviewer.

— REGULUS (AISA-09)