AIBPD-12 · DENEBOLA — Senior Product Portfolio & Roadmap Manager, reparto AIBPD (AI Business & Product Development)

**Rapporto di revisione: roadmap e portafoglio Turnio (sola lettura)**

Non ho potuto caricare AIBPD-01 ALDERAMIN, perché in questa sessione manca il tool `agent`. Non ho letto le schede della biblioteca (riduzioni di prezzo, recesso, direttiva 2024/825): riguardano consumatori e i clienti di Turnio sono imprese, quindi non c'entrano con questo compito. Ho letto `roadmap/` e, per i confronti, tutti gli altri documenti. Non ho modificato nulla.

**Esito.** La roadmap 2027 non è eseguibile così com'è. Il Q1 chiede 47 settimane di squadra a fronte di 39. Lo scambio dei turni, che è la P0, dipende da un'iniziativa messa in P3 e ha tre date diverse in tre documenti. Due impegni già presi fuori dalla roadmap (la firma con Cassa Facile e il lancio del 1° febbraio) non trovano posto nel piano. Le correzioni sono mie proposte: la decisione spetta all'utente.

I rilievi P0 vanno portati all'utente subito. Alcuni di questi rilievi sono stati prodotti su Sonnet. Per i P0 e i P1 propongo il riesame su Opus, o da parte di ALDERAMIN, prima che diventino definitivi.

## Rilievi

### P0

**1. Il Q1 supera la capacità, e la squadra A più di tutte.** (`roadmap/roadmap.md` righe 13, 19-24)
- Capacità dichiarata: 13 settimane per squadra, 39 in tutto, senza riserva per i bug.
- Carico del Q1: A = 14 + 6 = 20 (limite 13), B = 6 + 8 = 14 (limite 13), C = 9 + 4 = 13. Totale 47 su 39.
- Il resto dell'anno: Q2 = 24 settimane (A 10, B 8, C 6), Q3 = 34 (A 12, B 10, C 12). Il Q2 resta sotto-usato mentre il Q1 scoppia.
- Con una riserva bug del 15-20% la capacità utile scende a circa 31-33 settimane per trimestre.
- Correzione proposta, da decidere con l'utente:
  - riserva esplicita di circa 2 settimane per squadra per trimestre;
  - Paghe Light in Q1 limitata a 13 settimane meno la riserva, oppure spostata;
  - Report del costo del lavoro (6 settimane, A) in Q2, dove A ha 3 settimane libere e B e C hanno spazio;
  - verificare che la squadra B regga le 14 settimane del Q1.

**2. Scambio dei turni: date incompatibili in tre documenti.**
- Il PRD dice «in sviluppo da gennaio 2027 (squadra A)» (`prodotto/prd-scambio-turni.md` riga 4).
- La roadmap lo mette in Q2 (`roadmap/roadmap.md` riga 25).
- `marketing/lancio.md` righe 5-6 fissa il lancio al 1° febbraio 2027, con comunicato, webinar e campagna a pagamento.
- In Q1 la squadra A è già piena con Paghe Light e il Report, quindi non può iniziare lo scambio a gennaio.
- Anche se partisse a gennaio (10 settimane), il rilascio sarebbe a metà marzo, non a febbraio.
- Correzione proposta: scegliere una sola data. Dato che lo scambio è P0 e validato (`innovazione/concetti.md` riga 11), la soluzione coerente è:
  - A fa lo scambio in Q1;
  - Paghe Light slitta (vedi rilievo 6);
  - il lancio si sposta ad aprile, con rilascio a fine marzo.
- Serve una decisione dell'utente. Finché non c'è, la campagna del 1° febbraio non va confermata.

**3. L'accordo con Cassa Facile impegna un'API che la roadmap rilascia dopo.** (`partner/accordi.md` righe 14-17; `roadmap/roadmap.md` riga 29)
- L'accordo promette l'API pubblica «da gennaio 2027». La roadmap la mette in Q3 (squadra B, 10 settimane, P2), cioè in ritardo di circa 6-9 mesi.
- Le condizioni sono pesanti: esclusiva su tutta l'Italia, durata 5 anni più 5 con rinnovo automatico, nessun recesso, nessun obiettivo minimo, compenso del 25% dell'incassato IVA inclusa. Il compenso vale anche per ogni cliente dell'Emilia-Romagna arrivato da qualunque canale.
- È un impegno irreversibile, da firmare a dicembre, con una dipendenza che nessun piano copre. Non va firmato senza conferma dell'utente, che a sua volta deve prima sentire un parere legale umano.
- Correzione proposta: non firmare finché non ci sono una data API realistica, un obiettivo minimo, il recesso e il compenso limitato ai clienti portati dal partner.

