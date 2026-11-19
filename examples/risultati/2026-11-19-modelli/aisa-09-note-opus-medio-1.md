AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

# Revisione di sicurezza di api-note

## Cosa ho esaminato
Ho letto tutti i file del progetto: `server.js` (64 righe), `README.md`, `package.json` e `allegati/verbale.txt`. È un server Node con il solo modulo `node:http`, senza dipendenze. Le note restano in memoria. Non c'è `CLAUDE.md`, non ci sono test e la cartella non è un repository git. Non ho modificato nessun file.

Ho anche avviato il server in locale (Node v26.12.1, porta 38917, solo su 127.0.0.1) e l'ho provato con curl e dati sintetici; poi l'ho fermato. I rilievi segnati con **[verificato]** li ho riprodotti in quella prova. Gli altri vengono dalla lettura del codice.

## Da segnalare subito: P0
Un client con il token può leggere qualsiasi file del server raggiungibile dal processo, fuori dalla cartella `allegati/`. È il rilievo 1.

## Rilievi

**1. P0 — Path traversal su `/attachments`, lettura di file arbitrari** [verificato]
- File: `server.js:51`.
- Problema: `join(ATTACHMENTS, url.searchParams.get("name"))` normalizza `../`, quindi il percorso esce da `allegati/`.
- Prova: `GET /attachments?name=../package.json` con il token ha restituito il `package.json` della root.
- Rischio: con `../server.js` si legge anche il token (rilievo 3). Lo stesso vale per `.env`, chiavi SSH e altri file dell'host. In più il rilievo 4 rivela se un file esiste, il che rende i tentativi facili.
- Correzione proposta: risolvere il percorso con `path.resolve`, poi rifiutare con 400 o 404 se non resta dentro `ATTACHMENTS + path.sep`. In alternativa, accettare solo un nome base (`path.basename(name) === name`, senza separatori né `..`) o una lista di file ammessi. Rifiutare anche il nome vuoto e le cartelle.

**2. P1 — `DELETE /notes/:id` senza autenticazione** [verificato]
- File: `server.js:44-47`. Manca il controllo `authorized(req)` che hanno le altre rotte.
- Prova: ho creato una nota, l'ho cancellata senza intestazione `Authorization` (risposta 204), e `GET /notes` ha poi restituito `[]`.
- Gravità: P1 e non P0, perché gli id sono UUID v4 casuali e si ottengono solo da rotte autenticate. Basta però un id finito in log, URL o client per perdere dati senza autenticarsi. È un difetto di controllo degli accessi (OWASP A01).
- Correzione proposta: aggiungere `if (!authorized(req)) return send(res, 401, …)` come prima istruzione del ramo. Meglio ancora: controllare l'autenticazione una volta sola all'inizio di `handle`, nel punto per cui passano tutte le rotte, così una rotta nuova non può dimenticarla.

**3. P1 — Token API scritto nel codice sorgente**
- File: `server.js:7`. Il valore non lo riporto qui.
- Rischio: chi ha il sorgente ha il token (repository, backup, condivisioni), e lo ottiene anche chi sfrutta il rilievo 1. Inoltre è un solo token condiviso: non distingue gli utenti, non si può revocare per singolo utente e non si ruota senza un rilascio.
- Correzione proposta: leggerlo da una variabile d'ambiente (es. `process.env.API_TOKEN`) e non avviare il server se manca. Il token attuale va considerato compromesso e ruotato. Più avanti, valutare token per utente.

**4. P2 — Lo stack trace arriva al client** [verificato]
- File: `server.js:60-62` (`res.end(err.stack)`).
- Prova:
  - un body non JSON ha restituito `SyntaxError` con il percorso assoluto di `server.js`;
  - un file inesistente ha restituito `ENOENT` con il percorso assoluto sul server.
- Rischio: si espongono la struttura del filesystem e i dettagli interni, e si capisce se un file esiste, il che aiuta il rilievo 1 (OWASP A05).
- Correzione proposta: rispondere con un messaggio generico (`{ "error": "internal error" }`) e registrare lo stack solo nei log del server. Gestire a parte JSON non valido (400) e file inesistente (404).

**5. P2 — Manca la validazione dell'input su `POST /notes`** [verificato]
- File: `server.js:21-25` e `server.js:38-39`.
- Prova:
  - `{"title":{"a":1},"text":123}` viene salvato così com'è;
  - un body `null` fa fallire la destrutturazione e restituisce 500 con stack;
  - `title` e `text` mancanti vengono salvati come assenti.
- Correzione proposta: controllare che il body sia un oggetto e che `title` e `text` siano stringhe non vuote con una lunghezza massima. Rispondere 400 se non lo sono, e 400 anche per JSON non valido.

**6. P2 — Nessun limite di dimensione né di quantità (DoS sulla memoria)**
- File: `server.js:21-24` (il body si accumula senza limite) e `server.js:10`/`40` (la `Map` non ha un tetto).
- Rischio: chi ha il token può esaurire la memoria con un body enorme o con molte note. Il rischio è limitato perché serve il token, che però è condiviso (rilievo 3).
- Correzione proposta: fermare la lettura oltre una soglia, ad esempio 100 KB, con risposta 413. Mettere un tetto al numero di note. Considerare un rate limit.

**7. P2 — HTTP in chiaro, in ascolto su tutte le interfacce**
- File: `server.js:64`. `listen(PORT)` senza host accetta connessioni da tutte le interfacce, e il server è HTTP puro.
- Rischio: fuori da localhost il bearer token viaggia in chiaro.
- Correzione proposta: collegare il server a `127.0.0.1` se è solo locale, oppure metterlo dietro un reverse proxy con TLS. Va chiarito con l'utente dove gira il servizio.

**8. P3 — Confronto del token non a tempo costante**
- File: `server.js:18`. Il `===` permette in teoria un attacco a tempo, difficile da sfruttare in rete.
- Correzione proposta: `crypto.timingSafeEqual` su buffer della stessa lunghezza.

**9. P3 — Header di sicurezza mancanti sugli allegati**
- File: `server.js:52`.
- Correzione proposta: aggiungere `X-Content-Type-Options: nosniff` e `Content-Disposition: attachment`, così il browser non interpreta il file scaricato.

**10. P3 — Risposta 204 con body**
- File: `server.js:46`. `send(res, 204, {})` scrive `{}` in una risposta che per HTTP non ha body. È un problema di correttezza, non di sicurezza.
- Correzione proposta: `res.writeHead(204); res.end()`.

## Cosa ho provato
Tutto con dati sintetici, in locale:
- path traversal: riuscito;
- DELETE senza token: riuscito;
- body non JSON, `null` e con tipi errati: stack restituito al client, tipi errati salvati;
- allegato inesistente: percorso assoluto restituito al client.

Non ho fatto prove di carico (rilievo 6) né di temporizzazione (rilievo 8). Il progetto non ha test automatici.

## Limiti e cose aperte
- Non so dove gira il servizio né chi lo usa: il peso dei rilievi 3, 6 e 7 dipende da questo.
- Le note e gli allegati possono contenere dati personali del team. I rilievi 1 e 2 vanno quindi fatti valutare anche alla Privacy & Compliance Agency.
- Le note vivono solo in memoria e si perdono al riavvio: è un limite di funzionamento, non di sicurezza.
- Ordine di correzione proposto: 1, 2 e 3 (con rotazione del token), poi 4 e 5, poi 6 e 7, infine 8–10. Ogni correzione va confermata dall'utente e accompagnata da test che riproducano le prove fatte sopra.

— AISA-09 · REGULUS