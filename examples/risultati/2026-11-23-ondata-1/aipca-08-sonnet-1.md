AIPCA-08 · PHECDA — Senior Data Subject Rights Specialist, reparto AIPCA (AI Privacy & Compliance)

# Diritti degli interessati: matrice, casi di test e lacune («Parla Subito»)

**Perimetro e limiti.** Ho letto `docs/procedura-diritti.md`, `src/*.js`, `db/schema.sql`, `config/*`, `docs/fornitori.md`, `scripts/refresh-staging.sh` e il README. Non ho avviato processi né usato dati reali.
- Il tool library non era disponibile: non ho consultato le schede. I riferimenti normativi sono quelli del testo GDPR e vanno verificati sulle fonti ufficiali.
- `./db`, `./storage` e `./vendors/mailorbit` sono richiamati ma non presenti nel progetto.
- Nel codice non esiste alcuna funzione di rettifica, limitazione od opposizione generale.
- Ho lavorato su un modello più piccolo e ho rilievi P1: propongo il riesame del direttore AIPCA-01 o di un revisore su Opus prima che diventino definitivi.

## 1. Matrice diritto / workflow / evidenza

| Diritto (GDPR) | Workflow previsto | Evidenza nel codice | Stato |
|---|---|---|---|
| Accesso (art. 15) | Email o `/me/export`; 10 euro; 60 giorni (procedura righe 5, 8-9) | `src/account.js:4-8`: solo `users` (id, email, role, newsletter, created_at) e 5 campi di `students` | `non_conforme` |
| Rettifica (art. 16) | Citata a riga 5, nessun passo operativo | Nessuna rotta in `src/server.js:25-33` | `non_verificabile` |
| Cancellazione (art. 17) | «Subito» dall'area personale; fatture 10 anni (riga 10) | `src/account.js:11-16`: solo `users.deleted_at = now()` | `non_conforme` |
| Limitazione (art. 18) | Non citata | Assente | `non_conforme` |
| Notifica ai destinatari (art. 19) | Non citata | Nessuna propagazione a Mailorbit, LessonCam, InsightAI | `non_conforme` |
| Portabilità (art. 20) | `/me/export` in JSON (riga 12) | Sottoinsieme dei dati (R-05) | `parzialmente_conforme` |
| Opposizione (art. 21) | Solo link «disiscriviti» (riga 11) | `src/newsletter.js:5-9`, `:12-15` | `non_conforme` |
| Revoca del consenso (art. 7.3) | Non descritta | `users.marketing_consent` mai azzerato | `non_conforme` |
| Decisioni automatizzate (art. 22) | Non citata | Nessuna evidenza | `non_applicabile` (riverificare se la trascrizione IA fosse usata per valutare gli studenti) |
| Termini e costi (art. 12) | 60 giorni; 10 euro | Nessun tracciamento delle scadenze | `non_conforme` |
| Identificazione (art. 12.6) | Risposta all'indirizzo mittente (righe 5-6) | Nessun controllo | `non_conforme` |
| Minori | Sotto i 14 anni lo presenta il genitore (riga 7) | Il codice non verifica l'età | `parzialmente_conforme` |
| Tracciamento (art. 5.2) | Email nella casella della responsabile (riga 13) | `audit_log` conservato 90 giorni | `non_conforme` |

## 2. Rilievi

**R-01 Cancellazione solo apparente.** `non_conforme`, gravità alta, **P1**. Art. 17, 12.
- `src/account.js:13` esegue solo `UPDATE users SET deleted_at`. Restano `students` (`db/schema.sql:15-28`: `note_salute`, `codice_fiscale`, `data_nascita`), `payers` con `documento_key` (la scansione del documento, `schema.sql:30-38`), `bookings`, `enrollments`, `messages` e `recordings`.
- Il messaggio «Account cancellato» (`account.js:15`) e «si cancella subito» (procedura riga 10) non corrispondono al vero.
- L'eccezione dell'art. 17.3.b regge per le fatture e i dati fiscali strettamente necessari. Non copre la scansione del documento, le note di salute o le presenze.
- Raccomandazione: definire una cancellazione per tabella (cancellare o anonimizzare, conservare solo i dati fiscali) e correggere il testo all'utente. Responsabile: titolare con DPO. Implementazione: Software Agency. Verifica: CT-03.

