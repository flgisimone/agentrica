AISA-03 · ALDEBARAN — Senior Business Analyst / Functional Analyst, reparto AISA (AI Software)

# Rapporto: analisi della richiesta `richieste/resi.md`

**Perimetro.** Ho fatto un'analisi in sola lettura di `richieste/resi.md` confrontandola con `README.md` e con lo schema in `db/migrations/001–004`. Per avere più contesto ho guardato anche `funzioni/resi/` (la bozza della funzione), `server/auth.js`, `server/routes/orders.js` e `server/routes/webhooks.js`. Non ho modificato nulla e non ho eseguito test. La cartella non è un repository git, quindi non c'è uno stato Git da verificare.

**Limiti.**
- Non ho potuto caricare prima AISA-01 · SIRIUS: in questa sessione il server MCP non c'è. Questo rapporto è la consegna destinata a lui.
- Nessuna scheda della biblioteca (mcp-2026-07-28, typescript-7, nodejs-calendario) riguarda questo compito, quindi non ne ho lette.
- Il rilievo sulla fattura (A4) tocca una regola fiscale che non è in biblioteca. Non avevo accesso al web per verificarla, quindi va confermata con l'amministrazione o il commercialista.

**Esito.** La richiesta non è pronta per lo sviluppo. Ci sono:
- 2 contraddizioni dirette (R2 contro R5, R3 contro R4);
- 1 requisito probabilmente non attuabile così com'è scritto (R6);
- 1 requisito che lo schema attuale non permette di verificare (R1);
- 3 criteri di accettazione, nessuno verificabile.

## A. Contraddizioni e ambiguità per requisito

**A1 — R2 contro R5: chi stabilisce l'importo (P1)**
- **Problema.** R2 dice che il negozio «indica l'importo da rimborsare». R5 dice che l'importo è calcolato come prezzo della riga per la quantità resa. Le due regole si escludono.
- **Nello schema.** Il prezzo storico esiste in `order_items.unit_price` (002_orders.sql:18), quindi il calcolo di R5 si può fare. Però è di tipo `real` (virgola mobile), mentre `products.price` e `invoices.amount` sono `numeric`: il calcolo può dare errori di arrotondamento sui centesimi.
- **Nella bozza.** Prende l'importo dal client: `funzioni/resi/server/returns.js:26,38` salva `amount` da `req.body`.
- **Riformulazione proposta.** «R2: il negozio sceglie la riga e la quantità. R5: il sistema calcola l'importo come `order_items.unit_price` × quantità resa, arrotondato al centesimo, e il negozio non lo modifica.» Da confermare: IVA inclusa o esclusa? Sconti o importi di trasporto da ripartire?

**A2 — R3 contro R4: il reso è accettato da subito o va valutato? (P1)**
- **Problema.** R3 dice che il reso «viene accettato», implicitamente in automatico. R4 prevede che il magazzino non sia d'accordo e corregga l'importo. Se il reso è già accettato e la merce è già in giacenza, la correzione arriva a cose fatte.
- **Nella bozza.** Segue R3 alla lettera: `status DEFAULT 'accepted'` (005_returns.sql:8) e giacenza incrementata nella stessa richiesta del negozio (returns.js:42-44).
- **Riformulazione proposta.** «Il reso nasce "richiesto". L'operatore `warehouse` lo accetta (anche con quantità o importo corretti, motivazione obbligatoria) oppure lo rifiuta (motivazione obbligatoria). Solo all'accettazione si aggiornano giacenza e documenti contabili.» Da confermare: il magazzino può anche rifiutare? Può correggere la quantità oltre all'importo?

**A3 — R3: la merce torna sempre in giacenza? (P1)**
- **Problema.** Il contesto cita «frutta rovinata»: rimetterla in vendita falsa la giacenza (`products.stock`, 004_stock.sql). Per i «colli sbagliati» invece può avere senso.
- **Riformulazione proposta.** «Per ogni reso il magazzino indica l'esito della merce: rimessa in giacenza oppure scartata. Solo la prima incrementa `stock`.» Da confermare: serve un motivo del reso con un elenco di valori (rovinata, articolo errato, quantità errata…)? La merce rientra fisicamente, o per la frutta rovinata basta una foto o una dichiarazione?

