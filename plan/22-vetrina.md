# F22 — Vetrina del server MCP

**Obiettivo**: far trovare il server MCP a chi legge i README e il sito: badge di mcprush nei README e nel footer, link a npm nel footer, sito allineato alla 0.5.0 di `@agentrica/mcp`.

> **Stato: completata** il 2026-11-18 su `fase/f22-vetrina` (in questo repository e in `agentrica-site`). Nata da una proposta di mcprush, il catalogo che dà al server il voto A («security»).

**Agenzie**: privacy (GDPR, Legal, Vendor Compliance) per l'immagine caricata da un altro sito, software (Frontend, QA, Code Reviewer).

## Decisioni dell'utente (2026-11-18)

| Tema | Decisione |
|---|---|
| README | Badge compatto di mcprush in tutti e tre i README (`README.md`, `packages/mcp/README.md`, `packages/mcp/README.en.md`); su npm compare con la prossima versione pubblicata |
| Sito | Badge `card.svg` caricato da mcprush.com nel footer, con il voto in tempo reale, al posto di una copia locale; CSP `img-src` aperta solo a `https://mcprush.com`, note legali aggiornate |
| npm | Link a `https://www.npmjs.com/package/@agentrica/mcp` nel footer |
| 0.5.0 | Già su npm (`latest`) e nel registro MCP (`isLatest`); manca solo nel sito, che usava 0.4.0 |

## Requisiti privacy (ruoli nella sessione; non è una dichiarazione di conformità)

- Mcprush è titolare autonomo (sua informativa, in vigore dal 21 ottobre 2026): server di netcup in Germania, richieste attraverso Cloudflare negli Stati Uniti; i log registrano IP, user agent, pagina di provenienza e indirizzo richiesto. Nessun accordo art. 28: il sito non affida a mcprush un trattamento per suo conto.
- Minimizzazione: `referrerPolicy="no-referrer"` (mcprush non sa da quale pagina arriva il visitatore) e `loading="lazy"` (l'immagine parte solo quando il footer si avvicina). La risposta del badge non imposta cookie.
- Base: legittimo interesse a mostrare il voto (art. 6.1.f). Note legali: la frase «non carica risorse da altri siti» diventa l'eccezione del badge, più un paragrafo su mcprush con il link alla sua informativa.

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F22-01 | Badge compatto nei tre README | P2 |
| F22-02 | Footer del sito: badge di mcprush e link a npm | P2 |
| F22-03 | CSP, note legali ed e2e per il badge | P1 |
| F22-04 | Sito su `@agentrica/mcp` 0.5.0 | P1 |

## Fatto

- **F22-01** Badge `compact.svg` sotto il titolo dei tre README. Il codice via shields.io proposto da mcprush dà un badge rotto («invalid properties: logoColor» nel JSON di mcprush): si usa l'SVG diretto.
- **F22-02** `agentrica-site/src/components/site-footer.tsx`: «Il server MCP è su npm» e il badge 380×200 (`max-w-full`, a 390 px non scorre).
- **F22-03** `next.config.ts` con `img-src 'self' data: https://mcprush.com`; note legali con il paragrafo su mcprush; `e2e/pubblicazione.spec.ts` ammette solo `https://mcprush.com/badge/agentrica-mcp/`, senza referrer, e cerca «mcprush» nelle note legali.
- **F22-04** `@agentrica/mcp` 0.5.0 a versione esatta nel sito; il comando di installazione del sito legge la versione dal pacchetto.

## Verifiche

- `npm run verify` in questo repository e in `agentrica-site`: verde.
- `npm run verify:e2e` in `agentrica-site`: 63 passati, 1 saltato.
- Prova visiva del footer in `next dev` a 1280 e 390 px: badge caricato, link a npm, nessuno scorrimento orizzontale.

## Rilievi aperti

- Il badge e la scheda di mcprush mostrano ancora v0.4.0: dipende da quando mcprush rilegge npm o il registro MCP. Chiuso in F30 (F30-13, P4, 2026-11-22): la scheda di mcprush mostra v0.8.0 del 21 Nov 2026, grado A, locale su stdio.
- Il testo del badge dice «high access»: è il giudizio di mcprush su un server locale, non un rilievo nostro. Chiuso in F30 (F30-01): nessuna azione.
- Il paragrafo su mcprush nelle note legali va riletto da un legale, come il resto (commento `ponytail:` nella pagina). Chiuso in F30 (F30-04): rischio accettato dall'utente il 2026-11-21, senza revisione legale; riaprire con i casi scritti in PRIV-PUB-01.
- Il sito va in produzione con il merge in `main` di `agentrica-site` (CONVENTIONS §13.8), su richiesta dell'utente. Chiuso in F30 (F30-01): `main` del sito allineato a `develop`, 0.8.0 in produzione.
