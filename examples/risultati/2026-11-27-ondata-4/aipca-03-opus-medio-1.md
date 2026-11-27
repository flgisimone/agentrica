«AIPCA-03 · DUBHE — Senior Privacy Legal Specialist, reparto AIPCA (AI Privacy & Compliance)»

# Revisione dei documenti legali di «Parla Subito»: informativa, cookie policy, banner, registro fornitori, README

**Come ho lavorato.** Ho solo letto, non ho cambiato niente. Ho lavorato nella cartella `…/ondata4/copie/aipca-03-1`.
- **Direttore non caricato.** Non ho caricato AIPCA-01 · ARCTURUS, come chiedono le mie istruzioni: non c'è il server MCP e mi è stato permesso un solo comando nel repository Agentrica. Questo rapporto è quindi la consegna che il direttore deve consolidare.
- **Schede della biblioteca.** Le ho lette con `npm run -s agent-text -- aipca-03 --cards decisioni-adeguatezza,ai-act-date,legge-132-2025-ia`. Sono tutte verificate il 2026-11-19 e vanno ricontrollate entro il 2027-05-19.
- **Riferimenti senza scheda.** Non ho usato il web. Per queste fonti non c'è una scheda e non le ho verificate, quindi vanno ricontrollate prima di usarle:
  - Linee guida cookie del Garante del 10/06/2021;
  - art. 122 e art. 2-quinquies del Codice privacy;
  - Linee guida EDPB 05/2020 sul consenso;
  - sentenze CGUE C-673/17 Planet49 e C-311/18 Schrems II.
- **Giurisdizione e data.** UE (GDPR) e Italia (Codice privacy, D.lgs. 196/2003 come modificato dal D.lgs. 101/2018; Garante), alla data del 2026-11-27.
- **Limite.** Questa è una valutazione di supporto per la revisione legale umana, non un parere definitivo.

## Esito
**`non_conforme` su più controlli, con un rilievo P0 da segnalare subito all'utente.** Ho confrontato i documenti con il codice (`public/index.html`, `src/analytics.js`, `src/transcribe.js`, `src/newsletter.js`, `config/retention.json`). Sono emerse affermazioni dell'informativa smentite dai fatti e cookie che richiedono il consenso ma sono dichiarati esenti.

## Segnalazione immediata (P0)
**InsightAI: trascrizione della voce di minori senza accordo art. 28, con trasferimento negli USA senza garanzie e con riuso dei dati per addestrare i modelli.** Va segnalata al Chief e all'utente.
- `src/transcribe.js:4-12`: dopo ogni lezione l'audio parte verso `api.insightai.example`.
- `docs/fornitori.md:11`: accordo art. 28 «in attesa»; trasferimenti «sì»; garanzie «—».
- `docs/fornitori.md:15`: i termini standard dicono che il fornitore «può usare i contenuti inviati per migliorare i propri modelli».

---

## Inventario dei documenti

| Documento | Versione o data | Pubblicazione | Note |
|---|---|---|---|
| `legale/informativa.md` | 1° ottobre 2026 | `parlasubito.example/privacy` | La home rimanda invece a `/privacy.html` (`public/index.html:24`): va verificato che sia la stessa pagina |
| `legale/cookie-policy.md` | 1° ottobre 2026 | `/cookie` (dal banner) | Mancano il titolare e le finalità |
| `legale/banner.html` | senza versione | in fondo a ogni pagina | Contiene banner e modulo di iscrizione rapida |
| `docs/fornitori.md` | 2026-10-15, compilato dalla segreteria | interno | Manca ChatNow |
| `README.md` | senza versione | interno | Descrive dati e architettura |
| Accordi art. 28, nomine e istruzioni agli autorizzati, registro dei trattamenti (art. 30), DPIA | **assenti dal repository** | — | `non_verificabile` |

---

