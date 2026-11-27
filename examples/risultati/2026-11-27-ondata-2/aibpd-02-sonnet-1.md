AIBPD-02 · PROCYON — Senior Market Research Analyst, reparto AIBPD (AI Business & Product Development)

# Rapporto di revisione di `mercato/` (sola lettura)

Ho letto per intero i quattro file (`sintesi-mercato.md`, `fonti.md`, `sondaggio-2026.md`, `concorrenti.md`) e ricalcolato tutti i numeri. Non ho modificato nulla. Non ho potuto caricare AIBPD-01, perché in questa sessione non ho il tool `agent`. Le schede della biblioteca (prezzi, recesso, direttiva 2024/825) non riguardano questo compito e non le ho consultate. Non ho accesso al web, quindi i dati esterni non sono verificati alla fonte: li tratto come inventati per la prova, come dicono i file.

**Esito: l'analisi non è utilizzabile per il piano 2027 né per gli investitori nello stato attuale.** Due errori di calcolo (tasso di crescita, classifica) e due di metodo (TAM/SAM, sondaggio) ribaltano le conclusioni. Lavorando su un modello più piccolo (Sonnet), propongo il riesame dei rilievi P0 e P1 da parte del direttore AIBPD-01 o di un revisore su Opus prima che diventino definitivi.

## Rilievi

### 1. P0 · `sintesi-mercato.md` righe 9–11 (TAM, SAM, SOM): base dei locali obsoleta e non filtrata per segmento
- **Dato obsoleto.** Il TAM usa 198.000 locali da F1 (marzo 2019). F2 (giugno 2026) dice 176.000 (-11%). Per il dimensionamento vale il dato più recente.
- **Locali non indirizzabili.** Il TAM conta anche i locali senza dipendenti, che sono il 58% (F2). Un'app dei turni non serve a titolare e familiari. A riga 29 la sintesi stessa definisce il segmento come «3–40 dipendenti, 31%», ma il filtro non entra nei calcoli.
- **Prezzo.** I 99 €/mese del piano Plus non compaiono in nessuna fonte di `mercato/`. Il prezzo di riferimento nel sondaggio e in `concorrenti.md` è 59 € (Pro). Usare il piano più alto «perché i clienti vi crescono» gonfia il TAM. Il SOM poi presuppone che il 5% dei locali paghi Plus, mentre oggi i clienti sono su Pro.
- **Condizione sul 60%.** Il 60% al Nord e al Centro (F2) vale per i 176.000 locali, non per i 198.000. «Dove arriva il supporto» non è una nota di F2: va motivata o tolta.
- **SOM.** Il 5% a tre anni non ha alcuna base e il «circa 5.940 locali» è quattordici volte i 412 clienti attuali. Va presentato come ipotesi, con scenari.
- **Aritmetica.** I prodotti sono corretti: 198.000×99×12 = 235,2 M€; 118.800×99×12 = 141,1 M€; 5% = 7,06 M€ e 5.940 locali. Il problema è nelle basi, non nelle moltiplicazioni.
- **Correzione proposta.** Il segmento 3–40 dipendenti è 176.000×31% = 54.560 locali. Al Nord e al Centro, assumendo la distribuzione indipendente dal segmento (da dichiarare), sono 54.560×60% = 32.736.

| Livello | A 59 €/mese | A 99 €/mese |
|---|---|---|
| TAM (54.560 locali) | 38,6 M€ | 64,8 M€ |
| SAM (32.736 locali) | 23,2 M€ | 38,9 M€ |
| SOM al 5% del SAM (1.637 locali) | 1,16 M€ | 1,94 M€ |

  Proposta: mostrare il prezzo come intervallo con la sua fonte e il SOM con scenari (per esempio 2%, 5%, 8%) e le ipotesi dichiarate. Per confronto, i 412 clienti attuali sono circa l'1,3% del SAM corretto. Il segmento 3–40 è comunque più ampio della fascia 10–25 dipendenti su cui sono impostati i prezzi: va dichiarato.

