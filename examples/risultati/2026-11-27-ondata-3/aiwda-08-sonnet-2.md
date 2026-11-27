AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

# Revisione accessibilità WCAG 2.2 AA (sola lettura): Turnio
Per il direttore AIWDA-01 · CANOPUS. Agente: GACRUX (modello Sonnet: i rilievi P1 vanno riesaminati dal direttore o da un revisore su Opus prima di diventare definitivi).

## Perimetro e metodo
- **Letti per intero:** `index.html`, `dipendenti.html`, `turni.html`, `impostazioni.html`, `css/tokens.css`, `css/app.css`, `js/app.js`.
- **Screenshot guardati:** `schermate/turni-telefono.png` e `schermate/index-telefono.png`. Gli altri sei non sono stati aperti.
- **Contrasti:** calcolati a mano dai valori esadecimali dei CSS (rapporti arrotondati), non misurati nel browser.
- **Scheda biblioteca letta:** wcag-2-2 (W3C Recommendation, 5 ottobre 2023; verificata il 2026-11-19).
- **Non eseguito:** nessun test con tastiera o lettore di schermo in un browser reale, nessun controllo automatico (axe, Lighthouse), nessuno zoom al 200% o 400%, nessun test del flusso dinamico. Non è un audit WCAG completo. Quello che segue sono fatti letti nel codice e inferenze sul comportamento.

## Rilievi
Tutti i rilievi hanno stato `Nuova`, salvo diversa indicazione. Dove manca la conferma in browser è `requires_human_review: true`.

### P1

**1. Focus rimosso su tutta l'app**
- Criterio: 2.4.7 Focus Visible (AA).
- Evidenza: `css/app.css:14` `*:focus { outline: none; }`. Non c'è nessuno stile `:focus-visible` sostitutivo.
- Impatto: chi usa la tastiera, gli switch o l'ingrandimento non vede dove si trova su menu, pulsanti, campi e riepiloghi. Questo impedisce di compiere i compiti.
- Correzione: eliminare la regola e definire un `:focus-visible` con contorno di almeno 2 px e contrasto di almeno 3:1 sullo sfondo. Il rapporto è nel token `--color-primary` su `--color-surface`.
- Confidenza 0,95.

**2. Pagine in italiano dichiarate in inglese**
- Criterio: 3.1.1 Language of Page (A).
- Evidenza: `<html lang="en">` alla riga 2 di tutte e 4 le pagine. I contenuti sono in italiano, tranne la voce di menu "Settings" e il titolo "Dashboard".
- Impatto: i lettori di schermo leggono l'italiano con la pronuncia inglese.
- Correzione: `lang="it"`. Per le sole parole inglesi usare `lang="en"` oppure tradurle ("Impostazioni" in `index.html:12`, `dipendenti.html:12`, `turni.html:12` e `impostazioni.html:12`).
- Confidenza 0,97.

**3. Uscita automatica dopo 10 minuti, senza avviso e non prolungabile**
- Criterio: 2.2.1 Timing Adjustable (A).
- Evidenza: `js/app.js:12` `setTimeout(() => { window.location.href = "/login"; }, 10*60*1000);`.
- Il timer non si azzera con l'attività. Il commento dice "senza richieste", ma nessuna fetch lo reimposta, quindi scatta comunque dopo 10 minuti dal caricamento.
- Impatto: chi compila lentamente il modulo "Aggiungi una risorsa" (14 campi) perde i dati senza preavviso. Colpisce persone con disabilità motorie, cognitive o che usano tecnologie assistive.
- Correzione: avvisare almeno 20 secondi prima e permettere di prolungare con un'azione semplice. Azzerare il timer a ogni interazione o richiesta. Non perdere i dati inseriti.
- Confidenza 0,85.
- Da confermare con l'utente: se questo scadere della sessione è un requisito di sicurezza, resta valido l'avviso con possibilità di prolungare.

