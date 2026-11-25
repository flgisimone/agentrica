**AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist, reparto AIBPD (AI Business & Product Development)**

Il direttore AIBPD-01 · ALDERAMIN mi ha assegnato l'analisi di `requisiti.md` (versione 0.3, bozza). Ho letto solo `requisiti.md` e il `README.md` della cartella, in sola lettura. Non ho usato i tool di Agentrica, quindi la scheda di biblioteca `funzione-di-recesso` non l'ho letta. Il rilievo 6 la tocca e va completato con quella scheda prima di essere definitivo. Le proposte di riformulazione sono proposte: contengono valori inventati (soglie, importi, giorni) tra parentesi quadre, che l'utente deve confermare o sostituire.

## Esito

Il documento ha una struttura chiara, ma non è ancora pronto per il design. Ho trovato 15 rilievi: 1 contraddizione, 4 ambiguità o lacune che bloccano la scrittura dei test, 4 criteri non verificabili e 6 lacune di requisiti. La contraddizione sulla sospensione e la mancanza di criteri sulla disdetta sono i punti più urgenti. Il documento non ha un P0.

## Rilievi

### Contraddizioni

**1. R2 contro R3 sulla sospensione (P1)**
- Punto: R2 («in qualsiasi momento») e R3 («entro il giovedì per valere dalla settimana successiva»).
- Problema: R2 dice che la sospensione è possibile sempre, R3 dice che ha un termine. US-02 non dice quale delle due vale.
- Riformulazione:
  - R2. «L'utente può richiedere la sospensione in qualsiasi momento tramite [l'area cliente]».
  - R3. «La sospensione richiesta entro [giovedì ore 23:59, fuso Europe/Rome] ha effetto dalla consegna della settimana successiva. Se richiesta dopo, ha effetto dalla seconda settimana successiva».

### Ambiguità

**2. Calendario di addebito e di consegna non definito (P1)**
- Punto: R1, R3, US-02, US-03.
- Problema: la carta si addebita il lunedì, ma non si sa il giorno di consegna né a quale settimana si riferisce l'addebito (consegna della stessa settimana o della successiva).
- Conseguenze: il termine del giovedì in R3 e in US-03 non si lega all'addebito, e US-02 («non viene addebitato») non è verificabile. Non è specificato cosa succede a una settimana già addebitata e poi sospesa.
- US-03 dice «prima del giovedì» mentre R3 dice «entro il giovedì»: il giovedì è incluso o escluso?
- Riformulazione: aggiungere una regola «Ciclo settimanale» con il giorno e la fascia di consegna [es. sabato], l'addebito del lunedì per la box consegnata [il sabato successivo], e uno schema a tabella con addebito, termine e consegna. Uniformare «entro il giovedì [ore 23:59]» in R3 e US-03.

**3. R4 «abbonamenti lunghi» e «sconto del 10%» (P1)**
- Punto: R4.
- Problema: «lungo» non è definito (durata contrattuale o settimane già pagate?). Non è chiaro se il 10% si applichi al prezzo della box, a ogni addebito o una tantum, né da quando. Non si sa come si comporta con sospensioni e cambi di box.
- Mancano i prezzi di base delle due box, necessari anche per US-03 («al prezzo della grande»).
- Riformulazione: «Dalla [13ª] settimana consecutiva attiva, il prezzo della box ha lo sconto del 10% sul listino [piccola € X, grande € Y]. Le settimane sospese [contano / non contano] ai fini della soglia».

**4. R5 specifica una tecnologia e non un requisito (P2)**
- Punto: R5.
- Problema: dice come (Firebase Cloud Messaging) e non cosa. Non dice quali eventi generano notifiche né il canale. US-01 parla di email e FCM è per le push, ma il perimetro non menziona alcuna app.
- NF2 cita «l'app», che nel perimetro non c'è.
- Firebase è un fornitore che tratta dati personali. Va coinvolta Privacy & Compliance per ruolo, trasferimenti e base giuridica prima di fissarlo.
- Riformulazione: «Il cliente riceve una notifica per: conferma di attivazione, promemoria prima del termine di sospensione, esito dell'addebito, conferma di sospensione e di disdetta. Canale: [email / push]». La scelta di FCM passa a una decisione di architettura da confermare, con alternative.

