# Agentrica

[![Agentrica MCP su mcprush](https://mcprush.com/badge/agentrica-mcp/compact.svg)](https://mcprush.com/to/agentrica-mcp?ref=badge)

[English](README.md)

**Agentrica è un server MCP con agenti IA organizzati in reparti, da usare nei tuoi progetti.** Ogni reparto copre una competenza e ogni agente ha un ruolo preciso, un metodo di lavoro e dei limiti dichiarati.

Questo repository contiene:

1. **Il server MCP** `@agentrica/mcp`: gli agenti usabili come strumenti in qualsiasi progetto (Claude Code o un altro client MCP), senza copiarne a mano i prompt. Si installa con `npx -y @agentrica/mcp@0.12.0 install` (vedi [packages/mcp/README.it.md](packages/mcp/README.it.md)).
2. **Il catalogo**: i file di ruolo in [`agents/`](agents/) e il pacchetto `packages/catalog` che li legge. Il sito https://agentrica.vercel.app presenta gli agenti a partire da questo catalogo.

Sito e server MCP leggono la **stessa fonte**: i file Markdown di [`agents/`](agents/). Un ruolo si modifica in un solo punto e cambia in entrambi. Da F17 il codice del sito è in un repository privato, che legge il catalogo da `@agentrica/mcp/catalog`: un ruolo modificato arriva sul sito con la versione successiva del pacchetto.

## I reparti

| Sigla | Reparto | Cosa fa | Cartella |
|---|---|---|---|
| **AIBPD** | AI Business & Product Development | obiettivi, requisiti, priorità, roadmap, business case, mercato | [`agents/ai_business_product_development_agency/`](agents/ai_business_product_development_agency/) |
| **AICA** | AI Cybersecurity | threat model, configurazioni, accessi, vulnerabilità, risposta agli incidenti | [`agents/ai_cybersecurity_agency/`](agents/ai_cybersecurity_agency/) |
| **AIPCA** | AI Privacy & Compliance | GDPR, basi giuridiche, conservazione, fornitori, DPIA | [`agents/ai_privacy_compliance_agency/`](agents/ai_privacy_compliance_agency/) |
| **AISA** | AI Software | analisi, architettura, sviluppo, test, sicurezza applicativa, revisione del codice | [`agents/ai_software_agency/`](agents/ai_software_agency/) |
| **AIWDA** | AI Web Design | ricerca UX, UI, architettura informativa, design system, accessibilità, testi | [`agents/ai_web_design_agency/`](agents/ai_web_design_agency/) |

Ogni agente ha un **nome in codice di stella**: la sigla del reparto, il numero del suo file di ruolo e una stella, per esempio `AISA-02 · ALTAIR` per il Senior Software Architect. Il numero 01 di ogni reparto è il direttore.

Agentrica non ha persone, clienti o casi di successo: il sito non ne inventa.

## Struttura

```
agentrica/
├── agents/              # i ruoli: la fonte unica dei contenuti (un .md per agente, 00-common-rules.md per reparto, biblioteca/ e fonti.json)
├── packages/catalog/    # TypeScript: legge agents/ e restituisce reparti e agenti tipizzati, con i nomi in codice
├── packages/mcp/        # il server MCP degli agenti (stdio), pacchetto npm @agentrica/mcp con l'export ./catalog: vedi packages/mcp/README.it.md
├── plan/                # decisioni e fasi del progetto
├── scripts/             # comandi da terminale: stats, ratings, agent-text, study (rilevatore della biblioteca)
├── .claude/agents/      # gli stessi ruoli come subagent di Claude Code, per lavorare a questo repository
└── AGENTS.md, CONVENTIONS.md, CLAUDE.md   # regole di lavoro
```

Le agenzie servono due volte: sono il **contenuto** del prodotto e sono anche il **team** con cui il progetto viene sviluppato in Claude Code (le agenzie attive sono in [AGENTS.md](AGENTS.md)).

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
| F11 | Statistiche: download npm da terminale | completata |
| F12 | Squadre: `--agents` nell'MCP e regola per i progetti vuoti | completata |
| F13 | Prove e distribuzione: casi di prova degli agenti, registri MCP | completata |
| F14 | Pannello locale: agenti in uso e scelte da prendere da una pagina su localhost (`--panel`, da 0.3.0) | completata |
| F15 | Rilievi aperti da F5 a F14 (0.3.1) | completata |
| F16 | Pannello multipagina e pulizia (0.3.2) | completata |
| F17 | Sito in un repository privato (0.3.3) | completata |
| F18 | agentic-starter fuso nel pacchetto: `init` (0.4.0) | completata |
| F19 | File di lavoro fuori dal repository pubblico: abbandonata | sospesa |
| F20 | Valutazioni degli agenti dall'MCP e dal pannello, endpoint del sito con database (0.5.0) | completata |
| F21 | Reputazione pubblica degli agenti: statistiche, classifiche e commenti moderati sul sito, sopra le soglie | completata |
| F22 | Vetrina del server MCP: badge di mcprush nei README e nel footer, link a npm, sito su 0.5.0 | completata |
| F23 | Avvisi e installazione: `install` e `add` su Mac, Windows e Linux, valutazione con il modulo del client, avviso di versione nuova, reparto nei comandi, CHANGELOG (0.6.0) | completata |
| F24 | Modelli per ruolo misurati sui casi di prova e consumo di token nel pannello | completata |
| F25 | Biblioteca degli agenti: schede con fonte e data, tool `library`, rilevatore settimanale delle novità | completata |
| F26 | Progetti degli utenti: vetrina su richiesta da issue e topic `agentrica`, pagina `/progetti` | completata |
| F27 | Consumo sul sito: `share_usage`, endpoint con somme, pagina `/consumo` (0.7.0) | completata |
| F28 | Nuova interfaccia del sito: strumento per sviluppatori, osservatorio stellare, catalogo `/agenti` e pannello «Usalo» | completata |
| F29 | Configurazione salvata, comandi `valuta`, `configura` e `progetto`, progetti proposti dal server MCP (0.8.0) | completata |
| F30 | Rilievi aperti da F16 a F29: privilegio minimo del database, rischi accettati, correzioni e prove guidate | completata |
| F31 | Lingua: una lingua per file, anglicismi tolti dai testi italiani, README inglesi di predefinito | completata |
| F32 | Ruoli, biblioteche e server MCP anche in inglese, `--lang`, tool in inglese (0.9.0) | completata |
| F33 | Sito in italiano e inglese (`/it`, `/en`), selettore di lingua, CHANGELOG inglese | completata (0.9.0) |
| F34 | Orchestrazione degli agenti: server MCP, gerarchia, subagent con `--subagents` | completata (0.10.0) |
| F35 | Progetti già avviati: `init --existing`, pannello senza errore, sessioni per fase | completata (0.11.0) |
| F36 | Hero animata nel sito, biblioteca e `report` sul sito, README e documenti allineati al posizionamento | completata (0.11.1) |
| F37 | Misura dei modelli, prima ondata: 14 specialisti cyber, privacy e software, modello consigliato più piccolo per 12 | completata (0.12.0) |

Il dettaglio è in [plan/README.md](plan/README.md).

## Avvio

Requisiti: Node (versione in `.nvmrc`) e npm.

```sh
npm ci
npm run verify    # typecheck, lint, test: prima di ogni commit
npm run stats     # download npm di @agentrica/mcp e stelle su GitHub
```

## Come si lavora

Il metodo di lavoro è lo stesso che `npx @agentrica/mcp init` porta nei progetti nuovi (vedi [packages/mcp/README.it.md](packages/mcp/README.it.md)):

- **una fase alla volta**: un file in `plan/` con backlog (attività `FN-NN` con priorità `P0`–`P3`) e criteri di accettazione confermati dall'utente, un branch `fase/fN-nome` da `develop`, chiusura con la procedura di [CONVENTIONS §13.7](CONVENTIONS.md); il metodo è in [CONVENTIONS §2.6](CONVENTIONS.md);
- **agenzie su richiesta**: i ruoli sono un modo di lavorare, i subagent si avviano solo per gli audit;
- **ogni decisione finale è confermata dall'utente**, commit e push compresi.

Per riprendere il lavoro in Claude Code: apri il repository, leggi `plan/README.md` e il file della fase in corso.

## Licenza

MIT, vedi [LICENSE](LICENSE).
