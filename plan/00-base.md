# F0 — Base tecnica

**Obiettivo**: un monorepo che legge i file di `agents/` come catalogo tipizzato e un sito Astro che lo mostra, con tutti i controlli di qualità già attivi, così F1 aggiunge solo la landing.

> **Stato: completata** (branch `fase/f0-base`; hash del merge dopo la chiusura). Piano, dipendenze e agenzie attive confermati dall'utente il 2026-11-15.

**Agenzie**: software (Architect per la struttura, DevOps per script, build e CI, QA, Code Reviewer).

## Proposte da confermare

- Dipendenze, versioni esatte: `astro` 7.4.12, `@astrojs/check` 0.9.12, `typescript` 6.0.3 (non la 7: typescript-eslint e @astrojs/check non la supportano ancora), `eslint` 10.15.0, `@eslint/js` 10.0.1, `typescript-eslint` 8.72.2, `@types/node` 26.6.6. Playwright e axe arrivano in F1.
- Agenzie attive: Software e Web Design; le altre restano in `agents/` (sono il contenuto del prodotto) e i loro subagent in `.claude/agents/`.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F0-01 | `package.json` di root con workspaces `packages/*` e `apps/*`, script `dev`, `build`, `typecheck`, `lint`, `test`, `verify`; `.nvmrc` 26 | P1 |
| F0-02 | `packages/catalog`: legge `agents/<reparto>/NN-*.md` (titolo, sezioni, testo) e restituisce reparti e agenti tipizzati; nessuna dipendenza, solo `node:fs` | P1 |
| F0-03 | Reparti (sigla, nome, cartella, colore) e nomi in codice di stella in un solo file del catalogo, con un test che controlla unicità e copertura di tutti i file | P1 |
| F0-04 | Test del catalogo con `node --test`: 5 reparti, 56 agenti, ogni agente con titolo e almeno una sezione, nomi in codice unici | P1 |
| F0-05 | `apps/site` Astro con TypeScript strict che importa il catalogo e mostra l'elenco grezzo di reparti e agenti (verifica del collegamento) | P1 |
| F0-06 | ESLint con typescript-eslint; `tsconfig` strict con `noUncheckedIndexedAccess` | P1 |
| F0-07 | `CONVENTIONS.md` e «Adattamenti» di `AGENTS.md` compilati per questo stack; `.gitignore` con `.astro/` | P1 |
| F0-08 | `tokensave init`, push di `main` e `develop` con la CI verde | P2 |

## Criteri di accettazione

- `npm run verify` passa: typecheck (catalogo e sito), lint, test del catalogo, build del sito.
- `npm run dev` mostra i 5 reparti e i 56 agenti con il nome in codice.
- Un file nuovo in `agents/` senza nome in codice fa fallire il test (nessun agente senza nome).
- Il catalogo non dipende da Astro e non copia testi: tutto viene letto da `agents/`.

## Fatto

- **F0-01** `package.json` di root con workspaces `packages/*` e `apps/*`; script `dev`, `build`, `typecheck`, `lint`, `test`, `verify`. Dipendenze a versione esatta: `typescript` 6.0.3, `eslint` 10.15.0, `@eslint/js` 10.0.1, `typescript-eslint` 8.72.2, `@types/node` 26.6.6 (root); `astro` 7.4.12, `@astrojs/check` 0.9.12 (sito). `.nvmrc` 26 dallo starter.
- **F0-02** `packages/catalog/src/index.ts`: `loadCatalog()` legge `agents/<reparto>/NN-*.md` con `node:fs` e restituisce `Department[]` (con `agents` e `director`); `findAgentsDir()` trova `agents/` risalendo dalla cartella corrente (`ponytail:` per il pacchetto MCP di F4). `markdown.ts` separa titolo, introduzione e sezioni `##`, senza dipendenze.
- **F0-03** `departments.ts`: sigla, nome, cartella, riga di sintesi e stelle dei cinque reparti, in un solo file. Il catalogo si ferma se i file di ruolo e le stelle non coincidono o la numerazione ha buchi. I colori dei reparti passano al design system di F1 (sono una scelta di design, non del catalogo).
- **F0-04** `catalog.test.ts`, 6 test: 5 reparti e 56 agenti (12, 12, 10, 12, 10), nomi in codice e id unici, ruolo e sezioni per ogni agente, direttore = file 01, `AISA-02 · ALTAIR`, file nuovo senza stella che fa fallire il caricamento, `parseRole`.
- **F0-05** `apps/site`: Astro statico, telemetria spenta, `tsconfig` strict con `noUncheckedIndexedAccess`; `index.astro` elenca reparti e agenti dal catalogo (pagina provvisoria, la sostituisce F1).
- **F0-06** `eslint.config.js` con typescript-eslint; nel catalogo vieta gli import di Astro (provato con un file di prova: 1 errore atteso). `tsconfig.base.json` strict con `erasableSyntaxOnly` e import `.ts`, così Node esegue i test senza compilazione.
- **F0-07** `CONVENTIONS.md` compilato per questo stack (fonte unica, catalogo, Astro, test, chiusura e rilascio); in `AGENTS.md` agenzie attive (Software e Web Design; Privacy e Cybersecurity da F4; Business su richiesta) e adattamenti; `.gitignore` con `dist/` e `.astro/`.
- **F0-08** `tokensave init` (83 file). Push e CI con la chiusura della fase.

## Verifiche

- `npm run verify`: superato (tsc del catalogo, `astro check` 0 errori 0 avvisi, lint, 6/6 test, build di 1 pagina).
- Pagina generata: «5 reparti, 56 agenti», 56 voci con `SIGLA-NN · STELLA — ruolo` (controllati AIBPD-01 CAPELLA, AICA-02 RIGEL, AISA-04 ANTARES, AIWDA-10 AVIOR).
- `npm audit --omit=dev`: 0 vulnerabilità.
- **Non verificato**: `npm run dev` nel browser (la build statica mostra lo stesso contenuto); CI su GitHub, al primo push.

## Rilievi aperti

- `npm audit` (sviluppo): minimatch con DoS moderato dentro typescript-eslint, solo strumenti locali; come in kitty-3d. P3: si riguarda al prossimo aggiornamento di typescript-eslint.
- tokensave segnala che `.claude/` (56 subagent) non è indicizzato: sono Markdown, non codice. P3, nessuna azione.
