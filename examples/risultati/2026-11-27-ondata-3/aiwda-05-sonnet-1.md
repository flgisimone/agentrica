AIWDA-05 · MIMOSA — Senior UI Designer, reparto AIWDA (AI Web Design)

# Rapporto per AIWDA-01 · CANOPUS: revisione UI di Turnio (sola lettura)

**Esito.** 20 rilievi: 3 P1, 12 P2, 5 P3. Più gravi su telefono: fuoco da tastiera rimosso e tre pagine che sforano la larghezza dello schermo.

**Cosa ho esaminato.** `css/app.css`, `css/tokens.css`, le 4 pagine HTML, `docs/componenti.md`, le 4 schermate del telefono in `schermate/` (non ho aperto quelle del computer) e `js/app.js` righe 1-60. Nessun processo avviato.
**Biblioteca.** WCAG 2.2 (W3C Recommendation del 5 ottobre 2023, verificata il 2026-11-19, da ricontrollare entro il 2027-05-19): letta la sezione «Come si applica».
**Contrasti.** I rapporti sono stime mie dai codici colore, non misure con strumento. `requires_human_review: true` su R2, R10, R18, R19.

## Rilievi

**R1 · P1 · Focus da tastiera rimosso.** `app.css:14` `*:focus { outline: none; }` senza alternativa (WCAG 2.2, 2.4.7, AA). Correzione: eliminare la regola e definire `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }`.

**R2 · P1 · Testo secondario con contrasto insufficiente.** `tokens.css:6` `--color-muted: #9aa0a6`, usato da `.muted` (`app.css:42`) e `.kpi-value` (`app.css:41`). Su `#f6f7f9` circa 2,5:1 contro 4,5:1 (WCAG 2.2, 1.4.3, AA); testo 13 px (sottotitoli, didascalie dei grafici, legenda, ruolo, valori KPI in `index-telefono.png`). Correzione: token a circa `#5f6670` o più scuro; i valori dei KPI non devono essere muted.

**R3 · P1 · Pagine che sforano la larghezza del telefono.** Le schermate sono larghe 1126 px (`turni-telefono.png`), 426 (`dipendenti-telefono.png`) e 584 (`index-telefono.png`) a fronte di 390 di viewport. Cause: `.week` con `width: 1100px` (`app.css:52`); svg con `width="560"`/`"260"` fissi (`index.html:35,51,74,84`); tabella a 5 colonne (`dipendenti.html:22`). Correzione: contenitore `overflow-x: auto` con colonna dei nomi `position: sticky`, oppure schede sotto i 600 px; svg `width: 100%; height: auto` col `viewBox`; aggiungere almeno una media query (il CSS non ne ha).

**R4 · P2 · Gerarchia invertita nelle schede KPI.** `app.css:40-41`: etichetta 18 px bold nera, valore 16 px regular grigio. Correzione: valore in `--font-size-xl` bold, colore testo; etichetta 14 px muted (dopo R2).

**R5 · P2 · Due primarie affiancate, una distruttiva.** `turni.html:27-28`: «Pubblica i turni» ed «Elimina settimana» entrambi `btn-primary`, contro `docs/componenti.md` (una sola primaria). «Salva» va a capo da sola. Correzione: «Elimina settimana» in `btn-danger` (o secondario) e distanziato.

**R6 · P2 · Pulsante «OK» della finestra fuori sistema.** `.button` (`app.css:33`): raggio 20 px, `#2f81f7`, nessuna altezza minima; bianco su `#2f81f7` circa 3,8:1. Usato in `turni.html:54`. Correzione: `class="btn btn-primary"` ed eliminare `.button`.

**R7 · P2 · Larghezza fissa della finestra.** `app.css:71` `.modal-box { width: 420px }` sborda su 390 px. Correzione: `width: min(420px, calc(100vw - 32px))`.

