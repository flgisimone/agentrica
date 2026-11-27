AIBPD-04 · HAMAL — Senior Product Manager, reparto AIBPD (AI Business & Product Development)

Nota di metodo: in questa sessione non avevo il tool `agent`, quindi non ho potuto caricare AIBPD-01 · ALDERAMIN. Il rapporto è per lui e per l'utente. Ho lavorato in sola lettura e non ho modificato nessun file. Ho letto `prodotto/prd-scambio-turni.md`, `innovazione/concetti.md`, `clienti/fidelizzazione.md`, `clienti/coorti.csv`, `roadmap/roadmap.md` e `roadmap/portafoglio.md`. Per controllare i numeri citati ho letto anche `crescita/prezzi.md` e `mercato/sondaggio-2026.md`. Nessuna delle schede della biblioteca (riduzioni di prezzo, recesso, direttiva 2024/825) riguarda questo compito, quindi non le ho usate. I vincoli di diritto del lavoro e di privacy che segnalo vengono dalle mie conoscenze, che non sono una fonte: vanno verificati con un consulente del lavoro e con il reparto Privacy.

## Esito

Il PRD è segnato «approvato, in sviluppo», ma non è pronto per lo sviluppo:
- ha due coppie di requisiti in contraddizione diretta (R3 con R4, R5 con il fuori perimetro);
- ha un obiettivo senza baseline e più ambizioso dell'ipotesi validata;
- ha una metrica irraggiungibile per come è costruita;
- dipende da un'iniziativa pianificata dopo di lui.

Propongo di riportarlo a «bozza» finché l'utente non conferma le correzioni.

## Rilievi

**H1 · P1 · R3 e R4 si contraddicono** (PRD righe 29–30)
- Evidenza: R3 dice che lo scambio accettato da entrambi «è approvato automaticamente e i turni si aggiornano». R4 dice che il responsabile «deve sempre approvare lo scambio prima che i turni cambino».
- Inoltre il concetto (concetti.md riga 8) prevede che il responsabile «approva con un tocco», quindi l'approvazione c'è.
- Correzione: in R3, «quando un collega accetta, lo scambio passa al responsabile per l'approvazione». In R4, l'approvazione obbligatoria con motivo del rifiuto. Se si vuole l'approvazione automatica, va resa un'opzione del locale, da decidere con l'utente.

