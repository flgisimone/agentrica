AISA-07 · FOMALHAUT — Senior Database Engineer / DBA, reparto AISA (AI Software)

Rapporto in sola lettura su `db/` e `server/` (nessun file modificato, nessun processo avviato, nessun test eseguito). Il direttore AISA-01 e la biblioteca non erano disponibili in questa prova. Nessuna scheda della biblioteca riguarda il tema (MCP, TypeScript 7, calendario Node.js).

**Nota sul modello.** Lavoro su un modello più piccolo di quello della sessione. Propongo il riesame del direttore o di un revisore su Opus per i rilievi P0 e P1 (F1, F2, F3, F4, F5, F6) prima che diventino definitivi. Non ho potuto verificare niente su un Postgres reale.

## Rilievi

**F1 · P0 · `server/routes/orders.js:31-42` — creazione ordine senza transazione, con race sulla giacenza**
- INSERT dell'ordine, SELECT e UPDATE delle giacenze, INSERT delle righe e UPDATE del totale sono query separate sul pool, quindi su connessioni diverse e senza `BEGIN`/`COMMIT`.
- Se una riga fallisce (prodotto inesistente, riga 36, o giacenza insufficiente, riga 37), la risposta è 400 o 409 ma restano un ordine `pending_payment` con `total` NULL, le righe già inserite e le giacenze già scalate dalle righe precedenti. Anche un errore del DB lascia lo stato a metà, e il handler non ha try/catch.
- Lettura e scrittura della giacenza (righe 35 e 38) sono un read-modify-write non atomico: `stock = $1` con il valore letto prima. Due ordini concorrenti sullo stesso prodotto si sovrascrivono (lost update) e vendono più di quanto c'è. Con 2.500 ordini al giorno nei picchi e due repliche è un caso realistico.
- Correzione: un'unica transazione su un client dedicato e `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1`, controllando il numero di righe aggiornate. In alternativa `SELECT ... FOR UPDATE`, con i prodotti presi in ordine di id per evitare deadlock.

**F2 · P1 · `db/migrations/003_sku.sql:2` — `ADD COLUMN sku text NOT NULL` senza DEFAULT**
- Su una tabella `products` già popolata (circa 12.000 righe) fallisce con «column contains null values». La migrazione non è applicabile in produzione.
- Per un percorso additivo: aggiungere la colonna nullable, fare il backfill dal listino, poi `SET NOT NULL` e l'indice univoco.
- Per l'indice, valutare `CREATE UNIQUE INDEX CONCURRENTLY`. Questo richiede di eseguire la migrazione fuori da una transazione.
- Il commento dice «richiesto dal listino», ma non c'è nessuna fonte di valori.

**F3 · P1 · `db/migrations/004_stock.sql` e `004_stock.down.sql` — rinomina di colonna non compatibile con il rilascio a repliche**
- Con due repliche e un rolling update (`docker stack deploy`), la nuova immagine esegue il rename a ogni avvio. Le repliche ancora sulla versione vecchia fanno `SELECT/UPDATE ... qty` e vanno in errore finché non sono sostituite. Anche `rollback.sh` riporta il codice vecchio sullo schema nuovo, che non ha più `qty`.
- Serve un approccio expand/contract: aggiungere `stock`, tenerla sincronizzata, passare il codice, rimuovere `qty` in una migrazione successiva.
- Il `.down.sql` esiste ma nessuno lo esegue. `migrate.js` lo ignora (riga 9) e non c'è uno script di rollback. Lo rollback dello schema non è quindi applicabile.

**F4 · P1 · `db/migrate.js:11-14` e `Dockerfile:17` — applicazione delle migrazioni**
- Le migrazioni partono a ogni avvio del container, con due repliche in parallelo. Non c'è un lock: né `pg_advisory_lock` né una transazione. Due repliche possono applicare la stessa migrazione insieme. Il secondo INSERT in `schema_migrations` fallisce per chiave duplicata, mentre il DDL è già stato eseguito due volte (per esempio `CREATE TABLE` che dà errore). Il risultato è un container che non parte.
- File e INSERT nella tabella delle migrazioni non sono nella stessa transazione. Se il processo cade tra le due query, la migrazione risulta non applicata, ma lo schema è stato modificato. Al riavvio fallisce e blocca il deploy.
- `main()` non ha catch. L'errore diventa un unhandled rejection e il pool resta aperto. Il codice di uscita va verificato: con Node 22 è 1, ma non c'è alcun messaggio controllato.
- Non c'è controllo di checksum dei file già applicati, quindi una migrazione modificata a posteriori passa inosservata.
- Il file viene eseguito con una sola `pool.query` (multi-statement, accettato solo senza parametri), e ogni file dovrebbe stare in una transazione.
- Correzione: un job di migrazione separato e unico prima del deploy delle repliche, oppure advisory lock più transazione per ogni file.

