AIWDA-03 · HADAR — Senior UX Designer, reparto AIWDA (AI Web Design)

# Rapporto di HADAR: flussi, feedback e stati del pannello Turnio

**Ambito.** Ho letto le quattro pagine HTML, `js/app.js`, il README e i documenti `docs/mappa.md` e `docs/glossario.md`. Non ho aperto le schermate PNG. Non ho eseguito nulla: l'analisi viene solo dal codice, e non ho potuto provare i flussi in un browser.

**Limiti.**
- Non ho caricato AIWDA-01 (CANOPUS), perché il tool `agent` non è disponibile. Il rapporto va consolidato dal direttore.
- Le chiamate `/api/*` sono simulate e non esistono, quindi i comportamenti in caso di errore sono dedotti dal codice.
- Giro su un modello piccolo. I rilievi P1 qui sotto vanno riesaminati da CANOPUS o da un revisore su Opus prima di diventare definitivi.

## Esito in breve

I compiti 1 (pubblicare i turni), 2 (approvare gli scambi) e 5 (eliminare il locale) hanno problemi gravi di flusso e di feedback. L'azione distruttiva è mal protetta e l'approvazione degli scambi non fa nulla. Il compito 4 (esportare le presenze) è sepolto in tre livelli di sezioni. Manca quasi ovunque la gestione degli stati di caricamento, di errore e di vuoto.

## Rilievi

### P1

**HADAR-01 · Elimina settimana: nessuna conferma, nessun annullamento, pulsante primario**
- Evidenza: `turni.html:28`, `js/app.js:22-25`.
- Fatto: il clic invia subito `DELETE /api/week` e svuota la griglia con `innerHTML = ""`. Non c'è conferma e non c'è annullamento. Il pulsante usa `btn-primary`, come "Pubblica i turni". Non controlla l'esito e non mostra nessun messaggio.
- Conseguenza: si può cancellare per errore il lavoro di una domenica sera. Se la chiamata fallisce, la griglia resta svuotata mentre il server conserva i dati.
- Correzione: stile secondario o pericolo, separato dalle azioni principali. Dialogo di conferma che dice cosa si perde ("Elimina i turni del 2–8 novembre? Non si può annullare") oppure, meglio, un annullamento per qualche secondo. Svuotare la griglia solo se il server risponde `ok`, poi mostrare il messaggio.

**HADAR-02 · Elimina locale: conferma generica e senza protezione proporzionata**
- Evidenza: `js/app.js:85-90`, `impostazioni.html:54`.
- Fatto: `confirm("Vuoi davvero procedere?")` non dice cosa verrà eliminato (locale, dipendenti, turni, presenze). Il risultato di `fetch` non è controllato: l'utente va su `/addio` anche se il server risponde con un errore.
- Conseguenza: perdita irreversibile dei dati del locale, e l'utente può credere di aver eliminato qualcosa che esiste ancora, o il contrario.
- Correzione: finestra con il nome del locale ("Scrivi «Trattoria Il Ponte» per confermare") e l'elenco di ciò che si perde. Suggerire prima l'esportazione delle presenze. Verificare `res.ok` prima del reindirizzamento. Pulsante con verbo e oggetto ("Elimina il locale").

**HADAR-03 · Scambi da approvare: i pulsanti «OK» / «No» non fanno nulla**
- Evidenza: `impostazioni.html:46-48`; in `js/app.js` non c'è nessun gestore per questi pulsanti.
- Fatto: nel codice letto non c'è nessun gestore. Il compito 2 è il secondo per frequenza e l'unico passaggio dell'approvazione non ha effetto, e non c'è nessun feedback.
- Conseguenza: lo scambio non si può approvare né rifiutare, il responsabile non sa se la richiesta è stata gestita. Il contatore "3" non cambia. Un "No" senza motivo lascia il dipendente senza spiegazione.
- Correzione: collegare i pulsanti al server. Dopo l'azione togliere la riga o mostrarla come "Approvato" o "Rifiutato" e aggiornare il contatore. Etichette a verbo ("Approva", "Rifiuta") con il nome nell'etichetta accessibile. Stato vuoto "Nessuno scambio da approvare". Rifiuto con motivo facoltativo.

