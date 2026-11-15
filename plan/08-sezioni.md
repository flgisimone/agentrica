# F8 — Sezioni

**Obiettivo**: mostrare come lavora Agentrica, non solo dirlo. «Come lavoriamo» diventa una simulazione dello sviluppo nel progetto (diagramma di flusso e terminale), la sezione MCP smette di dire «presto» e fa vedere il server che esiste già, con i passi reali per usarlo oggi in locale.

> **Stato: da fare.** Scelte di fondo confermate dall'utente il 2026-11-15 (vedi «Decisioni»); le «Proposte da confermare» si decidono all'apertura.

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
- **Sezione MCP**: terminale con `claude mcp add agentrica …` e una chiamata a `/agentrica:aisa-02` con risposta abbreviata dal file di ruolo vero; accanto, tre passi (clona, installa, aggiungi al client) e i limiti dichiarati (solo locale, nessuna telemetria). Il badge «In sviluppo» diventa «Disponibile da un clone».
- **Componenti**: un `Terminal` riusabile (righe con tipo comando/output/conferma, cursore, velocità) condiviso dalle due sezioni.

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
