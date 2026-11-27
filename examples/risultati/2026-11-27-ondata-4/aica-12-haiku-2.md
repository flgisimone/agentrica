AICA-12 · NUNKI — Senior Security Awareness Engineer, reparto AICA (AI Cybersecurity)

Prova in sola lettura su /private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/1b8e243c-033a-4357-b227-0a46d80b6791/scratchpad/ondata4/copie/aica-12-4. Letti: formazione/regole-personale.md, formazione/piano-formazione.md, incidente/rapporto.md, incidente/estratto-2026-11-21.log, README.md. Non ho letto altri file del progetto. Non ho modificato nulla e non ho scritto file.

Limiti: non ho potuto caricare AICA-01 (il tool agent non è disponibile qui) e non ho accesso al web. Sono un modello Haiku: i rilievi P0 e P1 e le conclusioni giuridiche sotto vanno riesaminati dal direttore AICA-01 o da un revisore su Opus prima di diventare definitivi. Le conclusioni sulla normativa privacy (GDPR, Garante, art. 4 Statuto dei lavoratori) sono da confermare con Privacy & Compliance.

SEGNALAZIONE P0 (da comunicare subito, prima del resto)
Il rapporto del 21 novembre dichiara l'incidente chiuso, senza dati usciti e senza obblighi di notifica. Il log contraddice queste conclusioni (vedi tabella). Dal log risulta un accesso esterno che potrebbe essere ancora attivo dopo il reset, un secondo account (auditor) usato dallo stesso IP dell'attaccante, un'esportazione di 1840 righe con contatti di persone fisiche. Se la violazione è notificabile, il termine di 72 ore decorreva dalla conoscenza del 21 novembre: alla data di oggi (27 novembre) risulta già scaduto. Va valutato subito con il responsabile IT, il DPO o Privacy & Compliance (privacy-breach-response). Non considerare chiuso l'incidente.

1. Rapporto incidente: contraddizioni con il log (fatti dal log, orari convertiti da UTC a ora italiana UTC+1)
- incidente/rapporto.md riga 11, «Primo accesso anomalo 10:12». Il log mostra tre login_failed da 203.0.113.77 alle 09:40 (riga 2-4 del log, 08:40Z), poi login_ok alle 09:47 (riga 5, 08:47:15Z) e orders_list alle 09:49. Il 10:12 è il secondo accesso (riga 8).
- rapporto riga 20, «esportazione delle 09:58 l'ha fatta M. Verdi dall'ufficio». Il log riga 7 (08:58:32Z) è customers_export dall'IP esterno 203.0.113.77, 1840 righe, con campi email_referente, telefono_referente, indirizzo, fido. Il login dall'ufficio è 192.0.2.14 alle 09:31 (riga 1).
- rapporto riga 18 e 19, «Account coinvolti: solo quello di M. Verdi». Il log riga 9-10 (09:20Z, 10:20 IT) mostra login_ok dell'auditor r.galli dallo stesso IP esterno e users_list con 212 righe. Non è stato verificato se è un uso legittimo.
- rapporto riga 12, «10:30 l'attaccante è fuori». Il log riga 13 (09:31:40Z, 10:31 IT) mostra orders_list di m.verdi dall'IP esterno, dopo il password_reset_admin della riga 12. Sessioni o token non revocati, oppure accesso ancora attivo: da verificare.
- rapporto riga 20, «l'attaccante ha visto solo l'elenco degli ordini». Il log mostra l'esportazione clienti e la lista utenti (vedi sopra). Va verificato se i file sono stati scaricati.
- rapporto riga 21, «clienti aziende, quindi non ci sono dati personali». I campi email_referente e telefono_referente sono contatti di persone fisiche: dati personali ai sensi del GDPR. La valutazione sugli obblighi va rifatta.
- rapporto riga 13, «cancellato l'archivio locale dei log» alle 10:40, prima dell'analisi. Il rapporto cita la regola di preservare le evidenze e il requisito di 90 giorni del README: il rapporto fa il contrario. Il log allegato è solo un estratto di 13 righe.
- rapporto riga 18, causa «forza bruta sulla password, debole»: il log (tre fallimenti, poi successo) è coerente con l'ipotesi, ma non è verificata. Nessuna verifica in due passaggi: è la misura che avrebbe fermato l'accesso (vedi regola 5).
- rapporto riga 29-31, «Incidente chiuso» con un'azione ancora da fare (riga 27). Nota minore: nel log la riga SIEM delle 09:05Z compare dopo la riga delle 09:21Z; verificare la fonte dell'estratto.

