# Agentrica

**Agentrica è una società di consulenza fittizia fatta interamente di agenti IA.** Ha cinque reparti, uno per competenza, e 56 agenti specializzati, ciascuno con un ruolo preciso, un metodo di lavoro e dei limiti dichiarati.

Il repository ha due obiettivi, in quest'ordine:

1. **Un sito che presenta Agentrica**: la landing, i cinque reparti e una biografia per ogni agente, ricavata dal suo file di ruolo.
2. **Un server MCP**: gli stessi agenti usabili come strumenti in qualsiasi progetto (Claude Code o un altro client MCP), senza copiarne a mano i prompt.

Il sito è online su https://agentrica.vercel.app; il server MCP si installa con `npx -y @agentrica/mcp@0.1.0` (vedi [packages/mcp/README.md](packages/mcp/README.md)).

Sito e server MCP leggono la **stessa fonte**: i file Markdown di [`agents/`](agents/). Un ruolo si modifica in un solo punto e cambia in entrambi.

## I reparti

| Sigla | Reparto | Agenti | Cosa fa | Cartella |
|---|---|---|---|---|
| **AIBPD** | AI Business & Product Development | 12 | obiettivi, requisiti, priorità, roadmap, business case, mercato | [`agents/ai_business_product_development_agency/`](agents/ai_business_product_development_agency/) |
| **AICA** | AI Cybersecurity | 12 | threat model, configurazioni, accessi, vulnerabilità, risposta agli incidenti | [`agents/ai_cybersecurity_agency/`](agents/ai_cybersecurity_agency/) |
| **AIPCA** | AI Privacy & Compliance | 10 | GDPR, basi giuridiche, conservazione, fornitori, DPIA | [`agents/ai_privacy_compliance_agency/`](agents/ai_privacy_compliance_agency/) |
| **AISA** | AI Software | 12 | analisi, architettura, sviluppo, test, sicurezza applicativa, revisione del codice | [`agents/ai_software_agency/`](agents/ai_software_agency/) |
| **AIWDA** | AI Web Design | 10 | ricerca UX, UI, architettura informativa, design system, accessibilità, testi | [`agents/ai_web_design_agency/`](agents/ai_web_design_agency/) |

Ogni agente ha un **nome in codice di stella**: la sigla del reparto, il numero del suo file di ruolo e una stella, per esempio `AISA-02 · ALTAIR` per il Senior Software Architect. Il numero 01 di ogni reparto è il direttore.

Agentrica non ha persone, clienti o casi di successo: il sito non ne inventa.

## Struttura

```
agentrica/
├── agents/              # i ruoli: la fonte unica dei contenuti (un .md per agente, 00-common-rules.md per reparto)
├── packages/catalog/    # TypeScript: legge agents/ e restituisce reparti e agenti tipizzati, con i nomi in codice
├── apps/site/           # il sito in Next.js (Tailwind, shadcn/ui): landing, reparti, agenti
├── packages/mcp/        # il server MCP degli agenti (stdio), pacchetto npm @agentrica/mcp: vedi packages/mcp/README.md
├── plan/                # decisioni e fasi del progetto
├── .claude/agents/      # gli stessi ruoli come subagent di Claude Code, per lavorare a questo repository
└── AGENTS.md, CONVENTIONS.md, CLAUDE.md   # regole di lavoro
```

Le agenzie servono due volte: sono il **contenuto** del prodotto e sono anche il **team** con cui il progetto viene sviluppato in Claude Code (oggi Software e Web Design, vedi [AGENTS.md](AGENTS.md)).

## Stato

| Fase | Contenuto | Stato |
|---|---|---|
| F0 | Monorepo, catalogo da `agents/`, sito Astro di base, controlli e CI | completata |
| F1 | Landing di Agentrica | completata |
| F2 | Il sito passa da Astro a Next.js con Tailwind e shadcn | completata |
| F3 | Pagine dei reparti | completata |
| F4 | Pagine degli agenti con biografia | completata |
| F5 | Server MCP su stdio: gli agenti come prompt e tool nei progetti | completata |
| F6 | Rilievi | completata |
| F7 | Identità corporate: palette dai ritratti, header con menu, volti, sfondo animato, transizioni | completata |
| F8 | Sezioni: simulazione di sviluppo e server MCP | completata |
| F9 | Simboli: ritorno al tema scuro, un glifo per ogni stella al posto dei volti | completata |
| F10 | Pubblicazione: pacchetto npm, CI di release, header di sicurezza, note legali | completata |
| F11 | Analytics in casa: pagine viste aggregate in Postgres | aperta |
| F12 | Squadre: configuratore della configurazione MCP con i soli agenti scelti | da aprire |
| F13 | Pannello locale: fasi, rilievi e decisioni del progetto in una pagina su localhost | da aprire |
| F14 | Area personale: accesso Google + TOTP, pannello del titolare | da aprire |

Il dettaglio è in [plan/README.md](plan/README.md).

## Avvio

Requisiti: Node (versione in `.nvmrc`) e npm.

```sh
npm ci
npm run dev       # il sito in locale
npm run verify    # typecheck, lint, test, build: prima di ogni commit
```

## Come si lavora

Il repository è nato da [agentic-starter](https://github.com/flgisimone/agentic-starter) e ne segue il metodo:

- **una fase alla volta**: un file in `plan/`, un branch `fase/fN-nome` da `develop`, chiusura con la procedura di [CONVENTIONS §13.7](CONVENTIONS.md);
- **agenzie su richiesta**: i ruoli sono un modo di lavorare, i subagent si avviano solo per gli audit;
- **ogni decisione finale è confermata dall'utente**, commit e push compresi.

Per riprendere il lavoro in Claude Code: apri il repository, leggi `plan/README.md` e il file della fase in corso.

## Licenza

MIT, vedi [LICENSE](LICENSE).
