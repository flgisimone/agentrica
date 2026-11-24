# Gestione delle vulnerabilità

- Scanner: «DepScan» (dipendenze npm dal lockfile) e «ImageScan» (pacchetti del sistema nell'immagine), ogni lunedì in CI. Il rapporto della settimana è `scan-<data>.json`.
- Tempi di correzione concordati con la direzione (dalla data del rapporto): P0 48 ore, P1 7 giorni, P2 30 giorni, P3 90 giorni.
- Eccezioni in `scanner-ignore.yml`: motivazione, referente e scadenza; scaduta l'eccezione, il rilievo torna aperto.
- L'immagine di produzione contiene solo le dipendenze di `dependencies` (`npm ci --omit=dev`); `devDependencies` servono solo in CI (lint e documentazione interna generata dai sorgenti del repository).
- Tutte le rotte `/api/*` richiedono un account; i clienti registrati sono circa 1.400 aziende.
