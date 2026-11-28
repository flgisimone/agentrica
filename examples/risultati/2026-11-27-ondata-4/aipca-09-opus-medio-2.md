AIPCA-09 · MEGREZ — Senior Data Breach & Incident Response Specialist, reparto AIPCA (AI Privacy & Compliance)

**Segnalazione P0 per l'utente, prima del resto.** Si tratta di una violazione di riservatezza confermata: i log mostrano due scaricamenti esterni di documenti d'identità e di dati sanitari, anche di minori. Il termine di 72 ore per la notifica al Garante è già scaduto, al più tardi il 21/11 alle 09:00. Gli interessati non sono stati informati e le prove nei log sono probabilmente già cancellate. Su notifica e comunicazione decidono il titolare, il DPO e il legale. Questi rilievi sono una valutazione di supporto e non un parere legale.

**Note sul metodo**
- Ho lavorato in sola lettura sulla copia `aipca-09-1` e non ho modificato nulla.
- Non ho potuto caricare AIPCA-01 · ARCTURUS perché non c'è il server MCP. Questo rapporto va consolidato dal direttore.
- Non ho consultato la biblioteca: nessuna delle schede disponibili (ai-act-date, decisioni-adeguatezza, legge-132-2025-ia) riguarda questo compito.
- Gli articoli GDPR li ho citati da conoscenza. Le Linee guida EDPB 9/2022 sulla notifica delle violazioni (v2.0, marzo 2023) e la procedura telematica del Garante non le ho verificate sul web in questa sessione: vanno ricontrollate sulla fonte prima dell'uso, perché possono essere superate.

---

## Rilievi

**AIPCA-09-01 · Classificazione dell'evento**
- **area**: classificazione
- **titolo**: la violazione di riservatezza è negata contro le evidenze
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: la decisione su notifica e comunicazione parte da un presupposto falso
- **riferimenti**: GDPR art. 4(12); EDPB Linee guida 9/2022, distinzione tra violazione di riservatezza, integrità e disponibilità
- **evidenze**:
  - `violazione/segnalazione-2026-11.md:16` dice «nessuna violazione di riservatezza, perché i file non sono stati modificati né cancellati».
  - La riga 11 della stessa scheda riporta due scaricamenti completi di `documenti/` e di `note-salute.csv` da indirizzi esterni (17/11 22:13 e 18/11 03:50).
  - La riga 9 riporta che il ricercatore ha ottenuto l'elenco dei file.
- **lacune**: la modifica e la cancellazione riguardano integrità e disponibilità, non la riservatezza.
- **raccomandazione**: classificare l'evento come violazione di riservatezza confermata, con accesso e divulgazione non autorizzati a soggetti ignoti. La disponibilità e l'integrità vanno valutate a parte.
- **priorita**: P0
- **responsabile_suggerito**: titolare con il DPO
- **verifica**: la scheda corretta riporta il tipo di violazione e le evidenze della riga 11