**HADAR-04 · Scambi da approvare nascosti in Impostazioni, in una sezione chiusa**
- Evidenza: `impostazioni.html:41-51`, `index.html:22-24`, `docs/mappa.md`.
- Fatto: un compito che si fa più volte a settimana vive in un `<details>` chiuso di una pagina usata "raramente". Il banner del cruscotto "3 scambi da approvare" non è un link e non porta al compito. La stessa richiesta è raggiungibile anche dall'icona ⇄ in `turni.html:37`, ma solo dal lato della proposta.
- Conseguenza: il responsabile deve sapere dove cercare. Perde il contesto e arriva al compito solo con 3–4 passaggi.
- Correzione: pagina o sezione dedicata "Scambi" nel menu, oppure sul cruscotto con le azioni a portata. Rendere il banner un link a quella sezione, già aperta.

**HADAR-05 · Pubblica i turni: nessuna anteprima, conferma né stato; feedback «Fatto!» generico**
- Evidenza: `js/app.js:17-20`, `turni.html:27`.
- Fatto: il clic invia `POST /api/week/publish` e mostra "Fatto!" per 1,5 secondi, senza controllare l'esito. Pubblicare significa notificare i dipendenti. Non c'è nessun segnale di stato, durante il caricamento il pulsante resta attivo e si può cliccare due volte. In caso di errore di rete il codice va in eccezione senza gestione e "Fatto!" non compare, ma non appare neanche un messaggio.
- Conseguenza: il responsabile non sa se i turni sono visibili ai dipendenti, né a chi sono stati inviati. Una doppia pubblicazione può rinotificare.
- Correzione: stato visibile accanto alla settimana ("Bozza" o "Pubblicata il 1 nov alle 21:40"). Pulsante disabilitato durante l'invio ("Pubblicazione…"). Messaggio che dice cosa è successo ("Turni pubblicati: 3 dipendenti avvisati"). Messaggio di errore con riprova se fallisce.

**HADAR-06 · Dati inseriti persi o ricaricati senza avviso (modulo dipendente, Salva)**
- Evidenza: `js/app.js:62-67`, `js/app.js:27-35`.
- Fatto 1: in caso di errore del server il modulo viene azzerato con `form.reset()` e compare "Errore 400: payload non valido". Quattordici campi vanno persi.
- Fatto 2: dopo un salvataggio riuscito il modulo non si svuota e non c'è conferma: l'utente può inviare di nuovo lo stesso dipendente.
- Fatto 3: "Salva" nella settimana ricarica la pagina con `location.reload()`. Se la modifica non è stata salvata, il ricaricamento scarta il lavoro. L'errore è inghiottito da `console.log`. La richiesta `PUT` non invia nessun dato.
- Conseguenza: perdita di dati e nessuna informazione sull'esito.
- Correzione: mai azzerare il modulo in caso di errore, e mostrare un messaggio che dica cosa fare ("Non siamo riusciti a salvare Giulia R. Controlla la connessione e riprova"). Dopo un successo svuotare il modulo e mettere il focus sul primo campo o sulla riga aggiunta. Per "Salva" non ricaricare: aggiornare la griglia e mostrare "Salvato alle 21:40". Mostrare l'errore, non solo `console.log`.

### P2

**HADAR-07 · Modulo "Aggiungi un dipendente": quattordici campi obbligatori per un invito che richiede nome e telefono**
- Evidenza: `dipendenti.html:34-51`; README, compito 3: "con nome e numero di telefono".
- Fatto: il modulo chiede codice fiscale, IBAN, indirizzo, data di nascita, CCNL e altro, tutti con `*`. Il compito 3 è un invito all'app. Il modulo ha anche `novalidate` e usa segnaposto al posto delle etichette.
- Conseguenza: attrito alto per l'operazione che si fa più volte al mese. I dati sensibili (IBAN, CF) si chiedono prima del bisogno (valutazione di privacy da lasciare ad AIPCA).
- Correzione: modulo minimo (nome, telefono, ruolo) con invito; il resto in una scheda del dipendente da completare in seguito.

