# F17 — Sito in un repository privato

**Obiettivo**: separare il sito dal pacchetto: `apps/site` passa in un repository privato, questo repository resta pubblico con catalogo, `agents/` e server MCP.

> **Stato: da aprire**. Fase chiesta dall'utente il 2026-11-16; le proposte sotto si decidono all'apertura.

**Agenzie**: software (Architect, DevOps, QA, Code Reviewer); cybersecurity (Cloud Security, IAM) per accessi a Vercel, GitHub e npm; privacy (Legal Specialist) per le note legali, se cambiano titolare o repository citati.

## Situazione di partenza

- Il sito (`apps/site`) legge reparti e agenti da `packages/catalog`, che legge `agents/` nello stesso monorepo (decisione «Fonte unica»).
- Vercel pubblica `main` di questo repository (Root Directory `apps/site`); CI ed e2e del sito sono qui.
- Il pacchetto `@agentrica/mcp` richiede il repository pubblico: provenance di npm, link `repository` nel registro MCP e nel pacchetto.

## Fattibilità

Si può fare: Vercel pubblica anche repository privati di GitHub, sul piano Hobby. Il nodo è come il sito privato legge il catalogo senza copiare i testi.

## Proposte da confermare

- **Catalogo nel sito privato**:
  - A (proposta) dipendenza da un pacchetto npm pubblicato, a versione esatta: o `@agentrica/mcp`, che contiene già catalogo e `agents/` (serve un export del catalogo), oppure un `@agentrica/catalog` nuovo. Il sito si aggiorna quando si alza la versione: i testi pubblicati sono quelli del pacchetto;
  - B git submodule di questo repository: sempre allineato, ma build di Vercel più fragile;
  - C download di `agents/` da un tag di GitHub al build: niente pacchetto nuovo, ma uno script in più da mantenere.
- **Storia**: repository privato nuovo con la storia di `apps/site` (`git filter-repo`) o da zero; qui `apps/site` si rimuove e resta nella storia (il codice già pubblicato resta MIT).
- **Cosa resta qui**: `agents/`, `packages/`, `plan/`, `audit/`, `docs/`, `examples/`; e2e e CI del sito passano nel repository privato.
- **Documenti**: README, CONVENTIONS §5 e §15, AGENTS «Stack», decisioni «Architettura», «Sito», «Fonte unica» e «Pubblicazione» di `plan/README.md`.

## Backlog

Da scrivere all'apertura, dopo le scelte sopra.

## Criteri di accettazione

- Il sito in produzione è identico a prima (stesse pagine, stesse prove e2e verdi nel repository privato).
- Nessun testo di `agents/` copiato a mano: il sito legge il catalogo da una fonte versionata.
- Questo repository passa `npm run verify` senza `apps/site`; rilascio di `@agentrica/mcp` invariato.
