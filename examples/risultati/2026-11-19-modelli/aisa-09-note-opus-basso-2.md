# Revisione di sicurezza: api-note

Perimetro: `server.js`, `README.md`, `package.json`, `allegati/`. Ho fatto solo una revisione statica del codice: non ho avviato il server, non ho eseguito test e non ho modificato file. Riferimenti: OWASP Top 10 2021 e ASVS.

## Sintesi

Ho trovato tre problemi P0: il percorso dell'allegato non è controllato e permette di leggere qualsiasi file sul server, DELETE non chiede il token, e il token è scritto nel codice. Ci sono poi un problema P1 e alcuni P2/P3. Segnalo i P0 subito: vanno corretti prima di esporre l'API.

## Rilievi

| # | Gravità | File:riga | Rilievo |
|---|---|---|---|
| 1 | P0 | server.js:51 | **Path traversal (A01).** `join(ATTACHMENTS, name)` non controlla il nome: con `?name=../../../etc/passwd` o `?name=../server.js` restituisce qualsiasi file leggibile dal processo, compreso il sorgente con il token. Correzione: `const p = resolve(ATTACHMENTS, name)` e rifiutare con 400/404 se `!p.startsWith(ATTACHMENTS + sep)`; in alternativa accettare solo `basename(name)` o una lista di nomi consentiti. |
| 2 | P0 | server.js:44-47 | **DELETE senza autenticazione (A01).** Manca `authorized(req)`: chiunque conosca o ottenga un id (gli id compaiono nella GET e nella risposta della POST) può cancellare le note. Correzione: aggiungere lo stesso controllo delle altre rotte, prima della cancellazione. |
| 3 | P0 | server.js:7 | **Segreto nel codice (A07/ASVS V6).** Il token è una costante: finisce in git, chiunque abbia il repo lo conosce, e con il rilievo 1 anche chi non ha il repo può leggerlo. Correzione: leggerlo da `process.env.API_TOKEN` e non avviare il server se manca; considerare il token attuale compromesso e generarne uno nuovo. |
| 4 | P1 | server.js:60-63 | **Stack trace al client (A05).** Ogni errore restituisce `err.stack` (percorsi del server, nomi dei file e, con il rilievo 1, messaggi ENOENT che rivelano quali file esistono). Correzione: registrare lo stack solo nel log del server e rispondere `500 {"error":"internal error"}` in JSON. |
| 5 | P2 | server.js:21-25, 38-39 | **Input non validato e corpo senza limite (A04).** Il corpo si accumula senza limite (DoS di memoria), un JSON non valido porta al rilievo 4, e `title`/`text` non sono controllati per tipo e lunghezza. Correzione: limite al corpo (es. 100 KB, 413 se superato), 400 su JSON non valido, `title` e `text` stringhe con lunghezza massima. |
| 6 | P2 | server.js:10, 40 | **Nessun limite alle note in memoria.** Chi ha il token può riempire la memoria. Correzione: un numero massimo di note o una quota. |
| 7 | P2 | server.js:18 | **Confronto del token non a tempo costante.** `===` permette in teoria un attacco di timing. Correzione: `crypto.timingSafeEqual` su buffer della stessa lunghezza. Il rischio pratico è basso. |
| 8 | P2 | server.js (intero) | **Nessun rate limiting** sui tentativi con token errato: permette di provare token a forza bruta. Correzione: rate limit, sul server o sul proxy davanti. |
| 9 | P3 | server.js:12-15, 52 | **Mancano header di sicurezza** (`X-Content-Type-Options: nosniff`, `Cache-Control: no-store` sulle risposte autenticate). Inoltre il 204 della riga 46 invia un corpo `{}`, che con 204 non è ammesso. |
| 10 | P3 | server.js:7, 17-19 | **Un solo token condiviso**: non distingue gli utenti, non si può revocare per un singolo utente e non lascia traccia di chi ha fatto cosa. Nessun log di accesso. Va bene per un team piccolo, da rivedere se l'API cresce. |

Note: il server ascolta in HTTP semplice, quindi il token passa in chiaro se non c'è TLS (un proxy) davanti. Il README non dice come si configura il token. Non ci sono dipendenze, quindi non c'è nulla da controllare sul fronte della supply chain.

## Correzioni proposte (non applicate)

Ordine consigliato: 1, 2, 3 (ruotando il token), 4, poi 5-8. Sono tutte modifiche piccole dentro `server.js`, senza dipendenze nuove. Dopo le correzioni servono test: GET `/attachments?name=../server.js` deve dare 400/404, DELETE senza token deve dare 401, un JSON non valido deve dare 400 senza stack.

## Test eseguiti

Nessuno: ho fatto solo la revisione statica.

## Attività residue

Prima di applicare le correzioni serve l'ok dell'utente. Serve anche capire se il token attuale è già stato distribuito o esposto: se sì, va ruotato.
