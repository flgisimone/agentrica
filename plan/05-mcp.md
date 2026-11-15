# F5 — Server MCP

**Obiettivo**: un server MCP (`packages/mcp`) con cui uno sviluppatore usa gli agenti di Agentrica nel proprio progetto reale, da Claude Code o da un altro client MCP. Il server legge lo stesso catalogo del sito. È il primo passo verso l'acquisizione di clienti e sviluppatori: chi lo installa deve poterlo usare subito e potersi fidare.

> **Stato: completata** (`57bee23`, merge `a9739ed` in `develop`, CI verde). Decisioni confermate dall'utente il 2026-11-15.

**Agenzie**: software (Backend Developer, QA, Code Reviewer); cybersecurity (Security Architect, Vulnerability Management) e privacy (GDPR Specialist) per una revisione mirata a fine sviluppo, come subagent. Il design non entra: la fase non cambia il sito.

## Situazione di partenza

- `loadCatalog()` restituisce reparti e agenti con introduzione e sezioni del file di ruolo; `00-common-rules.md` è in `Department.rules`.
- I file di ruolo e le regole comuni sono generici («leggi `CLAUDE.md`, README, convenzioni…»): valgono anche nei progetti dei clienti. Solo i README dei reparti citano `.claude/agents/`, e il server non li usa.
- `findAgentsDir()` trova `agents/` risalendo dalla cartella corrente: va bene da un clone, non per un pacchetto pubblicato (F6).
- Node 26 esegue TypeScript direttamente: il server parte senza una build.

## Decisioni (2026-11-15)

