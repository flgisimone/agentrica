AISA-11 · BELLATRIX — Senior Performance Engineer, reparto AISA (AI Software)

Analisi in sola lettura delle prestazioni del gestionale di magazzino. Non ho eseguito test di carico né avviato processi. Non ho misurato nulla: i rilievi sono probabili e vanno confermati con le misure indicate. Il direttore AISA-01 e la biblioteca non erano disponibili in questa prova. Il tema della scheda nodejs-calendario non è toccato dai rilievi.

Volumi dal README: circa 12.000 prodotti, 300 negozi, 2.500 ordini al giorno nei picchi con 25 righe in media (circa 62.500 righe d'ordine al giorno), listino di circa 30 MB (circa 180.000 voci), due repliche, pool da 20 connessioni per replica.

## Rilievi

**1. P1 — Listino da 30 MB letto, decodificato e scansionato a ogni richiesta** (`server/routes/products.js:21-27`)
- `GET /api/products/:id/supplier-price` esegue `fs.readFileSync` e `JSON.parse` su 30 MB, poi `listino.items.find` sulle circa 180.000 voci.
- La lettura sincrona blocca l'event loop. Il parse porta a decine o centinaia di ms di CPU e a diverse decine di MB di heap per chiamata, e con più richieste vicine la memoria sale (rischio OOM).
- Ogni richiesta ferma tutte le altre sulla stessa replica, comprese quelle del webhook dei pagamenti.
- Come misurare: `--cpu-prof` o `clinic` in locale sulla singola rotta. Controllare il ritardo dell'event loop con `perf_hooks.monitorEventLoopDelay` e la memoria con `process.memoryUsage()` prima e dopo la chiamata.
- Direzione: caricare il listino una volta in una `Map` per sku e ricaricarla quando il file cambia (si aggiorna una volta al giorno), oppure importarlo in una tabella con indice su sku.

**2. P1 — Report vendite: legge tutte le righe d'ordine e filtra in JavaScript, con un Pool nuovo a ogni richiesta** (`server/routes/reports.js:9-21`)
- La query non ha `WHERE`: carica l'intera `order_items` in memoria. Sono circa 62.500 righe al giorno, quindi oltre 22 milioni all'anno. Il filtro per date e l'aggregazione per prodotto sono fatti in JS.
- `new Pool(...)` a ogni richiesta non viene mai chiuso con `pool.end()`: si perdono connessioni e socket, e Postgres può esaurire `max_connections`, con effetti anche sugli altri endpoint.
- `req.query.from` e `req.query.to` non sono validati: una data non valida dà `Invalid Date` e confronti sempre falsi.
- Come misurare: `EXPLAIN (ANALYZE, BUFFERS)` sulla query attuale e su una versione con `WHERE`. Contare le righe restituite, osservare il picco di memoria del processo e `pg_stat_activity` dopo qualche chiamata.
- Direzione: un'unica query con `WHERE o.created_at BETWEEN $1 AND $2 GROUP BY oi.product_id` e `SUM`, sul pool condiviso di `server/db.js`.

**3. P1 — Creazione ordine: query sequenziali per riga, senza transazione, con stock letto e poi scritto** (`server/routes/orders.js:31-42`)
- Per ogni riga (25 in media, fino a 200) ci sono 3 query seriali: SELECT, UPDATE e INSERT. Sono circa 75 round trip per ordine, fino a 600, più 3 query fisse.
- Non c'è transazione. La giacenza è letta e riscritta (`stock = $1` con valore calcolato in JS). Con ordini concorrenti sullo stesso prodotto si perdono aggiornamenti (overselling).
- Se una riga fallisce a metà (righe 36-37) l'ordine resta in `pending_payment` con totale nullo, e le giacenze già scalate non vengono ripristinate.
- Questo vale anche per la correttezza, oltre che per i tempi, e va segnalato all'Architect e al Database Engineer.
- Come misurare: timing della rotta con un ordine sintetico da 25 righe, `pg_stat_statements` per il conteggio delle query per richiesta, `log_min_duration_statement` in staging.
- Direzione: una transazione con un `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING price` per riga, oppure una sola query con `unnest`. Le righe si inseriscono in un unico INSERT multi-valori.

**4. P2 — Elenco ordini: N+1 sulle righe** (`server/routes/orders.js:14-18`)
- Fino a 200 ordini, e per ciascuno una query su `order_items`: fino a 201 query per chiamata, chiamata a ogni apertura della pagina (`web/app.js:77`) e dopo ogni ordine.
- Manca un indice su `order_items(order_id)`: Postgres non crea indici sulle chiavi esterne (`db/migrations/002_orders.sql:13-19`). Ogni query fa una scansione sequenziale su una tabella che cresce di circa 62.500 righe al giorno, e il costo cresce con i giorni.
- Come misurare: contare le query per richiesta, `EXPLAIN ANALYZE` su `SELECT ... FROM order_items WHERE order_id = $1`.
- Direzione: aggiungere l'indice `order_items(order_id)` con una nuova migrazione, e caricare le righe con una sola query `WHERE order_id = ANY($1)` o con `json_agg`.

**5. P2 — Ricerca prodotti con `ILIKE '%q%'` e `OFFSET`** (`server/routes/products.js:14-16`)
- Il pattern con `%` iniziale non può usare `products_name_idx` (btree): scansione sequenziale su circa 12.000 righe a ogni richiesta, che parte a ogni tasto (vedi rilievo 6).
- Con 12.000 righe il costo per singola query è probabilmente contenuto, ma conta per la frequenza. `OFFSET` è limitato a pagine da 100, ma resta lineare.
- Come misurare: `EXPLAIN ANALYZE` con un termine di ricerca tipico.
- Direzione: indice `pg_trgm` GIN su `name` solo se la misura mostra un problema. Per il caso senza ricerca l'indice su `name` serve già `ORDER BY`.

**6. P2 — Frontend: nessun debounce, risposte fuori ordine, caricamento da CDN che blocca il rendering** (`web/app.js:26`, `web/index.html:8`)
- Il campo di ricerca invia una richiesta a ogni tasto, senza debounce né annullamento (`AbortController`). Con 300 negozi e operatori aumenta il carico sul punto 5, e una risposta più lenta può sovrascrivere una più recente.
- `moment-with-locales.min.js` da jsdelivr è nel `<head>` senza `defer`, quindi blocca il rendering. Il pacchetto con tutte le lingue pesa decine di KB compressi, per formattare una data per cui `Intl.DateTimeFormat` basta e non costa nulla. Inoltre dipende da un servizio esterno.
- `app.js` è `type="module"`, quindi differito: se il CDN è lento o non raggiungibile `moment` non è definito e `caricaOrdini` fallisce.
- L'elenco dei prodotti è riscritto con `innerHTML` e un listener per bottone, a ogni tasto: con al massimo 50 righe per pagina il costo è basso. Non c'è paginazione nell'interfaccia (solo i primi 50).
- Come misurare: Lighthouse e pannello Network/Performance in staging.
- Direzione: debounce di circa 250 ms, `AbortController`, `Intl.DateTimeFormat("it-IT")` al posto di moment.

**7. P2 — Webhook pagamenti: due scritture non atomiche, con rischio di ritentativi e doppia fattura** (`server/routes/webhooks.js:15-24`)
- Il fornitore ritenta fino a 5 volte se non riceve 2xx entro 10 secondi. Se il loop è bloccato dal rilievo 1 o dal rilievo 2, la risposta può superare i 10 secondi e arrivano ritentativi.
- `UPDATE orders` e `INSERT INTO invoices` non sono in transazione e non sono idempotenti (nessun vincolo unico su `invoices.order_id`): un ritentativo duplica la fattura.
- Come misurare: tempo di risposta del webhook sotto carico concorrente in staging con firma sintetica, e conteggio di `invoices` per `order_id`.
- Direzione: transazione, e `UNIQUE (order_id)` con `ON CONFLICT DO NOTHING`.

**8. P3 — Autenticazione: una query al database per ogni richiesta `/api`** (`server/auth.js:6`)
- JOIN `sessions` e `users` su ogni chiamata; `sessions.token` è chiave primaria quindi indicizzato: costo basso. Con due repliche e 20 connessioni, il pool è condiviso con tutto il resto.
- Come misurare: `pg_stat_statements` (chiamate e tempo medio). Intervenire con una cache breve solo se la misura mostra un peso rilevante.

**9. P3 — Altri punti di scala**
- `db/migrations/002_orders.sql`: `unit_price real` (virgola mobile) nelle righe e `total` calcolato in JS con somme in virgola mobile: è un tema di correttezza, non di velocità, da passare al Database Engineer.
- Le migrazioni partono all'avvio nel `CMD` del Dockerfile con due repliche: avvii concorrenti possono applicare la stessa migrazione due volte (nessun lock). Rischio di avvio, non di prestazioni.
- `express.static` con `maxAge` di 1 ora, senza compressione né ETag esplicito (Express genera già l'ETag); la compressione è tipicamente demandata al bilanciatore: da verificare lì.
- Nessun indice su `orders(status)`: serve solo se verranno aggiunte viste per stato (oggi non ci sono query per stato).
- Pool da 20 connessioni per replica (40 in totale): da confrontare con `max_connections` di Postgres, tenendo conto che il report oggi ne perde (rilievo 2).

## Ordine suggerito
1. Rilievo 2 (Pool per richiesta), perché può esaurire le connessioni dell'intero sistema.
2. Rilievo 1 (listino) e rilievo 3 (transazione e stock).
3. Indice su `order_items(order_id)` e N+1 (rilievo 4).
4. Il resto, con misura prima di ogni intervento.

## Limiti
- Non ho eseguito nulla (nessun avvio, test o EXPLAIN): le stime di tempo sono qualitative e vanno confermate con le misure indicate. Non c'è un database in questa copia né i file di test (`npm test` non ha test da guardare).
- `data/listino.json` è un estratto: ho letto solo l'inizio.
- Non ho visto `deploy/`, i flussi CI e `style.css`: non ne ho valutato l'effetto sulle prestazioni.
- Il rilievo 3 e il rilievo 7 toccano la correttezza oltre alle prestazioni: servono la decisione dell'utente e il coinvolgimento di Architect e Database Engineer prima di qualsiasi modifica.
- Lavoro su un modello più piccolo di quello della sessione e ho tre rilievi P1: propongo il riesame del direttore AISA-01 o di un revisore su Opus prima che diventino definitivi.

— BELLATRIX (AISA-11)
