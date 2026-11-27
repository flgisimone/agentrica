AIBPD-10 · RASALHAGUE — Senior Business Development Manager, reparto AIBPD (AI Business & Product Development)

# Valutazione degli accordi Cassa Facile e Associazione Esercenti Riuniti (Turnio, dicembre 2026)

Sola lettura su `partner/accordi.md`, incrociato con `README.md`, `roadmap/roadmap.md`, `roadmap/portafoglio.md`, `crescita/prezzi.md`, `crescita/imbuto.md`, `vendite/pipeline.csv`, `vendite/previsione.md`, `mercato/fonti.md`, `marketing/posizionamento.md` e `finanza/business-case.md`. Non ho contattato nessuno e non ho modificato file. Le cifre che sono mie stime sono indicate come tali.

## 1. Sintesi

**Raccomandazione:** non firmare Cassa Facile così com'è (P0). Firmare l'Associazione solo dopo aver rivisto sconto e compenso (P1).

- **Cassa Facile:** blocca Turnio per 10 anni senza vincoli per il partner. Promette un'API a gennaio 2027, ma la roadmap la mette nel Q3. Il compenso del 25% si paga anche sui clienti arrivati da altri canali.
- **Associazione:** sconto del 40% e compenso del 30% sul listino lasciano a Turnio circa il 30% del listino e circa l'8% di margine, contro il 78% normale.
- **Valutazione economica del documento:** presenta «senza costo di acquisizione» e «offerta irrinunciabile» come vantaggi. Sono i due punti più contestabili (rilievi 1 e 11).

Il riesame del direttore AIBPD-01 o di un revisore su Opus è consigliato prima che i rilievi P0/P1 diventino definitivi: lavoro su un modello più piccolo di quello della sessione.

## 2. Cassa Facile S.r.l.

Fatti dal documento: 3 commerciali, circa 900 locali clienti, solo Emilia-Romagna.

**1. Durata ed esclusiva senza contropartite · P0**
- *Clausole:* «Esclusiva per tutta Italia… Turnio non firma accordi con altri rivenditori di cassa», «Nessun obiettivo minimo», «5 anni, con rinnovo automatico per altri 5; nessun recesso anticipato per nessuna delle parti».
- *Rischio:* un partner regionale con 3 commerciali blocca un canale nazionale per 10 anni.
  - Non ha obiettivi minimi e non ha penali.
  - Non è vincolato a non proporre Orarix, che ha già due integrazioni con software paghe (`mercato/concorrenti.md`). L'esclusiva è quindi a senso unico.
  - Il recesso escluso vale anche in caso di inadempimento: da far valutare al legale.
  - Un vincolo decennale pesa in una due diligence degli investitori (la sintesi di mercato è «per gli investitori»).
- *Modifica proposta:*
  - Durata iniziale 2 anni, senza rinnovo automatico, con rinnovo solo su obiettivi raggiunti.
  - Esclusiva limitata all'Emilia-Romagna, oppure condizionata a un minimo di clienti attivati per semestre.
  - Perdita dell'esclusiva se non si raggiunge il minimo.
  - Recesso con 90 giorni di preavviso e recesso immediato per inadempimento.
  - Vincolo reciproco a non promuovere prodotti concorrenti finché dura l'esclusiva.

**2. Esclusiva e canale già attivo «Fornitori della cassa» · P1**
- *Evidenza:* `crescita/imbuto.md` registra 26 clienti in 12 mesi (14% dei 180 nuovi) da questo canale, con CAC 0 € e LTV 590 €. In `pipeline.csv`, P-07 e P-11 sono già attribuiti a Cassa Facile.
- *Rischio:* se parte dei 26 clienti viene da altri rivenditori, l'esclusiva ne impedisce la formalizzazione e probabilmente il rinnovo. Il canale oggi gratuito diventerebbe a pagamento.
- *Informazione mancante:* quanti dei 26 vengono da Cassa Facile e quanti da altri fornitori.
- *Modifica proposta:* escludere dall'esclusiva i rapporti già in corso, elencandoli in allegato.

