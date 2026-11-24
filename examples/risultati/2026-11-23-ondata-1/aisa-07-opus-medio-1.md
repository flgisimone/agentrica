AISA-07 · FOMALHAUT — Senior Database Engineer / DBA, reparto AISA (AI Software)

Nota sulla prova: il direttore AISA-01 e il tool library non erano disponibili, quindi ho lavorato direttamente come specialista. Non ho letto le schede della biblioteca, ma nessuna riguarda questo compito. Ho lavorato in sola lettura: non ho modificato file e non ho avviato processi.

**Contesto verificato.** La copia non è un repository git e non contiene `CLAUDE.md`. Lo stack dichiarato nel README è Node 22, Express 4, `pg` 8.13 e Postgres 16. Le migrazioni si applicano a ogni avvio del container (`npm run migrate && node server/app.js`), con 2 repliche aggiornate in `start-first`. Lo script `npm test` (`node --test`) esiste, ma nella copia non c'è nessun file di test: schema e query non sono coperti. Il README indica circa 2.500 ordini al giorno con 25 righe in media, cioè circa 62.000 righe al giorno in `order_items`.

Percorso base: `<cartella di prova>/copie/aisa-07-opus-medio-1/`

## Rilievi: migrazioni e loro applicazione

**F-01 · P1 · `db/migrate.js:6-17` e `Dockerfile:17`.** Il runner delle migrazioni non usa né lock né transazioni.
- **Due repliche in parallelo.** Ogni replica esegue `migrate` all'avvio, e senza `pg_advisory_lock` due container possono applicare la stessa migrazione insieme. Con `start-first` e uno scaling a 2 basta un avvio contemporaneo. Su una DDL non idempotente come `RENAME` o `CREATE TABLE`, la seconda istanza fallisce, il container non parte e va in loop di riavvio.
- **File e registrazione non atomici.** Il file SQL (r.13) e l'`INSERT` in `schema_migrations` (r.14) sono due query separate. Se il processo cade fra le due, la migrazione risulta applicata ma non registrata, e al riavvio fallisce con «already exists».
- **Errori senza gestione.** `main()` non ha `catch` e il pool non si chiude in caso di errore.
- **Nessuna checksum.** Una migrazione già applicata e poi modificata viene ignorata in silenzio.

Proposta: lock advisory, `BEGIN`/`COMMIT` per ogni file insieme alla registrazione, checksum, e migrazione come passo unico del deploy invece che all'avvio di ogni replica.

**F-02 · P1 · `db/migrations/003_sku.sql:2`.** `ADD COLUMN sku text NOT NULL` non ha default né backfill. Su una tabella `products` già popolata (circa 12.000 righe) la migrazione fallisce e, per F-01, blocca l'avvio dell'applicazione. Se sui dati esistenti è passata, `sku` era già popolato altrove, ma la migrazione non è riproducibile. Sequenza corretta: colonna nullable, backfill, `CREATE UNIQUE INDEX CONCURRENTLY`, poi `SET NOT NULL` (in sicurezza dopo un `CHECK ... NOT VALID` validato).

**F-03 · P1 · `db/migrations/004_stock.sql:2`, `deploy/docker-compose.prod.yml:7-9`, `deploy/rollback.sh:4-5`.** La rinomina `qty` → `stock` è una modifica che rompe la compatibilità, non additiva.
- **Durante il rolling update.** Con `order: start-first` la replica nuova rinomina la colonna mentre quella vecchia (codice precedente alla 3.2.0, che usa `qty`) serve ancora richieste, che falliscono.
- **Rollback.** `rollback.sh` riporta solo l'immagine `:previous` e lascia lo schema con `stock`: la versione precedente non funziona.
- **Migrazione inversa mai eseguita.** `004_stock.down.sql` non viene eseguita da niente (`migrate.js:9` scarta i `.down.sql` e non esiste un comando down). Inoltre 001-003 non hanno una migrazione inversa.

Proposta: schema expand/contract, cioè nuova colonna o vista compatibile, doppia scrittura, rimozione in un rilascio successivo. Il piano di rollback deve includere lo schema.

## Rilievi: schema, vincoli e tipi

**F-04 · P1 · `db/migrations/002_orders.sql:16` e `server/routes/products.js:46-48`.** `order_items.product_id ... ON DELETE CASCADE`: il `DELETE /api/products/:id` dell'admin cancella le righe degli ordini storici. Gli ordini restano con un `total` che non corrisponde più alle righe, e fatture e report diventano incoerenti. Serve `ON DELETE RESTRICT` (o il default `NO ACTION`) e l'archiviazione logica del prodotto (`archived_at`).

