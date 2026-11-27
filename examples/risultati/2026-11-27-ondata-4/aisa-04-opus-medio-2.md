AISA-04 · ANTARES — Senior Backend Developer, reparto AISA (AI Software)

# Revisione del codice server in `server/` (sola lettura)

**Esito:** ho trovato 7 difetti P1, 8 P2 e 4 P3. Fuori dal mio perimetro ce n'è anche uno P0 (segreti di produzione esposti dalla CI): lo metto per primo perché va visto subito.

**Come ho lavorato:** ho letto `server/` per intero, più `README.md`, `package.json`, `db/migrations/`, `db/migrate.js`, `Dockerfile`, `deploy/docker-compose.prod.yml` e `.github/workflows/ci.yml` per capire il contesto. Non ho modificato nulla e non ho eseguito test: il progetto non ha `node_modules`, non è un repository git e non contiene test. Non ho potuto caricare il direttore AISA-01 · SIRIUS perché qui il server MCP non c'è: questo rapporto è la consegna per lui.

Il percorso di base è `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/1b8e243c-033a-4357-b227-0a46d80b6791/scratchpad/ondata4/copie/aisa-04-4/`; nei rilievi i percorsi partono da lì.

## Da segnalare subito, fuori perimetro (P0)

- **`.github/workflows/ci.yml:39-53`.** Il job `build` scrive `PROD_DATABASE_URL` e `PAYMENTS_WEBHOOK_SECRET` in `.env`. Poi lo carica come artifact (`upload-artifact`, `path: .env`), che chiunque abbia accesso in lettura al repository può scaricare. Così la connessione al database di produzione e il segreto del webhook sono esposti, e con quel segreto si possono falsificare pagamenti. Va al Security Engineer e al DevOps: rimuovere l'artifact, cambiare i segreti e controllare chi ha scaricato gli artifact.

## Rilievi in `server/`

### P1

1. **Errori asincroni non gestiti: l'istanza si ferma.** Express 4 non intercetta i rifiuti delle funzioni `async`. Senza `try/catch`, qualunque errore del database lascia la richiesta senza risposta e produce un rifiuto non gestito. Con Node 22 questo per impostazione predefinita fa terminare il processo.
   - Dove: `server/auth.js:4-10`, `server/routes/orders.js:6` e `:22`, `server/routes/products.js:10, 21, 29, 46`, `server/routes/reports.js:8`, `server/routes/webhooks.js:15`. Solo `orders.js:46` passa l'errore a `next`.
   - Come si innesca: basta un utente `shop` che invia `quantity: 1.5`. La quantità passa `> 0` (`orders.js:26-27`) e l'`UPDATE` con un valore decimale su una colonna intera fallisce. Lo stesso vale per `productId` o `from` non validi, per `stock` oltre l'intero a 32 bit, per un `price` oltre `numeric(10,2)` e per un database irraggiungibile.
   - Correzione proposta: un wrapper `async` o un passaggio a Express 5, più la validazione dei dati in ingresso.

2. **La creazione dell'ordine non è in una transazione e la giacenza può andare sotto zero** (`server/routes/orders.js:31-43`).
   - La giacenza viene letta e poi riscritta in due passi separati (`SELECT stock` alla riga 35, `SET stock = $1` alla riga 38). Con richieste concorrenti e due repliche si perdono aggiornamenti e si vende più merce di quella disponibile.
   - I `return` 400 e 409 alle righe 36-37 arrivano dopo l'`INSERT` dell'ordine e dopo aver già scalato la giacenza delle righe precedenti. Restano ordini orfani in `pending_payment` con `total` NULL, e la giacenza non torna indietro.
   - Correzione proposta: `BEGIN`/`COMMIT` su un client del pool, con `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING price` (o `SELECT … FOR UPDATE` in ordine di id per evitare deadlock) e `ROLLBACK` su ogni uscita anticipata.

3. **Il webhook dei pagamenti non è idempotente** (`server/routes/webhooks.js:18-22`). Il fornitore ritenta fino a 5 volte, come dice il commento alla riga 14.
   - Ogni nuovo invio, e ogni replay di un evento firmato, inserisce un'altra riga in `invoices`. Non c'è un vincolo univoco su `invoices.order_id` (`db/migrations/002_orders.sql:21-26`) né un registro degli `event.id`.
   - I due statement non sono in transazione.
   - Lo stato dell'ordine non viene controllato: un ordine `cancelled` torna `paid`.
   - L'importo `event.data.amount` non viene confrontato con `orders.total`.
   - Correzione proposta: una tabella degli eventi elaborati (o `UNIQUE (order_id)` con `ON CONFLICT DO NOTHING`), una transazione, `UPDATE … WHERE status = 'pending_payment'` e la verifica dell'importo.

