AICA-07 · SAIPH — Senior SOC & Threat Detection Analyst, reparto AICA (AI Cybersecurity)

# Resoconto: copertura dei log, regole di rilevamento e analisi dell'estratto del 2026-11-19

## Sintesi per la direzione

**P0, da segnalare subito.** L'estratto `logging/samples/archive-2026-11-19.log` registra una compromissione dell'account.

- Fra le 02:58 e le 03:02, l'IP 203.0.113.77 tenta 27 login falliti su 27 account diversi: è un password spraying o un credential stuffing.
- Alle 03:05 lo stesso IP entra come `l.verdi`, che ha ruolo `operator` e non ha MFA.
- Nei due minuti successivi legge la lista utenti e scarica due volte l'esportazione completa dei clienti (1.873.344 byte ciascuna). Cambia anche il ruolo dell'utente 57.
- Nessuna regola del SIEM è scattata, e per costruzione non poteva scattare:
  - gli eventi di login sono a livello info, e Vector li scarta;
  - l'evento `admin_export` è a livello debug, quindi non viene nemmeno emesso;
  - PO-001 raggruppa per utente;
  - l'IP registrato dall'app è quello del proxy.
- Un operatore ha potuto usare le funzioni da amministratore per un difetto in `requireAdmin`.

La conservazione dei log (30 giorni nel SIEM, 7 nell'archivio) è sotto il requisito di 90 giorni. Le evidenze dell'archivio locale vanno preservate subito.

## Perimetro e autorizzazioni

- **Esaminato:** analisi in sola lettura della copia del progetto: `app/`, `logging/vector.yaml`, `logging/detection-rules.yml` e `logging/samples/archive-2026-11-19.log`. Per il contesto ho letto anche `infra/nginx.conf`, `infra/docker-compose.yml`, `iam/README.md`, `iam/access-review-2026-11.csv` e `README.md`.
- **Non eseguito:** nessuna query al SIEM, nessun accesso ai sistemi, nessun test attivo.
- **Biblioteca:** in questa prova il direttore AICA-01 e il tool library non erano disponibili. La scheda CVSS 4.0 non è stata consultata, e le gravità seguono la classificazione P0–P3 del reparto.

## Metodologia

1. Lettura statica del codice per vedere quali eventi vengono registrati e a che livello.
2. Lettura della pipeline Vector: sorgenti, filtri, destinazioni.
3. Lettura delle regole, verificando che ciascuna trovi davvero i campi e gli eventi che cerca.
4. Analisi dell'estratto, con conteggi fatti con grep e correlazione con i ruoli in `iam/access-review-2026-11.csv`.

## Rilievi

### A. Attività sospette nell'estratto

**SAIPH-01 · P0 · Compromissione dell'account `l.verdi` ed esfiltrazione dei dati dei clienti**
Le righe sono di `logging/samples/archive-2026-11-19.log`.

- **Righe 18–79 (attacco ai login):**
  - 27 `POST /login` con risposta 401 da 203.0.113.77, dalle 02:58:03 alle 03:02:01, uno ogni 7–13 secondi;
  - ogni tentativo è su un account diverso: dipendenti `*@ferramentanord.example` e caselle generiche `acquisti@`, `info@`, `test@`, `demo@` di `clienti.example`;
  - l'andamento è quello di uno spraying lento.
- **Righe 86–87 (accesso):**
  - alle 03:05:12 lo stesso IP ottiene un `login_success` come `l.verdi@ferramentanord.example`;
  - l'account non compare fra i tentativi falliti, quindi la password era probabilmente già nota (riuso o fuga di credenziali; è un'ipotesi);
  - secondo `iam/access-review-2026-11.csv` (riga 3), `l.verdi` è `operator`, con MFA «no».
