AIBPD-12 · DENEBOLA — Senior Product Portfolio & Roadmap Manager, reparto AIBPD (AI Business & Product Development)

Per AIBPD-01 · ALDERAMIN. Non ho potuto caricare il direttore: in questa sessione non ho il tool `agent`. Ho lavorato in sola lettura e non ho modificato nessun file. Ho letto tutti i documenti in `aibpd-12-2/`. Non ho consultato la biblioteca: le schede disponibili (riduzioni di prezzo, recesso online, direttiva 2024/825) riguardano i consumatori e non toccano questo compito.

## Esito

La roadmap 2027 non si può eseguire così com'è:
- in Q1 due squadre su tre hanno più lavoro delle settimane disponibili;
- l'iniziativa P0 dipende da un'iniziativa che arriva un trimestre dopo;
- un contratto in firma a dicembre promette un'API che la roadmap rilascia in Q3;
- due decisioni di portafoglio (dismissione di Kiosk e Paghe Light «Investire») sono già prese senza le basi necessarie.

C'è un **P0 da portare subito all'utente**: l'accordo Cassa Facile (rilievo 1), da firmare a dicembre.

## Rilievi

**1. P0 · L'impegno con il partner non è compatibile con la roadmap**
- Evidenza: `partner/accordi.md:16` dice «API pubblica da gennaio 2027». `roadmap/roadmap.md:29` mette l'API pubblica in Q3 (squadra B), e B in Q1 è già oltre la capacità (rilievo 3).
- Il contratto è irrevocabile per 10 anni (`accordi.md:17`, 5+5 senza recesso). Ha un'esclusiva nazionale sul canale cassa (`:12`), che oggi porta 26 clienti a CAC 0 (`crescita/imbuto.md:34`) e il 21% delle scoperte (`mercato/sondaggio-2026.md:15`). Riconosce come portati dal partner tutti i clienti dell'Emilia-Romagna, da qualunque canale arrivino (`:15`). Il compenso si calcola sull'importo IVA compresa (`:14`).
- Correzione: non firmare il testo attuale. Prima si allinea la data dell'API a una data che la roadmap regge: Q3, oppure si anticipa l'API spostando altro da B. Va poi rinegoziato il resto: esclusiva, recesso, clienti riconosciuti solo se portati dal partner, compenso sull'imponibile. La revisione va a biz-business-development e a un legale umano. Decide l'utente.

**2. P1 · Dipendenza invertita sull'iniziativa P0**
- Evidenza: `roadmap.md:25` mette lo Scambio dei turni in Q2 (P0) con dipendenza «App dipendenti 2.0». `roadmap.md:28` mette l'App dipendenti 2.0 in Q3, con priorità P3.
- Il PRD richiede le notifiche push (`prodotto/prd-scambio-turni.md:31`, R5) ma le mette fuori perimetro perché «arrivano con l'App 2.0» (`:43`).
- Correzione, a scelta:
  - (a) anticipare l'App 2.0, o almeno le notifiche push, a Q1 o Q2 sulla squadra C, al posto di WhatsApp e del tema scuro, e alzarla a P1;
  - (b) togliere R5 dal PRD e lanciare lo scambio senza notifiche push.
- La causa più citata negli abbandoni è «i dipendenti non usano l'app», al 41% (`clienti/fidelizzazione.md:35`). Per questo l'App 2.0 è la leva principale di O1 e il P3 non è coerente.

**3. P1 · Capacità superata in Q1, nessuna riserva**
- Evidenza: `roadmap.md:13` dà 13 settimane per squadra per trimestre, senza riserva per i bug.
- Squadra A in Q1: 14 + 6 = 20 settimane, 7 in più (`:19-20`). La sola prima parte di Paghe Light (14) supera già il trimestre.
- Squadra B in Q1: 6 + 8 = 14 settimane, 1 in più (`:21-22`).
- Squadra C in Q1: 9 + 4 = 13 settimane, cioè il 100% (`:23-24`).
- Correzione: tenere il 15–20% di riserva, circa 2 settimane per squadra per trimestre. Spostare il Report del costo del lavoro a Q2 o oltre. Togliere il tema scuro (rilievo 8). Ricalcolare Paghe Light (rilievo 4).

