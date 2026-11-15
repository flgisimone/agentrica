# Caso AIWDA-08 · GACRUX su form-iscrizione

- **Agente**: AIWDA-08 · GACRUX, Senior Accessibility Specialist (`aiwda-08`)
- **Progetto**: [`progetti/form-iscrizione`](../progetti/form-iscrizione/), pagina statica con un form
- **Compito** (argomento `compito`, da copiare così com'è):

  > Verifica l'accessibilità della pagina di iscrizione rispetto alle WCAG 2.2 AA e riporta i rilievi con criterio, file e riga.

## Difetti attesi

| # | Difetto | Dove | WCAG |
|---|---|---|---|
| A1 | `<html>` senza `lang` | `index.html` | 3.1.1 |
| A2 | Logo senza `alt` | `index.html`, `<img>` | 1.1.1 |
| A3 | Campi e select senza etichetta: solo `placeholder` (o la prima opzione «Turno») | `index.html`, form | 1.3.1, 3.3.2, 4.1.2 |
| A4 | Testo `.hint` #aaa su bianco: contrasto 2,3:1 | `style.css`, `.hint` | 1.4.3 |
| A5 | Pulsante «Iscrivimi» è un `div`: non si raggiunge da tastiera, nessun ruolo | `index.html`, `app.js` | 2.1.1, 4.1.2 |
| A6 | `outline: none` sul focus senza un indicatore alternativo | `style.css` | 2.4.7 |
| A7 | Errori segnalati solo con il bordo rosso: nessun testo, nessun `aria-invalid`, niente annunci | `app.js`, `style.css` | 1.4.1, 3.3.1 |
| A8 | Il messaggio di conferma compare senza essere annunciato né ricevere il focus | `app.js`, `#done` | 4.1.3 |

Accettabili ma non richiesti: `autocomplete` mancante su nome ed email (1.3.5), invio con Invio da tastiera non gestito, bordo dei campi #ccc a 1,6:1 (1.4.11) e obbligatorietà dei campi non indicata (3.3.2), questi due extra validi del 2026-11-15.
