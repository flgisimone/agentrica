AIWDA-09 · ALNAIR — Senior Usability Auditor, reparto AIWDA (AI Web Design)

# Rapporto di usabilità del pannello Turnio

Perimetro: dipendenti.html, impostazioni.html, turni.html, index.html, js/app.js; css/app.css letto solo per modale, toast e focus. Sola lettura, nessun processo avviato. Progetto statico senza server: i comportamenti sono dedotti dal codice, nulla eseguito in un browser. Non ho aperto le schermate PNG. Non ho caricato AIWDA-01 né le schede della biblioteca (WCAG 2.2, EN 301 549, D.lgs. 82/2022): i riferimenti WCAG sono dalla mia conoscenza e vanno verificati sulle schede.

Esito: 5 P1, 12 P2, 4 P3 (21 rilievi), nessun P0. Tre azioni distruttive senza protezione (U-01, U-02, U-04/U-05), un errore che cancella il modulo (U-06), un modulo che chiede 13 campi per un invito che richiede nome e telefono (U-07), validazione del telefono che respinge dati corretti (U-11).

## Azioni rischiose senza protezione

**U-01 · P1 · Elimina settimana senza conferma né annullamento**
- Euristica: prevenzione degli errori, controllo e libertà.
- Evidenza: js/app.js:22-25 fa DELETE e svuota #week senza confirm né controllo di res.ok. turni.html:28 usa btn-primary, uguale e adiacente a «Pubblica i turni».
- Impatto: la griglia sparisce subito (compito più frequente); se la DELETE fallisce sparisce comunque.
- Correzione: conferma che dica cosa si perde («Elimini i turni di 02/11 – 08/11? Non si può annullare»); svuotare solo se res.ok; stile btn-danger separato, oppure annulla temporaneo.

**U-02 · P1 · Pubblica i turni senza conferma né esito vero**
- Euristica: visibilità dello stato, prevenzione degli errori.
- Evidenza: js/app.js:17-20 POST e toast «Fatto!» senza controllare res.ok; errore di rete non gestito.
- Impatto: azione con effetto esterno (notifica ai dipendenti); si può credere di aver pubblicato quando non è successo; nessuno stato «già pubblicato».
- Correzione: conferma «Pubblichi i turni 02/11 – 08/11 a 3 dipendenti? Riceveranno una notifica»; toast solo su successo, errore chiaro altrimenti; stato «Pubblicati il …».

**U-03 · P2 · Scambi da approvare: OK/No senza handler né esito**
- Evidenza: impostazioni.html:46-48, sei pulsanti senza id né gestore in app.js; etichette «OK»/«No» generiche.
- Impatto: secondo compito per frequenza; nessun feedback, la riga non sparisce, il badge «3» non cambia; un «No» sbagliato non si recupera.
- Correzione: «Approva lo scambio»/«Rifiuta», esito sulla riga, badge aggiornato, annulla per qualche secondo.

**U-04 · P1 · «Elimina locale» con conferma generica**
- Evidenza: js/app.js:86 confirm("Vuoi davvero procedere?") non dice cosa si perde né che è irreversibile; js/app.js:87-88 reindirizza a /addio senza controllare l'esito. impostazioni.html:53-54 zona pericolosa (bene) ma senza spiegazione.
- Impatto: un clic cancella dipendenti, turni e presenze.
- Correzione: modale propria con elenco di ciò che si cancella, far digitare il nome del locale, suggerire di esportare prima le presenze, redirect solo su res.ok.

**U-05 · P1 · Impostazioni «si salvano da sole» senza dire se salvate**
- Evidenza: js/app.js:92-94 PATCH a ogni change, senza corpo (nessun valore inviato), senza esito né errore; impostazioni.html:20 lo promette.
- Impatto: se fallisce, l'utente crede cambiati nome e orari.
- Correzione: inviare il valore, mostrare «Salvato»/«Non salvato, riprova» accanto al campo, controllare res.ok.

## Errori che fanno perdere lavoro

**U-06 · P1 · Un errore del server cancella il modulo**
- Evidenza: js/app.js:63-67, su !res.ok scrive `Errore ${res.status}: payload non valido` e fa form.reset(). Contraddice docs/glossario.md (niente codici tecnici, dire cosa fare).
- Impatto: si perdono 14 campi digitati.
- Correzione: togliere form.reset(), mantenere i valori, motivo in italiano accanto al campo, focus sul messaggio.