**3. «Clienti riconosciuti»: compenso su clienti non portati dal partner · P1**
- *Clausola:* «Ogni cliente con sede in Emilia-Romagna che si abbona a Turnio, da qualunque canale arrivi».
- *Rischio:*
  - Turnio ha sede a Bologna, quindi una quota degli abbonamenti diretti e di referral è probabilmente in Emilia-Romagna. Su quelli si pagherebbe il compenso a Cassa Facile senza che abbia fatto nulla.
  - La clausola sul compenso parla di «cliente portato», quella sui clienti riconosciuti di «ogni cliente»: le due non coincidono.
  - Il testo non esclude i clienti già attivi (412 oggi) né i clienti in prova (`crescita/prezzi.md`) né le pipeline diretta aperte.
- *Informazione mancante:* ripartizione per regione dei 412 locali e delle opportunità in `pipeline.csv`. Il file non ha il campo regione.
- *Modifica proposta:* riconoscere solo i clienti registrati dal partner con un codice o un lead registrato prima, che non fossero già clienti, in prova o in pipeline. Aggiungere un elenco di esclusioni all'avvio e una durata del riconoscimento del lead (per esempio 90 giorni).

**4. Compenso sul 25% IVA compresa, senza storno · P1**
- *Clausola:* «25% dell'importo incassato dal cliente, IVA compresa, per i primi 12 mesi».
- *Calcolo* (formula: prezzo × 1,22 × 25%; prezzi da `prezzi.md`):

| Piano | Compenso al mese | Compenso sui 12 mesi |
|---|---|---|
| Base 29 € | 8,85 € | 106 € |
| Pro 59 € | 17,99 € | 216 € |
| Plus 99 € | 30,20 € | 362 € |

  - L'IVA non è un ricavo di Turnio: il compenso effettivo è il 30,5% del prezzo IVA esclusa.
  - Con costi pari al 22% del prezzo (margine lordo 78%, `README.md`; assunzione: i costi crescono col prezzo) il margine scende a circa il 47% per 12 mesi.
  - Per un cliente Pro il compenso (216 €) è più del doppio del CAC di Google Ads (95 €) e arriva a un LTV a 12 mesi di 590 € (`imbuto.md`). Non è «senza costo di acquisizione».
  - Il compenso è sull'«incassato». Non ci sono clausole di storno per rimborsi, mancati pagamenti o disdette: i mancati pagamenti contano come abbandono (`clienti/fidelizzazione.md`).
  - Il testo non dice se vale per le sole piani Base/Pro/Plus o anche per i moduli futuri come Paghe Light.
- *Modifica proposta:*
  - Percentuale sul prezzo IVA esclusa, pari al 15-20% (da simulare, non è un dato di mercato).
  - Calcolata solo sui piani di abbonamento.
  - Pagata a trimestre posticipato e solo su fatture pagate.
  - Con storno in caso di rimborso o disdetta entro 90 giorni.

**5. API pubblica a gennaio 2027 incompatibile con la roadmap · P1**
- *Clausola:* «Turnio mette a disposizione la sua API pubblica da gennaio 2027».
- *Evidenza:* `roadmap/roadmap.md` pone l'API pubblica nel Q3 2027 (squadra B, 10 settimane, P2, obiettivo O2).
- *Rischio:* l'impegno anticipa la consegna di 6-9 mesi. Anticiparla nel Q1 non è possibile con le risorse indicate:
  - squadra B nel Q1 ha già 14 settimane (esportazione CSV 6 + fatturazione annuale 8) su 13 disponibili;
  - il Q1 intero ha 47 settimane di iniziative per 39 di capacità, senza riserva per i bug.
  - Mancano anche stabilità, documentazione, versionamento e supporto dell'API verso un terzo che installa presso i clienti, con 2 persone al supporto.
