AIBPD-08 · MIRACH — Senior Product Marketing Manager, reparto AIBPD (AI Business & Product Development)

Rapporto per AIBPD-01 · ALDERAMIN. Il caricamento di AIBPD-01 non era possibile con i tool a mia disposizione. Ho lavorato in sola lettura su `marketing/posizionamento.md` e `marketing/lancio.md`, confrontandoli con `crescita/prezzi.md`, `mercato/concorrenti.md`, `mercato/sondaggio-2026.md`, `mercato/sintesi-mercato.md`, `mercato/fonti.md`, `crescita/imbuto.md`, `clienti/fidelizzazione.md`, `prodotto/prd-scambio-turni.md`, `roadmap/roadmap.md` e `README.md`. Percorsi relativi alla cartella del progetto.

Sono Sonnet. Per i rilievi P0 e P1 propongo il riesame del direttore del reparto o di un revisore su Opus prima che diventino definitivi. Nessuna decisione è stata presa: tutte le correzioni sono proposte da confermare con l'utente.

## Esito in breve

Il piano non è pubblicabile così com'è.
- 4 messaggi su 6 (M1, M3, M5 e in parte M2) sono falsi o non sostenuti dai dati.
- Il pubblico del posizionamento (catene e gruppi) non corrisponde al prodotto né ai clienti.
- Il lancio di febbraio 2027 è in conflitto con roadmap e PRD.
- La ripartizione dei canali non ha basi nei dati.

## Rilievi

### Posizionamento (`marketing/posizionamento.md`)

**R1 · P1 · M1 «Il gestionale dei turni più usato dai ristoranti italiani» (riga 15)**
- Evidenza: `mercato/concorrenti.md` riga 7 dà a Orarix circa 2.300 locali, Planora ne ha 900 e Turnio 412. Turnio è terzo per locali.
- La quota del 2,1% (riga 14 di concorrenti.md) somma 18.000 utenti-dipendenti di Orarix con locali degli altri: è un errore di metodo.
- Anche `mercato/sintesi-mercato.md` riga 25 («secondo… sopra Planora e Shiftella») è sbagliata, ma è fuori dal mio perimetro.
- Correzione: eliminare M1. Alternativa verificabile: «Usato da 412 locali di ristorazione» (dato al 31 ottobre 2026, README).

**R2 · P1 · M5 e frase di posizionamento «A differenza di Orarix, Turnio ha un'app pensata per i dipendenti» (riga 9 e riga 19)**
- Evidenza: concorrenti.md riga 7 dice che Orarix ha l'app per i dipendenti dal 2025 e ha già lo scambio dei turni, che Turnio non ha ancora («In sviluppo»).
- Il messaggio è falso e finirebbe in una tabella di confronto pubblica e su LinkedIn, dove la tabella mostrerebbe Turnio indietro su scambio e prezzo (59 € contro 49 €).
- C'è anche un problema di sostanza: la prima causa di abbandono è «i dipendenti non usano l'app» (41%) e solo il 22% dei dipendenti usa l'app ogni settimana (`clienti/fidelizzazione.md` righe 35-37). L'app dei dipendenti è oggi un punto debole, non un vantaggio.
- La differenziazione vera sta nei dati:
  - contro Planora (solo web, 39 €): app e timbratura;
  - contro Orarix: nessun vantaggio dimostrabile oggi.
- Correzione: togliere il confronto con Orarix. Basare la differenziazione su dati verificabili, per esempio NPS 61 (con il limite: 74 risposte su 268 invitati) e il rapporto fra prezzo e funzioni. Decisione di posizionamento da prendere con il fondatore.

**R3 · P1 · «Per chi»: catene e gruppi con più locali, «turni di tutte le sedi in un solo posto» (riga 5)**
- Evidenza:
  - il prodotto serve locali singoli con 3-40 dipendenti, prezzo «per locale» (README e prezzi.md);
  - la «Gestione di più sedi» è in roadmap al Q3 2027, con l'analisi al Q2;
  - gli scambi fra locali dello stesso gruppo sono fuori perimetro nel PRD (riga 45);
  - i clienti attuali sono locali singoli e il segmento di mercato è 3-40 dipendenti (sintesi-mercato.md riga 29).
- Non ci sono dati su catene e gruppi tra i clienti o nel sondaggio.
- Correzione: indirizzare il posizionamento ai responsabili e titolari di locali con 3-40 dipendenti. Rimandare il messaggio multi-sede a quando la funzione esiste. Se la direzione vuole puntare ai gruppi, serve prima una decisione e una validazione: oggi è un'ipotesi senza evidenze.

**R4 · P2 · «fa tutto dal telefono» (riga 9)**
- Evidenza: il responsabile approva gli scambi «dal pannello web» (PRD riga 13), la salute dei clienti si misura sugli accessi al pannello web, e le paghe non sono ancora rilasciate.
- Correzione: «…è l'app dei turni e delle presenze: il responsabile pubblica i turni, i dipendenti li vedono e timbrano dall'app».