2. Regole per il personale (formazione/regole-personale.md)
Per ogni rilievo: riga, problema, gravità, testo proposto. I testi proposti sono bozze da confermare con l'utente.
- Riga 3, regole datate ma contrattuali: la versione è stata scritta il 22 novembre, dopo l'incidente, e conserva le pratiche che l'hanno reso possibile. P1 (complessivo).
- Riga 3 (ruoli): le regole valgono per operatori, amministrazione e revisori, ma non per i clienti del portale (ruolo customer nel README): gap da decidere. P2.
- Riga 7 (lucchetto): «il lucchetto garantisce che il sito è quello vero» è falso. Il lucchetto indica solo una connessione cifrata con un certificato valido; anche i siti di phishing possono averlo. P1. Proposta: «Prima di inserire la password, controlla che l'indirizzo sia esattamente quello del portale (da indicare), digitato da te o dai preferiti, non dal link ricevuto via email. Il lucchetto indica solo una connessione cifrata, non che il sito sia autentico.»
- Riga 9 (IBAN): rispondere alla stessa email può finire nella casella dell'attaccante o a un indirizzo falsificato (business email compromise). P1. Proposta: «Per un cambio di IBAN, chiama il fornitore al numero già in archivio, non quello nell'email, e conferma prima di cambiare i dati.»
- Riga 10 (segnalazioni): «entro la fine della giornata» è troppo tardi; manca il canale diverso dall'email. P1. Proposta: «Segnala subito, appena te ne accorgi, anche se non sei sicuro, al canale [da indicare: telefono o ticket IT]. Se hai inserito la password, cambiala subito.»
- Riga 11 (simulazioni): «chi clicca viene segnalato al suo responsabile» è punitivo e contrario al ruolo di Awareness (esercitazioni non punitive). Insieme alla bacheca nominativa del piano è anche un trattamento di dati personali dei dipendenti: P1, da far vedere a Privacy & Compliance. Proposta: eliminare; sostituire con «chi segnala un tentativo riceve un riconoscimento; i risultati sono usati solo in forma aggregata».
- Riga 5 e 6 (verifica in due passaggi): solo obbligatoria per gli amministratori, consigliata per operatori e revisori. Sono gli account con accesso ai dati dei clienti: l'incidente è avvenuto su un operatore senza MFA. P1. Proposta: «La verifica in due passaggi è obbligatoria per tutti gli account del portale, compresi operatori e revisori esterni.»
- Riga 6 (SMS e app): il codice via SMS è un ripiego debole; il divieto di app sul telefono personale ostacola l'MFA senza offrire un'alternativa. P2. Proposta: «Usa un'app di autenticazione o una chiave di sicurezza; l'SMS è solo ripiego. IT indica come attivarle sul telefono di lavoro.» (da confermare)
- Riga 1 (password): la composizione obbligatoria (maiuscola, numero, simbolo) con soli 8 caratteri è da rivedere. P2. Proposta: lunghezza di almeno 15 caratteri o una frase di parole, non obbligo di simboli, e blocco delle password già violate o comuni. Soglia da verificare su NIST SP 800-63B (non in biblioteca, da ricontrollare).
- Riga 2 (scadenza ogni 30 giorni): la scadenza periodica favorisce password prevedibili; il cambio va fatto su sospetto di compromissione. P2. Proposta: «Non serve cambiarla a scadenza: cambiala subito se pensi che sia nota ad altri o se compare in una violazione.»
- Riga 3 (account condivisi): password di magazzino1 e magazzino2 nel gruppo WhatsApp. È la regola più pericolosa: credenziali in un'app di messaggi e nessuna responsabilità individuale nei log. P1. Proposta: «Ogni persona usa il suo account personale. Non condividere e non scrivere password in chat o gruppi. Se un account condiviso è inevitabile, IT lo custodisce in un gestore di password.»
- Riga 4 (foglio sul monitor): corretta, ma non dice dove conservarle. P3. Proposta: aggiungere «usa il gestore di password aziendale».
- Riga 8 (allegati): regola limitata ai mittenti sconosciuti. P3. Aggiungere: «anche da mittenti noti, se l'allegato è inatteso».
- Riga 13 (chiavette USB): corretta. Nessuna modifica.
- Riga 12 (Windows + L): corretta per Windows; se ci sono Mac, aggiungere la combinazione. P3.

