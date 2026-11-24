AICA-07 · SAIPH — Senior SOC & Threat Detection Analyst, reparto AICA (AI Cybersecurity)

# Copertura dei log, regole di rilevamento e analisi dell'estratto 2026-11-19

Nota sul perimetro: ho lavorato in sola lettura sulla copia del progetto. Non ho caricato il direttore AICA-01 né la biblioteca, come richiesto per la prova. Nessuna scheda è stata citata: CVSS e gli standard non servivano a questo compito. Sono uno specialista su un modello più piccolo. I due rilievi P0 e i tre P1 qui sotto vanno quindi riesaminati dal direttore del reparto o da un revisore su Opus prima di essere definitivi.

## Sintesi

- Il 2026-11-19, tra le 02:58 e le 03:07 (+01:00), l'IP 203.0.113.77 ha provato 30 account diversi con 30 login falliti. Poi un account dipendente, l.verdi@ferramentanord.example, è entrato alle 03:05:12. Con quella sessione sono stati letti ordini e utenti, il file dei clienti è stato scaricato due volte (1.873.344 byte) ed è stato cambiato un ruolo. Lo scenario è coerente con password spraying seguito da accesso e furto dati (ipotesi, non provata).
- Nessuna regola del SIEM scatta su questa sequenza. Il problema sta nella catena di raccolta, non solo nelle soglie: gli eventi su cui si basano PO-001, PO-002 e PO-003 non arrivano mai al SIEM.
- Il reparto cyber non deve dichiarare sicuro l'insieme: i rilievi valgono per i file esaminati.

## Perimetro, metodo e limiti

- **Perimetro:** `app/*.js`, `logging/vector.yaml`, `logging/detection-rules.yml`, `logging/samples/archive-2026-11-19.log` (132 righe), `infra/nginx.conf` per i campi dei log.
- **Metodo:** lettura documentale, lettura delle chiamate di log, conteggio e correlazione delle righe dell'estratto.
- **Limiti:**
  - Non conosco la configurazione reale del SIEM né i suoi parser.
  - Non so se `l.verdi` abbia un ruolo admin: l'estratto non lo dice.
  - Non so se 203.0.113.77 sia un indirizzo noto. Il log `level: 30` dell'estratto viene dall'archivio locale, non dal SIEM.
  - Non c'è un giorno di riferimento "normale" con cui confrontare.
- **Dati personali:** nei rilievi cito solo il minimo necessario (indirizzi email di login, a titolo di evidenza). Il tema va passato a Privacy & Compliance.

## Rilievi

### 1. P0 · Spraying seguito da accesso, uso admin ed esportazione non rilevati
- **Fatti** (`archive-2026-11-19.log`):
  - righe 18-79: 30 `login_failed` su 30 utenti diversi, da 203.0.113.77, 02:58:03-03:02:01 (circa 4 minuti), ognuno con il proprio 401 di nginx. Nessun utente ha più di 1 tentativo;
  - riga 86-87 (03:05:12): `login_success` per l.verdi dallo stesso IP;
  - riga 89 (03:05:40): `GET /api/orders?limit=200`;
  - riga 91 (03:06:02): `GET /api/admin/users`;
  - righe 93 e 97 (03:06:31 e 03:07:40): `GET /api/admin/export/customers`, 200, 1.873.344 byte, due volte;
  - riga 95 (03:07:05): `POST /api/admin/users/57/role`, 200.
