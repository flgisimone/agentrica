AIWDA-02 · ACHERNAR — Senior UX Researcher, reparto AIWDA (AI Web Design)

Nota iniziale: in questa sessione non ho il tool `agent`, quindi non ho potuto caricare AIWDA-01 · CANOPUS. Consegno direttamente a chi mi ha attivato. Ho fatto una revisione in sola lettura di `ricerca/protocollo.md`, `ricerca/interviste.md` e `ricerca/sintesi.md`, confrontandoli con `README.md` e `docs/mappa.md`. Per riscontro ho cercato con grep le sezioni di scambi ed esportazione nelle pagine HTML. Non ho modificato nessun file. Non ho letto schede della biblioteca, perché il compito non tocca WCAG né le norme. Non ho guardato le schermate, che a questo compito non servivano.

## Esito

La sintesi non regge. Su 5 risultati, 5 sono in contrasto con le interviste o non sono sostenuti da esse. La persona si basa su un solo intervistato atipico (I3). Le 3 raccomandazioni vanno contro la maggioranza delle evidenze. Ci sono anche due problemi di metodo:
- due domande del protocollo sono suggestive;
- il campione esclude l'utente principale indicato nel README, il responsabile di sala.

Ho trovato 9 rilievi P1 e 4 rilievi P2/P3. Non ci sono P0: si tratta di un documento di ricerca, non di un flusso bloccato. Però le decisioni di prodotto prese sulla sintesi attuale andrebbero nella direzione sbagliata.

## Rilievi

**R1 · P1 · Conclusione non sostenuta: «tutti vogliono più numeri»** (`sintesi.md:7`)
- **Evidenza:** solo I3 chiede più indicatori (`interviste.md:23`). Gli altri dicono il contrario o non ne parlano:
  - I1: «i numeri li guardo a fine mese con il commercialista» (`:9`);
  - I2: «Il costo lo guarda il commercialista, a me serve sapere chi manca oggi» (`:16`);
  - I5: «Non mi serve, mi serve vedere la settimana» (`:39`);
  - I4: niente sul cruscotto.
- **Correzione:** «1 intervistato su 5 (I3) chiede più indicatori; 3 su 5 (I1, I2, I5) dicono che i numeri non sono un loro compito quotidiano o non gli servono. Il bisogno ricorrente è vedere la situazione di oggi e della settimana.» Confidenza 0,95.

**R2 · P1 · Conclusione non sostenuta: «il pannello si usa ogni giorno»** (`sintesi.md:8`)
- **Evidenza:** solo I2 (`:17`) e I3 (`:25`) aprono il pannello ogni giorno. Gli altri:
  - I1 una volta a settimana, la domenica, e usa le notifiche dell'app (`:10`);
  - I4 la domenica e quando arriva una richiesta di scambio (`:31`);
  - I5 due o tre volte a settimana (`:38`).
- **Correzione:** «Frequenza variabile: 2 su 5 ogni giorno, 3 su 5 settimanale o legata agli eventi (scambi, notifiche).» Confidenza 0,95.

**R3 · P1 · Citazione assente dalle interviste** (`sintesi.md:9`)
- **Evidenza:** la frase «Mi serve vedere il costo del lavoro» non compare in `interviste.md`. L'unica frase vicina, di I2 (`:16`), dice il contrario: il costo lo guarda il commercialista.
- **Correzione:**
  - togliere la citazione e il risultato 3;
  - se il costo del lavoro resta un tema, attribuirlo solo a I3 e al titolare che lo vede a fine mese (I1);
  - verificare che ogni citazione della sintesi rimandi a un'intervista precisa (es. «I3, riga 23»).
- Confidenza 0,95.

**R4 · P1 · Conclusione non sostenuta, nata da una domanda suggestiva: «tutti hanno confermato lo scambio automatico»** (`sintesi.md:10`)
- **Evidenza:** le note non riportano nessuna risposta alla domanda 4 (`protocollo.md:12`, «Non pensa che… le farebbe risparmiare molto tempo?»), che è suggestiva e presuppone il sì. Le evidenze reali sugli scambi sono altre:
  - I5 perde tempo con gli scambi chiesti su WhatsApp (`:37`);
  - I4 riceve la notifica ma non trova dove approvare (`:32`).
  Il bisogno osservato è trovare e approvare gli scambi, non uno scambio «automatico».
