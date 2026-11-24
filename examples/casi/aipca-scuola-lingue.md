# Caso AIPCA · scuola-lingue (F37, prima ondata)

- **Agenti**: quattro specialisti AIPCA, ognuno con il suo compito: AIPCA-05 Privacy Security, AIPCA-06 Data Governance, AIPCA-07 Vendor, AIPCA-08 Data Subject Rights
- **Progetto**: [`progetti/scuola-lingue`](../progetti/scuola-lingue/), piattaforma di una scuola di lingue online con studenti anche minorenni: codice (`src/`), schema (`db/`), configurazioni (`config/`), script, pagina d'iscrizione, registro dei fornitori e procedura per i diritti (`docs/`)
- **Perché**: ruoli privacy simili ad AIPCA-02, passato su Sonnet in F24, su difetti che stanno fra documenti e codice (il documento dice una cosa, il codice ne fa un'altra) e con dati di minori e categorie particolari.

## Compiti (argomento `task`, da copiare così come sono)

| Agente | Compito |
|---|---|
| AIPCA-05 | Esamina in sola lettura le misure tecniche a protezione dei dati personali di questo progetto (accessi ed esportazioni, cifratura e chiavi, log, backup e ripristino, ambienti) e consegna la matrice controllo/evidenza/esito con le lacune, con priorità, file e riga. |
| AIPCA-06 | Mappa in sola lettura i dati personali di questo progetto (database, file, log, statistiche d'uso, backup, ambienti di prova) e valuta minimizzazione, conservazione e cancellazione: consegna l'inventario e la matrice della conservazione con le lacune, con priorità, file e riga. |
| AIPCA-07 | Esamina in sola lettura i fornitori e i servizi esterni che trattano dati personali in questo progetto (registro in `docs/fornitori.md` e integrazioni nel codice e nelle configurazioni): consegna il registro con ruoli, luoghi, trasferimenti e garanzie, e le lacune con priorità, file e riga. |
| AIPCA-08 | Verifica in sola lettura come questo progetto gestisce i diritti degli interessati (procedura in `docs/procedura-diritti.md` e funzioni nel codice): consegna la matrice diritto/workflow/evidenza con i casi di test sintetici e le lacune, con priorità, file e riga. |

## AIPCA-05 · Privacy Security

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| P1 | Dump del database senza cifratura (`encryption: none`, «il bucket è privato»), copiato anche fuori sede | `config/backup.yml` | art. 32(1)(a) |
| P2 | Ripristino dei backup mai provato (`last_restore_test: null`) | `config/backup.yml` | art. 32(1)(c)(d) |
| P3 | L'esportazione per l'insegnante filtra per `school_id`, non per classe: un insegnante scarica tutti gli studenti della scuola, con telefono, data di nascita e note di salute | `src/export.js`, `studentsCsv` | art. 25, art. 32, privilegio minimo |
| P4 | Con `logRequestBodyOnError` il corpo delle richieste finisce nei log in caso di errore: note di salute (art. 9), telefono e dati dei minori; `redact` copre solo la password | `config/default.json`, `src/logger.js` | art. 32, art. 9 |
| P5 | Chiave di cifratura dei documenti d'identità scritta in `config/default.json`, nel repository, e la stessa per staging (che eredita la configurazione) | `config/default.json`, `src/documents.js` | art. 32, gestione delle chiavi |

## AIPCA-06 · Data Governance

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| G1 | `students.codice_fiscale` e `students.luogo_nascita` non servono a nessuna funzione (la fattura usa il codice fiscale del pagatore in `payers`): campi eccedenti, anche di minori | `db/schema.sql` | art. 5(1)(c) |
| G2 | La cancellazione dell'account è solo logica (`deleted_at`) e nessun job cancella poi utenti e studenti: i dati restano senza termine | `src/account.js`, `src/purge.js` | art. 5(1)(e), art. 17 |
| G3 | Il job delle registrazioni cancella le righe dopo 30 giorni ma non i file nello storage (né la copia di backup): le registrazioni restano | `src/purge.js` | art. 5(1)(e) |
| G4 | Lo staging si allinea con un dump della produzione e una copia dei file, senza anonimizzazione: dati reali (anche di minori e documenti) in un ambiente di prova | `scripts/refresh-staging.sh` | art. 5(1)(c), art. 25, art. 32 |
| G5 | Le statistiche d'uso usano l'email come `userId`: dati identificativi nelle statistiche, dove basta un identificativo pseudonimo | `src/auth.js`, `src/analytics.js` | art. 5(1)(c), art. 25 |
| G6 | Backup mensili tenuti dieci anni «per sicurezza»: dati cancellati e registrazioni sopravvivono nei backup ben oltre la conservazione dichiarata, senza motivazione | `config/backup.yml`, `config/retention.json` | art. 5(1)(e) |

## AIPCA-07 · Vendor

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| V1 | TextBlast (SMS con il numero di telefono) è usato nel codice ma non è nel registro: nessun accordo, ruolo e luogo sconosciuti | `src/notifications.js`, `docs/fornitori.md` | art. 28, art. 30 |
| V2 | InsightAI tratta la voce di minori negli USA senza accordo firmato e senza garanzie per il trasferimento, e i suoi termini gli permettono di usare i contenuti per i propri modelli: non è un semplice responsabile (fini propri) | `docs/fornitori.md`, `src/transcribe.js` | artt. 28, 44-46 |
| V3 | Mailorbit (USA) ha come garanzia il Privacy Shield, invalidato dalla Corte di giustizia nel 2020 (Schrems II, C-311/18): serve DPF (se il fornitore è iscritto) o SCC | `docs/fornitori.md` | artt. 45-46 |
| V4 | Coldvault (Singapore) riceve una copia completa dei backup ma non è nel registro: fornitore senza accordo e trasferimento fuori dal SEE senza garanzie | `config/backup.yml`, `docs/fornitori.md` | artt. 28, 44-46 |
| V5 | La certificazione ISO 27001 di LessonCam copre gli uffici di Dublino, non il servizio, ed è scaduta il 2025-12-31 | `docs/fornitori.md` | art. 28(1), art. 32 |
| V6 | Il widget di ChatNow nella pagina d'iscrizione (script di terze parti, messaggi dei visitatori) non è nel registro | `public/index.html`, `docs/fornitori.md` | art. 28, art. 30 |

## AIPCA-08 · Data Subject Rights

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| D1 | `/me/export` restituisce solo utente e studenti: mancano prenotazioni e presenze, fatture e pagatori, note di salute, messaggi, registrazioni e trascrizioni | `src/account.js`, `exportMine` | art. 15, art. 20 |
| D2 | La cancellazione imposta `deleted_at` e basta: nessuna cancellazione dei dati degli studenti né comunicazione a Mailorbit, TextBlast e InsightAI | `src/account.js`, `deleteMine` | art. 17, art. 19 |
| D3 | Per le richieste via email si risponde con i dati all'indirizzo da cui arriva la richiesta, senza confrontarlo con l'account: i dati possono andare a un terzo | `docs/procedura-diritti.md`, punto 2 | art. 12(6), art. 32 |
| D4 | Risposta entro 60 giorni: il termine è un mese, prorogabile di due solo con motivazione comunicata entro il primo mese | `docs/procedura-diritti.md`, punto 4 | art. 12(3) |
| D5 | Il link «disiscriviti» mette `newsletter = false`, ma la sincronizzazione notturna usa `marketing_consent`, che non cambia: chi si oppone torna nella lista di Mailorbit la notte stessa | `src/newsletter.js` | art. 21(2)(3), art. 7(3) |
| D6 | Accesso a pagamento (10 euro): la prima copia è gratuita, un contributo solo per richieste infondate o eccessive o per copie ulteriori | `docs/procedura-diritti.md`, punto 5 | art. 12(5), art. 15(3) |
| D7 | Nessun registro delle richieste: le email restano nella casella personale della responsabile, senza scadenze, assegnazioni né tracciamento | `docs/procedura-diritti.md`, punti 1 e 9 | art. 5(2), art. 12 |

## Trappole: parti corrette da non segnalare come difetto

| # | Cosa | Perché è corretta | Ruoli |
|---|---|---|---|
| T1 | Password con argon2id | funzione adatta | AIPCA-05 |
| T2 | Cookie di sessione `httpOnly`, `secure`, `sameSite`, rigenerazione della sessione al login | configurazione corretta | AIPCA-05 |
| T3 | Documenti d'identità cifrati con AES-256-GCM e accessi registrati in `audit_log` | la cifratura e il tracciamento ci sono (il difetto è dove sta la chiave) | AIPCA-05 |
| T4 | `audit_log` conservato 90 giorni | periodo dei log di sicurezza dichiarato e applicato | AIPCA-05, AIPCA-06 |
| T5 | Fatture conservate dieci anni | obbligo dell'art. 2220 c.c.; eccezione dell'art. 17(3)(b) | AIPCA-06, AIPCA-08 |
| T6 | Registrazioni nel database cancellate dopo 30 giorni | coerente con la finalità del README (il difetto sono i file) | AIPCA-06 |
| T7 | Statistiche d'uso su un server proprio su Nimbus | nessun fornitore nuovo (il difetto è l'email) | AIPCA-06, AIPCA-07 |
| T8 | Nimbus Hosting: dati in Germania, accordo firmato | fornitore UE con accordo | AIPCA-07 |
| T9 | PagaFacile come titolare autonomo, senza accordo art. 28 | tratta i dati della carta nella sua pagina, per fini propri e obblighi di legge | AIPCA-07 |
| T10 | LessonCam negli USA con DPF e SCC 2021/914 | garanzie del trasferimento presenti (il difetto è la certificazione) | AIPCA-07 |
| T11 | Studenti sotto i 14 anni rappresentati dai genitori, dai 14 anni da sé | coerente con l'art. 2-quinquies del Codice privacy | AIPCA-08 |
| T12 | Fatture escluse dalla cancellazione | eccezione dell'art. 17(3)(b) | AIPCA-08 |
| T13 | Esportazione in JSON | formato strutturato e leggibile da macchina (art. 20) | AIPCA-08 |

Un rilievo che presenta una trappola come difetto conta come **falso**; un consiglio di irrobustimento su di essa no.

## Accettabili ma non richiesti

Non contano come falsi né come extra validi.

- **AIPCA-05**: `support` che scarica i documenti d'identità senza motivo registrato; nessun MFA per il personale; nessuna cifratura dichiarata per lo storage; `/newsletter/unsubscribe` senza firma (chiunque disiscrive chiunque); staging con dati reali (G4); l'audit log cancellato insieme agli altri log.
- **AIPCA-06**: messaggi 12 mesi senza motivazione scritta; note di salute nel CSV dell'insegnante; trascrizioni da InsightAI non coperte dalla conservazione del fornitore; nessun registro dei trattamenti; telefono usato per SMS di benvenuto senza consenso; i log con il corpo delle richieste (P4).
- **AIPCA-07**: Mailorbit con l'elenco dei sub-responsabili solo sul sito; nessuna verifica preventiva documentata sui fornitori; storage di staging su Nimbus non nel registro; il registro senza data di revisione dei singoli accordi; l'informativa da aggiornare con i destinatari.
- **AIPCA-08**: `/newsletter/unsubscribe` senza firma; nessuna funzione di rettifica nell'area personale; nessuna procedura per la limitazione; il messaggio «Account cancellato» quando i dati restano; i dati in staging e nei backup non raggiunti dalla cancellazione.

## Chiarimenti dopo la prima ondata (2026-11-24)

Dalle proposte dei valutatori di F37 ([risultato](../risultati/2026-11-23-ondata-1.md)). I conteggi del 2026-11-24 sono stati fatti con la scheda di prima e restano come sono.

- **T4**: chiedere che i 90 giorni dell'`audit_log` siano motivati per iscritto, o notare che possono non bastare a dimostrare accessi ed export, è irrobustimento; presentare la durata come non conforme è falso.
- **T7**: elencare l'endpoint delle statistiche fra i fornitori non registrati è falso; dire che «interno su Nimbus» non è verificabile dal repository è irrobustimento.
- **D2**: conta trovato se il rilievo nomina la cancellazione solo logica e la mancata comunicazione ai destinatari (art. 19), anche senza elencare tutti i fornitori.
- **V2**: conta trovato a qualunque priorità; P0 è la più adatta (voce di minori negli USA senza accordo).

Accettabili aggiunti:

- **AIPCA-05**: CSV injection in `src/export.js`; `/tmp/prod.dump` che resta se `pg_restore` fallisce con `set -e`; login senza limiti ai tentativi; audit trail senza eventi di login e azioni del personale e senza protezione dalla modifica; session store non configurato (MemoryStore); `rclone sync` senza versioni, che propaga cancellazioni e cifratura da ransomware; script ChatNow senza SRI né CSP nella pagina con password e note di salute (l'aspetto di sicurezza; il censimento resta V6).
- **AIPCA-06**: `/tmp/prod.dump` che resta; scansione del documento d'identità senza periodo di conservazione; note di salute senza consenso esplicito o base art. 9 documentata; fatture a dieci anni senza cancellazione alla scadenza; log pino e statistiche senza periodo di conservazione.
- **AIPCA-07**: widget ChatNow caricato prima di qualunque consenso (art. 122 Codice privacy); ISO 27001 di Nimbus limitata al data center e «nessun sub-responsabile» da verificare; destinazione dei log non dichiarata; attestato PCI DSS di PagaFacile senza data; SOC 2 di Mailorbit senza ambito né periodo.
- **AIPCA-08**: il genitore vede con `/me/export` i dati dei figli a qualunque età, contro la soglia dei 14 anni della procedura; risposta all'accesso senza le informazioni dell'art. 15(1)-(2); registrazioni legate solo alla classe; iscrizione senza controllo dell'età e consenso alla newsletter dei minori; cancellazione del genitore senza regola per i profili dei figli; opposizione art. 21(1) alle statistiche d'uso.


## Regole di conteggio

Quelle del [README](../README.md#come-si-conta). Ogni esecuzione si conta solo sulla tabella del suo ruolo: un difetto di un altro ruolo trovato in più non è extra valido ma accettabile. Un riferimento normativo sbagliato (articolo inesistente o che dice altro, il Privacy Shield presentato come valido) conta come falso.
