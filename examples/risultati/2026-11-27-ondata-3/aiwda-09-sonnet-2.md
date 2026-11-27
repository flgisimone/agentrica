AIWDA-09 · ALNAIR — Senior Usability Auditor, reparto AIWDA (AI Web Design)

Rapporto di audit di usabilità del pannello Turnio (index, turni, dipendenti, impostazioni e js/app.js). Il lavoro è in sola lettura, su file statici. Non ho caricato AIWDA-01 né le schede della biblioteca, perché non servono per rilievi euristici di questo tipo. Non ho aperto le schermate PNG: i rilievi derivano dal codice, non dall'esecuzione. Le chiamate /api sono simulate e non esiste un server, quindi i comportamenti sono dedotti dal codice e non riprodotti. Il reparto non conosce lo stato del server: per questo `requires_human_review` è true dove la gravità dipende da cosa risponde l'API.

Esito: 4 rilievi P1 (azioni distruttive e perdita di lavoro), 8 P2, 3 P3. Nessun P0 certo. Il rilievo 1 sarebbe P0 se la cancellazione fosse davvero irreversibile.

Nota: come ruolo ho lavorato su un modello più piccolo di quello della sessione. Per i P1 propongo il riesame del direttore AIWDA-01 o di un revisore su Opus prima che diventino definitivi.

## P1

**1. Elimina settimana senza conferma né annullamento** (Prevenzione degli errori; Controllo e libertà)
- Evidenza: js/app.js:22-25 e turni.html:28.
- Fatto: il click su «Elimina settimana» invia subito DELETE /api/week e svuota la griglia (`innerHTML = ""`) senza confirm, senza «Annulla» e senza esito. Il pulsante è `btn-primary`, identico a «Pubblica i turni» (turni.html:27) e adiacente a «Salva».
- Passi: apri turni.html, clicca «Elimina settimana».
- Impatto: un click sbagliato cancella la pianificazione di tutta la settimana. In più, `fetch` non lancia errore su 4xx/5xx: se la richiesta fallisce, la griglia viene svuotata lo stesso e la schermata non corrisponde ai dati.
- Correzione: dialogo di conferma che nomina la settimana («Eliminare i turni del 02/11 – 08/11? Non si può annullare»), pulsante con stile pericolo (`btn-danger`) e separato dagli altri, e svuotamento della griglia solo dopo `res.ok`. In alternativa elimina con annullamento temporaneo.
- Confidenza 0.9. `requires_human_review`: true.

**2. «Elimina locale»: conferma generica, uscita anche in caso di errore** (Prevenzione degli errori; Riconoscimento, diagnosi e recupero)
- Evidenza: js/app.js:85-90 e impostazioni.html:54.
- Fatto: `confirm("Vuoi davvero procedere?")` non dice cosa verrà cancellato né che è irreversibile (turni, dipendenti, storico). Non c'è digitazione del nome del locale per confermare. La conferma è un `confirm()` nativo con testo ambiguo, in cui «OK» e «Annulla» non dicono nulla di specifico. Dopo la fetch il codice reindirizza a /addio senza controllare `res.ok`.
- Impatto: se il server risponde con un errore, l'utente vede «addio» ma il locale esiste ancora, oppure il contrario. Un errore umano qui è molto costoso.
- Correzione: modale con testo specifico («Elimina Trattoria Il Ponte e tutti i suoi dati? Non si può annullare»), conferma con digitazione del nome del locale, verifica di `res.ok` e messaggio d'errore con possibilità di riprovare. Il pulsante è già `btn-danger`: va bene.
- Confidenza 0.85. `requires_human_review`: true.

**3. Errore di salvataggio del dipendente: il modulo viene azzerato, messaggio tecnico** (Riconoscimento, diagnosi e recupero; Prevenzione degli errori)
- Evidenza: js/app.js:61-67.
- Fatto: se la risposta non è ok, il codice scrive «Errore 4xx: payload non valido» e chiama `form.reset()`. Il modulo ha 14 campi, di cui 13 obbligatori.
- Impatto: l'utente perde tutti i dati inseriti per un errore che non ha causato e che non capisce («payload» è gergo tecnico). Impossibile correggere solo il campo sbagliato.
- Correzione: non fare mai `reset()` su un errore; mantenere i valori, indicare quale campo è sbagliato e perché, in linguaggio comune («Il server non ha accettato i dati. Controlla i campi e riprova»). Il reset vale solo dopo il successo.
- Confidenza 0.9. `requires_human_review`: false.

