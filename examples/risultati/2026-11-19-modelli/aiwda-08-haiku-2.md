# AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

Audit di accessibilità della pagina di iscrizione (`form-iscrizione`) rispetto alle WCAG 2.2 AA. Modalità audit e consulenza: nessuna modifica al progetto.

**Segnalazione immediata: rilievo P0 (AIWDA-08-01).** Il pulsante «Iscrivimi» è un `div`: non si raggiunge con Tab, non si attiva con la tastiera, e Invio non invia il modulo. Chi usa solo la tastiera non può completare l'iscrizione.

## Perimetro e metodo

- File letti: `index.html`, `style.css`, `app.js`, `README.md`, `logo.svg` (come testo). Nient'altro.
- Metodo: revisione statica del codice. Contrasti calcolati con la formula WCAG 2.x (valori riportati sotto). Analisi della cascata CSS per l'attributo `hidden`.
- Non eseguito: apertura nel browser, navigazione da tastiera, lettore di schermo, zoom e reflow, strumenti automatici (axe, Lighthouse), tema scuro. Per questo i rilievi sul comportamento a runtime hanno `requires_human_review: true`.
- Non è un audit WCAG completo: è una verifica dei criteri toccati dal codice letto.

## Rilievi

| ID | Priorità | Criteri WCAG | Titolo | Posizione |
|---|---|---|---|---|
| AIWDA-08-01 | P0 | 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A) | Il pulsante di invio è un `div` non focalizzabile e non attivabile da tastiera | `index.html:24`, `app.js:4`, `index.html:16-25` |
| AIWDA-08-02 | P1 | 1.3.1, 3.3.2, 4.1.2 (A) | Campi senza etichetta: solo il segnaposto | `index.html:17-19` |
| AIWDA-08-03 | P1 | 2.4.7 Focus Visible (AA) | Il contorno di focus è rimosso senza sostituzione | `style.css:37-41` |
| AIWDA-08-04 | P1 | 3.3.1 Error Identification (A), 1.4.1 Use of Color (A), 3.3.3 (AA) | Errori indicati solo dal colore del bordo, senza testo né collegamento al campo | `app.js:5-12`, `style.css:43-45`, `index.html:16` |
| AIWDA-08-05 | P1 | 4.1.3 Status Messages (AA), 2.4.3 Focus Order (A) | Conferma non annunciata e focus perso dopo l'invio | `index.html:26`, `app.js:13-14` |
| AIWDA-08-06 | P2 | (usabilità, non un criterio WCAG) | Il modulo resta visibile dopo l'invio: `hidden` è sovrascritto da `form { display: grid }` | `style.css:24-27`, `app.js:13` |
| AIWDA-08-07 | P2 | 1.4.3 Contrast Minimum (AA) | Testo di aiuto con contrasto insufficiente (2,32:1) | `style.css:19-22` |
| AIWDA-08-08 | P2 | 1.4.11 Non-text Contrast (AA) | Bordo dei campi con contrasto insufficiente (1,61:1) | `style.css:29-35` |
| AIWDA-08-09 | P2 | 3.1.1 Language of Page (A) | Elemento `html` senza `lang` | `index.html:2` |
| AIWDA-08-10 | P2 | 1.1.1 Non-text Content (A) | Logo senza attributo `alt` | `index.html:11`, `logo.svg` |

### AIWDA-08-01 · P0 · Pulsante non accessibile da tastiera (2.1.1, 4.1.2)

- **Fatti osservati.** Il pulsante è `<div class="button" id="submit">Iscrivimi</div>` (`index.html:24`). Un `div` senza `tabindex` non riceve il focus da Tab. Non ha ruolo (`role="button"`), quindi lo leggitore di schermo lo annuncia come testo. L'invio è gestito solo dall'evento `click` (`app.js:4`). Il `form` non ha un pulsante di tipo `submit` (`index.html:16-25`). Con due campi che bloccano l'invio implicito (nome ed email), Invio nel campo non invia il modulo.
- **Inferenza.** Chi usa solo la tastiera non può completare l'iscrizione. Chi usa un lettore di schermo con navigazione per elementi non trova un pulsante.
- **Impatto.** Blocca l'attività essenziale (iscriversi). Riguarda utenti che non usano il mouse e utenti che navigano con tecnologie assistive.
- **Correzione consigliata (da confermare).** Usare `<button type="submit">` dentro il `form`, e gestire l'invio con l'evento `submit` del form invece del `click`. Così Tab, Invio e Spazio funzionano senza codice aggiuntivo.
- **Confidenza:** 0,9. **Revisione umana:** sì, da confermare con la tastiera nel browser.

