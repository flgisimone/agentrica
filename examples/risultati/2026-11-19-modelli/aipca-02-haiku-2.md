# AIPCA-02 · ALIOTH — Senior GDPR & Data Protection Specialist, reparto AIPCA (AI Privacy & Compliance)

## Segnalazione immediata (P0)

Il rilievo GDPR-01 è P0: il server registra il consenso alla newsletter come concesso anche quando l'utente deseleziona la casella. Va sottoposto subito al titolare, prima di qualunque messa in produzione.

## Perimetro e metodo

- Esaminati: `server.js`, `public/index.html`, `public/grazie.html`, `README.md`, `package.json` nella cartella del progetto.
- Non eseguito il server, non creato `prenotazioni.jsonl`, non inviati dati di prova: la verifica è di sola lettura del codice.
- Il progetto non dichiara titolare, finalità, basi giuridiche, tempi di conservazione né fornitori reali. Dove mancano, lo stato è `non_verificabile` o `non_conforme` per il trattamento così come è scritto nel codice.
- Nessuna conformità è dichiarata per il progetto nel suo insieme. I rilievi sono una valutazione di supporto, non una certificazione e non un parere legale.

## Mappatura del trattamento (data mapping)

| Finalità | Interessati | Dati | Base dichiarata | Destinatari | Conservazione | Trasferimenti | Misure |
|---|---|---|---|---|---|---|---|
| Prenotazione lezione di prova | Chi prenota | corso, giorno, nome, email, telefono, codice fiscale, data di nascita, patologie/infortuni/farmaci | nessuna dichiarata | reception (lettura del file) | nessuna regola | non documentati | nessuna cifratura, nessun controllo di accesso nel progetto |
| Invio evento "booking" | Chi prenota | corso, email | nessuna dichiarata | servizio esterno `stats.example.com` (da verificare) | sconosciuta | non verificabile | nessun accordo art. 28 nel progetto |
| Newsletter | Chi prenota | flag newsletter | consenso, ma registrato in modo errato (vedi GDPR-01) | non dichiarati | nessuna | non dichiarati | casella preselezionata |
| Log di processo | Chi prenota | intera prenotazione, compresi dati sanitari e codice fiscale | nessuna | stdout / log del server | sconosciuta | non dichiarati | nessuna |

## Checklist

| Controllo | Stato |
|---|---|
| Informativa e identità del titolare (art. 12-14) | non_conforme |
| Base giuridica per ogni dato (art. 6) | non_conforme |
| Consenso valido alla newsletter (art. 7, art. 4(11)) | non_conforme |
| Categorie particolari, art. 9 (dati sanitari) | non_conforme |
| Minimizzazione (art. 5(1)(c)) | non_conforme |
| Limitazione delle finalità (art. 5(1)(b)) | non_conforme |
| Conservazione e cancellazione (art. 5(1)(e)) | non_conforme |
| Sicurezza dei dati in riposo e nei log (art. 5(1)(f), art. 32) | non_conforme |
| Privacy by default (art. 25(2)) | non_conforme |
| Fornitori e art. 28 per il servizio statistiche | non_verificabile |
| Trasferimenti fuori SEE (art. 44-49) | non_verificabile |
| Diritti degli interessati (art. 15-22) | non_conforme |
| Registro dei trattamenti (art. 30) | non_verificabile |
| Valutazione d'impatto (art. 35) | non_verificabile |

## Rilievi

