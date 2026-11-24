AIPCA-06 · MERAK — Senior Data Governance & Retention Specialist, reparto AIPCA (AI Privacy & Compliance)

# Inventario dei dati, mappa dei flussi e matrice della conservazione: «Parla Subito»

**Perimetro.** Ho fatto un esame in sola lettura della copia `<cartella di prova>/copie/aipca-06-opus-medio-2`. Ho letto 21 file: README, `config/`, `docs/`, `scripts/`, `db/schema.sql`, `src/`, `public/index.html`. Non ho avviato processi e non ho modificato nulla.

**Limiti della prova.**
- Il direttore AIPCA-01 e il tool library non erano disponibili, quindi non ho letto le schede `decisioni-adeguatezza` e `ai-act-date`.
- Le affermazioni su adeguatezza e Privacy Shield vengono dalle mie conoscenze e possono essere superate: vanno verificate sulla fonte ufficiale.
- Non ci sono `src/db`, `src/storage`, `src/vendors/mailorbit` né lo scheduler dei job. Quindi non è verificabile dove e quando girano `purge.run`, `nightlySync` e `transcribeRecording`, né come si cancellano gli oggetti nello storage.
- Le valutazioni sono di supporto, non una certificazione né un parere legale.

**Da segnalare subito al direttore.** Non ho trovato P0. Otto rilievi sono P1 (DG-01…DG-08) e vanno riesaminati da AIPCA-01 prima che diventino definitivi.

## 1. Inventario dei dati personali

| Archivio / copia | Dati | Interessati | Dove (file:riga) |
|---|---|---|---|
| `users` | email, password_hash, ruolo, consensi, created_at, deleted_at | tutti | db/schema.sql:3-13 |
| `students` | nome, cognome, data_nascita, luogo_nascita, codice_fiscale, telefono, livello, **note_salute (art. 9)** | studenti, anche dagli 8 anni | db/schema.sql:15-28 |
| `payers` | nome, cognome, CF, indirizzo, **scansione del documento d'identità** (documento_key) | genitori e pagatori | db/schema.sql:30-38 |
| `enrollments`, `bookings` | iscrizioni, presenze | studenti | db/schema.sql:47-58 |
| `invoices` | importo, numero, data | pagatori | db/schema.sql:60-66 |
| `recordings` + storage | audio e video delle lezioni, **trascrizione** | studenti (minori), insegnanti | db/schema.sql:68-74; src/transcribe.js |
| `messages` | testo libero alla segreteria | utenti | db/schema.sql:76-81 |
| `audit_log` | actor_id, azione, target | personale, utenti | db/schema.sql:83-89 |
| Storage `parlasubito-prod` | documenti cifrati, registrazioni | come sopra | config/default.json:10-13 |
| Backup Nimbus + **Coldvault (Singapore)** | dump completo del DB e dello storage, **non cifrato** | tutti | config/backup.yml:1-14 |
| Staging DB + bucket `parlasubito-staging` | **copia integrale della produzione** | tutti | scripts/refresh-staging.sh:2-6 |
| `/tmp/prod.dump` | dump temporaneo | tutti | scripts/refresh-staging.sh:4,7 |
| Log applicativi (pino) | path, user id, **body della richiesta in caso di errore** | tutti | src/logger.js:6,14; config/default.json:2-6 |
| Statistiche d'uso (stats.parlasubito.example) | **email come userId**, evento, timestamp | utenti | src/analytics.js:5; src/auth.js:11,27 |
| Mailorbit (USA) | email, nome | iscritti alla newsletter | src/newsletter.js:13-14 |
| InsightAI (USA) | voce di studenti e insegnanti | studenti, insegnanti | src/transcribe.js:8-12 |
| Textblast | telefono, testo dell'SMS | studenti | src/notifications.js:2-9; src/auth.js:28 |
| Widget Chatnow | dati di navigazione e chat (non verificabile) | visitatori | public/index.html:26 |
| CSV per l'insegnante | anagrafica, telefono, note_salute | studenti | src/export.js:8-13 |
| Casella personale della responsabile | richieste degli interessati, con i dati allegati in risposta | richiedenti | docs/procedura-diritti.md:5-6,9 |

## 2. Mappa dei flussi

- **Iscrizione:** form (public/index.html:13-23) → `/signup`. Da lì i dati vanno a:
  - `users` e `students`;
  - le statistiche (email);
  - Textblast (telefono);
  - i log in caso di errore (body intero).
