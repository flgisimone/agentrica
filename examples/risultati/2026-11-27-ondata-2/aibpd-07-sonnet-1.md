**AIBPD-07 · MENKENT — Senior Growth & Monetization Manager, reparto AIBPD (AI Business & Product Development)**

Rapporto per AIBPD-01 · ALDERAMIN. Revisione in sola lettura di `crescita/imbuto.md` e `crescita/prezzi.md` (i soli due file della cartella) in /private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-07-3. Non ho modificato nulla. Ho letto le schede `riduzioni-di-prezzo` e `funzione-di-recesso`. Sono su Sonnet: i rilievi P1 vanno riesaminati dal direttore o da un revisore su Opus prima di diventare definitivi.

## Esito
Somme e percentuali di imbuto, test e tabella canali sono corrette. Le conclusioni che se ne ricavano non reggono. Nessun P0.

## Rilievi

**1. P1 · `imbuto.md`, test della pagina dei prezzi (righe 18-25): risultato non significativo.**
- 35/412 = 8,5% contro 41/405 = 10,1% (+19% relativo, il calcolo torna). La differenza è 1,6 punti, con z ≈ 0,8 e p ≈ 0,42. Intervallo al 95%: da circa −2,4 a +5,6 punti.
- Il test è stato controllato ogni mattina e fermato quando «è diventato significativo al 95%»: questo gonfia i falsi positivi. Con i dati scritti la soglia non risulta nemmeno raggiunta, quindi la frase va verificata o tolta.
- Sono 76 eventi in 6 giorni, meno di una settimana intera, con stagionalità non coperta. La metrica sono le prove avviate, non i pagamenti.
- Per rilevare 8,5% → 10,1% con potenza dell'80% servono circa 5.800 visite per variante (stima mia, formula standard).
- Correzione: declassare la decisione a «nessuna evidenza». Rifare il test con durata e campione fissati prima (almeno 2 settimane intere), senza guardare i risultati intermedi, e mirare alla conversione a pagamento se il volume lo permette.

**2. P1 · `imbuto.md`, proposta sui canali (riga 36): i dati la contraddicono.**
- Metà del budget di Google Ads sono 4.750 €. A 95 € di CAC darebbero circa 50 clienti, a 150 € su Instagram circa 32. Con gli LTV scritti sono 26.000 € contro 20.300 €: meno ricavi, non di più.
- LTV/CAC è 5,5 per Google Ads e 4,3 per Instagram. «LTV più alto» non basta: conta il rapporto.
- L'LTV di Instagram (640 €) è stimato su tre mesi con 14 clienti. Il canale esiste da agosto, quindi nessun cliente può avere 12 mesi. La colonna «Spesa 12 mesi» per Instagram copre in realtà 3 mesi. Un CAC stabile non è garantito se la spesa cresce.
- Correzione: non spostare il budget. Valutare Instagram con una piccola prova a budget fisso, dopo almeno 6-12 mesi di dati. Indicare nella tabella i mesi di ogni canale e che l'LTV di Instagram è una stima.

**3. P1 · `imbuto.md`, referral (righe 33 e 36): costo non zero.**
- «Un mese gratis a chi invita e a chi è invitato» è un costo. Il ricavo medio per locale è circa 52 €/mese (21.630 € / 412 locali, calcolo mio). Per 40 clienti sono fino a 80 mesi regalati, circa 4.200 € di ricavi rinunciati, con un CAC equivalente di circa 105 €, più alto di Google Ads (95 €). È una stima: il numero di inviti e l'uso reale dei mesi gratis non sono nel documento.
- «Raddoppiare» è limitato dalla base clienti esistente, non è una leva libera.
- Correzione: mettere nella colonna CAC il costo dei mesi gratis e rifare il confronto tra canali. Verificare lo stesso per «Fornitori della cassa» (0 €): non è chiaro se ci siano commissioni o condivisione dei ricavi.

**4. P1 · `prezzi.md`, proposta 2027 (riga 18): la matematica non regge.**
- Un annuale vale 10 mesi su 12, cioè 0,833 di un mensile. Con la quota di annuali dal 22% al 60%, il ricavo medio per cliente scende da 0,963 a 0,900, circa −6,6%, a parità di tutto il resto. Non cresce del 20%.
- Anche l'incasso di cassa nel 2027 è più basso per chi converte (10 mesi contro 12), salvo un calo degli abbandoni. L'incasso anticipato è cassa, non ricavo: il ricavo si ripartisce sui 12 mesi.
- Il beneficio dipende solo da una riduzione degli abbandoni. Come stima mia, il pareggio è intorno al 3-3,5% di abbandoni mensili. Il documento non riporta il tasso di abbandono.
- Correzione: togliere il «+20%». Riformulare come ipotesi sulla ritenzione, con scenari (abbandono attuale, sconto 10/12, quota annuali), quando sarà disponibile il dato di abbandono. In alternativa, ridurre lo sconto.

