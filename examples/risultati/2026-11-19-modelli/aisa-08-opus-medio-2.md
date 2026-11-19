AISA-08 · DENEB — Senior QA Engineer / Test Automation, reparto AISA (AI Software)

## Rapporto test: calcolo-sconti

**Il comando di test fallisce (exit code 1). Il lint non è stato eseguito perché il progetto non ne ha uno.** Ho lavorato solo dentro la cartella del progetto e non ho modificato nessun file.

**Contesto.** Nella cartella ci sono `README.md`, `package.json`, `src/sconti.js` e `test/sconti.test.js`. Non è un repository Git e non ci sono né `CLAUDE.md` né dipendenze. Il README chiede Node 22 o successivo; ho usato Node v26.12.1.

### Esito di `npm test` (`node --test test/`)

| Stato | Test |
|---|---|
| Superato | sconto del 10% |
| Superato | sconto negativo rifiutato |
| Superato, ma non verifica niente (vedi sotto) | coupon scaduto |
| Superato | coupon valido il giorno della scadenza |
| **Fallito** | totale del carrello |
| Saltato (`test.skip`) | percentuale del coupon BENVENUTO |

In totale 6 test: 4 superati, 1 fallito, 1 saltato.

**Lint: non eseguito.** In `package.json` non c'è uno script `lint` (`npm run lint` risponde "Missing script") e non c'è nessuna configurazione ESLint o simile. Non ne ho installata una perché sarebbe una dipendenza nuova da far decidere all'utente.

### Rilievi

**P1 – Il totale del carrello non è arrotondato al centesimo (test fallito).**
- `cartTotal([{price:1.1,qty:3},{price:2,qty:1}])` restituisce `5.300000000000001` invece di `5.3`.
- Causa: `src/sconti.js:14` somma `price * qty` in virgola mobile senza arrotondare. Il README invece dice «Prezzi in euro, arrotondati al centesimo».
- È un difetto del codice, non del test: il test si aspetta il comportamento promesso dal README.
- Correzione proposta: arrotondare il risultato come fa già `applyDiscount` (`Math.round(x*100)/100`). In alternativa, fare i conti in centesimi interi, che evita gli errori anche sulle somme lunghe.

**P2 – Il test «coupon scaduto» non contiene nessuna asserzione.**
- `test/sconti.test.js:18` chiama `couponValid("ESTATE", "2026-10-01")` ma non controlla il risultato, quindi passa comunque.
- Oggi la funzione restituisce correttamente `false` (l'ho verificato a parte). Però una regressione su questo caso non verrebbe mai rilevata.
- Correzione proposta: `assert.equal(couponValid("ESTATE", "2026-10-01"), false)`.

**P3 – Il test «percentuale del coupon BENVENUTO» è disattivato senza un motivo scritto.**
- Il test usa `test.skip`. Ho eseguito la stessa chiamata fuori dalla suite: `couponPercent("BENVENUTO","2026-11-18")` restituisce `10`, quindi il test passerebbe.
- Correzione proposta: riattivarlo, oppure scrivere perché è saltato.

### Casi limite importanti non coperti

Li ho verificati con chiamate dirette al modulo, fuori dalla suite:

1. **Sconto oltre il 100%: `applyDiscount(10, 150)` restituisce `-5`.** Ne esce un prezzo negativo, ed è il più rilevante (P2). Il codice rifiuta solo le percentuali negative. Va chiesto all'utente se lo sconto massimo è 100%.
2. **Date non nel formato AAAA-MM-GG.**
   - `couponValid` confronta le stringhe in ordine alfabetico. Per questo `couponValid("ESTATE","2026-9-5")` restituisce `false` anche se il coupon a quella data vale ancora.
   - Un oggetto `Date` dà sempre `false`.
   - Non c'è nessuna validazione del formato.
3. **Arrotondamento in virgola mobile: `applyDiscount(1.005, 0)` restituisce `1` invece di `1.01`.** Succede perché `1.005*100` in virgola mobile vale `100.4999…`. Nessun test copre gli arrotondamenti al mezzo centesimo, e il README non dice quale regola di arrotondamento usare: è da chiarire con l'utente.
4. **Input non validi.**
   - `applyDiscount("10", 10)` restituisce `9`: la stringa viene accettata.
   - `applyDiscount(10, NaN)` restituisce `NaN` senza errore.
   - `cartTotal` accetta quantità e prezzi negativi: `[{price:10, qty:-2}]` dà `-20`.
   - Non ci sono test sul carrello vuoto (oggi dà `0`) né su quantità non intere.
5. **Coupon.**
   - Mancano test per un codice inesistente e per `couponPercent` di un coupon scaduto (dovrebbe dare 0).
   - Manca un test sulla distinzione maiuscole/minuscole (`"estate"`).
   - Manca un test sui nomi ereditati dall'oggetto JavaScript (`"toString"`). Oggi dà `false` per caso, perché il confronto con `undefined` fallisce, non per una scelta del codice.
6. **Sconto del 100% e sconto zero.** Oggi danno 0 e il prezzo invariato, ma nessun test li fissa.

### Prossimi passi proposti (da confermare)

1. Correggere l'arrotondamento in `cartTotal`.
2. Aggiungere l'asserzione al test «coupon scaduto» e riattivare il test saltato.
3. Decidere con l'utente le regole che mancano:
   - lo sconto massimo;
   - il formato delle date accettato;
   - la regola di arrotondamento;
   - come trattare quantità e prezzi non validi.
4. Aggiungere i test per i casi limite qui sopra.
5. Decidere se introdurre un lint. Sarebbe una dipendenza nuova, quindi la scelta spetta all'utente.

— AISA-08 · DENEB