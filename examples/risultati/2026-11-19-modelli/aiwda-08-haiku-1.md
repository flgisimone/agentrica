# Audit di accessibilità: form di iscrizione (WCAG 2.2 AA)

AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

## Segnalazione P0

Il pulsante «Iscrivimi» è un `<div>` (`index.html:24`): non riceve il focus da tastiera e non si attiva con Invio o Spazio. Il form non ha un vero pulsante di invio, quindi nemmeno l'invio implicito con Invio funziona. Un utente che non usa il mouse non può completare l'iscrizione. È il rilievo A11Y-01.

## Metodo e limiti

- Audit statico: ho letto `index.html`, `style.css`, `app.js` e `README.md` (il file `logo.svg` solo nelle prime 600 byte, sufficienti per il testo). Nessun browser, nessuna navigazione da tastiera, nessun lettore di schermo, nessun strumento automatico (axe, Lighthouse).
- I contrasti sono calcolati con la formula WCAG sui valori dei colori dichiarati nel CSS.
- Non dichiaro un audit WCAG completo. Non ho verificato: reflow e zoom (1.4.4, 1.4.10), spaziatura del testo (1.4.12), comportamento reale con lettori di schermo, ordine di lettura nel rendering, e i colori predefiniti del browser (per esempio il colore del placeholder).
- Il progetto non ha uno schema di osservazioni specifico: uso il formato comune del reparto. I criteri WCAG sono scritti nella descrizione.

## Rilievi

| ID | Priorità | Criterio | Dove | Sintesi |
|---|---|---|---|---|
| A11Y-01 | P0 | 2.1.1 (A), 4.1.2 (A) | `index.html:24`, `app.js:4` | Pulsante di invio come `<div>`: non focusabile, non azionabile da tastiera, nessun vero submit |
| A11Y-02 | P1 | 1.3.1 (A), 3.3.2 (A), 4.1.2 (A) | `index.html:17-23` | Campi senza etichetta: solo placeholder e opzione «Turno» |
| A11Y-03 | P1 | 2.4.7 (AA) | `style.css:37-41` | Contorno di focus rimosso per campi, select e pulsante, senza sostituto |
| A11Y-04 | P1 | 1.4.1 (A), 3.3.1 (A), 3.3.3 (AA) | `style.css:43-45`, `app.js:9-12` | Errore segnalato solo dal colore del bordo, senza testo né `aria-invalid` |
| A11Y-05 | P1 | 4.1.3 (AA) | `index.html:26`, `app.js:13-14` | Conferma non annunciata; il focus si perde quando il form viene nascosto |
| A11Y-06 | P2 | 1.4.3 (AA) | `style.css:19-22`, `index.html:15` | Testo di supporto grigio #aaa su bianco: 2.32:1 |
| A11Y-07 | P2 | 1.4.11 (AA) | `style.css:33` | Bordo dei campi #ccc su bianco: 1.61:1 |
| A11Y-08 | P2 | 3.1.1 (A) | `index.html:2` | Lingua della pagina non dichiarata |
| A11Y-09 | P2 | 1.1.1 (A) | `index.html:11` | Logo senza attributo `alt` |
| A11Y-10 | P2 | 1.3.5 (AA) | `index.html:17-18` | Campi nome ed email senza `autocomplete` |

## Dettaglio e correzioni consigliate

Le correzioni sono indicazioni: non ho modificato nulla.

