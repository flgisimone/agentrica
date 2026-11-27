AISA-04 · ANTARES — Senior Backend Developer, reparto AISA (AI Software)

Revisione read-only di `server/` (7 file, 199 righe). Non ho corretto nulla e non ho eseguito test né l'applicazione: i rilievi vengono dalla lettura del codice. Ho letto anche `package.json`, il `Dockerfile` e i nomi delle migrazioni, ma non il contenuto delle migrazioni. Ho consultato le schede della biblioteca mcp-2026-07-28, nodejs-calendario e typescript-7 (verificate il 2026-11-19). Non c'è codice MCP né TypeScript in `server/`, quindi nessuna delle tre dà rilievi. Il `Dockerfile` usa Node 22.11.0, cioè la linea 22 (Jod), ancora in LTS al 2026-11-19 secondo la scheda. Il tag è però fissato a una patch vecchia: vedi il rilievo P3.

Le righe sono in `server/`, tranne dove indicato.

**P0**
1. `routes/orders.js:22-44`, POST /api/orders, senza transazione e con una gara sulla giacenza.
   - Ordine, scalo della giacenza e righe sono query separate sul pool, senza `BEGIN`/`COMMIT`.
   - Se una riga fallisce (righe 36 e 37 rispondono 400 o 409), restano un ordine `pending_payment` senza righe o con righe parziali, e la giacenza già scalata dalle righe precedenti non viene ripristinata.
   - Lo scalo è `stock = $1` con il valore letto prima (righe 35 e 38). Due ordini concorrenti leggono la stessa giacenza e il secondo sovrascrive il primo: vendita oltre la giacenza e giacenza sbagliata.
   - Manca un `try/catch` e Express 4.21 non intercetta le promesse rifiutate. Un errore del database lascia la richiesta senza risposta e può causare `unhandledRejection`, che in Node termina il processo.
   - Correzione: una transazione su un client del pool (`pool.connect()`), `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1` e controllo di `rowCount`, `ROLLBACK` in caso di errore.
2. `routes/webhooks.js:15-23`, webhook dei pagamenti non idempotente.
   - Il fornitore ritenta fino a 5 volte (commento alla riga 14).
   - Ogni consegna di `payment.succeeded` esegue di nuovo `INSERT INTO invoices`, quindi più fatture per lo stesso ordine.
   - `UPDATE` e `INSERT` non sono in transazione: se la seconda fallisce, l'ordine risulta pagato senza fattura, e il ritentativo aggiorna di nuovo `paid_at`.
   - Mancano `try/catch` e controllo dell'esistenza dell'ordine. Con `event.data.metadata` assente, `JSON.parse` malformato (riga 17) o `event.data.amount` assente (riga 21) l'handler va in rifiuto e il fornitore ritenta.
   - Correzione: transazione, un vincolo UNIQUE su `invoices.order_id` (nelle migrazioni ho visto solo la creazione della tabella, non i suoi vincoli) con `ON CONFLICT DO NOTHING`, e aggiornare solo se `status <> 'paid'`.
3. `routes/orders.js:29-31`, un ruolo non-shop può usare un `customerId` qualsiasi.
   - Con un ruolo diverso da `shop`, `customerId` viene preso dal body senza validazione: assente, non UUID o inesistente.
   - Il rischio è un errore di database non gestito (vedi P0-1) o un ordine intestato a un cliente arbitrario.
   - Non ho verificato quali ruoli esistano oltre a `shop`, `warehouse` e `admin`.

**P1**
4. `auth.js:4-10`, `requireUser` è `async` senza `try/catch`.
   - Un errore del database o un token malformato fanno rifiutare la promessa e Express 4 non la gestisce: la richiesta resta appesa o il processo cade.
   - Con una sessione scaduta o assente la risposta è 401, ma un errore interno non diventa mai 500. Lo stesso vale per quasi tutti gli handler async: `orders.js` GET e POST, `products.js` GET, `/supplier-price`, PATCH e DELETE, `reports.js` e `webhooks.js` non hanno `try/catch`. Solo il PATCH di `orders.js` (riga 46) ce l'ha.
   - Correzione alla causa: un wrapper unico per gli handler async, oppure l'aggiornamento a Express 5.
5. `routes/orders.js:46-56`, PATCH /:id/status.
   - Non verifica che l'ordine esista: risponde `{ok: true}` anche per un id inesistente.
   - Non controlla le transizioni di stato. Da `shipped` si può tornare a `pending_payment`, o passare a `paid` senza il webhook e senza fattura.
   - Annullare un ordine (`cancelled`) non rimette a magazzino la giacenza scalata alla creazione.
   - Ruolo: la guardia è scritta a mano alla riga 50, dopo la validazione, invece di `requireRole`, ma l'esito è corretto.
6. `routes/orders.js:6-20`, GET /api/orders.
   - Un `from` non valido viene passato a Postgres e produce un errore non gestito (vedi P1-4).
   - Problema N+1: per ogni ordine (fino a 200) una query sulle righe, cioè fino a 201 query per richiesta. Si risolve con una sola query `WHERE order_id = ANY($1)`.
7. `routes/reports.js:8-23`, report vendite.
   - Crea un `new Pool` a ogni richiesta e non lo chiude: perdita di connessioni. Dovrebbe usare il pool condiviso di `db.js`.
   - Legge tutte le righe di vendita senza filtro e filtra in memoria in JavaScript. `from` e `to` non sono validati (un `Invalid Date` fa scartare silenziosamente tutte le righe), e il filtro andrebbe fatto nella query con `WHERE o.created_at BETWEEN $1 AND $2`.
   - Il costo è non limitato e crescente: è un vettore di esaurimento della memoria o delle connessioni anche per un admin.
   - Il ricavo somma `quantity * unit_price` con numeri in virgola mobile, e `pg` restituisce i `numeric` come stringhe. In quel caso `+=` concatena stringhe e produce un risultato sbagliato. Non ho verificato il tipo della colonna.
