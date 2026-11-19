# Revisione di sicurezza: api-fatture

Ruolo: Senior Application Security Engineer (AISA). Ho fatto una revisione statica di `src/server.js`, `src/auth.js`, `src/invoices.js`, `src/store.js`, README e package.json. Non ho modificato nessun file. Non ho avviato il server e non ho fatto test dinamici: tutti i rilievi vengono dalla lettura del codice. Le correzioni sono proposte e vanno confermate.

## Sintesi

Le correzioni più urgenti sono quattro:
- controllo d'accesso mancante su lettura e modifica delle fatture;
- assegnazione di massa nel PATCH;
- CORS che riflette qualunque origine e permette le credenziali;
- token di sessione prevedibili.

La password in chiaro nei log va corretta subito dopo. Nessun rilievo è P0 in senso stretto, perché i dati sono di prova in memoria. In produzione però i primi tre esporrebbero le fatture di tutti gli utenti, quindi andrebbero trattati come bloccanti per il rilascio.

## Rilievi

| # | Priorità | File:riga | Rilievo | Correzione proposta |
|---|---|---|---|---|
| 1 | P1 | src/server.js:71 (e :68) | **IDOR su `GET /invoices/:id`**: la fattura viene restituita senza controllare `ownerId`. Qualunque utente autenticato legge le fatture altrui se ne conosce l'id. Gli id sono UUID, ma possono trapelare da log, link condivisi o dall'export. | Controllare la proprietà in un punto solo, ad esempio in `invoices.get(user, id)` che restituisce null se `ownerId !== user.id`, e usarlo in tutte le rotte `/invoices/:id`. Così il controllo duplicato alla riga 77 diventa superfluo. |
| 2 | P1 | src/invoices.js:25 | **Assegnazione di massa nel PATCH**: `Object.assign(invoice, body)` accetta qualunque campo. Un utente può cambiare `ownerId` (cedere fatture o mescolare i dati), `status` (ad esempio farla tornare in bozza), `id` e `pdf`. Impostando `pdf` sul nome di un altro file in `documenti/` scarica il PDF di un altro utente: `basename` blocca il path traversal ma non questo. Una chiave `__proto__` nel JSON cambia il prototipo dell'oggetto. Inoltre i campi modificati non passano dalla validazione di `create`. | Usare una whitelist (`customer`, `amount`, `dueDate`) con la stessa validazione della creazione, condivisa fra `create` e `update`. |
| 3 | P1 | src/server.js:24-31 | **CORS riflesso con credenziali**: qualunque `Origin` viene copiato in `access-control-allow-origin` insieme a `allow-credentials: true`. Un sito qualsiasi visitato da un utente loggato può leggere `/invoices` e le fatture via fetch con `credentials: "include"`, e fare `POST`/`PATCH`. È CSRF con lettura della risposta. | Usare un'allowlist con la sola origine `https://app.studio.example` presa da una variabile d'ambiente, aggiungere `Vary: Origin` e non mandare header CORS alle altre origini. |
| 4 | P1 | src/auth.js:8-10 | **Token di sessione prevedibili**: `Math.random()` non è crittograficamente sicuro, e `Date.now()` è noto. | `randomBytes(32).toString("base64url")` da `node:crypto`. |
| 5 | P1 | src/server.js:41 | **Password in chiaro nei log**: `console.log("login", JSON.stringify(body))` scrive email e password a ogni login. Sono dati personali e credenziali nei log. | Rimuovere il log, o registrare solo l'esito senza credenziali né email completa. |
| 6 | P2 | src/auth.js:18 | **Cookie di sessione senza attributi**: mancano `HttpOnly`, `Secure` e `SameSite`. Il token è quindi leggibile da JavaScript (in caso di XSS sul frontend) e viaggia anche in HTTP. | `HttpOnly; Secure; SameSite=Lax` (o `None; Secure` se frontend e API sono su siti diversi, insieme alla correzione 3). Applicare gli stessi attributi al cookie di logout (server.js:59). |
| 7 | P2 | src/store.js:4, src/auth.js:15 | **Hash delle password debole**: SHA-256 senza sale e senza costo, vulnerabile a dizionario e rainbow table. Il confronto non è a tempo costante. | `scrypt` di `node:crypto`, con sale casuale per utente e confronto con `timingSafeEqual`. |
| 8 | P2 | src/auth.js:14-15 | **Enumerazione degli utenti**: i messaggi "Utente inesistente" e "Password errata" sono diversi. | Un messaggio unico ("Credenziali non valide"), e calcolare l'hash anche quando l'utente non esiste. |
| 9 | P2 | src/server.js:39-45, :47-48 | **Nessun limite ai tentativi** su `/login` e sulla chiave admin: brute force senza ostacoli. | Rate limit per IP e per account, con backoff. |
| 10 | P2 | src/invoices.js:35 | **CSV/formula injection ed escaping**: `customer` va nel CSV senza escaping. Un `;` o un a capo rompono le colonne, e un valore che inizia con `=`, `+`, `-` o `@` viene eseguito come formula in Excel. | Racchiudere i campi tra virgolette raddoppiando quelle interne, e prefissare con `'` i valori che iniziano con un carattere da formula. In alternativa, vietare i caratteri di controllo nella validazione. |
| 11 | P3 | src/auth.js:5, :28 | **Sessioni mai ripulite**: le sessioni scadute restano nella `Map` (non vengono cancellate nemmeno al controllo), con crescita della memoria. Non c'è rotazione né invalidazione al cambio password. | Cancellare la sessione scaduta in `currentUser` e fare una pulizia periodica. |
| 12 | P3 | src/invoices.js:13-18 | **Validazione parziale**: un importo negativo o zero è accettato, la data `2026-99-99` passa la regex, e `dueDate` non viene normalizzato. | Importo > 0 con limite massimo, data verificata con `Date` e controllo di andata e ritorno. |
| 13 | P3 | src/server.js:8-11 | **Header di sicurezza assenti** (`X-Content-Type-Options: nosniff`, `Cache-Control: no-store` sulle risposte con dati, `Content-Disposition` sul PDF). | Aggiungerli in `send` e nella risposta PDF. |
| 14 | P3 | src/auth.js:32-36 | La chiave admin non ha una lunghezza minima, e il confronto delle lunghezze rivela quella attesa (impatto basso). L'export espone a chiunque abbia la chiave i dati di tutti gli utenti, senza log d'accesso. | Rifiutare l'avvio se `ADMIN_KEY` è corta (ad esempio meno di 32 caratteri), confrontare gli hash delle due chiavi e registrare gli accessi all'export. |
| 15 | P3 | src/store.js:7-8 | Le password di prova sono nel sorgente. Va bene come fixture, purché non arrivino in produzione. | Caricare gli utenti da una configurazione separata, o non includerli nel build di produzione. |

Cose che ho controllato e che vanno bene:
- il limite al corpo della richiesta (server.js:6, :18);
- `basename` nel percorso dei PDF, che blocca il path traversal (invoices.js:31);
- il confronto a tempo costante della chiave admin;
- l'errore generico verso il client (server.js:89);
- l'elenco `/invoices`, che è filtrato per utente.

## Priorità di intervento proposte

1. Rilievi 1, 2 e 3: con una sola modifica per ciascuno si chiude l'accesso ai dati altrui.
2. Rilievi 4, 5 e 6: sessione e log.
3. Rilievi da 7 a 10, poi i P3.

## Test

Non ho eseguito test: il progetto non ha test e non ho avviato il server. Per la verifica dopo le correzioni propongo questi casi, da eseguire in locale con i due utenti di prova:
- u2 chiede `GET /invoices/<id fattura di u1>` e deve ricevere 404;
- un `PATCH` con `ownerId`, `status`, `pdf` o `__proto__` non deve cambiare quei campi;
- una richiesta con `Origin: https://evil.example` non deve ricevere `access-control-allow-origin`;
- l'header `set-cookie` deve contenere `HttpOnly`, `Secure` e `SameSite`;
- un `customer` uguale a `=1+1` deve uscire neutralizzato nel CSV.

## Limiti

- Ho fatto solo analisi statica, senza test dinamici.
- Non ho esaminato il frontend né la configurazione di hosting e TLS.
- Non ci sono dipendenze esterne da valutare.
- Non ho aperto `documenti/esempio.pdf`.
- Il rilievo 5 riguarda dati personali (le credenziali nei log). Per la conservazione e la pulizia di log eventualmente già prodotti va coinvolta la Privacy & Compliance Agency.
