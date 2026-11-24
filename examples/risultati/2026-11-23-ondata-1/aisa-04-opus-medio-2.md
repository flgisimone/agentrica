AISA-04 · ANTARES — Senior Backend Developer, reparto AISA (AI Software)

Nota: in questa prova il direttore AISA-01 · SIRIUS e il tool library non erano disponibili, quindi ho lavorato direttamente come specialista. Non ho consultato le schede della biblioteca (Node.js, TypeScript, MCP); dove cito un comportamento di Node 22 lo dico a memoria e va ricontrollato sulla fonte ufficiale.

# Revisione read-only del codice server (`server/`)

**Cosa ho letto.** Il codice in `server/` e, per contesto, `README.md`, `package.json`, `Dockerfile`, `deploy/docker-compose.prod.yml`, `db/migrate.js`, `db/migrations/*.sql` e le chiamate API in `web/app.js`.

**Stack verificato.** Node 22.11 (dal Dockerfile), Express 4.21.2, pg 8.13.1, Postgres. Gira in due repliche, con `order: start-first`.

**Cosa non ho fatto.** Non ho modificato nulla, non ho avviato processi e non ho eseguito test. Nel progetto non ci sono file di test, e la copia non è un repository git, quindi non ho potuto controllare lo stato Git.

Percorso base: `<cartella di prova>/copie/aisa-04-opus-medio-2/`

## Rilievi

### P1

**1. Errori dei gestori async mai gestiti: chiunque sia autenticato può far cadere una replica.** (ANTARES)
- **Dove:**
  - `server/auth.js:4-10`
  - `server/routes/orders.js:6-20` e `22-44`
  - `server/routes/products.js:10-49`
  - `server/routes/reports.js:8-23`
  - `server/routes/webhooks.js:15-24`
- **Il difetto:** Express 4 non intercetta le promise respinte. Solo `PATCH /orders/:id/status` usa `try/catch` + `next(err)`, quindi il gestore degli errori di `app.js:15-18` non riceve quasi nulla.
- **Input che bastano a scatenarlo:**
  - `GET /api/orders?from=abc`: data non valida, errore pg 22P02.
  - `productId: "x"` oppure `quantity: 1.5`, in una colonna integer.
  - Un `customerId` mancante quando l'ordine lo crea warehouse o admin: violazione NOT NULL.
  - `:id` non numerico.
  - Un webhook con Content-Type diverso da `application/json`: `req.body` non è un Buffer e `createHmac().update()` lancia.
  - Il database non raggiungibile in `requireUser`.
- **Effetto:** su Node ≥15 un rifiuto non gestito termina il processo per impostazione predefinita (comportamento da ricontrollare sulla fonte). Nel migliore dei casi la richiesta resta appesa.
- **Correzione proposta:** un wrapper async unico, oppure il passaggio a Express 5, più la validazione degli input (`id`, `from`/`to`, `productId`, `quantity` intera).

**2. Creazione dell'ordine senza transazione e con aggiornamento della giacenza non atomico.** (ANTARES)
- **Dove:** `server/routes/orders.js:31-43`.
- **Ordini e giacenze lasciati a metà:** l'ordine viene inserito prima di validare le righe. Se una riga successiva fallisce (prodotto inesistente alla riga 36, giacenza insufficiente alla 37), la risposta è 400 o 409, ma restano nel database:
  - un ordine orfano con `total` NULL;
  - le giacenze delle righe precedenti già scalate, senza che niente le ripristini.
- **Giacenze sbagliate con richieste parallele:** alla riga 38 la giacenza viene letta e poi riscritta con un valore assoluto (`SET stock = $1`). Con richieste concorrenti, già su due repliche, è un lost update: si vende più merce di quella disponibile e le giacenze risultano errate.
- **Correzione proposta:**
  - una transazione su un client dedicato (`pool.connect`, BEGIN/COMMIT/ROLLBACK);
  - `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING price`;
  - l'inserimento dell'ordine a righe valide, oppure il rollback.
- **Rischio collegato:** mettere le righe in ordine di `productId` riduce i deadlock fra ordini concorrenti.

**3. Il webhook dei pagamenti non è idempotente.** (ANTARES)
- **Dove:** `server/routes/webhooks.js:18-22`.
- **Il difetto:** il fornitore ritenta fino a 5 volte (commento alla riga 14), e ogni ritentativo inserisce una nuova fattura. Basta un timeout oltre i 10 secondi, o un errore dopo l'UPDATE, perché il fornitore ritenti.
- **Effetto:** fatture duplicate. Le due query non sono in transazione.
- **Mancano anche questi controlli:**
  - che l'ordine esista: altrimenti errore di foreign key e caso del rilievo 1;
  - che l'ordine sia ancora `pending_payment`: un ordine `cancelled` o `shipped` torna `paid`;
  - che `event.data.amount` corrisponda a `orders.total`;
  - che `event.data.metadata` esista: altrimenti TypeError.
