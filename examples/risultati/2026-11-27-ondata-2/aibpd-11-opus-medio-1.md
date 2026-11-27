AIBPD-11 · KOCHAB — Senior Customer Success & Retention Strategist, reparto AIBPD (AI Business & Product Development)

# KOCHAB: revisione dei dati di fidelizzazione di Turnio (`clienti/`)

**Come ho lavorato.** Ho solo letto i file, senza modificarne nessuno. Ho letto `clienti/fidelizzazione.md` e `clienti/coorti.csv`. Per i confronti ho letto anche `README.md`, `crescita/imbuto.md`, `crescita/prezzi.md`, `finanza/business-case.md`, `roadmap/roadmap.md`, `roadmap/portafoglio.md` e `prodotto/prd-scambio-turni.md`. Ho rifatto i conti con python3.

**Limiti.**
- Il progetto è di prova: tutti i numeri sono inventati (README r.5).
- Non ho caricato il direttore AIBPD-01 · ALDERAMIN perché non avevo il tool `agent`. Questo rapporto è la consegna per lui.
- Non ho letto schede della biblioteca. L'unica del mio ruolo, `funzione-di-recesso` (art. 54-bis del Codice del consumo), riguarda i consumatori, mentre i clienti di Turnio sono imprese (README r.12). Va riletta solo se si progetta il flusso di disdetta.

## Esito

I numeri principali sono calcolati in modo da sembrare migliori di quanto sono:
- l'abbandono vero è circa il 24,5%, non il 23,8%;
- l'NRR vero è l'87%, non il 108%;
- l'NPS vero è 59 su un campione distorto, non 61;
- la ritenzione a 6 mesi è dell'82%, non dell'87%.

Il punteggio di salute e la definizione di attivazione non misurano la prima causa di abbandono: i dipendenti non usano l'app (41%). Non c'è nessun P0. Ci sono 6 rilievi P1 e 3 P2.

## Rilievi

**R1 · P1 · Tasso di abbandono con il denominatore sbagliato** (`fidelizzazione.md` r.14)
- **Errore:** 98 / 412 divide le perdite per la base di fine periodo, che comprende i 180 clienti nuovi. In più il numeratore mescola le perdite della base iniziale con quelle dei nuovi.
- **Conto corretto:**
  - Clienti della base iniziale persi: 330 − 249 = 81 (dati in r.9 e r.19).
  - Abbandono annuo dei clienti: 81 / 330 = **24,5%**, cioè ritenzione del 75,5% e circa 2,3% al mese.
  - In alternativa, tutte le perdite sulla base media: 98 / ((330 + 412) / 2) = 98 / 371 = **26,4%**.
- **Correzione:** adottare 81/330 come metrica ufficiale. Riportare a parte l'abbandono precoce dei nuovi clienti. Ricalcolare O1 in `roadmap.md` r.7 («sotto il 20%») sulla base del 24,5%: il divario da colmare passa da 3,8 a 4,5 punti.

**R2 · P1 · NRR con il denominatore dei soli clienti rimasti** (`fidelizzazione.md` r.18-20)
- **Errore:** 15.020 / 13.900 esclude dal denominatore l'MRR dei clienti persi. Misura l'espansione di chi è rimasto, non la ritenzione dei ricavi.
- **Conto corretto:**
  - NRR = 15.020 / 17.200 = **87,3%**.
  - GRR (ritenzione lorda dei ricavi) ≤ 13.900 / 17.200 = **80,8%**. Il dato esatto richiede le riduzioni di piano, che non sono documentate.
  - Espansione netta di chi resta: +1.120 €, cioè +8,1%.
- **Correzione:** togliere la frase «la base cresce anche senza clienti nuovi» (r.20), che è falsa: senza clienti nuovi l'MRR cala del 12,7% l'anno. Riportare NRR e GRR insieme.
- **Dato utile:** chi ha abbandonato pagava in media 3.300 / 81 = 40,7 € al mese, chi resta 13.900 / 249 = 55,8 €. L'abbandono si concentra sui locali piccoli e sul piano Base, cosa coerente con il 22% di motivi legati al prezzo.

