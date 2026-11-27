**AIBPD-09 · ALPHERATZ — Senior Sales & Revenue Strategist, reparto AIBPD (AI Business & Product Development)**

Revisione in sola lettura di `vendite/pipeline.csv` e `vendite/previsione.md`. Non ho modificato file. Non ho caricato AIBPD-01 e non ho consultato schede della biblioteca, perché nessuna riguarda il compito. Il rapporto è per AIBPD-01.

## Esito

La previsione Q1 2027 è sbagliata di più di un fattore 2 e la copertura è 2,0–2,1×, non 3,0×. L'importo Q4 è sovrastimato di circa 354 €. Un ricalcolo corretto della previsione Q1 dà 8.114–8.946 €, cioè circa 101–112% della quota, non il 232%, e dipende da due decisioni dell'utente.

Ho ricontrollato i valori: ogni `valore_annuo` corrisponde a locali × listino × (1 − sconto). Il listino è Base 348, Pro 708, Plus 1.188 € per locale all'anno.

## Rilievi

**P1 — Previsione Q1 non pesata (`previsione.md`, righe 24-27)**
- La regola (riga 9) chiede la somma dei valori pesati per la probabilità, su tutte le opportunità con chiusura nel trimestre. La tabella somma i valori pieni di 5 opportunità in Proposta e Negoziazione: 4.039 + 772 + 9.623 + 3.802 + 348 = 18.584 €.
- Ha anche escluso le opportunità in Demo e Qualifica (D-04, D-07, D-10, D-12), che la regola include.
- Con le probabilità della riga 7, tutte le 9 opportunità del trimestre pesano 10.965,9 € (calcolo nella tabella sotto).
- Correzione: riscrivere la riga con il valore pesato ricalcolato dopo gli altri rilievi. Il "232% della quota" va sostituito di conseguenza.

**P1 — Gruppo Portico contato due volte (D-03 e P-07)**
- Sono lo stesso cliente: 4 locali, piano Plus, un canale diretto (D-03, Proposta, sconto 15%, 4.039 €) e uno partner Cassa Facile (P-07, Negoziazione, sconto 20%, 3.802 €).
- Nel Q1 e nella pipeline totale vale solo uno dei due. Il doppio conteggio pesa 2.019,5 € (D-03) oppure 2.851,5 € (P-07) sulla previsione.
- Correzione: l'utente decide quale canale tenere e il commerciale chiude l'altro come duplicato. Il calcolo qui sotto mostra entrambe le ipotesi.

**P1 — Copertura sbagliata (`previsione.md`, riga 31)**
- I 24.057 € includono 1.896 € già firmati e 1.345 € di opportunità Q4 (D-02, D-05), che non coprono la quota Q1.
- Le sole opportunità aperte con chiusura nel Q1 valgono 20.816 €. Tolto il doppione D-03/P-07 diventano 16.777–17.014 €, cioè 2,1× (2,0× se si tolgono anche i 772 € di D-06, vedi sotto). Il minimo dichiarato è 3×, quindi la copertura non lo rispetta.
- Correzione: indicare 2,0–2,1× e segnalare che sotto il minimo. Servono altre opportunità in Qualifica e Demo per circa 7.000–8.000 € di pipeline aggiuntiva prima di dichiarare il trimestre coperto (3× di 8.000 € = 24.000 €, contro 16.777 € circa).

**P1 — D-06: sconto del 35% senza approvazione CEO (`pipeline.csv`, riga 7)**
- Viola la riga 8 delle regole: oltre il 20% serve l'approvazione scritta del CEO nelle note, e il campo `note` è vuoto.
- Correzione: non contare D-06 (579 € pesati) finché l'approvazione non è scritta nelle note, oppure riportare lo sconto entro il 20%. Con lo sconto al 20% il valore sarebbe 1.188 × 0,80 = 950 €. Quest'ultimo valore è una mia stima da confermare.
- L'approvazione è una decisione del CEO, non mia.

