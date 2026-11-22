# F33 — Sito multilingua

**Obiettivo**: il sito esiste in italiano e in inglese, con URL `/it` e `/en`, la lingua presa dal browser alla prima visita e un selettore che la ricorda; interfaccia e contenuti degli agenti in una lingua sola per pagina. Alla fine, rilascio insieme di pacchetto 0.9.0 e sito.

> **Stato: completata** (2026-11-22), con il rilascio 0.9.0 di pacchetto e sito. Branch `fase/f33-sito-multilingua` nei due repository.

**Agenzie**: software (Frontend, DevOps, QA, Performance, Code Reviewer); design (Information Architect per URL e selettore, UX Writer per i testi, Accessibility per `lang` e selettore); privacy (il cookie della lingua e le note legali nelle due lingue).

## Situazione di partenza

- Sito in `../agentrica-site` (Next.js 16, App Router, Tailwind 4, shadcn/ui), solo in italiano: rotte `/`, `/agenti`, `/agenti/[id]`, `/reparti/[sigla]`, `/reputazione`, `/progetti`, `/consumo`, `/installa`, `/rilasci`, `/note-legali`; testi nei componenti di `src/app` e `src/components`.
- Contenuti degli agenti dal catalogo di `@agentrica/mcp/catalog`, che da F32 si legge per lingua.
- Le rotte `/api/*` restano in inglese e senza lingua (livello codice).

## Decisioni già prese (2026-11-22, in F31)

- URL con prefisso `/it` e `/en`; alla prima visita la radice reindirizza secondo `Accept-Language` (italiano se il browser è in italiano, altrimenti inglese); selettore di lingua nell'intestazione, la scelta resta in un cookie; pagine statiche per lingua con `hreflang`.
- Interfaccia e contenuti degli agenti tradotti.

## Decisioni prese all'apertura (2026-11-22)

- **Rotte**: segmenti tradotti in inglese (`/en/agents`, `/en/departments`, `/en/reputation`, `/en/projects`, `/en/usage`, `/en/install`, `/en/releases`, `/en/legal`); in italiano restano quelli di oggi. I vecchi URL senza prefisso reindirizzano.
- **Testi dell'interfaccia**: un file TypeScript per lingua in `src/i18n/` con lo stesso tipo, senza dipendenze nuove.
- **Note legali**: due testi equivalenti in italiano e in inglese, tenuti allineati; il rischio accettato PRIV-PUB-01 copre anche il testo inglese.
- **CHANGELOG**: il pacchetto ha anche il CHANGELOG inglese; `/en/releases` lo legge e da 0.9.0 ogni versione si scrive nelle due lingue.
- **F33-09**: il server 0.9.0 manda l'autore vuoto quando manca il nome da mostrare; il sito mostra «Utente di Agentrica» o «Agentrica user» secondo la pagina, anche per le proposte già arrivate con il nome predefinito.

## Backlog

| # | Attività | Priorità |
|---|---|---|
| F33-01 | Rotte `[lang]` con `generateStaticParams` per `it` ed `en`, redirect della radice e dei vecchi URL, `lang` su `<html>`, `hreflang` e sitemap | P1 |
| F33-02 | Selettore di lingua nell'intestazione, accessibile da tastiera e con lettore di schermo, cookie della lingua | P1 |
| F33-03 | Testi dell'interfaccia in italiano e in inglese per tutte le pagine e i componenti | P1 |
| F33-04 | Reparti e agenti dal catalogo nella lingua della pagina | P1 |
| F33-05 | Note legali, `/installa` e `/rilasci` nelle due lingue; voce del cookie della lingua nelle note legali | P1 |
| F33-06 | Test e2e nelle due lingue (redirect, selettore, pagine principali) | P1 |
| F33-08 | Dai rilievi di F32: il server 0.9.0 punta le informative di valutazioni, consumo e progetti (`note-legali#…`) alla pagina della lingua scelta; il sito usa `loadCatalog("en")` per `/en` | P1 |
| F33-09 | Dai rilievi di F32: nome predefinito di un progetto proposto dal server senza nome da mostrare («Utente di Agentrica» / «Agentrica user», commento `ponytail:` in `showcase.ts`): decidere se il server lo manda vuoto e il sito lo mostra nella lingua della pagina | P2 |
| F33-07 | Rilascio insieme: pacchetto 0.9.0 su npm e registro MCP, sito con la dipendenza 0.9.0, comandi nei README; solo con l'approvazione esplicita dell'utente | P1 |

