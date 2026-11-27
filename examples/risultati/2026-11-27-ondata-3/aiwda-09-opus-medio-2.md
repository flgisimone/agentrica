AIWDA-09 · ALNAIR — Senior Usability Auditor, reparto AIWDA (AI Web Design)

**Perimetro.** Ho fatto una revisione statica in sola lettura di `index.html`, `turni.html`, `dipendenti.html`, `impostazioni.html` e `js/app.js`. Come riferimento ho usato `docs/componenti.md`, `docs/glossario.md`, `docs/mappa.md`, il README e tre schermate per computer (turni, dipendenti, impostazioni). Non ho modificato nessun file e non ho aperto un browser.

**Limiti.**
- Nessuna interazione è stata riprodotta dal vivo. I comportamenti vengono dalla lettura del codice e sono quindi inferenze.
- Non c'è un server, quindi `/api/*` risponde con un errore HTTP (404/405) e non con un errore di rete. `fetch` non lancia eccezioni in questo caso, quindi i rami "successo" vengono eseguiti anche quando la chiamata fallisce. Questo vale per il codice così com'è.
- Non ho potuto caricare AIWDA-01 · CANOPUS: in questa sessione non ho il tool `agent`. Gli consegno questo rapporto tramite il chiamante.
- Fonte normativa: scheda della biblioteca `wcag-2-2`, W3C WCAG 2.2, Recommendation del 5 ottobre 2023, verificata il 2026-11-19.

## Esito in breve

Ho trovato 6 rilievi P1, 8 P2 e 3 P3. Nessun P0. I problemi più gravi:
- un'eliminazione irreversibile con un solo clic, accanto a "Pubblica";
- conferme di successo false ("Fatto!") anche quando la chiamata fallisce;
- un logout a tempo fisso che fa perdere il lavoro;
- una validazione del telefono che respinge il formato mostrato dal pannello stesso;
- l'azzeramento dell'intero modulo da 14 campi dopo un errore del server.

## Rilievi (P1)

**ALNAIR-01 · P1 · Prevenzione degli errori; Controllo e libertà dell'utente**
- **Dove:** "Elimina settimana" senza conferma né annullamento. `turni.html:28`, `js/app.js:22-25`.
- **Problema:** è stilizzato `btn-primary` come "Pubblica i turni" ed è subito accanto (schermata `turni-computer.png`). Un clic manda `DELETE /api/week` e svuota la griglia (`innerHTML = ""`) senza controllare `res.ok`. Se il server rifiuta, la griglia sparisce comunque e l'utente crede di aver perso la settimana. Viola anche `docs/componenti.md`: una sola `btn-primary` per vista e `.btn-danger` per le azioni distruttive.
- **Correzione:**
  - `.btn-danger`, allontanato da Pubblica (oppure in un menu "Altre azioni");
  - una finestra di conferma che dica cosa si perde: "Eliminare i turni di 3 dipendenti dal 2 all'8 nov? I turni pubblicati spariranno anche dall'app";
  - svuotare la griglia solo se `res.ok`;
  - meglio ancora: un toast con "Annulla" per qualche secondo.

**ALNAIR-02 · P1 · Visibilità dello stato; Riconoscimento e recupero dagli errori**
- **Dove:** "Pubblica i turni" e "OK" dello scambio mostrano "Fatto!" anche quando falliscono. `js/app.js:17-20` e `43-47`.
- **Problema:** non c'è controllo di `res.ok` né `try/catch`. Il pulsante resta attivo durante la richiesta, quindi un doppio clic fa una doppia pubblicazione. La pubblicazione ha effetti esterni (i turni diventano visibili ai dipendenti), ma non c'è conferma né riepilogo. Il toast dura 1,5 s (`app.js:8`) e non ha `role="status"`. Il responsabile può credere di aver pubblicato quando i dipendenti non vedono nulla.
- **Correzione:**
  - disabilitare il pulsante e mostrare "Pubblicazione…";
  - con `res.ok`, un messaggio specifico: "Turni dal 2 all'8 nov pubblicati: 3 dipendenti avvisati";
  - con errore, un messaggio persistente: "Non è stato possibile pubblicare. Controlla la connessione e riprova", con un pulsante Riprova;
  - toast di almeno 5 s, con `role="status"`;
  - prima di pubblicare, un breve riepilogo da confermare.

