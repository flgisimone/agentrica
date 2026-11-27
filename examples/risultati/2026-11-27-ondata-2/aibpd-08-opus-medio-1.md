AIBPD-08 · MIRACH — Senior Product Marketing Manager, reparto AIBPD (AI Business & Product Development)

Nota di metodo: le istruzioni mi chiedevano di riportare ad AIBPD-01 · ALDERAMIN caricandolo prima con agent, ma in questa sessione non ho il tool agent. Il rapporto va quindi al chiamante, da passare al direttore. Ho lavorato in sola lettura su /private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-08-1 e non ho modificato nessun file. Ho letto marketing/posizionamento.md e marketing/lancio.md e li ho confrontati con crescita/prezzi.md, crescita/imbuto.md, mercato/* (concorrenti, sondaggio, fonti, sintesi), roadmap/roadmap.md, prodotto/prd-scambio-turni.md, innovazione/concetti.md, clienti/fidelizzazione.md e vendite/pipeline.csv. Nel progetto (README r.5) è scritto che i dati sono inventati: li tratto come i fatti del progetto.

## Esito

Posizionamento e piano di lancio così come sono non si possono usare.
- Tre messaggi su sei sono falsi rispetto ai dati del progetto: M1, M3 e M5.
- Un messaggio si regge su un'evidenza debole e incoerente: M2.
- La differenza dichiarata rispetto a Orarix non esiste.
- Il lancio è fissato prima che la funzione esista e promette un comportamento che il PRD esclude.
- Il pubblico (catene) e il canale (LinkedIn al 70%) contraddicono i dati su clienti e canali.

## Rilievi

**R1 · P0 · lancio.md r.6: la data di lancio (1° febbraio 2027) cade prima che la funzione esista**
- Evidenza:
  - roadmap.md r.25 mette lo Scambio dei turni in Q2 (10 settimane, squadra A), con la dipendenza «App dipendenti 2.0», che è in Q3 (r.28, P3).
  - Il PRD r.5 dice «in sviluppo da gennaio 2027», ma in Q1 la squadra A ha già 14 + 6 = 20 settimane su 13 disponibili (roadmap r.13, r.19-20).
  - Il PRD R5 (notifiche push, r.31) è in contraddizione con il «Fuori perimetro» (r.43, le push arrivano con App 2.0).
- Conseguenza: una campagna a pagamento e un webinar su una funzione che non c'è. Lo segnalo subito perché blocca il piano.
- Correzione: spostare il lancio a dopo il rilascio reale, cioè almeno a fine Q2 se il Product Manager risolve dipendenza e capacità. Il lancio va legato a una condizione («funzione disponibile per tutti i clienti Pro/Plus da 2 settimane») e non a una data fissa. Decisione da prendere ora con il Product Manager (AIBPD-02/roadmap).

**R2 · P1 · lancio.md r.8: il messaggio «Le assenze dell'ultimo minuto si coprono da sole» promette ciò che il prodotto non fa**
- Evidenza:
  - PRD R4 (r.30): il responsabile deve sempre approvare. Nel PRD R3 (r.29) c'è un'approvazione automatica che contraddice R4: è un'incoerenza da risolvere nel PRD.
  - PRD R6 (r.32): lo scambio si chiude 2 ore prima del turno, quindi non copre l'ultimo minuto.
  - L'ipotesi validata (concetti.md r.9-11) riguarda solo le assenze annunciate con più di 4 ore di anticipo, su un prototipo con 8 locali.
  - L'obiettivo del PRD è −50% di assenze non coperte, non tutte.
- Correzione, per esempio: «Chi non può venire propone lo scambio ai colleghi dall'app; tu approvi con un tocco». Nessuna promessa di copertura automatica né «dell'ultimo minuto». Dati di efficacia solo dopo il rilascio, misurati.

**R3 · P1 · posizionamento.md r.15, M1: «Il gestionale dei turni più usato dai ristoranti italiani» è falso**
- Evidenza:
  - concorrenti.md r.7-10: Orarix ha circa 2.300 locali, Planora 900, Turnio 412. Turnio è terzo su quattro per locali.
  - La sintesi del mercato (r.25) dice «secondo dopo Orarix», ed è falso anche questo.
  - La quota di concorrenti.md r.14 somma utenti di Orarix (18.000 dipendenti) e locali degli altri: non è confrontabile. Va rifatta su 2.300 + 900 + 350 + 412 locali, che dà a Turnio circa il 10%, e solo fra i concorrenti censiti.
- Il messaggio è pubblicato in home e nella pubblicità: un superlativo comparativo non dimostrato è un rischio legale. Serve una revisione legale umana. Non ho una scheda in biblioteca sulla pubblicità comparativa tra imprese, quindi non cito norme.
- Correzione: togliere M1 e sostituirlo con un fatto verificabile, per esempio «Scelto da oltre 400 locali in Italia» (412 al 31/10/2026).

**R4 · P1 · posizionamento.md r.17, M3: «Gratis per sempre fino a 3 dipendenti» non corrisponde a nessun piano**
- Evidenza: prezzi.md r.5-13 non prevede un piano gratuito. Base costa 29 € al mese e l'unica gratuità è la prova di 30 giorni su Pro.
- Il messaggio è sulla pagina dei prezzi e su Instagram.
- Correzione: togliere M3. Se si vuole un piano gratuito è una decisione di pricing (Growth & Monetization, approvazione dell'utente) e non un messaggio. Effetto da valutare: il 58% dei locali non ha dipendenti e il segmento parte da 3 (fonti.md F2).

**R5 · P1 · posizionamento.md r.9 e r.19, M5: la differenza dichiarata rispetto a Orarix è falsa**
- Evidenza:
  - Orarix ha l'app per i dipendenti dal 2025, ha lo scambio dei turni ed è integrato con due software paghe (concorrenti.md r.7).
  - Costa 49 € contro i 59 € di Turnio Pro.
  - Anche Shiftella ha app e scambio. Solo Planora non ha l'app.
- M5 è nella tabella di confronto e su LinkedIn: una pubblicità comparativa falsa su un concorrente nominato, da togliere subito, con revisione legale umana.
- Correzione: rifare la frase di posizionamento su elementi verificabili. Candidati da validare, a bassa confidenza:
  - (a) Base a 29 € con l'app dei dipendenti, il prezzo d'ingresso più basso fra quelli con l'app. Il confronto in concorrenti.md però è per locali da 10-25 dipendenti, per cui Turnio va su Pro o su Base più il sovrapprezzo: da rifare a parità di locale.
  - (b) Il canale dei consulenti e dei fornitori della cassa.
  - (c) Il tempo risparmiato misurato (R6).
- Oggi Turnio non ha un vantaggio funzionale dimostrato su Orarix: è un'informazione mancante da dichiarare, non da coprire con un messaggio.

**R6 · P2 · posizionamento.md r.16 e r.24, M2: «Risparmia 5 ore a settimana» ha una prova debole e incoerente**
- Evidenza:
  - La prova è un'intervista a un solo cliente, Trattoria Il Ponte, che in pipeline.csv (D-01) ha firmato il 12/11/2026, 8 giorni fa: non può aver misurato un risparmio stabile.
  - Il sondaggio (sondaggio-2026.md r.12-13) dà una mediana di 4 ore prima e 1 ora dopo, cioè 3 ore. È un dato dichiarato, solo da clienti attuali, con 74 risposte (18%) e un buono da 10 €, quindi sovrastimato per selezione.
  - Citare per nome un cliente richiede il suo consenso scritto.
- Correzione, per esempio: «I nostri clienti dichiarano in mediana 3 ore a settimana in meno per fare i turni (sondaggio clienti, ottobre 2026, 74 risposte)», con la nota sulla fonte. Oppure misurarlo dai dati d'uso prima di pubblicarlo.

**R7 · P2 · posizionamento.md r.9: «fa tutto dal telefono» non corrisponde al prodotto**
- Evidenza:
  - Il responsabile approva gli scambi dal pannello web (PRD r.13).
  - Il punteggio di salute pesa al 40% gli accessi al pannello web (fidelizzazione.md r.45).
  - L'esportazione per il consulente e i report sono funzioni da ufficio.
  - Anche il problema citato nella frase («perdono ore a fare i turni», 27%) non è il primo del sondaggio: le assenze dell'ultimo minuto sono al 46%.
- Correzione: «dal telefono per i dipendenti, dal pannello web per chi organizza». Il bisogno va riformulato sul problema principale, le assenze, quando lo scambio sarà disponibile.

**R8 · P1 · posizionamento.md r.5 e lancio.md r.7: il pubblico «catene e gruppi con più locali» non è sostenuto dai dati**
- Evidenza:
  - Il segmento dichiarato è il locale da 3-40 dipendenti (README r.3, sintesi r.29). Non ci sono dati sulle catene.
  - In pipeline.csv 11 opportunità su 13 sono a locale singolo. I gruppi sono solo Gruppo Portico, presente due volte (D-03 e P-07, probabile doppione), e Pizza&Co.
  - La gestione di più sedi arriva solo in Q3 2027 (roadmap r.27 e r.30).
  - Il PRD esclude gli scambi fra locali diversi dello stesso gruppo (r.45).
  - I due documenti non concordano fra loro: il lancio si rivolge a tutti i titolari.
- Correzione: pubblico primario il titolare o responsabile di un locale singolo da 3-40 dipendenti, al Nord e al Centro. I gruppi diventano un segmento secondario da riprendere dopo il rilascio della gestione di più sedi.

**R9 · P1 · lancio.md r.12-18: il budget dei canali non è motivato dai dati**
- Evidenza:
  - LinkedIn riceve il 70% ma è la fonte di conoscenza per il 3% (sondaggio r.15) e non ha nessun cliente attribuito né un CAC misurato (imbuto.md r.29-34).
  - Google Ads: 100 clienti, CAC 95 €.
  - Instagram: CAC 150 €, con un LTV stimato su tre mesi.
  - Referral e fornitori della cassa: 66 clienti a costo zero.
  - Consulenti del lavoro e commercialisti sono la prima fonte di conoscenza (38%), ma non sono nel piano.
  - La motivazione («decisori dei gruppi») dipende dal pubblico di R8, che non è sostenuto.
  - Manca l'importo del budget.
- Limiti dei dati: il sondaggio riguarda solo i clienti e «dove ci hai conosciuto» non è un'attribuzione. Gli LTV a 12 mesi dei canali sono simili (520-640 €), per cui conta soprattutto il CAC.
- Correzione:
  - quota principale a Google Ads, il canale con il CAC più basso misurato;
  - Instagram come test limitato, con soglia di CAC e data di verifica;
  - LinkedIn al più come test piccolo, solo se l'utente conferma i gruppi come segmento;
  - azioni non a pagamento su consulenti e commercialisti, fornitori della cassa e referral, con i clienti attuali come canale del lancio, perché l'upgrade Base→Pro passa da loro.
- La proposta in imbuto.md r.36 (spostare metà di Google Ads su Instagram «per l'LTV più alto») ha la stessa debolezza: è un LTV stimato su tre mesi con un CAC più alto. Va coordinata con Growth & Monetization.

**R10 · P2 · lancio.md r.20-24: le misure del lancio sono incomplete e non hanno obiettivi**
- Evidenza:
  - Ci sono solo visite, prove e upgrade, senza valore di partenza né obiettivo.
  - Mancano le metriche del PRD (60% dei locali che usano lo scambio, 5.000 scambi al mese, −50% di assenze non coperte).
  - Manca l'obiettivo dell'iniziativa, O1 (abbandono sotto il 20%, oggi 23,8%).
  - Manca la conversione dalla prova al pagamento (oggi 20%, obiettivo 25%).
  - Manca l'adozione da parte dei dipendenti: il 41% degli abbandoni è dovuto al fatto che i dipendenti non usano l'app, e solo il 22% la usa ogni settimana (fidelizzazione.md r.35-37). Il lancio non prevede materiali per i dipendenti, che sono gli utenti che propongono lo scambio.
- Correzione: aggiungere per ogni misura il valore di partenza, l'obiettivo e la data. Aggiungere adozione dello scambio, assenze coperte, uso settimanale dell'app da parte dei dipendenti e upgrade Base→Pro con valore di partenza (oggi 190 Base). Prevedere comunicazione nell'app e materiali nel locale per i dipendenti.

**R11 · P2 · posizionamento.md r.20 e r.25, M6: «I tuoi dati restano in Italia» ha una prova parziale**
- Evidenza:
  - La prova copre solo l'hosting (server a Milano).
  - Il margine lordo include SMS e commissioni di pagamento (README r.11), cioè fornitori esterni con sede dati da verificare.
  - Le notifiche su WhatsApp sono in roadmap per Q1 2027 (roadmap r.23) e introducono un fornitore fuori dall'Italia.
- Correzione: limitare il messaggio a ciò che è provato («I server di Turnio sono in Italia, a Milano») oppure verificare tutti i fornitori. Da passare a Privacy & Compliance (fornitori e trasferimenti).

M4 («Prova Pro 30 giorni, senza carta») è coerente con prezzi.md r.13: nessun rilievo.

## Schede della biblioteca

- riduzioni-di-prezzo: Codice del consumo art. 17-bis, Normattiva, verificata il 19/11/2026. Si applica agli annunci di riduzione di prezzo ai consumatori. I clienti di Turnio sono imprese (README r.12) e i documenti di marketing non contengono prezzi barrati, quindi non è applicabile. Va ripresa se una campagna di gennaio sugli annuali («due mesi gratis», prezzi.md r.12 e r.18) mostrasse prezzi barrati.
- direttiva-2024-825: Commissione europea, verificata il 19/11/2026, si applica dal 27/09/2026. Non ci sono messaggi ambientali o di sostenibilità, quindi non è applicabile.
- Per i rilievi sui messaggi comparativi falsi (R3, R5) la biblioteca non ha una scheda e non ho accesso al web: le norme vanno verificate con la revisione legale umana.

## Domande aperte

1. M1, M3 e M5 sono già online (home, pubblicità, Instagram, LinkedIn)? Se sì, toglierli diventa urgente.
2. Il segmento 2027 resta il locale singolo da 3-40 dipendenti o l'utente vuole puntare sui gruppi? La decisione cambia il canale.
3. Qual è l'importo del budget del primo semestre 2027?
4. Trattoria Il Ponte ha dato il consenso a essere citata? Quando è stata fatta l'intervista?
5. Quale data realistica di rilascio dello scambio conferma il Product Manager, e come si risolvono la dipendenza da App 2.0 e la contraddizione fra R3 e R4 del PRD?

## Passaggi di consegne proposti (da confermare con l'utente)

- Product Manager e Roadmap: data di rilascio, capacità della squadra A in Q1, dipendenza invertita da App 2.0, contraddizioni nel PRD (R3/R4, R5 rispetto al fuori perimetro).
- Market Research: quote di mercato su base omogenea (locali) e la frase «secondo dopo Orarix» in sintesi-mercato.md r.25.
- Growth & Monetization: allocazione dei canali per CAC e la proposta di imbuto.md r.36.
- Privacy & Compliance: verifica dei fornitori per M6 e consenso per le testimonianze nominative.
- Revisione legale umana: i messaggi comparativi M1 e M5.

Tutto quanto sopra è una proposta: nessun messaggio, budget o data cambia senza la conferma dell'utente.

— MIRACH (AIBPD-08)
