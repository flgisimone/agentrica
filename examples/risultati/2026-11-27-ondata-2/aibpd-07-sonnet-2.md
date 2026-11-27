AIBPD-07 · MENKENT — Senior Growth & Monetization Manager, reparto AIBPD (AI Business & Product Development)

**Rapporto per AIBPD-01 · ALDERAMIN**

Ho letto `crescita/imbuto.md` e `crescita/prezzi.md` (non ci sono altri file) e ho riletto i calcoli, senza modificare nulla. Le schede della biblioteca che ho letto sono `riduzioni-di-prezzo` (art. 17-bis) e `funzione-di-recesso` (art. 54-bis). Entrambe sono verificate il 2026-11-19 sul Codice del consumo (Normattiva), con ricontrollo entro il 2027-05-19. In `crescita/` non c'è un cliente-consumatore: gli obblighi dei due articoli vanno confermati dalla revisione legale umana (vedi rilievo 10).

**Esito:** le aritmetiche semplici tornano, ma l'esperimento non è significativo, due proposte su tre poggiano su basi sbagliate e MRR e costo del referral sono calcolati male. Nessun P0.

**Verifiche che tornano**
- Imbuto: 1.500/37.500 = 4,0%, 900/1.500 = 60,0%, 180/900 = 20,0%.
- Canali: 100 + 14 + 40 + 26 = 180 clienti, uguale ai paganti dell'imbuto. CAC di Google Ads 9.500/100 = 95 € e di Instagram 2.100/14 = 150 €.
- Prezzi: 5.510 + 10.030 + 5.148 + 942 = 21.630 € (190×29, 170×59, 52×99, 471 dipendenti oltre soglia × 2 €).
- Esperimento: 35/412 = 8,5% e 41/405 = 10,1%; il +19% relativo è corretto come aritmetica.

**Rilievi**

1. **P1 · `imbuto.md`, riga 25: la differenza dell'esperimento non è significativa, ed è stato fermato guardando i dati ogni giorno.**
   - Test z a due proporzioni su 35/412 contro 41/405: differenza 1,6 punti, errore standard circa 2,0 punti, z ≈ 0,8, p ≈ 0,42. L'intervallo di confidenza al 95% include lo zero e arriva a circa −2,3/+5,5 punti.
   - Controllare ogni mattina e fermarsi al "primo significativo" gonfia i falsi positivi (peeking). Qui il risultato non era nemmeno significativo.
   - Il test è durato 6 giorni, quindi non copre un ciclo settimanale completo.
   - La metrica è "prove avviate" (35 contro 41, cioè 6 prove di differenza) e non i pagamenti.
   - Correzione: ritirare la decisione "B diventa la pagina dei prezzi" e rilanciare il test.
     - Fissare prima la dimensione del campione: per rilevare 8,5% → 10,1% con potenza 80% servono circa 5.000 visite per variante (regola pratica, da rifare con un calcolatore dedicato).
     - Durata di almeno due settimane intere, senza fermarsi prima.
     - Metrica primaria: prove attivate o pagamenti.
     - Se si vuole controllare in corso d'opera, usare un metodo sequenziale.

2. **P1 · `imbuto.md`, riga 14: la conversione "prova → pagamento 20%" è calcolata sul denominatore sbagliato.**
   - 180/900 conta solo le prove attivate. Dalle prove avviate la conversione è 180/1.500 = 12,0%, sotto il 15% di riferimento, non sopra.
   - Il confronto "sopra la media del settore (15%)" non ha fonte né data (regola comune: citare fonte e data dei dati esterni) e non dice a quale denominatore si riferisca.
   - Correzione: indicare entrambe le conversioni (12,0% dalle prove avviate, 20,0% dalle attivate), citare la fonte del 15% e confrontare grandezze omogenee. L'obiettivo 2027 del 25% va riscritto con lo stesso denominatore.
   - I 180 paganti coprono anche prove avviate prima di novembre 2025 e prove ancora aperte a ottobre 2026. Serve un'analisi per coorte di avvio, perché il periodo è di 12 mesi e la prova dura 30 giorni.

3. **P1 · `imbuto.md`, riga 36: la proposta di spostare metà del budget di Google Ads su Instagram regge su dati insufficienti.**
   - L'LTV di Instagram (640 €) è una stima dai primi tre mesi (da agosto) su 14 clienti, ed è dichiarata "a 12 mesi" quando nessun cliente ha ancora 12 mesi di vita.
   - Con quei numeri Instagram rende meno per euro speso: LTV/CAC è 640/150 ≈ 4,3 contro 520/95 ≈ 5,5 di Google.
   - Il CAC medio non è marginale. Spostare 4.750 € a 150 € di CAC darebbe circa 32 clienti, contro i circa 50 che darebbero a 95 € su Google (a CAC costante).
   - Non è chiaro se l'LTV sia calcolato su ricavi o su margine, né quale formula (durata, abbandoni, sconti).
   - Correzione: non spostare il budget ora. Fare un test piccolo e a tempo su Instagram, calcolare l'LTV su margine con la formula esplicita e un intervallo, e riesaminare con almeno 6 o più mesi di coorte e un campione maggiore di 14.

