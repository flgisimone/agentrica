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

### 2.6 Fasi e backlog
Il lavoro si divide in fasi, una alla volta, elencate in `plan/README.md` (tabella «Fasi») con le decisioni prese.
- **File di fase.** Ogni fase ha `plan/NN-nome.md` con obiettivo, stato, agenzie, situazione di partenza, decisioni dell'utente, `## Backlog`, `## Criteri di accettazione` e, alla chiusura, «Fatto», «Verifiche» e «Rilievi aperti» (modello: `plan/00-base.md`).
- **Backlog.** Una tabella con id `FN-NN`, task e priorità (`P0`–`P3`, come in `AGENTS.md`), confermata dall'utente all'apertura. Un task è fatto quando «Fatto» cita il suo id in grassetto (`**FN-NN**`) con l'evidenza: il pannello locale legge questo formato.
- **Apertura.** Le «proposte da confermare» del file si decidono con l'utente; si apre `fase/fN-nome` da `develop`.
- **Durante.** Ciò che esce dal perimetro diventa una voce del backlog o un rilievo aperto, non una modifica di passaggio (§14). Le correzioni fuori fase vanno su `fix/nome`.
- **Chiusura.** Procedura di §13.7; i «Rilievi aperti» restano visibili finché una fase successiva non li chiude con un'evidenza.

## 3. Scrittura del codice

- **Leggibilità prima di tutto**: nomi che dicono cosa contengono, funzioni brevi con una responsabilità, flusso lineare con uscite anticipate.
- **Semplicità**: il codice più corto che resta chiaro. Niente «per dopo».
- **DRY senza esagerare**: si estrae alla terza ripetizione o quando la logica deve restare identica.
- **Costanti**: niente valori magici ripetuti; sigle, nomi dei reparti e nomi in codice stanno solo in `packages/catalog/src/departments.ts`.
- **Lingua del codice**: API (rotte, payload, tabelle, colonne) e identificatori in inglese; testi visibili e commenti in italiano. Vale dal codice nuovo di F11: quello esistente non si rinomina.
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
| `packages/mcp/` | (F5) il server MCP, che legge lo stesso catalogo; da F17 lo esporta anche come `@agentrica/mcp/catalog` per il sito |
| `plan/` | decisioni e fasi |
| `starter/` | (F18) il modello di progetto che `agentrica-mcp init` copia insieme ad `agents/` e `.claude/agents/`: solo regole generali, le parti dello stack «da compilare» |
| `.claude/agents/` | i ruoli come subagent per lavorare al repository; `init` li copia nei progetti nuovi con il loro nome, quindi nominano il progetto solo in «del progetto Agentrica.» |
| `audit/`, `docs/` | rilievi degli audit e materiale di riferimento |

Il catalogo non importa Next, React né il browser (lo controlla ESLint): deve servire anche al server MCP.

Da F17 il sito è nel repository privato `flgisimone/agentrica-site` (in locale `../agentrica-site`): Next.js con App Router, `src/app/` pagine, layout e `globals.css` con i token, `src/components/` i componenti (`ui/` quelli di shadcn), `src/lib/` le utilità, `e2e/` le prove con Playwright. Installa `@agentrica/mcp` a versione esatta e ne legge il catalogo; le sezioni di questo documento sul sito (§9, §11, §12, §13.4, §15.3) valgono lì.

## 6. Dati e stato

- Il sito non ha database né dati dinamici: legge il catalogo al build con `loadCatalog()` e genera HTML statico.
- Un contenuto del sito che parla di reparti o agenti viene dal catalogo; un testo scritto a mano nel sito non ripete né contraddice quello dei file di ruolo.
- Le pagine sono Server Components che leggono il catalogo al build e vengono pre-generate (per le pagine con parametri, `generateStaticParams`). Nessuna libreria di stato; `"use client"` solo dove serve un'interazione (oggi i componenti di Base UI).

## 7. Confini: catalogo e file di ruolo

- I file di ruolo si chiamano `NN-nome.md` (dal 01, senza buchi); `00-common-rules.md` sono le regole comuni del reparto.
- Un ruolo nuovo richiede il suo nome in codice in `departments.ts`: altrimenti il catalogo si ferma.
- Un nome in codice, una volta pubblicato, non cambia: è un identificativo anche per il server MCP.

## 8. Interazioni

- Link e pulsanti sono elementi nativi (`<a>`, `<button>`); la navigazione funziona senza JavaScript.
- Ogni invito all'azione dice dove porta; una funzione non ancora disponibile (es. il server MCP) si dichiara come futura, senza link finti.

## 9. Componenti

- Un componente React fa una cosa e riceve dati già pronti dal catalogo come props; Server Component salvo bisogno di stato o eventi.
- Prima di creare un componente si usa quello di shadcn (`npx shadcn add <nome>` nel repository del sito, poi adattato ai token); i file in `src/components/ui/` importano `cn` da `@/lib/utils`.
- Le chiavi delle liste sono stabili: l'`id` dell'agente o la sigla del reparto.
- Niente framework UI nel browser (React, Vue…) senza una decisione in `plan/README.md`.

## 10. Accesso e protezione

- Nessun segreto nel codice né nei log. I file `.env*` non entrano in git.
- Il sito è pubblico e statico: niente form, cookie o tracciamento senza una decisione in `plan/README.md` e il passaggio dalla privacy.

## 11. Interfaccia, coerenza e accessibilità

