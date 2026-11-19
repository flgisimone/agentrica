AISA-08 · DENEB — Senior QA Engineer / Test Automation, reparto AISA (AI Software)

## Sintesi
La suite fallisce: 6 test, 4 superati, 1 fallito, 1 saltato. Il lint non è stato eseguito perché nel progetto non esiste. Il fallimento è un difetto reale di `cartTotal`, non un errore del test. Anche uno dei test superati è falso: non contiene nessuna asserzione.

**Contesto verificato.** La cartella contiene `README.md`, `package.json`, `src/sconti.js` e `test/sconti.test.js`. Non ci sono `CLAUDE.md`, repository Git, dipendenze, `node_modules` né configurazione di lint. Lo stack è Node con ESM e `node:test`. Il README chiede Node 22 o successivo; sulla postazione c'è Node v26.12.1.

## Comandi eseguiti
- `npm test` (`node --test test/`): uscita 1.
- `npm run lint`: uscita 1, `Missing script: "lint"`. Non c'è nemmeno un file di configurazione di ESLint o Biome.
- Ho chiamato a mano le funzioni con `node -e`, solo per verificare i casi limite elencati sotto.

## Esito dei test
| Test | Esito | Nota |
|---|---|---|
| sconto del 10% | superato | |
| sconto negativo rifiutato | superato | |
| totale del carrello | **fallito** | vedi sotto |
| coupon scaduto | superato, ma **senza asserzione** | non verifica nulla |
| coupon valido il giorno della scadenza | superato | |
| percentuale del coupon BENVENUTO | **saltato** (`test.skip`) | eseguito a mano restituisce 10, quindi passerebbe |
| Lint | **non eseguito** | lo script non esiste |

## Rilievi (DENEB)

**P1, `cartTotal` non arrotonda al centesimo.** In `src/sconti.js` la funzione `cartTotal` somma `price * qty` in virgola mobile e non arrotonda. Con `[{price:1.1, qty:3}, {price:2, qty:1}]` restituisce `5.300000000000001` invece di `5.3`, e per questo il test fallisce. Il difetto va contro il README («prezzi arrotondati al centesimo»). Un altro esempio: `cartTotal([{price:0.1, qty:3}])` dà `0.30000000000000004`. Il totale è la funzione principale e lo sbaglia, quindi P1.
Correzione proposta, non applicata: arrotondare il risultato al centesimo come fa `applyDiscount`, oppure fare i conti in centesimi interi.

**P2, il test «coupon scaduto» è vuoto.** Chiama `couponValid("ESTATE", "2026-10-01")` ma non controlla il risultato, quindi passerebbe con qualsiasi valore restituito. A mano il risultato è `false`, cioè corretto. Correzione proposta: `assert.equal(..., false)`.

**P2, test saltato senza motivo.** Il test di `couponPercent` è disattivato con `test.skip`, ma a mano restituisce 10 come atteso. Togliendo lo skip si coprirebbe la funzione, che oggi non ha nessun test attivo. Il test usa la data fissa `2026-11-18` e quindi è deterministico, ma `BENVENUTO` scade il `2027-12-31`: conviene una data che resti sempre prima della scadenza.

**P2, `applyDiscount` accetta percentuali oltre 100.** `applyDiscount(10, 150)` restituisce `-5`, cioè un prezzo negativo. Viene rifiutato solo il valore sotto 0. Il comportamento atteso sopra 100 è da decidere con l'utente: errore oppure tetto a 100.

**P3, input non validi non controllati.**
- `applyDiscount(10, NaN)` restituisce `NaN`.
- `applyDiscount("10", 10)` restituisce `9` per coercizione da stringa.
- `cartTotal` accetta prezzi e quantità negativi: `[{price:-5, qty:2}]` dà `-10`.
- `cartTotal` non valida quantità decimali o mancanti.

I requisiti non dicono cosa fare in questi casi: è un punto da chiarire, non un difetto certo.

**P3, il confronto delle date è testuale.** `couponValid` confronta stringhe, quindi regge solo con il formato esatto `AAAA-MM-GG`:
- `couponValid("ESTATE", "2026-9-5")` restituisce `false`, anche se la data è prima della scadenza.
- `"2026-09-30T23:59"`, cioè lo stesso giorno della scadenza con l'orario, restituisce `false`.
- un oggetto `Date` restituisce `false`.

Il JSDoc dichiara il formato, ma la funzione non lo controlla.

**P3, arrotondamento sui valori al mezzo centesimo.** `Math.round(x * 100) / 100` sbaglia alcuni valori: `applyDiscount(1.005, 0)` dà `1` invece di `1.01`. È lo stesso tipo di problema di `cartTotal` e si risolve con la stessa scelta (conti in centesimi).

## Casi limite importanti non coperti dai test
- `cartTotal` con carrello vuoto (oggi restituisce 0), con un solo articolo, con quantità 0 e con valori che richiedono l'arrotondamento.
- `applyDiscount` con 0% e 100%, oltre 100%, con percentuali decimali e con arrotondamento al mezzo centesimo.
- `couponValid` con un codice inesistente, con un codice in minuscolo (`"estate"` oggi non vale, ed è da confermare se è voluto) e con un nome ereditato come `"toString"` (oggi restituisce `false` per caso).
- `couponValid` il giorno prima della scadenza e con date in formato diverso.
- `couponPercent` con coupon scaduto o inesistente: oggi restituisce 0, ma non è testato.
- Ci sono test di `applyDiscount` e `cartTotal` presi separatamente, ma nessun test sul flusso completo carrello, coupon e prezzo finale.

## File modificati
Nessuno. Le istruzioni chiedevano di non correggere nulla.

## Decisioni da chiedere all'utente
- Come trattare le percentuali oltre 100 e gli input non validi.
- Se i codici coupon devono essere sensibili alle maiuscole.
- Se aggiungere un linter. Oggi il progetto non ha dipendenze, quindi sarebbe la prima.

## Limiti
Ho eseguito solo `npm test` e le chiamate manuali descritte sopra. Il lint non è stato eseguito perché non esiste.

— DENEB (AISA-08)