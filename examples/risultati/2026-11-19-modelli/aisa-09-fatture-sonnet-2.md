AISA-09 · REGULUS — Senior Application Security Engineer, reparto AISA (AI Software)

# Revisione di sicurezza: api-fatture

Perimetro: tutti i file del progetto (`README.md`, `package.json`, `src/server.js`, `src/auth.js`, `src/invoices.js`, `src/store.js`). Solo lettura del codice, nessun avvio del server e nessun test eseguito, nessuna modifica ai file. Nessuna dipendenza (nessun audit dipendenze necessario). Riferimenti: OWASP Top 10 / ASVS.

## Sintesi

Nessun P0. Quattro P1: lettura di fatture altrui, modifica libera dei campi delle fatture (mass assignment), password in chiaro nei log, CORS aperto a ogni origine con credenziali. Punti già corretti: confronto della chiave admin con `timingSafeEqual`, limite di 64 KB al corpo, `basename` sul PDF, controllo del proprietario sul PDF e sul PATCH, UUID come id.

## Rilievi

### P1 — IDOR in lettura: `GET /invoices/:id` restituisce le fatture di tutti
- `src/server.js:67-71`, `src/invoices.js:10`. `invoices.get(id)` non filtra per proprietario e il GET dettaglio risponde 200 con la fattura di qualunque utente autenticato. Il PDF (riga 77) e il PATCH (`invoices.js:23`) controllano invece il proprietario, quindi il controllo è incoerente (OWASP A01, ASVS 4.2.1).
- Mitigante: gli id sono UUID non indovinabili, ma compaiono nell'export admin e potrebbero trapelare altrove; non è un controllo di accesso.
- Correzione proposta: nel punto comune (riga 68) risolvere la fattura solo se `ownerId === user.id`, altrimenti 404, per tutti i metodi. Così il controllo non si duplica nei singoli rami.

### P1 — Mass assignment in `PATCH /invoices/:id`
- `src/invoices.js:25` `Object.assign(invoice, body)`. L'utente può modificare qualsiasi campo: `ownerId` (cedere la fattura a un altro utente o farsela attribuire), `status` (uscire dalla bozza, aggirando la regola «solo le bozze si modificano», o riportarla a bozza), `id`, `pdf` (scegliere un qualsiasi file in `documenti/`, anche di altre fatture: `basename` evita il path traversal ma non limita ai file propri). Nessuna validazione di `customer`, `amount`, `dueDate`, a differenza della creazione. Una chiave `__proto__` nel JSON cambia anche il prototipo dell'oggetto.
- Correzione proposta: lista consentita (`customer`, `amount`, `dueDate`) con le stesse validazioni di `create`, estratte in una funzione comune.

### P1 — Password scritte nei log
- `src/server.js:41` `console.log("login", JSON.stringify(body))` registra email e password in chiaro a ogni accesso (OWASP A09, ASVS 7.1.1). Colpisce anche i tentativi falliti, in cui l'utente spesso digita una password valida di un altro servizio.
- Correzione proposta: eliminare la riga o registrare solo l'esito e un identificativo non sensibile. I log già prodotti vanno considerati compromessi e ruotati/ripuliti; le due password di prova sono sintetiche.