**R5 · P1 · M2 «Risparmia 5 ore a settimana sui turni» (riga 16) e prova (riga 24)**
- Evidenza: il sondaggio (sondaggio-2026.md righe 12-13) dà una mediana di 4 ore prima e 1 ora dopo, cioè 3 ore risparmiate, non 5. Non c'è un dato che sostenga 5.
- L'unica prova citata è un'intervista a «Trattoria Il Ponte»: nessun documento del progetto contiene questa intervista e il cliente non compare in nessun altro file.
- Il sondaggio ha limiti: 74 risposte su 412 (18%), autoselezione, buono Amazon da 10 €.
- Un aneddoto singolo non basta per un claim di prestazione, e citare un cliente in pubblicità richiede il suo consenso.
- Correzione: «Da 4 a 1 ora a settimana per preparare i turni: la mediana dei clienti che hanno risposto al sondaggio Turnio 2026 (74 risposte)». Se si vuole usare Il Ponte, servono l'intervista agli atti e il consenso scritto del cliente.

**R6 · P1 · M3 «Gratis per sempre fino a 3 dipendenti» (riga 17)**
- Evidenza: `crescita/prezzi.md` non prevede alcun piano gratuito. Base costa 29 € per locale (fino a 10 dipendenti), l'unica gratuità è la prova di 30 giorni su Pro (riga 13), e il segmento parte da 3 dipendenti.
- Il messaggio promette una cosa che non esiste. Il referral ha un mese gratis, non è un piano gratuito.
- Correzione: eliminare M3. Introdurre un piano gratuito sarebbe una decisione di pricing da valutare con la funzione crescita, con l'impatto su MRR e margine.

**R7 · P2 · M6 «I tuoi dati restano in Italia» (riga 20) e prova (riga 25)**
- Evidenza: la prova copre solo i server («contratto di hosting, data center in Italia»), non i dati. Il margine lordo include SMS e commissioni di pagamento (README riga 11): fornitori che nel progetto non sono mappati.
- Non vedo backup, strumenti di supporto o fornitori SMS verificati in Italia.
- Correzione: pubblicare solo «I server di Turnio sono in un data center in Italia», dopo aver verificato il contratto agli atti. Prima di usare «I tuoi dati restano in Italia» coinvolgere la Privacy & Compliance Agency per l'elenco dei fornitori e dei trasferimenti.

**R8 · P3 · M4 «Prova Pro 30 giorni, senza carta» (riga 18)**
Coerente con prezzi.md riga 13. Aggiungere «poi scegli un piano o l'account si sospende», per non nascondere cosa succede alla fine della prova. Il messaggio può restare.

### Piano di lancio (`marketing/lancio.md`)

**R9 · P0 · Data di lancio «dal 1° febbraio 2027» (riga 6)**
- Evidenza:
  - la roadmap (righe 17 e 25) mette lo scambio dei turni al Q2, 10 settimane di squadra A, dipendente da «App dipendenti 2.0»;
  - la App dipendenti 2.0 è al Q3 con priorità P3 (riga 28);
  - il PRD riga 4 dice «in sviluppo da gennaio 2027», e concorrenti.md e prezzi.md riga 8 lo danno ancora come funzione futura.
