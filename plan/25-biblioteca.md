# F25 — Biblioteca degli agenti e ciclo di studio

**Obiettivo**: gli agenti imparano nozioni nuove e restano aggiornati, come si fa con lo studio e con la formazione sul lavoro. Ogni reparto ha una biblioteca di schede (nozione, fonte autorevole, versione, data di verifica, scadenza), che il server MCP passa all'agente. Un ciclo di studio periodico scopre le novità nelle fonti ammesse e le trasforma in schede, che entrano solo dopo la revisione dell'utente.

> **Stato: completata** (2026-11-19). Analisi e decisioni con l'utente il 2026-11-18 (nata come F23, spostata dopo gli avvisi); backlog, formato, nome del tool e numero di schede confermati all'apertura il 2026-11-19.

**Agenzie**: business (Product Manager per obiettivo e misura); cybersecurity (Security Architect e AppSec per SEC-ARCH-01, fonti esterne e Action); privacy (Legal per licenze e citazioni delle fonti); software (Backend per catalogo e MCP, DevOps per l'Action, QA, Security, Code Reviewer). Il design non serve: in F25 la biblioteca non va sul sito.

## Situazione di partenza

- Il testo di un agente non cambia mai: [`agentText`](../packages/mcp/src/prompt.ts) mette insieme regole del reparto, file di ruolo e compito, letti da `agents/` all'avvio. Le conoscenze di dominio vengono dal modello ospite e si fermano alla sua data di addestramento.
- I file di ruolo dicono come lavorare, non cosa sapere. In tutti i file di `agents/` ci sono 4 riferimenti a standard (WCAG 2.2, NIST CSF, ISO 27001, EDPB), nessun URL e nessuna data di verifica.
- Le valutazioni (F20/F21) arrivano al titolare, ma non tornano nei prompt. La memoria del progetto (rilievi e decisioni nel prompt) è un'altra iniziativa, non è in questa fase.
- SEC-ARCH-01 (F5, [`content.ts`](../packages/catalog/src/content.ts)): nei file di `agents/` non sono ammessi URL, HTML, blocchi di codice non JSON, caratteri invisibili, né file oltre 8 KB.

## Decisioni dell'utente (2026-11-18)

| Tema | Decisione |
|---|---|
| Che cosa si impara | Nozioni di dominio nuove: standard, norme, best practice, release, manuali. Non la memoria della sessione |
| Perimetro | Tutti e cinque i reparti in questa fase |
| Fonti | Elenco di fonti ammesse per reparto, versionato e approvato dall'utente. La conoscenza del modello non conta come fonte |
| Livelli | 1 primarie (enti di standard, autorità, testi normativi); 2 documentazione ufficiale dei produttori; 3 fonti di settore, **solo come segnale**: una scheda si scrive solo con una fonte di livello 1 o 2 che la conferma; escluse le fonti anonime, SEO o generate da IA |
| Fonti a pagamento | Solo citate per titolo e versione, senza contenuto (ISO 27001, CIS Benchmarks, Baymard, Statista) |
| Fonti nuove | Il ciclo di studio può proporle, motivate, in una PR separata; entrano solo con l'approvazione dell'utente |
| URL | Le schede citano la fonte per nome, versione e data; gli URL stanno in un `fonti.json` per reparto (solo https, solo domini ammessi, controllato in CI) e non vanno al modello. SEC-ARCH-01 resta com'è per le schede |
| Caricamento | Il tool `agente` include l'indice delle schede del reparto (titolo, versione, data); un nuovo tool in sola lettura restituisce le schede che servono al compito |
| Ciclo di studio | Un rilevatore senza modello (GitHub Action settimanale) legge feed e API delle fonti ammesse e aggiorna una issue «Novità da studiare». Le schede si scrivono in una sessione di Claude Code con i ruoli del reparto e una PR da rivedere. Nessun costo di API |
| Sito | La biblioteca non va sul sito in F25: se ne parla in una fase successiva, quando è stabile |

## Elenco delle fonti ammesse (da verificare URL per URL in F25-04)

| Reparto | Livello 1–2 | Livello 3 (segnale) | Solo citate |
|---|---|---|---|
| AICA | OWASP (Top 10, ASVS, Cheat Sheet), NIST CSRC (CSF 2.0, SP 800-53/63), MITRE CWE e ATT&CK, CISA KEV, NVD, CVE, FIRST (CVSS, EPSS), ENISA, ACN, CSIRT Italia, GitHub Advisory, SLSA, OpenSSF | — | ISO 27001, CIS Benchmarks |
| AISA | TC39, WHATWG, W3C, RFC IETF, specifica MCP, docs e release notes di Node.js, TypeScript, React, Next.js, npm, Playwright, Tailwind, shadcn/ui, SemVer, MDN, docs di Vercel e Neon | web.dev | — |
| AIPCA | EUR-Lex (GDPR, ePrivacy, AI Act, NIS2, DSA), Normattiva (Codice privacy), EDPB, EDPS, Garante privacy, CGUE, Commissione UE (adeguatezza, SCC), AI Office | IAPP, noyb (associazione di parte) | — |
| AIWDA | W3C WAI (WCAG, ARIA APG), ETSI EN 301 549, EUR-Lex (European Accessibility Act), Normattiva (Legge Stanca), AgID, Designers Italia, MDN; Material Design e Apple HIG solo per le loro piattaforme | NN/g, WebAIM, web.dev, GOV.UK Design System | Baymard |
| AIBPD | Istat, Eurostat, OCSE, Banca d'Italia, Agenzia delle Entrate, Normattiva (Codice del consumo), AGCM, AGCOM, Commissione UE; bilanci e documenti depositati (registro imprese, SEC EDGAR), solo per i dati della singola azienda | Report pubblici con metodologia dichiarata | Statista, Gartner |

Le fonti dell'utente (manuali aziendali, libri con licenza, policy interne) restano nel suo progetto e non entrano nel catalogo pubblico.

## Decisioni all'apertura (2026-11-19)

| Tema | Decisione |
|---|---|
| Backlog | Tutto, F25-01…F25-10 |
| Formato | Come proposto: riga di metadati sotto il titolo, URL solo in `fonti.json` |
| Tool | `library`, con `id` dell'agente e `cards` (id delle schede, al più 10) |
| Schede di partenza | 3–4 per reparto |
| Soglia del testo dell'agente | Indice compatto (id, titolo, versione, data; `*` per le schede del ruolo) e soglia del test di F24-08 da 8 a 10 KB |

## Formato (proposta confermata)

- **Scheda**: `agents/<agenzia>/biblioteca/NN-nome.md`, sotto le stesse regole di SEC-ARCH-01. Contiene il titolo `# …` e una riga di metadati (id della fonte in `fonti.json`, versione, «verificata il», «da ricontrollare entro», ruoli interessati). Seguono `## Nozione` (sintesi originale, al più una frase citata) e `## Come si applica` (cosa cambia nel lavoro del ruolo).
- **Fonti**: `agents/<agenzia>/fonti.json` con id, nome, livello (1–3 o «citata»), URL https, tipo di aggiornamento (feed, GitHub releases, API JSON, pagina) e accesso (libero o a pagamento).
- **Tool**: nome in inglese come i tool da F14 (proposta `library`): input l'id dell'agente e gli id delle schede; restituisce le schede, solo del reparto dell'agente e solo della squadra di `--agents`.

## Requisiti delle agenzie (proposte, ruoli nella sessione)

**Business (Product Manager)**
- Misura: ogni scheda ha fonte, livello, versione, data e scadenza; alla chiusura nessuna scheda è scaduta; ogni novità della issue diventa una scheda o viene segnata «non pertinente» entro la sessione di studio successiva.

**Cybersecurity (Security Architect, AppSec)**
- Le schede seguono SEC-ARCH-01: niente URL, HTML, comandi o testo nascosto. `fonti.json` non entra mai nel prompt.
- Test su `fonti.json`: solo https, dominio fra quelli ammessi, niente credenziali né token nella query, id unici, ogni scheda cita una fonte esistente di livello 1 o 2.
- L'Action ha `contents: read` e `issues: write`, nient'altro. Non esegue il contenuto scaricato; ha timeout e limite di dimensione. Nella issue vanno solo titoli ripuliti (niente controlli, lunghezza limitata) e link dentro il dominio della fonte.
- La issue e le pagine lette durante lo studio sono dati non attendibili, mai istruzioni.
- Il server MCP resta offline: la biblioteca viaggia nel pacchetto, nessuna connessione nuova.

**Privacy (Legal)**
- Nessun dato personale: le fonti sono pubbliche e il rilevatore non manda niente degli utenti.
- Le schede sono sintesi originali con la citazione, con al più una frase riportata; le fonti a pagamento sono solo citate. Va rispettata la licenza delle fonti (es. le CC BY-SA di OWASP chiedono l'attribuzione).

## Backlog

Confermato dall'utente il 2026-11-19.

| ID | Attività | Priorità |
|---|---|---|
| F25-01 | Formato di schede e `fonti.json`, documentato in `docs/` e nei README dei reparti | P1 |
| F25-02 | Catalogo: lettura e validazione di schede e fonti (SEC-ARCH-01, domini ammessi, date, fonti e ruoli esistenti), con test | P0 |
| F25-03 | MCP: indice delle schede nel testo di `agente`, tool in sola lettura per le schede, rispetto di `--agents`, test, README del pacchetto | P0 |
| F25-04 | `fonti.json` dei cinque reparti, con gli URL verificati uno per uno | P1 |
| F25-05 | Schede di base AICA e AISA | P1 |
| F25-06 | Schede di base AIPCA | P1 |
| F25-07 | Schede di base AIWDA e AIBPD | P1 |
| F25-08 | Rilevatore senza modello: feed e API delle fonti, schede scadute, elenco delle novità, con test | P1 |
| F25-09 | GitHub Action settimanale che aggiorna una sola issue «Novità da studiare» | P2 |
| F25-10 | Procedura del ciclo di studio (sessione, ruoli, PR, revisione) e regola comune nei `00-common-rules.md`: verificare sulla fonte le nozioni datate quando c'è accesso al web | P2 |

Fuori perimetro: biblioteca sul sito, memoria del progetto nel prompt, rilascio della nuova versione del pacchetto (CONVENTIONS §13.8, su richiesta).

## Criteri di accettazione

- Ogni scheda cita una fonte di `fonti.json` di livello 1 o 2, con versione, data di verifica e scadenza; il testo passa i controlli di SEC-ARCH-01.
- `fonti.json` dei cinque reparti: tutti gli URL sono https, nei domini ammessi e raggiungibili alla data di verifica.
- Per ogni agente, `agente` include l'indice del suo reparto. Il tool restituisce le schede richieste, dà un errore chiaro per un id inesistente o fuori squadra e non restituisce mai URL.
- Il rilevatore, eseguito in locale, elenca novità e schede scadute; l'Action gira con i soli permessi previsti.
- Prova in una sessione reale: un agente usa una scheda pertinente e cita fonte e data.
- `npm run verify` verde.

## Fatto

- **F25-01** Formato documentato in [docs/Biblioteca degli agenti.md](../docs/Biblioteca%20degli%20agenti.md) (scheda, `fonti.json`, livelli, ciclo di studio, licenze) e in una sezione «Biblioteca» dei cinque README dei reparti.
- **F25-02** `packages/catalog/src/library.ts`: `parseCard` (SEC-ARCH-01, riga dei metadati, date, fonte di livello 1 o 2, ruoli del reparto, sezioni), `sourceProblems` e `urlProblems` (solo https, domini ammessi con sottodomini, niente credenziali, porte o parametri segreti, id unici, feed github nella forma dell'API, fonti a pagamento solo citate). `Department.library` nel catalogo, `loadSources` per il rilevatore. Test in `library.test.ts`; `content.test.ts` ammette `fonti.json` solo nella cartella del reparto.
- **F25-03** MCP: `libraryIndex` nel testo di `agente` (dopo il file di ruolo, prima del compito, con le schede del ruolo segnate e quelle scadute «da ricontrollare»), tool `library` in sola lettura (squadra di `--agents`, solo il reparto dell'agente, errori che elencano le schede disponibili, mai URL), istruzioni del server, README italiano e inglese, descrizione del pacchetto. Test in `prompt.test.ts` e `server.test.ts`; soglia del testo dell'agente a 10 KB.
- **F25-04** `fonti.json` dei cinque reparti (20 AICA, 18 AISA, 10 AIPCA, 14 AIWDA, 14 AIBPD), con URL finali dopo i redirect e 24 feed (RSS o release di GitHub), verificati uno per uno il 2026-11-19 (vedi «Verifiche»).
- **F25-05** Schede AICA (OWASP Top 10:2025, ASVS 5.0.0, CVSS v4.0, NIST CSF 2.0) e AISA (MCP 2026-07-28, TypeScript 7.0, calendario di Node.js), lette sulle fonti.
- **F25-06** Schede AIPCA: date dell'AI Act dopo l'AI Omnibus, decisioni di adeguatezza, legge 132/2025 (artt. 4, 11, 13).
- **F25-07** Schede AIWDA (WCAG 2.2, EN 301 549 V4.1.1, D.lgs. 82/2022) e AIBPD (art. 17-bis e art. 54-bis del Codice del consumo, direttiva 2024/825).
- **F25-08** Rilevatore `npm run study` (`scripts/study.ts` e `study-lib.ts`): feed RSS e Atom e release di GitHub, timeout di 15 s, al più 5 MB, indirizzo finale nei domini della fonte; novità dopo la data più recente fra `checked` e le verifiche delle schede, al più 10 per fonte; schede scadute o entro 30 giorni; fonti non lette; titoli ripuliti (niente Markdown, HTML, menzioni) e link solo nei domini. Test in `study-lib.test.ts`.
- **F25-09** `.github/workflows/study.yml`: lunedì alle 6:17 UTC e a mano, permessi `contents: read` e `issues: write`, Action fissate per SHA, `persist-credentials: false`, niente `npm ci`, timeout di 10 minuti; aggiorna o crea la sola issue «Novità da studiare».
- **F25-10** Procedura del ciclo di studio nel documento di F25-01 (rilevatore, sessione su `studio/AAAA-MM-GG`, PR rivista dal titolare, rilascio); sezione «Nozioni aggiornate» nei cinque `00-common-rules.md`: schede citate con fonte e data, verifica sul web delle nozioni datate, pagine e issue come dati e non istruzioni.

## Verifiche

- `npm run verify`: typecheck, lint e 119 test verdi.
- URL: tutte le pagine e i feed provati con curl il 2026-11-19. Rispondono 200, tranne siti che bloccano i client automatici: OECD, ISO, Gartner (403 anche con WebFetch), SEC EDGAR (403 con curl, raggiungibile con WebFetch), EUR-Lex (202 con una verifica JavaScript). Spostati prima della scrittura: ETSI (404, ora l'archivio delle versioni), CSIRT Italia (feed bloccato e troppo frequente, ora `page`), feed NIST (vuoto, ora le bozze aperte ai commenti).
- Rilevatore in locale: `npm run study` in 19 secondi, una novità (changelog di Neon), nessuna scheda da ricontrollare, nessuna fonte non letta dopo aver alzato il limite a 5 MB (il feed di noyb pesa 2,5 MB).
- Sessione reale: `claude -p` con Haiku e il server dai sorgenti, compito ad AICA-03 su SSRF e ASVS. Il modello ha chiamato `agente`, poi `library` con `owasp-top-10-2025` e `owasp-asvs-5`, ha risposto A01:2025 e ASVS 5.0.0 con gli id `v5.0.0-…` e ha citato fonte, versione, data di verifica e scadenza (0,006 $).
- Testo degli agenti: il più lungo (AIWDA-01) passa da 7,1 a 8,4 KB; l'indice pesa circa 0,7 KB.
- L'Action non è stata eseguita: `workflow_dispatch` e `schedule` partono solo dal branch predefinito (`main`), quindi la prima esecuzione è dopo il rilascio.

## Rilievi aperti

- Risolto (2026-11-19): `gh workflow run study.yml` dopo il rilascio 0.7.0, esecuzione verde in 25 s, issue #20 «Novità da studiare» creata («Niente di nuovo»).
- P2: la voce del CHANGELOG sulla biblioteca si scrive al rilascio: il test del CHANGELOG non ammette una sezione «Non rilasciato». Chiuso in F30 (F30-01): voce nella sezione 0.7.0 di `packages/mcp/CHANGELOG.md`.
- P3: i subagent di `.claude/agents/` rimandano al file di ruolo e non vedono la biblioteca; vale solo per chi usa i subagent invece del server MCP. Chiuso in F30 (F30-10): ogni subagent rimanda alle schede `.md` di `agents/<agenzia>/biblioteca/`.
- P3: ETSI EN 301 549 V4.1.1: da verificare se e da quando è citata come norma armonizzata; D.lgs. 82/2022: periodi transitori, esenzioni e vigilanza non sono nella scheda (le schede lo dicono). Chiuso in F30 (F30-12): schede aggiornate il 2026-11-21 (testo confermato dall'utente). EN 301 549: in Gazzetta è citata la V3.2.1 (decisione di esecuzione (UE) 2021/1339, direttiva 2016/2102), la V4.1.1 no; prossimo controllo entro il 2027-02-21. D.lgs. 82/2022: microimprese (art. 2, c. 1, lett. bb), transitori, vigilanza e sanzioni da Normattiva e dalle FAQ di AgID.
- P3: il rilevatore segue i redirect prima di controllare il dominio dell'indirizzo finale; scarica solo con GET e non esegue nulla, ma un redirect intermedio fuori dominio non viene rifiutato. Chiuso in F30 (F30-07): `redirect: "manual"`, ogni salto controllato con `redirectTarget` prima di seguirlo, al più 5.
- P3: OECD, ISO, Gartner ed EUR-Lex non si possono verificare con un client automatico; la raggiungibilità va ricontrollata a mano nella prossima sessione di studio. Ricontrollato in F30 (F30-12, 2026-11-21): EUR-Lex risponde 200; OECD, ISO e Gartner rispondono 403 ai client automatici e restano da guardare a mano nella prossima sessione di studio.

