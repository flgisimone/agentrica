AISA-06 · POLLUX — Senior Full Stack Developer, reparto AISA (AI Software)

Revisione read-only di `funzioni/resi/` (migrazione, rotte, pagina) rispetto a `richieste/resi.md` e al resto del progetto. Non ho corretto né scritto nulla. Non ho eseguito test, lint né l'applicazione: i rilievi vengono dalla lettura del codice.

Non ho caricato AISA-01 (SIRIUS) con `agent`, perché in questa prova non avevo il server MCP. Ho letto le schede della biblioteca con `npm run -s agent-text -- aisa-06 --cards mcp-2026-07-28,typescript-7,nodejs-calendario`. Nessuna riguarda questa funzione: il progetto è JavaScript CommonJS su Node 22 senza MCP né TypeScript, quindi non le cito nei rilievi.

Sono Sonnet. Per i rilievi P0 e P1 e per le conclusioni su requisiti ambigui propongo il riesame di SIRIUS o di un revisore su Opus prima che diventino definitivi.

## Esito

La funzione non è pronta per l'unione. Ho trovato 4 rilievi P0 e 4 P1, indicati per gravità e non in ordine di file. Il più grave è la rotta POST, che non verifica a chi appartiene l'ordine né quanto è già stato reso, e accredita la giacenza prima di qualsiasi controllo. Subito dopo viene la migrazione 005, che nella cartella della funzione non viene mai eseguita.

## Rilievi

### P0

1. **Resi su ordini di altri negozi** (`funzioni/resi/server/returns.js:25-40`). La POST non confronta `orders.customer_id` con `req.user.customer_id`. Un negozio può aprire un reso su qualunque `orderId` e `orderItemId` indovinando gli id. La GET invece filtra per negozio, quindi il controllo c'è in lettura e manca in scrittura. Viola R1 ("un suo ordine").

2. **Importo deciso dal negozio, senza controlli** (`returns.js:26,37-40`; `resi.html:20-21`; `resi.js:17`). `amount` arriva dal client senza validazione: può essere negativo, enorme, non numerico, `NaN` o una stringa. R5 dice che l'importo si calcola da `order_items.unit_price` per la quantità resa. R2 contraddice R5 (l'importo lo "indica" il negozio) e va chiarita con il responsabile commerciale. Con R4 e R5 la lettura coerente è: il server calcola l'importo e il magazzino lo corregge. Per R6 è l'importo che cambierà la fattura, quindi è un rischio finanziario.

3. **Giacenza e quantità senza controlli, e giacenza accreditata subito** (`returns.js:27-28,42-44`).
   - La quantità deve solo essere un intero: 0 e i negativi passano e fanno scendere la giacenza.
   - Non c'è un tetto pari alla quantità dell'ordine (`order_items.quantity`) meno quanto già reso. Si può rendere più volte la stessa riga, o rendere 1.000.000 di pezzi, e la giacenza cresce di altrettanto. Richiede un controllo e un totale reso per riga.
   - La merce rientra in magazzino nel momento in cui il negozio apre la richiesta. R3 dice "viene accettato e la merce torna in giacenza": non c'è un passaggio di accettazione del magazzino, e frutta rovinata verrebbe contata come vendibile.
   - La riga e il prodotto vengono letti con `product[0].stock`, senza controllo che esistano.

4. **Migrazione 005 non applicata, nel posto sbagliato e con difetti di schema** (`funzioni/resi/db/005_returns.sql`).
   - Sta in `funzioni/resi/db/`, mentre `db/migrate.js:8` legge solo `db/migrations/`. Il README della funzione dice "da aggiungere alle migrazioni", quindi finché non viene spostata la tabella `returns` non esiste e ogni rotta risponde con errore 500.
   - Manca il file `005_returns.down.sql`, che le migrazioni 004 e successive hanno.
   - `order_item_id integer NOT NULL` non ha `REFERENCES order_items(id)`: si possono salvare righe inesistenti o di un altro ordine.
   - `amount real` per un importo in euro: la 002 usa `numeric(12,2)` per `invoices.amount`. `real` arrotonda male, e `order_items.unit_price` è già `real` (difetto preesistente della 002, riga 18). Va usato `numeric(12,2)` come per `invoices.amount`.
   - Mancano `CHECK (quantity > 0)`, `CHECK (amount >= 0)` e un `CHECK` sugli stati di `status` (il default è `'accepted'`). L'indice sulla colonna `order_item_id` manca.