- **A11Y-01 (P0).** Usare `<button type="submit">` dentro il form e gestire l'invio con l'evento `submit`. Così il pulsante riceve il focus, si attiva con Invio e Spazio, e il ruolo è corretto. Il pulsante non è ancora testato con tastiera: il rilievo deriva dal codice HTML.
- **A11Y-02 (P1).** Aggiungere `<label>` visibili, associati con `for` o con il campo annidato. Il placeholder non sostituisce l'etichetta: scompare appena si scrive e non è letto in modo affidabile. Per il select, l'etichetta «Turno» è necessaria anche se la prima opzione la ripete.
- **A11Y-03 (P1).** Eliminare `outline: none` oppure fornire uno stile di focus visibile con `:focus-visible`. La regola su `.button:focus` non ha effetto, perché il `<div>` non è focusabile (si risolve con A11Y-01). Non ho verificato l'aspetto del focus del browser: il rilievo deriva dal CSS.
- **A11Y-04 (P1).** Mostrare un messaggio di testo accanto a ogni campo non valido (es. «Inserisci il nome»), collegarlo con `aria-describedby`, impostare `aria-invalid="true"` e spostare il focus sul primo campo sbagliato. Oggi `app.js:9` cambia solo la classe `invalid`, che colora il bordo.
- **A11Y-05 (P1).** Il blocco «Grazie, sei iscritto» (`index.html:26`) va annunciato con `role="status"` (o una regione `aria-live`) e il focus va spostato su di esso. Oggi `app.js:13` nasconde il form e il focus resta su un elemento non più presente. Da confermare con un lettore di schermo: il rilievo è dedotto dal codice, quindi `requires_human_review: true`.
- **A11Y-06 (P2).** Scurire il colore del testo di supporto, per esempio `#595959` (circa 7:1 su bianco). Il valore attuale `#aaa` non raggiunge 4.5:1 per il testo normale di 14 px.
- **A11Y-07 (P2).** Portare il bordo dei campi ad almeno 3:1 su bianco, per esempio `#767676` (circa 4.5:1). Il placeholder potrebbe fornire parte dell'informazione, per questo il rilievo ha `requires_human_review: true`.
- **A11Y-08 (P2).** Impostare `<html lang="it">`.
- **A11Y-09 (P2).** Aggiungere `alt` al logo: «Officina» se il logo è informativo, `alt=""` se è solo decorativo. Il logo contiene il testo «Officina», quindi nel primo caso è la scelta corretta.
- **A11Y-10 (P2).** Aggiungere `autocomplete="name"` al campo nome e `autocomplete="email"` al campo email.

## Verifiche superate (controllo statico)

- Contrasto del pulsante: bianco su `#2b59c3`, 6.33:1 (`style.css:47-52`), supera 4.5:1.
- Testo principale `#222` su bianco, 15.91:1 (`style.css:4`).
- Colore dell'errore `#d00` su bianco, 5.70:1 (`style.css:44`), supera 3:1 per il bordo.
- Titolo della pagina presente (`index.html:6`, criterio 2.4.2).
- Viewport senza blocco dello zoom (`index.html:5`, criterio 1.4.4 non ostacolato dal meta tag).
- Dimensione dei campi: altezza stimata di circa 40 px per input e select (padding 10 px, testo 16 px). Supera 24 px del criterio 2.5.8, ma è una stima dal CSS, non una misura.
- Ordine di tabulazione: nel codice coincide con l'ordine visivo, nessun `tabindex` positivo.

## Test non eseguiti

- Navigazione da tastiera reale, con verifica di A11Y-01 e A11Y-03.
- Lettore di schermo (NVDA, VoiceOver): verifica di A11Y-02, A11Y-04, A11Y-05.
- Zoom al 200% e 400%, reflow a 320 px (1.4.10).
- Strumenti automatici di contrasto e regole ARIA sul DOM renderizzato.

## Riepilogo

Il form non è usabile da tastiera (A11Y-01, P0) e non dà informazioni sufficienti a chi usa tecnologie assistive (A11Y-02, A11Y-04, A11Y-05). Il primo intervento è rendere il pulsante un vero `button` di submit; poi etichette, focus visibile e messaggi di errore testuali. I rilievi P2 riguardano contrasti, lingua, alternative e autocomplete. Tutti i rilievi derivano dal codice: serve una verifica manuale prima di chiudere.

---

## Osservazioni (formato comune del reparto)

