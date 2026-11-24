AIPCA-06 · MERAK — Senior Data Governance & Retention Specialist, reparto AIPCA (AI Privacy & Compliance)

**Note sulla prova.** Il direttore AIPCA-01 e il tool library non erano disponibili, quindi le schede della biblioteca non le ho lette. Le nozioni datate (adeguatezza di Singapore, stato del Privacy Shield o DPF) vengono dalle mie conoscenze e potrebbero essere superate: vanno verificate sulla fonte. Ho lavorato in sola lettura su tutti i 21 file della copia, senza avviare processi. È un'analisi statica: le regole di ciclo di vita del bucket, i log dell'hosting e le policy dei fornitori non si possono verificare dal repository. Diversi rilievi sono P1: propongo che il direttore del reparto li riesamini prima che diventino definitivi.

Per l'utente: ci sono rilievi P1 (dati veri in staging, backup decennali non cifrati fuori dallo SEE, dati sanitari di minori esportati all'intera scuola, registrazioni mai cancellate dallo storage). Nessun rilievo è P0, perché i dati del progetto sono dichiarati finti (README.md:3). Con dati reali, AIPCA-06-01, -02 e -03 andrebbero segnalati subito.

---

## 1. Inventario dei dati personali

| # | Dove | Dati | Interessati | Note | File:riga |
|---|---|---|---|---|---|
| D1 | `users` | email, hash argon2id, ruolo, newsletter, consenso marketing con data, `deleted_at` | tutti | la cancellazione è solo logica | db/schema.sql:3-13 |
| D2 | `students` | nome, cognome, data e luogo di nascita, codice fiscale, telefono, livello, **note_salute** (art. 9) | studenti, anche dagli 8 anni | `luogo_nascita` e `codice_fiscale` non arrivano dall'iscrizione e la loro finalità non è documentata | db/schema.sql:15-28 |
| D3 | `payers` più lo storage | nome, CF, indirizzo, **scansione del documento d'identità** | genitori e pagatori | | db/schema.sql:30-38; src/documents.js |
| D4 | `classes`, `enrollments`, `bookings` | classi, presenze | studenti, insegnanti | | db/schema.sql:40-58 |
| D5 | `invoices` | numero, importo, data, collegamento a `payers` | pagatori | | db/schema.sql:60-66 |
| D6 | `recordings` più lo storage | audio e video delle lezioni, **trascrizione** | studenti (anche minori), insegnanti | | db/schema.sql:68-74; src/transcribe.js |
| D7 | `messages` | testo libero alla segreteria | tutti | | db/schema.sql:76-81 |
| D8 | `audit_log` | actor_id, azione, target | personale, interessati | | db/schema.sql:83-89 |
| D9 | Log applicativi (pino) | id utente, path; **body intero della richiesta in caso di errore** | tutti | | src/logger.js:6,14; config/default.json:5 |
| D10 | Statistiche d'uso | **email** come userId, evento, proprietà | tutti | | src/analytics.js:5; src/auth.js:11,27 |
| D11 | Backup | dump completo del DB e mirror dello storage, Francoforte e **Singapore** | tutti | | config/backup.yml |
| D12 | Staging | copia completa del DB e dello storage di produzione | tutti | | scripts/refresh-staging.sh |
| D13 | File temporaneo `/tmp/prod.dump` | dump completo | tutti | | scripts/refresh-staging.sh:4,7 |
| D14 | Export CSV agli insegnanti | anagrafica, telefono, note_salute | studenti | finisce sui dispositivi degli insegnanti | src/export.js:8-13 |
| D15 | Fornitori | Mailorbit (email, nome), InsightAI (voce), LessonCam (voce, immagine), PagaFacile, **TextBlast (telefono)** e **ChatNow (widget)** | tutti | TextBlast e ChatNow non sono nel registro | docs/fornitori.md; src/notifications.js:2; public/index.html:26 |
| D16 | Casella email della responsabile | richieste degli interessati con allegati | richiedenti | | docs/procedura-diritti.md:5,9 |

## 2. Mappa dei flussi

