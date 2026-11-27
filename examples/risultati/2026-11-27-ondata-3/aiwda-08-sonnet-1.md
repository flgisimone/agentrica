AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

# Rapporto: revisione accessibilità, WCAG 2.2 AA
Riferimento: scheda wcag-2-2 (W3C Recommendation del 5 ottobre 2023, verificata il 2026-11-19, da ricontrollare entro il 2027-05-19). Il criterio 4.1.1 non è più usato.
Consegna ad AIWDA-01 · CANOPUS. Perimetro: `index.html`, `turni.html`, `dipendenti.html`, `impostazioni.html`, `css/app.css`, `css/tokens.css`, `js/app.js`.

## Metodo e limiti
- Il lavoro è un'analisi statica del codice, più una sola schermata guardata (`schermate/turni-telefono.png`). Le altre sette non le ho aperte.
- Non ho eseguito lettori di schermo né strumenti automatici (axe, Lighthouse) e non ho provato la tastiera nel browser.
- I contrasti sono calcolati a mano dai valori esadecimali, quindi sono stime. Quelli segnati «circa» vanno confermati con uno strumento.
- Non è un audit WCAG completo. Non ho verificato: media (nessuno presente), zoom al 200% e spaziatura del testo (1.4.4 e 1.4.12), orientamento, comportamento reale della tastiera e dell'ordine del focus nel browser, e la resa con un lettore di schermo.
- Modello: Sonnet. I rilievi P1 vanno riesaminati dal direttore o da un revisore su Opus prima di diventare definitivi.
- Ho citato i criteri solo dove l'evidenza lo supporta. Dove manca certezza è scritto «da confermare».

## Rilievi P1
1. **Nessun indicatore di focus** (2.4.7 Focus Visible, AA).
   - Evidenza: `css/app.css:14` `*:focus { outline: none; }`, senza stile alternativo. L'unico stato `:focus` è quello dello skip-link (riga 12).
   - Utenti: tastiera, switch, ipovedenti. Sono impattate tutte le pagine.
   - Correzione: togliere la regola, oppure sostituirla con `:focus-visible` con contorno di almeno 3:1 rispetto allo sfondo.
2. **La finestra dello scambio non è una finestra accessibile** (2.1.1 Keyboard A, 4.1.2 Name Role Value A, 2.4.3 Focus Order A).
   - Evidenza: `turni.html:48-56` e `js/app.js:37-47`.
   - Mancano `role="dialog"`, `aria-modal`, il nome accessibile e lo spostamento del focus all'apertura.
   - Mancano anche la gestione del focus trap, il tasto Esc e il ritorno del focus al pulsante di partenza.
   - La chiusura è `<span class="modal-close" id="swap-close">✕</span>` (riga 50): non è un `<button>`, non si raggiunge con Tab e non ha nome.
   - Utenti: tastiera e lettori di schermo. Non possono chiudere la finestra, e il contenuto sotto resta raggiungibile.
   - Correzione: usare `<dialog>` con `showModal()`, oppure `role="dialog" aria-modal="true" aria-labelledby`. Trasformare la chiusura in `<button aria-label="Chiudi">`. Gestire Esc e il ritorno del focus.
3. **Pulsanti con sola icona, senza nome accessibile** (4.1.2 A, 1.1.1 A).
   - Evidenza: `turni.html:21,23` (◀ ▶), `turni.html:37` (⇄), `dipendenti.html:26-28` (✎ 🗑), `turni.html:50` (✕).
   - I lettori leggono glifi come «black left-pointing triangle» o l'emoji. I pulsanti ✎ e 🗑 sono identici in ogni riga, senza il dipendente nel nome.
   - Correzione: `aria-label` specifico ed esteso al contesto, per esempio «Modifica Giulia R.», «Elimina Luca B.», «Settimana precedente», «Scambia il turno di sabato di Giulia R.».
