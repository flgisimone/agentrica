AIWDA-02 · ACHERNAR — Senior UX Researcher, reparto AIWDA (AI Web Design)

Ho rivisto in sola lettura la ricerca in `ricerca/` (protocollo.md, interviste.md, sintesi.md), con README.md, docs/mappa.md e schermate/impostazioni-computer.png per il contesto. Non ho modificato nessun file. Non ho potuto caricare prima AIWDA-01 · CANOPUS perché in questa sessione non c'è il tool `agent`: il rapporto è scritto per essere consegnato a lui. Le schede della biblioteca non mi servivano, perché nessun rilievo riguarda WCAG, EN 301 549 o il D.lgs. 82/2022.

Progetto: /private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/68c857fd-4b52-436c-bf0e-5c657ef1d77d/scratchpad/copie/aiwda-02-1

## Esito per CANOPUS

La sintesi non regge. Quattro risultati su cinque, la persona e tutte e tre le raccomandazioni sono in contrasto con le note delle interviste o non hanno una fonte. Generalizzano il caso di I3, che è l'eccezione, a «tutti». La sintesi riporta anche una citazione che nelle note non c'è. Mancano i temi che ricorrono di più: uso dal telefono, assenze dell'ultimo minuto, scambi difficili da approvare, esportazione difficile da trovare. Al metodo servono correzioni: il campione non comprende l'utente principale e due domande sono orientate. Non ci sono P0. Ci sono 11 rilievi P1.

## Conteggio dalle note (interviste.md)

| Tema | Sostiene | Contro | Non rilevato |
|---|---|---|---|
| Più numeri nel cruscotto | I3 (r.23) | I1 (r.9), I2 (r.16), I5 (r.39) | I4 |
| Pannello aperto ogni giorno | I2 (r.17), I3 (r.25) | I1 (r.10), I4 (r.31), I5 (r.38) | — |
| Turni preparati dal telefono | I1 (r.7), I2 (r.15), I4 (r.29), I5 a volte (r.36) | I3 al computer (r.22) | — |
| Esportazione che funziona | — | I1 (r.11) | I2–I5 (la domanda 6 non è registrata) |
| Scambio «automatico» utile | nessuna risposta registrata | — | I1–I5 |

## Rilievi (JSON)