### P1 — CORS: origine riflessa con credenziali
- `src/server.js:24-31`. Qualsiasi `Origin` viene riflessa in `access-control-allow-origin` insieme ad `allow-credentials: true`: qualunque sito visitato da un utente connesso può leggere le risposte dell'API (fatture incluse) con il suo cookie. Il README dice che il frontend è solo `https://app.studio.example`. Manca anche `Vary: Origin`.
- Correzione proposta: lista consentita con la sola origine del frontend (da variabile d'ambiente), niente header per le altre, `Vary: Origin`.

### P1 — Token di sessione prevedibile
- `src/auth.js:8-10`. `Math.random()` non è un generatore crittografico e la parte `Date.now()` è nota: il token è prevedibile e con entropia insufficiente (ASVS 3.2.2, 128 bit da CSPRNG).
- Correzione proposta: `randomBytes(32).toString("hex")` oppure `randomUUID()` da `node:crypto`, già importato altrove nel progetto.

### P2 — Cookie di sessione senza attributi di sicurezza
- `src/auth.js:18`. Mancano `HttpOnly` (un XSS legge il cookie), `Secure` (viaggia anche in HTTP) e `SameSite` (nessuna difesa dai CSRF: POST/PATCH con JSON da un form `text/plain` o da origini consentite dal CORS aperto). Anche il cookie di logout (`server.js:59`) è senza attributi.
- Correzione proposta: `HttpOnly; Secure; SameSite=Lax` (o `Strict`/`None;Secure` secondo l'hosting del frontend: se il frontend è su un dominio diverso e usa `credentials: "include"` serve valutare `SameSite=None` con una difesa CSRF aggiuntiva, ad esempio verifica di `Origin`). Da concordare col responsabile.

### P2 — Hash delle password debole
- `src/store.js:4`. SHA-256 senza sale e veloce: due utenti con la stessa password hanno lo stesso hash e un dump si rompe con tabelle/GPU (ASVS 2.4). Il confronto in `auth.js:15` non è a tempo costante.
- Correzione proposta: `scrypt` di `node:crypto` con sale casuale per utente e `timingSafeEqual`. Non serve una dipendenza. Poiché in produzione ci sarebbe un database, da fare prima di caricare utenti reali.

### P2 — Nessun limite ai tentativi di accesso, enumerazione degli utenti
- `src/auth.js:14-15`, `src/server.js:39-45`. Messaggi diversi per «Utente inesistente» e «Password errata» rivelano quali email esistono; nessun rate limit né blocco temporaneo, quindi forza bruta e credential stuffing senza ostacoli. Lo stesso vale per la chiave admin (`/admin/export`).
- Correzione proposta: un solo messaggio generico («Credenziali non valide»), limite per IP e per account (anche in memoria, con scadenza), eventuale ritardo uniforme.

### P2 — Iniezione di formule e rottura del CSV nell'export
- `src/invoices.js:35`. I campi (`customer` scelto dall'utente) non sono né quotati né neutralizzati: un cliente `=HYPERLINK(...)` o `=cmd|...` viene eseguito quando l'amministrazione apre il file in Excel/LibreOffice (CSV injection); un `;` o un a capo nel nome sposta le colonne e può falsare i dati.
- Correzione proposta: quotare i campi con `"` raddoppiando i `"`, e anteporre `'` ai valori che iniziano con `=`, `+`, `-`, `@`, tab o a capo.

### P2 — Chiave admin unica, condivisa e senza ruoli
- `src/auth.js:32-36`, `src/store.js:6-9`. L'accesso admin è una sola chiave statica in variabile d'ambiente, senza attribuzione (nessun log di chi esporta), rotazione né limite di tentativi; il campo `role` degli utenti non è usato. Il confronto a tempo costante è corretto, anche se il controllo di lunghezza ne rivela la lunghezza (trascurabile). L'export scarica tutte le fatture con nome dei clienti: sono dati potenzialmente personali, quindi conviene coinvolgere la Privacy & Compliance.
- Correzione proposta: registrare ogni export (senza il contenuto), valutare un ruolo `admin` con login e MFA, minimizzare le colonne esportate.

### P3 — Validazione di creazione incompleta
- `src/invoices.js:13-18`. `Number("")`, `Number(null)` e `Number([])` danno 0 e passano; importi negativi o con molti decimali ammessi; `dueDate` solo nel formato, non una data reale (`2026-99-99`). Il nome cliente può contenere caratteri di controllo.
- Correzione proposta: richiedere `typeof amount === "number"`, `> 0`, massimo ragionevole e 2 decimali; validare la data con `Date`.

### P3 — Nessuna scadenza/pulizia delle sessioni
- `src/auth.js:5,27-28`. Le sessioni scadute restano nella mappa per sempre (crescita della memoria) e al login non si invalida una sessione precedente.
- Correzione proposta: rimuovere la sessione scaduta alla lettura e, con un database, una pulizia periodica.

### P3 — Header di sicurezza e risposta PDF
- `src/server.js:8-10,80`. Nessun `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` per le risposte con dati personali, `Content-Disposition` per il PDF. Il server ascolta senza TLS: va terminato a monte (reverse proxy) e questo andrebbe scritto nel README.

### P3 — Credenziali di prova nel codice
- `src/store.js:7-8`. Password di prova in chiaro nel sorgente: accettabile come dati sintetici, ma ci si deve assicurare che non esistano in produzione.

## Controlli verificati e senza rilievi
- `basename` su `invoice.pdf` (`invoices.js:31`): nessun path traversal con il valore attuale (il rilievo sul PATCH riguarda solo la scelta del file dentro `documenti/`).
- Limite di 64 KB e gestione degli errori con messaggi generici (nessun stack trace al client).
- Regex del percorso `[\w-]+` e nessuna esecuzione di comandi, nessun `eval`, nessuna query SQL.

## Limiti
Analisi statica soltanto: non ho avviato l'applicazione né eseguito test dinamici (nessuna autorizzazione né necessità). Mancano un test automatico e un'analisi delle dipendenze (non ce ne sono). Gli ambienti di produzione, il reverse proxy e l'hosting non sono visibili.

## Attività residue (da confermare con l'utente)
Applicare le correzioni nell'ordine: P1 (IDOR, PATCH con lista consentita, log, CORS, token), poi P2. Non ho modificato file. Per ogni correzione servono test (accesso incrociato tra utenti, PATCH con campi non ammessi, CORS con origine estranea). La parte privacy (export dei clienti, log) va rivista dalla Privacy & Compliance Agency.

— AISA-09 · REGULUS