**ALNAIR-03 · P1 · Errori che fanno perdere lavoro; WCAG 2.2, 2.2.1 Timing Adjustable (A)**
- **Dove:** logout dopo 10 minuti fissi dal caricamento, senza avviso. `js/app.js:11-12`.
- **Problema:** il commento dice "senza richieste al server", ma il timer non si azzera mai. Scatta 10 minuti dopo l'apertura della pagina, anche se l'utente sta lavorando. Porta a `/login` senza avviso e senza salvare. Si perde la settimana in preparazione (la domenica sera, compito 1) o il modulo da 14 campi a metà.
- **Correzione:**
  - azzerare il timer a ogni attività dell'utente e a ogni richiesta;
  - avvisare 2 minuti prima, con "Resta collegato";
  - conservare la bozza (modulo e griglia) e ripristinarla dopo il login.

**ALNAIR-04 · P1 · Prevenzione degli errori (validazione che respinge dati corretti); Riconoscimento e recupero dagli errori**
- **Dove:** la validazione del telefono respinge numeri corretti. `js/app.js:56-60`.
- **Problema:** `/^\d{10}$/` respinge:
  - `333 120 4455`, cioè il formato usato nella tabella della stessa pagina (`dipendenti.html:26-28`);
  - `+39 333 1204455` e `0039…`;
  - i trattini;
  - i numeri fissi di lunghezza diversa da 10.

  Il messaggio "Hai sbagliato il numero." dà la colpa all'utente (contro le regole di `docs/glossario.md`) e non dice cosa fare. Non è collegato al campo, il campo non ha `aria-invalid`, e il messaggio resta anche dopo la correzione perché non viene mai cancellato. Blocca il compito 3: l'invito parte dal numero di telefono.
- **Correzione:**
  - normalizzare prima di validare: togliere spazi, trattini e punti; accettare `+39`/`0039`;
  - controllare la lunghezza plausibile (circa 6–13 cifre) e usare `type="tel"` con `autocomplete="tel"`;
  - messaggio sotto il campo, collegato con `aria-describedby`: "Inserisci un numero di telefono, per esempio 333 120 4455";
  - cancellare il messaggio quando il valore diventa valido.

**ALNAIR-05 · P1 · Errori che fanno perdere lavoro; Riconoscimento e recupero dagli errori**
- **Dove:** l'errore del server azzera tutto il modulo e mostra un codice tecnico. `js/app.js:63-66`.
- **Problema:** con `!res.ok`, `form.reset()` cancella i 14 campi: codice fiscale, IBAN, date eccetera. Il messaggio è "Errore 400: payload non valido". Con un errore di rete (`app.js:69-71`) c'è solo `console.log`, senza nessun messaggio a schermo. Con il successo il modulo non si svuota, quindi un secondo clic crea un duplicato. L'utente deve reinserire tutto senza sapere cosa correggere (in linea con WCAG 2.2, 3.3.7 Redundant Entry (A)).
- **Correzione:**
  - non chiamare `reset()` in caso di errore; conservare i valori e segnare i campi che il server rifiuta;
  - messaggio comprensibile: "Non è stato possibile aggiungere il dipendente. Controlla i campi segnati e riprova";
  - un messaggio anche per l'errore di rete;
  - `reset()` solo dopo il successo, con un toast che nomini il dipendente e l'invito inviato.

**ALNAIR-06 · P1 · Prevenzione degli errori; Controllo e libertà dell'utente**
- **Dove:** "Elimina locale" ha una conferma generica e reindirizza anche se fallisce. `impostazioni.html:53-54`, `js/app.js:83-90`.
- **Problema:** il `confirm("Vuoi davvero procedere?")` non dice cosa si elimina né che è irreversibile. Si conferma con Invio, per abitudine. Non c'è controllo di `res.ok`, quindi si va comunque a `/addio`. Si possono eliminare per errore il locale, i dipendenti, i turni e lo storico delle presenze che serve al consulente.
- **Correzione:**
  - una finestra che elenchi cosa si cancella;
  - suggerire prima l'esportazione delle presenze;
  - chiedere di digitare il nome del locale ("Trattoria Il Ponte");
  - pulsante con il verbo esplicito: "Elimina definitivamente il locale";
  - reindirizzare solo con `res.ok`; con errore, un messaggio e nessuna uscita dalla pagina.
