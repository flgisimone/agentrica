AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

# Revisione di accessibilità di Turnio (WCAG 2.2 AA, sola lettura)

**Esito:** non conforme a WCAG 2.2 AA. Ho trovato 22 rilievi: nessun P0, 9 P1, 10 P2, 3 P3.

Riferimento: scheda di biblioteca wcag-2-2, fonte W3C WAI, WCAG 2.2 (W3C Recommendation del 5 ottobre 2023), verificata il 2026-11-19, da ricontrollare entro il 2027-05-19.

**Cosa ho fatto:**
- Ho letto il codice delle quattro pagine HTML, di `css/app.css`, `css/tokens.css` e `js/app.js`.
- Ho guardato le schermate di turni, dashboard e dipendenti su telefono.
- Ho calcolato i contrasti con la formula WCAG, partendo dai colori dichiarati nei CSS.

**Cosa non ho fatto:**
- Nessun test in un browser, con la tastiera, con un lettore di schermo, con strumenti automatici (axe o Lighthouse) né a 320 px. Le conclusioni su focus, ordine di tabulazione e annunci sono dedotte dal codice.
- Non ho controllato il contrasto dei placeholder, perché dipende dal colore predefinito del browser.
- Questa non è un audit WCAG completo.

**Nota per AIWDA-01 · CANOPUS:** non avevo il tool `agent` e non ho potuto caricare il direttore. Questo rapporto va consolidato da lui.

## Rilievi

**A11Y-01 · P1 · WCAG 2.2, 2.4.7 Focus Visible (AA)**
- Evidenza: `css/app.css:14` contiene `*:focus { outline: none; }`. Toglie l'indicatore di focus a link del menu, pulsanti, campi, `summary` e link link «Clicca qui», e non c'è nessuno stile `:focus-visible` che lo sostituisca.
- Utenti colpiti: chi usa la tastiera o un comando vocale, chi ha poca vista.
- Correzione: togliere la regola e definire `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }`.

**A11Y-02 · P1 · 2.1.1 Keyboard (A), 2.4.3 Focus Order (A), 4.1.2 Name, Role, Value (A)**
- Evidenza: la finestra dello scambio (`turni.html:48-56`, `js/app.js:37-47`).
  - La chiusura «✕» è uno `<span>` (riga 50): non riceve il focus e non ha nome.
  - Manca `role="dialog"`, `aria-modal` e `aria-labelledby`.
  - All'apertura il focus non entra nella finestra e non torna al pulsante ⇄ alla chiusura.
  - Esc non chiude la finestra e il contenuto dietro resta raggiungibile.
  - Da tastiera la finestra si chiude solo confermando lo scambio.
- Utenti colpiti: chi usa la tastiera o un lettore di schermo.
- Correzione: usare `<dialog>` con `showModal()`, un `<button aria-label="Chiudi">` per la chiusura e l'attributo `aria-labelledby` sul titolo, e riportare il focus su ⇄ alla chiusura.

**A11Y-03 · P1 · 4.1.2 Name, Role, Value (A), 1.1.1 Non-text Content (A)**
- Evidenza: i pulsanti fatti solo di icona non hanno un nome accessibile:
  - ✎ e 🗑 in `dipendenti.html:26-28`;
  - ◀ e ▶ in `turni.html:21,23`;
  - ⇄ in `turni.html:37`.
- Il lettore di schermo legge il nome dell'emoji («matita», «cestino») senza dire a chi si riferisce l'azione.
- Correzione: aggiungere `aria-label`, per esempio «Modifica Giulia R.», «Elimina Giulia R.», «Settimana precedente», «Settimana successiva», «Proponi scambio, Giulia R., sabato 7 novembre», e mettere `aria-hidden="true"` sull'emoji.

**A11Y-04 · P1 · 3.1.1 Language of Page (A)**
- Evidenza: `<html lang="en">` alla riga 2 di tutte e quattro le pagine, che però sono in italiano.
- Effetto: il lettore di schermo pronuncia tutto con la fonetica inglese.
- Correzione: `lang="it"`. Al menu «Settings» meglio dare un'etichetta italiana («Impostazioni», che è anche il titolo della pagina); in alternativa `lang="en"` su quel link (3.1.2, P3).

