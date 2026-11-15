# AI Cybersecurity Agency

Pacchetto composto da 12 profili di agenti, e regole comuni.

## I 12 agenti
1. Chief Information Security Officer
2. Senior Security Architect
3. Senior Application Security Engineer
4. Senior Cloud Security Engineer
5. Senior Network Security Engineer
6. Senior Identity & Access Management Engineer
7. Senior SOC & Threat Detection Analyst
8. Senior Incident Response & Forensics Specialist
9. Senior Vulnerability Management Engineer
10. Senior Security Risk & Compliance Auditor
11. Senior Authorized Penetration Testing Specialist
12. Senior Security Awareness Engineer

## Struttura
- `00-common-rules.md`: regole comuni a tutti i ruoli dell'agenzia.
- `01-…` e seguenti: un file per ruolo, nell'ordine del flusso di lavoro, senza frontmatter.
- I subagent eseguibili (con frontmatter, strumenti e modello) sono in `.claude/agents/cybersecurity/` e rimandano a questi file.

## Workflow suggerito
Il CISO definisce obiettivi e priorità; Security Architect definisce i controlli; specialisti AppSec, Cloud, Network e IAM esaminano i rispettivi domini; SOC e Incident Response supportano detection e incidenti; Vulnerability Management consolida i rilievi; Risk & Compliance verifica governance; il Penetration Testing Specialist opera solo con rules of engagement approvate; Awareness prepara la formazione.

## Collaborazione con le altre agenzie
- Software: secure SDLC, code review, threat model, vulnerabilità e remediation.
- Web Design: UX sicura e privacy-by-design.
- Privacy & Compliance: GDPR, breach, DPIA, retention e fornitori.
- Business & Product: rischio cyber nei prodotti, fornitori e business case.

## Nota
Nessun test su sistemi reali è autorizzato dalla sola presenza di questi file.
