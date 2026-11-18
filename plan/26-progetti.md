# F26 — Progetti degli utenti

**Obiettivo**: il sito mostra i progetti reali di chi ha usato Agentrica, su loro richiesta, al posto di «Messi alla prova», le prove fatte da noi, che vengono tolte dalla vetrina (i casi restano come prova interna).

> **Stato: da aprire**. Idea e decisioni con l'utente il 2026-11-18; viene dopo F25 (biblioteca). Backlog da confermare all'apertura.

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

## Proposte da confermare all'apertura

- **Scheda del progetto**: nome, link, descrizione breve scritta dall'autore, reparti o agenti usati, versione di Agentrica, data, nome o handle scelto dall'autore; un'immagine facoltativa, solo per i progetti arrivati con la issue, salvata nel repository del sito (la CSP non cambia). Ogni scheda dice che descrizione e risultati sono dell'autore e ha il link per chiedere la rimozione.
- **Topic**: per i repository con il topic si mostrano solo i dati pubblici del repository (nome, descrizione, link, proprietario), dopo l'approvazione. La pagina e il README spiegano che aggiungere il topic vale come richiesta di comparire.
- **Lettura da GitHub**: al build e con ISR, come per la reputazione. Si accetta solo testo semplice, con lunghezza limitata, senza HTML né link fuori dal repository; serve un token in sola lettura se il limite delle richieste anonime non basta.
- **Badge «Fatto con Agentrica»** da mettere nel README dei progetti, con il link alla vetrina.
- **Misura** (business): progetti approvati e richieste arrivate per trimestre; tempo fra la richiesta e l'approvazione.

## Requisiti da definire all'apertura

- Privacy: base giuridica e informativa per la pubblicazione di dati di terzi (handle, nome del progetto, immagine); consenso esplicito nel modulo della issue; rimozione su richiesta entro un tempo dichiarato; note legali aggiornate.
- Legal: licenza a mostrare nome, descrizione e immagine, concessa nel modulo.
- Cybersecurity: contenuti di GitHub trattati come dati non attendibili; nessuna immagine caricata da altri siti; permessi minimi del token.

## Backlog

Proposta da confermare all'apertura.

| ID | Attività | Priorità |
|---|---|---|
| F26-01 | Modulo issue «Mostra il tuo progetto», con consenso e licenza, e file dati dei progetti approvati | P1 |
| F26-02 | Lettura dei repository con il topic `agentrica`, con elenco da approvare per il titolare | P2 |
| F26-03 | Pagina `/progetti` con le schede e il filtro per reparto, nascosta senza progetti; link nel menu | P1 |
| F26-04 | Anteprima in home al posto di «Messi alla prova» | P1 |
| F26-05 | Rimozione di «Messi alla prova»: sezione ed e2e del sito, sezioni dei README IT ed EN e i loro link a `examples/` | P1 |
| F26-06 | Badge «Fatto con Agentrica» e istruzioni nei README | P3 |
| F26-07 | Note legali, informativa e procedura di rimozione | P1 |
| F26-08 | e2e (pagina nascosta o visibile, schede, axe, 390 px) e revisione di design nell'app | P1 |

## Criteri di accettazione

- Senza progetti approvati, né `/progetti` né l'anteprima in home si vedono. Con un progetto approvato compaiono, con la nota «descrizione e risultati dell'autore» e il link di rimozione.
- Nel sito e nei README del pacchetto non resta nessun riferimento a «Messi alla prova» né link a `examples/`; i casi restano nel repository come prova interna.
- Il testo da GitHub entra solo come testo semplice e nei limiti.
- `npm run verify` in tutti e due i repository e `npm run verify:e2e` in `agentrica-site` sono verdi.
