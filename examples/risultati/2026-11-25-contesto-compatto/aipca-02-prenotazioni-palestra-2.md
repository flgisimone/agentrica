AIPCA-02 · ALIOTH — Senior GDPR & Data Protection Specialist, reparto AIPCA (AI Privacy & Compliance)

Non ho caricato il direttore AIPCA-01 con i tool di Agentrica, perché questa prova li vieta. Ho usato le sue regole comuni, che sono nel file di testo. Il compito non tocca le schede della biblioteca (AI Act, adeguatezza, L. 132/2025), quindi non le ho lette. I rilievi si basano solo sui file della cartella, letti in sola lettura. Il servizio non è stato avviato e non ho accesso a produzione.

## Esito in breve

Il servizio prenota lezioni di prova in una palestra. Raccoglie nome, email, telefono, codice fiscale, data di nascita e un campo libero su patologie, infortuni e farmaci. Il campo libero contiene dati sulla salute (art. 9).

Ho trovato 9 rilievi: 2 P1, 5 P2 e 2 P3. Nessun P0. Non rilevo violazioni in corso, ma serve una decisione del titolare sui dati sanitari (R1) e sull'invio a terzi (R2).

Non dichiaro la conformità del servizio nel suo insieme. Nel repository non c'è documentazione (informativa, registro dei trattamenti, contratti con i fornitori, tempi di conservazione), quindi tutto ciò che dipende da questi documenti è `non_verificabile`.

## Mappa dei dati

| Dato | Dove nasce | Dove va |
|---|---|---|
| Corso, giorno | `public/index.html:13,19` | `prenotazioni.jsonl`, log, statistiche (solo il corso) |
| Nome e cognome | `public/index.html:20` | `prenotazioni.jsonl`, log |
| Email | `public/index.html:21` | `prenotazioni.jsonl`, log, **servizio di statistiche** (`server.js:37`) |
| Telefono | `public/index.html:22` | `prenotazioni.jsonl`, log |
| Codice fiscale | `public/index.html:23` | `prenotazioni.jsonl`, log |
| Data di nascita | `public/index.html:24` | `prenotazioni.jsonl`, log |
| Patologie, infortuni, farmaci (art. 9) | `public/index.html:26-27` | `prenotazioni.jsonl`, log |
| Preferenza newsletter | `public/index.html:30` | `prenotazioni.jsonl` |

- **Interessati:** persone che prenotano una lezione di prova. Possono essere minorenni, perché il modulo non lo esclude e la data di nascita è raccolta.
- **Finalità desumibili dal README:** preparare le lezioni (`README.md:11`), statistiche (`README.md:10`) e newsletter (`index.html:31`).
- **Base giuridica dichiarata:** nessuna, in nessun file.
- **Conservazione:** nessun limite. Le prenotazioni "restano nel file" (`README.md:11`).

## Rilievi

### R1 · Dati sulla salute raccolti senza base giuridica art. 9
- **Area:** categorie particolari di dati
- **Stato:** `non_conforme`
- **Gravità:** alta
- **Priorità:** P1
- **Rischio:** il campo libero invita a scrivere patologie e farmaci. Sono dati sulla salute, con un rischio alto per gli interessati se si perdono o si diffondono.
- **Riferimenti:** GDPR art. 9(1) e 9(2)(a), art. 5(1)(c) e (a), art. 7
- **Evidenze:**
  - `public/index.html:26-27`: campo libero senza avviso e senza consenso esplicito separato.
  - `server.js:26`: il dato viene salvato.
  - `server.js:32`: lo stesso dato finisce nei log.
- **Lacune:** non so se il titolare abbia una base art. 9 diversa dal consenso (per esempio tutela della salute in ambito sportivo). Nei file non c'è.
- **Raccomandazione:**
  - Valutare se il dato serve davvero per una lezione di prova.
  - Se serve, usare una casella da spuntare o una domanda mirata, per esempio "ho controindicazioni, parlane con l'istruttore", al posto del testo libero.
  - Se resta il testo libero, raccogliere un consenso esplicito e separato, non pre-selezionato, con informativa specifica.
  - Il titolare, con il DPO o un consulente legale, deve decidere la base giuridica.
