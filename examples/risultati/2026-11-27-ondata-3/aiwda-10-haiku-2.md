AIWDA-10 · AVIOR — Senior UX Writer, reparto AIWDA (AI Web Design)

Esito: revisione in sola lettura dei testi visibili del pannello «Turnio» (index.html, turni.html, dipendenti.html, impostazioni.html e i messaggi in js/app.js) rispetto a docs/glossario.md. Nessun file modificato. Trovati 4 rilievi P1 e 24 tra P2 e P3. Nessun P0.

Limiti e passaggi per il reparto:
- Non ho il tool agent: non ho potuto caricare il direttore AIWDA-01 · CANOPUS. Il consolidamento e i rilievi P1 vanno quindi riesaminati dal direttore o da un revisore su Opus, come prevede la regola comune per i modelli più piccoli.
- Lettura statica del sorgente: nessuna esecuzione nel browser. Le schermate in schermate/ non sono state guardate. Gli esiti su comportamento (conferme, messaggi dopo fetch) derivano dal codice in js/app.js e vanno verificati in esecuzione.
- Nessun accesso web: i criteri WCAG citati vengono dalla scheda wcag-2-2 (verificata 2026-11-19, da ricontrollare entro 2027-05-19). I criteri 1.3.1, 2.4.2, 3.1.1, 3.3.2 e 4.1.2 non sono elencati nella scheda: vanno verificati sulla fonte W3C da chi fa la revisione di accessibilità.
- Le letture di accessibilità (etichette, nomi dei pulsanti, lingua) sono segnalate per il design-accessibility-specialist; io ne propongo solo il testo.

Domande aperte per l'utente (vedi sotto).

Rilievi (formato JSON comune; «testo attuale» e «proposta» sono nel campo description e recommendation):

