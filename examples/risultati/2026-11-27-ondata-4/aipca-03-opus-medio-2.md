AIPCA-03 · DUBHE — Senior Privacy Legal Specialist, reparto AIPCA (AI Privacy & Compliance)

# Revisione legale di informativa, cookie policy e banner. Progetto «Parla Subito»

**Perimetro.** Ho letto, senza modificarli, `legale/informativa.md`, `legale/cookie-policy.md`, `legale/banner.html`, `docs/fornitori.md` e `README.md`. Per confrontare i documenti con le funzioni reali ho letto anche `public/index.html`, `src/analytics.js`, `src/transcribe.js`, `src/newsletter.js`, `config/retention.json` e `config/default.json`. Non ho letto `violazione/`, `docs/procedura-diritti.md`, `db/` e `scripts/`.

**Giurisdizione e data.** UE e Italia, al 2026-11-27. Le fonti usate:
- GDPR (Reg. UE 2016/679).
- Codice privacy (D.lgs. 196/2003, come modificato dal D.lgs. 101/2018), in particolare l'art. 122 (cookie), l'art. 130 (marketing) e l'art. 2-quinquies (minori).
- Linee guida del Garante su cookie e altri strumenti di tracciamento, 10 giugno 2021.

**Limiti.**
- Non avevo il server MCP, quindi non ho potuto caricare il direttore AIPCA-01 · ARCTURUS. Gli consegno il rapporto in questa forma.
- Ho letto le schede della biblioteca (comando `agent-text`): «Decisioni di adeguatezza», «L. 132/2025», «AI Act date». Tutte e tre sono verificate il 2026-11-19 e da ricontrollare entro il 2027-05-19.
- Non avevo accesso al web. I riferimenti al GDPR, al Codice privacy, alle linee guida del Garante e alle sentenze della CGUE vengono dalle mie conoscenze e non da schede della biblioteca: vanno verificati sulla fonte prima di usarli.
- I rilievi sono una valutazione di supporto per la revisione legale umana, non un parere legale definitivo né una dichiarazione di conformità.

---

## Segnalazione immediata (P0)

**PL-01. Trascrizione con InsightAI: voci di minori inviate negli USA senza accordo, senza garanzie e con uso per addestrare i modelli. L'informativa dice il contrario.**

- **Evidenze:**
  - `docs/fornitori.md:11`: accordo art. 28 «in attesa», trasferimento «sì», garanzie «—», sede USA.
  - `docs/fornitori.md:15`: secondo i termini di servizio «il fornitore può usare i contenuti inviati per migliorare i propri modelli».
  - `src/transcribe.js:8-12`: l'audio di ogni lezione viene già inviato a `api.insightai.example`.
  - L'informativa (`informativa.md:26`) dice invece «nominati responsabili», «I dati restano nell'Unione europea» e «mai usati per finalità diverse».
- **Riferimenti:**
  - Art. 28 GDPR (nessun accordo). Art. 28.10: un fornitore che usa i dati per fini propri ne diventa titolare.
  - Artt. 44-46 GDPR. Scheda «Decisioni di adeguatezza» (2026-11-19): per gli USA serve la certificazione DPF, che qui non risulta, oppure altre garanzie come le SCC.
  - Artt. 5.1.a, 12 e 13.1.e-f GDPR: l'informativa non è veritiera.
  - Art. 8 GDPR e art. 2-quinquies del Codice privacy (minori).
  - Scheda «L. 132/2025», art. 4, c. 4: sotto i 14 anni l'accesso alle tecnologie di IA e il relativo trattamento richiedono il consenso di chi esercita la responsabilità genitoriale.
  - Scheda L. 132/2025, art. 11: gli insegnanti vanno informati dell'uso dell'IA.
