# F14 — Pannello locale

**Obiettivo**: chi usa `@agentrica/mcp` segue e guida lo sviluppo del proprio progetto da una pagina web invece che dal terminale: fasi, backlog, rilievi e decisioni in attesa, con le scelte prese dalla pagina. Tutto gira sul computer dell'utente: niente account, niente server di Agentrica, nessun dato inviato.

> **Stato: completata** (2026-11-15). 0.3.0 rilasciata su npm e pubblicata nel registro MCP. Strada scelta dall'utente il 2026-11-15, fra pannello locale, area personale remota, entrambe o nessuna UI nuova.

**Agenzie**: business (Product Manager) per obiettivo e criteri di successo; design (UX Designer, UI Designer, UX Writer, Accessibility) prima e dopo; software (Architect, Backend per `packages/mcp`, Frontend, QA, Security, Code Reviewer); cybersecurity (AppSec, Network Security) per il server locale in ascolto su una porta.

## Situazione di partenza

- `@agentrica/mcp` è un server stdio locale dentro il client dell'utente: il sito su Vercel non vede il computer, il repository né la sessione dell'agente. Per questo la UI non può stare nel sito senza un agente remoto (area personale, eliminata il 2026-11-16).
- Il metodo delle agenzie vive in file del progetto: `plan/` (fasi e backlog), `audit/` (rilievi JSON e report), git (branch e stato).
- Le UI generiche esistono già (estensione VS Code, app desktop, claude.ai/code); manca una vista sul metodo Agentrica.

## Decisione dell'utente (2026-11-15)

Pannello locale come fase a sé prima dell'area personale. Revisione del valore (2026-11-15): l'utente conferma **anche la gestione dalla pagina**: vedere gli agenti al lavoro e prendere dalla pagina le scelte che oggi arrivano nel terminale. La strada tecnica si sceglie all'apertura (sotto). Resta valida la decisione «Server MCP solo stdio locale, nessuna telemetria».

## Proposte da confermare all'apertura

- **Comando**: `npx -y @agentrica/mcp@<versione> panel` avvia il pannello e apre il browser; il server MCP resta il comando predefinito.
- **Livello 1, sola lettura**: legge `plan/`, `audit/` e lo stato di git della cartella corrente e mostra fasi, backlog, rilievi aperti per priorità e reparto, decisioni in attesa. Nessuna scrittura.
- **Livello 2, gestione dalla pagina**: il pannello mostra quali agenti di Agentrica sono in uso e su quale compito, e le scelte in attesa con le alternative e le motivazioni; l'utente risponde dalla pagina e l'agente prosegue. Due strade, da scegliere all'apertura:
  - **A. Ponte nell'MCP**: il server `@agentrica/mcp`, che gira già dentro la sessione dell'utente, ospita il pannello e aggiunge un tool (es. `ask_user`) che l'agente usa per le decisioni: la domanda compare nella pagina e il tool restituisce la risposta. Il server sa anche quali prompt e tool degli agenti vengono usati. La sessione resta in Claude Code (terminale o estensione), nessuna dipendenza nuova, nessun costo in più; le domande native del client (permessi dei tool) restano nel client.
  - **B. Applicazione con il Claude Agent SDK**: il pannello avvia lui la sessione dell'agente e gestisce tutte le domande e i permessi, compresi commit e comandi; il terminale non serve più. Più completo e più costoso: dipendenza nuova a versione esatta, autenticazione e costi da verificare (chiave API dell'utente o abbonamento), superficie di sicurezza più ampia perché la pagina approva comandi sul computer.
  - Proposta: partire da A, che riusa ciò che c'è, e passare a B solo se le scelte rimaste nel terminale pesano davvero (`ponytail:`).
- **Sicurezza del server locale**: chi raggiunge la pagina prende decisioni sul progetto, quindi ascolto solo su `127.0.0.1`, porta casuale, token monouso nell'URL aperto dal comando, controllo di `Host` e `Origin` contro DNS rebinding e richieste da altri siti, CSP `'self'`; nessun accesso fuori dalla cartella del progetto.
- **Formato dei file**: il pannello dipende dalla struttura di `plan/` e `audit/`; serve un formato minimo documentato (tabelle del backlog, campi dei rilievi) con un errore chiaro se manca.
- **Dove vive**: il pannello serve ai progetti con `plan/` e `audit/` di agentic-starter; si decide all'apertura se metterlo in `@agentrica/mcp` o in agentic-starter.
- **Tecnologia**: pagina servita dal pacchetto senza Next (HTML e JavaScript compilati, `node:http`), per non pesare su `npx`.

