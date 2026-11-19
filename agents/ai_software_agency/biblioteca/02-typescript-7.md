# TypeScript 7.0

Fonte: typescript · Versione: 7.0 · Verificata il: 2026-11-19 · Da ricontrollare entro: 2027-02-19 · Ruoli: AISA-02, AISA-04, AISA-05, AISA-06, AISA-08, AISA-10, AISA-12

## Nozione
TypeScript 7.0, annunciato l'8 luglio 2026, è il compilatore riscritto in Go, circa dieci volte più veloce della 6.0; si installa sempre come pacchetto typescript e il comando resta tsc. La 6.0 è stata l'ultima versione sul codice JavaScript; per tenerla accanto alla 7 esiste il pacchetto @typescript/typescript6, con il comando tsc6.

Cambiano alcuni predefiniti: strict è attivo, module è esnext, types è un elenco vuoto (si ripristina con il valore «*»), rootDir è la cartella del progetto. Diventano errori opzioni già deprecate, fra cui target es5, downlevelIteration, moduleResolution node o node10 e classic, baseUrl, esModuleInterop a false. La 7.0 non ha un'API programmatica: gli strumenti che la usano (per esempio typescript-eslint o il supporto di Vue, Astro, Svelte e Angular negli editor) restano per ora sulla 6.0.

## Come si applica
- Prima di proporre il passaggio alla 7, controlla versione di TypeScript e strumenti che ne usano l'API (lint, editor, framework): se dipendono dall'API, il progetto resta sulla 6.0 o usa l'alias del pacchetto typescript6 per quegli strumenti.
- Il percorso consigliato passa dalla 6.0: un progetto che compila pulito sulla 6.0, senza ignoreDeprecations, dovrebbe compilare allo stesso modo sulla 7.0.
- In un aggiornamento elenca le opzioni del tsconfig che diventano errori e i predefiniti che cambiano (types, rootDir, strict), con la modifica proposta.
- Non trattare la 7.1 beta come versione stabile.
