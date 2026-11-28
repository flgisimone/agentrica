# Dagli assistenti agli agenti

Slug: dagli-assistenti-agli-agenti · Descrizione: Cosa cambia quando il modello non si limita a rispondere ma legge file, esegue comandi e controlla il risultato.

## In breve
Un [agente](glossario.md#agent) è un modello che lavora a ciclo: decide un'azione, la esegue con uno strumento, guarda il risultato e decide la prossima. Gli [assistenti di codice](glossario.md#coding-assistant) di oggi funzionano così. Più autonomia vuol dire più lavoro fatto e più cose da controllare.

## L'idea
In una chat semplice tu chiedi, il modello risponde, e sei tu a copiare il codice nel progetto e a provarlo. Un agente fa quei passaggi da solo. Gli chiedi «il test di `orders.ts` fallisce, trova il motivo e correggilo», e lui:

1. legge il test e il file;
2. esegue il test e legge l'errore;
3. modifica il codice;
4. riesegue il test;
5. se fallisce ancora, torna al punto 1 con quello che ha imparato.

Il modello è lo stesso della chat. Cambiano due cose: ha degli strumenti per agire (leggere, scrivere, eseguire comandi), che vedrai nella lezione su [tool e MCP](05-mcp.md), e un ciclo che gli rimanda i risultati delle azioni come nuovo contesto.

Questo porta vantaggi chiari: l'agente verifica il suo lavoro invece di immaginarlo, e risolve compiti in più passi senza che tu faccia da tramite. Porta anche rischi nuovi. Un comando sbagliato non resta un suggerimento sullo schermo: viene eseguito. Per questo gli assistenti chiedono il permesso prima delle azioni che contano, e tu puoi decidere quali azioni approvare una volta per tutte e quali volta per volta.

Due strumenti in più rendono gli agenti più affidabili.

- **Sotto-agenti.** Un agente può affidare una parte del lavoro a un altro agente con un contesto suo, pulito, e ricevere solo il risultato. In Claude Code si chiamano [subagent](glossario.md#subagent). Utile per una ricerca larga che riempirebbe il contesto principale; caro, perché ogni sotto-agente parte da zero e rilegge quello che gli serve.
- **Agganci.** Un [hook](glossario.md#hook) è un comando che l'assistente esegue da solo in un momento preciso, per esempio a ogni tua richiesta o dopo ogni modifica a un file. Non dipende dal modello: succede sempre.

E una regola di fondo: quello che si può controllare con un programma va controllato con un programma. Un [controllo deterministico](glossario.md#deterministic-check), come un test o un validatore di formato, dà sempre la stessa risposta allo stesso ingresso. Il modello no. L'agente migliore usa il modello per capire e decidere, e i controlli per verificare.

## In AIgentrica
Gli agenti di AIgentrica sono ruoli che il tuo assistente assume: il server dà il testo del ruolo, il tuo assistente lavora con i suoi strumenti. I ruoli esistono anche come subagent di Claude Code, per esempio [.claude/agents/software/sw-architect.md](../../.claude/agents/software/sw-architect.md), un file breve che rimanda al file di ruolo. Il progetto li avvia solo quando li chiedi: le regole in [AGENTS.md](../../AGENTS.md) li chiamano «la voce più cara».

Un problema reale: le istruzioni del server arrivano solo all'avvio, e dopo qualche richiesta il modello tendeva a lavorare da solo, senza caricare gli agenti. La fase F39 l'ha risolto con un hook: il comando `init` scrive in `.claude/settings.json` del tuo progetto un promemoria che Claude Code aggiunge a ogni richiesta. Il codice è in [packages/mcp/src/init.ts](../../packages/mcp/src/init.ts), la fase in [plan/39-promemoria-agenti.md](../../plan/39-promemoria-agenti.md).

E un esempio di controllo deterministico: dalla fase F42 il server verifica la forma dei file del piano e degli audit senza chiedere niente a un modello, in [packages/mcp/src/check.ts](../../packages/mcp/src/check.ts). Lo stesso controllo è un tool, `check`, che l'agente chiama dopo aver scritto quei file: se una tabella è malformata lo sa subito, invece di sperare che il modello se ne accorga.

## Prova
Dai al tuo assistente un compito che richiede più passi e guardalo lavorare, senza intervenire. Per esempio:

```text
Esegui i test del progetto. Se qualcuno fallisce, trova la causa e proponi
la correzione più piccola, ma non modificare niente prima di avermela mostrata.
```

Mentre lavora, conta le azioni: quante letture, quanti comandi, quante volte ricontrolla. Poi guarda le impostazioni dei permessi del tuo assistente e decidi quali comandi approvare sempre (per esempio i test) e quali vuoi vedere ogni volta (per esempio quelli che cancellano o pubblicano).

## Termini
- [Agente](glossario.md#agent)
- [Assistente di codice](glossario.md#coding-assistant)
- [Subagent](glossario.md#subagent)
- [Hook](glossario.md#hook)
- [Controllo deterministico](glossario.md#deterministic-check)
