# PRD · Scambio dei turni

- **Autore**: product manager
- **Stato**: approvato, in sviluppo da gennaio 2027 (squadra A)
- **Concetto validato**: [innovazione/concetti.md](../innovazione/concetti.md), concetto A

## Obiettivo

Ridurre del 50% le assenze non coperte nei locali clienti entro sei mesi dal rilascio.

## Utenti

- **Responsabile di sala o titolare**: utente principale. Approva gli scambi dal pannello web.
- **Dipendente**: propone e accetta gli scambi dall'app.

## Metriche di successo

| Metrica | Obiettivo a sei mesi |
|---|---|
| Scambi proposti al mese | 5.000 |
| Locali che hanno usato lo scambio almeno una volta | 60% |

## Requisiti

| # | Requisito |
|---|---|
| R1 | Il dipendente sceglie un suo turno futuro e lo propone allo scambio, con una nota facoltativa |
| R2 | La proposta è visibile ai colleghi con lo stesso ruolo (sala, cucina, bar) che non hanno un turno sovrapposto |
| R3 | Un collega accetta la proposta; se entrambi i dipendenti hanno accettato, lo scambio è approvato automaticamente e i turni si aggiornano |
| R4 | Il responsabile deve sempre approvare lo scambio prima che i turni cambino; può rifiutarlo con un motivo |
| R5 | Il dipendente riceve una notifica push quando un collega accetta e quando il responsabile approva o rifiuta |
| R6 | Lo scambio si chiude da solo 2 ore prima dell'inizio del turno, se nessuno lo ha accettato |
| R7 | Il registro delle presenze mostra chi ha lavorato davvero il turno, dopo lo scambio |
| R8 | Ogni scambio resta nello storico del locale per 24 mesi |

## Vincoli

- Nessun vincolo sugli orari: lo scambio è libero fra colleghi con lo stesso ruolo, purché i turni non si sovrappongano.
- Funziona per i piani Pro e Plus; nel piano Base si vede ma non si usa.

## Fuori perimetro

- Notifiche push (arrivano con l'App dipendenti 2.0).
- Gestione delle paghe e degli straordinari.
- Scambi fra locali diversi dello stesso gruppo.

## Rischi

- Pochi responsabili potrebbero approvare in tempo: mitigato con R6.
