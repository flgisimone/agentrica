AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist, reparto AIBPD (AI Business & Product Development)

# Revisione di `requisiti.md` (v0.3, bozza) — abbonamento «Orto in Box»

Ho letto solo `README.md` e `requisiti.md` nella cartella del progetto. Non ho modificato nessun file. Secondo il README servizio, azienda e numeri sono inventati, quindi non ho usato dati esterni né prezzi. Le proposte di riformulazione sono **proposte**: i valori fra parentesi quadre (es. [N settimane]) li decide l'utente.

## 1. Sintesi

Il documento è corto e leggibile. NF1 e i criteri di US-01 sono una buona base. Prima del design però ha alcuni problemi:
- **una contraddizione** fra R2 e R3, sui tempi della sospensione;
- **una regola incoerente con il modello**: R4 parla di «abbonamenti lunghi» in un abbonamento che si rinnova ogni settimana;
- **un'incoerenza** sui canali di notifica: R5 prevede push Firebase, US-01 un'email;
- **due criteri non verificabili**: la metrica di successo e NF2;
- **lacune che bloccano il design**: giorno di consegna, prezzi, pagamento non riuscito, disdetta senza criteri, cambio da grande a piccola.

Non ho trovato rilievi P0. 14 rilievi: 7 P1, 5 P2, 2 P3.

## 2. Rilievi

**ALG-01 · P1 · §1 Obiettivo, riga 9 · Criterio non verificabile**
«Aumentare la retention dei clienti» non dice nulla di misurabile:
- quali clienti (abbonati, clienti one-off, tutti);
- come si definisce la retention;
- da quale valore si parte e a quale si vuole arrivare;
- entro quando.

Così non si può dire se il lancio è riuscito. Manca anche una metrica di adozione: quanti clienti one-off passano all'abbonamento.
Proposta: «KPI primario: quota di abbonati ancora attivi (non disdetti) [8] settimane dopo l'attivazione ≥ [X%], misurata a [3] mesi dal lancio. KPI secondario: quota dei clienti con almeno un ordine singolo negli ultimi [90] giorni che attivano l'abbonamento ≥ [Y%] entro [3] mesi. Baseline: retention attuale dei clienti one-off a [8] settimane = [da ricavare dai dati di oggi]». Le settimane sospese vanno contate in modo esplicito (contano o no come attive).

**ALG-02 · P1 · §3 R2 (riga 19) e R3 (riga 20) · Contraddizione**
R2 dice che si sospende «in qualsiasi momento». R3 dice che la sospensione va chiesta «entro il giovedì». Restano indefiniti:
- l'ora del limite;
- se il giovedì è incluso;
- il fuso orario;
- cosa succede a una richiesta fatta dopo il limite.

Proposta:
- R2: «Il cliente può chiedere una sospensione in qualsiasi momento.»
- R3: «Una sospensione chiesta entro le [23:59] del giovedì (ora italiana, giovedì incluso) vale dalla consegna della settimana successiva. Se chiesta dopo, vale dalla consegna della settimana ancora dopo. La consegna già programmata resta confermata e addebitata.»

**ALG-03 · P1 · §3 R4, riga 21 · Ambiguità / incoerenza con R1**
«Abbonamenti lunghi» non è definito. Con R1 l'abbonamento si rinnova ogni settimana, senza durata né vincolo, quindi un abbonamento «lungo» non esiste nel modello. Non si sa:
- su cosa si calcola il 10% (box, spedizione, totale);
- da quando si applica, e se vale anche per le settimane già passate;
- se si perde con una sospensione, un cambio di box o una disdetta.

Va scelta un'alternativa, e la scelta spetta all'utente:
- (a) fedeltà: «Dalla [13ª] consegna pagata in poi il prezzo della box è scontato del 10%. Le settimane sospese non interrompono il conteggio e non contano. Lo sconto non si applica alle consegne già addebitate.»
- (b) piano con vincolo: «Il piano da [12] settimane, pagato [settimanalmente/in anticipo], ha il 10% di sconto sul prezzo della box. Si disdice prima della scadenza con [condizioni].» L'alternativa (b) introduce un vincolo contrattuale da far verificare legalmente.

**ALG-04 · P1 · §3 R1, riga 18 · Ambiguità / lacuna**
Il giorno di consegna non è definito da nessuna parte, quindi non si capisce se l'addebito del lunedì paga la consegna della stessa settimana o della successiva. Da questo dipendono anche R3 e US-03. Manca anche cosa succede:
- al primo addebito, se si attiva di mercoledì (subito, il lunedì dopo, in proporzione);
- con un pagamento rifiutato, una carta scaduta o un'autenticazione forte del pagamento non riuscita;
- nei festivi.

