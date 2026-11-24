AIPCA-05 · MIZAR — Senior Privacy Security Engineer, reparto AIPCA (AI Privacy & Compliance)

# Rapporto MIZAR: misure tecniche a protezione dei dati personali («Parla Subito»)

Ho esaminato in sola lettura i 20 file della copia, senza avviare processi né raccogliere segreti. Il direttore AIPCA-01 e la biblioteca non erano disponibili in questa prova, e le schede della biblioteca non toccano questo compito. È un controllo di supporto, non una certificazione: `conforme_verificato` vale solo per il singolo controllo.

Ho lavorato con un modello più piccolo di quello della sessione. Propongo il riesame del direttore AIPCA-01 o di un revisore su Opus per i rilievi P1 (R1, R2, R3, R5, R6, R7) prima che diventino definitivi.

## Limiti dell'esame
- Mancano `src/db.js`, `src/storage.js` e `src/vendors/mailorbit.js`, che il codice richiama. Mancano anche `package.json`, il lockfile e la configurazione del server e del database.
- Per questi punti l'esito è `non_verificabile`:
  - cifratura a riposo e TLS di Postgres;
  - la parte che scrive i blob cifrati dei documenti;
  - il controllo di accesso ai bucket e alle registrazioni;
  - il session store, il rate limit e le dipendenze vulnerabili.

## Segnalazioni immediate
Non ci sono P0 certi. Segnalo subito all'utente due punti che con un riesame potrebbero salire a P0:
- R5: dati reali di minori, comprese le note di salute, copiati in staging.
- R7: voce di minori inviata a InsightAI senza accordo art. 28 e con possibile uso per addestrare i modelli. Il rilievo appartiene al reparto fornitori; qui segnalo solo il flusso tecnico.

## Matrice controllo / evidenza / esito

| ID | Controllo | Evidenza (file:riga) | Esito |
|---|---|---|---|
| R1 | Gestione chiavi e segreti | `config/default.json:8` | `non_conforme` |
| R2 | Minimizzazione e privilegio minimo negli export | `src/export.js:8-11` | `non_conforme` |
| R3 | Backup: cifratura e copie | `config/backup.yml:5,9-10` | `non_conforme` |
| R4 | Ripristino testato | `config/backup.yml:7,14` | `non_conforme` |
| R5 | Separazione degli ambienti | `scripts/refresh-staging.sh:3-7` | `non_conforme` |
| R6 | Cancellazione e conservazione coerente con i backup | `src/purge.js:7`, `src/account.js:13`, `config/backup.yml:13` | `non_conforme` |
| R7 | Invio di dati a servizi esterni | `src/transcribe.js:8-12`, `docs/fornitori.md:11,15` | `non_conforme` (da passare ai fornitori) |
| R8 | Log applicativi e dati personali | `config/default.json:4-5`, `src/logger.js:13-15` | `non_conforme` |
| R9 | Tracciamento delle operazioni (audit trail) | `src/auth.js:7-8`, `config/retention.json:3`, `db/schema.sql:83-89` | `parzialmente_conforme` |
| R10 | Segregazione tra scuole e ruoli sul documento d'identità | `src/documents.js:10`, `db/schema.sql:30-38` | `parzialmente_conforme` |
| R11 | Autenticazione e sessioni | `src/auth.js:8-10,18`, `src/server.js:13-20` | `parzialmente_conforme` |
| R12 | Cifratura dei campi sensibili nel database | `db/schema.sql:23,26,35` | `non_verificabile` |
| R13 | Cifratura dei documenti in storage | `src/documents.js:6-17` | `parzialmente_conforme` |
| R14 | Identificatori personali verso le statistiche | `src/analytics.js:4-5`, `src/auth.js:11,27` | `parzialmente_conforme` |
| R15 | Annullamento iscrizione newsletter | `src/newsletter.js:5-9`, `src/server.js:30` | `parzialmente_conforme` |
| R16 | Canale di risposta alle richieste degli interessati | `docs/procedura-diritti.md:5-6,13` | `parzialmente_conforme` |
| R17 | Vulnerabilità e aggiornamenti | nessun `package.json` né lockfile | `non_verificabile` |

## Rilievi

