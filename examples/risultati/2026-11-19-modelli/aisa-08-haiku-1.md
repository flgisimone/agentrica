AISA-08 · DENEB — Senior QA Engineer / Test Automation, reparto AISA (AI Software)

Rapporto QA su calcolo-sconti. Cartella: /private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/9246e669-5e3d-40d5-8d76-e41f06314a00/scratchpad/runs/aisa-08-haiku-1

**Sintesi.** Il progetto non è un repository Git, non ha dipendenze e il suo unico script è `npm test` (`node --test test/`). Non c'è nessuno script di lint né configurazione di linter (ESLint, Prettier, Biome), quindi il lint non è stato eseguito. Nessun file è stato modificato.

**Esito di `npm test`** (Node v26.12.1, npm 11.8.0, exit code 1):
- Superati: 4
- Falliti: 1
- Saltati: 1 (`test.skip`, «percentuale del coupon BENVENUTO»)
- Non eseguiti: nessuno

**Test fallito: «totale del carrello»** (test/sconti.test.js riga 13). `cartTotal([{price:1.1,qty:3},{price:2,qty:1}])` restituisce `5.300000000000001` invece di `5.3`. Causa: somma in virgola mobile in `cartTotal` (src/sconti.js). Il totale non viene arrotondato al centesimo, anche se il README dichiara «Prezzi in euro, arrotondati al centesimo». Un fix alla causa sarebbe arrotondare il risultato di `cartTotal` al centesimo (o sommare in centesimi interi), nel punto da cui passano tutti i chiamanti. Non applicato, come da istruzioni. Priorità: P2 (il chiamante può arrotondare, ma il contratto del README non è rispettato).

**Problemi nei test (non fallimenti, ma copertura falsa o incompleta):**
- «coupon scaduto» (riga 17) chiama `couponValid("ESTATE", "2026-10-01")` senza `assert`: passa sempre, quindi non verifica nulla. Manca `assert.equal(..., false)`. Priorità: P2.
- «percentuale del coupon BENVENUTO» è saltato con `test.skip` senza motivazione. Ho verificato a parte (non con il test) che `couponPercent("BENVENUTO", "2026-11-18")` restituisce 10, quindi il test si può riattivare. Priorità: P3.

**Casi limite non coperti** (verificati con una chiamata diretta alle funzioni, senza modificare i file):
- `applyDiscount(10, 150)` restituisce `-5`: lo sconto oltre il 100% non è rifiutato, e il prezzo diventa negativo. Priorità: P2.
- `applyDiscount(10, NaN)` restituisce `NaN` (in JSON `null`): valori non numerici non sono rifiutati. Priorità: P2.
- `cartTotal([{price:2,qty:-1}])` restituisce `-2`: quantità negative non sono rifiutate. Priorità: P2.
- `cartTotal([])` restituisce `0` (corretto, ma non è nei test).
- `couponValid` confronta le date come stringhe: `"2026-9-5"` (formato non ISO) non è validato. Il risultato dipende dal confronto lessicografico e non è garantito. Priorità: P3.
- Coupon con nomi di proprietà del prototipo (`constructor`, `toString`) restituiscono `false`: corretto, ma non è coperto da test. Priorità: P3.
- `0.1 + 0.2` in `cartTotal` restituisce `0.30000000000000004`: stesso problema del punto sui centesimi, non coperto da test. Priorità: P2.
- Carrello vuoto e prezzo zero in `applyDiscount`: non testati.

**Raccomandazioni per la prossima iterazione** (da confermare con l'utente):
1. Correggere `cartTotal` (arrotondamento al centesimo) e rendere verde `npm test`. Cambio in src: richiede l'ok dell'utente.
2. Aggiungere `assert` al test «coupon scaduto», riattivare il test BENVENUTO, aggiungere test per percentuale > 100, NaN e quantità negative.
3. Decidere se il progetto deve avere un lint. Oggi non ce n'è uno, quindi «lint superato» non può essere dichiarato.

**Limiti.** Ho eseguito solo `npm test` e le chiamate dirette alle funzioni con Node. Nessun test è stato aggiunto né modificato. Nessun dato personale è coinvolto.

— AISA-08 · DENEB