**F-05 · P1 · `db/migrations/002_orders.sql:18`.** `unit_price real` è un tipo a virgola mobile a 4 byte per un importo monetario: perde centesimi rispetto a `products.price numeric(10,2)`. Il calcolo dei totali e del fatturato in JS somma float (`orders.js:40`, `reports.js:20`). Serve `numeric(10,2)` e somme fatte in SQL.

**F-06 · P1 · `db/migrations/002_orders.sql:21-26` e `server/routes/webhooks.js:18-22`.** `invoices.order_id` non ha `UNIQUE`. Il fornitore ritenta fino a 5 volte e il webhook non è idempotente, quindi a ogni ritentativo nasce una fattura doppia. Servono `UNIQUE (order_id)` (o una tabella degli eventi con `event_id` univoco), `INSERT ... ON CONFLICT DO NOTHING` e `UPDATE` + `INSERT` in un'unica transazione. Inoltre manca il controllo che l'ordine esista, sia in `pending_payment` e che l'importo coincida con `total`: un `orderId` inesistente fa fallire l'FK senza `catch`. Infine manca un indice su `invoices.order_id`.

**F-07 · P2 · `db/migrations/001_init.sql:14`.** La giacenza (`qty`, ora `stock`) non ha `CHECK (stock >= 0)`. Il database non impedisce giacenze negative; il rischio si somma alla race di F-10.

**F-08 · P2 · `db/migrations/002_orders.sql:15`, `16`, `23`, `001_init.sql:28`.** Mancano indici sulle FK: `order_items.order_id` (letto per ogni ordine in `orders.js:16`, tabella da circa 62.000 righe al giorno), `order_items.product_id` (cancellazioni e report per prodotto), `invoices.order_id`, `sessions.user_id`. Le letture e le cancellazioni a cascata fanno scansioni sequenziali.

**F-09 · P2 · `db/migrations/001_init.sql:19-24`.** `users.customer_id` è nullable e nessun vincolo lega il ruolo al cliente. Un utente `shop` senza cliente vede zero ordini (`customer_id = NULL`) e alla creazione di un ordine provoca una violazione `NOT NULL` non gestita. Proposta: `CHECK ((role = 'shop') = (customer_id IS NOT NULL))`, o almeno `role <> 'shop' OR customer_id IS NOT NULL`.

**F-10 · P3 · `db/migrations/002_orders.sql:5-7`.** Lo stato dell'ordine non ha vincoli di coerenza con `paid_at`, per esempio `CHECK (status IN ('pending_payment','cancelled') OR paid_at IS NOT NULL)`. `total` è nullable e viene scritto in un secondo momento (vedi F-11).

**F-11 · P3 · `db/migrations/001_init.sql`.**
- `users.email` è univoco con distinzione fra maiuscole e minuscole: servono `citext` o un indice univoco su `lower(email)`.
- `sessions` non ha un indice su `expires_at` per la pulizia delle sessioni scadute, e il token è salvato in chiaro (da girare al Security Engineer).
- Si usa `serial` invece di `GENERATED ... AS IDENTITY` (solo pulizia).

## Rilievi: query in `server/`

**F-12 · P1 · `server/routes/orders.js:22-44`.** La creazione dell'ordine non usa una transazione e ha una race sulla giacenza.
- **Aggiornamenti persi.** Le righe 35-38 leggono `stock` e poi scrivono `stock = valore letto - quantità`: due ordini concorrenti sovrascrivono l'uno l'aggiornamento dell'altro e si vende merce che non c'è.
- **Ordini parziali.** Con un 400 o un 409 a metà ciclo (r.36-37) l'ordine resta creato in `pending_payment`, con righe parziali e giacenze già scalate, senza rollback.
- **Quantità non intere.** `quantity` non è validata come intero (`Number(1.5) > 0` passa), quindi un decimale arriva al database e va in errore.
- **Errori non gestiti.** Manca il `try`/`catch`: in Express 4 un errore async non arriva all'error handler e, in Node 22, la promise rifiutata fa terminare il processo.
- **Cliente dal body.** `req.body.customerId` (per admin e warehouse) non è validato.

Proposta: `BEGIN`, poi `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING price` riga per riga (con gli id in ordine, per evitare deadlock), poi `INSERT` delle righe, `total` calcolato in SQL e `COMMIT`.

**F-13 · P1 · `server/routes/reports.js:9-21`.**
- **Pool per richiesta.** A ogni richiesta si crea un `new Pool` che non viene mai chiuso: le connessioni si accumulano fino a esaurire `max_connections`, e si aggiungono ai 2 × 20 dei pool condivisi.
- **Intera tabella in memoria.** La query carica tutta `order_items JOIN orders`, cioè milioni di righe nel tempo, e filtra e aggrega in JS.
- **Date non valide.** Con `from` o `to` mancanti o non validi i confronti con `Invalid Date` sono sempre falsi, quindi il report include tutto.
- **Ordini non pagati.** Il report conta anche gli ordini `cancelled` e `pending_payment`.

