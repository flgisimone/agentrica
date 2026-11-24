AIPCA-05 · MIZAR — Senior Privacy Security Engineer, reparto AIPCA (AI Privacy & Compliance)

# Misure tecniche a protezione dei dati personali: «Parla Subito»

**Cosa ho esaminato:** tutti i file della copia: README, `config/*`, `scripts/refresh-staging.sh`, `db/schema.sql`, `src/*.js`, `docs/*.md` e `public/index.html`. Il lavoro è stato in sola lettura. Non ho avviato processi, non ho usato la rete né i tool MCP.

**Cosa non ho potuto esaminare:**
- `src/db.js`, `src/storage.js` e `src/vendors/` sono richiamati dal codice ma mancano.
- Mancano anche `package.json`, il lockfile e le configurazioni del fornitore Nimbus (cifratura a riposo, TLS, IAM).
- Il direttore AIPCA-01 e la biblioteca del reparto non erano disponibili in questa prova. Le nozioni normative sotto vengono quindi dalle mie conoscenze e non da una scheda della biblioteca: possono essere superate e vanno verificate. Riguarda in particolare l'adeguatezza di Singapore, che si controlla sulla scheda `decisioni-adeguatezza`.

**Come leggere i rilievi:** sono una valutazione di supporto, non una certificazione. Nessuna dichiarazione di conformità del progetto. Correggere spetta alla Software Agency, dopo l'approvazione dell'utente.

**Segnalazione immediata:** non ho trovato rilievi P0. Ci sono però diversi P1 che toccano dati di salute (art. 9) e dati di minori. Li segnalo al Chief (AIPCA-01) per il riesame con priorità.

## Matrice controllo / evidenza / esito

| # | Controllo | Evidenza (file:riga) | Esito | Priorità |
|---|---|---|---|---|
| 1 | Chiave di cifratura dei documenti gestita fuori dal codice | `config/default.json:8`, `src/documents.js:4-6` | non_conforme | P1 |
| 2 | Export degli studenti limitato alla classe (privilegio minimo, separazione per scuola) | `src/export.js:8-11` | non_conforme | P1 |
| 3 | Staging senza dati reali | `scripts/refresh-staging.sh:2-6`, `config/staging.json:1-5` | non_conforme | P1 |
| 4 | Backup cifrati, conservati in modo proporzionato, nel SEE, con ripristino provato | `config/backup.yml:5,7,10,13,14` | non_conforme | P1 |
| 5 | Script di terzi esclusi dalle pagine con password e dati di salute | `public/index.html:19,21,26` | non_conforme | P1 |
| 6 | Audio a un fornitore esterno solo con garanzie contrattuali | `src/transcribe.js:8-12`, `docs/fornitori.md:11,15` | non_conforme | P1 |
| 7 | Risposte ai diritti con identità verificata, su un canale protetto | `docs/procedura-diritti.md:5,6,9` | non_conforme | P1 |
| 8 | Cancellazione effettiva delle registrazioni nello storage | `src/purge.js:6-7`, `db/schema.sql:68-74` | non_conforme | P2 |
| 9 | Log applicativi senza dati personali superflui | `config/default.json:4-5`, `src/logger.js:13-14` | non_conforme | P2 |
| 10 | Audit trail completo, integro e conservato abbastanza | `db/schema.sql:83-89`, `src/purge.js:9`, `config/retention.json:3` | parzialmente_conforme | P2 |
| 11 | Protezione del login (limiti ai tentativi, MFA per il personale) | `src/server.js:25-26,33`, `src/auth.js:6-8` | non_conforme | P2 |
| 12 | Statistiche d'uso pseudonimizzate | `src/auth.js:11,27`, `src/analytics.js:4-5` | non_conforme | P2 |
| 13 | Disiscrizione autenticata ed efficace | `src/newsletter.js:6-7,13`, `src/server.js:30` | non_conforme | P2 |
| 14 | Accesso del personale ai documenti d'identità secondo il bisogno | `src/server.js:33`, `src/documents.js:10` | parzialmente_conforme | P2 |
| 15 | Cancellazione dell'account e chiusura delle sessioni | `src/account.js:11-15` | parzialmente_conforme | P2 |
| 16 | Hash delle password | `db/schema.sql:6`, `src/auth.js:18` | conforme_verificato | — |
| 17 | Cookie e sessione (httpOnly, secure, sameSite, rigenerazione al login) | `src/server.js:13-20`, `src/auth.js:9` | conforme_verificato (solo per la configurazione nel codice) | — |
| 18 | Segreti dei fornitori nelle variabili d'ambiente | `src/notifications.js:7`, `src/transcribe.js:10`, `src/server.js:15` | conforme_verificato (solo per i file esaminati) | — |
| 19 | Cifratura a riposo di DB e storage, TLS verso DB e storage | `src/db.js` e `src/storage.js` assenti | non_verificabile | P2 |
| 20 | Gestione delle vulnerabilità e delle dipendenze | nessun `package.json` né lockfile | non_verificabile | P3 |
| 21 | Store delle sessioni adatto alla produzione | `src/server.js:13-20`: nessuno `store` configurato | non_verificabile | P3 |

