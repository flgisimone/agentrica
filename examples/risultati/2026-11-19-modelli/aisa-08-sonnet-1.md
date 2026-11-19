AISA-08 · DENEB — Senior QA Engineer / Test Automation, reparto AISA (AI Software)

# Rapporto QA: calcolo-sconti

## Sintesi
Eseguito `npm test` (node --test test/, Node v26.12.1). Risultato: 6 test, 4 superati, 1 fallito, 1 saltato. Lint: non eseguito, nel progetto non c'è alcuno strumento di lint (package.json ha solo lo script `test`; nessuna dipendenza). Non ho modificato nulla.

## Test superati (4)
- sconto del 10%
- sconto negativo rifiutato
- coupon scaduto (ma vedi sotto: non ha nessuna asserzione, passa sempre)
- coupon valido il giorno della scadenza

## Test falliti (1)
- **totale del carrello** (test/sconti.test.js:13). Atteso 5.3, ottenuto 5.300000000000001.
  - Causa: bug nel codice, non nel test. `cartTotal` in src/sconti.js somma numeri in virgola mobile (1.1*3 + 2) senza arrotondare, mentre il README promette "prezzi in euro, arrotondati al centesimo". Gravità P1: il totale del carrello è una funzione principale e il valore può essere mostrato o addebitato con decimali spuri.
  - Correzione proposta (non applicata): arrotondare il risultato al centesimo, ad esempio `Math.round(somma * 100) / 100`, o lavorare in centesimi interi.

## Test saltati (1)
- "percentuale del coupon BENVENUTO" è `test.skip`. L'ho verificato a mano con una prova fuori dal progetto: `couponPercent("BENVENUTO","2026-11-18")` dà 10, quindi il test passerebbe. Va riabilitato (P3).

## Test non eseguiti / non esistenti
- Lint, build e typecheck: non presenti, quindi non eseguiti.

## Problemi nei test
- **"coupon scaduto" non verifica nulla** (P2): chiama `couponValid("ESTATE", "2026-10-01")` senza `assert`. Passerebbe anche con il codice sbagliato. Serve `assert.equal(..., false)`. Con una prova manuale il risultato è effettivamente false.

## Casi limite non coperti
- `applyDiscount` con percentuale > 100: `applyDiscount(10, 150)` restituisce -5, un prezzo negativo; è accettato senza errore (P2).
- `applyDiscount` con percentuale NaN o non numerica: restituisce NaN, nessun controllo (la guardia `percent < 0` è falsa con NaN) (P2). Stesso per prezzo negativo o non numerico.
- `cartTotal`: carrello vuoto (dovrebbe dare 0), quantità 0 o negativa, prezzi negativi, arrotondamento con molti articoli.
- `couponValid`/`couponPercent`: codice inesistente, giorno prima e dopo la scadenza (solo il giorno esatto è testato), minuscole/spazi nel codice, `today` in formato errato (il confronto è tra stringhe e funziona solo con AAAA-MM-GG; un formato diverso dà risultati sbagliati in silenzio) (P3).
- `COUPONS[code]` accede anche alle proprietà ereditate dell'oggetto (es. "toString", "constructor"): oggi dà comunque false per caso, ma è fragile; meglio `Object.hasOwn` o una `Map` (P3).
- `couponPercent` per un coupon scaduto o inesistente (deve dare 0): non testato.
- Arrotondamento di `applyDiscount` sui casi a metà centesimo (es. 1.005): non testato.
- Coupon ESTATE: la scadenza 2026-09-30 è già passata rispetto alla data odierna (2026-11-19), coerente col test "scaduto" ma da tenere presente per test dipendenti dalla data; i test usano date fisse, bene.

## Rischi e limiti
- Il test fallito segnala un difetto reale e va corretto prima di considerare il modulo affidabile.
- Nessuna misura di copertura disponibile (nessuno strumento configurato).

## Attività residue proposte (da confermare)
1. Correggere `cartTotal` con arrotondamento al centesimo (P1).
2. Aggiungere l'asserzione al test "coupon scaduto" (P2) e togliere lo skip dal test BENVENUTO (P3).
3. Validare `applyDiscount` (percentuale > 100, NaN) (P2) e aggiungere i test dei casi limite sopra.
4. Valutare un lint (decisione dell'utente: sarebbe una dipendenza nuova).

— DENEB (AISA-08)
