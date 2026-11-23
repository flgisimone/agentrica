# AI Software Agency

Agenti senior per analisi, progettazione, sviluppo, test, sicurezza e manutenzione di un software esistente. È l'unica agenzia che modifica il codice.

## Agenti
1. Software Agency Director / CTO — `01-software-agency-director-cto.md`
2. Senior Software Architect — `02-senior-software-architect.md`
3. Senior Business Analyst / Functional Analyst — `03-senior-business-functional-analyst.md`
4. Senior Backend Developer — `04-senior-backend-developer.md`
5. Senior Frontend Developer — `05-senior-frontend-developer.md`
6. Senior Full Stack Developer — `06-senior-full-stack-developer.md`
7. Senior Database Engineer / DBA — `07-senior-database-engineer-dba.md`
8. Senior QA Engineer / Test Automation — `08-senior-qa-test-automation-engineer.md`
9. Senior Application Security Engineer — `09-senior-application-security-engineer.md`
10. Senior DevOps / Infrastructure Engineer — `10-senior-devops-infrastructure-engineer.md`
11. Senior Performance Engineer — `11-senior-performance-engineer.md`
12. Senior Code Reviewer / Software Quality Architect — `12-senior-code-reviewer-software-quality-architect.md`

## Struttura
- `00-common-rules.md`: regole comuni a tutti i ruoli dell'agenzia.
- `01-…` e seguenti: un file per ruolo, nell'ordine del flusso di lavoro, senza frontmatter.
- Gli agenti si consultano dal server MCP di Agentrica con il tool `agent`, uno alla volta e il direttore per primo. I subagent di `.claude/agents/software/` ci sono solo nei progetti creati con `init --subagents` e caricano il loro agente dallo stesso server.

## Flusso di lavoro
1. Director/CTO analizza la richiesta e coordina il lavoro.
2. Architect e Functional Analyst definiscono soluzione e criteri di accettazione quando necessario.
3. Gli sviluppatori implementano le parti assegnate.
4. QA, Security e Performance eseguono verifiche indipendenti.
5. Code Reviewer esamina il diff.
6. Director/CTO riepiloga esito e attività residue.

## Collaborazione con le altre agenzie
- Web Design: la Software Agency si occupa di fattibilità tecnica e implementazione, la Web Design Agency di UX/UI, design system, accessibilità e contenuti. Le specifiche di design approvate possono diventare requisiti per il team software.
- Business & Product: requisiti, priorità, criteri di accettazione, business case e vincoli.
- Cybersecurity: ciclo di sviluppo sicuro, revisione del codice, threat model, vulnerabilità e correzioni.
- Privacy & Compliance: misure tecniche sui dati personali; le correzioni si implementano previa approvazione umana.

## Uso con Claude Code
Estrai la cartella nel repository o nella directory di progetto. Chiedi a Claude Code di leggere questo README e i file degli agenti prima di assegnare il lavoro. Integra queste istruzioni con le convenzioni e i permessi effettivi del repository.

I file Markdown definiscono ruoli e istruzioni; in Claude Code si caricano con il tool `agent` del server MCP di Agentrica.

## Biblioteca
Le schede della biblioteca del reparto sono in `biblioteca/`, una per nozione, con fonte, versione, data di verifica e data entro cui ricontrollarla; le fonti ammesse, con i loro indirizzi, in `fonti.json`. Formato, livelli delle fonti e ciclo di studio sono descritti in `docs/Biblioteca degli agenti.md` del repository di Agentrica.
