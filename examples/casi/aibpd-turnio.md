# Caso AIBPD · turnio (F49, seconda ondata)

- **Agenti**: dieci specialisti AIBPD, ognuno con il suo compito sulla sua parte dei documenti: AIBPD-02 Market Research, 03 Product Innovation, 04 Product Manager, 06 Financial, 07 Growth & Monetization, 08 Product Marketing, 09 Sales & Revenue, 10 Business Development, 11 Customer Success, 12 Portfolio & Roadmap
- **Progetto**: [`progetti/turnio`](../progetti/turnio/), documenti di business di un'app per i turni dei locali: mercato, concetti, PRD, business case, prezzi e imbuto, posizionamento e lancio, pipeline, accordi con i partner, fidelizzazione, roadmap e portafoglio
- **Perché**: ruoli di analisi senza codice, come AIBPD-05 che è passato su Sonnet in F24, su difetti di contenuto che si vedono solo rifacendo un conto o confrontando due file: denominatori sbagliati, numeri che non tornano fra un documento e l'altro, promesse incompatibili con la roadmap, parti corrette che sembrano sospette.
- **Configurazioni**: Opus 5.5 effort medio e Sonnet 5.5, due esecuzioni ciascuna per ruolo. Nessun ruolo ha un risultato meccanico: niente Haiku.
- **Web**: i compiti non lo vietano (decisione dell'apertura di F49). Il risultato dice quali esecuzioni l'hanno usato. Un dato preso dal web che contraddice i dati inventati del progetto non conta come falso se il rapporto lo presenta come confronto esterno.

## Compiti (argomento `task`, da copiare così come sono)

| Agente | Compito |
|---|---|
| AIBPD-02 | Rivedi in sola lettura l'analisi di mercato in `mercato/` (sintesi, fonti, sondaggio, concorrenti) e riporta gli errori di metodo, di calcolo e di fonte, con file, punto del documento e correzione proposta. |
| AIBPD-03 | Valuta in sola lettura i tre concetti di `innovazione/concetti.md` e la matrice di scelta, con i dati di `mercato/`: riporta ipotesi non verificabili, validazioni deboli, rischi non considerati ed errori nella scelta, con il punto del documento e la correzione proposta. |
| AIBPD-04 | Rivedi in sola lettura il PRD `prodotto/prd-scambio-turni.md` rispetto al concetto validato e ai dati di `clienti/` e `roadmap/`: riporta obiettivi e metriche deboli, requisiti in contraddizione, vincoli mancanti e rischi non gestiti, con il punto del documento e la correzione proposta. |
| AIBPD-06 | Verifica in sola lettura il business case `finanza/business-case.md` con i dati degli altri documenti: riporta errori di calcolo, ipotesi incoerenti con le fonti ed errori di metodo nelle metriche, con il punto del documento, il conto corretto e l'effetto sulla conclusione. |
| AIBPD-07 | Rivedi in sola lettura prezzi, imbuto, esperimenti e canali in `crescita/`: riporta metriche calcolate male, esperimenti non affidabili, problemi nella struttura dei prezzi e proposte basate su dati sbagliati, con il punto del documento e la correzione proposta. |
| AIBPD-08 | Rivedi in sola lettura posizionamento, messaggi e piano di lancio in `marketing/` rispetto ai dati di prezzi, concorrenti, sondaggio e roadmap: riporta affermazioni non sostenute o false, incoerenze con il prodotto e scelte di pubblico e canale non motivate dai dati, con il punto del documento e la correzione proposta. |
| AIBPD-09 | Rivedi in sola lettura la pipeline `vendite/pipeline.csv` e la previsione `vendite/previsione.md` rispetto alle regole scritte nella previsione: riporta errori di previsione e di copertura, opportunità da correggere e violazioni delle regole, con l'id dell'opportunità o il punto del documento e la correzione proposta. |
| AIBPD-10 | Valuta in sola lettura i due accordi di `partner/accordi.md` con i dati degli altri documenti: riporta clausole sfavorevoli o rischiose, conflitti con gli altri canali, impegni incompatibili con la roadmap ed errori nella valutazione economica, con la clausola e la modifica proposta. |
| AIBPD-11 | Rivedi in sola lettura i dati di fidelizzazione in `clienti/` (abbandono, NRR, coorti, NPS, salute dei clienti, primo utilizzo): riporta metriche calcolate male, campioni distorti e indicatori che non misurano i rischi veri, con il punto del documento, il conto corretto e la correzione proposta. |
| AIBPD-12 | Rivedi in sola lettura la roadmap e il portafoglio in `roadmap/` rispetto agli obiettivi, alla capacità e agli impegni presi negli altri documenti: riporta problemi di capacità, dipendenze, priorità, doppioni e decisioni di portafoglio rischiose, con la riga e la correzione proposta. |

## AIBPD-02 · Market Research

| # | Difetto | Dove |
|---|---|---|
| R1 | TAM e SAM con il prezzo del piano Plus (99 €) per tutti i locali, motivato con «i clienti crescono verso Plus»; il mix reale (Base 190, Pro 170, Plus 52) dà circa 52 € di MRR medio | `sintesi-mercato.md`, «Dimensione» |
| R2 | Il SAM conta tutti i locali del Nord e del Centro, anche il 58% senza dipendenti e quelli fuori dal segmento 3–40 dipendenti (31%), che la stessa sintesi indica come segmento | `sintesi-mercato.md`, «Dimensione» e «Segmento»; `fonti.md` F2 |
| R3 | Il numero dei locali viene dal censimento del 2019 (198.000), prima della pandemia, mentre c'è il dato di giugno 2026 (176.000) | `sintesi-mercato.md`; `fonti.md` F1, F2 |
| R4 | La disponibilità a pagare «del mercato» viene da un sondaggio ai soli clienti attuali (che già pagano 29–99 €), con 74 risposte su 412 e un buono in cambio | `sintesi-mercato.md`, «Disponibilità a pagare»; `sondaggio-2026.md` |
| R5 | Crescita annua composta sbagliata: da 0,8 a 1,4 miliardi in tre anni è circa il 20,5%, non il 32%; inoltre la spesa in tutto il software gestionale è presa come andamento del mercato dei turni senza prova | `sintesi-mercato.md`, «Crescita» |
| R6 | Quote di mercato con unità diverse: gli «utenti» di Orarix sono dipendenti (circa 2.300 locali), gli altri sono locali; la quota del 91,5% e quella di Turnio al 2,1% non hanno senso | `concorrenti.md`, «Quote di mercato» |
| R7 | «Turnio è secondo per numero di locali» è falso: Planora ha 900 locali, Turnio 412 (e Orarix circa 2.300) | `sintesi-mercato.md`, «Concorrenza» |

## AIBPD-03 · Product Innovation

| # | Difetto | Dove |
|---|---|---|
| I1 | Ipotesi del concetto C non verificabile («i ristoratori vorranno…») e criterio di validazione indefinito («l'interesse è positivo»), senza soglia né comportamento da misurare | `concetti.md`, C |
| I2 | Validazione di B con la sola domanda di intenzione («lo compreresti?») a 20 clienti: nessuna prova di comportamento (preordine, pagina con prezzo, pilota a pagamento) | `concetti.md`, B |
| I3 | B dichiarato «senza rischi rilevanti»: elaborare i cedolini per conto dei clienti è un'attività riservata ai consulenti del lavoro (L. 12/1979) o va fatta con un professionista abilitato | `concetti.md`, B «Rischi» |
| I4 | B mette Turnio in concorrenza con i consulenti del lavoro e i commercialisti, il primo canale di acquisizione (38% nel sondaggio) | `concetti.md`, B; `sondaggio-2026.md` |
| I5 | C è somministrazione di lavoro (Turnio assume il lavoratore e lo fattura al locale): serve l'autorizzazione delle agenzie per il lavoro (D.Lgs. 276/2003), con requisiti di capitale e garanzie; non è considerato | `concetti.md`, C |
| I6 | Totale di C sbagliato: 5×0,4 + 2×0,3 + 3×0,3 = 3,5, non 4,4; l'ordine corretto è A, B, C e la proposta di investire su C cade | `concetti.md`, «Matrice di scelta» |

## AIBPD-04 · Product Manager

| # | Difetto | Dove |
|---|---|---|
| P1 | Obiettivo «−50% delle assenze non coperte» senza un valore di partenza e senza una metrica che lo misuri: nessuna delle metriche di successo è sulle assenze coperte | «Obiettivo», «Metriche di successo» |
| P2 | Metriche di attività, non di esito: «scambi proposti al mese» cresce anche se nessuno scambio va a buon fine; manca la quota di assenze coperte (l'ipotesi validata del concetto A) | «Metriche di successo» |
| P3 | R3 (approvazione automatica quando entrambi accettano) contraddice R4 (il responsabile approva sempre) | R3, R4 |
| P4 | R5 chiede le notifiche push, che sono «fuori perimetro» fino all'App dipendenti 2.0 | R5, «Fuori perimetro» |
| P5 | «Nessun vincolo sugli orari»: uno scambio può violare il riposo di 11 ore consecutive (D.Lgs. 66/2003, art. 7) o i limiti di orario del contratto; serve un controllo | «Vincoli» |
| P6 | Rischio non gestito: lo scambio dipende dai dipendenti nell'app, che oggi la usano al 22% (e «i dipendenti non usano l'app» è il primo motivo di abbandono); nei rischi c'è solo l'approvazione dei responsabili | «Rischi»; `clienti/fidelizzazione.md` |

## AIBPD-06 · Financial

| # | Difetto | Dove |
|---|---|---|
| F1 | Ricavi con l'IVA: 18,30 € invece di 15 €; l'IVA non è un ricavo | «Conto economico 2027» |
| F2 | Ricavi senza rampa: 210 locali per 12 mesi, ma 210 è l'adozione a fine anno; con una crescita lineare i ricavi sono circa la metà | «Conto economico 2027» |
| F3 | Abbandono dell'1% al mese «come per Turnio» (12% l'anno): `fidelizzazione.md` dice 23,8% (e il conto giusto è circa 29,7%), cioè 2–3% al mese | «Ipotesi»; `clienti/fidelizzazione.md` |
| F4 | Totale dei costi sbagliato: 96.000 + 40.000 + 24.000 = 160.000 €, non 140.000; il risultato è −113.884 € con i ricavi del documento | «Conto economico 2027» |
| F5 | LTV sui ricavi invece che sul margine: con il 70% di margine è 15 × 0,7 / 1% = 1.050 €, e con l'abbandono reale molto meno; LTV/CAC 8,3 è gonfiato | «Valore del cliente» |
| F6 | Recupero del CAC in 8 mesi impossibile: 180 / 15 = 12 mesi sui ricavi, circa 17 sul margine (10,50 € al mese) | «Valore del cliente» |
| F7 | 600 clienti a fine 2027 contro l'obiettivo di 520 di `roadmap.md` e `previsione.md` | «Ipotesi» |

## AIBPD-07 · Growth & Monetization

| # | Difetto | Dove |
|---|---|---|
| G1 | «Conversione dalla prova al pagamento 20%» è sulle prove attivate (180/900); sulle prove avviate è il 12% (180/1.500), sotto la media citata | `imbuto.md`, «Imbuto» |
| G2 | Test A/B non affidabile: risultato guardato ogni giorno e fermato appena «significativo» (peeking), 35 contro 41 prove: la differenza non è significativa (p circa 0,4) | `imbuto.md`, «Esperimenti» |
| G3 | Il recinto fra Pro e Plus non regge: un locale con 26–40 dipendenti paga su Pro 59 + 2 € per dipendente in più, al massimo 89 €, meno dei 99 € di Plus | `prezzi.md` |
| G4 | «Più annuali, ricavi +20%» è falso: l'annuale riduce il ricavo per cliente del 16,7% (10 mesi pagati su 12); anticipa la cassa, non i ricavi | `prezzi.md`, «Proposta per il 2027» |
| G5 | CAC zero per referral e fornitori della cassa: il referral regala un mese a chi invita e a chi è invitato (circa 105 € per cliente), i fornitori della cassa avranno il 25% dei primi 12 mesi (`partner/accordi.md`) | `imbuto.md`, «Canali» |
| G6 | LTV a 12 mesi di Instagram «stimata dai primi tre mesi» su 14 clienti, usata per spostare metà del budget: dato non ancora osservato | `imbuto.md`, «Canali» e «Proposta» |

## AIBPD-08 · Product Marketing

| # | Difetto | Dove |
|---|---|---|
| K1 | «Il gestionale dei turni più usato» è falso (Orarix circa 2.300 locali, Planora 900, Turnio 412): pubblicità ingannevole (D.Lgs. 145/2007) | `posizionamento.md` M1; `mercato/concorrenti.md` |
| K2 | «Risparmia 5 ore a settimana» sostenuto da un solo cliente; il sondaggio dà una mediana di 3 ore (da 4 a 1) | `posizionamento.md` M2 e «Prove a sostegno»; `mercato/sondaggio-2026.md` |
| K3 | «Gratis per sempre fino a 3 dipendenti»: non esiste un piano gratuito, solo la prova di 30 giorni | `posizionamento.md` M3; `crescita/prezzi.md` |
| K4 | Confronto falso: «Orarix non ha l'app per i dipendenti», che Orarix ha dal 2025; una pubblicità comparativa non veritiera (D.Lgs. 145/2007, art. 4), ed è anche il punto di differenza della frase di posizionamento | `posizionamento.md` M5 e «Frase di posizionamento»; `mercato/concorrenti.md` |
| K5 | Pubblico sbagliato: catene e gruppi con più sedi, ma la gestione di più sedi arriva nel Q3 2027 e i clienti sono locali singoli | `posizionamento.md`, «Per chi»; `roadmap/roadmap.md` |
| K6 | Lancio dello scambio dei turni il 1° febbraio 2027, ma l'iniziativa è nel Q2 2027 (e dipende dall'App dipendenti 2.0) | `lancio.md`; `roadmap/roadmap.md` |
| K7 | 70% del budget su LinkedIn, che porta il 3% dei clienti nel sondaggio; i canali veri sono consulenti e commercialisti (38%), fornitori della cassa (21%) e Instagram (17%) | `lancio.md`, «Budget dei canali»; `mercato/sondaggio-2026.md` |

