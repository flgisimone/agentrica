# F55 — Rebranding dell'interfaccia di AIgentrica

**Obiettivo**: il sito su `aigentrica.it` ha un'identità visiva e un'esperienza rinnovate per il marchio AIgentrica (logo, tipografia, gerarchia, componenti, flussi principali), mantenendo la palette attuale e senza perdere accessibilità né contenuti.

> **Stato: completata** il 2026-11-28 su `fase/f55-rebranding-interfaccia` (anche in `aigentrica-site`). Solo sito: nessuna versione nuova del pacchetto, il rilascio in produzione si decide a parte.

**Agenzie**: business (Product Marketing per posizionamento e messaggi del nuovo marchio); web design (Director, UI, Design System, UX, UX Writer, Accessibility) prima per l'audit e le specifiche e dopo per la revisione nel sito; software (Frontend, QA, Code Reviewer).

## Decisioni dell'utente

| Tema | Decisione | Data |
|---|---|---|
| Palette | Resta quella attuale; cambiano soprattutto UI e UX | 2026-11-28 |
| Marchio | AIgentrica (vedi F54) | 2026-11-28 |
| Messaggio (F55-01) | Posizionamento sul controllo: «Agenti IA con un metodo. Le decisioni restano tue.» | 2026-11-28 |
| Linguaggio stellare | Ridotto: restano nomi di stella e glifi nelle schede; nella home resta solo la costellazione dell'hero, senza i testi dei capitoli (rivista dall'utente dopo l'audit) | 2026-11-28 |
| Logo | Wordmark «AIgentrica» con la «I» in ciano `--aisa` (#38d6f0) contro la confusione I/l di Inter (F55-UI-01), solo nel wordmark (header, footer, hero, Open Graph); simbolo e favicon: vedi «Simbolo» | 2026-11-28 |
| Hero della home | Costellazione grande al centro (anello rotondo, reparti che non si coprono mai, scena sempre sopra il testo), senza capitoli, binario né domande; tornano le immersioni nei reparti con l'orbita rotonda; sotto, in basso, «AIGENTRICA» grande in maiuscolo (solo qui) e la tagline, che partono con un velo del loro colore e si riempiono scorrendo; niente pulsanti; la pausa è un'icona discreta nell'angolo (WCAG 2.2.2) | 2026-11-28 |
| Hero sul computer | AIGENTRICA dietro le costellazioni, grande, fermo e solo velato (6% del suo colore, niente riempimento); la scena prende anche il suo spazio; canvas trasparente (`clearRect`), il fondo lo dà la sezione. Sul telefono resta sotto la scena, con il riempimento | 2026-11-28 |
| Header e titolo | «Server MCP per Claude Code» accanto al nome nell'header (da 1280 px); titolo della scheda «AIgentrica · Agenti IA con un metodo. Le decisioni restano tue.» | 2026-11-28 |
| Pagine interne | Barra fissa sotto l'header con il ritorno a sinistra e le azioni a destra: ricerca per parole nelle sezioni di `/installa` (elenco di risultati), menu delle versioni in `/rilasci`, nella lezione l'indice (Sheet sul telefono, a destra e fisso sul computer) e la ricerca nella sola lezione. Flowchart di `/orchestrazione` con i rami in riquadri anche sul computer e il percorso che si accende una volta all'arrivo, con «Riproduci». Footer: Impara, npm e GitHub come pulsanti, sul computer nella colonna «Note» in basso a destra all'altezza del badge, sul telefono sotto il badge | 2026-11-28 |
| Simbolo | Icona «Rete» al posto della tessera «AI» (che all'utente non piaceva): centro ciano (tu) e cinque nodi collegati (i reparti) su tessera scura (`--card`, bordo `--border`); scelta fra quattro proposte, `evidenze/proposta-icone.png` | 2026-11-28 |
| Ordine della home | 01 Come lavoriamo, 02 Come si usa, 03 Reparti, 04 Prima di usarlo | 2026-11-28 |
| Pagine | Header, footer e home; `/agenti` e pagina agente; `/installa`; `/impara` | 2026-11-28 |

## Backlog

| # | Task | Priorità | Esito |
|---|---|---|---|
| F55-01 | Messaggio e posizionamento del marchio AIgentrica (business), base per i testi | P1 | fatto: tagline sul controllo, confermata |
| F55-02 | Audit di design dell'interfaccia attuale rispetto al nuovo marchio, con rilievi in `audit/` | P1 | fatto: `audit/2026-11-28-f55/`, home sezione per sezione |
| F55-03 | Specifiche: logo, tipografia, spaziature, componenti e stati, con la palette esistente nei token | P1 | fatto: decisioni qui sopra, confermate |
| F55-04 | Implementazione nel sito, pagina per pagina secondo le priorità confermate | P1 | fatto: marchio, hero, home, header; le altre pagine cambiano con header e footer |
| F55-05 | Revisione di design e accessibilità (WCAG 2.2 AA) nel sito, e2e e screenshot aggiornati | P1 | fatto: provini del giro intero, contrasti misurati, e2e aggiornate |

## Criteri di accettazione

- Palette invariata: stessi valori dei token di colore, contrasti AA rispettati.
- Logo, favicon e immagini Open Graph con il marchio AIgentrica.
- Rilievi di design P0 e P1 chiusi con evidenza; `npm run verify:e2e` passa.

## Fatto

- **F55-01** Posizionamento sul controllo: tagline «Agenti IA con un metodo. Le decisioni restano tue.» / «AI agents with a method. The decisions stay yours.», anche nel titolo della scheda e nell'immagine Open Graph.
- **F55-02** Audit in `audit/2026-11-28-f55/` (UI e home sezione per sezione). Il rilievo principale: con Inter «AIgentrica» si legge «Algentrica» (I e l uguali; la variante `cv08` non è nel font servito da next/font).
- **F55-03** Specifiche confermate (tabella «Decisioni»): I ciano nel wordmark, icona «Rete» come simbolo e favicon (prima una tessera «AI», sostituita su richiesta dell'utente).
- **F55-04** Sito: `Wordmark` e `BrandMark` in `brand-mark.tsx` (header, footer, Open Graph); `icon.svg` e icone PNG e ICO rigenerate con `scripts/icons.mjs`; «Server MCP per Claude Code» nell'header da 1280 px. Hero: tolti capitoli, binario e riquadro della domanda (e il loro CSS); camera a distanza costante con un giro continuo; anello di raggio 1,6 e inclinazione 0,9 (1,0 in verticale), scala e centro calcolati sull'intero giro perché la scena non copra mai il testo; immersioni nei reparti con orbita quasi rotonda; etichette dei direttori e degli specialisti solo se la scena ha spazio; nomi centrati sul telefono. AIGENTRICA e tagline partono con un velo del loro colore e si riempiono scorrendo (`ScrollFill`, animazione legata allo scroll in CSS, piena con «riduci movimento»). Niente pulsanti nell'hero, pausa come icona. Home: ordine Come lavoriamo, Come si usa, Reparti, Prima di usarlo; reparti in griglia a 5 colonne da 1280 px con il link al catalogo a destra del titolo; «Come lavorano gli agenti» a destra del titolo della simulazione. Header: icona del libro aperto accanto a GitHub verso «Impara» (da 640 px; sul computer «Impara» esce dalla tendina «Come funziona», nel menu del telefono resta); menu del telefono da popover nativo a Sheet di shadcn (`ui/sheet.tsx` dal registro `base-nova`, con gli import del progetto: la CLI voleva sovrascrivere `button.tsx` e aggiungere il pacchetto `cn`). Pagine interne: `PageBar` (barra fissa), `SectionSearch` (Combobox di shadcn che indicizza le sezioni `h2[id]` della pagina, parole senza accenti né maiuscole), `ReleaseJump` (Dropdown Menu), immagine Open Graph centrata (le app di messaggi la ritagliano in un quadrato al centro), indice della lezione (`lesson-toc.tsx`, id delle sezioni dal titolo), `FlowPlayer` per il flowchart (i raccordi si accendono, le caselle restano sempre leggibili e fanno un bagliore: con il testo attenuato axe segnalava il contrasto), pulsanti nel footer; componenti shadcn `combobox`, `input-group`, `input`, `textarea`, `dropdown-menu` dal registro, e `closeLabel` aggiunto allo Sheet per tradurre la X.
- **F55-05** Revisione: provini del giro intero a 1440 e 390 px (`evidenze/dopo-giro-*.png`), schermi bassi e movimento ridotto; contrasto della tagline prima dello scroll misurato a 1,56:1 con il velo al 28% e portato a 3,51:1 (velo al 60%); il logotipo è esente da 1.4.3; la pausa resta per 2.2.2.

## Verifiche

- Sito, alla chiusura: `npm run verify` superato (typecheck, lint, test, build) e `npm run verify:e2e` completo, 165 superati e 3 saltati (gli stessi di prima). axe senza violazioni serious o critical sulle pagine provate.
- Repository principale: `npm run verify` superato (216 test); `check` di `plan/` e `audit/` senza problemi.
- Nel browser (Playwright, Chrome) a 1440, 1280, 1024, 390 e 360 px: hero (provini del giro intero, `evidenze/dopo-giro-*.png`), riempimento con lo scroll, marchio dietro le costellazioni, immersioni, griglia dei reparti, Sheet del menu e dell'indice, ricerche, menu delle versioni, flowchart animato, footer, immagine Open Graph (`evidenze/dopo-*.png`).
- **Non verificato**: Firefox, che non ha le animazioni legate allo scroll (il testo resta pieno, come previsto dal CSS, ma non l'ho aperto); l'anteprima dei link nelle app di messaggi, che si vede solo dopo il deploy.

## Rilievi aperti

- **P2** F55-UI-06 Badge di mcprush nel footer con il vecchio nome e la 0.19.0: si chiude in F56 con la scheda `aigentrica-mcp`. Repository `aigentrica`. Issue: https://github.com/flgisimone/aigentrica/issues/61
- **P3** F55-UX-04 Nella home le sezioni Consumo e Progetti (che compaiono sopra una soglia) hanno l'eyebrow senza numero, a differenza di 01–04. Repository `aigentrica-site`. Issue: https://github.com/flgisimone/aigentrica-site/issues/36

