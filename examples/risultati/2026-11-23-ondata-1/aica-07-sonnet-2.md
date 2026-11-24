**AICA-07 · SAIPH — Senior SOC & Threat Detection Analyst, reparto AICA (AI Cybersecurity)**

# Rapporto: copertura log, regole di rilevamento e archivio del 2026-11-19

## Sintesi
Il SIEM non riceve gli eventi applicativi su cui poggiano 3 delle 5 regole, quindi PO-001, PO-002 e PO-003 sono inattive. Nell'estratto c'è un'intrusione probabile, che nessuna regola rileva. In sequenza:
- password spraying su 27 utenti;
- login riuscito dallo stesso IP;
- due esportazioni dell'anagrafica clienti e un cambio di ruolo.

Analisi documentale e passiva, solo lettura. Gli utenti sono riportati per ruolo, non in chiaro. Non è una certificazione.

**P0 segnalato subito:** l'intrusione al punto A1 va portata subito al responsabile umano.

## Perimetro e metodo
- Esaminati `app/*.js`, `logging/vector.yaml`, `logging/detection-rules.yml`, `logging/samples/archive-2026-11-19.log` (132 righe).
- Per il contesto ho letto `infra/nginx.conf` e la riga di `iam/access-review-2026-11.csv` che riguarda l'utente coinvolto.
- Non ho eseguito nulla e non ho consultato la biblioteca (non disponibile in questa prova).
- Nell'estratto non c'è alcun evento di errore 5xx.

## A. Attività sospette nell'archivio

### A1 · P0 — Probabile compromissione di un account e possibile esfiltrazione
Il responsabile umano dovrebbe valutarla subito, anche come possibile violazione di dati (da passare a Privacy).

**Fatti** (`logging/samples/archive-2026-11-19.log`):
- Righe 18–79: 27 `login_failed` in circa 4 minuti (02:58:03–03:02:01) dall'IP 203.0.113.77, su 27 utenti diversi, uno solo per utente. Sono account interni (`@ferramentanord`) e di clienti (`@clienti`).
- Riga 86–87: alle 03:05:12 lo stesso IP fa un `login_success` per l'utente `l.verdi`.
- Dalla stessa sessione:
  - riga 89: `GET /api/orders?limit=200`;
  - riga 91: `GET /api/admin/users`;
  - righe 93 e 97: `GET /api/admin/export/customers`, due volte, 1.873.344 byte ciascuna;
  - riga 95: `POST /api/admin/users/57/role`, esito 200.

**Osservazioni:**
- Il cambio ruolo dell'utente 57 può essere una persistenza o un'escalation di privilegi. Il ruolo assegnato non è visibile.
- `iam/access-review-2026-11.csv` riga 3 dice che l'utente è un `operator`, con MFA "no".
- `app/auth.js:55` (`requireAdmin`) lascia passare qualsiasi ruolo diverso da `customer`, quindi anche un operatore arriva alle rotte admin. Lo passo a Software Agency e a AICA IAM.

**Ipotesi:** credenziali di `l.verdi` indovinate o riutilizzate, da confermare. Nessun segnale di falso positivo: l'orario è notturno (03:05) e l'IP è esterno.

**Azioni raccomandate** (decisioni al responsabile umano):
- preservare i log;
- valutare il blocco della sessione e il reset delle credenziali di `l.verdi`;
- verificare il ruolo dell'utente 57;
- coinvolgere Privacy & Compliance per l'esportazione clienti (dati personali, possibile data breach).

### A2 · Rumore benigno, nessun intervento
- Righe 1–121: `GET /status` con 404 ogni 30 secondi da 198.51.100.20. È una sonda periodica ed è già esclusa da PO-005 (`detection-rules.yml:38`). Sotto soglia comunque: circa 20 richieste ogni 10 minuti contro una soglia di 100.
- Righe 122–129: tre errori e poi un successo per un utente interno, dal client 10.8.0.10 (VPN). Comportamento da errore di digitazione, non rilevante.
- Righe 130–132: login e ordine da 93.40.11.8 per un cliente. Non c'è base per giudicarlo anomalo. Il paese abituale dell'utente non è verificabile da questo estratto.

## B. Regole che non scattano

| Regola | Esito sull'estratto | Causa | Gravità |
|---|---|---|---|
| PO-001 brute force (`detection-rules.yml:3-9`) | Non scatta | Raggruppa per `user` con soglia >10 in 5 minuti. Lo spraying ha 1 tentativo per utente, quindi non si supera mai. Inoltre gli eventi non arrivano al SIEM (C1). | P1 |
| PO-002 paese nuovo (`:11-16`) | Non scatta | `login_success` non arriva al SIEM (C1). Anche se arrivasse, `ip` è l'IP interno del proxy (C3), quindi la geolocalizzazione non ha senso. | P1 |
| PO-003 export massivo (`:18-21`) | Non scatta | L'evento è emesso a livello debug (C1). Il campo `rows` esiste solo lì. | P1 |
| PO-004 picco 5xx (`:23-29`) | Potrebbe scattare | Nessun 5xx nell'estratto, quindi nessun difetto verificato. Vedi C7 sui tipi. | P3 |
| PO-005 scansione 404 (`:31-38`) | Potrebbe scattare | Non scatta per soglia e per esclusione, comportamento corretto. | P3 |

## C. Lacune di copertura