## AIBPD-09 · Sales & Revenue

| # | Difetto | Dove |
|---|---|---|
| S1 | Previsione Q1 non pesata: 18.584 € a valore pieno contro la regola della somma pesata; pesata, senza il doppione, è circa 7.600 € su Proposta e Negoziazione (circa 8.100 € con tutte le fasi), sotto la quota di 8.000 € | `previsione.md`, «Primo trimestre 2027» |
| S2 | Gruppo Portico contato due volte: D-03 (diretta) e P-07 (partner), stessi 4 locali | `pipeline.csv` D-03, P-07 |
| S3 | D-04 in Demo con probabilità 70%, contro il 30% della regola | `pipeline.csv` D-04 |
| S4 | D-05 con chiusura prevista il 30 settembre 2026, passata, ancora aperta e contata nell'atteso del Q4 | `pipeline.csv` D-05; `previsione.md`, Q4 |
| S5 | D-06 con il 35% di sconto senza l'approvazione del CEO nelle note | `pipeline.csv` D-06 |
| S6 | Copertura gonfiata: la «pipeline totale» comprende i firmati, le opportunità del Q4 e il doppione; le sole aperte del Q1 senza doppione sono 17.014 €, circa 2,1× | `previsione.md`, «Copertura» |

## AIBPD-10 · Business Development

