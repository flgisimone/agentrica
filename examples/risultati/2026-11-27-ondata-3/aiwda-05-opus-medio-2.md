AIWDA-05 · MIMOSA — Senior UI Designer, reparto AIWDA (AI Web Design)

Audit in sola lettura di Turnio. Ho esaminato le quattro pagine HTML, `css/app.css`, `css/tokens.css`, `docs/componenti.md`, `js/app.js` (solo per i comportamenti visibili) e le 8 schermate (1280 px e 390 px). Non ho modificato nessun file. Non ho potuto caricare AIWDA-01 · CANOPUS perché in questa esecuzione il tool `agent` non c'è: consegno direttamente a chi mi ha avviato. Ho letto la scheda di biblioteca wcag-2-2 (W3C, WCAG 2.2, Recommendation del 5 ottobre 2023, verificata il 2026-11-19). I rapporti di contrasto li ho calcolati io con la formula WCAG sui valori esadecimali.

## Esito
Ci sono 4 rilievi P1, 9 P2 e 3 P3. Nessun P0. I problemi principali sono quattro:
- la pagina va fuori schermo sul telefono in tre pagine su quattro;
- il focus da tastiera è stato tolto;
- l'azione distruttiva ha lo stesso aspetto di quella principale;
- il testo secondario ha un contrasto insufficiente.

Il design system che descrive `docs/componenti.md` non corrisponde al CSS: ci sono colori scritti a mano, token ridefiniti, un secondo stile di pulsante e il tema scuro dichiarato ma assente.

## Rilievi (posizione · problema · correzione)

**MIM-01 · P1 · Turni: la pagina va fuori schermo sul telefono**
- Dove: `css/app.css:52`, `.week { width: 1100px }`.
- Evidenza: `schermate/turni-telefono.png` è larga 1126 px invece di 390. Il menu ha lo sfondo bianco solo sui primi 390 px. I pulsanti vanno a capo e «Salva» resta da solo su una riga.
- Impatto: il compito più frequente (preparare i turni) richiede lo scorrimento orizzontale di tutta la pagina. Non rispetta WCAG 2.2, 1.4.10 Reflow.
- Correzione:
  - togliere la larghezza fissa e mettere la griglia in un contenitore `overflow-x: auto` con la prima colonna `position: sticky; left: 0`;
  - oppure, sotto i 600 px, passare a una vista per giorno o per dipendente (elenco).
  - Mettere i pulsanti in un contenitore `display: flex; flex-wrap: wrap; gap: var(--space-2)`.

**MIM-02 · P1 · Cruscotto: i grafici sono a larghezza fissa e vanno fuori schermo**
- Dove: `index.html:35`, `:74` e `:84`, `<svg width="560">`.
- Evidenza: `schermate/index-telefono.png` è larga 584 px. Le schede numeriche invece si adattano (`.cards` con auto-fit).
- Correzione: togliere `width`/`height` e usare `width:100%; height:auto` con il `viewBox` già presente (es. `svg { max-width: 100%; height: auto; }` in app.css). Le etichette a 12 px dentro gli SVG, ridotte, diventano illeggibili: va verificato dopo la correzione.

**MIM-03 · P1 · Focus da tastiera eliminato in tutto il pannello**
- Dove: `css/app.css:14`, `*:focus { outline: none; }`.
- Non esiste uno stile di focus alternativo, mentre `docs/componenti.md` prevede lo stato «con il focus da tastiera». Non rispetta WCAG 2.2, 2.4.7 Focus Visible (AA).
- Correzione: togliere la regola e definire `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }`.
- Lo stato non è osservabile nelle schermate: l'evidenza è solo nel codice.

**MIM-04 · P1 · «Elimina settimana» ha lo stile dell'azione principale, accanto a «Pubblica i turni»**
- Dove: `turni.html:27-28`, due `btn-primary` blu identici.
- Evidenza: `schermate/turni-computer.png`. Due pulsanti con lo stesso aspetto fanno una cosa costruttiva e una distruttiva (in `js/app.js:22-25` la seconda svuota la griglia senza conferma).
- Correzione:
  - `delete-week` diventa `btn-danger`, staccato e dopo «Salva» (o in un menu secondario);
  - resta un solo `btn-primary` per vista, come dice `docs/componenti.md`.
  - La conferma prima dell'eliminazione va segnalata alla UX (AIWDA usabilità).