**4. Pulsanti con solo icona, senza nome accessibile**
- Criteri: 4.1.2 Name, Role, Value (A) e 1.1.1 Non-text Content (A).
- Evidenza:
  - `turni.html:21,23` (◀ ▶ per cambiare settimana);
  - `turni.html:37` (⇄ per lo swap);
  - `dipendenti.html:26-28` (✎ 🗑 in ogni riga).
- Il nome accessibile è il glifo ("black left-pointing triangle", "pencil", "wastebasket").
- Impatto: chi usa un lettore di schermo o il comando vocale ("clicca elimina") non sa che azione svolgono né su quale persona. Il pulsante 🗑 è distruttivo e ripetuto 3 volte senza contesto.
- Correzione: aggiungere `aria-label` come "Settimana precedente", "Settimana successiva", "Scambia il turno di Giulia R. di sabato", "Modifica Giulia R.", "Elimina Giulia R.". Rendere i glifi decorativi con `aria-hidden="true"`.
- Confidenza 0,95.

**5. Campi senza etichetta visibile e associata**
- Criteri: 1.3.1 Info and Relationships (A), 3.3.2 Labels or Instructions (A), 4.1.2 (A).
- Evidenza:
  - `dipendenti.html:35-48` (14 campi del modulo): solo `placeholder`, nessuna `<label>`;
  - `dipendenti.html:20`, campo di ricerca senza etichetta.
- L'unico testo che identifica il campo sparisce appena si scrive. L'obbligatorietà è affidata all'asterisco nel placeholder.
- Impatto: perdita del contesto per persone con memoria o attenzione ridotta, per chi usa lettori di schermo, e per chi usa il comando vocale.
- Correzione: una `<label for>` visibile per ogni campo. Il formato richiesto va in testo, non solo nel placeholder: "gg/mm/aaaa", "aaaa-mm-gg" (due formati diversi per due date, che è anche incoerente) e il formato del telefono. Per la ricerca basta una label, anche `visually-hidden`.
- Il segnale `required` nativo c'è, ma il form è `novalidate`.
- Confidenza 0,9.

**6. Errori di validazione non identificano il campo e non vengono annunciati con il contesto**
- Criteri: 3.3.1 Error Identification (A), 3.3.3 Error Suggestion (AA), 4.1.3 Status Messages (AA).
- Evidenza:
  - `js/app.js:57-60`: il telefono è l'unico campo validato; il messaggio è "Hai sbagliato il numero." in un unico paragrafo (`dipendenti.html:49`). Nessun `aria-invalid`, nessun collegamento al campo con `aria-describedby`, il focus non si sposta.
  - La regola `^\d{10}$` rifiuta "333 120 4455", cioè il formato che la tabella stessa mostra (`dipendenti.html:26`), e il messaggio non spiega quale formato è accettato.
  - Gli altri 13 campi obbligatori non sono controllati dal client.
  - `js/app.js:63-66`: sull'errore del server compare "Errore 400: payload non valido", un testo tecnico, e il modulo viene azzerato con `form.reset()`. Chi ha digitato 14 campi li rimette tutti, e per chi digita con fatica è un grave ostacolo. Vedi anche il rilievo 3.3.7 sotto.
  - `.field .error` in `css/app.css:66` non si applica, perché `p.error` in `dipendenti.html:49` è fuori da `.field`. Il messaggio non ha colore né stile.
- Impatto: l'utente non sa quale campo correggere né come, e non ritrova i dati già scritti.
- Correzione:
  - un messaggio per campo, vicino al campo, con `aria-invalid="true"` e `aria-describedby`;
  - un riepilogo che porta il focus sul primo errore;
  - messaggi del tipo "Telefono: inserisci 10 cifre senza spazi" oppure accettare gli spazi;
  - non azzerare il modulo mai.
- Confidenza 0,9.