- **Gravità:** l'azione è dietro una conferma, quindi P1 e non P0. Il rischio resta grave.

## Rilievi (P2)

**ALNAIR-07 · P2 · Errori che fanno perdere lavoro; Visibilità dello stato**
- **Dove:** "Salva" in Turni ricarica la pagina anche se il salvataggio fallisce. `js/app.js:27-35`.
- **Problema:** `fetch` non lancia eccezioni su 4xx/5xx. Dopo un salvataggio fallito, `reload()` scarta le modifiche senza dirlo. Con un errore di rete c'è solo `console.log`. Non c'è nessun avviso di modifiche non salvate quando si esce dalla pagina o si cambia settimana.
- **Correzione:**
  - ricaricare (o meglio aggiornare senza ricaricare) solo con `res.ok`;
  - con errore, un messaggio persistente e i dati lasciati sullo schermo;
  - indicatore "Modifiche non salvate" e `beforeunload` quando ci sono modifiche.
- **Gravità:** P1 se la griglia diventa modificabile. Oggi le celle non sono modificabili nel codice, quindi `requires_human_review`.

**ALNAIR-08 · P2 · Coerenza e standard; Controllo e libertà dell'utente**
- **Dove:** la finestra dello scambio non segue il componente `.modal`. `turni.html:48-56`, `js/app.js:37-42`.
- **Problema:**
  - la chiusura è uno `<span>✕</span>`: non si raggiunge con la tastiera e non ha un nome;
  - la finestra non si chiude con Esc e non sposta né restituisce il focus (contro `docs/componenti.md`, "Finestra");
  - il pulsante usa la classe inesistente `.button` e dice "OK", invece di un verbo come "Scambia il turno";
  - il titolo dice "Swap" e "fascia", termini che il glossario vieta.

  Chi usa la tastiera resta intrappolato o non riesce a chiudere.
- **Correzione:** usare `<dialog>` con `showModal()`. Dà Esc, focus e ripristino del focus. Aggiungere `<button aria-label="Chiudi">`, il pulsante "Scambia il turno" con `.btn .btn-primary` e i testi del glossario.

**ALNAIR-09 · P2 · Coerenza e standard (comportamenti simili in moduli diversi)**
- **Dove:** lo scambio funziona in due modi diversi in due pagine, e l'approvazione è nascosta. `turni.html:37`, `impostazioni.html:41-51`, `index.html:22-24`.
- **Problema:**
  - in Turni il responsabile esegue lo scambio direttamente con "OK";
  - in Impostazioni approva con "OK"/"No", ma i pulsanti non hanno handler, quindi il clic non fa nulla;
  - "No" rifiuta senza conferma e senza motivo;
  - le date usano tre formati diversi (2026-11-07, "sab 7 nov", "02/11");
  - il banner del cruscotto "3 scambi da approvare" non è un link;
  - la sezione è in un `<details>` chiuso dentro Impostazioni.

  Il compito 2 (più volte a settimana) richiede di ricordare dove sta la funzione.
- **Correzione:**
  - un solo flusso: richieste di scambio approvate in Turni, oppure in una vista "Scambi";
  - il banner diventa un link a quella vista;
  - pulsanti "Approva lo scambio" e "Rifiuta";
  - feedback su ogni riga;
  - date nella forma "sab 7 nov, 18:00–00:30".
- **Collegamenti:** da coordinare con l'Information Architect.

