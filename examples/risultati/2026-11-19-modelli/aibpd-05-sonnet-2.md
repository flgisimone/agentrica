AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist, reparto AIBPD (AI Business & Product Development)

# Analisi dei requisiti: «Orto in Box», abbonamento settimanale (requisiti.md v0.3, bozza)

Ho analizzato solo requisiti.md; non ho modificato file né contattato nessuno. Le proposte di riformulazione sono raccomandazioni, non decisioni: i valori tra parentesi quadre sono ipotesi da far confermare al responsabile del prodotto. Le sigle P0-P3 sono le priorità comuni del reparto.

## Sintesi

12 rilievi: 0 P0, 7 P1, 4 P2, 1 P3. Le questioni più importanti: la metrica di successo non è misurabile (§1), la regola di addebito (R1) contraddice la scadenza di sospensione (R3), «abbonamenti lunghi» (R4) non è definito, e US-04 (disdetta) non ha criteri di accettazione. Mancano pagamento fallito, prezzi, orari di consegna e un requisito su dati personali/pagamenti.

## Contraddizioni

**C1 · P1 · R1 vs R2 vs R3 (§3): "in qualsiasi momento" contro la scadenza del giovedì.**
R2 dice che si sospende in qualsiasi momento; R3 dice che va richiesto entro il giovedì per valere dalla consegna della settimana successiva. Le due regole non possono valere insieme. In più R1 addebita il lunedì: non è chiaro se la sospensione richiesta il venerdì o il lunedì dopo l'addebito dia diritto a un rimborso, né quando cade la consegna rispetto all'addebito.
Riformulazione: «R2. Il cliente può richiedere la sospensione in qualsiasi momento. R3. La sospensione richiesta entro giovedì [ora, fuso Europe/Rome] vale dalla settimana successiva; se richiesta dopo, la settimana successiva è comunque addebitata e consegnata [oppure rimborsata: da decidere]».

**C2 · P1 · US-02 (§4) vs R3: criterio di accettazione senza il vincolo del giovedì.**
Il criterio dice che nelle settimane scelte il cliente non riceve la box e non è addebitato, senza dire che la scelta vale solo se fatta entro il giovedì precedente. Se il cliente sceglie la settimana corrente dopo il giovedì il criterio è violato dalla regola R3.
Riformulazione: aggiungere «Dato che è giovedì alle [ora] o prima... allora la settimana successiva è sospesa» e «Dato che è dopo il giovedì [ora], quando sceglie la settimana successiva, allora vede che la prima settimana sospendibile è quella dopo e la richiesta non è accettata per la settimana corrente».

**C3 · P2 · §1 (Obiettivo) vs §2 (Perimetro): «i clienti» contro Milano.**
L'obiettivo è lanciare l'abbonamento «per i clienti che oggi ordinano una box alla volta», ma il perimetro esclude chi è fuori Milano. Non è chiaro se il successo si misura su tutta la base o solo sui clienti milanesi.
Riformulazione: «...per i clienti con indirizzo di consegna a Milano che oggi ordinano una box alla volta», e la metrica calcolata su quel gruppo.

## Ambiguità

**A1 · P1 · R4 (§3): «abbonamenti lunghi» e «sconto del 10%».**
Non è definito cosa sia un abbonamento lungo (durata minima? impegno contrattuale? settimane già pagate?), su cosa si applichi il 10% (box, totale, solo box grande?), da quando, se si perde sospendendo o cambiando box (US-02, US-03), e se è cumulabile con altro. Impatta il prezzo mostrato al cliente.
Riformulazione: «R4. Dopo [N] settimane consecutive di abbonamento attivo [ipotesi: da confermare], ogni addebito successivo ha il 10% di sconto sul prezzo della box. Le settimane sospese [contano / non contano / azzerano] il conteggio. Il cambio di box [mantiene / azzera] lo sconto».

