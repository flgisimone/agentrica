AISA-11 · BELLATRIX — Senior Performance Engineer, reparto AISA (AI Software)

# Rapporto prestazioni (sola lettura, nessun test di carico)

**Perimetro e metodo.** Ho letto README, `server/`, `db/migrations/`, `web/`, `Dockerfile` e `deploy/` della copia. Non ho eseguito nulla. I rilievi sono quindi probabili, non misurati. Il tool library e il direttore non erano disponibili in questa prova. Nessuna scheda della biblioteca tocca questi rilievi.

**Volumi del README.** Ci sono circa 12.000 prodotti, 300 negozi e 2.500 ordini al giorno nei picchi, con 25 righe per ordine. Ne ricavo circa 62.500 righe d'ordine al giorno, cioè circa 23 milioni all'anno. Il listino ha circa 180.000 voci e pesa 30 MB. Il pool del database è di 20 connessioni per replica, con due repliche.

## Rilievi

### P1 — `GET /api/products/:id/supplier-price` rilegge e riparsa il listino da 30 MB a ogni richiesta
- **Dove:** `server/routes/products.js:24-25`. `readFileSync` e `JSON.parse` di 30 MB vengono eseguiti per ogni chiamata, poi `.find` scorre fino a 180.000 voci.
- **Perché pesa:** `readFileSync` blocca l'event loop e il parse tiene occupata la CPU. Alloca inoltre decine di MB per richiesta. Poche schede prodotto aperte in sequenza bloccano l'istanza per tutti gli altri endpoint, webhook compresi.
- **Come misurarlo:** tempo di una singola chiamata e ritardo dell'event loop con `perf_hooks.monitorEventLoopDelay`. Controllare anche RSS e GC con `--trace-gc` durante 10 chiamate consecutive.
- **Direzione di correzione:** caricare il listino una volta in una `Map` per sku e ricaricarla quando il file cambia (si aggiorna una volta al giorno), oppure metterlo in una tabella con indice su `sku`.

### P1 — `GET /api/reports/sales` carica in memoria tutta la tabella `order_items`, filtra in JavaScript e apre un pool per richiesta
- **Dove:** `server/routes/reports.js:9-12` (SELECT senza `WHERE`) e `:16-21` (filtro per data in JS).
- **Perché pesa:** il filtro per data non arriva al database, quindi la query legge decine di milioni di righe e le trasferisce a Node. Il rischio è l'esaurimento della memoria (OOM), e il costo cresce ogni giorno con lo storico.
- **Pool:** `new Pool(...)` a ogni chiamata non viene mai chiuso con `end()`. Ogni richiesta lascia connessioni aperte fino al limite di Postgres, che poi rifiuta anche le altre istanze.
- **Altro:** se `from` o `to` mancano, `new Date(undefined)` è una data non valida e il report esce vuoto senza errore.
- **Come misurarlo:** `EXPLAIN (ANALYZE, BUFFERS)` sulla query con i volumi stimati, il picco di heap Node durante una chiamata e `SELECT count(*) FROM pg_stat_activity` dopo qualche chiamata.
- **Direzione di correzione:** aggregare in SQL (`SUM`, `GROUP BY product_id`) con `WHERE o.created_at BETWEEN $1 AND $2`, usando il pool condiviso di `server/db.js`.

### P1 — `POST /api/orders` fa fino a 3 query per riga, in sequenza, senza transazione
- **Dove:** `server/routes/orders.js:34-41`. Per ogni riga ci sono una SELECT, un UPDATE e un INSERT. Con 25 righe sono circa 75 query più 3 fisse, ognuna con il suo round trip.
- **Contesa:** il pool ha 20 connessioni per replica. Nei picchi gli ordini si accodano.
- **Difetto collegato:** senza transazione e senza `SELECT ... FOR UPDATE`, due ordini concorrenti sullo stesso prodotto leggono la stessa giacenza e il secondo `UPDATE` sovrascrive il primo (overselling). Un errore a metà lascia l'ordine `pending_payment` con righe parziali e giacenze già scalate. Le repliche sono due, quindi la corsa è reale.
- **Come misurarlo:** `log_min_duration_statement=0` su un ambiente di test per contare le query per ordine, poi un test di carico autorizzato in staging (non eseguito qui).
- **Direzione di correzione:** una transazione con una sola SELECT dei prodotti (`WHERE id = ANY($1)`), un UPDATE atomico (`stock = stock - $n WHERE stock >= $n`) e un INSERT multiriga.

