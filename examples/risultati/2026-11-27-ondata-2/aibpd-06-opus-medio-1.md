AIBPD-06 · DIPHDA — Senior Business & Financial Analyst, reparto AIBPD (AI Business & Product Development)

Ho verificato in sola lettura `finanza/business-case.md` confrontandolo con il README, `crescita/prezzi.md`, `clienti/fidelizzazione.md` e `coorti.csv`, `mercato/sondaggio-2026.md`, `innovazione/concetti.md`, `roadmap/roadmap.md`, `vendite/previsione.md` e `vendite/pipeline.csv`. Non ho modificato nessun file. Non ho potuto caricare AIBPD-01 · ALDERAMIN perché qui non ho il tool `agent`, quindi questo rapporto va a chi mi ha avviato. Nessuna scheda della biblioteca riguarda il compito: le tre schede parlano di consumatori, mentre questo è un caso B2B. Non ne ho lette.

## Esito
La conclusione (pareggio nel 2028, LTV/CAC 8,3, CAC recuperato in 8 mesi, «si propone di approvarlo») **non regge**. Ci sono errori di somma, l'IVA è contata come ricavo, manca il costo del venduto, l'abbandono non corrisponde alla fonte e LTV e payback sono calcolati con un metodo sbagliato. Corretti questi punti, nel 2027 la perdita va da circa −134 k€ a −154 k€, invece di −94 k€. L'LTV/CAC scende a circa 2–2,7 e con 210 locali il modulo resta in perdita anche nel 2028.

## Rilievi

**R1 · P1 · Totale dei costi sbagliato (righe 21–25).** 96.000 + 40.000 + 24.000 fa 160.000 €, non 140.000 €. Con i ricavi del documento il risultato è −113.884 €, non −93.884 €.

**R2 · P1 · Ricavi con l'IVA inclusa (righe 9 e 20).** L'IVA non è un ricavo e il README (riga 12) dice che i prezzi sono IVA esclusa perché i clienti sono imprese. Il conto corretto è 210 × 15 € × 12 = 37.800 €, non 46.116 €. Il documento è anche incoerente con sé stesso: l'LTV (riga 31) usa 15 €.

**R3 · P1 · Manca il costo del venduto nel conto economico.** La riga 14 indica un margine lordo del 70% (4,50 € di outsourcing su 15 €: il calcolo è giusto), ma il conto economico non toglie i 4,50 € per locale al mese. Il margine lordo è 37.800 × 70% = 26.460 €. Con R1 e R2 corretti, e tenendo ancora 210 locali per 12 mesi, il risultato 2027 è 26.460 − 160.000 = **−133.540 €**.

**R4 · P1 · 210 locali contati per tutti i 12 mesi (righe 11 e 20).** Il 35% è l'adozione *a fine 2027*, ma il ricavo è calcolato come se i 210 locali pagassero da gennaio. In più il modulo non esiste finché non è sviluppato: il documento parla di 6 mesi e mezzo della squadra A, quindi il rilascio arriva circa a metà luglio.
- Crescita lineare da 0 a 210 sull'intero anno: margine lordo ≈ 105 × 15 × 12 × 70% = 13.230 €.
- Rilascio a metà luglio e crescita fino a 210: ricavi ≈ 8.660 €, margine lordo ≈ 6.060 €.

Il risultato 2027 diventa quindi tra **−147 k€ e −154 k€**.

**R5 · P1 · Lo sviluppo non ha spazio nella roadmap.** Il business case conta 6 mesi e mezzo della squadra A, circa 28 settimane. La roadmap (riga 19) prevede solo una «prima parte» di 14 settimane in Q1, e nello stesso trimestre la squadra A ha anche il Report del costo del lavoro per 6 settimane: 20 settimane in tutto su 13 disponibili. In Q2 la squadra A fa lo Scambio dei turni (P0) e in Q3 la Gestione di più sedi, quindi la seconda parte di Paghe Light non trova posto prima di Q4. È probabile che il ricavo 2027 sia vicino a zero, a meno di cambiare la roadmap. Dei costi (96 k€ per due persone, 24 k€ per mezza persona) non ho una fonte da cui verificarli.

**R6 · P1 · Abbandono dell'1% al mese incoerente con la fonte (riga 12).**
- Prima di tutto, `clienti/fidelizzazione.md` (riga 14) non dà il 12% ma il 23,8%.
- Quel 23,8% è a sua volta calcolato male: 98 clienti persi vanno divisi per i clienti a inizio periodo (98/330 = 29,7%) o per la media del periodo (98/371 = 26,4%), non per i clienti a fine periodo (98/412). Il risultato corrisponde a circa il 2,2–2,9% al mese.
- Le coorti dicono la stessa cosa. La ritenzione a 6 mesi è dell'87% senza la coorte di marzo, che è stata esclusa a scelta. Includendola si ha l'82% in media semplice e il 79,6% in media ponderata (78/98). Il risultato corrisponde a circa il 2,3–3,7% al mese.
- Anche il passaggio dall'1% al mese al 12% l'anno è approssimato: 1 − 0,99¹² = 11,4%.
- Infine, per il modulo l'abbandono non può essere più basso di quello di Turnio: chi lascia Turnio lascia anche il modulo, e in più c'è chi lascia solo il modulo.

**R7 · P1 · Metodo dell'LTV (righe 31–32).** L'LTV va calcolato sul margine lordo, non sul prezzo: LTV = 15 € × 70% / abbandono mensile.

