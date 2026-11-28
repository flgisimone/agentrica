AIPCA-03 · DUBHE — Senior Privacy Legal Specialist, reparto AIPCA (AI Privacy & Compliance)

**Rapporto per AIPCA-01 · ARCTURUS (in sola lettura, nessun file modificato)**

Nota: non ho caricato il direttore perché non c'è il server MCP. Lavoro come Sonnet. I rilievi P1 vanno quindi rivisti dal direttore o da un revisore su Opus prima di diventare definitivi. Giurisdizione: UE/Italia. Data di verifica: 2026-11-27. Il resto è un parere di supporto, non un parere legale, e va alla revisione umana (DPO o avvocato).

**Schede usate** (biblioteca AIPCA, verificate il 2026-11-19, ricontrollo entro il 2027-05-19; non ho avuto accesso al web)
- `decisioni-adeguatezza`: elenco della Commissione al 2026-11-19. Gli USA sono adeguati solo per le organizzazioni certificate nel Data Privacy Framework (DPF).
- `legge-132-2025-ia`: L. 132/2025, art. 4 c. 4. Sotto i 14 anni serve il consenso di chi esercita la responsabilità genitoriale. Dai 14 anni il minore consente da sé, se le informazioni sono accessibili e comprensibili.
- `ai-act-date`: non pertinente al compito.

**Inventario documentale**

| Documento | Presente | Note |
|---|---|---|
| Informativa (`legale/informativa.md`, 2026-10-01) | sì | incompleta, vedi rilievi |
| Cookie policy (`legale/cookie-policy.md`, 2026-10-01) | sì | errori di classificazione |
| Banner e modulo (`legale/banner.html`) | sì | non conforme |
| Registro fornitori (`docs/fornitori.md`, 2026-10-15) | sì | errori e lacune |
| Informativa ai minori | no | |
| Accordo art. 28 con InsightAI | in attesa | |
| Accordo art. 28 con ChatNow | non risulta | |
| Contatti del DPO | non indicati | non so se il DPO è obbligatorio |

**Rilievi**

**L-01 · P1 · non_conforme · Base giuridica dell'iscrizione e delle videolezioni**
- Evidenza: `informativa.md` r. 17 indica il consenso per iscrizione, videolezioni e registrazioni. La r. 22 dice che senza consenso non ci si iscrive.
- Riferimenti: art. 6(1)(b) e art. 7(4) GDPR; EDPB, Linee guida 05/2020 sul consenso.
- Problema: l'iscrizione e il corso sono un contratto, quindi la base è l'art. 6(1)(b). Il consenso condizionato all'iscrizione non è libero. Le registrazioni per chi è assente hanno una base autonoma da definire (contratto o legittimo interesse). Per i minori si aggiunge il quadro dei genitori e dei tutori.
- Testo proposto: «Iscrizione, organizzazione dei corsi e videolezioni: esecuzione del contratto (art. 6(1)(b)). Registrazione delle lezioni per chi è assente: [da definire con il DPO: contratto o legittimo interesse, con diritto di opposizione]. Gli studenti possono assistere alle lezioni anche senza registrazione [se organizzativamente possibile]».
- Tipo: questione interpretativa, da confermare con il legale.

