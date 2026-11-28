# Impara

Il percorso di studio sull'IA del sito (`/it/impara`, `/en/learn`), costruito sugli esempi di AIgentrica (F53). Il pacchetto include questa cartella e la esporta con `@aigentrica/mcp/learn`; il sito la legge a versione esatta, senza copie dei testi. Formato e controlli: `packages/mcp/src/learn.ts` e `learn.test.ts`.

## File

- `it/NN-id.md` e `en/NN-id.md`: una lezione per file, stesso nome nelle due lingue, numerate da 01 senza buchi.
- `it/glossario.md` e `en/glossary.md`: il glossario, con gli stessi termini nello stesso ordine.
- `fasi.md`: ogni fase completata del piano con le lezioni collegate (id separati da virgola) o la nota «nessun concetto nuovo».

## Lezione

```markdown
# Titolo

Slug: segmento-dell-indirizzo · Descrizione: una riga per l'indice

## In breve
## L'idea
## In AIgentrica
## Prova
## Termini
```

In inglese le etichette sono `Slug` e `Description`, le sezioni «In short», «The idea», «In AIgentrica», «Try it», «Terms». Fra 600 e 1200 parole; frasi brevi, seconda persona, sigle sciolte, nessun numero di agenti o reparti, fatti sull'IA con fonte e data, nessun risultato inventato (CONVENTIONS §1 e §3).

Nei corpi solo paragrafi, elenchi, blocchi di codice, grassetto, codice in linea e link. I link, uguali e nello stesso ordine nelle due lingue:

- `glossario.md#id` (`glossary.md#id` in inglese): un termine del glossario. «Termini» contiene solo questi.
- `NN-id.md`: un'altra lezione.
- `../../percorso`: un file del repository, che deve esistere; «In AIgentrica» ne ha almeno uno. Il sito li porta su GitHub alla versione del pacchetto.
- `/percorso`: una pagina del sito, nella forma italiana senza lingua (il sito la traduce). L'ultima lezione porta a `/installa`.
- `https://…`: una fonte esterna.

## Glossario

```markdown
## Termine
Id: id-uguale-nelle-due-lingue

Definizione.
```

## Aggiornamento

A ogni chiusura di fase (CONVENTIONS §13.7) si aggiunge la riga della fase in `fasi.md` e si aggiorna la lezione toccata, in tutte e due le lingue; il `verify` del sito, dove sta il piano, fallisce se manca la riga di una fase completata (F56).
