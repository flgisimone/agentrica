AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

# Revisione di sicurezza di api-note

Perimetro: `server.js` (64 righe), `README.md`, `package.json`. Il progetto non è un repository Git (nessuno stato da leggere) e non ha test, CI, lockfile né dipendenze. Ho fatto solo lettura statica e nessuna modifica. Non ho avviato il server e non ho eseguito test. Non ho aperto `allegati/verbale.txt` (non serve alla revisione e potrebbe contenere dati reali). Riferimenti: OWASP Top 10 e ASVS.

## Rilievi

### 1. P0: token API statico scritto nel codice sorgente (`server.js:7`)
- `API_TOKEN` è una stringa costante (inizia con `note-api-7f3a…`, qui la riporto mascherata). Chiunque abbia accesso al sorgente o a un commit futuro ha accesso completo alle API.
- Il token è unico e condiviso: non si può revocare per singola persona e non lo si può ruotare senza una nuova versione del codice.
- Il token va considerato già compromesso. Il progetto non è ancora in Git, ma al primo commit finirebbe nello storico.
- Correzione proposta: leggerlo da una variabile d'ambiente (`process.env.API_TOKEN`) e far fallire l'avvio se manca. Ruotare il valore attuale. Se il team cresce, passare a credenziali per utente.
- OWASP A02 e A07, ASVS V2.10 e V6.4.

### 2. P0: path traversal nel download degli allegati (`server.js:51`)
- `join(ATTACHMENTS, url.searchParams.get("name"))` normalizza i segmenti `..`. Una richiesta come `GET /attachments?name=../server.js` esce da `allegati/` e legge qualunque file leggibile dal processo, per esempio `../../../../etc/passwd`, `.env` o chiavi SSH.
- Insieme al rilievo 1, il token compromesso rende la lettura arbitraria di file sfruttabile da remoto.
- Correzione proposta: risolvere il percorso con `resolve` e verificare che inizi con `ATTACHMENTS + sep`. In alternativa usare `basename(name)` o una lista consentita di nomi. Rifiutare con 400 o 404 e usare un solo errore per non esistente e non consentito.
- Da aggiungere un test con `..%2f`, `../` e percorsi assoluti.
- OWASP A01, CWE-22, ASVS V12.3.

