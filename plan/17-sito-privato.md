# F17 — Sito in un repository privato

**Obiettivo**: separare il sito dal pacchetto: `apps/site` passa in un repository privato, questo repository resta pubblico con catalogo, `agents/` e server MCP.

> **Stato: completata** il 2026-11-16 su `fase/f17-sito-privato`.

**Agenzie**: software (Architect, DevOps, QA, Code Reviewer); cybersecurity (Cloud Security, IAM) per accessi a Vercel, GitHub e npm; privacy (Legal Specialist) per le note legali, se cambiano titolare o repository citati.

## Situazione di partenza

- Il sito (`apps/site`) legge reparti e agenti da `packages/catalog`, che legge `agents/` nello stesso monorepo (decisione «Fonte unica»). Del catalogo usa solo `loadCatalog` e i tipi `Agent`, `Department`, `DepartmentCode`.
- `apps/site/src/lib/scripts.test.ts` controlla che i comandi della landing siano nel README di `packages/mcp` e abbiano la sua versione.
- Vercel pubblica `main` di questo repository (Root Directory `apps/site`); CI ed e2e del sito sono qui; `eslint.config.js` usa `eslint-config-next` per tutto il repository.
- Il pacchetto `@agentrica/mcp` richiede il repository pubblico: provenance di npm, link `repository` nel registro MCP e nel pacchetto.

## Fattibilità

Si può fare: Vercel pubblica anche repository privati di GitHub, sul piano Hobby. Il nodo è come il sito privato legge il catalogo senza copiare i testi.

## Decisioni dell'utente

| Tema | Decisione |
|---|---|
| Catalogo nel sito privato | Dipendenza da `@agentrica/mcp` a versione esatta, con un export nuovo `@agentrica/mcp/catalog` che legge gli `agents/` del pacchetto. I testi pubblicati sono quelli della versione installata, la stessa dei comandi mostrati dal sito |
| Storia | Repository privato con la storia del sito (`git filter-repo` su `apps/site`, `e2e/`, `playwright.config.ts`); qui `apps/site` si rimuove e resta nella storia (MIT) |
| Repository | `flgisimone/agentrica-site`, privato, creato con `gh` |
| Cosa resta qui | `agents/`, `packages/`, `plan/`, `audit/`, `docs/`, `examples/`, `scripts/`; e2e e CI del sito passano nel repository privato |

## Backlog

| Id | Task | Priorità |
|---|---|---|
| F17-01 | `@agentrica/mcp`: export `./catalog` (JavaScript e tipi `.d.ts`) con `loadCatalog()` che legge gli `agents/` del pacchetto e i tipi del catalogo; test sul pacchetto impacchettato (`npm pack`) | P0 |
| F17-02 | Rilascio 0.3.3 di `@agentrica/mcp` (versione, `VERSION`, comando del sito, «Versioni» dei README, registro MCP) secondo §13.8, con la tua approvazione a parte | P0 |
| F17-03 | Repository privato `agentrica-site` con la storia del sito: app Next alla root, `@agentrica/mcp` a versione esatta, import da `@agentrica/mcp/catalog`, test di `scripts.ts` sul README e sulla versione in `node_modules`, ESLint, `verify` e `verify:e2e`, regole agenti minime (`AGENTS.md`/`CLAUDE.md` che rimandano a questo repository) | P0 |
| F17-04 | CI del repository privato (`verify`, `verify:e2e`, `npm audit`), action fissate per SHA come qui | P1 |
| F17-05 | Vercel: progetto collegato a `agentrica-site` (Root Directory alla root), stessa produzione; controllo delle pagine pubblicate. Il cambio nel pannello di Vercel lo fai tu, la sessione verifica | P0 |
| F17-06 | Qui: rimozione di `apps/site`, `e2e/`, `playwright.config.ts`, script e dipendenze del sito, `eslint-config-next` (ESLint per TypeScript puro); `verify` senza il sito; CI senza e2e | P0 |
| F17-07 | Documenti: README, CONVENTIONS §5, §13.8 e §15, AGENTS «Stack» e «Verifica», decisioni «Architettura», «Sito», «Fonte unica» e «Pubblicazione» di `plan/README.md` | P1 |
| F17-08 | Revisioni: Cloud Security e IAM su accessi a GitHub, Vercel e npm del repository nuovo; Legal Specialist sulle note legali (il link al codice resta a questo repository pubblico) | P2 |

Ordine: F17-01 → F17-02 (rilascio) → F17-03/04 → F17-05 (Vercel sul repository nuovo) → F17-06/07 → F17-08. La rimozione del sito arriva in `main` solo dopo il cambio di Vercel, altrimenti la produzione si rompe.

## Criteri di accettazione

- Il sito in produzione è identico a prima (stesse pagine, stesse prove e2e verdi nel repository privato).
- Nessun testo di `agents/` copiato a mano: il sito legge il catalogo da una fonte versionata.
- Questo repository passa `npm run verify` senza `apps/site`; rilascio di `@agentrica/mcp` invariato.

## Fatto

