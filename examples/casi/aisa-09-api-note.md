# Caso AISA-09 · REGULUS su api-note

- **Agente**: AISA-09 · REGULUS, Senior Application Security Engineer (`aisa-09`)
- **Progetto**: [`progetti/api-note`](../progetti/api-note/), API REST in Node senza dipendenze
- **Compito** (argomento `compito`, da copiare così com'è):

  > Esegui una revisione di sicurezza di questa API e riporta i rilievi con gravità, file e riga.

## Difetti attesi

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| S1 | `DELETE /notes/:id` non controlla il token: chiunque cancella le note | `server.js`, ramo DELETE | OWASP A01 Broken Access Control |
| S2 | Path traversal: `name` di `/attachments` entra in `join()` senza controllo (`?name=../package.json` legge file fuori da `allegati/`) | `server.js`, ramo attachments | OWASP A01, CWE-22 |
| S3 | Token dell'API scritto nel sorgente invece che in una variabile d'ambiente | `server.js`, `API_TOKEN` | OWASP A07, CWE-798 |
| S4 | Lo stack trace dell'errore torna al client (provato con un corpo non JSON) | `server.js`, `catch` in `createServer` | OWASP A05, CWE-209 |
| S5 | Corpo della richiesta letto senza limite di dimensione: una richiesta enorme riempie la memoria | `server.js`, `readBody` | CWE-400 |
| S6 | Nessuna validazione di `title` e `text` (tipo, presenza, lunghezza) | `server.js`, ramo POST | OWASP A03/ASVS V5 |

Accettabili ma non richiesti: confronto del token non a tempo costante, assenza di rate limiting, note solo in memoria, un solo token condiviso dal team (nessuna attribuzione né revoca per persona; extra valido del 2026-11-15), `204` inviato con un corpo.