```json
{
  "project": "form-iscrizione",
  "audit_id": "aiwda-08-form-iscrizione-haiku-1",
  "agent": "AIWDA-08 · GACRUX",
  "page": {
    "name": "Iscrizione al workshop",
    "url": "index.html (file locale)"
  },
  "observations": [
    {
      "id": "A11Y-01",
      "type": "accessibility",
      "title": "Pulsante di invio come div non focusabile né azionabile da tastiera",
      "description": "Il pulsante è un div con classe button (WCAG 2.1.1 Tastiera, A; 4.1.2 Nome, ruolo, valore, A). Il form non ha un pulsante submit, quindi l'invio con Invio non funziona.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "index.html:24 (div#submit); app.js:4 (listener click)",
        "steps": ["Aprire index.html", "Premere Tab dal primo campo: il focus non raggiunge il pulsante", "Premere Invio nei campi: nessun invio"]
      },
      "impact": "Chi usa solo la tastiera o un lettore di schermo non può iscriversi.",
      "priority": "P0",
      "confidence": 0.9,
      "recommendation": "Usare button type=submit dentro il form e gestire l'evento submit.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "A11Y-02",
      "type": "accessibility",
      "title": "Campi senza etichetta",
      "description": "Nome, email e turno hanno solo placeholder o un'opzione vuota (WCAG 1.3.1 A; 3.3.2 A; 4.1.2 A).",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "index.html:17-23",
        "steps": ["Usare un lettore di schermo sui campi", "Verificare il nome accessibile di ciascun campo"]
      },
      "impact": "Il lettore di schermo non annuncia lo scopo dei campi; il placeholder scompare alla digitazione.",
      "priority": "P1",
      "confidence": 0.9,
      "recommendation": "Aggiungere label visibili associate ai campi.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "A11Y-03",
      "type": "accessibility",
      "title": "Contorno di focus rimosso",
      "description": "outline: none su input, select e .button senza stile sostitutivo (WCAG 2.4.7 Focus visibile, AA).",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "style.css:37-41",
        "steps": ["Navigare con Tab tra i campi", "Osservare se resta un indicatore di focus"]
      },
      "impact": "Chi usa la tastiera non vede dove si trova il focus.",
      "priority": "P1",
      "confidence": 0.85,
      "recommendation": "Ripristinare un focus visibile con :focus-visible.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "A11Y-04",
      "type": "accessibility",
      "title": "Errore segnalato solo dal colore del bordo",
      "description": "Il campo non valido cambia solo il colore del bordo; non c'è testo di errore né aria-invalid (WCAG 1.4.1 Uso del colore, A; 3.3.1 Identificazione dell'errore, A; 3.3.3 Suggerimento per l'errore, AA).",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "style.css:43-45; app.js:9-12",
        "steps": ["Inviare il form con i campi vuoti", "Osservare se compare un messaggio testuale o un annuncio"]
      },
      "impact": "Non è chiaro quale campo è sbagliato né perché, per chi non vede il colore o non usa il mouse.",
      "priority": "P1",
      "confidence": 0.85,
      "recommendation": "Aggiungere messaggi di errore testuali collegati con aria-describedby, aria-invalid e focus sul primo campo errato.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "A11Y-05",
      "type": "accessibility",
      "title": "Conferma non annunciata e focus perso",
      "description": "Il messaggio di conferma compare senza role status o aria-live e il form viene nascosto mentre il focus è su un elemento che scompare (WCAG 4.1.3 Messaggi di stato, AA).",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "index.html:26; app.js:13-14",
        "steps": ["Completare l'iscrizione con un lettore di schermo", "Verificare se viene annunciata la conferma"]
      },
      "impact": "Chi usa un lettore di schermo non sa se l'iscrizione è andata a buon fine.",
      "priority": "P1",
      "confidence": 0.6,
      "recommendation": "Usare role status sul messaggio di conferma e spostare il focus su di esso.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "A11Y-06",
      "type": "accessibility",
      "title": "Contrasto insufficiente del testo di supporto",
      "description": "Testo #aaa su #fff, 2.32:1, sotto 4.5:1 per testo normale da 14 px (WCAG 1.4.3, AA).",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "style.css:19-22; index.html:15",
        "steps": ["Leggere il paragrafo sotto il titolo", "Misurare il contrasto"]
      },
      "impact": "Il numero dei posti e il tempo della conferma sono difficili da leggere per utenti ipovedenti.",
      "priority": "P2",
      "confidence": 0.95,
      "recommendation": "Usare un grigio di almeno 4.5:1, per esempio #595959.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "A11Y-07",
      "type": "accessibility",
      "title": "Bordo dei campi con contrasto insufficiente",
      "description": "Bordo #ccc su bianco, 1.61:1, sotto 3:1 (WCAG 1.4.11 Contrasto dei componenti non testuali, AA), se il bordo è necessario a identificare il campo.",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "style.css:29-35 (border a riga 33)",
        "steps": ["Osservare i campi vuoti", "Misurare il contrasto del bordo"]
      },
      "impact": "Il limite del campo è poco visibile per utenti con ipovisione.",
      "priority": "P2",
      "confidence": 0.6,
      "recommendation": "Portare il bordo ad almeno 3:1, per esempio #767676.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "A11Y-08",
      "type": "accessibility",
      "title": "Lingua della pagina non dichiarata",
      "description": "L'elemento html non ha lang (WCAG 3.1.1 Lingua della pagina, A).",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "index.html:2",
        "steps": ["Ispezionare l'elemento html"]
      },
      "impact": "I lettori di schermo possono pronunciare il testo italiano con la lingua sbagliata.",
      "priority": "P2",
      "confidence": 0.95,
      "recommendation": "Impostare lang=\"it\".",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "A11Y-09",
      "type": "accessibility",
      "title": "Logo senza attributo alt",
      "description": "L'immagine del logo non ha alt (WCAG 1.1.1 Contenuto non testuale, A).",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "index.html:11",
        "steps": ["Ispezionare l'immagine nell'intestazione"]
      },
      "impact": "Il lettore di schermo annuncia il nome del file o nulla.",
      "priority": "P2",
      "confidence": 0.95,
      "recommendation": "Usare alt=\"Officina\" (il logo è informativo).",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "A11Y-10",
      "type": "accessibility",
      "title": "Campi nome ed email senza autocomplete",
      "description": "Nome ed email non dichiarano lo scopo con autocomplete (WCAG 1.3.5 Identificare lo scopo dell'input, AA).",
      "evidence": {
        "url": "index.html",
        "screenshot": null,
        "location": "index.html:17-18",
        "steps": ["Focalizzare il campo nome con autocompletamento del browser attivo"]
      },
      "impact": "Chi ha difficoltà motorie o cognitive deve digitare di nuovo dati già salvati nel browser.",
      "priority": "P2",
      "confidence": 0.9,
      "recommendation": "Aggiungere autocomplete=\"name\" e autocomplete=\"email\".",
      "status": "Nuova",
      "requires_human_review": false
    }
  ],
  "tested_scenarios": [
    "Lettura statica di index.html, style.css, app.js (verifica di codice, nessun rendering)",
    "Calcolo del contrasto: testo principale 15.91:1; pulsante 6.33:1; errore #d00 5.70:1; hint 2.32:1; bordo 1.61:1",
    "Titolo presente (index.html:6), viewport senza blocco zoom (index.html:5), ordine DOM coerente con l'ordine visivo",
    "Dimensione dei campi stimata circa 40 px (criterio 2.5.8), non misurata"
  ],
  "limitations": [
    "Nessun browser: niente navigazione da tastiera, lettori di schermo, zoom, reflow (1.4.4, 1.4.10), spaziatura del testo (1.4.12)",
    "Nessuno strumento automatico (axe, Lighthouse)",
    "Colori predefiniti del browser (placeholder, focus) non considerati",
    "Non è un audit WCAG completo"
  ],
  "summary": "Il form non è usabile da tastiera (P0, pulsante come div). Seguono etichette mancanti, focus rimosso, errori solo colore, conferma non annunciata (P1). Contrasti, lingua, alt e autocomplete sono P2. Tutti i rilievi richiedono verifica manuale."
}
```
