# Revisione della pubblicazione (F10)

Data: 2026-11-15. Perimetro: pacchetto `@agentrica/mcp`, CI di release, controllo del contenuto di `agents/`, header del sito, note legali e hosting.

Ruoli, nella sessione principale: AICA-02 Security Architect, AICA-05 Cloud Security, AICA-09 Vulnerability Management; AIPCA-03 Legal Specialist, AIPCA-07 Vendor Compliance. Nessun test attivo.

**Esito: nessun P0. Un P1 corretto in fase (SEC-REL-01), un P1 da attivare sui servizi esterni (SEC-REL-02).**

| Rilievo | Priorità | Stato |
|---|---|---|
| SEC-REL-01 token OIDC esposto agli script di installazione | P1 | risolto: job separati, `npm ci --ignore-scripts` nella pubblicazione |
| SEC-REL-02 trusted publisher, ambiente `npm`, ruleset | P1 | risolto dall'utente |
| PRIV-PUB-01 DPA e log di Vercel | P2 | da fare (utente) |
| SEC-REL-03 `'unsafe-inline'` negli script | P3 | accettato |
| SEC-REL-04 transitivi a range | P3 | accettato |
| SEC-REL-05 action di `ci.yml` per tag | P3 | aperto |
| PRIV-PUB-02 contatto con issue pubbliche | P3 | accettato |
| PRIV-PUB-03 niente cookie, analytics, terzi | P3 | verificato dagli e2e |

Dettagli in `sec-release.json` e `privacy-sito.json`.
