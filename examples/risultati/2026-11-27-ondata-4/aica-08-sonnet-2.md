AICA-08 · ELNATH — Senior Incident Response & Forensics Specialist, reparto AICA (AI Cybersecurity)

# Rapporto per AICA-01 · VEGA

Revisione dell'incidente del 21 novembre 2026, in sola lettura, nella cartella `ondata4/copie/aica-08-2`.

Non ho caricato AICA-01 con `agent`: il server MCP non c'è. Ho letto le schede `cvss-4` e `nist-csf-2` con `npm run -s agent-text`; entrambe sono verificate il 2026-11-19. Il CVSS non serve a questo compito e non ho assegnato punteggi. Il CSF 2.0 ha le funzioni Govern, Identify, Protect, Detect, Respond, Recover.

## Sintesi

Il rapporto preliminare non regge sul log.
- Gli orari della cronologia sono sbagliati.
- Gli account compromessi sono due, non uno.
- L'esportazione dei dati l'ha fatta l'attaccante, non M. Verdi.
- Il contenimento non era riuscito, e la VM è stata ricreata senza raccogliere prove.
- L'archivio dei log è stato cancellato.
- La causa indicata non è provata.
- L'esclusione degli obblighi di notifica non è fondata.
- L'incidente è stato chiuso con questioni aperte.

Segnalo subito un rilievo P0 e quattro P1.

## Perimetro e metodo

File esaminati: `incidente/rapporto.md`, `incidente/estratto-2026-11-21.log`, `README.md`, `iam/roles.yaml`. Non ho fatto verifiche attive, né letto altri file del progetto, né toccato nulla. I numeri di riga del log sono quelli dell'estratto.

Il log è in UTC e il rapporto in ora italiana (UTC+1). Il login di Verdi alle 09:31 locale coincide con la riga 1 (08:31Z), quindi la conversione è corretta. L'IP del client è affidabile: il README dice che il bilanciatore non termina TLS e che nginx vede l'IP della connessione. Quindi `203.0.113.77` è l'IP reale dell'attore.

## Rilievi

### 1. Cronologia

**P1. Gli orari dell'attacco sono sbagliati.**
- Rapporto, cronologia, riga delle 10:12: «Primo accesso anomalo ... 10:12».
- Log righe 2-5: i primi tentativi falliti da `203.0.113.77` sono alle 08:40:11Z (09:40 locale). L'accesso riuscito è alle 08:47:15Z (09:47 locale).
- Le 10:12 locali sono la riga 8, cioè il secondo login dell'attaccante, 25 minuti dopo il primo.
- Azione: correggere la cronologia così:
  - 09:40 primi tentativi falliti.
  - 09:47 accesso riuscito.
  - 09:49 elenco di 500 ordini.
  - 09:58 esportazione dei clienti.
  - 10:05 allarme del SIEM.
  - 10:12 secondo login.
  - 10:20 accesso come `r.galli`.
  - 10:21 elenco di 212 utenti.
  - 10:30 reset della password.
  - 10:31 attività dell'attaccante dopo il reset.
- L'attaccante è rimasto dentro almeno 44 minuti. L'allarme è arrivato 7 minuti dopo l'esportazione (08:58:32Z contro 09:05:00Z).

**P3. Evento fuori sequenza nel log.** L'allarme del SIEM (riga 11, 09:05:00Z) compare dopo eventi delle 09:21Z. L'estratto non è ordinato per tempo. Azione: ordinare l'estratto e annotare fonte e ordine di ingestione. Chiedere al SIEM l'ora di generazione e l'ora di ricezione dell'allarme.

### 2. Perimetro (account e dati)

**P0. Secondo account compromesso e non contenuto.**
- Rapporto, «Account coinvolti: solo quello di M. Verdi».
- Log righe 9-10: `r.galli` (ruolo auditor) accede dallo stesso IP dell'attaccante (203.0.113.77) alle 09:20:44Z e legge `users_list` con 212 righe. Nelle azioni del rapporto non c'è nessun intervento su questo account.
- Non so se l'attaccante sia ancora dentro: il rapporto è del 21 e oggi è il 27.
- Azione immediata, da approvare dal responsabile IT:
  - Reimpostare la password di `r.galli` e revocarne le sessioni.
  - Verificare con l'utente se l'account è davvero suo.
  - Cercare l'IP `203.0.113.77` in tutti i log disponibili, anche prima del 21.
  - Controllare i log dei giorni successivi per attività residue.

