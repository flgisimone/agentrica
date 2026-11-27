AIWDA-03 · HADAR — Senior UX Designer, reparto AIWDA (AI Web Design)

**Esito**: analisi in sola lettura di `turni.html`, `dipendenti.html`, `impostazioni.html`, `index.html`, `js/app.js` rispetto ai compiti del README. Ho guardato le schermate `turni-telefono.png` e `impostazioni-computer.png`, più `css/app.css` per le righe citate. Non ho letto le schede della biblioteca. Le citazioni di WCAG (2.2, scheda `wcag-2-2`, verifica 2026-11-19) sono da ricontrollare sulla scheda. Nessun test eseguito nel browser: le conclusioni sul comportamento derivano dalla lettura del codice (fatti), salvo dove indicato come inferenza. Le chiamate `/api/...` sono simulate: lo stato di errore reale è ipotizzato.

Non ho trovato P0. Ci sono più P1 (HADAR lavora su un modello più piccolo della sessione): propongo il riesame di AIWDA-01 CANOPUS o di un revisore su Opus prima che diventino definitivi.

## Rilievi

**1. [P1] Compito 2: gli scambi da approvare non possono essere approvati**
- Evidenza: `impostazioni.html:46-48`. I pulsanti "OK" e "No" non hanno id, né handler in `js/app.js` (nessun listener sulla tabella, righe 82-95). I pulsanti non fanno nulla. Il listener `change` alle righe 92-93 vale solo per gli `input`.
- Problema: il compito più frequente dopo la pubblicazione, "più volte a settimana", ha i pulsanti ma non l'azione. Il badge "3" non cala. Non c'è conferma né annullamento. Questo è un difetto funzionale osservabile.
- Correzione: handler per riga che chiama l'API, rimuove la riga e aggiorna il badge, con toast concreto ("Scambio approvato: Giulia R. ↔ Marta F.") e possibilità di annullare. Etichette accessibili: "Approva scambio di Giulia R." / "Rifiuta".

**2. [P1] Compito 2: la richiesta di approvare è sepolta (IA e flusso)**
- Evidenza: il banner del cruscotto `index.html:22-24` ("🔔 3 scambi da approvare") non è un link né un pulsante. Le approvazioni sono in `impostazioni.html:41-51`, dentro `<details>` chiuso (schermata `impostazioni-computer.png`). `docs/mappa.md` le colloca nelle Impostazioni. L'etichetta del menu è "Settings".
- Problema: l'utente vede la notifica ma non può agirci. Deve intuire che serve la voce "Settings", aprire "Scambi da approvare" e agire sulla tabella. Il compito frequente sta in una sezione "raramente".
- Correzione mirata: banner cliccabile verso la lista. Meglio spostare "Scambi da approvare" in una pagina o sezione visibile (in Turni o nel cruscotto), non dentro `<details>`.
- Nota: la sintesi ricerca (`ricerca/sintesi.md`, raccomandazione sullo scambio nelle impostazioni "perché si configura una volta sola") confonde configurare lo scambio con approvare. Il piano ne tiene poco conto.

**3. [P1] Pubblica / Salva / Elimina: azioni senza stati e senza guardie**
- Evidenza: `js/app.js:17-20`, `22-25`, `27-35`; `turni.html:26-30`.
- Problemi:
  - "Elimina settimana" ha lo stesso stile primario di "Pubblica i turni" (`class="btn btn-primary"`, riga 28), è adiacente e non ha conferma. Il codice svuota subito la griglia (`js/app.js:24`) senza controllare `res.ok`, senza annullamento né messaggio. La griglia resta vuota senza testo di stato vuoto. Rischio di perdita del lavoro della domenica sera.
  - "Pubblica" non ha stato di caricamento, non disabilita il pulsante (doppio click), non verifica `res.ok` e mostra sempre "Fatto!" anche se la richiesta fallisce. Non dice cosa è successo né a chi: "Turni pubblicati ai 12 dipendenti". Dopo la pubblicazione non c'è indicazione di stato (pubblicata o bozza).
  - "Salva" fa `window.location.reload()` (riga 31): con modifiche non salvate in altre parti o un errore perde il contesto. Nell'errore `console.log` (riga 33) lascia l'utente senza messaggio. `fetch` non lancia su 4xx/5xx, quindi un errore del server viene trattato come successo e ricarica comunque.
  - "Salva" è il pulsante secondario, ma "Pubblica" dovrebbe essere l'unico primario. Non ci sono segni di modifiche non salvate né avviso all'uscita.
