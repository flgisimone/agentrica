# F53 — Impara: percorso di studio sull'IA costruito su Agentrica

**Obiettivo**: un'area del sito con un percorso a lezioni che porta chi usa un assistente di codice senza basi di IA fino agli agenti e a MCP, e da lì all'installazione del server, usando come esempio quello che è stato costruito in Agentrica. I contenuti stanno in questo repository, il sito li legge dal pacchetto e restano aggiornati a ogni fase.

> **Stato: completata** il 2026-11-28 su `fase/f53-impara` (anche in `agentrica-site`). Registrata il 2026-11-27; pianificata il 2026-11-28 (business: AIBPD-01, 04, 11; design: AIWDA-01, 04, 10), con backlog e criteri confermati dall'utente.

**Agenzie**: software (Backend per `learn/` e l'export, Frontend nel sito, QA, Code Reviewer); web design in revisione (UI, Accessibility, UX Writer sui testi delle lezioni).

## Situazione di partenza

- Il sito legge il catalogo da `@agentrica/mcp/catalog` a versione esatta; pacchetto e sito si rilasciano insieme, alla stessa versione.
- Il materiale per le lezioni c'è già: `plan/` (decisioni e fasi), `examples/` (misure dei modelli), `agents/` con la biblioteca, `docs/`, il codice del server MCP e del pannello.
- Il sito è in due lingue (`/it`, `/en`): le parole dei percorsi si traducono con `localize` (`agentrica-site/src/i18n/config.ts`), e c'è già un componente per il Markdown (`agentrica-site/src/components/markdown.tsx`).
- 52 fasi completate e 2 sospese in `plan/README.md`; il sito non ha analytics, quindi i criteri di successo sono controlli sul contenuto, non dati d'uso.

## Decisioni dell'utente

| Tema | Decisione | Data |
|---|---|---|
| Fonte | Lezioni in Markdown in `learn/` nella root (`learn/it/`, `learn/en/`, glossario per lingua), con metadati (id, slug, titolo, descrizione, fasi collegate); il pacchetto le include ed esporta il lettore da `@agentrica/mcp/learn`, come il catalogo; il sito le legge a versione esatta | 2026-11-27, 2026-11-28 |
| Pubblico | Chi usa o vuole usare un assistente di codice senza basi di IA; il percorso è la porta d'ingresso al server MCP e l'ultima lezione porta a `/installa` | 2026-11-28 |
| Perimetro | Dieci lezioni e glossario, in italiano e inglese; niente quiz, account o progressi salvati | 2026-11-28 |
| Aggiornamento | Passo nuovo nella chiusura di fase (CONVENTIONS §13.7): si aggiorna la lezione toccata. Un indice fase→lezione copre tutte le fasi, anche F0–F52 (compilato in F53); un controllo in `npm run verify` vuole per ogni fase completata una lezione collegata o la nota «nessun concetto nuovo» | 2026-11-27, 2026-11-28 |
| Prova | Nessuna lettura di prova: bastano i controlli automatici | 2026-11-28 |
| Posto nel sito | `/it/impara` e `/en/learn`, lezione in `/impara/<slug>` con slug per lingua, glossario in `/impara/glossario` (`/en/learn/glossary`); «Impara» è la prima voce di «Come funziona» nell'header e nel menu mobile; ingressi anche dalla home e da `/installa` | 2026-11-28 |

## Percorso e formato

| # | Italiano | English |
|---|---|---|
| 1 | Cos'è un modello linguistico | What a language model is |
| 2 | Prompt e istruzioni | Prompts and instructions |
| 3 | Contesto e token | Context and tokens |
| 4 | Dagli assistenti agli agenti | From assistants to agents |
| 5 | Tool e MCP | Tools and MCP |
| 6 | Più agenti insieme: l'orchestrazione | Many agents together: orchestration |
| 7 | Quale modello scegliere (F24, F37, F49–F51) | Choosing a model |
| 8 | Costi e consumo | Cost and usage |
| 9 | Sicurezza, privacy e fonti (biblioteca) | Security, privacy and sources |
| 10 | Lavorare per fasi | Working in phases |

- Sezione: «Impara» / «Learn», sottotitolo «Dall'ABC agli agenti, con gli esempi di Agentrica» / «From the basics to agents, with examples from Agentrica».
- Ogni lezione ha le stesse sezioni nelle due lingue: «In breve» (2–3 frasi), «L'idea», «In Agentrica» (esempio con link a fasi, file e codice del repository), «Prova» (un'azione concreta), «Termini» (link al glossario).
- Indice con numero, titolo, descrizione di una riga e tempo di lettura; pagina lezione con «Lezione N di 10», precedente e successiva.
- Stile: frasi brevi, seconda persona, ogni termine tecnico spiegato alla prima occorrenza o nel glossario, sigle sciolte, 600–1200 parole a lezione; nessun numero di agenti o reparti; fatti sull'IA con fonte e data; nessun risultato inventato (CONVENTIONS §1).

