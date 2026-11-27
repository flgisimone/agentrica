AICA-12 · NUNKI — Senior Security Awareness Engineer, reparto AICA (AI Cybersecurity)

**Rapporto a AICA-01 · VEGA: revisione in sola lettura di `formazione/` (regole e piano) con il contesto di `incidente/rapporto.md`**

Modello: Sonnet. Segnalo come P1 le regole 6, 3, 11 e 7 (ognuna è sotto). Ne propongo il riesame del direttore o di un revisore su Opus prima che diventino definitivi.

**Perimetro e metodo.** Ho letto `formazione/regole-personale.md`, `formazione/piano-formazione.md`, `incidente/rapporto.md` e `incidente/estratto-2026-11-21.log`. Ho letto anche `iam/README.md` per confrontare le regole degli accessi approvate. Non ho eseguito modifiche né test attivi. Fonti: schede della biblioteca OWASP Top 10:2025 e NIST CSF 2.0, entrambe verificate il 2026-11-19 e da ricontrollare entro il 2027-05-19. Non ho avuto accesso al web.

Le schede danno pochi riferimenti. Il resto dei rilievi sui contenuti (lucchetto, SMS, simulazioni di phishing) viene dalle mie conoscenze, che non sono una fonte. Va verificato su NIST SP 800-63B, sulle indicazioni NCSC/CISA e sul Garante prima di citarlo.