```
Iscrizione (public/index.html) -> POST /signup -> users + students (anche note_salute)
   |-> analytics: email in chiaro (stats.parlasubito.example)
   |-> TextBlast: telefono e SMS (fornitore non nel registro)
   \-> in caso di errore: body nei log pino (note_salute, telefono, email)
Pagina pubblica -> widget ChatNow (terza parte, non nel registro)
Lezione -> LessonCam (USA/UE) -> registrazione nello storage -> InsightAI (USA, senza DPA, uso per l'addestramento) -> trascrizione nel DB
DB e storage -> pg_dump e rclone ogni notte -> Nimbus backup (FRA) + Coldvault (Singapore), 10 anni, non cifrati
DB e storage -> refresh-staging.sh -> staging (dati veri per segreteria e sviluppatori)
DB -> nightlySync -> Mailorbit (USA, base giuridica «Privacy Shield»)
DB -> /classes/:id/students.csv -> CSV di tutta la scuola sul dispositivo dell'insegnante
Richieste degli interessati -> casella personale -> risposta con allegati all'indirizzo del mittente
```

## 3. Matrice della conservazione

Sono «non documentate» le motivazioni che mancano nel repository: non le integro io, perché spettano al titolare.

| Categoria | Periodo dichiarato | Fonte e motivazione | Implementazione | Cancellazione | Lacune |
|---|---|---|---|---|---|
| Account `users` | nessuno | — | `deleted_at` alla richiesta | solo logica, nessun job la rende fisica | periodo, purge fisica, account inattivi |
| `students` (con note_salute) | nessuno | — | nessuna | mai | periodo dopo la fine del corso; i dati art. 9 dei minori restano per sempre |
| `payers` e scansione del documento | nessuno | — | nessuna | mai | la scansione non serve alla fattura; manca un periodo proprio |
| `invoices` | 10 anni | art. 2220 c.c. (procedura-diritti.md:6); config/retention.json:5 | non c'è un job | nessuna dopo i 10 anni | la purge a scadenza manca, e i dati del pagatore che non servono alla fattura restano collegati |
| `bookings` ed `enrollments` | nessuno | — | nessuna | mai | periodo |
| Registrazioni (righe del DB) | 30 giorni | README.md:27; retention.json:2 | src/purge.js:7 | fisica, ma **solo la riga** | gli oggetti nello storage non vengono cancellati |
| Registrazioni (file nello storage) | 30 giorni (dichiarati) | come sopra | **nessuna** | mai | P1 (vedi -04) |
| Trascrizioni nel DB | 30 giorni (insieme alla riga) | — | purge.js:7 | fisica | presso InsightAI la conservazione è sconosciuta, con riuso per l'addestramento |
| `messages` | 365 giorni | retention.json:4, senza motivazione | purge.js:11 | fisica | motivazione e approvazione del titolare |
| `audit_log` | 90 giorni | retention.json:3; il commento lo chiama «log applicativi» | purge.js:9 | fisica | la motivazione manca e il periodo è forse breve per l'accountability (accessi ai documenti, export) |
| Log pino | nessuno | — | dipende dall'hosting | sconosciuta | periodo; contengono dati art. 9 |
| Statistiche | nessuno | — | — | sconosciuta | periodo, pseudonimizzazione |
| Backup giornalieri | 30 giorni | backup.yml:12 | — | a scadenza | — |
| Backup mensili | **120 mesi** | backup.yml:13, «per sicurezza» | — | a scadenza | non motivato; vanifica tutte le altre scadenze |
| Staging | nessuno | — | refresh manuale | non c'è una purge (purge.js non risulta in staging) | P1 |
| Mailorbit | nessuno | — | `upsertList` | non rimuove mai nessuno | P1 (vedi -06) |
| Email delle richieste degli interessati | nessuno | procedura-diritti.md:9 | casella personale | mai | periodo e archivio condiviso |
| LessonCam, ChatNow, TextBlast | nessuno | — | — | sconosciuta | periodi da chiedere ai fornitori |

---

## 4. Rilievi

