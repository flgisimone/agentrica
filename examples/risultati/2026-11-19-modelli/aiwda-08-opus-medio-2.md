AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

# Audit di accessibilità della pagina di iscrizione (WCAG 2.2 AA)

Ho letto tutti e cinque i file del progetto: `index.html`, `style.css`, `app.js`, `logo.svg` e `README.md`. Non ho modificato nulla.

**Come ho verificato.** Ho fatto un'analisi manuale del codice sorgente. I rapporti di contrasto li ho calcolati con la formula WCAG a partire dai colori nel CSS. Non ho aperto la pagina in un browser, non ho usato strumenti automatici (axe, Lighthouse), non ho provato la tastiera dal vivo né un lettore di schermo. Quindi non è un audit WCAG completo: i rilievi su tastiera, focus e annunci vengono dal codice e vanno confermati in un browser.

## Rilievo P0, da segnalare subito

**Con la sola tastiera non ci si può iscrivere.** Il pulsante «Iscrivimi» è un `<div>` con un listener `click`:
- non riceve il focus da tastiera;
- Invio e Spazio non lo attivano;
- non ha il ruolo di pulsante;
- il form non ha un pulsante di invio, quindi anche Invio dentro un campo non invia nulla.

## Rilievi

Tutti i rilievi sono di tipo `accessibility` e nello stato `Nuova`.

