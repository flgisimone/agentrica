# AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

Revisione di sicurezza dell'API `api-note` (Node 22, senza dipendenze). Nessun file del progetto è stato modificato: è un audit in sola lettura, con correzioni solo proposte.

**Rilievo P0 da segnalare subito:** lettura di file arbitrari sul server tramite `GET /attachments` (path traversal), con il token che si trova nel sorgente.

## Sintesi

| # | Gravità | Rilievo | Dove |
|---|---|---|---|
| 1 | P0 | Path traversal su `/attachments`: si leggono file fuori da `allegati/` | `server.js:51` |
| 2 | P1 | Token API hardcoded nel sorgente | `server.js:7` (uso a riga 18) |
| 3 | P1 | `DELETE /notes/:id` senza autenticazione (il README dice che tutte le richieste usano il Bearer) | `server.js:44-47`, `README.md:16` |
| 4 | P2 | Stack trace e percorsi interni inviati al client nelle risposte 500 | `server.js:60-62` |
| 5 | P2 | Corpo della richiesta letto senza limite di dimensione (rischio di esaurire la memoria) | `server.js:21-25` |
| 6 | P2 | Nessuna validazione di `title` e `text` in `POST /notes`: si crea una nota senza campi | `server.js:38-39` |
| 7 | P2 | Il server ascolta su tutte le interfacce, in HTTP semplice, con un token statico | `server.js:64` |
| 8 | P3 | Confronto del token con `===` (non a tempo costante) | `server.js:18` |
| 9 | P3 | Concatenazione di chunk Buffer con `data += chunk`: caratteri UTF-8 multibyte spezzati tra due chunk si corrompono | `server.js:22-23` |
| 10 | P3 | Routing con `split("/")`: `/notes/abc/xyz` viene accettato ignorando il segmento in più | `server.js:29` |

Firma: AISA-09 · REGULUS

## Dettaglio dei rilievi

### 1. P0 — Path traversal su `GET /attachments`
`server.js:51`: `join(ATTACHMENTS, url.searchParams.get("name") ?? "")` non verifica il nome. Con `name=../README.md` la risposta contiene il contenuto del `README.md` della radice, fuori da `allegati/`. Con `../` si può leggere qualunque file leggibile dal processo, per esempio file di configurazione o segreti sul server.

Verifica eseguita in locale (`localhost:3123`, dati sintetici, server fermato dopo il test):
- con il token: `GET /attachments?name=../README.md` restituisce **200** e il contenuto del README esterno alla cartella;
- senza token: **401**, come previsto.

Il rilievo è P0 perché espone dati su tutto il file system leggibile dal processo. Il fatto che l'endpoint sia dietro autenticazione non lo mitiga, perché il token è in chiaro nel sorgente (rilievo 2).

Correzione proposta (da confermare): risolvere il percorso e verificare che resti dentro `ATTACHMENTS` (`path.resolve` più controllo del prefisso con separatore), oppure accettare solo un nome base senza separatori (`path.basename` e rifiuto se il risultato cambia). Aggiungere un test con `../`, con `%2e%2e%2f` e con byte nullo.

### 2. P1 — Token API hardcoded
`server.js:7`: il token è una costante nel sorgente e vale per tutti gli endpoint protetti. Chiunque legga il repository, o il sorgente se il server è esposto, può chiamare l'API. Il valore non è riportato in questo rapporto.

Correzione proposta: leggere il token da `process.env` (senza valore di default), ruotare il token attuale perché va considerato esposto, e rimuoverlo dalla storia Git se il repository è stato condiviso. Il progetto non contiene `.git` in questa copia: non ho potuto verificare se il token sia già in una storia pubblica. Se il token è in uso in un ambiente reale, la gravità diventa P0. Va decisa dall'utente la rotazione.

### 3. P1 — `DELETE /notes/:id` senza autenticazione
`server.js:44-47` non chiama `authorized(req)`, a differenza di GET e POST. Test locale: `DELETE /notes/<id>` senza token su una nota creata con token restituisce **204**: la nota è stata cancellata. Il README (`README.md:16`) dice invece che le richieste usano il Bearer.

Correzione proposta: aggiungere il controllo di autorizzazione come negli altri endpoint, prima del controllo di esistenza, e aggiungere un test che verifichi il 401 senza token.

### 4. P2 — Dettagli interni nelle risposte di errore
`server.js:60-62`: ogni errore non gestito risponde 500 con `err.stack`. Test locale: `GET /attachments` senza `name` (lettura di una directory) restituisce il messaggio `EISDIR` con il percorso assoluto della cartella del progetto. Anche un JSON non valido in `POST /notes` produce uno stack trace con i percorsi interni.

Correzione proposta: rispondere con un messaggio generico e 500, registrare lo stack solo nel log del server; restituire 400 per il JSON non valido.

### 5. P2 — Nessun limite al corpo delle richieste
`server.js:21-25` accumula tutto il corpo in memoria senza limite. Un client autenticato (o chiunque, con il token del rilievo 2) può esaurire la memoria del processo.

Correzione proposta: limite di dimensione (per esempio 64 KB) con risposta 413, e uso di `Buffer.concat` (vedi rilievo 9).

