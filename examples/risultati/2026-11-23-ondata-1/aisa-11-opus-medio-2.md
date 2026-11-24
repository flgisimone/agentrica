AISA-11 · BELLATRIX — Senior Performance Engineer, reparto AISA (AI Software)

# Analisi delle prestazioni (sola lettura): gestionale di magazzino

**Perimetro e metodo.** Ho letto tutti i file della copia: README, `package.json`, `server/`, `db/`, `web/`, `deploy/`, `.github/`. La cartella non è un repository git, quindi non ho potuto controllare lo stato git. Non ci sono test (`npm test` usa `node --test` ma non c'è nessun file di test), non ho avviato processi e non ho eseguito misure né test di carico. Tutti i rilievi vengono dalla lettura del codice e vanno confermati con le misure indicate.

**Il direttore non ha assegnato il lavoro.** In questa prova AISA-01 · SIRIUS non era disponibile, quindi ho lavorato direttamente sul compito.

## Volumi di riferimento (dal README)

| Dato | Valore |
|---|---|
| Prodotti | circa 12.000 |
| Negozi | 300 |
| Ordini al giorno, nei picchi | 2.500 |
| Righe d'ordine al giorno | circa 62.500 (25 righe medie per ordine) |
| `order_items` in un anno | da 10 a 20 milioni di righe |
| `data/listino.json` | circa 30 MB, circa 180.000 voci |
| Repliche | 2, con un pool `pg` da 20 connessioni ciascuna |

Nella copia `data/listino.json` è solo un estratto di 2 KB (lo dice il campo `_nota`). Le stime sul listino usano i 30 MB dichiarati.

## Rilievi

### BELLATRIX-01 · P1 · `server/routes/reports.js:10-21`: il report delle vendite legge tutto lo storico
La query `SELECT … FROM order_items oi JOIN orders o …` non ha `WHERE`. Porta in memoria in Node tutte le righe di sempre e solo dopo filtra per data e somma in JavaScript.
- Con 10-20 milioni di righe all'anno si arriva a diversi GB di oggetti nel heap: rischio di esaurire la memoria e di bloccare l'event loop per secondi.
- Il blocco ferma anche ordini e catalogo serviti dalla stessa replica.
- Il tempo cresce con lo storico, non con l'intervallo chiesto.
- **Correzione:** filtro `o.created_at >= $1 AND o.created_at < $2` e `GROUP BY oi.product_id` con `SUM(quantity)` e `SUM(quantity*unit_price)` direttamente in SQL. Serve l'indice di BELLATRIX-04. Va valutato anche un limite all'ampiezza dell'intervallo.
- **Misura:** `EXPLAIN (ANALYZE, BUFFERS)` della query attuale e di quella corretta, su un database di staging con dati sintetici da 1 e da 12 mesi; per il server `process.memoryUsage().heapUsed` e `perf_hooks.monitorEventLoopDelay()` durante una chiamata.

### BELLATRIX-02 · P2 · `server/routes/reports.js:9`: un pool di connessioni nuovo a ogni richiesta
`new Pool(...)` viene creato a ogni chiamata e non viene mai chiuso (`pool.end()` non c'è) né riusato: non usa il pool condiviso di `server/db.js`.
- Ogni chiamata apre una connessione nuova, con handshake e autenticazione.
- Le connessioni inattive si chiudono solo dopo il timeout di inattività del driver.
- Con chiamate ravvicinate si sommano ai 2 × 20 dei pool principali e possono avvicinarsi a `max_connections`, che non ho visto configurato.
- **Correzione:** usare `require("../db")`.
- **Misura:** `SELECT count(*) FROM pg_stat_activity` prima, durante e dopo una serie di chiamate al report.

### BELLATRIX-03 · P1 · `server/routes/products.js:24-25`: il listino da 30 MB viene riletto a ogni richiesta
A ogni apertura della scheda prodotto il server esegue `fs.readFileSync` più `JSON.parse` del file intero e poi cerca lo SKU con `find` lineare su circa 180.000 voci.
- Lettura e parsing sono sincroni: bloccano l'event loop della replica per un tempo stimato di centinaia di millisecondi.
- Ogni richiesta usa decine o centinaia di MB di memoria temporanea.
- Le richieste in contemporanea si mettono in coda una dietro l'altra.
- Il file cambia una sola volta al giorno.
- **Correzione:** caricarlo una volta in una `Map` per SKU e ricaricarlo quando cambia l'`mtime`. In alternativa importarlo in una tabella con indice su `sku`, a cura del job giornaliero.
- **Misura:** `performance.now()` attorno a lettura, parse e ricerca con un file sintetico da 30 MB; ritardo dell'event loop con `monitorEventLoopDelay`; profilo con `node --cpu-prof`.

### BELLATRIX-04 · P1 · `db/migrations/002_orders.sql:13-19`: `order_items` non ha indici su `order_id` né su `product_id`
Postgres non crea da solo gli indici per le chiavi esterne. Le conseguenze:
- ogni `WHERE order_id = $1` (`orders.js:16`) diventa una scansione completa di una tabella da milioni di righe;
- la `DELETE` di un prodotto (`products.js:47`, con `ON DELETE CASCADE`) scandisce tutta `order_items`;
- anche il join del report ne soffre.

**Correzione:** una nuova migrazione con `CREATE INDEX CONCURRENTLY` su `order_items (order_id)` e `order_items (product_id)`. Va fatta dal Database Engineer, con l'ok dell'utente.

**Misura:** `EXPLAIN ANALYZE SELECT … FROM order_items WHERE order_id = …` prima e dopo; `pg_stat_user_tables.seq_scan` su `order_items`.

### BELLATRIX-05 · P1 · `server/routes/orders.js:15-18`: N+1 query nella lista degli ordini
Il server fa una query per le righe di ogni ordine, una dopo l'altra: fino a 201 query per richiesta.
- Senza BELLATRIX-04, ognuna è una scansione completa: per warehouse e admin la lista diventa molto lenta e occupa una connessione del pool per tutto il tempo.
- `web/app.js:68-73` chiama questa lista a ogni caricamento della pagina e dopo ogni ordine inviato, ma delle righe non mostra niente: fino a 200 × 25 = 5.000 righe d'ordine trasferite per nulla.
- **Correzione:** una sola query `WHERE order_id = ANY($1)` (oppure `json_agg` con `GROUP BY`), oppure togliere le righe dalla lista e fornirle in un endpoint di dettaglio.
- **Misura:** numero di query per richiesta (log con `log_min_duration_statement` o `pg_stat_statements.calls`), tempo della risposta e dimensione in byte del JSON con 200 ordini sintetici.

### BELLATRIX-06 · P2 · `server/routes/orders.js:31-42`: la creazione di un ordine fa decine di round trip
Per 25 righe medie il server fa circa 77 query sequenziali: per ogni riga una SELECT, un UPDATE e un INSERT. Non c'è transazione e ogni query può passare su una connessione diversa del pool. La latenza cresce con le righe (fino a 200) moltiplicate per il tempo di andata e ritorno verso il database.

Effetti oltre alle prestazioni, da passare ai ruoli competenti:
- l'ordine resta a metà con stato 409 o 400 se una riga fallisce;
- la giacenza si aggiorna con lettura e poi scrittura (`stock = $1`), quindi con due ordini contemporanei un aggiornamento può andare perso;
- un errore asincrono non gestito, senza `try/catch`, in Express 4 porta a un rifiuto non gestito della promise.

**Correzione:** una transazione su un solo client. Dentro: `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING price`, poi un `INSERT` unico per tutte le righe con `unnest`.

**Misura:** tempo di `POST /api/orders` con 25 e con 200 righe sintetiche; numero di query per richiesta.

### BELLATRIX-07 · P2 · `web/app.js:26` e `13-24`: una ricerca per ogni tasto, senza debounce né annullamento
Ogni tasto premuto manda una richiesta a `/api/products`.
- Le risposte possono arrivare fuori ordine e mostrare risultati vecchi.
- Ogni risposta ridisegna tutta la lista e riaggancia un listener per ogni pulsante.
- **Correzione:** debounce di circa 250 ms, `AbortController` sulla richiesta precedente, un solo listener delegato su `#prodotti`.
- **Misura:** pannello Network del browser (richieste per ricerca digitata) e pannello Performance.

### BELLATRIX-08 · P2 · `web/index.html:8`: moment con tutte le lingue blocca il primo rendering
`moment-with-locales.min.js` (centinaia di KB non compressi) viene caricato nel `<head>` senza `defer`, da una CDN esterna: in più ci sono una connessione DNS/TLS a un altro dominio e il blocco del rendering. Serve solo per una data in `app.js:72`.
- **Correzione:** `Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })`. Togliere la dipendenza esterna conviene anche per la sicurezza (da far valutare al Security).
- **Misura:** Lighthouse (FCP, LCP, Total Blocking Time) e peso trasferito prima e dopo.

### BELLATRIX-09 · P3 · `server/routes/products.js:15-16`: ricerca con `ILIKE '%q%'` e paginazione con OFFSET
Con `%` iniziale l'indice btree su `name` non serve e la query scandisce tutta la tabella. Con 12.000 prodotti costa pochi millisecondi: oggi è accettabile. Se il catalogo cresce: indice `pg_trgm` GIN e paginazione per chiave invece dell'OFFSET.

**Misura:** `EXPLAIN ANALYZE` con 12.000 prodotti sintetici.

### BELLATRIX-10 · P3 · `server/app.js:8` e `db/migrations/001_init.sql:26-30`: compressione e sessioni scadute
- Express non comprime le risposte e non ho visto la configurazione del bilanciatore: da verificare se comprime con gzip o brotli. Conta per JSON grandi come la lista degli ordini.
- La tabella `sessions` non ha pulizia delle righe scadute. La query di `auth.js:6` resta veloce grazie alla chiave primaria, ma la tabella cresce senza limite.

**Misura:** l'header `content-encoding` delle risposte in produzione e `pg_total_relation_size('sessions')`.

## Come misurare
- **Dati di prova:** un database di staging con dati sintetici generati con `generate_series`: 12.000 prodotti, 300 clienti e 2.500 ordini × 25 righe al giorno, per 30, 180 e 365 giorni. Più un `listino.json` sintetico da 30 MB. Nessun dato reale.
- **Database:** `pg_stat_statements` (tempo totale e numero di chiamate per query) ed `EXPLAIN (ANALYZE, BUFFERS)` sulle query citate sopra.
- **Server:** `monitorEventLoopDelay`, `process.memoryUsage()` e `node --cpu-prof` su `/api/reports/sales`, `/api/products/:id/supplier-price` e `GET /api/orders`.
- **Pagina web:** Lighthouse e pannello Network.
- **Carico:** un test di carico sui picchi va autorizzato dall'utente e fatto solo su staging. Non l'ho eseguito.

## Ordine consigliato
1. BELLATRIX-04 (indici)
2. BELLATRIX-01 e 02 (report)
3. BELLATRIX-03 (listino)
4. BELLATRIX-05 (lista ordini)
5. BELLATRIX-06 (creazione ordine)
6. BELLATRIX-07 e 08 (pagina web)
7. BELLATRIX-09 e 10

## Riepilogo finale
- **File modificati:** nessuno.
- **Test eseguiti:** nessuno; non esistono test nel progetto.
- **Rischi principali:**
  - il report e il listino possono bloccare o far esaurire la memoria a una replica e quindi rallentare anche gli ordini;
  - senza indice su `order_items.order_id` la lista degli ordini peggiora con la crescita dello storico.
- **Fuori dal mio perimetro, da passare ai ruoli competenti:**
  - per la correttezza: giacenze aggiornate con lettura e poi scrittura, ordini senza transazione, fatture duplicate se il webhook viene ritentato (`webhooks.js:20-21`), `unit_price real` per importi in euro;
  - per la sicurezza: i segreti finiscono nel file `.env` caricato come artifact in `ci.yml:39-53`, e `preview.yml` usa `pull_request_target` facendo il checkout del codice delle PR;
  - per il deploy: migrazioni lanciate all'avvio con due repliche in contemporanea.
- **Limiti:**
  - il tool library e il direttore non erano disponibili. La scheda della biblioteca `nodejs-calendario` riguarda la versione di Node (qui 22.11.0) e non l'ho letta: la valutazione del supporto di Node 22 va verificata sulla scheda o sulla fonte ufficiale;
  - le stime dei tempi non sono misurate;
  - queste conclusioni sono state prodotte su un livello di ragionamento ridotto: per i rilievi P1 propongo il riesame del direttore AISA-01 o di un revisore prima che diventino definitivi.
- **Attività residue:** fare le misure su staging e far confermare all'utente priorità e correzioni.

— BELLATRIX (AISA-11)
