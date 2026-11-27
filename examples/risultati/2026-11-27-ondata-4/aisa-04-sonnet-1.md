**AISA-04 · ANTARES — Senior Backend Developer, reparto AISA (AI Software)**

Rapporto per AISA-01 · SIRIUS. Revisione read-only di `server/`, senza correzioni né file scritti. Il progetto è un gestionale Express 4.21.2 con `pg` 8.13.1 su Node 22, con due repliche e circa 2.500 ordini al giorno nei picchi.

Non ho eseguito test né l'app, quindi i rilievi vengono dalla lettura del codice. Ho letto anche `db/migrations` e `db/migrate.js`, perché incidono sul comportamento del server. Non ho trovato rilievi P0. Sono però rilievi P1 su Sonnet: propongo il riesame di AISA-01 o di un revisore su Opus prima che diventino definitivi.

Dalla biblioteca ho letto tre schede (verificate il 2026-11-19, da ricontrollare entro il 2027-02-19):
- **MCP 2026-07-28:** non pertinente, nel progetto non c'è nulla di MCP.
- **TypeScript 7.0:** non pertinente, il progetto è in JavaScript.
- **Node.js (v22, v24, v26 LTS):** il `Dockerfile` usa la 22.11.0, una LTS supportata. È una patch vecchia e `package.json` non ha `engines` (P3, vedi 20).

## Rilievi

**P1**

1. **Creazione ordine senza transazione e con corsa sulla giacenza.** `server/routes/orders.js:31-42`.
   - L'ordine viene inserito alla riga 31. Poi ogni riga fa lettura e scrittura separate della giacenza (35-38), senza `BEGIN` né `SELECT ... FOR UPDATE`.
   - Due ordini concorrenti leggono la stessa giacenza e la sovrascrivono, quindi si vende più di quanto c'è (update perso). Con 2 repliche e 20 connessioni ciascuna è realistico.
   - I `return` alle righe 36 e 37 lasciano un ordine `pending_payment` senza righe né totale. Restano anche le giacenze già scalate per le righe precedenti.
   - Un errore SQL a metà (per esempio una `quantity` frazionaria che non entra nella colonna integer) lascia lo stesso stato sporco.
   - Fix: un'unica transazione su un client del pool, con `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING price`, ed eventuale rollback.

2. **Handler async senza `try/catch`: un errore del database fa cadere il processo.** Riguarda `server/auth.js:6`, `orders.js:6-44` (GET e POST), `products.js:10-49` (tutti gli handler), `reports.js:8` e `webhooks.js:15`.
   - Express 4 non intercetta le promise rifiutate, quindi il middleware di errore in `app.js:15-18` non vede questi errori. In Node 22 una rejection non gestita termina il processo.
   - `requireUser` è su ogni richiesta `/api`: un solo errore del database o una disconnessione abbatte la replica.
   - Solo `PATCH /:id/status` (`orders.js:46-56`) ha il `try/catch`.
   - Mancano anche un handler `unhandledRejection` e un listener `pool.on('error')` (`server/db.js:3`): un errore su un client inattivo è un `error` non gestito.
   - Fix alla causa: un wrapper unico per gli handler async, oppure Express 5.

3. **Il prezzo può essere cambiato anche dal magazzino.** `server/routes/products.js:29` e `35-38`.
   - La route `PATCH /:id` è aperta a `warehouse` e `admin`. Il README dice che i prezzi li cambia solo `admin`.
   - Fix: richiedere `admin` per `price`, oppure separare la route.

4. **`GET /:id/supplier-price` blocca il server e non ha controllo di ruolo.** `server/routes/products.js:21-27`.
   - A ogni richiesta fa `readFileSync` e `JSON.parse` di `data/listino.json` (circa 30 MB), poi una `find` lineare. Il ciclo di eventi resta bloccato per decine o centinaia di ms a richiesta.
   - Non c'è `requireRole`: un utente `shop` legge il prezzo di acquisto dei fornitori, cioè il margine. Questo è anche un problema di autorizzazione.
   - Fix: restringere a `admin` o `warehouse`. Caricare il listino una volta, in una `Map` per sku, e ricaricarlo quando cambia `mtime`, senza bloccare il ciclo di eventi.

