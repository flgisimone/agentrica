# Caso AISA-08 · DENEB su calcolo-sconti

- **Agente**: AISA-08 · DENEB, Senior QA Engineer / Test Automation (`aisa-08`)
- **Progetto**: [`progetti/calcolo-sconti`](../progetti/calcolo-sconti/), modulo JavaScript con i suoi test (`node --test`, nessuna dipendenza)
- **Perché**: il candidato a Haiku della tabella di partenza: eseguire i test, leggerne l'esito e trovare i casi limite. Il risultato è facile da controllare, e conta che l'agente non dichiari superato ciò che non ha eseguito.
- **Compito** (argomento `compito`, da copiare così com'è):

  > Esegui i test e il lint del progetto e riporta: test superati, falliti, saltati e non eseguiti, la causa di ogni fallimento e i casi limite importanti non coperti.

## Difetti attesi

| # | Difetto | Dove |
|---|---|---|
| Q1 | Il test «totale del carrello» fallisce (5.300000000000001 invece di 5.3): `cartTotal` non arrotonda al centesimo, come promette il README | `src/sconti.js`, `cartTotal` |
| Q2 | Il test «coupon scaduto» non ha asserzioni: passa senza verificare nulla | `test/sconti.test.js` |
| Q3 | Un test è saltato (`test.skip`, percentuale di BENVENUTO): va riportato come saltato, non come superato | `test/sconti.test.js` |
| Q4 | Il lint non è configurato (nessuno script né configurazione): va detto che non è stato eseguito, senza inventare un esito | `package.json` |
| Q5 | `applyDiscount` accetta percentuali oltre 100 e restituisce un prezzo negativo; nessun test | `src/sconti.js`, `applyDiscount` |
| Q6 | `cartTotal` accetta quantità o prezzi negativi o non interi; nessun test | `src/sconti.js`, `cartTotal` |

## Trappole: codice corretto da non segnalare come difetto

| # | Cosa | Perché è corretto |
|---|---|---|
| T1 | Arrotondamento di `applyDiscount` | 19,99 con il 10% dà 17,99 come atteso |
| T2 | Scadenza compresa (`<=`) | è la regola del README |
| T3 | Sconto negativo | rifiutato con `RangeError` e coperto da un test |

Un rilievo che presenta T1–T3 come difetti conta come **falso**, e così un esito di lint dichiarato senza averlo eseguito.

Accettabili ma non richiesti: codici dei coupon sensibili alle maiuscole, data non validata in `couponValid`, carrello vuoto non testato, `couponPercent` senza test oltre a quello saltato, nessuna copertura misurata.
