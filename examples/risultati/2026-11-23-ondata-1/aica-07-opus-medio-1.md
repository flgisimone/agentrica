AICA-07 · SAIPH — Senior SOC & Threat Detection Analyst, reparto AICA (AI Cybersecurity)

Nota sulla prova: il direttore AICA-01 e la biblioteca non sono stati caricati, come richiesto. Non ho citato schede. Ho lavorato in sola lettura, senza avviare processi e senza rete. Le gravità seguono la scala del reparto. Non ho usato CVSS.

## Segnalazione immediata (P0)

L'estratto del 2026-11-19 mostra con buona probabilità un account compromesso, seguito da accesso amministrativo ed esportazione dei dati dei clienti. Nessuna regola del SIEM è scattata. Dettagli in A1. Due azioni non possono aspettare:

1. **Preservare subito le evidenze.** L'archivio locale ruota con `maxage 7` (`logging/vector.yaml:45`): il file del 19/11 sparisce verso il 26/11. Per i log dell'app è l'unica copia, perché nel SIEM i loro eventi non arrivano mai. Servono copia e hash.
2. **Scalare al responsabile umano dell'incidente** e alla Privacy & Compliance Agency. Sono coinvolti dati personali dei clienti (email, telefono, indirizzo: `app/orders.js:52`), quindi va valutata una violazione di dati. Il termine di 72 ore decorre da quando ci si rende conto della violazione, non dalla data del log.

## Sintesi per la direzione

- **Raccolta.** Nel SIEM arrivano solo gli eventi app con livello pino ≥ 40. Tutti gli eventi di sicurezza dell'app hanno livello 30 o meno, quindi le tre regole basate sull'app (PO-001, PO-002, PO-003) non possono scattare.
- **Attribuzione.** L'IP registrato dall'app è sempre quello del container nginx. L'IP registrato da nginx si può falsificare.
- **Dati.** Mancano gli eventi di modifica dei ruoli, reset della password e accessi negati. La conservazione (7 giorni in locale, 30 nel SIEM) è sotto il requisito di 90 giorni.
- **Effetto.** Oggi l'unica fonte affidabile è il log di accesso di nginx, con i limiti descritti sotto.

## Perimetro e metodo

- **Perimetro.** Copia del progetto, file `app/*.js`, `logging/vector.yaml`, `logging/detection-rules.yml`, `logging/samples/archive-2026-11-19.log` (132 righe). Come contesto ho letto anche `infra/nginx.conf`, `infra/docker-compose.yml`, `infra/security-group.json`, `iam/README.md`, `iam/roles.yaml` e `iam/access-review-2026-11.csv`.
- **Metodo.** Analisi documentale e correlazione manuale dell'estratto. Nessuna interrogazione del SIEM, del database o di sistemi vivi.
- **Evidenze.** Cito solo righe e campi. Gli indirizzi email nel log sono personali, anche se finti: li riporto il meno possibile.

## A. Attività sospette nell'estratto

**A1 — P0 — Password spraying, poi accesso riuscito e abuso amministrativo dallo stesso IP**
File: `logging/samples/archive-2026-11-19.log`.
- **Fatti, righe 18–79.** L'IP `203.0.113.77` tenta 31 login falliti fra le 02:58:03 e le 03:02:01. Ogni tentativo usa un utente diverso: dipendenti e indirizzi generici come acquisti@, info@, test@, demo@. Il ritmo è di circa uno ogni 7–11 secondi.
- **Fatti, righe 86–87.** Alle 03:05:12 lo stesso IP entra con l'account `l.verdi`: è un operator senza MFA secondo `iam/access-review-2026-11.csv:3`. È riuscito al primo tentativo su quell'utente, quindi probabilmente la credenziale era già nota (credential stuffing o furto).
- **Fatti, righe 89–97.** Seguono:
  - `GET /api/orders?limit=200`, 48 KB;
  - `GET /api/admin/users`, 200;
  - `GET /api/admin/export/customers`, 200, 1.873.344 byte, alle 03:06:31;
  - `POST /api/admin/users/57/role`, 200, alle 03:07:05;
  - una seconda esportazione identica alle 03:07:40.
