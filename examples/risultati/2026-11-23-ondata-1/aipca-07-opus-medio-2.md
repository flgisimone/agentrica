AIPCA-07 · ALCOR — Senior Third-Party & Vendor Compliance Specialist, reparto AIPCA (AI Privacy & Compliance)

# Fornitori e servizi esterni di «Parla Subito»: registro, matrice e lacune

## Perimetro e limiti della prova

- **Cosa ho letto, in sola lettura:** tutti i file della copia: `README.md`, `docs/fornitori.md`, `docs/procedura-diritti.md`, `config/*`, `scripts/refresh-staging.sh`, `db/schema.sql`, `src/*.js` e `public/index.html`.
- **File che mancano:** `src/db.js`, `src/storage.js`, `src/vendors/mailorbit.js` (richiamati da `src/newsletter.js:2`) e `package.json`. Le dipendenze e il client Mailorbit non sono verificabili.
- **Cosa non ho potuto fare:**
  - consultare il direttore AIPCA-01 e la biblioteca del reparto (schede `decisioni-adeguatezza` e `ai-act-date`);
  - usare la rete.
- **Nozioni da ricontrollare:** le nozioni normative qui sotto vengono dalle mie conoscenze, non da una fonte verificata. Possono essere superate e vanno controllate sulla scheda `decisioni-adeguatezza` (2026-11-19) o sulle fonti ufficiali (Commissione UE, EDPB, Garante). Sono:
  - Privacy Shield invalidato dalla sentenza CGUE C-311/18 «Schrems II» del 16/07/2020;
  - Data Privacy Framework UE-USA adottato con la decisione di esecuzione (UE) 2023/1795, valido solo per le organizzazioni certificate nell'elenco ufficiale;
  - nessuna decisione di adeguatezza per Singapore;
  - SCC adottate con la decisione 2021/914.
- **Documenti dei fornitori:** non ho visto contratti, DPA, SCC né certificati. Quello che dice il registro è un'affermazione, non un'evidenza. Ho segnato come verificato solo ciò che risulta dal codice.

## Segnalazioni immediate (P0)

1. **InsightAI:** la voce degli studenti, anche minorenni, va negli USA:
   - senza un accordo ex art. 28;
   - senza garanzie del Capo V;
   - con termini di servizio che permettono al fornitore di addestrare i suoi modelli con i contenuti inviati.

   Il flusso è attivo nel codice (`src/transcribe.js:8-12`). Va segnalato subito al titolare e al DPO.
2. **Coldvault:** è P1 nel registro. Diventa P0 se si conferma che non esistono contratto e SCC con il fornitore (vedi R-02).

## 1. Registro dei fornitori ricostruito

Segno con † i fornitori assenti da `docs/fornitori.md`, che sono stati trovati nel codice e nelle configurazioni.

| # | Fornitore | Servizio | Dati (dal codice e dal README) | Ruolo probabile | Dove si trova | Fonte |
|---|---|---|---|---|---|---|
| 1 | Nimbus Hosting GmbH | server, Postgres gestito, storage a oggetti, staging, backup primario | tutti, anche le note di salute (art. 9), i minori e i documenti d'identità | responsabile | `README.md:21-22`, `config/default.json:10-13`, `config/backup.yml:7-9`, `scripts/refresh-staging.sh` | `docs/fornitori.md:7` |
| 2 | PagaFacile S.p.A. | pagamenti con carta | nome del pagatore, importo, email | titolare autonomo, secondo il registro (da verificare) | nessuna integrazione nel codice | `docs/fornitori.md:8,16` |
| 3 | LessonCam Inc. | videolezioni | nome, voce e immagine di studenti (anche minori) e insegnanti | responsabile | nessuna integrazione nel codice | `docs/fornitori.md:9` |
| 4 | Mailorbit LLC | newsletter | email dell'utente e nome dello studente | responsabile | `src/newsletter.js:2,12-15` | `docs/fornitori.md:10` |
| 5 | InsightAI Inc. | trascrizione | audio delle lezioni (voce, anche di minori) e contenuto delle lezioni | responsabile secondo il registro; di fatto anche titolare per l'addestramento dei modelli | `src/transcribe.js:5-15` | `docs/fornitori.md:11,15` |
| 6 † | TextBlast | SMS di benvenuto e promemoria | telefono e testo | responsabile, probabile | `src/notifications.js:2-9`, `src/auth.js:28` | assente |
| 7 † | ChatNow | widget di chat sulla pagina di iscrizione | dati del browser, messaggi della chat; lo script gira accanto ai campi del form, compreso `note_salute` | responsabile o contitolare, da qualificare | `public/index.html:26` | assente |
| 8 † | Coldvault Storage | copia di backup fuori sede | copia integrale del database e dello storage: note di salute, minori, documenti, registrazioni | responsabile, probabile | `config/backup.yml:10` | assente |
| 9 † | «stats.parlasubito.example» | statistiche d'uso | email in chiaro come `userId`, eventi di login e iscrizione, scelta sulla newsletter | non verificabile: per il commento è interno su Nimbus, ma non ci sono evidenze | `src/analytics.js:1-6`, `src/auth.js:11,27` | assente |
| 10 † | destinazione dei log (non indicata) | log applicativi pino | in caso di errore anche il corpo della richiesta (`note_salute`, dati anagrafici) | non verificabile | `src/logger.js:4,14`, `config/default.json:2-6` | assente |

