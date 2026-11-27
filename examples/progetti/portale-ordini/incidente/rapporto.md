# Incidente del 21 novembre 2026: accesso all'account di un operatore

Rapporto preliminare del responsabile IT, 21 novembre 2026, ore 18:00. Gli orari sono in ora italiana (UTC+1). Estratto dei log in [estratto-2026-11-21.log](estratto-2026-11-21.log).

## Cronologia

| Ora | Evento |
|---|---|
| 09:31 | M. Verdi (operatore del magazzino) accede dall'ufficio come ogni mattina |
| 10:05 | Il SIEM segnala un volume di esportazione insolito sull'account di M. Verdi |
| 10:12 | Primo accesso anomalo all'account di M. Verdi da un indirizzo esterno (203.0.113.77) |
| 10:30 | L'amministratore reimposta la password di M. Verdi: l'attaccante è fuori |
| 10:40 | Ricreata la VM dall'immagine pulita; cancellato l'archivio locale dei log, che occupava il disco, per ripartire puliti |
| 11:15 | Il portale torna disponibile |

## Analisi

- **Causa**: attacco a forza bruta sulla password di M. Verdi, che era debole.
- **Account coinvolti**: solo quello di M. Verdi.
- **Dati**: l'esportazione delle 09:58 l'ha fatta M. Verdi dall'ufficio, prima dell'accesso dell'attaccante: nessun dato è uscito. L'attaccante ha visto solo l'elenco degli ordini.
- **Obblighi**: i clienti del portale sono aziende, quindi non ci sono dati personali né obblighi di notifica.

## Azioni

- Password di M. Verdi reimpostata (fatto).
- VM ricreata dall'immagine pulita (fatto).
- Promemoria a tutti gli operatori sulle password robuste (da fare).

## Stato

Incidente chiuso il 21 novembre 2026.
