AIWDA-07 · SHAULA — Senior Dashboard & Data Visualization Designer, reparto AIWDA (AI Web Design)

**Rapporto a AIWDA-01 · CANOPUS: revisione in sola lettura di `index.html` (cruscotto), audit_id `aiwda-07-2`**

Ho letto `index.html` per intero, `css/app.css` e `css/tokens.css` (solo le regole che toccano numeri e grafici) e le schermate `schermate/index-computer.png` e `schermate/index-telefono.png`. Non ho aperto un browser, non ho modificato file e non ho avviato processi. Non ho una fonte di verità sui dati: non giudico la correttezza contabile, solo coerenza interna e lettura. Su WCAG ho letto la scheda `wcag-2-2` (W3C, 2.2, verificata il 2026-11-19, da ricontrollare entro il 2027-05-19). La scheda elenca solo i criteri nuovi della 2.2, quindi per 1.4.1, 1.4.3 e 1.4.11 cito i criteri senza aver letto il testo in biblioteca. Su questo modello più piccolo, per i rilievi P0 e P1 propongo il riesame di CANOPUS o di un revisore su Opus prima che diventino definitivi.

Nessun P0.

## Rilievi

**1. Grafico «Ore lavorate per giorno»: asse troncato a 60, le barre mentono (P1)**
- Evidenza: `index.html:34-46`. Il commento dichiara l'asse «da 60 a 70»; la linea di base a y=190 vale 60 (`:37`).
- Fatto: sab 70 è alto 180 px e lun 62 è alto 36 px, cioè 5 volte. Nei dati (`:48`) la differenza è del 13% (70 contro 62). Le barre codificano il valore con la lunghezza, e l'occhio la legge come proporzione. Nelle schermate la domenica sembra quasi doppia del lunedì.
- Impatto: il responsabile legge picchi enormi (sabato quasi 5 volte il lunedì) dove c'è una variazione lieve. Il rischio è sovrastimare il bisogno di personale nei fine settimana o sottostimarlo nei giorni feriali.
- Correzione: asse da 0, e a questa scala le barre diventano quasi uguali, che è la verità. Se serve vedere le differenze, usare una linea o dei punti con asse troncato dichiarato, oppure un indicatore di scostamento («+13% sab su lun»). Aggiungere i valori sopra le barre (`:48` oggi li ripete in testo piccolo e grigio) e le righe guida a 0/20/40/60/80.
- Confidenza 0,95.

**2. Grafico «Costo del lavoro e incassi»: due assi con scale diverse e troncate (P1)**
- Evidenza: `index.html:72-81`. Il commento a `:73` dichiara costo 0–8.000 € a sinistra e incassi 20.000–26.000 € a destra; le etichette sono a `:75-76`.
- Fatto: ricalcolando dalle coordinate, il costo sale da circa 5.900 € a circa 6.700 € (linea rossa), mentre gli incassi scendono da circa 25.100 € a circa 21.100 € (linea verde). Le linee si incrociano a metà del grafico, ma l'incrocio è solo un effetto dei due assi indipendenti e non ha significato (i valori reali non si incontrano mai). Sembra un «sorpasso» che non esiste.
- Fatto: le linee non hanno etichette sulle estremità né titoli sugli assi. Il significato sta solo nella legenda testuale sotto (`:81`, «Rosso: costo del lavoro. Verde: incassi.»).
- Fatto: i valori puntuali non sono leggibili, ci sono solo gli estremi degli assi.
- Impatto: il titolare può concludere che il costo sorpassa gli incassi o che l'andamento è simmetrico. Inoltre il calo degli incassi (circa -16%) è la notizia vera e resta nascosto nella forma del grafico.
- Correzione: un solo asse a zero non è proporzionato (8.000 contro 26.000), quindi due grafici impilati con lo stesso asse temporale oppure un unico indicatore, il rapporto costo/incassi (%) per mese, che è la grandezza che interessa. Etichettare le linee direttamente e non con la legenda; aggiungere i valori su inizio e fine.
- Confidenza 0,9.

