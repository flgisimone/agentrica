# F29 — Verifica dei rilievi, valutazione e configurazione

**Obiettivo**: ricontrollare tutti i rilievi degli audit sul codice di oggi, rendere la valutazione degli agenti raggiungibile in ogni sessione e permettere di configurare Agentrica con un modulo invece che con i flag; correggere `install` su Windows e rilasciare.

> **Stato: da aprire** (piano scritto il 2026-11-19; l'implementazione parte dopo l'azzeramento del limite settimanale, sabato 2026-11-21). Le proposte qui sotto si confermano all'apertura.

**Agenzie**: software (Backend, QA, Security, Code Reviewer); privacy e cybersecurity per il file di configurazione (dato nuovo scritto sul PC dell'utente) e per la verifica dei rilievi; design (UX Writer) per i testi dei moduli.

## Analisi (2026-11-19)

1. **Valutazione mai chiesta.** Il modulo dell'elicitation parte solo al cambio d'agente (per il precedente) o dopo 30 minuti (`server.ts:138-198`): una sessione con un solo agente e più breve non lo mostra mai. Senza elicitation nel client resta il modello che dovrebbe proporre `rate_agent`, e può non farlo. Da verificare se l'estensione VS Code di Claude Code mostra i moduli (`elicitation.form`).
2. **Nessun comando.** In Claude Code i prompt MCP compaiono nella box dell'input come `/mcp__agentrica__<nome>`: oggi ci sono solo i prompt degli agenti, nessuno per valutare o configurare.
3. **Configurazione solo da flag.** `--agents`, `--panel`, `--no-ratings`, `--no-update-check` si scelgono con `add`/`install`; cambiarli vuol dire rilanciare il comando.
4. **Popup prima della sessione: non possibile.** Un server MCP non mostra nulla prima che il modello lo chiami e gli hook di Claude Code non fanno domande all'utente. Il punto più vicino è il modulo alla prima chiamata di Agentrica nella sessione.
5. **`install` su Windows** (0.7.0): `cmd /c ""npm" …"` col nome fra virgolette dà a `npm.cmd` un `%~dp0` uguale alla cartella corrente, e npm cerca `node_modules\npm\bin\npm-cli.js` nel progetto dell'utente. Corretto nel working tree (`cmdLine` senza virgolette sul nome, test aggiornato), da rilasciare.

## Decisioni (2026-11-19)

| Tema | Decisione |
|---|---|
| Configurazione | Salvata in un file, vale per le sessioni successive. Cambia la regola «il server non scrive file»: revisione privacy e cybersecurity prima del design |

## Backlog

Proposte da confermare all'apertura.

| # | Task | Ruoli |
|---|---|---|
| F29-01 | Verifica di tutti i rilievi di `audit/` sul codice di oggi (0.7.x): chiusi ancora veri, rischi accettati ancora validi (SEC09-F5-04: nuove versioni di typescript-eslint e ts-morph; PRIV-PUB-01), parte rinviata di SEC-ARCH-01; esito nei JSON e in un report | Security, privacy, cybersecurity |
| F29-02 | Rilascio della correzione di `install` su Windows (0.7.1), con prova su Windows se possibile; poi `mcp-publisher publish` nel registro MCP (0.7.0 pubblicata dall'utente il 2026-11-19, la 0.6.0 saltata) | Backend, QA, DevOps |
| F29-03 | Prompt `valuta` (`/mcp__agentrica__valuta`): apre il modulo di valutazione per l'agente in uso o per uno scelto; senza elicitation torna al flusso di `rate_agent` | Backend, UX Writer, QA |
| F29-04 | Modulo alla prima chiamata di Agentrica nella sessione (`agente`, `elenca_agenti`, prompt): se non c'è ancora una configurazione salvata, chiede squadra, pannello, valutazioni e controllo della versione | Backend, UX Writer, QA |
| F29-05 | Prompt `configura` (`/mcp__agentrica__configura`): lo stesso modulo, quando l'utente vuole cambiare | Backend, QA |
| F29-06 | File di configurazione: posizione (proposta `~/.agentrica/config.json`), precedenza flag > file, contenuto minimo senza dati personali, permessi, README e note legali | Backend, privacy, cybersecurity |
| F29-07 | Verifica dell'elicitation nei client: Claude Code da terminale e in VS Code | QA |

## Criteri di accettazione (proposte)

- In una sessione con un solo agente l'utente può valutarlo dal comando `/mcp__agentrica__valuta`.
- Alla prima chiamata senza configurazione compare il modulo; la scelta vale anche nella sessione successiva; i flag di `add`/`install` hanno la precedenza.
- `npx -y @agentrica/mcp@0.7.1 install` funziona da PowerShell in una cartella con `node_modules`.
- Ogni rilievo di `audit/` ha un esito ricontrollato con data.