### P1

5. **Nessun controllo sulla consegna né sulla finestra di tempo** (`returns.js:25-40`; R1: "entro pochi giorni dalla consegna"). Non esiste alcun campo di data o stato di consegna: `orders.status` ha solo `shipped`, e non c'è la data di consegna. Il codice non controlla né lo stato dell'ordine (si può rendere un ordine `pending_payment` o `cancelled`) né i giorni. Il numero di giorni è un requisito aperto da chiedere al responsabile commerciale. Serve prima decidere da quale data si conta il termine.

6. **La rotta PATCH non controlla niente** (`returns.js:50-55`).
   - Il ruolo è controllato (`requireRole("warehouse","admin")`), ma `req.params.id` non è validato e non si controlla che il reso esista: se non esiste risponde comunque 204.
   - Qualsiasi stato va bene: si può correggere l'importo di un reso già accettato o chiuso.
   - Non c'è traccia di chi ha corretto e quando, né dell'importo originale. Per un valore che finisce in fattura serve una storia delle correzioni.
   - `Number(req.body.amount)` con `>= 0` accetta anche `Infinity` e stringhe vuote (`Number("")` vale 0).
   - Non c'è alcuna rotta per accettare o rifiutare un reso: lo stato resta sempre `'accepted'` (R3 e R7 parlano di stato).

7. **Requisito R6 non realizzato.** Nessun codice modifica la fattura (`invoices`). La tabella `invoices` (002) ha una riga con `order_id`, `amount`, `issued_at`, creata dal webhook (`server/routes/webhooks.js:21`), senza stato né storico: una "modifica della fattura originale" non è prevista dal modello, e una fattura emessa si corregge di norma con una nota di credito, non riscrivendola. Il criterio di accettazione "nessun errore nelle fatture" non è verificabile. Serve una decisione con l'utente (nota di credito o correzione) e un parere fiscale. Non propongo una soluzione da sola.

