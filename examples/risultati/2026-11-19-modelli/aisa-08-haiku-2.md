# AISA-08 · DENEB — Rapporto QA: calcolo-sconti

AISA-08 · DENEB — Senior QA Engineer / Test Automation, reparto AISA (AI Software).

## Sintesi

Il progetto `calcolo-sconti` ha 6 test: 4 superati, 1 fallito, 1 saltato. Il fallimento è un difetto reale del codice, non del test: `cartTotal` restituisce `5.300000000000001` invece di `5.3`, in contrasto con la regola del README («prezzi arrotondati al centesimo»). Il progetto non ha uno script di lint, quindi il lint non è stato eseguito. Non ho modificato alcun file del progetto.

## Test eseguiti

Comando: `npm test` (equivale a `node --test test/`), Node v26.12.1, npm 11.8.0.

| Test | Esito |
|---|---|
| sconto del 10% | superato |
| sconto negativo rifiutato | superato |
| totale del carrello | **fallito** |
| coupon scaduto | superato, ma senza asserzione (vedi rilievo 2) |
| coupon valido il giorno della scadenza | superato |
| percentuale del coupon BENVENUTO | saltato (`test.skip`, nessun motivo indicato) |

Non eseguiti: lint e typecheck. Nel `package.json` esiste solo lo script `test`; non ho inventato comandi di lint.

## Causa del fallimento

`totale del carrello`: `cartTotal([{price: 1.1, qty: 3}, {price: 2, qty: 1}])` restituisce `5.300000000000001`. La funzione somma in virgola mobile e non arrotonda al centesimo. Stesso problema con `cartTotal([{price: 0.1, qty: 3}])`, che restituisce `0.30000000000000004`.

## Rilievi

**1. P1 — `cartTotal` non arrotonda al centesimo (test rosso).** Il totale del carrello è la funzione principale del modulo e produce importi sbagliati per il cliente. Il test fallito è corretto: il difetto è nel codice. Correzione proposta, da confermare: arrotondare il valore restituito da `cartTotal` al centesimo, nel punto in cui tutti i chiamanti lo ricevono (es. `Math.round(sum * 100) / 100`), oppure sommare in centesimi interi. Non applicata, perché sono modifiche al codice.

**2. P2 — test «coupon scaduto» senza asserzione.** Il test chiama `couponValid("ESTATE", "2026-10-01")` ma non verifica il risultato: resta verde anche se la logica di scadenza si rompe. Il valore corretto è `false`. Proposta: `assert.equal(couponValid("ESTATE", "2026-10-01"), false)`.

**3. P2 — `applyDiscount` accetta percentuali oltre 100.** `applyDiscount(10, 150)` restituisce `-5`: un prezzo negativo. Anche `applyDiscount(10, NaN)` restituisce `NaN`, e la stringa `"5"` viene convertita in silenzio (`applyDiscount(10, "5")` restituisce `9.5`). Il controllo esiste solo per il valore negativo. Proposta: validare che `percent` sia un numero tra 0 e 100 e lanciare `RangeError` come già avviene per i negativi.

**4. P3 — test BENVENUTO saltato senza motivo.** Con la data fissa `2026-11-18` la funzione restituisce `10`, cioè il valore atteso: il test passerebbe. Proposta: rimuovere `.skip` oppure documentare il motivo.

**5. P3 — `cartTotal` accetta quantità negative o zero senza errore.** `cartTotal([{price: 5, qty: -1}])` restituisce `-5`. Un prezzo `undefined` restituisce `NaN`. Proposta: validare `qty` e `price` come nel punto 3.

**6. P3 — formato della data non validato.** `couponValid` confronta stringhe. Con `"2026-9-30"` (non zero-padded) restituisce `false` senza segnalare errore. Il confronto funziona solo con il formato AAAA-MM-GG; il commento lo dichiara ma nulla lo verifica.

**7. P3 — limite: arrotondamento binario su input sub-centesimo.** `applyDiscount(1.005, 0)` restituisce `1`, non `1.01`, per l'errore di rappresentazione binaria di `Math.round(x * 100)`. Il caso è improbabile con prezzi reali in euro, quindi lo segnalo come limite, non come difetto.

**8. P3 — chiavi del prototipo.** `couponValid("constructor")`, `couponPercent("__proto__")` e `couponPercent("toString")` restituiscono il valore corretto (`false` oppure `0`), ma per caso: `COUPONS` è un oggetto semplice e il controllo dipende da `expires` che è `undefined`. Non c'è un test che lo garantisca. Proposta: usare `Object.hasOwn(COUPONS, code)` e aggiungere un test.

## Casi limite non coperti

- Coupon ESTATE scaduto con `couponPercent` (atteso `0`): non testato.
- Coupon del giorno successivo alla scadenza con asserzione: il test esiste ma non asserisce.
- Carrello vuoto (`cartTotal([])` restituisce `0`, corretto ma non testato).
- Percentuali oltre 100, `NaN` e stringhe: non testati.
- Quantità negative o zero, prezzi mancanti: non testati.
- Date malformate: non testate.
- Prototipi (`constructor`, `__proto__`, `toString`) come codice coupon: non testati.

## File modificati

Nessuno. Ho solo eseguito `npm test` e alcune chiamate di prova in sola lettura.

## Decisioni e limiti

- Il fallimento di `cartTotal` è un difetto del codice: la correzione (punto 1) va decisa dall'utente.
- Il lint non è disponibile nel progetto: se serve, va aggiunto uno script, ma è una dipendenza nuova e richiede il suo ok.
- Ho eseguito solo test unitari su dati sintetici; non ci sono dati personali nel progetto.
- Nota di processo: ho elencato il contenuto della cartella `rapporti/` (solo i nomi, nessun file letto) durante la ricerca della cartella di destinazione del rapporto. Non ho aperto altri file.

Firmato: AISA-08 · DENEB
