# Prompt e istruzioni

Slug: prompt-e-istruzioni · Descrizione: Come si scrive una richiesta che il modello capisce, e perché le istruzioni stabili vanno in un file.

## In breve
Un [prompt](glossario.md#prompt) è il testo che dai al modello: la domanda, ma anche il materiale e le regole. Più è preciso, meno il modello deve indovinare. Le regole che valgono sempre si scrivono una volta, in [istruzioni di sistema](glossario.md#system-prompt) o in un file che l'assistente legge da solo.

## L'idea
Dalla [lezione precedente](01-language-model.md) sai che il modello continua il testo che riceve. Il prompt è quel testo. Se scrivi «sistemalo», il modello deve indovinare cosa, come e fino a dove. Se scrivi «nel file `cart.ts` la funzione `total` ignora lo sconto quando il carrello è vuoto: correggila senza cambiare la firma e aggiungi un test», gli hai dato quasi tutto.

Un buon prompt di lavoro risponde a poche domande:

- **Cosa** devi ottenere, con un risultato che si può controllare.
- **Su cosa** lavorare: file, funzione, pagina, dati di esempio.
- **Con quali vincoli**: cosa non toccare, quali strumenti usare, quale stile seguire.
- **In che forma** vuoi la risposta: una modifica, un elenco di rilievi, una spiegazione breve.

Non serve uno stile particolare né frasi magiche. Serve quello che diresti a una persona brava che entra oggi nel progetto. Gli esempi aiutano molto: un caso di ingresso e il risultato atteso valgono più di un aggettivo come «robusto».

Alcune regole valgono per ogni richiesta: la lingua dei commenti, i comandi per i test, le cartelle da non modificare. Ripeterle ogni volta è faticoso e prima o poi te ne dimentichi una. Per questo i modelli distinguono fra il messaggio dell'utente e le istruzioni di sistema, un testo che sta prima della conversazione e la orienta tutta. Gli [assistenti di codice](glossario.md#coding-assistant) usano lo stesso principio con dei file: Claude Code, per esempio, legge da solo il file `CLAUDE.md` del progetto all'inizio di ogni sessione.

Le istruzioni scritte in un file hanno tre vantaggi. Si rileggono e si migliorano come il codice. Valgono uguali per tutte le persone del gruppo. E si possono versionare con git, così sai quando una regola è cambiata e perché.

Un limite da conoscere: istruzioni lunghe e contraddittorie confondono il modello quanto una persona. Se due regole si scontrano, il modello ne sceglie una, non sempre quella che volevi. Meglio poche regole chiare, ciascuna con il suo motivo.

## In Agentrica
In Agentrica gli agenti sono istruzioni scritte in file. Ogni reparto ha un file di regole comuni, per esempio [agents/ai_software_agency/00-common-rules.md](../../agents/ai_software_agency/00-common-rules.md), con regole come «non introdurre dipendenze senza motivazione» o «non leggere dati personali reali se il compito non lo richiede». Poi c'è un [file di ruolo](glossario.md#role-file) per ogni agente, con la missione e il modo di lavorare: guarda [agents/ai_software_agency/02-senior-software-architect.md](../../agents/ai_software_agency/02-senior-software-architect.md).

Quando chiedi un agente, il server compone il prompt: regole comuni del reparto, file di ruolo e il tuo compito, in quest'ordine. Il codice che lo fa è in [packages/mcp/src/prompt.ts](../../packages/mcp/src/prompt.ts). Puoi vedere il testo esatto che arriva al modello con lo script [scripts/agent-text.ts](../../scripts/agent-text.ts), lo stesso usato nelle misure.

Le istruzioni del progetto stesso seguono la stessa idea: [AGENTS.md](../../AGENTS.md) dice agli assistenti come lavorare in questo repository, e `CLAUDE.md` si limita a includerlo. Dalla fase F32 ogni file di ruolo ha un gemello inglese con lo stesso nome nella cartella `en/`, e il catalogo si ferma se ne manca uno: un prompt deve dire la stessa cosa in tutte e due le lingue. Anche le pagine degli agenti sul sito, nate in F4, mostrano il file di ruolo così com'è: vedi [/agenti](/agenti).

## Prova
Prendi una richiesta che hai fatto di recente al tuo assistente e riscrivila con le quattro domande: cosa, su cosa, con quali vincoli, in che forma. Mandale tutte e due in due chat nuove e confronta i risultati.

Poi apri o crea il file di istruzioni del tuo progetto (`CLAUDE.md` per Claude Code) e scrivi tre regole che ripeti spesso, ognuna con il suo motivo in una riga. Per esempio:

```markdown
- Esegui `npm test` prima di dire che una modifica è finita: la CI lo fa comunque.
- Non modificare i file in `generated/`: si rigenerano dallo schema.
- Commenti in italiano, nomi nel codice in inglese.
```

Apri una sessione nuova e controlla che l'assistente le segua senza che tu le ripeta.

## Termini
- [Prompt](glossario.md#prompt)
- [Istruzioni di sistema](glossario.md#system-prompt)
- [Assistente di codice](glossario.md#coding-assistant)
- [File di ruolo](glossario.md#role-file)
