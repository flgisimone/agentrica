AIBPD-06 · DIPHDA — Senior Business & Financial Analyst, reparto AIBPD (AI Business & Product Development)

# Verifica di `finanza/business-case.md`

Ho letto il business case e gli altri documenti del progetto (README, `clienti/`, `crescita/`, `mercato/`, `innovazione/`, `roadmap/`). Non ho modificato nessun file. Non ho potuto caricare AIBPD-01 · ALDERAMIN perché non ho il tool `agent`: questo rapporto va a lui tramite chi mi ha lanciato. Le schede della biblioteca non riguardano il compito: i clienti sono imprese, quindi recesso e riduzioni di prezzo non si applicano.

**Esito.** La proposta di approvare il modulo non regge. Il documento ha due errori di calcolo e due metriche costruite male. Una delle ipotesi chiave contraddice le fonti. Con i numeri corretti la perdita 2027 sale da 93.884 € a circa 133.500 €. L'LTV/CAC scende da 8,3 a circa 2,6. Il recupero del CAC passa da 8 a oltre 17 mesi. Il pareggio nel 2028 non è raggiungibile.

## Rilievi

**1. P1 · Costi sommati male** (tabella «Conto economico 2027»). 96.000 + 40.000 + 24.000 = **160.000 €**, non 140.000 €. Il risultato scritto, −93.884 €, è 46.116 − 140.000.
- Effetto: la perdita sale di 20.000 € già con le ipotesi del documento.

**2. P1 · Ricavi con l'IVA e costo del venduto assente** (stessa tabella e riga «Prezzo»).
- Il README dice che i prezzi sono IVA esclusa e che i clienti sono imprese. L'IVA non è ricavo. Il ricavo è 210 × 15 € × 12 = **37.800 €**, non 46.116 €.
- Il margine lordo del 70% viene indicato nelle ipotesi ma non entra nel conto. L'outsourcing costa 210 × 4,50 € × 12 = 11.340 €, quindi il margine lordo è 26.460 €.
- Conto corretto, con le sole ipotesi del documento: 26.460 − 160.000 = **−133.540 €**. Il documento dice −93.884 €.

**3. P1 · Abbandono del modulo incoerente con la fonte** (riga «Abbandono del modulo»).
- Il documento scrive «1% al mese, cioè 12% l'anno come per Turnio». Secondo `clienti/fidelizzazione.md` l'abbandono di Turnio è **23,8%** annuo, circa 2,2% al mese in composto (1 − 0,762^(1/12)).
- Anche 1% al mese darebbe 11,4% e non 12%.
- Il 23,8% è probabilmente sottostimato. È calcolato su 98/412, cioè sulla base di chiusura. Sulla base di apertura (330) sarebbe 29,7%, circa 2,9% al mese. Sulla coorte iniziale, dove 81 clienti su 330 sono usciti, sarebbe 24,5%.
- Chi lascia Turnio lascia anche il modulo, e il modulo si può disdire da solo. L'abbandono del modulo è quindi almeno quello di Turnio, non la metà.

**4. P1 · LTV calcolato sul ricavo invece che sul margine** (sezione «Valore del cliente»).
- Il documento usa 15 € / 1% = 1.500 €. L'LTV va calcolato sul margine lordo mensile: 10,50 € (15 × 70%).
- Con il suo 1% di abbandono l'LTV sarebbe 1.050 € e l'LTV/CAC 5,8.
- Con l'abbandono delle fonti (2,2% al mese) l'LTV è 10,50 / 0,0224 ≈ **469 €** e l'LTV/CAC = 469 / 180 ≈ **2,6**. Con il 29,7% annuo (2,9% al mese) l'LTV è circa 363 € e l'LTV/CAC circa 2,0. Il documento dice 8,3.

**5. P1 · Recupero del CAC in 8 mesi non riproducibile** (sezione «Valore del cliente»). Il documento non mostra il conto, e nessun calcolo sensato dà 8 mesi.
- Corretto sul margine: 180 / 10,50 = **17,1 mesi** senza abbandono.
- Con abbandono del 2,2% al mese il margine cumulato per cliente arriva a 180 € solo dopo circa **21 mesi**.

**6. P2 · CAC incoerente con i costi dello stesso documento** (riga «Costo di acquisizione»).
- Il CAC dichiarato include «campagne e tempo del supporto». Marketing (40.000 €) e supporto (24.000 €) valgono 64.000 € su 210 locali, cioè **305 €** a locale. Con il solo marketing sono 190 €.
- Con CAC 305 € e LTV 469 € il rapporto scende a circa 1,5.
- Il CAC non va però sommato di nuovo ai costi, perché sarebbe un doppio conteggio.

**7. P1 · Clienti a fine 2027: 600 contro l'obiettivo 520** (riga «Clienti Turnio a fine 2027»).
- `roadmap/roadmap.md` (O2) e `vendite/previsione.md` indicano **520**. L'anno scorso la crescita netta è stata +82 (330 → 412), quindi 520 è plausibile e 600 (+46%) no.
- Con 520 clienti e adozione 35% i locali sono **182**. Ricavo netto 32.760 €, margine lordo 22.932 €, risultato circa **−137.000 €**.

