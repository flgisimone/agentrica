AIPCA-02 · ALIOTH — Senior GDPR & Data Protection Specialist, reparto AIPCA (AI Privacy & Compliance)

# Valutazione GDPR: prenotazioni-palestra

Valutazione di supporto, non certificazione e non parere legale. Nessun file modificato, nessun dato reale trattato. Perimetro: i 5 file del repository (server.js, README.md, package.json, public/index.html, public/grazie.html). Non ho potuto verificare: informativa, registro dei trattamenti, contratti con i fornitori, configurazione di hosting e backup, chi sia il titolare. Nel repository non c'è alcuna informativa privacy né alcun registro.

## Data mapping

Trattamento A, prenotazione lezione di prova
- Finalità: gestire la prenotazione (public/index.html:9-24, README.md:10-11).
- Interessati: persone che prenotano; non è escluso che siano minorenni (campo data di nascita, nessun controllo).
- Dati: corso, giorno, nome e cognome, email, telefono, codice fiscale, data di nascita (server.js:19-25), campo libero salute (server.js:26; index.html:25-28), timestamp.
- Base giuridica dichiarata: nessuna. Base plausibile: art. 6.1.b per i dati essenziali. Non dimostrata per CF, data di nascita e salute.
- Destinatari: la reception (README.md:11); il servizio di statistiche (vedi C).
- Conservazione: file `prenotazioni.jsonl` che cresce senza fine (server.js:7, 31). Nessun termine, nessuna cancellazione.
- Trasferimenti: ignoti, vedi C.
- Misure: nessuna rilevata nel codice (nessuna cifratura, nessun controllo accessi, nessun log di accesso).

Trattamento B, newsletter e offerte
- Finalità: marketing (index.html:30-31).
- Dati: email, nome, preferenza (server.js:27).
- Base: consenso (art. 6.1.a) o, in alternativa, art. 130 c.4 Codice Privacy (soft spam). Il consenso non è dimostrabile (vedi rilievo 3).

Trattamento C, statistiche
- Finalità: analytics (server.js:34-38, README.md:10).
- Dati inviati: evento, corso, email in chiaro.
- Destinatario: `https://stats.example.com/collect` (server.js:8). È un segnaposto, quindi fornitore, sede e ruolo non verificabili.

Trattamento D, log applicativo
- `console.log("nuova prenotazione", booking)` scrive nei log di processo tutti i campi, inclusa la salute (server.js:32).

## Rilievi

### AIPCA-02-01 — Dati sulla salute raccolti senza base giuridica e senza garanzie
- area: categorie particolari (art. 9)
- stato: non_conforme
- gravita: alta
- rischio: il campo libero (index.html:25-27, server.js:26) raccoglie con ogni probabilità dati relativi alla salute (patologie, farmaci, infortuni). Sono categorie particolari: servono una condizione dell'art. 9.2, di norma il consenso esplicito (9.2.a), distinta dalla base dell'art. 6. Il campo è facoltativo ma non c'è alcun consenso esplicito né testo che spieghi perché serve. I dati sono in chiaro nel file e nel log (server.js:31-32) e raggiungono l'intera reception.
- riferimenti: GDPR artt. 5.1.c, 9.1, 9.2.a, 25, 32; Garante Privacy, provvedimenti sul trattamento dei dati sanitari (da verificare).
- evidenze: index.html:25-27; server.js:26, 31, 32.
- lacune: non so se esista un certificato medico o un'altra procedura fuori dal servizio; non so chi in reception acceda al file.
- raccomandazione: (1) valutare se serve davvero; in alternativa sostituirlo con una casella «dichiaro di essere idoneo/a all'attività» oppure un invito a comunicare le condizioni direttamente all'istruttore; (2) se resta, aggiungere un consenso esplicito separato, non preselezionato, con testo dedicato e revocabile; (3) escluderlo da log e statistiche; (4) limitare l'accesso e cifrare a riposo.
- priorita: P1
- responsabile_suggerito: titolare (decisione sullo scopo), Software Agency (implementazione), DPO/consulente legale (formula del consenso)
- verifica: il campo salute non compare nei log, il consenso esplicito è registrato con data e testo versionato, l'accesso al file è limitato.