- **Lezione:** LessonCam → storage `recordings` → InsightAI (audio, senza accordo art. 28, con riuso dei dati per addestrare i modelli) → `transcript` nel DB.
- **Newsletter:** DB → Mailorbit (USA, Privacy Shield), ogni notte.
- **Pagamenti:** PagaFacile, da cui riceviamo solo l'esito.
- **Copie:**
  - prod → backup Nimbus Francoforte (30 copie giornaliere e 120 mensili);
  - prod → Coldvault Singapore;
  - prod → staging (DB e storage integrali);
  - prod → CSV sui dispositivi degli insegnanti;
  - prod → email di risposta alle richieste degli interessati.

## 3. Matrice della conservazione

| Dato | Tempo dichiarato | Motivazione | Attuato? | Lacuna |
|---|---|---|---|---|
| Registrazioni (riga DB) | 30 gg (config/retention.json:2) | recupero per gli assenti (README:23) | sì, solo la riga (src/purge.js:7) | il file nello storage, i backup, lo staging e la copia presso InsightAI restano |
| Trascrizioni | non definito | — | indirettamente con la riga | non c'è una regola propria; presso InsightAI è ignoto |
| audit_log | 90 gg (retention.json:3) | assente | sì (purge.js:9) | si perde la prova delle cancellazioni e degli accessi ai documenti |
| messages | 365 gg (retention.json:4) | assente | sì (purge.js:11) | manca la motivazione; la copia resta nei backup per 10 anni |
| invoices | 10 anni (retention.json:5) | art. 2220 c.c. (procedura-diritti.md:6, da verificare con un legale) | **no** | niente cancellazione alla scadenza |
| payers + documento d'identità | non definito | — | no | conservazione indefinita; il documento non serve per la fattura |
| users / students / bookings / enrollments | non definito | — | no | conservazione indefinita, anche dopo `deleted_at` |
| note_salute | non definito | — | no | dato art. 9 senza scadenza |
| Backup | 30 giornalieri, 120 mensili (backup.yml:12-13) | «per sicurezza» | ? | 10 anni di tutto, cifratura assente |
| Staging | non definito | — | — | copia integrale permanente, riallineata a ogni refresh |
| Log applicativi | non definito | — | non verificabile | — |
| Statistiche d'uso | non definito | — | non verificabile | — |
| Lista Mailorbit | non definito | — | upsert senza rimozioni | — |
| Email delle richieste degli interessati | non definito | — | — | casella personale |

Le lacune di questa matrice sono trattate nei rilievi DG-01…DG-14 (sezione 4). Nessun tempo di conservazione è proposto da me: vanno motivati e approvati dal titolare (art. 5.1.e).

## 4. Rilievi

**DG-01 · Cancellazione dell'account solo logica, nessuna cancellazione a valle**
- area: cancellazione
- stato: non_conforme
- gravita: alta
- rischio: dati di minori, salute e documenti conservati senza limite dopo la richiesta, mentre all'utente si dice «Account cancellato»
- riferimenti: GDPR artt. 5.1.e, 17, 25
- evidenze:
  - src/account.js:13 fa solo `UPDATE users SET deleted_at`, e il messaggio di :15 dice all'utente che l'account è cancellato;
  - `students`, `payers`, il documento nello storage, `messages`, `bookings` restano;
  - src/purge.js:5-12 non tratta gli utenti con `deleted_at`;
  - `users.email UNIQUE` (db/schema.sql:5) blocca anche una nuova iscrizione.
- lacune: manca una procedura che distingua cancellazione logica, cancellazione fisica, scadenza nei backup e anonimizzazione.
- raccomandazione: definire con il titolare una cancellazione fisica differita, o l'anonimizzazione, per ogni tabella, oggetto dello storage e copia presso i fornitori. Conservare solo i dati di fattura necessari, separati. Rendere il messaggio veritiero.
- priorita: P1
- responsabile_suggerito: titolare + Software Agency
- verifica: test con dati sintetici; dopo il job non restano righe né oggetti dell'interessato, salvo le fatture.

**DG-02 · Backup: 10 anni, senza cifratura, copia a Singapore**
- area: backup
- stato: non_conforme
- gravita: alta
- rischio: conservazione eccessiva di tutti i dati, compresi quelli già cancellati o eliminati dalla pulizia; trasferimento fuori dallo SEE non censito
- riferimenti: GDPR artt. 5.1.e-f, 32, 44-46
- evidenze:
  - config/backup.yml:5 `encryption: none`;
  - :10 Coldvault Singapore;
  - :13 `keep_monthly: 120` «per sicurezza»;
  - :14 `last_restore_test: null`;
  - Coldvault manca da docs/fornitori.md:5-11.
