AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

# Audit accessibilità: pagina di iscrizione (WCAG 2.2 AA)

Perimetro: `index.html`, `style.css`, `app.js`, `logo.svg` nella cartella del progetto (analisi statica del codice). Non ho aperto la pagina in un browser, non ho usato lettori di schermo né strumenti automatici. I rapporti di contrasto sono calcolati a mano dai valori CSS. Questo non è un audit WCAG completo. Non ho modificato nessun file.

## Rilievi

### 1. Il pulsante "Iscrivimi" non è un controllo: tastiera e tecnologie assistive non possono inviare il modulo. P1
- WCAG 2.1.1 Tastiera (A), 4.1.2 Nome, ruolo, valore (A).
- File: `index.html:24` (`<div class="button" id="submit">`); `app.js:4` (solo evento `click`).
- Fatto: è un `div` senza ruolo, senza `tabindex`, senza gestione di Invio/Spazio. Il form non ha un pulsante di invio, quindi Invio nei campi non fa nulla.
- Impatto: chi usa solo la tastiera, comandi vocali o screen reader non può iscriversi. Il compito principale è bloccato.
- Correzione: usare `<button type="submit">` e gestire l'evento `submit` del form (`app.js:4`).

### 2. Campi senza etichetta (solo placeholder). P1
- WCAG 1.3.1 (A), 3.3.2 Etichette o istruzioni (A), 4.1.2 (A); anche 2.5.3 Label in Name.
- File: `index.html:17`, `index.html:18`, `index.html:19-20`.
- Fatto: nessun `<label>`, nome accessibile solo dal placeholder (nei campi di testo) e dall'opzione vuota "Turno" nel select. Il placeholder sparisce quando si scrive.
- Impatto: screen reader con nome incerto, persone con difficoltà di memoria, utenti di comandi vocali; il campo compilato perde il suo nome visibile.
- Correzione: un `<label for>` visibile per ciascun campo; nel select un'opzione guida tipo "Scegli un turno".

### 3. Indicatore di focus rimosso. P1
- WCAG 2.4.7 Focus visibile (AA); 2.4.11 Focus non oscurato e 2.4.13 Aspetto del focus (2.2).
- File: `style.css:37-41` (`outline: none` su input, select, `.button`).
- Fatto: nessun stile alternativo per `:focus`.
- Impatto: chi naviga con la tastiera non vede dove si trova.
- Correzione: eliminare la regola oppure sostituirla con un `:focus-visible` con contorno di almeno 2 px e contrasto 3:1.

### 4. Errori di validazione solo con il colore del bordo, senza testo né annuncio. P1
- WCAG 1.4.1 Uso del colore (A), 3.3.1 Identificazione dell'errore (A), 3.3.3 Suggerimenti (AA), 4.1.3 Messaggi di stato (AA), 4.1.2.
- File: `app.js:9-12`, `style.css:43-45`.
- Fatto: lo stato non valido aggiunge solo la classe `.invalid` (bordo `#d00` 1 px). Nessun messaggio, nessun `aria-invalid`, nessuna `aria-describedby`, il focus non va sul primo campo errato. Il bordo valido `#ccc` e quello errato differiscono solo per tonalità.
- Impatto: utenti non vedenti, con daltonismo o ipovisione non sanno che l'invio è fallito né perché; il pulsante sembra non fare nulla.
- Correzione: testo di errore per campo (ad es. "Inserisci un indirizzo email valido"), collegato con `aria-describedby`, `aria-invalid="true"`, riepilogo o focus sul primo errore.

### 5. Conferma dell'iscrizione non annunciata e focus perso. P2
- WCAG 4.1.3 Messaggi di stato (AA); 2.4.3 Ordine del focus (A).
- File: `app.js:13-14`, `index.html:26`.
- Fatto: il form viene nascosto (`hidden`) e compare `#done`, senza `role="status"`/`aria-live` e senza spostare il focus. L'elemento col focus sparisce.
- Impatto: con screen reader non si sa se l'invio è riuscito; il focus torna all'inizio del documento.
- Correzione: `role="status"` sul messaggio e `focus()` sul messaggio (con `tabindex="-1"`) o sul titolo.

