AIPCA-02 · ALIOTH — Senior GDPR & Data Protection Specialist, reparto AIPCA (AI Privacy & Compliance)

# Valutazione GDPR — prenotazioni-palestra

Ho esaminato tutti i file del progetto: `README.md`, `package.json`, `server.js`, `public/index.html` e `public/grazie.html`. È un'analisi statica del codice. Non ho avviato il servizio, non ho inviato dati e non ho modificato nessun file. Il progetto non contiene documenti di governance: non ci sono informativa, registro dei trattamenti, DPIA, accordi con i fornitori né una policy di conservazione. Le conclusioni su questi punti valgono quindi solo per ciò che il repository mostra. Questa è una valutazione di supporto, non un parere legale né una certificazione.

## Data mapping

| Trattamento | Interessati | Dati | Base giuridica dichiarata | Destinatari | Conservazione | Trasferimenti | Misure |
|---|---|---|---|---|---|---|---|
| T1 Prenotazione della lezione di prova (`server.js:16-31`) | Potenziali clienti | corso, data, nome, email, telefono, codice fiscale, data di nascita, `createdAt` | Nessuna dichiarata. Quella plausibile è l'art. 6.1.b (misure precontrattuali) | Reception (README:11) | Illimitata: il file viene solo accresciuto (README:11) | Nessuno | Nessuna (file JSONL in chiaro) |
| T2 Dati sulla salute (`server.js:26`, `index.html:25-28`) | Gli stessi | Patologie, infortuni, farmaci (art. 9) | Nessuna. Serve una deroga ex art. 9.2, presumibilmente il consenso esplicito (art. 9.2.a) | Istruttore e reception | Illimitata | Nessuno | Nessuna |
| T3 Marketing e newsletter (`server.js:27`, `index.html:30-31`) | Gli stessi | Email, flag newsletter | Consenso (implicito nel form), non valido | Non indicati | Illimitata | Nessuno | Nessuna |
| T4 Statistiche (`server.js:34-38`) | Gli stessi | Email, corso | Nessuna | Servizio esterno `stats.example.com` | Non nota | Non verificabile | Nessuna |
| T5 Log applicativo (`server.js:32`) | Gli stessi | L'intera prenotazione, dati sanitari compresi | Nessuna | Chi accede ai log del server | Dipende dall'hosting, non nota | Non verificabile | Nessuna |

## Rilievi

### ALIOTH-01 — Dati sanitari raccolti senza una base ex art. 9 e senza garanzie
- **area**: liceità, categorie particolari
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: dati sanitari trattati senza deroga, conservati in chiaro, scritti nei log e senza limiti di tempo.
- **riferimenti**: GDPR art. 9.1-9.2, art. 5.1.c, art. 5.1.f, art. 25, art. 35 (screening)
- **evidenze**: il campo libero `health` sta in `public/index.html:26-27` e viene salvato in `server.js:26` e `server.js:31`. Il form non chiede alcun consenso esplicito e non spiega la finalità.
- **lacune**: non si sa se il dato serva davvero a una lezione di prova, né chi lo legga.
- **raccomandazione**: valutare con il titolare se il dato è necessario. In alternativa, chiederlo di persona all'istruttore, oppure con un'autodichiarazione di idoneità sì/no. Se il dato resta, servono un consenso esplicito separato e facoltativo (art. 9.2.a), un'informativa dedicata, l'accesso limitato all'istruttore, la cifratura e una conservazione breve. Va valutato anche lo screening DPIA.
- **priorita**: P1
- **responsabile_suggerito**: titolare, poi Software Agency
- **verifica**: il form non ha più il campo, oppure ha un consenso esplicito distinto. Il dato non compare in log né in file in chiaro.

### ALIOTH-02 — Il consenso alla newsletter non è libero né specifico, ed è sempre registrato come vero
- **area**: consenso, marketing
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: invii di marketing senza un consenso valido. Il sistema registra un consenso anche quando l'utente lo nega.
- **riferimenti**: GDPR art. 4.11, art. 6.1.a, art. 7.1-7.2, art. 25.2; Considerando 32 (le caselle preselezionate non valgono come consenso); CGUE C-673/17 Planet49
- **evidenze**: la casella è preselezionata (`checked`) in `public/index.html:30`. In `server.js:27` il valore è `form.newsletter !== "no"`. Una checkbox non spuntata non viene inviata, quindi `undefined !== "no"` dà `true`: il flag è sempre `true`.
- **lacune**: il consenso non viene registrato in modo dimostrabile (testo mostrato, versione, momento).
- **raccomandazione**: togliere `checked`. Salvare `newsletter: form.newsletter === "si"`. Registrare insieme la versione del testo del consenso. Prevedere la revoca (art. 7.3). Correggere anche i record già salvati: tutti hanno il flag a `true`, quindi nessuno vale come consenso.
- **priorita**: P1
- **responsabile_suggerito**: Software Agency, con approvazione del titolare
- **verifica**: con la casella non spuntata il record contiene `false`, e il default è non spuntata.