**L-02 · P1 · non_conforme · Dati sulla salute non dichiarati nell'informativa**
- Evidenza: `README.md` r. 7 e `public/index.html` r. 19 raccolgono «note_salute» (allergie e disturbi dell'apprendimento). L'informativa (r. 11) non li elenca e non indica base giuridica né finalità.
- Riferimenti: artt. 9(1), 9(2)(a), 13(1)(c) GDPR. Per i minori valgono anche l'art. 8 GDPR e il D.lgs. 196/2003 (Codice privacy).
- Testo proposto: aggiungere «dati relativi alla salute (note facoltative su allergie e disturbi dell'apprendimento): trattati solo con il consenso esplicito (art. 9(2)(a)) per consentire agli insegnanti di adattare la lezione; il consenso è facoltativo e revocabile in ogni momento senza conseguenze sull'iscrizione; accesso limitato agli insegnanti della classe».
- Lacuna: nel modulo manca un consenso separato ed esplicito per questa categoria di dati.

**L-03 · P1 · non_conforme · Il banner non permette un consenso valido ai cookie**
- Evidenza: `banner.html` r. 3-5. Il testo dice «Continuando la navigazione accetti l'uso di tutti i cookie», c'è solo «Accetta» e il rifiuto non è equivalente. «Gestisci le preferenze» rimanda alla cookie policy, che non ha un pannello di scelta.
- Riferimenti: art. 5(3) Direttiva 2002/58/CE (ePrivacy), art. 122 D.lgs. 196/2003; artt. 4(11) e 7 GDPR; Garante, Linee guida cookie del 10 giugno 2021 (provv. n. 231).
- Problema: la navigazione o lo scroll non sono consenso valido. Mancano il rifiuto di pari evidenza e la scelta per categoria. Non c'è un registro dei consensi.
- Testo proposto: «Usiamo cookie tecnici necessari. Con il tuo consenso usiamo anche cookie di statistica e di assistenza (chat) [elencare gli scopi]. [Accetta tutti] [Rifiuta tutti] [Personalizza]. Chiudere il banner con la X equivale a rifiutare. Puoi cambiare scelta dal link «Preferenze cookie» in ogni pagina».
- Aggiungere anche un link permanente per modificare la scelta e conservare la prova del consenso.

**L-04 · P1 · non_conforme · Classificazione errata dei cookie `ps_stats` e `chatnow_id`**
- Evidenza: `cookie-policy.md` r. 9-10.
- `ps_stats`: statistiche con identificativo del visitatore, 24 mesi, indicate come «non serve: legittimo interesse». Il consenso ai cookie non si sostituisce con il legittimo interesse. Non è una statistica anonima o aggregata e non è un cookie tecnico. Servono il consenso, oppure un cookie davvero anonimizzato e a durata limitata.
- `chatnow_id`: ChatNow costruisce un «profilo del visitatore per il fornitore». Non è un servizio richiesto dall'utente e non è tecnico. Se ChatNow tratta i dati per proprie finalità, è titolare o contitolare. In ogni caso serve il consenso preventivo, e il widget (`public/index.html` r. 26) oggi si carica senza consenso.
- Riferimenti: art. 122 D.lgs. 196/2003; Linee guida Garante 2021, par. 4 e 5; art. 5(3) ePrivacy.
- Testo proposto: nella colonna «Consenso», «richiesto» per entrambi. Inserire un'intestazione «Chi tratta i dati e per quali finalità» e il rinvio all'informativa del fornitore.
- Lacuna: la policy non indica le finalità dei cookie di terze parti. Va verificato come la chat si carica prima del consenso (flusso reale, non solo documento).

**L-05 · P1 · non_conforme · Garanzie di trasferimento di Mailorbit basate sul Privacy Shield**
- Evidenza: `fornitori.md` r. 10 indica «Privacy Shield». L'informativa (r. 26) dichiara «I dati restano nell'Unione europea».
- Riferimenti: sentenza Schrems II (CGUE, C-311/18, 16.7.2020); decisione sul DPF UE-USA del 10.7.2023, che sostituisce il Privacy Shield; artt. 44-46 GDPR; scheda `decisioni-adeguatezza`.
- Problema: il Privacy Shield è invalido dal 2020. Va verificato se Mailorbit è certificata nel DPF. Altrimenti servono le clausole contrattuali tipo (SCC) e una valutazione del trasferimento. L'accordo è del 2024-06-01, quindi va riesaminato.
- Testo proposto per il registro: «Garanzie: [certificazione DPF verificata il ___] oppure [SCC 2021/914, modulo 2, e valutazione di trasferimento]».
- Lacuna: non ho potuto verificare lo stato DPF di Mailorbit (nessun accesso al web).

**L-06 · P1 · non_conforme · InsightAI: accordo art. 28 mancante e riuso dei contenuti per i modelli**
- Evidenza: `fornitori.md` r. 11 e r. 15. Accordo «in attesa» e termini standard che permettono di usare i contenuti «per migliorare i propri modelli». `src/transcribe.js` r. 4-10 invia già l'audio al fornitore. Sono voce di minorenni e insegnanti.
- Riferimenti: art. 28(1)(3) GDPR; art. 44 ss. per il trasferimento verso gli USA, senza garanzie indicate; art. 5(1)(b) per il riuso, che farebbe del fornitore un titolare per proprie finalità. Per i minori vale in più l'art. 8 GDPR e, se rilevante, la L. 132/2025 art. 4 c. 4 (scheda `legge-132-2025-ia`).
- Problema: il trattamento è in corso senza accordo e senza garanzie di trasferimento (DPF non indicato, SCC assenti). Il riuso dei contenuti per addestrare i modelli è incompatibile con il ruolo di responsabile e non è descritto in informativa. La voce può anche essere un dato biometrico se usata per identificare. Va valutato.
- Testo proposto: sospendere l'invio fino alla firma dell'accordo (decisione del titolare). Clausola: «Il responsabile tratta i dati solo su istruzione documentata del titolare e non li usa per addestrare o migliorare i propri modelli. Elenco dei sub-responsabili, DPF o SCC, cancellazione o restituzione a fine servizio».
- Questione correlata, per DUBHE di sicurezza e DPIA: i dati di minori trattati con IA possono richiedere una DPIA (art. 35).

**L-07 · P1 · non_conforme · Informativa: dichiarazioni false o contraddette dal registro fornitori**
- Evidenza: `informativa.md` r. 26 («I dati restano nell'Unione europea», «nominati responsabili», «mai usati per finalità diverse»). Contraddetta da `fornitori.md`: LessonCam (supporto dagli USA), Mailorbit e InsightAI (USA). PagaFacile è titolare autonomo, non responsabile. Per InsightAI valgono i termini che permettono di migliorare i modelli.
- Riferimenti: art. 13(1)(e)(f) GDPR, artt. 5(1)(a) e 12.
- Testo proposto: «Alcuni fornitori trattano dati negli USA: LessonCam (supporto tecnico), Mailorbit, InsightAI. Il trasferimento si basa su [DPF per i fornitori certificati / SCC]. Copia delle garanzie su richiesta a privacy@... PagaFacile S.p.A. tratta i dati di pagamento come titolare autonomo, con propria informativa».
- Eliminare «mai usati per finalità diverse», salvo verifica puntuale.

**L-08 · P2 · parzialmente_conforme · Informativa incompleta rispetto all'art. 13**
- Evidenza: `informativa.md` r. 28-34 e r. 5-7.
- Mancano: contatti del DPO, se nominato (art. 13(1)(b)); destinatari per nome o categoria con ruolo; periodi di conservazione specifici (r. 30 è generico: «per il tempo necessario»), mentre il codice conserva le registrazioni 30 giorni, i log 90 e i messaggi 365 (`config/retention.json`); i diritti di limitazione, portabilità, opposizione e revoca del consenso (artt. 18, 20, 21, 7(3)), presenti solo in parte (r. 34); il diritto di reclamo al Garante (art. 13(2)(d)); se il conferimento è obbligatorio e le conseguenze (13(2)(e)); i tempi di risposta indicati in `procedura-diritti.md` (60 giorni, mentre l'art. 12(3) fissa un mese, prorogabile di altri due solo in casi complessi).
- Testo proposto: tabella di conservazione con «registrazioni delle lezioni: 30 giorni; messaggi: 365 giorni; log: 90 giorni; dati contrattuali e fiscali: 10 anni (art. 2220 c.c.) [da confermare]». Sezione diritti: «Hai diritto di accesso, rettifica, cancellazione, limitazione, portabilità, opposizione, revoca del consenso e di proporre reclamo al Garante per la protezione dei dati personali (garanteprivacy.it)».
- Tipo: lacuna documentale.

**L-09 · P2 · parzialmente_conforme · Minori: consenso e linguaggio**
- Evidenza: `informativa.md` r. 38. Gli studenti hanno dagli 8 anni (`README.md` r. 3). L'informativa dice «dai 14 anni lo studente si iscrive da sé».
- Riferimenti: art. 8 GDPR; art. 2-quinquies D.lgs. 196/2003 (consenso del minore dai 14 anni); L. 132/2025 art. 4 c. 4 (scheda), per il trattamento con IA (trascrizione); art. 12(1) GDPR (linguaggio chiaro per i minori).
- Problema: la soglia dei 14 anni vale per il consenso dei servizi della società dell'informazione. L'iscrizione a un corso è un contratto, e un minore ha capacità di agire limitata: la regola va verificata con il legale. Manca un testo semplificato per i ragazzi. La trascrizione con IA dei minori sotto i 14 anni richiede il consenso genitoriale (L. 132/2025). Il registro non dice come si verifica l'identità del genitore.
- Testo proposto: «Per gli studenti sotto i 14 anni l'iscrizione e il consenso sono dati da chi esercita la responsabilità genitoriale. Il trattamento tramite sistemi di IA (trascrizione) richiede il suo consenso specifico. Versione semplice per i ragazzi: [testo breve e illustrato]».
- Tipo: questione interpretativa, da sottoporre al legale.

**L-10 · P2 · parzialmente_conforme · Newsletter: casella preselezionata e modulo di iscrizione rapida**
- Evidenza: `banner.html` r. 9-11. La casella `newsletter` è `checked` di default. La casella «privacy» unisce «ho letto l'informativa» e «do il consenso al trattamento dei dati».
- Riferimenti: art. 4(11), art. 7(2) GDPR e considerando 32 (le caselle preselezionate non sono consenso); art. 130 D.lgs. 196/2003 (marketing e soft spin-off). Inoltre l'etichetta «newsletter e offerte» è generica.
- Testo proposto: casella newsletter non preselezionata, con «Voglio ricevere la newsletter e le offerte di Parla Subito via email. Puoi revocare in ogni momento dal link in fondo a ogni messaggio». Presa visione separata: «Ho letto l'[informativa]» (non è un consenso). Per i fini dell'iscrizione si usa la base contrattuale, non il consenso.
- Da verificare: il form si chiama «prova gratuita» ma raccoglie solo l'email. Non è chiaro se c'è un doppio opt-in. Da controllare nel flusso reale.

**L-11 · P2 · parzialmente_conforme · Registro fornitori: ruoli e dati incoerenti**
- Evidenza: `fornitori.md`.
- LessonCam: «ISO 27001 scadenza 2025-12-31», quindi con scadenza vicina e precedente al registro (aggiornato 2026-10-15). Va verificato che il certificato sia stato rinnovato. Il certificato copre solo gli uffici di Dublino. I sub-responsabili sono nell'accordo, ma il registro non li elenca.
- InsightAI: voce di minorenni, nessuna garanzia, nessuna certificazione, nessun sub-responsabile indicato.
- Nimbus: «Garanzie: —» è coerente (nessun trasferimento).
- PagaFacile «titolare autonomo»: nome del pagatore, importo e email. Va chiarito se è davvero autonomo o se tratta per conto del titolare. Il registro non riporta l'accordo né l'informativa del fornitore.
- ChatNow non è nel registro, benché installi `chatnow_id` (`cookie-policy.md`) e carichi il widget (`public/index.html` r. 26).
- Testo proposto: aggiungere la riga «ChatNow | chat di assistenza | identificativo del visitatore, contenuto dei messaggi, [altri] | [ruolo da definire] | [sede] | [accordo] | [trasferimenti] ...» e indicare l'IP e i dati che il widget invia.

**L-12 · P3 · parzialmente_conforme · Cookie policy: contenuti minimi**
- Evidenza: `cookie-policy.md` r. 1-12. Mancano la finalità di ciascun cookie, la base giuridica, i dati di contatto, il rinvio all'informativa, la modalità per revocare il consenso e le istruzioni per i principali browser.
- La riga «Si possono cancellare i cookie dalle impostazioni del browser» non è sufficiente come revoca.
- Riferimenti: Linee guida Garante 2021; art. 13 GDPR.

**Domande aperte**
1. C'è un DPO? Se sì, i contatti vanno in informativa. Se no, il titolare deve poter motivare la scelta (art. 37).
2. Le registrazioni per gli assenti sono una finalità contrattuale o un servizio facoltativo? Cambia la base e il diritto di opposizione.
3. Mailorbit è certificata nel DPF? LessonCam ha rinnovato la ISO 27001 dopo il 2025-12-31? (verifica solo sulla fonte ufficiale, non eseguibile qui).
4. Il cookie `ps_stats` può diventare anonimo o aggregato, per non richiedere il consenso?
5. Qual è il ruolo di ChatNow (responsabile, titolare autonomo o contitolare)? Se contitolare, serve l'accordo ex art. 26.

**Limiti**
Documenti letti: `legale/`, `docs/fornitori.md`, `README.md`. Ho solo cercato nel codice (`src/`, `config/`, `public/`) i riscontri con i documenti: non è una verifica dei flussi. Nessun parere legale: i punti L-01, L-04, L-09 sono interpretativi e vanno alla revisione di avvocato o DPO.

AIPCA-03 · DUBHE
