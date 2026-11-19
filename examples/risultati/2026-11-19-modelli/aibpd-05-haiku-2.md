AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist, reparto AIBPD (AI Business & Product Development)

# Revisione di requisiti.md: abbonamento settimanale «Orto in Box» (v0.3, bozza)

Documento esaminato: `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/9246e669-5e3d-40d5-8d76-e41f06314a00/scratchpad/runs/aibpd-05-requisiti-abbonamenti-haiku-2/requisiti.md` (38 righe). Il README del progetto dichiara che servizio, azienda e numeri sono inventati: la revisione tratta il documento come bozza di prova.

## Sintesi

Il documento copre l'idea di base (abbonamento settimanale, sospensione, cambio di dimensione, disdetta), ma non è ancora pronto per il design. Il rilievo più grave (P0) riguarda la regola di addebito: il documento non dice in quale settimana cade l'addebito del lunedì rispetto alla scadenza del giovedì e alla consegna, quindi non si può stabilire quando un cliente sospeso deve smettere di essere addebitato. Mancano inoltre tutti i prezzi, i criteri di accettazione della disdetta (US-04), la definizione di «abbonamento lungo» (R4) e una metrica di successo misurabile. Due affermazioni si contraddicono (R2 contro R3). NF2 non è verificabile.

Stato delle verifiche: nessun dato numerico è presente nel documento, quindi non ho valutato costi, margini o scenari. Ho segnalato ciò che manca per poterlo fare.

## Rilievi

Priorità: P0 bloccante (segnalato subito), P1 alto impatto, P2 significativo ma gestibile, P3 non urgente.

### P0

**A-01 · P0 · R1, R3, US-02, US-03 (righe 18, 20, 30, 32).** Ambiguità temporale che produce addebiti errati.
- R1 dice che la carta viene addebitata «il lunedì», ma non dice quale consegna copre quell'addebito (quella della stessa settimana, quella della settimana successiva).
- Il giorno di consegna non è definito. Se la consegna cade dopo il lunedì, l'addebito precede la consegna; se cade prima, no.
- R3 dice che la sospensione richiesta «entro il giovedì» vale «dalla consegna della settimana successiva», ma non dice l'ora limite né il fuso orario, e non dice se la richiesta fatta dopo il giovedì vale per la settimana successiva ancora.
- US-02 dice «non viene addebitato» nelle settimane sospese, senza collegare quelle settimane all'addebito del lunedì.
- Esempio non risolto: cliente sospende giovedì della settimana N per la settimana N+1. Deve saltare l'addebito del lunedì della settimana N+1? Il documento lo lascia implicito.
- Proposta di riformulazione (da confermare): «R1: ogni lunedì alle ore [X] (Europe/Rome) il sistema addebita la consegna prevista nella settimana ISO corrente (lunedì–domenica), salvo sospensione. R3: una richiesta di sospensione o di cambio dimensione ricevuta entro le ore [Y] del giovedì della settimana N si applica alla consegna della settimana N+1 e impedisce l'addebito del lunedì della settimana N+1. Le richieste successive si applicano dalla settimana N+2.»
- Richiesta di decisione: giorno e fascia di consegna, ora limite del giovedì, fuso orario, settimana di riferimento dell'addebito.

### P1

**A-02 · P1 · Tutto il documento (nessuna riga di prezzo).** Mancano prezzo della box piccola, della box grande, prezzo dell'abbonamento, base e aliquota dello sconto R4, IVA, eventuali spese di consegna. Di conseguenza US-03 («al prezzo della grande») e R4 («sconto del 10%») non sono verificabili, e non si può costruire il business case né la fase di addebito. Non propongo prezzi: sono una decisione commerciale da approvare.
- Riformulazione: «Prezzi di listino (IVA inclusa): box piccola [€ X] a settimana, box grande [€ Y] a settimana, spese di consegna [€ Z]. Sconto abbonamento lungo: [10%] sul prezzo settimanale della box scelta.» Valori da fornire all'utente.

**A-03 · P1 · R2 contro R3 (righe 19–20).** Contraddizione. R2 dice che l'utente può sospendere «in qualsiasi momento»; R3 dice che la sospensione deve essere richiesta entro il giovedì. Forse R2 descrive il gesto e R3 l'effetto, ma il testo non lo dice.
- Riformulazione: «R2: l'utente può sospendere l'abbonamento per le settimane future, in qualsiasi momento; la sospensione ha effetto secondo R3.»

**A-04 · P1 · US-02 (riga 29–30).** Criteri incompleti e non verificabili:
- non è definito il numero massimo di settimane sospendibili né l'orizzonte (quante settimane in anticipo);
- non è previsto il ripristino («riprendi»): non si sa se la ripresa è automatica o richiesta dall'utente;
- non è previsto cosa succede a una sospensione richiesta dopo il giovedì o per una settimana già trascorsa;
- il criterio dice che in quelle settimane «non riceve la box», ma R3 posticipa l'effetto alla settimana successiva: i due criteri vanno allineati.