- **Riga 89:** `GET /api/orders?limit=200` (48 KB). Un operatore vede gli ordini di tutti i clienti.
- **Riga 91:** `GET /api/admin/users`, risposta 200 (9.120 byte).
- **Righe 93 e 97:** `GET /api/admin/export/customers`, risposta 200, 1.873.344 byte ciascuna. È l'anagrafica completa dei clienti: ragione sociale, P.IVA, email, telefono, indirizzo (`app/orders.js:52`).
- **Riga 95:** `POST /api/admin/users/57/role`, risposta 200 (11 byte, cioè `{"ok":true}`). È una possibile persistenza o escalation su un secondo account. Il ruolo assegnato e il titolare dell'utente 57 non risultano dai log: va verificato sul database.
- **Contesto:**
  - l'ora è notturna;
  - in `iam/access-review-2026-11.csv` l'«ultimo_accesso» di `l.verdi` è 2026-11-21, quindi l'account risulta ancora attivo e usato dopo l'evento;
  - `iam/README.md` regola 3: le esportazioni sono riservate agli `admin`.
- **Causa che ha permesso l'accesso amministrativo (fatto):** in `app/auth.js:55` c'è `if (req.user.role !== "customer") return next();`. Così `operator` e `auditor` superano `requireAdmin`. Va passato alla Software Agency per la correzione.
- **Azioni proposte, da confermare con il responsabile umano dell'incidente:**
  1. Preservare subito `/var/log/archive/2026-11-19.log` e i giorni vicini, prima della rotazione a 7 giorni.
  2. Disattivare o reimpostare `l.verdi` e invalidare le sessioni. I JWT durano 8 ore e non c'è revoca: valutare la rotazione di `JWT_SECRET`.
  3. Verificare l'utente 57 e ripristinarne il ruolo.
  4. Cercare l'IP 203.0.113.77 in tutti i log disponibili.
  5. Verificare se le 27 caselle attaccate risultano in fughe note.
  6. Coinvolgere subito la Privacy & Compliance Agency e il DPO: l'esportazione contiene dati di contatto di persone fisiche (email, telefono), quindi va valutata la notifica entro 72 ore dalla conoscenza della violazione.
  7. Coinvolgere sec-incident-response per la gestione dell'incidente.
- **Limite:** l'attribuzione dell'IP dipende dall'header `X-Forwarded-For`, che nginx accetta da qualunque mittente (SAIPH-09).

**SAIPH-02 · P3 · Falliti di `a.bianchi` dalla VPN: probabile falso positivo**
- **Righe 122–129:** 3 falliti e poi un successo da 10.8.0.10, che è nella rete VPN dell'ufficio, alle 09:10, in orario lavorativo.
- Il quadro è compatibile con un errore di digitazione. `a.bianchi` però è `admin` (`iam/access-review-2026-11.csv` riga 2), quindi va confermato con l'interessata.
- **Righe 130–132:** il login di `ordini@edilsud.example` da 93.40.11.8 seguito dalla creazione di un ordine appare come attività normale di un cliente.

**SAIPH-03 · P3 · Rumore del monitoraggio di uptime**
- **Righe 1–121:** 404 su `GET /status` da 198.51.100.20 ogni 30 secondi.
- È noto (`README.md`), ma è il 70% circa dell'estratto. La correzione va fatta alla fonte: rimuovere `/status` dalla sonda, o farlo rispondere.

### B. Regole che non scattano

**SAIPH-04 · P1 · PO-001 (brute force) non può rilevare l'attacco** (`logging/detection-rules.yml:3-9`)
- L'evento `login_failed` non arriva mai al SIEM: è emesso a livello info (`app/auth.js:15`, `level: 30`) e il filtro `app_filtered` di Vector tiene solo `level >= 40` (`logging/vector.yaml:21`).
- Anche se arrivasse, `group_by: [user]` con `count > 10` non vede lo spraying (al massimo 1 tentativo per utente). Raggruppando per IP, l'estratto ne conta 27 in circa 4 minuti, e la regola sarebbe scattata.
- **Correzione:**
  1. Inoltrare gli eventi di sicurezza indipendentemente dal livello, per esempio con un filtro `exists(.event) || .level >= 40`.
  2. Aggiungere una variante per IP (per esempio più di 10 falliti in 5 minuti) e una per numero di utenti distinti per IP (per esempio più di 5 in 10 minuti).
  3. Usare l'IP reale del client (SAIPH-08).
- **Verifica:** rigiocare le righe 18–79 dell'estratto nel SIEM e controllare che scatti l'allarme.

