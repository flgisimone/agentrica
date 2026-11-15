# F11 — Analytics

**Obiettivo**: contare le pagine viste del sito con un sistema nostro: contatori aggregati in Postgres, nessun dato personale, nessun cookie, testi del sito che dicono il vero su cosa viene raccolto.

> **Stato: aperta.** Piano scritto e committato; nessun codice.

## Prossimi passi (per la sessione nuova)

1. Revisione privacy del design (F11-01), nella sessione principale con i ruoli privacy; rilievi in `audit/`.
2. L'utente crea il database Neon dal Marketplace di Vercel (regione Frankfurt) collegato al progetto `agentrica` (F11-02): Vercel aggiunge `DATABASE_URL`.
3. Conferma della dipendenza `@neondatabase/serverless` a versione esatta.
4. Poi F11-03 → F11-09. Nomi di API, tabelle e identificatori in inglese (CONVENTIONS §3).

**Agenzie**: privacy (GDPR Specialist, Data Governance, Legal Specialist) prima del design, come chiede la decisione «Privacy dei trasporti»; software (Database Engineer, Backend, Frontend, DevOps, QA, Security, Code Reviewer); design (UX Writer) per footer e note legali.

## Situazione di partenza

- Il sito dice «niente cookie, niente analytics» nel footer ([site-footer.tsx](../apps/site/src/components/site-footer.tsx)), nei metadati e nel testo di `/note-legali`.
- Il commento `ponytail:` di `/note-legali` chiede di rileggere il testo prima di aggiungere analytics; PRIV-PUB-01: sul piano Hobby Vercel non offre un DPA.
- CSP «tutto dal sito stesso» in [next.config.ts](../apps/site/next.config.ts); il sito è statico, senza route server né database.

## Decisioni all'apertura (2026-11-15)

- **Analytics in casa** al posto di Vercel Web Analytics: niente dati dei visitatori a Vercel oltre ai log di hosting già descritti, quindi niente DPA in più su Hobby.
- **Postgres** (Neon dal Marketplace di Vercel, regione UE) con contatori aggregati.
- **Lettura da terminale** con uno script (`npm run pageviews`); nessuna pagina di statistiche.

## Design proposto (da confermare dopo la revisione privacy)

- **Client**: un componente nel layout chiama `navigator.sendBeacon("/api/pageviews", pathname)` a ogni cambio di pagina; non legge né scrive nulla nel browser. In sviluppo e negli e2e non invia nulla.
- **Route** `POST /api/pageviews` (Node, dinamica): accetta solo percorsi che esistono nel catalogo (`/`, `/reparti/[sigla]`, `/agenti/[id]`, `/note-legali`), scarta i bot dichiarati, tiene della provenienza solo il dominio del `Referer` (o «diretto»), risponde 204 anche quando scarta.
- **Dati**: tabella `page_views (day date, path text, referrer_host text, count integer, primary key (day, path, referrer_host))`, aggiornata con `insert … on conflict do update`. Niente IP, user agent, hash o identificativi: nessun dato personale.
- **Abusi**: chiunque può gonfiare i contatori; i percorsi e le provenienze ammessi limitano le righe possibili, il body ha un limite di dimensione. Un tetto per IP richiederebbe di trattare l'IP: non si fa (`ponytail:`).
- **Connessione**: `DATABASE_URL` nelle variabili d'ambiente di Vercel (solo server); driver `@neondatabase/serverless` (HTTP) a versione esatta, dipendenza nuova da confermare.
- **Schema**: file SQL versionato e script di migrazione; la creazione in produzione si fa con l'ok dell'utente.
- **Lettura**: `npm run pageviews` stampa pagine viste per giorno, pagina e provenienza, con `DATABASE_URL` da un `.env` locale ignorato da git.
- **Conservazione**: conteggi aggregati, conservazione da decidere con privacy (proposta: illimitata, non sono dati personali).

## Backlog

| # | Task | Priorità |
|---|---|---|
| F11-01 | Revisione privacy del design: dati raccolti, ePrivacy (art. 122 Codice privacy, EDPB 2/2023), log di Vercel e del DB, conservazione; rilievi in `audit/` | P1 |
| F11-02 | Database Neon in regione UE dal Marketplace di Vercel, collegato al progetto (lo crea l'utente) | P1 |
| F11-03 | Schema `page_views`, script di migrazione, test del calcolo di pagina e provenienza | P1 |
| F11-04 | Route `POST /api/pageviews` con controlli su percorso, bot, dimensione | P1 |
| F11-05 | Componente client con `sendBeacon` nel layout, spento in sviluppo | P1 |
| F11-06 | Script `npm run pageviews` | P2 |
| F11-07 | Testi: footer, metadati e `/note-legali` con UX Writer e privacy | P1 |
| F11-08 | Revisione di sicurezza della route; decisione «Privacy dei trasporti» di `plan/README.md` aggiornata | P1 |
| F11-09 | Prove: unitari, verify, e2e e axe; dopo il rilascio, prima visita contata in produzione | P1 |

## Criteri di accettazione

- Una visita in produzione incrementa il contatore della pagina; la route rifiuta percorsi inesistenti senza creare righe.
- Nel database non c'è nessun dato personale; nel browser nessun cookie né storage.
- La CSP resta `'self'`.
- Footer e `/note-legali` descrivono il conteggio come è; nessun testo dice ancora «niente analytics».
- Il server MCP resta senza telemetria.
- `npm run verify` e `npm run verify:e2e` verdi.