## Backlog

| # | Attività | Priorità |
|---|---|---|
| F53-01 | Obiettivo, pubblico e criteri di successo (business) — fatto alla pianificazione, decisioni sopra | P0 |
| F53-02 | Struttura del percorso, nomi e posto nel sito (design) — fatto alla pianificazione, decisioni sopra | P0 |
| F53-03 | `learn/` con il formato delle lezioni e del glossario, lettore esportato da `@agentrica/mcp/learn`, inclusione nel pacchetto, test (metadati, stesse sezioni e stessi link in IT ed EN, link al repository che esistono, termini marcati presenti nel glossario) | P0 |
| F53-04 | Le dieci lezioni in italiano e inglese e il glossario | P1 |
| F53-05 | Sito: indice, lezione e glossario in `/impara` e `/en/learn` dal pacchetto, voce in «Come funziona» e nel menu mobile, ingressi da home e `/installa`, sitemap; revisione UI e Accessibility | P1 |
| F53-06 | Indice fase→lezione per F0–F52, controllo in `npm run verify` e passo nuovo in CONVENTIONS §13.7 | P1 |

## Criteri di accettazione

- Le lezioni stanno in `learn/` e il sito le mostra da `@agentrica/mcp/learn` a versione esatta, senza copie dei testi.
- Dieci lezioni e glossario in italiano e inglese, con le stesse sezioni e gli stessi link; un test lo verifica.
- Ogni termine marcato in una lezione è nel glossario; un test lo verifica.
- Ogni lezione ha almeno un esempio da Agentrica con link al repository a file che esistono; un test lo verifica.
- `npm run verify` fallisce se una fase completata non ha una lezione collegata né la nota «nessun concetto nuovo», per tutte le fasi da F0.
- «Impara» è la prima voce di «Come funziona» nell'header e nel menu mobile, con ingressi dalla home e da `/installa`; l'ultima lezione porta a `/installa`.

## Fatto

