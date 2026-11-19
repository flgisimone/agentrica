# Accessibilità della pagina di iscrizione (WCAG 2.2 AA)

Ho verificato a mano il codice di `index.html`, `style.css`, `app.js` e `logo.svg`. Ho calcolato i rapporti di contrasto a partire dai colori nel CSS. Non ho aperto la pagina nel browser, non ho eseguito strumenti automatici (axe, Lighthouse) e non l'ho provata con un lettore di schermo. Questo non è un audit WCAG completo. Non ho modificato nessun file.

## Rilievi

| # | Criterio WCAG | File:riga | Evidenza | Utenti impattati | Severità | Priorità | Correzione consigliata |
|---|---|---|---|---|---|---|---|
| 1 | 2.1.1 Tastiera; 4.1.2 Nome, ruolo, valore | index.html:24, app.js:4 | Il pulsante «Iscrivimi» è un `<div>` con un gestore `click`. Non riceve il focus, non risponde a Invio o Spazio e non ha il ruolo di pulsante. Inoltre il form usa `novalidate` e non ha un submit, quindi nemmeno Invio in un campo invia il modulo. | Chi usa la tastiera, i lettori di schermo, i comandi vocali o i sensori a soffio: **non può iscriversi** | Bloccante | P0 | Usare `<button type="submit">Iscrivimi</button>` e spostare la logica su `form.addEventListener("submit", e => { e.preventDefault(); … })` |
| 2 | 1.3.1 Info e relazioni; 3.3.2 Etichette o istruzioni; 4.1.2 | index.html:17-23 | I campi non hanno `<label>`: l'unica indicazione è il placeholder, che sparisce mentre si scrive. La select usa la prima opzione «Turno» come etichetta. | Lettori di schermo (nome accessibile debole o assente), persone con disturbi cognitivi o di memoria | Alta | P1 | Aggiungere `<label for="name">Nome e cognome</label>` e lo stesso per email e turno. Per la select usare un'opzione vuota come «Scegli un turno» |
| 3 | 3.3.1 Identificazione degli errori; 1.4.1 Uso del colore; 4.1.3 Messaggi di stato | app.js:9, style.css:43-45 | L'errore è segnalato solo dal bordo rosso (`.invalid`). Non c'è un testo che spieghi l'errore, non viene impostato `aria-invalid`, il focus non si sposta sul primo campo sbagliato e non c'è un annuncio. | Daltonici, utenti di lettori di schermo, ipovedenti | Alta | P1 | Aggiungere sotto ogni campo un messaggio testuale (es. «Inserisci un'email valida») collegato con `aria-describedby`, impostare `aria-invalid="true"` e spostare il focus sul primo campo non valido |
| 4 | 2.4.7 Focus visibile | style.css:37-41 | `outline: none` su input, select e pulsante, senza nessuno stile sostitutivo. | Chi usa la tastiera | Alta | P1 | Rimuovere la regola oppure sostituirla con `:focus-visible { outline: 3px solid #2b59c3; outline-offset: 2px; }` |
| 5 | 1.4.3 Contrasto minimo | style.css:19-22 (index.html:15) | Il testo `.hint` è #aaa su #fff, con un rapporto di circa 2,3:1 a 14px (il minimo è 4,5:1). Contiene informazioni utili: numero di posti e tempi della conferma. | Ipovedenti, chi legge in piena luce | Media | P2 | Usare almeno #767676 (4,5:1), meglio #595959 |
| 6 | 1.4.11 Contrasto non testuale | style.css:33 | Il bordo dei campi è #ccc su #fff, circa 1,6:1 (il minimo è 3:1). Il confine dei campi si vede poco. | Ipovedenti | Media | P2 | Usare un bordo di almeno #949494 (circa 3:1) |
| 7 | 4.1.3 Messaggi di stato | index.html:26, app.js:13-14 | Il form viene nascosto e compare «Grazie, sei iscritto.», ma il messaggio non viene annunciato e il focus resta su un elemento ormai nascosto. | Lettori di schermo | Media | P2 | Dare a `#done` `role="status"` (oppure `tabindex="-1"` e spostarci il focus) |
| 8 | 1.1.1 Contenuti non testuali | index.html:11 | Il logo `<img>` non ha `alt`. Il lettore di schermo può leggere il nome del file. | Lettori di schermo | Media | P2 | `alt="Officina"`, oppure `alt=""` se il nome compare altrove |
| 9 | 3.1.1 Lingua della pagina | index.html:2 | `<html>` non ha l'attributo `lang`. | Lettori di schermo (pronuncia sbagliata), traduttori | Media | P2 | `<html lang="it">` |
| 10 | 1.3.5 Identificare lo scopo degli input | index.html:17-18 | I campi nome ed email non hanno `autocomplete`. | Persone con disabilità motorie o cognitive | Bassa | P3 | `autocomplete="name"` e `autocomplete="email"` |
| 11 | 3.3.2 (buona pratica) | index.html:16-23 | Non viene indicato che tutti i campi sono obbligatori. | Tutti, in particolare chi ha disturbi cognitivi | Bassa | P3 | Una nota «Tutti i campi sono obbligatori» e `required` / `aria-required="true"` sui campi |

Il rilievo P0 (n. 1) va segnalato subito: con la sola tastiera l'iscrizione è impossibile.

## Controlli superati

- Il testo del pulsante, bianco su #2b59c3, ha un contrasto di circa 6,3:1, sopra il minimo.
- Il viewport non blocca lo zoom.
- La pagina ha `<title>` e un solo `<h1>`, e usa i landmark `header` e `main`.

## Test non eseguiti

- Prova reale con tastiera e lettore di schermo (VoiceOver, NVDA).
- Ridimensionamento e reflow a 200% e 400% (1.4.4, 1.4.10).
- Spaziatura del testo (1.4.12).
- Dimensione del bersaglio (2.5.8): dalle misure nel CSS sembra adeguata, ma non l'ho misurata.
- Analisi automatica con axe o Lighthouse.
- Contrasto del testo «Officina» nel logo: #222 su sfondo bianco, probabilmente adeguato ma non verificato nel rendering.
