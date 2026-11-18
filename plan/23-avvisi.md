# F23 — Avvisi all'utente e installazione su ogni sistema

**Obiettivo**: la proposta di valutare un agente arriva davvero all'utente, senza che debba chiederla; chi usa una versione vecchia di `@agentrica/mcp` sa che ne esiste una nuova e come aggiornare; l'installazione è un solo comando, uguale su Mac, Windows e Linux, e il sito spiega chiaramente tutte le modalità di installazione e le funzioni del server. In più il reparto di ogni agente si legge nel menu dei comandi e nel pannello, e il sito raccoglie la cronistoria dei rilasci.

> **Stato: in corso**. Nata dalle segnalazioni degli utenti del 2026-11-18 (la proposta di valutazione compare solo se la si chiede; nessun avviso di versione nuova). Decisioni con l'utente il 2026-11-18; backlog da confermare all'apertura.

**Agenzie**: privacy (GDPR, Vendor Compliance) per la connessione nuova verso npm e il modulo di valutazione; cybersecurity (AppSec) sulla risposta del registro, che è un dato esterno; design (Information Architect per pagina e menu, UX Writer per i testi del modulo, dell'avviso e della pagina, UI Designer, Accessibility per le schede) prima e dopo; software (Backend, Frontend per il sito, DevOps per la CI su tre sistemi, QA, Security, Code Reviewer).

## Situazione di partenza

- **Valutazione.** La proposta dipende solo dal modello: una riga nelle istruzioni del server e una nel testo dell'agente ([`agentText`](../packages/mcp/src/prompt.ts)). Il promemoria dei 30 minuti ([`remind`](../packages/mcp/src/server.ts)) si aggiunge solo alle risposte dei tool di Agentrica, ma dopo aver caricato un agente il modello lavora con i tool del client e non li richiama più: così il promemoria non parte quasi mai. Il pulsante «Valuta» c'è solo nel pannello (`--panel`) e solo se la pagina è aperta.
- **Versione.** La versione è fissata apposta (`npx -y @agentrica/mcp@0.5.0`, anche nel `.mcp.json` di `init`): un aggiornamento dei ruoli non arriva senza che l'utente lo scelga (README del pacchetto). Nessun meccanismo segnala che una versione nuova esiste.
- **Installazione.** Il README dà `claude mcp add agentrica -- npx -y @agentrica/mcp@0.5.0` e `init` scrive `"command": "npx"` nel `.mcp.json`. Su Windows nativo `npx` è `npx.cmd` e Claude Code non riesce ad avviarlo senza `cmd /c`: il server non parte («Connection closed»). In nessun punto del README o del codice si parla di Windows; anche i percorsi della sezione «Permessi minimi» sono in stile Unix. La CI gira solo su `ubuntu-latest`.
- **Sito.** L'installazione è spiegata nella sezione `#mcp` della home di `agentrica-site`, in 5 passi: un solo comando (`claude mcp add … npx`, dalla cartella del progetto), `--agents`, uso, `--panel`, `init`. Per Windows, altri client e permessi minimi rimanda al README di npm. Mancano valutazioni, `--no-ratings`, aggiornamento, disinstallazione e verifica. In «Cosa non fa» la frase «Non si collega a internet e non ha telemetria» non è più vera da F20. I comandi vengono da `src/lib/scripts.ts`, con la versione di `@agentrica/mcp` installata nel sito.
- **Reparto nel menu.** I prompt si chiamano con l'id dell'agente in minuscolo (`aibpd-01`). Il menu dei comandi di Claude Code in VS Code mostra solo il nome (`/agentrica:aibpd-01 (MCP)`): il titolo e la descrizione con ruolo e reparto non compaiono. Il pannello scrive solo la sigla del reparto («reparto AISA»).
- **Rilasci.** La cronistoria è sparsa: la sezione «Versioni» del README del pacchetto (dalla 0.1.0 alla 0.5.0, senza date), i tag `v0.2.0`…`v0.5.0` e i file delle fasi. Il sito non ha una pagina dei rilasci.
- Il README promette una sola connessione, quella della valutazione confermata (F20). La decisione «Privacy dei trasporti» (PRIV-MCP-02) chiede una revisione privacy prima di qualsiasi connessione nuova.

## Decisioni dell'utente (2026-11-18)

| Tema | Decisione |
|---|---|
| Valutazione | Il server chiede la valutazione con l'elicitation MCP (finestra nativa del client: voto 1–5, commento, consenso alla pubblicazione, avviso su cosa parte), in due momenti: quando si carica un altro agente (il precedente ha finito) e dopo 30 minuti d'uso. Una volta per agente per sessione; un rifiuto basta. Inviare il modulo vale come conferma |
| Ripiego | Se il client non supporta l'elicitation resta il flusso di oggi (`rate_agent` in due passi), con l'invito spostato in fondo al testo dell'agente |
| Versione nuova | All'avvio una GET al registro npm per la versione `latest` (timeout breve, nessun dato inviato). Se è più nuova, l'avviso va nella risposta del primo tool di Agentrica, con il comando per aggiornare, e in un banner del pannello. La versione resta fissata; un flag spegne il controllo |
| Installazione | Nuovo comando `npx -y @agentrica/mcp@<versione> add`, uguale su Mac, Windows e Linux. Non installa il pacchetto: registra il server in Claude Code chiamando `claude mcp add` senza shell (niente problemi di quoting in PowerShell o cmd), con `cmd /c npx` su Windows e `npx` altrove; il pacchetto lo scarica npx nella sua cache al primo avvio. Versione sempre fissata |
| Installazione sul PC | Comando principale `npx -y @agentrica/mcp@<versione> install`: esegue `npm install -g` di quella versione e registra in Claude Code, con scope user (ogni progetto aperto ha già Agentrica), `node <cartella globale>/@agentrica/mcp/dist/mcp/src/server.js`. È identico su Mac, Windows e Linux, senza `cmd /c`, parte più in fretta e funziona offline. Per aggiornare si rilancia `install` con la versione nuova. `add` resta per chi preferisce npx senza installare nulla. Per disinstallare, nel README: `claude mcp remove agentrica --scope user` e `npm uninstall -g @agentrica/mcp`. I subagent non diventano globali |
| Avviso e installazione | L'avviso di versione nuova dà il comando giusto per come il server è stato installato: `install` con la versione nuova se il server gira dalla cartella globale di npm, altrimenti la versione da cambiare nel comando npx o nel `.mcp.json` |
| Ambito di `add` | Predefinito globale (`--scope user`, tutti i progetti dell'utente); `--project` scrive `.mcp.json` per il team, `--local` vale solo per il progetto corrente. Se mancano `claude` o Node ≥ 22, lo dice e stampa il comando da lanciare a mano per quel sistema |
| `init` su Windows | Il `.mcp.json` creato su Windows usa `cmd /c npx` |
| Sito | Pagina dedicata `/installa`, con il link nel menu. Contiene: requisiti; modalità (su tutto il PC con `install`, consigliata; senza installare con `add`; per il team con `add --project`; progetto nuovo con `init`; altri client MCP; permessi minimi); opzioni e funzioni (`--agents`, `--panel`, `--no-ratings`, `--no-update-check`, valutazioni, avviso di versione); verifica; aggiornamento e disinstallazione; problemi comuni. In home resta il comando consigliato con il link alla pagina |
| Sistemi nel sito | Schede Mac, Linux e Windows solo dove i comandi cambiano. La scheda del sistema di chi visita si apre da sola (letta nel browser, senza inviare nulla); senza JavaScript si vedono tutte. Dove il comando è uguale, la pagina lo dice |
| Ordine del sito | Il sito va in produzione dopo il rilascio della 0.6.0, perché i comandi vengono dalla versione installata nel sito e `install` e `add` esistono solo da lì |
| Sistemi | Tutto quello che si fa in F23 vale per Mac, Windows e Linux, ed è provato su tutti e tre in CI |
| Reparto nei comandi | I prompt prendono il reparto nel nome, con la sigla in testa (es. `aibpd-01-business`, `aisa-02-software`), così il menu dei comandi mostra il reparto. È un cambio incompatibile dei nomi dei comandi, annunciato nella 0.6.0. Restano uguali l'id dell'agente (AISA-02), il nome in codice, l'argomento del tool `agente` e `--agents` |
| Reparto nel pannello | Accanto alla sigla, il nome del reparto: «reparto AISA · Software» |
| Rilasci | `CHANGELOG.md` nel pacchetto, con versione, data (dai tag) e novità divise per tipo (Nuovo, Cambiato, Corretto, Incompatibile), dalla 0.1.0. Il README rimanda lì al posto della sezione «Versioni». Il sito ha una pagina `/rilasci` che lo legge dalla versione installata, con i link a npm e al tag |
| Ordine | Questa fase viene prima della biblioteca (ora F25) ed è seguita dal rilascio 0.6.0: chi è fermo alla 0.5.0 non vedrà mai l'avviso, quindi prima arriva e meglio è |

## Proposte da confermare

- **Elicitation fuori da una chiamata.** Il timer dei 30 minuti manda una richiesta mentre non c'è una chiamata in corso. Da provare con Claude Code in F23-01: se il client non la accetta, al timer resta solo il promemoria di oggi e la finestra compare al cambio d'agente.
- **Flag.** `--no-update-check` per il controllo della versione. `--no-ratings` toglie anche l'elicitation di valutazione.
- **Avviso di versione.** Compare una volta per sessione, nella risposta del primo tool di Agentrica dopo il controllo, con la versione installata, quella nuova e il comando per aggiornare (versione nel comando o nel `.mcp.json`, poi riavvio del client).
- **Rete negata.** Se la rete manca o il permission model di Node la nega, il controllo fallisce in silenzio e il server funziona come prima.

## Requisiti delle agenzie (proposte, ruoli nella sessione)

**Privacy (GDPR, Vendor Compliance)**
- Il controllo della versione manda a npm solo la richiesta, senza parametri: npm vede IP e user agent, come quando npx scarica il pacchetto. Agentrica non riceve niente. Npm (GitHub) è titolare autonomo del suo registro, quindi non serve un accordo art. 28.
- Il README del pacchetto e le note legali del sito dicono le due connessioni (valutazione confermata, controllo della versione) e come spegnerle.
- Il modulo di valutazione mostra lo stesso avviso dell'anteprima di oggi (`NOTICE`) e parte con la pubblicazione spenta. Parte solo ciò che c'è nel modulo.

**Cybersecurity (AppSec)**
- La risposta del registro è un dato esterno: si accetta solo una versione semver valida (dimensione limitata, timeout). Nel testo per il modello entra solo quella versione, mai altri campi.
- L'URL del registro è fisso: come per le valutazioni, una variabile d'ambiente per i test vale solo su `127.0.0.1`.
- Il risultato dell'elicitation si valida come il resto (voto intero 1–5, commento al più `MAX_COMMENT`, booleano).

**Design (Information Architect, UX Writer, UI Designer, Accessibility)**
- Server: testi brevi e in italiano, come il resto del server. Il modulo ha come titolo il nome in codice dell'agente, un'etichetta per campo e l'avviso; per la versione nuova, una frase sola e il comando.
- Pagina `/installa`: si apre con il comando consigliato, poi «Scegli come installarlo» con una riga per modalità (per chi è, cosa fa) e un'ancora per ciascuna, perché chi arriva deve trovare il suo caso senza leggere tutto. Ogni comando ha il pulsante per copiarlo e coincide carattere per carattere con il README.
- Schede dei sistemi accessibili da tastiera e con il lettore di schermo (ruoli tab, frecce, scheda attiva annunciata); nessuno scorrimento orizzontale a 390 px, i comandi lunghi vanno a capo o scorrono solo nel loro blocco; contrasto WCAG AA.
- La sezione «Cosa non fa» elenca le due connessioni (valutazione confermata, controllo della versione su npm) e come spegnerle.

## Backlog

Proposta da confermare all'apertura.

| ID | Attività | Priorità |
|---|---|---|
| F23-01 | Prova con Claude Code: elicitation dentro e fuori da una chiamata, aspetto del modulo, rifiuto e annullamento | P0 |
| F23-02 | Valutazione con l'elicitation al cambio d'agente e dopo 30 minuti, una volta per agente, ripiego senza elicitation; test | P0 |
| F23-03 | Invito alla valutazione spostato in fondo al testo dell'agente (ripiego) | P2 |
| F23-04 | Controllo della versione sul registro npm, avviso nel primo tool, `--no-update-check`; test con un registro finto | P1 |
| F23-05 | Banner della versione nuova nel pannello | P2 |
| F23-06 | Comando `install`: `npm install -g` della stessa versione, registrazione `node <cartella globale>/…/server.js` con scope user tramite `claude mcp add` senza shell, reinstallazione per aggiornare, messaggio con i comandi manuali se mancano `claude`, npm o Node ≥ 22; test | P0 |
| F23-12 | Comando `add` (npx senza installazione): scope user predefinito, `--project` e `--local`, `cmd /c` su Windows; test | P1 |
| F23-13 | Sito: pagina `/installa` con modalità, requisiti, opzioni e funzioni, verifica, aggiornamento, disinstallazione e problemi comuni; link nel menu; comandi da `src/lib/scripts.ts` | P1 |
| F23-14 | Sito: schede Mac, Linux e Windows con il sistema preselezionato, accessibili, leggibili anche senza JavaScript; pulsante per copiare i comandi | P1 |
| F23-15 | Sito: in home il comando consigliato con il link a `/installa`; «Cosa non fa» corretta con le due connessioni; note legali sul controllo della versione | P1 |
| F23-16 | Sito: e2e per `/installa` (comandi uguali al README, schede, axe, 390 px) e revisione di design nell'app | P1 |
| F23-17 | Nomi dei prompt con il reparto (proposta: `business`, `cybersecurity`, `privacy`, `software`, `design`), presi dal catalogo; test; esempi nei README e nel sito aggiornati | P1 |
| F23-18 | Pannello: nome del reparto accanto alla sigla per gli agenti in uso e nelle valutazioni | P2 |
| F23-19 | `CHANGELOG.md` dalla 0.1.0 alla 0.6.0 con date dai tag; README che vi rimanda; il file entra nel pacchetto (`files`) | P1 |
| F23-20 | Sito: pagina `/rilasci` dal `CHANGELOG.md` della versione installata, link nel menu o nel footer, e2e | P2 |
| F23-07 | `init` con `cmd /c npx` nel `.mcp.json` su Windows; test | P1 |
| F23-08 | CI con i test unitari su `ubuntu-latest`, `macos-latest` e `windows-latest` | P1 |
| F23-09 | README del pacchetto (italiano e inglese): installazione con `add` per Mac, Windows e Linux, ambiti, «Permessi minimi» anche per Windows, connessioni, flag, novità della 0.6.0; comando di installazione del sito e note legali | P1 |
| F23-10 | Prova reale di `install` e `add` su Mac e su Windows (PowerShell e cmd) con Claude Code; Linux in CI | P1 |
| F23-11 | Versione 0.6.0 pronta al rilascio (il merge in `main` e il tag restano su richiesta, CONVENTIONS §13.8) | P1 |

## Criteri di accettazione

- In una sessione reale di Claude Code, caricando un secondo agente compare il modulo per il primo. Con un voto inviato la valutazione arriva una volta sola; con un rifiuto non si chiede più.
- Con un client senza elicitation il comportamento è quello di oggi.
- Con un registro finto che dà una versione più nuova, la risposta del primo tool contiene l'avviso con il comando. Con una versione uguale, senza rete o con `--no-update-check` l'avviso non compare e il server funziona.
- Una risposta del registro fuori formato non entra nel testo.
- `npx -y @agentrica/mcp@0.6.0 install`, lanciato in PowerShell, in cmd e in zsh o bash, installa il pacchetto. Dopo, un progetto qualsiasi aperto con Claude Code ha Agentrica senza altri passi; rilanciato con una versione nuova, la aggiorna.
- `npx -y @agentrica/mcp@0.6.0 add`, sugli stessi sistemi, registra un server che parte in Claude Code. Con `--project` il `.mcp.json` funziona sul sistema su cui è stato creato.
- I test unitari passano in CI su Linux, Mac e Windows.
- Nel menu dei comandi di Claude Code ogni agente si presenta con il reparto (es. `/agentrica:aisa-02-software`); il CHANGELOG della 0.6.0 segnala il cambio come incompatibile. Il tool `agente` accetta ancora `AISA-02`.
- Il pannello mostra «reparto AISA · Software».
- `/rilasci` nel sito elenca tutte le versioni dalla 0.1.0 con data e novità, lette dal `CHANGELOG.md` del pacchetto installato.
- Nel sito, `/installa` è raggiungibile dal menu e dalla home e copre tutte le modalità e le opzioni. Su Windows si apre da sola la scheda Windows. I comandi coincidono con il README della 0.6.0. `npm run verify:e2e` in `agentrica-site` è verde e la pagina è stata provata a 1280 e 390 px.
- `npm run verify` verde.
