# F7 — Identità corporate

**Obiettivo**: dare al sito un registro corporate e più curato nella presentazione: palette presa dai ritratti dei direttori, header con menu, sfondo animato, transizioni fra le pagine, card dei reparti più semplici e un volto per ogni agente (foto o segnaposto).

> **Stato: completata.** Decisioni confermate dall'utente il 2026-11-15; risultato approvato dall'utente nell'app.

**Agenzie**: design (UI Designer, Design System Specialist, Information Architect per il menu, Accessibility Specialist) prima e dopo le modifiche; software (Frontend, QA, Performance per sfondo animato e immagini, Code Reviewer). Business (Product Marketing Manager) solo su richiesta, per i testi.

## Situazione di partenza

- Tema «tech scuro» in `apps/site/src/app/globals.css`: fondo `#0b1020`, cinque accenti saturi per reparto, campo di stelle statico nel `body`.
- Nessun header di navigazione: la hero è l'header della landing; le pagine di reparto e agente non hanno un menu comune.
- `DepartmentCard` ha un `Collapsible` con gli altri agenti, oltre al link al reparto.
- Ritratti dei cinque direttori forniti dall'utente: uffici bianchi e grigio chiaro, blu navy, antracite. Gli altri 51 agenti arriveranno man mano.

## Decisioni (2026-11-15)

- **Fasi**: F7 identità corporate, F8 sezioni «Come lavoriamo» e MCP, F9 pubblicazione (con i vincoli già decisi per la vecchia F7).
- **Anteprima prima del codice**: palette e design system si provano in un'anteprima con due varianti affiancate, **chiaro corporate** e **navy scuro**, ciascuna con accenti dei reparti sobri e in versione monocromatica. Nessun token cambia nel sito prima della conferma visiva dell'utente.
- **Volti**: foto con dicitura IA. Ogni ritratto ha l'etichetta «Volto generato con IA» e un testo alternativo come «Ritratto generato con IA di AIBPD-01 · ALDERAMIN». Chi non ha ancora una foto ha un segnaposto. La decisione «Trasparenza» del piano si aggiorna di conseguenza.
- **Ritratti dei direttori** (ordine dei file forniti): AIBPD-01 ALDERAMIN, AICA-01 VEGA, AIPCA-01 ARCTURUS, AISA-01 SIRIUS, AIWDA-01 CANOPUS.
- **Sfondo animato**: rete di nodi su canvas, velocità circa 0,2 px per fotogramma (provata nell'anteprima) nei toni della palette; ferma con `prefers-reduced-motion`, in pausa quando la scheda non è visibile, decorativo (`aria-hidden`).
- **Variante (anteprima confermata)**: A · chiaro corporate. Fondo `#f4f6f9`, card `#ffffff`, superfici `#e9edf2`, bordi `#d7dde6`, testo `#131c2e` (15,7:1), testo secondario `#4b5567` (6,9:1), principale navy `#1c2b47` (13,1:1).
- **Accenti dei reparti**: sobri, tutti AA come testo sul fondo: AIBPD `#8a5a00`, AICA `#a8392c`, AIPCA `#5a46a8`, AISA `#0b6a80`, AIWDA `#1d6f4c`.
- **Font**: Inter per il testo, JetBrains Mono per sigle e nomi in codice, con `next/font` (serviti dal sito, nessuna richiesta a Google dai visitatori).
- **Componenti dell'anteprima da riprendere**: header chiaro con sfocatura e pannello «Reparti»; hero con mosaico dei cinque direttori (griglia a 6 colonne con riquadri di forme diverse e una fascia larga in basso, inquadrata sul volto; scelta dell'utente fra quattro disposizioni provate); card con foto 16:9 e bordo nell'accento; pagina agente con ritratto 4:5 a sinistra; segnaposto con l'iniziale della stella.
- **Testi**: «fatta di agenti IA» esce da claim, titolo e descrizioni. Claim «Consulenza agentica, con te al comando.», titolo «Agentrica · Consulenza agentica», descrizioni «società fittizia di consulenza agentica». Restano «56 agenti IA» sopra il titolo e «è un agente IA» nella pagina dell'agente: sono la dichiarazione di trasparenza, con «Volto generato con IA». README e server MCP invariati.
- **Card dei reparti**: niente accordion; la card intera porta alla pagina del reparto, con volto e nome del direttore.

## Proposte da confermare all'apertura dei task

