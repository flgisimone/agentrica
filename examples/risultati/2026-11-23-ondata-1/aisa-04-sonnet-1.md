AISA-04 · ANTARES — Senior Backend Developer, reparto AISA (AI Software)

Revisione read-only di `server/` (più `db/` per le dipendenze dallo schema). Non ho eseguito nulla né modificato file. I rilievi vengono dalla lettura del codice e non sono provati con test. Il direttore (AISA-01) e la biblioteca non erano disponibili in questa prova. Per i P0/P1 sotto, che li ho trovati su Sonnet, propongo il riesame del direttore o di un revisore su Opus prima che diventino definitivi.

## P0

**1. Migrazioni che non si applicano su un database nuovo (`db/migrations/001_init.sql:14`, `003_sku.sql:3`, `004_stock.sql`).**
- La 001 crea già `qty`. La 003 esegue `RENAME COLUMN stock TO qty`, ma `stock` non esiste, quindi fallisce. La 004 rinomina poi `qty` in `stock`. Il codice usa `stock`, mentre lo schema iniziale dichiara `qty`.
- La 003 aggiunge `sku text NOT NULL` senza default: fallisce se `products` ha già righe.
- `db/migrate.js:13-14` esegue ogni file e poi registra la riga in `schema_migrations` in due passi separati, senza transazione. Se un file contiene più istruzioni e una fallisce a metà, restano modifiche parziali. `main()` non ha `catch`, quindi l'errore diventa una rejection non gestita.
- Il Dockerfile (riga 17) lancia `npm run migrate && node server/app.js`. Con la 003 rotta il deploy non parte.
- Da verificare: se la produzione è già migrata in modo diverso, serve prima il suo stato reale.

**2. Creazione ordine non transazionale e con corsa sulla giacenza (`server/routes/orders.js:31-43`).**
- Le query passano da `pool.query`, cioè da connessioni diverse e senza `BEGIN`/`COMMIT`. L'`INSERT` dell'ordine, i decrementi di giacenza e gli `INSERT` delle righe sono scritture indipendenti.
- Se una riga fallisce (prodotto inesistente alla riga 36, giacenza insufficiente alla 37, errore SQL) l'handler risponde 400 o 409 ma lascia l'ordine orfano `pending_payment` e le giacenze già scalate per le righe precedenti. Le giacenze non vengono ripristinate.
- Lettura e scrittura della giacenza sono separate (righe 35 e 38: `SELECT stock`, poi `UPDATE ... SET stock = $1` con valore calcolato in JS). Due richieste concorrenti (due repliche, 2.500 ordini al giorno nei picchi) leggono lo stesso valore e si sovrascrivono: si vende più di quel che c'è e si perdono decrementi (overselling).
- Correzione attesa: una transazione su un solo client (`pool.connect`), con `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING price` e rollback su ogni errore.
- Manca il `try/catch` (vedi P1 sugli errori async).

**3. Webhook di pagamento non idempotente (`server/routes/webhooks.js:18-22`).**
- Il fornitore ritenta fino a 5 volte (commento alla riga 14). Ogni ripetizione di `payment.succeeded` esegue di nuovo `UPDATE` e `INSERT INTO invoices`, quindi si creano fatture duplicate per lo stesso ordine. `invoices` non ha un vincolo `UNIQUE(order_id)` (`002_orders.sql`).
- I due statement non sono in transazione: se l'`INSERT` fallisce, l'ordine risulta pagato senza fattura, e al retry l'`UPDATE` si ripete.
- Il webhook non controlla che l'ordine esista, che sia in `pending_payment`, né che l'importo corrisponda al totale. `event.data.metadata.orderId` non è validato e può dare un `TypeError` e quindi un 500, con retry a catena. Un ordine `cancelled` può diventare `paid`.
- Correzione attesa: una transazione, `UNIQUE(order_id)` più `ON CONFLICT DO NOTHING`, oppure una tabella degli id evento già elaborati.

## P1

**4. Eccezioni async non gestite: processo che crolla o richieste appese (Express 4).**
- Express 4 non intercetta le promise rifiutate. Mancano `try/catch` o `next(err)` in:
  - `server/auth.js:6`
  - `server/routes/orders.js:6` (GET) e `:22` (POST)
  - `server/routes/products.js:10`, `:21`, `:29`, `:46`
  - `server/routes/reports.js:8`
  - `server/routes/webhooks.js:15`
- Solo il PATCH `/:id/status` lo fa. Con Node 22 una rejection non gestita termina il processo.
- Casi concreti: un `id` non numerico in `/:id` provoca un errore Postgres `invalid input syntax`, e un database momentaneamente irraggiungibile blocca tutto. Il middleware errori (`app.js:15`) non viene mai raggiunto.
- Un `JSON.parse` fallito nel webhook (`webhooks.js:17`) ha lo stesso effetto.
- `requireUser` è il punto più critico: qualunque errore del database fa cadere l'intera API.

