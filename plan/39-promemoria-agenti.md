# F39 — Promemoria degli agenti e strumenti locali

**Obiettivo**: in una sessione lunga chi usa Agentrica si ricorda di caricare un agente per ogni richiesta nuova, e il pannello segnala quando si lavora in `plan/` senza nessun agente caricato. Per ogni tool del server è scritto se resta sul computer o se manda dati fuori, così in un repository con la regola «non esce niente» non si esita.

> **Stato: completata** il 2026-11-24 su `fase/f39-promemoria-agenti` (anche in `agentrica-site`). Esce con la 0.13.0, pacchetto e sito insieme quando l'utente chiede il rilascio (§13.8).

**Agenzie (proposta)**: business (Product Manager per il valore e la priorità); design (UX Designer e UX Writer per il promemoria e l'avviso nel pannello); privacy (Data Governance per l'elenco «resta in locale / esce»); software (Backend per server e pannello, QA, Code Reviewer).

## Segnalazione (2026-11-24)

> Le istruzioni arrivano una volta sola, all'inizio della sessione. A metà sessione, finito un lavoro con gli agenti, niente ricorda di caricarne uno per la richiesta successiva, e il pannello non segnala quando si scrive in plan/ senza nessun agente caricato. Un promemoria a ogni richiesta, o un avviso nel pannello, avrebbe evitato il secondo caso.
> Non è scritto quali strumenti restano in locale. In un repo con la regola «non esce niente», questo fa esitare. Il primo caso nasce anche da lì.

## Situazione di partenza (verificata il 2026-11-24)

- Le istruzioni del server (`packages/mcp/src/texts/it.ts` ed `en.ts`, entro 4096 caratteri) arrivano al client una volta, all'avvio della sessione.
- Il README del pacchetto dice che il server gira solo in locale (stdio) e, nella parte sul pannello, che nulla esce tranne valutazioni e totali di token inviati dalla pagina; manca un elenco per tool di cosa resta sul computer e cosa no (`rate_agent`, `share_usage`, `submit_project` mandano dati ad Agentrica dopo l'anteprima e il sì dell'utente; gli altri no).
- Il pannello legge `plan/`, lo stato git e i subagent avviati, e conosce gli agenti caricati con `agent`.
- Verifica: istruzioni a 2412 caratteri (it) e 2342 (en), con pannello e valutazioni; `init` non scrive hook né `.claude/settings.json`; il pannello tiene le ultime 20 chiamate ad `agent` in memoria. Fuori dal computer escono anche le richieste del controllo di versione al registro npm (automatico, spento da `--no-update-check`).

## Decisioni dell'utente (2026-11-24)

- **Promemoria**: hook `UserPromptSubmit` scritto da `init` (anche `--existing`) in `.claude/settings.json`, attivo di predefinito; una riga a ogni richiesta.
- **Avviso nel pannello**: un file di `plan/` modificato dopo l'avvio del server e nessun agente caricato con `agent` da allora; banner in cima alla pagina Sessione, sparisce al primo agente caricato.
- **Strumenti locali**: tabella nel README del pacchetto (inglese e italiano) e nella pagina Installa del sito, una frase nelle istruzioni del server.
- **Rilascio**: 0.13.0, pacchetto e sito insieme quando l'utente lo chiede (§13.8).

## Proposte iniziali

- **Promemoria a ogni richiesta**: come farlo arrivare (testo nelle risposte dei tool, hook `UserPromptSubmit` scritto da `init`, regola nello starter); quanto spesso, per non diventare rumore.
- **Avviso nel pannello**: quando `plan/` cambia e nella sessione non c'è un agente caricato; dove e con che testo.
- **Strumenti locali**: tabella «resta in locale / esce, cosa e quando» per ogni tool e comando, nel README del pacchetto (due lingue), sul sito (Installa) e in breve nelle istruzioni del server.
- Versione del pacchetto e rilascio insieme al sito.

## Backlog