**3. Torta «Costo del lavoro per ruolo»: le percentuali sommano 108% (P1)**
- Evidenza: `index.html:52-59` (fette) e `:62-69` (legenda): 34+29+14+9+8+7+4+3 = 108.
- Fatto: le dasharray (`:52-59`) si sovrappongono, per esempio l'ultima fetta parte a 105 su 100. Nelle schermate le fette finali coprono quelle precedenti, quindi non sono in proporzione ai valori dichiarati.
- Fatto non verificabile da me: quali valori siano giusti. Lo segno per riesame umano (`requires_human_review: true`).
- Impatto: un totale che non torna toglie fiducia a tutto il cruscotto e la torta è disegnata in modo sbagliato.
- Correzione: correggere i dati alla fonte, non il grafico; il totale deve fare 100%.
- Confidenza 0,95.

**4. Torta: forma sbagliata, 8 fette, colori indistinguibili (P1)**
- Evidenza: `index.html:51-70`, schermate computer e telefono.
- Fatto: 8 categorie con otto sfumature dello stesso blu (`#1f6feb`… `#ddf4ff`). Sul fondo `#f6f7f9` le due più chiare (`#cae8ff`, `#ddf4ff`) quasi spariscono (contrasto circa 1,1:1, sotto il minimo 3:1 di WCAG 1.4.11 per elementi grafici). Le fette non hanno etichette: per sapere qual è «Sala» bisogna accoppiare la sfumatura al pallino della legenda, e le sfumature di una scala sequenziale non si distinguono tra loro (soprattutto per daltonici). Il nome non è mai associato al valore sulla fetta.
- Fatto: il confronto richiesto («chi pesa di più») è tra categorie, non una parte di un tutto con poche parti.
- Impatto: il responsabile non riesce a dire quale ruolo costa di più, né a confrontare Bar con Lavapiatti.
- Correzione: barre orizzontali ordinate dal valore maggiore, con nome e valore sulla riga (etichette dirette), un solo colore e l'assegnazione di accento solo al ruolo che interessa. Se si vuole tenere la torta: al massimo 4-5 fette, il resto in «Altri», etichette sulle fette, fette separate da un bordo.
- Confidenza 0,9.

**5. Legenda e pallini: markup e leggibilità (P3)**
- Evidenza: `index.html:61-70`; `css/app.css:54`, `.legend` senza regola (non trovata).
- Fatto: i pallini misurano 10 px e la lista ha anche i punti elenco (si vede nelle schermate: puntino nero più pallino colorato), con colore trasmesso solo dal pallino.
- Correzione: togliere i punti elenco, pallini più grandi, o meglio etichette dirette (vedi 4).
- Confidenza 0,85.

**6. Indicatori senza contesto: «Numeri della settimana» (P2)**
- Evidenza: `index.html:28-30`.
- Fatto: «Costo del lavoro 31%» non dice di cosa è il 31% (degli incassi? del fatturato?), né se sia buono o cattivo. «Ore lavorate 461» e «Assenze 4» non hanno unità (ore? giorni? persone?), né confronto con la settimana precedente o un obiettivo, né definizione («assenza» include ferie e malattia?). Nessun segno di tendenza.
- Coerenza interna (inferenza): le ore per giorno sommano 461 (62+63+64+65+68+70+69), quindi quel KPI è coerente col grafico. Il 31% è plausibilmente costo/incassi (costo e incassi di ottobre, dal grafico: 6.700/21.100 = 32%), ma è un'inferenza mia non confermata: non posso dire se sia giusto.
- Impatto: numeri isolati non sostengono una decisione («è troppo?»).
- Correzione: aggiungere sotto ogni numero un contesto (variazione sulla settimana scorsa e/o obiettivo) e un'unità («461 ore», «4 persone assenti»). Definire il 31% («31% degli incassi»).
- Confidenza 0,85.

