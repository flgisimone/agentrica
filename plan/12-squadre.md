# F12 — Squadre

**Obiettivo**: chi usa `@agentrica/mcp` carica solo gli agenti che gli servono, e ogni agente si comporta bene anche in un progetto vuoto. Nessun account, nessun dato personale, nessun cambio di infrastruttura del sito.

> **Stato: completata** (2026-11-15). Codice in `develop` con versione 0.2.0; il rilascio npm (F12-07) segue la chiusura, con l'approvazione dell'utente.

**Agenzie**: software (Architect, Backend per `packages/mcp`, QA, Security, Code Reviewer); cybersecurity (AppSec) per l'argomento nuovo del server, che arriva dalla configurazione del client; design (UX Writer) per README e sezione MCP del sito.

## Situazione di partenza

- Server MCP `@agentrica/mcp` solo locale (stdio): 56 prompt e i tool `elenca_agenti` e `agente`, tutti sempre caricati.
- La sezione MCP del sito mostra il comando `npx -y @agentrica/mcp@<versione>` e la configurazione per un client.
- Pagine dei reparti e degli agenti con gli id (`aisa-02`) già stabili.

## Decisioni dell'utente (2026-11-15)

- Analisi business: idee valutate A configuratore di squadre, B preferiti, C agenti personalizzati, D MCP remoto con chiave personale, E proposte di miglioramento. Solo D richiede un account ed è un altro prodotto (area personale, [F15](15-area-personale.md), sospesa).
- Revisione del valore: F12 tiene **`--agents`** e la **regola per i progetti vuoti**. Il configuratore web, il conteggio `squad_copies` e le scorciatoie dalle pagine sono **rinviati**: un esempio nel README e nella sezione MCP basta. La **stima dei token** si mostra solo se una verifica prova che il risparmio esiste.

## Proposte confermate all'apertura (2026-11-15)

L'utente ha confermato tutte e quattro le proposte così come sono scritte; la verifica dei token l'ha fatta lui in Claude Code.

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

## Fatto

- **F12-01** Regola per i progetti vuoti in `agentText` (`packages/mcp/src/prompt.ts`), prima delle regole del reparto; test unitario su tutti i 56 agenti. Prova dell'utente in Claude Code in una cartella vuota con `/mcp__agentrica__aisa-02 "Rivedi l'architettura del progetto"`: ALTAIR dice che non c'è un progetto, nessun rilievo, propone obiettivo, vincoli e scala da confermare e «non scelgo lo stack al posto tuo».
- **F12-02** `selectSquad` in `prompt.ts` (agenti e reparti, maiuscole indifferenti, ordine del catalogo, niente doppioni) e `--agents` in `server.ts` con `parseArgs` di `node:util` (opzioni sconosciute e argomenti posizionali rifiutati). Prompt, `elenca_agenti` (anche l'enum di `reparto`), `agente` e le istruzioni del server vedono solo la squadra. Versione 0.2.0 in `package.json` e `VERSION`.
- **F12-03** Revisione di sicurezza (AppSec, nella sessione): il valore viene dalla configurazione del client, anche da un `.mcp.json` di un repository clonato; non tocca percorsi, non si esegue e può solo ridurre gli agenti. Rilievo corretto: i messaggi di `parseArgs` riportano l'argomento così com'è, quindi `fail()` trasforma i caratteri di controllo in `\uXXXX` (riga unica nei log del client); i nomi sconosciuti sono fra virgolette.
- **F12-04** Verifica dei token in Claude Code 2.1.325 (Opus 5.5) con `/context`, cartella vuota, server locale: con 56 agenti e con `--agents aisa-02` stessi numeri (35k in tutto, MCP tools 4.6k, istruzioni MCP 1.7k, anche di altri server dell'utente). Nessuna voce per i prompt: restano nel menu dei comandi. Esito: `--agents` dà un menu più corto, **non** un risparmio di token, e così lo dicono i testi.
- **F12-05** README del pacchetto (italiano e inglese) con la sezione «Squadra», l'esito della verifica e la voce 0.2.0 in «Versioni»; comandi a 0.2.0; sezione MCP del sito con il passo «2. Se vuoi, scegli la squadra» e `mcp.squad` in `lib/scripts.ts` (uguale al README, lo controlla `scripts.test.ts`); «Squadra» nel glossario.
- **F12-06** Test del server con un client vero: squadra `aiwda,aisa-02` (11 prompt, tool ridotti), id sconosciuto, `--agents=` vuoto, opzione sconosciuta, caratteri di controllo. E2e della sezione MCP con il comando della squadra. Prova da tarball (`npm pack`, 75 file, installazione con `--ignore-scripts`): `--agents aica,aisa-02` dà 13 prompt, versione 0.2.0, regola presente, stderr vuoto, nessun file nella cartella; `--agents nope` esce con codice 1 e un messaggio che lo nomina.

## Verifiche

- `npm run verify`: verde, 49 test.
- `npm run verify:e2e`: 59 superati, 1 saltato.
- Code Reviewer sul diff: APPROVE.
- Non fatto: controllo a vista della sezione MCP con `npm run dev` (coperta dall'e2e sul testo, non sull'aspetto).

## Rilievi aperti

- **F12-07** Rilascio 0.2.0 (CONVENTIONS §13.8): PR `develop` → `main`, tag `v0.2.0`, pubblicazione dalla CI con provenance. Fino al rilascio README e sito in `develop` citano una versione non ancora su npm. Risolto: 0.2.0 rilasciata su npm.
- P3: nelle squadre il campo `director` di un reparto filtrato può indicare un agente fuori squadra; l'MCP non lo usa, ma un uso futuro dovrà tenerne conto.
