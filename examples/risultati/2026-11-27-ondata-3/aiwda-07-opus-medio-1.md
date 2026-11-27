AIWDA-07 · SHAULA — Senior Dashboard & Data Visualization Designer, reparto AIWDA (AI Web Design)

Consegna ad AIWDA-01 · CANOPUS. Non ho potuto caricare il direttore: in questa sessione non ho il tool `agent`.

# Revisione del cruscotto `index.html` (Turnio), in sola lettura

**Esito:** su 4 grafici, 3 ingannano: l'asse troncato, la torta che somma al 108% e il doppio asse. Il quarto rappresenta come un calo una settimana incompleta. I tre indicatori non hanno contesto e il numero è meno visibile dell'etichetta. Ho trovato 6 rilievi P1, 4 P2 e 1 P3. Nessun P0.

**Come ho lavorato:**
- Ho letto `index.html`, `css/app.css`, `css/tokens.css` e i documenti in `docs/` e `ricerca/`.
- Ho guardato le schermate `schermate/index-computer.png` e `schermate/index-telefono.png`. Non ho aperto un browser.
- I valori nascosti li ho ricavati dalle coordinate SVG.
- I rapporti di contrasto li ho calcolati a mano con la formula WCAG: vanno confermati con uno strumento.
- Per WCAG la fonte è la scheda della biblioteca wcag-2-2: W3C, WCAG 2.2, Recommendation del 5 ottobre 2023, verificata il 2026-11-19.

## Sintesi dei rilievi

| ID | P | Righe | Problema | Correzione |
|---|---|---|---|---|
| DV-01 | P1 | index 34–48 | L'asse delle barre parte da 60: sab (70) sembra 5 volte lun (62), ma la differenza reale è +13% | Asse da 0 e valori sulle barre |
| DV-02 | P1 | index 52–69 | La torta somma al 108%: gli ultimi spicchi si sovrappongono a «Cucina». Ha 8 spicchi dello stesso azzurro | Controllare i dati sulla fonte; barre orizzontali ordinate, con i valori |
| DV-03 | P1 | index 73–81 | Il doppio asse ha scale diverse (0–8.000 e 20.000–26.000): calo e incrocio delle linee sono un effetto grafico | Un asse solo da 0, oppure l'incidenza percentuale |
| DV-04 | P2 | index 77–78, 81 | Le due serie si distinguono solo per il colore, rosso e verde | Etichette dirette e linee di tratto diverso |
| DV-05 | P1 | index 84–90 | L'ultima settimana dei ritardi è incompleta (dati al mer 11 nov) e sembra un crollo. Non ci sono i valori | Segnare la settimana come parziale o escluderla; aggiungere i valori |
| DV-06 | P1 | index 28–30 | Gli indicatori non hanno unità, definizione, confronto né obiettivo | Definizione, unità e confronto con la settimana prima |
| DV-07 | P1 | app.css 40–42 | Gerarchia invertita: il valore è più piccolo dell'etichetta e grigio a circa 2,6:1 (WCAG 2.2, 1.4.3) | Valore grande e scuro, testo secondario ad almeno 4,5:1 |
| DV-08 | P2 | index 20, 48, 79, 90 | Periodi incoerenti: «settimana corrente», dati al mercoledì ma ore di sab e dom già presenti, mesi senza anno | Una riga di aggiornamento in alto e il periodo nel titolo di ogni grafico |
| DV-09 | P2 | index 35, 51, 61–69, 74, 84 | I grafici non hanno un'alternativa testuale (WCAG 2.2, 1.1.1). I pallini chiari della legenda non si vedono (1.4.11) | `role="img"` con un riepilogo, più una tabella dei dati |
| DV-10 | P2 | index 35, 74, 84 | Gli SVG sono larghi 560 px fissi: sul telefono la pagina scorre in orizzontale (WCAG 2.2, 1.4.10) | Larghezza fluida con `viewBox` |
| DV-11 | P3 | index 36–87; tokens.css 12, 31 | Colori scritti a mano: `--color-danger` è ridefinito a #e5534b, ma il grafico usa #cf222e | Usare i token |

## Rilievi (JSON)

