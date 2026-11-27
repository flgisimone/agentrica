AIBPD-04 · HAMAL — Senior Product Manager, reparto AIBPD (AI Business & Product Development)

Revisione in sola lettura del PRD `prodotto/prd-scambio-turni.md` (copia di lavoro `aibpd-04-4`). Non ho modificato nulla. Ho letto anche `README.md`, `innovazione/concetti.md`, `clienti/fidelizzazione.md`, `clienti/coorti.csv`, `roadmap/roadmap.md`, `roadmap/portafoglio.md`, `crescita/prezzi.md` e `mercato/sondaggio-2026.md`. Le schede della biblioteca (recesso, riduzioni di prezzo, direttiva 2024/825) non riguardano questo PRD e non le ho lette. Riporto fatti ed evidenze. Le correzioni sono proposte, non decisioni.

**Sintesi.** Il PRD è marcato «approvato, in sviluppo da gennaio 2027 (squadra A)» ma ha due contraddizioni interne e una con la roadmap. Gli obiettivi non sono misurabili sui dati che l'azienda ha oggi. Mancano vincoli di lavoro e di sicurezza. Ci sono 3 rilievi P0 o P1 da portare all'utente subito (R1, R2, R3 sotto).

## Rilievi

**R1 · P0 · Squadra e calendario in contraddizione con la roadmap**
- PRD, riga 4: «in sviluppo da gennaio 2027 (squadra A)».
- `roadmap/roadmap.md`, riga 25: lo scambio dei turni è in **Q2**, squadra A, 10 settimane. Nel Q1 la squadra A ha Paghe Light (14 settimane) e il report del costo del lavoro (6 settimane), cioè 20 settimane su 13 disponibili (riga 13).
- Anche senza lo scambio, il Q1 della squadra A è sovraccarico.
- Correzione proposta: togliere «da gennaio 2027» e allineare PRD e roadmap sul trimestre. Poi decidere con l'utente cosa esce dal Q1 della squadra A. Sono rilievi distinti: il PRD dice «in sviluppo» mentre la roadmap non lo prevede, e il Q1 di A è sovraccarico.

**R2 · P0 · Dipendenza dalle notifiche push non rispettata**
- PRD, righe 31 e 43: R5 richiede notifiche push, ma le notifiche push sono «fuori perimetro» perché «arrivano con l'App dipendenti 2.0». La contraddizione è interna al PRD.
- Roadmap, riga 25: lo scambio (Q2) dipende da App dipendenti 2.0, che è in **Q3** (riga 28), squadra C, priorità **P3**, mentre lo scambio è P0. La dipendenza è dunque in ritardo di un trimestre e con priorità inferiore a ciò che la richiede.
- Correzione proposta: scegliere con l'utente tra tre opzioni.
  - Alzare App dipendenti 2.0 a P0 e anticiparla al Q1 o all'inizio del Q2, con la squadra C.
  - Cambiare R5 in notifica non push (email, SMS o notifica in app). Il margine lordo include già gli SMS (README, riga 11), e `roadmap` ha già «Notifiche dei turni su WhatsApp» al Q1.
  - Rinviare lo scambio al Q4, dopo App dipendenti 2.0.

**R3 · P1 · R3 e R4 si contraddicono sull'approvazione**
- R3 (riga 29): con due accettazioni «lo scambio è approvato automaticamente e i turni si aggiornano».
- R4 (riga 30): «Il responsabile deve sempre approvare lo scambio prima che i turni cambino».
- Il concetto validato (`concetti.md`, riga 8) prevede «il responsabile approva con un tocco». Quindi R3 è l'errore.
- Correzione proposta: in R3 sostituire «approvato automaticamente e i turni si aggiornano» con «lo scambio passa in attesa di approvazione del responsabile». Aggiungere una regola esplicita per i locali senza responsabile attivo (vedi R6).

