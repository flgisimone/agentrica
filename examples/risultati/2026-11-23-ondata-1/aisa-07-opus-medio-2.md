AISA-07 · FOMALHAUT — Senior Database Engineer / DBA, reparto AISA (AI Software)

# Rapporto: schema, migrazioni e query del gestionale di magazzino (sola lettura)

**Perimetro.** Ho letto `db/migrate.js`, `db/migrations/001..004` (compresa `004_stock.down.sql`), `server/db.js`, `server/auth.js`, `server/app.js`, `server/routes/*.js`, e anche `Dockerfile`, `deploy/` e `.github/workflows/`, per capire come si applicano le migrazioni. Non ho modificato nulla e non ho avviato processi. Il progetto non ha test (`node --test` non trova file) e la copia non è un repository git, quindi non ho uno stato Git.

**Limiti della prova.** Il direttore AISA-01 non era disponibile, e nemmeno il tool library. Nessuna scheda della biblioteca riguarda questo compito. Non so quali migrazioni siano già applicate in produzione né se lì la tabella `products` abbia dati: per questo alcune priorità dipendono da quella verifica.

## Da segnalare subito (P0, fuori dal mio perimetro, riguardano le credenziali del database)

- **P0, `.github/workflows/ci.yml:39-53`.** Il job `build` scrive `PROD_DATABASE_URL` e `PAYMENTS_WEBHOOK_SECRET` in `.env`, poi lo carica come artifact (`path: .env`). Chi può scaricare gli artifact del repository ottiene le credenziali del database di produzione. Va al Security / Cybersecurity, con la rotazione delle credenziali.
- **P0, `.github/workflows/preview.yml:4-20`.** Usa `pull_request_target`, scarica il codice della PR (anche da fork) ed esegue `npm ci && npm test` con `STAGING_DATABASE_URL`. Codice esterno può leggere il segreto e agire sul database di staging. Va al Security.

## Migrazioni e modo in cui si applicano

1. **P1, `Dockerfile:17` e `db/migrate.js:6-16`.** Le migrazioni partono a ogni avvio del container (`npm run migrate && node server/app.js`). Le repliche sono 2, con `order: start-first` (`deploy/docker-compose.prod.yml:6-9`). `migrate.js` non prende un lock (per esempio `pg_advisory_lock`), quindi due processi possono applicare la stessa migrazione insieme. Il risultato è un errore, o un doppio tentativo che blocca l'avvio di una replica.
2. **P1, `db/migrate.js:13-14`.** Il file SQL e la riga in `schema_migrations` vanno in due query separate, fuori da una transazione comune. Se il processo si ferma fra le due, la migrazione è applicata ma non registrata. All'avvio successivo viene rieseguita, fallisce (per esempio `CREATE TABLE` di un oggetto che esiste già) e, per il `&&` del CMD, il server non parte più. Serve `BEGIN`, poi file e INSERT, poi `COMMIT` su un client dedicato (`pool.connect()`).
3. **P1, `db/migrations/004_stock.sql:2`.** `RENAME COLUMN qty TO stock` è una modifica che rompe la versione precedente, non additiva. Con il deploy `start-first` il nuovo container rinomina la colonna mentre la vecchia replica è ancora in servizio: se quella usa `qty`, le sue query falliscono. In più `deploy/rollback.sh:4` riporta l'immagine `:previous` senza toccare lo schema, quindi dopo un rollback il codice vecchio trova `stock` e non `qty`. Il file `004_stock.down.sql` non è usato da nessuno script (`migrate.js:9` lo esclude e basta). Va seguito il modello expand/contract: aggiungere `stock`, scrivere su entrambe le colonne, togliere `qty` in un rilascio successivo.
4. **P1 se 003 non è ancora applicata su una tabella con dati, `db/migrations/003_sku.sql:2`.** `ADD COLUMN sku text NOT NULL` senza default fallisce se `products` ha righe (ne sono previste circa 12.000). In CI passa solo perché il database è vuoto (`ci.yml:28`). Serve una colonna nullable, poi il backfill, poi `SET NOT NULL`. Anche `CREATE UNIQUE INDEX` senza `CONCURRENTLY` (riga 3) blocca le scritture su `products` durante la creazione.
5. **P2, `db/migrate.js:20`.** `main()` non gestisce gli errori: se una migrazione fallisce, il pool non si chiude e il messaggio è un'eccezione non gestita. Non c'è un log chiaro della migrazione fallita.
6. **P2, `db/migrations/`.** Mancano le down di 001-003. Non c'è una procedura di rollback dello schema né un test in CI che applichi le migrazioni a un database con dati o che provi le down.
7. **P3, `db/migrate.js:9`.** L'ordine viene da un `sort()` lessicografico: regge finché i prefissi restano di 3 cifre. Nessun controllo impedisce che un file già applicato venga modificato (manca un checksum).

