AIBPD-10 · RASALHAGUE — Senior Business Development Manager, reparto AIBPD (AI Business & Product Development)

**Nota di contesto.** Non avevo il tool `agent`, quindi non ho potuto caricare AIBPD-01 · ALDERAMIN. Consegno il rapporto alla sessione che mi ha avviato, perché lo inoltri al direttore. Ho lavorato in sola lettura su `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-10-1` e non ho modificato nessun file.

Ho letto `partner/accordi.md` e l'ho confrontato con: README, `roadmap/roadmap.md`, `roadmap/portafoglio.md`, `crescita/prezzi.md`, `crescita/imbuto.md`, `vendite/previsione.md`, `vendite/pipeline.csv`, `clienti/fidelizzazione.md`, `marketing/*`, `mercato/*` e `finanza/business-case.md`.

**Dato di riferimento.** L'ARPU 2026 è 21.630 € / 412 = **52,50 € al mese** per locale, IVA esclusa (README:10, prezzi.md:14). Margine lordo 78% (README:11). IVA al 22%: è una mia ipotesi, non è scritta nei documenti.

---

## Esito

**Nessuno dei due accordi va firmato nel testo attuale.**

- **Cassa Facile:** il canale ha senso economico solo se il compenso è limitato ai clienti portati davvero. Oggi lega Turnio per 10 anni senza possibilità di uscita e promette un'API che la roadmap non prevede prima del Q3 2027.
- **Associazione:** a Turnio resta il 30% del listino (il 20% sugli annuali), per sempre. Sul piano Base il ricavo netto può scendere sotto il costo di servizio. L'accordo va anche contro l'obiettivo O3.

### Avviso P0 da girare subito all'utente

Per Cassa Facile si sommano tre condizioni:
- esclusiva su tutta Italia;
- nessun obiettivo minimo;
- durata 5+5 anni senza recesso.

Insieme rendono la firma di dicembre irreversibile per 10 anni. Va fermata finché queste clausole non cambiano.

---

## Rilievi · 1 Cassa Facile S.r.l.

**CF-1 · P0 · Esclusiva, obiettivi e durata** (accordi.md:12, 13, 17)
- **Problema:**
  - Il partner ha 3 commerciali e lavora solo in Emilia-Romagna (accordi.md:7), ma ottiene l'esclusiva su tutta Italia per il canale dei rivenditori di cassa.
  - Non ha obiettivi minimi.
  - Il contratto dura 5 anni più 5 di rinnovo automatico, e nessuna delle parti può recedere.
- **Conflitto con un canale esistente:** «Fornitori della cassa» ha già portato 26 clienti a CAC 0 € (imbuto.md:34), cioè fornitori al plurale. Con l'esclusiva Turnio non potrebbe più fare accordi con nessun altro rivenditore di cassa in Italia.
- **Modifica proposta:**
  - esclusiva, se proprio serve, solo per l'Emilia-Romagna;
  - esclusiva legata a obiettivi minimi (per esempio N clienti attivati a semestre), che decade se non vengono raggiunti;
  - durata 2 anni, rinnovo solo per accordo scritto;
  - recesso per entrambe le parti con 3–6 mesi di preavviso e recesso per inadempimento;
  - escludere dall'esclusiva i rapporti con i fornitori di cassa già attivi.

