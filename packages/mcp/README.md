# Agentrica MCP

[English](README.en.md)

Il server MCP di Agentrica: i 56 agenti IA dei cinque reparti (AIBPD, AICA, AIPCA, AISA, AIWDA) usabili nel tuo progetto da Claude Code o da qualsiasi client MCP.

Ogni agente è un ruolo con un metodo e dei limiti dichiarati, per esempio `AISA-02 · ALTAIR`, Senior Software Architect, o `AIPCA-03 · DUBHE`, Senior Privacy Legal Specialist. Il server dà al modello le regole comuni del reparto e il file di ruolo dell'agente, presi da [`agents/`](https://github.com/flgisimone/agentrica/tree/main/agents), e il modello lavora nel tuo progetto con quelle istruzioni.

## Cosa fa e cosa non fa

- Il server gira solo in locale: lo avvia il client sul tuo computer e i due comunicano con stdio. Il server non ha una parte remota.
- Come contenuto legge solo i file di `agents/` inclusi nel pacchetto, una volta all'avvio. Il testo che arriva al modello è quello di quei file: puoi leggerlo prima di usarlo.
- Il server non scrive file (lo fa solo il comando [`init`](#nuovo-progetto), quando lo lanci tu), non apre connessioni di rete, non registra, non raccoglie e non invia dati, non ha telemetria. Con `--panel` apre una pagina solo sul tuo computer: vedi [Pannello locale](#pannello-locale).
- Non esegue niente nel tuo progetto. Dà soltanto istruzioni al modello: quello che il modello fa nel progetto dipende dal client e dai permessi che gli concedi.
- **Dove vanno i dati.** Il testo dell'agente, il compito e i file che il modello legge nel tuo progetto vanno al fornitore del modello attraverso il tuo client, secondo le condizioni di quel fornitore. Agentrica non li riceve. Nel compito non inserire dati personali, segreti o dati di clienti che non servono.
- Gli agenti sono IA: le loro conclusioni sono proposte da verificare. Gli agenti di privacy e sicurezza non sostituiscono un DPO, un avvocato o un responsabile della sicurezza, e i loro rilievi non sono una certificazione di conformità.

## Installazione

Serve Node 22 o successivo, con npm.

**Claude Code**, dalla cartella del tuo progetto:

```sh
claude mcp add agentrica -- npx -y @agentrica/mcp@0.4.0
```

Al primo avvio npx scarica il pacchetto da npm. La versione resta quella indicata finché non la cambi tu: un aggiornamento dei ruoli non arriva senza che tu lo scelga.

**Altri client MCP**: aggiungi il server alla configurazione del client, di solito un file JSON come questo:

```json
{
  "mcpServers": {
    "agentrica": {
      "command": "npx",
      "args": ["-y", "@agentrica/mcp@0.4.0"]
    }
  }
}
```

**Permessi minimi (consigliato).** Installa il pacchetto in una cartella sua e avvialo con il permission model di Node: il server può solo leggere quella cartella, e Node blocca scritture su file, connessioni di rete e processi figli. Il server non ne ha bisogno, quindi funziona uguale; i permessi limitano i danni di un eventuale difetto futuro.

```sh
npm install -g --ignore-scripts @agentrica/mcp@0.4.0
npm root -g
```

Con la cartella stampata da `npm root -g` al posto di `/cartella/globale`:

```sh
claude mcp add agentrica -- node --permission --allow-fs-read=/cartella/globale/@agentrica/mcp /cartella/globale/@agentrica/mcp/dist/mcp/src/server.js
```

**Provenienza.** Il pacchetto è pubblicato dalla CI del repository con provenance: su npm si vede da quale commit è stato costruito, e `npm audit signatures` nel tuo progetto ne verifica la firma.

**Da un clone**, per lavorare su Agentrica: `npm ci` nella root del repository, poi al posto del comando npx `node --permission --allow-fs-read=/percorso/di/agentrica /percorso/di/agentrica/packages/mcp/src/server.ts` (Node 26, come in `.nvmrc`).

## Uso

**Prompt.** Ogni agente è un prompt con il suo id in minuscolo (`aisa-02`, `aica-01`…) e un argomento facoltativo, `compito`. In Claude Code i prompt diventano comandi:

```
/mcp__agentrica__aisa-02 "Rivedi i confini fra i moduli di src/"
```

Metti il compito fra virgolette: Claude Code separa gli argomenti con gli spazi.

**Squadra.** Con `--agents` il server carica solo gli agenti che indichi: id di agenti e sigle di reparti, separati da virgole, senza distinguere maiuscole. Per esempio tutto il reparto software più l'agente dell'accessibilità:

```sh
claude mcp add agentrica -- npx -y @agentrica/mcp@0.4.0 --agents aisa,aiwda-08
```

Nel menu dei comandi restano solo i prompt della squadra, e anche `elenca_agenti` e `agente` vedono solo quelli. Senza `--agents` ci sono tutti i 56 agenti. Un id o una sigla sconosciuti fermano il server con un messaggio che li nomina, nei log del client. In Claude Code i prompt non entrano nel contesto del modello (lo abbiamo verificato con `/context`): la squadra rende il menu più corto, ma non fa risparmiare token.

**Tool**, per i client che non mostrano i prompt, o quando vuoi che sia il modello a scegliere l'agente:

| Tool | Input | Cosa restituisce |
|---|---|---|
| `elenca_agenti` | `reparto` facoltativo (`AIBPD`, `AICA`, `AIPCA`, `AISA`, `AIWDA`) | id, nome in codice, ruolo e reparto di ogni agente |
| `agente` | `id` (es. `AISA-02`), `compito` facoltativo | le istruzioni complete dell'agente |

Per esempio: «Usa elenca_agenti, scegli l'agente di Agentrica adatto e verifica l'accessibilità del form di login».

Il numero 01 di ogni reparto è il direttore: coordina gli specialisti e consolida i loro rilievi.

I file degli agenti sono in italiano; l'agente risponde nella lingua in cui gli scrivi.

## Pannello locale

Con `--panel` il server apre anche una pagina sul tuo computer da cui segui il progetto e prendi le scelte che l'agente ti chiede, invece di rispondere nel terminale:

```sh
claude mcp add agentrica -- npx -y @agentrica/mcp@0.4.0 --panel
```

Poi chiedi all'agente di aprire il pannello (tool `open_panel`): la pagina si apre nel browser. Ha tre pagine, con il menu in alto che conta le scelte in attesa e i rilievi:

- **Sessione**: le scelte da prendere (*Da decidere*), con le opzioni e le motivazioni, la cui risposta, con una nota facoltativa, torna all'agente; accanto, gli agenti di Agentrica chiamati in questa sessione (*Agenti in uso*), con l'inizio del compito;
- **Piano**: la fase in corso con backlog e criteri di accettazione, e tutte le fasi del progetto;
- **Rilievi**: i rilievi aperti delle fasi e quelli degli audit, per priorità e reparto.

Con il pannello il modello ha due tool in più:

| Tool | Input | Cosa fa |
|---|---|---|
| `open_panel` | nessuno | apre la pagina nel browser e ne restituisce l'URL |
| `ask_user` | `question`, 2–4 `options` (`label`, `description`), `header` e `multiple` facoltativi | mostra la scelta nella pagina e restituisce la risposta |

Se la pagina non è aperta, `ask_user` la apre. Il client aspetta la risposta finché il server manda notifiche di avanzamento (fino a 4 ore; 25 minuti con un client che non le chiede), poi l'agente chiede nel terminale. Le domande del client, come i permessi dei tool, restano nel client.

**Cosa cambia con `--panel`.** Il server apre una porta casuale solo su `127.0.0.1`, legge `plan/`, `audit/` e lo stato di git (`git status`) della cartella del progetto e tiene in memoria le ultime 20 chiamate agli agenti. Non scrive file e non manda dati fuori dal computer. La pagina si apre solo con il token casuale contenuto nell'URL, che vale per quella sessione; le richieste da altri siti o con un altro `Host` sono rifiutate. Il permission model di Node consigliato sopra non si usa con `--panel`, che ha bisogno della rete locale e di `git`.

**Formato di `plan/` e `audit/`.** Il pannello legge il formato dei piani creati da `init`, lo stesso del [`plan/`](https://github.com/flgisimone/agentrica/tree/main/plan) e dell'[`audit/`](https://github.com/flgisimone/agentrica/tree/main/audit) di Agentrica; se qualcosa manca, la pagina dice cosa.

- `plan/README.md` con una sezione `## Fasi` e una tabella `| Fase | File | Contenuto | Stato |`, il file come link (`[14-pannello.md](14-pannello.md)`). La fase aperta è la prima con uno stato diverso da `completata` e `sospesa`.
- Nel file della fase: `# Titolo`, una riga `**Obiettivo**: …`, `## Backlog` con la tabella `| # | Task | Priorità |`, `## Criteri di accettazione` e `## Fatto` come elenchi; un task è fatto quando il suo id compare in grassetto in «Fatto» (`- **F14-01** …`). `## Rilievi aperti` è un elenco, con la priorità (`P0`–`P3`) nel testo; una voce che dice «risolto» o «chiuso» (es. «Risolto in F6.») resta nel piano ma il pannello non la mostra.
- `audit/<cartella>/<file>.json` con `agente` (es. `"AICA-02 · …"`, da cui il reparto) e un elenco `rilievi` di oggetti con `id`, `titolo`, `priorita` e `stato` facoltativo; un rilievo con uno `stato` che dice «risolto» o «chiuso» non si mostra.

## Nuovo progetto

`init` crea un progetto con il metodo di lavoro di Agentrica, pronto per Claude Code:

```sh
npx -y @agentrica/mcp@0.4.0 init mio-progetto --name "Mio progetto"
```

Senza cartella usa quella corrente; senza `--name` il nome è quello della cartella. Scrive:

- `AGENTS.md` e `CLAUDE.md` (regole per gli agenti: tokensave, scala Ponytail, efficienza, verifica, agenzie) e `CONVENTIONS.md` (codice, test, fasi, chiusura e rilascio), con le parti dello stack marcate «da compilare»;
- `plan/` con `README.md` (decisioni, glossario, fasi) e `00-base.md`, la fase F0 da cui si parte; `audit/` e `docs/`;
- `agents/` e `.claude/agents/`: i 56 ruoli di questa versione e un subagent per ruolo, con il nome del progetto;
- `.github/workflows/ci.yml` (`npm run verify` e `verify:e2e`, saltati finché F0 non li crea), `.gitignore`, `.nvmrc`, `.env.example`;
- `.mcp.json` con questo server a versione esatta e `--panel`, così il pannello legge subito il piano.

Se anche un solo file esiste già, `init` non scrive nulla e dice quali sono. Fuori da un repository git fa il primo commit su `main` e lascia attivo `develop`; dentro un repository non fa commit. Poi apri Claude Code nella cartella e chiedi di aprire la fase F0. `init` è l'unico comando che scrive file: il server resta in sola lettura. Prende il posto di agentic-starter, che non si aggiorna più.

## Messi alla prova

Tre agenti provati il 2026-11-15 su tre piccoli progetti con difetti piantati e documentati, con `@agentrica/mcp@0.2.0 --agents <id>`, Claude Code per VS Code e Opus 5.5 (ragionamento medio). Un'esecuzione per caso, contata a mano.

| Agente | Progetto | Difetti trovati | Rilievi falsi | Altri rilievi validi |
|---|---|---|---|---|
| AISA-09 · REGULUS, Application Security | API REST in Node | 6 su 6 | 0 | 2 |
| AIWDA-08 · GACRUX, Accessibility | form di iscrizione | 8 su 8 | 0 | 2 |
| AIPCA-02 · ALIOTH, GDPR | prenotazioni di una palestra | 7 su 7 | 0 | 3 |

Limiti: i difetti sono pochi, noti e abbastanza evidenti; un solo modello e una sola esecuzione per caso; un risultato del genere non dice come va un agente su un progetto grande. Progetti, difetti attesi, regole di conteggio e rapporti completi degli agenti sono in [`examples/`](https://github.com/flgisimone/agentrica/tree/main/examples): puoi ripetere le prove.

## Aggiornamenti

Il testo degli agenti viene dai file di `agents/` della versione installata. Per aggiornare cambia la versione nel comando (o reinstalla con `npm install -g`) e riavvia il client. Gli id e i nomi in codice non cambiano.

Lo stesso catalogo si legge anche da codice, senza avviare il server: `import { loadCatalog } from "@agentrica/mcp/catalog"` restituisce reparti e agenti (con i tipi `Department` e `Agent`) dagli `agents/` del pacchetto. È ciò che usa il sito di Agentrica.

## Versioni

- **0.4.0**: comando `init` che crea un progetto con regole, piano a fasi, agenzie, subagent, CI e `.mcp.json` (prende il posto di agentic-starter); il server è invariato.
- **0.3.3**: export `@agentrica/mcp/catalog` per leggere reparti e agenti da codice (lo usa il sito, ora in un repository a parte); agenti e comportamento del server invariati.
- **0.3.2**: pannello in tre pagine (Sessione, Piano, Rilievi) con menu e contatori delle scelte in attesa e dei rilievi; agenti e comportamento del server invariati.
- **0.3.1**: pannello che nasconde i rilievi chiusi e conta a parte i file nuovi; id del tool `agente` limitato alle sigle dei reparti; regole comuni con una scala di gravità condivisa (P0–P3) e una scala per il reparto software.
- **0.3.0**: pannello locale con `--panel`: fasi, backlog, rilievi, agenti in uso e scelte da prendere dalla pagina (tool `open_panel` e `ask_user`). Senza `--panel` nulla cambia.
- **0.2.1**: nome `io.github.flgisimone/agentrica` per il registro MCP ufficiale; agenti e comportamento invariati.
- **0.2.0**: argomento `--agents` per caricare solo una squadra di agenti o reparti; con un progetto vuoto, o senza ciò che il ruolo deve esaminare, l'agente lo dice e propone i primi passi da confermare, senza inventare rilievi.
- **0.1.0**: prima versione pubblicata. 56 agenti in cinque reparti, un prompt per agente e i tool `elenca_agenti` e `agente`.

## Licenza

MIT. Agentrica è una società fittizia: gli agenti sono modelli di IA guidati da file di ruolo.
