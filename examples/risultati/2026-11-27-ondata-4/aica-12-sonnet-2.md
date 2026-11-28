AICA-12 · NUNKI — Senior Security Awareness Engineer, reparto AICA (AI Cybersecurity)

RAPPORTO per AICA-01 · VEGA (sola lettura: nessun file modificato né scritto; AICA-01 non caricato)

SINTESI
Il testo delle regole contiene errori di fatto, regole superate e regole pericolose. Tre rilievi sono P1: la password nel gruppo WhatsApp, la verifica in due passaggi non obbligatoria per tutti e il consiglio sull'IBAN. Il piano di formazione ha un modello punitivo (nomi pubblicati, obiettivo di zero clic) ed esclude i revisori, che nell'incidente risultano coinvolti. Il rapporto sull'incidente da cui nascono le regole è in parte contraddetto dal suo stesso log (vedi «Contesto dell'incidente»).

PERIMETRO E METODO
- Letti: formazione/regole-personale.md, formazione/piano-formazione.md, incidente/rapporto.md; confrontati con incidente/estratto-2026-11-21.log e iam/roles.yaml (e un estratto di app/auth.js).
- Scheda usata: nist-csf-2 (NIST CSF 2.0, verificata 2026-11-19, da ricontrollare entro 2027-05-19). owasp-top-10-2025 non è pertinente.
- La biblioteca non ha una scheda sulle linee guida per le password (es. NIST SP 800-63B) né su phishing e MFA. Le indicazioni su lunghezza, rotazione e metodi di autenticazione vengono dalle mie conoscenze, che non sono una fonte: vanno verificate sulla fonte ufficiale prima di adottarle.
- Lavoro su un modello più piccolo di quello della sessione: per i rilievi P1 propongo il riesame del direttore AICA-01 o di un revisore su Opus prima che diventino definitivi.

RILIEVI SULLE REGOLE (formazione/regole-personale.md)

Regola 3 — P1. La password degli account condivisi magazzino1 e magazzino2 sta in un gruppo WhatsApp: chi esce dal gruppo o perde il telefono la conserva e non c'è tracciabilità di chi ha fatto cosa. Testo proposto: «Ogni persona usa il proprio account personale; gli account condivisi non si usano. Non scrivere né condividere mai una password in chat, email o gruppi.» Da fare subito: ruotare le password di magazzino1 e magazzino2.

Regole 5 e 6 — P1. La verifica in due passaggi è obbligatoria solo per gli amministratori. iam/roles.yaml ha mfa: false per operator e auditor, ma l'operatore può esportare i clienti (customers:export) e l'auditor legge gli utenti: il log mostra proprio questi due ruoli usati da un indirizzo esterno. La regola 6 impone gli SMS, più deboli, e vieta le app di autenticazione. Testo proposto: «La verifica in due passaggi è obbligatoria per tutto il personale e i revisori. Usa preferibilmente un'app di autenticazione o una chiave di sicurezza; l'SMS solo se non hai altra scelta. Un'app sul telefono personale va bene.»

Regola 9 — P1. Verificare un cambio IBAN rispondendo alla stessa email è ciò che vuole il truffatore (frode del falso fornitore). Testo proposto: «Una richiesta di cambio IBAN o di pagamento non si verifica mai sullo stesso canale. Chiama il fornitore a un numero che avevi già e fai approvare la modifica da una seconda persona.»

Regola 7 — P2. «Il lucchetto garantisce che il sito è quello vero» è falso: indica solo la connessione cifrata e anche i siti di phishing lo hanno. Testo proposto: «Controlla il nome del sito scritto nell'indirizzo; il lucchetto non dice che il sito è quello giusto. In dubbio, apri il portale dal tuo segnalibro, non dal link.»

Regola 11 — P2. Segnalare al responsabile chi clicca in una simulazione è punitivo e scoraggia le segnalazioni, che sono la difesa più utile. Testo proposto: «Nessuno viene segnalato per nome. I risultati delle simulazioni sono solo aggregati. Chi segnala un'email sospetta riceve un ringraziamento.»

Regola 10 — P2. «Entro la fine della giornata» è troppo lento e manca un canale alternativo se la posta è compromessa. Testo proposto: «Segnala subito, anche se non sei sicuro e anche se hai sbagliato. Scrivi a it@ferramentanord.example o telefona al [numero IT da inserire].»

Regola 1 — P2. 8 caratteri con maiuscola, numero e simbolo è superata: spinge verso password prevedibili e non basta contro il tentativo di indovinare. Testo proposto: «Usa una password lunga di almeno [14–15] caratteri, unica per ogni servizio, anche una frase; meglio con un gestore di password.» I requisiti tecnici del portale (app/auth.js) vanno allineati.

Regola 2 — P2. Il cambio ogni 30 giorni è superato e dannoso (varianti prevedibili tipo «Password1», «Password2»). Testo proposto: «La password si cambia solo se sospetti che sia stata esposta e dopo ogni segnalazione.»

Regola 4 — P3. Vieta il foglietto senza offrire alternativa. Aggiungere: «Usa il gestore di password fornito dall'azienda.»

Regola 8 — P3. Parla solo di allegati; il caso più frequente è il link. Testo proposto: «Non aprire allegati né link che non ti aspetti, anche se il mittente sembra noto. In dubbio, conferma con una telefonata.»

Regola 13 — P3. Corretta; aggiungere «e avvisalo».

Regole mancanti: gestione delle esportazioni di dati dei clienti (l'incidente ha riguardato proprio un'esportazione); cosa fare se trovi un accesso o un reset della password che non hai fatto tu; chiusura della sessione a fine turno; l'ambito dovrebbe includere esplicitamente anche gli amministratori.

