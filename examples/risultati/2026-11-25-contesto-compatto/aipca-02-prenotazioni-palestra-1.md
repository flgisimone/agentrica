AIPCA-02 · ALIOTH — Senior GDPR & Data Protection Specialist, reparto AIPCA (AI Privacy & Compliance)

**Perimetro e metodo.** Ho letto tutti i file del progetto `prenotazioni-palestra-1`: `server.js`, `public/index.html`, `public/grazie.html`, `README.md` e `package.json`. Non c'è né un'informativa né un registro dei trattamenti. Non ho eseguito nulla né toccato dati. Le regole comuni del reparto valgono, ma non ho potuto caricare AIPCA-01 con il tool `agent` e non ho letto le schede della biblioteca (`ai-act-date`, `decisioni-adeguatezza`, `legge-132-2025-ia`), perché in questa prova i tool Agentrica erano vietati. Se la destinazione di `stats.example.com` risulterà extra SEE, la scheda `decisioni-adeguatezza` va consultata. Nessun rilievo qui è un parere legale e nessuno dichiara conforme il servizio nel suo insieme.

**Mappa del trattamento (da codice).**

| Elemento | Evidenza |
|---|---|
| Finalità dichiarata | Prenotare una lezione di prova (`public/index.html:9`, `README.md:3`). |
| Finalità non dichiarate | Newsletter e offerte (`index.html:30-31`). Statistiche d'uso (`server.js:34-38`). |
| Interessati | Chi prenota una lezione di prova. |
| Dati comuni | Corso, giorno, nome e cognome, email, telefono, codice fiscale, data di nascita (`server.js:19-25`). |
| Dati sulla salute | Campo libero `health` su patologie, infortuni e farmaci (`index.html:26-27`, `server.js:26`). |
| Conservazione | File `prenotazioni.jsonl` in append, senza scadenza (`server.js:7,31`, `README.md:11`). |
| Destinatari | Reception (`README.md:11`). Servizio esterno `stats.example.com` (`server.js:8,34`). |
| Basi giuridiche, informativa, registro | Nessuna evidenza nel progetto. |

**Rilievi**

**ALIOTH-01 · Dati sulla salute senza base giuridica art. 9 e senza consenso esplicito**
- stato: `non_conforme`
- gravità: alta
- riferimenti: GDPR art. 9 par. 1-2 lett. a), art. 5 par. 1 lett. c), art. 7
- evidenze: `public/index.html:25-28`, `server.js:26`. Il campo `health` è facoltativo e di testo libero. È salvato in chiaro e scritto nei log (`server.js:32`). Nel form non c'è alcun consenso esplicito né un avviso sul dato.
- lacune: Non so se la palestra abbia una base art. 9 alternativa, come il consenso esplicito. Non ci sono registro, DPIA né informativa.
- rischio: Dati di categoria particolare raccolti senza una condizione di liceità dimostrabile. Chi compila può inserire dati di terzi o dati eccessivi.
- raccomandazione: Valutare se il dato serve davvero. Se sì, raccoglierlo con una casella di consenso esplicita e separata, accompagnata da un testo che spieghi la finalità e preveda la revoca. In alternativa sostituirlo con una dichiarazione di idoneità o con una domanda chiusa. Escluderlo dai log e restringerne l'accesso alla sola persona che ne ha bisogno.
- priorità: P1
- responsabile_suggerito: titolare (palestra), con il DPO o un consulente legale. L'implementazione spetta alla Software Agency previa approvazione.
- verifica: Il form mostra consenso esplicito e informativa. Una prenotazione senza consenso non salva `health`. Il campo non compare nei log.

**ALIOTH-02 · Casella newsletter preselezionata e con valore sempre vero: consenso al marketing non valido**
- stato: `non_conforme`
- gravità: alta
- riferimenti: GDPR art. 4 n. 11, art. 6 par. 1 lett. a), art. 7 par. 1-2; ePrivacy / art. 130 Codice privacy (D.Lgs. 196/2003) per le comunicazioni commerciali. Versione e applicabilità da verificare con il legale.
- evidenze: `public/index.html:30` ha `checked`, quindi la casella è preselezionata. `server.js:27` ha `newsletter: form.newsletter !== "no"`. Una casella spuntata invia `si`. Una casella deselezionata non invia nulla, quindi `undefined !== "no"` vale `true`. Il campo `newsletter` risulta così vero per ogni prenotazione, anche per chi ha tolto la spunta. Il mio ragionamento si basa sulla lettura del codice e non l'ho provato eseguendolo.
- lacune: Non c'è alcuna prova di quale testo l'interessato abbia visto, né un registro dei consensi. Non c'è un meccanismo di revoca.
- rischio: Invio di offerte senza consenso valido. Nel file il consenso risulta dato da tutti, anche da chi lo ha negato.
- raccomandazione: Casella non preselezionata e distinta dalla prenotazione, con la prenotazione non condizionata al consenso. Salvare `true` solo se arriva `si`, e conservare data e testo della versione mostrata. Prevedere un link di disiscrizione. Valutare cosa fare dei consensi già registrati, che non sono dimostrabili.
- priorità: P1
- responsabile_suggerito: titolare. Implementazione alla Software Agency previa approvazione.
- verifica: Prenotare con la casella vuota deve salvare `newsletter: false`.

