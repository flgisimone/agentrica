AISA-11 · BELLATRIX — Senior Performance Engineer, reparto AISA (AI Software)

# Analisi delle prestazioni, in sola lettura: gestionale di magazzino «Ortofrutta Emilia»

## Come ho lavorato
- Ho letto tutti i file della copia: README, package.json, server/, web/, db/, deploy/, workflow e data/listino.json, che contiene solo un estratto. La copia non è un repository git: non ci sono `CLAUDE.md` né uno stato Git da leggere.
- Lo stack l'ho verificato nel codice: Node 22.11.0, Express 4.21.2, pg 8.13.1, Postgres 16, una pagina statica in JS puro e due repliche.
- Volumi del README: 12.000 prodotti, 300 negozi, fino a 2.500 ordini al giorno con 25 righe in media. Nei giorni di picco sono circa 62.500 righe di `order_items` al giorno, quindi in un anno milioni e poi decine di milioni di righe. Il listino reale ha circa 180.000 voci per 30 MB.
- Non ho eseguito nulla: niente test di carico, niente misure, niente processi avviati. Le stime che seguono vanno confermate con le misure proposte.
- Limiti della prova: il direttore AISA-01 e la biblioteca del reparto non erano disponibili. Non ho quindi letto la scheda `nodejs-calendario`: per lo stato di supporto di Node 22 non cito date, vanno verificate sulla scheda o sulla fonte ufficiale.

## Rilievi

**BX-01 · P1 · Il report delle vendite legge tutta la storia degli ordini in memoria e apre un pool nuovo a ogni richiesta**
- Dove:
  - `server/routes/reports.js:9`: `new Pool(...)` a ogni richiesta, mai chiuso con `pool.end()`. Si aggiunge al pool condiviso di `server/db.js:3`, che ha `max: 20` per ciascuna delle 2 repliche.
  - `server/routes/reports.js:10-11`: una SELECT senza `WHERE` su `order_items JOIN orders`.
  - `server/routes/reports.js:13-21`: il filtro sulle date e il raggruppamento sono fatti in JavaScript.
- Effetto: al volume di un anno sono milioni di righe trasferite e tenute nell'heap a ogni richiesta. Il tempo e la memoria crescono senza limite, con rischio di fine della memoria e di arresto della replica, che serve anche negozi e magazzino. La CPU resta occupata dal ciclo e blocca le altre richieste.
- Ogni pool in più aggiunge connessioni al conto di Postgres, oltre alle 40 del pool condiviso. Il `max_connections` del database non è nel repository: va verificato.
- Correzione proposta: usare il pool condiviso e fare filtro e somme nel database:
  `WHERE o.created_at >= $1 AND o.created_at < $2 GROUP BY oi.product_id`
  con `SUM(quantity)` e `SUM(quantity*unit_price)`. Questa forma richiede anche l'indice di BX-02.
- Misura:
  - `EXPLAIN (ANALYZE, BUFFERS)` della query attuale e di quella proposta su staging, con dati sintetici a 3, 12 e 24 mesi di picco.
  - Lato Node: tempo della risposta e `process.memoryUsage().heapUsed` prima e dopo una singola richiesta.
  - Su Postgres: `SELECT count(*) FROM pg_stat_activity` dopo alcune chiamate al report.

**BX-02 · P1 · Manca l'indice su `order_items.order_id`**
- Dove: `db/migrations/002_orders.sql:13-19`. Postgres non crea indici sulle chiavi esterne.
- Effetto:
  - Ogni `SELECT ... FROM order_items WHERE order_id = $1` di `server/routes/orders.js:16` è una lettura sequenziale dell'intera tabella. Con BX-03 diventano 200 letture complete per ogni apertura della lista ordini.
  - Pesa anche sul join del report (BX-01).
- Correzione proposta: una nuova migrazione `CREATE INDEX CONCURRENTLY order_items_order_id_idx ON order_items (order_id)`. Una scelta del Database Engineer, da confermare con l'utente; nota che `db/migrate.js` esegue ogni file in una sola query e `CONCURRENTLY` non può stare in una transazione.
- Misura: `EXPLAIN (ANALYZE, BUFFERS) SELECT ... FROM order_items WHERE order_id = <id>` prima e dopo l'indice, su staging con volumi sintetici. Si deve passare da `Seq Scan` a `Index Scan`.