### GDPR-01 · Consenso newsletter registrato anche quando l'utente lo nega
- **area**: consenso e marketing
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: il campo `newsletter` non viene inviato dal browser quando la casella è deselezionata. Il codice calcola `form.newsletter !== "no"`, e `undefined !== "no"` è `true`. Il valore della casella è `"si"`, quindi non può mai essere `"no"`. Il risultato è che ogni prenotazione risulta come consenso alle offerte, anche quando l'utente lo rifiuta. Il consenso registrato non corrisponde alla scelta.
- **riferimenti**: GDPR art. 4(11), 6(1)(a), 7(1), 7(3), 5(1)(a) e (d), 25.
- **evidenze**: `server.js` riga 27 (`newsletter: form.newsletter !== "no"`); `public/index.html` riga 30 (`value="si" checked`, nessun valore alternativo).
- **lacune**: nessun test automatico sul caso casella deselezionata. Il comportamento è stato dedotto leggendo il codice, non eseguito.
- **raccomandazione**: registrare solo la scelta esplicita, per esempio `newsletter: form.newsletter === "si"`. Aggiungere un test sul caso senza campo. Il titolare deve decidere come trattare le prenotazioni già salvate con questo errore: non inviare comunicazioni commerciali a chi non ha dato il consenso. Questa decisione spetta al titolare.
- **priorita**: P0
- **responsabile_suggerito**: titolare (decisione); Software Agency per la correzione, previa approvazione.
- **verifica**: lettura di `server.js` riga 27 e `index.html` riga 30. Da confermare con un test su un form senza il campo `newsletter`, dopo l'ok dell'utente.

### GDPR-02 · Dati sanitari raccolti senza base giuridica né informativa
- **area**: categorie particolari (art. 9)
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: il modulo chiede patologie, infortuni e farmaci. Sono dati relativi alla salute (art. 9(1)). Nel progetto non esiste né un consenso esplicito separato né un'altra condizione dell'art. 9(2) documentata. Il campo è facoltativo, ma nulla spiega perché venga chiesto.
- **riferimenti**: GDPR art. 9(1), 9(2)(a), 13(1)(c), 5(1)(a), 35.
- **evidenze**: `public/index.html` righe 25-28; `server.js` riga 26 (`health: form.health`).
- **lacune**: nessuna informativa, nessuna indicazione della finalità né del periodo di conservazione.
- **raccomandazione**: finché la base giuridica non è definita, non raccogliere il dato. Se serve, prevedere un consenso esplicito separato con informativa dedicata, oppure una domanda sì/no con dettaglio solo se necessario (minimizzazione). Valutare con il DPO o un consulente legale. Il trattamento di dati sanitari su larga scala suggerisce una DPIA (art. 35), da valutare con il ruolo `privacy-dpia-specialist`.
- **priorita**: P1
- **responsabile_suggerito**: titolare; DPO o consulente legale.
- **verifica**: lettura delle righe indicate. Nessun test eseguito.

### GDPR-03 · Dati sanitari, codice fiscale e data di nascita nei log di processo
- **area**: sicurezza e minimizzazione
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: ad ogni prenotazione `console.log` scrive l'intero oggetto, con codice fiscale, data di nascita e dati sanitari. I log di un processo sono spesso copiati, conservati e letti da più persone o servizi, senza il controllo previsto per il dato originale.
- **riferimenti**: GDPR art. 5(1)(c), 5(1)(f), 25, 32.
- **evidenze**: `server.js` riga 32 (`console.log("nuova prenotazione", booking)`).
- **lacune**: non è noto dove vadano i log in produzione né per quanto tempo restano.
- **raccomandazione**: rimuovere i dati personali dal log; registrare al più un identificativo tecnico e l'esito.
- **priorita**: P1
- **responsabile_suggerito**: Software Agency (correzione), previa approvazione del titolare.
- **verifica**: lettura della riga 32.

### GDPR-04 · Codice fiscale e data di nascita obbligatori senza finalità dichiarata
- **area**: minimizzazione (art. 5(1)(c))
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: per prenotare una lezione di prova sono obbligatori il codice fiscale e la data di nascita. Il codice fiscale è un identificativo nazionale e non serve a contattare la persona né a fissare la lezione. Nel progetto non c'è nessuna finalità che ne giustifichi la raccolta.
- **riferimenti**: GDPR art. 5(1)(b), 5(1)(c), 6(1)(b).
- **evidenze**: `public/index.html` righe 23-24 (`required`); `server.js` righe 24-25.
- **lacune**: se una norma o un regolamento della palestra richiede questi dati, il progetto non lo documenta. Va verificato dal titolare.
- **raccomandazione**: eliminare i due campi, oppure documentare per iscritto la finalità e la norma che li richiede, e rendere facoltativi quelli non necessari.
- **priorita**: P1
- **responsabile_suggerito**: titolare; DPO.
- **verifica**: lettura delle righe indicate.

