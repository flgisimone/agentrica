AISA-06 · POLLUX — Senior Full Stack Developer, reparto AISA (AI Software)

**Rapporto per AISA-01 · SIRIUS: revisione read-only della funzione dei resi (`funzioni/resi/`)**

Nota sul metodo: non ho potuto caricare AISA-01 con `agent`, perché in questa prova il server MCP non c'è. Il rapporto è comunque indirizzato a lui.

Ho letto tutto il progetto, cioè:
- README, `richieste/resi.md` e `funzioni/resi/*`;
- `server/*`, `db/*` e `web/*`;
- `Dockerfile` e CI.

La cartella non è un repository git (`git status` dà "not a git repository").

Non ho eseguito test: nel progetto non ce ne sono (`npm test` = `node --test`, senza file di test) e non c'è un database locale. Non ho modificato né scritto file.

Ho consultato la scheda nodejs-calendario (Node.js, documentazione e release; v22, v24 e v26 LTS; verificata il 2026-11-19). La Node 22 del progetto è in LTS, quindi la versione non è un problema. La scheda serve qui solo per il comportamento delle promise rifiutate (rilievo 4).

## Esito

**La funzione non è pronta da unire, così com'è non funziona.** Il form non riesce mai ad aprire un reso (rilievo 3). Se si correggesse solo quel punto, la funzione esporrebbe due problemi:
- un XSS persistente verso il magazzino e l'amministrazione;
- resi su ordini di altri clienti, con importi e quantità scelti dal negozio.

Anche la richiesta ha requisiti in conflitto tra loro: vanno chiariti con l'utente prima di correggere il codice.

## Rilievi

**1. P0: XSS persistente nell'elenco dei resi.**
- Dove: `funzioni/resi/web/resi.js:10-11`.
- Cosa succede: `list.innerHTML` contiene `r.note`, testo libero scritto dal negozio (e anche `r.status`).
- Perché è grave: il magazzino e l'admin vedono tutti i resi (`returns.js:11-14`) e il token di sessione sta in `sessionStorage` (`resi.js:1`). Un negozio può quindi rubare la sessione di un admin e cambiare i prezzi, che il README riserva all'admin.
- Correzione proposta: usare `textContent` o creare i nodi DOM.

**2. P1: un negozio può aprire resi su ordini di altri clienti.**
- Dove: `funzioni/resi/server/returns.js:30-33`.
- Cosa succede: la query cerca la riga solo per `id` e `order_id`, senza controllare `orders.customer_id = req.user.customer_id`.
- Altri controlli mancanti:
  - il ruolo (la rotta POST non ha `requireRole`);
  - lo stato dell'ordine: si può rendere merce di ordini `pending_payment` o `cancelled`, quindi mai consegnati.
- Effetti: si scrive sui dati di un altro cliente e si aumenta la giacenza.

**3. P1: il form non apre mai un reso.**
- Dove: `funzioni/resi/web/resi.html:19`, dove il campo si chiama `name="qty"`; il server legge `req.body.quantity` (`returns.js:27`).
- Cosa succede: `Number(undefined)` dà NaN, quindi la risposta è sempre 400 "quantità non valida".

**4. P1: un errore del database fa cadere la replica.**
- Dove: le rotte `async` in `returns.js:8, 25, 50`, senza try/catch.
- Perché cade: Express 4.21 non intercetta le promise rifiutate, e in Node 22 una promise rifiutata non gestita termina il processo.
- Basta una richiesta di un negozio, per esempio:
  - `orderItemId: "abc"` (errore di sintassi su integer);
  - `amount` assente (NOT NULL);
  - `amount: "x"`.
- Lo stesso schema c'è già in `server/routes/orders.js:6, 22`: è fuori perimetro, lo segnalo e basta.

**5. P1: l'importo del rimborso lo decide il negozio, senza alcuna validazione.**
- Dove: `returns.js:26, 38-39`.
- Cosa succede: `amount` va nel database così com'è; può essere negativo, enorme o non numerico.
- Contrasto con la richiesta: R5 vuole l'importo calcolato come `unit_price × quantità resa`, sul server; il codice segue R2. Si veda la domanda aperta A.

**6. P1: quantità senza limiti, e la giacenza diventa manipolabile.**
- Dove: `returns.js:27-28`.
- Cosa succede:
  - `Number.isInteger` accetta 0 e i negativi, e un reso negativo toglie giacenza;
  - non c'è un controllo che la quantità sia `≤ order_items.quantity`;
  - non si sommano i resi già aperti sulla stessa riga: resi ripetuti superano la quantità ordinata e gonfiano la giacenza a piacere.

**7. P1: nessuna transazione e aggiornamento della giacenza non atomico.**
- Dove: `returns.js:37-44`.
- Cosa succede:
  - INSERT, SELECT e UPDATE sono tre query separate sul pool;
  - `stock = letto + quantity` è un read-modify-write: con due repliche e gli ordini concorrenti (`orders.js:38` fa lo stesso) si perdono aggiornamenti;
  - se l'UPDATE fallisce, il reso resta senza merce in giacenza.
- Correzione proposta: `BEGIN…COMMIT` su un client dedicato e `SET stock = stock + $1`.

**8. P1: il negozio non ha modo di sapere l'id della riga d'ordine (R2 non usabile).**
- Dove: `resi.html:16-17` chiede `orderItemId` a mano, ma `GET /api/orders` non restituisce l'id delle righe (`server/routes/orders.js:16` seleziona solo `product_id, quantity, unit_price`).
- Effetto: il negozio dovrebbe indovinare un numero.

