# F13 — Prove e distribuzione

**Obiettivo**: mostrare con risultati ripetibili che gli agenti di Agentrica producono rilievi utili, e rendere `@agentrica/mcp` trovabile da chi cerca server MCP. Sono le due cose che portano qualcuno a installarlo.

> **Stato: completata** (2026-11-15). 0.2.1 rilasciata su npm e pubblicata nel registro MCP ufficiale (F13-06). Fase aggiunta dall'utente il 2026-11-15 dopo la revisione del valore di F11–F16.

**Agenzie**: business (Product Manager, Product Marketing Manager) per criteri di successo e messaggi; software (QA, Backend) per i casi di prova; design (UX Writer) per README e sito. Ogni agente provato è anche il revisore del proprio file di ruolo.

## Situazione di partenza

- `@agentrica/mcp` 0.2.0 pubblicato con provenance (rilascio di F12); nessuna prova che un agente, usato in un progetto vero, dia rilievi sensati.
- Il pacchetto è su npm e il repository è pubblico; non è elencato in registri o liste di server MCP.
- I file di ruolo sono il prodotto: la loro qualità conta più di qualunque funzione del sito.

## Proposte da confermare all'apertura

- **Progetti di esempio**: due o tre piccoli progetti in `examples/` con difetti noti e documentati (per esempio un form senza etichette, una route senza validazione, un dato personale in un log), ciascuno con l'elenco dei difetti attesi.
- **Casi di prova**: per alcuni agenti (es. AISA-09 Application Security, AIWDA-08 Accessibility, AIPCA-02 GDPR Specialist) un caso con progetto, compito e difetti attesi; si esegue con un client reale e si registra quanti difetti trova e quanti rilievi falsi produce. Prima versione manuale e ripetibile (`ponytail:` automatizzare con l'Agent SDK solo se i casi diventano tanti).
- **Correzione dei ruoli**: i difetti mancati o i rilievi inventati diventano modifiche ai file di `agents/`, confermate dall'utente.
- **Risultati pubblici**: un estratto vero di un'esecuzione (compito, rilievi, difetti mancati) nel README e nella sezione MCP del sito, con data e versione; nessun risultato abbellito (CONVENTIONS §1).
- **Distribuzione**: registrazione nel registro MCP ufficiale e nelle liste più usate di server MCP; README in inglese con installazione in un minuto ed esempio reale. Ogni registrazione esterna si conferma con l'utente prima di farla.

## Decisioni dell'utente all'apertura (2026-11-15)

- **Agenti**: AISA-09 · REGULUS (Application Security), AIWDA-08 · GACRUX (Accessibility), AIPCA-02 · ALIOTH (GDPR), come nella proposta.
- **Progetti di esempio**: uno per caso in `examples/progetti/`, senza dipendenze; i difetti attesi stanno in `examples/casi/`, fuori dal progetto, che si copia in una cartella temporanea prima della prova.
- **Esecuzione**: i casi li esegue l'utente in Claude Code con `@agentrica/mcp@0.2.0 --agents <id>`; la sessione conta trovati, mancati, falsi ed extra validi.
- **Registri**: solo il registro MCP ufficiale (`registry.modelcontextprotocol.io`). awesome-mcp-servers e le directory web non sono stati scelti.
- **Risultati pubblici e README in inglese**: confermati come nella proposta (il README inglese c'è già: `packages/mcp/README.en.md`).

## Decisioni dell'utente dopo le prove (2026-11-15)

- **Ruoli**: nessuna modifica ad `agents/`: 21 difetti su 21, nessun falso. Il limite delle prove resta fra i rilievi aperti.
- **Estratto**: tabella dei tre casi, limiti e link ai rapporti completi, nel README (italiano e inglese) e nella sezione MCP del sito.
- **Registro**: 0.2.1 con `mcpName` e `server.json`; la pubblicazione nel registro la fa l'utente con `mcp-publisher` dopo il rilascio, non la CI.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F13-01 | Tre progetti di esempio con difetti provati e le schede dei casi (`examples/`) | P1 |
| F13-02 | Esecuzione dei tre casi in Claude Code (utente) e conteggio dei risultati in `examples/risultati/` | P1 |
| F13-03 | Proposte di correzione dei file di ruolo dai mancati e dai falsi; modifiche ad `agents/` solo dopo la conferma | P1 |
| F13-04 | `mcpName` (`io.github.flgisimone/agentrica`) nel `package.json` e `packages/mcp/server.json`; versione 0.2.1 con le eventuali correzioni dei ruoli | P1 |
| F13-05 | Estratto vero di un'esecuzione, con data e versione, nel README del pacchetto (italiano e inglese) e nella sezione MCP del sito | P2 |
| F13-06 | Rilascio 0.2.1 (CONVENTIONS §13.8) e pubblicazione nel registro con `mcp-publisher` (login GitHub dell'utente), con l'approvazione dell'utente | P2 |

## Criteri di accettazione

- Tre casi eseguiti con un client reale, ciascuno con output salvato e conteggio di trovati, mancati, falsi ed extra validi.
- Ogni mancato o falso ha una proposta di correzione del ruolo, accettata o respinta dall'utente.
- L'estratto pubblico riporta anche i mancati, con data, versione, client e modello; nessun numero abbellito.
- `@agentrica/mcp` cercabile nel registro MCP ufficiale.
- `npm run verify` e `npm run verify:e2e` verdi.

## Fatto

- **F13-01** `examples/` con `README.md` (procedura e regole di conteggio), tre progetti in `progetti/` e tre schede in `casi/`: api-note (6 difetti di sicurezza), form-iscrizione (8 difetti WCAG), prenotazioni-palestra (7 rilievi GDPR). Difetti provati avviando i server: path traversal e stack trace di api-note, consenso alla newsletter salvato `true` a casella deselezionata. ESLint sui progetti senza errori.
- **F13-02** Tre casi eseguiti dall'utente nell'estensione Claude Code per VS Code con Opus 5.5 (ragionamento medio) e `@agentrica/mcp@0.2.0 --agents <id>`, ciascuno in una copia del progetto in `~/agentrica-casi/` con `enabledMcpjsonServers` (senza, l'estensione non caricava il server del `.mcp.json`). Risultati in `examples/risultati/`: AISA-09 6/6, AIWDA-08 8/8, AIPCA-02 7/7; 0 falsi; 7 extra validi aggiunti alle schede. Righe citate, contrasti e riferimenti normativi controllati uno per uno.
- **F13-03** Nessuna correzione dei ruoli (decisione dell'utente). Osservazioni non correttive: la scala di gravità non è unica fra i reparti («P0 · Critica» in AISA-09, criteri di livello A in P2 in AIWDA-08).
- **F13-04** `mcpName` `io.github.flgisimone/agentrica` in `packages/mcp/package.json`, `packages/mcp/server.json` (schema 2025-12-11, descrizione di 86 caratteri, `subfolder`), versione 0.2.1 in `package.json`, `VERSION`, lock e comandi di README, sito ed `examples/`. Test: `VERSION`, `mcpName`, versioni e identificatore uguali fra `package.json` e `server.json`.
- **F13-05** Sezione «Messi alla prova» / «Put to the test» nei README del pacchetto, voce 0.2.1 in «Versioni»; tabella «Messi alla prova» nella sezione MCP del sito (regione scorrevole raggiungibile con Tab sul telefono, rilievo di axe `scrollable-region-focusable` corretto) ed e2e sulla tabella.
- **F13-06** Rilascio 0.2.1 (PR #6 `develop` → `main`, tag `v0.2.1`, Release con provenance dopo l'approvazione dell'ambiente `npm`). L'utente ha pubblicato nel registro con `mcp-publisher login github` e `publish`: `io.github.flgisimone/agentrica` 0.2.1 è `active` e `isLatest` in `registry.modelcontextprotocol.io` (2026-11-15).

## Verifiche

- `npm run verify`: verde, 49 test.
- `npm run verify:e2e`: 59 superati, 1 saltato.
- Controllo a vista della tabella con `next start` a 1280 e 390 px: leggibile, focus visibile, scorrimento sul telefono.
- Code Reviewer sul diff: APPROVE dopo tre ritocchi (spazio, riga vuota, rilievi falsi nei dati invece che fissi nel markup).

## Rilievi aperti

- P2: le prove sono facili (difetti piantati ed evidenti, un modello, un'esecuzione). Prossimo passo utile: un caso su un progetto vero o con difetti sottili, e una seconda esecuzione per vedere la variabilità.
- P3: scala di gravità comune fra i reparti (vedi F13-03), da decidere se diventa una regola comune. Risolto in F15 (F15-08): riga comune nei cinque `00-common-rules.md`, scala in Software, regola WCAG livello A in Design.
