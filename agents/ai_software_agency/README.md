# AI Software Agency — Agenti

Pacchetto con 12 ruoli senior per analisi, progettazione, sviluppo, test, sicurezza e manutenzione di un software esistente.

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
- I subagent eseguibili (con frontmatter, strumenti e modello) sono in `.claude/agents/software/` e rimandano a questi file.

## Uso con Claude Code
Estrai la cartella nel repository o nella directory di progetto. Chiedi a Claude Code di leggere questo README e i file degli agenti prima di assegnare il lavoro. Integra queste istruzioni con le convenzioni e i permessi effettivi del repository.

I file Markdown definiscono ruoli e comportamenti: non creano da soli subagent eseguibili. L'attivazione dei ruoli dipende dalla configurazione e dalle funzionalità di Claude Code.

## Flusso suggerito
1. Director/CTO analizza la richiesta e coordina il lavoro.
2. Architect e Functional Analyst definiscono soluzione e criteri di accettazione quando necessario.
3. Gli sviluppatori implementano le parti assegnate.
4. QA, Security e Performance eseguono verifiche indipendenti.
5. Code Reviewer esamina il diff.
6. Director/CTO riepiloga esito e attività residue.

## Rapporto con la Web Design Agency
La Software Agency si occupa di fattibilità tecnica e implementazione. La Web Design Agency si occupa di UX/UI, design system, accessibilità e contenuti. Le specifiche di design approvate possono diventare requisiti per il team software.
