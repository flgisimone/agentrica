AISA-04 · ANTARES — Senior Backend Developer, reparto AISA (AI Software)

# Revisione del codice lato server in `server/`: Gestionale di magazzino

**Perimetro.** Ho letto tutti i file di `server/`. Per il contesto ho letto anche `README.md`, `package.json`, `Dockerfile`, `deploy/docker-compose.prod.yml`, `db/migrate.js` e `db/migrations/*.sql`. Non ho modificato nulla e non ho avviato né eseguito niente: né processi né test. Nel progetto non ci sono file di test, quindi `npm test` (`node --test`) non troverebbe nulla da eseguire.

**Cosa non ho potuto fare.** La copia non è un repository git, quindi non ho controllato lo stato git. Il direttore AISA-01 e la biblioteca non erano disponibili. Due comportamenti che cito vengono dalle mie conoscenze e non da una scheda, quindi possono essere superati: Express 4 non intercetta le promise rifiutate negli handler async, e Node ≥15 per default chiude il processo su una rejection non gestita. Prima di usarli come base vanno verificati sulla scheda `nodejs-calendario` o sulla documentazione ufficiale.

**Stack verificato.** Node 22.11, Express 4.21.2, pg 8.13.1, Postgres 16 (secondo il README), due repliche in produzione.

## Rilievi

### P0

**ANTARES-01: un errore asincrono fa cadere il processo, e un utente qualsiasi lo può provocare**
- File: `server/auth.js:4-10`, `server/routes/orders.js:6-44`, `server/routes/products.js:10-49`, `server/routes/reports.js:8-23`, `server/routes/webhooks.js:15-24`. Solo `PATCH /orders/:id/status` (orders.js:47-55) ha `try/catch` + `next(err)`.
- Con Express 4 il gestore d'errore di `app.js:15-18` riceve solo gli errori sincroni o passati a `next`. Le rejection degli handler async restano non gestite e Node chiude la replica.
- Basta un input non valido a un utente autenticato:
  - `GET /api/orders?from=abc`: errore pg sul timestamp.
  - `POST /api/orders` con `productId: "x"`, con `quantity: 1.5` (passa il controllo di orders.js:27 ma la colonna è `integer`) o con una riga `null` (TypeError a orders.js:26).
  - `PATCH /api/products/abc`.
  - `GET /api/products/abc/supplier-price`.
- Fanno cadere il processo anche:
  - il database non raggiungibile in `requireUser`;
  - `PAYMENTS_WEBHOOK_SECRET` mancante (createHmac lancia a webhooks.js:8);
  - un body del webhook non-Buffer, cioè con content-type diverso;
  - `metadata` assente nell'evento (webhooks.js:19);
  - il listino letto mentre il job lo sta riscrivendo (products.js:24).
- Effetto: sono due repliche in tutto e chiunque può farle cadere a ripetizione. Le richieste in volo si perdono, e per `POST /orders` restano a metà le scritture descritte in ANTARES-02.
- Proposta: un wrapper async unico (o il passaggio a Express 5) e la validazione degli input prima delle query (id interi, date ISO, quantità intere).

### P1

**ANTARES-02: la creazione dell'ordine non è in una transazione, quindi restano ordini a metà e giacenze scalate**
- File: `server/routes/orders.js:31-43`.
- L'ordine viene inserito (riga 31) prima di validare i prodotti. Se una riga successiva fallisce, le righe precedenti hanno già scalato `stock` (riga 38) e inserito `order_items` (riga 39): è il caso del 400 alla riga 36, del 409 alla riga 37 o di un errore pg.
- Resta un ordine `pending_payment` con `total` NULL e merce sottratta al magazzino, senza che nessuno la rilasci.
- Proposta: `pool.connect()` + `BEGIN/COMMIT/ROLLBACK` su un unico client, e la validazione di tutte le righe prima della prima scrittura.

**ANTARES-03: lettura e scrittura separate della giacenza, quindi aggiornamenti persi e vendita oltre la giacenza**
- File: `server/routes/orders.js:35-38`, e `server/routes/products.js:42`, che imposta un valore assoluto.
- `SELECT stock`, poi `UPDATE products SET stock = <valore calcolato in JS>`. Due ordini concorrenti dello stesso prodotto leggono la stessa giacenza: uno dei due decrementi va perso e si può vendere più di quanto c'è.
- Il rischio è concreto con due repliche e 2.500 ordini al giorno nei picchi. Lo stesso vale fra un ordine e un `PATCH` del magazzino.
- Proposta: aggiornamento atomico `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING price`, dentro la transazione di ANTARES-02. Lo schema non ha `CHECK (stock >= 0)`: da proporre al Database Engineer.