**ALIOTH-03 · Invio di dati personali (email) a un servizio di statistiche esterno senza base, informativa né ruolo definito**
- stato: `non_verificabile` per ruolo, accordo e destinazione. L'invio dell'email è `non_conforme` rispetto a minimizzazione e finalità.
- gravità: alta
- riferimenti: GDPR art. 5 par. 1 lett. a-c), art. 6, art. 13 par. 1 lett. e-f), art. 28, artt. 44-46 se il fornitore è extra SEE
- evidenze: `server.js:8` ha `STATS_URL = "https://stats.example.com/collect"`. `server.js:34-38` invia in POST `event`, `course` ed `email`. `README.md:10` parla di «servizio di statistiche della palestra», ma nessun file identifica il fornitore.
- lacune: Chi sia il fornitore, dove si trovi, se esista un accordo art. 28, se i dati siano usati per scopi propri e quale sia la base giuridica. L'URL `example.com` sembra un segnaposto: se è così, in produzione la destinazione reale va identificata.
- rischio: Comunicazione non dichiarata a terzi. L'email non serve a statistiche aggregate. L'invio fire-and-forget (`.catch(() => {})`) non è tracciato né controllabile.
- raccomandazione: Per le statistiche inviare solo `event` e `course`, senza email né altri identificativi. Documentare fornitore, ruolo e accordo art. 28, e controllare l'eventuale trasferimento extra SEE. Indicare il destinatario nell'informativa.
- priorità: P1
- responsabile_suggerito: titolare e DPO. Per il fornitore passare al privacy-vendor-compliance. Implementazione alla Software Agency previa approvazione.
- verifica: Il payload inviato non contiene dati personali. Esiste un registro dei fornitori con l'accordo.

**ALIOTH-04 · Nessuna informativa e trasparenza assente**
- stato: `non_conforme`
- gravità: alta
- riferimenti: GDPR artt. 12-13, art. 5 par. 1 lett. a)
- evidenze: `public/index.html` e `public/grazie.html` non contengono né link a un'informativa né l'identità del titolare, le finalità, i destinatari o i tempi di conservazione. Una ricerca sull'intero progetto non trova alcun testo di informativa.
- lacune: Un'informativa potrebbe esistere altrove, per esempio in reception o sul sito della palestra. Non è verificabile da questo repository.
- rischio: L'interessato non sa chi è il titolare, perché si trattano i dati, chi li riceve e per quanto restano. Questo vale in particolare per salute, newsletter e statistiche.
- raccomandazione: Mostrare l'informativa prima dell'invio, in forma sintetica nel form e completa con un link, con titolare e contatti, finalità distinte con basi diverse, destinatari, conservazione, diritti e reclamo al Garante. Il testo va redatto dal legale.
- priorità: P1
- responsabile_suggerito: titolare con il consulente legale. Per il testo passare al privacy-legal-specialist.
- verifica: Il link all'informativa è presente nel form. Il testo copre gli elementi dell'art. 13.

**ALIOTH-05 · Minimizzazione: codice fiscale e data di nascita obbligatori per una lezione di prova**
- stato: `non_conforme`, da confermare col titolare sulle sue esigenze reali
- gravità: media
- riferimenti: GDPR art. 5 par. 1 lett. c), art. 25 par. 2
- evidenze: `public/index.html:23-24`, entrambi `required`. `server.js:24-25` li salva in chiaro.
- lacune: Non so se serva davvero il codice fiscale, ad esempio per l'assicurazione o per il tesseramento. Non so se serva la data di nascita, ad esempio per verificare la maggiore età. Non c'è una finalità documentata.
- rischio: Dati identificativi forti raccolti oltre la finalità «prenotare una lezione di prova». Sono utili per furti di identità se il file è esposto.
- raccomandazione: Chiedere solo ciò che serve alla prenotazione, cioè nome, un recapito, corso e giorno. Il codice fiscale può essere raccolto al momento dell'iscrizione, se serve. Se serve verificare la maggiore età, basta una conferma.
- priorità: P2
- responsabile_suggerito: titolare. Implementazione alla Software Agency previa approvazione.
- verifica: Per ogni campo obbligatorio esiste una finalità scritta. I campi senza finalità sono eliminati.

