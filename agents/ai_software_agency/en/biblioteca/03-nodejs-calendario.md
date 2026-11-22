# Node.js: supported versions and new release schedule

Source: nodejs · Version: v22, v24, v26 LTS; v27 alpha · Verified on: 2026-11-19 · Recheck by: 2027-02-19 · Roles: AISA-02, AISA-04, AISA-06, AISA-10, AISA-11

## Notion
As of 19 November 2026 the Node.js versions in LTS are 26 (Lithium), 24 (Krypton) and 22 (Jod); 20 and 25 are end of life; 27 has been in alpha since 29 October 2026. LTS versions receive critical fixes for about thirty months in total.

The schedule changes with 27: up to 26, odd versions went out of support after six months and even ones became LTS; from 27, one major version comes out per year, with six months of alpha and six of Current, and each one becomes LTS.

## How it applies
- For production recommend an LTS version; for a new project the most recent LTS supported by the dependencies.
- Flag engines, .nvmrc or CI images still on 20 or on an odd version at end of life (25).
- Do not apply the rule «odd versions are not LTS» to 27 and later: it holds only up to 26.
- The end-of-support dates of individual versions must be read on the source when needed: they change with the schedule.