| # | Difetto | Dove |
|---|---|---|
| B1 | Compenso di Cassa Facile calcolato sull'incassato «IVA compresa»: la base deve essere l'imponibile | Accordo 1, «Compenso» |
| B2 | Esclusiva nazionale sul canale dei rivenditori di cassa a un rivenditore regionale con 3 commerciali, senza obiettivi minimi: blocca un canale che porta il 21% dei clienti | Accordo 1, «Territorio», «Obiettivi»; `mercato/sondaggio-2026.md` |
| B3 | Ogni cliente dell'Emilia-Romagna «da qualunque canale» dà il compenso al partner: Turnio paga il 25% anche sulle vendite dirette nella sua regione (sede a Bologna); manca una registrazione delle opportunità (è anche la causa del doppione Gruppo Portico) | Accordo 1, «Clienti riconosciuti» |
| B4 | API pubblica promessa da gennaio 2027, mentre la roadmap la mette nel Q3 2027 | Accordo 1, «Integrazione»; `roadmap/roadmap.md` |
| B5 | 5 anni con rinnovo automatico per altri 5 e nessun recesso, neanche per inadempimento o risultati mancati | Accordo 1, «Durata» |
| B6 | Accordo 2 quasi in perdita: 40% di sconto per sempre più il 30% del listino all'associazione lasciano il 30% del listino (17,70 € su Pro), poco sopra il costo di servizio (circa il 22% del listino, 13 €); il compenso è sul listino e non sull'incassato | Accordo 2 |
| B7 | «Senza costo di acquisizione» con Cassa Facile è falso: il 25% dei primi 12 mesi vale tre mesi di ricavo per cliente | «Valutazione» |

