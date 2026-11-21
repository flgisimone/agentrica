# F15 — Rilievi aperti

**Obiettivo**: chiudere i rilievi aperti da F5 a F14 che si possono chiudere, con un'evidenza per ciascuno, così che il pannello mostri solo ciò che resta davvero da fare o è stato accettato.

> **Stato: completata** (2026-11-15, dopo F14). 0.3.1 rilasciata su npm; le esecuzioni di F15-03 e la verifica di F15-09 restano all'utente (vedi «Rilievi aperti»). Fase chiesta dall'utente il 2026-11-15, prima dell'area personale (diventata F16, poi eliminata il 2026-11-16).

**Agenzie**: software (QA, Backend, Frontend, Security, Performance, Code Reviewer); cybersecurity (Security Architect, Vulnerability Management) per gli audit di F5; privacy (GDPR Specialist) per i rilievi PRIV; design (UI Designer, Accessibility) per i controlli del sito; business (Product Manager) per la scala di gravità.

## Situazione di partenza

Il pannello di F14 mostra 42 rilievi: 10 P2, 31 P3 e uno senza priorità (elenco del 2026-11-15). Molti degli audit di F5 sono già risolti in F6 o F10, o sono controlli superati, ma i loro JSON non hanno uno `stato`. Un rilievo è chiuso quando il testo o lo `stato` dice «risolto» o «chiuso» (README del pacchetto, «Formato»).

## Decisioni dell'utente all'apertura (2026-11-15)

- **Numero**: questa fase è F15; l'area personale passa a F16 (poi eliminata il 2026-11-16).
- **Rischi accettati**: restano aperti e visibili nel pannello, come promemoria. Sono fuori dal perimetro: PRIV-PUB-01 (DPA di Vercel su Hobby, voce di F10 e audit), SEC-REL-03 e SEC-REL-04 (`'unsafe-inline'`, transitivi a range), PRIV-PUB-02 (contatto con issue pubbliche), note legali non riviste da un legale.

## Backlog

Confermato dall'utente il 2026-11-15.

| # | Task | Priorità |
|---|---|---|
| F15-01 | Audit di F5: controllare nel codice e chiudere con evidenza (`stato` «Risolto in Fx: …») i rilievi risolti in F6 o F10 (PRIV-MCP-03, 04, 05, 06; SEC-ARCH-02, 03, 04, 06, 07; SEC09-F5-05, 06, 07) e chiudere con `stato` «Chiuso: controllo superato» quelli senza azione (PRIV-MCP-01, 02; SEC-ARCH-08; SEC09-F5-01, 02, 03; PRIV-PUB-03). Ciò che non regge resta aperto e diventa un task | P2 |
| F15-02 | SEC-ARCH-01 (i file di `agents/` come istruzioni): controllare le difese di F10 (controllo del contenuto in CI, protezione del branch, provenance); chiudere con evidenza o aggiungere ciò che manca | P2 |
| F15-03 | Prove degli agenti (F13): un caso con difetti sottili su un progetto più realistico e una seconda esecuzione di un caso esistente; l'esecuzione la fa l'utente | P2 |
| F15-04 | SEC-ARCH-05: stringere la validazione degli input dei tool (lunghezze, caratteri) con test | P3 |
| F15-05 | SEC09-F5-04, minimatch, deepmerge: ricontrollare gli advisory e aggiornare se c'è una correzione; altrimenti restano aperti come rischio accettato | P3 |
| F15-06 | Sito: 768 px a vista, costo per fotogramma dello sfondo con il profiler, diagramma sopra la simulazione sul telefono, cerchio di cornice del glifo, caso limite di `spanInRows`, timeout sul primo `goto` degli e2e | P3 |
| F15-07 | Squadre (F12): `director` di un reparto filtrato fuori squadra, con test | P3 |
| F15-08 | Scala di gravità comune fra i reparti (F13): proposta del Product Manager, decisione dell'utente, poi regola nei `00-common-rules.md` (modifica al prodotto) | P3 |
| F15-09 | Pannello (F14): «Agenti in uso» guardato a vista in una sessione vera | P3 |
| F15-10 | Rilascio 0.3.1 con le correzioni del pannello già in `develop` e quelle di questa fase, con l'approvazione dell'utente | P3 |

## Criteri di accettazione

- Ogni rilievo dell'elenco del 2026-11-15 è chiuso con un'evidenza (commit, file, test o verifica scritta), oppure resta aperto con il motivo: rischio accettato o decisione dell'utente.
- I JSON di `audit/` cambiano solo nel campo `stato`; il resto del rilievo resta com'era.
- Le modifiche ad `agents/` passano dalla conferma dell'utente.
- `npm run verify` e `npm run verify:e2e` verdi; Code Reviewer sul diff.

## Decisioni dell'utente durante la fase (2026-11-15)

- **Scala di gravità**: riga comune nei cinque `00-common-rules.md` («P0 critica, P1 alta, P2 media, P3 bassa», solo la sigla nei rilievi), scala propria in Software, in Design «un criterio WCAG di livello A non soddisfatto che impedisce un compito è almeno P1». Testo confermato.
- **Diagramma sul telefono**: resta così.
- **Cerchio di cornice del glifo**: chiuso come decorativo; in più i glifi si animano: disegno all'ingresso nello schermo e stelle che brillano, fermi con «riduci movimento».
- **Prova nuova**: AISA-09 su un'API multiutente con difetti sottili.

