# F34 — Orchestrazione degli agenti

**Obiettivo**: chi usa Agentrica lavora con gli agenti passando dal server MCP, uno alla volta e in gerarchia (direttore del reparto, poi specialisti), e il pannello mostra chi è al lavoro. I subagent di Claude Code diventano una scelta esplicita, visibile e distinta nel pannello. Il sito spiega come funziona l'orchestrazione. Nasce dalla issue «Claude Code avvia i ruoli come subagent invece di usare il server MCP, e il pannello non li vede» (0.8.0, segnalata dall'utente il 2026-11-22).

> **Stato: completata** (2026-11-22), con il rilascio 0.10.0 di pacchetto e sito (F34-10). Branch `fase/f34-orchestrazione` nei due repository.

**Agenzie**: software (Architect per gerarchia e pannello; Backend per server e `init`; Frontend per pannello e sito; QA, Security sulla lettura dei file di Claude Code, Code Reviewer); design (Information Architect per la pagina del sito, UX Writer per i testi di `AGENTS.md`, istruzioni e sito, Accessibility per pannello e pagina); privacy (ciò che il pannello legge dei subagent resta sul computer dell'utente: verifica). I file di `agents/` cambiano solo con la conferma dell'utente, reparto per reparto.

## Situazione di partenza

Verifica del 2026-11-22 sul codice della 0.9.0:

- **Il pannello vede solo il server.** `used()` in `packages/mcp/src/server.ts` registra l'agente in uso quando si chiama il tool `agent` o un prompt di agente; nient'altro.
- **I subagent non passano dal server.** I 56 file di `.claude/agents/` (copiati da `init`, `packages/mcp/src/init.ts`) fanno leggere al subagent i file di `agents/` con `Read`; fra i `tools` non c'è `mcp__agentrica__*`.
- **`starter/AGENTS.md` (e `starter/en/AGENTS.md`) spinge verso i subagent.** Dice che «in `.claude/agents/` ogni ruolo è anche un subagent» e che «i subagent si avviano per gli audit e quando l'utente li chiede»; non nomina mai `list_agents`, `agent`, `ask_user` né il pannello.
- **Le istruzioni del server** (`texts/it.ts` ed `en.ts`, `server.instructions`) spiegano `list_agents` → `agent`, ma non dicono di preferirli ai subagent, di consultare un agente alla volta, né che il pannello registra solo le chiamate MCP.
- **In Claude Code** i subagent sono elencati a ogni turno nel tool `Agent`, mentre i tool MCP sono «deferred» e vanno caricati con `ToolSearch`: il modello trova prima i subagent.
- **La gerarchia c'è solo nel testo.** Ogni reparto ha un direttore (01) che «analizza la richiesta e coordina» (README dei reparti); `AGENTS.md` fissa l'ordine fra reparti (business → design → privacy → conferma → software → revisioni → Code Reviewer → conferma). Il server non distingue direttori e specialisti, e nessuna prova verifica che l'ordine venga seguito.

## Decisioni prese (2026-11-22)

- **Subagent disattivati di predefinito.** `init` non copia più `.claude/agents/`; con `--subagents` li copia, e ogni subagent copiato chiama per primo `agent` con il suo id (`mcp__agentrica__agent` nei `tools`), così passa dal server e compare nel pannello. Nel repository di Agentrica i subagent restano per il nostro lavoro. Il sito spiega l'opzione e perché è spenta.
- **Gerarchia: direttore prima, poi specialisti.** Per un compito di un reparto la sessione carica prima il direttore (01), che sceglie gli specialisti e l'ordine; gli specialisti lavorano uno alla volta, ciascuno dal risultato del precedente; il direttore consolida e presenta all'utente. Fra reparti vale l'ordine di `AGENTS.md`. Lo dicono `AGENTS.md`, le istruzioni del server e il testo degli agenti; `list_agents` segnala i direttori; il pannello mostra la catena. Il sito spiega come funziona l'orchestrazione.
- **Subagent visti dai file di Claude Code, non da un hook** (apertura, 2026-11-22, al posto del hook deciso prima). Claude Code scrive per ogni subagent `<sessione>/subagents/agent-*.meta.json` con il tipo, nella cartella del progetto che il pannello legge già per il consumo (F24): il pannello elenca i subagent avviati dopo la partenza del server, anche quelli che non chiamano `agent` (Explore, general-purpose). Niente scritture in `.claude/settings.json` né processi in più; il limite è il formato non documentato, già usato da F24. Nel pannello i subagent stanno in una sezione separata e netta, distinta dagli agenti caricati dal server; il sito spiega la differenza.
- **`--subagents` solo in `init`** (apertura, 2026-11-22): `install` e `add` registrano solo il server e non copiano file di progetto.
- **Verifica**: prima un caso ripetibile in `examples/` con i criteri, poi la prova riprodotta della issue in Claude Code, prima e dopo le modifiche.

## Backlog

| # | Attività | Priorità |
|---|---|---|
| F34-01 | Caso in `examples/casi/`: un progetto creato con `init`, la richiesta della issue con «utilizza gli agenti di agentrica»; criteri: nessuna chiamata al tool `Agent` senza richiesta esplicita, `list_agents` → `agent`, direttore prima degli specialisti, un agente alla volta, ordine fra reparti, pannello aggiornato. Esito della 0.9.0 come punto di partenza | P1 |
| F34-02 | `starter/AGENTS.md` e `starter/en/AGENTS.md`: sezione «Come si consulta un agente» (`list_agents` → `agent`, un agente alla volta, direttore prima, `ask_user` e pannello, `rate_agent`); i subagent solo se installati con `--subagents` e solo su richiesta esplicita dell'utente o per un audit in parallelo | P1 |
| F34-03 | Istruzioni del server (it/en): preferire `agent` ai subagent locali, il pannello vede solo le chiamate MCP e i subagent letti dai file di Claude Code, un agente alla volta, direttore prima, ordine fra reparti | P1 |
| F34-04 | Gerarchia nel server: `list_agents` segnala i direttori; il testo di un direttore dice come coordinare (specialisti con `agent`, uno alla volta, poi il consolidamento); il testo di uno specialista dice a chi riporta. Coerenza di README e regole comuni dei cinque reparti, nelle due lingue (modifiche a `agents/` confermate dall'utente) | P1 |
| F34-05 | `init --subagents` (solo `init`): senza flag niente `.claude/agents/`; con il flag i subagent con `mcp__agentrica__agent` nei `tools` e il primo passo `agent` con il loro id, trasformati alla copia | P1 |
| F34-06 | Subagent della sessione dai `.meta.json` di Claude Code (avviati dopo la partenza del server), solo il tipo e l'ora, senza rete; revisione Security e privacy | P1 |
| F34-07 | Pannello: catena degli agenti (direttore → specialisti, in ordine) e sezione separata «Subagent di Claude Code», con una spiegazione breve della differenza; prove e accessibilità | P1 |
| F34-08 | Sito (it/en): pagina sull'orchestrazione (gerarchia, un agente alla volta, server MCP e subagent, cosa mostra il pannello), `--subagents` in `/installa`, link dalla home; nome e posto della pagina con l'Information Architect | P1 |
| F34-09 | Prova riprodotta della issue in Claude Code (estensione VS Code), prima e dopo, con il conteggio delle chiamate nel transcript e il pannello; esito nel piano | P1 |
| F34-10 | Rilascio insieme di pacchetto (0.10.0: `init` cambia comportamento) e sito, solo con l'approvazione esplicita dell'utente | P1 |

## Criteri di accettazione

- In un progetto nuovo creato con `init` e la richiesta della issue, il modello usa `list_agents` e `agent`, carica il direttore prima degli specialisti, un agente alla volta, e non avvia subagent; il pannello mostra la catena.
- Con `--subagents`, un subagent avviato compare nel pannello in una sezione distinta da quella degli agenti del server.
- Il caso di `examples/` è verde sulla nuova versione; la prova riprodotta è documentata.
- Il sito spiega orchestrazione, `--subagents` e la differenza fra agenti del server e subagent, in italiano e in inglese.
- `npm run verify` e `npm run verify:e2e` verdi nei due repository; revisione di design, accessibilità e privacy; Code Reviewer sul diff.

## Fatto

Nel pacchetto (0.10.0):

- **F34-01** Caso [`examples/casi/orchestrazione-newsletter.md`](../examples/casi/orchestrazione-newsletter.md) con i criteri C1–C7 e lo script `npm run -s orchestration -- <sessione.jsonl>` (`scripts/orchestration-lib.ts`, con test): dal transcript della sessione principale tiene solo i nomi dei tool e gli id degli agenti e controlla C1–C6. Esito della 0.9.0 come punto di partenza in [`examples/risultati/2026-11-22-orchestrazione.md`](../examples/risultati/2026-11-22-orchestrazione.md).
- **F34-02** `starter/AGENTS.md` e `starter/en/AGENTS.md`: sezione «Come si consulta un agente» (`list_agents` → `agent` del direttore → specialisti uno alla volta → consolidamento, `ask_user` e pannello, `rate_agent`, ToolSearch in Claude Code); il tool `Agent` non si usa per gli agenti di Agentrica, i subagent solo con `init --subagents` e su richiesta o per un audit in parallelo.
- **F34-03** Istruzioni del server (it/en): direttore prima, specialisti uno alla volta e mai due nella stessa risposta, ordine fra reparti, `agent` al posto dei subagent locali salvo richiesta dell'utente; con il pannello, cosa mostra.
- **F34-04** Gerarchia: `list_agents` dà per ogni reparto la riga del direttore; il testo del direttore dice come coordinare, quello dello specialista a chi riporta e di caricarlo prima (o, con il direttore fuori squadra, di consegnare all'utente). Il consiglio del modello non chiede più di affidare il compito a un subagent. In `agents/`, confermato dall'utente per i cinque reparti nelle due lingue: riga «Struttura» dei README sul server e sui subagent di `--subagents`, frase di «Uso con Claude Code» (AISA) e di «Confini e sicurezza» (AIPCA), passo 9 del flusso AICA (il CISO consolida).
- **F34-05** `init --subagents`, solo in `init`: senza il flag niente `.claude/agents/`; con il flag ogni subagent ha `mcp__agentrica__agent` e `mcp__agentrica__library` fra i `tools` e il primo passo che carica il suo agente (id dal file di ruolo che nomina) senza caricare il direttore. Test nelle due lingue e da riga di comando.
- **F34-06** `subagentRuns` in `usage.ts`: i `.meta.json` dei subagent avviati dopo la partenza del server, nelle cartelle di Claude Code del progetto cambiate da allora; solo tipo, descrizione (senza caratteri di controllo, al più 120 caratteri), stato e ora; niente link simbolici, file oltre 64 KB saltati. Il pannello li rilegge ogni 5 secondi solo con la pagina aperta e si aggiorna se cambiano.
- **F34-07** Pannello: «Agenti in uso» in ordine di chiamata, con il direttore segnato e l'ultimo attivo, e la sezione «Subagent di Claude Code» con la spiegazione della differenza, nelle due lingue. Corretto il colore del reparto, che non si applicava (`data-dept` riceveva «AISA · Software»).
- **F34-09** Prova riprodotta con Claude Code da terminale (`claude -p`, due turni), prima con la 0.9.0 e dopo con il branch: risultati sopra.
- Versione 0.10.0: `package.json`, `server.json`, `VERSION`, comandi nei README, voci nei due CHANGELOG; README del pacchetto con «Orchestrazione», `init --subagents` e la lettura dei subagent nel pannello.

Nel sito (`agentrica-site`):

- **F34-08** Pagina `/it/orchestrazione` e `/en/orchestration`, «Come lavorano gli agenti» / «How the agents work» (nome e posto scelti con l'utente): un agente alla volta, direttore e specialisti, ordine fra reparti, agenti del server e subagent, cosa mostra il pannello. Link dalla sezione «metodo» della home, dal footer e da «Progetto nuovo» di `/installa`, che spiega `--subagents`; rotta in `EN_WORDS`, riscritture e sitemap. Prova e2e `e2e/orchestrazione.spec.ts` (navigazione nelle due lingue, ancore, nessun overflow orizzontale in home sul telefono, axe).

## Verifiche

- Pacchetto: `npm run verify` verde (typecheck, lint, 168 test unitari).
- Sito, con il pacchetto 0.10.0 locale (`npm install --no-save` del tgz di `npm pack`): `npm run verify` verde (163 pagine statiche); `npm run verify:e2e` verde, 123 prove su computer e telefono, una saltata. Durante la fase la prova delle note legali su telefono falliva: il nuovo pulsante a pillola della home, troppo lungo e senza a capo, allargava la pagina oltre i 360 px. Testo accorciato e controllo dell'overflow nella prova nuova.
- Caso di orchestrazione: con la 0.9.0 C1–C3 rossi (due subagent, nessuna chiamata al server); con il branch C1–C6 verdi (`list_agents` → AIBPD-01 → AIWDA-01 → AIPCA-01 → domanda → AISA-01 → AISA-06, zero subagent).
- Pannello visto nel browser con dati di prova, a 1100 e a 390 px: catena con il direttore segnato, sezione dei subagent a parte.
- Revisioni nella sessione principale: Security sulla lettura dei file di Claude Code (link simbolici, dimensioni, campi filtrati, solo testo nella pagina, rotta dietro token e cookie); privacy (tipo, descrizione e stato dei subagent restano sul computer, fuori da ogni invio); accessibilità della sezione nuova e della pagina del sito (titoli, elenchi ordinati, axe senza violazioni gravi); Code Reviewer sul diff: `APPROVE` dopo un ritocco a un commento.
- **Dopo la chiusura** (`fix/prova-f34-vscode`, 2026-11-22), dalle prove dell'utente in VS Code: tool `report` per il resoconto di ogni agente, che il testo dell'agente chiede a fine compito e il pannello mostra sotto l'agente; compito intero nel pannello (la prima riga, il resto da aprire); valutazioni in una pagina «Valutazioni» con il conto nel menu; avvisi nella pagina, e come notifiche di sistema se l'utente le attiva, per un agente nuovo o da valutare; spazio prima di «direttore» e «attivo»; colore del reparto nei moduli di voto; ora dei subagent dal transcript. `npm run verify` verde (170 test).

- **Seconda prova in VS Code** (`fix/pannello-agenti`, 2026-11-22): resoconti mandati da tutti gli agenti finiti (7 su 7), catena e avvisi giusti. Correzioni: «false» scritto nella sezione dei subagent; «coordina il reparto» per un direttore senza resoconto il cui reparto lavora ancora; C6 misurato prima del primo specialista software (il direttore AISA-01 può chiedere la conferma). Pagina «Agenti» come albero per reparto, scelto dall'utente fra albero, serpentina e riga orizzontale; la Sessione mostra gli ultimi tre.

- **F34-10, rilascio** (2026-11-22, con l'approvazione dell'utente). Un primo tentativo (PR #29, tag `v0.10.0`) è stato fermato prima della pubblicazione: senza «Utilizza gli agenti di agentrica» il modello non usava gli agenti (run annullato, tag cancellato, correzione su `fix/agenti-senza-frase`). Pacchetto: PR #30 `develop` → `main`, tag `v0.10.0`, pubblicazione dalla CI con provenance dopo l'approvazione dell'ambiente `npm` (run 45064287705); `latest` su npm 0.10.0; `io.github.flgisimone/agentrica` 0.10.0 `active` e `isLatest` nel registro MCP (`mcp-publisher`, login GitHub dell'utente). Sito: dipendenza 0.10.0, `verify` e `verify:e2e` verdi (123 prove), PR #18 di `agentrica-site`, Vercel in produzione con `/it/orchestrazione`, `/en/orchestration` e la 0.10.0 in `/rilasci`. `develop` e `main` allineati nei due repository.

## Rilievi aperti

- ~~**F34-R1**~~ (P2) Chiuso il 2026-11-22: prove dell'utente nell'estensione VS Code, verdi (`examples/risultati/2026-11-22-orchestrazione.md`). Prova nell'estensione VS Code con il pannello aperto: C6 con la risposta da `ask_user` e C7 (catena e subagent nella pagina, anche con `init --subagents`). La prova di F34-09 è da terminale in modo non interattivo.
- ~~**F34-R2**~~ (P3) Chiuso il 2026-11-22 su `fix/prova-f34-vscode`: la sezione del pannello dei due README descrive le cinque pagine. README inglese del pacchetto, sezione «Local panel»: descrive tre pagine con i nomi italiani, superati da F32 e F33 (quattro pagine, testi in inglese).
- ~~**F34-R3**~~ (P3) Chiuso: rischio accettato dall'utente (2026-11-22), riaprire se la sezione dei subagent mostra «formato non riconosciuto» con l'ultima versione o se Claude Code documenta un'altra fonte. La documentazione di Claude Code (pagine dei subagent e degli hook, lette il 2026-11-22) dà il percorso dei transcript `<sessione>/subagents/agent-<id>.jsonl` e nomina `agent-<id>.meta.json` senza descriverne il contenuto; l'alternativa documentata sono gli hook `SubagentStart`/`SubagentStop`, scartati all'apertura. Su `fix/f34-r3-formato` il pannello parte dai transcript e mostra «formato non riconosciuto» quando il `.meta.json` manca o cambia, invece di nascondere il subagent; la prova da rifare dopo un aggiornamento di Claude Code è la prova 2 di VS Code (un subagent chiesto, il pannello aperto). Il formato dei `.meta.json` dei subagent non è documentato da Claude Code (come i file del consumo di F24): se cambia, la sezione dei subagent resta vuota senza errori.
- ~~**F34-R4**~~ (P3) Chiuso il 2026-11-22 su `fix/prova-f34-vscode`: l'ora di avvio viene dalla prima riga del transcript del subagent. Dove il file non ha l'ora di nascita (alcuni Linux) un subagent avviato prima della partenza del server e finito dopo può comparire nella sessione.
