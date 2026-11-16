# F18 — agentic-starter: tenerlo, allinearlo o eliminarlo

**Obiettivo**: decidere se agentic-starter ha ancora senso accanto ad Agentrica e, se resta, portarci ciò che è cambiato qui da F0 a F16.

> **Stato: da aprire**. Fase chiesta dall'utente il 2026-11-16; le proposte sotto si decidono all'apertura.

**Agenzie**: business (Product Manager) per il valore dei due prodotti; software (Architect, DevOps, Code Reviewer) per l'allineamento.

## Situazione di partenza

- agentic-starter (repository pubblico, ultimo push 2026-11-15) contiene solo la governance: `template/` con AGENTS, CONVENTIONS, piano a fasi, agenzie, audit e CI, più `new-project.sh` e `memory-seed/`.
- Ne sono nati Agentrica, gamoey, kitty-3d e oneoffice.
- Agentrica ha fatto evolvere la stessa governance: CONVENTIONS §2.6 «Fasi e backlog», §13.7 con una sola conferma, §13.8 rilascio, scala di gravità comune nelle regole delle agenzie (F15), regole di privacy comuni (F6), formato del piano letto dal pannello.
- Il server MCP di Agentrica distribuisce già le 56 agenzie a qualunque progetto, e da 0.3.0 il pannello legge il formato di `plan/` e `audit/` dello starter. Le due cose si sovrappongono in parte: l'MCP porta i ruoli, lo starter porta regole, piano e CI.

## Proposte da confermare

- **Destino**:
  - A (proposta) tenerlo come «governance da copiare», allineato ad Agentrica: è l'unico modo per avere AGENTS, CONVENTIONS, piano e CI in un progetto nuovo, che l'MCP non porta;
  - B eliminarlo (archiviare il repository su GitHub) e documentare nel README del pacchetto come avviare un progetto con l'MCP e un `plan/` vuoto;
  - C fonderlo in Agentrica: un comando `npx @agentrica/mcp init` (o un pacchetto a parte) che crea `plan/`, AGENTS e CONVENTIONS.
- **Allineamento (se A o C)**: confronto fra `template/` e Agentrica, file per file; cosa è generale (va nello starter) e cosa è solo di Agentrica (resta qui). Le agenzie dello starter si allineano a `agents/` di Agentrica o, meglio, si prendono dal pacchetto per non avere due copie.
- **Progetti già nati**: gamoey, kitty-3d e oneoffice restano come sono o ricevono le regole nuove, uno per volta.

## Backlog

Da scrivere all'apertura, dopo le scelte sopra.

## Criteri di accettazione

- Decisione dell'utente sul destino dello starter, scritta in «Decisioni» di `plan/README.md`.
- Se resta: un progetto nuovo creato con `new-project.sh` ha le regole di oggi (§2.6, §13.7, scala di gravità) e passa il suo F0.
- Se viene eliminato: README di Agentrica e AGENTS non citano più lo starter come fonte da seguire.
