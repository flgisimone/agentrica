# Regole per gli agenti

Prima di implementare leggi le sezioni pertinenti di [CONVENTIONS.md](CONVENTIONS.md) e il file della fase in [plan/](plan/README.md): queste regole li completano, non li sostituiscono (CONVENTIONS §16).

## Esplorare il codice: tokensave

Il progetto è indicizzato con tokensave (cartella `.tokensave/`, ignorata da git). Gira tutto sulla postazione: non chiama modelli né servizi a pagamento e riduce i token, perché restituisce solo il codice che serve. Per esplorare il codice usa i tool `tokensave_*` prima di Grep e Read:

- `tokensave_context` per un concetto o un compito, in linguaggio naturale;
- `tokensave_search` per un simbolo per nome, con `literal: true` per il testo esatto;
- `tokensave_callers`, `tokensave_callees` e `tokensave_impact` per chi usa cosa.

Il server MCP non ha un progetto predefinito: passa `graph_root: "/Users/flgisimone/Desktop/lavoro/agentrica"`, oppure usa la CLI dalla root (`tokensave tool search <query>`). A fine di ogni fase l'indice si aggiorna con `tokensave sync` dalla root, come passo della chiusura (CONVENTIONS §13.7); anche dopo modifiche importanti a metà fase. L'indice si crea in F0 con `tokensave init`, quando c'è il primo codice. Se tokensave non è installato, esplora con ricerca e lettura dei file.

## Scrivere codice: Ponytail

Prima di scrivere codice, fermati al primo gradino che regge:

1. Serve davvero? Se il bisogno è ipotetico, non si fa.
2. C'è già nel progetto? Riusa helper, tipi e pattern esistenti.
3. Lo fa la libreria standard?
4. Lo fa la piattaforma (HTML, CSS, il browser, il framework)?
5. Lo fa una dipendenza già installata? Niente dipendenze nuove per poche righe.
6. Basta una riga?
7. Solo allora: il codice minimo che funziona.

Un bug si corregge alla causa, nel punto per cui passano tutti i chiamanti. Niente astrazioni non richieste, niente codice «per dopo». Le semplificazioni volute si segnano con un commento `ponytail:` che dice il limite e quando superarlo.

## Efficienza

Il costo di una sessione cresce con le chiamate e con la dimensione del contesto: ogni chiamata lo rilegge tutto. L'abbonamento ha limiti di cinque ore e settimanali.

- **Agenti**: sono la voce più cara. Si avviano solo quando un'attività lo richiede e solo gli specialisti pertinenti, mai tutte le agenzie insieme (sezione «Agenzie»).
- Una sessione per fase: dopo la chiusura (CONVENTIONS §13.7) se ne apre una nuova (`/clear`). Lo stato è nel piano, in git e nella memoria.
- Dentro la fase, `/compact` quando il contesto diventa grande.
- Durante lo sviluppo test mirati (un file di test, una spec e2e); la verifica completa con `npm run verify`, in un comando solo.
- Letture indipendenti nella stessa chiamata; righe mirate invece di file interi; non rileggere un file già nel contesto.
- Screenshot solo per una verifica visiva, non ripetuti sulla stessa schermata.
- `CONVENTIONS.md` per le sezioni pertinenti al compito, non intero.

## Verifica

- `npm run verify` (typecheck, lint, test unitari, build) deve passare prima di ogni commit.
- `npm run verify:e2e` (Playwright) prima del merge di una fase, dalla fase che lo introduce.
- Le modifiche visibili si provano nell'app (`npm run dev`) prima di dichiararle fatte. Se una prova non è stata fatta, si dice.
- La CI (`.github/workflows/ci.yml`) esegue gli stessi due comandi: i nomi `verify` e `verify:e2e` sono il contratto fra il progetto e la CI.

## Agenzie

Cinque team di ruoli. I file dei ruoli sono in `agents/` (in ogni cartella `README.md`, `00-common-rules.md` con le regole comuni e un file numerato per ruolo); in `.claude/agents/` ogni ruolo è anche un subagent che rimanda al suo file (56 in tutto). Il quadro completo è in `docs/AI Multi-Agency System.md`.

| Agenzia | Ruoli | Prefisso | Cosa fa | Attiva |
|---|---|---|---|---|
| Software (`agents/ai_software_agency/`) | 12 | `sw-` | analisi, sviluppo e verifica. È l'unica che modifica il codice | sì |
| Web Design (`agents/ai_web_design_agency/`) | 10 | `design-` | audit di UX, UI, architettura informativa, design system, dati e grafici, accessibilità, usabilità e testi. Sola lettura | sì |
| Privacy & Compliance (`agents/ai_privacy_compliance_agency/`) | 10 | `privacy-` | trattamenti di dati, basi giuridiche, conservazione, fornitori, sicurezza dei dati, DPIA. Sola lettura, non dichiara conformità | da F4 |
| Business & Product (`agents/ai_business_product_development_agency/`) | 12 | `biz-` | obiettivi, requisiti, priorità, roadmap, business case, mercato. Sola lettura, nessun contatto esterno | su richiesta |
| Cybersecurity (`agents/ai_cybersecurity_agency/`) | 12 | `sec-` | threat model, configurazioni di hosting e database, accessi, dipendenze e vulnerabilità, log, risposta agli incidenti. Sola lettura, nessun test attivo senza autorizzazione scritta | da F4 |

