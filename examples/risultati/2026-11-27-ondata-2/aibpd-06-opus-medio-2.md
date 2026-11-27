AIBPD-06 · DIPHDA — Senior Business & Financial Analyst, reparto AIBPD (AI Business & Product Development)

**Perimetro e note di metodo.** Ho verificato in sola lettura `finanza/business-case.md` confrontandolo con README, `crescita/prezzi.md`, `clienti/fidelizzazione.md`, `clienti/coorti.csv`, `mercato/sondaggio-2026.md`, `innovazione/concetti.md`, `roadmap/roadmap.md`, `roadmap/portafoglio.md` e `vendite/previsione.md`. Non ho modificato nessun file.
- Non ho potuto caricare il direttore AIBPD-01 · ALDERAMIN, perché in questa sessione non ho il tool `agent`. Il rapporto è pensato per lui e va consegnato a lui.
- Nessuna scheda della biblioteca riguarda questo compito (prezzi annunciati, recesso, direttiva green), quindi non ne ho lette.
- Secondo il README i dati sono inventati.
- Tutte le cifre corrette qui sotto sono mie elaborazioni sui documenti, non dati nuovi.

## Esito

Il business case non regge. Ci sono un errore di somma, i ricavi sono calcolati IVA inclusa, il costo del fornitore manca, e churn, LTV e recupero del CAC sono sbagliati nel metodo. Corretti questi punti:
- il 2027 si chiude fra −134 k€ e circa −155 k€, non a −94 k€;
- LTV/CAC scende da 8,3 a circa 2,1–2,5;
- il CAC si recupera in circa 17–21 mesi, non in 8;
- il pareggio nel 2028 non si raggiunge, né sull'anno né in cumulato.

La proposta di approvazione va sospesa e il caso va rifatto. Le decisioni restano all'utente.

## Rilievi

**R1 · P1 · Totale dei costi sbagliato** (business-case.md:24-25)
- 96.000 + 40.000 + 24.000 = **160.000 €**, non 140.000 €.
- Con i ricavi del documento il risultato è 46.116 − 160.000 = **−113.884 €**, non −93.884 €.
- Effetto: la perdita è sottostimata di 20.000 €.

**R2 · P1 · Ricavi calcolati IVA inclusa** (righe 9 e 20)
- L'IVA non è un ricavo. Tutti i prezzi sono IVA esclusa e i clienti sono imprese (README:12, prezzi.md:3).
- Conto corretto: 210 × 15 € × 12 = **37.800 €**, non 46.116 €.
- Il documento non è coerente con se stesso: l'LTV (riga 31) usa 15 €, i ricavi usano 18,30 €.

**R3 · P1 · Manca il costo del fornitore delle paghe** (righe 14 e 16-25)
- Il margine del 70% è corretto: (15 − 4,50) / 15 = 70%. Il conto economico però non sottrae il costo del fornitore.
- Il costo è 210 × 4,50 × 12 = **11.340 €**.
- Il margine lordo 2027 è al massimo 26.460 €.
- Il 70% considera solo il fornitore. Commissioni di pagamento, hosting e supporto, che il README include nel 78% di Turnio (README:11), non ci sono. È un'ipotesi da verificare.

**R4 · P1 · Ricavi su 12 mesi pieni per un modulo che non è pronto a gennaio** (righe 11, 20 e 21)
- 210 locali è l'adozione «a fine 2027», cioè lo stock a dicembre. Il conto la tratta come presente dal 1° gennaio.
- Lo sviluppo dura 6 mesi e mezzo (riga 21), quindi il lancio cade intorno ad agosto se si parte a gennaio.
- Stima, non dato:
  - lancio ad agosto e salita lineare fino a 182 locali (vedi R5) danno circa 500 locali-mese;
  - i ricavi sono circa 7.500 €, il margine circa 5.250 €;
  - il risultato 2027 è circa −155.000 €.

**R5 · P2 · Base clienti di fine 2027 incoerente** (riga 10)
- Il business case stima 600 locali. L'obiettivo ufficiale è 520 (roadmap.md:8 O2; previsione.md:35).
- Con 520 locali, il 35% dà **182 locali**, non 210.