4. **`warehouse` può cambiare i prezzi** (`server/routes/products.js:29` e `:35-38`). La rotta richiede `requireRole("warehouse", "admin")` e accetta `price` da entrambi i ruoli, ma il `README.md` dice «I prezzi li cambia solo `admin`». Serve un controllo del ruolo sul campo `price`.

5. **I prezzi d'acquisto dei fornitori sono visibili ai negozi** (`server/routes/products.js:21-27`). `/:id/supplier-price` non ha `requireRole`: qualunque utente `shop` legge i prezzi d'acquisto, quindi i margini del distributore. Va limitata almeno a `admin`, ed eventualmente a `warehouse`, con conferma dell'utente sui ruoli.

6. **Il listino da 30 MB viene letto in modo sincrono a ogni richiesta** (`server/routes/products.js:24-25`). `readFileSync` più `JSON.parse` su circa 180.000 voci, poi una `find` lineare: l'event loop resta bloccato per tutti, con picchi di memoria alti. Dato il punto 5, basta un negozio che ripete la chiamata per degradare il servizio.
   - Mentre il job esterno riscrive il file, il parse può trovare un JSON troncato: l'errore porta al punto 1.
   - Correzione proposta: caricare il listino una volta in una `Map` per sku e ricaricarlo quando il file cambia (scrittura atomica lato job), oppure importarlo in una tabella.

7. **Il report delle vendite legge tutto lo storico in memoria** (`server/routes/reports.js:10-21`). Carica tutte le `order_items` senza alcun filtro (circa 62.500 righe al giorno nei picchi) e filtra in JavaScript. Con il tempo diventa lento e può esaurire la memoria della replica.
   - `from` e `to` non sono validati: se mancano o non sono date valide, i confronti con `Invalid Date` sono sempre falsi e il report restituisce in silenzio i totali di tutto lo storico.
   - Correzione proposta: `WHERE o.created_at >= $1 AND o.created_at < $2 GROUP BY oi.product_id` (sfrutta `orders_created_at_idx`), con validazione delle date.

### P2

8. **Un pool di connessioni nuovo a ogni richiesta** (`server/routes/reports.js:9`). Il pool non viene chiuso e non usa quello condiviso di `server/db.js`. I client inattivi si chiudono dopo circa 10 secondi (default di `pg`), ma richieste ravvicinate aprono connessioni oltre il limite previsto (20 per 2 repliche) e possono esaurire `max_connections`. Inoltre nessun pool ha un gestore `'error'`.

9. **Un errore del pool ferma il processo** (`server/db.js:3`). Manca `pool.on("error", …)`: l'errore di un client inattivo (riavvio di Postgres, rete) fa terminare il processo.

10. **Cancellare un prodotto cancella le righe degli ordini storici** (`server/routes/products.js:46-49`). È un `DELETE` fisico e `order_items.product_id` ha `ON DELETE CASCADE` (`db/migrations/002_orders.sql:16`). Spariscono righe di ordini già fatturati, e totali e report non tornano più. Il difetto è nello schema, ma è la rotta che lo attiva.
    - Correzione proposta: disattivazione logica (`active = false`) o `ON DELETE RESTRICT`, da valutare con il Database Engineer.

11. **Il cambio di stato dell'ordine non ha regole** (`server/routes/orders.js:46-56`).
    - Qualunque transizione è permessa: `warehouse` può segnare `paid` senza pagamento e un ordine `shipped` può tornare `pending_payment`.
    - `cancelled` non restituisce la giacenza.
    - Se l'id non esiste la risposta è comunque `{ ok: true }`.
    - Correzione proposta: una tabella delle transizioni ammesse, `paid` solo dal webhook, il ripristino della giacenza all'annullamento e un 404 quando nessuna riga viene aggiornata.

12. **Dati dell'ordine non validati** (`server/routes/orders.js:23-29`).
    - `quantity` non è controllata come intero finito (passano `1.5` e `1e400`, cioè `Infinity`).
    - `productId` non è validato.
    - Righe con lo stesso prodotto non vengono unite.
    - Per `warehouse` e `admin`, `customerId` arriva dal corpo della richiesta senza verificare che il cliente esista. Se manca, la violazione di `NOT NULL` porta al punto 1.

