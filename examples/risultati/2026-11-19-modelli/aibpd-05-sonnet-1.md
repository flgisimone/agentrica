AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist, reparto AIBPD (AI Business & Product Development)

# Analisi di requisiti.md — Abbonamento settimanale «Orto in Box» (v0.3 bozza)

Ho letto solo requisiti.md (e il README della cartella). Non ho modificato nulla. Priorità: P0 critica, P1 alta, P2 media, P3 bassa. Nessun P0.

## Sintesi
Il documento è una buona base (perimetro esplicito, 3 user story su 4 con criteri Dato/Quando/Allora), ma ha 4 problemi che bloccano lo sviluppo: la metrica di successo non è misurabile, le regole R1/R3 sono in conflitto con US-02/US-03 sul calendario, R4 è indefinita, US-04 non ha criteri. Alcune regole (R2, R5) contraddicono o eccedono il perimetro.

## Rilievi

### 1. Metrica di successo non misurabile — §1, riga 9 — P1
Problema: «aumentare la retention» non ha definizione, baseline, soglia né orizzonte; non si può dire se il lancio è riuscito.
Proposta: «Retention a 8 settimane dei clienti abbonati: almeno [X]% (baseline attuale: [Y]%, da misurare sui clienti che ordinano oggi una box alla volta), misurata [N] mesi dopo il lancio». I valori X, Y, N sono dati mancanti: da fornire, non li invento.

### 2. Contraddizione R2 ↔ R3 — §3, righe 19–20 — P1
R2 dice sospensione «in qualsiasi momento»; R3 pone il limite del giovedì. Inoltre US-02 non cita il termine.
Proposta R2: «Il cliente può richiedere la sospensione in qualsiasi momento; la sospensione ha effetto secondo R3». Riformulare R3 (vedi punto 3).

### 3. Calendario di addebito, cut-off e consegna incompleto — R1, R3, US-02, US-03 — P1
- R1 addebita il lunedì, ma non è detto per quale consegna (della stessa settimana? della successiva?) né il giorno di consegna.
- R3 «entro il giovedì» non dice di quale settimana, fuso orario né ora (23:59?). «Dalla consegna della settimana successiva» è ambiguo: successiva a quale?
- Se la sospensione/cambio vale dalla settimana successiva ma l'addebito è già avvenuto il lunedì, non è chiaro quando si rimborsa/non si addebita.
- US-02 «in quelle settimane non riceve la box e non viene addebitato» non dice cosa accade se le settimane scelte includono la corrente (dopo il cut-off). US-03 dice «prima del giovedì» (giovedì incluso o escluso? In contrasto con «entro il giovedì» di R3).
Proposta: definire una tabella del ciclo: «Addebito: lunedì ore [hh:mm], fuso Europe/Rome, per la consegna di [giorno] della stessa settimana. Cut-off per sospensione/cambio/disdetta: giovedì ore 23:59 della settimana precedente alla consegna interessata. Richieste dopo il cut-off valgono dalla consegna successiva». Usare «entro» ovunque, in modo uniforme (R3 e US-03).

### 4. R4 «abbonamenti lunghi» e sconto 10% — §3, riga 21 — P1
«Lunghi» non è definito (durata? da quando? settimane consecutive?). Non è chiaro se lo sconto vale su box piccola e grande, se si perde con la sospensione, né quando scatta. Nessuna storia né criterio lo copre, e US-03 parla di «prezzo della grande» senza prezzo né sconto. I prezzi mancano nel documento.
Proposta: «Dopo [N] settimane consecutive di abbonamento attivo, il prezzo della box è scontato del 10% (sul prezzo di listino, box piccola e grande, IVA inclusa). Le settimane di sospensione [azzerano / non azzerano / non contano] il conteggio». Aggiungere una user story con criteri Dato/Quando/Allora e la tabella prezzi (dato mancante).

### 5. US-04 senza criteri di accettazione — §4, riga 33 — P1
Manca tutto: cut-off, effetto sull'addebito in corso, conferma, riattivazione, differenza tra sospensione e disdetta, eventuale penale.
Proposta: «Dato un abbonamento attivo, quando il cliente disdice entro il cut-off di R3 e conferma, allora non viene addebitato per le consegne successive, vede la data dell'ultima consegna e riceve un'email di conferma. Dato che disdice dopo il cut-off, allora l'ultima consegna è quella già addebitata».

### 6. R5 e notifiche — §3, riga 22 — P2
Contiene una scelta tecnologica (Firebase Cloud Messaging) in una regola di business: è soluzione, non requisito. Non dice quali eventi, quali canali, a chi. Inoltre US-01 prevede un'email, mentre FCM è push (non email): incoerenza di canale. Il documento non cita nemmeno un'app mobile; NF2 parla di «app», mentre NF1 di «pagine».
Proposta: «R5. Il cliente riceve una notifica per: attivazione, sospensione, cambio box, disdetta, addebito non riuscito. Canali: [email / push]». Spostare FCM in una decisione tecnica, con valutazione privacy (fornitore esterno, trasferimento di dati): coinvolgere Privacy & Compliance Agency.

### 7. Pagamento fallito e gestione carta — mancanza (R1, §2) — P1
Non è definito cosa succede se l'addebito fallisce, la carta scade o viene rifiutata (autenticazione forte/3-D Secure in particolare): consegna sì/no, nuovi tentativi, avvisi. Impatta direttamente ricavi e retention.
Proposta: «Se l'addebito del lunedì non va a buon fine, il sistema riprova [n] volte entro [ore], avvisa il cliente e, se persiste, la consegna della settimana è sospesa e l'abbonamento passa a "pagamento in sospeso"».

