AIBPD-02 · PROCYON — Senior Market Research Analyst, reparto AIBPD (AI Business & Product Development)

Nota di processo: non avevo il tool `agent`, quindi non ho caricato AIBPD-01 · ALDERAMIN. Consegno direttamente a chi mi ha incaricato. Ho lavorato in sola lettura su /private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-02-2 e non ho modificato nessun file. Ho rifatto i calcoli con python3. Non ho usato il web: le fonti sono dichiarate inventate (README.md:5), quindi non si possono verificare all'esterno. Le schede della biblioteca (riduzioni di prezzo, recesso, direttiva 2024/825) non riguardano questo compito e non le ho lette.

## Esito
L'analisi non regge così com'è e non va portata agli investitori. L'aritmetica delle singole moltiplicazioni è giusta, ma il metodo e le fonti sono sbagliati in quasi tutti i punti:
- TAM e SAM sono gonfiati di circa 6–11 volte;
- il CAGR è sbagliato (32% invece di 20,5%);
- le quote di mercato confrontano dipendenti con locali;
- la disponibilità a pagare viene estesa al mercato partendo da un campione di soli clienti;
- c'è un'affermazione falsa sulla posizione di Turnio.

## Rilievi

**R1 · P1 · Base del TAM vecchia e sbagliata** (mercato/sintesi-mercato.md:9; mercato/fonti.md:7-8)
- Il TAM usa F1 (marzo 2019, 198.000 locali), che è superata da F2 (giugno 2026, 176.000).
- Include anche il 58% di locali senza dipendenti, che un'app dei turni non la usano.
- Correzione: usare F2 e togliere i locali senza dipendenti. Dichiarare l'anno di riferimento.

**R2 · P1 · Prezzo del TAM e del SAM** (sintesi-mercato.md:9-10, 13)
- Si applica a tutti i locali il prezzo di Plus (99 €). Plus però ha solo 52 locali su 412, cioè il 13% (crescita/prezzi.md:14).
- La frase «è quello verso cui crescono i clienti» non ha nessuna evidenza.
- Correzione: usare l'ARPU reale, 21.630 / 412 = 52,5 €/mese (630 €/anno), oppure un intervallo da 52,5 a 99 € con scenari espliciti.

**R3 · P1 · Il SAM non applica il segmento e mescola le fonti** (sintesi-mercato.md:10 e 29)
- Il 60% Nord/Centro, che viene da F2 2026, è applicato alla base F1 2019.
- Manca il filtro 3–40 dipendenti (31%), anche se la sezione «Segmento» lo dichiara.
- Correzione: 176.000 × 31% × 60% ≈ 32.736 locali. Questo presuppone che taglia e area siano indipendenti, un'assunzione da dichiarare o sostituire con il dato incrociato. Il SAM diventa circa 20,6 M€/anno con l'ARPU reale, o 38,9 M€ con 99 €, invece di 141,1 M€.

**R4 · P1 · SOM senza motivazione** (sintesi-mercato.md:11)
- Il 5% è fissato a priori, e 5.940 locali significano passare da 412 a 14 volte tanto in tre anni, senza un legame con la capacità commerciale (3 venditori, README.md:9).
- I conti sono giusti (7,06 M€; 5.940 locali), ma la base è quella di R3.
- Correzione: un SOM dal basso (nuovi clienti per venditore e per canale, churn, conversione dalla prova), confrontato con il 5% del SAM corretto: circa 1.637 locali, circa 1,0 M€ con l'ARPU reale.

**R5 · P1 · CAGR sbagliato** (sintesi-mercato.md:17)
- Si va da 0,8 a 1,4 miliardi tra il 2023 e il 2026, cioè 3 anni: (1,4/0,8)^(1/3) − 1 = 20,5%. Il 32% viene dall'aver contato 2 periodi.
- «Il mercato dei turni segue lo stesso andamento» è un'ipotesi: il software gestionale in generale è solo un indicatore indiretto.
- Correzione: scrivere 20,5% e marcare l'estensione al mercato dei turni come ipotesi da verificare.