**R3 · P1 · Ritenzione a 6 mesi senza la coorte peggiore** (`fidelizzazione.md` r.26, dati in `coorti.csv` r.2-7)
- **Errore:** la coorte di marzo (14 attivi su 24, il 58,3%) è esclusa come «anomala», ma la promozione è un canale di acquisizione reale. Toglierla nasconde proprio il rischio dei clienti arrivati con le promozioni. In più la media è semplice e non pesata sul numero di clienti.
- **Conto corretto:**

| Calcolo | Senza marzo | Con marzo |
|---|---|---|
| Media semplice | 86,7% (il dato del documento) | **82,0%** |
| Media pesata | 64/74 = 86,5% | **78/98 = 79,6%** |

  Le coorti una per una: 85,7 / 90,9 / 81,2 / 86,7 / 58,3 / 88,9%.
- **Correzione:** usare la media pesata con tutte le coorti. Tenere marzo come serie separata («acquisiti con promozione»). Valutare la stessa cosa per il referral, che regala un mese gratis (`imbuto.md` r.33).

**R4 · P2 · I numeri di coorti e abbandoni non tornano**
- **Problema:** dal bilancio dei clienti i nuovi persi sono 98 − 81 = 17. Il CSV però ne mostra almeno 23 persi già all'ultimo mese misurato: 2+1+3+2+10+2 ai sei mesi più 1+1+1 ai tre mesi per maggio-luglio. Le coorti da agosto a ottobre non sono nemmeno contate.
- **Conseguenza:** se «attivi» vuol dire «paganti», le perdite sono almeno 104, non 98. Le due fonti non possono essere vere entrambe.
- **Correzione:** il CSV non dice cosa significa «attivi» (che pagano? che usano l'app?). Va definito. Poi va riconciliato con il bilancio di r.9-12 prima di usare entrambi. Il totale dei nuovi (180) torna.

**R5 · P2 · NPS calcolato male e campione distorto** (`fidelizzazione.md` r.31)
- **Conto corretto:** promotori 52/74 = 70,3%, detrattori 8/74 = 10,8%, quindi NPS = **59,5, cioè circa 59, non 61**.
- **Incertezza:** con 74 risposte il margine al 95% è circa ±13 punti (±15 senza la correzione per popolazione finita). L'intervallo va quindi da circa 46 a 73.
- **Distorsioni:**
  - il sondaggio esclude i clienti con meno di sei mesi, proprio dove si concentra l'abbandono, oltre ai clienti già persi;
  - ha risposto solo il 27,6% (74 su 268) e chi non risponde tende a essere meno soddisfatto;
  - risponde il titolare, non i dipendenti, che sono la prima causa di abbandono.
- **Correzione:**
  - riportare l'NPS con il suo intervallo e il tasso di risposta;
  - fare il sondaggio su tutta la base, divisa per anzianità e per piano;
  - aggiungere una domanda breve ai dipendenti nell'app, solo con dati aggregati e dopo la verifica della Privacy & Compliance.

**R6 · P1 · Il punteggio di salute non misura i rischi veri** (`fidelizzazione.md` r.41-48, da confrontare con r.35-37)
- **Problema:**
  - La prima causa di abbandono è che i dipendenti non usano l'app (41%), e solo il 22% di loro la usa ogni settimana. Nessun segnale del punteggio misura l'uso dei dipendenti.
  - Il 70% del peso va agli accessi del responsabile e ai turni pubblicati: un locale può avere un punteggio alto anche se nessun dipendente apre l'app.
  - «Meno ticket è meglio» penalizza chi è coinvolto e premia chi è silenzioso.
  - La soglia di 40 non è mai stata verificata sugli abbandoni reali.
- **Correzione proposta (pesi indicativi, da validare):**

| Segnale | Peso |
|---|---|
| Dipendenti attivi ogni settimana (%) | 30% |
| Timbrature sui turni pubblicati | 20% |
| Turni pubblicati | 15% |
| Accessi del responsabile | 10% |
| Pagamenti, compresi quelli falliti | 10% |
| Andamento del piano e dei dipendenti in più | 10% |
| Segnale di rischio: anzianità sotto i 90 giorni o cliente Kiosk | 5% |

  Ticket solo come segnale qualitativo. Il modello va verificato a ritroso sui 98 clienti persi: quanti avevano un punteggio sotto 40 nei 60 giorni prima della disdetta (precisione e richiamo).

**R7 · P1 · L'attivazione misura la registrazione, non il valore** (`fidelizzazione.md` r.52-53)
- **Problema:**
  - «Account creato ed email confermata» al 97% è una metrica di vanità.
  - È diversa dall'attivazione di `imbuto.md` r.11 (almeno un turno pubblicato, 60%): ci sono due definizioni nello stesso piano.
  - La conclusione «non richiede interventi nel 2027» contraddice il 41% di abbandoni per mancato uso.
- **Correzione:**
  - Una sola definizione legata al valore. Per esempio, entro 14 giorni: turni della settimana pubblicati, almeno il 60% dei dipendenti entrato nell'app e prime timbrature registrate. Le soglie vanno decise sui dati.
  - Misurarla per coorte e togliere la conclusione.
  - Il piano del primo utilizzo va invece rafforzato: inviti ai dipendenti, guida per il responsabile, contatto del supporto ai locali sotto soglia al giorno 7.

**R8 · P1 · Un rischio non misurato: la dismissione di Kiosk** (`portafoglio.md` r.6 e r.13)
- **Problema:** il 31 dicembre 2026 61 locali (il 14,8% della base) perdono la timbratura su tablet. Non esistono un piano per accompagnarli né un segnale nel punteggio di salute.
- **Correzione:** segnare questi 61 locali come «a rischio» e preparare un piano di passaggio alla timbratura da app (comunicazione, supporto, confronto prima e dopo). Prima di comunicarlo ai clienti serve l'ok dell'utente.

**R9 · P2 · I dati sbagliati si propagano in altri documenti** (passaggio ad altri specialisti)
- **`finanza/business-case.md` r.12:**
  - Ipotizza un abbandono «dell'1% al mese, cioè il 12% l'anno come per Turnio». Contraddice anche il 23,8% del documento. Inoltre l'1% al mese composto fa l'11,4% annuo, non il 12%.
  - Con il dato reale (circa 2,3% al mese) e il margine del 70%, l'LTV è circa 15 × 0,70 / 0,023 ≈ **450 €**, contro i 1.500 € (r.31). L'LTV/CAC scende da 8,3 a circa 2,5.
  - Passaggio: Business & Financial Analyst.
- **`roadmap.md` r.25 e r.28:** l'iniziativa che colpisce la prima causa di abbandono (App dipendenti 2.0) è P3 e in Q3. Lo Scambio dei turni (P0, Q2) ne dipende, e il suo PRD richiede notifiche push (r.31) che poi mette fuori perimetro (r.43). Passaggio: Product Portfolio & Roadmap Manager.

## Domande aperte

1. Che cosa significa «attivi» nel CSV, e quale fonte è giusta fra il bilancio dei clienti e le coorti?
2. Come sono state raccolte 98 risposte al questionario di uscita da 98 clienti persi, compresi quelli persi per mancato pagamento? Una risposta del 100% è poco plausibile: sono risposte dei clienti o motivi annotati dal supporto?
3. Ci sono riduzioni di piano nei 249 clienti rimasti? Servono per calcolare il GRR esatto.
4. C'è l'uso settimanale dei dipendenti per singolo locale, in forma aggregata? Serve per rifare il punteggio di salute.

## Decisioni per l'utente

Sono tutte proposte e nessuna è approvata:
- le definizioni ufficiali di abbandono, NRR/GRR e attivazione;
- la revisione dell'obiettivo O1;
- il nuovo punteggio di salute;
- il piano per i clienti Kiosk;
- un sondaggio ai dipendenti, solo dopo la verifica della Privacy & Compliance.

— KOCHAB (AIBPD-11)
