# F29 — Verifica dei rilievi, valutazione e configurazione

**Obiettivo**: ricontrollare tutti i rilievi degli audit sul codice di oggi, rendere la valutazione degli agenti raggiungibile in ogni sessione e permettere di configurare Agentrica con un modulo invece che con i flag; correggere `install` su Windows e rilasciare.

> **Stato: completata** (aperta il 2026-11-19, chiusa il 2026-11-21, branch `fase/f29-configura-valuta` nei due repository). F29-02 tolta all'apertura: la 0.7.1 è già su npm (tag `v0.7.1`); `mcp-publisher publish` resta all'utente fuori fase.

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
| Backlog (apertura) | F29-01, F29-03/05, F29-04/06/07 confermati; F29-02 tolto (0.7.1 già pubblicata) |
| File | `~/.agentrica/config.json`, uno per utente; precedenza flag > file, chiave per chiave |
| Revisione del file | PRIV-CFG-01..03 e SEC-CFG-01..05 confermati (2026-11-19) |
| Progetti senza GitHub | Richiesta dell'utente all'apertura: chi non ha un account GitHub propone il progetto dal server MCP (prompt con modulo o tool con anteprima e conferma), il sito lo riceve in attesa e il titolare lo approva con `npm run projects`. In F29, dopo il resto, con revisione privacy e cybersecurity prima del codice (F29-08) |
| F29-08 (revisione) | PRIV-PRJ-01..04 e SEC-PRJ-01..04 confermati; link: qualsiasi `https://`; senza moduli il tool `submit_project` con anteprima e codice (2026-11-19) |
| Predefiniti (2026-11-21) | Alla prima installazione tutto acceso: pannello (con `open_panel` e `ask_user`), valutazioni e avviso di versione. `--no-panel` nuovo, `--panel` resta valido; `init` non scrive più `--panel`. Motivo: un utente ha chiesto «apri il pannello» e il modello gli ha detto di installarlo |
| Primo modulo | Solo se il file manca; se l'utente annulla si salvano i predefiniti e non si richiede; dopo si cambia con `configura` |

## Revisione privacy e cybersecurity del file (2026-11-19)

Ruoli: privacy (GDPR Specialist, Data Governance) e cybersecurity (Security Architect, AppSec). Proposte, da confermare.

| # | Requisito | Motivo |
|---|---|---|
| PRIV-CFG-01 | Contenuto minimo: `version`, `agents`, `panel`, `ratings`, `updateCheck`. Niente percorsi, nomi di progetto, date o identificativi | Nessun dato personale: il file resta sul PC dell'utente, Agentrica non ne riceve copia, quindi non è un trattamento di Agentrica e non serve una voce di registro |
| PRIV-CFG-02 | Il modulo dice dove salva, che vale dalla sessione successiva e come cambiarlo o cancellarlo; README e note legali del sito lo dicono al posto di «il server non scrive file» | Trasparenza: la promessa di oggi cambia |
| PRIV-CFG-03 | `ratings: true` non è un consenso: ogni invio resta con anteprima e conferma, come oggi | Il consenso è per singolo invio (F20) |
| SEC-CFG-01 | Percorso fisso da `os.homedir()`, nessuna variabile d'ambiente propria; nei test si cambia `HOME`/`USERPROFILE`. Rischio accettato (P3): un `.mcp.json` che cambia `HOME` sposta il file, ma può già passare i flag direttamente e il contenuto è a schema fisso | Un progetto non deve poter dirottare letture o scritture con una variabile di Agentrica |
| SEC-CFG-02 | Lettura stretta: al più 4 KB, solo le chiavi note con il tipo giusto, `agents` con le stesse regole di `--agents`. Un file non valido si ignora con una riga su stderr (senza il contenuto) e vale come mancante | Un file rotto non deve fermare il server in tutti i progetti |
| SEC-CFG-03 | Scrittura atomica: cartella `0700`, file temporaneo `0600` nella stessa cartella, poi `rename` | Niente file a metà, niente lettura da altri utenti del PC |
| SEC-CFG-04 | Con il permission model di Node senza permesso su `~/.agentrica`, niente lettura né modulo; `configura` lo dice e indica i flag | Il modo consigliato dal README resta in sola lettura |
| SEC-CFG-05 | Le risposte del modulo si validano prima di salvare (scelte booleane, squadra al più 500 caratteri e risolta con `selectSquad`); una squadra non valida non si salva e il modello lo riferisce | L'input dell'utente passa dagli stessi controlli dei flag |