**R4 · P1 · Obiettivo e metriche deboli, non misurabili con i dati attuali**
- Obiettivo (riga 9): «Ridurre del 50% le assenze non coperte entro sei mesi dal rilascio». Non c'è baseline: nei documenti non esiste nessun conteggio delle assenze non coperte. Il 46% del sondaggio è la quota di locali che indica le assenze come problema principale, non un tasso di assenze. Non c'è nemmeno una definizione di «non coperta».
- Il concetto validato (`concetti.md`, righe 9-11) usava un'altra misura: almeno il 40% delle assenze annunciate con più di 4 ore di anticipo coperte con uno scambio, su 8 locali per due settimane (6 su 8 sopra la soglia). Un campione piccolo, di durata breve e con prototipo cliccabile. Il PRD non riprende né la misura né la soglia, e passa a un obiettivo più ambizioso (-50%) senza spiegare il perché.
- Metriche (righe 18-21): «5.000 scambi proposti al mese» e «60% dei locali che usano lo scambio» non sono ricavabili dalla base. Lo scambio è solo nei piani Pro e Plus: 170 + 52 = 222 locali (`crescita/prezzi.md`, riga 14), non i 412 totali. 5.000 scambi al mese sono circa 22 per locale idoneo al mese, in locali da 3–40 dipendenti. Non c'è nessun dato che sostenga questa stima: va dichiarata come ipotesi, con intervallo e scenari. Il 60% non dice se è calcolato sui 222 locali con il piano o sui 412. Inoltre misura l'uso, non l'esito.
- Le metriche sono tutte di uso (volume). Nessuna di risultato (assenze coperte) né di qualità (tempo di copertura, scambi rifiutati). Manca anche una soglia di allarme.
- Il PRD non collega lo scambio al KPI di roadmap: O1, abbandono annuo sotto il 20% (`roadmap.md`, riga 7). Il motivo di uscita più frequente è «i dipendenti non usano l'app» (41%, `fidelizzazione.md`, riga 35), e solo il 22% dei dipendenti usa l'app una volta a settimana (riga 37). Il PRD non misura se lo scambio sposta l'adozione da parte dei dipendenti, che è proprio ciò che dovrebbe ridurre l'abbandono.
- Correzione proposta: misurare un periodo di baseline prima del rilascio (assenze annunciate e coperte per locale, con definizione scritta). Riformulare l'obiettivo, ad esempio «portare la quota di assenze annunciate con più di 4 ore di anticipo coperte con scambio a X% entro sei mesi». Aggiungere una metrica di adozione dei dipendenti (quota che usa l'app almeno una volta a settimana, oggi 22%) e rapportarla a O1. Esplicitare la base di calcolo (222 locali Pro e Plus) e le formule. Segnare i 5.000 e il 60% come ipotesi da rivedere dopo il primo mese.

**R5 · P1 · Vincolo «Nessun vincolo sugli orari»: rischio legale e di sicurezza non gestito**
- PRD, riga 38: lo scambio è libero tra colleghi con lo stesso ruolo, purché i turni non si sovrappongano.
- Mancano, per un'app usata da personale di ristoranti e bar: riposo minimo tra due turni, limite di ore settimanali, minorenni, apprendisti e contratti diversi (part-time, a chiamata). Un turno non sovrapposto può cadere a poche ore da un altro e portare a violare i limiti di orario di lavoro. La riga 44 mette fuori perimetro «paghe e straordinari», ma l'effetto sullo straordinario di uno scambio ricade comunque sul locale (e sul report del costo del lavoro, già previsto al Q1).
- Questo è un rischio di conformità. Il nome della norma e i limiti vanno verificati da un consulente del lavoro: non lo faccio io (le mie conoscenze non sono una fonte).
- Correzione proposta: nuovo requisito di controllo, configurabile dal responsabile, con riposo minimo e ore massime; segnalare all'utente prima del rilascio. Chiedere il parere di un consulente del lavoro. Inserire il rischio nella sezione Rischi.

