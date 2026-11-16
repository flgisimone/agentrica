# F16 — Pannello multipagina e pulizia

**Obiettivo**: rendere il pannello locale ordinato, con una pagina per ambito invece di una pagina lunga, e chiudere i piccoli lavori di manutenzione: area personale eliminata, file inutili tolti, metodo a fasi e backlog scritto in CONVENTIONS e README.

> **Stato: completata** (2026-11-16). Le pagine nuove arrivano agli utenti con il prossimo rilascio (0.3.2), su richiesta. Fase chiesta dall'utente il 2026-11-16; prende il numero dell'area personale, eliminata.

**Agenzie**: software (Frontend, QA, Code Reviewer); design (UI Designer, Information Architect, Accessibility) per la struttura delle pagine e la revisione nell'app.

## Situazione di partenza

- Il pannello di F14 mette tutto in una pagina sola: Da decidere, Agenti in uso, Fasi (fase aperta con backlog e criteri, tabella di tutte le fasi) e Rilievi. Con 16 rilievi e 17 fasi la pagina è lunga e le parti dal vivo si perdono.
- L'area personale (F16, sospesa dal 2026-11-15) non ha uno scopo per gli utenti.
- La 0.3.1 è nel registro MCP ma «Fatto» di F15 non lo registra.
- `.env.example` è vuoto: il progetto non usa variabili d'ambiente.
- Il metodo a fasi e backlog è descritto solo in `plan/README.md`.

## Decisioni dell'utente all'apertura (2026-11-16)

- **Area personale**: eliminata, non sospesa. Il file resta nella storia di git.
- **Struttura del pannello**: tre pagine. «Sessione» (Da decidere e Agenti in uso, le parti dal vivo), «Piano» (fase in corso con backlog e criteri, tutte le fasi), «Rilievi». Menu in alto con il numero di domande in attesa e di rilievi.
- **Fase**: nuova F16 al posto dell'area personale; il rilascio 0.3.2 si fa dopo, solo su richiesta.
- **Pulizia**: via `.env.example` e i file locali di build (`test-results/`, `tsbuildinfo`); `examples/` resta (casi di prova degli agenti, F15-03 aperto).
- **Documenti**: CONVENTIONS §2.6 «Fasi e backlog» e una riga nel README.
- **Clone e fork**: un repository pubblico su GitHub si clona e si forka sempre; nessun controllo legato alle stelle. Il repository resta pubblico: provenance di npm e registro MCP lo richiedono.

## Backlog

Confermato dall'utente il 2026-11-16.

| # | Task | Priorità |
|---|---|---|
| F16-01 | Area personale eliminata: file di fase, righe in «Fasi», «Decisioni» e README, rimandi nelle fasi passate | P2 |
| F16-02 | Pannello in tre pagine con navigazione da hash (`#sessione`, `#piano`, `#rilievi`), contatori nel menu, focus sul titolo della pagina scelta, avanti e indietro del browser | P1 |
| F16-03 | Pulizia: `.env.example`, `test-results/`, `tsbuildinfo` | P3 |
| F16-04 | CONVENTIONS §2.6 «Fasi e backlog» e riga nel README | P2 |
| F16-05 | Riga della pubblicazione di 0.3.1 nel registro MCP in «Fatto» di F15 | P3 |

## Criteri di accettazione

- Il pannello mostra una pagina per volta; il menu dice quale è aperta (`aria-current`) e quante domande aspettano, da qualunque pagina.
- Una domanda nuova si annuncia ai lettori di schermo anche se si è su un'altra pagina.
- Nessuna violazione axe (WCAG 2.2 AA) sulle tre pagine; nessuno scorrimento orizzontale a 390 px.
- Nessun link al file dell'area personale resta nel piano o nei README.
- `npm run verify` e `npm run verify:e2e` verdi; Code Reviewer sul diff.

## Fatto

- **F16-01** `plan/16-area-personale.md` eliminato (resta nella storia di git); riga in «Fasi», decisione «Autenticazione» e frase sul pannello `/admin` tolte, nuova decisione «Area personale» eliminata; README e rimandi in F11, F12, F14 e F15 aggiornati.
- **F16-02** Pannello in tre pagine (`packages/mcp/src/page/`): menu `nav` con «Sessione», «Piano», «Rilievi», pagina scelta dall'hash e segnata con `aria-current`; contatori di domande in attesa (in evidenza) e rilievi, con nome completo per i lettori di schermo; focus sul titolo della pagina a ogni cambio; annuncio delle domande nuove spostato fuori dalle pagine, così si sente da qualunque pagina. «Piano» mostra fase in corso (o «Nessuna fase in corso»), backlog e criteri, e la tabella di tutte le fasi sempre aperta. Corretto anche il margine verticale di `main`, che `.wrap` annullava, e gli id dei task che andavano a capo. README del pacchetto (italiano e inglese) aggiornati.
- **F16-03** Tolti `.env.example` (vuoto) e la sua eccezione nel `.gitignore`, aggiornata la riga di CONVENTIONS §10; cancellati dal disco `test-results/` e `apps/site/tsconfig.tsbuildinfo`, già ignorati. Componenti del sito controllati: tutti importati.
- **F16-04** CONVENTIONS §2.6 «Fasi e backlog» (file di fase, id e priorità dei task, «Fatto» che il pannello legge, apertura, perimetro, chiusura); riga in «Come si lavora» del README.
- **F16-05** In «Fatto» di F15: 0.3.1 `active` e `isLatest` nel registro MCP ufficiale, pubblicata il 2026-11-15 alle 22:00 UTC.

## Verifiche

- `npm run verify`: superato (59 test unitari). `npm run verify:e2e`: 61 superati, 1 saltato.
- Pannello provato dal vivo con Playwright su questo repository, con una domanda e un'attività finte: le tre pagine a 1280 e 390 px, axe (WCAG 2.2 AA) senza violazioni su tutte e tre, nessuno scorrimento orizzontale, focus sul titolo dopo il clic nel menu, «indietro» del browser che torna alla pagina precedente.
- Revisione del diff (Code Reviewer): un rilievo, il contatore letto come solo numero, corretto con l'`aria-label` del link.
- **Non verificato**: il pannello in una sessione vera di Claude Code con `--panel` (serve il rilascio o un'installazione locale del pacchetto).

## Rilievi aperti

- Risolto: le tre pagine arrivano agli utenti con il rilascio 0.3.2 (2026-11-16, su richiesta dell'utente).
- P3: il pannello multipagina non è stato guardato in una sessione vera di Claude Code.