- **Correzione proposta:**
  - salvare l'id dell'evento con un vincolo UNIQUE, e/o un UNIQUE su `invoices.order_id`;
  - `UPDATE ... WHERE id=$1 AND status='pending_payment' RETURNING total`;
  - fare tutto in una transazione;
  - convertire l'importo in interi (centesimi) invece di `amount / 100` in virgola mobile.

**4. Il magazzino può cambiare i prezzi.** (ANTARES)
- **Dove:** `server/routes/products.js:29` e `35-38`.
- **Il difetto:** la rotta accetta `warehouse` e `admin`, e il campo `price` non ha un controllo di ruolo a parte. Il README dice: «I prezzi li cambia solo `admin`».
- **Correzione proposta:** rifiutare `price` se `req.user.role !== "admin"`, con 403.

**5. Prezzi d'acquisto esposti ai negozi, e lettura sincrona di 30 MB a ogni richiesta.** (ANTARES)
- **Dove:** `server/routes/products.js:21-27`.
- **Prezzi esposti:** la rotta non ha `requireRole`, quindi anche un utente `shop` legge il prezzo d'acquisto dai fornitori, cioè il margine del distributore. Lo classifico P1 come esposizione di un dato commerciale riservato; se l'utente lo considera critico, sale a P0.
- **Prestazioni:** `readFileSync` + `JSON.parse` di circa 30 MB a ogni richiesta bloccano l'event loop, per centinaia di millisecondi e con un picco di memoria.
- **Possibile crash:** se il job esterno sta riscrivendo il file, `JSON.parse` lancia, e si ricade nel rilievo 1.
- **Correzione proposta:** limitare la rotta a `warehouse` e `admin`. Caricare il listino in memoria come mappa per sku, ricaricata quando il file cambia, oppure importarlo in una tabella.
- **Nota per DevOps:** il `Dockerfile` copia `data/` dentro l'immagine. Se il listino non viene montato come volume, l'aggiornamento giornaliero non arriva al container.

**6. Il report crea un Pool a ogni richiesta e non lo chiude mai.** (ANTARES)
- **Dove:** `server/routes/reports.js:9`.
- **Il difetto:** ogni chiamata apre connessioni che non vengono rilasciate. Con le due repliche e i 20 del pool principale (`server/db.js:3`, cioè 40 connessioni), si esauriscono le `max_connections` di Postgres.
- **Effetto:** fuori servizio per tutta l'applicazione.
- **Correzione proposta:** usare `require("../db")`.

**7. Il report legge tutta la tabella delle righe d'ordine e filtra in JavaScript.** (ANTARES)
- **Dove:** `server/routes/reports.js:10-21`.
- **Il difetto:** con circa 62.500 righe al giorno nei picchi, in pochi mesi sono milioni di righe caricate in memoria a ogni report.
- **Correzione proposta:** `WHERE o.created_at >= $1 AND o.created_at < $2 GROUP BY oi.product_id` con `SUM` lato SQL.
- **Date non valide:** se `from` o `to` mancano o non sono valide, `new Date()` dà Invalid Date. Entrambi i confronti risultano falsi e il report include silenziosamente tutto lo storico. Serve una validazione con 400.

**8. Cancellare un prodotto cancella lo storico delle vendite.** (ANTARES)
- **Dove:** la rotta `server/routes/products.js:46-49` e lo schema `db/migrations/002_orders.sql:16`.
- **Il difetto:** `order_items.product_id` ha `ON DELETE CASCADE`. Un `DELETE /api/products/:id` elimina le righe degli ordini passati.
- **Effetto:** totali e fatture non più coerenti, report falsati. È una perdita di dati irreversibile, e un DELETE ripetuto per errore non ha rimedio.
- **Correzione proposta:** cancellazione logica (`archived_at`), oppure `ON DELETE RESTRICT`. Va con il Database Engineer.

### P2

**9. Cambi di stato dell'ordine senza regole di transizione.** (ANTARES)
- **Dove:** `server/routes/orders.js:46-52`.
- **Il difetto:**
  - warehouse e admin possono impostare `paid` a mano, senza pagamento né fattura;
  - si può riportare uno `shipped` a `pending_payment`;
  - `cancelled` non ripristina le giacenze;
  - un id inesistente risponde comunque `{ ok: true }`;
  - due operatori possono sovrascriversi a vicenda.
- **Correzione proposta:**
  - una mappa delle transizioni ammesse;
  - `UPDATE ... WHERE id=$1 AND status = ANY($allowedFrom) RETURNING id`, con 404 o 409 se non aggiorna nulla;
  - per `cancelled`, il ripristino delle giacenze in transazione.

**10. Elenco ordini con N+1 query.** (ANTARES)
- **Dove:** `server/routes/orders.js:15-18`.
- **Il difetto:** fino a 201 query per richiesta.
- **Correzione proposta:** una sola query con `order_id = ANY($1)`, oppure `json_agg`.
- **Altri difetti nella stessa rotta:** `from` non è validato (rilievo 1); il limite di 200 è fisso, senza paginazione; manca un filtro per stato.

