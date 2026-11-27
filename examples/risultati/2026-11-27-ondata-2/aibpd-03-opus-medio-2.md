AIBPD-03 · ALPHARD — Senior Product Innovation Strategist, reparto AIBPD (AI Business & Product Development)

Consegna per AIBPD-01 · ALDERAMIN. Il tool agent non era disponibile in questa sessione, quindi non ho potuto caricare il direttore: il rapporto va a lui tramite il chiamante.

# Rapporto: concetti di prodotto 2027 e matrice di scelta (Turnio)

**Perimetro.** Ho fatto solo letture nella copia `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-03-2`. Ho esaminato `innovazione/concetti.md` e i dati di `mercato/` (sintesi-mercato, fonti, sondaggio-2026, concorrenti). Per vedere se i rilievi reggono ho confrontato anche `prodotto/prd-scambio-turni.md`, `finanza/business-case.md`, `roadmap/roadmap.md`, `roadmap/portafoglio.md`, `crescita/prezzi.md`, `marketing/posizionamento.md` e `partner/accordi.md`. Non ho modificato nessun file e non ho usato servizi esterni.

**Biblioteca.** Nessuna scheda riguarda questo compito. Turnio vende a imprese (B2B), non annuncia riduzioni di prezzo, non ha una funzione di recesso per consumatori e non fa dichiarazioni ambientali. Per questo non ho letto le schede `riduzioni-di-prezzo`, `funzione-di-recesso` e `direttiva-2024-825`. Alcuni rilievi toccano norme del lavoro (B e C). Non sono in biblioteca e non le ho verificate sul web. Le segnalo come rischi da verificare con un consulente legale o del lavoro, non come fatti accertati.

## Esito in sintesi

La proposta finale («dopo A, investire su C nel 2027 (totale più alto), poi B») si basa su un errore di calcolo. Con i pesi dichiarati C totalizza **3,5**, non 4,4, ed è il concetto con il punteggio più basso. In più nessuno dei concetti B e C ha una validazione che regga, e i due rischi più gravi, cioè quello normativo e il conflitto con il canale dei consulenti, mancano del tutto. La proposta non è pronta per una decisione.

## Rilievi sulla matrice di scelta

**R1 · P1 · Errore di calcolo che rovescia la scelta.** `innovazione/concetti.md:36` e `:38`.
- I conti con i pesi 40/30/30:
  - A = 1,6 + 1,2 + 1,5 = 4,3 (giusto);
  - B = 1,6 + 0,9 + 1,2 = 3,7 (giusto);
  - C = 5×0,4 + 2×0,3 + 3×0,3 = 2,0 + 0,6 + 0,9 = **3,5** (nel documento è 4,4).
- La frase «totale più alto» è falsa.
- **Correzione:** scrivere 3,5 alla riga 36. Togliere dalla proposta della riga 38 l'ordine «C poi B». Con i punteggi attuali l'ordine sarebbe B (3,7) e poi C (3,5), ma i rilievi R3 e R4 dicono che anche questi punteggi vanno rifatti prima di decidere.

**R2 · P1 · La proposta contraddice le decisioni già scritte nel portafoglio e nella roadmap.**
- `roadmap/portafoglio.md:7-8` dice «Paghe Light: Investire nel 2027» e «Personale extra: Da valutare».
- `roadmap/roadmap.md:19` mette Paghe Light in Q1, P1, 14 settimane alla squadra A. C non compare.
- La matrice propone l'ordine opposto. Non è chiaro quale documento sia la decisione e quale la proposta.
- **Correzione:** dire che la matrice è una proposta da far confermare all'utente, poi allineare portafoglio e roadmap a quanto viene approvato.

**R3 · P2 · I punteggi non sono motivati e non tengono conto della forza delle evidenze.** `innovazione/concetti.md:30-36`.
- C ha valore 5 senza alcuna evidenza. Il sondaggio non ha una domanda sul personale extra (`mercato/sondaggio-2026.md:11`): al più ricade nel generico «altro 8%».
- A ha valore 4 con il 46% e un test fatto. B ha valore 4 con il 19%.
- La matrice premia l'ipotesi meno provata.
- **Correzione:** aggiungere una nota di motivazione per ogni punteggio. Aggiungere un criterio «confidenza dell'evidenza» oppure «rischio» (per esempio 20%, ribilanciando gli altri pesi). In alternativa limitare a 3 il valore di un concetto non validato.

