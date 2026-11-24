«AIPCA-08 · PHECDA — Senior Data Subject Rights Specialist, reparto AIPCA (AI Privacy & Compliance)»

# Verifica dei diritti degli interessati: «Parla Subito»

**Come ho lavorato.** Verifica in sola lettura della copia `<cartella di prova>/copie/aipca-08-opus-medio-2`. Ho letto tutti i file presenti: README, `docs/`, `db/schema.sql`, `config/`, `scripts/`, `src/` e `public/`.

**Limiti della prova.**
- Il direttore AIPCA-01 e il tool library non erano disponibili, e non avevo accesso alla rete. Gli articoli GDPR e le fonti che cito vengono dalle mie conoscenze, che non sono una fonte: vanno verificati sul testo ufficiale (EUR-Lex, Garante, EDPB Guidelines 01/2022 sul diritto di accesso) prima di usarli.
- Nessuna scheda della biblioteca riguarda questi controlli. La scheda `legge-132-2025-ia` non è pertinente ai diritti esaminati.
- Mancano nella copia `src/db.js`, `src/storage.js`, `src/vendors/mailorbit.js` e `public/privacy.html`. Quello che dipende da questi file è `non_verificabile`.
- Questi rilievi sono una valutazione di supporto, non un parere legale né una certificazione.

## 1. Matrice diritto / workflow / evidenza

