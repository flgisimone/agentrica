AIPCA-02 · ALIOTH — Senior GDPR & Data Protection Specialist, reparto AIPCA (AI Privacy & Compliance)

# Valutazione GDPR — prenotazioni-palestra

**Perimetro.** Ho letto tutti e 5 i file del progetto: `README.md`, `package.json`, `server.js`, `public/index.html` e `public/grazie.html`. Ho lavorato in sola lettura: nessun file modificato, nessun dato trattato, nessuna chiamata a servizi esterni.

**Limiti.** Non ho trovato informativa, registro dei trattamenti, contratti con fornitori né documenti organizzativi. Non so se il servizio è in produzione né dove gira. Per questo diverse conclusioni sono `non_verificabile` e non `non_conforme`. Quello che segue è una valutazione di supporto, non un parere legale né una certificazione.

## Data mapping

| Trattamento | Interessati | Dati | Base giuridica dichiarata | Destinatari | Conservazione | Trasferimenti | Misure |
|---|---|---|---|---|---|---|---|
| T1 Prenotazione della lezione di prova | Potenziali clienti, forse anche minori | corso, data, nome, email, telefono, codice fiscale, data di nascita (`index.html:13-24`, `server.js:18-29`) | Nessuna dichiarata. Plausibile l'art. 6.1.b (misure precontrattuali) | Reception (`README.md:11`) | Nessun limite: file `prenotazioni.jsonl` in sola aggiunta (`server.js:7,31`) | Nessuno visibile | Nessuna visibile |
| T2 Dati sulla salute | Come T1 | testo libero su patologie, infortuni e farmaci (`index.html:26-27`, `server.js:26`) | Nessuna. Serve una condizione dell'art. 9.2 | Reception, e forse l'istruttore | Come T1 | Nessuno visibile | Nessuna. Il dato finisce anche nei log (`server.js:32`) |
| T3 Marketing e newsletter | Come T1 | flag `newsletter`, email | Consenso (implicito nell'etichetta di `index.html:31`) | Non indicati | Nessun limite | — | — |
| T4 Statistiche | Come T1 | corso ed email (`server.js:37`) | Nessuna | `stats.example.com`, terza parte (`server.js:8,34-38`) | Non nota | Non verificabile | Nessuna visibile |
| T5 Log applicativi | Come T1 | l'intero record, compresi salute e codice fiscale (`server.js:32`) | Nessuna | Chi accede ai log del processo o dell'hosting | Non nota | Non verificabile | Nessuna |

## Rilievi

Sono in ordine di priorità. Non ho classificato nulla come P0, perché non c'è evidenza che il servizio raccolga già dati reali. **Se è già in produzione, PRIV-01 e PRIV-02 vanno trattati come P0.**

**PRIV-01 · Dati sulla salute senza condizione art. 9 né salvaguardie**
- area: categorie particolari
- stato: `non_conforme`
- gravità: alta. Rischio: alto per gli interessati (discriminazione, divulgazione di dati sanitari).
- riferimenti: GDPR art. 9.1-9.2, art. 5.1.c, art. 25, art. 32, considerando 35
- evidenze:
  - `public/index.html:26-27`: campo libero «Patologie, infortuni o farmaci».
  - `server.js:26`: salvato in chiaro.
  - `server.js:31`: scritto in `prenotazioni.jsonl`.
  - `server.js:32`: stampato nella console con `console.log`.
- lacune:
  - Nessun consenso esplicito separato (art. 9.2.a) né altra condizione documentata.
  - Il testo libero porta a raccogliere più di quanto serve.
  - Niente cifratura, niente controllo degli accessi, niente limite di conservazione.
- raccomandazione:
  - Valutare se il dato serve davvero alla lezione di prova. Un'alternativa è una domanda sì/no («hai condizioni da segnalare all'istruttore?») e il colloquio di persona.
  - Se il dato resta: consenso esplicito e separato, campo facoltativo e strutturato, informativa specifica, accesso solo all'istruttore, cancellazione dopo la lezione.
  - Togliere il dato dai log in ogni caso.
