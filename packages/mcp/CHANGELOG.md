# Novità di @agentrica/mcp

Ogni versione con la data di pubblicazione su npm e le novità per tipo: Nuovo, Cambiato, Corretto, Incompatibile. La versione si fissa nel comando del server (`@agentrica/mcp@<versione>`): un aggiornamento arriva solo quando la cambi tu. La versione inglese è [CHANGELOG.en.md](CHANGELOG.en.md).

## 0.11.0 — 2026-11-22

### Nuovo
- `init --existing` per un progetto già avviato: scrive solo i file che mancano, salta quelli presenti e li elenca, non fa commit; niente F0 «base tecnica», CI, `.nvmrc` ed `.env.example`, e il piano parte senza fasi. Se c'è già un `CLAUDE.md` dice di aggiungere `@AGENTS.md`.
- Istruzioni del server: formato di `plan/`, con la proposta di crearlo leggendo il codice se manca, e sessioni per fase: la pianificazione scrive solo `plan/`, si fa confermare e propone `/clear`; una fase per sessione, con `/clear` alla chiusura.

### Cambiato
- Pannello: senza `plan/README.md`, o con un piano senza fasi, un'informazione con le strade per crearlo (`init --existing` o la richiesta a Claude) invece di un errore.
- `AGENTS.md`, `CONVENTIONS.md` e `plan/README.md` dei progetti nuovi: la pianificazione è una sessione a sé e ogni fase si apre in una sessione nuova.
- Istruzioni del server con un test sulla lunghezza: entro i 4096 caratteri oltre i quali Claude Code le tronca.

## 0.10.0 — 2026-11-22

### Incompatibile
- `init` non copia più i subagent in `.claude/agents/`: gli agenti si consultano dal server con `agent`, uno alla volta. Con `--subagents` li copia, e ogni subagent ha fra i `tools` `mcp__agentrica__agent` e `mcp__agentrica__library` e come primo passo carica il suo agente dal server, così compare nel pannello.

