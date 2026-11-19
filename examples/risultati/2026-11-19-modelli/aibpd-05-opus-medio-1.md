«AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist, reparto AIBPD (AI Business & Product Development)»

# Analisi dei requisiti: `requisiti.md` (Orto in Box v0.3, bozza)

Ho letto `README.md` e `requisiti.md`. Il README dice che il progetto è di prova e che servizio, azienda e numeri sono inventati. Questa analisi riguarda solo il testo del documento: non ho dati esterni e non ne aggiungo. Non ho modificato nessun file. Le riformulazioni qui sotto sono proposte da confermare: i valori tra [parentesi quadre] li deve decidere l'utente. Nessun rilievo è P0. Il documento si può correggere prima del design senza fermare niente.

## Sintesi

- **US-01** e **NF1** sono già quasi verificabili.
- **P1**:
  - la metrica di successo non si può misurare;
  - lo «sconto per abbonamenti lunghi» non ha un oggetto, perché l'abbonamento non ha una durata;
  - R2 e R3 si contraddicono;
  - la disdetta (US-04) non ha criteri di accettazione;
  - manca una regola per il pagamento non riuscito;
  - non si sa se il prodotto è un'app o un sito: R5 e NF2 dicono «app», NF1 dice «pagine».
- **P2**: le altre lacune sui confini (cutoff, giorno di consegna, prezzi, cambio verso la box piccola).
- **P3**: requisiti tecnici scritti come regole di business.

## Rilievi

| ID | Punto | Tipo | Priorità | Problema | Proposta di riformulazione |
|---|---|---|---|---|---|
| A-01 | §1, metrica di successo | Criterio non verificabile | P1 | «Aumentare la retention» non dice come si definisce, quale sia il valore di partenza, il target e in quanto tempo. | «Quota di abbonati attivi a [8/12] settimane dall'attivazione ≥ [X]%, misurata a [data]. Confronto: la quota di clienti a ordine singolo che riordina entro [8] settimane, oggi [Y]%». Il numero di partenza va misurato, non stimato. |
| A-02 | §1, target | Ambiguità | P2 | L'abbonamento è per «i clienti che oggi ordinano una box alla volta». Non si capisce se i clienti nuovi sono esclusi. US-01 dice solo «cliente». | «Possono attivarlo i clienti già registrati e i nuovi clienti [sì/no] con indirizzo nella zona servita». |
| A-03 | §2, «Milano» | Ambiguità | P2 | Non dice se è il Comune o l'area metropolitana. Il criterio di US-01 «fuori Milano» non è verificabile senza un elenco. | «Zona servita: CAP elencati nell'allegato [Z] (Comune di Milano)». |
| A-04 | §2, «pagamento con carta» | Lacuna | P2 | Non dice quali circuiti, né se la carta viene salvata per gli addebiti successivi. | «Carte di credito e debito [circuiti], salvate tramite il fornitore di pagamento per l'addebito ricorrente». |
| A-05 | §2 e §3 | Lacuna | P2 | Mancano i prezzi delle box, il giorno e la fascia di consegna. US-03 cita «il prezzo della grande» ma il prezzo non è definito da nessuna parte. | Aggiungere «Box piccola [€], box grande [€], IVA inclusa. Consegna il [giorno], fascia [orari]». |
| A-06 | R1 | Lacuna | P1 | Non dice a quale consegna si riferisce l'addebito del lunedì, né cosa succede se l'addebito fallisce. Senza il giorno di consegna non si può verificare la coerenza con il cutoff del giovedì (R3). | «Ogni lunedì si addebita la box della consegna del [giorno] della stessa settimana. Se l'addebito fallisce: [N] tentativi in [N] giorni, avviso al cliente; dopo l'ultimo tentativo la consegna della settimana non parte e l'abbonamento va in stato [sospeso per pagamento]». |
| A-07 | R2 e R3 | Contraddizione | P1 | R2 dice «in qualsiasi momento», R3 fissa una scadenza. La sospensione non ha durata massima né regola di ripresa. | «Il cliente può chiedere una sospensione in qualsiasi momento. Vale dalla prima consegna il cui cutoff (giovedì alle [ore], ora italiana) non è ancora passato. Una sospensione chiesta dopo il cutoff vale dalla settimana dopo. Durata da 1 a [N] settimane consecutive, poi l'abbonamento riprende da solo». |
| A-08 | R3 e US-03 | Contraddizione | P2 | R3 dice «entro il giovedì» (giovedì incluso), US-03 dice «prima del giovedì» (escluso). | Un solo cutoff, definito una volta e citato da R3, US-02, US-03 e US-04: «giovedì alle [ore] della settimana prima della consegna». |
| A-09 | R4 | Ambiguità e lacuna | P1 | Il §1 e R1 descrivono un abbonamento settimanale senza durata, quindi un «abbonamento lungo» non esiste. Non si sa su cosa si calcola il 10%, da quando si applica e cosa succede con sospensioni, disdette e cambi di box. Il perimetro (§2) non cita piani con impegno. | Prima va presa una decisione: tenere R4 o toglierla da questa versione. Se resta: «Piano con impegno di [N] settimane: 10% sul prezzo della box, applicato a ogni addebito del periodo. Le sospensioni [allungano/non allungano] l'impegno. Disdetta prima della scadenza: [regola]». |
| A-10 | R5 | Requisito tecnico tra le regole, contraddizione | P3 / P1 | Firebase Cloud Messaging è una scelta di implementazione, non una regola di business, e non dice quali notifiche si inviano. FCM serve per le notifiche push di un'app, mentre US-01 usa l'email e NF1 parla di «pagine». Non è chiaro se il canale è un'app, un sito o tutti e due (P1). | Spostare FCM tra i vincoli tecnici e il decision log. Come regola: «Il cliente riceve [email/push] per attivazione, addebito riuscito o fallito, sospensione, ripresa, cambio box e disdetta». Dire nel §2 se il canale è un sito, un'app o tutti e due. |
| A-11 | US-01 | Lacuna | P2 | Copre solo la box grande e il caso fuori zona. Mancano: carta rifiutata, cliente già abbonato, regola per la data della prima consegna, momento del primo addebito. | Aggiungere: «Dato un cliente con carta rifiutata… allora l'abbonamento non viene creato e vede il motivo»; «La prima consegna è la prima il cui cutoff non è passato al momento della conferma»; «Un cliente con un abbonamento attivo non può attivarne un secondo [o sì, per indirizzi diversi]». |
| A-12 | US-02 | Lacuna | P2 | Manca il caso della richiesta dopo il cutoff, e manca il limite alle settimane. Non dice se il cliente vede o riceve una conferma. | Aggiungere: «Se la richiesta arriva dopo il cutoff, la settimana in corso viene consegnata e addebitata e la sospensione parte dalla successiva; il cliente lo vede prima di confermare»; «Riceve la conferma con le date di sospensione e di ripresa». |
| A-13 | US-03 | Lacuna e ambiguità | P2 | Descrive solo il passaggio dalla piccola alla grande. Mancano il passaggio inverso, il cambio dopo il cutoff, l'effetto sullo sconto (R4) e il testo «dalla settimana successiva» (a cosa?). | «Quando il cliente cambia dimensione (in tutte e due le direzioni) entro il cutoff, la consegna successiva e il suo addebito usano la nuova box e il suo prezzo. Dopo il cutoff, il cambio vale dalla consegna dopo. Il cliente vede da quale data». |
| A-14 | US-04 | Criteri mancanti | P1 | Non ha criteri di accettazione. Mancano: tempi rispetto al cutoff, settimana già addebitata, rimborsi, conferma, riattivazione, sorte dei dati. | «Dato un abbonamento attivo, quando il cliente disdice entro il cutoff, non riceve consegne né addebiti successivi e riceve la conferma. Dopo il cutoff riceve e paga l'ultima box già programmata. La disdetta è possibile in [N] passaggi, senza contattare l'assistenza». Per i dati, vedere l'handoff privacy. |
| A-15 | NF1 | Parzialmente verificabile | P2 | Non dice quali pagine sono «dell'abbonamento», come si misura «si caricano» (quale metrica), il profilo 4G né l'ambiente di misura. | «Le pagine [elenco] hanno LCP < 2 s al 95° percentile, misurato con [strumento] su profilo [banda/latenza] e dispositivo [classe], [lab / dati reali]». |
| A-16 | NF2 | Criterio non verificabile | P1 | «Veloce e facile da usare» non si può misurare. Dice anche «app» (vedi A-10). | Sostituirlo con criteri misurabili, ad esempio: «In un test con [N] utenti, il [X]% attiva l'abbonamento senza aiuto in meno di [N] minuti»; «Rispetto di WCAG 2.2 AA»; per la velocità vale NF1. |
| A-17 | Generale | Lacuna | P2 | Mancano: stakeholder e responsabili, processo AS-IS (ordine singolo) e TO-BE, clienti già esistenti, cambio di indirizzo (anche fuori zona), settimane festive, prodotti non disponibili, assistenza. Manca anche un registro delle decisioni. | Aggiungere le sezioni «Stakeholder», «Processo AS-IS/TO-BE», «Casi eccezionali» e «Decision log» con data e responsabile di ogni decisione. |