**ANTARES-04: il webhook dei pagamenti non è idempotente, quindi a ogni nuovo invio arriva una fattura doppia**
- File: `server/routes/webhooks.js:18-23`. Lo schema è in `db/migrations/002_orders.sql:21-26`.
- Il fornitore ritenta l'invio fino a 5 volte (commento alla riga 14). Ogni nuovo invio fa un altro `INSERT INTO invoices`: non c'è vincolo univoco su `order_id` né deduplicazione per id dell'evento.
- Le due query non sono in una transazione: un ordine può risultare `paid` senza fattura.
- Lo stato attuale dell'ordine non viene controllato: un ordine `cancelled` o già `shipped` torna `paid`.
- L'importo non viene confrontato con `orders.total`, e `amount / 100` è un calcolo in virgola mobile.
- Proposta:
  - tabella degli eventi elaborati (id dell'evento come chiave primaria) o `UNIQUE (order_id)` su `invoices` con `ON CONFLICT DO NOTHING`;
  - `UPDATE ... WHERE id = $1 AND status = 'pending_payment' RETURNING total`;
  - transazione unica;
  - confronto dell'importo in centesimi interi.
- Da chiarire: dove viene creato il pagamento e chi imposta `metadata.orderId`. Nel server non c'è.

**ANTARES-05: il magazzino può cambiare i prezzi, mentre il README dice che li cambia solo `admin`**
- File: `server/routes/products.js:29` (`requireRole("warehouse", "admin")`) e righe 35-38.
- Un operatore `warehouse` può modificare `price`.
- Proposta: consentire `price` solo se `req.user.role === "admin"` (403 altrimenti) e lasciare `stock` a `warehouse` e `admin`.

**ANTARES-06: il prezzo di acquisto è visibile ai negozi, e ogni richiesta rilegge un file da circa 30 MB**
- File: `server/routes/products.js:21-27`.
- La rotta non ha `requireRole`: un utente `shop` vede il prezzo di acquisto dai fornitori, cioè il margine del distributore.
- La rotta fa `readFileSync` + `JSON.parse` del listino da circa 30 MB a ogni richiesta, e poi una ricerca lineare. Blocca l'event loop di tutta la replica e alza la memoria, e qualunque utente autenticato può innescarlo.
- Proposta:
  - `requireRole("warehouse", "admin")`, da confermare con l'utente;
  - caricare il listino una volta in una `Map` per sku e ricaricarlo quando il file cambia, con un parse che tolleri errori, oppure importarlo nel database.
- Nota fuori perimetro: il `Dockerfile` copia `data/` nell'immagine (riga 13). Non è chiaro come l'aggiornamento giornaliero del job raggiunga i container: è da verificare con DevOps.

**ANTARES-07: il report crea un nuovo pool di connessioni a ogni richiesta e non lo chiude, e carica tutte le righe d'ordine in memoria**
- File: `server/routes/reports.js:9-12`.
- `new Pool(...)` a ogni chiamata, senza `pool.end()`: le connessioni si accumulano fino a esaurire `max_connections` di Postgres, e cadono anche le altre rotte e l'altra replica.
- La query non ha filtro di date e legge in memoria tutte le `order_items` della storia (circa 62.000 righe al giorno nei picchi); il filtro è fatto in JS (righe 16-17).
- Proposta: usare `db` di `server/db.js` e aggregare in SQL con `WHERE o.created_at >= $1 AND o.created_at < $2 GROUP BY oi.product_id`.

**ANTARES-08: cancellare un prodotto cancella le righe degli ordini storici**
- File: `server/routes/products.js:46-49` e `db/migrations/002_orders.sql:16` (`ON DELETE CASCADE`).
- Un `DELETE` dell'admin elimina in modo irreversibile le righe di tutti gli ordini che contenevano il prodotto. I totali e le fatture non tornano più con le righe e i report perdono le vendite.
- È una perdita di dati, ma richiede un'azione esplicita dell'admin: per questo lo classifico P1 e non P0.
- Proposta: archiviazione logica (`archived_at`) al posto del `DELETE`, oppure FK `RESTRICT` con un 409. Lo schema è da concordare con il Database Engineer.

### P2

**ANTARES-09: le transizioni di stato dell'ordine sono libere e non viene controllato che l'ordine esista**
- File: `server/routes/orders.js:46-56`.
- `warehouse` può impostare `paid` a mano, scavalcando il pagamento, o tornare da `shipped` a `pending_payment`.
- `cancelled` non riporta la merce in giacenza.
- Su un id inesistente la risposta è comunque `{ ok: true }`.
- Il controllo di ruolo è fatto a mano dopo la validazione, invece che con `requireRole`.
- Proposta: una mappa delle transizioni ammesse, `UPDATE ... WHERE id = $1 AND status = $old RETURNING`, 404 se l'ordine non esiste, ripristino della giacenza in transazione sull'annullamento. Le regole di stato sono da confermare con l'utente.

**ANTARES-10: il cliente dell'ordine per `warehouse` e `admin` viene preso dal body senza validazione, e il ruolo non è controllato**
- File: `server/routes/orders.js:29`.
- Se `customerId` manca, la violazione NOT NULL fa cadere il processo (ANTARES-01). Se non esiste, la FK fallisce. Non si verifica che il cliente esista.
- Non è chiaro se `warehouse` debba poter creare ordini: il README non lo dice. Da chiarire con l'utente.
- Anche un utente `shop` senza `customer_id` provoca un errore non gestito.

**ANTARES-11: N+1 query nella lista ordini**
- File: `server/routes/orders.js:15-18`.
- Fino a 201 query in sequenza per richiesta.
- Proposta: una query sola con `WHERE order_id = ANY($1)` e un raggruppamento in JS, oppure `json_agg`.

**ANTARES-12: gli importi sono calcolati in virgola mobile e `unit_price` è `real`**
- File: `server/routes/orders.js:40` (`total += price * quantity`, con `price` che pg restituisce come stringa numeric), `server/routes/reports.js:20` e `server/routes/webhooks.js:21`. Schema in `002_orders.sql:18`.
- Gli importi rischiano errori di arrotondamento: `real` ha circa 7 cifre significative.
- Proposta: calcolare in SQL su `numeric`, o in centesimi interi, e migrare `unit_price` a `numeric(10,2)` (Database Engineer).

**ANTARES-13: la validazione degli input è incompleta**
- `quantity` non è verificata come intera, `productId` non è verificato, e non c'è un tetto alla quantità (orders.js:25-28).
- Gli id dei parametri `:id` non sono validati (products.js:22, 42, 47; orders.js:51).
- Il prezzo non ha né un massimo né un controllo dei decimali: `numeric(10,2)` va in overflow (products.js:36).
- Le date del report non sono validate: con `Invalid Date` entrambi i confronti sono falsi, quindi il report restituisce tutte le righe (reports.js:13-17).
- Un `PATCH` di prodotto su un id inesistente restituisce `ok` (products.js:42-43).

**ANTARES-14: mancano i test sulle parti critiche**
- Non ci sono test per la creazione degli ordini, il webhook dei pagamenti e i permessi.
- Proposta: test d'integrazione su un Postgres locale con dati sintetici per:
  - un ordine con una riga in errore (rollback);
  - due ordini concorrenti sullo stesso prodotto;
  - un webhook inviato due volte;
  - `warehouse` che modifica il prezzo (atteso 403);
  - `shop` che chiama `supplier-price`.

**ANTARES-15: il token di sessione è salvato in chiaro e confrontato direttamente**
- File: `server/auth.js:6`.
- Se il database viene esposto, i token in `sessions` sono subito utilizzabili.
- Proposta: salvare un hash SHA-256 del token, da valutare con la sicurezza. Il login non è nel repository.

### P3

**ANTARES-16: nella ricerca prodotti `%` e `_` non sono neutralizzati**
- File: `server/routes/products.js:15`.
- I caratteri jolly `%` e `_` dentro `q` non vengono trattati come testo. Inoltre `ILIKE '%q%'` non usa l'indice btree su `name`, ma con circa 12.000 righe l'impatto è basso.

**ANTARES-17: l'healthcheck controlla la pagina statica e manca l'arresto ordinato**
- File: `server/app.js:8, 20`.
- L'healthcheck (`deploy/docker-compose.prod.yml:11`) interroga la pagina statica, non il database.
- Il server non chiude le connessioni su SIGTERM durante il rilascio graduale.

## Osservazioni fuori perimetro (database e deploy)

Sono fuori dal perimetro `server/`: le segnalo al Database Engineer e a DevOps.
- **Migrazioni in parallelo.** `db/migrate.js` non ha né lock né transazione per migrazione, ed è eseguito all'avvio da entrambe le repliche (`Dockerfile:17`): le due istanze possono applicare la stessa migrazione insieme.
- **Rilascio della 3.2.0.** Con `order: start-first`, la 004 (`qty` → `stock`) rompe la replica vecchia ancora attiva durante il rilascio.
- **Migrazione 003.** Aggiunge `sku NOT NULL` senza default: fallisce su una tabella `products` già popolata.

## Sintesi
- File modificati: nessuno.
- Test eseguiti: nessuno.
- I difetti più urgenti:
  - la caduta del processo su qualunque errore asincrono (P0);
  - l'assenza di transazioni e di aggiornamenti atomici nella creazione degli ordini (P1);
  - il webhook non idempotente (P1);
  - due controlli di autorizzazione mancanti: prezzi modificabili dal magazzino e prezzo di acquisto visibile ai negozi (P1);
  - la perdita di connessioni nel report (P1).

## Da decidere con l'utente
- Chi può creare ordini e per quale cliente.
- Chi vede il prezzo di acquisto.
- Le transizioni di stato ammesse.
- Archiviazione logica o blocco del `DELETE` dei prodotti.

Sono rilievi da sottoporre al riesame del direttore AISA-01 e alla conferma dell'utente prima di qualunque correzione.

— ANTARES (AISA-04)