- *Modifica proposta:*
  - Data di consegna collegata alla roadmap (Q3 2027), o un impegno di «migliori sforzi» senza penale.
  - Specifiche e SLA dell'integrazione in un allegato.
  - Un compenso di Cassa Facile che parta solo dalla disponibilità dell'API.
  - In alternativa, anticipare l'API e rinviare un'altra iniziativa, con decisione esplicita dell'utente.

**6. Dati personali e ruoli · P2**
- *Evidenza:* Cassa Facile «installa l'integrazione fra la cassa e i turni» presso i locali. Turni e timbrature sono dati dei dipendenti.
- *Modifica proposta:* passaggio di consegne alla Privacy & Compliance Agency per ruoli e accordo art. 28. Non lo valuto io.

**7. Nessuna clausola di cambio di controllo, riservatezza o uso del marchio · P3**
- *Modifica proposta:* aggiungerle in sede di revisione legale.

**8. Natura del rapporto · P2**
- Un intermediario pagato a provvigione può essere inquadrato come agente. Da far valutare al legale: indennità di fine rapporto, preavvisi. Non è una valutazione legale.

## 3. Associazione Esercenti Riuniti

Fatti dal documento: 4.200 soci in Lombardia e Veneto, sconto ai soci del 40% sul listino per tutta la durata dell'abbonamento, compenso del 30% del listino ogni mese per socio abbonato, durata 2 anni con recesso a 3 mesi.

**9. Sconto 40% più compenso 30% azzerano il margine · P1**
- *Calcolo* (formula: prezzo scontato = 60% del listino; Turnio trattiene 60% − 30% = 30% del listino; costi = 22% del listino, assunzione di cui sopra):

| Piano (listino) | Pagato dal socio | Compenso | Resta a Turnio | Costi (22%) | Margine al mese |
|---|---|---|---|---|---|
| Base 29 € | 17,40 € | 8,70 € | 8,70 € | 6,38 € | 2,32 € |
| Pro 59 € | 35,40 € | 17,70 € | 17,70 € | 12,98 € | 4,72 € |
| Plus 99 € | 59,40 € | 29,70 € | 29,70 € | 21,78 € | 7,92 € |

  - Margine circa l'8% del listino contro il 78% normale (`README.md`). Il compenso è il 50% di quanto il socio paga davvero.
  - Con un CAC di 95 € (Google Ads, `imbuto.md`) il recupero su un cliente Pro richiederebbe circa 20 mesi, contro la durata del contratto di 24. Il CAC di 180 € del business case Paghe Light darebbe circa 38 mesi.
  - Il prezzo scontato di un Pro (35,40 €) sta sotto Orarix (49 €) e Planora (39 €) (`mercato/concorrenti.md`): è una leva commerciale, ma erode il prezzo di riferimento.
- *Modifica proposta (da simulare con la direzione):* sconto fisso e a tempo (per esempio 15-20% per i primi 12 mesi, poi listino), compenso al 10-15% del pagato IVA esclusa, oppure compenso una tantum per socio attivato.

**10. Sconto «per tutta la durata dell'abbonamento» sopravvive al contratto · P1**
- *Evidenza:* il contratto dura 2 anni con recesso a 3 mesi, ma lo sconto vale per tutta la durata dell'abbonamento del socio, senza limite. Il compenso «ogni mese» non dice se si ferma con l'accordo.
- *Rischio:* a fine accordo restano sconto a vita senza canale e rischio di richieste di compenso arretrato o continuato.
- *Modifica proposta:* sconto limitato ai primi 12 mesi o alla durata dell'accordo. Dichiarare che compenso e sconto per i nuovi soci cessano alla scadenza o al recesso.