### AIWDA-08-02 · P1 · Campi senza etichetta (1.3.1, 3.3.2, 4.1.2)

- **Fatti osservati.** Nome ed email hanno solo `placeholder` (`index.html:17-18`). Il `select` non ha etichetta: la sua prima opzione «Turno» con valore vuoto (`index.html:20`) fa da segnaposto. Non ci sono `<label>`, `aria-label` o `aria-labelledby`.
- **Impatto.** Il segnaposto sparisce appena si scrive e non è un nome accessibile affidabile: chi usa un lettore di schermo non sa cosa inserire in ciascun campo. Il criterio 3.3.2 è di livello A.
- **Correzione consigliata (da confermare).** Aggiungere `<label>` visibili per ciascun campo, collegati con `for`/`id`. Il segnaposto può restare come esempio.
- **Confidenza:** 0,95. **Revisione umana:** no.

### AIWDA-08-03 · P1 · Focus non visibile (2.4.7)

- **Fatti osservati.** `input:focus`, `select:focus` e `.button:focus` hanno `outline: none` (`style.css:37-41`) e nessun altro stile di focus.
- **Impatto.** Chi naviga da tastiera non vede quale campo è attivo. È una barriera significativa per l'intero modulo.
- **Correzione consigliata (da confermare).** Togliere `outline: none` e definire un contorno di focus visibile (almeno 2 px, contrasto di almeno 3:1 con lo sfondo), oppure usare `:focus-visible` con uno stile equivalente.
- **Confidenza:** 0,95. **Revisione umana:** no (regola CSS certa; la resa visiva va comunque confermata nel browser).

### AIWDA-08-04 · P1 · Errori solo dal colore, senza testo (3.3.1, 1.4.1, 3.3.3)

- **Fatti osservati.** Alla validazione `app.js` aggiunge la classe `.invalid` (`app.js:9`) e si ferma (`app.js:12`). `.invalid` cambia solo il colore del bordo in rosso (`style.css:43-45`). Non ci sono messaggi di testo, `aria-invalid`, `aria-describedby`, né lo spostamento del focus sul primo campo sbagliato. L'attributo `novalidate` (`index.html:16`) disattiva anche i messaggi nativi del browser.
- **Impatto.** L'utente non sa cosa correggere, né con la vista (il colore è l'unico segnale) né con un lettore di schermo. Il criterio 3.3.1 è di livello A.
- **Correzione consigliata (da confermare).** Per ogni campo, un messaggio di testo visibile collegato con `aria-describedby` e `aria-invalid="true"` quando è sbagliato. Portare il focus sul primo campo non valido. Il riepilogo degli errori può essere annunciato con un `role="alert"`.
- **Nota.** Il controllo dell'email (`app.js:8`) verifica solo la presenza di «@». Non rientra nell'audit di accessibilità, ma un messaggio di errore chiaro va scritto insieme alla regola.
- **Confidenza:** 0,9. **Revisione umana:** no.

### AIWDA-08-05 · P1 · Conferma non annunciata e focus perso (4.1.3, 2.4.3)

- **Fatti osservati.** Il paragrafo di conferma `#done` ha `hidden` e non ha `role="status"` né `aria-live` (`index.html:26`). Dopo l'invio, lo script mostra il messaggio (`app.js:14`) senza spostare il focus (il pulsante, già non focalizzabile, o il form nascosto).
- **Impatto.** Chi usa un lettore di schermo non sa se l'iscrizione è riuscita e potrebbe inviare di nuovo. Il criterio 4.1.3 è di livello AA.
- **Correzione consigliata (da confermare).** Dare al messaggio `role="status"` (o `aria-live="polite"`), oppure spostarvi il focus. Dopo il successo, mantenere un punto di partenza chiaro per il focus.
- **Confidenza:** 0,85. **Revisione umana:** sì, da verificare con un lettore di schermo.

### AIWDA-08-06 · P2 · Modulo visibile dopo l'invio (usabilità)

