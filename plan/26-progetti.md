# F26 — Progetti degli utenti

**Obiettivo**: il sito mostra i progetti reali di chi ha usato Agentrica, su loro richiesta, al posto di «Messi alla prova», le prove fatte da noi, che vengono tolte dalla vetrina (i casi restano come prova interna).

> **Stato: completata** (2026-11-19). Idea e decisioni con l'utente il 2026-11-18, apertura e decisioni sulle proposte il 2026-11-19.

**Agenzie**: business (Product Manager per obiettivo e misura, Product Marketing per il badge); privacy (GDPR, Legal, Data Governance) per i dati di terzi pubblicati; cybersecurity (AppSec, Network Security) per i contenuti da GitHub e la CSP; design (Information Architect, UX Writer, UI Designer, Accessibility) prima e dopo; software (Frontend, Backend, DevOps, QA, Security, Code Reviewer).

## Situazione di partenza

- «Messi alla prova» c'è nella home del sito (`agentrica-site/src/app/page.tsx`, la tabella `trials` con il suo e2e in `e2e/landing.spec.ts`), nella sezione omonima del README del pacchetto (italiano e inglese) e nella cartella `examples/` (progetti, casi, risultati delle prove di F13), a cui rimandano i README. In `plan/README.md` la decisione «File di lavoro» nomina `examples/`.
- Regola del repository: niente persone, clienti, risultati o recensioni inventati. I progetti degli utenti sono reali, ma i risultati che dichiarano non li verifichiamo noi.
- Il sito ha già soglie che nascondono ciò che non c'è (reputazione, F21) e una CSP che carica immagini solo dal sito e da mcprush (F22).

## Decisioni dell'utente (2026-11-18)

| Tema | Decisione |
|---|---|
| Canale | Una issue su GitHub, con il modulo «Mostra il tuo progetto» nel repository pubblico: dopo l'approvazione il progetto entra in un file dati letto dal sito. In più il sito propone i repository pubblici con il topic `agentrica`, che entrano solo con l'approvazione del titolare |
| Dove | Pagina `/progetti` con tutti i progetti e un filtro per reparto; in home un'anteprima di 3 progetti con il link. Tutte e due nascoste finché non c'è almeno un progetto approvato |
| Prove | «Messi alla prova» si toglie in questa fase: la sezione e l'e2e del sito, la sezione dei due README del pacchetto, e i link a `examples/`. I casi di `examples/` restano nel repository come prova interna per confrontare modelli e versioni dei ruoli (F24): non si cancellano. I file delle fasi passate restano com'erano, come storia |
| Ordine | Dopo F25, quando installazione e avvisi (F23) hanno portato più utenti |

## Decisioni all'apertura (2026-11-19)

| Tema | Decisione |
|---|---|
| Flusso dei dati | Il sito non chiama GitHub. `npm run projects` nel repository del sito elenca le issue aperte con l'etichetta `progetto` e i repository col topic `agentrica` non ancora approvati né rifiutati; `--add <ref>` scrive il progetto validato in `src/data/projects.json`, `--decline <ref>` lo rifiuta o lo toglie. Niente token né ISR; `GITHUB_TOKEN` facoltativo per il limite delle richieste. La CSP non cambia |
| Backlog | Tutte e otto le voci |
| Scheda | Solo testo: nome, link (sempre `https://github.com/<proprietario>/<repository>`), descrizione (280 caratteri), reparti, agenti (10 al massimo), versione, data di approvazione, nome o handle (40 caratteri). Nessuna immagine. Nota «Descrizione e risultati sono dell'autore, non verificati da Agentrica» e link «Chiedi la rimozione» (issue già compilata) in ogni scheda |
| Testo da GitHub | Testo semplice su una riga: invisibili (`\p{Cc}`, `\p{Cf}`) tolti, niente `< > [ ] \``, URL o domini; un progetto non valido nel file ferma il build |
| Link ai modelli | Resta il link del README a `examples/risultati/2026-11-19-modelli.md` (prova della scelta dei modelli di F24): si tolgono solo la sezione «Messi alla prova» e i suoi link |
| Base giuridica | Issue: consenso (art. 6.1.a) e licenza con due caselle obbligatorie del modulo. Topic: legittimo interesse (art. 6.1.f), solo i dati pubblici del repository; il topic vale come richiesta, ci si oppone togliendolo e chiedendo la rimozione. Bilanciamento: dati già pubblici, topic aggiunto dal proprietario, nessun dato oltre quelli del repository |
| Rimozione | Entro 30 giorni, di solito appena letta la richiesta, con l'aggiornamento successivo del sito; i repository che non esistono più li segnala `npm run projects` |
| Badge | shields.io, «fatto con Agentrica» (IT) e «made with Agentrica» (EN), link alla home del sito: `/progetti` non esiste finché non c'è un progetto |
| Prove e2e delle pagine piene | Seconda istanza di Playwright con `next dev` e i progetti finti di `e2e/fixtures/projects.json` (`PROJECTS_FIXTURE`, solo in sviluppo), come `REPUTATION_FIXTURE` di F21 |