**4. Il pulsante «Procedi» non fa capire se il dipendente è stato salvato, e dopo il successo il modulo resta compilato** (Visibilità dello stato; Prevenzione degli errori)
- Evidenza: js/app.js:68 e dipendenti.html:50.
- Fatto: dopo un esito positivo compare solo il toast «Fatto!» per 1,5 secondi (js/app.js:8). Il modulo non viene svuotato, la tabella non aggiunge la nuova riga e il pulsante non si disabilita durante l'invio. Il toast non ha `role="status"` né `aria-live` (dipendenti.html:53).
- Impatto: l'utente non sa se l'operazione è riuscita; dopo il toast un secondo click su «Procedi» crea un duplicato. Un toast di 1,5 s è troppo breve per leggerlo e non è annunciato dai lettori di schermo.
- Correzione: disabilitare il pulsante durante la richiesta, mostrare il nuovo dipendente nella tabella, svuotare il modulo, usare un testo specifico («Giulia Rossi aggiunta») e un toast di almeno 5 s con `role="status"`.
- Confidenza 0.8. `requires_human_review`: false.

## P2

**5. Validazione del telefono respinge numeri corretti** (Prevenzione degli errori; Flessibilità)
- Evidenza: js/app.js:56-60. La tabella stessa (dipendenti.html:26-28) mostra i numeri come «333 120 4455», cioè con spazi, e il campo è un `<input>` senza `type="tel"`.
- Fatto: la regola `^\d{10}$` rifiuta spazi, trattini, il prefisso +39 e numeri fissi di lunghezza diversa (9-11 cifre). Il formato mostrato nell'app non passa la sua stessa validazione.
- Impatto: dati corretti vengono respinti con «Hai sbagliato il numero» (accusa, senza dire quale formato serve).
- Correzione: togliere spazi, trattini e il prefisso +39 prima del controllo, accettare 9-10 cifre, usare `type="tel"` e un messaggio utile («Inserisci un numero italiano, per esempio 333 120 4455»). Il messaggio va associato al campo.
- Confidenza 0.9. `requires_human_review`: false.

**6. Il messaggio d'errore sta in fondo al modulo e non è collegato al campo; i campi non hanno etichette** (Riconoscimento, diagnosi e recupero; Riconoscimento anziché memorizzazione)
- Evidenza: dipendenti.html:35-50 e js/app.js:55-59.
- Fatto: con 14 campi lunghi, l'unico errore appare in `#form-error` sopra «Procedi», lontano dal campo sbagliato; non c'è focus sul campo, né `aria-invalid`, né `aria-describedby`. I campi usano solo `placeholder` come etichetta (spariscono al primo carattere), mentre impostazioni.html usa `<label for>` regolari: comportamento incoerente tra pagine. `novalidate` disattiva anche i controlli nativi dei campi `required`, e il codice controlla solo il telefono: gli altri 12 campi obbligatori non sono mai validati dal client (anche email, IBAN, codice fiscale, date).
- Impatto: si può inviare il modulo vuoto e ricevere l'errore tecnico del rilievo 3; chi ha scritto una data nel formato sbagliato non lo scopre.
- Correzione: `<label>` visibili, validazione di tutti i campi obbligatori con messaggio vicino al campo e focus sul primo errore, `type="email"`, `inputmode`, formati date chiari (le due date hanno formati diversi: gg/mm/aaaa e aaaa-mm-gg, vedi rilievo 7).
- Confidenza 0.85. `requires_human_review`: false.