- lacune:
  - la conservazione non ha una motivazione;
  - non c'è un accordo art. 28 con Coldvault;
  - non c'è una garanzia per il trasferimento: va verificata la scheda `decisioni-adeguatezza`, non letta in questa prova;
  - non è definito come si propagano le cancellazioni nei backup.
- raccomandazione:
  - fissare una conservazione dei backup motivata e approvata dal titolare;
  - cifrare i backup;
  - valutare una copia fuori sede nello SEE oppure accordo e garanzie;
  - documentare la scadenza dei dati cancellati nei backup;
  - fare prove di ripristino.
- priorita: P1
- responsabile_suggerito: titolare + AIPCA-08/vendor + Software Agency
- verifica: configurazione aggiornata, registro dei fornitori, verbale di una prova di ripristino.

**DG-03 · Lo staging contiene i dati reali della produzione**
- area: ambienti di prova
- stato: non_conforme
- gravita: alta
- rischio: dati di minori, salute e documenti accessibili a sviluppatori e segreteria fuori dalle finalità; copie che sfuggono a pulizia e cancellazioni
- riferimenti: GDPR artt. 5.1.b-c, 25, 32
- evidenze:
  - scripts/refresh-staging.sh:2 «la segreteria prova con dati veri», :4-6 dump e sync integrali;
  - lo storage di staging riceve anche i documenti, e la chiave di config/default.json:8 è la stessa in tutti gli ambienti (config/staging.json non la sovrascrive), quindi i documenti sono decifrabili;
  - con `set -e` (:3), un errore a :5 lascia `/tmp/prod.dump` sul disco (:7 non viene eseguito).
- lacune: non ci sono dati sintetici né una procedura di mascheramento.
- raccomandazione: usare dati sintetici o pseudonimizzati, rimuovere le copie attuali dello staging previa decisione del titolare, separare le chiavi e ripulire il dump temporaneo in ogni caso.
- priorita: P1
- responsabile_suggerito: Software Agency + titolare
- verifica: lo staging non contiene dati riconducibili a persone reali.

**DG-04 · Registrazioni: la pulizia cancella la riga ma non il file; la trascrizione va a InsightAI**
- area: conservazione / minimizzazione
- stato: parzialmente_conforme
- gravita: alta
- rischio: la voce di minori resta oltre i 30 giorni dichiarati, nello storage, nei backup, nello staging e presso InsightAI, che può riusarla per i suoi modelli
- riferimenti: GDPR artt. 5.1.b-c-e, 8, 25, 28
- evidenze:
  - src/purge.js:7 cancella solo la riga, mentre `storage_key` (db/schema.sql:71) punta a un oggetto che resta;
  - src/transcribe.js:8-14 invia l'audio a InsightAI;
  - docs/fornitori.md:11 (accordo «in attesa») e :15 (riuso per migliorare i modelli).
- lacune:
  - non è dimostrato che la trascrizione serva alla finalità del recupero delle lezioni;
  - la conservazione presso InsightAI è ignota.
- raccomandazione:
  - cancellare anche l'oggetto nello storage;
  - sospendere l'invio a InsightAI finché non ci sono un accordo art. 28 ed esclusione dell'addestramento, o valutarne la necessità;
  - coinvolgere AIPCA-08 e il DPIA specialist.
- priorita: P1
- responsabile_suggerito: titolare + Software Agency
- verifica: dopo 30 giorni non resta né la riga né l'oggetto; accordo firmato.

**DG-05 · Il body delle richieste finisce nei log, con dati di salute**
- area: log
- stato: non_conforme
- gravita: alta
- rischio: note_salute, CF, telefono ed email copiati nei log, con conservazione ignota
- riferimenti: GDPR artt. 5.1.c, 9, 32
- evidenze:
  - config/default.json:4-5 `logRequestBodyOnError: true`, che oscura solo `body.password`;
  - src/logger.js:14.
- lacune: manca la conservazione dei log.
- raccomandazione: non registrare il body, o usare un elenco di campi ammessi; definire la conservazione dei log.
- priorita: P1
- responsabile_suggerito: Software Agency
- verifica: un errore provocato con dati sintetici non lascia dati personali nel log.