- priorità: P1
- responsabile suggerito: titolare (la palestra) con il DPO o il consulente; attuazione della Software Agency
- verifica: rileggere form e server; verificare che il dato non compaia nei log; esempio di consenso registrato.

**PRIV-02 · Consenso alla newsletter preselezionato e di fatto sempre «sì»**
- area: consenso e marketing
- stato: `non_conforme`
- gravità: alta. Rischio: marketing senza consenso valido, con possibili reclami al Garante.
- riferimenti: GDPR art. 4.11, art. 6.1.a, art. 7.1-7.4, considerando 32 (le caselle preselezionate non valgono come consenso, CGUE C-673/17 Planet49); art. 130 del Codice privacy (d.lgs. 196/2003); Linee guida EDPB 05/2020
- evidenze:
  - `public/index.html:30`: checkbox con `checked`.
  - `server.js:27`: `newsletter: form.newsletter !== "no"`. Una checkbox deselezionata non viene inviata, quindi `undefined !== "no"` dà `true`. Il valore è **sempre true**, anche quando l'utente deseleziona la casella.
- lacune:
  - Consenso non libero né inequivocabile, e non dimostrabile (art. 7.1).
  - Nessuna modalità di revoca (art. 7.3).
  - Il consenso è legato alla prenotazione (art. 7.4).
- raccomandazione:
  - Casella non preselezionata.
  - Lato server, `newsletter: form.newsletter === "si"`.
  - Registrare data e testo del consenso.
  - Mettere un link di revoca in ogni comunicazione.
  - Trattare come non validi i consensi già raccolti.
- priorità: P1
- responsabile suggerito: Software Agency per il codice; titolare per i consensi pregressi
- verifica: inviare il form senza spunta e controllare che il record abbia `newsletter: false`.

**PRIV-03 · Codice fiscale e data di nascita non necessari**
- area: minimizzazione
- stato: `non_conforme`
- gravità: media
- riferimenti: GDPR art. 5.1.c, art. 25.2
- evidenze: `public/index.html:23-24` (entrambi `required`), `server.js:24-25`
- lacune: nessuna finalità documentata che giustifichi questi dati per una lezione di prova. Il telefono è obbligatorio (`index.html:22`) senza motivo indicato.
- raccomandazione:
  - Eliminare codice fiscale e data di nascita.
  - Se serve una verifica dell'età, basta una dichiarazione «ho almeno 18 anni» o la raccolta all'iscrizione vera e propria.
  - Rendere il telefono facoltativo, a meno che non serva per avvisi sulla lezione.
- priorità: P2
- responsabile suggerito: titolare; Software Agency
- verifica: rileggere il form e lo schema del record.

**PRIV-04 · Invio dell'email a un servizio statistico esterno senza base né accordo**
- area: destinatari e fornitori
- stato: `non_conforme` per la minimizzazione; `non_verificabile` per l'art. 28 e i trasferimenti
- gravità: media
- riferimenti: GDPR art. 5.1.b-c, art. 6, art. 13.1.e-f, art. 28, artt. 44-46
- evidenze: `server.js:8` (`https://stats.example.com/collect`); `server.js:34-38`, che invia `course` ed `email`
- lacune:
  - Per le statistiche l'email non serve.
  - Nessun DPA, nessuna indicazione del fornitore, della sua sede o di trasferimenti fuori dallo SEE.
  - Gli interessati non ne vengono informati.
- raccomandazione:
  - Inviare solo dati aggregati o non identificativi (ad esempio solo `course`), oppure contare le prenotazioni in locale.
  - Se resta un fornitore: accordo ai sensi dell'art. 28, verifica dei trasferimenti, menzione nell'informativa.
- priorità: P2
- responsabile suggerito: titolare; specialista vendor (AIPCA); Software Agency
- verifica: payload della chiamata; DPA firmato.

