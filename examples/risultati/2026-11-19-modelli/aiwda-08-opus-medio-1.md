AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

# Audit di accessibilità della pagina di iscrizione al workshop (WCAG 2.2 AA)

Ho fatto una revisione statica del codice di `index.html`, `style.css`, `app.js` e `logo.svg` e ho calcolato i contrasti con la formula WCAG. Non ho aperto la pagina in un browser e non ho usato tastiera, lettori di schermo, zoom o strumenti automatici come axe o Lighthouse. Quindi questo non è un audit WCAG completo, e ogni rilievo indica se l'ho osservato nel codice o se è un'inferenza. Non ho modificato nessun file.

**P0 da sapere subito:** chi usa solo la tastiera o un lettore di schermo non può inviare l'iscrizione. Il pulsante «Iscrivimi» è un `<div>` che risponde solo al clic (dettagli in A11Y-01).

## Rilievi

| ID | Criterio WCAG | File:riga | Problema (cosa ho visto nel codice) | Chi ne risente | Priorità |
|---|---|---|---|---|---|
| A11Y-01 | 2.1.1 Tastiera (A); 4.1.2 Nome, ruolo, valore (A) | index.html:24, app.js:4 | Il pulsante di invio è `<div class="button" id="submit">`: non ha ruolo, non riceve il focus e il codice ascolta solo `click`. Il form ha due campi di testo e nessun pulsante di invio, quindi anche Invio non invia nulla (inferenza dalle regole HTML sull'invio implicito, da provare nel browser). | Chi usa solo la tastiera, lettori di schermo, comandi vocali, sensori a interruttore | **P0** |
| A11Y-02 | 1.3.1 Info e correlazioni (A); 3.3.2 Etichette o istruzioni (A); 4.1.2 (A) | index.html:17-23 | Nessun campo ha un `<label>`: il nome è affidato al `placeholder`, che sparisce quando si scrive. Anche la `<select>` non ha un'etichetta: «Turno» è solo la prima opzione, e cosa annuncia il lettore di schermo cambia da uno all'altro (non verificato). | Utenti di lettori di schermo, persone con disturbi cognitivi o della memoria | P1 |
| A11Y-03 | 2.4.7 Focus visibile (AA) | style.css:37-41 | `outline: none` su input, select e `.button` senza nessuno stile di focus sostitutivo. Con la tastiera non si vede dove si trova il focus. | Chi usa la tastiera, persone ipovedenti | P1 |
| A11Y-04 | 3.3.1 Identificazione degli errori (A); 1.4.1 Uso del colore (A) | app.js:9, style.css:43-45 | Un errore cambia solo il colore del bordo (`.invalid`, `#d00`). Non ci sono testo di errore, `aria-invalid` né `aria-describedby`, e il focus non viene spostato sul primo campo errato. Il lettore di schermo non annuncia nulla (inferenza dal codice). | Utenti di lettori di schermo, persone daltoniche, persone con disturbi cognitivi | P1 |
| A11Y-05 | 1.4.3 Contrasto minimo (AA) | style.css:19-22 (testo in index.html:15) | Il testo `.hint` `#aaa` su `#fff` ha contrasto **2,32:1**, sotto il minimo di 4,5:1 per testo di 14px. È un'informazione utile: posti disponibili e tempi della conferma. | Persone ipovedenti o anziane, chi guarda lo schermo sotto luce forte | P1 |
| A11Y-06 | 1.1.1 Contenuti non testuali (A) | index.html:11 | `<img src="logo.svg">` non ha `alt`. Il logo contiene il nome «Officina» (logo.svg), che quindi il lettore di schermo non legge; alcuni leggono al suo posto il nome del file. | Utenti di lettori di schermo | P2 |
| A11Y-07 | 3.1.1 Lingua della pagina (A) | index.html:2 | `<html>` non ha `lang="it"`: la sintesi vocale può leggere il testo italiano con regole di pronuncia sbagliate. | Utenti di lettori di schermo | P2 |
| A11Y-08 | 4.1.3 Messaggi di stato (AA) | index.html:26, app.js:13-14 | La conferma «Grazie, sei iscritto.» appare togliendo `hidden`, ma non è in una regione live (`role="status"`) e il focus non ci viene spostato. Inoltre il form viene nascosto e il focus non va da nessuna parte (inferenza). | Utenti di lettori di schermo | P2 |
| A11Y-09 | 1.4.11 Contrasto non testuale (AA) | style.css:33 | Il bordo dei campi `#ccc` su `#fff` ha contrasto **1,61:1** (minimo 3:1), quindi i confini dei campi si vedono male. | Persone ipovedenti | P2 |
| A11Y-10 | 1.3.5 Identificare lo scopo dell'input (AA) | index.html:17-18 | Nome ed email non hanno `autocomplete` (`name`, `email`), quindi non c'è compilazione automatica né aiuto da tecnologie assistive. | Persone con disabilità motorie o cognitive | P3 |
| A11Y-11 | 3.3.2 Etichette o istruzioni (A) | index.html:15-23 | Non c'è scritto che tutti i campi sono obbligatori: la validazione in app.js:7 li richiede tutti, ma né il testo né `required`/`aria-required` lo dicono. | Tutti, in particolare utenti di lettori di schermo | P3 |

## Contrasti calcolati
- Testo `#222` su `#fff`: 15,91:1, conforme.
- Testo bianco su pulsante `#2b59c3`: 6,33:1, conforme.
- Bordo di errore `#d00` su `#fff`: 5,15:1, conforme come contrasto non testuale; resta però A11Y-04.
- Testo `.hint` `#aaa`: 2,32:1, non conforme (A11Y-05).
- Bordo dei campi `#ccc`: 1,61:1, non conforme (A11Y-09).

## Correzioni che consiglio (da confermare, non applicate)
1. **A11Y-01:** usare `<button type="submit">Iscrivimi</button>` e gestire l'evento `submit` del form con `preventDefault()` invece del `click` sul div.
2. **A11Y-02, A11Y-11:** aggiungere un `<label for>` visibile per ogni campo, compresa la select («Turno»), segnare i campi obbligatori nel testo e con `required` o `aria-required="true"`, e tenere il placeholder solo come esempio.
3. **A11Y-03:** togliere `outline: none` o sostituirlo, per esempio con `:focus-visible { outline: 2px solid #2b59c3; outline-offset: 2px; }`.
4. **A11Y-04:** per ogni campo errato mostrare un messaggio testuale collegato con `aria-describedby`, impostare `aria-invalid="true"` e spostare il focus sul primo campo errato. Facoltativo: un riepilogo degli errori in cima al form.
5. **A11Y-05:** colore di `.hint` di almeno `#767676` su bianco (4,54:1).
6. **A11Y-06:** `alt="Officina"` sul logo.
7. **A11Y-07:** `<html lang="it">`.
8. **A11Y-08:** mettere `role="status"` su `#done` oppure spostarci il focus con `tabindex="-1"` e `focus()`.
9. **A11Y-09:** bordo dei campi di almeno `#949494` (3,03:1 su bianco) o più scuro.
10. **A11Y-10:** `autocomplete="name"` e `autocomplete="email"`.

## Test non eseguiti
- Navigazione reale da tastiera e ordine del focus nel browser.
- Lettori di schermo (NVDA, JAWS, VoiceOver): annunci della select, degli errori e della conferma.
- Zoom al 200%, ridisposizione a 320px (1.4.10) e spaziatura del testo (1.4.12).
- Strumenti automatici (axe, Lighthouse).
- Dimensione dei bersagli (2.5.8): il pulsante è largo quanto il form e ho ipotizzato che superi i 24×24px, ma non l'ho misurato.
- Modalità a contrasto elevato o colori forzati.

Su A11Y-01, A11Y-04 e A11Y-08 serve una revisione umana con tastiera e lettore di schermo per confermare il comportamento previsto (`requires_human_review: true`).

## Sintesi
La pagina non rispetta le WCAG 2.2 AA. Il blocco principale è il pulsante di invio, che non si può usare da tastiera (P0). Seguono 4 rilievi P1 (etichette, focus invisibile, errori segnalati solo dal colore, contrasto del testo informativo), 4 P2 e 2 P3. Correggere A11Y-01, A11Y-02, A11Y-03 e A11Y-04 risolve le barriere che impediscono di iscriversi.

Firmato: GACRUX (AIWDA-08)