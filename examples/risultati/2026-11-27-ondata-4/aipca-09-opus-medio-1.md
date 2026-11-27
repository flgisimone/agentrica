«AIPCA-09 · MEGREZ — Senior Data Breach & Incident Response Specialist, reparto AIPCA (AI Privacy & Compliance)»

# Rapporto: gestione della violazione di novembre 2026 (`violazione/`)

## Prima di cominciare

- **Direttore AIPCA-01 non caricato.** Il tool `agent` non c'è in questa sessione, quindi non ho potuto caricare AIPCA-01 · ARCTURUS. Il rapporto va a lui per il consolidamento.
- **Biblioteca non usata.** Nessuna delle tre schede del reparto (date dell'AI Act, decisioni di adeguatezza, L. 132/2025) riguarda questo compito.
- **Riferimenti EDPB non verificati.** Cito a memoria le Linee guida EDPB 9/2022 sulla notifica delle violazioni (v2.0 del 28/03/2023) e le Linee guida EDPB 01/2021 con gli esempi di notifica (v2.0 del 14/12/2021). Non le ho verificate sulla fonte e potrebbero essere superate. Gli articoli del GDPR citati sono quelli del testo vigente.
- **Perimetro.** Ho lavorato in sola lettura e non ho modificato nulla. Ho letto `violazione/segnalazione-2026-11.md` e `violazione/registro.md`. Come riscontro ho letto anche `README.md`, `scripts/refresh-staging.sh`, `config/*.json`, `config/backup.yml`, `docs/fornitori.md`, `src/documents.js`, `src/export.js` e `legale/informativa.md`. Nell'evidenza non riporto chiavi né dati personali.

## P0 da segnalare subito ai responsabili (titolare, DPO se nominato, legale)

1. **La notifica al Garante è già in ritardo.** Il termine di 72 ore era il 21/11 alle 09:00 al più tardi. La scheda lo fissa al 27/11.
2. **Gli interessati vanno informati, ma la scheda dice di no.** La violazione è ad alto rischio: dati sanitari di minori e documenti d'identità scaricati da terzi.
3. **Lo staging contiene ancora dati reali.** La causa (lo script di aggiornamento) resta com'è.

Sono valutazioni di supporto. La decisione sulla notifica spetta al titolare, dopo la revisione del DPO o del legale.

## Rilievi

### AIPCA-09-01: classificazione errata della violazione
- **Area**: classificazione
- **Stato**: non_conforme
- **Gravità**: critica
- **Rischio**: con la classificazione sbagliata cadono la valutazione e le decisioni che ne derivano.
- **Riferimenti**: GDPR art. 4(12); Linee guida EDPB 9/2022, sui tipi di violazione (riservatezza, integrità, disponibilità).
- **Evidenze**:
  - `segnalazione-2026-11.md` riga 16: «nessuna violazione di riservatezza, perché i file non sono stati modificati né cancellati».
  - Riga 11: due scaricamenti completi di `documenti/` e di `note-salute.csv` da indirizzi esterni.
  - Righe 7 e 9: contenitore leggibile da chiunque.
- **Lacune**: il criterio usato (modifica o cancellazione) misura l'integrità e la disponibilità, non la riservatezza.
- **Raccomandazione**: classificarla come violazione di riservatezza, cioè divulgazione e accesso non autorizzati, confermata da esfiltrazione. Integrità e disponibilità vanno indicate come non compromesse, ma solo se verificate.
- **Priorità**: P0
- **Responsabile suggerito**: titolare, con il DPO o il legale
- **Verifica**: la scheda corretta e la notifica riportano la classificazione «riservatezza».

### AIPCA-09-02: valutazione del rischio errata (basso invece di alto)
- **Area**: valutazione del rischio
- **Stato**: non_conforme
- **Gravità**: critica
- **Rischio**:
  - furto d'identità e frodi con i documenti di 412 genitori;
  - discriminazione e danno ai minori per le note di salute di 96 studenti, 71 dei quali minorenni.
- **Riferimenti**: GDPR artt. 9, 33(3)(c), 34(1); considerando 38, 75 e 85; Linee guida EDPB 9/2022, sulla valutazione del rischio; Linee guida EDPB 01/2021, esempi di esfiltrazione.
- **Evidenze**:
  - `segnalazione` riga 18: rischio «basso, perché in produzione i documenti sono cifrati».
  - Riga 8: in staging i documenti sono «decifrati dallo script».
  - `README.md` righe 7-8: le note di salute comprendono allergie e disturbi dell'apprendimento, e servono documenti d'identità per l'iscrizione dei minori.
- **Lacune**:
  - La cifratura della produzione non vale per la copia esposta.
  - Una discordanza da verificare: lo script versionato (`scripts/refresh-staging.sh` riga 6) copia i blob con `rclone sync` senza decifrarli, mentre la scheda dice che sono decifrati. Va accertato sui file realmente esposti.
  - Anche se i file fossero cifrati, la chiave sta nel repository (`config/default.json` riga 8, valore non riportato). La cifratura protegge solo se la chiave non è compromessa, e questo va valutato.
- **Raccomandazione**:
  - Rischio alto, per quattro motivi: categorie particolari di dati, minori, documenti d'identità, esfiltrazione confermata da attori sconosciuti.
  - Documentare i fattori: tipo, sensibilità, volume, facilità di identificazione, gravità, persone vulnerabili.
- **Priorità**: P0
- **Responsabile suggerito**: titolare, con il DPO o il legale
- **Verifica**: valutazione scritta e motivata, firmata dal titolare.

### AIPCA-09-03: termine delle 72 ore calcolato dal momento sbagliato
- **Area**: termini e notifica
- **Stato**: non_conforme
- **Gravità**: critica
- **Rischio**: notifica tardiva senza motivazione del ritardo; possibile sanzione (art. 83(4)(a)).
- **Riferimenti**: GDPR art. 33(1) e 33(4); Linee guida EDPB 9/2022, sul momento in cui il titolare viene «a conoscenza» della violazione.
- **Evidenze**:
  - `segnalazione` riga 22: «entro 72 ore dalla fine dell'analisi interna, quindi entro il 27 novembre».
  - Riga 9: la segnalazione del ricercatore, con l'elenco dei file, arriva il 18/11 alle 09:00.
  - Riga 7: già il 17/11 alle 16:40 un dipendente aveva reso pubblico il contenitore di proposito.
- **Lacune**:
  - Le 72 ore partono dal momento in cui si ha una ragionevole certezza dell'incidente, non dalla fine dell'analisi. La scadenza era il 21/11 alle 09:00. Se si considera ciò che sapeva il dipendente, il momento è perfino anteriore, e va valutato.
  - Alla data della scheda (24/11) il termine era già scaduto, e la scheda non lo rileva.
- **Raccomandazione**:
  - Notificare subito con la procedura telematica del Garante, indicando i motivi del ritardo (art. 33(1)).
  - Se mancano informazioni, usare la notifica per fasi (art. 33(4)) invece di aspettare.
  - Correggere il termine nella scheda e annotare la data di conoscenza.
- **Priorità**: P0
- **Responsabile suggerito**: titolare, con il DPO o il legale
- **Verifica**: ricevuta della notifica con la sezione sui motivi del ritardo.

### AIPCA-09-04: comunicazione agli interessati esclusa a torto
- **Area**: comunicazione agli interessati
- **Stato**: non_conforme
- **Gravità**: critica
- **Rischio**: gli interessati non possono proteggersi (per esempio bloccare o denunciare il documento, vigilare su frodi).
- **Riferimenti**: GDPR art. 34(1), 34(2) e 34(3); art. 12(1), linguaggio chiaro, in particolare per i minori.
- **Evidenze**: `segnalazione` riga 23: «non necessaria, visto il rischio basso». Questa decisione discende dal rilievo 02.
- **Lacune**: nessuna eccezione dell'art. 34(3) sembra applicarsi:
  - (a) i dati esposti non erano incomprensibili;
  - (b) gli scaricamenti sono già avvenuti e nessuna misura successiva elimina il rischio;
  - (c) gli interessati sono identificati e contattabili, quindi la comunicazione non richiede sforzi sproporzionati.
- **Raccomandazione**:
  - Comunicare senza ingiustificato ritardo a genitori e tutori, anche per conto dei figli minori, e agli studenti adulti.
  - Contenuto minimo: natura della violazione, contatto privacy o DPO, conseguenze probabili, misure adottate, consigli pratici (per esempio denuncia e monitoraggio del documento).
  - Testo da far rivedere al legale.
- **Priorità**: P0
- **Responsabile suggerito**: titolare, con il legale
- **Verifica**: testo della comunicazione, elenco degli invii e data.

### AIPCA-09-05: prove non conservate
- **Area**: conservazione delle evidenze
- **Stato**: non_conforme
- **Gravità**: alta
- **Rischio**: persa la possibilità di ricostruire chi ha avuto accesso e a cosa; la responsabilizzazione del titolare non è dimostrabile.
- **Riferimenti**: GDPR artt. 5(2), 33(5) e 28(3)(f).
- **Evidenze**: `segnalazione` riga 11: i log dello storage si cancellano dopo 7 giorni e «non ne è stata fatta una copia». Gli accessi del 17-18/11 sono quindi già persi, o lo saranno a breve.
- **Lacune**: mancano:
  - la copia dei log con data, impronta (hash) e catena di custodia;
  - lo storico delle modifiche ai permessi (ACL) del contenitore;
  - l'elenco completo dei file presenti nel contenitore durante l'esposizione;
  - l'identificazione degli indirizzi, compreso quello del collega esterno e quello del ricercatore.
- **Raccomandazione**:
  - Chiedere subito a Nimbus, responsabile del trattamento (`docs/fornitori.md` riga 7), qualunque log o copia conservata, in base al dovere di assistenza.
  - Conservare quello che resta e documentare la perdita.
  - Chiedere al ricercatore e al collega esterno di cancellare le copie e di confermarlo per iscritto.
  - Portare la conservazione dei log di accesso dello storage oltre i 7 giorni (art. 32), su decisione del titolare.
- **Priorità**: P1
- **Responsabile suggerito**: titolare, sviluppo e Nimbus
- **Verifica**: fascicolo delle evidenze con log o risposta scritta di Nimbus, e conferme di cancellazione.

### AIPCA-09-06: perimetro dei dati e degli interessati non accertato
- **Area**: analisi
- **Stato**: non_verificabile
- **Gravità**: alta
- **Rischio**: interessati e categorie di dati sottostimati, quindi notifica e comunicazione incomplete.
- **Riferimenti**: GDPR art. 33(3)(a).
- **Evidenze**:
  - `scripts/refresh-staging.sh` riga 6: `rclone sync` dell'intero contenitore di produzione in staging.
  - `README.md` righe 21 e 23: lo storage contiene anche le registrazioni delle lezioni, cioè voce e immagine di minori.
  - La scheda (righe 8 e 17) considera solo documenti e note di salute.
- **Lacune**: non è accertato:
  - quali altri file (registrazioni e altro) erano leggibili;
  - se l'elenco dei file è stato letto;
  - quali altri file sono stati scaricati prima che i log scadessero.
- **Raccomandazione**: fare l'inventario del contenitore durante l'esposizione e, se emergono altri dati o interessati, integrare la notifica per fasi.
- **Priorità**: P1
- **Responsabile suggerito**: titolare e sviluppo
- **Verifica**: inventario datato allegato alla scheda.

### AIPCA-09-07: misure correttive inadeguate e causa non rimossa
- **Area**: contenimento e misure
- **Stato**: non_conforme
- **Gravità**: alta
- **Rischio**: la violazione può ripetersi, e dati reali, anche decifrati, restano in un ambiente di prova.
- **Riferimenti**: GDPR artt. 5(1)(c), 25, 32 e 33(3)(d).
- **Evidenze**:
  - `segnalazione` riga 24: solo una «regola interna», e lo script «resta com'è».
  - `scripts/refresh-staging.sh` righe 2-6: copia produzione (database e storage) in staging «così la segreteria prova con dati veri».
  - `config/staging.json` non mostra alcuna configurazione che blocchi l'accesso pubblico.
- **Lacune**: mancano:
  - la rimozione dei dati reali dallo staging;
  - un blocco tecnico dell'accesso pubblico;
  - un canale autorizzato per passare file a esterni;
  - l'analisi della causa.
- **Raccomandazione**:
  - Svuotare lo staging dai dati reali e passare a dati sintetici.
  - Bloccare l'accesso pubblico al contenitore a livello di account o policy.
  - Rivedere lo script e i permessi degli sviluppatori.
  - L'attuazione spetta alla Software Agency, dopo l'approvazione umana.
- **Priorità**: P0
- **Responsabile suggerito**: titolare e Software Agency
- **Verifica**: staging senza dati reali, policy di blocco attiva, script modificato.

### AIPCA-09-08: registro delle violazioni incompleto
- **Area**: registrazione
- **Stato**: non_conforme
- **Gravità**: media
- **Rischio**: la responsabilizzazione del titolare non è dimostrabile davanti al Garante.
- **Riferimenti**: GDPR art. 33(5); Linee guida EDPB 9/2022, sulla documentazione delle violazioni.
- **Evidenze**:
  - `registro.md` righe 3-6: solo numero, data e descrizione.
  - Riga 6: «reso pubblico per errore» (in realtà era intenzionale, come dice la riga 7 della scheda).
  - Riga 5: per la violazione di marzo (38 indirizzi) non risultano valutazione né decisione.
- **Lacune**: mancano, per ogni voce:
  - data di conoscenza;
  - natura della violazione;
  - categorie e numero di dati e interessati;
  - conseguenze;
  - livello di rischio motivato;
  - decisioni su notifica e comunicazione, con i motivi e le date;
  - misure adottate;
  - rimando alla scheda e alle evidenze;
  - chi ha deciso.
- **Raccomandazione**: aggiungere queste colonne e completare la voce 1 (marzo) con la sua valutazione documentata.
- **Priorità**: P2
- **Responsabile suggerito**: titolare o DPO
- **Verifica**: registro con i campi completi per entrambe le voci.

### AIPCA-09-09: ruoli e processo decisionale assenti
- **Area**: organizzazione e segnalazioni
- **Stato**: non_conforme
- **Gravità**: alta
- **Rischio**: decisioni prese senza titolare, DPO o legale, da cui gli errori dei rilievi 01-04.
- **Riferimenti**: GDPR artt. 24, 33 e 38(1).
- **Evidenze**:
  - `segnalazione` riga 3: scheda «compilata dalla segreteria e dallo sviluppatore».
  - Nel progetto non c'è una procedura per gli incidenti (in `docs/` c'è solo `procedura-diritti.md`).
  - `legale/informativa.md` riga 7 indica solo il contatto `privacy@`.