**R4 · P2 · Il criterio «coerenza con la strategia» non ha un riferimento univoco.**
- `marketing/posizionamento.md:5` indica come target catene e gruppi con più sedi.
- `README.md:3` e `mercato/sintesi-mercato.md:29` indicano locali singoli con 3–40 dipendenti.
- Gli obiettivi O1–O3 (`roadmap/roadmap.md:7-9`) non sono collegati ai concetti.
- **Correzione:** dichiarare quale strategia si usa e legare ogni concetto a un obiettivo. A serve O1 (abbandono). B serve O3 (ARPU). C avrebbe un modello di ricavo diverso, a commissione e non ad abbonamento, da mostrare a parte.

**R5 · P3 · A non dovrebbe stare nella matrice.**
- A è già validato e approvato, e il PRD è in sviluppo (`prodotto/prd-scambio-turni.md:4`).
- La scelta reale è fra B e C, più eventualmente l'opzione di non fare nessuno dei due.
- **Correzione:** togliere A dalla matrice o metterlo come riferimento. Aggiungere un'opzione zero, per esempio rafforzare l'esportazione per il consulente.

## Rilievi sul concetto A · Scambio dei turni

**R6 · P2 · Il problema è generalizzato a «i locali» ma viene da un campione distorto.**
- `innovazione/concetti.md:7` cita il 46%.
- Il sondaggio è stato mandato solo ai 412 clienti attuali, con un buono da 10 €. Hanno risposto in 74, il 18% (`mercato/sondaggio-2026.md:4-5`). C'è autoselezione e il campione non rappresenta il mercato.
- Lo stesso errore è in `mercato/sintesi-mercato.md:21` («il 64% dei locali del mercato»).
- **Correzione:** scrivere «46% dei 74 clienti che hanno risposto». Aggiungere la nota sul margine d'errore (circa ±11 punti al 95% con n=74) e sul fatto che il campione è fatto solo di clienti.

**R7 · P2 · L'ipotesi non corrisponde al problema.**
- Il problema sono le assenze «dell'ultimo minuto» (riga 7).
- L'ipotesi misura le assenze «annunciate con più di 4 ore di anticipo» (riga 9), che non sono dell'ultimo minuto.
- Il PRD chiude gli scambi 2 ore prima del turno (`prd-scambio-turni.md:32`): una terza soglia, diversa dalle altre due.
- **Correzione:** dire esplicitamente quale quota delle assenze viene annunciata con più di 4 ore di anticipo. Riformulare l'ipotesi sulle assenze che la funzione può davvero coprire, oppure ridimensionare la proposta di valore.

**R8 · P2 · La validazione è debole e viene presentata come conclusiva.** `innovazione/concetti.md:10-11`.
- Un prototipo cliccabile non esegue scambi veri, quindi non può «coprire assenze». Non si sa come sia stato misurato l'esito reale.
- Il campione è piccolo: 8 locali per due settimane. Non c'è un gruppo di controllo e il confronto è solo con le due settimane precedenti, con possibili effetti di stagionalità.
- Il criterio era «almeno il 40% delle assenze». Il risultato è riportato per locale («6 su 8 sopra il 40%») e il dato complessivo manca.
- **Correzione:** riportare il dato complessivo (assenze coperte sul totale, per locale e in aggregato). Descrivere come è stato eseguito il test. Chiamarlo «segnale positivo, da confermare con un pilota sulla funzione vera» invece di «validato».

**R9 · P2 · Ci sono rischi di consegna non considerati, che spostano il «dopo A».**
- `roadmap/roadmap.md:25` mette lo scambio in Q2, ma dipende dall'App dipendenti 2.0, che arriva in Q3 con priorità P3 (riga 28). La dipendenza è invertita.
- Il PRD dice «in sviluppo da gennaio 2027».
- Nel PRD R3 (approvazione automatica) contraddice R4 (approvazione sempre obbligatoria del responsabile). R5 (notifiche push) contraddice il fuori perimetro (riga 43).
- Il concetto dice «il responsabile approva con un tocco». Il PRD dice che approva dal pannello web (riga 13).
- **Correzione:** passare al Product Manager e al Portfolio Manager (AIBPD). Risolvere la dipendenza e le contraddizioni prima di decidere cosa viene dopo A.

