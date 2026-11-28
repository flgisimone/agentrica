# F46 — Pannello locale: UI e UX

**Obiettivo**: rendere il pannello locale (`packages/mcp/src/page`) più chiaro da leggere e più rapido da usare: cosa chiede attenzione in cima, avvisi con un'azione, piano e rilievi leggibili a colpo d'occhio, consumo più compatto. Il pannello resta una pagina statica senza dipendenze, su 127.0.0.1, con i dati del progetto solo come testo.

> **Stato: completata** (aperta e chiusa il 2026-11-25, branch `fase/f46-pannello-ux`; nessun rilascio: esce con F47). Pianificata lo stesso giorno su richiesta dell'utente («il pannello deve essere migliorato sia a livello UI/UX»). Va prima di F47, così il sito presenta il pannello nella forma nuova.

**Agenzie**: design in sessione, senza subagent (scelta dell'utente): UX Designer, UI Designer, Accessibility Specialist, Dataviz Designer, UX Writer; software (Frontend, QA, Code Reviewer).

## Situazione di partenza

Letta dal codice il 2026-11-25 (`index.*.html`, `style.css`, `app.js`, 0.16.0); **il pannello non è stato guardato nel browser**: F46-01 lo fa prima di decidere.

- Sei viste a schede (Sessione, Agenti, Piano, Rilievi, Valutazioni, Consumo) con contatori; tema scuro con la palette del sito; aggiornamento con `/api/events` e ogni 10 s.
- **Avvisi**: versione nuova, informazione sul piano, errori di formato e contraddizioni sono quattro paragrafi uno sopra l'altro, sopra ogni vista, con testo a righe (`white-space: pre-line`); file e riga non si aprono e non c'è un'azione suggerita.
- **Sessione**: «Da decidere» è quasi sempre vuota ma occupa il primo posto; la nota sui subagent è un paragrafo lungo, sempre in vista.
- **Piano**: fase in corso e tutte le fasi in tabelle; niente avanzamento (fasi completate su totali, attività del backlog con esito).
- **Rilievi**: filtro solo per reparto; niente filtro o ordinamento per priorità, niente conteggi per priorità.
- **Consumo**: riquadri di sintesi, poi quattro tabelle con barre una sotto l'altra (giorno, agente, modello, sessione) e la condivisione in mezzo: pagina lunga, nessun periodo da scegliere.
- **Testata**: marchio, progetto, pulsante delle notifiche e stato del collegamento sulla stessa riga; non dice versione né ora dell'ultimo aggiornamento, non porta al sito.
- Rilievo aperto da F44 (P3): la casella delle contraddizioni non è mai stata vista nel browser.

## Decisioni dell'utente (2026-11-25, dopo F46-01)

- **Backlog**: tutte le voci; la correzione di «completata (…)» in `project.ts` e `check.ts` (F46-UX-01) entra in F46-05; F46-06 scende a P3 e si riduce al filtro per priorità, perché gruppi e conteggi ci sono già.
- **Avvisi**: una zona sola e compatta su tutte le viste, una riga per tipo con titolo, conteggio e azione; l'elenco file:riga a scomparsa, come testo copiabile.
- **Sessione**: in cima un riquadro di attenzione (domande, agenti da valutare) solo quando c'è qualcosa; vuoti di una riga; nota dei subagent a scomparsa.
- **Consumo**: sintesi in alto, schede per giorno, agente, modello e sessione, condivisione in fondo; niente periodo.
- Testi it e en insieme.

## Proposte da confermare all'apertura (decise sopra)

- Elenco dei rilievi di F46-01 con priorità, e quali entrano nella fase.
- Ordine della Sessione (attenzione richiesta in cima, vuoti compatti) e forma degli avvisi.
- Consumo: schede o sezioni a scomparsa invece di quattro tabelle in fila; periodo sì o no.
- Se i cambi toccano il testo visibile, testi it/en insieme (UX Writer).

## Backlog

| ID | Attività | Priorità |
|---|---|---|
| F46-01 | Audit nel browser, in sessione: le sei viste a 1280 e 390 px con un progetto di prova (piano con errori di formato e una contraddizione, rilievi, una domanda, agenti, consumo); rilievi di UX, UI, accessibilità, dataviz e testi in `audit/f46-pannello/`, con la loro priorità | P1 — senza vederlo i rilievi sono ipotesi |
| F46-02 | Avvisi in una zona sola: tipo (versione, piano, formato, contraddizioni) con titolo, conteggio e azione suggerita; file e riga come testo copiabile; chiude il rilievo P3 di F44 | P1 — è ciò che chiede di agire |
| F46-03 | Sessione: in cima ciò che chiede l'utente (domande, avvisi, agente da valutare); stati vuoti di una riga; nota dei subagent a scomparsa | P1 — prima cosa che si vede |
| F46-04 | Testata: versione del server, ora dell'ultimo aggiornamento, stato del collegamento leggibile su telefono, link al sito | P2 |
| F46-05 | Piano: fase in corso giusta anche con lo stato «completata (…)» (F46-UX-01, anche in `check.ts`); avanzamento delle fasi e del backlog della fase in corso (conteggi, esito per attività), tabelle che non scorrono di lato a 390 px | P2 |
| F46-06 | Rilievi: filtro per priorità accanto a quello per reparto (gruppi e conteggi per priorità ci sono già) | P3 — ridotta dopo F46-01 |
| F46-07 | Consumo: sintesi in alto, dettagli per giorno, agente, modello e sessione raggruppati; condivisione in fondo; grafico per giorno leggibile senza colore solo | P2 |
| F46-08 | Accessibilità della pagina rivista: ordine del focus fra le schede, annunci di `aria-live` non ripetuti a ogni aggiornamento, contrasti dei colori dei reparti sui fondi nuovi, bersagli di 44 px | P2 — WCAG 2.2 AA |
| F46-09 | Test di `panel.test.ts` e dei testi it/en aggiornati; README (sezione del pannello) e CHANGELOG | P2 |
| F46-10 | Revisione design nel browser dopo le modifiche (1280 e 390 px) e Code Reviewer sul diff | P1 — obbligatoria |

## Criteri di accettazione

- I rilievi P1 di F46-01 chiusi con l'evidenza; i P2 chiusi o motivati nei «Rilievi aperti».
- A 390 px nessuna vista scorre di lato; a 1280 px un avviso di formato e una domanda aperta si vedono senza scorrere.
- Dati del progetto ancora solo come testo (`textContent`), nessuna dipendenza nuova, nessuna richiesta fuori da 127.0.0.1 oltre a quelle di oggi.
- `npm run verify` verde.
- Nessun rilascio in questa fase: pacchetto e sito escono insieme alla fine di F47.

## Fatto

- **F46-01** Audit nel browser con Playwright (Chromium del repository del sito) sulle sei viste a 1280 e 390 px, su un progetto di prova: copia di `plan/` e `audit/` con un id doppio e un'attività P0 senza esito in una fase completata, quattro agenti, una domanda, due subagent, consumo di otto sessioni. Undici rilievi in [`audit/2026-11-25-f46/`](../audit/2026-11-25-f46/) (UX, accessibilità, dataviz, testi), con le schermate prima e dopo in `evidenze/`. Il P1 principale era un difetto: la «Fase in corso» era F34, perché lo stato «completata (0.10.0)» non contava come chiuso.
- **F46-02** Avvisi in una zona sola, sopra ogni vista (`#alerts`): versione nuova, `plan/` senza agente (prima un paragrafo nella Sessione), piano da creare, errori di formato e contraddizioni. Ogni avviso ha una riga con titolo, conteggio e azione, e un «Dove» a scomparsa con i punti `file:riga` come testo da copiare, che resta aperto fra un aggiornamento e l'altro. La zona si ridisegna solo quando cambia e annuncia solo i tipi nuovi. La casella delle contraddizioni ora è stata vista nel browser (chiude il P3 di F44).
- **F46-03** Sessione: in cima «Serve la tua attenzione» con le domande e il link agli agenti da valutare, solo quando c'è qualcosa, altrimenti una riga. La nota dei subagent è a scomparsa («Cosa sono»).
- **F46-04** Testata: versione del server (`version` in `/api/state`, con un test), «aggiornato alle» con l'ora dell'ultimo dato, link al sito nella lingua del pannello, stato del collegamento con un segno anche quando è interrotto. Le schede vanno a capo e a 390 px si vedono tutte.
- **F46-05** Stato di una fase valutato sulla prima parola (`phaseState` in `project.ts`, usato anche da `check.ts`), con i test aggiornati. Ha fatto emergere due contraddizioni vere in F37 (`**F37-03, F37-04**` in un solo grassetto), corrette. Piano: attività fatte su totali, la priorità nel backlog come codice con la motivazione sotto l'attività, esito con il segno ✓, fasi completate su totali, elenco delle fasi a scomparsa. A 390 px il Piano passa da 10687 a circa 3970 px e non scorre di lato.
- **F46-06** Rilievi: filtro per priorità accanto a quello per reparto, con le etichette visibili «Reparto» e «Priorità». Con una priorità scelta il suo gruppo è aperto; con due filtri senza risultati compare «Nessun rilievo con questi filtri».
- **F46-07** Consumo: sintesi in alto, dettaglio a schede (giorno, agente, modello, sessione) con una tabella per volta, condivisione in fondo. La colonna e il riquadro del risparmio del modello compaiono solo se c'è un valore. A 390 px si vedono chiave, token, cache e costo. Valori sempre scritti accanto alle barre. A 1280 px la vista passa da 1701 a 1058 px.
- **F46-08** Accessibilità: bersagli di almeno 44 px per schede, filtri, pulsanti e «Elenco delle fasi» (nessun bersaglio sotto i 24 px nella prova). Le regioni live e i conteggi si scrivono solo quando cambiano (`setText`). La barra di avanzamento è nascosta ai lettori di schermo, perché il conteggio è già scritto. Ordine del focus verificato con Tab: marchio, schede, avvisi, contenuto. Corretto anche un difetto trovato nella prova: `display` sulle schede annullava `hidden`, e «Valutazioni» compariva anche con `--no-ratings` (regola generale `[hidden]`).
- **F46-09** Test: `panel.test.ts` (versione nello stato), `project.test.ts` e `check.test.ts` (stato con nota fra parentesi). Testi it/en con le stesse chiavi e gli stessi id (test di `lang.test.ts`). Sezione «Pannello locale» dei README it/en aggiornata (testata, avvisi, Sessione, Piano, Rilievi, Consumo, regola dello stato). Il CHANGELOG va scritto con la 0.17.0 in F47: il test vuole che la prima voce sia la versione del pacchetto.
- **F46-10** Revisione di design nel browser dopo le modifiche, alle stesse larghezze, con le schermate in `evidenze/dopo-*`. Prova delle interazioni con Playwright: riquadro di attenzione che compare e sparisce, annuncio della domanda, «Dove» che resta aperto, filtri, schede del consumo, nessun errore in console. Code Reviewer sul diff, nella sessione: un rilievo, l'ora «aggiornato alle» presa al disegno invece che all'arrivo dei dati, corretto (`refresh()`). Esito APPROVE.

## Verifiche

- `npm run verify` verde: typecheck, lint, 202 test.
- `node packages/mcp/src/check.ts .` senza errori né contraddizioni.
- Browser (Chromium, Playwright): sei viste a 1280 e 390 px, `scrollWidth` uguale alla larghezza in tutte e dodici. A 1280 px avviso di formato e domanda aperta visibili senza scorrere (la domanda parte a circa 330 px).
- Dati del progetto solo con `textContent`; nessuna dipendenza nuova. Nessuna richiesta nuova: il link al sito è una navigazione dell'utente.

## Rilievi aperti

- P2: voce del CHANGELOG (it/en) con le novità del pannello da scrivere nella 0.17.0 di F47. Chiuso in F47-01: voce 0.17.0 scritta.
- P3: pannello in inglese non guardato nel browser: verificati solo chiavi e id uguali fra le lingue. Chiuso in F47-02: il pannello inglese è stato guardato e fotografato nel browser (`src/assets/pannello/*-en.png` del sito).
- ~~P3~~ Chiuso come accettato in `fix/rilievi-f51` (2026-11-28, scelta dell'utente). Nessuna prova con un lettore di schermo vero (VoiceOver); verificati struttura, etichette e regioni live dal codice.
- P3: l'avviso «plan/ senza agente» non è stato visto nel browser in questa fase (lo stato `noAgent` richiede una modifica a `plan/` dopo l'avvio del server). Chiuso in `fix/rilievi-metodo` (2026-11-26): visto nel browser sulla 0.17.1, con un client MCP vero su un progetto di `init`: assente all'apertura, compare in cima dopo una modifica a `plan/` senza agenti, con l'azione da fare; schermata in `audit/2026-11-25-f46/evidenze/dopo-avviso-plan-senza-agente.png`.
