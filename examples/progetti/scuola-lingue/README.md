# «Parla Subito», scuola di lingue online

Piattaforma di una scuola di lingue con sede a Bologna: corsi di gruppo in videolezione per adulti e ragazzi (dagli 8 anni), prenotazioni, pagamenti, registrazioni delle lezioni con trascrizione automatica, newsletter. Progetto di prova: nomi, fornitori, chiavi e dati sono finti.

## Persone e dati

- **Studenti**: anagrafica, recapiti, livello, classi, presenze, note di salute facoltative (allergie, disturbi dell'apprendimento, per gli insegnanti), registrazioni delle lezioni.
- **Genitori o tutori** degli studenti minorenni: anagrafica, codice fiscale, documento d'identità (per l'iscrizione dei minori), dati di pagamento tramite il fornitore.
- **Insegnanti**: anagrafica, classi assegnate.
- **Personale**: segreteria (`support`) e amministrazione (`admin`).

## Ruoli nell'app

- `student` e `parent`: i propri dati e quelli dei figli.
- `teacher`: le proprie classi.
- `support`: segreteria; risponde alle richieste e gestisce iscrizioni e prenotazioni.
- `admin`: tutto.

## Architettura

- App Node su un server di Nimbus Hosting (Francoforte), Postgres gestito dello stesso fornitore, file (documenti e registrazioni) su storage a oggetti di Nimbus.
- Staging su un secondo server Nimbus, per le prove della segreteria e degli sviluppatori.
- Le registrazioni delle lezioni servono agli studenti assenti per recuperare: si conservano 30 giorni.
- I fornitori sono in [`docs/fornitori.md`](docs/fornitori.md); la procedura per i diritti degli interessati in [`docs/procedura-diritti.md`](docs/procedura-diritti.md).
