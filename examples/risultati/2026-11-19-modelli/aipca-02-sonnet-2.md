AIPCA-02 · ALIOTH — Senior GDPR & Data Protection Specialist, reparto AIPCA (AI Privacy & Compliance)

# Rapporto GDPR: prenotazioni-palestra

Valutazione di supporto, non certificazione e non parere legale. Nessun controllo risulta `conforme_verificato`. Ho letto solo `server.js`, `public/index.html`, `public/grazie.html`, `README.md` e `package.json`. Non ho eseguito il servizio e non ho visto dati reali, informative, contratti con fornitori o un registro dei trattamenti. Nel repository non ci sono né informativa privacy né registro.

## Data mapping

Titolare presunto: la palestra. Il repository non lo indica.

| Trattamento | Dati | Base dichiarata | Destinatari | Conservazione | Evidenza |
|---|---|---|---|---|---|
| T1 Prenotazione lezione di prova | corso, data, nome, email, telefono | nessuna dichiarata (plausibile art. 6.1.b) | reception | indefinita, file locale | server.js:18-31 |
| T2 Dati identificativi aggiuntivi | codice fiscale, data di nascita | nessuna | reception | indefinita | server.js:24-25; index.html:23-24 |
| T3 Dati sulla salute | patologie, infortuni, farmaci (testo libero) | nessuna | reception, istruttore | indefinita | server.js:26; index.html:25-28 |
| T4 Marketing (newsletter) | email e altri dati della prenotazione | consenso, non dimostrabile | non verificabile | indefinita | server.js:27; index.html:29-32 |
| T5 Statistiche | corso ed email | nessuna | `stats.example.com` (terzo, ruolo non definito) | non verificabile | server.js:8, 34-38 |
| T6 Log applicativo | intero record della prenotazione | nessuna | chi accede ai log | non definita | server.js:32 |

Trasferimenti extra SEE: non verificabili. L'host `stats.example.com` è un segnaposto e non è possibile stabilire dove si trovi il fornitore.

## Rilievi

### GDPR-01 · Dati sulla salute senza base giuridica né garanzie (art. 9)
- Area: categorie particolari. Stato: `non_conforme`. Gravità: alta. Priorità: **P1**.
- Evidenze: il campo libero `health` raccoglie patologie, infortuni e farmaci (public/index.html:25-28). Viene salvato in chiaro in `prenotazioni.jsonl` (server.js:26, 31) e scritto nei log (server.js:32).
- Rischio: sono dati dell'art. 9. Non c'è un consenso esplicito né un'altra condizione dell'art. 9.2 documentata. Il testo libero invita a dichiarare più di quanto serva. Non c'è nessuna informazione sul perché il dato viene raccolto.
- Riferimenti: GDPR artt. 5.1.c, 6, 9.1-9.2, 25, 32; Garante Privacy, provvedimenti sui dati sanitari.
- Lacune: non so se la palestra richieda un certificato medico per legge o per regolamento, né se l'istruttore usi davvero queste informazioni.
- Raccomandazione: valutare se serve raccogliere il dato. Alternative meno invasive: una casella «dichiaro di essere idoneo all'attività» o l'invito a parlare con l'istruttore di persona. Se si mantiene il campo, serve un consenso esplicito e separato (art. 9.2.a), con testo dedicato, facoltà di non rispondere e cancellazione a lezione svolta. Va anche limitato l'accesso ai dati e protetto lo storage (vedi GDPR-07).
- Responsabile suggerito: titolare con DPO o consulente; poi la Software Agency previa approvazione.
- Verifica: il campo non è più obbligatorio e non compare nei log. Esiste una prova del consenso esplicito.