## 2. Matrice ruoli, luoghi, trasferimenti e garanzie

| Fornitore | Art. 28 | Sub-responsabili | Fuori dallo SEE | Base del trasferimento | Certificazioni | Stato |
|---|---|---|---|---|---|---|
| Nimbus | firmato il 2025-01-10, secondo il registro; non visto | «nessuno»: va verificato sul DPA, è poco plausibile per un servizio gestito | no (Francoforte) | non serve | ISO 27001 «data center di Francoforte» fino al 2027-05; l'ambito copre l'infrastruttura, non i servizi gestiti; certificato e SoA non visti | `parzialmente_conforme` |
| PagaFacile | «non necessario» | — | no | non serve | PCI DSS liv. 1, AoC e data non viste | `non_verificabile` |
| LessonCam | firmato il 2025-02-03 | autorizzazione generale con 30 giorni di preavviso, coerente con l'art. 28(2) | sì: supporto con accesso remoto dagli USA | DPF più SCC 2021/914 modulo 2, secondo il registro; iscrizione al DPF non verificata | ISO 27001 **scaduta il 2025-12-31**, e copre gli uffici di Dublino, non il servizio | `parzialmente_conforme` |
| Mailorbit | firmato il 2024-06-01 | «elenco sul sito»: non c'è autorizzazione né preavviso dimostrati | sì (USA) | **Privacy Shield, non valido** | SOC 2 Type II (2026): ambito e periodo non visti | `non_conforme` |
| InsightAI | **in attesa** | — | sì (USA) | **nessuna** | nessuna | `non_conforme` |
| TextBlast | non risulta | — | non noto | non nota | — | `non_verificabile` (registro `non_conforme`) |
| ChatNow | non risulta | — | non noto | non nota | — | `non_verificabile` (registro `non_conforme`) |
| Coldvault | non risulta | — | **sì, Singapore** | **nessuna risulta**; Singapore senza adeguatezza, da verificare sulla scheda | — | `non_conforme` |
| Statistiche | — | — | non noto | — | — | `non_verificabile` |
| Log | — | — | non noto | — | — | `non_verificabile` |

## 3. Rilievi

**R-01 · InsightAI: trascrizione senza accordo, senza garanzie e con riuso per l'addestramento**
- **Area, stato, gravità:** fornitori e trasferimenti; `non_conforme`; gravità critica; **P0**.
- **Rischio:** la voce di minori e di adulti va negli USA senza un contratto ex art. 28 e senza garanzie del Capo V. Il fornitore può riusare i contenuti per sé: per quella finalità diventa titolare, e il registro non ne tiene conto. Inoltre il fornitore conserva i dati per un tempo non noto, mentre le registrazioni vanno conservate 30 giorni.
- **Riferimenti:** GDPR artt. 28(1)-(3), 44 e 46, 5(1)(b) e 8; considerando 38 sui minori.
- **Evidenze:** `src/transcribe.js:8-12` (POST dell'audio a `api.insightai.example`); `docs/fornitori.md:11` (accordo «in attesa», trasferimento «sì», garanzie «—»); `docs/fornitori.md:15` (clausola sull'addestramento).
- **Lacune:**
  - accordo, SCC e valutazione d'impatto del trasferimento (TIA);
  - opt-out dall'addestramento;
  - tempi di conservazione presso il fornitore;
  - informativa agli interessati;
  - DPIA, da chiedere alla collega DPIA.