### P2 — `GET /api/orders` ha un problema N+1 (fino a 201 query)
- **Dove:** `server/routes/orders.js:15-18`. Per ogni ordine, fino a 200, parte una query sulle righe.
- **Aggravante:** `order_items` non ha indice su `order_id` (`db/migrations/002_orders.sql:13-19`). Con circa 23 milioni di righe all'anno, ognuna di queste query è una scansione sequenziale. Sono 200 scansioni complete a ogni apertura della pagina, che la web app fa all'avvio (`web/app.js:77`) e dopo ogni ordine.
- **Come misurarlo:** `EXPLAIN (ANALYZE)` di `SELECT ... FROM order_items WHERE order_id = $1` e il numero di query per richiesta nel log di Postgres.
- **Direzione di correzione:** `CREATE INDEX ON order_items (order_id)` e una sola query con `WHERE order_id = ANY($1)`.

### P2 — Manca l'indice su `order_items(order_id)`, usato anche da join e cancellazioni
- **Dove:** `db/migrations/002_orders.sql:13-19`. Il join del report e le cancellazioni a cascata (`products ON DELETE CASCADE`) scansionano la tabella.
- **Nota:** creare l'indice su una tabella già popolata blocca le scritture senza `CONCURRENTLY`. Va pianificato. `db/migrate.js:13` esegue ogni file in un solo `query`, quindi `CONCURRENTLY` richiede un file a parte.

### P2 — La ricerca prodotti `ILIKE '%q%'` non può usare l'indice, e il frontend non limita le richieste
- **Dove:** `server/routes/products.js:15`. L'indice `products_name_idx` è un btree, inutile con il carattere jolly iniziale.
- **Peso:** su 12.000 righe la scansione costa millisecondi e per ora non è un collo di bottiglia. Diventa rilevante con più utenti contemporanei.
- **Lato web:** `web/app.js:26` lancia una fetch a ogni tasto, senza debounce né annullamento (`AbortController`). Le risposte possono arrivare fuori ordine e mostrare risultati di una ricerca vecchia. La paginazione server c'è (limite 100), ma il client non la usa.
- **Come misurarlo:** `EXPLAIN (ANALYZE)` della ricerca e il numero di richieste per digitazione nel pannello Rete del browser.
- **Direzione di correzione:** debounce di 200-300 ms, `AbortController` e, solo se la misura lo giustifica, un indice `pg_trgm`.

### P2 — Autenticazione: una query al database a ogni richiesta `/api`, e handler async senza gestione degli errori
- **Dove:** `server/auth.js:6`. Il JOIN `sessions`/`users` è economico (il token è chiave primaria) ma raddoppia il carico di ogni endpoint.
- **Rischio collegato:** `requireUser` è `async` senza `try/catch`. In Express 4 un errore del database lascia la richiesta appesa invece di rispondere 500, e sotto carico le connessioni restano aperte fino al timeout del client. Lo stesso vale per quasi tutti gli handler async (per esempio `orders.js:6`); solo il PATCH di stato usa `try/catch`.
- **Come misurarlo:** latenza della query di sessione nel log di Postgres.
- **Direzione di correzione:** una cache in memoria con TTL breve, solo se la misura la giustifica, e una gestione uniforme degli errori.

