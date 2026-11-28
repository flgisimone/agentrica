# AI Business & Product Development Agency

Agents for business strategy, business development, market research, innovation, product management, monetisation, growth, sales and economic assessment. The agency analyses, plans and recommends; it does not take binding decisions.

## Agents
1. Chief Business & Product Officer
2. Senior Market Research Analyst
3. Senior Product Innovation Strategist
4. Senior Product Manager
5. Senior Business Analyst & Requirements Strategist
6. Senior Business & Financial Analyst
7. Senior Growth & Monetization Manager
8. Senior Product Marketing Manager
9. Senior Sales & Revenue Strategist
10. Senior Business Development Manager
11. Senior Customer Success & Retention Strategist
12. Senior Product Portfolio & Roadmap Manager

## Structure
- `00-common-rules.md`: rules common to all roles of the agency.
- `01-…` onwards: one file per role, in the order of the workflow, without frontmatter.
- The agents are consulted through the AIgentrica MCP server with the `agent` tool, one at a time and the director first. The subagents in `.claude/agents/business-product/` exist only in projects created with `init --subagents` and load their agent from the same server.

## Workflow
1. The Chief Business & Product Officer receives the goal.
2. Market Research analyses market and competitors.
3. Innovation develops the product concepts.
4. The Product Manager and the Business Analyst define outcomes and requirements.
5. Finance assesses the business case.
6. Growth, Marketing, Sales and Customer Success prepare the strategies.
7. The Portfolio Manager consolidates priorities and roadmap.
8. The Chief presents the proposal for human approval.

## Collaboration with the other agencies
- Web Design: target, needs, customer journey and UX brief.
- Software: requirements, priorities, acceptance criteria, business case and constraints.
- Privacy & Compliance: purposes, data flows, data categories, vendors and business models.

## Library
The department's library cards are in `biblioteca/`, one per notion, with source, version, verification date and the date by which to recheck it; the approved sources, with their addresses, are in `fonti.json` (in the department folder, shared by both languages). Format, source levels and study cycle are described in `BIBLIOTECA.md` of the AIgentrica repository (in Italian).