**PRIV-05 · Manca l'informativa**
- area: trasparenza
- stato: `non_conforme` per quanto risulta dal repository
- gravità: media
- riferimenti: GDPR art. 5.1.a, art. 12, art. 13
- evidenze: `public/index.html:1-36` e `public/grazie.html` non contengono né richiamano un'informativa; nel progetto non c'è alcuna pagina privacy.
- lacune: titolare e contatti, finalità e basi giuridiche, destinatari (reception, servizio statistiche), conservazione, diritti, reclamo al Garante.
- raccomandazione: informativa breve accanto al form, con link a quella completa. La sezione sui dati sanitari e sul marketing va scritta con la revisione legale.
- priorità: P2
- responsabile suggerito: titolare; Privacy Legal Specialist (AIPCA)
- verifica: presenza e contenuto dell'informativa.

**PRIV-06 · Dati personali completi nei log**
- area: sicurezza e minimizzazione
- stato: `non_conforme`
- gravità: media. Diventa alta perché comprende i dati sanitari.
- riferimenti: GDPR art. 5.1.c, art. 5.1.f, art. 32
- evidenze: `server.js:32`, `console.log("nuova prenotazione", booking)`
- lacune: i log possono finire nell'hosting o in strumenti terzi, con una conservazione non controllata.
- raccomandazione: registrare solo un evento senza dati personali (ad esempio corso e timestamp).
- priorità: P2 (collegata a PRIV-01)
- responsabile suggerito: Software Agency
- verifica: output del server dopo un invio di prova con dati sintetici.

**PRIV-07 · Nessuna conservazione definita, nessuna cancellazione**
- area: limitazione della conservazione
- stato: `non_conforme`
- gravità: media
- riferimenti: GDPR art. 5.1.e, art. 13.2.a, art. 17
- evidenze:
  - `server.js:31`: `appendFile` su un file unico.
  - `README.md:11`: «Le prenotazioni restano nel file».
- lacune: nessun termine né procedura di cancellazione o anonimizzazione.
- raccomandazione: termine breve per le prenotazioni non convertite (ad esempio pochi giorni dopo la lezione, da decidere al titolare); cancellazione periodica; termini separati per i dati sanitari e per il marketing.
- priorità: P2
- responsabile suggerito: titolare; Data Governance (AIPCA); Software Agency
- verifica: policy scritta e job di cancellazione.

**PRIV-08 · Nessun processo per i diritti degli interessati**
- area: diritti
- stato: `non_verificabile`. Nel codice non c'è nulla.
- gravità: media
- riferimenti: GDPR art. 12, artt. 15-21, art. 7.3
- evidenze: nessuna funzione o contatto in `server.js` né nelle pagine. Il file JSONL non ha un identificativo per ritrovare e cancellare un record (`server.js:18-29`).
- lacune: canale di richiesta, verifica dell'identità, tempi di risposta (un mese), revoca del marketing.
- raccomandazione: un contatto privacy indicato nell'informativa e una procedura interna per ricerca, rettifica e cancellazione nel file; link di disiscrizione.
- priorità: P3
- responsabile suggerito: titolare; Data Subject Rights (AIPCA)
- verifica: procedura scritta e una prova con dati sintetici.

**PRIV-09 · Misure di sicurezza del file e del trasporto**
- area: sicurezza
- stato: `non_verificabile`
- gravità: media
- riferimenti: GDPR art. 32, art. 25.1
- evidenze:
  - `server.js:44-54`: server HTTP senza TLS. Potrebbe esserci un proxy, ma non risulta.
  - `server.js:7`: file in chiaro nella cartella dell'applicazione.
  - `server.js:47`: il file non è servito via web (bene).
  - `server.js:10-29`: nessuna validazione né limite di dimensione dell'input.
- lacune: TLS, permessi sul file, cifratura (critica per i dati sanitari), backup, chi della reception accede e come.
- raccomandazione: HTTPS obbligatorio, permessi ristretti, cifratura a riposo se i dati sanitari restano, validazione e limite di dimensione del corpo della richiesta, accesso della reception tramite strumento autenticato.
- priorità: P2
- responsabile suggerito: Privacy Security Engineer (AIPCA) o Cybersecurity; Software Agency
- verifica: configurazione dell'hosting e del proxy.

