AIWDA-06 · ADHARA — Senior Design System Specialist, reparto AIWDA (AI Web Design)

# Rapporto per AIWDA-01 · CANOPUS: verifica del design system di Turnio

**Esito.** Non ci sono rilievi P0, ma ce ne sono 8 P1. Il design system esiste solo in parte. `docs/componenti.md` descrive cinque componenti, ma l'interfaccia ne usa almeno undici. La documentazione promette tre cose che il codice non fa: «tutti i colori dai token», il tema scuro e gli stati di focus e di disattivato. `tokens.css` contiene anche una ridefinizione che cambia in silenzio il rosso di errore.

## Come ho lavorato
- Ho letto i file del progetto in sola lettura e non ho modificato nulla.
- Ho guardato le schermate PNG in `schermate/`. Non ho aperto un browser, quindi hover, focus e finestra aperta non li ho visti: li ho dedotti dal CSS e dal JS.
- I contrasti li ho calcolati con la formula WCAG su coppie di colori esadecimali, senza misurarli nella pagina.
- Biblioteca: scheda `wcag-2-2`, W3C WCAG 2.2, Recommendation del 5 ottobre 2023, verificata il 2026-11-19.
- Non ho caricato AIWDA-01 con il tool `agent` perché non era disponibile in questa sessione: consegno a te.

## Inventario dei componenti osservati

| Componente | Classe e dove | Nella documentazione? |
|---|---|---|
| Pulsante | `.btn` / `-primary` / `-secondary` / `-danger`, in app.css:26-30 | sì |
| Pulsante doppio | `.button` (app.css:33), usato solo in turni.html:54 | no |
| Pulsante icona | `.icon-btn` (app.css:35), in turni.html:21,23,37 e dipendenti.html:26-28 | no |
| Badge | `.badge-*` (app.css:45-49), con la variante `.badge-orange` | in parte |
| Pallino di stato | `.dot-ok`, `.dot-late`, `.dot-absent` (app.css:54-57), in turni.html | no |
| Scheda | `.card` e `.cards` (app.css:38-39) | sì |
| Valore KPI | `.kpi-label` e `.kpi-value` (app.css:40-41) | no |
| Avviso | `.banner` (index.html:22), senza nessuna regola CSS | no |
| Campo | `.field` (app.css:64-66) | sì, ma diverso dal codice |
| Campi senza `.field` | ricerca (dipendenti.html:20), select (turni.html:53, impostazioni.html:31) | no |
| Tabella | `table` (app.css:60-61) | no |
| Griglia della settimana | `.week` (app.css:52-53), griglia di div | no |
| Finestra | `.modal` (app.css:69-72) | sì, ma diversa dal codice |
| Toast | `.toast` (app.css:74) | no |
| Menu | `.nav` (app.css:17-19) | no |
| Testo secondario | `.muted` (app.css:42) | no |
| Colori dei grafici | colori scritti nel codice in index.html | no |

## Rilievi (firmati ADHARA)

### Rilievi P1

**DS-01 (P1). `--color-danger` è definito due volte e i rossi sono due.**
- tokens.css:12 lo definisce `#cf222e`.
- tokens.css:30-33 lo ridefinisce `#e5534b` e aggiunge `--color-late` `#e89b3a`, quasi uguale a `--color-warning` `#e8a33d` (tokens.css:11).
- Così badge, errori dei campi e pallino «assente» usano `#e5534b`, mentre `.btn-danger` scrive a mano `#cf222e` (app.css:30).
- Il testo bianco su `#e5534b` ha contrasto 3,7:1, sotto la soglia di WCAG 2.2, 1.4.3.
- Correzione: eliminare il secondo blocco `:root`, tenere un solo `--color-danger: #cf222e`, togliere `--color-late` e usare `--color-warning`. In app.css:30 scrivere `var(--color-danger)`.

