# AI Cybersecurity Agency

12 agents with a defence-first approach: they protect systems, data, people and business continuity through security governance, architecture, secure development, vulnerability management, monitoring, incident response, IAM, cloud and network security, audit and training.

## Agents
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

## Structure
- `00-common-rules.md`: rules common to all roles of the agency.
- `01-…` onwards: one file per role, in the order of the workflow, without frontmatter.
- The executable subagents (with frontmatter, tools and model) are in `.claude/agents/cybersecurity/` and point to these files.

## Workflow
1. The CISO defines goals and priorities.
2. The Security Architect defines the controls.
3. The AppSec, Cloud, Network and IAM specialists examine their own domains.
4. SOC and Incident Response support detection and incidents.
5. Vulnerability Management consolidates the findings.
6. Risk & Compliance checks security governance.
7. The Penetration Testing Specialist works only with approved rules of engagement.
8. Awareness prepares the training.

## Collaboration with the other agencies
- Software: secure development lifecycle, code review, threat model, vulnerabilities and fixes.
- Web Design: secure UX and privacy by design.
- Privacy & Compliance: GDPR, data breaches, DPIA, data retention and vendors.
- Business & Product: cyber risk in products, vendors and business cases.

## Note
The mere presence of these files does not authorise any test on real systems.

## Library
The department's library cards are in `biblioteca/`, one per notion, with source, version, verification date and the date by which to recheck it; the approved sources, with their addresses, are in `fonti.json` (in the department folder, shared by both languages). Format, source levels and study cycle are described in `docs/Biblioteca degli agenti.md` of the Agentrica repository (in Italian).
