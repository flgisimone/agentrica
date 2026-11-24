**AIPCA-08 · PHECDA — Senior Data Subject Rights Specialist, reparto AIPCA (AI Privacy & Compliance)**

Audit in sola lettura di `docs/procedura-diritti.md` e del codice nella copia assegnata. Direttore (AIPCA-01) e biblioteca non caricati, come previsto dalla prova. La scheda `legge-132-2025-ia` non è stata consultata: non cito la L. 132/2025 e non so se tocca la trascrizione di voci di minori. Gli articoli GDPR sono citati dalle mie conoscenze, da verificare sulla fonte.

**Segnalazione al direttore e a un revisore su Opus.** Sono su Sonnet. Prima che diventino definitivi vanno riesaminati i rilievi P1: DSR-01, 02, 03, 04, 05, 06 e 07. DSR-05 ha il fatto più grave: il codice continua a sincronizzare con Mailorbit chi si è disiscritto. Non è un P0 perché non ho evidenza di invii già avvenuti.

## Matrice diritto / workflow / evidenza

| Diritto | Workflow dichiarato | Evidenza nel codice | Stato |
|---|---|---|---|
| Art. 12: modalità, tempi, costi, identificazione | Procedura righe 6, 8, 9 | Nessun codice per le richieste via email | `non_conforme` (DSR-01, 02, 03) |
| Art. 15: accesso | Via email (10 euro) o `/me/export` (proc. 8) | `src/account.js:4-8`, `src/server.js:28` | `non_conforme` (DSR-02, 07) |
| Art. 16: rettifica | Citata come «gratuita» (proc. 5), nessun passo operativo | Nessun endpoint o funzione di modifica | `non_conforme` (DSR-09) |
| Art. 17: cancellazione | «Si cancella subito» (proc. 6) | `src/account.js:11-16`: solo `deleted_at` | `non_conforme` (DSR-04) |
| Art. 18: limitazione | Assente | Nessuna | `non_conforme` (DSR-10) |
| Art. 19: notifica ai destinatari | Assente | Mailorbit, InsightAI, LessonCam e backup non sono toccati | `non_conforme` (DSR-06) |
| Art. 20: portabilità | `/me/export`, JSON (proc. 8) | `src/account.js:7`: JSON parziale, nessun invio diretto | `parzialmente_conforme` (DSR-07) |
| Art. 21 (marketing) e art. 7(3) revoca del consenso | Link «disiscriviti» (proc. 7) | `src/newsletter.js:5-9` e `:12-15` | `non_conforme` (DSR-05) |
| Art. 21(1): opposizione ai trattamenti diversi dal marketing | Assente | Nessuna | `non_verificabile` (DSR-10) |
| Minorenni (art. 8 e responsabilità genitoriale) | Proc. 3: sotto i 14 anni il genitore, dai 14 lo studente | `src/auth.js:17-21`: nessuna verifica del legame genitore e figlio | `parzialmente_conforme` (DSR-08) |
| Tracciamento e responsabilità (art. 5(2)) | Email nella casella personale (proc. 5, 9) | `src/purge.js:9`, `config/retention.json:3` | `non_conforme` (DSR-11) |
| Art. 13: informazione sui diritti | `public/index.html:24` rimanda a `/privacy.html` | `/privacy.html` non è nel repository | `non_verificabile` |
| Art. 22: decisioni automatizzate | — | Non ne ho viste | `non_applicabile` (allo stato dei file) |

## Rilievi

Tutte le correzioni sono raccomandazioni: l'attuazione spetta alla Software Agency, previa approvazione umana.