## Backlog

| ID | Attività | Priorità | Stato |
|---|---|---|---|
| F26-01 | Modulo issue «Mostra il tuo progetto», con consenso e licenza, e file dati dei progetti approvati | P1 | fatto |
| F26-02 | Lettura dei repository con il topic `agentrica`, con elenco da approvare per il titolare | P2 | fatto |
| F26-03 | Pagina `/progetti` con le schede e il filtro per reparto, nascosta senza progetti; link nel menu | P1 | fatto |
| F26-04 | Anteprima in home al posto di «Messi alla prova» | P1 | fatto |
| F26-05 | Rimozione di «Messi alla prova»: sezione ed e2e del sito, sezioni dei README IT ed EN e i loro link a `examples/` | P1 | fatto |
| F26-06 | Badge «Fatto con Agentrica» e istruzioni nei README | P3 | fatto |
| F26-07 | Note legali, informativa e procedura di rimozione | P1 | fatto |
| F26-08 | e2e (pagina nascosta o visibile, schede, axe, 360 px) e revisione di design nell'app | P1 | fatto |

## Criteri di accettazione

- Senza progetti approvati, né `/progetti` né l'anteprima in home si vedono. Con un progetto approvato compaiono, con la nota «descrizione e risultati dell'autore» e il link di rimozione.
- Nel sito e nei README del pacchetto non resta nessun riferimento a «Messi alla prova» né i suoi link a `examples/` (resta quello della misura dei modelli, decisione all'apertura); i casi restano nel repository come prova interna.
- Il testo da GitHub entra solo come testo semplice e nei limiti.
- `npm run verify` in tutti e due i repository e `npm run verify:e2e` in `agentrica-site` sono verdi.

## Fatto

- **Repository pubblico**: `.github/ISSUE_TEMPLATE/progetto.yml`, modulo con etichetta `progetto`, campi con le etichette lette dal sito e due caselle obbligatorie (consenso, licenza). Nei README IT ed EN del pacchetto «Messi alla prova» / «Put to the test» diventa «Mostra il tuo progetto» / «Show your project»: issue, topic, rimozione, note legali e badge. Arriva su npm con il prossimo rilascio.
- **Sito** (`agentrica-site`): `src/lib/projects.ts` (validazione del testo, parser del modulo, progetto dalla issue o dal repository, link di rimozione) con 13 test; `src/data/projects.json` vuoto; `src/lib/projects-data.ts` lo legge al build; `scripts/projects.ts` (`npm run projects`, `--add`, `--decline`); `/progetti` con le schede (`ProjectCard`) e il filtro per reparto (`ProjectsView`, `aria-pressed`, conteggio in `aria-live`), 404 senza progetti; «Progetti» nel menu del computer e del telefono solo con progetti; anteprima dei 3 più recenti in home al posto della tabella delle prove; sezione «I progetti degli utenti» nelle note legali.
- **e2e**: `e2e/progetti.spec.ts` (senza progetti: 404, niente anteprima né link; con i progetti finti: home, schede, nota, rimozione, filtro, menu, 360 px, axe), `landing.spec.ts` senza la tabella delle prove.

## Verifiche

- `npm run verify` verde nei due repository (agentrica 119 test; sito 46 test e build).
- `npx playwright test e2e/progetti.spec.ts e2e/landing.spec.ts`: 29 passati, 1 saltato (solo computer). La suite e2e completa gira alla chiusura.
- `npm run projects` contro GitHub: «Nessun progetto da approvare» (l'etichetta `progetto` non esiste ancora).
- Revisione di design nell'app con i progetti finti, computer 1440 px e telefono 360 px: schede leggibili, accenti dei reparti, nota e rimozione in fondo alla scheda.

## Rilievi aperti

| ID | Rilievo | Priorità |
|---|---|---|
| F26-R1 | Etichetta `progetto` creata nel repository pubblico alla chiusura (2026-11-19) | chiuso |
| F26-R2 | Il README inglese non ha la sezione dei modelli consigliati di F24 (difetto preesistente) | P3 |
| F26-R3 | Misura di business (progetti approvati e richieste per trimestre, tempo fra richiesta e approvazione): oggi dalle date delle issue e dalla storia di `projects.json`, nessuno script | P3 |
| F26-R4 | Le note legali sui progetti, come il resto della pagina, vanno rilette da un legale (commento `ponytail:` della pagina) | P2 |