### ALIOTH-03 — Mancano l'informativa e la trasparenza
- **area**: trasparenza
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: gli interessati non conoscono titolare, finalità, basi giuridiche, destinatari, conservazione e diritti.
- **riferimenti**: GDPR art. 5.1.a, art. 12, art. 13
- **evidenze**: `public/index.html:8-35` non contiene un'informativa né un link a una informativa. Il progetto non contiene una privacy policy.
- **lacune**: non si sa se esista un'informativa fuori dal repository.
- **raccomandazione**: aggiungere vicino al form un'informativa sintetica e un link a quella completa, che copra T1-T5 e i diritti degli artt. 15-22. Il testo va sottoposto al legale o al DPO.
- **priorita**: P1
- **responsabile_suggerito**: titolare e privacy-legal, poi Software Agency
- **verifica**: l'informativa è presente e copre tutti i trattamenti mappati.

### ALIOTH-04 — Dati personali inviati a un servizio di statistiche esterno
- **area**: destinatari, fornitori, finalità
- **stato**: non_conforme
- **gravita**: media
- **rischio**: l'email viene comunicata a un terzo per finalità statistiche senza base, senza informativa e forse senza accordo ex art. 28. Per contare le prenotazioni l'email non serve.
- **riferimenti**: GDPR art. 5.1.b-c, art. 6, art. 13.1.e, art. 28, artt. 44-49 (se il fornitore è fuori dallo SEE)
- **evidenze**: `server.js:8` (`STATS_URL`) e `server.js:34-38`, dove il body contiene `email: booking.email`.
- **lacune**: il fornitore reale, la sua sede e l'eventuale DPA non sono verificabili.
- **raccomandazione**: togliere l'email dall'evento e inviare solo `event` e `course`, che bastano per le statistiche. Se un identificativo serve davvero, usarne uno pseudonimo. Censire il fornitore e firmare un DPA ex art. 28.
- **priorita**: P2
- **responsabile_suggerito**: Software Agency e privacy-vendor
- **verifica**: il payload non contiene dati personali e il fornitore risulta censito.

### ALIOTH-05 — Dati eccedenti: codice fiscale, data di nascita e telefono obbligatori
- **area**: minimizzazione
- **stato**: non_conforme
- **gravita**: media
- **rischio**: per prenotare una lezione di prova si raccolgono dati non necessari, e il codice fiscale aumenta l'impatto di una eventuale violazione.
- **riferimenti**: GDPR art. 5.1.c, art. 25.2
- **evidenze**: i campi sono obbligatori (`required`) in `public/index.html:22-24` e vengono salvati in `server.js:23-25`.
- **lacune**: non è documentata alcuna finalità che giustifichi codice fiscale e data di nascita (per esempio assicurazione o verifica della maggiore età).
- **raccomandazione**: chiedere solo nome, un recapito, corso e data. Il codice fiscale e gli altri dati vanno raccolti all'iscrizione vera e propria, se servono. Per i minori, valutare un controllo "maggiorenne sì/no" invece della data di nascita.
- **priorita**: P2
- **responsabile_suggerito**: titolare, poi Software Agency
- **verifica**: il form e il record contengono solo i campi giustificati.

### ALIOTH-06 — Dati personali e sanitari scritti nei log
- **area**: integrità e riservatezza, minimizzazione
- **stato**: non_conforme
- **gravita**: media
- **rischio**: copie non controllate dei dati, sanitari compresi, nei log dell'hosting, con conservazione e accessi sconosciuti.
- **riferimenti**: GDPR art. 5.1.c, art. 5.1.f, art. 25, art. 32
- **evidenze**: `server.js:32`, dove `console.log("nuova prenotazione", booking)` scrive l'oggetto completo.
- **raccomandazione**: registrare solo l'evento, al massimo con il corso e la data. Cancellare i log già prodotti.
- **priorita**: P2
- **responsabile_suggerito**: Software Agency
- **verifica**: i log non contengono più campi personali.