**SAIPH-05 · P1 · PO-002 (accesso da paese nuovo) non può funzionare** (`logging/detection-rules.yml:11-16`)
- `login_success` viene filtrato come sopra (`app/auth.js:18`).
- Il campo `ip` dell'app è sempre 172.18.0.5, l'indirizzo del container nginx (`app/server.js:12`, `req.socket.remoteAddress`): `geoip(ip)` restituisce un indirizzo privato e nessun paese.
- La storia di 30 giorni coincide con la conservazione del SIEM ed è vuota per i nuovi account.
- **Correzione:** l'IP reale nei log dell'app (SAIPH-08) e l'inoltro degli eventi di login.

**SAIPH-06 · P1 · PO-003 (esportazione massiva) non può scattare** (`logging/detection-rules.yml:18-21`)
- `app/orders.js:53` registra `admin_export` con `req.log.debug` (livello 20). Pino è configurato senza `level` (`app/server.js:7`), quindi usa il default `info` e l'evento non viene nemmeno emesso.
- Se anche lo fosse, Vector lo scarterebbe.
- Nell'estratto infatti, per le righe 93 e 97 non c'è alcuna riga dell'app.
- **Correzione:**
  1. Livello info o warn, con `user`/`sub`, `role` e IP.
  2. Allarme anche su ogni esportazione fatta da un ruolo diverso da `admin` e fuori orario, non solo sopra le 1000 righe.
  3. Una regola di riserva su nginx: `request ~ "/api/admin/export"` e `bytes > 500000`.

**SAIPH-07 · P3 · PO-005: esclusione per IP invece che per percorso** (`logging/detection-rules.yml:38`)
- L'esclusione di 198.51.100.20 rende cieca la regola su qualunque scansione da quell'IP. Il disturbo vero sono i 404 su `/status`, che arrivano a circa 20 ogni 10 minuti, ben sotto la soglia di 100: l'esclusione non serve nemmeno a ridurre il rumore.
- **Correzione:** escludere solo `request = "GET /status ..."` dall'IP della sonda, oppure togliere l'esclusione.
- PO-004 è coerente con i campi di nginx e non ha lacune evidenti.

### C. Lacune di copertura

