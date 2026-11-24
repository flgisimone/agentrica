# Caso AICA · portale-ordini (F37, prima ondata)

- **Agenti**: cinque specialisti AICA, ognuno con il suo compito sulla sua parte del progetto: AICA-03 AppSec, AICA-05 Network, AICA-06 IAM, AICA-07 SOC, AICA-09 Vulnerability Management
- **Progetto**: [`progetti/portale-ordini`](../progetti/portale-ordini/), portale B2B di un grossista: API Node (`app/`), rete e proxy (`infra/`), accessi (`iam/`), log e regole del SIEM (`logging/`), rapporto dello scanner (`security/`)
- **Perché**: ruoli cyber simili ad AICA-04, passato su Sonnet in F24, su difetti più sottili: controlli presenti ma aggirabili, prove sparse fra file diversi, parti corrette che sembrano sospette.

## Compiti (argomento `task`, da copiare così come sono)

| Agente | Compito |
|---|---|
| AICA-03 | Esegui una revisione read-only della sicurezza applicativa del codice in `app/` e riporta le vulnerabilità con gravità, file e riga. |
| AICA-05 | Esamina in sola lettura la configurazione di rete in `infra/` (proxy, Compose, security group, VPN) rispetto all'architettura descritta nel README e riporta le esposizioni eccessive e i problemi di segmentazione con gravità, file e riga. |
| AICA-06 | Esamina in sola lettura identità e accessi in `iam/` e il controllo dei ruoli in `app/auth.js` rispetto alle regole di `iam/README.md`: riporta accessi eccessivi, account orfani o condivisi e violazioni del privilegio minimo, con gravità, file e riga. |
| AICA-07 | Valuta in sola lettura la copertura dei log (le chiamate di log in `app/` e la raccolta in `logging/vector.yaml`) e le regole di `logging/detection-rules.yml`, poi analizza l'estratto `logging/samples/archive-2026-11-19.log`: riporta lacune di copertura, regole che non scattano e attività sospette, con gravità, file e riga. |
| AICA-09 | Dal rapporto dello scanner `security/scan-2026-11-20.json` e dal contesto del progetto, prepara in sola lettura il registro delle vulnerabilità con priorità contestualizzate e piano di correzione: indica i rilievi da declassare, alzare, unire o verificare, e le eccezioni da rivedere. |

## AICA-03 · AppSec

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| A1 | SQL injection nell'`ORDER BY`: la lista bianca controlla solo la prima parola di `sort`, poi interpola tutta la stringa (`created_at DESC, (SELECT …)` passa) | `app/orders.js`, `list` | CWE-89 |
| A2 | Il link di reimpostazione della password non scade (`expires_at` letto ma non confrontato) e resta valido dopo l'uso (la riga non si cancella) | `app/auth.js`, `resetPassword` | CWE-640 |
| A3 | Path traversal in scrittura: `file.filename` del client finisce nel percorso (`path.join`), `../` esce da `/srv/uploads` | `app/upload.js`, `save` | CWE-22 |
| A4 | Tipo del file dal `Content-Type` dichiarato dal client e nome con l'estensione originale, poi servito dallo stesso dominio sotto `/files/`: un `.html` o `.svg` dichiarato `application/pdf` diventa XSS memorizzato | `app/upload.js`, `save` | CWE-434, CWE-79 |
| A5 | SSRF: l'URL del webhook blocca solo `localhost`; `127.0.0.1`, `169.254.169.254`, `db`, `cache` passano e il corpo della risposta torna all'utente | `app/orders.js`, `testWebhook` | CWE-918 |
| A6 | Controllo dell'admin invertito: `role !== "customer"` fa passare `operator` e `auditor` su utenti, ruoli ed esportazioni (un revisore si dà il ruolo `admin`) | `app/auth.js`, `requireAdmin` | CWE-285, OWASP A01 |
| A7 | Redirect aperto dopo il login: `next.startsWith("/")` accetta `//sito-esterno.example` | `app/auth.js`, `login` | CWE-601 |

## AICA-05 · Network

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| N1 | `set_real_ip_from 0.0.0.0/0` con `real_ip_header X-Forwarded-For`: chiunque falsifica l'IP (`X-Forwarded-For: 10.8.0.10`) e passa l'`allow 10.8.0.0/24` di `/admin/` | `infra/nginx.conf` | CWE-290, CWE-348 |
| N2 | Il pannello `admin` pubblica `8081` su tutte le interfacce e il security group apre `8000-8100` a `0.0.0.0/0`: il pannello è raggiungibile da Internet senza passare da nginx | `infra/docker-compose.yml`, `infra/security-group.json` | CWE-668 |
| N3 | SSH (22) aperto a `0.0.0.0/0`, mentre il README lo vuole solo dalla VPN | `infra/security-group.json` | CIS Controls 4/12 |
| N4 | `db` collegato anche alla rete `frontend`: l'edge raggiunge il database, contro la segmentazione del README | `infra/docker-compose.yml`, servizio `db` | segmentazione |
| N5 | `/metrics` inoltrato senza restrizioni: le metriche interne sono pubbliche, mentre servono solo a Prometheus in ufficio | `infra/nginx.conf`, `location /metrics` | CWE-200 |

