**AIBPD-06 · DIPHDA — Senior Business & Financial Analyst, reparto AIBPD (AI Business & Product Development)**

Non ho caricato AIBPD-01 perché non ho il tool `agent`. Non ho consultato le schede della biblioteca: le tre schede (riduzioni di prezzo, funzione di recesso, direttiva 2024/825) non riguardano il business case. Il lavoro è in sola lettura su `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-06-3`.

## Esito

**La conclusione di `finanza/business-case.md` non regge e il modulo non va approvato così com'è (P0).**
- Il risultato 2027 non è −93.884 €. Con le sue stesse ipotesi, corrette solo per somma e IVA, è circa −133.500 €.
- Con un lancio realistico (a metà 2027) la perdita sale a circa −154.000 €.
- Il pareggio nel 2028 è smentito dai numeri. Il rapporto LTV/CAC di 8,3 e il recupero del CAC in 8 mesi sono errori di metodo.
- Per un rilievo P0 e P1 sono su un modello più piccolo: propongo il riesame del direttore AIBPD-01 o di un revisore su Opus prima che diventi definitivo.

## Rilievi

### 1. Errori di calcolo

**R1 · P0 · Somma dei costi.** Nel conto economico 2027 il totale è 140.000 €. La somma è 96.000 + 40.000 + 24.000 = **160.000 €**.
- Il risultato scritto è 46.116 − 140.000 = −93.884 €.
- Con il totale giusto sarebbe 46.116 − 160.000 = −113.884 € (20.000 € di differenza), prima degli altri rilievi.

