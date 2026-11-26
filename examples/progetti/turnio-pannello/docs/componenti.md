# Componenti

Il design system del pannello. Tutti i colori, le spaziature e i raggi vengono dai token di [tokens.css](../css/tokens.css). Tutti i componenti supportano il tema chiaro e il tema scuro.

## Pulsante (`.btn`)

- Varianti: `.btn-primary` (una sola azione principale per vista), `.btn-secondary`, `.btn-danger` (azioni distruttive).
- Raggio `--radius-md`, altezza minima 40 px.
- Stati: normale, al passaggio del mouse, con il focus da tastiera, disattivato.

## Badge di stato (`.badge`)

- Varianti: `.badge-success` (presente), `.badge-warning` (in ritardo), `.badge-danger` (assente).
- Il badge ha sempre un testo, non solo il colore.

## Scheda (`.card`)

- Sfondo `--color-surface`, bordo `--color-border`, spaziatura interna `--space-4`.

## Campo di testo (`.field`)

- Etichetta sopra il campo, sempre visibile; il segnaposto non sostituisce l'etichetta.
- Messaggio di errore sotto il campo, collegato al campo.

## Finestra (`.modal`)

- Si apre sopra la pagina, porta il focus al primo elemento e lo restituisce alla chiusura; si chiude con Esc.
