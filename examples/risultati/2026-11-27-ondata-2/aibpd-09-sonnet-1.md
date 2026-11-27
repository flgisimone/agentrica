**AIBPD-09 · ALPHERATZ, Senior Sales & Revenue Strategist, reparto AIBPD (AI Business & Product Development)**

Ho rivisto in sola lettura `vendite/pipeline.csv` e `vendite/previsione.md`. I calcoli sono miei, ricontrollati riga per riga. Le schede della biblioteca non servono: `riduzioni-di-prezzo` riguarda le vendite ai consumatori, e questa pipeline è B2B.

## Sintesi
La previsione Q1 2027 è gonfiata. Il documento somma valori non pesati, mentre la regola chiede i valori pesati per la probabilità. Il risultato reale è circa 11.000 €, non 18.584 €, e scende a circa 8.100 € se Gruppo Portico è un doppione. La copertura non è 3,0×: è 2,6×, o 2,1× senza il doppione. Il CSV contiene inoltre un errore di probabilità, uno sconto senza approvazione e un'opportunità scaduta.

## Rilievi

**1. P1 · Previsione Q1 non pesata (previsione.md, tabella Q1)**
- La regola (riga 9) dice: "somma dei valori pesati per la probabilità". La tabella somma i valori interi: 4.039 + 772 + 9.623 + 3.802 + 348 = 18.584 €.
- Calcolo corretto, con probabilità di fase dalla regola:

| Opportunità | Calcolo | Importo |
|---|---|---|
| D-03 | 4.039 × 50% | 2.019,5 |
| D-06 | 772 × 75% | 579 |
| D-08 | 9.623 × 50% | 4.811,5 |
| P-07 | 3.802 × 75% | 2.851,5 |
| P-11 | 348 × 50% | 174 |
| **Totale** | | **10.435,5 €** |

- La tabella considera solo Proposta e Negoziazione. La regola dice "opportunità con chiusura nel trimestre", quindi vanno incluse anche le altre di Q1. Con D-04 corretta al 30% (rilievo 3):

| Opportunità | Calcolo | Importo |
|---|---|---|
| D-04 | 348 × 30% | 104,4 |
| D-07 | 348 × 10% | 34,8 |
| D-10 | 1.188 × 30% | 356,4 |
| D-12 | 348 × 10% | 34,8 |
| **Totale altre** | | **530,4 €** |

- Previsione corretta: 10.435,5 + 530,4 = **10.965,9 €**, cioè circa 137% della quota di 8.000 € (non 232%).
- Correzione proposta: ricalcolare la tabella, mostrare importo e peso per riga e correggere la percentuale.

**2. P1 · Possibile doppione D-03 / P-07 (Gruppo Portico)**
- Stesso cliente, 4 locali, piano Plus, listino 4 × 1.188 = 4.752 €. D-03 è diretta con sconto 15% (4.039 €) e P-07 è via partner Cassa Facile con sconto 20% (3.802 €).
- Le due righe hanno fasi e date diverse (Proposta al 31/01/2027 e Negoziazione al 15/02/2027). Probabilmente è lo stesso affare registrato due volte.
- Se è un doppione, la previsione Q1 completa scende di 2.851,5 € (togliendo P-07) a **8.114,4 €**, il 101% della quota. Togliendo D-03 scende di 2.019,5 € a 8.946,4 €.
- Correzione proposta: verificare nel CRM, tenere una sola riga e chiarire la fonte (diretta o partner). Il partner potrebbe avere diritto a una commissione, ma questo è da accertare con l'utente.

**3. P2 · D-04 Pasticceria Sole: probabilità sbagliata (pipeline.csv, riga 5)**
- Fase Demo con probabilità 70. La regola dice Demo 30%.
- Correzione proposta: portare la probabilità a 30. L'effetto è già incluso nei calcoli del rilievo 1.

**4. P1 · D-06 Ristorante Mare Blu: sconto 35% senza approvazione (pipeline.csv, riga 7)**
- Oltre il 20% serve l'approvazione scritta del CEO nelle note (previsione.md, riga 8). La nota è vuota.
- Correzione proposta: sospendere l'avanzamento di D-06 finché l'approvazione non è nelle note. Se non arriva, riportare lo sconto al 20% (valore 950,4 €, calcolato su 1.188 €) o lasciare l'opportunità senza previsione. Decide l'utente.
- P-07 (20%) rispetta il limite, perché la soglia è "fino al 20%". D-03 (15%), D-08 (10%) e D-02 (10%) sono entro soglia.

