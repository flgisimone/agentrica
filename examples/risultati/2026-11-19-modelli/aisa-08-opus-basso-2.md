# Rapporto QA – calcolo-sconti

## Sintesi
Ho eseguito `npm test` (Node test runner): 6 test, **4 superati, 1 fallito, 1 saltato**. Il lint **non è stato eseguito**, perché il progetto non ha uno script `lint` (`npm run lint` dà "Missing script: lint") e non c'è nessun linter configurato. Non ho modificato nessun file.

## Esito dei test (`npm test`)
| Test | Esito |
|---|---|
| sconto del 10% | superato |
| sconto negativo rifiutato | superato |
| totale del carrello | **fallito** |
| coupon scaduto | superato, ma non verifica nulla (vedi sotto) |
| coupon valido il giorno della scadenza | superato |
| percentuale del coupon BENVENUTO | saltato (`test.skip`) |

## Causa del fallimento
**totale del carrello (P1):** il valore atteso è `5.3`, quello ottenuto è `5.300000000000001`. `cartTotal` somma `price * qty` in virgola mobile senza arrotondare al centesimo, quindi non rispetta la regola del README ("prezzi arrotondati al centesimo"). Il difetto è nel codice, non nel test. Correzione proposta, non applicata: arrotondare il totale con `Math.round(sum * 100) / 100`, oppure fare i conti in centesimi interi.

## Problemi nei test
- **"coupon scaduto" (P2):** il test chiama `couponValid("ESTATE", "2026-10-01")` ma non fa nessuna `assert`, quindi passa qualunque cosa restituisca la funzione. Il caso del coupon scaduto in realtà non è coperto. Proposta: `assert.equal(..., false)`.
- **Test saltato (P3):** il test della percentuale BENVENUTO è disattivato senza un motivo scritto. Se lo si riattiva, in base al codice dovrebbe passare (il coupon scade il 2027-12-31), ma non l'ho eseguito.

## Casi limite importanti non coperti
- `applyDiscount`: percentuale sopra 100 (dà un prezzo negativo, senza nessun controllo), percentuale 0 o 100, prezzo negativo, input non numerici o `NaN`, arrotondamento sui mezzi centesimi.
- `cartTotal`: carrello vuoto (restituisce 0), quantità 0, negative o decimali, prezzi negativi.
- `couponValid`: codice inesistente, maiuscole e minuscole (`"estate"`), date in formato diverso da AAAA-MM-GG. Il confronto è fra stringhe, quindi per esempio `"2026-9-30"` dà risultati sbagliati. Manca anche il caso del giorno prima della scadenza.
- `couponPercent`: coupon scaduto o inesistente (deve restituire 0).
- Codici ereditati dal prototipo: `COUPONS["toString"]` non è `undefined`, quindi `couponValid("toString", ...)` confronta con `undefined.expires` e lancia un TypeError. Il caso non è testato (P2). Proposta: usare `Object.hasOwn(COUPONS, code)`.

## Non eseguito
- Lint: manca lo script e manca la configurazione. Proposta: aggiungere ESLint con uno script `lint`, se l'utente lo approva (sarebbe una dipendenza nuova).

## Comandi eseguiti
- `npm test` → 4 superati, 1 fallito, 1 saltato
- `npm run lint` → errore "Missing script: lint"