**P1 — D-05 scaduta e contata come Q4 (`pipeline.csv`, riga 6; `previsione.md`, righe 16-17)**
- La chiusura prevista è il 2026-09-30, ormai passata di quasi 8 settimane rispetto al CRM del 20 novembre. La regola (riga 10) chiede di aggiornarla o chiuderla come persa entro una settimana. La nota dice solo «in attesa di risposta».
- La previsione la conta in Q4 per 354 € pesati (708 × 50%), ma la sua data non cade nel trimestre.
- Correzione: il commerciale aggiorna la data oppure la chiude come persa. Fino ad allora l'atteso Q4 è 2.374 € (1.896 + 477,75), non 2.728 €.

**P2 — D-04: probabilità fuori regola (`pipeline.csv`, riga 5)**
- Fase Demo con probabilità 70%; la regola dice 30%. Nella previsione corretta uso 30%.
- Correzione: portare il campo a 30. Con 70% il peso sarebbe 243,6 € invece di 104,4 €.
- Il campo `probabilita` è ridondante rispetto alla fase e ha già prodotto un errore. Conviene derivarlo dalla fase, non tenerlo digitato.

**P3 — Arrotondamento Q4 e voce "Firmati"**
- 637 × 75% = 477,75 € e 708 × 50% = 354 €, totale 831,75, mostrato come 832. È corretto come arrotondamento ma nasconde i decimali. Segnalo solo per tracciabilità.
- D-01 e D-09 sono Firmati con chiusura il 12 e il 5 novembre: il totale 1.896 € è corretto.

**P3 — Obiettivo 2027 non collegato alla quota (`previsione.md`, righe 33-35)**
- 520 locali a fine anno contro 412 oggi sono +108 locali. Il documento non dice come si lega alla quota Q1 di 8.000 € di ARR nuovo, né alle quote degli altri trimestri.
- Non è un errore di calcolo, ma la quota Q1 e l'obiettivo non sono tracciabili tra loro. Domanda aperta per la direzione.

## Ricalcolo Q1 2027 (assunzioni esplicite)

Pesi della riga 7: Demo 30%, Proposta 50%, Negoziazione 75%, Qualifica 10%. D-04 ricondotta a 30%.

| ID | Fase | Valore | Pesato |
|---|---|---|---|
| D-03 | Proposta | 4.039 | 2.019,5 |
| D-04 | Demo | 348 | 104,4 |
| D-06 | Negoziazione | 772 | 579,0 |
| D-07 | Qualifica | 348 | 34,8 |
| D-08 | Proposta | 9.623 | 4.811,5 |
| D-10 | Demo | 1.188 | 356,4 |
| P-07 | Negoziazione | 3.802 | 2.851,5 |
| P-11 | Proposta | 348 | 174,0 |
| D-12 | Qualifica | 348 | 34,8 |
| **Totale con tutto** | | | **10.965,9** |

- **Tenendo D-03 e scartando P-07:** 8.114,4 € (101% della quota), 7.535 € senza D-06.
- **Tenendo P-07 e scartando D-03:** 8.946,4 € (112%), 8.367 € senza D-06.
- Il margine sulla quota è quindi sottile e dipende da D-08 (Pizza&Co, 9 locali, 4.811,5 € pesati, circa il 55–60% del totale). Una sola opportunità regge il trimestre: rischio di concentrazione.

## Decisioni e domande aperte per l'utente

1. Quale canale tenere per Gruppo Portico (diretto o partner Cassa Facile). Lo sconto del partner è al limite del 20%.
2. Approvazione scritta del CEO per lo sconto 35% di D-06, oppure sconto ridotto.
3. Stato reale di D-05: nuova data o persa.
4. Come aumentare la copertura a 3× per il Q1, o se rivedere il minimo.
5. Il legame tra la quota Q1 di 8.000 € e l'obiettivo di 520 locali.

Questi sono rilievi e raccomandazioni, non decisioni approvate. Il lavoro è stato fatto da un modello più piccolo della sessione. Le conclusioni sono calcoli verificabili, ma propongo il riesame di AIBPD-01 sui rilievi P1 prima che diventino definitivi.

— AIBPD-09 · ALPHERATZ
