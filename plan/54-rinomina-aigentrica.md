# F54 — Rinomina in AIgentrica e dominio aigentrica.it

**Obiettivo**: il prodotto si chiama AIgentrica ovunque sia vivo (pacchetto, comando, server MCP, repository, sito, testi) e il sito risponde su `aigentrica.it`, sempre su Vercel, senza rompere chi usa già il vecchio nome: il vecchio pacchetto rimanda al nuovo, la configurazione si migra da sola e il vecchio indirizzo reindirizza.

> **Stato: completata** il 2026-11-28 su `fase/f54-rinomina-aigentrica` (anche in `aigentrica-site`), rilasciata nella 1.0.0 lo stesso giorno (PR #60 e aigentrica-site#33, tag `v1.0.0`). Registrata e aperta il 2026-11-28, con le decisioni dell'utente qui sotto.

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
| Vecchio nome | Passaggio guidato: `@agentrica/mcp` deprecato con un messaggio verso `@aigentrica/mcp`; `~/.agentrica` letto e copiato in `~/.aigentrica`; `add` e `install` tolgono la voce `agentrica` da Claude Code e registrano `aigentrica`; redirect permanente del sito. Niente alias `agentrica-mcp`: con due comandi `npx @aigentrica/mcp` non saprebbe quale avviare, e il vecchio pacchetto globale tiene il suo (decisione rivista con l'utente all'apertura) | 2026-11-28 |
| Storico | Si rinominano solo i testi vivi; fasi completate, voci passate dei CHANGELOG, audit ed esempi datati restano com'erano, con una riga nel piano che segna il cambio di nome | 2026-11-28 |
| Pacchetto | `@aigentrica/mcp` (organizzazione `aigentrica` su npm, creata dall'utente); registro MCP `io.github.flgisimone/aigentrica`; export `/catalog` e `/learn` invariati | 2026-11-28 |
| Compatibilità | Topic `aigentrica`, con `agentrica` ancora accettato per una versione. Variabili `AIGENTRICA_*` senza i vecchi nomi: servono solo ai test, su 127.0.0.1 (decisione rivista con l'utente all'apertura) | 2026-11-28 |
| Repository | Rinominati su GitHub dall'utente all'inizio della fase (`aigentrica`, `aigentrica-site`); remote e link aggiornati subito | 2026-11-28 |
| Locale | Ultimo passo dopo il rilascio: cartelle `aigentrica` e `aigentrica-site`, `tokensave init`, memoria di Claude Code spostata, server MCP locale `aigentrica-dev`; poi sessione nuova nella cartella nuova | 2026-11-28 |
| Ordine dei passi esterni | Organizzazione npm e repository rinominati → lavoro sul codice → dominio su Vercel e DNS → rilascio 1.0.0 → deprecazione di `@agentrica/mcp`, ognuno con l'ok dell'utente | 2026-11-28 |

## Backlog

| # | Task | Priorità |
|---|---|---|
| F54-01 | Elenco delle occorrenze vive divise per tipo (codice, configurazione, testi, URL), con lo storico escluso e motivato; nessuna modifica ai nomi in codice e alle sigle di `departments.ts` | P1 |
| F54-02 | Pacchetto: `name` `@aigentrica/mcp`, `bin` `aigentrica-mcp`, `mcpName`, `repository`, `homepage`; import e export `@aigentrica/mcp/catalog` e `/learn` | P0 |
| F54-03 | Server: nome del server MCP, prompt e testi (`aigentrica`/AIgentrica), comando `init` e configurazioni scritte nei progetti degli utenti | P0 |
| F54-04 | Configurazione: `~/.aigentrica/config.json`, con lettura e copia una tantum da `~/.agentrica` se il nuovo non esiste; variabili `AIGENTRICA_*`; test della migrazione | P0 |
| F54-05 | Testi vivi: README (it, en), AGENTS, CONVENTIONS, file di ruolo, `learn/`, `starter/`, `.claude/agents/`, CHANGELOG (voce 1.0.0, prima versione di `@aigentrica/mcp`); riga «cambio di nome» nelle Decisioni del piano | P1 |
| F54-06 | Sito: dipendenza `@aigentrica/mcp` a versione esatta, nome e URL nei metadati, sitemap, link canonici, Open Graph, note legali e testi; topic della vetrina | P0 |
| F54-07 | Vercel: dominio `aigentrica.it` (e `www` che reindirizza), DNS dal registrar, HTTPS; redirect 308 da `agentrica.vercel.app`; prova con `curl -I` | P0 |
| F54-08 | Repository: rinomina su GitHub di `agentrica` e `agentrica-site`, remote locali, CI, Dependabot, link nei testi | P1 |
| F54-09 | Rilascio 1.0.0 di pacchetto e sito insieme (prima versione di `@aigentrica/mcp`; `@agentrica/mcp` si ferma a 0.22.0); `npm deprecate @agentrica/mcp` con il messaggio verso il nuovo nome; voce nel registro MCP | P0 |
| F54-10 | Privacy e sicurezza: note legali sul nuovo dominio; header di sicurezza e redirect controllati sul dominio nuovo | P1 |

## Criteri di accettazione

- `npx @aigentrica/mcp` avvia il server; `add` su una macchina con la voce `agentrica` la sostituisce con `aigentrica` e lo dice.
- Un utente con solo `~/.agentrica/config.json` ritrova la configurazione in `~/.aigentrica/` al primo avvio, senza perdere dati (test).
- `https://aigentrica.it` serve il sito con HTTPS; `agentrica.vercel.app/<qualsiasi percorso>` risponde 308 verso lo stesso percorso su `aigentrica.it`.
- `npm view @agentrica/mcp` mostra la deprecazione con il rimando a `@aigentrica/mcp`.
- Nessuna occorrenza di «agentrica» nei testi vivi fuori dagli alias e dalle migrazioni dichiarate; lo storico è invariato.
- `npm run verify` e `npm run verify:e2e` passano in entrambi i repository.

## Fatto

- **F54-01** Occorrenze vive: 231 file nel repository principale, 72 nel sito. Escluse e lasciate col vecchio nome: storico (`plan/` delle fasi completate, `audit/`, `examples/`, voci passate dei CHANGELOG), il database Neon `agentrica-ratings`, la scheda mcprush `agentrica-mcp` (badge invariati finché la scheda non cambia), la riga di `.gitignore` del file locale `docs/Agentrica-Roadmap-Consolidata.md`.
- **F54-02** Pacchetto `@aigentrica/mcp`, comando `aigentrica-mcp`, `mcpName` e `server.json` con `io.github.flgisimone/aigentrica`, export `/catalog` e `/learn` invariati.
- **F54-03** Server `aigentrica`, `.mcp.json` e subagent di `init` con `mcp__aigentrica__`. `add` e `install` tolgono la voce `agentrica` nello stesso ambito e segnalano quelle negli altri, senza toccare il `.mcp.json` di un progetto (`setup.test.ts`).
- **F54-04** `migrateLegacyConfig` in `config.ts`, chiamata all'avvio: copia `~/.agentrica/config.json` in `~/.aigentrica` se il nuovo non c'è, con i permessi controllati prima di toccare i file (con il permission model `existsSync` si fermerebbe). Test in `config.test.ts`. `tool-chains` riconosce i server `agentrica` e `aigentrica` nei log.
- **F54-05** Testi vivi rinominati; sezione «Se usavi Agentrica» / «Coming from Agentrica» nei README del pacchetto; intestazione dei CHANGELOG con il nome di prima. Corretta una riga ripetuta che c'era già nei README.
- **F54-06** Sito: metadati, sitemap, robots, link, testi; topic `aigentrica` e `agentrica` in `scripts/projects.ts` e nelle note legali; pagina «Rilasci» con le versioni 0.x collegate a `@agentrica/mcp` su npm; spaziatura dell'header ridotta sotto i 640 px (il nome più lungo dava 3 px di scorrimento orizzontale a 360 px; la revisione dell'header è in F55).
- **F54-08** Repository rinominati su GitHub (`aigentrica`, `aigentrica-site`) il 2026-11-28, remote aggiornati, homepage del repository `https://aigentrica.it`.
- **F54-07** Dominio su Vercel il 2026-11-28: `aigentrica.it` collegato a Production, `www.aigentrica.it` con redirect 308 verso `aigentrica.it`; DNS da Serverplan (`A @ 216.198.79.1`, `CNAME www` verso Vercel, posta invariata); certificato Let's Encrypt. Redirect 308 di `agentrica.vercel.app` attivato dall'utente dopo il deploy: 308 e non 301, perché il server 0.22.0 invia valutazioni, consumi e progetti in POST al vecchio indirizzo.
- **F54-09** Rilascio 1.0.0. `npm trust` vuole un pacchetto che esiste già: l'utente ha pubblicato a mano un segnaposto `@aigentrica/mcp@0.0.0` (npm ha aggiunto anche `0.0.0-stage`), poi `npm trust github … --env npm --allow-publish`. Tag `v1.0.0` su `main`, pubblicazione dalla CI con provenance dopo l'approvazione dell'ambiente `npm`. Sito con la 1.0.0 da npm e in produzione su `aigentrica.it`. Deprecati `@aigentrica/mcp` 0.0.0 e 0.0.0-stage e tutte le versioni di `@agentrica/mcp`. Registro MCP: `io.github.flgisimone/aigentrica` 1.0.0 `active` (pubblicata dall'utente con `mcp-publisher`), le 25 versioni di `io.github.flgisimone/agentrica` `deprecated`.
- **F54-10** Note legali con il nuovo dominio e il vecchio topic; su `aigentrica.it` HSTS, CSP invariata e `http` → `https` con 308.