## Rilievi
Formato: `id` · area · titolo · stato · gravità/rischio · riferimenti · evidenze · lacune · raccomandazione con testo proposto · priorità · responsabile suggerito · verifica. Tutti i rilievi sono firmati DUBHE.

### AIPCA-03-01 · Fornitori e trasferimenti · InsightAI senza accordo art. 28 né garanzie di trasferimento, con riuso per addestramento · `non_conforme` · gravità critica, rischio alto · P0
- **Riferimenti.** GDPR artt. 28(1)-(3), 29, 44-46, 9 (la voce di per sé non è un dato biometrico, salvo usi di identificazione), 8 e considerando 38 (minori). L. 132/2025 art. 4 c. 4 (scheda `legge-132-2025-ia`): sotto i 14 anni l'uso di tecnologie di IA e il relativo trattamento richiedono il consenso di chi esercita la responsabilità genitoriale. Scheda `decisioni-adeguatezza`: verso gli USA il trasferimento è adeguato solo se l'organizzazione è certificata nel Data Privacy Framework (DPF), altrimenti servono altre garanzie.
- **Evidenze.** `src/transcribe.js:4-12`; `docs/fornitori.md:11,15`; l'informativa a riga 26 dice «nominati responsabili… I dati restano nell'Unione europea… mai usati per finalità diverse».
- **Lacune.**
  - Il trattamento è già in corso, senza contratto e senza garanzie art. 46.
  - Se il fornitore usa i dati per i propri modelli, per quella parte diventa titolare autonomo: c'è una comunicazione a terzi che l'informativa non dichiara.
  - Manca una valutazione preliminare della DPIA: ci sono dati di minori, una tecnologia nuova e un trasferimento extra-SEE.
- **Raccomandazione.**
  - Sospendere l'invio a InsightAI finché non ci sono tre cose: un accordo art. 28 che vieti il riuso per l'addestramento; la certificazione DPF verificata, oppure le SCC 2021/914 modulo 2 con una valutazione del trasferimento (TIA); la verifica preliminare della DPIA (AIPCA DPIA).
  - Aggiornare l'informativa. Testo proposto: «Le registrazioni delle lezioni sono trascritte automaticamente da InsightAI Inc. (USA), nominata responsabile del trattamento. Il trasferimento negli Stati Uniti avviene sulla base di [certificazione al Data Privacy Framework UE-USA / clausole contrattuali tipo approvate dalla Commissione, decisione (UE) 2021/914], di cui si può chiedere copia a privacy@parlasubito.example. Il fornitore non può usare le registrazioni per finalità proprie, compreso l'addestramento di modelli. Per gli studenti sotto i 14 anni la trascrizione automatica richiede il consenso di chi esercita la responsabilità genitoriale.»
- **Responsabile suggerito.** Titolare e DPO; la sospensione tecnica spetta alla Software Agency, previa approvazione dell'utente.
- **Verifica.** Accordo firmato; certificazione DPF consultata con data; flag o configurazione che blocca l'invio senza i presupposti.

### AIPCA-03-02 · Informativa, basi giuridiche · Iscrizione e corsi fondati su un consenso obbligatorio · `non_conforme` · rischio alto · P1
- **Riferimenti.** GDPR art. 6(1)(b) e 6(1)(a); art. 7(4); considerando 42-43; Linee guida EDPB 05/2020 (consenso non libero se condiziona il contratto).
- **Evidenze.** Informativa righe 17 e 22 («Senza il consenso alla prima finalità non è possibile iscriversi»); in `legale/banner.html:11` la casella «do il consenso al trattamento» è obbligatoria.
- **Lacune.**
  - Il consenso preteso per eseguire il contratto non è libero.
  - La casella unisce la presa visione dell'informativa e il consenso.
  - Per le registrazioni destinate agli assenti va scelta una base specifica: contratto, legittimo interesse con bilanciamento, oppure consenso revocabile. È una **questione interpretativa** per il legale, anche per l'immagine di minori e insegnanti.
