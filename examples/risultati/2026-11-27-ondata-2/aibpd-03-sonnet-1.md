AIBPD-03 · ALPHARD — Senior Product Innovation Strategist, reparto AIBPD (AI Business & Product Development)

Non ho caricato AIBPD-01 e non ho letto schede della biblioteca. Non ho il tool `agent`, e le tre schede (riduzioni di prezzo, funzione di recesso, direttiva 2024/825) non riguardano questo compito. Non ho verificato sul web le norme citate al rilievo 3 (somministrazione di lavoro, riserva dei consulenti del lavoro). Vanno controllate sulla fonte ufficiale prima di usarle.

Lettura in sola lettura di `innovazione/concetti.md`, `mercato/` (4 file), `README.md` e `crescita/prezzi.md` (per i prezzi dei piani). Non ho modificato nulla.

**Esito: la scelta proposta non regge.** La matrice contiene un errore di calcolo che ne inverte il risultato. Delle tre ipotesi (A, B, C), le validazioni di B e C sono deboli. Il mercato su cui poggiano i punteggi è sovrastimato.

## Rilievi

**1. P0 — `concetti.md` r.36-38: il totale di C è sbagliato e la proposta si rovescia.**
- C: 5×0,4 + 2×0,3 + 3×0,3 = 2,0 + 0,6 + 0,9 = **3,5**, non 4,4.
- Ordine corretto: A 4,3 > B 3,7 > C 3,5.
- La riga 38 («dopo A, investire su C… totale più alto, poi B») poggia sul totale errato. Con il calcolo giusto, dopo A viene B.
- Correzione: C = 3,5 e proposta «A, poi B; C solo dopo una validazione seria».
- Ricontrolla anche i punteggi. «Valore 5» per C non ha evidenza, e «Coerenza 3» per C e «Fattibilità 2» sono giudizi non motivati. Vanno motivati e accompagnati da un'analisi di sensibilità sui pesi.

**2. P1 — Concetto C, r.24: rischio normativo non considerato.**
- «Turnio assume formalmente il lavoratore per la giornata e lo fattura al locale» somiglia a somministrazione di lavoro o intermediazione. Sono attività riservate ad agenzie autorizzate.
- Mancano nel documento: autorizzazione, contratti a chiamata o occasionali, contributi, INAIL, sicurezza, responsabilità solidale, pagamento dei lavoratori.
- Il ricarico del 18% non è confrontato con questi costi, quindi il margine è ignoto. Il margine lordo di Turnio è 78% (README) e non è confrontabile.
- Il documento non cita nessuno di questi punti. Il concetto è anche lontano dal software venduto oggi.
- Correzione:
  - aggiungere una riga «Rischi» a C;
  - fare una verifica con un consulente legale o del lavoro prima di ogni test;
  - coinvolgere la Privacy & Compliance Agency, perché si raccolgono dati di lavoratori;
  - abbassare «Fattibilità» e «Coerenza» in modo motivato.

**3. P1 — Concetto C, r.25-26: ipotesi e validazione non verificabili.**
- «I ristoratori vorranno usare…» non ha soglia, numeri né scadenza.
- «Interesse positivo» su una pagina di presentazione non è una metrica. Non si sa cosa conti come interesse né quanto traffico serva.
- Manca il lato dell'offerta: il marketplace ha due lati e bisogna validare anche i lavoratori disposti a iscriversi.
- Correzione:
  - soglie esplicite, per esempio N locali che lasciano un contatto o prenotano un turno;
  - tasso di adempimento (fill rate) di un test manuale con pochi turni;
  - un test «concierge» fatto per mano, solo dopo la verifica legale;
  - tempo massimo e criterio di stop.

**4. P1 — Concetto B, r.19: «nessun rischio rilevante» è infondato.**
- Il cedolino tocca dati sul lavoro e sul compenso dei dipendenti, quindi dati personali. Servono ruoli privacy, accordo art. 28 e sicurezza.
- Gli errori di calcolo hanno responsabilità economica.
- Il calcolo dei cedolini è una competenza regolamentata dei consulenti del lavoro. Da verificare.
- Le regole retributive cambiano nel tempo (contratti collettivi, contributi).
- I clienti arrivano al 38% dal consulente del lavoro o dal commercialista (`sondaggio-2026.md`, riga «Dove hai conosciuto Turnio»). Un prodotto «senza passare dal consulente» mette in conflitto il canale principale.
- Correzione: elenco dei rischi (normativo, privacy, responsabilità, canale) e stima dei costi di mantenimento. Il «dati che Turnio ha già» regge solo per le ore.

