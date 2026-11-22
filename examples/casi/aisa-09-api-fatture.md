# Caso AISA-09 · REGULUS su api-fatture

- **Agente**: AISA-09 · REGULUS, Senior Application Security Engineer (`aisa-09`)
- **Progetto**: [`progetti/api-fatture`](../progetti/api-fatture/), API multiutente in Node senza dipendenze, in quattro file
- **Perché**: i difetti di [api-note](aisa-09-api-note.md) sono evidenti; qui sono sottili (controlli presenti in un ramo e assenti in un altro, configurazioni plausibili) e ci sono parti corrette che sembrano sospette, per misurare i falsi positivi.
- **Compito** (argomento `task`, da copiare così com'è):

  > Esegui una revisione di sicurezza di questa API e riporta i rilievi con gravità, file e riga.

## Difetti attesi

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| S1 | `GET /invoices/:id` non controlla il proprietario: un utente legge le fatture degli altri (il PDF e la modifica lo controllano, il dettaglio no) | `src/server.js`, ramo GET del dettaglio | OWASP A01, CWE-639 |
| S2 | Mass assignment: `PATCH` copia tutto il corpo nella fattura (`Object.assign`), così si cambiano `ownerId`, `status` e `id` e si salta la validazione di `amount` | `src/invoices.js`, `update` | OWASP A01/A08, CWE-915 |
| S3 | CORS riflette qualsiasi `Origin` con `allow-credentials`: un sito qualunque legge le fatture dell'utente collegato | `src/server.js`, `cors` | OWASP A05, CWE-942 |
| S4 | Cookie di sessione senza `HttpOnly`, `Secure` e `SameSite` | `src/auth.js`, `login` | OWASP A05, CWE-1004, CWE-614 |
| S5 | Token di sessione da `Math.random()` e `Date.now()`: prevedibile | `src/auth.js`, `newToken` | OWASP A02, CWE-338 |
| S6 | Password con SHA-256 senza sale né funzione lenta | `src/store.js`, `hashPassword` | OWASP A02, CWE-916 |
| S7 | Il login scrive nel log il corpo con la password in chiaro | `src/server.js`, ramo `/login` | OWASP A09, CWE-532 |
| S8 | Enumerazione degli utenti: «Utente inesistente» e «Password errata» sono messaggi diversi | `src/auth.js`, `login` | CWE-204 |
| S9 | CSV injection nell'esportazione: `customer` entra nel CSV senza escape (formule come `=HYPERLINK(...)`, e un `;` sposta le colonne) | `src/invoices.js`, `exportCsv` | CWE-1236 |

## Trappole: codice corretto da non segnalare come difetto

| # | Cosa | Perché è corretto |
|---|---|---|
| T1 | Download del PDF | controlla il proprietario e usa `basename`, quindi niente path traversal |
| T2 | Chiave dell'amministrazione | dalla variabile d'ambiente, confronto con `timingSafeEqual` dopo il controllo della lunghezza, vuota = negata |
| T3 | Corpo delle richieste | limite di 64 KB con 413 |
| T4 | Errori | lo stack va solo nel log del server, al client un messaggio generico |

Un rilievo che presenta T1–T4 come vulnerabilità conta come **falso**. Un consiglio di irrobustimento su di essi (per esempio un 500 invece di 400 per gli errori interni) non è un falso.

Accettabili ma non richiesti: nessun rate limiting sul login, CSRF (conseguenza di S3 e S4), sessioni solo in memoria, importo negativo accettato, nessun HTTPS o HSTS, utenti di prova con password nel sorgente (dichiarati nel README).
