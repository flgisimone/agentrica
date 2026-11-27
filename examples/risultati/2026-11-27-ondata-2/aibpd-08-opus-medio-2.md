AIBPD-08 · MIRACH — Senior Product Marketing Manager, reparto AIBPD (AI Business & Product Development)

**Note di metodo.** Ho rivisto in sola lettura `marketing/posizionamento.md` e `marketing/lancio.md` e li ho confrontati con `crescita/prezzi.md`, `crescita/imbuto.md`, `mercato/concorrenti.md`, `mercato/sondaggio-2026.md`, `mercato/sintesi-mercato.md`, `roadmap/roadmap.md`, `prodotto/prd-scambio-turni.md`, `innovazione/concetti.md`, `clienti/fidelizzazione.md` e `vendite/pipeline.csv`. Non ho modificato nessun file. Non ho caricato AIBPD-01 · ALDERAMIN perché in questa sessione non ho il tool `agent`: consegno il rapporto direttamente.

Ho letto due schede della biblioteca:
- `riduzioni-di-prezzo` (Codice del consumo, art. 17-bis, verificata il 2026-11-19);
- `direttiva-2024-825` (Commissione europea, verificata il 2026-11-19).

Nessuna delle due si applica a questi documenti. I clienti sono imprese, non consumatori, e non ci sono annunci di sconto con prezzo barrato né messaggi ambientali. Il problema della pubblicità comparativa (M5) non ha una scheda in biblioteca e non l'ho verificato sulla fonte. Il riferimento che mi viene in mente è il D.lgs. 145/2007 per la pubblicità ingannevole e comparativa fra imprese, ma viene dalle mie conoscenze e può essere superato: va verificato e passato alla revisione legale umana.

**Esito.** Il posizionamento e il piano di lancio non sono pubblicabili così come sono.
- Tre messaggi sono falsi rispetto ai dati: M1, M3 e M5.
- M2 ha una prova insufficiente.
- Il pubblico scelto (gruppi con più locali) non lo serve il prodotto.
- Il lancio è fissato prima che la funzione esista.
- Il budget dei canali va contro i dati di acquisizione.

## Rilievi

**R1 · P1 · M5 e frase di posizionamento: affermazione falsa su un concorrente indicato per nome**
- Punto: `marketing/posizionamento.md` riga 9 («A differenza di Orarix, Turnio ha un'app pensata per i dipendenti») e riga 19 (M5 «Orarix non ha l'app per i dipendenti», nella tabella di confronto sul sito e su LinkedIn).
- Evidenza: `mercato/concorrenti.md` riga 7. Orarix ha l'app per i dipendenti dal 2025 e ha già lo scambio dei turni, che per Turnio è ancora «In sviluppo» (riga 10).
- Rischio: una pubblicità comparativa falsa espone a un'azione del concorrente.
- Correzione: togliere M5 e la frase «A differenza di Orarix». La differenziazione va rifatta (vedi R7). Prima di qualunque confronto nominativo serve la revisione legale.
- Se la tabella è già online, il rilievo diventa P0: va tolta subito.

**R2 · P1 · M1 «Il gestionale dei turni più usato dai ristoranti italiani» è falso**
- Punto: `marketing/posizionamento.md` riga 15 (home e pubblicità).
- Evidenza: `mercato/concorrenti.md` righe 7–10. Orarix ha circa 2.300 locali e Planora 900, Turnio 412: Turnio è terzo per locali, davanti solo a Shiftella (350).
- Errore a monte: `mercato/sintesi-mercato.md` righe 25 e 14 dice che Turnio è «secondo» e calcola le quote sommando i 18.000 utenti di Orarix con i locali degli altri. Va corretto anche lì, altrimenti l'errore torna nei messaggi.
- Correzione: togliere il superlativo. Un'alternativa verificabile: «Usato da oltre 400 locali in Italia», cioè i 412 clienti paganti al 31 ottobre 2026.
- Se M1 è già online, il rilievo diventa P0.