**4. P1 · Paghe Light: decisione presa prima dell'approvazione e lavoro non pianificato**
- Evidenza:
  - `roadmap/portafoglio.md:7` dice «Business case in approvazione» e, nella stessa riga, «Investire nel 2027». La roadmap la mette in Q1 (`roadmap.md:19`).
  - Il business case stima 6 mesi e mezzo della squadra A, circa 28 settimane (`finanza/business-case.md:21`). La roadmap pianifica solo la «prima parte» da 14 settimane. La seconda parte non c'è, e A è occupata in Q2 e Q3.
  - Il business case stesso ha errori:
    - i costi sommano 160.000 €, non 140.000 (`:21-24`);
    - i ricavi sono calcolati IVA inclusa, a 18,30 € invece di 15 € (`:20`);
    - l'LTV usa il prezzo invece del margine: 15 × 70% / 1% = 1.050 €, quindi LTV/CAC circa 5,8 e recupero del CAC in circa 17 mesi, non 8 (`:31-33`);
    - mette 600 clienti a fine 2027 (`:10`), contro i 520 dell'obiettivo O2 (`roadmap.md:8`).
  - Il risultato corretto del 2027 è circa −122.000 €, non −93.884 €.
- Rischio di portafoglio: il modulo serve a «non passare dal consulente» (`innovazione/concetti.md:16`). I consulenti sono però il primo canale di scoperta, al 38% (`sondaggio-2026.md:15`). L'affermazione «nessun rischio rilevante» (`concetti.md:19`) ignora anche gli obblighi normativi sui cedolini.
- Correzione: in `portafoglio.md:7` scrivere «In valutazione» fino all'approvazione dell'utente. Correggere il business case (biz-business-financial-analyst). Pianificare l'intera stima, o tenerla fuori dal 2027. Valutare la reazione del canale consulenti.

**5. P1 · Dismissione di Kiosk senza piano di migrazione**
- Evidenza: `portafoglio.md:6` fissa la dismissione al 31 dicembre 2026, fra 41 giorni. Riguarda 61 locali, il 15% della base. La «nuova timbratura» arriva solo con l'App 2.0 in Q3 (`roadmap.md:28`).
- L'obiettivo O1 chiede un abbandono sotto il 20% (`roadmap.md:7`). Il guadagno è di circa 2 settimane a trimestre della squadra C (`portafoglio.md:12`), ma la roadmap di C in Q1 non le usa: è già al 100%.
- Il «basso margine» non è quantificato.
- Correzione: rimandare la dismissione a dopo il rilascio della nuova timbratura, o prevedere prima un piano di migrazione e il ritiro dei tablet in comodato. Serve un dato sul margine di Kiosk.

**6. P1 · Il lancio commerciale arriva prima del prodotto**
- Evidenza: `marketing/lancio.md:6` lancia lo scambio dei turni dal 1° febbraio 2027. Lo sviluppo è in Q2 (`roadmap.md:25`). Il PRD dice «in sviluppo da gennaio 2027 (squadra A)» (`prd-scambio-turni.md:4`), ma A in Q1 è su Paghe Light.
- Correzione: allineare le tre date. Il lancio va dopo il rilascio, quindi non prima della fine di Q2 o di Q3 (rilievo 2). Lo stato del PRD va corretto.

**7. P2 · Doppioni sulle ore per il consulente**
- Evidenza: tre iniziative risolvono lo stesso problema, il 19% del sondaggio:
  - Esportazione delle presenze in CSV per il consulente, Q1 B (`roadmap.md:21`);
  - Integrazione con il consulente del lavoro, Q2 B (`:26`);
  - Paghe Light, che invece elimina il consulente (`:19`).
- L'esportazione per il consulente è già nel piano Pro (`crescita/prezzi.md:8`). Il Report del costo del lavoro (`roadmap.md:20`) è già nel piano Plus (`prezzi.md:9`).
- Correzione: unire CSV e integrazione in un'unica iniziativa di B. Chiarire se il report e l'esportazione sono nuove versioni o doppioni di funzioni esistenti. Scegliere una sola strategia sul consulente (integrarlo o sostituirlo).

**8. P2 · Priorità senza criteri e senza obiettivo**
- Evidenza:
  - il Tema scuro è P1 senza obiettivo (`roadmap.md:24`);
  - l'App 2.0 è P3 ma blocca il P0 (`:28`);
  - P0 è usato come priorità di un'iniziativa, mentre la scala lo riserva ai blocchi da fermare subito;
  - nessuna riga ha un punteggio esplicito.
