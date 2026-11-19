# Verifica di accessibilità della pagina di iscrizione (WCAG 2.2 AA)

Ho letto il codice di `index.html`, `style.css`, `app.js` e `logo.svg`. Non ho aperto la pagina nel browser e non l'ho provata con un lettore di schermo o con strumenti automatici. I rapporti di contrasto li ho calcolati dai colori nel CSS. Questo non è un audit WCAG completo. Non ho modificato nessun file.

Nessun rilievo è P0. Due rilievi sono P1 perché bloccano chi usa la tastiera o un lettore di schermo: non riesce a inviare il modulo oppure non sa cosa scrivere nei campi.

## Rilievi

### 1. Il pulsante di invio è un `div`: non si raggiunge con la tastiera e non ha il ruolo di pulsante. P1
- **Criteri:** 2.1.1 Tastiera (A), 4.1.2 Nome, ruolo, valore (A)
- **Evidenza:** `index.html:24` `<div class="button" id="submit">Iscrivimi</div>`. `app.js:4` ascolta solo `click`. Il `div` non ha `tabindex` e non risponde a Invio o Spazio. Il modulo ha `novalidate` e nessun `submit`, quindi anche premere Invio in un campo non fa nulla.
- **Chi ne risente:** chi usa solo la tastiera, un lettore di schermo, un comando vocale o un dispositivo a pulsante.
- **Severità:** bloccante, perché l'iscrizione non si può completare.
- **Correzione:** usare `<button type="submit">Iscrivimi</button>` e gestire l'evento `submit` del form con `preventDefault()` al posto del `click` sul `div`.

### 2. I campi non hanno etichette: c'è solo il placeholder. P1
- **Criteri:** 1.3.1 Informazioni e correlazioni (A), 3.3.2 Etichette o istruzioni (A), 4.1.2 (A)
- **Evidenza:** `index.html:17-18` hanno solo `placeholder`, che sparisce appena si scrive. `index.html:19-20`: il `select` non ha un nome accessibile, e «Turno» è solo un'opzione con valore vuoto.
- **Chi ne risente:** chi usa un lettore di schermo, perché il nome dato dal placeholder non è affidabile e per il select manca. Anche chi ha problemi di memoria o di attenzione, perché perde l'indicazione mentre scrive.
- **Correzione:** aggiungere un `<label for="...">` visibile per ogni campo («Nome e cognome», «Email», «Turno»). Si può anche aggiungere `autocomplete="name"` e `autocomplete="email"`, che aiuta per 1.3.5 Identificare lo scopo degli input (AA).

