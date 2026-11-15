# F10 — Pubblicazione

**Obiettivo**: mettere online il sito e pubblicare il server MCP su npm, così gli agenti di Agentrica si usano nei progetti di chiunque con un comando, nel rispetto dei vincoli decisi con la revisione di sicurezza di F5.

> **Stato: completata.** Sito online su https://agentrica.vercel.app da `main`; `@agentrica/mcp@0.1.0` pubblicato su npm (a mano, senza provenance); trusted publisher configurato per le versioni successive.

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

## Decisioni all'apertura (2026-11-15)

- Repository **pubblico** al rilascio (serve alla provenance), licenza **MIT**.
- Pacchetto `@agentrica/mcp` 0.1.0 compilato con **tsc**: catalogo dentro `dist`, `agents/` copiata da `prepack`, SDK e zod a versione esatta, transitivi a range; Node ≥ 22.
- Sito su Vercel con dominio **`*.vercel.app`** per ora.
- Pagina **`/note-legali`**: titolare Giulio Simone Floresta, contatto con le issue di GitHub.

## Fatto

- **F10-01** `packages/mcp`: il server importa il catalogo per percorso relativo; `tsconfig.build.json` compila server e catalogo in `dist/` (senza test); `prepack` copia `agents/` e `LICENSE`; `files`, `engines`, `repository`, `bin` su `dist`. `VERSION` in `prompt.ts`, controllata contro `package.json`. Il percorso di `agents/` è lo stesso da un clone e dal pacchetto.
- **F10-02** `packages/catalog/src/content.ts` e `content.test.ts`: ogni file di `agents/` è `.md`, senza URL o link, HTML o commenti HTML, caratteri invisibili, bidi o di controllo, blocchi di codice diversi da `json`, al massimo 8 KB. Gira in `npm test`, quindi in CI. `.github/CODEOWNERS` su `agents/` e `.github/`.
- **F10-03** `.github/workflows/release.yml`: da tag `v*` su `main` e uguale alla versione; job `verify` senza permessi (`npm ci`, `npm audit --omit=dev`, `npm audit signatures`, `npm run verify`); job `publish` con OIDC, ambiente `npm`, `npm ci --ignore-scripts`, `npm publish --provenance`. Action fissate per SHA.
- **F10-04** Revisione nei ruoli cybersecurity e privacy: `audit/2026-11-15-pubblicazione/`. SEC-REL-01 (P1) corretto in fase.
- **F10-05** Sito: CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, niente `X-Powered-By`; pagina `/note-legali` dal footer; sezione MCP con `claude mcp add agentrica -- npx -y @agentrica/mcp@0.1.0` e link al README del pacchetto.
- **F10-06** README del pacchetto (italiano e inglese): installazione da npm, permessi minimi con installazione globale, provenance, da un clone, versioni, licenza; link ad `agents/` assoluti per la pagina npm. `LICENSE` MIT nella root.

## Rilascio (F10-07, 2026-11-15)

- Pull request #1 `develop → main` unita con merge commit dopo `verify` verde; Vercel ha pubblicato `main` su https://agentrica.vercel.app.
- `@agentrica/mcp@0.1.0` pubblicato dall'utente con `npm publish -w @agentrica/mcp --access public` e 2FA; nessun tag `v0.1.0` (CONVENTIONS §13.8, punto 4).
- npm: trusted publisher `flgisimone/agentrica`, `release.yml`, ambiente `npm`, con «Allow npm publish» (scelta dell'utente: un'approvazione, sull'ambiente GitHub; lo staged publishing con seconda approvazione su npm resta possibile in futuro). Publishing access: 2FA obbligatoria, niente token. Configurato dall'utente; non verificabile da CLI.

## Verifiche

- `npm run verify`: superato (40 test unitari).
- `npm run verify:e2e`: 59 superati, 1 saltato (come in F9); nuovo `e2e/pubblicazione.spec.ts` (header su quattro pagine, nessun errore in console né richieste ad altri domini, note legali con axe e nessun cookie).
- `npm pack` e installazione da tarball in un progetto vuoto: con `npx agentrica-mcp` un client MCP vede 56 prompt, i tool `elenca_agenti` e `agente`, versione 0.1.0. Da installazione globale anche con `node --permission --allow-fs-read=<cartella del pacchetto>`. Il tarball ha 75 file: `dist`, `agents`, README, LICENSE, package.json.
- `npm publish -w @agentrica/mcp --dry-run` dopo `npm ci --ignore-scripts`: riuscito.
- `npm audit --omit=dev`: 0 vulnerabilità; `npm audit signatures`: 598 firme verificate.
- Prova visiva con `next start` di `/note-legali` e della sezione MCP.
- Dopo il rilascio: gli stessi e2e (configurazione temporanea con `baseURL` https://agentrica.vercel.app) 59 superati, 1 saltato; header CSP, HSTS, nosniff, Referrer-Policy e Permissions-Policy serviti da Vercel.
- `npm view @agentrica/mcp@0.1.0`: 75 file, shasum uguale al tarball pubblicato, MIT, dipendenze esatte, `engines` Node ≥ 22. `npx -y @agentrica/mcp@0.1.0` in un progetto vuoto: 56 prompt, due tool, versione 0.1.0, nessun file scritto.
- **Non verificato**: il workflow di release su GitHub e la provenance (dalla 0.1.1), Node 22 (provato solo Node 26), le impostazioni del pacchetto su npm (solo da interfaccia).

## Passi dell'utente prima del rilascio

1. **GitHub** (fatto, verificato con `gh api`): repository pubblico; ambiente `npm` con approvazione obbligatoria e solo tag `v*`; ruleset `main` (pull request con merge commit, controllo `verify`, niente force push né cancellazione) e `versioni` (tag `v*` solo all'amministratore).
2. **npm**: organizzazione `agentrica` registrata, owner `flgisimone`, 2FA per accesso e pubblicazione (fatto, verificato con `npm org ls` e `npm profile get`). La 0.1.0 si pubblica a mano senza provenance (scelta dell'utente), poi si configura il trusted publisher (CONVENTIONS §13.8, punto 4).
3. **Vercel**: verificare DPA e conservazione dei log (PRIV-PUB-01); progetto collegato a `main`.

## Rilievi aperti

- SEC-REL-02: risolto (ambiente, ruleset, trusted publisher, 2FA senza token). La 0.1.0 non ha provenance (scelta dell'utente); la prima release dalla CI (0.1.1) verifica workflow e provenance.
- PRIV-PUB-01 (P2): DPA, trasferimenti e conservazione dei log di Vercel.
- SEC-REL-03, SEC-REL-04 (P3, accettati): `'unsafe-inline'` negli script; transitivi a range.
- SEC-REL-05 (P3): action di `ci.yml` per tag.
- PRIV-PUB-02 (P3, accettato): contatto con issue pubbliche.
- Note legali scritte con i ruoli privacy, non riviste da un legale.