## Decisioni dell'utente all'apertura (2026-11-15)

- **Strada**: A, ponte nell'MCP. B (Agent SDK) solo se le scelte rimaste nel terminale pesano davvero.
- **Dove vive**: in `@agentrica/mcp`.
- **Formato**: quello di oggi di `plan/` e `audit/`, documentato nel README del pacchetto, con un errore chiaro se manca.
- **Comando**: solo il flag `--panel` del server MCP, nessun comando `panel` a sé (`ponytail:` si aggiunge se serve guardare il progetto senza una sessione).
- **Progetto**: confermato come sotto.

## Progetto (confermato dall'utente il 2026-11-15)

**Processi.** Il pannello vive nello stesso processo del server MCP, che Claude Code avvia nella cartella del progetto: è l'unico modo per far arrivare all'agente la risposta data nella pagina senza un canale fra due processi.

- `--panel` sul server MCP (opt-in, come `--agents`): oltre a stdio apre un server HTTP su `127.0.0.1`, porta casuale, token casuale. Senza il flag nulla cambia: nessuna porta, nessun file letto fuori da `agents/`.
- Tool nuovi, attivi solo con `--panel` (nomi in inglese, CONVENTIONS §3): `open_panel` restituisce l'URL con il token e apre il browser; `ask_user` mostra nella pagina una domanda (testo, 2–4 opzioni con etichetta e motivazione, scelta singola o multipla, nota libera) e restituisce la risposta. Se nessuna pagina è aperta, `ask_user` apre il browser; se non arriva risposta entro un tempo massimo, restituisce «nessuna risposta» e l'agente chiede nel terminale.
- **Agenti in uso**: il server registra in memoria (mai su file) le chiamate a prompt e tool degli agenti (`aisa-02`, `agente`): ora, agente, primi caratteri del compito. La pagina le mostra in tempo reale.

**Pagina.** HTML, CSS e JavaScript statici nel pacchetto (niente framework, niente risorse esterne), aggiornati con Server-Sent Events. Tema scuro del sito, font di sistema. Una pagina sola, dall'alto:

1. Intestazione: nome della cartella, branch, file modificati, stato del collegamento («Sessione collegata» o «Sola lettura»).
2. **Da decidere**: le domande in attesa con le opzioni e le motivazioni; annunciate con `aria-live`, contatore nel titolo della scheda.
3. **Agenti in uso**: le ultime chiamate.
4. **Fasi**: tabella «Fasi» di `plan/README.md`; la fase aperta con backlog (fatto o da fare, da «Fatto») e criteri.
5. **Rilievi**: «Rilievi aperti» dei file di fase e rilievi di `audit/*/*.json`, per priorità, con filtro per reparto.

**Sicurezza.** Ascolto solo su `127.0.0.1`; token di 32 byte confrontato a tempo costante, scambiato al primo accesso con un cookie `HttpOnly`, `SameSite=Strict`; `Host` deve essere `127.0.0.1:<porta>`, `Origin` uguale per ogni POST; CSP `default-src 'self'`, `frame-ancestors 'none'`; corpo delle richieste limitato; letture solo di `plan/*.md` e `audit/*/*.json` sotto la cartella del progetto, link simbolici che escono rifiutati; `git` con `execFile` e argomenti fissi.

**Rischio da provare per primo.** Una chiamata a `ask_user` resta aperta finché l'utente risponde: va verificato quanto aspetta Claude Code (timeout dei tool MCP, notifiche di avanzamento). È il primo task: se il tempo non basta, si torna qui prima di costruire il resto.

## Prova del timeout (F14-01)

Letto nel binario di Claude Code 2.1.325 (estensione VS Code): il limite rigido di un tool MCP è `MCP_TOOL_TIMEOUT` o 10⁸ ms (circa 27 ore); per i server stdio vale anche un timeout di inattività di 30 minuti (`CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT`), che si azzera a ogni notifica di avanzamento («sent no response or progress for …s; aborting»).

Conseguenza per `ask_user`: se il client manda un `progressToken`, il server invia una notifica di avanzamento ogni 30 secondi e aspetta fino a 4 ore; senza token aspetta al massimo 25 minuti. Allo scadere restituisce «nessuna risposta» e l'agente chiede nel terminale. La prova in una sessione vera resta nei criteri di accettazione.

## Design della pagina (F14-02, da confermare)

Ruoli: UX Designer, UI Designer, UX Writer, Accessibility Specialist.

