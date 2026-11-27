**AIBPD-11 · KOCHAB — Senior Customer Success & Retention Strategist, reparto AIBPD (AI Business & Product Development)**

# Rapporto per AIBPD-01 · ALDERAMIN: revisione in sola lettura di `clienti/`

Ho riletto `clienti/fidelizzazione.md` e `clienti/coorti.csv` e li ho confrontati con `README.md` e `crescita/prezzi.md`. Il denominatore dell'abbandono, l'NRR e il NPS sono sbagliati. La ritenzione a 6 mesi è alterata dall'esclusione di una coorte. Salute del cliente e attivazione non misurano il rischio che il documento dichiara principale. Non ho modificato nessun file. In `clienti/` ci sono solo questi due file. Dalla biblioteca ho letto la scheda `funzione-di-recesso`.

## Rilievi

### 1. Tasso di abbandono: denominatore sbagliato. P1
Dove: `fidelizzazione.md` riga 14 («98 / 412 = 23,8%»).
- 412 sono i clienti a fine periodo e includono i 163 nuovi ancora presenti, che non erano esposti al rischio per tutto l'anno. Il 23,8% sottostima l'abbandono.
- Il conto contabile torna: 330 + 180 − 98 = 412. Dei 330 iniziali ne restano 249 (riga 19), quindi ne sono usciti 81. I restanti 17 persi sono tra i nuovi (98 − 81, dato derivato non riportato nel documento).
- Conto corretto, abbandono della base iniziale: 81 / 330 = **24,5%**. Tutte le uscite sulla base iniziale: 98 / 330 = **29,7%** (limite superiore, perché il numeratore è più ampio del denominatore).
- Abbandono per ricavi: 3.300 / 17.200 = 19,2% (3.300 € è l'MRR perso, vedi rilievo 2).
- Correzione proposta: riportare 24,5% come abbandono annuo della base iniziale, mostrare a parte i 17 persi tra i nuovi e aggiungere l'abbandono per ricavi.
- Gli abbonamenti annuali (22% dei clienti, `prezzi.md` riga 18) escono solo al rinnovo. L'abbandono va calcolato sulla scadenza, non sulla data della disdetta. Se la proposta 2027 porta gli annuali al 60%, le uscite slittano oltre l'orizzonte e vengono nascoste.

### 2. NRR: numeratore e denominatore appartengono a gruppi diversi. P1
Dove: `fidelizzazione.md` righe 18–20 («15.020 / 13.900 = 108%»).
- Il 13.900 € è l'MRR iniziale dei soli 249 superstiti. L'NRR deve confrontare l'MRR attuale della coorte di partenza con l'MRR iniziale di tutta la coorte, compresi gli 81 clienti persi.
- Conto corretto: **15.020 / 17.200 = 87,3%**. La base perde il 12,7% senza clienti nuovi, quindi la frase «la base cresce anche senza clienti nuovi» è falsa.
- MRR perso con le uscite: 17.200 − 13.900 = 3.300 €. Espansione dei superstiti: +1.120 € (15.020 − 13.900).
- GRR (senza espansione) al massimo 13.900 / 17.200 = **80,8%**. È un massimo perché i dati non mostrano i downgrade tra i superstiti.
- Correzione proposta: riportare NRR 87% e GRR ≤ 81%, con il ponte (−3.300 € per uscite, +1.120 € per espansione).
- Controllo di coerenza: gli 81 persi hanno in media 40,7 € di MRR e i 163 nuovi 40,6 € (6.610 € = 21.630 − 15.020). I numeri tornano con il README.

### 3. Ritenzione a 6 mesi: coorte peggiore esclusa. P1
Dove: `fidelizzazione.md` riga 26; `coorti.csv` riga 6 (marzo 2026).
- Escludere la coorte di marzo (promozione di Pasqua) alza la media e nasconde l'effetto delle promozioni, che è ciò che interessa capire.
- Conti da `coorti.csv`: Nov 12/14 = 85,7%; Dic 10/11 = 90,9%; Gen 13/16 = 81,3%; Feb 13/15 = 86,7%; Mar 14/24 = 58,3%; Apr 16/18 = 88,9%.
- Senza marzo: media semplice 86,7% (l'87% del testo), ponderata 64/74 = 86,5%.
- **Con marzo, ponderata: 78/98 = 79,6%**; media semplice 82,0%.
- A 3 mesi la coorte di marzo tiene il 70,8% (17/24), contro il 93,3% delle altre coorti con dato (111/119). Ha anche il picco di ingressi (24 contro una media di 15). Le coorti successive di maggio, giugno e luglio sono regolari a 3 mesi, quindi il problema è specifico dei clienti arrivati con la promozione.
- Correzione proposta: riportare tutte le coorti, il valore ponderato (79,6%) e la coorte promozionale separata, con la nota che le acquisizioni in sconto ritengono 58% a 6 mesi contro 87%.
- Nessuna coorte è completa a 12 mesi (riga 27), quindi il dato a 12 mesi non esiste ancora.

### 4. Le coorti non si riconciliano con i clienti totali. P2
Dove: `coorti.csv` e `fidelizzazione.md` righe 12 e 19.
- Le coorti sommano a 180 nuovi, come in riga 10. Se «attivi» vuol dire «paganti», l'ultimo valore disponibile di ogni coorte somma a 157, cioè 23 persi contro i 17 impliciti (180 − 163).
- 249 + 157 = 406, non 412: scarto di 6 clienti.
- Non è definito cosa sia «attivo» (pagante o con uso). Se è uso, le coorti misurano un'altra cosa rispetto a «clienti persi».
- Correzione proposta: definire `attivi_*` come «ancora paganti a fine mese N» e riconciliare con 163; in alternativa aggiungere una colonna `attivi_uso` separata.

### 5. NPS: calcolo e campione. P1
Dove: `fidelizzazione.md` riga 31.
- Calcolo: (52 − 8) / 74 = 59,46%, cioè **NPS 59**. Il 61 dichiarato non torna (52 + 14 + 8 = 74, quindi i conteggi sono coerenti e l'errore è nel punteggio).
- Campione distorto:
  1. Inviato solo ai 268 clienti con oltre sei mesi: sono i sopravvissuti. Restano fuori i clienti dei primi mesi e quelli già usciti.
  2. Tasso di risposta 74/268 = 27,6%, con autoselezione verso chi è soddisfatto.
  3. Con ogni probabilità risponde il titolare, mentre il problema dichiarato è l'uso da parte dei dipendenti.
- Con n = 74 la stima è ampia.
- Correzione proposta: riportare 59 con n e tasso di risposta, segmentare per piano e anzianità, includere un invio ai clienti nei primi sei mesi e, se ammesso dalla privacy, ai dipendenti. Non usarlo per giudicare la ritenzione.

### 6. Il punteggio di salute non misura il rischio principale. P1
Dove: `fidelizzazione.md` righe 35–37 (motivi) e 41–48 (pesi).
- Il motivo di abbandono più frequente è «i dipendenti non usano l'app» (41%) e solo il 22% dei dipendenti usa l'app ogni settimana. Il punteggio pesa invece al 40% gli accessi del titolare al pannello e al 30% i turni pubblicati: segnali lato titolare. Nessun segnale riguarda i dipendenti (installazione, apertura dei turni, timbrature).
- Un cliente può avere un punteggio alto e rischiare di uscire perché nessuno apre l'app.
- «Ticket aperti (meno è meglio)», 20%, penalizza chi chiede aiuto e premia chi tace, che spesso è chi sta per disdire.
- «Pagamenti puntuali», 10%: il mancato pagamento è già contato come abbandono (riga 14), quindi è un segnale di fine più che di rischio anticipato.
- La soglia «sotto 40 chiama il supporto» non ha evidenza di validazione sui 98 persi (punteggio medio 30–90 giorni prima della disdetta) né un dato su quanti clienti stanno sotto soglia, con 2 persone nel supporto.
- Correzione proposta: integrare con segnali sull'uso reale (quota di dipendenti attivi nella settimana, calo dell'uso rispetto alle 4 settimane precedenti, turni pubblicati ma non visti), con pesi calibrati sui 98 persi. Il peso dei ticket va ripensato (picchi o calo improvviso come segnale). Dati aggregati per locale.

### 7. Attivazione: metrica che non misura il valore. P1
Dove: `fidelizzazione.md` righe 52–53.
- «Account creato ed email confermata» è un passo di iscrizione, non un momento di valore. Il 97% non dice nulla sul rischio di abbandono, e la conclusione «non richiede interventi nel 2027» contraddice il 41% di abbandoni per mancato uso dei dipendenti.
- La prova è di 30 giorni su Pro senza carta (`prezzi.md` riga 13): l'attivazione si decide in quel periodo.
- Correzione proposta: definire l'attivazione come «primo turno pubblicato e almeno il 50% dei dipendenti ha aperto l'app o timbrato entro 14 giorni», con soglia da validare sui dati. Misurare anche il tempo al primo valore e la quota di prove che diventano clienti paganti. Riaprire il piano del primo utilizzo 2027.

### 8. Motivi di abbandono: lettura troppo comoda. P2
Dove: `fidelizzazione.md` righe 35–37.
- 98 risposte su 98 persi è improbabile per chi ha smesso di pagare. Va chiarito chi ha compilato il questionario e come sono classificati i mancati pagamenti (nessuna voce dedicata).
- Il 18% «chiusura del locale» non è evitabile e va separato.
- Il 22% «prezzo» va letto insieme alla coorte promozionale di marzo (sconti e uscite per prezzo potrebbero essere collegati).
- Il 22% medio di dipendenti attivi è una media: serve la distribuzione per locale.

## Domande aperte per l'utente
1. Cosa significa «attivi» in `coorti.csv`: paganti o con uso? Perché il totale non quadra con 412 (scarto 6)?
2. Chi ha compilato il questionario di uscita e come sono trattati i mancati pagamenti?
3. Il NPS può essere inviato ai dipendenti? Serve il parere di Privacy & Compliance.
4. La scheda `funzione-di-recesso` (art. 54-bis Codice del consumo, verificata il 2026-11-19) riguarda i consumatori. I clienti Turnio sono imprese, quindi probabilmente non si applica, da confermare con la revisione legale umana. In ogni caso nessun flusso di fidelizzazione deve rendere la disdetta più difficile della sottoscrizione.

## Cautele
- Ho lavorato su un modello più piccolo di quello della sessione. I rilievi P1 (1, 2, 3, 5, 6, 7) vanno fatti riesaminare dal direttore del reparto o da un revisore su Opus prima che diventino definitivi.
- I dati sono di un progetto di prova (README). I conti sono verificabili a mano dai numeri dei documenti.
- Questo rapporto è una raccomandazione. Le analisi non sostituiscono il giudizio della direzione.

Firmato: AIBPD-11 · KOCHAB