- **Raccomandazione:**
  - sospendere l'invio finché non sono firmati un DPA ex art. 28 e SCC modulo 2 (oppure finché non si accerta l'iscrizione al DPF) con una TIA, e finché non c'è l'esclusione contrattuale dell'addestramento;
  - in alternativa, valutare un fornitore con trattamento nello SEE;
  - chiedere al fornitore la cancellazione dei dati già inviati.
- **Responsabile suggerito:** titolare e DPO, con il legale.
- **Verifica:** DPA e SCC firmati; clausola di non riuso; chiamata disattivata o subordinata a un flag di configurazione fino all'ok.

**R-02 · Coldvault: copia integrale non cifrata a Singapore, fuori dal registro**
- **Area, stato, gravità:** trasferimenti; `non_conforme`; gravità alta; **P1** (P0 se si conferma che non esistono contratto e SCC).
- **Rischio:** tutti i dati sono trasferiti verso un paese senza adeguatezza (da verificare sulla scheda), senza garanzie risultanti e in chiaro. Tra questi ci sono:
  - le note di salute;
  - i dati dei minori;
  - le registrazioni, che restano oltre i 30 giorni dichiarati.

  La copia è conservata fino a 120 mesi.
- **Riferimenti:** GDPR artt. 28, 30, 32, 44 e 46, 5(1)(e).
- **Evidenze:** `config/backup.yml:5` (`encryption: none`), `:10` (Coldvault, Singapore), `:13` (`keep_monthly: 120`); assente da `docs/fornitori.md`.
- **Lacune:**
  - contratto e DPA, SCC e TIA;
  - sub-responsabili;
  - cifratura e gestione delle chiavi;
  - prova di ripristino (`last_restore_test: null`, riga 14).
- **Raccomandazione:**
  - accertare subito se esiste un contratto con Coldvault;
  - in caso contrario, sospendere la copia e cancellare i dati presso Coldvault;
  - preferire una copia fuori sede nello SEE, cifrata lato cliente;
  - allineare la conservazione dei backup ai tempi di `config/retention.json`;
  - aggiornare il registro.
- **Responsabile suggerito:** titolare e DPO; attuazione affidata alla Software Agency (DevOps).
- **Verifica:** registro aggiornato; contratto e SCC firmati, oppure target rimosso; `encryption` attiva.

**R-03 · Mailorbit: trasferimento basato sul Privacy Shield e sub-responsabili senza autorizzazione dimostrata**
- **Area, stato, gravità:** trasferimenti; `non_conforme`; gravità alta; **P1**.
- **Rischio:**
  - il trasferimento verso gli USA non ha una base valida;
  - i sub-responsabili sono rimandati a un elenco sul sito, senza autorizzazione scritta né meccanismo di preavviso dimostrati;
  - la sincronizzazione notturna usa `marketing_consent`, mentre il link «disiscriviti» aggiorna solo `newsletter`: chi si disiscrive continua a essere inviato al fornitore;
  - `upsertList` sembra non rimuovere i contatti revocati o cancellati, ma il client non è nel progetto, quindi non posso verificarlo.
- **Riferimenti:** GDPR artt. 44-46, 28(2) e (4), 21(3), 7(3); CGUE C-311/18; decisione (UE) 2023/1795, da verificare.
- **Evidenze:** `docs/fornitori.md:10`; `src/newsletter.js:7` (aggiorna `newsletter = false`); `src/newsletter.js:13` (filtra per `u.marketing_consent`); `src/newsletter.js:14`; `src/vendors/mailorbit.js` assente.
- **Lacune:**
  - iscrizione attiva al DPF oppure SCC con TIA;
  - DPA aggiornato dopo il 2023;
  - ambito del SOC 2;
  - eliminazione dei contatti presso il fornitore.
- **Raccomandazione:**
  - aggiornare la base del trasferimento: DPF verificato sull'elenco ufficiale, oppure SCC 2021/914 modulo 2 con TIA;
  - formalizzare l'autorizzazione generale ai sub-responsabili con preavviso;
  - allineare disiscrizione e sincronizzazione e propagare le rimozioni al fornitore (lo segnalo anche alla collega dei diritti degli interessati).
- **Responsabile suggerito:** DPO e legale; Software Agency.
- **Verifica:** registro con base e data di controllo; test di disiscrizione seguito dalla sincronizzazione.