**HADAR-08 · Validazione del telefono: messaggio colpevolizzante e non guida; altri campi non validati**
- Evidenza: `js/app.js:56-60`, `dipendenti.html:37`.
- Fatto: "Hai sbagliato il numero." non dice il formato atteso. L'espressione `^\d{10}$` rifiuta "333 120 4455" e "+39…", cioè lo stesso formato mostrato nella tabella (`dipendenti.html:26`). Il messaggio sta in un unico punto in fondo al modulo, non accanto al campo, e il focus non si sposta sul campo. Nessun altro campo è controllato (`novalidate` e gli `required` non agiscono). Questo contraddice la regola del glossario ("dicono cosa è successo e cosa fare, senza dare la colpa all'utente").
- Correzione: "Il telefono deve avere 10 cifre, per esempio 333 120 4455." Accettare gli spazi (togliendoli prima del controllo). Messaggio accanto al campo, con `aria-describedby`, e focus sul primo campo errato. Riassunto degli errori in cima se sono più d'uno.

**HADAR-09 · Esportare le presenze: tre livelli di sezioni e collegamento «Clicca qui» che non scarica**
- Evidenza: `impostazioni.html:22-39`, `docs/mappa.md` (Impostazioni › Locale › Esporta › Presenze per il consulente); `js/app.js` non ha un gestore per `#export`.
- Fatto: il compito mensile 4 richiede di aprire 3 `<details>` annidati. Il pulsante è un `<a href="#">` con testo "Clicca qui". Non c'è nessun gestore: il clic non scarica niente, aggiunge solo `#` all'indirizzo. Non c'è stato di caricamento, errore o mese senza dati. Il mese è preselezionato su "ottobre 2026" ma non si vede il formato del file.
- Correzione: voce "Presenze" o "Esporta" al primo livello del menu o nel cruscotto. Pulsante `<button>` con verbo ("Scarica le presenze di ottobre 2026 (CSV)"), stato "Preparazione del file…", messaggio d'errore con riprova e messaggio se il mese è vuoto. Se il file è lungo, dire come lo si riceve.

**HADAR-10 · Impostazioni: «Le modifiche si salvano da sole» senza nessuna conferma di salvataggio**
- Evidenza: `impostazioni.html:20`, `js/app.js:92-94`.
- Fatto: ogni `change` invia `PATCH /api/store` senza corpo né controllo dell'esito, senza stato né segnale. Se la richiesta fallisce l'utente non lo sa. Il selettore usa `#main input` e il gestore riceve anche gli altri campi, mentre il campo `#export-month` è un `select` e non è coperto. Con più campi modificati in sequenza si inviano richieste ravvicinate.
- Conseguenza: l'utente crede di aver salvato qualcosa che non è stato salvato (nome del locale, orari).
- Correzione: stato accanto al campo ("Salvataggio…", "Salvato", "Non salvato, riprova") e invio del valore del campo. In alternativa un pulsante "Salva" esplicito.

**HADAR-11 · Finestra dello scambio: scopo poco chiaro, nessuna prevenzione degli errori, nessuna chiusura da tastiera**
- Evidenza: `turni.html:37,48-56`, `js/app.js:37-47`.
- Fatto: il pulsante ⇄ è solo un'icona, senza etichetta testuale. La finestra mostra "Swap del turno" (termine vietato dal glossario), un elenco di colleghi senza dire chi è libero in quella fascia (anche chi lavora già) e un pulsante "OK" (anch'esso vietato). Chiudere richiede un `<span>` ✕ senza ruolo di pulsante. L'invio non controlla l'esito, il collega scelto non è inviato nella richiesta e non si chiude con Esc. Dopo l'invio compare "Fatto!" e non si capisce che lo scambio è in attesa di approvazione.
- Correzione: "Proponi uno scambio del turno", con colleghi disponibili e un avviso per chi ha già un turno, pulsante "Proponi lo scambio", testo "Richiesta inviata a Marta F.: resta in attesa di approvazione". Chiusura con Esc e con un vero `<button>`. Segnare sul turno che è in scambio (stato "in attesa").

