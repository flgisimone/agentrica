AIPCA-03 · DUBHE — Senior Privacy Legal Specialist, reparto AIPCA (AI Privacy & Compliance)

Nota: non ho caricato AIPCA-01 (nessun tool `agent`). Il rapporto va al direttore. Rivedo in sola lettura, senza modificare nulla. Sono lacune e punti da portare alla revisione legale umana, non pareri legali definitivi e nessuna dichiarazione di conformità.

Giurisdizione: UE e Italia. Data di verifica: 2026-11-27.
Schede della biblioteca lette: `decisioni-adeguatezza` (elenco al 2026-11-19, verificata il 2026-11-19), `ai-act-date` e `legge-132-2025-ia` (L. 23 settembre 2025, n. 132). Le tre sono da ricontrollare entro il 2027-05-19.
Non ho accesso al web: le fonti non in biblioteca (art. 5(3) direttiva ePrivacy, linee guida Garante del 10/6/2021 sui cookie, linee guida EDPB 05/2020 sul consenso) vanno confermate dalla revisione legale.

## Inventario documentale

| Documento | Versione | Stato |
|---|---|---|
| `legale/informativa.md` | 1 ott 2026 | presente, lacunosa |
| `legale/cookie-policy.md` | 1 ott 2026 | presente, errori |
| `legale/banner.html` (banner e modulo di iscrizione rapida) | senza versione | presente, errori |
| `docs/fornitori.md` | 2026-10-15 | presente, incoerente con l'informativa |
| `docs/procedura-diritti.md` | 2026-05-20 | fuori dal perimetro, ma richiamata in due rilievi |
| Accordi art. 28 | non nel repository | non verificabili (nel registro risultano firmati con Nimbus, LessonCam e Mailorbit) |
| Registro dei trattamenti, DPIA, nomina del DPO | non presenti | non verificabili |

Per confrontare i documenti con i flussi reali ho letto anche `src/analytics.js`, `src/transcribe.js`, `src/purge.js`, `config/retention.json` e `public/index.html`.

## Rilievi

**L-01 · Banner dei cookie · non_conforme · P1**
- Evidenza: `legale/banner.html` r.3-5. Il testo dice «Continuando la navigazione accetti l'uso di tutti i cookie». Il pulsante è solo «Accetta» e non c'è un «Rifiuta». «Gestisci le preferenze» rimanda alla pagina `/cookie`, che non offre alcuna scelta.
- Perché non va: la navigazione non è un consenso valido, serve un'azione positiva (art. 4(11) e art. 7 GDPR). Il rifiuto deve essere facile quanto l'accettazione. Mancano scelte per categoria. Non risulta nel repository un blocco preventivo dei cookie non tecnici (art. 5(3) direttiva ePrivacy; art. 122 Codice privacy; Garante, linee guida cookie 2021; EDPB 05/2020).
- Punto del documento: r.3 e r.4-5.
- Testo proposto: «Usiamo cookie tecnici necessari al funzionamento del sito. Con il tuo consenso usiamo anche cookie di statistica e di assistenza [chat]. Puoi accettare, rifiutare o scegliere per categoria; senza una tua scelta (o chiudendo il banner con la X) restano attivi solo i cookie tecnici. Puoi cambiare idea in ogni momento da «Preferenze cookie» in fondo alla pagina. [Informativa cookie]».
- Pulsanti: «Accetta tutti», «Rifiuta tutti», «Personalizza», con lo stesso rilievo grafico. Serve un link permanente per rivedere o revocare la scelta, e la scelta va registrata per poterla provare (art. 7(1) GDPR).
- Verifica tecnica: gli script non tecnici non devono partire prima della scelta.

