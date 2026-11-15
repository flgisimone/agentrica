# Agentrica MCP

[English](README.en.md)

Il server MCP di Agentrica: i 56 agenti IA dei cinque reparti (AIBPD, AICA, AIPCA, AISA, AIWDA) usabili nel tuo progetto da Claude Code o da qualsiasi client MCP.

Ogni agente è un ruolo con un metodo e dei limiti dichiarati, per esempio `AISA-02 · ALTAIR`, Senior Software Architect, o `AIPCA-03 · DUBHE`, Senior Privacy Legal Specialist. Il server dà al modello le regole comuni del reparto e il file di ruolo dell'agente, presi da [`agents/`](https://github.com/flgisimone/agentrica/tree/main/agents), e il modello lavora nel tuo progetto con quelle istruzioni.

## Cosa fa e cosa non fa

- Il server gira solo in locale: lo avvia il client sul tuo computer e i due comunicano con stdio. Il server non ha una parte remota.
- Come contenuto legge solo i file di `agents/` inclusi nel pacchetto, una volta all'avvio. Il testo che arriva al modello è quello di quei file: puoi leggerlo prima di usarlo.
- Non scrive file, non apre connessioni di rete, non registra, non raccoglie e non invia dati, non ha telemetria.
- Non esegue niente nel tuo progetto. Dà soltanto istruzioni al modello: quello che il modello fa nel progetto dipende dal client e dai permessi che gli concedi.
- **Dove vanno i dati.** Il testo dell'agente, il compito e i file che il modello legge nel tuo progetto vanno al fornitore del modello attraverso il tuo client, secondo le condizioni di quel fornitore. Agentrica non li riceve. Nel compito non inserire dati personali, segreti o dati di clienti che non servono.
- Gli agenti sono IA: le loro conclusioni sono proposte da verificare. Gli agenti di privacy e sicurezza non sostituiscono un DPO, un avvocato o un responsabile della sicurezza, e i loro rilievi non sono una certificazione di conformità.

## Installazione

Serve Node 22 o successivo, con npm.

**Claude Code**, dalla cartella del tuo progetto:

```sh
claude mcp add agentrica -- npx -y @agentrica/mcp@0.1.0
```

Al primo avvio npx scarica il pacchetto da npm. La versione resta quella indicata finché non la cambi tu: un aggiornamento dei ruoli non arriva senza che tu lo scelga.

**Altri client MCP**: aggiungi il server alla configurazione del client, di solito un file JSON come questo:

```json
{
  "mcpServers": {
    "agentrica": {
      "command": "npx",
      "args": ["-y", "@agentrica/mcp@0.1.0"]
    }
  }
}
```

**Permessi minimi (consigliato).** Installa il pacchetto in una cartella sua e avvialo con il permission model di Node: il server può solo leggere quella cartella, e Node blocca scritture su file, connessioni di rete e processi figli. Il server non ne ha bisogno, quindi funziona uguale; i permessi limitano i danni di un eventuale difetto futuro.

```sh
npm install -g --ignore-scripts @agentrica/mcp@0.1.0
npm root -g
```

Con la cartella stampata da `npm root -g` al posto di `/cartella/globale`:

```sh
claude mcp add agentrica -- node --permission --allow-fs-read=/cartella/globale/@agentrica/mcp /cartella/globale/@agentrica/mcp/dist/mcp/src/server.js
```

**Provenienza.** Il pacchetto è pubblicato dalla CI del repository con provenance: su npm si vede da quale commit è stato costruito, e `npm audit signatures` nel tuo progetto ne verifica la firma.

**Da un clone**, per lavorare su Agentrica: `npm ci` nella root del repository, poi al posto del comando npx `node --permission --allow-fs-read=/percorso/di/agentrica /percorso/di/agentrica/packages/mcp/src/server.ts` (Node 26, come in `.nvmrc`).

## Uso

**Prompt.** Ogni agente è un prompt con il suo id in minuscolo (`aisa-02`, `aica-01`…) e un argomento facoltativo, `compito`. In Claude Code i prompt diventano comandi:

```
/mcp__agentrica__aisa-02 "Rivedi i confini fra i moduli di src/"
```

Metti il compito fra virgolette: Claude Code separa gli argomenti con gli spazi.

**Tool**, per i client che non mostrano i prompt, o quando vuoi che sia il modello a scegliere l'agente:

| Tool | Input | Cosa restituisce |
|---|---|---|
| `elenca_agenti` | `reparto` facoltativo (`AIBPD`, `AICA`, `AIPCA`, `AISA`, `AIWDA`) | id, nome in codice, ruolo e reparto di ogni agente |
| `agente` | `id` (es. `AISA-02`), `compito` facoltativo | le istruzioni complete dell'agente |

Per esempio: «Usa elenca_agenti, scegli l'agente di Agentrica adatto e verifica l'accessibilità del form di login».

Il numero 01 di ogni reparto è il direttore: coordina gli specialisti e consolida i loro rilievi.

I file degli agenti sono in italiano; l'agente risponde nella lingua in cui gli scrivi.

## Aggiornamenti

Il testo degli agenti viene dai file di `agents/` della versione installata. Per aggiornare cambia la versione nel comando (o reinstalla con `npm install -g`) e riavvia il client. Gli id e i nomi in codice non cambiano.

## Versioni

- **0.1.0**: prima versione pubblicata. 56 agenti in cinque reparti, un prompt per agente e i tool `elenca_agenti` e `agente`.

## Licenza

MIT. Agentrica è una società fittizia: gli agenti sono modelli di IA guidati da file di ruolo.
