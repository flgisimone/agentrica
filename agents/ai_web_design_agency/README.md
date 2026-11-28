# AI Web Design Agency

Agenti senior per audit e consulenza su UX, UI, architettura informativa, design system, accessibilità e contenuti del prodotto esistente. Non scrivono né modificano codice.

## Agenti
1. Agency Director / Chief UX & Design Officer
2. Senior UX Researcher
3. Senior UX Designer
4. Senior Information Architect
5. Senior UI Designer
6. Senior Design System Specialist
7. Senior Dashboard & Data Visualization Designer
8. Senior Accessibility Specialist
9. Senior Usability Auditor
10. Senior UX Writer

## Struttura
- `00-common-rules.md`: regole comuni a tutti i ruoli dell'agenzia.
- `01-…` e seguenti: un file per ruolo, nell'ordine del flusso di lavoro, senza frontmatter.
- Gli agenti si consultano dal server MCP di AIgentrica con il tool `agent`, uno alla volta e il direttore per primo. I subagent di `.claude/agents/web-design/` ci sono solo nei progetti creati con `init --subagents` e caricano il loro agente dallo stesso server.

## Flusso di lavoro
1. Il Director definisce perimetro, pagine e flussi da analizzare e attiva gli specialisti pertinenti.
2. UX Researcher chiarisce utenti, compiti e contesto.
3. UX Designer, Information Architect e UI Designer esaminano flussi, struttura e interfaccia.
4. Design System, Dashboard & Data Visualization e UX Writer verificano componenti, dati e testi.
5. Accessibility e Usability Auditor verificano accessibilità e usabilità.
6. Il Director unifica i rilievi, assegna le priorità e consolida resoconti e backlog.

## Collaborazione con le altre agenzie
- Software: le specifiche di design approvate diventano requisiti; fattibilità tecnica e implementazione restano alla Software Agency.
- Business & Product: target, bisogni, percorso del cliente e sintesi UX.
- Cybersecurity: UX sicura e protezione dei dati fin dalla progettazione.
- Privacy & Compliance: informative, consensi e testi sui dati personali.

## Uso
Inserisci i file nel progetto e chiedi a Claude Code di leggerli come definizioni/istruzioni degli agenti. Il Director coordina e consolida i risultati degli specialisti.

## Perimetro
Questi agenti svolgono audit UX/UI, accessibilità, architettura informativa, design system e contenuti. **Non sono una software house**: non includono Backend Developer o Frontend Developer e non devono modificare il codice del prodotto.

Le convenzioni comuni per sicurezza, evidenze, priorità e formato dei resoconti sono in `00-common-rules.md`.

## Biblioteca
Le schede della biblioteca del reparto sono in `biblioteca/`, una per nozione, con fonte, versione, data di verifica e data entro cui ricontrollarla; le fonti ammesse, con i loro indirizzi, in `fonti.json`. Formato, livelli delle fonti e ciclo di studio sono descritti in `BIBLIOTECA.md` del repository di AIgentrica.
