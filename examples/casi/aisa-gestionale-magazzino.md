# Caso AISA · gestionale-magazzino (F37, prima ondata)

- **Agenti**: cinque specialisti AISA, ognuno con il suo compito: AISA-04 Backend, AISA-05 Frontend, AISA-07 Database, AISA-10 DevOps, AISA-11 Performance
- **Progetto**: [`progetti/gestionale-magazzino`](../progetti/gestionale-magazzino/), gestionale di un distributore all'ingrosso: API Express e Postgres (`server/`), pagina web (`web/`), migrazioni (`db/`), CI (`.github/workflows/`), immagine e deploy (`Dockerfile`, `deploy/`)
- **Perché**: ruoli software simili ad AISA-09 e AISA-08, passati su Sonnet e Haiku in F24, su difetti di correttezza, concorrenza, integrità, rilascio e prestazioni che non si vedono da una riga sola.

## Compiti (argomento `task`, da copiare così come sono)

| Agente | Compito |
|---|---|
| AISA-04 | Esegui una revisione read-only del codice lato server in `server/` (API, validazioni, permessi, errori, transazioni, concorrenza, integrazioni) e riporta i difetti con priorità, file e riga. Non correggere nulla. |
| AISA-05 | Esegui una revisione read-only del frontend in `web/` (stati di caricamento, errore, vuoto e successo, integrazione con l'API, form, accessibilità di base) e riporta i difetti con priorità, file e riga. Non correggere nulla. |
| AISA-07 | Esamina in sola lettura schema e migrazioni in `db/` e le query di `server/`: riporta i difetti di integrità, vincoli, tipi, indici e migrazioni (anche il modo in cui si applicano), con priorità, file e riga. Non correggere nulla. |
| AISA-10 | Esamina in sola lettura CI/CD, immagine e deploy (`.github/workflows/`, `Dockerfile`, `deploy/`): riporta i difetti di pipeline, segreti, build, rilascio, rollback e controlli di salute, con priorità, file e riga. Non correggere nulla. |
| AISA-11 | Analizza in sola lettura le prestazioni di questo progetto (query e accesso al database, endpoint, rendering e risorse del frontend) con i volumi del README: riporta i colli di bottiglia probabili con priorità, file e riga e come misurarli. Non eseguire test di carico. |

## AISA-04 · Backend

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| B1 | Giacenza letta e poi scritta con il valore calcolato in JS (`stock = $1`): due ordini concorrenti leggono la stessa giacenza e la vendono due volte (lost update) | `server/routes/orders.js`, `POST /` | concorrenza |
| B2 | Ordine, righe e giacenze senza transazione: un errore o un `return` a metà (prodotto inesistente, giacenza insufficiente) lascia l'ordine creato e le giacenze già scalate | `server/routes/orders.js`, `POST /` | transazioni |
| B3 | `Number(l.quantity)` con il solo controllo `> 0` accetta quantità decimali (`2.5`): le colonne sono intere e Postgres rifiuta il valore a metà ordine, dopo le righe già scritte (serve `Number.isInteger`) | `server/routes/orders.js`, `POST /` | validazione |
| B4 | Gestori `async` di Express 4 senza `try/catch` né `next(err)`: un errore del database non arriva al gestore degli errori, la richiesta resta appesa e in Node 22 il rifiuto non gestito ferma il processo (lo fa solo `PATCH /:id/status`) | `server/routes/*.js`, `server/auth.js` | gestione degli errori |
| B5 | Il webhook dei pagamenti non è idempotente: il fornitore ritenta fino a 5 volte e ogni ritentativo crea un'altra fattura (nessun controllo sull'id dell'evento né sullo stato dell'ordine) | `server/routes/webhooks.js` | idempotenza |
| B6 | `warehouse` può cambiare il prezzo con `PATCH /api/products/:id`, mentre il README lo riserva ad `admin` | `server/routes/products.js`, `PATCH /:id` | permessi lato server |