**ALIOTH-06 · Nessun tempo di conservazione né cancellazione; archivio che cresce senza limite**
- stato: `non_conforme`
- gravità: media
- riferimenti: GDPR art. 5 par. 1 lett. e), art. 17, art. 13 par. 2 lett. a)
- evidenze: `server.js:7,31` scrive sempre in append su `prenotazioni.jsonl`. `README.md:11` dice solo «Le prenotazioni restano nel file». Non c'è alcun meccanismo di scadenza o rimozione.
- lacune: Non esiste una regola di conservazione né una procedura di rimozione, e non so quanto le prenotazioni servano alla reception.
- rischio: I dati, comprese le note sulla salute, restano anche dopo che la lezione di prova è passata.
- raccomandazione: Definire un tempo di conservazione per finalità, per esempio la prenotazione fino a poco dopo la lezione. Introdurre una cancellazione periodica e una procedura per le richieste dell'interessato. Separare i dati sulla salute con scadenza più breve.
- priorità: P2
- responsabile_suggerito: titolare con il DPO. Implementazione alla Software Agency previa approvazione.
- verifica: Esistono una regola scritta e una prova di cancellazione automatica.

**ALIOTH-07 · Dati personali e sulla salute scritti nei log di console**
- stato: `non_conforme`
- gravità: media
- riferimenti: GDPR art. 5 par. 1 lett. c) e f), art. 25
- evidenze: `server.js:32` ha `console.log("nuova prenotazione", booking)`, che stampa l'intero oggetto, con email, telefono, codice fiscale, data di nascita e `health`.
- lacune: Non so dove vada la console in esercizio, quanto restino i log e chi li possa leggere.
- rischio: Una seconda copia dei dati, anche particolari, in un posto non controllato e senza scadenza.
- raccomandazione: Loggare solo un identificativo tecnico e la data, mai i campi personali. Se la console è raccolta da un servizio, valutare conservazione e accessi.
- priorità: P2
- responsabile_suggerito: Software Agency previa approvazione. Il tema di accessi e cifratura passa al privacy-security-engineer.
- verifica: I log di una prenotazione di prova sintetica non contengono dati personali.

**ALIOTH-08 · Registro dei trattamenti, responsabilità e processo per i diritti non documentati**
- stato: `non_verificabile`
- gravità: media
- riferimenti: GDPR art. 30, art. 24, art. 5 par. 2, artt. 15-22, art. 12
- evidenze: Il repository non contiene alcun registro, ruolo, contatto o procedura per accesso, rettifica o cancellazione. Un'eventuale documentazione esterna non è verificabile da qui.
- lacune: Se la palestra ha un registro (art. 30 può non essere obbligatorio per una piccola realtà, ma il trattamento di dati sulla salute può renderlo necessario, da valutare con il DPO o il legale), chi sia il titolare e come risponda alle richieste.
- rischio: Impossibilità di dimostrare la responsabilizzazione e di rispondere alle richieste degli interessati entro i termini.
- raccomandazione: Redigere il registro e un canale per i diritti, e valutare la necessità di una DPIA (art. 35) per il trattamento di dati sulla salute. Quest'ultimo punto è da passare al privacy-dpia-specialist.
- priorità: P2
- responsabile_suggerito: titolare con il DPO o il consulente legale.
- verifica: Registro e procedura esistono e sono datati.

**Osservazione fuori perimetro.** Il file `prenotazioni.jsonl` è nella stessa cartella del server (`server.js:7`) e non è esposto dal server, che serve solo le due pagine. Permessi, cifratura a riposo, backup e autenticazione non sono verificabili qui: passano al privacy-security-engineer (art. 32). Non c'è controllo di accesso a quel file.

**Riesame consigliato.** Questa prova è stata eseguita su Sonnet. Per le regole comuni propongo il riesame del direttore AIPCA-01 o di un revisore su Opus prima che i rilievi P1 (ALIOTH-01, -02, -03, -04) diventino definitivi. Il ragionamento su ALIOTH-02 deriva solo dalla lettura del codice.

**Domande aperte per l'utente e il titolare.**
1. Chi è il titolare e c'è un DPO?
2. A cosa servono codice fiscale e data di nascita?
3. Chi è il fornitore di `stats.example.com` e dove tratta i dati?
4. Esiste un'informativa fuori da questo repository?
5. Quanto devono restare le prenotazioni?

**Passaggio di consegne.** Specialisti da coinvolgere secondo AIPCA-01, uno alla volta e dopo la conferma dell'utente: fornitori e trasferimenti (ALIOTH-03), informativa e consenso (ALIOTH-02 e -04), DPIA (ALIOTH-01 e -08), conservazione e log (ALIOTH-06 e -07), misure di sicurezza dell'archivio.

— AIPCA-02 · ALIOTH, Senior GDPR & Data Protection Specialist