- **Lacune**: mancano:
  - un responsabile delle decisioni e la sua reperibilità;
  - la catena di escalation;
  - la revisione da parte del titolare, del DPO o del legale;
  - le tempistiche interne.
- **Raccomandazione**:
  - Scrivere una procedura per le violazioni: rilevamento, escalation entro ore, valutazione, decisione del titolare, notifica, comunicazione, registro.
  - Far valutare al titolare se serve un DPO (art. 37). Non lo decido qui.
- **Priorità**: P1
- **Responsabile suggerito**: titolare
- **Verifica**: procedura approvata, con ruoli e contatti.

## Domanda aperta (fuori dal perimetro, per AIPCA-01)

`config/backup.yml` righe 5 e 10 mostra backup senza cifratura con una copia a Singapore (Coldvault). Questa copia non compare in `docs/fornitori.md`. Va passata agli specialisti dei fornitori e della sicurezza.

## Matrice delle segnalazioni

| Chi | Cosa | Quando | Stato |
|---|---|---|---|
| Dipendente → titolare | incidente | immediato | non documentato |
| Titolare → DPO o legale | valutazione e decisione | entro poche ore | assente |
| Titolare → Nimbus | assistenza, log e storico dei permessi (art. 28(3)(f)) | subito | assente |
| Titolare → Garante | notifica (art. 33), con i motivi del ritardo | il termine era il 21/11 | da fare subito |
| Titolare → interessati (genitori, tutori, studenti adulti) | comunicazione (art. 34) | senza ingiustificato ritardo | da fare |
| Titolare → ricercatore e collega esterno | richiesta di cancellare le copie e di confermarlo | subito | assente |

