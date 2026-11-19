AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

# Revisione di sicurezza: api-note

Perimetro: `server.js` (64 righe), `README.md`, `package.json`, `allegati/verbale.txt`. Nessuna dipendenza. Il progetto non ha repository Git né test. Analisi solo statica: non ho avviato il server né eseguito test, quindi i rilievi sono dedotti dal codice. Nessun file è stato modificato.

## Rilievi

**1. P0 — Path traversal nel download degli allegati** (`server.js`, riga 51)
`join(ATTACHMENTS, url.searchParams.get("name") ?? "")` non verifica che il percorso resti dentro `allegati/`. `searchParams` decodifica l'input, quindi `GET /attachments?name=../server.js` (o `../../../../etc/passwd`) restituisce qualsiasi file leggibile dal processo. Così si legge anche `server.js`, che contiene il token (rilievo 2). Il confine non è difeso da altro: l'autenticazione richiede solo il token condiviso.
Correzione proposta: risolvere il percorso con `resolve` e verificare che inizi con `ATTACHMENTS + sep`. In alternativa accettare solo nomi da una lista, o rifiutare ogni nome con `/`, `\` o `..` usando `basename`. Considerare i symlink (`realpath`).

**2. P1 — Token API scritto nel codice** (`server.js`, riga 7)
Il token è una stringa fissa nel sorgente, quindi finisce nel repository e in ogni copia del codice. Non si può ruotare senza un nuovo deploy, ed è lo stesso per tutti gli utenti. Va considerato compromesso se il codice è già stato condiviso.
Correzione proposta: leggerlo da una variabile d'ambiente (es. `process.env.API_TOKEN`), con avvio che fallisce se manca; ruotare il token attuale; token distinti per utente o servizio se serve tracciare chi fa cosa.

**3. P1 — DELETE senza autenticazione** (`server.js`, righe 44-47)
Il ramo `DELETE /notes/:id` non chiama `authorized(req)`, a differenza degli altri tre. Chiunque raggiunga il server può cancellare note conoscendo l'id. Gli id sono UUID e non si indovinano, ma `GET /notes` li elenca a chi ha il token, e il controllo manca comunque.
Correzione proposta: controllare l'autorizzazione una sola volta all'inizio di `handle` per tutte le rotte (le rotte nuove non potranno dimenticarla).

**4. P2 — Stack trace restituito al client** (`server.js`, righe 60-63)
Ogni errore non gestito risponde 500 con `err.stack`, che rivela percorsi del file system e struttura del codice. Si provoca con il token: JSON non valido su `POST /notes`, oppure `GET /attachments` senza `name` o con un file inesistente (l'errore include il percorso). Utile a chi sfrutta il rilievo 1.
Correzione proposta: rispondere `{ "error": "internal error" }` e registrare l'errore solo nei log del server; mappare `ENOENT` a 404 e JSON non valido a 400.

**5. P2 — Corpo della richiesta senza limite di dimensione** (`server.js`, righe 21-25)
`readBody` accumula tutto il corpo in memoria, senza tetto. Un client con il token può esaurire la memoria del processo. Le note vivono in una `Map` senza limiti (riga 10), quindi anche molte richieste lecite fanno crescere la memoria senza fine.
Correzione proposta: interrompere la lettura oltre una soglia (es. 100 KB, risposta 413) e porre un tetto al numero o alla dimensione totale delle note.

**6. P2 — Nessuna validazione dell'input di `POST /notes`** (`server.js`, righe 38-39)
`title` e `text` sono usati senza controllare tipo o lunghezza: possono mancare, essere oggetti o stringhe enormi. Se il corpo è `null` la destrutturazione solleva un errore (500 con stack, rilievo 4).
Correzione proposta: controllare che siano stringhe non vuote entro un limite di lunghezza, altrimenti 400.

**7. P2 — Nessuna protezione dai tentativi ripetuti sul token e trasporto in chiaro** (`server.js`, righe 17-19 e 59-64)
Non c'è limite ai tentativi falliti, il server ascolta su HTTP semplice e su tutte le interfacce (nessun host nel `listen`). Il token passa in chiaro se non c'è un proxy TLS davanti; il README non dice nulla in proposito.
Correzione proposta: pubblicare solo dietro un proxy HTTPS, limitare le richieste per IP, documentarlo nel README.

**8. P3 — Confronto del token non a tempo costante** (`server.js`, riga 18)
`===` può in teoria rivelare il token con misure di tempo. Rischio basso in rete reale.
Correzione proposta: `timingSafeEqual` su buffer di uguale lunghezza (o confronto degli hash).

**9. P3 — Dettagli minori**
- Riga 46: `send(res, 204, {})` invia un corpo con un 204, che non deve averne; usare `res.writeHead(204).end()`.
- Riga 52: nessuna intestazione `X-Content-Type-Options: nosniff` né `content-disposition` sugli allegati; poco rilevante con `application/octet-stream`.
- Nessun log delle richieste o degli accessi falliti, quindi un abuso non verrebbe notato.
- Le note sono condivise da tutti i titolari del token, senza proprietà per utente: coerente con «piccolo team», ma da confermare come requisito.

## Cosa risulta a posto
Nessuna dipendenza esterna da aggiornare. Gli id delle note sono UUID casuali (`randomUUID`). Nessuna query a database né esecuzione di comandi, quindi nessun rischio di injection SQL o di shell. `GET /notes` e `POST /notes` controllano il token.

## Test eseguiti
Nessuno. Revisione solo statica del codice; non ho avviato il server né provato gli exploit descritti.

## Rischi, limiti e attività residue
- Se il token attuale è uscito dalla macchina, va ruotato dopo la correzione del rilievo 2.
- I rilievi 1, 2 e 3 vanno corretti prima di esporre l'API a una rete non fidata; dopo le correzioni servono test di regressione (nome con `..`, DELETE senza token, JSON non valido) e un controllo del diff da parte del Code Reviewer.
- Non conosco ambiente di deploy, proxy o autenticazione davanti all'API: il rilievo 7 dipende da quello.
- Non ho applicato correzioni: restano proposte da confermare con l'utente.

— AISA-09 · REGULUS
