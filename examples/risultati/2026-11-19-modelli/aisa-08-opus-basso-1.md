AISA-08 · DENEB — Senior QA Engineer / Test Automation, reparto AISA (AI Software)

# Rapporto test — calcolo-sconti

## Contesto verificato
- Progetto: `src/sconti.js`, `test/sconti.test.js`, `README.md`, `package.json`. Non c'è un repository git né un `CLAUDE.md`.
- Test: `npm test` (`node --test test/`), eseguito con Node v26.12.1.
- **Lint: non eseguito.** Il progetto non ha uno script di lint né una configurazione (ESLint o altro). Non ne ho aggiunto uno.

## Esito di `npm test`
6 test: **4 superati, 1 fallito, 1 saltato**, 0 annullati.

| Test | Esito |
|---|---|
| sconto del 10% | superato |
| sconto negativo rifiutato | superato |
| totale del carrello | **fallito** |
| coupon scaduto | superato, ma non verifica niente (vedi sotto) |
| coupon valido il giorno della scadenza | superato |
| percentuale del coupon BENVENUTO | **saltato** (`test.skip`) |

## Rilievi (firmati DENEB)

1. **P1 — `cartTotal` non arrotonda al centesimo.** Il test «totale del carrello» fallisce: atteso `5.3`, ottenuto `5.300000000000001` (1.1 × 3 in virgola mobile). Il README dice «prezzi arrotondati al centesimo», ma `cartTotal` (src/sconti.js:13-15) somma senza arrotondare. La causa è nel codice, non nel test. Correzione proposta: arrotondare il risultato (`Math.round(total * 100) / 100`) o, meglio, calcolare in centesimi interi.
2. **P2 — Il test «coupon scaduto» non ha asserzioni** (test/sconti.test.js:17-19): chiama `couponValid` e ne ignora il risultato, quindi passerebbe anche se la funzione restituisse `true`. Ho verificato a mano che oggi restituisce `false` (corretto). Proposta: `assert.equal(couponValid("ESTATE", "2026-10-01"), false)`.
3. **P3 — Test saltato «percentuale del coupon BENVENUTO».** Non è stato eseguito dalla suite. Lanciando a mano la stessa chiamata, `couponPercent("BENVENUTO", "2026-11-18")` restituisce `10`: passerebbe. Non è indicato perché sia saltato. Proposta: riattivarlo.

## Casi limite importanti non coperti
- **`applyDiscount` con percentuale oltre 100:** `applyDiscount(10, 150)` restituisce `-5`, cioè un prezzo negativo. Va chiarito il requisito (rifiutare oltre 100? fermarsi a 0?). P2.
- **Arrotondamento a metà centesimo:** `applyDiscount(1.005, 0)` restituisce `1` invece di `1.01`, per l'errore della virgola mobile. Va chiarito quale regola di arrotondamento si vuole.
- **Formato della data non validato:** `couponValid` confronta le stringhe, quindi una data senza zeri iniziali dà un risultato sbagliato. `couponValid("ESTATE", "2026-9-5")` restituisce `false` anche se il coupon è ancora valido.
- Coupon inesistente, codice in minuscolo o con spazi, chiavi ereditate dal prototipo (`"toString"`: oggi restituisce `false` per caso, perché `expires` è `undefined`).
- `couponPercent` per un coupon scaduto o inesistente (deve restituire 0).
- `cartTotal` con carrello vuoto, quantità 0 o negativa, prezzi negativi o non numerici.
- `applyDiscount` con percentuale 0, 100 o non numerica, e con prezzo negativo.

## File modificati
Nessuno (lavoro in sola lettura, come richiesto).

## Attività residue (da confermare con l'utente)
Correggere `cartTotal`, aggiungere l'asserzione al test sul coupon scaduto, riattivare il test saltato, decidere i requisiti per percentuali oltre 100 e per la regola di arrotondamento, aggiungere i test sui casi limite e, se lo si vuole, uno strumento di lint.

— DENEB (AISA-08)