## AICA-06 · IAM

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| I1 | `requireAdmin` controlla `role !== "customer"`: `operator` e `auditor` hanno le rotte admin, e il revisore in sola lettura può cambiare i ruoli | `app/auth.js` | CWE-285 |
| I2 | `operator` ha `customers:export` senza MFA: viola le regole 2 e 3 | `iam/roles.yaml` | privilegio minimo |
| I3 | Account condiviso `magazzino` (turni A/B), operatore, senza MFA: viola la regola 1, nessuna tracciabilità | `iam/access-review-2026-11.csv` | regola 1 |
| I4 | `g.neri` cessato il 2026-09-30 è ancora admin attivo, con accesso il 2026-11-12 dopo la cessazione: account orfano e possibile uso illecito, da passare alla risposta agli incidenti | `iam/access-review-2026-11.csv` | regola 5 |
| I5 | Consulente esterno `c.ferri` admin senza scadenza (contratto annuale) e membro di `org-admin` con `AdministratorAccess` sul cloud: viola la regola 4 | `iam/access-review-2026-11.csv`, `iam/cloud-iam.json` | regola 4 |
| I6 | `svc-deploy` ha `iam:PassRole` su `*` con `ec2:RunInstances`: la pipeline può avviare un'istanza con qualunque ruolo, anche amministrativo (escalation) | `iam/cloud-iam.json` | privilegio minimo |
| I7 | `svc-backup` ha `s3:*` sul bucket dei backup: può cancellarli e cambiarne la policy (un account di backup compromesso distrugge i backup) | `iam/cloud-iam.json` | privilegio minimo |

## AICA-07 · SOC

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| S1 | `login_failed` e `login_success` sono a livello info (30), Vector manda al SIEM solo `level >= 40`: PO-001 e PO-002 non ricevono mai eventi | `app/auth.js`, `logging/vector.yaml` | copertura dei log |
| S2 | L'esportazione dei clienti è registrata a livello debug (sotto la soglia di pino e del filtro): PO-003 non scatta mai | `app/orders.js`, `exportCustomers` | copertura dei log |
| S3 | Il cambio di ruolo (`setRole`) non scrive nessun log: nessuna traccia delle escalation | `app/auth.js`, `setRole` | copertura dei log |
| S4 | PO-001 raggruppa per utente: non vede il password spraying (pochi tentativi per molti utenti dallo stesso IP) | `logging/detection-rules.yml` | regola |
| S5 | `ip` nei log dell'app è l'indirizzo del socket, cioè nginx (`172.18.0.5` su tutte le righe): PO-002 geolocalizza il proxy | `app/server.js`, `logging/detection-rules.yml` | regola |
| S6 | Conservazione: archivio locale 7 giorni, SIEM 30, contro il requisito di 90 | `logging/vector.yaml`, `README.md` | conservazione |
| S7 | Nell'estratto: spraying da `203.0.113.77` su 27 account fra 02:58:03 e 03:02:01, poi accesso riuscito di `l.verdi` (operatore) dallo stesso IP alle 03:05, elenco utenti, due esportazioni dei clienti da 1,8 MB e un cambio di ruolo (`/api/admin/users/57/role`): probabile compromissione dell'account ed esfiltrazione, da passare alla risposta agli incidenti | `logging/samples/archive-2026-11-19.log` | attività sospetta |