**5. P1 — Concetto B, r.17-18: ipotesi e test deboli.**
- Domanda ipotetica e a risposta sì/no: «Compreresti a 15 €?». Misura l'intenzione dichiarata, non l'acquisto. Il prezzo è presentato nella domanda stessa, e una domanda così tende a dare più sì del reale.
- Soglia 12/20 = 60% senza motivazione.
- 20 interviste sono troppo poche per distinguere 55% da 65%.
- Il campione è «clienti» soltanto. Non copre i locali fuori dalla base clienti, né quelli con più di 15 dipendenti, che il prodotto esclude.
- Il problema (19% indica il calcolo ore) è l'ultimo dei tre principali problemi ed è un dato di soli clienti. Ricontrolla anche la domanda sondaggio «Ti interessa una gestione semplice delle paghe?» (Sì 58%, forse 30%, no 12%): non è disponibilità a pagare e usa una formulazione guida.
- Correzione:
  - soglia derivata da un punto di pareggio (non 60% a caso);
  - impegno concreto (pre-ordine o lista d'attesa con acconto simbolico, o prova a pagamento) invece di opinione;
  - campione più ampio e con non clienti;
  - gli altri due problemi (assenze 46%, tempo turni 27%) sono già più grandi.

**6. P2 — Concetto A, r.9-11: la validazione è più debole di «validato».**
- Il problema parla di assenze «dell'ultimo minuto» (r.7), ma l'ipotesi misura solo quelle annunciate con **più di 4 ore** di anticipo (r.9). È la parte più facile. Il caso difficile (meno di 4 ore) non è misurato.
- 8 locali clienti, scelti presumibilmente fra i più disponibili (non c'è criterio di selezione). Non c'è un gruppo di controllo.
- Il confronto «con le due settimane precedenti» è esposto a stagionalità e a eventi.
- 6 su 8 «sopra il 40%» è una soglia per locale, non sulla media. L'esito non è riportato con numeri: mancano il numero di assenze osservate e il valore medio.
- Il prototipo è cliccabile e non è funzionante. Se lo scambio è simulato, la misura dell'accettazione dei colleghi non è una misura d'uso reale.
- Correzione: scrivere «validato in modo preliminare», riportare i numeri assoluti per locale e per tipo di assenza, e confermare con una versione reale e un gruppo di confronto.
- La concorrenza (`concorrenti.md` r.7 e r.9) ha già lo scambio dei turni (Orarix, Shiftella). Il documento non dice cosa differenzia A. Il «Coerenza 5» non lo giustifica. Il prezzo Pro lo include dal 2027 (`prezzi.md` r.8).

**7. P1 — `sintesi-mercato.md`: i numeri del mercato su cui si fondano i punteggi sono sbagliati o non comparabili.**
- **TAM (r.9)**: usa F1 del **2019** (198.000 locali, `fonti.md` r.7), mentre F2 del 2026 dice 176.000. Il censimento vecchio sovrastima di 22.000 locali (+12,5%). Il TAM conta anche i locali senza dipendenti (58%, F2), per i quali un'app dei turni non serve. Prezzo 99 € = piano Plus per tutti (r.13, scelta ottimistica). Il rapporto tra Plus e mix reale è 52/412 locali (`prezzi.md` r.14).
- Ricalcolo prudente: 176.000 × 31% = 54.560 locali nel segmento 3–40 dipendenti (F2). Al 31% sono 4.200 locali con il prezzo medio reale: MRR 21.630 / 412 = 52,5 € al mese, cioè circa 630 € l'anno per locale. Il TAM diventa circa 34 milioni di € (54.560 × 52,5 × 12), contro i 235 milioni dichiarati. L'ordine di grandezza cambia. Con il prezzo Plus, 54.560 × 99 × 12 = 64,8 milioni.
- **SAM (r.10)**: 60% è «Nord e Centro» sul totale dei locali (F2). Applicato come filtro «dove arriva il supporto» non è verificato, e va applicato al segmento già filtrato, non al totale 2019.
- **SOM (r.11)**: «5% del SAM» è una percentuale senza ipotesi. 5.940 locali sono 14 volte i 412 clienti attuali in tre anni, senza un piano di acquisizione. Si può verificare con funnel e capacità di vendita (3 persone).
- **Crescita (r.17)**: da 0,8 a 1,4 miliardi in 3 anni (2023-2026) = (1,4/0,8)^(1/3) − 1 = **20,5%**, non 32%. «Il mercato dei turni segue lo stesso andamento» è un'ipotesi non supportata da fonte: F3 riguarda tutto il software gestionale, non i turni.
- **Disponibilità a pagare (r.21)**: il sondaggio (F4) è inviato ai soli 412 clienti attuali, con buono da 10 €, 74 risposte (18%). Non rappresenta «i locali del mercato». Chi risponde è più soddisfatto. Inoltre la fascia «59 € o più» è aperta e si sovrappone alla fascia «30–59 €» sul valore 59. Il 64% contrasta con il mix reale: 190 clienti su 412 (46%) pagano il piano Base a 29 €.
- **Concorrenza (r.25, e `concorrenti.md` r.14)**: la quota somma 18.000 **utenti** (dipendenti) di Orarix con 900 + 350 + 412 **locali**. Unità diverse. Per locali: Orarix circa 2.300, Planora 900, Turnio 412, Shiftella 350 (totale 3.962): Orarix 58%, Planora 23%, Turnio 10,4%, Shiftella 8,8%. «Il mercato è concentrato con il 91,5%» e «Turnio è secondo» sono sbagliati: Turnio è terzo, dietro Planora. Inoltre i dati sono dichiarati dai concorrenti (fonte non indipendente) e i nomi sono inventati.
- **Segmento (r.29)**: 31% è corretto per F2 («da 3 a 40 dipendenti»). Ma il TAM/SAM non lo usano.
- Correzione: rifare TAM/SAM/SOM su F2 (2026) con il filtro 3–40 dipendenti e il prezzo medio reale, indicare un intervallo e le ipotesi, dichiarare la fonte 2019 come superata.

**8. P2 — `concetti.md` r.7 e r.15: i problemi vengono da clienti, non dal mercato.**
- «Il primo problema dei locali (46%)» in realtà è il 46% dei 74 rispondenti, tutti già clienti e con incentivo. Vale lo stesso per il 19% di B.
- Correzione: scrivere «46% dei clienti rispondenti (n=74)», e integrare con interviste a non clienti.

**9. P2 — Mancanza di costi, ricavi e confronto fra concetti.**
- Il documento non stima ricavi o costi per concetto (impegno di sviluppo, tempi, squadre: ce ne sono tre da due persone), né il ricavo atteso, né l'impatto su ARR/MRR. «Valore 4/5» è un'impressione.
- Le ipotesi critiche non sono ordinate per rischio e non c'è un criterio di stop o di scelta se la validazione fallisce.
- Correzione: una riga per concetto con costo stimato, ricavo atteso (intervallo e formula), tempo e ipotesi più rischiosa.

**10. P3 — Altro.**
- Pesi 40/30/30 non motivati.
- Nessuna data per la scelta né owner dell'esperimento.

## Domande aperte per l'utente
- Qual è l'obiettivo 2027 (ricavi, ritenzione, nuovo segmento)?
- C'è già un parere legale sulla somministrazione di lavoro?
- Quali sono i numeri grezzi della prova di A (assenze per locale)?
- Il modulo Kiosk e la roadmap (`roadmap/`) assorbono già la capacità delle squadre? Non li ho letti.

## Decisioni che richiedono approvazione umana
Correzione della proposta (A poi B), qualsiasi test di C con persone o clienti, qualsiasi contatto con locali o lavoratori, budget per esperimenti.

Questa è un'analisi e non una consulenza legale, fiscale o finanziaria.

Nota: lavoro su Sonnet. I rilievi P0 e P1 (1, 2, 3, 4, 5, 7) vanno riesaminati dal direttore AIBPD-01 o da un revisore su Opus prima di renderli definitivi. I calcoli (3,5; 20,5%; quote per locali) sono verificabili a mano dalle formule sopra.

— AIBPD-03 · ALPHARD
