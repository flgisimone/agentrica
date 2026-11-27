**AIBPD-12 · DENEBOLA — Senior Product Portfolio & Roadmap Manager, reparto AIBPD (AI Business & Product Development)**

# Rapporto per AIBPD-01 · ALDERAMIN: revisione della roadmap e del portafoglio 2027

La revisione è in sola lettura e non ho modificato né contattato nulla. Ho letto `roadmap/` e, per il confronto, tutti gli altri documenti del progetto Turnio. Dei documenti di business Turnio non ho letto `mercato/` né `pipeline.csv`/`coorti.csv`, perché non servivano a questo compito. Le schede della biblioteca (riduzioni di prezzo, recesso online, direttiva 2024/825) non toccano il compito: i clienti sono imprese e i prezzi sono IVA esclusa.

Lavoro su un modello più piccolo della sessione. I rilievi P0 e P1 vanno riesaminati dal direttore o da un revisore su Opus prima di diventare definitivi.

## Sintesi

- La roadmap non regge la capacità. Il Q1 pianifica 47 settimane contro 39 disponibili, e il Q2 ne ha 15 libere.
- La dipendenza della priorità massima è invertita. Lo scambio dei turni (P0) è in Q2 ma dipende dall'App dipendenti 2.0 (P3), che è in Q3.
- La roadmap contraddice altri documenti su tre punti: le date del PRD e del piano di lancio, l'API promessa a Cassa Facile e la scelta del concetto C.
- Diverse cifre su cui poggia il portafoglio non tornano: la matrice dei concetti, il business case di Paghe Light e il tasso di abbandono di partenza di O1.

## Rilievi

**R1 · P0 · Dipendenza invertita sullo scambio dei turni**
- Evidenza: `roadmap/roadmap.md:25` (scambio in Q2, P0, dipende da «App dipendenti 2.0») e `:28` (App 2.0 in Q3, P3).
- Il PRD, `prodotto/prd-scambio-turni.md:43`, mette le notifiche push fuori perimetro «perché arrivano con l'App 2.0». Ma il requisito R5 (`:31`) le richiede.
- Il PRD dice anche «in sviluppo da gennaio 2027» (`:4`), e `marketing/lancio.md:6` lancia la campagna il 1° febbraio 2027. Con la roadmap, lo scambio non esce prima del Q3.
- La priorità non segue la causa. Il motivo principale di abbandono è «i dipendenti non usano l'app» (41%) e solo il 22% dei dipendenti usa l'app ogni settimana (`clienti/fidelizzazione.md:35-37`). Eppure l'iniziativa che risolve questo problema è P3.
- Correzione proposta:
  - App 2.0 passa a P0 o P1 e va in Q1 sulla squadra C. Si liberano le 12 settimane togliendo WhatsApp e tema scuro (R4 e R5).
  - Lo scambio resta in Q2, dopo l'App 2.0.
  - La campagna del 1° febbraio si sposta al rilascio.
  - Si corregge il PRD: o R5 esce dal perimetro dichiarato, o la dipendenza viene indicata nel PRD stesso.
- Decisione: all'utente.

**R2 · P1 · Capacità del Q1 superata**
- Evidenza: `roadmap/roadmap.md:13` e `:19-24`.

| Squadra | Settimane pianificate in Q1 | Disponibili |
|---|---|---|
| A | 20 (14 Paghe Light + 6 Report) | 13 |
| B | 14 (6 CSV + 8 Fatturazione) | 13 |
| C | 13 (9 WhatsApp + 4 Tema scuro) | 13, a saturazione, senza riserva |
| Totale | 47 | 39, cioè il 121% |

- Paghe Light «prima parte» da sola (14 settimane) supera le 13 di un trimestre.
- Q2 usa 24 settimane su 39 e Q3 ne usa 34. Il carico è sbilanciato.
- Il documento stesso dice «senza riserva per i bug» (`:13`).
- Q4 è vuoto («Da definire»), ma gli obiettivi O1, O2 e O3 si misurano a fine 2027.
- Correzione proposta:
  - Rispettare il tetto di 13 settimane per squadra e trimestre, con una riserva per i bug (per esempio il 15%, cioè circa 2 settimane).
  - Spostare in Q2 ciò che sfora.
  - Dare un contenuto, anche provvisorio, al Q4.

