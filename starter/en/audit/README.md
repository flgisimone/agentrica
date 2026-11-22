# Audit

An audit is a folder `audit/<audit_id>/`, where `audit_id` is the date (`YYYY-MM-DD`) with a suffix if there is more than one on the same day (`YYYY-MM-DD-privacy`).

| File | Content |
|---|---|
| `<role>.json` | an agent's findings, in the JSON format of its role file in `agents/` |
| `report-<agency>.md` | consolidated report of the agency director: priorities, proposed backlog, decisions for the user |
| `evidence/` | screenshots, axe reports, accessibility trees, logs used as evidence |

Rules:

- Every finding has evidence, a reasoned P0–P3 priority and a recommendation; a finding is a proposal until the user confirms it.
- Decisions taken on the audit go in the «Decisions» table of `plan/README.md`; accepted findings become tasks of a phase.
- Evidence is captured on fake data. If it shows personal data, enable the `audit/*/evidence/` line in `.gitignore`.