**A11Y-05 · P1 · 3.3.2 Labels or Instructions (A), 1.3.1 Info and Relationships (A)**
- Evidenza: i campi hanno solo il placeholder e nessuna `<label>`:
  - i 14 campi di `dipendenti.html:35-48`, compreso il formato della data;
  - la ricerca in `dipendenti.html:20`;
  - il `<select>` «Mese» in `impostazioni.html:31`, che non è associato al testo vicino.
- Il placeholder sparisce appena si scrive, quindi l'etichetta e il formato richiesto vanno persi.
- Correzione: `<label for>` visibile per ogni campo e formato in un testo di aiuto collegato con `aria-describedby`. Per il mese, `<label for="export-month">Mese</label>`.

**A11Y-06 · P1 · 3.3.1 Error Identification (A), 3.3.3 Error Suggestion (AA)**
- Evidenza in `js/app.js:56-66`:
  - «Hai sbagliato il numero.» non dice quale campo né il formato atteso (10 cifre senza spazi, mentre la tabella mostra «333 120 4455»);
  - «Errore ${status}: payload non valido» non dice cosa correggere;
  - il campo sbagliato non riceve `aria-invalid` né `aria-describedby`;
  - con `novalidate` i campi obbligatori vuoti non vengono segnalati;
  - `form.reset()` alla riga 65 cancella tutti i dati inseriti dopo l'errore.
- Correzione:
  - un messaggio per campo, vicino al campo e collegato, con un suggerimento (es. «Telefono: inserisci 10 cifre, es. 3331204455»);
  - accettare gli spazi;
  - spostare il focus sul primo campo sbagliato;
  - non svuotare il modulo.

**A11Y-07 · P1 · 2.2.1 Timing Adjustable (A)**
- Evidenza: `js/app.js:12` manda a `/login` dopo 10 minuti fissi.
  - Non c'è un avviso e non si può prolungare.
  - Il timer non si azzera con l'attività, contrariamente a quanto dice il commento.
- Effetto: chi compila lentamente il modulo di 14 campi perde i dati.
- Correzione: avvisare almeno 20 secondi prima, con la possibilità di prolungare con un'azione semplice, e azzerare il timer a ogni attività.

**A11Y-08 · P1 · 1.4.3 Contrast (Minimum) (AA)**
- Evidenza, rapporti calcolati (soglia 4,5:1):
  - `--color-muted` #9aa0a6 (`tokens.css:6`): 2,64:1 su bianco e 2,46:1 sullo sfondo #f6f7f9. Lo usano `.muted` a 13 px (`app.css:42`: didascalie, «I campi con * sono obbligatori», la data di aggiornamento, i valori del grafico in `index.html:48`) e `.kpi-value` (`app.css:41`), cioè i numeri principali della dashboard (`index.html:28-30`).
  - Badge di avviso: testo bianco su #e8a33d, 2,16:1 (`impostazioni.html:42`, `app.css:47`).
  - `.button` della finestra dello scambio: bianco su #2f81f7 a 15 px, 3,75:1 (`app.css:33`).
  - Sono invece a norma `.btn-primary` (4,63:1) e `.btn-danger` (5,36:1).
- Correzione:
  - muted almeno #6b7178 (circa 4,9:1 su #f6f7f9, da ricalcolare);
  - testo scuro sul badge di avviso;
  - `.button` sostituito da `.btn-primary`.

**A11Y-09 · P1 · 1.4.1 Use of Color (A), 1.1.1 Non-text Content (A)**
- Evidenza: nei turni lo stato presente / in ritardo / assente è dato solo dal colore del pallino.
  - `turni.html:37-43`: gli `<span class="dot">` sono vuoti e non hanno un'alternativa testuale.
  - La legenda alla riga 45 usa caratteri ● dello stesso colore grigio, quindi non collega nemmeno i colori agli stati.
  - Sui 21 turni, 9 non hanno né pallino né stato.
- Correzione: aggiungere un testo o un'icona di forma diversa per ogni stato (es. «in ritardo»), un testo nascosto per il lettore di schermo e una legenda con pallini colorati veri.

**A11Y-10 · P1 · 1.3.1 Info and Relationships (A)**
- Evidenza: la griglia dei turni (`turni.html:33-44`) è fatta di `<div>` in CSS grid.
- Il lettore di schermo legge una sequenza di testi senza sapere a quale dipendente e a quale giorno appartiene ogni orario.
- Correzione: `<table>` con `<th scope="col">` per i giorni e `<th scope="row">` per i dipendenti.

