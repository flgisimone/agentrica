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