### P1

**4. Lo scambio (P0) dipende da un'iniziativa in P3 e posteriore.** (`roadmap.md` righe 25 e 28)
- Lo scambio è in Q2 e dipende da «App dipendenti 2.0», che è in Q3, ha priorità P3 e dura 12 settimane (squadra C). Prima va fatta la dipendenza, poi lo scambio.
- Il PRD si contraddice: R5 (riga 31) richiede la push, ma «Fuori perimetro» (riga 43) dice che la push arriva con l'App 2.0.
- Correzione proposta, due strade:
  - (a) togliere la dipendenza e coprire R5 con le notifiche WhatsApp già pianificate in Q1 (C, 9 settimane, riga 23);
  - (b) portare la parte push dell'App 2.0 in Q1-Q2 e alzarne la priorità.
- Un'iniziativa che sblocca una P0 non può essere P3. In ogni caso la riga 28 va rivista.

**5. L'obiettivo O1 (abbandono) è poco servito, e la sua base è calcolata male.** (`roadmap.md` righe 6, 25, 28; `clienti/fidelizzazione.md` righe 14, 35)
- Il motivo principale di abbandono è «i dipendenti non usano l'app» (41%). La leva diretta è l'App 2.0, che è in P3 e in Q3.
- Sull'O1 lavorano solo 22 settimane su 105 (scambio e App 2.0), cioè circa il 21%.
- Il tasso di abbandono 23,8% è 98 / 412, cioè diviso per i clienti a fine periodo. Sui 330 di inizio periodo è 98/330 = 29,7%, e i 98 persi comprendono anche clienti arrivati durante l'anno. Il divario dall'obiettivo (sotto il 20%) è quindi più grande del previsto.
- Correzione proposta:
  - ricalcolare la base dell'O1 con una definizione unica;
  - alzare l'App 2.0 a P1;
  - dichiarare che l'effetto sull'O1 non si vede prima del quarto trimestre.

**6. Paghe Light è sotto-pianificata e il business case regge male.** (`roadmap.md` riga 19; `finanza/business-case.md` righe 8-37)
- La roadmap prevede solo 14 settimane («prima parte», squadra A). Il business case ne prevede 26 («6 mesi e mezzo», 96.000 €), e la «seconda parte» non c'è in nessun trimestre. In Q2 A ha 3 settimane libere, in Q3 è piena con Gestione più sedi. Con le altre 12 settimane il totale richiesto per il 2027 sale a circa 117 settimane di squadra, contro 117 di capacità lorda e senza riserva.
- Il ricavo usa 18,30 € IVA inclusa (riga 20): 210 × 18,30 × 12 = 46.116 €. Al netto IVA è 210 × 15 × 12 = 37.800 €.
- Il ricavo assume 210 locali per 12 mesi, ma 210 è il numero a fine 2027: l'adozione cresce durante l'anno, e il rilascio è dopo il Q1.
- Quel 210 è il 35% di 600 locali. L'obiettivo O2 è 520, che dà circa 182 locali.
- L'abbandono del modulo è posto uguale a quello di Turnio, 12% annuo (riga 12), che la fidelizzazione contraddice con 23,8%.
- Il LTV usa il ricavo (15 €) invece del margine, e un abbandono dell'1% al mese. Con il margine del 70% e un abbandono vicino al 2% mensile, il LTV/CAC scende da 8,3 a circa 2,9.
- Il recupero del CAC è a 180 / (15 × 70%) = circa 17 mesi, non 8.
- La conclusione «pareggio nel 2028» (riga 37) non regge: il margine annuo di 210 locali è circa 26.500 €, contro una perdita di 93.884 €.
- In più Paghe Light è «senza passare dal consulente» (`concetti.md` riga 16), mentre 20 settimane di roadmap (righe 20, 26) vanno sull'esportazione per il consulente. Le due direzioni vanno armonizzate.
- Paghe Light elabora dati dei dipendenti: serve la Privacy & Compliance Agency, non «nessun rischio rilevante» (`concetti.md` riga 19).
- Correzione proposta: il portafoglio dice «Investire nel 2027» (`portafoglio.md` riga 7) su un business case da rifare. Cambiare la decisione in «Da rivalutare»: rifare il case con ricavi netti IVA, adozione per trimestre, abbandono reale e LTV sul margine, poi riportarlo all'utente.