```json
{
  "project": "Turnio – pannello web per i responsabili",
  "audit_id": null,
  "agent": "AIWDA-02 · ACHERNAR",
  "page": { "name": "Ricerca di ottobre 2026 (protocollo, interviste, sintesi)", "url": "ricerca/" },
  "observations": [
    {
      "id": "ACH-01", "type": "content",
      "title": "Risultato 1: «tutti» vogliono più numeri, ma lo dice solo I3",
      "description": "Fatto osservato: sintesi.md r.7 dice che «tutti gli intervistati hanno chiesto più indicatori». Nelle note solo I3 lo chiede (interviste.md r.23). Tre intervistati dicono il contrario: I1 r.9 («i numeri li guardo a fine mese con il commercialista»), I2 r.16 («Il costo lo guarda il commercialista») e I5 r.39 («Non mi serve»). I4 non ne parla.",
      "evidence": { "url": "ricerca/sintesi.md", "screenshot": null, "location": "sintesi.md r.7; interviste.md r.9, 16, 23, 39", "steps": ["Confrontare sintesi.md r.7 con le note di I1–I5"] },
      "impact": "La sintesi orienta il prodotto su un bisogno espresso da 1 intervistato su 5 e respinto da 3.",
      "priority": "P1", "confidence": 0.95,
      "recommendation": "Riscrivere: «Un solo intervistato (I3) chiede più indicatori; tre (I1, I2, I5) dicono che i numeri li guardano a fine mese o il commercialista». Indicare sempre il conteggio n/5 con i codici degli intervistati.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-02", "type": "content",
      "title": "Risultato 2: «si usa ogni giorno» vale per 2 intervistati su 5",
      "description": "Fatto osservato: sintesi.md r.8 dice che «gli intervistati aprono il pannello ogni giorno». Lo fanno solo I2 (r.17) e I3 (r.25). I1 lo apre una volta a settimana (r.10), I4 la domenica e quando arriva uno scambio (r.31), I5 due o tre volte a settimana (r.38). Anche lo scopo è riportato male: I2 lo apre «per vedere chi è di turno», non «per controllare la situazione del locale».",
      "evidence": { "url": "ricerca/sintesi.md", "screenshot": null, "location": "sintesi.md r.8; interviste.md r.10, 17, 25, 31, 38", "steps": ["Confrontare sintesi.md r.8 con la risposta alla domanda 5 di ogni intervista"] },
      "impact": "Porta a progettare per un uso quotidiano di controllo. Per la maggioranza l'uso è settimanale e legato a un evento (pianificazione, richiesta di scambio).",
      "priority": "P1", "confidence": 0.95,
      "recommendation": "Riscrivere: «Frequenza variabile: ogni giorno 2/5 (I2 per vedere chi è di turno, I3), settimanale o legata a un evento 3/5 (I1, I4, I5)».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-03", "type": "content",
      "title": "Risultato 3: citazione che nelle interviste non c'è",
      "description": "Fatto osservato: sintesi.md r.9 cita «Mi serve vedere il costo del lavoro». La frase non compare in interviste.md. La più vicina è di I2 (r.16) e dice il contrario: «Il costo lo guarda il commercialista, a me serve sapere chi manca oggi». Inferenza: la citazione è inventata, oppure viene da materiale non allegato.",
      "evidence": { "url": "ricerca/interviste.md", "screenshot": null, "location": "sintesi.md r.9; interviste.md r.16", "steps": ["Cercare in interviste.md il testo «Mi serve vedere il costo del lavoro»: non si trova"] },
      "impact": "Toglie affidabilità a tutta la sintesi e sostiene una priorità (costo del lavoro) che i dati contraddicono.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Togliere la citazione o indicarne la fonte verificabile. Il risultato va riformulato come «Il bisogno quotidiano è sapere chi c'è e chi manca oggi (I2 r.16, I1 r.8)». Il costo del lavoro va spostato fra le ipotesi, sostenuta solo da I3.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "ACH-04", "type": "content",
      "title": "Risultato 4: «tutti hanno confermato» senza risposte registrate e con una domanda orientata",
      "description": "Fatto osservato: sintesi.md r.10 dice che tutti hanno confermato che lo scambio automatico farebbe risparmiare tempo. Nessuna nota riporta una risposta alla domanda 4. La domanda stessa è orientata e in forma negativa (protocollo.md r.12: «Non pensa che … le farebbe risparmiare molto tempo?»). Le note mostrano un altro problema: gli scambi passano da WhatsApp (I5 r.37) e nel pannello non si capisce dove approvarli (I4 r.32). Nessuno chiede che lo scambio sia automatico.",
      "evidence": { "url": "ricerca/sintesi.md", "screenshot": null, "location": "sintesi.md r.10; protocollo.md r.12; interviste.md r.32, 37", "steps": ["Cercare nelle note le risposte alla domanda 4: non ce ne sono"] },
      "impact": "Un'adesione ottenuta con una domanda che suggerisce la risposta, e per di più non registrata, viene presentata come conferma unanime. Il bisogno reale, cioè trovare e approvare gli scambi, resta nascosto.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Togliere «tutti hanno confermato». Riscrivere: «Gli scambi creano attrito: si chiedono fuori dall'app (I5) e nel pannello non si trova dove approvarli (I4). L'utilità di uno scambio automatico non è stata misurata».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-05", "type": "content",
      "title": "Risultato 5: «l'esportazione funziona» quando l'unico dato dice il contrario",
      "description": "Fatto osservato: sintesi.md r.11 dice che l'esportazione «funziona e non ha richiesto commenti». I1 dice «non trovo mai dove sta il pulsante» (r.11). Per I2–I5 la domanda 6 non è registrata: è un dato che manca, non un'assenza di commenti. Un riscontro nel prodotto: docs/mappa.md r.12 descrive l'esportazione a quattro livelli (Impostazioni › Locale › Esporta › Presenze per il consulente). In schermate/impostazioni-computer.png, nella prima vista delle impostazioni, la voce «Esporta» non compare.",
      "evidence": { "url": "ricerca/sintesi.md", "screenshot": "schermate/impostazioni-computer.png", "location": "sintesi.md r.11; interviste.md r.11; docs/mappa.md r.12", "steps": ["Leggere interviste.md r.11", "Aprire la schermata delle impostazioni: l'esportazione non è visibile senza aprire «Locale»"] },
      "impact": "Un problema già segnalato su un compito mensile (README r.17) viene chiuso come risolto e quindi non entra nel backlog.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Riscrivere: «L'esportazione è difficile da trovare (I1). Per gli altri il dato manca». Aggiungere una raccomandazione: rendere l'esportazione raggiungibile in un passaggio e verificarla con un test di reperibilità.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-06", "type": "content",
      "title": "Persona «Marco» costruita sull'unico caso fuori norma",
      "description": "Fatto osservato: la persona (sintesi.md r.15) ricalca I3. Usa il computer in ufficio, ama i numeri e la tecnologia, apre il pannello ogni giorno e ha 28 dipendenti (interviste.md r.20–25). In ogni dimensione I3 è l'eccezione: è l'unico che usa solo il computer, l'unico che chiede più numeri e il locale più grande. I dati di età e di genere (45 anni) non vengono dalle interviste. La maggioranza delle note descrive un altro profilo: prepara i turni la domenica sera dal telefono (I1, I4, I5), vuole semplicità (I4 r.30) e ha bisogno di sapere chi manca (I1 r.8, I2 r.16).",
      "evidence": { "url": "ricerca/sintesi.md", "screenshot": null, "location": "sintesi.md r.13–15; interviste.md r.7, 15, 20–25, 29–30, 36", "steps": ["Confrontare gli attributi della persona con le cinque note"] },
      "impact": "La persona guida le scelte di progetto verso un utente che rappresenta 1 intervistato su 5. Per di più è un titolare, mentre l'utente principale è il responsabile di sala.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Togliere i dati non sostenuti (età). Costruire la persona primaria sul profilo ricorrente: titolare o responsabile, turni la domenica dal telefono, assenze improvvise, poca familiarità con la tecnologia. Tenere I3 come profilo secondario, oppure come ipotesi da validare.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-07", "type": "content",
      "title": "La sintesi tralascia i temi ricorrenti",
      "description": "Fatto osservato: la sintesi non riporta quattro temi presenti nelle note. Primo, le assenze dell'ultimo minuto (I1 r.8, I5 r.37) e il bisogno di sapere chi manca oggi (I2 r.16). Secondo, l'uso dal telefono (4/5: I1 r.7, I2 r.15–18, I4 r.29, I5 r.36). Terzo, la reperibilità dell'approvazione degli scambi (I4 r.32). Quarto, il bisogno di semplicità (I4 r.30) e di vedere la settimana (I5 r.39).",
      "evidence": { "url": "ricerca/sintesi.md", "screenshot": null, "location": "sintesi.md r.5–11 rispetto a interviste.md r.7, 8, 15, 16, 29, 30, 32, 36, 37, 39", "steps": ["Elencare i temi delle note e confrontarli con i risultati della sintesi"] },
      "impact": "I bisogni che risultano più spesso non arrivano alle decisioni di prodotto.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Rifare la sintesi con una codifica per temi (una matrice tema × intervistato) e riportare ogni tema con conteggio e citazioni, anche quelli che non confermano le ipotesi iniziali.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-08", "type": "usability",
      "title": "Raccomandazione 1 (pannello per il computer, cruscotto come prima pagina) in contrasto con i dati",
      "description": "Fatto osservato: sintesi.md r.19 raccomanda un pannello pensato per il computer con il cruscotto in prima pagina. Quattro intervistati su cinque preparano i turni dal telefono, almeno a volte (I1 r.7, I2 r.15 e r.18 «Non usa il computer per Turnio», I4 r.29, I5 r.36). Tre dicono che il cruscotto non serve o lo guardano a fine mese (I1 r.9, I2 r.16, I5 r.39). Il compito più frequente (README r.14) è preparare i turni, non leggere numeri.",
      "evidence": { "url": "ricerca/sintesi.md", "screenshot": null, "location": "sintesi.md r.19; interviste.md r.7, 9, 15–18, 29, 36, 39; README.md r.14", "steps": ["Confrontare la raccomandazione con dispositivo e bisogni riportati nelle note"] },
      "impact": "Se applicata, la raccomandazione peggiora il compito principale per la maggioranza degli utenti intervistati.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Correggere in: «Preparazione e pubblicazione dei turni progettate e provate prima sul telefono (390 px). Prima pagina la settimana dei turni o la vista di oggi (chi c'è, chi manca, scambi in attesa). Cruscotto secondario».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-09", "type": "content",
      "title": "Raccomandazione 2 (più indicatori, a partire dal costo del lavoro) sostenuta da un solo intervistato",
      "description": "Fatto osservato: sintesi.md r.20 deriva dai risultati 1 e 3 (ACH-01, ACH-03). Nelle note la sostiene solo I3 (r.23). La contraddicono I1, I2 e I5.",
      "evidence": { "url": "ricerca/sintesi.md", "screenshot": null, "location": "sintesi.md r.20", "steps": ["Risalire alle fonti dei risultati 1 e 3"] },
      "impact": "Lavoro di sviluppo investito in una funzione dal valore non dimostrato, a scapito dei bisogni ricorrenti.",
      "priority": "P2", "confidence": 0.85,
      "recommendation": "Togliere la raccomandazione dalla sintesi e passarla fra le ipotesi da validare, per esempio con una domanda di sondaggio a più clienti, prima di metterla in backlog.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-10", "type": "information_architecture",
      "title": "Raccomandazione 3 (scambi nelle impostazioni) confonde la configurazione con un'approvazione ricorrente",
      "description": "Fatto osservato: sintesi.md r.21 tiene gli scambi nelle impostazioni «perché si configura una volta sola». Approvare uno scambio però è un compito che si ripete più volte a settimana (README r.15). I4 dice che nel pannello non capisce dove approvarli (r.32). Nel prodotto attuale «Scambi da approvare» è dentro Impostazioni (schermate/impostazioni-computer.png; docs/mappa.md r.5).",
      "evidence": { "url": "ricerca/sintesi.md", "screenshot": "schermate/impostazioni-computer.png", "location": "sintesi.md r.21; interviste.md r.32; README.md r.15; docs/mappa.md r.5", "steps": ["Aprire la schermata delle impostazioni: la voce «Scambi da approvare 3» si trova sotto Impostazioni"] },
      "impact": "La raccomandazione consolida proprio il problema di reperibilità segnalato da un intervistato, su un compito frequente.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Correggere in: «Le regole dello scambio restano nelle impostazioni. L'approvazione degli scambi va dove si lavora sui turni (pagina Turni o area dedicata), con accesso diretto dalla notifica». Verificarla con un test di usabilità.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-11", "type": "usability",
      "title": "Campione: nessun responsabile di sala, cioè nessun utente principale",
      "description": "Fatto osservato: il protocollo vuole capire «come i responsabili preparano i turni» (protocollo.md r.3), ma il campione è composto solo da 5 titolari (r.4). Secondo README.md r.9 l'utente principale è il responsabile di sala, che prepara i turni e approva gli scambi.",
      "evidence": { "url": "ricerca/protocollo.md", "screenshot": null, "location": "protocollo.md r.3–4; README.md r.9–10", "steps": ["Confrontare i partecipanti con i profili utente del README"] },
      "impact": "Le conclusioni non si possono estendere all'utente principale.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Aggiungere interviste o osservazioni con responsabili di sala (almeno 4–5). Nella sintesi dichiarare che i risultati attuali valgono per i titolari.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-12", "type": "usability",
      "title": "Campione distorto nella selezione: solo piano Plus, solo Bologna, autoselezionato",
      "description": "Fatto osservato: i partecipanti sono clienti del piano Plus di Bologna che hanno risposto all'invito (protocollo.md r.4). La dimensione dei locali va da 6 a 28 dipendenti, mentre il target arriva a 40 (README r.3). Inferenza: chi risponde a un invito tende a essere più coinvolto e più vicino alla tecnologia.",
      "evidence": { "url": "ricerca/protocollo.md", "screenshot": null, "location": "protocollo.md r.4; README.md r.3", "steps": [] },
      "impact": "È rischioso estendere le conclusioni agli altri piani, alle altre città e ai locali più grandi.",
      "priority": "P2", "confidence": 0.8,
      "recommendation": "Dichiarare il limite nella sintesi. Nei prossimi cicli includere altri piani, altre zone e locali sopra i 30 dipendenti, e reclutare anche chi non ha risposto spontaneamente.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-13", "type": "usability",
      "title": "Domande orientate e ipotetiche nel protocollo",
      "description": "Fatto osservato: la domanda 4 (protocollo.md r.12) suggerisce la risposta («Non pensa che…»). La domanda 3 (r.11) chiede un'utilità ipotetica, cioè «quanto le sarebbe utile», che spinge al sì. Sono proprio le domande da cui la sintesi ricava i risultati 1 e 4. La domanda 5 (r.13) chiede una frequenza ricordata, non osservata.",
      "evidence": { "url": "ricerca/protocollo.md", "screenshot": null, "location": "protocollo.md r.11–13", "steps": [] },
      "impact": "Le risposte misurano la compiacenza verso l'intervistatore, non il comportamento.",
      "priority": "P1", "confidence": 0.85,
      "recommendation": "Riformulare la domanda 3 così: «L'ultima volta che ha guardato dei numeri del locale: quali, dove, perché?». La domanda 4 così: «Mi racconti l'ultima richiesta di scambio: come è arrivata, cosa ha fatto?». Per la frequenza (domanda 5) usare i dati d'accesso, se disponibili.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "ACH-14", "type": "usability",
      "title": "Note incomplete e metodo solo dichiarativo",
      "description": "Fatto osservato: la domanda 6 è registrata solo per I1. La domanda 4 non è registrata per nessuno. La domanda 2 manca per I2, I3 e I4. Le note non rimandano a registrazioni o trascrizioni. Le interviste in videochiamata di 40 minuti (protocollo.md r.5) non osservano l'uso reale dal telefono né lo svolgimento dei compiti.",
      "evidence": { "url": "ricerca/interviste.md", "screenshot": null, "location": "interviste.md r.13–39; protocollo.md r.5", "steps": ["Per ogni intervista, controllare quali delle 6 domande hanno una risposta nelle note"] },
      "impact": "I dati che mancano vengono letti come «nessun commento» (vedi ACH-05) e le conclusioni sui comportamenti restano ipotesi.",
      "priority": "P2", "confidence": 0.85,
      "recommendation": "Usare un modello di note con una riga per domanda (anche «non chiesto» o «non risposto») e il rimando alla trascrizione. Affiancare un test di usabilità sui compiti 1–4 del README, dal telefono.",
      "status": "Nuova", "requires_human_review": false
    }
  ],
  "tested_scenarios": [
    "Confronto riga per riga di ogni risultato, della persona e delle raccomandazioni di sintesi.md con le note di interviste.md",
    "Revisione delle domande e del campione di protocollo.md rispetto a obiettivo e utenti del README",
    "Riscontro di ACH-05 e ACH-10 su docs/mappa.md e su schermate/impostazioni-computer.png (solo lettura della schermata)"
  ],
  "limitations": [
    "Persone, interviste e numeri sono inventati (README.md r.5, interviste.md r.3): la revisione valuta la coerenza interna della ricerca, non la realtà degli utenti.",
    "Ho a disposizione solo le note di sintesi delle interviste, senza registrazioni o trascrizioni: alcune risposte mancanti potrebbero esistere fuori dalle note (ACH-03 segnato per la revisione umana).",
    "AIWDA-01 non è stato caricato perché in questa sessione non c'è il tool agent.",
    "Le conclusioni sui bisogni sono ipotesi da validare con altre interviste e con test di usabilità."
  ],
  "summary": "La sintesi contraddice le interviste in 4 risultati su 5, contiene una citazione che non si trova nelle note, costruisce la persona sull'unico caso fuori norma (I3) e fa 3 raccomandazioni in contrasto con i dati (computer e cruscotto al primo posto, costo del lavoro, scambi nelle impostazioni). Il campione esclude l'utente principale e due domande sono orientate. Rilievi: 11 P1, 3 P2, nessun P0."
}
```

## Test di usabilità suggeriti

1. Dal telefono (390 px), con 5 responsabili di sala e titolari: preparare e pubblicare la settimana, poi approvare uno scambio partendo dalla notifica. Misurare se il compito riesce e quanto tempo richiede (verifica ACH-08 e ACH-10).
2. Test di reperibilità dell'esportazione: «Trovi dove si esportano le presenze per il consulente», misurando il primo clic e il successo (verifica ACH-05).
3. Cinque minuti di prova del cruscotto rispetto alla vista «oggi e settimana», chiedendo cosa si guarda per primo il lunedì mattina (verifica ACH-01 e ACH-09).

## Domande aperte

- Esistono registrazioni o trascrizioni da cui viene la citazione del risultato 3 e le risposte alle domande 4 e 6?
- Ci sono dati d'accesso al pannello (dispositivo, frequenza) per sostituire la frequenza ricordata dagli intervistati?
- Si possono reclutare responsabili di sala per un secondo ciclo?

Firmato: AIWDA-02 · ACHERNAR
