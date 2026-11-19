# Revisione di sicurezza · api-note

AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

Progetto esaminato: `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/9246e669-5e3d-40d5-8d76-e41f06314a00/scratchpad/runs/aisa-09-api-note-haiku-2`

## Sintesi

API REST in Node (senza dipendenze) per le note di un piccolo team: un unico file `server.js` (64 righe), note in memoria, un solo token condiviso scritto nel codice. Ho trovato un problema P0, due P1, cinque P2 e alcuni P3. Il P0 va segnalato subito: la cancellazione delle note non richiede alcuna autenticazione.

Nel progetto non ci sono né git né test, né `.gitignore`. Non ho modificato nessun file del progetto. Ho avviato il server in locale su una porta di prova (3917), ho inviato le richieste con curl e poi l'ho fermato; il server tiene tutto in memoria e non scrive su disco.

## Rilievi

### P0 — Cancellazione di note senza autenticazione
File `server.js`, righe 44-47 (`DELETE /notes/:id`).
Il ramo di `DELETE` non chiama `authorized(req)`, a differenza di GET e POST. Chiunque raggiunga il server può cancellare qualunque nota conoscendone l'id. Il controllo manca solo su questo metodo.

Verifica eseguita: `DELETE /notes/<id>` senza header `Authorization` restituisce `204`; la nota risulta cancellata alla lettura successiva con il token.

Correzione proposta (non applicata): aggiungere `if (!authorized(req)) return send(res, 401, { error: "unauthorized" });` all'inizio del ramo, con test che verifichi il 401 senza token.

### P1 — Lettura di file arbitrari con path traversal sugli allegati
File `server.js`, riga 51 (`GET /attachments`).
Il nome del file arriva dalla query (`name`) e viene unito a `allegati/` con `join` senza verifiche. `join` risolve i segmenti `..`, quindi `name=../server.js` esce dalla cartella. Il controllo sul token avviene prima, quindi l'attacco richiede un token valido: con il token scritto nel codice (vedi P1 successivo), il limite è di fatto assente.

Verifica eseguita: con token, `GET /attachments?name=../server.js` restituisce il sorgente del server. Senza token risponde `401`. Con `name` vuoto risponde `500` con lo stack (EISDIR) e il percorso assoluto della cartella (vedi P2 sugli errori).

Correzione proposta: risolvere il percorso con `path.resolve(ATTACHMENTS, name)` e rifiutare se non inizia con `ATTACHMENTS + path.sep`; oppure usare `path.basename` e accettare solo nomi presenti nell'elenco della cartella. Aggiungere test con `../` e con nomi vuoti.

### P1 — Token fisso nel codice sorgente
File `server.js`, riga 7: `const API_TOKEN = "note-api-7f3a9c2e41b8d605";`.
Il segreto è nel codice, quindi finisce in ogni copia del repository, nella cronologia e in ogni persona che legge il file. Non ci sono variabili d'ambiente, rotazione o meccanismo di revoca.

Valutazione: P1. Diventa P0 se il repository è pubblico o condiviso con persone esterne al team, perché il token dà accesso completo a lettura, creazione e cancellazione delle note. Il token va considerato compromesso e sostituito.

Correzione proposta: leggere il token da una variabile d'ambiente (`process.env.API_TOKEN`), terminare l'avvio se manca, rimuovere il valore dal codice e ruotare il token. Lo scostamento va deciso con l'utente (CONVENTIONS e regole del reparto: nessuna modifica senza conferma).

### P2 — Stack trace e percorsi interni nelle risposte di errore
File `server.js`, righe 59-63: il gestore degli errori scrive `err.stack` nella risposta con status 500.
Verifica eseguita: JSON non valido, body `null` e nome vuoto restituiscono stack completi con percorsi assoluti della macchina (`file:///…/server.js:24:15`). Questo espone struttura e percorsi del server.

Correzione proposta: registrare lo stack sul log del server e restituire al client `{ "error": "internal" }` oppure `400` per il JSON non valido.

### P2 — Input non validato e body senza limite
File `server.js`, righe 21-25 e 36-41.
- `readBody` accumula il body in una stringa senza limite di dimensione: una richiesta molto grande consuma memoria del processo (denial of service).
- `POST /notes` accetta qualunque valore per `title` e `text`, anche assenti: verifica eseguita con `{}`, che crea una nota senza titolo né testo.
- Un body `null` causa un errore non gestito di destrutturazione (500 con stack, vedi sopra).

