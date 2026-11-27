AIBPD-12 · DENEBOLA — Senior Product Portfolio & Roadmap Manager, reparto AIBPD (AI Business & Product Development)

# Revisione di roadmap e portafoglio di Turnio (sola lettura)

**Perimetro.** Ho letto tutta la cartella `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-12-1`: `roadmap/roadmap.md` e `roadmap/portafoglio.md`, confrontati con README, PRD, concetti, business case, prezzi, fidelizzazione, partner, lancio, posizionamento e mercato. Non ho modificato nessun file.

**Note di metodo.**
- Non ho potuto caricare AIBPD-01 · ALDERAMIN perché in questa sessione non c'è il tool `agent`. Il rapporto è quindi per lui e per l'utente.
- Non ho letto schede della biblioteca: le tre disponibili (riduzioni di prezzo, recesso online, Direttiva 2024/825) non riguardano la roadmap.
- Lavoro su Opus, quindi non serve un riesame per il modello.
- Il README dice che il progetto è una prova con dati inventati. Tutto quello che segue è un'analisi dei documenti, non dati di mercato.

## Sintesi esecutiva

La roadmap 2027 così com'è non si può eseguire:
- La squadra A è sovraccarica: in Q1 ha 20 settimane per 13 disponibili, e la seconda parte di Paghe Light non è in nessun trimestre.
- L'iniziativa P0 (Scambio dei turni) dipende da un'iniziativa messa dopo di lei e classificata P3.
- La data di lancio commerciale (1° febbraio) e un impegno contrattuale (API pubblica a gennaio per Cassa Facile) vengono prima dello sviluppo.
- Due iniziative fanno la stessa cosa, e altre due ricostruiscono funzioni che il listino vende già.
- Sul portafoglio ci sono tre decisioni rischiose:
  - la chiusura di Kiosk prima che esista un sostituto;
  - Paghe Light trattato come approvato, mentre il suo business case è sbagliato;
  - la proposta di investire nel concetto C, basata su un punteggio calcolato male.

I rilievi più gravi sono P1. Non ci sono P0.

## Mappa della capacità (roadmap.md righe 13 e 17–31)

| Squadra | Q1 | Q2 | Q3 | Q1–Q3 |
|---|---|---|---|---|
| A (13 sett./trim.) | 14+6 = **20/13** | 10/13 | 12/13 | 42/39, più circa 14 settimane della seconda parte di Paghe Light non pianificate, quindi **circa 56/39** |
| B | 6+8 = **14/13** | 8/13 | 10/13 | 32/39 |
| C | 9+4 = 13/13 | 6/13 | 12/13 | 31/39 |

## Rilievi

**DEN-01 · P1 · Capacità della squadra A in Q1 superata**
- Evidenza: `roadmap/roadmap.md` righe 19–20 mettono sulla squadra A 14 + 6 = 20 settimane in un trimestre da 13 (riga 13). Una sola iniziativa da 14 settimane non entra in un trimestre.
- `finanza/business-case.md` riga 21 stima Paghe Light in «squadra A per 6 mesi e mezzo», cioè circa 28 settimane. La roadmap pianifica solo la «prima parte» e la seconda non compare in nessun trimestre, mentre A è già impegnata in Q2 e Q3 (righe 25 e 30).
- Correzione: mettere in roadmap la stima intera di Paghe Light, oppure toglierla dal 2027 (vedi DEN-08). Spostare il Report del costo del lavoro (vedi DEN-06). Non superare 13 settimane per squadra in ogni trimestre.

**DEN-02 · P1 · Nessuna riserva e capacità lorda**
- Evidenza: `roadmap/roadmap.md` riga 13 conta «13 settimane per trimestre… senza riserva per i bug», cioè 52 settimane l'anno per squadra senza ferie (agosto, Natale), assenze e manutenzione.
- Correzione: pianificare sulla capacità netta, con una stima indicativa di 10–11 settimane per trimestre, e una riserva del 15–20% per bug e supporto. Il valore va confermato dal responsabile dello sviluppo.

