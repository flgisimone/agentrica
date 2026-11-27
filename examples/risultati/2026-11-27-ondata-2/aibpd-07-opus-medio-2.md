AIBPD-07 · MENKENT — Senior Growth & Monetization Manager, reparto AIBPD (AI Business & Product Development)

Ho letto tutto `crescita/` (imbuto.md, prezzi.md) in sola lettura e non ho modificato nessun file. Per verificare i numeri ho incrociato README.md, clienti/fidelizzazione.md, clienti/coorti.csv, partner/accordi.md, mercato/fonti.md, mercato/sondaggio-2026.md, marketing/posizionamento.md e roadmap/roadmap.md. Il rapporto andrebbe ad AIBPD-01 · ALDERAMIN, ma in questa sessione non ho il tool `agent` e non ho potuto caricarlo: lo consegno al chiamante.

**Esito:** i conti aritmetici tornano: passi dell'imbuto, CAC = spesa/clienti, MRR del mix 21.630 €, +19% relativo dell'esperimento. Sono sbagliati invece quattro cose: la definizione della conversione prova→pagamento, la significatività dell'esperimento, il CAC dei canali «gratuiti» e l'effetto degli annuali sui ricavi. Le due proposte operative (spostare budget su Instagram, campagna annuali) poggiano su questi errori.

Calcoli di riferimento: ARPA = 21.630 / 412 = 52,5 €/mese. Il ricavo massimo a 12 mesi è quindi 630 €, che diventa 491 € a margine lordo (78%).

## Rilievi

**M-01 · P1 · Conversione prova→pagamento calcolata sul passo sbagliato** (crescita/imbuto.md, r. 12 e r. 14)
- Il 20% è 180/900, cioè dalle prove *attivate* al pagamento. Dalle prove avviate la conversione è 180/1.500 = **12%**, sotto il 15% indicato come media di settore, non sopra.
- Il 15% non ha fonte: non compare in mercato/fonti.md.
- Le definizioni di attivazione non coincidono: qui «almeno un turno pubblicato» (60%), in clienti/fidelizzazione.md r. 52 «account creato ed email confermata» (97%).
- Correzione:
  - riportare due metriche distinte: prova avviata→pagante 12% e prova attivata→pagante 20%;
  - togliere il confronto con il 15% o citarne la fonte con la data;
  - ridefinire l'obiettivo 2027 (25%) indicando su quale dei due passi si misura;
  - adottare una sola definizione di attivazione in tutti i documenti.

**M-02 · P1 · Esperimento della pagina prezzi non affidabile; decisione da sospendere** (crescita/imbuto.md, r. 18–25)
- Peeking: il test è stato controllato ogni giorno e fermato al primo risultato «significativo». Questo gonfia molto i falsi positivi.
- Il risultato comunque non è significativo. Test z su due proporzioni: 35/412 (8,5%) contro 41/405 (10,1%) dà z ≈ 0,80, p ≈ 0,42. Siamo lontani dal 95%.
- Campione: per rilevare 8,5%→10,1% con α = 0,05 e potenza 80% servono circa **5.000 visite per variante**. Il test ne aveva circa 400.
- Durata: 6 giorni non coprono un ciclo settimanale completo.
- Metrica: misura le prove avviate, non i paganti né il mix di piani, che è proprio ciò che «Pro in evidenza» dovrebbe spostare.
- Correzione:
  - sospendere la decisione «B diventa la pagina dei prezzi»;
  - rifare il test con campione e durata fissati prima (almeno 2 settimane intere), senza fermarlo in anticipo;
  - metrica primaria: conversione in paganti o MRR per visita; metrica di controllo: quota Pro/Plus.

**M-03 · P1 · CAC del referral pari a 0 € errato** (crescita/imbuto.md, r. 33 e r. 36)
- Il referral regala un mese a chi invita e uno a chi è invitato: in tutto circa 2 × 52,5 = **~105 € di ricavo rinunciato per cliente**. Va trattato come costo di acquisizione.
- «Raddoppiare il referral, che non costa nulla» non è una leva di budget: il referral non si raddoppia spendendo, e ha un costo.
- Correzione: indicare CAC ≈ 105 € (stima, assunzione ARPA medio) e riformulare la proposta come esperimento sull'incentivo, con un obiettivo di inviti.

