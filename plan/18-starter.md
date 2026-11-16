# F18 — agentic-starter fuso nel pacchetto

**Obiettivo**: un progetto nuovo si crea con `npx @agentrica/mcp init`, con le regole di oggi e le agenzie del pacchetto; agentic-starter viene archiviato.

> **Stato: completata** il 2026-11-16 su `fase/f18-starter` (merge `2f5a130` in `develop`, rilascio 0.4.0 da PR #11). Decisioni dell'utente del 2026-11-16.

**Agenzie**: software (Architect, Backend, DevOps, QA, Code Reviewer, nella sessione).

## Situazione di partenza

- agentic-starter (repository pubblico, ultimo push 2026-11-15) contiene solo la governance: `template/` con AGENTS, CONVENTIONS, piano a fasi, agenzie, audit e CI, più `new-project.sh` e `memory-seed/`.
- Ne sono nati Agentrica, gamoey, kitty-3d e oneoffice.
- Rispetto ad Agentrica il template è indietro su CONVENTIONS §2.6 «Fasi e backlog», §13.8 con PR, asserzioni, action fissate per SHA nella CI, regole comuni delle cinque agenzie (scala di gravità di F15, privacy di F6). I 56 file di ruolo sono identici; i 56 subagent differiscono solo per il nome del progetto.
- Il pacchetto `@agentrica/mcp` contiene già `agents/`; il pannello legge il formato di `plan/` e `audit/` dello starter.

## Decisioni dell'utente

| Tema | Decisione |
|---|---|
| Destino | C: lo starter si fonde nel pacchetto con `npx @agentrica/mcp init`; il repository agentic-starter si archivia su GitHub, con il README che rimanda al comando |
| Agenzie | `init` copia `agents/` dal pacchetto e i 56 subagent di `.claude/agents/` di Agentrica con il nome del progetto: una sola fonte, nessuna copia nello starter |
| Extra di `init` | `.mcp.json` con `@agentrica/mcp` a versione esatta e `--panel`; git con commit su `main` e `develop` attivo se la cartella non è già in un repository. Niente memorie di Claude Code |
| Progetti già nati | gamoey, kitty-3d e oneoffice restano come sono |
| Rilascio | 0.4.0 dentro F18: PR `develop` → `main` e tag `v0.4.0` (§13.8), poi archivio dello starter |

## Backlog

| Id | Task | Priorità |
|---|---|---|
| F18-01 | `starter/` nella root: il `template/` dello starter (senza `agents/` e `.claude/agents/`) allineato alle regole generali di Agentrica (§2.6, §13.8, asserzioni, CI con action per SHA e `workflow_dispatch`) | P0 |
| F18-02 | Comando `init [cartella] [--name]` nel server: scrive starter, `agents/`, subagent con il nome del progetto e `.mcp.json`; si ferma senza scrivere nulla se un file esiste; git `main` + `develop`; test | P0 |
| F18-03 | Pacchetto: `prepack` copia `starter/` e `.claude/agents/`, `files` aggiornato; prova con `npm pack` e `init` dal tarball in una cartella vuota | P0 |
| F18-04 | Documenti: README del pacchetto (IT e EN) con `init`, README, AGENTS, CONVENTIONS e `plan/README.md` senza lo starter come fonte | P1 |
| F18-05 | Rilascio 0.4.0 (versione, `VERSION`, «Versioni», `server.json`) secondo §13.8, registro MCP | P0 |
| F18-06 | agentic-starter: README che rimanda a `npx @agentrica/mcp init`, poi archivio del repository su GitHub | P1 |
| F18-07 | Sito (`agentrica-site`): `@agentrica/mcp` 0.4.0 e il comando `init` nella sezione del server MCP, con le prove e2e; rilascio del sito in `main` (richiesta dell'utente) | P1 |

Ordine: F18-01 → F18-02/03 → F18-04 → chiusura in `develop` → F18-05 → F18-06 → F18-07.

## Criteri di accettazione

- Decisione dell'utente scritta in «Decisioni» di `plan/README.md`.
- `npx @agentrica/mcp init` in una cartella vuota crea un progetto con le regole di oggi (§2.6, §13.7, scala di gravità), le 56 agenzie e i subagent con il nome del progetto, senza segnaposto rimasti; il pannello legge il suo `plan/`.
- In una cartella con file in conflitto `init` non scrive nulla e dice quali sono.
- README di Agentrica e AGENTS non citano più lo starter come fonte da seguire.

## Fatto

- **F18-01** `starter/` nella root, dal `template/` di agentic-starter senza `agents/` e `.claude/agents/`: CONVENTIONS con §2.6 «Fasi e backlog», asserzioni (`as`, `!`), §13.8 con PR da `develop` a `main`; CI con action fissate per SHA (le versioni di Agentrica) e `workflow_dispatch`; `gitignore` senza punto (npm non pubblica i `.gitignore`); riferimenti allo starter sostituiti da `@agentrica/mcp init`.
- **F18-02** `packages/mcp/src/init.ts`: `agentrica-mcp init [cartella] [--name]`, lanciato da `server.ts` prima del server. Scrive starter, `agents/`, i 56 subagent con «del progetto <nome>.» e `.mcp.json` (`@agentrica/mcp@<versione>` con `--panel`); controlla tutti i percorsi prima di scrivere e scrive con `wx`; git `main` + `develop` solo fuori da un repository. `init.test.ts`, 5 test: frase del progetto unica nei subagent, file e segnaposto, git e lettura del piano con `readPlan`, conflitti senza scritture, argomenti non validi.
- **F18-03** `prepack` copia anche `starter/` e `.claude/agents/`; `files` con `starter` e `.claude/agents`. Provato con `npm pack`: 56 subagent, 13 file dello starter, `init` dal tarball installato in un progetto esterno crea 136 file con commit su `main` e `develop` attivo.
- **F18-04** README del pacchetto (IT e EN): sezione «Nuovo progetto», «Cosa fa e cosa non fa» (scrive solo `init`), formato del pannello «creato da `init`», versione 0.4.0. README: metodo e riga F18, tolto `npm run dev` rimasto da F17. CONVENTIONS §5 con `starter/` e la frase dei subagent; decisione «Starter» e riga F18 in `plan/README.md`; messaggio del pannello senza agentic-starter.

- **F18-05** Rilascio 0.4.0: PR #11 `develop` → `main`, tag `v0.4.0` su `4d70739`, pubblicazione dalla CI con provenance dopo l'approvazione dell'ambiente `npm` (159 file); `io.github.flgisimone/agentrica` 0.4.0 nel registro MCP con `mcp-publisher` (nuovo login GitHub dell'utente, il token era scaduto).
- **F18-06** agentic-starter: README con il rimando a `npx -y @agentrica/mcp@0.4.0 init` e a `starter/` (`d54fcef` su `main`), repository archiviato su GitHub.
- **F18-07** `agentrica-site`: `@agentrica/mcp` 0.4.0 a versione esatta; passo 5 «Se parti da zero, crea il progetto» con `mcp.init` dal README della versione installata (test dei comandi esteso); limite «Il server non scrive file (solo init, quando lo lanci tu)». Merge `fase/f18-init` in `develop` con CI verde. Il rilascio in `main` (produzione su Vercel) aspetta l'ok separato dell'utente.

## Verifiche

- `npm run verify` superato: typecheck, lint, 47 test (5 nuovi di `init`).
- `npm pack` e `init` dal tarball in una cartella temporanea, come sopra; secondo `init` nella stessa cartella: uscita 1, nessun file scritto.
- Release `v0.4.0` (run 43936249766) verde; `latest` su npm 0.4.0 dopo qualche minuto di elaborazione del registro.
- `agentrica-site`: `npm run verify` superato (19 test, build di 70 percorsi), `npm run verify:e2e` 61 superati e 1 saltato come prima, `npm audit --omit=dev` 0 vulnerabilità, `npm audit signatures` 159 attestazioni verificate; testo e comando nell'HTML della landing; CI di `develop` verde.
- **Non verificato**: la landing in produzione, finché il sito non è rilasciato in `main`.

## Rilievi aperti

- **F18-R1** (P3) `docs/AI Multi-Agency System.md` è in due copie (`docs/` e `starter/docs/`). F19 sposta `docs/` fuori dal repository pubblico: resterà solo quella di `starter/`, che però i subagent di Agentrica citano come `docs/…`; da sistemare in F19.
- **F18-R2** (P2) Rilascio del sito in `main` di `agentrica-site` con la sezione `init`: in attesa dell'ok dell'utente.
