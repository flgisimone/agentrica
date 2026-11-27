AIWDA-04 · ACRUX — Senior Information Architect, reparto AIWDA (AI Web Design)

**Esito**: audit in sola lettura dell'architettura informativa del pannello Turnio. Ho letto README, docs/mappa.md, docs/glossario.md, ricerca/sintesi.md e interviste.md, il menu e le intestazioni delle quattro pagine, `js/app.js` e la schermata impostazioni-computer.png. Non ho aperto le altre schermate, che non servivano per la struttura. Non ho caricato AIWDA-01 né le schede della biblioteca (nessuna è pertinente alla struttura). Nessun file modificato. Le priorità sono proposte per la revisione del direttore CANOPUS e dell'utente. Il modello è più piccolo di quello della sessione: propongo il riesame di CANOPUS sui P1.

**Mappa osservata** (menu: Settings, Dashboard, Squadra, Turni; profondità massima 4 livelli, solo in Impostazioni)
- Settings (`impostazioni.html`, h1 «Impostazioni») contiene tre cose: Locale (nome, orari) › Esporta › Presenze per il consulente / Report del costo del lavoro; Scambi da approvare (badge 3, chiuso); Zona pericolosa con «Elimina locale».
- Dashboard (`index.html`): banner «3 scambi da approvare» (solo testo), numeri, grafici.
- Squadra (`dipendenti.html`, h1 «Personale»): elenco e modulo di aggiunta.
- Turni (`turni.html`): griglia della settimana, pubblicazione, finestra «Swap del turno».

**Rilievi**

1. **P1 · Gli scambi da approvare stanno nelle Impostazioni, chiusi in un `<details>`.**
   - Evidenza: `impostazioni.html:41-50`; `docs/mappa.md` riga Settings; sintesi.md raccomandazione 3 («lo scambio resta nelle impostazioni, perché si configura una volta sola»). Il compito 2 del README è invece frequente, più volte a settimana.
   - Interviste: I4 «non capisco dove approvarli».
   - Inferenza: la raccomandazione scambia l'impostazione con l'approvazione. Si configura una volta, ma si approva spesso.
   - Correzione: spostare l'approvazione in Turni (sezione o scheda «Scambi da approvare» con badge) e farne il banner di `index.html:~22` un link. Lasciare nelle Impostazioni solo la configurazione della regola, se esiste. Correggere la raccomandazione in sintesi.md.

2. **P1 · Il banner «3 scambi da approvare» nel cruscotto non è un collegamento.**
   - Evidenza: `index.html` (`<div class="banner card">` con `<span>`), nessun link.
   - Impatto: l'utente vede l'avviso ma non ha una via alla funzione.
   - Correzione: renderlo un link alla vista scambi (vedi rilievo 1).

3. **P1 · «Esporta» è annidato quattro livelli sotto Impostazioni › Locale, con tre `<details>` chiusi.**
   - Evidenza: `impostazioni.html:22-39`; `docs/mappa.md` (catena Impostazioni › Locale › Esporta › Presenze per il consulente); I1: «non trovo mai dove sta il pulsante».
   - L'esportazione mensile è il compito 4 del README. Una funzione frequente sta in una collocazione inattesa, e non è un'impostazione del locale.
   - Correzione: pagina o voce di menu «Esporta» (o «Presenze e report»). In alternativa, sezione sempre visibile in Squadra o in una pagina «Report». Nessun annidamento oltre 2 livelli.

4. **P2 · «Report del costo del lavoro» compare in due posti, ma il suo link è nascosto.**
   - Evidenza: `docs/mappa.md` lo elenca sia in Settings › Esporta sia in Dashboard (il grafico «Costo del lavoro per ruolo», `index.html:50`); il pulsante «Scarica il report» è in `impostazioni.html:35-36`, il grafico non offre un accesso.
   - Correzione: un solo punto di scarico, con link dal cruscotto accanto al grafico. Chiarire in mappa.md che la Dashboard mostra, non scarica.

5. **P2 · Nome del menu diverso dal titolo della pagina in tre voci su quattro, più un termine in inglese.**
   - Evidenza: menu `Settings` (`index.html:12` e altre pagine) contro h1 «Impostazioni» (`impostazioni.html:19`); menu `Squadra` contro h1 «Personale» (`dipendenti.html:19`) e file `dipendenti.html`; `Dashboard` contro nessun termine italiano. Il glossario dice che il pannello è in italiano e il termine è «dipendente».
   - Impatto: la voce attiva (`aria-current`) non coincide con ciò che l'utente legge nella pagina.
   - Correzione: voce = h1. Proposta «Impostazioni», «Cruscotto» (come nel README), «Dipendenti», «Turni».

