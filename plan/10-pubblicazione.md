# F10 — Pubblicazione

**Obiettivo**: mettere online il sito e pubblicare il server MCP su npm, così gli agenti di Agentrica si usano nei progetti di chiunque con un comando, nel rispetto dei vincoli decisi con la revisione di sicurezza di F5.

> **Stato: da fare.** I vincoli sono confermati dall'utente (`plan/README.md`, «Vincoli per la pubblicazione»); le «Proposte da confermare» si decidono all'apertura. Deploy, pubblicazione npm e merge in `main` solo con l'approvazione esplicita dell'utente.

**Agenzie**: cybersecurity (Cloud Security, Vulnerability Management, Security Architect) per hosting, CI di release e catena di fornitura; privacy (Vendor Compliance, Legal Specialist) per hosting e testi del sito pubblico; software (DevOps, Backend, QA, Code Reviewer); business (Product Marketing) per README e pagina npm.

## Situazione di partenza

- Da F8: il repository è privato, quindi «Disponibile da un clone» vale solo per chi ha accesso. Qui il repository diventa pubblico o i passi della sezione MCP passano al pacchetto npm (P1).

- Sito Next.js in `apps/site`; su Vercel la build con Root Directory `apps/site` funziona (fix/vercel-build), ma il sito non è ancora pubblicato come rilascio.
- `packages/mcp` si usa solo da un clone, con TypeScript eseguito da Node 26 e `@agentrica/catalog` a versione `*`.
- CI (`.github/workflows/ci.yml`) con `verify` e `verify:e2e` al push; nessuna CI di release.

## Vincoli già decisi (revisione di sicurezza di F5)

- Organizzazione npm `@agentrica` registrata prima di pubblicare.
- Catalogo incluso nel pacchetto o a versione esatta, mai `*`.
- JavaScript compilato; `files` con solo `dist`, `agents/` e README; `engines`.
- Trusted publishing e provenance; `npm audit --omit=dev` e `npm audit signatures` nella CI di release.
- Controllo del contenuto di `agents/` in CI (URL, blocchi di comandi, commenti HTML, Unicode invisibile, dimensione) e branch protection su `agents/`.
- Scelta fra range transitivi, shrinkwrap o bundle delle dipendenze.
- Un MCP remoto o qualsiasi telemetria richiedono prima una revisione privacy: non fanno parte di questa fase.

## Proposte da confermare all'apertura

- **Hosting del sito**: Vercel (già collegato) con dominio da scegliere; header di sicurezza (CSP, HSTS) nella configurazione di Next.
- **Pacchetto**: nome `@agentrica/mcp`, eseguibile con `npx @agentrica/mcp`; catalogo incluso nel bundle (un pacchetto solo, nessuna versione `*`).
- **Versioni**: `0.1.0` iniziale, changelog nel README; rilascio da tag `v*` su `main`.
- **Pagine legali del sito**: con un sito pubblico e senza cookie né analytics serve almeno una nota su hosting e log del fornitore; da verificare con privacy.
- **Sezione MCP del sito** (da F8): i passi da un clone diventano il comando npm.

## Backlog

| # | Task | Priorità |
|---|---|---|
| F10-01 | Build del server in JavaScript, catalogo incluso, `files` ed `engines`; prova con `npm pack` e installazione da tarball in un progetto vuoto | P1 |
| F10-02 | Controllo del contenuto di `agents/` in CI e proposta di branch protection (l'utente la attiva su GitHub) | P1 |
| F10-03 | CI di release: trusted publishing con provenance, `npm audit --omit=dev`, `npm audit signatures`, da tag su `main` | P1 |
| F10-04 | Revisione cybersecurity della catena di rilascio e dell'hosting; revisione privacy di hosting e testi | P1 |
| F10-05 | Sito: header di sicurezza, dominio, nota su hosting e log; sezione MCP con il comando npm | P2 |
| F10-06 | README (italiano e inglese) e pagina npm con installazione da npm | P2 |
| F10-07 | Rilascio: merge in `main` (CONVENTIONS §13.8), deploy del sito e pubblicazione npm, **ciascuno con l'approvazione esplicita dell'utente** | P1 |

## Criteri di accettazione

- `npx @agentrica/mcp` in un progetto vuoto avvia il server e il client vede i 56 prompt e i due tool.
- Il pacchetto pubblicato ha provenance e contiene solo `dist`, `agents/` e README.
- La CI blocca un file di `agents/` con contenuto non ammesso.
- Il sito pubblico supera gli stessi e2e e axe della CI e ha gli header di sicurezza decisi.
- Nessuna telemetria e nessun trasporto remoto.