**H2 · P1 · R5 contraddice il fuori perimetro e la dipendenza è fuori sequenza** (PRD riga 31 contro riga 43; roadmap righe 25 e 28)
- Evidenza: R5 chiede notifiche push, che il fuori perimetro esclude («arrivano con l'App dipendenti 2.0»).
- La roadmap mette lo scambio in Q2 come P0 con dipendenza da App dipendenti 2.0. Quest'ultima però è in Q3 ed è P3.
- Risultato: un P0 dipende da un P3 che arriva un trimestre dopo.
- Senza notifiche i colleghi non vedono le proposte in tempo, e la funzione non regge.
- Correzione, da scegliere con l'utente:
  - (a) usare per R5 un canale che esiste già o arriva prima: le notifiche WhatsApp in Q1 della squadra C (roadmap riga 23), oppure gli SMS che Turnio usa già (README riga 11);
  - (b) anticipare le notifiche push di App 2.0 prima di Q2 e alzarne la priorità.
- In ogni caso la roadmap va riallineata: una dipendenza deve stare prima di ciò che dipende da lei.

**H3 · P1 · La data di avvio non è coerente con roadmap e capacità** (PRD riga 4; roadmap righe 13 e 19–20)
- Evidenza: il PRD dice «in sviluppo da gennaio 2027 (squadra A)». La roadmap mette lo scambio in Q2.
- In Q1 la squadra A ha già 14 + 6 = 20 settimane su 13 disponibili, senza riserva per i bug.
- Correzione: allineare lo stato del PRD a Q2 e risolvere prima il sovraccarico di Q1 della squadra A, altrimenti anche Q2 slitta.

**H4 · P1 · Obiettivo senza baseline, non misurabile e più largo dell'ipotesi validata** (PRD riga 9; concetti.md righe 9–11)
- Evidenza: l'obiettivo è «ridurre del 50% le assenze non coperte». Né `clienti/` né il PRD indicano come Turnio misuri oggi le assenze non coperte, e non c'è una baseline.
- L'ipotesi validata è più stretta: il 40% delle assenze annunciate con più di 4 ore di anticipo. Il PRD promette il 50% di tutte le assenze, comprese quelle dell'ultimo minuto.
- Correzione:
  - definire l'evento «assenza annunciata» e «assenza coperta» e come si registrano;
  - misurare la baseline per almeno 4–8 settimane prima del rilascio;
  - riformulare l'obiettivo come «quota di assenze annunciate con almeno 4 ore di anticipo coperte con uno scambio ≥ 40% nei locali che usano lo scambio, a sei mesi»;
  - collegarlo a O1 (abbandono) con una metrica d'esito.

**H5 · P1 · La metrica dei locali è irraggiungibile e la metrica di volume è di vanità** (PRD righe 20–21; prezzi.md righe 7–9 e 14)
- La metrica «60% dei locali» non ha denominatore. Lo scambio funziona solo su Pro e Plus (170 + 52 = 222 locali), e 222 / 412 = 53,9%. Se il denominatore sono tutti i clienti, il 60% non si raggiunge per costruzione.
- La metrica «5.000 scambi proposti al mese» conta proposte, non scambi andati a buon fine.
  - Fa circa 22,5 proposte per locale Pro/Plus al mese, senza una base di stima.
  - Solo il 22% dei dipendenti usa l'app ogni settimana (fidelizzazione.md riga 37).
- Correzione:
  - metrica principale: la quota di assenze coperte (vedi H4);
  - metriche secondarie: scambi completati/proposti, tempo mediano fra proposta e approvazione, quota di locali Pro/Plus attivi che usano lo scambio ogni mese;
  - metriche di controllo: scambi rifiutati, scambi scaduti, errori nel registro presenze;
  - ogni valore obiettivo deve avere il calcolo da cui nasce.

**H6 · P1 · Mancano i vincoli su orari e contratti** (PRD riga 38: «Nessun vincolo sugli orari»)
- Evidenza: l'unico controllo è la sovrapposizione dei turni (R2).
- Uno scambio può violare riposi minimi fra turni e limiti di orario settimanale (normativa e CCNL, da verificare con il consulente del lavoro), sforare l'orario dei part-time o assegnare il turno a chi non ha la qualifica.
- Può anche generare straordinari, mentre paghe e straordinari sono fuori perimetro (riga 44).
- Correzione:
  - aggiungere un requisito di controlli bloccanti o di avviso (riposo minimo, ore settimanali, ore di contratto);
  - mostrare al responsabile l'effetto sulle ore di entrambi prima che approvi;
  - far validare le regole a un consulente del lavoro.

**H7 · P2 · L'approvazione solo dal pannello web contraddice il concetto e lascia scoperto il rischio** (PRD righe 13 e 49; concetti.md riga 8)
- Evidenza: il concetto validato prevede «approva con un tocco», il PRD «approva dal pannello web».
- Il rischio dichiarato («pochi responsabili potrebbero approvare in tempo») è «mitigato con R6», ma R6 chiude solo gli scambi che nessuno ha accettato. Non copre gli scambi accettati e non approvati prima del turno.
- Correzione:
  - approvazione anche dall'app del responsabile, oppure da notifica;
  - un sollecito al responsabile;
  - una regola esplicita per lo scambio accettato e non approvato a X ore dal turno (resta il turno originale e i due dipendenti ricevono un avviso);
  - una mitigazione vera nella sezione Rischi.

**H8 · P2 · La finestra di R6 non è coerente con il problema né con l'ipotesi** (PRD riga 32; concetti.md righe 7 e 9)
- Evidenza: il problema sono le «assenze dell'ultimo minuto». L'ipotesi riguarda le assenze annunciate con più di 4 ore di anticipo. R6 chiude lo scambio 2 ore prima del turno.
- Fra 2 e 4 ore non è stato validato niente, e sotto le 2 ore il problema principale resta senza soluzione.
- Correzione: dichiarare nel PRD che le assenze con meno di 2 ore di preavviso sono fuori perimetro, con il flusso alternativo (oggi: telefonata al responsabile). Allineare la soglia di R6 al tempo di approvazione realistico del responsabile.

**H9 · P2 · Il comportamento dello scambio è ambiguo** (PRD righe 27–29)
- Evidenza: R1–R3 descrivono una cessione (un turno offerto, un collega lo prende), non uno scambio fra due turni.
- Non è detto cosa succede se più colleghi accettano, se il proponente può ritirare la proposta, o se un turno già scambiato si può riproporre.
- Correzione: scegliere con l'utente fra «cessione», «scambio» o entrambi, e aggiungere criteri di accettazione per questi casi:
  - primo che accetta, oppure il responsabile sceglie;
  - ritiro della proposta;
  - catene di scambi;
  - modifica del turno originale dopo la proposta.

**H10 · P2 · Il rischio principale, l'adozione dei dipendenti, non è gestito** (fidelizzazione.md righe 35 e 37; PRD righe 47–49)
- Evidenza: il primo motivo di abbandono è «i dipendenti non usano l'app» (41%), e solo il 22% dei dipendenti la usa ogni settimana. Lo scambio funziona solo se il proponente e i colleghi sono nell'app.
- Il punteggio di salute non ha nessun segnale d'uso dei dipendenti (righe 43–48).
- Correzione:
  - aggiungere il rischio con una mitigazione (attivazione dei dipendenti, canale di notifica di H2);
  - aggiungere una metrica di uso dei dipendenti nei locali Pro/Plus;
  - proporre al Customer Success di inserirla nel punteggio di salute.

**H11 · P2 · Dati personali senza valutazione privacy** (PRD righe 27 e 34)
- Evidenza: la nota facoltativa è testo libero. Un dipendente può scriverci il motivo dell'assenza, per esempio la salute, e questo può diventare un dato particolare.
- Lo storico per 24 mesi (R8) non ha una motivazione.
- Correzione:
  - passaggio di consegne a Privacy & Compliance su finalità, base giuridica, conservazione di R8 e informativa ai dipendenti;
  - un avviso sulla nota («non indicare il motivo dell'assenza»), oppure la nota a scelta fra motivi predefiniti non sensibili.

**H12 · P2 · Il concetto è «validato» con un'evidenza debole** (concetti.md righe 7, 10 e 11; sondaggio-2026.md righe 4–5)
- Evidenza: la validazione si basa su un prototipo cliccabile in 8 locali per due settimane. Un prototipo cliccabile non copre assenze reali, quindi la misura «assenze coperte» non è chiara. Ci sono 2 settimane di confronto e il criterio di selezione dei locali non è indicato.
- Il 46% viene da 74 risposte su 412 (18%), raccolte con un incentivo.
- Correzione: indicare nel PRD il livello di confidenza (basso o medio). Prevedere un rilascio pilota su un gruppo di locali Pro/Plus, con baseline e gruppo di confronto, prima del rilascio a tutti.

**H13 · P2 · Il legame con O1 poggia su una baseline sbagliata** (roadmap righe 7 e 25; fidelizzazione.md righe 14 e 20)
- Lo scambio è P0 per O1 («abbandono sotto il 20%»), ma il PRD non ha nessuna metrica sull'abbandono.
- L'abbandono è calcolato sulla base di fine periodo: 98 / 412 = 23,8%.
  - Sulla base iniziale è 98 / 330 = 29,7%.
  - Sulla base media è 98 / 371 = 26,4%.
- Anche la NRR del 108% esclude i clienti persi. Con i clienti persi è 15.020 / 17.200 = 87,3%.
- Correzione: ricalcolare la baseline di O1 e aggiungere al PRD una metrica d'esito: abbandono dei locali Pro/Plus che usano lo scambio contro quelli che non lo usano, a 6 mesi.

**H14 · P3 · Il piano Base è escluso senza motivazione** (PRD riga 39; prezzi.md riga 14)
- Evidenza: 190 locali (46%) vedono la funzione ma non la usano.
- Il PRD non dice se l'esclusione serve all'upgrade (O3) né quale conversione Base → Pro si attende.
- Correzione: dichiarare l'obiettivo dell'esclusione e misurare gli upgrade attribuibili allo scambio.

**H15 · P3 · Manca la dipendenza dalla timbratura** (PRD riga 33; portafoglio.md riga 6; roadmap riga 28)
- Evidenza: R7 si basa sulla timbratura. Kiosk viene dismesso il 31 dicembre 2026 (61 locali) e la «nuova timbratura» arriva con App 2.0 in Q3.
- Correzione: indicare fra le dipendenze come si timbra nei locali ex Kiosk durante Q2, e il criterio di accettazione di R7 (chi è registrato quando il dipendente che ha preso il turno timbra).

## Fuori compito, da segnalare al direttore

In `innovazione/concetti.md` alla riga 36, il totale del concetto C è sbagliato. Con i pesi dichiarati, 5×0,4 + 2×0,3 + 3×0,3 = 3,5, non 4,4. C scende così sotto A (4,3) e B (3,7), e la proposta della riga 38 («dopo A, investire su C») non regge.

## Domande aperte per l'utente

1. Lo scambio deve sempre passare dal responsabile, o l'approvazione automatica può essere un'opzione del locale? (H1)
2. Quale canale di notifica è disponibile in Q2: WhatsApp, SMS o push anticipate? (H2)
3. Si tratta di cessione del turno, di scambio fra due turni o di entrambi? (H9)
4. Esiste oggi un dato registrato sulle assenze annunciate e coperte, da usare come baseline? (H4)
5. Chi valida le regole su riposi e orari: un consulente del lavoro interno o esterno? (H6)

Decisioni da far confermare all'utente: correzione di R3 e R4, canale di notifica e riallineamento della roadmap, nuovo obiettivo e nuove metriche, stato del PRD riportato a bozza, coinvolgimento di Privacy & Compliance.

— AIBPD-04 · HAMAL