### 2. P1 · `sintesi-mercato.md` riga 17: CAGR sbagliato e affermazione senza fonte
- Il calcolo corretto è (1,4/0,8)^(1/3) − 1 = 1,75^(1/3) − 1 ≈ **20,5% l'anno**, non 32%. Da 2023 a 2026 sono tre anni. Il 32% non corrisponde a nessun intervallo plausibile: il +75% totale non è un tasso annuo.
- «Il mercato dei turni segue lo stesso andamento» è un'ipotesi senza fonte. F3 misura la spesa in software gestionale in generale, non il segmento turni. Va riscritta come ipotesi oppure sostenuta con un dato specifico.
- Nota: la crescita 2023–2026 riguarda la spesa totale e non è una previsione.

### 3. P1 · `sintesi-mercato.md` riga 21 e `sondaggio-2026.md` righe 4–6, 14: il sondaggio non rappresenta il mercato
- La sintesi scrive «il 64% dei locali del mercato pagherebbe 59 € o più», ma il sondaggio è stato inviato solo ai 412 clienti attuali di Turnio. Chi paga già 59 € (Pro) non può dire meno di 59 € di quanto già paga: il campione è condizionato dal prezzo attuale. Non dice nulla sui non clienti.
- **Bias.** Ci sono più fonti di distorsione, nessuna dichiarata nei limiti:
  - autoselezione, con 74 risposte sul 18% dei destinatari;
  - un incentivo (buono Amazon da 10 €);
  - sopravvivenza, perché i clienti insoddisfatti sono già usciti;
  - una domanda ipotetica sulla disponibilità a pagare, che sovrastima rispetto al comportamento reale;
  - chi risponde dice quanto pagherebbe per «un'app dei turni», non quanto paga già.
- **Precisione.** Con n=74 l'intervallo al 95% su una quota del 64% è di circa ±11 punti (da circa 53% a 75%). Va riportato.
- **Fasce.** «30–59 €» e «59 € o più» si sovrappongono al valore 59. Vanno rese esclusive (per esempio 30–58 €, 59 € o più).
- **Correzione.** Riscrivere come «il 64% dei 74 clienti rispondenti dichiara disponibilità a pagare almeno 59 €» e togliere la conclusione «sostenibile per la maggior parte del mercato», oppure condurre un sondaggio su non clienti con un campione dichiarato. Le percentuali di ciascuna domanda sommano a 100 (verificato).
- **Note.** 74/412 = 17,96%, corretto. Le domande su canali di acquisizione e su problemi principali riguardano i soli clienti: non si possono generalizzare al mercato. Se le risposte contengono dati personali, serve coinvolgere Privacy & Compliance.

### 4. P1 · `concorrenti.md` righe 7 e 14: quote di mercato calcolate su unità diverse
- Orarix è espresso in utenti (dipendenti: 18.000), gli altri in locali. Sommarli (19.662) e calcolare le quote è un errore di metodo. Orarix dichiara circa 2.300 locali (riga 7), che è l'unità da usare per tutti, ed è un dato da verificare perché viene da un comunicato.
- **Quote ricalcolate sui locali.** Il totale è 2.300 + 900 + 350 + 412 = 3.962.
  - Orarix: 58,1%.
  - Planora: 22,7%.
  - Shiftella: 8,8%.
  - Turnio: 10,4%.