## Revisione di F29-08: progetto proposto dal server MCP (2026-11-19)

Ruoli: privacy (GDPR Specialist, Legal, Data Governance), cybersecurity (AppSec, Network Security), business (Product Manager). Proposte, da confermare.

**Flusso.** `/mcp__agentrica__progetto` apre un modulo (nome, link, descrizione, reparti, agenti, nome da mostrare, consenso, licenza); l'invio del modulo è la conferma. Il server manda a `POST /api/projects` del sito i campi più la versione del pacchetto e riceve un codice. La proposta resta in Neon in attesa; `npm run projects` nel repository del sito la elenca accanto a issue e topic, `--add mcp:<codice>` la scrive in `src/data/projects.json`, `--decline` la rifiuta. `--no-ratings` toglie anche questo invio (unica opzione per «nessuna connessione ad Agentrica»).

| # | Requisito | Motivo |
|---|---|---|
| PRIV-PRJ-01 | Base giuridica: consenso (art. 6.1.a) e licenza del testo, due caselle obbligatorie nel modulo come nella issue di F26. Il nome da mostrare è facoltativo (predefinito «Utente di Agentrica»), niente email né account | Stesse basi della issue; minimizzazione |
| PRIV-PRJ-02 | Conservazione: una proposta in attesa si cancella dopo 90 giorni; rifiutata, subito; approvata, in Neon resta solo codice e stato (il testo vive in `projects.json`) | Nessuna copia oltre il necessario |
| PRIV-PRJ-03 | Rimozione senza GitHub: il codice ricevuto all'invio, con `/mcp__agentrica__progetto` e l'argomento `rimuovi`, ritira subito la proposta in attesa; se è pubblicata, `npm run projects` la segnala e si toglie entro 30 giorni, come da F26 | Chi non ha GitHub non può aprire la issue di rimozione |
| PRIV-PRJ-04 | Note legali: sezione «I progetti degli utenti» con il canale MCP, i dati, la conservazione, il codice e l'IP usato solo come hash con il sale del giorno per il limite | Trasparenza (artt. 13–14) |
| SEC-PRJ-01 | Stessa validazione di F26 sui testi (`plainText`, limiti, reparti e agenti del catalogo), nel server MCP prima dell'invio e nella route prima del database; corpo al più 4 KB, SQL fisso in una funzione del database | Input non attendibile verso un sito pubblico |
| SEC-PRJ-02 | Limite: 3 proposte al giorno per rete (hash dell'IP con il sale del giorno, come le valutazioni) | Spam senza un modulo pubblico, ma la route è raggiungibile da chiunque |
| SEC-PRJ-03 | Link: solo `https://`, senza credenziali né porta, al più 200 caratteri; nella scheda il link porta `rel="nofollow ugc noopener"` e accanto si vede il dominio | Un link fuori da GitHub può portare ovunque: lo filtra l'approvazione del titolare, il dominio visibile aiuta chi legge |
| SEC-PRJ-04 | Il codice è un UUID casuale; ritirare richiede il codice esatto e non dice se esisteva | Nessuna enumerazione delle proposte |

## Backlog

Confermato all'apertura (2026-11-19), senza F29-02; F29-08 aggiunto dall'utente.

| # | Task | Ruoli |
|---|---|---|
| F29-01 | Verifica di tutti i rilievi di `audit/` sul codice di oggi (0.7.x): chiusi ancora veri, rischi accettati ancora validi (SEC09-F5-04: nuove versioni di typescript-eslint e ts-morph; PRIV-PUB-01), parte rinviata di SEC-ARCH-01; esito nei JSON e in un report | Security, privacy, cybersecurity |
| F29-02 | Rilascio della correzione di `install` su Windows (0.7.1), con prova su Windows se possibile; poi `mcp-publisher publish` nel registro MCP (0.7.0 pubblicata dall'utente il 2026-11-19, la 0.6.0 saltata) | Backend, QA, DevOps |
| F29-03 | Prompt `valuta` (`/mcp__agentrica__valuta`): apre il modulo di valutazione per l'agente in uso o per uno scelto; senza elicitation torna al flusso di `rate_agent` | Backend, UX Writer, QA |
| F29-04 | Modulo alla prima chiamata di Agentrica nella sessione (`agente`, `elenca_agenti`, prompt): se non c'è ancora una configurazione salvata, chiede squadra, pannello, valutazioni e controllo della versione | Backend, UX Writer, QA |
| F29-05 | Prompt `configura` (`/mcp__agentrica__configura`): lo stesso modulo, quando l'utente vuole cambiare | Backend, QA |
| F29-06 | File di configurazione: posizione (proposta `~/.agentrica/config.json`), precedenza flag > file, contenuto minimo senza dati personali, permessi, README e note legali | Backend, privacy, cybersecurity |
| F29-07 | Verifica dell'elicitation nei client: Claude Code da terminale e in VS Code | QA |
| F29-08 | Proposta di un progetto dal server MCP, senza account GitHub: prompt `progetto` con modulo (senza elicitation tool con anteprima e conferma), `POST /api/projects` nel sito, coda in Neon, approvazione con `npm run projects`, link anche fuori da GitHub, note legali e rimozione | Backend, privacy, cybersecurity, UX Writer, QA |

## Criteri di accettazione (proposte)

- In una sessione con un solo agente l'utente può valutarlo dal comando `/mcp__agentrica__valuta`.
- Alla prima chiamata senza configurazione compare il modulo; la scelta vale anche nella sessione successiva; i flag di `add`/`install` hanno la precedenza.
- `npx -y @agentrica/mcp@0.7.1 install` funziona da PowerShell in una cartella con `node_modules`.
- Ogni rilievo di `audit/` ha un esito ricontrollato con data.

## Fatto

- **Configurazione (F29-04, F29-05, F29-06)**: `packages/mcp/src/config.ts` (lettura stretta, scrittura atomica 0600, modulo, `canUseConfig` per il permission model); `server.ts` con precedenza flag > file chiave per chiave, modulo alla prima chiamata di `agente`, `elenca_agenti` e dei prompt degli agenti se il file manca, prompt `configura` (senza moduli dà al modello la configurazione e il formato del file).
- **Valutazione (F29-03)**: prompt `valuta` con argomento `agente` facoltativo (l'ultimo in uso), anche per un agente non caricato o un modulo già chiuso; senza moduli il flusso di `rate_agent`.
- **Moduli non mostrati (F29-07)**: l'estensione VS Code di Claude Code gira in «print mode», dichiara `elicitation.form` e risponde `cancel` in circa 9 ms senza mostrare nulla (log del client del 2026-11-21). Un modulo chiuso in meno di 300 ms vale come non mostrato: niente salvataggio e, per il resto della sessione, i flussi senza moduli (anche la proposta di `rate_agent` nel testo dell'agente). Il difetto c'era dalla 0.6.0 per i moduli di valutazione.
- **Progetti senza GitHub (F29-08)**: `packages/mcp/src/showcase.ts`, prompt `progetto` (modulo, argomento `rimuovi`) e tool `submit_project` (anteprima e codice); nel sito `db/004-projects.sql`, `POST /api/projects` e `/api/projects/withdraw`, `parseSubmission` e origine `mcp` in `src/lib/projects.ts`, `npm run projects` che legge le proposte con `DATABASE_URL_MODERATOR`, scheda con dominio e `rel="nofollow ugc"`, `purge_projects()` nel job giornaliero, note legali.
- **Pannello di predefinito**: `DEFAULTS.panel` a `true`, opzione `--no-panel` (con `--panel` insieme è un errore) anche in `add`/`install`; con il permission model senza `net` o `child` il pannello si salta in silenzio se non l'ha chiesto un flag, e un avvio non riuscito ferma il server solo con `--panel` esplicito. `init` senza `--panel`; README, CHANGELOG e `starter/CONVENTIONS.md` aggiornati.
- **Rilievi (F29-01)**: 29 rilievi ricontrollati, esito in `ricontrollo_f29` di ogni JSON e in `audit/2026-11-19-f29/report-f29.md`; SEC09-F5-04 chiuso con typescript-eslint 8.73.0 (conferma dell'utente).
- **Testi**: i messaggi del server dicono «il comando configura/progetto di Agentrica» invece di `/mcp__agentrica__…`, che vale solo se il server si chiama `agentrica` (scelta dell'utente). README IT ed EN (configurazione, comandi, progetti, `submit_project`, frase «il server scrive un solo file»), CHANGELOG 0.8.0, versione 0.8.0 in pacchetto, `server.json` e README.

## Verifiche

- `npm run verify` verde: agentrica 142 test, sito 61 test e build. `npm audit` e `npm audit --omit=dev` a 0.
- e2e del sito `progetti.spec.ts` e `pubblicazione.spec.ts`: 14 passati (computer e telefono), con una scheda finta dal server MCP.
- Prova nel client (F29-07), estensione VS Code: il server 0.8.0 risponde, il modulo della configurazione non compare (vedi «Fatto»). Il comando si chiama `/mcp__agentrica-dev__…` perché il server di sviluppo ha quel nome. Il file salvato senza modulo è stato cancellato con il consenso dell'utente.
- I test usano una cartella personale finta (`HOME`, `USERPROFILE`): nei primi giri la prova delle valutazioni aveva scritto `~/.agentrica/config.json` dell'utente, cancellato subito.

## Rilascio 0.8.0 (2026-11-21)

Su richiesta dell'utente, pacchetto e sito in produzione insieme («sempre in parallelo, mai uno avanti e uno indietro»).

- **Pacchetto**: PR #24 in `main`, tag `v0.8.0`, release con provenance dopo l'approvazione dell'ambiente `npm`; `@agentrica/mcp@0.8.0` su npm. CHANGELOG con la data del 2026-11-21.
- **Registro MCP**: `mcp-publisher publish` dell'utente dopo un nuovo `login github` (token scaduto); `io.github.flgisimone/agentrica` 0.8.0 è latest (mancano 0.6.x, saltate).
- **Sito**: dipendenza a 0.8.0 e testi del pannello (home, `/installa`, comandi, vista Consumo) con `--no-panel`; verify (61 test e build), e2e completa (102 prove) e `npm audit --omit=dev` a 0; PR #11 in `main` e deploy Vercel. `db/004-projects.sql` eseguito dall'utente su Neon (tabelle e funzioni presenti).
- **Prova in produzione**: `/rilasci` con 0.8.0, note legali con `~/.agentrica/config.json`, `/installa` con `--no-panel`, `POST /api/projects` con corpo non valido 400, ritiro con un codice a caso 200 (funzione su Neon presente), senza scrivere dati.
- `develop` allineato a `main` nei due repository; `tokensave sync` fatto.

## Rilievi aperti

- **Progetti su Neon**: limite giornaliero, approvazione e pulizia provati solo con i test locali; da guardare alla prima proposta reale. Chiuso in F30 (F30-13, P2, 2026-11-22): su Neon invio, ref pubblico (SHA-256 del codice, verificato), ritiro immediato di una proposta in attesa, limite di 3 al giorno per rete (la quarta rifiutata), approvazione e rifiuto con `npm run projects`. La pulizia dopo 90 giorni si prova con il job in P5.
- **Moduli da terminale**: il modulo della configurazione e i comandi `valuta`, `configura`, `progetto` sono provati con il client MCP dei test e in VS Code (senza moduli), non ancora in Claude Code da terminale. Chiuso in F30 (F30-13, P1, 2026-11-22): in Claude Code 2.1.330 da terminale il modulo compare alla prima chiamata e salva `config.json` con le sole cinque chiavi; `configura` lo riapre con i valori salvati e cambia solo il campo scelto; `valuta` apre il modulo di AISA-02 e con Esc non parte nulla; `progetto` apre il modulo e invia.
- **Soglia di 300 ms**: semplice ed efficace oggi; se un client mostrasse davvero i moduli e li chiudesse da solo più tardi, servirà un altro segnale (es. `clientInfo`). Chiuso in F30 (F30-12): accettato dall'utente il 2026-11-21, si riapre se un client chiude i moduli da solo dopo più di 300 ms.
- SEC-ARCH-01: revisione obbligatoria del code owner con un secondo manutentore (invariato). Chiuso in F30 (F30-04): rischio accettato dall'utente il 2026-11-21, si riapre con un secondo manutentore.