### P2 — Il webhook dei pagamenti fa due scritture senza transazione né idempotenza
- **Dove:** `server/routes/webhooks.js:20-21`.
- **Perché riguarda le prestazioni:** il fornitore ritenta fino a 5 volte se non riceve 2xx entro 10 secondi. Se il database è lento (per esempio per le scansioni di cui sopra), le risposte tardano oltre i 10 s e arrivano i ritentativi. Ogni ritentativo inserisce un'altra fattura per lo stesso ordine, perché `invoices(order_id)` non ha un vincolo `UNIQUE`. Il rischio è di correttezza (fatture duplicate), innescato da un problema di prestazioni.
- **Come misurarlo:** latenza del webhook (p95/p99) e conteggio delle fatture duplicate per `order_id`.
- **Direzione di correzione:** una transazione, un `UNIQUE` su `invoices(order_id)` e `ON CONFLICT DO NOTHING`.

### P3 — Frontend: carico di risorse e rendering
- **moment.js da CDN, con tutti i locali, per un solo formato data** (`web/index.html:8`, `web/app.js:72`). Il file `moment-with-locales.min.js` pesa circa 300 KB (stima non verificata). Lo script è bloccante e dipende da una risorsa esterna: DNS e TLS in più, e la pagina si rompe se il CDN è lento o irraggiungibile. `Intl.DateTimeFormat("it-IT")`, già usato per `euro`, fa lo stesso senza dipendenze.
- **Ridisegno con `innerHTML`** (`web/app.js:18-23`, `:71-73`) a ogni ricerca. Con al massimo 100 elementi è accettabile. I listener dei pulsanti si riassegnano a ogni ridisegno: basterebbe una sola delega sull'elemento padre.
- **Nessuna compressione HTTP** in `server/app.js`: né `compression` né un proxy dichiarato nel repository. Le risposte JSON di 200 ordini con righe sono grandi e comprimibili. Da verificare se il bilanciatore comprime già.
- **File statici con `maxAge: "1h"`** senza hash nel nome: accettabile, ma a ogni scadenza partono richieste condizionali per `index.html`, `app.js` e `style.css`.
- **Come misurarlo:** Lighthouse o il pannello Rete sulla pagina `web/index.html`, con dimensioni e tempi di caricamento.

### P3 — Pool e deploy
- `server/db.js:3`: `max: 20` per replica, due repliche, quindi 40 connessioni. Mancano `connectionTimeoutMillis` e `statement_timeout`: una query lenta (il report, per esempio) tiene occupata una connessione senza limite. Il limite `max_connections` di Postgres non è verificabile dal repository.
- `Dockerfile`: l'avvio esegue `npm run migrate` a ogni avvio di ogni replica. Con due repliche in `deploy/docker-compose.prod.yml` possono partire insieme ed eseguire la stessa migrazione in parallelo. È un rischio di avvio più che di prestazioni.
- `data/listino.json` è copiato nell'immagine (`COPY data ./data`): 30 MB in più per ogni pull, e il file si aggiorna ogni giorno da un job esterno. Il repository non mostra come il listino aggiornato arrivi nei container. L'immagine conserva quello dell'ultima build.

## Cosa non ho potuto verificare
- Nessuna misura reale: tempi, memoria e piani d'esecuzione sono ipotesi derivate dal codice e dai volumi del README.
- Non ho visto la configurazione del bilanciatore (compressione, timeout), né i parametri di Postgres.
- La tabella `sessions` è gestita dal login, che non è in questo repository.
- `web/style.css` non è stato letto (433 byte, irrilevante per i volumi).

## Ordine di intervento suggerito
1. Listino in memoria (P1, correzione piccola e a basso rischio).
2. Report aggregato in SQL e pool condiviso (P1).
3. Indice su `order_items(order_id)` e query unica per `GET /api/orders` (P2).
4. Creazione ordine in una transazione con aggiornamento atomico della giacenza (P1, tocca la correttezza: richiede la conferma dell'utente).
5. Debounce e rimozione di moment (P3).

Prima di ogni correzione vanno fatte le misure indicate sopra, in locale o in staging con dati sintetici.

**Nota sul modello.** Lavoro su un modello più piccolo di quello della sessione (Sonnet). I rilievi P1 non sono ancora definitivi: propongo il riesame del direttore AISA-01 o di un revisore su Opus prima di consolidarli.

— AISA-11 · BELLATRIX, Senior Performance Engineer, reparto AISA (AI Software)