**R3 · P1 · Paghe Light: mancano 12 settimane e il sì non c'è ancora**
- Il business case (`finanza/business-case.md:23`) conta 6,5 mesi della squadra A, cioè circa 26 settimane. La roadmap ne pianifica 14 («prima parte»), e la seconda parte non compare.
- La squadra A ha nel 2027 anche scambio (10 settimane in Q2), Report del costo del lavoro (6) e Gestione di più sedi (12, Q3). Paghe Light non ci sta senza togliere qualcosa.
- Il portafoglio (`roadmap/portafoglio.md:7`) dice «Investire nel 2027» e la roadmap (`:19`) lo mette in Q1 con P1, mentre lo stesso portafoglio scrive «Business case in approvazione». Si assegna capacità prima della decisione.
- La validazione prevista (20 interviste, almeno 12 sì; `innovazione/concetti.md:18`) non ha un esito documentato. Il business case cita invece il 58% di interessati dal sondaggio. Il concetto B dichiara «nessun rischio rilevante» (`:19`), ma tratta dati personali dei dipendenti e il calcolo delle paghe.
- Correzione proposta:
  - Mettere Paghe Light come «condizionato all'approvazione» e assegnarle capacità solo dopo il sì.
  - Scegliere esplicitamente fra Paghe Light e Gestione di più sedi sulla squadra A nel 2027, oppure dare capacità alla squadra B.
  - Registrare l'esito delle interviste.
  - Passare a Privacy & Compliance i dati dei dipendenti trattati dal modulo.

**R4 · P1 · API pubblica in ritardo rispetto all'accordo con Cassa Facile**
- Evidenza: `partner/accordi.md:16` («API pubblica da gennaio 2027») contro `roadmap/roadmap.md:29` (API in Q3, 10 settimane, squadra B, P2).
- La data promessa non è raggiungibile nemmeno anticipando l'API a inizio Q1: 10 settimane finiscono a fine marzo.
- L'accordo è da firmare a dicembre 2026, quindi si decide adesso.
- Correzione proposta: portare la data nell'accordo a un trimestre realistico, o anticipare l'API in Q1-Q2 sulla squadra B (che nella mia proposta ha spazio). Va decisa prima della firma.
- Da passare all'agenzia business, perché fuori dal mio perimetro:
  - esclusiva nazionale di 5 anni senza recesso (`:12`, `:17`);
  - compenso calcolato su importo IVA compresa (`:14`);
  - nessun obiettivo minimo (`:13`);
  - sconto del 40% più compenso del 30% sul listino per l'associazione (`:26-27`).

**R5 · P1 · La proposta di investire sul concetto C poggia su un errore di calcolo**
- Evidenza: `innovazione/concetti.md:36-38`. Il totale di C è 5×0,4 + 2×0,3 + 3×0,3 = **3,5**, non 4,4. Gli altri totali (A 4,3 e B 3,7) sono corretti.
- Con il valore giusto l'ordine è A, B, C. Questo corrisponde alla roadmap, che ha Paghe Light e non ha il concetto C. Il portafoglio dice «da valutare dopo lo scambio dei turni» (`roadmap/portafoglio.md:8`). La proposta del concetto («dopo A, C, poi B») è da correggere.
- Il concetto C prevede anche che Turnio «assuma formalmente il lavoratore per la giornata» (`innovazione/concetti.md:24`). Questo richiede una verifica legale, e la validazione prevista (pagina di presentazione, «interesse positivo») è debole.
- Correzione proposta: correggere il totale a 3,5 e la proposta. Il concetto C resta fuori dal 2027 fino a una verifica legale e a una validazione più solida.

**R6 · P1 · Dismissione di Kiosk il 31 dicembre 2026: rischio per O1 non valutato**
- Evidenza: `roadmap/portafoglio.md:6` e `:12-13`.
- Il guadagno dichiarato è di circa 2 settimane a trimestre per la squadra C. Il costo è 61 locali (il 14,8% della base), 549 € di MRR (6.588 € di ARR) e la perdita della timbratura su tablet.
- La nuova timbratura dell'App 2.0 arriva solo in Q3 (`roadmap/roadmap.md:28`), quindi i clienti Kiosk restano scoperti per circa 9 mesi.
- La dismissione è tra sei settimane e nessun documento riporta un piano di migrazione o una stima del rischio di abbandono. I 549 € non rientrano nei 21.630 €, e questo può falsare il confronto sull'ARPU di O3.
- Correzione proposta: rimandare la dismissione al rilascio della nuova timbratura (o almeno a un piano di migrazione con stima degli abbandoni). Se si decide di dismettere comunque, valutare un'uscita guidata con la comunicazione ai 61 clienti.

