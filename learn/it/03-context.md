# Contesto e token

Slug: contesto-e-token · Descrizione: Cosa legge davvero il modello a ogni richiesta, quanto ne può leggere e perché conviene tenerlo in ordine.

## In breve
Il [contesto](glossario.md#context) è tutto il testo che il modello legge per rispondere: istruzioni, conversazione, file, risultati dei tool. Ha un limite, la [finestra di contesto](glossario.md#context-window), e si misura in [token](glossario.md#token). Un contesto piccolo e pertinente dà risposte migliori e costa meno.

## L'idea
Il modello non ricorda niente fra una richiesta e l'altra. Sembra ricordare perché, a ogni messaggio, l'assistente gli rimanda tutta la conversazione fino a quel punto: le istruzioni di sistema, i tuoi messaggi, le sue risposte, i file che ha letto. Questo pacchetto è il contesto.

Due conseguenze. La prima: più la conversazione si allunga, più testo il modello rilegge a ogni passo, e ogni token letto si paga, in denaro o nei limiti dell'abbonamento. La seconda: la finestra di contesto ha un massimo. Quando la conversazione ci si avvicina, l'assistente deve riassumere o tagliare, e qualche dettaglio si perde.

Per stimare quanti token pesa un testo basta una regola grossolana: in media un token vale qualche carattere. AIgentrica usa «byte diviso quattro», ed è dichiarata come stima. Il conteggio esatto dipende dal modello e dalla lingua.

Un aiuto viene dalla [cache](glossario.md#cache). La parte iniziale del contesto resta uguale da un messaggio all'altro: istruzioni, file già letti. I fornitori la tengono pronta e la fanno pagare molto meno della prima lettura. Per questo conviene che le parti stabili stiano in cima e non cambino a ogni passo.

Cosa puoi fare in pratica:

- **Dai al modello solo quello che serve.** Un file intero di duemila righe quando ne servono trenta è rumore: il modello lo legge, lo paga e può distrarsi.
- **Una conversazione per compito.** Quando passi a un lavoro diverso, apri una sessione nuova. In Claude Code `/clear` svuota la conversazione; `/compact` la riassume quando è diventata lunga ma vuoi continuare.
- **Scrivi lo stato fuori dalla chat.** Decisioni, elenco delle cose da fare e risultati in file del progetto: la sessione nuova li rilegge e non perdi niente.

Il contesto è anche il motivo per cui un assistente sembra «non sapere» una cosa che gli hai detto un'ora prima: magari è stata riassunta via. Non è distrazione, è il limite della finestra.

## In AIgentrica
AIgentrica ha misurato quanto pesano i suoi testi prima di ridurli. Nella fase F40 la misura di base ha contato i byte di ogni parte del testo di un agente, in [examples/risultati/2026-11-25-baseline-contesto.md](../../examples/risultati/2026-11-25-baseline-contesto.md): da 6,2 a 8,7 KB per agente, di cui da 3,5 a 5 KB di regole comuni del reparto.

Le regole comuni si ripetevano identiche per ogni agente dello stesso reparto. Dalla fase F41 il server ricorda, per la sessione, a quali reparti le ha già mandate: il primo agente le riceve intere, i successivi solo un riferimento. Il risultato, in [examples/risultati/2026-11-25-contesto-compatto.md](../../examples/risultati/2026-11-25-contesto-compatto.md): uno specialista del software è passato da 6.301 a 2.604 byte, e un flusso completo da 47.676 a 44.395 byte (6,9% in meno), con gli stessi difetti trovati nelle prove. Il riferimento dice anche come riavere tutto con il parametro `full_rules`: dopo un `/compact` le regole potrebbero essere state riassunte.

Una cosa che sembrava un risparmio e non lo era: in F12 l'opzione `--agents` limita gli agenti offerti dal server, ma in Claude Code i prompt dei server non entrano nel contesto finché non li usi, quindi il vantaggio è un menu più corto, non meno token.

Anche il modo di lavorare su questo repository tiene a bada il contesto: in [AGENTS.md](../../AGENTS.md), sezione «Efficienza», ci sono una sessione per fase, letture mirate invece di file interi e uno strumento locale, tokensave, che restituisce solo il codice che serve.

## Prova
Prendi una conversazione lunga con il tuo assistente e chiediti quanto di quel testo serve ancora. Poi prova questo flusso per il prossimo compito:

1. Scrivi in un file `NOTE.md` del progetto cosa stai facendo e cosa hai deciso.
2. Apri una sessione nuova e chiedi all'assistente di leggere `NOTE.md` e continuare.
3. Quando dai un file, indica le righe o la funzione: «leggi `parseOrder` in `orders.ts`», non «leggi la cartella».

Se il tuo assistente mostra quanto contesto è occupato (in Claude Code il comando `/context`), guardalo prima e dopo aver letto un file grande.

## Termini
- [Contesto](glossario.md#context)
- [Finestra di contesto](glossario.md#context-window)
- [Token](glossario.md#token)
- [Cache](glossario.md#cache)
