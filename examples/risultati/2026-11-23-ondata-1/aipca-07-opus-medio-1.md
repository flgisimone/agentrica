AIPCA-07 · ALCOR — Senior Third-Party & Vendor Compliance Specialist, reparto AIPCA (AI Privacy & Compliance)

# Fornitori e servizi esterni di «Parla Subito»: registro, matrice e lacune

Ho esaminato in sola lettura `docs/fornitori.md` e i file che toccano fornitori: `src/*.js`, `config/*`, `scripts/refresh-staging.sh`, `public/index.html`, `db/schema.sql`, `README.md`. Non ho modificato file, non ho avviato processi e non ho fatto chiamate di rete.

**Cosa non ho potuto controllare**
- **Moduli mancanti.** `src/db`, `src/storage` e `src/vendors/mailorbit` non sono nella copia, quindi i dati effettivamente inviati a Mailorbit e allo storage non sono verificabili.
- **Integrazioni senza codice.** LessonCam e PagaFacile non hanno codice nel progetto.
- **Documenti contrattuali.** Accordi art. 28, SCC, certificati e report SOC non sono nel repository. Le colonne del registro sono dichiarazioni, non evidenze.
- **Biblioteca non usata.** In questa prova la biblioteca del reparto non era disponibile (schede `decisioni-adeguatezza` e `ai-act-date`) e non avevo accesso al web. Le nozioni datate qui sotto vengono dalle mie conoscenze e possono essere superate: lo stato del Data Privacy Framework UE-USA e l'assenza di una decisione di adeguatezza per Singapore. Vanno verificate sulla scheda o sulla fonte ufficiale (elenco delle decisioni di adeguatezza della Commissione europea) prima di renderle definitive.

**Segnalazione immediata.** Ci sono due rilievi P0 (V-01 e V-02) da portare subito al titolare e al Chief Privacy Officer: trasferimenti fuori dallo SEE senza garanzie, con voci di minorenni e dati sulla salute.

## 1. Matrice dei fornitori: ruoli, luoghi, trasferimenti e garanzie