### Nuovo
- Gerarchia: `list_agents` segna il direttore di ogni reparto; il testo del direttore dice come coordinare gli specialisti, quello di uno specialista a chi riporta e di caricare prima il direttore.
- Pannello: gli agenti in uso in ordine di chiamata, con il direttore segnato, e una sezione a parte «Subagent di Claude Code» con tipo, descrizione e stato dei subagent avviati nella sessione, letti dai file che Claude Code salva per il progetto.
- Tool `report`, con il pannello: il resoconto di ciò che un agente ha fatto, che il testo dell'agente chiede a fine compito; il pannello lo mostra sotto l'agente, con il compito intero.
- Pannello: gli agenti in una pagina propria, «Agenti», come albero per reparto (una colonna per reparto, il direttore in cima, il numero d'ordine sulla scheda); la Sessione mostra gli ultimi tre.
- Pannello: le valutazioni in una pagina propria, «Valutazioni», con il numero degli agenti da valutare nel menu; un avviso quando un agente nuovo si mette al lavoro o c'è un agente da valutare, anche come notifica di sistema se la attivi.

### Cambiato
- Gli agenti si usano anche senza nominarli: regola principale in testa ad `AGENTS.md` dei progetti nuovi e nelle istruzioni del server, ogni lavoro sul progetto passa dagli agenti; le decisioni di F0 le propone il direttore software, e le domande all'utente passano da `ask_user`.
- Istruzioni del server: direttore prima degli specialisti, un agente alla volta, ordine fra reparti, `agent` invece dei subagent locali salvo richiesta dell'utente.
- Il modello consigliato non chiede più di affidare il compito a un subagent.
- `AGENTS.md` dei progetti nuovi: sezione «Come si consulta un agente»; README dei reparti senza subagent di predefinito.

### Corretto
- Pannello: il colore del reparto negli agenti in uso e nei moduli di valutazione; il compito non si tronca più a 120 caratteri; l'ora di avvio dei subagent viene dal loro transcript, e un subagent i cui file Claude Code scrive in un formato diverso compare lo stesso, con «formato non riconosciuto», invece di sparire.

## 0.9.0 — 2026-11-22

### Incompatibile
- Tool, comandi e argomenti in inglese, senza alias: `elenca_agenti` → `list_agents` (`reparto` → `department`), `agente` → `agent` (`compito` → `task`), l'argomento `compito` dei prompt degli agenti → `task`, `/mcp__agentrica__valuta` → `/mcp__agentrica__rate` (`agente` → `agent`), `/mcp__agentrica__progetto` → `/mcp__agentrica__project` (`rimuovi` → `remove`), `/mcp__agentrica__configura` → `/mcp__agentrica__configure`. I nomi dei prompt degli agenti (`aisa-02-software`) non cambiano.

### Nuovo
- Agenti in due lingue: file di ruolo, regole comuni, README dei reparti e schede della biblioteca anche in inglese, in `agents/<agenzia>/en/`. Il server si ferma con un errore chiaro se un file non ha il gemello o se le sezioni non coincidono.
- Lingua del server: istruzioni, risposte dei tool, testo degli agenti, moduli, messaggi di `install`, `add` e `init` e pannello in italiano o in inglese. Di predefinito la lingua del sistema (italiano se è l'italiano, altrimenti inglese); si sceglie con `--lang it` o `--lang en`, anche in `install` e `add`, o con la voce «Lingua» della configurazione (`lang` in `~/.agentrica/config.json`).
- `init` crea il progetto nella lingua scelta: in inglese starter e subagent vengono da `starter/en/`; `agents/` si copia con le due lingue.
- Il pannello legge piani e audit in italiano e in inglese (`## Phases`, `**Goal**`, `## Done`, chiavi `findings`, `title`, `priority`, `status`).
- Questo file in inglese, `CHANGELOG.en.md`, con tutte le versioni dalla 0.1.0.

### Cambiato
- I link alle note legali nei moduli di valutazione, dei totali di token e dei progetti portano alla pagina nella lingua del server (`/it/note-legali` o `/en/legal`).
- Un progetto proposto senza nome da mostrare parte con l'autore vuoto: il sito scrive «Utente di Agentrica» o «Agentrica user» nella lingua della pagina.

## 0.8.1 — 2026-11-22

### Corretto
- Pannello: un agente usato all'inizio di una sessione lunga resta fra quelli da valutare; prima usciva dall'elenco dopo 20 chiamate ad altri agenti.
- `/mcp__agentrica__progetto` con un testo che non è il codice di una proposta: il messaggio spiega che per proporre un progetto il comando si lancia senza argomenti.

### Cambiato
- `add` e `install` avvisano se Agentrica è registrato anche in un altro ambito di Claude Code (user, project o local), con il comando per togliere la registrazione che non serve.
- Regole comuni dei reparti: un agente ferma solo i processi che ha avviato, per PID, mai per nome.
- AIWDA-08 · GACRUX cita i criteri WCAG giusti per l'indicatore di focus (2.4.7) e per `autocomplete` (1.3.5).
- Biblioteca AIWDA: EN 301 549 (in Gazzetta è citata la V3.2.1, non ancora la V4.1.1) e D.lgs. 82/2022 (microimprese, periodi transitori, vigilanza e sanzioni).
- I subagent copiati da `init` rimandano alle schede della biblioteca del loro reparto.
- README inglese: sezione dei modelli consigliati.

## 0.8.0 — 2026-11-21

### Nuovo
- Configurazione con un modulo: squadra, pannello, valutazioni e avviso di versione si scelgono alla prima chiamata ad Agentrica della sessione (se il client mostra moduli) o con il comando `/mcp__agentrica__configura`. Le scelte si salvano in `~/.agentrica/config.json`, solo sul tuo computer, e valgono dalla sessione successiva; le opzioni del comando del server hanno la precedenza.
- Comando `/mcp__agentrica__progetto` e tool `submit_project`: proponi un tuo progetto per la pagina dei progetti del sito anche senza account GitHub, con un link https qualsiasi, consenso e licenza. Parte solo dopo il modulo o l'anteprima confermata; ricevi un codice per ritirarlo (`/mcp__agentrica__progetto` con `rimuovi`). `--no-ratings` lo toglie.
- Comando `/mcp__agentrica__valuta`: apre il modulo di valutazione per l'ultimo agente usato o per quello indicato, anche in una sessione con un solo agente; senza moduli passa a `rate_agent`.

### Corretto
- Client che dichiarano i moduli ma li chiudono senza mostrarli (l'estensione VS Code di Claude Code): un modulo chiuso in meno di 300 ms vale come non mostrato. Non si salva la configurazione, e per il resto della sessione la valutazione torna al flusso di `rate_agent` proposto dall'agente.

### Cambiato
- Pannello locale acceso di predefinito, con `open_panel` e `ask_user`: «apri il pannello» funziona subito dopo l'installazione. `--no-panel` o la configurazione lo spengono; `--panel` resta valido. Con il permission model di Node senza rete o processi figli il pannello non parte e il server continua. `init` non scrive più `--panel` nel `.mcp.json`.
- Il server scrive un file, la configurazione, e solo dopo il modulo; con il permission model di Node non lo legge né lo scrive.

## 0.7.1 — 2026-11-19

### Corretto
- `install` e `add` su Windows: npm e claude installati con npm (file `.cmd`) partivano con la cartella sbagliata e cercavano `node_modules\npm\bin\npm-cli.js` nel progetto corrente, e `install` si fermava con «npm install -g non riuscito». Ora il nome del comando passa a cmd senza virgolette.

## 0.7.0 — 2026-11-19

### Nuovo
- Modello consigliato per ruolo, misurato sui casi di prova: Haiku per AISA-08, Sonnet per AICA-04, AIPCA-02, AISA-09 e AIBPD-05, il modello della sessione per gli altri. Lo dicono `elenca_agenti`, il testo dell'agente e il campo `model:` dei subagent copiati da `init`; la scelta resta tua.
- Pagina «Consumo» nel pannello: token spesi per agente, modello, sessione e giorno, letti dai file di Claude Code del progetto (solo numeri), con il risparmio della cache e quello stimato del modello.
- Biblioteca degli agenti: schede di nozioni recenti per ogni reparto, con fonte, versione e date di verifica e scadenza. Il testo dell'agente ne ha l'indice; il tool `library`, in sola lettura, restituisce una scheda del reparto dell'agente.
- Tool `share_usage` e pulsante «Condividi i totali con Agentrica» nel pannello: dopo l'anteprima delle righe esatte, inviano al sito i totali di token degli ultimi 30 giorni per sessione, giorno, agente, modello ed effort, senza testi né nomi di file. Parte solo dopo la tua conferma; `--no-ratings` lo toglie insieme a `rate_agent`.

### Cambiato
- Regole comuni dei reparti: su un modello più piccolo, un rilievo P0 o P1 o un dubbio passano al riesame del direttore o di un revisore sul modello più grande; le nozioni datate si citano dalla biblioteca, con fonte e data.
- README: la sezione «Messi alla prova» diventa «Mostra il tuo progetto», con la issue e il topic `agentrica` per comparire sul sito.

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