**MIM-05 · P2 · Testo secondario con contrasto insufficiente**
- Dove: `tokens.css:6`, `--color-muted: #9aa0a6`. Ha un contrasto di 2,64:1 su bianco e 2,46:1 sullo sfondo `#f6f7f9`, quindi non rispetta WCAG 2.2, 1.4.3 (minimo 4,5:1).
- Dove si usa: sottotitoli (`index.html:20`), note dei grafici, didascalia della tabella, ruoli nella griglia (`turni.html:36`), «I campi con * sono obbligatori» (`dipendenti.html:33`), valori dei KPI (`app.css:41`).
- Correzione: `--color-muted` almeno `#5f6670` (circa 5,9:1 su bianco) e `.muted` a 14 px (`--font-size-sm`) invece di 13 px (`app.css:42`).

**MIM-06 · P2 · KPI con la gerarchia invertita**
- Dove: `app.css:40-41`. L'etichetta è a 18 px bold con il colore del testo, il valore a 16 px regular grigio.
- Evidenza: `index-computer.png`, dove «31%», «461» e «4» sono l'elemento meno visibile della scheda.
- Correzione:
  - `.kpi-value { font-size: var(--font-size-xl); font-weight: 700; color: var(--color-text); }`;
  - `.kpi-label { font-size: var(--font-size-sm); font-weight: 400; color: var(--color-muted corretto); }`;
  - mettere l'etichetta sopra il valore, come già avviene.

**MIM-07 · P2 · Il token `--color-danger` è ridefinito e il rosso non è coerente**
- Dove: `tokens.css:12` (`#cf222e`), poi `:31` (`#e5534b`), quindi vale il secondo. Intanto `.btn-danger` usa `#cf222e` scritto a mano (`app.css:30`).
- Effetti:
  - due rossi diversi;
  - il badge e il pallino «assente» hanno testo bianco su `#e5534b`, a 3,7:1;
  - il testo d'errore a 14 px è a 3,7:1. Non rispetta 1.4.3.
- Correzione: togliere il secondo blocco `:root` (`tokens.css:29-33`) o farlo puntare a `#cf222e` (5,36:1). Usare `var(--color-danger)` in `.btn-danger`. `--color-late` (`#e89b3a`) è quasi uguale a `--color-warning` (`#e8a33d`): basta un solo token.

**MIM-08 · P2 · Badge «warning» illeggibile**
- Dove: `app.css:45,47`. Testo bianco su `#e8a33d` a 2,16:1, per esempio il badge «3» in `impostazioni.html:42`. Non rispetta 1.4.3.
- Correzione: testo scuro (`var(--color-text)`, circa 8:1) sui badge gialli o arancioni, oppure un fondo più scuro (es. `#9a6700`, circa 4,9:1 con bianco).

**MIM-09 · P2 · Colori scritti a mano invece dei token, e tema scuro assente**
- Dove: `app.css:19`, `:27`, `:28` (hover `#1a5fd0`), `:30`, `:33`, `:74` (`#fff`), e i colori negli SVG di `index.html`.
- `docs/componenti.md:3` dichiara che tutti i colori vengono dai token e che c'è il tema scuro. Nel CSS non c'è nessun `prefers-color-scheme` né `[data-theme]`.
- Correzione:
  - sostituire con `var(--color-primary)` e aggiungere `--color-primary-hover` e `--color-on-primary`;
  - poi aggiungere i token scuri, oppure correggere il documento finché il tema scuro non esiste.

**MIM-10 · P2 · Due componenti pulsante per la stessa funzione**
- Dove: `.button` (`app.css:33`, pillola con raggio 20 px, `#2f81f7`, 15 px, senza stato hover/focus) nella finestra di scambio (`turni.html:54`), mentre altrove si usa `.btn`. `#2f81f7` con il bianco è a 3,75:1, sotto il 4,5:1 richiesto per il testo a 15 px.
- Correzione: eliminare `.button` e usare `.btn btn-primary`.