**A4 — R6: «si modifica la fattura originale» (P1)**
- **Problema.** Di norma una fattura emessa non si modifica: per uno storno si emette una nota di credito. Questa nozione non viene dalla biblioteca e non l'ho verificata sulla fonte, quindi va confermata con l'amministrazione o il commercialista.
- **Nello schema.**
  - `invoices` ha solo `order_id` e `amount` (002_orders.sql:21-26), senza numero, righe né tipo di documento.
  - Niente impedisce più fatture per lo stesso ordine. Il webhook ne inserisce una a ogni evento `payment.succeeded` (webhooks.js:21), e il fornitore ritenta fino a 5 volte (webhooks.js:14). Quindi «la fattura originale» può non essere unica.
- **Riformulazione proposta.** «All'accettazione del reso si registra un documento di storno (nota di credito) collegato alla fattura dell'ordine, per l'importo del reso. La fattura originale non si modifica.»
- **Da confermare.**
  - La fatturazione elettronica è gestita da questo gestionale o da un sistema esterno?
  - Il «rimborso» è un accredito sulla prossima fattura, una restituzione tramite il fornitore dei pagamenti o un bonifico? R2 parla di «rimborsare», ma nessun requisito dice come avviene.

**A5 — R1: «entro pochi giorni dalla consegna» non è misurabile (P1)**
- **Problema.** «Pochi giorni» non è un numero.
- **Nello schema.** Non c'è una data di consegna: gli stati di `orders` sono `pending_payment, paid, picking, shipped, cancelled` (002_orders.sql:5). Non esiste uno stato "consegnato" e non esiste la colonna `shipped_at` né `delivered_at`. Ci sono solo `paid_at` e `created_at`.
- **Riformulazione proposta.** «Il negozio può aprire un reso per un ordine in stato `shipped` entro N giorni di calendario (valore da definire) dalla [data di spedizione / data di consegna da registrare].»
- **Da confermare.**
  - Il valore di N, ed eventualmente se cambia per categoria (la frutta fresca ha tempi più brevi?).
  - Si conta dalla spedizione (serve aggiungere `shipped_at`) o dalla consegna (serve un nuovo stato o una nuova data)?
  - Giorni di calendario o lavorativi?
  - Il limite si valuta all'apertura o all'accettazione?

**A6 — R4: limiti della correzione (P2)**
- **Problema.** R4 non dice entro quali limiti si corregge. Dal testo l'importo si può anche alzare oltre il valore della riga.
- **Riformulazione proposta.** «L'importo corretto è compreso fra 0 e `unit_price` × quantità resa. Ogni correzione registra l'autore, la data, il valore precedente e la motivazione, ed è visibile al negozio.»
- **Da confermare.** Si può correggere un reso già chiuso o già contabilizzato?

**A7 — R7: stati non definiti (P2)**
- **Problema.** «Con lo stato» non dice quali stati esistono. Lo schema della bozza non ha `CHECK` su `status` (005_returns.sql:8).
- **Riformulazione proposta.** «Stati: richiesto → accettato | rifiutato (→ contabilizzato, se serve). Il negozio vede per ogni reso: ordine, prodotto, quantità, importo richiesto e importo riconosciuto, stato, motivazione del magazzino, date.»
- **Da confermare.** Il negozio può annullare un reso ancora "richiesto"? Serve una notifica (email) al cambio di stato?

## B. Permessi mancanti

I ruoli sono definiti in `README.md:10-16` e in `users.role` (001_init.sql:22).

- **B1 (P1) — Chi apre il reso.** «Il negozio» corrisponde al ruolo `shop`, e il reso va limitato agli ordini con `orders.customer_id = users.customer_id`. La richiesta lo dice solo con «un suo ordine».
  - Va esplicitato anche il caso `shop` con `customer_id` NULL: la colonna è nullable (001_init.sql:23).
  - Da decidere se `warehouse` o `admin` possono aprire un reso per conto di un negozio. È il caso di oggi, con le segnalazioni per telefono.
  - Nella bozza la POST non controlla né il ruolo né la proprietà dell'ordine (returns.js:25-35), quindi qualunque utente autenticato apre resi su qualunque ordine.
- **B2 (P2) — Chi corregge.** R4 dà la correzione a `warehouse`; la bozza la estende anche ad `admin` (returns.js:50). Da decidere quale ruolo ha l'ultima parola sugli importi. Il README dice che «i prezzi li cambia solo `admin`»: una correzione di importo è assimilabile a un cambio di prezzo?
- **B3 (P2) — Chi emette lo storno contabile (R6).** Il magazzino, l'amministrazione (oggi «corregge a mano la fattura»), oppure il sistema in automatico? Nel README il ruolo dell'amministrazione non esiste come utente distinto.
- **B4 (P3) — Chi vede tutti i resi.** Va deciso se `warehouse` e `admin` vedono i resi di tutti i negozi e se ci sono filtri (per negozio, stato, data).