**11. Prezzo di listino, perimetro e soci già clienti · P1**
- *Rischio:*
  - «Prezzo di listino» comprende il piano, il costo per i dipendenti oltre soglia (2 € al mese), il modulo Kiosk e i futuri moduli?
  - Sconto del 40% e compenso del 30% sul Paghe Light (15 €) lascerebbero a Turnio 4,50 €, cioè il costo del fornitore di paghe (`finanza/business-case.md`): margine zero, contro il 70% ipotizzato.
  - Non è esclusa la sovrapposizione con i clienti già attivi in Lombardia e Veneto che sono soci: un Pro attuale da 59 € scenderebbe a 17,70 € netti per Turnio (−70%).
  - Lo sconto del 40% non è cumulato in modo esplicito con l'annuale (10 mesi su 12), la prova gratuita o il referral (un mese gratis).
  - Il compenso è dovuto per «socio abbonato» e non per importo incassato: anche se il socio non paga.
- *Modifica proposta:* perimetro ai soli piani Base/Pro/Plus, nuovi clienti, nessun cumulo con altre promozioni, compenso solo su importi incassati e senza storno. Registro dei soci verificabile (privacy: elenco da concordare con la Privacy Agency).

**12. Nessun impegno dell'associazione · P2**
- *Evidenza:* «presenta Turnio ai soci nelle sue newsletter e negli eventi»: nessun numero di invii, di eventi o di soci raggiunti, nessun obiettivo, nessun diritto di approvazione dei testi.
- *Rischio:* i testi dell'associazione ripeterebbero messaggi non approvati.
- *Modifica proposta:* calendario minimo di comunicazioni, approvazione dei testi da parte di Turnio, rendicontazione trimestrale dei soci attivati.

**13. Conflitto con le regole di sconto · P2**
- *Evidenza:* `vendite/previsione.md`: sconti oltre il 20% richiedono l'approvazione scritta del CEO nelle note. L'accordo istituzionalizza il 40% senza quella approvazione.
- *Modifica proposta:* far approvare per iscritto dal CEO il tetto di sconto dell'accordo, e riportarlo nelle regole commerciali.

## 4. Conflitti fra canali e con gli obiettivi 2027

**14. Gruppo Portico duplicato fra canale diretto e Cassa Facile · P1**
- *Evidenza:* `pipeline.csv` ha D-03 (diretto, 4 locali Plus, 15%, 4.039 €, Proposta) e P-07 (partner Cassa Facile, 4 locali Plus, 20%, 3.802 €, Negoziazione). Sembrano lo stesso cliente.
- *Rischio:* la previsione Q1 2027 (18.584 €) li somma entrambi, contando 7.841 € per 4 locali. Il cliente sceglierà lo sconto migliore (20%). Se ha sede in Emilia-Romagna il compenso a Cassa Facile è dovuto in ogni caso (rilievo 3).
- *Modifica proposta:* una sola opportunità, con regola di assegnazione del lead al partner (registrazione preventiva).
- Fuori perimetro, di passaggio: la previsione Q1 somma i valori pieni e non quelli pesati come la regola dichiara (pesati: circa 10.436 €, circa 7.584 € senza il duplicato). D-06 ha sconto del 35% senza approvazione CEO nelle note. Da rivedere con AIBPD-12 o il responsabile vendite.

**15. Dipendenza della previsione da un accordo non firmato · P2**
- 4.150 € (P-07 + P-11) di 18.584 € previsti per il Q1 passano da Cassa Facile, accordo non ancora firmato.

**16. Obiettivi O2 e O3 · P2**
- *O3 (ARPU +10%, cioè da 52,50 € circa a 57,75 €):* oggi ARPU 21.630 / 412 = 52,50 €. Un canale che porta Base e soci scontati al 60% abbassa l'ARPU.
- *O2 (520 locali a fine 2027):* con abbandono al 20% servono circa 190 nuovi clienti (ARR nuovo da raggiungere), contro i 180 del 2026 (`fidelizzazione.md`, `roadmap.md`). L'Associazione porterebbe volume ma con margine circa nullo. Crescere a questo costo non migliora il valore.

