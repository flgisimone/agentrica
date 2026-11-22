# Audit

Un audit è una cartella `audit/<audit_id>/`, dove `audit_id` è la data (`AAAA-MM-GG`) con un suffisso se nello stesso giorno ce n'è più d'uno (`AAAA-MM-GG-privacy`).

| File | Contenuto |
|---|---|
| `<ruolo>.json` | rilievi di un agente, nel formato JSON del suo file di ruolo in `agents/` |
| `report-<agenzia>.md` | resoconto consolidato del direttore dell'agenzia: priorità, backlog proposto, decisioni per l'utente |
| `evidenze/` | screenshot, resoconti axe, alberi accessibili, log usati come prova |

Regole:

- Ogni rilievo ha evidenza, priorità P0–P3 motivata e raccomandazione; un rilievo è una proposta finché l'utente non lo conferma.
- Le decisioni prese sull'audit vanno nella tabella «Decisioni» di `plan/README.md`; i rilievi accettati diventano attività di una fase.
- Le evidenze si catturano su dati finti. Se mostrano dati personali, si attiva la riga `audit/*/evidenze/` del `.gitignore`.
