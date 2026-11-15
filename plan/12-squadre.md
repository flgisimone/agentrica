# F12 — Squadre

**Obiettivo**: chi usa `@agentrica/mcp` carica solo gli agenti che gli servono, e ogni agente si comporta bene anche in un progetto vuoto. Nessun account, nessun dato personale, nessun cambio di infrastruttura del sito.

> **Stato: da aprire** (dopo F11). Scopo ridotto dall'utente il 2026-11-15.

**Agenzie**: software (Architect, Backend per `packages/mcp`, QA, Security, Code Reviewer); cybersecurity (AppSec) per l'argomento nuovo del server, che arriva dalla configurazione del client; design (UX Writer) per README e sezione MCP del sito.

## Situazione di partenza

- Server MCP `@agentrica/mcp` solo locale (stdio): 56 prompt e i tool `elenca_agenti` e `agente`, tutti sempre caricati.
- La sezione MCP del sito mostra il comando `npx -y @agentrica/mcp@<versione>` e la configurazione per un client.
- Pagine dei reparti e degli agenti con gli id (`aisa-02`) già stabili.

## Decisioni dell'utente (2026-11-15)

- Analisi business: idee valutate A configuratore di squadre, B preferiti, C agenti personalizzati, D MCP remoto con chiave personale, E proposte di miglioramento. Solo D richiede un account ed è un altro prodotto (area personale, [F15](15-area-personale.md), sospesa).
- Revisione del valore: F12 tiene **`--agents`** e la **regola per i progetti vuoti**. Il configuratore web, il conteggio `squad_copies` e le scorciatoie dalle pagine sono **rinviati**: un esempio nel README e nella sezione MCP basta. La **stima dei token** si mostra solo se una verifica prova che il risparmio esiste.

## Proposte da confermare all'apertura

- **Server**: argomento `--agents aisa-02,aiwda-08` (anche reparti interi, es. `--agents aisa`); senza argomento tutti gli agenti come oggi. Id sconosciuto: errore chiaro all'avvio. Anche `elenca_agenti` e `agente` vedono solo la squadra. Versione minore nuova (0.2.0).
- **Progetti vuoti (decisione dell'utente, 2026-11-15)**: la cornice comune di tutti gli agenti (`agentText` in `packages/mcp/src/prompt.ts`) aggiunge: «Se il progetto è vuoto o manca ciò che il tuo ruolo deve esaminare, dillo e proponi i primi passi (obiettivo, stack, struttura) da confermare con l'utente; non inventare rilievi né scegliere lo stack da solo». Oggi il server parte uguale in una cartella vuota (56 prompt, 2 tool, nessun file creato: prova del 2026-11-15), ma il comportamento dell'agente dipende dal modello.
- **Verifica dei token**: con un client reale (Claude Code) si misura se l'elenco dei 56 prompt entra nel contesto del modello all'avvio o resta solo nel menu dei comandi slash. Se non entra, il vantaggio di `--agents` è un menu più pulito, e così si descrive: nessun «risparmio di token» nei testi (CONVENTIONS §1).
- **Nome**: «Squadra» nel glossario (gli agenti scelti da un utente per il suo MCP).

## Backlog

| # | Task | Priorità |
|---|---|---|
| F12-01 | Regola per i progetti vuoti nella cornice degli agenti, test unitario e prova con un client in una cartella vuota | P1 |
| F12-02 | `packages/mcp`: argomento `--agents` con agenti e reparti, validazione, test | P1 |
| F12-03 | Revisione di sicurezza dell'argomento nuovo | P1 |
| F12-04 | Verifica dei token con un client reale; esito in questo file | P2 |
| F12-05 | README, pagina npm e sezione MCP del sito con un esempio di squadra; glossario | P2 |
| F12-06 | Prove: unitari, verify, e2e della sezione MCP; prova del pacchetto da tarball con una squadra | P1 |
| F12-07 | Rilascio 0.2.0 (CONVENTIONS §13.8), con l'approvazione dell'utente | P2 |

## Criteri di accettazione

- Con `--agents` il client vede solo i prompt della squadra; senza, tutti come in 0.1.0.
- Un id sconosciuto ferma il server con un messaggio che lo nomina.
- In una cartella vuota un agente dice che non c'è nulla da esaminare e propone i primi passi, senza rilievi inventati.
- I testi descrivono il vantaggio di `--agents` secondo l'esito della verifica dei token, niente di più.
- `npm run verify` e `npm run verify:e2e` verdi.