**7. Formati di data incoerenti nello stesso modulo** (Coerenza e standard)
- Evidenza: dipendenti.html:40 («gg/mm/aaaa») e dipendenti.html:46 («aaaa-mm-gg»); impostazioni.html:46 usa «2026-11-07», turni.html:22 usa «02/11».
- Impatto: l'utente deve ricordare due formati nello stesso form; con testo libero si sbaglia facilmente. Un formato ISO non è naturale per un utente italiano.
- Correzione: `<input type="date">` per entrambi (mostra il formato del sistema) oppure un solo formato italiano ovunque.
- Confidenza 0.9. `requires_human_review`: false.

**8. Troppi campi obbligatori e dati sensibili chiesti subito** (Design essenziale; Flessibilità ed efficienza)
- Evidenza: dipendenti.html:35-47 (13 campi obbligatori: codice fiscale, IBAN, indirizzo, livello CCNL, ecc.).
- Fatto: per aggiungere una persona al turno servono 13 campi in colonna unica, anche se la tabella ne mostra 4.
- Impatto: aggiungere un collaboratore in fretta (per esempio un extra di sabato) è impossibile; gli errori si accumulano. Dati sensibili vengono richiesti dove forse non servono per pianificare i turni.
- Correzione: dividere in «Dati minimi» (nome, cognome, ruolo, telefono) e una sezione facoltativa di dati amministrativi da completare dopo. Questa scelta riguarda requisiti e privacy: la propongo ai ruoli business e privacy, non la decido io.
- Confidenza 0.7. `requires_human_review`: true.

**9. Cestino e modifica senza nome accessibile né conferma** (Prevenzione degli errori; Coerenza)
- Evidenza: dipendenti.html:26-28; nel JS non c'è nessun gestore per questi pulsanti (js/app.js:50-80).
- Fatto: ✎ e 🗑 sono emoji senza testo alternativo e senza handler. Non c'è conferma né annullamento previsti, e il cestino sta accanto alla modifica con la stessa dimensione `icon-btn`.
- Impatto: oggi non fanno nulla; appena collegati, il cestino sarà un'azione distruttiva a un click di distanza dalla matita. Per tastiera e lettori di schermo sono «✎» e «🗑» senza significato.
- Correzione: `aria-label` («Modifica Giulia R.», «Elimina Giulia R.»), conferma con nome del dipendente o annullamento temporaneo, e distanza o stile diverso per l'azione pericolosa.
- Confidenza 0.8. `requires_human_review`: false.

**10. Il salvataggio ricarica la pagina e inghiotte gli errori** (Visibilità dello stato; Recupero dagli errori)
- Evidenza: js/app.js:27-35 e turni.html:29.
- Fatto: «Salva» invia PUT /api/week senza corpo né indicazione di cosa si salva, poi fa `window.location.reload()` anche se il server risponde con errore (la fetch non lancia per 4xx/5xx). L'unico trattamento dell'errore è `console.log(err)`, invisibile all'utente. Nessun feedback di successo prima del ricaricamento, e il ricaricamento scarta ogni modifica non salvata, compreso lo stato della griglia.
- Impatto: l'utente può credere di aver salvato quando non è così, oppure perdere lavoro con il ricaricamento. Con rete assente non succede niente di visibile.
- Correzione: verificare `res.ok`, mostrare successo o errore in modo visibile («Non siamo riusciti a salvare. Riprova»), niente ricarica forzata.
- Confidenza 0.85. `requires_human_review`: false.

**11. Impostazioni: «si salvano da sole» ma senza feedback, e le richieste non portano i valori** (Visibilità dello stato; Coerenza)
- Evidenza: js/app.js:92-94 e impostazioni.html:20, 24-25.
- Fatto: ogni `change` di un input invia PATCH /api/store senza corpo e senza controllare l'esito: nessun messaggio, nessun errore, nessun indicatore di salvataggio. Il selettore `#main input` include tutti gli input della pagina, anche futuri e non pertinenti. Se il PATCH fallisce, l'utente crede di aver salvato il nuovo orario o nome del locale.
- Impatto: un nome o un orario sbagliato o non salvato resta in circolazione senza che nessuno se ne accorga; non c'è modo di annullare. Se davvero la richiesta non porta i dati (come nel codice letto), nulla viene salvato (da verificare con il server).
- Correzione: mostrare «Salvato» o l'errore accanto al campo, inviare il valore, validare il formato degli orari (campo libero «11:00–15:00, 18:00–23:30») ed eventualmente un pulsante «Salva» esplicito.
- Confidenza 0.75. `requires_human_review`: true.