- **Cosa espone**: un **prompt** per agente (nome `aisa-02`, titolo «AISA-02 · ALTAIR — ruolo», argomento facoltativo `compito`) e due **tool** per i client che non mostrano i prompt: `elenca_agenti` (filtro per reparto facoltativo) e `agente` (istruzioni di un agente dato l'id). Il testo è sempre: chi è l'agente, le regole comuni del reparto, il file di ruolo e, se c'è, il compito. Niente risorse.
- **Trasporto**: solo stdio locale. Il client avvia il processo; nessuna rete, nessun accesso da gestire. Un MCP remoto, se servirà, dopo F6.
- **Protocollo**: SDK ufficiale `@modelcontextprotocol/sdk` 1.32.2 e `zod`, versioni esatte.
- **Fiducia**: il server legge solo `agents/`, non scrive file, non apre connessioni e non raccoglie dati. Lo dice il README del pacchetto.
- **Revisione**: tre specialisti (sec-security-architect, sec-vulnerability-management, privacy-gdpr-specialist), rilievi in `audit/2026-11-15-mcp/`; P0 e P1 si chiudono nella fase.
- **Sito**: nessuna pagina nuova. La pagina «Usa gli agenti» con il comando `npx` arriva in F6, con il pacchetto pubblicato.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F5-01 | `packages/mcp`: `package.json` (SDK e zod), `tsconfig`, script nella root (typecheck e test) | P1 |
| F5-02 | Testo dell'agente: funzione pura in `src/prompt.ts` (intestazione, regole comuni, file di ruolo, compito) | P1 |
| F5-03 | `src/server.ts`: 56 prompt, tool `elenca_agenti` e `agente` con input validati, trasporto stdio | P1 |
| F5-04 | Test: testo dell'agente; prova con un client MCP vero su stdio (elenco dei prompt, un prompt con compito, i due tool, id sconosciuto) | P1 |
| F5-05 | README di `packages/mcp`: installazione da un clone (Claude Code e configurazione JSON generica), uso, cosa fa e cosa non fa | P1 |
| F5-06 | Revisione di sicurezza e privacy (tre specialisti) in `audit/2026-11-15-mcp/`; P0 e P1 corretti | P1 |

## Criteri di accettazione

- `npm run verify` e `npm run verify:e2e` passano.
- Un client MCP vero, avviato sul server con stdio, vede 56 prompt e 2 tool e riceve il testo di un agente.
- I testi vengono da `agents/`: nessuno è copiato nel server.
- Un id o un reparto sconosciuto dà un errore chiaro, non un crash.
- La revisione di sicurezza e privacy non lascia rilievi P0 o P1 aperti.
- I nomi in codice restano quelli di F2.

## Fatto

- **F5-01** `packages/mcp` con `@modelcontextprotocol/sdk` 1.32.2 e `zod` 4.6.7 a versione esatta; `typecheck` e `test` della root lo includono.
- **F5-02** `src/prompt.ts`: `findAgent` (id senza distinguere maiuscole), `agentText` (intestazione con nome in codice, ruolo e reparto; regole comuni del reparto; file di ruolo con le sezioni scese a `###`; compito in fondo se c'è).
- **F5-03** `src/server.ts`: 56 prompt (`aisa-02`…, titolo «AISA-02 · ALTAIR — ruolo», argomento `compito` fino a 20.000 caratteri), tool `elenca_agenti` (reparto come enum) e `agente` (id nel formato SIGLA-NN, errore senza eco dell'input), entrambi `readOnlyHint`; `instructions` per il client. `agents/` si legge da un percorso fisso accanto al pacchetto, mai dalla cartella corrente; senza catalogo il server esce con una riga su stderr e codice 1.
- **F5-04** `prompt.test.ts` (ordine e provenienza dei testi per tutti i 56 agenti, compito) e `server.test.ts` (client MCP vero su stdio da una cartella esterna: prompt, tool, errori; server senza `agents/` avviato dalla root del repository: non usa quella della cartella corrente).
- **F5-05** `packages/mcp/README.md`: cosa fa e cosa non fa, dove vanno i dati, installazione ridotta da un clone, Claude Code e configurazione JSON generica, uso di prompt e tool.
- **F5-06** Revisione in `audit/2026-11-15-mcp/` (tre JSON e `report-f5.md`): nessun P0 o P1; corretti README e irrobustimento del server; i vincoli per F6 sono in `plan/README.md` («Decisioni»). Code Reviewer: APPROVE, rilievi applicati.

## Verifiche

- `npm run verify`: superato. `npm run verify:e2e`: 38/38 (il sito non cambia).
- Test del server: 9/9, con un client MCP vero su stdio.
- `npm audit --omit=dev`: 0 vulnerabilità; `npm audit signatures`: 598 firme e 159 attestazioni verificate.
- All'avvio si caricano solo SDK (con ajv), zod, zod-to-json-schema, fast-deep-equal e fast-uri.
- Installazione ridotta (`npm ci --omit=dev --ignore-scripts -w @agentrica/mcp`) su una copia: 88 pacchetti, 26 MB, server funzionante con 56 prompt.
- **Non verificato**: il server dentro una sessione reale di Claude Code o di un altro client (per non toccare la configurazione dell'utente), in particolare il comando `/mcp__agentrica__aisa-02 "…"` con il compito fra virgolette; Windows.

## Rilievi aperti

- PRIV-MCP-04 (P2): le regole comuni di privacy e cybersecurity non limitano `conforme_verificato` al singolo controllo né escludono la certificazione di conformità di un progetto. Richiede una modifica di `agents/`: rimandato per scelta dell'utente.
- PRIV-MCP-05 (P2): le regole comuni del reparto Software non vietano dati personali reali in fixture, seed, log e commit e non citano la privacy by design. Modifica di `agents/`: rimandato.
- PRIV-MCP-06 (P3): manca una regola comune contro l'invio di dati del progetto a servizi esterni, con P0 segnalati subito all'utente. Modifica di `agents/`: rimandato.
- SEC-ARCH-06 (P3): provare il permission model di Node (`--permission --allow-fs-read`) e, se regge, consigliarlo nel README.
- PRIV-MCP-01 (P3): test che fallisce se il server scrive su stderr o su file durante il normale funzionamento.
- Le regole comuni citano «il Chief» e la «Software Agency»: in un progetto altrui sono gli altri agenti di Agentrica, non persone del cliente. P3, da chiarire con i rilievi sopra.
- I file di ruolo sono in italiano: per sviluppatori non italiani serve una decisione di prodotto (business). P3.
- Dalle fasi precedenti: CI che non parte al push (P2); rilievi P3 di F1, F3 e F4.
