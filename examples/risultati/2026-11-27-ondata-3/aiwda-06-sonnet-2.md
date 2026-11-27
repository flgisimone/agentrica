AIWDA-06 · ADHARA — Senior Design System Specialist, reparto AIWDA (AI Web Design)

Rapporto di audit in sola lettura sul design system di Turnio (css/tokens.css, css/app.css, docs/componenti.md e uso nelle pagine). Percorso base: /private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/68c857fd-4b52-436c-bf0e-5c657ef1d77d/scratchpad/copie/aiwda-06-2/. Nessun file modificato, nessun processo avviato.

Esame effettuato: i due CSS, docs/componenti.md, README.md, le quattro pagine HTML (index, turni, dipendenti, impostazioni) e le schermate turni-computer.png e dipendenti-computer.png. Le altre sei schermate e js/app.js (se non per le righe sulla classe .open) non li ho esaminati. Il comportamento di hover e focus nel browser non è osservabile dalle schermate statiche: i rilievi su quegli stati vengono dal CSS.

Scheda biblioteca: wcag-2-2 (WCAG 2.2, W3C Recommendation del 5 ottobre 2023, verificata il 2026-11-19, da ricontrollare entro il 2027-05-19). Vale ancora.

Esito in breve: il sistema dichiara dei token ma li aggira in molti punti. Ci sono due definizioni di --color-danger, due pulsanti primari con valori diversi, un componente `.button` non documentato, colori scritti a mano nel CSS e negli SVG, focus eliminato su tutto, e la documentazione afferma cose che il codice non fa (tema scuro, stati, ARIA).

## Inventario degli schemi osservati

- Pulsante `.btn` con varianti primary, secondary, danger (usato in turni, dipendenti, impostazioni).
- Pulsante `.button` (solo turni.html:54), non documentato.
- Pulsante-icona `.icon-btn` (turni, dipendenti), non documentato.
- Badge `.badge` con success, warning, danger e `.badge-orange` (usato una sola volta, impostazioni.html:42, in variante warning).
- Punto di stato `.dot` con ok, late, absent (turni, legenda del cruscotto), non documentato.
- Scheda `.card` e `.cards`, più `.kpi-label` e `.kpi-value`, non documentati; `.banner` non ha nessuna regola.
- Campo `.field` (dipendenti, impostazioni).
- Select nativi: in `.field` e in un `<p>` (impostazioni.html:31, turni.html:53).
- Tabella (dipendenti, impostazioni).
- Griglia `.week` (turni), non documentata.
- Finestra `.modal`, `.modal-box`, `.modal-close`.
- Notifica `.toast`, presente in tre pagine, non documentata.
- Menu `.nav`, non documentato.
- Accordi `<details>`, annidati fino a tre livelli, senza stile proprio, non documentati.
- Grafici SVG (barre, torta, linee) e legenda `.legend`, senza regole CSS.

## Rilievi

**DS-01 · P1 · Due definizioni di --color-danger, la seconda sovrascrive la prima**
- Fatto: `--color-danger: #cf222e` in css/tokens.css:11 viene ridefinito `#e5534b` in css/tokens.css:31-34 (blocco «aggiunti per i badge dei turni»). `.btn-danger` (css/app.css:30) usa `#cf222e` scritto a mano, quindi sullo stesso significato «pericolo» convivono due rossi: badge, punto «assente», errore dei campi usano `#e5534b`; il pulsante «Elimina locale» usa `#cf222e`.
- Inferenza: `#e5534b` con testo bianco nei badge ha un contrasto circa 3,7:1, sotto il 4,5:1 richiesto per testo piccolo (WCAG 2.2, 1.4.3); valore da misurare con uno strumento prima di darlo per definitivo. Stessa verifica per `--color-warning #e8a33d` e `--color-late #e89b3a` con testo bianco (`.badge`, css/app.css:45): probabilmente molto sotto soglia. Nella schermata il punto «assente» è visibilmente più chiaro del pulsante danger.
- Correzione proposta: una sola definizione, scegliere un valore che regga il contrasto sia come testo/sfondo con bianco sia come colore del punto; usarla anche in `.btn-danger`. Impatto: badge, punti, errori, pulsante distruttivo.