```json
{
  "project": "turnio",
  "audit_id": "aiwda-10-glossario",
  "agent": "AIWDA-10 · AVIOR",
  "page": {
    "name": "Tutte le pagine del pannello",
    "url": "index.html, turni.html, dipendenti.html, impostazioni.html, js/app.js"
  },
  "observations": [
    {
      "id": "AVIOR-01", "type": "accessibility", "title": "Campi del form dipendenti senza etichetta, solo segnaposto",
      "description": "In dipendenti.html righe 35-48 ogni campo ha solo il placeholder («Nome *», «Data di nascita (gg/mm/aaaa) *», «Data di assunzione (aaaa-mm-gg) *»). Il segnaposto sparisce appena si scrive e non sostituisce l'etichetta: non si vede quale formato è richiesto dopo aver digitato.",
      "evidence": {"url": "dipendenti.html", "screenshot": null, "location": "Form «Aggiungi una risorsa», righe 35-48", "steps": ["Apri Squadra (dipendenti.html)", "Clicca nel campo «Data di nascita»", "Scrivi un carattere: il testo guida scompare"]},
      "impact": "Chi compila il form può dimenticare il formato di date e codici; chi usa lettori di schermo non ha un nome per il campo.",
      "priority": "P1", "confidence": 0.85,
      "recommendation": "Etichetta visibile sopra ogni campo, con il formato tra parentesi (es. «Data di nascita (gg/mm/aaaa)»). Il segnaposto resta solo come esempio. Verificare WCAG 3.3.2 Labels or Instructions (A) e 1.3.1 sulla fonte W3C.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-02", "type": "accessibility", "title": "Pulsanti solo icona senza nome accessibile",
      "description": "Senza testo né aria-label: ◀ e ▶ (turni.html:21, 23), ⇄ (turni.html:37), ✎ e 🗑 in ogni riga della tabella (dipendenti.html:26-28). Il ✕ di chiusura della finestra è uno span, non un pulsante (turni.html:50).",
      "evidence": {"url": "turni.html; dipendenti.html", "screenshot": null, "location": "turni.html righe 21, 23, 37, 50; dipendenti.html righe 26-28", "steps": ["Attiva un lettore di schermo", "Scorri i pulsanti della griglia turni e della tabella Squadra", "Il pulsante non ha un nome"]},
      "impact": "Chi usa un lettore di schermo non sa cosa fanno né come cambiare settimana, modificare, eliminare o chiudere la finestra di scambio.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Aggiungere aria-label: «Settimana precedente», «Settimana successiva», «Cambia turno», «Modifica dipendente», «Elimina dipendente», «Chiudi». Trasformare il ✕ in un button con lo stesso nome. Verificare WCAG 4.1.2 (A) sulla fonte W3C.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-03", "type": "content", "title": "Errore al salvataggio del dipendente: codice tecnico e dati cancellati",
      "description": "app.js righe 63-66: il messaggio è «Errore ${res.status}: payload non valido» (codice e gergo tecnico) e subito dopo form.reset() cancella tutti i campi già compilati. Testo attuale = messaggio sopra. Il messaggio dice «riprova» ma i dati sono già persi.",
      "evidence": {"url": "dipendenti.html", "screenshot": null, "location": "app.js righe 63-66, box #form-error", "steps": ["Compila il form Squadra", "Fai fallire il salvataggio lato server (risposta non ok)", "Leggi il messaggio sotto il form e controlla i campi"]},
      "impact": "L'utente non sa cosa è successo né cosa fare, e deve riscrivere tutto.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "«Non è stato possibile salvare il dipendente. Controlla i dati e riprova.» Togliere form.reset() dal ramo di errore (comportamento: da decidere con il design UX). Glossario: nessun codice tecnico.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-04", "type": "content", "title": "«Fatto!» anche quando la pubblicazione dei turni fallisce",
      "description": "app.js righe 17-20: la risposta di /api/week/publish non viene controllata; il messaggio «Fatto!» compare in ogni caso e sparisce dopo 1,5 s (righe 8-9).",
      "evidence": {"url": "turni.html", "screenshot": null, "location": "app.js righe 17-20; pulsante #publish, turni.html riga 27", "steps": ["Apri Turni", "Clicca «Pubblica i turni» con il server che risponde con errore", "Compare «Fatto!»"]},
      "impact": "Il titolare crede che i turni siano visibili ai dipendenti quando non lo sono.",
      "priority": "P1", "confidence": 0.8,
      "recommendation": "Successo: «Turni pubblicati. Li vedono i dipendenti.» Errore: «I turni non sono stati pubblicati. Riprova.» Verificare il comportamento in esecuzione (non eseguito).",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-05", "type": "usability", "title": "«Elimina settimana» cancella senza conferma e senza messaggio",
      "description": "turni.html riga 28 e app.js righe 22-25: il clic cancella la settimana, svuota la griglia e non mostra nulla. Il testo del pulsante «Elimina settimana» non dice che cosa si perde.",
      "evidence": {"url": "turni.html", "screenshot": null, "location": "#delete-week, turni.html riga 28; app.js righe 22-25", "steps": ["Apri Turni", "Clicca «Elimina settimana»", "La griglia si svuota senza conferma"]},
      "impact": "Azione distruttiva a un clic, senza spiegazione di cosa è stato perso.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Finestra di conferma: titolo «Eliminare i turni di questa settimana?», testo «Vengono cancellati i turni dal 2 al 8 nov. Vuoi procedere?», pulsanti «Elimina la settimana» e «Annulla». Il comportamento (conferma e messaggio dopo) va deciso con il design UX; il testo richiede conferma del titolare sulla conseguenza esatta.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-06", "type": "content", "title": "Conferma vaga per «Elimina locale»",
      "description": "app.js riga 86: confirm(«Vuoi davvero procedere?»). Non dice quale locale né che cosa si perde.",
      "evidence": {"url": "impostazioni.html", "screenshot": null, "location": "app.js riga 86; pulsante #delete-store, impostazioni.html riga 54", "steps": ["Apri Impostazioni, Zona pericolosa", "Clicca «Elimina locale»", "Compare «Vuoi davvero procedere?»"]},
      "impact": "Eliminazione di un intero locale con una domanda generica.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "«Vuoi eliminare il locale «Trattoria Il Ponte»? L'operazione non si può annullare.» Il «non si può annullare» e le conseguenze vanno confermati dal titolare: non ho verificato il comportamento del server.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-07", "type": "data_visualization", "title": "Legenda del costo per ruolo: percentuali che sommano 108%",
      "description": "index.html righe 62-69: 34 + 29 + 14 + 9 + 8 + 7 + 4 + 3 = 108%. Anche i valori stroke-dasharray del grafico a torta (righe 52-59) sommano 108 su 100. Un arrotondamento non spiega una differenza di 8 punti su otto voci.",
      "evidence": {"url": "index.html", "screenshot": null, "location": "Legenda righe 62-69; torta righe 52-59", "steps": ["Apri Dashboard", "Somma le percentuali della legenda «Costo del lavoro per ruolo»"]},
      "impact": "Il titolare legge un dato errato sul costo del personale.",
      "priority": "P1", "confidence": 0.95,
      "recommendation": "Segnalare al titolare del dato e al design-dataviz; non correggere i numeri da soli. Fuori dal mio ambito di scrittura, lo segnalo per completezza.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-08", "type": "consistency", "title": "Voce di menu «Settings» e lingua della pagina impostata su inglese",
      "description": "Il menu (riga 12 di ogni pagina) dice «Settings», mentre tutto il resto è in italiano («Impostazioni» è il titolo della pagina). Tutte le pagine hanno <html lang=\"en\">, riga 2.",
      "evidence": {"url": "tutte le pagine", "screenshot": null, "location": "Riga 2 e riga 12 di index.html, turni.html, dipendenti.html, impostazioni.html", "steps": ["Apri una qualsiasi pagina", "Leggi la voce «Settings» nel menu", "Con un lettore di schermo la pagina viene letta con voce inglese"]},
      "impact": "Incoerenza con il glossario («Il pannello è in italiano»); per i lettori di schermo la pronuncia dell'italiano è sbagliata.",
      "priority": "P2", "confidence": 0.95,
      "recommendation": "Voce di menu «Impostazioni» e lang=\"it\". «Dashboard» è un anglicismo comune: va deciso con il titolare. Verificare WCAG 3.1.1 (A) con il design-accessibility-specialist.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-09", "type": "consistency", "title": "Tre nomi per la stessa pagina: Squadra, Personale, Dipendenti",
      "description": "La voce di menu è «Squadra» (dipendenti.html riga 14), il titolo è «Personale» (riga 19), la didascalia della tabella è «Dipendenti del locale» (riga 23).",
      "evidence": {"url": "dipendenti.html", "screenshot": null, "location": "Righe 14, 19, 23", "steps": ["Apri Squadra", "Confronta il nome nel menu, nel titolo e nella tabella"]},
      "impact": "L'utente non è sicuro di trovarsi nella stessa sezione.",
      "priority": "P2", "confidence": 0.9,
      "recommendation": "Usare «Dipendenti» (termine del glossario) per menu, titolo e didascalia. Se il titolare preferisce «Squadra», va scelto e applicato a tutte e tre.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-10", "type": "content", "title": "«Collaboratore» fuori glossario nel campo di ricerca",
      "description": "dipendenti.html riga 20: placeholder «Cerca un collaboratore». Il glossario indica «dipendente» e vieta «collaboratore».",
      "evidence": {"url": "dipendenti.html", "screenshot": null, "location": "Riga 20", "steps": ["Apri Squadra", "Leggi il campo di ricerca"]},
      "impact": "Termine incoerente con il resto del pannello.",
      "priority": "P2", "confidence": 0.95,
      "recommendation": "«Cerca un dipendente».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-11", "type": "content", "title": "«Risorsa» fuori glossario nel titolo del form",
      "description": "dipendenti.html riga 32: «Aggiungi una risorsa». Il glossario vieta «risorsa».",
      "evidence": {"url": "dipendenti.html", "screenshot": null, "location": "Riga 32", "steps": ["Apri Squadra", "Leggi il titolo sopra il form"]},
      "impact": "Termine incoerente.",
      "priority": "P2", "confidence": 0.95,
      "recommendation": "«Aggiungi un dipendente».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-12", "type": "content", "title": "Pulsante «Procedi» generico",
      "description": "dipendenti.html riga 50: il pulsante di invio dice «Procedi», che non descrive l'azione. Il glossario chiede verbi che dicono l'azione.",
      "evidence": {"url": "dipendenti.html", "screenshot": null, "location": "Riga 50, #save-staff", "steps": ["Apri Squadra", "Leggi il pulsante in fondo al form"]},
      "impact": "L'utente non sa se il clic salva, invia o va avanti.",
      "priority": "P2", "confidence": 0.9,
      "recommendation": "«Aggiungi il dipendente».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-13", "type": "content", "title": "«Swap» nel titolo della finestra",
      "description": "turni.html riga 51: «Swap del turno». Il glossario indica «scambio» e vieta «swap».",
      "evidence": {"url": "turni.html", "screenshot": null, "location": "Riga 51, #swap-modal", "steps": ["Apri Turni", "Clicca ⇄ su una riga", "Leggi il titolo della finestra"]},
      "impact": "Termine incoerente con «Scambi da approvare» nelle altre pagine.",
      "priority": "P2", "confidence": 0.95,
      "recommendation": "«Scambio del turno».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-14", "type": "content", "title": "«Fascia» al posto di «turno»",
      "description": "turni.html riga 52: «Giulia R. · sab 7 nov · fascia 18:00–00:30». Il glossario indica «fascia» come termine da non usare per il turno.",
      "evidence": {"url": "turni.html", "screenshot": null, "location": "Riga 52", "steps": ["Apri Turni", "Clicca ⇄ su una riga", "Leggi la riga sotto il titolo"]},
      "impact": "Termine incoerente.",
      "priority": "P2", "confidence": 0.95,
      "recommendation": "«Giulia R. · sab 7 nov · turno 18:00–00:30».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-15", "type": "content", "title": "«Negozio» al posto di «locale»",
      "description": "impostazioni.html riga 24: etichetta «Nome del negozio». Il glossario indica «locale» e vieta «negozio».",
      "evidence": {"url": "impostazioni.html", "screenshot": null, "location": "Riga 24", "steps": ["Apri Impostazioni, Locale"]},
      "impact": "Termine incoerente con «Elimina locale» e «Dipendenti del locale».",
      "priority": "P2", "confidence": 0.95,
      "recommendation": "«Nome del locale».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-16", "type": "content", "title": "Pulsanti «OK» e «No» non dicono l'azione",
      "description": "turni.html riga 54 («OK» nella finestra di scambio) e impostazioni.html righe 46-48 («OK» e «No» per ogni scambio). Il glossario chiede verbi che dicono l'azione e vieta «OK» come nome.",
      "evidence": {"url": "turni.html; impostazioni.html", "screenshot": null, "location": "turni.html riga 54; impostazioni.html righe 46-48", "steps": ["Apri Impostazioni, Scambi da approvare", "Leggi «OK» e «No» su ogni riga"]},
      "impact": "Chi approva o rifiuta non vede subito la conseguenza. Due pulsanti uguali per tutte le righe.",
      "priority": "P2", "confidence": 0.9,
      "recommendation": "«Approva» e «Rifiuta» nella tabella; «Conferma lo scambio» e «Annulla» nella finestra. Verificare con il design UX se la finestra conferma davvero l'azione.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-17", "type": "content", "title": "Date in forme diverse dal glossario",
      "description": "Il glossario chiede «lun 3 feb». Trovate: «02/11 – 08/11» (turni.html riga 22); «2026-11-07 18:00–00:30» (impostazioni.html righe 46-48); «Dati aggiornati a mercoledì 11 novembre» (index.html riga 90); etichette del grafico «12 ott», «2 nov» senza giorno (index.html righe 88).",
      "evidence": {"url": "turni.html; impostazioni.html; index.html", "screenshot": null, "location": "Riferimenti indicati", "steps": ["Apri Turni, Impostazioni e Dashboard", "Confronta le date con il glossario"]},
      "impact": "Formati diversi nello stesso pannello.",
      "priority": "P2", "confidence": 0.9,
      "recommendation": "«lun 2 nov – dom 8 nov»; «sab 7 nov 18:00–00:30»; «Dati aggiornati a mer 11 nov». Per le etichette del grafico, decidere con il design-dataviz se il giorno serve.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-18", "type": "consistency", "title": "Due formati diversi per i campi data del form",
      "description": "dipendenti.html riga 40: «Data di nascita (gg/mm/aaaa)»; riga 46: «Data di assunzione (aaaa-mm-gg)».",
      "evidence": {"url": "dipendenti.html", "screenshot": null, "location": "Righe 40 e 46", "steps": ["Apri Squadra", "Confronta i due campi data"]},
      "impact": "Chi compila deve ricordare due formati nello stesso form; facile sbagliare.",
      "priority": "P2", "confidence": 0.85,
      "recommendation": "Un solo formato per entrambi, con etichetta visibile (vedi AVIOR-01). Il formato va scelto dal titolare: il glossario non lo fissa per i campi di input.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-19", "type": "consistency", "title": "Ruoli diversi nella dashboard e nel form; maiuscole diverse",
      "description": "La legenda del costo per ruolo (index.html righe 62-69) elenca otto ruoli (Cucina, Sala, Bar, Lavapiatti, Pizzeria, Responsabili, Pulizie, Extra). Il form (dipendenti.html riga 47) ne offre solo tre (sala, cucina, bar). I ruoli in tabella e in select sono in minuscolo (dipendenti.html righe 27-28, 47; turni.html righe 36-42), quelli della dashboard hanno l'iniziale maiuscola.",
      "evidence": {"url": "index.html; dipendenti.html; turni.html", "screenshot": null, "location": "Righe indicate", "steps": ["Apri Dashboard e leggi la legenda", "Apri Squadra e apri il menu «Ruolo»"]},
      "impact": "Il titolare non può assegnare un dipendente a ruoli che la dashboard mostra.",
      "priority": "P2", "confidence": 0.85,
      "recommendation": "Un solo elenco di ruoli, con la stessa forma ovunque. Da chiedere al titolare quale elenco è quello vero: non invento ruoli.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-20", "type": "usability", "title": "Ricerca senza risultati: tabella vuota e nessun messaggio",
      "description": "app.js riga 78 (commento «la tabella resta vuota»): quando la ricerca non trova nulla, non appare alcun testo.",
      "evidence": {"url": "dipendenti.html", "screenshot": null, "location": "app.js righe 74-79", "steps": ["Apri Squadra", "Scrivi «zzz» nel campo di ricerca"]},
      "impact": "L'utente non capisce se il dato manca o se la ricerca è rotta.",
      "priority": "P2", "confidence": 0.9,
      "recommendation": "Messaggio nella tabella: «Nessun dipendente corrisponde alla ricerca.» Verificare il comportamento in esecuzione.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-21", "type": "content", "title": "Errore del telefono: incolpa l'utente e non dice il formato",
      "description": "app.js riga 58: «Hai sbagliato il numero.» dà la colpa all'utente e non dice il formato. Il controllo accetta solo 10 cifre senza spazi, ma la tabella mostra i numeri con spazi (dipendenti.html righe 26-28, «333 120 4455»).",
      "evidence": {"url": "dipendenti.html", "screenshot": null, "location": "app.js righe 56-59; dipendenti.html righe 26-28", "steps": ["Apri Squadra", "Inserisci «333 120 4455» nel campo Telefono e invia", "Leggi il messaggio"]},
      "impact": "L'utente vede un numero scritto in un modo e viene respinto perché lo scrive così.",
      "priority": "P2", "confidence": 0.85,
      "recommendation": "«Il telefono deve avere 10 cifre, senza spazi (es. 3331204455).» Decidere con il titolare se accettare gli spazi: il controllo va cambiato o il testo va tenuto così.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-22", "type": "content", "title": "Conferme «Fatto!» generiche",
      "description": "app.js righe 19, 46 e 68: «Fatto!» dopo pubblicazione, scambio e salvataggio del dipendente. Non dice cosa è successo.",
      "evidence": {"url": "turni.html; dipendenti.html", "screenshot": null, "location": "app.js righe 19, 46, 68", "steps": ["Pubblica i turni, approva uno scambio o aggiungi un dipendente", "Leggi il messaggio"]},
      "impact": "Il messaggio non conferma quale azione è andata a buon fine.",
      "priority": "P2", "confidence": 0.9,
      "recommendation": "Pubblicazione: «Turni pubblicati.» Scambio: «Scambio confermato.» Dipendente: «Dipendente aggiunto.» Dopo l'aggiunta il nuovo dipendente non compare in tabella: segnalo al design UX.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-23", "type": "content", "title": "Etichetta «Collega» ambigua e finestra senza «Annulla»",
      "description": "turni.html riga 53: «Collega» non dice se è un collega da scegliere o un'azione. La finestra non ha un pulsante di annullamento (righe 48-56): si chiude solo dal ✕ (AVIOR-02).",
      "evidence": {"url": "turni.html", "screenshot": null, "location": "Righe 48-56", "steps": ["Apri Turni", "Clicca ⇄", "Leggi l'etichetta del campo e le azioni disponibili"]},
      "impact": "Non è chiaro che cosa fa il menu e come uscire senza scambiare.",
      "priority": "P2", "confidence": 0.85,
      "recommendation": "Etichetta «Cedi il turno a»; pulsanti «Conferma lo scambio» e «Annulla».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-24", "type": "content", "title": "Differenza fra «Salva» e «Pubblica i turni» non chiara",
      "description": "turni.html righe 27 e 29: «Pubblica i turni» e «Salva». app.js righe 27-31: «Salva» ricarica la pagina senza messaggio. Il testo non dice cosa cambia tra i due.",
      "evidence": {"url": "turni.html", "screenshot": null, "location": "Righe 27 e 29; app.js righe 27-31", "steps": ["Apri Turni", "Clicca «Salva»", "La pagina si ricarica senza messaggio"]},
      "impact": "L'utente non sa se «Salva» rende i turni visibili.",
      "priority": "P2", "confidence": 0.8,
      "recommendation": "Dopo la risposta del titolare sulla differenza: per esempio «Salva bozza» e messaggio «Bozza salvata». Domanda aperta, non decido io il comportamento.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-25", "type": "content", "title": "Link «Clicca qui» e «Scarica il report» senza destinazione né azione",
      "description": "impostazioni.html riga 32: «Clicca qui» per le presenze; riga 36: «Scarica il report». Entrambi sono link con href=\"#\" e in app.js non c'è alcun gestore per questi link. Il testo «Clicca qui» non dice cosa si scarica.",
      "evidence": {"url": "impostazioni.html", "screenshot": null, "location": "Righe 32 e 36", "steps": ["Apri Impostazioni, Esporta", "Clicca «Clicca qui» o «Scarica il report»", "Non succede nulla"]},
      "impact": "Il file non si scarica e il testo non dice cosa si ottiene.",
      "priority": "P2", "confidence": 0.8,
      "recommendation": "«Scarica le presenze di ottobre 2026» e «Scarica il report del costo del lavoro», legati al mese scelto. Il collegamento alla funzione è un problema di sviluppo: segnalato al reparto software.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-26", "type": "usability", "title": "Banner scambi non cliccabile",
      "description": "index.html riga 23: «🔔 3 scambi da approvare» è solo testo, non un collegamento alla lista degli scambi (impostazioni.html, righe 41-51).",
      "evidence": {"url": "index.html", "screenshot": null, "location": "Riga 23", "steps": ["Apri Dashboard", "Clicca il banner"]},
      "impact": "L'utente vede un avviso senza un modo diretto per rispondere.",
      "priority": "P2", "confidence": 0.8,
      "recommendation": "«3 scambi da approvare: apri la lista» come collegamento. Il dove vive la lista va deciso con design-information-architect.",
      "status": "Nuova", "requires_human_review": true
    },
    {
      "id": "AVIOR-27", "type": "content", "title": "Campo «Ore settimanali» senza unità",
      "description": "dipendenti.html riga 45: «Ore settimanali *» non dice se si scrive un numero di ore o altro.",
      "evidence": {"url": "dipendenti.html", "screenshot": null, "location": "Riga 45", "steps": ["Apri Squadra", "Leggi il campo"]},
      "impact": "Piccolo rischio di errore di formato.",
      "priority": "P3", "confidence": 0.7,
      "recommendation": "«Ore settimanali (es. 40)».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "AVIOR-28", "type": "content", "title": "Sigla «CCNL» non spiegata",
      "description": "dipendenti.html riga 44: «Livello CCNL *». Il glossario non la copre; la sigla non è spiegata nel pannello.",
      "evidence": {"url": "dipendenti.html", "screenshot": null, "location": "Riga 44", "steps": ["Apri Squadra", "Leggi il campo Livello CCNL"]},
      "impact": "Chi non conosce la sigla non sa cosa scrivere.",
      "priority": "P3", "confidence": 0.7,
      "recommendation": "«Livello del contratto (CCNL)», con un aiuto che dice cosa scrivere. Da confermare con il titolare o con chi tiene le buste paga.",
      "status": "Nuova", "requires_human_review": false
    }
  ],
  "tested_scenarios": [
    "Lettura statica del sorgente di index.html, turni.html, dipendenti.html, impostazioni.html e js/app.js",
    "Verifica aritmetica delle percentuali della legenda e delle ore per giorno (62+63+64+65+68+70+69 = 461, coerente con il KPI)",
    "Confronto con docs/glossario.md (termini, verbi dei pulsanti, date, numeri)"
  ],
  "limitations": [
    "Nessuna esecuzione nel browser: i comportamenti di conferma, messaggi dopo fetch e ricerca vanno verificati in esecuzione",
    "Schermate in schermate/ non guardate",
    "Criteri WCAG (1.3.1, 2.4.2, 3.1.1, 3.3.2, 4.1.2) non presenti nella scheda wcag-2-2: da verificare sulla fonte W3C",
    "Nessun accesso web per verificare fonti; il direttore AIWDA-01 non caricato (nessun tool agent)"
  ],
  "summary": "Testi in gran parte coerenti col glossario, ma: due errori di dato o di comportamento visibili (legenda al 108%, messaggio «Fatto!» anche in caso di errore), tre azioni distruttive senza conferma adeguata, etichette senza nome per lettori di schermo e molti termini fuori glossario («collaboratore», «risorsa», «swap», «fascia», «negozio», «OK»). Quattro rilievi P1 da riesaminare dal direttore o da un revisore su Opus prima che diventino definitivi."
}
```

