# Convenzioni di Agentrica

Regole per chi lavora al codice di Agentrica, persone o agenti. `AGENTS.md` le completa con le regole per gli agenti e le agenzie (§16).

## 1. Scopo

Agentrica è una società di consulenza fittizia fatta di agenti IA: un sito la presenta (landing, reparti, biografie) e un server MCP renderà gli stessi agenti usabili nei progetti di terzi. La cosa da non rompere mai è la **fonte unica**: i file di `agents/` sono il catalogo, e sito e server MCP li leggono da `packages/catalog` senza copiarne i testi. Il sito non inventa persone, clienti, risultati o recensioni e dice sempre che gli agenti sono IA.

Le regole servono a tre cose, in quest'ordine: tenere il catalogo coerente e onesto, tenere il codice semplice e leggibile, consegnare modifiche verificate.

## 2. Flusso di lavoro

### 2.1 Leggere prima
Prima di modificare il codice si leggono questo documento (le sezioni pertinenti), `AGENTS.md`, il file della fase in `plan/` e i criteri di accettazione. Uno script, una libreria o una configurazione esiste solo se lo si trova nel repository, non perché un documento lo descrive.

### 2.2 Capire il codice esistente
Si guardano i file coinvolti e le loro dipendenze, si cercano helper, tipi e componenti che risolvono già il problema, si capisce come scorrono i dati. Si seguono i pattern esistenti, salvo un motivo concreto.

### 2.3 Chiarire le ambiguità che contano
Si procede da soli quando i requisiti sono chiari e le scelte sono a basso rischio e reversibili. Si chiede all'utente quando un'ambiguità può cambiare il comportamento visibile, i contenuti del catalogo, la sicurezza o il perimetro. Le decisioni di prodotto non si prendono in silenzio.

### 2.4 La soluzione più piccola che regge
Si applica la scala Ponytail di `AGENTS.md`. Niente refactoring estranei, niente astrazioni o dipendenze non necessarie, comportamento esistente preservato.

### 2.5 Verificare
Si rilegge il diff, si eseguono i controlli (§13), si verificano i criteri di accettazione sull'implementazione reale. Non si dichiara superato un controllo che non è stato eseguito.

## 3. Scrittura del codice

- **Leggibilità prima di tutto**: nomi che dicono cosa contengono, funzioni brevi con una responsabilità, flusso lineare con uscite anticipate.
- **Semplicità**: il codice più corto che resta chiaro. Niente «per dopo».
- **DRY senza esagerare**: si estrae alla terza ripetizione o quando la logica deve restare identica.
- **Costanti**: niente valori magici ripetuti; sigle, nomi dei reparti e nomi in codice stanno solo in `packages/catalog/src/departments.ts`.
- **Commenti**: spiegano il perché, non il cosa. Brevi, in italiano. Una semplificazione voluta si segna con `ponytail:`, dicendo il limite e quando superarlo.
- **Codice morto**: si toglie, non si commenta.
- **Difese**: il catalogo valida i file di `agents/` quando li legge (titolo, numerazione, un nome in codice per file) e si ferma con un errore chiaro; dentro, si usano i tipi.

## 4. TypeScript

- `strict` resta attivo, con `noUncheckedIndexedAccess`. Niente `any`; `unknown` ai confini, poi restringimento.
- Asserzioni (`as`, `!`) solo dove un controllo precedente le garantisce, con un commento se non è evidente.
- Un tipo si definisce una volta e si deriva (`Pick`, `Omit`) invece di ridefinirlo: `Agent` e `Department` stanno nel catalogo e il sito li importa.
- Nel catalogo solo sintassi cancellabile (`erasableSyntaxOnly`): Node esegue i `.ts` senza compilazione, per test e script. Gli import interni usano l'estensione `.ts`.

## 5. Architettura del repository

| Cartella | Contenuto |
|---|---|
| `agents/` | i file di ruolo dei cinque reparti: la fonte unica dei contenuti |
| `packages/catalog/` | TypeScript senza dipendenze: legge `agents/`, assegna sigle e nomi in codice, restituisce `Department` e `Agent`; i test stanno accanto (`*.test.ts`) |
| `apps/site/` | il sito Astro, statico: `src/pages/` le pagine, `src/components/` i componenti, `src/styles/` i token |
| `packages/mcp/` | (F4) il server MCP, che legge lo stesso catalogo |
| `e2e/` | prove di fumo e accessibilità del sito con Playwright |
| `plan/` | decisioni e fasi |
| `.claude/agents/` | i ruoli come subagent per lavorare al repository |
| `audit/`, `docs/` | rilievi degli audit e materiale di riferimento |