| ID | P | Criterio WCAG | File:riga | Problema | Utenti impattati | Correzione consigliata |
|---|---|---|---|---|---|---|
| GACRUX-01 | P0 | 2.1.1 Tastiera (A); 4.1.2 Nome, ruolo, valore (A) | `index.html:24`, `app.js:4` | Il pulsante di invio è un `<div class="button">`: non riceve il focus, non ha ruolo e non si attiva con Invio o Spazio. | Chi usa la tastiera, un lettore di schermo, un sistema a sensori o il controllo vocale | Usare `<button type="submit">Iscrivimi</button>` e gestire l'evento `submit` del form invece del `click` sul div. Così funziona anche Invio dentro i campi. |
| GACRUX-02 | P1 | 1.3.1 Info e correlazioni (A); 3.3.2 Etichette o istruzioni (A); 4.1.2 (A) | `index.html:17-23` | I campi non hanno `<label>`: l'unica indicazione è il placeholder, che sparisce mentre si scrive e ha poco contrasto. La `<select>` non ha un nome accessibile: «Turno» è un'opzione, non un'etichetta. Non è indicato che i campi sono obbligatori. | Chi usa un lettore di schermo o il controllo vocale; persone con disturbi cognitivi o della memoria | Aggiungere un `<label for>` visibile a ogni campo («Nome e cognome», «Email», «Turno») e indicare l'obbligatorietà nel testo, più `required` o `aria-required="true"`. |
| GACRUX-03 | P1 | 2.4.7 Focus visibile (AA) | `style.css:37-41` | `outline: none` su input, select e `.button` senza uno stile di focus sostitutivo: chi naviga con la tastiera non vede dove si trova. | Chi usa la tastiera, persone ipovedenti | Togliere la regola o sostituirla con un indicatore evidente, per esempio `:focus-visible { outline: 2px solid #2b59c3; outline-offset: 2px; }`. |
| GACRUX-04 | P1 | 3.3.1 Identificazione degli errori (A); 1.4.1 Uso del colore (A); 3.3.3 Suggerimenti per gli errori (AA) | `app.js:9`, `style.css:43-45` | L'errore si vede solo dal bordo che diventa rosso (`#d00`). Non c'è un messaggio di testo, né `aria-invalid`, né un annuncio, e non si dice cosa correggere (per esempio un'email senza «@»). Il focus non va al primo campo sbagliato. | Persone daltoniche, chi usa un lettore di schermo, persone con disturbi cognitivi | Per ogni campo sbagliato: un messaggio di testo vicino al campo, collegato con `aria-describedby`, e `aria-invalid="true"`. Poi focus sul primo campo con errore, o un riepilogo degli errori in una regione `role="alert"`. |
| GACRUX-05 | P2 | 4.1.3 Messaggi di stato (AA) | `app.js:13-14`, `index.html:26` | «Grazie, sei iscritto.» compare togliendo `hidden`, senza ruolo live e senza spostare il focus, mentre il form sparisce: un lettore di schermo non annuncia nulla. | Chi usa un lettore di schermo | Mettere `role="status"` sul messaggio di conferma, oppure dargli `tabindex="-1"` e spostarci il focus dopo l'invio. |
| GACRUX-06 | P2 | 1.4.3 Contrasto minimo (AA) | `style.css:19-22`, `index.html:15` | Il testo `.hint` è `#aaa` su `#fff`, cioè 2,3:1 calcolato, sotto il 4,5:1 richiesto per il testo a 14px. È un'informazione utile (posti, tempi della conferma). | Persone ipovedenti, chi legge con riflessi sullo schermo | Usare almeno `#767676` (4,5:1), meglio `#595959`. |
| GACRUX-07 | P2 | 1.4.11 Contrasto non testuale (AA) | `style.css:33` | Il bordo dei campi `#ccc` su `#fff` è 1,6:1 calcolato, sotto il 3:1: i campi si distinguono a fatica dallo sfondo. | Persone ipovedenti | Un bordo di almeno 3:1, per esempio `#767676` o `#8a8a8a`. |
| GACRUX-08 | P2 | 1.1.1 Contenuti non testuali (A) | `index.html:11` | `<img src="logo.svg">` non ha `alt`, e il logo contiene il testo «Officina». Un lettore di schermo può leggere il nome del file. | Chi usa un lettore di schermo | `alt="Officina"`. |
| GACRUX-09 | P2 | 3.1.1 Lingua della pagina (A) | `index.html:2` | `<html>` non ha l'attributo `lang`: la sintesi vocale può leggere l'italiano con una pronuncia sbagliata. | Chi usa un lettore di schermo o la sintesi vocale | `<html lang="it">`. |
| GACRUX-10 | P3 | 1.3.5 Identificare lo scopo degli input (AA) | `index.html:17-18` | Mancano `autocomplete="name"` e `autocomplete="email"`. | Persone con disabilità motorie o cognitive, che beneficiano del riempimento automatico | Aggiungere gli attributi `autocomplete`. |

Il pulsante supera i criteri sul contrasto: testo bianco su `#2b59c3` è circa 6,3:1 e il rosso `#d00` su bianco circa 5,2:1. Il problema dell'errore è che è affidato solo al colore (GACRUX-04), non il contrasto.

## Test non eseguiti

- Nessuna prova in un browser. Non ho verificato ordine del focus, comportamento di Invio e Spazio, visibilità del focus e zoom o reflow a 400% (1.4.10, 1.4.4).
- Nessuna prova con un lettore di schermo (NVDA, VoiceOver) né con il controllo vocale.
- Nessuno strumento automatico (axe, Lighthouse, WAVE).
- Non ho verificato la spaziatura del testo (1.4.12) né il comportamento in modalità a contrasto elevato o con colori forzati.

## Dati in JSON

```json
{
  "project": "form-iscrizione",
  "audit_id": "aiwda-08-form-iscrizione",
  "agent": "AIWDA-08 · GACRUX",
  "page": { "name": "Iscrizione al workshop", "url": "index.html" },
  "observations": [
    { "id": "GACRUX-01", "type": "accessibility", "title": "Pulsante di invio non utilizzabile da tastiera (div)", "description": "Il pulsante Iscrivimi è un div con listener click: non riceve il focus, non ha ruolo e non si attiva con Invio o Spazio; il form non ha un pulsante di invio. WCAG 2.1.1 (A), 4.1.2 (A).", "evidence": { "url": "index.html", "screenshot": null, "location": "index.html:24; app.js:4", "steps": ["Aprire index.html", "Premere Tab fino alla fine del form", "Il pulsante non riceve il focus e non si può inviare"] }, "impact": "Chi usa la tastiera o un lettore di schermo non può iscriversi", "priority": "P0", "confidence": 0.95, "recommendation": "Usare <button type=\"submit\"> e gestire l'evento submit del form", "status": "Nuova", "requires_human_review": false },
    { "id": "GACRUX-02", "type": "accessibility", "title": "Campi senza etichetta, solo placeholder", "description": "I campi input e select non hanno label; la select non ha un nome accessibile; l'obbligatorietà non è indicata. WCAG 1.3.1, 3.3.2, 4.1.2 (A).", "evidence": { "url": "index.html", "screenshot": null, "location": "index.html:17-23", "steps": ["Leggere il markup del form: nessun elemento label né aria-label"] }, "impact": "Lo scopo dei campi non è annunciato o si perde mentre si scrive", "priority": "P1", "confidence": 0.9, "recommendation": "Label visibili associate con for/id, più required o aria-required", "status": "Nuova", "requires_human_review": false },
    { "id": "GACRUX-03", "type": "accessibility", "title": "Focus reso invisibile", "description": "outline:none sui controlli senza uno stile di focus sostitutivo. WCAG 2.4.7 (AA).", "evidence": { "url": "index.html", "screenshot": null, "location": "style.css:37-41", "steps": ["Navigare con Tab fra i campi: nessun indicatore di focus (inferito dal CSS)"] }, "impact": "Chi usa la tastiera non sa dove si trova", "priority": "P1", "confidence": 0.85, "recommendation": "Stile :focus-visible con un outline di almeno 2px a contrasto adeguato", "status": "Nuova", "requires_human_review": true },
    { "id": "GACRUX-04", "type": "accessibility", "title": "Errori segnalati solo con il colore del bordo", "description": "La validazione applica solo la classe invalid (bordo #d00): nessun messaggio di testo, nessun aria-invalid, nessun annuncio, nessuno spostamento del focus. WCAG 3.3.1 (A), 1.4.1 (A), 3.3.3 (AA).", "evidence": { "url": "index.html", "screenshot": null, "location": "app.js:9; style.css:43-45", "steps": ["Inviare il form vuoto", "Compare solo un bordo rosso sui campi"] }, "impact": "L'errore non viene percepito né capito, e l'iscrizione resta bloccata", "priority": "P1", "confidence": 0.9, "recommendation": "Messaggio di testo per campo con aria-describedby, aria-invalid, focus sul primo errore o un riepilogo role=alert", "status": "Nuova", "requires_human_review": false },
    { "id": "GACRUX-05", "type": "accessibility", "title": "Conferma di iscrizione non annunciata", "description": "Il messaggio #done compare togliendo hidden, senza regione live né spostamento del focus. WCAG 4.1.3 (AA).", "evidence": { "url": "index.html", "screenshot": null, "location": "app.js:13-14; index.html:26", "steps": ["Completare e inviare il form", "Il messaggio compare senza annuncio (inferito dal codice)"] }, "impact": "Chi usa un lettore di schermo non sa se l'iscrizione è andata a buon fine", "priority": "P2", "confidence": 0.8, "recommendation": "role=status sul messaggio, oppure focus programmatico su di esso", "status": "Nuova", "requires_human_review": true },
    { "id": "GACRUX-06", "type": "accessibility", "title": "Contrasto insufficiente del testo di aiuto", "description": "#aaa su #fff: 2,3:1 calcolato, sotto il 4,5:1 richiesto. WCAG 1.4.3 (AA).", "evidence": { "url": "index.html", "screenshot": null, "location": "style.css:19-22; index.html:15", "steps": ["Calcolo del contrasto dai colori del CSS"] }, "impact": "Informazioni su posti e conferma poco leggibili", "priority": "P2", "confidence": 0.95, "recommendation": "Colore almeno #767676", "status": "Nuova", "requires_human_review": false },
    { "id": "GACRUX-07", "type": "accessibility", "title": "Bordo dei campi a basso contrasto", "description": "#ccc su #fff: 1,6:1 calcolato, sotto il 3:1. WCAG 1.4.11 (AA).", "evidence": { "url": "index.html", "screenshot": null, "location": "style.css:33", "steps": ["Calcolo del contrasto dai colori del CSS"] }, "impact": "I campi si distinguono a fatica dallo sfondo", "priority": "P2", "confidence": 0.85, "recommendation": "Bordo di almeno 3:1, per esempio #767676", "status": "Nuova", "requires_human_review": false },
    { "id": "GACRUX-08", "type": "accessibility", "title": "Logo senza testo alternativo", "description": "img logo.svg senza alt; il logo contiene il testo Officina. WCAG 1.1.1 (A).", "evidence": { "url": "index.html", "screenshot": null, "location": "index.html:11", "steps": ["Leggere il markup dell'header"] }, "impact": "Il nome dell'organizzazione non viene annunciato", "priority": "P2", "confidence": 0.95, "recommendation": "alt=\"Officina\"", "status": "Nuova", "requires_human_review": false },
    { "id": "GACRUX-09", "type": "accessibility", "title": "Lingua della pagina non dichiarata", "description": "html senza attributo lang. WCAG 3.1.1 (A).", "evidence": { "url": "index.html", "screenshot": null, "location": "index.html:2", "steps": ["Leggere il tag html"] }, "impact": "La sintesi vocale può leggere con una pronuncia sbagliata", "priority": "P2", "confidence": 0.95, "recommendation": "<html lang=\"it\">", "status": "Nuova", "requires_human_review": false },
    { "id": "GACRUX-10", "type": "accessibility", "title": "Manca autocomplete su nome ed email", "description": "Gli input nome ed email non dichiarano lo scopo con autocomplete. WCAG 1.3.5 (AA).", "evidence": { "url": "index.html", "screenshot": null, "location": "index.html:17-18", "steps": ["Leggere il markup degli input"] }, "impact": "Niente riempimento automatico per chi ha difficoltà motorie o cognitive", "priority": "P3", "confidence": 0.9, "recommendation": "autocomplete=\"name\" e autocomplete=\"email\"", "status": "Nuova", "requires_human_review": false }
  ],
  "tested_scenarios": ["Analisi manuale del codice sorgente di index.html, style.css, app.js e logo.svg", "Calcolo dei rapporti di contrasto dai colori dichiarati nel CSS"],
  "limitations": ["Nessuna prova in un browser", "Nessuna prova con la tastiera dal vivo", "Nessun lettore di schermo", "Nessuno strumento automatico", "Zoom, reflow e spaziatura del testo non verificati"],
  "summary": "10 rilievi: 1 P0 (invio impossibile da tastiera), 3 P1 (etichette, focus, errori), 5 P2, 1 P3. Non è un audit WCAG completo."
}
```

## Riepilogo

Ci sono 10 rilievi: 1 P0, 3 P1, 5 P2 e 1 P3. Il primo da correggere è il pulsante `<div>` (GACRUX-01): oggi chi usa solo la tastiera non riesce a iscriversi.

Le correzioni costano poco e stanno tutte nell'HTML e nel CSS esistenti:
- un `<button type="submit">` al posto del div;
- `<label>` visibili per i tre campi;
- `lang="it"` sulla pagina e `alt="Officina"` sul logo;
- uno stile `:focus-visible` al posto di `outline: none`;
- messaggi di errore di testo collegati ai campi;
- `role="status"` sul messaggio di conferma;
- colori più scuri per il testo di aiuto e per i bordi dei campi.

Sono proposte: non ho applicato nulla, e la decisione su cosa correggere spetta a te. Dopo le correzioni consiglio una verifica in un browser, con la tastiera, con un lettore di schermo e con axe.

— AIWDA-08 · GACRUX