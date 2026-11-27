«AICA-12 · NUNKI — Senior Security Awareness Engineer, reparto AICA (AI Cybersecurity)»

# Revisione delle regole per il personale e del piano di formazione: Ferramenta Nord

## Sintesi per la direzione
Ho trovato 9 problemi nelle regole per il personale (`formazione/regole-personale.md`) e 6 nel piano di formazione (`formazione/piano-formazione.md`). Quattro regole sono pericolose: la password condivisa su WhatsApp, il lucchetto presentato come garanzia, la verifica dell'IBAN rispondendo alla stessa email, la MFA facoltativa per operatori e revisori. Due regole vanno contro le regole sugli accessi già approvate dalla direzione (`iam/README.md`). Il piano è punitivo: i nomi di chi clicca vanno in bacheca, l'obiettivo è «zero clic» e i revisori sono esclusi. Inoltre misura le firme e i corsi completati, non l'efficacia.

Rileggendo il log, il rapporto d'incidente risulta sbagliato su punti che cambiano la formazione e la gestione dell'incidente: l'esportazione l'ha fatta l'attaccante, un secondo account è stato usato, l'attaccante era ancora dentro dopo il reset e i log sono stati cancellati. Lo segnalo come **P0** per la scalata immediata, anche se esce dal mio ruolo.

## Perimetro, autorizzazioni e metodo
- **Perimetro:** `formazione/`. Come contesto ho letto `incidente/rapporto.md` e `incidente/estratto-2026-11-21.log`, e per un confronto `README.md`, `iam/README.md`, `iam/roles.yaml` e `iam/access-review-2026-11.csv`.
- **Metodo:** solo analisi dei documenti, in sola lettura. Niente test, niente simulazioni, nessun file scritto.
- **Fonti:** ho letto le schede della biblioteca `owasp-top-10-2025` e `nist-csf-2` (versioni 2025 e 2.0, verificate il 2026-11-19, da ricontrollare entro il 2027-05-19).
- **Nozioni senza scheda, da verificare sulla fonte:** le indicazioni su lunghezza e scadenza delle password (NIST SP 800-63B, revisione 4) e sulla debolezza degli SMS. Il web non l'ho usato, quindi queste nozioni potrebbero essere superate.
- **Direttore non caricato:** non ho potuto caricare AICA-01 · VEGA, perché in questa sessione non c'è il server MCP. Questo rapporto è per lui.

## P0 da segnalare subito (fuori ruolo: per AICA-01 e Incident Response)
Il log è in UTC; il rapporto usa l'ora italiana (UTC+1).

1. **L'esportazione l'ha fatta l'attaccante.** `estratto-2026-11-21.log:7`: `customers_export` alle 08:58Z (09:58 italiane) da 203.0.113.77, con 1840 righe che contengono `referente`, `email_referente` e `telefono_referente`. Il rapporto (riga 20) la attribuisce a M. Verdi «dall'ufficio».
   - Referenti, email e telefoni sono dati di persone fisiche, quindi la riga 21 («nessun dato personale») è un'ipotesi da rivedere.
   - Se si tratta di una violazione, i 72 ore decorrono dal 21 novembre e sono già scaduti.
   - Va coinvolta subito la Privacy & Compliance Agency (data breach). La decisione è del DPO o del responsabile umano.
2. **L'accesso è iniziato prima di quanto dice il rapporto.** Primo accesso riuscito dell'attaccante alle 08:47Z, cioè 09:47 italiane (riga 5), non alle 10:12. Prima c'erano solo 3 tentativi falliti (righe 2-4): così pochi non indicano una forza bruta, ma una password già nota (phishing, riuso o furto).
3. **Usato anche un secondo account.** L'account `r.galli` (auditor) entra dallo stesso IP alle 09:20Z e legge 212 utenti (righe 9-10). Il rapporto dice «solo quello di M. Verdi» (riga 19) e non risulta alcun reset per `r.galli`.
4. **L'attaccante era ancora dentro dopo il reset.** `orders_list` alle 09:31Z da 203.0.113.77 (riga 13), dopo il reset delle 09:30Z (riga 12): le sessioni non sono state revocate. L'incidente è dichiarato «chiuso» (riga 31).
5. **Evidenze distrutte.** L'archivio locale dei log è stato cancellato (riga 13 del rapporto). Era il secondo livello di conservazione dei log a 90 giorni (`README.md:26`).

