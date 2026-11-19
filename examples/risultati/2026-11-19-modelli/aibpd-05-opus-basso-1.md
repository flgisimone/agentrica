AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist, reparto AIBPD (AI Business & Product Development)

# Revisione dei requisiti di «Orto in Box» (requisiti.md, v0.3, bozza)

Ho esaminato `requisiti.md` (38 righe) e `README.md`. Il README dice che servizio, azienda e numeri sono inventati, quindi tutti i rilievi riguardano solo il testo del documento. Non ho modificato nessun file. Le riformulazioni qui sotto sono proposte, e i valori tra parentesi quadre li deve decidere l'utente.

## Sintesi

- Sono 18 rilievi: 1 P0, 7 P1, 7 P2 e 3 P3.
- Il blocco più grave riguarda il calendario. R2 e R3 si contraddicono, e il giorno di consegna non è mai indicato. Senza quel giorno non si può verificare la relazione fra l'addebito del lunedì (R1), la scadenza del giovedì (R3) e «la settimana successiva» (US-02, US-03).
- La metrica di successo non si può misurare. Lo sconto R4 si basa su una durata che il documento non definisce. La disdetta (US-04) non ha criteri di accettazione.
- Mancano parti importanti: prezzi, pagamento non riuscito, passaggio dalla box grande alla piccola, area servita e dati personali.

## Rilievi

