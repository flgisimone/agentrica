AIWDA-06 · ADHARA — Senior Design System Specialist, reparto AIWDA (AI Web Design)

# Audit del design system di Turnio (sola lettura)

**Esito:** il design system esiste solo in parte. I token ci sono, ma il CSS li usa poco: in `app.css` ho trovato circa 40 valori scritti a mano. `--color-danger` è definito due volte con due valori diversi. Il pulsante della finestra dello scambio duplica `.btn`. Mancano gli stati di focus, disattivato e caricamento. In quattro punti `docs/componenti.md` descrive cose che il codice non fa: tema scuro, focus, etichette dei campi e gestione della finestra.

**Limiti:**
- Non avevo il tool `agent`, quindi non ho caricato il direttore AIWDA-01 · CANOPUS. Questo rapporto va consolidato da lui.
- Ho fatto un'analisi statica: ho letto `css/*`, `docs/componenti.md`, le 4 pagine HTML e `js/app.js`, e ho guardato 5 delle 8 schermate (le 4 da computer e `turni-telefono.png`). Non ho aperto un browser, quindi hover, focus e stati di errore non li ho visti: li ricavo dal CSS.
- Ho calcolato i contrasti con la formula WCAG sui valori esadecimali.
- Fonte per i criteri: scheda di biblioteca `wcag-2-2`, W3C WCAG 2.2 (Recommendation del 5 ottobre 2023), verificata il 2026-11-19.

## Inventario dei componenti

| Componente | Dove è definito | Dove si usa | Documentato |
|---|---|---|---|
| `.btn` primary, secondary, danger | `app.css:26-30` | tutte le pagine | sì |
| `.button` | `app.css:33` | `turni.html:54` (finestra dello scambio) | no, è un doppione di `.btn` |
| `.icon-btn` | `app.css:35` | `turni.html:21,23,37`, `dipendenti.html:26-28` | no |
| `.badge` e varianti | `app.css:45-49` | solo `impostazioni.html:42` (`badge-warning`) | sì; `.badge-orange` no |
| `.dot` e varianti | `app.css:54-57` | `turni.html:37-43`, legenda di `index.html:62-69` | no, è un doppione semantico di `.badge` |
| `.card`, `.cards`, `.kpi-*` | `app.css:38-41` | `index.html:22-31` | la scheda sì, i KPI no |
| `.banner` | nessuna regola CSS | `index.html:22` | no |
| `.legend` | nessuna regola CSS | `index.html:61` | no |
| tabella | `app.css:60-61` | `dipendenti.html:22`, `impostazioni.html:43` | no |
| `.field` | `app.css:64-66` | `dipendenti.html:35-48`, `impostazioni.html:24-25` | sì |
| ricerca e select fuori da `.field` | nessuna regola CSS | `dipendenti.html:20`, `turni.html:53`, `impostazioni.html:31` | no |
| `.modal` | `app.css:69-72` | `turni.html:48-56` | sì |
| `.toast` | `app.css:74` | 3 pagine | no |
| `.nav` | `app.css:17-19` | 4 pagine | no |

## Rilievi