**5. «Milano» non è definita (P2)**
- Punto: §2 e US-01.
- Problema: Milano come comune, come elenco di CAP o come zone di consegna? Cosa succede se il cliente cambia indirizzo dopo l'attivazione?
- Riformulazione: «La consegna è disponibile per indirizzi con CAP [elenco]. Il controllo avviene all'attivazione e a ogni cambio di indirizzo; un indirizzo non coperto sospende l'attivazione/blocca il cambio».

### Lacune

**6. US-04 senza criteri di accettazione e senza regole di disdetta (P1)**
- Punto: US-04.
- Problema: è l'unica storia senza scenari. Mancano:
  - effetto sulle settimane già addebitate;
  - rimborsi;
  - data di efficacia;
  - termine;
  - conferma al cliente.
- Non è chiara la differenza tra disdetta, sospensione e recesso. Va valutato il requisito sulla funzione di recesso nei contratti online (art. 54-bis Codice del consumo, scheda `funzione-di-recesso`, che ancora non ho consultato). Il requisito è da verificare con la scheda e, se serve, con la Privacy & Compliance Agency e un parere legale umano.
- Riformulazione:
  - «Dato un abbonamento attivo, quando il cliente sceglie Disdici e conferma, allora l'abbonamento termina [dalla prima consegna non ancora addebitata], non vengono più generati addebiti e riceve [un'email] con data di efficacia e riepilogo».
  - Aggiungere uno scenario sul termine del giovedì.
  - Il percorso di disdetta deve essere raggiungibile [con lo stesso numero di passaggi dell'attivazione]. La forma esatta va ricavata dalla scheda.

**7. Pagamento fallito o carta scaduta (P1)**
- Punto: R1, US-01 («carta valida»).
- Problema: nessuna regola per addebito rifiutato, carta scaduta o scadenza imminente: ritentativi, sospensione automatica, notifiche, box consegnata o no. Non è definito come si verifica la validità della carta all'attivazione.
- Riformulazione: «Se l'addebito fallisce, il sistema riprova [una volta entro 24 ore]. Se fallisce ancora, la box della settimana non viene consegnata, il cliente riceve una notifica e l'abbonamento passa a [sospeso per pagamento]».

**8. Cambio box: solo un verso e nessun caso limite (P2)**
- Punto: US-03.
- Problema: copre solo da piccola a grande. Non è descritto il passaggio inverso, il cambio dopo il termine, né il cambio con una sospensione già programmata.
- Riformulazione: aggiungere un secondo scenario «da grande a piccola» e uno «dopo il giovedì», con effetto dalla seconda settimana successiva.

**9. Sospensione: limiti e casi non coperti (P2)**
- Punto: US-02, R2.
- Problema: non c'è un massimo di settimane o di sospensioni consecutive. Non è definito cosa succede alla fine delle settimane scelte (ripresa automatica?) né se la sospensione si può annullare o modificare.
- Riformulazione: «La sospensione può coprire fino a [N] settimane consecutive; al termine l'abbonamento riprende automaticamente. Il cliente può modificarla o annullarla entro il termine di R3».

**10. Obiettivo e metrica senza baseline né soglie (P1)**
- Punto: §1, «aumentare la retention dei clienti».
- Problema: non è verificabile. Mancano la definizione di retention, il valore di partenza, il target, il periodo e la coorte (clienti attuali che passano all'abbonamento, o anche nuovi?).
- Riformulazione: «Entro [6 mesi] dal lancio, la quota di clienti ancora attivi dopo [90 giorni] dall'attivazione passa da [baseline, non nota] a [target]. Misura: [fonte]». Il documento non contiene la baseline e non posso stimarla.

**11. Perimetro: nuovi clienti e account (P2)**
- Punto: §1 e §2.
- Problema: §1 parla di «clienti che oggi ordinano una box alla volta». Non è chiaro se i nuovi clienti possano abbonarsi, se serva un account, come si gestisce un ordine singolo in corso o la migrazione dei clienti esistenti.
- Riformulazione: aggiungere «Destinatari» e una nota sull'identità e l'autenticazione del cliente.

### Criteri non verificabili

**12. NF2 «veloce e facile da usare» (P2)**
- Punto: NF2.
- Problema: non è misurabile, e «l'app» non è definita (vedi rilievo 4). La velocità è già coperta da NF1.
- Riformulazione: «Un cliente nuovo completa l'attivazione in [al massimo 5 passaggi / 3 minuti] in una prova con [5] utenti, senza assistenza». Il tema accessibilità/usabilità va passato alle agenzie design.

**13. NF1: perimetro e metodo non chiari (P3)**
- Punto: NF1.
- Problema: il percentile e la rete sono indicati, ma «pagine dell'abbonamento» non è definito. Manca la metrica (LCP, TTFB, caricamento completo) e il dispositivo.
- Riformulazione: «LCP ≤ 2 s al 95° percentile su 4G [profilo da definire] per [attivazione, gestione abbonamento, disdetta]».

**14. US-01: «la prima consegna è indicata con la data» e email di conferma (P3)**
- Punto: US-01.
- Problema: la regola per calcolare la data della prima consegna non è nel documento, quindi il criterio non è verificabile. Non è definito il contenuto minimo dell'email e il tempo di invio.
- Riformulazione: «La prima consegna è il [primo sabato disponibile dopo il termine di R3]; l'email, entro [5 minuti], contiene box scelta, prezzo, data e come sospendere/disdire».

**15. Requisiti non funzionali assenti e tracciabilità (P2)**
- Punto: §5 e struttura del documento.
- Problema: sono assenti requisiti su sicurezza dei pagamenti, protezione dei dati (indirizzo, carta), disponibilità e accessibilità.
- Le regole non sono collegate alle storie e agli obiettivi: manca una matrice di tracciabilità (obiettivo → regole → storie → criteri → metrica).
- Il trattamento di dati personali (indirizzi, pagamenti) richiede il coinvolgimento della Privacy & Compliance Agency.
- Riformulazione: aggiungere NF su sicurezza e privacy [da definire con la Privacy & Compliance Agency], disponibilità [da definire] e accessibilità [livello da definire]. Aggiungere la matrice di tracciabilità.

## Domande aperte per l'utente

1. Giorno e fascia di consegna, prezzi delle due box e definizione di «abbonamento lungo» (rilievi 2, 3).
2. Retention: definizione, baseline, target e orizzonte (rilievo 10).
3. Esistono già regole su rimborsi e disdetta? Vanno confrontate con la scheda `funzione-di-recesso` (rilievo 6).
4. Il canale delle notifiche è email, push o entrambi, e c'è un'app? Firebase è una scelta già presa o da valutare (rilievo 4)?
5. Zone di consegna: elenco di CAP o altro criterio (rilievo 5).

## Prossimi passi proposti (da confermare)

- Le decisioni su prezzi, sconti, tempi e scelta di Firebase richiedono la conferma dell'utente. Nessuna è stata presa.
- Passaggio di consegne proposto: Privacy & Compliance Agency (dati personali, fornitore Firebase, recesso), Web Design Agency (flussi di sospensione, cambio e disdetta; usabilità), Software Agency (solo dopo requisiti chiariti).
- Prima di dare il documento per definitivo, ricontrollare i rilievi P1 (1, 2, 3, 6, 7, 10) con il direttore del reparto o con un revisore su Opus, se questa analisi è girata su un modello più piccolo di quello della sessione. Il rilievo 6 va in ogni caso completato con la scheda di biblioteca.

AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist
