# F1 — Landing di Agentrica

**Obiettivo**: la pagina iniziale presenta Agentrica e i suoi cinque reparti in modo chiaro e credibile, con dati presi dal catalogo, e invita a esplorare reparti e agenti (le pagine arrivano in F2 e F3).

> **Stato: completata** (branch `fase/f1-landing`; hash del merge dopo la chiusura). Testi, colori e link del footer confermati dall'utente il 2026-11-15.

**Agenzie**: web design (Director, UX Designer, UI Designer, UX Writer, Accessibility Specialist) prima e dopo; software (Frontend Developer, QA, Performance, Code Reviewer).

## Proposte da confermare

- Testi della landing (titolo, sottotitolo, sezioni): proposta del UX Writer prima dell'implementazione.
- Colore d'accento di ogni reparto.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F1-01 | Design system di base: token di colore (fondo scuro, testo, un accento per reparto), tipografia, spaziature, focus visibile; tema scuro come unico tema | P1 |
| F1-02 | Hero: «Agentrica», cos'è (una consulenza fatta di agenti IA), numeri presi dal catalogo (5 reparti, 56 agenti), invito a scoprire i reparti | P1 |
| F1-03 | I cinque reparti: sigla, nome, cosa fa, numero di agenti, direttore con nome in codice; i nomi in codice degli agenti del reparto | P1 |
| F1-04 | Come lavoriamo: attivazione su richiesta, ordine del flusso trasversale (business → design → privacy → software → revisioni), conferma del cliente su ogni decisione | P1 |
| F1-05 | Verso l'MCP: l'obiettivo di usare gli agenti nei propri progetti, dichiarato come futuro e non come funzione disponibile | P2 |
| F1-06 | Footer: trasparenza (agenti IA, società fittizia), link al repository | P2 |
| F1-07 | Responsive da 360 px; HTML semantico; meta title e description; favicon | P1 |
| F1-08 | Playwright e axe: prova di fumo della landing (numeri dal catalogo, cinque reparti) e nessuna violazione serious o critical; `verify:e2e` | P1 |

## Criteri di accettazione

- Ogni numero, nome di reparto e nome in codice della pagina viene dal catalogo, non è scritto a mano.
- Nessuna affermazione inventata: niente clienti, casi di successo, recensioni o persone.
- Contrasto AA su tutti i testi e gli accenti; tutto raggiungibile da tastiera con focus visibile.
- Nessuno scorrimento orizzontale da 360 px in su.
- `npm run verify` e `npm run verify:e2e` passano.
- Revisione di design (Director, UI, UX Writer, Accessibility) senza rilievi P0 o P1 aperti.

## Fatto

- **F1-01** `apps/site/src/styles/global.css`: token (fondo blu notte `#0b1020`, superfici, testo, testo attenuato), un accento per reparto con `[data-dept]` (AIBPD ambra, AICA corallo, AIPCA viola, AISA ciano, AIWDA verde menta), font di sistema, spaziature, focus bianco visibile, campo di stelle statico in CSS, `prefers-reduced-motion`. Layout `Base.astro` con meta, Open Graph, favicon SVG e link «Vai al contenuto».
- **F1-02** Hero: «Consulenza digitale · 5 reparti · 56 agenti IA», titolo, sottotitolo e testo approvati; «Scopri i reparti» e «Come lavoriamo»; legenda delle cinque sigle che porta alle schede. Numeri dal catalogo.
- **F1-03** `DepartmentCard.astro`: sigla e colore, nome, numero di agenti, sintesi, direttore con nome in codice e ruolo; gli altri agenti in un `<details>` nativo (nessun JavaScript), con indicatore «+»/«−».
- **F1-04** «Come lavoriamo»: tre principi (su richiesta, solo gli specialisti che servono, decidi tu) e il flusso trasversale in 7 passi con le sigle dei reparti.
- **F1-05** «Presto nei tuoi progetti», segnato «In sviluppo», senza link finti.
- **F1-06** Footer: dichiarazione di società fittizia e agenti IA; link ad agentic-starter (il repository di Agentrica è privato, scelta dell'utente).
- **F1-07** Responsive da 360 px (griglie `auto-fit`, nessuno scorrimento orizzontale), HTML semantico (un `h1`, sezioni con titolo, liste), meta title e description.
- **F1-08** `@playwright/test` 1.65.1 e `@axe-core/playwright` 4.14.0; `e2e/landing.spec.ts` (5 prove × computer 1440 px e telefono 360 px): numeri dal catalogo, cinque schede con direttore e tutti gli agenti, link della hero, scorrimento orizzontale, axe WCAG 2.2 AA con le schede aperte. `verify:e2e`; `workflow_dispatch` nella CI per lanciarla a mano; `tsconfig.json` di root per tipizzare e2e e configurazione.

## Verifiche

- `npm run verify`: superato (tsc del catalogo e degli e2e, `astro check` 0 errori, lint, 6/6 test, build).
- `npm run verify:e2e`: 10/10, partendo senza server attivi.
- Revisione di design sugli screenshot a 1440 e 360 px (Director, UI Designer, UX Writer, Accessibility): corretti in fase un P1 (il `summary` con `display: flex` perdeva il triangolo e non sembrava apribile) e un P2 (spazio mancante prima del link nel footer).
- **Non verificato**: Safari e Firefox; lettore di schermo reale (solo axe); CI su GitHub (vedi rilievi).

## Rilievi aperti

- CI di GitHub mai partita su questo repository (0 esecuzioni con il workflow attivo; c'è invece un check di Vercel in coda): si ricontrolla al push di F1, poi le impostazioni di Actions dell'account. P1.
- Hero a 1440 px: la metà destra è vuota. Una costellazione dei reparti lì sarebbe la naturale anteprima delle pagine di F2. P3, da valutare in F2.
- Griglia dei reparti 3 + 2 con una casella vuota a 1440 px. P3.
- A 360 px la riga sopra il titolo va a capo spezzando «56 agenti IA». P3.
- Il titolo in sfumatura non è misurabile da axe; i suoi colori sono chiari sul fondo scuro (contrasto alto a occhio), da misurare con lo strumento in F2. P3.
- Dipendenze di sviluppo: minimatch moderato in typescript-eslint (da F0). P3.
- Corretto in fase: il `.gitignore` dello starter ignorava solo `node_modules` della root, e F0 aveva committato la cache di Vite di `apps/site/node_modules` (29 file, nessun dato sensibile); ora `node_modules/` vale ovunque e i file sono tolti dal repository. Stessa correzione nel template di agentic-starter.
