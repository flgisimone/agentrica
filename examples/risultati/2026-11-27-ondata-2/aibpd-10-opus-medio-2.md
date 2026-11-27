AIBPD-10 · RASALHAGUE — Senior Business Development Manager, reparto AIBPD (AI Business & Product Development)

Non ho potuto caricare AIBPD-01 · ALDERAMIN perché non ho il tool `agent`. Il rapporto va quindi a te, e il direttore può riesaminarlo. Ho lavorato in sola lettura su /private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-10-2: ho letto tutti i 19 file e non ho modificato nulla. Gli importi sono IVA esclusa, salvo dove indicato.

**Segnalazione P0 subito:** l'accordo con Cassa Facile, così com'è scritto, non va firmato a dicembre. Dà un'esclusiva nazionale per 10 anni senza recesso e senza obiettivi minimi a un rivenditore regionale che ha 3 commerciali.

## Esito
Tutti e due gli accordi, nel testo attuale, sono sfavorevoli a Turnio. La «Valutazione» (`partner/accordi.md:32`) ha errori di metodo:
- conta come clienti il bacino di contatti del partner;
- dichiara un costo di acquisizione nullo, mentre le commissioni sono proprio il costo di acquisizione.

Ho trovato tre tipi di problema:
- conflitti con canali che oggi rendono senza costi;
- un impegno sull'API incompatibile con la roadmap;
- per l'associazione, un'economia per locale vicina a zero o negativa.

Le schede della biblioteca (art. 17-bis e 54-bis del Codice del consumo, Dir. 2024/825) non si applicano qui: i clienti sono imprese (`README.md:12`), mentre quelle norme tutelano i consumatori. Per questo non le ho lette.

## Rilievi · Accordo 1, Cassa Facile

**R1 · P0 · Durata e recesso** (`partner/accordi.md:17`)
- **Clausola:** «5 anni, con rinnovo automatico per altri 5; nessun recesso anticipato».
- **Problema:** combinata con l'esclusiva (r.12) e l'assenza di obiettivi (r.13), vincola Turnio per 10 anni senza alcuna via d'uscita, anche se il partner non porta nessun cliente.
- **Modifica proposta:**
  - 2 anni, poi rinnovo annuale tacito;
  - recesso di ciascuna parte con 3 mesi di preavviso;
  - risoluzione se il partner non raggiunge gli obiettivi minimi (vedi R3) e in caso di cambio di controllo.

**R2 · P1 · Esclusiva nazionale sul canale dei rivenditori di cassa** (r.12)
- **Clausola:** Turnio non firma con altri rivenditori di cassa in tutta Italia.
- **Problema:** Cassa Facile opera solo in Emilia-Romagna (r.7), con 3 commerciali.
- **Conflitto con un canale esistente:**
  - i «Fornitori della cassa», al plurale, hanno portato 26 clienti a CAC 0 € con LTV a 12 mesi di 590 € (`crescita/imbuto.md:34`);
  - il 21% dei rispondenti al sondaggio ha conosciuto Turnio tramite il fornitore della cassa (`mercato/sondaggio-2026.md:15`).
- L'esclusiva chiude questo canale nel resto d'Italia, compreso il segmento del Nord e del Centro (`mercato/sintesi-mercato.md:29`).
- **Modifica proposta:** nessuna esclusiva, oppure un'esclusiva limitata all'Emilia-Romagna, per 12 mesi, rinnovabile solo se si raggiungono gli obiettivi.

**R3 · P1 · Nessun obiettivo minimo** (r.13)
- **Problema:** un'esclusiva senza contropartita.
- **Modifica proposta:** un numero minimo di clienti attivati per semestre, da concordare con Vendite. Se non si raggiunge, l'esclusiva decade.

