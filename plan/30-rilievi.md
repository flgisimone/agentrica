# F30 — Rilievi aperti

**Obiettivo**: chiudere tutti i rilievi aperti da F16 a F29 e degli audit di `audit/`, con un'evidenza per ciascuno. Un rilievo si chiude quando è corretto, provato o accettato dall'utente con il motivo e la condizione per riaprirlo. Alla fine della fase il pannello deve mostrare soltanto ciò che dipende da fatti esterni: un PC Windows, voti e progetti reali.

> **Stato: completata** (aperta il 2026-11-21, chiusa il 2026-11-22, branch `fase/f30-rilievi` nei due repository). Il branch del pacchetto parte da `docs/f29-rilascio` (a451b8d, il piano del rilascio 0.8.0), che entra in `develop` con questa fase. Senza rilascio: le correzioni del pacchetto restano in `develop`; quelle del sito vanno online con il prossimo merge in `main` di `agentrica-site`, dopo il quale si fa P5.

**Agenzie**: software (Backend, Frontend, DevOps, QA, Security, Code Reviewer); privacy (Vendor Compliance per il DPA di Neon); cybersecurity (Cloud Security per i ruoli del database); design (Accessibility per AIWDA-08, UI Designer per i rilievi di F28).

## Situazione di partenza

Ricontrollo del 2026-11-21 sul codice di `fase/f30-rilievi` (pacchetto 0.8.0, sito 0.8.0 in produzione), sul sito pubblico e sulla shell del titolare. Il database di produzione non è stato letto.

Chiusi dal ricontrollo (**F30-01**):

| Rilievo | Evidenza |
|---|---|
| F20 · `npm audit` di sviluppo (minimatch, tinyglobby) | chiuso in F29 con SEC09-F5-04: typescript-eslint 8.73.0, `npm audit` a 0 |
| F21 · `DATABASE_URL_READONLY` e `DATABASE_URL_MODERATOR` mancanti | presenti nell'ambiente della shell del titolare |
| F22 · sito in produzione con il merge in `main` | `origin/main` = `origin/develop` (00571cd); `/installa` mostra `@agentrica/mcp@0.8.0` |
| F22 · «high access» nel badge | è il giudizio di mcprush su un server locale: nessuna azione, chiuso |
| F25 · voce del CHANGELOG sulla biblioteca | `packages/mcp/CHANGELOG.md`, sezione 0.7.0 |
| F27 · 0.7.0 nel registro MCP | superato: `io.github.flgisimone/agentrica` 0.8.0 è latest (F29) |

Confermati aperti: tutti gli altri rilievi, raccolti nel backlog. Le verifiche fatte:

- `MAX_ACTIVITY = 20` in `packages/mcp/src/panel.ts:77` (F20).
- `add` e `install` non avvisano del doppio ambito (`setup.ts:104-105`) (F23).
- Il README inglese non ha la sezione «Modelli consigliati» (F26-R2).
- Nessuno dei subagent di `.claude/agents/` cita la biblioteca (F25).
- Le regole comuni non parlano di processi da fermare per PID (F24).
- Il rilevatore controlla solo l'indirizzo finale dopo i redirect (`scripts/study.ts:22-23`) (F25).
- `/reputazione` e `/progetti` rispondono 404 perché sono sotto le soglie (F21, F26).

## Decisioni dell'utente all'apertura (2026-11-21)

- **Revisione legale**: PRIV-PUB-01, il DPA di Neon e le note legali di F20, F21, F22, F23, F26 e F27 si chiudono come rischio accettato, senza dossier per un legale. Il DPA di Neon si verifica prima sulle fonti.
- **Rischi già accettati**: route e job tornano al privilegio minimo (`ratings_writer`, `ratings_purger`). Si chiudono come rischio accettato, con il motivo e la condizione per riaprirli, SEC-REL-03, SEC-REL-04, SEC-ARCH-01, F17-R1 e PRIV-PUB-02.
- **Misure di F24**: in questa fase entrano solo le correzioni (AIWDA-08, regola sui processi, metodo). Le misure dei 50 ruoli non provati vanno in una fase dedicata.
- **Prove sull'ambiente dell'utente**: sì, con una lista guidata, tranne Windows. F23-10 resta aperto finché non c'è un PC Windows.

