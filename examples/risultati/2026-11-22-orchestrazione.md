# Orchestrazione: prova prima e dopo F34 (2026-11-22)

Caso: [orchestrazione-newsletter](../casi/orchestrazione-newsletter.md). Client: Claude Code 2.1.330 da terminale in modo non interattivo (`claude -p`), modello della sessione Opus 5.5, con il solo server del progetto (`--strict-mcp-config --mcp-config .mcp.json`) e i permessi `acceptEdits` più i tool `list_agents`, `agent`, `library`, `Read`, `Glob`, `Grep`, `Write`, `Edit` (`ask_user` e `Bash` negati: in modo non interattivo nessuno risponde). Due turni: la richiesta del caso, poi «Scelgo le opzioni consigliate (a) per tutte le domande. Procedi, e per le prossime scelte prendi l'opzione consigliata senza chiedermi.». Con il secondo turno C6 non si può verificare: resta alla prova nel client.

Limite: in modo non interattivo valgono anche le regole personali di chi esegue la prova (`~/.claude/rules/`); la prova nell'estensione VS Code resta da fare (rilievo aperto di F34).

## Prima: 0.9.0

Progetto da `npx -y @agentrica/mcp@0.9.0 init --name newsletter` (in inglese, lingua del sistema). Primo turno: il modello si ferma alle scelte di F0 (stack, dati, agenzie) dopo aver provato `ask_user`. Secondo turno: avvia due subagent con il tool `Agent` e non chiama mai il server.

```text
1. ToolSearch            9.–12. Bash
2.–5. Bash               13. Agent privacy-gdpr-specialist
6. mcp__agentrica__ask_user   14. Agent design-ux-writer
7.–8. Write              15. Write · 16. Bash

NO  Nessun subagent senza richiesta: 2 chiamate ad Agent: privacy-gdpr-specialist, design-ux-writer
NO  list_agents prima di agent: nessuna chiamata ad agent
NO  Direttore prima degli specialisti: agenti: nessuno
OK  Un agente alla volta · OK Ordine fra reparti · OK Conferma prima del software (nessun agente)
```

È la issue: i ruoli lavorano come subagent, il pannello non vede nessun agente. Costo dei due turni: 1,53 dollari equivalenti.

## Dopo: F34

Progetto da `init` del branch `fase/f34-orchestrazione` (0.10.0, senza `--subagents`), con `.mcp.json` che avvia il server del branch (`node packages/mcp/src/server.ts`). Primo turno: `list_agents`, poi i direttori di business, design e privacy uno alla volta, una domanda all'utente con `ask_user` (negata, quindi chiesta nel testo) e nessun codice. Secondo turno: il direttore software, poi lo specialista che scrive il codice.

```text
5. mcp__agentrica__list_agents
6. mcp__agentrica__agent AIBPD-01
7. mcp__agentrica__agent AIWDA-01
8. mcp__agentrica__library
9. mcp__agentrica__agent AIPCA-01
10. mcp__agentrica__ask_user
13. mcp__agentrica__agent AISA-01
26. mcp__agentrica__agent AISA-06
(le altre 41 chiamate: ToolSearch, Bash, Read, Write, Edit)

OK  Nessun subagent senza richiesta: 0 chiamate ad Agent
OK  list_agents prima di agent: list_agents alla chiamata 5, agent alla 6
OK  Direttore prima degli specialisti: agenti: AIBPD-01 → AIWDA-01 → AIPCA-01 → AISA-01 → AISA-06
OK  Un agente alla volta: nessun messaggio con più di un agent
OK  Ordine fra reparti: reparti nell'ordine: AIBPD → AIWDA → AIPCA → AISA
OK  Conferma dell'utente prima del software: domanda all'utente prima del primo agente software
```

C1–C6 verdi. I `Bash` negati hanno fermato il lavoro prima di QA e Code Reviewer, che il caso non misura. Costo dei due turni: 2,19 dollari equivalenti (più lavoro fatto: il codice della pagina).

C7 (pannello) non è misurato qui: in modo non interattivo nessuno apre la pagina. La catena e la sezione dei subagent sono provate con i test del pannello e con una schermata su dati di prova; la prova nel client con il pannello aperto resta da fare.
