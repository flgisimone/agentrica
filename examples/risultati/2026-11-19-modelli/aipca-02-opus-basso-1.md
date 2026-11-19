# Valutazione GDPR del servizio prenotazioni-palestra

Ruolo: Senior GDPR & Data Protection Specialist (AIPCA). Ho letto tutto il codice: `server.js`, `public/index.html`, `public/grazie.html`, `README.md` e `package.json`. Non ho modificato nessun file. Le correzioni qui sotto sono proposte: le attua la Software Agency dopo la tua approvazione. Questo rapporto non dichiara il servizio conforme o non conforme. Le valutazioni giuridiche finali spettano a te o al tuo consulente.

**Segnalazione immediata, P0.** Il modulo raccoglie dati sulla salute (art. 9) senza alcuna base documentata. Li salva in chiaro e li scrive anche nei log. Vedi R1 e R4.

## Data mapping

| Voce | Situazione rilevata |
|---|---|
| Trattamento | Prenotazione di una lezione di prova, più marketing (newsletter) e statistiche |
| Interessati | Chi prenota, compresi possibili minori (si raccoglie la data di nascita ma l'età non viene controllata) |
| Dati comuni | corso, data, nome, email, telefono, codice fiscale, data di nascita (`server.js:18-29`) |
| Dati particolari | `health`: patologie, infortuni e farmaci (art. 9) (`index.html:25-28`, `server.js:26`) |
| Base giuridica dichiarata | Nessuna: non ci sono informativa né consensi |
| Destinatari | La reception (README:11), il servizio di statistiche `stats.example.com` (`server.js:8,34-38`), i log del server (`server.js:32`) |
| Conservazione | Nessun limite: il README dice «restano nel file» (README:11) |
| Trasferimenti | Il fornitore delle statistiche è sconosciuto, quindi non si sa se i dati escono dallo SEE |
| Misure | Nessuna: file JSONL in chiaro, nessun controllo degli accessi e nessuna validazione dei dati |

## Rilievi

### R1 – Dati sulla salute senza base giuridica ex art. 9 e senza necessità dimostrata
- **Area:** basi giuridiche. **Stato:** aperto. **Gravità:** critica. **Rischio:** alto. **Priorità:** P0
- **Riferimenti:** GDPR art. 9(1)-(2), art. 5(1)(a)(c), art. 35
- **Evidenze:** `public/index.html:25-28` (campo «Patologie, infortuni o farmaci»); `server.js:26` (il campo viene salvato); `server.js:31` (finisce nel file)
- **Lacune:** non c'è un consenso esplicito separato né un'altra condizione dell'art. 9(2). Non è dimostrato che il dato serva per una lezione di prova. Non c'è uno screening DPIA.
- **Raccomandazione:** togliere il campo dal modulo online. Le informazioni utili si chiedono a voce all'istruttore o con un modulo dedicato. Se il campo resta, serve un consenso esplicito separato e facoltativo, con testo informativo, una conservazione breve, l'accesso riservato all'istruttore e uno screening DPIA.
- **Responsabile suggerito:** titolare (palestra), poi la Software Agency. **Verifica:** il campo è assente, oppure il consenso è registrato e l'accesso è ristretto.

### R2 – Dati eccedenti: codice fiscale e data di nascita
- **Area:** minimizzazione. **Stato:** aperto. **Gravità:** alta. **Rischio:** medio. **Priorità:** P1
- **Riferimenti:** art. 5(1)(c), art. 25(2)
- **Evidenze:** `index.html:23-24` (entrambi i campi sono `required`); `server.js:24-25`
- **Lacune:** per una lezione di prova non c'è una finalità che giustifichi il codice fiscale. La data di nascita viene raccolta ma non usata, nemmeno per verificare l'età.
- **Raccomandazione:** eliminare il codice fiscale. Al posto della data di nascita basta un'autodichiarazione di maggiore età, con un percorso a parte per i minori (consenso del genitore). Valutare anche se il telefono debba essere facoltativo.
- **Responsabile suggerito:** Software Agency. **Verifica:** il modulo e l'oggetto `booking` contengono solo i campi necessari.

### R3 – Newsletter preselezionata e consenso di fatto sempre attivo
- **Area:** consenso / marketing. **Stato:** aperto. **Gravità:** alta. **Rischio:** alto. **Priorità:** P1
- **Riferimenti:** art. 4(11), art. 6(1)(a), art. 7(1)-(4), art. 25(2), art. 21(2)-(3); art. 130 del Codice privacy / ePrivacy
- **Evidenze:**
  - `index.html:30`: la casella è già spuntata (`checked`).
  - `server.js:27`: `newsletter: form.newsletter !== "no"`. Una casella non spuntata non viene inviata dal browser, quindi il valore è `undefined` e il risultato è sempre `true`. Chi toglie la spunta viene comunque registrato come consenziente.
- **Lacune:** il consenso non è libero né inequivocabile, e non è documentato (mancano testo, versione e data, art. 7(1)). Non c'è un modo per revocarlo.
- **Raccomandazione:** casella non spuntata e `newsletter: form.newsletter === "si"`. Registrare la versione del testo e la data del consenso. Mettere un link di disiscrizione in ogni invio.
- **Responsabile suggerito:** Software Agency. **Verifica:** un test conferma che senza spunta si registra `false`.

### R4 – Dati personali e dati sulla salute scritti nei log
- **Area:** sicurezza / minimizzazione. **Stato:** aperto. **Gravità:** alta. **Rischio:** alto. **Priorità:** P1
- **Riferimenti:** art. 5(1)(c)(f), art. 32
- **Evidenze:** `server.js:32`: `console.log("nuova prenotazione", booking)` scrive l'intero record, salute compresa.
- **Lacune:** i log hanno destinatari e una conservazione che nessuno controlla.
- **Raccomandazione:** registrare solo l'evento, senza dati personali (per esempio il corso e la data).
- **Responsabile suggerito:** Software Agency. **Verifica:** nei log non compaiono dati personali.

### R5 – Email inviata a un servizio di statistiche esterno
- **Area:** destinatari / fornitori. **Stato:** aperto. **Gravità:** alta. **Rischio:** medio-alto. **Priorità:** P1
- **Riferimenti:** art. 5(1)(b)(c), art. 6, art. 13(1)(e)-(f), art. 28, artt. 44-49
- **Evidenze:** `server.js:8` e `server.js:34-38`: l'email viene inviata a `stats.example.com`. In README:10 il servizio è descritto come «servizio di statistiche della palestra».
- **Lacune:** per fare statistiche l'email non serve. Non risultano un accordo art. 28, l'indicazione del fornitore, la sua sede o i trasferimenti, né un'informativa.
- **Raccomandazione:** togliere l'email dall'evento e mandare solo dati aggregati o anonimi (il corso). Identificare il fornitore e firmare il DPA. Verificare i trasferimenti fuori dallo SEE (privacy-vendor-compliance).
- **Responsabile suggerito:** titolare e Software Agency. **Verifica:** il payload non contiene identificativi e il DPA è agli atti.

### R6 – Nessuna informativa
- **Area:** trasparenza. **Stato:** aperto. **Gravità:** alta. **Rischio:** medio. **Priorità:** P1
- **Riferimenti:** artt. 12-13
- **Evidenze:** `public/index.html` (intero modulo) e `public/grazie.html` non contengono un'informativa né un link a una.
- **Lacune:** mancano titolare, finalità, basi giuridiche, destinatari, conservazione e diritti.
- **Raccomandazione:** mettere un'informativa breve nel modulo, con un link a quella completa (da far revisionare dal privacy-legal-specialist).
- **Responsabile suggerito:** titolare. **Verifica:** l'informativa è presente prima dell'invio.

### R7 – Conservazione illimitata e nessun processo per i diritti degli interessati
- **Area:** conservazione / diritti. **Stato:** aperto. **Gravità:** media. **Rischio:** medio. **Priorità:** P2
- **Riferimenti:** art. 5(1)(e), artt. 15-22
- **Evidenze:** `server.js:31` aggiunge righe a `prenotazioni.jsonl` senza mai cancellarle; README:11 («restano nel file»).
- **Lacune:** non ci sono tempi di conservazione né una procedura per accesso, cancellazione o opposizione.
- **Raccomandazione:** fissare un termine, per esempio cancellare dopo la lezione o dopo N giorni se la persona non si iscrive. Prevedere una procedura per le richieste degli interessati, con un contatto indicato nell'informativa.
- **Responsabile suggerito:** titolare e Software Agency. **Verifica:** la regola di conservazione è documentata e applicata.

### R8 – Misure di sicurezza insufficienti
- **Area:** sicurezza. **Stato:** aperto. **Gravità:** media (alta finché il campo salute resta). **Rischio:** medio. **Priorità:** P2
- **Riferimenti:** art. 32, art. 25(1)
- **Evidenze:** `server.js:7,31`: i dati sono in un file in chiaro nella cartella dell'applicazione, senza permessi dedicati. `server.js:10-29`: l'input non viene validato e non ci sono limiti di dimensione. Il server è solo HTTP (`server.js:44`). Non risulta un TLS davanti al server.
- **Raccomandazione:** HTTPS (anche tramite un proxy), file fuori dalla cartella dell'applicazione con permessi ristretti, cifratura se restano dati sensibili, validazione dei campi e limite alla dimensione del body. Da approfondire con privacy-security-engineer.
- **Responsabile suggerito:** Software Agency. **Verifica:** revisione della configurazione.

### R9 – Accountability: manca il registro dei trattamenti
- **Area:** accountability. **Stato:** aperto. **Gravità:** media. **Rischio:** basso-medio. **Priorità:** P2
- **Riferimenti:** art. 5(2), art. 24, art. 30 (l'esenzione del paragrafo 5 non si applica se si trattano dati dell'art. 9)
- **Evidenze:** nel repository non c'è documentazione privacy.
- **Raccomandazione:** compilare la voce del registro partendo dal data mapping qui sopra.
- **Responsabile suggerito:** titolare. **Verifica:** la voce del registro esiste.

## Checklist sintetica

- [ ] Liceità e base giuridica documentate (art. 6): **no**
- [ ] Condizione art. 9 per i dati sulla salute: **no**
- [ ] Minimizzazione (art. 5(1)(c)): **no** (codice fiscale, data di nascita, email inviata alle statistiche, log)
- [ ] Consenso marketing valido (art. 7): **no** (casella preselezionata e bug a `server.js:27`)
- [ ] Informativa (art. 13): **no**
- [ ] Conservazione definita (art. 5(1)(e)): **no**
- [ ] Processo per i diritti (artt. 15-22): **no**
- [ ] Fornitore con DPA (art. 28) e trasferimenti verificati: **non documentato**
- [ ] Registro (art. 30): **no**
- [ ] Screening DPIA (art. 35): **da fare** se il campo salute resta

## Prossimi passi proposti

1. Decidere subito su R1: eliminare il campo salute (consigliato) oppure tenerlo con consenso esplicito e screening DPIA. Nel frattempo, valutare se bloccare il modulo e come trattare i dati già salvati in `prenotazioni.jsonl` e nei log.
2. Correzioni rapide al codice, da far fare alla Software Agency dopo la tua approvazione: R3 (casella e bug), R4 (log), R5 (payload delle statistiche), R2 (campi eccedenti).
3. Documenti a carico del titolare: informativa (R6), conservazione (R7), DPA del fornitore (R5) e registro (R9).
