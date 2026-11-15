# F8 — Sezioni

**Obiettivo**: mostrare come lavora Agentrica, non solo dirlo. «Come lavoriamo» diventa una simulazione dello sviluppo nel progetto (diagramma di flusso e terminale), la sezione MCP smette di dire «presto» e fa vedere il server che esiste già, con i passi reali per usarlo oggi in locale.

> **Stato: completata.** Proposte decise con l'utente all'apertura il 2026-11-15 (vedi «Scelte all'apertura»).

**Agenzie**: business (Product Marketing Manager) per i testi delle due sezioni; design (UX Designer per il ritmo della simulazione, UI Designer, Dataviz Designer per il diagramma, Accessibility Specialist, UX Writer) prima e dopo; software (Frontend, QA, Performance, Code Reviewer).

## Situazione di partenza

- `apps/site/src/app/page.tsx`, sezione `#metodo`: tre principi in card e il flusso dei reparti come pillole numerate.
- Sezione `#mcp`: badge «In sviluppo», titolo «Presto nei tuoi progetti», un paragrafo. Il pulsante «Usa gli agenti» dell'header porta qui.
- Il server MCP esiste da F5 (`packages/mcp`): stdio locale, un prompt per agente (`aisa-02`, argomento `compito`), tool `elenca_agenti` e `agente`. Installazione da un clone nel [README](../packages/mcp/README.md); il pacchetto npm arriva con F9.
- Rilievi aperti di F7: larghezza 768 px non guardata a occhio; costo per fotogramma dello sfondo non misurato.

## Decisioni (2026-11-15)

- **Simulazione in «Come lavoriamo»**: diagramma di flusso moderno sincronizzato con un terminale finto che riproduce lo sviluppo nel progetto (worktree o branch di fase, agenti attivati, `npm run verify`, domanda di conferma all'utente, commit e merge). Parte da sola quando entra nello schermo, con Pausa e Ricomincia (WCAG 2.2.2); con `prefers-reduced-motion` il terminale è completo e fermo. Etichetta visibile «Simulazione»: solo i passi del metodo reale, nessun risultato, cliente o numero inventato.
- **Sezione MCP**: dimostrazione di un client (Claude Code) che usa il prompt `aisa-02` e il tool `elenca_agenti`, più i passi reali per usarlo oggi da un clone. Con F9 i passi diventano il comando npm.

## Proposte da confermare all'apertura

- **Copione della simulazione**: un compito d'esempio realistico per questo progetto (es. «aggiungere i volti agli agenti», cioè F7), con 6–8 passi: richiesta → reparti coinvolti (business, design) → conferma → `git switch -c fase/…` o `git worktree add` → agenti software al lavoro → `npm run verify` → revisione del Code Reviewer → conferma → merge. Testo del terminale in italiano dove è output degli agenti, comandi veri dove sono comandi.
- **Diagramma**: nodi dei reparti nei loro accenti, i due nodi «La tua conferma» in evidenza; il nodo attivo si illumina mentre il terminale scrive. SVG e CSS, senza librerie nuove; su mobile il diagramma va in verticale sopra il terminale.
- **Principi**: le tre card restano accanto o sopra la simulazione, oppure diventano didascalie dei passi.
- **Sezione MCP**: terminale con `claude mcp add agentrica …` e una chiamata a `/mcp__agentrica__aisa-02` (sintassi del README) con risposta abbreviata dal file di ruolo vero; accanto, tre passi (clona, installa, aggiungi al client) e i limiti dichiarati (solo locale, nessuna telemetria). Il badge «In sviluppo» diventa «Disponibile da un clone».
- **Componenti**: un `Terminal` riusabile (righe con tipo comando/output/conferma, cursore, velocità) condiviso dalle due sezioni.

## Scelte all'apertura (2026-11-15)

- **Copione**: il compito di F7, «Aggiungi i volti degli agenti alle pagine», in 8 passi; privacy saltata in modo esplicito (nessun dato personale).
- **Disposizione**: diagramma verticale e terminale affiancati da 1024 px, diagramma sopra il terminale sotto.
- **Principi**: le tre card restano sopra la simulazione.
- **Sezione MCP**: come proposta, senza una seconda scena con `elenca_agenti` (i tool sono citati nel passo 3).

## Backlog

| # | Task | Priorità |
|---|---|---|
| F8-01 | Copione della simulazione e testi delle due sezioni con Product Marketing e UX Writer; **conferma dell'utente sul copione** | P1 |
| F8-02 | Componente `Terminal` (client): scrittura progressiva, Pausa e Ricomincia, partenza quando entra nello schermo, versione ferma con `prefers-reduced-motion`, testo leggibile dai lettori di schermo | P1 |
| F8-03 | Diagramma di flusso sincronizzato con il terminale, orizzontale da 1024 px e verticale sotto | P1 |
| F8-04 | Sezione «Come lavoriamo» con simulazione e principi | P1 |
| F8-05 | Sezione MCP: dimostrazione, passi da un clone, limiti dichiarati, badge aggiornato | P2 |
| F8-06 | Rilievi di F7: revisione a 768 px; profilo dello sfondo animato (Performance) e, se serve, meno nodi o griglia spaziale | P3 |
| F8-07 | Revisione di design nell'app (360, 768, 1440 px), e2e e axe per le sezioni nuove | P2 |

## Criteri di accettazione

- Il copione è quello confermato dall'utente; la simulazione è etichettata come tale e non contiene risultati inventati.
- La simulazione si mette in pausa e ricomincia da tastiera; con `prefers-reduced-motion` non si muove niente e il testo è tutto visibile.
- I comandi della sezione MCP sono quelli del README di `packages/mcp` e funzionano copiati così come sono (percorsi a parte).
- Nessuna dipendenza nuova senza conferma dell'utente.
- `npm run verify` e `npm run verify:e2e` passano.

## Fatto

- **F8-01** Copione e testi scritti nei ruoli di Product Marketing (AIBPD-08) e UX Writer (AIWDA-10), confermati dall'utente. Copioni in `lib/scripts.ts`: nomi in codice e ruoli dal catalogo, comandi MCP identici al README (un test lo controlla), estratto della missione di AISA-02 letto dal file di ruolo.
- **F8-02** `components/terminal.tsx` con la logica pura in `lib/terminal.ts`: comandi scritti a battute (al massimo 45 per riga), Pausa/Riprendi e Ricomincia, partenza al 35 % nello schermo, tutte le righe sempre nel layout (niente salti d'altezza), testo intero in una lista `sr-only`; con `prefers-reduced-motion`, sul server e senza JavaScript il terminale è completo e senza controlli.
- **F8-03** `components/simulation.tsx`: diagramma come lista ordinata, nodo in corso con `aria-current="step"` e accento del reparto, nodi «La tua conferma» con bordo pieno e rombo, privacy tratteggiata «saltata». Solo CSS, nessuna dipendenza nuova.
- **F8-04** «Come lavoriamo»: principi sopra (tre colonne da 768 px, prima 2 + 1 con una casella vuota), poi la simulazione etichettata.
- **F8-05** Sezione MCP: badge «Disponibile da un clone», dimostrazione con `claude mcp add` e il prompt `aisa-02`, tre passi copiabili, «Cosa fa e cosa non fa».
- **F8-06** Revisione a 768 px fatta (corretta la griglia dei principi). Sfondo misurato con Playwright: 0,3 ms di script per fotogramma (mediana) a 1440 × 900, 1,4 ms al 95° percentile a 2560 × 1440, 60 fps, nessun long task: nessun intervento.
- **Stacco fra le sezioni** (richiesta dell'utente alla chiusura): classe `.band` in `globals.css`, fascia navy (`--primary`, il colore dei pulsanti) a tutta larghezza su Reparti e MCP, alternata al fondo chiaro. Sulla fascia testo, focus e accenti chiari (testo secondario 8,7:1, accenti ≥ 6,3:1); card, terminale e codice restano bianchi con i token di `:root`. Poi, su richiesta dell'utente, nelle altre pagine dove serve: nel reparto la fascia su «Flusso di lavoro» e «Con gli altri reparti», nell'agente sulla navigazione Precedente/Successivo (il file di ruolo resta sul chiaro per la lettura). Lì la fascia porta `data-dept`, così l'accento del reparto si ricalcola chiaro. Footer senza margine sopra, attaccato all'ultima sezione (richiesta dell'utente).
- **Focus delle card dei reparti** (difetto preesistente, visto nella revisione): l'anello era sull'`::after` del link, tagliato da `overflow-hidden`, quindi invisibile. Ora sta sulla scheda con `has-[a:focus-visible]`.
- **F8-07** Revisione nell'app a 360, 768 e 1440 px, durante e a fine simulazione e con riduci movimento; e2e nuovi per pausa da tastiera, riduci movimento, testo per i lettori di schermo e passi del README.

## Verifiche

- `npm run verify` verde (33 test unitari, 5 nuovi su terminale e copioni).
- `npm run verify:e2e`: 52 superati, 1 saltato di proposito, 1 timeout in `agenti.spec.ts` (AIWDA, pagine non toccate da F8) che rilanciato passa: 16/16. axe senza violazioni serious o critical sulla landing.
- Prova sul sito costruito (`next start`) con Playwright e screenshot, nessun errore in console; non con `npm run dev`.

## Rilievi aperti

- Il repository è privato: «Disponibile da un clone» vale solo per chi ha accesso. In F10 (pubblicazione) il repository diventa pubblico o i passi passano al pacchetto npm. P1 per F9. Risolto in F10: il repository è pubblico.
- Sul telefono il diagramma (8 nodi, circa 500 px) sta sopra il terminale: la simulazione si vede dopo uno scorrimento. Da compattare se la revisione con l'utente lo chiede. P3. Chiuso in F15 per decisione dell'utente: resta così.
- Le prime prove dopo un build vanno a volte in timeout sul primo `goto` (visto in `agenti.spec.ts` e `landing.spec.ts`); rilanciate passano tutte. Da guardare se si ripete in CI (che ha già un retry). P3. Chiuso in F15: non riprodotto (e2e 59/59 al primo tentativo, nessun test instabile negli ultimi 10 run della CI).

Il seguito è in [09-simboli.md](09-simboli.md).
