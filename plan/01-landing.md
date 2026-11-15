# F1 — Landing di Agentrica

**Obiettivo**: la pagina iniziale presenta Agentrica e i suoi cinque reparti in modo chiaro e credibile, con dati presi dal catalogo, e invita a esplorare reparti e agenti (le pagine arrivano in F2 e F3).

> **Stato: da fare.**

**Agenzie**: web design (Director, UX Designer, UI Designer, UX Writer, Accessibility Specialist) prima e dopo; software (Frontend Developer, QA, Performance, Code Reviewer).

## Proposte da confermare

- Testi della landing (titolo, sottotitolo, sezioni): proposta del UX Writer prima dell'implementazione.
- Colore d'accento di ogni reparto.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F1-01 | Design system di base: token di colore (fondo scuro, testo, un accento per reparto), tipografia, spaziature, focus visibile; tema scuro come unico tema | P1 |
| F1-02 | Hero: «Agentrica», cos'è (una consulenza fatta di agenti IA), numeri presi dal catalogo (5 reparti, 56 agenti), invito a scoprire i reparti | P1 |
| F1-03 | I cinque reparti: sigla, nome, cosa fa, numero di agenti, direttore con nome in codice; i nomi in codice degli agenti del reparto | P1 |
| F1-04 | Come lavoriamo: attivazione su richiesta, ordine del flusso trasversale (business → design → privacy → software → revisioni), conferma del cliente su ogni decisione | P1 |
| F1-05 | Verso l'MCP: l'obiettivo di usare gli agenti nei propri progetti, dichiarato come futuro e non come funzione disponibile | P2 |
| F1-06 | Footer: trasparenza (agenti IA, società fittizia), link al repository | P2 |
| F1-07 | Responsive da 360 px; HTML semantico; meta title e description; favicon | P1 |
| F1-08 | Playwright e axe: prova di fumo della landing (numeri dal catalogo, cinque reparti) e nessuna violazione serious o critical; `verify:e2e` | P1 |

## Criteri di accettazione

- Ogni numero, nome di reparto e nome in codice della pagina viene dal catalogo, non è scritto a mano.
- Nessuna affermazione inventata: niente clienti, casi di successo, recensioni o persone.
- Contrasto AA su tutti i testi e gli accenti; tutto raggiungibile da tastiera con focus visibile.
- Nessuno scorrimento orizzontale da 360 px in su.
- `npm run verify` e `npm run verify:e2e` passano.
- Revisione di design (Director, UI, UX Writer, Accessibility) senza rilievi P0 o P1 aperti.

## Fatto

## Verifiche

## Rilievi aperti
