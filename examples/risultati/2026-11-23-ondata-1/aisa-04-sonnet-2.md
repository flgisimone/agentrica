AISA-04 · ANTARES — Senior Backend Developer, reparto AISA (AI Software)

# Revisione read-only di `server/`

Ho letto tutti i file di `server/` (app, auth, db e le quattro route) e, per il contesto, `package.json` e le migrazioni. Non ho eseguito codice né test: i rilievi vengono dalla lettura. Non ho modificato nulla.

Sono Sonnet e ci sono più rilievi P1. Propongo il riesame del direttore AISA-01 o di un revisore su Opus prima che diventino definitivi.

## P1

1. **`server/routes/orders.js:31-42`: la creazione ordine non è in transazione e la giacenza non è atomica.**
   - Leggere la giacenza (riga 35) e scrivere `stock - quantità` (riga 38) sono due passaggi separati su una pool condivisa. Due ordini concorrenti leggono lo stesso valore e scrivono entrambi: la merce viene venduta due volte e la giacenza risulta sbagliata.
   - Se una riga fallisce a metà (righe 36 e 37 con `return`, oppure un errore del DB), restano l'ordine `pending_payment` senza righe e la giacenza già scalata per le righe precedenti. Non c'è rollback.
   - Correzione: `pool.connect()` con `BEGIN` e `COMMIT`/`ROLLBACK`. Per la giacenza usare `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING price`, oppure `SELECT ... FOR UPDATE`. Aggiungere `CHECK (stock >= 0)` come rete di sicurezza.

2. **Gli handler async non gestiscono gli errori (`orders.js` righe 6, 22; `products.js` righe 10, 21, 29, 46; `reports.js` riga 8; `webhooks.js` riga 15; `auth.js` riga 4).**
   - Express 4.21 non intercetta i rifiuti delle promise. L'errore diventa un `unhandledRejection`: da Node 15 in poi termina il processo e fino a quel momento la richiesta resta appesa. Il middleware di errore (`app.js:15`) non viene mai raggiunto.
   - Basta un input o un errore del DB per mandare giù il server. Esempi: `?from=abc` su `GET /api/orders` (riga 7, data non valida), un `productId` non numerico, un DB irraggiungibile in `requireUser`, un elemento `null` in `lines` (riga 26).
   - Correzione: un wrapper unico `asyncHandler` applicato a tutte le route e a `requireUser`. Questa è la causa comune da correggere.

3. **`server/routes/reports.js:9`: viene creata una `new Pool` a ogni richiesta e non viene mai chiusa.**
   - Ogni chiamata a `/api/reports/sales` lascia aperte connessioni al database fino a esaurire `max_connections` di Postgres. Il resto dell'applicazione smette di funzionare.
   - Correzione: usare `db.query`, cioè la pool condivisa.

4. **`server/routes/webhooks.js:15-24`: il webhook dei pagamenti non è idempotente né atomico.**
   - Il fornitore ritenta fino a 5 volte (commento alla riga 14) e `payment.succeeded` inserisce una fattura a ogni consegna. `invoices` non ha un vincolo `UNIQUE(order_id)` (migrazione 002), quindi si creano fatture duplicate.
   - `UPDATE` e `INSERT` non sono in transazione. Se l'`INSERT` fallisce, l'ordine risulta `paid` senza fattura, e il ritentativo ripete l'`UPDATE`.
   - Un evento in ritardo riporta a `paid` un ordine già `shipped` o `cancelled` (riga 20: nessuna condizione sullo stato di partenza).
   - Non c'è `try/catch`: un JSON non valido, `event.data.metadata` assente o un `orderId` inesistente (violazione di FK) provocano un 500 e un crash (vedi punto 2). Il fornitore ritenta, e la richiesta può superare i 10 secondi.
   - Correzione: transazione con `UPDATE ... WHERE id=$1 AND status='pending_payment'`, `INSERT ... ON CONFLICT (order_id) DO NOTHING` con un vincolo univoco, risposta 200 anche per eventi già elaborati. Confrontare l'importo con `orders.total`.
   - Riga 8: se `PAYMENTS_WEBHOOK_SECRET` non è impostato, `createHmac` lancia un errore. Meglio fallire all'avvio.

5. **`server/routes/products.js:21-27`: `/:id/supplier-price` non ha `requireRole`.**
   - Qualsiasi utente autenticato, anche con ruolo `shop` (cioè i clienti), può leggere il prezzo di acquisto dai fornitori e quindi calcolare il margine.
   - Probabilmente va limitato a `warehouse` e `admin`; il requisito va confermato.
   - La route inoltre usa `readFileSync` e `JSON.parse` a ogni richiesta: blocca l'event loop e va in crash se il file manca o è corrotto. Il file andrebbe caricato una volta sola o letto in modo asincrono.