### 8. Lacune di perimetro e regole — §2 — P2
- «Indirizzo di consegna a Milano»: Milano città o area metropolitana, elenco CAP? Come si verifica?
- Cosa succede se il cliente cambia indirizzo (anche fuori Milano) con abbonamento attivo? Non c'è storia né regola.
- Stagionalità: «verdura di stagione» ma la composizione, le festività e le settimane di mancata consegna del fornitore non sono trattate (chi sospende, chi rimborsa).
- Modifica prezzo da parte del gestore con abbonamento attivo: non trattata.
- Disponibilità massima/capacità di consegna per settimana: non indicata (dato mancante).
Proposta: elenco di CAP ammessi nel documento; aggiungere regole per cambio indirizzo e settimane di non consegna.

### 9. US-01: criteri incompleti — §4, righe 26–28 — P2
- «carta valida» non definita (verifica al momento dell'attivazione? autorizzazione di 0 €?).
- Non dice se il primo addebito avviene all'attivazione o il lunedì successivo, e quindi la «prima consegna indicata con la data» dipende da R1/R3 non definiti.
- Manca il caso carta non valida/rifiutata.
- «email di conferma» senza contenuto minimo.
Proposta: aggiungere «Dato una carta rifiutata, quando conferma, allora l'abbonamento non viene creato e vede il motivo e come riprovare».

### 10. US-02: "settimane di sospensione" non verificabile — §4, righe 29–30 — P2
Non dice limite massimo di settimane consecutive, anticipo massimo, selezione di intervalli non contigui, né che cosa accade al rinnovo dopo l'ultima settimana (riprende automaticamente?). «Quando vado in vacanza» è motivazione, ma la regola R2 la estende a qualsiasi motivo.
Proposta: «Dato un abbonamento attivo, quando sceglie una o più settimane future (fino a [N]) entro il cut-off, allora a ogni settimana scelta non è prevista consegna né addebito, e dalla prima settimana successiva l'abbonamento riprende in automatico».

### 11. US-03: differenza di prezzo e sconto — §4, righe 31–32 — P2
Non copre il passaggio dalla grande alla piccola (solo piccola → grande), né il caso dopo il cut-off, né l'effetto sullo sconto R4 («al prezzo della grande»). Il criterio è comunque verificabile per il caso scritto.
Proposta: «Dato un abbonamento attivo, quando passa a un'altra dimensione entro il cut-off, allora dalla consegna successiva riceve la box scelta al relativo prezzo, con lo sconto R4 se spettante; dopo il cut-off la modifica vale dalla consegna successiva».

### 12. NF2 non verificabile — §5, riga 38 — P2
«Veloce e facile da usare» non è misurabile; «veloce» duplica NF1; «app» non è definita come prodotto (sito? app?).
Proposta: «NF2. Un cliente nuovo completa l'attivazione (US-01) in al massimo [N] passaggi e [T] minuti, in un test con [n] utenti, con tasso di successo ≥ [S]%». Il target numerico è da concordare.

### 13. NF1 parzialmente verificabile — §5, riga 37 — P3
Manca cosa si misura (tempo di caricamento completo? LCP?), dove si misura (misura sul campo o in laboratorio) e quali pagine. Proposta: «LCP ≤ 2 s al 95° percentile, sulle pagine di US-01…US-04, misurato in produzione su connessione 4G».

### 14. Requisiti non funzionali assenti — §5 — P2
Mancano sicurezza e conformità dei pagamenti (chi tratta le carte, PSD2/SCA), disponibilità dell'addebito del lunedì, accessibilità, audit delle modifiche e ruoli (chi può cambiare un abbonamento per conto del cliente, assistenza). Dati personali (indirizzo, carta, contatti): coinvolgere Privacy & Compliance Agency per basi giuridiche, fornitore di pagamento, conservazione e informativa.

### 15. Tracciabilità e struttura — documento — P3
Le regole R1–R5 non sono collegate alle storie; non ci sono ID per requisiti non funzionali verso KPI, né glossario (box, settimana, consegna, cut-off), né versione di decisioni aperte. Proposta: matrice R/US/NF ↔ obiettivo/KPI e un glossario; una sezione «Domande aperte» e «Decision log».

## Informazioni mancanti da fornire (non inventate)
Baseline e target di retention; prezzi box piccola/grande; definizione di «abbonamento lungo»; giorno e ora di consegna; ora e fuso del cut-off; politica sui tentativi di addebito; elenco CAP; capacità settimanale; canali di notifica.

## Decisioni che spettano all'utente
1. Definizione e soglia dell'obiettivo di retention.
2. Calendario addebito/cut-off/consegna (punto 3).
3. Regola dello sconto R4 (soglia, perimetro, effetto della sospensione).
4. Politica per pagamenti falliti.
5. Canali di notifica e fornitore (con Privacy & Compliance).

Passaggio successivo suggerito (non avviato): dopo le tue risposte, riscrivo le sezioni 3–4 con i criteri completi e la matrice di tracciabilità; handoff a Privacy & Compliance Agency per carta, indirizzo e FCM. Nessuna correzione è stata applicata al file.

— AIBPD-05 · ALGIEBA
