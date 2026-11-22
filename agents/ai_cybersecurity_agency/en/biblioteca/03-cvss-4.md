# CVSS v4.0

Source: first-cvss · Version: 4.0 · Verified on: 2026-11-19 · Recheck by: 2027-05-19 · Roles: AICA-03, AICA-07, AICA-08, AICA-09, AICA-11

## Notion
The current version of the Common Vulnerability Scoring System is 4.0, published by FIRST in November 2023. It has four metric groups: Base, Threat (today only Exploit Maturity), Environmental and Supplemental; the Supplemental metrics (among them Safety, Automatable, Recovery, Provider Urgency) give context and do not change the score.

The name of the score says which groups were used: CVSS-B (Base only), CVSS-BT (Base and Threat), CVSS-BE (Base and Environmental), CVSS-BTE (all three). Compared with 3.1, Scope goes away: impact is split between the vulnerable system (VC, VI, VA) and subsequent systems (SC, SI, SA); Attack Requirements (AT) is added; User Interaction has three values (None, Passive, Active).

## How it applies
- When you report a 4.0 score also write the nomenclature (e.g. «CVSS-B 8.7»): a Base-only score does not account for exploitation and context.
- Do not compare 3.1 and 4.0 scores directly and do not convert them by hand: state the version of each score.
- For priority combine the score with exploitation data (e.g. KEV or EPSS) and with the project context; technical severity remains distinct from priority.
