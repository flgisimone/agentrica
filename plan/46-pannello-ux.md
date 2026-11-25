# F46 — Pannello locale: UI e UX

**Obiettivo**: rendere il pannello locale (`packages/mcp/src/page`) più chiaro da leggere e più rapido da usare: cosa chiede attenzione in cima, avvisi con un'azione, piano e rilievi leggibili a colpo d'occhio, consumo più compatto. Il pannello resta una pagina statica senza dipendenze, su 127.0.0.1, con i dati del progetto solo come testo.

> **Stato: da aprire.** Pianificata il 2026-11-25 su richiesta dell'utente («il pannello deve essere migliorato sia a livello UI/UX»). Va prima di F47, così il sito presenta il pannello nella forma nuova.

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

## Proposte da confermare all'apertura

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
| F46-05 | Piano: avanzamento delle fasi e del backlog della fase in corso (conteggi, esito per attività), tabelle che non scorrono di lato a 390 px | P2 |
| F46-06 | Rilievi: filtro e ordinamento per priorità accanto a quello per reparto, conteggi per priorità | P2 |
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
