AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist, reparto AIBPD (AI Business & Product Development)

Ho letto `requisiti.md` (versione 0.3, bozza) e il `README.md` nella cartella di lavoro, e non ho modificato nulla. Il compito è la revisione dei requisiti prima del design. Ho riportato ambiguità, contraddizioni, lacune e criteri non verificabili, ciascuno con il punto del documento (numero di riga) e una proposta di riformulazione.

Non ho usato i tool di Agentrica, come richiesto per questa prova. Perciò non ho letto la scheda `funzione-di-recesso` (art. 54-bis Codice del consumo, indicata per il mio ruolo). I rilievi sul recesso (R-07) sono quindi da verificare su quella scheda prima di essere considerati definitivi. Il testo del documento è l'unica fonte che ho usato e non ho aggiunto dati esterni.

## Sintesi

Il documento ha una struttura chiara e US-01 è scritta bene. Prima di passare al design vanno risolti però sei punti:

- una contraddizione sulle sospensioni (R2 contro R3);
- una sulla scadenza di US-03, tra "entro il giovedì" e "prima del giovedì";
- la metrica di successo senza valori;
- lo sconto indefinito;
- una disdetta (US-04) senza criteri;
- l'addebito al lunedì senza il giorno di consegna.

## Rilievi

**R-01 · P1 · Metrica di successo non verificabile** (riga 9)
- Evidenza: «aumentare la retention dei clienti» non ha definizione, valore di partenza, obiettivo, orizzonte temporale né modalità di misura.
- Perché conta: non si può dire a posteriori se il lancio ha funzionato, né tracciare i requisiti verso un KPI.
- Proposta: «Portare la retention a N settimane dei clienti con abbonamento dal valore attuale X al valore Y entro la data Z, misurata come [definizione]».
- Servono dall'utente: il valore di partenza X e l'obiettivo Y. Non li stimo io.
- Domanda collegata: se il target sono i clienti che «oggi ordinano una box alla volta» (riga 7), lo si dichiari anche come popolazione di misura.

**R-02 · P1 · Contraddizione tra R2 e R3** (righe 19-20)
- Evidenza: R2 dice che si può sospendere «in qualsiasi momento». R3 pone una scadenza al giovedì. Anche US-02 (righe 29-30) non cita alcuna scadenza.
- Proposta: «R2. Il cliente può sospendere l'abbonamento. La richiesta fatta entro giovedì ore HH:MM (fuso Europe/Rome) vale dalla consegna della settimana successiva; dopo quel termine la sospensione parte dalla seconda consegna successiva [o: è rifiutata con messaggio]».
- Da decidere: il comportamento dopo la scadenza. Le alternative sono sospensione ritardata, rifiuto con messaggio o consegna già pagata.
- In US-02 va aggiunto un criterio di accettazione che copra la scadenza.

**R-03 · P1 · Addebito al lunedì e giorno di consegna non definito** (righe 18, 20, 32)
- Evidenza: il documento non dice mai in quale giorno si consegna. Non si capisce quindi cosa significhi «consegna della settimana successiva» rispetto all'addebito del lunedì.
- Esempio: se un cliente chiede la sospensione il venerdì, la settimana che inizia il lunedì successivo è già stata addebitata?
- Proposta: aggiungere una regola «Calendario»: giorno e fascia di consegna, ora dell'addebito, termine di sospensione e modifica. Meglio una tabella o un esempio con date.
- Aggiungere un criterio del tipo: «Dato un cliente che sospende il giovedì entro il termine, quando arriva il lunedì successivo, allora non viene addebitato e non riceve la box».