**DS-02 (P1). Il badge di avviso è illeggibile.**
- `.badge-warning` mette testo bianco su `#e8a33d` (app.css:45,47), con contrasto 2,16:1. Fallisce WCAG 2.2, 1.4.3.
- Si vede nel «3» di «Scambi da approvare» (impostazioni.html:42, schermata `impostazioni-computer.png`).
- Correzione: un token `--color-on-warning` uguale a `--color-text` (testo scuro sull'arancio), oppure un arancio più scuro. In entrambi i casi va verificato il contrasto di almeno 4,5:1.

**DS-03 (P1). Il colore `--color-muted` non regge il contrasto, e il problema tocca tutto il prodotto.**
- `#9aa0a6` ha contrasto 2,46:1 sullo sfondo e 2,64:1 sulla superficie. Fallisce WCAG 2.2, 1.4.3.
- Lo usano `.muted` a 13 px (sottotitoli, legende, didascalie, «Azioni») e i valori dei KPI (app.css:41).
- I valori dei KPI hanno anche la gerarchia invertita: l'etichetta è a 18 px in grassetto, il numero a 16 px in grigio (app.css:40-41; vedi `index-computer.png`).
- Correzione: scurire il token fino ad almeno 4,5:1 sullo sfondo `#f6f7f9`. Per i KPI usare un valore in `--font-size-xl` con `--color-text` e un'etichetta in `--font-size-sm`.

**DS-04 (P1). Lo stato di focus non esiste.**
- app.css:14 contiene `*:focus { outline: none; }` e non c'è nessuno stile che lo sostituisca.
- componenti.md:9 dichiara invece lo stato «con il focus da tastiera».
- Fallisce WCAG 2.2, 2.4.7: chi usa la tastiera non vede dove si trova.
- Correzione: eliminare la regola e aggiungere `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }`, valida per tutti i componenti.

**DS-05 (P1). Le varianti del pulsante sono usate contro la regola documentata.**
- In turni.html:27-28 ci sono due `.btn-primary` nella stessa vista.
- «Elimina settimana», che è un'azione distruttiva, usa la variante primaria al posto di `.btn-danger`. Inoltre app.js:22-25 elimina la settimana senza chiedere conferma.
- Questo contraddice componenti.md:7, che chiede una sola azione principale per vista e `.btn-danger` per le azioni distruttive. Vedi `turni-computer.png`.
- Correzione: `btn btn-danger`, separato dalle azioni principali.
- Da passare a CANOPUS per l'usabilità: serve una conferma prima dell'eliminazione.

**DS-06 (P1). Lo stato dei turni è affidato solo al colore, con un componente doppio rispetto al badge.**
- I `.dot-*` di turni.html:37-43 non hanno testo.
- I pallini della legenda in turni.html:45 non hanno classe colore e quindi appaiono tutti grigi: la legenda non spiega nulla (`turni-computer.png`).
- Contraddice componenti.md:14, «il badge ha sempre un testo».
- Fallisce WCAG 2.2, 1.4.1 (livello A).
- Correzione: unificare con `.badge-success`, `.badge-warning` e `.badge-danger` con testo («presente», «in ritardo», «assente»), oppure dare al pallino un testo, anche solo per i lettori di schermo, e una legenda con le stesse classi.
- `.badge-orange` (app.css:49) non è usata e non è documentata: va eliminata.

**DS-07 (P1). Il campo di testo del codice non corrisponde a quello documentato.**
- componenti.md:22-23 vuole un'etichetta visibile e l'errore sotto il campo, collegato.
- In dipendenti.html:35-48 ci sono solo segnaposto e nessuna `<label>`.
- L'errore è unico, in dipendenti.html:49, fuori da `.field`. Il selettore `.field .error` (app.css:66) quindi non lo colora e il messaggio non è collegato con `aria-describedby`.
- La ricerca (dipendenti.html:20) e le select di turni.html:53 e impostazioni.html:31 sono fuori dal componente e restano con lo stile del browser (`dipendenti-computer.png`, campo minuscolo).
- Fallisce WCAG 2.2, 3.3.2 (livello A).
- Correzione: un solo schema `.field` con `label`, controllo e `.error` con `id` richiamato da `aria-describedby`, applicato a tutti i campi.

**DS-08 (P1). La finestra non fa quello che la documentazione dichiara.**
- componenti.md:27 dice: «porta il focus, lo restituisce, si chiude con Esc».
- Nel codice la chiusura è uno `<span>` non raggiungibile da tastiera (turni.html:50). app.js:37-47 non sposta il focus e non gestisce Esc, e manca `role="dialog"` con `aria-modal` e `aria-labelledby`.
- Da tastiera la finestra si può chiudere solo confermando. Fallisce WCAG 2.2, 2.1.1 (livello A).
- In più `width: 420px` (app.css:71) supera i 390 px del telefono.
- Correzione: usare l'elemento `<dialog>` con `showModal()`, che gestisce focus ed Esc, e una chiusura `<button aria-label="Chiudi">`. Larghezza `min(420px, 100% - 2*var(--space-3))`.

### Rilievi P2

**DS-09 (P2). Esiste un secondo pulsante, `.button`.**
- È definito in app.css:32-33 e usato in turni.html:54.
- Ha raggio 20px, colore `#2f81f7` (contrasto 3,7:1 con il bianco a 15 px, fallisce WCAG 2.2, 1.4.3), padding fisso, nessuna altezza minima e nessuno stato.
- Correzione: eliminare la classe e usare `btn btn-primary` con un verbo («Proponi lo scambio»).

**DS-10 (P2). Gli stati del pulsante sono incompleti.**
- C'è l'hover solo su `.btn-primary`, ed è scritto a mano (`#1a5fd0`, app.css:28).
- Non c'è nessuno stile per `:disabled` né per il caricamento, anche se componenti.md:9 dichiara lo stato disattivato.
- Correzione: token `--color-primary-hover` e `--color-danger-hover`, hover su tutte le varianti, `.btn:disabled { opacity: .5; cursor: not-allowed; }` e uno stato `aria-busy` documentato.

**DS-11 (P2). Molti valori in app.css non vengono dai token.**
- Colori: `#1f6feb` (17-19, 27), `#1a5fd0` (28), `#cf222e` (30), `#2f81f7` (33), `#fff` (27, 30, 33, 45, 74).
- Spaziature fuori scala: 22px, 13px e 24px (17), 24px (21), 7px (22, 53), 22px e 13px (23), 13px (38), 6px (35), 12px e 16px (74).
- Dimensioni dei caratteri fuori scala: 15px (18, 33), 17px (23), 18px (35, 40), 13px (42), 14px (53), 16px (41).
- Correzione: portare tutto sui token esistenti (13 e 15 diventano 16, cioè `--space-3`; 22 e 24 diventano `--space-4`; 7 e 6 diventano `--space-2`) e aggiungere `--color-on-primary`. Se servono, aggiungere `--font-size-xs` e `--space-5`, dopo una decisione su quanti livelli tenere nelle scale.

**DS-12 (P2). Il tema scuro dichiarato non esiste.**
- componenti.md:3 dice che tutti i componenti supportano il tema scuro.
- tokens.css non contiene `prefers-color-scheme` e i colori scritti a mano lo renderebbero comunque impossibile.
- Correzione: togliere la frase dalla documentazione oppure pianificare il tema scuro dopo DS-11.

**DS-13 (P2). Il pulsante icona non è documentato e non ha nome accessibile.**
- `◀ ▶ ⇄ ✎ 🗑` in turni.html:21,23,37 e dipendenti.html:26-28 non hanno `aria-label`. Fallisce WCAG 2.2, 4.1.2.
- Correzione: documentare `.icon-btn` con `aria-label` obbligatorio e `title`, e un'area cliccabile di almeno 24×24 px (WCAG 2.2, 2.5.8). Oggi è circa 30 px, ma non è garantita.
- Da far confermare all'Accessibility Specialist.

**DS-14 (P2). Ci sono due schemi di tabella.**
- dipendenti.html e impostazioni.html usano `table`.
- La settimana è una griglia di `div` con larghezza fissa 1100px (app.css:52) e senza semantica di tabella.
- Sul telefono esce dallo schermo (`turni-telefono.png`).
- Correzione: una `table` con `th scope` dentro un contenitore `overflow-x: auto` e la larghezza tolta.

**DS-15 (P2). Il toast non è documentato e non viene annunciato.**
- Il contenitore in turni.html:58 non ha `role="status"`, i valori sono scritti a mano (app.css:74) e il testo è «Fatto!».
- Correzione: documentare il componente con `role="status"`, i token e messaggi che dicono l'esito.

**DS-16 (P2). I colori dei grafici sono scritti nell'HTML.**
- index.html:36-87 e la legenda in index.html:62-69 usano otto azzurri, `#cf222e` e `#1a7f37` scritti a mano.
- Il rosso e il verde dei grafici sono gli stessi colori degli stati di errore e di successo, ma qui hanno un altro significato.
- Correzione: una palette dati nei token (`--chart-1…n`), distinta dai colori di stato.
- Da passare al Data Visualization Designer per il contenuto dei grafici.

### Rilievi P3

**DS-17 (P3). Il componente avviso manca.**
- `.banner` in index.html:22 non ha nessuna regola CSS e ripiega su `.card` con un'emoji.
- Correzione: un componente `.alert` documentato, con le varianti informazione, avviso ed errore, e un link all'azione.

**DS-18 (P3). Le azioni di approvazione non si distinguono.**
- «OK» e «No» in impostazioni.html:46-48 sono tutte e due `.btn-secondary`.
- I link con l'aspetto di pulsanti in impostazioni.html:32,36 hanno `href="#"`.
- Correzione: «Approva» come primario o secondario e «Rifiuta» come secondario; per i download un `<a download>` documentato come variante di link.

## Le correzioni con più effetto su tutto il prodotto
1. **tokens.css** (DS-01, DS-02, DS-03): con tre righe si correggono badge, errori e testo secondario in tutte e quattro le pagine.
2. **La regola di focus in app.css:14** (DS-04): una riga che vale per tutti i controlli.
3. **Solo token in app.css** (DS-11), che serve anche da base per il tema scuro (DS-12).
4. **Un pulsante solo** (DS-05, DS-09, DS-10), **un campo solo** (DS-07) e **gli stati con il testo** (DS-06).
5. **La documentazione**: aggiungere icon-btn, tabella, toast, avviso, menu, KPI e palette dei grafici, e allineare finestra e campo al codice corretto.

## Domande aperte per l'utente, tramite CANOPUS
- Il tema scuro è un requisito o va tolto dalla documentazione?
- Lo stato dei turni va mostrato con i badge, cioè con il testo nella cella, o con il pallino più un'etichetta solo per i lettori di schermo?
- La scala delle spaziature e dei caratteri va estesa (13 e 15 px) o i valori vanno ricondotti a quella attuale?

## JSON

```json
{
  "project": "Turnio pannello web",
  "audit_id": null,
  "agent": "AIWDA-06 ADHARA",
  "page": {"name": "Design system (token, stili, componenti)", "url": "css/tokens.css, css/app.css, docs/componenti.md"},
  "observations": [
    {"id":"DS-01","type":"consistency","title":"--color-danger ridefinito, due rossi","description":"tokens.css:30-33 sovrascrive #cf222e con #e5534b e aggiunge --color-late quasi uguale a --color-warning; .btn-danger scrive a mano #cf222e (app.css:30). Bianco su #e5534b ha contrasto 3,7:1.","evidence":{"url":"css/tokens.css","screenshot":"schermate/turni-computer.png","location":"tokens.css:12, 29-33; app.css:30,48,57,66","steps":["Leggere i due blocchi :root"]},"impact":"Errori e stati in un rosso diverso da quello dei pulsanti distruttivi, testo dei badge poco leggibile","priority":"P1","confidence":0.95,"recommendation":"Eliminare il secondo :root, un solo --color-danger #cf222e, var() in .btn-danger, --color-late sostituito da --color-warning","status":"Nuova","requires_human_review":false},
    {"id":"DS-02","type":"accessibility","title":"Badge di avviso con testo bianco illeggibile","description":"Bianco su #e8a33d: 2,16:1 (WCAG 2.2, 1.4.3)","evidence":{"url":"impostazioni.html","screenshot":"schermate/impostazioni-computer.png","location":"app.css:45,47; impostazioni.html:42","steps":["Guardare il badge 3 di Scambi da approvare"]},"impact":"Il numero degli scambi in attesa è poco leggibile","priority":"P1","confidence":0.9,"recommendation":"Token --color-on-warning scuro o un arancio più scuro, contrasto ≥4,5:1","status":"Nuova","requires_human_review":false},
    {"id":"DS-03","type":"accessibility","title":"--color-muted sotto il contrasto e KPI con gerarchia invertita","description":"#9aa0a6 ha 2,46:1 sullo sfondo e 2,64:1 sulla superficie; i valori KPI sono in muted a 16 px sotto etichette a 18 px in grassetto","evidence":{"url":"index.html","screenshot":"schermate/index-computer.png","location":"tokens.css:6; app.css:40-42","steps":["Guardare le schede dei Numeri della settimana"]},"impact":"I numeri principali e i testi secondari sono poco leggibili in tutte le pagine","priority":"P1","confidence":0.9,"recommendation":"Scurire il token fino a ≥4,5:1; valore KPI in font-size-xl con color-text, etichetta in font-size-sm","status":"Nuova","requires_human_review":false},
    {"id":"DS-04","type":"accessibility","title":"Focus rimosso a livello globale","description":"*:focus { outline: none } senza sostituto, mentre la documentazione dichiara lo stato di focus (WCAG 2.2, 2.4.7)","evidence":{"url":"css/app.css","screenshot":null,"location":"app.css:14; componenti.md:9","steps":["Leggere app.css:14"]},"impact":"Chi usa la tastiera non vede dove si trova","priority":"P1","confidence":0.9,"recommendation":"Eliminare la regola e aggiungere :focus-visible con outline 2px var(--color-primary)","status":"Nuova","requires_human_review":true},
    {"id":"DS-05","type":"consistency","title":"Azione distruttiva in variante primaria, due primarie nella stessa vista","description":"Elimina settimana è btn-primary accanto a Pubblica, contro componenti.md:7","evidence":{"url":"turni.html","screenshot":"schermate/turni-computer.png","location":"turni.html:27-28","steps":["Aprire Turni"]},"impact":"Rischio di eliminare la settimana per errore; app.js:22-25 non chiede conferma","priority":"P1","confidence":0.95,"recommendation":"btn-danger separato dalle azioni principali; conferma da valutare con la parte di usabilità","status":"Nuova","requires_human_review":false},
    {"id":"DS-06","type":"accessibility","title":"Stato dei turni solo a colore, componente doppio del badge","description":".dot-* senza testo; i pallini della legenda sono senza classe e appaiono grigi (WCAG 2.2, 1.4.1); .badge-orange non documentata e non usata","evidence":{"url":"turni.html","screenshot":"schermate/turni-computer.png","location":"turni.html:37-45; app.css:49,54-57","steps":["Confrontare i pallini con la legenda"]},"impact":"Il responsabile non distingue presente, in ritardo e assente","priority":"P1","confidence":0.9,"recommendation":"Usare i badge con testo, o il pallino con testo per i lettori di schermo e una legenda con le stesse classi; eliminare .badge-orange","status":"Nuova","requires_human_review":false},
    {"id":"DS-07","type":"consistency","title":"Campo del codice diverso da quello documentato","description":"Solo segnaposto senza label, errore unico fuori da .field e non collegato, campi fuori dal componente (WCAG 2.2, 3.3.2)","evidence":{"url":"dipendenti.html","screenshot":"schermate/dipendenti-computer.png","location":"dipendenti.html:20,35-49; turni.html:53; impostazioni.html:31; app.css:66","steps":["Aprire Squadra e guardare il modulo"]},"impact":"Le etichette spariscono durante la digitazione, l'errore non è riconoscibile","priority":"P1","confidence":0.9,"recommendation":"Un solo schema .field con label, controllo e .error collegato con aria-describedby","status":"Nuova","requires_human_review":false},
    {"id":"DS-08","type":"accessibility","title":"Finestra senza focus, senza Esc e senza chiusura da tastiera","description":"La chiusura è uno span; app.js non gestisce focus ed Esc; manca role=dialog; larghezza fissa 420px (WCAG 2.2, 2.1.1)","evidence":{"url":"turni.html","screenshot":null,"location":"turni.html:48-56; app.js:37-47; app.css:71","steps":["Leggere il markup e il JS della finestra dello scambio"]},"impact":"Da tastiera si può solo confermare; sul telefono la finestra esce dallo schermo","priority":"P1","confidence":0.85,"recommendation":"<dialog> con showModal(), chiusura <button aria-label='Chiudi'>, larghezza fluida","status":"Nuova","requires_human_review":true},
    {"id":"DS-09","type":"consistency","title":"Pulsante doppio .button","description":"Raggio 20px, colore #2f81f7 (contrasto 3,7:1), nessuno stato","evidence":{"url":"turni.html","screenshot":null,"location":"app.css:32-33; turni.html:54","steps":[]},"impact":"Un pulsante diverso dagli altri e poco leggibile","priority":"P2","confidence":0.95,"recommendation":"Eliminare la classe e usare btn btn-primary con un verbo","status":"Nuova","requires_human_review":false},
    {"id":"DS-10","type":"consistency","title":"Stati del pulsante incompleti","description":"Hover solo sulla variante primaria e scritto a mano; niente stile disabled né caricamento","evidence":{"url":"css/app.css","screenshot":null,"location":"app.css:26-30","steps":[]},"impact":"Nessun riscontro sulle azioni secondarie e distruttive","priority":"P2","confidence":0.9,"recommendation":"Token per l'hover, hover su tutte le varianti, :disabled e aria-busy documentati","status":"Nuova","requires_human_review":false},
    {"id":"DS-11","type":"consistency","title":"Valori fuori dai token","description":"Colori, spaziature e dimensioni dei caratteri scritti a mano in app.css alle righe 17-19, 21-23, 27-28, 30, 33, 35, 38, 40-42, 45, 52-54, 71, 74","evidence":{"url":"css/app.css","screenshot":null,"location":"vedi righe","steps":[]},"impact":"Ogni cambio di token resta parziale","priority":"P2","confidence":0.95,"recommendation":"Ricondurre i valori alle scale esistenti, aggiungere --color-on-primary","status":"Nuova","requires_human_review":false},
    {"id":"DS-12","type":"consistency","title":"Tema scuro dichiarato ma assente","description":"componenti.md:3 lo dichiara, tokens.css non ha prefers-color-scheme","evidence":{"url":"docs/componenti.md","screenshot":null,"location":"componenti.md:3; tokens.css","steps":[]},"impact":"La documentazione non è affidabile","priority":"P2","confidence":0.95,"recommendation":"Togliere la frase o pianificare il tema scuro dopo DS-11","status":"Nuova","requires_human_review":false},
    {"id":"DS-13","type":"accessibility","title":"Pulsante icona non documentato e senza nome","description":"I pulsanti ◀ ▶ ⇄ ✎ 🗑 non hanno aria-label (WCAG 2.2, 4.1.2)","evidence":{"url":"turni.html, dipendenti.html","screenshot":null,"location":"turni.html:21,23,37; dipendenti.html:26-28","steps":[]},"impact":"Azioni senza nome per i lettori di schermo","priority":"P2","confidence":0.85,"recommendation":"Documentare .icon-btn con aria-label obbligatorio e area ≥24px","status":"Nuova","requires_human_review":true},
    {"id":"DS-14","type":"consistency","title":"Due schemi di tabella, settimana a larghezza fissa","description":"La griglia della settimana è fatta di div con width 1100px","evidence":{"url":"turni.html","screenshot":"schermate/turni-telefono.png","location":"app.css:52-53; turni.html:33-44","steps":["Aprire Turni sul telefono"]},"impact":"Sul telefono la griglia esce dallo schermo; manca la semantica di tabella","priority":"P2","confidence":0.85,"recommendation":"Una table in un contenitore overflow-x:auto","status":"Nuova","requires_human_review":false},
    {"id":"DS-15","type":"consistency","title":"Toast non documentato e non annunciato","description":"Manca role=status, i valori sono scritti a mano","evidence":{"url":"turni.html","screenshot":null,"location":"app.css:74; turni.html:58","steps":[]},"impact":"L'esito delle azioni non viene annunciato","priority":"P2","confidence":0.85,"recommendation":"Documentare il componente, role=status, token","status":"Nuova","requires_human_review":false},
    {"id":"DS-16","type":"data_visualization","title":"Palette dei grafici scritta nell'HTML","description":"Otto azzurri, rosso e verde scritti a mano; gli stessi rossi e verdi degli stati usati con un altro significato","evidence":{"url":"index.html","screenshot":"schermate/index-computer.png","location":"index.html:36-87","steps":[]},"impact":"Colori dei grafici incoerenti e difficili da mantenere","priority":"P2","confidence":0.85,"recommendation":"Token --chart-n distinti dai colori di stato","status":"Nuova","requires_human_review":false},
    {"id":"DS-17","type":"consistency","title":"Manca il componente avviso","description":".banner senza CSS, ripiega su .card con un'emoji","evidence":{"url":"index.html","screenshot":"schermate/index-computer.png","location":"index.html:22","steps":[]},"impact":"L'avviso non si distingue dalle schede","priority":"P3","confidence":0.8,"recommendation":"Componente .alert con varianti e link all'azione","status":"Nuova","requires_human_review":false},
    {"id":"DS-18","type":"consistency","title":"Approva e rifiuta indistinti, link con aspetto di pulsante","description":"OK e No sono tutti e due btn-secondary; link con href='#'","evidence":{"url":"impostazioni.html","screenshot":null,"location":"impostazioni.html:32,36,46-48","steps":[]},"impact":"Scelte difficili da distinguere","priority":"P3","confidence":0.8,"recommendation":"Varianti diverse con verbi; variante di link per i download","status":"Nuova","requires_human_review":false}
  ],
  "tested_scenarios": ["Lettura di tokens.css, app.css, componenti.md e delle quattro pagine HTML e di app.js", "Esame delle schermate su computer e telefono di Turni, Impostazioni, Squadra e Cruscotto", "Calcolo dei contrasti con la formula WCAG"],
  "limitations": ["Nessun browser: hover, focus e finestra aperta non osservati", "Contrasti calcolati dai valori esadecimali, non misurati nella pagina", "Il direttore AIWDA-01 non è stato caricato perché il tool agent non era disponibile"],
  "summary": "Design system parziale: 5 componenti documentati contro circa 11 in uso; ridefinizione di --color-danger; token warning e muted sotto il contrasto; focus rimosso; pulsante, campo e finestra diversi dalla documentazione; tema scuro dichiarato ma assente."
}
```

— ADHARA (AIWDA-06)