4. **Campi senza etichetta, solo placeholder** (1.3.1 A, 3.3.2 A, 4.1.2 A).
   - Evidenza: `dipendenti.html:20` (ricerca) e `dipendenti.html:35-48` (14 campi). Nessuna `<label>` né `aria-label`.
   - Il placeholder sparisce quando si scrive e ha basso contrasto. L'asterisco di «obbligatorio» sta solo nel placeholder.
   - Anche `impostazioni.html:31` (`#export-month`) ha «Mese» in un `<p>`, non in una `<label>`.
   - Correzione: `<label for>` visibili. Per i campi obbligatori aggiungere `aria-required="true"` (o `required` senza `novalidate`) e un testo «obbligatorio». Il placeholder può restare solo come esempio.
5. **Tre grafici senza alternativa testuale** (1.1.1 A, 1.4.1 A).
   - Evidenza: `index.html:35-47` (barre), `74-80` (linee costo e incassi), `84-89` (ritardi).
   - Nessuno dei tre ha `role="img"`, `aria-label` o `<title>`; i testi SVG vengono letti in ordine sparso.
   - Il grafico a due assi distingue le serie solo con rosso e verde (riga 77-78). Il testo sotto, «Rosso: costo del lavoro. Verde: incassi.» (riga 81), cita solo i colori.
   - I valori delle barre sono nel paragrafo alla riga 48, ma non c'è un legame programmatico con il grafico. Per le linee e i ritardi non c'è nessuna tabella dei dati.
   - Correzione: `role="img"` con `aria-label` e `aria-describedby` verso una tabella dei dati o un riepilogo. Etichette dirette sulle serie, tratti o marcatori diversi, e assi dichiarati nel testo.
6. **Sessione che scade senza preavviso** (2.2.1 Timing Adjustable, A).
   - Evidenza: `js/app.js:11-12`. `setTimeout` redirige a `/login` dopo 10 minuti.
   - Il commento dice «senza richieste al server», ma il timer non si azzera mai: scade comunque, anche durante la compilazione. Non c'è avviso né possibilità di prolungare.
   - Il modulo di 14 campi a `dipendenti.html` si perde.
   - Correzione: avviso con almeno 20 secondi per prolungare (e almeno 20 ore di sessione, oppure un salvataggio che conservi i dati). Reimpostare il timer a ogni interazione.
7. **Stato espresso solo dal colore** (1.4.1 Use of Color, A).
   - Evidenza: `turni.html:37,40,43` e `css/app.css:54-57`. I pallini presente, in ritardo e assente sono `<span class="dot">` vuoti, senza testo né `aria-label`.
   - La legenda (`turni.html:45`) mostra tre pallini tutti grigi: la legenda stessa non porta il colore (vedi schermata `turni-telefono.png`).
   - Verde e arancione (`#e89b3a`) sono difficili da distinguere in alcune forme di daltonismo.
   - Correzione: aggiungere testo o icona con forma diversa, per esempio «(in ritardo)» nascosto visivamente, e una legenda con i colori reali.
8. **Contrasto del testo insufficiente** (1.4.3 Contrast Minimum, AA). Calcoli approssimati.
   - `--color-muted #9aa0a6` (`css/tokens.css:6`) su bianco: circa 2,6:1; su `#f6f7f9`, circa 2,4:1. Richiesto 4,5:1.
   - Lo usano `.muted` a 13px (`css/app.css:42`), `.kpi-value` a 16px (riga 41, il valore del KPI) e la legenda, il ruolo accanto ai nomi, i sottotitoli e le caption.
   - `.badge-warning` bianco su `#e8a33d` (riga 47 e `css/tokens.css:11`): circa 2,1:1. Colpisce il badge «3» di `impostazioni.html:42`.
   - `.badge-orange` bianco su `#e89b3a`: circa 2,2:1.
   - `.button` bianco su `#2f81f7` (`css/app.css:33`, il pulsante OK della finestra): circa 3,7:1; il testo è a 15px, quindi non è «grande».
   - `--color-danger` è ridefinito a `#e5534b` (`css/tokens.css:31`): bianco sul rosso `.badge-danger`, circa 3,6:1.
   - Correzione: portare il grigio ad almeno `#6b7280` (circa 4,8:1), scurire i colori degli stati e del pulsante oppure usare testo scuro sui colori chiari.

