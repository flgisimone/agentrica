AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist, reparto AIBPD (AI Business & Product Development)

# Revisione dei requisiti: requisiti.md («Orto in Box», v0.3 bozza)

## Sintesi

Ho letto `README.md` e `requisiti.md`, gli unici due file del progetto. Il documento è breve e leggibile, ma non è ancora pronto per il design. Ci sono:

- una contraddizione diretta fra R2 e R3;
- un conflitto di calendario fra l'addebito del lunedì (R1) e la scadenza del giovedì (R3, US-02, US-03);
- una metrica di successo che non si può verificare;
- una user story senza criteri di accettazione (US-04);
- un requisito non funzionale che non si può verificare (NF2);
- lacune su prezzi, pagamenti non riusciti, giorno di consegna e dati personali.

Non ho modificato nessun file. Le riformulazioni qui sotto sono proposte, da confermare con te. I valori tra parentesi quadre (giorni, percentuali, soglie) sono segnaposto, non dati: devi deciderli tu.

Rilievi: 0 P0, 6 P1, 8 P2, 3 P3.

## Rilievi

### P1

**ALG-01 · P1 · Contraddizione · §3 R2 e R3 (righe 19-20)**
R2 dice che la sospensione si può chiedere «in qualsiasi momento». R3 dice che va chiesta «entro il giovedì» per valere dalla settimana dopo. Non si capisce cosa succede a una richiesta fatta di venerdì: viene rifiutata o vale dalla settimana ancora successiva?
Proposta: «R2. Il cliente può chiedere una sospensione in qualsiasi momento. R3. Se la chiede entro il giovedì alle [23:59, ora italiana], la sospensione vale dalla consegna della settimana successiva; se la chiede dopo, vale da quella della settimana ancora successiva.»

**ALG-02 · P1 · Contraddizione e lacuna · §3 R1 con R3, US-02 e US-03 (righe 18, 20, 30, 32)**
La carta viene addebitata il lunedì, ma le modifiche si chiedono entro il giovedì. Non è chiaro quale settimana paga l'addebito del lunedì, né in che giorno avviene la consegna (il giorno non è scritto da nessuna parte). Se l'addebito del lunedì paga la consegna di quella stessa settimana, una sospensione chiesta il giovedì prima non può aver evitato un addebito già fatto. In quel caso US-02 («non viene addebitato») non regge.
Proposta: scrivere un calendario unico: «La settimana di consegna N si addebita il lunedì della settimana N e si consegna il [giorno]. Le modifiche (sospensione, cambio di box, disdetta) chieste entro il giovedì della settimana N-1 valgono per la settimana N.» Va indicato anche il fuso orario.

**ALG-03 · P1 · Metrica non verificabile · §1 (riga 9)**
«Aumentare la retention dei clienti» non dice come si definisce la retention, qual è il valore di partenza, qual è l'obiettivo né entro quando. Non si può dire se il lancio è riuscito.
Proposta: «Metrica di successo: quota di abbonati ancora attivi (non disdetti) [8] settimane dopo l'attivazione ≥ [X%], misurata a [3] mesi dal lancio. Confronto con la quota di clienti a ordine singolo che riordinano nello stesso periodo (valore di partenza: [da misurare]).» Il valore di partenza va misurato sui dati attuali, non stimato.

**ALG-04 · P1 · Ambiguità · §3 R4 (riga 21)**
Il documento non dice cosa sia un «abbonamento lungo». L'abbonamento si rinnova ogni settimana e non ha una durata, né un vincolo. Non si capisce nemmeno su cosa si applica lo sconto (ogni box o il totale), da quando, né se si perde dopo una sospensione.
Proposta: scegliere fra due strade. (a) Fedeltà: «Dalla [9ª] box pagata consecutiva in poi, ogni box costa il 10% in meno; le settimane sospese [non interrompono / interrompono] il conteggio.» (b) Impegno: «Il cliente può scegliere un impegno di [12] settimane con uno sconto del 10% su ogni box; [regole di recesso].» La scelta tocca prezzi e condizioni, quindi la decisione è tua. Prima di fissare il 10% conviene sentire Growth & Monetization (AIBPD).

**ALG-05 · P1 · Criteri mancanti · §4 US-04 (riga 33)**
US-04 non ha criteri di accettazione. Mancano la scadenza per la disdetta, cosa succede a una settimana già addebitata, la conferma e la possibilità di riattivare.
Proposta: «Dato un abbonamento attivo o sospeso, quando il cliente disdice entro il giovedì, allora non riceve box né addebiti dalla settimana successiva, vede la data dell'ultima consegna e riceve un'email di conferma. Se disdice dopo il giovedì, la consegna già programmata [viene consegnata e addebitata / viene annullata e rimborsata].»

**ALG-06 · P1 · Lacuna · tutto il documento**
Mancano regole essenziali per un abbonamento con pagamento ricorrente:
- prezzi delle due box, e se si mostrano prima della conferma;
- addebito non riuscito: nuovi tentativi, sospensione automatica, avviso al cliente;
- cambio dell'indirizzo di consegna, anche verso fuori Milano;
- assenza alla consegna;
- consenso all'addebito ricorrente e conservazione dei dati della carta (presso il fornitore di pagamento?).

Proposta: aggiungere le regole R6-R10 su questi punti. Il documento tratta dati personali (indirizzo, email, carta), quindi va preparato un handoff per Privacy & Compliance (AIPCA) con finalità, categorie di dati e fornitori (pagamento, notifiche).

### P2

**ALG-07 · P2 · Ambiguità · §2 e US-01 (righe 13, 27-28)**
«Milano» può voler dire il Comune o la Città metropolitana. Non si sa come si verifica l'indirizzo (CAP? elenco di zone?).
Proposta: «Area servita: CAP [elenco] del Comune di Milano. Un indirizzo con un CAP fuori elenco è fuori zona.»