- **Ipotesi:** account compromesso con una password indovinata; l'utente 57 potrebbe essere un'escalation o una persistenza.
- **Perché non scatta:** vedi rilievi 2, 3 e 4. Nessuno dei controlli attuali vede tutta la sequenza.
- **Raccomandazione:** è un possibile incidente in corso o recente. Va segnalato subito al responsabile umano e a Privacy & Compliance per la valutazione di una violazione di dati (l'export contiene dati dei clienti). Preservare l'archivio locale e i log nginx prima della rotazione (vedi rilievo 7). Verificare con i responsabili che cosa sia successo all'utente 57 e a l.verdi. Non ho modificato nulla né contattato nessuno.

### 2. P1 · Gli eventi di sicurezza dell'app non arrivano al SIEM (`logging/vector.yaml:18-21`)
- `app_filtered` lascia passare solo `.level >= 40`. `login_failed` e `login_success` sono emessi con `req.log.info` (`app/auth.js:15` e `:18`, pino level 30) e vengono scartati. Nel SIEM arrivano solo i log dell'app a livello warn o superiore.
- Conseguenza: PO-001 (brute force) e PO-002 (paese nuovo) hanno `query: event = "login_failed"` / `"login_success"` e non possono mai scattare. Sono regole morte dall'origine.
- Gli stessi eventi sono presenti solo nell'archivio locale (`local_archive` riceve `app_parsed`).
- **Correzione:** far passare al SIEM gli eventi con campo `event` (o abbassare il filtro per quelli) invece di filtrare per livello. Usare `warn` per i login falliti è una scelta di sviluppo.

### 3. P1 · `admin_export` non viene mai prodotto (`app/orders.js:53`)
- Usa `req.log.debug`. Il logger pino di `app/server.js:7` ha il livello di default `info`, quindi il debug non viene emesso. In più il filtro del rilievo 2 lo scarterebbe comunque.
- PO-003 (`event = "admin_export" and rows > 1000`) non può scattare. L'archivio non contiene alcun `admin_export`, anche se nginx mostra due export alle 03:06:31 e 03:07:40.
- Anche se l'evento esistesse, nel log manca `user` (chi ha esportato): `req.user` non è nel contesto del logger.
- **Correzione:** log a livello info con `user`, `rows` e IP reale. Alternativa: regola su nginx (`GET /api/admin/export/*` con byte oltre soglia), che copre anche il caso in cui l'app non logga.

### 4. P1 · PO-001 non individua lo spraying anche con i dati corretti (`detection-rules.yml:3-9`)
- `group_by: [user]` con `count > 10` in 5 minuti: nell'estratto ogni utente ha 1 tentativo, quindi non scatterebbe nemmeno con gli eventi presenti. Il caso a 3 tentativi di 10.8.0.10 (righe 122-127) è invece innocuo e resta sotto soglia.
- **Correzione:** aggiungere una regola per IP (es. `group_by: [ip]`, più di 10 `login_failed` in 5 minuti) e una per utenti distinti (conteggio di utenti diversi per IP). Il successo dopo molti fallimenti dallo stesso IP va correlato come regola separata (alta priorità).
- Perché l'IP sia affidabile vedi il rilievo 5.

### 5. P1 · IP del cliente inaffidabile e incoerente tra le sorgenti
- `infra/nginx.conf:9-11`: `set_real_ip_from 0.0.0.0/0` con `real_ip_header X-Forwarded-For`. Chiunque può inviare un header X-Forwarded-For e farsi registrare un IP falso in nginx. Per le regole per IP (PO-005 e le nuove) significa che un attaccante le può eludere.
- Nei log applicativi `ip` è sempre 172.18.0.5, l'indirizzo del proxy (`app/server.js:12` usa `req.socket.remoteAddress`), quindi PO-002 (geoip su `ip`) usa un indirizzo interno e non può essere corretto nemmeno se l'evento arrivasse.
- Il campo si chiama `ip` nell'app e `client_ip` in nginx: le correlazioni tra i due richiedono una normalizzazione.
- **Correzione:** `set_real_ip_from` limitato agli indirizzi del proprio proxy e `trust proxy` in express (decisioni su infrastruttura da concordare con il responsabile).

### 6. P2 · Lacune di copertura nei log applicativi (`app/*.js`)
Le uniche chiamate di log sono `login_failed`, `login_success` (`auth.js:15,18`), `admin_export` (`orders.js:53`, debug) e "listening on 3000" (`server.js:36`). Mancano:
- cambio ruolo (`auth.js:63-68` `setRole`) e lista utenti (`listUsers`): nessuna traccia di chi ha cambiato quale ruolo. È il punto della riga 95 dell'estratto, ricostruibile solo da nginx;
- richiesta e uso del reset password (`auth.js:24-41`: `forgotPassword`, `resetPassword`), con possibile presa di controllo dell'account;
- rifiuti di autorizzazione: 401 di `requireUser` e 403 di `requireAdmin` (`auth.js:43-57`) senza log;
- import XML, upload e download di file, webhook di test (`orders.js:33-49`, `upload.js`): nessun evento;
- creazione ordini (`orders.js:26`) e accessi negati su ordini altrui (`orders.js:22`, restituito come 404 senza log);
- `listUsers` e le altre azioni admin non hanno audit trail.
Il `user` nei log nginx non c'è per costruzione: la correlazione con l'app si fa solo per timestamp e IP.

### 7. P2 · Conservazione dei log inferiore al requisito
- `vector.yaml:45`: archivio locale con logrotate `maxage 7`. `README.md:26`: requisito interno di 90 giorni, SIEM a 30 giorni, archivio locale come secondo livello.
- Fatto: con 7 giorni e SIEM a 30, il requisito dei 90 giorni non è coperto. Inoltre gli eventi di accesso, come visto, non sono nel SIEM e restano solo nei 7 giorni dell'archivio. Per l'incidente del rilievo 1 il tempo disponibile per conservare le evidenze è breve.

### 8. P2 · Campo `status` come stringa nelle regole nginx (`vector.yaml:26`, `detection-rules.yml:26,34`)
- La regex estrae `status` come testo; nel parser non c'è conversione. PO-004 (`status >= 500`) e PO-005 (`status = 404`) dipendono da come il SIEM tratta il tipo. Nell'estratto `status` è un numero: il confronto va verificato sul SIEM reale (non posso dire se funzioni). Inoltre il regex scarta lo `user-agent` presente nel formato di nginx (`nginx.conf:13`).

### 9. P3 · PO-005 e il 404 periodico di 198.51.100.20
- 60 richieste `GET /status` → 404 da 198.51.100.20 ogni 30 secondi (02:50:00-03:19:30, righe 1-121 alternate). Regolari: probabile sonda di monitoraggio che punta a un percorso che non esiste. È un falso positivo potenziale, ma l'esclusione `exclude: client_ip: ["198.51.100.20"]` (`detection-rules.yml:38`) è per IP, non per percorso: se quell'IP venisse usato per una scansione reale, non scatterebbe nulla. Con 60 richieste in 30 minuti la soglia di 100 in 10 minuti non sarebbe comunque superata (20 in 10 minuti). Con l'X-Forwarded-For spoofabile (rilievo 5) l'esclusione per IP è facilmente aggirabile.
- Il percorso `/status` va corretto sul monitor (o aggiunto `/status`/`/healthz` al backend) per eliminare il rumore.

### 10. P3 · Altri
- `/healthz` è escluso da `nginx_no_health` (`vector.yaml:27-30`): corretto come scelta; `access_log off` in nginx lo rende superfluo.
- Regola mancante per l'accesso a `/admin/` e `/metrics` (nginx espone `/metrics` senza restrizione, `nginx.conf` ~riga 54): ci sono solo regole sull'app.
- I log dei login contengono l'email degli utenti (inclusi quelli che non esistono, es. `test@clienti.example`): dato personale da valutare con Privacy.

## Attività sospette nell'estratto (riepilogo)

| Quando (+01:00) | Cosa | Righe | Gravità |
|---|---|---|---|
| 02:58:03-03:02:01 | 30 login falliti su 30 utenti da 203.0.113.77 | 18-79 | P0 (insieme alla sequenza) |
| 03:05:12 | Login riuscito l.verdi dallo stesso IP | 86-87 | P0 |
| 03:05:40-03:07:40 | Lettura ordini, lista utenti, 2 export clienti (1,8 MB), cambio ruolo utente 57 | 89-97 | P0 |
| 02:50:00-03:19:30 | 60 x 404 su `/status` da 198.51.100.20 a cadenza fissa | 1-121 | P3 (probabile sonda) |
| 09:10:02-09:10:48 | 3 login falliti poi riuscito per a.bianchi da 10.8.0.10 (rete VPN) | 122-129 | nessun rilievo (tipico errore di digitazione) |
| 09:12:10-09:12:30 | Login e ordine di ordini@edilsud.example da 93.40.11.8 | 130-132 | nessun rilievo, ma senza storico non posso dire se il paese è nuovo |

## Regole che non scattano

- PO-001: non scatta, per i rilievi 2 e 4.
- PO-002: non scatta, per i rilievi 2 e 5.
- PO-003: non scatta, per il rilievo 3.
- PO-004: nessun 5xx nell'estratto, non verificabile.
- PO-005: non scatta e l'IP è escluso (rilievo 9).

## Rischio residuo e prossimi passi

1. Avvisare subito il responsabile umano e Privacy & Compliance sul rilievo 1. Congelare l'archivio locale prima della rotazione a 7 giorni.
2. Correggere la catena di raccolta (rilievi 2 e 3) prima di scrivere nuove regole; poi aggiungere le regole per IP e la correlazione fallimenti-poi-successo (rilievo 4).
3. Mettere in sicurezza la fonte dell'IP (rilievo 5) e portare la conservazione a 90 giorni (rilievo 7).
4. Dopo le correzioni, rieseguire questo estratto (o uno nuovo) contro le regole per verificare che scattino; è il criterio di chiusura.
5. Revisione di questi risultati da parte del direttore AICA-01 o di un revisore su Opus (rilievi P0 e P1).

Firmato: AICA-07 · SAIPH