- **Correzione:** «2 su 5 segnalano attrito sugli scambi: le richieste arrivano fuori dall'app (I5) e non si trova il punto in cui approvarle (I4, coerente con `docs/mappa.md:5`, dove gli scambi stanno in Settings). Nessun dato sullo scambio automatico.» Confidenza 0,9.

**R5 · P1 · Conclusione in contrasto con i dati: «l'esportazione funziona, nessun commento»** (`sintesi.md:11`)
- **Evidenza:**
  - I1: «non trovo mai dove sta il pulsante» (`interviste.md:11`);
  - la mappa conferma 4 livelli annidati, Impostazioni › Locale › Esporta › Presenze per il consulente (`docs/mappa.md:12`; `impostazioni.html:28`);
  - per I2–I5 la domanda 6 non è registrata: la mancanza di note non vuol dire «nessun commento».
- **Correzione:** «1 su 1 di chi ne ha parlato (I1) non trova l'esportazione; per gli altri il dato manca.» Aggiungere l'esportazione ai problemi da verificare. Confidenza 0,9.

**R6 · P1 · Persona basata su un solo intervistato atipico** (`sintesi.md:15`)
- **Evidenza:** «Marco, 28 dipendenti, ama numeri e tecnologia, computer in ufficio, ogni giorno, costo del lavoro» ricalca I3 (`interviste.md:20-25`). I3 è il locale più grande, l'unico che lavora solo al computer e l'unico che si definisce appassionato di numeri. Nome ed età (45 anni) non vengono dai dati. La persona non rappresenta nemmeno l'utente principale del README (`README.md:9`, responsabile di sala).
- **Correzione:**
  - sostituirla con un profilo prevalente: prepara i turni dal telefono la domenica o fuori ufficio, apre il pannello su notifica o una volta a settimana, ha bisogno di sapere chi manca e di approvare gli scambi;
  - tenere I3 come profilo secondario, dichiarato minoritario;
  - etichettare entrambi come ipotesi da validare.
- Confidenza 0,9.

**R7 · P1 · Raccomandazione in contrasto: pannello pensato per il computer** (`sintesi.md:19`)
- **Evidenza:** 4 su 5 preparano i turni dal telefono o dal tablet, almeno in parte:
  - I1 dal telefono (`:7`);
  - I2 dal telefono, e non usa il computer per Turnio (`:15,18`);
  - I4 dal telefono o dal tablet (`:29`);
  - I5 a volte dal telefono (`:36`).
  Solo I3 usa il computer (`:22`).
- **Correzione:** «Pannello progettato prima per il telefono, a partire dalla preparazione e pubblicazione dei turni; computer supportato.» Confidenza 0,9.

**R8 · P1 · Raccomandazione in contrasto: cruscotto come prima pagina e più indicatori** (`sintesi.md:19-20`)
- **Evidenza:** discende da R1 e R3. I bisogni dichiarati sono altri: «chi manca oggi» (I2, `:16`), «vedere la settimana» (I5, `:39`), le assenze dell'ultimo minuto (I1, `:8`). Il README mette al primo posto, per frequenza, preparare e pubblicare i turni (`README.md:14`).
- **Correzione:**
  - come prima pagina, la settimana dei turni o una vista «oggi» con assenze e scambi in attesa;
  - indicatori di costo in una sezione secondaria, consultata a fine mese;
  - nessun aumento degli indicatori finché un'altra ricerca non lo sostiene.
- Confidenza 0,85.

**R9 · P1 · Raccomandazione in contrasto: scambi nelle impostazioni** (`sintesi.md:21`)
- **Evidenza:**
  - la motivazione «si configura una volta sola» confonde la configurazione con l'approvazione, che il README indica come compito frequente («più volte a settimana», `README.md:15`);
  - I4 non trova dove approvare (`:32`);
  - oggi gli scambi da approvare stanno in Impostazioni (`impostazioni.html:42`), mentre il cruscotto mostra solo un avviso (`index.html:23`).
- **Correzione:** «L'approvazione degli scambi sta nella pagina Turni o è raggiungibile direttamente dalla notifica; nelle impostazioni resta solo l'eventuale configurazione delle regole di scambio.» Confidenza 0,9.