Il catalogo non importa Astro né il browser (lo controlla ESLint): deve servire anche al server MCP.

## 6. Dati e stato

- Il sito non ha database né dati dinamici: legge il catalogo al build con `loadCatalog()` e genera HTML statico.
- Un contenuto del sito che parla di reparti o agenti viene dal catalogo; un testo scritto a mano nel sito non ripete né contraddice quello dei file di ruolo.
- Nessuna libreria di stato; il JavaScript nel browser solo dove serve un'interazione, nelle isole di Astro.

## 7. Confini: catalogo e file di ruolo

- I file di ruolo si chiamano `NN-nome.md` (dal 01, senza buchi); `00-common-rules.md` sono le regole comuni del reparto.
- Un ruolo nuovo richiede il suo nome in codice in `departments.ts`: altrimenti il catalogo si ferma.
- Un nome in codice, una volta pubblicato, non cambia: è un identificativo anche per il server MCP.

## 8. Interazioni

- Link e pulsanti sono elementi nativi (`<a>`, `<button>`); la navigazione funziona senza JavaScript.
- Ogni invito all'azione dice dove porta; una funzione non ancora disponibile (es. il server MCP) si dichiara come futura, senza link finti.

## 9. Componenti

- Un componente Astro fa una cosa e riceve dati già pronti dal catalogo come props.
- Le chiavi delle liste sono stabili: l'`id` dell'agente o la sigla del reparto.
- Niente framework UI nel browser (React, Vue…) senza una decisione in `plan/README.md`.

## 10. Accesso e protezione

- Nessun segreto nel codice né nei log. I file `.env*` (tranne `.env.example`) non entrano in git.
- Il sito è pubblico e statico: niente form, cookie o tracciamento senza una decisione in `plan/README.md` e il passaggio dalla privacy.

## 11. Interfaccia, coerenza e accessibilità

- Si usano i token di `apps/site/src/styles/`, mai colori scritti a mano; ogni reparto ha il suo colore d'accento.
- Lo stato non si affida mai al solo colore: c'è sempre un segno, una forma o un testo (la sigla accanto al colore del reparto).
- HTML semantico: un `h1` per pagina, titoli di sezione, liste per gli elenchi, etichette sui controlli.
- Tastiera: ogni azione è raggiungibile, il focus è visibile.
- Contrasto WCAG 2.2 AA: almeno 4,5:1 per il testo, 3:1 per gli elementi grafici; vale per ogni accento sul fondo scuro.
- Responsive da 360 px senza scorrimento orizzontale della pagina.
- `prefers-reduced-motion` rispettato: animazioni solo decorative e spente se richiesto.
- Testi in italiano, brevi, con il glossario di `plan/README.md`.

## 12. Prestazioni e affidabilità

- Si ottimizza solo su misure.
- Le dipendenze nuove richiedono un motivo e l'ok dell'utente; prima si guarda la libreria standard e la piattaforma. Le versioni si fissano esatte.
- Font di sistema o un solo font self-hosted; immagini ottimizzate da Astro; nessuno script di terze parti.

## 13. Test e controlli

### 13.1 Cosa testare
Si testano il comportamento e i rischi: il catalogo (conteggi, nomi in codice unici, numerazione, file malformati) e che il sito mostri i dati del catalogo. Un bug corretto ha il suo test di regressione.

### 13.2 Test unitari
Con `node --test` in `packages/catalog/src/*.test.ts` (`npm test`), senza dipendenze in più.

### 13.3 Schema e migrazioni
Non ci sono database. Il «formato» da proteggere è quello dei file di ruolo (§7).

### 13.4 Test end-to-end
Con Playwright in `e2e/`, sul sito costruito (da F1). L'accessibilità si controlla con axe: nessuna violazione serious o critical, salvo i rilievi aperti elencati.

### 13.5 Controlli prima del commit e del merge
- `npm run verify`: typecheck (catalogo con `tsc`, sito con `astro check`), lint, test unitari e build del sito. Prima di ogni commit.
- `npm run verify:e2e`: test end-to-end. Prima del merge di una fase, da F1.

