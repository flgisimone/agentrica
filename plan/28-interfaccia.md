# F28 — Nuova interfaccia del sito

**Obiettivo**: il sito presenta Agentrica per quello che è diventata, uno strumento per sviluppatori (il server MCP con 56 agenti), con un'identità visiva da osservatorio stellare costruita sui nomi di stella e sui glifi, e un catalogo degli agenti con cui trovarne uno e usarlo in un minuto.

> **Stato: completata** il 2026-11-19 su `fase/f28-interfaccia` (in entrambi i repository); requisiti e backlog confermati all'apertura. Il sito in produzione cambia con il merge in `main` del repository del sito, a parte (CONVENTIONS §13.8).

**Agenzie**: design (UX, UI, Information Architect, Design System, UX Writer, Accessibility) per l'analisi e le specifiche; software (Frontend, QA, Code Reviewer). Ruoli nella sessione principale. Privacy e cybersecurity non servono: nessun dato, endpoint o fornitore nuovo.

## Analisi (2026-11-19)

1. **Posizionamento.** Hero e metadati dicono «Consulenza digitale», «Consulenza agentica»: il prodotto reale, il pacchetto npm, non è nel hero e l'azione principale porta ai reparti.
2. **Home lunga e mescolata** (circa 5.900 px a 1440): vetrina, simulazione, guida in 5 passi che ripete `/installa`, limiti e consumo.
3. **Nessun catalogo.** Per trovare uno dei 56 agenti si passa dal reparto giusto; niente ricerca né vista d'insieme.
4. **La pagina dell'agente non dice come usarlo**: mancano prompt, `--agents`, modello consigliato (già nel catalogo, `model`), fonte del file.
5. **Identità poco sfruttata**: nomi di stella e glifi chiusi in card da SaaS generico; lo sfondo a rete quasi non si vede.
6. **Dettagli**: badge chiaro di mcprush fuori tema nel footer; voci del menu che sono ancore della home («Come lavoriamo», «Prima di usarlo»); regole comuni del reparto nascoste in un accordion.

## Decisioni all'apertura (2026-11-19)

| Tema | Decisione |
|---|---|
| Posizionamento | Strumento per sviluppatori: hero con il comando d'installazione, catalogo in primo piano; i reparti restano l'organizzazione del catalogo. Il sito continua a dire che gli agenti sono IA e che Agentrica è un progetto, non una società reale |
| Direzione visiva | Osservatorio stellare: cielo notturno, griglia di coordinate, i 56 agenti come stelle raggruppate in cinque costellazioni (una per reparto), sigle in mono |
| Ambito | Nucleo: layout comune (header, footer, sfondo), home, nuovo `/agenti`, pagina agente, pagina reparto. Le altre pagine prendono solo token e layout nuovi |
| Tema | Solo scuro (decisione di F9 confermata) |
| Badge di mcprush | Resta l'immagine di F22, in una colonna del footer |
| Titolo della home | «Agentrica» resta il titolo grande, con il sottotitolo «56 agenti IA specializzati nel tuo Claude Code» |

## Requisiti di design (proposte, ruoli nella sessione)

**UI e Design System**
- Token: fondo più profondo (`#070b16`), superfici `#0e1527` e `#141d33`, bordi sottili; accenti dei reparti invariati (già AA). Inter e JetBrains Mono, nessun font nuovo.
- Sfondo comune: la rete animata (`network-background`) lascia il posto a un cielo statico in CSS (stelle e griglia di coordinate molto tenui), senza JavaScript e senza movimento.
- Etichette in mono maiuscolo con coordinate («RA», numeri di sezione `01 / 04`) come elemento ricorrente; card con bordo sottile e angolo a mirino invece dell'ombra.

**Information Architecture**
- Menu: Agenti, Reparti (tendina), Installa (pulsante), Rilasci; Progetti, Reputazione e Consumo restano condizionali. Escono le ancore «Come lavoriamo» e «Prima di usarlo».
- Nuova pagina `/agenti`: tutti i 56 agenti, ricerca per nome, ruolo o id, filtro per reparto (`?reparto=aisa`); senza JavaScript la lista completa.

**UX**
- Home in quest'ordine: hero (cosa è, comando da copiare, «Esplora gli agenti») con la mappa del cielo dei 56 agenti; «Come si usa» in tre passi (installa, squadra, chiama) con il link a `/installa`; i cinque reparti come costellazioni; il metodo con la simulazione esistente; «Cosa fa e cosa non fa» compatto; consumo e progetti come oggi, condizionali.
- Mappa del cielo: SVG con le cinque costellazioni; ogni costellazione porta al reparto, ogni stella ha il nome in codice nel titolo. Le sigle sono scritte accanto (non solo colore).
- Pagina agente: a destra un pannello «Usalo» con il prompt (`/mcp__agentrica__aisa-02-software`), il comando per caricare solo lui (`--agents aisa-02`), il modello consigliato quando non è `inherit`, il link al file su GitHub; pulsanti copia.
- Pagina reparto: costellazione del reparto nel titolo, comando per caricare tutto il reparto (`--agents aisa`), squadra, flusso, regole comuni visibili.

