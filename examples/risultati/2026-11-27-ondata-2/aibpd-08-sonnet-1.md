AIBPD-08 · MIRACH — Senior Product Marketing Manager, reparto AIBPD (AI Business & Product Development)

Revisione in sola lettura di `marketing/posizionamento.md` e `marketing/lancio.md`, confrontati con prezzi, concorrenti, sondaggio, roadmap, PRD, imbuto, pipeline e sintesi di mercato. Non ho modificato nessun file. Sono tutti rilievi miei da far confermare all'utente. Il modello è Sonnet: per i rilievi P0 e P1 propongo il riesame di ALDERAMIN (AIBPD-01) o di un revisore su Opus prima che diventino definitivi.

Schede della biblioteca lette: riduzioni-di-prezzo (art. 17-bis Codice del consumo, verificata il 2026-11-19) e direttiva-2024-825 (verificata il 2026-11-19). Nessuna delle due incide sui messaggi rivisti. Non ci sono sconti con prezzo barrato né claim ambientali. Il «gratis per sempre» di M3 rientra nelle pratiche commerciali in generale, che le schede non coprono. I clienti sono imprese, quindi la tutela dei consumatori si applica con cautela: la verifica spetta alla revisione legale umana.

## Rilievi

**1. P0 · M1 «Il gestionale dei turni più usato dai ristoranti italiani»** (`posizionamento.md`, riga 15; usato in home e pubblicità)
- È falso rispetto ai dati del progetto. In `mercato/concorrenti.md` (righe 7-10) Orarix ha circa 2.300 locali e 18.000 utenti, Planora 900 locali, Shiftella 350 e Turnio 412. Turnio è terzo per numero di locali, non primo.
- Anche `sintesi-mercato.md` (riga 25) dice che Turnio è «secondo per locali, sopra Planora e Shiftella». Non è vero, perché Planora ha 900 locali contro 412.
- Correzione proposta: eliminare M1. Non c'è nessuna evidenza che regga un superlativo.

**2. P0 · M5 «Orarix non ha l'app per i dipendenti: Turnio sì»** (riga 19) e la frase di posizionamento «A differenza di Orarix, Turnio ha un'app pensata per i dipendenti» (riga 9)
- È falso. `concorrenti.md` (riga 7) dice che Orarix ha l'app per i dipendenti dal 2025. Il messaggio è in una tabella di confronto pubblica e su LinkedIn: è pubblicità comparativa ingannevole.
- Correzione proposta: sostituire il differenziatore con un fatto verificato. I candidati sono lo scambio dei turni, quando esisterà, e il prezzo (59 € contro 49 €, ma qui Turnio costa di più), oppure una caratteristica di cui ci sia prova. Prima di ogni confronto pubblico serve una verifica sul sito di Orarix con data. Anche Shiftella ha l'app. Serve la revisione legale umana sul confronto con un concorrente nominato.

**3. P1 · Pubblico non coerente con prodotto e dati** (`posizionamento.md`, righe 3-5; `lancio.md`, riga 7; anche `lancio.md`, riga 18)
- Il posizionamento si rivolge a «catene e gruppi con più locali, tutte le sedi in un solo posto». Il README descrive Turnio per locali singoli da 3 a 40 dipendenti.
- La gestione di più sedi è in roadmap per il Q3 2027 (P1), preceduta da un'analisi nel Q2. Lo scambio tra locali dello stesso gruppo è fuori perimetro nel PRD (riga 45).
- Il pubblico effettivo è fatto di locali singoli: nella pipeline Il Ponte ha 1 locale e Bar Centrale ha 1 locale, con un solo gruppo (Portico, 4 locali).
- Correzione proposta: riposizionare sul locale singolo con 3-40 dipendenti, nei piani Pro e Plus. Il tema multi-sede va rinviato al Q3 2027.

**4. P1 · M2 «Risparmia 5 ore a settimana sui turni»** (riga 16) e la prova (riga 24)
- La prova è un'intervista a un solo cliente. Trattoria Il Ponte nella pipeline è «Firmato» il 12/11/2026, con chiusura prevista il 2026-11-12: non è un cliente storico che ha potuto misurare un risparmio.
- Il dato aggregato del sondaggio (`sondaggio-2026.md`, righe 11-12) dice mediana 4 ore prima e 1 ora dopo, cioè circa 3 ore di risparmio, non 5.
- Il sondaggio ha 74 risposte su 412 (18%), solo da clienti attuali, con un buono Amazon da 10 €: il campione è autoselezionato. Non si può dire «risparmia» a tutti.
- Correzione proposta: «In mediana, i nostri clienti passano da 4 a 1 ora a settimana per i turni (sondaggio 2026, 74 risposte di clienti)». Anche se si usa Il Ponte, la prova va documentata con data e consenso scritto alla citazione.

