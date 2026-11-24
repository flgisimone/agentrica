AIPCA-08 · PHECDA — Senior Data Subject Rights Specialist, reparto AIPCA (AI Privacy & Compliance)

# Diritti degli interessati in «Parla Subito»: verifica in sola lettura

**Cosa ho esaminato.** Ho letto tutti i file della copia: `docs/procedura-diritti.md`, i 12 file di `src/`, `db/schema.sql`, `config/*`, `docs/fornitori.md`, `scripts/refresh-staging.sh` e `public/index.html`. Tutti i percorsi che seguono partono da `<cartella di prova>/copie/aipca-08-opus-medio-1/`.

**Cosa manca nella copia.** Nella copia non ci sono:
- `src/db.js`, `src/storage.js`, `src/vendors/mailorbit.js`;
- `public/privacy.html`;
- strumenti di back-office per la segreteria;
- un registro delle richieste.

I punti che dipendono da questi file sono segnati `non_verificabile`.

**Limiti della prova.** Non ho elaborato richieste reali, non ho avviato processi e non ho modificato file.

**Fonti.** Non ho potuto usare la biblioteca del reparto né il web. I riferimenti normativi (GDPR artt. 7, 8, 12-21; art. 2-quinquies D.Lgs. 196/2003; art. 2220 c.c.) vengono dalle mie conoscenze e vanno ricontrollati sulla fonte ufficiale prima di diventare definitivi. Questa è una valutazione di supporto, non un parere legale né una certificazione.

**Rischi alti da segnalare subito al Chief.** Non ho trovato rilievi P0, ma tre rilievi P1 vanno segnalati subito:
- R1: si possono consegnare dati a terzi;
- R6: la cancellazione non si propaga a copie, staging, backup e fornitori;
- R7: chi si disiscrive continua a ricevere la newsletter.

## Matrice diritto / workflow / evidenza