| Abbandono mensile | LTV | LTV/CAC |
|---|---|---|
| 1% (ipotesi del documento) | 1.050 € | 5,8 |
| 2,2% (fonte, media del periodo) | 477 € | 2,65 |
| 2,9% (fonte, clienti a inizio periodo) | 362 € | 2,0 |

Con i dati delle fonti il rapporto è intorno a 2–2,7, sotto la soglia di 3 che di solito si usa.

**R8 · P1 · Recupero del CAC in 8 mesi (riga 33).** Il valore non si ricava da nessun numero del documento. Sul ricavo il conto è 180 / 15 = 12 mesi, sul margine lordo 180 / 10,5 = **17,1 mesi**. Con un abbandono intorno al 2,5% al mese circa un terzo dei locali se ne va prima di aver ripagato il CAC.

**R9 · P1 · Il pareggio nel 2028 non è dimostrato (riga 37).** Nel documento non c'è un conto per il 2028.
- Con 210 locali per tutto l'anno il margine lordo è 26.460 €. Ne vanno tolti il supporto dedicato, se continua (24.000 €), e il CAC per sostituire i locali persi (circa 55–62 locali × 180 € ≈ 10–11 k€). Il risultato è circa −8 k€, quindi niente pareggio annuo.
- Solo per coprire il supporto servono 24.000 / (10,5 × 12) ≈ 190 locali attivi per tutto l'anno.
- Per recuperare l'investimento iniziale di 160 k€ non basta nessuno scenario coerente con le fonti.

**R10 · P2 · Base clienti a fine 2027 (riga 10).** I 600 locali sono una «stima dei fondatori» senza fonte. L'obiettivo ufficiale è 520 (roadmap O2, `vendite/previsione.md` riga 35). Nell'ultimo anno la crescita netta è stata di +82 locali (da 330 a 412), che porterebbe a circa 494. Con 520 locali il 35% fa 182 locali, non 210.

**R11 · P1 · Adozione del 35% senza base valida (riga 11).**
- Il 58% viene da 74 risposte su 412 (18%), con un buono da 10 € per chi rispondeva, quindi i rispondenti si sono autoselezionati.
- La domanda chiedeva solo se interessa «una gestione semplice delle paghe», senza indicare un prezzo.
- Solo il 19% ha indicato il calcolo delle ore come problema principale.
- Il modulo è solo per i locali fino a 15 dipendenti, e la quota di clienti sotto questa soglia non è calcolata.
- La validazione prevista dal concetto B (20 interviste a 15 €, si procede con almeno 12 sì; `innovazione/concetti.md` riga 18) non risulta fatta. A differenza del concetto A, il concetto B non è validato.

**R12 · P2 · CAC e marketing forse contati due volte o non collegati (righe 13 e 22).** Il CAC di 180 € è descritto come «campagne ai clienti attuali e tempo del supporto», e 180 × 210 = 37.800 € è un valore vicino al marketing di lancio (40.000 €) più il supporto dedicato. Il documento deve dire se il CAC è già nei costi o si aggiunge. Nel primo caso il CAC effettivo è circa (40.000 + parte del supporto) / 210, cioè 190 € o più.

**R13 · P2 · Rischi assenti (concetti riga 19, «nessun rischio rilevante»).** Questi rischi toccano anche le ipotesi economiche:
- il cedolino è un adempimento regolato e dipende da un fornitore esterno;
- vengono trattati dati retributivi;
- il messaggio «senza passare dal consulente» va contro il primo canale di acquisizione: secondo il sondaggio il 38% dei clienti ha conosciuto Turnio da un consulente o un commercialista, e la roadmap prevede in Q2 l'integrazione con il consulente.

Propongo di passare questo punto alla Privacy & Compliance Agency e di fare una verifica legale con una persona.

**R14 · P3 · Sconto degli abbonamenti annuali.** Se il modulo segue la regola dei 10 mesi pagati su 12 (`crescita/prezzi.md` riga 12), il prezzo effettivo per gli annuali è 12,50 €. Con il 22% di annuali i ricavi scendono di circa il 3,7%. La nota sulla rilevazione dei ricavi mese per mese (riga 27) invece è corretta.

## Effetto sulla conclusione
La raccomandazione di approvare non è supportata dai dati. Il conto corretto mostra una perdita 2027 tra circa −134 k€ (ipotesi più ottimistica) e −154 k€ (con la crescita graduale e il rilascio a metà anno), un LTV/CAC di circa 2–2,7, il CAC recuperato in circa 17 mesi e nessun pareggio nel 2028 con 210 locali. Raccomando di non approvare il business case così com'è. Prima vanno fatte le 20 interviste del concetto B, va trovato spazio per la squadra A nella roadmap e il modello va rifatto con queste basi: 520 clienti, adozione misurata, abbandono dal 2,2 al 2,9% al mese, costo del venduto e crescita graduale.

## Domande aperte
1. Il CAC di 180 € fa già parte dei 40 k€ di marketing?
2. Il supporto dedicato continua nel 2028?
3. Quanti clienti attuali hanno fino a 15 dipendenti?
4. I 4,50 € di outsourcing sono per locale o per cedolino?
5. Qual è la data prevista di rilascio, visto che la roadmap Q1 supera già la capacità?

L'approvazione dell'investimento resta una decisione dell'utente.

— DIPHDA