**5. P1 · M3 «Gratis per sempre fino a 3 dipendenti»** (riga 17; pagina dei prezzi e Instagram)
- Non esiste un piano gratuito. `crescita/prezzi.md` ha Base a 29 €, Pro a 59 € e Plus a 99 €, più una prova di 30 giorni su Pro. Il messaggio promette qualcosa che il prodotto non offre.
- Correzione proposta: eliminare M3. Se si vuole un piano gratuito, serve prima una decisione di prezzo e di business case, con approvazione dell'utente.

**6. P1 · M4 «Prova Pro 30 giorni, senza carta»** (riga 18)
- È coerente con `prezzi.md` (riga 13). La prova però è su Pro, e il piano Base nel piano di lancio è quello con cui si confronta lo scambio dei turni (vedi rilievo 9). Va indicato in modo chiaro che la prova copre Pro e che alla fine l'account si sospende. Ho verificato solo la coerenza.
- Correzione proposta: aggiungere «poi scegli un piano o l'account si sospende».

**7. P1 · M6 «I tuoi dati restano in Italia»** (riga 20) e la prova (riga 25)
- La prova è «i server sono a Milano». Un contratto di hosting con data center in Italia copre i server dell'applicazione, ma il messaggio parla di «dati» in senso generale. Gli SMS e i fornitori di pagamento non risultano nei documenti. Il progetto non mostra l'elenco dei fornitori né dove vanno i dati (SMS, pagamenti, backup, supporto). Il README cita gli SMS come costo.
- Non ho trovato nel progetto il contratto di hosting. Dichiaro che non l'ho verificato.
- Correzione proposta: limitare il messaggio a ciò che è provato («i server dell'app sono in Italia», con riferimento al contratto) oppure far verificare dall'agenzia Privacy & Compliance l'elenco dei fornitori e dei trasferimenti prima di usare «i tuoi dati».

**8. P1 · Canali del lancio non motivati dai dati** (`lancio.md`, righe 10-18)
- LinkedIn riceve il 70% del budget con il motivo «raggiunge i decisori dei gruppi della ristorazione». Ma il pubblico effettivo non sono i gruppi (rilievo 3).
- Nel sondaggio (`sondaggio-2026.md`, riga 15) LinkedIn è il canale con cui hanno conosciuto Turnio solo il 3% degli intervistati. Consulente o commercialista 38%, fornitore della cassa 21%, Instagram 17%, passaparola 14%, Google 7%.
- `crescita/imbuto.md` (righe 26-31) non ha nessun dato su LinkedIn: Google Ads ha CAC 95 € e LTV 520 €, Instagram CAC 150 € e LTV 640 € (stimata su tre mesi), referral e fornitori della cassa CAC 0 €.
- Caveat: il campione è di clienti attuali, quindi non dice come si conquistano i non clienti, e l'LTV di Instagram è una stima su tre mesi.
- Correzione proposta: rifare l'allocazione partendo da consulenti del lavoro, commercialisti e fornitori della cassa (i canali più forti, a costo nullo), poi referral, poi Google Ads e Instagram. Se si vuole testare LinkedIn, un budget piccolo come esperimento con soglia di successo definita. Nota: l'accordo con Cassa Facile in `partner/accordi.md` ha clausole molto onerose (esclusiva su tutta Italia, durata 5 anni senza recesso, compenso del 25% IVA compresa), da rivedere con la direzione prima di costruirci sopra il canale.

**9. P1 · Lancio dal 1° febbraio 2027, ma lo scambio dei turni non è pronto** (`lancio.md`, righe 4-6)
- Roadmap (`roadmap.md`, riga 25): scambio dei turni nel Q2 2027 (P0, 10 settimane), e dipende da App dipendenti 2.0, che è nel Q3 (riga 28) con priorità P3. Il PRD (riga 4) dice «in sviluppo da gennaio 2027» e mette le notifiche push fuori perimetro (riga 43), mentre il requisito R5 le richiede. Questo è un'incoerenza interna da risolvere con il product manager.
- Il lancio il 1° febbraio 2027 precede lo sviluppo per mesi: non c'è un prodotto da lanciare. Anche `concorrenti.md` dice «in sviluppo».
- Correzione proposta: spostare il lancio a dopo il rilascio, con una data legata alla roadmap (non prima della fine del Q2) e senza campagna a pagamento prima di avere il prodotto. Il comunicato e il webinar vanno rinviati. Intanto si può preparare una lista d'attesa tra i clienti, previa approvazione.

**10. P2 · Messaggio del lancio «Le assenze dell'ultimo minuto si coprono da sole»** (`lancio.md`, riga 8)
- Promette troppo. Il PRD (R4, riga 30) richiede sempre l'approvazione del responsabile, anche se R3 (riga 29) dice che con due accettazioni lo scambio è approvato in automatico: i due requisiti sono contraddittori. Inoltre lo scambio vale tra colleghi con lo stesso ruolo e turni non sovrapposti, con chiusura 2 ore prima del turno (R6). Il valore validato è l'ipotesi del 40% delle assenze con più di 4 ore di anticipo (`concetti.md`, riga 17), e solo 6 locali su 8 l'hanno superata.
- Correzione proposta: «Chi non può venire propone lo scambio dall'app, i colleghi accettano, tu approvi con un tocco». Niente promesse di copertura automatica.

**11. P2 · Misure del lancio incomplete e non collegate agli obiettivi** (`lancio.md`, righe 20-24)
- Mancano soglie e date. Il PRD ha obiettivi a sei mesi (5.000 scambi proposti al mese, 60% dei locali che l'hanno usato).
- «Clienti attuali che passano da Base a Pro» è coerente con il vincolo del PRD (riga 39: Pro e Plus). Ma il lancio punta all'acquisizione (O2, 520 locali) e all'ARPU (O3), mentre lo scambio dei turni nella roadmap è collegato a O1 (abbandono). Non c'è una misura sull'abbandono.
- Correzione proposta: aggiungere i valori obiettivo e collegare le misure agli obiettivi O1, O2 e O3.

**12. P2 · Pubblico del lancio troppo ampio** (`lancio.md`, riga 7)
- «Responsabili e titolari dei locali clienti e dei potenziali clienti» non è un segmento. Il PRD indica come utente principale il responsabile di sala o il titolare; l'unico segmento con dati è Pro/Plus.
- Correzione proposta: distinguere tre messaggi (clienti Base da far passare a Pro, clienti Pro e Plus da attivare, nuovi con prova) con un canale per ciascuno.

**13. P2 · Prove a sostegno mancanti** (`posizionamento.md`, righe 22-25)
- M1, M3, M4 e M5 non hanno nessuna prova elencata. Per ogni messaggio che resta serve una fonte con data (documento, pagina, dato).

**14. P3 · Frase di posizionamento** (riga 9)
- «Perdono ore ogni settimana a fare i turni» e «fa tutto dal telefono» sono generici: il responsabile approva dal pannello web (PRD, riga 13), non dal telefono. Correzione: «fa i turni e le presenze, e i dipendenti li vedono dall'app».

## Incoerenze fuori dal perimetro, da girare agli altri responsabili
- `sintesi-mercato.md`: il TAM usa il censimento del 2019 (F1, 198.000 locali), mentre il rapporto 2026 (F2) dà 176.000 locali, di cui il 58% senza dipendenti e solo il 31% con 3-40 dipendenti. Il mercato reale di Turnio è molto più piccolo di quanto indicato. Il calcolo del SAM applica il 60% a tutti i locali, ignorando che solo il 31% rientra nel target.
- `sintesi-mercato.md` (riga 21): il 64% disposto a pagare 59 € o più viene da clienti attuali (selezione sul campione), non dal mercato.
- `concorrenti.md` (righe 12-14): le quote sono calcolate sommando utenti (18.000 dipendenti di Orarix) e locali: unità diverse.
- `imbuto.md`: la decisione del test sui prezzi si basa su un controllo quotidiano con fermata anticipata, e il campione (412 e 405 visite) è piccolo, 35 e 41 prove: il +19% non è dimostrato. Anche le proposte sui canali usano un LTV stimato su tre mesi.
- `prezzi.md` (riga 18): la crescita del 20% dei ricavi grazie agli annuali confonde incasso e ricavo.
- `accordi.md`: clausole onerose (vedi rilievo 8) e sconto del 40% per tutta la durata più compenso del 30% sul listino, che azzera il margine.

## Domande aperte
- Qual è il pubblico scelto dall'utente per il 2027: locali singoli o gruppi? Dipende dalla data della gestione di più sedi.
- Esiste il consenso scritto di Trattoria Il Ponte e la data dell'intervista?
- Dov'è il contratto di hosting e quali fornitori trattano i dati?
- C'è una verifica datata del sito di Orarix sull'app per i dipendenti?
- Quale data di lancio approva l'utente, sapendo che lo scambio dei turni è nel Q2 2027?

## Decisioni che richiedono l'approvazione umana
Messaggi da ritirare (M1, M3, M5), nuovo pubblico, allocazione del budget dei canali, data di lancio, e ogni confronto pubblico con un concorrente.

— AIBPD-08 · MIRACH