**AIPCA-06-01**
- **Area:** ambienti di prova
- **Titolo:** lo staging contiene i dati veri di produzione, documenti e registrazioni compresi
- **Stato:** non_conforme
- **Gravità:** alta
- **Rischio:** dati art. 9 di minori, documenti d'identità e registrazioni sono accessibili a segreteria e sviluppatori fuori dalla finalità, in un ambiente senza conservazione né purge. Se il refresh fallisce, il dump resta in `/tmp` (con `set -e`, il `rm` della riga 7 non viene eseguito).
- **Riferimenti:** GDPR art. 5.1.b, c ed e; art. 25; art. 32
- **Evidenze:** scripts/refresh-staging.sh:2 («così la segreteria prova con dati veri»), righe 4-6; config/staging.json:3
- **Lacune:** l'elenco di chi accede allo staging; la cifratura del dump
- **Raccomandazione:** dati sintetici o un dump anonimizzato (niente note_salute, CF, documenti, registrazioni), nessun sync dello storage. Cancellare l'attuale contenuto dello staging, con l'approvazione del titolare, e `trap` sul file temporaneo.
- **Priorità:** P1
- **Responsabile suggerito:** titolare e Software Agency (DevOps)
- **Verifica:** lo script non legge più `PROD_DATABASE_URL` e il bucket di staging non contiene oggetti di produzione.

**AIPCA-06-02**
- **Area:** backup
- **Titolo:** backup per 10 anni, non cifrati, con copia a Singapore non registrata
- **Stato:** non_conforme
- **Gravità:** alta
- **Rischio:** tutti i dati, compresi quelli cancellati (registrazioni, account, note_salute), sopravvivono 10 anni, il che rende inefficaci i 30 giorni delle registrazioni e le cancellazioni art. 17. La copia è in chiaro presso un fornitore extra SEE assente dal registro. Il ripristino non è mai stato provato.
- **Riferimenti:** artt. 5.1.e, 17, 30, 32.1.b e c, 44-46
- **Evidenze:**
  - config/backup.yml:5 (`encryption: none`)
  - config/backup.yml:10 (Coldvault, Singapore, «costa meno»)
  - config/backup.yml:13 (`keep_monthly: 120 # dieci anni, per sicurezza`)
  - config/backup.yml:14 (`last_restore_test: null`)
  - docs/fornitori.md:5-11 (Coldvault assente)
- **Lacune:** le garanzie del trasferimento verso Singapore (decisione di adeguatezza o SCC: scheda «decisioni-adeguatezza» non consultata, da verificare); la procedura per non ripristinare i dati cancellati
- **Raccomandazione:**
  - un periodo dei backup motivato e approvato dal titolare, coerente con il periodo massimo dei dati primari;
  - cifratura con chiavi gestite;
  - copia fuori sede nello SEE, oppure fornitore registrato con accordo art. 28 e garanzie;
  - test di ripristino periodico;
  - registro delle cancellazioni da riapplicare dopo ogni ripristino.
- **Priorità:** P1
- **Responsabile suggerito:** titolare e DevOps
- **Verifica:** `backup.yml` aggiornato e il fornitore nel registro.

**AIPCA-06-03**
- **Area:** minimizzazione
- **Titolo:** l'export della classe restituisce gli studenti di tutta la scuola, con note di salute
- **Stato:** non_conforme
- **Gravità:** alta
- **Rischio:** ogni insegnante scarica anagrafica, telefono, data di nascita e note_salute (art. 9, anche di minori) di studenti non suoi. Il CSV crea copie incontrollate sui dispositivi.
- **Riferimenti:** artt. 5.1.c, 9, 25, 32
- **Evidenze:** src/export.js:9-10 (`WHERE s.school_id = $1`: nessun join con `enrollments`); campi alla riga 9
- **Lacune:** quali campi servono davvero al registro
- **Raccomandazione:** filtrare con `enrollments.class_id`. Limitare i campi al necessario (nome, cognome, livello) e mostrare le note di salute solo quando servono, con l'accesso tracciato, invece che nell'export.
- **Priorità:** P1
- **Responsabile suggerito:** Software Agency (backend), con il controllo degli accessi al Security
- **Verifica:** un test sull'export di una classe con studenti di altre classi.

**AIPCA-06-04**
- **Area:** cancellazione
- **Titolo:** la purge delle registrazioni cancella la riga ma non il file nello storage
- **Stato:** non_conforme
- **Gravità:** alta
- **Rischio:** voce e immagine di minori restano per sempre nel bucket di produzione, poi nel backup e nello staging, contro i 30 giorni dichiarati. Anche la `storage_key` va persa, quindi i file diventano orfani e difficili da trovare.
- **Riferimenti:** artt. 5.1.e, 17, 25
- **Evidenze:** src/purge.js:7 (solo `DELETE FROM recordings`); README.md:27; config/backup.yml:7; scripts/refresh-staging.sh:6
- **Lacune:** eventuali regole di lifecycle sul bucket (non verificabili da qui)
- **Raccomandazione:** cancellare l'oggetto prima della riga (oppure una lifecycle rule a 30 giorni sul prefisso), poi bonificare gli orfani esistenti con l'ok del titolare.
- **Priorità:** P1
- **Responsabile suggerito:** Software Agency (backend e DevOps)
- **Verifica:** nessun oggetto di registrazione nello storage più vecchio di 30 giorni.

