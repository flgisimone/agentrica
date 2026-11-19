AISA-08 · DENEB — Senior QA Engineer / Test Automation, reparto AISA (AI Software)

# Rapporto QA: calcolo-sconti

## Sintesi
Eseguito `npm test` (Node v26.12.1, `node --test test/`): 6 test, 4 superati, 1 fallito, 1 saltato, 0 cancellati. Lint: NON eseguito, nel progetto non esiste né uno script né una configurazione di lint (package.json ha solo `test`). Non ho modificato alcun file del progetto.

## Risultati
- Superati (4): sconto del 10%; sconto negativo rifiutato; coupon scaduto; coupon valido il giorno della scadenza.
- Fallito (1): "totale del carrello" (test/sconti.test.js:13).
- Saltato (1): "percentuale del coupon BENVENUTO" (`test.skip`, riga 25).
- Non eseguiti: lint, typecheck, build (non presenti).

## Causa del fallimento (P1)
`cartTotal` (src/sconti.js:13-15) somma in virgola mobile senza arrotondare: 1.1*3 + 2 = 5.300000000000001, il test attende 5.3. È un difetto del codice, non del test: il README dice che i prezzi sono arrotondati al centesimo, ma il totale non lo è, quindi un cliente potrebbe vedere o addebitare importi non arrotondati. Correzione proposta (non applicata): arrotondare il risultato al centesimo, come in `applyDiscount`, oppure sommare in centesimi interi. Da confermare con l'utente.

## Problemi nei test (P2)
- "coupon scaduto" (riga 17) chiama `couponValid("ESTATE","2026-10-01")` senza alcuna asserzione: passa sempre, anche se la funzione fosse sbagliata. Verifica manuale da me fatta: il valore reale è `false`, quindi andrebbe aggiunto `assert.equal(..., false)`.
- Test saltato su BENVENUTO: senza lo skip passerebbe (verifica manuale: `couponPercent("BENVENUTO","2026-11-18")` = 10). Non c'è motivo documentato per lo skip; proposta: riattivarlo. Nota: la scadenza di BENVENUTO è 2027-12-31 e il test usa una data fissa, quindi resta stabile.

## Casi limite importanti non coperti
- P2 `applyDiscount` con percentuale > 100: restituisce un prezzo negativo (verificato: `applyDiscount(10,150)` = -5). Manca il controllo superiore e il test.
- P2 `applyDiscount` con input non numerici/NaN, prezzo negativo: nessuna validazione né test.
- P3 Arrotondamento ai mezzi centesimi (es. 1.005) con `Math.round` su float: nessun test su valori limite; sconto 0% e 100% non testati.
- P2 `cartTotal`: carrello vuoto (restituisce 0, non testato), quantità 0 o negativa, prezzi negativi, molti articoli con accumulo di errori float.
- P2 `couponValid`/`couponPercent`: codice inesistente, minuscole/maiuscole, formato data non valido. Il confronto è fra stringhe: una data come "2026-9-30" dà `false` senza errore (verificato). Il codice "toString" dà correttamente `false`, ma `COUPONS[code]` su un oggetto semplice è fragile (prototipo): vale la pena un test per chiavi come "constructor"/"__proto__".
- P2 `couponPercent` con coupon scaduto o inesistente (deve dare 0): non testato.
- P3 Coupon applicato al totale del carrello: non c'è funzione né test che combini `cartTotal` e sconto.
- Scadenza: il giorno esatto è coperto (2026-09-30), il giorno dopo solo senza asserzione, il giorno prima non è testato.

## Rischi e limiti
Verifiche di stile, tipi e build non possibili: strumenti assenti. Nessuna copertura misurata. Nessuna modifica effettuata: le correzioni sopra sono proposte da confermare con l'utente.

Firmato: AISA-08 · DENEB