Proposta: pool condiviso di `server/db.js` e `SELECT product_id, sum(quantity), sum(quantity * unit_price) ... WHERE o.created_at >= $1 AND o.created_at < $2 AND o.status IN (...) GROUP BY product_id`, con date validate.

**F-14 · P2 · `server/routes/orders.js:6-20`.** La lista degli ordini fa N+1 query: fino a 201 query per richiesta, senza indice su `order_items.order_id` (F-08). Basta un'unica query con `WHERE order_id = ANY($1)` o con `json_agg`. `from` non è validato, e una data non valida produce un errore Postgres non gestito che fa cadere il processo.

**F-15 · P2 · `server/routes/orders.js:46-56`.**
- **Cambi di stato liberi.** `PATCH status` non ha una macchina a stati: si può segnare `paid` senza pagamento (senza `paid_at`) o tornare da `shipped` a `pending_payment`.
- **Annullamento.** `cancelled` non rimette le quantità in giacenza.
- **Ordine inesistente.** Se l'ordine non esiste la risposta è comunque `ok`, perché non si controlla `rowCount`.

Proposta: `UPDATE ... WHERE id = $2 AND status = ANY(<stati ammessi come origine>)` e controllo di `rowCount`.

**F-16 · P2 · `server/routes/products.js:15` e `001_init.sql:17`.** `name ILIKE '%q%'` non usa l'indice btree `products_name_idx`, quindi su 12.000 prodotti fa una scansione sequenziale. Serve un indice GIN `pg_trgm` su `name`. Il btree resta utile per `ORDER BY name`.

**F-17 · P1, da girare al Security Engineer · `server/routes/products.js:29, 35-38`.** Fuori dal mio perimetro stretto, ma tocca i dati. Il `PATCH` permette anche al ruolo `warehouse` di cambiare `price`, mentre il README dice che i prezzi li cambia solo `admin`.

**Nota fuori perimetro (Performance).** `products.js:24` legge e analizza in modo sincrono un JSON di circa 30 MB a ogni richiesta.

## Riepilogo AISA-07 · FOMALHAUT

**Sintesi.** Ho trovato 17 rilievi: 8 P1, 6 P2 e 2 P3, oltre a F-17 (P1) da girare al Security Engineer.
- **Più urgenti.** Il runner delle migrazioni, che non usa né lock né transazioni e gira su 2 repliche all'avvio (F-01). Le migrazioni 003 e 004, non riproducibili o non compatibili all'indietro, con un rollback che non tocca lo schema (F-02, F-03).
- **Perdita o corruzione di dati.** La cascata da prodotto alle righe d'ordine (F-04), gli importi in `real` (F-05), le fatture doppie dal webhook (F-06), la creazione dell'ordine senza transazione e con race sulla giacenza (F-12).
- **Esaurimento delle connessioni.** Il pool creato a ogni richiesta nei report (F-13).

Non ci sono rilievi P0 accertati. F-04, F-06 e F-12 possono diventarlo in produzione, perché producono dati persi o incoerenti.

**File modificati:** nessuno.

**Test eseguiti:** nessuno. Nel progetto non ci sono test e il compito era in sola lettura; le conclusioni vengono dalla lettura del codice.

**Decisioni tecniche proposte, da confermare con l'utente:**
- migrazione come passo unico del deploy, con lock e transazione;
- schema expand/contract per le rinomine;
- `numeric` per tutti gli importi;
- vincoli `UNIQUE` e `CHECK` sopra elencati;
- `ON DELETE RESTRICT` con archiviazione logica dei prodotti;
- transazioni su ordine e webhook.

**Rischi e limiti:**
- Non ho potuto verificare lo stato reale dello schema in produzione, per esempio se la 003 sia stata applicata su una tabella vuota.
- Il comportamento di Postgres e di Node l'ho descritto a memoria, perché nessuna scheda della biblioteca copre questi temi e non avevo accesso al web: va confermato sulla documentazione ufficiale.
- Lavoro su Opus, lo stesso modello della sessione.

**Attività residue:**
- Correzioni a cura dello sviluppo (sw-database-engineer, sw-backend-developer) dopo la conferma dell'utente.
- Test di integrazione su Postgres in CI per la concorrenza sulla giacenza, l'idempotenza del webhook e le migrazioni da database vuoto e da database popolato.
- Revisione Security per F-17 e per i token in chiaro.

— AISA-07 · FOMALHAUT