**12. Approvazione degli scambi: OK e No senza esito, né nome del collega nell'azione** (Visibilità dello stato; Prevenzione degli errori)
- Evidenza: impostazioni.html:46-48 e nessun gestore in js/app.js. Anche il pulsante di conferma dello scambio (turni.html:54, js/app.js:43-47) non invia né mostra il collega scelto.
- Fatto: i pulsanti «OK» e «No» (`btn-secondary`, identici) non hanno gestore né nome accessibile con il turno; il badge «3» e il banner della dashboard (index.html:23) non sono collegati alla pagina («3 scambi da approvare» non è un link). Nel modale `swap-ok` fa POST /api/swap senza corpo (collega selezionato non inviato) e toast «Fatto!» anche se la richiesta fallisce.
- Impatto: approvare o rifiutare uno scambio è un'azione con effetti su più persone, senza conferma né esito. Il banner della dashboard non porta alla pagina giusta. L'utente può credere di aver scambiato un turno con Marta mentre il server non ha ricevuto nulla.
- Correzione: link dal banner a #scambi, pulsanti con testo specifico («Approva scambio Giulia R. → Marta F.»), feedback con esito e riga rimossa o stato, e `res.ok` prima del toast. «No» dovrebbe avere stile e testo diversi da «OK» («Rifiuta»).
- Confidenza 0.75. `requires_human_review`: true.

## P3

**13. Tre messaggi di conferma generici e identici «Fatto!»** (Visibilità dello stato)
- Evidenza: js/app.js:19, 46, 68.
- Fatto: «Pubblica», «Scambio» e «Aggiungi dipendente» mostrano tutti «Fatto!» per 1,5 s, sempre, anche se la richiesta non ha avuto successo (nessun controllo di `res.ok` in js/app.js:18 e 44).
- Impatto: non si capisce cosa è successo; «Pubblica i turni» in particolare notifica forse persone reali e dovrebbe dire chi e quando. Il toast successo falso è il caso più grave perché porta l'utente a fidarsi di un'operazione non avvenuta.
- Correzione: messaggi specifici per azione, durata più lunga e verifica dell'esito. «Pubblica i turni» richiede conferma esplicita con l'effetto («I turni 02/11 – 08/11 saranno visibili a 12 persone»).
- Confidenza 0.85. `requires_human_review`: false.

**14. Uscita automatica dopo 10 minuti senza avviso, e il timer non si azzera** (Controllo e libertà; Prevenzione degli errori)
- Evidenza: js/app.js:11-12.
- Fatto: il commento dice «senza richieste al server», ma il timer parte al caricamento e non viene mai azzerato dalle richieste né dall'attività. Dopo 10 minuti il reindirizzamento a /login è immediato, senza avviso né salvataggio. Il modulo dipendenti (14 campi) può restare incompleto per più di 10 minuti.
- Impatto: chi sta compilando il modulo, o modificando la griglia, perde il lavoro senza preavviso. Questo rischia anche di violare WCAG 2.2.1 (regolazione tempi): prima di scadere serve un avviso con possibilità di prolungare, da verificare sulla scheda wcag-2-2 della biblioteca.
- Correzione: azzerare il timer a ogni interazione e a ogni richiesta, mostrare un avviso un minuto prima («Sessione in scadenza: Resta collegato»), preservare i dati del modulo.
- Confidenza 0.8. `requires_human_review`: true.