**R10 · P1 · Campione: manca l'utente principale; selezione distorta** (`protocollo.md:4`)
- **Evidenza:**
  - sono stati intervistati solo titolari, mentre il README indica il responsabile di sala come utente principale (`README.md:9`);
  - tutti i partecipanti sono di Bologna e del piano Plus, e si sono autoselezionati rispondendo all'invito, quindi è probabile un campione di clienti più coinvolti;
  - 5 interviste vanno bene per una ricerca qualitativa, ma non per formulazioni come «tutti».
- **Correzione:**
  - intervistare 4–5 responsabili di sala;
  - includere altri piani e città, e anche clienti che non hanno risposto o che usano poco il pannello;
  - dichiarare questi limiti nella sintesi.
- Confidenza 0,85.

**R11 · P2 · Metodo: domande suggestive e orientate ai desideri** (`protocollo.md:3,11,12`)
- **Evidenza:** la domanda 3 presuppone l'utilità del cruscotto («Quanto le sarebbe utile…»). La domanda 4 è una domanda negativa che induce il sì. L'obiettivo «cosa si aspettano» porta a liste di desideri invece che a comportamenti.
- **Correzione:**
  - D3: «L'ultima volta che ha guardato dei numeri del locale: quali, dove, per decidere cosa?»;
  - D4: «Mi racconti l'ultima volta che due dipendenti si sono scambiati un turno: com'è andata?»;
  - obiettivo riformulato su compiti e attriti attuali.
- Confidenza 0,9.

**R12 · P2 · Note incomplete e lacune riempite dalla sintesi** (`interviste.md`)
- **Evidenza:** non tutte le domande hanno una risposta registrata per ogni partecipante. D2 manca per I2, I3 e I4; D4 manca per tutti; D6 manca per I2–I5. La sintesi tratta i vuoti come consenso (R4, R5).
- **Correzione:**
  - una matrice partecipante × domanda con le voci «risposta», «non chiesto» e «non registrato»;
  - ogni risultato con il conteggio (n/5) e il rimando alle righe delle note.
- Confidenza 0,85.

**R13 · P2 · Risultato principale omesso: assenze dell'ultimo minuto**
- **Evidenza:** I1 (`:8`) e I5 (`:37`) indicano le assenze come la prima perdita di tempo, e I2 chiede di sapere «chi manca oggi» (`:16`). La sintesi non ne parla.
- **Correzione:** aggiungere il risultato «3 su 5: gestire assenze e coperture in giornata».
- Confidenza 0,8.

## Domande aperte e test suggeriti

- Chi prepara davvero i turni nei locali dei clienti, il titolare o il responsabile di sala? Il README e il campione non coincidono.
- Test di usabilità mirati, dal telefono, con 5 responsabili di sala:
  - approvare uno scambio partendo dalla notifica;
  - esportare le presenze di un mese;
  - trovare chi è assente oggi.
  Misurare il completamento e i passaggi.
- Le note complete o le registrazioni delle interviste contengono le risposte che mancano a D2, D4 e D6? Se sì, R4, R5 e R12 vanno rivisti.

## Limiti

- È una revisione di documenti: le conclusioni sull'uso reale sono inferenze dalle note e vanno validate.
- Non ho caricato AIWDA-01: il consolidamento del direttore è da fare.
- Lavoro come subagent. Se il modello della sessione è più grande, conviene un riesame dei P1 da parte del direttore prima che diventino definitivi.

## JSON

