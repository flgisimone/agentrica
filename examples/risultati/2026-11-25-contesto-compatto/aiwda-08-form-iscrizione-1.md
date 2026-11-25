AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

Consegna ad AIWDA-01 · CANOPUS. Ho controllato l'accessibilità della pagina di iscrizione al workshop (`form-iscrizione-1`) rispetto alle WCAG 2.2 AA.

**Come ho verificato.** Ho letto il codice di `index.html`, `style.css`, `app.js`, `logo.svg` e `README.md`. I rapporti di contrasto li ho calcolati con la formula WCAG della luminanza relativa, con uno script Python in memoria che non crea file. Non ho aperto la pagina in un browser e non ho usato un lettore di schermo né strumenti automatici come axe. Non ho provato la pagina con la tastiera in un browser reale. Per questo l'audit non è completo: i rilievi vengono dal codice. Per regola della prova non ho letto la biblioteca: i numeri dei criteri seguono WCAG 2.2, W3C Recommendation del 5 ottobre 2023, come la scheda `wcag-2-2` indicata nell'indice (verificata il 2026-11-19) che però non ho aperto.

## P0 da segnalare subito

**A11Y-01 · P0 · Chi usa solo la tastiera non può inviare l'iscrizione**
- **Criteri:** 2.1.1 Keyboard (A) e 4.1.2 Name, Role, Value (A).
- **Evidenza:**
  - `index.html:24`: il pulsante è `<div class="button" id="submit">Iscrivimi</div>`, senza `tabindex`, senza ruolo e senza `type="submit"`.
  - `app.js:4`: c'è solo un gestore `click` sul div e nessun gestore `submit` sul form.
  - `index.html:16-25`: il form non ha nessun pulsante di invio, quindi Invio in un campo non invia niente.
- **Cosa succede (dedotto dal codice):** il controllo non entra nell'ordine del focus, non risponde a Invio e Spazio, e le tecnologie assistive non lo annunciano come pulsante.
- **Chi è colpito:** chi usa la tastiera, i comandi vocali o un sensore a pulsante. Chi usa un lettore di schermo sente un testo semplice, non un pulsante.
- **Correzione:** un vero `<button type="submit">Iscrivimi</button>` e la validazione spostata sull'evento `submit` del form.
- **Confidenza:** 0,95.

## P1

**A11Y-02 · P1 · Campi senza etichetta**
- **Criteri:** 1.3.1 Info and Relationships (A), 3.3.2 Labels or Instructions (A) e 4.1.2 (A).
- **Evidenza:**
  - `index.html:17-18`: i campi nome ed email hanno solo un `placeholder` e nessun `<label>`.
  - `index.html:19-23`: il `<select>` non ha nessun nome accessibile. La prima opzione «Turno» (riga 20) è un valore, non un'etichetta.
  - Nessun campo dice di essere obbligatorio: manca `required` o `aria-required` e manca un'indicazione visibile.
- **Effetto:** il placeholder sparisce quando si scrive, e chi usa un lettore di schermo può sentire il select annunciato senza nome.
- **Correzione:**
  - un `<label for>` visibile per ogni campo;
  - l'indicazione dei campi obbligatori nel testo e con `required`.
- **Confidenza:** 0,9.

**A11Y-03 · P1 · Errori indicati solo dal bordo rosso**
- **Criteri:** 3.3.1 Error Identification (A), 1.4.1 Use of Color (A) e 3.3.3 Error Suggestion (AA) per l'email.
- **Evidenza:**
  - `app.js:9`: in caso di errore si aggiunge solo la classe `invalid`, senza testo, senza `aria-invalid`, senza `aria-describedby` e senza spostare il focus.
  - `style.css:43-45`: la classe `invalid` cambia solo il colore del bordo in `#d00`.
