AIWDA-05 · MIMOSA — Senior UI Designer, reparto AIWDA (AI Web Design)

## Esito

Ho fatto una revisione in sola lettura di `index.html`, `turni.html`, `dipendenti.html`, `impostazioni.html`, `css/app.css` e `css/tokens.css`. Ho guardato le 4 schermate per telefono e la schermata del cruscotto su computer. Non ho modificato nessun file. Non ho caricato AIWDA-01 · CANOPUS perché in questa esecuzione non avevo il tool `agent`: questo rapporto è la consegna per lui.

Ho trovato 16 rilievi: 0 P0, 5 P1, 7 P2, 4 P3. Il problema principale è il telefono: in 3 pagine su 4 la pagina è più larga dello schermo. Le schermate a 390 px risultano larghe 1126 px (turni), 584 px (cruscotto) e 426 px (dipendenti), e la barra del menu si ferma a 390 px. Vengono subito dopo: il focus nascosto ovunque, il grigio dei testi secondari sotto il contrasto minimo, la gerarchia invertita dei numeri del cruscotto e i token di colore incoerenti.

Il contrasto l'ho calcolato con la formula WCAG sui valori esadecimali dei file. Per i criteri ho usato la scheda della biblioteca `wcag-2-2`: WCAG 2.2, W3C Recommendation del 5 ottobre 2023, verificata il 2026-11-19.

## Rilievi

**Telefono e layout**

1. **MIM-01 · P1 · La griglia dei turni ha larghezza fissa e su telefono la pagina scorre in orizzontale**
   - Dove: `css/app.css:52`, `.week { … width: 1100px; }`.
   - Cosa si vede: `schermate/turni-telefono.png` è larga 1126 px invece di 390. La griglia esce dallo schermo e il menu copre solo i primi 390 px.
   - Impatto: preparare i turni è il compito più frequente. Su telefono non si vede la settimana intera e scorre tutta la pagina, non solo la griglia.
   - Correzione: togliere `width:1100px` e mettere la griglia in un contenitore con `overflow-x:auto`, la prima colonna fissa (`position:sticky; left:0`) e `min-width` sulle colonne dei giorni. In alternativa, sotto i 640 px, una vista per giorno (lista dei dipendenti per il giorno scelto).

2. **MIM-02 · P1 · I grafici del cruscotto hanno larghezza fissa in pixel**
   - Dove: `index.html:35`, `:74` e `:84` (`<svg width="560">`); `index.html:51` (`width="260"`).
   - Cosa si vede: `schermate/index-telefono.png` è larga 584 px. I grafici escono a destra e il menu (`.nav`) non arriva fino in fondo alla pagina.
   - Correzione: togliere `width`/`height` dagli `<svg>` (il `viewBox` è già presente) e aggiungere in `app.css` `svg { max-width:100%; height:auto; }`.

3. **MIM-03 · P2 · Su telefono la tabella dei dipendenti va a capo male ed esce dallo schermo**
   - Dove: `dipendenti.html:22-30`; `css/app.css:60-61`.
   - Cosa si vede: `schermate/dipendenti-telefono.png` è larga 426 px. Nomi («Giulia / R.»), numeri di telefono e l'intestazione «Ore nel mese» vanno a capo su 2-3 righe. Le icone ✎ e 🗑 sono una sopra l'altra.
   - Correzione: mettere la tabella in un contenitore con `overflow-x:auto`, aggiungere `white-space:nowrap` per nome e telefono e ridurre il padding orizzontale delle celle a `--space-2` sotto i 640 px. Le azioni vanno in una riga con `display:flex; gap:var(--space-1)`.

4. **MIM-04 · P2 · La finestra dello scambio è larga 420 px, più del telefono (390 px)**
   - Dove: `css/app.css:71`, `.modal-box { width: 420px; }`.
   - Cosa si vede: è un'inferenza dal CSS. La finestra aperta non è nelle schermate.
   - Correzione: `width: min(420px, calc(100vw - 2*var(--space-3)))`.

**Colore e contrasto**

5. **MIM-05 · P1 · Il focus da tastiera è tolto su tutti gli elementi**
   - Dove: `css/app.css:14`, `*:focus { outline: none; }`. Non c'è nessuna regola sostitutiva.
   - Perché conta: non soddisfa WCAG 2.2, 2.4.7 Focus Visible (AA). Contraddice anche `docs/componenti.md` («Stati: … con il focus da tastiera»).
   - Correzione: togliere la riga e aggiungere `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }`.

6. **MIM-06 · P1 · Il grigio dei testi secondari è sotto il contrasto minimo**
   - Dove: `css/tokens.css:6`, `--color-muted: #9aa0a6`. Si usa per `.muted` (`app.css:42`, 13 px), per i valori KPI (`app.css:41`), per la legenda dei turni, le didascalie e «Azioni».
   - Contrasto: 2,46:1 sullo sfondo `#f6f7f9` e 2,64:1 su bianco. Il minimo di WCAG 2.2, 1.4.3 (AA) è 4,5:1.
   - Correzione: `--color-muted: #5f6670` (circa 5,6:1 su `#f6f7f9`) e testo secondario non sotto i 14 px (`--font-size-sm`).