**AIPCA-06-05**
- **Area:** cancellazione
- **Titolo:** la cancellazione dell'account è solo logica e non tocca i dati collegati
- **Stato:** non_conforme
- **Gravità:** alta
- **Rischio:** dopo la «cancellazione» restano a tempo indeterminato `students` (note_salute comprese, e figli minori), `payers` con la scansione del documento, `bookings` e `messages`. La procedura dichiara che «l'account si cancella subito»: l'informazione data all'interessato non è corretta.
- **Riferimenti:** artt. 5.1.e, 12, 17
- **Evidenze:** src/account.js:13 (solo `deleted_at`); db/schema.sql:12; docs/procedura-diritti.md:6; nessuna purge di `deleted_at` in src/purge.js
- **Lacune:** quali dati servono davvero dopo la cancellazione (solo le fatture, art. 2220 c.c.)
- **Raccomandazione:**
  - cancellazione fisica o anonimizzazione di students, bookings e messages dopo un periodo di ripensamento breve, approvato dal titolare;
  - cancellazione del documento d'identità e dei dati del pagatore non necessari alla fattura;
  - conservazione separata dei soli dati fiscali fino a scadenza, poi la purge;
  - testo della procedura corretto.
- **Priorità:** P1
- **Responsabile suggerito:** titolare, Software Agency; con il diritto di cancellazione allo specialista dei diritti degli interessati
- **Verifica:** un test di cancellazione che controlli tutte le tabelle e lo storage.

**AIPCA-06-06**
- **Area:** qualità e flussi verso i fornitori
- **Titolo:** chi si disiscrive viene reiscritto a Mailorbit, e la lista non si riduce mai
- **Stato:** non_conforme
- **Gravità:** alta
- **Rischio:** `unsubscribe` aggiorna `newsletter`, ma il sync filtra su `marketing_consent`, quindi chi si disiscrive continua a ricevere la newsletter. `upsertList` non toglie gli utenti cancellati o disiscritti, che restano presso un fornitore USA la cui garanzia dichiarata è il «Privacy Shield», da verificare (invalidato nel 2020 secondo le mie conoscenze). Inoltre l'endpoint senza token permette di disiscrivere chiunque partendo dalla sola email.
- **Riferimenti:** artt. 5.1.d ed e, 7.3, 21.3, 44-46
- **Evidenze:** src/newsletter.js:7, 13-14; db/schema.sql:8-10; docs/fornitori.md:10
- **Lacune:** il comportamento effettivo di `upsertList`
- **Raccomandazione:** una sola fonte di verità per il consenso; sincronizzare anche le rimozioni; link di disiscrizione firmato; verificare le garanzie del trasferimento (al vendor compliance).
- **Priorità:** P1
- **Responsabile suggerito:** Software Agency; vendor compliance AIPCA
- **Verifica:** dopo la disiscrizione e il sync, l'utente non è più nella lista.

**AIPCA-06-07**
- **Area:** log
- **Titolo:** il body della richiesta va nei log in caso di errore, con dati di salute; log senza conservazione
- **Stato:** non_conforme
- **Gravità:** media-alta
- **Rischio:** un errore durante `/signup` scrive note_salute, telefono, email e data di nascita nei log. Il redact copre solo `body.password` e il cookie, e per i log non c'è un periodo di conservazione.
- **Riferimenti:** artt. 5.1.c ed e, 9, 25, 32
- **Evidenze:** config/default.json:4-5; src/logger.js:14
- **Lacune:** destinazione e periodo dei log presso Nimbus
- **Raccomandazione:** `logRequestBodyOnError: false`, oppure un elenco di campi ammessi; un periodo di conservazione dei log motivato e approvato; bonifica dei log esistenti.
- **Priorità:** P1
- **Responsabile suggerito:** Software Agency (DevOps)
- **Verifica:** un errore provocato con dati sintetici non lascia campi personali nel log.