4. **P1 · `imbuto.md`, riga 34, canale Referral: il costo non è zero.**
   - Il referral regala un mese a chi invita e a uno a chi è invitato, quindi per i 40 clienti acquisiti ci sono fino a 80 mesi non incassati. A prezzo Pro (59 €) sono circa 4.700 €, cioè un CAC implicito fino a circa 118 € (da calcolare sul piano e sul mese realmente regalato).
   - Anche i "Fornitori della cassa" a 0 € vanno verificati: commissioni, costi di integrazione e tempo di supporto non sono nel CAC.
   - La proposta "raddoppiare il referral, che non costa nulla" va riscritta con il costo reale. Correzione: calcolare il costo per cliente acquisito includendo i mesi gratuiti e rifare il confronto con gli altri canali.

5. **P1 · `prezzi.md`, righe 16-18: l'annuale non fa crescere i ricavi del 20%.**
   - L'annuale è 10 mesi pagati su 12 (sconto del 16,7%). Più clienti annuali anticipano la cassa ma riducono i ricavi per cliente.
   - Portare gli annuali dal 22% al 60% (+38 punti) a parità di clienti riduce i ricavi ricorrenti di circa il 6% (38% × 16,7%), non li aumenta del 20%. Il guadagno è solo di cassa anticipata, una tantum.
   - Il beneficio reale, una churn più bassa, non è quantificato. Il 60% non ha evidenze di fattibilità.
   - Correzione: riformulare l'obiettivo come "cassa e retention", stimare scenari con formule esplicite (churn mensile contro annuale, cassa anticipata, sconto), e testare l'offerta prima di fissare il 60%.

6. **P2 · `prezzi.md`, riga 14: l'MRR al listino è sovrastimato.**
   - 21.630 € vale solo se tutti pagano il listino mensile. Con il 22% di annuali, che versano 10/12, l'MRR equivalente scende a circa 20.836 € (−794 €, −3,7%), assumendo la stessa quota di annuali in tutti i piani.
   - Correzione: distinguere MRR da fatturato al listino e calcolare l'MRR con i dati reali (piano, ciclo di fatturazione, eventuali mesi gratis del referral).

7. **P2 · `prezzi.md` contro `imbuto.md`: base di clienti e acquisizioni non riconciliate.**
   - Il mix al 31 ottobre conta 412 locali paganti (190 + 170 + 52); l'imbuto di 12 mesi ne conta 180 nuovi. La differenza, circa 230 locali, è la base già esistente (o clienti con più locali), ma il testo non lo dice.
   - Questo rende non verificabili sia l'MRR sia la quota del 22% di annuali.
   - Correzione: aggiungere una riga di riconciliazione (base iniziale, nuovi, abbandoni, base finale) e dichiarare se l'unità è cliente o locale.

8. **P2 · `prezzi.md`, riga 8: Pro include "scambio dei turni (dal 2027)".**
   - Il prezzo di 59 € comprende una funzione che oggi non esiste, e non c'è una data né un impegno.
   - Correzione: toglierla dal piano finché non è rilasciata, oppure etichettarla chiaramente "in arrivo" nella pagina dei prezzi.

9. **P3 · `prezzi.md`, struttura dei prezzi: le soglie dipendenti dei piani contano poco.**
   - Con 2 € per dipendente oltre soglia su tutti i piani, Base con 25 dipendenti costa 29 + 30 = 59 €, cioè quanto Pro. Pro con 40 dipendenti costa 59 + 30 = 89 €, cioè 10 € meno di Plus. I piani si distinguono quasi solo per le funzioni.
   - Il confine Pro/Plus diventa 99 € contro 59 + 2 × (n − 25), con parità a n = 45.
   - Correzione: verificare con i dati reali quanti clienti sono oltre soglia (471 dipendenti in eccesso) e valutare soglie o supplementi diversi per piano, da testare prima di toccare i prezzi.

10. **P3 · Aspetti normativi di promozioni e recesso.**
    - "Due mesi gratis" e il mese gratis del referral sono promozioni sul prezzo. L'art. 17-bis riguarda gli annunci di riduzione di prezzo ai consumatori, e il prezzo precedente è il più basso dei trenta giorni prima.
    - L'art. 54-bis prevede una funzione di recesso online per i contratti conclusi dopo il 19 giugno 2026 con i consumatori.
    - I clienti qui sono locali (professionisti), quindi probabilmente i due articoli non si applicano. Non è una conclusione legale: se la vendita raggiunge anche ditte individuali senza partita IVA o consumatori, serve la revisione legale umana.
    - In ogni caso la prova senza carta e la sospensione a fine prova non devono nascondere la disdetta.

**Domande aperte**
- Qual è la formula e l'unità dell'LTV (ricavi o margine, durata, abbandoni)?
- Quanti dipendenti hanno in media i clienti per piano?
- Qual è la fonte del benchmark del 15%?
- Quanti clienti hanno più di un locale?
- Chi sono i clienti: solo professionisti o anche consumatori?

**Approvazioni richieste:** l'utente deve confermare di ritirare la decisione "B diventa la pagina dei prezzi", di non spostare budget su Instagram finora, e di non lanciare la campagna annuale del 60%. Non ho modificato prezzi, budget o comunicazioni.

**Nota di affidabilità:** lavoro su un modello più piccolo di quello della sessione. I rilievi P1 (soprattutto il test di significatività, il calcolo del referral e l'effetto dell'annuale) meritano un riesame del direttore o di un revisore su Opus prima di diventare definitivi.

— AIBPD-07 · MENKENT