**R7 · P1 · Baseline di O1 e target O1/O2 non coerenti**
- Il tasso di abbandono annuo è calcolato come 98/412 = 23,8% (`clienti/fidelizzazione.md:14`), cioè sulla base finale. Sulla base iniziale è 98/330 = **29,7%**. Sulla coorte iniziale, 249 dei 330 clienti sono rimasti, quindi 81 persi, cioè **24,5%**.
- L'obiettivo «sotto il 20%» (`roadmap/roadmap.md:7`) ha dunque tre punti di partenza possibili, e la distanza dal target varia da 4 a 10 punti.
- Per O2, passando da 412 a 520 locali (`:8`), servono circa 190 clienti nuovi lordi con churn al 20%, o circa 206 con il churn attuale. Gli ultimi 12 mesi ne hanno portati 180.
- La quota di vendita del Q1 è 8.000 € di ARR (`vendite/previsione.md:22`), circa 13 locali al prezzo medio, e va rapportata al fabbisogno del trimestre.
- Il business case (`finanza/business-case.md:12`) dà per scontato l'abbandono «come per Turnio» a 12%, ed è un altro numero ancora. Inoltre assume 600 locali a fine 2027 (`:8`), contro i 520 di O2.
- Correzione proposta: fissare un'unica definizione di abbandono (per coorte iniziale) e usarla in roadmap, business case e fidelizzazione. Allineare 600 e 520.

**R8 · P1 · La proposta sui prezzi lavora contro O3**
- Evidenza: `crescita/prezzi.md:18` (annuali dal 22% al 60%, «10 mesi pagati per 12») e `roadmap/roadmap.md:22` (Fatturazione annuale automatica, O3).
- L'MRR conta gli annuali per l'equivalente mensile (`README.md:10`), quindi un cliente annuale vale il 16,7% in meno. Spostare il 38% dei clienti sugli annuali abbassa l'ARPU di circa 6 punti, mentre O3 chiede +10%.
- Il «+20% di ricavi» della proposta è un effetto di cassa nell'anno, non di ricavo, perché il ricavo si riconosce mese per mese (`finanza/business-case.md:27`).
- L'iniziativa «Fatturazione annuale automatica» è etichettata O3, ma in realtà sostiene un obiettivo di cassa.
- Correzione proposta: rietichettarla come obiettivo di liquidità, oppure decidere se O3 si misura in ARPU o in ricavo. La proposta di prezzi non va approvata finché non è chiaro quale dei due prevale.

**R9 · P2 · Doppioni e sovrapposizioni**
- Esportazione per il consulente: la roadmap la ha due volte, Q1 «Esportazione delle presenze in CSV per il consulente» (`roadmap/roadmap.md:21`, 6 settimane) e Q2 «Integrazione con il consulente del lavoro» (`:26`, 8 settimane), entrambe sulla squadra B. Inoltre il piano Pro già include «esportazione per il consulente» (`crescita/prezzi.md:8`). Va chiarito se l'esportazione esiste già e consolidare i due elementi in uno solo.
- Report del costo del lavoro (`roadmap/roadmap.md:20`, Q1): il piano Plus lo include già (`crescita/prezzi.md:9`) e ha 52 locali. Serve chiarire se è già rilasciato o promesso e non consegnato.
- WhatsApp (`roadmap/roadmap.md:23`, 9 settimane) e le notifiche push dell'App 2.0 (`:28`) sono due canali per lo stesso scopo. Inoltre WhatsApp è etichettato O2 (crescita della base) senza un legame chiaro. Proporrei di toglierlo dal Q1 e rivalutarlo dopo App 2.0. Servono anche una verifica privacy (consenso, fornitore) e il costo del servizio.
- Tema scuro (`:24`): P1 senza un obiettivo collegato, mentre l'App 2.0 è P3. Lo toglierei o lo porterei a P3.
- Analisi della gestione di più sedi (`:27`) è assegnata alla squadra C (app mobile), ma l'iniziativa che segue è della squadra A (`:30`). Assegnare l'analisi a chi poi sviluppa, o spiegare il perché.