7. **MIM-07 · P2 · Badge con testo bianco su colori chiari**
   - Dove: `css/app.css:45-49`.
   - Contrasto del testo bianco: 2,16:1 su `--color-warning #e8a33d` (il badge «3» di `impostazioni.html:42`, visibile nella schermata), 2,29:1 su `--color-late`, 3,70:1 su `--color-danger` ridefinito.
   - Correzione: per warning e late usare testo `var(--color-text)`, oppure scurire lo sfondo (per esempio `#9a6700`). Per danger vedi MIM-08.

8. **MIM-08 · P2 · I token di colore sono ridefiniti e scavalcati da valori scritti a mano**
   - Dove: `css/tokens.css:30-33`, dove un secondo `:root` sovrascrive `--color-danger` (da `#cf222e` a `#e5534b`) e aggiunge `--color-late`, quasi uguale a `--color-warning`. In `css/app.css:19,27,28,30,33` ci sono valori fissi (`#1f6feb`, `#1a5fd0`, `#cf222e`, `#2f81f7`). Nei grafici di `index.html` ci sono altri esadecimali.
   - Effetto: il pulsante «Elimina locale» è `#cf222e` mentre il pallino «assente» è `#e5534b`. Lo stesso significato ha due rossi diversi, e il tema scuro promesso in `docs/componenti.md` non esiste (in `tokens.css` non ci sono token scuri).
   - Correzione: un solo `--color-danger`; unire `--color-late` a `--color-warning`; aggiungere `--color-primary-hover`; nei componenti usare solo `var(--…)`. Togliere la riga sul tema scuro da `componenti.md` oppure aggiungere i token scuri.

9. **MIM-09 · P2 · La legenda dei turni è tutta grigia**
   - Dove: `turni.html:45`, `<p class="muted">● presente ● in ritardo ● assente</p>`.
   - Cosa si vede: in `schermate/turni-telefono.png` i tre pallini sono tutti grigi, quindi la legenda non spiega i colori della griglia. Inoltre lo stato è dato solo dal colore (WCAG 2.2, 1.4.1 Use of Color, A), contro la regola di `componenti.md` («Il badge ha sempre un testo»).
   - Correzione: usare nella legenda gli stessi `.dot dot-ok/late/absent` della griglia e aggiungere a ogni pallino un testo nascosto o un'icona o forma diversa per stato.

**Gerarchia visiva e componenti**

10. **MIM-10 · P1 · La gerarchia delle schede KPI è invertita**
    - Dove: `css/app.css:40-41`. L'etichetta è a 18 px in grassetto `--color-text`, il valore a 16 px normale in grigio.
    - Cosa si vede: in `schermate/index-computer.png` «Costo del lavoro» si nota, «31%» quasi no.
    - Correzione: `.kpi-label { font-size: var(--font-size-sm); color: var(--color-muted corretto); }` e `.kpi-value { font-size: var(--font-size-xl); font-weight: 700; color: var(--color-text); }`.

11. **MIM-11 · P1 · Pulsanti in `turni.html`: due azioni principali uguali, una delle quali distruttiva**
    - Dove: `turni.html:27-29`. «Pubblica i turni» e «Elimina settimana» sono tutti e due `.btn-primary`, uno accanto all'altro. «Salva» è secondario e su telefono va a capo da solo (schermata).
    - Perché conta: contraddice `componenti.md` («una sola azione principale per vista»; `.btn-danger` per le azioni distruttive). Il rischio è premere l'azione distruttiva al posto di quella principale.
    - Correzione: «Elimina settimana» → `.btn-danger` (o un pulsante di testo), lontano da Pubblica. Ordine: Salva (secondario), Pubblica (primario). Contenitore `display:flex; flex-wrap:wrap; gap:var(--space-2)`.

12. **MIM-12 · P2 · Due componenti pulsante diversi**
    - Dove: `.button` (`css/app.css:33`, raggio 20 px, `#2f81f7`, 15 px), usato in `turni.html:54`, accanto a `.btn` (`app.css:26`).
    - Contrasto: bianco su `#2f81f7` è 3,75:1, sotto 4,5:1.
    - Correzione: eliminare `.button` e usare `.btn btn-primary`.

13. **MIM-13 · P2 · I campi non seguono il componente `.field`**
    - Dove: `dipendenti.html:35-48`. I campi hanno solo il segnaposto come etichetta, contro `componenti.md` («Etichetta sopra il campo, sempre visibile»). Vedi WCAG 2.2, 3.3.2 (A). Il campo di ricerca (`dipendenti.html:20`) è fuori da `.field` e senza stile: in schermata è piccolo e attaccato al titolo e alla didascalia centrata della tabella.
    - Correzione: `<label>` visibile sopra ogni campo, come già in `impostazioni.html:24`. Ricerca dentro `.field` con `margin-bottom: var(--space-3)`. `caption { text-align:left; }`.

