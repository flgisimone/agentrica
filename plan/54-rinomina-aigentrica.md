# F54 — Rinomina in AIgentrica e dominio aigentrica.it

**Obiettivo**: il prodotto si chiama AIgentrica ovunque sia vivo (pacchetto, comando, server MCP, repository, sito, testi) e il sito risponde su `aigentrica.it`, sempre su Vercel, senza rompere chi usa già il vecchio nome: il vecchio pacchetto rimanda al nuovo, la configurazione si migra da sola e il vecchio indirizzo reindirizza.

> **Stato: da fare.** Registrata il 2026-11-28 con le decisioni dell'utente qui sotto. Le «Proposte da confermare» si decidono all'apertura.

**Agenzie**: software (DevOps per pacchetto, CI, Vercel e dominio; Backend per server, configurazione e migrazione; Frontend nel sito; QA, Code Reviewer); privacy (note legali e indirizzo del titolare sul nuovo dominio); cybersecurity (dominio, DNS, HTTPS, header e redirect). La parte visiva del sito è in F55.

## Situazione di partenza

- Pacchetto `@agentrica/mcp` 0.22.0 su npm, comando `agentrica-mcp`, `mcpName` `io.github.flgisimone/agentrica` nel registro MCP; il sito importa `@agentrica/mcp/catalog` e `@agentrica/mcp/learn` a versione esatta.
- Configurazione degli utenti in `~/.agentrica/config.json`; variabili d'ambiente `AGENTRICA_*`; topic GitHub `agentrica` per la vetrina dei progetti (F26).
- Repository `flgisimone/agentrica` e `flgisimone/agentrica-site` (cartelle locali `agentrica` e `agentrica-site`); sito su `agentrica.vercel.app`.
- Circa 1.400 occorrenze del nome nel repository principale (molte nello storico) e una cinquantina nel sito.
- `@aigentrica/mcp` e `aigentrica` sono liberi su npm (verificato il 2026-11-28).

## Decisioni dell'utente

| Tema | Decisione | Data |
|---|---|---|
| Nome | Marchio visibile **AIgentrica**; nome tecnico minuscolo `aigentrica` (pacchetto, comando, cartelle, URL) | 2026-11-28 |
| Dominio | `aigentrica.it` su Vercel; `agentrica.vercel.app` reindirizza in modo permanente (301) | 2026-11-28 |
| Fasi | Due fasi: F54 rinomina tecnica e dominio (rilascio 1.0.0: il pacchetto nuovo parte da 1.0.0, il sito alla stessa versione), F55 rebranding dell'interfaccia con la stessa palette | 2026-11-28 |
| Vecchio nome | Passaggio guidato: `@agentrica/mcp` deprecato con un messaggio verso `@aigentrica/mcp`; `agentrica-mcp` resta come alias per una versione; `~/.agentrica` letto e copiato in `~/.aigentrica`; redirect 301 del sito | 2026-11-28 |
| Storico | Si rinominano solo i testi vivi; fasi completate, voci passate dei CHANGELOG, audit ed esempi datati restano com'erano, con una riga nel piano che segna il cambio di nome | 2026-11-28 |

## Proposte da confermare

- Scope npm: creare l'organizzazione `aigentrica` su npm (azione dell'utente) e pubblicare `@aigentrica/mcp`; nome nel registro MCP `io.github.flgisimone/aigentrica`.
- Variabili d'ambiente: `AIGENTRICA_*`, con `AGENTRICA_*` ancora lette per una versione.
- Vetrina progetti: topic `aigentrica`, con `agentrica` ancora accettato.
- Ordine dei passi esterni, tutti con l'ok dell'utente: org npm → rinomina dei repository su GitHub (i vecchi URL reindirizzano) → dominio su Vercel e DNS dal registrar → rilascio 1.0.0 → deprecazione del vecchio pacchetto.
- Cartelle locali rinominate in `aigentrica` e `aigentrica-site` dopo il rilascio, con `tokensave init` sulla nuova cartella (la memoria di Claude Code è legata al percorso e va spostata).

## Backlog

| # | Task | Priorità |
|---|---|---|
| F54-01 | Elenco delle occorrenze vive divise per tipo (codice, configurazione, testi, URL), con lo storico escluso e motivato; nessuna modifica ai nomi in codice e alle sigle di `departments.ts` | P1 |
| F54-02 | Pacchetto: `name` `@aigentrica/mcp`, `bin` `aigentrica-mcp` più l'alias `agentrica-mcp`, `mcpName`, `repository`, `homepage`; import e export `@aigentrica/mcp/catalog` e `/learn` | P0 |
| F54-03 | Server: nome del server MCP, prompt e testi (`aigentrica`/AIgentrica), comando `init` e configurazioni scritte nei progetti degli utenti | P0 |
| F54-04 | Configurazione: `~/.aigentrica/config.json`, con lettura e copia una tantum da `~/.agentrica` se il nuovo non esiste; variabili `AIGENTRICA_*` con fallback; test della migrazione | P0 |
| F54-05 | Testi vivi: README (it, en), AGENTS, CONVENTIONS, file di ruolo, `learn/`, `starter/`, `.claude/agents/`, CHANGELOG (voce 1.0.0, prima versione di `@aigentrica/mcp`); riga «cambio di nome» nelle Decisioni del piano | P1 |
| F54-06 | Sito: dipendenza `@aigentrica/mcp` a versione esatta, nome e URL nei metadati, sitemap, link canonici, Open Graph, note legali e testi; topic della vetrina | P0 |
| F54-07 | Vercel: dominio `aigentrica.it` (e `www` che reindirizza), DNS dal registrar, HTTPS; redirect 301 da `agentrica.vercel.app`; prova con `curl -I` | P0 |
| F54-08 | Repository: rinomina su GitHub di `agentrica` e `agentrica-site`, remote locali, CI, Dependabot, link nei testi | P1 |
| F54-09 | Rilascio 1.0.0 di pacchetto e sito insieme (prima versione di `@aigentrica/mcp`; `@agentrica/mcp` si ferma a 0.22.0); `npm deprecate @agentrica/mcp` con il messaggio verso il nuovo nome; voce nel registro MCP | P0 |
| F54-10 | Privacy e sicurezza: note legali sul nuovo dominio; header di sicurezza e redirect controllati sul dominio nuovo | P1 |

## Criteri di accettazione

- `npx @aigentrica/mcp` avvia il server; `agentrica-mcp` funziona ancora e avvisa del nuovo nome.
- Un utente con solo `~/.agentrica/config.json` ritrova la configurazione in `~/.aigentrica/` al primo avvio, senza perdere dati (test).
- `https://aigentrica.it` serve il sito con HTTPS; `agentrica.vercel.app/<qualsiasi percorso>` risponde 301 verso lo stesso percorso su `aigentrica.it`.
- `npm view @agentrica/mcp` mostra la deprecazione con il rimando a `@aigentrica/mcp`.
- Nessuna occorrenza di «agentrica» nei testi vivi fuori dagli alias e dalle migrazioni dichiarate; lo storico è invariato.
- `npm run verify` e `npm run verify:e2e` passano in entrambi i repository.
