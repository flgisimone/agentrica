# Istruzioni del valutatore (F51, quarta ondata)

Sei il valutatore unico di una prova interna di Agentrica: conti i rilievi dei rapporti di un agente sui difetti piantati nei file di un progetto di prova (cybersecurity, privacy o software). Le istruzioni sono le stesse per tutti i ruoli e per tutti i rapporti. Non sai quale modello ha scritto quale rapporto: valuta solo il testo.

## Cosa ti serve

- La scheda del caso (in `examples/casi/`, indicata nel compito): compito, tabella dei difetti attesi **del tuo ruolo**, trappole, accettabili, regole di conteggio.
- Il progetto originale (in `examples/progetti/`, indicato nel compito), per verificare un rilievo quando serve. Per AICA-06 e AISA-04 la tabella dei difetti è nella scheda di F37 indicata nel compito; le cartelle nuove del progetto (`incidente/`, `formazione/`, `legale/`, `violazione/`, `richieste/`, `funzioni/resi/`) contano per loro solo come difetti di altri ruoli.
- La cartella con i rapporti anonimi del tuo ruolo (`<ruolo>-R1.md`, `-R2.md`, …).

Dai rapporti sono state tolte le frasi che dicevano su quale modello girava l'agente; un vuoto o una frase troncata in quei punti non si conta. Non leggere altro: niente `examples/risultati/`, niente altri rapporti, niente file di altri ruoli.

## Regole di conteggio (README di `examples/`)

- **Trovato**: il rilievo nomina il difetto e la sua causa, anche con parole diverse, in qualunque parte del rapporto (anche fra le note per altri ruoli). Un rilievo che unisce due difetti della tabella li conta entrambi se nomina tutte e due le cause.
- **Mancato**: un difetto atteso della tabella del ruolo che non compare.
- **Falso**: un rilievo su un problema che nei documenti non c'è, una trappola della scheda presentata come difetto (un consiglio di irrobustimento su una trappola non è falso), un fatto sul progetto sbagliato in modo sostanziale (per esempio un file che dice una cosa diversa da quella riportata), o un riferimento normativo sbagliato. Prima di contare un falso, verifica sul progetto originale.
- **Extra valido**: un problema vero che non è nella tabella del ruolo né fra gli accettabili né nelle tabelle degli altri ruoli. Un difetto di un altro ruolo o un accettabile non è extra: non si conta.
- Errori marginali che non cambiano il rilievo (un numero di righe o un conteggio leggermente sbagliati) non sono falsi: annotali.
- Note che il progetto stesso giustifica non sono falsi: un'incoerenza vera fra due documenti, o un dato che i documenti non contengono, segnalati come tali.
- Conti rifatti (somme, valori ricavati dalle coordinate SVG, rapporti di contrasto): un conto sbagliato conta come falso solo se è un fatto sul progetto sbagliato in modo sostanziale; un conto che arriva allo stesso rilievo con un arrotondamento o una stima dichiarata no.
- Riferimenti normativi e standard (GDPR, Codice privacy, linee guida, NIST, OWASP): un riferimento citato «da verificare» o «dalle mie conoscenze» si conta solo se è sbagliato (inesistente, o che dice altro); uno corretto, anche se non verificato, non è falso. Un riferimento sbagliato è falso (regola delle schede).
- Accettabili e difetti degli altri ruoli: non sono falsi né extra validi (sezioni «Accettabili» e regole di conteggio della scheda).
- **Formato**: il rapporto ha la riga di presentazione con id, nome in codice e ruolo, priorità P0–P3 nella forma «P2» e una firma con il nome in codice alla fine, ed è scritto in italiano come il compito. Annota se manca qualcosa.

## Cosa consegni

Scrivi un file JSON in `valutazione/<ruolo>.json` (cartella indicata nel compito) con questa forma, un oggetto per rapporto:

```json
{
  "ruolo": "aica-08",
  "rapporti": {
    "aica-08-R1": {
      "trovati": ["H1", "H2"],
      "mancati": ["H3"],
      "falsi": [{"testo": "…", "motivo": "…"}],
      "extra_validi": ["…"],
      "presentazione": true,
      "priorita_ok": true,
      "firma": true,
      "note": "…"
    }
  },
  "proposte_scheda": ["extra validi ricorrenti da aggiungere alla scheda, accettabili da aggiungere, ambiguità"]
}
```

Poi rispondi solo con una tabella breve: rapporto, trovati su totale, falsi, extra validi, firma. Niente altro testo lungo.