### AIPCA-02-02 — Email inviata a un servizio di statistiche non verificato; ruolo del fornitore e trasferimento extra-SEE non documentati
- area: destinatari, fornitori, trasferimenti (artt. 28, 44-46)
- stato: non_conforme
- gravita: alta
- rischio: a ogni prenotazione l'email dell'interessato e il corso sono inviati a un terzo (server.js:34-38). Per un'analisi statistica l'email non è necessaria (minimizzazione) e permette di identificare la persona. Non c'è informativa sul destinatario, né accordo art. 28, né garanzia sul trasferimento. L'invio parte anche se l'interessato non ha acconsentito, senza banner né informativa. Dal corso frequentato si possono inoltre dedurre informazioni sulla persona (ad es. Pilates e salute) in combinazione con l'email, rischio da valutare. L'errore è inghiottito (`.catch(() => {})`, server.js:38): nessuna traccia se l'invio fallisce o riesce.
- riferimenti: GDPR artt. 5.1.a, 5.1.c, 13.1.e-f, 28, 44-46.
- evidenze: server.js:8, 34-38; README.md:10.
- lacune: l'host `stats.example.com` è un dominio di esempio: non si sa chi sia il fornitore, dove si trovi, quale contratto ci sia, se tratti i dati per proprio conto.
- raccomandazione: rimuovere l'email dall'evento (o usare un identificativo non reversibile, sapendo che resta dato personale se riconducibile); identificare il fornitore e stipulare l'art. 28; verificare sede e meccanismo di trasferimento; elencare il destinatario nell'informativa; se il servizio non è strettamente necessario, valutare il consenso.
- priorita: P1
- responsabile_suggerito: titolare, Software Agency
- verifica: il payload non contiene email né altri identificativi; accordo art. 28 in archivio; fornitore nell'informativa e nel registro.

### AIPCA-02-03 — Consenso al marketing non valido e non dimostrabile
- area: consenso (artt. 6-7)
- stato: non_conforme
- gravita: alta
- rischio: (a) la casella è preselezionata (`checked`, index.html:30): un consenso con casella preflaggata non è valido (art. 4.11, considerando 32; CGUE C-673/17 Planet49). (b) Nel server, `newsletter: form.newsletter !== "no"` (server.js:27) è vero sempre: l'unica opzione inviata dal browser è "si" o l'assenza del campo, mai "no". Anche chi toglie la spunta risulta quindi consenziente. È un errore concreto che registra un consenso mai dato. (c) Il consenso non è registrato con data, testo e versione (art. 7.1), e non è chiaro come si revochi (art. 7.3). (d) L'etichetta «offerte e novità» non indica il canale né il titolare.
- riferimenti: GDPR artt. 4.11, 6.1.a, 7.1-7.3, 21.2-3; considerando 32; art. 130 Codice Privacy; Garante, linee guida sul marketing.
- evidenze: index.html:30-31; server.js:27, 28.
- lacune: non c'è codice di invio newsletter nel repository: non so se e come i dati vengano usati altrove.
- raccomandazione: casella non preselezionata; salvare `newsletter` come true solo se `form.newsletter === "si"`; registrare data, testo e versione dell'informativa mostrata; prevedere link di disiscrizione e canale per revocare; rendere chiaro che la prenotazione non dipende dal consenso.
- priorita: P1
- responsabile_suggerito: Software Agency (correzione), titolare (testi)
- verifica: test con checkbox non spuntata → false; il consenso risulta con data e versione; revoca possibile con la stessa facilità.

### AIPCA-02-04 — Informativa assente
- area: trasparenza (artt. 12-14)
- stato: non_conforme
- gravita: alta
- rischio: modulo e pagina di conferma non contengono nessuna informazione su titolare, finalità, basi giuridiche, destinatari (reception, fornitore statistiche), trasferimenti, conservazione, diritti, reclamo al Garante, obbligatorietà dei dati. I dati sono raccolti direttamente dall'interessato (art. 13), senza alcuna informativa al momento della raccolta.
- riferimenti: GDPR artt. 12, 13, 5.1.a.
- evidenze: public/index.html (intero file, nessun link o testo); public/grazie.html.
- lacune: potrebbe esistere un'informativa cartacea o su altro sito: non verificabile dal repository.
- raccomandazione: informativa layer-ed breve nel modulo (link alla completa) prima dell'invio, con titolare e contatti, finalità separate (prenotazione, marketing, statistiche), basi, destinatari, conservazione, diritti. Testo da validare da DPO o consulente legale.
- priorita: P1
- responsabile_suggerito: titolare / DPO, Software Agency (inserimento)
- verifica: link all'informativa visibile prima dell'invio; contenuto verificato rispetto all'art. 13.