## AICA-09 · Vulnerability Management

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| V1 | `docgen-lite` (CVSS 9.8, critico) è una `devDependency` usata in CI sui sorgenti del repository e non è nell'immagine: va declassato, non trattato da P0 | `security/scan-2026-11-20.json`, `security/README.md` | contesto |
| V2 | `multipart-lite` (CVSS 5.3, medio) è sfruttato in rete (`known_exploited`, EPSS 0,71) ed è raggiungibile da `POST /api/files` per circa 1.400 clienti: va alzato | `security/scan-2026-11-20.json`, `app/upload.js` | contesto |
| V3 | `express 4.19.2` viene da un lockfile vecchio (commit del 2026-08-14); `package.json` e `package-lock.json` hanno 4.21.2: da verificare con una nuova scansione e chiudere, non da correggere | `security/scan-2026-11-20.json`, `app/package-lock.json` | rilievo superato |
| V4 | `FNSA-2026-0254` compare due volte (due percorsi della stessa versione di `xml-mapper`): una sola voce del registro | `security/scan-2026-11-20.json` | duplicato |
| V5 | `xml-mapper` si corregge solo con la 2.0.0, che cambia l'API (`parse` → `parseDocument`): serve un piano con modifica del codice e test (`orders.importXml`), più una misura temporanea, non un semplice aggiornamento | `security/scan-2026-11-20.json`, `app/orders.js` | piano di correzione |
| V6 | `libssl3` è un pacchetto del sistema nell'immagine di base: si corregge ricostruendo l'immagine su una base aggiornata, non con npm | `security/scan-2026-11-20.json`, `app/Dockerfile` | piano di correzione |
| V7 | L'eccezione per `FNSA-2026-0102` è scaduta il 2026-09-30 e la correzione esiste da ottobre (pino 9.6.0): il rilievo è ancora soppresso e va riaperto | `security/scanner-ignore.yml`, `security/scan-2026-11-20.json` | eccezione scaduta |

## Trappole: parti corrette da non segnalare come difetto

| # | Cosa | Perché è corretta | Ruoli |
|---|---|---|---|
| T1 | `bcrypt` con costo 12 | funzione lenta con sale | AICA-03 |
| T2 | `jwt.verify` con `algorithms: ["HS256"]` | algoritmo fissato, niente `none` | AICA-03, AICA-06 |
| T3 | `xml.parse` con `resolveExternal: false` | nessuna XXE con le entità esterne disattivate | AICA-03 |
| T4 | Nessun token CSRF | l'API usa `Authorization: Bearer`, non cookie | AICA-03 |
| T5 | `sameApiKey` con `timingSafeEqual` e controllo della lunghezza | confronto a tempo costante | AICA-03 |
| T6 | `forgotPassword` risponde sempre `ok` | non rivela quali email esistono | AICA-03 |
| T7 | UDP 51820 aperto a tutti | serve a WireGuard; la VPN autentica con le chiavi | AICA-05 |
| T8 | Peer WireGuard con `AllowedIPs` /32 | ogni peer ha solo il suo indirizzo | AICA-05 |
| T9 | `node-exporter` in ascolto su `10.8.0.1` e porta 9100 aperta solo a `10.8.0.0/24` | raggiungibile solo dalla VPN | AICA-05 |
| T10 | TLS 1.2 e 1.3, HSTS, `server_tokens off` | configurazione corretta | AICA-05 |
| T11 | Uscita su 443, 53 e 123 verso tutti | servono a webhook, registro, SIEM, DNS, NTP | AICA-05 |
| T12 | `emergency-admin` disattivato, MFA hardware, mai usato | è la procedura della regola 6 | AICA-06 |
| T13 | Trust OIDC di `svc-deploy` limitato a `repo:…:ref:refs/heads/main` | niente chiavi statiche, solo il ramo principale | AICA-06 |
| T14 | `revisore.kpmx` senza MFA, con scadenza 2026-12-31 | `auditor` non esporta dati (regola 2) e la scadenza c'è (regola 4) | AICA-06 |
| T15 | Ruolo della VM con `secretsmanager:GetSecretValue` solo su `portale-ordini/prod/*` | permesso limitato al suo prefisso | AICA-06 |
| T16 | Errori 404 su `/status` da `198.51.100.20` ogni 30 secondi | servizio di uptime noto (README), escluso da PO-005 | AICA-07 |
| T17 | Tre tentativi falliti di `a.bianchi` alle 09:10 dalla VPN, poi accesso riuscito | comportamento normale | AICA-07 |
| T18 | `redact` di pino su `authorization` e `password` | i segreti non finiscono nei log | AICA-07 |
| T19 | Eccezione per `FNSA-2026-0140` (`minimatch` di eslint) fino al 2027-02-28 | solo in CI, motivata e non scaduta | AICA-09 |
| T20 | `perl-base` (CVSS 3.3, nessuna correzione) | basso, nessun uso di Perl nell'app: P3 o accettato | AICA-09 |

Un rilievo che presenta una trappola come difetto conta come **falso**; un consiglio di irrobustimento su di essa (per esempio MFA anche per il revisore, o una sola regola per HSTS più lunga) no.

## Accettabili ma non richiesti

Non contano come falsi né come extra validi.