## Rilievi

### MIZAR-01: chiave AES dei documenti d'identità scritta nel repository
- **area:** cifratura e chiavi
- **stato:** non_conforme
- **gravità:** alta
- **priorità:** P1
- **rischio:** chi ha accesso al repository, a una sua copia o allo staging (che usa la stessa configurazione) può decifrare le scansioni dei documenti d'identità dei genitori. Le scansioni stanno nello storage e nei backup (MIZAR-04). Non c'è separazione fra i dati cifrati e la loro chiave, e non c'è rotazione.
- **evidenze:**
  - `config/default.json:8`: la chiave è in chiaro nel file. Non la riporto.
  - `src/documents.js:4-6`: il codice la carica da quel file.
  - `config/staging.json` non la sovrascrive.
- **lacune:** nessun KMS o secret manager, nessuna chiave per ambiente, nessuna versione della chiave nel blob (formato `iv|tag|ciphertext` in `src/documents.js:13-17`).
- **raccomandazione:**
  - Considerare la chiave compromessa e ruotarla.
  - Ricifrare i documenti, compresi quelli nei backup.
  - Caricare la chiave da un secret manager o da una variabile d'ambiente, con una chiave diversa per staging e produzione.
  - Aggiungere un identificativo di versione della chiave al blob.
  - Togliere la chiave dalla cronologia del repository.
- **riferimenti:** GDPR art. 32(1)(a) e 25(1).
- **responsabile suggerito:** Software Agency (DevOps, Security). Per la valutazione di una possibile violazione: AIPCA Breach Response.
- **verifica:** nessuna chiave in `config/`. La chiave risulta da un secret store. Dopo la rotazione un documento si decifra solo con la chiave nuova.

### MIZAR-02: l'export CSV dà all'insegnante tutti gli studenti della scuola, con le note di salute
- **area:** accessi ed esportazioni
- **stato:** non_conforme
- **gravità:** alta
- **priorità:** P1
- **rischio:** un insegnante scarica nome, data di nascita, telefono e `note_salute` di tutti gli studenti della scuola, minori compresi, e non solo della propria classe. Sono dati di categoria particolare (art. 9). Lo stesso vale per `support` e `admin` su qualunque classe. Il controllo di proprietà c'è (`src/export.js:7`), ma la query lo vanifica.
- **evidenze:** `src/export.js:8-11` filtra per `s.school_id = cls.school_id` invece che con un join su `enrollments`. Le colonne includono `note_salute` alla riga 9. Il CSV è costruito senza escape (riga 13), quindi è possibile la CSV injection.
- **lacune:**
  - Manca la minimizzazione delle colonne: le note di salute non servono a un registro di contatti.
  - Non c'è separazione fra scuole (`school_id` è fisso a 1 in `src/auth.js:24`).
- **raccomandazione:**
  - Filtrare per `enrollments.class_id`.
  - Togliere `note_salute` dall'export, o mostrarla solo nell'app e solo all'insegnante della classe.
  - Fare l'escape dei campi del CSV.
  - Registrare nell'audit log anche il numero di righe esportate.
- **riferimenti:** GDPR artt. 5(1)(c), 9, 25(2), 32(4).
- **responsabile suggerito:** Software Agency (Backend, Security).
- **verifica:** test con due classi della stessa scuola. L'insegnante della prima ottiene solo i suoi studenti e nessuna colonna sanitaria.

