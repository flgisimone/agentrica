# Tool e MCP

Slug: tool-e-mcp · Descrizione: Come un assistente usa strumenti esterni, e cosa standardizza il Model Context Protocol.

## In breve
Un [tool](glossario.md#tool) è un'azione che il modello può chiedere di eseguire: leggere un file, cercare nel codice, chiamare un servizio. [MCP](glossario.md#mcp) è uno standard aperto per offrire tool, e anche testi pronti, a qualsiasi assistente compatibile. Un [server MCP](glossario.md#mcp-server) è il programma che li offre.

## L'idea
Il modello, da solo, produce solo testo. Per agire gli serve un accordo con l'assistente: «se scrivo una richiesta in questa forma, tu esegui l'azione e mi rimandi il risultato». Ogni tool ha un nome, una descrizione in parole e lo schema dei suoi parametri. Il modello legge le descrizioni, sceglie il tool adatto, compila i parametri; l'assistente esegue e gli rimette il risultato nel contesto.

Per questo le descrizioni dei tool contano come un prompt: se dicono male a cosa serve un tool, il modello lo usa male o non lo usa.

Prima di MCP ogni assistente aveva il suo modo di collegare strumenti, e chi scriveva un'integrazione doveva rifarla per ognuno. Il Model Context Protocol fissa un modo comune. Le parti sono due:

- il **client**, cioè il tuo assistente (Claude Code, un editor, un'app di chat), che parla con il modello e con i server;
- il **server**, un programma che dichiara cosa offre: tool da eseguire, [prompt MCP](glossario.md#mcp-prompt) pronti da richiamare con un nome, risorse da leggere.

Un server può girare sul tuo computer, avviato dal client e collegato con l'ingresso e l'uscita standard del processo (si chiama trasporto stdio), oppure in rete. Un server locale vede quello che vede il tuo utente sul computer; uno in rete riceve i dati che gli mandi. In tutti e due i casi stai dando a un programma la possibilità di agire per conto del modello, quindi vale la pena sapere cosa fa ciascun tool e cosa manda fuori.

La specifica cambia nel tempo. Al 2026-11-19 la revisione corrente è la 2026-07-28, che rende il protocollo senza stato e cambia il modo in cui un server chiede dati all'utente durante una chiamata; la fonte è la [specifica MCP](https://modelcontextprotocol.io/specification). Gli SDK possono essere indietro rispetto alla specifica: quando costruisci un server, controlla quale revisione supporta il tuo.

## In Agentrica
Agentrica è un server MCP locale, solo stdio, scritto con l'SDK ufficiale, in [packages/mcp/src/server.ts](../../packages/mcp/src/server.ts). Offre un prompt per agente e alcuni tool:

- `list_agents` elenca gli agenti, `agent` restituisce il testo di un ruolo con il tuo compito, `library` le schede della biblioteca di un reparto, `check` controlla la forma dei file del piano;
- `rate_agent`, `share_usage` e `submit_project` mandano qualcosa al sito di Agentrica, e solo dopo un'anteprima e il tuo sì;
- con il pannello locale (fase F14), `ask_user` mostra una scelta nella pagina, `open_panel` ne dà l'indirizzo, `report` salva il resoconto di un agente.

Il README del pacchetto, [packages/mcp/README.md](../../packages/mcp/README.md), ha la tabella di cosa resta sul computer e cosa esce, tool per tool.

La biblioteca del reparto software tiene aggiornata la nozione sulla specifica: [agents/ai_software_agency/biblioteca/01-mcp-2026-07-28.md](../../agents/ai_software_agency/biblioteca/01-mcp-2026-07-28.md), con data di verifica e scadenza. Nella fase F23 il server ha usato per la prima volta una richiesta di dati all'utente durante una chiamata, per proporre la valutazione di un agente: è proprio il meccanismo che la revisione 2026-07-28 sostituisce.

Una proposta esterna chiedeva un tool che eseguisse catene di chiamate in un solo programma, per togliere dal contesto i risultati intermedi. Prima di costruirlo, la fase F45 ha misurato quanto spesso succede nelle sessioni reali: in [examples/risultati/2026-11-28-catene-tool.md](../../examples/risultati/2026-11-28-catene-tool.md) le catene lunghe sono in 4 sessioni su 42, sotto la soglia fissata. Il tool è rinviato finché i numeri non cambiano.

## Prova
Guarda quali server MCP ha il tuo assistente: in Claude Code il comando `/mcp` li elenca con i loro tool. Per ognuno chiediti: è locale o in rete? Cosa manda fuori?

Poi collega un server in un progetto di prova. Con Agentrica, nella cartella del progetto:

```sh
claude mcp add agentrica -- npx -y @agentrica/mcp
```

Apri una sessione e chiedi «elenca gli agenti di Agentrica». Guarda quale tool sceglie il modello e cosa gli torna indietro.

## Termini
- [Tool](glossario.md#tool)
- [MCP](glossario.md#mcp)
- [Server MCP](glossario.md#mcp-server)
- [Prompt MCP](glossario.md#mcp-prompt)