**R8 · P2 · «Chiudi» della finestra non è un controllo.** `turni.html:50`: `span` con ✕ e `float: right`, senza ruolo, non raggiungibile da tastiera, senza nome accessibile. Correzione: `<button class="icon-btn" aria-label="Chiudi">`. Focus nella finestra ed Esc (promessi in `docs/componenti.md`) non li ho trovati nel codice letto, ma ho letto solo parte di `js/app.js`: da verificare.

**R9 · P2 · Bersagli piccoli e icone senza testo.** `.icon-btn` (`app.css:35`) alto circa 30 px; ✎ 🗑 (`dipendenti.html:26-28`), ◀ ▶ ⇄ (`turni.html`) senza `aria-label`; in `dipendenti-telefono.png` le due icone si impilano e 🗑 ha tratto diverso (emoji). Correzione: 44 px minimi, `aria-label`, set di icone SVG unico. WCAG 2.2, 2.5.8 (24 px, AA) probabilmente soddisfatto.

**R10 · P2 · Colori di stato.** `.badge` (`app.css:45`) testo bianco 14 px: su `--color-warning #e8a33d` circa 2,2:1, su `--color-late #e89b3a` analogo, su `#e5534b` circa 3,7:1. I pallini `.dot` (10 px) distinguono presente/ritardo/assente solo per colore (verde/arancio/rosso, problema per il daltonismo); la legenda `turni.html:45` ha tre pallini tutti grigi e non spiega nulla. `docs/componenti.md` dice che il badge ha sempre un testo, i pallini no. Correzione: testo scuro sui badge chiari, forma o etichetta per ogni stato, pallini della legenda con le classi `.dot-*`.

**R11 · P2 · Token duplicato.** `--color-danger` è `#cf222e` (`tokens.css:12`) e `#e5534b` (`tokens.css:31`, vince). `.btn-danger` (`app.css:30`) usa il letterale, badge ed errori il token: due rossi. `.error` in `#e5534b` su `#f6f7f9` circa 3,3:1. Correzione: un solo valore (per esempio `#cf222e`) e `var(--color-danger)` ovunque.

**R12 · P2 · Colori e misure fuori dai token.** Letterali `#1f6feb`, `#1a5fd0`, `#2f81f7`, `#cf222e` (`app.css:19,27,28,30,33`) e negli svg; spaziature 22, 13, 7, 18, 12 px (`app.css:17,22-23,38,52-53`); corpi 13/14/15/17/18 px accanto ai token; `--color-primary` mai usato; `docs/componenti.md` dichiara il tema scuro ma `tokens.css` non lo definisce. Correzione: usare `var(--color-primary)` e `--space-*`, aggiungere i token mancanti, allineare la documentazione o togliere la frase sul tema scuro.

**R13 · P2 · Menu.** `index.html:12-15`: «Settings» in inglese e primo; «Squadra» punta a una pagina titolata «Personale» (`dipendenti.html:19`); gap fisso, niente `flex-wrap`; voce attiva marcata solo da colore e peso. A 390 px entra (`index-telefono.png`) ma con poco margine. Correzione: nomi coerenti in italiano («Impostazioni», «Squadra»/«Personale» uguali), `flex-wrap` o scroll orizzontale, indicatore oltre il colore (bordo inferiore). Il tema dei nomi tocca anche AIWDA-08.

**R14 · P2 · Campi senza etichetta.** `dipendenti.html:35-48`: 14 campi con solo `placeholder` (contro `docs/componenti.md`), senza `type` (`tel`, `email`, `date`) né `autocomplete`. La ricerca (`dipendenti.html:20`) senza label né classe, bordo di sistema e attaccata al titolo (`dipendenti-telefono.png`). Errore unico in fondo (`#form-error`), `.field .error` mai usato per campo. Correzione: `<label>` visibili, `type`/`autocomplete`, sezioni («Dati personali», «Contratto»), ricerca con `.field`. WCAG 2.2, 1.3.1/3.3.2 (dettaglio ad AIWDA-06).