**7. La proposta delle annualità va contro l'O3 e confonde cassa e ricavi.** (`crescita/prezzi.md` righe 13, 18; `roadmap.md` righe 9, 22)
- L'annuale è «10 mesi per 12», cioè -16,7% sul mensile equivalente.
- Portarlo dal 22% al 60% dei clienti riduce l'ARPU di circa 0,38 × 16,7% = 6,3%. Si somma a un obiettivo di +10% (da 52,5 € a circa 57,75 €), che diventa +17% da recuperare altrove.
- «I ricavi crescono del 20% perché l'incasso arriva subito» confonde cassa e ricavi. Il business case (`business-case.md` riga 27) riconosce il ricavo mese per mese.
- La campagna di gennaio non può appoggiarsi alla «Fatturazione annuale automatica», che arriva a fine Q1 (squadra B, 8 settimane).
- Correzione proposta: spostare questa iniziativa dall'O3 all'O1 (il vantaggio dell'annuale è la tenuta dei clienti), togliere l'affermazione sui ricavi, e allineare la campagna alla data di rilascio.

**8. Accordo con l'associazione contrario all'O3.** (`partner/accordi.md` righe 25-28)
- Offre il 40% di sconto per tutta la durata e paga il 30% del listino ogni mese. Il ricavo diventa il 60% del listino, meno il 30% di compenso, cioè circa il 30%, contro un costo diretto di circa il 22% del listino.
- Il margine sul singolo socio è di pochi punti, e cresce il numero di clienti con un ARPU molto basso, contro l'O3.
- L'O2 è il solo obiettivo che ne trae vantaggio.
- Correzione proposta: sconto limitato nel tempo (per esempio il primo anno) e un compenso che non si somma allo sconto. Decisione dell'utente.

### P2

**9. Doppioni e sovrapposizioni.**
- «Esportazione delle presenze in CSV per il consulente» (Q1, B, 6 settimane, riga 21) e «Integrazione con il consulente del lavoro (esportazione… nel formato dei software paghe)» (Q2, B, 8 settimane, riga 26) sono la stessa funzione in due passaggi. Proposta: un'unica iniziativa da 14 settimane in due tappe, oppure solo la seconda. In più `prezzi.md` riga 8 dice che il piano Pro già include l'«esportazione per il consulente»: chiarire cosa esiste oggi.
- Il Report del costo del lavoro (riga 20) è nel piano Plus (`prezzi.md` riga 9) come se già esistesse. Verificare se è nuovo o se è un miglioramento.
- Le notifiche su WhatsApp (riga 23) e le notifiche push dell'App 2.0 (riga 28) coprono lo stesso bisogno con due canali: decidere quale resta (vedi rilievo 4).

**10. Priorità senza obiettivo o in disaccordo.**
- «Tema scuro dell'app» è P1 senza obiettivo (riga 24): è tecnicamente non collegato a O1, O2 o O3. Proposta: P3 o fuori dal Q1, e restituire 4 settimane alla squadra C.
- Le notifiche WhatsApp sono P2 con obiettivo O2, mentre la push dell'App 2.0 è P3 con obiettivo O1: la logica di priorità non è trasparente.
- Gestione di più sedi è P1 e dipende dall'analisi in P2 (righe 27, 29): la dipendenza fa scendere in fatto la priorità.

**11. Kiosk: la dismissione non ha un piano.** (`portafoglio.md` righe 6, 12-13)
- Non c'è un'iniziativa di migrazione per i 61 locali (549 € di MRR) che dal 31 dicembre 2026 non hanno più la timbratura su tablet.
- La «nuova timbratura» arriva in App 2.0, in Q3: c'è un vuoto di circa nove mesi, che può far salire l'abbandono (O1).
- Il guadagno per la squadra C è di circa due settimane a trimestre. Va sommato alla riserva, non al carico, e il carico del Q1 della squadra C (13 su 13) non lo assorbe.
- Correzione proposta: data di chiusura condizionata alla timbratura sostitutiva, comunicazione ai 61 clienti (una decisione dell'utente) e una voce in roadmap.

**12. Obiettivo O2 non sostenuto dalla previsione commerciale.** (`vendite/previsione.md` righe 22-31; `roadmap.md` riga 7)
- Per arrivare a 520 locali servono circa 108 netti, circa 190 lordi con l'abbandono attuale. Nel 2026 i nuovi sono stati 180 (`fidelizzazione.md` riga 9), quindi il traguardo è teso.
- La quota commerciale del Q1 è 8.000 € di ARR nuovo, circa 13 locali, mentre il ritmo necessario è di circa 47 locali a trimestre.
- La «previsione Q1» di 18.584 € (riga 26) è la somma dei valori non pesati. D-03 e P-07 sono lo stesso cliente, Gruppo Portico, 4 locali Plus, una volta come diretto e una come partner: va conteggiato una volta.
- D-06 ha il 35% di sconto senza l'approvazione del CEO nelle note (regola in riga 8). D-05 ha la data di chiusura passata (30 settembre) e D-04 ha 70% di probabilità in fase Demo (la regola dice 30%).
- Le trattative multi-locale (D-03, D-08, P-07: 17 locali) richiedono probabilmente la Gestione di più sedi, in Q3. Da verificare con le vendite.
- Correzione proposta: ricalcolare il Q1 con probabilità e senza il doppio conteggio, e alzare la quota o ridimensionare l'O2.

**13. Il concetto C ha il punteggio sbagliato nella matrice.** (`innovazione/concetti.md` righe 32-38; `portafoglio.md` riga 8)
- Per C: 5 × 0,4 + 2 × 0,3 + 3 × 0,3 = 3,5, non 4,4. C è l'ultimo (A 4,3, B 3,7), quindi la proposta «dopo A, investire su C» (riga 38) è sbagliata.
- Il portafoglio dice già «da valutare dopo lo scambio dei turni»: coerente col calcolo corretto, ma il documento delle innovazioni va corretto.
- C è inoltre un'attività regolata (assunzione, fatturazione di lavoratori occasionali), con validazione minima («interesse positivo», riga 26): serve la Privacy & Compliance Agency e una valutazione legale prima di qualunque investimento.

### P3

**14. Il budget del lancio si appoggia a dati assenti.** (`marketing/lancio.md` righe 12-18 e `crescita/imbuto.md` righe 29-36)
- Il 70% a LinkedIn non ha alcun dato interno: nella tabella dei canali LinkedIn non compare, mentre Google Ads ha CAC 95 € e 100 clienti.
- Il Q4 2027 è vuoto («da definire», `roadmap.md` riga 31): ammesso, ma va riservato come capacità non allocata (39 settimane meno la riserva).

## Domande aperte per l'utente
1. Quale ha la priorità in Q1 per la squadra A: scambio dei turni (consigliato dal piano di prodotto) o Paghe Light?
2. Il lancio dello scambio resta al 1° febbraio, o va riallineato alla data di rilascio?
3. Si firma l'accordo con Cassa Facile a dicembre, o si rinegozia prima su API, recesso e obiettivi?
4. Qual è la definizione ufficiale di abbandono per l'O1?
5. La dismissione di Kiosk resta al 31 dicembre 2026, con quale alternativa per i 61 clienti?
6. Chi autorizza una riserva bug fissa, e di quanto?

## Passaggi di consegne consigliati
- Business & Financial Analyst: rifare il business case di Paghe Light e l'effetto dell'annuale sull'ARPU.
- Privacy & Compliance Agency: Paghe Light e Personale extra, con dati dei dipendenti e rapporto di lavoro.
- Software Agency, solo dopo la conferma dell'utente: stima della squadra A in Q1 e dipendenza push/WhatsApp.

Il mio lavoro non è concluso finché mancano le decisioni sopra: nulla qui è approvato.

— AIBPD-12 · DENEBOLA
