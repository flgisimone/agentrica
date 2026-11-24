AICA-09 · WEZEN — Senior Vulnerability Management Engineer, reparto AICA (AI Cybersecurity)

**Sintesi per la direzione**
Il rapporto DepScan/ImageScan del 2026-11-20 contiene 9 voci (8 identificativi unici). Due si alzano, una va riaperta perché l'eccezione è scaduta, le altre si declassano o si verificano. Ci sono anche rilievi fuori dallo scanner, alcuni da trattare come P0 candidati: il pannello admin è esposto su 8081 e l'IP del client è falsificabile in nginx. Sono proposte da confermare: il riesame è del direttore AICA-01 o di un revisore su Opus, perché questo lavoro è svolto da un modello più piccolo.

**Perimetro e autorizzazioni**
- Copia `.../scratchpad/copie/aica-09-haiku-1`, sola lettura. Nessuna scansione attiva, nessun test, nessuna modifica, nessun processo, nessuna rete.
- Direttore e libreria non caricati, come richiesto. Le schede della biblioteca (CVSS v4, OWASP, NIST) non sono state consultate: i riferimenti normativi qui sono da verificare.

**Metodo**
Confronto tra rapporto, lockfile, `package.json`, Dockerfile, compose, nginx, security group e codice delle rotte (`server.js`, `auth.js`, `upload.js`, `orders.js`). Ho verificato che tutte le rotte `/api/*` passano da `auth.requireUser`, come dichiara il README.

**Scadenze (README sicurezza, dalla data del rapporto 2026-11-20)**
P0 48 ore (scaduta il 2026-11-22). P1 7 giorni (2026-11-27). P2 30 giorni (2026-12-20). P3 90 giorni (2027-02-18).

**Registro proposto**

| Id | Pacchetto | Scanner | Proposta | Motivazione | Azione |
|---|---|---|---|---|---|
| FNSA-2026-0287 | multipart-lite 2.3.0 (dipendenze) | medium 5.3 | **P0, alzato** | Sfruttamento osservato in rete (`known_exploited`), EPSS 0.71. Raggiungibile da ogni account cliente: il parsing avviene dopo `requireUser` in `server.js` (riga 27) e `upload.js` riga 11, quindi non da anonimi. Blocca l'event loop per decine di secondi, impatto sulla disponibilità. Se la verifica nei log non trova richieste anomale, scende a P1. | Aggiornare a 2.3.4 come patch. Controllare nei log le richieste con Content-Type anomalo da ottobre 2026. SLA già scaduta. |
| FNSA-2026-0254 | xml-mapper 1.8.2, due voci (top-level e nested sotto multipart-lite) | high 7.5 | **P1, unito in una voce** | `orders.js` riga 36: `importXml` accetta XML da qualunque cliente autenticato. Nessuna correzione nella linea 1.x. La 2.0.0 cambia l'API (`parse` diventa `parseDocument`), quindi serve una modifica al codice. | Pianificare la migrazione. Valutare una misura provvisoria (limitare l'import a ruoli operatore), da decidere con il responsabile. Verificare se la copia nested cambia con l'aggiornamento di multipart-lite. |
| FNSA-2026-0102 | pino-abstract-transport 2.0.0 | high 7.1 | **P2, riaperto** | Eccezione scaduta il 2026-09-30 (`scanner-ignore.yml`): per regola torna aperto. La motivazione «fix in arrivo» è superata: pino 9.6.0 è uscito il 2026-10-07 (data dal rapporto). Nel codice non c'è `transport` in `server.js`, quindi il percorso vulnerabile non è raggiunto dall'app, ma il pacchetto è nell'immagine di produzione. | Aggiornare pino da 9.5.0 a 9.6.0. Non rinnovare l'eccezione. |
| FNSA-2026-0198 | express 4.19.2 | medium 6.1 | **Verificare, probabile chiusura** | Il lockfile della copia riporta express 4.21.2, già oltre la 4.20.0. Il rapporto dichiara un lockfile di un altro commit (3f2a9c1). | Rigenerare lo scanner sul lockfile attuale. Vedi il rilievo nuovo N2 sul redirect di login. |
| FNSA-2026-0311 | docgen-lite 0.9.4 (devDependencies) | critical 9.8 | **P2, declassato** | Non è nell'immagine di produzione (`npm ci --omit=dev`). Serve solo a `build:docs` sui sorgenti del repository. Va a P1 se la CI esegue la generazione su contenuti esterni (PR da fork, template di terzi) o con segreti nell'ambiente. Il fix è una patch, 0.9.6. | Aggiornare a 0.9.6. Verificare quale job CI esegue `build:docs` e con quali segreti. |
| FNSA-2026-0140 | minimatch 9.0.4 in eslint (devDependencies) | high 7.5 | **P3, mantenere l'eccezione** | Solo CI. Il motivo dichiarato («pattern controllati da noi nella configurazione del lint») non è verificabile nella copia: non c'è una configurazione eslint. | Verificare il motivo. Valutare una scadenza più breve della fine febbraio 2027. |
| IMG-2026-4471 | libssl3 (immagine node:22.11.0-bookworm-slim) | high 7.4 | **P2, contestualizzato** | Fix disponibile nella patch Debian. Il nodo non fa TLS in ingresso (lo fa nginx): il rischio dipende dal fatto che il processo `node` usi la libssl di sistema, da verificare con `ldd` sul binario. Se la usa, sale a P1. | Ricostruire l'immagine con la base patchata più recente della linea 22 (da verificare). |
| IMG-2026-3902 | perl-base (senza fix) | low 3.3 | **P3, rischio accettato** | Richiede script Perl con input controllato dall'attaccante, che l'app non esegue. | Registrarlo come rischio accettato con referente e data di revisione. |

