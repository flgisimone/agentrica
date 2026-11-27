AIBPD-02 · PROCYON — Senior Market Research Analyst, reparto AIBPD (AI Business & Product Development)

Ho rivisto in sola lettura i documenti di `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-02-1/mercato/`. Non ho modificato nessun file.

Nota di processo: le istruzioni dicono di caricare il direttore AIBPD-01 · ALDERAMIN, ma in questa sessione non ho il tool `agent`. Il rapporto va quindi a lui tramite chi mi ha avviato. Non ho letto schede della biblioteca perché nessuna riguarda il compito: art. 17-bis, art. 54-bis e la Direttiva 2024/825 trattano comunicazioni ai consumatori, mentre Turnio vende a imprese. Il README dice che fonti e numeri sono inventati, quindi non li ho verificati sul web. Ho controllato la coerenza interna, i calcoli e il metodo. Tutti i calcoli sono rifatti con python3.

## Esito

Le moltiplicazioni sono giuste, ma l'impianto non regge. La sintesi è destinata agli investitori e contiene:
- un TAM gonfiato circa 7 volte;
- una crescita annua sbagliata (32% invece di circa 20,5%);
- una disponibilità a pagare estesa al mercato partendo dai soli clienti;
- quote di mercato calcolate su unità diverse;
- un posizionamento falso: Turnio risulta «secondo», ma è terzo.

Non ci sono P0. Ci sono 7 rilievi P1 da correggere prima del piano 2027 e di qualsiasi uso con gli investitori.

## Rilievi

**R1 · P1 · `sintesi-mercato.md` r.9 (TAM): fonte superata e base sbagliata**
- Usa 198.000 locali da F1, che è del marzo 2019. F2 (giugno 2026) dice 176.000.
- Conta tutti i locali, anche il 58% senza dipendenti, che un'app dei turni non può servire.
- Il calcolo 198.000 × 99 × 12 = 235.224.000 € è giusto, ma la base no.
- Correzione: TAM = 176.000 × 31% (locali con 3–40 dipendenti, F2) = 54.560 locali.

**R2 · P1 · `sintesi-mercato.md` r.9–13: prezzo per locale non motivato**
- Applica a tutti i locali i 99 € del piano Plus, «perché è quello verso cui crescono i clienti». Nessun dato lo dimostra.
- Oggi solo 52 locali su 412 sono su Plus, e 190 sono su Base (`crescita/prezzi.md` r.14).
- Correzione: usare il ricavo medio reale per locale, 21.630 / 412 = 52,50 €/mese, cioè 630 € l'anno. Il prezzo di Pro (59 €) può servire come scenario alternativo. In entrambi i casi l'assunzione va scritta.
- Risultato: TAM ≈ 34,4 M€ l'anno con il ricavo medio reale, ≈ 38,6 M€ con il prezzo Pro. Non 235,2 M€.

**R3 · P1 · `sintesi-mercato.md` r.10 (SAM): fonti mescolate e segmento escluso**
- Applica la quota del 60% Nord e Centro, presa da F2 (2026), alla base di F1 (2019).
- Ignora il segmento 3–40 dipendenti che il documento stesso dichiara a r.29.
- Correzione: 54.560 × 60% = 32.736 locali. Con il ricavo medio reale fa ≈ 20,6 M€ l'anno, con il prezzo Pro ≈ 23,2 M€.
- Va dichiarata un'ipotesi: che la quota Nord e Centro sia la stessa anche fra i locali con 3–40 dipendenti.

**R4 · P1 · `sintesi-mercato.md` r.11 (SOM): obiettivo arbitrario e non plausibile**
- Il 5% del SAM non ha nessuna motivazione: è una stima dall'alto, senza capacità commerciale, canali né tassi di conversione.
- I calcoli sono giusti (7,06 M€ e 5.940 locali), ma 5.940 locali in tre anni vogliono dire 14 volte i 412 di oggi. Sarebbe anche più di 2,5 volte il leader, Orarix, che ha circa 2.300 locali.
- Anche così, con il prezzo reale i 5.940 locali varrebbero ≈ 3,7 M€, non 7,1 M€.
- Correzione: costruire il SOM dal basso, con la capacità delle 3 persone di vendita, il tasso di conversione dell'imbuto, l'abbandono dei clienti e la previsione in `vendite/`. Presentare tre scenari con le assunzioni esplicite.

**R5 · P1 · `sintesi-mercato.md` r.17: crescita annua composta sbagliata e generalizzazione**
- Da 0,8 a 1,4 miliardi fra il 2023 e il 2026 passano 3 anni: (1,75)^(1/3) − 1 = 20,5% l'anno.
- Il 32% viene da un calcolo su 2 anni: (1,75)^(1/2) − 1 = 32,3%.
- «Il mercato dei turni segue lo stesso andamento» non ha prove. La spesa in software gestionale comprende anche casse, magazzino e altro.
- Il dato «2026» viene da un rapporto di giugno 2026, quindi l'anno non era finito: probabilmente è una stima o una proiezione.
- Correzione: scrivere 20,5% e indicare il 2026 come stima. Togliere l'estensione al mercato dei turni o marcarla come ipotesi da verificare.