**Azione proposta:** riaprire l'incidente, revocare le sessioni e reimpostare le credenziali di `m.verdi` e `r.galli`, preservare i log del SIEM ancora disponibili (30 giorni) e valutare la notifica. Le decisioni sono del responsabile umano.

## Rilievi sulle regole (`formazione/regole-personale.md`)

**AICA-12-R01 · P1 · Regola 3 (riga 9).** Le password degli account condivisi stanno nel gruppo WhatsApp: segreti in una chat su telefoni personali e nessuna tracciabilità. Viola `iam/README.md:5` («Ogni account è personale. Niente account condivisi, nemmeno per i turni»). L'account `magazzino` è attivo (`access-review-2026-11.csv:4`).
- Testo proposto: «Ogni persona ha il proprio account. Non esistono account condivisi, nemmeno per i turni. Non scrivere né inviare mai una password in chat, email o messaggi, nemmeno all'IT: l'IT non te la chiederà mai.»
- Il passaggio agli account personali va fatto sul sistema (sec-iam-engineer).

**AICA-12-R02 · P1 · Regola 5 (riga 14).** La MFA è solo «consigliata» per operatori e revisori. Proprio un operatore e un revisore sono stati usati nell'incidente. La regola va anche contro `iam/README.md:2`, perché nei fatti gli operatori esportano i dati dei clienti (log riga 7).
- Testo proposto: «La verifica in due passaggi è obbligatoria per tutti gli account: amministratori, operatori, amministrazione e revisori esterni. Senza, l'accesso non viene attivato.»
- Che un operator possa esportare va contro `iam/README.md:3`: è un rilievo di controllo degli accessi (A01:2025) per sec-iam-engineer / sec-appsec-engineer.

