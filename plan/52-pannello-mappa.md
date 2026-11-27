# F52 — Pannello: vista compatta e mappa degli agenti; pagine del sito

**Obiettivo**: nelle sessioni lunghe, con agenti richiamati più volte, la pagina Agenti del pannello resta corta da scorrere e mostra il percorso della sessione con una mappa a corsie per reparto. Le pagine `/pannello` e `/orchestrazione` del sito si allineano.

> **Stato: da fare**. Registrata il 2026-11-27 con le decisioni sotto; si pianifica in una sessione dedicata dopo F51, con design prima del software. Backlog e criteri si confermano lì.

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

## Proposte da confermare

- «Per reparto» compatta: una riga per agente con il numero delle chiamate (×3) e il dettaglio a scomparsa; scheda intera solo per l'ultima chiamata.
- Header (F52-05), già provato in una bozza poi annullata: un componente `NavMenu` per «Reparti» e «Come funziona», popover ancorato alla voce con l'anchor positioning (`anchor-name` sulla voce, `top: anchor(bottom)`, `position-try-fallbacks: flip-inline`, ripiego sulla posizione di oggi senza supporto); al passaggio del mouse `showPopover()`, chiusura 150 ms dopo l'uscita da voce e pannello, clic annullato se il menu è stato aperto dal mouse; tastiera ed Esc come oggi. Nella prova con Playwright a 1390 px i pannelli stavano sotto le voci e passavano apertura al passaggio, chiusura all'uscita, tastiera ed Esc. Nessuna dipendenza nuova.
- La mappa con testo vero accanto al disegno (elenco in ordine per i lettori di schermo), come il diagramma del sito.

## Backlog

Da confermare alla pianificazione.

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