## C. Casi limite mancanti

1. **(P1)** Più resi sulla stessa riga: la somma delle quantità rese, esclusi i rifiutati, non deve superare `order_items.quantity`. La bozza controlla solo che la quantità sia intera, quindi accetta anche zero, numeri negativi e quantità superiori all'ordinato (returns.js:27-28).
2. **(P1)** Stato dell'ordine: resi ammessi solo da `shipped`? E per un ordine `cancelled`, `pending_payment` o ancora in `picking`?
3. **(P2)** Ordine non pagato o senza fattura: cosa succede a R6?
4. **(P2)** Prezzo cambiato dopo l'ordine: R5 deve usare il prezzo storico della riga, non `products.price`. Va scritto esplicitamente.
5. **(P2)** Prodotto eliminato: `order_items.product_id ... ON DELETE CASCADE` (002_orders.sql:16) cancella le righe d'ordine insieme al prodotto. Il reso perderebbe la riga di riferimento, e `returns.order_item_id` non ha chiave esterna (005_returns.sql:5). Va definito il comportamento atteso: probabilmente le righe di un ordine fatturato non devono sparire.
6. **(P2)** Due richieste simultanee (doppio clic, due operatori, due repliche dietro il bilanciatore come da README:8): il reso non deve essere creato né contabilizzato due volte, e la giacenza non deve essere incrementata due volte.
7. **(P3)** Unità di misura: `quantity` è un intero. Il reso è per collo o per unità? Il reso parziale di un collo (per esempio 3 kg su una cassa da 10) è ammesso?
8. **(P3)** Nota o allegato: la nota è facoltativa? Servono foto per la merce rovinata? Se sì, vanno trattati i file caricati.

## D. Criteri di accettazione non verificabili

Tutti e tre i criteri di `richieste/resi.md:23-25` sono soggettivi.

| Criterio attuale | Problema | Riformulazione proposta (valori da confermare) |
|---|---|---|
| «Il flusso del reso è semplice e veloce per il negozio» | Né «semplice» né «veloce» sono misurabili | «Dall'elenco ordini il negozio apre un reso in al massimo N passaggi (scelta ordine, riga, quantità, motivo, invio). In caso di errore il messaggio indica il campo e la regola violata.» |
| «I resi sono gestiti correttamente dal magazzino» | «Correttamente» non dice rispetto a cosa | Un criterio per regola. Esempi: dato un reso in stato richiesto, l'operatore `warehouse` lo accetta o lo rifiuta con motivazione; un utente `shop` che tenta di accettarlo riceve 403; un reso rifiutato non modifica la giacenza; un reso accettato con esito «scartata» non modifica la giacenza. |
| «Nessun errore nelle fatture» | Non si può verificare un'assenza generica | «Per ogni reso accettato esiste esattamente un documento di storno collegato alla fattura dell'ordine, con importo uguale all'importo riconosciuto al centesimo. La somma degli storni di un ordine non supera l'importo fatturato. Ripetere l'accettazione non crea un secondo storno.» |

Servono anche criteri per R1, R5 e R7: un reso oltre N giorni viene rifiutato con un messaggio; l'importo calcolato è uguale a `unit_price` × quantità; il negozio A non vede i resi del negozio B.

## E. Domande aperte per l'utente (o per il responsabile commerciale)

1. L'importo lo indica il negozio o lo calcola il sistema (R2 o R5)?
2. Il reso è accettato in automatico o lo valuta il magazzino? Il magazzino può rifiutarlo?
3. La merce rovinata torna in giacenza o si scarta?
4. Fattura da modificare o nota di credito (da verificare con amministrazione o commercialista)? Come avviene il rimborso?
5. Quanti giorni vale «pochi giorni», e da quale data si contano? Lo schema non registra la consegna.
6. `warehouse` o `admin` possono aprire un reso per conto di un negozio?
7. Unità di misura del reso e reso parziale di un collo.

## Nota per AISA-01

La bozza in `funzioni/resi/` implementa le ambiguità alla lettera: importo dal client, accettazione automatica, nessun controllo di ruolo o di proprietà sulla POST, nessun limite sulla quantità, giacenza aggiornata leggendo e poi scrivendo, fuori da una transazione. Non l'ho revisionata come codice perché è fuori dal mio perimetro, ma conviene un passaggio di Security e del Database Engineer dopo che i requisiti sono stati confermati. Il lavoro proposto (business → conferma dell'utente → software) va confermato dall'utente.

Firmato: AISA-03 · ALDEBARAN