**7. "Elimina settimana" cancella senza conferma e senza possibilità di annullare**
- Criterio: 3.3.4 Error Prevention (Legal, Financial, Data) (AA).
- Evidenza: `js/app.js:22-25` `fetch(DELETE)` e subito `week.innerHTML = ""`, senza `confirm` né ripristino.
- Il pulsante in `turni.html:28` ha anche lo stesso aspetto (`btn-primary`) di "Pubblica i turni" accanto. Gli azzurri sono identici e la sola differenza è il testo.
- L'azzeramento avviene anche se la richiesta fallisce: l'esito non viene controllato.
- Impatto: un clic involontario (tremore, errore di selezione) cancella i turni di una settimana, con effetto sui dipendenti. Danno più grave per chi ha disabilità motorie.
- Correzione: una conferma specifica ("Eliminare i turni del 02/11–08/11?") oppure l'annullamento. Controllare l'esito prima di svuotare la griglia. Dare al pulsante un aspetto distinto dallo stile primario.
- Confidenza 0,9.
- Nota: per "Elimina locale" (`js/app.js:86`) la conferma c'è, ma è un `confirm()` generico ("Vuoi davvero procedere?") che non dice cosa si sta eliminando. È un rilievo minore di testo (P3), non una violazione.

**8. Finestra "Swap del turno" non accessibile**
- Criteri: 4.1.2 (A), 2.1.1 Keyboard (A), 2.4.3 Focus Order (A).
- Evidenza:
  - `turni.html:48-56`: nessun `role="dialog"`, `aria-modal`, `aria-labelledby`.
  - `turni.html:50`: il pulsante chiudi è uno `<span class="modal-close">` con "✕", non focalizzabile e non azionabile da tastiera.
  - `js/app.js:37-42`: all'apertura il focus non entra nella finestra, non c'è trappola del focus, Esc non chiude, alla chiusura il focus non torna sul pulsante che l'ha aperta. Il resto della pagina resta raggiungibile.
- Impatto: per chi usa tastiera o lettore di schermo la finestra è invisibile oppure impossibile da chiudere.
- Correzione: `<dialog>` nativo con `showModal()` oppure i ruoli ARIA e la gestione del focus. Sostituire lo span con un `<button aria-label="Chiudi">`. Ripristinare il focus a chiusura.
- Confidenza 0,9 sul codice. L'effetto reale è da verificare in browser.
- Nota: l'etichetta `<label>Collega <select>` è corretta. "OK" in `turni.html:54` usa `class="button"`, che è un altro componente rispetto a `.btn` (vedi contrasto, rilievo 11).

**9. Stato dei turni affidato al solo colore**
- Criteri: 1.4.1 Use of Color (A) e 1.1.1 (A).
- Evidenza:
  - `turni.html:37-43`: i pallini `.dot-ok`, `.dot-late`, `.dot-absent` sono `<span>` vuoti, senza testo né `aria-label`.
  - La legenda a `turni.html:45` ("● presente ● in ritardo ● assente") compare in tre colori uguali: nello screenshot `turni-telefono.png` i tre pallini sono grigi, perché non hanno la classe del colore. La legenda non spiega nulla.
  - Verde/rosso/arancio sono anche i colori più difficili per le persone con daltonismo.
- Impatto: chi non distingue i colori o usa un lettore di schermo non sa se la persona è presente, in ritardo o assente.
- Correzione: un'etichetta di testo accanto al pallino ("presente", "in ritardo", "assente"), anche abbreviata, oppure icone con forme diverse. Colorare la legenda con le stesse classi.
- Confidenza 0,95.

**10. I quattro grafici SVG non hanno alternativa testuale, tre dei quattro si leggono solo dal colore**
- Criteri: 1.1.1 (A), 1.4.1 (A), 1.4.11 Non-text Contrast (AA).
- Evidenza (`index.html`):
  - Barre (35-47): `<svg>` senza `role="img"`, titolo o descrizione. I valori stanno nel paragrafo sotto (riga 48), in grigio chiaro, ma il paragrafo non è collegato al grafico.
  - Torta (51-60): c'è un `aria-label` generico ("Torta del costo per ruolo") ma non i valori. La legenda a 61-70 li ha. Le 8 fette sono 8 sfumature dello stesso azzurro (da `#1f6feb` a `#ddf4ff`): senza etichette dirette sulle fette, chi legge dal colore non le distingue. Le ultime fette (`#cae8ff`, `#ddf4ff`) hanno un contrasto di circa 1,2–1,4:1 contro lo sfondo bianco, e anche quello tra fette vicine è basso (visibile nello screenshot `index-telefono.png`).
  - Costo e incassi (74-80): due linee rosso e verde. L'unica legenda è la riga 81 "Rosso: ... Verde: ..." (colore-only e daltonismo rosso/verde), le linee hanno lo stesso spessore, senza etichette né marcatori diversi. Nessun dato in testo.
  - Ritardi (84-89): nessuna alternativa, nessun valore leggibile (i punti non sono etichettati).
