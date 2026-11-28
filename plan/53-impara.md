# F53 — Impara: percorso di studio sull'IA costruito su Agentrica

**Obiettivo**: un'area del sito con un percorso a lezioni che porta chi usa un assistente di codice senza basi di IA fino agli agenti e a MCP, e da lì all'installazione del server, usando come esempio quello che è stato costruito in Agentrica. I contenuti stanno in questo repository, il sito li legge dal pacchetto e restano aggiornati a ogni fase.

> **Stato: da fare**. Registrata il 2026-11-27; pianificata il 2026-11-28 (business: AIBPD-01, 04, 11; design: AIWDA-01, 04, 10), con backlog e criteri confermati dall'utente. Lo sviluppo si fa in una sessione nuova.

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
