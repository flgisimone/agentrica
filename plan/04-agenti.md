# F4 — Pagine degli agenti

**Obiettivo**: una pagina per agente, `/agenti/<id>` (es. `/agenti/aisa-02`), pre-generata al build dal catalogo: nome in codice, ruolo, reparto e il file di ruolo così com'è scritto. Dalla squadra di ogni reparto si arriva alle pagine dei suoi agenti.

> **Stato: completata** (`69f9605`, merge `b7fe654` in `develop`). Decisioni confermate dall'utente il 2026-11-15.

**Agenzie**: web design (UI Designer, UX Writer, Accessibility) per i controlli prima e la revisione nell'app dopo; software (Frontend Developer, QA, Code Reviewer).

## Situazione di partenza

- Il catalogo ha già, per ogni agente, `id`, `star`, `role`, `intro` e `sections` del file di ruolo.
- I 56 file di ruolo non hanno la stessa forma: una trentina di titoli di sezione diversi («Missione», «Responsabilità», «Ruolo», «Output attesi», «Vincoli»…), scritti come istruzioni al modello («Agisci come…»).
- Il Markdown dei file di ruolo (paragrafi, elenchi piatti, grassetto, codice in linea) è già coperto dal renderer di F3.

## Decisioni (2026-11-15)

- **Indirizzo**: `/agenti/<id in minuscolo>`, es. `/agenti/aisa-02`; gli altri indirizzi danno 404.
- **Biografia**: intestazione (nome in codice, ruolo, reparto, direttore o specialista) e poi le sezioni del file così come sono scritte, presentate come le istruzioni dell'agente. Nessun testo nuovo nei file di ruolo.
- **Navigazione**: ogni scheda della squadra in `/reparti/<sigla>` porta alla pagina dell'agente; nella pagina dell'agente, agente precedente e successivo dello stesso reparto e ritorno al reparto. Niente indice `/agenti` né link dalla landing.
- **Rilievi P3** di F1 e F3: rimandati.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F4-01 | `src/app/agenti/[id]/page.tsx` con `generateStaticParams` (56 pagine), `dynamicParams = false`, metadata per pagina | P1 |
| F4-02 | Contenuto: ritorno al reparto, nome in codice, ruolo, reparto e posizione (direttore o specialista), nota che il testo è il file di ruolo, introduzione e sezioni del file | P1 |
| F4-03 | Agente precedente e successivo dello stesso reparto | P1 |
| F4-04 | Pagina del reparto: le schede della squadra portano alle pagine degli agenti | P1 |
| F4-05 | e2e: le 56 pagine (titolo, ruolo, sezioni), 404 per un id sconosciuto, percorso reparto → agente → successivo → reparto, axe e scorrimento orizzontale a 1440 e 360 px | P1 |

## Criteri di accettazione

- `npm run verify` e `npm run verify:e2e` passano.
- 56 pagine pre-generate al build; `/agenti/aisa-99` dà 404.
- I testi degli agenti vengono da `agents/`: nessuno è copiato nel sito.
- La revisione di design nell'app, a 1440 e 360 px, non lascia rilievi P0 o P1.
- I nomi in codice restano quelli di F2.

## Fatto

- **F4-01** `src/app/agenti/[id]/page.tsx`: `generateStaticParams` (56 pagine), `dynamicParams = false`, `generateMetadata` con titolo «ID · STELLA · Agentrica» e descrizione con ruolo e reparto.
- **F4-02** Pagina: ritorno al reparto, «ID · Direttore/Specialista», stella come titolo, ruolo, una nota che dice che è un agente IA e che il testo è il suo file di ruolo, poi introduzione e sezioni del file con il renderer di F3. Nessun testo nuovo in `agents/`.
- **F4-03** Navigazione «Altri agenti di SIGLA»: precedente e successivo nello stesso reparto (il primo non ha precedente, l'ultimo non ha successivo).
- **F4-04** Pagina del reparto: `AgentLine` con `link` porta a `/agenti/<id>`; la scheda intera è cliccabile (un solo link per scheda), bordo d'accento al passaggio del mouse. `agentHref` in `department-card.tsx`.
- **F4-05** `e2e/agenti.spec.ts`: per ogni reparto tutte le pagine (titolo, stella, ruolo, titoli delle sezioni nell'ordine del file, scorrimento orizzontale), axe su direttore e ultimo specialista; percorso reparto → agente → successivo → reparto; 404 per `/agenti/aisa-99`.

## Verifiche

- `npm run verify`: superato (typecheck, lint, test, build con 56 pagine `/agenti/…` pre-generate).
- `npm run verify:e2e`: 38/38 (computer 1440 px e telefono 360 px).
- Revisione di design sugli screenshot di `/agenti/aisa-02` e `/agenti/aiwda-10` e della squadra di `/reparti/aisa` (passaggio del mouse), a 1440 e 360 px: nessun P0 o P1.
- **Non verificato**: Safari e Firefox; lettore di schermo reale.

## Rilievi aperti

- Squadra: il contorno del focus da tastiera circonda il nome in codice, non l'intera scheda cliccabile. P3. Risolto in F6 (F6-08).
- Rilievi P3 di F1 e F3 (hero vuota a destra, griglia 3 + 2, riga sopra il titolo a 360 px, ultima riga con una scheda sola in AIWDA e AIPCA): rimandati per scelta. Risolto in F6 (F6-07, F6-08).
- CI che non parte al push (da F1). P2. Risolto in F6 (F6-01).