**AICA-12-R03 · P2 · Regola 6 (riga 15).** La regola impone gli SMS, cioè il fattore più debole (SIM swap, intercettazione), e vieta le app di autenticazione.
- Testo proposto: «Per la verifica in due passaggi usa, in quest'ordine: chiave di sicurezza o passkey fornita dall'azienda; app di autenticazione (sul telefono aziendale o, se non l'hai, sul personale); SMS solo se le altre non sono possibili. Se ricevi una richiesta di conferma che non hai avviato, non approvarla e segnalala subito.»
- Nozione senza scheda, da verificare su NIST SP 800-63B-4.

**AICA-12-R04 · P2 · Regole 1-2 (righe 7-8).** Le regole chiedono 8 caratteri con complessità obbligatoria e un cambio ogni 30 giorni: indicazioni superate, che portano a password prevedibili e riusate. Manca il divieto di riusare la password, che è la causa probabile dell'incidente (3 tentativi e poi accesso riuscito).
- Testo proposto:
  - 1: «La password del portale è lunga almeno 15 caratteri; va bene una frase di più parole. Deve essere unica: non usarla per nessun altro sito o servizio.»
  - 2: «La password si cambia subito se pensi che qualcuno la conosca o se te lo chiede l'IT; non c'è un cambio a scadenza fissa. Usa il gestore di password fornito dall'azienda.»
- I valori vanno verificati su NIST SP 800-63B-4. Il portale dovrebbe anche confrontare le password con elenchi di password già trapelate (controllo tecnico, per sec-iam-engineer).

**AICA-12-R05 · P1 · Regola 7 (riga 19).** È falso che il lucchetto garantisca che il sito è quello vero: indica solo una connessione cifrata, e i siti di phishing lo hanno.
- Testo proposto: «Il lucchetto indica solo che la connessione è cifrata, non che il sito è quello vero. Apri il portale dal segnalibro o digitando l'indirizzo, non dai link nelle email. Controlla il nome del dominio. Se il gestore di password non propone la tua password, fermati: probabilmente non sei sul sito giusto.»

**AICA-12-R06 · P1 · Regola 9 (riga 21).** Verificare il cambio di IBAN rispondendo alla stessa email porta la risposta proprio al truffatore (frode BEC).
- Testo proposto: «Una richiesta di cambiare IBAN o dati di pagamento, anche da un fornitore noto, si verifica sempre telefonando al numero già presente in anagrafica, mai a quello indicato nell'email. Il cambio richiede l'approvazione di una seconda persona. Nel dubbio, non pagare e segnala.»

**AICA-12-R07 · P3 · Regola 8 (riga 20).** La regola copre solo i mittenti sconosciuti, ma un account noto può essere compromesso.
- Testo proposto: «Diffida di allegati e link inattesi, anche da mittenti che conosci, soprattutto se chiedono urgenza, password, pagamenti o di abilitare le macro. Nel dubbio verifica con il mittente per un altro canale e segnala.»

**AICA-12-R08 · P1 · Regola 10 (riga 25).** Segnalare «entro la fine della giornata» è troppo lento: nell'incidente l'attaccante ha esportato i dati 11 minuti dopo l'accesso. Inoltre l'unico canale è l'email, che non serve se l'account o la casella sono compromessi.
- Testo proposto: «Se pensi di aver cliccato un link sospetto, di aver dato la password o approvato una richiesta che non hai avviato, segnalalo subito, per telefono all'IT (numero: [da indicare]) e poi a `it@ferramentanord.example`. Non sarai punito per una segnalazione: prima arriva, meno danni fa.»

**AICA-12-R09 · P1 · Regola 11 (riga 26).** Segnalare al responsabile chi clicca nelle simulazioni è punitivo: scoraggia proprio le segnalazioni che la regola 10 chiede. Tocca anche il controllo sui lavoratori, una questione da sottoporre alla Privacy & Compliance Agency, senza che io ne affermi la conformità.
- Testo proposto: «Le simulazioni di phishing servono a imparare. Chi clicca riceve subito una breve spiegazione; i risultati sono usati solo in forma aggregata e non per valutazioni individuali. Segnalare una simulazione con il pulsante "Segnala" è il comportamento corretto.»

**AICA-12-R10 · P3 · Riga 3 e mancanze.** La versione dichiara di venire «dopo l'incidente del 21 novembre», ma non ne riprende le lezioni. Mancano regole su:
- revisori esterni: account personale, a scadenza, MFA (`iam/README.md:4`);
- esportazioni e copie di dati dei clienti;
- richieste di conferma MFA non avviate;
- uso del gestore di password.

Testo proposto per la riga 3: «Per tutti gli utenti del portale interni ed esterni (magazzino, amministrazione, amministratori, revisori esterni). Da leggere prima di ricevere l'accesso e a ogni revisione; si aggiorna dopo ogni incidente.»

Le regole 4, 12 e 13 sono corrette.

## Rilievi sul piano (`formazione/piano-formazione.md`)

**AICA-12-P01 · P1 · Riga 7.** «I nomi di chi clicca si pubblicano nella bacheca interna»: la misura è punitiva e umilia le persone, riduce le segnalazioni e solleva dubbi sui dati personali dei dipendenti (Privacy & Compliance Agency). Inoltre la simulazione richiede autorizzazione scritta e regole di ingaggio, che il piano non prevede.
- Testo proposto: «Simulazione di phishing | tutti, compresi amministratori e revisori esterni | ogni trimestre, con autorizzazione scritta della direzione e regole di ingaggio | tasso di segnalazione, tempo medio alla prima segnalazione, tasso di clic (solo in forma aggregata, per reparto con almeno 5 persone); nessun nome pubblicato né comunicato ai responsabili.»

**AICA-12-P02 · P2 · Riga 9.** L'obiettivo «zero clic» non è realistico e spinge a nascondere gli errori.
- Testo proposto: «**Obiettivo 2027**: almeno il 70% delle simulazioni segnalate entro 30 minuti; tasso di clic in calo rispetto alla prima simulazione; ogni incidente reale segnalato entro 15 minuti dalla scoperta.»
- I valori sono da tarare con l'utente sulla prima misura di partenza.

**AICA-12-P03 · P1 · Riga 11.** I revisori esterni sono esclusi dalla formazione, ma `r.galli` (auditor) è stato usato nell'incidente e legge gli elenchi degli utenti.
- Testo proposto: «I revisori esterni e gli altri account esterni ricevono le regole e il modulo base prima dell'attivazione dell'accesso; la formazione è una condizione dell'accesso, come la scadenza a 90 giorni (`iam/README.md:4`).»

**AICA-12-P04 · P2 · Righe 5-6.** Le misure (firme raccolte, corso completato) dicono se le persone hanno partecipato, non se si comportano in modo più sicuro. Un'ora l'anno, sempre a gennaio, è troppo poco e uguale per tutti.
- Testo proposto: aggiungere moduli brevi (10-15 minuti) ogni trimestre, diversi per ruolo:
  - amministrazione: frodi IBAN e BEC;
  - magazzino: account personali, MFA, segnalazione;
  - amministratori: reset con revoca delle sessioni, conservazione delle evidenze;
  - revisori: accesso minimo e segnalazione.

  Misure: uso della MFA per ruolo, account condivisi rimasti, tempo di segnalazione.

**AICA-12-P05 · P2 · Lacuna.** Il piano non usa l'incidente del 21 novembre, che è proprio il contenuto più efficace.
- Testo proposto: «Entro gennaio 2027: sessione di 30 minuti per tutti sull'incidente del 21 novembre (anonimizzata, senza colpe individuali): come è entrato l'attaccante, cosa avrebbe fermato prima (MFA, password unica, segnalazione immediata).»
- Va fatta dopo la correzione del rapporto (vedi la sezione P0).

**AICA-12-P06 · P3 · Lacuna di governo.** Il piano non indica un proprietario, la revisione dopo gli incidenti né il legame con le politiche di accesso. Nel NIST CSF 2.0 (scheda `nist-csf-2`, 2.0, verificata il 2026-11-19) la funzione Govern copre ruoli, responsabilità e politiche. La formazione sta nella categoria Awareness and Training della funzione Protect: la scheda non lo riporta, quindi la sigla esatta va verificata sulla fonte.
- Testo proposto: «Responsabile del piano: [da indicare]; revisione dopo ogni incidente e una volta l'anno; regole allineate a `iam/README.md`.»

## Rischio residuo e limiti
- Le regole tecniche (MFA, account personali, revoca delle sessioni, permesso di esportazione degli operator) richiedono modifiche ai sistemi, non solo alla formazione. Passaggio a sec-iam-engineer e sec-incident-response.
- Non ho verificato:
  - i testi del corso online;
  - gli strumenti di simulazione;
  - le basi giuridiche del monitoraggio dei dipendenti (Privacy & Compliance Agency).
- Valori di password e MFA da verificare su NIST SP 800-63B-4: nessuna scheda in biblioteca, web non usato.
- Questa revisione non è una certificazione delle regole né del programma di formazione.

## Domande aperte per AICA-01 / l'utente
1. Chi autorizza per iscritto le simulazioni di phishing e chi fa da referente?
2. È disponibile un numero di telefono per le segnalazioni all'IT e un gestore di password aziendale?
3. L'azienda fornisce telefoni o chiavi per la MFA agli operatori del magazzino?
4. Chi decide sulla riapertura dell'incidente e sulla valutazione della notifica (DPO o responsabile)?

## Nuova verifica proposta
Rileggere regole e piano dopo le modifiche. Dopo la prima simulazione autorizzata, controllare i tassi di segnalazione e i tempi in forma aggregata. Confrontare con `access-review` del trimestre successivo: zero account condivisi e MFA attiva su tutti gli account.

Firmato: AICA-12 · NUNKI
