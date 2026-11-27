# Casi di prova degli agenti

Progetti piccoli con difetti noti, per vedere se un agente di Agentrica li trova e se inventa rilievi. Ogni caso ha un progetto, un agente, un compito e l'elenco dei difetti attesi.

Sono una prova interna: servono a confrontare modelli, livelli di ragionamento (effort) e versioni dei file di ruolo sugli stessi casi, prima di cambiare il modello consigliato di un agente o il suo testo (F24).

| Caso | Agente | Progetto |
|---|---|---|
| [aisa-09-api-note](casi/aisa-09-api-note.md) | AISA-09 · REGULUS, Application Security | [api-note](progetti/api-note/) |
| [aiwda-08-form-iscrizione](casi/aiwda-08-form-iscrizione.md) | AIWDA-08 · GACRUX, Accessibility | [form-iscrizione](progetti/form-iscrizione/) |
| [aipca-02-prenotazioni-palestra](casi/aipca-02-prenotazioni-palestra.md) | AIPCA-02 · ALIOTH, GDPR | [prenotazioni-palestra](progetti/prenotazioni-palestra/) |
| [aisa-09-api-fatture](casi/aisa-09-api-fatture.md) | AISA-09 · REGULUS, Application Security | [api-fatture](progetti/api-fatture/) |
| [aibpd-05-requisiti-abbonamenti](casi/aibpd-05-requisiti-abbonamenti.md) | AIBPD-05 · ALGIEBA, Business Analyst | [requisiti-abbonamenti](progetti/requisiti-abbonamenti/) |
| [aica-04-config-deploy](casi/aica-04-config-deploy.md) | AICA-04 · ALNILAM, Cloud Security | [config-deploy](progetti/config-deploy/) |
| [aisa-08-calcolo-sconti](casi/aisa-08-calcolo-sconti.md) | AISA-08 · DENEB, QA | [calcolo-sconti](progetti/calcolo-sconti/) |
| [aica-portale-ordini](casi/aica-portale-ordini.md) | AICA-03, 05, 06, 07, 09 (un compito ciascuno) | [portale-ordini](progetti/portale-ordini/) |
| [aipca-scuola-lingue](casi/aipca-scuola-lingue.md) | AIPCA-05, 06, 07, 08 (un compito ciascuno) | [scuola-lingue](progetti/scuola-lingue/) |
| [aisa-gestionale-magazzino](casi/aisa-gestionale-magazzino.md) | AISA-04, 05, 07, 10, 11 (un compito ciascuno) | [gestionale-magazzino](progetti/gestionale-magazzino/) |
| [aibpd-turnio](casi/aibpd-turnio.md) | AIBPD-02, 03, 04, 06–12 (un compito ciascuno) | [turnio](progetti/turnio/) |
| [orchestrazione-newsletter](casi/orchestrazione-newsletter.md) | tutti, scelti dal modello | progetto nuovo creato con `init` |

I progetti sono difettosi di proposito: non usarli come modello e non metterli in rete.

## Come si esegue un caso

1. Dalla root del repository, copia il progetto fuori dal repository, così l'agente non legge l'elenco dei difetti:

   ```sh
   D=$(mktemp -d) && cp -R examples/progetti/api-note/. "$D" && cd "$D"
   ```

2. Configura il server con il solo agente del caso, alla versione pubblicata:

   ```sh
   cat > .mcp.json <<'EOF'
   { "mcpServers": { "agentrica": { "command": "npx", "args": ["-y", "@agentrica/mcp@0.3.1", "--agents", "aisa-09"] } } }
   EOF
   ```

3. Apri il client nella cartella (`claude` da terminale, oppure la cartella in VS Code con l'estensione di Claude Code), approva il server del progetto e lancia il prompt con il compito della scheda:

   ```text
   /mcp__agentrica__aisa-09 "<compito della scheda>"
   ```

4. Se l'agente propone di correggere, rispondi di no: si valuta solo il rapporto.
5. Salva l'output intero in `risultati/<data>-<caso>.md` con data, versione del pacchetto, client e modello.

## Confronto di modelli (F24)

Per confrontare configurazioni si esegue ogni caso almeno due volte per configurazione, con lo stesso testo dell'agente e una copia nuova del progetto per ogni esecuzione.

1. Il testo dell'agente, con il compito della scheda, è quello che dà il server MCP:

   ```sh
   npm run -s agent-text -- aisa-09 "<compito della scheda>" > istruzioni.md
   ```

2. In Claude Code un subagent per esecuzione riceve quel testo (dal file, fuori dalla copia del progetto), il percorso della copia e il modello e l'effort della configurazione (`model` ed `effort` del tool Agent). Il subagent non ha il server MCP: al posto del tool `library` citato nel testo gli si dà il comando che stampa le stesse schede, `npm run -s agent-text -- <id> --cards <scheda,scheda>`, da lanciare nella radice di questo repository. Deve lavorare solo nella copia, non correggere nulla e restituire il rapporto intero come risposta, senza scriverlo in un file: scritto in un file perde spesso la firma con il nome in codice. Si lanciano gruppi di al più 7 esecuzioni e si salvano i rapporti prima del gruppo successivo, così il limite delle cinque ore ferma al più un gruppo.
3. I token di ogni esecuzione si leggono dal file del subagent in `~/.claude/projects/<progetto>/<sessione>/subagents/`, una volta per `requestId` (Claude Code scrive una riga per blocco con lo stesso `usage`): ingresso, cache letta e scritta, uscita, ragionamento.
4. Il conteggio lo fa un valutatore unico con le stesse istruzioni per tutte le configurazioni, sulle regole qui sotto; chi esegue la prova ne controlla un campione. Con molti ruoli (F37) si usa un valutatore per ruolo, con istruzioni identiche, e i rapporti gli arrivano con nomi anonimi. Perché l'anonimato regga, le copie non devono avere il modello nel nome (`<ruolo>-<n>` invece di `<ruolo>-<modello>-<n>`): i rapporti citano spesso il percorso della copia, e quelli su un modello più piccolo lo dicono applicando la regola di riesame.
5. Chi esegue la prova salva ogni rapporto restituito in `risultati/<data>-<descrizione>/`. Il risultato va in `risultati/<data>-<descrizione>.md` con data, versione del pacchetto, client, modello ed effort di ogni configurazione, conteggi per esecuzione, token per esecuzione e osservazioni. Il primo è [2026-11-19-modelli.md](risultati/2026-11-19-modelli.md); la prima ondata di F37 è [2026-11-23-ondata-1.md](risultati/2026-11-23-ondata-1.md), la seconda (business, F49) [2026-11-27-ondata-2.md](risultati/2026-11-27-ondata-2.md).

La soglia per consigliare un modello più piccolo (decisa in F24): sugli stessi casi trova almeno i difetti di Opus meno uno, non ha falsi in più e rispetta il formato dei rilievi.

## Come si conta

- **Trovato**: il rilievo nomina il difetto e la sua causa, anche con parole diverse.
- **Mancato**: un difetto atteso che non compare.
- **Falso**: un rilievo su un problema che nel codice non c'è, o un riferimento normativo sbagliato.
- **Extra valido**: un problema vero che non è nell'elenco; si aggiunge alla scheda per le esecuzioni successive.

I mancati e i falsi diventano proposte di modifica al file di ruolo dell'agente, da confermare prima di cambiare `agents/`.