| # | Fornitore | Servizio | Dati (dal codice o dal registro) | Ruolo (dichiarato / da verificare) | Luogo dei dati | Fuori SEE | Garanzia | Art. 28 | Nel registro | Fonte |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Nimbus Hosting GmbH | server, Postgres, storage, staging, bucket di backup | tutti, anche note di salute e documenti dei genitori | responsabile | DE, Francoforte | no (da confermare: supporto e sub-responsabili) | — | firmato 2025-01-10 (non visto) | sì | fornitori.md:7; config/default.json:11-12; backup.yml:9; refresh-staging.sh:4-6 |
| 2 | PagaFacile S.p.A. | pagamenti | nome del pagatore, importo, email; carta solo sul fornitore | titolare autonomo (plausibile per l'esecuzione del pagamento, da confermare dal contratto) | IT | no | — | non necessario se il ruolo è confermato | sì | fornitori.md:8,16 |
| 3 | LessonCam Inc. | videolezioni dal vivo | nome, voce, immagine (anche di minori) | responsabile | UE (Dublino); supporto dagli USA | sì (accesso remoto) | DPF dichiarato + SCC 2021/914 modulo 2 | firmato 2025-02-03 (non visto) | sì | fornitori.md:9 |
| 4 | Mailorbit LLC | newsletter | email, nome (il nome viene da `students`) | responsabile | USA | sì | **Privacy Shield (invalidato)** | firmato 2024-06-01 (non visto) | sì | fornitori.md:10; newsletter.js:13-14 |
| 5 | InsightAI Inc. | trascrizione | audio delle lezioni: voce di studenti, anche minori, e insegnanti; trascrizioni | responsabile dichiarato; i termini di servizio permettono l'uso per i propri modelli, quindi per quella parte agirebbe da titolare | USA | sì | **nessuna** | **in attesa** | sì | fornitori.md:11,15; transcribe.js:8-12 |
| 6 | Coldvault Storage | copia di backup fuori sede | dump completo del DB **non cifrato** + storage (documenti, registrazioni) | responsabile (presunto) | **Singapore** | sì | **nessuna** | non risulta | **no** | backup.yml:5,10,13 |
| 7 | Textblast | SMS di benvenuto e promemoria | numero di telefono, testo | responsabile (presunto) | ignoto | ignoto | non risulta | non risulta | **no** | notifications.js:2-9; auth.js:28 |
| 8 | ChatNow | widget chat sulla pagina di iscrizione | tutti i visitatori; lo script di terzi gira su una pagina con note di salute e password | da qualificare: responsabile o contitolare (art. 26) | ignoto | ignoto | non risulta | non risulta | **no** | public/index.html:26 |
| 9 | stats.parlasubito.example | statistiche d'uso | email come `userId`, eventi | dichiarato «interno su Nimbus» | presunto DE | non verificabile | — | coperto da Nimbus? | no (né come trattamento né come servizio) | analytics.js:1-5; auth.js:11,27 |

Il registro elenca 5 fornitori. Il codice e le configurazioni ne mostrano almeno 3 non registrati (Coldvault, Textblast, ChatNow), più un servizio di statistiche di cui non si può verificare dove giri.

## 2. Rilievi

**V-01 · InsightAI: trasferimento negli USA senza accordo né garanzie, voce di minori, riuso per l'addestramento**
- **Area:** fornitori AI/API, trasferimenti
- **Stato:** non_conforme
- **Gravità:** critica
- **Priorità:** P0
- **Rischio:** dopo ogni lezione l'audio (voce di minori dagli 8 anni e di insegnanti) va a un fornitore USA senza accordo art. 28 e senza garanzia dell'art. 46. I termini di servizio accettati online permettono di usare i contenuti per migliorare i modelli del fornitore: un riuso per altra finalità con perdita di controllo. Per questo scopo InsightAI non sarebbe un responsabile.
- **Riferimenti:** GDPR artt. 28(1) e 28(3) (in particolare 28(3)(a) sull'istruzione documentata), 29, 44, 46, 5(1)(b); considerando 38 sui minori. Il trattamento con AI va visto anche alla luce dell'AI Act (Reg. (UE) 2024/1689) e della L. 132/2025: schede non consultate, da verificare.
- **Evidenze:**
  - `src/transcribe.js:8-12`: POST dell'audio a `api.insightai.example`;
  - `docs/fornitori.md:11`: «Accordo art. 28: in attesa», garanzie «—»;
  - `docs/fornitori.md:15`: clausola di riuso.
- **Lacune:** manca un accordo art. 28. Manca una garanzia per il trasferimento: SCC, oppure certificazione DPF verificata sull'elenco ufficiale. Manca una valutazione del trasferimento. Non sono noti sub-responsabili, luogo e tempi di conservazione presso il fornitore. Non c'è un opt-out dal training.
- **Raccomandazione:**
  - Sospendere l'invio a InsightAI finché non c'è un accordo art. 28 con divieto di riuso e training.
  - Ottenere una garanzia valida e definire conservazione e cancellazione presso il fornitore.
  - In alternativa scegliere un fornitore o una trascrizione nello SEE.
  - Coinvolgere il DPIA Specialist: trattamento su larga scala di dati di minori con tecnologia nuova.
- **Responsabile suggerito:** titolare (direzione) con il legale; attuazione tecnica alla Software Agency, previa approvazione.
- **Verifica:** accordo firmato e datato, garanzia allegata, conferma scritta dell'esclusione dal training; il codice invia solo dopo l'attivazione.

**V-02 · Coldvault (Singapore): backup completo non cifrato fuori dallo SEE, fornitore non registrato**
- **Area:** hosting e backup, trasferimenti
- **Stato:** non_conforme
- **Gravità:** critica
- **Priorità:** P0
- **Rischio:** ogni notte una copia completa del database e dello storage va a un fornitore di Singapore. La copia contiene note di salute (art. 9), dati di minori, codici fiscali e scansioni dei documenti, ed è conservata 10 anni. Il dump è dichiarato senza cifratura. Non risultano accordo né garanzia per il trasferimento. A mia conoscenza Singapore non ha una decisione di adeguatezza UE: dato da verificare sulla scheda `decisioni-adeguatezza`.
- **Riferimenti:** GDPR artt. 28, 30, 32(1)(a), 44-46, 5(1)(e).
- **Evidenze:**
  - `config/backup.yml:5`: `encryption: none`;
  - `config/backup.yml:10`: `coldvault:ps-offsite`, «Singapore: copia fuori sede, costa meno»;
  - `config/backup.yml:13`: conservazione 120 mesi;
  - Coldvault non compare in `docs/fornitori.md`.
- **Lacune:** il fornitore non è nel registro. Manca un accordo art. 28. Manca una garanzia ex art. 46. Il dump non è cifrato. La conservazione di 10 anni per tutti i dati non è motivata.
- **Raccomandazione:**
  - Fermare la copia verso Coldvault e stabilire se le copie già trasferite vanno cancellate, con conferma scritta.
  - Spostare la copia fuori sede in una regione SEE, cifrata lato cliente con chiavi che il fornitore non ha.
  - Se si mantiene un fornitore extra-SEE: accordo art. 28 + SCC + valutazione del trasferimento.
  - Iscrivere il fornitore nel registro.
- **Responsabile suggerito:** titolare; Software Agency e DevOps per l'attuazione.
- **Verifica:** `backup.yml` senza destinazioni extra-SEE o con garanzia documentata; cifratura attiva; registro aggiornato.

**V-03 · Mailorbit: garanzia basata sul Privacy Shield, invalidato**
- **Area:** trasferimenti
- **Stato:** non_conforme
- **Gravità:** alta
- **Priorità:** P1
- **Rischio:** il trasferimento negli USA si appoggia a un meccanismo dichiarato invalido dalla CGUE (C-311/18 «Schrems II», 16 luglio 2020). Il DPF UE-USA (decisione di adeguatezza del 10 luglio 2023, secondo le mie conoscenze, da verificare sulla scheda) copre il fornitore solo se è certificato e iscritto per il tipo di dati in questione. L'accordo è del 2024-06-01 e va controllato se contiene SCC.
- **Riferimenti:** GDPR artt. 28(2), 28(4), 44-46.
- **Evidenze:** `docs/fornitori.md:10` (garanzie «Privacy Shield»; sub-responsabili «elenco sul sito del fornitore»; «SOC 2 Type II (2026)» senza periodo né ambito); `src/newsletter.js:13-14`.
- **Lacune:**
  - non c'è prova di iscrizione al DPF né SCC;
  - l'autorizzazione dei sub-responsabili è affidata a una pagina web, senza traccia di preavviso e di diritto di opposizione;
  - del report SOC 2 non sono noti periodo e servizi coperti.
- **Raccomandazione:**
  - Verificare l'iscrizione al DPF sull'elenco ufficiale, oppure firmare le SCC 2021/914 modulo 2.
  - Chiedere l'elenco dei sub-responsabili con il meccanismo di notifica.
  - Chiedere il report SOC 2 con periodo e perimetro.
- **Responsabile suggerito:** titolare con il legale.
- **Verifica:** documenti allegati al registro con data di verifica.

**V-04 · Mailorbit: continua a ricevere chi ha revocato l'iscrizione**
- **Area:** flussi verso responsabili
- **Stato:** non_conforme
- **Gravità:** alta
- **Priorità:** P1
- **Rischio:** il link «disiscriviti» porta `newsletter` a false, ma la sincronizzazione notturna filtra su `marketing_consent`, che resta true. Chi si è disiscritto continua a essere inviato al responsabile, contro la sua opposizione.
- **Riferimenti:** GDPR artt. 7(3), 21(2-3), 28(3)(a), 5(1)(c).
- **Evidenze:** `src/newsletter.js:7` (aggiorna solo `newsletter`) e `src/newsletter.js:13` (filtra `u.marketing_consent`). Inoltre `upsertList` aggiunge e aggiorna ma, per quanto si vede, non toglie nessuno; il modulo `src/vendors/mailorbit` manca, quindi non è verificabile.
- **Lacune:** manca una cancellazione o soppressione degli iscritti revocati presso il fornitore. Il campo `nome` arriva da `students`, cioè anche da minori.
- **Raccomandazione:**
  - Un solo campo di consenso, aggiornato dalla revoca.
  - La sincronizzazione toglie dalla lista chi revoca o cancella l'account.
- **Responsabile suggerito:** Software Agency (backend), previa approvazione; il Data Subject Rights Specialist per la procedura.
- **Verifica:** test con un utente disiscritto, che non deve comparire nella lista inviata.

**V-05 · Textblast (SMS): fornitore non registrato, senza accordo**
- **Area:** comunicazioni
- **Stato:** non_conforme
- **Gravità:** media-alta
- **Priorità:** P1
- **Rischio:** i numeri di telefono, anche di minori, vanno a un fornitore che non compare nel registro, con luogo, ruolo e garanzie ignoti.
- **Riferimenti:** GDPR artt. 28, 30(1)(d)-(e), 44.
- **Evidenze:** `src/notifications.js:2-9`; `src/auth.js:28` (SMS all'iscrizione); assente da `docs/fornitori.md`.
- **Lacune:** manca un accordo art. 28. Il luogo dei dati è ignoto, così come la conservazione dei messaggi e i sub-responsabili.
- **Raccomandazione:** censire il fornitore e ottenere accordo, luogo dei dati ed eventuali garanzie; se è fuori dallo SEE, applicare gli artt. 44-46.
- **Responsabile suggerito:** titolare.
- **Verifica:** riga nel registro con documenti allegati.

**V-06 · Widget ChatNow sulla pagina di iscrizione: terza parte non registrata, ruolo non qualificato**
- **Area:** script di terzi
- **Stato:** non_conforme
- **Gravità:** alta
- **Priorità:** P1
- **Rischio:** uno script esterno caricato su ogni visita di una pagina che raccoglie note di salute, data di nascita di minori e password. Può leggere il contenuto del modulo e impostare cookie o identificatori. Se il fornitore usa i dati per scopi propri, c'è una possibile contitolarità (CGUE C-40/17 «Fashion ID»).
- **Riferimenti:** GDPR artt. 26, 28, 32, 44; art. 122 del Codice privacy (D.lgs. 196/2003) per cookie e identificatori.
- **Evidenze:** `public/index.html:26` (`widget.chatnow.example/v3/loader.js`, `async`, senza consenso); assente dal registro.
- **Lacune:**
  - manca un accordo art. 28 o 26;
  - il luogo dei dati è ignoto;
  - non si sa quali dati raccolga lo script;
  - il widget si carica senza consenso preventivo.
- **Raccomandazione:**
  - Qualificare il ruolo e ottenere l'accordo.
  - Togliere il widget dalla pagina di iscrizione o caricarlo solo su richiesta e dopo il consenso.
  - Censirlo nel registro.
- **Responsabile suggerito:** titolare; il Privacy Legal Specialist per cookie e contitolarità.
- **Verifica:** il modulo di iscrizione si carica senza script di terzi; accordo nel registro.

**V-07 · Statistiche d'uso: hosting «interno» non verificabile ed email inviata come identificativo**
- **Area:** statistiche d'uso
- **Stato:** non_verificabile
- **Gravità:** media
- **Priorità:** P2
- **Rischio:** il commento dichiara un servizio interno su Nimbus, ma né il servizio né il trattamento sono nel registro. L'email in chiaro fa da `userId`: se il servizio è di terzi o in un altro luogo, si trasferisce un identificativo diretto.
- **Riferimenti:** GDPR artt. 5(1)(c), 25, 28, 30.
- **Evidenze:** `src/analytics.js:1-5`; `src/auth.js:11` e `src/auth.js:27` (`userId: email`).
- **Lacune:** non ci sono prove del luogo di installazione né del fatto che l'accordo con Nimbus lo copra.
- **Raccomandazione:**
  - Documentare dove gira il servizio (server Nimbus, versione) e annotarlo nel registro.
  - Sostituire l'email con un identificativo pseudonimo.
- **Responsabile suggerito:** Software Agency / DevOps.
- **Verifica:** evidenza dell'installazione su infrastruttura Nimbus; nessuna email nel payload.

**V-08 · LessonCam: certificazione scaduta e fuori ambito, garanzie e accessi dagli USA da documentare**
- **Area:** certificazioni, trasferimenti
- **Stato:** parzialmente_conforme
- **Gravità:** media
- **Priorità:** P2
- **Rischio:**
  - il certificato ISO 27001 riportato è scaduto il 2025-12-31 (oggi è il 2026-11-24) e copre gli uffici di Dublino, non il servizio di videolezione;
  - l'accesso di supporto dagli USA è un trasferimento;
  - il registro indica sia DPF sia SCC: va chiarito quale si applica e a quale entità.
- **Riferimenti:** GDPR artt. 28(1), 28(2), 32, 44-46.
- **Evidenze:** `docs/fornitori.md:9`. Non c'è integrazione nel codice, quindi i flussi non sono verificabili.
- **Lacune:** manca un certificato valido con dichiarazione di applicabilità (SoA) che includa il servizio. Mancano prove dell'iscrizione al DPF. Non è documentato quali dati vede il supporto USA. Le registrazioni delle lezioni vengono prodotte qui o dall'app? Da chiarire.
- **Raccomandazione:** chiedere il certificato in corso con ambito e SoA, la verifica dell'iscrizione al DPF e le misure sull'accesso remoto.
- **Responsabile suggerito:** titolare.
- **Verifica:** documenti datati nel registro.

**V-09 · Nimbus: ambito della certificazione, sub-responsabili «nessuno», copie di produzione in staging**
- **Area:** hosting
- **Stato:** parzialmente_conforme
- **Gravità:** media
- **Priorità:** P2
- **Rischio:**
  - l'ISO 27001 copre il data center, non necessariamente i servizi gestiti (Postgres, storage);
  - «nessun sub-responsabile» è poco plausibile per un fornitore di servizi gestiti e va confermato;
  - lo staging riceve dati reali di produzione per le prove della segreteria e degli sviluppatori. Per il fornitore resta lo stesso responsabile, ma le istruzioni documentate dell'accordo vanno controllate. Il punto principale è di minimizzazione e sicurezza: lo rimando al Data Governance Specialist e al Privacy Security Engineer.
- **Riferimenti:** GDPR artt. 28(2), 28(3)(a), 28(3)(h), 32, 5(1)(c).
- **Evidenze:** `docs/fornitori.md:7`; `scripts/refresh-staging.sh:2-6`; `config/backup.yml:9`.
- **Lacune:** non ho visto l'accordo, né l'elenco dei sub-responsabili, né la SoA del certificato.
- **Raccomandazione:** chiedere a Nimbus l'elenco dei sub-responsabili, il perimetro della certificazione e le condizioni di audit. Censire staging e bucket di backup come servizi del fornitore.
- **Responsabile suggerito:** titolare.
- **Verifica:** documenti nel registro.

**V-10 · PagaFacile: ruolo di titolare autonomo da confermare**
- **Area:** pagamenti
- **Stato:** non_verificabile
- **Gravità:** bassa
- **Priorità:** P3
- **Rischio:** la qualifica è plausibile per l'esecuzione del pagamento, ma va confermata dal contratto. Il PSP riceve anche l'email: va chiarito per quale finalità.
- **Riferimenti:** GDPR artt. 4(7), 26, 28.
- **Evidenze:** `docs/fornitori.md:8,16`. Non c'è integrazione nel codice.
- **Lacune:** contratto e informativa del PSP non visti. Il certificato PCI DSS non ha data né attestazione di conformità (AoC).
- **Raccomandazione:** allegare il contratto, la clausola sul ruolo e l'AoC PCI DSS in corso.
- **Responsabile suggerito:** titolare.
- **Verifica:** documenti nel registro.

**V-11 · Registro dei fornitori incompleto e senza evidenze**
- **Area:** governance dei fornitori
- **Stato:** non_conforme
- **Gravità:** media
- **Priorità:** P2
- **Rischio:**
  - mancano 3 fornitori (V-02, V-05, V-06);
  - le colonne riportano dichiarazioni senza riferimento ai documenti né data di verifica;
  - certificazioni e garanzie non sono state ricontrollate: Privacy Shield, ISO scaduto;
  - non c'è una verifica preventiva dei fornitori prima dell'adozione: InsightAI e Coldvault sono già in uso.
- **Riferimenti:** GDPR artt. 28(1), 30(1)(d)-(e), 5(2) sulla responsabilizzazione.
- **Evidenze:** `docs/fornitori.md:3-11` (ultimo aggiornamento 2026-10-15, dopo cui risultano fornitori non censiti).
- **Lacune:** mancano le colonne per documento e data dell'accordo, garanzia con riferimento, data dell'ultima verifica, conservazione presso il fornitore e prossima revisione. Manca una procedura di approvazione dei fornitori nuovi.
- **Raccomandazione:**
  - Completare il registro con le colonne mancanti e i documenti allegati.
  - Introdurre una regola: nessuna integrazione esterna nel codice senza riga nel registro e accordo.
  - Revisione almeno annuale.
- **Responsabile suggerito:** titolare, DPO se nominato.
- **Verifica:** ogni chiamata esterna nel codice e nelle configurazioni ha una riga nel registro con documenti.

## 3. Rilievi fuori dal mio ambito, da girare al Chief

- `config/default.json:8`: la chiave di cifratura dei documenti è nel repository. Così perde valore la cifratura degli oggetti presso Nimbus e presso Coldvault. Va al Privacy Security Engineer, e ai ruoli Cybersecurity se attivi.
- `config/default.json:4-5` e `src/logger.js:14`: in caso di errore il corpo della richiesta finisce nei log, comprese le note di salute. Va verificato dove finiscono i log: se vanno a un servizio di log di terzi, è un altro fornitore da censire.
- `src/purge.js:7`: si cancellano le righe di `recordings`, ma non risulta la cancellazione dei file audio nello storage, nei backup e presso InsightAI. Va al Data Governance Specialist.

## 4. Riepilogo

- **Fornitori:** 9 fra servizi e fornitori esaminati, 3 non registrati.
- **Rilievi:** 11 in tutto, con queste priorità:
  - **P0 (2):** V-01 InsightAI, V-02 Coldvault Singapore;
  - **P1 (4):** V-03 Mailorbit/Privacy Shield, V-04 Mailorbit continua a ricevere i revocati, V-05 Textblast, V-06 ChatNow;
  - **P2 (4):** V-07, V-08, V-09, V-11;
  - **P3 (1):** V-10.
- **Documenti da richiedere ai fornitori:** accordi art. 28, SCC o prova dell'iscrizione al DPF, elenchi dei sub-responsabili, certificati con perimetro e validità. Durante la richiesta non vanno inviati dati personali ai fornitori.

Questi rilievi sono una valutazione di supporto, non una certificazione né un parere legale. Le correzioni spettano alla Software Agency dopo l'approvazione dell'utente.

Firmato: ALCOR (AIPCA-07)