**CF-2 · P1 · Clienti riconosciuti da qualunque canale** (accordi.md:15)
- **Problema:** il compenso spetta per ogni cliente con sede in Emilia-Romagna «da qualunque canale arrivi». Turnio ha sede a Bologna (README:9), quindi la regione è probabilmente il suo mercato principale. Pagherebbe commissioni anche sui clienti che arrivano da vendita diretta, Google Ads e referral.
- **Dato mancante:** i documenti non dicono quanti clienti nuovi arrivano oggi dall'Emilia-Romagna, quindi il costo non si può quantificare.
- **Modifica proposta:**
  - riconoscere solo i clienti registrati prima dal partner (registrazione dell'opportunità con data, validità 90 giorni);
  - in caso di doppia registrazione vale la prima;
  - esclusi i clienti già in pipeline o già clienti.

**CF-3 · P1 · API pubblica da gennaio 2027 incompatibile con la roadmap** (accordi.md:16 contro roadmap.md:29)
- **Problema:**
  - L'API pubblica è in roadmap al **Q3 2027**, con la squadra B, 10 settimane, priorità P2.
  - Nel Q1 la squadra B ha già 6 + 8 = 14 settimane di lavoro su 13 disponibili (roadmap.md:13, 21–22). Anche la squadra A è oltre: 14 + 6 = 20 su 13.
  - Avere l'API a gennaio vorrebbe dire averla finita entro dicembre 2026, ed è impossibile.
- **Modifica proposta:**
  - legare l'integrazione al rilascio dell'API come da roadmap (Q3 2027), senza penali;
  - nel frattempo, se serve, offrire solo l'esportazione CSV già prevista nel Q1 (roadmap.md:21).
  - Anticipare l'API è una scelta di roadmap e la decide l'utente: il product manager deve indicare cosa si toglie.

**CF-4 · P2 · Compenso calcolato con l'IVA inclusa** (accordi.md:14)
- **Problema:** il 25% «dell'importo incassato, IVA compresa» fa pagare una commissione anche sull'IVA, che Turnio versa allo Stato. Sul ricavo netto il compenso vale il 25% × 1,22 = **30,5%**.
- **Modifica proposta:** 25% (o la percentuale che si negozia) dell'imponibile incassato, IVA esclusa. Solo sui piani: niente compenso su moduli, servizi extra o importi rimborsati. Il compenso si paga dopo l'incasso e si recupera se il cliente disdice o non paga entro il periodo.

**CF-5 · P2 · Stesso cliente su due canali in pipeline** (pipeline.csv:4 e :13; previsione.md:26)
- **Problema:**
  - Gruppo Portico (4 locali, Plus) compare due volte: come D-03 in vendita diretta (4.039 €, sconto 15%) e come P-07 tramite Cassa Facile (3.802 €, sconto 20%).
  - La previsione Q1 somma entrambe: D-03 + D-06 + D-08 + P-07 + P-11 = 18.584 €. Il valore è contato due volte.
  - Il conflitto fra canali è già in corso, e lo stesso cliente riceve due prezzi diversi.
- **Modifica proposta:** regola di attribuzione nel contratto (vedi CF-2) e un'unica opportunità per cliente nel CRM. Il caso va segnalato anche al Sales & Revenue Strategist.

**CF-6 · P1 · Errore nella valutazione: «senza costo di acquisizione»** (accordi.md:32)
- **Errore:** il compenso è un costo di acquisizione. Sul cliente medio vale:

| Voce | Calcolo | Importo |
|---|---|---|
| Compenso, abbonamento mensile | 52,50 € × 1,22 × 25% × 12 | 192,15 € per cliente |
| Compenso, abbonamento annuale | 52,50 × 10 × 1,22 × 25% | 160,13 € per cliente |

- **Confronto:** è più del doppio del CAC di Google Ads (95 €, imbuto.md:31) e più del canale cassa attuale (0 €).
- **Il canale resta conveniente:** nel primo anno il margine lordo è 630 € × 78% − 192,15 € = **299 €** per cliente. Questo però vale solo per i clienti portati davvero dal partner, non per tutti quelli dell'Emilia-Romagna (CF-2).
- **Altro errore:** i «900 locali» sono i clienti del partner, cioè persone raggiungibili, non clienti previsti. Manca una stima di conversione.
- **Modifica proposta:** rifare la valutazione con questo CAC e con scenari di conversione dichiarati (per esempio 2%, 5% e 10% dei 900 locali = 18, 45 e 90 clienti). Le percentuali sono ipotesi da validare.

---

## Rilievi · 2 Associazione Esercenti Riuniti

**AS-1 · P1 · Sconto e compenso insieme lasciano a Turnio il 30% del listino** (accordi.md:26–27)
- **Calcolo:** il socio paga il 60% del listino e l'associazione riceve il 30% del listino. All'associazione va quindi la metà di ciò che Turnio incassa.

Per locale, al mese, IVA esclusa:

| Piano | Listino | Turnio incassa | All'associazione | Resta a Turnio |
|---|---|---|---|---|
| Base | 29 € | 17,40 € | 8,70 € | **8,70 €** |
| Pro | 59 € | 35,40 € | 17,70 € | **17,70 €** |
| Plus | 99 € | 59,40 € | 29,70 € | **29,70 €** |

- **Con l'abbonamento annuale è peggio** (10 mesi pagati su 12, prezzi.md:12), se il compenso resta di 12 mesi sul listino. Esempio Pro: incasso 354 € l'anno, compenso 212,40 €, restano 141,60 € = 11,80 € al mese, il **20% del listino**.
- **Costo di servizio (stima):** al 78% di margine lordo il costo è circa 11,55 € al mese per locale (52,50 × 22%).
  - Ipotesi A, costo per locale quasi fisso (hosting, SMS, supporto): il piano Base va in **perdita** (8,70 − 11,55 = −2,85 € al mese) e il Pro resta con circa 6 €.
  - Ipotesi B, costo proporzionale al ricavo: Base circa +4,9 €.
  - In entrambi i casi il margine è molto più basso di quello del canale diretto.
- **Modifica proposta:**
  - calcolare il compenso su quanto Turnio incassa davvero, non sul listino;
  - compenso a durata limitata (per esempio 12 mesi, come Cassa Facile) oppure una tantum per socio attivato;
  - sconto più basso (per esempio 15–20%) e solo per i primi 12 mesi, poi listino;
  - indicare se lo sconto si somma all'annuale: va escluso, oppure si sceglie uno dei due;
  - indicare se lo sconto vale anche sui 2 € per dipendente oltre soglia.

**AS-2 · P1 · Sconto e compenso durano più dell'accordo** (accordi.md:26–28)
- **Problema:** l'accordo dura 2 anni con recesso, ma lo sconto vale «per tutta la durata dell'abbonamento» e il compenso «ogni mese». Non è scritto cosa succede quando l'accordo finisce. Così l'impegno può non avere fine.
- **Modifica proposta:** dire in modo esplicito che il compenso cessa quando finisce l'accordo. Per lo sconto: o cessa anche lui, o resta solo per i soci già abbonati, per al massimo 12 mesi.

**AS-3 · P2 · Chi è un «socio abbonato» non è definito** (accordi.md:27)
- **Problema:**
  - Senza una definizione, l'associazione può chiedere il compenso anche per i soci che sono già clienti o che arrivano da altri canali.
  - I clienti attuali in Lombardia e Veneto che sono soci possono chiedere il 40% di sconto. Questo toglierebbe ricavi già acquisiti.
- **Modifica proposta:** riconoscere solo i nuovi clienti arrivati con un codice o un link dell'associazione dopo la firma. Esclusi i clienti già attivi.

**AS-4 · P2 · Conflitto con l'obiettivo O3 e con la politica degli sconti** (roadmap.md:9; previsione.md:8; pipeline.csv:7)
- **O3 (ARPU +10%, cioè 57,75 €):** con 100 soci su Pro, l'ARPU lordo scende a (21.630 + 3.540) / 512 = **49,16 €, −6,4%**. Al netto del compenso scende ancora di più.
- **Politica degli sconti:** oltre il 20% serve l'approvazione del CEO caso per caso. Un 40% fisso supera la regola. Crea anche un precedente per i clienti diretti della stessa zona: D-06 ha già il 35%.
- **Modifica proposta:**
  - sconto entro il 20%;
  - comunicazione ai soci come «offerta riservata» con un codice;
  - le sue misure dichiarate nel piano O3.

**AS-5 · P2 · Valutazione senza numeri** (accordi.md:32)
- **Problema:**
  - «4.200 soci» indica persone raggiungibili, non clienti.
  - «Irrinunciabile» è un'affermazione senza prove.
  - Manca il segmento: il target è 3–40 dipendenti, il 31% dei locali (sintesi-mercato.md:29), cioè circa 1.300 soci se la quota è la stessa. È una stima.
  - Mancano le conversioni e il conto per piano.
- **Modifica proposta:** scenari espliciti (per esempio 1%, 3% e 5% dei soci in target), con il margine per piano della tabella AS-1 e il confronto con il CAC degli altri canali.

**Nota normativa (non è un rilievo).** La scheda «riduzioni-di-prezzo» della biblioteca riguarda l'art. 17-bis del Codice del consumo (Normattiva, testo in vigore dal 2 aprile 2023, verificata il 2026-11-19). Vale per gli sconti mostrati ai consumatori. I clienti di Turnio sono imprese (README:12), quindi probabilmente non si applica. Se nelle newsletter si mostra un prezzo barrato, conviene farlo verificare dalla revisione legale.

---

## Domande aperte (per l'utente o il responsabile interno, il Fondatore)

1. Quanti clienti nuovi all'anno arrivano oggi dall'Emilia-Romagna, e da quali canali? Serve a stimare il costo di CF-2.
2. Chi sono i «fornitori della cassa» dei 26 clienti attuali, e ci sono accordi in corso? Serve a capire il conflitto con l'esclusiva di CF-1.
3. Quale mix di piani ci si aspetta dai soci dell'associazione? E il costo di servizio è per locale o proporzionale al ricavo? Serve per AS-1.
4. Si vuole davvero anticipare l'API pubblica? Se sì, quale iniziativa del Q1–Q2 si toglie? La decisione è dell'utente, con il Product Portfolio & Roadmap Manager.
5. Gruppo Portico: a quale canale si assegna, e a quale prezzo?

## Decisioni che richiedono l'approvazione umana

- Negoziare con le controparti le modifiche proposte. Io non contatto nessuno: il contatto spetta all'utente.
- Firmare o non firmare a dicembre.
- Cambiare la roadmap per l'API.
- Approvare uno sconto strutturale oltre il 20%.

**Passaggi di consegne suggeriti**
- **Business & Financial Analyst:** scenari di margine dei due canali.
- **Sales & Revenue Strategist:** CF-5 e regole di attribuzione nel CRM.
- **Revisione legale umana:** clausole di durata, recesso ed esclusiva.

Analisi, non consulenza legale o fiscale. — RASALHAGUE (AIBPD-10)
