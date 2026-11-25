AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

Rapporto di revisione di sicurezza: api-fatture (Node 22, senza dipendenze)

Perimetro: ho letto README.md, package.json e src/server.js, auth.js, invoices.js, store.js in sola lettura. Non ho eseguito codice né test. Non ho trovato CLAUDE.md né una cartella Git nella copia, quindi non ho verificato lo stato Git. Framework di riferimento: OWASP Top 10 e ASVS. La scheda della biblioteca (mcp-2026-07-28) non riguarda questo codice e non l'ho usata. Non ho trovato segreti reali: ci sono solo password di prova in store.js, che il README dichiara come utenti di prova.

Esito: 2 rilievi P1, 5 rilievi P2, 4 rilievi P3. Nessun P0.

P1

1. Autorizzazione mancante sul PATCH (BOLA/IDOR e mass assignment): src/invoices.js:22-26 e src/server.js:67-74.
   - `update` controlla il proprietario, ma `Object.assign(invoice, body)` copia nella fattura qualsiasi campo del body.
   - Un utente può quindi impostare `ownerId`, `status`, `id` e `pdf` sulle proprie bozze.
   - Con `ownerId` cambiato può cedere la bozza a un altro utente.
   - Con `status` può aggirare il blocco "solo le bozze si modificano".
   - Con `pdf` può far puntare la fattura a un altro file in `documenti/`, perché `basename` limita solo la cartella. Oggi c'è solo `esempio.pdf`, ma è un vettore verso qualsiasi PDF futuro.
   - Il body non è validato con la stessa logica di `create`: importi, scadenze e cliente non vengono controllati.
   - Correzione proposta: lista consentita di campi (customer, amount, dueDate) con le stesse validazioni di `create`.

2. Gestione debole delle credenziali e delle sessioni (A02/A07, ASVS V2/V3): src/store.js:4, src/auth.js:8-10 e 18.
   - Le password sono hashate con SHA-256 semplice, senza sale né costo. Le password di prova sono hardcoded nel repository. Se la memoria o i dati trapelano, gli hash si rompono con attacchi a dizionario o rainbow table. Serve scrypt, argon2 o bcrypt con sale (in Node, `crypto.scrypt`).
   - Il token di sessione usa `Math.random()` più `Date.now()`, che non è crittograficamente sicuro ed è prevedibile. Serve `crypto.randomBytes(32)` o `randomUUID`.
   - Il cookie `sid` è senza `HttpOnly`, `Secure` e `SameSite` (auth.js:18). Con CORS con credenziali aperte (vedi P2-3) l'esposizione a XSS e CSRF aumenta.
   - Segnalo P1 per la combinazione di questi punti. Sono rilievi su un modello più piccolo: propongo il riesame del direttore AISA-01 o di un revisore su Opus prima che diventino definitivi.

P2

3. CORS troppo permissivo (A05): src/server.js:24-31. L'header `Access-Control-Allow-Origin` riflette qualsiasi `Origin` e abbina `Allow-Credentials: true`. Qualsiasi sito può quindi chiamare l'API con la sessione dell'utente e leggere le risposte. Il README indica l'unico frontend, `https://app.studio.example`: serve una lista consentita (allowlist) con quell'origine. Manca anche `Vary: Origin`. Nel preflight la lista dei metodi consentiti e le intestazioni non sono coerenti con le risposte.

4. Log di credenziali in chiaro (A09, ASVS V7): src/server.js:41. `console.log("login", JSON.stringify(body))` scrive email e password di ogni tentativo nei log. Va rimosso, o va registrato al massimo l'esito senza la password.

5. Enumerazione degli utenti e assenza di limite ai tentativi: src/auth.js:14-15 e src/server.js:39-45. I messaggi "Utente inesistente" e "Password errata" distinguono i due casi. Non c'è rate limiting né blocco sui tentativi, quindi si può fare brute force o credential stuffing. Serve un messaggio unico per entrambi i casi e un limite ai tentativi per IP e per account. Il confronto dell'hash non è a tempo costante (`!==`, auth.js:15), ma conta meno una volta introdotto un hash con sale.

