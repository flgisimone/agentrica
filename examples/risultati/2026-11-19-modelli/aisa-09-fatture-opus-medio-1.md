AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

# Revisione di sicurezza di api-fatture

Ho riletto tutto il codice (`README.md`, `package.json`, `src/server.js`, `src/auth.js`, `src/invoices.js`, `src/store.js`). La cartella non è un repository Git e non contiene né `CLAUDE.md` né test. Non ho modificato nessun file.

**Il problema più serio sono gli accessi.** Un utente può leggere le fatture di un altro, scaricare il suo PDF e mettere fatture false nel suo elenco. Ho confermato questi casi avviando l'API in locale (Node v26.12.1, porta 3917/3918, `ADMIN_KEY` di prova) e usando gli utenti di prova di `src/store.js`.

Non ho assegnato nessun P0: con UUID casuali e i browser che bloccano i cookie fra siti diversi, nessun rilievo espone i dati da solo. Ce ne sono però sei P1.

## Rilievi

| # | Priorità | File:riga | Rilievo (OWASP) | Verificato |
|---|---|---|---|---|
| 1 | P1 | `src/server.js:71` (lettura alla 68) | **Accesso alla fattura di un altro utente** (A01). `GET /invoices/:id` restituisce la fattura senza controllare il proprietario. Il controllo c'è solo per il PDF (riga 77). Lo attenua il fatto che gli id sono UUID casuali, quindi difficili da indovinare. | Sì: Bruno legge la fattura di Anna |
| 2 | P1 | `src/invoices.js:25` | **Modifica di qualunque campo** (A01/A08). `Object.assign(invoice, body)` accetta qualsiasi chiave senza validarla. Effetti: (a) `ownerId` sposta la fattura nell'elenco di un altro utente; (b) `pdf` punta al file di un altro, quindi il controllo della riga 77 si aggira; (c) `status` salta il flusso della bozza; (d) `amount`/`customer` arrivano senza validazione (es. `"abc"`); (e) `id` e `__proto__` cambiano l'oggetto. | Sì: (a), (b), (c), (d) |
| 3 | P1 | `src/server.js:24-31` | **CORS che accetta qualunque Origin con le credenziali** (A05). L'Origin ricevuto, anche `null`, viene ripetuto insieme a `allow-credentials: true`. Un sito ostile può leggere le fatture della vittima ovunque il browser invii il cookie: browser senza SameSite=Lax predefinito, oppure un altro host dello stesso sito. Il README chiede di consentire solo `https://app.studio.example`. | Sì: risposta con `https://evil.example` |
| 4 | P1 | `src/auth.js:18` (e `src/server.js:59`) | **Cookie di sessione senza `HttpOnly`, `Secure` e `SameSite`** (A07). Il token si legge da JavaScript (quindi può essere rubato con un XSS sul frontend) e può viaggiare in chiaro. Sulla protezione CSRF decide il browser. | Sì: header `set-cookie` |
| 5 | P1 | `src/server.js:13-22`, `:62-63` | **CSRF** (A01). `readJson` non controlla il `content-type`. Un modulo cross-site con `text/plain` è una richiesta che il browser invia senza preflight, eppure crea o modifica fatture. Si combina con i rilievi 3 e 4. | Sì: POST `text/plain` accettato |
| 6 | P1 | `src/auth.js:8-10` | **Token di sessione prevedibile** (A02). È costruito con `Math.random()` (generatore non crittografico) più `Date.now()`. Va sostituito con `randomBytes(32)` o `randomUUID()`. | Letto nel codice |
| 7 | P1 | `src/server.js:41` | **Password scritte in chiaro nei log** (A09). `console.log("login", JSON.stringify(body))` scrive email e password di ogni tentativo di accesso. | Sì: compaiono nel log del server |
| 8 | P2 | `src/store.js:4`, `src/auth.js:15` | **Hash delle password debole** (A02). È SHA-256 senza salt e confrontato con `!==`. In produzione servono scrypt/argon2 con salt e un confronto a tempo costante. | Letto nel codice |
| 9 | P2 | `src/auth.js:14-15` | **Si scopre quali email sono registrate** (A07). I messaggi "Utente inesistente" e "Password errata" sono diversi. | Sì |
| 10 | P2 | `src/server.js:39-45` | **Nessun limite ai tentativi** su `/login` (A07): niente rate limit né blocco dopo vari errori. Si possono provare password a raffica. | Letto nel codice |
| 11 | P2 | `src/invoices.js:35-36` (input alle righe 14-19) | **CSV injection nell'export** (A03). I campi non vengono racchiusi tra virgolette né neutralizzati. Un `customer` con `;`, ritorni a capo o `=` iniziale aggiunge righe false o formule che partono quando l'amministrazione apre il file in Excel. | Sì: righe spezzate e `=HYPERLINK` nell'export |
| 12 | P2 | `src/auth.js:5, 17, 28` | **Le sessioni non si cancellano mai.** La Map tiene anche quelle scadute e cresce a ogni login: si può esaurire la memoria (DoS). | Letto nel codice |
| 13 | P2 | `src/store.js:6-9` | **Credenziali di prova nel codice** (A07). Se il codice va in produzione così com'è, chiunque lo legga conosce due account validi. | Letto nel codice |
| 14 | P3 | `src/invoices.js:17-18` | **Validazione dell'input debole.** Sono accettati importi negativi, `""` (che diventa 0) e date inesistenti (`2026-02-30`). Inoltre `String(array)` lascia passare `dueDate` come array. | Sì: `amount:-5`, `dueDate:["2026-02-30"]` salvati |
| 15 | P3 | `src/server.js:8-11`, `:80` | **Mancano gli header di sicurezza**: niente `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` sui dati delle fatture, né `Content-Disposition` sul PDF. | Letto nel codice |
| 16 | P3 | `src/auth.js:32-36`, `src/server.js:47-51` | **Export amministrativo senza traccia.** Nessun audit log e nessun limite alle richieste. Non c'è nemmeno una lunghezza minima per `ADMIN_KEY`: una chiave vuota invece è respinta correttamente. | Sì: chiave vuota rifiutata |