8. `routes/products.js:21-27`, supplier-price.
   - La rotta è accessibile a qualsiasi utente autenticato, compreso `shop`, e restituisce il prezzo di acquisto del fornitore, un dato riservato (verifica da confermare con l'analista funzionale).
   - Manca `requireRole`.
   - `fs.readFileSync` e `JSON.parse` dell'intero listino a ogni richiesta bloccano l'event loop. Andrebbe letto una volta, o in modo asincrono con cache. Un listino mancante o corrotto dà un errore non gestito.
9. `routes/products.js:46-49`, DELETE.
   - Cancella senza controllare i riferimenti. Se ci sono righe d'ordine il database darà un errore di chiave esterna non gestito (vedi P1-4). Altrimenti si perde lo storico.
   - Risponde 204 anche se il prodotto non esiste.
   - Servirebbe una cancellazione logica o un 409 esplicito.

**P2**
10. `routes/orders.js:25-28`, validazione delle righe.
    - `quantity` è accettata se `Number(...) > 0`, quindi vanno bene decimali (1.5) e `Infinity`, mentre la giacenza è intera. Serve `Number.isInteger`.
    - `l.productId` non è validato (tipo, formato).
    - Se la stessa riga compare due volte la giacenza viene scalata due volte, e il controllo (riga 37) usa la giacenza letta prima dello scalo.
    - `req.body` può essere `undefined` o non un oggetto con `Content-Type` diverso da JSON: l'accesso a `req.body.lines` va in errore.
    - Il controllo dell'esistenza del prodotto e quello della giacenza rispondono dopo aver già scritto (vedi P0-1).
11. `routes/products.js:29-44`, PATCH.
    - L'`id` non è validato.
    - Un prodotto inesistente risponde `{ok: true}`.
    - I nomi delle colonne nel template SQL vengono da chiavi interne (`stock`, `price`), quindi non c'è iniezione, ma lo schema è fragile.
    - Un `price` non finito o con troppi decimali non è controllato.
    - Il prezzo non ha limite superiore.
12. `app.js:6-8`, `app.js:15-20`.
    - `express.raw({type: "application/json"})` sul prefisso `/webhooks` è corretto per la firma. L'ordine rispetto a `express.json` è giusto, quindi nessun difetto.
    - `app.listen` parte senza verificare le variabili d'ambiente: se `PAYMENTS_WEBHOOK_SECRET` manca, `createHmac` lancia a ogni webhook, e se manca `DATABASE_URL` l'errore appare solo alla prima query.
    - Il gestore errori stampa l'errore intero con `console.error(err)`, che può includere parametri SQL e dati personali nei log.
    - Non c'è arresto ordinato (SIGTERM, `pool.end()`), un limite di frequenza sul login e sugli endpoint, né intestazioni di sicurezza (`helmet`). Questi ultimi sono temi da passare al reparto cybersecurity, non da approfondire qui.
13. `auth.js:5-6`.
    - Un token vuoto o più lungo di una soglia raggiunge comunque il database.
    - Il token è confrontato in chiaro in SQL (`s.token = $1`) e non come hash. Se la tabella `sessions` viene esposta, i token sono utilizzabili. Da valutare con la cybersecurity.
14. `db.js:3`: `max: 20` senza `statement_timeout` né timeout di connessione. Con le query lente di P1-6 e P1-7 il pool può esaurirsi. Manca il gestore `pool.on('error')`.
15. `routes/webhooks.js:7-12`: `validSignature` è corretta (HMAC con confronto a tempo costante e controllo della lunghezza). Manca la protezione dal riuso della stessa richiesta (timestamp o id evento). Rientra comunque nell'idempotenza di P0-2.

**P3**
16. Il `Dockerfile` fissa `node:22.11.0`, una patch vecchia della linea 22 che è ancora in LTS: valutare un tag con patch più recente o la LTS più recente supportata dalle dipendenze, 24 o 26 (scheda nodejs-calendario, 2026-11-19). Manca `engines` in `package.json`.
17. `routes/products.js:15`: nella ricerca `ILIKE` con `%${q}%`, i caratteri `%` e `_` inseriti dall'utente non vengono scappati, quindi la ricerca ha un comportamento inatteso, senza rischio di iniezione. Non c'è un limite alla lunghezza di `q`.
18. Nessun file di test in `server/`: `npm test` esegue `node --test`, ma non ho trovato test del lato server. Le parti critiche (ordini, webhook) sono scoperte.

**Punti verificati e corretti.** Le query sono tutte parametrizzate, senza iniezione SQL. La firma del webhook usa il confronto a tempo costante. Il ruolo `shop` è limitato al proprio `customer_id` nella lista ordini. Il limite di 100kb sui body è presente. `limit` e `offset` dei prodotti sono clampati.

**Domande aperte.** Quali ruoli esistono e chi può creare ordini per conto di un cliente? Il `supplier-price` è destinato anche a `shop`? Qual è il tipo di `total`, `price` e `unit_price` (`numeric` o `float`)? `invoices.order_id` ha un vincolo UNIQUE? Queste verifiche richiedono la lettura delle migrazioni, che non ho fatto.

**Nota sul modello.** Sono su Sonnet. I rilievi P0 (P0-1, P0-2, P0-3) vanno confermati dal direttore AISA-01 o da un revisore su Opus prima di diventare definitivi.

Firmato: AISA-04 · ANTARES.