**A11Y-11 · P2 · 3.3.4 Error Prevention (Legal, Financial, Data) (AA)**
- Evidenza: «Elimina settimana» (`turni.html:28`, `js/app.js:22-25`) cancella i dati senza conferma e senza annullamento, ed è stilato come azione primaria accanto a «Pubblica».
- L'eliminazione del locale (`app.js:86`) chiede conferma, ma con un testo generico.
- Correzione: chiedere conferma dicendo cosa si elimina, oppure offrire l'annullamento, e usare lo stile di pericolo.
- Il criterio va confermato dal revisore: la priorità è P2 e non P1 perché la pagina non ha ancora un server reale.

**A11Y-12 · P2 · 4.1.3 Status Messages (AA)**
- Evidenza:
  - il toast (`js/app.js:3-9`, ogni `<div class="toast">`) non è una regione live e il testo «Fatto!» non viene annunciato;
  - la ricerca con nessun risultato (`app.js:74-79`) non annuncia nulla;
  - il salvataggio automatico delle impostazioni (`app.js:92-94`) non dà conferma.
- Correzione: un contenitore `role="status"` sempre presente nella pagina, testi specifici (es. «Turni pubblicati») e un messaggio «Nessun dipendente trovato» annunciato.
- Il toast sparisce dopo 1,5 s: va valutato anche rispetto al 2.2.1 (criterio da confermare).

**A11Y-13 · P2 · 1.4.11 Non-text Contrast (AA)**
- Evidenza (soglia 3:1):
  - bordo dei campi #d8dce1: 1,38:1 su bianco e 1,29:1 sullo sfondo (`app.css:65`, `tokens.css:9`). Senza etichette visibili il bordo è l'unico modo per riconoscere il campo;
  - pallino «in ritardo» #e89b3a: 2,29:1;
  - spicchi della torta (`index.html:52-59`): fra spicchi vicini da 1,1 a 1,5:1, e #ddf4ff è a 1,14:1 sul bianco.
- Correzione:
  - bordi almeno #8c959f, da ricalcolare;
  - un arancio più scuro;
  - una tavolozza con passi distinti oppure etichette dirette sugli spicchi, con meno categorie.

**A11Y-14 · P2 · 1.4.1 Use of Color (A)**
- Evidenza: nel grafico costo e incassi (`index.html:74-81`) le due linee si distinguono solo per il colore, rosso contro verde (1,05:1 fra loro). La legenda «Rosso: … Verde: …» si basa anche lei sul colore.
- Utenti colpiti: chi distingue male i colori (deuteranopia).
- Correzione: etichette dirette alla fine di ogni linea e tratti diversi (pieno e tratteggiato).

**A11Y-15 · P2 · 1.1.1 Non-text Content (A)**
- Evidenza: gli SVG di `index.html:35`, `74` e `84` non hanno ruolo né nome, e il lettore di schermo legge testi sparsi dentro il grafico.
  - Per «Costo del lavoro e incassi» e «Ritardi per settimana» non c'è nessuna alternativa con i valori.
  - Il grafico delle ore ha un'alternativa testuale (riga 48), ma il contrasto è insufficiente (vedi A11Y-08).
- Correzione: `role="img"` con `aria-label` o `aria-labelledby` che riassuma il dato, e una tabella o un elenco dei valori.

**A11Y-16 · P2 · 2.4.2 Page Titled (A)**
- Evidenza: `<title>Turnio</title>` alla riga 6 di tutte le pagine.
- Correzione: un titolo per pagina, es. «Turni · Turnio», «Personale · Turnio».

**A11Y-17 · P2 · 2.4.4 Link Purpose (In Context) (A), 4.1.2**
- Evidenza: il link «Clicca qui» con `href="#"` (`impostazioni.html:32`). Il suo contesto è solo nel `<summary>`, che non è un titolo, quindi il link non si capisce da solo.
- Correzione: «Esporta le presenze di ottobre 2026». Se l'azione non porta a un'altra pagina, usare un `<button>`.

**A11Y-18 · P2 · 1.4.10 Reflow (AA)**
- Evidenza: larghezze fisse che a 320 px obbligano allo scorrimento orizzontale:
  - `.week` con `width: 1100px` (`app.css:52`);
  - `.modal-box` a 420 px (`app.css:71`);
  - SVG a 560 px (`index.html:35,74,84`).
- Nella schermata del telefono la griglia esce dallo schermo.
- La griglia è una tabella di dati e può rientrare nell'eccezione per i contenuti bidimensionali; la finestra non ci rientra.
- Correzione: `max-width: 100%` sulla finestra e sugli SVG, e la griglia in un contenitore scorrevole con `overflow-x: auto`.

