AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

# Revisione di sicurezza: api-fatture

**Il problema più grave (P0):** un utente collegato può leggere le fatture di tutti gli altri. In più può modificare campi protetti delle proprie bozze e, con questi due difetti insieme, scaricare i PDF degli altri.

## Cosa ho esaminato

- **Il progetto:** `README.md`, `package.json`, `src/server.js`, `src/auth.js`, `src/invoices.js`, `src/store.js` e `documenti/`. È Node senza dipendenze, i dati sono in memoria e la cartella non è un repository git. Non ci sono `CLAUDE.md`, test o linter.
- **Il criterio:** OWASP Top 10 (2021) e ASVS 4.0, per le parti pertinenti.
- **Verifica dal vivo:** ho avviato il server solo in locale (porta 3917, `ADMIN_KEY` di prova) e l'ho chiamato con curl, usando gli utenti di prova sintetici di `src/store.js`. Tutto in memoria, nessun file del progetto toccato. Ho chiuso il processo e cancellato il mio log temporaneo. Non ho modificato file né applicato correzioni.

## Rilievi

| # | Priorità | File:riga | Rilievo | Confermato in locale |
|---|---|---|---|---|
| 1 | P0 | `src/server.js:71` (e `src/invoices.js:10`) | **Si leggono le fatture degli altri utenti.** `GET /invoices/:id` restituisce la fattura senza controllare `ownerId` (lo fanno solo PATCH e PDF). Gli id sono UUID, ma escono da export, log e link: il controllo d'accesso non può contare sul fatto che non si indovinano (OWASP A01). | Sì: Bruno ha letto la fattura di Anna |
| 2 | P1 | `src/invoices.js:25` | **Si possono scrivere campi protetti.** `Object.assign(invoice, body)` accetta qualunque campo: `ownerId` (sposta la fattura su un altro utente), `status` (la bozza diventa "inviata"), `id`, `pdf`, e `amount` senza validazione. Mettendo `pdf` uguale al file di un altro (il nome si legge grazie al #1), si scarica il PDF di un'altra fattura: `basename` impedisce di uscire dalla cartella, non di leggere altri file dentro `documenti/`. | Sì: con `{"pdf":"esempio.pdf","status":"sent","amount":"abc"}` Bruno ha ottenuto il PDF di Anna |
| 3 | P1 | `src/server.js:24-31` | **CORS accetta qualunque sito, con il cookie.** L'`Origin` della richiesta viene rimandato così com'è, insieme a `allow-credentials: true`. Se il cookie arriva, qualunque sito può leggere le risposte con la sessione dell'utente. Il README indica un solo frontend, `https://app.studio.example`: va ammesso solo quello. | Sì: `Origin: https://evil.example` viene rimandato |
| 4 | P1 | `src/auth.js:9` | **Il token di sessione si può prevedere.** Usa `Math.random()` più `Date.now()`, che non sono crittograficamente sicuri, e ha poca entropia: l'esempio osservato aveva 19 caratteri in base 36. Serve `randomBytes(32)` di `node:crypto`. | Visto il formato del token |
| 5 | P1 | `src/auth.js:18` | **Il cookie di sessione non ha `HttpOnly`, `Secure` né `SameSite`.** Uno script iniettato può leggerlo, passa anche su HTTP, e la protezione da CSRF dipende dai default del browser. | Sì: dall'header `set-cookie` |
| 6 | P1 | `src/server.js:41` | **Le password finiscono nei log in chiaro.** `console.log("login", JSON.stringify(body))` registra email e password di ogni tentativo di accesso (ASVS 7.1.1). | Sì: il log conteneva le password |
| 7 | P1 | `src/store.js:4` | **Le password sono salvate con SHA-256 senza salt.** È un hash veloce, quindi facile da forzare se il database esce. Serve `scrypt` (c'è in `node:crypto`, nessuna dipendenza nuova) con salt per utente e confronto a tempo costante. | No, solo lettura del codice |
| 8 | P2 | `src/server.js:13-21`, `:62` | **Le richieste da altri siti (CSRF) passano.** `readJson` non controlla il `content-type`: un POST `text/plain` da un altro sito, senza preflight, crea fatture o chiude la sessione. Il preflight del PATCH oggi lo autorizza il #3. Servono: richiedere `application/json`, controllare `Origin` sulle richieste che modificano dati, `SameSite`. | Sì: fattura creata con `text/plain` |
| 9 | P2 | `src/auth.js:14-15` | **Il login rivela quali email esistono.** I messaggi distinti "Utente inesistente" e "Password errata" lo dicono. Ne basta uno generico. | Sì |
| 10 | P2 | `src/server.js:39-45`, `:47-48` | **Nessun limite ai tentativi di accesso.** Né `/login` né `x-admin-key` hanno limiti di frequenza o blocchi temporanei: password e chiave si possono forzare per tentativi. | No, solo lettura del codice |
| 11 | P2 | `src/invoices.js:35` (con `:14`) | **L'export CSV si può manomettere.** I campi non sono quotati né neutralizzati: un cliente come `=HYPERLINK(...)` diventa una formula quando l'amministrazione apre il file in Excel, e `;` o un a capo rompono le righe. Vanno quotati i campi e neutralizzati quelli che iniziano con `= + - @`, tab o CR. | Sì: `=HYPERLINK(...)` presente nel CSV |
| 12 | P3 | `src/invoices.js:13-18` | **Validazione degli input debole.** Accetta importi negativi o enormi e date inesistenti come `2026-99-99`. | Sì: `2026-99-99` accettata |
| 13 | P3 | `src/server.js:8-11`, `:80` | **Mancano header di sicurezza.** Non ci sono `Cache-Control: no-store` su fatture e PDF, né `X-Content-Type-Options: nosniff`. | No, solo lettura del codice |
| 14 | P3 | `src/auth.js:5`, `:28` | **Le sessioni scadute restano in memoria.** Non vengono mai tolte dalla `Map`, che cresce senza limite. | No, solo lettura del codice |
| 15 | P3 | `src/store.js:7-8`, `README.md:20` | **Le password di prova sono nel codice sorgente.** Sono sintetiche, ma il README le indica come credenziali: non devono arrivare in produzione. | No, solo lettura del codice |

Per l'amministrazione va bene così: il confronto della chiave in `src/auth.js:32-36` è a tempo costante e con `ADMIN_KEY` vuota l'accesso è negato. Anche il limite di 64 KB sul corpo delle richieste è corretto.

## Correzioni che propongo (da confermare, non applicate)

1. **Per il #1:** controllare il proprietario in un punto solo, al lookup in `server.js:67-69`: se `invoice.ownerId !== user.id` si risponde 404 per GET, PATCH e PDF. Così tutte le rotte sono coperte.
2. **Per il #2:** in `update` accettare solo i campi `customer`, `amount` e `dueDate`, validati come in `create` (conviene un validatore condiviso).
3. **Per #3, #5 e #8:**
   - CORS solo per l'origin del frontend, presa da configurazione;
   - cookie `HttpOnly; Secure; SameSite=Lax`, oppure `None` se l'API è su un altro sito;
   - `content-type: application/json` obbligatorio e controllo di `Origin` su POST e PATCH.
4. **Per #4, #6 e #7:**
   - token generato con `randomBytes`;
   - nei log niente corpo del login, al massimo l'esito senza credenziali;
   - password con `scrypt` e salt.
5. **Poi i rilievi P2 e P3**, in particolare il limite di tentativi su `/login` e sulla chiave admin e l'escape del CSV.
6. **Test:** il progetto non ne ha. Propongo test automatici per i controlli d'accesso (lettura, modifica e PDF fra utenti diversi) e per la whitelist dei campi del PATCH.

## Limiti

- Non ci sono test né repository git, quindi non ho visto storia né modifiche pendenti.
- Non ho analizzato dipendenze: non ce ne sono.
- Il deploy (TLS, proxy) non è descritto, quindi non ho verificato HTTPS.

Firmato: REGULUS (AISA-09)