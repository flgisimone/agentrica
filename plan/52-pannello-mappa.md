# F52 — Pannello: vista compatta e mappa degli agenti; pagine del sito

**Obiettivo**: nelle sessioni lunghe, con agenti richiamati più volte, la pagina Agenti del pannello resta corta da scorrere e mostra il percorso della sessione con una mappa a corsie per reparto. Le pagine `/pannello` e `/orchestrazione` del sito si allineano.

> **Stato: completata** (2026-11-28). Branch `fase/f52-pannello-mappa` in tutti e due i repository, da `develop`. Registrata il 2026-11-27; backlog, proposte e cosa cambiare nel sito confermati dall'utente il 2026-11-28 all'apertura, con pianificazione e sviluppo nella stessa sessione (scelta dell'utente). Rilasciata con la 0.21.0 il 2026-11-28: pacchetto su npm con provenance (tag `v0.21.0`) e sito con la dipendenza alla 0.21.0, header nuovo e pagine `/pannello` e `/orchestrazione` (le schermate mostrano il pannello di questa fase).

**Agenzie**: web design (UX Designer e Dataviz Designer per la mappa, Accessibility, UX Writer per i testi); software (Frontend, QA, Code Reviewer).

## Situazione di partenza

- Il pannello è HTML, CSS e JavaScript senza framework in `packages/mcp/src/page/` (`app.js` di circa 760 righe), servito da `node:http`.
- `renderTree` (`app.js`) apre una colonna per ogni tratto consecutivo di chiamate dello stesso reparto e dentro mette una scheda intera, con compito e resoconto, per ogni chiamata. Un agente richiamato tre volte dà tre schede; un reparto che torna apre una colonna in più. La pagina cresce con il numero di chiamate.
- Il server sa solo l'ordine in cui gli agenti si caricano con `agent` (orario, reparto, resoconto), non chi ha chiamato chi.
- Sito: `/pannello` descrive il pannello; `/orchestrazione` ha in cima il diagramma di flusso di F48 (`src/components/orchestration-flow.tsx` in `agentrica-site`).

## Decisioni dell'utente (2026-11-27)

| Tema | Decisione |
|---|---|
| Vista | Due tab nella pagina Agenti: «Per reparto», la vista di oggi resa compatta, e «Mappa» |
| Mappa | Corsie per reparto: una riga per reparto, le chiamate da sinistra a destra nell'ordine, frecce fra un passaggio e il successivo. Niente campo «chiamato da» |
| Tecnologia | Resta senza framework: tab, `<details>` e SVG nel JavaScript di oggi, nessuna dipendenza né build nuova. React e shadcn scartati per questa fase (build e bundle nel pacchetto, devDependencies, catena di fornitura da rivedere) |
| Ordine | Dopo F51 |
| Sito | Si sistemano `/pannello` e `/orchestrazione`, con il suo diagramma di flusso; cosa cambiare si decide alla pianificazione |

- Header del sito (segnalato dall'utente il 2026-11-27, `src/components/site-header.tsx`): il pannello «Reparti» è un popover posizionato a destra del contenuto (`right-[max(1rem,…)]`), non sotto la voce, e si apre solo al clic. «Come funziona» è un link diretto a `/orchestrazione`; `/pannello` non è nell'header, si raggiunge da home, footer, `/installa` e `/orchestrazione`.
- Pagine fuori dall'header (verifica del 2026-11-27): `/pannello` e `/note-legali` (footer e link nel testo); `/reputazione/[sigla]` (da `/reputazione`); `/agenti/[id]` (dal catalogo, come previsto). `/progetti`, `/reputazione` e `/consumo` sono nell'header solo sopra le soglie; sotto, `/progetti` e `/reputazione` danno 404, mentre `/consumo` esiste sempre e resta linkata dal testo di `/pannello`.

## Proposte (confermate il 2026-11-28)

- «Per reparto» compatta: una riga per agente con il numero delle chiamate (×3) e il dettaglio a scomparsa; scheda intera solo per l'ultima chiamata.
- Header (F52-05), già provato in una bozza poi annullata: un componente `NavMenu` per «Reparti» e «Come funziona», popover ancorato alla voce con l'anchor positioning (`anchor-name` sulla voce, `top: anchor(bottom)`, `position-try-fallbacks: flip-inline`, ripiego sulla posizione di oggi senza supporto); al passaggio del mouse `showPopover()`, chiusura 150 ms dopo l'uscita da voce e pannello, clic annullato se il menu è stato aperto dal mouse; tastiera ed Esc come oggi. Nella prova con Playwright a 1390 px i pannelli stavano sotto le voci e passavano apertura al passaggio, chiusura all'uscita, tastiera ed Esc. Nessuna dipendenza nuova.
- La mappa con testo vero accanto al disegno (elenco in ordine per i lettori di schermo), come il diagramma del sito.

## Decisioni dell'apertura (2026-11-28)

| Tema | Decisione |
|---|---|
| Backlog | Tutte e otto le attività, con le priorità scritte |
| Vista compatta | Come proposta: una riga per agente con ×N, l'ultima chiamata intera, le precedenti a scomparsa |
| Specifica F52-01 | Una colonna per reparto anche quando il reparto torna (i ritorni stanno nella mappa); scelta della vista con due pulsanti, ricordata in `#agents/map` |
| Sito (F52-04) | `/pannello` descrive i due tab con una schermata della mappa; `/orchestrazione` tiene il diagramma e rimanda alla mappa del pannello |
| Chiamate tenute | `MAX_ACTIVITY` del server da 20 a 100, perché la mappa non perda i primi passaggi; oltre, la mappa lo dice |

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F52-01 | Specifica di design di tab, vista compatta e mappa a corsie (UX, Dataviz, Accessibility) | P1 |
| F52-02 | Vista «Per reparto» compatta e tab nel pannello | P1 |
| F52-03 | Mappa a corsie in SVG nel pannello | P1 |
| F52-04 | Pagine `/pannello` e `/orchestrazione` del sito allineate, diagramma di flusso compreso (it/en) | P2 |
| F52-05 | Header del sito: i menu a tendina si aprono sotto la loro voce e anche al passaggio del mouse; «Come funziona» diventa un menu con «Come lavorano gli agenti» (`/orchestrazione`) e «Il pannello» (`/pannello`), anche nel menu mobile | P1 — difetto visibile |
| F52-06 | Header: icona GitHub con link al repository accanto al selettore di lingua, su computer e telefono, con nome accessibile | P2 |
| F52-07 | Header: menu «Community» con Progetti, Reputazione e Consumo, visibile quando almeno una delle tre pagine supera la sua soglia, con dentro solo quelle visibili (computer e menu mobile) | P2 — l'header regge anche sopra le soglie |
| F52-08 | Link a `/consumo` nel testo di `/pannello` (it/en): tolto o mostrato solo sopra la soglia, come nell'header | P3 |

## Criteri di accettazione

- Con una sessione di prova di almeno 20 chiamate e agenti ripetuti, la vista «Per reparto» ha una riga per agente e la pagina non cresce con le chiamate ripetute.
- La mappa mostra l'ordine dei passaggi e i ritorni di reparto, si legge con la tastiera e con un lettore di schermo, regge a 390 px e a 1280 px.
- Nessuna dipendenza nuova nel pacchetto `@agentrica/mcp`.
- Le pagine del sito descrivono il pannello com'è dopo la fase, in italiano e in inglese.
- Nell'header ogni menu a tendina si apre sotto la sua voce, al clic, con la tastiera e al passaggio del mouse; `/pannello` è raggiungibile dal menu «Come funziona» su computer e telefono; l'icona GitHub porta al repository; con tutte e tre le pagine sopra soglia l'header sta su una riga a 768 px e a 1280 px; l'e2e del menu in `landing.spec.ts` resta verde.

## Fatto

- **F52-01** Specifica di design (AIWDA-01 con AIWDA-07 per la mappa e AIWDA-08 per l'accessibilità, WCAG 2.2): due pulsanti `aria-pressed` in un gruppo con nome; ×N con il testo «N chiamate» per i lettori di schermo; corsie di 44 px con le sigle fuori dall'area che scorre; cerchi numerati, anello doppio per il direttore, pieno per l'attivo, frecce rette nella corsia e curve fra corsie; SVG `aria-hidden` con l'elenco «I passaggi in ordine»; area che scorre focalizzabile; ridisegno solo quando cambiano le chiamate, senza sostituire il contenitore. Confermata dall'utente.
- **F52-02** «Per reparto» in `packages/mcp/src/page/app.js`: una colonna per reparto, una riga per agente con ×N e i numeri delle chiamate su una riga a parte, l'ultima chiamata intera e le precedenti in «Chiamate precedenti (N)», aperte e chiuse come le lascia l'utente. Con 22 chiamate la pagina ha 8 righe.
- **F52-03** «Mappa» in SVG costruito con `createElementNS` e classi (la CSP non ammette stili inline), elenco testuale con direttore, «ritorno del reparto» e attivo; si apre sull'ultimo passaggio e lo segue quando ne arriva uno nuovo; focus e scorrimento restano agli aggiornamenti. `MAX_ACTIVITY` a 100 in `panel.ts` (test e README it/en), con la nota nella mappa quando la sessione ci arriva.
- **F52-04** Sito: `/pannello` (it/en) descrive le due viste con la schermata nuova `pannello-agents-map-*.png` (sette schermate, script `panel-screenshots` esteso); `/orchestrazione` (it/en) rimanda alla mappa del pannello come percorso reale del diagramma.
- **F52-05** Header: componente `NavMenu` per «Reparti», «Come funziona» (Come lavorano gli agenti, Il pannello) e «Community», con l'anchor positioning in `globals.css` e la posizione di prima senza supporto; apertura al passaggio del mouse, chiusura 150 ms dopo l'uscita, clic che tiene aperto il menu aperto dal mouse, tastiera ed Esc della Popover API. Sotto i 1024 px il menu unico (prima sotto i 768): a 768 le voci uscivano di 149 px. Menu del telefono con i gruppi «Come funziona» e «Community».
- **F52-06** Icona GitHub (marchio in SVG, lucide non ha più i marchi) con nome accessibile «Il codice su GitHub», accanto al selettore di lingua su computer e telefono.
- **F52-07** «Community» con Progetti, Reputazione e Consumo, solo quelle sopra soglia, e solo se ce n'è almeno una.
- **F52-08** In `/pannello` il link a `/consumo` c'è solo quando la pagina mostra i totali (`getUsage().visible`); sotto la soglia il nome resta come testo.

## Verifiche

- Pacchetto: `npm run verify` verde il 2026-11-28 (typecheck, lint, 204 test).
- Sito: `npm run verify` verde; `npm run verify:e2e` 151 passati e 3 saltati, con il nuovo `e2e/header.spec.ts` (menu sotto la voce con mouse, clic, tastiera ed Esc; chiusura all'uscita; header su una riga a 768 e 1280 px con le tre pagine sopra soglia; GitHub; «Il pannello» nel menu del telefono) e quattro spec allineate all'header nuovo.
- Pannello con Playwright su una sessione di 22 chiamate con agenti ripetuti e ritorni di reparto: schermate a 390 e 1280 px; Tab dal pulsante alla mappa; focus e scorrimento conservati dopo un agente nuovo; casi limite 0, 1 e 105 chiamate (vuoto, un nodo, 101 nodi con la nota), nessun errore JavaScript. Un difetto trovato dal QA e corretto: con una corsia nuova la mappa restava 15 px prima della fine.
- Code Reviewer: APPROVE dopo una correzione P3 (la scelta «Mappa» ora resta tornando dalla scheda «Agenti»).
- Non fatta: la prova con un lettore di schermo vero.

## Rilievi aperti

- P3: al rilascio, voce del `CHANGELOG` (it, en) e pubblicazione insieme di pacchetto e sito, perché le schermate di `/pannello` mostrano già le viste nuove. Issue [#55](https://github.com/flgisimone/agentrica/issues/55).