**A11Y-19 · P2 · 2.5.8 Target Size (Minimum) (AA)**
- Evidenza: la «✕» di chiusura (`turni.html:50`) è circa 10×19 px, quindi sotto i 24×24 px. Va misurata nel browser.
- Correzione: pulsante di almeno 24×24 px, insieme alla correzione di A11Y-02.

**A11Y-20 · P3 · 1.3.1 (A) e 2.4.6 Headings and Labels (AA)**
- Evidenza:
  - l'intestazione vuota della colonna azioni (`impostazioni.html:44`);
  - i pulsanti «OK» e «No» (`impostazioni.html:46-48`), che non dicono quale scambio approvano o rifiutano.
- Correzione: intestazione «Azioni» e `aria-label` come «Approva lo scambio di Giulia R. del 7 novembre».

**A11Y-21 · P3 · 3.3.2 (A)**
- Evidenza: le due date del modulo chiedono formati diversi, «gg/mm/aaaa» e «aaaa-mm-gg» (`dipendenti.html:40,46`).
- Correzione: un solo formato, oppure `type="date"`.

**A11Y-22 · P3 · 1.3.5 Identify Input Purpose (AA), criterio da confermare**
- Evidenza: manca `autocomplete` su nome, telefono, email e indirizzo (`dipendenti.html:35-41`).
- Il criterio si applica solo ai dati dell'utente stesso, e qui sono i dati di un dipendente inseriti dal responsabile: probabilmente non è una violazione.
- Correzione: `autocomplete="off"` o i token pertinenti, dopo la conferma del revisore.

## Fuori dal mio perimetro

Li passo ad altri specialisti, non sono rilievi di accessibilità:
- l'asse dei grafici che parte da 60 e il doppio asse (`index.html:34,73`): dataviz;
- il nome «Swap», le etichette «Procedi» e «Settings», e «Personale» nel titolo contro «Squadra» nel menu: UX writing e architettura dell'informazione;
- i 14 campi obbligatori, fra cui IBAN e codice fiscale: usabilità e privacy.

## Domande aperte

1. Esiste un ambiente in cui provare le pagine con tastiera, lettore di schermo e strumenti automatici? Servirebbe a confermare A11Y-01, 02, 12, 18 e 19.
2. Esiste un'esigenza di accessibilità normativa, come l'EN 301 549 o il D.lgs. 82/2022? Non l'ho valutata, perché il compito era limitato a WCAG 2.2 AA.

## JSON

