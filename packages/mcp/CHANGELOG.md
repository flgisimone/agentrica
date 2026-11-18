# Novità di @agentrica/mcp

Ogni versione con la data di pubblicazione su npm e le novità per tipo: Nuovo, Cambiato, Corretto, Incompatibile. La versione si fissa nel comando del server (`@agentrica/mcp@<versione>`): un aggiornamento arriva solo quando la cambi tu.

## 0.6.0 — 2026-11-18

### Nuovo
- `npx -y @agentrica/mcp@0.6.0 install`: installa il pacchetto sul computer con `npm install -g` e lo registra in Claude Code per tutti i tuoi progetti. Lo stesso comando su Mac, Windows e Linux; per aggiornare lo rilanci con la versione nuova.
- `npx -y @agentrica/mcp@0.6.0 add`: registra in Claude Code il server avviato con npx, senza installare nulla; `--project` scrive `.mcp.json` per il team, `--local` vale solo per il progetto corrente.
- La valutazione la chiede il server con un modulo del client (elicitation MCP): quando carichi un altro agente, per quello di prima, e dopo 30 minuti d'uso. Una volta per agente; se rifiuti non te la chiede più. I client senza moduli hanno il flusso di prima.
- Avviso di versione nuova: all'avvio il server chiede al registro npm qual è l'ultima versione (nessun dato inviato) e, se ce n'è una più nuova, lo dice con il comando per aggiornare, nella risposta di un tool e nel banner del pannello. `--no-update-check` spegne il controllo.
- Questo file, `CHANGELOG.md`, al posto della sezione «Versioni» del README.

### Cambiato
- Il pannello scrive il nome del reparto accanto alla sigla: «reparto AISA · Software».
- Senza moduli, l'invito a valutare l'agente sta in fondo al suo testo, dopo il compito.

### Corretto
- Su Windows `init` scrive nel `.mcp.json` `cmd /c npx`: con `npx` da solo Claude Code non avviava il server.

### Incompatibile
- I prompt hanno il reparto nel nome: `aisa-02` diventa `aisa-02-software` (anche `-business`, `-cybersecurity`, `-privacy`, `-design`), così il menu dei comandi mostra il reparto. Restano uguali l'id dell'agente (`AISA-02`), il nome in codice, l'argomento del tool `agente` e `--agents`.

## 0.5.0 — 2026-11-17

### Nuovo
- Valutazione degli agenti: tool `rate_agent` in due passi, con anteprima e codice; sezione «Valuta gli agenti» nel pannello; proposta a fine lavoro e promemoria dopo 30 minuti. È l'unica connessione del server, e parte solo dopo la tua conferma; `--no-ratings` la toglie.
- L'agente dice chi è (nome in codice, ruolo, reparto) all'inizio, quando passa a un altro agente e nel riepilogo.

## 0.4.0 — 2026-11-16

### Nuovo
- Comando `init`: crea un progetto con regole, piano a fasi, agenzie, subagent, CI e `.mcp.json`. Prende il posto di agentic-starter. Il server è invariato.

## 0.3.3 — 2026-11-16

### Nuovo
- Export `@agentrica/mcp/catalog` per leggere reparti e agenti da codice. Agenti e comportamento del server invariati.

## 0.3.2 — 2026-11-16

### Cambiato
- Pannello in tre pagine (Sessione, Piano, Rilievi), con menu e contatori delle scelte in attesa e dei rilievi. Agenti e comportamento del server invariati.

## 0.3.1 — 2026-11-15

### Cambiato
- Regole comuni con una scala di gravità condivisa (P0–P3) e una scala per il reparto software.

### Corretto
- Il pannello nasconde i rilievi chiusi e conta a parte i file nuovi.
- L'id del tool `agente` accetta solo le sigle dei reparti.

## 0.3.0 — 2026-11-15

### Nuovo
- Pannello locale con `--panel`: fasi, backlog, rilievi, agenti in uso e scelte da prendere dalla pagina (tool `open_panel` e `ask_user`). Senza `--panel` nulla cambia.

## 0.2.1 — 2026-11-15

### Nuovo
- Nome `io.github.flgisimone/agentrica` per il registro MCP ufficiale. Agenti e comportamento invariati.

## 0.2.0 — 2026-11-15

### Nuovo
- Argomento `--agents` per caricare solo una squadra di agenti o reparti.

### Cambiato
- Con un progetto vuoto, o senza ciò che il ruolo deve esaminare, l'agente lo dice e propone i primi passi da confermare, senza inventare rilievi.

## 0.1.0 — 2026-11-15

### Nuovo
- Prima versione pubblicata: 56 agenti in cinque reparti, un prompt per agente e i tool `elenca_agenti` e `agente`.
