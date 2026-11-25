# F38 — Reputazione e consumo più leggibili

**Obiettivo**: nella scheda di un agente la reputazione si legge con un colpo d'occhio, cioè un cerchio con la media nell'intestazione e i commenti in fondo, 5 per pagina. La pagina `/consumo` spiega i totali dichiarati con grafici, oltre che con le tabelle. La pagina Installa ha il layout di una documentazione.

> **Stato: completata (2026-11-24).** Solo il repository del sito (`../agentrica-site`); nessuna versione nuova del pacchetto.

**Agenzie**: design (UI Designer per il cerchio e i grafici, Dashboard e Data Visualization Designer per `/consumo`, Accessibility Specialist per animazione, lettori di schermo e contrasto, UX Writer per etichette e paginazione; revisione nell'app); software (Frontend, Performance per animazione e peso della pagina, QA, Code Reviewer).

## Situazione di partenza

Verifica del 2026-11-24 su `develop` del sito, in locale con dati finti (`REPUTATION_FIXTURE` e `USAGE_FIXTURE`).

- **In produzione** solo AISA-02 supera la soglia di 5 voti (5 voti, media 4,0). La sua scheda mostra la reputazione; `/reputazione` risponde 404 finché 5 agenti non superano la soglia; `/consumo` mostra solo le prove perché gli invii sono meno di 10.
- **Scheda dell'agente** (`src/app/[lang]/agenti/[id]/page.tsx`, `src/components/agent-reputation.tsx`): la sezione «Reputazione» sta prima del file di ruolo, con la media in grande, le barre per stella, «Per versione», «Nel tempo» e fino a 10 commenti (`MAX_COMMENTS`), più la riga «altri N commenti» (commento `ponytail:` sulla paginazione).
- **Classifica generale e classifiche dei reparti**: approvate così come sono.
- **`/installa`** (`content-it.tsx`, `content-en.tsx`): 12 sezioni `h2` con ancora in una colonna sola, senza indice.
- **`/consumo`** (`src/components/usage-view.tsx`, `src/lib/usage.ts`): tre tabelle con le barre (per mese, per modello, i primi 10 agenti più «altri») e i totali di token e di risparmio della cache. I dati hanno token di input, output, letti dalla cache e scritti nella cache, per mese, agente e modello. Il sito non ha librerie di grafici.

## Decisioni dell'utente (2026-11-24)

- **Cerchio della media**: nell'intestazione della scheda, a destra di sigla, stella e ruolo. Si riempie in proporzione alla media su 5 (4,0 = 80%), con un'animazione del numero che sale e del cerchio che si riempie.
- **Via** «Per versione», «Nel tempo» e le barre per stella.
- **Commenti**: ultima sezione del contenuto della scheda, tutti quelli approvati (senza il limite di 10), 5 per pagina, dal più recente.
- **Grafici di `/consumo`**: SVG scritti a mano, senza dipendenze nuove.
- Classifiche: nessun cambiamento.
- **Installa in stile documentazione** (come nextjs.org/docs): resta una pagina sola, `/installa`, con tre colonne. A sinistra le sezioni raggruppate, a destra «In questa pagina» con la sezione attiva; URL e ancore di oggi invariati. Orchestrazione resta com'è.

## Decisioni di design (2026-11-24)

- **Cerchio**: SVG di 8 rem (7 su telefono), traccia nel colore dei bordi, arco nel colore del reparto da ore 12; dentro la media grande e «su 5», sotto il cerchio «N voti». Animazione di circa 1,2 s (arco e numero da 0), valore finale già nell'HTML; fermo con `prefers-reduced-motion`; un solo testo per i lettori di schermo («Media 4,5 su 5 da 12 voti»).
- **Commenti**: titolo «Commenti (N)», schede come oggi, «Precedenti» · «Pagina X di Y» · «Successivi»; al cambio di pagina il focus va sul titolo e la pagina si annuncia; sotto la nota «Voti anonimi…».
- **Installa**: due colonne, sidebar sola a sinistra con la sezione in vista evidenziata (niente colonna «In questa pagina», ripeterebbe le stesse voci). Gruppi: Inizia (Scegli come installarlo, Requisiti, Su tutto il computer, Senza installare nulla, Per il team, Progetto nuovo), Configura (Biblioteca, Altri client MCP, Permessi minimi, Opzioni e funzioni), Verifica e manutenzione (Verifica, Aggiornare e disinstallare, Problemi comuni). Su telefono un pulsante «In questa pagina» apre l'indice.
- **Consumo**: riga di tre numeri (token totali, risparmio della cache, invii), poi quattro grafici: token per mese divisi per tipo, risparmio della cache (pagato contro risparmiato), quota per modello (barra al 100%), reparti e primi 10 agenti nei colori dei reparti. Tipi di token in una scala distinta dai colori dei reparti.
- **Tabelle dei grafici**: dentro un'Accordion di shadcn («Vedi i numeri») sotto ogni grafico. Il componente usa `@base-ui/react`, già installato: nessuna dipendenza nuova.
- **Consumo, revisione nell'app (2026-11-24)**: i quattro grafici stanno in una Tab di shadcn (Per mese, Per modello, Per reparto, Per agente; due righe da due su telefono); il risparmio della cache non è più un grafico a sé ma sta nel riquadro «Risparmiati dalla cache», con la barra risparmiati/pagati e la quota scritta; numeri, schede e grafici a tutta larghezza, i paragrafi restano a 48 rem. Barre in HTML e CSS invece che in SVG (stessa scelta di nessuna libreria, testo leggibile a ogni larghezza). Modelli in ordine fisso (Opus, Sonnet, Haiku, altri) perché blu e viola vicini non passano la verifica dei colori.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F38-01 | Cerchio con la media nell'intestazione della scheda, a destra: riempimento pari alla media su 5, numero che sale, voti sotto il cerchio; fermo con `prefers-reduced-motion`; testo per i lettori di schermo («4,5 su 5, 12 voti»); su telefono sotto il titolo | P1 |
| F38-02 | Tolte le barre per stella, «Per versione» e «Nel tempo» dalla scheda; `reputation.ts` senza `versions`, `months` e `distribution` se non li usa più nessuno; test aggiornati | P1 |
| F38-03 | Commenti come ultima sezione del contenuto della scheda, dopo il file di ruolo: tutti quelli approvati, 5 per pagina con Precedenti/Successivi, numero di pagina annunciato ai lettori di schermo; tolti `MAX_COMMENTS` e `moreComments`; nota «Voti anonimi…» con il link alle note legali vicino al cerchio o ai commenti | P1 |
| F38-04 | Grafici SVG in `/consumo`: token per mese divisi per tipo (input, output, letti e scritti nella cache), risparmio della cache, quota per modello, primi agenti e totali per reparto; ogni grafico con la tabella dei suoi numeri, colori dei token del sito (tema scuro, l’unico del sito) | P1 |
| F38-06 | `/installa` in stile documentazione: a sinistra le 12 sezioni raggruppate (es. Inizia, Configura, Riferimento, Problemi), a destra «In questa pagina» con la sezione attiva; su telefono un indice compatto che si apre; ancore invariate in `/it` e `/en`; nessuna dipendenza nuova | P1 |
| F38-05 | Revisione di design prima (proposta del cerchio, dei grafici e del layout di Installa) e dopo (nell'app, computer e telefono); e2e `reputazione.spec.ts`, `consumo.spec.ts` e `installa.spec.ts` aggiornati con axe; Code Reviewer sul diff | P1 |

## Criteri di accettazione

- La scheda di un agente sopra la soglia mostra il cerchio con la media a destra dell'intestazione; il riempimento corrisponde alla media su 5; con `prefers-reduced-motion` il cerchio è già pieno e fermo.
- La scheda non ha più barre per stella, «Per versione» né «Nel tempo»; un agente sotto la soglia non mostra né il cerchio né i commenti.
- I commenti sono l'ultima sezione del contenuto, 5 per pagina, e tutti quelli approvati si possono raggiungere con la tastiera.
- `/consumo` ha i grafici con le tabelle corrispondenti, leggibili su telefono senza scorrimento orizzontale della pagina.
- `/installa` ha la navigazione a sinistra e «In questa pagina» a destra su computer, un indice compatto su telefono; i link alle ancore di oggi funzionano ancora.
- Nessuna dipendenza nuova; `npm run verify` e `npm run verify:e2e` passano nel sito.

## Fatto

- **F38-01** `src/components/rating-ring.tsx`: cerchio SVG con la media su 5 nell'intestazione della scheda (terza colonna da `md`, sotto il testo su telefono), «su 5» dentro e «N voti» sotto. L'arco si anima in CSS (`.rating-arc`, 1,2 s, solo con `prefers-reduced-motion: no-preference`); il numero legge il tempo della stessa animazione (`getAnimations()`), così restano allineati. Nell'HTML ci sono già arco pieno e media finale; un solo testo per i lettori di schermo («Media 4,5 su 5 da 12 voti»).
- **F38-02** Tolte dalla scheda le barre per stella, «Per versione» e «Nel tempo»; `src/lib/reputation.ts` senza `distribution`, `versions`, `months`, `MAX_COMMENTS` e `moreComments` (gruppi con `Map.groupBy`); chiavi di testo non più usate tolte da `it.ts` ed `en.ts`.
- **F38-03** `src/components/agent-reputation.tsx` (client): «Commenti (N)» dopo il file di ruolo, tutti quelli approvati, 5 per pagina con «Precedenti» · «Pagina X di Y» · «Successivi» (annunciata, focus sul titolo); sotto la nota «Voti anonimi…» con il link alle note legali, che resta anche senza commenti.
- **F38-04** `src/components/usage-charts.tsx`: riga di tre numeri (token usati; risparmiati dalla cache con barra risparmiati/pagati e quota scritta; invii) e Tab di shadcn con quattro grafici in HTML e CSS (mesi per tipo di token, quota per modello, reparti, primi 10 agenti nei colori dei reparti), ognuno con la tabella in un'Accordion di shadcn («Vedi i numeri»). `src/lib/usage.ts`: `byMonth` per tipo di token (`TOKEN_TYPES`) e `byDepartment`. Colori `--series-*` in `globals.css`, validati con lo script della guida dataviz sul fondo `#0d1426`. Tab e Accordion su `@base-ui/react`, già installato: shadcn aggiungeva il pacchetto `cn` come dipendenza, tolto, `package.json` e lockfile invariati.
- **F38-06** `src/components/docs-nav.tsx`: indice di `/installa` in tre gruppi e 13 voci (i gruppi e le ancore in `content-it.tsx` e `content-en.tsx`), colonna fissa a sinistra da `lg` con la sezione in vista in `aria-current="location"` (soglia calcolata da `scroll-padding-top` e `scroll-margin-top`), su telefono «In questa pagina» che si chiude dopo il clic. Ancore e URL invariati.
- **F38-05** Revisione di design nell'app con l'utente (scheda, consumo con le schede a tutta larghezza, installa); test e2e aggiornati: `reputazione.spec.ts` con i voti finti di `e2e/fixtures/reputation.json` (commenti segnati come dati finti) passati al server `next dev` di `playwright.config.ts`, `consumo.spec.ts` (numeri, schede, tabelle), `installa.spec.ts` (indice). Code Reviewer nella sessione: APPROVE dopo due ritocchi (chiave `fromUsers` non usata, import di `getCatalog` da `@/i18n`).

## Verifiche

- `npm run verify` nel sito: superato (typecheck, lint, 69 test unitari); `npm run verify` in questo repository: superato.
- `npm run verify:e2e` nel sito: 131 passati e 1 saltato al giro finale, dopo la revisione; il test del consumo su telefono, prima fallito per due pannelli visibili durante il cambio di scheda, ora indica il pannello per nome e passa 3 volte su 3.
- Prove nel browser (Playwright, 1440 e 390 px, dati finti): nessuno scorrimento orizzontale, anche con le tabelle aperte (corretto: le griglie avevano colonne `auto` e la tabella del mese allargava la pagina a 583 px); focus sul titolo dei commenti; cerchio fermo con «riduci movimento»; indice di Installa con la voce giusta dopo un'ancora e l'ultima in fondo alla pagina.

## Rilievi aperti

- ~~**F38-R1 (P3)**~~ Chiuso in F44-07: senza JavaScript `/consumo` mostra solo la prima scheda e nessuna tabella (Tab e Accordion di Base UI non mettono nell'HTML i pannelli chiusi); prima le tabelle erano sempre visibili. Da valutare `keepMounted` con un'alternativa senza script, se serve.
- ~~**F38-R2 (P3)**~~ Chiuso in F44-04: su telefono i totali sopra le barre dei mesi sono nascosti (si sovrapponevano); i valori restano in «Vedi i numeri».