**DSR-01 · Identificazione tramite l'indirizzo del mittente. P1.**
- Evidenze: `docs/procedura-diritti.md:6`. Si risponde all'indirizzo da cui arriva la richiesta, allegando i dati.
- Rischio: un mittente falsificato o un account email compromesso ottiene i dati personali di terzi. Tra i dati ci sono quelli di minori, note di salute e codice fiscale. È la divulgazione a terzi che il ruolo deve prevenire (artt. 12(6) e 32).
- Lacune: nessun controllo proporzionato, né sull'email registrata né con un canale già autenticato.
- Raccomandazione: far uscire i dati solo dall'area personale. Per chi non ha accesso, chiedere una verifica sull'email registrata (link o codice) e informazioni già note, e solo se non bastano altro in modo proporzionato. Non allegare mai i dati a una risposta email.
- Verifica: caso T1.

**DSR-02 · Costo di 10 euro per l'accesso. P1.**
- Evidenze: `docs/procedura-diritti.md:9`.
- Rischio: art. 12(5) e art. 15(3): la prima copia è gratuita. Si può addebitare un contributo solo per copie ulteriori, o per richieste manifestamente infondate o eccessive, motivandolo. Un addebito generalizzato scoraggia l'esercizio del diritto.
- Raccomandazione: eliminare il costo per la prima richiesta. Documentare i criteri per il caso eccessivo o infondato.
- Verifica: caso T2.

**DSR-03 · Termine di 60 giorni. P1.**
- Evidenze: `docs/procedura-diritti.md:8`.
- Rischio: art. 12(3): risposta senza ritardo e comunque entro un mese. La proroga massima è di due mesi, solo se necessaria per complessità o numero di richieste, comunicata entro il primo mese con i motivi. Il termine fisso di 60 giorni è oltre il limite.
- Raccomandazione: un mese, con proroga motivata e comunicata entro il primo mese. Prevedere i casi di rifiuto con motivazioni e indicazione del reclamo al Garante (art. 12(4)).
- Verifica: caso T3.

**DSR-04 · Cancellazione solo apparente. P1.**
- Evidenze: `src/account.js:11-16` e `docs/procedura-diritti.md:10`.
  - `deleteMine` fa solo `UPDATE users SET deleted_at`. `students`, `payers`, `invoices`, `messages`, `bookings` e `recordings` (con le trascrizioni) restano. Il documento d'identità del genitore (`payers.documento_key`) resta nello storage.
  - `src/purge.js` non cancella né anonimizza nulla in base a `deleted_at`.
  - Il messaggio all'utente («Account cancellato») e la procedura («si cancella subito») descrivono una cosa che non avviene.
  - Solo le fatture hanno un obbligo di conservazione (art. 17(3)(b)). Le altre categorie non hanno nessuna eccezione documentata.
- Rischio: art. 17, e possibile informazione inesatta all'interessato (art. 12).
- Lacune: nessuna eccezione motivata per i dati diversi dalle fatture, nessuna anonimizzazione, nessun job di cancellazione definitiva dopo un periodo di grazia.
- Raccomandazione:
  - Definire per categoria cosa si cancella, cosa si anonimizza e cosa si trattiene (fatture, 10 anni, art. 2220 c.c.). Non presumere che la cancellazione sia sempre dovuta: la decisione va per categoria e col titolare.
  - Cancellare o anonimizzare il resto, incluso il documento nello storage.
  - Correggere il messaggio e la procedura.
  - Registrare l'esito della richiesta.
- Verifica: caso T4.

**DSR-05 · Opposizione al marketing e revoca del consenso inefficaci. P1.**
- Evidenze:
  - `src/newsletter.js:7` pone solo `newsletter = false`.
  - `src/newsletter.js:13` allinea Mailorbit con `WHERE u.marketing_consent`, che resta vero. L'utente disiscritto continua a essere nella lista e potenzialmente a ricevere la newsletter.
  - `src/auth.js:20` imposta `newsletter` e `marketing_consent` insieme alla registrazione, ma la revoca non li allinea.
  - `marketing_consent_at` non registra la revoca.
  - `upsertList` non risulta rimuovere i contatti.
  - `src/server.js:30`: l'endpoint è un GET non autenticato con `?email=`. Chiunque può disiscrivere un altro indirizzo.
