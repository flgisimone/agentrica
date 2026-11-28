# F55 — Rebranding dell'interfaccia di AIgentrica

**Obiettivo**: il sito su `aigentrica.it` ha un'identità visiva e un'esperienza rinnovate per il marchio AIgentrica (logo, tipografia, gerarchia, componenti, flussi principali), mantenendo la palette attuale e senza perdere accessibilità né contenuti.

> **Stato: da fare.** Registrata il 2026-11-28; parte dopo il rilascio di F54. Perimetro e backlog si definiscono all'apertura con le agenzie e si confermano con l'utente.

**Agenzie**: business (Product Marketing per posizionamento e messaggi del nuovo marchio); web design (Director, UI, Design System, UX, UX Writer, Accessibility) prima per l'audit e le specifiche e dopo per la revisione nel sito; software (Frontend, QA, Code Reviewer).

## Decisioni dell'utente

| Tema | Decisione | Data |
|---|---|---|
| Palette | Resta quella attuale; cambiano soprattutto UI e UX | 2026-11-28 |
| Marchio | AIgentrica (vedi F54) | 2026-11-28 |

## Proposte da confermare

- Cosa del linguaggio visivo di F28 («osservatorio stellare», mappa del cielo, nomi di stella) resta e cosa cambia con il nuovo marchio.
- Logo e favicon: wordmark AIgentrica con «AI» in evidenza, o un simbolo nuovo.
- Pagine prioritarie della revisione (home, `/agenti`, pagina agente, `/installa`, `/impara`, header e menu).

## Backlog

| # | Task | Priorità |
|---|---|---|
| F55-01 | Messaggio e posizionamento del marchio AIgentrica (business), base per i testi | P1 |
| F55-02 | Audit di design dell'interfaccia attuale rispetto al nuovo marchio, con rilievi in `audit/` | P1 |
| F55-03 | Specifiche: logo, tipografia, spaziature, componenti e stati, con la palette esistente nei token | P1 |
| F55-04 | Implementazione nel sito, pagina per pagina secondo le priorità confermate | P1 |
| F55-05 | Revisione di design e accessibilità (WCAG 2.2 AA) nel sito, e2e e screenshot aggiornati | P1 |

## Criteri di accettazione

- Palette invariata: stessi valori dei token di colore, contrasti AA rispettati.
- Logo, favicon e immagini Open Graph con il marchio AIgentrica.
- Rilievi di design P0 e P1 chiusi con evidenza; `npm run verify:e2e` passa.