**HADAR-12 · Navigazione della settimana senza effetto, e la settimana visualizzata non è chiara**
- Evidenza: `turni.html:21-23`; in `js/app.js` non c'è nessun gestore per `#prev-week` / `#next-week`.
- Fatto: le frecce ◀ ▶ non fanno nulla e non hanno un nome accessibile. Il compito 1 è "preparare la settimana dopo". La data "02/11 – 08/11" non ha l'anno e non dice se la settimana è la corrente o una bozza.
- Correzione: collegare le frecce, aggiungere "Questa settimana" e "Settimana successiva", etichette ("Settimana precedente"), formato del glossario ("lun 2 nov – dom 8 nov").

**HADAR-13 · Ricerca nell'elenco dei dipendenti: stato vuoto mancante, nessuna etichetta**
- Evidenza: `js/app.js:74-79` (commento "Nessun risultato: la tabella resta vuota"), `dipendenti.html:20`.
- Fatto: se non c'è nessun risultato resta la tabella con la sola intestazione, senza testo. Lo stesso accade se l'elenco è vuoto. Non c'è un contatore dei risultati né un'annuncio per i lettori di schermo. Il campo è privo di etichetta visibile e il segnaposto "Cerca un collaboratore" usa un termine vietato dal glossario.
- Correzione: riga "Nessun dipendente trovato per «xyz». Cancella la ricerca" con un pulsante per svuotare. Stato vuoto della lista ("Non ci sono ancora dipendenti. Aggiungi il primo"). Contatore "2 di 3". Etichetta visibile.

**HADAR-14 · Azioni sulle righe di Dipendenti: ✎ e 🗑 senza gestore, senza etichetta, senza conferma**
- Evidenza: `dipendenti.html:26-28`; nessun gestore in `js/app.js`.
- Fatto: modificare e cancellare un dipendente non è implementato. I pulsanti sono solo icone, senza testo per i lettori di schermo né per chi non conosce le icone. Il cestino sta accanto alla matita, senza distanza e senza conferma né annullamento.
- Correzione: etichette accessibili con il nome ("Modifica Giulia R.", "Elimina Giulia R."), conferma che dice le conseguenze (turni futuri assegnati), preferibilmente con annullamento. Distanza o menu per l'azione distruttiva.

**HADAR-15 · Uscita automatica dopo 10 minuti: il timer non si azzera e si perde il lavoro**
- Evidenza: `js/app.js:11-12`.
- Fatto: il commento dice "dopo 10 minuti senza richieste", ma il `setTimeout` parte al caricamento e non si riavvia a ogni richiesta o interazione. Chi prepara i turni per più di 10 minuti viene portato su `/login` senza preavviso, con la bozza non salvata e senza che il testo dica perché.
- Conseguenza: perdita del lavoro proprio nel compito 1, che richiede tempo.
- Correzione: azzerare il timer a ogni richiesta o interazione. Preavviso un minuto prima ("Sessione in scadenza. Resta collegato"). Salvare o avvisare delle modifiche non salvate. Dopo l'accesso tornare alla pagina di partenza e dire "Sei uscito per inattività".

### P3

**HADAR-16 · Messaggio «Fatto!» generico e a scomparsa dopo 1,5 secondi**
- Evidenza: `js/app.js:3-9,19,46,68`, `index.html` (nessun elemento `#toast`).
- Fatto: lo stesso testo per tre azioni diverse (pubblicazione, scambio, nuovo dipendente). Dura 1,5 s, non ha `role="status"` e non si può leggere con calma né con un lettore di schermo. Il cruscotto non ha l'elemento `#toast`, quindi `toast` non fa nulla lì.
- Correzione: un testo per azione ("Turni pubblicati", "Richiesta di scambio inviata", "Giulia R. aggiunta"), durata di 5–6 secondi o fino alla chiusura, regione `role="status"`.

