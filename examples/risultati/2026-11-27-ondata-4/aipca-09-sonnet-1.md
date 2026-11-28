AIPCA-09 · MEGREZ — Senior Data Breach & Incident Response Specialist, reparto AIPCA (AI Privacy & Compliance)

Rapporto: valutazione in sola lettura di `violazione/segnalazione-2026-11.md` e `violazione/registro.md`. Non ho consultato le schede della biblioteca (AI Act, adeguatezza, L. 132/2025), perché il compito non le tocca. Non ho scritto né corretto file.

**Esito**

Ho trovato tre rilievi P0 (R1, R2, R5) e due P0 collegati (R3, R4). Vanno segnalati subito all'utente e al direttore AIPCA-01. Il termine del 27 novembre indicato nella scheda non regge. Il modello che ha eseguito questa valutazione è più piccolo di quello della sessione (Sonnet): propongo il riesame del direttore AIPCA-01 o di un revisore su Opus prima che i P0 diventino definitivi.

**R1 · Classificazione errata (art. 4(12) GDPR) · P0 · `non_conforme`**
- Punto: scheda, riga 16 («nessuna violazione di riservatezza, perché i file non sono stati modificati né cancellati»).
- Errore: integrità e disponibilità non sono il criterio. La violazione di riservatezza è la divulgazione o l'accesso non autorizzato (art. 4(12), linee guida EDPB 9/2022).
- Smentita dei fatti: il contenitore era leggibile da chiunque e la riga 11 riporta due scaricamenti completi da indirizzi esterni (17/11 22:13 e 18/11 03:50).
- Azione: classificare come violazione di riservatezza confermata, con accesso effettivo. Considerare anche l'accesso del collega esterno che ha ricevuto il file di prova.

**R2 · Rischio valutato male (artt. 33, 34, 32 GDPR) · P0 · `non_conforme`**
- Punto: riga 18 («rischio basso, perché in produzione i documenti sono cifrati con AES-256-GCM»).
- Errore: la riga 8 dice che in staging i documenti sono decifrati dallo script di aggiornamento. La cifratura di produzione non protegge quella copia.
- Elementi che alzano il rischio: documenti d'identità (furto d'identità), dati sulla salute (art. 9) per 96 studenti di cui 71 minorenni (interessati vulnerabili), scaricamenti avvenuti davvero da soggetti sconosciuti.
- Azione: rifare la valutazione con la metodologia EDPB 9/2022. Il risultato atteso è rischio probabilmente elevato. La decisione finale spetta a titolare e DPO.

**R3 · Comunicazione agli interessati omessa (art. 34 GDPR) · P0 · `non_conforme`**
- Punto: riga 23 («non necessaria, visto il rischio basso»).
- Errore: la premessa è sbagliata (R2). Con rischio elevato la comunicazione è dovuta senza ingiustificato ritardo (art. 34(1)). L'esenzione dell'art. 34(3)(a) non si applica, perché i dati erano in chiaro.
- Destinatari: 412 genitori e 96 studenti. Per i 71 minorenni la comunicazione passa dai genitori o dagli esercenti la responsabilità.
- Contenuto minimo (art. 34(2) e art. 33(3)(b)-(d)): natura della violazione, contatto del DPO, probabili conseguenze, misure adottate, consigli di protezione.
- Azione: comunicare appena confermata la valutazione. Il Garante può comunque imporla (art. 34(4)).