**R6 · P1 · Requisito R6 non mitiga il rischio indicato**
- Rischi (riga 49): «Pochi responsabili potrebbero approvare in tempo: mitigato con R6».
- R6 (riga 32): lo scambio si chiude da solo 2 ore prima del turno «se nessuno lo ha accettato». Riguarda i colleghi, non il responsabile, e quindi non risolve il caso del responsabile che non approva. Inoltre il «se nessuno lo ha accettato» lascia indefinito che cosa succede quando un collega ha accettato e il responsabile non ha ancora risposto: il dipendente che voleva uscire resta con un turno che non può fare.
- Correzione proposta: definire una scadenza per l'approvazione del responsabile (ad esempio promemoria dopo X ore e scadenza a Y ore dal turno), e uno stato finale chiaro («scaduto, resta il turno originale»). Un'approvazione automatica entro soglia solo se il responsabile la attiva esplicitamente. Allungare i tempi: 2 ore prima del turno sono poche per un locale che cerca un sostituto, e il concetto validato parlava di assenze annunciate con più di 4 ore di anticipo. Aggiungere il rischio «responsabile non risponde» tra i criteri di accettazione.

**R7 · P1 · Piani e prezzi: il PRD non considera gli effetti commerciali**
- PRD, riga 39: «Funziona per i piani Pro e Plus; nel piano Base si vede ma non si usa». Coerente con `prezzi.md` (riga 8), ma i piani Base valgono 190 locali su 412 (46%), e sono proprio i più piccoli. Nessun requisito descrive come si «vede» la funzione nel piano Base (schermata di presentazione, invito al passaggio di piano), né una metrica di conversione. Senza questo la funzione non serve a O3 (ARPU +10%) e il vincolo non ha una ragione dichiarata.
- La metrica «locali che hanno usato lo scambio almeno una volta: 60%» ignora che il 46% dei clienti non può usarlo.
- Correzione proposta: decidere con l'utente se la visibilità nel Base è una scelta di prodotto (leva di upgrade, con requisito e metrica) o se va tolta. Nel primo caso aggiungere un requisito per lo stato «bloccato» nel Base e la metrica «passaggi da Base a Pro nei 30 giorni dopo la prima visualizzazione».

**R8 · P1 · Dati personali: storico e registro non trattati**
- R7 (riga 33): il registro delle presenze mostra chi ha lavorato davvero il turno. R8 (riga 34): ogni scambio resta nello storico per 24 mesi.
- Sono dati personali dei dipendenti, con effetti sul rapporto di lavoro. Il PRD non indica finalità, base giuridica, chi può vedere lo storico (solo il responsabile, o anche i colleghi?), né perché 24 mesi. Il campo «nota facoltativa» di R1 è testo libero e può contenere dati sensibili (ad esempio motivi di salute).
- Il PRD non dice cosa succede alla modifica del registro di presenza: serve una traccia di chi ha cambiato cosa (rilevante anche per il consulente del lavoro e per `Esportazione delle presenze in CSV`, Q1).
- Correzione proposta: passare il requisito a Privacy & Compliance Agency (finalità, basi giuridiche, conservazione, accessi), e limitare o avvertire sul campo nota. Segnalare all'utente la decisione sui 24 mesi.

**R9 · P2 · Requisiti mancanti o incompleti**
- R2 (riga 28): «stesso ruolo (sala, cucina, bar) senza turno sovrapposto». Manca che cosa succede a chi ha più ruoli, ai dipendenti sospesi o cessati e ai colleghi sopra il limite di ore (vedi R5). Il caso «turno già iniziato» non è definito.
- Manca la possibilità di annullare una proposta da parte del dipendente prima che sia accettata. Mancano gli scambi parziali (un turno solo di una parte della giornata) e il caso di due proposte che coinvolgono lo stesso turno.
- Mancano i criteri di accettazione per tutti i requisiti: il PRD non ne contiene. Mancano stati (proposto, accettato, approvato, rifiutato, scaduto, annullato) e gli eventi da registrare.
- Mancano requisiti non funzionali: tempi di notifica, comportamento senza rete e coerenza fra app e pannello web quando due persone agiscono insieme.
- Correzione proposta: aggiungere una tabella degli stati e criteri di accettazione per R1-R8. Passare i casi limite all'analista funzionale della software agency.