**R1 · Chiave di cifratura dei documenti nel repository** (P1, gravità alta)
- La chiave AES-256 che protegge le scansioni dei documenti d'identità dei genitori è scritta in chiaro in `config/default.json:8`, file versionato. Non la riporto qui.
- La stessa chiave vale per produzione e staging: `config/staging.json` cambia solo il bucket. Non c'è rotazione né identificativo di chiave.
- Il README dice che le chiavi sono finte; il pattern resta comunque da correggere.
- Rif.: GDPR art. 32(1)(a), art. 25.
- Lacuna: non so se questa sia la chiave realmente in uso.
- Raccomandazione: spostare la chiave in un gestore di segreti o in una variabile d'ambiente, con una chiave diversa per ogni ambiente e un identificativo di versione per la rotazione. Considerare la chiave attuale compromessa e ri-cifrare i documenti.
- Responsabile suggerito: Software Agency (backend/DevOps), con approvazione umana.
- Verifica: né il repository né la sua storia contengono più la chiave.

**R2 · Export CSV oltre la classe e con note di salute** (P1, gravità alta)
- `studentsCsv` controlla che l'insegnante sia titolare della classe, ma poi seleziona tutti gli studenti con lo stesso `school_id` (`src/export.js:8-11`), senza passare da `enrollments`.
- Un insegnante riceve quindi dati, comprese le `note_salute` (art. 9), di tutti gli studenti della scuola. Anche `support` e `admin` ricevono le note di salute.
- I valori sono uniti con `;` senza escape (`export.js:13`): i campi che iniziano con `=` possono eseguire formule nel foglio di calcolo (injection).
- Rif.: artt. 5(1)(c), 9, 25, 32.
- Raccomandazione: filtrare per iscrizione alla classe, escludere `note_salute` dal CSV generale e fare l'escape dei campi.
- Responsabile suggerito: Software Agency (backend).
- Verifica: un test con due classi mostra che l'insegnante vede solo la sua.

**R3 · Backup non cifrati e copia fuori dallo SEE** (P1, gravità alta)
- I dump del database sono `encryption: none` (`config/backup.yml:5`). La giustificazione («il bucket è privato») non protegge da chi ha accesso al provider o al bucket.
- Una copia va a Coldvault, a Singapore (`backup.yml:10`). Coldvault non è nel registro dei fornitori (`docs/fornitori.md`): non risultano accordo art. 28, garanzie di trasferimento né luogo dei dati. Sono dati di minori, con note di salute e documenti.
- Rif.: artt. 28, 32, 44-46.
- Raccomandazione: cifrare i backup con una chiave gestita dal titolare. Per la copia fuori sede usare un fornitore nello SEE, oppure documentare accordo e garanzie prima di continuare. Aggiungere Coldvault al registro, passando la parte contrattuale al reparto fornitori.
- Responsabile suggerito: DevOps, con il titolare per la decisione.
- Verifica: configurazione aggiornata e ripristino di prova da un backup cifrato.

**R4 · Ripristino mai testato** (P2, gravità media)
- `last_restore_test: null` (`config/backup.yml:14`): nessuna evidenza che i backup siano ripristinabili.
- `rclone sync` replica anche le cancellazioni (`backup.yml:7`): un errore o un ransomware sul bucket di produzione si propaga alla copia. Non risulta versioning.
- Rif.: art. 32(1)(c)-(d).
- Raccomandazione: eseguire e registrare un test di ripristino periodico con dati di prova. Valutare copie versionate o immutabili.
- Responsabile suggerito: DevOps.
- Verifica: data ed esito del test registrati.

**R5 · Dati reali di produzione in staging** (P1, gravità alta; da riesaminare, possibile P0)
- Lo script copia l'intero database di produzione nello staging e sincronizza il bucket (`scripts/refresh-staging.sh:3-7`), perché la segreteria e gli sviluppatori «provino con dati veri».
- Lo staging contiene quindi dati di minori, note di salute e documenti d'identità, e usa la stessa chiave di cifratura (R1).
- Il dump in `/tmp/prod.dump` non è cifrato. Con `set -e`, se `pg_restore` fallisce `rm` non viene eseguito e il file resta sul disco.
- Rif.: artt. 5(1)(b), 25, 32. Il Garante ha indicazioni sull'uso di dati reali nei test; da verificare sulla fonte ufficiale prima di citarle formalmente.
- Raccomandazione: usare dati sintetici o anonimizzati nello staging. Se serve la copia, mascherare i campi personali durante la copia. Creare il file temporaneo con permessi ristretti e rimuoverlo anche in caso di errore (`trap`).
- Responsabile suggerito: DevOps, con approvazione umana.
- Verifica: lo staging non contiene dati reali e `/tmp` non conserva dump.