- Impatto: chi usa un lettore di schermo non ottiene i dati dei grafici 3 e 4, né i valori delle fette. Le persone con ipovisione o daltonismo non distinguono le serie.
- Correzione:
  - `role="img"` con `aria-labelledby` verso un titolo e una descrizione, più una tabella dei dati (anche in `<details>`) per ogni grafico;
  - etichette dirette sulle serie e sulle fette, con valore;
  - marcatori o tratteggi diversi tra le linee;
  - palette con contrasto di almeno 3:1 tra elementi adiacenti.
- Confidenza 0,85.
- Nota non WCAG, per il revisore di dataviz: l'asse del grafico a barre parte da 60 (riga 34), e le barre sembrano molto diverse pur variando da 62 a 70. Il grafico a doppio asse (costo 0–8.000, incassi 20.000–26.000) fa sembrare le serie sovrapponibili. Sono rilievi di data visualization, non di accessibilità.

### P2

**11. Contrasto del testo insufficiente (1.4.3 Contrast (Minimum), AA)**
Rapporti calcolati a mano.
- `--color-muted: #9aa0a6` (`css/tokens.css:6`): circa 2,5:1 su bianco e 2,3:1 su `#f6f7f9`. Richiesto 4,5:1.
  - Usato da `.muted` (`css/app.css:42`, 13 px) per sottotitoli, caption della tabella (`dipendenti.html:23`), legenda (`turni.html:45`), ruoli, note ("I campi con * sono obbligatori", `dipendenti.html:33`), "Dati aggiornati a…" (`index.html:90`).
  - Usato anche da `.kpi-value` (`css/app.css:41`): i valori dei KPI (31%, 461, 4) sono il dato principale ma sono grigi e più piccoli dell'etichetta (16 px 400 contro 18 px 700). Gerarchia invertita.
  - Anche `<th><span class="muted">Azioni</span></th>` (`dipendenti.html:24`).
- `.badge-warning` bianco su `--color-warning #e8a33d` (`css/app.css:47`): circa 2,2:1. Usato nel badge "3" di `impostazioni.html:42` (14 px).
- `.badge-danger` e `.badge-orange`: bianco su `#e5534b`, circa 3,7:1, e su `#e89b3a`, circa 2,3:1. Non compaiono nelle pagine lette, ma sono definiti.
- `.button` (`css/app.css:33`, "OK" dello swap): bianco su `#2f81f7`, circa 3,8:1 a 15 px.
- `--color-danger` è ridefinito in `css/tokens.css:31` come `#e5534b`, sovrascrivendo `#cf222e` di riga 12 (duplicazione). `.btn-danger` però usa il valore diretto `#cf222e` (circa 5,5:1, conforme).
- Correzione: scurire `--color-muted` (per esempio intorno a `#5f6670`, circa 5,5:1) e valutare di rendere i KPI prominenti. Per i badge usare testo scuro o un fondo più scuro. Riferire il blu del pulsante `.button` al token `--color-primary` (`#1f6feb` su bianco circa 4,8:1).
- Confidenza 0,85 (calcolo a mano). Verificare con uno strumento.

