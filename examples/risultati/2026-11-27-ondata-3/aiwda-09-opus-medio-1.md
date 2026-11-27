AIWDA-09 · ALNAIR — Senior Usability Auditor, reparto AIWDA (AI Web Design)

Nota sul flusso: le istruzioni dicono di caricare prima il direttore AIWDA-01 · CANOPUS, ma in questa esecuzione non ho il tool `agent` e quindi non l'ho caricato. Il rapporto è indirizzato a lui, e qualcuno deve consolidarlo.

**Avviso subito, come chiedono le regole: c'è un rilievo P0 (U-01).** «Elimina settimana» cancella i turni della settimana con un clic, senza conferma e senza annullamento. Il pulsante sta accanto a «Pubblica i turni» e ha lo stesso stile.

Ho fatto un esame statico in sola lettura di `index.html`, `turni.html`, `dipendenti.html`, `impostazioni.html`, `js/app.js` e `css/app.css`. L'ho confrontato con `docs/componenti.md`, `docs/glossario.md`, `docs/mappa.md`, `ricerca/interviste.md` e con le schermate in `schermate/`. Non ho aperto un browser e non ho eseguito niente. Il progetto non ha un server e le chiamate `fetch` verso `/api` sono simulate, quindi i comportamenti a runtime sono ricavati dal codice e non riprodotti. Lo stesso vale per l'uscita automatica e per le risposte d'errore del server: i rilievi che ne dipendono hanno `requires_human_review: true`.

Fonte della biblioteca usata: scheda wcag-2-2, W3C WAI, WCAG 2.2 (W3C Recommendation del 5 ottobre 2023), verificata il 2026-11-19.

Percorsi (il progetto è `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/68c857fd-4b52-436c-bf0e-5c657ef1d77d/scratchpad/copie/aiwda-09-2/`; i file sotto sono relativi a questa cartella).

## Rilievi in breve

| ID | Priorità | Tipo | Dove | Problema |
|---|---|---|---|---|
| U-01 | P0 | Azione rischiosa | turni.html:28, js/app.js:22-25 | «Elimina settimana» senza conferma né annullamento, ha lo stile primario accanto a «Pubblica» e non controlla l'esito |
| U-02 | P1 | Perdita di lavoro | js/app.js:12 | Uscita forzata dopo 10 minuti dal caricamento della pagina, anche se l'utente sta lavorando, senza avviso e senza salvare |
| U-03 | P1 | Perdita di lavoro | js/app.js:63-66 | Se il server rifiuta il modulo, i 14 campi vengono svuotati e il messaggio d'errore è tecnico |
| U-04 | P1 | Perdita di lavoro | js/app.js:27-34 | «Salva» ricarica la pagina anche se il salvataggio è fallito; senza rete l'errore resta silenzioso |
| U-05 | P1 | Validazione | js/app.js:57-58 | Il telefono è respinto se scritto come nell'elenco («333 120 4455»), con «+39» o con un numero straniero |
| U-06 | P1 | Stato del sistema | js/app.js:17-20, 43-47 | «Fatto!» compare anche quando la pubblicazione o lo scambio sono falliti; il doppio clic pubblica due volte |
| U-07 | P1 | Azione rischiosa | impostazioni.html:54, js/app.js:85-89 | «Elimina locale» chiede solo «Vuoi davvero procedere?» e va a /addio anche se l'eliminazione è fallita |
| U-08 | P1 | Uso da telefono | css/app.css:52, schermate/turni-telefono.png | La griglia dei turni è larga 1100 px fissi e sul telefono la pagina scorre in orizzontale |
| U-09 | P2 | Validazione e prevenzione degli errori | dipendenti.html:34-48 | Due formati di data opposti, `novalidate` senza controlli sugli altri campi, solo segnaposto al posto delle etichette |
| U-10 | P2 | Perdita di lavoro e stato | js/app.js:92-94 | Il salvataggio automatico delle impostazioni non dà nessun riscontro di riuscita o di errore |
| U-11 | P2 | Coerenza | turni.html:48-56, css/app.css:33 | La finestra dello scambio va contro `componenti.md` e contro il glossario |
| U-12 | P2 | Coerenza e funzioni mancanti | dipendenti.html:26-28, impostazioni.html:32,46-48, turni.html:21-23 | Pulsanti senza nome e senza comportamento; «Clicca qui»; «OK»/«No» |
| U-13 | P2 | Riconoscimento | index.html:22-24, impostazioni.html:22-51 | Gli scambi e l'esportazione sono sepolti nelle impostazioni; il banner del cruscotto non è un link |
| U-14 | P2 | Perdita di lavoro e duplicati | js/app.js:61-71 | Dopo l'invio riuscito il modulo resta compilato e l'elenco non si aggiorna, quindi gli inviti possono partire due volte |
| U-15 | P3 | Stato vuoto e testi | js/app.js:74-79, nav di tutte le pagine | Nessun messaggio quando la ricerca non trova niente; termini contrari al glossario; `lang="en"` |

