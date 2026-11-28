# Cos'è un modello linguistico

Slug: modello-linguistico · Descrizione: Cosa fa davvero il programma che ti risponde nella chat, e perché a volte sbaglia con sicurezza.

## In breve
Un [modello linguistico](glossario.md#language-model) è un programma che, dato un testo, prevede come continuarlo. Non cerca la risposta in un archivio: la costruisce un pezzo alla volta. Per questo è veloce e spesso utile, ma quello che scrive va controllato.

## L'idea
Quando scrivi una domanda a un assistente come Claude, il testo arriva a un modello linguistico. Il modello non legge parole intere: legge [token](glossario.md#token), pezzi di testo che possono essere una parola, una parte di parola o un segno di punteggiatura. Il nome di una funzione come `loadCatalog` può diventare più token.

Il modello fa una cosa sola, ripetuta molte volte: guarda tutti i token che ha davanti e calcola quale token è più probabile come seguito. Ne sceglie uno, lo aggiunge al testo e ricomincia. Una risposta di dieci righe sono centinaia di questi passi. Il calcolo che produce la risposta si chiama [inferenza](glossario.md#inference), e costa: ogni token letto o scritto consuma potenza di calcolo, che qualcuno paga.

Da dove viene la capacità di prevedere bene? Dall'[addestramento](glossario.md#training): prima di arrivare a te, il modello ha visto una quantità enorme di testo, codice compreso, e ha regolato miliardi di numeri interni per prevedere meglio il seguito. L'architettura usata oggi dai modelli più diffusi si chiama Transformer ed è stata descritta in un articolo del 2017, [Attention Is All You Need](https://arxiv.org/abs/1706.03762) (Vaswani e altri, 2017). Dopo questa prima fase i modelli per assistenti vengono addestrati ancora, per seguire istruzioni e rispondere in forma di dialogo.

Tre conseguenze pratiche, da tenere a mente in tutto il percorso:

- **Il modello non ha un archivio di fatti verificati.** Ha imparato come è fatto il testo plausibile. Quasi sempre il plausibile è anche vero; a volte no. Quando inventa un dettaglio con sicurezza (una funzione che non esiste, una norma con il numero sbagliato) si parla di [allucinazione](glossario.md#hallucination).
- **Il modello conosce il mondo fino alla data dell'addestramento.** Una libreria uscita dopo, o cambiata dopo, per lui non esiste, a meno che qualcuno non gliela metta davanti.
- **Il modello non conosce il tuo progetto.** Sa solo quello che gli arriva nel testo della richiesta. Come gli arriva, e quanto ne può leggere, è il tema della lezione su [contesto e token](03-context.md).

La stessa domanda può dare risposte diverse: nella scelta del token successivo c'è una parte di caso. Non è un difetto da correggere, ma un motivo in più per verificare il risultato invece di fidarsi della prima versione.

Questo non rende i modelli inutili. Li rende strumenti da usare come si usa un collega molto rapido e molto informato, ma che non ha visto il tuo codice e non sempre dice quando non sa: gli dai il materiale giusto, gli chiedi cose controllabili e controlli.

## In AIgentrica
AIgentrica è costruita su questa idea di confine. Il suo server non chiama nessun modello: compone testi, tiene lo stato della sessione e fa controlli che non dipendono dal caso. Il ragionamento lo fa il modello del tuo assistente. È una decisione scritta nel piano, «Confini del Core (F40)».

Un agente di AIgentrica, quindi, non è un programma che pensa: è un testo che il server consegna al tuo modello. Per esempio il ruolo dell'architetto software sta in [agents/ai_software_agency/02-senior-software-architect.md](../../agents/ai_software_agency/02-senior-software-architect.md). Il modello lo legge e prova a comportarsi come descritto.

Visto che i modelli sbagliano, AIgentrica li mette alla prova. In [examples/README.md](../../examples/README.md) ci sono piccoli progetti con difetti piantati apposta: si dà il progetto a un agente e si conta quanti difetti trova e quanti ne inventa. Nella misura del 2026-11-19, in [examples/risultati/2026-11-19-modelli.md](../../examples/risultati/2026-11-19-modelli.md), sul caso dei requisiti di un servizio in abbonamento il modello più piccolo, Haiku, in una delle due esecuzioni ha segnalato un difetto inesistente in più rispetto a Opus. Per quel ruolo Haiku non è stato scelto. Un errore inventato conta, perché ti fa perdere tempo a inseguirlo.

## Prova
Fai due esperimenti con il tuo assistente, in due chat nuove.

1. Chiedi la stessa cosa due volte, per esempio «spiegami in tre righe cos'è una promessa in JavaScript». Confronta le risposte: il senso è lo stesso, le parole no.
2. Chiedi «cosa fa la funzione principale del mio progetto?» senza dargli nessun file. Poi ripeti dandogli il file. Nota la differenza fra una risposta plausibile e una risposta basata sul tuo codice.

Se una risposta cita una funzione, un'opzione o un articolo di legge, cercalo nella fonte prima di usarlo.

## Termini
- [Modello linguistico](glossario.md#language-model)
- [Token](glossario.md#token)
- [Inferenza](glossario.md#inference)
- [Addestramento](glossario.md#training)
- [Allucinazione](glossario.md#hallucination)
