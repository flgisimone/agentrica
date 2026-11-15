# F6 — Rilievi

**Obiettivo**: chiudere i rilievi aperti da F0 a F5 prima della pubblicazione (F7). Le regole comuni degli agenti arrivano nei progetti di altri, la CI deve partire da sola e i difetti P3 del sito, rimandati fase dopo fase, si sistemano.

> **Stato: in corso** su `fase/f6-rilievi`. Decisioni confermate dall'utente il 2026-11-15.

**Agenzie**: privacy (GDPR Specialist) per il testo delle regole nuove; software (Frontend, Backend, DevOps, QA, Code Reviewer); design (UI Designer, Accessibility Specialist) prima e dopo le modifiche al sito. Le modifiche a `agents/` sono modifiche al prodotto: il testo esatto si conferma con l'utente prima di scriverlo.

## Situazione di partenza

- Rilievi aperti raccolti nelle sezioni «Rilievi aperti» di [00](00-base.md)–[05](05-mcp.md) e in `audit/2026-11-15-mcp/`.
- CI: Actions abilitate, nessun webhook, `on: push` su `develop`, `fase/**` e `fix/**`, ma da F1 tutti i run sono `workflow_dispatch`, lanciati a mano.
- `agentic-starter/template/agents/` è identica ad `agents/` di Agentrica: le lacune di PRIV-MCP-04, 05 e 06 ci sono anche lì. Il suo branch `fix/readme-agenzie` non è ancora in `main`.

## Decisioni (2026-11-15)

