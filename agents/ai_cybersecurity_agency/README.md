# AI Cybersecurity Agency

12 agenti con approccio prima di tutto difensivo: proteggono sistemi, dati, persone e continuità operativa con governo della sicurezza, architettura, sviluppo sicuro, gestione delle vulnerabilità, monitoraggio, risposta agli incidenti, IAM, sicurezza cloud e di rete, audit e formazione.

## Agenti
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

## Flusso di lavoro
1. Il CISO definisce obiettivi e priorità.
2. Security Architect definisce i controlli.
3. Gli specialisti AppSec, Cloud, Network e IAM esaminano i rispettivi domini.
4. SOC e Incident Response supportano rilevamento e incidenti.
5. Vulnerability Management consolida i rilievi.
6. Risk & Compliance verifica il governo della sicurezza.
7. Il Penetration Testing Specialist opera solo con regole di ingaggio approvate.
8. Awareness prepara la formazione.

## Collaborazione con le altre agenzie
- Software: ciclo di sviluppo sicuro, revisione del codice, threat model, vulnerabilità e correzioni.
- Web Design: UX sicura e privacy-by-design.
- Privacy & Compliance: GDPR, data breach, DPIA, conservazione dei dati e fornitori.
- Business & Product: rischio cyber nei prodotti, fornitori e business case.

## Nota
Nessun test su sistemi reali è autorizzato dalla sola presenza di questi file.

## Biblioteca
Le schede della biblioteca del reparto sono in `biblioteca/`, una per nozione, con fonte, versione, data di verifica e data entro cui ricontrollarla; le fonti ammesse, con i loro indirizzi, in `fonti.json`. Formato, livelli delle fonti e ciclo di studio sono descritti in `docs/Biblioteca degli agenti.md` del repository di Agentrica.
