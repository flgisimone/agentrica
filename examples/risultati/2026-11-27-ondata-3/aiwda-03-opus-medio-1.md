AIWDA-03 · HADAR — Senior UX Designer, reparto AIWDA (AI Web Design)

Consegna a AIWDA-01 · CANOPUS. Non ho potuto caricare il direttore perché in questo ambiente non ho il tool `agent`: il consolidamento resta a lui.

**P0 da segnalare subito all'utente:** in turni.html il pulsante «Elimina settimana» cancella l'intera settimana dei turni con un clic. Non chiede conferma, non si può annullare e ha lo stesso stile primario di «Pubblica i turni», accanto al quale si trova (rilievo T-02).

## Esito
Ho esaminato in sola lettura i cinque compiti del README su index.html, turni.html, dipendenti.html, impostazioni.html e js/app.js, con le schermate in `schermate/`. Ho trovato 17 rilievi: 1 P0, 10 P1, 5 P2 e 1 P3.

Il problema di fondo è unico: nessuna azione verso il server mostra uno stato di caricamento o un errore. `fetch()` non fallisce sulle risposte HTTP di errore e il codice non controlla mai `res.ok`. Gli errori di rete finiscono solo in `console.log`. Così il pannello dice «Fatto!» anche quando l'operazione non è riuscita.

Diversi controlli non hanno alcun gestore in app.js, quindi non fanno nulla: «OK» e «No» degli scambi, «Clicca qui» dell'esportazione, ◀ e ▶ per cambiare settimana, ✎ e 🗑 dei dipendenti.

