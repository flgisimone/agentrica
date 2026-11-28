# Lavorare per fasi

Slug: lavorare-per-fasi · Descrizione: Come dividere un progetto in fasi con backlog e criteri di accettazione, così che ogni sessione con un agente parta e finisca in un punto chiaro.

## In breve
Una [fase](glossario.md#phase) è un pezzo di lavoro con un obiettivo, un [backlog](glossario.md#backlog) di attività e dei [criteri di accettazione](glossario.md#acceptance-criteria) da verificare alla fine. Scritte in file del progetto, le fasi danno all'agente lo stato che la chat non ricorda. Una sessione per fase tiene il contesto piccolo.

## L'idea
Un agente lavora bene su un compito chiaro e male su «fai il progetto». Le fasi traducono un progetto grande in compiti chiari, nell'ordine giusto. Ogni fase risponde a quattro domande:

- **Obiettivo**: cosa sarà vero alla fine, in una frase.
- **Backlog**: le attività, ciascuna con una priorità e un identificativo, così si può dire con precisione cosa è fatto.
- **Criteri di accettazione**: frasi che si possono verificare, possibilmente con un comando. «Il sito è veloce» non si verifica; «la pagina passa il test di accessibilità senza violazioni gravi» sì.
- **Stato**: da fare, in corso, completata.

Le fasi vivono in file, non nella chat. Dalla [lezione sul contesto](03-context.md) sai che la conversazione si perde; un file `plan/` con le decisioni prese e le fasi resta, e la sessione successiva lo rilegge in pochi secondi. Lo stesso vale per le persone: chi arriva domani nel progetto legge il piano.

Un ritmo che funziona:

1. **Pianificare** in una sessione a parte: si scrive la fase, la confermi, e basta. Niente codice.
2. **Sviluppare** in una sessione nuova, su un branch dedicato alla fase, con il piano come guida. Ciò che esce dal perimetro diventa una voce del backlog, non una modifica di passaggio.
3. **Verificare** con [controlli deterministici](glossario.md#deterministic-check): test, typecheck, lint, e un comando unico che li esegue tutti.
4. **Chiudere**: si aggiornano il piano con cosa è stato fatto e le evidenze, poi commit e merge con la tua conferma. Poi si apre una sessione nuova per la fase dopo.

Il vantaggio più grande è la fiducia. Quando l'agente dice «fatto», puoi controllare un elenco preciso invece di fidarti di una frase.

## In AIgentrica
AIgentrica è stata costruita così, dalla prima fase all'ultima. Il piano ha le decisioni con data e motivo e la tabella delle fasi; ogni fase ha il suo file, con «Fatto», «Verifiche» e «Rilievi aperti» alla chiusura. La procedura di chiusura è in [CONVENTIONS.md](../../CONVENTIONS.md), paragrafo 13.7: piano aggiornato, `npm run verify`, un'unica domanda di conferma per commit, merge e push, poi sessione nuova. Dalla fase F16 il metodo è scritto lì; le fasi dei rilievi, come F15, chiudono i problemi lasciati aperti dalle precedenti.

Il metodo arriva anche nei tuoi progetti. Dalla fase F18 il comando `init` copia un modello con il piano già impostato, [starter/plan/README.md](../../starter/plan/README.md); dalla F35 `init --existing` lo aggiunge a un progetto già avviato, con il piano creato leggendo il codice. Dalla F42 il tool `check` controlla la forma di `plan/` senza modelli, e il pannello locale mostra fasi, backlog e rilievi.

Anche questo percorso segue le fasi: a ogni chiusura si aggiorna la lezione toccata e si aggiunge la riga in [learn/fasi.md](../../learn/fasi.md), e `npm run verify` fallisce se una fase completata non ce l'ha.

## Prova
Scegli la prossima cosa che vuoi fare nel tuo progetto e scrivila come fase, in un file `plan/01-nome.md`:

```markdown
# F1 — Nome breve

**Obiettivo**: una frase su cosa sarà vero alla fine.

## Backlog

| # | Attività | Priorità |
|---|---|---|
| F1-01 | Prima attività | P1 |

## Criteri di accettazione

- Una frase che si verifica con un comando.
```

Poi apri una sessione nuova e chiedi al tuo assistente di sviluppare solo quella fase. Se vuoi che lo faccia con gli agenti di AIgentrica, il server si installa con un comando: [installa AIgentrica](/installa).

## Termini
- [Fase](glossario.md#phase)
- [Backlog](glossario.md#backlog)
- [Criteri di accettazione](glossario.md#acceptance-criteria)
- [Controllo deterministico](glossario.md#deterministic-check)
