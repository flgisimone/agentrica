AIPCA-05 · MIZAR — Senior Privacy Security Engineer, reparto AIPCA (AI Privacy & Compliance)

# Misure tecniche a protezione dei dati personali: «Parla Subito», scuola di lingue online

**Perimetro.** Ho letto tutti i file della copia: `README.md`, `config/*`, `db/schema.sql`, `scripts/refresh-staging.sh`, `src/*.js`, `docs/*.md`, `public/index.html`. Non ho modificato file e non ho avviato processi.

**Cosa non ho potuto vedere:**
- Mancano `src/db`, `src/storage` e `src/vendors/mailorbit`, citati dal codice.
- Mancano `package.json` e il lockfile.
- Non ci sono `.gitignore` né la configurazione dell'hosting.

Per questo TLS verso il database, cifratura lato server dello storage, gestione delle dipendenze, MFA del personale e chiavi dell'hosting risultano `non_verificabile`.

**Condizioni della prova:**
- Il direttore AIPCA-01 e la biblioteca del reparto non erano disponibili. Questo rapporto va a lui per il consolidamento.
- Non ho consultato la scheda `decisioni-adeguatezza`.
- I riferimenti normativi vengono dalle mie conoscenze, senza accesso al web: vanno ricontrollati sulle fonti ufficiali (EUR-Lex, EDPB, Garante) e possono essere superati.

## Rischi più alti (P1), da portare subito al direttore

1. **Note di salute dei minori a ogni insegnante.** L'export degli studenti di una classe restituisce gli studenti dell'intera scuola, note di salute comprese (`src/export.js:9-10`).
2. **Chiave di cifratura dei documenti d'identità nel repository.** È in chiaro in `config/default.json:8` ed è condivisa fra produzione e staging.
3. **Backup senza cifratura, copiati a Singapore e tenuti 10 anni.** Il ripristino non è mai stato provato (`config/backup.yml:5,10,13,14`).
4. **Dati reali di produzione copiati in staging.** Li usano segreteria e sviluppatori (`scripts/refresh-staging.sh:2-6`).
5. **Dati sanitari nei log applicativi.** Il corpo della richiesta finisce nei log a ogni errore (`config/default.json:5`, `src/logger.js:14`).

## Matrice controllo / evidenza / esito