**5. Controllo di accesso mancante sul cambio stato ordine (`server/routes/orders.js:46-52`).**
- L'ordine dei controlli è invertito: prima valida lo stato, poi controlla il ruolo solo con `role === "shop"`. Nessun `requireRole`.
- `warehouse` può quindi mettere `paid` o `cancelled` su qualsiasi ordine, aggirando il pagamento. Non ci sono transizioni di stato valide (un `shipped` può tornare `pending_payment`), né rollback della giacenza su `cancelled`. Non c'è controllo che l'ordine esista (risponde `ok: true` anche per un id inesistente).
- Da confermare con l'utente quali ruoli e quali transizioni sono ammessi.

**6. IDOR e autorizzazione sugli ordini (`server/routes/orders.js:29`, `:6-19`).**
- Nella POST, per `warehouse` e `admin` `customerId` viene preso dal body senza validarlo. Un valore assente o inesistente produce un errore FK (500 non gestito), e dopo l'`INSERT` dell'ordine le righe ancora non esistono: l'ordine resta orfano.
- Un utente `shop` con `customer_id` nullo (nello schema `users.customer_id` è nullable) farebbe fallire il `NOT NULL`.
- Nella GET, `req.query.from` non è validato: una data non valida genera un errore SQL non gestito, cioè un 500 o un crash (vedi P1 n. 4).

**7. Listino da 30 MB letto e analizzato a ogni richiesta, in modo sincrono (`server/routes/products.js:24-25`).**
- `fs.readFileSync` più `JSON.parse` di circa 30 MB blocca l'event loop (circa centinaia di millisecondi o più per chiamata). Poi `items.find` fa una scansione lineare.
- Basta un gruppo di richieste a `/supplier-price` per bloccare tutto il server, compresi i webhook (timeout del fornitore di 10 secondi, con retry).
- L'endpoint è raggiungibile da qualsiasi utente autenticato, anche `shop`, e il prezzo d'acquisto è un dato riservato: `shop` non dovrebbe vederlo. Serve almeno `requireRole("warehouse", "admin")`.
- Correzione attesa: carica una volta all'avvio in una `Map` per `sku` (con ricarica quando il file cambia, visto il job giornaliero) e lettura asincrona.

**8. Report che crea un pool a ogni richiesta, non lo chiude e filtra in JS (`server/routes/reports.js:9-21`).**
- `new Pool` a ogni chiamata, mai `pool.end()`: ogni richiesta lascia connessioni aperte e il database arriva al limite di connessioni (`max_connections`). Dovrebbe usare il pool condiviso di `db.js`.
- Carica tutte le righe di `order_items` di tutta la storia e filtra le date in memoria. Con 2.500 ordini al giorno per 25 righe sono circa 60.000 righe al giorno, quindi la memoria cresce senza limite. Il filtro e l'aggregazione vanno nella query (`WHERE o.created_at BETWEEN $1 AND $2 GROUP BY product_id`).
- `from` e `to` non sono validati: se mancano o sono invalidi, `new Date(undefined)` dà `Invalid Date` e il confronto con `NaN` esclude tutto (risposta `{}` con 200 senza errore).
- `unit_price` è `real` (float32, `002_orders.sql`) e `revenue` somma float in JS: errori di arrotondamento sui totali monetari. Vedi anche P2 n. 12.

**9. Cancellazione prodotto distruttiva con cascata (`server/routes/products.js:46-48`, `002_orders.sql:order_items.product_id ON DELETE CASCADE`).**
- `DELETE /api/products/:id` (solo `admin`) elimina anche tutte le righe d'ordine storiche del prodotto: gli ordini perdono le righe e i totali non corrispondono più. Si perde la storia delle vendite e i report cambiano.
- Va sostituita con una cancellazione logica (flag `active`) o `ON DELETE RESTRICT`. Il DELETE di un id inesistente risponde comunque 204.

**10. `app.js` non chiude correttamente e lascia buchi (`server/app.js:6-20`).**
- Nessun `SIGTERM` handler: con due repliche dietro il bilanciatore e il `deploy.sh` il server viene ucciso a metà richiesta, e un webhook o un ordine in corso si perde.
- Il webhook è montato prima del `requireUser`, corretto, ma `PAYMENTS_WEBHOOK_SECRET` non è verificato all'avvio: se manca, `createHmac("sha256", undefined)` lancia un'eccezione a ogni chiamata (500 e retry del fornitore).
- `validSignature` risponde 400 invece di 401. Non c'è controllo sul replay (timestamp dell'evento).
- Nessun limite di frequenza (`rate limit`) su `/api`, nessun `helmet`, nessun controllo che `DATABASE_URL` esista.
- Nessun `pool.on("error")` in `db.js`: un errore su una connessione inattiva abbatte il processo.

