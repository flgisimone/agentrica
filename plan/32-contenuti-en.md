# F32 — Contenuti e server in inglese

**Obiettivo**: i contenuti degli agenti esistono in italiano e in inglese, un file per lingua, e il server MCP parla inglese nell'API e nella lingua del sistema nei testi. Applica a contenuti e server la regola di CONVENTIONS §3 «Lingua» (F31): codice e API MCP in inglese, contenuti pubblici in due lingue complete.

> **Stato: completata** (branch `fase/f32-contenuti-en`, 2026-11-22). Decisioni e backlog confermati dall'utente all'apertura; ogni reparto tradotto confermato uno per volta. Versione 0.9.0 preparata, si pubblica con F33.

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

## Decisioni prese all'apertura (2026-11-22)

- **File inglesi** in `agents/<agenzia>/en/` con gli stessi nomi di file; `fonti.json` resta unico, nella cartella italiana.
- **Titoli di sezione inglesi**: «Workflow», «Collaboration with the other agencies», «Notion», «How it applies», metadati «Source · Version · Verified on · Recheck by · Roles».
- **Lingua**: `--lang`, poi `lang` in `~/.agentrica/config.json`, poi `LC_ALL`, `LC_MESSAGES`, `LANG`, poi `Intl`; italiano se la lingua è `it`, altrimenti inglese.
- **Subagent e starter** nella lingua del server: in inglese da `starter/en/`, con i subagent in `starter/en/.claude/agents/` (fuori da `.claude/agents/` di questo repository, che Claude Code caricherebbe due volte).
- **Pannello** nella lingua del server, senza selettore.
- **Traduzioni** riviste un reparto per volta (AISA, AIWDA, AIBPD, AICA, AIPCA, tutti confermati); inglese britannico semplice. La «Versione» delle schede si traduce, quindi il controllo dei gemelli confronta id, fonte, date e ruoli ma non la versione. Nelle schede di legge italiana il nome o l'etichetta originale resta fra parentesi dove serve a ritrovarla. Nei file inglesi stati e campi dei rilievi sono in inglese (`verified_compliant`, `title`, `status`…); il pannello legge le due forme.

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

- **F32-01** Catalogo in due lingue: `loadCatalog(dir, lang)`, `Lang` e `LANGS` in `departments.ts`, `summary` per lingua, sezioni del README e etichette delle schede per lingua; in inglese il catalogo carica anche l'italiano e si ferma con `twinProblems` se un gemello manca o ha sezioni, id, fonte, date o ruoli diversi. Export `@agentrica/mcp/catalog` con `loadCatalog(lang)`.
- **F32-02** File di ruolo, regole comuni e README dei cinque reparti in `agents/<agenzia>/en/` (56 ruoli, 5 regole comuni, 5 README), confermati dall'utente reparto per reparto.
- **F32-03** Le 16 schede in `en/biblioteca/`, con fonte, date e ruoli invariati.
- **F32-04** API in inglese senza alias: `list_agents` (`department`), `agent` (`task`), `task` nei prompt, `rate` (`agent`), `project` (`remove`), `configure`; nomi dei prompt degli agenti invariati.
- **F32-05** Lingua del server: `texts/index.ts` (`systemLang`, `chooseLang`, `setLang`) scelta in `server.ts` prima di `init`, `add` e `install`; `--lang` anche in `add` e `install` (passato al server); voce `lang` nel file di configurazione e nel modulo `configure` (Sistema, Italiano, English).
- **F32-06** Testi in `texts/it.ts` e `texts/en.ts` con la stessa forma (tipo `Texts`); pagina del pannello in `page/index.<lingua>.html` e `page/texts.<lingua>.js`, viste con id inglesi; rimandi al README della lingua.
- **F32-07** Starter inglese in `starter/en/` (README, AGENTS, CONVENTIONS, plan, audit, docs, CI, `.gitignore`, `.env.example`, `.nvmrc`) e 56 subagent inglesi in `starter/en/.claude/agents/`, generati dai paragrafi comuni dei subagent italiani; `init` copia quelli della lingua scelta e `agents/` intero. `project.ts` legge piani e audit nelle due lingue; `subagentIds` funziona anche col catalogo inglese.
- **F32-08** README del pacchetto (inglese e italiano) con la tabella dei nomi prima/dopo, `--lang` e i contenuti in due lingue; `CHANGELOG.md` con la voce 0.9.0; versione 0.9.0 in `package.json`, `server.json`, `prompt.ts` e `package-lock.json`. README di radice aggiornati (il comando d'installazione resta 0.8.1 finché la 0.9.0 non è pubblicata).

## Verifiche

- `npm run verify` verde: typecheck, lint, 158 test (nuovi: catalogo inglese e gemelli, etichette inglesi delle schede, `lang.test.ts` con lingua del sistema e forma uguale dei testi e delle pagine, `init` in inglese con il piano letto dal pannello, server con `--lang en`).
- Prova reale del server con un client MCP vero in inglese (test e `--lang en --panel`): istruzioni, tool, testo dell'agente, schede e pagina del pannello (`lang="en"`, testi inglesi, piano di questo repository letto senza problemi). In italiano lo stesso con i test esistenti, fissati a `--lang it`.
- Non provato in Claude Code stesso (il server registrato in questa sessione è quello pubblicato): la prova nelle due lingue in Claude Code va fatta con F33, prima del rilascio.
- Revisione del diff nel ruolo di Code Reviewer: nessun blocco; note nei rilievi aperti.

## Rilievi aperti

- (P2) Prova in Claude Code nelle due lingue (moduli `configure` e `rate`, comandi rinominati, pannello) prima della pubblicazione della 0.9.0, con F33.
- (P2) Sito (F33): `DepartmentInfo.summary` ora è per lingua; il sito usa `Department.summary` e resta compatibile, ma per `/en` deve chiamare `loadCatalog("en")`. I link a `note-legali` delle informative di valutazioni, consumo e progetti puntano alle pagine italiane: con `/en` vanno indicati per lingua.
- (P3) Il nome predefinito di un progetto proposto dal server («Utente di Agentrica» / «Agentrica user») parte nella lingua del server e il sito lo mostra così com'è (commento `ponytail:` in `showcase.ts`): da decidere in F33.
- (P3) Anglicismi rimasti nei file italiani di `agents/`, fuori dal glossario di F31: «loading, error, empty e success states» in `ai_software_agency/05-senior-frontend-developer.md`, «outcome» nel README e in `12-…` di AIBPD. Da correggere con la conferma dell'utente (modifica al prodotto).
- (P3) Il testo del consenso e della licenza dei progetti in inglese è una traduzione non rivista da un legale, come quello italiano (rischio accettato PRIV-PUB-01).