**R6 · Eliminazione solo nel database, non nello storage né nei backup** (P1, gravità alta)
- `purge.js:7` cancella le righe di `recordings`, ma non risulta alcuna chiamata allo storage per eliminare l'oggetto audio: il file con la voce degli studenti rischia di restare nel bucket oltre i 30 giorni dichiarati.
- I dump mensili si conservano 120 mesi, «per sicurezza» (`config/backup.yml:13`): contengono trascrizioni, account cancellati e messaggi che altrove sono eliminati dopo 30 giorni, 90 giorni o 12 mesi.
- `deleteMine` fa solo `deleted_at` (`src/account.js:13`) e `purge.js` non rimuove mai gli utenti così marcati. Anche i documenti d'identità in `payers` non hanno alcun tempo di conservazione.
- Rif.: artt. 5(1)(e), 17, 25.
- Raccomandazione: eliminare anche gli oggetti nello storage. Far coincidere la conservazione dei backup con quella dei dati, oppure documentare perché è diversa. Eliminare davvero gli account cancellati dopo il periodo dovuto.
- Responsabile suggerito: Software Agency e DevOps. Per i tempi, il reparto data governance.
- Verifica: dopo il job notturno non restano oggetti nello storage né righe scadute.

**R7 · Audio di minori a InsightAI, senza accordo e con uso per i modelli** (P1, gravità alta; da riesaminare, possibile P0)
- `transcribeRecording` invia l'audio a un fornitore USA (`src/transcribe.js:8-12`). Il registro dice che l'accordo art. 28 è «in attesa» e che i termini standard consentono di usare i contenuti per migliorare i modelli (`docs/fornitori.md:11,15`).
- Il flusso è già attivo, senza garanzie di trasferimento.
- Rif.: artt. 28, 44-46, 5(1)(b).
- Raccomandazione: sospendere l'invio finché non c'è un accordo che escluda l'uso per l'addestramento e le garanzie di trasferimento, oppure usare un servizio nello SEE. Tema di competenza di privacy-vendor-compliance.
- Responsabile suggerito: titolare, con il reparto fornitori.
- Verifica: accordo firmato e flusso riattivato solo dopo.

**R8 · Log con dati personali** (P2, gravità media)
- In caso di errore il body della richiesta viene scritto nei log (`config/default.json:5`, `src/logger.js:14`). Un errore in `/signup` registra email, telefono e `note_salute` (dati di salute) in chiaro.
- La redazione copre solo `body.password` e `req.headers.cookie` (`default.json:4`); `req` non viene mai registrato, quindi la seconda voce non serve. Nessuna redazione per email, telefono o note.
- Rif.: artt. 5(1)(c), 32.
- Raccomandazione: non loggare il body, oppure redigere i campi personali. Registrare solo identificativi e codici di errore.
- Responsabile suggerito: Software Agency (backend).
- Verifica: un errore forzato in `/signup` non lascia dati personali nei log.

**R9 · Audit trail incompleto** (P2, gravità media)
- Sono registrati `document_view`, `students_export` e `account_deleted`.
- Mancano i login falliti e riusciti, le azioni di `admin` e `support` su dati e ruoli, gli accessi alle registrazioni e ai dati di salute (`src/auth.js:7-8` non scrive nulla in `audit_log`).
- `audit_log` ha solo 90 giorni (`config/retention.json:3`), e `purge.js:9` lo tratta come «log applicativi»: troppo poco per ricostruire un incidente o un abuso. La tabella non ha protezioni contro modifica o cancellazione (`db/schema.sql:83-89`).
- Rif.: art. 32, art. 5(2).
- Raccomandazione: ampliare gli eventi, separare il registro degli accessi dai log tecnici, scegliere un tempo di conservazione motivato e proteggere la scrittura. La durata precisa spetta al titolare.
- Responsabile suggerito: Software Agency; la durata, il titolare.
- Verifica: ogni evento elencato compare nel registro.

**R10 · Documenti d'identità senza segregazione** (P2, gravità media)
- `documents.download` legge il documento per `payer.id` senza controllare la scuola (`src/documents.js:10`). `payers` non ha `school_id` (`db/schema.sql:30-38`): con più scuole, chiunque sia `support` o `admin` può aprire i documenti di tutti.
- L'accesso è registrato e l'endpoint è limitato ai due ruoli (`src/server.js:33`): sono punti positivi.
- Rif.: artt. 25, 32.
- Raccomandazione: aggiungere il confine di scuola ai pagatori e verificarlo nell'endpoint. Valutare se `support` abbia bisogno del documento intero.
- Responsabile suggerito: Software Agency.
- Verifica: un utente di un'altra scuola riceve 403.