RILIEVI SUL PIANO (formazione/piano-formazione.md)

Riga 7 (nomi nella bacheca) — P1. Pubblicare i nomi di chi clicca è punitivo e umiliante, distrugge la fiducia necessaria per segnalare e tratta dati dei lavoratori senza necessità. Testo proposto: «I risultati sono solo aggregati, per reparto, e non identificano nessuno.»

Riga 7 (autorizzazione) — P1. La simulazione di phishing sui dipendenti richiede autorizzazione scritta e regole di ingaggio (regole comuni del reparto): nel piano non c'è traccia di chi autorizza. Il tema lavoro e privacy (controllo dei lavoratori, DPO, rappresentanti) va rivisto da Privacy & Compliance e dal legale. Aggiungere: «Previa autorizzazione scritta della direzione e valutazione di Privacy & Compliance; avviso generale al personale; nessun uso disciplinare.»

Righe 7 e 9 (misura e obiettivo) — P2. La sola percentuale di clic e l'obiettivo «zero clic» sono irrealistici e spingono a nascondere gli errori. Sostituire con: «Obiettivo 2027: calo dei clic e aumento delle segnalazioni. Misure aggregate: percentuale di segnalazioni, tempo medio di segnalazione, percentuale di password reimpostate dopo una segnalazione, copertura della verifica in due passaggi.»

Righe 5 e 6 — P2. «Firme raccolte» e «corso completato» misurano la presenza, non l'efficacia. Una lezione all'anno a gennaio lascia scoperto chi arriva dopo. Proposta: «Corso breve all'assunzione (entro la prima settimana) e moduli brevi trimestrali. Misura: prova finale e metriche aggregate.»

Riga 11 — P2. Escludere i revisori (auditor) perché «non sono dipendenti» è sbagliato: hanno accesso agli utenti, la regola 5 li cita e r.galli risulta coinvolto nell'incidente. Proposta: «I revisori esterni sono inclusi, con modulo e verifica in due passaggi obbligatoria.»

Generale — P2. Mancano un responsabile del piano, una valutazione di partenza e un modulo sull'incidente del 21 novembre (nel CSF 2.0 è Govern: ruoli, politiche, responsabilità). Aggiungere «Responsabile del piano [da indicare]» e un modulo «Lezioni dall'incidente del 21 novembre» senza nomi.

Generale — P3. Manca formazione mirata per amministratori e operatori che esportano dati.

CONTESTO DELL'INCIDENTE (fatti dal log; da riportare a chi gestisce l'incidente, non decisi da me)
- Orari: il log è in UTC (un'ora indietro rispetto all'ora italiana). Il primo accesso anomalo è alle 09:47 (tentativi falliti dalle 09:40), non alle 10:12.
- Esportazione: l'esportazione di 1.840 righe delle 09:58 (08:58Z, riga 7) parte dall'indirizzo esterno 203.0.113.77 dell'attaccante, non dall'ufficio (192.0.2.14). Il rapporto dice il contrario e conclude che nessun dato è uscito. Campi esportati: referente, email e telefono del referente.
- Secondo account: r.galli (auditor) ha fatto accesso dallo stesso indirizzo esterno alle 10:20 (riga 9) e ha letto l'elenco di 212 utenti (riga 10). Il rapporto dice «solo quello di M. Verdi».
- Reset della password: dopo il reset delle 10:30 il log mostra ancora un accesso dell'attaccante alle 10:31 (riga 13) con lo stesso account. La sessione non è stata chiusa, quindi «l'attaccante è fuori» non è dimostrato.
- Causa: «forza bruta» non è dimostrata (tre tentativi falliti e poi un accesso riuscito); non si escludono credenziali già note o rubate. Non è spiegato perché r.galli abbia avuto accesso.
- Dati personali: nomi, email e telefoni dei referenti sono dati personali anche se i clienti sono aziende. L'affermazione «non ci sono dati personali né obblighi di notifica» va riesaminata subito da Privacy & Compliance. Il termine di 72 ore dalla scoperta (21 novembre, ore 10:05) è già scaduto (oggi è il 27 novembre).
- Log cancellati: l'archivio locale è stato cancellato alle 10:40, e la conservazione richiesta è di 90 giorni mentre il SIEM ne tiene 30. Sono state distrutte evidenze durante l'incidente.
- Chiusura prematura dell'incidente.
- L'azione prevista («promemoria sulle password robuste») è la lezione sbagliata: le lacune sono la verifica in due passaggi sui ruoli con più accessi, la revoca delle sessioni, il blocco dopo tentativi falliti e la conservazione dei log.

LIMITI E AREE NON VERIFICATE
- Non ho verificato il codice dell'app né le impostazioni del SIEM oltre i file citati.
- Le indicazioni su password e MFA vengono dalle mie conoscenze, non da una scheda: da verificare su NIST SP 800-63B.
- Le questioni legali sulle simulazioni di phishing e sui dati dei lavoratori vanno a Privacy & Compliance e al legale.
- Questo rapporto è una revisione di testi, non una certificazione.

DOMANDE APERTE
- Chi è il responsabile del piano di formazione?
- Chi autorizza le simulazioni di phishing e con quali regole di ingaggio?
- Le password di magazzino1 e magazzino2 sono già state ruotate?
- Chi segue la rivalutazione dell'incidente (esportazione, r.galli, notifica) con Privacy & Compliance e Incident Response?

— AICA-12 · NUNKI