6. **P2 · Sinonimi incoerenti e termini vietati dal glossario.**
   - Evidenza: «Aggiungi una risorsa» (`dipendenti.html:32`, «risorsa» vietato); «Cerca un collaboratore» (`dipendenti.html:20`, «collaboratore» vietato); «Swap del turno» (`turni.html:51`, «swap» vietato; termine «scambio»); «Nome del negozio» (`impostazioni.html:24`, «negozio» vietato, termine «locale»); «fascia» (`turni.html`, vietato, termine «turno»); «Zona pericolosa» e «Elimina locale» vs «Elimina settimana».
   - Correzione: allineare al glossario (anche i testi li verificherebbe il UX Writer).

7. **P2 · Ordine del menu non segue la frequenza dei compiti.**
   - Evidenza: `docs/mappa.md` («l'ordine segue quello delle pagine nella cartella»); nav `index.html:12-15`: Settings primo, Turni ultimo; il compito più frequente (turni) è l'ultima voce. La mappa dichiara però la prima pagina il cruscotto.
   - Correzione: Turni, Dipendenti, Cruscotto, Impostazioni (o con «Esporta» prima di Impostazioni), con Impostazioni in fondo.

8. **P2 · La pagina iniziale non coincide con l'uso emerso dalla ricerca.**
   - Evidenza: sintesi.md raccomanda il cruscotto come prima pagina, ma I1, I2, I4, I5 lo giudicano poco utile; vogliono «vedere la settimana» e «chi manca oggi»; tre su cinque preparano i turni dal telefono. La sintesi riporta come «tutti» richieste che solo I3 ha espresso.
   - Inferenza (da verificare con l'utente): partire da Turni, o dal cruscotto con «chi è di turno oggi» e gli scambi da approvare in cima.
   - Flag: `requires_human_review: true`, perché la decisione tocca la logica di prodotto.

9. **P2 · Etichette di azione poco chiare, nella parte di navigazione e orientamento.**
   - Evidenza: «Clicca qui» (`impostazioni.html:32`) per l'export delle presenze; pulsante «Procedi» (`dipendenti.html:50`) invece di un verbo; «OK»/«No» (`impostazioni.html:44-48`) per approvare o rifiutare uno scambio; «Elimina settimana» con stile `btn-primary` accanto a «Pubblica i turni» (`turni.html:27-28`, azione distruttiva primaria vicina a quella principale).
   - Correzione: «Esporta le presenze», «Aggiungi il dipendente», «Approva»/«Rifiuta», e un pulsante distruttivo separato. Rimando a UX Writer e Usability Auditor per i dettagli.

10. **P3 · Titoli di pagina non distinguibili e orientamento debole.**
    - Evidenza: `<title>Turnio</title>` identico in tutte e quattro le pagine (`index.html:6` e le altre). Nessuna indicazione del locale nel menu; il nome compare solo come testo del cruscotto.
    - Correzione: `<title>Turni · Turnio</title>` ecc.

11. **P3 · Ricerca presente solo in Squadra e limitata al nome.**
    - Evidenza: `dipendenti.html:20`, `js/app.js:74`. Non c'è ricerca globale; nessuna funzione cerca turni o scambi.
    - Fatto osservato: la ricerca copre l'elenco dei dipendenti. Inferenza: una ricerca più ampia non è necessaria a 4 pagine; non proporla ora.

12. **P3 · Il modulo di aggiunta del dipendente è collocato sotto l'elenco, con 14 campi, di cui molti non richiesti dal compito.**
    - Evidenza: `dipendenti.html:32-50` (codice fiscale, IBAN, indirizzo, livello CCNL…); il README descrive l'invito con «nome e numero di telefono».
    - Correzione di posizione: azione «Aggiungi dipendente» in cima all'elenco, modulo in pagina o finestra; campi non necessari all'invito spostati nella scheda del dipendente. Rimando a UX Designer e Privacy (minimizzazione dei dati).

**Struttura proposta (da confermare con l'utente)**: Turni (con Scambi da approvare e badge) › Dipendenti › Cruscotto › Esporta › Impostazioni (Locale; zona pericolosa). Resta aperta la scelta della pagina iniziale (rilievo 8).

**Domande aperte**
- Le Impostazioni contengono davvero una configurazione degli scambi? Nel codice non c'è alcun campo: se non esiste, la sezione scambi non appartiene lì.
- Una pagina di esportazione dedicata è accettabile come logica di business?
- Pagina iniziale: cruscotto o Turni?

**Limiti**: pagine statiche; non ho provato il comportamento dei `<details>` né i flussi nel browser; ho guardato solo la schermata impostazioni-computer.png. Non so se esistono ruoli o permessi diversi tra titolare e responsabile (non deducibili dal codice), né la struttura dell'app sul telefono.

— AIWDA-04 · ACRUX