13. **N+1 query nell'elenco ordini** (`server/routes/orders.js:15-18`). Fino a 201 query per richiesta. Basta una query con `order_id = ANY($1)`, oppure una JOIN con `json_agg`. Anche `from` va validato (riga 7).

14. **Importi calcolati e salvati in virgola mobile.**
    - `unit_price` è `real` (`db/migrations/002_orders.sql:18`) mentre `price` è `numeric`.
    - Il totale è sommato in JavaScript (`server/routes/orders.js:40`, `server/routes/reports.js:20`).
    - Ci sono errori di arrotondamento su fatture e report. Il calcolo andrebbe fatto in SQL con `numeric`, o in centesimi interi.

15. **Il webhook si ferma se manca il segreto o se il corpo non è un buffer** (`server/routes/webhooks.js:8`). Se `PAYMENTS_WEBHOOK_SECRET` non è impostato, `createHmac` riceve `undefined` e lancia un'eccezione, che porta al punto 1. Lo stesso accade se il `Content-Type` non è `application/json`: `req.body` non è un Buffer e `update` lancia. Conviene controllare il segreto all'avvio e il tipo del corpo nella rotta.

### P3

16. **Token di sessione in chiaro nel database** (`server/auth.js:6`). La sessione si cerca con il token così com'è: chi legge il database può usare le sessioni attive. Conviene salvarne l'hash (SHA-256). Da riesaminare con il Security Engineer.

17. **Utente `shop` senza `customer_id` non bloccato** (`server/auth.js:8`). Nessun controllo all'autenticazione: l'elenco ordini risulta vuoto in silenzio e la creazione dell'ordine fallisce con un errore 500.

18. **Ricerca e aggiornamenti dei prodotti** (`server/routes/products.js`).
    - Nella ricerca, `%` e `_` dentro `q` non vengono trattati come caratteri normali (riga 15).
    - `PATCH` su un id inesistente risponde `ok` (riga 42).
    - `stock` viene impostato in valore assoluto e può sovrascrivere un decremento concorrente di un ordine (riga 33): meglio una variazione relativa o un controllo di versione.

19. **Nessuna chiusura ordinata del server** (`server/app.js:20`). Non c'è un gestore di `SIGTERM`: con il rolling update (`order: start-first`) le richieste e i webhook in corso vengono interrotti.

## Test

Non esistono test: `npm test` lancia `node --test` senza file di test. Mancano test di integrazione sulle parti critiche: creazione dell'ordine con concorrenza e rollback, idempotenza del webhook, permessi per ruolo su prezzi, supplier-price e report. È un rilievo P2. Non ho eseguito comandi sul progetto.

## Fuori perimetro, per gli altri ruoli

- **DB/DevOps.** La migrazione `004_stock.sql` rinomina `qty` in `stock`, ma con `start-first` gira mentre la replica vecchia usa ancora `qty`, che va in errore.
- **DevOps.** L'healthcheck interroga `/` statico e non il database.
- **DevOps.** Node è fissato a `22.11.0` (`Dockerfile:1`, `ci.yml:24`). La linea 22 «Jod» è LTS secondo la scheda «Node.js: versioni supportate e nuovo calendario» della biblioteca (fonte: documentazione e release di Node.js; v22, v24 e v26 LTS; verificata il 2026-11-19). Quella patch però è vecchia e senza le correzioni di sicurezza successive (P2). Le date di fine supporto non le ho verificate sulla fonte perché qui non ho il web: possono essere superate.
- **Resi.** `funzioni/resi/` è una funzione non ancora unita al server: non l'ho esaminata.

## Domande aperte

- Quali ruoli possono vedere i prezzi d'acquisto?
- `warehouse` e `admin` devono poter creare ordini per conto di qualunque cliente?
- Quali transizioni di stato sono ammesse, e cosa succede alla giacenza quando un ordine viene annullato?
- Il fornitore dei pagamenti fornisce un `event.id` stabile e un timestamp firmato?

Un limite: ho fatto la revisione su Opus, senza riesame del direttore, perché non ho potuto caricare AISA-01. I rilievi P1 andrebbero confermati da AISA-01 · SIRIUS prima di diventare definitivi.

— AISA-04 · ANTARES