**AIPCA-09-02 · Valutazione del rischio**
- **area**: rischio
- **titolo**: il rischio è giudicato «basso» per una cifratura che non proteggeva le copie esposte
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: il rischio per gli interessati è sottostimato (furto d'identità, discriminazione, dati sanitari di minori)
- **riferimenti**: GDPR artt. 9, 33, 34(1) e 34(3)(a); considerando 38, 75 e 85; EDPB Linee guida 9/2022 sul rischio alto e sulla cifratura come attenuante solo con chiave integra
- **evidenze**:
  - `segnalazione-2026-11.md:18` motiva il rischio basso con la cifratura AES-256-GCM in produzione.
  - La riga 8 della stessa scheda dice che i documenti in staging erano decifrati.
  - `note-salute.csv` è in chiaro. Il campo `note_salute` è in chiaro anche nel database (`db/schema.sql:26`).
  - Anche se le copie fossero cifrate, la chiave di cifratura dei documenti sta in chiaro nel repository (`config/default.json:8`, valore non riportato). La cifratura quindi non può contare come attenuante.
- **lacune**:
  - C'è una discrepanza da chiarire. `scripts/refresh-staging.sh:6` copia gli oggetti con `rclone sync` e non decifra nulla, mentre la scheda parla di decifratura fatta dallo script. Va accertato se esiste un altro passaggio o se la scheda è inesatta.
  - Mancano gravità, probabilità e conseguenze per categoria di interessati.
- **raccomandazione**: rivalutare il rischio come alto, per tre motivi:
  - documenti d'identità di 412 genitori;
  - dati sanitari (art. 9) di 96 studenti, di cui 71 minorenni;
  - esfiltrazione confermata verso soggetti ignoti.

  La valutazione va documentata con i criteri EDPB.
- **priorita**: P0
- **responsabile_suggerito**: titolare con il DPO
- **verifica**: valutazione scritta del rischio, motivata e firmata dal titolare o dal DPO

**AIPCA-09-03 · Termine di notifica**
- **area**: termini
- **titolo**: le 72 ore sono calcolate dalla fine dell'analisi invece che dalla conoscenza
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: notifica tardiva senza motivazione; esposizione a sanzioni (art. 83(4)(a))
- **riferimenti**: GDPR art. 33(1) (72 ore da quando il titolare ne è venuto a conoscenza; oltre quel termine, motivi del ritardo) e art. 33(4) (notifica per fasi); EDPB Linee guida 9/2022 sulla nozione di «conoscenza»
- **evidenze**:
  - `segnalazione-2026-11.md:22` fissa la notifica «entro 72 ore dalla fine dell'analisi interna, quindi entro il 27 novembre».
  - La conoscenza risale al più tardi al 18/11 alle 09:00, con la segnalazione circostanziata del ricercatore alla riga 9. Lo sviluppatore aveva reso pubblico il contenitore già il 17/11 alle 16:40 (riga 7).
- **lacune**: il termine corretto, al più tardi il 21/11 alle 09:00, è già scaduto. Non risulta che la notifica sia stata inviata e non ci sono i motivi del ritardo.
- **raccomandazione**: notificare subito al Garante con la procedura telematica, includendo:
  - le informazioni dell'art. 33(3);
  - i motivi del ritardo;
  - l'integrazione per fasi di ciò che non è ancora noto.

  L'analisi interna non sospende il termine.
- **priorita**: P0
- **responsabile_suggerito**: titolare, DPO e legale
- **verifica**: ricevuta della notifica, con data e ora, conservata nel registro

**AIPCA-09-04 · Comunicazione agli interessati**
- **area**: comunicazione
- **titolo**: la comunicazione è esclusa per un rischio basso che non regge
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: gli interessati non possono difendersi (furto d'identità, uso dei dati sanitari)
- **riferimenti**: GDPR art. 34(1) (senza ingiustificato ritardo), 34(2) (contenuto, linguaggio semplice e chiaro), 34(3) (eccezioni) e 34(4) (il Garante può imporla); considerando 38 e 86
- **evidenze**:
  - `segnalazione-2026-11.md:23` dice «non necessaria, visto il rischio basso».
  - Non si applica l'eccezione dell'art. 34(3)(a): i dati erano decifrati, oppure la chiave è esposta (vedi AIPCA-09-02).
- **lacune**: non ci sono testo, canale o destinatari. Per i 71 minori la comunicazione va ai genitori o tutori.
- **raccomandazione**: comunicare senza ulteriore ritardo a genitori, studenti adulti e tutori dei minori. La comunicazione deve indicare:
  - la natura della violazione;
  - il contatto del DPO o del referente;
  - le conseguenze probabili;
  - le misure prese;
  - le azioni consigliate, per esempio vigilare sull'uso del documento, valutare una denuncia di smarrimento o furto e un nuovo documento.

  Il testo va rivisto dal legale.
- **priorita**: P0
- **responsabile_suggerito**: titolare, DPO e legale
- **verifica**: testo approvato, elenco degli invii con le date, prova della consegna

**AIPCA-09-05 · Perimetro dei dati esposti**
- **area**: valutazione
- **titolo**: il perimetro dell'esposizione è incompleto
- **stato**: parzialmente_conforme
- **gravita**: media-alta
- **rischio**: interessati e categorie di dati sottostimati
- **riferimenti**: GDPR art. 33(3)(a)
- **evidenze**:
  - `scripts/refresh-staging.sh:6` fa una sincronizzazione completa da `parlasubito-prod` verso `parlasubito-staging`. Il contenitore conteneva quindi tutti i file di produzione, comprese le registrazioni delle lezioni, che contengono voce e immagine anche di minori (`README.md:7,21,23`).
  - Il contenitore è rimasto leggibile per circa 18 ore e 20 minuti (righe 7 e 10).
  - La scheda (riga 17) conta solo documenti e note di salute.
- **lacune**:
  - Non è accertato chi siano i due indirizzi: per esempio il «collega esterno» (riga 7) o il ricercatore.
  - Non è accertato se ci siano stati altri accessi a oggetti singoli.
  - Il destinatario del file di prova non è identificato.
- **raccomandazione**:
  - Inventariare tutto il contenuto del contenitore nella finestra di esposizione.
  - Rifare il conteggio degli interessati per categoria.
  - Identificare il collega esterno e chiedergli di cancellare i file, con conferma scritta.
- **priorita**: P1
- **responsabile_suggerito**: sviluppatore e titolare, con Nimbus
- **verifica**: inventario datato e allegato alla scheda

**AIPCA-09-06 · Conservazione delle prove**
- **area**: evidenze
- **titolo**: i log di accesso non sono stati preservati e sono probabilmente già persi
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: è impossibile ricostruire o dimostrare la portata dell'evento (art. 5(2), responsabilizzazione)
- **riferimenti**: GDPR artt. 5(2), 33(5) e 28(3)(f); EDPB Linee guida 9/2022 sulla documentazione
- **evidenze**:
  - `segnalazione-2026-11.md:11` dice che i log si cancellano dopo 7 giorni e che non ne è stata fatta una copia.
  - I log del 17 e del 18/11 sono scaduti verso il 24-25/11. Oggi è il 27/11.
- **lacune**: non ci sono un elenco delle prove né una catena di custodia (email del ricercatore, indirizzi, elenco dei file, impronte, configurazione del contenitore).
- **raccomandazione**:
  - Chiedere subito a Nimbus, come responsabile del trattamento (`docs/fornitori.md:7`), se conserva copie dei log o altri registri.
  - Preservare l'email del ricercatore, gli indirizzi già annotati e lo stato della configurazione, con data e impronta.
  - Nella procedura: copia immediata dei log quando si apre un incidente, e conservazione dei log di accesso più lunga di 7 giorni.

  Questa parte va coordinata con la Cybersecurity (Incident Response).
- **priorita**: P0
- **responsabile_suggerito**: sviluppatore e titolare, con Nimbus
- **verifica**: elenco delle prove con impronte; risposta scritta di Nimbus

**AIPCA-09-07 · Registro delle violazioni**
- **area**: registrazione
- **titolo**: il registro non documenta fatti, effetti e provvedimenti
- **stato**: non_conforme
- **gravita**: media
- **rischio**: il registro non consente al Garante di verificare il rispetto dell'art. 33
- **riferimenti**: GDPR art. 33(5)
- **evidenze**:
  - `violazione/registro.md:3-6` ha solo le colonne numero, data e descrizione.
  - La riga 6 dice «reso pubblico per errore», ma l'apertura del contenitore è stata intenzionale (scheda, riga 7).
  - La riga 5 (newsletter con i destinatari in chiaro, 38 indirizzi) non dice né la valutazione né se la violazione è stata notificata.
- **lacune**: mancano per ogni voce:
  - data e ora di conoscenza;
  - categorie e numero di interessati e di dati;
  - conseguenze e valutazione del rischio;
  - decisione su notifica e comunicazione, con le date e la motivazione anche quando non si notifica;
  - misure;
  - responsabile.
- **raccomandazione**: aggiungere queste colonne, correggere la voce 2 e completare la voce 1 (la notificabilità della voce 1 non è verificabile).
- **priorita**: P2
- **responsabile_suggerito**: titolare con il DPO
- **verifica**: registro aggiornato, con le voci 1 e 2 complete

**AIPCA-09-08 · Misure correttive**
- **area**: contenimento e prevenzione
- **titolo**: la causa principale resta attiva
- **stato**: non_conforme
- **gravita**: alta
- **rischio**: la violazione si può ripetere; i dati reali continuano a stare in staging
- **riferimenti**: GDPR artt. 5(1)(c) e (f), 25, 32 e 33(3)(d)
- **evidenze**:
  - `segnalazione-2026-11.md:24` dice che lo script «resta com'è».
  - `scripts/refresh-staging.sh:2,4-6` copia in staging database e file di produzione «così la segreteria prova con dati veri».
  - La chiave di cifratura dei documenti è nel repository (`config/default.json:8`).
- **lacune**:
  - Una regola interna non è una misura tecnica.
  - Non c'è un blocco dell'accesso pubblico a livello del fornitore.
  - Non ci sono provvedimenti verso chi ha agito fuori dalle istruzioni (art. 29, art. 32(4)).
- **raccomandazione**: le correzioni le attua la Software Agency, previa approvazione:
  - usare dati sintetici o pseudonimizzati in staging;
  - svuotare lo storage e il database di staging;
  - bloccare l'accesso pubblico ai contenitori a livello di account;
  - ruotare la chiave dei documenti e toglierla dal repository;
  - formare e istruire il personale.
- **priorita**: P1
- **responsabile_suggerito**: titolare con la Software Agency
- **verifica**: script modificato; staging senza dati reali; configurazione del blocco dell'accesso pubblico

**AIPCA-09-09 · Ruoli, reperibilità e fornitore**
- **area**: governance
- **titolo**: la decisione è presa senza titolare né DPO, e il fornitore non è coinvolto
- **stato**: non_conforme
- **gravita**: media
- **riferimenti**: GDPR artt. 28(3)(f), 33(2), 38 e 39
- **evidenze**:
  - La scheda è compilata da segreteria e sviluppatore (`segnalazione-2026-11.md:3`), senza firme o revisione di titolare, DPO o legale.
  - Non risultano contatti con Nimbus.
- **lacune**:
  - Manca una procedura scritta di risposta alle violazioni, con ruoli, reperibilità e matrice delle segnalazioni.
  - Non è documentato chi è stato informato e quando, dopo l'email delle 09:00.
- **raccomandazione**: adottare una procedura con ruoli e tempi; documentare la catena di segnalazione di questo evento; fare approvare le decisioni al titolare, sentito il DPO.
- **priorita**: P1
- **responsabile_suggerito**: titolare
- **verifica**: procedura approvata; cronologia delle segnalazioni nella scheda

---

## Matrice delle segnalazioni (proposta)

| Chi rileva | Avvisa subito | Entro | Chi decide | Verso l'esterno |
|---|---|---|---|---|
| Personale, sviluppatori, segnalatori esterni (`privacy@`) | referente privacy o DPO e responsabile tecnico | 1 ora | titolare, sentiti DPO e legale | Garante entro 72 ore dalla conoscenza (art. 33) |
| Fornitore responsabile (Nimbus, LessonCam, Mailorbit, InsightAI) | titolare | senza ingiustificato ritardo (art. 33(2), tempi nell'accordo) | titolare | interessati senza ingiustificato ritardo se il rischio è alto (art. 34) |

## Lista di controllo per le violazioni

1. Contenere la violazione e annotare l'ora di conoscenza.
2. Preservare subito le prove: log, configurazioni, comunicazioni, impronte.
3. Definire il perimetro: dati, categorie, interessati, minori, art. 9.
4. Valutare il rischio con criteri documentati, senza contare la cifratura se la chiave non è integra.
5. Far decidere notifica e comunicazione a titolare, DPO e legale entro 72 ore; dove serve, notificare per fasi.
6. Comunicare agli interessati in modo chiaro, ai genitori per i minori.
7. Coinvolgere i fornitori.
8. Registrare tutto nel registro (art. 33(5)).
9. Correggere la causa principale con misure tecniche.

## Domande aperte per il titolare e il DPO

1. La notifica al Garante è già stata inviata? Se sì, quando e con quale contenuto?
2. Lo script ha decifrato i documenti, o le copie erano cifrate? In ogni caso, la chiave è esposta.
3. Chi è il collega esterno, e a chi appartengono i due indirizzi?
4. Nimbus conserva copie dei log di accesso?
5. Il contenitore conteneva anche registrazioni e altri file di produzione?
6. È stato nominato un DPO?
7. La voce 1 del registro (newsletter) è stata valutata o notificata?

**Fuori perimetro, da girare agli altri specialisti.** In `config/backup.yml` ci sono backup non cifrati (riga 5) con una copia a Singapore (riga 10), cioè fuori dallo SEE e non registrata in `docs/fornitori.md`. Sono rilievi da trasferimenti e conservazione, per Vendor Compliance e Data Governance, non per questa violazione.

Firmato: AIPCA-09 · MEGREZ
