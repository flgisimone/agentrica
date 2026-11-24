AIPCA-05 · MIZAR — Senior Privacy Security Engineer, reparto AIPCA (AI Privacy & Compliance)

**Rapporto sulle misure tecniche (art. 25 e 32 GDPR), in sola lettura**

**Premessa e limiti**
- Il direttore AIPCA-01 e la biblioteca del reparto non erano disponibili in questa prova. Nessuna nozione datata è stata verificata su fonte, quindi i punti su transfer e certificazioni (Privacy Shield, DPF) restano da ricontrollare.
- Lavoro su un modello più piccolo (Sonnet). Propongo il riesame del direttore o di un revisore su Opus per tutti i rilievi P1 prima che diventino definitivi.
- Il repository non contiene `db`, `storage`, `vendors/mailorbit`, `package.json` né le configurazioni di Nimbus. Non sono verificabili: cifratura a riposo e TLS del database, accessi di Nimbus, dipendenze e vulnerabilità, il codice di import/upload, la rotazione dei segreti.
- Non ho trovato segreti reali da riportare. La chiave in `config/default.json` è citata solo come posizione, senza il valore.
- Nessun P0: non ho visto una violazione in corso né dati reali. Il progetto è dichiarato di prova.

**Matrice controllo / evidenza / esito**

| Controllo | Evidenza | Esito |
|---|---|---|
| Password | `src/auth.js:18` e `db/schema.sql:6` usano argon2id | conforme_verificato (solo hashing) |
| Sessione | `src/server.js:18`: cookie httpOnly, secure, sameSite lax, 8 ore; sessione rigenerata al login (`auth.js:9`) | conforme_verificato (solo cookie e rigenerazione); lo store non è verificabile |
| Autenticazione forte e anti-bruteforce | Nessun rate limit, lockout o MFA nel codice per `support` e `admin`, che vedono documenti di identità | non_conforme |
| Ruoli per rotta | `src/server.js:23-33`: controllo del ruolo sulle rotte | parzialmente_conforme (vedi R2 e R3) |
| Accesso ai dati per classe | `src/export.js:8-10` | non_conforme |
| Cifratura documenti | AES-256-GCM con IV e tag (`src/documents.js:15-17`) | parzialmente_conforme: algoritmo corretto, gestione chiave carente |
| Gestione chiavi e segreti | `config/default.json:8` | non_conforme |
| Cifratura campi sensibili nel database | `note_salute` e `codice_fiscale` in chiaro (`db/schema.sql:23,26`) | non_conforme (valutare la proporzionalità) |
| Log | `config/default.json:5`, `src/logger.js:14` | parzialmente_conforme |
| Audit trail | Tracciati solo `document_view`, `students_export` e `account_deleted`; conservazione 90 giorni | parzialmente_conforme |
| Backup | `config/backup.yml:5`, `:10`, `:13` | non_conforme |
| Ripristino | `last_restore_test: null` | non_verificabile (mai provato) |
| Ambienti | `scripts/refresh-staging.sh` | non_conforme |
| Segregazione tenant | `school_id` presente ma non applicato nelle query; in `signup` è fisso a 1 (`src/auth.js:24`) | non_verificabile (non è chiaro se sia multi-scuola) |
| Esportazioni verso l'interessato | `src/account.js:5-7` | parzialmente_conforme (vedi R12) |
| Cancellazione tecnica | `src/purge.js`, `src/account.js:13` | non_conforme (vedi R7 e R10) |
| Dipendenze e aggiornamenti | Nessun manifest | non_verificabile |
| TLS e cifratura a riposo di Nimbus | Non in repository | non_verificabile |

**Rilievi, con priorità e posizione**

**R1 · P1 · Chiave di cifratura dei documenti nel repository**
- La chiave AES-256 di `src/documents.js:6` è scritta in chiaro in `config/default.json:8`, un file versionato.
- Tutte le scansioni dei documenti di identità, anche di genitori di minori, usano la stessa chiave. Non c'è rotazione né separazione per ambiente: staging eredita la stessa chiave.
- Chi legge il repository e lo storage decifra tutto. Così la cifratura protegge poco.
- Art. 32(1)(a) e art. 25.
- Raccomandazione: portare la chiave in un gestore di segreti o in una variabile d'ambiente, trattare la chiave attuale come compromessa e ruotarla con ricifratura, prevedere un identificativo di versione della chiave.
- Responsabile suggerito: Software Agency (DevOps) con approvazione dell'utente.
- Verifica: nessun segreto in git e nella sua storia, chiavi diverse tra produzione e staging.