**R6 · P1 · Adozione del 35% senza base di metodo** (riga 11)
- Il sondaggio (sondaggio-2026.md:4-5,16) ha 74 risposte su 412 clienti (18%), raccolte con un buono da 10 €, quindi auto-selezionate.
- La domanda chiede l'interesse per «una gestione semplice delle paghe», senza prezzo. Non misura l'intenzione di acquisto a 15 €.
- «Ridotto per prudenza» non è un metodo.
- Il modulo è solo per i locali fino a 15 dipendenti, ma il 35% è applicato a tutta la base. La quota di locali ammessi non è stimata. Il piano Pro arriva a 25 dipendenti e ci sono 471 dipendenti oltre soglia: 942 € / 2 € (prezzi.md:14).
- Solo il 19% indica le ore per il consulente come problema principale (sondaggio:11).
- La validazione prevista per il concetto B (20 interviste, si procede con almeno 12 sì: concetti.md:18) non risulta fatta, o il risultato non è riportato.
- Effetto: ricavi e LTV complessivo poggiano su un'ipotesi non validata. Servono scenari al 10%, 20% e 35%.

**R7 · P1 · Churn dell'1% al mese incoerente con la fonte citata** (riga 12)
- fidelizzazione.md non dice 12% l'anno. Dice 23,8% (riga 14), e anche quel calcolo ha un errore di metodo: divide per la base finale (98/412).
- Conto corretto sulla coorte iniziale: (330 − 249) / 330 = **24,5% l'anno** (fidelizzazione.md:9,19). In alternativa, 98 persi su una base media di 371 danno 26,4%.
- Come tasso mensile: 1 − (249/330)^(1/12) ≈ **2,3% al mese**.
- Le coorti (coorti.csv) a 6 mesi danno una ritenzione dell'87% senza la coorte di marzo. Con marzo la media scende all'82%, e pesata sui clienti è 78/98 = 79,6%. Escludere una coorte perché «anomala» gonfia il dato.
- Errore minore: 1% al mese composto fa 1 − 0,99^12 = 11,4% l'anno, non 12%.
- Un modulo aggiuntivo non può avere meno abbandono del prodotto a cui si appoggia.

**R8 · P1 · LTV calcolato sul prezzo invece che sul margine, e con il churn sbagliato** (riga 31)
- LTV = prezzo × margine / churn = 15 × 70% / 2,3% ≈ **456 €**, non 1.500 €.
- Anche con churn all'1% sarebbe 1.050 €.

**R9 · P1 · LTV/CAC e CAC** (righe 13 e 32)
- Con il CAC di 180 €: 456 / 180 = **2,5**, non 8,3.
- Il CAC di 180 € non torna con il marketing di lancio:
  - 40.000 € su 210 locali fanno 190 € (LTV/CAC 2,4);
  - su 182 locali fanno 220 € (LTV/CAC 2,1).
- Il CAC non comprende i nuovi clienti necessari a sostituire quelli persi (R7).

**R10 · P1 · Recupero del CAC in 8 mesi non ricavabile da nessuna formula** (riga 33)
- Il recupero si calcola come CAC / margine mensile.
- 180 / 10,50 = **17 mesi**; con 190 € sono 18 mesi; con 220 € sono 21 mesi.
- Nemmeno sul prezzo lordo si arriva a 8: 180/15 = 12 mesi, 180/18,30 = 9,8 mesi.
- Con churn al 2,3% al mese, solo circa il 67% dei locali è ancora cliente al 17° mese (0,977^17).