```json
{
  "project": "turnio-pannello",
  "audit_id": null,
  "agent": "AIWDA-02 · ACHERNAR",
  "page": {"name": "Ricerca utenti ottobre 2026", "url": "ricerca/"},
  "observations": [
    {"id":"AIWDA02-R1","type":"content","title":"«Tutti vogliono più numeri» non sostenuto","description":"Solo I3 chiede più indicatori; I1, I2, I5 dicono il contrario.","evidence":{"url":"ricerca/sintesi.md","screenshot":null,"location":"sintesi.md:7; interviste.md:9,16,23,39","steps":["Confrontare il risultato 1 con le note I1–I5"]},"impact":"Porta a investire in indicatori che la maggioranza non usa","priority":"P1","confidence":0.95,"recommendation":"Riformulare come 1/5 chiede più indicatori, 3/5 no","status":"Nuova","requires_human_review":false},
    {"id":"AIWDA02-R2","type":"content","title":"«Uso quotidiano» non sostenuto","description":"Solo I2 e I3 aprono il pannello ogni giorno.","evidence":{"url":"ricerca/sintesi.md","screenshot":null,"location":"sintesi.md:8; interviste.md:10,17,25,31,38","steps":["Confrontare il risultato 2 con le frequenze riportate"]},"impact":"Distorce la progettazione verso una consultazione quotidiana","priority":"P1","confidence":0.95,"recommendation":"Riportare la frequenza reale: 2/5 ogni giorno, 3/5 settimanale o su evento","status":"Nuova","requires_human_review":false},
    {"id":"AIWDA02-R3","type":"content","title":"Citazione assente dalle interviste","description":"«Mi serve vedere il costo del lavoro» non compare nelle note; I2 dice il contrario.","evidence":{"url":"ricerca/sintesi.md","screenshot":null,"location":"sintesi.md:9; interviste.md:16","steps":["Cercare la frase in interviste.md"]},"impact":"Mina la credibilità della ricerca e sostiene una priorità sbagliata","priority":"P1","confidence":0.95,"recommendation":"Togliere la citazione e il risultato; rimandare ogni citazione all'intervista","status":"Nuova","requires_human_review":false},
    {"id":"AIWDA02-R4","type":"content","title":"«Tutti confermano lo scambio automatico» senza dati","description":"Le risposte a D4, che è suggestiva, non sono registrate; il bisogno osservato è trovare e approvare gli scambi.","evidence":{"url":"ricerca/sintesi.md","screenshot":null,"location":"sintesi.md:10; protocollo.md:12; interviste.md:32,37","steps":["Cercare le risposte a D4 nelle note"]},"impact":"Sposta lo sviluppo su una funzione non richiesta e ignora l'attrito reale","priority":"P1","confidence":0.9,"recommendation":"Riportare 2/5 con attrito sugli scambi (WhatsApp, approvazione non trovata)","status":"Nuova","requires_human_review":false},
    {"id":"AIWDA02-R5","type":"content","title":"«L'esportazione funziona» in contrasto con I1","description":"I1 non trova il pulsante; esportazione annidata su 4 livelli; D6 non registrata per I2–I5.","evidence":{"url":"ricerca/sintesi.md","screenshot":null,"location":"sintesi.md:11; interviste.md:11; docs/mappa.md:12","steps":["Leggere I1 riga 11 e la mappa riga 12"]},"impact":"Un problema di reperibilità di un compito mensile resta fuori dal backlog","priority":"P1","confidence":0.9,"recommendation":"Segnalare l'esportazione come problema da verificare","status":"Nuova","requires_human_review":false},
    {"id":"AIWDA02-R6","type":"content","title":"Persona basata sul solo I3","description":"La persona ricalca l'intervistato atipico; nome ed età inventati; non è l'utente principale del README.","evidence":{"url":"ricerca/sintesi.md","screenshot":null,"location":"sintesi.md:15; interviste.md:20-25; README.md:9","steps":["Confrontare la persona con I3 e con le altre interviste"]},"impact":"Il team progetta per una minoranza","priority":"P1","confidence":0.9,"recommendation":"Profilo prevalente mobile e guidato dagli eventi; I3 come profilo secondario; entrambi da validare","status":"Nuova","requires_human_review":false},
    {"id":"AIWDA02-R7","type":"content","title":"Raccomandazione «per il computer» contro 4/5 da telefono","description":"I1, I2, I4, I5 preparano i turni dal telefono o dal tablet, almeno in parte.","evidence":{"url":"ricerca/sintesi.md","screenshot":null,"location":"sintesi.md:19; interviste.md:7,15,18,29,36","steps":["Contare i dispositivi dichiarati"]},"impact":"Il compito principale diventa scomodo per la maggioranza","priority":"P1","confidence":0.9,"recommendation":"Progettare prima per il telefono","status":"Nuova","requires_human_review":false},
    {"id":"AIWDA02-R8","type":"content","title":"Cruscotto come prima pagina in contrasto con i bisogni","description":"I bisogni dichiarati sono chi manca oggi e la settimana; il README mette i turni al primo posto.","evidence":{"url":"ricerca/sintesi.md","screenshot":null,"location":"sintesi.md:19-20; interviste.md:8,16,39; README.md:14","steps":["Confrontare le raccomandazioni con le note e i compiti del README"]},"impact":"Passaggio in più per il compito più frequente","priority":"P1","confidence":0.85,"recommendation":"Prima pagina: settimana o vista «oggi»; costi in una sezione secondaria","status":"Nuova","requires_human_review":false},
    {"id":"AIWDA02-R9","type":"content","title":"Scambi nelle impostazioni: configurazione confusa con approvazione","description":"L'approvazione è un compito frequente e I4 non la trova; oggi sta in Impostazioni.","evidence":{"url":"ricerca/sintesi.md","screenshot":null,"location":"sintesi.md:21; README.md:15; interviste.md:32; impostazioni.html:42","steps":["Leggere la motivazione della raccomandazione e la frequenza nel README"]},"impact":"Conferma un problema di reperibilità già osservato","priority":"P1","confidence":0.9,"recommendation":"Approvazione in Turni o direttamente dalla notifica; regole nelle impostazioni","status":"Nuova","requires_human_review":false},
    {"id":"AIWDA02-R10","type":"content","title":"Campione senza l'utente principale e autoselezionato","description":"Solo titolari, solo Bologna e piano Plus, partecipanti che hanno risposto all'invito.","evidence":{"url":"ricerca/protocollo.md","screenshot":null,"location":"protocollo.md:4; README.md:9","steps":["Confrontare i partecipanti con gli utenti del README"]},"impact":"Le conclusioni non valgono per chi usa di più il pannello","priority":"P1","confidence":0.85,"recommendation":"Intervistare responsabili di sala, altri piani e città, utenti poco attivi; dichiarare i limiti","status":"Nuova","requires_human_review":true},
    {"id":"AIWDA02-R11","type":"content","title":"Domande suggestive","description":"D3 presuppone l'utilità, D4 è una domanda negativa che induce il sì; l'obiettivo è orientato ai desideri.","evidence":{"url":"ricerca/protocollo.md","screenshot":null,"location":"protocollo.md:3,11,12","steps":["Leggere D3 e D4"]},"impact":"Risposte compiacenti, falsi positivi","priority":"P2","confidence":0.9,"recommendation":"Domande sull'ultima volta che è successo, sui comportamenti","status":"Nuova","requires_human_review":false},
    {"id":"AIWDA02-R12","type":"content","title":"Note incomplete, vuoti trattati come consenso","description":"D2, D4 e D6 mancano per più partecipanti.","evidence":{"url":"ricerca/interviste.md","screenshot":null,"location":"interviste.md:13-39","steps":["Mappare le risposte per domanda"]},"impact":"Risultati non tracciabili","priority":"P2","confidence":0.85,"recommendation":"Matrice partecipante × domanda; conteggio n/5 e rimando per ogni risultato","status":"Nuova","requires_human_review":true},
    {"id":"AIWDA02-R13","type":"content","title":"Omesso il tema delle assenze dell'ultimo minuto","description":"I1, I5 e I2 indicano assenze e coperture come problema principale.","evidence":{"url":"ricerca/sintesi.md","screenshot":null,"location":"interviste.md:8,16,37","steps":["Confrontare D2 con i risultati della sintesi"]},"impact":"Il bisogno più ricorrente resta fuori dal backlog","priority":"P2","confidence":0.8,"recommendation":"Aggiungere il risultato «3/5 assenze e coperture in giornata»","status":"Nuova","requires_human_review":false}
  ],
  "tested_scenarios": ["Revisione documentale di protocollo, interviste e sintesi, con riscontro su README.md, docs/mappa.md e la posizione di scambi ed esportazione nelle pagine HTML"],
  "limitations": ["Nessun dato oltre alle note delle interviste: le conclusioni sull'uso reale sono ipotesi da validare","AIWDA-01 non caricato (tool agent non disponibile)","Schermate non esaminate, perché il compito non le richiede"],
  "summary": "Sintesi non sostenuta dalle interviste: 5 risultati su 5 in contrasto o senza evidenza, una citazione assente, una persona costruita su un intervistato atipico, raccomandazioni contro la maggioranza (telefono, settimana e oggi, approvazione degli scambi). Campione senza responsabili di sala e domande suggestive."
}
```

Firmato: AIWDA-02 · ACHERNAR