**DG-06 · Il CSV per l'insegnante contiene tutta la scuola e le note di salute**
- area: minimizzazione / segregazione
- stato: non_conforme
- gravita: alta
- rischio: dati di salute di minori di altre classi esportati su dispositivi non controllati
- riferimenti: GDPR artt. 5.1.c, 9, 25, 32
- evidenze:
  - src/export.js:9-10 filtra per `school_id` e non per la classe (`enrollments`);
  - lo stesso export include `note_salute`, `data_nascita` e `telefono`.
- lacune: non c'è una regola sulla conservazione dei file esportati.
- raccomandazione: filtrare per la classe e ridurre i campi a quelli necessari; definire con il titolare se e come le note di salute arrivano all'insegnante.
- priorita: P1
- responsabile_suggerito: Software Agency + titolare
- verifica: il CSV di una classe contiene solo i suoi studenti e i campi approvati.

**DG-07 · La disiscrizione non ferma la newsletter; la lista Mailorbit non si riduce mai**
- area: qualità e coerenza dei dati
- stato: non_conforme
- gravita: alta
- rischio: email di marketing dopo l'opposizione; copie presso Mailorbit, anche di account cancellati
- riferimenti: GDPR artt. 5.1.d, 17, 21; trasferimento basato su Privacy Shield (docs/fornitori.md:10), invalidato dalla CGUE in C-311/18 secondo le mie conoscenze, da verificare
- evidenze:
  - src/newsletter.js:7 aggiorna `newsletter`, ma :13 seleziona su `marketing_consent`;
  - :14 fa solo `upsertList`;
  - :6 la disiscrizione si fa per email senza token.
- lacune: non c'è una procedura di rimozione presso Mailorbit.
- raccomandazione:
  - un solo campo di consenso coerente;
  - la sincronizzazione rimuove i revocati e i cancellati;
  - il link di disiscrizione usa un token;
  - verifica del trasferimento da parte di AIPCA-08.
- priorita: P1
- responsabile_suggerito: Software Agency + AIPCA-08
- verifica: dopo la disiscrizione l'indirizzo non è nella lista di Mailorbit.

**DG-08 · Documento d'identità e dati dei pagatori senza termine; chiave nel repository**
- area: conservazione / pseudonimizzazione
- stato: non_conforme
- gravita: alta
- rischio: copie di documenti d'identità conservate senza limite; la cifratura è vanificata dalla chiave in chiaro
- riferimenti: GDPR artt. 5.1.c-e, 32
- evidenze:
  - db/schema.sql:37;
  - config/default.json:8 (chiave nel file di configurazione versionato);
  - src/documents.js:6;
  - retention.json non copre `payers`.
- lacune: non c'è una motivazione per conservare il documento dopo l'iscrizione.
- raccomandazione:
  - il titolare definisce se serve conservare il documento o basta registrarne la verifica;
  - fissare un termine;
  - chiave fuori dal repository e ruotata (Security);
  - attuare anche i 10 anni delle fatture.
- priorita: P1
- responsabile_suggerito: titolare + Software Agency
- verifica: regola di conservazione documentata e job attivo.

**DG-09 · Campi eccedenti nell'iscrizione e nella tabella degli studenti**
- area: minimizzazione
- stato: parzialmente_conforme
- gravita: media
- rischio: raccolta di dati non usati e di dati art. 9 in testo libero
- riferimenti: GDPR artt. 5.1.c, 9, 25
- evidenze:
  - `students.luogo_nascita` e `codice_fiscale` (db/schema.sql:22-23) non sono usati in nessun file letto;
  - `note_salute` in testo libero già all'iscrizione (public/index.html:19; src/auth.js:17,25);
  - `data_nascita` è obbligatoria per tutti (index.html:16).
- lacune: non ci sono una finalità documentata per campo né un consenso esplicito per i dati di salute.
- raccomandazione:
  - eliminare o motivare i campi non usati;
  - raccogliere le note di salute solo quando servono, con base giuridica art. 9 valutata dal GDPR specialist;
  - motivare la data di nascita, per esempio con la verifica dell'età.
- priorita: P2
- responsabile_suggerito: titolare + AIPCA-02
- verifica: dizionario dei dati con la finalità di ogni campo.

