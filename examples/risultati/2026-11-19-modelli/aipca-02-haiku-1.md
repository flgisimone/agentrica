# AIPCA-02 · ALIOTH — Senior GDPR & Data Protection Specialist, reparto AIPCA (AI Privacy & Compliance)

Rilievi sul trattamento dei dati personali del progetto `prenotazioni-palestra` (cartella `scratchpad/runs/aipca-02-prenotazioni-palestra-haiku-1`), rispetto al GDPR.

## Perimetro e limiti

- File esaminati: `server.js`, `public/index.html`, `public/grazie.html`, `README.md`, `package.json`. Nel progetto non c'è `prenotazioni.jsonl`: non ho letto né trasferito dati reali.
- Non ho consultato le regole comuni del reparto né il file di ruolo in `agents/`, perché il perimetro di lettura era limitato alla cartella del progetto e al file delle istruzioni. Il lavoro si basa sul testo delle istruzioni e sui riferimenti GDPR indicati (artt. 5-7, 9-10, 12-22, 24-25, 30, 35).
- Non ho consultato fonti istituzionali online (Garante, EDPB): i riferimenti nazionali (in particolare l'art. 130 del Codice privacy per le comunicazioni promozionali) sono da verificare nella versione vigente.
- Le valutazioni non sono un parere legale né una certificazione. Nessun rilievo dichiara conforme il progetto nel suo insieme.
- Non sono noti hosting, HTTPS, destinatari reali e luogo di conservazione: i punti che dipendono dal deploy sono marcati `non_verificabile`.

## Mappa del trattamento (dal codice)

| Voce | Contenuto |
|---|---|
| Finalità | Prenotazione di una lezione di prova (`server.js:16-42`); newsletter/offerte (`server.js:27`); statistiche (`server.js:34-38`) |
| Interessati | Chi prenota: presumibilmente adulti e minori (la data di nascita è richiesta, nessuna regola sui minori) |
| Dati | Corso, giorno, nome e cognome, email, telefono, codice fiscale, data di nascita, patologie/infortuni/farmaci (testo libero), consenso newsletter, data di creazione |
| Dati particolari (art. 9) | Sì: patologie, infortuni e farmaci sono dati relativi alla salute (art. 4, n. 15) |
| Base giuridica dichiarata | Nessuna, né nel codice né nelle pagine |
| Destinatari | Reception (lettura di `prenotazioni.jsonl`, da README:11); `stats.example.com` (email e corso, ogni prenotazione, `server.js:34-38`); log di processo (`server.js:32`) |
| Conservazione | Nessuna regola: il file cresce senza limiti |
| Trasferimenti | Non verificabile: il dominio `stats.example.com` è un segnaposto e non si sa dove si trovi il servizio |
| Misure | Nessuna informativa, nessun consenso esplicito per i dati sanitari, nessuna cifratura né controllo d'accesso sul file |

## Rilievi

### GDPR-01 · Consenso alla newsletter non valido e bug che lo registra anche se negato

- **area**: consenso, marketing
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: invio di comunicazioni promozionali senza un consenso valido a persone che hanno rifiutato
- **riferimenti**: GDPR artt. 4(11), 6(1)(a), 7; art. 130 Codice privacy (da verificare nella versione vigente)
- **evidenze**:
  - `public/index.html:30`: la casella `newsletter` è preselezionata (`checked`).
  - `public/index.html:30`: il valore inviato è `si`; se la casella è deselezionata il browser non invia il campo.
  - `server.js:27`: `newsletter: form.newsletter !== "no"`. Se il campo manca, `form.newsletter` è `undefined`, quindi l'espressione vale `true`. Il valore `"no"` non viene mai inviato dal modulo.
- **lacune**: nessun testo di consenso distinto dalle altre condizioni; nessun registro del consenso (data, versione del testo).
- **raccomandazione**: casella non preselezionata; nel server registrare il consenso solo con `form.newsletter === "si"`; salvare data e versione del testo accettato; prevedere la revoca. È un errore nella causa (la logica del server), non solo nell'interfaccia: va corretto in `server.js:27`.
- **priorita**: P1
- **responsabile_suggerito**: titolare (testo e casella); Software Agency (correzione del codice, previa approvazione umana)
- **verifica**: `conforme_verificato` solo per questo controllo dopo la correzione e un test con casella deselezionata (dati sintetici).

### GDPR-02 · Dati sanitari, codice fiscale e data di nascita scritti nei log

- **area**: sicurezza, minimizzazione, dati particolari
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: esposizione di dati sanitari e identificativi a chiunque legga i log del processo
- **riferimenti**: GDPR artt. 5(1)(c) e (f), 9(1), 25, 32
- **evidenze**: `server.js:32`: `console.log("nuova prenotazione", booking)` stampa l'intero oggetto, con `taxCode`, `birthDate`, `health`, `email` e `phone`.
- **lacune**: non so dove finiscono i log (terminale, file, servizio di raccolta). Se vengono inoltrati o conservati, la gravità sale.
- **raccomandazione**: rimuovere il log dei dati personali, oppure registrare solo un identificativo tecnico (per esempio l'id della prenotazione).
- **priorita**: P1 (da portare a P0 se i log vengono raccolti o inoltrati a terzi: da verificare)
- **responsabile_suggerito**: Software Agency (correzione), gestore dell'infrastruttura (dove finiscono i log)
- **verifica**: `non_verificabile` finché non si conosce la destinazione dei log; dopo la correzione, controllo dell'output del processo con dati sintetici.

### GDPR-03 · Dati sanitari raccolti senza consenso esplicito né base documentata

- **area**: dati particolari (art. 9), base giuridica
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: trattamento di dati sanitari senza base giuridica dimostrabile
- **riferimenti**: GDPR artt. 6(1), 9(1), 9(2)(a), 7(1)
- **evidenze**:
  - `public/index.html:26-27`: il campo `health` chiede patologie, infortuni o farmaci. Il testo è facoltativo (nessun `required`), e questo è un punto positivo sulla minimizzazione.
  - `server.js:26`: il dato viene salvato in chiaro, senza distinzione dagli altri dati.
  - Nessun testo di consenso accanto al campo.
- **lacune**: nessuna base documentata; nessuna spiegazione del perché l'istruttore ne abbia bisogno; nessuna misura specifica per questo dato.
- **raccomandazione**: se il dato serve per la sicurezza della lezione, raccoglierlo con un consenso esplicito e informato (art. 9(2)(a)) distinto da altri consensi, spiegando la finalità; valutare se basta un'informazione più generica (per esempio «hai condizioni da segnalare all'istruttore?»). Il titolare decide la base; io non la stabilisco.
- **priorita**: P1
- **responsabile_suggerito**: titolare (base giuridica e testo); DPO se presente
- **verifica**: `non_verificabile` finché non esiste una base documentata e un testo di consenso.

### GDPR-04 · Informativa assente

- **area**: trasparenza
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: raccolta di dati senza informare l'interessato su titolare, finalità, base, destinatari, conservazione e diritti
- **riferimenti**: GDPR artt. 12, 13 (anche 14 se i dati arrivano da altri)
- **evidenze**: `public/index.html` (il modulo non ha alcun link a un'informativa né testo informativo); `public/grazie.html` (nessun riferimento); `README.md` non descrive informativa.
- **lacune**: nessun titolare, nessun contatto del DPO, nessun periodo di conservazione, nessun elenco di destinatari, nessuna indicazione dei diritti.
- **raccomandazione**: informativa breve nel modulo con link a quella completa, da pubblicare prima della raccolta.
- **priorita**: P1
- **responsabile_suggerito**: titolare; privacy legal specialist per il testo
- **verifica**: `non_verificabile` finché il testo non esiste; poi controllo della presenza nel modulo.

### GDPR-05 · Invio di email e corso a un servizio esterno ad ogni prenotazione

- **area**: destinatari, fornitori, trasparenza
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: comunicazione di dati personali (email, corso) a un terzo non indicato, senza base né accordo
- **riferimenti**: GDPR artt. 5(1)(a), 6(1), 13(1)(e), 28, 44-49 (se fuori SEE; non verificabile)
- **evidenze**:
  - `server.js:8`: `STATS_URL = "https://stats.example.com/collect"`.
  - `server.js:34-38`: a ogni prenotazione viene inviata una richiesta con `course` ed `email`. L'errore è ignorato (`.catch(() => {})`), quindi la perdita del dato non viene registrata.
  - `README.md:10`: il README parla del «servizio di statistiche della palestra», senza dire che è gestito da un terzo, né dove si trova.
- **lacune**: non so se il servizio sia della palestra o di un fornitore; non so se sia in SEE; non esiste accordo ex art. 28 né informativa. Non serve l'email per le statistiche: si può inviare solo il corso o un dato aggregato.
- **raccomandazione**: chiarire ruolo e sede del servizio; se serve per statistiche, sostituire l'email con un identificativo anonimo o eliminare l'invio; se resta, prevedere accordo ex art. 28 e informativa. Le misure sono scelte del titolare.
- **priorita**: P1
- **responsabile_suggerito**: titolare; privacy vendor compliance specialist; Software Agency per la modifica
- **verifica**: `non_verificabile` per ruolo e sede del servizio; `non_conforme` finché l'invio dell'email non è giustificato o rimosso.

### GDPR-06 · Conservazione illimitata e accesso non regolato a `prenotazioni.jsonl`

- **area**: conservazione, sicurezza, accesso
- **stato**: non_conforme
- **gravita**: media
- **rischio**: accumulo di dati sanitari e identificativi senza tempi di conservazione e senza controllo degli accessi
- **riferimenti**: GDPR artt. 5(1)(e), 5(1)(f), 25, 32
- **evidenze**:
  - `server.js:7`, `server.js:31`: il file viene aperto in aggiunta (`appendFile`) e non viene mai cancellato o ripulito.
  - `README.md:11`: «la reception le legge», senza indicare chi, come e con quali permessi.
  - Il file è in chiaro, nella cartella dell'applicazione.
- **lacune**: nessun periodo di conservazione; nessun meccanismo di cancellazione; nessun controllo d'accesso o cifratura.
- **raccomandazione**: definire un periodo di conservazione (per esempio eliminare dopo la lezione di prova, salvo obbligo di legge da verificare) e una procedura di cancellazione; limitare l'accesso al file; valutare cifratura a riposo.
- **priorita**: P2
- **responsabile_suggerito**: titolare; privacy data governance specialist; sicurezza (art. 32)
- **verifica**: `non_verificabile` finché non esiste la regola; poi controllo della procedura.

### GDPR-07 · Codice fiscale e data di nascita richiesti senza motivazione

- **area**: minimizzazione
- **stato**: non_verificabile
- **gravita**: media
- **rischio**: raccolta di identificativi non necessari alla prenotazione di una prova
- **riferimenti**: GDPR artt. 5(1)(c), 25(2)
- **evidenze**:
  - `public/index.html:23-24`: codice fiscale e data di nascita sono campi `required`.
  - `server.js:24-25`: entrambi vengono salvati.
- **lacune**: non risulta quale obbligo o finalità li richieda. Potrebbero servire per l'assicurazione o per regole sportive, ma questo non si vede dal progetto. La data di nascita, inoltre, non è usata nel codice: non ci sono regole per i minori.
- **raccomandazione**: il titolare indica la finalità per ciascun campo; se non è necessario, eliminarlo; se è necessario, documentare la base e limitarne la conservazione.
- **priorita**: P2
- **responsabile_suggerito**: titolare
- **verifica**: `non_verificabile` finché la finalità non è documentata.

### GDPR-08 · Diritti degli interessati senza procedura

- **area**: diritti (artt. 15-22)
- **stato**: non_verificabile
- **gravita**: media
- **rischio**: impossibilità di rispondere a richieste di accesso, cancellazione, rettifica, opposizione o revoca del consenso
- **riferimenti**: GDPR artt. 7(3), 12(3), 15-17, 21
- **evidenze**: nel codice non c'è nessun canale per le richieste; i dati sono in un file senza identificativo di interessato indicizzato (solo un file di righe JSON).
- **lacune**: nessuna procedura, nessun contatto, nessun modo di trovare i dati di una persona senza leggere tutto il file.
- **raccomandazione**: definire un canale e una procedura; poter ritrovare e cancellare i dati di una persona (per esempio tramite l'id della prenotazione o l'email).
- **priorita**: P2
- **responsabile_suggerito**: titolare; privacy data subject rights specialist
- **verifica**: `non_verificabile` finché la procedura non è documentata.

### GDPR-09 · Protezione del trasporto e dell'accesso all'applicazione

- **area**: sicurezza (art. 32)
- **stato**: non_verificabile
- **gravita**: media
- **rischio**: i dati sanitari potrebbero viaggiare in chiaro; il file potrebbe essere letto da chiunque abbia accesso al server
- **riferimenti**: GDPR art. 32
- **evidenze**: `server.js:5` e `server.js:44-54`: il server ascolta in HTTP sulla porta 3000, senza TLS, autenticazione o limiti. Il codice non mostra la configurazione di deploy.
- **lacune**: non è noto il deploy (HTTPS, reverse proxy, accesso alla cartella). Il server non ha autenticazione per il modulo, ma il modulo è pubblico per definizione. Il controllo di accesso dipende dalla reception, che nel codice non c'è.
- **raccomandazione**: servire il sito solo in HTTPS; proteggere la cartella con i dati; definire chi accede alla reception.
- **priorita**: P2
- **responsabile_suggerito**: gestore dell'infrastruttura; sicurezza (cybersecurity agency, se richiesta)
- **verifica**: `non_verificabile` senza la configurazione di deploy.

### GDPR-10 · Registro dei trattamenti e DPIA non documentati

- **area**: accountability (art. 30), valutazione d'impatto (art. 35)
- **stato**: non_verificabile
- **gravita**: media
- **rischio**: trattamento di dati particolari senza registrazione e senza una valutazione del rischio
- **riferimenti**: GDPR artt. 30, 35(1) e (3)(b) (da verificare la lista del Garante)
- **evidenze**: nel progetto non ci sono registro dei trattamenti né valutazione d'impatto.
- **lacune**: non è noto se la palestra abbia un registro. Il trattamento di dati sanitari su più persone può richiedere una valutazione (screening da fare con il titolare e il DPO).
- **raccomandazione**: aggiungere il trattamento al registro; fare lo screening DPIA prima di mettere il modulo online.
- **priorita**: P2
- **responsabile_suggerito**: titolare; DPO; DPIA specialist
- **verifica**: `non_verificabile` finché il registro e lo screening non esistono.

## Riepilogo

- Rilievi con priorità P1 (da segnalare subito, prima della messa online): GDPR-01 (newsletter preselezionata e registrata anche se negata), GDPR-02 (dati sanitari, codice fiscale e data di nascita nei log), GDPR-03 (dati sanitari senza base né consenso esplicito), GDPR-04 (informativa assente), GDPR-05 (email inviata a un servizio esterno senza base, accordo né informativa).
- Rilievi P2: GDPR-06, GDPR-07, GDPR-08, GDPR-09, GDPR-10.
- Il rilievo GDPR-02 può salire a P0 se i log vengono raccolti o inoltrati: da verificare subito con il gestore dell'infrastruttura.
- Le correzioni sono raccomandazioni. Le decisioni su basi giuridiche, testi, durata della conservazione e fornitori spettano al titolare; l'attuazione alla Software Agency, previa approvazione umana.
- Non ho modificato nulla, non ho eseguito il codice e non ho inviato dati a servizi esterni.

Firmato: AIPCA-02 · ALIOTH