- Correzione: un solo primario ("Pubblica i turni"); "Elimina settimana" come azione distruttiva secondaria, staccata, con conferma che nomina la settimana ("Elimina i turni del 02/11–08/11? Non si può annullare") o meglio un annullamento temporaneo. Controllare `res.ok` ovunque; disabilitare con testo "Pubblico…" durante la richiesta; messaggi di errore visibili e con riprova; evitare il reload.

**3b. [P2] Navigazione per settimana non funzionante**
- Evidenza: `turni.html:21-23`, `#prev-week` e `#next-week` senza handler in `js/app.js`. Senza `aria-label`, solo ◀ ▶.
- Correzione: handler, etichette ("Settimana precedente"), ed etichetta di settimana con anno ("2–8 novembre 2026").

**4. [P1] Scambio turno: finestra senza risultato e senza feedback di errore**
- Evidenza: `js/app.js:37-47`, `turni.html:48-56`.
- Problemi:
  - `swap-ok` ignora il valore di `#swap-to` (la chiamata `/api/swap` non lo invia) e non controlla `res.ok`. Mostra "Fatto!" sempre.
  - Il testo "Fatto!" non dice che lo scambio è in attesa di approvazione (compito 2) né di chi.
  - Il pulsante è "OK" invece dell'azione. Il titolo "Swap del turno" è anglicismo (`docs/glossario.md` da verificare).
  - Non c'è elenco vuoto (se nessun collega è disponibile), né controllo di conflitti (riposo, ore).
  - La finestra non riceve il focus, non si chiude con Esc né con click fuori. Nessun `role="dialog"`/`aria-modal`. La chiusura è uno `<span>` non focalizzabile (`turni.html:50`, `✕`): non usabile da tastiera (inferenza: nessun tabindex; WCAG 2.1.1 livello A, quindi P1 secondo le regole comuni, da ricontrollare sulla scheda).
  - Ogni cella con ⇄ apre la stessa finestra con testo fisso "Giulia R. · sab 7 nov" (riga 52): `data-swap="1"` non è usato per popolarla.
- Correzione: finestra con `role="dialog"`, titolo "Scambia il turno", pulsante "Invia richiesta di scambio", chiusura con `<button>`, Esc, focus all'apertura e ritorno al pulsante. Dati del turno dalla cella cliccata. Messaggio finale: "Richiesta inviata a Marta F.: la approvi da Scambi da approvare".