### MIZAR-03: lo staging è una copia della produzione, compresi dati di salute, documenti e registrazioni
- **area:** ambienti
- **stato:** non_conforme
- **gravità:** alta
- **priorità:** P1
- **rischio:**
  - Lo staging è usato da sviluppatori e segreteria per le prove. Contiene comunque tutti i dati reali: DB intero, bucket di documenti e registrazioni.
  - Usa la stessa chiave dei documenti (MIZAR-01), quindi le scansioni sono leggibili anche lì.
  - Le prove possono inviare SMS o email veri a persone reali, perché le credenziali dei fornitori sono le stesse se le variabili d'ambiente sono condivise. Questo è da verificare.
  - Con `set -e`, se `pg_restore` fallisce il dump resta in `/tmp/prod.dump`.
- **evidenze:** `scripts/refresh-staging.sh:2` («così la segreteria prova con dati veri») e righe 4-7. `config/staging.json:1-5` cambia solo il bucket. `README.md`, sezione Architettura: lo staging serve «per le prove della segreteria e degli sviluppatori».
- **lacune:** nessuna anonimizzazione né pseudonimizzazione, nessun controllo degli accessi differenziato, nessuna regola di conservazione per lo staging.
- **raccomandazione:**
  - Popolare lo staging con dati sintetici, o almeno con un dump anonimizzato. Escludere `note_salute`, `codice_fiscale`, documenti e registrazioni.
  - Svuotare subito i dati reali già presenti in staging.
  - Usare chiavi e credenziali dei fornitori separate per lo staging.
  - Usare `trap` per rimuovere il dump in ogni caso.
- **riferimenti:** GDPR artt. 5(1)(b)(c), 25, 32(1)(b).
- **responsabile suggerito:** Software Agency (DevOps, Database). Per il metodo di anonimizzazione: AIPCA Data Governance.
- **verifica:** una query sullo staging non trova email o codici fiscali reali. Il bucket di staging non contiene oggetti copiati dalla produzione.

### MIZAR-04: backup in chiaro, copia a Singapore, dieci anni di conservazione, ripristino mai provato
- **area:** backup e ripristino
- **stato:** non_conforme
- **gravità:** alta
- **priorità:** P1
- **rischio:**
  - I dump contengono tutto il DB: dati di salute, codici fiscali, dati di minori.
  - Sono in chiaro (`encryption: none`) e sono copiati presso un fornitore a Singapore che non compare nel registro dei fornitori.
  - Si conservano per 10 anni. Così le registrazioni (30 giorni), gli account cancellati e i messaggi (12 mesi) sopravvivono ben oltre i termini dichiarati.
  - `rclone sync` replica anche le cancellazioni e le corruzioni: il backup dello storage non protegge da ransomware o da un errore.
  - Senza un test di ripristino non è dimostrata la capacità di ripristino richiesta dall'art. 32(1)(c).
- **evidenze:** `config/backup.yml`:
  - riga 5: `encryption: none`, motivata con «il bucket è privato»;
  - riga 7: `rclone sync` dello storage;
  - riga 10: copia `coldvault:ps-offsite`, Singapore;
  - riga 13: `keep_monthly: 120`;
  - riga 14: `last_restore_test: null`.
  - `docs/fornitori.md:5-11` non elenca Coldvault.
- **lacune:**
  - Nessuna cifratura lato client e nessuna gestione delle chiavi di backup.
  - Nessuna base per il trasferimento fuori dal SEE: l'adeguatezza di Singapore va verificata sulla scheda `decisioni-adeguatezza`, che non ho potuto leggere.
  - Nessun accordo art. 28 con Coldvault.
  - Nessuna immutabilità o versioning.
  - Nessun RPO/RTO né procedura di ripristino.
- **raccomandazione:**
  - Cifrare i dump prima dell'invio, con una chiave separata da quella dei documenti.
  - Portare la copia fuori sede nel SEE, oppure documentare base e garanzie del trasferimento e iscrivere il fornitore nel registro.
  - Allineare la conservazione dei backup ai termini di `config/retention.json`.
  - Usare backup con versioning o immutabili invece di `sync`.
  - Pianificare e registrare un test di ripristino periodico.