**L-02 · Cookie policy: `ps_stats` senza consenso · non_conforme · P1**
- Evidenza: `cookie-policy.md` r.9: «non serve: legittimo interesse». Lo stesso testo dice «con identificativo del visitatore, conservate in chiaro», per 24 mesi. `src/analytics.js` r.5 invia `userId` a ogni evento.
- Perché non va: il legittimo interesse non è una base valida per scrivere o leggere dati sul dispositivo (art. 5(3) ePrivacy; art. 122 Codice privacy). Un identificativo persistente per 24 mesi non rientra nei cookie tecnici né nelle statistiche anonime e aggregate che il Garante equipara ai tecnici. Per restare senza consenso servono statistiche aggregate, senza identificativo persistente e con un fornitore vincolato come responsabile.
- Questione interpretativa: se il servizio sia davvero solo interno o gestito con Nimbus (il commento in `analytics.js` r.1 dice «interno su Nimbus»). Il dato «in chiaro» non è un tema di informativa ma di misure di sicurezza (art. 32): va passato a Cyber/Security.
- Testo proposto per la riga: «`ps_stats` | statistiche d'uso con identificativo del visitatore | Parla Subito | [ridurre, vedi sotto] | **serve il consenso**».
- Alternative: o si chiede il consenso (e la durata si riduce secondo le indicazioni del Garante, indicativamente 12 mesi), oppure si passa a statistiche aggregate senza identificativo.

**L-03 · Cookie policy: `chatnow_id` e ChatNow · non_conforme · P1**
- Evidenza: `cookie-policy.md` r.10: «non serve: è un servizio richiesto». `public/index.html` r.26 carica `widget.chatnow.example/v3/loader.js` a ogni visita, senza consenso. Il registro `docs/fornitori.md` non include ChatNow. Il testo dice «profilo del visitatore per il fornitore».
- Perché non va: il widget parte e scrive il cookie al caricamento della pagina, non su richiesta dell'utente. Un cookie di profilazione di terza parte non è «strettamente necessario per un servizio esplicitamente richiesto». Al massimo il consenso (o l'avvio del widget) può scattare quando l'utente apre la chat.
- Inoltre ChatNow non compare nel registro, quindi ruolo (responsabile o titolare), accordo art. 28 o art. 26, sede e trasferimenti sono ignoti. Non è nemmeno citato nell'informativa.
- Testo proposto per la riga: «`chatnow_id` | chat di assistenza di ChatNow [ruolo: da definire] | ChatNow | 13 mesi | **serve il consenso** (la chat si avvia solo dopo la tua scelta)».
- Da fare: aggiungere ChatNow al registro e all'informativa.

**L-04 · Cookie policy: contenuto generale incompleto · parzialmente_conforme · P2**
- Evidenza: `cookie-policy.md` r.12 («Si possono cancellare i cookie dalle impostazioni del browser») e la tabella.
- Mancano: finalità di ciascun cookie, base giuridica, destinatari, titolare di quelli di terza parte con link alla loro informativa, come revocare il consenso, tempi di conservazione del consenso, rinvio all'informativa privacy generale. Manca anche la data dell'ultimo aggiornamento del consenso.
- Testo proposto (da aggiungere): «**Come gestire o revocare le tue scelte.** In ogni momento puoi riaprire le preferenze da «Preferenze cookie» in fondo a ogni pagina; il rifiuto o la revoca non pregiudicano l'uso del sito. I cookie di terze parti sono regolati dalle informative dei rispettivi titolari: [link ChatNow]. Per i dati personali raccolti tramite cookie vedi l'[informativa privacy]».

**L-05 · Informativa: base giuridica dell'iscrizione e delle registrazioni · non_conforme · P1**
- Evidenza: `informativa.md` r.17 e r.22: base «Consenso dell'interessato» e «Senza il consenso alla prima finalità non è possibile iscriversi».
- Perché non va: l'iscrizione, l'organizzazione dei corsi e le videolezioni sono necessarie all'esecuzione del contratto (art. 6(1)(b)). Se il consenso è condizione per il servizio, non è libero (art. 7(4), considerando 43). La revoca renderebbe illecito il trattamento. Le registrazioni delle lezioni e la loro trascrizione sono finalità distinte dal corso e vanno trattate a parte, con base e consenso propri se si ritiene di averlo.
- Testo proposto per la tabella (da validare):
  - «Iscrizione, organizzazione dei corsi, videolezioni | Esecuzione del contratto (art. 6(1)(b)); per i minori, contratto stipulato dal genitore o tutore»
  - «Registrazione delle lezioni e conservazione per 30 giorni, per chi è assente | [base da definire dalla revisione legale: legittimo interesse con valutazione di bilanciamento, oppure consenso separato e facoltativo] »
  - «Trascrizione automatica delle registrazioni | [base da definire; vedi L-08 e L-09]»