## Backlog

Confermato dall'utente il 2026-11-21, senza il rilascio: F30-14 è tolto e le correzioni restano in `develop` fino a un rilascio futuro.

| # | Task | Priorità |
|---|---|---|
| F30-01 | Ricontrollo delle voci F20–F29 sul codice (fatto all'apertura, tabella sopra) | P2 |
| F30-02 | Privilegio minimo del database: `005-grants.sql` dà a `ratings_writer` anche `submit_project` e `withdraw_project`. Le route `ratings`, `usage`, `projects` e `projects/withdraw` usano `RATINGS_WRITER_URL`, il job `ratings/purge` usa `RATINGS_PURGER_URL`; senza variabile rispondono 503 come oggi senza `DATABASE_URL`. Si aggiornano `db/README.md` e i test delle route. L'utente esegue lo script e imposta le variabili Sensitive su Vercel, poi si verifica in produzione | P2 |
| F30-03 | DPA di Neon: controparte (Neon o Databricks), trasferimenti fuori dallo SEE e garanzie, dalle pagine ufficiali con data; note legali corrette se serve; poi rischio accettato | P2 |
| F30-04 | Rischi accettati: si chiudono con «Chiuso: rischio accettato dall'utente (2026-11-21), riaprire se …» PRIV-PUB-01, SEC-REL-03, SEC-REL-04, PRIV-PUB-02 e SEC-ARCH-01 (campo `stato` dei JSON), F17-R1 e le note legali non rilette di F20, F21, F22, F23, F26, F27 | P2 |
| F30-05 | AIWDA-08: chiarire nel file di ruolo i criteri WCAG 2.2 che Sonnet confonde (2.4.11 e 2.4.13, 3.3.7 e 3.3.8); nuova misura del solo AIWDA-08 su Sonnet con il metodo di F24 | P2 |
| F30-06 | Regole comuni dei cinque reparti: fermare solo i processi avviati da sé, per PID, mai `pkill` per nome. Metodo delle misure in `examples/`: rapporto restituito invece che scritto in un file, gruppi da 7 | P3 |
| F30-07 | Rilevatore della biblioteca: `redirect: "manual"`, ogni salto controllato con `inDomains` prima di seguirlo, con un limite di salti; test in `study-lib.test.ts` | P3 |
| F30-08 | Server MCP: `add --local` o `--project` avvisano se Agentrica è già registrato con ambito user (e `install` il contrario); test in `setup.test.ts` | P3 |
| F30-09 | Pannello: le ultime chiamate per agente, non le ultime 20 in assoluto, perché ogni agente usato nella sessione resti valutabile; test in `panel.test.ts` | P3 |
| F30-10 | README inglese: sezione «Recommended models» come quella italiana (F26-R2); subagent di `.claude/agents/` e dello starter: una riga che rimanda alla biblioteca del reparto (F25) | P3 |
| F30-11 | Sito: un errore del database non resta in cache per un'ora (rilettura a breve dopo un errore, F21); misura dei progetti (F26-R3) come riepilogo in `npm run projects`; rilievi F28-R1, R2, R3 rivisti dal UI Designer e chiusi o corretti | P3 |
| F30-12 | Voci da chiudere con una decisione: due schede invece di tre in `/installa` (F23); grafici senza tooltip (F27); soglia che conta gli invii (F27); moderazione dei commenti con dati del progetto (F20); schede ETSI EN 301 549 e D.lgs. 82/2022 e controllo a mano delle fonti non raggiungibili (F25); soglia dei 300 ms (F29) | P3 |
| F30-13 | Prove guidate dell'utente, con l'esito atteso scritto qui. 004-projects.sql su Neon: limite, ritiro, approvazione e pulizia con una proposta di prova. Moduli e comandi `valuta`, `configura`, `progetto` in Claude Code da terminale. Pannello multipagina in una sessione vera (F16). Badge di mcprush sulla 0.8.0. Variabili `RATINGS_*` su Vercel dopo F30-02. Ogni prova chiude il suo rilievo | P2 |

Restano aperti alla chiusura, per decisione dell'utente: il rilascio delle correzioni (dopo 0.8.0); F23-10 (prova su Windows, P1); la misura dei 50 ruoli di F24, rinviata a una fase dedicata; le statistiche della reputazione e i progetti in produzione, che si vedono solo sopra le soglie (F21, F26).

## Prove guidate (F30-13)

Le esegue l'utente. Ogni prova chiude il rilievo indicato quando l'esito è quello atteso; un esito diverso diventa un rilievo nuovo. Solo dati di prova riconoscibili, nessun dato personale.

### P1 · Moduli e comandi in Claude Code da terminale (F29, «Moduli da terminale»)

Con il pacchetto pubblicato 0.8.0, in una cartella di prova fuori dai repository.

1. `mkdir -p ~/prova-agentrica && cd ~/prova-agentrica && npx -y @agentrica/mcp@0.8.0 add --local`, poi `claude` e approva il server.
2. Scrivi «elenca gli agenti di Agentrica». **Atteso**: alla prima chiamata compare nel terminale il modulo della configurazione (squadra, pannello, valutazioni, avviso di versione). Conferma senza cambiare nulla, poi da un altro terminale `cat ~/.agentrica/config.json`: solo `version`, `agents`, `panel`, `ratings`, `updateCheck`.
3. `/mcp__agentrica__configura`. **Atteso**: il modulo si riapre con i valori salvati; cambia «pannello», conferma, e `config.json` cambia solo in quel campo.
4. `/mcp__agentrica__aisa-02-software "Descrivi in tre righe la struttura di questa cartella"`, poi `/mcp__agentrica__valuta`. **Atteso**: il modulo di valutazione nomina AISA-02 · ALTAIR; chiudilo con Esc e il modello dice che non parte nulla.
5. Alla fine: `claude mcp remove agentrica --scope local` e, se vuoi tornare a prima, `rm -r ~/.agentrica ~/prova-agentrica`.

### P2 · Proposte di progetti su Neon (F29, «Progetti su Neon»; PRIV-PRJ-02, PRIV-PRJ-03, SEC-PRJ-02)

Nella sessione di P1, prima del punto 5. Le proposte vanno al sito in produzione: usa sempre il nome «Prova F30», il link `https://agentrica.vercel.app` e la descrizione «Proposta di prova da rifiutare».

1. `/mcp__agentrica__progetto`, compila, dai consenso e licenza e conferma l'anteprima. **Atteso**: «Proposta del progetto «Prova F30» inviata ad Agentrica» con il codice della proposta (UUID); annotalo come codice A.
2. In `../agentrica-site`: `npm run projects`. **Atteso**: «Da approvare: mcp:<ref>: Prova F30 — Proposta di prova da rifiutare».
3. `/mcp__agentrica__progetto rimuovi <codice A>`, poi di nuovo `npm run projects`. **Atteso**: «Richiesta di ritiro registrata» e la proposta non compare più.
4. Invia altre tre proposte uguali (B, C, D). **Atteso**: B e C ricevute, D non parte con «Limite di proposte di oggi raggiunto da questa rete» (3 al giorno per rete, contando A).
5. `npm run projects -- --add mcp:<ref di B>`: **atteso** «Approvato mcp:<ref>: Prova F30» e B in `src/data/projects.json` con la data di oggi. Poi `npm run projects -- --decline mcp:<ref di B>` e `npm run projects -- --decline mcp:<ref di C>`: **atteso** «Rifiutato o tolto» e nessuna delle due fra quelle da approvare.
6. `git checkout src/data/projects.json` in `agentrica-site`: le prove non si pubblicano.

La pulizia dopo 90 giorni non si prova ora: il job che la chiama si prova in P5.

### P3 · Pannello multipagina in una sessione vera (F16; anche F30-09)

In questo repository, dove `agentrica-dev` gira dal codice di `fase/f30-rilievi` con il pannello.

1. Apri una sessione di Claude Code nella cartella `agentrica`, chiedi «aprimi il pannello di Agentrica» e apri l'URL.
2. **Atteso**, pagina Piano: F30 «in corso» con il suo backlog. Pagina Rilievi: restano solo le voci elencate in «Restano aperti alla chiusura» più le prove ancora da fare. Pagina Sessione: gli agenti usati, con il modulo di valutazione per ciascuno.

### P4 · Badge di mcprush (F22)

Apri `https://mcprush.com/to/agentrica-mcp`. **Atteso**: versione 0.8.0. Se mostra ancora una versione vecchia, il rilievo resta aperto: dipende da mcprush.

### P5 · Dopo il merge in `main` e il deploy del sito (F30-02, F30-03)

Le può lanciare la sessione, sono richieste senza dati:

1. `curl -s -X POST https://agentrica.vercel.app/api/projects/withdraw -H 'content-type: application/json' -d '{"code":"00000000-0000-4000-8000-000000000000"}'`. **Atteso**: `Registrato.` (200). Esegue `withdraw_project` come `ratings_writer`: prova la variabile e il permesso di `005-grants.sql` senza creare righe. Con 503 manca la variabile, con 500 manca il permesso.
2. Vercel → progetto `agentrica` → Settings → Cron Jobs → Run su `/api/ratings/purge` (lo fa l'utente). **Atteso**: JSON con `deleted` e `projects`. Prova `RATINGS_PURGER_URL` e la pulizia dei progetti.
3. `https://agentrica.vercel.app/note-legali`: nella sezione delle valutazioni c'è la frase su Neon, Databricks e trasferimenti.

### Esiti

- **P1** superata (2026-11-22, Claude Code 2.1.330 da terminale, pacchetto 0.8.0): modulo alla prima chiamata, `config.json` con `version`, `agents`, `panel`, `ratings`, `updateCheck`; `configura` riaperto con i valori salvati, cambiato solo `panel`; `valuta` con il modulo di AISA-02 · ALTAIR, Esc senza invio.
- **P2** superata (2026-11-22): A inviata e ritirata (sparisce subito da `npm run projects`), ref `mcp:22357c9f965e` uguale allo SHA-256 del codice; B e C inviate, D bloccata dal limite; B approvata (scritta in `projects.json`), B e C rifiutate (in `declined`), file ripristinato con `git checkout`. Due rilievi P3 nuovi: R1 e R2 sotto.

- **P3**, pagina Rilievi (2026-11-22): il pannello ne mostrava 23. Il ricontrollo di apertura aveva saltato le sezioni di F6, F10, F13, F14, F15 e F18, e alcune voci chiuse in F30 erano scritte «Superato» o «Verificato», che il pannello non conta come chiuse. Corretto: F6 (minimatch, deepmerge, chiusi in F29), F10 (rischi accettati in F30-04), F13 e F15-03 unite alla voce di F24 sulle misure (scelta dell'utente), brillio dei glifi entro 5 secondi (WCAG 2.2.2, scelta dell'utente, `globals.css` del sito), F18-R1 con un test che tiene uguali le due copie del quadro delle agenzie (scelta dell'utente), testo delle voci di F20. Restano 10 voci. `verify` nei due repository ed e2e `agenti` e `landing` verdi.

- **P3** superata (2026-11-22): pagina Sessione con AISA-02 · ALTAIR attivo, il compito e il modulo di valutazione (voto, commento, pubblicazione spenta, informativa); pagina Rilievi con 10 voci. Chiuse le voci di F14, F15 (F15-09) e F16.

- **P4** superata (2026-11-22): mcprush mostra Agentrica MCP v0.8.0 · 21 Nov 2026, Grade A, Local · stdio, 8 tools, MIT. Chiusa la voce di F22.

- **P5** superata (2026-11-22, dopo il rilascio del sito: PR #12 di `agentrica-site`, `main` e `develop` su 967a2c1). Ritiro con un codice inventato: `Registrato.` (200), quindi `RATINGS_WRITER_URL` e il permesso di `005-grants.sql` funzionano senza creare righe; una valutazione vuota su `/api/ratings` risponde 400, non 503. Run del job da Vercel: `GET /api/ratings/purge` 200 da `vercel-cron/1.0`, quindi `RATINGS_PURGER_URL`, `purge_ratings()` e `purge_projects()`. Note legali in produzione con la frase su Neon e Databricks. Chiusa la voce di F20 sulle credenziali del proprietario.

### Rilievi nuovi delle prove

- **F30-R1 (P3)** Il testo scritto dopo `/mcp__agentrica__progetto` è l'argomento `rimuovi`: chi scrive il nome del progetto riceve «il codice della proposta non è valido». Il messaggio potrebbe dire anche che per proporre un progetto il comando va lanciato senza argomenti. Chiuso in F30 (scelta dell'utente, 2026-11-22): il messaggio dice come proporre un progetto, senza ripetere il testo scritto; test in `showcase.test.ts`.
- **F30-R2 (P3)** `npm run projects -- --add` scrive la data di approvazione in UTC (`toISOString`): fra mezzanotte e l'una (le due d'estate) segna il giorno prima. Chiuso in F30 (scelta dell'utente, 2026-11-22): `dayInRome` in `src/lib/projects.ts` del sito, usato da `scripts/projects.ts`; test con mezzanotte e ora legale.
- **F30-R3 (P3)** Il log di P5 mostra le funzioni del sito a Washington (iad1) e il database a Francoforte: i dati delle route attraversano gli Stati Uniti e ogni chiamata al database fa due volte l'oceano. Correzione chiesta dall'utente il 2026-11-22: `regions: ["fra1"]` in `vercel.json` di `agentrica-site` (branch `fix/regione-fra1`), rilascio in `main` e prova sull'header `x-vercel-id`. Chiuso il 2026-11-22: PR #13 di `agentrica-site` (`main` e `develop` su a9ac844); in produzione `x-vercel-id: fra1::fra1::…` e il ritiro di prova risponde `Registrato.` (200).

## Criteri di accettazione

- Ogni rilievo dell'elenco del 2026-11-21 è chiuso con un'evidenza (commit, file, test, prova dell'utente o decisione scritta), oppure resta aperto con uno dei motivi elencati sopra.
- I JSON di `audit/` cambiano solo nel campo `stato`.
- Le modifiche ad `agents/` (F30-05, F30-06) passano dalla conferma dell'utente.
- Con F30-02 nessuna route né il job usano più `DATABASE_URL`; prova in produzione dopo le variabili.
- `npm run verify` nei due repository e `npm run verify:e2e` nel sito verdi; Code Reviewer sul diff.

## Fatto

- **F30-01** (2026-11-21): ricontrollo all'apertura (tabella in «Situazione di partenza»); le voci saltate di F6, F10, F13, F14, F15 e F18 recuperate durante P3.
- **F30-02** (2026-11-21): le route e il job usano `RATINGS_WRITER_URL` e `RATINGS_PURGER_URL`, con un test che vieta `DATABASE_URL` (`ratings.test.ts`); `db/005-grants.sql` eseguito su Neon dall'utente; password dei due ruoli reimpostate e `RATINGS_WRITER_URL` (Production, Preview) e `RATINGS_PURGER_URL` (Production) impostate Sensitive su Vercel dall'utente. Manca la prova in produzione dopo il deploy.
- **F30-03** (2026-11-21): DPA di Neon verificato sulle fonti. [Product Specific Schedule (Neon)](https://neon.com/platform-terms), aggiornato il 14/10/2026: controparte Databricks, Inc. (madre di Neon, LLC); DPA di Databricks incluso tramite il [MCSA](https://www.databricks.com/legal/mcsa), senza firma; sezione 7 (audit) sostituita da SOC 2 e sintesi dei penetration test; Grafana Labs (USA) come sub-responsabile. [FAQ sui trasferimenti](https://www.databricks.com/legal/tia-faq) (23/04/2026): SCC 2021 nel DPA e Data Privacy Framework UE-USA. [Sub-responsabili](https://www.databricks.com/legal/databricks-subprocessors) (09/06/2026): AWS nella regione scelta, supporto e società del gruppo anche fuori dallo SEE. Note legali, sezione delle valutazioni: aggiunti controparte, DPA e trasferimenti (scelta dell'utente); e2e `pubblicazione.spec.ts` verde. Non confermato: che il piano gratuito sia coperto dal «Self Service Plan»; testo del PDF del DPA non leggibile. Rischio residuo accettato dall'utente (2026-11-21), insieme alle note legali (F30-04).
- **F30-05** (2026-11-21, testo confermato dall'utente): paragrafo sui criteri nel «Metodo» di `08-senior-accessibility-specialist.md` (2.4.7 e non 2.4.11/2.4.13; 1.3.5 e non 3.3.7; criterio incerto «da confermare»). Nuova misura su Sonnet: 8/8 e 0 falsi in due esecuzioni, come Opus ([examples/risultati/2026-11-21-aiwda-08.md](../examples/risultati/2026-11-21-aiwda-08.md)). AIWDA-08 resta `inherit`: il risultato vale per il caso su cui è stato scritto il chiarimento; serve un secondo caso, nella fase delle misure.
- **F30-06** (2026-11-21, testo confermato dall'utente): regola sui processi fermati per PID nei cinque `00-common-rules.md`; in `examples/README.md` rapporto restituito come risposta e gruppi di al più 7 esecuzioni. Usato già nella misura di F30-05 (firma presente in entrambi i rapporti).
- **F30-07** (2026-11-21): `scripts/study.ts` scarica con `redirect: "manual"` e segue al più 5 redirect, ciascuno controllato da `redirectTarget` (`study-lib.ts`: solo https nei domini della fonte, Location relativa risolta) prima della richiesta; test in `study-lib.test.ts`. `npm run study` sulle fonti vere: nessuna fonte non letta.
- **F30-08** (2026-11-21): `registeredScopes` in `setup.ts` legge `~/.claude.json` (user e local) e `./.mcp.json` (project); dopo la registrazione `add` e `install` avvisano per ogni altro ambito con «agentrica», con il comando `claude mcp remove`. Senza effetti: legge solo, un file illeggibile non conta. Test in `setup.test.ts`; provato in sola lettura sui file veri (nessuna voce «agentrica» oggi su questa macchina, solo `agentrica-dev`). README IT ed EN, «Aggiornare e disinstallare».
- **F30-09** (2026-11-21): `keepActivity` in `panel.ts` tiene le ultime 20 chiamate più l'ultima di ogni agente uscito da quelle (al più 20 più una per agente del catalogo); l'elenco «Agenti in uso», i moduli di valutazione e il controllo di `/api/rate` vedono quindi ogni agente usato nella sessione. Test in `panel.test.ts`.
- **F30-10** (2026-11-21): sezione «Recommended models» nel README inglese, uguale all'italiana (F26-R2). Nei 56 subagent di `.claude/agents/` una riga che rimanda alle schede `.md` della biblioteca del reparto (non a `fonti.json`, che non va al modello); `init` le copia nei progetti nuovi (F25).
- **F30-11** (2026-11-21): `reputation-data.ts` e `usage-data.ts` (stesso schema) a runtime rilanciano l'errore del database invece di un risultato vuoto, così né `unstable_cache` né l'ISR lo salvano e Next serve l'ultima pagina generata; al build (`NEXT_PHASE`) restano vuoti. Provato: build con un database irraggiungibile riuscito; `next start` con lo stesso indirizzo, pagine 200 e 404 corretti. La rigenerazione dopo un'ora con il database giù non è provata (comportamento documentato di Next). F26-R3 chiuso senza codice (nessun progetto, scelta dell'utente). F28-R2: sigle della mappa a 30 unità sotto `sm`, circa 16 px invece di 11, `overflow-visible` sul `svg`; screenshot prima e dopo in `audit/2026-11-21-f30/evidenze/`. F28-R1 e R3 accettati dall'utente. `verify` e `verify:e2e` del sito verdi (102 e2e); quattro e2e di `consumo` erano falliti per una cache di `next dev` lasciata dalla prova delle sigle, verdi dopo averla cancellata.
- **F30-12** (2026-11-21): decisioni dell'utente. Due schede in `/installa` (F23); grafici di `/consumo` senza tooltip e soglia sugli invii accettati (F27); soglia dei 300 ms accettata (F29). Moderazione dei commenti con dati del progetto (F20) chiusa con l'evidenza di `npm run ratings -- --moderate`. Schede AIWDA `02-en-301-549-v4.md` e `03-accessibilita-prodotti-servizi.md` aggiornate (testo confermato), da EUR-Lex (decisione 2021/1339), pagine della Commissione sulle norme armonizzate, Normattiva (art. 1 e 2 del D.lgs. 82/2022) e FAQ di AgID. Fonti di F25: EUR-Lex raggiungibile; OECD, ISO e Gartner rispondono 403 e restano per la prossima sessione di studio.
- **F30-04** (2026-11-21): chiusi come rischio accettato, con la condizione per riaprirli, PRIV-PUB-01, PRIV-PUB-02, SEC-REL-03, SEC-REL-04 e SEC-ARCH-01 (solo il campo `stato` dei JSON), F17-R1, le note legali di F20, F21, F22, F23, F26 (F26-R4) e F27, e la riga di SEC-ARCH-01 in F29; voce «Rischi accettati» nelle decisioni di `plan/README.md`. Chiuse nei file delle fasi anche le voci di **F30-01**.
- **F30-13** (2026-11-22): prove guidate P1, P2, P3 e P4 superate (esiti in «Prove guidate»); due rilievi nuovi (F30-R1, F30-R2) corretti in fase. P5 si fa dopo il merge in `main` del sito.

## Verifiche

- Pacchetto: `npm run verify` verde, 147 test (2026-11-22).
- Sito: `npm run verify` verde, 63 test e build; `npm run verify:e2e` verde, 102 prove (2026-11-22, dopo aver cancellato una cache di `next dev` lasciata dalla prova delle sigle).
- Build del sito con un database irraggiungibile riuscito; `next start` con lo stesso indirizzo: pagine 200, inesistenti 404.
- `npm run study` sulle fonti vere: nessuna fonte non letta.
- Misura di AIWDA-08 su Sonnet: 8/8, 0 falsi in due esecuzioni.
- Prove dell'utente P1–P4 in Claude Code 2.1.330 (terminale ed estensione per VS Code), sul database di produzione e su mcprush.
- Code Reviewer (ruolo nella sessione principale) sul diff dei due repository: APPROVE, con un commento: su Windows l'avviso dell'ambito local di `add` può non scattare se Claude Code scrive la cartella in altra forma (annotato nel `ponytail:` di `setup.ts`, da rivedere con F23-10).
- Non verificato: la rigenerazione delle pagine dopo un'ora con il database giù (comportamento documentato di Next); il brillio di 5 secondi guardato a occhio; la registrazione doppia vera di `add` (cambierebbe la configurazione del titolare).

## Rilievi aperti

- (P2) Prova in produzione di F30-02 e F30-03 (P5): dopo il merge in `main` di `agentrica-site`, `curl` sul ritiro con un codice inventato (atteso `Registrato.`), Run del job su Vercel (atteso JSON con `deleted` e `projects`), frase su Neon nelle note legali. Chiude anche la voce di F20 sulle credenziali del proprietario. Chiuso il 2026-11-22: P5 superata (vedi «Esiti»).
- (P3) Correzioni del pacchetto (F30-07, F30-08, F30-09, F30-R1, README, subagent, regole comuni) senza rilascio: arrivano agli utenti con la prossima versione.

Restano aperti nelle loro fasi, per decisione dell'utente: F23-10 (Windows), le misure dei 50 ruoli (F24, con le voci di F13 e F15), le due voci di F21 sulle statistiche sopra le soglie, la verifica a mano di OECD, ISO e Gartner (F25).