**UX Writer**
- Titolo della home: «Agentrica», poi «56 agenti IA specializzati nel tuo Claude Code»; testo: «Business, design, privacy, software e sicurezza: specialisti con un ruolo, un metodo e dei limiti dichiarati. Li chiami quando servono, decidi tu ogni passo.»
- Metadati: «Agentrica · 56 agenti IA per Claude Code».

**Accessibility**
- Un `h1` per pagina, ricerca con etichetta e conteggio dei risultati annunciato (`aria-live`), filtri come link o pulsanti con stato (`aria-pressed`/`aria-current`), mappa con link raggiungibili da tastiera e testo alternativo, contrasto AA, 360 px senza scorrimento orizzontale, niente movimento con «riduci movimento».

## Backlog

| ID | Attività | Repository |
|---|---|---|
| F28-01 | Token, sfondo a cielo statico, utility comuni; via `network-background` | sito |
| F28-02 | Header e footer nuovi (menu, footer a colonne) | sito |
| F28-03 | Home: hero con comando e mappa del cielo, tre passi, reparti, metodo, limiti | sito |
| F28-04 | Pagina `/agenti` con ricerca e filtro per reparto | sito |
| F28-05 | Pagina agente con pannello «Usalo» | sito |
| F28-06 | Pagina reparto con costellazione e comando del reparto | sito |
| F28-07 | Prove e2e aggiornate (landing, agenti, reparti) con axe; `verify` e `verify:e2e` | sito |
| F28-08 | Piano: decisione «Posizionamento» in `plan/README.md`, riga della fase | agentrica |

## Criteri di accettazione

- Il comando d'installazione si copia dal hero; `/agenti` trova un agente per nome, ruolo o id e filtra per reparto.
- Ogni pagina agente mostra prompt e comando della squadra, copiabili.
- `npm run verify` e `npm run verify:e2e` verdi, axe senza violazioni, 360 px senza scorrimento orizzontale.

## Fatto

- **F28-01** Token più profondi (`#070b16`, superfici `#0d1426` e `#141d33`), cielo di fondo in CSS (`body::before`: stelle fisse e griglia di coordinate), utility `reticle` (angoli a mirino) e `section-index`; via `network-background`. Marchio, icona, manifest e Open Graph sul nuovo fondo e sul nuovo posizionamento.
- **F28-02** Header: Agenti, Reparti, Rilasci, voci condizionali e «Installa»; via le ancore «Come lavoriamo» e «Prima di usarlo». Footer a quattro colonne (marchio con avvertenza e immagine di mcprush, Prodotto, Reparti, Note).
- **F28-03** Home: hero con «Agentrica», sottotitolo, comando d'installazione da copiare, «Esplora gli agenti» e la mappa del cielo (`sky-map.tsx`, `lib/sky.ts`: 56 stelle in cinque costellazioni con posizioni deterministiche, un link per reparto con la sigla scritta); «01 Come si usa» in tre passi con la dimostrazione; «02 I reparti» come righe di catalogo; «03 Come lavoriamo» con la simulazione; «04 Prima di usarlo». La guida in cinque passi resta in `/installa`.
- **F28-04** `/agenti`: i 56 agenti, ricerca per id, stella, ruolo e reparto (senza maiuscole né accenti), filtro per reparto con `aria-pressed` e `?reparto=` nell'indirizzo, conteggio annunciato, stato vuoto; senza JavaScript la lista intera.
- **F28-05** Pagina agente: pannello «Usalo» con il prompt, il comando con la squadra del solo agente, reparto, modello consigliato e link al file su GitHub (`agentCommands` in `lib/scripts.ts`).
- **F28-06** Pagina reparto: costellazione del reparto accanto al titolo, comando per caricare tutto il reparto (`departmentSquad`), regole comuni visibili in due colonne (via l'accordion e `ui/collapsible`).
- **F28-07** Prove e2e aggiornate (landing, agenti con il catalogo, reparti); test unitari per la mappa e i comandi.
- **F28-08** Piano: decisioni «Posizionamento» e «Identità visiva», riga della fase; tabella «Stato» del README con F26–F28.

## Verifiche

- `npm run verify` nel sito: typecheck, lint, test unitari e build verdi.
- `npm run verify:e2e` nel sito: 102 prove su computer (1440) e telefono (360), con axe senza violazioni serious o critical e nessuno scorrimento orizzontale. Un selettore del nuovo test del catalogo, troppo largo, è stato corretto e la spec rilanciata (22 su 22).
- Prova visiva con screenshot a 1440 e 390 px di home, `/agenti`, reparto e agente.

## Rilievi aperti

- **F28-R1 (P3)** Nel catalogo l'ultima riga può restare incompleta (56 agenti su tre colonne, e i risultati filtrati): accettato, la lista cambia con la ricerca.
- **F28-R2 (P3)** Su telefono le sigle della mappa del cielo sono piccole (circa 11 px): le costellazioni restano link grandi e i reparti sono nella sezione subito sotto e nel menu.
- **F28-R3 (P3)** Installa, rilasci, consumo, reputazione, progetti e note legali hanno solo token e layout nuovi, come deciso: un ritocco dedicato se serve.