**R4 · Notifica al Garante: termine sbagliato e già scaduto (art. 33(1) e (4) GDPR) · P0 · `non_conforme`**
- Punto: riga 22 («entro 72 ore dalla fine dell'analisi interna, quindi entro il 27 novembre»).
- Errore: le 72 ore decorrono dalla conoscenza della violazione (ragionevole certezza che sia avvenuto un incidente, EDPB 9/2022), non dalla fine dell'analisi. Conoscenza: 18 novembre alle 09:00, con la segnalazione del ricercatore. Il termine scadeva il 21 novembre alle 09:00. Si può sostenere una data anteriore: il 17 novembre alle 16:40, quando lo storage è stato reso pubblico.
- Incoerenza: dal 24 novembre (fine analisi) al 27 sono comunque più di 72 ore.
- Stato attuale: al 27 novembre la notifica è in ritardo di circa 6 giorni. L'art. 33(1) impone di motivare il ritardo.
- Azione:
  - notificare subito, senza attendere le conclusioni complete;
  - se mancano informazioni, usare la notifica per fasi (art. 33(4));
  - indicare i motivi del ritardo;
  - allegare i fatti dell'art. 33(3): natura e categorie, numero approssimativo di interessati e record, contatto del DPO, conseguenze, misure.
- La decisione finale spetta a titolare e DPO.

**R5 · Conservazione delle prove (artt. 5(2), 24 e 33(5) GDPR) · P0 · `non_conforme`**
- Punto: riga 11 («i log di accesso si cancellano da soli dopo 7 giorni; non ne è stata fatta una copia»).
- Errore: i log del 17 novembre (22:13) sono scaduti il 24 novembre. Quelli del 18 novembre (03:50) sono scaduti il 25 novembre. Al 27 novembre risultano probabilmente già persi, salvo una copia non citata nella scheda.
- Conseguenze: non si può provare l'ampiezza reale degli accessi né escludere altri scaricamenti. Il titolare non può rispondere al Garante con prove.
- Azione:
  - verificare subito con Nimbus se esiste una copia o un recupero dei log, e sospendere la cancellazione automatica;
  - se i log sono persi, documentarlo come limite dell'analisi e dichiararlo in notifica;
  - conservare da ora ogni prova (log, copie del contenitore, esportazioni, comunicazioni del ricercatore e del collega esterno).

**R6 · Registro delle violazioni incompleto (art. 33(5) GDPR) · P1 · `non_conforme`**
- Punto: `registro.md`, righe 3-6. Le colonne sono solo N., data e descrizione.
- Errore: l'art. 33(5) richiede di documentare fatti, effetti e provvedimenti adottati. Mancano per entrambe le voci:
  - categorie e numero di interessati e di record;
  - conseguenze e valutazione del rischio;
  - decisione su notifica e comunicazione, con motivazione e data;
  - data di conoscenza;
  - misure correttive e stato.
- Voce 1 (newsletter del 4 marzo, 38 indirizzi in chiaro): non risulta alcuna valutazione di notifica né motivazione della non notifica.
- Voce 2: la data 2026-11-17 è quella del fatto, non della conoscenza (18 novembre alle 09:00). Vanno registrate entrambe.
- Azione: aggiungere le colonne e completare entrambe le voci, con la motivazione di una eventuale non notifica per la voce 1.

**R7 · Misure correttive e coordinamento con fornitore e terzi (artt. 33(2), 28(3)(f), 32, 25, 5(1)(c) GDPR) · P1**
- Punto: righe 24 e 8.
- Misure insufficienti: la regola interna «mai rendere pubblico lo storage» è solo organizzativa. Lo script che decifra i dati di produzione e li copia in staging «resta com'è», quindi la causa strutturale non viene rimossa.
- Azione tecnica proposta: dati sintetici o anonimizzati in staging, oppure almeno blocco dell'accesso pubblico a livello di piattaforma e controlli periodici.
- Stato: `non_conforme` per le misure. `non_verificabile` per il coordinamento con Nimbus (è un responsabile? esiste l'accordo art. 28? la scheda non cita alcun contatto).
- Altre lacune nella scheda:
  - la bonifica del file consegnato al collega esterno (richiesta di cancellazione e conferma scritta);
  - il ricercatore: se abbia scaricato dati, e una risposta a lui;
  - il ruolo del DPO nella valutazione.

**R8 · Rilevamento e canale di segnalazione (art. 33 GDPR) · P2 · `non_verificabile`**
- Punto: righe 9-11.
- La violazione è emersa solo grazie a un ricercatore esterno, dopo circa 16 ore. Nessun controllo interno l'ha vista. Il contenimento è tornato alle 11:00 del 18 novembre, due ore dopo la segnalazione: tempo ragionevole.
- Evidenze mancanti: tempo di risposta del canale `privacy@`, ruoli e reperibilità.
- Azione: documentare il canale di segnalazione e la reperibilità. Aggiungere un avviso o controllo automatico sull'esposizione pubblica degli storage.

**Matrice delle segnalazioni, dopo la correzione**

| Soggetto | Obbligo | Termine | Stato |
|---|---|---|---|
| Garante | art. 33 | 72 ore dalla conoscenza (18/11 09:00, quindi 21/11 09:00) | scaduto: notificare subito con motivi del ritardo |
| Interessati (genitori e studenti) | art. 34 | senza ingiustificato ritardo | da fare, appena confermato il rischio elevato |
| Fornitore Nimbus | artt. 28(3)(f), 33(2) | senza ingiustificato ritardo | non verificabile |
| Registro interno | art. 33(5) | sempre | incompleto |

**Domande aperte per titolare, DPO e legale**
- Esiste una copia dei log di accesso, oppure Nimbus può recuperarli?
- Il DPO è stato coinvolto, e quando?
- Il collega esterno è un responsabile o un terzo, e con quale accordo?
- La data di conoscenza da registrare è il 18 novembre alle 09:00 o il 17 novembre?

Questa è una valutazione di supporto, non un parere legale. Notificabilità e comunicazione le decidono titolare, DPO e consulente legale.

AIPCA-09 · MEGREZ