**ALNAIR-10 · P2 · Visibilità dello stato; Riconoscimento e recupero dagli errori**
- **Dove:** il salvataggio automatico delle impostazioni non dà nessun feedback. `impostazioni.html:20`, `js/app.js:92-94`.
- **Problema:** "Le modifiche si salvano da sole", ma il `PATCH` a ogni `change` non mostra né "Salvato" né gli errori, e non controlla `res.ok`. Si può salvare un nome del locale vuoto. Non si sa se il cambio degli orari è stato registrato, e un errore resta invisibile.
- **Correzione:**
  - stato accanto al campo: "Salvataggio…", "Salvato alle 18:42", "Non salvato: riprova";
  - validare che il campo non sia vuoto;
  - in caso di errore, ripristinare il valore precedente avvisando l'utente.

**ALNAIR-11 · P2 · Prevenzione degli errori; Riconoscimento anziché memorizzazione**
- **Dove:** il modulo "Aggiungi" ha 14 campi obbligatori, segnaposto al posto delle etichette e due formati di data diversi. `dipendenti.html:34-48`.
- **Problema:**
  - le etichette spariscono durante la digitazione (contro `docs/componenti.md`, "Campo di testo");
  - "Data di nascita (gg/mm/aaaa)" e "Data di assunzione (aaaa-mm-gg)" sono nello stesso modulo;
  - "Ore settimanali" è testo libero;
  - `novalidate` è attivo, ma il codice controlla solo il telefono: gli altri `required` non vengono verificati sul client;
  - "Procedi" non dice l'azione.

  Per l'invito servono solo nome e telefono (README). Il modulo rallenta il compito 3 e moltiplica gli errori di formato.
- **Correzione:**
  - etichette `<label>` visibili;
  - `type="date"` (o un solo formato gg/mm/aaaa) e `type="number"` per le ore;
  - validare tutti i campi obbligatori, con l'errore sotto ciascun campo;
  - pulsante "Aggiungi e invita";
  - valutare un modulo breve (nome, cognome, telefono, ruolo), con i dati contrattuali completati dopo.
- **Collegamenti:** i dati richiesti sono da verificare con il reparto privacy (minimizzazione).