### 6. P2 — `POST /notes` senza validazione
`server.js:38-39`: `title` e `text` non vengono controllati. Test locale: `POST /notes` con `{}` e token restituisce **201** e una nota senza titolo né testo. Possono entrare anche valori di tipo sbagliato (numeri, oggetti) nel campo `text` senza limiti di lunghezza.

Correzione proposta: verificare che siano stringhe, con lunghezza massima, e restituire 400 altrimenti.

### 7. P2 — Ascolto su tutte le interfacce, in HTTP
`server.js:64`: `listen(PORT)` senza host ascolta su tutte le interfacce. Test locale con `lsof`: il processo risponde su `*:3123` (IPv6) oltre a 127.0.0.1. Il token viaggia in chiaro, perché il server non usa TLS.

Correzione proposta: ascoltare su `127.0.0.1` se il servizio è locale, oppure mettere il servizio dietro un reverse proxy con TLS. Nota: non è stato verificato dove sia distribuito il servizio.

### 8. P3 — Confronto del token
`server.js:18`: `===` confronta le stringhe in tempo variabile. Il rischio è basso, ma la correzione è semplice con `crypto.timingSafeEqual` su Buffer della stessa lunghezza.

### 9. P3 — Chunk UTF-8
`server.js:22-23`: `data += chunk` converte ogni Buffer in stringa separatamente. Un carattere multibyte spezzato tra due chunk diventa un carattere errato. Con richieste piccole il caso è raro. Correzione: raccogliere i Buffer e fare `Buffer.concat(...).toString("utf8")`, che si fa insieme al rilievo 5.

### 10. P3 — Routing
`server.js:29`: `const [, resource, id] = url.pathname.split("/")` ignora i segmenti in più, quindi `/notes/abc/xyz` è trattato come `/notes/abc`. Non apre superfici di attacco note, ma non è coerente con il documento delle rotte.

## Note sulla funzione (non sono rilievi di sicurezza)

- Le note sono in memoria (`server.js:10`): si perdono al riavvio. Il README non lo dice.
- Non ci sono test, né script di lint o di verify in `package.json`: nessun controllo automatico copre questi rilievi.
- `allegati/verbale.txt` è un file di una riga («Verbale della riunione del 3 novembre.») letto solo per completezza. Non contiene dati personali.

## Test eseguiti

Ambiente: Node v26.12.1 (il progetto dichiara `>=22`), `node server.js` con `PORT=3123`, solo localhost e dati sintetici. Ogni test è stato eseguito dalla cartella del progetto.

| Test | Esito |
|---|---|
| `GET /attachments?name=../README.md` con token | 200, contenuto fuori da `allegati/` (rilievo 1) |
| `GET /attachments?name=../package.json` senza token | 401 |
| `GET /attachments` senza `name` con token | 500, `EISDIR` con percorso assoluto (rilievo 4) |
| `DELETE /notes/x` senza token, id inesistente | 404 |
| `POST /notes` con JSON non valido e token | stack trace di `SyntaxError` nel corpo (rilievo 4) |
| `POST /notes` senza token | 401 |
| `POST /notes` con `{}` e token | 201, nota senza campi (rilievo 6) |
| `DELETE /notes/<id>` di nota creata, senza token | 204, cancellazione riuscita (rilievo 3) |
| Socket in ascolto | `*:3123` e `127.0.0.1:3123` (rilievo 7) |

Non eseguiti: test di carico, test del limite di memoria (rilievo 5), verifica del traversal con codifiche alternative, scansione di dipendenze (il progetto non ne ha), analisi della storia Git (non c'è `.git`).

## Problemi di processo durante il test

- Ho avviato il server di test e l'ho fermato con `pkill -f "node server.js"`. Quel pattern può aver fermato anche altri processi `node server.js` dell'utente. Il processo 42964 risulta ancora in ascolto su `127.0.0.1:3123`: non l'ho avviato io e non l'ho toccato. L'utente deve verificarlo.
- Ho creato due file temporanei in `/tmp` (log e output di curl) e li ho rimossi.

## Decisioni tecniche e limiti

- Ho classificato il traversal come P0 perché espone file del server senza condizioni particolari, oltre il token. Se il servizio non è raggiungibile dall'esterno, la gravità resta P0 per chiunque abbia accesso alla rete del processo.
- Il token è stato usato solo per i test locali e non è riportato in questo rapporto.
- Nessuna correzione è stata applicata: l'utente deve confermare le correzioni proposte, la rotazione del token e l'eventuale pulizia della storia Git (decisioni dell'utente, §Conferma dell'utente).

## Attività residue (da confermare)

1. Correggere il traversal (rilievo 1) e aggiungere il test di regressione.
2. Spostare il token in variabile d'ambiente e ruotarlo (rilievo 2).
3. Aggiungere l'autenticazione a `DELETE` (rilievo 3).
4. Gestione degli errori senza stack, limite del corpo, validazione (rilievi 4-6).
5. Scelta dell'interfaccia di ascolto e di TLS, in base al luogo di distribuzione (rilievo 7).
6. Verificare il processo 42964 su `127.0.0.1:3123`.