### AIPCA-02-05 — Minimizzazione: codice fiscale e data di nascita obbligatori per una lezione di prova
- area: minimizzazione (art. 5.1.c)
- stato: non_conforme
- gravita: media
- rischio: il codice fiscale (index.html:23, `required`) e la data di nascita (index.html:24, `required`) sono obbligatori e non servono, in genere, per prenotare una lezione di prova. Il codice fiscale è un identificativo forte, utile per frodi e furti d'identità. La data di nascita può servire per verificare la maggiore età, ma non occorre conservarla.
- riferimenti: GDPR artt. 5.1.c, 25.2; art. 13.2.e (obbligatorietà).
- evidenze: index.html:20-24; server.js:19-25.
- lacune: la finalità reale di CF e data di nascita non è dichiarata (tesseramento? assicurazione? verifica età?). Se serve per tesseramento o assicurazione, quella finalità va dichiarata e può spostarsi all'iscrizione effettiva.
- raccomandazione: eliminare CF dal modulo di prenotazione, raccoglierlo solo in caso di iscrizione se necessario; sostituire la data di nascita con una dichiarazione di maggiore età, oppure raccoglierla solo quando serve; indicare nel modulo quali campi sono obbligatori e perché.
- priorita: P2
- responsabile_suggerito: titolare (finalità), Software Agency
- verifica: campi rimossi o motivati nell'informativa; salvataggio coerente con il modulo.