**A-05 · P1 · US-04 (riga 33).** Disdetta senza criteri di accettazione. Mancano: data di efficacia (immediata o a fine settimana); trattamento della settimana già addebitata (rimborso, credito); conferma all'utente; differenza rispetto alla sospensione; cosa accade a una disdetta fatta durante un abbonamento lungo (R4). Nota per la revisione legale: un abbonamento online può essere soggetto al diritto di recesso dei consumatori; questo va verificato con un consulente legale, non è un'indicazione di conformità.

**A-06 · P1 · US-03 (riga 31–32) e R3.** Il cambio di dimensione è descritto come «cambiare», ma il criterio copre solo piccola→grande. Manca il percorso grande→piccola. Non sono definite: la regola di scadenza (R3 non la cita, il criterio sì); la data di applicazione del nuovo prezzo; l'effetto sullo sconto R4. Riformulazione: spostare la scadenza in R3 e dichiarare che si applica sia alla sospensione sia al cambio di dimensione.

**A-07 · P1 · Obiettivo (righe 7–9), Perimetro (riga 13), US-01 (riga 26).** Popolazione destinataria non chiara:
- l'obiettivo parla di «clienti che oggi ordinano una box alla volta»;
- il perimetro include «clienti con indirizzo a Milano» e «pagamento con carta», ma esclude il pagamento in contanti; se oggi molti clienti pagano in contanti, l'obiettivo non è raggiungibile in questa versione;
- US-01 dice «come cliente», senza distinguere clienti già esistenti e nuovi;
- non è detto come convertire i clienti attuali (ordini in corso, dati di pagamento già salvati).
- Richiesta di decisione: il lancio riguarda i clienti esistenti, i nuovi o entrambi? Quanti clienti attuali pagano in contanti?

**A-08 · P1 · Obiettivo, riga 9.** Metrica di successo non verificabile: «aumentare la retention» non ha definizione, baseline, obiettivo, orizzonte temporale né fonte del dato.
- Proposta di formulazione (da confermare): «Retention a [8] settimane = percentuale di clienti attivi con abbonamento alla [8]ª settimana dall'attivazione. Baseline: [da fornire]. Obiettivo: [da definire]. Fonte: [sistema di ordini].»
- Il valore del 10% di sconto (R4) non è collegato a nessun KPI.

**A-09 · P1 · R4 (riga 21) e R1 (riga 18).** «Abbonamenti lunghi» non è definito (durata minima, massima, se prepagata o no). Il documento dice anche che l'abbonamento «si rinnova ogni settimana», quindi un abbonamento lungo prepagato sarebbe in contrasto con R1. Da chiarire: se esiste un vincolo di durata, come si addebita (settimanale o anticipato), cosa succede alla disdetta anticipata.

**A-10 · P1 · NF2 (riga 38).** «Veloce e facile da usare» non è verificabile. Riformulazione con valori da confermare: «NF2: un cliente completa US-01 senza assistenza in al massimo [N] passaggi. In un test con [N] utenti il completamento è almeno del [X]%.» Il valore di NF1 è già misurabile, quindi NF2 va allineato a quel livello.

**A-11 · P1 · R1, US-01 (riga 27).** Pagamento: il documento non dice cosa succede se l'addebito del lunedì fallisce (tentativi, avviso, sospensione delle consegne), né se la carta scade. Non dice se è richiesta l'autenticazione forte (SCA/3-D Secure) per il primo addebito e per gli addebiti ricorrenti. Non dice dove sono conservati i dati della carta: se presso un fornitore di pagamenti (tokenizzazione) o nei sistemi del servizio. Questo ultimo punto è anche un tema di sicurezza e privacy (handoff sotto).

**A-12 · P1 · US-01 (riga 27).** «La prima consegna è indicata con la data» non dice come si calcola la data: quale cutoff, quale giorno di consegna, cosa accade con festività o consegne saltate per cause esterne (maltempo, indisponibilità del prodotto stagionale). Va collegato a A-01.

**A-13 · P1 · Tutto il documento (privacy).** Il servizio tratta dati personali (identità, indirizzo, email, dati di pagamento, storico delle sospensioni, token del dispositivo per le notifiche). Prima del design va coinvolta la Privacy & Compliance Agency con le funzionalità, le finalità, i flussi, i dati e i fornitori (FCM in particolare, che è un fornitore esterno). Questo rilievo è un handoff, non una valutazione di conformità.

### P2

**A-14 · P2 · US-01 (righe 27–28).** Criteri incompleti: il primo criterio copre solo la box grande (la piccola non è coperta); non c'è il caso di carta rifiutata né di indirizzo non valido; il contenuto dell'email di conferma e il tempo di invio non sono definiti. Il secondo criterio dice «vede che la consegna non è disponibile nella sua zona»: il messaggio va definito.