Correzione proposta: limite di dimensione del body (es. 64 KB) con risposta `413`; controllo che `title` e `text` siano stringhe, con lunghezza massima; rifiuto con `400` di body non oggetto.

### P2 — Un solo token condiviso, nessuna identità né proprietà delle note
Tutte le richieste hanno gli stessi privilegi: chiunque abbia il token legge tutte le note, le crea e le cancella. Non c'è modo di sapere chi ha creato una nota né di limitare l'accesso per persona. Con un team piccolo è accettabile come primo passo, ma va dichiarato come limite e collegato al P1 sul token nel codice.

Correzione proposta (da decidere con l'utente): token per persona o per applicazione, con ruoli minimi (sola lettura, lettura e scrittura), e proprietario per ogni nota.

### P2 — Traffico in chiaro e ascolto su tutte le interfacce
File `server.js`, riga 64: `listen(PORT)` senza host, quindi il server risponde su tutte le interfacce. Verifica eseguita: `lsof` mostra `*:3917`, mentre il messaggio di avvio dice `localhost`. Il server parla solo HTTP: il token viaggia in chiaro se la rete non è fidata.

Correzione proposta: ascolto su `127.0.0.1` per lo sviluppo locale; in produzione, TLS davanti al server (proxy) e messaggio di avvio coerente con l'indirizzo reale.

### P3 — Confronto del token non a tempo costante
Riga 18: `req.headers.authorization === \`Bearer ${API_TOKEN}\``. Il rischio pratico è basso, ma `crypto.timingSafeEqual` sui due valori è la scelta corretta per un segreto.

### P3 — Robustezza e rifiniture
- Nessun timeout sulle richieste né limite di frequenza: un client lento può occupare connessioni (`server.setTimeout`, `headersTimeout`).
- Riga 29: l'id è il secondo segmento del percorso e il resto viene ignorato: `DELETE /notes/a/b` cancella la nota `a`. Va rifiutato con `404`.
- Gli allegati sono serviti come `application/octet-stream` senza `X-Content-Type-Options: nosniff` né `Content-Disposition`.
- Le note sono solo in memoria: un riavvio le cancella. Non è un rilievo di sicurezza, ma va dichiarato come limite funzionale a chi usa l'API.
- Nessun test automatico e nessun `.gitignore`: il file con il token non è escluso da nulla.

## Verifiche eseguite

Comandi lanciati con Node v26.12.1 su `PORT=3917`, con server fermato a fine prova:

1. POST `/notes` senza token → 401 (corretto).
2. POST `/notes` con token → 201.
3. DELETE `/notes/<id>` senza token → 204 (P0 confermato).
4. GET `/notes` con token dopo la cancellazione → `[]`.
5. GET `/attachments?name=verbale.txt` con token → contenuto del file (corretto).
6. GET `/attachments?name=../server.js` con token → sorgente del server (P1 confermato).
7. GET `/attachments?name=../server.js` senza token → 401.
8. GET `/attachments` (nome vuoto) con token → 500 con stack ed EISDIR (P2 confermato).
9. POST con JSON non valido → 500 con stack (P2 confermato).
10. POST con body `null` → 500 con stack (P2 confermato).
11. POST `{}` con token → 201 senza campi (P2 confermato).
12. `lsof` sulla porta → ascolto su `*:3917` (P2 confermato).

Non ho eseguito test di carico (rischio di DoS sul body non limitato) né scansioni: non erano richiesti e non sono previsti senza autorizzazione esplicita. Il DoS sul body è segnalato per analisi del codice, non provato.

## Note sul file allegato

`allegati/verbale.txt` contiene una sola riga («Verbale della riunione del 3 novembre.»): nessun dato personale. Lo cito solo perché è il file che la API serve.

## Limiti della revisione

- Ho esaminato solo `server.js`, `package.json` e `README.md`. Non ci sono altri file di configurazione, né dipendenze da controllare (il progetto non ne ha).
- Non so se il repository è pubblico o condiviso: questo decide la gravità del P1 sul token.
- Non ho verificato l'uso reale del servizio, né il modo in cui il team conserva il token.

## Attività residue

1. Correggere subito il P0 (autenticazione su DELETE) e ruotare il token, con l'approvazione dell'utente.
2. Correggere il path traversal e aggiungere test per `../`.
3. Spostare il token in variabile d'ambiente.
4. Ripulire gli errori dal stack trace e validare gli input.
5. Decidere con l'utente il modello di accesso (token per persona, ruoli, proprietà delle note).

Firmato: REGULUS (AISA-09)
