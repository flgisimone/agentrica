# Convenzioni di Agentrica

Regole per chi lavora al codice di Agentrica, persone o agenti. `AGENTS.md` le completa con le regole per gli agenti e le agenzie (§16). Le parti marcate «da compilare» dipendono dallo stack e si scrivono in F0; il resto vale per ogni progetto.

## 1. Scopo

<!-- Da compilare: cos'è il prodotto, per chi, e cosa non si deve mai rompere (dati reali, partite salvate, contenuti pubblicati…). -->

Le regole servono a tre cose, in quest'ordine: non perdere né alterare i dati e il lavoro dell'utente, tenere il codice semplice e leggibile, consegnare modifiche verificate.

## 2. Flusso di lavoro

### 2.1 Leggere prima
Prima di modificare il codice si leggono questo documento (le sezioni pertinenti), `AGENTS.md`, il file della fase in `plan/` e i criteri di accettazione. Uno script, una libreria o una configurazione esiste solo se lo si trova nel repository, non perché un documento lo descrive.

### 2.2 Capire il codice esistente
Si guardano i file coinvolti e le loro dipendenze, si cercano helper, tipi e componenti che risolvono già il problema, si capisce come scorrono i dati. Si seguono i pattern esistenti, salvo un motivo concreto.

### 2.3 Chiarire le ambiguità che contano
Si procede da soli quando i requisiti sono chiari e le scelte sono a basso rischio e reversibili. Si chiede all'utente quando un'ambiguità può cambiare il comportamento visibile, l'integrità dei dati, la sicurezza, il modello dei dati o il perimetro. Le decisioni di prodotto non si prendono in silenzio.

### 2.4 La soluzione più piccola che regge
Si applica la scala Ponytail di `AGENTS.md`. Niente refactoring estranei, niente astrazioni o dipendenze non necessarie, comportamento esistente preservato.

### 2.5 Verificare
Si rilegge il diff, si eseguono i controlli (§13), si verificano i criteri di accettazione sull'implementazione reale. Non si dichiara superato un controllo che non è stato eseguito.

## 3. Scrittura del codice

- **Leggibilità prima di tutto**: nomi che dicono cosa contengono, funzioni brevi con una responsabilità, flusso lineare con uscite anticipate.
- **Semplicità**: il codice più corto che resta chiaro. Niente «per dopo».
- **DRY senza esagerare**: si estrae alla terza ripetizione o quando la logica deve restare identica.
- **Costanti**: niente valori magici ripetuti; le stringhe di dominio stanno in un solo punto.
- **Commenti**: spiegano il perché, non il cosa. Brevi, in italiano. Una semplificazione voluta si segna con `ponytail:`, dicendo il limite e quando superarlo.
- **Codice morto**: si toglie, non si commenta.
- **Difese**: si valida l'input ai confini (azioni lato server, route, import, input dell'utente); dentro, si usano i tipi.

## 4. TypeScript

- `strict` resta attivo, con `noUncheckedIndexedAccess`. Niente `any`; `unknown` ai confini, poi restringimento.
- Asserzioni (`as`) solo con un commento che spiega perché sono sicure.
- Un tipo si definisce una volta e si deriva (`Pick`, `Omit`, tipi inferiti dallo schema) invece di ridefinirlo.
- <!-- Da compilare: unità e formati del dominio (es. importi interi in centesimi, date `YYYY-MM-DD`, unità di misura del mondo di gioco). -->

## 5. Architettura del repository

| Cartella | Contenuto |
|---|---|
| `src/lib/` | logica pura e testata: niente DOM, rete, database né orologio (riceve `today` o `dt` come parametro) |
| <!-- da compilare --> | <!-- pagine, componenti, scena, server… --> |
| `e2e/` | test end-to-end e cattura delle evidenze degli audit |
| `scripts/` | script di progetto (migrazioni, dati dei test, utilità) |
| `plan/` | decisioni e fasi |
| `agents/`, `.claude/agents/` | ruoli delle agenzie e subagent |
| `audit/` | rilievi e report degli audit |
| `docs/` | materiale di riferimento |

La logica che si può testare senza framework, rete o database va in `src/lib`. Un controllo di lint lo fa rispettare quando lo stack lo permette.

## 6. Dati e stato