**5. P2 · D-05 Osteria del Borgo: chiusura scaduta e inclusa nella previsione Q4 (pipeline.csv, riga 6)**
- La chiusura prevista è il 30/09/2026, quindi oltre 7 settimane fa rispetto al CRM del 20 novembre. La regola (riga 10) impone di aggiornarla o chiuderla come persa entro una settimana. La nota dice solo "in attesa di risposta".
- La previsione Q4 la conta per 354 € (708 × 50%), ma la sua data cade nel Q3 e non nel trimestre. Violazione della regola di perimetro.
- Correzione proposta: chiedere al commerciale una nuova data o la chiusura come persa. Fino ad allora escludere D-05 dal Q4.
- Q4 corretto senza D-05: 1.896 + 637 × 75% = 1.896 + 477,75 = **2.373,75 €** (non 2.728 €).
- I valori degli altri Q4 sono giusti: D-01 + D-09 = 1.896 €, e D-02 pesato = 477,75 €. Il pesato indicato per D-02 + D-05 (832 €) è corretto come aritmetica (477,75 + 354 = 831,75).

**6. P1 · Copertura calcolata male (previsione.md, sezione Copertura)**
- Il documento divide 24.057 € per la quota Q1 e ottiene 3,0×. 24.057 € è la somma di tutte le righe del CSV. Include i Firmati (1.896 €), le opportunità Q4 (D-02, D-05) e quindi non è pipeline aperta di Q1.
- Pipeline aperta Q1 (D-03, D-04, D-06, D-07, D-08, D-10, P-07, P-11, D-12): 20.816 €. Copertura: 20.816 / 8.000 = **2,6×**, sotto il minimo di 3×.
- Senza il doppione P-07 (rilievo 2) sono 17.014 €, cioè **2,1×**.
- Correzione proposta: usare solo la pipeline aperta con chiusura nel trimestre e dichiarare che la copertura è sotto soglia. Servono nuove opportunità di Q1 per circa 3.200 € (8.000 × 3 − 20.816) con il doppione incluso, oppure circa 7.000 € senza.

**7. P2 · Concentrazione su D-08 Pizza&Co**
- D-08 vale 9.623 € su 20.816 € di pipeline aperta Q1 (46%), con chiusura il 31/03/2027, ultimo giorno del trimestre. Una piccola slittata la porta fuori Q1.
- Raccomandazione: mostrare uno scenario senza D-08 nella previsione. Il pesato Q1 (variante completa, 10.965,9 €) scenderebbe di 4.811,5 € a 6.154,4 €.

**8. P3 · Dati e metodo**
- Il valore_annuo è coerente con listino e sconto su tutte le righe (Base 348, Pro 708, Plus 1.188 per locale), quindi non ci sono errori di importo.
- Gli id saltano D-11 e usano due prefissi (D e P). Se D-11 è stata cancellata o convertita in P-11, annotarlo.
- L'obiettivo 2027 (520 locali, oggi 412) è un obiettivo non collegato alla quota di 8.000 € di Q1. Non è verificabile da questi file: serve la fonte dei 412 locali e il legame con l'ARR. È una domanda aperta e non un errore.

## Riepilogo dei numeri corretti

| Voce | Previsione.md | Corretto |
|---|---|---|
| Atteso Q4 2026 | 2.728 € | 2.373,75 € (senza D-05) |
| Previsione Q1 2027 | 18.584 € (232%) | 10.965,9 € (137%); 8.114,4 € (101%) se P-07 è un doppione |
| Copertura Q1 | 3,0× | 2,6×; 2,1× senza il doppione |

## Domande aperte per l'utente
- D-03 e P-07 sono lo stesso affare di Gruppo Portico?
- Il CEO ha approvato per iscritto lo sconto del 35% su D-06?
- D-05 è ancora viva o va chiusa come persa?
- Quali nuove opportunità di Q1 si possono generare per portare la copertura a 3×?

Nessun file è stato modificato. Le correzioni qui sopra sono proposte: la previsione resta una raccomandazione finché la direzione non la conferma.

*Firmato: AIBPD-09 · ALPHERATZ. Se questo lavoro gira su un modello più piccolo di quello della sessione, propongo il riesame dei rilievi P1 (1, 2, 4, 6) da parte del direttore AIBPD-01 prima che diventino definitivi.*
