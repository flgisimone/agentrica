AISA-03 · ALDEBARAN — Senior Business Analyst / Functional Analyst, reparto AISA (AI Software)

Ho analizzato la richiesta dei resi in sola lettura. Non ho modificato né scritto file.

**Cosa ho letto**
- Nella copia `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/1b8e243c-033a-4357-b227-0a46d80b6791/scratchpad/ondata4/copie/aisa-03-2`: `richieste/resi.md`, `README.md` e le migrazioni da `db/migrations/001_init.sql` a `004_stock.sql`.
- Per contesto ho dato uno sguardo a `funzioni/resi/README.md`, `funzioni/resi/db/005_returns.sql` e a una ricerca sulle fatture in `server/`. Non li ho analizzati.
- La copia non ha `CLAUDE.md` e non è un repository git.

**Limiti di questa analisi**
- Non ho caricato AISA-01 · SIRIUS: in questa sessione manca il server MCP. Il rapporto è comunque scritto come consegna per lui.
- Non ho letto schede della biblioteca: nessuna riguarda il compito (MCP, TypeScript 7, Node.js).
- Le regole fiscali citate nel rilievo 6 non vengono dalla biblioteca né dal web. Vanno confermate dall'amministrazione o dal commercialista dell'utente.

## Esito

La bozza non è pronta per lo sviluppo:
- ci sono tre contraddizioni fra i requisiti (R2 e R5, R3 e R4, R4 e la regola sui prezzi del README);
- un requisito, R6, ha probabilmente un problema fiscale;
- lo schema non ha dati su cui si fondano R1 e R3;
- tutti e tre i criteri di accettazione non sono verificabili.

## Rilievi