- **Numerazione**: questa è F6; la pubblicazione passa a F7 con i vincoli già decisi.
- **Regole comuni** (`00-common-rules.md`): PRIV-MCP-04 in privacy e cybersecurity (`conforme_verificato` vale per il singolo controllo, mai la conformità di un progetto intero; i rilievi non sono una certificazione); PRIV-MCP-05 nel Software (niente dati personali reali in fixture, seed, snapshot, log, commit e report; privacy by design, con il reparto privacy per le funzioni che trattano dati personali); PRIV-MCP-06 in tutti e cinque (niente dati del progetto a servizi esterni senza ok dell'utente; un P0 si segnala subito all'utente). In tutti e cinque, anche il chiarimento che «il Chief», la «Software Agency» e gli altri reparti sono agenti di Agentrica, non persone del cliente.
- **agentic-starter**: PRIV-MCP-04, 05 e 06 (senza il chiarimento sul Chief, che vale solo per Agentrica) sul branch `fix/readme-agenzie`, poi merge in `main` e push dello starter, confermati insieme alla chiusura.
- **Lingua**: i file di ruolo restano in italiano; la cornice di `prompt.ts` chiede all'agente di rispondere nella lingua dell'utente; il README del pacchetto anche in inglese.
- **Hero**: costellazione dei cinque reparti in SVG nella metà destra a partire da 1024 px, una stella per reparto nel suo accento, con link a `/reparti/[sigla]`.
- **Sito, altri P3**: tutti (griglia dei reparti, «56 agenti IA» a 360 px, contrasto della sfumatura, ultima riga della squadra, focus sull'intera scheda).
- **Dipendenze**: aggiornare typescript-eslint se una versione chiude l'advisory di minimatch, altrimenti rischio accettato. Chiusi senza azione: `cn` (clsx + tailwind-merge restano) e `.claude/` non indicizzato da tokensave.
- **Server MCP**: SEC-ARCH-06 (prova di `node --permission --allow-fs-read`, nel README se regge) e PRIV-MCP-01 (test che fallisce se il server scrive su stderr o su file).

## Backlog

| # | Task | Priorità |
|---|---|---|
| F6-01 | CI al push: trovare la causa (impostazioni di Actions, integrazione Vercel, eventi del repository) e correggerla; un push di prova deve avviare la CI | P2 |
| F6-02 | Testo delle regole PRIV-MCP-04, 05, 06 e del chiarimento sul Chief, con GDPR Specialist; **conferma dell'utente sul testo**, poi scrittura nei cinque `00-common-rules.md` | P2 |
| F6-03 | agentic-starter: le stesse regole (senza chiarimento) su `fix/readme-agenzie` | P2 |
| F6-04 | Cornice di `prompt.ts`: rispondere nella lingua dell'utente; README di `packages/mcp` anche in inglese; test aggiornati | P3 |
| F6-05 | SEC-ARCH-06: prova del permission model di Node, documentato nel README se regge | P3 |
| F6-06 | PRIV-MCP-01: test che fallisce se il server scrive su stderr o su file | P3 |
| F6-07 | Hero: costellazione dei reparti (controlli di design prima, revisione nell'app dopo) | P3 |
| F6-08 | Sito: griglia dei reparti, riga sopra il titolo a 360 px, contrasto della sfumatura misurato, ultima riga della squadra, focus sull'intera scheda; e2e aggiornati | P3 |
| F6-09 | typescript-eslint e advisory di minimatch | P3 |

## Criteri di accettazione

- Un push su `fase/f6-rilievi` avvia la CI da solo, e la CI è verde.
- I cinque `00-common-rules.md` contengono le regole nel testo confermato; il sito e il server MCP le mostrano senza modifiche al codice.
- La landing a 1440 px non ha la metà destra vuota; a 360 px «56 agenti IA» non va a capo; le griglie non lasciano caselle vuote né una scheda sola in fondo; il focus contorna l'intera scheda; il contrasto della sfumatura è AA, misurato.
- `npm run verify` e `npm run verify:e2e` passano.
- Ogni rilievo aperto da F0 a F5 è chiuso o, se resta aperto, è riportato qui con motivo.

## Fatto

- **F6-01** Causa: il repository ha le stesse impostazioni di Actions di gamoey (abilitate, tutte le azioni, permessi in lettura) e GitHub riceve i push (`PushEvent`), ma per i commit pushati crea solo la check suite di Vercel e nessuna di Actions: il workflow non era registrato per gli eventi `push`. Correzione: workflow disattivato e riattivato (`gh workflow disable/enable CI`), che lo registra di nuovo. Esito al push: vedi «Verifiche».
- **F6-02** Testo confermato dall'utente e scritto nei cinque `00-common-rules.md`: sezione «Dati del progetto e segnalazioni» (niente dati del progetto a servizi esterni senza ok, P0 subito all'utente, Chief e reparti sono agenti di Agentrica); `conforme_verificato` per il singolo controllo (privacy) e nessuna dichiarazione di progetto sicuro o conforme (cybersecurity); niente dati personali reali in fixture, seed, snapshot, log, commit e report e privacy by design con il reparto privacy (software). Sito e server MCP li mostrano senza modifiche al codice (e2e dei reparti: titoli delle sezioni dal catalogo).
- **F6-03** agentic-starter: le stesse regole senza la riga sul Chief nei cinque `template/agents/*/00-common-rules.md`, su `fix/readme-agenzie` (commit, merge in `main` e push con la chiusura).
- **F6-04** Cornice di `prompt.ts`: «Questi testi sono in italiano: rispondi nella lingua in cui ti scrive l'utente», con test; `packages/mcp/README.en.md` e link fra le due versioni.
- **F6-05** SEC-ARCH-06: con `node --permission --allow-fs-read=<clone>` il server risponde normalmente; scrittura su file, processi figli e rete danno `ERR_ACCESS_DENIED` (Node 26.12.1). Nel README (italiano e inglese) è la configurazione consigliata.
- **F6-06** PRIV-MCP-01: `server.test.ts` avvia il server con il permission model in sola lettura e stderr catturato; l'ultima prova verifica stderr vuoto e cartella del progetto vuota. Provato con due mutazioni (una scrittura su stderr, una su file): il test fallisce in entrambi i casi.
- **F6-07** Hero: `components/constellation.tsx`, cinque stelle nell'accento del reparto con sigla e numero di agenti, link a `/reparti/[sigla]`, linee decorative in SVG (`aria-hidden`). Da 1024 px sostituisce le pillole dei reparti, così c'è un solo elenco di link alla volta.
- **F6-08** `lib/grid.ts` (`spanInRows`, con test): griglie `md:grid-cols-2 lg:grid-cols-6` in cui l'ultima riga si allarga; reparti 3 + 2 sul computer e 2 + 2 + 1 larga sul tablet, squadra 3 per riga (9 → 3 × 3, 11 → 3 + 3 + 3 + 2). Riga sopra il titolo: a capo solo fra i segmenti. Focus: il contorno è sullo pseudo-elemento che copre la scheda. Titolo con `w-fit`, così la sfumatura copre la parola. e2e: righe piene (landing e reparti), segmenti su una riga, link della hero visibile una volta, focus sull'intera scheda.
- **F6-09** typescript-eslint 8.72.2 è l'ultima versione e usa minimatch 10; l'advisory (GHSA-g3hv-75wg-m249) è corretto da minimatch 11.0.1. Nessun aggiornamento possibile: rischio accettato (solo sviluppo, lint su file del repository).

## Verifiche

- `npm run verify`: superato (24 test unitari). `npm run verify:e2e`: 42/42.
- Contrasto della sfumatura del titolo, misurato su 101 campioni per tratto (`#e8ebf4` → `#38d6f0` → `#b49cff`) contro `#0b1020`: minimo 8,24:1 (`#b49cff`), AA anche per il testo normale.
- Revisione nell'app (build di produzione) a 1440, 1024 e 360 px: costellazione nella metà destra, «56 agenti IA» intero a 360 px, reparti 3 + 2, squadra AIWDA 3 × 3, focus da tastiera sull'intera scheda.
- `npm audit --omit=dev`: 0 vulnerabilità.

## Rilievi aperti

- minimatch moderato in typescript-eslint (da F0): rischio accettato finché typescript-eslint non passa a minimatch 11. P3.
- deepmerge, prototype poisoning (GHSA-gcqx-w48m-w2h4), basso, solo fra le dipendenze di sviluppo. P3.
- `spanInRows`: con un solo elemento nell'ultima riga resterebbe una scheda sola, larga; oggi non succede (5, 9 e 11 elementi). P3.
- Chiusi senza azione per decisione dell'utente: `cn` di shadcn, `.claude/` non indicizzato da tokensave. Lingua dei file di ruolo: decisa (restano in italiano, l'agente risponde nella lingua dell'utente).