**PRIV-10 · Registro dei trattamenti e screening DPIA assenti**
- area: accountability
- stato: `non_verificabile`. Non ci sono documenti nel repository.
- gravità: media
- riferimenti: GDPR art. 5.2, art. 24, art. 30 (l'esenzione dell'art. 30.5 non si applica perché si trattano categorie particolari), art. 35; elenco del Garante dei trattamenti soggetti a DPIA (provv. 467/2018)
- evidenze: nel progetto non c'è nessun registro né valutazione.
- lacune:
  - Manca il registro per T1-T5.
  - Manca lo screening DPIA. Una DPIA probabilmente non è obbligatoria per una palestra di quartiere, ma la conclusione va documentata.
- raccomandazione: compilare il registro partendo dal data mapping qui sopra; screening DPIA documentato.
- priorità: P3
- responsabile suggerito: titolare; DPIA Specialist (AIPCA)
- verifica: registro e screening firmati.

**PRIV-11 · Possibili minori**
- area: interessati vulnerabili
- stato: `non_verificabile`
- gravità: bassa-media
- riferimenti: GDPR art. 8; art. 2-quinquies del Codice privacy (14 anni in Italia); considerando 38
- evidenze: `index.html:24` raccoglie la data di nascita, ma il server non la usa per nessuna verifica (`server.js:25`).
- lacune: nessuna gestione dei minori per il consenso al marketing e per i dati sanitari.
- raccomandazione: chiarire se i corsi sono aperti ai minori; se sì, prevedere il coinvolgimento del genitore e niente marketing senza il consenso valido.
- priorità: P3
- responsabile suggerito: titolare
- verifica: decisione del titolare documentata.

## Checklist sintetica

| Controllo | Stato |
|---|---|
| Liceità e base giuridica (art. 6) | `non_verificabile`, nessuna base documentata |
| Categorie particolari (art. 9) | `non_conforme` |
| Dati relativi a reati (art. 10) | `non_applicabile` |
| Consenso al marketing (art. 7) | `non_conforme` |
| Minimizzazione (art. 5.1.c) | `non_conforme` |
| Limitazione della conservazione (art. 5.1.e) | `non_conforme` |
| Trasparenza (artt. 12-13) | `non_conforme` |
| Diritti (artt. 15-22) | `non_verificabile` |
| Privacy by design e by default (art. 25) | `non_conforme` (casella preselezionata, campi obbligatori eccedenti) |
| Sicurezza (art. 32) | `non_verificabile` |
| Fornitori e trasferimenti (art. 28, artt. 44-46) | `non_verificabile` |
| Registro (art. 30) e DPIA (art. 35) | `non_verificabile` |
| Pagine pubblicate che espongono il file delle prenotazioni | `conforme_verificato`: solo per questo controllo, `server.js:47` serve unicamente `index.html` e `grazie.html` |

## Da segnalare subito al Chief e all'utente

1. **Dati sanitari** raccolti senza condizione dell'art. 9 e scritti nei log (PRIV-01, PRIV-06).
2. **Consenso alla newsletter** sempre registrato come «sì», per via del bug in `server.js:27` (PRIV-02).

Se il modulo è già online con dati reali, questi due rilievi vanno trattati come P0. Il titolare dovrà poi decidere cosa fare dei record e dei consensi già raccolti.

## Prossimi passi da confermare con l'utente

- Il titolare decide se i dati sanitari, il codice fiscale e la data di nascita servono davvero.
- La Software Agency corregge newsletter, log e payload delle statistiche (sono interventi piccoli, ma richiedono la tua approvazione).
- La redazione dell'informativa va a Privacy Legal; registro e screening DPIA vanno al titolare.

Non ho applicato alcuna correzione.

— ALIOTH (AIPCA-02)