**R4 · P1 · Base della commissione IVA compresa** (r.14)
- **Clausola:** «25% dell'importo incassato, IVA compresa».
- **Problema:** l'IVA non è ricavo di Turnio, quindi la commissione effettiva è il 30,5% del netto (25% × 1,22).
- **Calcolo:** ARPU attuale 21.630 / 412 = 52,50 €/mese (`README.md:10`):
  - con l'IVA: 52,50 × 1,22 × 25% × 12 = 192 € per locale;
  - sul netto: 157,50 €;
  - differenza: 34,65 € per locale.
- **Modifica proposta:** 25%, o meno, sull'imponibile effettivamente incassato, al netto di IVA, sconti, rimborsi e insoluti. Per gli annuali va precisato che la commissione si calcola sui 12 mesi di competenza.

**R5 · P1 · Clienti riconosciuti** (r.15)
- **Clausola:** «ogni cliente con sede in Emilia-Romagna … da qualunque canale arrivi».
- **Problema:** Turnio pagherebbe la commissione anche sui clienti diretti, da Google Ads, Instagram e referral nella regione della propria sede (Bologna). Non ci sono dati sulla quota di clienti in Emilia-Romagna: è una domanda aperta.
- **Conflitto già visibile in pipeline:**
  - Gruppo Portico compare due volte: D-03 diretta, sconto 15%, e P-07 partner Cassa Facile, sconto 20% (`vendite/pipeline.csv:4,12`);
  - tutte e due le righe sono nella previsione del primo trimestre 2027 (`vendite/previsione.md:26`).
- **Modifica proposta:** riconoscere solo i clienti registrati dal partner prima del contatto (codice partner o registrazione del lead nel CRM), con integrazione installata. In caso di conflitto prevale il primo che ha registrato il lead, e ogni conflitto si risolve per iscritto.

**R6 · P1 · API pubblica «da gennaio 2027»** (r.16)
- **Problema:** è incompatibile con la roadmap. L'API pubblica è in Q3, squadra B, 10 settimane, P2 (`roadmap/roadmap.md:29`).
- In Q1 la squadra B è già oltre la capacità: 6 + 8 = 14 settimane su 13 (r.21-22, capacità a r.13). Anche la squadra A è a 20 su 13 (r.19-20).
- P-07 e P-11 (`vendite/pipeline.csv:12-13`) dipendono da un'integrazione che non esisterà nel primo trimestre.
- **Modifica proposta:** l'integrazione si collega al rilascio dell'API, «entro 60 giorni dal rilascio, previsto in Q3 2027». Nel frattempo si usa l'esportazione CSV già prevista. Se il partner pretende gennaio, serve una decisione di roadmap dell'utente su cosa togliere al Q1 della squadra B.

**R7 · P2 · Integrazione installata dal partner, senza assistenza né responsabilità definite** (r.11)
- **Problema:** mancano SLA, chi dà il primo supporto, la responsabilità per i malfunzionamenti dell'integrazione e chi accede ai dati dei dipendenti dei clienti tramite API.
- **Modifica proposta:** definire queste voci nell'accordo. Per i ruoli privacy (art. 28) va fatto un passaggio di consegne alla Privacy & Compliance Agency.

## Rilievi · Accordo 2, Associazione Esercenti Riuniti

**R8 · P1 · Sconto 40% più commissione 30% del listino** (r.26-27)
- **Problema:** su 100 € di listino il socio paga 60 € e Turnio ne gira 30 all'associazione. Turnio tiene il 30% del listino, e la commissione vale il 50% dell'incassato.
- **Calcolo** (costi variabili 22% dal margine lordo 78%, `README.md:11`):

| Piano | Il socio paga | All'associazione | Resta a Turnio | Margine se i costi seguono l'incassato (22%) | Margine se i costi sono fissi per locale (22% × 52,50 = 11,55 €) |
|---|---|---|---|---|---|
| Pro (59 €) | 35,40 € | 17,70 € | 17,70 € | circa 9,90 €/mese | 6,15 €/mese |
| Base (29 €) | 17,40 € | 8,70 € | 8,70 € | circa 4,90 €/mese | −2,85 €/mese |

  Le due ultime colonne sono l'intervallo fra le due ipotesi sui costi.