La CI esegue gli stessi due script: se uno manca, quel passo della CI si salta.

### 13.6 Riferire i risultati
Si riportano i comandi eseguiti e l'esito reale, e si dice esplicitamente cosa non è stato verificato.

### 13.7 Chiusura di una fase
Si lavora su `fase/fN-nome` (o `fix/nome` per una correzione fuori fase), partendo da `develop`. Quando i criteri di accettazione sono soddisfatti, la fase si chiude con questi passi, in quest'ordine:

1. **Piano.** Il file della fase passa a «completata» con «Fatto», «Verifiche» e «Rilievi aperti»; si aggiornano la riga in «Fasi» e, se servono, «Decisioni» e «Glossario» di `plan/README.md`, e la tabella «Stato» del `README.md`.
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
2. Hosting e pubblicazione del pacchetto MCP si decidono in F5.

Deploy e pubblicazioni partono sempre con un ok esplicito, a parte da quello della fase.

## 14. Perimetro e difetti esistenti

- Si fa ciò che la fase chiede. Un difetto direttamente collegato si corregge nello stesso task e si segnala; gli altri diventano voci del backlog in `plan/`, non modifiche di passaggio.
- Il comportamento esistente si preserva, salvo che la fase lo cambi.

## 15. Configurazione del repository

### 15.1 Monorepo
npm workspaces (`packages/*`, `apps/*`); le dipendenze di sviluppo comuni (TypeScript, ESLint) stanno nella root, quelle di un'app nel suo `package.json`. Node dalla versione di `.nvmrc`. Gli script si lanciano dalla root (`npm run dev`, `npm run verify`).

### 15.2 TypeScript ed ESLint
`tsconfig.base.json` strict per il catalogo; il sito estende `astro/tsconfigs/strict`. TypeScript resta alla 6 finché typescript-eslint e `@astrojs/check` non supportano la 7. `eslint.config.js` vieta Astro nel catalogo; i file `.astro` li controlla `astro check`.

### 15.3 Astro
Output statico, telemetria spenta. Le pagine leggono il catalogo nel frontmatter al build. Il catalogo trova `agents/` risalendo dalla cartella corrente (`findAgentsDir`): gli script vanno lanciati da dentro il repository.

Astro 7 manda in background `astro dev` e `astro preview` quando li lancia un agente (Claude Code): il comando termina subito e il server resta attivo finché non lo si spegne con `npx astro preview stop` (o `astro dev stop`) da `apps/site`. Per un server in primo piano si aggiunge `--ignore-lock`, come fa `playwright.config.ts`.

### 15.4 Agenzie
Ruoli, attivazione e coordinamento delle agenzie sono in `AGENTS.md`, sezione «Agenzie», e in `docs/AI Multi-Agency System.md`. Le regole delle agenzie si aggiungono a questo documento, non lo sostituiscono.

## 16. Istruzioni e conflitti

L'ordine di precedenza è: richiesta esplicita dell'utente, poi decisioni registrate in `plan/`, poi questo documento, poi `AGENTS.md` e i file di ruolo delle agenzie. Se due regole si contraddicono si segnala il conflitto all'utente invece di sceglierne una in silenzio. `CLAUDE.md` importa `AGENTS.md`.

## 17. Definition of Done

**Implementazione**: criteri di accettazione soddisfatti, codice secondo queste regole, nessun codice morto, nessun segreto.

**Esperienza e affidabilità**: tastiera e contrasto; 360 px; contenuti dal catalogo; nessuna affermazione inventata.

**Verifica**: `npm run verify` superato; `npm run verify:e2e` superato per il merge; test nuovi per il comportamento nuovo; revisione del Code Reviewer.

**Comunicazione**: file della fase aggiornato; rilievi aperti elencati; conferma dell'utente per commit, merge e push.

## 18. Eccezioni

Un'eccezione a queste regole si scrive nella tabella «Decisioni» di `plan/README.md` o nel file della fase, con il motivo, prima del codice.

## 19. Risposta finale

Chi chiude un task riferisce, in quest'ordine: cosa è stato fatto, file toccati, controlli eseguiti con l'esito reale, ruoli delle agenzie consultati, rilievi rimasti aperti e decisioni che servono all'utente.
