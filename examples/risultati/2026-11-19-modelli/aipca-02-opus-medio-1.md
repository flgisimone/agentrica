AIPCA-02 · ALIOTH — Senior GDPR & Data Protection Specialist, reparto AIPCA (AI Privacy & Compliance)

# Valutazione GDPR del servizio prenotazioni-palestra

Ho letto tutti i file del progetto: `README.md`, `package.json`, `server.js`, `public/index.html` e `public/grazie.html`. Non ho avviato il servizio e non ho modificato nulla. Il file `prenotazioni.jsonl` non c'è nella cartella, quindi non ho esaminato dati salvati. Questi rilievi aiutano a decidere. Non sono un parere legale definitivo né una certificazione.

**Da sapere subito:** quattro rilievi sono P1 (PG-01, PG-02, PG-03, PG-04) e nessuno è P0. Il più urgente riguarda i dati sanitari: vengono raccolti senza informativa né consenso esplicito e finiscono anche nei log.

## Mappa dei dati

| Trattamento | Interessati | Dati | Base giuridica dichiarata | Destinatari | Conservazione | Trasferimenti | Misure |
|---|---|---|---|---|---|---|---|
| T1 Prenotazione della lezione di prova | Persone che prenotano | corso, giorno, nome e cognome, email, telefono, codice fiscale, data di nascita | nessuna (manca l'informativa) | reception (`README.md:11`) | non definita, «restano nel file» | nessuno | nessuna in vista |
| T2 Informazioni sulla salute per l'istruttore | Persone che prenotano | patologie, infortuni, farmaci in testo libero (art. 9) | nessuna | reception e istruttore | non definita | nessuno | nessuna |
| T3 Newsletter e offerte | Persone che prenotano | email, flag `newsletter` | consenso solo in apparenza (casella già spuntata) | non indicati | non definita | non indicati | nessuna |
| T4 Statistiche | Persone che prenotano | corso, email | nessuna | «servizio di statistiche della palestra» (`server.js:8`, `STATS_URL`) | ignota | da verificare | nessuna |
| T5 Log dell'applicazione | Persone che prenotano | l'intera prenotazione, dati sanitari compresi (`server.js:32`) | nessuna | chi legge i log | quella dei log, ignota | dipende dall'hosting | nessuna |

## Rilievi

**PG-01 · Dati sanitari senza base art. 9 e senza garanzie**
- Area: categorie particolari
- Stato: `non_conforme`
- Gravità: alta
- Rischio: si raccolgono dati sulla salute (patologie, infortuni, farmaci) senza una condizione dell'art. 9(2) documentata e senza consenso esplicito. Sono testo libero, quindi l'utente può scrivere qualunque cosa. Vengono salvati in chiaro e stampati nei log.
- Riferimenti: GDPR art. 9(1)-(2)(a), art. 5(1)(c), art. 25, art. 32
- Evidenze: `public/index.html:26-27` (campo `health`, textarea libera), `server.js:26` (`health: form.health`), `server.js:31` (salvataggio in chiaro in `prenotazioni.jsonl`), `server.js:32` (la console stampa tutto l'oggetto `booking`)
- Lacune: non risulta se il titolare ha valutato un'altra condizione dell'art. 9(2). Non risulta chi legge il file né se l'hosting cifra i dischi.
- Raccomandazione:
  - valutare se il dato serve davvero prima della lezione di prova. Un'alternativa è chiederlo a voce all'istruttore, oppure usare una domanda chiusa come «ci sono condizioni da segnalare all'istruttore? sì/no» e approfondire di persona.
  - se il campo resta: farlo facoltativo, con un consenso esplicito separato e non pre-spuntato, e un'informativa dedicata.
  - limitare l'accesso al solo personale che ne ha bisogno, conservare il dato per poco tempo e cifrarlo.
  - toglierlo dai log.
- Priorità: P1
- Responsabile suggerito: titolare (decisione), Software Agency (attuazione)
- Verifica: rileggere il modulo e `server.js` dopo la modifica. Controllare che nessun dato sanitario compaia nei log e che il consenso venga registrato con data e testo.

**PG-02 · Il consenso alla newsletter non è valido: casella pre-spuntata e logica che lo dà sempre per vero**
- Area: consenso e marketing
- Stato: `non_conforme`
- Gravità: alta
- Rischio: la casella è già spuntata. In più, chi la toglie viene comunque registrato come consenziente. Un modulo HTML non invia una checkbox non spuntata, quindi `form.newsletter` vale `undefined`, e `undefined !== "no"` dà `true`. Ogni prenotazione risulta quindi con consenso al marketing.
- Riferimenti: GDPR art. 4(11), art. 6(1)(a), art. 7(1)-(2), art. 25(2), considerando 32 (le caselle pre-spuntate non sono consenso; CGUE C-673/17 Planet49); art. 130 del Codice privacy (D.lgs. 196/2003) e Linee guida EDPB 05/2020 sul consenso
- Evidenze: `public/index.html:30` (`checked`), `server.js:27` (`newsletter: form.newsletter !== "no"`)
- Lacune: non risulta se le email sono già state usate per il marketing.
- Raccomandazione:
  - togliere `checked` dalla casella;
  - registrare il consenso solo se `form.newsletter === "si"`, salvando data, testo del consenso e versione dell'informativa;
  - prevedere la revoca (art. 7(3)).
  - Se `prenotazioni.jsonl` contiene già prenotazioni, considerare non validi i consensi registrati finora finché non sono riconfermati.
- Priorità: P1
- Responsabile suggerito: titolare, Software Agency
- Verifica: inviare il modulo con dati sintetici e la casella non spuntata, poi controllare che il record abbia `newsletter: false`.

**PG-03 · Manca l'informativa**
- Area: trasparenza
- Stato: `non_conforme`
- Gravità: alta
- Rischio: gli interessati non sanno chi è il titolare, per quali finalità e con quali basi si trattano i loro dati, chi li riceve (statistiche), per quanto tempo restano e quali diritti hanno.
- Riferimenti: GDPR art. 5(1)(a), art. 12, art. 13
- Evidenze: `public/index.html:9-34` non ha né informativa né link a un'informativa. Nemmeno `public/grazie.html` ne ha.
- Lacune: un'informativa potrebbe esistere fuori dal repository. Non l'ho trovata.
- Raccomandazione: mettere accanto al modulo un'informativa breve con il link a quella completa. Deve coprire T1-T5, cioè titolare, finalità, basi giuridiche, destinatari, conservazione e diritti, e indicare a chi scrivere per esercitarli.
- Priorità: P1
- Responsabile suggerito: titolare, con revisione legale umana
- Verifica: l'informativa è visibile prima dell'invio e riporta tutti gli elementi dell'art. 13.

**PG-04 · L'email viene inviata a un servizio di statistiche senza base, accordo né informativa**
- Area: destinatari e fornitori
- Stato: `non_verificabile`
- Gravità: media
- Rischio: l'email, un dato identificativo, arriva a un terzo a ogni prenotazione. Non c'è nessuna base giuridica, nessun accordo art. 28 e nessuna informazione sull'eventuale trasferimento fuori dallo SEE. Per contare le prenotazioni per corso l'email non serve.
- Riferimenti: GDPR art. 5(1)(b)-(c), art. 6, art. 13(1)(e)-(f), art. 28, artt. 44-46
- Evidenze: `server.js:8` (`STATS_URL`), `server.js:34-38` (il corpo contiene `email: booking.email`), `README.md:10`
- Lacune: non si sa chi gestisce il servizio, dove sono i server né per quanto tiene i dati. L'URL è un segnaposto (`example.com`).
- Raccomandazione:
  - togliere l'email dall'evento: per la statistica bastano `event` e `course`;
  - se un identificativo serve davvero, motivarlo e documentare la base giuridica;
  - identificare il fornitore, firmare l'accordo art. 28, verificare i trasferimenti e riportarlo nell'informativa.
- Priorità: P1
- Responsabile suggerito: titolare (fornitore e contratto), Software Agency (payload)
- Verifica: rileggere il payload inviato e la documentazione del fornitore.

**PG-05 · Codice fiscale e data di nascita sono superflui (minimizzazione)**
- Area: minimizzazione
- Stato: `non_conforme`
- Gravità: media
- Rischio: per una lezione di prova si chiedono come obbligatori dati identificativi che non risultano necessari. In caso di violazione aumentano il danno per le persone.
- Riferimenti: GDPR art. 5(1)(c), art. 25(1)-(2)
- Evidenze: `public/index.html:23-24` (`taxCode` e `birthDate` con `required`), `server.js:24-25`
- Lacune: non è documentata nessuna finalità che li richieda. Una finalità possibile sarebbe una verifica dell'età per i minori o un obbligo assicurativo: se esiste, va dimostrata.
- Raccomandazione:
  - togliere il codice fiscale;
  - se serve sapere se la persona è minorenne, sostituire la data di nascita con la domanda «hai almeno 18 anni?»;
  - valutare anche se il telefono può essere facoltativo, visto che c'è già l'email (`index.html:22`).
- Priorità: P2
- Responsabile suggerito: titolare, Software Agency
- Verifica: il modulo e il record contengono solo i campi motivati da una finalità documentata.

**PG-06 · Nessun limite di conservazione**
- Area: limitazione della conservazione
- Stato: `non_conforme`
- Gravità: media
- Rischio: le prenotazioni, dati sanitari compresi, si accumulano senza scadenza in un file in chiaro.
- Riferimenti: GDPR art. 5(1)(e), art. 13(2)(a), art. 25
- Evidenze: `server.js:31` (`appendFile`, solo in aggiunta, nessuna cancellazione), `README.md:11` («Le prenotazioni restano nel file»)
- Lacune: non risulta nessuna policy di conservazione, né per il file né per i log.
- Raccomandazione:
  - fissare tempi di conservazione distinti, per esempio la prenotazione fino a poco dopo la lezione e i dati sanitari solo per la lezione;
  - prevedere la cancellazione periodica;
  - fissare tempi anche per i log.
- Priorità: P2
- Responsabile suggerito: titolare, Software Agency
- Verifica: la policy è scritta e c'è un meccanismo di cancellazione verificato con dati sintetici.

**PG-07 · I log contengono tutti i dati personali**
- Area: privacy by design e sicurezza
- Stato: `non_conforme`
- Gravità: media
- Rischio: i dati, sanitari compresi, finiscono nei log dell'hosting. Questa copia sfugge a conservazione, accessi e cancellazione.
- Riferimenti: GDPR art. 5(1)(c)-(f), art. 25, art. 32
- Evidenze: `server.js:32` (`console.log("nuova prenotazione", booking)`)
- Lacune: non si sa dove vanno i log né chi li legge.
- Raccomandazione: scrivere nei log solo un evento senza dati personali, per esempio «nuova prenotazione» con corso e data.
- Priorità: P2
- Responsabile suggerito: Software Agency
- Verifica: rileggere il codice e controllare l'output con dati sintetici.

**PG-08 · Nessuna procedura per i diritti degli interessati**
- Area: diritti
- Stato: `non_conforme`
- Gravità: media
- Rischio: non ci sono un canale né una procedura per accesso, rettifica, cancellazione, opposizione al marketing e revoca del consenso. Con un file JSONL senza identificativo univoco anche rispondere a una richiesta è difficile.
- Riferimenti: GDPR art. 12, artt. 15-22, art. 7(3), art. 21(2)-(3)
- Evidenze: nessun contatto nelle pagine (`public/index.html`, `public/grazie.html`) e nessun endpoint o procedura nel `README.md`
- Lacune: una procedura potrebbe esistere fuori dal repository. Non l'ho trovata.
- Raccomandazione:
  - indicare un contatto nell'informativa;
  - mettere per iscritto una procedura interna, con risposta entro un mese, per trovare, correggere e cancellare i record;
  - mettere un link di disiscrizione nelle email di marketing.
- Priorità: P2
- Responsabile suggerito: titolare
- Verifica: una richiesta simulata con dati sintetici viene evasa nei tempi.

**PG-09 · Mancano registro dei trattamenti e accountability**
- Area: accountability
- Stato: `non_verificabile`
- Gravità: media
- Rischio: le basi giuridiche, le finalità e le misure non sono documentate. Il trattamento di dati sanitari non è occasionale, quindi l'esenzione dell'art. 30(5) per le organizzazioni sotto i 250 dipendenti non si applica e il registro serve.
- Riferimenti: GDPR art. 5(2), art. 24, art. 30
- Evidenze: nel repository non ci sono documenti di registro o di policy (i file sono solo i cinque elencati sopra).
- Lacune: il registro potrebbe esistere fuori dal repository.
- Raccomandazione: compilare il registro per i trattamenti T1-T5, usando la mappa dei dati qui sopra come base.
- Priorità: P2
- Responsabile suggerito: titolare
- Verifica: il registro esiste ed è coerente con il codice.

**PG-10 · Screening DPIA da fare**
- Area: valutazione d'impatto
- Stato: `non_verificabile`
- Gravità: bassa
- Rischio: ci sono dati sanitari di interessati che possono essere vulnerabili. Per una palestra di quartiere la scala sembra limitata e una DPIA probabilmente non è obbligatoria, ma la valutazione va documentata.
- Riferimenti: GDPR art. 35, Linee guida WP248 rev.01, elenco del Garante delle tipologie di trattamento soggette a DPIA (provv. n. 467/2018)
- Evidenze: `public/index.html:26-27`
- Lacune: non si conoscono il numero di iscritti né se sono coinvolti minori.
- Raccomandazione: documentare lo screening. Se si riduce o si elimina il campo sanitario (PG-01), il rischio scende.
- Priorità: P3
- Responsabile suggerito: titolare, con lo specialista DPIA del reparto
- Verifica: lo screening è scritto e conservato.

## Checklist

| Punto | Stato |
|---|---|
| Informativa (art. 13) | `non_conforme` |
| Basi giuridiche documentate (art. 6) | `non_conforme` |
| Dati sanitari (art. 9) | `non_conforme` |
| Consenso al marketing valido (art. 7) | `non_conforme` |
| Minimizzazione (art. 5(1)(c)) | `non_conforme` |
| Conservazione (art. 5(1)(e)) | `non_conforme` |
| Destinatari e fornitori (art. 28) | `non_verificabile` |
| Trasferimenti (artt. 44 e seguenti) | `non_verificabile` |
| Diritti (artt. 15-22) | `non_conforme` |
| Registro (art. 30) | `non_verificabile` |
| DPIA (art. 35) | `non_verificabile` |
| Dati relativi a reati (art. 10) | `non_applicabile`, non vengono raccolti |

## Cosa farei per primo
Ogni intervento va prima approvato da te, poi lo attua la Software Agency.

1. PG-02 e PG-01: correggere il consenso alla newsletter e mettere in sicurezza o eliminare il campo sanitario, togliendo anche i log (PG-07).
2. PG-04: togliere l'email dall'evento delle statistiche.
3. PG-03: scrivere l'informativa.
4. PG-05: togliere il codice fiscale e la data di nascita.
5. PG-06, PG-08 e PG-09: conservazione, procedura per i diritti e registro.

Restano aperte domande che spettano a te:
- chi gestisce il servizio di statistiche;
- se il codice fiscale e la data di nascita servono per un obbligo assicurativo;
- se esistono già un'informativa e un registro fuori dal repository;
- se `prenotazioni.jsonl` contiene già prenotazioni.

Per gli aspetti di sicurezza tecnica del file in chiaro e dell'hosting suggerisco anche una verifica del Privacy Security Engineer.

— AIPCA-02 · ALIOTH