**M-04 · P1 · CAC del canale «Fornitori della cassa» pari a 0 € non vale per il 2027** (crescita/imbuto.md, r. 34; partner/accordi.md, r. 14–15)
- L'accordo Cassa Facile in firma prevede il 25% dell'incassato IVA compresa per 12 mesi: circa 0,25 × 1,22 × 630 ≈ **192 € per cliente**, il CAC più alto della tabella.
- In più riconosce a Cassa Facile tutti i clienti dell'Emilia-Romagna, da qualunque canale arrivino. Questo carica di commissione anche clienti venuti da Google o dal referral.
- Correzione: nel piano 2027 stimare il CAC del canale con il compenso dell'accordo. Segnalare la clausola dei clienti riconosciuti a chi segue i partner (AIBPD-03) prima della firma.

**M-05 · P1 · Proposta di spostare metà di Google Ads su Instagram basata sulla metrica sbagliata e su dati immaturi** (crescita/imbuto.md, r. 31–32 e r. 36)
- Conta il rapporto LTV/CAC, non l'LTV da solo:

| Canale | LTV/CAC a ricavo | LTV/CAC a margine |
|---|---|---|
| Google Ads | 5,5 | 4,3 |
| Instagram | 4,3 | 3,3 |

  Google rende di più per euro speso.
- L'LTV di Instagram (640 €) è estrapolata da 3 mesi e 14 clienti. Supera anche il massimo teorico a 12 mesi con l'ARPA medio (630 €): presuppone abbandono quasi nullo.
- Anche gli LTV a 12 mesi di tutti i canali sono a ricavo, non a margine. Su questo pesano dati a monte discutibili:
  - abbandono annuo calcolato 98/412 invece che sui clienti a inizio periodo (98/330 = 29,7%), in fidelizzazione.md r. 14;
  - ritenzione a 6 mesi dell'87% che esclude la coorte di marzo: con marzo è circa l'82% (media delle coorti) o il 79,6% (pesata), in fidelizzazione.md r. 26.
- Attribuzione incoerente: la tabella dà a Google 100/180 = 56% dei clienti nuovi, il sondaggio (mercato/sondaggio-2026.md r. 15) solo il 7%. I due dati misurano cose diverse (ultimo clic contro ricordo), ma la differenza va spiegata prima di spostare budget.
- Il CAC conta solo la spesa in pubblicità, senza i costi di vendite e marketing (4 persone).
- Correzione:
  - nessuno spostamento di budget per ora;
  - test incrementale su Instagram con un tetto di spesa (per esempio il 20% del budget Google per 3 mesi) e soglia di uscita su LTV/CAC a margine;
  - LTV ricalcolato a margine con l'abbandono corretto;
  - CAC pieno accanto a quello sulla sola spesa pubblicitaria.

