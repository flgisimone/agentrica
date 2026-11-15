# Casi di prova degli agenti

Progetti piccoli con difetti noti, per vedere se un agente di Agentrica li trova e se inventa rilievi. Ogni caso ha un progetto, un agente, un compito e l'elenco dei difetti attesi.

| Caso | Agente | Progetto |
|---|---|---|
| [aisa-09-api-note](casi/aisa-09-api-note.md) | AISA-09 · REGULUS, Application Security | [api-note](progetti/api-note/) |
| [aiwda-08-form-iscrizione](casi/aiwda-08-form-iscrizione.md) | AIWDA-08 · GACRUX, Accessibility | [form-iscrizione](progetti/form-iscrizione/) |
| [aipca-02-prenotazioni-palestra](casi/aipca-02-prenotazioni-palestra.md) | AIPCA-02 · ALIOTH, GDPR | [prenotazioni-palestra](progetti/prenotazioni-palestra/) |

I progetti sono difettosi di proposito: non usarli come modello e non metterli in rete.

## Come si esegue un caso

1. Dalla root del repository, copia il progetto fuori dal repository, così l'agente non legge l'elenco dei difetti:

   ```sh
   D=$(mktemp -d) && cp -R examples/progetti/api-note/. "$D" && cd "$D"
   ```

2. Configura il server con il solo agente del caso, alla versione pubblicata:

   ```sh
   cat > .mcp.json <<'EOF'
   { "mcpServers": { "agentrica": { "command": "npx", "args": ["-y", "@agentrica/mcp@0.2.1", "--agents", "aisa-09"] } } }
   EOF
   ```

3. Apri il client nella cartella (`claude` da terminale, oppure la cartella in VS Code con l'estensione di Claude Code), approva il server del progetto e lancia il prompt con il compito della scheda:

   ```text
   /mcp__agentrica__aisa-09 "<compito della scheda>"
   ```

4. Se l'agente propone di correggere, rispondi di no: si valuta solo il rapporto.
5. Salva l'output intero in `risultati/<data>-<caso>.md` con data, versione del pacchetto, client e modello.

## Come si conta

- **Trovato**: il rilievo nomina il difetto e la sua causa, anche con parole diverse.
- **Mancato**: un difetto atteso che non compare.
- **Falso**: un rilievo su un problema che nel codice non c'è, o un riferimento normativo sbagliato.
- **Extra valido**: un problema vero che non è nell'elenco; si aggiunge alla scheda per le esecuzioni successive.

I mancati e i falsi diventano proposte di modifica al file di ruolo dell'agente, da confermare prima di cambiare `agents/`.
