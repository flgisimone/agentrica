AIWDA-07 · SHAULA — Senior Dashboard & Data Visualization Designer, reparto AIWDA (AI Web Design)

Ho fatto la revisione in sola lettura di `index.html` nella copia del progetto (`/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/68c857fd-4b52-436c-bf0e-5c657ef1d77d/scratchpad/copie/aiwda-07-1`). Ho letto `index.html`, `css/app.css`, `css/tokens.css`, `docs/glossario.md` e `ricerca/sintesi.md`, e ho guardato le schermate `schermate/index-computer.png` e `schermate/index-telefono.png`. Non ho modificato nessun file. Ho ricavato i valori dei grafici dalle coordinate SVG: dove un valore è una mia inferenza lo scrivo. Non posso confermare che i dati siano giusti, perché manca una fonte di verità. Non ho potuto caricare il direttore AIWDA-01 perché in questa sessione non ho il tool `agent`: consegno al chiamante, e il consolidamento resta da fare con il direttore.

**Esito:** il cruscotto ha 11 problemi: 3 P1, 6 P2 e 2 P3. Non ci sono P0. Due grafici danno un'idea sbagliata dei dati: le barre con l'asse tagliato e il grafico a due assi. La torta somma al 108%. I numeri in alto non hanno contesto e la loro gerarchia visiva è al contrario.

## Rilievi

**SHAULA-01 · P1 · La torta somma al 108%** (righe 51-70)
- **Evidenza:** i segmenti della torta (`stroke-dasharray`) valgono 34+29+14+9+8+7+4+3 = 108. Il segmento «Pulizie» parte a -101 e «Extra» a -105, quindi superano il giro completo (`pathLength=100`) e si sovrappongono ai primi segmenti. Le percentuali della legenda sommano anch'esse al 108%.
- **Rischio di interpretazione:** le quote sono incoerenti e la parte di torta di «Cucina» appare più piccola del 34%.
- **Correzione:** ricalcolare le quote da dati che sommano a 100 (o dichiarare la base di calcolo) e generare gli offset dai dati invece che a mano.

**SHAULA-02 · P1 · «Ore lavorate per giorno» con l'asse che parte da 60** (righe 33-48, il commento alla riga 34 dice che è voluto)
- **Evidenza:** le barre partono da 60, non da 0. Sabato (70) è alta 180 px e lunedì (62) 36 px: sembra 5 volte tanto, mentre la differenza reale è del 13%.
- **Rischio di interpretazione:** la lunghezza della barra codifica il valore, quindi la base deve essere 0. L'asse tagliato ingigantisce differenze piccole.
- **Correzione:** portare la base a 0 (con altezza = valore × scala). Se conta la variazione, usare un grafico a punti o a linee con l'asse tagliato e dichiararlo. Mettere i valori sulle barre al posto della riga grigia della riga 48.

**SHAULA-03 · P1 · «Costo del lavoro e incassi» su due assi con scale diverse** (righe 72-81)
- **Evidenza:** l'asse sinistro va da 0 a 8.000 € e quello destro da 20.000 a 26.000 € (anche questo tagliato). Le due linee si incrociano a metà giugno-luglio.
- **Rischio di interpretazione:** l'incrocio non vuol dire niente, ma suggerisce che il costo abbia superato gli incassi. Il costo cresce solo da circa 5.900 a 6.700 € (inferenza dalle coordinate), ma la scala diversa ne cambia la pendenza apparente. Non c'è nessun valore scritto e non c'è nessuna griglia.
- **Correzione:** un solo grafico del rapporto costo/incassi in % per mese, coerente con il numero «Costo del lavoro 31%». In alternativa, due piccoli grafici affiancati, ciascuno con il suo asse da 0. Etichette dirette a fine linea con il valore.

**SHAULA-04 · P2 · I numeri in alto non hanno contesto** (righe 26-31)
- **Evidenza:**
  - «Costo del lavoro 31%» non dice 31% di che cosa (degli incassi?).
  - «Ore lavorate 461» non ha unità né confronto.
  - «Assenze 4» non dice se conta persone, turni o giorni.
  - Nessun numero ha un obiettivo o un confronto con la settimana prima. La ricerca lo chiede: `ricerca/sintesi.md` riga 7 parla di «confronto con l'anno precedente».
  - Il periodo è solo «settimana corrente» (riga 20), senza date.
- **Rischio di interpretazione:** non si capisce se un valore va bene o male.
- **Correzione:**
  - Etichette con base e unità: «Costo del lavoro sugli incassi», «Ore lavorate (h)», «Assenze (turni)».
  - Una variazione rispetto alla settimana prima, con freccia e testo, non solo colore.
  - L'obiettivo, se esiste.
  - L'intervallo di date nella forma del glossario, per esempio «lun 9 nov – dom 15 nov».

**SHAULA-05 · P2 · Gerarchia dei numeri al contrario e valori poco leggibili** (`css/app.css` righe 40-41)
- **Evidenza:** l'etichetta (`.kpi-label`) è a 18 px, grassetto. Il valore (`.kpi-value`) è a 16 px, normale, nel colore `--color-muted` #9aa0a6, che sul bianco ha contrasto circa 2,6:1 (mio calcolo). Lo stesso colore è usato per i valori dei grafici (riga 48) e per la data di aggiornamento (riga 90), in `.muted` a 13 px.
- **Rischio di interpretazione:** il dato principale è l'elemento meno visibile della scheda e non raggiunge il 4.5:1 richiesto da WCAG 2.2, 1.4.3.
- **Correzione:** valore a 28-32 px, grassetto, colore `--color-text`; etichetta a 14 px; un colore secondario con contrasto di almeno 4.5:1.