**5. [P1] Compito 3: modulo "Aggiungi dipendente" fa perdere i dati e dice poco**
- Evidenza: `js/app.js:53-72`, `dipendenti.html:32-51`.
- Problemi:
  - **Perdita dei dati sull'errore**: `form.reset()` (riga 65) cancella tutto il modulo di 14 campi dopo un errore del server. Messaggio `Errore 400: payload non valido` (riga 64): tecnico e incomprensibile.
  - **Errore di telefono generico**: "Hai sbagliato il numero." (riga 58) non dice il formato (10 cifre senza spazi); l'elenco sopra mostra i numeri con spazi ("333 120 4455"). Il campo non ha `inputmode="tel"`, l'errore non è legato al campo (non c'è `aria-describedby`), non mette il focus sul campo e il controllo scatta solo al click.
  - **Gli altri 13 campi non vengono validati** (`novalidate` e solo il telefono controllato). Gli altri `required` non producono messaggi.
  - **Nessun feedback di successo utile**: "Fatto!" (riga 68). Il modulo non si svuota, l'elenco non si aggiorna, non dice che l'invito arriva al numero indicato. Nessun stato di invio (doppio invio possibile).
  - **Modulo sproporzionato per il compito**: il README dice che l'invito richiede nome e numero. Il modulo ne chiede 14 obbligatori (codice fiscale, IBAN, indirizzo, livello CCNL, data di nascita…, tutti con `*`). Il responsabile di sala che aggiunge un dipendente in fretta è bloccato. (Per il dato: aspetto privacy, da passare a AIPCA.)
  - **Etichette solo placeholder** (`dipendenti.html:35-48`): spariscono mentre si scrive; i formati data sono incoerenti (gg/mm/aaaa a riga 40, aaaa-mm-gg a riga 46).
  - Pulsante "Procedi" (riga 50): non dice cosa fa ("Aggiungi e invia l'invito"). Titolo "Aggiungi una risorsa" vs voce di menu "Squadra" vs titolo pagina "Personale": tre nomi per la stessa cosa.
- Correzione: modulo minimo (nome, cognome, telefono, ruolo); gli altri dati dopo, in un secondo momento, facoltativi. Etichette visibili. Validare tutti i campi al blur e al submit con messaggio specifico accanto al campo, riepilogo degli errori, focus sul primo errore. Conservare i valori sull'errore. Successo: riga nuova in elenco e messaggio "Invito inviato a Luca B. al 347 880 1290".

**6. [P1] Elenco dipendenti: modifica ed elimina senza azione né etichetta; ricerca senza stato vuoto**
- Evidenza: `dipendenti.html:26-28` (icone ✎ e 🗑 senza `aria-label`, senza handler), `js/app.js:74-79`.
- Problemi:
  - Le azioni non fanno nulla; "elimina" (quando esisterà) richiede conferma e annullamento.
  - Il nome accessibile dei pulsanti è un simbolo.
  - **Stato vuoto assente**: con zero risultati la tabella resta vuota (commento a riga 78, "Nessun risultato: la tabella resta vuota"). Servono un messaggio "Nessun collaboratore trovato per «x»" e un modo per azzerare la ricerca.
  - La ricerca non ha etichetta (solo placeholder, `dipendenti.html:20`) e filtra anche il numero di telefono e le ore (`row.textContent`): comportamento imprevedibile. Nessun annuncio dei risultati ai lettori di schermo.
  - Nessuno stato "elenco vuoto" per un locale appena creato, né l'ordinamento.
- Correzione: `aria-label="Modifica Giulia R."`, `"Elimina Giulia R."`; conferma che nomina la persona; messaggio per ricerca vuota con `role="status"`.

**7. [P1] Compito 5/Eliminazione del locale: conferma inadeguata**
- Evidenza: `js/app.js:83-90`, `impostazioni.html:53-54`.
- Problemi:
  - `confirm("Vuoi davvero procedere?")`: non dice cosa verrà eliminato (il locale con turni, dipendenti, storico), né che è irreversibile, né il nome del locale. "Procedere" è ambiguo: l'etichetta di conferma è "OK".
  - Nessuna digitazione del nome, nessuna esportazione preventiva delle presenze (compito 4) né periodo di ripensamento.
  - Nessuno stato di caricamento: se `DELETE` fallisce, la pagina va comunque a `/addio` (`res.ok` non verificato).
- Correzione: finestra dedicata con titolo "Elimina Trattoria Il Ponte?", conseguenze elencate, richiesta di digitare il nome, pulsante "Elimina definitivamente", suggerimento di esportare prima, gestione dell'errore.

**8. [P1] Impostazioni: salvataggio automatico senza feedback né errore**
- Evidenza: `impostazioni.html:20` ("Le modifiche si salvano da sole."), `js/app.js:92-93`.
- Problemi:
  - `fetch(... PATCH)` senza corpo, senza `res.ok`, senza messaggio di "Salvato", senza errore. L'evento `change` scatta solo all'uscita dal campo.
  - L'utente non sa se il nome o gli orari sono stati salvati e non c'è modo di sapere se è fallito. Il selettore `#main input` include anche futuri campi non pertinenti.
- Correzione: stato accanto al campo ("Salvato", "Non salvato: riprova") con `role="status"`, oppure pulsante "Salva" esplicito. Gestione di errore, riprova e ripristino.

**9. [P1] Compito 4: esportazione delle presenze nascosta e non funzionante**
- Evidenza: `impostazioni.html:27-38`. Quattro livelli di `<details>` (Impostazioni › Locale › Esporta › Presenze per il consulente). `docs/mappa.md` dichiara la stessa profondità. Il link è `<a class="btn btn-secondary" href="#" id="export">Clicca qui</a>` e `js/app.js` non ha alcun handler per `#export`.
- Problemi:
  - Il compito mensile del titolare richiede 5 passaggi. L'esportazione non ha una voce propria: sta sotto "Locale".
  - Etichetta "Clicca qui" non descrive l'azione (WCAG 2.4.4, A/AA, da ricontrollare in scheda). `href="#"` salta in cima.
  - Nessuno stato di attesa, di successo (file scaricato, nome del file), vuoto (mese senza dati) o di errore.
  - Il mese predefinito è "ottobre 2026" ma l'ordine e il preselezionato non è dichiarato nel codice. Il report del costo del lavoro (`impostazioni.html:34-37`) è sotto "Esporta", mentre `docs/mappa.md` lo cita anche per il cruscotto: duplicato incoerente.
- Correzione: pagina o voce "Presenze" (o "Esporta") di primo livello; pulsante "Scarica le presenze di ottobre 2026 (.xlsx/.csv)" con feedback di avvio, errore e conferma; niente `<details>` annidati.

**10. [P1] Uscita automatica senza avviso**
- Evidenza: `js/app.js:11-12`.
- Problemi:
  - `setTimeout` a 10 minuti dalla **caricamento della pagina**, non dall'ultima richiesta (il commento dice "senza richieste al server": non è vero; non viene mai azzerato).
  - Un responsabile che sta preparando i turni (compito di frequenza maggiore, di solito la domenica sera, con un lavoro di molti minuti) viene espulso con modifiche non salvate, senza preavviso né recupero. WCAG 2.2.1 Regolazione tempo (livello A), da ricontrollare in scheda.
  - Nemmeno il passaggio su un'altra scheda cambia la cosa.
- Correzione: azzerare il timer a ogni interazione/richiesta, avviso 1–2 minuti prima con pulsante "Resta collegato", salvataggio delle bozze (o avviso di modifiche non salvate) prima dell'uscita.

**11. [P2] Griglia dei turni: non usabile su telefono, stati colorati e feedback**
- Evidenza: `css/app.css:52` (`.week` larghezza fissa 1100px); schermata `turni-telefono.png` mostra la griglia più larga dello schermo. `turni.html:36-43`, `45`.
- Problemi:
  - Il pannello è "pensato per il computer" (sintesi), ma l'uso sul telefono è possibile: i responsabili controllano gli scambi durante la settimana. Lo scorrimento orizzontale non è evidente e la colonna dei nomi non resta fissa.
  - I pallini presente/ritardo/assente sono solo colore (`dot-ok/late/absent`) e la legenda alla riga 45 (`● presente ● in ritardo ● assente`) è tutta grigia: non spiega nulla (schermata). WCAG 1.4.1 (A), da ricontrollare in scheda. In una pagina di pianificazione futura stati "presente / assente / in ritardo" non hanno senso: sono dati di presenza, mescolati con la programmazione dei turni.
  - Nessun segnale di turni non coperti, sovrapposizioni o ore settimanali, né modo di modificare un turno (nessuna cella cliccabile tranne ⇄).
  - Giulia R. ha il turno del sabato 18:00–00:30 e la domenica 11:00–15:00: nessun avviso sul riposo minimo (inferenza: regola di dominio, da confermare con il responsabile).
- Correzione: contenitore con scorrimento e colonna nomi fissa, o vista a elenco per giorno sul telefono; legenda con testo e forme; separare presenze e programmazione.

**12. [P2] Cruscotto: numeri e grafici senza stati e con scelte che fuorviano**
- Evidenza: `index.html:28-30`, `34-90`. (Per i grafici rimando a AIWDA dataviz: le questioni di flusso e stati.)
- Problemi di flusso e di stati:
  - Nessun KPI porta a un dettaglio. "Assenze 4" non è collegato a nessuna pagina e non c'è un periodo di confronto con la settimana precedente.
  - Nessuno stato di caricamento, vuoto (locale nuovo) o errore per KPI e grafici (dati scritti nel codice, ma il progetto prevede un server).
  - Le etichette dei KPI non dicono il periodo e la base ("31%" di cosa? del fatturato?).
  - Il banner di `index.html:22-24` non è azionabile (vedi rilievo 2).
- Problemi di rappresentazione (da passare al dataviz designer): asse troncato "da 60 a 70" (commento riga 34) che amplifica le differenze; doppio asse (righe 73-81) in cui le linee si incrociano per costruzione; torta a 8 fette tutte nella stessa tinta blu (righe 52-59) con la legenda a parte; il grafico a barre (`index.html:35-47`) non ha `role="img"`/testo alternativo né valori sulle barre.

**13. [P2] Coerenza dei testi e della navigazione**
- Evidenza: `lang="en"` in tutte le pagine (riga 2); `<title>Turnio</title>` uguale in tutte; menu "Settings"/"Dashboard" in inglese con "Squadra"/"Turni" in italiano (righe 12-15); "Squadra" (menu) / "Personale" (titolo) / "dipendenti" (README) / "collaboratore" (ricerca) / "risorsa" (modulo); "Nome del negozio" (`impostazioni.html:24`) contro "locale" altrove; "Fatto!" ovunque.
- Problemi: orientamento incerto, titolo della scheda uguale per tutte le pagine (WCAG 2.4.2 A; 3.1.1 lingua A, da ricontrollare in scheda). Il menu ordina Settings per primo mentre `docs/mappa.md` dice "la prima pagina dopo l'accesso è il cruscotto", e il compito più frequente (Turni) è ultimo.
- Correzione: menu in italiano, in ordine di frequenza (Turni, Dashboard, Squadra, Impostazioni), `lang="it"`, titoli "Turni · Turnio", un solo termine per le persone (da `docs/glossario.md`), messaggi di successo specifici.

**14. [P2] Nessun indicatore di focus e toast non accessibile**
- Evidenza: `css/app.css:14` (`*:focus { outline: none; }`), `css/app.css:74`, `js/app.js:3-9`.
- Problemi: tutti i controlli perdono il focus visibile (WCAG 2.4.7 AA e 2.4.11 in 2.2, da ricontrollare in scheda). Il toast (`<div class="toast">`, nessun `role="status"`/`aria-live`) sparisce dopo 1,5 secondi: troppo breve da leggere e non annunciato ai lettori di schermo; i toast successivi si sovrappongono; non si può chiudere né sospendere.
- Correzione: ripristinare il focus (`:focus-visible`), `role="status"`, durata di 5–6 secondi o fissa per gli errori, messaggi di errore persistenti accanto all'azione.

**15. [P3] Dettagli**
- `<span class="modal-close">` (cursore ma non pulsante) e `.btn` come `<a>`/`.button` (`turni.html:54` usa `class="button"`, classe che non risulta in `docs/componenti.md`: da verificare).
- `impostazioni.html:44`: ultima colonna della tabella senza intestazione leggibile; `dipendenti.html:24` "Azioni" in `muted` (contrasto basso).
- `turni.html:22`: l'etichetta di settimana "02/11 – 08/11" senza anno.
- Colore e contrasto dei testi `.muted` per le note importanti (come "Le modifiche si salvano da sole", `impostazioni.html:20`): da misurare (non l'ho fatto).
- Il cruscotto non ha `toast` (`index.html` non lo include), coerente perché non ha azioni.

## Flusso ideale proposto per il compito 1–2 (dopo la correzione)
Turni → modifica celle → "Salva bozza" (stato "Bozza non pubblicata", avviso all'uscita) → "Pubblica i turni" (conferma con riepilogo: "12 dipendenti riceveranno la notifica") → stato "Pubblicata il …". Scambio: dal turno ⇄ → scelta del collega → richiesta "in attesa" → in Turni/cruscotto "3 scambi da approvare" con pulsanti Approva/Rifiuta e annulla.

## Domande aperte (per l'utente)
1. La regola di riposo minimo tra turni (sab 00:30 → dom 11:00) va segnalata nel prodotto?
2. Quali dei 14 campi del modulo servono davvero all'aggiunta (README: solo nome e telefono)? Gli altri servono al consulente: quando e da chi vanno inseriti?
3. Il pannello deve funzionare su telefono (compiti 2 e 4)?
4. La durata della sessione: 10 minuti è una scelta di sicurezza (da confrontare con AISA)?

## Limiti
Analisi del codice e di due schermate (turni-telefono, impostazioni-computer); non ho ispezionato le altre schermate né eseguito le pagine; contrasti non misurati; gli esiti delle API sono ipotesi (le chiamate sono simulate). Le citazioni WCAG non sono state verificate sulle schede della biblioteca. `requires_human_review: true` per i rilievi 3, 5, 10 e 11.

Priorità riassunte: P1 (1, 2, 3, 4, 5, 6, 7, 8, 9, 10), P2 (3b, 11, 12, 13, 14), P3 (15).

— AIWDA-03 · HADAR, Senior UX Designer
