# F55 — Audit di design dell'interfaccia (AIWDA)

**Direttore**: AIWDA-01 · CANOPUS. **Specialisti**: UI Designer (questo audit); Accessibility nella revisione di F55-05. **Data**: 2026-11-28.

## Sintesi

Il sito regge bene struttura, contrasti e responsive, ma il nome nuovo non si legge: con Inter «AIgentrica» appare «Algentrica» (F55-UI-01, P1). La home apre ancora con la mappa del cielo e mette il nome al posto del messaggio (F55-UI-02, P1), contro due decisioni dell'utente.

## Rilievi

| Id | Titolo | Priorità |
|---|---|---|
| F55-UI-01 | «AIgentrica» si legge «Algentrica» | P1 |
| F55-UI-02 | La home apre con la mappa del cielo e il nome come h1 | P1 |
| F55-UI-03 | Su mobile le etichette della mappa si sovrappongono | P2 |
| F55-UI-04 | Il titolo del capitolo della simulazione compete con il titolo | P2 |
| F55-UI-05 | Il simbolo è la costellazione di F28 | P2 |
| F55-UI-06 | Il badge di mcprush nel footer mostra il vecchio nome (F56) | P2 |

Dettagli ed evidenze in `design-ui-designer.json` e `evidenze/`.

## Pagine coperte

Home (it, en), `/agenti`, `/agenti/aisa-02`, `/installa`, `/impara` a 1440 e 390 px. Non coperte: le altre pagine, fuori dal perimetro confermato.

## Home, sezione per sezione (richiesta dell'utente, 2026-11-28)

Evidenza: `evidenze/prima-home-intera-d.png` (1440 px, inglese) e `prima-home-it-d.png`.

| Sezione | Cosa c'è | Rilievo | Proposta |
|---|---|---|---|
| Hero | Testo a sinistra (eyebrow, nome come h1, tagline, lead, comando, due pulsanti), mappa a destra, capitoli della simulazione con titolo evidenziato, barra di avanzamento e pausa | Quattro blocchi in competizione nel primo schermo; il titolo del capitolo è grande quanto la tagline (F55-UI-04); la numerazione «01 / 06» dei capitoli si scontra con «01 / Come si usa» della sezione dopo (F55-UX-01, P3) | Decisione dell'utente: costellazione al centro, «AIGENTRICA» grande in basso al centro, a metà del viewport; da decidere dove vanno messaggio, comando e pulsanti e cosa resta dei capitoli |
| 01 Come si usa | Lead, rimando a Impara, quattro passi con i comandi, terminale con la demo | Il comando d'installazione compare due volte (hero e passo 1) (F55-UX-02, P3); il rimando a Impara spezza lead e passi | Se l'hero non ha il comando, questa diventa la sezione d'ingresso; rimando a Impara dopo i passi |
| 02 Reparti | Cinque schede con glifo, sigla, direttore | Coerente con i glifi che restano; nessun rilievo bloccante | Invariata, solo componenti e spaziature nuove |
| 03 Come lavoriamo | Tre principi, simulazione del flusso fra reparti, link a /orchestrazione | È la sezione che dimostra il messaggio «Le decisioni restano tue», ma arriva terza; i principi ripetono i capitoli dell'hero (F55-UX-03, P2) | Titolo allineato al messaggio; valutare se anticiparla |
| 04 Prima di usarlo | Cosa fa e cosa non fa | Contenuto di fiducia chiaro; nessun rilievo | Invariata |
| Consumo, Progetti | Compaiono solo oltre una soglia o con progetti | Eyebrow senza numero, a differenza di 01–04 (F55-UX-04, P3) | Numerazione coerente o nessuna numerazione |
| Footer | Wordmark, testo, badge di mcprush, tre colonne | Badge con il vecchio nome (F55-UI-06, F56) | Wordmark nuovo |

Rilievi UX della home: F55-UX-01 (doppia numerazione) e F55-UX-02 (comando ripetuto) risolti con il nuovo hero; F55-UX-03 risolto mettendo «Come lavoriamo» per prima; F55-UX-04 (eyebrow senza numero su Consumo e Progetti, P3) resta aperto.

## Esito (2026-11-28)

Rilievi P0 e P1 chiusi con evidenza (`evidenze/dopo-*.png`); restano F55-UI-06 (P2, in F56) e F55-UX-04 (P3). Due rilievi di accessibilità nati dalle richieste in corso d'opera (F55-A11Y-01 contrasto della tagline, F55-A11Y-02 pausa) sono risolti, nel JSON.
