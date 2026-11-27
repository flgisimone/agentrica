AIBPD-09 · ALPHERATZ — Senior Sales & Revenue Strategist, reparto AIBPD (AI Business & Product Development)

Ho fatto una revisione in sola lettura di `vendite/pipeline.csv` (14 righe, CRM al 20/11/2026) e di `vendite/previsione.md`, rispetto alle regole scritte alle righe 7-10 della previsione. Non ho modificato nessun file. Non ho caricato AIBPD-01 perché in questa sessione non ho il tool `agent`. Il rapporto va comunque a lui per il consolidamento. Non ho letto schede della biblioteca: `riduzioni-di-prezzo` riguarda gli annunci ai consumatori, e qui i clienti sono imprese (README). Per i controlli ho usato anche `crescita/prezzi.md` (listino) e `partner/accordi.md` (Cassa Facile).

## Esito
La previsione Q1 2027 e la copertura dichiarate non rispettano le regole del documento stesso.
- **Previsione Q1:** dichiarata 18.584 € (232% della quota). Ricalcolata secondo le regole è circa **8.114 €** (101%), con D-03 tenuta e P-07 tolta.
- **Copertura:** dichiarata 3,0×. Quella reale è circa **2,1×**, sotto il minimo di 3×.
- **Previsione Q4:** contiene un'opportunità scaduta.

Ho controllato tutti i `valore_annuo` con la formula prezzo mensile × 12 × locali × (1 − sconto): tornano tutti (D-01 1.188, D-02 637, D-03 4.039, D-06 772, D-08 9.623, P-07 3.802…). Le somme del documento (1.896, 832, 18.584, 24.057) sono aritmeticamente corrette: gli errori stanno nel metodo, non nei conti.

## Rilievi (firmati ALPHERATZ)

**1. P1 · previsione.md r. 26-27: la previsione Q1 non è pesata e non comprende tutte le opportunità del trimestre.**
- **Errore:** il documento somma a valore pieno solo le fasi Proposta e Negoziazione. La regola di r. 9 chiede la somma pesata per la probabilità di tutte le opportunità con chiusura nel trimestre.
- **Calcolo corretto (probabilità per fase di r. 7):**

| Opportunità | Calcolo | Valore pesato |
|---|---|---|
| D-03 | 4.039×50% | 2.019,5 |
| D-04 | 348×30% | 104,4 |
| D-06 | 772×75% | 579 |
| D-07 | 348×10% | 34,8 |
| D-08 | 9.623×50% | 4.811,5 |
| D-10 | 1.188×30% | 356,4 |
| P-07 | 3.802×75% | 2.851,5 |
| P-11 | 348×50% | 174 |
| D-12 | 348×10% | 34,8 |
| **Totale lordo** | | **10.965,9 €** |

- **Dopo il duplicato del rilievo 2:** 8.114 € (101%) se resta D-03, 8.946 € (112%) se resta P-07.
- **Correzione:** sostituire la tabella con la somma pesata. Togliere «232% della quota».

**2. P1 · D-03 e P-07: la stessa opportunità è contata due volte.**
- **Errore:** sono lo stesso cliente (Gruppo Portico), con gli stessi 4 locali, lo stesso piano Plus e date vicine (31/1 e 15/2). Una arriva dal canale diretto (sconto 15%), l'altra dal partner Cassa Facile (sconto 20%). Entrambe sono nella previsione Q1 e nella pipeline.
- **Correzione:** il responsabile vendite tiene un'opportunità sola e chiude l'altra come duplicato. Per scegliere quale serve una decisione dell'utente: canale, sconto e compenso al partner cambiano.
- **Nota sul compenso:** `partner/accordi.md` r. 15 riconosce al partner ogni cliente con sede in Emilia-Romagna, da qualunque canale. Se Gruppo Portico è in regione, il compenso del 25% è dovuto anche se chiude in diretta. La sede non è nel CSV.

**3. P1 · previsione.md r. 31: la copertura è calcolata male.**
- **Errore:** 24.057 € è il totale di tutta la pipeline. Contiene:
  - i firmati D-01 e D-09 (1.896 €, già vinti e del Q4);
  - D-02, che chiude nel Q4;
  - D-05, scaduta;
  - il duplicato.