## AISA-05 · Frontend

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| F1 | Il pulsante d'invio non si disattiva durante la richiesta: un doppio clic crea due ordini | `web/app.js`, `submit` | doppio invio |
| F2 | Nessun controllo di `res.ok`: con un 400 o 409 la pagina dice «Ordine undefined creato» e svuota il carrello | `web/app.js`, `submit` | stato di errore |
| F3 | Una richiesta per tasto, senza annullare le precedenti: una risposta lenta più vecchia sovrascrive quella della ricerca più recente | `web/app.js`, `caricaProdotti` | condizione di gara |
| F4 | Se la richiesta fallisce l'indicatore «Caricamento…» resta visibile per sempre (nessun `try/finally`), e una ricerca senza risultati mostra una lista vuota senza messaggio | `web/app.js`, `caricaProdotti` | stati di errore e vuoto |
| F5 | `innerHTML` con `p.name` (testo dal database, scritto dall'import o da `admin`): XSS | `web/app.js`, `caricaProdotti` | CWE-79 |
| F6 | «Togli» è uno `span` con `click`: non si raggiunge con la tastiera e non ha ruolo né nome accessibile | `web/app.js`, `disegnaOrdine` | WCAG 2.1.1, 4.1.2 |

## AISA-07 · Database

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| D1 | `order_items.unit_price` è `real` mentre `products.price` è `numeric(10,2)`: arrotondamenti sui prezzi storici e sui report | `db/migrations/002_orders.sql` | tipi monetari |
| D2 | `order_items.product_id … ON DELETE CASCADE`: cancellare un prodotto cancella le righe degli ordini passati (totali e fatture senza righe) | `db/migrations/002_orders.sql` | integrità |
| D3 | Nessun indice su `order_items(order_id)`: la chiave esterna non è indicizzata e ogni lettura delle righe di un ordine scorre la tabella | `db/migrations/002_orders.sql` | indici |
| D4 | Nessun `CHECK (stock >= 0)` sulla giacenza: il database accetta giacenze negative | `db/migrations/001_init.sql`, `004_stock.sql` | vincoli |
| D5 | `ADD COLUMN sku text NOT NULL` senza valore predefinito su una tabella con 12.000 righe: la migrazione fallisce; va divisa (colonna nullable, riempimento, poi `NOT NULL`), e l'indice univoco senza `CONCURRENTLY` blocca le scritture | `db/migrations/003_sku.sql` | migrazioni |
| D6 | `RENAME COLUMN qty TO stock` in un passo solo: con due repliche e aggiornamento `start-first`, la versione vecchia ancora attiva usa `qty` e si rompe; serve espandi e contrai | `db/migrations/004_stock.sql` | migrazioni additive |
| D7 | `migrate.js` esegue il file e la sua riga in `schema_migrations` come due comandi separati, senza una transazione comune: se il processo cade fra i due la migrazione è applicata ma non registrata, e l'esecuzione successiva fallisce | `db/migrate.js` | migrazioni |
| D8 | `invoices.order_id` senza `UNIQUE`: il database accetta più fatture per lo stesso ordine | `db/migrations/002_orders.sql` | vincoli |

## AISA-10 · DevOps

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| O1 | `build` non dipende da `test` e `deploy` dipende solo da `build`: su `main` si va in produzione anche con test o lint rossi | `.github/workflows/ci.yml` | pipeline |
| O2 | I segreti di produzione finiscono in `.env`, che viene caricato come artefatto della build: chiunque legga le Actions del repository li scarica | `.github/workflows/ci.yml`, job `build` | segreti |
| O3 | Il deploy usa `:latest` e il rollback `:previous`, che nessuno pubblica: il rollback non funziona e non si sa quale versione gira | `deploy/docker-compose.prod.yml`, `deploy/rollback.sh` | rollback |
| O4 | Le migrazioni partono all'avvio di ogni contenitore (`npm run migrate && node …`): con due repliche girano in parallelo, e durante l'aggiornamento `start-first` cambiano lo schema sotto la versione vecchia | `Dockerfile`, `CMD` | rilascio |
| O5 | Il controllo di salute chiede `/`, cioè la pagina statica: il contenitore risulta sano anche con il database irraggiungibile, e l'aggiornamento prosegue | `deploy/docker-compose.prod.yml`, `healthcheck` | controlli di salute |
| O6 | `pull_request_target` con checkout del codice della PR (anche da fork) ed esecuzione di `npm ci && npm test` con i segreti di staging e di anteprima: codice esterno con i segreti | `.github/workflows/preview.yml` | segreti, CI |

## AISA-11 · Performance

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| P1 | N+1: `GET /api/orders` fa una query per ordine per le righe (fino a 201 query per richiesta), aggravata dall'indice mancante su `order_items(order_id)` | `server/routes/orders.js`, `GET /` | query |
| P2 | Il report delle vendite legge tutte le righe di tutti gli ordini di sempre e filtra e somma in JS: serve `WHERE` sulle date e `GROUP BY` in SQL | `server/routes/reports.js` | query |
| P3 | `new Pool()` a ogni richiesta del report, mai chiuso: le connessioni si accumulano fino al limite di Postgres | `server/routes/reports.js` | connessioni |
| P4 | `readFileSync` e `JSON.parse` di un file da 30 MB a ogni richiesta del prezzo del fornitore: blocca il ciclo degli eventi per tutti | `server/routes/products.js`, `GET /:id/supplier-price` | I/O sincrono |
| P5 | Ricerca con `ILIKE '%q%'`: l'indice B-tree su `name` non serve con il carattere jolly iniziale (serve un indice trigram) | `server/routes/products.js`, `GET /` | indici |
| P6 | Una richiesta di ricerca per ogni tasto, senza attesa (debounce) | `web/app.js`, `input` | frontend |
| P7 | `moment-with-locales` intero, sincrono nell'`<head>` (blocca il rendering), per un solo formato di data che `Intl.DateTimeFormat` già fa | `web/index.html`, `web/app.js` | peso delle risorse |

## Trappole: parti corrette da non segnalare come difetto

| # | Cosa | Perché è corretta | Ruoli |
|---|---|---|---|
| T1 | `SET ${sets}` costruito in `PATCH /products/:id` | i nomi delle colonne vengono da chiavi fisse, i valori sono parametri | AISA-04, AISA-07 |
| T2 | Firma del webhook con HMAC sul corpo grezzo e `timingSafeEqual` | verifica corretta | AISA-04 |
| T3 | `limit` della lista dei prodotti limitato fra 1 e 100 | paginazione limitata | AISA-04, AISA-11 |
| T4 | `PATCH /:id/status` con `try/catch` e `next(err)` | il gestore degli errori riceve l'errore | AISA-04 |
| T5 | Ordini del negozio filtrati per `customer_id` | ogni negozio vede i suoi | AISA-04 |
| T6 | `Intl.NumberFormat` per gli euro e `textContent` nelle righe dell'ordine | formattazione corretta, nessun HTML | AISA-05 |
| T7 | `role="status"` con `aria-live`, `label` della ricerca, stili `:focus-visible` | accessibilità di base presente | AISA-05 |
| T8 | `timestamptz` con `DEFAULT now()`, `CHECK` sullo stato e sul prezzo, `vat_number UNIQUE` | vincoli corretti | AISA-07 |
| T9 | `sessions … ON DELETE CASCADE` sull'utente | le sessioni di un utente cancellato vanno cancellate | AISA-07 |
| T10 | Indici `orders(created_at)` e `orders(customer_id, created_at)` | coprono i filtri di `GET /api/orders` | AISA-07, AISA-11 |
| T11 | Azioni fissate per SHA, `permissions: contents: read`, `environment: production` sul deploy | configurazione corretta | AISA-10 |
| T12 | Immagine in due fasi, `npm ci --omit=dev`, Node fissato, `USER node` | build corretta | AISA-10 |
| T13 | Chiave SSH in un file temporaneo con `chmod 600`, cancellato da `trap`, `StrictHostKeyChecking=yes` | gestione corretta | AISA-10 |
| T14 | Rotazione dei log (`max-size`, `max-file`) | log limitati | AISA-10 |
| T15 | `express.static` con `maxAge: "1h"` | cache dei file statici | AISA-11 |

Un rilievo che presenta una trappola come difetto conta come **falso**; un consiglio di irrobustimento su di essa no.

## Accettabili ma non richiesti

Non contano come falsi né come extra validi.

- **AISA-04**: `customerId` dal corpo per `warehouse` e `admin` non verificato; importo del webhook non confrontato con il totale dell'ordine; date del report non validate; `price` restituito come stringa da `pg` e moltiplicato in JS; nessun test; `DELETE` di un prodotto con ordini.
- **AISA-05**: `caricaOrdini` senza gestione degli errori; invio di un ordine vuoto; token in `sessionStorage`; nessuno stato «nessun ordine»; quantità non modificabile; `output` senza etichetta.
- **AISA-07**: nessuna migrazione di ritorno per 001–003; `customers.email` senza `UNIQUE`; `orders.total` nullable; `order_items` senza `UNIQUE (order_id, product_id)`; nessun indice trigram (lo trova anche AISA-11).
- **AISA-10**: `deploy/preview.sh` non c'è; `rollback.sh` senza chiave; `docker stack deploy` con lo stesso tag che può non scaricare l'immagine nuova; nessun ambiente di staging prima della produzione; nessuna scansione delle immagini; `.env` non usato dall'immagine.
- **AISA-11**: `LIMIT/OFFSET` con offset grandi; nessuna compressione delle risposte; pool da 20 connessioni con due repliche; `JSON.parse` del webhook; nessuna cache sul listino (consegue da P4).

## Chiarimenti dopo la prima ondata (2026-11-24)

Dalle proposte dei valutatori di F37 ([risultato](../risultati/2026-11-23-ondata-1.md)). I conteggi del 2026-11-24 sono stati fatti con la scheda di prima e restano come sono.

- **Trappola nuova, T16**: `004_stock.down.sql` contiene `RENAME COLUMN stock TO qty`, ma `migrate.js` esclude i file `.down.sql`. Attribuire quel `RENAME` alla 003, o dire che le migrazioni falliscono su un database nuovo, è falso (è successo con Opus e con Sonnet).
- **T13**: la gestione della chiave SSH resta corretta; notare che nessun passo fornisce `known_hosts` con `StrictHostKeyChecking=yes` è un extra valido per AISA-10, non un falso su T13.
- **T15**: per AISA-05 e AISA-11, notare che senza nomi con impronta un client può tenere `app.js` vecchio per un'ora è irrobustimento; presentare la cache come difetto resta falso.
- **D7 e O4**: il lock fra le repliche appartiene a O4; un rilievo che li unisce li conta entrambi solo se nomina transazione e lock.
- **F4**: conta trovato se il rilievo nomina almeno lo spinner che resta acceso senza `finally`.
- **B3**: conta trovato se il rilievo nomina il controllo che accetta decimali e la colonna intera.
- Con date non valide il report confronta con `Invalid Date`, i confronti sono falsi e il filtro non esclude nulla: il report include tutto, non esce vuoto (errore marginale, non falso).

Accettabili aggiunti:

- **AISA-04**: `GET /:id/supplier-price` senza `requireRole` (il negozio legge il prezzo d'acquisto); `PATCH /:id/status` senza regole di transizione; token di sessione in chiaro; `PAYMENTS_WEBHOOK_SECRET` non verificato all'avvio; `%` e `_` non neutralizzati nell'`ILIKE`; nessun `pool.on("error")`; `PATCH` della giacenza con valore assoluto.
- **AISA-05**: invio senza `try/catch` sugli errori di rete; token assente o 401 non gestiti, nessun rimando al login; moment da CDN senza SRI; risultati troncati a 50 senza paginazione; pulsanti «Aggiungi» tutti con lo stesso nome; «Caricamento…» fuori da una regione live; stato dell'ordine come codice interno; `customerId` non inviato per `warehouse` e `admin`.
- **AISA-07**: vincolo fra ruolo `shop` e `users.customer_id`; token di sessione in chiaro; indici su `order_items(product_id)` e `sessions`; transizioni di stato non vincolate e annullamento senza ripristino della giacenza.
- **AISA-10**: `known_hosts` mancante sul runner; `update_config` senza `failure_action: rollback`; listino da 30 MB copiato nell'immagine; Postgres della CI senza `pg_isready`; nessun `.dockerignore`; nessun `concurrency` sul deploy; nessun backup del database; `sh -c` come PID 1 senza gestione di SIGTERM; compose applicato da `/srv/magazzino` invece di quello versionato; `.down.sql` mai eseguiti; semplificazioni della copia (`eslint.config.js` mancante, lockfile ridotto, `DATABASE_URL` non passato a `npm test`).
- **AISA-11**: round trip in sequenza di `POST /api/orders` (circa 77 query per un ordine medio); indice su `order_items(product_id)` per il `DELETE` a cascata; righe d'ordine caricate da `GET /api/orders` e non usate dalla pagina; pagina rotta se il CDN di moment non risponde; query di sessione a ogni richiesta; listener riassegnati a ogni ridisegno; pool senza `statement_timeout`.


## Regole di conteggio

Quelle del [README](../README.md#come-si-conta). Ogni esecuzione si conta solo sulla tabella del suo ruolo: un difetto di un altro ruolo trovato in più non è extra valido ma accettabile. Un rilievo che unisce due difetti della tabella li conta entrambi se nomina tutte e due le cause.