## Rilievi (JSON)
```json
{
  "project": "Turnio – pannello web",
  "audit_id": null,
  "agent": "AIWDA-03 · HADAR",
  "page": {"name": "Pannello (4 pagine) e js/app.js", "url": "index.html, turni.html, dipendenti.html, impostazioni.html"},
  "observations": [
    {"id":"G-01","type":"usability","title":"Uscita forzata dopo 10 minuti dal caricamento, senza preavviso",
     "description":"app.js:12 manda a /login 10 minuti dopo il caricamento della pagina. Il commento dice «senza richieste al server», ma il timer non si azzera mai e non c'è nessun avviso prima dell'uscita. Preparare i turni della settimana o compilare il modulo da 14 campi richiede facilmente più di 10 minuti: quello che non è stato salvato va perso.",
     "evidence":{"url":"tutte le pagine","screenshot":null,"location":"js/app.js:12","steps":["Aprire turni.html","Lavorare 10 minuti senza ricaricare","Redirect a /login"]},
     "impact":"Lavoro perso nel compito principale (1) e nel compito 3. Non soddisfa WCAG 2.2, 2.2.1 Timing Adjustable (livello A).",
     "priority":"P1","confidence":0.9,
     "recommendation":"Azzerare il timer a ogni attività. Un minuto prima della scadenza avvisare con «Stai per uscire: resta collegato». Prima di uscire, salvare la bozza.",
     "status":"Nuova","requires_human_review":false},
    {"id":"G-02","type":"usability","title":"Nessuna azione distingue riuscita, errore e caricamento",
     "description":"Accade in app.js alle righe 18–19, 23–24, 29–34, 44–46, 62–71, 87–88 e 93. Nessun controllo di res.ok. Durante la richiesta nessun pulsante si disattiva e non compare nessun indicatore. Gli errori vanno solo in console.log (33, 70). toast() (3–9) resta visibile 1,5 s con il testo generico «Fatto!». L'elemento #toast (es. turni.html:58) non ha role=\"status\".",
     "evidence":{"url":"turni.html, dipendenti.html, impostazioni.html","screenshot":null,"location":"js/app.js:3-9 e i gestori elencati","steps":["Leggere i gestori: dopo await fetch segue sempre il messaggio di successo, senza controllare la risposta"]},
     "impact":"Chi usa il pannello crede di aver pubblicato o salvato anche quando non è vero. I doppi clic producono doppi invii. Il messaggio non viene annunciato ai lettori di schermo (WCAG 2.2, 4.1.3).",
     "priority":"P1","confidence":0.9,
     "recommendation":"Un'unica gestione comune delle richieste. Prima della richiesta: pulsante disattivato con l'etichetta «Pubblicazione…». Se va a buon fine: messaggio specifico («Turni dal 9 al 15 nov pubblicati a 3 dipendenti») visibile per almeno 5 s, oppure fino alla chiusura. Se fallisce: messaggio persistente che dice cosa è successo, con il pulsante «Riprova». Toast con role=status.",
     "status":"Nuova","requires_human_review":false},
    {"id":"T-01","type":"usability","title":"Pubblicazione senza riepilogo, senza stato e senza esito affidabile",
     "description":"Il gestore di «Pubblica i turni» (turni.html:27; app.js:17-20) invia la richiesta e mostra «Fatto!». Prima non c'è un riepilogo (settimana, numero di dipendenti, turni scoperti). Dopo non cambia lo stato della settimana: la pagina non indica in nessun punto se la settimana è una bozza o è già pubblicata. Non è chiaro neppure se «Pubblica» salva le modifiche non salvate, dato che «Salva» è un pulsante separato.",
     "evidence":{"url":"turni.html","screenshot":"schermate/turni-computer.png","location":"turni.html:26-30; js/app.js:17-20","steps":["Aprire turni.html","Premere Pubblica i turni","Compare «Fatto!» per 1,5 s; la pagina resta identica"]},
     "impact":"Compito 1, settimanale: chi usa il pannello non sa se e che cosa hanno ricevuto i dipendenti.",
     "priority":"P1","confidence":0.85,
     "recommendation":"Mostrare lo stato della settimana accanto all'intervallo di date (Bozza / Pubblicata il …). «Pubblica i turni» salva e pubblica in un solo passo, dopo un breve riepilogo. Dopo la pubblicazione lo stato diventa «Pubblicata» e il pulsante «Pubblica le modifiche».",
     "status":"Nuova","requires_human_review":false},
    {"id":"T-02","type":"usability","title":"«Elimina settimana» senza conferma, irreversibile, stile primario accanto a Pubblica",
     "description":"turni.html:28 usa btn-primary, cioè lo stesso stile e lo stesso peso di «Pubblica i turni» che gli sta accanto. app.js:22-25 chiama subito DELETE e svuota #week, anche se la richiesta fallisce. Non c'è conferma, non si può annullare e non compare uno stato vuoto: la griglia sparisce del tutto.",
     "evidence":{"url":"turni.html","screenshot":"schermate/turni-telefono.png","location":"turni.html:28; js/app.js:22-25","steps":["Aprire turni.html","Premere Elimina settimana","La griglia scompare senza alcuna domanda"]},
     "impact":"Con un clic sbagliato, soprattutto da telefono, dove i due pulsanti sono attaccati, si perde il lavoro di preparazione della settimana.",
     "priority":"P0","confidence":0.9,
     "recommendation":"Spostare l'azione in un menu secondario con stile btn-danger. Chiedere conferma con le conseguenze in chiaro: «Eliminare i turni dal 2 all'8 nov? I dipendenti non li vedranno più». Il pulsante di conferma dice «Elimina i turni», non «OK». Dopo l'eliminazione mostrare uno stato vuoto («Nessun turno per questa settimana» con «Crea i turni» e «Copia dalla settimana precedente») e il pulsante «Annulla» per qualche secondo. Svuotare la griglia solo se il server ha risposto ok.",
     "status":"Nuova","requires_human_review":false},
    {"id":"T-03","type":"usability","title":"Non si possono preparare né modificare i turni; «Salva» ricarica e perde il contesto",
     "description":"Le celle della griglia (turni.html:33-44) sono solo testo: non c'è un modo per creare o modificare un turno. «Salva» (app.js:27-35) fa una PUT senza contenuto e poi window.location.reload(). La settimana visualizzata non è nell'URL, quindi dopo la ricarica si torna alla settimana corrente. Se la richiesta fallisce non succede nulla di visibile.",
     "evidence":{"url":"turni.html","screenshot":"schermate/turni-computer.png","location":"turni.html:33-44; js/app.js:27-35","steps":["Cercare un controllo per modificare un turno: non c'è","Premere Salva: la pagina si ricarica"]},
     "impact":"Il compito principale, preparare i turni, non è realizzabile nel prototipo, e il salvataggio fa perdere il contesto.",
     "priority":"P1","confidence":0.7,
     "recommendation":"Rendere modificabile ogni cella: clic o Invio apre la modifica del turno, con «Riposo» come scelta. Salvare automaticamente con l'indicatore «Salvato alle 21:14», oppure con «Salva» senza ricaricare la pagina. Mettere la settimana nell'URL (?settimana=2026-11-09). Da confermare se la modifica è prevista in un'altra parte del prodotto.",
     "status":"Nuova","requires_human_review":true},
    {"id":"T-04","type":"usability","title":"Cambio di settimana non funzionante e la pagina non apre la settimana da preparare",
     "description":"I pulsanti ◀ e ▶ (turni.html:21-23) non hanno gestori in app.js e sono solo simboli, senza nome accessibile. L'etichetta «02/11 – 08/11» non segue il formato del glossario («lun 3 feb»). Il README dice che si prepara la domenica per la settimana dopo, ma la pagina apre una settimana già in corso o passata: i pallini delle presenze lo indicano.",
     "evidence":{"url":"turni.html","screenshot":"schermate/turni-computer.png","location":"turni.html:21-23; js/app.js (nessun gestore)","steps":["Premere ▶: non succede nulla"]},
     "impact":"Non si raggiunge la settimana da preparare.",
     "priority":"P1","confidence":0.85,
     "recommendation":"Collegare ◀ e ▶ con aria-label «Settimana precedente» e «Settimana successiva». Dal venerdì in poi aprire la settimana successiva, se è ancora in bozza. Etichetta nella forma «lun 9 – dom 15 nov 2026».",
     "status":"Nuova","requires_human_review":false},
    {"id":"T-05","type":"usability","title":"Griglia dei turni larga 1100 px fissi: sul telefono serve lo scorrimento orizzontale",
     "description":"Il CSS (app.css:52) dà a .week la larghezza fissa di 1100px. La schermata a 390 px mostra la pagina allargata oltre lo schermo. Le interviste I1, I2, I4 e I5 dicono che i turni si preparano anche o soprattutto dal telefono.",
     "evidence":{"url":"turni.html","screenshot":"schermate/turni-telefono.png","location":"css/app.css:52","steps":["Aprire turni.html a 390 px"]},
     "impact":"Il compito 1 sul dispositivo più usato è faticoso.",
     "priority":"P1","confidence":0.8,
     "recommendation":"Sul telefono mostrare un giorno alla volta (o un dipendente alla volta), con le schede dei giorni. Togliere la larghezza fissa. Da coordinare con AIWDA UI.",
     "status":"Nuova","requires_human_review":false},
    {"id":"T-06","type":"usability","title":"Finestra dello scambio: contenuto fisso, focus non gestito, conferma «OK»",
     "description":"Ogni pulsante ⇄ apre la stessa finestra con dati scritti nel codice (turni.html:52). Il focus non entra nella finestra e Esc non la chiude. La chiusura è uno <span> (turni.html:50), che non si raggiunge da tastiera, contro docs/componenti.md. Il pulsante dice «OK» e il titolo dice «Swap» e «fascia», contro il glossario. Dopo la conferma (app.js:43-47) la griglia non si aggiorna. Il ruolo della finestra non è chiaro rispetto agli scambi da approvare delle impostazioni.",
     "evidence":{"url":"turni.html","screenshot":null,"location":"turni.html:48-56; js/app.js:37-47","steps":["Premere ⇄ su sab","Provare Esc e Tab: il focus resta dietro la finestra"]},
     "impact":"Chi usa la tastiera resta bloccato. Dopo uno scambio la griglia mostra ancora il dipendente sbagliato.",
     "priority":"P1","confidence":0.85,
     "recommendation":"Usare <dialog> con showModal() e un pulsante di chiusura vero. Titolo «Scambia il turno», pulsante «Assegna a Marta F.». Dopo la conferma aggiornare la cella e scrivere «Turno di sab 7 nov assegnato a Marta F.».",
     "status":"Nuova","requires_human_review":false},
    {"id":"T-07","type":"data_visualization","title":"Legenda delle presenze senza colori e stato affidato solo al colore",
     "description":"La legenda (turni.html:45) ha tre ● dello stesso colore grigio, come si vede nella schermata. Nella griglia lo stato è indicato solo dal colore del pallino. Alcune celle passate non hanno pallino (sab e dom) e non si capisce perché.",
     "evidence":{"url":"turni.html","screenshot":"schermate/turni-computer.png","location":"turni.html:45; righe 37-43","steps":["Confrontare legenda e pallini"]},
     "impact":"Non si capisce chi è assente. Rilievo legato a WCAG 2.2, 1.4.1.",
     "priority":"P2","confidence":0.85,
     "recommendation":"Usare i badge con testo di docs/componenti.md (Presente / In ritardo / Assente). Per i turni ancora da svolgere indicare «da svolgere».",
     "status":"Nuova","requires_human_review":false},
    {"id":"S-01","type":"information_architecture","title":"Gli scambi da approvare sono nascosti in Settings e il banner del cruscotto non porta lì",
     "description":"Gli scambi, compito 2, svolto più volte a settimana, stanno in impostazioni.html:41-51 dentro un <details> chiuso, sotto la voce di menu «Settings». Il banner «🔔 3 scambi da approvare» (index.html:22-24) è solo testo, senza link. L'intervista I4 lo conferma: «nel pannello non capisco dove approvarli».",
     "evidence":{"url":"index.html, impostazioni.html","screenshot":"schermate/impostazioni-computer.png","location":"index.html:22-24; impostazioni.html:41-51","steps":["Dal cruscotto cliccare il banner: non succede nulla","Trovare la sezione: Settings › aprire Scambi da approvare"]},
     "impact":"Il secondo compito per frequenza richiede di indovinare dove si trova.",
     "priority":"P1","confidence":0.9,
     "recommendation":"Portare gli scambi da approvare in Turni, come pannello sopra la griglia o come voce di menu propria con il contatore. Il banner diventa un link che porta lì. Il link della notifica dell'app apre direttamente lo scambio. Da coordinare con AIWDA IA.",
     "status":"Nuova","requires_human_review":false},
    {"id":"S-02","type":"usability","title":"«OK» e «No» degli scambi non fanno nulla",
     "description":"I pulsanti di impostazioni.html:46-48 non hanno gestori in app.js. Non c'è feedback, la riga non sparisce e il contatore resta a 3 (riga 42, e index.html:23). Le etichette non sono verbi (glossario) e le date sono in formato ISO (2026-11-07). «No» non chiede conferma né un motivo per il dipendente. Manca lo stato vuoto «Nessuno scambio da approvare».",
     "evidence":{"url":"impostazioni.html","screenshot":null,"location":"impostazioni.html:42-48; js/app.js (nessun gestore)","steps":["Aprire Scambi da approvare","Premere OK: nessun effetto"]},
     "impact":"Non si può completare il compito 2 e non si sa se il dipendente è stato avvisato.",
     "priority":"P1","confidence":0.85,
     "recommendation":"Pulsanti «Approva» e «Rifiuta». Durante la richiesta mostrare lo stato di attesa. Dopo, togliere la riga con «Scambio approvato: Marta F. lavora sab 7 nov» e il pulsante «Annulla». Aggiornare i contatori. Per il rifiuto prevedere un motivo facoltativo. Date nella forma «sab 7 nov, 18:00–00:30».",
     "status":"Nuova","requires_human_review":false},
    {"id":"D-01","type":"usability","title":"Il modulo per aggiungere un dipendente chiede 14 campi, ma l'invito ne richiede 2",
     "description":"Il README dice che il dipendente nuovo riceve l'invito con nome e numero di telefono. Il modulo (dipendenti.html:35-47) rende obbligatori 13 campi, fra cui codice fiscale, IBAN, indirizzo e livello CCNL. È in fondo alla pagina, sotto la tabella, e il pulsante dice «Procedi».",
     "evidence":{"url":"dipendenti.html","screenshot":"schermate/dipendenti-telefono.png","location":"dipendenti.html:32-51","steps":["Scorrere fino al modulo","Contare i campi obbligatori"]},
     "impact":"Il compito 3 è lungo, soprattutto da telefono, e rischia di scadere per l'uscita forzata (G-01). C'è anche un tema di minimizzazione dei dati, da girare ad AIPCA.",
     "priority":"P1","confidence":0.8,
     "recommendation":"Pulsante «Aggiungi dipendente» in cima alla pagina. Modulo corto: nome, cognome, telefono e ruolo, con il pulsante «Aggiungi e invia l'invito». I dati amministrativi si chiedono dopo o li compila il dipendente nell'app. Da confermare con l'utente e con AIPCA.",
     "status":"Nuova","requires_human_review":true},
    {"id":"D-02","type":"usability","title":"Validazione e errori del modulo: rifiuta numeri validi, colpevolizza, mostra codici tecnici e svuota il modulo",
     "description":"Il modulo ha novalidate (riga 34). Solo il telefono viene controllato (app.js:57-60), con /^\\d{10}$/: rifiuta «333 120 4455», cioè il formato usato dalla tabella stessa, e i numeri con +39. Il messaggio è «Hai sbagliato il numero.»: dà la colpa all'utente e non indica il formato. L'errore compare in fondo (riga 49), non è collegato al campo e non usa aria-invalid. Gli altri campi obbligatori non vengono controllati. Se il server risponde con un errore, app.js:64-65 mostra «Errore 400: payload non valido» e chiama form.reset(), cancellando tutto. Se la rete fallisce, l'errore finisce solo in console (69-71).",
     "evidence":{"url":"dipendenti.html","screenshot":null,"location":"js/app.js:53-72; dipendenti.html:34-50","steps":["Inserire 333 120 4455","Premere Procedi: «Hai sbagliato il numero.»"]},
     "impact":"Dati validi rifiutati e dati persi dopo un errore del server. Riguarda WCAG 2.2, 3.3.1 e 3.3.3.",
     "priority":"P1","confidence":0.9,
     "recommendation":"Accettare spazi e +39, normalizzandoli. Messaggio sotto il campo: «Scrivi un numero di cellulare, es. 333 120 4455». Usare aria-invalid e aria-describedby e portare il focus sul primo errore. Non svuotare mai il modulo dopo un errore. Errore del server: «Non siamo riusciti ad aggiungere il dipendente. Riprova; i dati restano nel modulo».",
     "status":"Nuova","requires_human_review":false},
    {"id":"D-03","type":"usability","title":"Dopo l'aggiunta l'elenco non si aggiorna e non si dice che l'invito è partito",
     "description":"Se l'invio riesce (app.js:68) compare solo «Fatto!» per 1,5 s. Il modulo resta compilato e la tabella #staff non cambia. Il pulsante non si disattiva durante l'invio, quindi si possono creare doppioni.",
     "evidence":{"url":"dipendenti.html","screenshot":null,"location":"js/app.js:61-68","steps":["Inviare il modulo valido"]},
     "impact":"Chi usa il pannello non sa se il dipendente esiste e se ha ricevuto l'invito. Può reinviare il modulo e creare doppioni.",
     "priority":"P1","confidence":0.85,
     "recommendation":"Aggiungere la riga in tabella, evidenziata, con lo stato «Invito inviato al 333 120 4455» e l'azione «Reinvia l'invito». Svuotare il modulo solo a questo punto.",
     "status":"Nuova","requires_human_review":false},
    {"id":"D-04","type":"usability","title":"Ricerca senza stato vuoto; modifica ed eliminazione dei dipendenti senza gestori",
     "description":"Il commento in app.js:78 lo ammette: senza risultati la tabella resta vuota. La ricerca (dipendenti.html:20) ha solo un segnaposto, senza etichetta, e usa il termine «collaboratore». ✎ e 🗑 (righe 26-28) non hanno gestori né nome accessibile, e 🗑 non ha una conferma prevista.",
     "evidence":{"url":"dipendenti.html","screenshot":"schermate/dipendenti-telefono.png","location":"js/app.js:74-79; dipendenti.html:20,26-28","steps":["Cercare «zzz»: tabella vuota senza messaggio"]},
     "impact":"Senza un messaggio non si capisce se il dipendente non esiste o se la ricerca è sbagliata.",
     "priority":"P2","confidence":0.85,
     "recommendation":"Riga «Nessun dipendente trovato per “zzz”» con «Cancella la ricerca». Pulsanti con aria-label «Modifica Giulia R.» ed «Elimina Giulia R.». L'eliminazione chiede conferma e dice le conseguenze sui turni futuri.",
     "status":"Nuova","requires_human_review":false},
    {"id":"E-01","type":"information_architecture","title":"Esportazione delle presenze sepolta a tre livelli e pulsante che non fa nulla",
     "description":"Il percorso è Settings › Locale › Esporta › Presenze per il consulente: <details> annidati (impostazioni.html:22-38) dentro «Locale», che non c'entra. Il link «Clicca qui» ha href=\"#\" e nessun gestore. Non ci sono stati di preparazione del file, riuscita o errore. docs/mappa.md elenca il report anche nel cruscotto, ma index.html non lo contiene. L'intervista I1 conferma: «non trovo mai dove sta il pulsante».",
     "evidence":{"url":"impostazioni.html","screenshot":"schermate/impostazioni-computer.png","location":"impostazioni.html:27-38","steps":["Aprire Locale, poi Esporta, poi Presenze per il consulente","Premere Clicca qui: nessun effetto"]},
     "impact":"Il compito 4, mensile, è difficile da trovare e non si completa.",
     "priority":"P1","confidence":0.9,
     "recommendation":"Una sezione «Presenze» o «Esporta» di primo livello, raggiungibile anche dal cruscotto. Selettore del mese con default sul mese chiuso e pulsante «Scarica le presenze di ottobre 2026 (Excel)». Durante la preparazione: «Preparo il file…». Se fallisce: messaggio con «Riprova».",
     "status":"Nuova","requires_human_review":false},
    {"id":"I-01","type":"usability","title":"Salvataggio automatico delle impostazioni senza conferma né errore",
     "description":"La pagina dice «Le modifiche si salvano da sole» (impostazioni.html:20). Il codice (app.js:92-94) invia la PATCH su change senza contenuto, non mostra «Salvato» e non gestisce l'errore.",
     "evidence":{"url":"impostazioni.html","screenshot":null,"location":"js/app.js:92-94","steps":["Modificare Nome del negozio e uscire dal campo: nessun riscontro"]},
     "impact":"Un salvataggio fallito passa inosservato.",
     "priority":"P2","confidence":0.85,
     "recommendation":"Accanto al campo mostrare «Salvataggio…», poi «Salvato». Se fallisce: «Non salvato. Riprova», con il valore lasciato nel campo.",
     "status":"Nuova","requires_human_review":false},
    {"id":"I-02","type":"usability","title":"Eliminazione del locale con conferma generica e redirect senza controllo dell'esito",
     "description":"La conferma (app.js:86) è «Vuoi davvero procedere?»: non nomina il locale né le conseguenze. Dopo il DELETE il redirect a /addio avviene anche se la richiesta è fallita (87-88).",
     "evidence":{"url":"impostazioni.html","screenshot":"schermate/impostazioni-computer.png","location":"impostazioni.html:53-54; js/app.js:85-90","steps":["Premere Elimina locale"]},
     "impact":"È un'azione irreversibile su tutti i dati del locale, protetta da una conferma che non informa.",
     "priority":"P1","confidence":0.85,
     "recommendation":"Finestra con le conseguenze («Elimini Trattoria Il Ponte: turni, dipendenti e presenze. Non si può annullare. Esporta prima le presenze»). Chiedere di digitare il nome del locale. Pulsante «Elimina il locale». Redirect solo se il server ha risposto ok.",
     "status":"Nuova","requires_human_review":false},
    {"id":"N-01","type":"information_architecture","title":"Menu in ordine di cartella, misto inglese/italiano, e prima pagina sul cruscotto",
     "description":"Il menu ha l'ordine Settings, Dashboard, Squadra, Turni in tutte le pagine (es. turni.html:11-16). Secondo docs/mappa.md l'ordine è quello delle pagine nella cartella, non quello dei compiti. Le etichette non coincidono con i titoli: «Squadra» porta a una pagina con h1 «Personale», «Settings» a una con h1 «Impostazioni». La prima pagina è il cruscotto, ma le interviste I1, I2 e I5 dicono di non usarlo. Il compito più frequente, Turni, è l'ultima voce.",
     "evidence":{"url":"tutte le pagine","screenshot":"schermate/index-computer.png","location":"turni.html:11-16; docs/mappa.md","steps":["Confrontare l'ordine del menu con l'ordine dei compiti del README"]},
     "impact":"Rende più lento ogni accesso al compito principale.",
     "priority":"P2","confidence":0.75,
     "recommendation":"Ordine del menu: Turni (pagina iniziale), Scambi, Dipendenti, Presenze, Cruscotto, Impostazioni, tutte in italiano e uguali ai titoli. Da coordinare con AIWDA IA.",
     "status":"Nuova","requires_human_review":true},
    {"id":"N-02","type":"content","title":"Testi di pulsanti e messaggi contro il glossario",
     "description":"Molti testi non seguono il glossario: «Fatto!» (app.js:19,46,68), «OK» (turni.html:54; impostazioni.html:46-48), «Procedi» (dipendenti.html:50), «Clicca qui» (impostazioni.html:32), «Swap», «fascia», «risorsa», «collaboratore» e «negozio».",
     "evidence":{"url":"varie","screenshot":null,"location":"vedi righe citate","steps":[]},
     "impact":"Chi usa il pannello capisce meno che cosa farà un pulsante.",
     "priority":"P3","confidence":0.9,
     "recommendation":"Allineare i testi a docs/glossario.md, da coordinare con AIWDA UX Writer.",
     "status":"Nuova","requires_human_review":false}
  ],
  "tested_scenarios": [
    "Compito 1 (preparare e pubblicare i turni): lettura di turni.html e app.js:14-48, schermate turni-computer e turni-telefono",
    "Compito 2 (scambi): index.html:22-24, impostazioni.html:41-51, turni.html:48-56",
    "Compito 3 (aggiungere un dipendente): dipendenti.html, app.js:50-80, schermata dipendenti-telefono",
    "Compito 4 (esportare le presenze): impostazioni.html:22-38",
    "Compito 5 (impostazioni ed eliminazione del locale): impostazioni.html, app.js:82-95"
  ],
  "limitations": [
    "Pagine statiche e senza server: il comportamento è dedotto dal codice e dalle schermate fisse. Nessun flusso è stato eseguito nel browser, come previsto dal compito.",
    "Non ho potuto caricare AIWDA-01 (manca il tool agent): priorità e duplicati sono da consolidare dal direttore.",
    "T-03, D-01 e N-01 dipendono da scelte di prodotto: richiedono la revisione umana.",
    "Il tema scuro non è stato verificato."
  ],
  "summary": "I cinque compiti hanno controlli che non fanno nulla o che dicono «Fatto!» senza controllare l'esito. Mancano ovunque gli stati di caricamento, errore e vuoto. Ci sono un'azione distruttiva senza conferma (P0) e un'uscita forzata a 10 minuti che fa perdere il lavoro. I due compiti più frequenti, turni e scambi, sono i più difficili da raggiungere e da usare sul telefono."
}
```