**R15 · P2 · Tabella su telefono.** `dipendenti-telefono.png`: nome e telefono vanno a capo («Giulia / R.», «333 120 / 4455»), «Ore nel mese» su tre righe; la `caption` (`.muted`, centrata) è staccata e finisce accanto alla ricerca; «Azioni» grigio illeggibile. Correzione: `white-space: nowrap` sulle colonne brevi con contenitore scorrevole, o nascondere «Telefono» sotto i 600 px; caption a sinistra e colore testo; «Azioni» in colore testo.

**R16 · P2 · Scambi da approvare.** `impostazioni.html:46-48`: «OK» e «No» identici (`btn-secondary`), etichette ambigue senza riferimento al turno; tabella a 4 colonne con testi lunghi dentro un `details`. Correzione: «Approva» primario, «Rifiuta» secondario, `aria-label` col turno, scheda per scambio su telefono.

**R17 · P3 · `details` annidati a tre livelli.** `impostazioni.html:22-39` (Locale, Esporta, Presenze): azioni principali a 3 clic; `summary` alto circa 22 px e marcatore piccolo (`impostazioni-telefono.png`); badge «3» arancio poco leggibile; «Clicca qui» (`impostazioni.html:32`) è un link con aspetto di pulsante. Correzione: sezioni piatte o `summary` con padding 12 px e bordo; etichetta «Scarica le presenze».

**R18 · P3 · Grafici (parte visiva; dati ad AIWDA-04).** Barre (`index.html:34-47`): asse 60-70 che amplifica le differenze, testo 12 px, nessun valore sulle barre. Torta (`index.html:51-70`): 8 sfumature dello stesso blu, le ultime (`#cae8ff`, `#ddf4ff`) quasi invisibili in `index-telefono.png`, legenda separata dalle fette. Doppio asse (`index.html:72-81`): 0-8.000 € contro 20.000-26.000 €, l'incrocio delle linee non significa nulla, rosso/verde distinguibili solo per colore. Linea dei ritardi senza etichette sui punti. Gli svg non hanno `role="img"` né alternativa testuale, tranne la torta. Correzione: asse da zero, barre orizzontali ordinate al posto della torta, un solo asse o due grafici, etichette dirette, testo almeno 14 px, colori dai token.

**R19 · P3 · Toast.** `app.css:74` `position: fixed; bottom/right: 24px`, senza `max-width`: su telefono può coprire «Procedi»; scompare dopo 1,5 s (`js/app.js:9`); «Fatto!» (`js/app.js:25,39`) non dice cosa è successo; `#toast` senza `role="status"`. Correzione: `left/right: 16px` su telefono, 5 s, `role="status"`, messaggio specifico («Turni pubblicati»).

**R20 · P3 · Spaziature verticali e righe di pulsanti.** `app.css:21-23,26`: pulsanti in `<p>` senza gap (in `turni-telefono.png` «Salva» a capo quasi attaccata); ricerca attaccata all'`h1` (margine 7 px); la cella con ⇄ rende più alta la riga di Giulia con testo disallineato (`app.css:52-53`). Correzione: `.actions { display: flex; flex-wrap: wrap; gap: var(--space-2); }`, `align-items: center` nelle celle, margini dei titoli dalla scala `--space-*`.

## Regole visive da rendere coerenti
1. Un solo set di colori, dai token (R11, R12).
2. Un solo pulsante, `.btn` (R6).
3. Stato = testo + forma + colore (R10).
4. Etichette sempre visibili (R14).
5. Niente larghezze fisse in px (R3, R7).
6. Bersagli di almeno 44 px su telefono (R8, R9, R17).

## Domande aperte
- Grafici e tabella per telefono: rivederli con AIWDA-04 prima di decidere se sostituire la torta.
- Il tema scuro è previsto? Da confermare con l'utente: implementarlo o togliere la frase da `docs/componenti.md`.

## Limiti
Solo schermate del telefono, in sola lettura; nessuna prova in browser (hover, focus ed Esc non osservati); contrasti calcolati a mano, non misurati con strumento; `js/app.js` letto solo in parte (righe 1-60).

— AIWDA-05 · MIMOSA, Senior UI Designer