**P1. L'esportazione è dell'attaccante, non di Verdi.**
- Rapporto: «l'esportazione delle 09:58 l'ha fatta M. Verdi dall'ufficio ... nessun dato è uscito».
- Log riga 7: `customers_export`, 1840 righe, alle 08:58:32Z (09:58 locale), con `client_ip` `203.0.113.77`. Verdi era collegato dall'ufficio con `192.0.2.14` (riga 1).
- Il file ha ragione sociale, referente, email, telefono, indirizzo e fido. Va trattato come uscito.
- Azione: correggere l'affermazione. Confermare con Verdi che non ha esportato nulla. Trattare come esfiltrati i 1840 record (riga 7) e i 212 utenti (riga 10).

**P1. Sessioni dell'attaccante ancora attive dopo il reset.**
- Rapporto, riga delle 10:30: «l'attaccante è fuori».
- Log riga 12: reset alle 09:30:12Z (10:30 locale) fatto da `admin.ferri` da `10.8.0.5`, cioè dalla VPN, come da README.
- Log riga 13: alle 09:31:40Z l'attaccante fa ancora `orders_list` come `m.verdi` da `203.0.113.77`. La sessione non era stata revocata.
- Azione: dopo un reset si invalidano tutte le sessioni e i token dell'utente. Registrare il momento reale della fine dell'accesso.

### 3. Contenimento

**P1. VM ricreata senza raccogliere prove e senza motivo di sicurezza.**
- Rapporto, riga delle 10:40: «Ricreata la VM dall'immagine pulita».
- Gli accessi dell'attaccante passano per credenziali valide dell'applicazione. Nell'estratto non c'è un'intrusione sul sistema operativo, quindi la ricreazione non risolve la causa: l'attaccante può rientrare con le stesse credenziali.
- Costa 45 minuti di indisponibilità (10:30-11:15).
- Ha distrutto lo stato della macchina (memoria, processi, file temporanei, file in `uploads`). Nel rapporto non c'è alcuna istantanea del disco prima della ricreazione.
- Azione: prima di distruggere una VM, istantanea di disco e volumi, esportazione dei log, registro delle azioni e approvazione del responsabile. Qui bastavano reset, revoca delle sessioni e blocco dell'IP.
- Domanda aperta: che cosa è stato fatto del volume `uploads` e del database, e quali dati sono stati ripristinati.

**P3. Mancano le azioni di contenimento minime.** Nel rapporto non c'è alcun blocco dell'IP `203.0.113.77` e non risulta un controllo degli altri account. Azione: aggiungerle al piano.

### 4. Conservazione delle prove

**P1. Cancellato l'archivio locale dei log.**
- Rapporto, riga delle 10:40: «cancellato l'archivio locale dei log, che occupava il disco, per ripartire puliti».
- README, sezione Log e monitoraggio: il requisito è di 90 giorni, il SIEM tiene gli eventi 30 giorni e l'archivio locale è il secondo livello. Cancellarlo ha tolto l'unica copia oltre i 30 giorni e distrutto prove di un incidente in corso.
- Conseguenza: non si può più cercare l'attaccante prima del 21 novembre, né stabilire da quando c'è l'accesso ai due account, né dimostrare quali dati sono usciti.
- Azione:
  - Registrare la perdita come evento dell'incidente.
  - Recuperare quanto esiste (SIEM, backup, copie, bilanciatore, provider).
  - Chiedere al SIEM di bloccare la conservazione degli eventi dell'incidente.
  - Aprire una voce di registro delle evidenze con hash e catena di custodia.
  - Aggiungere ai playbook: mai cancellare log durante un incidente; se manca spazio, spostarli su un volume esterno.

**P2. Evidenze non registrate.** Non risulta un registro delle evidenze, né un hash dell'estratto, né chi lo ha estratto e quando. L'estratto ha solo 13 righe. Azione: registrare fonte, query, orario di estrazione e hash, e conservare la versione completa.

### 5. Causa

**P2. «Forza bruta su una password debole» non è provata.**
- Rapporto, riga «Causa».
- Log righe 2-5: 3 tentativi falliti in 52 secondi (08:40:11Z-08:41:02Z), poi un accesso riuscito alle 08:47Z, dopo altri 6 minuti. Non è un volume da forza bruta. Somiglia a credenziali già note all'attaccante (riuso, furto, phishing) con qualche errore di battitura.
- Lo stesso IP entra anche come `r.galli`, un utente diverso: indica più credenziali in mano all'attaccante, non una sola password debole. Il rapporto non cita alcuna prova sulla robustezza della password di Verdi.
- Tre fatti dal progetto aggravano la situazione:
  - `iam/roles.yaml` ha `mfa: false` per `operator` e `auditor`.
  - L'operatore può fare `customers:export` senza secondo fattore.
  - Il log non mostra blocchi o limiti di tentativi sull'IP.
