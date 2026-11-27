«AISA-04 · ANTARES — Senior Backend Developer, reparto AISA (AI Software)»

# Revisione read-only del lato server (`server/`) — progetto «gestionale-magazzino» 3.2.0

**Esito:** il codice in `server/` ha 8 difetti P1 e nessun P0. I P1 sono: ordini senza transazione, vendita oltre la giacenza quando due ordini arrivano insieme, errori async che fanno cadere il processo, fatture doppie dal webhook, connessioni al database che si accumulano nei report, magazzino che può cambiare i prezzi, cancellazione di un prodotto che cancella le righe degli ordini passati, prezzo d'acquisto visibile ai negozi. Non ho modificato nulla e non ho scritto file.

**Contesto verificato:** ho letto README.md, package.json, Dockerfile e deploy/docker-compose.prod.yml. Lo stack è Node 22 (`node:22.11.0-alpine3.20`), Express 4.21.2, pg 8.13.1 e Postgres 16, con 2 repliche (docker-compose.prod.yml, `replicas: 2`). La cartella non è un repository git, quindi non ho potuto controllare lo stato Git. Non ci sono file di test.

**Limiti della sessione:**
- Non ho il server MCP, quindi non ho potuto caricare AISA-01 · SIRIUS. Il rapporto va al chiamante.
- Ho consultato la scheda `nodejs-calendario` con il comando sostitutivo `agent-text`. Fonte: documentazione e release di Node.js, verificata il 2026-11-19, da ricontrollare entro il 2027-02-19. Dice che la 22 è ancora LTS, quindi la versione di Node non è un rilievo.
- Le schede `mcp-2026-07-28` e `typescript-7` non riguardano questo progetto (JavaScript CommonJS, nessun MCP).

## Rilievi

### P1

**1. Ordine creato senza transazione: ordini orfani e giacenze scalate per niente** (`server/routes/orders.js:31-43`)
- L'ordine si inserisce (r.31) prima di aver controllato i prodotti.
- Ogni query va su `pool.query`, quindi ognuna può usare una connessione diversa.
- Se una riga fallisce (prodotto inesistente r.36, giacenza insufficiente r.37, o un errore del database), il ritorno anticipato lascia nel database:
  - un ordine `pending_payment` con `total` NULL;
  - le righe già inserite;
  - le giacenze già scalate per le righe precedenti.
- Correzione proposta: validare prima tutte le righe, poi fare tutto in una sola transazione con un client dedicato (`pool.connect()`, `BEGIN`/`COMMIT`/`ROLLBACK`).

**2. Giacenza: aggiornamento perso con ordini simultanei, si vende oltre la giacenza** (`server/routes/orders.js:35-38`)
- La giacenza si legge (r.35) e poi si scrive un valore assoluto calcolato in JavaScript: `SET stock = $1` con `p.stock - l.quantity` (r.38).
- Con 2 repliche e i picchi da 2.500 ordini al giorno, due ordini simultanei leggono la stessa giacenza: uno dei due decrementi si perde e il controllo della r.37 non protegge più.
- Lo stesso accade con il `PATCH /api/products/:id` del magazzino (`products.js:42`).
- Correzione proposta: un update atomico condizionato, `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING price`, dentro la transazione del rilievo 1. In alternativa `SELECT ... FOR UPDATE`.

**3. Handler async senza gestione degli errori (Express 4): una richiesta malformata fa cadere il processo**
- Express 4 non intercetta le promise rifiutate. Su Node 22 un rifiuto non gestito termina il processo, e la richiesta non riceve risposta.
- Solo `PATCH /orders/:id/status` (`orders.js:46-56`) passa l'errore a `next`.
- Sono scoperti:
  - `server/auth.js:4-10` (`requireUser`, su tutte le API);
  - `orders.js:6` e `:22`;
  - `products.js:10`, `:21`, `:29`, `:46`;
  - `reports.js:8`;
  - `webhooks.js:15`.
- Bastano input banali, da qualunque utente autenticato:
  - `GET /api/orders?from=abc`;
  - `productId: "x"` o `quantity: 1.5` nel `POST /api/orders` (la colonna è `integer`);
  - `customerId` mancante per warehouse o admin (vincolo NOT NULL);
  - `PATCH /api/products/abc`.
- Anche un webhook con `data.metadata` assente (TypeError a `webhooks.js:19`) o un `listino.json` letto mentre il job lo riscrive (`products.js:24`) fanno cadere il processo.
- Questo è un rischio di disponibilità (DoS) da parte di qualunque negozio.
- Correzione proposta: un wrapper async in un punto solo, oppure Express 5, che inoltra da sé i rifiuti. Più la validazione dei parametri (rilievi 9 e 10).

