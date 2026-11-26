# Violazione di novembre 2026: storage di staging pubblico

Scheda dell'evento compilata dalla segreteria e dallo sviluppatore, aggiornata il 24 novembre 2026.

## Fatti

- **17 novembre, 16:40**: uno sviluppatore rende pubblico il contenitore dello storage di staging su Nimbus per passare un file di prova a un collega esterno.
- Il contenitore di staging contiene la copia dei file di produzione dell'ultimo aggiornamento di staging: documenti d'identità dei genitori (decifrati dallo script di aggiornamento, per le prove) e `note-salute.csv` con le note di salute degli studenti, anche minorenni.
- **18 novembre, 09:00**: un ricercatore di sicurezza scrive a `privacy@parlasubito.example` che il contenitore è leggibile da chiunque, con l'elenco dei file.
- **18 novembre, 11:00**: il contenitore torna privato.
- I log di accesso del contenitore mostrano due scaricamenti completi della cartella `documenti/` e di `note-salute.csv` da due indirizzi esterni, il 17 novembre alle 22:13 e il 18 novembre alle 03:50. I log di accesso dello storage si cancellano da soli dopo 7 giorni; non ne è stata fatta una copia.
- **24 novembre**: finita l'analisi interna.

## Valutazione

- **Tipo**: nessuna violazione di riservatezza, perché i file non sono stati modificati né cancellati.
- **Interessati**: 412 genitori (documenti) e 96 studenti (note di salute), di cui 71 minorenni.
- **Rischio**: basso, perché in produzione i documenti sono cifrati con AES-256-GCM.

## Decisioni

- **Notifica al Garante**: entro 72 ore dalla fine dell'analisi interna, quindi entro il 27 novembre, con la procedura telematica del Garante.
- **Comunicazione agli interessati**: non necessaria, visto il rischio basso.
- **Misure**: regola interna «mai rendere pubblico lo storage»; lo script di aggiornamento di staging resta com'è.