**9. P2: problemi nello schema.**
- Dove: `funzioni/resi/db/005_returns.sql`.
- Cosa manca:
  - `order_item_id` (riga 5) non ha la FK verso `order_items`, né un vincolo che leghi la riga all'ordine (per esempio una FK composta);
  - `amount real` (riga 7) è un float per un importo, mentre `invoices.amount` è `numeric(12,2)`;
  - `quantity` (riga 6) non ha `CHECK (quantity > 0)`;
  - `status` (riga 8) non ha un CHECK sui valori ammessi;
  - non ci sono autore (`created_by`) né data o autore della correzione.

**10. P2: lo stato è `accepted` in automatico e la merce torna subito in giacenza.**
- Dove: `005_returns.sql:8` e `returns.js:42-44`.
- Cosa succede:
  - il reso è accettato all'apertura, prima che il magazzino veda la merce;
  - la frutta rovinata, che è il caso tipico citato nella richiesta, rientra tra la merce vendibile.
- Contrasto con la richiesta: R4 (il magazzino corregge se non è d'accordo) presuppone una verifica che il flusso non prevede. Si veda la domanda aperta B.

**11. P2: la correzione dell'importo (PATCH) è incompleta.**
- Dove: `returns.js:50-55`.
- Cosa manca:
  - un controllo che il reso esista: risponde 204 anche per un id inesistente;
  - un tetto all'importo, pari al valore della riga;
  - un controllo sullo stato;
  - una traccia di chi ha corretto e da quale importo.
- In più, nella pagina non c'è un'interfaccia per il magazzino che chiami questa rotta, quindi R4 non si può usare dall'UI.

**12. P2: R1 e R6 non sono implementati.**
- R1 (entro pochi giorni dalla consegna): non c'è controllo, e lo schema non ha una data di consegna (`orders` ha solo `status` e `paid_at`; `shipped` non è "consegnato").
- R6 (modificare la fattura): non è implementato. Si veda la domanda aperta C prima di implementarlo.

**13. P2: problemi della pagina, lato client.**
- `loadReturns` (`resi.js:7-12`) non gestisce gli errori: con un 401 `rows.map` lancia un'eccezione e la pagina resta vuota.
- Il submit non disabilita il pulsante: un doppio clic crea resi duplicati e raddoppia la giacenza, e il server non ha idempotenza.

**14. P2: nessun test per la funzione.**
- Mancano test sui permessi (negozio contro ordini altrui), sui limiti di quantità e importo, sulla giacenza e sugli errori del database.

**15. P3: integrazione e pulizia.**
- Il router non è montato in `server/app.js`.
- `funzioni/` non viene servita (`express.static` serve solo `web/`) e non è copiata nel `Dockerfile` (righe 10-13).
- La migrazione è fuori da `db/migrations/`, l'unica cartella che legge `db/migrate.js:8`.
- I `require("../../../server/db")` (`returns.js:2-3`) andranno rivisti dopo lo spostamento.
- Manca una `005_returns.down.sql`, che esiste invece per la 004.
- Il README della funzione dice già che va integrata: lo segnalo come attività residua, non come difetto.

**16. P3: dettagli dell'interfaccia.**
- L'importo non è formattato in euro (con `real` può apparire come 12.300000190734863) e lo stato compare in inglese (`resi.js:11`).
- L'elenco non mostra la riga o il prodotto reso.
- Il titolo "I tuoi resi" è sbagliato per il magazzino, che vede tutti i resi.
- Manca un link alla pagina da `web/index.html`.

## Domande aperte, da far decidere all'utente o al responsabile commerciale

**A. Chi stabilisce l'importo?** R2 ("il negozio indica l'importo") è in conflitto con R5 ("calcolato da prezzo × quantità"). La mia proposta tecnica: lo calcola il server, il negozio non lo indica e il magazzino lo corregge (R4).

**B. Quando un reso è accettato e quando la merce torna in giacenza?** R3 dice "accettato" senza dire da chi. Due punti da decidere:
- se serva uno stato intermedio "aperto" o "da verificare";
- se la merce rovinata debba rientrare in giacenza o essere scartata.

**C. Che cosa fare della fattura (R6)?** Modificare la fattura originale potrebbe non essere ammesso. Di norma per una fattura già emessa si fa una nota di variazione o di credito, ma questo va verificato con l'amministrazione o il commercialista: non ho una scheda in biblioteca sul tema e la mia conoscenza non è una fonte. C'è anche un punto tecnico: oggi la fattura nasce dal webhook di pagamento (`server/routes/webhooks.js:21`).

**D. Quanti giorni sono "pochi giorni" (R1), e da quale evento si contano?** Lo schema non ha una data di consegna.

**E. I criteri di accettazione non si possono verificare** ("semplice e veloce", "gestiti correttamente", "nessun errore nelle fatture"). Li ripasserei al reparto business per renderli misurabili.

## Rischi e limiti

- La revisione è statica: non ho eseguito il codice né provato la pagina.
- Il rilievo P0 (XSS) va comunicato subito all'utente.
- La funzione non è ancora montata né distribuita, quindi oggi il rischio non è in produzione.
- Sto lavorando come subagent sullo stesso modello della sessione. Propongo comunque che i rilievi P0 e P1 siano confermati da SIRIUS prima di diventare definitivi.

Firmato: AISA-06 · POLLUX