- **Spiegazione tecnica (fatto).** L'operator ottiene i 200 sulle rotte di amministrazione per via di `requireAdmin` in `app/auth.js:55`: `if (req.user.role !== "customer") return next();`. Il controllo è invertito, quindi passa qualunque ruolo diverso da customer. Va alla Software Agency e all'AppSec. Inoltre `iam/roles.yaml:7` assegna `customers:export` all'operator, contro la regola 3 di `iam/README.md`.
- **Ipotesi.** La modifica del ruolo dell'utente 57 può essere una persistenza o un'escalation. Va verificato subito il ruolo attuale dell'utente 57 e chi lo detiene.
- **Correzioni proposte (decide il responsabile umano).**
  - Sospendere la sessione e l'account `l.verdi` e reimpostarne la password.
  - Revocare i JWT emessi: durano 8 ore, ma non c'è revoca, quindi si cambia `JWT_SECRET`.
  - Ripristinare il ruolo dell'utente 57.
  - Correggere `requireAdmin`.
  - Controllare gli altri account presi di mira e l'accesso alle 03:00 rispetto ai turni del magazzino.
- **Rischio residuo.** L'IP `203.0.113.77` può essere falsificato (vedi B4): l'attribuzione alla fonte non è certa.

**A2 — P3 — Tre login falliti di un admin, poi riuscito**
File: `logging/samples/archive-2026-11-19.log`, righe 122–129.
- **Fatti.** Alle 09:10 `a.bianchi` (admin) fallisce tre volte e poi entra da `10.8.0.10`.
- **Osservazione.** Sembra un errore di battitura in orario d'ufficio. Ma `10.8.0.10` è un indirizzo della VPN che arriva da nginx pubblico, e quel campo si può falsificare (B4).
- **Raccomandazione.** Verificare la sessione WireGuard di quell'ora, quando i log ci saranno (B8).

**A3 — Nessun rilievo — Rumore noto**
File: `logging/samples/archive-2026-11-19.log`, righe 1–121.
- `198.51.100.20` chiama `GET /status` ogni 30 secondi e riceve 404. È il servizio di uptime descritto in `README.md:27`.
- Fanno circa 20 richieste ogni 10 minuti, sotto la soglia di PO-005 anche senza esclusione.
- Le righe 130–132 (`ordini@edilsud.example`, che crea un ordine) sembrano normali.

## B. Lacune di copertura

**B1 — P1 — Il filtro di Vector scarta tutti gli eventi di sicurezza dell'app**
File: `logging/vector.yaml:18-21`.
- **Fatto.** `condition: .level >= 40` lascia passare solo warn ed error. Ma `login_failed` e `login_success` sono `info`, livello 30 (`app/auth.js:15`, `:18`; nel log, ad esempio righe 19 e 87, `"level": 30`).
- **Correzione.** Inoltrare al SIEM gli eventi con il campo `event`, a qualunque livello. In alternativa, alzare a warn gli eventi di sicurezza.
- **Verifica.** Un login fallito di prova compare nel SIEM.

**B2 — P1 — L'evento `admin_export` non viene nemmeno scritto**
File: `app/orders.js:53`.
- **Fatto.** `req.log.debug(...)` scrive a livello 20. pino, istanziato senza `level` in `app/server.js:7`, ha come livello predefinito info, quindi l'evento non viene emesso. Anche se lo fosse, B1 lo scarterebbe.
- **Correzione.** Livello info o warn, con utente, ruolo e numero di righe.

**B3 — P1 — Nei log dell'app l'IP del client è sempre quello di nginx**
File: `app/server.js:12`.
- **Fatto.** `ip: req.socket.remoteAddress` registra il container nginx: nel log è sempre `172.18.0.5`. Express non ha `trust proxy`.
- **Effetto.** Non si possono correlare per IP gli eventi dell'app, e la condizione `geoip(ip)` di PO-002 non funziona.
- **Correzione.** Ricavare l'IP dall'header impostato da nginx, solo dopo aver corretto B4.

**B4 — P1 — Il `client_ip` di nginx si può falsificare**
File: `infra/nginx.conf:9-11`.
- **Fatto.** `set_real_ip_from 0.0.0.0/0` con `real_ip_recursive on` considera fidato qualunque indirizzo. Nginx prende quindi il primo valore di `X-Forwarded-For`, che sceglie il client.
- **Effetto.** Un attaccante può scegliersi l'IP registrato. Così aggira le regole per IP ed elude l'esclusione di PO-005: basta presentarsi come `198.51.100.20`.
- **Correzione.** Limitare `set_real_ip_from` agli indirizzi del bilanciatore del provider. Va anche alla Network Security.