**ALG-08 · P2 · Ambiguità sul target · §1 (riga 7)**
L'obiettivo cita «i clienti che oggi ordinano una box alla volta». Non è chiaro se anche i clienti nuovi possono abbonarsi e se l'ordine singolo resta disponibile.
Proposta: «Possono abbonarsi i clienti già registrati e quelli nuovi. L'ordine singolo [resta disponibile / viene dismesso].»

**ALG-09 · P2 · Requisito di soluzione e notifiche non definite · §3 R5 (riga 22)**
R5 indica una tecnologia (Firebase Cloud Messaging) ma non dice quali notifiche si mandano, quando e su quale canale. Inoltre US-01 parla di email, e FCM non manda email. Non è chiaro se il prodotto sia un'app, un sito o entrambi (NF1 parla di «pagine», NF2 di «app»).
Proposta: riscrivere R5 come requisito: «Il cliente riceve un avviso [push e/o email] per: addebito eseguito, addebito non riuscito, consegna in arrivo, sospensione o disdetta confermata. Gli avvisi non necessari si possono disattivare.» La tecnologia la sceglie la Software Agency (AISA) e la decisione va nel decision log. Va anche chiarito su quale piattaforma gira il prodotto.

**ALG-10 · P2 · Casi mancanti · US-01 (righe 27-28)**
Mancano i casi «carta non valida o rifiutata», «box piccola» e «cliente già abbonato». Non c'è nemmeno un criterio per la data della prima consegna (è la settimana successiva a quale scadenza?).
Proposta: aggiungere un criterio per ciascuno di questi casi, per esempio: «Dato un cliente con carta rifiutata, quando conferma, allora vede l'errore e l'abbonamento non viene creato.»

**ALG-11 · P2 · Casi mancanti · US-02 (riga 30)**
Mancano la durata massima della sospensione, come riprende l'abbonamento (in automatico alla fine del periodo?), la sospensione a tempo indeterminato, la scadenza (rimanda ad ALG-01) e l'effetto sullo sconto (ALG-04).
Proposta: «La sospensione dura da 1 a [N] settimane consecutive; alla fine l'abbonamento riprende da solo e il cliente riceve un avviso [X giorni] prima.»

**ALG-12 · P2 · Casi mancanti e formulazione incoerente · US-03 (riga 32)**
US-03 copre solo il passaggio dalla box piccola alla grande. Scrive «prima del giovedì», mentre R3 scrive «entro il giovedì»: non si capisce se il giovedì è compreso.
Proposta: «Dato un abbonamento attivo, quando il cliente cambia la dimensione (in un senso o nell'altro) entro il giovedì, allora dalla settimana successiva riceve la nuova box al suo prezzo; se la cambia dopo, il cambio vale dalla settimana ancora successiva.» La stessa dicitura va usata ovunque.

**ALG-13 · P2 · Lacuna · §4**
Mancano storie per vedere lo stato dell'abbonamento (prossima consegna, prossimo addebito, storico) e per aggiornare la carta.
Proposta: US-05 «Come cliente voglio vedere la prossima consegna e il prossimo addebito», US-06 «Come cliente voglio cambiare la carta», ognuna con i suoi criteri di accettazione.

**ALG-14 · P2 · Criterio da precisare · NF1 (riga 37)**
«Connessione 4G» non è una condizione ripetibile, e «le pagine» non sono elencate.
Proposta: «Le pagine di attivazione, gestione e disdetta hanno [LCP] < 2 s al 95° percentile, misurato con profilo di rete [4G definito: download/latenza] su [dispositivo di riferimento].»

### P3

**ALG-15 · P3 · Non verificabile · NF2 (riga 38)**
«Veloce e facile da usare» non si può verificare. La velocità è già coperta da NF1.
Proposta: «In un test con [5] clienti, almeno [4] completano attivazione, sospensione e disdetta senza aiuto in meno di [2] minuti ciascuna.» Per il test conviene coinvolgere la Web Design Agency (AIWDA).

**ALG-16 · P3 · Tracciabilità · tutto il documento**
Regole, storie e obiettivo non sono collegati fra loro: per esempio non si sa quali storie applicano R1 e R3, né come contribuiscono alla metrica. Non ci sono un decision log né uno storico delle versioni (siamo alla 0.3).
Proposta: aggiungere una matrice regola → storia → criterio → KPI e un decision log (per esempio: «R5: tecnologia da scegliere, non ancora decisa»).

**ALG-17 · P3 · Terminologia · tutto il documento**
Il documento usa sia «utente» (R2) sia «cliente» (storie).
Proposta: usare solo «cliente» e aggiungere un breve glossario: settimana di consegna, scadenza, sospensione, disdetta.

## Informazioni mancanti e decisioni che spettano a te

1. Calendario: giorno di consegna, quale settimana paga l'addebito del lunedì, scadenza esatta e fuso orario (ALG-01, ALG-02).
2. Definizione di «abbonamento lungo» e modello di sconto (ALG-04).
3. Definizione della retention, valore di partenza e obiettivo (ALG-03).
4. Prezzi, gestione degli addebiti non riusciti e regole di disdetta e rimborso (ALG-05, ALG-06).
5. Piattaforma (app, sito o entrambi) e canali delle notifiche (ALG-09).

Prima di passare al design propongo di risolvere ALG-01, 02, 03, 04, 05 e 06, poi di preparare l'handoff per Privacy & Compliance sui dati di pagamento e di indirizzo. Sono raccomandazioni, non decisioni approvate.

— ALGIEBA (AIBPD-05)
