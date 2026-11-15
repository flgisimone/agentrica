# Piano di Agentrica

Agentrica è una società di consulenza fittizia fatta di agenti IA: cinque reparti (le agenzie di `agents/`) e 56 agenti, ciascuno con un nome in codice. Il progetto parte da un sito che la presenta (landing, reparti, biografie degli agenti) e arriva a un server MCP che rende gli stessi agenti utilizzabili nei progetti di chiunque.

Questo piano raccoglie le decisioni prese e le fasi di lavoro, una per file.

## Come si lavora a una fase

- Ogni fase ha un file `NN-nome.md` con obiettivo, stato, agenzie, backlog, criteri di accettazione e, a fine fase, «Fatto», «Verifiche» e «Rilievi aperti» (modello: [00-base.md](00-base.md)).
- Si lavora su un branch `fase/fN-nome`, partendo da `develop`; le correzioni fuori fase su `fix/nome`.
- Le «proposte da confermare» nei file di fase si decidono con l'utente all'apertura di ciascuna.
- La fase si chiude con la procedura di CONVENTIONS §13.7: piano aggiornato, controlli, **un'unica conferma dell'utente**, poi commit, merge in `develop`, push, `tokensave sync` e `/clear`.
- Il merge in `main` è un rilascio a parte, solo su richiesta dell'utente (CONVENTIONS §13.8).

## Decisioni

| Tema | Decisione | Motivo |
|---|---|---|
| Struttura | Repository creato da agentic-starter: AGENTS, CONVENTIONS, plan, agenzie, audit e docs versionati | Scelta dell'utente (2026-11-15) |
| Obiettivo finale | Gli agenti di Agentrica usabili come server MCP nei progetti di terzi; il sito li presenta | Scelta dell'utente (2026-11-15) |
| Fonte unica | I file di `agents/` sono il catalogo del prodotto: sito e server MCP li leggono dallo stesso pacchetto, nessuna copia dei testi | Scelta dell'utente (2026-11-15) |
| Architettura | Monorepo con npm workspaces: `packages/catalog` (TypeScript, legge `agents/`), `apps/site` (Next.js), `packages/mcp` in una fase futura | Scelta dell'utente (2026-11-15) |
| Sito | Next.js 16 con App Router: landing, `/reparti/[sigla]` e `/agenti/[id]` pre-generate al build con `generateStaticParams`; niente `output: export`, così restano possibili route server (es. un MCP remoto). Sostituisce Astro, usato in F0–F1 | Scelta dell'utente (2026-11-15, dopo F1) |
| Stili | Tailwind 4 con shadcn/ui (stile base-nova su Base UI, come gamoey); i token del tema scuro e gli accenti dei reparti diventano variabili del tema | Scelta dell'utente (2026-11-15) |
| Reparti | AIBPD Business & Product Development, AICA Cybersecurity, AIPCA Privacy & Compliance, AISA Software, AIWDA Web Design | Scelta dell'utente (2026-11-15) |
| Nomi degli agenti | Nome in codice di stella: sigla del reparto, numero del file di ruolo e stella in maiuscolo, es. «AISA-02 · ALTAIR». Il ruolo resta accanto al nome. Nessun nome di persona. Il direttore di AIBPD è ALDERAMIN (era CAPELLA fino a F1; il sito non era pubblicato) | Scelta dell'utente (2026-11-15) |
| Trasparenza | Il sito dice sempre che gli agenti sono IA; nessuna persona, cliente, risultato o recensione inventati | Contenuti onesti (CONVENTIONS §1) |
| Identità visiva | Tech scuro: fondo scuro, un colore d'accento per reparto, tipografia sans; contrasto WCAG AA | Scelta dell'utente (2026-11-15) |
| Lingua | Sito, documentazione, piani e convenzioni in italiano; sigle e titoli dei ruoli in inglese come nei file | Scelta dell'utente (2026-11-15) |
| Agenzie attive | Software e Web Design per costruire il sito; le altre tre sono il contenuto del prodotto e si attivano quando servono (Privacy e Cybersecurity con il server MCP e la pubblicazione) | Proposta F0 |
| Test | Unitari con `node --test` su `packages/catalog`; prove di fumo e accessibilità con Playwright e axe sul sito | Come nello starter |
| Rilascio | Solo in locale fino alla fase di pubblicazione; deploy solo dopo l'approvazione dell'utente | Predefinito di agentic-starter |
| Branch | `develop` per lo sviluppo, `main` per le versioni stabili; una fase = un branch `fase/fN-nome` | Predefinito di agentic-starter |
| Server MCP | Solo stdio locale; un prompt per agente (`aisa-02`, argomento `compito`) e i tool `elenca_agenti` e `agente`; SDK ufficiale a versione esatta; legge `agents/` da un percorso fisso, nessuna telemetria | Scelta dell'utente (2026-11-15, F5) |
| Vincoli per F7 | Prima di pubblicare: organizzazione npm `@agentrica` registrata; catalogo incluso nel pacchetto o a versione esatta (mai `*`); JavaScript compilato con `files` (solo dist, `agents/`, README) ed `engines`; pubblicazione con trusted publishing e provenance; `npm audit --omit=dev` e `npm audit signatures` nella CI di release; controllo del contenuto di `agents/` in CI (URL, blocchi di comandi, commenti HTML, Unicode invisibile, dimensione) e branch protection su `agents/`; scelta fra range transitivi, shrinkwrap o bundle | Revisione di sicurezza di F5 (`audit/2026-11-15-mcp/`), confermata dall'utente |
| Fase dei rilievi | F6 chiude i rilievi aperti da F0 a F5 prima della pubblicazione, che passa a F7; le regole nuove valgono anche per agentic-starter | Scelta dell'utente (2026-11-15) |
| Privacy dei trasporti | Un MCP remoto o qualsiasi telemetria richiedono una revisione privacy prima del design: Agentrica diventerebbe almeno responsabile del trattamento | Revisione privacy di F5 (PRIV-MCP-02), confermata dall'utente |

