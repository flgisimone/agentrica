# F32 — Contenuti e server in inglese

**Obiettivo**: i contenuti degli agenti esistono in italiano e in inglese, un file per lingua, e il server MCP parla inglese nell'API e nella lingua del sistema nei testi. Applica a contenuti e server la regola di CONVENTIONS §3 «Lingua» (F31): codice e API MCP in inglese, contenuti pubblici in due lingue complete.

> **Stato: da aprire.** Branch `fase/f32-contenuti-en` da `develop`. Backlog e decisioni aperte si confermano con l'utente all'apertura (CONVENTIONS §2.6).

**Agenzie**: software (Architect per il catalogo in due lingue, Backend, QA, Code Reviewer); design (UX Writer per le traduzioni dei testi e dei ruoli); i ruoli dei reparti rileggono il proprio file tradotto solo se l'utente lo chiede.

## Situazione di partenza

Verifica del 2026-11-22, dopo F31 (pacchetto 0.8.1):

- Contenuti solo in italiano: 56 file di ruolo, 5 `00-common-rules.md`, 5 README dei reparti e 16 schede di biblioteca in `agents/` (circa 17.000 parole); 56 subagent in `.claude/agents/`; 12 file dello starter copiati da `init`.
- Il catalogo legge titoli di sezione italiani: «Flusso di lavoro», «Collaborazione con le altre agenzie» (`packages/catalog/src/index.ts`), «Nozione», «Come si applica» e la riga dei metadati «Fonte · Versione · Verificata il · Da ricontrollare entro · Ruoli» (`packages/catalog/src/library.ts`). Nomi e righe dei reparti (`summary`) sono in italiano in `packages/catalog/src/departments.ts`.
- API MCP mista: `library`, `rate_agent`, `share_usage`, `submit_project`, `open_panel`, `ask_user` in inglese; `agente`, `elenca_agenti`, i prompt `valuta`, `progetto`, `configura` e i parametri `compito`, `reparto`, `rimuovi` in italiano.
- Testi del server in italiano: istruzioni e risposte dei tool (`server.ts`, `prompt.ts`, `ratings.ts`, `share.ts`, `showcase.ts`, `update.ts`), CLI (`setup.ts`, `init.ts`, `config.ts`), pannello (`panel.ts`, `page/`). Alcuni messaggi rimandano al «README del pacchetto», che da F31 è in inglese (`setup.ts`, `project.ts`).
- `packages/mcp/README.md` dice «The agent files are in Italian».

## Decisioni già prese (2026-11-22, in F31)

- Tool, prompt e parametri MCP in inglese; rinomina secca, senza alias: modifica incompatibile.
- Testi del server nella lingua del sistema, con l'opzione `--lang`.
- File di ruolo, regole comuni e biblioteche tradotti in inglese, mantenuti insieme a quelli italiani.
- Nomi propri invariati: reparti, sigle, stelle, titoli dei ruoli.
- Rilascio di pacchetto e sito insieme, alla fine di F33.

## Decisioni da prendere all'apertura

- **Dove stanno i file inglesi**: proposta `agents/<agenzia>/en/` con gli stessi nomi di file (`en/02-senior-software-architect.md`, `en/biblioteca/01-owasp-top-10-2025.md`); `fonti.json` resta unico.
- **Titoli di sezione inglesi** letti dal catalogo (proposta: «Workflow», «Collaboration with the other agencies», «Notion», «How it applies», metadati «Source · Version · Verified on · Recheck by · Roles»).
- **Lingua del sistema**: quali variabili e in che ordine (proposta: `--lang`, poi `lang` in `~/.agentrica/config.json`, poi `LC_ALL`, `LC_MESSAGES`, `LANG`, poi `Intl` su Windows; italiano se la lingua è `it`, altrimenti inglese).
- **Subagent e starter**: `init` copia subagent e starter nella lingua del server o sempre in una lingua; serve una versione inglese di `.claude/agents/` e di `starter/`.
- **Testi del pannello**: seguono la lingua del server (proposta) o hanno un selettore loro.

## Backlog

| # | Attività | Priorità |
|---|---|---|
| F32-01 | Catalogo in due lingue: `loadCatalog(dir, lang)`, titoli di sezione e metadati per lingua, `summary` dei reparti in `departments.ts` per lingua; il catalogo verifica che ogni file italiano abbia il gemello inglese con le stesse sezioni, gli stessi id e le stesse regole di contenuto (SEC-ARCH-01) | P1 |
| F32-02 | Traduzione inglese di file di ruolo, regole comuni e README dei reparti (AIBPD, AICA, AIPCA, AISA, AIWDA), un reparto per volta, con il diff mostrato all'utente | P1 |
| F32-03 | Traduzione inglese delle 16 schede di biblioteca, con fonte, versione e date invariate | P1 |
| F32-04 | API MCP in inglese: `agente` → `agent`, `elenca_agenti` → `list_agents`, prompt `valuta` → `rate`, `progetto` → `project`, `configura` → `configure`, parametri `compito` → `task`, `reparto` → `department`, `rimuovi` → `remove`; i nomi dei prompt degli agenti (`aisa-02-software`) non cambiano | P1 |
| F32-05 | Lingua del server: `--lang it|en`, voce `lang` nel file di configurazione e nel modulo `configure`, rilevamento dal sistema; istruzioni, risposte dei tool, testo degli agenti, CLI e pannello nella lingua scelta | P1 |
| F32-06 | Testi del server in inglese e in italiano, un modulo di testi per lingua invece di stringhe sparse; i rimandi al README puntano a quello della lingua scelta | P1 |
| F32-07 | Subagent e starter in inglese, copiati da `init` nella lingua scelta | P2 |
| F32-08 | README del pacchetto (inglese e italiano) e `CHANGELOG.md`: tool rinominati con la tabella prima/dopo, `--lang`, contenuti in due lingue; versione 0.9.0 preparata, pubblicata con F33 | P1 |

## Criteri di accettazione

- Ogni file di contenuto italiano in `agents/` ha il gemello inglese; il catalogo fallisce con un errore chiaro se manca un gemello o se le sezioni non coincidono.
- `tools/list` e `prompts/list` mostrano solo nomi e parametri in inglese.
- Con `--lang it` e con `--lang en` il server dà istruzioni, risposte, testo degli agenti, CLI e pannello interamente in una lingua; senza `--lang` segue il sistema.
- Nessun file tradotto mescola le lingue: i testi inglesi seguono un inglese semplice, quelli italiani il glossario di `plan/README.md`.
- Le modifiche ad `agents/`, `.claude/agents/` e `starter/` passano dalla conferma dell'utente.
- `npm run verify` verde; prova reale del server in Claude Code nelle due lingue; Code Reviewer sul diff.

## Fatto

## Verifiche

## Rilievi aperti