In questo repository le agenzie hanno due parti: sono il **contenuto** del prodotto (Agentrica le presenta come reparti AIBPD, AICA, AIPCA, AISA, AIWDA) e il **team** che lo sviluppa. Per questo `agents/` resta completo anche per le agenzie non attive: modificare un file di ruolo cambia il sito e, da F4, il server MCP.

### Due regole che valgono sempre

- **Attivazione su richiesta.** Le agenzie non sono un sistema sempre acceso: nessun agente parte senza un'attività che lo richieda, e non si avviano mai tutte le agenzie o tutti gli agenti insieme. Per ogni attività si scelgono l'agenzia e i soli specialisti pertinenti, nel momento in cui servono.
- **Conferma dell'utente.** Ogni decisione finale delle agenzie è una proposta finché l'utente non la conferma: priorità e contenuto del backlog, requisiti e specifiche, scelte di architettura e di modello dei dati, rilievi accettati o respinti, chiusura di un'attività, dipendenze nuove, commit, merge, push, deploy e migrazioni. Si presentano le alternative con le motivazioni (con AskUserQuestion) e si procede solo dopo il suo ok. A fine fase commit, merge in `develop`, push e `tokensave sync` si confermano con un'unica domanda (CONVENTIONS §13.7).

### Come si usano

- Nel lavoro di tutti i giorni i ruoli sono un modo di lavorare della sessione principale; i subagent si avviano per gli audit e quando l'utente li chiede.
- Funzioni o iniziative nuove: ruoli business per obiettivo, valore, requisiti e priorità, prima del design.
- Modifiche con effetti visibili: ruoli di design pertinenti prima (controlli) e dopo (revisione nell'app).
- Trattamenti di dati personali (dati nuovi, import ed export, fornitori, conservazione): ruoli privacy prima (requisiti) e dopo (verifica delle misure).
- Modifiche al codice: sviluppo nei ruoli software che corrispondono ai file toccati, poi QA (sempre), Security e Performance quando toccati, infine il Code Reviewer sul diff (`APPROVE`, `REQUEST_CHANGES` o `COMMENT`).
- Sicurezza dell'applicazione intera (audit periodici, nuove integrazioni o fornitori, segreti e accessi, aggiornamenti delle dipendenze, incidenti): ruoli cybersecurity. Il diff di una singola modifica resta al Security della software; i dati personali restano alla privacy.
- Ordine per una richiesta trasversale: business → design → privacy → **conferma dell'utente** → software → revisione design → revisione privacy → Code Reviewer → **conferma dell'utente**. Si saltano i passaggi non pertinenti o delle agenzie non attive.
- I rilievi di design e privacy sono requisiti: se uno non è fattibile torna all'agenzia o all'utente, non si cambia in silenzio.
- Priorità: `P0` critica, `P1` alta, `P2` media, `P3` bassa, sempre motivate. Gravità tecnica, rischio privacy, impatto UX e impatto di business sono dimensioni distinte.

### Adattamenti a questo repository

- **Stack.** Monorepo npm workspaces: `packages/catalog` (TypeScript senza dipendenze, legge `agents/`) e `apps/site` (Astro statico); il server MCP in `packages/mcp` da F4. Dettagli in CONVENTIONS §5 e §15.
- **File di ruolo.** Sono contenuto pubblicato: un cambio a un file di `agents/` è una modifica al prodotto e passa dalla conferma dell'utente, come il codice. Nomi in codice e sigle stanno solo in `packages/catalog/src/departments.ts` e non cambiano dopo la pubblicazione.
- **Dati.** Nessun dato personale né dato reale: il sito è statico e i contenuti vengono dal catalogo. Niente persone, clienti, risultati o recensioni inventati.
- **Audit.** I rilievi stanno in `audit/<audit_id>/` (un JSON per agente, i report dei direttori in `report-*.md`), le evidenze in `audit/<audit_id>/evidenze/`.
- **Versionati.** `agents/`, `.claude/agents/`, `audit/`, `docs/` e `plan/` sono nel repository. Se le evidenze degli audit mostrano dati personali, si attiva la riga `audit/*/evidenze/` del `.gitignore`.
- Push, deploy e migrazioni in produzione richiedono l'approvazione esplicita dell'utente.