**SHAULA-06 · P2 · Torta con 8 categorie in tonalità di un solo blu** (righe 51-70)
- **Evidenza:**
  - Otto sfumature di blu, dal #1f6feb al #ddf4ff, per categorie che non hanno un ordine: è una scala sequenziale usata per dati nominali.
  - Le fette vicine non si distinguono, e quelle chiare (#cae8ff, #ddf4ff) sul fondo #f6f7f9 si vedono appena (WCAG 2.2, 1.4.11).
  - La legenda mostra un punto pallino dell'elenco più il pallino colorato (`ul` senza `list-style: none`).
  - Il grafico mostra solo le %, senza importi in €.
- **Rischio di interpretazione:** è difficile collegare una fetta alla sua voce e confrontare fette simili (Lavapiatti 9% e Pizzeria 8%).
- **Correzione:** barre orizzontali ordinate per valore, con l'etichetta della voce e il valore in % e in € su ogni barra, in un solo colore. Niente legenda.

**SHAULA-07 · P2 · Colori rosso e verde per distinguere le serie** (righe 77-78 e 81)
- **Evidenza:** le due serie si distinguono solo per il colore, rosso #cf222e e verde #1a7f37, spiegato in una nota a parte («Rosso: costo… Verde: incassi»).
- **Rischio di interpretazione:**
  - Chi non distingue il rosso dal verde non sa quale linea è quale (WCAG 2.2, 1.4.1).
  - Il rosso e il verde sono i colori di stato del design system (`--color-danger`, `--color-success`), quindi il costo sembra «un errore».
- **Correzione:** etichette dirette sulle linee e colori neutri per le categorie (per esempio blu e grigio scuro), con un tratteggio come secondo segnale. Rosso e verde solo per gli stati.

**SHAULA-08 · P2 · «Ritardi per settimana»: l'ultima settimana sembra un crollo** (righe 83-90)
- **Evidenza:**
  - L'ultimo punto (9 nov) scende a circa 1 dalle circa 8 delle settimane prima (inferenza dalle coordinate).
  - La nota «Dati aggiornati a mercoledì 11 novembre» indica che quella settimana è parziale (2-3 giorni).
  - L'asse ha solo 0 e 12, senza griglia, senza valori e senza unità (ritardi? minuti?).
- **Rischio di interpretazione:** si legge un miglioramento che non c'è.
- **Correzione:** escludere la settimana in corso o segnarla come parziale (punto vuoto o tratteggio, con «in corso» nell'etichetta); valori sui punti; titolo con l'unità, per esempio «Ingressi in ritardo per settimana».

**SHAULA-09 · P2 · I grafici non si adattano al telefono e non hanno un testo alternativo** (righe 35, 74 e 84)
- **Evidenza:**
  - Gli SVG hanno `width="560"` fisso. Nella schermata `schermate/index-telefono.png` la pagina si allarga a circa 584 px su un telefono di 390 px e il menu finisce a 390 px: c'è uno scorrimento orizzontale (WCAG 2.2, 1.4.10).
  - Tre grafici su quattro non hanno `role="img"` né un nome accessibile.
  - La torta ha un `aria-label` («Torta del costo per ruolo») ma senza dati (WCAG 2.2, 1.1.1).
- **Correzione:** `width="100%"` con `max-width` e il solo `viewBox`; `role="img"` e `aria-label` con la conclusione principale, più una tabella dei dati, che può sostituire la riga grigia della riga 48. Da far riesaminare all'Accessibility Specialist.

**SHAULA-10 · P3 · Periodi diversi nella stessa pagina senza dichiararli** (righe 20, 33, 72, 83, 90)
- **Evidenza:** i numeri e le barre riguardano la «settimana corrente», il grafico costo/incassi va da giugno a ottobre (mensile), i ritardi vanno dal 12 ottobre al 9 novembre (settimanale). La data di aggiornamento è solo in fondo.
- **Correzione:** dichiarare il periodo e la granularità nel titolo o nel sottotitolo di ogni grafico, e mettere la data di aggiornamento in cima.

**SHAULA-11 · P3 · Colori scritti a mano invece dei token** (tutti gli SVG; `css/tokens.css` righe 12 e 31)
- **Evidenza:** gli SVG usano colori esadecimali scritti a mano. `--color-danger` è definito due volte (#cf222e e #e5534b): vale il secondo, quindi il rosso del grafico (#cf222e) è diverso dal rosso dei badge.
- **Correzione:** usare i token e definire una palette dei grafici nel design system. Da girare al Design System Specialist.

## Cosa ho verificato

- Le coordinate SVG di ogni grafico e la coerenza con i valori dichiarati: le ore della riga 48 sommano a 461, uguale al numero in alto, e le barre corrispondono ai valori con base 60.
- La somma delle quote della torta.
- La resa su computer e su telefono, nelle due schermate.

## Limiti

- Non posso dire se i dati sono corretti: mancano le fonti, e il progetto dichiara che i dati sono inventati.
- I valori dei grafici a linee sono ricavati da me dalle coordinate.
- Il contrasto (circa 2,6:1) l'ho calcolato a mano, senza uno strumento.
- Non ho usato un browser né un lettore di schermo: ho visto solo le schermate statiche.

## Domande aperte

- Il 31% è costo del lavoro su incassi? Di quale periodo?
- Esistono obiettivi (per esempio un costo del lavoro sotto il 30%) da mostrare accanto ai numeri?
- «Assenze» conta persone, turni o giorni?
- Il banner «3 scambi da approvare» (riga 23) dovrebbe portare alla pagina dell'approvazione? Oggi non è un link: va girato all'UX Designer.

— SHAULA (AIWDA-07)
