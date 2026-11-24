AISA-07 · FOMALHAUT — Senior Database Engineer / DBA, reparto AISA (AI Software)

Esame in sola lettura di `db/` e delle query in `server/`. Non ho corretto nulla, non ho eseguito test né avviato processi. Non ho consultato la biblioteca (nessuna scheda pertinente). Lavoro su Sonnet: i rilievi P0 e P1 qui sotto vanno riesaminati dal direttore AISA-01 o da un revisore su Opus prima di diventare definitivi.

Percorsi relativi alla copia: `.../copie/aisa-07-sonnet-1`.

## Rilievi

**P0 – Migrazione 003 fallisce su una tabella con dati** (`db/migrations/003_sku.sql:2`)
- `ADD COLUMN sku text NOT NULL` senza DEFAULT fallisce se `products` ha già righe (circa 12.000 in produzione). `migrate.js` lancia poi `npm run migrate` a ogni avvio (`Dockerfile:17`).
- Il container non parte, e il deploy si blocca con un servizio fermo.
- Serve una migrazione in più passi: aggiungere la colonna nullable, riempirla (backfill) dal listino, poi `SET NOT NULL` e l'indice univoco.
- L'indice `CREATE UNIQUE INDEX` (riga 3) blocca le scritture sulla tabella. Su 12.000 righe il blocco è breve, ma va valutato `CONCURRENTLY`, che però non può stare in una transazione.

**P0 – Rinomina della colonna 004 incompatibile con il deploy a due repliche** (`db/migrations/004_stock.sql:2`, `deploy/docker-compose.prod.yml:6-9`)
- `RENAME COLUMN qty TO stock` è un cambio distruttivo di nome, non additivo.
- Il deploy è rolling (`parallelism: 1`, `start-first`): per un periodo la vecchia versione dell'app, che usa `qty`, gira sullo stesso database della nuova. Le query della vecchia versione falliscono (500 su ordini e prodotti).
- Il commento della migrazione dice che il codice usa già `stock` «dalla 3.2.0». Se le versioni precedenti usano `qty`, vale quanto sopra.
- Anche `rollback.sh` riporta l'immagine precedente senza annullare lo schema, e i file `.down.sql` non sono mai applicati (vedi sotto).
- Pattern consigliato: aggiungere `stock`, scrivere su entrambe le colonne, fare il backfill, passare al codice nuovo e rimuovere `qty` in un rilascio successivo.

**P1 – Esecuzione delle migrazioni non transazionale, senza lock e concorrente** (`db/migrate.js:10-16`, `Dockerfile:17`)
- Ogni file SQL e il relativo `INSERT` in `schema_migrations` sono comandi separati, senza `BEGIN/COMMIT`. Se il processo cade tra i due, la migrazione risulta non applicata ma è già stata eseguita; al riavvio si riesegue e fallisce (per esempio «column already exists»).
- Un file con più istruzioni, mandato come una sola query semplice, viene eseguito in una transazione implicita, ma l'`INSERT` resta fuori.
- Con 2 repliche che avviano `npm run migrate` insieme non c'è un advisory lock (`pg_advisory_lock`): entrambe leggono «non applicata» ed eseguono la stessa migrazione. Una delle due fallisce e il container va in crash.
- `main()` non ha `catch`: un errore dà un unhandled rejection e il pool non viene chiuso.
- `readdirSync().sort()` ordina per nome: ok con prefissi a 3 cifre, ma non c'è alcun controllo di numerazione.

