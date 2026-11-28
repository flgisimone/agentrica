# Costi e consumo

Slug: costi-e-consumo · Descrizione: Da dove viene il costo di una sessione con un assistente, come leggerlo e come ridurlo senza perdere qualità.

## In breve
Ogni token letto o scritto dal modello è [inferenza](glossario.md#inference) che qualcuno paga: tu con l'API, o i [limiti dell'abbonamento](glossario.md#subscription-limits). Il costo cresce con il contesto riletto a ogni passo, con la taglia del modello e con il testo prodotto. La [cache](glossario.md#cache) e un contesto in ordine sono le leve principali.

## L'idea
Con l'API il prezzo è per milione di [token](glossario.md#token), separato fra token in ingresso (quello che il modello legge) e in uscita (quello che scrive); l'uscita costa di più. Con un abbonamento non vedi i dollari, ma consumi una quota che si azzera dopo alcune ore e una che si azzera ogni settimana. Il principio è lo stesso: più token, più consumo, e i modelli grandi consumano più in fretta.

Dove vanno i token in una sessione con un agente? Meno di quanto pensi nelle risposte, molto di più nella rilettura. Ricordi dalla [lezione sul contesto](03-context.md) che a ogni passo il modello rilegge tutto il contesto. Un agente che fa venti azioni rilegge venti volte istruzioni, file e risultati precedenti. Per questo:

- la parte stabile in cima al contesto, letta dalla cache, costa una frazione della prima lettura;
- un file grande letto all'inizio pesa su tutti i passi successivi, non solo su uno;
- una sessione lunga che cambia argomento paga di continuo un contesto che non serve più.

E un costo che non si vede: il lavoro rifatto. Una sessione interrotta a metà, un risultato sbagliato da correggere, un rilievo falso da inseguire costano token senza dare niente.

Cosa puoi fare, in ordine di effetto:

1. Contesto pertinente: solo i file e le righe che servono, una sessione per compito.
2. Il modello adatto al compito, scelto con una misura (lezione [quale modello scegliere](07-models.md)).
3. Parti stabili stabili: istruzioni e regole in file che non cambiano a ogni passo, così restano nella cache.
4. Strumenti che restituiscono meno testo: una ricerca mirata invece della lettura di una cartella.

Infine, misura. Senza numeri si ottimizza a caso. Molti assistenti salvano i token di ogni risposta; guardarli una volta alla settimana basta per capire dove vanno.

## In AIgentrica
Nei calcoli di AIgentrica i prezzi dell'API sono quelli del 2026-11-03, per milione di token in ingresso e in uscita: Opus 5.5 4 e 20 dollari, Sonnet 5.5 2 e 10, Haiku 5.5 0,10 e 0,50; la lettura dalla cache costa un decimo dell'ingresso. Sono scritti con la data in [packages/mcp/src/usage.ts](../../packages/mcp/src/usage.ts), lo stesso file che legge i consumi: Claude Code salva per ogni risposta modello, livello di ragionamento e token nei file del progetto in `~/.claude/projects/`, e il pannello locale li mostra per agente, modello, sessione e giorno. Di quei file si leggono solo i numeri, mai i testi delle conversazioni.

Nella misura di F24, in [examples/risultati/2026-11-19-modelli.md](../../examples/risultati/2026-11-19-modelli.md), la cache ha coperto dal 75 all'82% dei token, a seconda della configurazione. La stessa misura racconta anche il costo del lavoro rifatto: 27 tentativi fermati dal limite delle cinque ore dell'abbonamento hanno speso 532 mila token senza risultato, e sono stati rilanciati da capo.

Dalla fase F27 puoi mandare al sito i tuoi totali di token, solo dopo un'anteprima di cosa parte e il tuo sì: totali per giorno, agente, modello e livello di ragionamento, nessun testo o percorso. Le decisioni sono in [plan/27-consumo-sito.md](../../plan/27-consumo-sito.md). E le regole di lavoro del progetto, nella sezione «Efficienza» di [AGENTS.md](../../AGENTS.md), partono da qui: il costo di una sessione cresce con le chiamate e con la dimensione del contesto, perché ogni chiamata lo rilegge tutto.

## Prova
Guarda il consumo della tua ultima settimana. In Claude Code il comando `/cost` mostra il costo della sessione con l'API, e con un abbonamento `/usage` mostra i limiti. Con AIgentrica, il pannello locale mostra il consumo del progetto con i grafici.

Poi fai una prova su un compito qualsiasi:

1. Fallo in una sessione lunga, già piena di altro lavoro, e annota il consumo.
2. Fallo di nuovo in una sessione nuova, dando solo i file che servono.

Confronta i due numeri. La differenza è il prezzo del contesto che non serviva.

## Termini
- [Inferenza](glossario.md#inference)
- [Limiti dell'abbonamento](glossario.md#subscription-limits)
- [Cache](glossario.md#cache)
- [Token](glossario.md#token)