## Rilievi P2
9. **Lingua della pagina errata** (3.1.1 Language of Page, A).
   - Evidenza: `<html lang="en">` in tutte e quattro le pagine, riga 2; il contenuto è in italiano.
   - Correzione: `lang="it"`. I lettori leggono tutto con la pronuncia inglese. Per lo stesso motivo, nel menu «Settings» (riga 12 di ogni pagina) e «Dashboard» sono in inglese in mezzo a un'interfaccia italiana: 3.1.2 Language of Parts è AA, da valutare con il team.
10. **Titolo identico su tutte le pagine** (2.4.2 Page Titled, A).
   - Evidenza: `<title>Turnio</title>` ovunque, riga 6.
   - Il titolo non distingue la pagina corrente. Correzione: «Turni – Turnio», «Squadra – Turnio» e così via.
11. **Errori di compilazione non utilizzabili** (3.3.1 Error Identification A, 3.3.3 Error Suggestion AA, 4.1.3 Status Messages AA).
   - Evidenza: `js/app.js:57-59`. «Hai sbagliato il numero.» non dice quale campo né quale formato.
   - Il formato `\d{10}` rifiuta «333 120 4455», che è come il telefono è scritto nella tabella (`dipendenti.html:26`).
   - Il messaggio è in un `<p class="error" role="alert">` (`dipendenti.html:49`) fuori da `.field`: la regola `.field .error` (`css/app.css:66`) non si applica, quindi il messaggio ha lo stile del testo normale.
   - Il focus non si sposta sul campo errato e il campo non ha `aria-invalid` né `aria-describedby`.
   - `js/app.js:62-66`: con errore del server mostra «Errore 400: payload non valido» e poi `form.reset()` cancella tutto quello che l'utente ha digitato. Questo ricade anche su 3.3.7 Redundant Entry (A): i dati vanno reinseriti.
   - Correzione: messaggio per campo con testo chiaro («Inserisci 10 cifre, anche con spazi»), `aria-invalid`, `aria-describedby`, focus sul primo campo errato. Non svuotare il modulo.
12. **Campi dei dati personali senza `autocomplete`** (1.3.5 Identify Input Purpose, AA).
   - Evidenza: `dipendenti.html:35-48`. Nome, cognome, telefono, email, indirizzo e data di nascita non hanno l'attributo.
   - Può essere un dubbio perché i campi inseriscono i dati di un collega e non dell'utente stesso. Il criterio riguarda dati dell'utente: da confermare se l'operatore inserisce solo dati di terzi.
   - Se resta applicabile: `autocomplete="given-name"`, `family-name`, `tel`, `email`, `street-address`, `bday`.
13. **Toast di conferma senza ruolo e con 1,5 secondi di durata** (4.1.3 Status Messages, AA; 2.2.1 da confermare).
   - Evidenza: `turni.html:58`, `dipendenti.html:53`, `impostazioni.html:56` (`<div class="toast" hidden>`); `js/app.js:3-9`.
   - Manca `role="status"` o `aria-live="polite"`. Il contenuto compare per 1,5 secondi e sparisce: i lettori di schermo non lo annunciano o non fanno in tempo a leggerlo.
   - Il testo è sempre «Fatto!»: non dice cosa è successo. Alcune azioni non danno nessun messaggio: «Elimina settimana» svuota la griglia in silenzio (`js/app.js:22-25`).
   - Correzione: regione live presente nel DOM prima dell'aggiornamento, durata più lunga e testo specifico.