| ID | Punto | Tipo | Priorità | Problema | Proposta di riformulazione |
|---|---|---|---|---|---|
| ALG-01 | §3 R2 contro R3 | Contraddizione | P0 | R2 dice che si può sospendere «in qualsiasi momento». R3 dice che la sospensione vale solo se richiesta entro il giovedì. Così non si sa cosa succede a una richiesta fatta di venerdì. | «R2. Il cliente può chiedere la sospensione in qualsiasi momento. La sospensione vale dalla prima consegna la cui scadenza (R3) non è ancora passata.» |
| ALG-02 | §3 R1, R3; US-02, US-03 | Lacuna | P0 (insieme ad ALG-01) | Manca il giorno di consegna. Non si sa se l'addebito del lunedì paga la consegna di quella settimana o della successiva. «Settimana successiva» non ha un riferimento. | Aggiungere: «R0. La consegna avviene il [giorno]. L'addebito del lunedì copre la consegna del [giorno] della [stessa / successiva] settimana.» Allineare R3 e le US a questo calendario. |
| ALG-03 | §3 R3 | Ambiguità | P1 | «Entro il giovedì» non dice se il giovedì è compreso, a che ora scade e con quale fuso orario. | «Le richieste ricevute entro giovedì alle [23:59, ora di Roma] valgono dalla consegna della settimana successiva. Quelle ricevute dopo valgono dalla consegna di quella seguente.» |
| ALG-04 | US-03 contro R3 | Contraddizione | P1 | US-03 dice «prima del giovedì», R3 dice «entro il giovedì». Le due formule danno risultati diversi per una richiesta fatta di giovedì. | Usare un'unica scadenza, definita in R3, e richiamarla in US-03: «se la modifica arriva entro la scadenza di R3». |
| ALG-05 | §1 Metrica di successo | Criterio non verificabile | P1 | «Aumentare la retention» non dice come si definisce la retention, qual è il valore di partenza, qual è l'obiettivo e in quale periodo. | «La retention a [8] settimane degli abbonati passa da [baseline dei clienti a ordine singolo] a [x%] entro [n] mesi dal lancio. Retention = clienti con almeno una consegna nella settimana [8] / clienti attivati nella coorte.» |
| ALG-06 | §3 R4 | Ambiguità e contraddizione | P1 | Non è definito cosa sia un «abbonamento lungo». R1 descrive un abbonamento a rinnovo settimanale, senza durata minima. Non si sa a cosa si applica il 10%, se le sospensioni azzerano il conteggio e cosa succede con una disdetta anticipata. | Scegliere fra (a) un piano con impegno di [n] settimane e lo sconto sul prezzo settimanale, con regole per il recesso anticipato, oppure (b) uno sconto fedeltà dopo [n] consegne pagate consecutive, con le sospensioni che [interrompono / non interrompono] il conteggio. In alternativa, togliere R4 da questa versione. |
| ALG-07 | §4 US-04 | Lacuna (criteri mancanti) | P1 | Non ci sono criteri di accettazione. Mancano la scadenza, la sorte dell'addebito già fatto, la conferma al cliente e il destino delle sospensioni programmate. | «Dato un abbonamento attivo, quando il cliente conferma la disdetta entro la scadenza di R3, allora non riceve più addebiti né consegne dalla settimana successiva e riceve un'email di conferma. Se la disdetta arriva dopo la scadenza, [riceve / non riceve] l'ultima box già addebitata.» |
| ALG-08 | Tutto il documento | Lacuna | P1 | Mancano i prezzi della box piccola e della grande, IVA e spese di consegna. Senza prezzi non si possono verificare US-03 («al prezzo della grande») e R4. | Aggiungere una tabella con i prezzi (o un rimando al listino) e dire se lo sconto e la consegna ne fanno parte. |
| ALG-09 | §3 R1 | Lacuna | P1 | Non è previsto il caso di un addebito non riuscito: tentativi, sospensione automatica, avviso al cliente, consegna sì o no. Lo stesso vale per una carta scaduta. | «R1b. Se l'addebito del lunedì fallisce, il sistema [riprova n volte entro ...], avvisa il cliente e, se il pagamento non va a buon fine entro [termine], non consegna la box e [sospende / disdice] l'abbonamento.» |
| ALG-10 | §3 R5 | Soluzione al posto di un requisito, e ambiguità | P2 | R5 indica una tecnologia, ma non dice quali notifiche servono, quando partono, su quale canale e con quale consenso. Firebase Cloud Messaging fa notifiche push, mentre US-01 parla di email. Non è nemmeno chiaro se il prodotto sia un'app o un sito: NF1 parla di «pagine», NF2 di «app». | «R5. Il cliente riceve [email / push] per: attivazione, promemoria della scadenza del giovedì, addebito, pagamento fallito, sospensione, disdetta.» Lasciare la scelta dello strumento alla Software Agency e precisare il canale (app, web o entrambi). |
| ALG-11 | §2 e US-01, secondo criterio | Ambiguità | P2 | «Indirizzo a Milano» non dice se si intende il Comune, la città metropolitana o un elenco di CAP. Non si sa nemmeno come si verifica. | «Area servita: CAP [elenco] del Comune di Milano. La verifica avviene sul CAP dell'indirizzo di consegna.» |
| ALG-12 | US-01, primo criterio | Ambiguità e lacuna | P2 | Non si dice come si calcola la data della prima consegna né quando parte il primo addebito. «Carta valida» non è definita (verifica, autorizzazione, 3-D Secure). C'è un criterio solo per la box grande. | Indicare la regola per la prima consegna, cioè la prima consegna utile secondo la scadenza di R3, e la data del primo addebito. Definire «carta valida» come «autorizzazione riuscita presso il fornitore di pagamento». Aggiungere un criterio per la box piccola e uno per una carta rifiutata. |
| ALG-13 | US-02 | Lacuna | P2 | Mancano diverse regole: la durata massima della sospensione, il numero di settimane, la ripresa automatica, la modifica o l'annullamento di una sospensione e la richiesta fuori scadenza. Il criterio inoltre non richiama R3. | «Dato un abbonamento attivo, quando il cliente sceglie da 1 a [n] settimane, tutte successive alla scadenza di R3, e conferma, allora in quelle settimane non riceve la box né addebiti, e l'abbonamento riprende in automatico la settimana dopo. Le settimane non selezionabili sono indicate.» |
| ALG-14 | US-03 | Lacuna | P2 | C'è solo il passaggio dalla box piccola alla grande. Manca il passaggio inverso e manca il caso di una modifica fatta dopo la scadenza. Non si dice se l'importo cambia già con l'addebito del lunedì. | Aggiungere i criteri per il passaggio dalla grande alla piccola e per una modifica dopo la scadenza («vale dalla consegna di quella seguente»). Indicare in quale addebito entra il nuovo prezzo. |
| ALG-15 | §5 NF1 | Criterio poco verificabile | P2 | Non si dice quali pagine contano, quale misura si usa (per esempio LCP), su quale dispositivo né quale profilo di rete corrisponde a «4G». | «Le pagine [attivazione, gestione abbonamento] hanno LCP < 2 s al 95° percentile, misurato con [strumento] su [dispositivo] e profilo di rete [x Mbps / y ms RTT].» |
| ALG-16 | §5 NF2 | Criterio non verificabile | P3 | «Veloce e facile da usare» non si può misurare. La parte sulla velocità ripete NF1. | Togliere «veloce» (lo copre NF1). Sostituire «facile» con un criterio misurabile, per esempio «in un test con [n] utenti, almeno l'[x%] attiva l'abbonamento senza aiuto entro [m] minuti», oppure con un rimando ai rilievi della Web Design Agency. |
| ALG-17 | Tutto il documento | Lacuna | P3 | Mancano altri flussi: cambio dell'indirizzo o della carta, riattivazione dopo una disdetta, passaggio dei clienti che oggi ordinano una box alla volta (citati in §1), assenza alla consegna e box mancante. | Valutare se rientrano in questa versione. Se no, scriverli in «Fuori perimetro» in §2. |
| ALG-18 | Tutto il documento | Lacuna (privacy e sicurezza) | P3 da descrivere, valutazione alla Privacy & Compliance Agency | Il servizio tratta dati personali: indirizzo, email, dati della carta, eventuali token push. Il documento però non dice nulla su fornitore di pagamento, conservazione dei dati, consenso alle notifiche e comunicazioni di marketing. | Aggiungere una sezione «Dati e fornitori» con le categorie di dati, le finalità e i fornitori previsti (pagamenti, email, push), e preparare il passaggio alla Privacy & Compliance Agency. |

