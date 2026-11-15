# F2 — Il sito passa a Next.js

**Obiettivo**: `apps/site` riscritto in Next.js 16 con Tailwind 4 e shadcn/ui, con la stessa landing di F1 (stessi contenuti, stesse prove e2e verdi), pronto per le pagine dei reparti e degli agenti. AIBPD-01 diventa ALDERAMIN.

> **Stato: completata** (`d2d3b62`, merge `efa491b` in `develop`). Next, Tailwind con shadcn, riorganizzazione delle fasi e ALDERAMIN scelti dall'utente il 2026-11-15; dipendenze approvate lo stesso giorno.

**Agenzie**: software (Architect, Frontend Developer, DevOps, QA, Code Reviewer); web design (UI Designer, Design System Specialist, Accessibility) per la revisione della parità visiva.

## Proposte da confermare

- Dipendenze, versioni esatte. Sito: `next` 16.4.6, `react` e `react-dom` 19.3.1, `@base-ui/react` 1.9.0, `class-variance-authority` 0.7.1, `clsx` 2.1.1, `tailwind-merge` 3.7.0, `lucide-react` 1.73.0. Sviluppo del sito: `tailwindcss` e `@tailwindcss/postcss` 4.3.5, `tw-animate-css` 1.4.0, `shadcn` 4.23.0, `@types/react` e `@types/react-dom` 19.3.0, `eslint-config-next` 16.4.6. Tolti: `astro`, `@astrojs/check`.
- Componenti shadcn iniziali: `button`, `badge`, `card`, `collapsible` (al posto del `<details>` delle schede).

## Backlog

| # | Task | Priorità |
|---|---|---|
| F2-01 | `apps/site` in Next.js 16 App Router: `src/app/layout.tsx`, `page.tsx`, metadata, favicon; il catalogo come pacchetto del workspace (`transpilePackages`) letto nei Server Components | P1 |
| F2-02 | Tailwind 4 e shadcn (base-nova, Base UI): `globals.css` con i token del tema scuro di F1 e gli accenti dei reparti come variabili; `components.json`; `src/lib/utils.ts` | P1 |
| F2-03 | Landing con gli stessi contenuti e lo stesso aspetto di F1, in componenti React: hero, scheda del reparto (con `Collapsible`), come lavoriamo, MCP, footer | P1 |
| F2-04 | Le schede dei reparti preparano le pagine di F3 e F4: id stabili per `/reparti/[sigla]` e `/agenti/[id]` nel catalogo (`slug` del reparto in minuscolo, `id` dell'agente) | P2 |
| F2-05 | `departments.ts`: AIBPD-01 da CAPELLA ad ALDERAMIN; test aggiornati | P1 |
| F2-06 | Script `dev`, `build`, `typecheck` (`next typegen` + `tsc`), `lint` (ESLint con `eslint-config-next`); Playwright con `next start`; `.gitignore` con `.next/` e `next-env.d.ts` | P1 |
| F2-07 | CONVENTIONS (§5, §9, §11, §15), AGENTS (adattamenti e blocco delle regole di Next se lo scrive `next dev`) e README aggiornati per Next | P1 |

## Criteri di accettazione

- `npm run verify` e `npm run verify:e2e` passano con le stesse prove di F1 (numeri dal catalogo, cinque reparti con direttore e agenti, link della hero, nessuno scorrimento a 360 px, axe senza violazioni serious o critical).
- La landing è uguale a quella di F1 a 1440 e 360 px, salvo i componenti shadcn (revisione di design senza P0 o P1).
- Nessun file di Astro rimasto; nessun testo dei ruoli copiato nel sito.
- `AIBPD-01 · ALDERAMIN` ovunque, CAPELLA da nessuna parte.

## Fatto

- **F2-01** `apps/site` in Next.js 16.4.6 (App Router, Turbopack): `src/app/layout.tsx` (lingua, metadata, viewport, «Vai al contenuto»), `page.tsx` come Server Component che legge il catalogo al build; `icon.svg` al posto della favicon di Astro. Turbopack compila il catalogo del workspace da solo: niente `transpilePackages`. `turbopack.root` sulla root del repository. Tolti Astro, `@astrojs/check` e tutti i file `.astro`.
- **F2-02** Tailwind 4.3.5 con `@theme inline`: i token di F1 diventano le variabili di shadcn; accenti dei reparti `--aibpd` … `--aiwda` e `--dept` impostato da `[data-dept]`. `components.json` (base-nova, Base UI, lucide), `src/lib/utils.ts` con `cn`.
- **F2-03** Landing uguale a F1: hero, legenda delle sigle, `DepartmentCard` (Card, Collapsible di Base UI con «+»/«−»), principi in Card, flusso, MCP con Badge, footer. Le CTA sono link con `buttonVariants`.
- **F2-04** Gli indirizzi `/reparti/<sigla>` e `/agenti/<id>` non sono stati aggiunti ora: nessuna pagina li usa ancora (Ponytail, niente codice «per dopo»). Arrivano con F3 e F4, ricavati da sigla e id del catalogo.
- **F2-05** AIBPD-01 = ALDERAMIN; il test del catalogo lo controlla.
- **F2-06** Script del sito `dev`, `build`, `start`, `typecheck` (`next typegen && tsc --noEmit`); ESLint con `eslint-config-next` (core-web-vitals e typescript) per tutto il repository, con il divieto di Next e React nel catalogo; Playwright con `next start`; `.gitignore` con `.next/` e `next-env.d.ts`. Tolti dalla root `@eslint/js` e `typescript-eslint` diretti (li porta `eslint-config-next`).
- **F2-07** CONVENTIONS (§5, §6, §9, §12, §13.5, §15.2, §15.3 Next e Tailwind), AGENTS (stack, rimando a `apps/site/AGENTS.md`), README; fasi rinumerate (MCP in F5, pubblicazione in F6). `apps/site/AGENTS.md` scritto da `next dev` (regole di Next 16) e `apps/site/CLAUDE.md` che lo importa.
- Turbopack avvisava che la ricerca di `agents/` avrebbe tracciato tutto il repository nel pacchetto server: esclusa con `turbopackIgnore`, perché il catalogo si legge solo al build (commento nel codice e CONVENTIONS §15.3).
- shadcn aveva aggiunto la dipendenza `cn` (^0.2.6, non approvata): tolta, i componenti usano `@/lib/utils`.

## Verifiche

- `npm run verify`: superato (tsc del catalogo e degli e2e, `next typegen` + `tsc` del sito, lint senza errori né avvisi, 6/6 test, build con `/` pre-generata).
- `npm run verify:e2e`: 10/10 (computer 1440 px e telefono 360 px), con le stesse prove di F1 adattate al Collapsible.
- Revisione di parità su screenshot a 1440 e 360 px con una scheda aperta: contenuti, colori e disposizione come F1; ALDERAMIN al posto di CAPELLA.
- `npm audit --omit=dev`: 0 vulnerabilità.
- **Non verificato**: Safari e Firefox; CI su GitHub (al push, a mano se non parte).

## Rilievi aperti

- `cn` di shadcn sostituirebbe `clsx` + `tailwind-merge` con un pacchetto solo: da proporre all'utente se serve alleggerire. P3.
- Rilievi P3 di F1 ancora aperti (hero a destra vuota, griglia 3 + 2, riga sopra il titolo a 360 px): da riprendere in F3 con le pagine dei reparti.
- CI che non parte al push (da F1). P2.