**Rilievi nuovi, fuori dal rapporto dello scanner**
Ordine di gravità proposta. Non ho fatto nessun test attivo: ogni punto è una lettura di configurazione o codice.

- **N1 — Pannello admin raggiungibile da internet. P0 candidato, da confermare subito.** In `docker-compose.yml` la porta 8081 dell'admin è pubblicata sull'host (`"8081:8081"`). Il security group `infra/security-group.json` apre `8000-8100` a `0.0.0.0/0`. Così il pannello bypassa la regola «solo VPN» di nginx per `/admin`. Va verificato sull'infrastruttura reale (regola SG e firewall dell'host). Una modifica richiede approvazione. Instradare a sec-network-security-engineer e sec-cloud-security-engineer.
- **N2 — IP client falsificabile in nginx. P1.** `set_real_ip_from 0.0.0.0/0` con `real_ip_recursive on` sostituisce `$remote_addr` con l'indirizzo dell'header `X-Forwarded-For`, che il client può impostare. Così la `allow 10.8.0.0/24` di `/admin/` è aggirabile, e i log IP sono falsificabili. Con N1 la gravità sale a P0. Instradare a sec-network-security-engineer.
- **N3 — File dei clienti pubblici senza autenticazione. P1, possibile violazione di dati.** `nginx.conf` serve `/files/` da `/srv/uploads/` senza controllo di accesso, mentre `upload.download` fa il controllo solo in app. I nomi sono `${sub}-${Date.now()}-${filename}`, quindi prevedibili. Instradare a sec-appsec-engineer e, per i dati personali, a privacy-breach-response (valutazione della violazione).
- **N4 — SSH aperto a internet. P1 (da verificare).** Il security group apre la porta 22 a `0.0.0.0/0`, mentre il README dice «SSH solo dalla VPN». Instradare a sec-cloud-security-engineer e sec-iam-engineer.
- **N5 — Possibile path traversal nell'upload. P1 da verificare.** `upload.js` righe 14-15 compone il nome con `file.filename` (dal client) e lo passa a `path.join`. Con `../` nel nome può uscire da `/srv/uploads`, a seconda di come `multipart-lite` ripulisce il nome: da verificare nel codice della libreria. Instradare a sw-security-engineer.
- **N6 — SSRF nel test dei webhook. P1.** `orders.js` `testWebhook` fa fetch di un URL qualunque da parte di un cliente autenticato. Blocca solo l'hostname `localhost`. Restano raggiungibili gli IP interni, `169.254.169.254` e i servizi sulla rete `backend` (`admin`, `cache`, `db`). Instradare a sw-security-engineer.
- **N7 — Redirect aperto nel login. P2.** `auth.js` accetta come `next` qualunque stringa che inizia con `/`, quindi anche `//host-esterno`. Da verificare come il frontend usa il campo `redirect`. Il rilievo sull'express sopra è un'altra cosa.
- **N8 — Architettura non come dichiarato. P2/P3.** `/metrics` è pubblicato da nginx senza restrizioni, mentre il README dice che serve solo a Prometheus in ufficio. `db` è anche sulla rete `frontend`, mentre il README dice che sta solo su `backend`. Non c'è `.dockerignore`: con `COPY . .` un `node_modules` locale entrerebbe nell'immagine.
- **N9 — Copertura dello scanner. P2.** Lo scanner copre solo l'immagine `portale-ordini`. Non coprono `portale-admin:1.9.0`, postgres, redis, nginx e node-exporter.

**Piano di correzione proposto (da confermare)**
1. Subito: verificare N1 e N2 sull'infrastruttura reale, poi chiudere l'esposizione (richiede approvazione). Verificare N4.
2. Subito, entro la scadenza superata: aggiornare multipart-lite a 2.3.4 (P0). Verificare N3 e N5.
3. Entro 2026-11-27: migrazione di xml-mapper (P1), misura provvisoria da decidere. Correggere N6.
4. Entro 2026-12-20: pino 9.6.0, docgen-lite 0.9.6, ricostruzione dell'immagine con base patchata (P2). Verificare express con un nuovo scanner. Correggere N7 e N8.
5. Entro 2027-02-18: rischio perl-base accettato (P3). Minimatch con eccezione da rivedere.

**Limiti**
- Niente rete: CVSS e KEV (in particolare lo stato di sfruttamento di FNSA-2026-0287) non sono verificati su fonti ufficiali.
- Copia incompleta: mancano `app/mail.js` (richiesto da `auth.js`), `.env`, `node_modules` e la configurazione eslint. Il codice dell'app non è eseguibile così com'è e le verifiche di codice sono parziali. Vale in particolare per `multipart-lite` nested e per `db.js`.
- Le conclusioni sono proposte: sono una lettura documentale e non una certificazione. Le decisioni (priorità, eccezioni, modifiche a infrastruttura e codice) spettano all'utente e al responsabile umano.

— WEZEN (AICA-09)