## Fatto

- **F15-01** Rilievi di F5 controllati nel codice: 12 con `stato` «Risolto in F5/F6/F10: …» e 7 con «Chiuso: controllo superato …», più PRIV-PUB-03; ogni stato cita file, commit o test. Nessuno da riaprire.
- **F15-02** SEC-ARCH-01 chiuso con evidenza: controllo del contenuto di `agents/` (`packages/catalog/src/content.ts`) in `npm run verify`, controllo `verify` obbligatorio nel ruleset di `main`, tag `v*` protetti, CODEOWNERS, provenance, installazione a versione esatta. La revisione obbligatoria del code owner non è attiva: con un solo collaboratore bloccherebbe le sue PR (da attivare con un secondo manutentore).
- **F15-03** Caso nuovo [aisa-09-api-fatture](../examples/casi/aisa-09-api-fatture.md) su `examples/progetti/api-fatture` (quattro file, nove difetti sottili, quattro trappole per i falsi positivi), difetti provati dal vivo con curl. Istruzioni su `@agentrica/mcp@0.3.1`, così le prove usano la scala nuova. Da eseguire dall'utente dopo il rilascio, insieme alla seconda esecuzione di `aisa-09-api-note`.
- **F15-04** SEC-ARCH-05: id del tool `agente` limitato alle cinque sigle del catalogo più due cifre; test su id malformati senza eco dell'input e sul limite di 20.000 caratteri del compito.
- **F15-05** SDK 1.32.2 e zod 4.6.7 senza advisory aperti (GHSA ricontrollate); deepmerge senza versione corretta, minimatch corretto solo in 11.0.1 che typescript-eslint e ts-morph non accettano: SEC09-F5-04 resta aperto come rischio accettato.
- **F15-06** 768 px guardati (nessuno scorrimento orizzontale); sfondo a 60 fps con circa 0,5 ms di script per fotogramma; `spanInRows` senza scheda sola nell'ultima riga, con test; timeout del primo `goto` non riprodotto; diagramma e cerchio chiusi per decisione. Glifi animati (`star-glyph.tsx`, `globals.css`), con e2e su animazione e «riduci movimento».
- **F15-07** I reparti della squadra non hanno `director` (`SquadDepartment` in `prompt.ts`), con test.
- **F15-08** Scala di gravità scritta in `agents/` nel testo confermato.
- **F15-10** Rilascio 0.3.1 (CONVENTIONS §13.8): PR #8 `develop` → `main`, tag `v0.3.1` su `1b00028`, pubblicazione dalla CI con provenance dopo l'approvazione dell'ambiente `npm`. Un primo tag `v0.3.1` era stato creato per errore sul `main` precedente, prima dell'unione della PR: la Release si è fermata al controllo della versione senza pubblicare, il tag è stato cancellato e ricreato. Pubblicazione nel registro MCP con `mcp-publisher publish` a cura dell'utente: `io.github.flgisimone/agentrica` 0.3.1 è `active` e `isLatest` in `registry.modelcontextprotocol.io` (pubblicata il 2026-11-15 alle 22:00 UTC, controllato il 2026-11-16).
- Il titolo «## Backlog» del file di fase non aveva il formato che il pannello legge (lo segnalava il test sul piano del repository): corretto.
- Rilievi delle fasi passate aggiornati con «Risolto» o «Chiuso» e il motivo: il pannello passa da 42 a 13 rilievi, tutti rischi accettati o in attesa dell'utente.

## Verifiche

- `npm run verify`: superato (59 test unitari). `npm run verify:e2e`: 61 superati, 1 saltato.
- Animazione dei glifi provata nell'app (build di produzione): linea a metà a 0,5 s, disegno completo a 1,3 s, poi brillio sfalsato; con «riduci movimento» nessuna animazione e simbolo completo.
- **Non verificato**: F15-09 («Agenti in uso» in una sessione vera) e le esecuzioni di F15-03, che fa l'utente.

## Rilievi aperti

- P2: prove degli agenti F15-03 da eseguire dopo il rilascio 0.3.1 (caso nuovo e seconda esecuzione di `aisa-09-api-note`). Chiuso in F30: superato dalle misure di F24 (7 casi, 4 configurazioni, 56 esecuzioni); casi più difficili e altri ruoli sono nella voce di F24 sulle misure, rinviata a una fase dedicata (scelta dell'utente, 2026-11-22).
- P3: F15-09, «Agenti in uso» da guardare in una sessione vera. Chiuso in F30 (F30-13, P3, 2026-11-22): pannello di `agentrica-dev` guardato in una sessione vera di Claude Code (estensione per VS Code); Sessione con AISA-02 · ALTAIR in «Agenti in uso», attivo, e il suo modulo di valutazione; Rilievi con il conteggio aggiornato (10).
- P3: il brillio dei glifi è continuo e non ha un pulsante di pausa (WCAG 2.2.2), come lo sfondo; si ferma con «riduci movimento». Chiuso in F30 (scelta dell'utente, 2026-11-22): glifi e stelle della mappa brillano una volta e finiscono entro 5 secondi (`globals.css` del sito), eccezione di WCAG 2.2.2.