- **Fatti osservati.** `app.js:13` imposta `form.hidden = true`. Ma `style.css:24-27` assegna `display: grid` a `form`, e una regola di autore vince sullo stile del browser che applica `[hidden] { display: none }`. Quindi il modulo non viene nascosto: resta visibile sotto la conferma. Dedotto dalla cascata CSS; non verificato nel browser.
- **Impatto.** Il modulo resta visibile e attivo dopo la conferma: l'utente può inviarlo di nuovo e vede due messaggi insieme. Rende più confusa la conferma di AIWDA-08-05.
- **Correzione consigliata (da confermare).** Aggiungere `form[hidden] { display: none; }` oppure non impostare `display` sul `form`.
- **Confidenza:** 0,85. **Revisione umana:** sì.

### AIWDA-08-07 · P2 · Contrasto del testo di aiuto (1.4.3)

- **Fatti osservati.** `.hint` ha colore `#aaa` su `#fff` (`style.css:19-22`). Testo di 14 px, quindi non grande. Contrasto calcolato: **2,32:1**. Il minimo AA è 4,5:1.
- **Impatto.** Il testo contiene informazioni utili (30 posti, conferma entro un giorno) e risulta difficile da leggere per utenti con ipovisione o in condizioni di luce forte.
- **Correzione consigliata (da confermare).** Usare un grigio con contrasto di almeno 4,5:1 su bianco, per esempio un valore più scuro di `#aaa`. Il valore esatto va scelto dal design system.
- **Confidenza:** 0,95 (calcolo). **Revisione umana:** no.

### AIWDA-08-08 · P2 · Contrasto del bordo dei campi (1.4.11)

- **Fatti osservati.** Il bordo dei campi è `#ccc` su `#fff` (`style.css:29-35`). Contrasto calcolato: **1,61:1**. Il minimo AA per i componenti dell'interfaccia è 3:1. Il bordo è l'unico segnale visivo del campo, perché non ci sono etichette (vedi AIWDA-08-02).
- **Correzione consigliata (da confermare).** Usare un bordo con contrasto di almeno 3:1 su bianco.
- **Confidenza:** 0,95 (calcolo). **Revisione umana:** no.

### AIWDA-08-09 · P2 · Lingua della pagina non dichiarata (3.1.1)

- **Fatti osservati.** `index.html:2` è `<html>` senza `lang`. Il contenuto è in italiano.
- **Impatto.** I lettori di schermo possono pronunciare il testo con la lingua predefinita, con effetti sulla comprensione.
- **Correzione consigliata (da confermare).** `<html lang="it">`.
- **Confidenza:** 0,95. **Revisione umana:** no.

### AIWDA-08-10 · P2 · Logo senza testo alternativo (1.1.1)

- **Fatti osservati.** `index.html:11` è `<img src="logo.svg" width="120" height="40" />` senza `alt`. Il file `logo.svg` contiene il testo «Officina» (`logo.svg`), quindi il logo porta un nome visibile.
- **Impatto.** Il lettore di schermo può leggere il nome del file o nulla. Il nome del marchio è un'informazione da dare.
- **Correzione consigliata (da confermare).** Se il logo è solo identificativo: `alt` con il nome visibile nel logo. Se è decorativo: `alt=""`. La scelta spetta al responsabile del progetto.
- **Confidenza:** 0,9. **Revisione umana:** no.

## Elementi verificati senza rilievi

- Titolo della pagina (`index.html:6`) e unico `h1` (`index.html:14`): presenti e descrittivi.
- Testo del pulsante su sfondo blu (`#fff` su `#2b59c3`): contrasto 6,33:1, conforme.
- Testo principale `#222` su `#fff`: 15,91:1, conforme.
- Campi con `font-size: 16px` (`style.css:32`): leggibili e senza zoom automatico su iOS.
- Colore del bordo in errore (`#d00` su `#fff`): 5,15:1, conforme per il bordo; il problema è che il colore è l'unico segnale (AIWDA-08-04).

## Test non eseguiti

- Navigazione da tastiera nel browser (Tab, Invio, Spazio).
- Prova con lettore di schermo (VoiceOver, NVDA).
- Zoom al 200% e 400%, reflow a 320 px.
- Strumenti automatici (axe, Lighthouse), tema scuro, modalità di alto contrasto.
- Il sito non è stato servito (`npx serve .` non eseguito): le posizioni sono riferite ai file.