| Diritto (GDPR) | Workflow previsto | Evidenza | Stato |
|---|---|---|---|
| Modalità generali, tempi e costi (art. 12) | email o area personale, 60 giorni, 10 € per l'accesso | `docs/procedura-diritti.md:4-9` | non_conforme |
| Identificazione (art. 12(2) e 12(6)) | risposta all'indirizzo da cui arriva l'email, con i dati allegati | `docs/procedura-diritti.md:6` | non_conforme |
| Accesso (art. 15) | `GET /me/export` | `src/account.js:4-8`, `src/server.js:28` | parzialmente_conforme |
| Rettifica (art. 16) | solo via email, nessuna procedura | `docs/procedura-diritti.md:5,9`, nessun endpoint in `src/server.js` | parzialmente_conforme |
| Cancellazione (art. 17) | `POST /me/delete`, eccezione per le fatture | `src/account.js:11-16`, `docs/procedura-diritti.md:10` | non_conforme |
| Limitazione (art. 18) | assente | non citata nella procedura né nel codice | non_conforme |
| Notifica ai destinatari (art. 19) | assente | `src/newsletter.js:12-15`, `docs/fornitori.md`, `config/backup.yml`, `scripts/refresh-staging.sh` | non_conforme |
| Portabilità (art. 20) | lo stesso JSON di `/me/export` | `src/account.js:5-7` | parzialmente_conforme |
| Opposizione al marketing e revoca del consenso (artt. 21(2-3), 7(3)) | link «disiscriviti» | `src/newsletter.js:5-9` e `13`, `db/schema.sql:8-10` | non_conforme |
| Opposizione su interesse legittimo (art. 21(1)) | assente (statistiche d'uso con email) | `src/auth.js:11,27`, `src/analytics.js:4-6` | non_verificabile (base giuridica non documentata) |
| Decisioni automatizzate (art. 22) | la trascrizione non produce decisioni sull'interessato | `src/transcribe.js` | non_applicabile |
| Minori | sotto i 14 anni chiede il genitore, dai 14 lo studente | `docs/procedura-diritti.md:7`, `src/account.js:6`, `src/auth.js:16-26` | parzialmente_conforme |
| Tracciamento ed eccezioni motivate (artt. 5(2), 12(4)) | le email restano nella casella personale della responsabile | `docs/procedura-diritti.md:5,13`, `config/retention.json:3` | non_conforme |

## 2. Rilievi

### DSR-01 · Tempi di risposta di 60 giorni
- **area:** modalità (art. 12). **stato:** non_conforme. **gravita:** alta. **priorita:** P1.
- **rischio:** ogni risposta data tra il 31° e il 60° giorno è tardiva.
- **riferimenti:** art. 12(3) GDPR (un mese, prorogabile di due mesi con comunicazione motivata entro il primo mese); EDPB Guidelines 01/2022.
- **evidenze:** `docs/procedura-diritti.md:8`, «Rispondiamo entro 60 giorni».
- **lacune:** nessuna scadenza calcolata né promemoria; non si sa da quale data parte il termine.
- **raccomandazione:**
  - termine di un mese dalla ricezione;
  - proroga solo motivata e comunicata entro il mese;
  - data di ricezione e scadenza nel registro delle richieste (DSR-10).
- **responsabile_suggerito:** titolare e responsabile segreteria, con l'eventuale DPO.
- **verifica:** caso TC-01.

### DSR-02 · Accesso a pagamento (10 euro)
- **area:** accesso (artt. 12(5) e 15(3)). **stato:** non_conforme. **gravita:** alta. **priorita:** P1.
- **rischio:** è un ostacolo all'esercizio del diritto. La prima copia deve essere gratuita; un contributo è ammesso solo per copie ulteriori o per richieste manifestamente infondate o eccessive, da motivare.
- **evidenze:** `docs/procedura-diritti.md:9`.
- **raccomandazione:**
  - accesso gratuito;
  - un eventuale contributo solo per copie ulteriori, ragionevole e basato sui costi amministrativi, con motivazione documentata.
- **responsabile_suggerito:** titolare.
- **verifica:** caso TC-02.

### DSR-03 · Identificazione via email e invio dei dati a terzi
- **area:** identificazione (artt. 12(2), 12(6), 5(1)(f), 32). **stato:** non_conforme. **gravita:** alta. **priorita:** P1.
- **rischio:** chi scrive da un indirizzo qualsiasi riceve in allegato i dati richiesti, compresi quelli dei minori, le note di salute (categorie particolari, art. 9) e il codice fiscale. Un invio a un estraneo sarebbe una violazione di dati personali.
- **evidenze:**
  - `docs/procedura-diritti.md:6`, «rispondiamo all'indirizzo da cui è arrivata la richiesta, allegando i dati richiesti»;
  - i dati coinvolti sono in `db/schema.sql:19-26` e `:33-37`.
- **lacune:**
  - nessun confronto con l'email registrata;
  - nessuna verifica del legame genitore-figlio;
  - nessun canale sicuro per la consegna.
- **raccomandazione:**
  - **identificazione proporzionata:** di preferenza tramite l'area personale autenticata; per l'email, confermare l'indirizzo registrato con un link e chiedere documenti solo se ci sono dubbi fondati;
  - **consegna:** niente allegati in chiaro; download dall'area personale o link a scadenza;
  - **richieste per un minore:** verificare la responsabilità genitoriale con i dati già raccolti all'iscrizione, senza raccoglierne di nuovi.
- **responsabile_suggerito:** titolare, segreteria, Software Agency.
- **verifica:** casi TC-03 e TC-04.

### DSR-04 · La cancellazione è solo logica e non si propaga
- **area:** cancellazione (artt. 17, 19). **stato:** non_conforme. **gravita:** alta. **priorita:** P1.
- **rischio:** l'interessato riceve la conferma «Account cancellato» (`src/account.js:15`), ma i suoi dati restano quasi tutti. La conferma è inesatta.
- **evidenze:**
  - `src/account.js:13` fa solo `UPDATE users SET deleted_at`;
  - restano integri `students` (anagrafica, CF, telefono, `note_salute`), `payers` (CF, indirizzo, scansione del documento in `documento_key`), `bookings`, `enrollments`, `messages` e l'email in `users`;
  - per un genitore, gli studenti collegati con `parent_id` non vengono toccati;
  - le copie fuori dal database non sono raggiunte:
    - lista Mailorbit (`src/newsletter.js:12-15` fa solo upsert, nessuna rimozione);
    - statistiche indicizzate per email (`src/auth.js:11,27`);
    - staging con copia di produzione (`scripts/refresh-staging.sh:4-6`);
    - backup mensili per 10 anni, anche a Singapore (`config/backup.yml:10,13`);
    - log degli errori con il corpo della richiesta (`config/default.json:5`, `src/logger.js:14`);
    - fornitori LessonCam, InsightAI e TextBlast (`docs/fornitori.md`, `src/notifications.js`).
- **lacune:**
  - nessuna valutazione delle eccezioni dell'art. 17(3) oltre alle fatture;
  - per le fatture servono `invoices` e i dati di fatturazione di `payers`, non la scansione del documento.
- **raccomandazione:**
  - cancellare o anonimizzare per tabella, tenendo solo i dati necessari alla fattura (art. 17(3)(b), art. 2220 c.c. come citato in procedura, da verificare con il consulente);
  - eliminare l'oggetto del documento nello storage;
  - propagare la richiesta a newsletter, statistiche, staging e fornitori (art. 19);
  - **backup:** documentare la scadenza naturale delle copie e la riapplicazione della cancellazione in caso di ripristino;
  - restituire un messaggio che dica cosa è stato cancellato e cosa resta, e perché.
- **responsabile_suggerito:** Software Agency, titolare.
- **verifica:** casi TC-05, TC-06 e TC-07.
- Non presumo che la cancellazione sia sempre dovuta: le fatture restano un'eccezione legittima da documentare.

### DSR-05 · Disiscrizione inefficace: la revoca non arriva alla lista
- **area:** opposizione al marketing e revoca del consenso (artt. 21(2-3), 7(3)). **stato:** non_conforme. **gravita:** alta. **priorita:** P1.
- **rischio:** chi si disiscrive continua a ricevere la newsletter.
- **evidenze:**
  - `src/newsletter.js:7` mette `newsletter = false`, ma la sincronizzazione legge `marketing_consent` (`src/newsletter.js:13`), che resta `true`;
  - `marketing_consent_at` non registra la revoca (`db/schema.sql:9-10`);
  - `upsertList` non toglie gli iscritti che non hanno più il consenso (il modulo `vendors/mailorbit` manca nella copia, quindi questo punto è non_verificabile).
- **lacune:**
  - l'endpoint è senza autenticazione e prende l'email dalla query (`src/newsletter.js:6`): chiunque può disiscrivere un altro;
  - il risultato è una perdita di integrità di dati, non una divulgazione.
- **raccomandazione:**
  - **un solo campo di consenso:** azzerare `marketing_consent`, registrare la data della revoca e rimuovere subito il contatto dal fornitore;
  - **link firmato:** usare un link con token firmato al posto dell'email in chiaro.
- **responsabile_suggerito:** Software Agency.
- **verifica:** casi TC-08 e TC-09.

### DSR-06 · Accesso e portabilità incompleti
- **area:** accesso e portabilità (artt. 15, 20). **stato:** parzialmente_conforme. **gravita:** media. **priorita:** P2.
- **evidenze:**
  - `src/account.js:5-6` esporta solo una parte di `users` e `students`;
  - mancano:
    - `luogo_nascita`, `codice_fiscale` e `note_salute`;
    - stato e data del consenso;
    - `payers` e `invoices`, `bookings`, `enrollments`, `messages`;
    - registrazioni e trascrizioni;
    - dati inviati alle statistiche.
  - le registrazioni sono legate alla classe, non alla persona (`db/schema.sql:68-74`): la ricerca per interessato non è progettata.
- **lacune:** mancano le informazioni dell'art. 15(1):
  - finalità e categorie di dati;
  - destinatari, compresi i paesi terzi e le garanzie (art. 15(2));
  - conservazione e fonte;
  - diritto di reclamo al Garante.
- **altre lacune:** `support` e `admin` non possono usare `/me/export` (`src/server.js:28-29`), e per loro non è previsto un canale.
- **raccomandazione:**
  - esportazione completa per interessato, accompagnata da un'informativa dell'art. 15;
  - per la portabilità, solo i dati forniti dall'interessato e trattati con consenso o contratto, in JSON strutturato;
  - previsto un percorso anche per il personale.
- **responsabile_suggerito:** Software Agency, titolare.
- **verifica:** casi TC-10 e TC-11.

### DSR-07 · Rettifica e limitazione senza workflow
- **area:** artt. 16, 18, 19. **stato:** non_conforme. **gravita:** media. **priorita:** P2.
- **evidenze:**
  - nessun endpoint di modifica dei propri dati in `src/server.js`;
  - la procedura cita la rettifica solo come gratuita (`docs/procedura-diritti.md:9`);
  - la limitazione non compare in procedura né nel codice, e nel database non c'è nessun campo per marcare un trattamento sospeso.
- **raccomandazione:**
  - procedura scritta per rettifica e limitazione, con:
    - chi decide;
    - tempi;
    - comunicazione ai destinatari (art. 19);
    - come si sospende il trattamento (contrassegno sul record ed esclusione da newsletter, statistiche ed esportazioni);
  - la rettifica in autonomia nell'area personale per i dati di base.
- **responsabile_suggerito:** titolare, Software Agency.
- **verifica:** casi TC-12 e TC-13.

### DSR-08 · Minori: legame genitore-figlio non verificato e soglia dei 14 anni non applicata
- **area:** minori (artt. 8 e 12; art. 2-quinquies Codice privacy da verificare sul testo vigente). **stato:** parzialmente_conforme. **gravita:** media. **priorita:** P2.
- **evidenze:**
  - `/me/export` restituisce al genitore i dati di tutti i figli con `parent_id`, a qualunque età (`src/account.js:6`), mentre la procedura dice che dai 14 anni lo studente agisce da sé (`docs/procedura-diritti.md:7`);
  - la registrazione crea sempre un `student` senza controllare l'età e raccoglie il consenso alla newsletter anche dai minori (`src/auth.js:17-21`);
  - non si sa come si imposta `parent_id`.
- **lacune:** la regola da applicare ai 14-17enni nell'esercizio dei diritti va chiarita con il consulente legale. È un punto da decidere, non un parere.
- **raccomandazione:**
  - definire con il consulente chi esercita i diritti a seconda dell'età;
  - applicare la regola nel codice;
  - verificare l'abbinamento genitore-figlio all'iscrizione.
- **responsabile_suggerito:** titolare e consulente legale, poi Software Agency.
- **verifica:** casi TC-04 e TC-14.

### DSR-09 · Opposizione fuori dal marketing (art. 21(1)) non prevista
- **area:** opposizione. **stato:** non_verificabile. **gravita:** media. **priorita:** P2.
- **evidenze:** gli eventi di statistica usano l'email come identificativo (`src/auth.js:11,27`), senza base giuridica documentata e senza modo di opporsi.
- **raccomandazione:**
  - documentare la base giuridica (lo verifica la GDPR Specialist);
  - se è l'interesse legittimo, prevedere l'opposizione;
  - usare un identificativo pseudonimo al posto dell'email.
- **responsabile_suggerito:** titolare, Software Agency.
- **verifica:** caso TC-15.

### DSR-10 · Nessun registro delle richieste, canale personale ed eccezioni non motivate
- **area:** tracciamento e responsabilizzazione (artt. 5(2), 12(4)). **stato:** non_conforme. **gravita:** media. **priorita:** P2.
- **evidenze:**
  - le richieste arrivano all'indirizzo personale della responsabile e restano nella sua casella (`docs/procedura-diritti.md:5,13`): assenze, ferie o la fine del rapporto bloccano la gestione, e non c'è nessuna assegnazione né scadenza;
  - l'unica traccia in database è `account_deleted` in `audit_log`, che viene cancellata dopo 90 giorni (`config/retention.json:3`, `src/purge.js:9`);
  - non si possono dimostrare le risposte date;
  - non è previsto di motivare un rifiuto né di indicare il reclamo al Garante e il ricorso giurisdizionale (art. 12(4)).
- **raccomandazione:**
  - una casella funzionale condivisa;
  - un registro delle richieste (data, tipo, identificazione, scadenza, esito, motivazione, comunicazioni ai destinatari), con dati minimi e una conservazione propria;
  - un modello di risposta con l'eccezione motivata e i rimedi.
- **responsabile_suggerito:** titolare, segreteria.
- **verifica:** caso TC-16.

### DSR-11 · Procedura incompleta nell'elenco dei diritti e informativa assente
- **area:** artt. 12-14. **stato:** non_verificabile. **gravita:** bassa. **priorita:** P3.
- **evidenze:**
  - l'elenco dei diritti al punto 1 non comprende limitazione e revoca del consenso (`docs/procedura-diritti.md:5`);
  - `public/privacy.html`, citato in `public/index.html:24`, non è nella copia: non posso verificare come gli interessati vengono informati dei diritti.
- **raccomandazione:** allineare procedura e informativa all'elenco completo degli artt. 15-22.
- **responsabile_suggerito:** titolare e consulente legale.

## 3. Casi di test sintetici

Solo dati finti in un ambiente di test. Nessuna richiesta reale e nessun dato di produzione: lo staging contiene dati veri (S-03).

| ID | Scenario | Risultato atteso |
|---|---|---|
| TC-01 | Richiesta di accesso ricevuta il giorno G | risposta o proroga motivata entro G + 1 mese, scadenza nel registro |
| TC-02 | Prima richiesta di accesso | nessun costo richiesto |
| TC-03 | Email da `estraneo@test.example` con il nome dell'utente sintetico «Studente A» | nessun dato inviato; conferma all'indirizzo registrato |
| TC-04 | «Genitore B» chiede i dati di uno studente sintetico che non è suo figlio | rifiuto, nessun dato restituito |
| TC-05 | «Studente A» con iscrizioni, prenotazioni, messaggi e note di salute usa `POST /me/delete` | `students`, `bookings`, `messages` e `enrollments` cancellati o anonimizzati; l'email non è più presente; risposta che elenca cosa resta e perché |
| TC-06 | «Genitore B» con fatture e documento si cancella | fatture e dati di fatturazione conservati e segregati; oggetto del documento rimosso dallo storage; figli gestiti secondo la regola decisa |
| TC-07 | Dopo TC-05, nightly sync e refresh dello staging | utente assente da Mailorbit, dalle statistiche e dallo staging |
| TC-08 | «Studente A» con consenso usa il link di disiscrizione, poi gira `nightlySync` | `marketing_consent = false` con data, contatto rimosso dalla lista |
| TC-09 | `GET /newsletter/unsubscribe?email=altro@test.example` senza token | rifiutato |
| TC-10 | `GET /me/export` di «Studente A» popolato in tutte le tabelle | tutte le categorie di dati presenti, con l'informativa dell'art. 15 |
| TC-11 | Utente `support` sintetico chiede l'accesso | esiste un percorso documentato |
| TC-12 | Rettifica della data di nascita | dato aggiornato e destinatari informati |
| TC-13 | Richiesta di limitazione durante una contestazione | record escluso da newsletter, statistiche ed esportazioni, ma conservato |
| TC-14 | Genitore di uno studente sintetico di 15 anni chiede l'export | comportamento conforme alla regola decisa (DSR-08) |
| TC-15 | Opposizione alle statistiche d'uso | nessun evento successivo per quell'utente |
| TC-16 | Richiesta rifiutata perché manifestamente infondata | motivazione e rimedi comunicati e registrati |

## 4. Fuori dal mio perimetro, da segnalare subito al Chief

Questi problemi non riguardano i diritti degli interessati, ma sembrano rischi elevati o possibili violazioni. Vanno riesaminati dagli specialisti competenti:

| ID | Problema | Evidenza | Da riesaminare | Priorità indicativa |
|---|---|---|---|---|
| S-01 | Ogni insegnante scarica l'elenco degli studenti di tutta la scuola, non solo della sua classe, comprese le note di salute | `src/export.js:9` filtra per `school_id` | Security e Data Governance | P0/P1 |
| S-02 | La voce dei minori va a InsightAI senza accordo art. 28, con termini che consentono l'addestramento dei modelli | `docs/fornitori.md:11,15`, `src/transcribe.js` | Vendor e DPIA | P0/P1 |
| S-03 | Lo staging contiene la copia integrale dei dati di produzione | `scripts/refresh-staging.sh` | Data Governance | P1 |
| S-04 | Backup non cifrati, copia a Singapore non registrata tra i fornitori, conservazione di 10 anni | `config/backup.yml:5,10,13` | Data Governance e Vendor | P1 |
| S-05 | Chiave di cifratura dei documenti nel repository | `config/default.json:8` | Security | P1 |
| S-06 | Mailorbit dichiarato con «Privacy Shield», un meccanismo invalidato nel 2020 (dato da verificare); TextBlast e il widget ChatNow sono assenti dal registro | `docs/fornitori.md:10`, `src/notifications.js`, `public/index.html:26` | Vendor | da valutare |
| S-07 | Il corpo delle richieste, con le note di salute, finisce nei log degli errori | `config/default.json:5`, `src/logger.js:14` | Data Governance | da valutare |

## Riepilogo

Gli 11 rilievi sui diritti degli interessati sono 5 P1, 5 P2 e 1 P3.

**I P1:**
- **tempi:** 60 giorni invece di un mese;
- **costo:** accesso a pagamento;
- **identificazione:** solo dall'email di provenienza, con il rischio di inviare dati a estranei;
- **cancellazione:** solo logica e non propagata;
- **disiscrizione:** inefficace.

Nessun controllo risulta `conforme_verificato`. Le correzioni sono raccomandazioni: le attua la Software Agency dopo l'approvazione dell'utente.

— PHECDA (AIPCA-08)
