# Agentrica MCP

[![Agentrica MCP su mcprush](https://mcprush.com/badge/agentrica-mcp/compact.svg)](https://mcprush.com/to/agentrica-mcp?ref=badge)

[English](README.md)

Il server MCP di Agentrica: gli agenti IA dei reparti (AIBPD, AICA, AIPCA, AISA, AIWDA) usabili nel tuo progetto da Claude Code o da qualsiasi client MCP.

Ogni agente è un ruolo con un metodo e dei limiti dichiarati, per esempio `AISA-02 · ALTAIR`, Senior Software Architect, o `AIPCA-03 · DUBHE`, Senior Privacy Legal Specialist. Il server dà al modello le regole comuni del reparto e il file di ruolo dell'agente, presi da [`agents/`](https://github.com/flgisimone/agentrica/tree/main/agents), e il modello lavora nel tuo progetto con quelle istruzioni.

## Cosa fa e cosa non fa

- Il server gira solo in locale: lo avvia il client sul tuo computer e i due comunicano con stdio. Il server non ha una parte remota.
- Come contenuto legge solo i file di `agents/` inclusi nel pacchetto, una volta all'avvio. Il testo che arriva al modello è quello di quei file: puoi leggerlo prima di usarlo.
- Il server scrive un solo file, la tua [configurazione](#configurazione) in `~/.agentrica/config.json`, e solo dopo che hai risposto al modulo; gli altri file li scrive solo il comando [`init`](#nuovo-progetto), quando lo lanci tu. Non registra e non ha telemetria. Si collega a internet in due casi:
  - verso Agentrica, quando confermi la [valutazione di un agente](#valutazioni), e invia solo voto, commento e versione, o quando confermi l'invio dei [totali di token](#totali-di-token), e invia solo numeri di token per giorno, agente, modello ed effort, o quando confermi la proposta di un [tuo progetto](#mostra-il-tuo-progetto), e invia solo i campi del modulo; `--no-ratings` spegne tutti e tre;
  - verso il registro npm, all'avvio, per sapere se c'è una [versione nuova](#aggiornare-e-disinstallare): è una richiesta senza dati, npm vede solo indirizzo IP e programma, come quando npx scarica il pacchetto; `--no-update-check` lo spegne.

  Con `--no-ratings --no-update-check` non si collega mai. Apre anche, di predefinito, una pagina solo sul tuo computer: vedi [Pannello locale](#pannello-locale); `--no-panel` la spegne.
- Non esegue niente nel tuo progetto. Dà soltanto istruzioni al modello: quello che il modello fa nel progetto dipende dal client e dai permessi che gli concedi.
- **Dove vanno i dati.** Il testo dell'agente, il compito e i file che il modello legge nel tuo progetto vanno al fornitore del modello attraverso il tuo client, secondo le condizioni di quel fornitore. Agentrica non li riceve. Nel compito non inserire dati personali, segreti o dati di clienti che non servono.
- Gli agenti sono IA: le loro conclusioni sono proposte da verificare. Gli agenti di privacy e sicurezza non sostituiscono un DPO, un avvocato o un responsabile della sicurezza, e i loro rilievi non sono una certificazione di conformità.

## Installazione

Serve Node 22 o successivo, con npm. I comandi sono gli stessi su Mac, Windows (PowerShell o cmd) e Linux.

**Su tutto il computer (consigliato)**, per Claude Code:

```sh
npx -y @agentrica/mcp@0.12.0 install
```

Installa il pacchetto con `npm install -g` e lo registra in Claude Code con ambito `user`: ogni progetto che apri ha già Agentrica. Il server parte con `node` dalla cartella globale di npm: parte in fretta e funziona anche offline. Riavvia Claude Code e controlla con `claude mcp list`.

**Senza installare nulla**, per Claude Code:

```sh
npx -y @agentrica/mcp@0.12.0 add
```

Registra il server avviato con npx (su Windows `cmd /c npx`), che al primo avvio scarica il pacchetto nella sua cache. L'ambito è `user`, tutti i tuoi progetti; con `--project` scrive `.mcp.json` nella cartella corrente, da condividere con il team (vale per il sistema su cui l'hai creato), con `--local` vale solo per il progetto corrente e solo per te. Per il team, dalla cartella del progetto:

```sh
npx -y @agentrica/mcp@0.12.0 add --project
```

Le opzioni del server (`--lang`, `--agents`, `--no-panel`, `--no-ratings`, `--no-update-check`) si aggiungono in fondo a `install` e `add`, che le passano al server. Lanciati di nuovo, sostituiscono la registrazione di Agentrica nello stesso ambito. Se mancano Node 22, npm o il comando `claude`, lo dicono e stampano i comandi da lanciare a mano.

La versione resta quella indicata finché non la cambi tu: un aggiornamento dei ruoli non arriva senza che tu lo scelga. Vedi [Aggiornare e disinstallare](#aggiornare-e-disinstallare).

**A mano in Claude Code**, senza `install` né `add`:

```sh
claude mcp add --scope user agentrica -- npx -y @agentrica/mcp@0.12.0
```

Su Windows: `claude mcp add --scope user agentrica -- cmd /c npx -y @agentrica/mcp@0.12.0`.

**Altri client MCP**: aggiungi il server alla configurazione del client, di solito un file JSON come questo:

```json
{
  "mcpServers": {
    "agentrica": {
      "command": "npx",
      "args": ["-y", "@agentrica/mcp@0.12.0"]
    }
  }
}
```

Su Windows:

```json
{
  "mcpServers": {
    "agentrica": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@agentrica/mcp@0.12.0"]
    }
  }
}
```

**Permessi minimi (consigliato).** Installa il pacchetto in una cartella sua e avvialo con il permission model di Node: il server può solo leggere quella cartella, e Node blocca scritture su file, connessioni di rete e processi figli. Il server non ne ha bisogno, quindi funziona uguale; i permessi limitano i danni di un eventuale difetto futuro. Con questi permessi l'invio di una [valutazione](#valutazioni) fallisce con un messaggio chiaro e il controllo della versione non parte: se vuoi votare gli agenti aggiungi `--allow-net`, altrimenti aggiungi `--no-ratings --no-update-check` in fondo al comando. Il [pannello](#pannello-locale) con questi permessi non parte.

```sh
npm install -g --ignore-scripts @agentrica/mcp@0.12.0
npm root -g
```

Con la cartella stampata da `npm root -g` al posto di `/cartella/globale`:

```sh
claude mcp add --scope user agentrica -- node --permission --allow-fs-read=/cartella/globale/@agentrica/mcp /cartella/globale/@agentrica/mcp/dist/mcp/src/server.js
```

Su Windows la cartella è di solito `C:\Users\<nome>\AppData\Roaming\npm\node_modules`; se contiene spazi, metti fra virgolette il percorso e l'intera opzione:

```sh
claude mcp add --scope user agentrica -- node --permission "--allow-fs-read=C:\Users\<nome>\AppData\Roaming\npm\node_modules\@agentrica\mcp" "C:\Users\<nome>\AppData\Roaming\npm\node_modules\@agentrica\mcp\dist\mcp\src\server.js"
```

**Provenienza.** Il pacchetto è pubblicato dalla CI del repository con provenance: su npm si vede da quale commit è stato costruito, e `npm audit signatures` nel tuo progetto ne verifica la firma.

**Da un clone**, per lavorare su Agentrica: `npm ci` nella root del repository, poi al posto del comando npx `node --permission --allow-fs-read=/percorso/di/agentrica /percorso/di/agentrica/packages/mcp/src/server.ts` (Node 26, come in `.nvmrc`).

## Uso

**Prompt.** Ogni agente è un prompt con il suo id in minuscolo e il reparto (`aisa-02-software`, `aica-01-cybersecurity`, `aibpd-01-business`, `aipca-02-privacy`, `aiwda-08-design`) e un argomento facoltativo, `task` (il compito). In Claude Code i prompt diventano comandi, e il menu mostra il reparto:

```
/mcp__agentrica__aisa-02-software "Rivedi i confini fra i moduli di src/"
```

Fino alla 0.5.0 il nome era solo l'id (`aisa-02`).

Metti il compito fra virgolette: Claude Code separa gli argomenti con gli spazi.

**Squadra.** Con `--agents` il server carica solo gli agenti che indichi: id di agenti e sigle di reparti, separati da virgole, senza distinguere maiuscole. Per esempio tutto il reparto software più l'agente dell'accessibilità:

```sh
npx -y @agentrica/mcp@0.12.0 install --agents aisa,aiwda-08
```

Nel menu dei comandi restano solo i prompt della squadra, e anche `list_agents` e `agent` vedono solo quelli. Senza `--agents` ci sono tutti gli agenti. Un id o una sigla sconosciuti fermano il server con un messaggio che li nomina, nei log del client. In Claude Code i prompt non entrano nel contesto del modello (lo abbiamo verificato con `/context`): la squadra rende il menu più corto, ma non fa risparmiare token.

**Tool**, per i client che non mostrano i prompt, o quando vuoi che sia il modello a scegliere l'agente:

| Tool | Parametri | Cosa restituisce |
|---|---|---|
| `list_agents` | `department` (il reparto) facoltativo (`AIBPD`, `AICA`, `AIPCA`, `AISA`, `AIWDA`) | id, nome in codice, ruolo e reparto di ogni agente, con il modello consigliato dove è stato misurato |
| `agent` | `id` (es. `AISA-02`), `task` (il compito) facoltativo | le istruzioni complete dell'agente, con l'indice della biblioteca del reparto |
| `library` | `id` dell'agente, `cards` (gli id delle schede, al più 10) | le schede della [biblioteca](#biblioteca) del reparto dell'agente, con fonte, versione e date |
| `rate_agent` | `id`, `rating` da 1 a 5, `comment` e `publish` facoltativi; poi `code` | l'anteprima della valutazione e un codice; con il codice, l'invio (vedi [Valutazioni](#valutazioni)) |
| `share_usage` | nessuno; poi `code` | l'anteprima dei totali di token del progetto e un codice; con il codice, l'invio (vedi [Totali di token](#totali-di-token)) |
| `submit_project` | `name`, `url`, `description`, `departments`, `agents` e `author` (gli ultimi due facoltativi), `consent`, `license`; poi `code` | l'anteprima della proposta di un progetto e un codice; con il codice, l'invio (vedi [Mostra il tuo progetto](#mostra-il-tuo-progetto)) |

Per esempio: «Usa list_agents, scegli l'agente di Agentrica adatto e verifica l'accessibilità del form di login».

**Orchestrazione.** Il numero 01 di ogni reparto è il direttore, e `list_agents` lo segna: per un compito del reparto il modello lo carica per primo, poi carica con `agent` gli specialisti che il direttore sceglie, uno alla volta, ognuno dal risultato del precedente; alla fine il direttore consolida i risultati e te li presenta. Fra reparti l'ordine è business → design → privacy → tua conferma → software → revisioni di design e privacy → Code Reviewer → tua conferma. Le istruzioni del server chiedono al modello di usare `agent` e non i subagent locali, salvo che li chieda tu; il [pannello](#pannello-locale) mostra la catena degli agenti.

**Comandi.** Oltre ai prompt degli agenti ci sono `/mcp__agentrica__rate`, che apre il modulo di [valutazione](#valutazioni) per l'ultimo agente usato (o per quello che indichi, es. `/mcp__agentrica__rate AISA-02`), `/mcp__agentrica__project`, che propone un tuo progetto per il sito senza account GitHub (vedi [Mostra il tuo progetto](#mostra-il-tuo-progetto)), e `/mcp__agentrica__configure`, che apre il modulo della [configurazione](#configurazione).

**Nomi cambiati nella 0.9.0.** Tool, prompt e argomenti hanno nomi inglesi, senza alias: aggiorna istruzioni o script che usano quelli vecchi.

| Fino alla 0.8.1 | Dalla 0.9.0 |
|---|---|
| tool `elenca_agenti`, argomento `reparto` | `list_agents`, `department` |
| tool `agente`, argomento `compito` | `agent`, `task` |
| argomento `compito` dei prompt degli agenti | `task` |
| comando `valuta`, argomento `agente` | `rate`, `agent` |
| comando `progetto`, argomento `rimuovi` | `project`, `remove` |
| comando `configura` | `configure` |

I nomi dei prompt degli agenti (`aisa-02-software`) non cambiano.

I file degli agenti, i testi del server e il pannello esistono in italiano e in inglese. Il server usa la lingua del sistema (italiano se è l'italiano, altrimenti inglese), oppure quella che scegli con `--lang it` o `--lang en` o nella [configurazione](#configurazione); in qualunque lingua siano i testi, l'agente risponde nella lingua in cui gli scrivi. Durante il lavoro l'agente dice chi è, per esempio «AISA-02 · ALTAIR — Senior Software Architect, reparto AISA (AI Software)»: all'inizio, quando passa a un altro agente e nel riepilogo finale.

## Configurazione

Lingua, squadra, pannello, valutazioni e avviso di versione si scelgono con un modulo, senza rilanciare `add` o `install`.

- **Quando.** Se il client mostra moduli (elicitation MCP, come Claude Code), il modulo compare alla prima chiamata ad Agentrica di una sessione, finché non c'è una configurazione salvata. Dopo lo riapri con `/mcp__agentrica__configure`. Se chiudi il primo modulo senza scegliere, si salvano i valori predefiniti e non ricompare.
- **Dove.** Le scelte si salvano sul tuo computer in `~/.agentrica/config.json` (su Windows `C:\Users\<nome>\.agentrica\config.json`), leggibile solo dal tuo utente, e valgono dalla sessione successiva in tutti i progetti. Contiene solo le cinque scelte, per esempio `{"version": 1, "lang": "it", "agents": "aisa,aiwda-08", "panel": false, "ratings": true, "updateCheck": true}` (`lang` vuota: la lingua del sistema); niente percorsi, progetti o date. Ad Agentrica non arriva nulla.
- **Precedenza.** Le opzioni scritte nel comando del server (`--lang`, `--agents`, `--panel`, `--no-panel`, `--no-ratings`, `--no-update-check`) vincono sul file, una per una, e non compaiono nel modulo.
- **Valutazioni accese** vuol dire solo che il server può chiederti un voto: ogni invio parte comunque solo dopo la tua conferma.
- **Senza moduli** (anche l'estensione VS Code di Claude Code, che li dichiara ma li chiude senza mostrarli: il server se ne accorge e non salva nulla) `/mcp__agentrica__configure` mostra la configurazione al modello, che può scrivere il file per te con il tuo permesso; oppure scrivilo a mano o usa le opzioni.
- Un file non valido (formato, chiavi o squadra sbagliati) si ignora, con una riga nei log del client, e il modulo lo riscrive. Per tornare ai predefiniti cancella il file.
- Con i [permessi minimi](#installazione) di Node il server non legge né scrive il file: usa le opzioni del comando.

## Modelli consigliati

Il server non sceglie il modello: lo usa il tuo client. Per alcuni agenti però consigliamo un modello più piccolo di Opus, perché sugli stessi casi di prova trova gli stessi difetti senza falsi in più e costa meno (dei limiti dell'abbonamento, o in dollari con l'API).

| Agente | Modello consigliato | Costo sul compito rispetto a Opus |
|---|---|---|
| AISA-08 · DENEB, QA | Haiku | −96% |
| AISA-09 · REGULUS, Application Security | Sonnet | −52% |
| AICA-04 · ALNILAM, Cloud Security | Sonnet | −52% |
| AIPCA-02 · ALIOTH, GDPR | Sonnet | −52% |
| AIBPD-05 · ALGIEBA, Business Analyst | Sonnet | −52% |
| AICA-09 · WEZEN, Vulnerability Management | Haiku | −95% |
| AICA-03 · BETELGEUSE, Application Security | Sonnet | −62% |
| AICA-05 · ALNITAK, Network Security | Sonnet | −54% |
| AICA-07 · SAIPH, SOC & Threat Detection | Sonnet | −52% |
| AIPCA-05 · MIZAR, Privacy Security | Sonnet | −58% |
| AIPCA-06 · MERAK, Data Governance & Retention | Sonnet | −49% |
| AIPCA-07 · ALCOR, Third-Party & Vendor Compliance | Sonnet | −61% |
| AIPCA-08 · PHECDA, Data Subject Rights | Sonnet | −54% |
| AISA-05 · SPICA, Frontend | Sonnet | −66% |
| AISA-07 · FOMALHAUT, Database | Sonnet | −56% |
| AISA-10 · CASTOR, DevOps | Sonnet | −62% |
| AISA-11 · BELLATRIX, Performance | Sonnet | −54% |

Gli altri 39 agenti lavorano con il modello della tua sessione: i cinque direttori e i ruoli di giudizio (Architect, Security Architect, Code Reviewer, DPIA, Pentest) per scelta, perché lì un errore costa caro, gli altri perché non sono ancora stati misurati o non hanno superato la soglia. Il costo è la media sui casi di prova di ciascun agente (prezzi API del 2026-11-03); misure, casi e rapporti sono in [`examples/risultati/2026-11-19-modelli.md`](https://github.com/flgisimone/agentrica/blob/main/examples/risultati/2026-11-19-modelli.md) e [`examples/risultati/2026-11-23-ondata-1.md`](https://github.com/flgisimone/agentrica/blob/main/examples/risultati/2026-11-23-ondata-1.md).

- **Dove si vede.** In `list_agents` e in testa al testo dell'agente («Modello consigliato: Sonnet…»). Il modello della sessione lo scegli tu; i subagent di `init --subagents` lo hanno già.
- **Subagent.** I subagent copiati da [`init --subagents`](#nuovo-progetto) in `.claude/agents/` hanno già `model:` con il modello consigliato (gli altri `inherit`). Per cambiarlo modifica quella riga (`opus`, `sonnet`, `haiku` o `inherit`).
- **Sessione.** In Claude Code il modello della sessione si cambia con `/model`.
- **Riesame.** Le regole dei reparti chiedono a un agente su un modello più piccolo di proporre il riesame su Opus quando trova un rilievo P0 o P1 o non è sicuro.

## Valutazioni

Puoi dare a un agente un voto da 1 a 5 e un commento su cosa migliorare: servono a correggere i file di ruolo.

- **Il modulo.** Se il client mostra moduli (elicitation MCP, come Claude Code), è il server a chiedertelo, con un modulo: voto, commento e se pubblicarlo. Te lo chiede quando carichi un altro agente, per quello di prima, che ha finito, e dopo 30 minuti d'uso. Una volta per agente per sessione: se rifiuti, per quell'agente non te lo chiede più. Inviare il modulo vale come conferma, e parte solo ciò che c'è nel modulo.
- **Senza modulo.** Con i client che non mostrano moduli te lo propone l'agente quando ha finito il compito, una volta per sessione; se lavora da più di 30 minuti, il server lo ricorda al modello una volta. `rate_agent` prima mostra l'anteprima di ciò che parte e un codice valido 10 minuti; il modello te la mostra e invia solo con il codice, esattamente quel contenuto.
- Puoi anche chiederlo tu, con il comando `/mcp__agentrica__rate` (l'ultimo agente usato, o quello che indichi) o a parole («valuta AISA-02»), o votare dal [pannello](#pannello-locale), nella sezione «Valuta gli agenti».
- **Cosa parte.** Id dell'agente, voto, commento, se permetti di pubblicare il commento sul sito (spento per impostazione predefinita), versione del pacchetto e un codice casuale della valutazione. Niente compito, file, percorsi o nome del progetto, niente account. Nel commento non scrivere nomi, dati personali o parti del progetto.
- **Sul sito.** Ogni agente con almeno 5 voti mostra media, numero e distribuzione dei voti, e c'è una classifica quando almeno 5 agenti superano la soglia. Un commento compare solo se hai permesso di pubblicarlo e dopo l'approvazione (criteri nelle [note legali](https://agentrica.vercel.app/note-legali#valutazioni)), con il voto e il mese.
- **Dopo l'invio** ricevi il codice della valutazione: con quello puoi chiedere di cancellarla o di non pubblicare il commento. Un agente si valuta una volta per sessione e una volta al giorno dalla stessa rete.
- **Se l'invio non riesce** (offline, servizio giù) il tool lo dice e il lavoro continua; il voto non resta salvato da nessuna parte.
- **Per non avere il tool**, il modulo né le proposte, aggiungi `--no-ratings` al comando: il server non si collega più ad Agentrica.

Come trattiamo le valutazioni: [note legali](https://agentrica.vercel.app/note-legali#valutazioni).

## Totali di token

Puoi inviare ad Agentrica i totali di token del progetto: il sito li somma a quelli degli altri utenti nella pagina [Consumo di token](https://agentrica.vercel.app/consumo), accanto ai risultati misurati nelle nostre prove.

- **Come.** Chiedilo all'agente («invia i totali di token ad Agentrica»): `share_usage` prima mostra l'anteprima, riga per riga, e un codice valido 10 minuti; il modello te la mostra e invia solo con il codice, esattamente quelle righe. A fine sessione l'agente può proportelo una volta, insieme alla valutazione. Nel [pannello](#pannello-locale) c'è anche il pulsante «Prepara l'anteprima» nella vista Consumo: la conferma dalla pagina vale come sì.
- **Cosa parte.** Gli ultimi 30 giorni, al più 300 righe: per ogni sessione di Claude Code, giorno, agente, modello ed effort, i token in ingresso, in uscita, letti e scritti in cache, più la versione del pacchetto. L'agente è l'id di Agentrica (es. `AISA-02`), `sessione` per la conversazione principale o `altro` per i tuoi subagent, di cui non parte il nome; il modello è `opus`, `sonnet`, `haiku` o `altro`. Ogni riga ha una chiave, un'impronta SHA-256 calcolata sul tuo computer: serve al sito per sostituire una riga già inviata invece di contarla due volte. Niente testi, file, percorsi, nome del progetto né id di sessione.
- **Sul sito** compaiono solo somme per mese, modello e agente, quando ci sono almeno 10 invii, indicate come dichiarate dagli utenti. Al più 5 invii al giorno dalla stessa rete.
- **Se l'invio non riesce** il tool lo dice e il lavoro continua; nulla resta salvato. `--no-ratings` toglie anche questo tool.

Come trattiamo i totali: [note legali](https://agentrica.vercel.app/note-legali#consumo).

## Biblioteca

Le conoscenze di un modello si fermano alla sua data di addestramento. Ogni reparto ha una biblioteca di schede con nozioni recenti (standard, norme, versioni), ciascuna verificata su una fonte ammessa di livello 1 (enti di standard, autorità, testi normativi) o 2 (documentazione ufficiale dei produttori), con versione, data di verifica e data entro cui ricontrollarla. Per esempio OWASP Top 10:2025, TypeScript 7.0, le date dell'AI Act dopo l'AI Omnibus, WCAG 2.2.

- Il testo di ogni agente contiene, dopo il file di ruolo, l'indice delle schede del suo reparto; il modello legge quelle che servono al compito con `library` e cita fonte e data. Una scheda oltre la sua data è segnata da ricontrollare.
- Le schede viaggiano nel pacchetto (`agents/<reparto>/biblioteca/`, in inglese in `agents/<reparto>/en/biblioteca/`) e seguono le stesse regole dei file di ruolo: niente link, HTML o comandi. Gli indirizzi delle fonti stanno in `agents/<reparto>/fonti.json` e non arrivano mai al modello. Il server resta offline: la biblioteca non apre connessioni.
- Si aggiorna con le versioni del pacchetto: un rilevatore settimanale, senza modello, legge i flussi delle fonti e apre l'elenco delle novità; le schede nuove entrano solo dopo la revisione del titolare.

## Pannello locale

Il server apre anche una pagina sul tuo computer da cui segui il progetto e prendi le scelte che l'agente ti chiede, invece di rispondere nel terminale. Da 0.8.0 è acceso di predefinito: chiedi «apri il pannello di Agentrica». Alla prima scelta da fare, se la pagina non è aperta, il server apre il browser. Per spegnerlo scegli nel modulo della [configurazione](#configurazione) o aggiungi `--no-panel`:

```sh
npx -y @agentrica/mcp@0.12.0 install --no-panel
```

Poi chiedi all'agente di aprire il pannello (tool `open_panel`): la pagina si apre nel browser. Ha sei pagine, con il menu in alto che conta le scelte in attesa, gli agenti chiamati, i rilievi e gli agenti da valutare:

- **Sessione**: le scelte da prendere (*Da decidere*), con le opzioni e le motivazioni, la cui risposta, con una nota facoltativa, torna all'agente; accanto, gli ultimi tre agenti di Agentrica chiamati (*Agenti in uso*); sotto, in una sezione a parte, i subagent di Claude Code avviati nella sessione (*Subagent di Claude Code*), con tipo, descrizione e stato;
- **Agenti**: tutti gli agenti chiamati nella sessione, in un albero per reparto: una colonna per reparto nell'ordine in cui sono entrati (un reparto che torna, come la revisione dopo il software, apre una colonna segnata «ritorno»), in cima il direttore e sotto gli specialisti. Ogni scheda ha il numero d'ordine di chiamata, il direttore e l'agente attivo segnati, il compito intero e il resoconto di ciò che ha fatto, se l'agente l'ha mandato con il tool `report` (per un direttore il cui reparto lavora ancora: «coordina il reparto»);
- **Piano**: la fase in corso con backlog e criteri di accettazione, e tutte le fasi del progetto;
- **Rilievi**: i rilievi aperti delle fasi e quelli degli audit, per priorità e reparto;
- **Valutazioni**: un modulo per ogni agente usato e non ancora valutato (vedi [Valutazioni](#valutazioni)); non c'è con `--no-ratings`;
- **Consumo**: i token spesi nel progetto con Claude Code, per giorno, agente (subagent), modello e sessione, con la quota letta dalla cache, il costo in dollari equivalenti ai prezzi API, il risparmio della cache (misurato) e quello del modello (una stima: gli stessi token al prezzo di Opus). Ogni grafico è anche una tabella.

Quando un agente nuovo si mette al lavoro o c'è un agente in più da valutare, la pagina lo dice con un avviso in basso. Con «Attiva le notifiche» lo dice anche con una notifica di sistema quando la scheda del pannello non è in vista; serve il permesso del browser, e la notifica la mostra il browser, senza servizi esterni.

Con il pannello il modello ha tre tool in più:

| Tool | Parametri | Cosa fa |
|---|---|---|
| `open_panel` | nessuno | apre la pagina nel browser e ne restituisce l'URL |
| `ask_user` | `question`, 2–4 `options` (`label`, `description`), `header` e `multiple` facoltativi | mostra la scelta nella pagina e restituisce la risposta |
| `report` | `id` dell'agente, `summary` (al più 4000 caratteri) | salva nel pannello il resoconto di ciò che l'agente ha fatto; il testo di ogni agente chiede di mandarlo a fine compito |

Se la pagina non è aperta, `ask_user` la apre. Il client aspetta la risposta finché il server manda notifiche di avanzamento (fino a 4 ore; 25 minuti con un client che non le chiede), poi l'agente chiede nel terminale. Le domande del client, come i permessi dei tool, restano nel client.

**Cosa fa il pannello.** Il server apre una porta casuale solo su `127.0.0.1` (se c'è una versione nuova, la pagina lo dice in alto), legge `plan/`, `audit/` e lo stato di git (`git status`) della cartella del progetto e, quando apri «Consumo», i file che Claude Code salva per quel progetto (`~/.claude/projects/<progetto>/`), da cui prende solo conteggi dei token, modello, effort e giorno, mai i testi delle conversazioni (niente link simbolici, file oltre 64 MB saltati). Con la pagina aperta, ogni 5 secondi guarda nella stessa cartella i transcript dei subagent avviati dopo la partenza del server (`<sessione>/subagents/agent-<id>.jsonl`, di cui legge solo l'ora della prima riga) e i loro `.meta.json`, da cui prende solo tipo, descrizione e stato. Il contenuto dei `.meta.json` non è documentato da Claude Code: se cambia, il subagent compare lo stesso, con «formato non riconosciuto». Tiene in memoria le ultime 20 chiamate agli agenti, con il compito e il resoconto. Non scrive file e non manda dati fuori dal computer, salvo le valutazioni e i totali di token che invii dalla pagina. La pagina si apre solo con il token casuale contenuto nell'URL, che vale per quella sessione; le richieste da altri siti o con un altro `Host` sono rifiutate. Il pannello ha bisogno della rete locale e di `git`: con il permission model di Node consigliato sopra non parte, e il server funziona senza (con `--panel` esplicito, invece, si ferma con un messaggio).

**Formato di `plan/` e `audit/`.** Il pannello legge il formato dei piani creati da `init`, in italiano o in inglese (qui in italiano, con i nomi inglesi fra parentesi), lo stesso del [`plan/`](https://github.com/flgisimone/agentrica/tree/main/plan) e dell'[`audit/`](https://github.com/flgisimone/agentrica/tree/main/audit) di Agentrica; se qualcosa manca, la pagina dice cosa. Se manca il piano, o non ha ancora fasi, la pagina lo dice come informazione, con le strade per crearlo ([progetto già avviato](#progetto-già-avviato)).

- `plan/README.md` con una sezione `## Fasi` (`## Phases`) e una tabella `| Fase | File | Contenuto | Stato |`, il file come link (`[14-pannello.md](14-pannello.md)`). La fase aperta è la prima con uno stato diverso da `completata` e `sospesa` (`completed`, `suspended`).
- Nel file della fase: `# Titolo`, una riga `**Obiettivo**: …` (`**Goal**`), `## Backlog` con la tabella `| # | Attività | Priorità |`, `## Criteri di accettazione` e `## Fatto` (`## Acceptance criteria`, `## Done`) come elenchi; un'attività è fatta quando il suo id compare in grassetto in «Fatto» (`- **F14-01** …`). `## Rilievi aperti` (`## Open findings`) è un elenco, con la priorità (`P0`–`P3`) nel testo; una voce che dice «risolto» o «chiuso» («resolved», «closed»; es. «Risolto in F6.») resta nel piano ma il pannello non la mostra.
- `audit/<cartella>/<file>.json` con `agente` (`agent`, es. `"AICA-02 · …"`, da cui il reparto) e un elenco `rilievi` (`findings`) di oggetti con `id`, `titolo`, `priorita` e `stato` facoltativo (`title`, `priority`, `status`); un rilievo con uno `stato` che dice «risolto» o «chiuso» non si mostra.

## Nuovo progetto

`init` crea un progetto con il metodo di lavoro di Agentrica, pronto per Claude Code:

```sh
npx -y @agentrica/mcp@0.12.0 init mio-progetto --name "Mio progetto"
```

Senza cartella usa quella corrente; senza `--name` il nome è quello della cartella. Scrive, nella lingua del server (`--lang it` o `--lang en` per sceglierla):

- `AGENTS.md` e `CLAUDE.md` (regole per gli agenti: tokensave, scala Ponytail, efficienza, verifica, agenzie) e `CONVENTIONS.md` (codice, test, fasi, chiusura e rilascio), con le parti dello stack marcate «da compilare»;
- `plan/` con `README.md` (decisioni, glossario, fasi) e `00-base.md`, la fase F0 da cui si parte; `audit/` e `docs/`;
- `agents/`: i 56 ruoli di questa versione, nelle due lingue (l'inglese nella cartella `en/` di ogni agenzia), che il modello carica dal server con `agent`;
- solo con `--subagents`, `.claude/agents/`: un subagent di Claude Code per ruolo nella lingua scelta, con il nome del progetto, che come primo passo carica il suo agente dal server (così compare nel pannello). Dalla 0.10.0 senza il flag non si copiano: gli agenti si consultano dal server uno alla volta, e i subagent si avviano solo se li chiedi o per un audit in parallelo;
- `.github/workflows/ci.yml` (`npm run verify` e `verify:e2e`, saltati finché F0 non li crea), `.gitignore`, `.nvmrc`, `.env.example`;
- `.mcp.json` con questo server a versione esatta (il pannello è acceso di predefinito e legge subito il piano) (su Windows con `cmd /c npx`).

Se anche un solo file esiste già, `init` non scrive nulla e dice quali sono. Fuori da un repository git fa il primo commit su `main` e lascia attivo `develop`; dentro un repository non fa commit. Poi apri Claude Code nella cartella e chiedi di aprire la fase F0. `init` è l'unico comando che scrive file nel progetto: il server scrive solo la sua [configurazione](#configurazione). Prende il posto di agentic-starter, che non si aggiorna più.

### Progetto già avviato

In un progetto che esiste già (per esempio installato con [`add`](#installazione)) `init --existing` aggiunge le regole di Agentrica senza toccare i tuoi file:

```sh
npx -y @agentrica/mcp@0.12.0 init --existing
```

Scrive solo i file che mancano e salta quelli presenti, con l'elenco nell'output: un tuo `AGENTS.md` o `CLAUDE.md` resta com'è (se hai già `CLAUDE.md`, aggiungi una riga `@AGENTS.md`). Non fa commit e non copia la base tecnica di un progetto nuovo: niente F0 «base tecnica», CI, `.nvmrc` ed `.env.example`. Il `plan/README.md` parte senza fasi: chiedi a Claude «Crea le fasi del progetto dal codice esistente». Anche senza `init --existing` le istruzioni del server descrivono il formato di `plan/` e, se il piano manca, Claude propone di crearlo.

**Sessioni per fase.** Pianificare è una sessione a sé: Claude scrive solo `plan/` (fasi con backlog e criteri), te lo fa confermare e propone `/clear` senza cominciare a sviluppare. Poi una fase per sessione, ciascuna in una sessione nuova, e alla chiusura di nuovo `/clear`. La regola sta nelle istruzioni del server e in `AGENTS.md` e `CONVENTIONS.md` di `init`.

## Mostra il tuo progetto

Hai fatto qualcosa con gli agenti di Agentrica? Il sito lo può mostrare nella pagina dei progetti, dopo la nostra approvazione, in tre modi:

- apri la issue [«Mostra il tuo progetto»](https://github.com/flgisimone/agentrica/issues/new?template=progetto.yml): nome, link al repository pubblico, una descrizione breve, reparti e agenti usati, con il consenso a pubblicarli;
- oppure aggiungi al repository pubblico il topic `agentrica`: vale come richiesta di comparire, e mostriamo solo nome, descrizione, link e proprietario del repository;
- oppure, senza account GitHub, dal server: `/mcp__agentrica__project` apre un modulo con gli stessi campi e un link `https://` qualsiasi (repository, sito o pagina); senza moduli lo stesso fa il tool `submit_project`, con anteprima e conferma. Ricevi un codice: conservalo, serve per ritirare la proposta con `/mcp__agentrica__project` e l'argomento `remove`. Senza la tua conferma non parte nulla; `--no-ratings` toglie anche questo.

Descrizione e risultati restano tuoi: non li verifichiamo. Puoi chiedere la rimozione quando vuoi; come trattiamo questi dati è nelle [note legali](https://agentrica.vercel.app/note-legali#progetti). Se vuoi, metti il badge nel README:

```markdown
[![Fatto con Agentrica](https://img.shields.io/badge/fatto%20con-Agentrica-0b1020)](https://agentrica.vercel.app)
```

## Aggiornare e disinstallare

Il testo degli agenti viene dai file di `agents/` della versione installata. Quando esce una versione nuova il server te lo dice una volta per sessione, nella risposta di un tool e nel pannello, con il comando giusto per come l'hai installato. Gli id e i nomi in codice non cambiano.

- **Installato con `install`**: rilancia `install` con la versione nuova, es. `npx -y @agentrica/mcp@<versione> install`, poi riavvia Claude Code.
- **Con `add` o `init`**: rilancia `add` con la versione nuova, o cambia la versione nel comando del server o nel `.mcp.json`, poi riavvia il client.
poi riavvia il client.

Se Agentrica è registrato in più ambiti (per esempio con `install` e poi con `add --local`), `add` e `install` lo dicono dopo la registrazione: Claude Code usa quella più vicina al progetto (local, poi project, poi user), e quella che non ti serve si toglie con `claude mcp remove agentrica --scope <ambito>`.

Per disinstallare:

```sh
claude mcp remove agentrica --scope user
npm uninstall -g @agentrica/mcp
```

Il secondo comando serve solo se avevi usato `install`; con `add --project` o `--local` usa quell'ambito al posto di `user`. Se hai salvato una [configurazione](#configurazione), cancella anche la cartella `~/.agentrica`.

Lo stesso catalogo si legge anche da codice, senza avviare il server: `import { loadCatalog } from "@agentrica/mcp/catalog"` restituisce reparti e agenti (con i tipi `Department` e `Agent`) dagli `agents/` del pacchetto. È ciò che usa il sito di Agentrica.

## Versioni

Le novità di ogni versione, con la data, sono in [CHANGELOG.md](https://github.com/flgisimone/agentrica/blob/main/packages/mcp/CHANGELOG.md). La 0.6.0 cambia il nome dei prompt (`aisa-02` diventa `aisa-02-software`); la 0.9.0 porta in inglese i nomi di tool, comandi e argomenti (tabella in [Uso](#uso)); dalla 0.10.0 `init` non copia i subagent senza `--subagents`.

## Licenza

MIT. Agentrica è un server MCP con agenti IA organizzati in reparti, da usare nei tuoi progetti: gli agenti sono modelli di IA guidati da file di ruolo, non persone.
