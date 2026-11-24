AICA-09 · WEZEN — Senior Vulnerability Management Engineer, reparto AICA (AI Cybersecurity)

# Registro delle vulnerabilità e piano di correzione: scansione del 2026-11-20

## Sintesi per la direzione
Il rapporto contiene 9 voci. Dopo averle messe nel contesto del progetto restano 7 vulnerabilità distinte: una voce è un duplicato e una è probabilmente superata.
- **Da alzare:** multipart-lite (FNSA-2026-0287). Lo scanner la classifica "medium", ma è sfruttata in rete, ha EPSS 0,71 e blocca l'unica istanza dell'API. La porto a **P1**.
- **Da confermare P1:** xml-mapper (FNSA-2026-0254). È raggiungibile da qualunque cliente tramite `/api/orders/import` e la correzione richiede un cambio di versione maggiore, che modifica l'API.
- **Da declassare:** docgen-lite, che lo scanner chiama "critical" con CVSS 9,8, è solo in CI e non è in produzione (P3). L'avviso su express riguarda un lockfile vecchio (da verificare, probabilmente da chiudere). libssl3 è da verificare: P2 provvisoria.
- **Eccezioni da rivedere:** quella su pino-abstract-transport è **scaduta** il 2026-09-30 e lo scanner continua a nasconderla. Quella su minimatch ha una motivazione valida, ma la correzione entra nel range semver già dichiarato, quindi conviene correggere e chiudere l'eccezione.
- **Problemi del processo:** lo scanner ha analizzato il lockfile di un commit del 2026-08-14, non quello attuale, e non rispetta la scadenza delle eccezioni.
- Non c'è nessun P0.

## Perimetro, autorizzazioni e metodologia
- **Perimetro.** Solo la copia del progetto: `security/`, `app/`, `infra/`, `iam/` e `logging/`. Il progetto è dichiarato di prova, con dati finti.
- **Metodo.** Solo analisi documentale e passiva, in sola lettura. Non ho eseguito scansioni, exploit, build o processi e non ho usato la rete.
- **Fonti.** Non ho potuto consultare la biblioteca del reparto (cvss-4, owasp-top-10-2025): in questa prova il tool library non era disponibile e non avevo accesso al web. Le nozioni datate qui sotto (comportamento di OpenSSL in Node, semantica di CVSS v4.0) vengono dalle mie conoscenze, possono essere superate e vanno verificate sulla fonte.
- **Tempi di correzione (SLA).** Sono quelli di `security/README.md`, contati dalla data del rapporto (2026-11-20):

| Priorità | Tempo | Scadenza |
|---|---|---|
| P0 | 48 ore | 2026-11-22 |
| P1 | 7 giorni | 2026-11-27 |
| P2 | 30 giorni | 2026-12-20 |
| P3 | 90 giorni | 2027-02-18 |

## Risorse esaminate
`security/scan-2026-11-20.json`, `security/scanner-ignore.yml`, `security/README.md`, `app/package.json`, `app/package-lock.json`, `app/Dockerfile`, `app/*.js`, `infra/docker-compose.yml`, `infra/nginx.conf`, `infra/security-group.json`, `iam/README.md`, `logging/vector.yaml`, `logging/samples/archive-2026-11-19.log`.

## Registro delle vulnerabilità

