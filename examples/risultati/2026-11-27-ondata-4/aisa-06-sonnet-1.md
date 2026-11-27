AISA-06 · POLLUX — Senior Full Stack Developer, reparto AISA (AI Software)

Revisione read-only di `funzioni/resi/` (migrazione, rotte, pagina) rispetto a `richieste/resi.md` e al resto del progetto. Non ho corretto né scritto nulla. Non ho eseguito test né comandi sul codice: il progetto non ha test e la funzione non è ancora montata. Non ho caricato AISA-01, perché il compito era una revisione diretta.

Schede consultate: typescript-7 (non pertinente, il progetto è JS), nodejs-calendario (Node.js, verificata il 2026-11-19; il progetto è su Node 22.11.0, LTS Jod, supportata) e mcp-2026-07-28 (non pertinente).

## Esito
La funzione non è unibile così com'è. Ci sono 5 rilievi P0, 7 rilievi P1 e altri di priorità minore. I punti più gravi: nessun controllo di proprietà sull'ordine, importo deciso dal client, nessuna transazione e nessun limite alla quantità, giacenza aggiornata senza atomicità.

Sono rilievi dell'agente POLLUX su un modello più piccolo (Sonnet 5.5). I P0 e i P1 vanno fatti riesaminare dal direttore AISA-01 o da un revisore su Opus prima che diventino definitivi.

## P0

**1. Il negozio può rendere righe di ordini altrui.**
- `funzioni/resi/server/returns.js:30-35` cerca la riga solo per `id` e `order_id`, senza verificare che l'ordine appartenga a `req.user.customer_id`.
- Un negozio può quindi aprire un reso su un ordine di un altro negozio (IDOR), e il reso va ad aumentare la giacenza.
- La GET dell'elenco (righe 8-22) filtra per cliente, la POST no.
- Manca anche il controllo del ruolo: la rotta è aperta a `shop`, `warehouse` e `admin`. Un `warehouse` o un `admin` hanno `customer_id` nullo.

**2. L'importo del rimborso lo decide il client.**
- `returns.js:26,38-39` prende `amount` dal corpo della richiesta e lo salva senza validarlo: può essere negativo, enorme, `NaN` o una stringa.
- Contraddice R5: l'importo deve essere calcolato dal prezzo della riga per la quantità resa. Nella rotta non c'è nessun calcolo.
- Il prezzo vero è `order_items.unit_price` (`db/migrations/002_orders.sql:18`), che la rotta non legge.
- La stessa mancanza è nella pagina `funzioni/resi/web/resi.html:20-21`, che chiede l'importo al negozio.
- Il PATCH del magazzino (righe 50-55) accetta qualunque `amount >= 0`, anche superiore al valore della riga.
- Rischio diretto sul criterio di accettazione «nessun errore nelle fatture».

**3. Nessun limite sulla quantità resa.**
- `returns.js:27-28` controlla solo che sia un intero. Sono ammessi zero, negativi e quantità maggiori di quella ordinata.
- Con un valore negativo la giacenza diminuisce. Con un valore enorme la giacenza si gonfia.
- Non si tiene conto dei resi già aperti sulla stessa riga: si può rendere più volte la stessa merce.
- La colonna `quantity` della tabella `returns` (`funzioni/resi/db/005_returns.sql:6`) non ha il `CHECK (quantity > 0)`.
- Il campo HTML `min=1` (`resi.html:19`) è solo lato client.

**4. Il campo del form e la rotta non coincidono, quindi il flusso non funziona.**
- Il form ha `name="qty"` (`resi.html:19`) e `resi.js:17` lo invia come `{qty: ...}`.
- La rotta legge `req.body.quantity` (`returns.js:27`): arriva `undefined`, `Number(undefined)` dà `NaN`, e la rotta risponde sempre «quantità non valida».
- La pagina non può aprire nessun reso.
- Di conseguenza, il percorso reale di inserimento non è mai stato provato.

**5. Il reso accettato non fa nulla sulla fattura, e manca una verifica obbligatoria dell'ordine.**
- R6 chiede di modificare la fattura originale. Non esiste codice che lo faccia: `invoices` (`db/migrations/002_orders.sql:21-26`) non è toccata dalla funzione.
- Il reso nasce già `accepted` (`005_returns.sql:8`), senza passare dal magazzino, in contrasto con R3 e R4.
- Modificare l'importo di una fattura già emessa non è la via corretta: serve una nota di credito, con una scelta fiscale da confermare con l'utente e con l'amministrazione.
- Per questo rilievo serve una decisione dell'utente prima di scrivere codice.
- La rotta non controlla nemmeno che l'ordine sia stato consegnato (`status = 'shipped'`) né la finestra di giorni di R1. Non c'è una data di consegna: `orders` ha solo `created_at` e `paid_at`.
- Si può quindi rendere merce di un ordine non pagato, annullato o mai spedito.

