# Caso AIPCA-02 · ALIOTH su prenotazioni-palestra

- **Agente**: AIPCA-02 · ALIOTH, GDPR & Data Protection Specialist (`aipca-02`)
- **Progetto**: [`progetti/prenotazioni-palestra`](../progetti/prenotazioni-palestra/), modulo di prenotazione in Node senza dipendenze
- **Compito** (argomento `compito`, da copiare così com'è):

  > Valuta il trattamento dei dati personali di questo servizio rispetto al GDPR e riporta i rilievi con articolo, file e riga.

## Difetti attesi

| # | Difetto | Dove | GDPR |
|---|---|---|---|
| G1 | Dati sulla salute (patologie, farmaci) raccolti senza consenso esplicito né altra condizione dell'art. 9 | `public/index.html`, campo `health` | art. 9 |
| G2 | Codice fiscale e data di nascita non servono per una lezione di prova | `public/index.html`, `server.js` | art. 5(1)(c) |
| G3 | Consenso alla newsletter preselezionato, e il server lo registra `true` anche con la casella deselezionata (`newsletter !== "no"`) | `public/index.html`, `server.js` | artt. 4(11), 7, cons. 32 |
| G4 | Nessuna informativa sul modulo | `public/index.html` | art. 13 |
| G5 | Nessun tempo di conservazione: le prenotazioni restano nel file per sempre, nessuna cancellazione | `server.js`, README | art. 5(1)(e) |
| G6 | Il log stampa la prenotazione intera, dati sulla salute compresi | `server.js`, `console.log` | artt. 5(1)(f), 32 |
| G7 | L'email va a un servizio di statistiche esterno: non serve per contare le prenotazioni e non c'è informativa, contratto (art. 28) né verifica del trasferimento | `server.js`, `STATS_URL` | artt. 5(1)(c), 28, 44 |

Accettabili ma non richiesti: file in chiaro senza controllo degli accessi (art. 32), registro dei trattamenti, DPIA per i dati sulla salute (art. 35), giustificazione del telefono obbligatorio. Extra validi del 2026-11-15: nessuno strumento per i diritti e la revoca del consenso (artt. 7(3), 15-21), minorenni non gestiti, trasporto HTTP senza TLS (art. 32).