- **Chi e quando**: chi sviluppa con Claude Code e tiene la pagina aperta accanto all'editor; la guarda quando l'agente chiede una scelta o per sapere a che punto è la fase. La parte più importante è «Da decidere»: in cima, sempre visibile.
- **Struttura**: `<header>` con «Agentrica · pannello», nome della cartella, branch e «N file modificati», stato del collegamento; `<main>` con quattro sezioni `<h2>` nell'ordine «Da decidere», «Agenti in uso», «Fasi», «Rilievi». Una colonna fino a 960 px, poi «Da decidere» e «Agenti in uso» affiancati sopra; larghezza massima 1200 px.
- **Da decidere**: una scheda per domanda con titolo breve, domanda, opzioni come `<fieldset>` con radio (o checkbox se multipla), etichetta in grassetto e motivazione sotto; la prima opzione consigliata ha l'etichetta «Consigliata»; campo «Nota (facoltativa)»; pulsante «Invia risposta». Dopo l'invio la scheda diventa «Risposta inviata: …» per 5 secondi e poi sparisce. Vuoto: «Nessuna scelta in attesa. Quando un agente ha bisogno di te, la domanda compare qui.» La domanda nuova si annuncia con una regione `aria-live="polite"`; il titolo della scheda diventa «(1) Agentrica · pannello».
- **Agenti in uso**: elenco delle ultime 20 chiamate, la più recente in alto: ora (HH:MM), nome in codice con il punto dell'accento del reparto, ruolo, prime parole del compito. Vuoto: «Nessun agente usato in questa sessione.»
- **Fasi**: tabella Fase / Contenuto / Stato da `plan/README.md`; sotto, la fase aperta (stato diverso da «completata» e «sospesa») con obiettivo, backlog (task, priorità, «Fatto» se il suo id è in «Fatto») e criteri di accettazione.
- **Rilievi**: filtri a pulsanti per reparto («Tutti», AIBPD…AIWDA, con `aria-pressed`); gruppi P0–P3; per ogni rilievo id, titolo, priorità, agente e audit. I «Rilievi aperti» dei file di fase stanno in testa, con la fase come origine.
- **Errori ed elementi mancanti**: se manca `plan/README.md` o una tabella attesa: «Non trovo `plan/README.md`: il pannello legge il formato di agentic-starter (vedi il README del pacchetto).» Un JSON di audit non valido si segnala con il nome del file e non blocca il resto. Collegamento perso: «Collegamento con la sessione interrotto. Riavvia la sessione di Claude Code per riaprire il pannello.»
- **Visivo**: palette del sito (fondo `#0b1020`, card `#121a2e`, bordo `#26324f`, testo `#e8ebf4` e `#a8b1c7`, accenti dei reparti), font di sistema e monospace di sistema, raggio 12 px, priorità con testo e non solo colore (P0 su `--destructive`).
- **Accessibilità**: tutto da tastiera, focus visibile bianco, `<table>` con `<th scope>`, contrasto AA, nessuna animazione oltre `prefers-reduced-motion`, `lang="it"`.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F14-01 | Prova: `ask_user` minimo in Claude Code, quanto aspetta una risposta e con quali notifiche | P0 |
| F14-02 | Design della pagina (UX, UI, UX Writer, Accessibility): struttura, testi, stati vuoti e di errore | P1 |
| F14-03 | Lettura di `plan/` e `audit/` e stato di git, con test e formato minimo documentato | P1 |
| F14-04 | Server HTTP locale con le difese di «Sicurezza», con test | P1 |
| F14-05 | Pagina statica con aggiornamenti in tempo reale | P1 |
| F14-06 | `--panel`, `open_panel`, `ask_user` e registro degli agenti in uso | P1 |
| F14-07 | Revisione di sicurezza del server locale (AppSec, Network Security) e del diff | P1 |
| F14-08 | README (italiano e inglese), sezione MCP del sito, versione 0.3.0 | P2 |

## Criteri di accettazione

- Con `--panel`, una domanda fatta dall'agente con `ask_user` compare nella pagina e la risposta torna all'agente in Claude Code, provato in una sessione vera.
- La pagina mostra fasi, backlog, rilievi e agenti in uso di questo repository; con `plan/` o `audit/` mancanti o fuori formato dice cosa manca.
- Senza `--panel` il server si comporta come la 0.2.1 (nessuna porta aperta, stessi tool).
- Richieste senza token, con `Host` o `Origin` diversi, o verso file fuori da `plan/` e `audit/` rifiutate, con test.
- Pagina usabile da tastiera, contrasto AA, nessuna risorsa esterna.
- `npm run verify` e `npm run verify:e2e` verdi; Code Reviewer sul diff.

## Fatto