14. **Ricerca e modifiche automatiche senza avviso di stato** (4.1.3 AA; 3.2.2 On Input A, da confermare).
   - Evidenza: `js/app.js:74-79`. Il filtro nasconde le righe senza annunciare il numero di risultati. Con zero risultati la tabella resta vuota, senza messaggio (commento a riga 78).
   - `js/app.js:92-94`: ogni `change` in `#main input` invia un PATCH e non conferma nulla all'utente (la pagina annuncia solo «Le modifiche si salvano da sole», `impostazioni.html:20`). L'utente non sa se il salvataggio è riuscito o è fallito.
   - Correzione: regione di stato con «3 risultati» o «Nessun risultato» e un messaggio di salvataggio riuscito o fallito.
15. **Larghezza fissa che impedisce il reflow** (1.4.10 Reflow, AA).
   - Evidenza: `css/app.css:52` `.week { width: 1100px }`. Sulla schermata `turni-telefono.png` la griglia esce dal viewport e non c'è nessuno scorrimento nel contenitore.
   - Gli SVG hanno `width="560"` fissi (`index.html:35,74,84`) e `width="260"` per la torta (riga 51), che sul telefono eccedono i 320px CSS.
   - Una tabella di dati bidimensionale può essere esente dal reflow, ma qui conviene comunque un contenitore scorrevole con `tabindex="0"` e un nome. Da confermare con le altre schermate che non ho aperto (`dipendenti-telefono.png` e `index-telefono.png`).
   - Correzione: `max-width: 100%` con `height: auto` per gli SVG, contenitore con `overflow-x: auto`.
16. **Griglia dei turni costruita con `<div>`** (1.3.1 Info and Relationships, A).
   - Evidenza: `turni.html:33-44`. Righe e colonne non hanno ruoli: un lettore di schermo legge una sequenza di celle senza intestazioni e senza legame fra giorno e persona.
   - Il rilievo vale anche per la cella che mescola pallino, orario e pulsante (riga 37).
   - Correzione: `<table>` con `<th scope="col">` e `<th scope="row">`, oppure `role="grid"` con celle e intestazioni.
17. **Colonna di intestazione vuota o nascosta** (1.3.1 A, 4.1.2 A).
   - Evidenza: `impostazioni.html:44` ha un `<th>` vuoto, quindi un'intestazione senza nome.
   - `dipendenti.html:24` ha `<span class="muted">Azioni</span>` con contrasto basso. I pulsanti «OK» e «No» in `impostazioni.html:46-48` non dicono quale scambio approvano o rifiutano; la sola riga di tabella non basta come nome.
   - Correzione: nome visibile o visivamente nascosto per l'intestazione e `aria-label` come «Approva lo scambio di Giulia R.».
18. **Il collegamento «Clicca qui» è un pulsante, non un link** (4.1.2 A; 2.4.4 Link Purpose, A, da confermare).
   - Evidenza: `impostazioni.html:32` `<a class="btn btn-secondary" href="#" id="export">Clicca qui</a>`. Non ha comportamento di navigazione né gestione in `app.js`: è un'azione presentata come link, con scopo non chiaro dal testo.
   - Correzione: `<button>` con testo «Esporta le presenze di ottobre 2026», oppure un link che scarica il file reale.
19. **Contrasto di elementi grafici** (1.4.11 Non-text Contrast, AA). Stime.
   - Bordo dei campi `#d8dce1` (`css/app.css:65`) su bianco: circa 1,4:1. Il bordo è l'unico indicatore del campo, quindi serve 3:1.
   - Colori della torta: le sfumature da `#a5d6ff` a `#ddf4ff` (`index.html:57-59`) hanno meno di 1,5:1 rispetto al bianco; le fette adiacenti sono quasi indistinguibili (si distinguono solo dalla legenda con pallini di pari tinta).
   - Pallino arancione (`#e89b3a`) e pallino rosso (`#e5534b`) su bianco: circa 2,2:1 e 3,6:1.
   - Correzione: bordi scuri almeno 3:1, tinte distinguibili con etichette dirette sulle fette.