**DEN-03 · P1 · Dipendenza invertita sull'iniziativa P0**
- Evidenza: `roadmap/roadmap.md` riga 25 mette lo Scambio dei turni in Q2, P0, «dipende da App dipendenti 2.0». La riga 28 mette App dipendenti 2.0 in Q3 con priorità P3.
- Anche il PRD è incoerente: R5 (riga 31 di `prodotto/prd-scambio-turni.md`) chiede le notifiche push, che la riga 43 dello stesso PRD dichiara fuori perimetro «perché arrivano con l'App dipendenti 2.0».
- C'è poi una seconda dipendenza non scritta in roadmap: il lancio dello scambio richiede che il pannello web gestisca le approvazioni (R4).
- Correzione: portare App dipendenti 2.0 in Q1 sulla squadra C, che ha 12 settimane e la capacità che si libera da Kiosk e dalle iniziative di DEN-10. Darle priorità P1 legata a O1 (vedi DEN-04). Lasciare lo Scambio dei turni dopo, oppure togliere R5 dalla prima versione.

**DEN-04 · P1 · Priorità di App dipendenti 2.0 non coerente con O1**
- Evidenza: la prima causa di abbandono è «i dipendenti non usano l'app» con il 41%, e solo il 22% dei dipendenti la usa ogni settimana (`clienti/fidelizzazione.md` righe 35–37). L'iniziativa che risponde a questa causa ha priorità P3 (`roadmap/roadmap.md` riga 28).
- Correzione: passarla a P1 su O1 (vedi la correzione di DEN-03).

**DEN-05 · P1 · Impegni presi prima dello sviluppo**
- Lancio commerciale: `marketing/lancio.md` riga 6 fissa il lancio dello scambio dei turni «dal 1° febbraio 2027» con campagna a pagamento. Il PRD (riga 4) dice «in sviluppo da gennaio 2027», ma la roadmap lo mette in Q2 (riga 25).
- Impegno con Cassa Facile: `partner/accordi.md` riga 16 promette «la sua API pubblica da gennaio 2027», mentre la roadmap la mette in Q3 (riga 29). Anche l'integrazione fra la cassa e i turni, oggetto dell'accordo (riga 11), non è pianificata.
- Correzione: fissare la data di lancio solo dopo il rilascio, con un'indicazione per fine Q1 o Q2 se si applica DEN-03.
- Per Cassa Facile, prima della firma di dicembre, l'utente deve scegliere fra due strade: (a) cambiare la clausola con la data reale; (b) anticipare in Q1 un'API minima sulla squadra B, togliendo altro dal trimestre.
- Lo stesso accordo contiene altre clausole rischiose, da girare all'agente business di riferimento e a un legale: esclusiva per tutta Italia, 5+5 anni senza recesso, compenso su tutti i clienti dell'Emilia-Romagna da qualunque canale.

**DEN-06 · P2 · Doppioni e funzioni già vendute**
- (a) Due iniziative per la stessa esportazione: `roadmap/roadmap.md` riga 21 («Esportazione delle presenze in CSV per il consulente», Q1 B) e riga 26 («Integrazione con il consulente del lavoro, esportazione… nel formato dei software paghe», Q2 B).
- (b) Funzioni già vendute come esistenti: `crescita/prezzi.md` riga 8 vende già nel Pro l'«esportazione per il consulente», e la riga 9 vende nel Plus il «report del costo del lavoro», che la roadmap (riga 20) deve ancora sviluppare.
- Correzione: unire (a) in un'unica iniziativa con un primo passo (CSV) e un secondo (formati paghe). Su (b), chiedere al product manager se le funzioni esistono già: se esistono, togliere le righe dalla roadmap; se non esistono, il listino promette funzioni che non ci sono e va corretto subito.

**DEN-07 · P2 · Iniziative collegate all'obiettivo sbagliato**
- Fatturazione annuale (riga 22, O3): l'annuale è «10 mesi pagati per 12» (`crescita/prezzi.md` riga 12), quindi il ricavo mensile di chi passa all'annuale cala del 16,7%.
- Portare gli annuali dal 22% al 60% abbassa l'ARPU di circa 0,38 × 16,7% ≈ 6%, cioè lavora contro O3 (ARPU +10%).
- La riga 18 di `crescita/prezzi.md` confonde incasso e ricavo («+20%»), cosa che il business case stesso esclude (riga 27).
- Correzione: collegare l'iniziativa a O1 (gli annuali abbandonano meno) e non a O3. Ricalcolare l'effetto sull'ARPU prima della campagna di gennaio.
- Altre iniziative:
  - Tema scuro (riga 24): P1 senza obiettivo. Proposta: P3 o backlog.
  - Notifiche WhatsApp (riga 23): collegate a O2 ma servono all'uso dell'app, quindi a O1. Si sovrappongono alle push di App 2.0: tenerne uno solo dei due canali.