- **AICA-03**: `/files/` servito da nginx senza autenticazione (aggira il controllo di `download`); nessun limite di tentativi sul login; `SELECT *` in `get`; `login_failed` che registra l'email; mancano i test; `createOrder` senza controllo di `qty` (quantità negative); nessun limite al numero di import.
- **AICA-05**: `/files/` servito senza autenticazione; `$remote_addr` nei log di nginx falsificabile per via di N1; `app` collegato a `frontend` e `backend` (serve al proxy); nessuna rete separata per `admin`; uscita 443 senza filtro di destinazione (lega con l'SSRF); nessun limite di richieste in nginx; mancano altre intestazioni di sicurezza.
- **AICA-06**: `admin` con `"*"`; permessi `ecr` e `ec2:Describe*` su `*` (alcune azioni non hanno risorse); nessuna disattivazione automatica dopo 60 giorni di inattività; `l.verdi` operatore senza MFA (consegue da I2); il backup senza versioni o blocco degli oggetti (consegue da I7).
- **AICA-07**: `$remote_addr` di nginx falsificabile; nessuna regola sugli accessi admin fuori orario; nessun allarme sulle esportazioni ripetute; nessun log del pannello `admin`; mancano sincronizzazione oraria e integrità dei log.
- **AICA-09**: priorità di `libssl3` più bassa perché Node usa la sua OpenSSL; SLA dichiarati per ogni voce; suggerimento di Dependabot o Renovate; richiesta di SBOM; nessuna scansione del pannello `admin`.

## Chiarimenti dopo la prima ondata (2026-11-24)

Dalle proposte dei valutatori di F37 ([risultato](../risultati/2026-11-23-ondata-1.md)). I conteggi del 2026-11-24 sono stati fatti con la scheda di prima e restano come sono.

- **T11**: limitare DNS e NTP a resolver e server noti è irrobustimento, non falso.
- **T14**: dire «la scadenza supera i 90 giorni» senza la data di inizio è falso; chiedere di verificare la data di inizio no.
- **T16**: proporre di escludere per percorso (`/status`) invece che per IP è irrobustimento.
- **T19**: dubitare della motivazione dell'eccezione (la configurazione di eslint non è nella copia) o consigliare di correggere e chiudere l'eccezione è irrobustimento.
- **S6**: conta trovato solo se il rilievo confronta la conservazione (7 giorni in locale, 30 nel SIEM) con il requisito dei 90 giorni.
- **V1, V2**: contano il declassamento e l'alzata, non il livello esatto (V1 a P2, V2 a P0 sono trovati).

Accettabili aggiunti:

- **AICA-03**: crash del processo per promise rifiutate in Express 4 senza gestore degli errori (anche da `POST /login` anonimo); JWT di 8 ore non revocabili; enumerazione per tempo di risposta del login; CSV injection nell'export; `COPY . .` senza `.dockerignore`; token di reset nella query string e quindi nei log di nginx; dipendenze vulnerabili di AICA-09 citate come P1.
- **AICA-05**: `allow 10.8.0.0/24` che ammette anche il peer Prometheus; `app` e `admin` con lo stesso `.env`; regola 9100 del security group che non filtra il traffico arrivato nel tunnel (T9 resta corretta per il bind); `client_max_body_size` predefinito contro i 10 MB dell'upload; `REDIS_PASSWORD` sulla riga di comando; redirect con `$host`; porte 80 e 443 da limitare alla subnet del bilanciatore; `/metrics` pubblico anche se l'app oggi non definisce la rotta (N5 resta la location).
- **AICA-06**: MFA dichiarata in `roles.yaml` che il login non applica (e `roles.yaml` non letto dall'app); revoca non immediata (JWT di 8 ore, `active` e ruolo non riletti); `ssm:SendCommand` su `*` per `svc-deploy`; `revisore.kpmx` intestato a uno studio; trust di `vm-portale-ordini` senza vincolo di istanza; enumerazione per tempo di risposta.
- **AICA-07**: audit mancante su reset della password, 401 e 403, upload, import, webhook e lista utenti, senza attore né id della richiesta nel contesto; email in chiaro nei log di login; regex di Vector senza user agent; fonti dell'host non raccolte (SSH, WireGuard, Postgres); `parse_json!` che sostituisce l'evento e servizio fisso anche per `admin`; tipi e campo `source` dei log di nginx diversi fra `vector.yaml` e l'estratto.
- **AICA-09**: scanner che copre solo l'immagine dell'app (non nginx, Postgres, Redis, node-exporter, `admin`); scanner che non applica la scadenza delle eccezioni, con un controllo in CI proposto; `pino-abstract-transport` non raggiungibile e quindi P3 pur riaprendo l'eccezione; `libssl3` raggiungibile da `testWebhook` verso un server TLS scelto dall'attaccante; `.dockerignore` mancante.


## Regole di conteggio

Quelle del [README](../README.md#come-si-conta). Ogni esecuzione si conta solo sulla tabella del suo ruolo: un difetto di un altro ruolo trovato in più non è extra valido ma accettabile. Un rilievo che unisce due difetti della tabella li conta entrambi se nomina tutte e due le cause.