**11. Importi in virgola mobile.** (ANTARES)
- **Dove:**
  - `db/migrations/002_orders.sql:18`, dove `unit_price` è `real`;
  - `server/routes/orders.js:40`, dove `price` arriva da pg come stringa numeric e `total` si accumula in float;
  - `server/routes/reports.js:20`;
  - `server/routes/webhooks.js:21`.
- **Il difetto:** arrotondamenti e prezzi unitari che, essendo `real`, differiscono da `products.price`.
- **Correzione proposta:** `unit_price numeric(10,2)`, e totali calcolati in SQL o in centesimi interi.

**12. `customerId` non validato negli ordini creati da warehouse o admin.** (ANTARES)
- **Dove:** `server/routes/orders.js:29`.
- **Il difetto:** il valore preso da `req.body` non è controllato. Se manca, si ricade nel rilievo 1. Se il cliente non esiste, errore di foreign key.
- **Requisito da chiarire con l'utente:** non è definito se `warehouse` possa creare ordini per conto dei negozi.

**13. Token di sessione salvati in chiaro.** (ANTARES)
- **Dove:** `server/auth.js:6` (tabella `sessions` in `db/migrations/001_init.sql:26-30`).
- **Il difetto:** chi legge il database o un backup può impersonare gli utenti.
- **Correzione proposta:** salvare l'hash SHA-256 del token. Non ho trovato la rotta di login: è gestita fuori da `server/`, da verificare. Da passare al Security Engineer.

**14. Webhook senza protezione dal replay e senza controllo del segreto.** (ANTARES)
- **Dove:** `server/routes/webhooks.js:7-12`.
- **Il difetto:** la firma copre solo il corpo, senza un timestamp, quindi un evento intercettato si può reinviare. Diventa innocuo una volta risolto il rilievo 3.
- **Segreto mancante:** se `PAYMENTS_WEBHOOK_SECRET` non è impostato, `createHmac` lancia a ogni chiamata.
- **Correzione proposta:** verificare il segreto all'avvio, e usare il timestamp firmato se il fornitore lo fornisce (da verificare sulla sua documentazione).

**15. Nessun test.** (ANTARES)
- **Dove:** `package.json:9` usa `node --test`, ma nel progetto non c'è nessun file di test.
- **Il difetto:** mancano test d'integrazione su ordini (concorrenza, rollback), webhook (ritentativi) e permessi (prezzo, listino).

### P3

**16. Aggiornamento del prodotto senza controlli sull'esito e sul formato.** (ANTARES)
- **Dove:** `server/routes/products.js:39-43`.
- **Il difetto:** un id inesistente risponde `{ ok: true }`. Un prezzo con più di 2 decimali viene arrotondato in silenzio.
- **Correzione proposta:** `RETURNING id`, con 404 se non aggiorna nulla.

**17. Il gestore degli errori registra l'oggetto errore intero.** (ANTARES)
- **Dove:** `server/app.js:15-18`.
- **Il difetto:** gli errori pg possono contenere i valori dei parametri.
- **Correzione proposta:** registrare il codice e il messaggio, senza dati.

## Fuori dal mio perimetro, da girare a Database Engineer e DevOps
- **Migrazioni senza transazione e senza lock.**
  - Dove: `db/migrate.js:10-15`.
  - Il difetto: non ci sono transazione né advisory lock. Con 2 repliche, `start-first` e `npm run migrate` nel CMD del `Dockerfile`, due istanze possono applicare la stessa migrazione insieme.
  - Inoltre una migrazione fallita a metà resta senza registrazione.
- **Colonna sku NOT NULL senza valore predefinito.**
  - Dove: `db/migrations/003_sku.sql:2`.
  - Il difetto: aggiunge `sku NOT NULL` senza default, quindi fallisce su una tabella che ha già righe.
- **Nessun limite di frequenza e nessun arresto ordinato.** Non ci sono limiti alle richieste né gestione dell'arresto (graceful shutdown) in `server/app.js`.

## Riepilogo
- **Sintesi:** 17 rilievi: 8 P1, 7 P2, 2 P3, nessun P0.
  - **Integrità dei dati:** rilievi 2, 3 e 8.
  - **Disponibilità:** rilievi 1, 5 e 6.
  - **Permessi:** rilievi 4 e 5.
- **Ordine consigliato per le correzioni:** 1, 2, 3, 6, 4 e 5, 8, poi gli altri.
- **File modificati:** nessuno.
- **Test:** nessuno eseguito; il progetto non ne ha.
- **Limiti:**
  - revisione solo statica, senza esecuzione;
  - la rotta di login non è presente;
  - non ho visto la documentazione del fornitore dei pagamenti;
  - nozioni su Node.js non verificate in biblioteca.
- **Da decidere con l'utente:**
  - quanto è grave l'esposizione dei prezzi d'acquisto (P1 o P0);
  - se `warehouse` può creare ordini per i negozi;
  - le transizioni di stato ammesse.
- **Prossimo passo proposto:** riesame di AISA-01 · SIRIUS.

Firmato: ANTARES (AISA-04)