- Rischio: artt. 7(3), 21(2) e 21(3). Il marketing prosegue dopo l'opposizione. Rischio parallelo di abuso sull'endpoint.
- Raccomandazione:
  - Un solo campo di verità per il consenso. La revoca imposta `marketing_consent = false` e registra data e ora.
  - Rimuovere il contatto dalla lista Mailorbit.
  - Link di disiscrizione con token firmato per utente, non l'email.
  - Una preferenza nell'area personale che permetta di revocare con la stessa facilità con cui si è dato il consenso.
- Verifica: caso T5.

**DSR-06 · Nessuna propagazione ai destinatari e ai backup (art. 19). P1.**
- Evidenze:
  - `docs/fornitori.md` elenca Mailorbit, InsightAI, LessonCam e Nimbus. Nessun passo della procedura prevede di comunicare cancellazioni, rettifiche o limitazioni.
  - `config/backup.yml:8-14`: backup notturni, retention mensile fino a 120 mesi, copia a Singapore, `last_restore_test: null`. I dati cancellati restano nei backup fino a dieci anni.
  - `scripts/refresh-staging.sh:4-6` copia la produzione in staging, utenti già cancellati compresi.
  - InsightAI: accordo art. 28 «in attesa», possibile uso dei contenuti per addestrare i modelli (`docs/fornitori.md:15`). Una cancellazione lì sarebbe difficile da garantire.
- Raccomandazione:
  - Elenco dei destinatari per ogni richiesta, con conferma.
  - Una procedura che riapplichi le cancellazioni dopo ogni ripristino.
  - Una scadenza dei backup coerente con la retention dei dati.
  - Segnalare i temi di backup, trasferimenti, InsightAI e staging ai colleghi del reparto: sono di loro competenza.
- Verifica: caso T4.

**DSR-07 · Esportazione incompleta (artt. 15 e 20). P1.**
- Evidenze: `src/account.js:5-7`. Esporta solo `users` (campi limitati) e `students` (`nome, cognome, data_nascita, telefono, livello`).
- Lacune: mancano `luogo_nascita`, `codice_fiscale`, `note_salute`, `bookings`, `enrollments`, `payers`, `invoices`, `messages`, `recordings` e trascrizioni, `audit_log` e documento. Mancano anche le informazioni dell'art. 15(1) (finalità, destinatari, conservazione, fonte dei dati, diritti). Per la portabilità il formato JSON va bene (art. 20(1)), ma l'insieme dei dati è parziale e non c'è trasmissione diretta ad altro titolare (art. 20(2)).
- Raccomandazione: allineare l'esportazione al contenuto dell'art. 15, includendo le categorie sopra, oppure documentare l'esclusione di ciascuna. Aggiungere le informazioni accessorie in testo.
- Verifica: caso T2.

**DSR-08 · Minori e responsabilità genitoriale. P2.**
- Evidenze:
  - `docs/procedura-diritti.md:7`: sotto i 14 anni il genitore, dai 14 lo studente «da sé».
  - `src/account.js:6`: il genitore (`parent_id`) vede anche i dati del figlio indipendentemente dall'età.
  - `src/auth.js:17-21`: la registrazione crea sempre il ruolo `student` e non verifica età né legame con un genitore.
- Rischio: procedura e codice non coincidono. Il codice dà al genitore l'accesso anche dopo i 14 anni, la procedura lo toglie. Manca inoltre la verifica che chi chiede come genitore lo sia davvero. La soglia dei 14 anni deriva dalla norma italiana sul consenso ai servizi della società dell'informazione (D.Lgs. 196/2003 art. 2-quinquies). Se valga allo stesso modo per l'esercizio dei diritti del minore va chiesto al legale.
- Raccomandazione: parere del legale sul regime tra 14 e 18 anni. Definire e allineare codice e procedura. Specificare come si verifica la responsabilità genitoriale.
- Verifica: caso T6.

