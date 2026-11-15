# F3 — Pagine dei reparti

**Obiettivo**: una pagina per reparto, `/reparti/<sigla>` (es. `/reparti/aisa`), pre-generata al build dal catalogo: missione, regole comuni, flusso di lavoro e agenti del reparto. La landing porta alle cinque pagine.

> **Stato: completata** (`a474d16`, merge `87c8114` in `develop`; CI lanciata a mano: verde, run 43699178049). Decisioni e testi dei README confermati dall'utente il 2026-11-15.

**Agenzie**: web design (Information Architect, UI Designer, UX Writer, Accessibility) per i controlli prima e la revisione nell'app dopo; software (Architect, Frontend Developer, QA, Code Reviewer).

## Situazione di partenza

- Il catalogo legge solo i file di ruolo (`01-…`): non legge né `README.md` né `00-common-rules.md` del reparto.
- I README non hanno la stessa forma. AISA e AIPCA hanno un flusso in passi numerati; AIBPD e AICA lo scrivono in un paragrafo («Workflow suggerito»); AIWDA non ce l'ha. Le introduzioni di AIBPD e AICA dicono solo «Pacchetto composto da 12 profili». Ci sono anche sezioni pensate per chi installa i file («Uso con Claude Code», «Struttura»), che non servono a chi visita il sito.
- I file di `agents/` usano un Markdown semplice: paragrafi, elenchi piatti, grassetto, codice in linea e un solo blocco di codice (in `ai_web_design_agency/00-common-rules.md`). Niente tabelle, link o titoli `###`.

## Decisioni (2026-11-15)

- **Fonte dei testi**: i cinque `README.md` hanno ora la stessa forma: introduzione (la missione), «## Agenti», «## Struttura», «## Flusso di lavoro» a passi numerati, «## Collaborazione con le altre agenzie», poi le sezioni proprie del reparto. I testi nuovi (introduzioni di AIBPD, AICA, AISA e AIWDA; flusso di AIWDA; collaborazione di AIPCA e AIWDA, completata per AISA) sono stati approvati dall'utente. Il catalogo legge introduzione, flusso e collaborazione.
- **agentic-starter**: stessa forma nel template, branch `fix/readme-agenzie` (commit `6e65282`, push da confermare).
- **Markdown**: renderer minimo nel sito, senza dipendenze; servirà anche in F4.
- **Regole comuni**: in una sezione chiusa da aprire (Collapsible).

## Backlog

| # | Task | Priorità |
|---|---|---|
| F3-01 | `agents/*/README.md` nella forma comune (introduzione, flusso, collaborazione); testi nuovi solo dove mancano, con la tua conferma | P1 |
| F3-02 | Catalogo: `Department` con `mission`, `workflow`, `collaboration` (dal README) e `rules` (sezioni di `00-common-rules.md`); `slug` del reparto (sigla in minuscolo); test | P1 |
| F3-03 | `src/app/reparti/[sigla]/page.tsx` con `generateStaticParams` e `dynamicParams = false` (le sigle sconosciute danno 404); metadata per pagina | P1 |
| F3-04 | Contenuto della pagina: intestazione con sigla e colore, missione, direttore, elenco degli agenti, flusso, regole comuni, collaborazione; link di ritorno alla landing e agli altri reparti | P1 |
| F3-05 | Renderer Markdown minimo in `src/lib/markdown.tsx`, con test | P2 |
| F3-06 | Landing: ogni scheda e ogni sigla della legenda portano alla pagina del reparto | P1 |
| F3-07 | Rilievi P3 rimasti da F1 (hero vuota a destra, griglia 3 + 2, riga sopra il titolo a 360 px), da decidere dopo la revisione di design | P3 |
| F3-08 | e2e: le cinque pagine (titolo, agenti, flusso), 404 per una sigla sconosciuta, link dalla landing, axe e scorrimento orizzontale a 1440 e 360 px | P1 |

## Criteri di accettazione

- `npm run verify` e `npm run verify:e2e` passano.
- Cinque pagine pre-generate al build; `/reparti/xyz` dà 404.
- I testi dei reparti vengono da `agents/`: nessuno è copiato nel sito.
- La revisione di design nell'app, a 1440 e 360 px, non lascia rilievi P0 o P1.
- I nomi in codice restano quelli di F2.

## Fatto

- **F3-01** I cinque `agents/*/README.md` nella forma comune; testi nuovi approvati dall'utente. Stessa modifica nel template di agentic-starter (`fix/readme-agenzie`, `6e65282`).
- **F3-02** Catalogo: `Department` con `slug`, `mission`, `workflow`, `collaboration` e `rules` (da `00-common-rules.md`). Un README senza «## Flusso di lavoro» o «## Collaborazione con le altre agenzie» ferma il caricamento. 2 test nuovi.
- **F3-03** `src/app/reparti/[sigla]/page.tsx`: `generateStaticParams`, `dynamicParams = false` (404 per le altre sigle), `generateMetadata` con titolo e descrizione del reparto, tipi con `PageProps`.
- **F3-04** Pagina: intestazione con sigla e colore, missione, la squadra (direttore e specialisti), flusso di lavoro, collaborazione («Con gli altri reparti»), regole comuni in un Collapsible, link agli altri reparti e «Tutti i reparti». Footer estratto in `site-footer.tsx`, condiviso con la landing.
- **F3-05** `src/lib/markdown.ts` (paragrafi, elenchi, blocchi di codice, grassetto e codice in linea) e `components/markdown.tsx`; 4 test con `node --test`, aggiunti allo script `test`. Il blocco di codice scorrevole ha `tabIndex={0}` ed etichetta (rilievo di axe, corretto).
- **F3-06** Landing: «Vai al reparto SIGLA» in ogni scheda; la legenda della hero porta alle pagine dei reparti. Link interni con `next/link` (regola di `eslint-config-next`).
- **F3-08** `e2e/reparti.spec.ts`: per ogni reparto titolo, missione, tutti gli agenti, passi del flusso, regole aperte, scorrimento e axe; percorso landing → reparto → altro reparto → landing; 404 per `/reparti/xyz`. La prova della legenda in `landing.spec.ts` ora va a `/reparti/aisa`.

## Verifiche

- `npm run verify`: superato (typecheck, lint, 12/12 test, build con `/reparti/aibpd` … `/reparti/aiwda` pre-generate).
- `npm run verify:e2e`: 24/24 (computer 1440 px e telefono 360 px).
- Revisione di design sugli screenshot di `/reparti/aiwda` (regole aperte) e della landing, a 1440 e 360 px: nessun P0 o P1.
- **Non verificato**: Safari e Firefox; lettore di schermo reale.

## Rilievi aperti

- Squadra a 1440 px: con 9 o 11 specialisti l'ultima riga ha una scheda sola (AIWDA, AIPCA). P3.
- F3-07, rilievi P3 da F1 (hero vuota a destra, griglia 3 + 2, riga sopra il titolo a 360 px): non affrontati, restano per F4.
- CI che non parte al push (da F1). P2.
- agentic-starter: `fix/readme-agenzie` è su GitHub, non ancora unito a `main` dello starter.