**MIM-11 · P2 · La scala di spaziature e la tipografia non usano i token**
- Dove:
  - `app.css:17`: gap 22, padding 13, font 15;
  - `:21`: main 24 scritto a mano;
  - `:22`: h1 margine 7;
  - `:23`: h2 17 px, margini 22/13;
  - `:38`: gap 13;
  - `:53`: padding 7.
- Effetto: ritmo irregolare. Il titolo è troppo vicino al sottotitolo (7 px), le schede sono distanziate di 13 px ma hanno 24 px di spazio interno.
- Correzione:
  - riportare tutto a `--space-1…4`: h1 margine `var(--space-2)`; h2 `var(--space-4) 0 var(--space-3)`; gap delle schede `var(--space-3)`;
  - h2 a `--font-size-lg` (20 px), così la scala diventa 28/20/16/14;
  - menu 16 px con `--space-3`.

**MIM-12 · P2 · Turni: i pallini di stato dipendono solo dal colore e la legenda è grigia**
- Dove: `turni.html:45`, legenda «● presente ● in ritardo ● assente» tutta in `.muted`.
- Evidenza: `turni-computer.png`, dove i tre pallini della legenda hanno lo stesso grigio. Il pallino di 10 px (`app.css:54`) contro lo sfondo dà 1.4.11 da verificare e 1.4.1 non rispettato. Il sistema prevede `.badge` con testo (`docs/componenti.md`).
- Correzione: legenda con i pallini colorati (`dot-ok/late/absent`), più un simbolo o un'abbreviazione accanto all'orario nelle celle (es. badge «ritardo»), oppure un `title` o un testo nascosto.

**MIM-13 · P2 · Dipendenti su telefono: tabella e ricerca**
- Dove: `dipendenti.html:20-30`.
- Evidenza: `dipendenti-telefono.png`, larga 426 px:
  - la tabella sfora;
  - nomi e telefoni vanno a capo su 2-3 righe («Giulia / R.», «333 120 / 4455»);
  - le icone ✎ e 🗑 sono impilate;
  - il campo di ricerca non ha stile (nessuna classe: è piccolo, senza altezza minima né bordo coerente);
  - la didascalia è centrata e grigia sopra la tabella.
- Correzione:
  - sotto i 600 px la tabella diventa un elenco a schede, oppure resta in un contenitore `overflow-x:auto` con `white-space: nowrap` sul telefono;
  - la ricerca va dentro `.field` con etichetta, larghezza 100% e `min-height: 40px`;
  - le azioni stanno in `display:flex; gap: var(--space-1)`.