20. **Il pulsante «Elimina settimana» non chiede conferma ed è stilato come azione primaria** (3.3.4 Error Prevention, AA, da confermare: vale per dati legali o finanziari, qui il dato è una pianificazione).
   - Evidenza: `turni.html:28` usa `btn-primary`, come «Pubblica i turni»; `js/app.js:22-25` cancella senza passaggio di conferma e senza annullamento.
   - Il rilievo è soprattutto di usabilità: da passare ad AIWDA-07 (usabilità). Si segnala qui perché per un utente di tecnologie assistive il rischio è più alto.

## Rilievi P3
21. **Focus e contesto dopo un salvataggio** (3.2.2, da confermare). `js/app.js:31`: `window.location.reload()` dopo «Salva» ricarica la pagina e il focus torna all'inizio, senza avviso. Utile un messaggio di stato e, se serve, il ritorno del focus.
22. **Il cambio settimana non è annunciato** (4.1.3). `turni.html:22`: `#week-label` non è una regione live, e i pulsanti ◀ ▶ non hanno gestori in `app.js`, quindi oggi non fanno nulla; se li si implementa serve l'annuncio.
23. **Emoji come contenuto** (1.1.1). `index.html:23` «🔔 3 scambi da approvare» e `dipendenti.html:26-28`: l'emoji viene letta per esteso. Correzione: `aria-hidden="true"` sull'emoji e testo accanto.
24. **Titoli e nomi non allineati** (2.4.6 Headings and Labels, AA, da confermare). La voce di menu «Squadra» porta a una pagina con `<h1>Personale</h1>` (`dipendenti.html:14,19`); l'h1 di `index.html` e `impostazioni.html` coincide con il menu solo in parte («Settings» contro «Impostazioni»). Riguarda anche chi usa comandi vocali (2.5.3 Label in Name, A: il nome accessibile deve contenere il testo visibile, da controllare sul pulsante icona).
25. **Gerarchia dei titoli** (1.3.1). Le pagine usano h1 e h2 senza salti. In `impostazioni.html` i `<details>` annidati (righe 22-39) funzionano con la tastiera nativa; non ho rilevato problemi, ma l'annidamento a tre livelli è da provare con un lettore di schermo.

## Punti che reggono
- Skip-link presente e visibile al focus (`css/app.css:11-12`); il bersaglio `#main` esiste.
- `<nav aria-label>` con `aria-current="page"` su tutte le pagine, stesso ordine delle voci (3.2.3 rispettato).
- Tabelle con `<caption>` e `<th scope="col">` (`dipendenti.html:23-24`).
- `prefers-reduced-motion` rispettato (`css/tokens.css:35-37`).
- `viewport` senza blocco dello zoom; i testi sono in `px` ma lo zoom del browser funziona.
- `.btn` ha altezza minima 40px, `.icon-btn` circa 30px: soddisfano 2.5.8 Target Size (Minimum). L'unico elemento troppo piccolo è `#swap-close` (✕), già citato nel rilievo 2.
- `<label for>` corretti per i campi di `impostazioni.html:24-25` e `turni.html:53`.
- `role="alert"` su `#form-error` è un punto di partenza corretto, ma vedi il rilievo 11.

## Non coperto da WCAG ma da segnalare
- L'asse del grafico a barre parte da 60 (`index.html:34`, commento «per vedere meglio le differenze»): le barre esagerano le differenze. Non è un criterio WCAG; lo si passa ad AIWDA-06 (dati e grafici).

## Domande aperte
- I campi di `dipendenti.html` inseriscono dati dell'operatore o di un collega? Cambia l'applicabilità di 1.3.5.
- Il timeout di 10 minuti è un requisito di sicurezza? Se sì, serve comunque l'avviso con possibilità di prolungare (2.2.1).
- Per il contrasto e per gli indicatori di focus non ho potuto misurare in un browser: serve una verifica con strumento prima di chiudere i rilievi P1.

Firmato: AIWDA-08 · GACRUX — Senior Accessibility Specialist.