**R-04 · TextBlast (SMS): fornitore non registrato**
- **Area, stato, gravità:** inventario; `non_conforme` per il registro, `non_verificabile` per contratto e luogo; gravità media; **P2**.
- **Rischio:** i numeri di telefono, anche di minori, vanno a un fornitore che non ha accordo né luogo noti. Il token sta in una variabile d'ambiente, ed è corretto.
- **Riferimenti:** GDPR artt. 28, 30(1)(d) ed (e), 44.
- **Evidenze:** `src/notifications.js:2-9`; `src/auth.js:28`.
- **Lacune:** identità legale, sede e luogo dei dati, DPA, sub-responsabili, conservazione dei messaggi.
- **Raccomandazione:** censire il fornitore e ottenere il DPA (e, se fuori dallo SEE, le garanzie); aggiornare il registro.
- **Responsabile suggerito:** segreteria e DPO.
- **Verifica:** riga nel registro con documenti allegati.

**R-05 · ChatNow: widget di terze parti sulla pagina di iscrizione, non registrato**
- **Area, stato, gravità:** inventario ed ePrivacy; `non_conforme` per il registro; gravità media-alta; **P2**.
- **Rischio:**
  - lo script è caricato a ogni visita, senza consenso apparente;
  - gira nella stessa pagina del form che raccoglie la data di nascita e le note di salute, quindi tecnicamente può leggere i campi;
  - ruolo, luogo e trasferimenti non sono noti.
- **Riferimenti:** GDPR artt. 26 e 28, 30, 44; art. 122 del Codice privacy; Linee guida cookie del Garante (2021), da verificare.
- **Evidenze:** `public/index.html:19` (`note_salute`), `public/index.html:26` (script `widget.chatnow.example`).
- **Lacune:** contratto, ruolo, cookie e trasferimenti.
- **Raccomandazione:**
  - qualificare il ruolo e ottenere il DPA o l'accordo ex art. 26;
  - caricare il widget solo dopo il consenso, se usa cookie non tecnici, e non sulla pagina di iscrizione;
  - aggiornare il registro (a cura della collega Legal per la parte cookie).
- **Responsabile suggerito:** DPO e legale; Software Agency (frontend).
- **Verifica:** widget assente dal form, oppure caricato dopo il consenso; registro aggiornato.

**R-06 · LessonCam: certificazione scaduta e fuori ambito, trasferimento per il supporto da documentare**
- **Area, stato, gravità:** garanzie e certificazioni; `parzialmente_conforme`; gravità media; **P2**.
- **Rischio:** la ISO 27001 è scaduta il 2025-12-31 e copre gli uffici di Dublino, non il servizio. Il registro la presenta come «sì». L'accesso remoto dagli USA è un trasferimento.
- **Riferimenti:** GDPR artt. 28(1), 32, 44-46.
- **Evidenze:** `docs/fornitori.md:9`.
- **Lacune:**
  - certificato in corso, con ambito sul servizio;
  - verifica dell'iscrizione al DPF;
  - TIA per le SCC;
  - copia del DPA e dell'elenco dei sub-responsabili.
- **Raccomandazione:** chiedere il certificato aggiornato e la SoA (o un SOC 2) relativi al servizio; registrare la data di verifica del DPF; correggere la colonna delle certificazioni.
- **Responsabile suggerito:** DPO.
- **Verifica:** documenti allegati al registro, con le date.

**R-07 · Nimbus: sub-responsabili «nessuno», ambito della ISO e copia in staging**
- **Area, stato, gravità:** fornitori; `parzialmente_conforme`; gravità media; **P2**.
- **Rischio:**
  - l'assenza di sub-responsabili non è documentata;
  - la ISO copre il data center, non i servizi gestiti;
  - lo staging presso lo stesso fornitore riceve tutti i dati reali di produzione per le prove della segreteria e degli sviluppatori. È una finalità diversa, che il registro non indica. Lo segnalo alla collega Data Governance: chi sono gli sviluppatori, ed eventuali esterni, va censito come responsabile.
- **Riferimenti:** GDPR artt. 28(2) e (4), 5(1)(b) e (c), 32.
- **Evidenze:** `docs/fornitori.md:7`; `scripts/refresh-staging.sh:2-6`; `README.md:22`.
- **Lacune:** DPA con l'elenco dei sub-responsabili; certificato con ambito e SoA; elenco di chi accede allo staging.
- **Raccomandazione:** verificare il DPA e l'allegato sui sub-responsabili; usare dati sintetici o pseudonimizzati in staging (attuazione alla Software Agency).
- **Responsabile suggerito:** DPO; DevOps.
- **Verifica:** DPA allegato; script di staging senza dati reali.

