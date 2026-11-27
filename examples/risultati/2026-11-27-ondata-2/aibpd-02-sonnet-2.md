AIBPD-02 · PROCYON — Senior Market Research Analyst, reparto AIBPD (AI Business & Product Development)

**Rapporto per AIBPD-01 · ALDERAMIN: revisione in sola lettura di `mercato/`** (sintesi-mercato.md, fonti.md, sondaggio-2026.md, concorrenti.md). Non ho modificato nessun file. Non ho consultato la biblioteca: le schede (prezzi, recesso, direttiva 2024/825) non toccano questa analisi. Ho ricalcolato io le cifre. Per il prezzo Plus ho letto una sola riga di `vendite/pipeline.csv`, per capire se 1.188 € l'anno corrisponde a 99 €/mese.

**Esito:** l'analisi non è utilizzabile per il piano 2027 né per gli investitori nella forma attuale. Ci sono 3 rilievi P1 (cioè con impatto alto sul valore) e 6 P2.

**P1**

1. `sintesi-mercato.md` righe 9–11 (TAM/SAM/SOM): la base di calcolo è sbagliata.
   - Il TAM parte da F1 (marzo 2019, 198.000 locali), mentre F2 (giugno 2026) dà 176.000 locali attivi. Il dato del 2019 è superato di sette anni e va sostituito con 176.000.
   - Il TAM conta anche il 58% di locali senza dipendenti (F2), che un'app dei turni non serve.
   - Il SAM applica il 60% Nord e Centro a 198.000. Il 60% viene da F2 e vale per 176.000, quindi mescola due fonti.
   - Il SAM non filtra il segmento che la stessa sintesi indica come bersaglio (3–40 dipendenti, 31%, riga 29).
   - Correzione: SAM = 176.000 × 31% × 60% ≈ 32.700 locali. Questo presuppone che le due quote siano indipendenti: va dichiarato oppure ricavato da F2. A 99 €/mese sono circa 38,9 M€ l'anno; a 59 € (Pro) circa 23,2 M€. Il TAM dei locali con dipendenti sarebbe 176.000 × 31% = 54.560 locali, circa 64,8 M€ a 99 €. Con la formula del documento, che usa 198.000 locali a 99 €/mese, il TAM è 235,2 M€ e il SAM 141,1 M€. Con le basi corrette il SAM scende a meno di un terzo (circa 28%) e il TAM a circa 28% del 235,2 M€. Riscrivere le tre righe con un intervallo e con scenari a 59 e 99 €.
   - Il SOM del 5% non ha motivazione. È circa 5.940 locali, contro 412 clienti oggi, cioè 14 volte. Orarix, il leader dichiarato, ha circa 2.300 locali. Va motivato con un tasso di penetrazione, con benchmark e con una curva di acquisizione. Il SOM va ricalcolato sul SAM corretto: il 5% di 32.700 sono circa 1.640 locali, un valore da scenario e non una previsione.

2. `sintesi-mercato.md` riga 17 (crescita): il tasso del 32% annuo è sbagliato. Da 0,8 a 1,4 miliardi in tre anni (2023→2026) il CAGR è (1,4/0,8)^(1/3) − 1 ≈ 20,5%. Il +75% totale non è un tasso annuo. Inoltre F3 misura tutta la spesa in software gestionale, non il segmento turni: «il mercato dei turni segue lo stesso andamento» è un'ipotesi senza fonte. Correzione: indicare 20,5% per il software gestionale e marcare l'estensione ai turni come ipotesi da verificare.

3. `sintesi-mercato.md` righe 21 e 25, con `sondaggio-2026.md` (disponibilità a pagare e metodo del sondaggio): il sondaggio non può dire nulla sul «mercato».
   - È stato inviato ai 412 clienti Turnio, che pagano già, con un buono Amazon da 10 € per chi risponde. Il campione è autoselezionato (74 risposte, 18%), fatto di clienti soddisfatti e incentivati. Vale al massimo come indicazione sui clienti attuali, non sul mercato.
   - Il 64% su n=74 ha un margine di errore di circa ±11 punti (95%), anche ammettendo un campione casuale, che qui non c'è.
   - Le fasce della domanda sul prezzo si sovrappongono: «30–59 €» e «59 € o più» includono entrambe 59 €. Con 59 € di prezzo attuale, chi risponde «59 € o più» sta ripetendo ciò che già paga.
   - Correzione: riscrivere la frase come «64% dei 74 clienti rispondenti (±11 pt)» e togliere «sostenibile per la maggior parte del mercato». Per il mercato servono interviste o un sondaggio su non clienti. Va corretta anche la classificazione delle fasce (per esempio 30–58 €).

**P2**

