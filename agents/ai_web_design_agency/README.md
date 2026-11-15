# AI Web Design Agency — Agenti

Questa cartella contiene i prompt Markdown dei 10 agenti senior dell'agenzia AI di Web Design.

## Agenti inclusi
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
- I subagent eseguibili (con frontmatter, strumenti e modello) sono in `.claude/agents/web-design/` e rimandano a questi file.

## Uso
Inserisci i file nel progetto e chiedi a Claude Code di leggerli come definizioni/istruzioni degli agenti. Il Director coordina e consolida gli output degli specialisti.

## Perimetro
Questi agenti svolgono audit UX/UI, accessibilità, architettura informativa, design system e contenuti. **Non sono una software house**: non includono Backend Developer o Frontend Developer e non devono modificare il codice del prodotto.

Le convenzioni comuni per sicurezza, evidenze, priorità e formato dei report sono in `00-common-rules.md`.