**Spaziature e tipografia**

14. **MIM-14 · P3 · Valori fuori dalla scala di spaziature e tipografia**
    - Dove: `css/app.css:17` (`gap 22px`, `padding 13px`, `font-size 15px`), `:22` (`margin 7px`), `:23` (`h2 17px`, `22px`/`13px`), `:38` (`gap 13px`), `:53` (`padding 7px`), `:33` e `:35`.
    - Correzione: allineare alla scala (`--space-*` 4/8/16/24; testo 14/16/20/28). Per esempio `h2 { font-size: var(--font-size-lg); margin: var(--space-4) 0 var(--space-3); }`.

15. **MIM-15 · P3 · Il pulsante ⇄ scompone la cella e i bersagli touch sono piccoli**
    - Dove: `turni.html:37` (⇄ dentro la cella del sabato), `css/app.css:35`.
    - Cosa si vede: in `schermate/turni-telefono.png` la cella «Sab» di Giulia è più bassa delle altre e la riga diventa più alta. Le icone ✎ e 🗑 (circa 30 px) sono sopra il minimo di WCAG 2.2, 2.5.8 (24 px) ma piccole per un uso a dito.
    - Correzione: `.week > div { display:flex; align-items:center; gap:var(--space-1); }` e `.icon-btn { min-width:40px; min-height:40px; }`, come `.btn`.

16. **MIM-16 · P3 · Avviso del cruscotto e sezioni delle impostazioni senza gerarchia**
    - Avviso: `index.html:22-24`, `.banner` non ha stile né collegamento. Sembra una scheda KPI e non porta agli scambi.
    - Impostazioni: `impostazioni.html:22-51`. Le sezioni `<summary>` non hanno stile e «Esporta» è annidato su tre livelli. In schermata sono righe di testo semplice, senza spaziatura tra le sezioni.
    - Correzione: un banner stile avviso (sfondo warning tenue, bordo a sinistra, collegamento «Vai agli scambi»). `summary` con `padding:var(--space-2) 0; font-weight:600;` e un bordo tra le sezioni. La struttura delle sezioni va ad AIWDA-04.

## Segnalazioni per altri specialisti (non contate nei rilievi)

- **Grafici** (`index.html:34-48` e `72-81`): l'asse delle barre parte da 60 e amplifica le differenze; il grafico costo/incassi ha due assi con scale diverse; la torta ha 8 fette e i colori `#ddf4ff`/`#cae8ff` hanno contrasto 1,06–1,19:1 con lo sfondo (WCAG 2.2, 1.4.11); la legenda mostra sia i punti dell'elenco sia i pallini. Questi rilievi sono per lo specialista dei dati e dei grafici.
- **Lingua e testi**: `lang="en"` su pagine in italiano (WCAG 2.2, 3.1.1, A). Il menu mescola lingue («Settings», «Dashboard»). Termini incoerenti: «Squadra» nel menu, «Personale» nel titolo, «risorsa», «collaboratore». Altri testi: «Clicca qui», «Procedi», «OK/No», «Fatto!». Sono rilievi per l'UX writer.
- **Ordine del menu**: «Settings» è al primo posto, anche se le impostazioni sono il compito più raro. Rilievo per l'architettura dell'informazione.

## Regole visive da rendere coerenti

1. Solo token nei componenti, mai valori esadecimali o in pixel scritti a mano.
2. Una sola azione primaria per vista; le azioni distruttive sempre con `.btn-danger`.
3. Testo secondario almeno 4,5:1 e almeno 14 px.
4. Focus visibile e uguale su tutti i controlli.
5. Contenitori larghi (griglia, tabelle, grafici) responsivi: `max-width:100%` oppure scorrimento solo dentro il contenitore, mai di tutta la pagina.

## Limiti

- Non ho aperto il browser: ho usato solo le schermate statiche (pagina intera a 390 e 1280 px). Gli stati al passaggio del mouse, con il focus e con errore, la finestra dello scambio e il toast non sono nelle schermate; i rilievi su questi (MIM-04, MIM-05) sono inferenze dal CSS.
- Ho guardato solo `index-computer.png` tra le schermate su computer, non le altre 3.
- Non ho verificato un tema scuro: nel codice non c'è.
- Il rilievo sulla griglia su telefono (MIM-01) dipende da quanto i responsabili usano il pannello dal telefono. Va confermato con la ricerca (`ricerca/`, che non ho letto): `requires_human_review: true` per MIM-01 e MIM-04.

## Domande aperte per AIWDA-01

1. Il pannello su telefono è uno scenario previsto (il README dice solo che i dipendenti usano l'app)? La priorità P1 di MIM-01 e MIM-02 dipende da questo.
2. Il tema scuro di `componenti.md` è un obiettivo o un errore della documentazione?

— MIMOSA (AIWDA-05)