**B5 — P2 — Eventi di sicurezza senza nessun log**
- **Senza log.**
  - Cambio di ruolo: `app/auth.js:63-68`.
  - Elenco degli utenti: `app/auth.js:59-61`.
  - Richiesta e uso del reset della password: `app/auth.js:24-41`.
  - Token non valido (401): `app/auth.js:49-51`.
  - Accesso negato all'amministrazione (403): `app/auth.js:56`.
  - Caricamento e scaricamento dei file: `app/upload.js`.
  - Import XML e test dei webhook verso URL esterni: `app/orders.js:33-49`.
- **Manca in generale.** Il contesto del log non contiene l'identità dell'utente autenticato (`req.user.sub` e ruolo) né un ID della richiesta (`app/server.js:12`). La riga 95, il cambio di ruolo, si ricostruisce solo da nginx, senza sapere chi l'ha fatto né che ruolo ha assegnato.
- **Correzione.** Un evento di audit per ognuna di queste azioni, con attore, ruolo, oggetto, esito e ID della richiesta, senza segreti.

**B6 — P2 — Conservazione insufficiente**
File: `logging/vector.yaml:45` e `README.md:26`.
- **Fatto.** Il requisito è 90 giorni. Il SIEM ne tiene 30 e l'archivio locale 7.
- **Effetto.** Nessun livello copre i 90 giorni.
- **Correzione.** Allungare la conservazione nel SIEM o in un archivio immutabile esterno alla VM: oggi è sulla stessa macchina che si dovrebbe indagare.

**B7 — P2 — Il pannello admin si raggiunge senza passare da nginx**
File: `infra/docker-compose.yml:24-25`, `infra/security-group.json:9`.
- **Fatto.** La porta `8081` è pubblicata sull'host e il security group apre `8000-8100` a `0.0.0.0/0`.
- **Effetto.** Si aggira `allow 10.8.0.0/24` di nginx, e quegli accessi non compaiono nel log di accesso di nginx. Resta solo ciò che il container `admin` scrive, a livello ≥ 40.
- **Gravità.** P2 per la copertura dei log. L'esposizione in sé va alla Network/Cloud Security.

**B8 — P2 — Mancano le fonti dell'host**
File: `logging/vector.yaml:2-8`.
- **Fatto.** Non si raccolgono:
  - i log di autenticazione SSH (la porta 22 è aperta a `0.0.0.0/0`: `infra/security-group.json:8`);
  - WireGuard;
  - il demone Docker;
  - Postgres;
  - `/metrics`, che in `infra/nginx.conf:54-56` è pubblico.
- **Correzione.** Aggiungere le sorgenti `journald`/`auth.log` e i log del database.

**B9 — P3 — Il parsing di nginx perde campi utili**
File: `logging/vector.yaml:26` e `infra/nginx.conf:13`.
- **Fatto.** La regex non cattura lo user agent, che pure è nel formato. Il formato non contiene `$request_time`, l'upstream né un ID della richiesta.
- **Effetto.** Si perdono segnali utili per riconoscere strumenti automatici.

**B10 — P3 — Dati personali nei log, da passare alla Privacy**
- **Fatto.** `login_failed` registra l'email digitata (`app/auth.js:15`), cioè anche indirizzi inesistenti o scritti male, e la conserva nell'archivio locale.
- **Raccomandazione.** Valutare minimizzazione o pseudonimizzazione insieme alla Privacy & Compliance Agency.

## C. Regole che non scattano

Le due tabelle hanno le stesse colonne:
- **Regola**: l'identificativo in `logging/detection-rules.yml`;
- **Perché**: perché non scatta;
- **Sul campione**: cosa sarebbe successo sull'estratto;
- **Gravità e correzione**: la sigla e cosa cambiare.

**PO-001 (righe 3–9)**