**SAIPH-08 · P1 · L'IP del client non compare nei log dell'app** (`app/server.js:12`)
- Senza `app.set("trust proxy", ...)` limitato al proxy, `ip` è sempre quello di nginx (172.18.0.5 in tutto l'estratto).
- Gli eventi dell'app non sono correlabili con l'origine: nell'estratto la correlazione è stata possibile solo per vicinanza di orario con nginx.

**SAIPH-09 · P2 · `client_ip` di nginx falsificabile** (`infra/nginx.conf:9-11`)
- `set_real_ip_from 0.0.0.0/0` insieme a `real_ip_recursive on` fa accettare `X-Forwarded-For` da chiunque. Un attaccante può scrivere nei log l'IP che vuole, e questo inquina PO-004 e PO-005 e le regole proposte per IP.
- Lo stesso vale per il controllo d'accesso: `/admin/` ammette `10.8.0.0/24`, quindi una richiesta con quell'IP nell'header passerebbe il filtro. Il punto va passato al sec-network-security-engineer per la verifica.
- **Correzione:** limitare `set_real_ip_from` alle reti del bilanciatore del provider.

**SAIPH-10 · P1 · Azioni sensibili senza alcun log applicativo**
Dei file esaminati, registrano qualcosa solo `login` (`app/auth.js:15,18`) e `exportCustomers` (`app/orders.js:53`). Non c'è nessun evento per:
- cambio di ruolo (`app/auth.js:63-68`, `setRole`): né chi lo ha fatto, né il bersaglio, né il ruolo vecchio e nuovo. Per la riga 95 dell'estratto non sappiamo quale ruolo è stato assegnato;
- lista utenti (`app/auth.js:59-61`);
- richiesta e reimpostazione della password (`app/auth.js:24-41`);
- accessi negati: 401 in `requireUser` (`app/auth.js:50`) e 403 in `requireAdmin` (`app/auth.js:56`);
- upload e download dei file (`app/upload.js:10-25`), import XML (`app/orders.js:33-40`), test dei webhook con URL esterni (`app/orders.js:42-49`, rilevante per SSRF);
- errori non gestiti: non c'è un middleware degli errori in `app/server.js`.

Inoltre:
- negli eventi di login manca l'id utente e c'è solo l'email digitata, cioè un dato personale (vedi SAIPH-13);
- manca un identificativo di richiesta per correlare app e nginx.

**SAIPH-11 · P2 · Fonti non raccolte o aggirabili**
- Il pannello `admin` pubblica la porta `8081:8081` sull'host (`infra/docker-compose.yml:24-25`). L'accesso diretto aggira nginx e quindi il suo access log e il filtro della VPN: va verificato con il gruppo di sicurezza.
- Vector raccoglie i log Docker di `admin` (`logging/vector.yaml:5`) ma li etichetta tutti `service = "portale-ordini"` (riga 16), e `. = parse_json!(.message)` sostituisce l'intero evento perdendo il nome del container. App e admin non sono distinguibili.
- Il log degli errori di nginx, i log di Postgres e Redis, i log di SSH/WireGuard e quelli del provider cloud non sono raccolti.
- Il formato del log di nginx non registra né il tempo di risposta né l'host, e la regex di Vector (`logging/vector.yaml:26`) non estrae lo user agent.
- **Ipotesi da verificare:** una riga non JSON dell'app, per esempio uno stack trace allo stdout, fa fallire `parse_json!`. Con il comportamento predefinito di remap l'evento passa senza `.level`, e il filtro a riga 21 lo scarta.

**SAIPH-12 · P2 · Conservazione sotto il requisito dei 90 giorni** (`logging/vector.yaml:41-45`, `README.md`)
- Il SIEM conserva 30 giorni; l'archivio locale ruota a `maxage 7`.
- L'archivio sta sulla stessa VM che dovrebbe sorvegliare: chi compromette la VM può alterarlo.
- L'archivio è anche l'unica fonte degli eventi a livello info, perché il SIEM non li riceve.
- **Correzione:** 90 giorni su uno storage esterno alla VM e non modificabile (append-only o WORM).

**SAIPH-13 · P3 · Dati personali nei log, da passare alla Privacy & Compliance Agency**
- Gli eventi di login registrano l'email in chiaro, anche quando è sbagliata o di un terzo (`app/auth.js:15`).
- La redazione di Pino copre solo `req.headers.authorization` e `body.password` (`app/server.js:7`).
- Va valutato l'uso di id o pseudonimi, coordinato con la conservazione a 90 giorni.

## Rischio residuo

Finché SAIPH-04, 05, 06, 08 e 10 non sono corretti, un nuovo spraying, un abuso di privilegi o un'esfiltrazione si vedrebbero solo rileggendo a mano l'archivio locale, entro 7 giorni. Il difetto di `requireAdmin` (`app/auth.js:55`) lascia aperte le funzioni da amministratore a ogni `operator` e `auditor`, incluso l'account esterno del revisore.

## Limiti e aree non verificate

- L'estratto copre solo il 2026-11-19 dalle 02:50 alle 09:12. Non ho visto il SIEM, gli altri giorni né il database (utente 57, ruolo attuale di `l.verdi`, sessioni).
- Non ho analizzato in dettaglio `security/` né `iam/cloud-iam.json`.
- Non ho verificato la configurazione reale in produzione, né se il filtro di nginx su `/admin/` sia davvero aggirabile.
- L'interpretazione «la password era già nota» è un'ipotesi.
- Le soglie proposte vanno tarate sul traffico reale.

## Piano della nuova verifica

1. Rigiocare l'estratto nel SIEM dopo le correzioni. Devono scattare:
   - PO-001 per IP (righe 18–79);
   - un allarme di accesso da IP nuovo per `l.verdi` (riga 86);
   - PO-003 o la regola di riserva su nginx (righe 93 e 97);
   - un allarme sul cambio di ruolo (riga 95).
2. Verificare che `ip` nei log dell'app sia l'IP pubblico e che un `X-Forwarded-For` falsificato non lo cambi.
3. Verificare che un operatore riceva 403 su `/api/admin/*` e che il 403 venga registrato.
4. Verificare che la conservazione sia di 90 giorni fuori dalla VM.

— SAIPH (AICA-07)