- **Gravità e rischio:** il trattamento è in corso e riguarda la voce di minori (dagli 8 anni, `README.md:3`). È una possibile violazione già in atto, non un difetto del testo.
- **Raccomandazione:** il titolare valuti con il legale di sospendere l'invio a InsightAI finché non ci sono un accordo art. 28 che escluda l'uso per addestramento, garanzie per il trasferimento e una valutazione d'impatto (DPIA) sulla trascrizione. Passare il caso a AIPCA-07 (fornitori) e allo specialista DPIA.
- **Testo proposto** per l'informativa, da usare solo dopo che l'accordo è firmato:
  > «Le registrazioni sono trascritte automaticamente da InsightAI Inc. (USA), nostro responsabile del trattamento, che non può usarle per addestrare i propri modelli. Il trasferimento negli Stati Uniti avviene sulla base di [certificazione al Data Privacy Framework UE-USA / clausole contrattuali tipo, Dec. 2021/914]. Per gli studenti sotto i 14 anni la trascrizione richiede il consenso del genitore o tutore.»
- **Priorità:** P0. **Responsabile suggerito:** titolare e legale, poi la Software Agency per la sospensione tecnica.
- **Verifica:** l'accordo firmato e le garanzie in `fornitori.md`, e `transcribe.js` che non invia nulla senza un accordo valido.

---

## Inventario dei documenti

| Documento | Versione e data | Stato |
|---|---|---|
| Informativa (`legale/informativa.md`) | 1° ottobre 2026, pubblicata su `parlasubito.example/privacy` | `non_conforme` (molte lacune agli artt. 13-14) |
| Cookie policy (`legale/cookie-policy.md`) | 1° ottobre 2026 | `non_conforme` |
| Banner e modulo di iscrizione rapida (`legale/banner.html`) | senza data | `non_conforme` |
| Registro dei fornitori (`docs/fornitori.md`) | 2026-10-15, compilato dalla segreteria | `parzialmente_conforme` (dati superati, un fornitore manca) |
| Modulo di iscrizione (`public/index.html`) | senza data | `parzialmente_conforme` |
| Accordi art. 28, DPF/SCC, nomina e istruzioni agli autorizzati (support, insegnanti), registro dei trattamenti (art. 30), DPIA | non forniti | `non_verificabile` |

---

## Rilievi

### Informativa

**PL-02. Base giuridica sbagliata e consenso condizionato.** `informativa.md:17,22`
- **Lacuna:** iscrizione, organizzazione dei corsi e videolezioni poggiano sul «consenso», e «senza il consenso non è possibile iscriversi». Questi trattamenti rientrano nell'esecuzione del contratto (art. 6.1.b). Un consenso imposto come condizione non è libero (art. 7.4 e considerando 43).
- **Lacuna:** le registrazioni per gli assenti sono una finalità distinta, messa insieme alle altre.
- **Questione interpretativa:** quale base usare per le registrazioni (consenso separato oppure legittimo interesse con opposizione), dato che riguardano la voce e l'immagine di minori.
- **Testo proposto:**

  | Finalità | Base giuridica |
  |---|---|
  | Iscrizione, organizzazione dei corsi e videolezioni | Esecuzione del contratto (art. 6.1.b GDPR) |
  | Registrazione delle lezioni per chi è assente | [Consenso facoltativo, revocabile in ogni momento (art. 6.1.a), del genitore o tutore sotto i 14 anni / legittimo interesse, da decidere con il legale] |

- **Priorità:** P1.