### GDPR-05 · Assenza di informativa e identità del titolare
- **area**: trasparenza (art. 12-14)
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: né il modulo né la pagina di conferma indicano chi tratta i dati, le finalità, le basi giuridiche, i tempi di conservazione, i diritti, né un contatto per esercitarli.
- **riferimenti**: GDPR art. 12(1), 13(1)-(2), 14.
- **evidenze**: `public/index.html` (nessun link o testo informativo); `public/grazie.html` (nessun riferimento).
- **lacune**: non è nel progetto un'informativa separata, né un link a una pagina privacy.
- **raccomandazione**: aggiungere, prima della raccolta, un'informativa con titolare, finalità e basi per ogni dato, destinatari, conservazione, diritti e contatto.
- **priorita**: P1
- **responsabile_suggerito**: titolare; Software Agency per l'inserimento nel modulo.
- **verifica**: lettura dei due file HTML.

### GDPR-06 · Invio di email e corso a un servizio esterno senza base dichiarata
- **area**: fornitori e finalità (art. 5(1)(b), 6, 28, 44-49)
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: ad ogni prenotazione il server invia email e corso a `https://stats.example.com/collect`. L'invio avviene anche quando la persona ha negato la newsletter, quindi la finalità non è compatibile con quella della prenotazione e non è dichiarata. Il fornitore non è identificato (il dominio sembra un segnaposto), non c'è un accordo art. 28, e i trasferimenti non sono verificabili. Il `catch(() => {})` ignora anche gli errori, quindi non si sa se l'invio riesce.
- **riferimenti**: GDPR art. 5(1)(b), 6(1), 13(1)(e)-(f), 28, 44-49.
- **evidenze**: `server.js` riga 8 (URL), righe 34-38 (invio).
- **lacune**: identità e sede del servizio di statistiche; contratto; base giuridica; cosa il servizio fa con l'email.
- **raccomandazione**: eliminare l'invio dell'email, oppure inviare solo dati aggregati o anonimi, se la statistica serve davvero. Se resta, identificare il fornitore, stipulare il contratto art. 28, dichiarare la base giuridica e verificare i trasferimenti.
- **priorita**: P1
- **responsabile_suggerito**: titolare; privacy-vendor-compliance per il fornitore.
- **verifica**: lettura di `server.js` righe 8 e 34-38. Il servizio esterno non è stato verificato.

### GDPR-07 · Dati in chiaro senza regole di conservazione e accesso
- **area**: conservazione e sicurezza (art. 5(1)(e), 32)
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: le prenotazioni vengono aggiunte in chiaro a `prenotazioni.jsonl`, nella cartella del progetto. Il file contiene dati sanitari e codice fiscale. Non ci sono cifratura, controllo degli accessi, tempi di conservazione, né cancellazione. Il README dice che la reception lo legge, ma non indica chi vi accede né come.
- **riferimenti**: GDPR art. 5(1)(e), 5(1)(f), 32(1)(a)-(b).
- **evidenze**: `server.js` righe 7 e 31 (`appendFile`); `README.md` riga 11.
- **lacune**: nessuna politica di conservazione, nessuna regola per backup, nessun elenco di chi accede.
- **raccomandazione**: definire un periodo di conservazione per ciascun dato, prevedere la cancellazione automatica, limitare l'accesso ai soli incaricati, cifrare il file o spostarlo in un archivio con controllo di accesso. Le misure tecniche spettano alla Software Agency e alla cybersecurity.
- **priorita**: P1
- **responsabile_suggerito**: titolare; Software Agency; `sec-cloud-security-engineer` per archiviazione e accessi.
- **verifica**: lettura di `server.js` e `README.md`. Il file non esiste ancora, quindi non è stato osservato.