- **F53-01** e **F53-02** Fatti alla pianificazione: decisioni in «Decisioni dell'utente» e «Percorso e formato».
- **F53-03** `learn/` con `README.md` (formato), `it/` ed `en/` (lezioni `NN-id.md` con lo stesso nome nelle due lingue, metadati `Slug` e `Descrizione`/`Description`, cinque sezioni fisse), glossario con `Id:` uguale nelle due lingue e `fasi.md`. Lettore `packages/mcp/src/learn.ts` (`loadLessons`, `loadGlossary`, `loadPhaseIndex`, `links`, `linkKind`), esportato come `@agentrica/mcp/learn` (JavaScript e `.d.ts`), con `learn/` in `files` e copiata da `prepack`. `learn.test.ts`: dieci lezioni per lingua con stessi id e sezioni, stessi link sezione per sezione in IT ed EN, 600–1200 parole, almeno un link al repository in «In Agentrica» e ogni file citato esiste, ogni termine marcato è nel glossario, l'ultima lezione porta a `/installa`, export e pacchetto. Corretto alla causa `parseRole` del catalogo: un «## » dentro un blocco di codice era preso per una sezione (test di regressione in `catalog.test.ts`).
- **F53-04** Dieci lezioni in italiano e inglese (608–779 parole) e glossario di 35 termini. Ogni lezione ha un esempio da Agentrica con link a piano, misure di `examples/`, codice e biblioteche; i fatti esterni hanno fonte e data (articolo del 2017 sul Transformer, OWASP Top 10 for LLM Applications 2025, specifica MCP 2026-07-28, schede della biblioteca con la data di verifica, prezzi del 2026-11-03 di F24). Nessun numero di agenti o reparti.
- **F53-05** Sito (`agentrica-site`, branch `fase/f53-impara`): `/impara` e `/en/learn` (indice con numero, titolo, descrizione e tempo di lettura), lezione in `/impara/<slug>` con lo slug nella sua lingua («Lezione N di 10», precedente e successiva, nota sui link a GitHub alla versione del pacchetto), glossario in `/impara/glossario` e `/en/learn/glossary` in ordine alfabetico con le ancore. `parseMarkdown` legge i link; `src/lib/learn.ts` li porta a glossario, lezioni, GitHub alla versione installata o pagine del sito. «Impara» prima voce di «Come funziona» nell'header e nel menu del telefono, nel footer, in home (sezione «Come si usa») e in `/installa`; sitemap con le lezioni e le loro gemelle per `hreflang`; redirect in `next.config.ts` dallo slug dell'altra lingua (il selettore di lingua lo conserva) a quello giusto. Revisione UI e Accessibility nella sessione: schermate a 1440 e 390 px, titoli h1/h2 in ordine, glossario come `dl`, axe senza violazioni serie su indice, lezione e glossario.
- **F53-06** `learn/fasi.md` con F0–F53 (le fasi completate; F19 è sospesa): 32 con lezioni collegate e 21 con «nessun concetto nuovo»; ogni lezione ha almeno una fase. Il test di `learn.test.ts` legge la tabella «Fasi» di `plan/README.md` e fallisce se una fase completata manca. Passo nuovo nella chiusura (CONVENTIONS §13.7, punto 1) e riga `learn/` in §5.


## Verifiche

- Pacchetto: `npm run verify` verde il 2026-11-28 (typecheck, lint, 214 test, fra cui i 9 di `learn.test.ts`). `npm pack`: `learn/` (24 file) e `dist/mcp/src/learn.js` con i tipi nel tarball.
- Sito, con il pacchetto locale (`npm install --no-save` del tarball di `npm pack`): `npm run verify` verde (73 unitari, fra cui `learn.test.ts` e il link in `markdown.test.ts`; build con 189 pagine statiche); `npm run verify:e2e` 165 passati e 3 saltati, con la nuova `e2e/impara.spec.ts` (header e menu del telefono, home, `/installa`, footer, lezione, glossario sull'ancora, prima e ultima lezione, slug per lingua anche dal selettore, 404, axe su indice, lezione e glossario a 1440 e 360 px) e `header.spec.ts` allineata alla voce nuova.
- I tre link esterni delle lezioni rispondono 200 (la specifica MCP porta alla revisione 2026-07-28).
- Revisione dei testi nella sessione (UX Writer): seconda persona, sigle sciolte, parole inglesi del glossario di `plan/README.md`; restano come nomi propri di prodotti e standard «hook» e «subagent» (Claude Code) e «prompt injection» (OWASP), spiegati nel glossario. Code Reviewer nella sessione sul diff dei due repository: APPROVE.
- Non fatte: la prova con un lettore di schermo vero e, come deciso, una lettura di prova con persone.

## Rilievi aperti

- P2: rilascio insieme di pacchetto e sito. Il sito dipende dall'export nuovo `@agentrica/mcp/learn`: il branch `fase/f53-impara` di `agentrica-site` va in `develop` solo con la versione nuova del pacchetto (0.22.0, con la voce del `CHANGELOG` it/en), altrimenti la CI del sito, che installa la 0.21.0, fallisce. Insieme al rilievo di F52 ([#55](https://github.com/flgisimone/agentrica/issues/55)).