5. **`GET /api/reports/sales` perde connessioni.** `server/routes/reports.js:9-10`.
   - Crea un `new Pool` a ogni richiesta e non lo chiude con `end()`, quindi ogni chiamata lascia connessioni aperte fino all'esaurimento di Postgres.
   - Ignora anche il pool condiviso di `db.js`.
   - Fix: usare `db.query`.

6. **Webhook dei pagamenti non idempotente.** `server/routes/webhooks.js:15-24`.
   - Il fornitore ritenta fino a 5 volte. Ogni ritento inserisce un'altra fattura: `invoices` non ha un vincolo unico su `order_id` (`db/migrations/002_orders.sql`).
   - `UPDATE` e `INSERT` non sono in una transazione, quindi un errore dopo il primo può lasciare un ordine pagato senza fattura.
   - Non controlla che l'ordine esista, che l'importo coincida col totale, né lo stato attuale: si può marcare `paid` un ordine `cancelled`.
   - `JSON.parse` e `event.data.metadata.orderId` non sono protetti. Un payload firmato ma malformato manda in crash il processo, per il punto 2.
   - Fix: transazione, `UPDATE ... WHERE status = 'pending_payment' RETURNING`, vincolo `UNIQUE(order_id)` e `INSERT ... ON CONFLICT DO NOTHING`.

7. **`DELETE /api/products/:id` cancella lo storico degli ordini.** `server/routes/products.js:46-49`.
   - `order_items.product_id` ha `ON DELETE CASCADE` (`db/migrations/002_orders.sql`), quindi le righe degli ordini già venduti spariscono.
   - I totali di `orders` e le fatture restano orfani rispetto alle righe.
   - Anche un id inesistente risponde 204.
   - Fix: usare `RESTRICT` o una cancellazione logica (`active`), e rispondere 404 se non esiste.

**P2**

8. **Report vendite, filtro e calcolo.** `server/routes/reports.js:10-21`.
   - La query legge tutte le righe ordine di sempre e filtra le date in JavaScript. Con circa 2.500 ordini al giorno e 25 righe l'una sono oltre 60.000 righe al giorno caricate in memoria a ogni richiesta.
   - Se `from` o `to` mancano o sono invalidi, `new Date` dà `Invalid Date`. I confronti sono sempre falsi, quindi il filtro non esclude nulla e il report copre tutto lo storico.
   - Non filtra per stato: conta anche gli ordini `cancelled` e `pending_payment`.
   - Fix: `WHERE o.created_at BETWEEN $1 AND $2` con `GROUP BY` in SQL, e validazione delle date.

9. **Importi in virgola mobile.** `db/migrations/002_orders.sql` definisce `unit_price real`, mentre `price` e `total` sono `numeric`.
   - `total += p[0].price * l.quantity` (`orders.js:40`) e `revenue` (`reports.js:20`) sommano float.
   - `pg` restituisce `numeric` come stringa, quindi `p[0].price * l.quantity` funziona per coercizione ma è fragile.
   - Fix: `unit_price` in `numeric(10,2)` e calcolo del totale in SQL.

10. **`PATCH /api/orders/:id/status` senza macchina a stati.** `server/routes/orders.js:46-56`.
    - Il magazzino può impostare qualunque stato: `paid` senza pagamento, `shipped` verso `pending_payment`, un ordine `cancelled` di nuovo attivo.
    - Annullare un ordine non ripristina la giacenza.
    - Non c'è 404 per un id inesistente, e un id non numerico dà 500.
    - Il controllo del ruolo `shop` (riga 50) arriva dopo la validazione: funziona, ma conviene usare `requireRole`.
    - Fix: transizioni consentite verificate in SQL (`WHERE status = $old`) e ripristino della giacenza in transazione.

11. **`GET /api/orders` con N+1.** `server/routes/orders.js:15-18`.
    - Fino a 200 query sequenziali per le righe, una per ordine, a ogni richiesta.
    - `req.query.from` non è validato: un valore non data fa errore 500 in Postgres.
    - Fix: una sola query con `WHERE order_id = ANY($1)` oppure `json_agg`, e validazione di `from`.