**M-06 · P1 · Gli annuali non fanno crescere i ricavi del 20%: li riducono** (crescita/prezzi.md, r. 18)
- Si confonde incasso con ricavo. L'annuale costa 10/12 del listino e il ricavo si riconosce mese per mese, come dice finanza/business-case.md r. 27. Incassare prima migliora la cassa, non i ricavi.
- Stima: portare il 38% dei clienti (22%→60%) all'annuale costa circa 0,38 × 20.688 € × 2/12 × 12 ≈ **−16.400 € l'anno, −6% dell'ARR**. Assunzioni: stesso mix di piani, nessun effetto sull'abbandono.
- Il beneficio vero da dimostrare è un minore abbandono. Oggi manca il dato dell'abbandono annuale contro mensile.
- Dipendenza: la «Fatturazione annuale automatica» è in roadmap per il Q1 (roadmap/roadmap.md r. 22, 8 settimane). Una campagna a gennaio arriverebbe prima dello strumento.
- Correzione:
  - riscrivere la proposta come scelta fra cassa e ricavo;
  - calcolare il punto di pareggio (di quanto deve calare l'abbandono degli annuali per compensare lo sconto del 16,7%);
  - misurarlo su una coorte prima della campagna;
  - valutare uno sconto annuale minore, per esempio 1 mese.

**M-07 · P2 · Le soglie dei dipendenti non spingono al piano superiore** (crescita/prezzi.md, r. 7–11)
- Con 2 € per dipendente oltre soglia:
  - un Base con 25 dipendenti paga 29 + 15 × 2 = **59 €**, come Pro;
  - un Base con 40 dipendenti paga 89 €, meno di Plus (99 €);
  - un Pro con 40 dipendenti paga 89 €, meno di Plus.
- Il passaggio di piano dipende solo dalle funzioni, e da Base a Pro la funzione di spicco non c'è ancora (M-08).
- Il sondaggio (r. 13: il 64% pagherebbe 59 € o più per 10–25 dipendenti) fa pensare a margine di prezzo su Base. È però un dato debole: solo clienti attuali, 18% di risposte, buono di 10 €.
- Correzione:
  - oltre soglia a scaglioni o a un prezzo che renda conveniente il piano superiore prima del pareggio (per esempio 3–4 € o pacchetti da 5);
  - in alternativa limiti fissi per piano;
  - simulare l'effetto sul mix attuale (942 € al mese di oltre soglia, circa 471 dipendenti) prima di decidere.

**M-08 · P2 · Il piano Pro elenca una funzione non disponibile** (crescita/prezzi.md, r. 8)
- «Scambio dei turni (dal 2027)» è in roadmap per il Q2 2027 (roadmap.md r. 25) e dipende da «App dipendenti 2.0», pianificata per il Q3 (r. 28). La data reale può slittare oltre metà 2027.
- Correzione: togliere la funzione dal listino attuale o indicarla come «in arrivo» senza data finché la dipendenza non è risolta.

**M-09 · P1 · Messaggio «Gratis per sempre fino a 3 dipendenti» in contrasto con il listino** (marketing/posizionamento.md, r. 17, contro crescita/prezzi.md r. 5–13)
- Il listino non ha un piano gratuito: si parte da 29 €. Il messaggio è pubblicato sulla pagina dei prezzi e su Instagram, quindi è un'informazione ingannevole sul prezzo (interfaccia ingannevole).
- Correzione: allineare subito il messaggio al listino. Se si vuole un piano gratuito, va trattato come decisione di pricing con stima della cannibalizzazione su Base.
- Va condiviso con AIBPD-08 (marketing).

**M-10 · P3 · MRR degli annuali forse calcolato a listino** (crescita/prezzi.md, r. 14; README.md, r. 10)
- Il README dice che gli annuali contano per il loro equivalente mensile (10/12). Il mix invece moltiplica tutti i locali per il prezzo di listino.
- Se il 22% è annuale, l'MRR potrebbe essere sovrastimato di circa 0,22 × 20.688 / 6 ≈ **760 €/mese**.
- Correzione: verificare come sono contati gli annuali e, se serve, ricalcolare MRR e ARR.

## Nozioni della biblioteca
- Ho letto «riduzioni-di-prezzo» (Codice del consumo art. 17-bis, testo in vigore dal 2 aprile 2023, verificata il 2026-11-19) e «funzione-di-recesso» (Codice del consumo art. 54-bis, D.lgs. 209/2025, verificata il 2026-11-19).
- Valgono per i consumatori. I clienti di Turnio sono imprese (README r. 12), quindi in linea di principio non si applicano alla campagna annuali né al «due mesi gratis». Va confermato con una revisione legale umana se fra i clienti ci sono ditte individuali in situazioni dubbie.
- Non ho accesso al web, quindi non ho ricontrollato le fonti.

## Domande aperte
1. Qual è l'abbandono dei clienti annuali rispetto ai mensili? Decide M-06.
2. Gli annuali sono contati a 10/12 nell'MRR? (M-10)
3. Con quale modello di attribuzione sono assegnati i clienti ai canali? E i 26 clienti «fornitori della cassa» hanno già un compenso informale?
4. Come sono calcolati gli LTV a 12 mesi (ricavo o margine, quale abbandono, il mese gratis del referral è dedotto)?
5. La decisione sulla pagina B è già in produzione?

Tutte le correzioni sono proposte: decisioni su prezzi, budget, campagne e accordi restano all'utente.

— MENKENT (AIBPD-07)