**BX-03 · P2 · Una query per ogni ordine nella lista e righe che il frontend non usa (diventa P1 insieme a BX-02)**
- Dove: `server/routes/orders.js:15-18`. Il ciclo fa fino a 200 query in sequenza, 201 in tutto.
- Le righe caricate sono fino a 200 × 25 = 5.000 per risposta, ma `web/app.js:68-73` usa solo `id`, `created_at`, `status` e `total`. La lista viene ricaricata anche dopo ogni ordine inviato (`web/app.js:65`).
- Correzione proposta: non caricare le righe nella lista e darle in un endpoint di dettaglio, se servono. In alternativa una query sola con `WHERE order_id = ANY($1)`, oppure `json_agg`.
- Misura:
  - Tempo della risposta e peso del JSON con DevTools > Network, su staging, con un utente `warehouse` e 7 giorni di ordini sintetici (circa 17.500).
  - Numero di query per richiesta da `pg_stat_statements` (`calls`).

**BX-04 · P1 · Il listino da 30 MB viene letto e analizzato in modo sincrono a ogni richiesta**
- Dove:
  - `server/routes/products.js:24`: `fs.readFileSync` più `JSON.parse` su 30 MB.
  - `server/routes/products.js:25`: ricerca lineare `find` su circa 180.000 voci.
- Effetto: il ciclo degli eventi della replica resta bloccato per tutta la lettura e l'analisi, presumibilmente centinaia di ms (da misurare), e in quel tempo nessuna richiesta viene servita. Ogni chiamata alloca oggetti per molte volte i 30 MB. Più schede prodotto aperte insieme si mettono in coda e fanno salire la memoria.
- Correzione proposta: caricare il listino una volta in una `Map` per sku e ricaricarlo quando cambia il file, che si aggiorna una volta al giorno. Meglio ancora, se l'utente lo approva: farlo importare dal job esterno in una tabella indicizzata per `sku`.
- Misura:
  - Durata di `JSON.parse` e uso della memoria su un listino sintetico da 180.000 voci, con `performance.now()` e `process.memoryUsage()`.
  - Ritardo del ciclo degli eventi con `perf_hooks.monitorEventLoopDelay()` durante una chiamata.
  - Profilo con `node --cpu-prof`.

**BX-05 · P2 · La ricerca del catalogo manda una richiesta a ogni tasto, senza attesa né annullamento**
- Dove: `web/app.js:26` e `web/app.js:13-24`. Le risposte possono arrivare in ordine diverso da quello delle richieste, e così mostrare i risultati di una ricerca vecchia; lo spinner si spegne alla prima risposta.
- Correzione proposta: attesa di 250-300 ms dopo l'ultimo tasto e `AbortController` per annullare la richiesta precedente.
- Misura: DevTools > Network digitando una parola di 8 lettere: oggi sono 8 richieste.

**BX-06 · P2 · `moment-with-locales` è caricato da CDN come script che blocca il rendering**
- Dove: `web/index.html:8`. È uno script sincrono nella `<head>`, una libreria con tutte le lingue, ed è usato solo per formattare una data in `web/app.js:72`.
- Correzione proposta: `Intl.DateTimeFormat("it-IT", {...})`, già disponibile nel browser come `Intl.NumberFormat` alla riga 3. Elimina il download e la dipendenza da un terzo. Sulla mancanza di SRI rimando a Security.
- Misura: Lighthouse o DevTools Performance, con LCP e tempo di blocco, e il peso trasferito prima e dopo.