| Diritto (GDPR) | Workflow attuale | Evidenza (file:riga) | Stato |
|---|---|---|---|
| Accesso (art. 15) | per email; self-service `GET /me/export` | procedura-diritti.md:5-6,9; server.js:28; account.js:4-8 | non_conforme |
| Rettifica (art. 16) | solo per email; nel codice non c'è nessuna funzione | procedura-diritti.md:5; nessuna rotta in server.js | parzialmente_conforme |
| Cancellazione (art. 17) e notifica ai destinatari (art. 19) | `POST /me/delete` con soft delete; per email | account.js:11-16; procedura-diritti.md:10 | non_conforme |
| Limitazione (art. 18) | assente | procedura e codice | non_conforme |
| Portabilità (art. 20) | `/me/export` in JSON | account.js:5-7; procedura-diritti.md:12 | parzialmente_conforme |
| Opposizione al marketing (art. 21(2)-(3)) e revoca del consenso (art. 7(3)) | link «disiscriviti» | newsletter.js:5-15; procedura-diritti.md:11 | non_conforme |
| Opposizione per legittimo interesse (art. 21(1)) | assente (vale per le statistiche d'uso, se la base è il legittimo interesse) | analytics.js:4-6; auth.js:11,27 | non_verificabile (la base giuridica non è documentata) |
| Revoca del consenso alle note di salute (art. 9(2)(a), 7(3)) | nessun canale self-service | auth.js:17,24-25; account.js | non_conforme |
| Modalità, termini e costi (art. 12) | 60 giorni; 10 € per l'accesso | procedura-diritti.md:8-9 | non_conforme |
| Identificazione (art. 12(2),(6)) | risposta all'indirizzo mittente con i dati allegati | procedura-diritti.md:6 | non_conforme |
| Minori (art. 8; art. 2-quinquies Codice) | 14 anni; nessuna verifica del legame genitore-figlio | procedura-diritti.md:7; account.js:6; auth.js:16-26 | parzialmente_conforme |
| Tracciamento e accountability (artt. 5(2), 12, 24) | email nella casella personale; audit_log cancellato dopo 90 giorni | procedura-diritti.md:5,13; purge.js:9; retention.json:3 | non_conforme |
| Eccezioni documentate (art. 17(3), 12(4)) | solo le fatture per 10 anni | procedura-diritti.md:10 | parzialmente_conforme |

## Rilievi

**R1. Identificazione: risposta all'indirizzo mittente con i dati allegati**
- id: AIPCA-08-R1 · area: identificazione · stato: non_conforme · gravita: alta · priorita: P1
- rischio: un mittente falsificato, un indirizzo condiviso (per esempio del genitore separato) o un indirizzo diverso da quello registrato ricevono i dati di un altro. Gli allegati non sono cifrati e tra i dati possono esserci note di salute e documenti d'identità.
- riferimenti: GDPR artt. 12(2),(6), 15(4), 5(1)(f), 32; EDPB Linee guida 01/2022 sul diritto di accesso (da verificare in versione).
- evidenze: `docs/procedura-diritti.md:6`.
- lacune: non c'è un confronto con l'email registrata in `users.email`. Non è previsto un controllo proporzionato, per esempio un link verso l'area personale o una conferma dall'indirizzo registrato. Non è prevista una consegna sicura.
- raccomandazione: rispondere solo all'indirizzo registrato o tramite l'area autenticata. Chiedere informazioni aggiuntive solo in caso di dubbio ragionevole, senza raccogliere documenti in eccesso. Non allegare dati in chiaro.
- responsabile_suggerito: titolare / DPO; Software Agency per il canale sicuro.
- verifica: TC-01, TC-02.

**R2. Termine di 60 giorni**
- id: AIPCA-08-R2 · area: tempi · stato: non_conforme · gravita: alta · priorita: P1
- rischio: le risposte arrivano sistematicamente in ritardo e l'interessato può reclamare al Garante.
- riferimenti: art. 12(3): un mese, prorogabile di due mesi solo se la richiesta è complessa o se le richieste sono molte, informando l'interessato entro il primo mese.
- evidenze: `docs/procedura-diritti.md:8`.
- lacune: la procedura non prevede la proroga motivata né la data di scadenza calcolata.
- raccomandazione: fissare il termine a un mese dalla ricezione e documentare la proroga solo nei casi previsti.
- responsabile_suggerito: titolare.
- verifica: TC-10.

**R3. Costo di 10 € per l'accesso**
- id: AIPCA-08-R3 · area: costi · stato: non_conforme · gravita: alta · priorita: P1
- rischio: il costo ostacola l'esercizio del diritto.
- riferimenti: art. 12(5) (gratuità; contributo o rifiuto solo per richieste manifestamente infondate o eccessive); art. 15(3) (prima copia gratuita, contributo ragionevole solo per le copie ulteriori).
- evidenze: `docs/procedura-diritti.md:9`.
- lacune: non c'è nessun criterio per le richieste eccessive.
- raccomandazione: rendere l'accesso gratuito. Prevedere un eventuale contributo solo per le copie ulteriori o per le richieste manifestamente eccessive, con motivazione scritta.
- responsabile_suggerito: titolare.
- verifica: revisione documentale della procedura.

**R4. L'export di accesso è incompleto e non contiene le informazioni dell'art. 15(1)**
- id: AIPCA-08-R4 · area: accesso · stato: non_conforme · gravita: alta · priorita: P1
- rischio: la risposta all'accesso risulta parziale. Mancano proprio i dati più delicati.
- riferimenti: art. 15(1)-(3).
- evidenze: `src/account.js:5-6` estrae solo:
  - da `users`: id, email, role, newsletter, created_at;
  - da `students`: nome, cognome, data_nascita, telefono, livello.

  Non estrae, rispetto a `db/schema.sql`:
  - da `users`: `marketing_consent`, `marketing_consent_at`;
  - da `students`: `luogo_nascita`, `codice_fiscale`, `note_salute` (dato di salute, art. 9);
  - da `payers`: nome, CF, indirizzo, documento;
  - le tabelle `invoices`, `enrollments`, `bookings` (con le presenze), `messages`;
  - `recordings`/`transcript`, che hanno solo `class_id` e quindi non sono collegati alla persona: `schema.sql:68-74`;
  - le voci di `audit_log` che riguardano l'interessato.
- lacune:
  - l'export non dice finalità, destinatari (LessonCam, Mailorbit, InsightAI, TextBlast, il servizio di statistiche d'uso), trasferimenti extra-SEE e garanzie, tempi di conservazione, origine dei dati, diritto di reclamo;
  - per chi non ha un account (per esempio un ex studente o un insegnante cancellato) c'è solo la via email, senza strumenti;
  - il ruolo `support`/`admin` non ha una funzione per estrarre i dati di un interessato (`server.js:28-29`), quindi le richieste via email si evadono a mano senza traccia.
