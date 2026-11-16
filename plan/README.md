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
| Identità visiva | Da F9 torna il «tech scuro» di F0–F6 (fondo #0b1020, accenti luminosi per reparto), con Inter e JetBrains Mono di F7; contrasto WCAG AA. Il corporate chiaro di F7–F8 resta nella storia di git | Scelta dell'utente (2026-11-15, dopo F8) |
| Lingua | Sito, documentazione, piani e convenzioni in italiano; sigle e titoli dei ruoli in inglese come nei file. Da F11 API e identificatori del codice nuovo in inglese (CONVENTIONS §3) | Scelta dell'utente (2026-11-15; regola del codice in F11) |
| Agenzie attive | Software e Web Design per costruire il sito; le altre tre sono il contenuto del prodotto e si attivano quando servono (Privacy e Cybersecurity con il server MCP e la pubblicazione) | Proposta F0 |
| Test | Unitari con `node --test` su `packages/catalog`; prove di fumo e accessibilità con Playwright e axe sul sito | Come nello starter |
| Rilascio | Solo in locale fino alla fase di pubblicazione; deploy solo dopo l'approvazione dell'utente | Predefinito di agentic-starter |
| Branch | `develop` per lo sviluppo, `main` per le versioni stabili; una fase = un branch `fase/fN-nome` | Predefinito di agentic-starter |
| Squadre | Da 0.2.0 `--agents` con id di agenti e sigle di reparti (senza, tutti); un nome sconosciuto ferma il server; i tool vedono solo la squadra. In Claude Code i prompt non entrano nel contesto: il vantaggio è un menu più corto, non un risparmio di token | Scelta dell'utente (2026-11-15, F12) |
| Server MCP | Solo stdio locale; un prompt per agente (`aisa-02`, argomento `compito`) e i tool `elenca_agenti` e `agente`; SDK ufficiale a versione esatta; legge `agents/` da un percorso fisso, nessuna telemetria | Scelta dell'utente (2026-11-15, F5) |
| Vincoli per la pubblicazione | Prima di pubblicare: organizzazione npm `@agentrica` registrata; catalogo incluso nel pacchetto o a versione esatta (mai `*`); JavaScript compilato con `files` (solo dist, `agents/`, README) ed `engines`; pubblicazione con trusted publishing e provenance; `npm audit --omit=dev` e `npm audit signatures` nella CI di release; controllo del contenuto di `agents/` in CI (URL, blocchi di comandi, commenti HTML, Unicode invisibile, dimensione) e branch protection su `agents/`; scelta fra range transitivi, shrinkwrap o bundle | Revisione di sicurezza di F5 (`audit/2026-11-15-mcp/`), confermata dall'utente |
| Fasi F7–F10 | F7 identità corporate, F8 sezioni, F9 simboli e tema scuro, F10 pubblicazione | Scelta dell'utente (2026-11-15, dopo F6; F9 aggiunta dopo F8) |
| Simboli | Da F9 ogni agente ha un glifo SVG calcolato dal nome della sua stella (stesso nome, stesso disegno), nello stile comune e nell'accento del reparto; sostituisce i ritratti generati con IA di F7 | Scelta dell'utente (2026-11-15, dopo F8) |
| Fase dei rilievi | F6 chiude i rilievi aperti da F0 a F5 prima della pubblicazione (oggi F10); le regole nuove valgono anche per agentic-starter | Scelta dell'utente (2026-11-15) |
| Licenza | MIT per codice e file degli agenti; titolare del sito e del pacchetto Giulio Simone Floresta, contatto con le issue di GitHub | Scelta dell'utente (2026-11-15, F10) |
| Pubblicazione | Repository pubblico; `@agentrica/mcp` compilato con tsc, catalogo e `agents/` inclusi, SDK e zod a versione esatta, Node ≥ 22, `npx -y @agentrica/mcp@<versione>`; rilascio da tag `v*` su `main` con trusted publishing e provenance; sito su Vercel con dominio `*.vercel.app`, CSP e HSTS, pagina `/note-legali` | Scelta dell'utente (2026-11-15, F10) |
| Monitoraggio | Download npm (e stelle di GitHub) con `npm run stats` da terminale (F11); analytics delle pagine e conteggio delle squadre rinviati; nessuna telemetria nell'MCP. | Scelta dell'utente (2026-11-15, revisione del valore) |
| Pannello locale | F14: pagina servita in locale (`127.0.0.1`) con fasi, backlog, rilievi, agenti in uso e scelte da prendere dalla pagina invece che dal terminale; senza account né dati verso Agentrica. Da 0.3.0: flag `--panel` del server MCP (ponte nell'MCP, niente Agent SDK), tool `open_panel` e `ask_user`, formato di `plan/` e `audit/` di oggi documentato nel README del pacchetto. Da F16 in tre pagine: Sessione, Piano, Rilievi | Scelta dell'utente (2026-11-15, revisione del valore e apertura di F14) |
| Revisione del valore | F11 ridotta ai download npm, F12 a `--agents` e progetti vuoti, F14 confermato con le scelte dalla pagina, area personale sospesa; nuova F13 su prove degli agenti e distribuzione, che portano più valore delle funzioni del sito | Scelta dell'utente (2026-11-15) |
| Area personale | Eliminata (era F16, sospesa dal 2026-11-15): account, accesso Google + TOTP e pannello `/admin` non hanno uno scopo per gli utenti. Il file resta nella storia di git; si riparte da capo se serve un MCP remoto | Scelta dell'utente (2026-11-16) |
| Privacy dei trasporti | Un MCP remoto o qualsiasi telemetria richiedono una revisione privacy prima del design: Agentrica diventerebbe almeno responsabile del trattamento | Revisione privacy di F5 (PRIV-MCP-02), confermata dall'utente |

## Glossario

«Agentrica» (la società), «Reparto» (un'agenzia: AIBPD, AICA, AIPCA, AISA, AIWDA), «Agente» (un ruolo di un reparto), «Nome in codice» (es. AISA-02 · ALTAIR), «Direttore» (l'agente 01 di ogni reparto), «Biografia» (la pagina di un agente, ricavata dal suo file), «Catalogo» (i dati di reparti e agenti letti da `agents/`), «Pagina del reparto», «Pagina dell'agente», «Squadra» (gli agenti scelti da un utente per il suo MCP con `--agents`).

## Fasi

| Fase | File | Contenuto | Stato |
|---|---|---|---|
| F0 | [00-base.md](00-base.md) | Monorepo, catalogo da `agents/` con nomi in codice, sito Astro vuoto, verify, CI, tokensave | completata |
| F1 | [01-landing.md](01-landing.md) | Landing di Agentrica: chi siamo, i cinque reparti, come lavoriamo, verso l'MCP | completata |
| F2 | [02-next.md](02-next.md) | Il sito passa da Astro a Next.js con Tailwind e shadcn: stessa landing, stesse prove; AIBPD-01 diventa ALDERAMIN | completata |
| F3 | [03-reparti.md](03-reparti.md) | Pagine dei reparti (`/reparti/[sigla]`): missione, regole comuni, flusso di lavoro, agenti del reparto; README dei reparti in forma comune | completata |
| F4 | [04-agenti.md](04-agenti.md) | Pagine degli agenti (`/agenti/[id]`): il file di ruolo così com'è, navigazione dalla squadra e fra agenti | completata |
| F5 | [05-mcp.md](05-mcp.md) | Server MCP (`packages/mcp`): ogni agente usabile come prompt e tool nei progetti, stdio locale; revisione di sicurezza e privacy | completata |
| F6 | [06-rilievi.md](06-rilievi.md) | Rilievi aperti da F0 a F5: CI al push, regole comuni di privacy, lingua, hero e ritocchi del sito, dipendenze | completata |
| F7 | [07-identita.md](07-identita.md) | Identità corporate: palette dai ritratti (anteprima da confermare), header con menu, sfondo animato, transizioni, card senza accordion, volti degli agenti | completata |
| F8 | [08-sezioni.md](08-sezioni.md) | Sezioni: simulazione di sviluppo in «Come lavoriamo», sezione del server MCP con dimostrazione e uso locale | completata |
| F9 | [09-simboli.md](09-simboli.md) | Ritorno al tema scuro; un glifo SVG generato per ogni stella al posto dei volti | completata |
| F10 | [10-pubblicazione.md](10-pubblicazione.md) | Pubblicazione del sito e del pacchetto (vincoli in «Vincoli per la pubblicazione») | completata |
| F11 | [11-analytics.md](11-analytics.md) | Statistiche: `npm run stats` con i download npm; analytics delle pagine rinviati | completata |
| F12 | [12-squadre.md](12-squadre.md) | Squadre: `--agents` nell'MCP, regola per i progetti vuoti, verifica dei token | completata |
| F13 | [13-prove-distribuzione.md](13-prove-distribuzione.md) | Prove e distribuzione: casi di prova ripetibili degli agenti, correzione dei ruoli, registri MCP | completata |
| F14 | [14-pannello.md](14-pannello.md) | Pannello locale su localhost: fasi, backlog, rilievi, agenti in uso e scelte da prendere dalla pagina | completata |
| F15 | [15-rilievi.md](15-rilievi.md) | Rilievi aperti da F5 a F14: audit di F5, prove degli agenti, ritocchi del sito e dell'MCP, rilascio 0.3.1 | completata |
| F16 | [16-pannello.md](16-pannello.md) | Pannello multipagina (Sessione, Piano, Rilievi), area personale eliminata, pulizia, metodo a fasi in CONVENTIONS | completata |
| F17 | [17-sito-privato.md](17-sito-privato.md) | Sito in un repository privato, separato dal pacchetto; questo repository resta pubblico | da aprire |

Ordine: F0 → F17 in sequenza.