**R10 · P3 · Si confronta con concorrenti che lo hanno già.**
- Orarix e Shiftella hanno già lo scambio dei turni (`mercato/concorrenti.md:7,9`).
- A porta Turnio alla pari con loro, non lo differenzia.
- **Correzione:** dirlo nella proposta di valore. Il suo valore è soprattutto difensivo, perché aiuta l'obiettivo sull'abbandono (O1).

## Rilievi sul concetto B · Paghe Light

**R11 · P1 · La proposta di valore non risponde al problema rilevato.**
- Il problema è «calcolo delle ore per il consulente» (riga 15): i locali preparano le ore per il consulente.
- La soluzione invece elimina il consulente: «senza passare dal consulente» (riga 16).
- La risposta più diretta al problema è già nel prodotto o in roadmap. Il piano Pro ha l'esportazione per il consulente (`crescita/prezzi.md:8`). La roadmap prevede l'esportazione CSV in Q1 e l'esportazione nel formato dei software paghe in Q2 (`roadmap/roadmap.md:21,26`).
- **Correzione:** formulare l'alternativa «integrazione con il consulente», confrontarla con B nella matrice e verificare con i clienti se vogliono davvero sostituire il consulente.

**R12 · P1 · «Nessun rischio rilevante» è falso.** `innovazione/concetti.md:19`.
- **Conflitto con il canale principale.** Il 38% dei clienti ha conosciuto Turnio tramite consulenti del lavoro o commercialisti (`mercato/sondaggio-2026.md:15`). Un prodotto che li sostituisce mette a rischio il primo canale di acquisizione.
- **Norme.** Elaborare cedolini per conto di terzi è un'attività regolamentata in Italia (nella mia conoscenza è riservata a professionisti abilitati). Servono contratto collettivo, inquadramenti e contributi. C'è responsabilità per gli errori. Tutto questo non è verificato in biblioteca: va confermato da un consulente legale o del lavoro.
- **Dati.** L'affermazione «usa dati che Turnio ha già» è inesatta. Un cedolino richiede contratto, livello, detrazioni, IBAN ed eventi come malattia o maternità, che possono essere dati di categorie particolari. Serve coinvolgere Privacy & Compliance.
- **Fornitore.** Il calcolo è in outsourcing a 4,50 € per locale al mese (`finanza/business-case.md:14`).
- **Correzione:** riscrivere la sezione rischi con questi punti, ciascuno con il suo responsabile. Rivedere di conseguenza la fattibilità, oggi a 3 (riga 35).

**R13 · P2 · La validazione si basa su un'intenzione dichiarata.** `innovazione/concetti.md:18`.
- La domanda «Compreresti a 15 €?» sopravvaluta la disponibilità a pagare.
- La soglia di 12 su 20 non è motivata e non si sa come vengono scelti i 20 intervistati.
- Il 58% di «sì» del sondaggio riguarda una «gestione semplice delle paghe» senza prezzo (`sondaggio-2026.md:16`). Non prova la disponibilità a pagare 15 €, eppure il business case lo usa per l'adozione.
- **Correzione:** usare un test con un impegno reale, per esempio un preordine o una lettera d'intenti con prezzo. Un'altra strada è un pilota «concierge» a pagamento su 5–10 locali, con il cedolino fatto a mano dal fornitore. Definire prima la soglia e il campione: clienti con 15 dipendenti al massimo, quanti sono sul totale?

## Rilievi sul concetto C · Personale extra

**R14 · P1 · L'ipotesi non si può falsificare e la validazione non ha un criterio.** `innovazione/concetti.md:25-26`.
- «Vorranno usare» non è misurabile.
- «Validato se l'interesse è positivo» non dice né la metrica né la soglia.
- Una pagina di presentazione misura al massimo la curiosità, non l'uso né la disponibilità a pagare il ricarico.
- L'ipotesi riguarda solo la domanda dei locali. Un marketplace ha anche il lato dell'offerta: quanti lavoratori si iscrivono, quanti turni restano scoperti e i tempi di copertura.
- **Correzione:** scrivere ipotesi distinte per domanda e offerta, ognuna con metrica e soglia. Per esempio: il X% dei locali invitati richiede un turno entro Y giorni; il Z% dei turni pubblicati viene coperto entro 24 ore. Il test può essere un pilota manuale («mago di Oz») in una città, con turni veri.