**1. R1: «entro pochi giorni dalla consegna» non è definito e lo schema non ha la consegna (P1)**
- Evidenza:
  - `richieste/resi.md:13`;
  - `db/migrations/002_orders.sql:5`: gli stati sono `pending_payment`, `paid`, `picking`, `shipped`, `cancelled`, quindi non esistono uno stato «consegnato» né una data di consegna o di spedizione (c'è solo `paid_at`, a riga 7).
- Il problema:
  - il numero di giorni non è definito;
  - non si sa se contano i giorni di calendario o quelli lavorativi;
  - non si sa da quale data si conta.
- Riformulazione proposta: «Il negozio può aprire un reso su un ordine in stato `shipped` (o `delivered`, se lo si introduce) entro N giorni di calendario dalla data di consegna registrata.» Lo schema dovrà avere la data di consegna (`delivered_at` o `shipped_at`).
- Domande aperte:
  - quanto vale N, e se è uguale per tutti i prodotti (il fresco può richiedere 24–48 ore);
  - chi registra la consegna.

**2. R2 contro R5: chi decide l'importo (P1)**
- Evidenza: `richieste/resi.md:14` (è il negozio a «indicare l'importo da rimborsare») e `:17` (l'importo «è calcolato» da prezzo della riga per quantità).
- Riformulazione proposta: «Il negozio sceglie la riga e la quantità e indica il motivo. L'importo lo calcola il sistema come `order_items.unit_price × quantità resa` e il negozio lo vede in sola lettura.»
- Domanda aperta: il calcolo deve tenere conto di IVA, sconti o spese di trasporto?

**3. R3 contro R4: il reso è accettato in automatico o va controllato (P1)**
- Evidenza:
  - `richieste/resi.md:15`: il reso «viene accettato», senza dire chi lo accetta né quando;
  - `richieste/resi.md:16`: il magazzino lo corregge «se non è d'accordo», il che presuppone una verifica;
  - la bozza `funzioni/resi/db/005_returns.sql:8` ha già `status DEFAULT 'accepted'`, cioè ha scelto l'accettazione automatica senza una decisione.
- Riformulazione proposta, con un ciclo di stati esplicito: `richiesto` → (`warehouse` verifica la merce ricevuta) → `accettato` oppure `rifiutato` con motivo → `rimborsato`. Sono ammessi solo questi passaggi.
- Domande aperte:
  - chi può rifiutare un reso;
  - se il negozio può annullare un reso ancora `richiesto`.

**4. R3: «la merce torna in giacenza» contraddice il contesto (P2)**
- Evidenza:
  - `richieste/resi.md:7` e `:15`: il contesto parla di «frutta rovinata»;
  - `004_stock.sql:2`: la giacenza è `products.stock`.
- La merce rovinata non può tornare vendibile.
- Riformulazione proposta: «All'accettazione, la quantità resa torna in `stock` solo se il motivo è "collo sbagliato" o "merce integra". Se il motivo è "merce rovinata", la merce va a scarto e la giacenza non cambia.»
- Il reso deve quindi avere un motivo obbligatorio, scelto da un elenco chiuso, che oggi manca nei requisiti.

**5. R4: un operatore di magazzino che cambia un importo contraddice la separazione dei ruoli (P1)**
- Evidenza:
  - `README.md:13`: `warehouse` gestisce giacenze e stato degli ordini;
  - `README.md:16`: «I prezzi li cambia solo `admin`»;
  - `richieste/resi.md:16`.
- R4 non ha limiti, non chiede motivo né traccia, e non dice cosa succede quando il negozio non è d'accordo con la correzione.
- Riformulazione proposta: «`warehouse` può correggere solo la quantità accettata. L'importo segue da R5. Una correzione dell'importo diversa dal calcolo la fa solo `admin`, con motivo obbligatorio, e resta registrata (chi, quando, valore prima e dopo).»
- Domanda aperta: l'utente conferma che sui soldi decide `admin` e non il magazzino?

**6. R6: modificare la fattura originale (P1)**
- Evidenza:
  - `richieste/resi.md:18`;
  - `002_orders.sql:21-26`: `invoices` ha un solo `amount`;
  - `server/routes/webhooks.js:21`: la fattura nasce dal webhook di pagamento.
- Una fattura emessa di norma non si modifica: si emette una nota di credito che la richiama. È da verificare con l'amministrazione: non è una fonte verificata.
- In più l'ordine è pagato online, quindi «rimborsare» può voler dire tre cose diverse:
  - storno al fornitore di pagamento;
  - credito sul prossimo ordine;
  - solo un documento contabile.
- Riformulazione proposta: «Accettato il reso, il sistema crea un documento di rettifica (nota di credito) collegato alla fattura originale, per l'importo del reso. La fattura originale non cambia. Il rimborso avviene tramite <modalità da decidere>.»
- Domanda aperta: chi emette la nota di credito (il gestionale o il programma di contabilità) e con che numerazione?

**7. R2 e R5: la quantità resa non ha limiti né unità (P2)**
- Evidenza:
  - `002_orders.sql:17`: `quantity integer CHECK > 0`;
  - la bozza `005_returns.sql:5` non ha nessun CHECK.
- Mancano questi casi:
  - più resi sulla stessa riga;
  - quantità 0 o negativa;
  - l'unità di misura (colli o kg?).
- Riformulazione proposta: «La quantità resa è un intero maggiore di 0, nella stessa unità della riga. La somma dei resi non rifiutati su una riga non supera `order_items.quantity`.»

**8. R5: precisione dell'importo (P2)**
- Evidenza: `002_orders.sql:18` usa `unit_price real` (virgola mobile), mentre `invoices.amount` è `numeric(12,2)`; la bozza usa `amount real` (`005_returns.sql:7`).
- Con questi tipi il criterio «nessun errore nelle fatture» non si può garantire.
- Riformulazione proposta: «L'importo è calcolato in `numeric` con 2 decimali, arrotondato al centesimo con una regola dichiarata.» È una decisione di schema che spetta all'utente, insieme al database engineer.

**9. R1 e R7: permessi e proprietà (P1)**
- Evidenza:
  - `001_init.sql:23`: `users.customer_id` può essere nullo anche per `shop`;
  - nella bozza, `005_returns.sql` non ha `customer_id` e `order_item_id` non ha FK.
- Mancano queste regole:
  - il negozio vede e apre resi solo sui propri ordini e su righe di quegli ordini;
  - cosa vedono `warehouse` e `admin` (tutti i resi?);
  - cosa succede a un utente `shop` senza `customer_id`.
- Riformulazione proposta: «Un utente `shop` apre e vede solo i resi di ordini del proprio `customer_id`. La riga scelta deve appartenere all'ordine. Un utente `shop` senza cliente non può aprire resi. `warehouse` e `admin` vedono tutti i resi.»

**10. Stati dell'ordine ammessi (P2)**
- Il requisito non dice su quali stati dell'ordine si può aprire un reso.
- Riformulazione proposta: «Solo su ordini consegnati. Non su `pending_payment`, `paid`, `picking` o `cancelled`.»

**11. «Colli sbagliati» (P2)**
- Evidenza: `richieste/resi.md:7`.
- Il caso del prodotto ricevuto diverso da quello ordinato, o del collo mancante, non è un reso di una riga ordinata e R2 non lo copre.
- Domanda aperta: si gestisce come reso con motivo «prodotto errato» (con la merce ricevuta che entra in giacenza?) oppure resta fuori perimetro?

**12. Cancellazione dei prodotti (P2)**
- Evidenza: `002_orders.sql:16`: `product_id ... ON DELETE CASCADE`.
- Eliminare un prodotto cancella le righe d'ordine e quindi rende orfani resi e documenti contabili.
- Requisito da aggiungere: «Un reso e la sua riga d'ordine restano consultabili anche se il prodotto viene eliminato.» Va portato al database engineer.

**13. Mancano altri requisiti (P3)**
- Notifiche al negozio e al magazzino ai cambi di stato.
- Allegati o foto come prova della merce rovinata.
- Il ruolo dell'amministrazione, che oggi corregge le fatture (`richieste/resi.md:7`) ma nei requisiti non compare.
- Lo storico delle modifiche.
- Se si raccolgono foto, va coinvolta la Privacy & Compliance prima dell'implementazione.

## Criteri di accettazione non verificabili (P1)

Evidenza: `richieste/resi.md:23-25`. Tutti e tre si basano su giudizi («semplice e veloce», «correttamente», «nessun errore»).

| Criterio attuale | Riformulazione proposta |
|---|---|
| «semplice e veloce per il negozio» | Da un ordine consegnato, il negozio apre un reso in non più di 3 passaggi (ordine → riga e quantità → conferma) e vede l'importo calcolato prima di confermare. Le soglie sono da confermare. |
| «gestiti correttamente dal magazzino» | Dato un reso `richiesto`, `warehouse` può portarlo solo ad `accettato` o `rifiutato` (con motivo). All'accettazione con motivo «merce integra», `products.stock` aumenta della quantità accettata. Con motivo «merce rovinata», non cambia. |
| «nessun errore nelle fatture» | Per un reso accettato di quantità q su una riga a prezzo p, viene creata una nota di credito pari a round(p×q, 2), collegata alla fattura dell'ordine. La fattura originale resta invariata. La somma dei resi non rifiutati di una riga non supera la quantità ordinata. |

Criteri negativi da aggiungere:
- un negozio che apre un reso su un ordine di un altro cliente riceve un rifiuto (403 o 404);
- un reso aperto oltre N giorni viene rifiutato;
- una quantità che supera quella residua viene rifiutata;
- un utente `warehouse` che modifica l'importo riceve un rifiuto (403).

## Domande aperte per l'utente
1. Il valore di N in R1 e la data da cui contarlo (lo schema non ha la consegna).
2. L'importo è sempre calcolato (R5) o lo indica il negozio (R2)?
3. Accettazione automatica o verifica del magazzino, e chi può rifiutare un reso?
4. Chi può correggere un importo: `warehouse` o solo `admin`?
5. Fattura: nota di credito al posto della modifica? Chi la emette? Come avviene il rimborso (storno online, credito o solo documento)?
6. Come si trattano la merce rovinata e i colli sbagliati rispetto alla giacenza?

## Note per SIRIUS
- La bozza in `funzioni/resi/` è fuori dal mio perimetro. Contiene però già scelte che toccano queste ambiguità: accettazione automatica, `amount real`, nessuna FK su `order_item_id`, nessun vincolo sulla quantità. Prima di unirla conviene una revisione dei ruoli software (Database, Security) sulla base dei requisiti confermati.
- Ho lavorato su Opus e i rilievi P1 li riporto come proposte. Le priorità e la riformulazione definitiva restano da confermare con l'utente.

— AISA-03 · ALDEBARAN