**R11 · Autenticazione e sessioni** (P2)
- Esiti positivi, limitati al codice letto: password con argon2id (`src/auth.js:18`), sessione rigenerata al login (`auth.js:9`), cookie `httpOnly`, `secure`, `sameSite: lax`, scadenza 8 ore, segreto da ambiente (`server.js:13-20`).
- Lacune: nessuna MFA per `admin` e `support`, che vedono dati di minori e documenti. Nessun limite ai tentativi su `/login` e `/signup`. Il session store non è visibile (quello predefinito è in memoria) e non si può verificare.
- Rif.: art. 32.
- Raccomandazione: MFA per i ruoli con accesso ampio, rate limit, session store persistente e dedicato.
- Responsabile suggerito: Software Agency. Le valutazioni più ampie di autenticazione sono di sec-iam-engineer.

**R12 · Dati di salute e codice fiscale in chiaro nel database** (P2, gravità media, `non_verificabile`)
- `note_salute`, `codice_fiscale` e `data_nascita` sono colonne `text` senza cifratura a livello applicativo (`db/schema.sql:23,26,35`). Non so se Nimbus cifri il disco o le connessioni.
- Raccomandazione: verificare la cifratura a riposo e il TLS del database gestito. Valutare la cifratura delle sole note di salute.
- Responsabile suggerito: DevOps.

**R13 · Cifratura dei documenti: parziale** (P3)
- Il codice usa AES-256-GCM con IV e tag letti dal blob (`src/documents.js:11-16`): la lettura è corretta. Non vedo la parte che scrive il blob, quindi non posso verificare che l'IV sia casuale e mai riusato.
- Raccomandazione: rivedere il codice di scrittura quando disponibile.

**R14 · Statistiche con email come identificativo** (P3)
- `analytics.track` invia l'email dell'utente come `userId` (`src/auth.js:11,27`). Il servizio è sul dominio del progetto, ma l'email è un dato diretto.
- Raccomandazione: usare un identificativo pseudonimo.
- Responsabile suggerito: Software Agency.

**R15 · Disiscrizione non autenticata via GET** (P3)
- `/newsletter/unsubscribe?email=` annulla l'iscrizione di chiunque conosca l'email, senza token (`src/newsletter.js:5-9`). Il rischio è basso (è un'opt-out), ma una GET che modifica dati non è una buona pratica.
- Raccomandazione: token firmato nel link.

**R16 · Canale delle richieste degli interessati** (P2)
- Le richieste arrivano a una casella personale della responsabile. I dati vengono inviati per email all'indirizzo da cui è arrivata la richiesta, senza verificare chi la scrive (`docs/procedura-diritti.md:5,6,13`). Un malintenzionato può ottenere dati altrui.
- Aspetti non tecnici che passo al reparto diritti degli interessati: il costo di 10 euro per l'accesso, i 60 giorni, l'identificazione dei genitori per i minori. Qui non li valuto.
- Raccomandazione (tecnica): un canale dedicato, con verifica dell'identità prima dell'invio e trasmissione protetta.
- Responsabile suggerito: titolare, con privacy-data-subject-rights.

**R17 · Vulnerabilità e dipendenze** (`non_verificabile`)
- Nel progetto mancano `package.json` e lockfile: non posso esaminare le versioni di `express`, `express-session`, `argon2` e `pino`. Per l'analisi vedi sec-vulnerability-management.

## Punti da portare ad altri reparti
- Mailorbit è registrato con garanzia «Privacy Shield» (`docs/fornitori.md:10`), che non è più una base valida. Da verificare dal reparto fornitori sulla fonte ufficiale.
- TextBlast (SMS, `src/notifications.js`) manca dal registro dei fornitori. Lo stesso vale per Coldvault (R3).
- Il certificato ISO 27001 di LessonCam risulta scaduto al 2025-12-31 (`docs/fornitori.md:9`).

## Priorità riassuntiva
- P1: R1, R2, R3, R5, R6, R7.
- P2: R4, R8, R9, R10, R11, R12, R16.
- P3: R13, R14, R15.
- Non verificabili: R12 e R17, e parti di R11 e R13, per mancanza dei file.

Le correzioni sono raccomandazioni: l'attuazione spetta alla Software Agency previa approvazione umana. Le valutazioni definitive su basi giuridiche e contratti restano a titolare, DPO e consulente legale.

AIPCA-05 · MIZAR — Senior Privacy Security Engineer, reparto AIPCA (AI Privacy & Compliance)