## AIBPD-11 · Customer Success

| # | Difetto | Dove |
|---|---|---|
| C1 | Abbandono diviso per i clienti di fine periodo (98/412 = 23,8%); su quelli di inizio è il 29,7% (98/330) | `fidelizzazione.md`, «Clienti e abbandoni» |
| C2 | NRR senza i clienti persi al denominatore: 15.020 / 17.200 = 87%, non 108%; la conclusione «la base cresce senza clienti nuovi» è falsa | `fidelizzazione.md`, «NRR» |
| C3 | NPS sbagliato: (52 − 8) / 74 = 59, non 61 | `fidelizzazione.md`, «NPS» |
| C4 | NPS solo ai clienti con più di sei mesi: esclude i nuovi e chi è già andato via, il campione è distorto verso i soddisfatti | `fidelizzazione.md`, «NPS» |
| C5 | Ritenzione a 6 mesi senza la coorte di marzo, la peggiore: con lei è circa l'80% (78/98), non l'87% | `fidelizzazione.md`, «Coorti»; `coorti.csv` |
| C6 | Il punteggio di salute non misura il primo motivo di abbandono: l'uso dell'app da parte dei dipendenti (41% delle uscite, 22% di uso) non c'è; il 40% va agli accessi del titolare | `fidelizzazione.md`, «Salute dei clienti» e «Motivi dell'abbandono» |
| C7 | Attivazione definita come «account creato ed email confermata» (97%), mentre l'imbuto la definisce con almeno un turno pubblicato (60%): la conclusione «non richiede interventi» è sbagliata | `fidelizzazione.md`, «Primo utilizzo»; `crescita/imbuto.md` |