**AIPCA-06-08**
- **Area:** fornitori e conservazione esterna
- **Titolo:** registrazioni di minori a InsightAI senza DPA, con riuso per l'addestramento
- **Stato:** non_conforme
- **Gravità:** alta
- **Rischio:** voce di minori trasferita negli USA e conservata dal fornitore per un tempo sconosciuto, con riuso per migliorare i modelli. I 30 giorni non valgono fuori dal sistema.
- **Riferimenti:** artt. 5.1.b ed e, 28, 44-46
- **Evidenze:** src/transcribe.js:8-12; docs/fornitori.md:11, 15
- **Lacune:** l'accordo art. 28, il periodo di conservazione e la cancellazione presso il fornitore
- **Raccomandazione:** sospendere l'invio finché manca un accordo con divieto di riuso, cancellazione a scadenza e garanzie per il trasferimento. Valutare se la trascrizione serve davvero alla finalità del recupero delle lezioni. Da riesaminare con il vendor compliance e la DPIA.
- **Priorità:** P1
- **Responsabile suggerito:** titolare; vendor compliance e DPIA AIPCA
- **Verifica:** accordo firmato e periodo documentato nel registro.

**AIPCA-06-09**
- **Area:** mappa dei flussi
- **Titolo:** fornitori non registrati: TextBlast (SMS) e ChatNow (widget)
- **Stato:** non_conforme
- **Gravità:** media
- **Rischio:** il telefono viene inviato a TextBlast e un widget di terzi è caricato sulla pagina di iscrizione: luoghi, ruoli e conservazione non sono documentati.
- **Riferimenti:** artt. 28, 30, 44
- **Evidenze:** src/notifications.js:2-8; src/auth.js:28; public/index.html:26; docs/fornitori.md (entrambi assenti)
- **Lacune:** contratti, sede, conservazione
- **Raccomandazione:** censirli nel registro dei fornitori e dei trattamenti, oppure rimuoverli.
- **Priorità:** P2
- **Responsabile suggerito:** titolare; vendor compliance
- **Verifica:** il registro aggiornato.

**AIPCA-06-10**
- **Area:** statistiche d'uso
- **Titolo:** l'email è usata come identificativo nelle statistiche
- **Stato:** non_conforme
- **Gravità:** media
- **Rischio:** un identificativo diretto in un sistema di analisi, senza periodo di conservazione: non è minimizzato.
- **Riferimenti:** artt. 5.1.c ed e, 25, 32 (pseudonimizzazione)
- **Evidenze:** src/auth.js:11, 27; src/analytics.js:5
- **Lacune:** periodo di conservazione e accessi a `stats.parlasubito.example`
- **Raccomandazione:** nessun userId, oppure uno pseudonimo con salt ruotato; un periodo di conservazione definito.
- **Priorità:** P2
- **Responsabile suggerito:** Software Agency
- **Verifica:** il payload degli eventi non contiene email.

**AIPCA-06-11**
- **Area:** campi eccedenti
- **Titolo:** il documento d'identità e i campi di `students` mancano di finalità e di periodo
- **Stato:** parzialmente_conforme
- **Gravità:** media
- **Rischio:**
  - la scansione del documento del genitore è conservata senza periodo, dopo una verifica che serve una volta sola;
  - `luogo_nascita` e `codice_fiscale` dello studente non vengono raccolti all'iscrizione e non hanno una finalità documentata;
  - note_salute arriva come testo libero all'iscrizione (anche dal minore), senza un consenso o una base art. 9 distinta.
- **Riferimenti:** artt. 5.1.b, c ed e, 8, 9, 25
- **Evidenze:** db/schema.sql:22-23, 26, 37; public/index.html:19; src/auth.js:17, 24
- **Lacune:** le motivazioni del titolare
- **Raccomandazione:**
  - documentare la finalità di ogni campo; eliminare quelli senza finalità;
  - per il documento, registrare l'avvenuta verifica e cancellare la scansione;
  - note di salute con informativa e base art. 9 specifiche, con accesso limitato agli insegnanti della classe.
- **Priorità:** P2
- **Responsabile suggerito:** titolare; GDPR specialist AIPCA
- **Verifica:** il registro dei trattamenti aggiornato.

