AIBPD-09 · ALPHERATZ — Senior Sales & Revenue Strategist, reparto AIBPD (AI Business & Product Development)

Ho lavorato in sola lettura su `vendite/pipeline.csv` e `vendite/previsione.md`. Per controllare i valori ho usato anche `crescita/prezzi.md` (listino) e `partner/accordi.md`, e come data di oggi il 20/11/2026 indicato nel README. Non avevo il tool `agent`, quindi non ho potuto caricare il direttore AIBPD-01 · ALDERAMIN: il rapporto va a chi mi ha assegnato il compito. Non ho letto schede della biblioteca perché nessuna riguarda il compito: la scheda sulle riduzioni di prezzo vale per gli annunci ai consumatori, e qui i clienti sono imprese.

## Esito

La previsione non rispetta le sue stesse regole.
- **Q4:** è gonfiata da un'opportunità scaduta. Il valore corretto è circa **2.374 €**, non 2.728 €.
- **Q1:** è una somma non pesata e conta due volte Gruppo Portico. Il valore corretto è circa **8.114–8.946 €** (101–112% della quota), non 18.584 € (232%).
- **Copertura:** il valore corretto è circa **2,1×**, non 3,0×, quindi sotto il minimo di 3× che il documento stesso si è dato.

Prima di dare dei valori per buoni ho ricalcolato ogni `valore_annuo` dal listino: è prezzo mensile × 12 × numero di locali × (1 − sconto). Tutti i 13 valori sono coerenti con il listino.

## Rilievi

**R1 · P1 · previsione.md:31 · Copertura sbagliata**
- Il problema: i 24.057 € sono la somma dell'intero CSV. Dentro ci sono i firmati D-01 e D-09 (1.896 €, già vinti), D-02 (637 €, chiude nel Q4), D-05 scaduta (708 €) e Gruppo Portico contato due volte.
- La correzione: contare solo la pipeline aperta con chiusura nel Q1 e senza doppioni. Sono 20.816 € meno il doppione di Portico, cioè 16.777 € se si tiene P-07 o 17.014 € se si tiene D-03. Contro la quota di 8.000 € la copertura è **2,10–2,13×**, sotto il minimo di 3×. Il testo va corretto e serve un piano per generare altre opportunità, all'incirca altri 7.000–7.200 € di pipeline.

**R2 · P1 · previsione.md:26-27 · La previsione Q1 non è pesata**
- Il problema: la regola alla riga 9 chiede la somma pesata per la probabilità di tutte le opportunità con chiusura nel trimestre. Invece 18.584 € è la somma non pesata delle sole fasi Proposta e Negoziazione. Mancano D-04, D-07, D-10 e D-12, che chiudono anch'esse nel Q1.
- La correzione, voce per voce (valore × probabilità):

| Opportunità | Calcolo | Pesato |
|---|---|---|
| D-03 | 4.039 × 50% | 2.019,5 |
| D-04 | 348 × 30% | 104,4 |
| D-06 | 772 × 75% | 579 |
| D-07 | 348 × 10% | 34,8 |
| D-08 | 9.623 × 50% | 4.811,5 |
| D-10 | 1.188 × 30% | 356,4 |
| P-07 | 3.802 × 75% | 2.851,5 |
| P-11 | 348 × 50% | 174 |
| D-12 | 348 × 10% | 34,8 |
| **Totale** | | **10.965,9 €** |

  Il totale è 10.965,9 € prima di togliere il doppione di R3.

**R3 · P1 · D-03 e P-07 · Doppione di Gruppo Portico**
- Il problema: è lo stesso cliente, con 4 locali sul piano Plus, presente sia sul canale diretto sia sul partner Cassa Facile, ed entrambe le opportunità sono contate nella previsione Q1.
- La correzione: tenere una sola opportunità e chiudere l'altra come doppione.
  - Se si tiene P-07 (più avanti, in Negoziazione) la previsione Q1 è **8.946 €**, il 112% della quota.
  - Se si tiene D-03 è **8.114 €**, il 101%.
- Chi si attribuisce il cliente è una decisione dell'utente. Pesa anche il compenso al partner (vedi R8).