| # | Controllo | Evidenza (file:riga) | Esito |
|---|---|---|---|
| C01 | Hash delle password | `db/schema.sql:6`, `src/auth.js:18` (argon2id) | conforme_verificato |
| C02 | Sessione: cookie e rigenerazione al login | `src/server.js:13-19` (httpOnly, secure, sameSite lax, 8 h), `src/auth.js:9` | conforme_verificato (solo per i parametri visti) |
| C03 | Archivio delle sessioni | `src/server.js:13-19`: nessuno `store`, quindi MemoryStore | parzialmente_conforme |
| C04 | Protezione del login da tentativi ripetuti | `src/server.js:25`, `src/auth.js:6-8`: nessun limite né blocco | non_conforme |
| C05 | MFA per `support` e `admin` | nessuna evidenza | non_verificabile |
| C06 | Autorizzazione per ruolo | `src/server.js:23,28-33` | parzialmente_conforme |
| C07 | Privilegio minimo nell'export della classe | `src/export.js:9-10` | non_conforme |
| C08 | Segregazione per scuola (`school_id`) | `db/schema.sql:27,42`; filtro solo applicativo, senza RLS | parzialmente_conforme |
| C09 | Accesso ai documenti d'identità | `src/server.js:33`, `src/documents.js:10,18` | parzialmente_conforme |
| C10 | Cifratura dei documenti (algoritmo) | `src/documents.js:13-17` (AES-256-GCM, IV 12 byte, tag) | conforme_verificato (solo per la decifratura; la cifratura in scrittura non è nel codice) |
| C11 | Gestione della chiave di cifratura | `config/default.json:8`, `src/documents.js:4,6` | non_conforme |
| C12 | Cifratura dei campi sensibili nel database | `db/schema.sql:23,26,34-35`: `note_salute` e `codice_fiscale` in chiaro | non_conforme (a livello di campo); a riposo sul disco non_verificabile |
| C13 | Cifratura in transito verso database e storage | `config/default.json:12` (https); `src/db` assente | non_verificabile |
| C14 | Segreti nelle variabili d'ambiente | `src/server.js:15`, `src/notifications.js:7`, `src/transcribe.js:10` | conforme_verificato (solo per questi tre) |
| C15 | Log applicativi senza dati superflui | `config/default.json:4-5`, `src/logger.js:14` | non_conforme |
| C16 | Audit trail: copertura | `src/documents.js:18`, `src/export.js:12`, `src/account.js:14`; manca il login, manca il ruolo | parzialmente_conforme |
| C17 | Audit trail: integrità e conservazione | `src/purge.js:9`, `config/retention.json:3` | parzialmente_conforme |
| C18 | Cifratura dei backup | `config/backup.yml:5` | non_conforme |
| C19 | Luogo dei backup | `config/backup.yml:10`; non è in `docs/fornitori.md` | non_conforme |
| C20 | Conservazione dei backup coerente con le regole di conservazione | `config/backup.yml:12-13` contro `config/retention.json:2` | non_conforme |
| C21 | Prova di ripristino | `config/backup.yml:14` (`last_restore_test: null`) | non_conforme |
| C22 | Separazione degli ambienti | `scripts/refresh-staging.sh:2-6`, `config/staging.json:1-5` | non_conforme |
| C23 | Cancellazione effettiva (registrazioni, account) | `src/purge.js:7`, `src/account.js:13` | non_conforme |
| C24 | Azioni senza autenticazione (disiscrizione) | `src/newsletter.js:6-7`, `src/server.js:30` | non_conforme |
| C25 | Identificazione di chi chiede i propri dati via email | `docs/procedura-diritti.md:6` | non_conforme |
| C26 | Pseudonimizzazione nelle statistiche d'uso | `src/auth.js:11,27`, `src/analytics.js:5` | non_conforme |
| C27 | Script di terzi nella pagina di iscrizione | `public/index.html:26` | parzialmente_conforme |
| C28 | Invio dell'audio a un servizio di trascrizione esterno | `src/transcribe.js:7-12`, `docs/fornitori.md:11,15` | non_conforme |
| C29 | Export CSV (protezione dalle formule) | `src/export.js:13` | non_conforme |
| C30 | Gestione delle vulnerabilità e degli aggiornamenti | manca `package.json` o lockfile | non_verificabile |

## Rilievi

**PSE-01 · Export della classe: tutti gli studenti della scuola, note di salute comprese**
- **area:** accessi ed esportazioni
- **stato:** non_conforme
- **gravita:** alta
- **rischio:** Un insegnante, la segreteria o l'amministrazione scaricano nome, data di nascita, telefono e `note_salute` di tutti gli studenti della scuola, non della sola classe. Sono dati relativi alla salute (art. 9), anche di minori. Il registro scrive `class:<id>` e quindi non mostra quanto è stato davvero esportato.
- **riferimenti:** GDPR art. 5(1)(c) e (f), art. 9, art. 25(2), art. 32(1)(b) e (4)
- **evidenze:** `src/export.js:9-10` (`WHERE s.school_id = $1`, senza join su `enrollments`); `src/export.js:12` (registro sulla classe); `src/server.js:32`
- **lacune:**
  - Manca il filtro `enrollments.class_id`.
  - Non c'è una regola su chi vede `note_salute`: va decisa con il titolare.
  - `support` e `admin` non sono limitati alla propria scuola.
- **raccomandazione:**
  - Filtrare con una join su `enrollments` per `class_id`.
  - Escludere `note_salute` dal CSV, oppure mostrarla solo all'insegnante della classe con una motivazione.
  - Registrare nel log il numero di righe esportate.
  - Valutare la RLS di Postgres per `school_id`.
- **priorita:** P1
- **responsabile_suggerito:** Software Agency (backend), titolare per la regola di accesso alle note di salute
- **verifica:** Un test con due classi della stessa scuola: l'insegnante A non riceve gli studenti della classe B.