**A-15 · P2 · Perimetro (riga 13) e US-01.** Il perimetro è definito all'attivazione. Non è previsto il caso in cui un cliente sposta l'indirizzo fuori Milano mentre l'abbonamento è attivo.

**A-16 · P2 · R5 (riga 22).** Notifiche con Firebase Cloud Messaging: il documento non elenca gli eventi che generano notifiche (conferma, promemoria prima del giovedì, pagamento fallito, consegna). Non dichiara la piattaforma (app mobile o web): una notifica push richiede un'app o un browser che la supporti. Il canale per le conferme resta l'email (US-01), quindi va stabilito quale canale usare per quali eventi. FCM è una scelta tecnologica: va confermata dal reparto software, e comporta un trattamento di dati (vedi A-13).

**A-17 · P2 · Glossario (tutto il documento).** Termini non definiti: «settimana» (lunedì–domenica o altro); «consegna»; «box piccola» e «box grande» (contenuto, peso, prezzo); «box di stagione» (composizione e variazione); «Milano» (comune o area metropolitana); «sospensione» contro «disdetta».

**A-18 · P2 · NF1 (riga 37).** «Le pagine dell'abbonamento» non sono elencate. La misura non è definita: quale indicatore (tempo di caricamento completo, LCP, altro), quale profilo di rete (Lighthouse con throttling 4G o misura reale sugli utenti), quale dispositivo, quale ambiente. Il valore di 2 secondi al 95° percentile è misurabile solo dopo queste definizioni.

**A-19 · P2 · Tutto il documento (ruoli).** Gli attori sono solo «cliente». Non sono descritti operatori, magazzino o amministrazione: chi vede le sospensioni per preparare le consegne, chi gestisce le eccezioni, chi risponde ai clienti. Senza di loro non si possono definire le regole operative di A-01.

**A-20 · P2 · Tutto il documento (tracciabilità).** Nessun identificativo collega obiettivo, metrica, regole R1–R5, user story US-01–US-04 e requisiti NF1–NF2. Il documento non ha decision log, responsabili né data di approvazione. La versione 0.3 è una bozza senza storia delle decisioni.
- Proposta: una matrice che collega ogni US alle regole che usa e ogni regola al KPI che la misura; un decision log con le risposte alle domande elencate sotto.

**A-21 · P2 · Revisione legale (riga 33).** Vedi nota su A-05: condizioni di abbonamento, recesso, rinnovo automatico e informativa sul prezzo vanno verificate con un consulente legale. Non sono un'indicazione di conformità.

## Domande da sottoporre all'utente

Le decisioni seguenti sono dell'utente. Non ne ho prese e non ne propongo come definitive.

1. Giorno e fascia di consegna, ora limite del giovedì, fuso orario, settimana di riferimento dell'addebito (A-01, A-12).
2. Prezzi di listino, IVA, spese di consegna, base dello sconto (A-02).
3. Quale sospensione è valida, con quale preavviso, per quante settimane, e come si riprende (A-03, A-04).
4. Come funzionano la disdetta e il rimborso della settimana già addebitata (A-05).
5. Il cambio di dimensione in entrambe le direzioni e la sua scadenza (A-06).
6. Clienti destinatari: esistenti, nuovi o entrambi; come trattare i pagamenti in contanti oggi (A-07).
7. Definizione, baseline e obiettivo della retention (A-08).
8. Durata e condizioni degli abbonamenti lunghi (A-09).
9. Valori di NF2 (A-10).
10. Gestione dei pagamenti falliti e della carta scaduta; SCA; dove sono conservati i dati della carta (A-11).
11. Piattaforma (app o web), canali e eventi delle notifiche (A-16).

## Handoff

- Privacy & Compliance Agency: funzionalità, finalità, dati (identità, indirizzo, email, carta, storico, token di notifica), fornitori (pagamenti, email, FCM), conservazione dopo la disdetta (A-13, A-16).
- Financial Analyst: prezzi, costi di consegna, margini e scenari dello sconto R4, per il business case (A-02, A-08).
- Software Agency: regola di addebito e calendario (A-01, A-12) e NF1 misurabile (A-18), prima che inizi lo sviluppo.
- Web Design Agency: messaggi di errore dell'area zona (A-14), flusso di conferma e sospensione (A-04), NF2 (A-10).

## Riepilogo finale

Il documento non può passare al design così com'è. Prima vanno chiusi A-01 (P0) e A-02 (P1), perché senza di essi non si può definire il calcolo degli addebiti. Le contraddizioni A-03 e A-06 vanno risolte nel testo. La disdetta (A-05) e la metrica (A-08) vanno completate. Il resto sono rifiniture da fare prima della revisione.

ALGIEBA
