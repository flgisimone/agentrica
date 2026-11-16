# F17 — Sito in un repository privato

**Obiettivo**: separare il sito dal pacchetto: `apps/site` passa in un repository privato, questo repository resta pubblico con catalogo, `agents/` e server MCP.

> **Stato: in corso** su `fase/f17-sito-privato`, aperta il 2026-11-16.

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