**R3 · P1 · M3 «Gratis per sempre fino a 3 dipendenti»: questo piano non esiste**
- Punto: `marketing/posizionamento.md` riga 17 (pagina dei prezzi e Instagram).
- Evidenza: `crescita/prezzi.md` righe 7–13. Il piano più economico è Base a 29 €. C'è solo una prova di 30 giorni, poi l'account si sospende.
- Correzione: togliere M3. Un piano gratuito è una decisione di pricing che spetta all'utente; nessun messaggio prima dell'approvazione.
- Se M3 è già online, il rilievo diventa P0.

**R4 · P1 · M2 «Risparmia 5 ore a settimana»: la prova non regge**
- Punto: `marketing/posizionamento.md` riga 16 e prova a riga 24 (intervista a Trattoria Il Ponte).
- Evidenza 1: in `vendite/pipeline.csv` riga 2 Trattoria Il Ponte risulta firmata il 2026-11-12, cioè 8 giorni fa. Non può aver misurato un risparmio.
- Evidenza 2: una sola intervista non rappresenta i clienti.
- Evidenza 3: il sondaggio (`mercato/sondaggio-2026.md` righe 12–13) dà una mediana di 4 ore prima e 1 ora dopo, quindi 3 ore di risparmio. Il dato è dichiarato e fragile: 74 risposte su 412 clienti, nessun ex cliente, risposta premiata con un buono.
- Correzione proposta: «In media 3 ore in meno a settimana per preparare i turni*», con la nota «*mediana dichiarata da 74 clienti, sondaggio di ottobre 2026». Per citare un cliente per nome serve il suo consenso scritto.

**R5 · P1 · Pubblico «catene e gruppi con più locali»: il prodotto non lo serve**
- Punto: `marketing/posizionamento.md` righe 5 e 9; motivazione del budget in `marketing/lancio.md` riga 18.
- Evidenza sul prodotto:
  - la Gestione di più sedi arriva solo in Q3 2027 (`roadmap/roadmap.md` riga 30);
  - gli scambi fra locali dello stesso gruppo sono fuori perimetro (`prodotto/prd-scambio-turni.md` riga 45);
  - il prezzo è per locale (`crescita/prezzi.md` riga 3).
- Evidenza sul mercato e sulla pipeline:
  - il segmento dichiarato è il singolo locale da 3 a 40 dipendenti (`README.md` riga 3, `mercato/sintesi-mercato.md` riga 29);
  - in `vendite/pipeline.csv` 11 opportunità su 14 hanno un solo locale;
  - gli unici gruppi sono Gruppo Portico, contato due volte (D-03 e P-07), e Pizza&Co.
- Correzione proposta: pubblico primario i locali indipendenti da 3 a 40 dipendenti al Nord e al Centro. Il problema da cui partire è quello più citato, le assenze dell'ultimo minuto (46%, `mercato/sondaggio-2026.md` riga 11); il tempo per fare i turni viene dopo (27%). I gruppi diventano un segmento da riprendere dopo il rilascio della Gestione di più sedi.

**R6 · P1 · Data del lancio incompatibile con la roadmap**
- Punto: `marketing/lancio.md` riga 6 («dal 1° febbraio 2027», con campagna a pagamento).
- Evidenza sulle date:
  - lo Scambio dei turni è in Q2 (`roadmap/roadmap.md` riga 25);
  - dipende dall'App dipendenti 2.0, prevista in Q3 con priorità P3 (riga 28);
  - il PRD lo dà in sviluppo da gennaio (`prodotto/prd-scambio-turni.md` riga 4);
  - in Q1 la squadra A ha già 20 settimane di lavoro su 13 disponibili (righe 19–20).
- Evidenza sul perimetro: R5 del PRD richiede le notifiche push, che però sono fuori perimetro (righe 31 e 43).
- Correzione: legare la data della campagna al rilascio effettivo, con una soglia da rispettare (funzione disponibile in Pro e Plus, criteri del PRD superati). Prima di fissare una data, l'incoerenza fra roadmap e PRD va passata al Product Manager e al Portfolio Manager.