**R11 · P1 · Conclusione «pareggio nel 2028» non dimostrata e falsa con i conti corretti** (riga 37)
- LTV/CAC è una metrica per cliente e non dimostra il pareggio del progetto.
- Il margine per locale è 10,50 € al mese. Il solo supporto dedicato (24.000 € l'anno, cioè 2.000 € al mese) richiede circa **191 locali** per essere coperto.
- Con 210 locali stabili il contributo annuo è 26.460 − 24.000 = circa 2.460 €. Questo prima di manutenzione, acquisizioni per rimpiazzare il churn (circa 58 locali l'anno × 180 € ≈ 10.400 €) e recupero dei 136.000 € di sviluppo e lancio.
- Con 182 locali il contributo è già negativo: circa −1.070 € l'anno.
- Quindi il 2028 è in perdita anche sull'anno, e il cumulato non si recupera.
- Anche con i numeri del documento, IVA inclusa, la perdita corretta del 2027 (−113.884 €) richiederebbe circa 5 anni di contributo (+22 k€ l'anno).

**R12 · P1 · Costo e tempi dello sviluppo incoerenti con la roadmap** (riga 21)
- La roadmap prevede «Paghe Light, prima parte» per la squadra A in Q1: 14 settimane, più il report del costo del lavoro (6 settimane). Sono 20 settimane su 13 disponibili, già oltre la capacità (roadmap.md:13,19-20).
- Nel resto dell'anno la squadra A ha lo Scambio dei turni (P0, Q2) e la gestione di più sedi (Q3). Non c'è spazio per 6 mesi e mezzo di Paghe Light.
- Effetto: il lancio slitta e i ricavi 2027 calano ancora (R4), oppure si toglie capacità al P0. Il costo opportunità non è considerato.

**R13 · P2 · Rischi non dichiarati**
- concetti.md:19 dice «nessun rischio rilevante». In realtà il modulo tratta i dati sulle retribuzioni dei dipendenti e li passa a un fornitore esterno: va coinvolta l'agenzia Privacy & Compliance.
- Promettere un cedolino «senza passare dal consulente» potrebbe toccare attività riservate ai consulenti del lavoro (in Italia, L. 12/1979). Non l'ho verificato perché non ho accesso al web. Serve una verifica legale professionale.

**R14 · P3 · Effetto degli abbonamenti annuali sul prezzo**
- Se il modulo segue la regola dei 10 mesi pagati su 12 (prezzi.md:12), gli annuali pagano in media 12,50 € al mese.
- Con il 22% di annuali, il prezzo medio è circa 14,45 €.
- Il business case non dice se lo sconto si applica al modulo.

**Fuori perimetro, ma tocca la scelta di investire su B** (concetti.md:36-38)
- Il totale del concetto C è sbagliato: 5×0,4 + 2×0,3 + 3×0,3 = **3,5**, non 4,4.
- L'ordine corretto è A (4,3), poi B (3,7), poi C (3,5).

## Conto economico 2027 corretto (stime)

| Voce | Documento | Corretto, 210 locali tutto l'anno | Stima, lancio ad agosto e 182 locali |
|---|---|---|---|
| Ricavi netti | 46.116 | 37.800 | circa 7.500 |
| Costo del fornitore | 0 | −11.340 | circa −2.250 |
| Costi (sviluppo, lancio, supporto) | −140.000 | −160.000 | −160.000 |
| Risultato | −93.884 | **−133.540** | **circa −155.000** |

## Domande aperte

1. Quale base vale per fine 2027: 600 o 520 locali?
2. Che esito hanno avuto le 20 interviste di validazione del concetto B?
3. Quanti clienti hanno al massimo 15 dipendenti?
4. Da quando si vende il modulo? La roadmap lascia spazio alla squadra A?
5. Il costo di 4,50 € del fornitore è fisso o ha un minimo? Quali altri costi variabili ci sono (commissioni, SMS)?
6. Il supporto dedicato resta anche dopo il 2027?
7. Il fornitore e il modello «senza consulente» sono stati verificati da un legale e dalla privacy?

## Decisioni per l'utente

Sospendere l'approvazione e chiedere un business case rifatto con:
- ricavi netti;
- costo del fornitore;
- churn misurato sulla coorte;
- LTV calcolato sul margine;
- salita graduale dell'adozione dalla data reale di lancio;
- scenari di adozione al 10%, 20% e 35%;
- verifica privacy e legale.

Questa è una raccomandazione, non una decisione.

Firmato: DIPHDA (AIBPD-06)
