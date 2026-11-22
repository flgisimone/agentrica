# AI Privacy & Compliance Agency

10 agents for audits and advice on GDPR, privacy and product compliance.

## Agents
1. Chief Privacy & Compliance Officer
2. Senior GDPR & Data Protection Specialist
3. Senior Privacy Legal Specialist
4. Senior DPIA & Risk Assessment Specialist
5. Senior Privacy Security Engineer
6. Senior Data Governance & Retention Specialist
7. Senior Third-Party & Vendor Compliance Specialist
8. Senior Data Subject Rights Specialist
9. Senior Data Breach & Incident Response Specialist
10. Senior Privacy Compliance Auditor

## Structure
- `00-common-rules.md`: rules common to all roles of the agency.
- `01-…` onwards: one file per role, in the order of the workflow, without frontmatter.
- The executable subagents (with frontmatter, tools and model) are in `.claude/agents/privacy-compliance/` and point to these files.

## Workflow
1. The Chief defines scope and plan.
2. GDPR and Data Governance map processing activities, data and flows.
3. Legal and Vendor examine documents, vendors and transfers.
4. DPIA and Security assess risks and measures.
5. Rights and Breach check operational processes.
6. The Auditor independently checks evidence and conclusions.
7. The Chief consolidates the general GDPR compliance report.

## Collaboration with the other agencies
- Software: technical fixes are the Software Agency's job, after human approval.
- Business & Product: purposes, data flows, data categories, vendors and business models.
- Cybersecurity: data breaches, DPIA, security measures, data retention and vendors.
- Web Design: privacy notices, consents and data protection by design in the interface.

## General GDPR compliance report
It must include scope and audit date, map of processing activities and flows, requirements-evidence-status matrix, findings register and priorities, residual risks, areas that could not be checked, remediation plan, suggested owners, closure criteria and limits of the audit.

## Boundaries and security
The agents carry out audits and make recommendations: they do not implement changes and do not operate on data. Technical fixes are the Software Agency's job after human approval. Do not use real personal data when synthetic data is enough; do not access production without authorisation; do not put secrets in reports.

The agents support but do not replace the data controller, DPO, legal adviser or qualified professionals. They are not a certification or a guarantee of compliance.

The Markdown files define roles and instructions but on their own they do not create executable subagents. For Claude Code or other tools they must be configured in a supported agent format.

The legal references in the files are indicative: always check the text in force, jurisdiction, guidelines and applicability to the specific case.

## Library
The department's library cards are in `biblioteca/`, one per notion, with source, version, verification date and the date by which to recheck it; the approved sources, with their addresses, are in `fonti.json` (in the department folder, shared by both languages). Format, source levels and study cycle are described in `docs/Biblioteca degli agenti.md` of the Agentrica repository (in Italian).
