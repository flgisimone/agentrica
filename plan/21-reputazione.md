# F21 — Reputazione pubblica degli agenti

**Obiettivo**: rendere pubbliche, sul sito, le statistiche dei voti raccolti in F20: media, numero di voti e distribuzione nelle schede degli agenti, classifiche generali e per reparto, commenti pubblicati dopo moderazione.

> **Stato: completata** il 2026-11-17 su `fase/f21-reputazione` (in questo repository e in `agentrica-site`); sito in produzione con la PR #5 di `agentrica-site` (`100a642`). L'utente ha scelto di aprirla subito, senza aspettare la revisione a 4 settimane dalla 0.5.0: la parte pubblica si accende da sola quando i voti superano le soglie, e fino ad allora non si vede nulla. Parte pubblica della bozza «F20 — Community Ratings & Agent Reputation» dell'utente (2026-11-17).

**Agenzie**: business (Product Manager), design (Dashboard e Data Visualization, UX Writer, Accessibility), privacy (GDPR, Legal, Data Governance, DPIA) per la pubblicazione di contenuti di terzi, cybersecurity (AppSec, Cloud Security), software (Backend, Database, Frontend, QA, Security, Code Reviewer).

## Dalla bozza dell'utente

- Classifica con media ponderata (es. bayesiana), così pochi voti non danno posizioni alte; almeno 5 valutazioni valide.
- Scheda agente: media, numero di voti, distribuzione delle stelle, commenti approvati, andamento nel tempo; statistiche distinte per versione.
- Commenti pubblici solo dopo approvazione, con segnalazione e rimozione; i voti negativi non si eliminano.
- Pagina «Community Reputation» e API pubbliche aggregate.

## Decisioni dell'utente (2026-11-17)

| Tema | Decisione |
|---|---|
| Apertura | Subito, fase intera; dove non ci sono voti sufficienti non si mostra nulla (né classifica vuota né «nessun voto») |
| Soglie | Statistiche nella scheda di un agente da 5 voti validi; pagina delle classifiche e suo link nel menu solo quando almeno 5 agenti superano la soglia, prima 404 |
| Moderazione | Script in questo repository (`npm run ratings -- --moderate`), con un ruolo del database che cambia solo lo stato del commento e l'esclusione; nessuna area di amministrazione |
| Lettura dal sito | ISR: pagine pre-generate, rigenerate al massimo una volta all'ora, lettura delle sole statistiche aggregate |
| Voti gonfiati | Media bayesiana per la classifica; segnalazione dei voti anomali (picchi, commenti duplicati) nello script, con esclusione dalle medie senza cancellarli. Niente proof of work |
| Credenziali della lettura | Ruolo `reputation_reader` (solo le due funzioni di lettura) in una variabile Sensitive `REPUTATION_READER_URL` su Vercel, Production e Preview, impostata a mano dall'utente |
| Backlog | Confermato con l'ordine sotto; API pubbliche aggregate rinviate |

## Requisiti delle agenzie (proposte, ruoli nella sessione)

**Business (Product Manager)**
- Obiettivo: chi sceglie gli agenti vede quali funzionano secondo chi li usa; il titolare vede le stesse cose che vedono tutti. Misura: agenti sopra la soglia e commenti approvati, letti con `npm run ratings`.
- API pubbliche aggregate della bozza: rinviate, nessun utente le ha chieste e le pagine bastano.
- «Andamento nel tempo» e «per versione»: si mostrano solo i periodi e le versioni che da soli hanno almeno 5 voti, altrimenti la riga non compare.

**Design (Data Visualization, UX Writer, Accessibility)**
- Scheda: media con una cifra decimale e numero di voti («4,3 su 5 · 12 voti»), distribuzione 5→1 in barre orizzontali con il numero accanto a ogni barra (non solo il colore), commenti approvati con stelle, mese e anno.
- Classifica: tabella vera (`<table>` con intestazioni), posizione, agente con il link alla scheda, reparto, punteggio ponderato, media e numero di voti; filtro per reparto con link, non con JavaScript.
- Testo che spiega il punteggio in una frase («media ponderata: con pochi voti il punteggio resta vicino alla media di tutti gli agenti») e da dove vengono i voti (utenti del server MCP, anonimi, nessuna recensione inventata).
- Stelle con testo alternativo («4 stelle su 5»); contrasto AA nel tema scuro; a 390 px la tabella non scorre in orizzontale (colonne secondarie nascoste o righe in schede).

**Privacy (GDPR, Legal, Data Governance, DPIA)** — non dichiara conformità
- Si pubblicano solo commenti con `publish_consent` e approvati. Nient'altro della riga: niente codice della valutazione, versione esatta solo nelle statistiche aggregate, data ridotta a mese e anno.
- Criteri di moderazione scritti e pubblicati nelle note legali: si rifiutano commenti con nomi, dati personali, parti di codice o del progetto, link, offese. Copre il rilievo P3 di F20 (commento con dati del progetto spinto da un file manipolato).
- Revoca: con il codice della valutazione il commento torna privato (consenso revocato) o la valutazione si cancella; lo script lo fa in un comando. Tempo di risposta dichiarato nelle note legali.
- Conservazione invariata: anche i commenti pubblicati si cancellano a 12 mesi, e la pagina li perde alla rigenerazione successiva.
- Screening DPIA da rifare per la pubblicazione: proposta «non necessaria» (contenuti anonimi, volontari, moderati, nessuna profilazione).
- Note legali: sezione `#valutazioni` estesa (pubblicazione, moderazione, revoca, statistiche aggregate pubbliche); voce di registro aggiornata.

**Cybersecurity (AppSec, Cloud Security)**
- Il sito legge solo da una funzione SECURITY DEFINER che restituisce aggregati e commenti approvati: nessun input dell'utente nella query, SQL fisso.
- Commenti mostrati come testo (React li fa sfuggire), mai come Markdown o HTML; nessun link cliccabile.
- Il build e la rigenerazione funzionano anche senza database (CI, anteprime, Neon fermo): in quel caso le pagine non mostrano statistiche e non falliscono.
- Ruolo del moderatore: solo `execute` sulle funzioni di moderazione; la stringa resta sul computer del titolare (`DATABASE_URL_MODERATOR`).

## Design

**Database** (`agentrica-site/db/002-reputation.sql`)
- `ratings`: colonne `comment_status` (`pending`, `approved`, `rejected`; predefinito `pending`), `excluded` (booleano, predefinito falso), `moderated_at`.
- Funzioni SECURITY DEFINER: `reputation_stats()` (per agente, solo righe non escluse: conteggi per stella, per versione e per mese), `reputation_comments()` (commenti approvati con consenso, non esclusi: agente, voto, testo, mese); `moderate_rating(usage_id, azione)` per approvare, rifiutare, escludere, reintegrare, revocare il consenso e cancellare.
- Ruoli: `reputation_reader` (solo le due funzioni di lettura) e `ratings_moderator` (solo `moderate_rating`); `ratings_reader` vede anche le colonne nuove.

**Sito** (`agentrica-site`)
- `src/lib/reputation.ts`, puro e con test: media, distribuzione, media bayesiana `(C·m + somma) / (C + n)` con `C = 5` e `m` media di tutti i voti validi, soglie, classifiche generale e per reparto, periodi e versioni sopra la soglia.
- Lettura dal database in un solo modulo server, con `revalidate` di un'ora e ritorno vuoto se il database manca o non risponde.
- Scheda agente: sezione «Reputazione» sotto l'intestazione, solo da 5 voti. Pagina `/reputazione` con classifica generale e per reparto; link nel menu solo se è attiva.