**PL-03. Le categorie di dati sono incomplete e mancano i dati di salute (art. 9).** `informativa.md:11`
- **Lacuna:** mancano note di salute (allergie, disturbi dell'apprendimento: `README.md:7`, `public/index.html:19`), codice fiscale e data di nascita (`README.md:8`, `index.html:16`), credenziali, dati degli insegnanti, chat di assistenza e statistiche d'uso.
- **Lacuna:** per i dati di salute non c'è alcuna condizione dell'art. 9.2.
- **Riferimenti:** artt. 9 e 13.1.c GDPR; art. 5.1.c (minimizzazione) per il documento d'identità del genitore, da motivare.
- **Testo proposto:** «Note facoltative sulla salute dello studente (per esempio allergie o disturbi dell'apprendimento), che servono solo a permettere all'insegnante di adattare la lezione. Le trattiamo solo con il consenso esplicito (art. 9.2.a GDPR) dello studente o, sotto i 14 anni, del genitore o tutore. Sono visibili solo agli insegnanti della classe.»
- **Priorità:** P1.

**PL-04. Destinatari e trasferimenti non veritieri.** `informativa.md:26`
- **Errore:** PagaFacile è un titolare autonomo, non un responsabile (`fornitori.md:8`).
- **Errore:** i dati non «restano nell'UE». LessonCam fa supporto dagli USA (`fornitori.md:9`), Mailorbit è negli USA (`:10`), InsightAI è negli USA (`:11`).
- **Errore:** ChatNow (widget su ogni pagina, `public/index.html:26`) non compare né nell'informativa né nel registro dei fornitori.
- **Riferimenti:** art. 13.1.e-f GDPR; scheda «Decisioni di adeguatezza» (2026-11-19).
- **Testo proposto:** «Destinatari: Nimbus Hosting GmbH (hosting, Germania), LessonCam Inc. (videolezioni, dati a Dublino, supporto tecnico dagli USA in base al Data Privacy Framework UE-USA e alle clausole contrattuali tipo), Mailorbit LLC (newsletter, USA, [garanzia valida]), InsightAI Inc. (trascrizione, USA, [garanzia]), ChatNow ([ruolo, sede, garanzia]), tutti responsabili del trattamento. PagaFacile S.p.A. tratta i dati di pagamento come titolare autonomo, con una sua informativa. I dati sono accessibili anche al personale autorizzato di segreteria e amministrazione e agli insegnanti delle classi. Una copia delle garanzie per i trasferimenti si può chiedere a privacy@parlasubito.example.»
- **Priorità:** P1.

**PL-05. Conservazione generica.** `informativa.md:30`
- **Lacuna:** la formula «per il tempo necessario» non soddisfa l'art. 13.2.a. I periodi reali esistono già in `config/retention.json` (registrazioni 30 giorni, messaggi 365, audit log 90, fatture 10 anni) e in `README.md:23`.
- **Testo proposto:** «Registrazioni e trascrizioni: 30 giorni dalla lezione. Dati dell'iscrizione: per la durata del corso e per [N] mesi dopo. Fatture: 10 anni (art. 2220 del Codice civile). Messaggi di assistenza: 12 mesi. Registri di accesso: 90 giorni. Newsletter: fino alla revoca del consenso.»
- **Da chiarire:** i periodi per anagrafica, note di salute e documento d'identità mancano anche nella configurazione.
- **Priorità:** P2.

**PL-06. Diritti e informazioni obbligatorie mancanti.** `informativa.md:32-34`
- **Lacuna:** mancano i diritti di limitazione, portabilità e opposizione (art. 21: necessario per le statistiche basate sul legittimo interesse), la revoca del consenso (artt. 7.3 e 13.2.c), il reclamo al Garante (art. 13.2.d), l'indicazione dei dati obbligatori e delle conseguenze del rifiuto (art. 13.2.e), le decisioni automatizzate, anche solo per escluderle (art. 13.2.f), il legittimo interesse perseguito (art. 13.1.d) e i dati di contatto dell'RPD, se nominato (art. 13.1.b).
- **Questione interpretativa:** se l'RPD sia obbligatorio (art. 37), dato che si trattano su larga scala dati di minori e di salute.
- **Testo proposto:** «Puoi chiedere l'accesso, la rettifica, la cancellazione, la limitazione e la portabilità dei dati, e opporti ai trattamenti basati sul legittimo interesse, scrivendo a privacy@parlasubito.example. Puoi revocare il consenso in ogni momento, senza effetti sui trattamenti già fatti. Hai il diritto di proporre reclamo al Garante per la protezione dei dati personali (garanteprivacy.it). Non usiamo decisioni basate unicamente su trattamenti automatizzati.»
- **Priorità:** P2.

**PL-07. Minori: soglia dei 14 anni applicata al contratto e informazioni non adatte ai minori.** `informativa.md:36-38`
- **Lacuna:** la soglia dei 14 anni dell'art. 2-quinquies del Codice privacy riguarda il consenso nei servizi della società dell'informazione. Non stabilisce la capacità di stipulare un contratto a pagamento: è una questione interpretativa di diritto civile, da sottoporre al legale.
- **Lacuna:** l'art. 2-quinquies, c. 2 e la scheda L. 132/2025, art. 4, c. 4 chiedono informazioni facilmente accessibili e comprensibili per chi ha almeno 14 anni.
- **Lacuna:** gli insegnanti, che sono lavoratori o collaboratori, vanno informati dell'uso dell'IA (L. 132/2025, art. 11, e art. 1-bis del D.lgs. 152/1997, scheda del 2026-11-19).
- **Testo proposto:** «Sotto i 14 anni il genitore o tutore iscrive lo studente, dà i consensi (anche per la trascrizione automatica, che usa l'intelligenza artificiale) ed esercita i diritti. Dai 14 anni lo studente può dare da sé i consensi facoltativi. Per gli studenti dai 14 anni c'è una versione breve e semplice di questa informativa: [link].»
- **Priorità:** P1.

### Cookie policy e banner

**PL-08. `ps_stats` senza consenso: le condizioni per l'esenzione dei cookie statistici non sono soddisfatte.** `cookie-policy.md:9`, `src/analytics.js:5`
- **Lacuna:** il cookie usa un identificativo del visitatore «conservato in chiaro» e gli eventi inviati contengono lo `userId` dell'utente autenticato. Secondo le linee guida del Garante del 10 giugno 2021, i cookie statistici sono equiparati a quelli tecnici solo se i dati sono aggregati e l'identificativo è minimizzato (per esempio mascherato), senza possibilità di ricondurlo alla persona. Qui serve il consenso (art. 122 del Codice privacy). Il «legittimo interesse» non è una base ammessa per salvare informazioni sul dispositivo.
- **Questione interpretativa:** la durata di 24 mesi, da motivare.
- **Testo proposto:** due possibilità.
  - (a) «`ps_stats`: statistiche d'uso, solo con il tuo consenso, durata [N] mesi.»
  - (b) Rendere anonimo l'identificativo e togliere `userId` dagli eventi, quindi: «`ps_stats`: statistiche in forma aggregata con identificativo mascherato, equiparato a un cookie tecnico, durata [N] mesi.»
- **Priorità:** P1.

**PL-09. `chatnow_id`: cookie di terza parte con profilazione presentato come «servizio richiesto».** `cookie-policy.md:10`, `public/index.html:26`
- **Lacuna:** lo script di ChatNow si carica su ogni pagina, prima che il visitatore chieda la chat, e crea un «profilo del visitatore per il fornitore». Il cookie non è strettamente necessario: serve il consenso (art. 122 del Codice privacy).
- **Lacuna:** il fornitore manca nel registro.
- **Questione interpretativa:** se il sito diventi contitolare (art. 26 GDPR; CGUE C-40/17 Fashion ID) per la raccolta che fa ChatNow per sé.
- **Testo proposto:** «`chatnow_id`: chat di assistenza ChatNow ([sede]). Si attiva solo quando apri la chat; per i fini propri del fornitore solo con il tuo consenso. Informativa del fornitore: [link].»
- **Priorità:** P1.

**PL-10. La cookie policy non dà le informazioni obbligatorie.** `cookie-policy.md:1-12`
- **Lacuna:** mancano il titolare e i suoi contatti, le finalità spiegate, i link alle informative delle terze parti, come cambiare o revocare la scelta in ogni momento e il rimando all'informativa (art. 13 GDPR e linee guida 2021). Cancellare i cookie dal browser non sostituisce la revoca.
- **Testo proposto:** «Puoi cambiare le tue scelte in ogni momento dal link "Preferenze cookie" in fondo a ogni pagina. Titolare: Parla Subito S.r.l., privacy@parlasubito.example. Per gli altri trattamenti vedi l'[informativa].»
- **Priorità:** P2.

**PL-11. Il banner chiede un consenso per prosecuzione della navigazione, senza rifiuto né preferenze.** `banner.html:3-5`
- **Lacuna:** «Continuando la navigazione accetti l'uso di tutti i cookie» non è un consenso valido. Le linee guida del Garante del 2021 escludono lo scroll e la prosecuzione della navigazione (art. 4.11 e considerando 32 GDPR; CGUE C-673/17 Planet49).
- **Lacuna:** non c'è un comando per chiudere o rifiutare con la stessa evidenza di «Accetta».
- **Lacuna:** «Gestisci le preferenze» porta alla policy, non a un pannello di scelta per finalità.
- **Lacuna:** «migliorare la tua esperienza» non dice le finalità.
- **Testo proposto:** «Usiamo cookie tecnici, necessari al sito, e, solo con il tuo consenso, cookie per le statistiche d'uso e per la chat di assistenza di ChatNow. Puoi accettarli, rifiutarli o scegliere per finalità; chiudendo il banner con la X restano attivi solo i cookie tecnici. [Accetta tutti] [Rifiuta] [Scegli] — [Cookie policy]»
- **Priorità:** P1.

### Moduli di consenso

**PL-12. Iscrizione rapida: newsletter già spuntata, marketing non dichiarato, consenso generico obbligatorio.** `banner.html:10-11`
- **Lacuna:** la casella è spuntata in partenza (`checked`), quindi il consenso non è valido (considerando 32 GDPR, Planet49, art. 130 del Codice privacy).
- **Lacuna:** le «offerte» sono marketing, mentre l'informativa (`:19`) parla solo di newsletter.
- **Lacuna:** «do il consenso al trattamento dei dati» è obbligatorio, generico e superfluo, perché la base è il contratto (PL-02). Manca il link all'informativa.
- **Lacuna:** il modulo non verifica l'età, quindi anche un minore di 14 anni può iscriversi con la sola email.
- **Testo proposto:**
  - casella non spuntata e facoltativa: «Voglio ricevere la newsletter e comunicazioni promozionali di Parla Subito (facoltativo, revocabile da ogni email)»;
  - al posto della casella obbligatoria, solo una frase informativa: «Proseguendo crei un account di prova; il trattamento dei tuoi dati è descritto nell'[informativa].»
- **Priorità:** P1.

**PL-13. Il modulo di iscrizione non corrisponde all'informativa.** `public/index.html:13-24`
- **Lacuna:** non ci sono né la casella di consenso per le registrazioni che l'informativa dice «raccolto al momento dell'iscrizione» né il consenso esplicito per le note di salute.
- **Lacuna:** il link punta a `/privacy.html`, mentre l'informativa dichiara `parlasubito.example/privacy`.
- **Domanda aperta:** il modulo salva il campo `newsletter`, mentre la sincronizzazione con Mailorbit (`src/newsletter.js:13`) legge `marketing_consent`. Va verificato che si tratti dello stesso consenso.
- **Testo proposto:** aggiungere al campo delle note «Facoltativo. Compilando questo campo acconsenti al trattamento di questi dati sulla salute per adattare le lezioni ([informativa])», con una casella distinta.
- **Priorità:** P2.

### Registro dei fornitori

**PL-14. Mailorbit: trasferimento basato sul Privacy Shield.** `fornitori.md:10`
- **Lacuna:** il Privacy Shield è stato invalidato dalla CGUE (C-311/18 Schrems II, 16 luglio 2020). Scheda «Decisioni di adeguatezza» (2026-11-19): per gli USA vale solo la certificazione al DPF (10 luglio 2023), altrimenti servono le SCC.
- **Raccomandazione:** verificare se Mailorbit è certificata al DPF oppure firmare le SCC (Dec. 2021/914, modulo 2), poi aggiornare il registro e l'informativa.
- **Priorità:** P1.

**PL-15. LessonCam: certificazione scaduta e DPF da riverificare.** `fornitori.md:9`
- **Lacuna:** l'ISO 27001 risulta scaduta il 2025-12-31, ma il registro, aggiornato al 2026-10-15, la dà come valida.
- **Lacuna:** l'iscrizione al DPF va riverificata e datata (scheda del 2026-11-19).
- **Raccomandazione:** aggiornare la riga con la data della verifica del DPF e lo stato attuale della certificazione.
- **Priorità:** P2.

**PL-16. Il registro è incompleto.**
- **Lacuna:** manca ChatNow (PL-09). Mancano le colonne con la data di verifica delle garanzie e la valutazione d'impatto del trasferimento per i fornitori basati sulle SCC.
- **Domanda aperta:** non è chiaro se lo staging su Nimbus (`README.md:22`), usato anche dalla segreteria, contenga dati reali. Da passare alla data governance.
- **Priorità:** P2.

---

## Requisiti, evidenze e lacune

| Requisito | Evidenza | Lacuna | Tipo |
|---|---|---|---|
| Art. 6: base giuridica corretta | `informativa.md:17` | Consenso usato al posto del contratto, ed è condizionato | documentale |
| Art. 9: dati di salute | `README.md:7`, `index.html:19` | Non dichiarati e senza consenso esplicito | documentale e funzionale |
| Art. 13.1.e-f: destinatari e trasferimenti | `informativa.md:26`, `fornitori.md` | Testo non veritiero, ChatNow assente | documentale |
| Art. 13.2.a: conservazione | `config/retention.json` | Periodi non riportati nell'informativa | documentale |
| Art. 13.2.b-f: diritti e altre informazioni | `informativa.md:34` | Diritti incompleti, mancano reclamo e revoca | documentale |
| Art. 28 e artt. 44-46 (InsightAI, Mailorbit) | `fornitori.md:10-11`, `transcribe.js` | Accordo mancante, Privacy Shield non più valido, uso per addestramento | funzionale (P0) |
| Art. 2-quinquies Codice privacy e L. 132/2025, art. 4, c. 4 | `informativa.md:38` | Nessun consenso dei genitori per l'IA, informativa non adatta ai minori | documentale e interpretativa |
| Art. 122 Codice privacy e linee guida del Garante 2021 | `cookie-policy.md:9-10`, `banner.html:3` | Consenso per prosecuzione, cookie statistici e ChatNow senza consenso | documentale e funzionale |
| Art. 130 Codice privacy e art. 7 GDPR | `banner.html:10` | Casella newsletter già spuntata | funzionale |
| Art. 26 (ChatNow) | `index.html:26` | Ruolo privacy non definito | interpretativa |

## Domande aperte per il direttore e per l'utente

1. Va valutata una DPIA (art. 35) per minori, dati di salute, registrazioni e trascrizione con IA? La propongo allo specialista DPIA.
2. È stato nominato un RPD? È obbligatorio?
3. Che ruolo ha ChatNow e dove ha sede?
4. Esistono la nomina e le istruzioni per gli autorizzati (support, insegnanti) e l'informativa agli insegnanti sull'IA (L. 132/2025, art. 11)?

**Fuori dal mio perimetro, per gli altri reparti:**
- `config/default.json:8` contiene una chiave di cifratura scritta in chiaro nel file. Non la riporto qui. Per la sicurezza (AISA) e AIPCA-05.
- `src/newsletter.js:5-7` disiscrive dalla newsletter in base all'email passata nell'indirizzo, senza alcun controllo. Per la sicurezza.

Firmato: AIPCA-03 · DUBHE
