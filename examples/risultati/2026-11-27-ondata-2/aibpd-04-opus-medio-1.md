AIBPD-04 · HAMAL — Senior Product Manager, reparto AIBPD (AI Business & Product Development)

Per AIBPD-01 · ALDERAMIN. Non ho potuto caricare prima il direttore perché in questa sessione non ho il tool `agent`. Ho lavorato in sola lettura su `copie/aibpd-04-1` e non ho modificato nessun file.

## Esito

Il PRD non è pronto per lo sviluppo, anche se porta lo stato «approvato» (riga 4). Ho trovato tre contraddizioni fra requisiti. Il calendario non è coerente con la roadmap. L'obiettivo e le metriche non hanno una base di partenza e chiedono più di quanto il concetto abbia validato. Mancano i vincoli di legge sugli orari e due dei rischi principali non sono gestiti.

Propongo di riportare lo stato a «bozza in revisione» finché l'utente non decide sui punti qui sotto.

Le schede della biblioteca (riduzioni di prezzo, recesso, Direttiva 2024/825) non riguardano questo compito: il PRD non tocca prezzi né contratti con i consumatori, e i clienti sono imprese. Non le ho lette.

I percorsi sono relativi alla copia. Con «aspetto», «previsto», «obiettivo» distinguo le stime dai fatti letti nei documenti.

## Rilievi

### Requisiti in contraddizione

**H1 · P1. R3 e R4 si escludono.**
- Evidenza: `prodotto/prd-scambio-turni.md:29` dice che lo scambio con l'accordo dei due dipendenti «è approvato automaticamente e i turni si aggiornano». La riga 30 dice che il responsabile «deve sempre approvare lo scambio prima che i turni cambino».
- Correzione: scegliere una sola regola, con una decisione dell'utente. Opzione (a): approvazione sempre necessaria; R3 diventa «lo scambio passa in attesa di approvazione». Opzione (b): approvazione automatica, impostabile per locale; R4 diventa «il responsabile può annullarlo fino a X ore prima». Il concetto (`innovazione/concetti.md:8`, «il responsabile approva con un tocco») va con la (a).