**R10 · P2 · Utenti e ruoli incompleti**
- La sezione Utenti (righe 11-14) ha solo responsabile e dipendente. Il piano Plus prevede «più ruoli di responsabile» (`prezzi.md`, riga 10): il PRD non dice quale ruolo approva. Il README dice che in locale ci sono 3–40 dipendenti: nei locali piccoli il titolare e il responsabile sono la stessa persona e possono essere uno dei due scambianti.
- Correzione proposta: definire chi approva in presenza di più responsabili e che cosa succede quando l'approvatore è parte dello scambio.

**R11 · P2 · Sezioni obbligatorie mancanti rispetto al formato standard**
- Mancano mercato e concorrenti, proposta di valore, costi e ricavi, scenari e roadmap/dipendenze (formato standard, voci 4, 5, 8, 11). Nessuna indicazione dell'impegno stimato (la roadmap dice 10 settimane per la squadra A, senza una stima dei requisiti) e nessun piano di validazione dopo il rilascio.
- Correzione proposta: aggiungere una sezione «Piano di rilascio e validazione» (pilota con un sottoinsieme di locali, soglie per decidere se proseguire) e un riferimento alle stime.

**R12 · P2 · Evidenza di validazione debole**
- `concetti.md`, riga 11: «validato a ottobre 2026 (6 locali su 8 sopra il 40%)». Il campione è piccolo (8 locali, due settimane) e non dice se i locali erano scelti dall'azienda tra i clienti più attivi. Il sondaggio ha risposto il 18% dei clienti (74 su 412) con incentivo di 10 €, quindi il 46% è una stima con un possibile errore di selezione.
- Correzione proposta: nel PRD riportare il limite del campione come ipotesi e prevedere una conferma sul pilota (R11). Il rilievo sulla matrice di scelta (concetto C con punteggio 4,4 superiore al concetto A e proposta di investire su C) è fuori dal mio perimetro attuale ma lo segnalo: «nessun rischio rilevante» per B e la validazione di C con solo «interesse positivo» (`concetti.md`, righe 19 e 26) sono deboli, e C (assunzione formale del lavoratore, fatturazione con ricarico) ha rischi di lavoro e fiscali non indicati. Da affidare a una revisione separata.

**R13 · P3 · Incoerenze minori**
- Il PRD dice «Autore: product manager» senza nome né data di approvazione; la riga 4 non dice chi lo ha approvato. Lo stato «approvato» dovrebbe essere una decisione dell'utente, non del documento: va confermato.
- Fuori perimetro (riga 45): «scambi fra locali diversi dello stesso gruppo». In roadmap (Q3) c'è «Gestione di più sedi» (P1, squadra A, O2): conviene scrivere che il PRD la considera una dipendenza futura, non una rinuncia.

## Domande aperte per l'utente (da portare con la tendina)
1. Squadra A in Q1: confermare che lo scambio si avvia davvero a gennaio o restare sul Q2 della roadmap (R1).
2. Notifiche: anticipare App dipendenti 2.0, usare un'altra notifica o rinviare lo scambio (R2).
3. Chi ha approvato il PRD e su quale base, visto che R3 e R4 si contraddicono (R3 e R13).
4. Esiste un conteggio delle assenze non coperte per definire la baseline (R4)?
5. Chi risponde dei vincoli di orario di lavoro: serve il parere di un consulente del lavoro (R5)?

## Passaggi di consegne suggeriti
- Privacy & Compliance Agency: R7, R8 e il campo nota (R8).
- Software Agency (analista funzionale): stati, casi limite e criteri di accettazione (R9, R10).
- Portfolio & Roadmap Manager: priorità, capacità della squadra A e dipendenza da App dipendenti 2.0 (R1, R2).
- Growth & Monetization Manager: visibilità dello scambio nel piano Base e conversione (R7).

Nota di metodo: lavoro su un modello più piccolo (Sonnet). Propongo il riesame del direttore del reparto (AIBPD-01 · ALDERAMIN) o di un revisore su Opus per i rilievi R1, R2, R3 (P0/P1) prima che diventino definitivi. Non ho caricato AIBPD-01 per mancanza del tool `agent`. Nessun processo avviato.

— AIBPD-04 · HAMAL