**U-07 · P1 · 13 campi obbligatori per un invito che richiede nome e telefono**
- Evidenza: dipendenti.html:35-47 (nome, cognome, telefono, email, codice fiscale, data di nascita, indirizzo, IBAN, contratto, livello CCNL, ore, data assunzione, ruolo); README compito 3: l'invito usa nome e numero di telefono.
- Impatto: attrito e abbandono; raccolta di dati sensibili (IBAN, codice fiscale, indirizzo) non necessari all'invito.
- Correzione (da confermare con l'utente): obbligatori solo nome, cognome, ruolo, telefono; il resto in sezione facoltativa «Dati per il contratto» o scheda separata. requires_human_review: true.

**U-08 · P2 · Modifica ed elimina nella tabella senza handler né etichetta**
- Evidenza: dipendenti.html:26-28, pulsanti ✎ e 🗑 senza gestore e senza aria-label.
- Impatto: nessuna modifica/rimozione possibile; quando collegato, il cestino senza conferma sarebbe un rischio; gli screen reader non li descrivono.
- Correzione: aria-label «Modifica Giulia R.»/«Elimina Giulia R.», conferma che indichi i turni futuri.

**U-09 · P2 · Salva turni ricarica sempre la pagina; errore solo in console**
- Evidenza: js/app.js:27-35, PUT senza corpo, reload anche se !res.ok, catch con solo console.log.
- Impatto: un salvataggio fallito è seguito da un reload che butta via il lavoro, senza messaggio.
- Correzione: controllare res.ok, non ricaricare in errore, mostrare «Non salvato, riprova»; aggiornare la griglia senza reload.

**U-10 · P2 · Logout dopo 10 minuti senza avviso, timer non azzerato**
- Evidenza: js/app.js:11-12, setTimeout fisso dal caricamento (il commento dice «senza richieste», il codice no), nessun avviso né salvataggio di bozze.
- Impatto: chi prepara i turni o compila il modulo oltre 10 minuti viene portato a /login perdendo il lavoro (cfr. WCAG 2.2.1, da verificare).
- Correzione: azzerare il timer a ogni interazione, avvisare 1-2 minuti prima con «Resta connesso», niente logout con modifiche non salvate.

## Validazioni che respingono dati corretti

**U-11 · P1 · Telefono solo 10 cifre senza spazi**
- Evidenza: js/app.js:57 /^\d{10}$/; la tabella mostra «333 120 4455» (dipendenti.html:26). Respinti spazi, trattini, +39, fissi a 9 cifre.
- Passaggi: inserire «333 120 4455» o «+39 333 1204455» e inviare.
- Impatto: dato corretto respinto sul canale dell'invito. requires_human_review: true (formati da accettare).
- Correzione: normalizzare (togliere spazi, trattini, +39/0039) prima del controllo; mostrare un esempio sotto il campo.

**U-12 · P2 · Errore che dà la colpa all'utente e non dice cosa fare**
- Evidenza: js/app.js:58 «Hai sbagliato il numero.»; contro il glossario; messaggio in fondo al modulo, campo senza aria-invalid/aria-describedby, focus non spostato.
- Correzione: «Il telefono deve avere 10 cifre, per esempio 333 120 4455», accanto al campo, con focus sul campo.

**U-13 · P2 · Campi senza label, senza tipo, date in due formati**
- Evidenza: dipendenti.html:35-48, solo placeholder (sparisce a digitazione), nessun type="tel"/"email", nessun autocomplete/inputmode; date «gg/mm/aaaa» (riga 40) e «aaaa-mm-gg» (riga 46); novalidate a riga 34.
- Impatto: dopo la digitazione non si vede più cosa serve; tastiera sbagliata sul telefono (molti lavorano da telefono, ricerca/interviste.md); WCAG 1.3.1/3.3.2 (da verificare).
- Correzione: label visibili, type tel/email/date, un solo formato per le date, inputmode dove serve.

**U-14 · P2 · Validato solo il telefono**
- Evidenza: js/app.js:53-60; con novalidate, gli altri campi obbligatori passano vuoti e solo il server li ferma (con il messaggio di U-06).
- Correzione: controllo dei campi obbligatori con messaggio per campo e riepilogo con link; non validare in modo restrittivo codice fiscale e IBAN senza una regola reale.

**U-15 · P2 · Dopo il successo modulo pieno e tabella invariata**
- Evidenza: js/app.js:68, solo toast «Fatto!»; pulsante «Procedi» (dipendenti.html:50) non dice cosa fa.
- Impatto: non si sa se l'invito è partito né si vede il nuovo dipendente; rischio di doppioni.
- Correzione: svuotare il modulo, aggiungere la riga, disabilitare il pulsante durante l'invio, «Aggiungi e invita» con toast «Invito inviato a …».

## Comportamenti incoerenti

**U-16 · P2 · Toast «Fatto!» generico, 1,5 secondi, senza aria-live**
- Evidenza: js/app.js:3-9, 19, 46, 68; toast senza role="status" (turni.html:58, dipendenti.html:53, impostazioni.html:56).
- Impatto: non dice cosa è stato fatto, sparisce prima di essere letto, non annunciato dagli screen reader (WCAG 2.2.1/4.1.3, da verificare).
- Correzione: testo specifico, almeno 5 secondi o chiusura manuale, role="status".

**U-17 · P2 · Modale dello scambio: dati fissi, nessun effetto, non accessibile**
- Evidenza: turni.html:48-56, js/app.js:37-47. Turno e collega fissi («Giulia R. · sab 7 nov»), select non letto (POST senza corpo, app.js:44), tutti i ⇄ aprono la stessa modale; titolo «Swap del turno» e pulsante «OK» contro il glossario (scambio, verbo); chiusura è uno span ✕ non focalizzabile; niente role="dialog", Esc, trappola del focus, clic fuori.
- Impatto: si può credere di scambiare un turno diverso da quello scelto; da tastiera non si esce.
- Correzione: leggere turno e collega dal pulsante cliccato e inviarli, «Proponi lo scambio», button aria-label="Chiudi", role="dialog", Esc, gestione del focus; usare btn invece di .button.

**U-18 · P2 · Ricerca senza stato «nessun risultato» né etichetta**
- Evidenza: js/app.js:74-79 (il commento ammette tabella vuota); dipendenti.html:20 solo placeholder; la ricerca copre anche telefono e ore.
- Correzione: riga «Nessun dipendente trovato per “xyz”» con pulsante per azzerare, etichetta visibile, annuncio del numero di risultati.

**U-20 · P2 · Esportazione presenze sepolta in tre details, link «Clicca qui» che non fa nulla**
- Evidenza: impostazioni.html:27-38; percorso Locale > Esporta > Presenze per il consulente > «Clicca qui» con href="#" e nessun handler; select del mese senza label.
- Impatto: compito mensile a 4 clic; il clic riporta in cima alla pagina senza scaricare.
- Correzione: voce di primo livello «Esporta presenze», label per il mese, pulsante «Scarica le presenze di ottobre 2026».

**U-19 · P3 · Terminologia e lingua incoerenti**
- Evidenza: «Personale», «risorsa», «collaboratore», «Squadra» (nav), «Settings» (nav) vs «Impostazioni» (titolo), «Nome del negozio» (impostazioni.html:24), «Collega» (turni.html:53), html lang="en" in tutte le pagine; il glossario dice «dipendente», «locale».
- Correzione: «Dipendenti», «Aggiungi un dipendente», «Impostazioni», «Nome del locale», lang="it".

**U-21 · P3 · Focus invisibile, stati solo colore**
- Evidenza: css/app.css:14 `*:focus { outline: none; }` senza :focus-visible alternativo; turni.html:37-45 pallini dot-ok/dot-late/dot-absent con legenda solo a colori (WCAG 2.4.7/1.4.1, da verificare).
- Correzione: contorno visibile su :focus-visible, testo o icona per gli stati.

## Scenari esaminati e limiti
- Esaminato: lettura statica di tutte le pagine e di js/app.js, css per focus/modale, README e glossario.
- Non verificato: esecuzione nel browser, risposta reale del server (non esiste), schermate PNG, contrasti, resa su telefono, grafici del cruscotto (index.html; di competenza del dataviz).
- Citazioni WCAG non controllate sulle schede della biblioteca.

Domande aperte: quali dati servono davvero all'invito? Il server permette di annullare l'eliminazione di una settimana? Quanto dura una sessione tipica sui turni (per il tempo del logout)?

Sono su un modello più piccolo (Sonnet): propongo il riesame di AIWDA-01 o di un revisore su Opus per U-01, U-02, U-04, U-05, U-06, U-07 prima che diventino definitivi.

AIWDA-09 · ALNAIR
