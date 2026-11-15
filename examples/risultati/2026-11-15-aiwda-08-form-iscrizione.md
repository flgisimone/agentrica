# 2026-11-15 · AIWDA-08 · GACRUX su form-iscrizione

- **Scheda**: [aiwda-08-form-iscrizione](../casi/aiwda-08-form-iscrizione.md)
- **Pacchetto**: `@agentrica/mcp@0.2.0 --agents aiwda-08`
- **Client**: estensione Claude Code per VS Code, conversazione nuova nella copia del progetto (`~/agentrica-casi/form-iscrizione`)
- **Modello**: Opus 5.5, ragionamento Medium
- **Esecuzione**: dall'utente; conteggio nella sessione di sviluppo

## Conteggio

| Esito | Numero | Dettaglio |
|---|---|---|
| Trovati | 8 su 8 | A1 → 11, A2 → 10, A3 → 02, A4 → 05, A5 → 01, A6 → 04, A7 → 03, A8 → 07 |
| Mancati | 0 | |
| Falsi | 0 | Righe citate tutte corrette; contrasti ricalcolati: #aaa su bianco 2,32:1, #ccc su bianco 1,61:1, bianco su #2b59c3 6,33:1 |
| Extra validi | 2 | 06 bordo dei campi #ccc a 1,6:1 (1.4.11); 09 obbligatorietà dei campi non indicata (3.3.2) |
| Accettabili segnalati | 1 | 08 `autocomplete` mancante (1.3.5) |

Osservazioni:

- Analisi solo statica, dichiarata: niente browser, axe o lettore di schermo. Tre rilievi (04, 06, 07) marcati `requires_human_review` e un elenco di cosa resta da provare dal vivo.
- Ha scritto il dettaglio dei rilievi in un JSON nel formato degli audit del reparto, ma nella cartella temporanea della sessione, e ha chiesto se copiarlo nel progetto. Nessun file del progetto modificato.
- Priorità discutibili ma motivate: `lang` e `alt` del logo in P2 (criteri di livello A).

## Rapporto dell'agente

Testo così come l'ha incollato l'utente (impaginazione delle tabelle del terminale).

```text
⏺ La pagina non è conforme alle WCAG 2.2 AA. C'è un problema bloccante (P0): con
  la sola tastiera non si può inviare l'iscrizione, perché "Iscrivimi" è un
  <div> senza focus e senza gestione dei tasti.

  Ho analizzato solo il codice (HTML, CSS, JS). La pagina non è stata aperta in
  un browser, non ho lanciato test automatici come axe e non l'ho provata con
  uno screen reader.

  01 · P0 · 2.1.1, 4.1.2 · index.html:24, app.js:4
  L'invio è un <div>: niente focus, niente Invio/Spazio, nessun ruolo di
  pulsante. Il form non ha un pulsante di invio

  02 · P1 · 1.3.1, 3.3.2, 4.1.2 · index.html:17-23
  Nessun <label>: i campi hanno solo il testo segnaposto e la select del turno
  non ha nome

  03 · P1 · 3.3.1, 1.4.1, 3.3.3 · app.js:9-12, style.css:43-45
  Gli errori sono segnalati solo dal bordo rosso: niente testo, niente
  aria-invalid, il focus non va sul campo da correggere

  04 · P1 · 2.4.7 · style.css:37-41
  outline: none nasconde il focus e non è sostituito da nient'altro

  05 · P2 · 1.4.3 · style.css:19-22
  Testo .hint #aaa su bianco: contrasto 2,3:1, ne servono 4,5:1

  06 · P2 · 1.4.11 · style.css:29-35
  Bordo dei campi #ccc su bianco: contrasto 1,6:1, ne servono 3:1

  07 · P2 · 4.1.3, 2.4.3 · app.js:13-14, index.html:26
  La conferma non viene annunciata né riceve il focus, e il focus si perde

  08 · P2 · 1.3.5 · index.html:17-18
  Manca autocomplete="name" / "email"

  09 · P2 · 3.3.2 · index.html:17-23
  Non è indicato che i campi sono obbligatori

  10 · P2 · 1.1.1 · index.html:11
  Il logo non ha alt (dovrebbe essere alt="Officina")

  11 · P2 · 3.1.1 · index.html:2
  Manca lang="it" su <html>

  Cosa è già a posto: il testo bianco sul pulsante blu (6,3:1), un solo h1, le
  aree header e main, il <title> della pagina e lo zoom non bloccato.

  Cosa resta da verificare:
  - Da fare con un test reale: contrasto del testo segnaposto (dipende dal
    browser), reflow, spaziatura del testo, dimensione dei target cliccabili,
    annunci reali dello screen reader.
  - Da rivedere: i rilievi 04, 06 e 07 hanno requires_human_review: true e vanno
    confermati aprendo la pagina in un browser.

  Ogni rilievo nel JSON ha evidenza, utenti colpiti, severità e correzione
  consigliata. Il file è in una cartella temporanea che può essere svuotata: se
  ti serve, lo copio nel progetto.
```