- **Effetto:** chi non distingue i colori e chi usa un lettore di schermo non sa quale campo è sbagliato né perché.
- **Correzione:**
  - un messaggio di testo per ogni campo («Inserisci un'email valida, es. nome@dominio.it»), collegato con `aria-describedby`;
  - `aria-invalid="true"` sui campi sbagliati;
  - il focus sul primo campo sbagliato, oppure un riepilogo degli errori.
- **Confidenza:** 0,9.

**A11Y-04 · P1 · Indicatore del focus rimosso**
- **Criterio:** 2.4.7 Focus Visible (AA).
- **Evidenza:** `style.css:37-41`: `input:focus, select:focus, .button:focus { outline: none; }` e nessuno stile alternativo.
- **Effetto:** chi naviga con la tastiera non vede quale campo è attivo.
- **Correzione:** togliere la regola o sostituirla con un indicatore ben visibile (per esempio `:focus-visible { outline: 2px solid #2b59c3; outline-offset: 2px; }`).
- **Confidenza:** 0,9, ma il controllo nel browser non è stato fatto.

## P2

**A11Y-05 · P2 · Conferma di iscrizione non annunciata**
- **Criterio:** 4.1.3 Status Messages (AA).
- **Evidenza:**
  - `index.html:26`: il messaggio `<p id="done" hidden>` non è una regione `role="status"` né `aria-live`.
  - `app.js:13-14`: il form viene nascosto e il messaggio mostrato, senza gestire il focus.
- **Effetto:** chi usa un lettore di schermo può non sapere che l'iscrizione è andata a buon fine.
- **Correzione:** `role="status"` sul messaggio, oppure spostare il focus sul messaggio con `tabindex="-1"`.
- **Confidenza:** 0,8.

**A11Y-06 · P2 · Contrasto insufficiente del testo informativo**
- **Criterio:** 1.4.3 Contrast (Minimum) (AA).
- **Evidenza:** `style.css:19-22`: `.hint` usa `#aaa` su `#fff` a 14px, per un rapporto di 2,32:1 contro il 4,5:1 richiesto. Il testo è in `index.html:15` («I posti sono 30. Ti scriviamo una conferma entro un giorno.»).
- **Chi è colpito:** chi ha ipovisione e chi legge con lo schermo al sole.
- **Correzione:** un grigio di almeno `#767676`, che dà circa 4,5:1.
- **Confidenza:** 0,95.

**A11Y-07 · P2 · Logo senza alternativa testuale**
- **Criterio:** 1.1.1 Non-text Content (A).
- **Evidenza:** `index.html:11`: `<img src="logo.svg">` non ha `alt`, e il logo contiene il testo «Officina» (`logo.svg:1`).
- **Effetto:** alcuni lettori di schermo leggono il nome del file.
- **Correzione:** `alt="Officina"`.
- **Confidenza:** 0,9.

**A11Y-08 · P2 · Lingua della pagina non dichiarata**
- **Criterio:** 3.1.1 Language of Page (A).
- **Evidenza:** `index.html:2`: `<html>` non ha l'attributo `lang`.
- **Effetto:** la sintesi vocale può pronunciare il testo italiano con le regole di un'altra lingua.
- **Correzione:** `<html lang="it">`.
- **Confidenza:** 0,95.

**A11Y-09 · P2 · Manca `autocomplete` sui dati personali**
- **Criterio:** 1.3.5 Identify Input Purpose (AA).
- **Evidenza:** `index.html:17-18`: i campi nome ed email non hanno `autocomplete`.
- **Chi è colpito:** persone con disabilità cognitive o motorie, che si affidano al riempimento automatico.
- **Correzione:** `autocomplete="name"` e `autocomplete="email"`.
- **Confidenza:** 0,9.

**A11Y-10 · P2 · Bordo dei campi poco contrastato (criterio da confermare)**
- **Criterio:** 1.4.11 Non-text Contrast (AA), da confermare.
- **Evidenza:** `style.css:33`: il bordo `#ccc` su `#fff` dà 1,61:1 contro il 3:1 richiesto.
- **Perché è da confermare:** se il campo è riconoscibile anche da altri indizi visivi, il criterio potrebbe non applicarsi. Va giudicato sulla pagina resa.
- **Correzione:** un bordo di almeno `#949494`, che dà circa 3:1.
- **Confidenza:** 0,6. Richiede una revisione umana (`requires_human_review: true`).

## Cosa va bene (dal codice)

- C'è il `<title>` (riga 6) e un unico `h1` (riga 14).
- Ci sono le aree `header` e `main`.
- Lo zoom non è bloccato (riga 5).
- Il testo del pulsante, bianco su `#2b59c3`, ha un contrasto di 6,33:1.
- Il testo principale `#222` ha un contrasto di 15,91:1.
- Il bordo di errore `#d00` ha un contrasto di 5,15:1 (il problema è che è l'unico segnale, vedi A11Y-03).

## Test non eseguiti

- Navigazione reale con la tastiera e ordine del focus nel browser.
- Prove con lettori di schermo (NVDA, VoiceOver).
- Scansione automatica (axe o Lighthouse).
- Riadattamento a 320px e zoom al 200% e 400% (1.4.4, 1.4.10).
- Spaziatura del testo (1.4.12).
- Dimensione dei bersagli (2.5.8) sulla pagina resa.
- Annuncio effettivo del nome accessibile, ricavato dal placeholder, nei singoli lettori di schermo.

## Domande aperte per CANOPUS

1. Va confermato come P0 il rilievo A11Y-01? Blocca il compito essenziale, cioè iscriversi, per chi usa la tastiera.
2. Va confermato che A11Y-10 rientri nell'1.4.11, con una verifica visiva sulla pagina resa?
3. Serve una seconda passata nel browser, con screenshot come evidenza, prima di chiudere il backlog?

## Backlog in JSON (riassunto)

Per i campi completi di ogni rilievo vedi le schede sopra.

```json
{"project":"form-iscrizione","audit_id":null,"agent":"AIWDA-08 GACRUX","page":{"name":"Iscrizione al workshop","url":"index.html"},
"observations":[
{"id":"A11Y-01","type":"accessibility","title":"Pulsante di invio non usabile da tastiera (2.1.1, 4.1.2)","evidence":{"url":"index.html","screenshot":null,"location":"index.html:24; app.js:4","steps":["Tab fino alla fine del form: il pulsante Iscrivimi non riceve il focus"]},"priority":"P0","confidence":0.95,"status":"Nuova","requires_human_review":false},
{"id":"A11Y-02","type":"accessibility","title":"Campi senza label, select senza nome, obbligatorietà non indicata (1.3.1, 3.3.2, 4.1.2)","evidence":{"location":"index.html:17-23"},"priority":"P1","confidence":0.9,"status":"Nuova","requires_human_review":false},
{"id":"A11Y-03","type":"accessibility","title":"Errori segnalati solo col colore e senza testo (3.3.1, 1.4.1, 3.3.3)","evidence":{"location":"app.js:9; style.css:43-45"},"priority":"P1","confidence":0.9,"status":"Nuova","requires_human_review":false},
{"id":"A11Y-04","type":"accessibility","title":"outline: none senza alternativa (2.4.7)","evidence":{"location":"style.css:37-41"},"priority":"P1","confidence":0.9,"status":"Nuova","requires_human_review":false},
{"id":"A11Y-05","type":"accessibility","title":"Conferma non annunciata (4.1.3)","evidence":{"location":"index.html:26; app.js:13-14"},"priority":"P2","confidence":0.8,"status":"Nuova","requires_human_review":false},
{"id":"A11Y-06","type":"accessibility","title":"Contrasto del testo .hint 2,32:1 (1.4.3)","evidence":{"location":"style.css:19-22; index.html:15"},"priority":"P2","confidence":0.95,"status":"Nuova","requires_human_review":false},
{"id":"A11Y-07","type":"accessibility","title":"Logo senza alt (1.1.1)","evidence":{"location":"index.html:11"},"priority":"P2","confidence":0.9,"status":"Nuova","requires_human_review":false},
{"id":"A11Y-08","type":"accessibility","title":"lang assente (3.1.1)","evidence":{"location":"index.html:2"},"priority":"P2","confidence":0.95,"status":"Nuova","requires_human_review":false},
{"id":"A11Y-09","type":"accessibility","title":"autocomplete assente su nome ed email (1.3.5)","evidence":{"location":"index.html:17-18"},"priority":"P2","confidence":0.9,"status":"Nuova","requires_human_review":false},
{"id":"A11Y-10","type":"accessibility","title":"Bordo dei campi 1,61:1 (1.4.11, da confermare)","evidence":{"location":"style.css:33"},"priority":"P2","confidence":0.6,"status":"Nuova","requires_human_review":true}],
"tested_scenarios":["Analisi statica di HTML, CSS e JS","Calcolo dei rapporti di contrasto con la formula WCAG"],
"limitations":["Nessun browser, lettore di schermo o strumento automatico","Scheda wcag-2-2 della biblioteca non letta in questa prova","Riadattamento, zoom, spaziatura del testo e dimensione dei bersagli non verificati"],
"summary":"10 rilievi: 1 P0 (invio impossibile da tastiera), 3 P1, 6 P2. Audit WCAG 2.2 AA dal codice, non completo."}
```

Firmato: AIWDA-08 · GACRUX, Senior Accessibility Specialist. Ritorno ad AIWDA-01 · CANOPUS per il consolidamento.