- **Responsabile suggerito:** titolare, con DPO o consulente legale; poi Software Agency, previa approvazione umana.
- **Verifica:** nel modulo compare il consenso art. 9 separato oppure il campo libero non c'è più, e `prenotazioni.jsonl` e i log non contengono testo libero sulla salute.

### R2 · Invio dell'email a un servizio di statistiche esterno, senza informativa né accordo
- **Area:** destinatari, finalità, fornitori
- **Stato:** `non_conforme`
- **Gravità:** alta
- **Priorità:** P1
- **Rischio:** l'email di chi prenota viene inviata a `stats.example.com` a ogni prenotazione. Un evento statistico non ha bisogno di un identificativo diretto. L'interessato non è informato e la base giuridica è assente.
- **Riferimenti:** GDPR art. 5(1)(b) e (c), art. 6, art. 13(1)(e), art. 25, art. 28; art. 44 e seguenti se il fornitore è fuori dallo SEE
- **Evidenze:**
  - `server.js:8`: URL del servizio.
  - `server.js:34-38`: l'invio, con `email` nel corpo (`server.js:37`).
  - `README.md:10`: dice che l'evento va al "servizio di statistiche della palestra".
- **Lacune:**
  - Non so chi sia il fornitore né dove risieda.
  - Non so se esista un accordo art. 28.
  - Il dominio sembra un segnaposto (`example.com`), da confermare con il titolare.
- **Raccomandazione:**
  - Togliere l'email dall'evento e inviare solo dati aggregati o non identificanti (corso, data).
  - Se l'identificativo serve, documentare finalità e base giuridica, inserire il destinatario nell'informativa e verificare l'accordo art. 28 e gli eventuali trasferimenti extra-SEE. Per le adeguatezze, la biblioteca del reparto ha la scheda `decisioni-adeguatezza`, da consultare se il fornitore è fuori dallo SEE.
  - Il rilievo va approfondito con il vendor specialist (AIPCA-04).
- **Responsabile suggerito:** titolare; Software Agency per la modifica.
- **Verifica:** il corpo della richiesta (`server.js:37`) non contiene più `email`, oppure esistono finalità, informativa e accordo documentati.

### R3 · Nessuna informativa e nessuna base giuridica per i trattamenti
- **Area:** trasparenza e liceità
- **Stato:** `non_conforme`
- **Gravità:** alta
- **Priorità:** P2
- **Rischio:** chi compila il modulo non sa chi tratta i dati, per quali finalità, per quanto tempo, con chi li condivide e come esercitare i diritti.
- **Riferimenti:** GDPR art. 5(1)(a), art. 6, art. 12-14
- **Evidenze:**
  - `public/index.html`: nessun testo né link a informativa o privacy.
  - `public/grazie.html`: nessun riferimento.
  - Nel repository non c'è un file di informativa.
- **Lacune:** l'informativa può esistere altrove, per esempio in reception o sul sito della palestra. Non è verificabile da qui.
- **Raccomandazione:**
  - Preparare un'informativa che indichi titolare e contatti, finalità distinte (prenotazione, statistiche, newsletter, eventuale dato sanitario), basi giuridiche, destinatari, conservazione e diritti.
  - Linkarla dal modulo prima dell'invio.
  - Il testo definitivo va rivisto dal legale (AIPCA-03).
- **Responsabile suggerito:** titolare, con DPO o legale.
- **Verifica:** il modulo mostra un link all'informativa, e l'informativa contiene tutti gli elementi dell'art. 13.

### R4 · Newsletter: consenso pre-selezionato e calcolo che è sempre "sì"
- **Area:** consenso, preferenze
- **Stato:** `non_conforme`
- **Gravità:** media
- **Priorità:** P2
- **Rischio:** la newsletter di marketing è attivata di default, anche se l'utente non vuole riceverla. Il consenso così ottenuto non è valido, e per la posta elettronica di marketing in Italia serve anche il consenso ePrivacy.
- **Riferimenti:** GDPR art. 4(11), art. 6(1)(a), art. 7, considerando 32 e 42, art. 25(2); D.Lgs. 196/2003, art. 130
- **Evidenze:**
  - `public/index.html:30`: casella `checked` per impostazione predefinita.
  - `server.js:27`: `newsletter: form.newsletter !== "no"`. Una casella deselezionata non invia nulla, quindi `form.newsletter` è `undefined` e il risultato è `true`. Il valore è quindi `true` anche se l'utente la deseleziona. Il modulo non invia mai `"no"`.