```json
{
  "project": "turnio-pannello",
  "audit_id": null,
  "agent": "AIWDA-06 · ADHARA",
  "page": { "name": "Design system (token, CSS, documentazione, pagine)", "url": "css/tokens.css, css/app.css, docs/componenti.md, *.html" },
  "observations": [
    {
      "id": "DS-01", "type": "accessibility",
      "title": "Focus tolto ovunque, senza sostituto",
      "description": "app.css:14 `*:focus { outline: none; }` toglie l'indicatore di focus a ogni elemento, e nessuna regola :focus o :focus-visible lo rimette. docs/componenti.md:9 dichiara invece lo stato «con il focus da tastiera» per il pulsante.",
      "evidence": { "url": "tutte le pagine", "screenshot": null, "location": "css/app.css:14; docs/componenti.md:9", "steps": ["Leggere app.css:14", "Cercare :focus-visible in app.css: nessun risultato"] },
      "impact": "Chi usa la tastiera non vede dove si trova in nessuna pagina. WCAG 2.2, 2.4.7 Focus Visible (AA).",
      "priority": "P1", "confidence": 0.95,
      "recommendation": "Togliere la riga 14 e aggiungere un token `--focus-ring: 2px solid var(--color-primary)` con `:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }`. Un solo intervento corregge tutti i componenti.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-02", "type": "consistency",
      "title": "--color-danger definito due volte con valori diversi",
      "description": "tokens.css:12 lo definisce come #cf222e, tokens.css:31 lo ridefinisce come #e5534b e, per la cascata, vale il secondo. Intanto .btn-danger (app.css:30) e la linea del grafico (index.html:77) usano #cf222e scritto a mano. Il risultato: due rossi diversi per lo stesso significato (pulsante rosso scuro, pallino «assente» rosso chiaro in turni.html:40). Il bianco su #e5534b ha contrasto 3,7:1.",
      "evidence": { "url": "turni.html, impostazioni.html", "screenshot": "schermate/turni-computer.png, schermate/impostazioni-computer.png", "location": "css/tokens.css:12,31; css/app.css:30,48,57", "steps": ["Confrontare tokens.css:12 e :31"] },
      "impact": "Il rosso di pericolo non è unico e il token non è affidabile. .badge-danger con testo bianco a 14 px non raggiunge 4,5:1 (WCAG 2.2, 1.4.3).",
      "priority": "P2", "confidence": 0.95,
      "recommendation": "Togliere il secondo blocco :root (tokens.css:30-33) e tenere --color-danger: #cf222e (5,36:1 con il bianco). .btn-danger deve usare var(--color-danger).",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-03", "type": "consistency",
      "title": "Due token quasi uguali per «in ritardo»: --color-warning e --color-late",
      "description": "--color-warning #e8a33d (tokens.css:11) e --color-late #e89b3a (tokens.css:32) sono quasi identici. La documentazione (componenti.md:13) assegna «in ritardo» a .badge-warning, mentre i pallini usano --color-late (app.css:56) e .badge-orange (app.css:49) non compare in nessuna pagina.",
      "evidence": { "url": "turni.html", "screenshot": "schermate/turni-computer.png", "location": "css/tokens.css:11,32; css/app.css:47,49,56", "steps": ["Confrontare i due token"] },
      "impact": "Lo stesso stato ha due nomi e due colori, e chi aggiunge una vista non sa quale usare.",
      "priority": "P3", "confidence": 0.9,
      "recommendation": "Un solo token semantico per stato: --color-status-present, --color-status-late, --color-status-absent, con alias verso success, warning e danger. Togliere --color-late e .badge-orange.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-04", "type": "accessibility",
      "title": "Contrasti insufficienti nei token muted, warning e border",
      "description": "Valori misurati: --color-muted #9aa0a6 su --color-background 2,46:1 e su bianco 2,64:1, usato da .muted a 13 px (app.css:42) e da .kpi-value (app.css:41). Testo bianco su --color-warning 2,16:1 (badge «3» in impostazioni.html:42). --color-border #d8dce1 come bordo dei campi su bianco 1,38:1.",
      "evidence": { "url": "index.html, impostazioni.html, dipendenti.html", "screenshot": "schermate/index-computer.png, schermate/impostazioni-computer.png, schermate/dipendenti-computer.png", "location": "css/tokens.css:6,9,11; css/app.css:41,42,45,65", "steps": ["Calcolare il rapporto di contrasto WCAG dai valori esadecimali"] },
      "impact": "Sottotitoli, valori dei KPI, didascalie e contatore degli scambi si leggono a fatica. WCAG 2.2, 1.4.3 Contrast Minimum (AA) per il testo e 1.4.11 Non-text Contrast (AA) per il bordo dei campi.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Scurire --color-muted a un grigio di almeno 4,5:1 sullo sfondo (verificare il valore, per esempio intorno a #5f6670). Per il badge warning usare testo scuro (var(--color-text)) o una tinta più scura. Introdurre un token --color-border-strong di almeno 3:1 per i bordi dei controlli.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-05", "type": "consistency",
      "title": "Circa 40 valori di colore, spaziatura e tipografia fuori dai token",
      "description": "Colori: #1f6feb (app.css:19,27; index.html:40-62), #1a5fd0 (:28), #cf222e (:30), #2f81f7 (:33), #fff (:27,30,33,45,74), #d8dce1 e altri 7 azzurri inline nei grafici di index.html:36-69. Spaziature: 22px e 13px 24px (:17), 24px (:21,74), 7px (:22,53), 22px e 13px (:23), 10px 18px (:33), 6px (:35), 13px (:38), 2px 8px (:45), 12px 16px (:74). Corpi del testo: 15px (:18,33), 17px (:23), 18px (:35,40), 16px (:41), 13px (:42), 14px (:53). Raggi: 20px (:33). La documentazione (componenti.md:3) afferma «Tutti i colori, le spaziature e i raggi vengono dai token».",
      "evidence": { "url": "tutte le pagine", "screenshot": null, "location": "css/app.css:17-74; index.html:36-69", "steps": ["Cercare in app.css i valori px e # non racchiusi in var()"] },
      "impact": "Cambiare un token non si propaga, la scala tipografica (14/16/20/28) e quella delle spaziature (4/8/16/24) non sono rispettate e la gerarchia diventa casuale (h2 a 17 px, etichetta del KPI a 18 px).",
      "priority": "P2", "confidence": 0.95,
      "recommendation": "Portare ogni valore al token più vicino: 22/24→--space-4, 13/16→--space-3, 7/8→--space-2, 15/16→--font-size-md, 13/14→--font-size-sm, 17/18→--font-size-lg, #1f6feb→var(--color-primary). Aggiungere i token che mancano davvero: --color-primary-hover, --color-on-primary (#fff), --space-2-5 o 12px se serve, --chart-1…n per i grafici. Il vincolo «solo token» è da verificare con una regola di lint, per esempio stylelint con declaration-strict-value.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-06", "type": "consistency",
      "title": "Pulsante doppio: .button nella finestra dello scambio",
      "description": ".button (app.css:33) ha raggio 20px, colore #2f81f7, padding 10px 18px e font 15px, ed è diverso da .btn-primary (raggio 8px, #1f6feb, altezza minima 40px). Si usa solo in turni.html:54 («OK»). Il bianco su #2f81f7 ha contrasto 3,75:1 a 15 px.",
      "evidence": { "url": "turni.html (finestra dello scambio)", "screenshot": null, "location": "css/app.css:33; turni.html:54", "steps": ["Aprire la finestra con ⇄ nella cella di sabato di Giulia R."] },
      "impact": "Lo stesso tipo di azione ha due aspetti, e il testo del pulsante non raggiunge 4,5:1 (WCAG 2.2, 1.4.3).",
      "priority": "P2", "confidence": 0.9,
      "recommendation": "Togliere .button e usare `class=\"btn btn-primary\"` in turni.html:54.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-07", "type": "consistency",
      "title": "Varianti del pulsante usate contro la regola documentata",
      "description": "turni.html:27-28 ha due .btn-primary nella stessa vista e «Elimina settimana», un'azione distruttiva, usa .btn-primary invece di .btn-danger. componenti.md:7 vuole «una sola azione principale per vista» e .btn-danger per le azioni distruttive. In impostazioni.html:46-48 «OK» e «No» sono entrambi .btn-secondary.",
      "evidence": { "url": "turni.html", "screenshot": "schermate/turni-computer.png", "location": "turni.html:27-28; impostazioni.html:46-48", "steps": ["Guardare la barra dei pulsanti sopra la griglia"] },
      "impact": "Eliminare la settimana sembra equivalente a pubblicarla, e il pulsante è accanto.",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "«Elimina settimana» con .btn-danger, separato dalle azioni principali. Un solo .btn-primary per vista. Negli scambi, approvazione .btn-primary (o secondary) e rifiuto .btn-secondary, con etichette esplicite (testi: rimandare all'UX Writer).",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-08", "type": "consistency",
      "title": "Stati del pulsante mancanti: disattivato, caricamento e hover delle varianti",
      "description": "Solo .btn-primary ha :hover (app.css:28). Non ci sono regole per :disabled o [aria-disabled], né uno stato di caricamento, mentre componenti.md:9 dichiara lo stato «disattivato». Le azioni asincrone (js/app.js:17-20, 43-47, 53-68) non disattivano il pulsante durante la richiesta.",
      "evidence": { "url": "turni.html, dipendenti.html", "screenshot": null, "location": "css/app.css:26-30; docs/componenti.md:9; js/app.js:17-68", "steps": ["Cercare :disabled in app.css: nessun risultato"] },
      "impact": "Doppi invii possibili e nessun riscontro mentre la richiesta è in corso. La documentazione promette uno stato che non esiste.",
      "priority": "P2", "confidence": 0.85,
      "recommendation": "Aggiungere .btn:hover per secondary e danger, .btn:disabled e [aria-disabled=true] (opacità o colori dedicati, cursor:not-allowed) e .btn[aria-busy=true] con indicatore. Documentarli in componenti.md.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-09", "type": "accessibility",
      "title": "Campo senza etichetta visibile, contro la regola del componente",
      "description": "componenti.md:22 dice «Etichetta sopra il campo, sempre visibile; il segnaposto non sostituisce l'etichetta». I 14 campi di dipendenti.html:35-48 e la ricerca (:20) hanno solo il placeholder. Lo stesso .field in impostazioni.html:24-25 usa invece <label for>. L'errore (dipendenti.html:49, p.error) è fuori da .field, quindi la regola `.field .error` (app.css:66) non lo colora, e non è collegato al campo (nessun aria-describedby o aria-invalid), contro componenti.md:23.",
      "evidence": { "url": "dipendenti.html", "screenshot": "schermate/dipendenti-computer.png", "location": "dipendenti.html:20,35-49; css/app.css:66; docs/componenti.md:22-23", "steps": ["Scrivere nel campo Nome: l'etichetta scompare"] },
      "impact": "Il componente si usa in due modi diversi. Mentre si scrive l'etichetta sparisce e l'errore non è associato al campo. WCAG 2.2, 3.3.2 Labels or Instructions (A) e 1.3.1 Info and Relationships (A).",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Uno schema unico per .field: <label for>, controllo, testo di aiuto, .field-error con id collegato tramite aria-describedby, e aria-invalid sul controllo. Stato di errore visivo (bordo var(--color-danger)). Stile .field anche per search e select isolati (dipendenti.html:20, turni.html:53, impostazioni.html:31), che oggi non hanno stile.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-10", "type": "accessibility",
      "title": "La finestra non fa ciò che la documentazione promette",
      "description": "componenti.md:27: «porta il focus al primo elemento e lo restituisce alla chiusura; si chiude con Esc». js/app.js:37-47 si limita ad aggiungere o togliere .open: niente gestione del focus e niente Esc. La chiusura è uno <span> (turni.html:50), che non si raggiunge da tastiera. Non ci sono role=dialog, aria-modal o aria-labelledby. La larghezza è fissa a 420px (app.css:71).",
      "evidence": { "url": "turni.html", "screenshot": null, "location": "turni.html:48-56; js/app.js:37-47; css/app.css:71-72; docs/componenti.md:27", "steps": ["Aprire la finestra con ⇄ e premere Esc: per lettura del codice non succede nulla"] },
      "impact": "Chi usa la tastiera non riesce a chiudere la finestra. WCAG 2.2, 2.1.1 Keyboard (A) e 4.1.2 Name, Role, Value (A).",
      "priority": "P1", "confidence": 0.85,
      "recommendation": "Usare l'elemento nativo <dialog> con showModal(): focus, Esc e livello superiore li gestisce la piattaforma. Chiusura con <button aria-label=\"Chiudi\">, larghezza max-width: min(420px, 100% - 2*var(--space-3)).",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-11", "type": "consistency",
      "title": "Tema scuro dichiarato ma non implementato",
      "description": "componenti.md:3 dice «Tutti i componenti supportano il tema chiaro e il tema scuro», ma tokens.css non ha né @media (prefers-color-scheme: dark) né [data-theme], e app.css usa colori scritti a mano (#fff, #1f6feb) che un tema non potrebbe sostituire.",
      "evidence": { "url": null, "screenshot": null, "location": "docs/componenti.md:3; css/tokens.css", "steps": ["Cercare prefers-color-scheme: nessun risultato"] },
      "impact": "La documentazione non è affidabile e chi la legge si aspetta un comportamento che non c'è.",
      "priority": "P3", "confidence": 0.95,
      "recommendation": "Correggere la documentazione (solo tema chiaro). Il tema scuro, se serve, va deciso con l'utente e richiede prima la correzione DS-05.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-12", "type": "accessibility",
      "title": "Stato dei turni comunicato con il solo colore (.dot) e legenda grigia",
      "description": "I pallini .dot (turni.html:37-43) non hanno testo, contro la regola del badge «sempre un testo, non solo il colore» (componenti.md:14). La legenda (turni.html:45) usa il carattere ● con classe .muted, quindi i tre pallini sono tutti grigi (screenshot) e non spiegano nulla. Alcuni turni non hanno pallino (sab, dom) e il significato non è spiegato.",
      "evidence": { "url": "turni.html", "screenshot": "schermate/turni-computer.png", "location": "turni.html:37-45; css/app.css:54-57", "steps": ["Guardare la legenda sotto la griglia"] },
      "impact": "Presenza, ritardo e assenza non sono distinguibili senza il colore, e la legenda non serve. WCAG 2.2, 1.4.1 Use of Color (A).",
      "priority": "P1", "confidence": 0.9,
      "recommendation": "Documentare .dot come variante compatta dello stato, sempre con testo accessibile (sr-only o title, più forma o icona diversa) e con la legenda che usa le stesse classi .dot-ok, .dot-late e .dot-absent. In alternativa usare .badge.",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-13", "type": "consistency",
      "title": "Componenti usati ma non definiti o non documentati",
      "description": ".banner (index.html:22) e .legend (index.html:61) non hanno regole CSS: la legenda è un elenco puntato di default e il banner è una .card con emoji. .icon-btn, la tabella, .toast, .nav e .kpi-* non sono in componenti.md. .icon-btn non ha nome accessibile (✎, 🗑, ◀, ▶, ⇄ in dipendenti.html:26-28 e turni.html:21-23,37).",
      "evidence": { "url": "index.html, dipendenti.html, turni.html", "screenshot": "schermate/index-computer.png, schermate/dipendenti-computer.png", "location": "index.html:22,61; css/app.css:35,60-61,74,17-19,40-41", "steps": ["Confrontare le classi usate nelle pagine con app.css e componenti.md"] },
      "impact": "Avvisi e legende si reinventano in ogni pagina e i pulsanti icona non sono comprensibili ai lettori di schermo. WCAG 2.2, 4.1.2 (A) e 1.1.1 (A).",
      "priority": "P2", "confidence": 0.9,
      "recommendation": "Aggiungere a componenti.md e app.css: Avviso (.alert con varianti di stato, al posto di .banner), Legenda, Pulsante icona (aria-label obbligatorio), Tabella (intestazioni, azioni per riga, stato vuoto), Notifica (.toast, role=status), Menu (.nav con aria-current).",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-14", "type": "visual",
      "title": "Scheda KPI con gerarchia invertita",
      "description": "Nella scheda KPI l'etichetta è a 18px e in grassetto (app.css:40), mentre il valore è a 16px, normale e grigio --color-muted (app.css:41). Nello screenshot il numero è l'elemento meno visibile della scheda.",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-computer.png", "location": "css/app.css:40-41; index.html:28-30", "steps": ["Guardare le tre schede in «Numeri della settimana»"] },
      "impact": "Il dato, che è la ragione della scheda, è meno leggibile dell'etichetta.",
      "priority": "P2", "confidence": 0.85,
      "recommendation": "Etichetta .kpi-label con --font-size-sm e --color-muted corretto (DS-04). Valore .kpi-value con --font-size-xl, peso 700 e --color-text. Documentare la variante «scheda KPI».",
      "status": "Nuova", "requires_human_review": false
    },
    {
      "id": "DS-15", "type": "visual",
      "title": "Griglia dei turni a larghezza fissa",
      "description": ".week ha width: 1100px (app.css:52). Nella schermata da telefono la pagina si allarga a circa 1126px e il menu resta a 390px. Nella schermata da telefono la pagina è più larga dello schermo e il menu non arriva al bordo destro.",
      "evidence": { "url": "turni.html", "screenshot": "schermate/turni-telefono.png", "location": "css/app.css:52", "steps": ["Guardare la schermata da telefono"] },
      "impact": "Su telefono tutta la pagina scorre in orizzontale, non solo la griglia. WCAG 2.2, 1.4.10 Reflow (AA), per le tabelle a due dimensioni ammesso solo nel contenitore.",
      "priority": "P2", "confidence": 0.8,
      "recommendation": "Usare min-width sulla griglia dentro un contenitore con overflow-x: auto, invece di una larghezza fissa sulla pagina. Riesame dell'UI Designer per il layout su telefono.",
      "status": "Nuova", "requires_human_review": true
    }
  ],
  "tested_scenarios": [
    "Lettura di css/tokens.css, css/app.css, docs/componenti.md, delle 4 pagine HTML e di js/app.js",
    "Confronto fra classi usate, regole CSS e documentazione",
    "Calcolo del contrasto WCAG sulle coppie di colori dei token",
    "Esame delle schermate index, dipendenti, impostazioni e turni da computer e turni da telefono"
  ],
  "limitations": [
    "Nessuna prova nel browser: hover, focus, Esc e stati di errore sono ricavati dal codice, non osservati",
    "Non ho guardato le schermate da telefono di index, dipendenti e impostazioni",
    "Direttore AIWDA-01 non caricato: il tool agent non era disponibile",
    "Ho segnalato solo per competenza i grafici di index.html (asse che non parte da zero, doppio asse, torta a 8 fette, rosso e verde): spettano al Data Visualization Designer",
    "Valore proposto per --color-muted da verificare con il calcolo prima di adottarlo"
  ],
  "summary": "I token esistono, ma app.css li usa poco (circa 40 valori scritti a mano) e --color-danger è definito due volte. C'è un pulsante doppio (.button) e mancano gli stati focus, disattivato e caricamento. In quattro punti la documentazione promette ciò che il codice non fa (tema scuro, focus, etichette dei campi, finestra). Cinque rilievi P1: focus, contrasti, varianti dei pulsanti, campi, finestra e stato solo a colore."
}
```

## Regole proposte da aggiungere a `docs/componenti.md`

1. In `app.css` si usano solo `var(--…)`. Valori come `#`, `px` o `rgb` stanno solo in `tokens.css`, e un controllo lint li verifica.
2. Ogni stato ha un token semantico: presente, in ritardo, assente; successo, avviso, pericolo. Non si aggiungono colori per un singolo componente come `--color-late`.
3. Ogni componente interattivo documenta i suoi stati (normale, hover, focus-visible, disattivato, caricamento, errore) e il CSS li implementa tutti.
4. Lo stato non si comunica mai solo con il colore. I pulsanti icona hanno sempre un `aria-label`.
5. Le azioni distruttive usano solo `.btn-danger`, e c'è un solo `.btn-primary` per vista.
6. Una classe usata nelle pagine ma assente da `componenti.md` non si accetta.

## Correzioni con l'impatto più ampio

In ordine di resa per sforzo:
1. **DS-01:** il focus visibile corregge da solo tutti i componenti.
2. **DS-04:** correggere `--color-muted`, `--color-warning` e `--color-border` sistema 3 token usati in tutte e 4 le pagine.
3. **DS-02 e DS-05:** tenere un solo valore per `--color-danger` e sostituire i valori scritti a mano. È la condizione per qualunque cambio di tema.
4. **DS-09:** uno schema unico per `.field`, usato da 16 campi.
5. **DS-06 e DS-07:** un solo pulsante e varianti usate secondo le regole.

## Domande aperte per l'utente e per il direttore

- Il tema scuro è un obiettivo (in quel caso serve prima DS-05) oppure va tolto dalla documentazione?
- Posso proporre `<dialog>` nativo come standard per le finestre?
- Va aggiunto uno scalino di spaziatura a 12px, oppure si arrotonda tutto alla scala 4/8/16/24?

Firmato: AIWDA-06 · ADHARA. Lavoro svolto su Opus. I rilievi P1 restano da consolidare con AIWDA-01 · CANOPUS.
