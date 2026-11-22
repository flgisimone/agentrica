AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

# Rapporto: accessibilità della pagina di iscrizione (WCAG 2.2 AA)

Progetto: copia-1 (index.html, style.css, app.js, logo.svg, README.md).

Metodo: solo analisi statica del codice. Non ho aperto la pagina in un browser, non ho usato lettori di schermo né strumenti automatici, né fatto prove dal vivo da tastiera. I rapporti di contrasto sono calcolati a mano dai valori esadecimali. Non è un audit WCAG completo. Fiducia alta su tutti i rilievi, perché derivano direttamente dal codice. Tutti gli stati sono `Nuova`.

I rilievi 1-4 sono P1. Propongo il riesame di un revisore su Opus o del direttore del reparto prima che diventino definitivi.

## Rilievi

### 1. Il pulsante "Iscrivimi" non è un controllo, e il modulo non si invia da tastiera
- Priorità: P1
- Criteri: 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A).
- Evidenza:
  - `index.html:24` usa `<div class="button" id="submit">Iscrivimi</div>`.
  - `app.js:4` ascolta solo `click` sul div.
  - Il div non ha `tabindex`, `role="button"` né gestione di Invio o Spazio.
  - Dentro il form non c'è alcun `<button type="submit">` e non c'è un listener `submit` sul modulo.
- Utenti coinvolti: chi usa solo tastiera o dispositivi che la emulano (switch, comandi vocali); utenti di lettori di schermo.
- Correzione consigliata: `<button type="submit">`, con la validazione agganciata all'evento `submit` del modulo.

### 2. Nessuna etichetta associata ai campi, solo placeholder
- Priorità: P1
- Criteri: 3.3.2 Labels or Instructions (A), 1.3.1 Info and Relationships (A), 4.1.2 (A).
- Evidenza:
  - `index.html:17` e `index.html:18` hanno solo `placeholder` ("Nome e cognome", "Email").
  - `index.html:19-23`: il `<select id="session">` non ha `<label>`; "Turno" è solo la prima `<option value="">`.
  - Nel file non ci sono `<label>` né `aria-label`.
- Utenti coinvolti: lettori di schermo (il placeholder non è un nome accessibile affidabile), persone con difficoltà di memoria o cognitive (il testo sparisce quando si digita), chi usa comandi vocali.
- Correzione consigliata: `<label for="…">` visibile per tutti e tre i campi; il placeholder resta solo come esempio.

### 3. L'indicatore di focus è rimosso
- Priorità: P1
- Criterio: 2.4.7 Focus Visible (AA).
- Evidenza: `style.css:37-41` imposta `outline: none` su `input:focus`, `select:focus` e `.button:focus`, senza alcun indicatore sostitutivo.
- Utenti coinvolti: chi naviga da tastiera, con switch o con basso visus.
- Nota: oggi il pulsante non è raggiungibile da tastiera (rilievo 1), quindi il difetto vale per campi e select; dopo la correzione del rilievo 1 varrà anche per il pulsante. Non cito 2.4.13, che è AAA.
- Correzione consigliata: togliere `outline: none`, oppure definire un `:focus-visible` con contrasto di almeno 3:1.

### 4. Errori di validazione comunicati solo dal colore e non annunciati
- Priorità: P1
- Criteri: 1.4.1 Use of Color (A), 3.3.1 Error Identification (A), 4.1.3 Status Messages (AA). Da confermare: 3.3.3 Error Suggestion (AA) e 4.1.2 (A) per il collegamento programmatico dell'errore al campo.
- Evidenza:
  - `app.js:9` aggiunge la classe `invalid`; `style.css:43-45` la traduce solo in `border-color: #d00`.
  - Non c'è testo d'errore, `aria-invalid`, `aria-describedby`, `role="alert"` né messaggio riassuntivo.
  - Il focus non viene spostato sul primo campo in errore.
  - `novalidate` (`index.html:16`) disattiva la validazione nativa, che altrimenti darebbe un messaggio accessibile.
- Utenti coinvolti: daltonici e ipovedenti, utenti di lettori di schermo (il click sembra non fare nulla), utenti di tastiera.
- Correzione consigliata: testo d'errore accanto a ogni campo che dica cosa correggere, collegato con `aria-describedby` e `aria-invalid="true"`; spostare il focus sul primo campo in errore o usare una regione `role="alert"`.

