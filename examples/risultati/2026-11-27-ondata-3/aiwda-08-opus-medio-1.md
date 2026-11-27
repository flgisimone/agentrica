AIWDA-08 · GACRUX — Senior Accessibility Specialist, reparto AIWDA (AI Web Design)

# Revisione dell'accessibilità di Turnio (WCAG 2.2 AA, sola lettura)

**Ambito:** ho esaminato `index.html`, `dipendenti.html`, `turni.html`, `impostazioni.html`, `css/tokens.css`, `css/app.css` e `js/app.js` nella copia del progetto (aiwda-08-3), più le 8 schermate in `schermate/`. Non ho modificato nessun file.

**Riferimento normativo:** scheda di biblioteca `wcag-2-2`. Fonte: W3C WAI, WCAG 2.2, W3C Recommendation del 5 ottobre 2023, verificata il 2026-11-19. Per questo compito non ho aperto le schede EN 301 549 e D.lgs. 82/2022.

**Come ho verificato:**
- **Fatti osservati:** lettura del codice, contrasti calcolati con la formula WCAG della luminanza relativa (script python locale sui valori esadecimali dei CSS), lettura delle schermate.
- **Non eseguito:** nessuna prova con tastiera reale, lettore di schermo o browser, nessuno strumento automatico (axe, Lighthouse). Questo **non è un audit WCAG completo**.

**Limite di consegna:** non ho il tool `agent`, quindi non ho caricato AIWDA-01 · CANOPUS. Il rapporto è per lui, da consolidare.

## Esito
Ho trovato 26 rilievi: nessun P0, 10 P1, 12 P2, 4 P3.

I blocchi principali sono:
- il focus è invisibile ovunque;
- il modulo dei dipendenti non ha etichette;
- la finestra dello scambio non si usa da tastiera;
- gli stati dei turni sono espressi solo dal colore;
- la sessione scade senza avviso;
- la settimana si elimina senza conferma.

## Rilievi