**Cosa è fatto bene:**
- il percorso del PDF è ridotto con `basename` e resta in `documenti/`;
- c'è un limite di 64 KB al corpo delle richieste;
- la chiave dell'amministrazione si confronta con `timingSafeEqual`;
- gli id delle fatture sono generati con `randomUUID`;
- gli errori non mostrano dettagli interni.

## Correzioni proposte (da confermare, non applicate)

1. **Controllo del proprietario in un punto solo.** `invoices.get(user, id)` restituisce `null` se la fattura non è dell'utente, così il controllo vale per dettaglio, PATCH e PDF.
2. **PATCH con elenco dei campi ammessi.** Accettare solo `customer`, `amount` e `dueDate`, con la stessa validazione di `create`.
3. **CORS limitato a `https://app.studio.example`.** Aggiungere `Vary: Origin` e rifiutare le richieste che cambiano dati se il `content-type` non è `application/json` o l'Origin non è ammesso.
4. **Sessione più sicura:** cookie con `HttpOnly; Secure; SameSite=Lax` e token generato con `randomBytes(32).toString("base64url")`.
5. **Log senza segreti:** togliere il log del corpo del login o registrare solo l'esito.
6. **Hash delle password:** scrypt (`node:crypto`, nessuna dipendenza) con salt e confronto con `timingSafeEqual`. Usare lo stesso messaggio per utente inesistente e password errata e aggiungere un limite ai tentativi.
7. **Export:** racchiudere i campi del CSV tra virgolette e neutralizzare `= + - @` iniziali.
8. **Manutenzione:** pulire periodicamente le sessioni scadute, validare meglio importi e date, aggiungere gli header mancanti.

## Limiti

- Non esistono test automatici e non ne ho aggiunti. Le prove sono state richieste curl manuali su localhost con i dati sintetici del progetto.
- Non ho analizzato dipendenze né configurazione del deploy (HTTPS, proxy): il progetto non ne ha.
- Non sono stati provati contro un browser vero il comportamento SameSite e lo XSS sul frontend.

Firmato: REGULUS (AISA-09)