**HADAR-17 · Interfaccia mista inglese e italiano; termini fuori dal glossario**
- Evidenza: `*.html:2` (`lang="en"`), titolo `<title>Turnio</title>` uguale in tutte le pagine; menu "Settings", "Dashboard", "Squadra"; titolo "Personale" contro voce "Squadra"; "Aggiungi una risorsa", "Cerca un collaboratore", "Swap del turno", "fascia", "negozio", "Procedi", "OK", "Clicca qui".
- Conseguenza: etichette incoerenti tra menu e titolo, e l'utente non riconosce la stessa pagina. Il glossario vieta "risorsa", "collaboratore", "swap", "fascia", "negozio" e "OK".
- Correzione: `lang="it"`, titoli di pagina distinti ("Turni · Turnio"), voci "Impostazioni", "Cruscotto" (oppure "Dashboard" ovunque), "Dipendenti". Allineare i testi al glossario.

**HADAR-18 · Ordine del menu e stato della pagina corrente**
- Evidenza: `*.html:11-16`, `docs/mappa.md`.
- Fatto: l'ordine del menu è Settings, Dashboard, Squadra, Turni, cioè quello alfabetico delle pagine e non quello dei compiti. Il compito più frequente (Turni) sta in fondo. Il README dice che la prima pagina è il cruscotto, ma le impostazioni sono la prima voce.
- Correzione: ordine per frequenza: Turni, Dipendenti, Cruscotto, Impostazioni (o Cruscotto per primo, coerente con la pagina iniziale).

**HADAR-19 · Cruscotto: nessun stato di caricamento, errore o vuoto per i numeri**
- Evidenza: `index.html:22-90`.
- Fatto: ogni numero e grafico è scritto nell'HTML. Nelle versioni con i dati reali mancano i tre stati (caricamento, errore, nessun dato). La data "Dati aggiornati a mercoledì 11 novembre" è in fondo alla pagina e non in cima. Il cruscotto non ha uno scopo di azione: solo il banner richiama un compito.
- Correzione: prevedere gli stati e spostare la data di aggiornamento vicino al titolo. I rilievi sui grafici (asse troncato da 60 a 70 che esagera le differenze, due assi diversi nel grafico costi/incassi, torta con otto fette in sfumature dello stesso blu, nessun testo alternativo) sono per AIWDA-07 (dati e grafici) e AIWDA-08 (accessibilità): li segnalo senza analizzarli.

## Flusso ideale, compito 1 (pubblicare i turni)

1. Il responsabile apre Turni e vede la settimana successiva, con lo stato "Bozza" e le ore per dipendente.
2. Modifica le celle. Il salvataggio automatico mostra "Salvato alle 21:40".
3. Preme "Pubblica i turni". Una finestra dice "Pubblicare i turni di lun 9 – dom 15 nov? Verranno avvisati 12 dipendenti" con l'elenco dei problemi da controllare (riposi, ore).
4. Dopo la conferma, lo stato passa a "Pubblicata il 1 nov alle 21:40" e compare "Turni pubblicati".
5. "Elimina settimana" sta in un menu secondario, con conferma o annullamento.

## Domande aperte per l'utente

- Il modulo del dipendente deve raccogliere subito i dati di contratto e il pagamento, oppure basta l'invito (nome, telefono, ruolo)?
- Gli scambi vanno approvati solo dal responsabile? È previsto un motivo per il rifiuto?
- C'è un salvataggio automatico o un salvataggio manuale della settimana?

## Verifiche di coerenza

Per l'accessibilità (WCAG 2.2, EN 301 549, D.lgs. 82/2022) non ho letto le schede della biblioteca, perché il compito era sui flussi. I punti segnalati di passaggio (nomi accessibili delle icone, chiusura con Esc, `role="status"`, focus sull'errore) vanno approfonditi da AIWDA-08.

Firmato: AIWDA-03 · HADAR