**F5 · P1 · `server/routes/webhooks.js:15-23` — webhook non atomico e non idempotente**
- Il fornitore ritenta fino a 5 volte. Ogni ritentativo, e anche ogni consegna duplicata, fa un nuovo INSERT in `invoices`. Una fattura duplicata è un difetto di integrità contabile.
- Mancano un vincolo `UNIQUE (order_id)` su `invoices` e un campo o tabella per l'id evento del fornitore.
- L'UPDATE dell'ordine e l'INSERT della fattura non sono in una transazione. Se il secondo fallisce, l'ordine risulta pagato senza fattura, e al ritentativo l'UPDATE si ripete.
- Non si controlla che l'ordine esista (0 righe aggiornate non è un errore) né che sia in `pending_payment`. Un evento su un ordine annullato o già spedito lo riporta a `paid`. L'importo dell'evento non è confrontato con `orders.total`.
- Se `orderId` manca, l'INSERT fallisce con errore 500 e il fornitore ritenta inutilmente.
- Il handler non ha try/catch, e Express 4 non intercetta le promise rifiutate.
- Correzione: transazione, `INSERT ... ON CONFLICT (order_id) DO NOTHING` e `UPDATE ... WHERE id = $1 AND status = 'pending_payment'`.

**F6 · P1 · `db/migrations/002_orders.sql:18` — `order_items.unit_price` di tipo `real`**
- È un float a 4 byte per un importo monetario. L'errore di arrotondamento si accumula nei totali e nei report (`reports.js:20`), e non coincide con `numeric(10,2)` di `products.price`.
- Dovrebbe essere `numeric(10,2)`, con la migrazione di conversione e verifica dei dati esistenti.

**F7 · P2 · `db/migrations/002_orders.sql:16` — `order_items.product_id ... ON DELETE CASCADE`**
- Cancellare un prodotto (`products.js:46`, `DELETE`, solo admin) elimina silenziosamente le righe d'ordine storiche. I totali di ordini e fatture restano ma le righe spariscono, e i report cambiano retroattivamente.
- Meglio `ON DELETE RESTRICT` (o `NO ACTION`) e un campo `active`/`archived` per i prodotti.
- Gli ordini non sono stati ancora risolti sui prodotti con cui si è già venduto.

**F8 · P2 · `server/routes/reports.js:8-23` — report in memoria e pool nuovo a ogni richiesta**
- Il filtro per date è applicato in JavaScript dopo aver caricato tutte le righe di `order_items` unite a `orders`, senza `WHERE`. Con 2.500 ordini al giorno e 25 righe medie sono circa 60.000 righe al giorno, che crescono senza limite.
- Dovrebbe essere un `GROUP BY product_id` con `WHERE o.created_at >= $1 AND o.created_at < $2` in SQL, che userebbe `orders_created_at_idx`.
- Si crea un `new Pool` a ogni richiesta e non si chiude mai: perdita di connessioni (fino a 10 per richiesta) fino a esaurire `max_connections`. Va usato il pool condiviso di `db.js`.
- Mancano la validazione di `from` e `to` (una `Invalid Date` fa scartare tutto) e il try/catch.
- Il calcolo del fatturato con `real` e `Number` accumula errori (vedi F6). Il report include anche gli ordini annullati e non pagati.

**F9 · P2 · `server/routes/orders.js:15-18` — N+1 e lista senza paginazione reale**
- Una query per ogni ordine, fino a 201 query per richiesta. Basta una `WHERE order_id = ANY($1)` o un `JOIN` con aggregazione JSON.
- Manca l'indice su `order_items(order_id)`: la FK non crea un indice in Postgres e ogni query fa un seq scan sulla tabella più grande. Manca anche su `invoices(order_id)` e su `order_items(product_id)`, necessario per i delete e per i report.
- `from` arriva dal client senza validazione. Un valore non valido produce un errore 500 non gestito (nessun try/catch).
- `LIMIT 200` senza cursore: gli ordini più vecchi non sono raggiungibili.

