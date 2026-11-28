AIPCA-09 · MEGREZ — Senior Data Breach & Incident Response Specialist, reparto AIPCA (AI Privacy & Compliance)

Non ho caricato AIPCA-01 e non ho letto schede della biblioteca: AIPCA-09 ha solo schede su AI Act, adeguatezza e L. 132/2025, che non toccano questo compito. Non ho fatto verifiche sul web e non ho modificato nulla. Ho letto `violazione/registro.md`, `violazione/segnalazione-2026-11.md` e `docs/fornitori.md`, solo per i fornitori. Il modello di lavoro è Sonnet: i rilievi P0 e P1 qui sotto vanno riesaminati dal direttore del reparto o da un revisore su Opus prima di diventare definitivi.

## Esito

La scheda di novembre contiene errori sostanziali su tutte e sei le aree richieste. Sul fatto che la notifica debba partire, e subito, il quadro è chiaro. La valutazione finale resta al titolare, al DPO e al legale. Il rapporto non decide la notificabilità.

## Segnalazione immediata (P0)

Sono tre punti da portare subito ai responsabili.

1. **Il termine delle 72 ore è già scaduto.**
   - Scheda, "Decisioni", riga 22.
   - Il termine corre dal momento in cui il titolare ne è venuto a conoscenza (art. 33(1) GDPR), non dalla fine dell'analisi interna.
   - Il titolare ne è venuto a conoscenza il 18 novembre alle 09:00, con la segnalazione del ricercatore. Il termine scadeva il 21 novembre alle 09:00.
   - Oggi è il 27 novembre, quindi la notifica è in ritardo di circa 6 giorni.
   - Il "27 novembre" scritto nella scheda è errato.
   - **Azione:** notificare subito al Garante, senza aspettare altro. Il ritardo va motivato nella notifica (art. 33(1), ultimo periodo). Le informazioni mancanti si possono dare per fasi (art. 33(4)).
2. **Le prove stanno per perdersi, o si sono già perse.**
   - Scheda, riga 11.
   - I log dello storage si cancellano dopo 7 giorni e non ne è stata fatta una copia.
   - Il log del 17 novembre alle 22:13 scade il 24 novembre. Il log del 18 novembre alle 03:50 scade il 25 novembre.
   - **Azione:** verificare oggi con Nimbus se i log esistono ancora. Se ci sono, esportarli con hash e custodia. Se non ci sono, registrare la perdita e chiedere a Nimbus eventuali copie o log di rete. Sospendere la cancellazione automatica per i log di sicurezza.
3. **Il rischio è sottostimato.**
   - Scheda, "Valutazione", righe 16-18.
   - Il rischio è alto e va riscritto (rilievi 1 e 2).
   - La comunicazione agli interessati è dovuta (rilievo 5).

## Rilievi

### 1. Tipo di violazione errato

- **Stato:** non_conforme. **Priorità:** P1.
- **Punto del documento:** riga 16, "nessuna violazione di riservatezza, perché i file non sono stati modificati né cancellati".
- **Riferimento:** art. 4(12) GDPR. La violazione include la divulgazione non autorizzata e l'accesso non autorizzato ai dati, non solo la modifica o la cancellazione.
- **Fatti nella scheda:**
  - Il contenitore è stato leggibile da chiunque per circa 18 ore (dal 17 novembre alle 16:40 al 18 novembre alle 11:00).
  - I log mostrano due scaricamenti completi da indirizzi esterni.
  - È stato condiviso anche un file con un collega esterno.
- **Classificazione corretta:** violazione di riservatezza, con accesso non autorizzato confermato.
- **Azione:** riclassificare come violazione di riservatezza. Verificare disponibilità e integrità solo se servono, ma non usarle per escludere la riservatezza.

### 2. Valutazione del rischio errata