**P1 – Ordine creato senza transazione, con race sulla giacenza** (`server/routes/orders.js:31-42`)
- `INSERT orders`, il ciclo di `SELECT stock` e `UPDATE stock`, gli `INSERT order_items` e `UPDATE total` sono query separate sul pool, senza `BEGIN/COMMIT`.
- Se una riga fallisce (prodotto inesistente, giacenza insufficiente, `return res...` a metà ciclo), restano un ordine `pending_payment` con `total NULL`, righe parziali e giacenze già decrementate.
- Il pattern leggi-poi-scrivi (`SELECT stock` poi `UPDATE ... SET stock = $1`) non è atomico: due ordini concorrenti sullo stesso prodotto sovrascrivono la giacenza (lost update) e si può vendere più del disponibile.
- Si risolve con `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING ...` dentro una transazione su un solo client (`pool.connect()`), oppure con `SELECT ... FOR UPDATE`. In caso di giacenze condivise tra più prodotti nello stesso ordine, bloccarli in ordine di `id` per evitare deadlock.
- Mancano `try/catch`/`next(err)` in `router.get("/")` e `router.post("/")`: un errore DB lascia la richiesta appesa o fa cadere il processo, a seconda della gestione degli errori async di Express 4.
- Una cosa va verificata: `l.productId` non è validato (tipo e duplicati nelle righe). Due righe sullo stesso prodotto nello stesso ordine aggravano la race.

**P1 – Webhook di pagamento non idempotente** (`server/routes/webhooks.js:15-24`)
- Il fornitore ritenta fino a 5 volte (commento alla riga 14). Ogni evento `payment.succeeded` fa `UPDATE` e poi `INSERT INTO invoices`, senza controllo.
- Una ripetizione crea fatture duplicate. `invoices` non ha un vincolo `UNIQUE (order_id)` (`002_orders.sql:21-26`) e nessun identificativo evento (`event.id`) viene memorizzato.
- Non è transazionale: `UPDATE` e `INSERT` possono dividersi.
- Un `orderId` inesistente viola la FK e dà 500, quindi nuovi tentativi inutili.
- Mancano controlli sullo stato attuale (ordine già `cancelled` o `shipped` che torna `paid`) e sull'importo rispetto a `orders.total`.
- Servono una tabella `payment_events` con evento univoco (o `UNIQUE (order_id)` su `invoices` con `ON CONFLICT DO NOTHING`), un'unica transazione e una guardia sullo stato.

**P1 – `order_items.unit_price` di tipo `real`** (`002_orders.sql:18`)
- Il prezzo in virgola mobile a 32 bit perde precisione su importi monetari (per esempio 0.1 non è esatto) e gli errori si sommano nelle righe.
- `total` e `invoices.amount` sono `numeric(12,2)`, quindi i totali possono non tornare con la somma delle righe.
- Va portato a `numeric(10,2)` come `products.price`, con la conversione (`ALTER COLUMN ... TYPE numeric(10,2) USING round(unit_price::numeric,2)`) da pianificare. La conversione riscrive la tabella e prende un lock esclusivo.
- Nel codice `p[0].price` arriva da `pg` come stringa (i `numeric` sono stringhe), quindi `total += p[0].price * l.quantity` (`orders.js:40`) concatena/converte in modo fragile; va calcolato con `numeric` in SQL o con un tipo decimale. Questo è un possibile bug di calcolo sul totale: da verificare con un test.

**P1 – Report delle vendite: query non filtrata, nuovo `Pool` a ogni richiesta** (`server/routes/reports.js:9-22`)
- La query legge tutte le righe di `order_items` unite a `orders` senza `WHERE` e filtra le date in JavaScript. A regime: 2.500 ordini al giorno per 25 righe sono circa 62.500 righe al giorno, quindi decine di milioni di righe in un anno caricate in memoria a ogni richiesta.
- Si crea un nuovo `Pool` per ogni richiesta e non viene mai chiuso (`pool.end()` assente): perdita di connessioni al database fino a esaurire `max_connections`. Va riusato `../db`.
- `from` e `to` non sono validati: una data non valida dà `Invalid Date` e il report esce vuoto senza errore.
- L'aggregazione va fatta in SQL: `WHERE o.created_at >= $1 AND o.created_at < $2 GROUP BY oi.product_id`. Il prezzo si somma come `sum(quantity*unit_price)` su `numeric`.
- Il confronto `r.created_at > to` con un `to` a mezzanotte esclude l'intera giornata finale.
- Mancano `try/catch`, e `orders` ha già un indice su `created_at`.

