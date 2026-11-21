AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

# Rapporto di accessibilità: pagina di iscrizione (WCAG 2.2 AA)

**Perimetro.** Ho esaminato `index.html`, `style.css`, `app.js`, `README.md` e `logo.svg` in `copia-2`, la cartella indicata. Non ho modificato nulla e non ho avviato processi. Il progetto è una pagina statica con un form di tre campi (nome, email, turno).

**Metodo.** Ho fatto solo una revisione statica del codice. Non ho usato strumenti automatici, né un browser, né un lettore di schermo, e non ho fatto prove da tastiera a runtime. I rapporti di contrasto sono calcolati a mano dai valori esadecimali. Non è un audit WCAG completo.

**Biblioteca.** Non ho consultato le schede della biblioteca (wcag-2-2, en-301-549-v4, accessibilita-prodotti-servizi). I criteri citati sono quelli noti delle WCAG 2.2 e vanno confermati sulla fonte W3C prima di usarli in documenti formali.

## Rilievi

Numerazione e priorità sono mie. I numeri di riga sono quelli dei file originali.

| # | Priorità | Criterio WCAG | Dove | Problema |
|---|---|---|---|---|
| 1 | P1 | 4.1.2 Name, Role, Value; 2.1.1 Keyboard (A) | `index.html:24`, `app.js:4` | Il pulsante di invio è un `<div class="button" id="submit">` |
| 2 | P1 | 3.3.2 Labels or Instructions; 1.3.1; 4.1.2 (A) | `index.html:17-19` | I campi non hanno `<label>` e usano solo `placeholder` |
| 3 | P1 | 2.4.7 Focus Visible (AA) | `style.css:37-41` | `outline: none` su campi e pulsante, senza alternativa |
| 4 | P1 | 3.3.1 Error Identification (A); 1.4.1 Use of Color (A); 4.1.3 Status Messages (AA) | `app.js:9`, `style.css:43-45` | Gli errori sono segnalati solo dal colore del bordo |
| 5 | P2 | 1.4.3 Contrast (Minimum) (AA) | `style.css:19-22` | Il testo `.hint` ha contrasto troppo basso |
| 6 | P2 | 1.4.11 Non-text Contrast (AA) | `style.css:29-35` | Il bordo dei campi `#ccc` su bianco ha contrasto troppo basso |
| 7 | P2 | 4.1.3 Status Messages (AA) | `index.html:26`, `app.js:13-14` | La conferma non viene annunciata |
| 8 | P2 | 1.3.5 Identify Input Purpose (AA) | `index.html:17-18` | Mancano gli `autocomplete` sui dati personali |
| 9 | P2 | 1.1.1 Non-text Content (A) | `index.html:11` | Il logo `<img>` non ha `alt` |
| 10 | P3 | 3.1.1 Language of Page (A) | `index.html:2` | Manca `lang` su `<html>` |

### Dettaglio

**1. Pulsante di invio come `div` (P1).**
- **Fatto:** il `<div>` non è focalizzabile con Tab, non ha ruolo `button` e non risponde a Invio o Spazio. L'invio avviene solo con l'evento `click` (`app.js:4`).
- **Impatto:** chi usa la tastiera, un lettore di schermo o il controllo vocale non può inviare il form. Il compito principale è bloccato.
- **Correzione consigliata:** usare `<button type="submit">` e gestire l'evento `submit` del form invece del `click`.
- **Nota:** il `<form>` ha `novalidate` e non ha un submit button, quindi anche l'Invio dentro un campo non invia nulla.

**2. Campi senza etichetta (P1).**
- **Fatto:** i tre controlli (`name`, `email`, `session`) non hanno `<label>`, `aria-label` né `aria-labelledby`. Il `placeholder` sparisce alla digitazione e non sostituisce un'etichetta.
- **Fatto:** per il `<select>` il primo `<option>` "Turno" fa da etichetta implicita ed è anche un valore vuoto non valido.
- **Impatto:** i lettori di schermo possono non annunciare il nome del campo, e chi ha disabilità cognitiva o di memoria perde il riferimento mentre scrive.
- **Correzione consigliata:** aggiungere un `<label for>` visibile per ogni campo.