- **riferimenti:** GDPR artt. 5(1)(e), 28, 32(1)(a)(c)(d), 44-46.
- **responsabile suggerito:** Software Agency (DevOps). Per Coldvault e il trasferimento: AIPCA Vendor Compliance.
- **verifica:** è registrato un ripristino riuscito con data. I dump risultano cifrati. Nessuna copia fuori dal SEE senza garanzie documentate.

### MIZAR-05: script di chat di terzi nella pagina di iscrizione con password e note di salute
- **area:** strumenti di supporto, superficie client
- **stato:** non_conforme
- **gravità:** alta
- **priorità:** P1
- **rischio:** lo script esterno gira nella stessa pagina in cui si inseriscono password e note sanitarie, e può leggere tutti i campi del form. Manca l'integrità (SRI) e non c'è una CSP. Il fornitore ChatNow non è nel registro.
- **evidenze:** `public/index.html:26` (loader di `widget.chatnow.example`), `:19` (`note_salute`), `:21` (password). `docs/fornitori.md` non elenca ChatNow. `src/server.js` non imposta header di sicurezza.
- **lacune:** nessuna CSP, nessuna SRI, nessuna valutazione del fornitore.
- **raccomandazione:**
  - Togliere il widget dalle pagine con form di autenticazione o con dati sanitari.
  - Aggiungere una CSP restrittiva.
  - Se il widget resta altrove: SRI dove possibile e iscrizione del fornitore nel registro.
- **riferimenti:** GDPR artt. 25, 28, 32.
- **responsabile suggerito:** Software Agency (Frontend, Security). Per il fornitore: AIPCA Vendor Compliance. Per eventuali cookie: AIPCA Legal.
- **verifica:** la pagina di iscrizione non carica script di terzi. La CSP è presente nelle risposte.

### MIZAR-06: audio delle lezioni, anche di minori, inviato a InsightAI senza accordo e con riuso per addestramento
- **area:** API ed esportazioni verso terzi
- **stato:** non_conforme
- **gravità:** alta
- **priorità:** P1
- **rischio:** voci di minori e insegnanti vanno a un fornitore statunitense che non ha un accordo art. 28 («in attesa»). I termini accettati consentono al fornitore di usare i contenuti per migliorare i propri modelli. Il flusso parte in automatico dopo ogni lezione.
- **evidenze:** `src/transcribe.js:4-12`. `docs/fornitori.md:11` (accordo «in attesa», trasferimento sì, nessuna garanzia). `docs/fornitori.md:15` (riuso dei contenuti per i modelli).
- **lacune:**
  - Nessun accordo, nessuna garanzia per il trasferimento, nessuna opzione di non conservazione o di non addestramento.
  - Nessun controllo che blocchi l'invio finché mancano le garanzie.
  - La trascrizione resta nel DB senza cifratura applicativa.
- **raccomandazione:**
  - Sospendere l'invio automatico fino all'accordo art. 28 con esclusione dell'addestramento, e fino alle garanzie per il trasferimento.
  - Valutare una trascrizione nel SEE o in locale.
  - Rendere il flusso disattivabile da configurazione.
- **riferimenti:** GDPR artt. 8, 25, 28, 32, 44-46.
- **responsabile suggerito:** Software Agency (Backend). Per il contratto: AIPCA Vendor Compliance. Per la valutazione della DPIA (minori, nuova tecnologia): AIPCA DPIA.
- **verifica:** nessuna chiamata a InsightAI finché il registro non mostra un accordo firmato e le garanzie.

### MIZAR-07: la procedura dei diritti invia i dati al mittente dell'email senza verificarne l'identità
- **area:** misure organizzative, esportazioni
- **stato:** non_conforme
- **gravità:** alta
- **priorità:** P1
- **rischio:**
  - Chiunque scriva da un indirizzo qualsiasi può ottenere i dati di un'altra persona: è una comunicazione non autorizzata.
  - Le richieste e i dati allegati finiscono nella casella personale di una dipendente, senza tracciamento condiviso né continuità se è assente.
  - L'allegato in chiaro via email può contenere note di salute.
