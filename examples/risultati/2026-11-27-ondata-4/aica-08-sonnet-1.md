AICA-08 · ELNATH — Senior Incident Response & Forensics Specialist, reparto AICA (AI Cybersecurity)

**Rapporto per AICA-01 · VEGA (revisione in sola lettura, nulla è stato modificato)**

Non ho caricato AICA-01 con `agent`: non ho il server MCP in questa prova. Ho letto le schede `cvss-4` e `nist-csf-2` con `agent-text`. Il CVSS non serve qui: non ho valutato vulnerabilità. Del CSF 2.0 (verificato il 2026-11-19) uso solo le funzioni Respond e Recover come riferimento, non come dichiarazione di conformità.

**Sintesi.** Il rapporto del 21 novembre non regge: quasi ogni conclusione è contraddetta dal log. Il rilievo più grave è P0. L'esportazione dei clienti l'ha fatta l'attaccante, non M. Verdi. Un secondo account (`r.galli`) è stato compromesso e non è stato contenuto. Dopo il reset della password l'attaccante ha continuato a lavorare. Il rapporto va riaperto. Servono i responsabili umani, il DPO e il legale, perché il termine di 72 ore per la notifica al Garante è probabilmente già scaduto.

**Perimetro e metodo.** Ho letto `incidente/rapporto.md`, `incidente/estratto-2026-11-21.log`, `README.md` e `iam/roles.yaml`. Il log è in UTC (`Z`) e il rapporto in ora italiana (UTC+1), quindi ho sommato un'ora a ogni riga del log. Ho verificato il fuso: il login di Verdi alle 08:31Z corrisponde alle 09:31 del rapporto. Non ho letto le altre cartelle: nginx, log completi e archivio non erano nel perimetro.

