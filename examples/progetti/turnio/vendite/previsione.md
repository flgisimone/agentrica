# Previsione delle vendite

Dati da [pipeline.csv](pipeline.csv), estratto del CRM al 20 novembre 2026. `valore_annuo` è l'ARR nuovo già al netto dello sconto.

## Regole

- **Probabilità per fase**: Qualifica 10%, Demo 30%, Proposta 50%, Negoziazione 75%, Firmato 100%.
- **Sconti**: fino al 20% li decide il commerciale; oltre il 20% serve l'approvazione del CEO, scritta nelle note dell'opportunità.
- **Previsione**: somma dei valori pesati per la probabilità, sulle opportunità con chiusura nel trimestre.
- Un'opportunità con la data di chiusura passata si aggiorna o si chiude come persa entro una settimana.

## Quarto trimestre 2026

| Voce | Importo |
|---|---|
| Firmati (D-01, D-09) | 1.896 € |
| Da chiudere, pesati: D-02 637 × 75% + D-05 708 × 50% | 832 € |
| **Atteso Q4 2026** | **2.728 €** |

## Primo trimestre 2027

Quota del trimestre: 8.000 € di ARR nuovo.

| Voce | Importo |
|---|---|
| Opportunità in Proposta e Negoziazione con chiusura nel trimestre (D-03, D-06, D-08, P-07, P-11) | 18.584 € |
| **Previsione Q1 2027** | **18.584 €**, il 232% della quota |

## Copertura

Pipeline totale 24.057 € contro la quota Q1 di 8.000 €: copertura 3,0×, sopra il minimo di 3× che ci siamo dati.

## Obiettivo 2027

520 locali paganti a fine 2027 (oggi 412).