- Si usano i token di `src/app/globals.css` del sito, mai colori scritti a mano; ogni reparto ha il suo colore d'accento.
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
- Font di sistema o un solo font self-hosted (`next/font`); immagini con `next/image`; nessuno script di terze parti.

## 13. Test e controlli

### 13.1 Cosa testare
Si testano il comportamento e i rischi: il catalogo (conteggi, nomi in codice unici, numerazione, file malformati), il server MCP e, nel repository del sito, che il sito mostri i dati del catalogo. Un bug corretto ha il suo test di regressione.

### 13.2 Test unitari
Con `node --test` accanto al codice (`packages/*/src/*.test.ts`, `scripts/*.test.ts`; `npm test`), senza dipendenze in più.

### 13.3 Schema e migrazioni
Non ci sono database. Il «formato» da proteggere è quello dei file di ruolo (§7).

### 13.4 Test end-to-end
Con Playwright in `e2e/` del repository del sito, sul sito costruito (da F1; da F17 solo lì). L'accessibilità si controlla con axe: nessuna violazione serious o critical, salvo i rilievi aperti elencati.

### 13.5 Controlli prima del commit e del merge
- `npm run verify`: typecheck (catalogo, server MCP e script con `tsc`), lint e test unitari. Prima di ogni commit.
- `npm run verify:e2e`: test end-to-end, da F17 solo nel repository del sito (lì `verify` aggiunge `next typegen` e la build). Prima del merge di una fase che tocca il sito.

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
1. Pull request da `develop` a `main` (`gh pr create --base main --head develop --title "Rilascio: FN descrizione breve"`), unita con merge commit quando il controllo `verify` è verde (`gh pr merge --merge`). Il ruleset `main` vieta push diretti, force push e altri metodi di unione.
2. **Sito**: da F17 Vercel pubblica `main` del repository privato `agentrica-site`, con le stesse regole (PR da `develop`, CI verde). Un rilascio del pacchetto arriva sul sito quando lì si alza la versione di `@agentrica/mcp`: Dependabot apre la PR verso `develop` di `agentrica-site` entro un giorno; la si unisce con la CI verde e poi si rilascia il sito in `main`.
3. **Pacchetto MCP**: con la versione di `packages/mcp/package.json` (e `VERSION` in `prompt.ts`, il comando del sito e le «Versioni» dei README) già aggiornata su `main`, si crea il tag `vX.Y.Z` su `main` e lo si pusha; `.github/workflows/release.yml` controlla e pubblica su npm con provenance, dopo l'approvazione dell'ambiente `npm`. Il ruleset `versioni` lascia creare i tag `v*` solo all'amministratore del repository.
4. **Eccezione, solo per la 0.1.0**: npm configura il trusted publisher dalla pagina di un pacchetto che esiste già, quindi la prima versione si pubblica a mano da `main` (`npm publish -w @agentrica/mcp --access public`, con il codice 2FA) e non ha provenance. Subito dopo si configura il trusted publisher (repository `flgisimone/agentrica`, workflow `release.yml`, ambiente `npm`) e dalla versione successiva vale il punto 3. Per la 0.1.0 non si crea il tag, che avvierebbe la release.

Deploy e pubblicazioni partono sempre con un ok esplicito, a parte da quello della fase.

## 14. Perimetro e difetti esistenti

- Si fa ciò che la fase chiede. Un difetto direttamente collegato si corregge nello stesso task e si segnala; gli altri diventano voci del backlog in `plan/`, non modifiche di passaggio.
- Il comportamento esistente si preserva, salvo che la fase lo cambi.

## 15. Configurazione del repository

### 15.1 Monorepo
npm workspaces (`packages/*`); le dipendenze di sviluppo comuni (TypeScript, ESLint) stanno nella root, quelle di un pacchetto nel suo `package.json`. Node dalla versione di `.nvmrc`. Gli script si lanciano dalla root (`npm run verify`).

### 15.2 TypeScript ed ESLint
`tsconfig.base.json` strict per catalogo, server MCP e script; il sito ha il suo `tsconfig.json` strict (con il plugin di Next e `@/*`). TypeScript resta alla 6 finché typescript-eslint non supporta la 7. `eslint.config.js` usa le regole consigliate di `typescript-eslint` e vieta Next e React nel catalogo; il sito usa `eslint-config-next`.

### 15.3 Next.js e Tailwind (repository del sito)
Next.js 16 con App Router e Turbopack. Questa versione cambia API e convenzioni: prima di scrivere codice si legge la guida pertinente in `node_modules/next/dist/docs/` (lo ricorda l'`AGENTS.md` del sito, scritto da `next dev`). Niente `output: export`: le pagine sono pre-generate, ma restano possibili route server.

Il sito legge il catalogo da `@agentrica/mcp/catalog`, che trova `agents/` accanto al proprio file (`import.meta.dirname`): per questo `next.config.ts` ha `serverExternalPackages: ["@agentrica/mcp"]`, che lo carica da `node_modules` invece di impacchettarlo. In questo repository il catalogo trova `agents/` risalendo dalla cartella corrente (`findAgentsDir`), per i test e gli script.

Tailwind 4 con `@theme inline` in `src/app/globals.css`: i token di shadcn (`--background`, `--card`, `--muted-foreground`…) hanno i valori del tema scuro; gli accenti dei reparti sono `--aibpd` … `--aiwda` e `--dept`, che `[data-dept="SIGLA"]` imposta per il sottoalbero (classi `text-dept`, `border-dept`, `bg-dept`). shadcn con lo stile base-nova su Base UI (`components.json`).

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