**DEN-08 · P1 · Paghe Light pianificato prima dell'approvazione, con un business case sbagliato**
- Il portafoglio dice «Business case in approvazione» e allo stesso tempo «Investire nel 2027» (`roadmap/portafoglio.md` riga 7). La roadmap lo mette già in Q1 come P1 (riga 19). Il concetto B non è validato: `innovazione/concetti.md` righe 15–19 non hanno uno «Stato».
- Errori nel business case (`finanza/business-case.md`):
  - riga 20: i ricavi sono calcolati con il prezzo IVA inclusa (18,30 €) invece di 15 €;
  - riga 24: il totale dei costi è sbagliato, 96 + 40 + 24 = 160.000 € e non 140.000 €;
  - riga 10: la base di 600 locali contraddice l'obiettivo O2 di 520;
  - riga 12: l'abbandono dell'1% al mese contraddice il 23,8% (o più, vedi DEN-11) di `fidelizzazione.md`;
  - riga 31: l'LTV è calcolato sul prezzo e non sul margine (70%);
  - i ricavi assumono 210 locali per tutti i 12 mesi.
- Con i dati del documento il ricavo non supera 210 × 15 × 12 = 37.800 € e il risultato 2027 è al massimo circa −122.000 €.
- Il «nessun rischio rilevante» di `concetti.md` riga 19 non regge, per due motivi:
  - i consulenti del lavoro portano il 38% dei clienti (`mercato/sondaggio-2026.md` riga 15), e un modulo che li salta mette a rischio quel canale;
  - la riga 26 della roadmap va nella direzione opposta, cioè integrarsi con il consulente.
- È anche un'ipotesi, da verificare con un legale, che preparare i cedolini per terzi sia un'attività riservata.
- Correzione: in portafoglio scrivere «Da decidere» invece di «Investire». Togliere Paghe Light dalla roadmap finché non c'è un business case corretto e approvato e una validazione con comportamento reale (una preiscrizione, non un «compreresti?»). Solo dopo, l'utente sceglie fra Paghe Light e l'integrazione con il consulente: non conviene farle tutte e due.