### 3. P1: DELETE `/notes/:id` senza autenticazione (`server.js:44-47`)
- Gli altri tre endpoint controllano `authorized(req)`, la cancellazione no. Chiunque possa raggiungere il server può cancellare note (ma deve conoscere l'UUID).
- Correzione proposta: spostare il controllo di autenticazione in un unico punto, prima del routing, con rifiuto di default. Così un endpoint nuovo non può dimenticarlo.
- OWASP A01 e A07, ASVS V4.1.

### 4. P1: nessuna autorizzazione per oggetto né per utente (`server.js:10, 33`)
- Tutte le note stanno in un'unica `Map` e `GET /notes` le restituisce tutte a chiunque abbia il token. Non esistono proprietari, ruoli o separazione fra utenti.
- Può essere accettabile per un team piccolo con un ruolo solo, ma va deciso e scritto. Se ogni persona deve vedere solo le proprie note è un difetto di progetto (IDOR). Serve la conferma dell'utente sul requisito.
- Se le note contengono dati personali si applicano privacy by design e la valutazione con l'agenzia Privacy & Compliance.
- OWASP A01, ASVS V4.2.

### 5. P1: errori interni con stack trace restituiti al client (`server.js:59-63`)
- Il gestore degli errori risponde 500 con `err.stack`. Espone percorsi del file system, versione di Node e struttura del codice.
- È facile da provocare: un JSON non valido nel POST (`server.js:24`) o un allegato inesistente (`server.js:51`, errore `ENOENT` con il percorso assoluto) generano la risposta. Con il rilievo 2 diventa anche un oracolo sull'esistenza dei file.
- Correzione proposta: registrare l'errore sul server e rispondere con `{ "error": "internal" }`. Usare 400 per JSON non valido e 404 per file non trovato.
- OWASP A05 e A09, ASVS V7.4.

### 6. P2: nessuna validazione dell'input e nessun limite alla dimensione del corpo (`server.js:21-25, 38-39`)
- `readBody` accumula in memoria senza limite, quindi un corpo molto grande esaurisce la memoria (DoS). Non c'è timeout sulla richiesta.
- `title` e `text` non sono controllati su tipo, presenza o lunghezza. Valori mancanti vengono salvati come `undefined`, oggetti annidati arbitrari come stringa.
- Il corpo viene concatenato come stringa chunk per chunk (`data += chunk`): un carattere multibyte spezzato fra due chunk può corrompersi. Meglio raccogliere i `Buffer`.
- `Map` senza tetto: si possono creare note all'infinito.
- Correzione proposta: limite del corpo (per esempio 64 KB, con 413 oltre), controllo su `content-type`, validazione dei campi (stringhe non vuote, lunghezza massima), tetto al numero di note e `server.requestTimeout`.
- OWASP A04 e A03, ASVS V5.1.

### 7. P2: confronto del token non a tempo costante e nessun limite ai tentativi (`server.js:17-19`)
- `===` fra stringhe è teoricamente soggetto a timing attack e non c'è rate limiting né blocco sui 401 ripetuti, quindi il token si può provare a forza bruta.
- Correzione proposta: `crypto.timingSafeEqual` sugli hash dei due valori, limite di richieste per IP e log dei rifiuti.
- OWASP A07, ASVS V2.2.

### 8. P2: nessun TLS, nessuna intestazione di sicurezza, il server ascolta su tutte le interfacce (`server.js:64`)
- Il token viaggia in chiaro su HTTP, e `listen(PORT)` si apre su tutte le interfacce. Servono un reverse proxy con TLS o `listen(PORT, "127.0.0.1")` se l'uso è solo locale.
- Gli allegati sono serviti come `application/octet-stream` senza `X-Content-Type-Options: nosniff` né `Content-Disposition`, e le risposte JSON non hanno altre intestazioni di sicurezza.
- OWASP A02 e A05, ASVS V9 e V14.4.

### 9. P3: logging assente e piccole incoerenze (`server.js:46, 59-64`)
- Nessun log di accessi, autenticazioni fallite, cancellazioni e accessi agli allegati. Senza traccia non ci si accorge di un abuso (A09). Evitare di registrare il token o il testo delle note.
- Il DELETE risponde 204 ma chiama `send` con un corpo `{}`. Su 204 il corpo non è ammesso. Rispondere con `res.writeHead(204).end()`.
- Il metodo non consentito su una risorsa nota (per esempio PUT su `/notes`) restituisce 404 anziché 405.
- Le note sono solo in memoria: si perdono al riavvio. Non è un rilievo di sicurezza, ma è un limite di disponibilità da dichiarare nel README.

### 10. P3: assenza di verifica delle dipendenze e della catena di build
- Nessuna dipendenza, quindi nessuna vulnerabilità nota di terze parti. Manca però un lockfile, una versione di Node fissata (`engines` dice `>=22`) e un controllo automatico. È sufficiente quando verranno aggiunte dipendenze.

## Riepilogo per priorità
- P0: 2 (token nel codice, path traversal)
- P1: 3 (DELETE senza autenticazione, nessuna autorizzazione per utente, stack trace nelle risposte)
- P2: 3 (input e limiti, confronto del token e brute force, TLS e intestazioni)
- P3: 2 (log e incoerenze, dipendenze)

## Segnalazione immediata
I rilievi 1 e 2 sono P0 e combinati permettono la lettura di file arbitrari dal server. Non esporre il servizio in rete prima di correggerli.

## Correzioni da proporre (nessuna applicata, serve il tuo ok)
Ordine suggerito: (1) token da ambiente e rotazione, (2) controllo del percorso degli allegati, (3) autenticazione in un solo punto prima del routing, (4) errori generici con log lato server, (5) limite e validazione del corpo. Aggiungere un test per ciascuna correzione, a partire dal path traversal.

## Test e limiti
- Test eseguiti: nessuno (revisione statica, il server non è stato avviato; i comportamenti descritti derivano dalla lettura del codice e vanno confermati con un test).
- Non verificato: contenuto di `allegati/verbale.txt`, configurazione di hosting o proxy, eventuali dati personali nelle note.
- Decisioni che spettano a te: modello di autorizzazione (rilievo 4), dove sarà ospitato il servizio (rilievo 8), come ruotare il token.

— AISA-09 · REGULUS