**R-08 · Statistiche d'uso: destinazione non verificabile e email in chiaro**
- **Area, stato, gravità:** inventario e minimizzazione; `non_verificabile`; gravità media; **P2**.
- **Rischio:** l'endpoint «interno su Nimbus» è affermato solo in un commento. Se il servizio è gestito da terzi, manca il fornitore nel registro. In ogni caso l'identificativo inviato è l'email, non un ID pseudonimo.
- **Riferimenti:** GDPR artt. 5(1)(c), 25, 28, 30.
- **Evidenze:** `src/analytics.js:1-5`; `src/auth.js:11,27`.
- **Lacune:** dove gira il servizio e chi lo gestisce.
- **Raccomandazione:** documentare l'hosting (se è su Nimbus, rientra nel DPA esistente); sostituire l'email con un ID pseudonimo o rimuoverlo.
- **Responsabile suggerito:** Software Agency; DPO.
- **Verifica:** evidenza di dove è ospitato; payload senza email.

**R-09 · Log: destinazione non dichiarata e corpo delle richieste registrato in caso di errore**
- **Area, stato, gravità:** inventario; `non_verificabile`; gravità media; **P2**.
- **Rischio:** non risulta dove finiscono i log, che potrebbero andare a un servizio di raccolta esterno. In caso di errore contengono il corpo della richiesta, comprese le note di salute: la regola `redact` copre solo la password e il cookie.
- **Riferimenti:** GDPR artt. 28, 30, 32, 5(1)(c).
- **Evidenze:** `config/default.json:4-5`; `src/logger.js:4,14`.
- **Raccomandazione:** dichiarare la destinazione dei log (ed eventualmente il fornitore); disattivare `logRequestBodyOnError` o estendere la regola `redact`. Il punto passa al Privacy Security Engineer.
- **Responsabile suggerito:** Software Agency.
- **Verifica:** configurazione aggiornata; registro aggiornato.

**R-10 · PagaFacile: ruolo e certificazione da documentare**
- **Area, stato:** ruoli; `non_verificabile`; **P3**.
- **Evidenze:** `docs/fornitori.md:8,16`; nel progetto non c'è codice di integrazione.
- **Lacune:** contratto e condizioni che qualificano il fornitore come titolare autonomo (servizi di pagamento); attestato di conformità (AoC) PCI DSS con la data; trattamento dei dati per la fatturazione.
- **Raccomandazione:** allegare al registro il contratto e l'AoC in corso.
- **Responsabile suggerito:** amministrazione e DPO.

**R-11 · Il registro dei fornitori è incompleto e senza evidenze**
- **Area, stato:** governance; `non_conforme`; **P2**.
- **Evidenze:** `docs/fornitori.md:3-11`. Mancano TextBlast, ChatNow, Coldvault e le destinazioni di statistiche e log. Non ci sono le date di verifica del DPF e delle certificazioni, né le TIA. Compila e aggiorna la segreteria.
- **Raccomandazione:** aggiungere le colonne:
  - fonte del documento;
  - data dell'ultima verifica;
  - base del trasferimento con riferimento;
  - TIA;
  - scadenza della certificazione.

  Aggiungere anche una revisione periodica sotto la responsabilità del DPO.
- **Verifica:** registro aggiornato, con allegati.

## 4. Consegne ad altri specialisti (per il direttore AIPCA-01)

- **DPIA:** trascrizione automatica con voce di minori (R-01); copia integrale a Singapore (R-02).
- **Legal:** widget e cookie (R-05); ruolo di PagaFacile (R-10).
- **Diritti degli interessati:** disiscrizione e sincronizzazione con Mailorbit (R-03).
- **Data Governance:** staging con dati reali (R-07); conservazione dei backup (R-02).
- **Security:** chiave di cifratura dei documenti scritta in `config/default.json:8` (fuori dal mio perimetro, ma alza la gravità di qualunque copia del repository o dei backup); log (R-09).

Questi rilievi sono una valutazione di supporto, non una certificazione né un parere legale: le decisioni restano al titolare e al DPO. Le correzioni spettano alla Software Agency, dopo l'approvazione dell'utente. Ho lavorato sulla sessione principale con il modello Opus. Restano da verificare la scheda della biblioteca sulle decisioni di adeguatezza e i documenti contrattuali dei fornitori, che non ho potuto consultare.

— ALCOR (AIPCA-07)