**R-02 Cancellazione e rettifica non propagate a destinatari, backup e staging.** `non_conforme`, **P1**. Art. 17.2, 19, 28.
- Mailorbit: `newsletter.js:13-14` fa solo `upsertList`.
- InsightAI: `docs/fornitori.md:11,15` indica accordo «in attesa» e termini che permettono l'uso dei contenuti per addestrare i modelli.
- Analytics: `analytics.js:5` invia l'email come `userId`.
- Backup: `config/backup.yml:11-13` tiene 30 copie giornaliere e 120 mensili, anche su Coldvault a Singapore.
- Staging: `scripts/refresh-staging.sh:3-6` copia i dati veri e reintroduce ciò che è stato cancellato.
- Raccomandazione: elencare i destinatari per tipo di dato, inviare e registrare le richieste di cancellazione, dichiarare i tempi dei backup, non copiare dati veri in staging o riapplicare le cancellazioni dopo il refresh. Verifica: CT-08.

**R-03 «Disiscriviti» non ferma l'invio e non revoca il consenso.** `non_conforme`, **P1**. Art. 21.2-3, 7.3.
- `newsletter.js:7` azzera solo `newsletter`. Il sync notturno (`:13`) seleziona su `u.marketing_consent`, mai toccato, quindi chi si disiscrive resta nella lista Mailorbit.
- `marketing_consent_at` resta com'era.
- Il link usa l'email in chiaro come parametro, senza token. Chiunque può disiscrivere un altro.
- Lacuna: non so se `upsertList` rimuove chi non è nell'elenco.
- Raccomandazione: azzerare `marketing_consent`, registrare la data, rimuovere il contatto da Mailorbit, usare un token firmato. Verifica: CT-04, CT-05.

**R-04 Termini e costi della procedura non conformi.** `non_conforme`, **P1**. Art. 12.3, 12.4, 12.5.
- Riga 8: «entro 60 giorni». Il termine di base è un mese, prorogabile di due mesi solo per complessità o numero di richieste, con comunicazione entro il primo mese.
- Riga 9: «10 euro» per l'accesso, mentre l'art. 12.5 prevede la gratuità (contributo solo per richieste infondate o eccessive e per copie ulteriori).
- Mancano le informazioni in caso di rifiuto (motivi, reclamo al Garante, ricorso).
- Raccomandazione: riscrivere i punti 4 e 5 e aggiungere un modello per rifiuto e proroga.

**R-05 Esportazione incompleta.** `parzialmente_conforme`, **P2**. Art. 15.1, 20.
- `account.js:5-6` non include `codice_fiscale`, `luogo_nascita`, `note_salute`, prenotazioni e presenze, iscrizioni, messaggi, consenso marketing, dati di `payers` e `invoices` (anche per `parent`), registrazioni e trascrizioni.
- Mancano le informazioni dell'art. 15.1 (finalità, destinatari, conservazione, origine).
- `support` e `admin` non hanno `/me/export` (`server.js:28`).
- Raccomandazione: estendere l'export ai dati forniti dall'interessato (portabilità) e accompagnare la risposta con le informazioni dell'art. 15.1. Verifica: CT-01.

**R-06 Identificazione via email e divulgazione a terzi.** `non_conforme`, **P1**. Art. 12.6, 5.1.f, 32.
- Procedura riga 6: la risposta con i dati va all'indirizzo mittente senza verifica. Un terzo che falsifica o controlla il mittente può ottenere dati di un minore, comprese le note di salute.
- Raccomandazione: chiedere conferma dall'indirizzo registrato o l'autenticazione nell'area personale. Chiedere documenti aggiuntivi solo se necessario e in modo proporzionato. Per i minori verificare la relazione con `students.parent_id`. Verifica: CT-06.

**R-07 Tracciamento, scadenze e canale di ricezione.** `non_conforme`, **P2**. Art. 5.2, 12.
- Procedura righe 5 e 13: indirizzo personale `m.fabbri@parlasubito.example` e email nella casella della responsabile. Nessun registro, assegnazione, sostituto o allerta di scadenza.
- `audit_log` è cancellato dopo 90 giorni (`config/retention.json:3`, `src/purge.js:9`). `exportMine` non registra nulla. `deleteMine` registra solo `account_deleted` (`account.js:14`).
- Raccomandazione: indirizzo di ruolo e registro minimo (data, diritto, identificazione, scadenza, esito, motivazione delle eccezioni), conservato separatamente dall'`audit_log`.