4. `concorrenti.md` riga 7 e righe 12–14 (quote di mercato): si sommano unità diverse. Per Orarix si usano 18.000 utenti, cioè dipendenti, mentre per gli altri si contano locali. Il dato in locali è 2.300 (comunicato di settembre 2026).
   - Ricalcolo su 2.300 + 900 + 350 + 412 = 3.962 locali: Orarix 58,1%, Planora 22,7%, Turnio 10,4%, Shiftella 8,8%. Il 91,5% è un artefatto di unità e va rimosso.
   - Inoltre sono quote sui clienti dichiarati dai concorrenti, non quote del mercato: il mercato bersaglio è circa 54.600 locali (176.000 × 31%), quindi i quattro insieme coprono circa il 7%. «Quota» va sostituito con «quota fra i clienti dichiarati» oppure con la penetrazione sul SAM.

5. `sintesi-mercato.md` riga 25: Turnio non è secondo. Per numero di locali l'ordine è Orarix 2.300, Planora 900, Turnio 412, Shiftella 350. Turnio è terzo, sotto Planora. Va corretta anche l'affermazione «il mercato è concentrato», che dipende dal dato errato al punto 4. Con i dati corretti il leader ha circa il 58% dei clienti dichiarati, e per sostenere la concentrazione servirebbe un indice (HHI) o una definizione.

6. `sintesi-mercato.md` riga 13 e `concorrenti.md` (prezzo): il TAM/SAM usa 99 €/mese del piano Plus, ma fra i concorrenti nessun prezzo supera 65 € (Orarix 49, Planora 39, Shiftella 65, Turnio Pro 59). Usare il prezzo più alto del proprio listino per il tetto del mercato è una scelta non motivata: «verso cui crescono i clienti» non ha prova. Il 99 € non è in `fonti.md`; l'ho ritrovato solo nella pipeline (1.188 € l'anno per un cliente Plus), che è un dato interno. Correzione: scenari a 59 € (prezzo attuale) e 99 € (aspirazionale), con la fonte di ciascuno. In `concorrenti.md` non è chiaro a quale piano si riferiscano gli altri prezzi, e va confrontato come per come (stesso numero di dipendenti e stesse funzioni).

7. `fonti.md`: la tabella delle fonti è incompleta e a tratti non indipendente.
   - F4 (sondaggio proprio) è usata come fonte di mercato, mentre è un dato interno sui clienti (vedi il punto 3).
   - F5 sono dati dichiarati dai concorrenti, non verificati. Per Orarix i 2.300 locali vengono da un comunicato, che non è un sito. Manca l'URL e la data di consultazione precisa per ogni voce.
   - F1 non è indicata come superata.
   - Non è detto se F1 e F2 usano la stessa definizione di «locale» (F1 elenca ristoranti, bar, pasticcerie e gelaterie). Per F2 non è indicato il perimetro.
   - Le quote 58% senza dipendenti + 31% con 3–40 fanno 89%: manca l'11% (1–2 o più di 40 dipendenti) e andrebbe detto.
   - Mancano le fonti del prezzo Plus e del SOM 5%.

8. `sondaggio-2026.md` righe 11–14 (affidabilità delle altre domande): le ore a settimana prima e dopo Turnio (mediana 4 e 1) sono autodichiarate e retrospettive, per di più da clienti soddisfatti. Vanno presentate come percezione dei rispondenti, non come risparmio misurato. Le percentuali sono su 74, quindi 64% ≈ 47 persone e 58% ≈ 43: indicare sempre n. La domanda sulla paga non dice chi risponde sulla base di quale offerta. Il buono Amazon da 10 € è un costo (circa 740 € per 74 risposte) e un possibile bias di risposta: dichiararlo. Controllo di coerenza: le percentuali di ogni domanda sommano a 100%.

9. `sondaggio-2026.md` riga 4 (privacy): il sondaggio è stato inviato per email ai clienti, quindi tratta dati personali (email, eventuale buono nominativo). Servirebbe coinvolgere Privacy & Compliance per base giuridica e informativa. Non posso verificare se è stato fatto: è una domanda aperta.

**Domande aperte per l'utente**
- Confermi 176.000 locali (F2) come base, e il 31% come segmento bersaglio?
- Quale prezzo vuoi usare come scenario base, 59 € o 99 €?
- Esistono i dati di F5 (URL, data) e la fonte del 5% di SOM?

**Raccomandazione:** se questo documento va agli investitori, prima va corretto (almeno P1 e il punto 5). Poiché lavoro su un modello più piccolo di quello della sessione, i rilievi P1 vanno riesaminati da te (ALDERAMIN) o da un revisore su Opus prima di diventare definitivi. Ricalcoli e formule sono nel testo sopra; nessuna stima è stata inventata. Queste analisi non sostituiscono il giudizio della direzione né consulenze professionali. Ogni decisione resta all'utente.

— AIBPD-02 · PROCYON, Senior Market Research Analyst
