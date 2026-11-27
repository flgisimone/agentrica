AICA-12 · NUNKI — Senior Security Awareness Engineer, reparto AICA (AI Cybersecurity)

Esito: il compito è stato eseguito in sola lettura sulla copia `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/1b8e243c-033a-4357-b227-0a46d80b6791/scratchpad/ondata4/copie/aica-12-5` (file esaminati: `formazione/regole-personale.md`, `formazione/piano-formazione.md`, `incidente/rapporto.md`, e per i fatti `incidente/estratto-2026-11-21.log`). Non ho modificato nulla. Ho letto le schede della biblioteca con `npm run -s agent-text -- aica-12 --cards owasp-top-10-2025,nist-csf-2` (fonti verificate il 2026-11-19, da ricontrollare entro il 2027-05-19).

Attenzione: il rapporto sull'incidente contiene affermazioni smentite dal log. Sono rilievi P0 e vanno segnalati subito.

Nota sul modello: lavoro su Haiku, quindi per i rilievi P0 e P1 e per le conclusioni incerte propongo il riesame di AICA-01 · VEGA o di un revisore su Opus prima che diventino definitivi. Non ho caricato AICA-01 (in questa esecuzione non ho il tool agent) e non ho verificato le norme sulle fonti ufficiali: vedi limiti.

## Rilievi sull'incidente (`incidente/rapporto.md` confrontato con `incidente/estratto-2026-11-21.log`)

Orari: il log è in UTC (Z), il rapporto in UTC+1. Nel rapporto ho convertito i log in ora italiana.

1. **P0. Dati personali esfiltrati, non esclusi.** Rapporto r. 20 e r. 21: «nessun dato è uscito», «i clienti sono aziende, quindi non ci sono dati personali». Log r. 7 (08:58:32Z = 09:58 CET): `customers_export` da `m.verdi` dall'IP esterno 203.0.113.77, 1840 righe, con i campi `referente`, `email_referente`, `telefono_referente`. Il log non mostra che l'export sia partito dall'ufficio. I referenti sono persone fisiche, quindi sono dati personali. Testo proposto per r. 20-21: «L'attaccante ha esportato 1840 righe del catalogo clienti, con nome, email e telefono dei referenti (persone fisiche). L'export è avvenuto dall'IP esterno alle 09:58 CET, dopo il login anomalo delle 09:47.» Azione: attivare subito Privacy & Compliance (privacy-breach-response) per la valutazione della notifica al Garante (art. 33 GDPR, 72 ore dalla conoscenza: il termine è probabilmente già scaduto) e agli interessati (art. 34). Da verificare con l'agenzia privacy e con il DPO.

2. **P0. Un secondo account compromesso.** Rapporto r. 19: «Account coinvolti: solo quello di M. Verdi». Log r. 9-10 (09:20:44Z = 10:20 CET): login di `r.galli` (ruolo auditor) dallo stesso IP 203.0.113.77, poi `users_list` con 212 righe. Testo proposto per r. 19: «Account coinvolti: quello di M. Verdi e quello dell'auditor r.galli, usato dall'IP esterno per elencare 212 utenti.» Azione: reimpostare le credenziali di r.galli, verificare le sue sessioni e bloccare l'IP (decisioni all'amministratore, non a me).

3. **P0. Sessione dell'attaccante non revocata; incidente chiuso troppo presto.** Rapporto r. 12: «10:30 … l'attaccante è fuori». Log r. 12-13: reset della password alle 09:30:12Z (10:30 CET), poi `orders_list` dallo stesso IP alle 09:31:40Z (10:31 CET). La sessione esistente è rimasta valida dopo il reset. Rapporto r. 31: «Incidente chiuso il 21 novembre» è quindi prematuro. Testo proposto per r. 12: «Il reset alle 10:30 non ha revocato le sessioni attive: alle 10:31 l'IP esterno ha ancora letto gli ordini.» Azione: revocare tutte le sessioni e i token degli account coinvolti, verificare l'attività residua, riaprire l'incidente finché non è chiuso.

4. **P1. Cronologia incompleta.** Rapporto r. 9-11. Il primo segnale dell'IP esterno è alle 09:40 CET (log r. 2-4: tre `login_failed` da 203.0.113.77), non alle 10:12. Il login riuscito è alle 09:47 CET (log r. 5), l'export alle 09:58 (log r. 7). Il SIEM ha segnalato alle 10:05, sette minuti dopo l'export. Testo proposto: aggiungere le righe 09:40 (tentativi falliti), 09:47 (login riuscito), 09:58 (export di 1840 righe), 10:05 (alert SIEM).