Domande aperte per il titolare (da fare con AskUserQuestion in sessione interattiva):
1. Nome della pagina dipendenti: «Dipendenti», «Squadra» o «Personale»? (AVIOR-09)
2. Menu «Dashboard»: anglicismo accettato o «Riepilogo»? (AVIOR-08)
3. Qual è l'elenco vero dei ruoli: quelli della dashboard o quelli del form? (AVIOR-19)
4. Cosa fa «Salva» rispetto a «Pubblica i turni»? (AVIOR-24)
5. Un solo formato per le date di input: gg/mm/aaaa o aaaa-mm-gg? (AVIOR-18)
6. Il telefono accetta gli spazi? (AVIOR-21)
7. Eliminare un locale o una settimana è davvero irreversibile? Serve per la conferma. (AVIOR-05, AVIOR-06)
8. «settimana corrente» nella dashboard: la settimana dei turni (2–8 nov) o quella dei dati (aggiornati a mer 11 nov)?

Fuori dal mio ambito, da passare agli altri ruoli: il grafico «Ore lavorate per giorno» parte da 60 e non da zero (design-dataviz); i pulsanti a icona e il ✕ come span (design-accessibility-specialist, AVIOR-02); campi IBAN e codice fiscale nel form (privacy); il titolo di pagina uguale su tutte («Turnio») (design-accessibility-specialist, criterio 2.4.2); la voce «Scambi da approvare» dentro Impostazioni (design-information-architect).

Firma: AIWDA-10 · AVIOR — Senior UX Writer, reparto AIWDA (AI Web Design).