**R7 · P1 · Il messaggio del lancio promette più di quanto fa il prodotto**
- Punto: `marketing/lancio.md` riga 8 («Le assenze dell'ultimo minuto si coprono da sole»).
- Evidenza 1: il responsabile deve sempre approvare (R4, `prodotto/prd-scambio-turni.md` riga 30). R3 alla riga 29 dice invece che l'approvazione è automatica: il PRD si contraddice.
- Evidenza 2: lo scambio si chiude 2 ore prima dell'inizio del turno (R6), quindi le vere assenze dell'ultimo minuto non si coprono.
- Evidenza 3: la validazione riguarda le assenze annunciate con più di 4 ore di anticipo, con circa il 40% coperto e 6 locali su 8 sopra la soglia (`innovazione/concetti.md` righe 9–11).
- Evidenza 4: lo scambio vale solo fra colleghi dello stesso ruolo e solo nei piani Pro e Plus.
- Correzione proposta, ripresa dalla proposta di valore validata: «Chi non può venire propone lo scambio dall'app, un collega lo accetta, tu approvi con un tocco. Nei piani Pro e Plus.»

**R8 · P1 · Budget dei canali non motivato dai dati**
- Punto: `marketing/lancio.md` righe 12–18 (LinkedIn 70%, Google Ads 20%, Instagram 10%).
- Evidenza contro LinkedIn:
  - LinkedIn ha portato il 3% dei clienti che hanno risposto (`mercato/sondaggio-2026.md` riga 15);
  - non c'è nessun dato misurato su LinkedIn (`crescita/imbuto.md` righe 29–34);
  - la motivazione dipende dal pubblico sbagliato (R5).
- Dati misurati sugli altri canali:
  - Google Ads: 100 clienti, CAC 95 €;
  - Instagram: 14 clienti, CAC 150 €, ma su soli tre mesi;
  - referral: 40 clienti a costo zero;
  - fornitori della cassa: 26 clienti a costo zero.
- Dal sondaggio, i clienti hanno conosciuto Turnio così: consulente del lavoro o commercialista 38%, fornitore della cassa 21%.
- Incoerenza da chiarire: Google Ads attribuisce a sé 100 dei 180 clienti nuovi, ma nel sondaggio solo il 7% dice di aver conosciuto Turnio da Google. Va risolta prima di ripartire il budget.
- Manca anche l'importo assoluto del budget.
- Correzione proposta:
  - la quota maggiore a Google Ads, l'unico canale a pagamento con dati su 12 mesi;
  - Instagram come test con soglia di CAC;
  - spinta su referral e consulenti del lavoro, oggi senza un programma;
  - LinkedIn al più come piccolo test misurato, da riprendere con il segmento dei gruppi dopo Q3;
  - per i clienti attuali, comunicazione nell'app, email e webinar, non campagne a pagamento.

**R9 · P1 · Manca un'analisi della differenziazione**
- Punto: `marketing/posizionamento.md`, nessuna sezione sui concorrenti.
- Evidenza: `mercato/concorrenti.md` righe 7–10. Orarix costa 49 €, ha app e scambio ed è integrato con due software paghe. Turnio Pro costa 59 € e lo scambio non c'è ancora. L'app per i dipendenti distingue Turnio solo da Planora.
- Correzione: scrivere una scheda di confronto verificata su prezzo, funzioni e integrazioni. Cercare differenziatori nei dati, per esempio con interviste ai clienti vinti e persi, il 12% di chi passa a un concorrente (`clienti/fidelizzazione.md` riga 35) e l'NPS 61. Finché mancano, il posizionamento va su valore e semplicità, non sul confronto.

**R10 · P2 · «fa tutto dal telefono» non è vero**
- Punto: `marketing/posizionamento.md` riga 9.
- Evidenza: il responsabile approva gli scambi dal pannello web (`prodotto/prd-scambio-turni.md` riga 13).
- Correzione: «turni e presenze in un'app, per te e per i tuoi dipendenti».

**R11 · P2 · M6 «I tuoi dati restano in Italia» è assoluto, ma la prova copre solo l'hosting**
- Punto: `marketing/posizionamento.md` righe 20 e 25.
- Evidenza: il margine include fornitori di SMS e di pagamento (`README.md` riga 11), di cui non si conosce la sede. Non sono verificati nemmeno email, supporto e backup.
- Correzione: «I server di Turnio sono a Milano», oppure tenere M6 solo dopo l'elenco dei sub-responsabili verificato dalla Privacy & Compliance Agency.

**R12 · P2 · Misure del lancio senza obiettivi né legame con il PRD e gli obiettivi 2027**
- Punto: `marketing/lancio.md` righe 22–24.
- Evidenza: il PRD ha come metriche 5.000 scambi al mese, il 60% dei locali che usa lo scambio e −50% di assenze non coperte (`prodotto/prd-scambio-turni.md` righe 9 e 18–21). L'obiettivo 2027 collegato è O1, l'abbandono (`roadmap/roadmap.md` riga 7). Le visite alla pagina sono una misura di vanità.
- Correzione: dare valori obiettivo e punto di partenza a queste misure:
  - adozione dello scambio nei locali Pro e Plus;
  - passaggi da Base a Pro attribuiti allo scambio;
  - CAC e conversione dalla prova al pagamento per canale della campagna;
  - assenze non coperte.

**R13 · P2 · Il lancio non coinvolge i dipendenti**
- Punto: `marketing/lancio.md` riga 7 (pubblico solo responsabili e titolari).
- Evidenza: lo scambio funziona solo se i dipendenti usano l'app. Oggi la usa ogni settimana il 22% dei dipendenti, e «i dipendenti non usano l'app» è il primo motivo di abbandono, al 41% (`clienti/fidelizzazione.md` righe 35–37).
- Correzione: aggiungere materiale per i dipendenti, nell'app e da far circolare tramite il responsabile.

**R14 · P3 · Disponibilità del piano poco chiara per i potenziali clienti**
- Punto: `marketing/lancio.md` riga 7.
- Correzione: in tutti i materiali indicare che lo scambio è disponibile nei piani Pro e Plus (`crescita/prezzi.md` riga 8).

**Nota.** M4 «Prova Pro 30 giorni, senza carta» è coerente con `crescita/prezzi.md` riga 13. Si può aggiungere che, alla fine della prova, l'account si sospende se non si sceglie un piano.

## Domande aperte
1. M1, M3, M5 e la tabella di confronto sono già pubblicati sul sito, nelle pubblicità o su LinkedIn? Se sì, R1–R3 diventano P0 e i messaggi vanno tolti subito: la decisione spetta all'utente.
2. Il pubblico dei gruppi con più locali è una scelta strategica già decisa? Se sì, serve anticipare la Gestione di più sedi. È una decisione che spetta all'utente.
3. Qual è il budget assoluto del primo semestre 2027?
4. Da dove nasce la differenza di attribuzione fra Google Ads e il sondaggio (R8)?
5. Esiste un consenso di Trattoria Il Ponte a essere citata?
6. Nel PRD, lo scambio si approva in automatico (R3) o lo approva sempre il responsabile (R4)? È da chiarire con il Product Manager.

## Passaggi di consegne proposti
- Product Manager e Portfolio Manager: date e dipendenze dello scambio, contraddizioni del PRD (R6, R7).
- Market Research Analyst: quote di mercato e posizione di Turnio in `mercato/sintesi-mercato.md` (R2).
- Growth & Monetization Manager: attribuzione dei canali (R8).
- Privacy & Compliance Agency: elenco dei fornitori e sede dei dati, per M6 (R11).
- Revisione legale umana: confronti con concorrenti nominati (R1).

Tutte le correzioni sono proposte da confermare con l'utente; nessuna è una decisione approvata.

— MIRACH (AIBPD-08)