### ALIOTH-07 — Conservazione illimitata e archivio non protetto
- **area**: limitazione della conservazione, sicurezza
- **stato**: non_conforme
- **gravita**: media
- **rischio**: i dati, sanitari compresi, restano per sempre in un file in chiaro, senza controllo degli accessi.
- **riferimenti**: GDPR art. 5.1.e, art. 5.1.f, art. 32
- **evidenze**: `server.js:7` e `server.js:31` scrivono in append su `prenotazioni.jsonl`. Il README:11 dice: "Le prenotazioni restano nel file". Non esiste un meccanismo di cancellazione.
- **lacune**: permessi del file, backup e accesso della reception non verificabili.
- **raccomandazione**: definire un termine di conservazione, per esempio la cancellazione poco dopo la lezione di prova se il cliente non si iscrive, e automatizzarlo. Limitare l'accesso al file e cifrare i dati sanitari, se restano.
- **priorita**: P2
- **responsabile_suggerito**: titolare (tempi), Software Agency (attuazione)
- **verifica**: la policy è documentata e i record più vecchi del termine vengono rimossi.

### ALIOTH-08 — Non c'è un processo per i diritti degli interessati
- **area**: diritti
- **stato**: non_conforme
- **gravita**: media
- **rischio**: le richieste di accesso, cancellazione, opposizione al marketing o revoca del consenso non si possono gestire in modo affidabile.
- **riferimenti**: GDPR artt. 12, 15-21, art. 7.3
- **evidenze**: il progetto non ha funzioni né documentazione per i diritti. I dati stanno solo in un file append-only (`server.js:31`).
- **raccomandazione**: indicare un contatto nell'informativa e definire una procedura, anche manuale, per cercare, esportare e cancellare i record per email. Prevedere la disiscrizione dalla newsletter.
- **priorita**: P2
- **responsabile_suggerito**: titolare, privacy-data-subject-rights
- **verifica**: una procedura documentata e provata con dati sintetici.

### ALIOTH-09 — Accountability: registro dei trattamenti e screening DPIA non verificabili
- **area**: accountability
- **stato**: non_verificabile
- **gravita**: bassa
- **rischio**: senza documentazione il titolare non può dimostrare la conformità (art. 5.2). Il trattamento di dati sanitari rende non applicabile l'esenzione dell'art. 30.5.
- **riferimenti**: GDPR art. 5.2, art. 24, art. 30, art. 35
- **evidenze**: nel progetto mancano un registro, una DPIA e la documentazione delle basi giuridiche.
- **raccomandazione**: compilare la voce del registro per T1-T5, documentare le basi giuridiche e fare lo screening DPIA, soprattutto per T2.
- **priorita**: P3
- **responsabile_suggerito**: titolare, DPO se nominato
- **verifica**: il registro e l'esito dello screening sono disponibili.

## Checklist

| Controllo | Stato |
|---|---|
| Base giuridica documentata (art. 6) | non_verificabile (non dichiarata) |
| Deroga art. 9 per i dati sanitari | non_conforme |
| Consenso al marketing valido (art. 7) | non_conforme |
| Informativa (art. 13) | non_conforme |
| Minimizzazione (art. 5.1.c) | non_conforme |
| Limitazione della conservazione (art. 5.1.e) | non_conforme |
| Destinatari e fornitori (art. 28) | non_conforme / non_verificabile |
| Processo per i diritti (artt. 15-22) | non_conforme |
| Privacy by default (art. 25.2) | non_conforme (casella preselezionata, campi obbligatori eccedenti) |
| Registro dei trattamenti (art. 30) | non_verificabile |
| Dati relativi a reati (art. 10) | non_applicabile |

## Riepilogo

Non ci sono rilievi P0. Ci sono tre rilievi P1, da segnalare subito al titolare: dati sanitari senza deroga ex art. 9 (ALIOTH-01), consenso alla newsletter non valido e sempre registrato come vero per un bug in `server.js:27` (ALIOTH-02), informativa assente (ALIOTH-03). Gli altri sono P2: email al servizio di statistiche, dati eccedenti, log con dati personali, conservazione illimitata, diritti. ALIOTH-09 è P3.

Correzioni minime che proporrei alla Software Agency, da attuare solo con l'approvazione dell'utente:
- togliere `checked` (`index.html:30`) e usare `form.newsletter === "si"` (`server.js:27`);
- togliere `email` dal payload delle statistiche (`server.js:37`);
- non scrivere più nel log l'oggetto `booking` (`server.js:32`);
- togliere o rendere facoltativi `taxCode`, `birthDate` e `health`, con un consenso esplicito separato per `health`.

Decisioni che spettano al titolare: la necessità dei dati sanitari e del codice fiscale, i tempi di conservazione, il fornitore delle statistiche e il testo dell'informativa.

— ALIOTH (AIPCA-02)
