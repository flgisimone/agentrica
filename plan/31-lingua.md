# F31 — Una lingua per livello

**Obiettivo**: il progetto non mescola italiano e inglese nello stesso file o nella stessa pagina. Il codice e l'API MCP restano in inglese; i contenuti pubblici esistono in due lingue complete; la documentazione interna resta in italiano. La regola è in CONVENTIONS §3, le parole inglesi ammesse nei testi italiani nel glossario di `plan/README.md`. F31 sistema la regola, i testi italiani e i README; F32 e F33 le versioni inglesi dei contenuti, il server e il sito.

> **Stato: completata** (aperta e chiusa il 2026-11-22, branch `feat/f31-lingua`). Senza rilascio: le modifiche restano in `develop`; il sito non cambia in questa fase.

**Agenzie**: software (QA, Code Reviewer); design (UX Writer per i testi).

## Situazione di partenza

Verifica del 2026-11-22 sui due repository:

- Commenti del codice: tutti in italiano. Identificatori interni: in inglese, tranne `fasi` in `packages/mcp/src/project.ts`.
- Testi dell'interfaccia del sito e del server: in italiano. `packages/mcp/README.en.md`: tutto in inglese.
- Tool MCP misti: `agente`, `elenca_agenti` accanto a `library`, `submit_project`, `share_usage`, `rate_agent`, `open_panel`, `ask_user`; parametri misti (`compito`, `reparto`, `rimuovi` accanto a `name`, `cards`, `rating`, `code`, `question`…).
- Testi italiani con anglicismi non necessari (finding, task, review, scope…), soprattutto nella documentazione.

## Decisioni dell'utente all'apertura (2026-11-22)

- Codice interno in inglese; testi italiani senza anglicismi fuori glossario, anche nei file di ruolo (diff mostrato prima del commit).
- Glossario con i gruppi sviluppo, web e strumenti, gestione, sicurezza; il resto si traduce, compresi i nomi dei documenti prodotti dagli agenti e i termini di metodo.
- Nomi di reparti, sigle, stelle e titoli dei ruoli sono nomi propri e restano.
- Perimetro: questo repository e `agentrica-site`.
- A metà fase (2026-11-22): GitHub, npm e mcprush in inglese di predefinito, con la versione italiana leggibile (README di radice e del pacchetto); sito multilingua con `/it` e `/en` e lingua dal browser, interfaccia e agenti tradotti; tool e parametri MCP in inglese, come in 0.8.1, e anche testi del server; lingua del server dal sistema, con `--lang`. Il lavoro si divide in F31, F32 e F33.

## Backlog

| # | Attività | Priorità |
|---|---|---|
| F31-01 | Regola in CONVENTIONS §3 e glossario in `plan/README.md` | P1 |
| F31-02 | Anglicismi fuori glossario nei testi italiani vivi dei due repository, compresi `agents/`, `.claude/agents/`, `starter/` e `docs/` | P1 |
| F31-03 | README della radice e del pacchetto: `README.md` in inglese, `README.it.md` in italiano, link reciproci in cima; descrizioni di `package.json` e `server.json` in inglese | P1 |
| F31-04 | Identificatori italiani nel codice (`fasi` in `project.ts`) | P3 |

## Criteri di accettazione

- I file di fase passati, le voci passate del CHANGELOG, `audit/`, `examples/risultati/` e le migrazioni SQL già applicate restano come record storico.
- `README.md` della radice e del pacchetto sono in inglese, con il link a `README.it.md`; npm mostra il README inglese.
- I testi vivi non hanno parole inglesi fuori glossario.
- Le modifiche ad `agents/` passano dalla conferma dell'utente.
- `npm run verify` nei due repository e `npm run verify:e2e` nel sito verdi; Code Reviewer sul diff.

## Fatto

- **F31-01** CONVENTIONS §3 «Lingua» riscritta (un file, una lingua; codice e API MCP in inglese; contenuti pubblici in due lingue; documentazione interna in italiano); glossario chiuso in `plan/README.md` con i gruppi sviluppo, web e strumenti, gestione, sicurezza e la tabella delle traduzioni.
- **F31-02** Anglicismi tolti dai testi italiani vivi: circa 620 sostituzioni frase per frase in `agents/`, `.claude/agents/`, `starter/`, `docs/`, CONVENTIONS, AGENTS, README e piano (risultati, resoconti, passaggi di consegne, attività, correzioni, privilegio minimo, registro dei rischi…). Restano nomi propri (titoli dei ruoli, categorie OWASP, metriche CVSS, funzioni MCP), chiavi JSON e termini del glossario. Etichetta «Attività» nel backlog del pannello. Testi del sito già puliti.
- **F31-03** `README.md` in inglese e `README.it.md` in italiano, con link reciproci, nella radice (README inglese nuovo) e nel pacchetto (ex `README.en.md`); `files` del pacchetto con `README.it.md`; descrizione di `package.json` in inglese (`server.json` lo era già).
- **F31-04** `fasi` → `phasesSection` in `packages/mcp/src/project.ts`.

## Verifiche

- `npm run verify`: 147 test, 0 falliti (2026-11-22).
- Code Reviewer (AISA-12): COMMENT, nessun bug; corretti «gli schemi», le frasi rimaste miste e le formulazioni segnalate; termini tecnici segnalati aggiunti al glossario. Messaggi del server che rimandano al README del pacchetto (ora inglese): in F32.
- `npm pack --dry-run`: il pacchetto contiene `README.md` (inglese) e `README.it.md`.

## Rilievi aperti