- Le quote «91,5 / 4,6 / 1,8 / 2,1%» sono quindi errate (le divisioni erano esatte, ma l'input no). Inoltre sono quote dei clienti dichiarati dei quattro concorrenti, non quote di mercato: il mercato è di 176.000 locali (o il segmento 3–40, circa 54.560), e i quattro coprono una minima parte. Vanno rinominate «quota sui clienti dichiarati dei quattro operatori» oppure calcolate sul mercato indirizzabile (3.962/54.560 ≈ 7,3%; Turnio ≈ 0,8%).
- I dati sono dichiarati dai concorrenti, non verificati: vanno etichettati come tali, con data e URL di ogni sito.

### 5. P1 · `sintesi-mercato.md` riga 25: conclusione sulla concorrenza errata
- «Turnio è secondo per numero di locali dopo Orarix, sopra Planora e Shiftella» è falso nei dati stessi. Planora ha 900 locali, Turnio 412 e Shiftella 350. L'ordine è Orarix (2.300), Planora (900), Turnio (412), Shiftella (350): Turnio è **terzo**, sopra solo Shiftella.
- «Mercato concentrato» non è dimostrato. Con le quote corrette (58/23/10/9%) fra i quattro operatori la concentrazione è moderata, e rispetto ai 176.000 locali la penetrazione complessiva è di pochi punti percentuali, quindi il mercato è poco penetrato e frammentato. Va riscritta la conclusione e, se serve, calcolato un indice (per esempio HHI) con le formule dichiarate.

### 6. P2 · `fonti.md`: copertura e tracciabilità delle fonti
- F1 (2019) è superata da F2 (2026) per lo stesso dato: va tolta dal calcolo o segnata come storica, con la variazione 198.000 → 176.000.
- Mancano fonti per: prezzo Plus 99 € (non compare in `concorrenti.md`), il «dove arriva il supporto», l'ipotesi SOM 5% (è un'ipotesi, non un dato), il comunicato Orarix di settembre 2026 e il «dal 2025» dell'app Orarix. F5 rimanda ai siti ma senza URL e data di accesso per riga.
- F4 è un sondaggio interno di parte (Turnio): va marcato come fonte primaria interna, con i limiti del rilievo 3.
- F3 misura «software gestionale» in generale: va dichiarato che non è il segmento turni.
- Manca una colonna con livello di affidabilità e limiti per ogni fonte, richiesta dalle regole del reparto. Manca anche la distinzione fra fatto, stima e ipotesi.

### 7. P2 · `concorrenti.md` riga 3 e tabella: confronto prezzi non omogeneo
- I prezzi sono «per un locale da 10–25 dipendenti», ma non si dice se siano a locale o a utente, né quali piani e funzioni contengano. Per Turnio è indicato solo Pro (59 €), mentre la sintesi usa Plus (99 €) senza riportarlo nella tabella. Aggiungere la riga del Plus e confrontare piani equivalenti, con l'URL e la data per ogni prezzo.
- «Scambio dei turni: in sviluppo» per Turnio è un dato interno, non da sito di concorrente: va dichiarato.

### 8. P3 · `sintesi-mercato.md` riga 29: segmento incoerente con il sondaggio
- Il segmento è «3–40 dipendenti (31%)», ma i prezzi e la domanda del sondaggio si riferiscono a 10–25. Dichiarare quale fascia è il target e quale quota del 31% vi ricade (dato assente in F2).

## Domande aperte
1. Il prezzo Plus da 99 € e la geografia del supporto: dove sono documentati?
2. I 2.300 locali di Orarix: esiste una fonte verificabile oltre al comunicato?
3. La quota del SOM (5%, tre anni) deriva da un'ipotesi di crescita commerciale del piano? In caso, va collegata ai KPI.
4. Esiste un dato sulla distribuzione dei 31% per area geografica, così da non assumere l'indipendenza?

## Decisioni che richiedono l'approvazione dell'utente
- Se rifare TAM/SAM/SOM con le basi corrette (rilievo 1) e come presentare il prezzo.
- Se condurre un sondaggio su non clienti (rilievo 3), con eventuale coinvolgimento di Privacy & Compliance.

Tutte le cifre corrette sono stime ricalcolate dai soli dati dei file, con le formule indicate sopra. Non sono dati verificati su fonti esterne e non sostituiscono la valutazione della direzione.

AIBPD-02 · PROCYON — Senior Market Research Analyst

File esaminati (cartella `aibpd-02-3`):
- `mercato/sintesi-mercato.md`
- `mercato/fonti.md`
- `mercato/sondaggio-2026.md`
- `mercato/concorrenti.md`