## Matrice di tracciabilità (oggi)

| Obiettivo §1 | Regola | User story | Criteri | Stato |
|---|---|---|---|---|
| Retention (non misurabile, A-01) | R1 | US-01 | 2 | parziale (A-06, A-11) |
| | R2, R3 | US-02 | 1 | in contraddizione (A-07, A-08, A-12) |
| | – | US-03 | 1 | parziale (A-13) |
| | – | US-04 | 0 | mancante (A-14) |
| | R4 | nessuna | – | regola senza story (A-09) |
| | R5 | nessuna (US-01 usa l'email) | – | in contraddizione (A-10) |

Nessuna user story è collegata in modo esplicito alla metrica di retention. Dopo A-01 conviene indicare per ogni story come contribuisce, ad esempio la sospensione al posto della disdetta.

## Handoff proposti (da attivare solo se l'utente lo chiede)

- **Privacy & Compliance (AIPCA)**:
  - indirizzi, email e carta salvata per l'addebito ricorrente;
  - notifiche push (FCM, fornitore extra-UE da valutare);
  - conservazione dei dati dopo la disdetta;
  - consenso alle comunicazioni diverse da quelle di servizio.
- **Web Design (AIWDA)**: dopo la revisione, servono i flussi di attivazione, sospensione, cambio box e disdetta, con il cutoff mostrato in modo chiaro.

## Decisioni che spettano all'utente

1. La definizione e il target della metrica di retention (A-01).
2. Se tenere lo sconto R4 in questa versione e su quale piano (A-09).
3. Il canale: sito, app o tutti e due, che decide anche R5 e NF2 (A-10, A-16).
4. Il cutoff unico, il giorno di consegna, i prezzi e la regola per il pagamento fallito (A-05, A-06, A-08).
5. La regola di disdetta e dei rimborsi (A-14).

Finché queste decisioni mancano, i requisiti non sono pronti per il design.

Firmato: AIBPD-05 · ALGIEBA