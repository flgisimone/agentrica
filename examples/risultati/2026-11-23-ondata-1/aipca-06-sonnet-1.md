AIPCA-06 · MERAK — Senior Data Governance & Retention Specialist, reparto AIPCA (AI Privacy & Compliance)

**Perimetro e limiti.** Ho letto tutti i file della copia in sola lettura: README, config, db/schema.sql, src/*, scripts, docs e public/index.html. Non ho eseguito nulla, né aperto altre fonti. Non ho consultato la biblioteca del reparto (non disponibile in questa prova); le nozioni normative citate vanno ricontrollate (vedi la fine). `src/db.js`, `src/storage.js` e `src/vendors/mailorbit.js` sono richiamati ma non presenti nella copia. Ciò che dipende da loro, dalla configurazione reale di Nimbus, dai log e dai backup in esercizio è `non_verificabile`.

## Segnalazione immediata

**M-01 (P0): audio e trascrizioni di studenti, anche minorenni, inviati a InsightAI senza accordo.**
- Il registro fornitori dice «accordo in attesa», trasferimento negli USA senza garanzie, e termini che consentono di «usare i contenuti per migliorare i propri modelli» (docs/fornitori.md:11, :15).
- Il codice invia l'audio al fornitore a ogni lezione (src/transcribe.js:8-12).
- Dal lato ciclo di vita, la conservazione presso il fornitore è sconosciuta. L'audio inviato esce quindi dal limite di 30 giorni dichiarato. Va segnalato ora ai responsabili e il flusso va sospeso finché non c'è l'accordo (art. 28).

## 1. Inventario dei dati personali

| Dato | Interessati | Dove (file e riga) | Note |
|---|---|---|---|
| Email, password (argon2id), ruolo, consenso newsletter | tutti | `users` (db/schema.sql:3-13) | `deleted_at` è solo logico |
| Nome, cognome, data e luogo di nascita, codice fiscale, telefono, livello | studenti, anche minori | `students` (schema.sql:15-28) | |
| Note di salute (art. 9) | studenti, anche minori | `students.note_salute` (schema.sql:26); raccolte in public/index.html:19 e src/auth.js:24 | facoltative, per gli insegnanti |
| Nome, cognome, codice fiscale, indirizzo, scansione del documento d'identità | genitori o pagatori | `payers` (schema.sql:30-38) | documento cifrato nello storage; la chiave sta in config/default.json:8 |
| Fatture (numero, importo, data) | pagatori | `invoices` (schema.sql:60-66) | |
| Classi, iscrizioni, prenotazioni e presenze | studenti, insegnanti | `classes`, `enrollments`, `bookings` (schema.sql:40-58) | |
| Registrazioni audio/video, trascrizioni | studenti, minori, insegnanti | `recordings` (schema.sql:68-74) e file nello storage | voce e immagine |
| Messaggi alla segreteria | utenti | `messages` (schema.sql:76-81) | testo libero |
| Audit log (chi, azione, bersaglio) | personale e utenti | `audit_log` (schema.sql:83-89) | |
| Log applicativi | utenti | src/logger.js; config/default.json:2-6 | contengono il body delle richieste in errore |
| Statistiche d'uso (email come identificativo, eventi) | utenti | src/analytics.js:4-5; src/auth.js:11,27 | endpoint interno su Nimbus |
| Telefono e testo SMS | studenti | src/notifications.js:4-9 | fornitore TextBlast |
| Email e nome verso la lista newsletter | iscritti | src/newsletter.js:13-14 | Mailorbit |
| Dump DB, copia dello storage, copia fuori sede | tutti | config/backup.yml | |
| Copia completa della produzione | tutti | scripts/refresh-staging.sh:4-6 | staging |
| Dati dal widget chat | visitatori | public/index.html:26 | non documentato |

## 2. Mappa dei flussi e delle copie

- **Raccolta.** Il modulo `/signup` alimenta `users`, `students`, le statistiche (src/auth.js:27), l'SMS di benvenuto (:28) e la newsletter (nightlySync).
- **App → Nimbus Frankfurt.** Contiene DB e storage di produzione.
- **Registrazioni.** Vanno dalla videolezione (LessonCam, UE/USA) allo storage, poi a InsightAI (USA), e la trascrizione torna nel DB.
- **Backup.** Il dump notturno e lo `rclone sync` vanno al bucket `parlasubito-backup` (Francoforte) e a Coldvault (Singapore). Coldvault non è nel registro fornitori.
- **Staging.** `refresh-staging.sh` copia DB e storage di produzione su staging, passando da `/tmp/prod.dump` sul disco.
- **Verso fornitori non censiti.** TextBlast (telefono), ChatNow (widget, dati non noti), Coldvault.
- **Verso fornitori censiti.** PagaFacile, Mailorbit (USA), LessonCam (supporto dagli USA).

## 3. Matrice della conservazione

| Dato | Regola dichiarata | Meccanismo reale | Stato |
|---|---|---|---|
| Registrazioni (DB e file) | 30 giorni (README:23; retention.json:2) | Il job cancella solo la riga (src/purge.js:7); il file nello storage resta | `non_conforme` |
| Trascrizioni | nessuna | seguono la riga, ma restano nei backup e presso InsightAI | `parzialmente_conforme` |
| Audit log | 90 giorni (retention.json:3) | cancellato dal job (purge.js:9); motivazione assente | `parzialmente_conforme` |
| Messaggi | 365 giorni (retention.json:4) | cancellato dal job (purge.js:11) | `parzialmente_conforme` |
| Fatture e dati del pagatore necessari | 10 anni (retention.json:5; art. 2220 c.c.) | nessun meccanismo né separazione dai dati non fiscali | `parzialmente_conforme` |
| Account cancellato | «subito» (procedura-diritti:10) | solo `deleted_at` (src/account.js:13); i dati restano | `non_conforme` |
| Note di salute, studenti, prenotazioni, scansione documento | nessuna | nessuna | `non_conforme` |
| Log applicativi | nessuna (il commento «Log applicativi» in purge.js:8 riguarda in realtà `audit_log`) | | `non_verificabile` |
| Statistiche d'uso | nessuna | | `non_verificabile` |
| Backup giornalieri | 30 giorni (backup.yml:12) | | `parzialmente_conforme` |
| Backup mensili | 120 mesi, «per sicurezza» (backup.yml:13) | | `non_conforme` |
| Backup dello storage | nessuna regola | `rclone sync` è uno specchio senza storico | `non_verificabile` |
| Copia fuori sede e staging | nessuna | nessuna | `non_conforme` |
| Presso fornitori (InsightAI, LessonCam, Mailorbit, TextBlast) | nessuna | nessuna | `non_verificabile` |

I periodi di 90 giorni (audit), 365 giorni (messaggi) e 120 mesi (backup) non hanno una motivazione scritta né un'approvazione del titolare. I periodi di conservazione non li fisso io: vanno decisi dal titolare.

## 4. Rilievi

**M-02 · Registrazioni: il file audio resta dopo i 30 giorni**
- stato: `non_conforme`; gravità: alta; priorità: **P1**
- rischio: voce e immagine di minori conservate oltre la finalità dichiarata (art. 5.1.e). La cancellazione della riga fa perdere la `storage_key` e lascia file orfani senza più riferimento.
- riferimenti: GDPR artt. 5.1.c-e, 25; src/purge.js:7; schema.sql:68-74
- evidenze: la `DELETE` agisce solo su `recordings`; nessuna cancellazione di oggetti dallo storage nel codice.
- lacune: non ho potuto verificare l'esistenza di lifecycle rules sul bucket Nimbus.
- raccomandazione: cancellare prima l'oggetto dallo storage e poi la riga. Eliminare gli orfani già presenti, con approvazione.
- responsabile_suggerito: Software Agency; approvazione del titolare.
- verifica: test con dati sintetici; elenco degli oggetti senza riga.

**M-03 · Cancellazione dell'account solo logica**
- stato: `non_conforme`; gravità: alta; priorità: **P1**
- rischio: dopo `/me/delete` restano indefinitamente anagrafica, note di salute, codice fiscale, scansione del documento, prenotazioni, messaggi e registrazioni. Il messaggio promette solo che le fatture restano.
- riferimenti: artt. 5.1.e, 17; src/account.js:11-16; docs/procedura-diritti.md:10; schema.sql:12
- evidenze: l'unico `UPDATE` imposta `deleted_at`; nessun job fisico o anonimizzante.
- lacune: i dati dei figli di un genitore e le regole per l'erede non sono definiti.
- raccomandazione: definire cancellazione fisica o anonimizzazione per tabella. Tenere solo il necessario alla fattura. Eliminare documento d'identità e note di salute subito. Prevedere un tempo massimo dopo `deleted_at`.
- responsabile_suggerito: titolare/DPO per le regole; Software Agency per l'attuazione.
- verifica: dopo la cancellazione di un utente di prova, nessun dato fuori dalle fatture.

**M-04 · Staging con copia completa di produzione**
- stato: `non_conforme`; gravità: alta; priorità: **P1**
- rischio: dati reali, anche di minori, note di salute e documenti, in un ambiente meno protetto, con accesso di sviluppatori e segreteria. Il dump resta in `/tmp/prod.dump` e non viene rimosso se uno dei comandi precedenti fallisce (`set -e` esce prima di `rm`).
- riferimenti: artt. 5.1.c, 25, 32; scripts/refresh-staging.sh:4-7; config/staging.json
- evidenze: `pg_restore` completo e `rclone sync` del bucket di produzione.
- lacune: accessi a staging e se il job di purge vi gira non sono noti.
- raccomandazione: usare dati sintetici o anonimizzati. In alternativa, mascherare i campi a rischio dopo il restore. Eliminare il dump in `trap`. Pulire lo staging attuale.
- responsabile_suggerito: Software Agency (DevOps); approvazione del titolare.
- verifica: sul database di staging non risultano più email, note di salute o documenti reali.

**M-05 · Backup: retention eccessiva, non cifrati, copia fuori SEE non censita, mai provati**
- stato: `non_conforme`; gravità: alta; priorità: **P1**
- rischio: il dump mensile (`keep_monthly: 120`) conserva per dieci anni l'intero database, comprese le persone cancellate. `encryption: none`, con il solo argomento «il bucket è privato». Una copia è a Coldvault, Singapore, fornitore assente dal registro e senza base di trasferimento. `last_restore_test: null` indica che non c'è mai stato un ripristino di prova.
- riferimenti: artt. 5.1.e-f, 17, 28, 32, 44-46; config/backup.yml:5,10-14; docs/fornitori.md
- evidenze: file di configurazione.
- lacune: non c'è una regola su come una cancellazione si riflette nei backup (scadenza, o ripristino con ri-cancellazione); storage senza storico non verificabile; decisione di adeguatezza per Singapore da verificare (scheda non consultata).
- raccomandazione: ridurre le copie mensili a quanto il titolare motiva. Cifrare i dump. Censire Coldvault o spostare la copia nello SEE. Documentare la scadenza dei backup come limite della cancellazione. Eseguire e registrare un ripristino di prova.
- responsabile_suggerito: titolare; DevOps; sec-cloud.
- verifica: il registro riporta le nuove regole di conservazione e la data del ripristino di prova.

**M-06 · Disiscrizione dalla newsletter inefficace per la sincronizzazione**
- stato: `non_conforme`; gravità: alta; priorità: **P1**
- rischio: `unsubscribe` azzera solo `newsletter` (src/newsletter.js:7), mentre `nightlySync` seleziona su `marketing_consent` (:13). Chi si disiscrive resta quindi nella lista e viene reinserito ogni notte. Inoltre la sincronizzazione fa solo `upsertList` e non toglie mai chi ha ritirato il consenso o ha cancellato l'account.
- riferimenti: artt. 7.3, 17, 21.2-3; src/newsletter.js:7,13-14; schema.sql:8-10
- evidenze: lettura diretta del codice. `upsertList` non è presente nella copia, quindi il comportamento di rimozione è dedotto.
- raccomandazione: la disiscrizione deve azzerare anche `marketing_consent` e propagare la rimozione dalla lista. La sincronizzazione deve riallinearla. Verificare la propagazione con un account di prova.
- responsabile_suggerito: Software Agency.
- verifica: dopo la disiscrizione, l'utente di prova non compare nella lista del fornitore.

**M-07 · Elenco classe: espone studenti e note di salute oltre la classe**
- stato: `non_conforme`; gravità: alta; priorità: **P1**
- rischio: la query seleziona `WHERE s.school_id = $1` e non gli iscritti alla classe. Ogni insegnante che passa il controllo sulla propria classe scarica l'anagrafica e le `note_salute` (art. 9) di tutta la scuola. Mancano gli `enrollments` e una finalità per la nota di salute.
- riferimenti: artt. 5.1.c, 9, 25, 32; src/export.js:8-11; schema.sql:47-51
- evidenze: lettura diretta del codice.
- raccomandazione: limitare agli iscritti alla classe; valutare se la nota di salute serva davvero in un CSV; passare la questione a privacy-security e sec-appsec.
- responsabile_suggerito: Software Agency.
- verifica: un insegnante di prova vede solo i propri studenti.

**M-08 · Log applicativi: body delle richieste in errore, senza conservazione definita**
- stato: `non_conforme`; gravità: media; priorità: **P2**
- rischio: con `logRequestBodyOnError: true` un errore su `/signup` scrive nel log email, telefono, data di nascita e note di salute. La redazione copre solo `body.password` e il cookie.
- riferimenti: artt. 5.1.c-e, 32; config/default.json:2-6; src/logger.js:14
- lacune: destinazione e durata dei log non verificabili; il commento «Log applicativi: 90 giorni» in purge.js:8 si riferisce all'`audit_log`, non ai log pino.
- raccomandazione: disattivare il body (o redigere i campi personali), definire destinazione e scadenza dei log.
- responsabile_suggerito: Software Agency; DevOps.
- verifica: un errore provocato in prova non lascia dati personali nel log.

**M-09 · Statistiche d'uso con email come identificativo**
- stato: `parzialmente_conforme`; gravità: media; priorità: **P2**
- rischio: l'email in chiaro è l'`userId` degli eventi (src/auth.js:11,27), senza regola di conservazione, e non risulta necessaria per statistiche aggregate.
- riferimenti: artt. 5.1.c, 25; src/analytics.js:4-5
- lacune: scadenza e accessi dell'endpoint `stats.parlasubito.example` non verificabili; non dichiara se i dati restino su Nimbus.
- raccomandazione: usare un identificativo pseudonimo o nessuno, e definire una durata dei dati.
- responsabile_suggerito: Software Agency; titolare.
- verifica: gli eventi non contengono indirizzi email.

**M-10 · Account e documento del genitore: nessuna regola di conservazione e campi eccedenti**
- stato: `non_conforme`; gravità: media; priorità: **P2**
- rischio: la scansione del documento d'identità serve all'iscrizione del minore, ma non c'è una scadenza, e per la fattura bastano codice fiscale e indirizzo. Nel modello esistono inoltre `students.codice_fiscale` e `luogo_nascita`, mai scritti dal codice presente (non uso verificabile). Il modulo di iscrizione raccoglie `note_salute` per tutti, minori compresi, e il telefono, usato per SMS anche a minori.
- riferimenti: artt. 5.1.c, 5.1.e, 9, 25; schema.sql:19-26,37; public/index.html:18-19; src/auth.js:17,24,28
- raccomandazione: prevedere scadenza del documento dopo la verifica; valutare se i campi non usati vadano eliminati; motivare o rimuovere le note di salute; verificare l'età del destinatario degli SMS.
- responsabile_suggerito: titolare; Software Agency.
- verifica: le tabelle e il modulo contengono solo campi giustificati.

**M-11 · Fornitori e destinatari non censiti**
- stato: `non_conforme`; gravità: media; priorità: **P2**
- rischio: il telefono va a TextBlast (src/notifications.js:2-9) e il widget ChatNow è caricato da public/index.html:26, ma nessuno dei due è nel registro (docs/fornitori.md). Per ciascuno non è noto dove finisca il dato né per quanto resti.
- riferimenti: artt. 28, 30, 44-46
- raccomandazione: passare a privacy-vendor-compliance.
- responsabile_suggerito: titolare; privacy-vendor-compliance.
- verifica: registro completo.

**M-12 · Cancellazione e portabilità non coprono l'inventario**
- stato: `parzialmente_conforme`; gravità: media; priorità: **P2**
- rischio: `/me/export` restituisce solo utente e studenti (src/account.js:5-6): mancano prenotazioni, messaggi, registrazioni, trascrizioni, fatture e dati del pagatore. La cancellazione ignora il ruolo `parent` per i figli. La procedura prevede risposta in 60 giorni, costo di 10 euro per l'accesso e risposta all'indirizzo da cui arriva la richiesta, senza verifica; la tracciatura delle richieste sta in una casella personale senza durata.
- riferimenti: artt. 12, 15, 16, 17, 20; docs/procedura-diritti.md:5-9
- raccomandazione: da passare a privacy-data-subject-rights (non ho verificato i termini dell'art. 12 sulla fonte).
- responsabile_suggerito: DPO/titolare.
- verifica: l'export di un utente di prova copre ogni tabella dell'inventario.

**M-13 · Audit log: 90 giorni e contenuto non motivati**
- stato: `parzialmente_conforme`; gravità: bassa; priorità: **P3**
- rischio: lo stesso log serve da traccia degli accessi a documenti ed export. La durata di 90 giorni non ha motivazione; `actor_id` non ha vincolo; `target` contiene identificativi.
- riferimenti: artt. 5.1.e, 32; src/purge.js:9
- raccomandazione: documentare finalità e durata; vincolare le chiavi. Prima di decidere, valutare con il titolare.
- responsabile_suggerito: titolare.
- verifica: scheda del trattamento aggiornata.

**M-14 · Messaggi alla segreteria e rettifica**
- stato: `non_verificabile`; gravità: bassa; priorità: **P3**
- rischio: i messaggi a testo libero (schema.sql:76-81) possono contenere dati sensibili. Il codice di scrittura non è nella copia e non c'è un percorso per la rettifica.
- riferimenti: artt. 5.1.d, 16
- raccomandazione: motivare i 365 giorni e prevedere la rettifica.
- responsabile_suggerito: titolare.
- verifica: percorso di rettifica documentato.

**M-15 · Per chi svolge il controllo sicurezza (passaggio ad altri ruoli)**
- priorità: **P2**
- La chiave di cifratura dei documenti è scritta in chiaro in config/default.json:8. Il file è versionato e finisce quindi anche nei backup. Il dump non cifrato la rende superflua (M-05). Da passare a privacy-security-engineer e sec-cloud.
- Registro: LessonCam ha il certificato ISO 27001 scaduto il 2025-12-31 (docs/fornitori.md:9, data odierna 2026-11-24). Mailorbit cita il Privacy Shield, non più valido (:10). Da passare a privacy-vendor-compliance.

## Prossimi passi proposti (da confermare con l'utente)
1. Sospendere il flusso verso InsightAI (M-01) e decidere con titolare/DPO.
2. Fissare, con motivazione scritta, la durata di ogni riga della matrice. Poi correggere purge, cancellazione e backup (M-02, M-03, M-05).
3. Sostituire la copia di produzione in staging (M-04).
4. Correggere sincronizzazione newsletter ed elenco classe (M-06, M-07).

**Revisione richiesta.** Ho lavorato su un modello più piccolo di quello della sessione. Le conclusioni P0 e P1 (M-01 a M-07), in particolare la lettura di M-06 e M-07, andrebbero riesaminate da AIPCA-01 · ARCTURUS o da un revisore su Opus prima di diventare definitive. Le nozioni normative (artt. 12 e 44-46, art. 2220 c.c., Data Privacy Framework, adeguatezza di Singapore) non le ho verificate su fonti: potrebbero essere superate.

— AIPCA-06 · MERAK