## Flussi ideali (proposta)
- **Compito 1:**
  1. Dopo l'accesso si apre Turni sulla settimana da preparare, con lo stato «Bozza».
  2. Si modifica una cella e il salvataggio è automatico («Salvato alle 21:14»).
  3. Si preme «Pubblica i turni», si legge il riepilogo e si conferma.
  4. Compare il messaggio «Turni dal 9 al 15 nov pubblicati a 12 dipendenti» e lo stato diventa «Pubblicata».
- **Compito 2:**
  1. La notifica o il banner portano a Turni › Scambi (3).
  2. Si preme «Approva» e la riga sparisce con «Annulla».
  3. Il contatore si aggiorna e la griglia mostra il nuovo assegnatario.

## Da girare ad altri specialisti (non approfonditi)
- **AIWDA accessibilità:** `*:focus { outline: none; }` (css/app.css:14); `lang="en"` su pagine italiane (es. turni.html:2); campi con il solo segnaposto (contro docs/componenti.md).
- **AIWDA dataviz:** asse delle ore da 60 a 70 (index.html:34-47); torta a 8 fette in tonalità di blu (51-70); doppio asse (73-81); etichette e valori dei KPI invertiti (app.css:40-41).
- **AIWDA ricerca:** ricerca/sintesi.md contraddice le interviste (4 su 5 usano il telefono, 3 non usano il cruscotto, I1 non trova l'esportazione); la domanda 4 del protocollo è suggestiva.
- **AIPCA:** IBAN, codice fiscale e indirizzo obbligatori per un invito che richiede solo nome e telefono.

## Domande aperte per l'utente
1. Modificare i turni (T-03) è previsto in questa pagina o in un'altra parte del prodotto?
2. I dati amministrativi del dipendente servono al pannello o al consulente? Si possono chiedere dopo l'invito?
3. Si può spostare l'approvazione degli scambi fuori dalle impostazioni?

Firmato: AIWDA-03 · HADAR
