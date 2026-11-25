# F47 — Sito allineato al pacchetto, rilascio 0.17.0

**Obiettivo**: il sito fa vedere all'utente tutto ciò che il pacchetto offre fino alla 0.17.0; in particolare il pannello locale (nella forma di F46), il controllo `check` e il contesto compatto. Poi pacchetto e sito escono insieme alla 0.17.0.

> **Stato: da aprire, dopo F46.** Pianificata il 2026-11-25 su richiesta dell'utente («verificare che il sito non ometta nulla di quanto fatto e che sia visibile all'utente»).

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
