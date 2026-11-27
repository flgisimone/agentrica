AIWDA-03 · HADAR — Senior UX Designer, reparto AIWDA (AI Web Design)

Consegna ad AIWDA-01 · CANOPUS. Non ho potuto caricare il direttore, perché in questa sessione non ho i tool `agent` e `library`. Il perimetro l'ho preso dalla sezione «Compito». Ho lavorato in sola lettura su `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/68c857fd-4b52-436c-bf0e-5c657ef1d77d/scratchpad/copie/aiwda-03-4` e non ho modificato nessun file.

## Esito

Nessuno dei cinque compiti del README ha un ciclo completo «azione, attesa, esito, recupero».
- **Feedback.** `js/app.js` non controlla mai `res.ok`, salvo nel modulo dei dipendenti. Mostra «Fatto!» anche quando il server risponde con un errore e manda gli errori di rete solo in console.
- **Controlli senza effetto.** Molti controlli non hanno un comportamento: settimana precedente e successiva, OK/No degli scambi, esportazione, modifica ed eliminazione del dipendente.
- **Azioni distruttive.** Non hanno una conferma adeguata, oppure ce l'hanno generica.
- **Uscita automatica.** Scatta a 10 minuti dall'apertura della pagina, senza avviso, e fa perdere il lavoro in corso.

Non ci sono rilievi P0. Ci sono 9 rilievi P1, 7 P2 e 1 P3.

## Rilievi in sintesi (dettaglio nel JSON)

| id | Compito | Dove | Problema | Pr. |
|---|---|---|---|---|
| UX-01 | tutti | app.js:12 | Uscita automatica fissa a 10 min dal caricamento, senza avviso né proroga; si perde il lavoro non salvato | P1 |
| UX-02 | 1 | turni.html:33-44, app.js | La griglia non si può modificare: non si può «preparare» un turno | P1 |
| UX-03 | 1 | app.js:17-20, turni.html:27 | Pubblicazione senza conferma, senza stato di attesa, senza controllo dell'errore; «Fatto!» sempre | P1 |
| UX-04 | 1 | turni.html:28, app.js:22-25 | «Elimina settimana» è primario come «Pubblica», accanto a lui, senza conferma né annullamento; lascia la griglia vuota | P1 |
| UX-05 | 1 | app.js:27-35 | «Salva» ricarica la pagina senza esito; l'errore finisce solo in console | P2 |
| UX-06 | 1 | turni.html:21-23 | ◀ ▶ della settimana senza comportamento; non c'è uno stato bozza o pubblicata | P2 |
| UX-07 | 1 | turni.css .week 1100px, schermata turni-telefono.png | Su telefono la griglia esce dallo schermo, ma 4 intervistati su 5 preparano i turni dal telefono | P1 |
| UX-08 | 2 | impostazioni.html:41-51, index.html:22-24 | Scambi da approvare sepolti nelle Impostazioni; il banner del cruscotto non è un link | P1 |
| UX-09 | 2 | impostazioni.html:46-48, app.js | OK/No senza comportamento né esito; il badge non si aggiorna; «No» senza conferma | P1 |
| UX-10 | 2 | turni.html:48-56, app.js:37-47 | Finestra dello scambio: niente Esc, niente focus, «OK» generico, la griglia non si aggiorna | P2 |
| UX-11 | 3 | dipendenti.html:34-50 | 13 campi obbligatori per un invito che richiede nome e telefono | P1 |
| UX-12 | 3 | app.js:53-72 | Validazione e errori: formato del telefono rifiutato, messaggio che dà la colpa, codice tecnico, `form.reset()` che cancella tutto | P1 |
| UX-13 | 3 | app.js:68 | Successo senza esito: la riga non entra in tabella, il modulo non si svuota, non si dice nulla dell'invito | P2 |
| UX-14 | 3 | app.js:74-79, dipendenti.html:26-28 | Ricerca senza stato vuoto; ✎ e 🗑 senza comportamento | P2 |
| UX-15 | 4 | impostazioni.html:22-38, app.js | Esportazione a 3 livelli di profondità, sotto «Locale»; «Clicca qui» con href="#" non fa nulla | P1 (vedi nota) |
| UX-16 | 5 | impostazioni.html:20, app.js:92-94 | «Si salvano da sole» senza indicatore di salvataggio né errore | P2 |
| UX-17 | 5 | app.js:83-90 | Eliminazione del locale con `confirm("Vuoi davvero procedere?")` generico; reindirizza anche se fallisce | P1 |
| UX-18 | tutti | toast in app.js:3-9 | Toast di 1,5 s, generico, non annunciato | P3 |