**ALNAIR-12 · P2 · Prevenzione degli errori; Visibilità dello stato**
- **Dove:** le azioni ✎ e 🗑 sulle righe dei dipendenti non hanno nome, conferma né comportamento. `dipendenti.html:26-28`.
- **Problema:** i pulsanti hanno solo un'icona, senza `aria-label` né testo. Il codice non ha handler, quindi il clic non fa nulla. Il cestino si trova vicino alla matita (bersagli piccoli, schermata `dipendenti-computer.png`). Quando verrà collegato servirà una conferma. Oggi l'utente non ha nessuna risposta. Un domani c'è rischio di cancellazione con un clic.
- **Correzione:**
  - `aria-label="Modifica Giulia R."` e `"Rimuovi Giulia R."`;
  - conferma che nomini il dipendente e le conseguenze (turni futuri, accesso all'app), oppure annullamento;
  - bersagli di almeno 24×24 px (WCAG 2.2, 2.5.8).
- **Revisione:** `requires_human_review`, perché il comportamento previsto non è nel codice.

**ALNAIR-13 · P2 · Visibilità dello stato; Controllo e libertà dell'utente**
- **Dove:** le frecce ◀ ▶ della settimana non fanno nulla. `turni.html:21-23`; `app.js` non ha handler per `prev-week`/`next-week`.
- **Problema:** non si può passare alla settimana successiva, cioè al caso d'uso della domenica sera. Le frecce non hanno nome accessibile e non avvisano delle modifiche non salvate. Inoltre "02/11 – 08/11" non segue il formato del glossario.
- **Correzione:**
  - collegare la navigazione;
  - `aria-label` "Settimana precedente" e "Settimana successiva";
  - avviso di modifiche non salvate prima di cambiare settimana;
  - etichetta "lun 2 – dom 8 nov".

**ALNAIR-14 · P2 · Aiuto e documentazione; Design essenziale**
- **Dove:** l'esportazione delle presenze è sepolta e il link non fa nulla. `impostazioni.html:22-38`.
- **Problema:** si trova a quattro livelli di `<details>` annidati (Locale › Esporta › Presenze). Il link `href="#"` "Clicca qui" non ha handler né feedback di download. Il compito 4 (mensile, per il consulente) è difficile da ritrovare e non dà conferma.
- **Correzione:** pulsante "Scarica le presenze di ottobre 2026" in una sezione "Esporta" di primo livello, con stato di preparazione del file ed errore recuperabile.
- **Collegamenti:** collegato a ALNAIR-09 per l'architettura dell'informazione.

## Rilievi (P3)

**ALNAIR-15 · P3 · Visibilità dello stato**
- **Dove:** la ricerca dei dipendenti non ha uno stato vuoto. `js/app.js:74-79`.
- **Problema:** il commento lo dice: "la tabella resta vuota". Il campo non ha `<label>` e il segnaposto usa "collaboratore", termine che il glossario vieta.
- **Correzione:** riga "Nessun dipendente trovato per «…»" con un pulsante "Cancella ricerca", `<label>` "Cerca un dipendente" e il conteggio dei risultati in `aria-live`.

**ALNAIR-16 · P3 · Coerenza e standard; Corrispondenza con il mondo reale**
- **Dove:** il menu, i titoli e i termini sono incoerenti. `*.html:11-16`, `dipendenti.html:19,32`, `impostazioni.html:24`.
- **Problema:**
  - voci in inglese (Settings, Dashboard) mescolate all'italiano;
  - "Squadra" nel menu ma "Personale" come titolo;
  - "Aggiungi una risorsa" e "Nome del negozio";
  - `lang="en"` su pagine in italiano.
- **Correzione:**
  - menu "Cruscotto, Turni, Dipendenti, Impostazioni", nell'ordine dei compiti;
  - titoli uguali alle voci del menu;
  - termini del glossario;
  - `lang="it"`.

**ALNAIR-17 · P3 · Riconoscimento anziché memorizzazione**
- **Dove:** la legenda della griglia turni è tutta grigia. `turni.html:45`.
- **Problema:** i tre "●" della legenda hanno lo stesso colore del testo (schermata `turni-computer.png`), quindi non spiegano i colori della griglia. Lo stato è affidato solo al colore (WCAG 2.2, 1.4.1).
- **Correzione:** usare i `.badge` con testo (Presente, In ritardo, Assente) già previsti da `docs/componenti.md`, sia nella legenda sia nelle celle.

## Formato JSON (sintesi strutturata)

```json
{
  "project": "turnio-pannello",
  "audit_id": null,
  "agent": "AIWDA-09 · ALNAIR",
  "page": { "name": "Pannello responsabili (4 pagine + js/app.js)", "url": "index.html, turni.html, dipendenti.html, impostazioni.html" },
  "observations": [
    {"id":"ALNAIR-01","type":"usability","title":"Elimina settimana senza conferma, primario accanto a Pubblica","evidence":{"url":"turni.html","screenshot":"schermate/turni-computer.png","location":"turni.html:28; js/app.js:22-25","steps":["Apri turni.html","Clicca Elimina settimana"]},"priority":"P1","confidence":0.9,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-02","type":"usability","title":"Pubblica e scambio mostrano Fatto! anche su errore","evidence":{"url":"turni.html","screenshot":null,"location":"js/app.js:17-20, 43-47","steps":["Clicca Pubblica i turni senza server raggiungibile (404)","Compare Fatto!"]},"priority":"P1","confidence":0.85,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-03","type":"usability","title":"Logout fisso a 10 minuti senza avviso, perdita del lavoro","evidence":{"url":"tutte le pagine","screenshot":null,"location":"js/app.js:11-12","steps":["Apri una pagina e lavora oltre 10 minuti"]},"priority":"P1","confidence":0.9,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-04","type":"usability","title":"Telefono valido respinto (spazi, +39)","evidence":{"url":"dipendenti.html","screenshot":null,"location":"js/app.js:56-60","steps":["Compila Telefono con 333 120 4455","Invia"]},"priority":"P1","confidence":0.95,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-05","type":"usability","title":"Errore server azzera i 14 campi con messaggio tecnico","evidence":{"url":"dipendenti.html","screenshot":null,"location":"js/app.js:61-71","steps":["Compila il modulo","Invia con risposta non ok"]},"priority":"P1","confidence":0.9,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-06","type":"usability","title":"Elimina locale: conferma generica, redirect anche su errore","evidence":{"url":"impostazioni.html","screenshot":"schermate/impostazioni-computer.png","location":"impostazioni.html:54; js/app.js:83-90","steps":["Clicca Elimina locale","Premi OK"]},"priority":"P1","confidence":0.85,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-07","type":"usability","title":"Salva ricarica anche se il salvataggio fallisce","location":"js/app.js:27-35","priority":"P2","confidence":0.7,"status":"Nuova","requires_human_review":true},
    {"id":"ALNAIR-08","type":"consistency","title":"Finestra scambio non conforme al componente modal","location":"turni.html:48-56; js/app.js:37-42","priority":"P2","confidence":0.85,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-09","type":"consistency","title":"Scambio con due flussi diversi; approvazione nascosta e senza handler","location":"turni.html:37; impostazioni.html:41-51; index.html:22-24","priority":"P2","confidence":0.8,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-10","type":"usability","title":"Salvataggio automatico senza feedback né errori","location":"impostazioni.html:20; js/app.js:92-94","priority":"P2","confidence":0.85,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-11","type":"usability","title":"Modulo da 14 campi, segnaposto come etichette, date in due formati","location":"dipendenti.html:34-50","priority":"P2","confidence":0.85,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-12","type":"usability","title":"Icone modifica ed elimina senza nome, conferma né comportamento","location":"dipendenti.html:26-28","priority":"P2","confidence":0.6,"status":"Nuova","requires_human_review":true},
    {"id":"ALNAIR-13","type":"usability","title":"Navigazione tra settimane non funzionante","location":"turni.html:21-23","priority":"P2","confidence":0.8,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-14","type":"usability","title":"Esportazione presenze sepolta e link inattivo","location":"impostazioni.html:27-33","priority":"P2","confidence":0.8,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-15","type":"usability","title":"Ricerca senza stato vuoto né etichetta","location":"dipendenti.html:20; js/app.js:74-79","priority":"P3","confidence":0.9,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-16","type":"consistency","title":"Menu misto inglese/italiano, titoli diversi dalle voci, lang=en","location":"*.html:2,11-16; dipendenti.html:19,32","priority":"P3","confidence":0.9,"status":"Nuova","requires_human_review":false},
    {"id":"ALNAIR-17","type":"usability","title":"Legenda turni senza colori, stato solo cromatico","location":"turni.html:45","priority":"P3","confidence":0.85,"status":"Nuova","requires_human_review":false}
  ],
  "tested_scenarios": ["Revisione statica del codice e delle schermate per computer di turni, dipendenti, impostazioni"],
  "limitations": ["Nessuna interazione eseguita dal vivo","Comportamenti con server reale inferiti dal codice","AIWDA-01 non caricato: tool agent non disponibile","Schermate per telefono non esaminate"],
  "summary": "6 P1, 8 P2, 3 P3: azioni distruttive senza protezione, successi falsi, perdita di lavoro (logout fisso, reset del modulo, reload), validazione del telefono troppo rigida, flussi di scambio incoerenti."
}
```

(Nel JSON, per brevità, `description`, `impact` e `recommendation` sono quelli scritti per esteso nei rilievi sopra.)

## Domande aperte per CANOPUS e l'utente

1. La griglia dei turni sarà modificabile? Se sì, ALNAIR-07 sale a P1.
2. Il responsabile deve poter fare uno scambio in prima persona (Turni), oppure solo approvare le richieste dei dipendenti? Serve per unificare il flusso di ALNAIR-09.
3. Quale comportamento è previsto per ✎ e 🗑 sui dipendenti (ALNAIR-12)?
4. Servono davvero tutti i 14 campi all'aggiunta? Da verificare con il reparto privacy per la minimizzazione.

**Fuori dal mio perimetro, da passare ad altri specialisti:**
- i grafici del cruscotto (asse 60–70 troncato, doppio asse, torta a 8 fette) vanno all'AIWDA dataviz;
- l'ordine del menu e l'annidamento in Impostazioni vanno all'Information Architect.

— AIWDA-09 · ALNAIR
