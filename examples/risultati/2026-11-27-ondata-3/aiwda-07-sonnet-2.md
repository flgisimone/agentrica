AIWDA-07 · SHAULA — Senior Dashboard & Data Visualization Designer, reparto AIWDA (AI Web Design)

# Rapporto di revisione di `index.html` (cruscotto), in sola lettura

Progetto: Turnio, `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/68c857fd-4b52-436c-bf0e-5c657ef1d77d/scratchpad/copie/aiwda-07-3`. Audit: dashboard-index.

**Esito.** Ho trovato 12 rilievi: 4 P1, 6 P2 e 2 P3. Cinque grafici su sei hanno un problema che porta a una lettura sbagliata o impossibile. Non ho validato la correttezza dei numeri: non c'è una fonte di verità. Dove scrivo che i dati sono incoerenti, intendo incoerenza interna alla pagina.

## Come ho lavorato

- Ho letto `index.html`, `css/tokens.css`, `css/app.css` e le due schermate `schermate/index-computer.png` e `schermate/index-telefono.png`.
- Valori di grafici e contrasti sono ricostruiti dalle coordinate SVG nel sorgente (fatti calcolati), non letti dai dati.
- Non ho consultato la biblioteca: nessuna scheda è stata necessaria per questi rilievi. WCAG 2.2 è citata solo per i criteri 1.1.1, 1.4.1, 1.4.3, 1.4.11 e 1.4.10, senza scheda e quindi senza data di verifica. L'utente deve ricontrollare quei riferimenti.
- Sono il Sonnet di un subagent. Per i rilievi P1 propongo il riesame del direttore AIWDA-01 CANOPUS (non l'ho caricato in questa sessione).

## Rilievi

**DV-01 · P1 · Torta con percentuali che sommano 108%**
- Evidenza: `index.html` righe 52-59 (cerchi) e 62-69 (legenda). Legenda: 34+29+14+9+8+7+4+3 = 108%.
- Fatto: nei cerchi gli ultimi segmenti partono da offset -94, -101 e -105, quindi oltre il 100%. Il sesto arriva a 101, il settimo a 105, l'ottavo a 108. Nel disegno gli ultimi segmenti si sovrappongono e la torta non chiude.
- Rischio: i pesi dei ruoli sono falsati e il dato non è affidabile. L'impatto è alto perché è un grafico di costo.
- Correzione: far sommare le quote a 100 partendo dal dato sorgente, e correggere i valori o la legenda. Non posso dire quale delle due sia giusta (fonte mancante, `requires_human_review: true`).
- Alternativa: sostituire la torta con una barra orizzontale ordinata (vedi DV-02).

**DV-02 · P2 · Torta a 8 fette, tutte della stessa tinta blu, con ordine e legenda separati**
- Evidenza: righe 52-59, 62-69, schermata `index-computer.png`.
- Fatto: otto blu in sequenza da `#1f6feb` a `#ddf4ff`, con differenze tra fette adiacenti minime. L'ultima fetta (`#ddf4ff`) e il suo pallino quasi non si vedono sullo sfondo `#f6f7f9` (contrasto non testo sotto 1.4.11). Nessuna etichetta sulle fette.
- Impatto: per sapere quale fetta è quale bisogna confrontare una scala di blu con la legenda, e con 8 categorie non è fattibile. Ruoli piccoli (Pulizie 4%, Extra 3%) sono illeggibili.
- Correzione: barre orizzontali ordinate con etichetta e valore sulla barra, un solo colore (con il blu del tema), oppure raggruppare i ruoli piccoli in «Altro». Se resta una torta, al massimo 4-5 fette e quote scritte sulla fetta.

**DV-03 · P1 · Asse delle ore troncato (60-70) nel grafico a barre**
- Evidenza: riga 34 (commento «per vedere meglio le differenze»), righe 37-39 e 40-46.
- Fatto: le altezze sono coerenti con l'asse (18 px per ora), ma l'asse parte da 60. Lunedì (62) ha una barra di 36 px e sabato (70) di 180 px: sembra 5 volte più alto, mentre il rapporto reale è 1,13.
- Impatto: le differenze tra i giorni risultano enormemente esagerate. Chi guarda decide su turni e personale basandosi su un effetto ottico.
- Correzione: le barre partono da 0. Se interessa la variazione, mostrare le differenze rispetto alla media o una linea, ma non barre troncate. Mettere i valori sopra le barre (oggi stanno solo nel paragrafo alla riga 48) e l'unità «ore» nel titolo o nell'asse.
- Nota di coerenza: la somma 62+63+64+65+68+70+69 = 461 corrisponde al valore «Ore lavorate» (riga 29).

**DV-04 · P1 · Doppio asse con scale arbitrarie: le due linee suggeriscono una relazione che non c'è**
- Evidenza: riga 73 (commento sugli assi), righe 75-78, schermata `index-computer.png`.
- Fatto: il costo è tracciato su 0-8.000 € e gli incassi su 20.000-26.000 €. Ricostruendo dalle coordinate, il costo sale da circa 5.900 a 6.700 € e gli incassi scendono da circa 25.100 a 21.100 €. Le linee si incrociano a giugno-luglio e fanno pensare che il costo abbia «superato» gli incassi, cosa impossibile sui numeri reali.
- Impatto: il cruscotto dice il contrario di quello che serve: il vero problema è l'incidenza del costo sugli incassi, che passa da circa 23% a circa 32%. Questo è coerente con il 31% del KPI «Costo del lavoro» (riga 28), che però lì non ha spiegazione (vedi DV-07).
- Altri problemi: un asse destro con 20.000 € in basso non è 0; le etichette degli assi stanno all'angolo e non ci sono tick o griglia, quindi non si può leggere un valore su una linea; la legenda è solo un paragrafo di testo (riga 81) basato sul colore.
- Correzione: un solo grafico con la serie «Costo del lavoro in % degli incassi», con asse da 0, oppure due grafici piccoli affiancati ciascuno con il proprio asse a partire da 0. Etichette dirette sulle linee ed ultimo valore scritto.

**DV-05 · P2 · Informazione affidata solo al colore (rosso/verde) e colori fissi nel codice**
- Evidenza: righe 77-78 (`#cf222e`, `#1a7f37`), riga 81, e `css/tokens.css` righe 34-37.
- Fatto: le due serie si distinguono solo per rosso e verde; per chi ha discromatopsia sono quasi uguali (WCAG 1.4.1). Il rosso è un colore di stato (negativo) usato per il costo e il verde per gli incassi: la semantica promessa dai token è «errore/successo», qui invece sono due metriche neutre.
- Dissonanza: `tokens.css` ridefinisce `--color-danger` come `#e5534b`, ma gli SVG hanno i colori scritti nel codice (`#cf222e`), quindi il design system e il grafico non coincidono.
- Correzione: etichette dirette sulle linee, tratto diverso (pieno/tratteggiato) o marcatori diversi; colori dai token, scelti come serie di dati e non come stati.

**DV-06 · P1 · Ultima settimana incompleta mostrata come crollo dei ritardi**
- Evidenza: riga 87 (ultimo punto a y=130), riga 88 («9 nov»), riga 90 («Dati aggiornati a mercoledì 11 novembre»).
- Fatto: i valori ricostruiti sono circa 8, 7, 9, 8 e infine 1. L'ultimo punto è del 9 nov e i dati arrivano all'11 novembre, mercoledì: la settimana è in corso, con 2-3 giorni su 7.
- Impatto: chi legge vede «i ritardi sono crollati», ma è solo una settimana parziale. Un responsabile potrebbe credere a un miglioramento che non esiste.
- Correzione: segnare l'ultimo punto come parziale (tratteggio, marcatore vuoto, etichetta «in corso, dati al 11 nov») oppure non mostrarlo, o confrontare a parità di giorni. L'unità («numero di ritardi») e il periodo vanno nel titolo; il paragrafo alla riga 90 va unito al grafico, non lasciato come nota grigia.
- Segnalo anche che l'asse 0-12 non ha tick intermedi né valori sui punti.
- Non posso confermare l'anno e il giorno della settimana dai dati: `requires_human_review: true`.

**DV-07 · P2 · Indicatori senza contesto, unità, periodo o confronto**
- Evidenza: righe 28-30.
- Fatto: «Costo del lavoro 31%» (di cosa? degli incassi? del fatturato?), «Ore lavorate 461» (nessuna unità né periodo oltre il titolo di sezione, nessun confronto con la settimana precedente o con un obiettivo), «Assenze 4» (persone? giorni? ore?).
- Impatto: non si capisce se 31% o 461 siano buoni o cattivi; i numeri informano ma non guidano una decisione.
- Correzione: etichetta con definizione («Costo del lavoro in % degli incassi»), unità, variazione rispetto alla settimana scorsa (con segno e freccia + testo) e, se esiste, un obiettivo. Per «Assenze» scrivere «4 persone assenti» o l'unità reale.

**DV-08 · P2 · Gerarchia dei KPI invertita e valori a basso contrasto**
- Evidenza: `css/app.css` righe 40-41 e `css/tokens.css` riga 6; schermata `index-computer.png`.
- Fatto: l'etichetta è 18 px, bold e scura; il valore è 16 px, normale, grigio `#9aa0a6`. Il numero, che è la cosa importante, è la parte più debole. Contrasto di `#9aa0a6` su bianco circa 2,6:1 (calcolo mio), sotto il minimo 4,5:1 di WCAG 1.4.3.
- Stesso colore (`--color-muted`) usato per `.muted` a 13 px (righe 20, 48, 81, 90): anche i periodi e le note sono sotto soglia.
- Correzione: valore grande (per esempio `--font-size-xl` 28 px, bold, colore testo), etichetta più piccola e secondaria; un grigio più scuro per `--color-muted` (circa `#59636e` o simile da verificare con un calcolatore di contrasto).

**DV-09 · P2 · Alternative testuali assenti e dati non accessibili**
- Evidenza: righe 35, 74 e 84 (SVG senza `role`, `title` o `aria-label`); riga 51 (`aria-label="Torta del costo per ruolo"`).
- Fatto: tre grafici su quattro non hanno nome accessibile; quello della torta ha un nome, ma non i dati. Il grafico a barre ha i valori nel paragrafo alla riga 48 e la torta nella legenda, quindi lì i dati ci sono; il grafico a doppio asse e quello dei ritardi no, quindi un lettore di schermo non può ricostruirli (WCAG 1.1.1).
- Correzione: `role="img"` con titolo e breve descrizione per ogni SVG, e una tabella dati (anche `<details>`) per i due grafici linea.

**DV-10 · P2 · Grafici a larghezza fissa che tracimano su telefono**
- Evidenza: righe 35, 74, 84 (`width="560"`); `schermate/index-telefono.png`: l'immagine è larga 584 px mentre la barra di navigazione e le card finiscono a 390 px.
- Fatto: i grafici sono più larghi dello schermo e la pagina scorre in orizzontale (WCAG 1.4.10 Reflow). Sul computer occupano solo 560 px su 1280, con molto spazio vuoto.
- Correzione: `width="100%"` con `viewBox` e `preserveAspectRatio`, e un contenitore con `max-width`.

**DV-11 · P3 · Mancano tick, griglia e valori sui grafici a barre e a linee; etichette non centrate**
- Evidenza: righe 36-46, 75-79, 85-88.
- Fatto: l'asse del grafico a barre ha solo 3 valori; i grafici a linee non hanno marcatori sui punti né griglia, quindi non si può leggere un valore. Le etichette dei giorni (`x=70` per una barra centrata in 85) non sono centrate sotto le barre.
- Correzione: griglia leggera, tick a intervalli regolari, marcatori sui punti, etichette con `text-anchor="middle"`.

**DV-12 · P3 · Ordine e segnale in cima alla pagina: il banner non è un indicatore e i grafici non hanno una data comune**
- Evidenza: righe 22-24 e 20, 48, 81, 90.
- Fatto: il banner «3 scambi da approvare» sta come una card tra il titolo e i numeri, con l'emoji come unico segnale, e senza un collegamento alla pagina dove agire. Ogni grafico ha un periodo diverso (settimana, giu-ott, ultime 5 settimane) senza dichiararlo in modo uniforme; «settimana corrente» (riga 20) non è una data.
- Correzione: spostare il banner in una zona di avvisi con un link «Approva», e mettere sotto ogni titolo di grafico il periodo e l'unità nello stesso formato.

## Domande aperte

1. Qual è la fonte dei dati e la definizione del 31%? Il rapporto costo/incassi che ricostruisco (circa 32% a ottobre) coincide quasi, ma è un'inferenza.
2. Le percentuali della torta (somma 108%) sono un errore dei dati o di trascrizione? Serve la fonte.
3. L'ultima settimana dei ritardi (9 nov) è parziale come sembra dalla riga 90?
4. Esiste un obiettivo (per esempio un tetto al costo del lavoro) da mostrare accanto ai KPI?

## Limiti

- Non ho eseguito la pagina nel browser: la lettura è dal sorgente e dalle due schermate fornite.
- I valori ricostruiti dalle coordinate SVG sono approssimati.
- Contrasti calcolati a mano, non con uno strumento.
- Non ho esaminato le altre pagine (`dipendenti.html`, `impostazioni.html`, `turni.html`) né il comportamento dello script. Fuori dal mio ambito, ma segnalo che `<html lang="en">` (riga 2) e le voci «Settings» (riga 12) e «Dashboard» (riga 13) in una pagina italiana vanno viste dall'UX Writer e dall'accessibilità.

— AIWDA-07 · SHAULA