**7. Gerarchia invertita nelle card dei KPI (P2)**
- Evidenza: `css/app.css:40-41` (`.kpi-label` 18px/700 scuro, `.kpi-value` 16px/400 grigio `--color-muted`).
- Fatto: il valore è più piccolo e più chiaro dell'etichetta. Il numero, che è il dato, è l'elemento meno visibile. Il grigio `#9aa0a6` su `#ffffff` (card) ha un contrasto di circa 2,6:1, sotto il 4,5:1 del criterio WCAG 1.4.3 (verifica mia sui valori esadecimali: non ho misurato i pixel).
- Impatto: il responsabile deve cercare il numero; chi vede poco non lo legge.
- Correzione: valore a 28-32 px, peso 700, colore del testo; etichetta piccola e secondaria, 14 px muted ma con contrasto da almeno 4,5:1.
- Confidenza 0,9.

**8. Testo secondario e assi con contrasto insufficiente (P2)**
- Evidenza: `css/tokens.css:6` (`--color-muted: #9aa0a6`), usato da `.muted` (`css/app.css:42`, 13 px) per i sottotitoli di `index.html:20`, `:48`, `:81`, `:90`.
- Fatto: circa 2,5:1 sul fondo `#f6f7f9`, sotto 4,5:1 (WCAG 1.4.3) a 13 px. Ci sono dentro dati veri (i valori per giorno a `:48`, la data di aggiornamento a `:90`).
- Correzione: un grigio non più chiaro di circa `#5f6670` per il testo piccolo.
- Confidenza 0,85.

**9. «Ritardi per settimana»: unità assente, ultimo punto incompleto (P2)**
- Evidenza: `index.html:83-90`.
- Fatto: l'asse mostra solo 0 e 12 senza unità (numero di ritardi? minuti?). I valori sono ricavati dalle coordinate: circa 8,3 / 7,2 / 9,3 / 8,3 e 1,0. Nessun punto ha un'etichetta.
- Fatto: il caduta finale (9 nov, circa 1) è disegnata come un crollo, ma la nota dice «Dati aggiornati a mercoledì 11 novembre» (`:90`), quindi la settimana del 9 nov è in corso. Inferenza: è un dato parziale mostrato con lo stesso peso delle settimane complete; non posso dirlo con certezza (`requires_human_review: true`).
- Impatto: il «miglioramento» può essere un artefatto, e si può approvare una conclusione sbagliata (i ritardi sono calati).
- Correzione: unità nel titolo («Ritardi per settimana (numero)»), etichette sui punti, e l'ultima settimana tratteggiata o segnata «in corso».
- Confidenza 0,75 (fatto) / inferenza sul dato parziale.

**10. Possibile incoerenza: sabato e domenica «della settimana corrente» (P2, richiede verifica umana)**
- Evidenza: `index.html:20` («settimana corrente»), `:44-46` e `:48` (sab 70, dom 69) con `:90` (aggiornato a mercoledì).
- Inferenza: se il cruscotto è di mercoledì, sab e dom della settimana corrente non possono avere ore già lavorate. Non so cosa rappresentino quei valori (previsione? settimana scorsa?). Il titolo non lo dice.
- Correzione: dichiarare periodo e natura del dato («settimana 9-15 nov, previsto/lavorato»).
- Confidenza 0,6.

**11. Grafici a larghezza fissa: sul telefono escono dalla pagina (P2)**
- Evidenza: `index.html:35` (`width="560"`), `:51` (260), `:74` (560), `:84` (560); `schermate/index-telefono.png`: il menu si ferma a circa 390 px, i grafici arrivano a 560 px, quindi la pagina scorre in orizzontale.
- Fatto: i testi interni sono a 12 px nella scala di viewBox 560 per 560 px (a schermo piccolo e con scorrimento, sono illeggibili in fretta). Il responsabile di sala usa il pannello al volo.
- Correzione: `width="100%"` con viewBox e `height: auto` (CSS `max-width:100%`), e dimensione dei testi pensata per la larghezza reale.
- Confidenza 0,85.