**R2 · P1 · Esportazione dell'elenco classe: perimetro errato e dati di salute**
- `src/export.js:8-10` seleziona gli studenti per `school_id`, non per classe (`enrollments` non è usata).
- Un insegnante, dopo il controllo di proprietà della classe, scarica nome, data di nascita, telefono e `note_salute` di tutti gli studenti della scuola. Le note di salute sono dati particolari (art. 9).
- `support` e `admin` non hanno alcun vincolo.
- Il CSV non ha escape: `Object.values(...).join(";")` rompe il formato e permette l'iniezione di formule.
- Art. 5(1)(c), art. 25 e art. 32.
- Raccomandazione: unire per `enrollments` e `class_id`, escludere `note_salute` dall'export generico (campo a parte, solo per l'insegnante della classe), usare l'escape CSV.
- Responsabile suggerito: Software Agency (Backend).
- Verifica: test con due classi e un insegnante.

**R3 · P1 · Backup non cifrati, copia in Singapore non registrata, ripristino mai provato**
- `config/backup.yml:5`: `encryption: none`, motivato con «il bucket è privato». Il dump contiene anche le note di salute e i dati dei minori.
- `config/backup.yml:10`: copia fuori sede su Coldvault, Singapore. Non compare in `docs/fornitori.md`, quindi non risultano accordo art. 28, garanzie per il trasferimento fuori SEE né valutazione. È un fornitore e un trasferimento non censiti.
- `config/backup.yml:12`: `keep_monthly: 120` (dieci anni). Contraddice la conservazione di 30 giorni delle registrazioni (`config/retention.json:2`) e la cancellazione dell'account, che nei backup resta per anni. Il commento «per sicurezza» non è una base di conservazione.
- `config/backup.yml:13`: `last_restore_test: null`. La disponibilità e il ripristino (art. 32(1)(c)-(d)) non sono dimostrati.
- Raccomandazione: cifrare i dump con una chiave gestita a parte, sospendere o regolarizzare la copia a Singapore, definire una conservazione dei backup coerente con le altre, eseguire e documentare un test di ripristino.
- Segnalo il fornitore non censito al reparto AIPCA per l'esame dei fornitori.
- Responsabile suggerito: DevOps e titolare.
- Verifica: test di ripristino registrato.

**R4 · P1 · Staging allineato con dati di produzione**
- `scripts/refresh-staging.sh:4-6` copia il database di produzione, dati particolari compresi, e sincronizza lo storage con documenti e registrazioni su staging «per le prove della segreteria e degli sviluppatori».
- Il dump in `/tmp/prod.dump` (riga 4) non è protetto e, con `set -e`, resta sul disco se il ripristino fallisce (la `rm` alla riga 7 non viene eseguita).
- Lo staging usa la stessa chiave (`config/staging.json` sovrascrive solo il bucket) e ha più accessi.
- Art. 25 e art. 32; i dati reali vanno evitati nei test.
- Raccomandazione: dati sintetici o anonimizzati, nessuna copia dello storage con i documenti, dump cifrato in una cartella temporanea con permessi stretti e rimozione in ogni caso (`trap`), chiavi separate.
- Verifica: assenza di dati reali a staging.

**R5 · P1 · Trascrizione con InsightAI senza accordo e con riuso per l'addestramento**
- `src/transcribe.js:8-12` invia l'audio, anche di minori, a un fornitore la cui riga in `docs/fornitori.md:11` indica accordo «in attesa», trasferimento fuori SEE sì e garanzie «—».
- Le note del file (riga 15) dicono che il fornitore può riusare i contenuti per i propri modelli.
- Dal punto tecnico: nessuna minimizzazione e nessuna scelta di quali registrazioni inviare. Il flusso è attivo.
- Art. 28, artt. 44 ss.; art. 9 se compaiono dati particolari.
- Raccomandazione: sospendere l'invio finché non c'è un accordo che escluda il riuso. Il reparto fornitori e DPIA va coinvolto per le basi giuridiche e il trasferimento.
- Responsabile suggerito: titolare e DPO.

**R6 · P2 · Log: corpo delle richieste in caso di errore**
- `config/default.json:5` ha `logRequestBodyOnError: true` e `src/logger.js:14` scrive `entry.body`.
- Il redattore (`config/default.json:4`) copre solo `body.password` e il cookie. Su un errore in `/signup` finiscono nei log telefono, data di nascita, `note_salute` ed email.
- Il redact `req.headers.cookie` non si applica a nessun campo che il logger registri.
- Art. 5(1)(c) e art. 32.
- Raccomandazione: disattivare il corpo o ammettere solo campi in lista; estendere il redact.