**R6 · P1 · `sintesi-mercato.md` r.21 e `sondaggio-2026.md` r.4 e r.14: disponibilità a pagare estesa al mercato**
- Il campione sono solo clienti attuali, che già pagano (fra loro c'è chi è sopravvissuto alla prova e ha scelto di restare).
- Ha risposto il 18% (74 su 412), quindi le risposte si sono selezionate da sole, e c'era un incentivo di 10 €.
- È un'intenzione dichiarata, non un comportamento.
- Non si può dire che vale per «il 64% dei locali del mercato».
- Il comportamento reale va in senso contrario: il 46% dei clienti (190 su 412) è sul piano Base da 29 €.
- Con 74 risposte, il margine di errore al 95% è di circa ±11 punti, quindi il dato va letto come 53–75%.
- Le fasce di risposta si sovrappongono: «30–59 €» e «59 € o più» contengono entrambe 59 €.
- Correzione: riformulare come «il 64% dei 74 clienti che hanno risposto dichiara…», con limiti e margine. Per il mercato servono un campione di non clienti e un metodo di prezzo (per esempio Van Westendorp o Gabor-Granger), con fasce che non si sovrappongono (meno di 30, 30–58,99, 59 o più).

**R7 · P1 · `concorrenti.md` r.7 e r.14, `sintesi-mercato.md` r.25: quote calcolate su unità diverse e posizionamento falso**
- Per Orarix usa 18.000 utenti, cioè dipendenti, mentre per gli altri conta i locali. Lo stesso documento riporta circa 2.300 locali per Orarix.
- Ricalcolato sui locali (totale 3.962): Orarix 58,1%, Planora 22,7%, Shiftella 8,8%, Turnio 10,4%.
- Turnio è terzo, non secondo: Planora ha 900 locali, più dei suoi 412.
- «Mercato concentrato al 91,5%» è falso.
- Correzione: rifare la tabella sui locali e scrivere «quota fra i quattro fornitori censiti», non «quota di mercato».

**R8 · P2 · `concorrenti.md` (metodo): il mercato servito manca dal quadro**
- I quattro fornitori insieme coprono circa il 7% del segmento (3.962 su 54.560 locali).
- Il vero concorrente è chi non usa un software: Excel, carta, WhatsApp. Mancano anche moduli turni dei software paghe e dei fornitori di cassa. Il sondaggio dice che il 21% conosce Turnio tramite il fornitore della cassa, quindi i fornitori di cassa sono un canale e insieme potenziali concorrenti.
- Correzione: aggiungere le alternative alla matrice e mostrare la quota di locali senza software.

**R9 · P2 · `concorrenti.md` r.3–9 e `fonti.md` r.11 (F5): fonti non tracciabili**
- Non ci sono URL, data di consultazione per ogni riga né il piano usato per il confronto dei prezzi.
- Il numero di clienti è dichiarato dai concorrenti e non verificato. Il dato di Orarix viene da un comunicato di settembre, non dal sito.
- Correzione: per ogni cella indicare URL, data e nome del piano. Marcare i clienti come «dichiarati, non verificati».

**R10 · P2 · `fonti.md` r.7–8: fonte superata e perimetro non chiaro**
- F1 (2019) è superata da F2: la sintesi dovrebbe citare solo F2.
- F1 include le gelaterie, il perimetro di F2 non è indicato e il segmento di Turnio (`README.md` r.3) è «ristoranti, bar e pasticcerie».
- Correzione: togliere F1 dal dimensionamento, oppure tenerla solo come serie storica. Verificare che il perimetro di F2 coincida con il segmento.

**R11 · P2 · `fonti.md` r.10 (F4): il sondaggio è trattato come fonte di mercato**
- Correzione: indicarlo come fonte interna, solo clienti, con incentivo e risposte al 18%.

**R12 · P3 · `sondaggio-2026.md` r.12–13: risparmio di tempo soggetto a errore di memoria**
- «4 ore prima, 1 ora dopo» lo hanno ricordato i clienti a posteriori.
- Correzione: dichiararlo come autovalutazione. Non usarlo come risparmio misurato.

**R13 · P3 · `sondaggio-2026.md` r.15: percentuale incompatibile con 74 risposte**
- Con 74 risposte, il 17% non è ottenibile: 12 risposte fanno 16,2%, 13 fanno 17,6%.
- Dalle altre voci il canale Instagram dovrebbe avere 13 risposte, cioè 18%.
- Le altre percentuali sono coerenti con 74 risposte e sommano a 100.
- Correzione: riportare i conteggi assoluti accanto alle percentuali.

## Dimensionamento corretto proposto

Sono stime, con assunzioni da confermare:

| Livello | Calcolo | Valore |
|---|---|---|
| TAM | 176.000 × 31% = 54.560 locali × 630 € l'anno | ≈ 34,4 M€ (≈ 38,6 M€ con il prezzo Pro) |
| SAM | × 60% Nord e Centro = 32.736 locali | ≈ 20,6 M€ (≈ 23,2 M€ con il prezzo Pro) |
| SOM | dal basso, con tre scenari | da costruire con vendite e crescita |

Ipotesi usate:
- il ricavo medio reale resta costante;
- la quota Nord e Centro è indipendente dalla dimensione del locale.

## Domande aperte

- Il perimetro di F2 coincide con il segmento ristoranti, bar e pasticcerie? Include le gelaterie?
- Il dato 2026 di F3 è una stima?
- Gli altri concorrenti dichiarano i clienti in locali o in utenti?
- C'è budget per un sondaggio sui non clienti? Serve l'ok dell'utente. Se si raccolgono dati personali va coinvolta la Privacy & Compliance Agency.
- Da `sintesi-mercato.md` dipendono anche altri documenti (`finanza/`, `vendite/`, `marketing/`, che non ho esaminato). Dopo la correzione vanno ricontrollati.

Le correzioni sono proposte. Spetta all'utente decidere quali applicare e se rivedere i documenti per gli investitori.

— PROCYON (AIBPD-02)
