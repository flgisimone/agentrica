# Più agenti insieme: l'orchestrazione

Slug: orchestrazione · Descrizione: Perché dividere un lavoro fra ruoli diversi, in che ordine farli lavorare e come passano le informazioni.

## In breve
L'[orchestrazione](glossario.md#orchestration) è il modo in cui più agenti si dividono un lavoro: chi parte, chi segue, cosa si passano. Un ruolo che coordina sceglie gli specialisti; ognuno lavora sul risultato del precedente con un [passaggio di consegne](glossario.md#handover) chiaro. Le decisioni importanti restano a te.

## L'idea
Un modello solo può scrivere codice, controllare la sicurezza e rivedere i testi. Ma se gli chiedi tutto insieme, mescola i punti di vista e tende a dare ragione al primo che ha preso. Dividere il lavoro in ruoli aiuta per lo stesso motivo per cui aiuta in un gruppo di persone: ogni ruolo ha un compito stretto, criteri suoi e domande sue.

Dividere però ha un costo. Ogni ruolo in più è testo in più nel contesto, e passare da un ruolo all'altro può perdere informazioni. Servono quindi tre regole.

- **Chi coordina.** Un ruolo che non fa il lavoro ma decide chi lo fa e in che ordine. Negli schemi di AIgentrica è il [direttore](glossario.md#director) del reparto.
- **Uno alla volta.** Gli specialisti lavorano in sequenza, ognuno partendo da quello che ha lasciato il precedente, invece che tutti insieme sul compito di partenza. Così il secondo vede i problemi trovati dal primo e non li ripete.
- **Cosa si passa.** Alla fine di ogni ruolo un passaggio di consegne con tre parti: l'esito, i [rilievi](glossario.md#finding) con la loro evidenza (file, riga, comando) e le domande aperte. Senza evidenza un rilievo non si può verificare; senza domande aperte chi segue crede che tutto sia deciso.

Conta anche l'ordine fra competenze diverse. Se costruisci prima e chiedi dopo cosa serviva, rifai il lavoro. Un ordine ragionevole per una funzione nuova: prima chi definisce obiettivo e requisiti, poi chi progetta l'esperienza, poi chi valuta i dati personali, poi la tua conferma, poi lo sviluppo, poi le revisioni. Si saltano i passaggi che non servono a quel compito.

Infine, il punto che rende l'orchestrazione sicura: gli agenti propongono, tu decidi. Priorità, scelte di architettura, rilievi accettati o respinti, commit e pubblicazioni passano dalla tua conferma.

## In AIgentrica
L'ordine è scritto nelle istruzioni del server e in [AGENTS.md](../../AGENTS.md): business, design, privacy, conferma dell'utente, software, revisioni di design e privacy, Code Reviewer, conferma dell'utente. Ogni reparto ha il suo flusso di lavoro nel README, per esempio [agents/ai_software_agency/README.md](../../agents/ai_software_agency/README.md); dalla fase F3 i README dei reparti hanno la stessa forma.

Le regole non si sono imposte da sole. Il caso di prova [examples/casi/orchestrazione-newsletter.md](../../examples/casi/orchestrazione-newsletter.md) chiede a un modello di costruire una funzione in un progetto nuovo, e la prova del 2026-11-22 in [examples/risultati/2026-11-22-orchestrazione.md](../../examples/risultati/2026-11-22-orchestrazione.md) mostra il prima e il dopo. Con la versione 0.9.0 il modello ha avviato due subagent per conto suo e non ha mai chiamato il server. Dopo la fase F34 lo stesso compito è andato così: elenco degli agenti, direttori di business, design e privacy uno alla volta, domanda all'utente, poi direttore del software e uno specialista. Nessun subagent.

Per vedere l'orchestrazione mentre succede c'è il pannello locale: dalla fase F52 la vista «Mappa» disegna ogni agente caricato in una corsia per reparto, nell'ordine delle chiamate. Il codice è in [packages/mcp/src/page/app.js](../../packages/mcp/src/page/app.js); la pagina [/orchestrazione](/orchestrazione) del sito spiega il flusso con un diagramma.

## Prova
Prendi una funzione piccola che vuoi aggiungere al tuo progetto, per esempio un modulo di contatto. Prima di chiedere il codice, chiedi al tuo assistente tre passaggi separati, in quest'ordine:

1. «Elenca i requisiti e i criteri di accettazione, con le domande aperte.»
2. «Partendo da questi requisiti, elenca i rischi per i dati personali e per la sicurezza.»
3. «Partendo da requisiti e rischi, proponi l'implementazione più piccola.»

Fra un passaggio e l'altro rispondi alle domande aperte. Confronta il risultato con quello che avresti ottenuto chiedendo subito il codice. Con AIgentrica collegato, puoi chiedere lo stesso lavoro e guardare nel pannello quali agenti vengono caricati e in che ordine.

## Termini
- [Orchestrazione](glossario.md#orchestration)
- [Passaggio di consegne](glossario.md#handover)
- [Direttore](glossario.md#director)
- [Rilievo](glossario.md#finding)