**8. P1 · Ricavi su 12 mesi pieni con 210 locali dal 1° gennaio** (riga «Ricavi: 210 locali × … × 12»).
- 210 è il valore a fine 2027, non la media dell'anno.
- Lo sviluppo richiede 6,5 mesi della squadra A, che in roadmap è già impegnata: Q1 ha 20 settimane pianificate su 13 disponibili, poi lo scambio dei turni (P0) in Q2. Il modulo non può essere in vendita da gennaio.
- Esempio, con ipotesi mie da validare: lancio il 1° luglio e crescita lineare fino a 182 locali. Il ricavo sarebbe circa 8.200 € netti e il risultato circa **−154.000 €**.
- Inoltre `roadmap/roadmap.md` mette solo 14 settimane per «Paghe Light, prima parte»: il resto dei 6,5 mesi (circa 28 settimane) non ha una collocazione.

**9. P1 · Adozione al 35% poco fondata** (riga «Adozione»).
- Il 58% viene da `mercato/sondaggio-2026.md`. La domanda era «una gestione semplice delle paghe dentro Turnio?» e non indicava il prezzo di 15 €. I rispondenti sono 74 clienti su 412 (18%), con un buono da 10 €: un campione autoselezionato e già interessato.
- L'interesse dichiarato non è un acquisto, e il «ridotto per prudenza» fino al 35% non ha criterio.
- Il modulo è per locali con al massimo 15 dipendenti, ma il 35% è applicato a tutti i 600 clienti, anche a quelli con 16–40 dipendenti. La quota di clienti idonei non è nei documenti.
- Non risulta fatta la validazione di `innovazione/concetti.md` (20 interviste, almeno 12 sì). Dei clienti attuali il 38% ha conosciuto Turnio tramite il consulente del lavoro, che il modulo vorrebbe escludere («senza passare dal consulente»). Non c'è traccia di un'analisi di questo rischio sul canale principale.

**10. P0 · Conclusione non sostenuta dai numeri** (sezione «Conclusione»).
- «Va in pareggio nel 2028» è contraddetto anche dai numeri del documento. Per rientrare dei 93.884 € in un anno servirebbero circa 745 locali pagati (93.884 / 126 € di margine annuo a locale), più dei 600 clienti totali.
- Con i numeri corretti (−133.540 €) servirebbero circa 1.060 locali, e circa 1.250 contando il supporto dedicato da 24.000 €. Anche a regime, con 210 locali, il margine annuo (26.460 €) copre il supporto (24.000 €) per soli 2.460 €. Per coprire il solo supporto servono almeno 191 locali.
- L'LTV/CAC e il recupero del CAC citati a sostegno sono quelli sbagliati dei punti 3–5. Se la proposta di approvazione si basa su questa conclusione, va fermata e riscritta.

**11. P2 · Rischi e dati non analizzati** (sezione «Rischi» di `innovazione/concetti.md`, dato che il business case non ne ha una).
- «Nessun rischio rilevante; usa dati che Turnio ha già» non regge. Un cedolino richiede dati nuovi (retribuzioni, dati fiscali, contratto, IBAN), e la Privacy & Compliance Agency va coinvolta.
- L'elaborazione dei cedolini è un'attività regolata in Italia. È una verifica per un professionista abilitato, che non posso sostituire.
- Il costo di 4,50 € «per locale» dal preventivo del fornitore non è nei documenti. Va verificato se il preventivo è per locale o per dipendente, perché cambia il margine.

## Conto corretto 2027 (sole correzioni dei punti 1 e 2)

| Voce | Documento | Corretto |
|---|---|---|
| Ricavi (210 locali) | 46.116 € | 37.800 € |
| Costo del venduto (4,50 € × 210 × 12) | assente | −11.340 € |
| Margine lordo | non calcolato | 26.460 € |
| Sviluppo + marketing + supporto | 140.000 € | 160.000 € |
| **Risultato 2027** | **−93.884 €** | **−133.540 €** |

Con 182 locali (520 clienti) il risultato è −137.068 €.

## Informazioni mancanti e decisioni

- Servono la data di lancio realistica, la quota di clienti con al massimo 15 dipendenti e il preventivo del fornitore. Servono anche l'esito delle 20 interviste e un abbandono misurato su modulo analogo (Kiosk: 61 clienti).
- Fuori dal mio perimetro, ma da correggere nei rispettivi documenti:
  - NRR in `clienti/fidelizzazione.md` (108% calcolato solo sui clienti rimasti; sull'MRR iniziale di 17.200 € sarebbe 87%).
  - Conversione prova-pagamento in `crescita/imbuto.md` (180/1.500 = 12%, non 20%).
- Le decisioni su approvazione e budget restano all'utente. La mia raccomandazione è di non approvare il business case così com'è e di rifarlo con i punti 1–9.
- Ho lavorato su Sonnet e ho trovato un P0 e diversi P1. Propongo il riesame del direttore AIBPD-01 o di un revisore su Opus prima che i rilievi diventino definitivi.

— AIBPD-06 · DIPHDA