- La nota «Senza il consenso alla prima finalità non è possibile iscriversi» va tolta o riscritta.
- Il banner usa lo stesso schema: `banner.html` r.11 abbina un unico consenso all'«informativa» (vedi L-10).

**L-06 · Informativa: contenuto minimo mancante · non_conforme · P1**
- Evidenza: `informativa.md` (intero) rispetto agli artt. 13 e 14 GDPR.
- Mancano:
  - contatti del DPO, o l'indicazione che non è stato nominato;
  - interesse legittimo specificato per le statistiche (art. 13(1)(d)); [ma vedi L-02: per i cookie serve il consenso];
  - categorie particolari: il README (r.7) cita «note di salute facoltative (allergie, disturbi dell'apprendimento)». L'informativa non le menziona e non indica la base dell'art. 9(2)(a);
  - dati di registrazioni di minori (voce e immagine), il cui trattamento va descritto;
  - elenco o categorie di destinatari più preciso, con nome dei fornitori fuori SEE (art. 13(1)(e) e (f));
  - esistenza di trasferimenti verso paesi terzi e garanzie (art. 13(1)(f));
  - periodo di conservazione per categoria (art. 13(2)(a));
  - diritti completi: limitazione, portabilità, opposizione, revoca del consenso (art. 13(2)(b)-(c)); diritto di reclamo al Garante (art. 13(2)(d));
  - se il conferimento è obbligatorio o facoltativo e le conseguenze del rifiuto (art. 13(2)(e));
  - esistenza di un processo decisionale automatizzato (art. 13(2)(f)): la trascrizione automatica non è una decisione, ma l'uso dell'IA va dichiarato (vedi L-09).
- Per le note di salute: se l'allergia o il disturbo dell'apprendimento è registrato, serve una base ex art. 9; di norma consenso esplicito, separato e facoltativo, più un'informativa dedicata ai genitori.

**L-07 · Informativa: affermazioni non vere o non verificabili sulle sedi dei dati e sui fornitori · non_conforme · P1**
- Evidenza: `informativa.md` r.26 «I dati restano nell'Unione europea»; `docs/fornitori.md` r.9-11:
  - LessonCam Inc. (USA): supporto tecnico dagli USA, quindi accesso da paese terzo;
  - Mailorbit LLC (USA): trasferimento;
  - InsightAI Inc. (USA): il trattamento avviene negli USA (`src/transcribe.js` r.8-11 manda l'audio a `api.insightai.example`).
- Per questo la frase «I dati restano nell'Unione europea» è falsa.
- Altra frase falsa: «I dati non sono mai usati per finalità diverse» (r.26). Per InsightAI il registro (note, r.15) dice che il fornitore «può usare i contenuti inviati per migliorare i propri modelli»: è una finalità diversa, quindi un rischio di ruolo di titolare in proprio (art. 28(10)).
- Testo proposto (da adattare ai fatti): «Alcuni fornitori hanno sede negli Stati Uniti o ci assistono da lì: [LessonCam Inc.], [Mailorbit LLC], [InsightAI Inc.]. Il trasferimento avviene [sulla base della decisione di adeguatezza della Commissione (Data Privacy Framework UE-USA) solo per le organizzazioni certificate / sulle clausole contrattuali tipo, decisione 2021/914]. Puoi chiederci copia delle garanzie scrivendo a privacy@...».
- Evidenza sull'adeguatezza: la scheda dice che gli USA sono adeguati solo per le organizzazioni certificate DPF. Dai documenti è verificato solo che LessonCam è iscritta al DPF (da controllare sul registro ufficiale DPF, che non ho potuto consultare).

**L-08 · Registro fornitori: Mailorbit, garanzia `Privacy Shield` · non_conforme · P1**
- Evidenza: `docs/fornitori.md` r.10: garanzia «Privacy Shield», accordo del 2024-06-01.
- Il Privacy Shield è stato invalidato dalla Corte di giustizia nella causa C-311/18 (Schrems II, 2020). Non è una garanzia valida. Il DPF UE-USA (10 luglio 2023) è la decisione corrente, ma si applica solo se Mailorbit è certificata; il registro non lo dice. Se non lo è, servono SCC (2021/914) con una valutazione dell'impatto del trasferimento.
- Non è un errore solo del registro: l'accordo art. 28 del 2024 può contenere lo stesso riferimento. Va ricontrollato dal legale.
- Testo proposto: «Garanzie: [DPF, se Mailorbit risulta certificata alla data X / SCC 2021/914, modulo 2; evidenza: link al registro DPF e copia dell'accordo]».

**L-09 · InsightAI: accordo art. 28 mancante, uso per addestrare, minori, IA · non_conforme · P0**
- Evidenza: `docs/fornitori.md` r.11 e 15: accordo «in attesa»; garanzie «—»; trasferimento verso gli USA «sì»; i termini standard consentono di usare i contenuti «per migliorare i propri modelli»; dati: «voce di studenti (anche minorenni) e insegnanti». `src/transcribe.js` r.4-11 mostra che l'invio è già operativo, dopo ogni lezione, con la chiave in `process.env.INSIGHTAI_KEY`.
- Quindi i dati vocali di minori vanno già a un fornitore USA senza accordo art. 28 (art. 28(3)), senza garanzie di trasferimento (artt. 44-46, nessuna decisione di adeguatezza si applica senza certificazione DPF: da verificare), e con possibile riuso per l'addestramento (finalità propria del fornitore, quindi titolarità autonoma senza base). La voce può essere dato biometrico se serve a identificare (art. 9), ma qui serve alla trascrizione: questione interpretativa da portare al legale.
- Per la segnalazione immediata: rischio elevato, alto numero di minori. Lo segnalo come P0 al direttore. Sono su un modello più piccolo (Sonnet): propongo il riesame del direttore o di un revisore su Opus prima che sia definitivo.
- Legge 132/2025 (scheda): art. 4(4), sotto i 14 anni l'accesso alle tecnologie di IA e il relativo trattamento dei dati richiedono il consenso di chi esercita la responsabilità genitoriale; dai 14 il minore può consentire se le informazioni sono accessibili e comprensibili. Se la trascrizione è «tecnologia di IA» ai sensi della legge (questione interpretativa), l'informativa e il consenso per i minori vanno riscritti. Nell'informativa «Minori» (r.38) non c'è nulla di questo.
- AI Act: la scheda indica che trasparenza e alfabetizzazione sull'IA sono già applicabili (da agosto 2026). Il tema da valutare è se l'obbligo di trasparenza si applichi alla trascrizione: non lo affermo, lo segnalo al legale.
- Raccomandazione: sospendere l'invio ad InsightAI (o limitarlo ai dati degli adulti) finché non c'è l'accordo; ottenere nell'accordo il divieto di uso per l'addestramento, le garanzie di trasferimento (DPF o SCC), l'elenco dei sub-responsabili; citare InsightAI nell'informativa con la finalità e la conservazione.

**L-10 · Modulo di iscrizione rapida: consenso e newsletter · non_conforme · P1**
- Evidenza: `banner.html` r.10-11:
  - la casella newsletter è preselezionata (`checked`): non è un consenso valido (art. 4(11); CGUE, Planet49, C-673/17);
  - la newsletter e le «offerte» sono abbinate al modulo di iscrizione; il testo parla anche di «offerte», che è marketing;
  - la casella `privacy` è obbligatoria e chiede «il consenso al trattamento dei dati»: il consenso non va chiesto per leggere l'informativa, e abbinato all'iscrizione non è libero (art. 7(4)); vedi L-05;
  - il modulo è «in fondo a ogni pagina»: manca un link all'informativa nel punto di raccolta dell'email (art. 13).
- Testo proposto:
  - «[ ] Voglio ricevere la newsletter di Parla Subito con novità e offerte (facoltativo; puoi disiscriverti in ogni momento)», casella non preselezionata e separata;
  - sotto il pulsante: «Inviando questo modulo accetti di essere ricontattato per la prova gratuita. Leggi l'[informativa privacy]». Non serve una casella «privacy» obbligatoria.
- Per il marketing via email a un cliente già iscritto vale anche il «soft spam» (art. 130(4) Codice privacy): è una valutazione per il legale.

**L-11 · Informativa: conservazione generica · non_conforme · P2**
- Evidenza: `informativa.md` r.30 «per il tempo necessario alle finalità indicate»; `README.md` r.23 (registrazioni 30 giorni); `src/purge.js` e `config/retention.json` (registrazioni 30 giorni, log 90 giorni, messaggi 365 giorni); `cookie-policy.md` (ps_stats 24 mesi, chatnow_id 13 mesi); procedura diritti, art. 6 (fatture 10 anni).
- L'art. 13(2)(a) richiede il periodo o i criteri. L'informativa non li dice, ma i valori esistono nel codice e nel README. Nota: la procedura (r.6) dice che l'account «si cancella subito» ma tace sui backup.
- Testo proposto (da completare con i dati del titolare): «Registrazioni delle lezioni: 30 giorni. Trascrizioni: [da definire]. Messaggi: 365 giorni. Fatture e dati contabili: 10 anni (art. 2220 c.c.). Newsletter: fino alla revoca. Dati dell'iscrizione: [durata del contratto + termine di prescrizione]. Cookie: vedi la cookie policy».
- Rimane da chiarire se la trascrizione (nel database) segue i 30 giorni della registrazione: `purge.js` r.7 cancella `recordings` per intero, quindi la trascrizione, se è nella stessa riga, sparisce con essa; da confermare.

**L-12 · Informativa: minori e consenso · parzialmente_conforme · P2**
- Evidenza: `informativa.md` r.38: «dai 14 anni lo studente si iscrive da sé».
- Il consenso dei minori ai servizi della società dell'informazione è fissato a 14 anni in Italia (art. 2-quinquies Codice privacy), ma qui il servizio è un contratto di insegnamento e i corsi sono per ragazzi «dagli 8 anni» (README r.3). Per la validità del contratto con un quattordicenne la questione è di diritto civile (capacità di agire) e non solo di privacy: da portare al legale.
- Per i dati del genitore (documento d'identità, codice fiscale: README r.8) manca nell'informativa la finalità specifica e la minimizzazione: la copia del documento d'identità non dovrebbe essere raccolta se un controllo meno invasivo basta (art. 5(1)(c)); questione per il direttore.
- Testo proposto: «Per gli studenti sotto i 14 anni l'iscrizione e i consensi sono dati da chi esercita la responsabilità genitoriale. Dai 14 anni lo studente può [consentire da sé al trattamento dei dati; per il contratto di iscrizione, vedi la valutazione del legale]. Le informazioni per i minori sono qui riportate in forma semplificata: [testo semplificato]».
- Con la L. 132/2025 art. 4(4) (vedi L-09), se il servizio usa l'IA con i minori, anche qui servirà il testo accessibile.

**L-13 · Informativa: diritti, procedura e contatti · parzialmente_conforme · P2**
- Evidenza: `informativa.md` r.34 elenca accesso, rettifica, cancellazione; non cita limitazione, portabilità, opposizione, revoca, reclamo (art. 15-22, 77). Il documento `procedura-diritti.md` (fuori perimetro, citato per le incoerenze) prevede 60 giorni (art. 12(3): un mese, prorogabile di due in casi complessi, con comunicazione) e 10 euro per l'accesso (art. 12(5): gratuito, salvo richieste manifestamente infondate o eccessive). Queste due incoerenze non vanno ripetute nell'informativa.
- Testo proposto: «Puoi chiederci in qualsiasi momento l'accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione, l'opposizione al trattamento e la portabilità; puoi revocare i consensi dati. Rispondiamo entro un mese (prorogabile di due in casi complessi, ti avvisiamo). L'esercizio dei diritti è gratuito. Hai diritto di proporre reclamo al Garante per la protezione dei dati personali (garanteprivacy.it)».

**L-14 · Registro fornitori: LessonCam, certificazioni e garanzie · parzialmente_conforme · P2**
- Evidenza: `docs/fornitori.md` r.9.
- DPF: iscrizione dichiarata ma senza data di verifica né link al registro DPF.
- SCC 2021/914 modulo 2 «nell'accordo»: coerente con ruolo di responsabile verso titolare. Dubbio: la presenza di SCC insieme al DPF è possibile come garanzia di riserva, ma va verificato che l'accordo le preveda.
- ISO 27001 certificata «per gli uffici di Dublino», scadenza 2025-12-31: alla data di oggi (2026-11-27) è scaduta da quasi un anno, quindi il registro non è aggiornato. Il registro è del 2026-10-15, già successivo alla scadenza.
- Il registro e l'informativa non coincidono sui sub-responsabili: «elenco nell'accordo, aggiornamenti con 30 giorni di preavviso» è utile ma l'elenco non è nel repository.
- Testo proposto per la colonna: «ISO 27001: certificato scaduto il 2025-12-31, rinnovo da richiedere / [data nuovo certificato]; DPF: certificata, verifica sul registro ufficiale il [data]».

**L-15 · Registro fornitori: Nimbus, certificazione · non_verificabile · P3**
- Evidenza: `docs/fornitori.md` r.7: «ISO 27001 (data center di Francoforte, valido fino al 2027-05)». Il certificato copre il data center, non necessariamente il servizio gestito (database, storage a oggetti). Il registro non riporta il perimetro della certificazione del servizio: da chiedere.
- Il valore è corretto fino a maggio 2027: promemoria di rinnovo.

**L-16 · PagaFacile: ruolo · non_verificabile · P3**
- Evidenza: `docs/fornitori.md` r.8 e nota r.16: titolare autonomo, accordo non necessario. L'ipotesi regge se PagaFacile tratta i dati per proprie finalità (antifrode, obblighi bancari) e non su istruzione di Parla Subito. Il documento non motiva la scelta. Non è un errore, è una valutazione da confermare e da documentare.
- Nell'informativa PagaFacile compare solo come «fornitore dei pagamenti» tra i responsabili (r.26: «nominati responsabili del trattamento»): incoerente con il ruolo di titolare autonomo del registro. Testo proposto: «PagaFacile S.p.A. tratta i dati di pagamento come titolare autonomo: la sua informativa è disponibile [link]».

**L-17 · Informativa e trasferimenti: coerenza generale con il registro · non_conforme · P2**
- La frase «nominati responsabili del trattamento» (r.26) non vale per tutti i fornitori (PagaFacile è titolare autonomo, InsightAI senza nomina, ChatNow non censito).
- Mancano nell'informativa i fornitori per nome o categoria con i paesi (art. 13(1)(e)-(f)), e la mappa dei trasferimenti.

## Cosa non ho potuto verificare
- Il contenuto degli accordi art. 28 firmati (Nimbus, LessonCam, Mailorbit): non sono nel repository.
- L'esistenza di un DPO, di un registro dei trattamenti (art. 30) e di una DPIA. Il trattamento di voci di minori su larga scala con un fornitore IA e le note di salute fanno pensare che la DPIA vada valutata (art. 35): lo passo ad AIPCA-02/DPIA.
- La certificazione DPF di LessonCam, Mailorbit e InsightAI sul registro ufficiale, per mancanza di accesso al web.
- Se `ps_stats` e il widget ChatNow partano davvero prima del consenso (`public/index.html` carica ChatNow senza blocco; lo script del banner non è nel repository).
- Cartella `violazione/`: fuori dal perimetro assegnato, non letta.

## Sintesi per il direttore
- 1 rilievo P0 (L-09, InsightAI, minori, USA, senza accordo).
- P1: L-01, L-02, L-03, L-05, L-06, L-07, L-08, L-10.
- P2: L-04, L-11, L-12, L-13, L-14, L-17.
- P3: L-15, L-16.
- Passaggi ad altri ruoli: sicurezza dei dati `ps_stats` in chiaro (Security Engineer); DPIA (specialista DPIA); diritti, tempi di 60 giorni e costo di 10 euro (specialista diritti); verifica DPF e SCC (Vendor).
- Dato che lavoro su un modello più piccolo, per i P0/P1 propongo il riesame del direttore o di un revisore su Opus prima che diventino definitivi.

AIPCA-03 · DUBHE