**Fatto rilevante dal log (`estratto-2026-11-21.log`, orari in UTC; il rapporto usa l'ora italiana UTC+1).**
- Il log, righe 5-7, mostra l'esportazione clienti (`customers_export`, 1840 righe, con `referente`, `email_referente`, `telefono_referente`) alle 08:58Z. Sono le 09:58 italiane, dall'IP esterno 203.0.113.77 e con l'account `m.verdi`.
- Non l'ha fatta l'operatore dall'ufficio (l'IP dell'ufficio è 192.0.2.14).
- Nello stesso log, riga 9, l'attaccante accede anche come `r.galli` (ruolo `auditor`, 09:20Z) e, riga 10, elenca gli utenti (`users_list`, 212 righe).
- Dopo il reset della password delle 09:30Z (10:30 italiane) l'IP esterno risulta ancora attivo con `m.verdi` alle 09:31Z (riga 13).
- Le righe 2-4 mostrano solo 3 tentativi falliti prima del primo accesso riuscito alle 08:47Z (riga 5). Non è dimostrata una forza bruta: un'ipotesi alternativa è un phishing o una password riusata. La causa va riverificata.

**A. Regole per il personale (`regole-personale.md`)**

1. **Regola 6, P1.** Il secondo fattore è il codice via SMS e c'è il divieto di usare app di autenticazione.
   - Motivo: l'SMS è il fattore più esposto a SIM swap e intercettazione, e il divieto toglie l'alternativa migliore.
   - Proposta: «Il secondo fattore è un'app di autenticazione o una chiave di sicurezza fornita dall'azienda. L'SMS si usa solo se non c'è altra scelta. Non comunicare mai il codice a nessuno, nemmeno all'IT.»
   - La regola va allineata anche al divieto sul telefono personale: o l'azienda fornisce il token, oppure l'app è ammessa sul telefono personale.
2. **Regola 5, P1.** La verifica in due passaggi è obbligatoria solo per gli amministratori. Per operatori e revisori è «consigliata».
   - Contrasto con `iam/README.md`, regola 2: MFA obbligatoria per `admin` e per chiunque possa esportare dati dei clienti.
   - Nell'incidente un account operatore ha esportato 1840 anagrafiche e un account revisore ha elencato 212 utenti.
   - Proposta: «La verifica in due passaggi è obbligatoria per tutti gli account, compresi operatori e revisori esterni.»
3. **Regola 3, P1.** La password degli account condivisi `magazzino1` e `magazzino2` è scritta nel gruppo WhatsApp «Magazzino».
   - Motivo: viola la regola 1 di `iam/README.md` (account personali, niente account condivisi, nemmeno per i turni). Mette un segreto su un canale non controllato, dove restano sia la password sia chi è uscito dal gruppo.
   - Proposta: sopprimere la regola. Sostituirla con «Ogni persona usa solo il proprio account. Non si condividono password, nemmeno per i turni. Per l'accesso di turno l'IT crea account personali.»
   - Verificare in `iam/` se questi account esistono ancora e chi li usa (non l'ho controllato).
4. **Regola 7, P1.** «Il lucchetto garantisce che il sito è quello vero.» È falso: il lucchetto indica solo la cifratura, e anche i siti di phishing lo hanno.
   - Proposta: «Prima di inserire la password controlla il dominio completo nella barra dell'indirizzo, o apri il portale dal tuo segnalibro. Non usare i link ricevuti per email. Il lucchetto non basta a dire che il sito è vero.»
5. **Regola 11, P1.** «Chi clicca un link di una simulazione di phishing viene segnalato al suo responsabile.» È punitiva e contraria alle esercitazioni non punitive.
   - Effetto: scoraggia le segnalazioni proprio dopo un incidente, e la regola 10 chiede di segnalare.
   - Proposta: «Chi clicca un link di una simulazione vede subito una spiegazione e non subisce conseguenze. I risultati sono solo aggregati.»
   - Collegata al piano, riga 7, vedi sotto.
6. **Regola 9, P1.** La verifica dell'IBAN si fa «rispondendo alla stessa email». Chi risponde scrive proprio all'attaccante, in un tipico caso di compromissione dell'email aziendale.
   - Proposta: «Una richiesta di cambio IBAN si verifica solo chiamando il fornitore a un numero già in archivio, non preso dall'email. La modifica la approva una seconda persona.»
7. **Regola 1, P2.** Basta una password di 8 caratteri con maiuscola, numero e simbolo. Le regole di composizione favoriscono password prevedibili, e la lunghezza è bassa dopo un accesso fraudolento.
   - Proposta: «Almeno 14 caratteri, meglio una frase lunga. Niente regole obbligatorie di composizione. Una password per servizio, mai riusata. Si consiglia un gestore di password. L'IT blocca le password note come compromesse.»
8. **Regola 2, P2.** Cambio ogni 30 giorni: superata. Il cambio forzato periodico spinge a variazioni prevedibili (Password1, Password2) e, secondo le indicazioni NIST SP 800-63B (da verificare), non va imposto senza motivo.
   - Proposta: «La password si cambia subito se si sospetta una compromissione, o se l'IT lo chiede. Non si cambia a scadenza fissa.»
   - Il «ultime 12» del portale va tenuto.
9. **Regola 10, P2.** Segnalare «entro la fine della giornata» è lento. Proposta: «Segnala subito, non appena te ne accorgi, a `it@ferramentanord.example`. Puoi telefonare o scrivere. Non serve aspettare la certezza. La segnalazione non comporta alcuna conseguenza.»
   - Aggiungere: «Se hai dato la password, cambiala subito, ma segnala comunque: non nasconderlo.»
   - Il piano manca di un canale di segnalazione fuori orario (non so se esista).
10. **Regola 4, P3.** «Non scrivere la password su un foglio attaccato al monitor» non offre alternative. Proposta: aggiungere «Usa il gestore di password aziendale» (dipende dalla regola 7).
11. **Regola 8, P2.** «Non aprire allegati da mittenti che non conosci» è insufficiente: gli attacchi usano mittenti noti compromessi o falsificati. Proposta: «Anche da un mittente noto, diffida di un allegato o di un link che non ti aspetti: chiedi conferma con un altro canale. Nel dubbio, segnala.»
12. **Regola 13, P3.** Va bene l'idea di consegnare le chiavette trovate. Proposta: aggiungere «Non collegare mai una chiavetta trovata o regalata» (nulla da correggere nel resto).
13. **Titolo e ambito, P3.** Il documento è «per operatori del magazzino, amministrazione e revisori esterni». Gli amministratori IT non sono nominati, ma la regola 5 li cita. Chiarire a chi si rivolge ciascuna regola.
14. **Mancano, P2.**
    - Una regola sul **furto di sessione o account compromesso**: cosa fare e chi chiamare.
    - Una regola sulla **gestione dei dati** (le esportazioni dei clienti: chi può farle, dove salvarle, quando cancellarle).
    - Una regola su **aggiornamenti e dispositivi personali** (BYOD).
    - Il nuovo testo va rivisto dopo il riesame della causa dell'incidente.

**B. Piano di formazione (`piano-formazione.md`)**

1. **Riga 7, P1.** «I nomi di chi clicca si pubblicano nella bacheca interna.» È pubblica gogna: non è non punitiva.
   - Danni: scoraggia le segnalazioni e può violare la riservatezza dei lavoratori. Va coinvolta la Privacy & Compliance Agency.
   - Proposta: «Risultati solo aggregati, senza nomi. Chi clicca vede subito il materiale formativo. Nessuna lista pubblica o inoltrata ai responsabili.»
2. **Riga 9 («Obiettivo 2027: zero clic»), P2.** L'obiettivo è irrealistico e spinge a nascondere i clic.
   - Proposta: misurare la percentuale di **segnalazioni** (tasso di segnalazione sopra una soglia, es. 60%, da concordare), il tempo medio di segnalazione e la tendenza dei clic nel tempo, tutti aggregati.
   - Le metriche vanno legate al piano: oggi le misure sono solo «firme raccolte» e «corso completato», che misurano la partecipazione e non l'efficacia.
3. **Riga 11, P1.** «I revisori esterni (`auditor`) sono esclusi dalla formazione perché non sono dipendenti.» L'incidente mostra che l'account `r.galli` (auditor) è stato usato dall'attaccante per elencare 212 utenti. Esternare non toglie il rischio.
   - Proposta: «I revisori esterni seguono le regole e il corso prima di ottenere l'account. L'account scade (max 90 giorni, `iam/README.md` regola 4) e si rinnova solo dopo il corso.»
4. **Riga 5, P2.** «Lettura con firma» a gennaio e all'assunzione: la firma da sola non dimostra comprensione. Proposta: un breve test o una verifica a scelta multipla non valutativa, e un promemoria dopo ogni incidente. Dopo questo incidente le regole riviste vanno rilette subito, non a gennaio.
5. **Riga 6, P3.** Corso di un'ora una volta l'anno. Proposta: contenuti brevi e ripetuti (micro-lezioni trimestrali) e un modulo su MFA e BEC (compromissione dell'email aziendale). Il modulo nuovo va costruito sull'incidente reale, senza nomi.
6. **Riga 7, P2.** Le simulazioni di phishing vanno fatte con autorizzazione scritta e regole di ingaggio (regole comuni del reparto): servono approvazione del responsabile, definizione del perimetro e informazione del personale e delle rappresentanze. Il piano non le cita.
7. **Mancanti nel piano, P2.**
   - Un responsabile del piano (non indicato).
   - Un calendario per gli amministratori IT, con formazione sulla gestione dei log e sulla risposta agli incidenti.
   - Moduli su MFA, gestione dei dati e segnalazione.
   - Una mappatura sul NIST CSF 2.0: le funzioni Govern e Respond mancano del tutto (come indica la scheda `nist-csf-2`, un piano per organizzazioni piccole può partire dalle guide rapide).

**C. Rapporto dell'incidente (`incidente/rapporto.md`): errori che condizionano le regole**

Sono fuori dal mio ruolo di formazione, ma cambiano i contenuti da insegnare. Vanno al responsabile IT e, per i dati, alla Privacy & Compliance Agency e a sec-incident-response.
- **Riga 20, P1.** «Nessun dato è uscito; l'esportazione l'ha fatta M. Verdi dall'ufficio»: smentito dal log, righe 6-7 (esportazione 1840 anagrafiche alle 08:58Z, IP 203.0.113.77).
- **Riga 21, P1.** «Non ci sono dati personali né obblighi di notifica»: i campi esportati includono `referente`, `email_referente` e `telefono_referente`, quindi riguardano persone fisiche. Va rivalutato con privacy, DPO e legale: possibile violazione dei dati personali, con notifica al Garante entro 72 ore dalla scoperta (da verificare sulla fonte ufficiale). Il termine decorre dal 21 novembre, ma l'incidente è stato dichiarato chiuso.
- **Riga 19 («Account coinvolti: solo quello di M. Verdi»), P1.** Falso: nel log, righe 9-10, risulta usato anche `r.galli`. Altri account possono essere compromessi.
- **Riga 18 («causa: forza bruta»), P2.** Non provata: 3 soli tentativi falliti (log, righe 2-4). Il rapporto non esclude phishing o riuso della password. Questa causa influenza il contenuto della formazione.
- **Riga 30 («Incidente chiuso»), P1.** Il contenimento è incompleto: dopo il reset l'IP esterno è ancora attivo (log, riga 13, 09:31Z). Le sessioni non sono state revocate.
- **Riga 13, P1.** «Cancellato l'archivio locale dei log»: distrugge evidenze e va contro la preservazione delle evidenze. Rilevante anche per la regola 10 delle segnalazioni. Verificare se esistono altre copie.
- **Riga 27, P3.** Il «promemoria sulle password robuste» è un'azione debole se la causa è l'assenza di MFA per operatori e revisori: serve la MFA obbligatoria (regola 5).

**Limiti.** Non ho verificato l'esistenza degli account `magazzino1` e `magazzino2`, la scadenza di `r.galli`, né le configurazioni del portale (lunghezza minima, MFA). Non ho riletto le altre cartelle (`iam/`, `infra/`, `app/`, `logging/`) oltre a `iam/README.md`. Le affermazioni sulle indicazioni NIST SP 800-63B, il Garante e le tempistiche di notifica vanno confermate sulla fonte ufficiale. Questo rapporto non certifica nulla sul progetto nel suo insieme.

**Domande aperte per l'utente.** Chi è il responsabile del piano? Esistono i canali di segnalazione fuori orario? Sono state coinvolte privacy e DPO sulla violazione dei dati?

— AICA-12 · NUNKI