### GDPR-08 · Casella newsletter preselezionata
- **area**: privacy by default (art. 25(2)) e consenso (art. 4(11))
- **stato**: non_conforme
- **gravita**: media
- **rischio**: la casella è spuntata di default. Il consenso richiede un'azione positiva e inequivocabile; un consenso preimpostato non è valido (EDPB, Linee guida 05/2020 sul consenso, e considerando 32 del GDPR).
- **riferimenti**: GDPR art. 4(11), 7, 25(2), considerando 32; EDPB Linee guida 05/2020.
- **evidenze**: `public/index.html` riga 30 (`checked`).
- **lacune**: nessuna.
- **raccomandazione**: togliere `checked`. Da correggere insieme a GDPR-01.
- **priorita**: P2
- **responsabile_suggerito**: Software Agency (frontend).
- **verifica**: lettura della riga 30.

### GDPR-09 · Nessun modo per esercitare i diritti degli interessati
- **area**: diritti (art. 15-22)
- **stato**: non_conforme
- **gravita**: media
- **rischio**: non esistono accesso, rettifica, cancellazione, limitazione, opposizione, portabilità, né revoca del consenso. Il file è solo in aggiunta (append-only). Non è previsto come rispondere a una richiesta entro i termini (art. 12(3)).
- **riferimenti**: GDPR art. 12(3), 15-22.
- **evidenze**: `server.js` (unico endpoint `POST /prenota`, nessun altro percorso di gestione).
- **lacune**: nessuna procedura di gestione delle richieste.
- **raccomandazione**: definire una procedura e un contatto per le richieste, e predisporre un modo per trovare, correggere e cancellare una prenotazione.
- **priorita**: P2
- **responsabile_suggerito**: titolare; privacy-data-subject-rights.
- **verifica**: lettura di `server.js`.

### GDPR-10 · Registro dei trattamenti e valutazione d'impatto non documentati
- **area**: accountability (art. 5(2), 30, 35)
- **stato**: non_verificabile
- **gravita**: media
- **rischio**: nel progetto non c'è traccia del registro dei trattamenti (art. 30) né di una valutazione d'impatto per i dati sanitari. Il documento può esistere fuori dal repository.
- **riferimenti**: GDPR art. 5(2), 30, 35.
- **evidenze**: nessuna nel progetto.
- **lacune**: documentazione fuori dal progetto non disponibile.
- **raccomandazione**: il titolare verifica se esiste il registro e riporta questo trattamento; se la valutazione d'impatto è necessaria, va svolta prima della messa in produzione.
- **priorita**: P3
- **responsabile_suggerito**: titolare; DPO.
- **verifica**: nessuna, documenti non disponibili.

## Fuori perimetro privacy (da passare alla cybersecurity)

- `server.js` riga 46 e `public/index.html`: nessuna protezione CSRF, nessuna validazione lato server dei campi, nessun HTTPS (il server ascolta in chiaro su porta 3000). Sono questioni di sicurezza applicativa e di rete, da assegnare a `sec-appsec-engineer` e `sec-network-security-engineer`.

## Riepilogo

Il trattamento come descritto nel progetto non rispetta il GDPR. I problemi più gravi sono il consenso alla newsletter registrato in modo errato (GDPR-01, P0), la raccolta di dati sanitari senza base giuridica o informativa (GDPR-02), i dati sanitari e il codice fiscale nei log (GDPR-03), l'invio dell'email a un servizio esterno (GDPR-06) e la mancanza di informativa (GDPR-05). Nessuna conformità è dichiarata per il progetto.

Decisioni da sottoporre all'utente: titolare e finalità di ciascun dato; se la base giuridica per i dati sanitari esiste; se il codice fiscale e la data di nascita servono davvero; identità del servizio statistico; come trattare le prenotazioni già salvate con il consenso errato.

Firmato: AIPCA-02 · ALIOTH