### GDPR-02 · Codice fiscale e data di nascita eccedenti (art. 5.1.c)
- Area: minimizzazione. Stato: `non_conforme`. Gravità: media. Priorità: **P2**.
- Evidenze: entrambi i campi sono `required` (public/index.html:23-24) per una semplice prenotazione di prova. Il CF non è necessario a prenotare un posto in una lezione, e nessuna finalità lo giustifica nel repository.
- Rischio: raccolta eccessiva, maggiore impatto in caso di violazione (furto d'identità). Il CF è un identificativo ad ampia diffusione.
- Riferimenti: artt. 5.1.c, 25.2; Garante Privacy, indicazioni sull'uso del codice fiscale.
- Lacune: la palestra potrebbe averne bisogno per assicurazione o tesseramento; non è documentato.
- Raccomandazione: eliminare il CF dalla prenotazione di prova e raccoglierlo solo all'iscrizione, se necessario. La data di nascita può essere sostituita da «maggiorenne sì/no», se l'unico scopo è l'età.
- Verifica: i campi non compaiono più nel modulo né in `prenotazioni.jsonl`.

### GDPR-03 · Consenso marketing preselezionato e di fatto sempre attivo (artt. 4.11, 6.1.a, 7)
- Area: consenso. Stato: `non_conforme`. Gravità: alta. Priorità: **P1**.
- Evidenze:
  - La casella è preselezionata con `checked` (public/index.html:30).
  - Una casella non spuntata non invia nessun valore, e il server calcola `form.newsletter !== "no"` (server.js:27). Il valore `"no"` non viene mai inviato dal modulo. Quindi `newsletter` risulta `true` per chiunque, anche per chi toglie la spunta. Il rifiuto dell'utente viene ignorato.
- Rischio: il consenso non è libero, specifico e inequivocabile. L'iscrizione avviene anche contro la scelta espressa. Eventuali invii di offerte sarebbero illeciti (art. 6 GDPR, art. 130 Codice Privacy).
- Riferimenti: GDPR artt. 4.11, 6.1.a, 7, considerando 32; art. 130 D.Lgs. 196/2003; linee guida EDPB 05/2020 sul consenso.
- Lacune: non so se esista un invio di newsletter né cosa legga il campo. Non c'è registro del consenso (testo mostrato, data, versione).
- Raccomandazione: casella non preselezionata, `newsletter` vero solo se il valore è `"si"`, consenso separato dalla prenotazione e facoltativo, con la revoca facile e la prova del consenso conservata. I record già salvati con `newsletter: true` non vanno considerati consensi validi.
- Verifica: prova con dati sintetici di invio con e senza casella. Il record deve riflettere la scelta.

### GDPR-04 · Dati personali inviati a un terzo per statistiche (artt. 5.1.b-c, 6, 13, 28, 44-46)
- Area: destinatari e finalità. Stato: `non_conforme`. Gravità: media. Priorità: **P2**.
- Evidenze: a ogni prenotazione il server invia a `https://stats.example.com/collect` evento, corso ed email in chiaro (server.js:34-38). Il README lo dichiara (README.md:10). L'errore è ignorato (`.catch(() => {})`).
- Rischio: l'email non serve a produrre statistiche. Non c'è base giuridica né informativa, e nessun accordo art. 28 documentato. Il collegamento tra corso ed email può far dedurre un interesse per la persona. Possibile trasferimento extra SEE senza garanzie. Non si può rispettare l'informativa se il dato esce senza che l'interessato lo sappia.
- Riferimenti: artt. 5.1.b-c, 6, 13.1.e-f, 26-28, 44-46.
- Lacune: identità, ruolo e sede del fornitore ignoti. Il dominio è un segnaposto.
- Raccomandazione: togliere l'email dal payload e inviare solo dati aggregati o anonimi, oppure togliere la chiamata. Se resta, documentare il fornitore, il ruolo (art. 28) e l'eventuale trasferimento, e inserirlo nell'informativa.
- Verifica: payload ispezionato in ambiente di test con dati sintetici, privo di identificativi.

### GDPR-05 · Informativa assente (artt. 12-14)
- Area: trasparenza. Stato: `non_conforme`. Gravità: alta. Priorità: **P1**.
- Evidenze: né `index.html` né `grazie.html` contengono informativa o link a una privacy policy. Non c'è nulla su titolare, finalità, base giuridica, destinatari (fornitore delle statistiche), tempi di conservazione, diritti, reclamo al Garante, natura obbligatoria o facoltativa dei campi.
- Rischio: i dati vengono raccolti, comprese categorie particolari, senza che l'interessato sappia cosa succede.
- Riferimenti: artt. 12, 13, 14.
- Lacune: l'informativa potrebbe esistere altrove, ad esempio nel sito della palestra. Non è verificabile dal repository.
- Raccomandazione: predisporre un'informativa, con revisione legale umana, raggiungibile dal modulo prima dell'invio. Distinguere finalità prenotazione, salute, marketing e statistiche, e segnare quali campi sono obbligatori.
- Verifica: link all'informativa nel modulo e contenuti completi.

### GDPR-06 · Conservazione indefinita e nessun processo per i diritti (artt. 5.1.e, 15-22)
- Area: conservazione e diritti. Stato: `non_conforme`. Gravità: media. Priorità: **P2**.
- Evidenze: `appendFile` su `prenotazioni.jsonl` (server.js:31), file in sola aggiunta. Nessun codice di cancellazione, scadenza, esportazione o rettifica. README.md:11: «le prenotazioni restano nel file».
- Rischio: dati, anche sanitari, restano dopo la lezione senza limite. Le richieste di accesso, cancellazione e opposizione (marketing, art. 21) non hanno un canale tracciato.
- Riferimenti: artt. 5.1.e, 12, 15-17, 21.
- Lacune: eventuali procedure manuali non documentate.
- Raccomandazione: definire periodi di conservazione per tipo di dato (ad es. salute cancellata subito dopo la lezione; prenotazioni per un tempo breve e motivato) e una procedura di cancellazione. Indicare un contatto per i diritti nell'informativa. Il periodo va deciso dal titolare.
- Verifica: regola di scadenza documentata e applicata, prova con dati sintetici.

### GDPR-07 · Log con dati personali e sanitari in chiaro, file senza protezioni (artt. 5.1.f, 25, 32)
- Area: misure tecniche. Stato: `non_conforme`. Gravità: media. Priorità: **P2**.
- Evidenze:
  - `console.log("nuova prenotazione", booking)` (server.js:32) scrive l'intero record, compresi CF, salute ed email, nei log del processo.
  - `prenotazioni.jsonl` è accanto al codice (server.js:7), in chiaro, senza controllo degli accessi né cifratura. Nella cartella servita non c'è, ma non ci sono verifiche sui permessi.
  - Nessun controllo sui valori ricevuti (lunghezza, formato).
  - Il server ascolta in HTTP semplice (server.js:54); HTTPS e permessi dipendono dal deploy, non verificabile.
- Rischio: i log hanno tempi e accessi diversi dal file e duplicano i dati sanitari. Rischio di accesso non autorizzato.
- Riferimenti: artt. 5.1.f, 25, 32.
- Lacune: ambiente di esecuzione, backup, chi legge i file. Per gli aspetti di sicurezza dell'intera applicazione si rimanda a Privacy Security Engineer / Cybersecurity.
- Raccomandazione: non registrare dati personali nei log. Limitare i permessi del file e l'accesso della reception, valutare cifratura a riposo, HTTPS obbligatorio.
- Verifica: log privi di dati personali, permessi sul file documentati.

### GDPR-08 · Registro dei trattamenti e valutazione del rischio non documentati (artt. 24, 30, 35)
- Area: accountability. Stato: `non_verificabile`. Gravità: media. Priorità: **P2**.
- Evidenze: nel repository non c'è registro, DPIA, ruoli dei fornitori né nomina di eventuali incaricati.
- Note: il registro è obbligatorio anche per piccole realtà quando i trattamenti includono dati dell'art. 9 non occasionali (art. 30.5). Una DPIA non appare certa su una singola palestra di quartiere, ma lo screening va fatto e documentato. Questo parere non sostituisce DPO o consulente.
- Raccomandazione: predisporre il registro a partire dal data mapping sopra, e uno screening DPIA documentato.
- Verifica: registro e screening presenti.

### GDPR-09 · Finalità non separate e base giuridica non dichiarata (artt. 5.1.a-b, 6)
- Area: liceità e limitazione delle finalità. Stato: `parzialmente_conforme`. Gravità: media. Priorità: **P2**.
- Evidenze: un solo form e un solo record mischiano prenotazione, salute, marketing e statistiche (server.js:18-29). La base per la prenotazione (esecuzione di misure precontrattuali, art. 6.1.b) è plausibile ma non dichiarata. Nome, email e telefono per prenotare sono coerenti con la finalità. Il telefono è obbligatorio insieme all'email; basta uno dei due contatti.
- Raccomandazione: mappare ogni finalità alla sua base giuridica e separare i dati e i consensi. Valutare se il telefono possa essere facoltativo.
- Verifica: basi giuridiche documentate nel registro e nell'informativa.

## Sintesi

- P1: GDPR-01 (salute), GDPR-03 (consenso marketing), GDPR-05 (informativa).
- P2: GDPR-02, 04, 06, 07, 08, 09.
- Nessun P0. Non ci sono evidenze di una violazione dei dati in corso, ma non ho potuto verificare i dati reali né l'ambiente.
- Nessun controllo è `conforme_verificato`.
- Punti da chiedere all'utente (titolare della palestra): perché servono CF e dati sanitari, esistenza di un'informativa esterna, identità del fornitore di statistiche, se sia già partita una newsletter.
- Le correzioni sono raccomandazioni: non ho modificato nulla. L'attuazione spetta alla Software Agency previa approvazione. Il testo dell'informativa e le basi giuridiche vanno rivisti da DPO o consulente legale.

— AIPCA-02 · ALIOTH