```json
{
  "project": "Turnio – pannello web",
  "audit_id": null,
  "agent": "AIWDA-07 · SHAULA",
  "page": { "name": "Cruscotto", "url": "index.html" },
  "observations": [
    {
      "id": "DV-01",
      "type": "data_visualization",
      "title": "«Ore lavorate per giorno»: l'asse troncato a 60 amplifica le differenze",
      "description": "Fatto: la scala va da 60 a 70 (index.html 34–39; il commento alla riga 34 lo dichiara voluto). Le barre sono alte da 36 px (lun, 62 h) a 180 px (sab, 70 h), quindi sabato appare 5 volte lunedì, mentre la differenza reale è 70/62, cioè +13%. Senza la riga in grigio alla 48 i valori non si leggono: le uniche tacche sono 60, 65 e 70. La somma dei giorni fa 461 ed è coerente con l'indicatore.",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-computer.png", "location": "index.html righe 34–48; sezione «Ore lavorate per giorno»", "steps": ["Confrontare l'altezza delle barre (righe 40–46) con i valori della riga 48"] },
      "impact": "Il responsabile legge un picco del fine settimana molto più forte di quello reale e rischia di sovradimensionare i turni.",
      "priority": "P1",
      "confidence": 0.95,
      "recommendation": "Le barre partono sempre da 0: scala 0–70 (o 0–80) e via il commento della riga 34. Scrivere il valore sopra ogni barra e togliere la riga 48. Se interessa la variazione, mostrarla come scarto dalla media (66 h) in un grafico a punti, non con barre troncate.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "DV-02",
      "type": "data_visualization",
      "title": "«Costo del lavoro per ruolo»: la torta somma al 108%, gli spicchi si sovrappongono e non si distinguono",
      "description": "Fatto: le percentuali della legenda (righe 62–69) e i `stroke-dasharray` (righe 52–59) sommano a 34+29+14+9+8+7+4+3 = 108. Gli ultimi due spicchi hanno offset -101 e -105, oltre il 100 di `pathLength`, quindi ricominciano il giro e coprono l'inizio di «Cucina». Nella schermata lo spicchio più scuro sembra circa il 25%, non il 34%. Gli 8 spicchi sono tutti azzurri (da #1f6feb a #ddf4ff) e i primi tre si distinguono a malapena. La legenda è un elenco puntato con, in più, i pallini colorati, quindi ogni voce ha due marcatori. Non ci sono importi in euro. Inferenza: il dato di partenza è sbagliato, oppure sono percentuali arrotondate di insiemi diversi; senza la fonte non posso dirlo.",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-computer.png", "location": "index.html righe 51–70", "steps": ["Sommare le percentuali della legenda (righe 62–69): 108%", "Notare gli stroke-dashoffset -101 e -105 alle righe 58–59"] },
      "impact": "Le quote dei ruoli sono sbagliate: il costo della cucina appare più piccolo di quello che è. Il totale oltre il 100% toglie credibilità a tutto il cruscotto.",
      "priority": "P1",
      "confidence": 0.9,
      "recommendation": "Verificare i dati con chi ha la fonte di verità; le quote devono sommare al 100%. Sostituire la torta con barre orizzontali ordinate dalla più grande, con percentuale e importo in € su ogni barra. Basta un colore solo, perché la lunghezza porta il dato. Se si tiene la torta: al massimo 4–5 spicchi più «Altro», etichette sugli spicchi e una legenda senza puntini dell'elenco (`list-style: none`).",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "DV-03",
      "type": "data_visualization",
      "title": "«Costo del lavoro e incassi»: doppio asse con scale diverse",
      "description": "Fatto: l'asse di sinistra va da 0 a 8.000 €, quello di destra da 20.000 a 26.000 € (commento alla riga 73, etichette alle 75–76). Ricavati dalle coordinate: il costo passa da circa 5.730 € a circa 6.530 € (+14%), gli incassi da 25.000 € a 21.000 € (-16%). Sullo schermo gli incassi scendono dall'alto quasi al fondo e le due linee si incrociano a giugno–luglio. L'incrocio non ha significato: dipende solo dalla scelta delle due scale. Mancano tacche intermedie e griglia, quindi i valori non si leggono.",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-computer.png", "location": "index.html righe 72–81", "steps": ["Convertire i punti delle righe 77–78 con le scale delle righe 75–76"] },
      "impact": "Il calo degli incassi sembra un crollo e l'incrocio sembra il momento in cui il costo supera gli incassi, cosa falsa: il costo resta sotto il 32% degli incassi.",
      "priority": "P1",
      "confidence": 0.9,
      "recommendation": "Un solo asse da 0 € (0–26.000 €) per le due serie, con le etichette dei valori agli estremi. Meglio ancora, se è la decisione che si vuole sostenere: una linea sola con l'incidenza del costo sugli incassi in % (dai punti ricavati: circa 23% a giugno, circa 31% a ottobre), con una linea di riferimento per l'obiettivo se esiste. Così il grafico si collega all'indicatore del 31% (vedi DV-06).",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "DV-04",
      "type": "accessibility",
      "title": "Serie distinte solo dal colore rosso e verde",
      "description": "Fatto: le due linee hanno lo stesso tratto e si distinguono solo per il colore, #cf222e e #1a7f37 (righe 77–78). La legenda è una frase in grigio sotto il grafico: «Rosso: costo del lavoro. Verde: incassi.» (riga 81). Questo viola WCAG 2.2, 1.4.1 Uso del colore (livello A). Il rosso e il verde si confondono con la deuteranopia, e il rosso sul costo suggerisce un allarme che i dati non dicono.",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-computer.png", "location": "index.html righe 77–78 e 81", "steps": [] },
      "impact": "Chi non distingue rosso e verde non sa quale linea è quale. Tutti devono andare avanti e indietro fra il grafico e la didascalia.",
      "priority": "P2",
      "confidence": 0.85,
      "recommendation": "Mettere il nome della serie alla fine di ogni linea («Costo del lavoro», «Incassi»). Distinguere le serie anche per forma (una continua, una tratteggiata, o marcatori diversi) e usare colori neutri non semaforici, per esempio blu e arancio. Il rosso va tenuto per gli stati di allarme.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "DV-05",
      "type": "data_visualization",
      "title": "«Ritardi per settimana»: settimana in corso confrontata con settimane complete, nessun valore leggibile",
      "description": "Fatto: l'ultimo punto (9 nov, riga 87) vale circa 1, contro circa 7–9 delle settimane prima (valori ricavati: 8,3 · 7,2 · 9,3 · 8,3 · 1,0). I dati sono «aggiornati a mercoledì 11 novembre» (riga 90): la settimana dal lun 9 nov conta quindi 3 giorni su 7. Le uniche tacche sono 0 e 12, mancano griglia e valori. Inferenza: il crollo dipende dalla settimana incompleta, non da un miglioramento. Le coordinate danno valori non interi, che per un conteggio di ritardi sono strani: il dato va verificato.",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-computer.png", "location": "index.html righe 83–90", "steps": ["Convertire i punti della riga 87 con la scala 0–12 (y da 140 a 24)", "Confrontare con la data della riga 90"] },
      "impact": "Il responsabile vede un calo dei ritardi di quasi il 90% che non esiste e potrebbe allentare i controlli.",
      "priority": "P1",
      "confidence": 0.8,
      "recommendation": "Escludere la settimana in corso, oppure mostrarla distinta (punto vuoto o tratto tratteggiato) con l'etichetta «in corso, 3 giorni su 7». In alternativa usare una misura che si confronta anche su una settimana parziale, come i ritardi ogni 100 turni. Scrivere il valore su ogni punto, mettere le tacche intere da 0 a 12 e scrivere le date con il giorno come vuole il glossario («lun 12 ott»).",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "DV-06",
      "type": "data_visualization",
      "title": "Indicatori senza definizione, unità, confronto né obiettivo",
      "description": "Fatto: le tre schede (righe 28–30) mostrano solo etichetta e numero. «Costo del lavoro 31%» non dice di cosa è il 31%: degli incassi? Del budget? «Ore lavorate 461» non ha l'unità e non dice se le ore sono lavorate o pianificate. «Assenze 4» non dice se conta persone, turni o giorni. Non c'è confronto con la settimana prima né un obiettivo, quindi il numero non dice se va bene o male. Inferenza: il 31% coincide con l'incidenza di ottobre ricavata dal grafico costo/incassi, ma sono periodi diversi (settimana e mese).",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-computer.png", "location": "index.html righe 26–31; sezione «Numeri della settimana»", "steps": [] },
      "impact": "Il titolare non capisce se deve intervenire. Il numero si presta a letture diverse fra titolare e consulente.",
      "priority": "P1",
      "confidence": 0.85,
      "recommendation": "Per ogni scheda: nome con la definizione («Costo del lavoro sugli incassi»), valore con l'unità («461 h»), periodo, confronto con la settimana precedente (freccia più testo, non solo colore) e, se esiste, l'obiettivo. Esempio di struttura, i valori vanno dalla fonte: «Costo del lavoro sugli incassi · 31% · sett. prec. X% · obiettivo ≤ Y%». Per le assenze: «4 turni scoperti per assenza», con il collegamento all'elenco. Definire i termini in docs/glossario.md.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "DV-07",
      "type": "visual",
      "title": "Gerarchia invertita negli indicatori e testo grigio sotto il contrasto minimo",
      "description": "Fatto: `.kpi-label` è a 18px, grassetto 700, colore del testo; `.kpi-value` è a 16px, peso 400, `--color-muted` #9aa0a6 (app.css 40–41). Il numero, che è il dato, è l'elemento meno visibile della scheda. Ho calcolato a mano il contrasto di #9aa0a6: circa 2,6:1 su #fff e circa 2,5:1 sullo sfondo #f6f7f9. Lo stesso grigio è usato da `.muted` (app.css 42, 13px) per i valori della riga 48, per la didascalia della riga 81 e per la data della riga 90. Viola WCAG 2.2, 1.4.3 Contrasto minimo (AA, 4,5:1).",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-computer.png", "location": "css/app.css righe 40–42; css/tokens.css riga 6", "steps": [] },
      "impact": "Il numero principale e i dati dei grafici sono difficili da leggere, soprattutto su un telefono in un locale luminoso.",
      "priority": "P1",
      "confidence": 0.85,
      "recommendation": "`.kpi-value`: `font-size: var(--font-size-xl)` (28px), `font-weight: 700`, `color: var(--color-text)`. `.kpi-label`: `var(--font-size-sm)` (14px), peso normale. `--color-muted`: un grigio con almeno 4,5:1 su #f6f7f9 (per esempio intorno a #5f6670), da verificare con uno strumento.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "DV-08",
      "type": "data_visualization",
      "title": "Periodi e aggiornamento dei dati incoerenti fra le sezioni",
      "description": "Fatto: il sottotitolo dice «settimana corrente» (riga 20). La data di aggiornamento compare solo in fondo, sotto l'ultimo grafico (riga 90: mer 11 nov), eppure le ore lavorate includono già ven, sab e dom (righe 44–46 e 48). Il grafico costo/incassi è mensile (giu–ott, senza anno, riga 79), i ritardi sono settimanali e gli indicatori settimanali. Inferenza: le ore di fine settimana sono pianificate, oppure la data è di un'altra fonte; non posso stabilirlo senza la fonte di verità.",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-computer.png", "location": "index.html righe 20, 48, 79, 90", "steps": [] },
      "impact": "Non si sa a quale momento si riferisce ogni numero, e si rischia di confrontare dati di periodi diversi.",
      "priority": "P2",
      "confidence": 0.75,
      "recommendation": "Mettere una riga in alto, sotto il titolo: «Settimana lun 9 – dom 15 nov · dati aggiornati a mer 11 nov, 18:30». Indicare il periodo nel titolo di ogni grafico, per esempio «Costo del lavoro e incassi, giu–ott 2026». Distinguere le ore lavorate dalle ore pianificate, per esempio con barre piene e barre vuote.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "DV-09",
      "type": "accessibility",
      "title": "Grafici senza alternativa testuale; marcatori chiari sotto il contrasto non testuale",
      "description": "Fatto: gli SVG delle righe 35, 74 e 84 non hanno `role` né nome accessibile, quindi un lettore di schermo legge numeri sparsi («60 65 70 lun…») o niente. La torta (riga 51) ha `aria-label=\"Torta del costo per ruolo\"`, ma l'etichetta non contiene dati. I pallini #cae8ff e #ddf4ff della legenda (righe 68–69) e gli spicchi più chiari sono quasi invisibili su sfondo bianco o #f6f7f9. Viola WCAG 2.2, 1.1.1 (A) e, per i marcatori, 1.4.11 (AA).",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-computer.png", "location": "index.html righe 35, 51, 61–69, 74, 84", "steps": [] },
      "impact": "Gli utenti di lettore di schermo non ricevono i dati. Chi vede poco non associa le voci della legenda agli spicchi.",
      "priority": "P2",
      "confidence": 0.8,
      "recommendation": "Per ogni grafico: `<figure>` con `<figcaption>`, SVG con `role=\"img\"` e un `aria-label` che riassume il dato («Ore per giorno: minimo lun 62 h, massimo sab 70 h»), più una tabella dei dati, visibile o espandibile. Per i marcatori, colori con almeno 3:1 sullo sfondo; con le barre ordinate di DV-02 il problema sparisce.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "DV-10",
      "type": "visual",
      "title": "Grafici a larghezza fissa: sul telefono la pagina scorre in orizzontale",
      "description": "Fatto: gli SVG hanno `width=\"560\"` fisso (righe 35, 74, 84). Nella schermata da 390 px la pagina risulta larga circa 584 px: la barra del menu finisce a 390 px e i grafici escono a destra. Viola WCAG 2.2, 1.4.10 Ridisposizione (AA).",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-telefono.png", "location": "index.html righe 35, 74, 84", "steps": ["Aprire schermate/index-telefono.png e confrontare la larghezza del menu con quella dei grafici"] },
      "impact": "Sul telefono bisogna scorrere in orizzontale per vedere assi e ultimi valori, come l'asse destro degli incassi e «dom».",
      "priority": "P2",
      "confidence": 0.85,
      "recommendation": "Togliere `width` e `height` e tenere `viewBox`, con `svg { width: 100%; height: auto; max-width: 560px; }`. Sotto i 400 px, valutare barre orizzontali e un numero minore di etichette sull'asse.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "DV-11",
      "type": "consistency",
      "title": "Colori dei grafici scritti a mano invece dei token",
      "description": "Fatto: i grafici usano valori esadecimali (#1f6feb, #cf222e, #1a7f37, scala #2f81f7…#ddf4ff) invece dei token. Inoltre `--color-danger` è ridefinito in tokens.css riga 31 (#e5534b, contro #cf222e della riga 12), mentre il grafico usa ancora #cf222e: due rossi diversi per lo stesso significato.",
      "evidence": { "url": "index.html", "screenshot": null, "location": "index.html righe 36–87; css/tokens.css righe 12 e 31", "steps": [] },
      "impact": "Colori incoerenti fra grafici, badge e pulsanti; ogni cambio di palette va fatto a mano.",
      "priority": "P3",
      "confidence": 0.8,
      "recommendation": "Definire nei token una piccola palette per i grafici (serie 1 e 2, neutro, evidenza) e usarla con `fill=\"var(--…)\"` o con classi. Eliminare la doppia definizione di `--color-danger`.",
      "status": "Nuova",
      "requires_human_review": false
    }
  ],
  "tested_scenarios": [
    "Lettura del codice di index.html, css/app.css e css/tokens.css",
    "Confronto con schermate/index-computer.png (1280 px) e schermate/index-telefono.png (390 px)",
    "Ricostruzione dei valori dei grafici dalle coordinate SVG",
    "Calcolo manuale dei rapporti di contrasto con la formula WCAG"
  ],
  "limitations": [
    "Nessuna prova in un browser: lettore di schermo, zoom e tastiera non sono verificati.",
    "Non esiste una fonte di verità dei dati: non valido la correttezza dei numeri. I valori ricavati dalle coordinate sono approssimati.",
    "I rapporti di contrasto sono calcolati a mano e vanno confermati con uno strumento.",
    "Non ho caricato AIWDA-01 (CANOPUS) perché il tool agent non era disponibile.",
    "Lavoro come subagent: dato che ci sono 6 rilievi P1, propongo il riesame del direttore AIWDA-01 su Opus prima che diventino definitivi."
  ],
  "summary": "Tre grafici su quattro ingannano (asse troncato, torta al 108%, doppio asse) e il quarto mostra come un calo una settimana incompleta. Gli indicatori non hanno contesto e hanno il valore meno visibile dell'etichetta, con contrasto insufficiente. Le serie si distinguono solo per il colore, mancano le alternative testuali e sul telefono la pagina scorre in orizzontale."
}
```

## Domande aperte per l'utente e per AIWDA-01

1. Di cosa è il 31% del costo del lavoro: degli incassi o di un budget? C'è un obiettivo?
2. Le ore di ven, sab e dom sono lavorate o pianificate, visto che i dati sono aggiornati a mercoledì?
3. Qual è la fonte delle quote per ruolo, che oggi sommano al 108%?
4. Le interviste dicono che il responsabile di sala vuole sapere «chi manca oggi» (ricerca/interviste.md righe 16 e 39), mentre il cruscotto è pensato per il titolare. Va chiarito per chi è la prima pagina e quali indicatori ha, magari con l'UX Researcher.

— AIWDA-07 · SHAULA