- A febbraio la funzione non esiste. Anche partendo da gennaio, 10 settimane portano a metà marzo al più presto, e la dipendenza dall'App 2.0 sposta il lancio al Q3.
- Il lancio andrebbe fermato fino a una decisione sul calendario. Nota fuori dal mio perimetro: il PRD ha una contraddizione interna (R5 prevede le notifiche push, ma «Fuori perimetro» le rimanda all'App 2.0), da segnalare al product manager.
- Correzione: rimuovere la data finché la roadmap non è chiusa. Riscrivere il lancio per fasi: annuncio dopo il rilascio, non prima. Va decisa con il product manager l'anticipo dell'App 2.0 (oggi P3) o un rilascio dello scambio senza push.

**R10 · P1 · Messaggio «Le assenze dell'ultimo minuto si coprono da sole» (riga 8)**
- Evidenza:
  - R4 del PRD (riga 30) dice che il responsabile deve sempre approvare: non c'è copertura automatica (R3, riga 29, parla di approvazione automatica ma R4 la smentisce);
  - lo scambio si chiude da solo 2 ore prima del turno (R6), e la validazione dell'ipotesi riguarda le assenze annunciate con più di 4 ore di anticipo, non quelle dell'ultimo minuto (concetti.md righe 9-11);
  - il test ha coinvolto 8 locali, di cui 6 sopra il 40%.
- Il messaggio promette più di quanto il prodotto e la validazione dimostrino.
- Correzione: «Quando un collega non può venire, lo scambio si propone dall'app e lo approvi con un tocco». Per l'ultimo minuto non promettere nulla finché non c'è un dato.

**R11 · P1 · Pubblico incoerente con il posizionamento (riga 7)**
Il lancio parla ai «responsabili e titolari dei locali clienti e potenziali», il posizionamento a «catene e gruppi». Vedi R3. Il PRD, coerentemente con il prodotto, indica come utente principale il responsabile di sala o titolare del singolo locale. Va scelto un solo pubblico e va motivato: oggi il documento non cita nessun dato.
Il lancio dovrebbe dichiarare anche il secondo target: i clienti attuali sono il pubblico più immediato (la funzione è solo per Pro e Plus, il PRD riga 39, e serve all'obiettivo O1 sull'abbandono e a O3 sull'ARPU). La parte di campagna a pagamento verso i nuovi clienti è meno motivata.

**R12 · P1 · Ripartizione dei canali: LinkedIn 70%, Google Ads 20%, Instagram 10% (righe 12-18)**
- Evidenza: la motivazione «LinkedIn raggiunge i decisori dei gruppi della ristorazione» poggia su un target che non esiste nei dati (R3).
- Nel sondaggio LinkedIn è il canale con meno conoscenza di Turnio (3%, sondaggio-2026.md riga 15); non c'è alcuna spesa né CAC storico.
- I canali con dati sono Google Ads (CAC 95 €, LTV a 12 mesi 520 €, 100 clienti) e Instagram (CAC 150 €, LTV 640 € stimata su soli tre mesi, 14 clienti): imbuto.md righe 31-32.
- I canali che hanno portato clienti non sono nel piano: consulente del lavoro o commercialista 38%, fornitore della cassa 21%, passaparola 14%.
- C'è un'incoerenza fra fonti: nel sondaggio Google è al 7%, ma nel conteggio dell'imbuto porta 100 clienti su 180. Il sondaggio riguarda solo i clienti rimasti ed è autodichiarato; da riconciliare prima di decidere.
- Il piano non indica il budget in euro, solo percentuali. Va indicato il totale (da approvare dall'utente) e la base di confronto: il 2026 ha speso 9.500 € su Google e 2.100 € su Instagram.
- Correzione: partire dai canali dimostrati (Google Ads e canale consulenti/commercialisti e fornitori di cassa) e riservare a LinkedIn una quota piccola e a termine come test, con una soglia di CAC dichiarata. Tutto da confermare con l'utente.

**R13 · P2 · Misure senza obiettivi né base di partenza (righe 20-24)**
- Le tre misure (visite, prove avviate, passaggi da Base a Pro) non hanno obiettivo, base di partenza, periodo né attribuzione per canale.
- Le basi esistono: 4,0% da visita a prova e 20% da prova a pagamento (imbuto.md), con obiettivo 25% per il 2027.
- Mancano le metriche del PRD (5.000 scambi al mese, 60% dei locali che usano lo scambio) e quelle collegate a O1: abbandono sotto il 20%, oggi 23,8%.
- Correzione: aggiungere per ogni misura base, obiettivo, orizzonte e fonte del dato.

**R14 · P3 · Attività da autorizzare**
Comunicato, webinar e campagna a pagamento sono pubblicazioni e spese: richiedono l'approvazione esplicita dell'utente. Il piano non riporta chi approva né quando.

## Schede della biblioteca

- `riduzioni-di-prezzo` (Codice del consumo, art. 17-bis, in vigore dal 2 aprile 2023, verificata il 2026-11-19, da ricontrollare entro il 2027-05-19): nei due file di marketing non ci sono prezzi barrati né annunci di riduzione. «Due mesi gratis» e «un mese gratis» del referral sono promozioni, non riduzioni di prezzo. Il Codice del consumo tutela i consumatori e i clienti sono imprese (README), quindi la scheda non è applicabile. Resta da ricontrollare se in futuro compariranno prezzi scontati rivolti a consumatori.
- `direttiva-2024-825` (verificata il 2026-11-19): non ci sono messaggi ambientali o di sostenibilità. Nessun rilievo.

## Informazioni mancanti e domande aperte

1. L'intervista a Trattoria Il Ponte: dove sta e c'è il consenso del cliente?
2. Chi è il pubblico scelto: locali singoli o gruppi (decisione del fondatore e del product manager)?
3. Il calendario dello scambio dei turni: data di rilascio e priorità dell'App 2.0.
4. Il budget totale della campagna e la fonte della ripartizione.
5. Elenco dei fornitori (SMS, pagamenti, backup) per il messaggio sui dati in Italia, da valutare con la Privacy & Compliance Agency.
6. Riconciliare il dato del sondaggio (Google 7%) con l'imbuto (Google 100 clienti su 180).

## Passaggi di consegne proposti

- Product manager (AIBPD-07 o equivalente): R9 e R10, con il calendario e il contrasto fra R3 e R4 del PRD.
- Analisi di mercato: correggere le quote di mercato di concorrenti.md (mescolano utenti e locali) e la frase sul secondo posto in sintesi-mercato.md.
- Privacy & Compliance Agency: M6.

Firmato: AIBPD-08 · MIRACH. File analizzati: tutti sotto `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-08-4`; nessun file modificato.