### 5. Testo di aiuto con contrasto insufficiente
- Priorità: P2
- Criterio: 1.4.3 Contrast (Minimum) (AA).
- Evidenza: `style.css:19-22`, `.hint` usa `#aaa` su `#fff` (`style.css:5`), 14 px. Rapporto calcolato circa 2,3:1, contro 4,5:1. Il testo contiene l'informazione sui 30 posti e sulla conferma entro un giorno (`index.html:15`).
- Utenti coinvolti: persone con ipovisione o ridotta sensibilità al contrasto.
- Correzione consigliata: colore scurito fino ad almeno 4,5:1 (per esempio `#595959` o più scuro).

### 6. Bordi dei campi con poco contrasto
- Priorità: P2
- Criterio: 1.4.11 Non-text Contrast (AA).
- Evidenza: `style.css:29-35`, bordo `#ccc` su `#fff`, circa 1,6:1 contro 3:1. I campi non hanno altro indizio visivo (nessuno sfondo o ombra).
- Utenti coinvolti: ipovedenti, che faticano a riconoscere i campi.
- Correzione consigliata: bordo ad almeno 3:1 (per esempio `#767676` o più scuro).
- Nota: il pulsante `#2b59c3` con testo bianco ha circa 6,3:1, quindi è a norma.

### 7. Manca `autocomplete` sui campi dei dati personali
- Priorità: P2
- Criterio: 1.3.5 Identify Input Purpose (AA).
- Evidenza: `index.html:17` e `index.html:18` (nome ed email) non hanno `autocomplete`.
- Utenti coinvolti: persone con disabilità motorie o cognitive che si affidano al riempimento automatico.
- Correzione consigliata: `autocomplete="name"` e `autocomplete="email"`. Non è 3.3.7 Redundant Entry.

### 8. Conferma di invio non annunciata e focus perso
- Priorità: P2
- Criteri: 4.1.3 Status Messages (AA); da confermare 2.4.3 Focus Order (A).
- Evidenza: `app.js:13-14` nasconde il modulo (`form.hidden = true`) e mostra `#done` (`index.html:26`). `#done` non ha `role="status"` né `aria-live`; il focus resta su un elemento nascosto.
- Utenti coinvolti: utenti di lettori di schermo e di tastiera, che non sanno se l'iscrizione è andata a buon fine.
- Correzione consigliata: dare a `#done` `role="status"` oppure `tabindex="-1"` e spostarvi il focus. Per un'applicazione reale, valutare anche il caso di invio fallito.

### 9. Il logo non ha alternativa testuale
- Priorità: P2
- Criterio: 1.1.1 Non-text Content (A).
- Evidenza: `index.html:11` usa `<img src="logo.svg" …>` senza `alt`; `logo.svg` contiene il testo "Officina". Non impedisce il compito, quindi non è P1.
- Utenti coinvolti: lettori di schermo, che leggono il nome del file.
- Correzione consigliata: `alt="Officina"` se il logo identifica l'organizzazione; `alt=""` se decorativo.

### 10. Manca `lang` e le landmark sono incomplete
- Priorità: P2 per `lang`, P3 per le landmark.
- Criteri: 3.1.1 Language of Page (A), 1.3.1 Info and Relationships (A).
- Evidenza: `index.html:2` ha `<html>` senza `lang` mentre il contenuto è in italiano. Il resto della struttura va bene (`<main>`, un solo `<h1>`, `<header>`).
- Correzione consigliata: `<html lang="it">`.

## Cosa non ho verificato
- Rendering reale in un browser e prove con tastiera dal vivo.
- Lettori di schermo (VoiceOver, NVDA, JAWS).
- Zoom al 200% e reflow a 320 px (1.4.4, 1.4.10).
- Spaziatura del testo (1.4.12).
- Dimensione dei bersagli (2.5.8 Target Size, Minimum).
- Contrasto del testo del placeholder.
- Strumenti automatici (axe, Lighthouse).
- Non ho consultato le schede della biblioteca del reparto (wcag-2-2, en-301-549-v4, accessibilita-prodotti-servizi). I criteri sono citati dalle WCAG 2.2 e non dalle schede.

## Riepilogo
La pagina ha 10 rilievi. I quattro P1 (pulsante non raggiungibile da tastiera, etichette mancanti, focus rimosso, errori solo con il colore) impediscono o rendono molto difficile il compito a chi usa tastiera o lettore di schermo. Vanno confermati con una prova dal vivo prima di essere considerati definitivi.

Non ho modificato nulla né avviato processi, quindi non c'è nulla da fermare.

Firmato: AIWDA-08 · GACRUX — Senior Accessibility Specialist.