| # | Attività | Priorità |
|---|---|---|
| F39-01 | Hook `UserPromptSubmit` in `.claude/settings.json` scritto da `init` e `init --existing` (che salta il file se c'è già e dice come aggiungerlo), comando `node -e` uguale su Mac, Windows e Linux, testo in italiano e inglese; `--no-reminder` per non scriverlo; nel README come aggiungerlo a mano con `add` e `install` | P1 — è il caso segnalato |
| F39-02 | Banner del pannello: file di `plan/` modificati dopo l'avvio e nessuna chiamata ad `agent`; testo in due lingue, sparisce al primo agente | P1 — secondo caso segnalato |
| F39-03 | Tabella «resta sul computer / esce, cosa e quando» per ogni tool e comando nel README del pacchetto (inglese e italiano) | P1 — fa esitare chi ha la regola «non esce niente» |
| F39-04 | Una frase nelle istruzioni del server (it, en) su cosa esce, entro 4096 caratteri, con il test | P2 |
| F39-05 | Sito: tabella nella pagina Installa (`../agentrica-site`, it ed en) | P2 |
| F39-06 | Test (init, pannello, istruzioni), revisione dei testi (UX Writer), Code Reviewer sul diff; 0.13.0 in `package.json`, `VERSION`, comando del sito, «Versioni» dei README, `CHANGELOG` (it, en) | P1 — chiusura |

## Criteri di accettazione

- Un progetto creato con `init` (anche `--existing` senza `.claude/settings.json`) ha l'hook; a ogni richiesta Claude Code riceve una riga che ricorda di caricare un agente di Agentrica; con `--no-reminder` il file non si scrive.
- Con il pannello aperto, modificando un file di `plan/` senza aver caricato agenti compare il banner; dopo una chiamata ad `agent` sparisce.
- README (it, en) e pagina Installa del sito elencano per ogni tool e comando se resta sul computer o cosa manda fuori e quando.
- Le istruzioni del server lo dicono in una frase e restano entro 4096 caratteri in tutte e due le lingue.
- `npm run verify` verde; nel sito `npm run verify:e2e` verde.

## Fatto

- **F39-01** Hook `UserPromptSubmit` in `.claude/settings.json` scritto da `init` e `init --existing` (`projectFiles`, `reminderCommand` in `packages/mcp/src/init.ts`): `node -e "console.log('…')"` con i caratteri non ASCII come `\uXXXX` e un controllo che rifiuta virgolette, $, apice inverso, %, ! e barra rovesciata, testo in `texts/it.ts` ed `en.ts` (`init.reminder`). `--no-reminder` non lo scrive; con il file già presente `init --existing` lo salta e lo dice (`init.reminderSkipped`). Sezione «Promemoria»/«Reminder» nei README con il JSON da aggiungere a mano dopo `add` o `install`. Test in `init.test.ts`: il comando lanciato in una shell vera stampa il testo esatto nelle due lingue.
- **F39-02** Banner del pannello: `planTouchedAfter` in `panel.ts` (data di modifica dei file di `plan/`, senza seguire i link) e `noAgent` in `/api/state`, vero con `plan/` modificato dopo l'avvio e nessuna chiamata ad `agent`; `#no-agent` in cima alla pagina Sessione (`index.it.html`, `index.en.html`), mostrato da `renderHeader`. Test in `panel.test.ts`: falso con `plan/` fermo, vero dopo una modifica, falso dopo il primo agente.
- **F39-03** Tabella «Cosa resta sul computer» / «What stays on your computer» nei README del pacchetto: per ogni tool, comando e pagina cosa esce, verso chi e quando; `--no-ratings --no-update-check` non fa uscire niente. Nella descrizione del pannello, la lettura delle date di `plan/`.
- **F39-04** Frase nelle istruzioni del server (it, en): «I dati restano sul computer: inviano ad Agentrica solo rate_agent, share_usage e submit_project, dopo l'anteprima e il sì dell'utente; fuori va solo, se attivo, il controllo delle versioni nuove sul registro npm» (la parte sui tre tool solo con le valutazioni accese). 2625 caratteri in italiano e 2566 in inglese, entro 4096; controllo in `server.test.ts`.
- **F39-05** Sito: sezione «Cosa resta sul computer» (`#locale`, `#local` in inglese) nel gruppo Configura di Installa e un paragrafo sul promemoria in «Progetto nuovo» (`content-it.tsx`, `content-en.tsx`); indice a 14 voci in `e2e/installa.spec.ts`. Guardata a 360 px: si legge, nessuno scorrimento orizzontale.
- **F39-06** Test aggiornati (`.claude/` ora contiene anche `settings.json`); revisione dei testi e del diff nella sessione principale, senza rilievi bloccanti; 0.13.0 in `package.json`, `server.json`, `VERSION`, `package-lock.json`, comandi dei README; `CHANGELOG.md` e `CHANGELOG.en.md`.

## Verifiche

- `npm run verify` (typecheck, lint, 176 test) verde.
- `agentrica-site`: `npm run verify` verde; `npm run verify:e2e` 131 superati, 1 saltato. Il primo giro aveva 2 errori (indice di Installa a 13 voci), corretti nella spec. Per lanciarlo è stato fermato, con l'ok dell'utente, il `next dev` sulla porta 3000, che non è stato riavviato.
- Il comando dell'hook è stato provato in `sh` sul Mac nelle due lingue; non in PowerShell né in cmd.
- Non provato: l'hook in una sessione vera di Claude Code e il banner nel browser (provato con il test HTTP del pannello).

## Rilievi aperti

- P2 — Hook non provato su Windows (PowerShell e cmd) né in una sessione vera di Claude Code: da fare con la prova su Windows di F23-10.
- P3 — Con `add` o `install` senza `init` il promemoria non c'è; il README spiega come aggiungerlo a mano. Se serve, un comando che lo scrive in un progetto esistente.
- P3 — Il sito parla di `--no-reminder` e del banner, che arrivano con la 0.13.0: vanno pubblicati insieme (rilascio in parallelo).