**12. Contrasto dei componenti e degli indicatori (1.4.11 Non-text Contrast, AA)**
- Bordo dei campi `--color-border #d8dce1` su bianco (`css/app.css:65`): circa 1,4:1. Il confine del campo non è percepibile (richiesto 3:1).
- Pallino `.dot-late` (`#e89b3a`) circa 2,3:1 su bianco, `.dot-absent` (`#e5534b`) circa 3,7:1. L'arancio non basta.
- Fette chiare della torta: vedi rilievo 10.
- Correzione: bordo dei campi più scuro (intorno a `#8a9199` o più, per arrivare a 3:1), colori dei pallini e delle fette conformi a 3:1.
- Confidenza 0,8.

**13. Link "Clicca qui" privo di significato; link usati come pulsanti**
- Criteri: 2.4.4 Link Purpose (In Context) (A), 4.1.2 (A).
- Evidenza:
  - `impostazioni.html:32` `<a class="btn btn-secondary" href="#" id="export">Clicca qui</a>`. Il testo non dice cosa fa e il paragrafo che lo contiene non lo spiega. In una lista di link il lettore di schermo legge solo "Clicca qui".
  - `href="#"` su un'azione e non su una destinazione: è un pulsante (o un download) travestito da link. Lo stesso a riga 36 ("Scarica il report", `href="#"`).
  - `js/app.js` non ha nessun gestore per `#export`.
- Correzione: testo descrittivo ("Esporta le presenze di ottobre 2026"). Usare `<button>` per un'azione e `<a download>` con href reale per un file.
- Confidenza 0,9.

**14. Griglia dei turni senza semantica di tabella**
- Criteri: 1.3.1 (A), 4.1.2 (A).
- Evidenza: `turni.html:33-44` è una griglia di `<div>` (`display: grid`): nessun `role="table"`, né `<th>`, né legame tra giorno e dipendente. La cella vuota in alto a sinistra non ha testo. Una cella può contenere solo "Riposo".
- Impatto: i lettori di schermo leggono le celle come testo sparso e non annunciano il giorno né la persona. Chi naviga a celle non può orientarsi.
- Correzione: una vera `<table>` con `<caption>` ("Turni 02/11–08/11"), `<th scope="col">` per i giorni e `<th scope="row">` per i nomi, e un'intestazione per la cella vuota. Nel pulsante ⇄ includere il giorno nel nome.
- Confidenza 0,9.

**15. Pulsanti "OK" e "No" ripetuti senza contesto**
- Criteri: 2.4.6 Headings and Labels (AA), 4.1.2 (A).
- Evidenza: `impostazioni.html:46-48`, tre righe con identici pulsanti "OK"/"No". In più la colonna dell'ultima `<th>` è vuota (riga 44) e in dipendenti la `<th>` "Azioni" ha il solo nome.
- Impatto: un lettore di schermo che elenca i pulsanti sente "OK, No, OK, No, OK, No", senza sapere quale scambio approva o rifiuta. "OK" e "No" sono anche ambigui come azioni ("Approva", "Rifiuta"). Non c'è gestore in `js/app.js`.
- Correzione: `aria-label` che includa il contesto ("Approva lo scambio di Giulia R. con Marta F."), testo più chiaro, `<th>` con un testo (anche visually hidden).
- Confidenza 0,85.

**16. Messaggi di stato non annunciati e che spariscono da soli**
- Criteri: 4.1.3 Status Messages (AA), 2.2.1 (A).
- Evidenza:
  - `js/app.js:3-9` + `turni.html:58`, `dipendenti.html:53`, `impostazioni.html:56`: il toast è un `<div hidden>` senza `role="status"` né `aria-live`: non viene annunciato. Scompare dopo 1500 ms, troppo poco per essere letto o notato da chi usa un ingrandimento o è lento nella lettura. Il testo è sempre "Fatto!" (generico).
  - La ricerca (`js/app.js:74-79`) nasconde le righe senza dire quanti risultati restano e, se non ce n'è nessuno, la tabella resta vuota (il commento a riga 78 lo conferma).
  - Impostazioni: "Le modifiche si salvano da sole" (`impostazioni.html:20`), ma dopo il salvataggio (`js/app.js:92-94`) non c'è alcun feedback.
  - In `js/app.js:27-35` e `22-25` gli errori di rete vanno solo in `console.log` o non vengono controllati: l'utente non sa che il salvataggio è fallito.