- **F14-01** Timeout letto nel binario di Claude Code 2.1.325 (sezione «Prova del timeout»): notifiche di avanzamento ogni 30 s, attesa fino a 4 ore con `progressToken`, 25 minuti senza.
- **F14-02** Design della pagina confermato dall'utente; dopo la prova a vista i rilievi sono in gruppi richiudibili per priorità (P0–P1 aperti) e «Tutte le fasi» è richiudibile, perché i «Rilievi aperti» delle fasi passate sono decine.
- **F14-03** `packages/mcp/src/project.ts`: fasi, fase aperta (backlog, fatto, criteri), «Rilievi aperti» delle fasi e rilievi di `audit/*/*.json`, stato di git con `--no-optional-locks` e `core.fsmonitor=false`; letture solo sotto la cartella del progetto, link simbolici che escono rifiutati, 1 MB per file. Test in `project.test.ts`, compreso il piano di questo repository senza problemi.
- **F14-04** `packages/mcp/src/panel.ts`: `127.0.0.1` e porta casuale, token di 32 byte confrontato a tempo costante e scambiato con un cookie `HttpOnly`, `SameSite=Strict` legato alla porta, `Host` e `Origin` fissi, JSON obbligatorio, corpo fino a 16 KB, CSP `default-src 'self'`, rotte chiuse, errori di una richiesta che non fermano il processo. Test in `panel.test.ts`.
- **F14-05** Pagina statica in `packages/mcp/src/page/` (HTML, CSS, JavaScript senza dipendenze), Server-Sent Events e aggiornamento ogni 10 s a pagina visibile; dati solo come testo; copiata in `dist` dal `prepack`.
- **F14-06** `--panel`, `open_panel`, `ask_user` (opzioni con etichette diverse, consigliata per prima, nota libera), registro in memoria delle ultime 20 chiamate a prompt e tool `agente`; uscita del processo alla chiusura di stdio. Senza `--panel` nessun cambiamento (i test di 0.2.1 restano verdi).
- **F14-07** Revisione di sicurezza nei ruoli AppSec e Network Security: corretta l'esecuzione di `core.fsmonitor` da parte di `git status`. Rischi accettati: il token passa nella risposta di `open_panel` e quindi nel contesto del modello (vale solo su `127.0.0.1` e per la sessione); con `--panel` non si usa il permission model di Node.
- **F14-08** README italiano e inglese («Pannello locale», formato di `plan/` e `audit/`, «Versioni»), passo 4 nella sezione MCP del sito, versione 0.3.0 in `package.json`, `server.json`, `VERSION`, lock e comandi.
- **Rilascio 0.3.0** (CONVENTIONS §13.8): PR #7 `develop` → `main`, tag `v0.3.0`, pubblicazione dalla CI con provenance dopo l'approvazione dell'ambiente `npm`; `latest` è 0.3.0. L'utente ha pubblicato nel registro MCP con `mcp-publisher publish` (il primo tentativo, subito dopo npm, è fallito perché la versione non era ancora visibile).

## Verifiche

- `npm run verify`: verde, 56 test.
- `npm run verify:e2e`: 59 superati, 1 saltato.
- Prova a vista con Playwright e un client MCP vero sul repository, a 1280 e 390 px: nessun rilievo di axe, nessuno scorrimento orizzontale; domanda di `ask_user` nella pagina, risposta cliccata con nota, testo della risposta arrivato al client.
- Code Reviewer sul diff: APPROVE dopo un ritocco (gestore dei prompt riscritto come blocco).
- Prova in una sessione vera (utente, estensione Claude Code per VS Code, server dal clone con `--panel`): 4 tool visibili in `/mcp`, `open_panel` apre la pagina, la domanda di `ask_user` compare in «Da decidere», la risposta «Non ancora» data dalla pagina arriva all'agente; il prompt `aisa-02` funziona.

## Rilievi aperti

- P3: «Agenti in uso» nella sessione vera non è stato guardato a occhio dopo il prompt `aisa-02` (coperto dal test con un client MCP vero).
- P3: «Rilievi aperti» delle fasi passate contengono voci già risolte (es. repository privato, CI al push): il pannello le mostra come aperte. Si sistemano ripulendo i piani o con una convenzione per i rilievi chiusi. Risolto in `fix/f14-rilievi` (2765e21): le voci che dicono «risolto» o «chiuso» non si mostrano; i piani ripuliti in F15.
- P3: il conteggio «file modificati» comprende i file non tracciati (righe di `git status --porcelain`). Risolto in `fix/f14-rilievi`: modificati e nuovi contati a parte.
