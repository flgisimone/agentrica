# F57 — Componenti shadcn al posto dei nativi

**Obiettivo**: nel sito ogni elemento di interfaccia che ha un equivalente in shadcn (stile `base-nova`, Base UI) usa il componente shadcn invece di un elemento nativo o fatto a mano, senza perdere accessibilità, contenuti né comportamento.

> **Stato: da fare.** Registrata il 2026-11-28 durante F55, su richiesta dell'utente: «niente componenti nativi se possiamo usare quelli di shadcn», per tutti i componenti. In F55 il menu del telefono è già passato da popover nativo a Sheet.

**Agenzie**: web design (Design System, Accessibility) per le specifiche e la revisione; software (Frontend, QA, Code Reviewer).

## Decisioni dell'utente

| Tema | Decisione | Data |
|---|---|---|
| Regola | Componenti shadcn al posto di nativi o fatti a mano, per tutti i componenti che hanno un equivalente | 2026-11-28 |
| Installazione | Dal registro (`https://ui.shadcn.com/r/styles/base-nova/<nome>.json`) con gli import del progetto: la CLI chiede di sovrascrivere `button.tsx` e aggiunge il pacchetto `cn` a `package.json` (visto in F55) | 2026-11-28 |

## Backlog

| # | Task | Priorità |
|---|---|---|
| F57-01 | Indice di `/installa` sul telefono: da `<details>` ad Accordion (`docs-nav.tsx`) | P2 |
| F57-02 | Mac e Windows nei comandi: da tab fatte a mano a Tabs (`os-tabs.tsx`) | P2 |
| F57-03 | Tendine dell'header (Reparti, Come funziona, Community): da popover nativi a Navigation Menu, con i test di posizione, mouse, tastiera ed Esc di `header.spec.ts` | P2 |
| F57-04 | Catalogo `/agenti`: ricerca con Input, filtri per reparto e modello con Toggle Group | P2 |
| F57-05 | Pulsanti nativi a Button: copia comando, pausa dell'hero, pulsanti di `/progetti` e del terminale | P3 |
| F57-06 | Tabelle di `/consumo` e `/reputazione` con Table | P3 |
| F57-07 | Suggerimenti `title` (icone dell'header, barre dei grafici) con Tooltip, dove servono anche da tastiera | P3 |
| F57-08 | Revisione di design e accessibilità (WCAG 2.2 AA) nel sito, `npm run verify:e2e` | P1 |

## Criteri di accettazione

- Nessun elemento nativo o fatto a mano con un equivalente shadcn nelle pagine del sito, salvo eccezioni motivate e confermate dall'utente.
- Comportamento da tastiera e lettori di schermo uguale o migliore; axe senza violazioni serious o critical.
- `npm run verify` e `npm run verify:e2e` passano; nessuna dipendenza npm nuova senza l'ok dell'utente.