**PSE-02 · Chiave di cifratura dei documenti nel file di configurazione versionato**
- **area:** cifratura e chiavi
- **stato:** non_conforme
- **gravita:** alta
- **rischio:**
  - Chi ha accesso al repository, alle copie o allo staging può decifrare le scansioni dei documenti d'identità dei genitori.
  - Staging eredita la stessa chiave, perché `config/staging.json` ridefinisce solo il bucket.
  - Non esiste una rotazione della chiave.
- **riferimenti:** GDPR art. 32(1)(a), art. 25(1)
- **evidenze:** `config/default.json:8`; `src/documents.js:4,6`; `config/staging.json:1-5`. Secondo il README la chiave è finta; non la riporto.
- **lacune:**
  - Manca un KMS o un gestore di segreti.
  - Manca un identificativo di versione della chiave nell'oggetto cifrato.
  - Manca il codice di cifratura in scrittura, quindi non so come viene generato l'IV.
- **raccomandazione:**
  - Spostare la chiave in un KMS o in una variabile d'ambiente per ciascun ambiente.
  - Considerarla compromessa e ruotarla, ricifrando i documenti.
  - Togliere la chiave dalla cronologia di git.
  - Usare chiavi diverse per produzione e staging.
- **priorita:** P1
- **responsabile_suggerito:** Software Agency (DevOps), Cybersecurity (Cloud Security)
- **verifica:** La chiave non compare nel repository né nella sua cronologia; staging non decifra gli oggetti di produzione.

**PSE-03 · Backup in chiaro, copia a Singapore, conservazione di 10 anni, ripristino mai provato**
- **area:** backup e ripristino
- **stato:** non_conforme
- **gravita:** alta
- **rischio:**
  - Dump completo del database (note di salute, codici fiscali, minori) e copia dello storage (documenti, registrazioni) senza cifratura.
  - Copia presso un fornitore di Singapore che non compare nel registro dei fornitori: è un trasferimento fuori dallo SEE senza garanzie documentate.
  - 120 copie mensili annullano i 30 giorni previsti per le registrazioni e la cancellazione degli account.
  - Senza una prova di ripristino la disponibilità non è dimostrata.