**17. Target e posizionamento · P3**
- `marketing/posizionamento.md` punta a catene e gruppi con più sedi. I due canali portano soprattutto bar e ristoranti singoli, spesso con pochi dipendenti (`mercato/fonti.md`, F2). Il piano di lancio 2027 (`lancio.md`) non cita i partner.

## 5. Errori nella «Valutazione» del documento

**18. «Senza costo di acquisizione» è sbagliato · P1**
- Il compenso del 25% IVA compresa per 12 mesi è il costo di acquisizione (rilievo 4): 216 € per un Pro.

**19. 900 e 4.200 sono platea, non clienti · P1**
- Non c'è nessuna stima di conversione: nessun dato in `imbuto.md` che la sostenga (conversione prova → pagamento 20%, canale fornitori della cassa 26 clienti/anno).
- Il segmento di Turnio è il 31% dei locali (3-40 dipendenti, F2, giugno 2026), con il 58% senza dipendenti: 900 × 31% ≈ 280 locali e 4.200 × 31% ≈ 1.300 locali. Sono stime mie, ipotizzando che i locali di Cassa Facile e dei soci siano distribuiti come la media nazionale. Il campione di 3 commerciali limita la capacità di Cassa Facile.
- *Modifica proposta:* scenari espliciti (basso, medio, alto) con tassi di conversione dichiarati come ipotesi, prima della firma.

**20. «Sconto forte che rende l'offerta irrinunciabile» confonde l'attrattiva per il cliente con il valore per Turnio · P1**
- Rendere l'offerta irrinunciabile per il socio è lo scopo dello sconto, ma il documento non calcola il margine (rilievo 9: circa 8%).

**21. Manca un confronto con i canali esistenti · P2**
- Nessun confronto con Google Ads (CAC 95 €, LTV 520 €), referral e Instagram (`imbuto.md`).
- Nessun conto economico dei due accordi.

**22. Obiezione di consumo non applicabile · nota**
- Ho letto la scheda `riduzioni-di-prezzo` (Codice del consumo, art. 17-bis, testo in vigore dal 2 aprile 2023, verificata il 2026-11-19, da ricontrollare entro il 2027-05-19). Tutela i consumatori. I clienti di Turnio sono imprese (`README.md`: prezzi IVA esclusa), quindi non si applica all'offerta ai soci.
- Le altre due schede (recesso online, direttiva 2024/825) riguardano i consumatori e non toccano questo compito.

## 6. Informazioni mancanti

- Regione dei 412 clienti e delle opportunità in pipeline.
- Provenienza dei 26 clienti del canale «Fornitori della cassa».
- Quanti dei 412 clienti sono soci dell'associazione.
- Testo completo dei contratti (il file riporta solo una tabella).
- Parere legale su recesso, agenzia commerciale e IVA sul compenso.

## 7. Decisioni che richiedono l'approvazione dell'utente

1. Non firmare Cassa Facile così com'è e rinegoziare durata, esclusiva, clienti riconosciuti, compenso e data dell'API.
2. Rivedere sconto e compenso dell'Associazione (tetto di sconto approvato dal CEO) prima della firma.
3. Se si vuole mantenere l'API a gennaio 2027, decidere cosa slitta dal Q1 (capacità già superata).
4. Passaggio di consegne alla Privacy & Compliance Agency (ruoli, art. 28, elenco dei soci) e alla revisione legale umana.
5. Passaggio di consegne al Financial Analyst (AIBPD) per scenari con conto economico dei due accordi.

Nessuna decisione è approvata: sono raccomandazioni. Le analisi non sostituiscono la consulenza legale, fiscale o finanziaria.

AIBPD-10 · RASALHAGUE — Senior Business Development Manager. File esaminati nella cartella `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-10-4`.