## P1

**6. La giacenza viene aggiornata con lettura e poi scrittura, senza transazione.**
- `returns.js:43-44` fa `SELECT stock` e poi `UPDATE ... SET stock = $1` con il valore calcolato in JavaScript.
- Con due repliche (README) e richieste concorrenti si perdono aggiornamenti.
- Lo stesso schema è usato in `server/routes/orders.js:35-38`, che ha già il problema, ma la nuova funzione lo ripete invece di usare `stock = stock + $1`.
- Dopo l'`INSERT` e prima dell'`UPDATE` un errore lascia il reso registrato senza che la giacenza sia tornata.
- Va usata una transazione sul client `pool` (oggi `server/db.js` espone solo `query`, che non permette transazioni).

**7. Nessuna gestione degli errori nelle rotte.**
- Express 4 non intercetta i rifiuti delle funzioni `async`. Gli `await` in `returns.js:8-55` non hanno `try/catch` né `next(err)`.
- Qualunque errore del database (per esempio un ID non numerico, un `orderId` inesistente o una violazione di chiave esterna) lascia la richiesta senza risposta.
- Lo stesso difetto può far terminare il processo con un rifiuto non gestito.
- `server/routes/orders.js:46-56` fa invece `try/catch` con `next(err)`.
- `product[0]` (`returns.js:44`) può essere `undefined` se il prodotto è stato eliminato.

**8. Il PATCH del magazzino non verifica l'esistenza del reso e non lascia traccia.**
- `returns.js:53` risponde 204 anche se l'`id` non esiste.
- Non ci sono storico, autore né data della correzione (nessuna colonna `updated_by` o `updated_at`).
- Nessun controllo sullo stato del reso: si può correggere un reso già rimborsato.
- `req.params.id` non è validato come intero.

**9. L'importo è una colonna `real`.**
- `005_returns.sql:7` usa `real` (virgola mobile) per i soldi, mentre `invoices.amount` e `orders.total` sono `numeric(12,2)`.
- Gli arrotondamenti produrranno differenze di centesimi rispetto alle fatture.
- `order_items.unit_price` è `real`, un difetto già presente nel progetto, che si propaga ai calcoli del reso.
- Lo `status` è `text` senza `CHECK`, a differenza di `orders.status` (`002_orders.sql:5`).
- `order_item_id` non ha chiave esterna verso `order_items` (`005_returns.sql:5`): serve `REFERENCES order_items(id)`.

**10. La numerazione della migrazione e la posizione dei file non sono pronte per essere unite.**
- La migrazione è in `funzioni/resi/db/005_returns.sql` e non in `db/migrations/`, e `db/migrate.js:8` legge solo quella cartella.
- Il README della funzione dice «da aggiungere alle migrazioni» e il file dipende dall'esistenza di `orders`, quindi il numero 005 è corretto dopo la 004.
- Manca un `005_returns.down.sql`, mentre la 004 ne ha uno (`db/migrations/004_stock.down.sql`).
- `db/migrate.js:13-14` applica ogni migrazione senza transazione: se fallisce a metà, il file resta applicato a metà e senza riga in `schema_migrations`, oppure il contrario.
- Con due repliche e `npm run migrate && node server/app.js` nel `Dockerfile:17` due repliche possono applicare la stessa migrazione insieme (nessun lock): è un difetto del progetto, ma la nuova tabella lo eredita.
- Nota correlata: `db/migrations/003_sku.sql:2` aggiunge una colonna `NOT NULL` senza valore predefinito su una tabella con 12.000 prodotti, e fallisce se la tabella non è vuota. Non riguarda i resi.

**11. Le rotte non sono montate in `server/app.js`.**
- `server/app.js:10-13` non include `/api/returns`.
- Il README della funzione dice di montarle dopo `requireUser`.
- `funzioni/resi/web/resi.html` e `resi.js` non sono nella cartella servita da `express.static` (`web/`), quindi la pagina non è raggiungibile.
- La pagina non ha un collegamento da `web/index.html`.
- Il percorso `/style.css` della pagina (`resi.html:7`) va bene solo se il file è copiato in `web/`.