Nota su UX-15: l'ho messo P1 perché il compito mensile non si porta a termine e l'intervista I1 conferma che il pulsante non si trova. Se il direttore lo considera un limite del prototipo statico, scende a P2.

## JSON

```json
{
  "project": "Turnio – pannello web per i responsabili",
  "audit_id": null,
  "agent": "AIWDA-03 · HADAR",
  "page": { "name": "Pannello: index, turni, dipendenti, impostazioni + js/app.js", "url": "index.html, turni.html, dipendenti.html, impostazioni.html" },
  "observations": [
    {
      "id": "UX-01", "type": "usability",
      "title": "Uscita automatica fissa dopo 10 minuti, senza avviso",
      "description": "Fatto: app.js:12 imposta un setTimeout unico di 10 minuti dal caricamento della pagina e poi reindirizza a /login. Il commento dice «senza richieste al server», ma il timer non si azzera mai, né alle richieste né all'attività. Non c'è un avviso e non si può prorogare. Inferenza: chi prepara i turni (compito 1) o compila il modulo di 14 campi (compito 3) per più di 10 minuti perde quello che non ha salvato.",
      "evidence": { "url": "tutte le pagine", "screenshot": null, "location": "js/app.js:11-12", "steps": ["Aprire turni.html", "Lavorare 10 minuti senza ricaricare", "La pagina va a /login senza preavviso"] },
      "impact": "Perdita di dati e del contesto nei due compiti più lunghi. Riguarda anche WCAG 2.2, 2.2.1 Timing Adjustable (A); il criterio non è nella scheda della biblioteca e la sua lettura è mia, da far confermare all'Accessibility Specialist.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Far scadere la sessione per inattività reale, misurata sul server o sull'attività dell'utente. Almeno 60 secondi prima mostrare un avviso con «Resta collegato». Conservare la bozza (turni, modulo) e ripresentarla dopo il nuovo accesso.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-02", "type": "usability",
      "title": "La settimana non si può modificare: manca il «preparare» del compito 1",
      "description": "Fatto: le celle di turni.html:36-43 sono testo statico e app.js non gestisce nessuna modifica (aggiungere un turno, cambiare l'orario, mettere un riposo). Ci sono solo Pubblica, Elimina, Salva e lo scambio. Inferenza: il compito più frequente si ferma alla consultazione. Limite: il progetto è un prototipo statico, quindi l'editor potrebbe essere previsto altrove.",
      "evidence": { "url": "turni.html", "screenshot": "schermate/turni-computer.png", "location": "turni.html:33-44; js/app.js:14-48", "steps": ["Aprire turni.html", "Cliccare una cella del turno: non succede nulla"] },
      "impact": "Il compito 1 non si può svolgere nel pannello.",
      "priority": "P1", "confidence": 0.7,
      "recommendation": "Cella cliccabile che apre una modifica in linea o un pannello laterale con orario d'inizio e di fine, «Riposo» e ruolo. Aggiungere «Copia la settimana precedente» per l'uso ripetuto settimanale. Confermare con l'utente se l'editor è nel perimetro.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "UX-03", "type": "usability",
      "title": "Pubblicare: nessuna conferma, nessuna attesa, esito falso in caso di errore",
      "description": "Fatto: app.js:17-20 esegue fetch POST e poi toast(\"Fatto!\") senza controllare res.ok e senza try/catch. Il pulsante non si disattiva durante la richiesta, quindi un doppio clic produce una doppia pubblicazione. Pubblicare avvisa tutti i dipendenti, ma non c'è un riepilogo prima, e dopo la pubblicazione nulla indica che la settimana è pubblicata.",
      "evidence": { "url": "turni.html", "screenshot": null, "location": "turni.html:27; js/app.js:17-20", "steps": ["Cliccare «Pubblica i turni» con il server che risponde 500", "Compare «Fatto!» per 1,5 s"] },
      "impact": "Il responsabile crede di aver pubblicato e i dipendenti non ricevono i turni. Non si capisce se e quando la settimana è stata pubblicata.",
      "priority": "P1", "confidence": 0.95,
      "recommendation": "Mostrare un riepilogo prima di pubblicare («Pubblichi i turni di lun 2 – dom 8 nov a 3 dipendenti: riceveranno una notifica») con «Pubblica i turni» e «Annulla». Durante la richiesta pulsante disattivato con «Pubblicazione…». Se va a buon fine: messaggio «Turni pubblicati alle 21:40, 3 dipendenti avvisati» e uno stato «Pubblicata» accanto alla settimana. Se fallisce: messaggio persistente «Turni non pubblicati: controlla la connessione e riprova», con «Riprova».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-04", "type": "usability",
      "title": "«Elimina settimana» primario, accanto a «Pubblica», senza conferma né annullamento",
      "description": "Fatto: turni.html:28 usa btn-primary come Pubblica (componenti.md: una sola azione primaria per vista, .btn-danger per le azioni distruttive). app.js:22-25 esegue DELETE senza conferma, svuota #week con innerHTML=\"\" anche se il server fallisce e lascia una griglia vuota senza spiegazione. Sulla schermata del telefono i due pulsanti blu sono attaccati.",
      "evidence": { "url": "turni.html", "screenshot": "schermate/turni-telefono.png", "location": "turni.html:27-28; js/app.js:22-25", "steps": ["Cliccare «Elimina settimana»", "La griglia sparisce subito, senza conferma"] },
      "impact": "Un clic sbagliato accanto all'azione più frequente cancella il lavoro della settimana senza recupero. Dopo un errore del server l'interfaccia mostra uno stato falso.",
      "priority": "P1", "confidence": 0.95,
      "recommendation": "Spostare l'azione in un menu «Altre azioni» con stile btn-danger. Chiedere conferma nominando l'oggetto («Eliminare i turni di lun 2 – dom 8 nov? I dipendenti non li vedranno più»). Aggiornare l'interfaccia solo dopo res.ok. Offrire «Annulla» per qualche secondo. Dopo l'eliminazione mostrare uno stato vuoto con «Crea i turni» e «Copia la settimana precedente».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-05", "type": "usability",
      "title": "«Salva» ricarica la pagina senza esito; l'errore va solo in console",
      "description": "Fatto: app.js:27-35. Dopo il PUT c'è window.location.reload() senza controllare res.ok, e il catch fa solo console.log. Non si sa cosa salvi «Salva» rispetto a «Pubblica» (una bozza?). Il ricaricamento fa perdere la posizione nella pagina.",
      "evidence": { "url": "turni.html", "screenshot": null, "location": "js/app.js:27-35", "steps": ["Cliccare «Salva» senza rete: non succede nulla di visibile"] },
      "impact": "Il responsabile non sa se la bozza è al sicuro, e questo pesa ancora di più con UX-01.",
      "priority": "P2", "confidence": 0.9,
      "recommendation": "Rinominare in «Salva la bozza». Senza ricaricare, mostrare «Bozza salvata alle 21:32» accanto alla settimana. Se fallisce: messaggio persistente con «Riprova». Valutare il salvataggio automatico della bozza.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-06", "type": "usability",
      "title": "Navigazione fra settimane senza effetto e stato della settimana assente",
      "description": "Fatto: i pulsanti #prev-week e #next-week (turni.html:21,23) non hanno gestori in app.js. L'etichetta «02/11 – 08/11» non dice se la settimana è in bozza o pubblicata. Inferenza: la griglia mostra le presenze (pallini) di una settimana già trascorsa insieme ai comandi per pubblicarla; la settimana da preparare (la prossima) non è raggiungibile.",
      "evidence": { "url": "turni.html", "screenshot": "schermate/turni-computer.png", "location": "turni.html:20-24; js/app.js (nessun gestore)", "steps": ["Cliccare ▶: la settimana non cambia"] },
      "impact": "Non si arriva alla settimana da preparare e non si capisce su quale settimana agisce «Pubblica».",
      "priority": "P2", "confidence": 0.85,
      "recommendation": "Collegare ◀ ▶ (con etichette «Settimana precedente» e «Settimana successiva»). Aprire per default la prossima settimana da preparare. Mettere accanto all'intervallo un badge con testo «Bozza», «Pubblicata il …» o «Modificata dopo la pubblicazione».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-07", "type": "usability",
      "title": "Su telefono la settimana esce dallo schermo",
      "description": "Fatto: css/app.css:52 fissa .week a width:1100px. In schermate/turni-telefono.png la pagina è larga circa 1126 px rispetto ai 390 della barra di navigazione. Fatto: in ricerca/interviste.md I1, I2, I4 e I5 preparano i turni dal telefono, almeno a volte. La sintesi (ricerca/sintesi.md:19) raccomanda invece un pannello pensato per il computer.",
      "evidence": { "url": "turni.html", "screenshot": "schermate/turni-telefono.png", "location": "css/app.css:52; ricerca/interviste.md:7,15,29,36", "steps": ["Aprire turni.html a 390 px", "Serve lo scorrimento orizzontale dell'intera pagina"] },
      "impact": "Il compito più frequente è faticoso proprio nel contesto d'uso prevalente.",
      "priority": "P1", "confidence": 0.8,
      "recommendation": "Su telefono, vista per giorno o per dipendente (lista di schede) con le azioni Pubblica e Salva fisse in basso. Da coordinare con UI Designer e UX Researcher: la sintesi della ricerca non è coerente con le interviste.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "UX-08", "type": "information_architecture",
      "title": "Gli scambi da approvare stanno nelle Impostazioni, chiusi; il banner non porta lì",
      "description": "Fatto: impostazioni.html:41-51, sezione <details> chiusa (schermate/impostazioni-computer.png). index.html:22-24: il banner «3 scambi da approvare» è uno <span> e non un link. ricerca/interviste.md:32 (I4): «nel pannello non capisco dove approvarli». La sintesi (sintesi.md:21) li mette nelle impostazioni «perché si configura una volta sola», ma l'approvazione avviene più volte a settimana (README, compito 2).",
      "evidence": { "url": "index.html → impostazioni.html", "screenshot": "schermate/impostazioni-computer.png", "location": "index.html:22-24; impostazioni.html:41-51", "steps": ["Dal cruscotto cliccare il banner: non succede nulla", "Aprire Settings", "Espandere «Scambi da approvare»"] },
      "impact": "Il secondo compito per frequenza richiede di scoprire la sezione giusta e fare 3 passaggi. La notifica arriva, ma l'utente non trova dove agire.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Mettere gli scambi in attesa dove si guarda la settimana: un riquadro «Scambi da approvare (3)» in cima a turni.html, aperto quando ce ne sono. Il banner del cruscotto e la notifica devono essere link diretti (es. turni.html#scambi). Da coordinare con l'Information Architect.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-09", "type": "usability",
      "title": "Approvare o rifiutare uno scambio non produce effetto né esito",
      "description": "Fatto: i pulsanti «OK» e «No» di impostazioni.html:46-48 non hanno gestori in app.js. Non c'è conferma del rifiuto né aggiornamento della riga o del badge «3», e non c'è uno stato vuoto per quando non restano scambi. Mancano le informazioni per decidere, come le ore del collega nella settimana o una sovrapposizione con un suo turno. Le date sono in formato ISO, al contrario del glossario.",
      "evidence": { "url": "impostazioni.html", "screenshot": null, "location": "impostazioni.html:42-48; js/app.js (nessun gestore)", "steps": ["Espandere «Scambi da approvare»", "Cliccare «OK»: la riga resta, il badge resta 3"] },
      "impact": "Il compito 2 non si chiude e il responsabile non sa se il dipendente è stato avvisato.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Pulsanti «Approva» e «Rifiuta». Dopo l'esito, togliere la riga con il messaggio «Scambio approvato: Marta F. lavora sab 7 nov 18:00–00:30. Giulia e Marta sono state avvisate» e «Annulla» per qualche secondo. Badge decrementato. Rifiuto con motivo facoltativo. Stato vuoto: «Nessuno scambio da approvare». In caso di errore la riga resta, con il messaggio vicino. Mostrare gli eventuali conflitti (ore, sovrapposizioni) nella riga.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-10", "type": "usability",
      "title": "Finestra dello scambio in turni.html: chiusura, focus ed esito",
      "description": "Fatto: turni.html:48-56. La chiusura è uno <span> ✕ (non un pulsante), non c'è Esc e il focus non viene gestito (componenti.md:27 lo richiede). L'azione è «OK» con classe .button fuori dal design system. In app.js:43-47 dopo il POST mancano il controllo di res.ok e l'aggiornamento della cella; il testo dice «Fatto!». Non è chiaro se sia un'assegnazione diretta del responsabile o una richiesta da approvare.",
      "evidence": { "url": "turni.html", "screenshot": null, "location": "turni.html:48-56; js/app.js:37-47", "steps": ["Cliccare ⇄ sul turno di sabato di Giulia R.", "Premere Esc: la finestra resta aperta", "Cliccare OK: la cella mostra ancora Giulia"] },
      "impact": "Esito incerto e griglia non aggiornata; da tastiera la finestra intrappola o perde il contesto.",
      "priority": "P2", "confidence": 0.85,
      "recommendation": "Usare <dialog> o una finestra conforme a componenti.md: un pulsante «Chiudi», Esc, focus al campo e poi restituito a ⇄. Azione «Assegna il turno a Marta F.». Dopo res.ok aggiornare la cella e mostrare un messaggio con il nome; in caso di errore, messaggio nella finestra senza chiuderla. Per gli aspetti di tastiera rimando all'Accessibility Specialist.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-11", "type": "usability",
      "title": "13 campi obbligatori per invitare un dipendente",
      "description": "Fatto: dipendenti.html:35-47 segna come obbligatori 13 campi (fra cui IBAN, codice fiscale, indirizzo, livello CCNL). Il README dice che per l'invito bastano nome e numero di telefono. I campi hanno solo il segnaposto e nessuna etichetta (contro componenti.md:22). Le date chiedono due formati diversi (righe 40 e 46). Il pulsante dice «Procedi».",
      "evidence": { "url": "dipendenti.html", "screenshot": "schermate/dipendenti-computer.png", "location": "dipendenti.html:32-50", "steps": ["Scorrere fino a «Aggiungi una risorsa»", "Contare i campi con *"] },
      "impact": "Il compito 3 diventa lungo e si blocca se il responsabile non ha i dati amministrativi del dipendente. Con UX-01 il rischio di perdere quanto inserito è alto.",
      "priority": "P1", "confidence": 0.85,
      "recommendation": "Modulo «Invita un dipendente» con nome, cognome, telefono e ruolo, etichette visibili e pulsante «Invia l'invito». I dati amministrativi vanno in un secondo momento, facoltativi o completati dal dipendente. La raccolta di IBAN e codice fiscale va passata all'agenzia privacy per la minimizzazione: non è oggetto di questo rilievo.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "UX-12", "type": "usability",
      "title": "Validazione ed errori del modulo: telefono rifiutato, colpa all'utente, dati cancellati",
      "description": "Fatto: app.js:57 accetta solo 10 cifre consecutive, quindi rifiuta il formato che la tabella stessa usa («333 120 4455», dipendenti.html:26) e +39. Il messaggio «Hai sbagliato il numero.» (riga 58) dà la colpa all'utente e non dice il formato atteso. Non è collegato al campo e non viene cancellato quando il valore è corretto. Gli altri 12 campi obbligatori non sono controllati (form novalidate). Dopo un errore del server compare «Errore ${status}: payload non valido» (riga 64) e form.reset() (riga 65) cancella tutto. Gli errori di rete vanno solo in console (righe 69-71). Il pulsante resta attivo durante la richiesta. Inoltre #form-error non è dentro .field, quindi lo stile .field .error (css/app.css:66) non gli si applica.",
      "evidence": { "url": "dipendenti.html", "screenshot": null, "location": "js/app.js:53-72; dipendenti.html:37,49", "steps": ["Inserire telefono «333 120 4455»", "Cliccare «Procedi»: «Hai sbagliato il numero.»", "Con il server che risponde 400 il modulo si svuota"] },
      "impact": "Errori evitabili, recupero impossibile e reinserimento di 14 campi. È un probabile caso di WCAG 2.2, 3.3.7 Redundant Entry (A) (scheda wcag-2-2, W3C Recommendation del 5 ottobre 2023, verificata il 2026-11-19), oltre a 3.3.1 e 3.3.3, che sono fuori dalla scheda e vanno confermati dall'Accessibility Specialist.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Normalizzare il telefono (togliere spazi, accettare +39) invece di rifiutarlo. Validare tutti i campi obbligatori con un messaggio sotto ciascuno, collegato con aria-describedby, per esempio «Inserisci il numero di cellulare, es. 333 120 4455». Non svuotare mai il modulo dopo un errore. Errore del server: «Invito non inviato. Controlla i dati e riprova; se il problema resta, riprova più tardi». Pulsante disattivato con «Invio…» durante la richiesta.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-13", "type": "usability",
      "title": "Invito riuscito senza esito visibile",
      "description": "Fatto: app.js:68 mostra soltanto toast(\"Fatto!\") per 1,5 s. Il nuovo dipendente non compare nella tabella #staff, il modulo resta compilato (un secondo clic crea un duplicato) e non si dice nulla dell'invito all'app.",
      "evidence": { "url": "dipendenti.html", "screenshot": null, "location": "js/app.js:61-68", "steps": ["Compilare e inviare con risposta 200", "La tabella non cambia, il modulo resta pieno"] },
      "impact": "Il responsabile non sa se il dipendente è stato aggiunto né se ha ricevuto l'invito; rischio di duplicati.",
      "priority": "P2", "confidence": 0.9,
      "recommendation": "Aggiungere la riga con lo stato «Invito inviato» e svuotare il modulo. Messaggio persistente o annunciato: «Mario Rossi aggiunto. Invito inviato al 333 120 4455», con «Invia di nuovo» se non arriva.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-14", "type": "usability",
      "title": "Ricerca senza stato vuoto; modifica ed eliminazione del dipendente senza comportamento",
      "description": "Fatto: app.js:78 ammette nel commento che senza risultati la tabella resta vuota. Non c'è un messaggio né un modo per azzerare la ricerca, e il segnaposto usa «collaboratore» (contro il glossario). I pulsanti ✎ e 🗑 di dipendenti.html:26-28 non hanno gestori né nomi accessibili; per 🗑 non è prevista una conferma.",
      "evidence": { "url": "dipendenti.html", "screenshot": null, "location": "js/app.js:74-79; dipendenti.html:20,26-28", "steps": ["Cercare «zzz»: resta solo l'intestazione", "Cliccare 🗑: non succede nulla"] },
      "impact": "Non si capisce se il dipendente non esiste o se la pagina non funziona. Una futura eliminazione senza conferma sarebbe un rischio.",
      "priority": "P2", "confidence": 0.9,
      "recommendation": "Riga vuota «Nessun dipendente trovato per “zzz”» con «Azzera la ricerca». Pulsanti «Modifica Giulia R.» e «Elimina Giulia R.». Eliminazione con conferma che nomina la persona e spiega le conseguenze (turni futuri, accesso all'app), con «Annulla» dopo l'azione.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-15", "type": "usability",
      "title": "Esportazione delle presenze a 3 livelli di profondità, dentro «Locale», e senza comportamento",
      "description": "Fatto: impostazioni.html:22-38 mette l'esportazione in Impostazioni › Locale › Esporta › Presenze per il consulente (anche docs/mappa.md:12), tutto in <details> chiusi. Il link «Clicca qui» (riga 32) ha href=\"#\" e non ha gestore; lo stesso vale per «Scarica il report» (riga 36). Non ci sono stati di preparazione del file, di mese senza presenze né di errore. ricerca/interviste.md:11 (I1): «non trovo mai dove sta il pulsante», mentre la sintesi (sintesi.md:11) dice che l'esportazione «funziona».",
      "evidence": { "url": "impostazioni.html", "screenshot": "schermate/impostazioni-computer.png", "location": "impostazioni.html:22-38", "steps": ["Aprire Settings", "Espandere Locale, poi Esporta, poi Presenze per il consulente", "Cliccare «Clicca qui»: la pagina torna in cima"] },
      "impact": "Il compito mensile del titolare è difficile da trovare e non si porta a termine.",
      "priority": "P1", "confidence": 0.85,
      "recommendation": "Una sezione o pagina «Presenze» di primo livello (o almeno una sezione di Impostazioni non annidata), con mese preselezionato al mese chiuso e pulsante «Scarica le presenze di ottobre 2026 (CSV)». Stati: «Preparazione del file…»; «Nessuna presenza registrata a ottobre 2026»; errore con «Riprova». Dopo il download, «Scaricato il 2 nov».",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "UX-16", "type": "usability",
      "title": "Salvataggio automatico delle impostazioni senza indicatore né errore",
      "description": "Fatto: impostazioni.html:20 promette «Le modifiche si salvano da sole». app.js:92-94 invia un PATCH al change senza corpo apparente, senza controllare la risposta e senza mostrare nulla. Il campo si chiama «Nome del negozio» (glossario: locale).",
      "evidence": { "url": "impostazioni.html", "screenshot": null, "location": "impostazioni.html:20,24-25; js/app.js:92-94", "steps": ["Modificare gli orari di apertura e uscire dal campo: nessun segnale"] },
      "impact": "L'utente non sa se la modifica è stata salvata; un errore passa inosservato.",
      "priority": "P2", "confidence": 0.85,
      "recommendation": "Accanto al campo «Salvataggio…», poi «Salvato», annunciati con role=status. In caso di errore: «Non salvato: riprova» e il valore resta nel campo. In alternativa, un pulsante «Salva le modifiche» esplicito.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-17", "type": "usability",
      "title": "Eliminazione del locale con conferma generica e reindirizzamento anche in caso di errore",
      "description": "Fatto: app.js:86 usa confirm(\"Vuoi davvero procedere?\"), che non nomina il locale né le conseguenze (turni, dipendenti, presenze) e mette il pulsante di conferma come predefinito. Dopo la DELETE, alla riga 88 reindirizza a /addio senza controllare res.ok. La zona pericolosa sta subito sotto gli scambi da approvare.",
      "evidence": { "url": "impostazioni.html", "screenshot": "schermate/impostazioni-computer.png", "location": "impostazioni.html:53-54; js/app.js:83-90", "steps": ["Cliccare «Elimina locale»", "Confermare il dialogo generico: reindirizzamento immediato"] },
      "impact": "Azione irreversibile confermabile per abitudine. Un fallimento viene presentato come riuscito.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Finestra dedicata: «Eliminare Trattoria Il Ponte? Si cancellano turni, dipendenti e presenze. Prima scarica le presenze». Fare digitare il nome del locale per abilitare «Elimina il locale», con «Annulla» come azione predefinita. Reindirizzare solo dopo res.ok; altrimenti mostrare l'errore nella finestra. Valutare un periodo di recupero (es. 30 giorni).",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "UX-18", "type": "usability",
      "title": "Toast di 1,5 secondi, generico e non annunciato",
      "description": "Fatto: app.js:8 nasconde il toast dopo 1500 ms. Il testo è sempre «Fatto!» (righe 19, 46, 68) e il div #toast non ha role=status né aria-live.",
      "evidence": { "url": "turni.html, dipendenti.html, impostazioni.html", "screenshot": null, "location": "js/app.js:3-9; turni.html:58; dipendenti.html:53", "steps": ["Pubblicare: il messaggio sparisce prima di poterlo leggere"] },
      "impact": "L'esito si perde, soprattutto su telefono e con le tecnologie assistive.",
      "priority": "P3", "confidence": 0.85,
      "recommendation": "Durata di almeno 5 s o fino alla chiusura. Testo specifico per azione (vedi UX-03, UX-09, UX-13), role=status. Gli errori in un messaggio persistente, non nel toast.",
      "status": "Nuova", "requires_human_review": false
    }
  ],
  "tested_scenarios": [
    "Lettura statica di index.html, turni.html, dipendenti.html, impostazioni.html e js/app.js, confrontati con i 5 compiti del README",
    "Confronto con docs/mappa.md, docs/componenti.md, docs/glossario.md, ricerca/interviste.md, ricerca/sintesi.md",
    "Esame delle schermate turni-computer.png, turni-telefono.png, impostazioni-computer.png"
  ],
  "limitations": [
    "Nessuna prova nel browser, come da istruzioni: i passaggi elencati sono dedotti dal codice e non eseguiti; il comportamento delle chiamate /api è inferito (non c'è un server)",
    "Il prototipo è statico: per UX-02, UX-11 e UX-15 non posso escludere che le funzioni mancanti siano previste altrove (requires_human_review)",
    "Non ho potuto caricare AIWDA-01 né usare il tool library; ho letto la scheda wcag-2-2 con il comando npm indicato. I criteri 2.2.1, 3.3.1, 3.3.3 e 4.1.3 non sono nella scheda e vanno confermati dall'Accessibility Specialist",
    "Il cruscotto (grafici, assi tronchi, torta a 8 fette) non è stato valutato: è di competenza del Dashboard e Data Visualization Designer; nemmeno nomi del menu, lingua lang=\"en\" e testi in dettaglio, che spettano all'Information Architect e allo UX Writer",
    "Ho guardato solo 3 schermate su 8"
  ],
  "summary": "AIWDA-03 · HADAR: nessun compito del README ha un ciclo completo «azione, attesa, esito, recupero». Fuori dal modulo dei dipendenti, che controlla res.ok ma poi mostra un errore tecnico e svuota il modulo, il codice non controlla mai le risposte del server e mostra «Fatto!» anche quando fallisce. Molti controlli non hanno un comportamento (settimane, approvazione degli scambi, esportazione, modifica ed eliminazione del dipendente). Le azioni distruttive non hanno una conferma adeguata, gli scambi e l'esportazione sono difficili da trovare e l'uscita automatica fa perdere il lavoro. 9 P1, 7 P2, 1 P3, nessun P0."
}
```

## Domande aperte per il direttore e l'utente

1. L'editor della settimana (UX-02) e l'esportazione (UX-15) sono nel perimetro del prototipo, oppure sono previsti altrove?
2. Lo scambio in turni.html (⇄) è un'assegnazione diretta del responsabile o una richiesta da approvare? Cambia il flusso di UX-10 rispetto a UX-09.
3. La sintesi della ricerca contraddice le interviste: uso dal telefono, frequenza d'uso, posizione degli scambi, esportazione che «funziona». Propongo un riesame dello UX Researcher prima di usarla per le priorità.
4. Passaggi ad altri ruoli. Accessibility Specialist: UX-01, UX-10, UX-12 e i nomi dei pulsanti con sola icona. Information Architect: UX-08, UX-15 e l'ordine del menu (prima voce «Settings», mentre il compito più frequente è Turni). Agenzia privacy: dati richiesti in UX-11. Dataviz: cruscotto.

Firmato: AIWDA-03 · HADAR — Senior UX Designer, reparto AIWDA (AI Web Design)