**4. Webhook dei pagamenti non idempotente: fatture duplicate e stati che tornano indietro** (`server/routes/webhooks.js:15-24`)
- Il commento alla r.14 dice che il fornitore ritenta fino a 5 volte. Ogni nuovo tentativo dello stesso evento:
  - inserisce un'altra fattura (r.21), perché manca un vincolo `UNIQUE` sull'id dell'evento o su `invoices.order_id`;
  - riporta a `paid` un ordine già in `picking`, `shipped` o `cancelled` (r.20 non ha condizione sullo stato).
- UPDATE e INSERT non stanno in una transazione.
- Non c'è controllo che l'ordine esista, né che `amount` corrisponda a `orders.total`.
- La firma non include un timestamp, quindi un evento valido può essere rispedito più tardi: l'idempotenza lo neutralizza.
- Correzione proposta:
  - salvare l'id dell'evento con un vincolo univoco;
  - `UPDATE ... WHERE id=$1 AND status='pending_payment'`;
  - fattura solo se l'update ha toccato una riga, il tutto in una transazione;
  - verificare l'importo.
- Lo schema (vincolo univoco) va concordato con il Database Engineer.

**5. Report: un nuovo Pool a ogni richiesta, mai chiuso, e tutte le righe di vendita in memoria** (`server/routes/reports.js:9-12`)
- `new Pool(...)` a ogni chiamata, senza `pool.end()`: le connessioni restano aperte e si accumulano fino a esaurire `max_connections` di Postgres. Il pool condiviso ne tiene già fino a 20 per replica (`server/db.js:3`).
- La query legge tutto `order_items JOIN orders`, senza filtro: circa 62.500 righe per ogni giorno di picco, e crescono senza limite. Il filtro per data e l'aggregazione si fanno poi in JavaScript (r.13-21).
- Correzione proposta: usare `db` da `server/db.js` e fare `WHERE o.created_at >= $1 AND o.created_at < $2 GROUP BY oi.product_id` in SQL.

**6. Il ruolo `warehouse` può cambiare i prezzi** (`server/routes/products.js:29, 35-38`)
- Il README dice «I prezzi li cambia solo `admin`», ma il PATCH ammette `warehouse` e `admin` per tutti i campi, prezzo compreso.
- Correzione proposta: autorizzazione per campo (`price` solo admin). Manca anche un 404 quando il prodotto non esiste.

**7. Cancellare un prodotto cancella le righe degli ordini storici** (`server/routes/products.js:46-49` con `db/migrations/002_orders.sql:16`)
- `order_items.product_id` ha `ON DELETE CASCADE`. Il DELETE dell'admin elimina in silenzio le righe di ordini già pagati o fatturati.
- `orders.total` e `invoices` non tornano più con le righe, e i report perdono le vendite. È una perdita di dati.
- Correzione proposta: disattivazione logica del prodotto (es. `archived_at`), oppure rifiutare il DELETE se il prodotto ha righe d'ordine. La modifica allo schema va concordata con il Database Engineer.

**8. Prezzo d'acquisto dei fornitori esposto a tutti, e un file da 30 MB letto in modo sincrono a ogni richiesta** (`server/routes/products.js:21-27`)
- L'endpoint non ha `requireRole`, quindi anche il ruolo `shop` (i negozi clienti) legge il prezzo d'acquisto: è il margine del distributore.
- `fs.readFileSync` più `JSON.parse` di circa 30 MB (README) a ogni chiamata blocca l'event loop della replica per tutte le richieste.
- Se il job esterno sta riscrivendo il file, il parse fallisce e il processo cade (rilievo 3).
- Correzione proposta:
  - limitare a `admin` (o anche `warehouse`, da confermare);
  - caricare il listino una volta, in modo asincrono, in una `Map` per `sku`, e ricaricarlo quando il file cambia;
  - meglio ancora, importarlo in una tabella.
- Domanda aperta: chi deve vedere il prezzo d'acquisto?

### P2

**9. Righe dell'ordine validate poco** (`server/routes/orders.js:23-29`)
- `Number(l.quantity) > 0` accetta decimali, che poi fanno fallire l'insert su una colonna `integer`, e `Infinity`.
- `productId` non è validato.
- `customerId` di warehouse e admin non è validato: non si controlla che il cliente esista.
- Il ciclo modifica `req.body`.
- Correzione proposta: `Number.isInteger` con un limite superiore, e id interi positivi.
- Domanda aperta: warehouse e admin possono creare ordini per conto di un negozio? Il README dice che gli ordini li crea il negozio.