## Osservazioni (JSON)

```json
{
  "project": "Turnio – pannello web per i responsabili",
  "audit_id": null,
  "agent": "AIWDA-09 · ALNAIR",
  "page": { "name": "Pannello (turni, dipendenti, impostazioni, cruscotto)", "url": "turni.html, dipendenti.html, impostazioni.html, index.html" },
  "observations": [
    {
      "id": "U-01",
      "type": "usability",
      "title": "«Elimina settimana» senza conferma, con lo stile primario accanto a «Pubblica i turni»",
      "description": "Euristiche: prevenzione degli errori; controllo e libertà dell'utente; coerenza e standard. Fatto: turni.html:28 ha `class=\"btn btn-primary\"`, la stessa classe di «Pubblica i turni» alla riga 27, e i due pulsanti sono uno accanto all'altro (schermate/turni-computer.png e turni-telefono.png: due pulsanti blu uguali). In js/app.js:22-25 il clic manda subito `DELETE /api/week` e svuota `#week`, senza conferma, senza annullamento e senza controllare `res.ok`. Se il server fallisce, la griglia sparisce lo stesso e l'utente crede di aver perso la settimana. Il codice va contro docs/componenti.md («una sola azione principale per vista», «.btn-danger per le azioni distruttive»).",
      "evidence": { "url": "turni.html", "screenshot": "schermate/turni-computer.png", "location": "turni.html:27-28; js/app.js:22-25", "steps": ["Aprire Turni", "Fare clic su «Elimina settimana» (per esempio mancando «Pubblica i turni»)", "La griglia si svuota subito, senza nessuna domanda"] },
      "impact": "Basta un clic sbagliato sul compito principale della settimana per cancellare tutti i turni preparati, senza modo di recuperarli.",
      "priority": "P0",
      "confidence": 0.9,
      "recommendation": "Usare `.btn-danger` e separare il pulsante da «Pubblica» (per esempio in un menu «Altre azioni»). Chiedere una conferma che dica cosa si cancella («Eliminare i turni di lun 2 nov – dom 8 nov? 3 dipendenti, 18 turni») e offrire «Annulla» per qualche secondo dopo l'eliminazione. Svuotare la griglia solo se `res.ok`, altrimenti mostrare un errore che dica cosa fare.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "U-02",
      "type": "usability",
      "title": "Uscita automatica a 10 minuti fissi dal caricamento, senza avviso e senza salvare",
      "description": "Euristiche: visibilità dello stato del sistema; controllo e libertà dell'utente. Il commento a js/app.js:11 dice «dopo 10 minuti senza richieste al server», ma il timer alla riga 12 parte una volta sola al caricamento e nessuna attività lo azzera. Allo scadere fa `location.href = \"/login\"`, senza avviso, senza possibilità di prolungare e senza salvare. Così si perdono i turni in preparazione, che la domenica sera richiedono più di 10 minuti (interviste.md:7, 29). WCAG 2.2, criterio 2.2.1 Timing Adjustable (livello A), non soddisfatto.",
      "evidence": { "url": "tutte le pagine", "screenshot": null, "location": "js/app.js:11-12", "steps": ["Aprire Turni", "Lavorare per più di 10 minuti senza ricaricare la pagina", "Atteso dal codice: si va a /login e le modifiche non salvate si perdono"] },
      "impact": "Lavoro perso nel compito più frequente; il criterio A non soddisfatto impedisce di finire il compito.",
      "priority": "P1",
      "confidence": 0.8,
      "recommendation": "Contare l'inattività vera, azzerando il timer a ogni richiesta e a ogni input. Un minuto prima avvisare con «Resta collegato». Prima di uscire salvare una bozza, e dopo il login riportare l'utente alla pagina in cui era.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "U-03",
      "type": "usability",
      "title": "Se il server rifiuta il modulo «Aggiungi», tutti i campi vengono svuotati",
      "description": "Euristiche: riconoscimento, diagnosi e recupero dagli errori; prevenzione degli errori. In js/app.js:63-66, se la risposta non è ok, il codice scrive «Errore ${status}: payload non valido» e poi chiama `form.reset()`, che cancella i 14 campi, fra cui codice fiscale, IBAN e indirizzo. Il messaggio non dice quale campo è sbagliato e usa codici tecnici, contro glossario.md («senza codici tecnici»). Il messaggio non è collegato al campo, come chiederebbe componenti.md. Vale anche il criterio 3.3.1 Error Identification (WCAG 2.2, livello A).",
      "evidence": { "url": "dipendenti.html", "screenshot": null, "location": "js/app.js:63-66; dipendenti.html:49", "steps": ["Compilare tutti i campi con un dato che il server rifiuta", "Premere «Procedi»", "Atteso dal codice: compare «Errore 400: payload non valido» e il modulo si svuota"] },
      "impact": "Bisogna riscrivere da capo 14 campi senza sapere cosa correggere; molto probabile rinunciare o sbagliare di nuovo.",
      "priority": "P1",
      "confidence": 0.85,
      "recommendation": "Non svuotare mai il modulo dopo un errore. Mostrare l'errore sotto il campo interessato (con `aria-describedby` e `aria-invalid`), spostare il focus sul primo campo sbagliato e usare un testo che dica cosa fare (per esempio «Il codice fiscale deve avere 16 caratteri»).",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "U-04",
      "type": "usability",
      "title": "«Salva» ricarica la pagina anche se il salvataggio è fallito",
      "description": "Euristiche: visibilità dello stato del sistema; recupero dagli errori. In js/app.js:27-34 non c'è il controllo di `res.ok`: con un 4xx o un 5xx si fa comunque `location.reload()`, che ricarica la settimana dal server e cancella le modifiche non salvate. Senza rete il `catch` fa solo `console.log` e l'utente non vede niente. Non c'è neanche una conferma di riuscita.",
      "evidence": { "url": "turni.html", "screenshot": null, "location": "js/app.js:27-34", "steps": ["Modificare i turni", "Premere «Salva» mentre il server risponde con un errore", "Atteso dal codice: la pagina si ricarica e le modifiche non ci sono più, senza messaggio"] },
      "impact": "La preparazione dei turni può andare persa senza che l'utente se ne accorga.",
      "priority": "P1",
      "confidence": 0.85,
      "recommendation": "Ricaricare solo se `res.ok` e confermare con «Turni salvati». In caso di errore tenere le modifiche a schermo e mostrare un messaggio con «Riprova». Avvisare prima di uscire dalla pagina o di cambiare settimana se ci sono modifiche non salvate (evento `beforeunload`).",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "U-05",
      "type": "usability",
      "title": "La validazione del telefono respinge numeri corretti, anche nel formato usato dallo stesso pannello",
      "description": "Euristiche: prevenzione degli errori; corrispondenza col mondo reale; diagnosi degli errori. js/app.js:57 accetta solo `^\\d{10}$`. Respinge quindi «333 120 4455», cioè il formato in cui il pannello stesso mostra i numeri (dipendenti.html:26-28), e respinge anche «+39 333…», «333-120-4455» e i numeri esteri, frequenti fra i dipendenti di ristorazione. Il messaggio «Hai sbagliato il numero.» (riga 58) dà la colpa all'utente e non dice il formato atteso, contro glossario.md. Il campo non ha `type=\"tel\"` né un esempio (dipendenti.html:37).",
      "evidence": { "url": "dipendenti.html", "screenshot": "schermate/dipendenti-computer.png", "location": "js/app.js:57-58; dipendenti.html:37", "steps": ["In «Aggiungi una risorsa» scrivere il telefono «333 120 4455»", "Premere «Procedi»", "Atteso dal codice: «Hai sbagliato il numero.» e il modulo non parte"] },
      "impact": "Blocca l'aggiunta di un dipendente (compito 3), che riceve l'invito proprio attraverso quel numero.",
      "priority": "P1",
      "confidence": 0.9,
      "recommendation": "Prima di validare, togliere spazi, trattini e punti e accettare il prefisso internazionale (`+` e da 8 a 15 cifre, formato E.164), poi normalizzare il numero lato server. Usare `type=\"tel\"` e `autocomplete=\"tel\"`, mostrare un esempio nell'etichetta e scrivere un messaggio come «Scrivi il numero con il prefisso, per esempio +39 333 120 4455».",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "U-06",
      "type": "usability",
      "title": "«Fatto!» compare anche quando la pubblicazione o lo scambio sono falliti; manca la protezione dal doppio invio",
      "description": "Euristiche: visibilità dello stato del sistema; prevenzione degli errori. In js/app.js:17-20 (pubblica) e 43-47 (scambio) viene mostrato `toast(\"Fatto!\")` senza controllare `res.ok`. `fetch` non lancia un errore sulle risposte 4xx e 5xx, e senza rete l'errore non viene gestito. Il pulsante non si disattiva durante la richiesta, quindi un doppio clic pubblica due volte e può mandare due notifiche ai dipendenti. «Pubblica» ha un effetto esterno (i dipendenti vedono i turni) ma non chiede conferma e non dice a chi pubblica. Il messaggio dura 1,5 s (riga 8) e non è una regione live: chi usa un lettore di schermo non lo sente, e chi guarda altrove non lo vede. Inoltre la finestra dello scambio non manda il collega scelto (`#swap-to` non è letto alla riga 44).",
      "evidence": { "url": "turni.html", "screenshot": null, "location": "js/app.js:8, 17-20, 43-47", "steps": ["Premere «Pubblica i turni» con il server che risponde con un errore", "Atteso dal codice: compare «Fatto!»"] },
      "impact": "Il responsabile crede di aver pubblicato i turni, ma i dipendenti non li ricevono; oppure li ricevono due volte.",
      "priority": "P1",
      "confidence": 0.8,
      "recommendation": "Controllare `res.ok`. Disattivare il pulsante e mostrare «Pubblicazione…» durante la richiesta. Usare un messaggio di riuscita specifico («Turni di lun 2 – dom 8 nov pubblicati a 3 dipendenti») e un errore che dica cosa fare. Mettere il messaggio in `role=\"status\"`, lasciarlo a schermo più a lungo e dare un modo per chiuderlo. Prima di pubblicare, una conferma breve con il riepilogo. Nello scambio mandare il collega scelto.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "U-07",
      "type": "usability",
      "title": "«Elimina locale»: la conferma è generica e il codice va a /addio anche se l'eliminazione è fallita",
      "description": "Euristiche: prevenzione degli errori; corrispondenza col mondo reale. js/app.js:86 chiede solo «Vuoi davvero procedere?»: non dice cosa si elimina (locale, dipendenti, turni, storico delle presenze) né che l'eliminazione è definitiva, e non suggerisce di esportare prima le presenze. Il `confirm` nativo si accetta per abitudine con Invio. Alle righe 87-88 si va a /addio senza controllare l'esito: se l'eliminazione fallisce, l'utente crede che il locale sia stato eliminato.",
      "evidence": { "url": "impostazioni.html", "screenshot": "schermate/impostazioni-computer.png", "location": "impostazioni.html:53-54; js/app.js:85-89", "steps": ["Impostazioni › «Elimina locale»", "Compare la finestra «Vuoi davvero procedere?»", "Con OK si va a /addio qualunque sia la risposta del server"] },
      "impact": "Perdita irreversibile dei dati del locale, compresi quelli che servono al consulente del lavoro.",
      "priority": "P1",
      "confidence": 0.85,
      "recommendation": "Usare una finestra dedicata che elenchi cosa viene eliminato, offra il link all'esportazione delle presenze e chieda di scrivere il nome del locale («Trattoria Il Ponte») per attivare un pulsante «Elimina il locale». Andare alla pagina di uscita solo se `res.ok`, altrimenti mostrare un errore. Se possibile, prevedere un periodo di ripristino.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "U-08",
      "type": "usability",
      "title": "Sul telefono la griglia dei turni fa scorrere tutta la pagina in orizzontale",
      "description": "Euristica: flessibilità ed efficienza d'uso. css/app.css:52 fissa `.week` a `width: 1100px`. In schermate/turni-telefono.png (390 px) la pagina è larga circa 1126 px: il menu finisce a 390 px e la griglia esce dallo schermo. Tre intervistati su cinque preparano i turni dal telefono (interviste.md:7, 15, 29). Riguarda anche WCAG 2.2, criterio 1.4.10 Reflow (AA), da approfondire con AIWDA-05.",
      "evidence": { "url": "turni.html", "screenshot": "schermate/turni-telefono.png", "location": "css/app.css:52", "steps": ["Aprire Turni a 390 px di larghezza", "Per vedere da Mercoledì a Domenica bisogna scorrere tutta la pagina in orizzontale"] },
      "impact": "Il compito principale è scomodo e porta a errori proprio sul dispositivo usato di più per prepararlo.",
      "priority": "P1",
      "confidence": 0.75,
      "recommendation": "Su schermi stretti usare una vista per giorno o per dipendente, oppure un contenitore con scorrimento proprio e la prima colonna fissa, senza larghezza fissa sulla pagina. Il layout spetta ad AIWDA (UI).",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "U-09",
      "type": "usability",
      "title": "Modulo «Aggiungi»: due formati di data opposti, campi obbligatori non controllati, solo segnaposto",
      "description": "Euristiche: coerenza e standard; prevenzione degli errori; riconoscimento anziché memorizzazione. La data di nascita è chiesta come gg/mm/aaaa (dipendenti.html:40), la data di assunzione come aaaa-mm-gg (riga 46): è facile invertirli. Il modulo ha `novalidate` (riga 34) e il codice JS controlla solo il telefono, quindi i campi `required` vuoti arrivano al server e si torna a U-03. Le etichette sono solo segnaposto e spariscono durante la scrittura, contro componenti.md e contro WCAG 2.2, criterio 3.3.2 (A). Dodici campi obbligatori (IBAN, codice fiscale, indirizzo…) per un'azione che il README descrive come «invito con nome e numero di telefono»: il dato è da girare al reparto privacy per la minimizzazione. Il pulsante dice «Procedi» invece di dire l'azione.",
      "evidence": { "url": "dipendenti.html", "screenshot": "schermate/dipendenti-computer.png", "location": "dipendenti.html:34-50; js/app.js:53-60", "steps": ["Lasciare vuoti tutti i campi tranne un telefono valido", "Premere «Procedi»: il modulo parte senza nessun avviso sui campi vuoti"] },
      "impact": "Errori di data difficili da notare, invii falliti e un'aggiunta lenta.",
      "priority": "P2",
      "confidence": 0.8,
      "recommendation": "Usare `type=\"date\"` (o un unico formato gg/mm/aaaa) per entrambe le date. Validare tutti gli obbligatori sul client, mostrando l'errore sotto ogni campo. Mettere etichette visibili. Chiedere per l'invito solo nome, cognome, telefono e ruolo e completare il resto dopo. Chiamare il pulsante «Aggiungi e invita».",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "U-10",
      "type": "usability",
      "title": "Salvataggio automatico delle impostazioni senza riscontro",
      "description": "Euristica: visibilità dello stato del sistema. impostazioni.html:20 promette «Le modifiche si salvano da sole», ma js/app.js:92-94 manda il PATCH senza mostrare riuscita o errore e senza gestire i fallimenti. Il PATCH è senza corpo: può essere una semplificazione della simulazione, ed è da verificare. I `select`, come `#export-month`, non sono compresi nel selettore `#main input`.",
      "evidence": { "url": "impostazioni.html", "screenshot": null, "location": "impostazioni.html:20, 24-25; js/app.js:92-94", "steps": ["Modificare «Nome del negozio» e uscire dal campo", "Non compare nessuna indicazione di «salvato» o di errore"] },
      "impact": "Un salvataggio fallito passa inosservato e l'utente crede che l'orario o il nome siano stati aggiornati.",
      "priority": "P2",
      "confidence": 0.7,
      "recommendation": "Mostrare uno stato vicino al campo («Salvataggio…», «Salvato alle 18:42», «Non salvato: riprova»), controllare `res.ok` e mandare il valore modificato.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "U-11",
      "type": "consistency",
      "title": "La finestra dello scambio va contro il design system e il glossario",
      "description": "Euristica: coerenza e standard. In turni.html:48-56 la chiusura è uno `<span>` (riga 50), che non si raggiunge da tastiera. Non si chiude con Esc e non sposta il focus, contro componenti.md. Il pulsante usa `.button` (css/app.css:33) invece di `.btn` e dice «OK» invece di un verbo. I testi usano «Swap» e «fascia», che il glossario vieta (si scrive «scambio» e «turno»). L'unico modo per uscire è la ✕ o la conferma: «Annulla» non c'è.",
      "evidence": { "url": "turni.html", "screenshot": null, "location": "turni.html:48-56; js/app.js:37-47; css/app.css:33", "steps": ["Turni › il pulsante ⇄ su Giulia R. sabato", "Provare a chiudere con Esc o raggiungere la ✕ con Tab: non funziona"] },
      "impact": "Chi usa la tastiera resta bloccato e la finestra si comporta diversamente da quelle descritte nel design system.",
      "priority": "P2",
      "confidence": 0.85,
      "recommendation": "Usare `<dialog>` con `showModal()`, che gestisce già Esc e il focus, `<button>` per la chiusura, «Annulla» accanto a «Proponi lo scambio» e la classe `.btn-primary`. Titolo: «Scambio del turno».",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "U-12",
      "type": "consistency",
      "title": "Pulsanti senza nome o senza comportamento, etichette vaghe",
      "description": "Euristiche: coerenza; visibilità dello stato. I pulsanti ✎ e 🗑 di dipendenti.html:26-28 non hanno un nome accessibile (WCAG 2.2, criterio 4.1.2, A) e app.js non assegna loro nessun comportamento, così il clic non fa niente. Quando verrà aggiunto, 🗑 avrà bisogno della stessa protezione di U-01. Gli scambi da approvare (impostazioni.html:46-48) hanno «OK» e «No» senza comportamento: un rifiuto è un'azione con effetto su due dipendenti e non dice cosa succede. L'esportazione è un link «Clicca qui» con `href=\"#\"` e nessun comportamento (riga 32). Anche ◀ e ▶ (turni.html:21-23) non hanno nome né comportamento e non avvisano delle modifiche non salvate.",
      "evidence": { "url": "dipendenti.html, impostazioni.html, turni.html", "screenshot": null, "location": "dipendenti.html:26-28; impostazioni.html:32, 46-48; turni.html:21-23", "steps": ["Fare clic su 🗑, su «Clicca qui» o su ▶: non succede niente (nessun comportamento in js/app.js)"] },
      "impact": "Azioni che sembrano disponibili e non rispondono; l'esportazione mensile (compito 4) non si completa.",
      "priority": "P2",
      "confidence": 0.75,
      "recommendation": "Dare un nome a ogni pulsante con solo icona («Modifica Giulia R.», «Elimina Giulia R.»). Chiamare i pulsanti degli scambi «Approva» e «Rifiuta» e chiedere conferma per il rifiuto. Usare un `<button>` «Scarica le presenze di ottobre 2026». Chiamare le frecce «Settimana precedente» e «Settimana successiva». Prima di cambiare settimana, controllare se ci sono modifiche non salvate.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "U-13",
      "type": "information_architecture",
      "title": "Gli scambi (compito frequente) e l'esportazione sono sepolti nelle impostazioni",
      "description": "Euristiche: riconoscimento anziché memorizzazione; efficienza. Il banner «3 scambi da approvare» del cruscotto (index.html:22-24) non è un link. Gli scambi stanno in un `<details>` chiuso delle Impostazioni (impostazioni.html:41-51) e l'esportazione è a tre livelli (Locale › Esporta › Presenze, righe 22-38). Le interviste lo confermano (interviste.md:32): «non capisco dove approvarli». La sintesi (sintesi.md:21) giustifica la scelta con «si configura una volta sola», ma approvare è un'azione ricorrente, non una configurazione.",
      "evidence": { "url": "index.html, impostazioni.html", "screenshot": "schermate/impostazioni-computer.png", "location": "index.html:22-24; impostazioni.html:22-51", "steps": ["Dal cruscotto fare clic su «3 scambi da approvare»: non succede niente", "Per trovarli bisogna andare in Settings e aprire «Scambi da approvare»"] },
      "impact": "Il compito 2, ripetuto più volte a settimana, diventa lento e chi lo cerca non lo trova.",
      "priority": "P2",
      "confidence": 0.8,
      "recommendation": "Far diventare il banner un link alla lista degli scambi. Mettere gli scambi in Turni o in una voce di menu propria e l'esportazione in un'area «Presenze», con un solo livello. Da far valutare all'Information Architect di AIWDA.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "U-14",
      "type": "usability",
      "title": "Dopo l'invio riuscito il modulo resta compilato: c'è rischio di inviti doppi",
      "description": "Euristiche: visibilità dello stato; prevenzione degli errori. In js/app.js:68, dopo l'invio riuscito, compare solo «Fatto!» per 1,5 s: il modulo resta compilato e la tabella `#staff` non si aggiorna. Senza rete il `catch` (righe 69-71) è silenzioso e l'utente tende a premere di nuovo. Il pulsante non si disattiva durante l'invio.",
      "evidence": { "url": "dipendenti.html", "screenshot": null, "location": "js/app.js:61-71", "steps": ["Aggiungere un dipendente valido", "Atteso dal codice: compare «Fatto!» e i dati restano nel modulo; il dipendente non compare nell'elenco"] },
      "impact": "Dipendenti doppi e più inviti allo stesso numero.",
      "priority": "P2",
      "confidence": 0.75,
      "recommendation": "Disattivare il pulsante durante l'invio. Se l'invio riesce, aggiungere la riga alla tabella, svuotare il modulo e mostrare «Invito inviato a Nome Cognome». In caso di errore di rete, mostrare un messaggio con «Riprova».",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "U-15",
      "type": "content",
      "title": "Nessun messaggio quando la ricerca non trova niente; termini incoerenti",
      "description": "Euristiche: visibilità dello stato; coerenza e standard. js/app.js:78 lascia la tabella vuota senza messaggio («Nessun dipendente trovato»). Il menu e i titoli usano «Settings», «Dashboard», «Squadra», «Personale», «collaboratore», «risorsa» e «negozio», contro glossario.md, che chiede «dipendente» e «locale». La pagina e la voce di menu hanno nomi diversi («Squadra» / «Personale»). Le pagine dichiarano `lang=\"en\"` e il contenuto è in italiano (WCAG 2.2, criterio 3.1.1, A). La legenda della griglia (turni.html:45) ha tre pallini grigi uguali e non corrisponde ai colori nella griglia (schermate/turni-computer.png).",
      "evidence": { "url": "tutte le pagine", "screenshot": "schermate/turni-computer.png", "location": "js/app.js:74-79; dipendenti.html:12-20, 32; impostazioni.html:24; turni.html:45; <html lang> di tutte le pagine", "steps": ["Squadra › cercare «zzz»: compaiono solo le intestazioni"] },
      "impact": "Incertezza e piccoli attriti; la legenda non spiega lo stato delle presenze.",
      "priority": "P3",
      "confidence": 0.85,
      "recommendation": "Aggiungere una riga «Nessun dipendente trovato per “…”» con «Cancella la ricerca». Allineare i termini al glossario (Impostazioni, Cruscotto, Dipendenti, Aggiungi un dipendente, Nome del locale). Usare `lang=\"it\"`. Nella legenda usare gli stessi pallini colorati della griglia, insieme al testo.",
      "status": "Nuova",
      "requires_human_review": false
    }
  ],
  "tested_scenarios": [
    "Esame statico del codice: turni (pubblica, elimina, salva, scambio), dipendenti (aggiunta, ricerca), impostazioni (salvataggio automatico, eliminazione del locale, scambi, esportazione), uscita automatica",
    "Confronto visivo con schermate/turni-computer.png, turni-telefono.png, impostazioni-computer.png"
  ],
  "limitations": [
    "Nessuna esecuzione nel browser: le pagine sono statiche e le chiamate a /api sono simulate. I comportamenti con errori del server e con l'uscita automatica sono ricavati dal codice, non riprodotti (requires_human_review dove indicato).",
    "AIWDA-01 · CANOPUS non è stato caricato: in questa esecuzione manca il tool agent.",
    "Grafici del cruscotto, contrasto e `*:focus { outline: none }` (css/app.css:14) sono fuori perimetro: li segnalo ad AIWDA (dati e grafici, accessibilità). I campi obbligatori eccedenti (IBAN, codice fiscale per un invito) vanno girati al reparto privacy."
  ],
  "summary": "15 rilievi: 1 P0, 7 P1, 6 P2, 1 P3. Il rischio più grave è «Elimina settimana», che cancella i turni senza conferma e ha lo stile primario accanto a «Pubblica». Seguono le perdite di lavoro: l'uscita a 10 minuti fissi, il modulo svuotato dopo un errore, «Salva» che ricarica anche se il salvataggio è fallito. Poi la validazione del telefono, che respinge numeri corretti, e i «Fatto!» mostrati anche quando l'operazione è fallita."
}
```

## Domande aperte per il direttore e per l'utente

1. Il server prevede un annullamento o un cestino per la settimana e per il locale? Da questo dipende la correzione di U-01 e U-07: basta un annullamento o serve una conferma rafforzata.
2. L'uscita a 10 minuti è un requisito di sicurezza? Se sì, va decisa con il reparto di cybersecurity la durata, e va previsto l'avviso con la possibilità di prolungare.
3. I numeri esteri dei dipendenti sono previsti? Da questo dipende il formato da accettare in U-05.

Firmato: AIWDA-09 · ALNAIR