## AIBPD-12 · Portfolio & Roadmap

| # | Difetto | Dove |
|---|---|---|
| RM1 | Q1 oltre la capacità: 47 settimane su 39 (squadra A 20 su 13, B 14 su 13), senza riserva per i bug | `roadmap.md`, Q1 e «Capacità» |
| RM2 | Lo scambio dei turni (Q2) dipende dall'App dipendenti 2.0, pianificata nel Q3 | `roadmap.md`, Q2 e Q3 |
| RM3 | L'App dipendenti 2.0 è P3, ma serve a O1: il primo motivo di abbandono è che i dipendenti non usano l'app (41%) | `roadmap.md`; `clienti/fidelizzazione.md` |
| RM4 | Tema scuro P1 senza alcun obiettivo collegato, sopra iniziative legate agli obiettivi | `roadmap.md`, Q1 |
| RM5 | Doppione: l'esportazione delle presenze per il consulente (Q1, B) e l'integrazione con il consulente (Q2, B) hanno lo stesso perimetro | `roadmap.md`, Q1 e Q2 |
| RM6 | Kiosk dismesso il 31 dicembre 2026 con 61 locali attivi, senza piano di migrazione né comunicazione; la nuova timbratura arriva solo con l'App dipendenti 2.0 nel Q3 2027 | `portafoglio.md`; `roadmap.md` |
| RM7 | Impegni presi fuori dalla roadmap e incompatibili: API pubblica a gennaio per Cassa Facile (in roadmap nel Q3) e lancio dello scambio dei turni a febbraio (in roadmap nel Q2) | `partner/accordi.md`; `marketing/lancio.md`; `roadmap.md` |

