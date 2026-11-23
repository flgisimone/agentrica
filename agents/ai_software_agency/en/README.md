# AI Software Agency

Senior agents for analysis, design, development, testing, security and maintenance of existing software. It is the only agency that changes the code.

## Agents
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

## Structure
- `00-common-rules.md`: rules common to all roles of the agency.
- `01-…` onwards: one file per role, in the order of the workflow, without frontmatter.
- The agents are consulted through the Agentrica MCP server with the `agent` tool, one at a time and the director first. The subagents in `.claude/agents/software/` exist only in projects created with `init --subagents` and load their agent from the same server.

## Workflow
1. The Director/CTO analyses the request and coordinates the work.
2. The Architect and the Functional Analyst define the solution and the acceptance criteria when needed.
3. The developers implement the parts assigned to them.
4. QA, Security and Performance run independent checks.
5. The Code Reviewer examines the diff.
6. The Director/CTO summarises the outcome and the remaining tasks.

## Collaboration with the other agencies
- Web Design: the Software Agency handles technical feasibility and implementation, the Web Design Agency handles UX/UI, design system, accessibility and content. Approved design specifications can become requirements for the software team.
- Business & Product: requirements, priorities, acceptance criteria, business case and constraints.
- Cybersecurity: secure development lifecycle, code review, threat model, vulnerabilities and fixes.
- Privacy & Compliance: technical measures on personal data; fixes are implemented after human approval.

## Use with Claude Code
Extract the folder into the repository or the project directory. Ask Claude Code to read this README and the agent files before assigning the work. Combine these instructions with the actual conventions and permissions of the repository.

The Markdown files define roles and instructions; in Claude Code they are loaded with the `agent` tool of the Agentrica MCP server.

## Library
The department's library cards are in `biblioteca/`, one per notion, with source, version, verification date and the date by which to recheck it; the approved sources, with their addresses, are in `fonti.json` (in the department folder, shared by both languages). Format, source levels and study cycle are described in `docs/Biblioteca degli agenti.md` of the Agentrica repository (in Italian).