**10. Parametri di data non validati**
- `orders.js:7`: un `from` non valido manda in errore Postgres e fa cadere il processo.
- `reports.js:13-14`: date mancanti o non valide diventano `Invalid Date`. Ogni confronto è falso e la risposta è un `{}` vuoto, senza errore: il report sembra vuoto invece di segnalare l'errore.
- Correzione proposta: 400 con un messaggio chiaro.

**11. Cambio di stato dell'ordine senza regole di transizione** (`server/routes/orders.js:46-56`)
- Ammette qualunque passaggio, per esempio `shipped`→`pending_payment` o `cancelled`→`paid`.
- Il magazzino può segnare `paid` a mano, senza pagamento.
- L'annullamento non restituisce la giacenza.
- Risponde `ok: true` anche se l'ordine non esiste (manca il controllo di `rowCount`).
- Correzione proposta: una tabella delle transizioni ammesse e un update condizionato `WHERE status = <stato atteso>`. Domanda aperta: quali transizioni vuole l'utente?

**12. Importi in virgola mobile** (`orders.js:40`, `reports.js:20`, `webhooks.js:21`, schema `002_orders.sql:18` `unit_price real`)
- `price` è `numeric`, ma `unit_price` è `real`, cioè float4 con circa 7 cifre significative.
- Totali, ricavi e `amount / 100` si calcolano in float di JavaScript, quindi gli arrotondamenti possono differire da quelli della fattura.
- Correzione proposta: `numeric` anche per `unit_price` e calcolo in SQL (o in centesimi interi). Lo schema va concordato con il Database Engineer.

**13. `GET /api/orders`: una query per ogni ordine (N+1)** (`server/routes/orders.js:15-18`)
- Fino a 201 query per ogni chiamata, una dopo l'altra.
- Correzione proposta: una sola query con `WHERE order_id = ANY($1)`, oppure `json_agg`.

**14. Pool senza gestore dell'evento `error`** (`server/db.js:3`)
- Un errore su un client inattivo (per esempio un riavvio di Postgres) emette `error` sul Pool senza nessun listener, e il processo cade.
- Correzione proposta: `pool.on("error", ...)`.

**15. Token di sessione in chiaro nel database** (`server/auth.js:6`, `001_init.sql:27`)
- Chi legge la tabella `sessions` (un backup, un dump) ottiene sessioni valide.
- Correzione proposta: salvare l'hash del token. Da valutare con il Security Engineer, insieme al login, che non è nel perimetro.

### P3

**16. Ricerca prodotti: `%` e `_` dell'utente non vengono neutralizzati** (`server/routes/products.js:15`)
- Si comportano da caratteri jolly. Non è un'iniezione, perché la query è parametrizzata.
- Con circa 12.000 prodotti la scansione completa della tabella è accettabile per ora.

**17. Verifiche in ordine invertito** (`server/routes/orders.js:49-50`)
- La validazione dello stato precede il controllo del ruolo, quindi un negozio riceve 400 invece di 403. L'effetto è minimo.

### Fuori perimetro (`db/`, `deploy/`, `funzioni/`): segnalati al direttore, non esaminati a fondo

- **Migrazioni:** `db/migrate.js:10-15` applica le migrazioni senza transazione e non ha `catch`. Il Dockerfile (r.17) le lancia all'avvio di ciascuna delle 2 repliche, che possono applicarle in contemporanea. `003_sku.sql:2` aggiunge `sku NOT NULL` senza default, e fallisce se `products` ha già righe. Da passare a Database Engineer e DevOps.
- **Resi:** `funzioni/resi/server/returns.js` non è montato in `server/app.js`, quindi non l'ho esaminato.

## Test

Non ho eseguito nessun test: il repository non ne ha (`npm test` lancia `node --test` senza file di test). Non avevo il database, e le dipendenze non sono installate. Tutti i rilievi vengono dalla lettura del codice. Mancano test d'integrazione proprio sulle parti critiche (ordini, webhook, permessi): è un P2 di copertura.

## Domande aperte per l'utente

1. Chi deve vedere il prezzo d'acquisto dei fornitori? (rilievo 8)
2. Warehouse e admin possono creare ordini per conto di un negozio? (rilievo 9)
3. Quali transizioni di stato dell'ordine sono ammesse, e l'annullamento deve restituire la giacenza? (rilievo 11)
4. I prodotti con ordini si archiviano o non si cancellano? (rilievo 7)

Ho lavorato su Opus. I P1 vanno comunque confermati dal direttore AISA-01 prima di diventare definitivi.

— AISA-04 · ANTARES