**C1 · P1 — Filtro del livello che scarta i log di sicurezza** (`logging/vector.yaml:17-21`; `app/auth.js:15,18`; `app/orders.js:53`)
- Il filtro `app_filtered` inoltra al SIEM solo `.level >= 40`.
- `login_failed` e `login_success` sono emessi con `req.log.info` (livello 30). `admin_export` è `req.log.debug` (livello 20, `app/orders.js:53`).
- Nessuno dei tre eventi raggiunge il SIEM (sink `inputs` a `vector.yaml:35`). Restano solo nell'archivio locale con rotazione di 7 giorni.
- Correzione: filtrare per presenza di `.event` invece che per livello, oppure emettere gli eventi di sicurezza a livello warn. Poi riverificare con l'archivio.

**C2 · P1 — Nessun log di audit sulle azioni sensibili** (verificato con grep, non ci sono altre chiamate di log in `app/`)
- Non si registrano:
  - cambio di ruolo (`app/auth.js:63`);
  - elenco utenti (`:59`);
  - reset e richiesta password (`:24,35`);
  - upload e download file;
  - import XML;
  - test webhook (`app/orders.js:13`);
  - rifiuti 401 e 403 (`requireUser`, `requireAdmin`).
- L'export dei clienti è registrato senza chi l'ha eseguito (manca `req.user.sub`).
- Il cambio di ruolo alle 03:07:05 è visibile solo come riga nginx. Per questo A1 è ricostruibile solo in parte.
- Correzione: aggiungere eventi di audit con `actor`, `target` e `result`, senza dati personali superflui.

**C3 · P2 — IP del client non affidabile e mancante nei log applicativi**
- `app/server.js:12` usa `req.socket.remoteAddress`, che nei log vale sempre 172.18.0.5 (il proxy).
- In nginx, `set_real_ip_from 0.0.0.0/0` con `real_ip_header X-Forwarded-For` (`infra/nginx.conf:9-10`) rende falsificabile `client_ip`. Un attaccante può eludere le regole per IP (PO-005 e le future regole per IP) e inquinare gli indicatori.
- Correzione: limitare `set_real_ip_from` ai proxy attendibili e propagare l'IP reale all'app.

**C4 · P2 — Parsing JSON fragile e identità del servizio fissa**
- `parse_json!` con abort (`vector.yaml:15`) scarta in silenzio le righe non JSON, per esempio quelle del container `admin`, incluso nella sorgente (`:5`).
- A `vector.yaml:16` il servizio è fisso a `"portale-ordini"` anche per `admin`.
- Correzione: usare un parsing con fallback e gestione degli errori, ed etichettare il servizio dal container.

**C5 · P2 — Conservazione breve dell'archivio locale** (`vector.yaml:45`)
- Rotazione di 7 giorni. Per incidenti rilevati in ritardo l'evidenza viene persa.
- Il periodo va deciso da DPO e responsabile della sicurezza: l'archivio contiene email, quindi la durata va bilanciata con la minimizzazione. Il sink SIEM non ha buffer su disco né riprova configurati, quindi un'interruzione perde eventi.

**C6 · P3 — Dati personali nei log**
- `app/auth.js:15,18` registra l'email nel campo `user` anche per tentativi falliti su indirizzi inesistenti.
- Non è un segreto, ma è un dato personale e un possibile vettore di iniezione nei log: da valutare con Privacy.
- La `redact` di pino (`app/server.js:7`) punta a `req.headers.authorization` e `body.password`, percorsi che il logger non emette mai: è inefficace, ma al momento non c'è nulla da proteggere.

**C7 · P3 — Campi non verificabili dalla configurazione**
- Nell'archivio le righe nginx contengono `"source": "nginx"`, `status` e `bytes` numerici, ma `vector.yaml` non aggiunge `source` e `parse_regex` restituisce stringhe.
- Il campo `source` serve a PO-004 e PO-005 (`detection-rules.yml:25,32`). Potrebbe essere aggiunto altrove nella catena (ipotesi).
- Va verificato nel SIEM che arrivino con i tipi attesi, altrimenti le due regole non scattano.

## D. Regole da aggiungere (proposte)
Gli scenari sono in bozza, da validare sul SIEM reale per ridurre i falsi positivi.
1. **P1 — Spraying per IP:** `login_failed` raggruppato per `client_ip`, più di 10 utenti distinti in 10 minuti.
2. **P1 — Successo dopo una serie di errori:** `login_success` da un IP con almeno 5 `login_failed` nei 15 minuti precedenti.
3. **P1 — Cambio di ruolo:** ogni modifica di ruolo, e chiamate a `/api/admin/*` da un utente non admin o da un IP mai visto.
4. **P2 — Esportazione ripetuta:** `GET /api/admin/export/customers` più di una volta in un'ora, basata su nginx, e quindi indipendente da C1.
5. **P2 — 401/403 in serie** su rotte `/api/*` per IP.

## Limiti
- Non ho potuto verificare la configurazione reale del SIEM, la storia dei paesi per utente né quale ruolo abbia assegnato la richiesta sull'utente 57.
- Non ho letto `upload.js` e `db.js` oltre il grep dei log.
- La correzione di `requireAdmin` è area Software Agency e il perimetro privacy dell'esportazione è di Privacy & Compliance: non li ho valutati.

**Nota sul modello:** lavoro su Sonnet. Per il P0 (A1) e i P1 (B, C1, C2) propongo il riesame del direttore AICA-01 o di un revisore su Opus prima che diventino definitivi.

— AICA-07 · SAIPH