**3. Focus rimosso (P1).**
- **Fatto:** `input:focus, select:focus, .button:focus { outline: none; }` non ha uno stile sostitutivo.
- **Inferenza:** per i campi non c'è alcun indicatore di focus. L'ho dedotto dal codice e non l'ho verificato nel browser.
- **Nota:** il criterio corretto è 2.4.7. Non è 2.4.11 né 2.4.13 (quest'ultimo è AAA).
- **Impatto:** chi naviga da tastiera non vede dove si trova.
- **Correzione consigliata:** rimuovere la regola oppure sostituirla con un indicatore visibile, ad esempio `outline` o `box-shadow` contrastato.

**4. Errori solo con il colore (P1).**
- **Fatto:** `app.js:9` aggiunge la classe `.invalid`, che cambia solo `border-color: #d00`. Non c'è testo di errore, `aria-invalid`, `aria-describedby` né spostamento del focus sul primo campo errato.
- **Impatto:** non si distingue l'errore senza vedere i colori, e un lettore di schermo non sa che il campo è errato né perché.
- **Correzione consigliata:** aggiungere un messaggio testuale per campo (es. "Inserisci un indirizzo email valido") collegato con `aria-describedby` e impostare `aria-invalid="true"`.
- **Correzione consigliata:** spostare il focus sul primo campo errato oppure mostrare un riepilogo degli errori.
- **Nota:** il controllo email (`includes("@")`) è molto lasco, ma è una questione funzionale e non di accessibilità.

**5. Contrasto del testo `.hint` (P2).**
- **Fatto:** `#aaa` su `#fff` dà circa 2,3:1. Il testo è a 14px e richiede 4,5:1. Il contrasto è calcolato a mano, non misurato con uno strumento.
- **Impatto:** l'informazione sui posti e sulla conferma è poco leggibile per chi ha bassa visione.
- **Correzione consigliata:** scurire il testo fino ad almeno 4,5:1 (per esempio `#595959` o più scuro).
- **Fatto positivo:** il testo bianco su `#2b59c3` del pulsante è circa 6,5:1 e supera la soglia. Il corpo `#222` su `#fff` è ampiamente sufficiente.

**6. Contrasto dei bordi dei campi (P2).**
- **Fatto:** `#ccc` su `#fff` dà circa 1,6:1, sotto il 3:1 richiesto per i componenti dell'interfaccia.
- **Inferenza:** i campi non hanno altro indicatore del confine (né sfondo né etichette), quindi 1.4.11 si applica.
- **Correzione consigliata:** portare il bordo ad almeno 3:1, per esempio `#767676` o più scuro.

**7. Conferma non annunciata (P2).**
- **Fatto:** `app.js:13-14` nasconde il form (`form.hidden = true`) e mostra il paragrafo `#done`. Il paragrafo non è in una regione `role="status"` o `aria-live`.
- **Impatto:** il lettore di schermo può non annunciare la conferma. Inoltre il focus era sul pulsante che è stato nascosto e finisce su `body`.
- **Correzione consigliata:** usare `role="status"` o spostare il focus sul messaggio.

**8. `autocomplete` mancante (P2).**
- **Fatto:** i campi nome ed email non hanno `autocomplete`.
- **Nota:** il criterio è 1.3.5. Non è 3.3.7, che riguarda dati già inseriti nello stesso processo.
- **Correzione consigliata:** aggiungere `autocomplete="name"` e `autocomplete="email"`.

**9. Logo senza `alt` (P2).**
- **Fatto:** `<img src="logo.svg">` non ha l'attributo `alt`. Il file SVG contiene il testo "Officina" come grafica.
- **Inferenza:** il logo porta il nome dell'organizzazione e va quindi descritto.
- **Impatto:** il lettore di schermo può annunciare il nome del file. Se il logo è decorativo, serve `alt=""`.
- **Correzione consigliata:** `alt="Officina"` oppure `alt=""` se decorativo, da decidere con l'utente.

**10. Lingua della pagina (P3).**
- **Fatto:** `<html>` non ha `lang`. Il contenuto è in italiano.
- **Impatto:** i lettori di schermo possono scegliere una pronuncia errata.
- **Correzione consigliata:** `<html lang="it">`.

## Aspetti conformi o non verificabili

- **Zoom e viewport.** Il meta viewport è corretto (`width=device-width, initial-scale=1`) e non blocca lo zoom. Il testo dei campi è a 16px. Non ho verificato il reflow a 320px (1.4.10) né la spaziatura del testo (1.4.12).
- **Target size.** Il pulsante ha `padding: 12px` e i campi `padding: 10px` con testo a 16px: l'altezza plausibile supera 24px (2.5.8), ma non l'ho misurata.
- **Struttura.** C'è un solo `h1` e i landmark `header` e `main` sono presenti. In una pagina così corta non vedo una non conformità su 2.4.1 Bypass Blocks.
- **Dati già inseriti.** Non c'è un processo a più passi, quindi 3.3.7 Redundant Entry non si applica.
- **`hidden` e conferma.** L'uso di `hidden` è corretto come tecnica; il problema è solo l'annuncio (rilievo 7).

## Test non eseguiti

- Navigazione da tastiera a runtime (ordine di Tab, effettiva assenza di focus visibile).
- Prova con lettore di schermo (VoiceOver, NVDA).
- Controlli automatici (axe, Lighthouse).
- Misure reali dei contrasti, del target size e del reflow.
- Il comportamento del form in un browser.

## Note

- **Livello di certezza.** Tutti i rilievi derivano dalla lettura del codice. Quelli sui contrasti (5 e 6) sono calcoli a mano; confermarli con uno strumento. Il rilievo 3 è da provare nel browser.
- **Modello.** Lavoro su un modello più piccolo di quello della sessione. Ci sono rilievi P1: propongo il riesame del direttore del reparto (design-director) o di un revisore su Opus prima che diventino definitivi.
- **Requires human review.** Rilievi 3, 5 e 6 (da confermare con strumenti), e il 9 (decisione sul valore decorativo del logo).

— AIWDA-08 · GACRUX, Senior Accessibility Specialist