## Trappole: parti corrette da non segnalare come difetto

| # | Cosa | Perché è corretta | Ruoli |
|---|---|---|---|
| T1 | ARR = MRR × 12, con gli annuali al loro equivalente mensile | definizione usuale dell'ARR | tutti |
| T2 | Prezzi IVA esclusa | i clienti sono imprese | AIBPD-06, 07, 08 |
| T3 | MRR del mix: 5.510 + 10.030 + 5.148 + 942 = 21.630 € | il conto torna | AIBPD-02, 06, 07 |
| T4 | Margine del modulo 70% con 4,50 € di costo su 15 € | (15 − 4,50) / 15 = 70% | AIBPD-06 |
| T5 | Sviluppo fuori dal margine lordo; ricavi degli annuali riconosciuti mese per mese | prassi corretta | AIBPD-06 |
| T6 | Validazione del concetto A con un prototipo e la misura delle assenze coperte prima e dopo | prova di comportamento con una soglia | AIBPD-03, 04 |
| T7 | Segmento 3–40 dipendenti al 31% dalla fonte del 2026 | dato aggiornato e coerente con il prodotto | AIBPD-02 |
| T8 | Gestione delle paghe e scambi fra locali fuori dal perimetro del PRD | perimetro voluto | AIBPD-04 |
| T9 | Atteso del Q4 pesato per la probabilità (il difetto è D-05) | segue la regola | AIBPD-09 |
| T10 | D-03 con il 15% di sconto senza approvazione | sotto la soglia del 20% | AIBPD-09 |
| T11 | Valori della pipeline al netto dello sconto (es. D-08: 9 × 1.188 × 0,9 = 9.623 €) | il conto torna e la regola lo dice | AIBPD-09 |
| T12 | Compenso di Cassa Facile solo per i primi 12 mesi di ogni cliente | limite voluto, a favore di Turnio | AIBPD-10 |
| T13 | Accordo con l'associazione di 2 anni con recesso a 3 mesi | durata e uscita ragionevoli | AIBPD-10 |
| T14 | Il mancato pagamento conta come abbandono | abbandono involontario, va contato | AIBPD-11 |
| T15 | Colonne vuote delle coorti | periodo non completo per tutti i clienti della coorte | AIBPD-11 |
| T16 | «Prova Pro 30 giorni, senza carta» e «I tuoi dati restano in Italia» | coerenti con prezzi e hosting | AIBPD-08 |
| T17 | Q4 «da definire»; la gestione di più sedi nel Q3 dopo la sua analisi nel Q2 | rinvio voluto, ordine giusto | AIBPD-12 |

Un rilievo che presenta una trappola come difetto conta come **falso**; un consiglio di irrobustimento su di essa no.

## Accettabili ma non richiesti

Non contano come falsi né come extra validi.

- **AIBPD-02**: SOM del 5% senza motivazione o lontano dal piano di 520 locali; fonti dell'Osservatorio non verificabili; sondaggio senza domanda sulla concorrenza.
- **AIBPD-03**: concetto A già nel PRD mentre la matrice lo rimette in scelta; pesi della matrice non motivati; nessun dimensionamento economico di C.
- **AIBPD-04**: PRD «in sviluppo da gennaio» mentre la roadmap lo mette nel Q2; piano Base che vede lo scambio senza usarlo; conservazione di 24 mesi senza motivo; nessun criterio di accettazione per requisito.
- **AIBPD-06**: «pareggio nel 2028» senza un conto del 2028; 1% al mese non è esattamente il 12% l'anno; nessuno scenario o analisi di sensibilità; costo del supporto senza dettaglio.
- **AIBPD-07**: media del settore senza fonte; LTV a 12 mesi dei canali senza margine; prova senza carta che gonfia le prove avviate.
- **AIBPD-08**: misure del lancio solo di attività; messaggio del lancio troppo forte («si coprono da sole»); nessun messaggio per i dipendenti.
- **AIBPD-09**: D-03 e D-08 su catene con più sedi, che il prodotto non gestisce ancora; obiettivo di 520 locali senza piano per arrivarci; nessuna data dell'ultimo contatto.
- **AIBPD-10**: nessuna clausola sui dati dei clienti fra le parti; obiettivi dell'associazione non definiti; nessuna verifica dei 900 clienti di Cassa Facile.
- **AIBPD-11**: soglia di 40 del punteggio non motivata; coorti piccole; tasso di risposta dell'NPS basso; nessun piano per i clienti sotto soglia.
- **AIBPD-12**: Paghe Light in roadmap prima dell'approvazione del business case; nessuna squadra per Personale extra; nessun criterio di uscita per Kiosk; MRR di Kiosk a parte da quello dei piani.