- **evidenze:** `docs/procedura-diritti.md:6` (si risponde all'indirizzo di provenienza, allegando i dati), `:5` e `:9` (casella personale).
- **lacune:**
  - Nessuna verifica dell'identità proporzionata: per esempio un confronto con l'email registrata o un passaggio dall'area personale.
  - Nessuna casella di funzione.
  - Nessun canale protetto per la consegna dei dati.
- **raccomandazione:**
  - Consegnare i dati solo all'email registrata o tramite l'area personale autenticata.
  - Usare una casella di funzione con accesso controllato.
  - Tenere un registro delle richieste fuori dalla posta personale.
- **riferimenti:** GDPR artt. 12(6), 32(1)(b) e (4).
- **responsabile suggerito:** titolare (segreteria). Per i tempi (60 giorni) e i costi (10 euro), che sono fuori dal mio perimetro: AIPCA Data Subject Rights.
- **verifica:** procedura aggiornata e una prova su un caso fittizio.

### MIZAR-08: la purga delle registrazioni cancella la riga ma non il file nello storage
- **area:** conservazione e cancellazione, integrità del ciclo di vita
- **stato:** non_conforme
- **priorità:** P2
- **rischio:** gli audio restano nello storage, e nei backup a dieci anni, oltre i 30 giorni dichiarati. Senza più la riga che li referenzia diventano orfani difficili da gestire anche per i diritti degli interessati.
- **evidenze:** `src/purge.js:7` esegue solo `DELETE FROM recordings`. `db/schema.sql:71` contiene `storage_key`. Il README dichiara la conservazione a 30 giorni.
- **raccomandazione:**
  - Cancellare prima l'oggetto nello storage, poi la riga.
  - In alternativa, una lifecycle rule sul bucket a 30 giorni.
  - Allineare i backup (MIZAR-04).
- **riferimenti:** GDPR artt. 5(1)(e), 25(2).
- **responsabile suggerito:** Software Agency (Backend).
- **verifica:** dopo la purga nessun oggetto del prefisso delle registrazioni è più vecchio di 30 giorni.

### MIZAR-09: in caso di errore i log contengono l'intero corpo della richiesta
- **area:** log
- **stato:** non_conforme
- **priorità:** P2
- **rischio:** un errore durante `/signup` scrive nei log nome, data di nascita, email, telefono e `note_salute`. La redazione copre solo `body.password`. I log applicativi non hanno un termine di conservazione definito: i 90 giorni riguardano la tabella `audit_log`.
- **evidenze:** `config/default.json:4-5` (`redact`, `logRequestBodyOnError: true`). `src/logger.js:13-14`.
- **raccomandazione:**
  - Disattivare il log del corpo, o loggare solo i nomi dei campi.
  - Ampliare la redazione.
  - Definire dove finiscono i log, chi vi accede e per quanto restano.
- **riferimenti:** GDPR artt. 5(1)(c), 25, 32.
- **responsabile suggerito:** Software Agency (Backend, DevOps).
- **verifica:** un errore provocato in test con dati sintetici non lascia valori personali nel log.

### MIZAR-10: audit trail incompleto, modificabile dall'applicazione e cancellato dopo 90 giorni
- **area:** tracciamento delle operazioni
- **stato:** parzialmente_conforme
- **priorità:** P2
- **evidenze:**
  - Sono tracciati export, visualizzazione dei documenti e cancellazione dell'account (`src/export.js:12`, `src/documents.js:18`, `src/account.js:14`).
  - Non sono tracciati login riusciti o falliti, accessi del personale ai dati degli studenti, cambi di ruolo né operazioni admin.
  - `src/purge.js:9` cancella dopo 90 giorni (`config/retention.json:3`).
  - La tabella sta nello stesso DB con le stesse credenziali dell'app (`db/schema.sql:83-89`).
- **rischio:** non si può ricostruire un accesso abusivo o una violazione scoperta tardi. Chi compromette l'app può cancellare le tracce.
- **raccomandazione:**
  - Estendere gli eventi tracciati.
  - Usare permessi append-only, o un sink separato.
  - Fissare una conservazione motivata dei log di sicurezza, distinta dagli altri dati.
- **riferimenti:** GDPR artt. 5(2), 32(1)(b)(d), 33(5).
- **responsabile suggerito:** Software Agency (Backend, DevOps).
- **verifica:** gli eventi elencati compaiono nel log. Il ruolo applicativo non può fare `DELETE` o `UPDATE` sulla tabella, tranne il job di purga con un ruolo dedicato.

### MIZAR-11: login senza limite ai tentativi e senza MFA per il personale
- **area:** autenticazione
- **stato:** non_conforme
- **priorità:** P2
- **evidenze:**
  - `src/server.js:25-26`: nessun rate limit su `/login` né su `/signup`.
  - Nessun secondo fattore per `support` e `admin`, che accedono ai documenti d'identità (`src/server.js:33`).
  - `src/auth.js:8`: l'utente inesistente risponde senza calcolare argon2, quindi un attacco sui tempi di risposta può rivelare quali email sono registrate (enumerazione lieve).
  - Nessuna politica sulle password in `src/auth.js:17-18`.
  - L'iscrizione pubblica crea account `student` senza verificare l'email.
- **raccomandazione:**
  - Rate limit e blocco progressivo.
  - MFA obbligatoria per i ruoli del personale.
  - Verifica argon2 fittizia per uniformare i tempi.
  - Lunghezza minima della password e verifica dell'email.
- **riferimenti:** GDPR art. 32(1)(b).
- **responsabile suggerito:** Software Agency (Security, Backend). Per la parte IAM: AICA.
- **verifica:** test con dati sintetici. Dopo N tentativi arrivano risposte 429. Gli account admin richiedono un secondo fattore.

### MIZAR-12: l'email in chiaro fa da identificativo nelle statistiche d'uso
- **area:** pseudonimizzazione
- **stato:** non_conforme
- **priorità:** P2
- **evidenze:**
  - `src/auth.js:11` e `:27`: `userId: email` passato a `analytics.track`.
  - `src/analytics.js:2,5`: l'endpoint non compare nel registro dei fornitori, quindi la collocazione «interno su Nimbus» non è verificabile.
- **raccomandazione:** usare un identificativo pseudonimo (per esempio un HMAC dell'id con una chiave separata) o eventi aggregati, e documentare il servizio di statistiche.
- **riferimenti:** GDPR artt. 4(5), 25, 32(1)(a).
- **responsabile suggerito:** Software Agency (Backend). Per la base giuridica: AIPCA Data Governance e GDPR.
- **verifica:** gli eventi inviati non contengono email.

### MIZAR-13: disiscrizione non autenticata e senza effetto sulla sincronizzazione
- **area:** API, integrità dei dati di consenso
- **stato:** non_conforme
- **priorità:** P2
- **evidenze:**
  - `src/newsletter.js:6-7`: chiunque, conoscendo un'email, può modificarne lo stato. Il link è senza token (`src/server.js:30`).
  - Viene aggiornato `newsletter`, mentre `nightlySync` filtra su `marketing_consent` (`src/newsletter.js:13`): l'utente disiscritto continua a essere inviato a Mailorbit.
- **raccomandazione:**
  - Link firmato con un token per utente.
  - Un solo campo di consenso, usato in modo coerente.
  - Rimozione dalla lista del fornitore.
- **riferimenti:** GDPR artt. 5(1)(d), 7(3), 21(3), 32.
- **responsabile suggerito:** Software Agency (Backend). Per i diritti: AIPCA Data Subject Rights.
- **verifica:** dopo la disiscrizione l'utente non compare nella lista sincronizzata. Una richiesta senza token valido viene rifiutata.

### MIZAR-14: tutta la segreteria può scaricare qualunque documento d'identità
- **area:** privilegio minimo
- **stato:** parzialmente_conforme
- **priorità:** P2
- **evidenze:** `src/server.js:33` concede `support` e `admin`. `src/documents.js:10` non applica alcun vincolo sulla pratica in corso. L'accesso è comunque tracciato (`src/documents.js:18`).
- **raccomandazione:**
  - Valutare se il documento serve dopo l'iscrizione: se no, prevedere la cancellazione dopo la verifica.
  - Limitare l'accesso a un ruolo dedicato o a una pratica aperta.
  - Revisionare periodicamente gli accessi registrati.
- **riferimenti:** GDPR artt. 5(1)(c)(e), 25(2), 32(4).
- **responsabile suggerito:** titolare e Software Agency.
- **verifica:** una revisione periodica degli accessi documentata e i permessi ristretti.

### MIZAR-15: cancellazione dell'account solo logica, export incompleto
- **area:** esportazioni e cancellazione
- **stato:** parzialmente_conforme
- **priorità:** P2
- **evidenze:**
  - `src/account.js:13` imposta solo `deleted_at`: anagrafica, note di salute, messaggi e documenti restano.
  - Si chiude solo la sessione corrente (riga 15); le altre sessioni attive non vengono invalidate.
  - `src/account.js:5-6` esporta solo una parte dei dati: mancano `note_salute`, `codice_fiscale`, `payers`, `bookings` e `messages`.
- **raccomandazione:**
  - Cancellare o anonimizzare i dati non soggetti a obbligo di conservazione.
  - Invalidare tutte le sessioni dell'utente.
  - Completare l'export.
- **riferimenti:** GDPR artt. 15, 17, 20, 25.
- **responsabile suggerito:** Software Agency (Backend). Per i contenuti: AIPCA Data Subject Rights.
- **verifica:** dopo la cancellazione restano solo le fatture e i dati del pagatore necessari.

### MIZAR-19, 20, 21: controlli non verificabili
- **stato:** non_verificabile
- **MIZAR-19 (P2):** mancano `src/db.js` e `src/storage.js`. Non sono verificabili:
  - il TLS verso Postgres e lo storage;
  - la cifratura a riposo del DB e del bucket (le colonne `note_salute` e `codice_fiscale` sono in chiaro a livello applicativo, `db/schema.sql:22,26,35`);
  - la separazione delle credenziali fra produzione e staging (rclone usa lo stesso remote `nimbus:` per entrambi in `scripts/refresh-staging.sh:6`).
- **MIZAR-20 (P3):** senza `package.json` né lockfile non è verificabile la gestione delle vulnerabilità delle dipendenze. Non esiste un processo di aggiornamento documentato.
- **MIZAR-21 (P3):** `express-session` non ha uno `store` configurato (`src/server.js:13-20`). Se in produzione resta il MemoryStore, le sessioni non sopravvivono ai riavvii e non si possono revocare in modo centralizzato. Inoltre non c'è un controllo all'avvio che `SESSION_SECRET` sia definito.
- **raccomandazione:** fornire i file mancanti e la documentazione Nimbus (cifratura, TLS, IAM) per completare la verifica.

## Lacune tecniche principali

1. Gestione delle chiavi: una chiave sola, nel repository, condivisa fra gli ambienti, senza rotazione.
2. Ambienti non separati: dati reali in staging.
3. Backup non cifrati, fuori dal SEE, conservati 10 anni, mai provati con un ripristino.
4. Privilegio minimo violato nell'export, con esposizione di dati di salute e di minori.
5. Flussi verso terzi senza garanzie: InsightAI, ChatNow, Coldvault e il servizio di statistiche.
6. Audit trail parziale e cancellabile. Log con dati personali.
7. Autenticazione senza protezioni contro gli attacchi automatici e senza MFA per il personale.

## Nota sul contesto

Dal registro dei fornitori risulta un altro punto, fuori dal mio perimetro: Mailorbit dichiara come garanzia il «Privacy Shield», invalidato dalla CGUE con la sentenza C-311/18. Lo segnalo ad AIPCA Vendor Compliance.

Non ho avuto bisogno di toccare le schede `ai-act-date` e `legge-132-2025-ia`. La scheda `decisioni-adeguatezza` sarebbe pertinente per MIZAR-04 e MIZAR-06, ma non era disponibile: l'adeguatezza di Singapore resta da verificare.

## Riepilogo finale

Rilievi: 0 P0, 7 P1 (MIZAR-01…07), 8 P2 nei rilievi MIZAR-08…15 più un P2 tra i non verificabili (MIZAR-19), 2 P3 (MIZAR-20, 21).

Tre controlli risultano verificati, solo per le evidenze raccolte: hash argon2id, configurazione del cookie di sessione e segreti dei fornitori nelle variabili d'ambiente.

Ordine consigliato:
1. Rotazione e spostamento della chiave dei documenti (MIZAR-01).
2. Svuotare lo staging (MIZAR-03).
3. Correggere la query di export (MIZAR-02).
4. Sospendere l'invio a InsightAI (MIZAR-06).
5. Cifratura e collocazione dei backup (MIZAR-04).

Ogni correzione richiede l'approvazione dell'utente prima dell'intervento della Software Agency. Per MIZAR-01 consiglio una valutazione di possibile violazione da parte del titolare.

— AIPCA-05 · MIZAR
