# Quale modello scegliere

Slug: quale-modello · Descrizione: Modelli grandi e piccoli, livello di ragionamento, e come scegliere misurando invece che a intuito.

## In breve
Non tutti i compiti hanno bisogno del [modello linguistico](glossario.md#language-model) più grande. Un modello più piccolo, o lo stesso modello con un [livello di ragionamento](glossario.md#reasoning-effort) più basso, costa meno e spesso basta. Per sapere quando basta si misura su [casi di prova](glossario.md#test-case) con risposte note.

## L'idea
I fornitori offrono famiglie di modelli di taglie diverse. Per Anthropic, nei prezzi del 2026-11-03 raccolti nella fase F24, sono Opus, il più capace, Sonnet, intermedio, e Haiku, il più piccolo e veloce. Più il modello è grande, più costa ogni token e più in fretta consuma i limiti di un abbonamento.

Oltre al modello si può scegliere quanto deve ragionare prima di rispondere. Con un livello di ragionamento più alto il modello scrive più passaggi intermedi: sui problemi difficili aiuta, sui compiti meccanici è spesa in più.

La tentazione è usare sempre il modello migliore «per sicurezza». Ma un controllo meccanico, come verificare che ogni funzione abbia il suo test, non diventa più corretto con il modello più caro. Al contrario, un giudizio difficile, come valutare un'architettura, può peggiorare con un modello piccolo in modi che non vedi subito.

Il modo onesto di scegliere è misurare:

1. Prepara casi in cui conosci la risposta: progetti con difetti piantati, documenti con errori noti.
2. Esegui lo stesso compito con lo stesso testo su configurazioni diverse, più volte, perché c'è una parte di caso.
3. Conta i difetti trovati e i [rilievi falsi](glossario.md#false-finding), cioè i difetti inventati.
4. Fissa prima una soglia, per esempio «tutti i difetti del modello grande meno uno, nessun falso in più», e scegli il modello più piccolo che la supera.

Un rilievo falso pesa più di uno mancato: ti fa lavorare su un problema che non c'è e mina la fiducia nel resto del resoconto.

Infine, la scelta non è per sempre. Escono modelli nuovi, cambiano i prezzi, cambiano i testi dei ruoli: una misura vale per la versione su cui l'hai fatta.

## In AIgentrica
La fase F24 ha fatto la prima misura, con questo metodo: sette casi di prova, quattro configurazioni (Opus con ragionamento medio come riferimento, Opus con ragionamento basso, Sonnet, Haiku), due esecuzioni ciascuna, 56 in tutto. I risultati sono in [examples/risultati/2026-11-19-modelli.md](../../examples/risultati/2026-11-19-modelli.md). Rispetto a Opus con ragionamento medio, sul compito finito e a prezzi del 2026-11-03, Sonnet è costato il 52% in meno e Haiku il 96% in meno, pur usando più token.

Ma la soglia decide ruolo per ruolo. Nella terza ondata, sul design, Sonnet ha trovato gli stessi difetti di Opus per tre ruoli ma con un rilievo falso in più in una esecuzione, e quei ruoli sono rimasti sul modello della tua sessione: lo dice [examples/risultati/2026-11-27-ondata-3.md](../../examples/risultati/2026-11-27-ondata-3.md).

Il modello consigliato sta nel catalogo, nel campo `models` di [packages/catalog/src/departments.ts](../../packages/catalog/src/departments.ts), solo per i ruoli misurati. Gli altri hanno `inherit`, cioè usano il modello che hai scelto tu, ciascuno con il suo motivo: i direttori e i ruoli di giudizio, come l'architetto o il Code Reviewer, non sono stati misurati perché lì un errore costa caro; gli auditor neppure, perché un loro errore chiude un rilievo non risolto. Il server lo dice nel testo dell'agente, e la scelta resta a te. Il catalogo [/agenti](/agenti) del sito permette di filtrare per modello.

## Prova
Scegli un compito ripetitivo che fai spesso con il tuo assistente, per esempio «trova le funzioni senza test in questa cartella». Prepara una cartella di prova in cui sai già la risposta.

Eseguilo due volte con il modello che usi di solito e due volte con uno più piccolo (in Claude Code il comando `/model` lo cambia). Per ogni esecuzione annota:

- quante funzioni giuste ha trovato;
- quante ne ha segnalate per sbaglio;
- quanto ha consumato, se il tuo assistente lo mostra.

Se il modello piccolo supera la soglia che avevi fissato prima, usalo per quel compito.

## Termini
- [Modello linguistico](glossario.md#language-model)
- [Livello di ragionamento](glossario.md#reasoning-effort)
- [Caso di prova](glossario.md#test-case)
- [Rilievo falso](glossario.md#false-finding)