Proposta: «R1. Le consegne avvengono il [giorno], nella fascia [orario]. Il [lunedì] alle [ora] si addebita la consegna della stessa settimana. Il primo addebito avviene [all'attivazione / il lunedì precedente la prima consegna].»
Nuova regola R1-bis: «Se l'addebito non riesce, il sistema riprova [N] volte entro [giorno/ora] e avvisa il cliente. Se tutti i tentativi falliscono, la consegna della settimana viene annullata e l'abbonamento passa allo stato [sospeso per pagamento].»

**ALG-05 · P1 · §4 US-04, riga 33 · Criteri di accettazione assenti**
La disdetta non ha criteri. Non si sa:
- da quando vale (stesso limite del giovedì?);
- cosa succede alla consegna già addebitata (rimborso o no);
- se arriva una conferma;
- se si può riattivare dopo;
- cosa succede allo sconto di R4.

Proposta:
- «Dato un abbonamento attivo o sospeso, quando il cliente disdice entro il giovedì, allora dalla settimana successiva non riceve box né addebiti, vede lo stato "disdetto" con la data dell'ultima consegna e riceve un'email di conferma.»
- «… quando disdice dopo il giovedì, allora riceve ancora la consegna già programmata, che resta addebitata, e la disdetta vale dalla settimana dopo.»

I tempi e i modi della disdetta, e i diritti del consumatore su un bene deperibile, vanno verificati da un legale. Qui non affermo che una soluzione sia conforme.

**ALG-06 · P1 · §4 US-03, riga 31-32 · Lacuna e incoerenza con R3**
Il criterio dice «prima del giovedì», R3 dice «entro il giovedì»: il giovedì è incluso o no? Manca il passaggio da grande a piccola. Manca il caso «dopo il giovedì». La regola sul limite per i cambi di box non è fra le Regole (§3): sta solo nella storia.
Proposta: aggiungere «R6. Un cambio di box chiesto entro le [23:59] del giovedì vale dalla consegna della settimana successiva, al prezzo della nuova box. Se chiesto dopo, vale da quella ancora dopo.» Poi tre criteri: piccola→grande e grande→piccola entro il limite, e un cambio dopo il limite che resta in attesa e mostra la data in cui varrà.

**ALG-07 · P1 · §2 Perimetro e tutto il documento · Lacune**
Mancano informazioni necessarie al design e allo sviluppo:
- prezzo della box piccola e della grande, e cosa contengono;
- cosa vuol dire «Milano»: Comune, CAP ammessi o area metropolitana, e come si verifica;
- cambio di indirizzo, anche verso un indirizzo fuori zona;
- consegna non riuscita (cliente assente);
- consegna saltata per indisponibilità del fornitore, con rimborso o no;
- canale: web, app o entrambi. NF2 parla di «app», R5 implica push;
- chi può abbonarsi: solo i clienti che oggi ordinano (§1) o anche clienti nuovi;
- stati dell'abbonamento e passaggi fra uno stato e l'altro (attivo, sospeso, sospeso per pagamento, disdetto);
- stakeholder: logistica, customer care, amministrazione.

Proposta: una sezione «Glossario e stati» con il diagramma degli stati, una sezione «Prezzi e zone» e una sezione «Domande aperte» che riporti la §5 di questo rapporto.

**ALG-08 · P2 · §3 R5, riga 22 · Vincolo di soluzione al posto di un requisito, incoerenza con US-01**
R5 sceglie una tecnologia (Firebase Cloud Messaging, cioè notifiche push) ma non dice quali notifiche servono. US-01 prevede invece un'email di conferma, che FCM non invia. Inoltre FCM è un fornitore terzo che tratta gli identificativi dei dispositivi, quindi va considerato anche per la privacy.
Proposta: «R5. Il cliente riceve una notifica per: attivazione, addebito riuscito, addebito non riuscito, sospensione confermata, cambio di box, disdetta, promemoria del limite del giovedì [sì/no]. Canale: email [e push, se c'è l'app].» La scelta di FCM, se è un vincolo reale, va spostata in una sezione «Vincoli tecnici» con la motivazione, e decisa insieme alla Software Agency.

**ALG-09 · P2 · §5 NF2, riga 38 · Criterio non verificabile**
«Veloce e facile da usare» non si può testare. La parte «veloce» è già coperta da NF1.
Proposta: «NF2. In un test con [5–8] utenti del target, almeno l'[80%] attiva l'abbonamento senza aiuto in meno di [3] minuti e sospende due settimane in meno di [1] minuto. Le pagine dell'abbonamento rispettano le WCAG 2.2 livello AA.»

**ALG-10 · P2 · §4 US-02, riga 29-30 · Lacuna / incoerenza con R2-R3**
Il criterio non tiene conto del limite del giovedì. Inoltre non dice:
- quanto può durare al massimo una sospensione;
- se la ripresa è automatica alla fine delle settimane scelte;
- se il cliente può annullare una sospensione.

C'è anche un'incoerenza: R2 descrive una sospensione aperta («in qualsiasi momento»), la storia una sospensione per settimane scelte.
Proposta: «Dato un abbonamento attivo, quando il cliente sceglie le settimane da [data] a [data], tutte dopo il limite di R3, e conferma, allora in quelle settimane non riceve la box né addebiti, l'abbonamento riprende da solo dalla settimana successiva e riceve una conferma.» Aggiungere due criteri: «… se una delle settimane scelte è già oltre il limite, il sistema la indica come non sospendibile» e «durata massima della sospensione: [N] settimane consecutive».

**ALG-11 · P2 · §4 US-01, riga 27-28 · Criteri incompleti**
- Il criterio positivo copre solo la box grande.
- Manca la carta rifiutata o non valida, e non è definito cosa vuol dire «carta valida».
- La data della prima consegna non ha una regola che la determini.
- Non è detto quando avviene il primo addebito (vedi ALG-04).

Proposta: rendere il criterio indipendente dalla dimensione della box («sceglie una box, piccola o grande»). Aggiungere: «Dato un cliente con carta rifiutata, quando conferma, allora vede il motivo e l'abbonamento non viene creato.» E: «La prima consegna è la prima [giorno di consegna] con la richiesta fatta entro il limite del giovedì precedente.»

**ALG-12 · P2 · §1 Obiettivo, riga 7 · Ambiguità sul target**
«Per i clienti che oggi ordinano una box alla volta» si legge in due modi: target prioritario, oppure unica categoria ammessa. Nel secondo caso US-01 dovrebbe controllare che il cliente abbia già ordinato.
Proposta: «Target prioritario: clienti con almeno un ordine singolo. Possono abbonarsi anche clienti nuovi [sì/no].»

**ALG-13 · P3 · §5 NF1, riga 37 · Criterio da precisare**
È quasi verificabile, ma mancano:
- quali pagine;
- cosa vuol dire «si caricano» (quale metrica);
- il profilo di rete 4G e il dispositivo;
- dove si misura (laboratorio o utenti reali).

Proposta: «NF1. Su [elenco pagine: attivazione, gestione, sospensione], il Largest Contentful Paint è ≤ 2 s al 95° percentile, misurato [in laboratorio con profilo 4G (es. 9 Mbps giù, 1,5 Mbps su, 170 ms RTT) su dispositivo mobile di fascia media / su utenti reali in produzione].»

**ALG-14 · P3 · Documento intero · Tracciabilità e governance**
Mancano:
- autore e responsabile, cronologia delle versioni, log delle decisioni;
- collegamenti fra regole, storie e KPI. R4 e R5 non hanno una storia, US-03 e US-04 non hanno una regola, gli NF non sono collegati a nessuna storia.

Proposta: aggiungere un'intestazione con owner e changelog, e la matrice qui sotto.

## 3. Matrice di tracciabilità (stato attuale → mancanze)

| Elemento | Collegato a | Mancanza |
|---|---|---|
| Obiettivo/KPI | — | KPI non misurabile (ALG-01) |
| R1 addebito | US-01, US-02 (implicito) | giorno di consegna, pagamento rifiutato (ALG-04) |
| R2/R3 sospensione | US-02 | contraddizione (ALG-02, ALG-10) |
| R4 sconto | nessuna storia | definizione e storia (ALG-03) |
| R5 notifiche | US-01 (email, incoerente) | elenco eventi e canale (ALG-08) |
| US-03 cambio box | nessuna regola | R6 proposta (ALG-06) |
| US-04 disdetta | nessuna regola | criteri (ALG-05) |
| NF1, NF2 | nessuna storia | pagine e metriche (ALG-13, ALG-09) |

## 4. Handoff proposti, da attivare solo con il tuo ok

- **Privacy & Compliance:** dati trattati (indirizzo, dati di pagamento tramite il fornitore dei pagamenti, identificativi del dispositivo se si usa FCM), fornitori (pagamenti, FCM/Google, email), conservazione dei dati dopo la disdetta.
- **Revisione legale umana:** termini di disdetta e di rinnovo, eventuale vincolo del piano «lungo» (ALG-03 b), diritti del consumatore sui beni deperibili.
- **Software Agency:** decidere se FCM è un vincolo, quando si rifiniranno i requisiti.

## 5. Domande aperte per l'utente

1. In che giorno e in che fascia si consegna? L'addebito del lunedì paga la stessa settimana?
2. Cosa sono gli «abbonamenti lunghi»: fedeltà (a) o piano con vincolo (b)?
3. Prezzi della box piccola e della grande. Lo sconto vale anche sulla spedizione?
4. Che cosa vuol dire «Milano» (Comune, CAP, area metropolitana)?
5. Canale: web, app o entrambi? Le notifiche via email bastano?
6. Possono abbonarsi anche clienti nuovi?
7. Cosa succede se il pagamento non va a buon fine?
8. Quanto può durare al massimo una sospensione?
9. Quali valori obiettivo e quale orizzonte per il KPI?

## 6. Decisioni che spettano all'utente

- Correggere `requisiti.md` con queste riformulazioni (non l'ho modificato).
- Le scelte da fare su ALG-03 (a/b), ALG-08 (canale e FCM) e ALG-12 (target).
- Gli handoff della §4.

Fino a queste risposte la revisione resta incompleta: i requisiti non sono pronti per il design.

— ALGIEBA (AIBPD-05)