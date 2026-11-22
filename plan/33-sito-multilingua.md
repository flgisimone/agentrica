# F33 — Sito multilingua

**Obiettivo**: il sito esiste in italiano e in inglese, con URL `/it` e `/en`, la lingua presa dal browser alla prima visita e un selettore che la ricorda; interfaccia e contenuti degli agenti in una lingua sola per pagina. Alla fine, rilascio insieme di pacchetto 0.9.0 e sito.

> **Stato: da aprire** dopo F32, che porta il catalogo in due lingue. Branch `fase/f33-sito-multilingua` nei due repository. Backlog e decisioni aperte si confermano con l'utente all'apertura.

**Agenzie**: software (Frontend, DevOps, QA, Performance, Code Reviewer); design (Information Architect per URL e selettore, UX Writer per i testi, Accessibility per `lang` e selettore); privacy (il cookie della lingua e le note legali nelle due lingue).

## Situazione di partenza

- Sito in `../agentrica-site` (Next.js 16, App Router, Tailwind 4, shadcn/ui), solo in italiano: rotte `/`, `/agenti`, `/agenti/[id]`, `/reparti/[sigla]`, `/reputazione`, `/progetti`, `/consumo`, `/installa`, `/rilasci`, `/note-legali`; testi nei componenti di `src/app` e `src/components`.
- Contenuti degli agenti dal catalogo di `@agentrica/mcp/catalog`, che da F32 si legge per lingua.
- Le rotte `/api/*` restano in inglese e senza lingua (livello codice).

## Decisioni già prese (2026-11-22, in F31)

- URL con prefisso `/it` e `/en`; alla prima visita la radice reindirizza secondo `Accept-Language` (italiano se il browser è in italiano, altrimenti inglese); selettore di lingua nell'intestazione, la scelta resta in un cookie; pagine statiche per lingua con `hreflang`.
- Interfaccia e contenuti degli agenti tradotti.

## Decisioni da prendere all'apertura

- **Nomi delle rotte in inglese**: stessi segmenti nelle due lingue (`/en/agenti`) o tradotti (`/en/agents`, `/en/departments`), con i redirect dai vecchi URL senza prefisso.
- **Testi dell'interfaccia**: dizionari per lingua (proposta: un file TypeScript per lingua in `src/i18n/`, senza dipendenze nuove) o una libreria (`next-intl`).
- **Note legali in inglese**: traduzione di cortesia con prevalenza del testo italiano, o due testi equivalenti.
- **CHANGELOG e `/rilasci`**: il CHANGELOG del pacchetto resta in italiano o ha la versione inglese.

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

## Verifiche

## Rilievi aperti