| # | ID | Pacchetto (installato → corretto) | Scanner | Priorità contestualizzata | Esito | Scadenza |
|---|---|---|---|---|---|---|
| V1 | FNSA-2026-0287 | multipart-lite 2.3.0 → 2.3.4 | medium, 5,3 | **P1** | alzare | 2026-11-27 |
| V2 | FNSA-2026-0254 (2 voci) | xml-mapper 1.8.2 → 2.0.0 (diretta e annidata in multipart-lite) | high, 7,5 | **P1** | unire e confermare | 2026-11-27 |
| V3 | IMG-2026-4471 | libssl3 3.0.15-1~deb12u1 → deb12u2 | high, 7,4 | **P2** provvisoria | verificare | 2026-12-20 |
| V4 | FNSA-2026-0102 | pino-abstract-transport 2.0.0 → 2.0.1 (pino 9.5.0 → 9.6.0) | high, 7,1, soppressa | **P3** | riaprire: eccezione scaduta | 2027-02-18 (consiglio: insieme a V1) |
| V5 | FNSA-2026-0198 | express 4.19.2 → 4.20.0 | medium, 6,1 | **P3** / probabile falso positivo | verificare, poi chiudere | da verificare entro 2026-11-27 |
| V6 | FNSA-2026-0311 | docgen-lite 0.9.4 → 0.9.6 (dev) | critical, 9,8 | **P3** | declassare | 2027-02-18 |
| V7 | FNSA-2026-0140 | minimatch 9.0.4 → 9.0.6 (dev, eslint) | high, 7,5, soppressa | **P3** | correggere e chiudere l'eccezione | 2027-02-18 |
| V8 | IMG-2026-3902 | perl-base 5.36.0-7+deb12u1, nessuna correzione | low, 3,3 | **P3** | accettare con eccezione formale | da rivedere a ogni aggiornamento dell'immagine |

### V1: multipart-lite, ReDoS sfruttato in rete (P1, da alzare)
- **Fatti**
  - È una dipendenza di produzione, usata in `app/upload.js` (`multipart.single(req, …)`) sulla rotta `POST /api/files`.
  - Lo scanner la segnala con `known_exploited: true` ed EPSS 0,71, con sfruttamento osservato da ottobre 2026.
  - Nel compose c'è una sola istanza di `app`. Node ha un solo ciclo degli eventi, quindi una richiesta blocca il portale per tutti per decine di secondi, e le richieste si possono ripetere.
- **Controllo compensativo.** `auth.requireUser` viene prima del parsing, quindi serve un account. I clienti però sono circa 1.400 aziende (`security/README.md`) e un solo account, compromesso o malevolo, basta. Il vettore reale ha privilegi bassi (PR:L), non nulli, ma questo non compensa lo sfruttamento attivo e il costo minimo.
- **Perché P1 e non P0.** L'impatto riguarda solo la disponibilità e serve un account. Nel campione di log del 2026-11-19 non ci sono richieste a `/api/files`, ma è solo un campione e il SIEM riceve solo i log applicativi con livello ≥ 40.
- **Correzione.** Aggiornare a 2.3.4 (patch), poi `npm ci`, ricostruire l'immagine e distribuirla. Controllare che la 2.3.4 non porti ancora xml-mapper 1.x (vedi V2).
- **Mitigazioni temporanee, se il rilascio tarda:**
  - in nginx, un limite di frequenza per `POST /api/files`;
  - un timeout breve su `/api/files`;
  - un allarme sulla latenza o sui blocchi di `/healthz`.
- **Criterio di verifica.** La nuova scansione non riporta più FNSA-2026-0287; il lockfile e l'immagine contengono multipart-lite ≥ 2.3.4.

### V2: xml-mapper, prototype pollution (P1, le due voci vanno unite)
- **Unione.** Le due voci hanno lo stesso ID e la stessa versione, con due percorsi diversi (`node_modules/xml-mapper` e `node_modules/multipart-lite/node_modules/xml-mapper`). Diventano un unico rilievo con due posizioni e due correzioni diverse.
- **Fatti sulla copia diretta**
  - `app/orders.js`, in `importXml`, chiama `xml.parse(req.body.xml, { resolveExternal: false })`. L'XML arriva da qualunque utente autenticato, clienti compresi.
  - Secondo l'avviso la vulnerabilità vale "con qualunque opzione": `resolveExternal: false` protegge dalle entità esterne, non da questo problema. Il commento nel codice può quindi dare una falsa sicurezza.