- **Modifica proposta:** sconto del 15–20% per i primi 12 mesi, poi listino. Commissione del 10–15% sull'incassato netto, non sul listino, per al massimo 12–24 mesi per socio.

**R9 · P1 · Sconto «per tutta la durata dell'abbonamento» e commissione «ogni mese»** (r.26-27)
- **Problema:** non hanno un termine. Non è chiaro se sopravvivano al recesso a 3 mesi (r.28): Turnio potrebbe uscire dall'accordo e restare legata a sconti e commissioni a vita.
- **Modifica proposta:**
  - alla cessazione la commissione finisce;
  - lo sconto vale al massimo fino alla scadenza naturale del periodo concordato;
  - niente cumulo con l'annuale «10 mesi per 12» (`crescita/prezzi.md:12`) né con altre promozioni.

**R10 · P1 · Conflitto con l'obiettivo O3 (ARPU +10%) e con i clienti attuali**
- **Problema:** uno sconto del 40% permanente abbassa l'ARPU (`roadmap/roadmap.md:9`).
- I clienti attuali di Lombardia e Veneto che sono soci possono chiedere lo sconto, con cannibalizzazione del diretto.
- **Modifica proposta:** offerta valida solo per i nuovi clienti, con verifica dell'iscrizione al momento dell'abbonamento.

**R11 · P2 · Bacino sovrastimato**
- **Problema:** dei 4.200 soci, secondo F2 il 58% non ha dipendenti e solo il 31% è nel segmento 3–40 dipendenti (`mercato/fonti.md:8`). Il bacino reale è di circa 1.300 locali, assumendo che i soci si distribuiscano come la media nazionale (ipotesi da verificare).
- Il canale associativo non ha storico: non compare fra le fonti del sondaggio.
- **Modifica proposta:** un pilota di 6 mesi con un obiettivo di attivazioni prima delle condizioni definitive.

## Errori nella valutazione economica (`partner/accordi.md:32`)
1. **«Senza costo di acquisizione»** è falso. La commissione di Cassa Facile costa 157–192 € per locale (R4). È sopra il CAC di Google Ads (95 €) e di Instagram (150 €), e il canale «fornitori della cassa» oggi rende a 0 € (`crescita/imbuto.md:31-34`). In più c'è lo sviluppo dell'integrazione. Con la clausola di r.15 si pagano anche clienti non portati dal partner.
2. **900 e 4.200 sono bacini di contatto, non clienti.** Manca un tasso di conversione, e non ci sono dati per stimarlo.
3. **«Irrinunciabile»** non ha nessuna evidenza a sostegno. Il prezzo spiega il 22% degli abbandoni (`clienti/fidelizzazione.md:35`), ma questo non giustifica il 40% a vita.
4. **Mancano un conto per canale e l'effetto sul margine** (R8), e manca il confronto con i canali esistenti.

## Domande aperte
- Quanti degli attuali e dei nuovi clienti hanno sede in Emilia-Romagna (serve per l'esposizione di R5)?
- Dove ha sede Gruppo Portico, e chi possiede quell'opportunità?
- Quali sono i costi variabili per locale, fissi o proporzionali al prezzo? Servono per chiudere l'intervallo di R8.
- Quali altri rivenditori di cassa hanno portato i 26 clienti?
- Quale conversione attendono i due partner?
- L'utente intende anticipare l'API, e a scapito di cosa?

## Decisioni per l'utente
Sono raccomandazioni, non decisioni:
1. Rinviare la firma di Cassa Facile finché non sono corretti R1–R6.
2. Rinegoziare con l'associazione le clausole di R8–R10, o fare un pilota.
3. Dare il passaggio di consegne alla Privacy per l'integrazione via API e per la verifica dell'iscrizione dei soci.

Nessun contatto con i partner è stato fatto né va fatto senza l'ok dell'utente.

— RASALHAGUE (AIBPD-10)