- Correzione: `role="status"` (o `aria-live="polite"`) sul contenitore. Lasciare il messaggio visibile più a lungo oppure permettere di chiuderlo. Testi specifici ("Turni pubblicati", "Dipendente aggiunto"). Annunciare il numero di risultati e il caso "nessun collaboratore trovato". Dare esito all'autosalvataggio.
- Confidenza 0,85.

**17. Reflow su schermi stretti (1.4.10 Reflow, AA)**
- Evidenza: `css/app.css:52` `.week { width: 1100px }`. Lo screenshot `turni-telefono.png` mostra l'intera pagina larga 1126 px: la barra del menu è tagliata alla larghezza del telefono e la griglia fuoriesce, quindi la pagina scorre in orizzontale.
- Anche `index.html` ha SVG con `width="560"` fissi (`index.html:35,74,84`), e il menu `.nav` (`css/app.css:17`) non va a capo.
- Nota: 1.4.10 esenta i contenuti che richiedono un layout bidimensionale (tabelle di dati, diagrammi), quindi la griglia dei turni potrebbe rientrare nell'eccezione se il contenitore scorre da solo. Qui però scorre l'intera pagina, e le intestazioni (menu e titolo) si perdono.
- Correzione: contenere la griglia in un contenitore con `overflow-x: auto` e `tabindex="0"` con etichetta, oppure un layout per giorno su schermi stretti. `max-width: 100%; height: auto` sugli SVG. `flex-wrap` sul menu.
- Confidenza 0,6. Da verificare a 320 px CSS e al 400% di zoom.

### P3

**18. Titolo identico su tutte le pagine (2.4.2 Page Titled, A)**
- Evidenza: `<title>Turnio</title>` alla riga 6 di tutte e 4 le pagine.
- Impatto: nelle schede aperte, nella cronologia e nell'annuncio dei lettori di schermo non si distingue la pagina.
- Correzione: "Dashboard – Turnio", "Personale – Turnio", ecc.
- Nota: il livello è A. Priorità P3 perché la pagina ha un `<h1>` e `aria-current`, ma la regola comune del reparto fa partire da P1 un criterio A che impedisce un compito: qui non lo impedisce. Confidenza 0,95.

**19. Nomi incoerenti tra menu e intestazioni (2.4.6 Headings and Labels, AA, da confermare)**
- Evidenza: il menu dice "Squadra" ma l'`<h1>` è "Personale" (`dipendenti.html:14,19`); il menu "Settings" e l'`<h1>` "Impostazioni" (`impostazioni.html:12,19`); il modulo "Aggiungi una risorsa" per una persona; la tabella "Dipendenti del locale" (`dipendenti.html:23`); l'intestazione di turno "Swap del turno". Lo stesso concetto ha più nomi.
- Correzione: un nome per concetto, in italiano. Il collegamento con 2.5.3 Label in Name non c'è, perché non sono nomi accessibili di pulsanti.
- Confidenza 0,6.

**20. Pittogrammi decorativi letti ad alta voce (1.1.1, A)**
- Evidenza: `index.html:23` "🔔 3 scambi da approvare": l'emoji è letta come "campana". Meglio `aria-hidden="true"`. Il banner è un semplice `<div>` e non è un link verso gli scambi.
- Confidenza 0,7.

**21. Autocomplete (1.3.5 Identify Input Purpose, AA): non applicabile in modo chiaro**
- Evidenza: i campi di `dipendenti.html:35-48` (nome, cognome, telefono, email, indirizzo, data di nascita) non hanno `autocomplete`.
- Ma raccolgono i dati di un'altra persona (il collaboratore da aggiungere), non dell'utente, e il criterio riguarda i dati dell'utente. Non lo segnalo come violazione. Se in futuro ci sarà un modulo con i dati dell'utente stesso (profilo, login), servirà.
- Impostare `autocomplete="off"` o nulla va bene qui. Da confermare dal direttore.