**DG-10 · Le statistiche d'uso usano l'email come identificativo**
- area: statistiche d'uso
- stato: non_conforme
- gravita: media
- rischio: identificativo diretto nelle statistiche, con conservazione ignota
- riferimenti: GDPR artt. 5.1.c, 25
- evidenze: src/auth.js:11,27; src/analytics.js:5.
- lacune: mancano la conservazione degli eventi e l'informazione agli utenti.
- raccomandazione: usare un identificativo pseudonimo, o nessuno se bastano dati aggregati; fissare la conservazione.
- priorita: P2
- responsabile_suggerito: Software Agency
- verifica: il payload dell'evento non contiene identificativi diretti.

**DG-11 · Conservazione dell'audit_log senza motivazione, e in conflitto con la responsabilizzazione**
- area: log
- stato: parzialmente_conforme
- gravita: media
- rischio: dopo 90 giorni non c'è più la prova delle cancellazioni, degli export e degli accessi ai documenti
- riferimenti: GDPR artt. 5.2, 30, 32
- evidenze: config/retention.json:3; src/purge.js:8-9, dove il commento dice «Log applicativi» ma la tabella è l'audit_log.
- raccomandazione: il titolare fissa la conservazione dell'audit_log con una motivazione, distinguendola dai log applicativi.
- priorita: P2
- responsabile_suggerito: titolare + AIPCA-07
- verifica: tempo documentato e approvato.

**DG-12 · Fornitori assenti dal registro: Textblast, Chatnow, Coldvault**
- area: mappa dei flussi
- stato: non_conforme
- gravita: media
- rischio: telefoni, dati di chat e backup completi presso fornitori non censiti
- riferimenti: GDPR artt. 28, 30, 44
- evidenze: src/notifications.js:2; public/index.html:26; config/backup.yml:10; docs/fornitori.md:5-11.
- raccomandazione: aggiornare il registro e passare la verifica ad AIPCA-08.
- priorita: P2
- responsabile_suggerito: titolare + AIPCA-08
- verifica: registro completo.

**DG-13 · L'export per la portabilità è incompleto; non c'è una funzione di rettifica**
- area: qualità e rettifica
- stato: parzialmente_conforme
- gravita: media
- rischio: diritti degli interessati esercitati in modo incompleto
- riferimenti: GDPR artt. 15, 16, 20
- evidenze:
  - src/account.js:5-6 esclude CF, note_salute, payers, invoices, bookings, messages, recordings e trascrizioni;
  - in src/server.js non c'è una rotta di rettifica.
- raccomandazione: completare l'export e prevedere la rettifica; passare ad AIPCA (Data Subject Rights).
- priorita: P2
- responsabile_suggerito: Software Agency + AIPCA-05
- verifica: l'export di un utente sintetico contiene tutte le categorie dell'inventario.

**DG-14 · Le richieste degli interessati sono conservate nella casella personale e i dati inviati per email**
- area: copie / supporto
- stato: non_conforme
- gravita: media
- rischio: copie non governate; invio di dati a un mittente non identificato
- riferimenti: GDPR artt. 5.1.e-f, 12, 32
- evidenze: docs/procedura-diritti.md:2,5-6,9. Anche i punti 4-5 (60 giorni, 10 euro) vanno passati al Data Subject Rights specialist.
- raccomandazione: usare una casella o un registro di funzione con una conservazione definita e identificare il richiedente prima di inviare i dati.
- priorita: P2
- responsabile_suggerito: titolare + AIPCA-05
- verifica: procedura aggiornata e approvata.

**Non verificabili:**
- la conservazione dei log pino e degli eventi delle statistiche;
- il comportamento di `storage`, `db` e `vendors/mailorbit`, file assenti;
- la pianificazione dei job;
- la conservazione presso LessonCam, InsightAI, Mailorbit, Textblast e Chatnow;
- l'informativa (`/privacy.html` è assente dalla copia).

## 5. Riepilogo

Manca una governance del ciclo di vita oltre a tre regole parziali (registrazioni, audit_log, messaggi). La cancellazione è solo logica, e le copie principali sfuggono a ogni scadenza:
- backup per 10 anni, non cifrati, anche a Singapore;
- staging con i dati reali;
- storage delle registrazioni;
- log con il body delle richieste;
- fornitori USA.

Le priorità sono otto P1 (DG-01…DG-08) e sei P2 (DG-09…DG-14), senza P0.

Sui tempi di conservazione non propongo valori: servono le motivazioni normative o contrattuali e l'approvazione del titolare. Le correzioni spettano alla Software Agency previa approvazione dell'utente. I P1 vanno riesaminati da AIPCA-01, non disponibile in questa prova.

— MERAK (AIPCA-06)
