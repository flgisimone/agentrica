AIBPD-11 · KOCHAB — Senior Customer Success & Retention Strategist, reparto AIBPD (AI Business & Product Development)

Rapporto per AIBPD-01 · ALDERAMIN. Non ho potuto caricare il direttore, perché in questa sessione non ho il tool `agent`. Il rapporto va quindi a lui così com'è.

**Perimetro.** Ho letto in sola lettura `clienti/fidelizzazione.md` e `clienti/coorti.csv` e ho controllato dove vengono citati (`roadmap/roadmap.md`, `finanza/business-case.md`, `crescita/prezzi.md`). Non ho modificato nessun file. Tutti i conti sono miei e si ricavano dai dati del documento. Nel README il progetto è dichiarato di prova, con numeri inventati.

## Esito

Le due metriche principali sono calcolate male e vanno nella direzione sbagliata:
- l'NRR reale è circa 87%, non 108%;
- l'abbandono è sottostimato.

I due indicatori di processo, salute del cliente e attivazione, non misurano il rischio vero. Il motivo d'uscita più citato è «i dipendenti non usano l'app» (41%), e nessuno dei due lo osserva. Il documento non regge come base per il piano 2027 senza le correzioni qui sotto.

## Rilievi

**1. P1 · NRR calcolato solo su chi è rimasto** (`clienti/fidelizzazione.md:18-20`)
- **Errore:** 15.020 / 13.900 = 108% esclude dal denominatore l'MRR dei clienti persi. Un NRR con il denominatore ristretto ai sopravvissuti non scende mai per l'abbandono.
- **Conto corretto:** NRR = MRR di oggi dei 330 clienti iniziali / MRR iniziale dei 330 = 15.020 / 17.200 = **87,3%**.
  - MRR perso con gli 81 clienti usciti: 17.200 − 13.900 = 3.300 € (19,2%).
  - Espansione: +1.120 € (+6,5%).
  - Per la GRR serve separare i passaggi a piani inferiori, che oggi non sono indicati.
- **Frase da correggere:** «la base cresce anche senza clienti nuovi» è falsa. Senza clienti nuovi l'MRR passa da 17.200 a 15.020 € (−12,7%).
- **Correzione:** pubblicare NRR 87% e GRR con la formula esplicita.

**2. P1 · Tasso di abbandono diviso per i clienti di fine periodo** (`clienti/fidelizzazione.md:14`)
- **Errore:** 98 / 412 = 23,8% usa al denominatore una base gonfiata dai clienti nuovi.
- **Conti corretti:**
  - Abbandono della base iniziale: (330 − 249) / 330 = 81 / 330 = **24,5%**.
  - Oppure, contando tutti i 98 persi, 98 / base media ((330 + 412) / 2 = 371) = **26,4%**.
- **Effetti a valle:**
  - L'obiettivo O1 («sotto il 20%», `roadmap/roadmap.md:7`) parte da una base sbagliata e senza una formula: va ricalibrato e la formula va fissata.
  - `finanza/business-case.md:12` usa «12% l'anno come per Turnio». Il dato non corrisponde a nessun numero di `clienti/` ed è circa la metà del valore reale. Inoltre 1% al mese composto fa l'11,4% l'anno, non il 12%. Il caso va passato al Financial Analyst.
- **Correzione:** dichiarare la formula e ricalcolare. Conviene affiancare un tasso mensile e separare piano mensile e annuale: il 22% dei clienti è annuale (`crescita/prezzi.md:12,18`) e non può uscire a metà contratto, quindi l'abbandono dei mensili è più alto della media.

**3. P1 · Ritenzione a 6 mesi senza la coorte peggiore** (`clienti/fidelizzazione.md:26`, `coorti.csv:2-7`)
- **Errore:** la coorte di marzo 2026 è esclusa perché «anomala». È la coorte più grande (24 clienti), arrivata con una promozione, ed è proprio il rischio da misurare.
- **Ritenzione a 6 mesi per coorte:**

| Coorte | Ritenzione a 6 mesi |
|---|---|
| novembre 2025 | 85,7% |
| dicembre 2025 | 90,9% |
| gennaio 2026 | 81,3% |
| febbraio 2026 | 86,7% |
| marzo 2026 | **58,3%** |
| aprile 2026 | 88,9% |

- **Conti:**
  - La media semplice senza marzo dà 86,7%, cioè l'87% del documento.
  - Con marzo, la media semplice scende a **82,0%**.
  - La media pesata sui clienti, più corretta, è **79,6%** (78 / 98). Senza marzo sarebbe 86,5%.
- **Correzione:** riportare la media pesata con tutte le coorti e mostrare marzo a parte come «coorte promozionale», insieme a una lettura sul costo delle promozioni.

**4. P2 · Coorti incoerenti con il conteggio degli abbandoni** (`coorti.csv` contro `fidelizzazione.md:9-12`)
- **Incoerenza:**
  - I nuovi delle coorti sommano 180 (torna).
  - Clienti nuovi persi secondo il bilancio: 98 − 81 = 17.
  - Clienti nuovi persi secondo l'ultima colonna disponibile del CSV: almeno 23 (2+1+3+2+10+2+1+1+1).
  - Con 23 persi resterebbero al massimo 157 nuovi + 249 = 406 locali, non 412.