## Schema: integrità, vincoli e tipi

8. **P1, `002_orders.sql:16`.** `order_items.product_id ... ON DELETE CASCADE`: `DELETE /api/products/:id` (`products.js:46-48`) cancella anche le righe degli ordini storici. Totali e fatture non corrispondono più alle righe e i report perdono vendite. Serve `ON DELETE RESTRICT` e un campo `archived` sui prodotti.
9. **P1, `002_orders.sql:18`.** `unit_price real`: un tipo in virgola mobile per importi monetari, mentre `products.price` è `numeric(10,2)`. Va usato `numeric(10,2)`. Lo stesso errore c'è in JS: `orders.js:40` somma `price` (una stringa numeric) in float, e `webhooks.js:21` divide `amount / 100` in float.
10. **P1, `002_orders.sql:21-26`.** `invoices.order_id` non è `UNIQUE`. Il fornitore ritenta il webhook fino a 5 volte (`webhooks.js:14`), quindi un ordine può ricevere più fatture. Manca anche una tabella degli eventi già elaborati (id dell'evento univoco) per l'idempotenza.
11. **P2, `001_init.sql:14` (ora `stock`).** Manca `CHECK (stock >= 0)`. È l'ultima difesa contro le giacenze negative causate dalla race del punto 15.
12. **P2, `001_init.sql:23`.** `users.customer_id` è nullable e nessun vincolo lo lega al ruolo. Un utente `shop` senza cliente fa fallire `INSERT INTO orders` (NOT NULL) con un errore non gestito. Serve `CHECK ((role = 'shop') = (customer_id IS NOT NULL))`, o almeno `role <> 'shop' OR customer_id IS NOT NULL`.
13. **P2, `002_orders.sql:6-7`.** `orders.total` è nullable e senza `CHECK (total >= 0)`. Nessun vincolo lega `paid_at` allo stato (`status = 'paid'` implica `paid_at IS NOT NULL`). Nessun vincolo impedisce le transizioni di stato non valide (per esempio da `cancelled` a `paid`, vedi il punto 17).
14. **P3.** Le colonne `serial` andrebbero portate a `identity` (la forma raccomandata in Postgres 16). `customers.email` non ha vincoli: va verificato se deve essere univoca. `sessions.token` è salvato in chiaro, da segnalare al Security (andrebbe conservato come hash).

## Indici

15. **P1, `002_orders.sql:13-19`.** Non c'è un indice su `order_items(order_id)`. `GET /api/orders` (`orders.js:15-18`) fa una query per ordine, fino a 200, e ciascuna scansiona tutta la tabella. Nei picchi si aggiungono circa 62.500 righe al giorno, quindi il problema cresce ogni giorno. Anche join e report ne soffrono.
16. **P2.** Mancano gli indici su `order_items(product_id)` (scansione completa a ogni cancellazione di prodotto, per il CASCADE o il RESTRICT), su `invoices(order_id)` (se non diventa UNIQUE come al punto 10) e su `sessions(user_id)` e `sessions(expires_at)`. Per le sessioni scadute non esiste una pulizia.
17. **P3, `001_init.sql:17` e `products.js:15`.** L'indice btree `products_name_idx` non serve `ILIKE '%q%'`: servirebbe un indice GIN con `pg_trgm`. Con 12.000 righe l'impatto è contenuto. `ORDER BY name` non ha un criterio di parità (`, id`), quindi la paginazione con OFFSET non è stabile sui nomi uguali.

## Query di `server/`

18. **P1, `orders.js:31-43`.** La creazione dell'ordine avviene fuori da una transazione. Se una riga fallisce (prodotto inesistente o giacenza insufficiente, righe 36-37), restano l'ordine in `pending_payment` con `total` NULL, le giacenze già scalate per le righe precedenti e le righe già inserite. Inoltre la giacenza si legge e poi si riscrive con il valore calcolato in JS (righe 35-38), senza lock: con richieste concorrenti si perdono aggiornamenti e si vende più merce di quella disponibile. Serve una transazione su un client dedicato e `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING price`.
19. **P1, `reports.js:9-21`.** Ogni richiesta crea un `new Pool` che non viene mai chiuso: le connessioni si accumulano fino a esaurire `max_connections`. La query carica tutte le righe di `order_items` senza WHERE e filtra le date in JS. Se `from` o `to` mancano o non sono valide, le date sono `Invalid Date`, i confronti danno sempre false e il report include tutto. L'aggregazione va fatta in SQL (`WHERE o.created_at >= $1 AND o.created_at < $2 GROUP BY oi.product_id`) con il pool condiviso.
20. **P1, `webhooks.js:18-22`.** Aggiornamento e insert della fattura avvengono fuori da una transazione e senza idempotenza (punto 10). L'`UPDATE` non controlla lo stato attuale, quindi un ordine `cancelled` o `shipped` torna `paid`. Non c'è nemmeno un confronto fra `amount` e `orders.total`. Se `orderId` non esiste, la violazione della FK produce un errore non gestito e il fornitore ritenta.
21. **P2, `orders.js:6-19`, `orders.js:22-44`, `products.js:10-49`, `auth.js:4-10`.** Gli handler async di Express 4 non hanno `try/catch` (lo ha solo `PATCH /status`). Un parametro non valido (`from` non è una data, `:id` non è numerico, un prezzo oltre `numeric(10,2)`) o un errore del database diventa una rejection non gestita: la richiesta resta appesa e, con Node 22, il processo si chiude.
22. **P2, `orders.js:29`.** Per i ruoli diversi da `shop`, `customerId` arriva dal body senza validazione: il risultato è un errore di FK o NOT NULL non gestito.
23. **P3, `orders.js:51` e `products.js:42`.** Non controllano `rowCount`: con un id inesistente rispondono `ok: true`.
24. **P3, `server/db.js:3`.** 2 repliche per `max: 20` fanno 40 connessioni, più quelle dei pool del punto 19: va verificato il limite del server Postgres.

## Fuori dal perimetro DB (da passare ad altri ruoli)

- **P1, Security: `products.js:29-38`.** Anche `warehouse` può cambiare `price`, mentre il README dice che i prezzi li cambia solo `admin`.
- **P2, Performance: `products.js:24`.** Legge e fa il parsing sincrono di un listino di circa 30 MB a ogni richiesta.

## Riepilogo

- **Sintesi.** 2 P0 sulle credenziali del database (CI e preview, fuori perimetro), 11 P1, 7 P2 e 4 P3 nel perimetro DB. I P1 sono la mancanza di transazioni (creazione degli ordini, webhook, runner delle migrazioni), le migrazioni concorrenti e non retrocompatibili con il rolling deploy, il CASCADE sullo storico degli ordini, `real` per gli importi, le fatture duplicate, l'indice mancante su `order_items(order_id)` e il pool che perde connessioni nei report.
- **File modificati:** nessuno.
- **Test:** nessuno eseguito (il progetto non ne ha e la prova è in sola lettura).
- **Decisioni tecniche:** nessuna. Le correzioni indicate sono proposte da confermare con l'utente e con AISA-01.
- **Rischi e limiti:** non conosco lo stato delle migrazioni né i dati in produzione (i punti 3 e 4 dipendono da questo), né il codice della versione precedente a 3.2.0. Non ho verificato le versioni di Node e Postgres sulla biblioteca, perché il tool library non era disponibile.
- **Attività residue:** il riesame del direttore AISA-01, i P0 al Security e alla Cybersecurity con la rotazione delle credenziali, e un piano di migrazioni correttive additive con test e rollback.

— AISA-07 · FOMALHAUT
