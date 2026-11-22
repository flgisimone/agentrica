# Caso di orchestrazione su un progetto nuovo

- **Agenti**: tutti i reparti, scelti dal modello (nessun `--agents`)
- **Progetto**: una cartella vuota creata con `npx -y @agentrica/mcp@<versione> init`, alla versione da provare
- **Perché**: nasce dalla issue di F34. Con la 0.9.0 Claude Code avviava i ruoli come subagent (tool `Agent`) invece di passare dal server MCP, e il pannello non li vedeva. Il caso misura come il modello consulta gli agenti, non la qualità del lavoro.
- **Richiesta** (primo messaggio della sessione, da copiare così com'è):

  > Aggiungi al progetto una pagina di iscrizione alla newsletter con l'email e il consenso al trattamento dei dati. Utilizza gli agenti di agentrica.

## Criteri

Si controllano sul file della sessione principale con `npm run -s orchestration -- <sessione.jsonl>`, dalla root di questo repository. Lo script elenca le chiamate ai tool in ordine e non legge i testi.

| # | Criterio | Come si verifica |
|---|---|---|
| C1 | Nessun subagent senza richiesta esplicita | nessuna chiamata al tool `Agent` (o `Task`) |
| C2 | Prima l'elenco, poi l'agente | `list_agents` prima della prima chiamata ad `agent` |
| C3 | Direttore prima degli specialisti | in ogni reparto usato, il primo agente caricato è il direttore (`-01`) |
| C4 | Un agente alla volta | nessun messaggio del modello con due chiamate ad `agent` insieme |
| C5 | Ordine fra reparti | i reparti compaiono la prima volta nell'ordine di `AGENTS.md`: AIBPD → AIWDA → AIPCA → AICA → AISA. Dopo il software si può tornare a design e privacy per le revisioni |
| C6 | Conferma prima del software | una domanda all'utente (`ask_user` o `AskUserQuestion`) dopo l'ultimo agente degli altri reparti e prima del primo agente software |
| C7 | Pannello aggiornato | a mano: la pagina del pannello (`open_panel`) mostra gli agenti in ordine, con il direttore in testa a ogni reparto; con `--subagents`, i subagent avviati in una sezione a parte |

Il caso è verde quando C1–C7 passano. Lo script esce con 0 se C1–C6 passano, con 2 altrimenti.

## Come si esegue

1. Fuori dal repository:

   ```sh
   D=$(mktemp -d) && cd "$D" && npx -y @agentrica/mcp@<versione> init --name newsletter
   ```

2. Apri la cartella in Claude Code (estensione VS Code o `claude` da terminale), approva il server del progetto e manda la richiesta. Alle domande rispondi con la prima opzione proposta; se chiede di scrivere codice, va bene.
3. Il file della sessione è il `.jsonl` più recente in `~/.claude/projects/<cartella con «-» al posto di «/»>/`. Lancia lo script, guarda il pannello per C7 e salva l'esito in `risultati/<data>-orchestrazione.md` con versione, client, modello e l'elenco delle chiamate stampato dallo script.

In modo non interattivo (`claude -p`) le domande all'utente non hanno risposta: vale per C1–C5, mentre C6 e C7 si provano nel client.