```json
{"project":"Turnio","audit_id":null,"agent":"AIWDA-08 GACRUX","page":{"name":"index, turni, dipendenti, impostazioni + css/ + js/app.js","url":null},
"observations":[
{"id":"A11Y-01","type":"accessibility","title":"Focus rimosso","description":"*:focus{outline:none} senza sostituto (WCAG 2.2, 2.4.7)","evidence":{"url":null,"screenshot":null,"location":"css/app.css:14","steps":[]},"impact":"Chi usa la tastiera non vede dove si trova","priority":"P1","confidence":0.95,"recommendation":":focus-visible con outline 2px","status":"Nuova","requires_human_review":false},
{"id":"A11Y-02","type":"accessibility","title":"Finestra dello scambio inaccessibile","description":"Chiusura su span, nessun role dialog, nessuna gestione del focus né di Esc (2.1.1, 2.4.3, 4.1.2)","evidence":{"url":null,"screenshot":null,"location":"turni.html:48-56; js/app.js:37-47","steps":[]},"impact":"Da tastiera la finestra non si chiude senza confermare","priority":"P1","confidence":0.85,"recommendation":"<dialog> con showModal, button Chiudi, focus restituito","status":"Nuova","requires_human_review":true},
{"id":"A11Y-03","type":"accessibility","title":"Pulsanti icona senza nome","description":"✎ 🗑 ◀ ▶ ⇄ senza aria-label (4.1.2, 1.1.1)","evidence":{"url":null,"screenshot":null,"location":"dipendenti.html:26-28; turni.html:21,23,37","steps":[]},"impact":"Azioni non identificabili con il lettore di schermo","priority":"P1","confidence":0.9,"recommendation":"aria-label con azione e persona","status":"Nuova","requires_human_review":false},
{"id":"A11Y-04","type":"accessibility","title":"lang=en su pagine in italiano","description":"3.1.1","evidence":{"url":null,"screenshot":null,"location":"*.html:2","steps":[]},"impact":"Pronuncia sbagliata","priority":"P1","confidence":0.95,"recommendation":"lang=it","status":"Nuova","requires_human_review":false},
{"id":"A11Y-05","type":"accessibility","title":"Campi senza label","description":"Solo placeholder (3.3.2, 1.3.1)","evidence":{"url":null,"screenshot":"schermate/dipendenti-telefono.png","location":"dipendenti.html:20,35-48; impostazioni.html:31","steps":[]},"impact":"Etichetta e formato persi durante la scrittura","priority":"P1","confidence":0.9,"recommendation":"<label for> visibili e aiuti collegati con aria-describedby","status":"Nuova","requires_human_review":false},
{"id":"A11Y-06","type":"accessibility","title":"Errori del modulo non identificati","description":"Messaggi vaghi, nessun aria-invalid, reset del modulo (3.3.1, 3.3.3)","evidence":{"url":null,"screenshot":null,"location":"js/app.js:56-66","steps":[]},"impact":"Non si capisce cosa correggere; dati persi","priority":"P1","confidence":0.85,"recommendation":"Errore per campo con suggerimento, focus sul campo, niente reset","status":"Nuova","requires_human_review":false},
{"id":"A11Y-07","type":"accessibility","title":"Uscita automatica senza avviso","description":"2.2.1","evidence":{"url":null,"screenshot":null,"location":"js/app.js:12","steps":[]},"impact":"Perdita dei dati per chi è lento","priority":"P1","confidence":0.9,"recommendation":"Avviso e possibilità di prolungare, timer azzerato con l'attività","status":"Nuova","requires_human_review":false},
{"id":"A11Y-08","type":"accessibility","title":"Contrasto del testo insufficiente","description":"muted 2,46-2,64:1, KPI, badge 2,16:1, .button 3,75:1 (1.4.3)","evidence":{"url":null,"screenshot":"schermate/index-telefono.png","location":"tokens.css:6; app.css:33,41,42,47","steps":[]},"impact":"KPI e testi di aiuto illeggibili per chi ha poca vista","priority":"P1","confidence":0.9,"recommendation":"muted >= 4,5:1, testo scuro sul badge","status":"Nuova","requires_human_review":false},
{"id":"A11Y-09","type":"accessibility","title":"Stato dei turni solo a colori","description":"1.4.1, 1.1.1; legenda non colorata","evidence":{"url":null,"screenshot":"schermate/turni-telefono.png","location":"turni.html:37-45","steps":[]},"impact":"Presenze non distinguibili","priority":"P1","confidence":0.9,"recommendation":"Testo o forma per stato","status":"Nuova","requires_human_review":false},
{"id":"A11Y-10","type":"accessibility","title":"Griglia dei turni non semantica","description":"div al posto di table (1.3.1)","evidence":{"url":null,"screenshot":null,"location":"turni.html:33-44","steps":[]},"impact":"Rapporto dipendente/giorno perso","priority":"P1","confidence":0.85,"recommendation":"table con th per riga e colonna","status":"Nuova","requires_human_review":false},
{"id":"A11Y-11","type":"accessibility","title":"Elimina settimana senza conferma","description":"3.3.4, da confermare","evidence":{"url":null,"screenshot":null,"location":"turni.html:28; js/app.js:22-25","steps":[]},"impact":"Cancellazione irreversibile","priority":"P2","confidence":0.7,"recommendation":"Conferma o annullamento","status":"Nuova","requires_human_review":true},
{"id":"A11Y-12","type":"accessibility","title":"Messaggi di stato non annunciati","description":"4.1.3","evidence":{"url":null,"screenshot":null,"location":"js/app.js:3-9,74-79,92-94","steps":[]},"impact":"Esiti non percepiti","priority":"P2","confidence":0.85,"recommendation":"role=status sempre presente","status":"Nuova","requires_human_review":false},
{"id":"A11Y-13","type":"accessibility","title":"Contrasto non testuale","description":"Bordi dei campi 1,29-1,38:1, pallino arancio 2,29:1, spicchi della torta (1.4.11)","evidence":{"url":null,"screenshot":null,"location":"app.css:65; tokens.css:9,32; index.html:52-59","steps":[]},"impact":"Campi e grafici poco distinguibili","priority":"P2","confidence":0.85,"recommendation":"Bordi e colori >= 3:1","status":"Nuova","requires_human_review":false},
{"id":"A11Y-14","type":"accessibility","title":"Linee distinte solo dal colore","description":"1.4.1","evidence":{"url":null,"screenshot":"schermate/index-telefono.png","location":"index.html:74-81","steps":[]},"impact":"Serie confuse da chi distingue male i colori","priority":"P2","confidence":0.9,"recommendation":"Etichette dirette e tratteggio","status":"Nuova","requires_human_review":false},
{"id":"A11Y-15","type":"accessibility","title":"Grafici senza alternativa","description":"1.1.1","evidence":{"url":null,"screenshot":null,"location":"index.html:35,74,84","steps":[]},"impact":"Dati non accessibili con il lettore di schermo","priority":"P2","confidence":0.85,"recommendation":"role=img con nome e tabella dei valori","status":"Nuova","requires_human_review":false},
{"id":"A11Y-16","type":"accessibility","title":"Titoli di pagina uguali","description":"2.4.2","evidence":{"url":null,"screenshot":null,"location":"*.html:6","steps":[]},"impact":"Pagine e schede indistinguibili","priority":"P2","confidence":0.9,"recommendation":"Titolo per pagina","status":"Nuova","requires_human_review":false},
{"id":"A11Y-17","type":"accessibility","title":"Link Clicca qui","description":"2.4.4, 4.1.2","evidence":{"url":null,"screenshot":null,"location":"impostazioni.html:32","steps":[]},"impact":"Scopo del link non chiaro","priority":"P2","confidence":0.85,"recommendation":"Testo descrittivo, button se è un'azione","status":"Nuova","requires_human_review":false},
{"id":"A11Y-18","type":"accessibility","title":"Larghezze fisse","description":"1.4.10","evidence":{"url":null,"screenshot":"schermate/turni-telefono.png","location":"app.css:52,71; index.html:35,74,84","steps":[]},"impact":"Scorrimento orizzontale sul telefono e con lo zoom","priority":"P2","confidence":0.75,"recommendation":"max-width 100%, overflow-x sulla griglia","status":"Nuova","requires_human_review":true},
{"id":"A11Y-19","type":"accessibility","title":"Chiusura troppo piccola","description":"2.5.8, da misurare","evidence":{"url":null,"screenshot":null,"location":"turni.html:50","steps":[]},"impact":"Difficile da toccare","priority":"P2","confidence":0.6,"recommendation":"Pulsante >= 24x24 px","status":"Nuova","requires_human_review":true},
{"id":"A11Y-20","type":"accessibility","title":"OK/No e intestazione vuota","description":"1.3.1, 2.4.6","evidence":{"url":null,"screenshot":null,"location":"impostazioni.html:44-48","steps":[]},"impact":"Azione ambigua fuori contesto","priority":"P3","confidence":0.7,"recommendation":"aria-label specifici, th Azioni","status":"Nuova","requires_human_review":false},
{"id":"A11Y-21","type":"accessibility","title":"Formati di data diversi","description":"3.3.2","evidence":{"url":null,"screenshot":null,"location":"dipendenti.html:40,46","steps":[]},"impact":"Errori di inserimento","priority":"P3","confidence":0.8,"recommendation":"Un solo formato o type=date","status":"Nuova","requires_human_review":false},
{"id":"A11Y-22","type":"accessibility","title":"autocomplete assente","description":"1.3.5 probabilmente non applicabile (dati di terzi)","evidence":{"url":null,"screenshot":null,"location":"dipendenti.html:35-41","steps":[]},"impact":"Basso","priority":"P3","confidence":0.5,"recommendation":"Confermare l'applicabilità","status":"Nuova","requires_human_review":true}],
"tested_scenarios":["Revisione statica del codice di HTML, CSS e JS","Contrasti calcolati dai colori dei CSS","Esame delle schermate di turni, dashboard e dipendenti su telefono"],
"limitations":["Nessun test in un browser, con la tastiera, con un lettore di schermo o con strumenti automatici","Contrasto dei placeholder non verificato","Reflow e dimensioni dei bersagli non misurati","Non è un audit WCAG completo","Direttore AIWDA-01 non caricato (tool agent non disponibile)"],
"summary":"Non conforme a WCAG 2.2 AA: 22 rilievi (0 P0, 9 P1, 10 P2, 3 P3)."}
```

— GACRUX (AIWDA-08)