**Rilievi** (le righe del log sono contate nel file dell'estratto)

1. **P0 – Esportazione fatta dall'attaccante, dati usciti (rapporto «Dati»; log riga 7).** `customers_export` è alle 08:58:32Z, cioè 09:58 locali. Parte da `client_ip` 203.0.113.77, l'IP dell'attaccante, e non da 192.0.2.14, l'IP dell'ufficio di Verdi. L'export ha 1840 righe con referente, email, telefono, indirizzo e fido. Il rapporto dice invece che l'ha fatta Verdi dall'ufficio prima dell'attaccante e che «nessun dato è uscito». Azione corretta: trattarlo come esfiltrazione confermata di 1840 record di clienti.
2. **P0 – Secondo account compromesso e non contenuto (rapporto «Account coinvolti»; log righe 9-10).** Alle 09:20:44Z (10:20 locali) l'account `r.galli` (auditor) fa login dallo stesso IP 203.0.113.77. Alle 09:21:30Z fa `users_list` con 212 righe. Il reset della password (riga 12) riguarda solo Verdi. `r.galli` è un revisore esterno e `iam/roles.yaml` gli dà `mfa: false`. Azione corretta: disabilitare subito `r.galli` e revocarne le sessioni. Poi verificare quale utente interno ha usato l'accesso e riesaminare tutti gli account esterni.
3. **P1 – Il contenimento non ha funzionato (rapporto 10:30 «l'attaccante è fuori»; log riga 13).** Alle 09:31:40Z (10:31 locali), un minuto dopo il reset, c'è un `orders_list` di `m.verdi` dall'IP dell'attaccante, con 500 righe. La sessione era ancora valida: il reset non l'ha revocata. Azione corretta: il reset va accompagnato da revoca di sessioni e token e da blocco dell'IP, dopo l'approvazione del responsabile umano. Va anche verificato se gli accessi sono continuati dopo.
4. **P1 – Prove distrutte (rapporto 10:40).** La VM è stata ricreata e l'archivio locale dei log è stato cancellato «per ripartire puliti». L'archivio era il secondo livello di conservazione: il requisito del README è di 90 giorni, mentre il SIEM tiene 30 giorni. Non c'è nessuno snapshot né copia forense della VM e nessuna catena di custodia. Il disco pieno di log era un problema da risolvere con una copia o uno spostamento, non con la cancellazione. L'estratto è solo di sorgente `app` e `siem`, senza hash. Azione corretta: segnalare la perdita come limite dell'indagine. Raccogliere da SIEM, nginx e provider quel che resta, con hash e registro delle evidenze, e fissare un playbook che vieti di distruggere VM e log prima della copia.
5. **P1 – Cronologia sbagliata (rapporto 10:12; log righe 2-5).** I tentativi dell'attaccante iniziano alle 08:40:11Z (09:40 locali), con tre `login_failed`. L'accesso riuscito è alle 08:47:15Z (09:47 locali). Il rapporto indica 10:12 come primo accesso anomalo, ma quella è la riga 8 (09:12:08Z), un login successivo. Corretto così:
   - 09:40 primi tentativi;
   - 09:47 accesso;
   - 09:49 `orders_list`;
   - 09:58 export;
   - 10:05 alert del SIEM;
   - 10:12 nuovo login;
   - 10:20-10:21 pivot su `r.galli`;
   - 10:30 reset;
   - 10:31 sessione ancora attiva.
   
   Va corretto anche il ritardo di risposta: dall'ingresso al reset passano 43 minuti, dall'alert 25. Nell'estratto la riga 11 (SIEM, 09:05:00Z) è fuori ordine temporale. Va spiegato se è ritardo di ingestione o riordino dell'estratto, perché influisce sull'affidabilità della cronologia.
6. **P1 – Causa non dimostrata (rapporto «Causa»; log righe 2-5).** Tre tentativi falliti in circa un minuto e poi un successo sette minuti dopo non indicano una forza bruta. Possono indicare password riutilizzata, credential stuffing o credenziali già in mano all'attaccante. Anche «password debole» è un'ipotesi non provata. Il fattore verificabile è che `operator` e `auditor` hanno `mfa: false` in `roles.yaml`, e l'operatore ha `customers:export`. Azione corretta: riscrivere la causa come ipotesi, separata dai fatti, e inserire il MFA tra le correzioni. Il promemoria sulle password non basta.
7. **P1 – Obblighi (rapporto «Obblighi»).** I clienti sono aziende, ma i dati esportati sono di persone fisiche: referente, email e telefono del referente. Anche i 212 utenti di `users_list` possono contenere dati personali. Quindi non è vero che «non ci sono dati personali né obblighi». Va valutata la violazione ai sensi dell'art. 33 GDPR: notifica al Garante entro 72 ore dalla conoscenza, ed eventuale comunicazione agli interessati (art. 34). La conoscenza si può far risalire all'alert delle 10:05 del 21 novembre, quindi il termine scadeva il 24 novembre alle 10:05. Oggi è il 27 novembre. Se si notifica ora, la notifica deve motivare il ritardo. Va tenuto il registro delle violazioni (art. 33(5)) e vanno informati i clienti titolari dei dati, se il titolare è il cliente. Non ho una scheda GDPR in biblioteca e non do consulenza legale: la valutazione spetta al DPO o al legale, con la Privacy & Compliance Agency.
8. **P2 – Chiusura prematura (rapporto «Stato»).** L'incidente è chiuso il 21 novembre, ma non c'è riesame, non c'è rotazione dei segreti, l'azione sul MFA manca e la causa non è accertata. Mancano anche le lezioni apprese e la verifica di persistenza dell'attaccante: la VM è stata ricreata, ma l'accesso con `r.galli` e le credenziali dell'applicazione non risultano ruotati. Azione corretta: riaprire l'incidente fino a contenimento verificato, notifiche valutate e lezioni documentate.

**Fatti, ipotesi, limiti**
- Fatti, dal log: IP, orari, righe, ruoli.
- Ipotesi: la causa dell'accesso e la possibile persistenza dopo le 10:31.
- Limiti: non ho visto nginx, i log completi o quelli di database e VPN.
- Non ho verificato la mappatura tra `r.galli` e una persona reale.

Questo riesame non certifica nulla. Poiché lavoro su un modello più piccolo (Sonnet) e ci sono rilievi P0 e P1, propongo il riesame di AICA-01 o di un revisore su Opus prima che diventino definitivi.

**Domande aperte:** chi gestisce `r.galli` e sono ancora attive sue sessioni? Che cosa resta sul SIEM e nel provider per i giorni precedenti al 21 novembre? Chi è il titolare del trattamento e chi il DPO? Esiste uno snapshot della VM prima della ricreazione?

**Nuova verifica:** controllare che `r.galli` e le sessioni di Verdi siano bloccate, che il MFA sia abilitato per `operator` e `auditor`, e che le prove siano state raccolte con hash e registro. Poi ripetere la revisione della cronologia con gli altri log.

— AICA-08 · ELNATH