## Glossario

«Agentrica» (la società), «Reparto» (un'agenzia: AIBPD, AICA, AIPCA, AISA, AIWDA), «Agente» (un ruolo di un reparto), «Nome in codice» (es. AISA-02 · ALTAIR), «Direttore» (l'agente 01 di ogni reparto), «Biografia» (la pagina di un agente, ricavata dal suo file), «Catalogo» (i dati di reparti e agenti letti da `agents/`), «Pagina del reparto», «Pagina dell'agente».

## Fasi

| Fase | File | Contenuto | Stato |
|---|---|---|---|
| F0 | [00-base.md](00-base.md) | Monorepo, catalogo da `agents/` con nomi in codice, sito Astro vuoto, verify, CI, tokensave | completata |
| F1 | [01-landing.md](01-landing.md) | Landing di Agentrica: chi siamo, i cinque reparti, come lavoriamo, verso l'MCP | completata |
| F2 | [02-next.md](02-next.md) | Il sito passa da Astro a Next.js con Tailwind e shadcn: stessa landing, stesse prove; AIBPD-01 diventa ALDERAMIN | completata |
| F3 | [03-reparti.md](03-reparti.md) | Pagine dei reparti (`/reparti/[sigla]`): missione, regole comuni, flusso di lavoro, agenti del reparto; README dei reparti in forma comune | completata |
| F4 | [04-agenti.md](04-agenti.md) | Pagine degli agenti (`/agenti/[id]`): il file di ruolo così com'è, navigazione dalla squadra e fra agenti | completata |
| F5 | [05-mcp.md](05-mcp.md) | Server MCP (`packages/mcp`): ogni agente usabile come prompt e tool nei progetti, stdio locale; revisione di sicurezza e privacy | completata |
| F6 | [06-rilievi.md](06-rilievi.md) | Rilievi aperti da F0 a F5: CI al push, regole comuni di privacy, lingua, hero e ritocchi del sito, dipendenze | in corso |
| F7 | — | Pubblicazione del sito e del pacchetto | da fare |

Ordine: F0 → F7 in sequenza. I file di F3–F7 si scrivono all'apertura di ciascuna.