## Regole di conteggio

Quelle del [README](../README.md#come-si-conta). Ogni esecuzione si conta solo sulla tabella del suo ruolo: un difetto di un altro ruolo trovato in più non è extra valido ma accettabile. Nessuna regola in più per i conti rifatti nel rapporto (decisione dell'apertura di F49).

## Chiarimenti dopo la seconda ondata (F49)

Decisi con l'utente il 2026-11-27, dopo i conteggi di [2026-11-27-ondata-2.md](../risultati/2026-11-27-ondata-2.md). Valgono per le esecuzioni successive; i conteggi di F49 restano quelli dei file di `conteggi/`.

- **T6.** La trappola è il tipo di prova: un comportamento misurato con una soglia, non un'intenzione. Una critica alla sua dimensione o al disegno (8 locali per due settimane, prototipo cliccabile, nessun gruppo di controllo, «6 su 8» per locale invece che sull'insieme) è accettabile per AIBPD-03 e 04, non falso. Resta falso dire che A non ha una validazione di comportamento.
- **C1.** L'abbandono corretto come 81/330 = 24,5% (clienti di inizio periodo persi) vale come 98/330 = 29,7%: il difetto è il denominatore di fine periodo.
- **Accettabili aggiunti** (problemi veri trovati da tutti o quasi i rapporti di un ruolo):
  - **AIBPD-02**: fasce della domanda sul prezzo che si sovrappongono a 59 €; percentuali dei canali non ottenibili con 74 risposte.
  - **AIBPD-03**: Orarix e Shiftella hanno già lo scambio, quindi A porta alla parità; valore 5 di C senza evidenze; il cedolino di B chiede dati che Turnio non ha; lato dei lavoratori di C non validato.
  - **AIBPD-04**: R6 non mitiga il rischio dei responsabili che non approvano; metrica del 60% senza denominatore; nota libera con possibili dati sulla salute; cessione o scambio del turno non chiaro; chiusura a 2 ore contro l'ipotesi a più di 4 ore.
  - **AIBPD-06**: costo del fornitore (4,50 €) assente dal conto economico; adozione del 35% senza base; 6,5 mesi di sviluppo che la roadmap non ha.
  - **AIBPD-07**: lo spostamento su Instagram è sbagliato anche con i dati del documento (LTV/CAC 5,5 contro 4,3); Base a 25 dipendenti costa quanto Pro; MRR con gli annuali a listino invece che all'equivalente mensile.
  - **AIBPD-08**: «fa tutto dal telefono» contro l'approvazione dal pannello web; testimonial firmato da 8 giorni; Google al 7% nel sondaggio contro 100 clienti su 180 nell'imbuto; budget senza importo.
  - **AIBPD-09**: previsione concentrata su D-08, che chiude l'ultimo giorno del trimestre; P-07 e P-11 dipendono da un accordo non firmato.
  - **AIBPD-10**: sconto e compenso dell'associazione che durano oltre l'accordo; soci già clienti non esclusi; 900 e 4.200 sono platea, non clienti; cumulo con l'annuale e perimetro del «listino» non definiti; compenso di Cassa Facile senza storno.
  - **AIBPD-11**: `coorti.csv` non torna con il bilancio dei clienti; 98 risposte su 98 clienti persi al questionario di uscita; abbandono da dividere fra mensili e annuali.
  - **AIBPD-12**: seconda parte di Paghe Light in nessun trimestre; esportazione per il consulente e report del costo del lavoro già venduti in Pro e Plus; notifiche WhatsApp e push dell'App 2.0 come doppione.