**DS-02 · P1 · Colori fuori dai token nel CSS**
- Fatto: `#1f6feb` scritto a mano in css/app.css:19 (voce di menu attiva) e :27 (`.btn-primary`), pur esistendo `--color-primary`; `#1a5fd0` hover in :28 senza token; `#cf222e` in :30; `#2f81f7` in `.button` (:33); `#fff` ripetuto in :27, :30, :33, :45, :74 senza token «testo su colore pieno».
- Impatto: cambiare il blu del marchio richiede di toccare almeno quattro punti; il tema scuro dichiarato in docs/componenti.md:3 non è realizzabile così.
- Correzione: sostituire con `var(--color-primary)`, `var(--color-danger)`; aggiungere token `--color-primary-hover` e `--color-on-solid`.

**DS-03 · P1 · Colori fuori dai token negli SVG e nella legenda del cruscotto**
- Fatto: index.html:36-88 usa `#1f6feb`, `#d8dce1`, `#cf222e`, `#1a7f37` negli attributi `stroke`/`fill`; la torta (index.html:52-59) e la legenda (index.html:62-69) usano otto sfumature di blu (`#1f6feb`…`#ddf4ff`) in stile inline, nessuna è un token. Gli ultimi due blu chiarissimi non si distinguono dallo sfondo e fra loro.
- Inferenza: la palette a otto sfumature della stessa tinta non è leggibile come categorie; l'aspetto dei dati è competenza di AIWDA-08 (dati e grafici), qui si segnala solo l'assenza di token di serie e dell'asse nel sistema.
- Correzione: token per le serie di dati (`--chart-1…n`) e per assi e griglie; classi al posto degli stili inline; passaggio a AIWDA-08 per la scelta delle categorie.

**DS-04 · P1 · Due pulsanti primari con valori diversi e una variante non documentata**
- Fatto: `.btn-primary` (css/app.css:26-28): raggio `--radius-md` 8 px, altezza minima 40 px, `#1f6feb`. `.button` (css/app.css:33): raggio 20 px (valore non presente fra i token, che hanno solo 4 e 8), padding 10/18 px, `#2f81f7`, nessuna altezza minima, nessun hover, bordo 0. Usato solo in turni.html:54 («OK» della finestra dello scambio). La documentazione (docs/componenti.md:5-9) descrive solo `.btn`.
- Correzione: sostituire con `class="btn btn-primary"` ed eliminare `.button` (css/app.css:32-33). Impatto: un solo punto d'uso, correzione a basso costo.

**DS-05 · P1 · Focus tastiera rimosso su tutti gli elementi**
- Fatto: css/app.css:14 `*:focus { outline: none; }` senza alcun sostituto (nessuna regola `:focus-visible` nel file). docs/componenti.md:9 dichiara per il pulsante lo stato «con il focus da tastiera», che il codice non implementa.
- Impatto: nessun elemento (link, pulsanti, campi, select, summary) mostra il focus: viola WCAG 2.2, 2.4.7 (livello AA); i criteri 2.4.11 (focus non coperto) e 2.4.13 sono da riverificare dopo la correzione. Compito impedito per chi usa la tastiera: almeno P1 per regola comune.
- Correzione: eliminare la regola e definire un unico stato `:focus-visible` basato su token (contorno `--color-primary` con distanza), valido per tutti i componenti. Passaggio ad AIWDA-09 (accessibilità) per la verifica completa.

**DS-06 · P2 · Stato disattivato e caricamento mancanti; hover e focus quasi assenti**
- Fatto: nel CSS esiste un solo hover (`.btn-primary:hover`, css/app.css:28). `.btn-secondary` e `.btn-danger` non hanno hover; nessuna regola `:disabled` o `[aria-disabled]`; nessuno stato di caricamento. docs/componenti.md:9 promette hover e disattivato.
- Correzione: aggiungere hover/attivo/disattivato a tutte le varianti con token; dichiarare nel documento quali stati esistono davvero (loading incluso, se serve).