**H2 · P1. R5 contro il «Fuori perimetro».**
- Evidenza: R5 (`prd-scambio-turni.md:31`) chiede notifiche push. La riga 43 mette fuori perimetro le «Notifiche push (arrivano con l'App dipendenti 2.0)».
- Correzione: decidere come arrivano gli avvisi nella prima versione: email, SMS, WhatsApp (in roadmap Q1, squadra C), oppure push con la dipendenza dichiarata. Scritto così, il requisito non si può accettare.

**H3 · P2. Il rischio è mitigato con un requisito che non c'entra.**
- Evidenza: riga 49, «Pochi responsabili potrebbero approvare in tempo: mitigato con R6». Ma R6 (riga 32) chiude solo gli scambi *non accettati da nessun collega*. Non dice cosa succede a uno scambio accettato e non ancora approvato all'inizio del turno.
- Correzione: aggiungere un requisito sulla scadenza dell'approvazione. Per esempio: promemoria al responsabile N ore prima; all'inizio del turno, approvazione automatica o annullamento, secondo la scelta fatta per H1. Serve anche l'approvazione dall'app, non solo dal pannello web (riga 13).

### Calendario e dipendenze

**H4 · P1. Le date non tornano fra PRD, roadmap e lancio.**
- PRD: «in sviluppo da gennaio 2027 (squadra A)» (riga 4).
- Roadmap: lo scambio è in Q2, squadra A, 10 settimane, e dipende dall'App dipendenti 2.0 (`roadmap/roadmap.md:25`).
- L'App dipendenti 2.0 è in Q3, P3 (`roadmap.md:28`): l'iniziativa P0 dipende da una P3 che arriva dopo.
- In Q1 la squadra A ha già 14 + 6 = 20 settimane contro 13 disponibili (`roadmap.md:13,19-20`).
- Il lancio è previsto dal 1° febbraio 2027 (`marketing/lancio.md:6`), quando il prodotto non può esistere.
- Correzione: fissare una data di rilascio unica e coerente con la capacità, togliendo la dipendenza (vedi H2) o anticipando l'App 2.0. Poi riallineare la riga 4 del PRD, la roadmap e la data del lancio. Il passaggio alla squadra del portafoglio e il carico di Q1 restano ad AIBPD-11.

### Obiettivi e metriche deboli

**H5 · P1. L'obiettivo non ha una base di partenza e supera la validazione.**
- Evidenza: «Ridurre del 50% le assenze non coperte» (riga 9).
  - Nessun documento dà il numero attuale di assenze non coperte, né dice come Turnio le misura. Oggi lo scambio avviene al telefono (`concetti.md:7`).
  - L'ipotesi validata vale solo per le assenze annunciate con più di 4 ore di anticipo: almeno il 40% di queste si copre (`concetti.md:9`). Il problema dichiarato però sono le assenze *dell'ultimo minuto* (`concetti.md:7`), che l'ipotesi non copre.
  - La validazione è stata fatta con un prototipo cliccabile, su 8 locali per due settimane (6 su 8 sopra la soglia): campione piccolo, comportamento simulato, confidenza bassa.
  - Il 50% di tutte le assenze non coperte non deriva da nessun dato.
- Correzione: definire che cos'è un'assenza non coperta e come si registra nel prodotto. Misurare la base nei 2–3 mesi prima del rilascio. Riscrivere l'obiettivo sul perimetro validato, per esempio «≥ 40% delle assenze annunciate con più di 4 h di anticipo coperte con uno scambio», con una soglia minima e un'ipotesi alta. Aggiungere un piano di validazione dopo il rilascio, con un gruppo pilota.
- Collegato, per AIBPD-10: il messaggio «Le assenze dell'ultimo minuto si coprono da sole» (`lancio.md:8`) promette più del concetto validato.

**H6 · P1. Le metriche misurano l'attività, non il risultato, e non hanno basi di calcolo.**
- «Scambi proposti al mese: 5.000» (riga 20). Una proposta non è una copertura. Solo i locali Pro e Plus (170 + 52 = 222, `crescita/prezzi.md:14`) possono usare lo scambio (riga 39). Servirebbero circa 22,5 proposte al mese per locale, e il numero non è motivato da nessun dato.
- «60% dei locali» (riga 21). Non dice su quale base. Se è sui 412 locali, il tetto è del 54%, perché i 190 Base non possono usarlo.
- Nessuna metrica è collegata a O1 (abbandono, `roadmap.md:7`), che è l'obiettivo della roadmap per questa iniziativa.
- Correzione, metriche proposte:
  - quota di scambi proposti che si chiudono con una copertura;
  - tempo mediano di approvazione;
  - assenze non coperte rispetto alla base (H5);
  - dipendenti attivi ogni settimana nei locali Pro e Plus, oggi 22% (`clienti/fidelizzazione.md:37`). «I dipendenti non usano l'app» è il primo motivo di abbandono, con il 41% (`fidelizzazione.md:35`);
  - abbandono dei locali Pro e Plus che usano lo scambio contro quelli che non lo usano.
- La base va dichiarata in ogni metrica.

**H7 · P2. La base di O1 è sbagliata nei dati dei clienti.**
- Evidenza: `fidelizzazione.md:14` calcola l'abbandono come 98 / 412 = 23,8%, cioè sui clienti di fine periodo.
- Correzione: rifare il calcolo, che va in tutti e due i casi sopra il 23,8%:
  - sui clienti di inizio periodo: 98 / 330 = 29,7%;
  - sulla media del periodo: 98 / 371 = 26,4%.
- Con la base corretta la distanza da O1 (sotto il 20%) è maggiore e il contributo atteso dallo scambio va ridimensionato. Questo calcolo resta ad AIBPD-08.

### Vincoli mancanti

**H8 · P1. «Nessun vincolo sugli orari» (riga 38).**
- Uno scambio libero può portare un dipendente oltre i limiti di legge e di contratto. Penso a riposo giornaliero e settimanale, durata massima dell'orario, minorenni, orario dei contratti part-time e regole del CCNL di settore.
- Il riferimento che ricordo è il D.lgs. 66/2003, con 11 ore di riposo consecutive. Viene dalle mie conoscenze, non dalla biblioteca né da una verifica sulla fonte: va controllato con un consulente del lavoro prima di diventare un requisito.
- Il PRD mette fuori perimetro paghe e straordinari (riga 44), ma gli scambi possono creare straordinari e cambiare il costo del lavoro.
- Correzione: sostituire la riga 38 con controlli sugli orari:
  - riposo minimo fra due turni;
  - ore massime settimanali;
  - ore del contratto;
  - avviso al responsabile se nasce uno straordinario.
- I parametri sono da validare con un consulente del lavoro. La conformità resta una decisione dell'utente.

**H9 · P2. I casi limite delle regole di accesso non sono definiti.**
- R1 e R2 (righe 27–28) non chiariscono se si tratta di uno *scambio* (due turni che si invertono) o di una *cessione* del turno. Il concetto descrive una cessione (`concetti.md:8`).
- Mancano: chi accetta se rispondono in più colleghi; il ritiro della proposta; un dipendente con più ruoli; quale responsabile approva nel piano Plus, che ha più responsabili (`prezzi.md:9`).
- Mancano i criteri di accettazione per ogni requisito.
- Correzione: aggiungere queste regole e i criteri di accettazione (formato dato / quando / allora), da passare alla Software Agency.

**H10 · P2. Vincolo sui piani e mercato.**
- Riga 39: nel piano Base lo scambio si vede ma non si usa. Il Base vale il 46% dei locali (190 su 412) e il prezzo è già il secondo motivo di abbandono, con il 22%.
- Correzione: dichiarare l'ipotesi di passaggio da Base a Pro (`lancio.md:24`) e misurarla. Valutare il rischio di abbandono nei Base.
- Il concorrente principale offre già lo scambio dei turni (Orarix, `mercato/concorrenti.md:7`). Per il posizionamento lo scambio tiene Turnio alla pari, non lo distingue: va detto nel PRD.

### Rischi non gestiti

**H11 · P1. Pochi dipendenti usano l'app.**
- Solo il 22% dei dipendenti usa l'app ogni settimana (`fidelizzazione.md:37`).
- Senza avvisi (H2) i colleghi non vedono la proposta, quindi lo scambio rischia di non coprire nulla.
- Correzione: aggiungere il rischio con una mitigazione: avvisi su un canale che c'è già, attivazione dei dipendenti al lancio, soglia di adozione da verificare nel pilota.

**H12 · P2. Dati personali nello storico.**
- R8 (riga 34) conserva per 24 mesi gli scambi, con le note libere (R1) e i motivi di rifiuto (R4).
- Le note possono contenere motivi di salute, cioè dati particolari.
- Correzione: motivare i 24 mesi, limitare o guidare la nota libera, e passare finalità, dati e conservazione alla Privacy & Compliance Agency prima dello sviluppo.

**H13 · P3. Il registro delle presenze dopo lo scambio.**
- R7 (riga 33) non dice da dove arriva la timbratura.
- Turnio Kiosk sarà dismesso il 31 dicembre 2026 (`roadmap/portafoglio.md:6`) e la nuova timbratura arriva con l'App 2.0 (`roadmap.md:28`).
- Correzione: precisare la fonte della timbratura nella prima versione.

## Domande aperte per l'utente

1. Per H1: approvazione del responsabile sempre necessaria, oppure automatica e impostabile per locale?
2. Per H2 e H4: canale degli avvisi e data di rilascio. Togliamo la dipendenza dall'App 2.0 o la anticipiamo?
3. Turnio può misurare oggi le assenze non coperte, o serve prima una funzione che le registri?
4. Per H8: chi verifica i vincoli di legge e di contratto sugli orari?

Tutti i rilievi sono proposte. Nessuna modifica al PRD, alla roadmap o al lancio è approvata senza la conferma dell'utente.

— HAMAL (AIBPD-04)
