# F14 — Pannello locale

**Obiettivo**: chi usa `@agentrica/mcp` segue e guida lo sviluppo del proprio progetto da una pagina web invece che dal terminale: fasi, backlog, rilievi e decisioni in attesa, con le scelte prese dalla pagina. Tutto gira sul computer dell'utente: niente account, niente server di Agentrica, nessun dato inviato.

> **Stato: da aprire** (dopo F13). Strada scelta dall'utente il 2026-11-15, fra pannello locale, area personale remota, entrambe o nessuna UI nuova.

**Agenzie**: business (Product Manager) per obiettivo e criteri di successo; design (UX Designer, UI Designer, UX Writer, Accessibility) prima e dopo; software (Architect, Backend per `packages/mcp`, Frontend, QA, Security, Code Reviewer); cybersecurity (AppSec, Network Security) per il server locale in ascolto su una porta.

## Situazione di partenza

- `@agentrica/mcp` è un server stdio locale dentro il client dell'utente: il sito su Vercel non vede il computer, il repository né la sessione dell'agente. Per questo la UI non può stare nel sito senza un agente remoto (area personale, [F15](15-area-personale.md), sospesa).
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

## Backlog

Da scrivere all'apertura, dopo la scelta fra A e B. Fissi: design del pannello (vista e decisioni), comando `panel`, lettura di `plan/` e `audit/` con test, agenti in uso e decisioni dalla pagina, revisione di sicurezza del server locale, sezione nel sito e README del pacchetto.

## Criteri di accettazione

Da scrivere all'apertura.