**R4 · P1 · D-05 · Data di chiusura scaduta e contata nel Q4**
- Il problema: la chiusura prevista era il 30/09/2026, cioè 51 giorni fa. La nota dice soltanto «in attesa di risposta». Questo viola la regola alla riga 10: un'opportunità scaduta si aggiorna o si chiude come persa entro una settimana. Inoltre la data cade nel Q3, quindi per la regola alla riga 9 non va nel Q4.
- La correzione: togliere D-05 dal Q4. Il valore pesato da chiudere diventa 477,75 € (solo D-02), e il **Q4 atteso diventa 2.374 €** invece di 2.728 €. Poi va aggiornata la data, con una prova di contatto, oppure va chiusa come persa.

**R5 · P1 · D-06 · Sconto del 35% senza approvazione**
- Il problema: la regola alla riga 8 chiede l'approvazione del CEO, scritta nelle note, per ogni sconto oltre il 20%. Le note di D-06 sono vuote.
- La correzione: scrivere l'approvazione nelle note. In mancanza, riportare lo sconto al 20%: il valore diventa 950 € (1.188 × 0,8) e il pesato 713 € invece di 579 €. Finché non si decide, va segnata come opportunità a rischio.

**R6 · P2 · D-04 · Probabilità sbagliata**
- Il problema: l'opportunità è in fase Demo ma ha probabilità 70. La regola alla riga 7 prevede il 30% per la Demo.
- La correzione: probabilità a 30. Nel ricalcolo dei punti R2 e R3 ho già usato il 30%.

**R7 · P2 · D-08 · Rischio di concentrazione e slittamento**
- Il problema: Pizza&Co vale 9.623 €, cioè circa il 57% della pipeline Q1 corretta e circa il 54% della previsione pesata. Chiude il 31/03/2027, l'ultimo giorno del trimestre. Se slitta, il Q1 scende a circa 3.300–4.100 €, cioè il 42–52% della quota.
- La correzione: verificare i passi già concordati con il cliente. Va anche presentato uno scenario prudente senza D-08 accanto alla previsione.

**R8 · P2 · P-07 e P-11 · Dipendenza da un accordo non firmato**
- Il problema: le due opportunità passano dal partner Cassa Facile, ma l'accordo è ancora da firmare a dicembre (`partner/accordi.md:3`).
  - Il compenso al partner è il 25% dell'incassato, IVA compresa, per 12 mesi (riga 14), quindi il ricavo netto è più basso dell'ARR a pipeline.
  - La clausola alla riga 15 riconosce al partner anche i clienti diretti con sede in Emilia-Romagna.
- La correzione: segnare nella previsione che queste opportunità dipendono dalla firma. Va anche verificato se qualche opportunità diretta cade sotto la clausola della riga 15: il CSV non riporta la sede dei clienti.

**R9 · P3 · previsione.md:35 · Obiettivo 2027 non collegato alla pipeline**
- Il problema: 520 locali significa +108 netti, ma le opportunità Q1 corrette valgono circa 19 locali e la previsione non tiene conto del tasso di abbandono.
- La correzione: aggiungere il collegamento fra locali, quota e tasso di abbandono. Non l'ho calcolato perché non rientra nel compito.

## Previsione corretta (proposta)

| Voce | Previsione attuale | Valore corretto |
|---|---|---|
| Q4 2026 | 2.728 € | 1.896 + 477,75 = **≈2.374 €** |
| Q1 2027 | 18.584 € (232%) | **≈8.946 €** (112%) tenendo P-07, oppure **≈8.114 €** (101%) tenendo D-03 |
| Copertura Q1 | 3,0× | **≈2,1×** |

Con D-06 ancora a rischio (R5) e D-08 da verificare (R7), la quota del Q1 non si può considerare coperta.

## Domande aperte per l'utente

1. Gruppo Portico va attribuito al canale diretto (D-03) o al partner (P-07)?
2. Esiste un'approvazione del CEO per lo sconto del 35% di D-06?
3. D-05 ha avuto un contatto recente, o va chiusa come persa?
4. Che sede hanno i clienti diretti, per la clausola Emilia-Romagna di Cassa Facile?

Le cifre vengono da un CSV di prova con dati inventati. Non ho modificato nessun file. Le correzioni sono proposte e diventano definitive solo con la conferma dell'utente.

— AIBPD-09 · ALPHERATZ
