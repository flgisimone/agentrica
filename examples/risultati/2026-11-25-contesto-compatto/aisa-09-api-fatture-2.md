**AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)**

Ho letto tutta l'API in sola lettura: `README.md`, `package.json` e i quattro file di `src/`. Non ho eseguito né modificato nulla, quindi nessun test è stato fatto. Le gravità sono quelle comuni del reparto. Non uso la biblioteca (`mcp-2026-07-28` non riguarda questo progetto). L'API è in Node 22, senza dipendenze, con i dati in memoria; non c'è nessun segreto reale nel codice. Quasi tutti i rilievi sono per i dati degli utenti (fatture e password).

## Rilievi

**1. P1 – Controllo di accesso mancante sul dettaglio fattura (IDOR)**
- Posizione: `src/server.js:71`, con `src/invoices.js:10`.
- `GET /invoices/:id` restituisce la fattura a qualsiasi utente autenticato, senza controllare `ownerId`. Gli altri due percorsi (PATCH e PDF) lo controllano e rispondono 404.
- Gli id sono UUID e non indovinabili. Basta però che un id trapeli, per esempio da log, URL condivisi o dal CSV dell'amministrazione, perché un altro utente legga cliente e importo.
- Correzione: stesso controllo dei percorsi vicini, con 404 se `invoice.ownerId !== user.id`. Meglio farlo in `get(user, id)`, il punto per cui passano tutti i chiamanti.

**2. P1 – Assegnazione massiva nella modifica**
- Posizione: `src/invoices.js:25`.
- `Object.assign(invoice, body)` copia nella fattura qualunque campo del corpo, senza lista di campi ammessi e senza validazione.
- Un utente può quindi cambiare `ownerId`, per assegnare la fattura a un altro utente o sottrarla a sé. Può cambiare `status`, e uscire dalla bozza o rientrarci, aggirando il blocco «solo le bozze si modificano». Può cambiare `id`, rompendo la chiave nella `Map`. Può cambiare `pdf` (`basename` evita l'attraversamento di percorso, ma si può puntare a un altro file di `documenti/`).
- `amount` e `dueDate` si possono impostare senza i controlli che esistono in `create`.
- Correzione: lista di campi modificabili (`customer`, `amount`, `dueDate`) con la stessa validazione di `create`, condivisa tra i due.

**3. P1 – Le password finiscono nei log**
- Posizione: `src/server.js:41`.
- `console.log("login", JSON.stringify(body))` scrive email e password in chiaro a ogni accesso, anche quelli falliti, in qualunque sistema raccolga lo standard output.
- Correzione: togliere la riga. Se serve un log di accesso, registrare solo esito ed email, senza password.

**4. P1 – CORS riflette qualsiasi origine con le credenziali**
- Posizione: `src/server.js:24-31`.
- L'intestazione `Origin` viene copiata in `access-control-allow-origin` insieme ad `allow-credentials: true`. Qualunque sito può quindi chiamare l'API con il cookie dell'utente connesso e leggere le risposte. Il README dichiara un solo frontend, `https://app.studio.example`.
- Il cookie non ha `SameSite` (vedi rilievo 6), e questo peggiora il quadro.
- Correzione: lista di origini ammesse, con il solo frontend dichiarato, e nessuna intestazione CORS per le altre. Aggiungere `Vary: Origin`.

**5. P1 – Token di sessione prevedibile**
- Posizione: `src/auth.js:9`.
- Il token è `Math.random().toString(36)` più `Date.now()`. `Math.random` non è crittografico e il timestamp è noto, quindi il token si può indovinare o ricostruire.
- Correzione: `randomBytes(32).toString("hex")` o `randomUUID()` da `node:crypto`.

**6. P2 – Cookie di sessione senza attributi di protezione**
- Posizione: `src/auth.js:18`, `src/server.js:59`.
- Mancano `HttpOnly`, `Secure` e `SameSite` (`Lax` o `Strict`). Su HTTP il cookie viaggia in chiaro, è leggibile da script e non protegge dalle richieste tra siti (CSRF) su POST e PATCH.
- Correzione: aggiungere `HttpOnly; Secure; SameSite=Lax`.

**7. P2 – Password con SHA-256 senza sale**
- Posizione: `src/store.js:4` e `src/auth.js:15`.
- L'hash è veloce e identico per password uguali, quindi vulnerabile a dizionari e tabelle precalcolate. Il confronto `!==` non è a tempo costante.
- Correzione: `scrypt` di `node:crypto` (o `argon2`/`bcrypt`) con sale per utente, e confronto con `timingSafeEqual`.

**8. P2 – Accesso senza limiti di tentativi e con enumerazione degli utenti**
- Posizione: `src/auth.js:14-15`, `src/server.js:39-45`.
- Le risposte distinguono «Utente inesistente» da «Password errata», e non c'è nessun limite ai tentativi né blocco. Si possono scoprire gli account validi e provare password a raffica.
- Correzione: messaggio unico per entrambi i casi, limite di tentativi per IP e per account.

**9. P2 – Iniezione di formule e delimitatori nel CSV**
- Posizione: `src/invoices.js:35`.
- `customer` è libero (fino a 200 caratteri) e finisce nel CSV senza escape. Un cliente come `=HYPERLINK(...)` viene eseguito come formula quando l'amministrazione apre il file in Excel o Fogli. Un `;` nel nome sposta le colonne.
- Correzione: premettere `'` ai valori che iniziano con `= + - @` e mettere i campi tra virgolette con raddoppio delle virgolette.

**10. P2 – Utenti di prova con credenziali note nel codice**
- Posizione: `src/store.js:7-8`, citati nel README.
- Le password di prova sono in chiaro nel codice. Se lo stesso `store.js` arrivasse in produzione, quegli account sarebbero validi.
- Correzione: caricare gli utenti di prova solo fuori dalla produzione, per esempio con `NODE_ENV`.

**11. P3 – Validazione incompleta di `create`**
- Posizione: `src/invoices.js:13-19`.
- `Number("")` e `Number(null)` valgono 0, e importi negativi o enormi sono accettati. `dueDate` controlla solo il formato, quindi `2026-99-99` passa.
- Correzione: limiti per l'importo e controllo della data reale.

**12. P3 – Sessioni scadute mai rimosse e nessun limite per utente**
- Posizione: `src/auth.js:5,28`.
- La `Map` cresce senza pulizia, anche con login ripetuti. Alla scadenza la sessione resta in memoria.
- Correzione: cancellare la sessione quando la si trova scaduta.

**13. P3 – Intestazioni di sicurezza e risposta del PDF**
- Posizione: `src/server.js:80`.
- Mancano `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` sulle risposte con dati e `Content-Disposition` sul PDF.

## Verificato e a posto
- Il download del PDF usa `basename` e una cartella fissa, quindi non c'è attraversamento di percorso.
- La chiave admin si confronta con `timingSafeEqual` e a lunghezza uguale. Se `ADMIN_KEY` non è impostata, l'accesso è negato.
- Il corpo delle richieste ha un limite di 64 KB.
- Non ci sono dipendenze, quindi nessuna da controllare.

## Domande aperte
- L'API sta dietro HTTPS? Da questo dipende l'uso di `Secure` nel cookie.
- Il frontend `https://app.studio.example` è l'unica origine da ammettere?

## Per il direttore
Lavoro su Sonnet e ho trovato rilievi P1 (1-5). Propongo il riesame di AISA-01 · SIRIUS o di un revisore su Opus prima che diventino definitivi. Nessuna correzione applicata. Le decisioni restano all'utente.

— AISA-09 · REGULUS, Senior Application Security Engineer
