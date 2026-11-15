# F9 — Simboli

**Obiettivo**: tornare al «tech scuro» di F0–F6 e dare a ogni agente un simbolo al posto del volto: un glifo SVG calcolato dal nome della sua stella, unico per agente, nello stile comune e nell'accento del reparto.

> **Stato: da fare.** Scelte di fondo confermate dall'utente il 2026-11-15, dopo F8 (vedi «Decisioni»); le «Proposte da confermare» si decidono all'apertura.

**Agenzie**: design (UI Designer e Design System Specialist per glifo e palette, Accessibility Specialist per contrasti e testi alternativi, UX Writer per le diciture che spariscono); software (Frontend, QA, Performance, Code Reviewer).

## Situazione di partenza

- Tema corporate chiaro di F7 in `apps/site/src/app/globals.css`, con la fascia `.band` navy di F8. Il tema scuro di F0–F6 è nella storia di git (`e2c5f24^:apps/site/src/app/globals.css`: fondo `#0b1020`, card `#121a2e`, accenti `#f5b544`, `#ff7a6b`, `#b49cff`, `#38d6f0`, `#4fe0a8`).
- Ritratti: `public/volti/<id>.webp` (solo i direttori), `lib/portraits.ts`, `components/portrait.tsx` con l'etichetta «Volto generato con IA» e il segnaposto con l'iniziale. Usati nel mosaico della hero (`directors-mosaic.tsx`), nelle card dei reparti, nella squadra e nella pagina dell'agente; gli e2e controllano le diciture.
- La costellazione della hero di F6 è stata sostituita dal mosaico dei direttori in F7 (`2eace22` per la versione precedente).
- La simulazione di F8 racconta il compito dei volti (F7): resta vera come storia del progetto.

## Decisioni (2026-11-15)

- **Tema**: torna il tech scuro di F0–F6; restano Inter e JetBrains Mono (F7), header, transizioni, sfondo a rete e le sezioni di F8.
- **Simboli**: un glifo SVG per stella, calcolato dal nome (stesso nome, stesso disegno), nessun file da disegnare a mano.
- **Fase**: prima della pubblicazione, che diventa F10.

## Proposte da confermare all'apertura

- **Forma del glifo**: anteprima HTML con due o tre stili (es. stella a raggi con anelli d'orbita; piccola costellazione di 4–7 punti collegati; sigillo geometrico in un cerchio), tutti calcolati da un hash del nome in `lib/` senza dipendenze; si sceglie sull'anteprima, come la palette di F7.
- **Direttori**: stesso stile con un segno in più (corona, anello doppio), così il ruolo si vede anche dal simbolo.
- **Hero**: i cinque glifi dei direttori al posto del mosaico, oppure la costellazione di F6 con i glifi.
- **Fasce di F8**: sul tema scuro diventano una fascia `--card` o `--secondary` alternata al fondo, al posto del navy.
- **Ritratti**: si tolgono `public/volti/`, `lib/portraits.ts` e l'etichetta IA dei volti; il sito continua a dire che gli agenti sono IA (piano, «Trasparenza»).
- **Copione della simulazione**: resta il compito dei volti (fatto vero) o passa a quello dei simboli.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F9-01 | Anteprima degli stili del glifo e della palette scura con contrasti misurati; **conferma dell'utente** | P1 |
| F9-02 | Generatore del glifo in `lib/` (puro, deterministico) con test: 56 glifi distinti, stesso nome stesso disegno | P1 |
| F9-03 | Componente del simbolo al posto di `Portrait` in hero, card, squadra e pagina dell'agente; testo alternativo o `aria-hidden` accanto al nome in codice | P1 |
| F9-04 | Tema scuro in `globals.css`, fascia alternata, sfondo a rete con i colori scuri | P1 |
| F9-05 | Pulizia: ritratti, `portraits.ts`, diciture «Volto IA»; e2e aggiornati | P2 |
| F9-06 | Revisione di design nell'app (360, 768, 1440 px), axe, peso degli SVG | P2 |

## Criteri di accettazione

- Stile del glifo e palette sono quelli confermati dall'utente sull'anteprima.
- Ogni agente ha un glifo diverso, sempre uguale fra un build e l'altro; il nome in codice resta accanto al simbolo (lo stato non si affida al solo colore).
- Testo e accenti ≥ 4,5:1, elementi grafici ≥ 3:1 sul nuovo fondo.
- Nessun ritratto né dicitura dei volti residua; nessuna dipendenza nuova senza conferma.
- `npm run verify` e `npm run verify:e2e` passano.

Il seguito è in [10-pubblicazione.md](10-pubblicazione.md).