**22. Reinserimento dopo l'errore (3.3.7 Redundant Entry, A, da confermare)**
- Evidenza: `js/app.js:65` `form.reset()` dopo un errore del server: i dati vanno inseriti di nuovo. Il criterio riguarda i dati già inseriti nello stesso processo e richiesti di nuovo; il caso è aderente. Già incluso nel rilievo 6, che è la correzione utile: non azzerare il modulo.

**23. Ricarica della pagina dopo "Salva" (`js/app.js:31`)**
- Il focus torna all'inizio della pagina e non c'è nessun annuncio. Non è una violazione chiara di un criterio (3.2.x non si applica a un'azione richiesta dall'utente). Suggerisco di aggiornare la griglia senza ricaricare e di annunciare l'esito, in coerenza col rilievo 16.

## Verificato conforme dal codice (non esteso a tutto)
- Skip link presente e visibile al focus (`css/app.css:11-12`), con `<main id="main">`. Non ho verificato in un browser se sposta il focus (2.4.1 plausibile).
- `<nav aria-label>` e `aria-current="page"` sulla voce corrente (2.4.8 è AAA, ma l'indicazione c'è). Voci del menu nello stesso ordine su tutte e quattro le pagine (3.2.3 Consistent Navigation: coerente).
- Intestazioni ordinate: h1, poi h2, senza salti, in tutte le pagine.
- Tabelle di `dipendenti.html` e `impostazioni.html` con `<th scope="col">` e, in dipendenti, `<caption>`.
- `<label for>` corretta sui due campi del blocco "Locale" (`impostazioni.html:24-25`) e sul `<select>` dello swap.
- `prefers-reduced-motion` gestito (`css/tokens.css:35`). Il viewport non blocca lo zoom.
- Pulsanti `.btn` con `min-height: 40px`; i pulsanti `.icon-btn` sono circa 30 px (18 px + 12 di padding): 2.5.8 Target Size (Minimum) soddisfatto sul codice, non misurato. Il link del menu e il pulsante chiudi dello swap non sono stati misurati. Il campo "Ore settimanali" accetta qualsiasi testo.
- `<details>` annidati su tre livelli in `impostazioni.html:22-39` ("Locale" > "Esporta" > "Presenze per il consulente"): navigabili da tastiera di default, ma profondità eccessiva per gli utenti con lettori di schermo. Suggerimento di struttura, non violazione.
- 4.1.1 Parsing: non verificato né segnalato (criterio obsoleto in WCAG 2.2).

## Test non eseguiti
Tastiera reale (ordine del focus, trappole), lettore di schermo, strumenti automatici, contrasto misurato su browser, zoom/reflow, 2.5.7 Dragging Movements (nessun trascinamento nel codice), 3.2.6 Consistent Help (nessun aiuto nelle pagine, non applicabile), 3.3.8 Accessible Authentication (il login non è nel progetto), 2.4.11 Focus Not Obscured (nessun elemento fisso salvo il toast in basso a destra; da provare a focus visibile, dopo la correzione del rilievo 1). Quattro screenshot su otto non sono stati guardati (`dipendenti-*`, `impostazioni-*`, `index-computer`, `turni-computer`).

## Domande aperte per il direttore e per l'utente
1. L'uscita dopo 10 minuti (rilievo 3) è un requisito di sicurezza? Se sì, con avviso e possibilità di prolungare.
2. Il pulsante "Clicca qui" (rilievo 13) dovrebbe scaricare un file? Oggi non fa nulla (`href="#"` e nessun gestore): è una funzione non implementata più che un problema di accessibilità.
3. La griglia dei turni (rilievo 17) rientra nell'eccezione dei dati bidimensionali di 1.4.10? Da decidere dopo una verifica a 320 px.
4. Riesame consigliato su Opus dei rilievi P1 (1–10) prima di consegnarli come definitivi, dato che questo lavoro è stato svolto da Sonnet.

Firmato: AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)