**DEN-09 · P1 · Chiusura di Kiosk prima del sostituto**
- Evidenza: `roadmap/portafoglio.md` riga 6 fissa la dismissione al 31 dicembre 2026, fra 41 giorni.
- I 61 locali di Kiosk (il 14,8% della base) timbrano su tablet. La «nuova timbratura» arriva con App dipendenti 2.0 in Q3 (`roadmap/roadmap.md` riga 28), e i dipendenti oggi usano poco l'app (DEN-04).
- La roadmap non ha né la migrazione né il ritiro dei tablet in comodato. Si perdono 549 € di MRR (6.588 € l'anno) e cresce il rischio per O1 e O3.
- Il «Basso margine» della riga 6 non è sostenuto da numeri.
- Correzione: rinviare la dismissione a dopo il rilascio della nuova timbratura. Aggiungere un piano di migrazione (comunicazione, accompagnamento, ritiro dei tablet). Mettere nel portafoglio il margine di Kiosk calcolato. La decisione resta all'utente.

**DEN-10 · P2 · Gestione di più sedi: lavoro assegnato male e posizionamento anticipato**
- Analisi e realizzazione sono separate fra squadre diverse: l'analisi va alla squadra C, quella dell'app mobile (riga 27), mentre lo sviluppo va alla A (riga 30).
- Il posizionamento 2027 è già rivolto a «catene e gruppi con più locali» (`marketing/posizionamento.md` riga 5) e il 70% del budget va su LinkedIn (`marketing/lancio.md` riga 14).
- La funzione invece arriva a fine Q3, e il segmento dichiarato è il singolo locale da 3–40 dipendenti (README riga 3). Solo il 3% dei clienti è arrivato da LinkedIn (sondaggio riga 15).
- Correzione: affidare l'analisi al product manager insieme alla squadra A. Allineare posizionamento e budget a ciò che esiste nel primo semestre. Far decidere all'utente se il segmento 2027 cambia.

**DEN-11 · P2 · Obiettivi misurati male**
- O1 (riga 7): il tasso di partenza «23,8%» è 98/412, cioè diviso per la base di fine periodo (`clienti/fidelizzazione.md` riga 14). Diviso per la base iniziale è 98/330 = 29,7%, sulla base media 98/371 = 26,4%. Scendere sotto il 20% è più difficile di quanto sembra, eppure su O1 ci sono solo due iniziative, una delle quali P3.
- O2 (riga 8): servono +108 locali netti contro i +82 del periodo precedente. Con un abbandono del 25–30% servono circa 230 clienti nuovi contro 180, e la chiusura di Kiosk aggiunge rischio. Il business case usa 600 locali.
- O3 (riga 9): l'ARPU non è definito (piani soli o anche i moduli?) e manca il valore di partenza. Per i soli piani è 21.630 / 412 = 52,50 €. Lo sconto del 40% a vita ai soci dell'associazione (`partner/accordi.md` riga 26) e la campagna sugli annuali lo fanno scendere.
- Correzione:
  - scrivere per ogni obiettivo formula, valore di partenza e responsabile;
  - usare un'unica base di clienti per il 2027 in tutti i documenti;
  - verificare che ogni obiettivo abbia iniziative sufficienti.

**DEN-12 · P2 · Concetto C proposto in base a un calcolo sbagliato**
- Evidenza: `innovazione/concetti.md` riga 36 dà al concetto C un totale di 4,4, ma con i pesi dichiarati fa 5×0,4 + 2×0,3 + 3×0,3 = **3,5**: è l'ultimo, non il primo. La proposta della riga 38 («investire su C») non regge.
- La validazione prevista (riga 26, «interesse positivo») non ha una soglia.
- Il modello «Turnio assume formalmente il lavoratore» (riga 24) cambia la natura dell'azienda. È un'ipotesi da verificare con un legale che serva un'autorizzazione come agenzia per il lavoro.
- Correzione: correggere il totale e la proposta. Nel portafoglio (riga 8) lasciare «Da valutare», con una soglia di validazione misurabile e la verifica legale come condizione.

**DEN-13 · P3 · Uso di P0 nella roadmap**
- Evidenza: `roadmap/roadmap.md` riga 25 usa P0 come «prima delle priorità», mentre per il reparto P0 significa «bloccante, ci si ferma».
- Correzione: P1, e ordinare le iniziative per rango.

**DEN-14 · P3 · PRD dello scambio incoerente al suo interno (da girare al Product Manager)**
- R3 (lo scambio si approva da solo) contraddice R4 (il responsabile approva sempre).
- La metrica «5.000 scambi al mese» (riga 20) non ha una base di partenza e non è collegata all'obiettivo del 50% (riga 9).
- Correzione: scegliere fra R3 e R4 e collegare le metriche all'obiettivo.

## Roadmap proposta (alternativa, da confermare)

- **Q1**
  - Squadra A: Scambio dei turni (10 settimane) più riserva.
  - Squadra B: fatturazione annuale e, se l'utente sceglie l'opzione (b) di DEN-05, un'API minima per Cassa Facile.
  - Squadra C: App dipendenti 2.0 (12 settimane).
  - Kiosk resta attivo.
- **Q2**
  - Lancio dello scambio con le push.
  - Squadra A: Report del costo del lavoro, solo se non esiste già, e analisi della gestione di più sedi.
  - Squadra B: esportazione per il consulente unita (CSV più formati paghe).
  - Squadra C: migrazione dei clienti Kiosk alla nuova timbratura.
- **Q3**
  - Squadra A: Gestione di più sedi, **oppure** Paghe Light se approvato. Non c'è capacità per tutti e due.
  - Squadra B: API pubblica completa.
- **Backlog**: Tema scuro e WhatsApp (se le push bastano).

## Decisioni per l'utente

1. Cassa Facile, prima della firma di dicembre: correggere la data dell'API o anticiparla in Q1; rivedere esclusiva, durata e compenso.
2. La data di dismissione di Kiosk.
3. Paghe Light: fermarlo finché non c'è un business case corretto e approvato; poi scegliere fra Paghe Light e l'integrazione con il consulente.
4. Nel terzo trimestre, la squadra A fa Gestione di più sedi o Paghe Light.
5. La data di lancio dello scambio dei turni.
6. Il segmento 2027: singolo locale o gruppi.

## Domande aperte

- L'esportazione per il consulente e il report del costo del lavoro esistono già?
- Qual è la capacità netta reale delle squadre?
- Qual è la formula dell'ARPU in O3?
- Qual è il margine di Kiosk?

## Passaggi ad altri agenti

- Business & Financial Analyst: rifare il business case di Paghe Light.
- Product Manager: PRD dello scambio (DEN-14).
- Product Marketing: data di lancio e budget dei canali.
- Legale umano: cedolini per terzi, somministrazione di lavoro, clausole di Cassa Facile.

— AIBPD-12 · DENEBOLA