6. **`server/routes/products.js:46-49` insieme a `db/migrations/002_orders.sql:16`: `DELETE /products/:id` cancella lo storico.**
   - `order_items.product_id` ha `ON DELETE CASCADE`, quindi eliminare un prodotto cancella le righe di tutti gli ordini passati. I totali degli ordini non corrispondono più alle righe e i report delle vendite perdono dati.
   - Correzione: `ON DELETE RESTRICT` più un campo `archived` (soft delete). Oggi la route risponde 204 anche se l'id non esiste.

7. **`db/migrations/003_sku.sql:2`: `ADD COLUMN sku text NOT NULL` senza default.**
   - Fallisce su una tabella `products` già popolata e blocca il deploy. Serve prima una colonna nullable, poi il backfill, poi `SET NOT NULL`.
   - La migrazione è fuori da `server/`, ma il codice dipende da `sku`.

## P2

8. **`orders.js:22-30`: la validazione dell'input è insufficiente.**
   - `quantity` può essere decimale (1.5) o enorme: la colonna è `integer`, quindi si ottiene un 500 al posto di un 400.
   - `productId` non è validato nel tipo, e le righe duplicate dello stesso prodotto non sono unite.
   - Per i ruoli `warehouse` e `admin`, `req.body.customerId` non è validato né verificato. Se manca, la query fallisce per il `NOT NULL`.
   - Non c'è alcun limite sul valore di `quantity`.

9. **`orders.js:46-56`: `PATCH /:id/status` non ha una macchina a stati.**
   - Sono permessi salti arbitrari, per esempio `shipped` verso `pending_payment`.
   - `cancelled` non ripristina la giacenza.
   - Un ordine inesistente risponde `{ok:true}` invece di 404.
   - `warehouse` può forzare `paid` senza pagamento e senza fattura.
   - Il controllo del ruolo (riga 50) viene dopo la validazione del corpo: va spostato prima, con `requireRole`.

10. **`orders.js:15-18`: query N+1 su `GET /`.** Fino a 201 query per richiesta, e ogni query prende una connessione. Meglio un join o `= ANY($1)`. Il filtro `from` non è validato (crash, vedi punto 2) e non c'è un `to`. I `LIMIT 200` non sono paginabili.

11. **`reports.js:10-21`: aggregazione fatta in JavaScript.**
    - Vengono caricate tutte le righe storiche in memoria, e poi si filtra per data.
    - Con `from` o `to` non validi, `Invalid Date` rende i confronti sempre falsi: il filtro non filtra niente e si ottiene l'intero storico.
    - Gli ordini `cancelled` e `pending_payment` sono inclusi nelle vendite.
    - Correzione: `GROUP BY` in SQL con parametri validati, `status IN ('paid', ...)`, importi in `numeric`.

12. **`002_orders.sql:18`: `unit_price real`.** Il prezzo è a virgola mobile, mentre `products.price` è `numeric`. I totali (`orders.js:40`, `reports.js:20`) sommano float e accumulano errori. Servono `numeric(10,2)` o centesimi interi.

13. **`products.js:31-34`: `PATCH stock` imposta un valore assoluto.** Se un ordine scala la giacenza nel frattempo, il valore viene sovrascritto (lost update). Meglio un delta, o un controllo di versione.

14. **`server/db.js:3`: la pool non ha un handler `pool.on('error')`.** Un errore su un client inattivo (riavvio del DB) fa terminare il processo. Mancano anche `statement_timeout` e `connectionTimeoutMillis`.

15. **`server/app.js:20`: assenti segni di robustezza di base.** Non ci sono shutdown ordinato (SIGTERM, chiusura pool), health check, rate limit su `/api` e `/webhooks`, né header di sicurezza.

## P3

16. **`auth.js:5`:** il token viene confrontato in chiaro con `sessions.token`, quindi un'eventuale fuga del DB espone le sessioni attive. Meglio salvare l'hash. Il token vuoto produce comunque una query inutile.
17. **`products.js:15`:** i caratteri `%` e `_` in `q` non sono escapati nell'`ILIKE`. La ricerca `%` restituisce tutto; non c'è rischio di injection perché la query è parametrizzata.
18. **`webhooks.js:16`:** una firma non valida risponde 400. Meglio 401 o 403, e senza timestamp nella firma non c'è protezione dal replay.
19. **Test:** `package.json` ha `node --test` ma non ho trovato file di test. Le parti critiche (ordini, webhook, permessi) non sono coperte.

## Positivo

Le query sono tutte parametrizzate. In `PATCH /products` i nomi dei campi sono una lista chiusa, quindi non c'è SQL injection. Il confronto della firma HMAC usa `timingSafeEqual` con controllo della lunghezza. Il webhook legge il corpo raw prima di `express.json`. Il filtro per `customer_id` sugli ordini del ruolo `shop` è applicato lato server.

## Limiti

Ho fatto sola lettura, senza eseguire test o query. Non ho verificato `db/migrate.js`, il frontend, CI e deploy: sono fuori dal perimetro. Il requisito sui permessi del prezzo fornitore (punto 5) e sul ruolo `warehouse` (punto 9) è da confermare con l'utente.

— AISA-04 · ANTARES