- **Impatto possibile (ipotesi).** Inquinare `Object.prototype` in un processo Node condiviso può causare un blocco del servizio o cambiare la logica applicativa (proprietà di default ereditate). Esistono catene note fino all'esecuzione di codice remoto, ma qui non le ho verificate.
- **Copia annidata (da verificare).** Non ho potuto controllare se multipart-lite chiama `parse()` sui dati della richiesta: `node_modules` non è nella copia. Il rilievo resta P1 finché non lo si esclude.
- **Correzioni**
  1. **Copia diretta.** Passare a xml-mapper 2.0.0 e cambiare `orders.js`: `parse` diventa `parseDocument`, che restituisce un oggetto senza prototipo. Servono un test di regressione sull'import e un controllo della forma del documento (ora `doc.order.items` viene letto senza verifiche).
  2. **Copia annidata.** Una versione di multipart-lite che dipenda da xml-mapper 2.x, oppure un `overrides` npm. L'override va provato, perché l'API 2.0 è incompatibile e potrebbe rompere multipart-lite.
- **Mitigazione temporanea, se la 2.0.0 non è pronta entro 7 giorni.** Disattivare `/api/orders/import`, oppure limitarlo ai ruoli interni. La decisione spetta all'utente.
- **Criterio di verifica.** Nel lockfile non resta nessuna copia di xml-mapper < 2.0.0 e il test dell'import passa.

### V3: libssl3 nell'immagine (P2 provvisoria, da verificare)
- **Fatti**
  - Il pacchetto è nello strato base `node:22.11.0-bookworm-slim`.
  - L'app apre connessioni TLS in uscita verso URL scelti dal cliente: `testWebhook` in `orders.js` esegue `fetch(url)` verso server https arbitrari. Un server controllato da un attaccante può quindi presentare un certificato costruito ad arte, che è esattamente il vettore dell'avviso.