**15. Il modale di scambio non è un vero dialogo** (Controllo e libertà; Coerenza)
- Evidenza: turni.html:48-56, js/app.js:37-47 e css/app.css:14, 72.
- Fatto: «✕» è uno `<span>` non attivabile da tastiera, senza ruolo; il modale non ha `role="dialog"`, non sposta il focus, non si chiude con Esc né con un click fuori, e non ripristina il focus. Il pulsante «OK» usa la classe `button` (css/app.css:33), diversa da `btn` usata altrove (rotondo, blu diverso). Inoltre il selettore del collega non viene inviato (rilievo 12). Più in generale `*:focus { outline: none }` (css/app.css:14) elimina l'indicatore di focus ovunque, e la legenda dello stato in turni.html:45 («● presente ● in ritardo ● assente») non indica i colori: i pallini sono distinguibili solo dal colore.
- Impatto: utenti da tastiera restano intrappolati o non riescono a chiudere il dialogo; nessun modo di vedere dove sta il focus in tutto il pannello.
- Correzione: `<dialog>` nativo o `role="dialog"` con `aria-modal`, focus iniziale, chiusura con Esc, `<button>` per «✕» con `aria-label`, stile `btn` coerente, ripristinare `:focus-visible`. Questi punti vanno confermati dallo specialista di accessibilità AIWDA.
- Confidenza 0.8. `requires_human_review`: false.

## Altri comportamenti incoerenti (minori, da accorpare)
- Ricerca (js/app.js:74-79, dipendenti.html:20): nessun messaggio «Nessun risultato» (il commento a riga 78 lo ammette), nessuna etichetta oltre al placeholder, nessun pulsante per cancellare la ricerca.
- Navigazione: la voce «Settings» è in inglese e prima di «Dashboard» (impostazioni.html:12); «Squadra» nel menu, «Personale» come titolo (dipendenti.html:14, 19), «Dipendenti», «collaboratore», «risorsa» nello stesso flusso (dipendenti.html:20, 32): quattro nomi per lo stesso oggetto. Anche `lang="en"` su pagine in italiano (tutte le pagine, riga 2), da correggere perché i lettori di schermo leggono male.
- Esporta (impostazioni.html:27-38): tre livelli di `<details>` annidati nascondono un'azione frequente; il link «Clicca qui» (impostazioni.html:32) non dice cosa scarica e va a «#»; «Scarica il report» ha lo stesso `href="#"` (riga 36) e il mese del report di costo non si sceglie.
- Pulsante «Procedi» (dipendenti.html:50) per salvare: etichetta che non dice cosa succede («Salva dipendente»).
- Dashboard (index.html:34-47): l'asse delle ore parte da 60 e non da 0, quindi sab 70 sembra molto più grande di lun 62. Il grafico a doppio asse (index.html:73-80) fa sembrare incrociate due serie con scale diverse; la torta ha otto fette in sfumature quasi uguali. Questo è dominio del Dashboard e Data Visualization Designer, non del mio ruolo: lo segnalo al direttore senza dettagliare.

## Scenari testati, limiti
- Scenari: lettura del codice di tutte le pagine HTML, js/app.js e css/app.css (solo le regole citate). Nessun percorso eseguito: niente server, nessun click reale, nessuna schermata esaminata. I passi indicati sono riproducibili dal codice, ma gli esiti dipendono dal server `/api` che non esiste in questa copia.
- Non ho verificato il comportamento a 375 px (schermate *-telefono.png) né contrasti e dimensioni dei bersagli.
- Non ho letto le schede della biblioteca: le citazioni WCAG qui sopra sono indicative e vanno verificate nella scheda wcag-2-2 (versione 2.2, verificata il 2026-11-19) prima di diventare definitive.

## Domande aperte per l'utente
1. Il server restituisce errori HTTP (4xx/5xx) sulle chiamate /api? Se sì, i rilievi 1, 2, 10, 11, 12 e 13 sono bug reali oggi; altrimenti restano rischi.
2. «Pubblica i turni» invia notifiche a persone reali? In quel caso va protetto con una conferma esplicita (rilievo 13).
3. Quali dei 13 campi obbligatori sono davvero necessari per creare un dipendente (rilievo 8)?

File esaminati (cartella di lavoro): /private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/68c857fd-4b52-436c-bf0e-5c657ef1d77d/scratchpad/copie/aiwda-09-4/js/app.js, turni.html, dipendenti.html, impostazioni.html, index.html, css/app.css.

— AIWDA-09 · ALNAIR
