# F47 — Sito allineato al pacchetto, rilascio 0.17.0

**Obiettivo**: il sito fa vedere all'utente tutto ciò che il pacchetto offre fino alla 0.17.0; in particolare il pannello locale (nella forma di F46), il controllo `check` e il contesto compatto. Poi pacchetto e sito escono insieme alla 0.17.0.

> **Stato: completata** il 2026-11-25; il rilascio 0.17.0 (F47-09) parte con l'ok dell'utente. Pianificata il 2026-11-25 su richiesta dell'utente («verificare che il sito non ometta nulla di quanto fatto e che sia visibile all'utente»).

**Agenzie**: design in sessione (Information Architect per dove va ogni contenuto, UX Writer, UI Designer, Accessibility Specialist); software (Frontend nel sito, QA, Code Reviewer).

## Situazione di partenza

Confronto del 2026-11-25 fra `packages/mcp/CHANGELOG.md` (0.3–0.16) e le pagine di `../agentrica-site` (sito su `@agentrica/mcp` 0.16.0).

**Già presenti**: installazione (`install`, `add`, `--project`, `uninstall`), `init` e `init --existing`, `reminder`, `--subagents`, `--agents`, `--lang`, opzioni `--no-*`, `configure`, valutazioni e reputazione, progetti e `submit_project`, consumo e `share_usage`, biblioteca, orchestrazione con `report` e `ask_user`, modello consigliato nella scheda dell'agente, rilasci dal CHANGELOG, tabella di cosa resta sul computer.

**Lacune**:

| Funzione | Dal | Sul sito oggi |
|---|---|---|
| Pannello locale: sei viste, domande con `ask_user`, avvisi, notifiche, consumo | 0.3.0, rifatto in F46 | Solo una riga fra le opzioni (`--no-panel`) e una nella tabella della privacy; nessuna sezione, nessuna immagine |
| `check`: formato di `plan/` e `audit/`, contraddizioni con le due posizioni, uscita 1 per la CI | 0.15.0 | Solo una riga nella tabella della privacy |
| Contesto compatto: regole comuni e indice una volta per reparto, `full_rules` dopo `/compact`, 54–59% in meno per specialista | 0.14.0 | Niente |
| Passaggio di consegne breve fra agenti e avviso di `report` | 0.14.0–0.15.0 | `report` citato in `/orchestrazione`, il passaggio breve no |
| Modelli consigliati per i 17 agenti misurati | 0.7.0–0.12.0 | Solo nella scheda di ogni agente; nessun quadro d'insieme né filtro nel catalogo |
| Home, «Gli agenti nei tuoi progetti» | — | Tre passi (installa, squadra, chiama); non dice che c'è il pannello |

Fuori perimetro, perché interni: misure di F37, F40 e F45 (Code Mode rinviato).

## Proposte da confermare all'apertura

- Pannello: pagina propria (`/pannello`) o sezione di `/installa`; immagini della pagina reale con un progetto di prova (nessun dato reale, niente persone inventate).
- `check`: sezione in `/installa` («Controlla il piano») o in `/orchestrazione`.
- Contesto compatto e passaggio di consegne: sezione di `/orchestrazione`.
- Modelli consigliati: filtro nel catalogo `/agenti` o tabella in una pagina esistente.

## Decisioni dell'utente (2026-11-25)

- Pannello: pagina propria `/pannello` (`/en/panel`) con schermate reali a 1280 px di un progetto di prova, in italiano e in inglese; la sezione di `/orchestrazione` diventa un rimando.
- `check`: sezione «Controlla il piano» in `/installa`, gruppo «Verifica e manutenzione»; dal pannello un rimando.
- Modelli consigliati: filtro per modello in `/agenti`, con la riga del criterio.
- Backlog confermato com'è, rilascio compreso.

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F47-01 | Ripetere il confronto CHANGELOG ↔ sito sulla 0.17.0 (anche le novità di F46) e confermare la tabella delle lacune | P1 — è la verifica chiesta |
| F47-02 | Pannello sul sito: cosa mostra ogni vista, come si apre (`open_panel`, «apri il pannello»), cosa legge e cosa non manda; immagini a 1280 px con testo alternativo; it/en | P1 — funzione principale invisibile |
| F47-03 | `check`: cosa controlla, esempio di uscita con file e riga, uso nella CI con l'uscita 1; it/en | P1 |
| F47-04 | Contesto compatto e passaggio di consegne breve in `/orchestrazione`, con il dato misurato (54–59%) e quando usare `full_rules`; it/en | P2 |
| F47-05 | Modelli consigliati visibili nel catalogo `/agenti` (filtro o etichetta) con il criterio della misura | P3 |
| F47-06 | Home: il passo o la frase che porta al pannello e a `check` | P2 |
| F47-07 | Navigazione: le pagine o sezioni nuove nel menu di documentazione (`docs-nav`) e nella mappa del sito | P2 |
| F47-08 | e2e delle pagine nuove (it/en, 390 px), revisione design nel browser, Code Reviewer | P1 — obbligatoria |
| F47-09 | Rilascio 0.17.0 di pacchetto (F46) e sito in parallelo, con l'ok dell'utente; `main` e `develop` allineati nei due repository | P2 — rilascio in parallelo |

## Criteri di accettazione