- Correzione: mettere il tema scuro a P3 o toglierlo dal 2027. Introdurre un punteggio trasparente (impatto sull'obiettivo, impegno, confidenza, dipendenze) in una colonna della roadmap.

**9. P2 · L'iniziativa legata a O3 lo peggiora**
- Evidenza: la Fatturazione annuale automatica è P1 su O3 (`roadmap.md:22`). Serve la proposta di portare gli annuali al 60% (`prezzi.md:18`). L'annuale costa però 10 mesi su 12, cioè −16,7% di ricavo per locale. La crescita «del 20%» confonde incasso e ricavo, che il business case stesso riconosce mese per mese (`business-case.md:27`).
- Anche l'accordo con l'associazione va contro O3: 40% di sconto a vita più 30% di compenso, quindi a Turnio resta il 30% del listino (`accordi.md:26-27`).
- Correzione: togliere O3 dalla riga, o motivare la fatturazione con la ritenzione (O1). Valutare l'accordo con l'associazione sul margine per socio prima della firma.

**10. P2 · Obiettivi non misurati in modo coerente**
- Evidenza: l'abbandono del 23,8% è calcolato sui clienti di fine periodo (`fidelizzazione.md:14`). Sui 330 clienti iniziali è 98/330 = 29,7%, quindi il divario da O1 è circa 10 punti, non 4.
- Le iniziative per O2 (più sedi e API) arrivano in Q3. Il posizionamento punta già su catene e gruppi (`marketing/posizionamento.md:5`), mentre la gestione di più sedi non c'è prima di Q3 (`roadmap.md:30`).
- Il PRD non misura né l'abbandono né le assenze coperte, cioè il suo stesso obiettivo (`prd:9` contro `:18-21`).
- Correzione: ricalcolare la base di O1. Dichiarare la base ARPU del 2026: 21.630 / 412 = 52,50 €. Allineare posizionamento e data della gestione di più sedi. Aggiungere al PRD una metrica legata a O1.

**11. P2 · Matrice dei concetti sbagliata**
- Evidenza: in `innovazione/concetti.md:36` il concetto C vale 5×0,4 + 2×0,3 + 3×0,3 = 3,5, non 4,4. C è quindi l'ultimo, e la proposta «dopo A investire su C» (`:38`) cade.
- C non ha una soglia di validazione: «interesse positivo» (`:26`). Il fatto che Turnio assuma lavoratori richiede una verifica legale.
- Correzione: correggere il totale e lasciare C fuori dalla roadmap 2027 finché non ha un criterio di validazione misurabile. `portafoglio.md:8` («da valutare») può restare.

**12. P3 · Doppione sulle notifiche**
- Evidenza: le Notifiche dei turni su WhatsApp (Q1 C, `roadmap.md:23`) e le notifiche push dell'App 2.0 (`:28`) sono due canali di notifica fatti in due momenti. L'obiettivo O2 assegnato a WhatsApp è debole.
- Correzione: un'unica iniziativa «notifiche», dentro l'App 2.0 e anticipata (rilievo 2).

## Proposta di riequilibrio, da confermare

- **Squadra A**:
  - Q1: Scambio dei turni, l'unico concetto validato, più riserva;
  - Q2: Analisi delle più sedi o il Report del costo del lavoro;
  - Q3: Gestione di più sedi.
  - Paghe Light solo dopo l'approvazione del business case corretto.
- **Squadra B**:
  - Q1: Esportazione per il consulente unificata, più la fatturazione annuale;
  - Q2: API pubblica, se l'accordo con Cassa Facile la richiede presto.
- **Squadra C**:
  - Q1–Q2: App dipendenti 2.0, con notifiche push e nuova timbratura;
  - poi la dismissione di Kiosk;
  - il tema scuro va nel backlog.
- **Tutte le squadre**: 2 settimane di riserva per trimestre.

## Domande aperte per l'utente

1. L'accordo con Cassa Facile si firma a dicembre così com'è? Va bloccato (P0).
2. Paghe Light è approvata o in valutazione? Chi approva il business case corretto?
3. Si accetta di spostare la dismissione di Kiosk?
4. Il target 2027 sono i singoli locali da 3–40 dipendenti (README) o le catene (posizionamento)?
5. Quanto vale oggi il margine di Kiosk?

Ogni punto qui sopra è una raccomandazione, non una decisione: le scelte restano all'utente. Servono passaggi di consegne a:
- biz-business-financial-analyst, per il business case e il margine di Kiosk;
- biz-business-development-manager, per gli accordi;
- biz-product-manager, per il PRD.

Firmato: DENEBOLA (AIBPD-12)
