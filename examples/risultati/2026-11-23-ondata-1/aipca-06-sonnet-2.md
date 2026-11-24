AIPCA-06 · MERAK — Senior Data Governance & Retention Specialist, reparto AIPCA (AI Privacy & Compliance)

Nota di metodo: lavoro come specialista, in sola lettura, sul progetto «Parla Subito» (dati di prova). Il direttore AIPCA-01 e la biblioteca non erano disponibili in questa prova. Nessun rilievo è un parere legale. Sono su un modello più piccolo: i rilievi P0 e P1 qui sotto vanno riesaminati dal direttore del reparto o da un revisore su Opus prima di diventare definitivi. Le nozioni di diritto europeo e italiano arrivano dalle mie conoscenze, non da fonti verificate in questa sessione. Non ho consultato né il web né le schede della biblioteca. Le segnalo come "da verificare sulla fonte ufficiale".

## 1. Inventario dei dati personali

| Dato | Dove | Interessati | Categoria | Riferimento |
|---|---|---|---|---|
| email, hash password argon2id, ruolo, consenso newsletter e marketing con data | tabella `users` | tutti | comuni | db/schema.sql:3-13 |
| nome, cognome, data e luogo di nascita, codice fiscale, telefono, livello | tabella `students` | studenti, anche minorenni da 8 anni | comuni | db/schema.sql:15-28 |
| note di salute (allergie, disturbi dell'apprendimento) | `students.note_salute`, testo libero | studenti, anche minorenni | particolari (art. 9) | db/schema.sql:26, public/index.html:19 |
| nome, cognome, codice fiscale, indirizzo, scansione del documento d'identità (storage, cifrata) | `payers` | genitori e tutori | comuni, documento | db/schema.sql:30-38 |
| fatture (numero, importo, data) | `invoices` | pagatori | comuni, fiscali | db/schema.sql:60-66 |
| registrazioni audio/video delle lezioni e trascrizioni | storage e `recordings` | studenti (anche minorenni) e insegnanti: voce, immagine | biometria non trattata, ma voce di minori | db/schema.sql:68-74 |
| messaggi alla segreteria | `messages` | utenti | comuni, testo libero | db/schema.sql:76-81 |
| audit log (chi, azione, bersaglio) | `audit_log` | personale e utenti | comuni | db/schema.sql:83-89 |
| presenze e prenotazioni | `bookings` | studenti | comuni | db/schema.sql:53-58 |
| log applicativi con corpo delle richieste in caso di errore | log di pino | tutti | possibili categorie particolari | config/default.json:5, src/logger.js:14 |
| eventi di utilizzo con email come identificativo | endpoint di statistiche interno | utenti | comuni | src/analytics.js:5, src/auth.js:11,27 |
| telefono e testo SMS | fornitore SMS TextBlast | studenti | comuni | src/notifications.js:4-9 |
| copia completa di produzione | staging, backup, copia a Singapore | tutti | tutte | vedi sotto |

Mancano nel progetto: il registro dei trattamenti (art. 30), l'informativa `/privacy.html` (è solo linkata in public/index.html:24), uno schema `db.js` o `storage.js`. Non posso verificarne i contenuti.

## 2. Mappa dei flussi e delle copie

- Browser verso app Node (Nimbus, Francoforte), poi Postgres e storage Nimbus: config/default.json:10-13, README.md:21.
- App verso InsightAI (USA): l'audio delle lezioni va a un fornitore senza accordo art. 28 e senza garanzie di trasferimento: src/transcribe.js:8-12, docs/fornitori.md:11.
- App verso Mailorbit (USA): sincronizzazione notturna di email e nome: src/newsletter.js:12-14.
- App verso TextBlast: il telefono viene inviato a un fornitore non presente nel registro: src/notifications.js:2-9.
- App verso endpoint di statistiche: `userId` è l'email in chiaro: src/analytics.js:5, src/auth.js:11,27. L'endpoint è dichiarato interno su Nimbus, ma `stats.parlasubito.example` non figura nel registro.
- Widget di chat `chatnow.example` caricato nella pagina di iscrizione: public/index.html:26. Fornitore non nel registro, trasferimenti ignoti.
- Backup notturno: Nimbus Francoforte e Coldvault Singapore, config/backup.yml:7-10. Coldvault non è nel registro.
- Staging: copia integrale di produzione con `pg_restore` e `rclone sync`, scripts/refresh-staging.sh:4-6. Nel file temporaneo `/tmp/prod.dump` il dump resta su disco se lo script si interrompe prima di `rm` (riga 7, `set -e`).

## 3. Matrice della conservazione

| Dato | Periodo dichiarato | Meccanismo | Riga | Esito |
|---|---|---|---|---|
| Registrazioni | 30 giorni | `DELETE` della riga, notturno | src/purge.js:7 | La riga sparisce, il file nello storage no (vedi R-01). Le copie di backup durano fino a 10 anni |
| Trascrizioni | nessuno | stessa riga di `recordings` | schema.sql:72 | Seguono la riga, ma restano a InsightAI e nei backup |
| Audit log | 90 giorni | `DELETE` | src/purge.js:9, config/retention.json:3 | Il commento in purge.js:8 lo chiama "log applicativi", ma è la tabella di audit. I log pino non hanno retention |
| Messaggi | 365 giorni | `DELETE` | src/purge.js:11, config/retention.json:4 | Coerente col codice. Nessuna motivazione scritta |
| Fatture | 10 anni | nessun job | config/retention.json:5 | Motivazione nel codice civile (art. 2220 c.c.), da verificare |
| Utenti, studenti, pagatori, presenze, iscrizioni | nessuno | account: solo `deleted_at` | src/account.js:13 | Nessuna cancellazione fisica |
| Documento d'identità del genitore | nessuno | nessuno | schema.sql:37 | Non si cancella mai |
| Backup giornalieri | 30 giorni | `keep_daily` | config/backup.yml:12 | Ok come durata, non motivata |
| Backup mensili | 120 mesi | `keep_monthly` | config/backup.yml:13 | "Per sicurezza": nessuna base |
| Log pino | nessuno | nessuno | config/default.json:2-6 | Non definito |
| Eventi di statistiche | nessuno | nessuno | src/analytics.js | Non definito |
| Staging | nessuno | copia integrale a ogni refresh | scripts/refresh-staging.sh | Non definito |
| Copie presso InsightAI, Mailorbit, TextBlast, Coldvault | nessuno | non dichiarati | docs/fornitori.md | Non definiti |

Non propongo periodi di conservazione: vanno decisi dal titolare con motivazione normativa o contrattuale.

## 4. Rilievi

**R-01 · Registrazioni cancellate solo nel database, non nello storage** — stato `non_conforme`, gravità alta, priorità P1
- Evidenze: src/purge.js:7 fa `DELETE FROM recordings`. Non c'è nessuna cancellazione dell'oggetto in `storage_key` (schema.sql:71). Il README dichiara 30 giorni (README.md:23).
- Lacune: non vedo `storage.js` né le regole del bucket, quindi non so se esista un ciclo di vita lato storage. Se non c'è, il file audio, che contiene voce e immagine di minori, resta indefinitamente e senza più un riferimento nel database.
- Rischio: conservazione oltre il dichiarato (art. 5.1.e), file orfani non più raggiungibili nemmeno per le richieste degli interessati.
- Raccomandazione: prima cancellare l'oggetto, poi la riga, con esito registrato. Verificare il bucket per i file già orfani.
- Responsabile suggerito: Software Agency, con approvazione del titolare. Verifica: dopo il job, nessun oggetto senza riga.

**R-02 · Backup e copie oltre ogni periodo dichiarato, cancellazione e retention vanificate** — `non_conforme`, alta, P1
- Evidenze: config/backup.yml:12-13 (30 giorni giornalieri, 120 mesi mensili), :10 copia a Singapore, :5 `encryption: none`. `rclone sync` replica anche le cancellazioni, ma i dump mensili restano 10 anni con tutti i dati, comprese registrazioni e note di salute scadute o cancellate.
- Lacune: `last_restore_test: null` (riga 14): il ripristino non è mai stato provato. Non esiste una procedura per riapplicare le cancellazioni dopo un ripristino. Coldvault non ha accordo né scheda nel registro.
- Rischio: art. 5.1.c-e, art. 17 (copie), art. 32 (cifratura assente), artt. 44-46 (Singapore, nessuna garanzia dichiarata, da verificare sulle decisioni di adeguatezza della Commissione).
- Raccomandazione: motivare o eliminare il tempo di 120 mesi (le fatture hanno già una loro conservazione fiscale); cifrare i backup; documentare Coldvault; decidere se Singapore serve; provare il ripristino e scrivere come si ripetono le cancellazioni.
- Responsabile suggerito: titolare e DevOps (Software Agency). Priorità P1.

**R-03 · Staging con dati di produzione reali** — `non_conforme`, alta, P1
- Evidenze: scripts/refresh-staging.sh:2 ("dati veri") e :4-6; README.md:22 (accesso anche agli sviluppatori); config/staging.json non riduce nulla.
- Rischio: art. 5.1.c, art. 25, art. 32. Note di salute di minori, codici fiscali e documenti d'identità accessibili a più persone e con controlli presumibilmente più deboli. Il dump finisce anche in `/tmp/prod.dump` (riga 4) e non è rimosso se `pg_restore` fallisce (riga 7).
- Raccomandazione: dati sintetici o pseudonimizzati/mascherati, escludendo `note_salute`, `codice_fiscale`, `documento_key`, `recordings`. Lo staging non deve sincronizzare lo storage di produzione.
- Responsabile: Software Agency. P1.

**R-04 · Cancellazione dell'account solo logica, nessuna cancellazione fisica né propagazione** — `non_conforme`, alta, P1
- Evidenze: src/account.js:13 imposta `deleted_at`; il messaggio in riga 15 dice che restano solo le fatture. In realtà restano tutte le tabelle: `students` (con `note_salute`, codice fiscale), `payers` e il documento d'identità, `bookings`, `messages`, `recordings`. Nessun job rimuove le righe con `deleted_at` valorizzato (src/purge.js).
- Inoltre: la cancellazione non raggiunge Mailorbit, InsightAI, TextBlast, backup, statistiche. L'audit conserva `actor_id` e `target` (src/account.js:14), accettabile per 90 giorni, ma non è motivato.
- Rischio: art. 17, art. 5.1.e. L'informazione data all'interessato (src/account.js:15, docs/procedura-diritti.md:10) è inesatta.
- Raccomandazione: distinguere i dati da conservare (solo quelli necessari alla fattura: dati del pagatore e fatture) dagli altri, da cancellare o anonimizzare dopo un termine breve e motivato; scrivere cosa fare per le copie e per i fornitori.
- Responsabile: titolare, per i termini; Software Agency, per l'attuazione. P1.

**R-05 · Note di salute, codice fiscale e telefono raccolti senza necessità dimostrata** — `parzialmente_conforme`, alta, P2
- Evidenze: public/index.html:19 raccoglie le note di salute di studenti anche minori in testo libero, "facoltative"; schema.sql:26 le salva in chiaro; src/export.js:9 le include nell'elenco CSV inviato all'insegnante e al personale; non c'è una scadenza. `codice_fiscale` e `luogo_nascita` degli studenti (schema.sql:22-23) non sono usati da nessun file del progetto che io veda. `telefono` serve solo per l'SMS di benvenuto (src/auth.js:28).
- Lacune: finalità e base giuridica dell'art. 9 non documentate (da verificare con il DPO o il consulente legale); nessun consenso esplicito visibile nel modulo.
- Raccomandazione: valutare se servono (art. 5.1.c, art. 25), rimuovere i campi inutili, prevedere una scadenza per le note, escludere `note_salute` dall'export per i ruoli che non ne hanno bisogno.
- Responsabile: titolare e DPO. P2.

**R-06 · Export CSV senza limite alla classe e di più dei dati necessari** — `non_conforme`, media, P2 (aspetto di sicurezza: rinvio a AIPCA-07)
- Evidenze: src/export.js:8-11 seleziona tutti gli studenti con lo stesso `school_id`, non quelli iscritti a `classes.id` (`enrollments` non è usata). Un insegnante della propria classe riceve l'elenco di tutta la scuola, inclusi i minorenni e le note di salute.
- Rischio: art. 5.1.c, art. 25, art. 32.
- Raccomandazione: filtrare per `enrollments`; togliere `note_salute` e `data_nascita` se non servono.
- Responsabile: Software Agency. P2.

**R-07 · Log applicativi con corpo delle richieste, senza durata** — `non_conforme`, media, P2
- Evidenze: config/default.json:5 `logRequestBodyOnError: true`; src/logger.js:14 scrive `req.body`. Redazione solo per `body.password` e cookie (default.json:4), quindi `note_salute`, `telefono`, `email`, `data_nascita` dal modulo di iscrizione finiscono nei log in caso di errore. Nessuna scadenza dei log pino. src/purge.js:8-9 parla di "log applicativi" ma cancella `audit_log`.
- Raccomandazione: disattivare il corpo o ampliare `redact`; fissare una durata dei log e l'accesso.
- Responsabile: Software Agency e titolare. P2.

**R-08 · Statistiche d'uso con email in chiaro** — `non_conforme`, media, P2
- Evidenze: src/auth.js:11 e :27 passano l'email come `userId` a src/analytics.js:5; nessuna durata. Il registro dei fornitori non cita l'endpoint (docs/fornitori.md).
- Raccomandazione: usare un identificativo pseudonimo oppure nessun identificativo, definire la conservazione. Va verificato se l'endpoint è davvero gestito da Parla Subito.
- Responsabile: Software Agency. P2.

**R-09 · Newsletter: sincronizzazione e cancellazioni non allineate** — `parzialmente_conforme`, media, P2
- Evidenze: src/newsletter.js:13 invia solo chi ha `marketing_consent` e non è cancellato, ma `unsubscribe` (riga 7) imposta solo `newsletter = false`. Il consenso `marketing_consent` resta true, quindi la sincronizzazione notturna continua a inviare quell'email a Mailorbit. La lista di Mailorbit non viene mai ripulita. Inoltre il link usa l'email nell'URL (riga 6) senza token. `signup` imposta i due campi con lo stesso valore (src/auth.js:20).
- Rischio: art. 7.3 e 21 (opposizione), art. 17. Questo rilievo è principalmente di competenza di AIPCA-04 (diritti degli interessati): lo passo a lui.
- Raccomandazione: far dipendere la sincronizzazione da `newsletter` e rimuovere dalla lista chi si disiscrive o cancella l'account. P2.

**R-10 · Documento d'identità dei genitori: scopo dubbio, nessuna scadenza** — `non_verificabile`, media, P2
- Evidenze: schema.sql:37 e README.md:8 ("per l'iscrizione dei minori"). Nessun job lo elimina; la chiave di cifratura è nel file di configurazione (config/default.json:8): la cifratura non protegge da chi legge il repository (rinvio ad AIPCA-07 e alla cybersecurity). Il download è consentito a `support` e `admin` per qualunque `payers.id` e registra solo `document_view` nell'audit di 90 giorni (src/documents.js:18).
- Raccomandazione: chiarire se la copia del documento è necessaria; se sì, motivarla e cancellarla dopo la verifica dell'identità o un breve termine approvato dal titolare. P2.

**R-11 · Procedura per i diritti con tempi e costi non coerenti con il GDPR** — `non_conforme`, media, P2 (passo ad AIPCA-04)
- Evidenze: docs/procedura-diritti.md:4 (60 giorni invece di un mese, prorogabile: art. 12.3), :5 (10 euro per l'accesso, in contrasto con art. 12.5 e 15.3, salvo richieste manifestamente infondate o eccessive), :2 (risposta all'indirizzo di provenienza senza verifica d'identità), :9 e :5 (email nella casella personale di una persona, senza registro e senza durata).
- Per la mia area: la procedura non dice cosa succede ai backup, ai fornitori e alle copie quando si cancella. Passo il resto ad AIPCA-04 e al legale.

**R-12 · `/me/export` incompleto rispetto ai dati trattati** — `parzialmente_conforme`, media, P2
- Evidenze: src/account.js:5-6 esporta solo `users` e `students`; mancano `payers`, `invoices`, `bookings`, `messages`, `recordings`/trascrizioni, consensi. Per il ruolo `support` e `admin` la rotta è vietata (src/server.js:28-29).
- Questo è soprattutto di competenza di AIPCA-04. Per la mia parte: l'inventario non è coperto da un'unica fonte.

**R-13 · Fornitori e trasferimenti non registrati o con garanzie scadute (flussi dati)** — `non_conforme`, alta, P1 (flusso verso InsightAI), P2 per gli altri; rinvio ad AIPCA-05 e al legale
- Evidenze: InsightAI riceve la voce di minori senza accordo art. 28 e può "migliorare i propri modelli" con i contenuti (docs/fornitori.md:11,15; src/transcribe.js:8-12), cioè riuso per finalità proprie e nessuna cancellazione definita. Mailorbit: la garanzia è "Privacy Shield" (docs/fornitori.md:10), invalidato nel 2020 (da verificare sulle decisioni di adeguatezza vigenti). LessonCam: ISO 27001 scaduta il 2025-12-31 secondo il registro, data già passata alla data di oggi (2026-11-24). Non nel registro: TextBlast, Coldvault, ChatNow, endpoint di statistiche.
- Raccomandazione: dal mio ruolo, fermare l'invio di audio a InsightAI finché non c'è un accordo che escluda il riuso, e fissare cancellazione e durata presso ciascun fornitore. P1 per InsightAI: va segnalato subito al titolare. Il resto passa ad AIPCA-05.

**R-14 · Messaggi e audit log: periodi non motivati** — `non_verificabile`, bassa, P3
- Evidenze: config/retention.json:3-4 e src/purge.js:8-11. 90 giorni per l'audit può essere troppo breve per accertare un abuso, 365 giorni per i messaggi è un valore senza motivazione scritta. Nessuna delle due durate è documentata.
- Raccomandazione: far motivare e approvare i periodi dal titolare. P3.

**R-15 · Mancano registro dei trattamenti, informativa e minimizzazione nel modulo** — `non_verificabile`, media, P2
- Evidenze: nessun file di registro (art. 30) nel progetto; `/privacy.html` non è presente; il modulo (public/index.html:13-22) non distingue minori e maggiorenni né raccoglie dati del genitore; widget ChatNow caricato senza avviso (riga 26).
- Raccomandazione: predisporre registro dei trattamenti con le durate di questa matrice; l'informativa spetta ad AIPCA-03. P2.

## 5. Sintesi e priorità

- Da segnalare subito al titolare: R-13 (audio di minori a InsightAI senza accordo e con riuso per i modelli), R-03 (dati reali e note di salute di minori in staging), R-01 (registrazioni non cancellate dallo storage) e R-04, R-02 (copie e backup fino a 10 anni, senza cifratura).
- Nessun controllo è risultato `conforme_verificato`: ho verificato solo alcune evidenze di protezione (hash argon2id, schema.sql:6; cookie di sessione, src/server.js:18), che non rientrano nel mio ambito di retention.
- Non verificabili per mancanza di file: `db.js`, `storage.js`, `vendors/mailorbit`, regole del bucket, contenuto di `/privacy.html`, accessi dello staging.
- Decisioni che spettano al titolare: periodi di conservazione di ogni voce della matrice, necessità di note di salute e documento d'identità, Singapore, InsightAI.

— MERAK, AIPCA-06