- **Causa probabile:** «attivi» non è definito. Se indica l'uso e non il pagamento, la tabella misura l'utilizzo e non la ritenzione dei paganti. Altrimenti uno dei totali è sbagliato.
- **Correzione:** definire «attivo», ad esempio «pagante alla fine del mese N», e riconciliare CSV e bilancio clienti.

**5. P2 · NPS: conto sbagliato e campione distorto** (`clienti/fidelizzazione.md:31`)
- **Conto:** (52 − 8) / 74 = 59,5%, quindi **NPS 59**, non 61.
- **Campione:**
  - Sono stati coinvolti solo i clienti con più di sei mesi: i sopravvissuti, senza i clienti nuovi né quelli usciti.
  - Hanno risposto in 74 su 268, cioè il 27,6%, con un'autoselezione probabile.
  - Il margine di errore al 95% è di circa ±13 punti (con la correzione per popolazione finita), e non include la distorsione da mancata risposta.
- **Correzione:** scrivere «59 (circa 46–72), solo clienti con più di 6 mesi, 28% di risposte». In futuro estendere il sondaggio a tutti i paganti e analizzarlo per anzianità e piano.

**6. P1 · Il punteggio di salute non osserva il primo motivo di abbandono** (`clienti/fidelizzazione.md:35-48`)
- **Problema:** il 41% di chi esce dice che i dipendenti non usano l'app, e l'uso settimanale medio è solo il 22% (riga 37). Il punteggio però pesa il 40% sugli accessi del titolare al pannello web e il 30% sui turni pubblicati, e non contiene nessun segnale d'uso dei dipendenti. Un locale può avere un punteggio alto mentre il personale non timbra.
- **Ticket al supporto:** il «meno è meglio» (20%) può premiare il disinteresse, perché un cliente che non chiede niente spesso ha smesso di usare l'app.
- **Taratura:** la soglia 40 non risulta verificata sui 98 clienti persi.
- **Correzione proposta:**
  - Aggiungere come segnale principale la quota di dipendenti invitati che timbrano o aprono l'app ogni settimana, e il rapporto fra timbrature e turni pubblicati.
  - Trattare i ticket come segnale neutro, o leggere l'assenza di contatti insieme al calo d'uso.
  - Ricalibrare pesi e soglia sui clienti persi negli ultimi 12 mesi, confrontando il punteggio 4–8 settimane prima dell'uscita.
- **Altro da precisare:** nella riga 37, il 22% non dice se è la media dei locali o la quota sul totale dei dipendenti. I locali vanno da 3 a 40 dipendenti, quindi le due medie possono differire molto.

**7. P1 · L'attivazione misura la registrazione, non il valore** (`clienti/fidelizzazione.md:52-53`)
- **Problema:** «account creato ed email confermata» al 97% non dice se il locale usa il prodotto. La conclusione «non richiede interventi nel 2027» contraddice il 41% dei motivi d'uscita e la ritenzione delle coorti.
- **Correzione proposta:** definire l'attivazione come «primo turno pubblicato e almeno il X% dei dipendenti che timbrano entro 14 giorni». X va fissato sui dati: confrontare la ritenzione a 3 e 6 mesi di chi raggiunge la soglia e di chi no. Poi misurare il tempo fino all'attivazione e ritirare la conclusione «nessun intervento».

**8. P3 · Questionario di uscita** (`clienti/fidelizzazione.md:35`)
- **Problema:** il documento riporta 98 risposte su 98 clienti persi, mancati pagamenti compresi. È poco plausibile.
- **Correzione:** verificare il numero reale di risposte e separare le disdette dai mancati pagamenti: il mancato pagamento può essere una carta scaduta, cioè un abbandono involontario recuperabile con i solleciti.

## Domande aperte
- Cosa vuol dire «attivi» in `coorti.csv`?
- Qual è l'MRR perso per passaggi a piani inferiori, che serve per la GRR?
- Come si divide l'abbandono fra clienti mensili e annuali?
- Quante risposte ha avuto davvero il questionario di uscita?
- Esistono i dati d'uso per singolo dipendente, che servono per il nuovo punteggio e la nuova attivazione?

## Biblioteca
Ho letto la scheda «funzione-di-recesso»: art. 54-bis del Codice del consumo, fonte Normattiva, introdotto dal D.lgs. 209/2025, verificata il 2026-11-19, da ricontrollare entro il 2027-05-19. I clienti di Turnio sono imprese, quindi probabilmente non si applica. Il principio vale comunque per il playbook di fidelizzazione: nessuna misura deve rendere la disdetta più difficile della sottoscrizione. L'applicabilità va confermata con la revisione legale.

## Passaggi di consegne
- **Financial Analyst:** l'ipotesi di abbandono del 12% in `finanza/business-case.md:12`.
- **Product Manager:** la misura dell'obiettivo O1 in `roadmap/roadmap.md:7`.
- **Privacy:** solo se il nuovo punteggio userà dati d'uso per singolo dipendente.

Tutte le correzioni sono proposte e diventano definitive solo con la conferma dell'utente.

Firmato: KOCHAB (AIBPD-11)
