# Richiesta: resi dei negozi

Dal responsabile commerciale, 18 novembre 2026. Bozza dei requisiti da rivedere prima dello sviluppo.

## Contesto

Oggi i negozi segnalano la merce da rendere (frutta rovinata, colli sbagliati) per telefono, e l'amministrazione corregge a mano la fattura. Vogliamo che il negozio apra il reso dal gestionale.

## Requisiti

| # | Requisito |
|---|---|
| R1 | Il negozio può rendere la merce di un suo ordine entro pochi giorni dalla consegna |
| R2 | Il negozio sceglie la riga dell'ordine, la quantità da rendere e indica l'importo da rimborsare |
| R3 | Il reso viene accettato e la merce torna in giacenza |
| R4 | L'operatore del magazzino può correggere l'importo del reso se non è d'accordo |
| R5 | L'importo del reso è calcolato dal prezzo della riga dell'ordine moltiplicato per la quantità resa |
| R6 | Accettato il reso, si modifica la fattura originale dell'ordine con il nuovo importo |
| R7 | Il negozio vede l'elenco dei suoi resi con lo stato |

## Criteri di accettazione

- Il flusso del reso è semplice e veloce per il negozio.
- I resi sono gestiti correttamente dal magazzino.
- Nessun errore nelle fatture.
