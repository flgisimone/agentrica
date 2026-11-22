# F34 — Orchestrazione degli agenti

**Obiettivo**: chi usa Agentrica lavora con gli agenti passando dal server MCP, uno alla volta e in gerarchia (direttore del reparto, poi specialisti), e il pannello mostra chi è al lavoro. I subagent di Claude Code diventano una scelta esplicita, visibile e distinta nel pannello. Il sito spiega come funziona l'orchestrazione. Nasce dalla issue «Claude Code avvia i ruoli come subagent invece di usare il server MCP, e il pannello non li vede» (0.8.0, segnalata dall'utente il 2026-11-22).

> **Stato: da aprire.** Decisioni prese con l'utente il 2026-11-22; backlog da confermare all'apertura. Branch `fase/f34-orchestrazione` nei due repository.

**Agenzie**: software (Architect per gerarchia, hook e pannello; Backend per server e `init`; Frontend per pannello e sito; QA, Security sul hook, Code Reviewer); design (Information Architect per la pagina del sito, UX Writer per i testi di `AGENTS.md`, istruzioni e sito, Accessibility per pannello e pagina); privacy (il hook e ciò che il pannello legge dei subagent restano sul computer dell'utente: verifica). I file di `agents/` cambiano solo con la conferma dell'utente, reparto per reparto.

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
- **Hook per i subagent.** Con `--subagents`, `init` scrive in `.claude/settings.json` un hook di Claude Code che segnala al pannello i subagent avviati (anche quelli che non chiamano `agent`). Nel pannello i subagent stanno in una sezione separata e netta, distinta dagli agenti caricati dal server; il sito spiega la differenza.
- **Verifica**: prima un caso ripetibile in `examples/` con i criteri, poi la prova riprodotta della issue in Claude Code, prima e dopo le modifiche.

## Backlog (proposta, da confermare all'apertura)

| # | Attività | Priorità |
|---|---|---|
| F34-01 | Caso in `examples/casi/`: un progetto creato con `init`, la richiesta della issue con «utilizza gli agenti di agentrica»; criteri: nessuna chiamata al tool `Agent` senza richiesta esplicita, `list_agents` → `agent`, direttore prima degli specialisti, un agente alla volta, ordine fra reparti, pannello aggiornato. Esito della 0.9.0 come punto di partenza | P1 |
| F34-02 | `starter/AGENTS.md` e `starter/en/AGENTS.md`: sezione «Come si consulta un agente» (`list_agents` → `agent`, un agente alla volta, direttore prima, `ask_user` e pannello, `rate_agent`); i subagent solo se installati con `--subagents` e solo su richiesta esplicita dell'utente o per un audit in parallelo | P1 |
| F34-03 | Istruzioni del server (it/en): preferire `agent` ai subagent locali, il pannello vede solo le chiamate MCP e i subagent segnalati dal hook, un agente alla volta, direttore prima, ordine fra reparti | P1 |
| F34-04 | Gerarchia nel server: `list_agents` segnala i direttori; il testo di un direttore dice come coordinare (specialisti con `agent`, uno alla volta, poi il consolidamento); il testo di uno specialista dice a chi riporta. Coerenza di README e regole comuni dei cinque reparti, nelle due lingue (modifiche a `agents/` confermate dall'utente) | P1 |
| F34-05 | `init --subagents` (anche in `install`/`add`? da decidere all'apertura): senza flag niente `.claude/agents/`; con il flag i subagent con `mcp__agentrica__agent` nei `tools` e il primo passo `agent` con il loro id, trasformati alla copia | P1 |
| F34-06 | Hook: progetto (evento di Claude Code da verificare nella documentazione: `SubagentStart` o `PreToolUse` sul tool `Agent`), cosa scrive e dove lo legge il pannello, senza rete; revisione Security e privacy | P1 |
| F34-07 | Pannello: catena degli agenti (direttore → specialisti, in ordine) e sezione separata «Subagent di Claude Code», con una spiegazione breve della differenza; prove e accessibilità | P1 |
| F34-08 | Sito (it/en): pagina sull'orchestrazione (gerarchia, un agente alla volta, server MCP e subagent, cosa mostra il pannello), `--subagents` e hook in `/installa`, link dalla home; nome e posto della pagina con l'Information Architect | P1 |
| F34-09 | Prova riprodotta della issue in Claude Code (estensione VS Code), prima e dopo, con il conteggio delle chiamate nel transcript e il pannello; esito nel piano | P1 |
| F34-10 | Rilascio insieme di pacchetto (0.10.0: `init` cambia comportamento) e sito, solo con l'approvazione esplicita dell'utente | P1 |

## Criteri di accettazione

- In un progetto nuovo creato con `init` e la richiesta della issue, il modello usa `list_agents` e `agent`, carica il direttore prima degli specialisti, un agente alla volta, e non avvia subagent; il pannello mostra la catena.
- Con `--subagents`, un subagent avviato compare nel pannello in una sezione distinta da quella degli agenti del server.
- Il caso di `examples/` è verde sulla nuova versione; la prova riprodotta è documentata.
- Il sito spiega orchestrazione, `--subagents` e la differenza fra agenti del server e subagent, in italiano e in inglese.
- `npm run verify` e `npm run verify:e2e` verdi nei due repository; revisione di design, accessibilità e privacy; Code Reviewer sul diff.

## Fatto

## Verifiche

## Rilievi aperti
