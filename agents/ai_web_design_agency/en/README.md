# AI Web Design Agency

10 senior agents for audits and advice on UX, UI, information architecture, design system, accessibility and content of the existing product. They do not write or change code.

## Agents
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

## Structure
- `00-common-rules.md`: rules common to all roles of the agency.
- `01-…` onwards: one file per role, in the order of the workflow, without frontmatter.
- The agents are consulted through the Agentrica MCP server with the `agent` tool, one at a time and the director first. The subagents in `.claude/agents/web-design/` exist only in projects created with `init --subagents` and load their agent from the same server.

## Workflow
1. The Director defines the scope, the pages and the flows to analyse and brings in the relevant specialists.
2. The UX Researcher clarifies users, tasks and context.
3. The UX Designer, the Information Architect and the UI Designer examine flows, structure and interface.
4. Design System, Dashboard & Data Visualization and UX Writer check components, data and copy.
5. Accessibility and the Usability Auditor check accessibility and usability.
6. The Director merges the findings, assigns priorities and consolidates reports and backlog.

## Collaboration with the other agencies
- Software: approved design specifications become requirements; technical feasibility and implementation remain with the Software Agency.
- Business & Product: target, needs, customer journey and UX brief.
- Cybersecurity: secure UX and data protection by design.
- Privacy & Compliance: privacy notices, consents and copy about personal data.

## Use
Add the files to the project and ask Claude Code to read them as definitions and instructions for the agents. The Director coordinates and consolidates the specialists' results.

## Scope
These agents carry out audits of UX/UI, accessibility, information architecture, design system and content. **They are not a software house**: they include no Backend Developer or Frontend Developer and must not change the product's code.

The common conventions for security, evidence, priorities and report format are in `00-common-rules.md`.

## Library
The department's library cards are in `biblioteca/`, one per notion, with source, version, verification date and the date by which to recheck it; the approved sources, with their addresses, are in `fonti.json` (in the department folder, shared by both languages). Format, source levels and study cycle are described in `docs/Biblioteca degli agenti.md` of the Agentrica repository (in Italian).