<!-- Da compilare: dove si leggono e si scrivono i dati, dove vive lo stato (URL, server, client locale), come si invalida dopo una scrittura. Regola comune: lo stato che deve sopravvivere a un link sta nell'URL; niente librerie di stato globale senza un motivo registrato in plan/README.md. -->

## 7. Confini: API, azioni, input

<!-- Da compilare: come entrano dati e comandi (Server Actions, API, eventi di input, file importati). Regole comuni: -->

- Ogni scrittura passa da un solo punto per area, valida i suoi input e restituisce un esito vero: un aggiornamento che non tocca nulla non risponde «aggiornato».
- Le scritture in più passi sono atomiche (transazione o equivalente).

## 8. Form e interazioni

<!-- Da compilare: componenti dei form, formati di input (es. importi in formato italiano), comportamento dopo il salvataggio; oppure, per un gioco, mappa dei comandi e feedback. -->

## 9. Componenti

- Un componente fa una cosa. Si riusano i componenti condivisi prima di crearne di nuovi.
- Le chiavi delle liste sono stabili e uniche. Niente effetti per calcolare valori derivabili.
- <!-- Da compilare: regole del framework (Server/Client Components, ciclo di vita della scena…). -->

## 10. Accesso e protezione

- Nessun segreto nel codice né nei log. I file `.env*` (tranne `.env.example`) non entrano in git.
- Ogni controllo d'accesso si ripete dove si usano i dati, non solo al primo filtro.
- <!-- Da compilare quando arrivano account o dati per utente: come si entra, dove vive la sessione, come si separano i dati. -->

## 11. Interfaccia, coerenza e accessibilità

- Si usano i token del design system, mai colori scritti a mano.
- Lo stato non si affida mai al solo colore: c'è sempre un segno, una forma o un testo.
- HTML semantico: un `h1` per pagina, titoli di sezione, tabelle con intestazioni, etichette sui campi.
- Tastiera: ogni azione è raggiungibile, il focus è visibile, i dialoghi lo intrappolano e lo restituiscono.
- Contrasto WCAG 2.2 AA: almeno 4,5:1 per il testo, 3:1 per gli elementi grafici.
- Responsive fino a 390 px senza scorrimento orizzontale della pagina. <!-- adattare ai dispositivi del progetto -->
- Ogni dato ha i suoi stati: caricamento, vuoto, errore.
- Testi in italiano, brevi, con il glossario di `plan/README.md`.

## 12. Prestazioni e affidabilità

- Si ottimizza solo su misure.
- Le dipendenze nuove richiedono un motivo e l'ok dell'utente; prima si guarda la libreria standard e la piattaforma. Le versioni si fissano esatte.
- Le operazioni distruttive (import, eliminazioni, migrazioni, reset dei salvataggi) hanno conferma, esito e un modo per tornare indietro.

## 13. Test e controlli

### 13.1 Cosa testare
Si testano il comportamento e i rischi, con i casi limite del dominio. Un bug corretto ha il suo test di regressione.

### 13.2 Test unitari
<!-- Da compilare: strumento e posizione, es. «`node --test` in `src/lib/*.test.ts` (`npm test`), senza dipendenze in più». -->

### 13.3 Schema e migrazioni
<!-- Da compilare se c'è un database: come si generano, si rileggono e si provano su una copia prima di applicarle. -->

### 13.4 Test end-to-end
Con Playwright in `e2e/`. I test usano solo dati finti e non toccano mai i dati reali dell'utente. L'accessibilità si controlla con axe dove c'è un'interfaccia HTML: nessuna violazione serious o critical, salvo i rilievi aperti elencati.

### 13.5 Controlli prima del commit e del merge
- `npm run verify`: typecheck, lint, test unitari e build. Prima di ogni commit. Stampa solo errori e riepiloghi.
- `npm run verify:e2e`: test end-to-end. Prima del merge di una fase.

La CI esegue gli stessi due script: se uno manca, quel passo della CI si salta.

### 13.6 Riferire i risultati
Si riportano i comandi eseguiti e l'esito reale, e si dice esplicitamente cosa non è stato verificato.

### 13.7 Chiusura di una fase
Si lavora su `fase/fN-nome` (o `fix/nome` per una correzione fuori fase), partendo da `develop`. Quando i criteri di accettazione sono soddisfatti, la fase si chiude con questi passi, in quest'ordine:

1. **Piano.** Il file della fase passa a «completata» con «Fatto», «Verifiche» e «Rilievi aperti»; si aggiornano la riga in «Fasi» e, se servono, «Decisioni» e «Glossario» di `plan/README.md`.
2. **Controlli.** `npm run verify` e `npm run verify:e2e` (da quando esiste), con l'esito reale.
3. **Proposta.** All'utente si presentano il riepilogo (§19) e la sequenza dei passi 4–7, con un'unica domanda di conferma. Senza l'ok non si va avanti; se l'utente chiede modifiche, si riparte dal passo 1.
4. **Commit** sul branch della fase, con il messaggio che dice cosa cambia.
5. **Merge** in `develop` con `--no-ff` e messaggio «Merge fase/fN-nome in develop».
6. **Push** di `develop` e del branch della fase; la CI (`.github/workflows/ci.yml`) deve diventare verde (`gh run list`, `gh run watch`). Se è rossa, la si corregge su un `fix/…` prima di aprire la fase successiva.
7. **Indice.** `tokensave sync` dalla root.
8. **Sessione nuova.** Si dice all'utente che lo stato è completo in `plan/` e in git e che può fare `/clear`; la fase successiva riparte leggendo `plan/README.md` e il suo file.

Se un passo fallisce ci si ferma, si riferisce l'errore e non si salta ai passi successivi. Una correzione `fix/…` segue gli stessi passi; il messaggio del merge è «Merge fix/nome in develop».

### 13.8 Rilascio in `main`
Non fa parte della chiusura di una fase: si fa solo quando l'utente lo chiede, con la CI di `develop` verde.
1. Merge di `develop` in `main` con `--no-ff` («Merge develop in main: FN descrizione breve») e push di `main`.
2. <!-- Da compilare: hosting, cosa pubblica `main`, passi per le migrazioni, controllo dopo il deploy. -->

Deploy e migrazioni in produzione partono sempre con un ok esplicito, a parte da quello della fase.

## 14. Perimetro e difetti esistenti

- Si fa ciò che la fase chiede. Un difetto direttamente collegato si corregge nello stesso task e si segnala; gli altri diventano voci del backlog in `plan/`, non modifiche di passaggio.
- Il comportamento esistente si preserva, salvo che la fase lo cambi.

## 15. Configurazione del repository

### 15.1 Stack
<!-- Da compilare in F0: framework, versioni, file di configurazione e loro particolarità. Una sottosezione per strumento (15.2, 15.3…). -->

### 15.x Evidenze per gli audit
<!-- Quando serve: uno script `audit:capture` (Playwright) che salva screenshot, report axe e albero accessibile in `audit/<audit_id>/evidenze/`, su dati finti. -->

### 15.y Agenzie
Ruoli, attivazione e coordinamento delle agenzie sono in `AGENTS.md`, sezione «Agenzie», e in `docs/AI Multi-Agency System.md`. Le regole delle agenzie si aggiungono a questo documento, non lo sostituiscono.

## 16. Istruzioni e conflitti

L'ordine di precedenza è: richiesta esplicita dell'utente, poi decisioni registrate in `plan/`, poi questo documento, poi `AGENTS.md` e i file di ruolo delle agenzie. Se due regole si contraddicono si segnala il conflitto all'utente invece di sceglierne una in silenzio. `CLAUDE.md` importa `AGENTS.md`.

## 17. Definition of Done

**Implementazione**: criteri di accettazione soddisfatti, codice secondo queste regole, nessun codice morto, nessun segreto.

**Esperienza e affidabilità**: stati di caricamento, vuoto ed errore; tastiera e contrasto; dispositivi del progetto provati; esiti veri; nessun dato dell'utente perso o alterato.

**Verifica**: `npm run verify` superato; `npm run verify:e2e` superato per il merge; test nuovi per il comportamento nuovo; revisione del Code Reviewer.

**Comunicazione**: file della fase aggiornato; rilievi aperti elencati; conferma dell'utente per commit, merge e push.

## 18. Eccezioni

Un'eccezione a queste regole si scrive nella tabella «Decisioni» di `plan/README.md` o nel file della fase, con il motivo, prima del codice.

## 19. Risposta finale

Chi chiude un task riferisce, in quest'ordine: cosa è stato fatto, file toccati, controlli eseguiti con l'esito reale, ruoli delle agenzie consultati, rilievi rimasti aperti e decisioni che servono all'utente.