### 3. Gli errori si vedono solo dal colore e non vengono annunciati. P1
- **Criteri:** 3.3.1 Identificazione degli errori (A), 1.4.1 Uso del colore (A), 3.3.3 Suggerimenti per gli errori (AA), 4.1.3 Messaggi di stato (AA)
- **Evidenza:** `app.js:9` aggiunge solo la classe `invalid`, e `style.css:43-45` cambia solo il colore del bordo in `#d00`. Non c'è un testo d'errore, non c'è `aria-invalid` e il focus non si sposta. `app.js:12` si ferma senza dire nulla.
- **Chi ne risente:** chi usa un lettore di schermo, chi distingue male i colori, chi ha poca vista.
- **Correzione:** mostrare sotto ogni campo un messaggio di testo («Inserisci un'email valida, ad esempio nome@dominio.it») collegato con `aria-describedby`. Impostare `aria-invalid="true"` e portare il focus sul primo campo sbagliato. Si può anche aggiungere un riepilogo degli errori in una regione `role="alert"`.

### 4. Il focus non si vede. P1
- **Criterio:** 2.4.7 Focus visibile (AA)
- **Evidenza:** `style.css:37-41` imposta `outline: none` su input, select e `.button`, senza nessun indicatore al suo posto.
- **Chi ne risente:** chi usa la tastiera, che non sa in quale campo si trova.
- **Correzione:** togliere la regola, oppure sostituirla con `:focus-visible { outline: 2px solid #2b59c3; outline-offset: 2px; }`.

### 5. Il testo di aiuto ha un contrasto troppo basso. P2
- **Criterio:** 1.4.3 Contrasto minimo (AA)
- **Evidenza:** `style.css:19-22`: `.hint` è `#aaa` su `#fff`, circa 2,3:1 a 14px, mentre il minimo è 4,5:1. Riguarda il testo «I posti sono 30…» in `index.html:15`.
- **Chi ne risente:** chi ha poca vista e chi legge lo schermo con molta luce.
- **Correzione:** usare almeno `#767676` (circa 4,5:1), oppure meglio `#595959`.

### 6. I bordi dei campi hanno un contrasto troppo basso. P2
- **Criterio:** 1.4.11 Contrasto non testuale (AA)
- **Evidenza:** `style.css:33`: il bordo `#ccc` su `#fff` arriva a circa 1,6:1, mentre per individuare il campo servono 3:1.
- **Chi ne risente:** chi ha poca vista, che fatica a capire dove sono i campi.
- **Correzione:** usare un bordo di almeno `#949494` (circa 3:1), per esempio `#767676`.

### 7. Il logo non ha un testo alternativo. P2
- **Criterio:** 1.1.1 Contenuti non testuali (A)
- **Evidenza:** `index.html:11`: l'`img` non ha l'attributo `alt`, quindi molti lettori di schermo leggono il nome del file. Il logo contiene il testo «Officina» (`logo.svg`).
- **Correzione:** aggiungere `alt="Officina"`.

### 8. La conferma di iscrizione non viene annunciata. P2
- **Criterio:** 4.1.3 Messaggi di stato (AA)
- **Evidenza:** `app.js:13-14` nasconde il form, quindi il focus si perde, e mostra `#done` (`index.html:26`), che non ha `role="status"` e non riceve il focus.
- **Chi ne risente:** chi usa un lettore di schermo, che non sa se l'iscrizione è riuscita.
- **Correzione:** dare a `#done` `role="status"` oppure `tabindex="-1"` e spostarci il focus dopo l'invio.

### 9. Manca la lingua della pagina. P2
- **Criterio:** 3.1.1 Lingua della pagina (A)
- **Evidenza:** `index.html:2`: `<html>` non ha `lang`.
- **Chi ne risente:** chi usa un lettore di schermo, che può leggere il testo italiano con la pronuncia sbagliata.
- **Correzione:** scrivere `<html lang="it">`.

### 10. I campi obbligatori non sono indicati. P3
- **Criteri:** 3.3.2 (A), 1.3.1 (A)
- **Evidenza:** `app.js:7` richiede tutti e tre i campi, ma nel markup non c'è `required` né un testo «obbligatorio».
- **Correzione:** aggiungere `required` (oppure `aria-required="true"`) e un'indicazione visibile, per esempio «Tutti i campi sono obbligatori».

## Cose che vanno già bene
- Il titolo della pagina è descrittivo (`index.html:6`), c'è un solo `h1` e ci sono i landmark `header` e `main`.
- Il testo bianco su `#2b59c3` del pulsante ha un contrasto di circa 6,4:1, quindi passa.
- Il `viewport` non blocca lo zoom. I campi usano `font-size` 16px.

## Cosa non ho verificato
- Non ho provato la pagina dal vivo: navigazione da tastiera, ordine del focus e comportamento con NVDA, JAWS o VoiceOver.
- Non ho controllato il reflow a 320px (1.4.10), lo zoom al 200% (1.4.4) e la spaziatura del testo (1.4.12). Dal CSS non vedo problemi evidenti.
- Non ho misurato le dimensioni dei bersagli (2.5.8), che dal CSS sembrano sufficienti.
- Non ho usato strumenti automatici come axe o Lighthouse.

## Correzioni proposte, da confermare
Correggere prima i rilievi 1–4 (P1), poi i rilievi 5–9 (P2) e infine il 10. Sono tutte modifiche piccole a `index.html`, `style.css` e `app.js`, senza dipendenze nuove. Dopo le correzioni andrebbe fatta una prova con la tastiera e con un lettore di schermo.