- **Testo proposto.**
  - Tabella dell'informativa:
    - «Iscrizione, organizzazione dei corsi e videolezioni | Esecuzione del contratto (art. 6.1.b GDPR)»;
    - «Registrazione delle lezioni per chi è assente | [base da definire con il legale]».
  - Modulo: sostituire la casella con il testo «Proseguendo dichiari di aver letto l'[informativa](/privacy).», senza casella di consenso.
- **Responsabile suggerito.** Legale o DPO; il testo lo attua la Software Agency.
- **Verifica.** Nuova versione dell'informativa e del modulo.

### AIPCA-03-03 · Informativa, categorie particolari · Dati sulla salute raccolti ma non dichiarati · `non_conforme` · rischio alto · P1
- **Riferimenti.** GDPR artt. 9(1), 9(2)(a), 13(1)(c); art. 8 e art. 2-septies del Codice privacy (misure di garanzia) da verificare.
- **Evidenze.** `public/index.html:19` raccoglie «allergie, disturbi dell'apprendimento»; anche il README (riga 7) cita le note di salute. L'informativa non le nomina (riga 11).
- **Lacune.** Mancano finalità, base art. 9 (consenso esplicito, distinto e facoltativo), destinatari (solo gli insegnanti della classe) e conservazione.
- **Testo proposto.** «Se lo desideri, puoi indicarci informazioni sulla salute dello studente (per esempio allergie o disturbi dell'apprendimento), utili all'insegnante per adattare la lezione. Sono facoltative: il loro trattamento si basa sul tuo consenso esplicito (art. 9.2.a GDPR), revocabile in ogni momento, e sono visibili solo agli insegnanti delle classi dello studente. Le cancelliamo [a fine corso / entro N mesi].» Nel modulo serve una casella dedicata, non preselezionata.
- **Responsabile suggerito.** Legale o DPO.
- **Verifica.** Testo aggiornato e casella presente nel modulo.

### AIPCA-03-04 · Informativa, trasferimenti e destinatari · Affermazioni non veritiere su destinatari, ruoli e luogo dei dati · `non_conforme` · rischio alto · P1
- **Riferimenti.** GDPR artt. 5(1)(a), 13(1)(e)-(f), 12(1).
- **Evidenze.**
  - Informativa riga 26: «nominati responsabili», «I dati restano nell'Unione europea», «mai usati per finalità diverse».
  - `docs/fornitori.md`:
    - riga 8: PagaFacile è titolare autonomo;
    - riga 9: LessonCam fa supporto tecnico dagli USA;
    - riga 10: Mailorbit è negli USA;
    - riga 11: InsightAI è negli USA.
  - ChatNow (`public/index.html:26`) manca dall'informativa e dal registro.
- **Testo proposto.** «Destinatari: fornitori nominati responsabili del trattamento (hosting: Nimbus Hosting GmbH, Germania; videolezioni: LessonCam Inc.; newsletter: Mailorbit LLC; trascrizione: InsightAI Inc.; chat di assistenza: ChatNow [da qualificare]). PagaFacile S.p.A. tratta i dati di pagamento come titolare autonomo, con una propria informativa [link]. Alcuni fornitori hanno sede negli Stati Uniti o vi prestano assistenza: i trasferimenti avvengono sulla base di [DPF / SCC 2021/914], di cui si può chiedere copia a privacy@parlasubito.example.»
- **Responsabile suggerito.** Legale o DPO.
- **Verifica.** Coerenza riga per riga fra informativa e registro fornitori.

### AIPCA-03-05 · Fornitori · Mailorbit con garanzia «Privacy Shield», non più valida · `non_conforme` · rischio alto · P1
- **Riferimenti.** CGUE C-311/18 (16/07/2020); GDPR artt. 44-46; scheda `decisioni-adeguatezza` (DPF del 10 luglio 2023, solo per le organizzazioni certificate).
- **Evidenze.** `docs/fornitori.md:10`; accordo del 2024-06-01.
- **Lacune.** Il trasferimento è privo di base valida, a meno che Mailorbit sia certificata DPF (da verificare nell'elenco ufficiale) o che ci siano SCC.
- **Testo proposto per il registro.** Colonna «Garanzie»: «DPF: certificazione verificata il [data] / oppure SCC 2021/914 modulo 2 firmate il [data]».
- **Responsabile suggerito.** Ufficio acquisti e DPO (con AIPCA vendor).
- **Verifica.** Evidenza DPF o SCC allegata.

### AIPCA-03-06 · Cookie · `ps_stats` e `chatnow_id` dichiarati esenti ma soggetti a consenso · `non_conforme` · rischio alto · P1
- **Riferimenti.** Art. 122 del Codice privacy (art. 5(3) direttiva ePrivacy). Linee guida cookie del Garante 10/06/2021: un cookie analitico è assimilabile ai tecnici solo se il dato è minimizzato o aggregato, non incrociato e senza identificazione. Il legittimo interesse non è una base per i cookie non tecnici.
- **Evidenze.**
  - `cookie-policy.md:9`: identificativo del visitatore «conservato in chiaro», 24 mesi, «legittimo interesse».
  - `src/analytics.js:5`: invia lo `userId`.
  - `cookie-policy.md:10`: ChatNow fa «profilo del visitatore per il fornitore».
  - `public/index.html:26`: lo script ChatNow si carica su ogni pagina, senza interazione.
- **Lacune.** Il servizio di chat «richiesto» non giustifica il caricamento preventivo né la profilazione per finalità del fornitore.
- **Testo proposto per la cookie policy.**
  - «`ps_stats` | statistiche d'uso | Parla Subito | [durata] | **sì, con il tuo consenso** (o, in alternativa, solo se reso anonimo e aggregato come indicato dal Garante)»;
  - «`chatnow_id` | chat di assistenza e profilazione da parte di ChatNow | ChatNow [sede, link alla sua informativa] | 13 mesi | **sì**: la chat si attiva solo dopo il consenso o quando apri la chat».
- **Responsabile suggerito.** Legale; la parte tecnica spetta alla Software Agency.
- **Verifica.** Prova da browser pulito: nessun cookie e nessuna chiamata non tecnica prima della scelta.

### AIPCA-03-07 · Banner · Consenso per prosecuzione della navigazione, senza rifiuto né scelta granulare · `non_conforme` · rischio alto · P1
- **Riferimenti.** Linee guida Garante 2021 (lo scrolling o la prosecuzione non valgono come consenso; serve una «X» o un «Rifiuta» per chiudere senza consenso; comandi con pari evidenza); GDPR artt. 4(11), 7; Linee guida EDPB 05/2020.
- **Evidenze.** `legale/banner.html:3-5`: «Continuando la navigazione accetti l'uso di tutti i cookie»; c'è solo «Accetta»; «Gestisci» è un link piccolo verso la policy.
- **Testo proposto.** «Usiamo cookie tecnici, necessari al sito, e, solo con il tuo consenso, cookie per le statistiche d'uso e per la chat di assistenza di ChatNow, che crea un profilo del visitatore. Puoi accettare, rifiutare o scegliere per finalità; puoi cambiare idea in ogni momento dal link «Preferenze cookie» in fondo alla pagina. [Cookie policy]». Tre pulsanti con la stessa evidenza: «Accetta tutti», «Rifiuta», «Scegli», più una «X» che equivale al rifiuto.
- **Responsabile suggerito.** Legale; design (AIWDA) e software per la realizzazione.
- **Verifica.** Registro delle scelte; link persistente per le preferenze.

### AIPCA-03-08 · Consenso marketing · Newsletter preselezionata e unita alle «offerte»; la revoca non ha effetto · `non_conforme` · rischio alto · P1
- **Riferimenti.** GDPR artt. 4(11), 7(2)-(3), 21(2)-(3); considerando 32; CGUE C-673/17 Planet49; art. 130 del Codice privacy.
- **Evidenze.**
  - `banner.html:10`: casella `checked`, «newsletter e le offerte».
  - Informativa riga 19: dice solo «Newsletter».
  - `src/newsletter.js:7` imposta `newsletter = false`, mentre la sincronizzazione notturna (riga 13) filtra su `marketing_consent`. Quindi chi si disiscrive resta nella lista Mailorbit. È una discrepanza fra documento e funzionalità: la passo all'AIPCA diritti.
- **Testo proposto.** Casella non preselezionata: «Voglio ricevere la newsletter di Parla Subito (facoltativo; puoi disiscriverti in ogni momento dal link in ogni email)». Le «offerte», se previste, vanno in una casella separata e in una riga dell'informativa: «Comunicazioni promozionali | Consenso (art. 6.1.a), revocabile».
- **Responsabile suggerito.** Legale; la correzione del codice spetta alla Software Agency.
- **Verifica.** Una disiscrizione di prova con dati sintetici deve togliere il contatto dalla lista alla sincronizzazione successiva.

### AIPCA-03-09 · Informativa, contenuti obbligatori · Mancano conservazione, diritti, reclamo, natura del conferimento, legittimo interesse, DPO · `non_conforme` · rischio medio · P2
- **Riferimenti.** GDPR art. 13(1)(b),(d) e 13(2)(a)-(e); artt. 15-22; art. 77; art. 12(3).
- **Evidenze.**
  - Informativa riga 30: solo «tempo necessario».
  - `config/retention.json`: registrazioni 30 giorni, log di audit 90 giorni, messaggi 365 giorni, fatture 10 anni.
  - Riga 34: cita solo accesso, rettifica e cancellazione.
  - Riga 20: legittimo interesse senza indicare quale.
- **Testo proposto.**
  - «**Per quanto tempo**: registrazioni delle lezioni e trascrizioni, 30 giorni; messaggi, 12 mesi; registri di sicurezza, 90 giorni; fatture e documenti contabili, 10 anni (art. 2220 c.c.); dati dell'account, fino alla cancellazione [e poi N giorni nei backup]; newsletter, fino alla revoca.»
  - «**I tuoi diritti**: accesso, rettifica, cancellazione, limitazione, portabilità, opposizione al trattamento basato sul legittimo interesse e al marketing, revoca del consenso in ogni momento senza effetti sui trattamenti precedenti. Rispondiamo gratuitamente entro un mese. Puoi proporre reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).»
  - «**Conferimento**: i dati anagrafici e di contatto sono necessari per l'iscrizione; telefono, note sulla salute e newsletter sono facoltativi.»
  - DPO: [indicare i contatti, se nominato].
- **Questione aperta.** Se le statistiche restano basate sul legittimo interesse, serve un test di bilanciamento documentato.
- **Responsabile suggerito.** Legale o DPO.
- **Verifica.** Checklist art. 13 riga per riga.

### AIPCA-03-10 · Minori · Soglia dei 14 anni applicata anche al contratto; informativa non adatta ai minori · `parzialmente_conforme` · rischio medio · P2
- **Riferimenti.** GDPR art. 8 (consenso per i servizi della società dell'informazione), art. 12(1), considerando 38 e 58; art. 2-quinquies del Codice privacy (14 anni); L. 132/2025 art. 4 c. 4 (scheda).
- **Evidenze.** Informativa riga 38: «dai 14 anni lo studente si iscrive da sé». README riga 3: studenti dagli 8 anni. Il modulo di prova (`banner.html:8-12`) non chiede l'età.
- **Lacune.**
  - **Questione interpretativa:** la soglia dei 14 anni riguarda il consenso, mentre l'iscrizione è un contratto. La capacità d'agire di un minore di 14-17 anni per un contratto a pagamento va valutata dal legale.
  - Manca un'informativa breve in linguaggio per ragazzi.
- **Testo proposto.** «Se hai meno di 18 anni: [versione semplice in poche righe]. Per gli studenti sotto i 14 anni l'iscrizione, il consenso alla trascrizione automatica e le richieste sui dati spettano a chi esercita la responsabilità genitoriale.»
- **Responsabile suggerito.** Legale.
- **Verifica.** Testo per i minori pubblicato; controllo dell'età nel modulo.

### AIPCA-03-11 · Interessati non coperti · Insegnanti e personale assenti dall'informativa; IA usata sulla loro voce · `non_verificabile` · rischio medio · P2
- **Riferimenti.** GDPR art. 13 e 88; L. 132/2025 art. 11 (informare il lavoratore dell'uso dell'IA, secondo l'art. 1-bis del D.lgs. 152/1997); art. 4 della L. 300/1970 per le videoregistrazioni, che è una **questione interpretativa**.
- **Evidenze.** README righe 9-10; `docs/fornitori.md:9,11` (voce e immagine degli insegnanti).
- **Lacune.** Non c'è evidenza di un'informativa per insegnanti e personale, né di nomine o istruzioni agli autorizzati (art. 29, art. 2-quaterdecies del Codice) e di impegni di riservatezza.
- **Raccomandazione.** Un'informativa dedicata ai collaboratori, con la parte sull'IA.
- **Responsabile suggerito.** Titolare (risorse umane) e legale.
- **Verifica.** Documenti firmati.

### AIPCA-03-12 · Cookie policy, contenuti · Mancano titolare, finalità, terze parti, revoca · `parzialmente_conforme` · rischio medio · P2
- **Riferimenti.** Art. 122 del Codice privacy; Linee guida Garante 2021 (informativa estesa); GDPR art. 13.
- **Evidenze.** `cookie-policy.md:5-12`: a riga 12 indica solo le impostazioni del browser.
- **Testo proposto.** «Titolare: Parla Subito S.r.l. … Per i cookie di terze parti (ChatNow) vale anche l'informativa del fornitore: [link]. Puoi dare o revocare il consenso in ogni momento dal link «Preferenze cookie» in fondo a ogni pagina; il rifiuto non impedisce l'uso del sito.»
- **Responsabile suggerito.** Legale.
- **Verifica.** Nuova versione con data.

### AIPCA-03-13 · Fornitori · Certificazione LessonCam scaduta e perimetro diverso dai dati · `parzialmente_conforme` · rischio basso · P3
- **Riferimenti.** GDPR art. 28(1) (garanzie sufficienti), art. 32.
- **Evidenze.** `docs/fornitori.md:9`: ISO 27001 «uffici di Dublino, scadenza 2025-12-31», scaduta alla data odierna. Il DPF va riconfermato con la data di consultazione (scheda `decisioni-adeguatezza`).
- **Raccomandazione.** Chiedere il certificato in corso e verificarne il perimetro sul data center.
- **Responsabile suggerito.** Ufficio acquisti.
- **Verifica.** Certificato aggiornato nel registro.

### Segnalazioni ad altri specialisti, fuori dal mio perimetro (non le valuto)
- **AIPCA diritti degli interessati.** In `docs/procedura-diritti.md`:
  - riga 4: risposta entro 60 giorni, contro un mese (art. 12(3));
  - riga 5: accesso a 10 euro, mentre deve essere gratuito (art. 12(5));
  - riga 2: dati inviati senza identificare il richiedente;
  - riga 1: usa una casella personale.
- **AIPCA data governance.** `scripts/refresh-staging.sh:2-6` copia in staging i dati di produzione, compresi minori e salute, «così la segreteria prova con dati veri». È una finalità non dichiarata nell'informativa (art. 5(1)(b)-(c), art. 25).

---

## Tabella requisito / evidenza / lacuna

| Requisito | Evidenza | Lacuna | Tipo | Rilievo |
|---|---|---|---|---|
| Identità del titolare e contatti (13.1.a) | Informativa riga 7 | Nessuna | — | conforme_verificato (solo per questo punto) |
| Dati di contatto del DPO (13.1.b) | assente | Da indicare se nominato | documentale | 03-09 |
| Finalità e basi giuridiche (13.1.c) | Righe 15-22 | Consenso obbligatorio per il contratto | documentale | 03-02 |
| Legittimo interesse specificato (13.1.d) | Riga 20 | Non indicato, manca il bilanciamento | documentale e interpretativa | 03-09, 03-06 |
| Categorie particolari (art. 9) | `public/index.html:19` | Non dichiarate, manca la base | documentale | 03-03 |
| Destinatari (13.1.e) | Riga 26 | Ruoli errati, ChatNow assente | documentale | 03-04 |
| Trasferimenti extra-SEE (13.1.f) | Riga 26 contro il registro | Affermazione falsa | documentale | 03-04, 03-01, 03-05 |
| Conservazione (13.2.a) | Riga 30 contro `retention.json` | Periodi non indicati | documentale | 03-09 |
| Diritti, revoca, reclamo (13.2.b-d) | Riga 34 | Incompleti | documentale | 03-09 |
| Natura del conferimento (13.2.e) | assente | Da indicare | documentale | 03-09 |
| Minori (art. 8, art. 12) | Riga 38 | Soglia dei 14 anni sul contratto; manca un testo semplice | interpretativa | 03-10 |
| Accordi art. 28 | Registro | InsightAI in attesa; accordi non nel repository | documentale | 03-01 |
| Garanzie artt. 44-46 | Registro | Privacy Shield; InsightAI senza garanzie | documentale | 03-05, 03-01 |
| Consenso ai cookie (art. 122 del Codice) | Banner e policy | Scrolling, nessun rifiuto, cookie non tecnici esenti | documentale | 03-06, 03-07 |
| Consenso marketing libero e specifico | `banner.html:10` | Casella preselezionata e unita alle offerte; la revoca non funziona | documentale e tecnica | 03-08 |
| Informativa ai collaboratori (L. 132/2025 art. 11) | assente | Da redigere | documentale e interpretativa | 03-11 |

## Domande aperte per l'utente e il legale
1. È stato nominato un DPO?
2. Su quale base si fondano le registrazioni delle lezioni, che includono l'immagine di minori e insegnanti?
3. L'iscrizione autonoma dai 14 anni è un contratto valido?
4. Mailorbit, LessonCam e InsightAI sono certificate DPF? Servono le date di consultazione.
5. Che ruolo ha ChatNow (responsabile o titolare autonomo), dove ha sede e con quale accordo?
6. Le «offerte» sono una finalità prevista?
7. Esistono, fuori dal repository, accordi art. 28, registro art. 30, DPIA e nomine degli autorizzati?
8. La pagina `/privacy.html` collegata dalla home è la versione del 1° ottobre 2026?

## Riepilogo

| Priorità | Rilievi |
|---|---|
| P0 | 1 (03-01) |
| P1 | 7 (03-02 … 03-08) |
| P2 | 4 (03-09 … 03-12) |
| P3 | 1 (03-13) |
| Segnalazioni ad altri specialisti | 2 |

I riferimenti al Garante 2021, all'EDPB e alla CGUE vengono dalle mie conoscenze: vanno verificati sulle fonti ufficiali prima della revisione legale. Ho lavorato su Opus, il modello della sessione. Il rilievo P0 e i rilievi P1 vanno comunque consolidati da AIPCA-01 · ARCTURUS, che qui non ho potuto caricare.

— AIPCA-03 · DUBHE
