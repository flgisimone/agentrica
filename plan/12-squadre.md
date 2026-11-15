# F12 — Squadre

**Obiettivo**: chi usa `@agentrica/mcp` sceglie nel sito gli agenti che gli servono e ottiene la configurazione MCP pronta da incollare; il server espone solo quegli agenti. Nessun account, nessun dato personale.

> **Stato: da aprire** (dopo F11). Scopo deciso con l'analisi business del 2026-11-15.

**Agenzie**: business (Product Manager) per criteri di successo; design (UX Designer, UI Designer, UX Writer, Accessibility) prima e dopo; software (Architect, Backend per `packages/mcp`, Frontend, QA, Security, Code Reviewer); cybersecurity (AppSec) per l'argomento nuovo del server, che arriva dalla configurazione del client.

## Situazione di partenza

- Server MCP `@agentrica/mcp` solo locale (stdio): 56 prompt e i tool `elenca_agenti` e `agente`, tutti sempre caricati.
- La sezione MCP del sito mostra il comando `npx -y @agentrica/mcp@<versione>` e la configurazione per un client.
- Pagine dei reparti e degli agenti con gli id (`aisa-02`) già stabili.

## Analisi business (2026-11-15)

Idee valutate: A configuratore di squadre, B preferiti, C agenti personalizzati, D MCP remoto con chiave personale, E proposte di miglioramento. Solo D richiede un account ed è un cambio di prodotto (servizio ospitato, costi, Vercel Pro per il DPA, revisioni privacy e cybersecurity). A dà il valore più alto senza account: oggi il client carica tutti i 56 prompt.

**Decisione dell'utente**: F12 fa solo A. L'area personale con account (D) è la fase [F13](13-area-personale.md), da aprire solo con un obiettivo misurabile, per esempio dagli analytics di F11.

## Proposte da confermare all'apertura

- **Server**: argomento `--agents aisa-02,aiwda-08` (anche reparti interi, es. `--agents aisa`); senza argomento tutti gli agenti come oggi. Id sconosciuto: errore chiaro all'avvio. Anche `elenca_agenti` e `agente` vedono solo la squadra. Versione minore nuova (0.2.0).
- **Sito**: pagina `/squadre` (o sezione nella pagina MCP) con la scelta di agenti e reparti; la squadra vive nell'URL (`?agents=…`), così si condivide con un link; niente `localStorage` né server. Configurazione generata per i client più comuni, con pulsante di copia.
- **Token (decisione dell'utente, 2026-11-15)**: il configuratore mostra una stima dei token che l'MCP mette nel contesto del modello: all'avvio (elenco di prompt e tool) per la squadra contro tutti i 56 agenti, il risparmio, e il peso del file di ruolo di ogni agente. Calcolata al build dal catalogo, indicata come «circa». Il consumo reale dei token lo conosce solo il client dell'utente (il protocollo MCP non lo passa al server): non si mostra e non si raccoglie. Niente tool di conteggio nell'MCP né invio di dati.
- **Stima**: euristica caratteri/4 o simile, senza chiamate esterne (`ponytail:` passare a un conteggio esatto se Anthropic pubblica un tokenizer locale); da confrontare una volta con il conteggio reale di un client per tarare l'errore.
- **Conteggio delle squadre (decisione dell'utente, 2026-11-15)**: quando si copia la configurazione, il sito invia con `sendBeacon` a `POST /api/squad-copies` gli id degli agenti scelti; la route li valida sul catalogo e incrementa `squad_copies (day, agent_id, count)`. Stessa infrastruttura e stesse regole di F11: niente IP, user agent o identificativi, nessun dato personale. È il segnale «quali agenti interessano» per il pannello admin; l'MCP resta senza telemetria.
- **Progetti vuoti (decisione dell'utente, 2026-11-15)**: la cornice comune di tutti gli agenti (`agentText` in `packages/mcp/src/prompt.ts`) aggiunge: «Se il progetto è vuoto o manca ciò che il tuo ruolo deve esaminare, dillo e proponi i primi passi (obiettivo, stack, struttura) da confermare con l'utente; non inventare rilievi né scegliere lo stack da solo». Oggi il server parte uguale in una cartella vuota (56 prompt, 2 tool, nessun file creato: prova del 2026-11-15), ma il comportamento dell'agente dipende dal modello.
- **Scorciatoie**: dalla pagina di un agente o di un reparto, «Aggiungi alla squadra».
- **Nome**: «Squadre» nel menu e nel glossario («Squadra»: gli agenti scelti da un utente per il suo MCP).

## Backlog

| # | Task | Priorità |
|---|---|---|
| F12-01 | Design del configuratore: flusso, stati (vuoto, squadra, copia), testi, accessibilità | P1 |
| F12-02 | `packages/mcp`: argomento `--agents` con agenti e reparti, validazione, test | P1 |
| F12-03 | Revisione di sicurezza dell'argomento nuovo | P1 |
| F12-04 | Sito: pagina del configuratore con squadra nell'URL e configurazione da copiare | P1 |
| F12-05 | Stima dei token al build (`packages/catalog` o script del sito), test, e risparmio mostrato nel configuratore | P2 |
| F12-06 | Conteggio aggregato degli agenti nelle squadre copiate (`squad_copies`), con test; lettura nello script di F11 | P2 |
| F12-07 | Collegamenti dalle pagine di agenti e reparti | P2 |
| F12-08 | README e pagina npm con l'argomento nuovo; glossario | P2 |
| F12-09 | Prove: unitari, e2e e axe del configuratore; prova del pacchetto da tarball con una squadra | P1 |
| F12-10 | Regola per i progetti vuoti nella cornice degli agenti, test unitario e prova con un client in una cartella vuota | P2 |
| F12-11 | Rilascio 0.2.0 (CONVENTIONS §13.8), con l'approvazione dell'utente | P2 |

## Criteri di accettazione

- Una squadra si configura in meno di un minuto e la configurazione copiata funziona in un client senza modifiche.
- Con `--agents` il client vede solo i prompt della squadra; senza, tutti come in 0.1.0.
- Un id sconosciuto ferma il server con un messaggio che lo nomina.
- Il configuratore mostra token stimati della squadra, di tutti gli agenti e il risparmio, dichiarati come stima; la stima resta entro un errore noto rispetto al conteggio di un client.
- La squadra si riapre dal link; nulla salvato nel browser; sul server solo i conteggi aggregati di `squad_copies`, senza dati personali.
- In una cartella vuota un agente dice che non c'è nulla da esaminare e propone i primi passi, senza rilievi inventati.
- `npm run verify` e `npm run verify:e2e` verdi.