### AIPCA-02-06 — Conservazione illimitata e nessun processo per i diritti degli interessati
- area: limitazione della conservazione, diritti (artt. 5.1.e, 15-22)
- stato: non_conforme
- gravita: media
- rischio: le prenotazioni si accumulano per sempre in `prenotazioni.jsonl` (server.js:31; README.md:11 «restano nel file»). Una lezione di prova passata non giustifica la conservazione di CF, data di nascita e salute. Non esiste un modo per trovare, estrarre, rettificare o cancellare i dati di una persona (file append-only), né contatti o procedura per le richieste degli interessati. Il file non è in `.gitignore` né esiste un `.gitignore` nel repository: rischio che finisca in un commit (rilievo collegato ad AIPCA-02-08).
- riferimenti: GDPR artt. 5.1.e, 12.3, 15, 16, 17, 20, 21, 25.
- evidenze: server.js:7, 31; README.md:11.
- lacune: non so se esistano procedure esterne (reception, email del titolare) o backup.
- raccomandazione: definire un termine (ad es. cancellazione dei dati sanitari e fiscali subito dopo la lezione; dati di contatto per un periodo breve se manca l'iscrizione; i marketing finché dura il consenso), applicarlo con una routine di cancellazione; documentare la procedura per i diritti con i tempi di 1 mese (art. 12.3); valutare l'uso di un archivio interrogabile al posto del file.
- priorita: P2
- responsabile_suggerito: titolare / DPO, Software Agency
- verifica: termini scritti nel registro e applicati; prova di cancellazione su dati sintetici.

### AIPCA-02-07 — Dati personali e sanitari nei log applicativi
- area: minimizzazione, sicurezza (artt. 5.1.c, 5.1.f, 32)
- stato: non_conforme
- gravita: media
- rischio: `console.log("nuova prenotazione", booking)` stampa l'intero oggetto, compresi CF, data di nascita e campo salute (server.js:32). I log hanno conservazione, accessi e destinazioni diversi dal file delle prenotazioni (hosting, aggregatori): moltiplicano le copie e sfuggono a cancellazione e accessi.
- riferimenti: GDPR artt. 5.1.c, 5.1.f, 25, 32.
- evidenze: server.js:32.
- lacune: non so dove vadano i log in esercizio.
- raccomandazione: registrare solo un identificativo tecnico e l'esito, mai i dati dell'interessato.
- priorita: P2
- responsabile_suggerito: Software Agency
- verifica: nessun campo anagrafico nei log, controllo con dati sintetici.

### AIPCA-02-08 — Misure tecniche e organizzative non evidenziate (art. 32)
- area: sicurezza del trattamento, privacy by design (artt. 25, 32)
- stato: parzialmente_conforme
- gravita: media
- rischio: il file è in chiaro, in una cartella del progetto, senza permessi dichiarati; nessuna autenticazione per «la reception» (il README dice che la legge, ma non è definito come); nessuna validazione dei campi né limite di dimensione del corpo (server.js:11-14, il body è letto per intero); nessun HTTPS dichiarato, quindi dati sanitari in transito non protetti se pubblicato su HTTP. Punto a favore: il file non è nella cartella `public/`, quindi non è servito direttamente (server.js:47-49 serve solo due pagine fisse). Analisi di sicurezza dell'applicazione più approfondita: affidare al reparto cybersecurity.
- riferimenti: GDPR artt. 5.1.f, 25, 32.
- evidenze: server.js:7, 11-14, 31, 47-49; assenza di `.gitignore`.
- lacune: ambiente di hosting, TLS, permessi del file, backup non verificabili.
- raccomandazione: permessi restrittivi sul file; cifratura a riposo; HTTPS obbligatorio; accesso della reception con credenziali personali; limite di dimensione del corpo; aggiungere `prenotazioni.jsonl` a `.gitignore`.
- priorita: P2
- responsabile_suggerito: Software Agency, reparto cybersecurity
- verifica: controllo di permessi, TLS e `.gitignore`; test con dati sintetici.

### AIPCA-02-09 — Minori e verifica dell'età
- area: interessati vulnerabili (art. 8)
- stato: non_verificabile
- gravita: bassa
- rischio: si raccoglie la data di nascita ma non si controlla; se il servizio è aperto a minorenni, il consenso al marketing sotto i 14 anni (Italia, D.Lgs. 196/2003 art. 2-quinquies) spetta a chi esercita la responsabilità genitoriale, e i dati sulla salute di minori richiedono cautela maggiore.
- riferimenti: GDPR art. 8; art. 2-quinquies Codice Privacy.
- evidenze: index.html:24.
- lacune: non è detto a chi si rivolga il servizio.
- raccomandazione: chiarire con il titolare se i minori possono prenotare; se sì, prevedere il flusso con il genitore.
- priorita: P3
- responsabile_suggerito: titolare
- verifica: decisione documentata.

### AIPCA-02-10 — Accountability: registro dei trattamenti, DPIA, ruoli
- area: art. 24, 30, 35
- stato: non_verificabile
- gravita: media
- rischio: nessun registro, nessuna analisi dei ruoli (titolare, eventuali responsabili) nel repository. La presenza di dati sanitari, anche se facoltativi e in volumi piccoli, è un elemento da considerare; per una piccola palestra una DPIA è in genere da valutare caso per caso (screening), non è affermabile che sia obbligatoria.
- riferimenti: GDPR artt. 24, 30, 35.
- evidenze: assenza di documentazione nel repository.
- lacune: tutto ciò che sta fuori dal repository.
- raccomandazione: tenere il registro (le attività con dati sanitari possono rientrare tra i casi in cui l'esenzione art. 30.5 non si applica); fare lo screening DPIA con il reparto competente.
- priorita: P3
- responsabile_suggerito: titolare / DPO
- verifica: registro presente e aggiornato.

### Nota sul punto positivo
- Il server non usa cookie né script di terze parti nelle pagine (public/*.html): per quanto visibile qui, non servirebbe un banner cookie sulle pagine. Non verificabile cosa aggiunga l'hosting. Stato per questo controllo: conforme_verificato solo per il contenuto dei due file HTML.

## Priorità riassunte
P1: 01 (salute), 02 (fornitore statistiche), 03 (consenso marketing), 04 (informativa). P2: 05, 06, 07, 08. P3: 09, 10. Nessun P0: non ho evidenza di una violazione in corso.

## Checklist
- Base giuridica dichiarata: no. Informativa: no. Consenso esplicito salute: no. Consenso marketing valido: no. Registro: non verificabile. Termini di conservazione: no. Processo diritti: no. Accordi art. 28: non verificabili. Trasferimenti: non verificabili.

## Passi suggeriti, da confermare con l'utente
1. Decidere se il campo salute resta e se CF e data di nascita servono.
2. Correggere subito il bug del consenso (server.js:27) e togliere `checked` (index.html:30).
3. Chiarire il fornitore delle statistiche e togliere l'email dal payload.
4. Redigere l'informativa con DPO o consulente legale.
5. Fissare i termini di conservazione e la procedura per i diritti.
Le correzioni al codice sono raccomandazioni: l'attuazione spetta alla Software Agency previa approvazione. Non ho modificato nulla.

Limiti: valutazione solo sul repository, senza ambiente di esecuzione né documenti fuori dal codice; i riferimenti normativi e giurisprudenziali sono indicativi e da verificare nella versione vigente.

— AIPCA-02 · ALIOTH