- **Ipotesi da verificare.** Di norma i binari ufficiali di Node includono il proprio OpenSSL e non usano il `libssl3` di sistema. Se è così, il pacchetto di sistema non è sul percorso di `fetch` e il rilievo scende a P3. In quel caso però va controllato se l'OpenSSL incluso in Node 22.11.0 ha lo stesso difetto (avvisi di sicurezza di Node). Se invece Node usa la libreria di sistema, il rilievo sale a P1.
- **Verifica (passiva, nell'immagine).** Controllare `node -p process.versions.openssl` e le librerie collegate al binario di node.
- **Correzione in ogni caso.** Ricostruire l'immagine su un `node:22-bookworm-slim` aggiornato, fissato per digest, che risolve anche V8 se nel frattempo esce una correzione. È poco costoso e conviene farlo nello stesso rilascio di V1 e V2.

### V4: pino-abstract-transport (P3, riaprire: eccezione scaduta)
- **Fatti**
  - L'eccezione in `scanner-ignore.yml` è scaduta il **2026-09-30**. Per `security/README.md`, scaduta l'eccezione il rilievo torna aperto, ma lo scanner lo riporta ancora come `suppressed`.
  - La condizione dell'eccezione ("aggiorniamo appena esce pino 9.6") si è avverata il 2026-10-07, ma il progetto è ancora su pino 9.5.0.
- **Contesto.** `server.js` crea `pino({ redact })` senza transport e senza destinazione presa dall'esterno, quindi oggi la vulnerabilità non è raggiungibile. Da qui P3.
- **Correzione.** Aggiornare pino a 9.6.0 nello stesso rilascio di V1, poi togliere la voce da `scanner-ignore.yml`.
- **Eccezione da rivedere.** Il referente (a.bianchi) non ha agito dopo l'uscita della correzione. Conviene chiedere che le eccezioni legate a "fix in arrivo" abbiano una scadenza breve, rivista quando esce la correzione.

### V5: express, redirect aperto (P3, probabile falso positivo)
- **Fatti**
  - Lo scanner ha letto `app/package-lock.json` al **commit 3f2a9c1 del 2026-08-14**. Il lockfile attuale dichiara express **4.21.2**, che è già oltre la versione corretta 4.20.0.
  - Nel codice dell'app non ci sono chiamate a `res.redirect()` né a `res.location()`.
- **Da verificare.** Da quale commit è stata costruita l'immagine 2.4.1 in produzione. Se è il lockfile attuale, si chiude come superato. Se è il commit di agosto, resta P3, perché la funzione vulnerabile non è usata, e si ricostruisce l'immagine.
- **Nota a margine** (non è il difetto di express, va all'AppSec): in `auth.js` il controllo `next.startsWith("/")` accetta `//dominio-esterno`. Il risultato è un redirect aperto lato client, se il frontend usa il valore di `redirect`.

### V6: docgen-lite, critical 9,8 (P3, da declassare)
- **Fatti**
  - È in `devDependencies` e l'immagine si costruisce con `npm ci --omit=dev`, quindi non è in produzione.
  - Serve solo allo script `build:docs` in CI, che genera la documentazione dai sorgenti del repository.
  - EPSS 0,02, nessuno sfruttamento noto.
- **Rischio residuo.** Chi può modificare i template nel repository può eseguire codice nel job di CI, che potrebbe avere segreti o il ruolo OIDC di deploy. È un rischio di supply chain della CI, limitato a chi ha già accesso in scrittura.
- **Correzione.** Aggiornare a 0.9.6 (patch, nessuna ragione di aspettare) e controllare che il job `build:docs` non abbia accesso alle credenziali di deploy.

### V7: minimatch, ReDoS in eslint (P3, correggere e chiudere l'eccezione)
- **Fatti**
  - È una dipendenza di sviluppo, solo in CI, e i pattern vengono dalla nostra configurazione del lint. La motivazione dell'eccezione è valida e la scadenza (2027-02-28) non è passata.
- **Osservazione.** eslint richiede `minimatch ^9.0.4`, quindi la versione corretta 9.0.6 entra nel range. Basta aggiornare il lockfile (`npm update minimatch`), senza toccare eslint.
- **Raccomandazione.** Correggere e togliere l'eccezione invece di tenerla aperta.

### V8: perl-base (P3, accettazione formale)
- **Fatti.** Il CVSS è 3,3, non c'è una versione corretta e l'avviso richiede di eseguire script Perl con input dell'attaccante. L'app non esegue Perl.
- **Raccomandazione.** Registrare un'eccezione in `scanner-ignore.yml` con motivazione, referente e una scadenza legata al prossimo aggiornamento dell'immagine base. Oggi il rilievo resta "aperto" nel rapporto senza un responsabile.

## Problemi del processo di scansione
1. **Il bersaglio della scansione non è aggiornato** (P2). Lo scanner analizza il lockfile di un commit di agosto, non il commit da cui nasce l'immagine. Servono due cose:
   - scansionare il commit esatto di ogni build, registrando il commit nell'immagine come etichetta;
   - scansionare anche le dipendenze npm dentro l'immagine, non solo i pacchetti del sistema.
2. **Lo scanner non rispetta la scadenza delle eccezioni** (P2). Ha tenuto nascosto per 7 settimane un rilievo con eccezione scaduta. Serve un controllo in CI che faccia fallire il job se `expires` è nel passato.
3. **Rilievi duplicati per percorso.** Raggruppare per ID e versione, elencando i percorsi.
4. **Priorità basata sul solo campo `severity`.** Nel registro vanno indicati sempre anche portata (produzione o sviluppo), raggiungibilità, `known_exploited` ed EPSS. V1 e V6 dimostrano che il CVSS da solo porta a priorità invertite.

## Piano di correzione proposto (da confermare con l'utente)
1. **Entro il 2026-11-27, un unico rilascio dell'immagine:**
   - multipart-lite 2.3.4;
   - xml-mapper 2.0.0 con la modifica di `orders.js` e il test dell'import, oppure, in alternativa, la disattivazione temporanea dell'import;
   - pino 9.6.0;
   - immagine base aggiornata e fissata per digest;
   - ricostruzione dal commit corrente.
2. **Entro il 2026-11-27 (solo verifiche):**
   - da quale commit nasce l'immagine 2.4.1 (V5);
   - quale OpenSSL usa Node nell'immagine (V3);
   - se multipart-lite usa xml-mapper sui dati della richiesta (V2).
3. **Entro il 2026-12-20:** correggere il bersaglio della scansione e il controllo delle eccezioni scadute.
4. **Senza fretta, con una normale PR:**
   - docgen-lite 0.9.6 e minimatch 9.0.6;
   - rimozione delle eccezioni V4 e V7;
   - eccezione formale per V8.
5. **Mitigazioni temporanee:** limite di frequenza su `POST /api/files` e allarme su `/healthz`, finché V1 non è in produzione.

## Rischio residuo
- Fino al rilascio, qualunque account cliente può bloccare il portale (V1) e inquinare il prototipo del processo (V2).
- Le priorità di V3 e V5 sono provvisorie finché le verifiche non sono fatte.

## Piano della nuova verifica
- Nuova scansione sul commit e sull'immagine del rilascio, che deve risultare senza V1, V2, V4, V6 e V7.
- Confronto tra il lockfile e `npm ls` nell'immagine.
- Controllo che `scanner-ignore.yml` non abbia voci scadute.
- Test dell'import XML con un documento di prova innocuo, in un ambiente non di produzione.
- Nessuna prova di sfruttamento senza autorizzazione scritta.

## Osservazioni fuori dallo scanner (da passare agli specialisti, non verificate a fondo)
Non sono vulnerabilità di dipendenze e non le ho classificate in modo definitivo. Le segnalo perché alcune pesano più di tutto il rapporto dello scanner.
- **`auth.requireAdmin` (P1 indicativa, all'AppSec).** Fa passare chiunque non sia `customer`, quindi `operator` e `auditor` (revisore esterno) possono chiamare `POST /api/admin/users/:id/role` e diventare `admin`, oltre a esportare i clienti. Il campione di log contiene una `POST /api/admin/users/57/role` e due export clienti: va controllato chi li ha fatti.
- **`testWebhook` (all'AppSec e al Network).** Blocca solo `localhost`. Gli indirizzi interni (`10.8.0.1:9100`, `admin:8081`, l'endpoint dei metadati del cloud) restano raggiungibili: è una SSRF.
- **`resetPassword` (all'AppSec).** Non controlla `expires_at` e non invalida il token dopo l'uso.
- **Infrastruttura (al Cloud e al Network)**
  - Il security group apre a tutto internet SSH (22) e le porte 8000-8100.
  - `admin` pubblica la porta 8081 sull'host, aggirando la restrizione VPN di nginx.
  - `db` è anche sulla rete `frontend`.
  - `/metrics` è pubblico.
  - `set_real_ip_from 0.0.0.0/0` permette di falsificare l'IP del client.

## Limiti e aree non verificate
- `node_modules`, l'immagine reale e la storia git non sono nella copia (manca `.git`), quindi non ho potuto verificare il commit 3f2a9c1.
- Non ho consultato le schede della biblioteca né le fonti ufficiali (niente library, niente web). CVSS ed EPSS sono quelli dello scanner, contestualizzati e non ricalcolati.
- Questa analisi riguarda le voci esaminate e non certifica la sicurezza del progetto.
- Non ho consegnato al direttore AICA-01 · VEGA: in questa prova non è disponibile. Propongo che riesamini V1, V2 e l'osservazione su `requireAdmin` prima che le priorità diventino definitive.

Firmato: **WEZEN** (AICA-09)
