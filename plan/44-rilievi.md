# F44 — Rilievi piccoli e medi di F37–F42, rilascio 0.16.0

**Obiettivo**: chiudere i rilievi meno costosi rimasti aperti da F37 a F42 (piano, caso di prova, `check`, pannello, sito, promemoria) e portare pacchetto e sito insieme alla 0.16.0.

> **Stato: completata il 2026-11-25** (0.16.0). Aperta il 2026-11-25 su scelta dell'utente («facciamo queste»: le voci a costo basso e medio dell'elenco dei rilievi aperti).

**Agenzie**: software (Backend per `check`, `reminder` e lo script delle prove, Frontend per pannello e sito, QA, Code Reviewer); design (UX Writer e UI Designer) per i testi e la casella nuova del pannello e per i ritocchi del sito.

## Situazione di partenza

- `main` e `develop` alla 0.15.1 nei due repository.
- F39 P3 (sito e `--no-reminder`): superato dai rilasci in parallelo dalla 0.13.0, mai segnato come chiuso.
- F37 P3: in `examples/progetti/portale-ordini` `app/auth.js` richiede `./mail`, che manca; il README dice che il bilanciatore «passa il TCP» e insieme «aggiunge `X-Forwarded-For`», che serve un bilanciatore HTTP.
- F37 P3: i subagent di prova ricevono il testo con `npm run agent-text` e non hanno il tool `library` del server.
- F42 P3: `check` non dà la riga di un JSON illeggibile; Node 26.12 la scrive di nuovo nel messaggio («line 3 column 2»).
- F42 P3: nel pannello le contraddizioni stanno nella casella degli errori.
- F38-R1 (P3): senza JavaScript `/consumo` mostra solo la prima scheda; F38-R2 (P3): su telefono i totali sopra le barre dei mesi sono nascosti.
- F39 P3: con `add` o `install` senza `init` (e con `init --existing` se `.claude/settings.json` c'è già) il promemoria va aggiunto a mano.

## Decisioni dell'utente (2026-11-25)

- **Promemoria**: comando `reminder` che aggiunge l'hook a `.claude/settings.json` della cartella, tenendo le chiavi che ci sono e senza duplicarlo.
- **Contraddizioni**: casella a sé nel pannello, con le due posizioni.
- **`/consumo` senza JavaScript**: pannelli sempre nell'HTML (`keepMounted`), mostrati tutti da una regola CSS quando lo script non gira.
- **Rilascio**: pacchetto e sito insieme alla 0.16.0, con l'ok a parte alla chiusura (CONVENTIONS §13.8).

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F44-01 | F39 P3 del sito chiuso nel piano con l'evidenza dei rilasci | P3 |
| F44-02 | `portale-ordini`: `app/mail.js` e la frase del bilanciatore coerente | P3 |
| F44-03 | `check`: riga del JSON illeggibile dal messaggio di `JSON.parse`, con test | P3 |
| F44-04 | Sito, F38-R2: totali dei mesi leggibili su telefono, provato a 390 px | P3 |
| F44-05 | Prove: `npm run agent-text -- <id> --cards <schede>` stampa le schede come `library`; metodo in `examples/README.md` | P3 |
| F44-06 | Pannello: casella «Contraddizioni» a sé, testi it/en, test | P3 |
| F44-07 | Sito, F38-R1: `/consumo` con tutte le schede e le tabelle senza JavaScript, e2e con lo script spento | P3 |
| F44-08 | Comando `reminder`: hook in `.claude/settings.json` senza toccare il resto e senza duplicati; README it/en, test | P3 |
| F44-09 | Rilascio 0.16.0 di pacchetto e sito in parallelo, con l'ok dell'utente | P2 — rilascio in parallelo |

## Criteri di accettazione

- `npm run verify` verde qui; `npm run verify` e `npm run verify:e2e` verdi nel sito.
- `reminder` lanciato due volte lascia un solo hook e le altre chiavi di `settings.json` invariate.
- Un JSON con un errore in riga 3 dà nel risultato di `check` la riga 3.

## Fatto

- **F44-01** F39 P3 chiuso in `39-promemoria-agenti.md`: pacchetto e sito sono usciti insieme dalla 0.13.0 alla 0.15.1.
- **F44-02** `examples/progetti/portale-ordini/app/mail.js` (invio con l'API HTTPS del fornitore, chiave da variabile d'ambiente, timeout), senza difetti nuovi. README: il bilanciatore non termina TLS e passa il TCP senza intestazioni, quindi un `X-Forwarded-For` viene solo dal client; il difetto atteso N1 (`set_real_ip_from 0.0.0.0/0`) resta e diventa coerente.
- **F44-03** `check.ts`: la riga dal messaggio di `JSON.parse` («line N column M»); Node 26.12 la scrive per gli errori «Expected …», non per «Unexpected token» né per il file vuoto (`ponytail:` nel codice). Test in `check.test.ts` con una virgola mancante (riga 3) e un file vuoto (senza riga).
- **F44-04** Sito, `usage-charts.tsx`: su telefono il totale del mese sta sotto l'etichetta, in forma breve («28,1 Mln»); sopra le barre resta da 640 px. E2e a 390 px: totali visibili, non sovrapposti, nessuno scorrimento orizzontale. `ponytail:` oltre 6 mesi.
- **F44-05** `npm run -s agent-text -- <id> --cards <schede>` stampa le schede con la `cardText` del server; scheda sconosciuta: errore con l'elenco delle schede del reparto, uscita 1. Metodo al passo 2 di `examples/README.md`.
- **F44-06** Pannello: `/api/state` manda `problems` (errori) e `contradictions`; la pagina li mostra in due caselle con titolo e numero (it, en), le contraddizioni con il bordo ambra. Test in `panel.test.ts`; README it/en.
- **F44-07** Sito: pannelli delle schede e «Vedi i numeri» con `keepMounted`; dentro `[data-open-without-js]`, `@media (scripting: none)` in `@layer base` mostra tutti i pannelli e nasconde schede e pulsanti (il `[hidden]` del preflight è `!important`). E2e con JavaScript spento: niente `tablist` né pulsanti, le quattro tabelle visibili.
- **F44-08** Comando `reminder [cartella]` (`addReminder` e `runReminder` in `init.ts`): crea `.claude/settings.json` o aggiunge l'hook a `hooks.UserPromptSubmit` tenendo il resto; non lo ripete se c'è già in una delle due lingue; un file che non è un oggetto JSON nella forma di Claude Code non si tocca (uscita 1). `init --existing` con `settings.json` presente ora indica il comando. README it/en (Promemoria, Cosa resta sul computer), pagina Installa del sito (it, en). Test in `init.test.ts`.
- **F44-09** Versione 0.16.0 preparata: `package.json`, `server.json`, `VERSION`, README del pacchetto e della radice, `CHANGELOG` it/en. Rilascio con l'ok dell'utente: PR #44 in `main`, tag `v0.16.0`, npm con provenance; sito con la dipendenza a 0.16.0, PR #24 in `main`, deploy Vercel, `https://agentrica.vercel.app/it/installa` mostra `@agentrica/mcp@0.16.0` e `reminder`. `develop` e `main` allineati nei due repository.

## Verifiche

- `npm run verify` in questo repository: verde (uscita 0).
- Sito: `npm run verify` verde; `npm run verify:e2e` 135 passate, 1 saltata (con le due prove nuove di `consumo.spec.ts`, su computer e telefono).
- Prova visiva del sito con screenshot da Playwright (`next dev` con i totali finti): grafico dei mesi a 390 px con i totali sotto le etichette; `/consumo` senza JavaScript con tutti i grafici e le tabelle. Nessuna prova a mano con `npm run dev`.
- Pannello: la casella delle contraddizioni è provata dal test della rotta, non vista nel browser.

## Rilievi aperti

- ~~P3 — `reminder` riscrive `.claude/settings.json` con rientro di 2 spazi: il contenuto resta, la formattazione di un file indentato in altro modo no.~~ Chiuso su `fix/reminder-rientro` (2026-11-25): il file riscritto tiene rientro (tab o spazi, dalla prima riga rientrata), fine riga (CRLF) e a capo finale; test in `init.test.ts` con tab e CRLF senza a capo, e con 4 spazi.
- P3 — La casella delle contraddizioni del pannello non è stata guardata nel browser: da vedere alla prima sessione con il pannello aperto sulla 0.16.0. Chiuso in F46-02: casella vista nel browser.