- **F17-01** Export `@agentrica/mcp/catalog`: `packages/mcp/src/catalog.ts` con `loadCatalog()` sugli `agents/` del pacchetto e i tipi del catalogo, usato anche dal server; `exports` con JavaScript e `.d.ts` (`declaration` in `tsconfig.build.json`); `catalog.test.ts`. Provato installando il tarball in un progetto esterno: typecheck con `nodenext` e `bundler` senza `skipLibCheck`, 5 reparti e 56 agenti a runtime.
- **F17-02** Rilascio 0.3.3: PR #10 `develop` → `main`, tag `v0.3.3` su `6edae13`, pubblicazione dalla CI con provenance dopo l'approvazione dell'ambiente `npm`; `io.github.flgisimone/agentrica` 0.3.3 nel registro MCP (`latest`) con `mcp-publisher` (login GitHub dell'utente).
- **F17-03** `flgisimone/agentrica-site` privato, con la storia di `apps/site`, `e2e/` e `playwright.config.ts` (`git filter-repo`, 43 commit; app alla root). Catalogo da `@agentrica/mcp/catalog` 0.3.3 a versione esatta, con `serverExternalPackages: ["@agentrica/mcp"]` (Turbopack, impacchettandolo, perdeva `import.meta.dirname`); test dei comandi sul README della versione installata; `AGENTS.md` e `README.md` che rimandano a questo repository. Note legali: «Il codice del server MCP e i file degli agenti sono nel repository su GitHub» (scelta dell'utente).
- **F17-04** CI di `agentrica-site`: `npm ci`, `npm audit --omit=dev`, `verify`, `verify:e2e`, action fissate per SHA, permessi in sola lettura, `persist-credentials: false`.
- **F17-05** Vercel: il progetto `agentrica` è collegato a `agentrica-site` (Root Directory alla root, `main` in produzione); `agentrica.vercel.app` serve il deploy di `2537759`.
- **F17-06** Qui: tolti `apps/site`, `e2e/`, `playwright.config.ts`, script e dipendenze del sito; `eslint-config-next` sostituito da `typescript-eslint` 8.72.2 (già installato come dipendenza transitiva); 415 pacchetti in meno.
- **F17-07** Documenti: README, CONVENTIONS §5, §9, §11, §13.1, §13.2, §13.4, §13.5, §13.8, §15.1–§15.3, AGENTS «Verifica» e «Stack», decisioni «Fonte unica», «Architettura», «Sito» e «Pubblicazione», commento della CI e del CSS del pannello.
- **F17-08** Revisioni (Cloud Security, IAM, Legal Specialist, nella sessione): `agentrica-site` privato, unico collaboratore il titolare, permessi dei workflow in lettura, nessun segreto nel repository; il pacchetto npm resta pubblicato dal repository pubblico con provenance; le note legali citano il repository pubblico solo per server MCP e agenti, titolare e contatto invariati.

## Verifiche

- Qui: `npm run verify` superato (42 test; i 19 del sito sono passati nel repository nuovo). Niente `verify:e2e`: il passo della CI si salta.
- `agentrica-site` in locale con 0.3.3 da npm: `npm run verify` superato (19 test, build di 70 percorsi), `npm run verify:e2e` 61 superati e 1 saltato come prima, `npm audit signatures` verificato, 0 vulnerabilità di produzione.
- CI di `agentrica-site` verde su `main` (run 43929034468: `npm ci`, audit, `verify`, `verify:e2e`). La prima esecuzione era fallita su `npm ci` perché la CDN di npm non serviva ancora il tarball 0.3.3 pubblicato da pochi minuti; il rilancio successivo si era bloccato in coda.
- HTML: le 65 pagine della build nuova coincidono con quelle della build di `apps/site`, a parte gli hash; in produzione le 63 pagine (senza `_not-found` e `_global-error`) rispondono 200 e coincidono con la build locale a parte gli hash delle icone; un id sconosciuto dà 404; CSP, HSTS e gli altri header presenti; icone, manifest e immagine Open Graph rispondono 200.

## Rilievi aperti

- **F17-R1** (P2) `agentrica-site` senza ruleset né branch protection: su GitHub Free non sono disponibili per i repository privati. Risolto come rischio accettato (scelta dell'utente, 2026-11-16, `fix/f17-rilievi`): l'unico che scrive nel repository è il titolare e Vercel pubblica solo `main`, che resta protetto dalla regola di lavoro (PR da `develop` con CI verde). Da riaprire se arrivano collaboratori.
- **F17-R2** (P3) Un ruolo modificato in `agents/` arriva sul sito solo con un rilascio del pacchetto e l'aggiornamento della versione in `agentrica-site`. Risolto (scelta dell'utente, 2026-11-16, `fix/f17-rilievi`): Dependabot in `agentrica-site` apre una PR verso `develop` a ogni versione nuova di `@agentrica/mcp`, e i comandi della landing leggono la versione dal `package.json` installato invece di averla scritta a mano; `verify` e la spec e2e della landing superati, comando reso `@agentrica/mcp@0.3.3`.
