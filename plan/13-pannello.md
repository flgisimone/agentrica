# F13 — Pannello locale

**Obiettivo**: chi usa `@agentrica/mcp` segue e guida lo sviluppo del proprio progetto da una pagina web invece che dal terminale: fasi, backlog, rilievi e decisioni in attesa, con le scelte prese dalla pagina. Tutto gira sul computer dell'utente: niente account, niente server di Agentrica, nessun dato inviato.

> **Stato: da aprire** (dopo F12). Strada scelta dall'utente il 2026-11-15, fra pannello locale, area personale remota, entrambe o nessuna UI nuova.

**Agenzie**: business (Product Manager) per obiettivo e criteri di successo; design (UX Designer, UI Designer, UX Writer, Accessibility) prima e dopo; software (Architect, Backend per `packages/mcp`, Frontend, QA, Security, Code Reviewer); cybersecurity (AppSec, Network Security) per il server locale in ascolto su una porta.

## Situazione di partenza

- `@agentrica/mcp` è un server stdio locale dentro il client dell'utente: il sito su Vercel non vede il computer, il repository né la sessione dell'agente. Per questo la UI non può stare nel sito senza un agente remoto (area personale, [F14](14-area-personale.md)).
- Il metodo delle agenzie vive in file del progetto: `plan/` (fasi e backlog), `audit/` (rilievi JSON e report), git (branch e stato).
- Le UI generiche esistono già (estensione VS Code, app desktop, claude.ai/code); manca una vista sul metodo Agentrica.

## Decisione dell'utente (2026-11-15)

Pannello locale come fase a sé prima dell'area personale, che slitta a F14. Resta valida la decisione «Server MCP solo stdio locale, nessuna telemetria».

## Proposte da confermare all'apertura

- **Comando**: `npx -y @agentrica/mcp@<versione> panel` avvia il pannello e apre il browser; il server MCP resta il comando predefinito.
- **Livello 1, sola lettura**: legge `plan/`, `audit/` e lo stato di git della cartella corrente e mostra fasi, backlog, rilievi aperti per priorità e reparto, decisioni in attesa. Nessuna scrittura.
- **Livello 2, guida dell'agente**: dalla pagina si avvia un compito e si risponde a domande e permessi (alternative, commit, merge) con il Claude Agent SDK, che lascia all'applicazione la gestione di domande e permessi. Da verificare all'apertura: autenticazione e costi (chiave API dell'utente o abbonamento), dipendenza nuova a versione esatta. In alternativa, un file di decisioni scritto dal pannello e letto dall'agente.
- **Sicurezza del server locale**: ascolto solo su `127.0.0.1`, porta casuale, token monouso nell'URL aperto dal comando, controllo di `Host` e `Origin` contro DNS rebinding e richieste da altri siti, CSP `'self'`; nessun accesso fuori dalla cartella del progetto.
- **Formato dei file**: il pannello dipende dalla struttura di `plan/` e `audit/`; serve un formato minimo documentato (tabelle del backlog, campi dei rilievi) con un errore chiaro se manca.
- **Tecnologia**: pagina servita dal pacchetto senza Next (HTML e JavaScript compilati, `node:http`), per non pesare su `npx`.

## Backlog

Da scrivere all'apertura, dopo la scelta del livello. Fissi: design del pannello, comando `panel`, lettura di `plan/` e `audit/` con test, revisione di sicurezza del server locale, sezione nel sito e README del pacchetto.

## Criteri di accettazione

Da scrivere all'apertura.