- **Lacune:** non risulta dal repository come venga usata la newsletter. Non c'è codice di invio.
- **Raccomandazione:**
  - Togliere `checked`.
  - Salvare `true` solo se `form.newsletter === "si"`.
  - Mantenere il consenso separato dalla prenotazione (nessun legame con il servizio richiesto) e registrare data e testo mostrato.
- **Responsabile suggerito:** Software Agency, previa approvazione; titolare per il testo.
- **Verifica:** con la casella non spuntata il record ha `newsletter: false`, e il modulo non la preseleziona.

### R5 · Dati personali completi nei log dell'applicazione
- **Area:** minimizzazione, limitazione della conservazione
- **Stato:** `non_conforme`
- **Gravità:** media
- **Priorità:** P2
- **Rischio:** ogni prenotazione, compresi codice fiscale e testo sanitario, viene scritta nello standard output. I log hanno copie, accessi e conservazione fuori controllo e diventano una seconda banca dati non dichiarata.
- **Riferimenti:** GDPR art. 5(1)(c) ed (e), art. 25, art. 32
- **Evidenze:** `server.js:32`: `console.log("nuova prenotazione", booking)`.
- **Lacune:** non so dove vadano i log in esercizio (journald, hosting, aggregatori).
- **Raccomandazione:** rimuovere il log dell'oggetto completo, o registrare solo un identificativo e l'esito, mai nome, contatti, codice fiscale e salute.
- **Responsabile suggerito:** Software Agency.
- **Verifica:** nessun dato personale in output durante una prenotazione di prova con dati sintetici.