- **Stato:** non_conforme. **Priorità:** P1.
- **Punto del documento:** riga 18, "Rischio: basso, perché in produzione i documenti sono cifrati con AES-256-GCM".
- **Riferimento:** art. 33(1) e art. 34(1); considerando 75-76 (l'effetto cifratura vale solo se i dati sono davvero illeggibili ai terzi).
- **Il ragionamento non regge perché:**
  - La riga 8 dice che i documenti d'identità sono stati decifrati dallo script di aggiornamento e salvati in chiaro nello staging. La cifratura di produzione non protegge questa copia.
  - `note-salute.csv` contiene dati sulla salute (art. 9), di cui 71 su minorenni (interessati vulnerabili).
  - I documenti d'identità espongono a furto d'identità e frode.
  - Il download è confermato.
- **Fattori mancanti:** volume (412 + 96), accesso confermato, impossibilità di sapere chi abbia i dati e cosa ne farà, dati non recuperabili.
- **Esito atteso:** rischio probabilmente alto per i diritti e le libertà. La decisione spetta a titolare e DPO.
- **Azione:** rifare la valutazione con una metodologia documentata (per esempio le linee guida EDPB 9/2022). Annotare sia gli elementi che aumentano il rischio sia quelli che lo riducono.

### 3. Data di conoscenza e termine di 72 ore

- **Stato:** non_conforme. **Priorità:** P0.
- **Punto del documento:** riga 22 (vedi segnalazione immediata).
- **Riferimento:** art. 33(1) e (4); linee guida EDPB 9/2022.
- **Altro errore:** la scheda indica solo l'ora della segnalazione del ricercatore. Va indicato esplicitamente il momento di conoscenza e il suo fondamento, cioè l'email delle 09:00 del 18 novembre. Va verificato se qualcuno nel titolare lo sapesse prima, per esempio lo sviluppatore che ha reso pubblico il contenitore. Per il titolare la conoscenza va valutata sul fatto, non sulla fine dell'analisi.
- **Azione:** notificare subito. Nella notifica indicare data e ora di conoscenza, le cause del ritardo e un piano di aggiornamenti successivi.

### 4. Notifica incompleta nei contenuti

- **Stato:** non_verificabile. **Priorità:** P1.
- **Punto del documento:** righe 22-24.
- **Riferimento:** art. 33(3).
- **Cosa manca nella scheda:**
  - La natura della violazione, con categorie e numero approssimativo di interessati e di registrazioni.
  - Il nome e i contatti del DPO o di un altro referente.
  - Le conseguenze probabili.
  - Le misure adottate o proposte.
- **Dubbio:** non è chiaro se la notifica sia già stata inviata. La scheda parla al futuro e non ne indica la data.
- **Azione:** preparare la notifica con tutti i punti dell'art. 33(3), tramite la procedura telematica del Garante. Registrare data, ora e ricevuta d'invio.

### 5. Comunicazione agli interessati

- **Stato:** non_conforme. **Priorità:** P1.
- **Punto del documento:** riga 23, "non necessaria, visto il rischio basso".
- **Riferimento:** art. 34(1)-(3).
- **Perché non regge:**
  - La premessa (rischio basso) è errata (rilievo 2).
  - Nessuna delle esenzioni dell'art. 34(3) è documentata. La cifratura non vale, perché i dati nello staging erano in chiaro. Non risultano misure successive che escludano il rischio. La comunicazione non è sproporzionata: gli interessati sono 412 genitori e 96 studenti.
  - Per gli studenti minorenni la comunicazione va ai genitori o ai tutori.
- **Contenuto** (art. 34(2)): linguaggio semplice, natura della violazione, contatto del DPO, conseguenze probabili, misure adottate, consigli (per esempio vigilare su furti d'identità e documenti d'identità compromessi).
- **Azione:** comunicare senza ingiustificato ritardo. Il Garante può comunque imporre la comunicazione (art. 34(4)). Annotare nel registro la decisione e le sue ragioni.

### 6. Conservazione delle prove

- **Stato:** non_conforme. **Priorità:** P0.
- **Punto del documento:** riga 11 (vedi segnalazione immediata).
- **Riferimento:** art. 5(2), art. 33(5) (documentare i fatti), art. 32.
- **Altre carenze nella scheda:**
  - Non c'è copia dei log, né un'attestazione della catena di custodia.
  - Non ci sono la chiusura e verifica dei permessi, e nemmeno un accertamento su chi ha ricevuto il file di prova (il collega esterno).
  - Non risultano richieste ai due indirizzi esterni né un impegno alla cancellazione da parte del collega.
  - Non c'è traccia della segnalazione a Nimbus come responsabile (art. 28(3)(f), coordinamento con il fornitore).
- **Azione:** raccogliere e sigillare ogni evidenza disponibile. Richiedere a Nimbus i log di accesso e di rete. Chiedere conferma scritta e cancellazione al collega esterno. Verificare con il ricercatore se abbia scaricato i dati. Annotare tutto nella scheda.

### 7. Misure correttive insufficienti

- **Stato:** non_conforme. **Priorità:** P1.
- **Punto del documento:** riga 24.
- **Riferimento:** art. 32 e art. 25.
- **Problemi:**
  - La regola "mai rendere pubblico lo storage" è un'istruzione e non una misura tecnica.
  - Lo script di aggiornamento di staging "resta com'è". Lo script decifra i dati di produzione e li copia in staging, che era la causa remota dell'esposizione. Non è stata adottata nessuna misura (per esempio dati sintetici o anonimizzati in staging).
  - Mancano un blocco tecnico dell'accesso pubblico e la rotazione degli accessi, oltre a monitoraggio e avvisi.
  - Non risulta una pulizia dei dati già copiati.
- **Azione:** sostituire i dati reali in staging con dati sintetici o anonimizzati. Bloccare la pubblicazione dei contenitori a livello di piattaforma. Applicare controlli di accesso e avvisi. Valutare con Nimbus il blocco di default. Queste sono raccomandazioni: l'attuazione spetta alla Software Agency, con l'approvazione dell'utente.

### 8. Registro delle violazioni incompleto

- **Stato:** parzialmente_conforme. **Priorità:** P1.
- **Punto del documento:** `registro.md`, riga 6, e righe 1-6 in generale.
- **Riferimento:** art. 33(5).
- **Cosa manca:** per la violazione 2 il registro riporta solo data e titolo. Mancano fatti, effetti, provvedimenti, data e ora di conoscenza, valutazione del rischio, decisione e motivazione sulla notifica al Garante e sulla comunicazione agli interessati, data della notifica, categorie e numero di interessati, evidenze. Lo stesso vale per la violazione 1.
- **Altro:** la data del registro è 2026-11-17 (data dell'evento). Andrebbero indicate sia la data dell'evento sia quella della conoscenza.
- **Azione:** completare il registro con tutti gli elementi, compresi gli aggiornamenti successivi. Va documentata anche una decisione di non notifica.

### 9. Violazione n. 1 (newsletter di marzo)

- **Stato:** non_verificabile. **Priorità:** P2.
- **Punto del documento:** `registro.md`, riga 5.
- **Rilievo:** 38 indirizzi email esposti ai destinatari. Non risultano né una valutazione del rischio né una decisione sulla notifica. Va documentata la valutazione dell'epoca (anche se si è concluso che non occorreva notificare).
- **Azione:** completare il registro con la valutazione fatta all'epoca, se esiste.

### 10. Cronologia incompleta e ruoli

- **Stato:** non_verificabile. **Priorità:** P2.
- **Punto del documento:** righe 3, 9, 12.
- **Rilievi:**
  - La scheda è compilata da segreteria e sviluppatore. Non risultano il coinvolgimento del DPO né la decisione del titolare.
  - Mancano i nomi dei ruoli, la catena di segnalazione e il tempo tra la ricezione dell'email e le azioni.
  - La scheda non spiega perché ci sono voluti 6 giorni per concludere l'analisi interna (dal 18 al 24 novembre), a fronte dell'obbligo di notificare entro 72 ore.
  - Manca una segnalazione al fornitore Nimbus e l'esame del contratto art. 28.
- **Azione:** documentare ruoli, tempi e decisioni, con la firma del titolare. Verificare che il canale `privacy@parlasubito.example` sia presidiato (reperibilità fuori orario).

## Domande aperte

- Il Garante è già stato notificato? Se sì, quando?
- Esistono ancora i log di Nimbus?
- Chi era il collega esterno e ha cancellato il file?
- Chi è il DPO, e ha valutato la scheda?
- Esistono documenti d'identità o note di salute duplicati in altri ambienti?

Fuori dal perimetro, ma da segnalare in breve: in `docs/fornitori.md` Mailorbit LLC ha come garanzia "Privacy Shield", invalidato da Schrems II, e InsightAI tratta voce di minorenni senza accordo art. 28. Sono temi per i rispettivi specialisti del reparto.

**Firmato:** AIPCA-09 · MEGREZ. Questa è una valutazione di supporto e non un parere legale: la decisione su notifica e comunicazione resta a titolare, DPO e consulente legale.
