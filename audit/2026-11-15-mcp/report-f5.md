# Revisione di sicurezza e privacy del server MCP (F5)

Data: 2026-11-15. Perimetro: `packages/mcp` (server su stdio locale, SDK `@modelcontextprotocol/sdk` 1.32.2 e `zod` 4.6.7) e le regole comuni di `agents/` che il server invia al modello.

Specialisti: AICA-02 sec-security-architect, AICA-09 sec-vulnerability-management, AIPCA-02 privacy-gdpr-specialist. Hanno letto il codice senza eseguire test attivi. I direttori non sono stati coinvolti: si trattava di una revisione mirata, non di un audit completo.

**Esito: nessun rilievo P0 o P1.**

## Controlli eseguiti dopo la revisione

- `npm audit --omit=dev`: 0 vulnerabilità.
- `npm audit signatures`: 598 pacchetti con firma del registry verificata, 159 con attestazione.
- Moduli caricati all'avvio del server, con un hook di `node:module`: `@modelcontextprotocol/sdk` (con i suoi `ajv` e `ajv-formats`), `zod`, `zod-to-json-schema`, `fast-deep-equal`, `fast-uri`. Express, Hono, cors e jose sono installati ma non vengono caricati.
- Installazione ridotta su una copia del repository, con `npm ci --omit=dev --ignore-scripts -w @agentrica/mcp`: 88 pacchetti e 26 MB, senza Next, React, Playwright ed ESLint. Il server risponde con 56 prompt.

## Decisioni dell'utente sui rilievi

| Rilievi | Decisione |
|---|---|
| PRIV-MCP-03 (P2), SEC-ARCH-07, SEC-ARCH-02 (P2), SEC09-F5-04 | **Corretti in F5.** Il README dice dove vanno i dati, ha le promesse rese esatte e indica l'installazione ridotta. |
| SEC-ARCH-03, SEC-ARCH-04, SEC-ARCH-05 | **Corretti in F5.** `agents/` si legge da un percorso fisso. Senza catalogo il server esce con una riga su stderr e codice 1. L'id deve avere il formato SIGLA-NN e il messaggio d'errore non ripete l'input. |
| SEC-ARCH-01 (P2), SEC09-F5-05 (P2), SEC09-F5-06 (P2), SEC09-F5-07, SEC-ARCH-08, PRIV-MCP-02 | **Vincoli per F6**, nella tabella «Decisioni» di `plan/README.md`. |
| PRIV-MCP-04 (P2), PRIV-MCP-05 (P2), PRIV-MCP-06 | **Non accolti in F5.** Riguardano i file di `agents/`, cioè il prodotto, e restano rilievi aperti in `plan/05-mcp.md`. |
| SEC-ARCH-06 (permission model di Node), PRIV-MCP-01 (test su stderr e file), SEC09-F5-01–03 | **Rilievi aperti P3** o già verificati. Non richiedono azioni in F5. |
