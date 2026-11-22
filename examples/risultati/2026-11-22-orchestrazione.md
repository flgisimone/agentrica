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

## Nell'estensione VS Code (F34-R1)

Le due prove le ha fatte l'utente, con l'estensione di Claude Code e il pannello aperto, sul server di `develop` dopo la chiusura di F34 (0.10.0 non ancora pubblicata), Opus 5.5. Il server `agentrica-dev` non era attivo nelle cartelle di prova.

**Prova 1, progetto da `init` senza `--subagents`, richiesta del caso.** Le domande dell'utente sono arrivate tutte dal pannello (stack, double opt-in, informativa con dati finti), e il pannello ha mostrato la catena con «director» su AIWDA-01, AIPCA-01 e AISA-01, l'ultimo attivo e la sezione dei subagent vuota.

```text
4. mcp__agentrica__list_agents
5. mcp__agentrica__agent AIWDA-01
6. mcp__agentrica__agent AIWDA-08
7. mcp__agentrica__library
8. mcp__agentrica__agent AIWDA-10
9. mcp__agentrica__agent AIPCA-01
10. mcp__agentrica__agent AIPCA-02
11.–13. mcp__agentrica__ask_user (tre risposte dal pannello)
    mcp__agentrica__agent AISA-01

OK  C1–C6; C7 verificato dall'utente nella pagina
```

**Prova 2, progetto da `init --subagents`, «Usa il subagent design-ux-writer per proporre i testi di una pagina di iscrizione alla newsletter».** La sessione principale avvia il subagent (unica chiamata ad `Agent`, chiesta dall'utente); il subagent chiama per primo `mcp__agentrica__agent` con id AIWDA-10, poi legge il piano e la biblioteca con `library`, senza caricare il direttore. Nel pannello: AIWDA-10 · AVIOR fra gli agenti in uso e `design-ux-writer — finished` nella sezione dei subagent. C2 e C3 non si applicano: la sessione principale non carica agenti.

Osservazioni dell'utente, corrette su `fix/prova-f34-vscode`: le parole «director» e «active» attaccate al testo prima nel testo copiato; il compito troncato a 120 caratteri; il bisogno di un resoconto di ciò che ogni agente ha fatto (tool `report`); le valutazioni in una pagina propria e un avviso per un agente nuovo o da valutare. L'ora del subagent (20:08 invece di 20:07) veniva dal `.meta.json`, scritto dopo l'avvio: ora viene dal transcript.

## Terza prova in VS Code: resoconti, pagina Agenti, avvisi

Fatta dall'utente il 2026-11-22 sul server di `develop` dopo `fix/pannello-agenti`, progetto `newsletter4` da `init`, richiesta del caso (con «Utilizza gli agenti di agentrica»), Opus 5.5.

```text
5. agent AIWDA-01 · 6. agent AIWDA-08 · 9. agent AIWDA-10 · 12. agent AIPCA-01 · 13. agent AIPCA-02
report: 8, 10, 11, 14, 15, 27 (sei resoconti, uno per agente finito)
ask_user: cinque domande (stack, conferma dell’iscrizione, conservazione, nome e titolare, dipendenze nuove), tutte prima degli specialisti software
24. agent AISA-01 · 28. agent AISA-06

OK  C1–C6
```

Nel pannello, viste dall'utente: la Sessione con gli ultimi tre agenti e il link alla pagina Agenti; la pagina Agenti con tre colonne (Design, Privacy, Software), il direttore in cima a ognuna, i numeri #1–#7 e il resoconto apribile; l'avviso «New agent at work: AISA-06 · POLLUX» all'arrivo dello specialista. AISA-01 ha mandato il suo resoconto (il piano per POLLUX) prima di passare allo specialista, quindi «coordina il reparto» non compare. Non verificata la notifica di sistema con la scheda in secondo piano. Ritocco dopo la prova: la prima riga del compito in peso normale e colore secondario.

## Senza «Utilizza gli agenti di agentrica»

Prima prova dell'utente in VS Code, con la richiesta senza la frase, sul server di `main` (0.10.0 non pubblicata): il modello legge il piano, vede F0 da fare e chiede lo stack con il suo `AskUserQuestion`, senza ToolSearch né tool di Agentrica e senza il pannello. Cause: `AGENTS.md` dello starter non diceva che ogni lavoro passa dagli agenti, e «Attivazione su richiesta» si leggeva come «solo se l'utente li chiede»; il piano F0 e la regola della conferma nominavano solo `AskUserQuestion`. Il rilascio 0.10.0 è stato fermato (run annullato, tag cancellato) prima della pubblicazione.

Correzione su `fix/agenti-senza-frase`: regola principale in testa ad `AGENTS.md` dello starter (ogni lavoro sul progetto passa dagli agenti, anche se l'utente non li nomina; ToolSearch, `list_agents`, direttore; domande con `ask_user`), «Solo gli agenti pertinenti» al posto di «Attivazione su richiesta», la stessa regola nelle istruzioni del server, F0 e conferme con il direttore software e `ask_user`.

Dopo la correzione: controllo da terminale (primo turno, `claude -p`) e prova dell'utente in VS Code, entrambi senza la frase. Il modello parte da solo con `list_agents` → AIBPD-01, manda il resoconto con `report` e fa le domande dal pannello (`ask_user`); nessun subagent; C1–C6 verdi per la parte fatta.