**P2 – Indici mancanti sulle chiavi esterne e sui filtri**
- `order_items.order_id` non ha indice (`002_orders.sql:13-19`). `GET /api/orders` fa una `SELECT` per ordine (N+1, vedi sotto) e il report fa un join: il join e il caricamento delle righe finiscono in scansione completa.
- Mancano indici anche su `order_items.product_id` (il `ON DELETE CASCADE` sui prodotti scansiona l'intera tabella), `invoices.order_id` e `users.customer_id`.
- `sessions.expires_at` non ha indice: serve per ripulire le sessioni scadute (non esiste alcuna pulizia nel codice; la tabella cresce senza limite).
- `orders (status)` non ha indice, e non esiste alcun filtro per stato nel codice, ma operatori di magazzino lo useranno.
- `orders_created_at_idx` (`002_orders.sql:10`) è parzialmente ridondante con `orders_customer_idx`, e serve comunque all'elenco admin.
- Per la ricerca `name ILIKE '%q%'` (`products.js:15`) l'indice `products_name_idx` (btree) non aiuta: con 12.000 righe regge, ma a crescere serve `pg_trgm` con indice GIN.

**P2 – Chiave esterna distruttiva `ON DELETE CASCADE` da prodotti a righe d'ordine** (`002_orders.sql:16`, `products.js:46-49`)
- Cancellare un prodotto (`DELETE /api/products/:id`, riservato ad admin) cancella a cascata tutte le righe d'ordine storiche che lo contengono: ordini già pagati e fatturati perdono le righe, e `orders.total` e fatture non tornano più con le righe.
- Meglio `ON DELETE RESTRICT` e una disattivazione logica (`active boolean` o `deleted_at`).
- `orders.customer_id` e `invoices.order_id` sono senza ON DELETE esplicito, quindi NO ACTION: corretto.

**P2 – N+1 nell'elenco ordini** (`server/routes/orders.js:15-18`)
- Una `SELECT` di righe per ciascun ordine, fino a 200 query per richiesta in serie; senza indice su `order_items.order_id` ciascuna scandisce la tabella.
- Va sostituito con una sola query `WHERE order_id = ANY($1)` o con un join con `json_agg`.
- `LIMIT 200` senza paginazione e `from` non validato: un valore non valido provoca un errore di Postgres (500 non gestito, manca il `try/catch`).

**P2 – Giacenza e prezzo senza vincoli di integrità** (`001_init.sql:10-16`)
- `qty` (poi `stock`) non ha `CHECK (stock >= 0)`: una race o un bug portano la giacenza sotto zero, e il database non lo impedisce. Il controllo è solo nel codice.
- `orders.total` è nullable (`002_orders.sql:6`), mentre un ordine creato resta con `NULL` finché non arriva l'`UPDATE` finale.
- `invoices.amount` non ha `CHECK (amount >= 0)`.
- `orders.paid_at` non è collegato allo stato: nessun vincolo che dica che `paid_at` è valorizzato quando lo stato è `paid`.
- `customers.email` non è `UNIQUE` né ha un controllo di formato (`users.email` sì ha `UNIQUE`).
- `products.price` ha `CHECK (price > 0)`: coerente con il codice.

**P2 – Transizioni di stato dell'ordine non controllate** (`orders.js:46-56`)
- Qualsiasi stato può passare a qualsiasi altro: un ordine `shipped` può tornare `pending_payment`, un ordine `cancelled` può essere spedito.
- La cancellazione non ripristina la giacenza.
- L'`UPDATE` non verifica che l'ordine esista (risponde `ok: true` anche se `rowCount` è 0).
- Il controllo del ruolo (riga 50) viene dopo la validazione ma prima della query: corretto. Un `warehouse` può comunque impostare `paid` senza pagamento.

**P2 – Migrazione 004: file `.down` non applicabile e senza uso** (`004_stock.down.sql`)
- Il filtro `.down.sql` esclude il file dall'elenco, ma non esiste alcun comando che lo esegua: i rollback non sono eseguibili con gli strumenti presenti. Solo 004 ha un `.down` (mancano 001-003).
- `rollback.sh` cambia solo l'immagine Docker; con una migrazione già applicata torna codice vecchio su schema nuovo (vedi P0 su 004).
- La `.down` non è reversibile in presenza di dati né è testata.

**P2 – Pool di connessioni e configurazione** (`server/db.js:3`)
- `max: 20` per replica, due repliche = 40 connessioni, più i container di migrazione e la CI. Con un `max_connections` di default (100) c'è margine, ma con il Pool aggiuntivo di `reports.js` non c'è tetto.
- Mancano `idleTimeoutMillis`, `connectionTimeoutMillis` e `statement_timeout`: una query lenta (il report) occupa connessioni senza limite.
- Nessun gestore dell'evento `error` del pool: un errore su un client inattivo termina il processo Node.
- `DATABASE_URL` non è verificata all'avvio.

**P2 – Sessioni: token in chiaro e senza pulizia** (`001_init.sql:26-30`, `server/auth.js:6`)
- `sessions.token` è salvato e confrontato in chiaro: chi legge il database (o un backup) può usare le sessioni valide. Meglio salvare un hash (`sha256`) del token.
- Nessun indice su `user_id` né su `expires_at`, e nessun job di pulizia delle scadute.
- Questo rilievo è di sicurezza oltre che di schema: da coordinare con il ruolo di sicurezza.

**P2 – Letture del file listino a ogni richiesta** (`server/routes/products.js:21-27`)
- `readFileSync` e `JSON.parse` di circa 30 MB (circa 180.000 voci) a ogni chiamata di `/supplier-price`: blocca l'event loop per centinaia di millisecondi, e `find` lineare sulle voci. Va caricato una volta (con ricarica quando il file cambia) in una `Map`, oppure importato in una tabella `supplier_prices (sku, price)` indicizzata.
- `sku` non ha un `CHECK` sul formato. Nel database `sku` è obbligatorio e univoco: coerente col listino.

**P3 – Altro**
- `PATCH /api/products/:id` costruisce il `SET` dai nomi delle chiavi: oggi `fields` contiene solo `stock` e `price` fissati nel codice, quindi non c'è injection, ma il pattern è fragile se qualcuno aggiunge chiavi dal body.
- `GET /products`: `OFFSET` per la paginazione degrada su cataloghi grandi, e `ORDER BY name` non è deterministico per nomi uguali (aggiungere `id`).
- `serial` va bene su Postgres 16, ma `integer GENERATED ... AS IDENTITY` è la forma raccomandata.
- `customers.vat_number` è `UNIQUE` ma senza controllo di formato.
- Nessun `updated_at` sulle tabelle modificate (`products`, `orders`), e nessun log delle modifiche di prezzo o giacenza.
- `app.js:20` avvia il server senza `listen` callback né gestione di arresto ordinato (SIGTERM): durante il deploy le richieste in corso vengono troncate.

## Cosa non ho potuto verificare
- Non ho un database a disposizione: i rilievi su lock, durata delle migrazioni e plan delle query sono dedotti dal codice. Vanno confermati con `EXPLAIN` su una copia con dati sintetici.
- Non so quali versioni dell'app ci siano in produzione, né se `products` contenga già righe: l'esito di 003 dipende da questo.
- Il README dice che le migrazioni sono applicate «all'avvio del server»: in realtà lo fa il `CMD` del Dockerfile, non `server/app.js`.
- La CI esegue `npm run migrate` su un database vuoto: non prova mai una migrazione su dati esistenti, per questo 003 passa in CI e fallisce in produzione. Manca anche un test di migrazione e di rollback.

## Limiti e prossimi passi
- Sola lettura: nessun file modificato e nessun test eseguito.
- Priorità proposta: prima 003 e 004 (blocco del deploy), poi la transazione degli ordini, l'idempotenza del webhook e il lock delle migrazioni.
- Le correzioni vanno confermate dall'utente. Le modifiche di schema (tipi, FK, vincoli, indici) vanno scritte come migrazioni additive con piano di rollback, e applicate in produzione solo con autorizzazione esplicita.

Firmato: AISA-07 · FOMALHAUT