**R2 · P0 · Ricavi calcolati con il prezzo IVA inclusa.** La riga dei ricavi usa 18,30 € (210 × 18,30 × 12 = 46.116).
- Il ricavo è il prezzo senza IVA, 15 € (`crescita/prezzi.md`: prezzi IVA esclusa, i clienti sono imprese; l'IVA va allo Stato).
- Conto corretto: 210 × 15 × 12 = **37.800 €**, cioè 8.316 € in meno.
- Il margine del 70% è coerente solo col prezzo netto: 4,50 / 15 = 30% di costo.

**R3 · P1 · Il costo del venduto non è nel conto economico.** Il 70% di margine implica 4,50 € per locale al mese.
- Sono 210 × 4,50 × 12 = 11.340 € di fornitore, che nel conto 2027 non compaiono.
- Il documento dice solo che lo sviluppo non entra nel margine lordo. Il costo del fornitore va comunque sottratto.

**R4 · P0 · Risultato 2027 corretto con le ipotesi del documento.**

| Voce | Importo |
|---|---|
| Ricavi (210 × 15 × 12) | 37.800 € |
| Costo del venduto (30%) | −11.340 € |
| Margine lordo | 26.460 € |
| Costi (sviluppo, marketing, supporto) | −160.000 € |
| **Risultato** | **−133.540 €** (contro −93.884 €, cioè 39.656 € in peggio) |

Il margine lordo di 26.460 € copre appena il 16,5% dei 160.000 € di costi.

### 2. Metriche sbagliate nel metodo

**R5 · P1 · Abbandono del modulo al 1% al mese, «come per Turnio».** `clienti/fidelizzazione.md` dice che l'abbandono di Turnio è 23,8% l'anno, non il 12%. L'obiettivo O1 del 2027 (`roadmap/roadmap.md`) è "sotto il 20%".
- Il 23,8% è anch'esso calcolato male: 98 / 412 usa i clienti finali come denominatore. Dei 330 clienti di inizio periodo ne restano 249, quindi **81 / 330 = 24,5%**, circa 2,3% al mese.
- Il modulo dipende da Turnio: chi lascia Turnio lascia anche il modulo, quindi l'abbandono del modulo non può essere inferiore a quello della base.
- Anche in teoria 1% al mese fa 11,4% l'anno composto, non 12%.

**R6 · P1 · LTV calcolato sul ricavo invece che sul margine, con l'abbandono sbagliato.** Il documento calcola LTV = 15 / 1% = 1.500 €. Corretto: LTV = (15 × 70%) / abbandono mensile.

| Abbandono mensile | LTV | LTV/CAC (CAC 180 €) |
|---|---|---|
| 1% (ipotesi del documento, solo margine corretto) | 1.050 € | 5,8 |
| 2,0% (24,5% / 12) | 515 € | 2,9 |
| 2,3% (calcolo composto) | 457 € | 2,5 |

Il LTV/CAC realistico è **2,5–2,9, non 8,3**, e nessuna delle versioni qui sopra arriva a 8,3.

**R7 · P1 · «Recupero del CAC in 8 mesi».** Il recupero si calcola sul margine mensile: 180 / (15 × 70%) = 180 / 10,50 = **17,1 mesi**.
- Anche sul ricavo lordo sono 12 mesi (180 / 15), e 9,8 con i 18,30 € IVA inclusi. Nessuna definizione dà 8.
- Con l'abbandono reale la vita media è 1 / 2,3% ≈ 43 mesi: il recupero resta possibile, ma lento.

**R8 · P0 · «Va in pareggio nel 2028».** Con 210 locali stabili, il margine annuo è 210 × 10,50 × 12 = 26.460 € e il supporto dedicato costa 24.000 €.
- Il risultato 2028 è quindi circa **+2.460 €**.
- Il deficit cumulato dopo il 2027 (−133.540 €) si recupererebbe in 54 anni.
- Per un pareggio annuo servono almeno 24.000 / 126 = 191 locali. Per recuperare sviluppo e marketing (136.000 €) in tre anni (2028–2030) ne servono circa **550** stabili.
- Il conto non considera ulteriori sviluppi del modulo e ammette che i 210 locali non cali no.

**R9 · P2 · CAC.** I 180 € di CAC comprendono «tempo del supporto», ma il supporto dedicato (24.000 €) è già nei costi: possibile doppio conteggio.
- Il CAC è senza fonte. Il CAC misurato dell'imbuto in `crescita/imbuto.md` è diverso (Google 95 €, Instagram 150 €; media 11.600 € / 180 clienti = 64 €), ma riguarda clienti nuovi e non vendite a clienti esistenti.
- Il marketing del lancio (40.000 € / 210 = 190 €) è vicino ai 180 €: va chiarito se è lo stesso costo contato due volte.

### 3. Ipotesi incoerenti con le fonti

**R10 · P1 · 210 locali per 12 mesi, ma lo sviluppo dura 6,5 mesi.** I ricavi contano 210 locali attivi per tutto il 2027. Ma 210 è la stima a fine 2027 (35% di 600), e l'adozione cresce nel tempo.
- Con lo sviluppo che parte a gennaio e dura 6,5 mesi, il modulo esce a metà luglio. Restano 5,5 mesi.
- **Scenario illustrativo** (costi invariati, adozione lineare da 0 a 210 dalla metà di luglio, ipotesi mia): ricavi circa 8.660 €, costo del venduto circa 2.600 €, risultato circa **−153.900 €**.
- Il limite superiore teorico, con 210 locali dal primo giorno, dà ricavi di 17.325 €.
- Il costo di 96.000 € per 6,5 mesi della squadra A (2 persone, circa 7.400 € per persona al mese) non ha fonte e non l'ho potuto verificare.

**R11 · P1 · Capacità di sviluppo incoerente (`roadmap/roadmap.md`, `prodotto/prd-scambio-turni.md`).**
- Il business case conta 6,5 mesi (circa 28 settimane) di squadra A. La roadmap assegna a Paghe Light solo 14 settimane di «prima parte» nel Q1.
- La squadra A ha 13 settimane per trimestre, ma nel Q1 ha già 14 + 6 = 20 settimane. Sul totale dell'anno: 14 + 6 + 10 + 12 = 42, più la seconda parte di Paghe Light fanno almeno 56 contro 52 disponibili.
- Il PRD dice che lo scambio dei turni parte a gennaio 2027 con la squadra A, la roadmap lo mette nel Q2. Non c'è margine per il modulo nelle date previste.

**R12 · P1 · Clienti a fine 2027: 600 («stima dei fondatori») contro 520.** L'obiettivo O2 della roadmap e `vendite/previsione.md` indicano 520 (oggi 412). Con 520 e 35% i locali sarebbero 182, non 210.
- Con l'abbandono reale (24,5%) la base scende a circa 311 clienti. Per arrivare a 600 servirebbero circa 289 clienti nuovi, contro i 180 dell'ultimo anno (+60%).

**R13 · P1 · Adozione del 35% basata su un sondaggio debole.**
- Il «58% interessati» è del sondaggio 2026: 74 risposte su 412 (18%), clienti attuali con buono Amazon da 10 €.
- Le 43 risposte «sì» sono il 10,4% dei clienti (43 / 412). Se chi non ha risposto è meno interessato, l'adozione reale è vicina al 10%.
- La domanda era «una gestione semplice delle paghe», senza prezzo di 15 € né limite ai 15 dipendenti. Il 30% «forse» non è un sì.
- Il 35% si applica a tutti i 600 clienti, ma il modulo è per i locali fino a 15 dipendenti. Turnio serve locali da 3 a 40 dipendenti e la quota dei clienti sotto i 15 non è nei documenti.
- Il «prudenza» è quindi una riduzione di 23 punti su una stima già gonfiata.
- La validazione prevista in `innovazione/concetti.md` (20 interviste, almeno 12 sì) non ha esito registrato.

| Locali con il modulo | Margine annuo (×126 €) | Risultato 2028 (dopo 24.000 € di supporto) |
|---|---|---|
| 210 | 26.460 € | +2.460 € |
| 182 | 22.932 € | −1.068 € |
| 60 | 7.560 € | −16.440 € |

**R14 · P2 · Possibili effetti non considerati.**
- Cassa Facile (`partner/accordi.md`) riceve il 25% dell'incassato IVA compresa, per 12 mesi, su ogni cliente dell'Emilia-Romagna. Se vale anche per il modulo, il compenso è 4,575 € al mese e il margine di quel locale passa dal 70% a circa 39,5%. Va chiarito se si applica.
- Gli abbonamenti annuali pagano 10 mesi su 12 (`crescita/prezzi.md`): se il modulo segue lo stesso schema, il ricavo medio scende (con il 22% di annuali, circa 14,45 € invece di 15 €).

**R15 · P1 · «Rischi: nessun rischio rilevante» (`innovazione/concetti.md`).** Il rischio non è nullo:
- il 38% dei clienti conosce Turnio tramite consulente del lavoro o commercialista (`mercato/sondaggio-2026.md`): un cedolino «senza passare dal consulente» rischia di danneggiare il primo canale di acquisizione;
- i cedolini sono dati personali dei dipendenti dei clienti, con un fornitore esterno: serve coinvolgere Privacy & Compliance;
- la produzione di cedolini in proprio può avere vincoli di legge che non ho verificato: va chiesto a un consulente legale.

### Effetto sulla conclusione
Il modulo non è «in perdita per lo sviluppo ma con LTV/CAC 8,3 e CAC recuperato in 8 mesi». Con la correzione del solo conto:
- risultato 2027 circa −133.500 €;
- LTV/CAC circa 2,5–2,9;
- recupero del CAC in oltre 17 mesi;
- pareggio annuo 2028 al limite (+2.460 € con 210 locali), nessun recupero del deficit in tempi sensati.

La raccomandazione di approvare non è sostenuta. La **non approvazione** è una proposta, non una decisione: la decisione resta all'utente.

## Rilievi sugli altri documenti (fuori perimetro, solo segnalati)

- **P1** `innovazione/concetti.md`: totale del concetto C = 5 × 0,4 + 2 × 0,3 + 3 × 0,3 = **3,5**, non 4,4. B (3,7) supera C: la proposta «dopo A, C, poi B» si ribalta. Questo va a favore di B, ma il business case di B resta negativo.
- **P1** `clienti/fidelizzazione.md`: l'NRR di 108% esclude i clienti persi. Su tutti i 330 clienti: 15.020 / 17.200 = **87%**.
- **P1** `crescita/imbuto.md`: l'esperimento sulla pagina dei prezzi non è significativo (8,5% contro 10,1%, circa 400 visite per variante, z ≈ 0,8, p ≈ 0,4). Il test è stato fermato guardando i dati ogni giorno.
- **P2** `crescita/imbuto.md`: la proposta di spostare budget su Instagram si basa su un LTV stimato su tre mesi; il rapporto LTV/CAC di Instagram (4,3) è inferiore a quello di Google Ads (5,5).
- **P1** `crescita/prezzi.md`: «più annuali = ricavi +20% nel 2027» è sbagliato. Il ricavo si riconosce mese per mese (regola del business case) e l'annuale fa pagare 10 mesi su 12, quindi il ricavo cala.
- **P1** `mercato/sintesi-mercato.md`: TAM e SAM partono dal censimento 2019 (198.000 locali, 2019) invece che da F2 (176.000, 2026), usano il prezzo Plus e non applicano il segmento (31%). La crescita annua composta 0,8 → 1,4 miliardi in tre anni è 20,5%, non 32%. Orarix ha 18.000 utenti, non locali (circa 2.300 locali): su 3.962 locali Orarix ha circa 58% e Turnio circa 10,4%, ed è terzo (Planora ne ha 900). Il 64% sulla disponibilità a pagare viene dal sondaggio sui clienti attuali, non dal mercato.
- **P2** `vendite/previsione.md`: la previsione Q1 somma i valori non pesati. Pesati, con le regole del documento, fanno circa 10.436 € (130% della quota); togliendo il duplicato Gruppo Portico (D-03 e P-07, stesso cliente) restano circa 7.584 € (95%). D-06 ha sconto 35% senza approvazione del CEO nelle note; D-04 ha probabilità 70% in fase Demo (30%); D-05 ha la chiusura scaduta (30 settembre 2026).

## Domande aperte

1. Esito delle 20 interviste su Paghe Light (R13).
2. Quota dei clienti con meno di 15 dipendenti.
3. Origine dei 96.000 € di sviluppo e della durata di 6,5 mesi (R10, R11).
4. Origine dei 180 € di CAC e se il marketing di 40.000 € lo include già (R9).
5. Il compenso di Cassa Facile si applica al modulo? (R14)
6. Parere legale e privacy sui cedolini (R15).

## Decisioni che richiedono l'approvazione dell'utente

- Non approvare il business case nella forma attuale.
- Rifare il modello con le ipotesi corrette e tre scenari, dopo aver ottenuto i dati delle domande aperte.
- Chiedere la verifica privacy e legale prima di proseguire.

Nessun file modificato, nessun processo avviato.

— AIBPD-06 · DIPHDA