- raccomandazione:
  - completare l'export con tutte le tabelle che riguardano l'interessato;
  - allegare le informazioni dell'art. 15(1), riprese dall'informativa;
  - aggiungere un'estrazione in back-office tracciata per la segreteria;
  - definire come si dà accesso a registrazioni e trascrizioni.
- responsabile_suggerito: Software Agency (backend); titolare per i contenuti.
- verifica: TC-03, TC-04.

**R5. Un genitore può scaricare i dati del figlio diventato maggiorenne**
- id: AIPCA-08-R5 · area: accesso / divulgazione a terzi · stato: non_conforme · gravita: media · priorita: P2
- rischio: dati del figlio maggiorenne o ormai autonomo vengono comunicati al genitore.
- riferimenti: artt. 5(1)(f), 15(4); art. 2-quinquies Codice privacy.
- evidenze: `src/account.js:6` (`WHERE user_id = $1 OR parent_id = $1`, senza nessun controllo dell'età). Lo schema non toglie mai `parent_id` (`db/schema.sql:18`).
- lacune:
  - nessuna verifica della responsabilità genitoriale al momento del collegamento;
  - nessuna regola per gli studenti tra i 14 anni e la maggiore età (la procedura, `procedura-diritti.md:7`, dice che possono presentare le richieste da sé, ma non dice se il genitore conserva l'accesso);
  - il signup (`auth.js:16-26`) non verifica l'età, quindi un minore di 14 anni può iscriversi da solo e prestare il consenso alla newsletter (`auth.js:20`): art. 8 GDPR, art. 2-quinquies.
- raccomandazione:
  - escludere dall'export del genitore i figli maggiorenni;
  - definire la regola per la fascia tra i 14 e i 18 anni;
  - verificare il legame genitoriale in modo proporzionato;
  - bloccare il consenso marketing sotto i 14 anni.

  La regola esatta va decisa dal titolare con il consulente legale.
- responsabile_suggerito: titolare / legale; Software Agency.
- verifica: TC-05, TC-06.

**R6. La cancellazione è solo logica e non arriva a copie, fornitori, staging e backup**
- id: AIPCA-08-R6 · area: cancellazione / propagazione · stato: non_conforme · gravita: alta · priorita: P1
- rischio: l'account risulta «cancellato subito» (procedura-diritti.md:10, account.js:15), ma i dati restano quasi tutti.
- riferimenti: artt. 17(1)-(3), 19, 5(1)(e).
- evidenze:
  - `src/account.js:13` imposta solo `users.deleted_at`. Restano:
    - `students`, comprese le note di salute;
    - `payers`, con la scansione del documento: `documento_key`, `schema.sql:37`;
    - `bookings`, `enrollments`, `messages`;
    - l'email resta in `users.email` (UNIQUE).
  - Se cancella un genitore, i profili dei figli collegati restano senza indicazioni.
  - Le statistiche d'uso ricevono l'email come identificativo (`auth.js:11,27`, `analytics.js:5`) e non ricevono nessuna cancellazione.
  - Mailorbit: `nightlySync` (`newsletter.js:12-15`) esclude i cancellati dall'upsert, ma non risulta che li rimuova dalla lista. `vendors/mailorbit.js` manca, quindi la rimozione è `non_verificabile`.
  - InsightAI (audio e trascrizioni, termini che consentono il riuso per addestrare i modelli, accordo art. 28 «in attesa», `fornitori.md:11,15`) e LessonCam non ricevono nessuna propagazione.
  - Lo staging contiene una copia integrale della produzione, «con dati veri» (`scripts/refresh-staging.sh:2-6`). I dati cancellati in produzione restano in staging fino al refresh successivo.
  - I backup durano 120 mesi, senza cifratura, con una copia a Singapore (`config/backup.yml:5,10,13`). Non c'è una procedura per i backup ripristinati.
  - L'eccezione per le fatture (art. 17(3)(b), art. 2220 c.c.) è pertinente, ma va limitata a `invoices` e ai dati fiscali strettamente necessari di `payers`. Non giustifica la conservazione del documento d'identità, delle note di salute, delle presenze e dei messaggi.
- lacune: nessuna mappa dei sistemi da propagare; nessuna comunicazione ai destinatari (art. 19); nessun modo di gestire le richieste di cancellazione arrivate per email.
- raccomandazione:
  - cancellare o anonimizzare per categoria di dato, conservando solo quanto è coperto dall'eccezione documentata;
  - propagare la cancellazione a Mailorbit, alle statistiche d'uso, a InsightAI e a LessonCam;
  - escludere i dati reali dallo staging;
  - documentare come si trattano i backup (cancellazione alla scadenza e riapplicazione delle cancellazioni dopo un ripristino);
  - chiedere una conferma prima della cancellazione definitiva.

  La politica di conservazione va coordinata con il Data Governance (AIPCA) e quella dei fornitori con il Vendor Compliance.
- responsabile_suggerito: titolare; Software Agency; DPO.
- verifica: TC-07, TC-08, TC-09.

**R7. Chi si disiscrive continua a ricevere la newsletter (e chiunque può disiscrivere un altro)**
- id: AIPCA-08-R7 · area: opposizione / revoca del consenso · stato: non_conforme · gravita: alta · priorita: P1
- rischio: l'invio di marketing continua dopo la revoca.
- riferimenti: artt. 7(3), 21(2)-(3); art. 130 Codice privacy (da verificare).
- evidenze:
  - `src/newsletter.js:7` imposta solo `newsletter = false`;
  - `nightlySync` seleziona `WHERE u.marketing_consent` (`newsletter.js:13`), che resta `true`, quindi l'utente torna nella lista ogni notte;
  - l'endpoint non richiede autenticazione e prende l'email dalla query (`newsletter.js:6`, `server.js:30`), senza token firmato: chiunque può disiscrivere un indirizzo altrui;
  - l'area personale non offre un modo per revocare il consenso;
  - il consenso non ha una versione o un testo associato (solo `marketing_consent_at`, `schema.sql:10`).
- lacune: nessuna propagazione immediata a Mailorbit e nessun registro delle revoche.
- raccomandazione:
  - fare in modo che la disiscrizione azzeri anche `marketing_consent` e lo comunichi subito a Mailorbit;
  - usare un link con token firmato;
  - aggiungere la revoca nell'area personale;
  - registrare la revoca.
- responsabile_suggerito: Software Agency.
- verifica: TC-11, TC-12.

**R8. Rettifica, limitazione e revoca del consenso alle note di salute non hanno un processo**
- id: AIPCA-08-R8 · area: rettifica / limitazione / revoca del consenso · stato: non_conforme · gravita: media · priorita: P2
- rischio: le richieste vengono ignorate o evase con modifiche manuali al database, senza traccia.
- riferimenti: artt. 16, 18, 19, 7(3), 9(2)(a).
- evidenze:
  - in `server.js` non c'è nessuna rotta per la rettifica o la limitazione;
  - la procedura (`procedura-diritti.md:5`) non cita la limitazione;
  - le note di salute vengono raccolte al signup (`auth.js:17,25`, `public/index.html:19`) ma non si possono togliere;
  - le note finiscono nel CSV dell'insegnante, per tutta la scuola e non solo per la classe (`export.js:9`; il perimetro va al Privacy Security Engineer).
- lacune: nessun flag di limitazione nello schema; nessuna comunicazione della rettifica ai destinatari (art. 19).
- raccomandazione: aggiungere la modifica dei propri dati e la rimozione delle note di salute dall'area personale; per la limitazione, un flag con l'effetto descritto; aggiornare la procedura.
- responsabile_suggerito: Software Agency; titolare.
- verifica: TC-13, TC-14.

**R9. Workflow, tracciamento e prova dell'evasione**
- id: AIPCA-08-R9 · area: workflow / accountability · stato: non_conforme · gravita: media · priorita: P2
- rischio:
  - richieste perse, per esempio durante le assenze della responsabile;
  - nessuna prova di aver risposto;
  - dati delle richieste conservati in una casella personale.
- riferimenti: artt. 5(2), 12(1),(3),(4), 24.
- evidenze:
  - la responsabile usa la sua casella personale come canale e come archivio (`procedura-diritti.md:5,13`);
  - la voce `account_deleted` (`account.js:14`) viene cancellata dopo 90 giorni (`purge.js:9`, `retention.json:3`);
  - le richieste via export non vengono registrate (`account.js:4-8`).
- lacune:
  - nessun registro (data di ricezione, tipo, identificazione, assegnatario, scadenza, esito, motivazione);
  - nessun sostituto;
  - nessun modello di risposta che comprenda il rifiuto motivato e il diritto di reclamo (art. 12(4));
  - nessuna eccezione documentata oltre a quella fiscale.
- raccomandazione:
  - creare una casella funzionale condivisa e un registro delle richieste con conservazione definita;
  - prevedere le scadenze calcolate e un sostituto;
  - preparare i modelli di risposta;
  - stabilire una conservazione per la prova dell'evasione distinta da quella dei log applicativi.
- responsabile_suggerito: titolare / DPO.
- verifica: TC-10, TC-15.

**R10. I log possono contenere dati personali che restano fuori dall'accesso e dalla cancellazione**
- id: AIPCA-08-R10 · area: propagazione · stato: parzialmente_conforme · gravita: bassa · priorita: P3
- rischio: i dati inviati restano nei log anche dopo la cancellazione.
- riferimenti: artt. 15, 17, 5(1)(c).
- evidenze: in caso di errore `logRequestBodyOnError: true` registra il corpo della richiesta (`config/default.json:5`, `logger.js:14`). Il redact copre solo la password (`default.json:4`), quindi nei log possono finire note di salute, telefono e data di nascita del signup.
- lacune: la conservazione dei log pino non è documentata.
- raccomandazione: togliere il corpo della richiesta dai log o mascherare i campi personali; documentare la conservazione dei log.
- responsabile_suggerito: Software Agency.
- verifica: TC-16.

**Fuori dal mio perimetro, da passare al Chief.** Questi punti incidono sulla propagazione delle richieste ma vanno valutati dagli altri specialisti:
- Mailorbit dichiara come garanzia il «Privacy Shield» (`fornitori.md:10`), invalidato nel 2020 (sentenza Schrems II, da verificare l'eventuale adesione attuale al DPF);
- InsightAI non ha un accordo art. 28 e i suoi termini consentono il riuso per l'addestramento;
- la copia di backup a Singapore non è cifrata;
- nel repository c'è una chiave di cifratura in chiaro (`config/default.json:8`), per il Security.

## Casi di test sintetici

Da eseguire solo in un ambiente di test con dati finti, mai in produzione o in staging con dati reali.

| ID | Diritto | Preparazione (dati sintetici) | Azione | Risultato atteso |
|---|---|---|---|---|
| TC-01 | Identificazione | studente finto `anna.test@example.invalid` | email di accesso da `altro@example.invalid` a nome di Anna | nessun dato inviato; risposta solo all'indirizzo registrato o tramite l'area autenticata |
| TC-02 | Identificazione | come TC-01 | richiesta con mittente falsificato uguale a quello registrato | conferma richiesta all'indirizzo registrato o via login; nessun allegato in chiaro |
| TC-03 | Accesso | studente finto con note di salute, CF, prenotazioni, messaggio, iscrizione, fattura del pagatore | `GET /me/export` | sono presenti tutte le categorie, più le informazioni dell'art. 15(1) (oggi manca il punto R4) |
| TC-04 | Accesso offline | ex studente senza account attivo | richiesta via email | la segreteria estrae i dati con uno strumento tracciato e risponde entro un mese |
| TC-05 | Minori | genitore finto con figlio nato 18 anni e 1 giorno fa | il genitore chiama `/me/export` | i dati del figlio maggiorenne non vengono restituiti |
| TC-06 | Minori | iscrizione con data di nascita che indica 12 anni e newsletter selezionata | `POST /signup` | consenso marketing non registrato; percorso con il genitore |
| TC-07 | Cancellazione | studente finto con tutte le tabelle popolate, nella lista Mailorbit di test e negli eventi delle statistiche d'uso | `POST /me/delete` | `students`, `bookings`, `messages`, note di salute e documento d'identità cancellati o anonimizzati; restano solo i dati di `invoices`/`payers` coperti dall'eccezione; il contatto viene rimosso da Mailorbit e dalle statistiche d'uso |
| TC-08 | Cancellazione e propagazione | come TC-07, più un refresh dello staging di test | dopo la cancellazione, si controlla lo staging e si simula il ripristino di un backup | i dati cancellati non ricompaiono; la cancellazione viene riapplicata dopo il ripristino |
| TC-09 | Cancellazione del genitore | genitore finto con due figli | `POST /me/delete` dal genitore | regola definita per i profili dei figli; nessun profilo orfano senza titolare |
| TC-10 | Tempi e registro | richiesta registrata il giorno G | controllo del registro | scadenza a G + 1 mese; proroga solo motivata e comunicata entro il primo mese |
| TC-11 | Revoca del marketing | utente finto con consenso marketing | clic su «disiscriviti», poi `nightlySync` | `marketing_consent = false`; l'utente non è nella lista Mailorbit (oggi fallisce: R7) |
| TC-12 | Integrità della disiscrizione | utente finto B | `GET /newsletter/unsubscribe?email=B` senza token | richiesta rifiutata o confermata solo con token firmato |
| TC-13 | Rettifica | studente finto con telefono sbagliato | correzione dall'area personale o via richiesta | dato aggiornato, operazione tracciata, destinatari informati (art. 19) |
| TC-14 | Revoca del consenso ai dati di salute | studente finto con note di salute | richiesta di rimozione | note rimosse, anche dal CSV dell'insegnante |
| TC-15 | Accountability | cancellazione eseguita al giorno 0 | controllo al giorno 120 | prova dell'evasione ancora disponibile nel registro delle richieste |
| TC-16 | Log | signup che fallisce con note di salute finte | lettura del log degli errori | nessun campo personale nel log |

## Riepilogo

- 6 rilievi P1: R1, R2, R3, R4, R6, R7.
- 3 rilievi P2: R5, R8, R9.
- 1 rilievo P3: R10.
- Nessun P0.

**Punti da chiarire.**
- Non sono verificabili, perché i file mancano nella copia: `vendors/mailorbit.js` (rimozione dalla lista), `public/privacy.html` (informativa, art. 12(1)), la conservazione dei log pino e la base giuridica delle statistiche d'uso.
- Le scelte sulle eccezioni alla cancellazione, sulla regola per i minori e sui tempi vanno decise dal titolare con il consulente legale e il DPO.
- Le correzioni spettano alla Software Agency, dopo l'approvazione dell'utente.

— AIPCA-08 · PHECDA
