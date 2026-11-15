# F9 — Simboli

**Obiettivo**: tornare al «tech scuro» di F0–F6 e dare a ogni agente un simbolo al posto del volto: un glifo SVG calcolato dal nome della sua stella, unico per agente, nello stile comune e nell'accento del reparto.

> **Stato: completata** il 2026-11-15 sul branch `fase/f9-simboli`; proposte decise all'apertura sull'anteprima (vedi «Scelte all'apertura»).

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

## Scelte all'apertura (2026-11-15, sull'anteprima F9-01)

- **Glifo**: stile B · costellazione: da 4 a 7 punti collegati in catena per vicinanza, il primo punto più grande con alone, cerchio di cornice tenue. Hash FNV-1a del nome e generatore mulberry32, in `viewBox` 0 0 100 100, colore `currentColor` nell'accento del reparto.
- **Direttori**: anello doppio attorno al glifo.
- **Hero**: i cinque glifi dei direttori nella griglia del mosaico di F7, con il nome in codice.
- **Fasce di F8**: fondo `--card` (#121a2e) al posto del navy.
- **Ritratti**: si tolgono `public/volti/`, `lib/portraits.ts` e l'etichetta IA dei volti.
- **Simulazione**: il copione passa al compito dei simboli (F9).
- Contrasti misurati nell'anteprima: tutti gli accenti e il testo secondario ≥ 4,5:1 su fondo, card e secondary.

## Proposte valutate all'apertura

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

## Fatto

- **F9-01** Anteprima HTML con tre stili (raggi, costellazione, sigillo), dimensioni d'uso, palette scura con contrasti calcolati e due varianti di fascia. L'utente ha scelto lo stile B, i glifi dei direttori nella hero, la fascia `--card` e il copione dei simboli.
- **F9-02** `lib/glyph.ts`: funzione pura, senza dipendenze, che dal nome restituisce punti, linea e segmento di chiusura. Test in `glyph.test.ts`: stesso nome stesso disegno, 56 disegni diversi, da 4 a 7 punti dentro la cornice e tutti sulla linea.
- **F9-03** `components/star-glyph.tsx` (SVG inline, `aria-hidden`, `data-star`, anello doppio per i direttori) al posto di `Portrait` nel mosaico della hero, nelle card dei reparti, nella squadra e nella pagina dell'agente; il nome in codice resta sempre accanto.
- **F9-04** Tema scuro in `globals.css` (token di F0–F6, ombra delle card e rete dello sfondo scure), `.band` con fondo `--card` senza ridefinire i colori; `themeColor` a `#0b1020`.
- **F9-05** Tolti `public/volti/`, `lib/portraits.ts`, `components/portrait.tsx` e le diciture «Volto IA»; copione della simulazione sul compito di F9; e2e aggiornati (simbolo del direttore nelle card, cinque glifi nella hero, stesso glifo fra squadra e pagina dell'agente, nessun «Volto» residuo).
- **F9-06** Revisione nell'app a 1440, 768 e 360 px: margine sotto i glifi del mosaico aumentato perché il glifo non tocchi l'etichetta. Ogni glifo pesa circa 0,6 kB di SVG inline; la landing prerenderizzata pesa 120 kB di HTML.

## Verifiche

- `npm run verify`: typecheck, lint, 36 test unitari e build passano.
- `npm run verify:e2e`: 53 prove passate, 1 saltata (mosaico sul telefono, per scelta); axe senza violazioni.
- Contrasti misurati nell'anteprima: testo secondario e accenti ≥ 4,5:1 su fondo, card e secondary; il tratto dei glifi usa gli accenti, quindi ≥ 3:1.
- Revisione del codice sul diff nella sessione principale: APPROVE.

## Rilievi aperti

- Il cerchio di cornice del glifo (opacità 0,3) è sotto 3:1: è decorativo e non porta informazione. P3.
- Dal rilievo di F8 resta il repository privato: in F10 diventa pubblico o i passi passano al pacchetto npm. P1 per F10. Risolto in F10: il repository è pubblico.

Il seguito è in [10-pubblicazione.md](10-pubblicazione.md).