- Voci del menu: Reparti (con i cinque reparti), Come lavoriamo, Server MCP; su mobile un pannello a scomparsa.
- Transizioni di pagina con le View Transitions di React/Next (nessuna dipendenza nuova), da verificare nella documentazione di Next 16 in `node_modules/next/dist/docs`.
- Ritratti in `apps/site/public/volti/<id>.jpg` (es. `aibpd-01.jpg`), serviti con `next/image`; il segnaposto si usa quando il file manca, deciso al build.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F7-01 | Palette estratta dai ritratti; anteprima con le due varianti (header, card con volto, pagina agente, sfondo), contrasti AA misurati; **conferma visiva dell'utente** sulla variante e sugli accenti | P1 |
| F7-02 | Token del tema in `globals.css` (variante A, accenti sobri) e font con `next/font` | P1 |
| F7-03 | Header con menu comune a tutte le pagine (desktop e mobile, tastiera, `aria-current`), skip link | P1 |
| F7-04 | Volti: ritratti dei direttori nel repository, componente ritratto con dicitura IA e segnaposto; nelle card dei reparti, nella squadra e a sinistra nella pagina dell'agente | P1 |
| F7-05 | Card dei reparti senza accordion, tutta cliccabile verso il reparto | P2 |
| F7-06 | Sfondo animato a rete di nodi, con riduzione del movimento e pausa fuori schermo | P2 |
| F7-07 | Transizioni fra le pagine, disattivate con `prefers-reduced-motion` | P2 |
| F7-08 | Revisione di design nell'app (360, 768, 1440 px), e2e e axe aggiornati, peso delle immagini e dello sfondo controllato | P2 |

## Fatto

- **F7-01** Palette estratta dai ritratti con sharp; anteprima HTML con le due varianti e i due modi degli accenti, contrasti calcolati (tutti ≥ 4,5:1). L'utente ha scelto la variante A con accenti sobri e i font Inter e JetBrains Mono.
- **F7-02** Token della variante A e accenti sobri in `globals.css`; Inter e JetBrains Mono con `next/font` (`--font-inter`, `--font-jetbrains`); `scroll-padding-top` per le ancore sotto l'header fisso.
- **F7-03** `components/site-header.tsx` nel layout: marchio, menu «Reparti» e pannello mobile con la Popover API (Esc e clic fuori senza codice, chiusura al clic su un link), `aria-current`, «Come lavoriamo» e il pulsante «Usa gli agenti» verso `#mcp` (non «Scopri i reparti», già nella hero). Le intestazioni delle pagine sono `.page-intro` e non `<header>`, così il landmark banner è uno solo.
- **F7-04** Ritratti in `public/volti/<id>.webp` (960 px, 13–23 kB); `lib/portraits.ts` decide al build se il file c'è; `components/portrait.tsx` con etichetta «Volto generato con IA» / «Volto IA» / «IA» e testo alternativo, altrimenti segnaposto con l'iniziale della stella. Nelle card, nel mosaico della hero (`components/directors-mosaic.tsx`, al posto della costellazione), nella squadra del reparto e a sinistra nella pagina dell'agente.
- **F7-05** `DepartmentCard` senza accordion: foto alta 14 rem (anche nelle card larghe non taglia i volti), scheda tutta cliccabile verso il reparto.
- **F7-06** `components/network-background.tsx`: canvas fisso, nodi in proporzione all'area, ferma con `prefers-reduced-motion` e a scheda nascosta.
- **F7-07** `components/page-transition.tsx` con `ViewTransition` di React in ogni pagina: dissolvenza con leggera salita, header fermo, durata zero con `prefers-reduced-motion`.
- **F7-08** Revisione nell'app a 1440 e 375 px, corretti l'header che copriva le ancore e le foto tagliate nelle card larghe; risultato approvato dall'utente su `npm run dev`. Ritratti 13–23 kB l'uno.
- **e2e** Card con ritratto e dicitura, menu dell'header verso il reparto, cinque direttori nel mosaico (computer), segnaposto per chi non ha foto; selettore `.page-intro` al posto di `header`.

## Verifiche

- `npm run verify` verde; `npm run verify:e2e` 45 superati e 1 saltato di proposito (mosaico assente sul telefono), axe senza violazioni serious o critical.
- Prova nell'app con `npm run dev` a 1440 e 375 px: hero, card, menu, pagina reparto, pagina agente. Transizione fra le pagine provata dall'utente nell'app.

## Rilievi aperti

- Larghezza 768 px non guardata a occhio (coperta solo dagli e2e a 360 e 1440 px). P3. Risolto in F15: landing, reparto e agente guardati a 768 px, senza scorrimento orizzontale.
- Sfondo: costo per fotogramma non misurato con il profiler (circa 60 nodi su 1440 × 900, confronto fra tutte le coppie). Da controllare con Performance in F8 o F9. P3. Risolto in F15: 60 fps per 5 s a 1440 × 900, circa 0,5 ms di script per fotogramma, nessun long task, anche con la CPU rallentata 4×.
- Sezioni «Come lavoriamo» e MCP invariate: sono F8. Risolto in F8.

## Criteri di accettazione

- La variante e gli accenti sono quelli confermati dall'utente sull'anteprima; testo e accenti hanno contrasto AA misurato sul nuovo fondo.
- Ogni pagina ha lo stesso header con menu, utilizzabile da tastiera e su 360 px.
- Ogni ritratto dice che il volto è generato con IA (etichetta visibile e testo alternativo); chi non ha foto mostra il segnaposto.
- Le card dei reparti non hanno accordion e portano al reparto.
- Sfondo e transizioni si fermano con `prefers-reduced-motion`; lo sfondo non blocca il thread principale (verifica di Performance).
- `npm run verify` e `npm run verify:e2e` passano.

Il seguito è in [08-sezioni.md](08-sezioni.md).
