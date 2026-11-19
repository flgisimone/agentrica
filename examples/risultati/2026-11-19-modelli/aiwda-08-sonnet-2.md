# Accessibilità pagina di iscrizione (WCAG 2.2 AA)

AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

Perimetro: lettura statica di `index.html`, `style.css`, `app.js`, `logo.svg` nella cartella del progetto (pagina statica, 3 campi + pulsante). Nessun browser, screen reader o strumento automatico eseguito: i rilievi sono da analisi del codice. Il contrasto è calcolato a mano. Non è un audit WCAG completo.

## Rilievi

| # | Prio | Criterio WCAG | File:riga | Problema |
|---|---|---|---|---|
| 1 | P1 | 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A) | index.html:24, style.css:47-54 | Il pulsante "Iscrivimi" è un `<div>`: non è focalizzabile con Tab, non si attiva con Invio/Spazio, non ha ruolo button. Chi usa tastiera o screen reader non può inviare il modulo. Impedisce il compito. |
| 2 | P1 | 1.3.1 Info and Relationships (A); 3.3.2 Labels or Instructions (A); 4.1.2 (A) | index.html:17-19 | Nessun `<label>` per nome, email, turno: solo placeholder (righe 17-18) e la prima option "Turno" (riga 20). Il placeholder sparisce alla digitazione; il nome accessibile non è affidabile. |
| 3 | P1 | 2.4.7 Focus Visible (AA); 2.4.11 Focus Not Obscured/2.4.13 (indicatore assente) | style.css:37-41 | `outline: none` su input, select e `.button` senza alternativa: nessun indicatore di focus. Tastiera inutilizzabile da vedenti. |
| 4 | P1 | 3.3.1 Error Identification (A); 1.4.1 Use of Color (A); 4.1.2 (A) | style.css:43-45, app.js:9 | L'errore è solo il bordo rosso (`.invalid`). Nessun testo di errore, nessun `aria-invalid`, nessun `aria-describedby`, nessun messaggio associato; la differenza di colore (#d00 vs #ccc) non è l'unico segnale accettabile. Chi non vede il colore non sa che c'è un errore né quale. |
| 5 | P2 | 4.1.3 Status Messages (AA); 3.3.1 (A) | index.html:26, app.js:13-14 | Il messaggio "Grazie, sei iscritto." compare con `hidden` rimosso senza `role="status"`/live region; il form viene nascosto (`form.hidden = true`) e il focus, che era sul pulsante, va perso (focus resta su elemento nascosto, torna al body). Lo screen reader può non annunciare nulla. |
| 6 | P2 | 1.4.3 Contrast (Minimum) (AA) | style.css:19-22 | `.hint` #aaa su #fff: contrasto circa 2,3:1 (richiesto 4,5:1 per testo di 14px). Il testo contiene un'informazione utile (posti, conferma). |
| 7 | P2 | 1.4.11 Non-text Contrast (AA) | style.css:33 | Bordo dei campi #ccc su #fff: circa 1,6:1 (richiesto 3:1). I confini dei campi sono difficili da individuare per ipovedenti. |
| 8 | P2 | 1.1.1 Non-text Content (A) | index.html:11 | `<img>` del logo senza `alt` (il logo contiene il testo "Officina"). Lo screen reader può leggere il nome del file. Serve `alt="Officina"` (o `alt=""` se decorativo, ma qui è identità del sito). |
| 9 | P2 | 3.1.1 Language of Page (A) | index.html:2 | `<html>` senza `lang`. Pagina in italiano: la pronuncia dello screen reader dipende dalla lingua dell'utente, non dal contenuto. Aggiungere `lang="it"`. |
| 10 | P2 | 3.3.7 Redundant Entry / 1.3.5 Identify Input Purpose (AA) | index.html:17-18 | Mancano `autocomplete="name"` e `autocomplete="email"` per nome ed email: 1.3.5 richiede l'attributo per i campi che raccolgono dati dell'utente. |
| 11 | P3 | 1.3.1 (A) | index.html:15 | Il testo di istruzione (posti, conferma) non è collegato al form (`aria-describedby`); non è un blocco per sé, ma l'informazione non raggiunge chi naviga i campi. |
| 12 | P3 | 3.3.1 / 3.3.3 Error Suggestion (AA) | app.js:8 | La validazione email accetta qualsiasi stringa con "@" e non dà alcun suggerimento di correzione (anche perché non c'è testo di errore, vedi 4). Verifica: `novalidate` disattiva anche la validazione nativa del browser, che offre messaggi parzialmente accessibili. |

## Note

- Contrasto pulsante #fff su #2b59c3: circa 6,4:1, conforme (calcolo a mano). Il colore del testo #222 su #fff è conforme.
- Il testo del placeholder usa il colore predefinito del browser (non impostato nel CSS): non verificato in un browser reale.
- Il campo `select` con valore vuoto "Turno" funge da etichetta: vedi rilievo 2.
- Ordine del focus e struttura titoli (un solo h1, sensata) corretti da analisi statica; il `<form>` non ha `<button type="submit">`, quindi Invio dentro un campo non invia (legato al rilievo 1).

## Test non eseguiti / limiti

Nessun test con screen reader (NVDA, VoiceOver), nessuna navigazione da tastiera reale, nessun axe/Lighthouse, nessuna prova di zoom 200%/400% (1.4.4, 1.4.10), spaziatura del testo (1.4.12), target size (2.5.8: il pulsante supera 24px, ma non misurato), orientamento, e nessun controllo del focus dopo l'invio in un browser. Tutti i rilievi hanno `requires_human_review: true` per la conferma con tecnologie assistive reali, tranne i fatti dimostrabili dal codice (1, 2, 3, 8, 9).

## Correzioni proposte (non applicate)

Sostituire il div con `<button type="submit">` e gestire l'evento `submit` del form; aggiungere `<label for>` visibili; ripristinare un focus visibile (es. `outline: 2px solid` con offset); messaggi di errore testuali con `aria-invalid` e `aria-describedby`, e riepilogo errori con focus sul primo campo non valido; `role="status"` o spostare il focus sul messaggio di conferma; contrasti (#767676 o più scuro per `.hint`, bordo almeno #767676); `alt` sul logo; `lang="it"`; `autocomplete`.

Priorità sintetica: 4 P1 (1, 2, 3, 4), 6 P2, 2 P3. Nessun P0.

— AIWDA-08 · GACRUX