**5. P2 · `imbuto.md`, riga 14: confronto con il settore sulla base sbagliata.**
- Il 20% è calcolato su 900 prove attivate. Dalle prove avviate (1.500) i 180 paganti sono il 12%, sotto il 15% citato. Il benchmark del 15% non ha fonte, data né definizione del denominatore.
- Le coorti non sono allineate: la prova dura 30 giorni, quindi le prove di ottobre non sono ancora arrivate al pagamento, e i 180 paganti possono includere prove iniziate prima del 1° novembre 2025.
- Correzione: citare la fonte del benchmark e confrontare solo definizioni uguali. Mostrare entrambe le conversioni (12% e 20%) e calcolarle per coorte di mese di inizio prova.

**6. P2 · `prezzi.md`, struttura dei prezzi (righe 5-11).**
- Il supplemento di 2 € a dipendente è uguale su tutti i piani. Da 25 dipendenti in su il prezzo di Base diventa identico a quello di Pro (29 + 2×(n−10) = 59 con n = 25): Base non ha più senso sopra i 25 dipendenti e le soglie «fino a 10/25/40» non separano i piani.
- Il salto Pro → Plus (59 → 99 €, +68%) è poco coerente con il supplemento: un Pro con 40 dipendenti costa 89 € e Plus 99 €, per sole funzioni diverse.
- Correzione: rendere il supplemento crescente tra i piani, o fissare soglie e prezzi in modo che il passaggio di piano convenga al cliente. Simulare il costo per 8, 15, 25, 35 e 45 dipendenti prima di cambiare.

**7. P2 · `prezzi.md`, riga 8: funzione non ancora disponibile.**
- «Scambio dei turni (dal 2027)» è elencato tra le funzioni incluse in Pro. Vendere oggi una funzione futura può essere ingannevole.
- Correzione: indicare «in arrivo» separatamente, oppure toglierla dalla tabella fino al rilascio.

**8. P3 · `prezzi.md`, righe 12 e 3: formulazione e ambito normativo.**
- «Due mesi gratis» descrive 10 mesi pagati su 12: corretto, ma va resa chiara la durata del vincolo e come si recede.
- I prezzi sono IVA esclusa e i clienti sono locali, quindi probabilmente imprese. Gli artt. 17-bis e 54-bis del Codice del consumo (schede verificate il 2026-11-19, da ricontrollare entro il 2027-05-19) valgono per i consumatori. Se esistono clienti consumatori, servono la funzione di recesso nell'interfaccia online (in vigore dal 19 giugno 2026, per i contratti conclusi dopo quella data) e, per gli sconti mostrati, il riferimento al prezzo più basso dei 30 giorni precedenti.
- Correzione: far confermare dalla revisione legale umana se i clienti sono solo imprese.

## Verificato corretto
- Imbuto: 1.500/37.500 = 4,0%; 900/1.500 = 60%; 180/900 = 20%.
- Test: 35/412 = 8,5%; 41/405 = 10,1%; +19% relativo.
- Canali: CAC 95 € e 150 €; i clienti sommano 180, come nell'imbuto.
- MRR: 190×29 = 5.510; 170×59 = 10.030; 52×99 = 5.148; con 942 € di supplementi fa 21.630 €.

## Informazioni mancanti
- Tasso di abbandono, margine lordo (l'LTV sembra a ricavi) e fonte del benchmark del 15%.
- Costo reale del referral e delle commissioni dei fornitori della cassa.
- Visite e canale di origine per ogni variante del test.

## Decisioni da far approvare all'utente
- Sospendere la pagina B come «decisione» e rifare il test.
- Non spostare il budget a Instagram per ora.
- Ritirare o riformulare la proposta del 60% di annuali e rivedere la struttura dei prezzi.

**Passaggi di consegne.** Il tema pricing e modello finanziario va a AIBPD-03 (analisi di ricavi e margini). Il tema normativo consumatori va a Privacy & Compliance e alla revisione legale umana.

Firmato: AIBPD-07 · MENKENT