### 6. Testo di aiuto con contrasto insufficiente. P2
- WCAG 1.4.3 Contrasto minimo (AA).
- File: `style.css:19-22` (`.hint` `#aaa` su `#fff`).
- Fatto (calcolato): circa 2,3:1, richiesto 4,5:1 (14 px, non grande). Contiene informazioni utili (30 posti, conferma entro un giorno).
- Impatto: ipovisione, lettura in luce forte.
- Correzione: colore più scuro, almeno circa `#767676` (4,5:1) o più.

### 7. Bordi dei campi con contrasto insufficiente. P2
- WCAG 1.4.11 Contrasto non testuale (AA).
- File: `style.css:29-35` (`border: 1px solid #ccc`).
- Fatto (calcolato): `#ccc` su `#fff` circa 1,6:1, richiesto 3:1. I campi non hanno altro indicatore del confine.
- Impatto: ipovisione, difficoltà a individuare i campi.
- Correzione: bordo di almeno 3:1 (circa `#767676`).

### 8. Lingua della pagina non dichiarata. P2
- WCAG 3.1.1 Lingua della pagina (A).
- File: `index.html:2` (`<html>` senza `lang`).
- Impatto: gli screen reader possono leggere il testo italiano con la pronuncia sbagliata.
- Correzione: `<html lang="it">`.

### 9. Logo senza alternativa testuale. P2
- WCAG 1.1.1 Contenuti non testuali (A).
- File: `index.html:11` (`<img>` senza `alt`).
- Fatto: il logo contiene il testo "Officina". Senza `alt` gli screen reader possono leggere il nome del file.
- Correzione: `alt="Officina"` (o `alt=""` se decorativo e il nome è già altrove).

### 10. Autocompletamento dei dati personali assente. P3
- WCAG 1.3.5 Identificare lo scopo dell'input (AA).
- File: `index.html:17-18`.
- Fatto: mancano `autocomplete="name"` e `autocomplete="email"`.
- Correzione: aggiungerli.

### 11. Campi obbligatori non indicati prima dell'invio. P3
- WCAG 3.3.2 (A).
- File: `index.html:17-19`; il controllo "vuoto" è in `app.js:7`.
- Fatto: tutti e tre i campi sono obbligatori, ma non è scritto né c'è `required`/`aria-required`. Il form usa `novalidate`, quindi non c'è nemmeno la validazione del browser.
- Correzione: indicare "obbligatorio" nel testo di aiuto o nelle etichette e usare `required`.

## Verificato come conforme (da codice)
- Contrasto di `#222` su `#fff` (testo) e `#fff` su `#2b59c3` (pulsante): sopra 4,5:1 per calcolo. Contrasto del placeholder predefinito non verificato.
- Titolo `h1` unico, landmark `header`/`main` presenti, `viewport` senza blocco dello zoom, dimensione del testo di 16 px nei campi.
- Dimensione del bersaglio del pulsante e dei campi (2.5.8): sembra adeguata per padding e font, non misurata nel browser.

## Non eseguito, da verificare
- Prova reale con tastiera, screen reader (VoiceOver, NVDA), zoom al 200–400% e reflow a 320 px (1.4.4, 1.4.10).
- Strumenti automatici (axe, Lighthouse).
- Contrasto effettivo del placeholder nei vari browser.
- Controllo della conferma con `prefers-reduced-motion` e altri aspetti del rendering; `logo.svg` non è stato valutato oltre il testo.
- Nota: la validazione `badEmail` (`app.js:8`) controlla solo la presenza di `@`; è una questione funzionale, non di accessibilità.

## Sintesi
Il modulo oggi non è utilizzabile da tastiera né con screen reader (rilievi 1-4, P1). Priorità: sostituire il `div` con un `<button type="submit">`, aggiungere le `label`, ripristinare il focus visibile e rendere gli errori testuali e annunciati. Poi contrasto, `lang`, `alt`, conferma annunciata. Nessun P0. Le correzioni vanno a un agente di sviluppo dopo la conferma dell'utente.

— AIWDA-08 · GACRUX