**MIM-14 · P2 · Modulo: segnaposto al posto delle etichette ed errore senza stile**
- Dove: `dipendenti.html:35-48`. Nessuna `<label>`, contro `docs/componenti.md` («il segnaposto non sostituisce l'etichetta»). Il testo del segnaposto non ha un colore definito.
- `<p class="error">` (`:49`) sta fuori da `.field`, quindi `.field .error` (`app.css:66`) non si applica e l'errore compare nel colore del testo normale.
- Correzione:
  - `<label>` visibile sopra ogni campo;
  - la regola diventa `.error { color: var(--color-danger); font-size: var(--font-size-sm); }`;
  - errore accanto al campo interessato.
- La lunghezza del modulo (14 campi obbligatori) va passata a UX e privacy.

**MIM-15 · P3 · Finestra di scambio più larga del telefono**
- Dove: `app.css:71`, `width: 420px` oltre i 390 px del viewport. La chiusura è uno `<span>` ✕ con float (`turni.html:50`, `app.css:72`).
- Correzione: `width: min(420px, calc(100vw - 2*var(--space-3)))` e chiusura con `<button class="icon-btn" aria-label="Chiudi">`.
- È un'inferenza dal codice: la finestra aperta non compare in nessuna schermata.

**MIM-16 · P3 · Rifiniture visive del cruscotto e della griglia**
- (a) Il banner «🔔 3 scambi da approvare» (`index.html:22-24`) ha lo stesso stile delle schede KPI e nessun link: serve una variante di avviso (bordo o sfondo warning) con un link «Approva gli scambi».
- (b) La legenda della torta (`index.html:61`) ha sia il pallino dell'elenco sia il pallino colorato: `list-style:none; padding:0`.
- (c) Otto tonalità di blu nella torta sono indistinguibili sulle fette piccole: `#ddf4ff` e `#cae8ff` su sfondo hanno contrasto di 1,06 e 1,19, sotto il minimo di 3:1 per gli elementi grafici di 1.4.11.
- (d) La cella «Sab» di Giulia è allineata più in basso per l'icona ⇄ (`turni.html:37`, `.icon-btn` a 18 px con padding 6): `vertical-align: middle; padding: 0 var(--space-1)` o `line-height:1`.
- (e) L'asse delle ore che parte da 60 (`index.html:34`) e il grafico con due assi (`:73`) esagerano le differenze: li segnalo al Data Visualization Designer, non sono di mia competenza.

**Nota di coerenza (per UX Writer e IA)**
- Il menu dice «Settings» e «Dashboard» in inglese e mette Impostazioni per prima.
- In `dipendenti.html` il menu dice «Squadra», il titolo «Personale», il modulo «Aggiungi una risorsa».
- «Swap del turno», «OK/No» e «Clicca qui».
- `lang="en"` su pagine in italiano.
- Impostazioni nasconde lo scambio da approvare e l'esportazione dentro `<details>` annidati su tre livelli, senza stile (`impostazioni.html:22-39`, `impostazioni-telefono.png`).

## Regole visive da rendere coerenti
1. Un solo `btn-primary` per vista; le azioni distruttive sempre `btn-danger` e separate.
2. Solo token, sia per i colori sia per le spaziature (4/8/16/24) e la scala tipografica (28/20/16/14).
3. Testo secondario almeno 4,5:1 e mai sotto i 14 px.
4. Gli stati si mostrano con colore più testo o simbolo; i badge hanno un testo con contrasto di almeno 4,5:1.
5. Ogni contenitore largo (griglia, tabella, grafico) si adatta o scorre da solo sotto i 600 px, mai tutta la pagina.

## JSON
```json
{"project":"Turnio","audit_id":null,"agent":"AIWDA-05 MIMOSA","page":{"name":"Pannello responsabili (4 pagine)","url":"index.html, turni.html, dipendenti.html, impostazioni.html"},
"observations":[
{"id":"MIM-01","type":"visual","title":"Griglia turni a 1100px: overflow su telefono","description":".week ha width:1100px; la pagina misura 1126px a viewport 390","evidence":{"url":"turni.html","screenshot":"schermate/turni-telefono.png","location":"css/app.css:52; turni.html:26-44","steps":["Aprire turni.html a 390px"]},"impact":"Il compito principale richiede scroll orizzontale dell'intera pagina; WCAG 2.2, 1.4.10","priority":"P1","confidence":0.95,"recommendation":"Contenitore overflow-x:auto con prima colonna sticky o vista a elenco sotto 600px; pulsanti in flex-wrap","status":"Nuova","requires_human_review":false},
{"id":"MIM-02","type":"visual","title":"Grafici SVG a larghezza fissa","description":"svg width=560 fanno uscire la pagina a 584px","evidence":{"url":"index.html","screenshot":"schermate/index-telefono.png","location":"index.html:35,74,84","steps":["Aprire index.html a 390px"]},"impact":"Scroll orizzontale sul cruscotto; WCAG 2.2, 1.4.10","priority":"P1","confidence":0.95,"recommendation":"svg{max-width:100%;height:auto} usando il viewBox","status":"Nuova","requires_human_review":false},
{"id":"MIM-03","type":"accessibility","title":"Focus da tastiera rimosso","description":"*:focus{outline:none} senza alternativa","evidence":{"url":"tutte","screenshot":null,"location":"css/app.css:14","steps":["Navigare con Tab"]},"impact":"Chi usa la tastiera non vede dove si trova; WCAG 2.2, 2.4.7","priority":"P1","confidence":0.9,"recommendation":":focus-visible{outline:2px solid var(--color-primary);outline-offset:2px}","status":"Nuova","requires_human_review":true},
{"id":"MIM-04","type":"consistency","title":"Elimina settimana con stile primario","description":"Due btn-primary identici, uno distruttivo","evidence":{"url":"turni.html","screenshot":"schermate/turni-computer.png","location":"turni.html:27-28","steps":["Aprire turni.html"]},"impact":"Rischio di cancellare la settimana scambiandola per Pubblica","priority":"P1","confidence":0.9,"recommendation":"btn-danger separato; un solo primario per vista","status":"Nuova","requires_human_review":false},
{"id":"MIM-05","type":"accessibility","title":"Testo muted 2,46-2,64:1","description":"--color-muted #9aa0a6 a 13px","evidence":{"url":"tutte","screenshot":"schermate/index-computer.png","location":"css/tokens.css:6; css/app.css:41-42","steps":[]},"impact":"Sottotitoli, note, valori KPI poco leggibili; WCAG 2.2, 1.4.3","priority":"P2","confidence":0.95,"recommendation":"#5f6670 e 14px","status":"Nuova","requires_human_review":false},
{"id":"MIM-06","type":"visual","title":"Gerarchia KPI invertita","description":"Etichetta 18px bold, valore 16px grigio","evidence":{"url":"index.html","screenshot":"schermate/index-computer.png","location":"css/app.css:40-41","steps":[]},"impact":"I numeri, informazione principale, sono l'elemento meno visibile","priority":"P2","confidence":0.9,"recommendation":"Valore 28px bold colore testo, etichetta 14px secondaria","status":"Nuova","requires_human_review":false},
{"id":"MIM-07","type":"consistency","title":"--color-danger ridefinito","description":"#cf222e sovrascritto da #e5534b; btn-danger hardcoded","evidence":{"url":"tutte","screenshot":null,"location":"css/tokens.css:12,31; css/app.css:30","steps":[]},"impact":"Due rossi; badge ed errore a 3,7:1","priority":"P2","confidence":0.95,"recommendation":"Rimuovere tokens.css:29-33, usare il token ovunque; unificare --color-late e --color-warning","status":"Nuova","requires_human_review":false},
{"id":"MIM-08","type":"accessibility","title":"Badge warning 2,16:1","description":"Bianco su #e8a33d","evidence":{"url":"impostazioni.html","screenshot":"schermate/impostazioni-telefono.png","location":"css/app.css:45,47; impostazioni.html:42","steps":[]},"impact":"Conteggio poco leggibile; WCAG 2.2, 1.4.3","priority":"P2","confidence":0.95,"recommendation":"Testo var(--color-text) o fondo #9a6700","status":"Nuova","requires_human_review":false},
{"id":"MIM-09","type":"consistency","title":"Colori hardcoded e tema scuro assente","description":"Hex nel CSS e negli SVG; docs dichiara tema scuro inesistente","evidence":{"url":"tutte","screenshot":null,"location":"css/app.css:19,27,28,30,33,74; docs/componenti.md:3","steps":[]},"impact":"Il sistema non si può aggiornare né tematizzare","priority":"P2","confidence":0.9,"recommendation":"Token primary/hover/on-primary; tema scuro o correzione del documento","status":"Nuova","requires_human_review":false},
{"id":"MIM-10","type":"consistency","title":"Componente .button duplicato","description":"Pillola #2f81f7 3,75:1 senza stati","evidence":{"url":"turni.html","screenshot":null,"location":"css/app.css:33; turni.html:54","steps":[]},"impact":"Stessa azione con aspetto diverso; contrasto insufficiente","priority":"P2","confidence":0.85,"recommendation":"Usare .btn .btn-primary ed eliminare .button","status":"Nuova","requires_human_review":false},
{"id":"MIM-11","type":"visual","title":"Spaziature e tipografia fuori scala","description":"22/13/7 px e h2 17px non sono token","evidence":{"url":"tutte","screenshot":"schermate/index-computer.png","location":"css/app.css:17,21-23,38,53","steps":[]},"impact":"Ritmo irregolare, titolo attaccato al sottotitolo","priority":"P2","confidence":0.85,"recommendation":"Solo --space-1..4; scala 28/20/16/14","status":"Nuova","requires_human_review":false},
{"id":"MIM-12","type":"accessibility","title":"Stati turni solo a colore, legenda grigia","description":"Legenda con tre pallini dello stesso grigio","evidence":{"url":"turni.html","screenshot":"schermate/turni-computer.png","location":"turni.html:45; css/app.css:54-57","steps":[]},"impact":"Stato non decodificabile; WCAG 2.2, 1.4.1","priority":"P2","confidence":0.9,"recommendation":"Legenda colorata e testo/simbolo nelle celle","status":"Nuova","requires_human_review":false},
{"id":"MIM-13","type":"visual","title":"Tabella dipendenti e ricerca su telefono","description":"Tabella 426px, testi a capo, icone impilate, ricerca senza stile","evidence":{"url":"dipendenti.html","screenshot":"schermate/dipendenti-telefono.png","location":"dipendenti.html:20-30","steps":["Aprire a 390px"]},"impact":"Elenco difficile da leggere e usare sul telefono","priority":"P2","confidence":0.9,"recommendation":"Schede sotto 600px o overflow-x:auto con nowrap; ricerca in .field; azioni in flex","status":"Nuova","requires_human_review":false},
{"id":"MIM-14","type":"usability","title":"Campi senza etichetta, errore senza stile","description":"Solo placeholder; .field .error non si applica a #form-error","evidence":{"url":"dipendenti.html","screenshot":"schermate/dipendenti-telefono.png","location":"dipendenti.html:35-49; css/app.css:66","steps":[]},"impact":"Contesto perso durante la compilazione; errore poco visibile","priority":"P2","confidence":0.9,"recommendation":"Label visibili; regola .error globale con --color-danger","status":"Nuova","requires_human_review":false},
{"id":"MIM-15","type":"visual","title":"Finestra 420px su viewport 390","description":"Larghezza fissa e chiusura come span","evidence":{"url":"turni.html","screenshot":null,"location":"css/app.css:71-72; turni.html:50","steps":["Aprire lo scambio a 390px"]},"impact":"Finestra tagliata su telefono (inferenza)","priority":"P3","confidence":0.7,"recommendation":"width:min(420px,calc(100vw - 32px)); button per chiudere","status":"Nuova","requires_human_review":true},
{"id":"MIM-16","type":"visual","title":"Rifiniture cruscotto e griglia","description":"Banner uguale alle schede, doppio marcatore nella legenda, blu indistinguibili, cella Sab disallineata","evidence":{"url":"index.html, turni.html","screenshot":"schermate/index-computer.png; schermate/turni-computer.png","location":"index.html:22-24,52-70; turni.html:37","steps":[]},"impact":"Avviso poco evidente, lettura dei grafici più lenta","priority":"P3","confidence":0.8,"recommendation":"Variante avviso con link; list-style:none; palette distinguibile; vertical-align:middle","status":"Nuova","requires_human_review":false}],
"tested_scenarios":["Revisione statica di 4 HTML, app.css e tokens.css","Confronto con docs/componenti.md","Lettura delle 8 schermate 1280/390px","Calcolo dei contrasti dai valori esadecimali"],
"limitations":["Nessun browser: stati hover/focus/disattivato, finestra aperta e toast non osservati","Tema scuro non verificabile perché assente","AIWDA-01 non caricato: tool agent non disponibile","Assi troncati e grafico a due assi solo segnalati al Data Visualization Designer"],
"summary":"4 P1 (overflow sul telefono in turni e cruscotto, focus rimosso, eliminazione con stile primario), 9 P2 su contrasto, gerarchia dei KPI, token e coerenza dei componenti, 3 P3 di rifinitura."}
```

## Domande aperte
- Il pannello deve funzionare davvero sul telefono, per il responsabile la domenica sera? Le schermate a 390 px fanno pensare di sì: se è così, MIM-01 e MIM-13 diventano prioritari.
- Il tema scuro è previsto? Se non lo è, va corretto `docs/componenti.md`.

— AIWDA-05 · MIMOSA