6. Chiave admin come unico controllo, senza traccia: src/auth.js:32-36 e src/server.js:47-51.
   - `isAdmin` confronta la chiave con `timingSafeEqual`, ed è corretto. Il controllo di lunghezza prima del confronto rivela la lunghezza della chiave (rischio basso).
   - La chiave è una sola, condivisa, senza rotazione né registro degli accessi. Chi la conosce esporta le fatture di tutti gli utenti, in un'unica richiesta.
   - Il campo `role` esiste negli utenti ma non viene usato. Conviene un ruolo admin legato a una sessione, con log degli accessi.
   - L'export CSV non neutralizza le celle che iniziano con `=`, `+`, `-` o `@`. Il campo `customer` è scritto dall'utente, quindi è possibile una CSV/formula injection quando il file si apre in un foglio di calcolo. Il separatore `;` non è escapato, quindi un `customer` con `;` o un a capo rompe le colonne (src/invoices.js:35).

7. Nessuna intestazione di sicurezza né controllo su Content-Type: src/server.js. Mancano `X-Content-Type-Options`, `Cache-Control: no-store` sulle risposte con dati personali, e HSTS (da mettere dietro HTTPS, che il codice non gestisce). `readJson` non verifica il `content-type`, e con il cookie senza `SameSite` questo apre al CSRF dai form (POST con corpo JSON da un form di testo).

P3

8. Il dettaglio e il PDF controllano il proprietario in modo incoerente: src/server.js:71 (`GET /invoices/:id`). Il dettaglio restituisce la fattura senza controllare `ownerId`, mentre PATCH e PDF lo controllano. Questo è un IDOR in lettura: qualsiasi utente autenticato legge qualsiasi fattura di cui conosce l'id (src/server.js:71, via `invoices.get`). Gli id sono UUID e quindi poco indovinabili, ma finiscono in log, link, referrer e nel CSV. Lo dichiaro P3 per la difficoltà di indovinarli, ma lo vedo come difetto di autorizzazione vero e proprio: se il direttore lo ritiene, va alzato a P1. Correzione proposta: controllo del proprietario nel punto comune a tutti i metodi, subito dopo il `match`.

9. Percorso del PDF: src/invoices.js:29-32. `basename` impedisce il path traversal, e oggi il valore non è controllabile dall'utente a meno di sfruttare il rilievo 1. Se il rilievo 1 viene corretto, il rischio resta basso. Resta da gestire l'errore se il file manca: `readFile` lancia ENOENT, che arriva al gestore finale e risponde 400 invece di 404 (src/server.js:86-90).

10. Validazione e gestione degli errori: src/invoices.js:13-19 e src/server.js:86-90.
   - `Number(body.amount)` accetta stringhe vuote (→ 0), importi negativi e valori enormi. La scadenza controlla solo il formato, non una data reale (accetta `2026-99-99`).
   - Un JSON non valido restituisce 400 (corretto), ma gli errori interni restituiscono anch'essi 400 e non 500.
   - `console.error(error)` registra lo stack completo.
   - Il body JSON `null` o un array farebbe fallire `body.customer` in modo non gestito (errore → 400).

11. Sessioni in memoria e senza pulizia: src/auth.js:5. La mappa delle sessioni non elimina quelle scadute (cresce senza limite, rischio di esaurimento memoria), non ruota il token al login e non invalida le sessioni al cambio della password. Il README dice che è un esempio: in produzione serve un archivio vero. Inoltre `new URL(req.url, ...)` con un `req.url` malformato lancia un errore che finisce in 400.

Punti positivi: limite di 64 KB sul body (server.js:6, 18), `timingSafeEqual` per la chiave admin, `basename` sul PDF, controllo del proprietario su PATCH e PDF, validazione di `create`, nessuna dipendenza esterna, nessun segreto reale nel codice.

Limiti e domande aperte
- Non ho eseguito l'applicazione né test attivi: tutti i rilievi vengono dalla lettura del codice.
- Il rilievo 8 (lettura del dettaglio senza controllo del proprietario) va confermato con l'utente sulla gravità voluta.
- Non so se ci sia un reverse proxy davanti all'API (per HTTPS, HSTS e rate limiting): cambia dove vanno messe alcune correzioni.
- Non ho corretto nulla, come richiesto. Le correzioni proposte sono da confermare con l'utente.

Firmato: AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)