**A2 · P1 · R1 (§3): «si rinnova ogni settimana» e «addebitata il lunedì».**
Mancano: orario, fuso, giorno di consegna (prima o dopo l'addebito), importo addebitato (prezzo della box corrente o prezzo del rinnovo), cosa accade se il lunedì è festivo. Nel documento non esistono prezzi delle box.
Riformulazione: «R1. Ogni lunedì alle [ora, Europe/Rome] la carta è addebitata dell'importo della box della settimana di consegna [giorno di consegna: da definire]. Prezzi: piccola [€], grande [€]».

**A3 · P2 · US-01 (§4): «carta valida».**
Non è definito come si verifica (autorizzazione di prova? 3-D Secure?) né quando; né cosa vede il cliente se la carta è rifiutata. Alla prima consegna manca la regola per la scelta della data (primo giorno utile? cutoff?).
Riformulazione: «Dato un cliente con carta rifiutata o con autenticazione non completata, quando conferma, allora vede il motivo del rifiuto e l'abbonamento non viene creato. La prima consegna è la prima data utile successiva al cutoff [giovedì?]».

**A4 · P2 · US-03 (§4): «prima del giovedì» e «prezzo della grande».**
«Prima del giovedì» è ambiguo (fino a mercoledì o fino a giovedì, e a che ora?) e diverso da R3 («entro il giovedì»). Non c'è il caso inverso (grande → piccola), né l'effetto sullo sconto di R4.
Riformulazione: usare la stessa soglia di R3 («entro giovedì [ora]»), coprire entrambe le direzioni e dire se il prezzo cambia anche per l'addebito del lunedì già eseguito.

**A5 · P3 · §2 (Perimetro): «indirizzo di consegna a Milano».**
Non è chiaro se si intenda il comune o una zona servita (CAP, area di consegna), e come si gestisce un cliente che cambia indirizzo dopo l'attivazione.
Riformulazione: «Zona servita: CAP [elenco]»; «Se il cliente modifica l'indirizzo fuori zona, l'abbonamento è [sospeso / bloccato] e il cliente è avvisato».

## Lacune

**L1 · P1 · US-04 (§4): nessun criterio di accettazione.**
La disdetta non ha criteri verificabili. Mancano: quando ha effetto (rispetto a R3 e all'addebito del lunedì), cosa succede alle settimane già pagate, conferma all'utente, possibilità di riattivare.
Riformulazione: «Dato un abbonamento attivo, quando il cliente disdice entro giovedì [ora] e conferma, allora non riceve né è addebitato dalla settimana successiva, e riceve un'email di conferma con la data di fine. Dato che disdice dopo giovedì, allora l'ultima box è quella della settimana successiva [da confermare]».

**L2 · P1 · Pagamento fallito e rinnovo (§3, §4): nessuna regola.**
Manca cosa accade se l'addebito del lunedì fallisce (carta scaduta, fondi insufficienti): nuovi tentativi, avvisi, consegna sì/no, sospensione automatica. Rischio diretto sui ricavi.
Proposta: aggiungere R6 «In caso di addebito fallito il sistema riprova [N volte, a intervalli] e avvisa il cliente; se non riesce l'abbonamento è [sospeso] e la box non è consegnata», con criterio di accettazione.

**L3 · P2 · R5 (§3): Firebase Cloud Messaging è una scelta di soluzione, non un requisito.**
Non dice quali eventi generano notifiche (conferma, addebito, sospensione, errore di pagamento), con quale canale (push, email: US-01 cita già l'email) né se serve il consenso. FCM invia push a un'app, ma non è definito che esista un'app (NF2 dice «app», il resto parla di «pagine»). Inoltre introduce un fornitore esterno che tratta dati personali: va passato a Privacy & Compliance.
Riformulazione: «R5. Il cliente riceve una notifica per: attivazione, addebito, sospensione, disdetta, pagamento fallito [canali: da definire]». La scelta di FCM va spostata nei vincoli tecnici, con l'ok della Software Agency e della privacy.

**L4 · P1 · Dati personali e pagamenti (assente).**
Il documento tratta indirizzo, email e dati della carta ma non ha requisiti su: chi tratta i pagamenti (fornitore), dati conservati, consensi, informativa, cancellazione alla disdetta. Da passare a Privacy & Compliance prima dello sviluppo.

**L5 · P2 · Altre lacune da confermare con il responsabile del prodotto.**
Mancano: prezzi, giorno e fascia oraria di consegna, assenza del cliente alla consegna, prodotti non disponibili/stagionalità, limite di sospensioni consecutive, ruoli (chi gestisce eccezioni lato operatore), storico e ricevute. Non sono richieste tutte per la v0.3, ma vanno dichiarate dentro o fuori perimetro in §2.

## Criteri non verificabili

**V1 · P1 · §1: «aumentare la retention dei clienti».**
Nessuna definizione di retention, valore di partenza, obiettivo, orizzonte e metodo di misura. Non si può dire se il lancio ha avuto successo.
Riformulazione: «Entro [N] mesi dal lancio, la quota di clienti attivi che ordinano nel mese [X] dopo il primo ordine sale da [baseline] a [obiettivo], misurata sugli ordini del sistema, per i clienti di Milano». Baseline e obiettivo non sono nel documento: vanno forniti dal proprietario del prodotto, non stimati qui.

**V2 · P1 · NF2: «veloce e facile da usare».**
Non misurabile. Inoltre «app» non è coerente con NF1 («pagine») e con il resto del testo.
Riformulazione: «Un cliente nuovo completa l'attivazione (US-01) in al massimo [N] passi e [T] minuti in una prova con [K] utenti, con tasso di completamento almeno [%]. Accessibilità: [livello, es. WCAG 2.2 AA]. Le prestazioni sono coperte da NF1». Chiarire se il canale è sito, app o entrambi.

**V3 · P3 · NF1: manca il perimetro di misura.**
Il valore è misurabile (2 s, p95, 4G) ma non dice quali pagine, quale metrica (LCP? caricamento completo?), dove si misura (laboratorio o utenti reali). Riformulazione: «LCP ≤ 2 s al 95° percentile, per le pagine [elenco], misurato con [strumento] su profilo 4G [definito]».

## Osservazioni di forma

- US-01 prevede «email di conferma» ma R5 parla solo di Firebase: allineare i canali (L3).
- Le user story non hanno identificativi per le regole né una matrice di tracciabilità obiettivo → regole → storie → criteri: da creare dopo le correzioni.
- Versione «0.3 · bozza», senza responsabile né data: aggiungere proprietario del documento e registro delle decisioni.

## Decisioni e informazioni richieste all'utente

1. Definizione e valori della metrica di retention (V1).
2. Regola di sospensione, soglia del giovedì (ora e fuso) ed eventuale rimborso (C1, C2, A4).
3. Definizione di «abbonamento lungo» e regole dello sconto (A1).
4. Prezzi, giorno di consegna e comportamento del pagamento fallito (A2, L2).
5. Regole di disdetta (L1).
6. Canali di notifica e fornitore; coinvolgimento di Privacy & Compliance (L3, L4).
7. Canale del prodotto: sito, app o entrambi (V2).

## Handoff proposti (non avviati)

- Privacy & Compliance Agency: dati di indirizzo, email e pagamento, fornitore di pagamento e FCM, conservazione dopo la disdetta.
- Software Agency: solo dopo la conferma delle regole R1-R4 e dei criteri di accettazione corretti.

Limiti: ho analizzato solo il testo del documento; non ho dati di mercato, di clienti o prezzi. Questa analisi non sostituisce consulenza legale (consumatori, recesso, pagamenti ricorrenti), fiscale o finanziaria.

— AIBPD-05 · ALGIEBA
