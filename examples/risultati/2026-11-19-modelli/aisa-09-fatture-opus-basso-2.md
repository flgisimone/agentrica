# Revisione di sicurezza: api-fatture

Ruolo: Senior Application Security Engineer (AISA). Ho fatto una revisione statica di `src/server.js`, `src/auth.js`, `src/invoices.js`, `src/store.js`, README e package.json. Non ho avviato il server, non ho eseguito test attivi e non ho modificato file. Le correzioni qui sotto sono proposte e vanno decise da te.

## Da segnalare subito (P0)

Chiunque abbia un account legge le fatture di un altro utente e le modifica. In più, qualunque sito visitato da un utente con la sessione aperta può leggere i suoi dati (rilievi 1, 2, 3).

## Rilievi

| # | Gravità | File:riga | Rilievo | Correzione proposta |
|---|---|---|---|---|
| 1 | P0 | src/server.js:71 | **IDOR su `GET /invoices/:id`**: la fattura viene restituita senza verificare `invoice.ownerId === user.id`. Basta conoscere l'id, che compare anche nell'export, nei log e nelle URL condivise. | Controllare il proprietario una volta sola, subito dopo la riga 69 (404 se non coincide), per tutte le rotte `/invoices/:id`. |
| 2 | P0 | src/invoices.js:25 | **Mass assignment in `PATCH`**: `Object.assign(invoice, body)` accetta qualsiasi campo. Si possono cambiare `ownerId` (fattura regalata o sottratta), `status` (una fattura emessa torna bozza o una bozza diventa pagata), `id`, `pdf` (si punta a un PDF di un altro utente in `documenti/`, ad es. `"esempio.pdf"`) e `__proto__`. Inoltre `customer`, `amount` e `dueDate` saltano la validazione fatta in `create`. | Lista di campi ammessi (`customer`, `amount`, `dueDate`) con la stessa validazione di `create`, condivisa fra le due funzioni. |
| 3 | P0 | src/server.js:24-31 | **CORS che riflette qualunque `Origin` con `allow-credentials: true`**: ogni sito può chiamare l'API con il cookie dell'utente e leggere le risposte (fatture, PDF) o creare e modificare fatture. | Lista di origini ammesse (`https://app.studio.example`) e `Vary: Origin`; nessun header CORS per le altre origini. |
| 4 | P1 | src/auth.js:18 | Il cookie di sessione non ha `HttpOnly`, `Secure` né `SameSite`: è leggibile da script (XSS sul frontend significa furto della sessione), passa in chiaro su HTTP ed è inviato nelle richieste cross-site. | `HttpOnly; Secure; SameSite=Lax` (o `Strict`). Se frontend e API stanno su siti diversi serve `SameSite=None; Secure`, insieme alla difesa CSRF del rilievo 5. |
| 5 | P1 | src/server.js:13-22, 62, 72 | **CSRF**: `readJson` non controlla `content-type`, quindi un form o un `fetch` "semplice" con `text/plain` da un altro sito crea o modifica fatture e chiude la sessione, senza preflight. | Rifiutare con 415 un corpo che non sia `application/json` e verificare `Origin` sulle richieste che cambiano stato. |
| 6 | P1 | src/auth.js:8-10 | Token di sessione generato con `Math.random()` e `Date.now()`: non è crittograficamente sicuro ed è in parte prevedibile. | `randomBytes(32).toString("base64url")` da `node:crypto`. |
| 7 | P1 | src/server.js:41 | `console.log("login", JSON.stringify(body))` scrive nei log **email e password in chiaro** a ogni accesso. | Togliere il log o registrare solo l'esito, senza credenziali. |
| 8 | P1 | src/store.js:4 | Password con SHA-256 senza sale e senza fattore di costo: in caso di furto del database sono vulnerabili a dizionario e rainbow table. Anche il confronto (auth.js:15) non è a tempo costante. | `scrypt` (o `argon2`) con sale per utente e confronto con `timingSafeEqual`. |
| 9 | P2 | src/auth.js:14-15 | Messaggi diversi ("Utente inesistente" / "Password errata"): permettono di scoprire quali email sono registrate. | Un solo messaggio generico. |
| 10 | P2 | src/server.js:39-45 | Il login non limita i tentativi: si possono provare password a forza bruta. | Limite per IP e per account, con ritardo crescente o blocco temporaneo. |
| 11 | P2 | src/invoices.js:34-36 | **CSV/formula injection** nell'export: `customer` viene scritto senza escape. Un valore come `=HYPERLINK(...)` o che contiene `;` o un a capo esegue formule o rompe le colonne quando l'amministrazione apre il file in Excel. | Quoting CSV (doppi apici e apici raddoppiati) e prefisso `'` per i valori che iniziano con `= + - @` o con tab/CR. |
| 12 | P2 | src/invoices.js:13-18 | Validazione debole: `amount` accetta valori negativi, zero e numeri enormi; `dueDate` accetta date inesistenti (`2026-99-99`). | Importo > 0 con un massimo e due decimali; data verificata con `Date` (o un confronto dopo il parsing). |
| 13 | P2 | src/auth.js:5, 21-30 | Le sessioni scadute non vengono mai eliminate (la Map cresce senza limite) e il login non invalida sessioni precedenti. Se l'utente viene rimosso, `currentUser` restituisce `user: undefined` e le rotte successive vanno in errore. | Cancellare la sessione scaduta alla lettura e fare pulizia periodica; restituire `null` se l'utente non esiste più. |
| 14 | P3 | src/server.js:8-11, 80 | Mancano gli header di sicurezza (`X-Content-Type-Options: nosniff`, `Cache-Control: no-store` sulle risposte con dati, `Content-Disposition` sul PDF). | Aggiungerli in `send` e nella risposta PDF. |
| 15 | P3 | src/server.js:86-90 | Ogni eccezione, anche un errore interno (ad es. un PDF che non si legge), diventa 400 "Richiesta non valida" e lo stack finisce nei log. | 400 solo per JSON non valido, 500 per il resto. |
| 16 | P3 | src/server.js:47-50 | L'export completo non ha limiti di frequenza né log di audit. La chiave è confrontata bene (`timingSafeEqual`, rifiutata se vuota). | Registrare ogni export (quando, da dove, senza la chiave) e valutare un limite di frequenza. |

Cose fatte bene: limite di 64 KB sul corpo, `basename` contro il path traversal nel PDF (che però si aggira con il rilievo 2), controllo del proprietario su PDF e PATCH, id generati con `randomUUID`, chiave admin confrontata a tempo costante.

## Note

- Gli utenti e le password in `src/store.js` sono dati di prova dichiarati nel README e non li considero segreti reali. In produzione non devono restare nel codice.
- Il sistema tratta dati di clienti e fatture: i rilievi 1, 2, 3 e 7 riguardano anche la Privacy & Compliance Agency (riservatezza e log).

## Ordine consigliato

1, 2, 3 (P0), poi 4-8. Ogni correzione è piccola e locale. Dopo le correzioni servono test che coprano: accesso a una fattura di un altro utente (404), PATCH con `ownerId`/`status`/`pdf` (campi ignorati o 400), richieste da un'origine non ammessa, POST con `text/plain` (415).

## Test eseguiti

Nessuno: revisione statica del codice. Il progetto non ha test.
