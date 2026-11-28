# F48 — Rilievi di F21–F45, rilascio 0.17.1

**Obiettivo**: chiudere i rilievi scelti dall'utente fra quelli aperti da F21 a F45: chiusure con l'evidenza dell'utente (F21, F23-10, F39, F41), il caso C5 ripetuto (F43), `check` con una lettura negata (F42), lo script delle catene con un server chiamato in un altro modo e la misura ripetuta (F45). Pacchetto e sito insieme alla 0.17.1.

> **Stato: completata il 2026-11-26** (0.17.1 preparata, rilascio con l'ok a parte). Aperta il 2026-11-26 su scelta dell'utente («partiamo da questi»); il flowchart del sito aggiunto in corso di fase su sua richiesta.

**Agenzie**: software (Backend per `check` e per gli script delle prove, Frontend per il sito, QA, Code Reviewer); design (UI Designer, Accessibility) per menu e flowchart, prima con le proposte all'utente e dopo con la revisione nel browser.

## Situazione di partenza

- `main` e `develop` alla 0.17.0 nei due repository.
- F23-10 (P1) e F39 (P2): prova su Windows di `install`, `add` e dell'hook in PowerShell e in una sessione vera. Fatte dall'utente; da chiudere nel piano.
- F41 (P2): risparmio legato a `full_rules` dopo `/clear` o `/compact`. Verificato in F43 (C9 e la prova dopo `/clear`, F43-02), ma la voce di F41 non è segnata chiusa.
- F21 (P3): statistiche della reputazione e passaggio da 404 alla classifica non verificabili in produzione sotto le soglie. Provati in locale; l'utente li accetta così.
- F43 (P2): C5 di `orchestrazione-newsletter` rosso in un'esecuzione su Opus 5.5 (direttore software per primo, senza business né design).
- F42 (P2): con il permission model di Node, `realpathSync` dà `ERR_ACCESS_DENIED` anche per un file che non c'è (provato su Node 26.12.1). `check` tratta ogni errore di lettura di `plan/README.md` come piano assente e risponde «nessun problema»; un file di fase illeggibile risulta «mancante».
- F45 (P3): `agentricaTool` conta solo i server con «agentrica» nel nome (`ponytail:`); la misura del 2026-11-25 copre 24 sessioni.

## Decisioni dell'utente (2026-11-26)

- **C5**: 5 esecuzioni con `claude -p` (C1–C5) su un progetto di `init` della 0.17.0, Opus 5.5. Se 2 o più su 5 sono rosse, una frase nelle istruzioni del server (entro 4096 caratteri).
- **F42**: `ENOENT` resta «piano assente»; ogni altro errore di lettura di `plan/README.md`, di un file di fase o di `audit/` è un errore «non si può leggere».
- **F45**: opzione `--server <nome>`; senza, vale il nome che contiene «agentrica». Poi la misura si ripete.
- **Rilascio**: 0.17.1 di pacchetto e sito, con l'ok a parte alla chiusura.
- **C5, dopo la prima serie** (5 rosse su 5): frase nelle istruzioni; lo script `orchestration` vuole AIBPD come primo reparto. Dopo la seconda serie (C2 rosso 4 su 5): la frase nomina anche `list_agents`, e nuova serie.
- **Sito**: voce «Come funziona» (en «How it works») nel menu in alto, computer e telefono, verso `/orchestrazione`; in cima alla pagina un flowchart in HTML e CSS con due rami, «un reparto» e «più reparti», come nell'immagine data dall'utente (inizio, dato in ingresso, scelta, due rami, fine).

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F48-01 | Chiusure nel piano con l'evidenza: F23-10 e F39 (prove dell'utente su Windows), F41 P2 (F43-02), F21 P3 (accettati dall'utente) | P3 — solo piano |
| F48-02 | `check`: lettura negata distinta da file assente per `plan/README.md`, file di fase e `audit/`, testi it/en, test | P2 — oggi dà «nessun problema» su un piano che non legge |
| F48-03 | C5 ripetuto 5 volte con `claude -p`, esito in `examples/risultati/`; frase nelle istruzioni se 2+ rosse | P2 — rilievo di F43 |
| F48-04 | Script delle catene: `--server <nome>`, test; misura ripetuta, risultato in `examples/risultati/` | P3 — rilievo di F45 |
| F48-05 | Rilascio 0.17.1 di pacchetto e sito in parallelo, con l'ok dell'utente | P2 — rilascio in parallelo |
| F48-06 | Sito: «Come funziona» nel menu e flowchart dell'orchestrazione in `/orchestrazione`, it/en, e2e | P2 — richiesta dell'utente in corso di fase |

## Criteri di accettazione

- Con `node --permission` senza lettura di `plan/README.md`, `check` segnala che non lo può leggere ed esce con 1; senza `plan/` resta «nessun problema».
- Con `--server altro` lo script conta le chiamate di un server che si chiama `altro`.
- Esito delle 5 esecuzioni di C5 scritto con data, versione, client e modello.
- `npm run verify` verde qui; `npm run verify` e `npm run verify:e2e` verdi nel sito.
- «Come funziona» porta a `/orchestrazione` dal menu del computer e del telefono; il flowchart si legge a 1440 e a 360 px senza scorrimento laterale e passa axe.

## Fatto

- **F48-01** Chiusi nel piano con l'evidenza: F23-10 e F39 (prove dell'utente su Windows, PowerShell e sessione vera), F41 P2 (C9 e prova dopo `/clear` di F43-02), le due voci P3 di F21 (accettate dall'utente, provate in sviluppo, con la condizione per riaprirle).
- **F48-02** `check.ts`: `ENOENT` e `ENOTDIR` restano «assente»; ogni altro errore su `plan/README.md`, un file di fase, `audit/`, una sua cartella o un JSON è l'errore «non si può leggere» con il motivo. `ERR_ACCESS_DENIED` dice di aggiungere `--allow-fs-read`; i due errori di `readInside` hanno un codice (`OUTSIDE_PROJECT`, `FILE_TOO_LARGE`) e il testo nella lingua del server; il comando su una cartella che non si legge non dice più «Non trovo la cartella». Con i «Permessi minimi» del README il tool rispondeva «nessun problema» su ogni progetto: ora lo dice, frase nei README it/en. Test in `check.test.ts` (`chmod 000`, saltato su Windows e da root; comando sotto `--permission`) e `project.test.ts` (link fuori dal progetto).
- **F48-03** C5 in tre serie da 5 (`examples/risultati/2026-11-26-orchestrazione-c5.md`): con la 0.17.0 rosse 5 su 5, il modello va da AISA-01 per F0; con la frase nelle istruzioni C5 verde ma C2 rosso 4 su 5; con «parte da list_agents e poi dal direttore business» C1–C6 verdi 5 su 5. Istruzioni a 3.149 caratteri (it) e 3.092 (en). `orchestration-lib.ts`: C5 vuole AIBPD come primo reparto (prima un reparto solo passava sempre), con test; scheda del caso aggiornata.
- **F48-04** `npm run -s tool-chains -- --server <nome>`: conta solo il server con quel nome esatto; senza, come prima. Test in `tool-chains-lib.test.ts`. Misura ripetuta: 29 sessioni, le 5 nuove sono le prove di C5; soglia non superata (13,8% e 8,8%).
- **F48-05** Versione 0.17.1 preparata: `package.json`, `package-lock.json`, `server.json`, `VERSION`, README del pacchetto e della radice, `CHANGELOG` it/en (Cambiato: istruzioni; Corretto: `check`). Il rilascio parte con l'ok dell'utente (CONVENTIONS §13.8), poi la dipendenza del sito a 0.17.1.
- **F48-06** Sito (`agentrica-site`, branch `fase/f48-rilievi`): `src/components/orchestration-flow.tsx` (ovale, parallelogramma, rombo in SVG, due rami con raccordi da md, sotto in due riquadri tratteggiati perché non sembrino passi in fila), testi in `orchestration.flow` dei dizionari it/en, colori dei reparti sul bordo; voce `nav.howItWorks` nel menu del computer e del telefono. Revisione nel browser a 1280 e 390 px: raccordi resi più visibili e rami del telefono incorniciati. E2e in `orchestrazione.spec.ts` sui due progetti (menu, rami, ordine, nessuno scorrimento, inglese).

## Verifiche

- `npm run verify` verde qui: typecheck, lint, 204 test.
- `node packages/mcp/src/server.ts check .` senza errori né contraddizioni.
- Sito: `npm run verify` verde (build compresa); `npm run verify:e2e` 147 passati, 1 saltato. Una prima esecuzione aveva 14 fallimenti in `consumo` e `reputazione`, uguali anche su `develop` pulito: li causava il mio `next dev` per le schermate, avviato senza i dati di prova, che aveva lasciato i totali vuoti nella cache di `unstable_cache` su disco. Cancellata `.next/*/cache/fetch-cache`, tutto verde.
- Prova a mano con `node --permission` e lettura solo di `audit/` o di `plan/README.md`: Node nega già la cartella del progetto, e il comando esce con 2 e «non si può leggere: accesso negato dal permission model di Node, serve --allow-fs-read…» invece di «Non trovo la cartella». Il caso di un file non leggibile dentro una cartella leggibile è provato con `chmod 000`.

## Rilievi aperti

- ~~P3~~ Chiuso in `fix/rilievi-f51` (2026-11-28). La ripetizione della misura delle catene (F45) resta da fare quando l'uso reale cresce. Rifatta su 43 progetti, 42 sessioni e 230 chiamate ([2026-11-28-catene-tool.md](../examples/risultati/2026-11-28-catene-tool.md)): soglia non superata (catene lunghe in 4 sessioni su 42, 9,5%; mediana dei byte intermedi 10%), Code Mode resta rinviato.
- P3: C6 e C7 con la frase nuova non sono provati nel client con il pannello aperto (in `claude -p` le domande non hanno risposta). Issue [#51](https://github.com/flgisimone/agentrica/issues/51).
- P3: nel sito, un `next dev` lanciato a mano senza le variabili dei dati di prova lascia una cache che fa fallire gli e2e di consumo e reputazione per un'ora; da scrivere nel README del sito o da evitare con una chiave di cache che dipenda dai dati di prova. Chiuso in `fix/rilievi-prerilascio` (2026-11-26): il file dei dati finti è nella chiave di `unstable_cache` (`usage-data.ts`, `reputation-data.ts`); provato con un `next dev` senza dati finti prima degli e2e, che passano.

## Dopo la chiusura: `fix/rilievi-prerilascio` (2026-11-26)

Prima del rilascio, su richiesta dell'utente, nei due repository:

- Descrizione npm in `packages/mcp/package.json`: diceva due tool che inviano, sono tre (`rate_agent`, `share_usage`, `submit_project`); ora li dice, con i tool del pannello.
- Segnati chiusi otto rilievi già risolti ma rimasti aperti nel piano: F36-R5, F40 P2, F41 P1, F43 (rilievi di F42), F44 P3, F46 P2, F46 P3 (pannello inglese, guardato in F47), F45 P3 (doppione della voce di F48).
- Script delle schermate del pannello (rilievo P3 di F47) e chiave della cache del sito con i dati finti (rilievo P3 di F48), sopra.
- Testi alternativi di `/pannello` senza il numero di versione, con righe e conteggi delle schermate nuove.
- Verifiche: `npm run verify` verde nei due repository; e2e di pannello, consumo e reputazione verdi (26).

## Dopo la chiusura: `fix/rilievi-metodo` (2026-11-26)

Su scelta dell'utente, prima del rilascio: l'avviso «plan/ senza agente» (P3 di F46) visto nel browser, con la schermata fra le evidenze dell'audit di F46; le tre note di metodo (P3 di F37, F40 e F41) chiuse come accettate, ciascuna con la condizione per riaprirla. Restano aperti sei rilievi: F37 P2 (seconda ondata di misure), F45 P2 (`list_agents`), F46 e F47 P3 (VoiceOver), F48 P3 (misura delle catene; C6 e C7 nel client).