8. **Operazioni multi-passo senza transazione né errori gestiti** (`returns.js:25-47`).
   - L'inserimento del reso e l'aggiornamento della giacenza sono query separate su `pool.query` (`server/db.js:5`), senza transazione. Se la seconda fallisce, il reso esiste e la giacenza no (o l'opposto).
   - Lettura e scrittura della giacenza (righe 43-44) non sono atomiche: con due repliche (README, `deploy/`) e richieste concorrenti si perdono aggiornamenti. Basta `UPDATE products SET stock = stock + $1 WHERE id = $2`.
   - Express 4 non intercetta gli errori delle funzioni `async`: nessuna delle tre rotte ha `try/catch`, quindi un errore del database lascia la richiesta appesa (il gestore di errori di `server/app.js:15` non scatta). `orders.js` ha lo stesso difetto sulle prime due rotte, mentre la PATCH di quel file usa `next(err)`.

### P2

9. **La funzione non è collegata** (`server/app.js`). Le rotte non sono montate su `/api/returns` (lo dice il README della funzione, non il codice), la pagina `resi.html` non è in `web/` e non è raggiungibile da `index.html`. Manca anche un controllo del ruolo sulla POST: un `warehouse` o un `admin` senza `customer_id` potrebbe aprire resi per conto di chiunque. Il README della funzione deve dire quali ruoli possono aprire un reso.

10. **Pagina dei resi** (`resi.html`, `resi.js`).
    - `resi.js:11` inserisce `r.note` (testo libero del negozio) in `innerHTML` senza escape: XSS memorizzato, visibile anche al magazzino. Usare `textContent` come in `web/app.js:40-41`.
    - Il campo del form si chiama `qty`, ma il server legge `req.body.quantity` (`returns.js:27`): `Number(undefined)` è `NaN`, quindi ogni invio dalla pagina fallisce con "quantità non valida". La pagina non funziona nemmeno nel caso normale.
    - L'utente deve digitare a mano gli id numerici di ordine e riga (`resi.html:15-17`): R2 dice che il negozio "sceglie la riga", non che ne copia l'id. Serve l'elenco degli ordini e delle righe, che `GET /api/orders` già restituisce con `items`, ma senza l'id della riga (`orders.js:16` non seleziona `id`).
    - Nessun controllo dell'errore sulla GET (`resi.js:8-9`): con 401 o 500 `rows.map` lancia un'eccezione.
    - L'importo in elenco non è formattato (`web/app.js` usa `Intl.NumberFormat` in euro), lo stato è mostrato come codice interno e non in italiano. Il titolo "I tuoi resi" è sbagliato per il magazzino, che vede tutti i resi.
    - Il token è letto da `sessionStorage` come in `app.js`: coerente col resto, nessun rilievo.
    - Mancano `autocomplete`, messaggi per campo e feedback durante l'invio (il pulsante non si disabilita: doppio invio crea due resi). Il criterio "flusso semplice e veloce" non è verificabile.

11. **L'elenco** (`returns.js:8-22`) non filtra né pagina (`LIMIT 200`, nessun cursore) e non restituisce `order_item_id`. Va bene al volume dichiarato dal README oggi, ma i resi più vecchi spariscono senza avviso. Non c'è un indice su `returns.created_at`.

12. **Nessun test.** `npm test` esegue `node --test`, ma il repository non ha test per la funzione (né per il resto che ho visto). Mancano quelli sui casi che contano: negozio diverso, quantità oltre l'ordine, importo negativo, doppio reso.

### P3

13. **Allineamento con le convenzioni del progetto.** L'importo dovrebbe usare `numeric` come il resto dei soldi; le rotte non rispondono con messaggi coerenti (`non permesso` esiste in `auth.js`); il nome `returns.js` e le cartelle `funzioni/resi/server|web|db` non seguono la struttura `server/routes/`, `web/`, `db/migrations/` del README principale.

## Domande aperte per l'utente
- R2 e R5: chi decide l'importo? Il testo dice "il negozio lo indica" e anche "è calcolato dal prezzo". Va scelto prima di sviluppare.
- Quanti giorni dalla consegna sono ammessi, e da quale data si contano?
- R6: nota di credito o modifica della fattura? Serve il parere dell'amministrazione.
- R3: l'accettazione è del magazzino (e quando la merce rientra), oppure automatica?

## Rischi e limiti
- Non ho eseguito il codice né un database: i rilievi sono statici e non verificati con prove. In particolare il rilievo 10 (nome del campo `qty`) e il rilievo 4 (tabella mancante) si leggono nel codice e nel README, ma non li ho riprodotti.
- Non ho giudicato l'aspetto fiscale della fattura: è fuori dal mio ruolo.
- Fuori dal perimetro, ho visto di passaggio difetti preesistenti (per esempio `orders.js` senza transazione né `try/catch`, la migrazione 003 che aggiunge `sku NOT NULL` a una tabella già popolata, `web/app.js:72` che usa `moment` da un CDN esterno senza SRI): non li ho analizzati.

File esaminati, tutti sotto `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/1b8e243c-033a-4357-b227-0a46d80b6791/scratchpad/ondata4/copie/aisa-06-3`: `funzioni/resi/server/returns.js`, `funzioni/resi/db/005_returns.sql`, `funzioni/resi/web/resi.html`, `funzioni/resi/web/resi.js`, `funzioni/resi/README.md`, `richieste/resi.md`, `server/app.js`, `server/auth.js`, `server/db.js`, `server/routes/orders.js`, `server/routes/webhooks.js`, `db/migrate.js`, `db/migrations/*.sql`, `web/app.js`, `web/index.html`, `package.json`, `README.md`.

— AISA-06 · POLLUX
