AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

# Revisione di sicurezza: api-note

Ho esaminato `server.js`, `README.md`, `package.json` e `allegati/`. Lo stack è Node 22 senza dipendenze, con `node:http`. Il progetto non ha `CLAUDE.md` né test. Ho letto solo il codice: non ho avviato il server e non ho fatto test dinamici. Non ho modificato nessun file.

**Due rilievi P0 da segnalare subito:** chiunque può cancellare le note senza autenticarsi (R1), e chi ha il token può leggere qualunque file del server (R2).

## Rilievi

| # | Priorità | File:riga | Rilievo | Correzione proposta |
|---|---|---|---|---|
| R1 | P0 | server.js:44-47 | `DELETE /notes/:id` non chiama `authorized(req)`, quindi chiunque cancella le note senza token (OWASP A01, controllo degli accessi violato). Gli ID sono UUID, ma `GET /notes` li espone a chi ha il token, e la cancellazione resta comunque un'azione di scrittura senza autenticazione. | Aggiungere `if (!authorized(req)) return send(res, 401, …)` all'inizio del ramo. Meglio ancora: controllare l'autenticazione una volta sola, prima del routing. |
| R2 | P0 | server.js:51 | Path traversal: `join(ATTACHMENTS, name)` con `name` controllato dall'utente (es. `../server.js`, `../../../etc/passwd`) legge file fuori da `allegati/`, compreso il sorgente con il token (OWASP A01). | Calcolare `resolve(ATTACHMENTS, name)` e rifiutare il percorso se non inizia con `ATTACHMENTS + sep`. In alternativa usare `basename(name)` o una allowlist dei file presenti. Restituire 404 se il file non esiste. |
| R3 | P1 | server.js:7 | Il token API è scritto nel sorgente (`note-api-7f3a9c2e41b8d605`): finisce in git e in ogni copia del codice. Con R2 si legge anche da remoto (OWASP A02/A07). | Leggerlo da `process.env.API_TOKEN` e non avviare il server se manca. **Considerare compromesso il token attuale e ruotarlo.** |
| R4 | P1 | server.js:60-62 | In caso di errore il server restituisce `err.stack` al client. Lo stack rivela percorsi assoluti e struttura del codice, e con R2 conferma quali file esistono (OWASP A05, information disclosure). | Registrare l'errore lato server e rispondere con `{ "error": "internal error" }` in JSON. |
| R5 | P2 | server.js:21-25, 38 | `readBody` non limita la dimensione del corpo, quindi una richiesta enorme esaurisce la memoria (DoS). Un JSON malformato produce un 500 con lo stack (vedi R4) invece di un 400. | Impostare un limite di dimensione (es. 100 KB) e chiudere la richiesta con 413 se lo supera. Gestire l'errore di `JSON.parse` con 400. |
| R6 | P2 | server.js:38-39 | Nessuna validazione dell'input: `title` e `text` possono mancare, non essere stringhe o avere qualunque lunghezza. Le note vivono in memoria senza limite di numero, quindi si possono riempire (DoS). | Accettare solo stringhe non vuote con una lunghezza massima, rispondere 400 negli altri casi, e mettere un tetto al numero di note. |
| R7 | P2 | server.js:18 | Il token si confronta con `===`, che non ha tempo costante: il rischio pratico è basso, ma la correzione è semplice. Inoltre un unico token condiviso da tutto il team non distingue gli utenti, non permette di revocare un singolo accesso e non lascia traccia di chi ha fatto cosa. | Confrontare con `crypto.timingSafeEqual` su buffer della stessa lunghezza. Se il team ne ha bisogno, valutare un token per utente (decisione da confermare). |
| R8 | P3 | server.js:12-15, 52, 64 | Mancano gli header di sicurezza (`X-Content-Type-Options: nosniff`, `Content-Disposition: attachment` sugli allegati) e il server ascolta su tutte le interfacce in HTTP in chiaro. Il token viaggia in chiaro se non c'è TLS davanti. Il 204 alla riga 46 manda anche un corpo `{}`. | Aggiungere gli header. Esporre il server solo dietro un proxy con TLS, oppure in ascolto su `127.0.0.1`. Per il 204, chiudere la risposta senza corpo. |
| R9 | P3 | (tutto il progetto) | Non ci sono log degli accessi né delle cancellazioni, quindi un abuso (es. via R1) non lascia traccia. Non c'è rate limiting sui tentativi con token errato. | Registrare metodo, percorso, esito e orario, senza token né contenuto delle note. Aggiungere un limite di tentativi. |

## Note

- `allegati/` contiene solo `verbale.txt` (una riga, nessun dato personale).
- Le note possono contenere dati personali del team. Se è così, conservazione e accessi vanno visti con il reparto Privacy (AIPCA).
- Il token compare nel sorgente. In questo rapporto lo cito perché è già nel file revisionato, ma va trattato come esposto.

## Ordine di correzione proposto (da confermare)

1. R1 e R2: sono una riga o poco più ciascuna, da fare subito.
2. R3: spostare il token in una variabile d'ambiente e ruotarlo.
3. R4 e R5: errori generici e limite sul corpo.
4. R6 e R7.
5. R8 e R9.

Dopo le correzioni servono test di regressione. Esempi:
- DELETE senza token deve rispondere 401;
- `name=../server.js` deve rispondere 400 o 404;
- un JSON malformato deve rispondere 400 senza stack.

## Riepilogo

- **Sintesi:** 9 rilievi, così distribuiti: 2 P0, 2 P1, 3 P2, 2 P3.
- **File modificati:** nessuno.
- **Test eseguiti:** nessuno. La revisione è solo statica e i rilievi sono dedotti dal codice, non verificati in esecuzione.
- **Rischi residui:** finché R1 e R2 restano aperti, chiunque raggiunga l'API può cancellare le note, e chi ha il token può leggere i file del server.
- **Attività residue:** approvazione delle correzioni da parte dell'utente, implementazione da parte di uno sviluppatore della Software Agency, poi i test di regressione indicati sopra.

— REGULUS (AISA-09)