### R6 · Codice fiscale e data di nascita obbligatori per una lezione di prova
- **Area:** minimizzazione
- **Stato:** `non_conforme`
- **Gravità:** media
- **Priorità:** P2
- **Rischio:** il codice fiscale è un identificativo forte e permette furti di identità. Nel modulo non c'è una finalità che lo giustifichi, perché per prenotare una lezione di prova bastano nome, contatto e corso. La data di nascita è raccolta senza dire a cosa serve (per esempio verificare la maggiore età).
- **Riferimenti:** GDPR art. 5(1)(c), art. 25(2)
- **Evidenze:** `public/index.html:23-24`, `required` su entrambi i campi. Salvataggio in `server.js:24-25`.
- **Lacune:** il titolare potrebbe avere una ragione (assicurazione, tesseramento) che qui non risulta.
- **Raccomandazione:**
  - Rimuovere il codice fiscale dalla prenotazione di prova e chiederlo solo all'eventuale iscrizione, se serve.
  - Per la data di nascita, sostituirla con una dichiarazione "maggiorenne sì/no" o motivarla.
  - Rendere facoltativi gli altri campi non necessari (telefono, se l'email basta).
- **Responsabile suggerito:** titolare per la decisione, Software Agency per la modifica.
- **Verifica:** il modulo chiede solo i dati motivati e il record non contiene gli altri.

### R7 · Nessuna conservazione definita né cancellazione per le prenotazioni
- **Area:** limitazione della conservazione, diritti
- **Stato:** `non_conforme`
- **Gravità:** media
- **Priorità:** P2
- **Rischio:** il file `prenotazioni.jsonl` cresce all'infinito e contiene dati anche di persone che non si iscriveranno. Non c'è modo di cancellare, rettificare o esportare una prenotazione dal servizio.
- **Riferimenti:** GDPR art. 5(1)(e), art. 15-17 e 20
- **Evidenze:**
  - `server.js:7,31`: solo `appendFile` sul file.
  - `README.md:11`: "le prenotazioni restano nel file".
  - Nel repository non ci sono codice o procedure per cancellazione, esportazione o rettifica.
- **Lacune:** la reception può gestire le richieste a mano, ma non è documentato.
- **Raccomandazione:**
  - Definire un tempo di conservazione (per esempio, per i dati sanitari, cancellazione subito dopo la lezione) e una procedura per cancellare i record scaduti.
  - Definire come si gestiscono le richieste degli interessati.
  - Il rilievo va approfondito con AIPCA-05 (diritti degli interessati) e il data governance specialist.
- **Responsabile suggerito:** titolare; poi Software Agency.
- **Verifica:** esistono una regola di conservazione scritta e una procedura (o uno script) verificata con dati sintetici.

### R8 · Registro dei trattamenti e valutazione d'impatto non verificabili
- **Area:** responsabilizzazione
- **Stato:** `non_verificabile`
- **Gravità:** media
- **Priorità:** P2
- **Rischio:** senza registro e senza valutazione di necessità non si può dimostrare la conformità (accountability).
- **Riferimenti:** GDPR art. 5(2), art. 24, art. 30, art. 35 (la DPIA va valutata se i dati sanitari sono trattati su larga scala; la soglia va decisa dal titolare con il DPO)
- **Evidenze:** nessun registro o DPIA nel repository.
- **Lacune:** potrebbero esistere fuori dal repository. Anche una piccola palestra di quartiere può essere esentata dal registro (art. 30(5)), ma non se tratta categorie particolari di dati in modo non occasionale.
- **Raccomandazione:** verificare con il titolare se un registro esiste, e valutare con il DPO se serve una DPIA (AIPCA-06).
- **Responsabile suggerito:** titolare, DPO.
- **Verifica:** registro (o motivazione dell'esenzione) e valutazione sulla DPIA allegati al progetto.

### R9 · Misure di sicurezza del file e dei log (segnalazione per l'audit tecnico)
- **Area:** sicurezza del trattamento (fuori dal mio perimetro, segnalo soltanto)
- **Stato:** `non_verificabile`
- **Gravità:** media
- **Priorità:** P3
- **Rischio:** i dati, compresi quelli sanitari, sono in chiaro in un file locale (`prenotazioni.jsonl`) e senza controlli di accesso visibili.
- **Riferimenti:** GDPR art. 32, art. 25
- **Evidenze:**
  - `server.js:7,31`: file in chiaro nella cartella dell'applicazione.
  - Il server serve solo due pagine statiche (`server.js:47`), quindi il file non è esposto via web.
  - Nessun uso di HTTPS nel codice: dipende dall'hosting.
- **Lacune:** permessi del file, cifratura, backup, TLS e accessi della reception sono fuori dal repository.
- **Raccomandazione:** far valutare queste misure al Privacy Security Engineer (AIPCA-07) o al reparto sicurezza.
- **Responsabile suggerito:** responsabile sicurezza.
- **Verifica:** relazione tecnica sulle misure.

## Controlli senza rilievo

Ho verificato che il file delle prenotazioni non è servito dal server (`server.js:47`) e che il modulo non usa cookie né script di terze parti (`public/index.html`).

## Domande aperte per l'utente e il titolare

1. Chi è il titolare del trattamento e c'è un DPO?
2. Il dato sanitario serve davvero per una lezione di prova, e su quale base giuridica?
3. Chi è il fornitore del servizio di statistiche (`stats.example.com`) e dove si trova? Serve davvero un identificativo?
4. Esiste un'informativa fuori dal repository? Il codice fiscale ha una finalità (assicurazione, tesseramento)?
5. Per quanto tempo la reception conserva le prenotazioni e chi vi accede?
6. Il modulo può essere compilato da minorenni?

## Passi suggeriti e coordinamento

Dopo la tua conferma, l'ordine che propongo è:
1. R1 e R2 (P1).
2. R3 e R4.
3. Le modifiche tecniche R5 e R6, da far attuare alla Software Agency previa approvazione.
4. R7 e R8.

Gli specialisti da coinvolgere sono AIPCA-03 (informativa), AIPCA-04 (fornitori), AIPCA-05 (diritti) e AIPCA-07 (sicurezza). Nessuna correzione è stata fatta.

Questo è un rapporto di supporto, non una certificazione né un parere legale. Non sostituisce titolare, DPO o consulente legale.

AIPCA-02 · ALIOTH — Senior GDPR & Data Protection Specialist

Nota sul modello: lavoro su Sonnet. I due rilievi P1 (R1 e R2) proponili al direttore AIPCA-01 · ARCTURUS, o a un revisore su Opus, per il riesame prima che diventino definitivi.