**DSR-09 · Rettifica senza processo (art. 16). P2.**
- Evidenze: `docs/procedura-diritti.md:9` dichiara la rettifica gratuita. Nessun passo operativo, nessun endpoint o funzione di modifica nel codice.
- Raccomandazione: definire il passo (da chi, entro quanto) e, se utile, una funzione di modifica dei dati dall'area personale.
- Verifica: caso T7.

**DSR-10 · Limitazione e opposizione non marketing assenti. P2.**
- Evidenze: la procedura (riga 5) cita solo l'opposizione, e nel codice non c'è nulla sulla limitazione. `src/analytics.js:5` invia l'email dell'utente come `userId` a un servizio di statistiche: è una possibile base per un'opposizione ex art. 21(1) che oggi non ha strada.
- Raccomandazione: aggiungere limitazione (art. 18) e opposizione generale (art. 21(1)) alla procedura, con un modo tecnico per marcare un record come limitato.
- Verifica: caso T8.

**DSR-11 · Tracciamento e responsabilità. P2.**
- Evidenze:
  - `docs/procedura-diritti.md:5,13`: le richieste arrivano a un indirizzo personale (`m.fabbri@…`) e si conservano nella casella della responsabile. Non ci sono registro, scadenze, assegnazione né sostituto in caso di assenza.
  - `src/purge.js:9` e `config/retention.json:3`: `audit_log` si cancella dopo 90 giorni. La traccia di `account_deleted` sparisce prima che possa servire come evidenza (art. 5(2)). Il log non registra gli accessi o le esportazioni fatte dall'interessato (`/me/export`).
- Raccomandazione: un canale e un registro delle richieste (data, tipo, esito, scadenza, destinatari). Un indirizzo di funzione, non personale. Una conservazione del registro adeguata, anche dopo la cancellazione dei dati: quanto conservare lo decide il titolare.
- Verifica: caso T9.

## Casi di test sintetici

Usare solo dati finti in staging. Nota: lo staging oggi è alimentato da dati reali (DSR-06), quindi serve prima un ambiente con dati sintetici.

- **T1** — Email di richiesta di accesso da un mittente falsificato per uno studente fittizio. Atteso: nessun dato rilasciato senza verifica.
- **T2** — Utente fittizio con tutte le categorie di dati (studente, pagante, fatture, registrazioni, messaggi). Atteso: l'esportazione contiene tutto o dichiara le esclusioni; la prima copia è gratuita.
- **T3** — Richiesta con data nota e simulazione del giorno 31 e del giorno 61. Atteso: risposta o proroga motivata entro un mese.
- **T4** — Cancellazione dell'account fittizio. Atteso: dati personali cancellati o anonimizzati, tranne le fatture. Controllare tabelle, documento nello storage, trascrizioni, Mailorbit, backup e staging.
- **T5** — Iscrizione con consenso marketing, poi disiscrizione. Atteso: `marketing_consent = false`, assenza dalla lista Mailorbit alla sincronizzazione successiva, link con token non indovinabile.
- **T6** — Studente fittizio di 12 anni, uno di 15, richiesta presentata da un falso genitore. Atteso: regole coerenti e verifica del legame.
- **T7** — Rettifica di un dato di un utente fittizio. Atteso: aggiornato e notificato ai destinatari.
- **T8** — Limitazione del trattamento di un record. Atteso: il record è marcato e non è usato né esportato nei flussi non necessari.
- **T9** — Tre richieste fittizie con scadenze diverse. Atteso: ognuna registrata con data, scadenza ed esito; il registro sopravvive alla cancellazione dei dati.

## Cosa non ho potuto verificare

- `/privacy.html` e gli altri moduli (`db`, `storage`, `vendors/mailorbit`) non sono nel repository.
- Non so se `upsertList` rimuova contatti o se esistano altri canali di marketing.
- Non so come siano gestite le richieste reali già ricevute.

Nessun file modificato, nessun processo avviato.

— AIPCA-08 · PHECDA