## P2

**11. Validazione delle righe d'ordine incompleta (`orders.js:23-28`).**
- `l.quantity = Number(...)` accetta `1.5`, `Infinity`; la colonna è `integer`, quindi un decimale dà errore SQL (500) dopo che l'ordine è già stato creato. Serve `Number.isInteger` e un tetto.
- `l.productId` non è validato, e lo stesso prodotto può comparire in più righe. Il body (`req.body`) può essere `undefined` se l'intestazione `Content-Type` non è JSON: `req.body.lines` darebbe `TypeError`.
- Il prezzo viene preso dal database (bene: il client non lo manda).

**12. Tipi monetari (`002_orders.sql`, `orders.js:40`).** `unit_price real` contro `numeric(10,2)` altrove. `pg` restituisce `numeric` come stringa: `total += p[0].price * l.quantity` concatena/converte in modo scorretto, ed è un bug latente. Servono calcoli in `numeric` nella query o in centesimi interi.

**13. Elenco ordini N+1 (`orders.js:15-18`).** Una query per ogni ordine, fino a 200 query sequenziali per richiesta. Basta una query con `WHERE order_id = ANY($1)`. `LIMIT 200` senza paginazione: l'ordine `DESC` senza chiave di spareggio può duplicare o saltare righe tra pagine.

**14. Sessioni e token (`auth.js:5-6`).**
- Se l'intestazione manca, il token è `""` e viene comunque interrogato il database.
- `replace(/^Bearer /, "")` accetta anche un token senza il prefisso `Bearer`.
- Il token è salvato in chiaro nella tabella (`sessions.token`): se il database trapela, tutte le sessioni sono utilizzabili. Meglio salvarne l'hash.
- Nessuna query di pulizia delle sessioni scadute (non risulta dal codice letto).

**15. Ricerca prodotti (`products.js:14-16`).** `ILIKE '%q%'` non usa l'indice `products_name_idx` su 12.000 prodotti (accettabile oggi). I caratteri `%` e `_` in `q` non sono scappati. Risolvibile con `pg_trgm` se serve. `ORDER BY name` non è deterministico per nomi uguali: aggiungere `id`.

**16. PATCH prodotti (`products.js:29-44`).**
- `warehouse` può cambiare il prezzo, ma il README dice che i prezzi li cambia solo `admin`. Il controllo va per campo.
- L'id inesistente risponde `ok: true`. Non c'è traccia di chi ha cambiato cosa (audit log).
- `price` non limita le cifre decimali (`numeric(10,2)`: overflow, errore SQL non gestito).
- I nomi delle colonne vengono da `Object.keys(fields)` costruito dal codice, non dall'utente, quindi non c'è SQL injection.

**17. Errori che perdono informazioni (`app.js:15-18`).** `console.error(err)` può scrivere nei log parametri o dati dei clienti. Il middleware non distingue errori di validazione. Il formato dell'errore (`{error}`) è coerente.

## P3

**18.** `migrate.js`: nessun lock advisory. Con due repliche che lanciano `npm run migrate` all'avvio insieme (Dockerfile riga 17) c'è una corsa: entrambe applicano la stessa migrazione e una fallisce o la duplica. Serve `pg_advisory_lock`. Il file `004_stock.down.sql` non viene mai applicato da nulla (accettabile, ma documentarlo).
**19.** `express.static` e `maxAge: "1h"` su file che cambiano a ogni rilascio: servirebbe cache busting. `express.json` limit 100kb va bene.
**20.** Nessun test automatico rilevato nelle cartelle `server/` o `db/`; non ho controllato `package.json`/CI per gli script di test, quindi non posso dire se esistano altrove.

## Limiti e prossimi passi
- Non ho letto `web/`, `deploy/`, i workflow CI, `data/listino.json` né il codice del login (la tabella `sessions` è dichiarata gestita da esso, ma non è nel perimetro `server/`).
- Nessun test è stato eseguito; i rilievi sono da lettura statica. In particolare il P0 n. 1 (migrazioni) si può provare in un ambiente locale con Postgres e dati sintetici.
- Priorità di correzione suggerita: n. 2 e n. 3 (integrità degli ordini e dei pagamenti), poi n. 1, n. 4, n. 5. Le correzioni toccano schema e flusso di pagamento: servono la conferma dell'utente e, per le migrazioni, un'autorizzazione esplicita prima di qualsiasi applicazione in produzione.

— AISA-04 · ANTARES