**AIPCA-06-12**
- **Area:** conservazione
- **Titolo:** i periodi dichiarati non hanno motivazione né approvazione del titolare
- **Stato:** parzialmente_conforme
- **Gravità:** media
- **Rischio:**
  - `messages` 365 giorni e `audit_log` 90 giorni sono senza motivazione;
  - per `audit_log` i 90 giorni potrebbero non bastare a dimostrare gli accessi ai documenti e gli export;
  - le fatture a 10 anni hanno una fonte (art. 2220 c.c.) ma nessuna purge alla scadenza;
  - le email delle richieste stanno a tempo indeterminato in una casella personale.
- **Riferimenti:** artt. 5.1.e, 5.2, 30.1.f
- **Evidenze:** config/retention.json:3-5; src/purge.js:8-11 (il commento «Log applicativi» si riferisce all'`audit_log`); docs/procedura-diritti.md:5, 9
- **Lacune:** il documento di policy della conservazione
- **Raccomandazione:** una policy approvata dal titolare con categoria, periodo, motivazione normativa o contrattuale e metodo (cancellazione fisica, anonimizzazione, scadenza del backup), più i job per ogni categoria. Non propongo periodi io.
- **Priorità:** P2
- **Responsabile suggerito:** titolare
- **Verifica:** la policy esiste e i job sono allineati.

**AIPCA-06-13**
- **Area:** cancellazione e sicurezza dei dati
- **Titolo:** la chiave di cifratura dei documenti è nel repository
- **Stato:** non_conforme
- **Gravità:** alta
- **Rischio:** la cifratura dei documenti d'identità non protegge da chi ha il repository o un backup. Non è possibile una cancellazione crittografica.
- **Riferimenti:** artt. 25, 32
- **Evidenze:** config/default.json:8 (valore non riportato)
- **Lacune:** la gestione delle chiavi
- **Raccomandazione:** spostarla in un gestore di segreti, ruotarla, ricifrare i documenti e rimuoverla dalla storia di git (al Security e al cybersecurity).
- **Priorità:** P1
- **Responsabile suggerito:** Software Agency (Security); AICA
- **Verifica:** nessun segreto nel repository.

**AIPCA-06-14**
- **Area:** qualità e rettifica
- **Titolo:** export dei dati incompleto, nessuna rettifica in autonomia
- **Stato:** parzialmente_conforme
- **Gravità:** media
- **Rischio:** `/me/export` esclude CF, luogo di nascita, note_salute, pagatori, fatture, presenze, messaggi, registrazioni e consensi. La rettifica passa solo per email, e l'email all'iscrizione non viene verificata.
- **Riferimenti:** artt. 5.1.d, 15, 16, 20
- **Evidenze:** src/account.js:5-6; src/server.js:28-30
- **Lacune:** —
- **Raccomandazione:** export completo di tutte le categorie dell'inventario e verifica dell'email. Il dettaglio va allo specialista dei diritti degli interessati.
- **Priorità:** P2
- **Responsabile suggerito:** Software Agency; data subject rights AIPCA
- **Verifica:** l'export confrontato con l'inventario §1.

## 5. Fuori dal mio ruolo, da girare ad altri

Ho notato altri problemi che passo agli specialisti competenti:
- **Procedura dei diritti** (allo specialista dei diritti degli interessati): 60 giorni, il costo di 10 euro per l'accesso, l'invio degli allegati all'indirizzo del mittente senza identificarlo e l'uso della casella personale della responsabile (docs/procedura-diritti.md:2, 4-5).
- **Minori** (allo specialista GDPR): iscrizione dei minori senza il collegamento al genitore (src/auth.js:24, `parent_id` mai valorizzato).
- **Fornitori** (al vendor compliance): il certificato ISO di LessonCam risulta scaduto (docs/fornitori.md:9).

Riepilogo: 14 rilievi. 10 sono P1 (-01, -02, -03, -04, -05, -06, -07, -08, -13, e -05 e -06 hanno anche effetti sui diritti degli interessati), 4 sono P2 (-09, -10, -11, -12, -14). Le cause principali sono tre: copie non governate (staging, backup, storage), cancellazioni che non arrivano a tutte le copie e periodi di conservazione senza policy approvata. Sono raccomandazioni, non una certificazione. L'attuazione spetta alla Software Agency, dopo l'approvazione dell'utente.

— MERAK (AIPCA-06)