5. **P1. Evidenze distrutte.** Rapporto r. 13: «cancellato l'archivio locale dei log». È in contrasto con la regola di preservazione delle evidenze durante un incidente, e l'azione è irreversibile. Ho visto solo un estratto di 13 righe. Azione: verificare subito se esistono copie integre (SIEM, log centralizzati, backup), documentare cosa è andato perso e non ricostruire più una macchina prima di aver preservato le evidenze.

6. **P2. Causa presentata come fatto.** Rapporto r. 18: «attacco a forza bruta sulla password, che era debole». Il log mostra tre tentativi falliti e poi un login riuscito (log r. 2-5). È compatibile con la forza bruta, ma non la dimostra: sono possibili anche credenziali esposte o riusate, o un phishing. Testo proposto: «Ipotesi: attacco a tentativi ripetuti sulla password; non verificato. Origine della credenziale da accertare.»

7. **P1. Azioni mancanti nel rapporto.** Revoca delle sessioni, blocco dell'IP, reset di r.galli, valutazione privacy, MFA per gli account che vedono dati clienti. Nel rapporto ci sono solo tre azioni fatte e una da fare, la promemoria. La regola sulla verifica in due passaggi (regole r. 5) rende facoltativa la MFA per operatori e revisori: è proprio la mancanza che ha permesso l'accesso.

## Regole per il personale (`formazione/regole-personale.md`)

Riferimenti: OWASP Top 10:2025, A07 (Authentication Failures) e A09 (Logging and Alerting Failures); NIST CSF 2.0, funzioni Govern, Respond e Recover. Le norme su password e GDPR non sono in biblioteca: vedi limiti.

8. **P0. Credenziali di account condivisi in WhatsApp.** Regola r. 3: «la password è nel gruppo WhatsApp «Magazzino»». È un'esposizione attiva di credenziali di accesso al portale, in un'app non aziendale, su account senza tracciabilità individuale. Il rilievo non richiede di leggere la password, che non è riportata qui. Testo proposto: «Non condividere la password. Ogni persona ha un account personale. Gli account condivisi si eliminano; fino ad allora la password è consegnata dal responsabile IT attraverso il gestore di password aziendale, mai in chat.» Azione immediata, da decidere con l'amministratore: cambiare la password di `magazzino1` e `magazzino2` se è nel gruppo.

9. **P1. Un link «lucchetto» è indicato come garanzia di autenticità.** Regola r. 7: «il lucchetto garantisce che il sito è quello vero». Il lucchetto indica solo una connessione cifrata. Anche i siti di phishing lo mostrano. Testo proposto: «Il lucchetto indica solo che la connessione è cifrata, non che il sito è quello vero. Prima di inserire la password controlla il nome esatto del dominio. Per accedere, usa sempre il segnalibro, non il link ricevuto per email.»

10. **P1. Verifica dell'IBAN con risposta alla stessa email.** Regola r. 9. È il caso tipico della frode sull'IBAN: la risposta può andare allo stesso indirizzo falsificato o compromesso. Testo proposto: «Verifica la richiesta telefonando al numero del fornitore già presente in anagrafica, mai rispondendo alla stessa email.»

11. **P1. Segnalazione «entro la fine della giornata».** Regola r. 10. Un ritardo di ore lascia l'attaccante libero di agire, come è accaduto il 21 novembre. Testo proposto: «Segnala subito, appena te ne accorgi, anche se non sei sicuro. Una segnalazione in buona fede non comporta sanzioni.»

12. **P1. Sanzione per chi clicca nelle simulazioni.** Regola r. 11: «viene segnalato al suo responsabile». È punitiva, e il ruolo prevede esercitazioni non punitive. Testo proposto: «Una simulazione non comporta sanzioni. Il risultato è usato in forma aggregata per migliorare la formazione.»

13. **P1. Regole mancanti.** Non c'è nulla su: esportazione e trattamento dei dati clienti (l'incidente è un export di 1840 righe); account condivisi come divieto esplicito; accessi sospetti, cioè cosa fare se si vede un accesso a un account che non si riconosce; revisori esterni, di cui le regole parlano ma il piano li esclude.

14. **P2. Password: composizione e scadenza.** Regola r. 1 (maiuscola, numero e simbolo) e r. 2 (cambio ogni 30 giorni). Le linee guida correnti (NIST SP 800-63B, versione 4, da verificare sulla fonte) sconsigliano regole di composizione e cambi periodici forzati, che portano a password prevedibili. Testo proposto: «La password è lunga almeno 15 caratteri (8 solo con verifica a due passaggi). Non si cambia a scadenza: si cambia subito se pensi che sia nota a qualcun altro. Usa un gestore di password.»