## Lista di controllo per le violazioni

- [ ] Data e ora di conoscenza annotate
- [ ] Contenimento: contenitore privato (fatto il 18/11 alle 11:00); dati reali rimossi dallo staging
- [ ] Evidenze conservate con hash e catena di custodia
- [ ] Inventario dei dati e degli interessati
- [ ] Classificazione: riservatezza, integrità, disponibilità
- [ ] Rischio motivato e firmato dal titolare
- [ ] Notifica entro 72 ore, o per fasi con i motivi del ritardo
- [ ] Comunicazione agli interessati, oppure eccezione dell'art. 34(3) motivata
- [ ] Coinvolgimento del fornitore
- [ ] Misure contro la ripetizione
- [ ] Registro completo (art. 33(5))

## Riepilogo per AIPCA-01

- **Esito**: la gestione della violazione è non conforme in tutti i punti esaminati.
- **Rilievi**: 9, di cui 4 P0 (01, 02, 03/04, 07), 4 P1 (05, 06, 09) e 1 P2 (08). I P0 vanno portati subito al titolare.
- **Domande aperte**:
  - i documenti esposti erano davvero decifrati? Lo script versionato non decifra;
  - quali altri file erano nel contenitore;
  - Nimbus conserva log o storico dei permessi;
  - c'è un DPO;
  - la copia di backup a Singapore (vedi sopra).

— MEGREZ (AIPCA-09)
