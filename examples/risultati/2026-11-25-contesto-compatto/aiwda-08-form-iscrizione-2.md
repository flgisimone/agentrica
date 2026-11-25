AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

Lavoro sul compito che mi ha assegnato AIWDA-01 · CANOPUS: verificare l'accessibilità della pagina di iscrizione (`form-iscrizione-2`) rispetto alle WCAG 2.2 AA.

**Segnalazione immediata, P0.** Chi usa solo la tastiera non riesce a iscriversi, perché il pulsante «Iscrivimi» è un `<div>` che risponde solo al clic (index.html:24, app.js:4). I dettagli sono nel rilievo A11Y-01.

## Esito

La pagina è statica (index.html, style.css, app.js, logo.svg, README.md). L'ho analizzata solo leggendo il codice. Non ho aperto il browser e non ho usato un lettore di schermo, la tastiera reale o strumenti automatici come axe o Lighthouse. Ho calcolato i contrasti a mano con la formula WCAG della luminanza relativa.

Ho trovato 1 rilievo P0, 3 P1 e 6 P2. Struttura dei titoli (un solo `h1`, index.html:14), landmark (`header` e `main`) e `title` della pagina sono a posto. Il contrasto del testo bianco sul pulsante blu (#fff su #2b59c3, circa 6,3:1) supera la soglia. Questo non è un audit WCAG completo.

## Rilievi per priorità

**A11Y-01 · P0 · Il pulsante di invio non si raggiunge e non si usa da tastiera**
- Criteri: 2.1.1 Keyboard (A) e 4.1.2 Name, Role, Value (A).
- Evidenza:
  - index.html:24 `<div class="button" id="submit">Iscrivimi</div>` non ha `tabindex`, `role` né gestione dei tasti.
  - app.js:4 ascolta solo `click`.
  - Il form (index.html:16) non ha un pulsante di invio. Con due campi di testo, il tasto Invio non invia il form in modo implicito, e anche se lo facesse non passerebbe dal gestore JS.
- Utenti colpiti: chi usa la tastiera, il lettore di schermo, il controllo vocale o un sensore a pulsante. Il lettore di schermo non lo annuncia come pulsante.
- Impatto: l'iscrizione, cioè il compito principale della pagina, è impossibile per questi utenti.
- Correzione: usare un `<button type="submit">` vero e gestire l'evento `submit` del form.

**A11Y-02 · P1 · I campi non hanno etichette: solo placeholder, e l'obbligo di compilarli non è indicato**
- Criteri: 1.3.1 Info and Relationships (A), 3.3.2 Labels or Instructions (A) e 4.1.2 Name, Role, Value (A) per il `select`.
- Evidenza:
  - index.html:17-18: gli `input` hanno solo `placeholder`, senza `<label>`.
  - index.html:19-23: il `select` non ha nessun nome accessibile. «Turno» è un'opzione, non un'etichetta.
  - app.js:7 rende obbligatori tutti i campi, ma nell'HTML non c'è `required` né un'indicazione visibile.
- Utenti colpiti:
  - chi usa il lettore di schermo o il controllo vocale;
  - persone con difficoltà cognitive o di memoria, perché il placeholder sparisce quando si scrive.
- Correzione: aggiungere un `<label for>` visibile per ogni campo, segnare i campi obbligatori nel testo e con `required` o `aria-required`.

**A11Y-03 · P1 · L'indicatore del focus è rimosso**
- Criterio: 2.4.7 Focus Visible (AA).
- Evidenza: style.css:37-41 `input:focus, select:focus, .button:focus { outline: none; }`, senza nessuno stile alternativo.
- Utenti colpiti: chi naviga da tastiera, che non vede dove si trova.
- Correzione: togliere la regola, oppure sostituirla con un indicatore ben visibile (per esempio `:focus-visible` con un outline a contrasto adeguato).

**A11Y-04 · P1 · Gli errori sono segnalati solo con il bordo rosso, senza testo**
- Criteri: 3.3.1 Error Identification (A), 1.4.1 Use of Color (A) e 3.3.3 Error Suggestion (AA) per l'email.
- Evidenza:
  - app.js:9 aggiunge solo la classe `invalid`, che style.css:43-45 rende con `border-color: #d00`.
  - Non c'è un messaggio, né `aria-invalid` o `aria-describedby`, e il focus non va al primo errore.
  - app.js:12 interrompe l'invio senza dire niente.
- Utenti colpiti: chi usa il lettore di schermo, persone con daltonismo e chi ipovede (il bordo rosso è sottile).
- Impatto: l'utente non sa perché l'iscrizione non parte.
- Correzione: mostrare un messaggio di testo vicino al campo, collegato con `aria-describedby`, impostare `aria-invalid="true"`, portare il focus al primo errore e, per l'email, indicare il formato atteso.

**A11Y-05 · P2 · Il testo informativo ha un contrasto insufficiente**
- Criterio: 1.4.3 Contrast (Minimum) (AA).
- Evidenza: style.css:19-22 `.hint { color: #aaa; font-size: 14px; }` su `#fff` (style.css:5). Il contrasto calcolato è circa 2,3:1, contro i 4,5:1 richiesti. Il testo interessato è index.html:15 («I posti sono 30…»).
- Utenti colpiti: chi ipovede e chi usa schermi con molta luce.
- Correzione: usare un grigio più scuro, almeno #767676 su bianco.

**A11Y-06 · P2 · Il bordo dei campi ha un contrasto insufficiente**
- Criterio: 1.4.11 Non-text Contrast (AA). Da confermare in browser, perché dipende da quanto il bordo serve a riconoscere il campo.
- Evidenza: style.css:33 `border: 1px solid #ccc` su `#fff`, circa 1,6:1 contro i 3:1 richiesti.
- Utenti colpiti: chi ipovede, che fatica a distinguere dove sono i campi.
- Correzione: usare un bordo di almeno 3:1, per esempio #949494 o più scuro.

**A11Y-07 · P2 · Il messaggio di conferma non viene annunciato**
- Criterio: 4.1.3 Status Messages (AA).
- Evidenza:
  - index.html:26 `<p id="done" hidden>` non ha `role="status"` né `aria-live`.
  - app.js:13-14 nasconde il form e mostra il messaggio senza spostare il focus, quindi il focus si perde.
- Utenti colpiti: chi usa il lettore di schermo, che non sa se l'iscrizione è andata a buon fine.
- Correzione: mettere il messaggio in una regione `role="status"`, oppure portarci il focus (con `tabindex="-1"`).

**A11Y-08 · P2 · Il logo non ha un'alternativa testuale**
- Criterio: 1.1.1 Non-text Content (A).
- Evidenza: index.html:11 `<img src="logo.svg" …>` non ha `alt`. Il logo contiene il testo «Officina» (logo.svg:1), e il lettore di schermo rischia di leggere il nome del file.
- Correzione: aggiungere `alt="Officina"`, oppure `alt=""` se il nome dell'organizzazione è già presente come testo.

**A11Y-09 · P2 · La lingua della pagina non è dichiarata**
- Criterio: 3.1.1 Language of Page (A).
- Evidenza: index.html:2 `<html>` non ha `lang`.
- Utenti colpiti: chi usa il lettore di schermo, che può leggere il testo italiano con la pronuncia sbagliata.
- Correzione: `<html lang="it">`.

**A11Y-10 · P2 · Nome ed email non hanno `autocomplete`**
- Criterio: 1.3.5 Identify Input Purpose (AA).
- Evidenza: index.html:17-18 non hanno `autocomplete`.
- Utenti colpiti: persone con disabilità cognitive o motorie, che non hanno il riempimento automatico e l'adattamento dei campi.
- Correzione: `autocomplete="name"` e `autocomplete="email"`.

## Test non eseguiti e limiti

- Non ho fatto prove in browser, con la tastiera reale, con un lettore di schermo (NVDA, VoiceOver) o con strumenti automatici. I rilievi vengono dalla sola lettura del codice.
- Non ho verificato: zoom al 200% e reflow a 320 px (1.4.4, 1.4.10), spaziatura del testo (1.4.12), contrasto del testo placeholder (dipende dal browser), dimensione dei bersagli (2.5.8) e resa in modalità a contrasto elevato.
- I contrasti sono calcolati a mano con la formula WCAG. Vanno confermati con uno strumento.
- Biblioteca del reparto: in questa prova non ho potuto leggere le schede wcag-2-2, en-301-549-v4 e accessibilita-prodotti-servizi, perché il tool library era escluso, e non avevo accesso al web. Ho preso i criteri da WCAG 2.2 (W3C Recommendation del 5 ottobre 2023, come la indica l'indice della biblioteca), ma i riferimenti vanno controllati sulla scheda o sulla fonte ufficiale.
- `requires_human_review` vale true per A11Y-06 (dipende dall'interpretazione del criterio) e, in generale, per la conferma in browser.

## Backlog JSON

```json
{
  "project": "form-iscrizione",
  "audit_id": null,
  "agent": "AIWDA-08 · GACRUX",
  "page": { "name": "Iscrizione al workshop", "url": "index.html" },
  "observations": [
    { "id": "A11Y-01", "type": "accessibility", "title": "Pulsante di invio non utilizzabile da tastiera", "description": "Il pulsante «Iscrivimi» è un div senza tabindex, role né gestione dei tasti; il gestore ascolta solo click; il form non ha un pulsante di invio. WCAG 2.1.1 (A), 4.1.2 (A).", "evidence": { "url": "index.html", "screenshot": null, "location": "index.html:24; app.js:4", "steps": ["Aprire index.html", "Premere Tab fino alla fine del form: il pulsante non riceve il focus", "Invio nei campi: nessun invio"] }, "impact": "Chi usa tastiera o tecnologie assistive non può iscriversi", "priority": "P0", "confidence": 0.95, "recommendation": "Usare <button type=\"submit\"> e gestire l'evento submit del form", "status": "Nuova", "requires_human_review": false },
    { "id": "A11Y-02", "type": "accessibility", "title": "Campi senza etichette, obbligo non indicato", "description": "Input con solo placeholder, select senza nome accessibile, campi obbligatori senza indicazione. WCAG 1.3.1 (A), 3.3.2 (A), 4.1.2 (A).", "evidence": { "url": "index.html", "screenshot": null, "location": "index.html:17-23; app.js:7", "steps": ["Leggere il markup del form: non ci sono elementi label né required"] }, "impact": "Chi usa il lettore di schermo non sa cosa chiede il select; l'etichetta sparisce quando si scrive", "priority": "P1", "confidence": 0.9, "recommendation": "Label visibile collegata con for/id per ogni campo; segnalare l'obbligo nel testo e con required", "status": "Nuova", "requires_human_review": false },
    { "id": "A11Y-03", "type": "accessibility", "title": "Indicatore del focus rimosso", "description": "outline: none su input, select e .button senza uno stile alternativo. WCAG 2.4.7 (AA).", "evidence": { "url": "style.css", "screenshot": null, "location": "style.css:37-41", "steps": ["Leggere la regola :focus in style.css"] }, "impact": "Chi naviga da tastiera non vede dove si trova", "priority": "P1", "confidence": 0.9, "recommendation": "Togliere la regola o sostituirla con un :focus-visible ben visibile", "status": "Nuova", "requires_human_review": false },
    { "id": "A11Y-04", "type": "accessibility", "title": "Errori segnalati solo dal colore del bordo", "description": "La validazione aggiunge solo un bordo rosso, senza messaggio, aria-invalid o spostamento del focus. WCAG 3.3.1 (A), 1.4.1 (A), 3.3.3 (AA).", "evidence": { "url": "index.html", "screenshot": null, "location": "app.js:9-12; style.css:43-45", "steps": ["Premere Iscrivimi con i campi vuoti: compare solo il bordo rosso"] }, "impact": "L'utente non capisce perché l'invio non parte", "priority": "P1", "confidence": 0.9, "recommendation": "Messaggio di testo per ogni campo collegato con aria-describedby, aria-invalid, focus sul primo errore, formato email atteso", "status": "Nuova", "requires_human_review": false },
    { "id": "A11Y-05", "type": "accessibility", "title": "Contrasto insufficiente del testo informativo", "description": "#aaa su #fff, circa 2,3:1 contro 4,5:1 richiesto, a 14px. WCAG 1.4.3 (AA).", "evidence": { "url": "index.html", "screenshot": null, "location": "style.css:19-22; index.html:15", "steps": ["Calcolare il contrasto fra #aaa e #fff"] }, "impact": "Chi ipovede fatica a leggere posti e tempi della conferma", "priority": "P2", "confidence": 0.9, "recommendation": "Grigio di almeno #767676 su bianco", "status": "Nuova", "requires_human_review": false },
    { "id": "A11Y-06", "type": "accessibility", "title": "Contrasto insufficiente del bordo dei campi", "description": "Bordo #ccc su #fff, circa 1,6:1 contro 3:1 richiesto. WCAG 1.4.11 (AA), da confermare.", "evidence": { "url": "index.html", "screenshot": null, "location": "style.css:33", "steps": ["Calcolare il contrasto fra #ccc e #fff"] }, "impact": "Chi ipovede distingue a fatica i campi", "priority": "P2", "confidence": 0.7, "recommendation": "Bordo con contrasto di almeno 3:1", "status": "Nuova", "requires_human_review": true },
    { "id": "A11Y-07", "type": "accessibility", "title": "Messaggio di conferma non annunciato", "description": "#done compare senza role=status né aria-live; il form viene nascosto e il focus si perde. WCAG 4.1.3 (AA).", "evidence": { "url": "index.html", "screenshot": null, "location": "index.html:26; app.js:13-14", "steps": ["Leggere il markup di #done e il gestore in app.js"] }, "impact": "Chi usa il lettore di schermo non sa se l'iscrizione è andata a buon fine", "priority": "P2", "confidence": 0.85, "recommendation": "role=\"status\" sul messaggio o focus spostato sul messaggio", "status": "Nuova", "requires_human_review": false },
    { "id": "A11Y-08", "type": "accessibility", "title": "Logo senza alt", "description": "img del logo senza attributo alt; il logo contiene il testo «Officina». WCAG 1.1.1 (A).", "evidence": { "url": "index.html", "screenshot": null, "location": "index.html:11; logo.svg:1", "steps": ["Leggere il tag img in index.html"] }, "impact": "Il lettore di schermo può leggere il nome del file o niente", "priority": "P2", "confidence": 0.9, "recommendation": "alt=\"Officina\"", "status": "Nuova", "requires_human_review": false },
    { "id": "A11Y-09", "type": "accessibility", "title": "Lingua della pagina non dichiarata", "description": "html senza attributo lang. WCAG 3.1.1 (A).", "evidence": { "url": "index.html", "screenshot": null, "location": "index.html:2", "steps": ["Leggere il tag html"] }, "impact": "Il lettore di schermo può pronunciare il testo italiano in modo errato", "priority": "P2", "confidence": 0.95, "recommendation": "<html lang=\"it\">", "status": "Nuova", "requires_human_review": false },
    { "id": "A11Y-10", "type": "accessibility", "title": "autocomplete mancante su nome ed email", "description": "I campi dei dati personali non dichiarano lo scopo. WCAG 1.3.5 (AA).", "evidence": { "url": "index.html", "screenshot": null, "location": "index.html:17-18", "steps": ["Leggere gli input name ed email"] }, "impact": "Niente riempimento automatico per persone con disabilità cognitive o motorie", "priority": "P2", "confidence": 0.9, "recommendation": "autocomplete=\"name\" e autocomplete=\"email\"", "status": "Nuova", "requires_human_review": false }
  ],
  "tested_scenarios": ["Lettura statica di index.html, style.css, app.js, logo.svg", "Calcolo manuale dei contrasti (#aaa, #ccc, #d00, #fff su #2b59c3)"],
  "limitations": ["Nessuna prova in browser, con tastiera reale, lettore di schermo o strumenti automatici", "Non verificati 1.4.4, 1.4.10, 1.4.12, 2.5.8 e il contrasto del placeholder", "Schede della biblioteca non lette in questa prova e nessun accesso al web: i criteri vanno ricontrollati sulla fonte"],
  "summary": "Iscrizione impossibile da tastiera (P0); etichette, focus ed errori non accessibili (P1); contrasti, stato, alt, lang e autocomplete da sistemare (P2)."
}
```

## Domande aperte per CANOPUS e per l'utente

- Si può fare una verifica in browser con tastiera e lettore di schermo per confermare i rilievi, soprattutto A11Y-06?
- Il nome «Officina» compare anche come testo altrove? Da questo dipende se il logo deve avere `alt="Officina"` o `alt=""`.

Non ho modificato file e non ho avviato processi.

Firmato: AIWDA-08 · GACRUX. Consegno a AIWDA-01 · CANOPUS per il consolidamento e la conferma dell'utente.