**BX-07 · P2 · La creazione di un ordine fa molte chiamate al database, in sequenza e senza transazione**
- Dove: `server/routes/orders.js:31-42`. Sono 3 query per riga (SELECT, UPDATE, INSERT) più 2, cioè circa 77 chiamate per un ordine medio, tutte in sequenza.
- La giacenza è letta e poi riscritta con un valore calcolato in Node (righe 35-38): con ordini contemporanei sullo stesso prodotto si perdono aggiornamenti. Senza transazione, un errore 400 o 409 a metà ordine lascia l'ordine creato e le giacenze già scalate.
- La correttezza va al Backend Developer e al Database Engineer. Dal lato delle prestazioni basta una transazione con:
  - `SELECT ... WHERE id = ANY($1) FOR UPDATE`;
  - `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1`;
  - un INSERT multiplo delle righe.
- Misura: tempo della risposta di `POST /api/orders` con 25 righe su staging. Il totale delle query va da `pg_stat_statements`.

**BX-08 · P3 · La ricerca `ILIKE '%q%'` non usa indici**
- Dove: `server/routes/products.js:15`. Con 12.000 prodotti la lettura sequenziale costa poco, ma con BX-05 si ripete a ogni tasto.
- Correzione proposta: se le misure lo giustificano, un indice trigram (`pg_trgm`, GIN su `name`). È un'estensione nuova, da confermare con l'utente.
- Misura: `EXPLAIN ANALYZE` con 12.000 prodotti sintetici.

**BX-09 · P3 · Manca l'indice su `order_items.product_id`**
- Dove: `db/migrations/002_orders.sql:16`. `DELETE /api/products/:id` (`server/routes/products.js:47`), con `ON DELETE CASCADE`, legge tutta la tabella `order_items`.
- È anche una questione di integrità dei dati (cancellare le righe di ordini storici), da passare al Database Engineer.

**BX-10 · P3 · Compressione e cache delle risorse statiche**
- Il server non comprime le risposte, e la lista ordini può essere grande (BX-03). Non è verificabile dal repository se lo faccia il bilanciatore.
- `express.static` con `maxAge: "1h"` (`server/app.js:8`) non usa nomi con impronta: dopo un rilascio i client possono tenere `app.js` vecchio fino a un'ora.
- Misura: intestazioni `content-encoding` e `cache-control` in DevTools, in staging dietro il bilanciatore.

## Note per altri ruoli, fuori dal perimetro delle prestazioni ma con effetto sulla disponibilità
- Questo punto è da passare al Backend Developer, con P1 come priorità suggerita. Con Express 4 un errore nei gestori `async` non viene passato a `next`. Riguarda:
  - `server/auth.js:4-10`;
  - `server/routes/orders.js:6` e `:22`;
  - `server/routes/products.js`;
  - `server/routes/reports.js`.

  Con Node 22 una promessa rifiutata e non gestita termina il processo: un errore del database, per esempio troppe connessioni per BX-01, può fermare una replica.
- `order_items.unit_price` è `real` (`002_orders.sql:18`): le somme del report e del totale possono avere errori di arrotondamento. Da passare al Database Engineer.
- Il webhook (`server/routes/webhooks.js:20-21`) non è idempotente: i reinvii del fornitore duplicano le fatture.
- `.github/workflows/ci.yml:39-53` mette i segreti di produzione in un artifact, e `preview.yml` usa `pull_request_target` sul codice delle fork con i segreti a disposizione. Da passare a Security o Cybersecurity, con urgenza.

## Ordine di intervento proposto, da confermare con l'utente
1. BX-02 e BX-01.
2. BX-04.
3. BX-03 e BX-07.
4. BX-05 e BX-06.
5. BX-08, BX-09 e BX-10.

Prima di correggere servono un dataset sintetico su staging con i volumi del README (12.000 prodotti, 300 clienti, 12 mesi di picco) e la misura del punto di partenza con `pg_stat_statements` ed `EXPLAIN (ANALYZE, BUFFERS)`. `pg_stat_statements` va verificato o abilitato su staging, con l'ok dell'utente. Nessun test di carico senza autorizzazione.

## Riepilogo
- File modificati: nessuno.
- Test eseguiti: nessuno.
- Rischi: le stime di tempo e memoria non sono misurate.
- Attività residue: le misure indicate sopra e la verifica di Node 22 sulla scheda `nodejs-calendario`.

Firmato: BELLATRIX (AISA-11)