- Azione: indicare la causa come ipotesi non verificata. Verificare riuso delle credenziali, phishing o malware sul dispositivo di Verdi e di Galli, altre fonti. Correzioni da proporre, con approvazione e rollback: MFA per i ruoli che esportano o leggono utenti, blocco o limite dei tentativi, allarme sugli accessi da IP esterno agli account operatore, verifica dell'esportazione fuori orario o fuori sede.

### 6. Obblighi

**P1. «Non ci sono dati personali né obblighi di notifica» non è fondato.**
- Rapporto, riga «Obblighi».
- I clienti sono aziende, ma l'esportazione (riga 7) include `referente`, `email_referente`, `telefono_referente`: dati di persone fisiche. L'elenco utenti (riga 10) è di 212 utenti, quindi persone con account. Sono coinvolti dati personali.
- Probabile violazione di riservatezza secondo il GDPR (art. 33 e 34), da valutare con il DPO o con la Privacy & Compliance Agency. La decisione resta al titolare e al DPO; la mia è un'indicazione, non una conclusione legale.
- Il termine di 72 ore dalla consapevolezza (allarme del 21 novembre alle 10:05) sarebbe scaduto il 24 novembre alle 10:05. Oggi è il 27, quindi siamo oltre. Se si notifica, va fatto subito con i motivi del ritardo (art. 33, par. 1).
- Anche senza notifica, serve una voce nel registro delle violazioni con la motivazione (art. 33, par. 5).
- Azione: passare subito la questione al DPO o al legale e alla Privacy & Compliance Agency. Valutare la comunicazione agli interessati se il rischio è alto (art. 34), le clausole contrattuali verso i clienti e i dati commerciali riservati (il fido).

**P2. L'incidente non va chiuso.** Rapporto, «Stato»: «chiuso il 21 novembre». Restano aperti causa, secondo account, notifica, perdita delle prove e il promemoria «da fare». Un rapporto preliminare delle 18:00 non può chiudere l'incidente. Azione: riaprirlo, aggiungere lezioni apprese e un responsabile per ogni azione.

**P3. Le azioni di rimedio sono insufficienti.** Il solo promemoria sulle password non risolve il problema (MFA, blocco, allarmi; vedi punto 5).

## Impatto

- Esfiltrazione probabile di 1840 record di clienti con contatti personali e fido.
- Lettura di 212 utenti.
- Due account compromessi, con possibile accesso residuo di `r.galli`.
- Perdita di prove e di capacità di stabilire l'inizio dell'attacco.
- Possibile ritardo di notifica, già oltre i termini.

## Rischio residuo e limiti

- Non so se l'accesso dell'attaccante sia ancora attivo né se ci siano altri account o dati toccati: l'estratto ha solo 13 righe.
- Non ho letto i log completi, il SIEM, `infra/` o `logging/`. Non ho verificato il contenuto delle esportazioni né la ricostruzione della VM.
- Il rilievo sulla causa è un'ipotesi, non un fatto.

## Nuova verifica

Dopo le correzioni: ricerca dell'IP e dei due utenti su tutti i log disponibili. Verifica di MFA e limiti di tentativi. Test che dopo un reset le sessioni non funzionino più. Revisione del registro delle evidenze e di quello delle violazioni.

## Domande aperte

1. `r.galli` è un account esterno reale, e ha reagito dopo il 21?
2. Quando è stato fatto il reset di `r.galli`, e le sessioni sono state revocate?
3. Esistono copie dell'archivio locale cancellato (backup, SIEM oltre i 30 giorni, provider)?
4. Chi è il DPO e il titolare, e la notifica al Garante è stata valutata?
5. Su quali evidenze si basa «password debole»?

## Raccomandazione

Lavoro su un modello piccolo (Sonnet). Per i rilievi P0 e P1, e per la lettura legale degli obblighi, propongo il riesame di AICA-01 o di un revisore su Opus prima che diventino definitivi. Il rilievo P0 va comunicato subito all'utente.

— AICA-08 · ELNATH