**R7 · P2 · Registrazioni: cancellate nel database, non nello storage**
- `src/purge.js:7` elimina le righe di `recordings` dopo 30 giorni ma non l'oggetto in `storage_key`.
- Il file audio con le voci dei minori resta nel bucket e nei backup oltre il termine dichiarato nel README.
- Art. 5(1)(e).
- Raccomandazione: eliminare l'oggetto dallo storage insieme alla riga e verificarlo con un controllo periodico.

**R8 · P2 · Audit trail debole e troppo breve**
- Sono registrati solo tre eventi (`src/documents.js:18`, `src/export.js:12`, `src/account.js:14`). Mancano login e tentativi falliti, accessi alle note di salute, azioni di `admin` e di `support` sui dati.
- La tabella è nello stesso database dell'app, senza protezione da modifica (`db/schema.sql:83`).
- La conservazione è di 90 giorni (`config/retention.json:3`, `src/purge.js:9`), insufficiente per ricostruire una violazione.
- Art. 32 e art. 33.
- Raccomandazione: ampliare gli eventi, definire e giustificare una durata, isolare la tabella (solo inserimento).

**R9 · P2 · Autenticazione dei ruoli privilegiati**
- Nessun limite ai tentativi su `/login` (`src/auth.js:6-8`) e nessuna MFA per `support` e `admin`, che accedono a documenti di identità e dati di salute.
- Nessun controllo sulla complessità della password in `signup`.
- Raccomandazione: rate limit, MFA per `support` e `admin`, policy password.

**R10 · P2 · Cancellazione dell'account solo logica**
- `src/account.js:13` imposta `deleted_at`; non esiste un job che elimini poi i dati di `students` (note di salute comprese), `messages` e `recordings` dell'utente.
- Solo le fatture hanno un obbligo di conservazione dichiarato.
- Art. 17.
- Raccomandazione: definire e implementare l'eliminazione o l'anonimizzazione dei dati non fiscali.

**R11 · P2 · Disiscrizione dalla newsletter inefficace**
- `src/newsletter.js:7` azzera `users.newsletter`, ma la sincronizzazione (`src/newsletter.js:13`) usa `marketing_consent`, che resta vero.
- La persona disiscritta resta nella lista di Mailorbit, perché `upsertList` non rimuove nessuno.
- La disiscrizione, inoltre, non richiede alcuna verifica: basta conoscere l'email.
- Art. 7(3) e art. 21(2).
- Raccomandazione: allineare i campi, rimuovere dalla lista, usare un token firmato nel link.

**R12 · P2 · Esportazione dell'interessato incompleta**
- `src/account.js:5-6` esclude prenotazioni, messaggi, trascrizioni, fatture e `note_salute`.
- Passo al reparto dei diritti degli interessati per l'esame.
- Art. 15 e art. 20.

**R13 · P3 · Altri punti**
- `src/analytics.js` e `src/auth.js:11`: l'email in chiaro come `userId` negli eventi, verso un endpoint interno non descritto in `docs/fornitori.md`. Verificare la pseudonimizzazione.
- `src/notifications.js`: TextBlast (SMS, numeri anche di minori) non è nel registro dei fornitori.
- `src/server.js:14`: nessuno store di sessione dichiarato (default in memoria). Con più istanze o riavvii si perdono le sessioni; verificare in produzione.
- Nessun controllo di isolamento per scuola in `src/documents.js:10` e `src/export.js`: da valutare se più scuole condivideranno il database.

**Punti da passare ad altri specialisti (non valutati qui)**
- `docs/fornitori.md:10`: Mailorbit indica «Privacy Shield», non più valido; va sostituito dalle garanzie attuali (scheda decisioni-adeguatezza, da consultare).
- `docs/fornitori.md:9`: certificato ISO di LessonCam scaduto il 2025-12-31 alla data di oggi (2026-11-24); verificare il rinnovo.
- `docs/procedura-diritti.md`: identificazione debole (risposta all'indirizzo mittente), tempo di 60 giorni, costo di 10 euro per l'accesso, casella personale come registro. Da valutare con il reparto diritti e il legale.

**Lacune dichiarate**
- Il codice di upload dei documenti, `db`, `storage` e `vendors/mailorbit` non sono nel progetto, quindi non sono esaminati.
- Non è stato fatto alcun test attivo né eseguito codice.
- Nessuna valutazione di conformità del progetto nel suo insieme: gli esiti valgono solo per i singoli controlli e le evidenze citate.

**Consegna** a AIPCA-01 · ARCTURUS con la proposta di riesame su Opus dei rilievi R1-R5 (P1).

Firmato: AIPCA-05 · MIZAR