**R10 · P2 · Posizionamento e roadmap non coincidono**
- `marketing/posizionamento.md:5` punta su «catene e gruppi della ristorazione con più locali», ma la gestione di più sedi arriva in Q3 (`roadmap/roadmap.md:30`). Il PRD esclude pure gli scambi fra locali diversi dello stesso gruppo (`prodotto/prd-scambio-turni.md:45`). Il README descrive invece locali con 3–40 dipendenti.
- Il budget del primo semestre va per il 70% a LinkedIn «per i decisori dei gruppi» (`marketing/lancio.md:14-18`), prima che la funzione per i gruppi esista.
- Correzione proposta: decidere il target del 2027. Se resta il locale singolo, il posizionamento va corretto; se sono i gruppi, la gestione di più sedi va anticipata.

**R11 · P2 · Lo scambio dei turni e O1: tracciabilità e copertura**
- Il PRD misura «assenze non coperte −50%» (`prodotto/prd-scambio-turni.md:9`), non l'abbandono di O1. Il legame con O1 va esplicitato (per esempio abbandono dei locali che lo usano rispetto agli altri).
- Lo scambio è solo per Pro e Plus (`:39`). Base ha 190 locali su 412 (`crescita/prezzi.md:14`), cioè il 46% della base, che non lo potrà usare. Per O1 questa è metà del bersaglio, mentre per O3 è un incentivo a passare di piano. Serve dichiarare quale effetto si cerca.
- Il PRD è anche contraddittorio fra R3 (approvazione automatica se i due dipendenti accettano) e R4 (il responsabile deve sempre approvare), `:29` e `:30`. Per la sicurezza della pianificazione va risolto prima dello sviluppo.

**R12 · P3 · Q4 senza contenuto e 15 settimane libere in Q2**
- Con la proposta qui sotto, il Q2 e il Q4 si possono usare per riserva bug, rinvii e una scelta fra le iniziative (Gestione di più sedi, Paghe Light seconda parte).

## Proposta di riequilibrio, da confermare

Questa è una proposta indicativa. L'ordine e le squadre vanno discussi con il product manager.

| Trim. | Squadra A | Squadra B | Squadra C |
|---|---|---|---|
| Q1 | Report costo del lavoro (6) e Paghe Light prima parte (7), solo se il business case è approvato; altrimenti analisi sedi | Esportazione per il consulente, versione unica (8); API, avvio | App dipendenti 2.0 (12) |
| Q2 | Scambio dei turni (10) | Fatturazione annuale (8) dopo la decisione sui prezzi; API, se non anticipata | Analisi sedi (6); riserva bug |
| Q3 | Gestione di più sedi (12), oppure Paghe Light seconda parte | API, se non anticipata | WhatsApp, se rivalutato |
| Q4 | Da definire con risultati e riserva | | |

- Q1 diventa 12 + 6 + 7 + 8 = 33 settimane su 39, con 6 di riserva.
- L'API sulla squadra B va anticipata o la data nell'accordo va corretta (R4).
- Il tema scuro esce finché non ha un obiettivo.

## Altre incongruenze trovate fuori dal perimetro

Non le analizzo, ma le segnalo:

- **Marketing:** M3 («Gratis per sempre fino a 3 dipendenti») contraddice i prezzi, dove non esiste un piano gratuito (`marketing/posizionamento.md:17` e `crescita/prezzi.md:5-9`). M1 («il più usato») non ha una fonte.
- **Business case di Paghe Light:** 96.000 + 40.000 + 24.000 = 160.000 €, non 140.000 € (`finanza/business-case.md:24`). Il risultato corretto sarebbe −113.884 €, non −93.884 €. Il ricavo include l'IVA (18,30 € invece di 15 €: 37.800 € contro 46.116 €), e l'LTV è calcolato sul prezzo e non sul margine del 70%. Il «pareggio nel 2028» non è dimostrato. Passare all'analista finanziario.
- **Imbuto:** l'esperimento sui prezzi è stato fermato al sesto giorno guardando il risultato ogni mattina (`crescita/imbuto.md:25`), con 35 e 41 prove. Il +19% non è affidabile. Passare all'analista di crescita.

## Domande aperte per l'utente

1. Paghe Light o Gestione di più sedi sulla squadra A nel 2027?
2. Il Report del costo del lavoro e l'esportazione per il consulente esistono già?
3. La dismissione di Kiosk resta al 31 dicembre 2026?
4. Quale data si propone a Cassa Facile per l'API, prima della firma di dicembre?
5. Il target 2027 è il locale singolo o i gruppi?
6. Quale definizione di abbandono vale per O1?

Le decisioni e le approvazioni restano all'utente.

— AIBPD-12 · DENEBOLA