**DS-07 · P1 · Campi di testo: etichetta assente nel modulo, errore non collegato**
- Fatto: dipendenti.html:35-48: quattordici `.field` senza `<label>`, solo `placeholder` («Nome *», …), contro docs/componenti.md:22 («etichetta sopra il campo, sempre visibile; il segnaposto non sostituisce l'etichetta»). Impostazioni.html:24-25 invece usa label corrette, quindi lo stesso componente è usato in due modi. Il campo di ricerca dipendenti.html:20 non usa `.field`, non ha label e nella schermata ha bordo e dimensione di default del browser (piccolo, senza raggio né altezza 40 px). Select di impostazioni.html:31 e turni.html:53 sono nativi, fuori da `.field`, senza stile.
- Errore: `<p class="error" id="form-error" role="alert">` (dipendenti.html:49) è fuori dai `.field` e non è collegato a un campo (nessun `aria-describedby`); css/app.css:66 definisce `.field .error`, che qui non si applica mai, quindi il messaggio non prende lo stile previsto. docs/componenti.md:23 promette «collegato al campo». Mancano stati di errore del campo (bordo, icona) e di successo.
- Correzione: ogni campo con `<label for>`; `.field` applicabile a input, select e ricerca; errore dentro il `.field` con `aria-describedby` e `aria-invalid`. (Criteri 1.3.1, 3.3.2, 4.1.2 di WCAG 2.2.)

**DS-08 · P2 · Pulsanti-icona senza nome e senza dimensione minima**
- Fatto: `.icon-btn` (css/app.css:35) ha padding 6 px e carattere 18 px, circa 30 px di lato (le schermate lo confermano), senza `aria-label` in turni.html:21,23,37 e dipendenti.html:26-28. Non è documentato.
- Impatto: bersaglio sotto i 24 CSS px? Probabilmente circa 30 px, quindi sopra il minimo 2.5.8 ma sotto i 40 px usati da `.btn`; il nome accessibile manca comunque (4.1.2). I pulsanti modifica/elimina di tre righe hanno la stessa icona per azioni diverse di tre persone, senza nome.
- Correzione: componente documentato con altezza minima da token e `aria-label` obbligatorio.

**DS-09 · P2 · `.modal-close` è uno `<span>`, finestra senza semantica**
- Fatto: turni.html:50 `<span class="modal-close" id="swap-close">✕</span>` (non è un pulsante, non è raggiungibile da tastiera); la finestra (turni.html:48-56) non ha `role="dialog"`, `aria-modal`, né titolo collegato (`aria-labelledby`). docs/componenti.md:27 promette focus al primo elemento, ripristino del focus e chiusura con Esc. Non ho verificato js/app.js a fondo: le prime righe usano solo `classList.add/remove("open")`, quindi la gestione del focus e di Esc sembra assente (da confermare).
- Correzione: pulsante `.icon-btn` reale con nome, `<dialog>` o ruolo equivalente, comportamento allineato al documento.

**DS-10 · P2 · Toast presente in tre pagine ma non documentato e privo di semantica**
- Fatto: css/app.css:74; `<div class="toast" id="toast" hidden>` in turni, dipendenti, impostazioni senza `role="status"` o `aria-live`. Colori `var(--color-text)` e `#fff` (vedi DS-02), padding 12/16 px non basati sui token (`--space-3` è 16, 12 non esiste). Il toast non c'è nel documento.
- Correzione: documentarlo, aggiungere `role="status"`, usare i token.

**DS-11 · P2 · Scala di spaziature, tipografia e raggi aggirata**
- Fatto: valori non nella scala (4, 8, 16, 24): `gap: 22px`, `padding: 13px 24px` (css/app.css:17), `13px` (:38), `margin: 0 0 7px` (:22), `margin: 22px 0 13px` (:23), `padding: 7px` (:53), `padding: 10px 18px` (:33), `padding: 6px` (:35), `12px 16px` (:74), `padding: 2px 8px` (:45), `bottom/right: 24px` (:74, coincide con --space-4 ma scritto a mano), `main { padding: 24px }` (:21) senza token. Caratteri non in scala (14, 16, 20, 28): `15px` (:18, :33), `17px` per h2 (:23), `18px` (:35, :40), `13px` (:42), `14px` scritto a mano (:53). Raggio 20 px (:33) fuori scala; i token `--font-size-lg` (20 px) e `--space-1` ecc. esistono, ma `--font-size-lg` non risulta usato nei file esaminati.
- Correzione: portare i valori alla scala; il token `--font-size-lg` o è usato (h2) o è da togliere dal sistema.

**DS-12 · P2 · Scheda e numeri del cruscotto con gerarchia invertita**
- Fatto: `.kpi-label` 18 px, 700, `--color-text`; `.kpi-value` 16 px, 400, `--color-muted` (css/app.css:40-41): l'etichetta pesa più del numero, e il numero (31%, 461, 4) è piccolo e grigio chiaro. `--color-muted: #9aa0a6` su fondo `#f6f7f9` ha un contrasto circa 2,5:1 (stima da verificare), sotto il minimo per testo di 13 px (`.muted`, :42) e per il valore. `.muted` è usato per testo con significato (caption, legenda, «Azioni», nota «I campi con * sono obbligatori») e nelle schermate risulta molto tenue.
- Correzione: token `--color-muted` più scuro (verificare 4,5:1 sia su `--color-surface` sia su `--color-background`) e componente numero (valore grande, etichetta piccola). `.banner card` (index.html:22) non ha una regola propria: o è una variante di `.card` da definire (avviso) o la classe va tolta.

**DS-13 · P2 · Tabelle: stili incompleti e intestazioni nascoste a metà**
- Fatto: `table`, `th`, `td` stilizzati come elementi, non come componente (css/app.css:60-61): niente classe, quindi ogni tabella futura li eredita. `caption` con `.muted` (dipendenti.html:23) appare centrato e minuscolo nella schermata; l'ultima colonna ha intestazione «Azioni» in `.muted` (dipendenti.html:24) e `<th>` vuota (impostazioni.html:44). Nessun documento per la tabella nonostante sia fra gli schemi che il sistema dovrebbe coprire. Su telefono la tabella non ha comportamento definito (non ho aperto le schermate da 390 px).
- Correzione: componente tabella documentato con intestazioni sempre visibili (anche solo per tecnologie assistive) e regola per schermi stretti.

**DS-14 · P2 · Griglia dei turni con larghezza fissa e stato solo a colore**
- Fatto: `.week { width: 1100px }` (css/app.css:52) e colonne a 160 px: su telefono (390 px) la griglia esce dalla pagina; le celle non sono tabella né hanno ruoli. I punti di stato `.dot` usano solo il colore (verde/arancione/rosso), il testo non c'è; nella schermata la legenda `● presente ● in ritardo ● assente` (turni.html:45) è grigia per tutti e tre i punti, quindi la legenda non spiega nulla; docs/componenti.md:14 dice che il badge ha sempre un testo, ma `.dot` non lo ha (WCAG 2.2, 1.4.1). Non c'è nemmeno un punto per «in ritardo» e «assente» documentato: il documento descrive tre badge, il codice usa quattro classi `.badge-*` e tre `.dot-*`, con nomi diversi (`late`, `orange`, `absent` contro `warning`, `danger`).
- Correzione: unificare il vocabolario degli stati (presente/in ritardo/assente) in una sola famiglia di token `--status-*` e usare lo stesso componente (badge con testo o punto con testo nascosto accanto); legenda con i colori veri.

**DS-15 · P2 · Menu: valori fuori token, ordine e lingua incoerenti**
- Fatto: `.nav` con gap 22 px, padding 13/24 px, font 15 px (css/app.css:17-18), colore attivo `#1f6feb` scritto a mano (:19); voce attiva solo per grassetto e colore. Etichette in lingue miste: «Settings», «Dashboard» (inglese) con «Squadra», «Turni» (italiano); il titolo di dipendenti.html è «Personale» mentre la voce è «Squadra» e il modulo dice «Aggiungi una risorsa» (docs/glossario.md non esaminato). L'ordine delle voci (Settings prima di tutto) non coincide con la frequenza dei compiti. Questi ultimi punti sono di competenza di AIWDA-02 (architettura) e AIWDA-11 (testi): li segnalo per il passaggio, non li approfondisco.
- Correzione di sistema: documentare il menu come componente con token, stato attivo e focus.

**DS-16 · P2 · Pulsanti: tre azioni con lo stesso peso e distruttiva come primaria**
- Fatto: turni.html:27-29: «Pubblica i turni» ed «Elimina settimana» usano entrambi `.btn-primary` (due primari nella stessa vista, contro docs/componenti.md:7 «una sola azione principale per vista»), l'azione distruttiva non usa `.btn-danger` (vedi la schermata: i due pulsanti sono identici). Impostazioni.html:46-48: «OK» e «No» usano entrambi `.btn-secondary` e «Clicca qui»/«Scarica il report» sono `<a class="btn btn-secondary">` (link con aspetto di pulsante, con `href="#"`).
- Correzione: «Elimina settimana» con `.btn-danger` (con conferma, competenza di AIWDA-04/UX); coppia approva/rifiuta con una variante distinta; regola su quando un link ha aspetto di pulsante.

**DS-17 · P3 · Documentazione e codice divergono su più punti**
- docs/componenti.md:3 «Tutti i componenti supportano il tema chiaro e il tema scuro»: nei CSS non c'è nessun tema scuro (nessun `prefers-color-scheme` né `[data-theme]`); inoltre i colori scritti a mano lo impedirebbero (DS-02, DS-03). Dichiarazione non vera.
- docs/componenti.md:13: badge «success (presente), warning (in ritardo), danger (assente)»: il codice ha in più `.badge-orange` e `--color-late` (tokens.css:31-35), non documentati, e l'unico uso reale del badge (impostazioni.html:42) è un contatore «3», non uno stato.
- Componenti nel codice ma non nel documento: `.button`, `.icon-btn`, `.dot`, `.cards`/`.kpi-*`, `.banner`, `.muted`, `.toast`, `.nav`, `.week`, `<details>`, tabella, select, grafici e legenda. Documentati ma senza regole CSS dedicate: errore «collegato al campo», comportamento della finestra.
- README.md:5 dice che le pagine sono statiche e i dati inventati: coerente; README.md:28 elenca i due CSS correttamente.
- Correzione: allineare il documento al codice (o viceversa) e togliere la frase sul tema scuro finché non esiste.

**DS-18 · P3 · Lingua e titoli delle pagine**
- Fatto: `<html lang="en">` in tutte e quattro le pagine, con testi in italiano (WCAG 2.2, 3.1.1, A: la lingua errata fa leggere male il testo ai lettori di schermo; per il compito di una persona che usa un lettore di schermo è almeno P1 secondo la regola comune, da valutare con AIWDA-09). Tutte le pagine hanno `<title>Turnio</title>` identico (2.4.2), non è colpa del design system ma del modello di pagina; lo segnalo per un modello unico.
- Correzione: modello di pagina condiviso con `lang="it"` e titolo per pagina.

**DS-19 · P3 · Accordi `<details>` annidati e senza stile**
- Fatto: impostazioni.html:22-51: fino a tre livelli di `<details>` (Locale > Esporta > Presenze per il consulente) senza nessuna regola CSS: segnale di apertura predefinito del browser, nessun bordo, spaziatura, stato di focus. Nessuna documentazione. Il titolo «Scambi da approvare» con badge contatore dentro `<summary>` è l'unico uso del badge.
- Correzione: se serve il pattern, definirlo (stile, indicatori, focus); il livello di annidamento è un tema di architettura (AIWDA-02).

## Correzioni ad alto impatto trasversale (in ordine)

1. DS-05: un solo stato `:focus-visible` basato su token, tutte le pagine, tutti i componenti interattivi.
2. DS-01 e DS-02: una sola definizione dei colori semantici, sostituire i `#...` scritti a mano con i token (CSS e SVG), con verifica dei contrasti di badge, `--color-muted` e testo bianco su pieno.
3. DS-04, DS-16: un solo pulsante (`.btn`), eliminare `.button`, usare le varianti con il loro significato.
4. DS-07: un solo componente campo (label, errore collegato, ricerca e select inclusi).
5. DS-14, DS-17: vocabolario unico degli stati e documento allineato al codice.

## Domande aperte e limiti

- Non ho verificato in browser hover, focus, disattivato, errore, successo: si deducono dal CSS e dalle schermate statiche. Le schermate su telefono, quelle di index e impostazioni non sono state aperte; js/app.js è stato visto solo per le righe sulle classi. I contrasti citati sono stime da misurare con uno strumento (`requires_human_review: true` per DS-01, DS-12).
- Non ho aperto docs/mappa.md, docs/glossario.md e ricerca/*.md.
- Il tema scuro: è un obiettivo del prodotto o una frase da togliere dal documento? Decisione dell'utente.
- Servono dei componenti ancora assenti (conferma di eliminazione, avviso, scheda numero, tabella responsive)? Dipende dai requisiti del prodotto.

## Passaggi consigliati

- AIWDA-09 (accessibilità): DS-05, DS-07, DS-08, DS-09, DS-18, contrasti di DS-01 e DS-12.
- AIWDA-08 (dati e grafici): DS-03, DS-14 (palette e legenda).
- AIWDA-02 / AIWDA-11: DS-15, DS-19 (menu, annidamento, testi).
- Nessun rilievo P0. Rilievi P1: DS-01, DS-02, DS-03, DS-04, DS-05, DS-07. Non ho lavorato su un modello più piccolo dichiarato dalla sessione, ma ho esaminato un sottoinsieme delle schermate: i rilievi P1 possono essere riesaminati dal direttore AIWDA-01 prima di diventare definitivi.

Firmato: AIWDA-06 · ADHARA