- Ogni voce «Nuovo» del CHANGELOG fino alla 0.17.0 rivolta all'utente ha un posto sul sito, o la ragione per cui non ce l'ha scritta nel piano.
- Immagini del pannello senza dati reali né percorsi del computer dell'utente.
- `npm run verify` verde qui; `npm run verify` e `npm run verify:e2e` verdi nel sito.
- Pacchetto e sito alla stessa versione in produzione.

## Fatto

- **F47-01** Confronto CHANGELOG ↔ sito ripetuto sulla 0.17.0: confermata la tabella delle lacune. Voce 0.17.0 del CHANGELOG (it/en) scritta con le novità del pannello di F46 (chiude il P2 di F46); versione 0.17.0 in `package.json`, `server.json`, `VERSION` di `prompt.ts`, comandi dei README. Dove sta ogni voce «Nuovo» rivolta all'utente: pannello e avvisi (0.3–0.17) in `/pannello`; `check` (0.15) in `/installa#controlla-piano`; regole una volta per reparto e `full_rules` (0.14) e `report` con l'avviso (0.15) in `/orchestrazione`; `reminder` (0.16), promemoria (0.13), `init --existing` (0.11) e opzioni già in `/installa`; modelli consigliati (0.7–0.12) in `/agenti` e nella scheda dell'agente; valutazioni, consumo, progetti e biblioteca nelle loro pagine. Fuori: misure interne (F37, F40, F45) e `agent-text --sizes`, che serve a chi clona il repository.
- **F47-02** Pagina `/pannello` e `/en/panel` (`src/app/[lang]/pannello/`): come si apre, testata e avvisi, le sei viste, notifiche, cosa legge e cosa non manda, con indice `DocsNav`. Sei schermate per lingua del pannello vero (avvisi, Sessione, Agenti, Piano, Rilievi, Consumo), fatte con Playwright su un progetto di prova creato con `init` (piano, audit, consumo e compiti inventati, nessun percorso del computer), con testo alternativo, didascalia e link all'immagine intera. Il pannello inglese ora è stato visto nel browser (chiude il P3 di F46).
- **F47-03** `/installa`, «Controlla il piano»: cosa controlla, i tre modi d'uso, il comando (`mcp.check`, uguale al README), un'uscita vera con file e riga, l'uscita 1 per la CI. Il blocco d'uscita ha `data-output`, escluso dal test che confronta i comandi con il README.
- **F47-04** `/orchestrazione`: sezioni «Contesto compatto» (regole e indice una volta per reparto, dal 54 al 59% in meno per specialista, `full_rules` dopo `/compact` o `/clear`, subagent) e «Passaggio di consegne» (esito, rilievi con l'evidenza, domande aperte; avviso di `report`); la vecchia sezione sul pannello, ferma alla Sessione di prima di F46, è un rimando a `/pannello`.
- **F47-05** `/agenti`: filtro per modello consigliato (Haiku, Sonnet, modello della sessione, con il conteggio) e riga del criterio; nell'indirizzo come il reparto (`?modello=`, `?model=`).
- **F47-06** Home, «Come si usa»: quarto passo «Segui il lavoro dal pannello» con il link a `/pannello`; `check` nella riga finale.
- **F47-07** Navigazione: «Il pannello» nel footer, `/pannello` nella sitemap e nelle riscritture inglesi, voce «Controlla il piano» nell'indice di `/installa`, ancore tradotte (`controlla-piano`, `permessi-minimi`, `locale`) in `EN_WORDS`.
- **F47-08** e2e: `pannello.spec.ts` nuovo (sezioni, sei immagini caricate con testo alternativo, indice, rimandi in inglese, 360 px, axe), filtro per modello in `agenti.spec.ts`, «Controlla il piano» e indice a 15 voci in `installa.spec.ts`, sezioni nuove in `orchestrazione.spec.ts`, `/en/panel` nella sitemap. Revisione di design nel browser a 1280 e 390 px delle pagine toccate (nessuno scorrimento orizzontale; schermate piccole sul telefono, da qui il link all'immagine intera). Code Reviewer sul diff, nella sessione: APPROVE.

## Verifiche

- Qui: `npm run verify` verde (typecheck, lint, 202 test); `check .` senza problemi.
- Sito: `npm run verify` verde (69 test unitari e build, con `/it/pannello` e `/en/panel`); `npm run verify:e2e` verde, 145 passati e 1 saltato come prima.
- Il sito usa ancora `@agentrica/mcp` 0.16.0 da npm: comandi e `/rilasci` passano alla 0.17.0 quando il pacchetto è pubblicato e il sito alza la dipendenza (F47-09).

## Rilievi aperti

- P3: le schermate del pannello vanno rifatte quando il pannello cambia aspetto; lo script e i dati di prova non sono nel repository (sono stati fatti in una cartella temporanea): da aggiungere se servono di nuovo. Chiuso in `fix/rilievi-prerilascio` (2026-11-26): `npm run -s panel-screenshots -- [--site ../agentrica-site]` (`scripts/panel-screenshots.ts`) crea il progetto di prova con `init`, avvia il server con un client MCP vero in cartelle temporanee (HOME, `CLAUDE_CONFIG_DIR`, `open` finto) e scrive le dodici schermate in `src/assets/pannello/` del sito; schermate rifatte sulla 0.17.1.
- P3: nessuna prova con un lettore di schermo vero sulle pagine nuove; verificati struttura, testi alternativi e axe.