## Criteri di accettazione

- Ogni pagina esiste in `/it` e in `/en`, tutta in una lingua; il browser in italiano arriva su `/it`, gli altri su `/en`; la scelta del selettore vale alle visite successive.
- I vecchi URL senza prefisso reindirizzano alla pagina giusta.
- `npm run verify` e `npm run verify:e2e` verdi nei due repository; revisione di design e accessibilità nel sito; Code Reviewer sul diff.
- Pacchetto e sito pubblicati alla stessa versione.

## Fatto

Nel sito (`agentrica-site`):

- **F33-01** Pagine sotto `src/app/[lang]/` (le cartelle restano italiane, la storia con `git mv`), root layout con `<html lang>`, `generateStaticParams` per `it` ed `en` e `dynamicParams = false`. `src/i18n/config.ts`, senza dipendenze, ha la mappa delle parole (`EN_WORDS`: segmenti, ancore usate fra le pagine e il parametro del filtro) e `localize`, `unlocalize`, `switchLang`, `negotiate`: nel codice i percorsi si scrivono una volta, nella forma italiana. `next.config.ts` riscrive `/en/agents` su `/en/agenti` e reindirizza (308) `/en/agenti` su `/en/agents`. `src/proxy.ts` porta la radice e i vecchi URL senza prefisso (307, `Vary: Accept-Language, Cookie`) alla lingua del cookie o, senza, a quella preferita del browser (italiano solo se è la prima). Canonical e `hreflang` (`it`, `en`, `x-default` sull'indirizzo senza lingua) in ogni pagina; `sitemap.ts` con le alternative e `robots.ts`; immagine Open Graph per lingua.
- **F33-02** Selettore «IT · EN» nell'intestazione, anche su telefono: link alla stessa pagina nell'altra lingua con `hreflang`, `lang`, `aria-current` e il nome intero per i lettori di schermo («IT – Italiano»); al clic scrive il cookie `lang` (un anno, `SameSite=Lax`, `Secure` in https).
- **F33-03** Testi dell'interfaccia in `src/i18n/it.ts` ed `en.ts` con lo stesso tipo; `dict.ts` puro per server, client e `src/lib`, `client.ts` con `useLang` e `useDict` dai parametri della rotta. Numeri, date e mesi con il `locale` del dizionario. Le due pagine di sola prosa (installa, note legali) hanno un componente per lingua (`content-it.tsx`, `content-en.tsx`, segnato `ponytail:`). Copioni dei terminali e comandi per lingua in `scripts.ts`, confrontati con `README.it.md` e `README.md` del pacchetto; `/installa` aggiornata a `list_agents` e `agent`, con `--lang` e la nota sui nomi cambiati nella 0.9.0.
- **F33-04** Reparti e agenti da `loadCatalog(lang)`, letti una volta per lingua (`getCatalog`).
- **F33-05** Note legali in due testi equivalenti, con la sezione «La lingua e il suo cookie» (cookie tecnico senza consenso, art. 122 del Codice e linee guida del Garante del 2021; `Accept-Language` usato e non salvato), i comandi 0.9.0 (`project`, `remove`, `configure`), le cinque scelte della configurazione e il reclamo anche all'autorità del paese di residenza. Footer: «Un cookie solo, per la lingua; niente analytics». `/en/releases` legge `CHANGELOG.en.md`; i tipi delle voci sono posizioni comuni alle due lingue.
- **F33-06** e2e: le prove esistenti sotto `/it`; `lingua.spec.ts` con redirect da browser italiano e inglese, segmento italiano sotto `/en`, `hreflang`, selettore da mouse e da tastiera, cookie che vince sul browser, pagine inglesi con il catalogo inglese, sitemap e robots, axe su sei pagine inglesi; CSP verificata anche su due pagine inglesi; `/install` confrontata con `README.md`.
- **F33-09** Il sito accetta l'autore vuoto per le proposte dal server (anche i nomi predefiniti mandati fino alla 0.8.1), lo salva come `null` e la scheda scrive «Utente di Agentrica» o «Agentrica user»; link di rimozione nella lingua della pagina.

Nel pacchetto (0.9.0):

- **F33-08** `legalUrl` in `texts/index.ts`: valutazioni, consumo e progetti puntano a `/it/note-legali#…` o `/en/legal#ratings|usage|projects` secondo la lingua del server.
- **F33-09** Senza nome da mostrare l'autore parte vuoto; l'anteprima dice «nessuno (il sito scrive …)», così mostra esattamente cosa parte.
- `CHANGELOG.en.md` con tutte le versioni dalla 0.1.0, nel pacchetto e negli `exports`; `prompt.test.ts` controlla che i due CHANGELOG abbiano le stesse versioni, date, tipi e voci. Voci di F33 nella 0.9.0 dei due file; il README inglese rimanda al CHANGELOG inglese.

## Verifiche

- Pacchetto: `npm run verify` verde, 160 test (con `legalUrl` in inglese e i CHANGELOG gemelli).
- Sito, con il pacchetto 0.9.0 locale (`npm install --no-save` del tgz di `npm pack`): `npm run verify` verde (69 unitari, build senza avvisi di Turbopack, 238 pagine statiche); `npm run verify:e2e` verde, 119 prove su computer e telefono, una saltata (tastiera solo sul computer).
- Server di produzione in locale: `/` con browser italiano → `/it`, inglese → `/en`, francese con cookie `it` → `/it`; `/agenti/aisa-02?x=1` con browser inglese → `/en/agents/aisa-02?x=1`; `/en/agenti/aisa-02` → 308 `/en/agents/aisa-02`; `/it/xyz` 404; `/api/*` e file statici fuori dal proxy. Nessuna parola italiana nelle pagine inglesi principali, salvo i nomi storici dei comandi nei rilasci.
- Revisione visiva (ruoli UI e Accessibility): screenshot a 1440 e 360 px dell'intestazione con il selettore e del menu del telefono; bersagli di 40 px, nessuno scorrimento orizzontale.
- Revisione privacy (ruoli AIPCA-03 e AIPCA-07): un solo cookie, tecnico, scritto solo alla scelta, con il solo valore della lingua; la navigazione senza scelta non crea cookie (e2e); i due testi delle note legali dicono le stesse cose.
- Code Reviewer sul diff dei due repository: COMMENT, nessun difetto bloccante; rilievi sotto.
- **F33-07, rilascio** (2026-11-22, con l'approvazione dell'utente). Pacchetto: PR #26 `develop` → `main`, tag `v0.9.0`, pubblicazione dalla CI con provenance dopo l'approvazione dell'ambiente `npm` (run 45035824059); `latest` su npm 0.9.0; `io.github.flgisimone/agentrica` 0.9.0 `active` e `isLatest` nel registro MCP (`mcp-publisher`, login GitHub dell'utente). Sito: `@agentrica/mcp` 0.9.0 da npm, verify ed e2e verdi (119 prove, una saltata), CI di `develop` verde, PR #16 in `main`, deploy di Vercel. In produzione: radice → `/it` o `/en` secondo il browser, `/agenti/aisa-02` → `/en/agents/aisa-02` con browser inglese, `/en/agenti` → 308, `/en/legal`, `/en/releases` (0.9.0), sitemap e robots 200, `<html lang="en">`, CSP attiva, `POST /api/ratings` vuoto → 400. `develop` e `main` allineati nei due repository.

## Rilievi aperti

- (P1) F33-07, rilascio: risolto il 2026-11-22 (vedi «Verifiche»).
- (P3) I link alle note legali dei server fino alla 0.8.1 (`/note-legali#valutazioni`) portano un browser inglese a `/en/legal#valutazioni`, che non scorre alla sezione (`#ratings`): chiuso come accettato il 2026-11-22, con la conferma dell'utente. Sparisce con l'aggiornamento alla 0.9.0; si riapre se arrivano segnalazioni.
- (P3) Manifest solo in italiano: risolto in `fix/rilievi-f33` (2026-11-22) con un manifest neutro, confermato dall'utente: nome «Agentrica», descrizione in inglese, senza `lang`, `start_url` «/» che porta alla lingua del browser o a quella scelta.
- (P3) Modulo della issue solo in italiano: risolto in `fix/rilievi-f33` (2026-11-22), confermato dall'utente. `.github/ISSUE_TEMPLATE/project.yml` («Show your project»), gemello inglese di `progetto.yml` con la stessa etichetta `progetto`; `npm run projects` riconosce le etichette delle due lingue (`FORM_EN`, prova unitaria); la pagina inglese dei progetti e il README inglese del pacchetto linkano il modulo inglese, le note legali nominano i due moduli. Consenso e licenza in inglese restano nel rischio accettato PRIV-PUB-01.