15. **P1. MFA facoltativa per operatori e revisori.** Regola r. 5. Vedi rilievo 7. Testo proposto: «La verifica in due passaggi è obbligatoria per tutti gli account che accedono al portale.» (OWASP A07:2025.)

16. **P2. SMS e divieto delle app di autenticazione.** Regola r. 6. L'SMS è il secondo fattore più debole. Il divieto di app sul telefono personale è una scelta da chiarire con l'IT. Testo proposto: «Preferisci un'app di autenticazione o una passkey, su un dispositivo aziendale o concordato con l'IT. L'SMS solo come ultima possibilità.»

17. **P3. Allegati.** Regola r. 8 vale solo per mittenti sconosciuti. Aggiungere: «Anche da un mittente noto, se l'allegato è inatteso, verifica prima con una telefonata.»

18. **P3. Password su carta.** Regola r. 4: aggiungere «o in un gestore di password».

Nessun rilievo sulla regola r. 12 (blocco del computer con Windows + L) e sulla r. 13 (chiavette USB da consegnare all'IT).

19. **P2. Intestazione.** «Versione del 22 novembre 2026, dopo l'incidente»: la revisione non ha recepito le lezioni dell'incidente (password, account condivisi, MFA, sanzioni). Va riaperta.

## Rilievi sul piano (`formazione/piano-formazione.md`)

20. **P1. Pubblicazione dei nomi di chi clicca.** Riga 7: «i nomi di chi clicca si pubblicano nella bacheca interna». Dati personali dei dipendenti esposti a tutti, con effetto punitivo. Testo proposto per la misura: «Esiti solo aggregati per gruppo, senza nomi. Nessuna pubblicazione individuale.» Coinvolgere Privacy & Compliance.

21. **P1. Simulazioni di phishing senza autorizzazione.** Riga 7. Le regole del reparto vietano le simulazioni di phishing senza autorizzazione scritta e regole di ingaggio. Il piano non le prevede. Testo proposto: «Simulazioni solo con autorizzazione scritta del responsabile della sicurezza e regole di ingaggio approvate prima dell'avvio.»

22. **P1. Contenuti mancanti.** Il ruolo prevede materiali su MFA, gestione dei dati, social engineering e segnalazione degli incidenti. Il piano ha solo lettura delle regole, un corso di un'ora e la simulazione. Proposta minima: modulo MFA e gestore di password; modulo su frodi con l'IBAN e pretesti telefonici; modulo su esportazione e gestione dei dati clienti; esercitazione di segnalazione immediata.

23. **P1. Tempi.** Nessuna attività prima di gennaio 2027, mentre la promemoria del 21 novembre risulta «da fare» e le regole hanno ancora i punti 3, 7 e 9. Proposta: una comunicazione immediata con regole corrette, prima del piano.

24. **P2. Obiettivo «zero clic».** Riga 9. Non è un obiettivo raggiungibile e spinge a nascondere i clic. Misure migliori: tasso di clic in calo nel tempo, tasso di segnalazione e tempo medio di segnalazione, tutti aggregati.

25. **P2. Revisori esclusi.** Riga 11 esclude gli `auditor` perché non dipendenti, ma la regola r. 3 del piano («tutti») e le regole li includono. Il loro account è stato usato nell'incidente (rilievo 2). Proposta: briefing obbligatorio per i revisori, con MFA, come obbligo contrattuale.

## Domande aperte per il responsabile umano

- Le password di `magazzino1` e `magazzino2` sono nel gruppo WhatsApp adesso? Da quando?
- Esistono copie dei log cancellati alle 10:40 (SIEM, archivio centrale)?
- r.galli: il suo account è stato reimpostato? L'IP 203.0.113.77 è bloccato?
- Chi è il responsabile per la valutazione della notifica al Garante e agli interessati?
- Perché gli operatori e i revisori non hanno MFA, se il portale tratta dati dei clienti?

## Limiti

- Ho verificato solo l'estratto di 13 righe del log, non l'intero archivio. Il log non dice da dove sia partito l'export a meno dell'IP: ho usato l'IP 203.0.113.77 come origine, come appare nel log.
- Non ho verificato sulle fonti ufficiali le norme citate (NIST SP 800-63B-4, art. 33 e 34 GDPR, termine delle 72 ore). Sono da confermare con l'agenzia privacy e con la fonte.
- Ho letto solo i tre file indicati e il log. Non ho esaminato gli altri file del progetto (infra, app, iam, logging), che non rientravano nel compito.
- Queste analisi non sono una certificazione e non sostituiscono il responsabile IT, il DPO o il legale.

Firmato: AICA-12 · NUNKI