## Matrice di tracciabilità (attuale)

| Elemento | Obiettivo §1 | Regole | Criteri di accettazione | Note |
|---|---|---|---|---|
| US-01 | sì | R1, R5 | 2 | manca la box piccola, manca la carta rifiutata |
| US-02 | sì | R2, R3 | 1 | non richiama la scadenza |
| US-03 | sì | R3 (con un'altra formula) | 1 | manca il passaggio grande → piccola |
| US-04 | sì | nessuna | 0 | da completare |
| R4 | indiretto | nessuna US | 0 | nessuna storia lo implementa |
| R5 | nessuno | nessuna US | 0 | indica uno strumento, non un bisogno |

## Decisioni richieste all'utente

1. Il giorno di consegna e quale settimana copre l'addebito del lunedì (ALG-02).
2. La regola unica di scadenza, con giorno, ora e fuso, e il comportamento di R2 fuori scadenza (ALG-01, 03, 04).
3. Cosa significa «abbonamento lungo», oppure se togliere R4 da questa versione (ALG-06).
4. La definizione della metrica di retention, con valore di partenza e obiettivo (ALG-05).
5. Prezzi, gestione dei pagamenti falliti e regole della disdetta (ALG-07, 08, 09).
6. Il canale del prodotto (app o web) e quali notifiche inviare (ALG-10).

Livello di confidenza: alto per contraddizioni e lacune, perché sono verificabili nel testo. Le proposte sono indicative e dipendono dalle decisioni elencate sopra. Le riformulazioni non sono state applicate al documento: lo si può fare dopo la conferma dell'utente.

— ALGIEBA (AIBPD-05)