## Verifiche

- Repository principale: `npm run verify` superato (typecheck, lint, 216 test), anche nella CI della PR #60 su Ubuntu e Windows.
- Sito: `npm run verify` (73 test e build) e `npm run verify:e2e` (165 superati, 3 saltati come prima) con il pacchetto creato in locale e poi con la 1.0.0 da npm; `npm audit --omit=dev` senza vulnerabilità; CI della PR aigentrica-site#33 verde.
- `npx -y @aigentrica/mcp@1.0.0 check` e `init`: funzionano, `.mcp.json` con il server `aigentrica`; `npm view @aigentrica/mcp@1.0.0` con provenance SLSA.
- `https://aigentrica.it`: 200 su home, pagine agente, installazione, rilasci, note legali e Impara in due lingue; link canonici, `robots.txt` e sitemap (480 indirizzi) sul nuovo dominio; API con 405 a un GET (nessun dato inviato).
- `agentrica.vercel.app`: 308 verso lo stesso percorso con i parametri; un POST su `/api/ratings` riceve 308 (non seguito, nessun dato inviato).
- **Non verificato**: il job notturno `/api/ratings/purge` dopo il redirect (vedi rilievi); la migrazione della configurazione e la sostituzione della voce `agentrica` su una macchina reale, oltre ai test.