**12. La pagina non segue R2 e R7.**
- R2: il negozio deve scegliere la riga dell'ordine. Il form chiede invece di digitare a mano gli ID numerici di ordine e riga (`resi.html:15-17`), che il negozio non conosce.
- R7: l'elenco dei resi non mostra prodotto, data o stato leggibile (`resi.js:11` stampa `r.status` grezzo, `accepted`).
- `GET /api/returns` non restituisce il nome del prodotto né l'`order_item_id`.
- Il limite di 200 righe (`returns.js:18`) non ha paginazione.

## P2

**13. HTML costruito con `innerHTML` da dati non fidati.**
- `funzioni/resi/web/resi.js:10-12` inserisce `r.note` (testo libero scritto dal negozio) in `innerHTML` senza escape: XSS memorizzato. L'operatore del magazzino, che vede tutti i resi, è il bersaglio.
- Va usato `textContent` o la costruzione dei nodi, come in `web/app.js:40-51`.
- Lo stesso schema è in `web/app.js:19` e `web/app.js:72`, già presenti nel progetto.

**14. Nessuna gestione degli errori di rete o della sessione nella pagina.**
- `resi.js:8-9` non controlla `res.ok`. Con un 401 `rows` è un oggetto e `rows.map` genera un errore.
- `resi.js:28` assume che la risposta d'errore sia JSON.
- Nessuno stato di caricamento, nessun blocco del pulsante durante l'invio: un doppio clic apre due resi.
- Nessuna idempotenza lato server.
- Il messaggio non avvisa che l'azione è irreversibile: per il negozio non c'è un modo di annullare il reso.

**15. Nessun limite di frequenza e nessuna validazione della lunghezza di `note`.**
- Il corpo ha un limite di 100 kb (`server/app.js:7`), ma `note` non è limitato e finisce nella tabella.

**16. Il ruolo `warehouse` non può rifiutare un reso.**
- R3 prevede l'accettazione, R4 la correzione dell'importo, ma non esiste uno stato `rejected`.
- Con la giacenza già aumentata alla creazione (rilievo 6), il rifiuto richiederebbe anche di toglierla.
- Va deciso con l'utente se la merce rientra in giacenza al reso o all'accettazione. Un reso di frutta rovinata (R1) non dovrebbe tornare in giacenza vendibile.

**17. Nessun test.**
- `npm test` esegue `node --test`, ma non c'è nessun file di test nel progetto, e la funzione non ne ha.
- La CI non ha quindi niente da verificare sul comportamento dei resi.
- I casi minimi da coprire sono: proprietà dell'ordine, quantità oltre il residuo, calcolo dell'importo, concorrenza sulla giacenza.

## P3

**18.** Il README della funzione non spiega l'ordine di applicazione né il ripristino.
**19.** I nomi mescolano italiano e inglese (`resi.js`, `returns.js`, `web/app.js` usa ID in italiano): da uniformare a un solo stile.
**20.** `data/listino.json` (30 MB) e `moment` in `web/app.js:72` non riguardano i resi. `moment` non è tra le dipendenze di `package.json` né caricata in `web/index.html` che ho esaminato solo in parte: l'ho notato di passaggio e non l'ho verificato.

## Contraddizioni e incoerenze nei requisiti (domande aperte per l'utente)

1. **R3 e R4 sono in conflitto con il criterio «gestiti correttamente dal magazzino».** Il reso è accettato in automatico alla creazione, ma R4 dice che il magazzino può non essere d'accordo. Serve un flusso con stato `richiesto` e poi `accettato` o `rifiutato`.
2. **R5 contro R2.** R2 dice che il negozio indica l'importo, R5 che l'importo è calcolato dal prezzo. Per me vale R5.
3. **R6 è ambigua sul piano fiscale.** Modificare la fattura emessa può non essere lecito: serve una nota di credito e una decisione dell'amministrazione.
4. **R1 non definisce «pochi giorni»** né la data di consegna: oggi manca anche il campo che la memorizza.
5. **La merce resa per frutta rovinata non dovrebbe tornare in giacenza** (R3): da chiarire con il responsabile commerciale.

## Verifiche non fatte
- Non ho eseguito `npm install`, il server, i lint né i test, né ho provato la pagina nel browser.
- Non ho letto `web/index.html`, `server/routes/products.js`, `server/routes/reports.js` né i file in `deploy/` e `.github/` oltre alle poche righe viste con `grep`.

AISA-06 · POLLUX