- **Correzione:** contare solo le opportunità aperte con chiusura nel Q1. Sono 20.816 €, che diventano 17.014 € senza P-07 (16.777 € senza D-03): **2,1×**, sotto il minimo di 3×.
- **Conseguenza:** per arrivare a 3× (24.000 €) mancano circa 7.000 € di pipeline Q1. Il documento deve dirlo e proporre un piano di generazione delle opportunità.

**4. P2 · D-06: lo sconto supera il 20% senza approvazione scritta.**
- **Errore:** lo sconto è del 35% e il campo `note` è vuoto. La regola di r. 8 chiede l'approvazione del CEO scritta nelle note.
- **Correzione:** registrare l'approvazione del CEO nelle note, oppure riportare lo sconto entro il 20%. Con il 20% il valore diventa 950 € (712,8 € pesato).
- **Nella previsione:** finché la questione non è chiusa, D-06 va segnalata come a rischio.

**5. P2 · D-05: data di chiusura scaduta, eppure è nella previsione Q4.**
- **Errore:** la chiusura era prevista il 30/09/2026, quasi due mesi fa, con nota «in attesa di risposta». La regola di r. 10 chiede di aggiornarla o chiuderla come persa entro una settimana. Invece è conteggiata nel Q4 (r. 17) per 354 €.
- **Correzione:** toglierla dal Q4. Atteso Q4 = 1.896 + 637×75% = **2.374 €**, non 2.728 €.
- **Se il cliente risponde:** si aggiorna la data e la si rimette nel trimestre giusto.

**6. P3 · D-04: probabilità sbagliata.**
- **Errore:** probabilità 70 in fase Demo, mentre la regola di r. 7 dà il 30%.
- **Correzione:** portarla a 30. Non cambia i numeri del documento, che non la includeva.

**7. P2 · Concentrazione su D-08 (rischio, non è una violazione).**
- D-08 (Pizza&Co, 9 locali) vale 4.811 € pesati, circa il 59% della previsione Q1 corretta.
- Senza D-08 la previsione scende a circa 3.300 € (41% della quota).
- **Correzione:** mostrare uno scenario senza D-08 e un piano di mitigazione.

**8. P2 · P-07 e P-11 dipendono da un accordo non ancora firmato (dipendenza).**
- **Fatto:** l'accordo con Cassa Facile si firma a dicembre (`partner/accordi.md` r. 3) e l'API per l'integrazione arriva da gennaio 2027 (r. 16). P-07 è in Negoziazione al 75%.
- **Correzione:** segnare la dipendenza nella previsione.
- **Effetto sul ricavo:** il compenso al partner è il 25% dell'incassato IVA compresa per 12 mesi (r. 14), cioè circa il 30% dell'imponibile. Riduce il ricavo netto del primo anno di queste opportunità. L'ARR resta quello, ma serve una riga di ricavo netto se la previsione viene usata per il budget.

**9. P3 · previsione.md r. 35: obiettivo 2027 senza legame con pipeline e abbandoni.**
- **Fatto:** il documento confronta 520 locali con i 412 di oggi. I 412 sono al 31/10, secondo il README, quindi non includono D-01 e D-09 firmati a novembre. L'abbandono dei clienti non è considerato.
- **Correzione:** indicare la base, gli abbandoni attesi e quanti locali nuovi servono, poi confrontarli con i circa 19 locali unici della pipeline Q1.

## Domande aperte (per l'utente / AIBPD-01)
- D-03 o P-07: quale tenere? E Gruppo Portico ha sede in Emilia-Romagna?
- D-06: esiste un'approvazione del CEO per il 35%?
- D-05: aggiornare la data o chiudere come persa? Decide il responsabile vendite.
- La quota Q1 di 8.000 € è confermata come ARR nuovo lordo, cioè senza togliere i compensi ai partner?

Sono stime fatte sui dati inventati del progetto di prova. Sono raccomandazioni, non decisioni approvate.

— ALPHERATZ (AIBPD-09)