## Rilievi aperti

- **P2** Job notturno `/api/ratings/purge` dopo il redirect di `agentrica.vercel.app`: controllare in Vercel (Cron Jobs o log) che l'esecuzione del 2026-11-29 alle 3:00 sia riuscita. Se Vercel lo chiama sul vecchio dominio e non segue il 308, valutazioni e progetti scaduti non si cancellano nei tempi delle note legali. Repository `aigentrica-site`. Issue: https://github.com/flgisimone/aigentrica-site/issues/34
- **P3** Nomi su Vercel e Neon (rimandato dall'utente il 2026-11-28): progetto Vercel `agentrica` e risorsa Storage `agentrica-ratings`. Sono etichette: rinominarle non cambia le stringhe di connessione né `agentrica.vercel.app`; il database Postgres interno non si rinomina. `db/README.md` del sito riporta i nomi attuali. Repository `aigentrica-site`. Issue: https://github.com/flgisimone/aigentrica-site/issues/35
- **P3** Scheda mcprush `agentrica-mcp` (rimandato dall'utente il 2026-11-28): il sito rifiuta le richieste automatiche, la scheda va guardata dal browser; badge nei README e nel footer sul vecchio indirizzo finché non si decide. Repository `aigentrica`. Issue: https://github.com/flgisimone/aigentrica/issues/61
- **P3** Compatibilità con il vecchio nome da togliere dopo la 1.x (`ponytail:` nel codice): copia di `~/.agentrica` (`migrateLegacyConfig`), voce `agentrica` in `setup.ts`, topic `agentrica` in `scripts/projects.ts` e nelle note legali. Restano invece i collegamenti delle versioni 0.x a `@agentrica/mcp` nella pagina «Rilasci» e il riconoscimento dei log vecchi in `tool-chains`. Repository `aigentrica` e `aigentrica-site`. Issue: https://github.com/flgisimone/aigentrica/issues/62