**F10 · P2 · `server/routes/products.js:21-27` — lettura da 30 MB del listino a ogni richiesta**
- `readFileSync` più `JSON.parse` di circa 30 MB, bloccanti sul event loop, a ogni apertura di una scheda prodotto, poi ricerca lineare con `find`.
- Il listino è già dato di database in sostanza: andrebbe importato in una tabella (`supplier_prices(sku, price)`) con indice, aggiornata dal job giornaliero, oppure tenuto in cache e indicizzato in memoria.
- Il file è copiato nell'immagine (`Dockerfile:13`), quindi l'aggiornamento giornaliero non raggiunge le repliche. Il file letto è quello dell'immagine.

**F11 · P2 · `db/migrations/002_orders.sql:6-7` — `orders.total` e `invoices.amount` senza vincoli**
- `total` è nullable (resta NULL per ordini falliti, vedi F1), senza `CHECK (total >= 0)`. `invoices.amount` non ha `CHECK (amount > 0)`.
- `status` ha un `CHECK` ma le transizioni non sono vincolate: `PATCH /:id/status` (`orders.js:46-56`) permette qualunque salto (per esempio `shipped` a `pending_payment`, o a `paid` senza passare dal pagamento). Il vincolo di coerenza `paid_at IS NOT NULL` per gli stati pagati manca.
- Un ordine annullato non rimette in giacenza le quantità.
- `PATCH` non controlla l'esito: restituisce `ok` anche se l'id non esiste.

**F12 · P2 · `db/migrations/001_init.sql` e `server/routes/products.js:29-44` — vincoli e tipi mancanti**
- `products.qty` (poi `stock`) non ha `CHECK (qty >= 0)`: nulla impedisce a una race (F1) di portare la giacenza sotto zero.
- `customers.email` non è univoco né validato. `users.customer_id` è nullable anche per il ruolo `shop`: manca un `CHECK ((role = 'shop') = (customer_id IS NOT NULL))`. Un utente `shop` senza cliente produrrebbe `customer_id = NULL` negli ordini.
- `sessions.token` è salvato in chiaro (meglio hash). Manca un indice su `sessions(expires_at)` e sui `user_id` per la pulizia. Le sessioni scadute non vengono mai cancellate.
- `serial` (int4) per gli id: `order_items` crescerebbe di circa 60.000 righe al giorno, cioè circa 22 milioni all'anno, vicino al limite dei 2,1 miliardi solo dopo molti anni, ma conviene `bigint`/identity per le tabelle che crescono.
- `PATCH /api/products/:id` consente `price` anche al ruolo `warehouse` (`requireRole("warehouse", "admin")`, riga 29), mentre il README dice che i prezzi li cambia solo `admin`. La regola è violata a livello di applicazione, senza traccia dei cambi di prezzo.

**F13 · P3 · `server/db.js:3` e `server/routes/products.js:14-16` — pool e ricerca**
- `max: 20` per replica, 40 in totale, vanno confrontati con `max_connections`. Mancano `statement_timeout`, `idle_timeout` e un handler per `pool.on('error')`.
- `name ILIKE '%q%'` non usa `products_name_idx` (B-tree): serve `pg_trgm` con indice GIN. `OFFSET` cresce linearmente con la pagina. Il carattere `%`/`_` nel termine di ricerca non è escapato.
- `ORDER BY name` non è deterministico per nomi uguali: serve un secondo criterio (`id`).
- `orders_created_at_idx` è ridondante rispetto a `orders_customer_idx` solo in parte (il secondo parte da `customer_id`), quindi resta utile per le query degli admin. `orders.status` non è indicizzato, e le viste del magazzino per stato faranno scansioni complete.

**F14 · P3 · `server/auth.js:6` — query di sessione senza gestione degli errori**
- `requireUser` è async senza try/catch: un errore del DB lascia la richiesta appesa o fa cadere il processo, con Express 4. Manca anche l'indice su `sessions.user_id`.

## Riepilogo
- Gravità: 1 P0, 5 P1, 6 P2, 2 P3.
- Rischi principali da confermare con l'utente: ordini e giacenze incoerenti (F1), migrazioni non applicabili o non sicure in produzione (F2, F3, F4), fatture duplicate (F5).
- Limiti: non ho eseguito nulla né aperto un database. I rilievi derivano dalla lettura del codice e dei file di migrazione. Non ho esaminato `data/listino.json` (30 MB) né il contenuto di `web/`, `.github/` e `docker-compose.prod.yml` oltre alla ricerca di `migr`. Le righe indicate fanno riferimento ai file letti.
- Attività residue: piano di correzione e rollback per ogni migrazione, da sottoporre all'approvazione dell'utente prima di toccare qualunque ambiente. Per il percorso dei dati personali (email, sessioni) serve il coinvolgimento della Privacy & Compliance Agency.

— AISA-07 · FOMALHAUT