| ID | Criterio WCAG 2.2 | File:riga | Problema (evidenza) | Utenti colpiti | Priorità | Correzione proposta |
|---|---|---|---|---|---|---|
| A11Y-01 | 2.4.7 Focus Visible (AA) | css/app.css:14 | `*:focus { outline: none; }` toglie l'indicatore di focus a link, pulsanti, campi e summary, e nessuna regola `:focus-visible` lo sostituisce. Fa eccezione solo lo skip link (riga 12), che diventa visibile. | Chi usa la tastiera, ipovedenti | P1 | Togliere la riga 14 oppure aggiungere `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }`. |
| A11Y-02 | 3.3.2 Labels or Instructions (A), 1.3.1 Info and Relationships (A) | dipendenti.html:35-48 | I 14 campi hanno solo un `placeholder`, nessuna `<label>`. L'indicazione «obbligatorio» sta nel placeholder e sparisce appena si scrive. Lo stesso vale per i formati delle date (righe 40 e 46), che oltretutto sono diversi tra loro. Il `required` è annullato da `novalidate`. | Lettori di schermo, deficit cognitivi e di memoria, ipovedenti | P1 | Mettere una `<label for>` visibile per ogni campo, con l'obbligatorietà nel testo della label o `aria-required`, e il formato in un testo collegato con `aria-describedby`. |
| A11Y-03 | 3.3.1 Error Identification (A), 3.3.3 Error Suggestion (AA) | js/app.js:57-59, 63-66; dipendenti.html:49 | Si controlla solo il telefono, con un messaggio generico («Hai sbagliato il numero.») che non nomina il campo né il formato atteso (10 cifre). Il campo non riceve `aria-invalid` e il messaggio non è collegato al campo. Gli altri campi obbligatori non vengono controllati. Con un errore del server compare «Errore ${status}: payload non valido» e `form.reset()` cancella tutto quello che è stato inserito. | Tutti, in particolare lettori di schermo e deficit cognitivi | P1 | Validare tutti i campi obbligatori. Per ciascun errore: nome del campo, formato atteso, `aria-invalid="true"`, `aria-describedby` verso il messaggio, focus sul primo campo errato. Messaggio del server comprensibile e niente reset dei dati. |
| A11Y-04 | 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A) | turni.html:50; js/app.js:40-42 | La chiusura della finestra è uno `<span>` con un click: non si raggiunge col Tab, non ha ruolo né nome (legge solo «✕»). | Chi usa la tastiera, lettori di schermo | P1 | Usare `<button type="button" aria-label="Chiudi">` e gestire anche il tasto Esc. |
| A11Y-05 | 2.4.3 Focus Order (A), 4.1.2 Name, Role, Value (A) | turni.html:48-56; js/app.js:37-39, 45 | La finestra dello scambio non ha `role="dialog"`, `aria-modal` né `aria-labelledby`. All'apertura il focus resta sul pulsante ⇄ sotto lo sfondo, non è trattenuto nella finestra e alla chiusura non torna al pulsante che l'ha aperta. | Chi usa la tastiera, lettori di schermo | P1 | Usare `<dialog>` con `showModal()`, oppure `role="dialog" aria-modal="true" aria-labelledby` sul titolo h2. Spostare il focus nella finestra all'apertura e riportarlo a ⇄ alla chiusura. |
| A11Y-06 | 1.4.1 Use of Color (A), 1.1.1 Non-text Content (A) | turni.html:37-43, 45; css/app.css:54-57 | Presente, in ritardo e assente sono pallini `<span class="dot">` vuoti, distinti solo dal colore e senza testo alternativo: un lettore di schermo non comunica nulla. Nella legenda (riga 45) i tre «●» hanno tutti lo stesso grigio `.muted`: si vede anche nella schermata turni-telefono.png. Alcuni turni non hanno nessun pallino. | Daltonici, lettori di schermo, ipovedenti | P1 | Aggiungere un testo per ogni stato (visibile o `<span class="visually-hidden">in ritardo</span>`) e una forma o icona diversa per stato. Colorare correttamente i pallini della legenda. |
| A11Y-07 | 1.3.1 Info and Relationships (A) | turni.html:33-44; css/app.css:52-53 | La griglia dei turni è fatta di `<div>`, senza semantica di tabella: il lettore di schermo legge una sequenza di testi senza le relazioni dipendente/giorno. | Lettori di schermo | P1 | Usare `<table>` con `<caption>`, `<th scope="col">` per i giorni e `<th scope="row">` per i dipendenti. |
| A11Y-08 | 2.2.1 Timing Adjustable (A) | js/app.js:11-12 | Dopo 10 minuti dal caricamento si viene portati a `/login` senza avviso e senza possibilità di prolungare. Il timer non si azzera con l'attività, quindi chi compila il modulo lentamente perde i dati. | Chi è più lento: disabilità motorie e cognitive, tecnologie assistive | P1 | Avviso almeno 20 s prima della scadenza, con un comando per estendere, e timer azzerato a ogni interazione. Oppure niente scadenza lato client. |
| A11Y-09 | 3.3.4 Error Prevention (Legal, Financial, Data) (AA) | turni.html:28; js/app.js:22-25 | «Elimina settimana» cancella i dati sul server (DELETE) e svuota la griglia senza conferma né annullamento. In più ha lo stile `btn-primary`, lo stesso di «Pubblica». | Tutti, in particolare chi ha disabilità motorie (attivazioni involontarie) | P1 | Chiedere conferma nominando la settimana, oppure offrire un annullamento. Usare lo stile di pericolo. |
| A11Y-10 | 1.4.3 Contrast (Minimum) (AA) | css/tokens.css:6; css/app.css:41-42 | `--color-muted` #9aa0a6 ha contrasto 2,64:1 su #fff e 2,46:1 su #f6f7f9 (minimo 4,5:1). Riguarda il valore dei KPI (`.kpi-value`, 16px), la nota «I campi con * sono obbligatori», il caption della tabella, «Azioni», i ruoli nella griglia, le didascalie e le note dei grafici (13px). | Ipovedenti, chi guarda lo schermo con riflessi | P1 | Portare `--color-muted` almeno a #6a737d (circa 4,7:1 su #f6f7f9, da ricalcolare) e alzare i 13px. |
| A11Y-11 | 1.4.1 Use of Color (A), 1.1.1 Non-text Content (A) | index.html:72-81 | Nel grafico «Costo del lavoro e incassi» le due serie si distinguono solo per rosso e verde, che hanno luminanza quasi uguale (#cf222e 5,36:1 e #1a7f37 5,08:1 su bianco) e non si separano per chi ha protanopia o deuteranopia. L'SVG non ha ruolo né testo alternativo e i valori non sono scritti da nessuna parte. | Daltonici, lettori di schermo | P1 | Etichette dirette sulle linee, tratteggio diverso per serie, valori in una tabella o in un testo accanto, `role="img"` con `aria-label` o `<title>` di sintesi. |
| A11Y-12 | 3.1.1 Language of Page (A) | tutte le pagine HTML, riga 2 | `<html lang="en">` su contenuti in italiano: i lettori di schermo pronunciano con la voce inglese. | Lettori di schermo, sintesi vocale | P2 | Usare `lang="it"`. |
| A11Y-13 | 2.4.2 Page Titled (A) | tutte le pagine HTML, riga 6 | Ogni pagina ha lo stesso `<title>Turnio</title>`, quindi le pagine non si distinguono nelle schede e nella cronologia. | Lettori di schermo, deficit cognitivi | P2 | Titoli come «Turni – Turnio», «Personale – Turnio» e simili. |
| A11Y-14 | 4.1.2 Name, Role, Value (A), 2.4.6 Headings and Labels (AA) | dipendenti.html:26-28; turni.html:21, 23, 37 | I pulsanti con sola icona (✎, 🗑, ◀, ▶, ⇄) prendono il nome dal glifo Unicode, per esempio «lower right pencil», «wastebasket» o «black left-pointing triangle». Il nome non dice l'azione né la persona: le tre righe hanno pulsanti identici. | Lettori di schermo, controllo vocale | P2. Per i comandi di modifica ed eliminazione la valuterei P1: a orecchio non si capiscono e cancellano dati. | `aria-label` specifici, come «Modifica Giulia R.», «Elimina Giulia R.», «Settimana precedente», «Settimana successiva», «Scambia il turno di sabato». Icone con `aria-hidden`. |
| A11Y-15 | 4.1.3 Status Messages (AA) | dipendenti.html:53; turni.html:58; impostazioni.html:56; js/app.js:3-9 | Il toast non ha `role="status"` né `aria-live`, quindi «Fatto!» non viene annunciato. Sparisce dopo 1,5 s. | Lettori di schermo, lettori lenti | P2 | Mettere `role="status"` sul contenitore sempre presente, un testo specifico (es. «Turni pubblicati») e una durata più lunga o un modo per chiuderlo. |
| A11Y-16 | 4.1.3 Status Messages (AA) | impostazioni.html:20; js/app.js:92-94 | Il salvataggio automatico (PATCH al `change`) non dà nessun riscontro, né visivo né annunciato, e non gestisce gli errori. | Lettori di schermo, tutti | P2 | Messaggio di stato «Salvato» o «Salvataggio non riuscito» in una regione `role="status"`. |
| A11Y-17 | 1.4.3 Contrast (Minimum) (AA) | css/app.css:45, 47; impostazioni.html:42 | Il badge «3», testo bianco 14px su `--color-warning` #e8a33d, ha contrasto 2,16:1. | Ipovedenti | P2 | Testo scuro (#1b1f24) sul giallo oppure uno sfondo più scuro. |
| A11Y-18 | 1.4.3 Contrast (Minimum) (AA) | css/app.css:33; turni.html:54 | Il pulsante «OK» della finestra, testo bianco 15px su #2f81f7, ha contrasto 3,75:1. | Ipovedenti | P2 | Usare `.btn-primary` (#1f6feb, 4,63:1). |
| A11Y-19 | 1.4.11 Non-text Contrast (AA) | css/app.css:65; css/tokens.css:9 | Il bordo dei campi #d8dce1 ha contrasto 1,38:1 su #fff (minimo 3:1). Il bordo è l'unico elemento che rende riconoscibile il campo. | Ipovedenti | P2 | Bordo almeno #8c959f (da ricalcolare a 3:1). |
| A11Y-20 | 1.4.11 Non-text Contrast (AA) | css/tokens.css:31-32; css/app.css:56-57 | I pallini «in ritardo» (#e89b3a, 2,29:1) e «assente» (#e5534b, 3,70:1, su bianco) sono sotto o al limite. Inoltre `--color-danger` è ridefinito alla riga 31 e sovrascrive #cf222e della riga 11. | Ipovedenti | P2 | Colori a 3:1 o più e un solo valore per `--color-danger` (anche nell'ambito di A11Y-06). |
| A11Y-21 | 3.3.2 Labels or Instructions (A), 4.1.2 Name, Role, Value (A) | dipendenti.html:20; impostazioni.html:31 | La ricerca ha solo il placeholder. La select «Mese» non è associata al suo testo, quindi non ha nome accessibile. | Lettori di schermo, deficit cognitivi | P2 | `<label for="search">` (anche visivamente nascosta) e `<label for="export-month">Mese</label>`. |
| A11Y-22 | 2.4.4 Link Purpose (In Context) (A), da confermare | impostazioni.html:32 | Il link «Clicca qui» (`href="#"`, senza gestore in app.js) non dice cosa fa. Il contesto sta solo nel `<summary>` della sezione, che potrebbe non valere come contesto determinabile programmaticamente. | Lettori di schermo (elenco dei link) | P2 | Usare il testo «Scarica le presenze del mese» e un `<button>` o un link reale al file. |
| A11Y-23 | 1.4.10 Reflow (AA), da confermare per l'eccezione dei contenuti bidimensionali | css/app.css:52; index.html:35, 74, 84 | La griglia ha `width: 1100px` e gli SVG `width="560"`. Nelle schermate turni-telefono.png e index-telefono.png la pagina si allarga oltre il menu (circa 390px), con scorrimento orizzontale di tutta la pagina. La griglia potrebbe rientrare nell'eccezione per le tabelle di dati, ma lo scorrimento dovrebbe restare dentro il suo contenitore. | Ipovedenti con ingrandimento, telefono | P2 | Mettere la griglia in un contenitore `overflow-x: auto` con `tabindex="0"` e un nome. SVG con `width: 100%; height: auto`. |
| A11Y-24 | 1.1.1 Non-text Content (A) | index.html:83-89 | Il grafico «Ritardi per settimana» non ha alternativa testuale né valori scritti: i dati restano inaccessibili. | Lettori di schermo | P2 | Riepilogo testuale dei valori o tabella, e `role="img"` con nome. |
| A11Y-25 | 3.1.2 Language of Parts (AA) | tutte le pagine HTML, riga 12 | La voce «Settings» è in inglese dentro un'interfaccia italiana, e la pagina si chiama «Impostazioni». | Lettori di schermo | P3 | Usare «Impostazioni» come voce del menu (consigliato), oppure `lang="en"` sulla voce. |
| A11Y-26 | 1.1.1 Non-text Content (A) | index.html:35, 51 | L'SVG delle barre non ha ruolo: il lettore di schermo legge testi sparsi («60 65 70 lun…»), anche se i dati sono ripetuti alla riga 48. La torta ha `aria-label="Torta del costo per ruolo"`, che non riassume i dati. La legenda è testuale ed è sufficiente, ma i colori delle fette adiacenti sono quasi uguali (#1f6feb e #2f81f7, 1,24:1). | Lettori di schermo, ipovedenti | P3 | Barre: `aria-hidden="true"` e rinvio al testo della riga 48, oppure `role="img"` con nome. Torta: `aria-labelledby` verso il titolo h2 e la legenda, oppure sostituirla con barre orizzontali etichettate. |

## Nota sul criterio 1.3.5
**1.3.5 Identify Input Purpose (AA), non applicato.** Nel modulo di dipendenti.html non c'è `autocomplete`. Non lo segnalo come violazione: 1.3.5 riguarda i dati dell'utente stesso, mentre qui il gestore inserisce i dati di un'altra persona. Conviene comunque `autocomplete="off"` o valori coerenti.

## Cose che ho trovato corrette
- Skip link presente.
- Menu con `aria-label` e `aria-current`; la pagina corrente si distingue anche per il grassetto, non solo per il colore.
- `<main>` presente e struttura dei titoli h1/h2 coerente.
- Tabelle di dipendenti e impostazioni con `<th scope="col">`.
- Campi delle impostazioni con `<label for>`.
- `confirm()` prima di «Elimina locale».
- `prefers-reduced-motion` rispettato.
- Aree dei bersagli ≥ 24px per i pulsanti icona (stima da CSS: font 18px più padding 6px).

## Test non eseguiti
- Navigazione da tastiera reale e ordine del focus nel browser.
- Lettori di schermo (NVDA, VoiceOver).
- Zoom al 200% e spaziatura del testo (1.4.4, 1.4.12).
- Contrasto del placeholder: dipende dal browser, non è definito nei CSS.
- Strumenti automatici.
- Pulsanti ✎ e 🗑 della tabella dei dipendenti: non hanno gestori in app.js, quindi non ho valutato il comportamento delle azioni di modifica ed eliminazione.

## Domande aperte per CANOPUS e per l'utente
1. Per A11Y-23 la griglia dei turni rientra nell'eccezione 1.4.10 come tabella di dati?
2. Per A11Y-14 confermi P2 o alziamo a P1?
3. Le pagine sono un prototipo o la versione che va in produzione? Cambia l'urgenza dei P1.
4. Per rilievi su confirm, dati e testi conviene coinvolgere UX Writer e Usability Auditor (es. «Procedi», «OK/No», «Fatto!»): sono fuori dal mio perimetro WCAG.

## Riepilogo
— GACRUX (AIWDA-08)

Le 4 pagine hanno barriere di livello A su focus, etichette, finestra modale, uso del colore, semantica della griglia e tempi della sessione, più contrasti AA insufficienti sui token `--color-muted`, warning e bordi. Le correzioni più efficaci sono quattro:
- ripristinare il focus visibile;
- aggiungere label e validazione accessibile al modulo;
- riscrivere la finestra con `<dialog>`;
- rendere testuali gli stati dei turni.

Verifiche manuali con tastiera e lettore di schermo restano da fare prima di chiudere i rilievi.