**R-08 Minori e ruoli.** `parzialmente_conforme`, **P2**. Art. 8, 12, 17.
- La procedura (riga 7) dice che sotto i 14 anni agisce il genitore, ma `server.js:28-29` permette a qualunque `student` di esportare e cancellare, senza controllare `students.data_nascita`.
- Un `parent` può cancellare solo il proprio utente. Il genitore non ha cancellazione né rettifica per conto del figlio (solo l'export include i figli, `account.js:6`). Cancellare il genitore lascia i figli con `parent_id` orfano.
- Lacuna: la soglia dei 14 anni come criterio per esercitare i diritti va confermata dal DPO o da un consulente legale.
- Raccomandazione: definire chi esercita quali diritti e applicarlo nel codice. Verifica: CT-07, CT-09.

**R-09 Opposizione, limitazione e revoca senza processo.** `non_conforme`, **P2**. Art. 18, 21, 7.3.
- La procedura non tratta limitazione, opposizione oltre il marketing, revoca di consensi diversi dal marketing, statistiche d'uso (`analytics.js`) né trascrizione IA (`transcribe.js:8-12`).
- Raccomandazione: aggiungere istruzioni per limitazione, opposizione (con valutazione della base giuridica) e revoca di ogni consenso.

**R-10 Collegati, da passare ad altri specialisti.**
- Fornitori: Mailorbit indica «Privacy Shield» come garanzia (`fornitori.md:10`), non più valida. InsightAI è in uso senza accordo. Da privacy-vendor-compliance.
- Log: `config/default.json:5` con `logRequestBodyOnError: true` registra i corpi delle richieste, comprese le note di salute. Da privacy-security-engineer.
- Documenti: `src/documents.js` consente a qualsiasi `support` o `admin` di scaricare il documento di qualunque pagatore. La chiave di cifratura è in chiaro in `config/default.json:8`. Da far valutare subito al direttore: se è una chiave reale, potrebbe essere P0/P1.

## 3. Casi di test sintetici (dati inventati, solo ambiente di prova)

| Id | Scenario | Passi | Atteso | Osservato in codice |
|---|---|---|---|---|
| CT-01 | Accesso, studente adulto sintetico A | Creare A con telefono e `note_salute`, chiamare `/me/export` | Tutti i dati di A e le informazioni art. 15 | Mancano `note_salute`, `codice_fiscale`, prenotazioni, messaggi, registrazioni |
| CT-02 | Accesso via email | Richiesta di accesso alla segreteria | Risposta gratuita entro un mese | Procedura: 10 euro, 60 giorni |
| CT-03 | Cancellazione da `/me/delete` | Cancellare A, poi interrogare `students`, `bookings`, `messages`, `payers` | Dati rimossi o anonimizzati, tranne i fiscali | Resta tutto, solo `deleted_at` valorizzato |
| CT-04 | Disiscrizione | A con `marketing_consent=true`: link unsubscribe, poi `nightlySync` | A fuori dalla lista | A resta incluso |
| CT-05 | Disiscrizione di un terzo | Link con l'email di B senza autenticazione | Rifiutata o con token | Accettata |
| CT-06 | Mittente non verificato | Mail «sono A» da indirizzo diverso da quello registrato | Verifica prima di rispondere | La procedura risponde al mittente |
| CT-07 | Minore sotto i 14 anni | Studente M sintetico chiama `/me/delete` | Rifiutata o inoltrata al genitore | Eseguita |
| CT-08 | Propagazione | Cancellare A, controllare Mailorbit, InsightAI, LessonCam, backup, staging dopo refresh | Allineati o con motivazione | Nessuna propagazione; staging ripristinato dalla produzione |
| CT-09 | Genitore con due figli | Il genitore P cancella il proprio account | Gestione esplicita dei dati dei figli | I figli restano con `parent_id` orfano |
| CT-10 | Scadenza | Richiesta al giorno 0, nessuna risposta al giorno 30 | Allerta e proroga motivata | Nessun meccanismo |
| CT-11 | Fatture dopo cancellazione | Cancellare un pagatore con fattura | Fattura conservata, resto rimosso o anonimizzato | `payers` e `documento_key` restano |

## 4. Sintesi per priorità

- **P1:** R-01, R-02, R-03, R-04, R-06.
- **P2:** R-05, R-07, R-08, R-09.
- **P3:** nessuno.
- **Da altri specialisti:** R-10.
- Nessun P0 certo; la chiave in `config/default.json:8` va valutata subito dal direttore.

Questi rilievi sono una valutazione di supporto, non una certificazione. Nessun controllo di questo progetto è `conforme_verificato`. Le decisioni spettano a titolare, DPO e utente.

— AIPCA-08 · PHECDA