**R-04 · P1 · Scadenza incoerente in US-03** (riga 32)
- Evidenza: US-03 dice «prima del giovedì», R3 dice «entro il giovedì». Non è chiaro se il giovedì stesso sia incluso.
- Proposta: usare una sola formula con ora esplicita, in un solo punto (regola «Calendario»), e richiamarla dalle user story.
- Casi mancanti in US-03:
  - passaggio dalla grande alla piccola (c'è solo piccola → grande);
  - cambio richiesto dopo la scadenza;
  - differenza di prezzo, perché i prezzi delle due box non sono indicati da nessuna parte.

**R-05 · P1 · Sconto «abbonamenti lunghi» indefinito** (riga 21)
- Evidenza: «lungo» non ha soglia. Mancano la base di calcolo e l'applicazione.
- Domande aperte:
  - da quando si applica lo sconto: dall'inizio o dalla soglia in poi;
  - si applica alle settimane sospese e al cambio di box;
  - si perde se il cliente sospende o disdice e riattiva;
  - si cumula con altre promozioni.
- Proposta: «R4. Dopo N settimane consecutive di abbonamento attivo, il prezzo della box è ridotto del 10% a partire dalla settimana N+1. Le settimane sospese [contano / non contano / azzerano] il conteggio».
- Fa parte della monetizzazione: la soglia N va decisa dall'utente. Il caso va verificato anche in rapporto agli obblighi sui prezzi e sugli sconti annunciati (scheda `riduzioni-di-prezzo` della biblioteca, non letta in questa prova).

**R-06 · P1 · US-04 senza criteri di accettazione** (riga 33)
- Evidenza: è l'unica storia priva di «Dato/quando/allora».
- Proposta: «Dato un abbonamento attivo, quando il cliente conferma la disdetta, allora l'abbonamento risulta chiuso, non vengono addebitate settimane successive alla data di efficacia e riceve una conferma».
- Da chiarire:
  - da quando decorre la disdetta rispetto all'addebito di lunedì e alla scadenza di giovedì;
  - cosa accade a una consegna già pagata;
  - possibilità di riattivare.

**R-07 · P1 · Recesso e disdetta non coordinati con la normativa** (riga 33, da verificare)
- Evidenza: il documento tratta la disdetta come semplice funzione, senza richiamare gli obblighi di recesso nei contratti online.
- Perché conta: per i contratti online la scheda di biblioteca `funzione-di-recesso` (art. 54-bis Codice del consumo) potrebbe imporre una funzione di recesso con requisiti specifici.
- Proposta: leggere la scheda e verificarla sulla fonte, poi derivare i requisiti su visibilità, accesso, conferma e tempi. Inserirli in US-04.
- Questa non è una consulenza legale; va rivista da un professionista umano.

**R-08 · P2 · R5 è una scelta tecnica, non un requisito** (riga 22)
- Evidenza: «Firebase Cloud Messaging» indica la soluzione e non il bisogno. Non sono dichiarati quali notifiche, a quali eventi, su quale canale e con quali preferenze dell'utente.
- Contraddizione parziale: US-01 (riga 27) prevede un'email di conferma e non una notifica.
- Proposta: «R5. Il cliente riceve una comunicazione [email / push] per: attivazione, addebito, sospensione, cambio box, disdetta, consegna in arrivo. Il cliente può gestirne le preferenze».
- La scelta del fornitore va nel design e passa dall'architetto software e dall'utente.
- Il dato personale (identificativo del dispositivo) coinvolge un fornitore esterno: va fatto vedere a Privacy & Compliance, come previsto dalle regole del reparto.

**R-09 · P2 · Lacune su pagamenti e carta** (righe 14, 18, 27)
- Mancano gli scenari di carta rifiutata o scaduta e di riprova dell'addebito. Manca la regola su cosa succede alla consegna se l'addebito fallisce.
- «Carta valida» (riga 27) non è definita.
- Proposta: aggiungere una user story o una regola «Addebito non riuscito», con numero di riprove, comunicazioni al cliente, sospensione automatica e riattivazione.
- Mancano anche IVA, fattura o ricevuta, e il fornitore di pagamento (decisione dell'utente).

**R-10 · P2 · Perimetro «Milano» ambiguo** (righe 13-14, 28)
- «Indirizzo di consegna a Milano» non dice se si intende il Comune, l'elenco dei CAP o le zone servite.
- Mancano il caso del cambio di indirizzo verso fuori Milano durante l'abbonamento e la gestione dei nuovi clienti fuori zona (ad esempio una lista d'attesa). Non assumo che serva.
- Proposta: «Zona servita: [elenco CAP]. Se il cliente cambia indirizzo fuori zona, l'abbonamento [viene sospeso / disdetto / bloccato]».

**R-11 · P2 · Requisiti non funzionali** (righe 37-38)
- NF2 («veloce e facile da usare») non è verificabile e ripete in parte NF1. Proposta: sostituirlo con un criterio misurabile, ad esempio tasso di completamento dell'attivazione in un test di usabilità o un numero massimo di passaggi per sospendere. Il valore soglia lo decide l'utente.
- NF1 è verificabile, ma va precisato:
  - quali sono «le pagine dell'abbonamento»;
  - dove e come si misura (dati di campo o laboratorio);
  - quale metrica di caricamento (ad esempio LCP).
- Mancano requisiti non funzionali su accessibilità, sicurezza, disponibilità e protezione dei dati.

**R-12 · P2 · Terminologia e ruoli** (righe 19, 26, 33)
- R2 parla di «utente», le user story di «cliente». «Sospendere», «disdire» e «recesso» non sono definiti. Manca un glossario.
- Non compaiono ruoli interni (operatori, amministratore, magazzino) né altre parti interessate. Non so se servano: va chiesto.

**R-13 · P2 · Dati personali** (righe 14, 27)
- Il servizio tratta indirizzi, dati di pagamento ed email. Il documento non ha una sezione su finalità, conservazione e fornitori.
- Proposta: passaggio di consegne a Privacy & Compliance con finalità, flussi e categorie di dati.

**R-14 · P3 · Tracciabilità e decisioni** (documento nel complesso)
- Le regole R1-R5 non sono collegate alle storie (ad esempio R3 con US-02 e US-03), né alla metrica di successo.
- Non c'è un registro delle decisioni né degli aspetti aperti. Proposta: matrice di tracciabilità minima (obiettivo, regola, storia, criterio) e una sezione «Domande aperte».

## Cosa non è nel documento (da chiedere all'utente)

- Prezzi delle due box e prezzo della sospensione/riattivazione.
- Giorno e fascia di consegna.
- Valore di partenza e obiettivo della retention.
- Soglia dello sconto e sue regole.
- Fornitore di pagamento e canale delle notifiche.
- Gestione dei pagamenti falliti.

## Decisioni che spettano all'utente

Soglie e regole di R2/R3/R4, giorno e ora dei termini, canale delle notifiche, comportamento dopo la scadenza e a pagamento fallito, e valori dell'obiettivo. Questo rapporto è una raccomandazione, non una decisione approvata.

## Nota sul modello

Lavoro su Sonnet. Ci sono rilievi P1 (R-01 e R-07 soprattutto): propongo il riesame del direttore AIBPD-01 · ALDERAMIN, o di un revisore su Opus, prima che diventino definitivi. R-07 dipende inoltre dalla lettura della scheda `funzione-di-recesso`, che qui non ho potuto fare.

Firmato: AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist, reparto AIBPD