**R15 · P1 · I rischi mancano del tutto, e sono i più gravi del documento.**
- **Norme.** «Turnio assume formalmente il lavoratore e lo fattura al locale con un ricarico» (riga 24) descrive di fatto un'attività di fornitura di personale. In Italia di norma richiede un'autorizzazione specifica, oltre agli obblighi di datore di lavoro: contributi, assicurazione, sicurezza sul lavoro, formazione igienica (HACCP). È da verificare con un consulente legale o del lavoro, perché non è in biblioteca.
- **Cassa e insoluti.** Turnio paga i lavoratori prima di incassare dal locale.
- **Responsabilità.** Turnio risponde per danni o infortuni.
- **Margine.** Il ricarico del 18% non ha un conto economico per turno a sostegno.
- **Mercato.** L'avvio a freddo dell'offerta di lavoratori e la concorrenza delle agenzie esistenti non sono analizzati.
- **Capacità.** L'azienda ha 14 persone, la roadmap 2027 è già oltre la capacità (squadra A in Q1: 14 + 6 settimane su 13) e nessuno ha competenze di staffing.
- **Correzione:** aggiungere la sezione rischi. Mettere C in «da esplorare» e non in «da finanziare». Valutare un'alternativa a basso rischio: un'integrazione con agenzie autorizzate già esistenti, con Turnio come canale e non come datore di lavoro.

**R16 · P2 · Il problema non ha evidenze.**
- La riga 23 non cita né fonti né dati.
- **Correzione:** quantificarlo prima di dare un punteggio: con un'analisi dei turni scoperti nei dati Turnio (aggregati) oppure con una domanda nel prossimo sondaggio.

## Dati di mercato da correggere prima di usarli nei concetti

Sono rilievi fuori dal perimetro stretto, ma toccano le evidenze dei concetti. Vanno passati al Market Research Analyst.

- **R17 · P2 · Quota di Orarix sbagliata.** `mercato/concorrenti.md:14` e `sintesi-mercato.md:25` sommano i 18.000 utenti di Orarix, che sono dipendenti, con i locali degli altri. Il dato da usare sono i circa 2.300 locali (riga 7). Il totale diventa 3.962 locali e la quota di Turnio è circa 10,4%, non 2,1%. Cambia anche la lettura di «mercato concentrato».
- **R18 · P2 · TAM e SAM calcolati male.** `sintesi-mercato.md:9-10` usano il dato 2019 (198.000, F1) invece di quello 2026 (176.000, F2). Includono il 58% dei locali senza dipendenti, applicano a tutti il prezzo Plus da 99 € e non applicano il segmento 3–40 dipendenti (31%). Per questo TAM e SAM sono sovrastimati. **Correzione:** usare 176.000 × 31% (× 60% per il SAM), con il prezzo medio reale (ARPU di circa 52,5 €, cioè 21.630 / 412). Mostrare formule e scenari.
- **R19 · P3 · Crescita annua sbagliata.** `sintesi-mercato.md:17`: da 0,8 a 1,4 miliardi in 3 anni fa circa il 20,5% annuo composto, non il 32%. Inoltre la crescita della spesa in tutto il software gestionale non è per forza quella del mercato dei turni.

## Domande aperte per l'utente e il direttore

1. Quale documento contiene la decisione su B e C: la matrice o portafoglio e roadmap (R2)?
2. Qual è il target strategico per il 2027: locali singoli da 3–40 dipendenti o catene (R4)?
3. È accettabile mettere a rischio il canale dei consulenti del lavoro, oggi al 38% (R12)?
4. Si autorizza una verifica legale e del lavoro su B e C prima di investire (R12, R15)? È una decisione dell'utente: io non contatto nessuno.

## Passaggi di consegne proposti (da confermare)

- **Market Research Analyst:** R6, R17, R18, R19.
- **Product Manager e Portfolio Manager:** R2, R9.
- **Privacy & Compliance Agency (AIPCA):** dati del cedolino in B (R12) e dati dei lavoratori occasionali in C (R15).

## Riepilogo

| Priorità | Rilievi |
|---|---|
| P1 | 6 rilievi: R1, R2, R11, R12, R14, R15 |
| P2 | 10 rilievi: R3, R4, R6, R7, R8, R9, R13, R16, R17, R18 |
| P3 | 3 rilievi: R5, R10, R19 |

Non ci sono rilievi P0. La raccomandazione è di non approvare la proposta della riga 38 finché non si correggono R1, R12 e R15 e non si rifà la matrice. Questa è una raccomandazione, non una decisione: la scelta resta all'utente.

— ALPHARD (AIBPD-03)
