# Report F29 — ricontrollo dei rilievi e revisione delle funzioni nuove

Data: 2026-11-19. Codice: `@agentrica/mcp` 0.8.0 (branch `fase/f29-configura-valuta`) e `agentrica-site` sullo stesso branch. Ruoli: privacy (GDPR Specialist, Data Governance, Legal), cybersecurity (Security Architect, AppSec, Vulnerability Management), sola lettura.

## Ricontrollo dei rilievi di `audit/` (F29-01)

Tutti i 29 rilievi dei due audit del 2026-11-15 ricontrollati sul codice di oggi. L'esito, con la data e l'evidenza, è nel campo `ricontrollo_f29` di ogni rilievo nei JSON; lo `stato` originale non cambia.

| Esito | Rilievi |
|---|---|
| Confermato | PRIV-MCP-01..06, SEC-ARCH-02..08, SEC09-F5-01..03, SEC09-F5-05..07, PRIV-PUB-02, PRIV-PUB-03, SEC-REL-01, SEC-REL-02, SEC-REL-05 |
| Confermato, rischio ancora accettato | PRIV-PUB-01 (Vercel Hobby senza DPA, da valutare con un legale), SEC-REL-03 (CSP con `'unsafe-inline'`), SEC-REL-04 (transitivi dell'SDK a range) |
| Confermato, parte rinviata ancora aperta | SEC-ARCH-01: la revisione obbligatoria del code owner resta spenta con un solo collaboratore |
| Chiuso in F29 | SEC09-F5-04: typescript-eslint 8.73.0 chiede minimatch ^11.0.1, la versione corretta; deepmerge e ts-morph non ci sono più. Aggiornato con la conferma dell'utente: `npm audit` a 0 |

Controlli usati: `npm audit --omit=dev` (0) e `npm audit` (7 moderate, tutte minimatch 10.2.6 sotto typescript-eslint 8.72.2; 0 dopo l'aggiornamento), `npm view` delle ultime versioni, ruleset e ambienti con l'API di GitHub, `release.yml`, `ci.yml`, `CODEOWNERS`, `content.ts`, le regole comuni dei reparti, `npm run verify` nei due repository ed e2e `pubblicazione.spec.ts` e `progetti.spec.ts`.

## Requisiti delle funzioni nuove

Proposti prima del design e confermati dall'utente (plan/29-configura-valuta.md). Verifica sul codice:

| # | Dove | Prova |
|---|---|---|
| PRIV-CFG-01 | `config.ts`: solo `version`, `agents`, `panel`, `ratings`, `updateCheck` | `config.test.ts` (parseConfig rifiuta altre chiavi; contenuto scritto) |
| PRIV-CFG-02 | messaggio del modulo, README IT ed EN, note legali del sito | testo del modulo in `config.test.ts` |
| PRIV-CFG-03 | `ratings: true` accende solo modulo e tool; ogni invio resta con conferma | prove di F20 e F23 invariate |
| SEC-CFG-01 | percorso da `os.homedir()`, nessuna variabile propria | i test cambiano `HOME`/`USERPROFILE` |
| SEC-CFG-02 | 4 KB, chiavi e tipi, squadra con `selectSquad`; non valido = mancante con una riga su stderr senza contenuto | `config.test.ts` |
| SEC-CFG-03 | cartella 0700, temporaneo 0600, `rename` | `config.test.ts` (permessi, nessun temporaneo) |
| SEC-CFG-04 | `canUseConfig` con il permission model | `server.test.ts` gira con `--permission` e non tocca il file |
| SEC-CFG-05 | `parseConfigForm` e `selectSquad` prima di salvare | `config.test.ts` (squadra non valida: niente file) |
| PRIV-PRJ-01 | consenso e licenza obbligatori nel modulo, nel tool e nella route; nome facoltativo | `showcase.test.ts`, `projects.test.ts` del sito |
| PRIV-PRJ-02 | `004-projects.sql`: 90 giorni in attesa (`purge_projects` nel job), rifiuto cancella, approvazione toglie il testo | da provare su Neon dopo l'esecuzione dello script SQL |
| PRIV-PRJ-03 | codice all'invio, `rimuovi`, `withdraw_project`, segnalazione in `npm run projects` | `showcase.test.ts`; lato database da provare su Neon |
| PRIV-PRJ-04 | note legali, sezione «I progetti degli utenti» | e2e `pubblicazione.spec.ts` verde |
| SEC-PRJ-01 | `parseProjectFields` (server MCP) e `parseSubmission` (route), corpo 4 KB, SQL in funzione | test dei due repository |
| SEC-PRJ-02 | `project_daily_sends`, 3 al giorno con l'hash del sale del giorno | da provare su Neon |
| SEC-PRJ-03 | `httpsUrl` / `isHttpsUrl`, `rel="nofollow ugc"`, dominio nella scheda | e2e `progetti.spec.ts` (scheda finta dal server MCP) |
| SEC-PRJ-04 | UUID casuale, ritiro senza esito, ref pubblico come impronta del codice | `showcase.test.ts`, `004-projects.sql` |

## Non verificato

- Le funzioni SQL di `004-projects.sql` non sono ancora eseguite su Neon: limite, ritiro, approvazione e pulizia si provano dopo che l'utente esegue lo script (db/README.md).
- Il modulo dell'elicitation in Claude Code da terminale e nell'estensione VS Code (F29-07): serve riavviare il server MCP nella sessione dell'utente.