Mancano nelle regole (proposte, P2):
- «Se noti accessi o attività che non riconosci sul tuo account, segnalalo subito e cambia la password.»
- «Non esportare elenchi di clienti o referenti se non serve; non inviarli a indirizzi personali.» (l'incidente riguarda un'esportazione.)
- «Se il portale ti chiede di accedere da un luogo o da un dispositivo non tuo, non accettare e segnalalo.»

3. Piano di formazione (formazione/piano-formazione.md)
- Riga 7 (simulazione di phishing): i nomi di chi clicca in bacheca interna sono un trattamento di dati personali e una gogna pubblica: P1. Proposta: eliminare i nomi; i dati solo in forma aggregata.
- Riga 7 (simulazioni in generale): le simulazioni di phishing richiedono autorizzazione scritta e regole di ingaggio per la nostra regola obbligatoria, e la base giuridica va verificata con Privacy & Compliance. Nessuna autorizzazione risulta nel progetto. P1 di processo.
- Riga 9 (obiettivo «zero clic»): irrealistico e incentiva a nascondere i clic; la misura dovrebbe essere la quota di segnalazioni rapide. P2. Proposta: «Obiettivo 2027: almeno il [X]% delle persone segnala entro un'ora un messaggio sospetto (dato aggregato).»
- Riga 11 (esclusione dei revisori): i revisori esterni hanno account con lista utenti e sono coinvolti nell'incidente. Escluderli dalla formazione lascia scoperto un gruppo con accesso. P1. Proposta: includerli, o imporre per contratto gli stessi requisiti di account (MFA, password) e una breve formazione.
- Clienti: il piano non li copre, mentre usano il portale per ordini e documenti. P2, da decidere con l'utente.
- Contenuti mancanti: MFA, gestore di password, account condivisi, canale di segnalazione. Il rapporto indica come causa una password debole e il piano lavora solo sul phishing. P2.
- Righe 5 e 6 («lettura delle regole con firma», «corso di un'ora»): firmare le regole attuali è inopportuno, perché contengono i rilievi sopra. P1. Proposta: rifare le regole prima della firma di gennaio.
- Riga 1 (tutti): «tutti» è ambiguo: va specificato chi firma e chi segue il corso. P3.

4. Domande aperte (per l'utente o il responsabile umano)
- Qual è il dominio reale del portale e il canale di segnalazione (telefono o ticket)? L'indirizzo it@ferramentanord.example è un segnaposto del progetto di prova.
- Il file dell'esportazione clienti del 21 novembre è stato scaricato? Da chi?
- Le sessioni dell'account m.verdi sono state revocate dopo il reset? L'accesso di r.galli dall'IP esterno è legittimo?
- Chi è il responsabile dell'incidente e della formazione (ruolo Govern del CSF 2.0)? Chi autorizza le simulazioni di phishing?
- I clienti del portale sono nel perimetro della formazione?
- Esistono copie dei log cancellati alle 10:40 (SIEM a 30 giorni, backup)?

Biblioteca consultata: owasp-top-10-2025 (A01, A07, A09, A10 rilevanti: accesso e log) e nist-csf-2 (Govern: ruoli e responsabilità mancanti; Respond e Recover: evidenze cancellate). Versione e data: OWASP Top 10:2025 e NIST CSF 2.0, verificate il 2026-11-19. Le soglie password e le norme privacy non sono in biblioteca: da verificare sulla fonte ufficiale prima di usarle.

Firmato: AICA-12 · NUNKI.