**12. Accessibilità dei grafici: solo la torta ha un nome, nessun grafico ha l'alternativa testuale (P2)**
- Evidenza: `index.html:51` (`role="img" aria-label="Torta del costo per ruolo"`, nessun dato); `:35`, `:74`, `:84` senza `role` né nome. Il `<text>` degli assi è contenuto nel grafico ma non ha una tabella equivalente tranne la riga di `:48`.
- Fatto: chi usa un lettore di schermo sente «Torta del costo per ruolo», non i valori, e per gli altri tre grafici sente solo i testi sparsi. Per la torta la legenda a `:61-70` contiene i dati (bene), per gli altri due grafici a linee no.
- Correzione: `role="img"` con `aria-labelledby` sul titolo e un riepilogo del dato; una tabella dei valori sotto ogni grafico (anche `<details>`).
- Confidenza 0,8. Il dettaglio WCAG va ad AIWDA-… accessibilità (specialista dedicato), qui solo come dato.

**13. Colori: rosso e verde come unico segnale e valori fissi nel markup (P3)**
- Evidenza: `index.html:77-78`, `:81`.
- Fatto: costo e incassi si distinguono solo per rosso e verde (WCAG 1.4.1, uso del colore); per un daltonico sono identici. Inoltre rosso = «male» e verde = «bene» non corrisponde ai dati (il costo è la quantità che sale, la voce «buona» (incassi) cala).
- Fatto: i colori sono scritti nel markup (`#cf222e`, `#1a7f37`, `#1f6feb`), ma i token definiscono due volte `--color-danger` (`css/tokens.css:12` `#cf222e`, `:31` `#e5534b`): il rosso del grafico non coincide con quello di sistema.
- Correzione: etichette dirette sulle linee, colori da token (non dal markup), e non usare rosso/verde per due grandezze che non sono «buono/cattivo».
- Confidenza 0,8.

**14. Banner «3 scambi da approvare» senza azione e con emoji (P3)**
- Evidenza: `index.html:22-24`.
- Fatto: è l'elemento più importante in alto per il compito frequente (approvare gli scambi), ma è solo testo: nessun link verso `impostazioni.html` dove vivono gli scambi. Il pittogramma campanella non ha alternativa. Sta nella stessa classe `card` delle card dei KPI.
- Correzione: renderlo un link («Vai agli scambi») o un pulsante. Resta da stabilire con CANOPUS se è un rilievo di flusso (UX) più che di dati.
- Confidenza 0,7.

**15. Coerenza delle scale e delle griglie (P3)**
- Evidenza: `index.html:36-39` e `:85-86`.
- Fatto: assi con soli due o tre valori (60/65/70 e 0/12), senza righe guida: i valori reali non si leggono, solo l'ordine di grandezza. Alcune etichette dell'asse del tempo non sono centrate sui punti/barre (per esempio `:79`, «giu» a x=60 e punto a x=60: ok; `:88` «12 ott» a x=50 su punto a x=60: spostato di 10 px).
- Correzione: righe guida leggere e valori sui punti.
- Confidenza 0,7.

## Scenari verificati
- Lettura di `index.html` e dei CSS indicati; controllo delle schermate computer e telefono.
- Ricalcolo dei valori dalle coordinate SVG (stime), somma delle ore per giorno (461) e somma delle percentuali (108%).
- Contrasti stimati dai valori esadecimali.

## Limiti
- Nessuna fonte di verità: non posso dire quali valori siano giusti, solo quali non tornano tra loro.
- Non ho misurato i contrasti sui pixel né provato un lettore di schermo o un browser.
- Non ho letto `js/app.js` (non ha effetto sui valori visibili in `index.html`, ma non l'ho verificato) né le altre pagine.
- Il testo di WCAG 1.4.1, 1.4.3, 1.4.11 non è nella scheda di biblioteca; i riferimenti sono ai criteri, da ricontrollare sulla fonte W3C.

## Domande aperte per l'utente
1. Il 31% è costo/incassi? Con quale periodo?
2. Le ore di sab/dom e il periodo del cruscotto: sono previsioni, o la settimana scorsa?
3. I ritardi sono un conteggio o minuti? L'ultima settimana è in corso?
4. Quali sono le percentuali giuste per ruolo (oggi sommano 108%)?

Firmato: AIWDA-07 · SHAULA