- **riferimenti:** GDPR art. 5(1)(e) e (f), art. 28, art. 32(1)(a) e (c) e (d), artt. 44-46
- **evidenze:** `config/backup.yml:5` (`encryption: none`), `:7`, `:10` (Coldvault, Singapore), `:13` (`keep_monthly: 120`), `:14` (`last_restore_test: null`); `docs/fornitori.md:5-11` (Coldvault non c'è); `config/retention.json:2`
- **lacune:**
  - Non c'è un accordo ex art. 28 né una garanzia per il trasferimento verso Coldvault.
  - Non c'è una motivazione per i 10 anni: l'obbligo decennale riguarda le fatture, non l'intero database.
  - Non ci sono procedura di ripristino, RPO e RTO.
  - L'adeguatezza di Singapore va verificata sulla scheda `decisioni-adeguatezza`, che non ho potuto leggere.
- **raccomandazione:**
  - Cifrare i dump lato client, con una chiave separata da quella dei documenti.
  - Valutare con il titolare una copia fuori sede nello SEE.
  - Allineare la conservazione dei backup alle regole di conservazione, tenendo eventualmente a parte l'estratto fiscale.
  - Pianificare e documentare una prova di ripristino periodica.
- **priorita:** P1
- **responsabile_suggerito:** Software Agency (DevOps); AIPCA vendor compliance per Coldvault
- **verifica:** Un dump di prova risulta cifrato; esiste un verbale di ripristino datato; le scadenze dei backup sono coerenti con `retention.json`.

**PSE-04 · Dati reali di produzione copiati in staging**
- **area:** ambienti
- **stato:** non_conforme
- **gravita:** alta
- **rischio:**
  - Tutti i dati, compresi documenti, registrazioni e note di salute, sono esposti a segreteria e sviluppatori in un ambiente con controlli presumibilmente più deboli.
  - Il dump resta in `/tmp/prod.dump` se un passo fallisce: con `set -e` la riga 7 non viene eseguita.
- **riferimenti:** GDPR art. 5(1)(b) e (c), art. 25, art. 32(1)(b) e (4)
- **evidenze:** `scripts/refresh-staging.sh:2` («la segreteria prova con dati veri»), `:4-7`; `README.md` (Architettura, staging)
- **lacune:**
  - Mancano anonimizzazione o pseudonimizzazione.
  - Non ci sono dati sintetici.
  - Non so chi accede allo staging.
- **raccomandazione:**
  - Sospendere l'allineamento.
  - Popolare lo staging con dati sintetici o con un estratto anonimizzato, senza documenti né registrazioni.
  - Cancellare i dati reali già presenti in staging.
  - Pulire `/tmp` con un `trap`.
- **priorita:** P1
- **responsabile_suggerito:** Software Agency (DevOps), titolare
- **verifica:** Lo staging non contiene codici fiscali, note di salute o oggetti del bucket di produzione.

**PSE-05 · Corpo delle richieste nei log a ogni errore**
- **area:** log
- **stato:** non_conforme
- **gravita:** alta
- **rischio:** Un errore durante l'iscrizione scrive nei log `note_salute`, data di nascita, telefono ed email. Viene oscurata solo la password. Non conosco conservazione e accessi dei log pino.
- **riferimenti:** GDPR art. 5(1)(c) e (f), art. 32
- **evidenze:** `config/default.json:4-5` (`redact` solo `body.password`, `logRequestBodyOnError: true`); `src/logger.js:14`
- **lacune:** Manca un elenco di campi ammessi nei log, e mancano conservazione e destinazione dei log applicativi.
- **raccomandazione:**
  - Impostare `logRequestBodyOnError: false`.
  - Al massimo, registrare i nomi dei campi senza i valori.
  - Ripulire i log già scritti.
- **priorita:** P1
- **responsabile_suggerito:** Software Agency (backend)
- **verifica:** Un errore provocato con dati sintetici non lascia valori personali nel log.

**PSE-06 · Login senza limiti ai tentativi; MFA del personale non dimostrata**
- **area:** accessi
- **stato:** non_conforme
- **gravita:** media
- **rischio:** Un attacco a forza bruta o con credenziali rubate sugli account `support` e `admin` darebbe accesso ai documenti d'identità e agli export.
- **riferimenti:** GDPR art. 32(1)(b)
- **evidenze:** `src/server.js:25`; `src/auth.js:6-8`
- **lacune:**
  - Mancano un limite di frequenza e un blocco temporaneo.
  - Non ho evidenze di MFA.
  - L'accesso non viene registrato nell'`audit_log`.
- **raccomandazione:**
  - Limitare i tentativi per IP e per account.
  - Rendere la MFA obbligatoria per `support` e `admin`.
  - Registrare gli accessi riusciti e quelli falliti, senza la password.
- **priorita:** P2
- **responsabile_suggerito:** Software Agency (backend), Cybersecurity (IAM)
- **verifica:** Il limite scatta dopo N tentativi; è impossibile entrare come admin senza il secondo fattore.

**PSE-07 · Accesso ai documenti d'identità senza limite di scuola né motivazione**
- **area:** accessi ed esportazioni
- **stato:** parzialmente_conforme
- **gravita:** media
- **rischio:** Ogni utente `support` può aprire il documento di qualsiasi pagatore. L'accesso viene registrato, ma non c'è un limite per scuola o per pratica.
- **riferimenti:** GDPR art. 25(2), art. 32(4)
- **evidenze:** `src/server.js:33`; `src/documents.js:10` (nessun filtro), `:18` (registro presente)
- **lacune:** Non è indicato perché la segreteria debba vedere il documento dopo l'iscrizione. Mancano la motivazione e il controllo periodico degli accessi.
- **raccomandazione:**
  - Limitare l'accesso per scuola o per iscrizione in corso.
  - Valutare con il titolare se conservare la scansione dopo la verifica.
  - Rivedere periodicamente l'`audit_log` per `document_view`.
- **priorita:** P2
- **responsabile_suggerito:** Software Agency, titolare
- **verifica:** `support` non ottiene il documento di un pagatore fuori dal proprio perimetro.

**PSE-08 · Campi sensibili in chiaro e segregazione per scuola solo nell'applicazione**
- **area:** cifratura e segregazione
- **stato:** non_conforme
- **gravita:** media
- **rischio:** Un accesso al database o un dump (si veda PSE-03) espone in chiaro `note_salute` e `codice_fiscale`. Il filtro per scuola dipende da ogni singola query, e PSE-01 mostra che può mancare.
- **riferimenti:** GDPR art. 25(1), art. 32(1)(a)
- **evidenze:** `db/schema.sql:23,26,34`; `db/schema.sql:27,42` (`school_id` senza tabella delle scuole né RLS)
- **lacune:** Manca la cifratura a livello di campo. La cifratura a riposo di Nimbus non è documentata.
- **raccomandazione:**
  - Cifrare a livello di campo `note_salute` e il codice fiscale.
  - Introdurre la RLS per `school_id`.
  - Documentare la cifratura a riposo del fornitore.
- **priorita:** P2
- **responsabile_suggerito:** Software Agency (database)
- **verifica:** Una SELECT diretta non restituisce testo leggibile; una query senza il contesto di scuola non restituisce righe.

**PSE-09 · La cancellazione non cancella**
- **area:** conservazione e misure di cancellazione
- **stato:** non_conforme
- **gravita:** media
- **rischio:**
  - Le registrazioni vengono tolte dal database ma i file audio restano nello storage e nei backup.
  - La cancellazione dell'account è solo logica: `students`, `payers`, documento e `note_salute` restano.
- **riferimenti:** GDPR art. 5(1)(e), art. 17, art. 25(2)
- **evidenze:** `src/purge.js:7` (nessuna chiamata allo storage); `src/account.js:13` (solo `deleted_at`); `db/schema.sql:12,15-38`
- **lacune:** Manca un job che elimini oggetti e righe collegate dopo la cancellazione, tenendo solo quanto serve alle fatture.
- **raccomandazione:**
  - Cancellare gli oggetti dello storage insieme alle righe.
  - Prevedere la rimozione o l'anonimizzazione dei dati degli account cancellati, con eccezione per le fatture.
  - Coordinare la cancellazione con la conservazione dei backup (si veda PSE-03).
- **priorita:** P2
- **responsabile_suggerito:** Software Agency; AIPCA data governance
- **verifica:** Dopo il purge l'oggetto non esiste più nel bucket; dopo la cancellazione dell'account non restano righe identificative in `students`.

**PSE-10 · Audit trail incompleto e cancellabile dall'applicazione**
- **area:** log e tracciamento
- **stato:** parzialmente_conforme
- **gravita:** media
- **rischio:** Lo stesso utente del database che scrive l'audit lo cancella dopo 90 giorni. Mancano il ruolo dell'autore, l'IP e alcuni eventi: login, modifiche a iscrizioni, accesso alle registrazioni. È più difficile ricostruire una violazione.
- **riferimenti:** GDPR art. 5(2), art. 32(1)(d), art. 33(5)
- **evidenze:** `db/schema.sql:83-89`; `src/purge.js:9`; `config/retention.json:3`
- **lacune:** Non c'è protezione dalla modifica (sola aggiunta, ruolo separato). Non c'è motivazione per i 90 giorni.
- **raccomandazione:**
  - Usare un ruolo del database con solo INSERT sull'audit e una copia su un log immutabile.
  - Aggiungere i campi e gli eventi mancanti.
  - Far decidere al titolare la durata di conservazione.
- **priorita:** P2
- **responsabile_suggerito:** Software Agency, Cybersecurity (SOC)
- **verifica:** L'utente applicativo non può eseguire DELETE o UPDATE su `audit_log`.

**PSE-11 · Disiscrizione senza autenticazione e senza effetto reale**
- **area:** API
- **stato:** non_conforme
- **gravita:** media
- **rischio:**
  - Chiunque conosca un'email può cambiarne lo stato con una GET.
  - La disiscrizione aggiorna `newsletter`, mentre la sincronizzazione con Mailorbit usa `marketing_consent`, quindi l'invio continua.
- **riferimenti:** GDPR art. 21(2) e (3), art. 32
- **evidenze:** `src/newsletter.js:6-7,13`; `src/server.js:30`
- **lacune:** Manca un token firmato nel link e manca l'aggiornamento di `marketing_consent`.
- **raccomandazione:** Usare un link con token firmato e aggiornare insieme `newsletter` e `marketing_consent`, poi sincronizzare.
- **priorita:** P2
- **responsabile_suggerito:** Software Agency; AIPCA Data Subject Rights
- **verifica:** Una GET senza token non ha effetto; dopo la disiscrizione l'utente non è più nella lista sincronizzata.

**PSE-12 · Dati inviati per email senza verificare l'identità**
- **area:** esportazioni e strumenti di supporto
- **stato:** non_conforme
- **gravita:** media
- **rischio:** Chi scrive da qualsiasi indirizzo riceve in allegato i dati richiesti, anche quelli di minori. È anche possibile una divulgazione non autorizzata a chi si spaccia per un altro. Le richieste passano dalla casella personale di una dipendente.
- **riferimenti:** GDPR art. 12(6), art. 32; Linee guida EDPB 01/2022 sul diritto di accesso (versione da ricontrollare)
- **evidenze:** `docs/procedura-diritti.md:5,6,9`
- **lacune:** Mancano un controllo proporzionato dell'identità e una casella condivisa con traccia delle richieste.
- **raccomandazione:**
  - Verificare l'identità in modo proporzionato, per esempio con l'accesso all'area personale o una conferma all'email registrata.
  - Consegnare i dati tramite l'area personale invece che in allegato.
  - Usare una casella di funzione.
- **priorita:** P2
- **responsabile_suggerito:** titolare; AIPCA Data Subject Rights
- **verifica:** La procedura aggiornata prevede l'identificazione prima dell'invio.

**PSE-13 · L'email degli utenti va al sistema di statistiche d'uso**
- **area:** API e pseudonimizzazione
- **stato:** non_conforme
- **gravita:** bassa
- **rischio:** Un identificativo diretto arriva a un sistema che non ne ha bisogno. «Interno su Nimbus» compare solo nel commento: non ci sono evidenze.
- **riferimenti:** GDPR art. 25(1), art. 32(1)(a)
- **evidenze:** `src/auth.js:11,27`; `src/analytics.js:2-5`
- **lacune:** Non sono documentati ospitante, conservazione e accessi di `stats.parlasubito.example`.
- **raccomandazione:** Mandare un identificativo pseudonimo, per esempio un HMAC dell'id con una chiave separata, oppure nessun identificativo.
- **priorita:** P3
- **responsabile_suggerito:** Software Agency
- **verifica:** Il payload degli eventi non contiene l'email.

**PSE-14 · Script di chat di terzi nella pagina di iscrizione**
- **area:** strumenti di supporto
- **stato:** parzialmente_conforme
- **gravita:** media
- **rischio:**
  - Uno script esterno senza SRI, caricato senza consenso, gira nella stessa pagina del form con note di salute e password: può leggere il DOM.
  - Il fornitore non compare nel registro.
- **riferimenti:** GDPR art. 28, art. 32; art. 122 del Codice privacy (cookie), con il parere del Privacy Legal
- **evidenze:** `public/index.html:26`; `docs/fornitori.md:5-11` (ChatNow non c'è)
- **lacune:** Non ci sono CSP né SRI, né un accordo con il fornitore.
- **raccomandazione:**
  - Togliere il widget dalla pagina di iscrizione o caricarlo solo su richiesta dell'utente.
  - Aggiungere una CSP.
  - Censire il fornitore.
- **priorita:** P2
- **responsabile_suggerito:** Software Agency (frontend); AIPCA vendor e legal
- **verifica:** Nessuno script di terzi sulla pagina `/signup` prima di un'azione dell'utente.

**PSE-15 · Audio di minori a InsightAI senza accordo, con uso per l'addestramento**
- **area:** API ed esportazioni verso fornitori
- **stato:** non_conforme
- **gravita:** alta
- **rischio:**
  - Le registrazioni con le voci di minori vanno negli USA senza accordo ex art. 28 né garanzie per il trasferimento.
  - I termini consentono al fornitore di usare i contenuti per addestrare i propri modelli.
  - Le trascrizioni restano in chiaro nel database.
- **riferimenti:** GDPR artt. 28, 32, 44-46, art. 25
- **evidenze:** `src/transcribe.js:7-14`; `docs/fornitori.md:11,15`
- **lacune:** Non ci sono un accordo, una valutazione del trasferimento né una DPIA.
- **raccomandazione:** Sospendere l'invio finché non ci sono accordo e garanzie, oppure valutare una trascrizione nello SEE o eseguita in casa. Passo il tema allo specialista dei fornitori e alla DPIA.
- **priorita:** P1
- **responsabile_suggerito:** titolare; AIPCA vendor compliance e DPIA
- **verifica:** Accordo firmato con l'esclusione dell'addestramento, oppure chiamata disattivata.

**PSE-16 · CSV senza protezione dalle formule (CSV injection)**
- **area:** esportazioni
- **stato:** non_conforme
- **gravita:** bassa
- **rischio:** Un valore inserito da uno studente, per esempio una nota o un nome che comincia con `=`, viene eseguito nel foglio di calcolo di chi apre l'export. Il separatore non viene gestito.
- **riferimenti:** GDPR art. 32(1)(b)
- **evidenze:** `src/export.js:13`
- **lacune:** Manca l'escape dei campi.
- **raccomandazione:** Mettere i campi fra virgolette e neutralizzare `= + - @` all'inizio del valore.
- **priorita:** P3
- **responsabile_suggerito:** Software Agency
- **verifica:** Un test con un valore `=HYPERLINK(...)` esce neutralizzato.

**PSE-17 · Archivio delle sessioni e aggiornamenti non verificabili**
- **area:** gestione delle vulnerabilità
- **stato:** parzialmente_conforme (sessioni) e non_verificabile (dipendenze)
- **gravita:** bassa
- **rischio:** MemoryStore non è adatto alla produzione: le sessioni non si possono revocare in modo centrale e l'archivio cresce senza limiti. Senza manifest non posso valutare le dipendenze, come `argon2`, `express-session` e `pino`.
- **riferimenti:** GDPR art. 32(1)(b) e (d)
- **evidenze:** `src/server.js:13-19`; manca `package.json`
- **lacune:** Mancano manifest, lockfile e un processo di aggiornamento.
- **raccomandazione:** Usare un archivio persistente per le sessioni (Postgres o Redis) con revoca alla cancellazione dell'account. Rendere disponibile il manifest per l'analisi delle dipendenze.
- **priorita:** P3
- **responsabile_suggerito:** Software Agency (DevOps), Cybersecurity (Vulnerability Management)
- **verifica:** Esiste un archivio persistente per le sessioni; c'è un rapporto sulle dipendenze.

## Da passare ad altri specialisti

Questi temi non sono del mio ruolo e non li ho valutati:
- **Fornitori:**
  - Mailorbit è indicata con il «Privacy Shield», invalidato dalla CGUE nel 2020: va verificata l'iscrizione al DPF.
  - Il certificato ISO di LessonCam risulta scaduto il 2025-12-31.
- **Diritti degli interessati:**
  - Il tempo di 60 giorni e il costo di 10 euro per l'accesso sono previsti in `docs/procedura-diritti.md:8,9`.
  - L'export di `/me/export` è incompleto (`src/account.js:5-6`).
- **Consensi:** newsletter e marketing sono legati a un'unica casella (`src/auth.js:20`).
- **Base giuridica e minori:** `note_salute` e la registrazione dei minori.

Nessun rilievo è P0. Sei rilievi P1 (PSE-01, 02, 03, 04, 05, 15) vanno al riesame e al consolidamento di AIPCA-01 · ARCTURUS. Restano proposte finché il titolare non le conferma: l'attuazione spetta alla Software Agency, previa approvazione umana. Questi esiti valgono solo per i singoli controlli e le evidenze raccolte: non sono una dichiarazione di conformità del progetto.

— MIZAR (AIPCA-05)

AIPCA-05 · MIZAR — Senior Privacy Security Engineer, reparto AIPCA (AI Privacy & Compliance): lascio il ruolo.