12. **Validazione di `POST /api/orders` incompleta.** `server/routes/orders.js:23-30`.
    - `quantity` frazionaria (1.5) supera il controllo `> 0`, poi sbatte contro le colonne integer dopo aver già modificato i dati (vedi 1).
    - `productId` non è validato, e la stessa `productId` ripetuta su più righe non è unificata.
    - `lines` può contenere elementi non oggetto: `l.quantity = ...` su `null` fa errore 500.
    - Per ruoli diversi da `shop`, `customerId` arriva dal body senza validazione.
    - Fix: validazione con schema, con `Number.isInteger` e un tetto per quantità.

13. **Aggiornamento assoluto della giacenza.** `server/routes/products.js:31-34` e `42`.
    - Imposta `stock` a un valore assoluto. Se un ordine scala la giacenza nello stesso momento, l'ordine viene perso (update perso).
    - Non c'è 404 per un id inesistente.
    - Fix: aggiornamento relativo, oppure versione ottimistica.

14. **Autenticazione.** `server/auth.js:5-6`.
    - I token sono in chiaro in `sessions` (`db/migrations/001_init.sql`). Fix: salvare l'hash.
    - Nessun rate limit sul login, che è comunque fuori da `server/`.
    - Un token vuoto o assente esegue lo stesso una query: va rifiutato prima.

15. **Migrazione al boot con due repliche.** Nel `Dockerfile` il `CMD` esegue `npm run migrate && node server/app.js` e `db/migrate.js` non ha lock né transazione.
    - Due repliche che partono insieme applicano la stessa migrazione in contemporanea.
    - Un file applicato a metà resta senza riga in `schema_migrations`.
    - `main()` non ha `catch`: l'errore diventa una rejection, e il processo esce con codice 0 anche se la migrazione è fallita, quindi il server parte comunque.
    - Fix: `pg_advisory_lock`, `BEGIN` e `COMMIT` per ogni file, `process.exit(1)` in caso di errore.

16. **Migrazioni incoerenti (fuori da `server/`, ma bloccano l'avvio).**
    - `003_sku.sql` rinomina la colonna `stock` in `qty`, ma `001_init.sql` crea già `qty`. Su un database nuovo la 003 fallisce con «column stock does not exist».
    - `003_sku.sql` aggiunge `sku NOT NULL` senza default su una tabella con righe, e fallisce anche lì.
    - `004_stock.sql` rinomina `qty` in `stock`. Il codice usa `stock`, quindi la sequenza funziona solo se la 003 passa.
    - Non l'ho eseguita: è lettura del SQL, da verificare su un Postgres di prova.

**P3**

17. **Spegnimento e salute del server.** `server/app.js:20`.
    - `app.listen` senza gestione di `SIGTERM`: in un rilascio con repliche si perdono le richieste in corso.
    - Non c'è un endpoint di salute per il bilanciatore, né `helmet`.

18. **Ricerca prodotti.** `server/routes/products.js:15` e `16`.
    - `ILIKE` con `%${q}%` senza escape: `%` e `_` nell'input funzionano da jolly.
    - `ORDER BY name` non è un ordine totale, quindi `OFFSET` dà una paginazione instabile. Aggiungere `id`.

19. **Id non numerici.** Con un `:id` non numerico Postgres dà `invalid input syntax` e quindi 500, invece di 400 o 404. Riguarda tutte le route con `:id`.

20. **Versione di Node.** `Dockerfile` e `package.json`.
    - L'immagine è `node:22.11.0-alpine3.20`: la 22 è LTS supportata, ma la patch è vecchia. Va aggiornata all'ultima 22.x o a una LTS più recente. Non l'ho verificato sulla fonte.
    - `package.json` non ha `engines`.

## Domande aperte

- Dove si fa il login e dove nasce la tabella `sessions`? In `server/` non c'è, quindi non ho verificato scadenza, hash e rate limit.
- Nel flusso reale di `data/listino.json` il file viene sostituito in modo atomico? Una lettura durante la scrittura darebbe un errore di parsing.
- La migrazione 003 è già stata applicata in produzione (punto 16)? Dalla risposta dipende se è un blocco reale o un artefatto della copia.

— AISA-04 · ANTARES