**R6 · P1 · Disponibilità a pagare estesa al mercato** (sintesi-mercato.md:21; sondaggio-2026.md:4-5, 14)
- Il campione è fatto solo di clienti attuali, che hanno già scelto di pagare Turnio.
- Ha risposto il 18% (74/412, conto giusto), con un buono da 10 €: c'è un forte effetto di autoselezione.
- La domanda è ipotetica e le fasce si sovrappongono: «30–59 €» e «59 € o più» contengono entrambe 59 €.
- Il 64% non si può estendere ai «locali del mercato».
- Correzione: riformulare come «il 64% dei 74 clienti che hanno risposto», con un intervallo di confidenza. Usare fasce che non si sovrappongono (es. <30, 30–58, ≥59) e un campione di non clienti (Van Westendorp o Gabor-Granger).

**R7 · P1 · Quote di mercato con unità diverse** (concorrenti.md:7, 14; sintesi-mercato.md:25)
- Per Orarix si sommano 18.000 utenti, che sono dipendenti, mentre per gli altri si contano locali. Le percentuali sono calcolate bene, ma la base è sbagliata.
- Con i 2.300 locali del comunicato di Orarix il totale è 3.962 locali: Orarix 58,1%, Planora 22,7%, Shiftella 8,8%, Turnio 10,4%.
- Correzione: inoltre chiamarla «quota fra i quattro fornitori censiti», non quota di mercato. Questi fornitori coprono circa il 12% del SAM corretto, e mancano le alternative (Excel, WhatsApp, carta, i moduli turni dei gestionali di cassa).

**R8 · P1 · Affermazione falsa sulla posizione** (sintesi-mercato.md:25)
- «Turnio è secondo… sopra Planora» è falso: Planora ha 900 locali, Turnio 412. Turnio è terzo, sopra Shiftella soltanto.
- Correzione: «terzo dei quattro censiti».

**R9 · P2 · Fonti incomplete** (fonti.md:7-11; concorrenti.md:3)
- F1 è ancora citata pur essendo superata.
- F5 non ha URL, data di consultazione per ogni concorrente né data delle dichiarazioni (per Planora e Shiftella non si sa a quando si riferiscono).
- I clienti dichiarati sono autodichiarazioni non verificate.
- F3 (software gestionale) non è indicata come indicatore indiretto.
- F4 non riporta metodo né limiti.
- Correzione: aggiungere per ogni fonte URL, data di accesso e affidabilità, togliere F1 e aggiungere a F4 metodo, campione e limiti.

**R10 · P2 · Prezzi dei concorrenti non confrontabili** (concorrenti.md:3-10)
- Non c'è il piano dei concorrenti a cui si riferisce il prezzo, né il prezzo oltre la soglia di dipendenti né le funzioni incluse.
- Pro di Turnio copre fino a 25 dipendenti e include lo scambio dei turni solo dal 2027 (prezzi.md:8).
- Correzione: confrontare per una taglia fissa (es. 15 e 25 dipendenti), con piano, costo totale mensile e funzioni.

**R11 · P3 · Altri limiti del sondaggio** (sondaggio-2026.md:12-13)
- Le ore «prima di Turnio» sono ricordate a posteriori (effetto memoria) e non c'è la dimensione dei locali che hanno risposto.
- Correzione: indicarlo fra i limiti e raccogliere la taglia del locale.

## Effetti su altri documenti (fuori dal perimetro, da girare)
- marketing/posizionamento.md:9 e 19 dicono che Orarix non ha l'app per i dipendenti. È in contrasto con concorrenti.md:7 («Sì, dal 2025»): è un messaggio comparativo non vero.
- finanza/business-case.md:11 basa l'adozione sul 58% del sondaggio, che ha i limiti di R6.
- innovazione/concetti.md:7 presenta il 46% come «primo problema dei locali», ma vale solo per i clienti che hanno risposto.

## Domande aperte
- clienti/fidelizzazione.md:31 parla di un sondaggio di settembre a 268 clienti con 74 risposte. Quello di ottobre (sondaggio-2026.md) è a 412 clienti, sempre con 74 risposte. Sono due sondaggi o lo stesso, descritto in modo diverso?
- Esiste in F2 il dato incrociato taglia × area, per non dover presumere che siano indipendenti?
- A che data si riferiscono i clienti dichiarati da Planora e Shiftella?
- Nota privacy: il sondaggio è stato inviato per email ai clienti con un incentivo. Se nelle prossime ondate si raccolgono dati personali, va coinvolta la Privacy & Compliance Agency.

Tutto quello che sopra è una correzione resta una proposta: i numeri corretti valgono solo con le assunzioni dichiarate e vanno confermati dall'utente prima di usarli nel piano 2027 o con gli investitori.

— AIBPD-02 · PROCYON