| Regola | Perché | Sul campione | Gravità e correzione |
|---|---|---|---|
| PO-001 | I dati non arrivano al SIEM (B1). Inoltre `group_by: [user]` con `count > 10` non vede lo spraying: un tentativo per utente. | 31 fallimenti in circa 4 minuti, massimo 1 per utente: non scatta. Nemmeno `a.bianchi`, con 3 fallimenti. | **P1.** Aggiungere una regola per `client_ip` con utenti distinti, ad esempio `distinct(user) > 10` in 10 minuti. Usare anche nginx come fonte: `POST /login` con 401 per `client_ip`, che oggi è l'unica che arriva. |

**PO-002 (righe 11–16)**

| Regola | Perché | Sul campione | Gravità e correzione |
|---|---|---|---|
| PO-002 | I dati non arrivano (B1). `ip` è sempre `172.18.0.5`, un indirizzo privato (B3). | `geoip` non dà risultati, quindi la regola non può scattare. | **P1.** Correggere B1, B3 e B4. Aggiungere «login riuscito dopo N fallimenti dallo stesso IP» e «login riuscito da un IP con spraying in corso»: sul campione A1 avrebbe allertato alle 03:05:12. |

**PO-003 (righe 18–21)**

| Regola | Perché | Sul campione | Gravità e correzione |
|---|---|---|---|
| PO-003 | L'evento è a livello debug (B2) e viene filtrato (B1). | Due esportazioni da 1,87 MB: non scatta. | **P1.** Correggere B2. Nel frattempo, una regola su nginx: `GET /api/admin/export/*` con qualunque esito di successo, più un'allerta sui `bytes` sopra una soglia. Aggiungere una regola sulle rotte `/api/admin/*` usate da un ruolo diverso da admin (serve B5). |

**PO-004 e PO-005**
- **PO-004** (righe 23–29): funziona in principio (nginx, 5xx). Sul campione non c'è nessun 5xx. Nessun rilievo.
- **PO-005** (righe 31–39): funziona su nginx, ma l'esclusione si basa su un IP falsificabile (B4). Gravità P2, già coperta da B4.

**Regole mancanti (P2)**
- Cambio di ruolo (B5): sempre almeno medium, high se fuori orario o subito dopo un login sospetto.
- Accesso amministrativo fuori orario.
- Reset della password seguito da login da un IP nuovo.
- Accesso al pannello admin da fuori `10.8.0.0/24`.
- Login SSH riusciti (B8).

## Limiti e aree non verificate

- Ho visto un solo estratto di 132 righe, del 19/11. Non ho verificato:
  - il contenuto reale del SIEM;
  - il livello pino effettivo in produzione (potrebbe esserci `LOG_LEVEL` nell'`.env`, che non è nel repository);
  - il codice del container `admin`;
  - chi è l'utente 57 e quale ruolo ha ricevuto;
  - le righe esportate;
  - le sessioni VPN.
- La compromissione di `l.verdi` è una forte ipotesi dalla correlazione, non un fatto provato.
- Questa analisi non è una certificazione della sicurezza del portale.

## Piano della nuova verifica

1. Dopo la correzione di B1 e B2: un login fallito, un login riuscito e un'esportazione di prova compaiono nel SIEM con il livello e i campi attesi.
2. Dopo B3 e B4: una richiesta con `X-Forwarded-For` falso registra l'IP reale sia in nginx sia nell'app.
3. Rieseguire le regole PO-001, PO-002 e PO-003 e le nuove regole sull'estratto del 19/11. Devono allertare almeno a 02:59 (spraying), 03:05:12 (login dopo lo spraying), 03:06:31 (esportazione) e 03:07:05 (cambio di ruolo).
4. Verificare che la conservazione arrivi a 90 giorni.

## Passaggi di consegne

- **Responsabile umano dell'incidente e Incident Response (AICA).** A1 e preservazione delle evidenze.
- **Privacy & Compliance.** Valutazione della violazione dei dati dei clienti, B10.
- **Software/AppSec.** `requireAdmin` in `app/auth.js:55`, eventi di audit B5.
- **Network/Cloud Security.** B4, B7, B8 (porte 22 e 8000-8100 aperte, `/metrics` pubblico).
- **IAM.** `l.verdi` senza MFA, `customers:export` assegnato all'operator in `iam/roles.yaml:7`.

Lo segnalo come da regola del reparto: sono su Opus, il modello della sessione. Il P0 e i P1 restano comunque proposte finché il direttore AICA-01 e il responsabile umano non li confermano.

— SAIPH (AICA-07)