## Riepilogo

- 10 rilievi: 1 P0, 4 P1, 5 P2. Il P0 è da segnalare subito (AIWDA-08-01).
- Il modulo non è utilizzabile dalla sola tastiera (AIWDA-08-01) e non comunica bene errori ed esito (AIWDA-08-04, AIWDA-08-05).
- Requisiti per la revisione umana: AIWDA-08-01, 05, 06 (comportamento a runtime).
- Questo non è un audit WCAG completo: è la verifica dei criteri toccati dai file letti.

Firmato: AIWDA-08 · GACRUX — Senior Accessibility Specialist

## Rilievi in formato JSON

```json
{
  "project": "form-iscrizione",
  "audit_id": "aiwda-08-form-iscrizione-haiku-2",
  "agent": "AIWDA-08 · GACRUX",
  "page": {
    "name": "Iscrizione al workshop",
    "url": "index.html (file statico, non servito)"
  },
  "observations": [
    {
      "id": "AIWDA-08-01",
      "type": "accessibility",
      "title": "Pulsante di invio non accessibile da tastiera (WCAG 2.1.1, 4.1.2)",
      "description": "Il pulsante è un div senza tabindex né ruolo; l'invio è solo sull'evento click. Il form non ha un pulsante submit, quindi Invio non invia.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "index.html:24 (div#submit), app.js:4, index.html:16-25",
        "steps": ["Tab dal campo Turno", "Il pulsante non riceve il focus", "Premere Invio nei campi Nome o Email: il modulo non si invia"]
      },
      "impact": "Chi usa solo la tastiera o un lettore di schermo non può completare l'iscrizione.",
      "priority": "P0",
      "confidence": 0.9,
      "recommendation": "Usare <button type=\"submit\"> nel form e gestire l'evento submit.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "AIWDA-08-02",
      "type": "accessibility",
      "title": "Campi senza etichetta (WCAG 1.3.1, 3.3.2, 4.1.2)",
      "description": "Nome, email e turno hanno solo placeholder o un'opzione vuota; nessuna label né aria-label.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "index.html:17-19",
        "steps": ["Ispezionare i campi: nessun label collegato"]
      },
      "impact": "Il nome dei campi non è disponibile a chi usa un lettore di schermo; il segnaposto sparisce alla scrittura.",
      "priority": "P1",
      "confidence": 0.95,
      "recommendation": "Aggiungere label visibili collegate con for/id.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "AIWDA-08-03",
      "type": "accessibility",
      "title": "Focus non visibile (WCAG 2.4.7)",
      "description": "outline: none su input, select e .button senza stile di focus sostitutivo.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "style.css:37-41",
        "steps": ["Tab tra i campi", "Nessun contorno visibile sul campo attivo"]
      },
      "impact": "Chi naviga da tastiera non sa dove si trova nel modulo.",
      "priority": "P1",
      "confidence": 0.95,
      "recommendation": "Rimuovere outline: none e definire un focus visibile (2 px, contrasto almeno 3:1).",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "AIWDA-08-04",
      "type": "accessibility",
      "title": "Errori indicati solo dal colore (WCAG 3.3.1, 1.4.1, 3.3.3)",
      "description": "La validazione aggiunge .invalid (bordo rosso) senza messaggio, senza aria-invalid o aria-describedby, senza spostare il focus. novalidate disattiva i messaggi nativi.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "app.js:5-12, style.css:43-45, index.html:16",
        "steps": ["Premere Iscrivimi con i campi vuoti", "Compare solo il bordo rosso, nessun testo"]
      },
      "impact": "L'utente non sa cosa correggere, né a vista né con un lettore di schermo.",
      "priority": "P1",
      "confidence": 0.9,
      "recommendation": "Messaggi di testo collegati con aria-describedby, aria-invalid, focus sul primo campo sbagliato.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "AIWDA-08-05",
      "type": "accessibility",
      "title": "Conferma non annunciata e focus perso (WCAG 4.1.3, 2.4.3)",
      "description": "#done non ha role=status né aria-live; dopo l'invio il focus non viene spostato.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "index.html:26, app.js:13-14",
        "steps": ["Inviare il modulo con dati validi", "Il messaggio compare senza annuncio per il lettore di schermo"]
      },
      "impact": "Non si sa se l'iscrizione è riuscita; rischio di invio doppio.",
      "priority": "P1",
      "confidence": 0.85,
      "recommendation": "role=status o aria-live=polite sul messaggio; gestire il focus dopo il successo.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "AIWDA-08-06",
      "type": "usability",
      "title": "Il modulo resta visibile dopo l'invio (hidden sovrascritto dal CSS)",
      "description": "form.hidden = true non ha effetto perché form { display: grid } è una regola di autore che vince su [hidden]. Dedotto dalla cascata CSS, non verificato nel browser.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "style.css:24-27, app.js:13",
        "steps": ["Inviare il modulo con dati validi", "Il modulo resta visibile sotto la conferma"]
      },
      "impact": "Doppio messaggio e possibilità di reinviare il modulo.",
      "priority": "P2",
      "confidence": 0.85,
      "recommendation": "Aggiungere form[hidden] { display: none; } oppure non impostare display sul form.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "AIWDA-08-07",
      "type": "accessibility",
      "title": "Contrasto insufficiente del testo di aiuto (WCAG 1.4.3)",
      "description": "Il testo .hint è #aaa su #fff: contrasto 2,32:1 su testo di 14 px. Minimo AA 4,5:1.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "style.css:19-22",
        "steps": ["Leggere il paragrafo sotto il titolo"]
      },
      "impact": "Informazioni sui posti e sulla conferma difficili da leggere in ipovisione o con luce forte.",
      "priority": "P2",
      "confidence": 0.95,
      "recommendation": "Colore del testo con contrasto di almeno 4,5:1 su bianco.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "AIWDA-08-08",
      "type": "accessibility",
      "title": "Contrasto insufficiente del bordo dei campi (WCAG 1.4.11)",
      "description": "Il bordo dei campi è #ccc su #fff: 1,61:1. Minimo AA 3:1. È l'unico segnale visivo del campo.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "style.css:29-35",
        "steps": ["Osservare il contorno dei campi"]
      },
      "impact": "Campi poco distinguibili per utenti con ipovisione.",
      "priority": "P2",
      "confidence": 0.95,
      "recommendation": "Bordo con contrasto di almeno 3:1 su bianco.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "AIWDA-08-09",
      "type": "accessibility",
      "title": "Lingua della pagina non dichiarata (WCAG 3.1.1)",
      "description": "L'elemento html non ha l'attributo lang; il contenuto è in italiano.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "index.html:2",
        "steps": ["Ispezionare l'elemento html"]
      },
      "impact": "I lettori di schermo possono pronunciare il testo con una lingua sbagliata.",
      "priority": "P2",
      "confidence": 0.95,
      "recommendation": "<html lang=\"it\">",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "AIWDA-08-10",
      "type": "accessibility",
      "title": "Logo senza testo alternativo (WCAG 1.1.1)",
      "description": "L'img del logo non ha alt. Il file logo.svg contiene il testo 'Officina'.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "index.html:11, logo.svg",
        "steps": ["Ispezionare l'img nell'header"]
      },
      "impact": "Il lettore di schermo legge il nome del file o nulla.",
      "priority": "P2",
      "confidence": 0.9,
      "recommendation": "alt con il nome visibile nel logo, oppure alt vuoto se decorativo: scelta del responsabile.",
      "status": "Nuova",
      "requires_human_review": false
    }
  ],
  "tested_scenarios": [
    "Lettura statica di index.html, style.css, app.js, README.md, logo.svg",
    "Calcolo del contrasto con la formula WCAG 2.x per i colori dichiarati",
    "Analisi della cascata CSS per l'attributo hidden su form"
  ],
  "limitations": [
    "Nessuna navigazione nel browser: il progetto non è stato servito (npx serve non eseguito)",
    "Nessuna prova con tastiera, lettore di schermo, zoom o reflow",
    "Nessuno strumento automatico (axe, Lighthouse) eseguito",
    "Non è un audit WCAG completo",
    "Il controllo dell'email (solo presenza di '@') è fuori dal perimetro di accessibilità"
  ],
  "summary": "10 rilievi (1 P0, 4 P1, 5 P2). Il P0 (pulsante di invio non accessibile da tastiera) va segnalato subito. Errori e conferma non comunicati, etichette mancanti, focus non visibile. Verifiche runtime da confermare nel browser."
}
```