**Questo repository**
- `npm run ratings`: anche lo stato dei commenti, gli esclusi e le anomalie (picchi: molti voti a un agente in un'ora rispetto al suo ritmo; commenti uguali dopo la normalizzazione), con funzioni pure e test in `scripts/ratings-lib.ts`.
- `npm run ratings -- --moderate`: commenti in attesa uno per volta (approva, rifiuta, salta); `--exclude`, `--include`, `--revoke` e `--delete` con il codice della valutazione.

## Backlog

| Id | Task | Priorità |
|---|---|---|
| F21-01 | Privacy prima del codice: criteri di moderazione, dati pubblicati, revoca, screening DPIA, voce di registro; testi delle note legali in bozza | P0 |
| F21-02 | Design prima del codice: scheda, classifica e testi (bozza in sessione, verificata su computer e telefono dopo F21-05) | P1 |
| F21-03 | Database: `002-reputation.sql` con colonne, funzioni e ruoli; prova su Postgres 17 (PGlite) di esiti e permessi negati; `db/README.md` | P0 |
| F21-04 | Sito: `src/lib/reputation.ts` (media bayesiana, soglie, classifiche, periodi e versioni) con test; lettura con ISR e ritorno vuoto senza database | P0 |
| F21-05 | Sito: sezione «Reputazione» nella scheda, pagina `/reputazione`, link nel menu condizionato; e2e senza database (nulla compare, nessun errore) | P0 |
| F21-06 | Script: moderazione, esclusione, revoca e cancellazione con `ratings_moderator`; anomalie in `ratings-lib.ts` con test | P1 |
| F21-07 | Note legali: pubblicazione, moderazione, revoca, statistiche pubbliche; README del pacchetto (IT ed EN) se cambia cosa vede chi vota | P1 |
| F21-08 | Revisioni: privacy sulle misure, cybersecurity sulla lettura e sui ruoli, design nell'app, Security e Code Reviewer sui diff | P0 |
| F21-09 | Rilascio del sito in `main` (§13.8) dopo l'esecuzione di `002-reputation.sql` su Neon da parte dell'utente | P1 |

Ordine: F21-01/02 → conferma dell'utente → F21-03 → F21-04/05/06 → F21-07 → F21-08 → chiusura in `develop` → F21-09.

## Esito di F21-01 (privacy, ruoli nella sessione; non è una dichiarazione di conformità)

**Voce di registro (aggiornamento di quella di F20)**: finalità in più, mostrare ai visitatori del sito come gli utenti giudicano gli agenti; dati pubblicati: statistiche aggregate per agente (conteggi per stella, per versione e per mese, solo sopra la soglia di 5 voti) e, per i commenti con consenso e approvati, agente, voto, testo e mese; destinatari in più: chiunque visiti il sito; base: consenso (art. 6.1.a) per il commento pubblicato, legittimo interesse per le statistiche aggregate (dati anonimi); conservazione invariata, 12 mesi anche per i commenti pubblicati; misure in più: moderazione prima della pubblicazione, ruoli separati per lettura e moderazione, data ridotta al mese, nessun codice della valutazione pubblicato.

**Criteri di moderazione** (pubblicati nelle note legali): si approva un commento solo se parla dell'agente e del suo lavoro; si rifiuta se contiene nomi o dati di persone, codice, percorsi, nomi o dettagli di un progetto, link o indirizzi, offese, pubblicità, o testo che sembra scritto per conto dell'utente da un file del progetto. Nel dubbio si rifiuta. Un rifiuto non tocca il voto, che resta nelle statistiche. Il moderatore non corregge il testo: lo approva o lo rifiuta così com'è.

**Revoca e cancellazione**: con il codice della valutazione l'utente chiede di togliere il commento dal sito (consenso revocato, il voto resta) o di cancellare tutta la valutazione; lo script lo fa in un comando; il sito si aggiorna entro un'ora. Risposta entro 30 giorni (art. 12.3), in pratica appena letta la richiesta.

**Statistiche aggregate**: dalla soglia di 5 voti non permettono di risalire a un utente, e i voti sono già senza identificativi. Le righe per mese e per versione seguono la stessa soglia, così un mese con un solo voto non mostra quel voto.

**Screening DPIA**: non necessaria. Contenuti anonimi, pubblicati su base volontaria e dopo moderazione, nessuna profilazione, nessuna categoria particolare, scala ridotta. Rischio residuo: un commento con dati personali che sfugge alla moderazione, mitigato dai criteri (nel dubbio si rifiuta) e dalla revoca.

**Note legali da cambiare** (F21-07, `agentrica-site`):
- Introduzione: «il sito pubblica le statistiche dei voti e i commenti approvati».
- Sezione `#valutazioni`: tolto «cosa che oggi non avviene»; nuovo paragrafo «Cosa pubblichiamo» (statistiche dai 5 voti, commenti con il permesso e approvati, con voto e mese, senza codice né versione); paragrafo «Moderazione» con i criteri sopra; revoca con il codice: il commento sparisce dal sito entro un'ora dalla lavorazione della richiesta, e il voto resta se non chiedi di cancellarlo.
- Il commento `ponytail:` della pagina resta: la sezione va riletta da un legale.

## Bozza di F21-02 (design, ruoli nella sessione)

**Scheda agente**, sezione «Reputazione» fra l'intestazione e il file di ruolo, solo da 5 voti:
- Riga principale: «4,3 su 5» in grande, «12 voti dagli utenti del server MCP» accanto.
- Distribuzione: cinque righe da 5 a 1 stella, etichetta «5 stelle», barra nel colore del reparto proporzionale al numero, numero a destra; `aria-hidden` sulle barre, perché etichetta e numero dicono tutto.
- «Per versione» e «Nel tempo»: righe «0.5.0 · 4,4 su 5 · 8 voti» e «novembre 2026 · …», solo quelle sopra la soglia; se non ce n'è nessuna la sottosezione non compare.
- «Commenti»: elenco con stelle («4 stelle su 5» per i lettori di schermo), testo e mese; i più recenti prima, al massimo 10, poi «e altri N commenti» senza paginazione. `ponytail:` la paginazione arriva quando un agente ne ha davvero più di 10.
- Nota sotto: «Voti anonimi inviati da chi usa gli agenti con il server MCP. Nessuna recensione inventata. Come trattiamo le valutazioni» (link a `/note-legali#valutazioni`).

**Pagina `/reputazione`** («Reputazione» nel menu, dopo i reparti):
- Titolo «Reputazione degli agenti», sottotitolo con la spiegazione del punteggio: «Gli agenti con almeno 5 voti, ordinati per media ponderata: con pochi voti il punteggio resta vicino alla media di tutti gli agenti (oggi 4,1).»
- Filtro per reparto: link «Tutti · AIBPD · AICA · AIPCA · AISA · AIWDA» verso pagine `/reputazione/[sigla]` pre-generate (un parametro di ricerca renderebbe la pagina dinamica e la toglierebbe dall'ISR), con `aria-current`.
- Tabella: #, agente (glifo piccolo, nome in codice e ruolo, link alla scheda), reparto, punteggio, media, voti. Sotto i 640 px restano #, agente e punteggio; media e voti vanno sotto il ruolo.
- Un reparto senza agenti sopra la soglia non ha il link nel filtro.

**Testi** (UX Writer): «voti» e non «recensioni»; «punteggio» per la media ponderata, «media» per quella semplice; numeri all'italiana (virgola decimale), mesi in parole.

## Fatto

- **F21-01** Requisiti privacy sopra, approvati dall'utente il 2026-11-17.
- **F21-02** Bozza di design sopra, approvata il 2026-11-17; verificata nell'app con dati finti dopo F21-05.
- **F21-03** `agentrica-site/db/002-reputation.sql`: colonne `comment_status`, `excluded`, `moderated_at`; funzioni SECURITY DEFINER `reputation_stats()` (conteggi per agente, versione, mese e stella, senza esclusi), `reputation_comments()` (solo agente, voto, testo e mese di commenti con consenso, approvati, non esclusi) e `moderate_rating(usage_id, azione)` (`approve`, `reject` solo con consenso e commento; `exclude`, `include`, `revoke`, `delete`); ruoli `reputation_reader` (solo le due letture) e `ratings_moderator` (`select` su `ratings` e solo `moderate_rating`). Provato su Postgres 17 (PGlite): esiti, esclusione, revoca, cancellazione, permessi negati (lettura diretta della tabella, moderazione e invio per il lettore; `update`, `delete` e `daily_votes` per il moderatore), e le due query del sito eseguite come `reputation_reader`. `db/README.md` con i passi per ruoli, script e variabile.
- **F21-04** `src/lib/reputation.ts` (puro, 8 test): soglia di 5 voti per agente, versione e mese; media generale su tutti i voti validi; punteggio bayesiano con `C = 5`; classifica solo con 5 agenti sopra la soglia; 10 commenti al massimo; formati italiani. `src/lib/reputation-data.ts`: una lettura all'ora con `unstable_cache` (le righe grezze, perché la cache serializza in JSON), `REPUTATION_READER_URL`, reputazione vuota senza variabile o con errore del database (solo il tipo di errore nei log); dati finti da `REPUTATION_FIXTURE` solo con `next dev`.
- **F21-05** Sezione «Reputazione» nella scheda (media, voti, distribuzione con numeri, per versione, nel tempo, commenti come testo semplice, nota sulla provenienza dei voti); pagine `/reputazione` e `/reputazione/[sigla]` con tabella, filtro per reparto (solo reparti con agenti in classifica) e 404 sotto le soglie; «Reputazione» nel menu, su computer e telefono, solo con la classifica attiva. Layout e pagine con `revalidate = 3600`. E2e `reputazione.spec.ts` sullo stato vuoto.
- **F21-06** `npm run ratings`: medie senza i voti esclusi (contati a parte), stato di ogni commento (privato, in attesa, pubblicato, rifiutato), anomalie (5 voti allo stesso agente in meno di un'ora; commenti uguali dopo la normalizzazione) con i codici da escludere. `--moderate` mostra i commenti in attesa con i criteri e chiede approva, rifiuta, salta o esci; `--exclude`, `--include`, `--revoke`, `--delete` (con conferma) con `DATABASE_URL_MODERATOR`. Calcoli e argomenti in `ratings-lib.ts` con test.
- **F21-07** Note legali: introduzione e descrizione, base giuridica estesa alle statistiche pubbliche, revoca e cancellazione con il codice (30 giorni, sito aggiornato entro un'ora), sottosezione «Cosa pubblichiamo» (`#pubblicazione`) con soglie, commenti e criteri di moderazione, voti anomali; il `ponytail:` chiede la revisione legale anche per F21. README del pacchetto (IT ed EN): voce «Sul sito»; nessun cambio al codice del pacchetto, quindi nessuna nuova versione.
- **F21-08** Revisioni nella sessione (sezione «Revisioni»), con una correzione.
- **F21-09** L'utente ha creato i ruoli ed eseguito `002-reputation.sql` su Neon (database `neondb`; dopo un primo tentativo parziale, una versione rieseguibile con `create or replace`) e ha impostato `REPUTATION_READER_URL` su Vercel (Production e Preview, Sensitive). PR #5 di `agentrica-site` con la CI verde, unita in `main`; `develop` riallineato (`100a642`). In produzione: `/`, `/agenti/aisa-02` e `/note-legali` 200, con «Cosa pubblichiamo»; `/reputazione` e `/reputazione/aisa` 404 e nessuna sezione «Reputazione», come atteso sotto le soglie.

## Verifiche

- `npm run verify` verde qui (test di `ratings-lib` compresi); script provato senza variabili (messaggi di uso e di variabile mancante).
- `agentrica-site`: `npm run verify` verde (30 test, build con tutte le pagine ISR a 1 ora); `verify:e2e` verde (63 prove, 1 saltata come prima).
- ISR provato in locale con un build di produzione e dati finti (modifica temporanea, poi annullata: dati finti in produzione e rigenerazione a 5 secondi): `/reputazione` e `/reputazione/aisa` passano da 404 a 200 quando arrivano i voti, `/reputazione/aibpd` resta 404 sotto la soglia, il link del menu compare, e tornano a 404 quando i voti spariscono.
- Prova visiva con `next dev` e dati finti a 1280 e 390 px: nessuno scorrimento orizzontale, axe (WCAG 2.2 AA) senza violazioni su `/reputazione` e `/agenti/aisa-02`.

## Revisioni (F21-08, ruoli nella sessione)

- **Code Reviewer — APPROVE** dopo una correzione: l'ordine dei commenti dipendeva dall'`order by` dentro `reputation_comments()`, non garantito fuori dalla funzione; ora la query del sito ordina per mese.
- **Security (software) e Cybersecurity (AppSec, Cloud Security)**: lettura con SQL fisso e senza input, ruolo con le sole due funzioni, commenti resi come testo da React (niente Markdown, niente link), nessun header o CSP da cambiare (nessuna risorsa esterna, nessuno script nuovo nel browser), dati finti impossibili in produzione (`NODE_ENV`), build e pagine che reggono il database assente. La route di F20 resta con le credenziali del proprietario (rilievo di F20).
- **Privacy (verifica delle misure)**: pubblicati solo aggregati sopra la soglia e commenti con consenso e approvati, senza codice né versione e con data al mese; conservazione invariata a 12 mesi anche per i commenti pubblicati; criteri di moderazione, revoca e cancellazione nelle note legali; le righe sotto soglia arrivano al server del sito ma non alle pagine (filtro in `reputation.ts`, con test). Aperti: revisione legale e DPA di Neon (da F20).
- **Design (Data Visualization, UX Writer, Accessibility)**: conforme alla bozza; barre con etichetta e numero, stelle con testo alternativo, tabella con `caption` e intestazioni, colonne secondarie sotto il ruolo a 390 px; «voti» e «punteggio» come da bozza.

## Rilievi aperti

- (P2) Sul computer dell'utente mancano `DATABASE_URL_READONLY` e `DATABASE_URL_MODERATOR` (le password di `ratings_reader` e dei ruoli di F21 vanno reimpostate con `alter role` se perse): senza, `npm run ratings` e la moderazione non partono. Chiuso in F30 (F30-01): le due variabili sono nell'ambiente del titolare (2026-11-21).
- (P3) La lettura delle statistiche in produzione non è verificabile finché i voti sono sotto le soglie; un errore di connessione compare nei log di Vercel come `reputation: errore del database`.
- (P2) Note legali: anche le parti di F21 vanno rilette da un legale (come PRIV-PUB-01 e `#valutazioni` di F20). Chiuso in F30 (F30-04): rischio accettato dall'utente il 2026-11-21, senza revisione legale; riaprire con i casi scritti in PRIV-PUB-01.
- (P3) Un errore del database resta in cache per un'ora: per quell'ora le statistiche spariscono dal sito (commento `ponytail:` in `reputation-data.ts`). Chiuso in F30 (F30-11): a runtime l'errore non entra in cache, Next serve l'ultima pagina generata e riprova.
- (P3) Il passaggio da 404 a pagina della classifica è provato in locale con `next start`; in produzione su Vercel si vedrà solo quando i voti superano le soglie.

## Criteri di accettazione

- Senza voti, o con il database assente, il sito è identico a oggi: nessuna sezione «Reputazione», nessun link, `/reputazione` dà 404, e build e e2e passano.
- Un agente con almeno 5 voti validi mostra media, numero e distribuzione; con meno non mostra nulla. La classifica compare solo con almeno 5 agenti sopra la soglia e ordina per media bayesiana.
- I voti esclusi non contano nelle medie e restano nel database; i voti negativi non si cancellano se non su richiesta di chi ha il codice.
- Compaiono solo commenti con consenso e approvati, come testo semplice, con mese e anno; un commento rifiutato o con consenso revocato sparisce alla rigenerazione successiva.
- Il sito legge solo aggregati e commenti approvati, con SQL fisso; il moderatore ha solo la funzione di moderazione (permessi negati provati).
- `npm run ratings` mostra anomalie, stati ed esclusi; la moderazione funziona da terminale.
- Note legali aggiornate con moderazione, pubblicazione e revoca.
- `npm run verify` verde qui; `verify` e `verify:e2e` verdi nel sito.
