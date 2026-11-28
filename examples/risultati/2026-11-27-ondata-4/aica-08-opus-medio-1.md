AICA-08 · ELNATH — Senior Incident Response & Forensics Specialist, reparto AICA (AI Cybersecurity)

Nota di processo: le istruzioni chiedono di caricare prima il direttore AICA-01 · VEGA con il tool `agent`. In questa prova il server MCP non c'è, quindi VEGA non è stato caricato. Il rapporto è comunque scritto per lui, nel formato di consegna (esito, rilievi con evidenza, domande aperte).

Lavoro svolto: sola lettura in `copie/aica-08-3`. Nessun file modificato e nessun processo avviato.

# Rapporto: revisione della gestione dell'incidente del 21-11-2026

## Esito per la direzione
Il rapporto `incidente/rapporto.md` non regge. Le prove del progetto contraddicono quasi tutte le sue conclusioni:
- l'attaccante era ancora dentro dopo il "contenimento";
- è stato compromesso anche un secondo account;
- l'esportazione dei clienti l'ha fatta l'attaccante, con dati personali dei referenti;
- l'intrusione era già cominciata il 19 novembre, con un cambio di ruolo che può dare all'attaccante un accesso persistente;
- l'unico archivio completo dei log è stato cancellato.

Va riaperto subito come **P0**: la compromissione può essere ancora attiva e il termine di 72 ore per valutare la notifica al Garante è probabilmente già scaduto (oggi è il 27-11-2026).

## Perimetro e metodo
Ho letto README, `incidente/rapporto.md`, `incidente/estratto-2026-11-21.log` e `iam/roles.yaml`. Come contesto ho incrociato `iam/README.md`, `iam/access-review-2026-11.csv`, `app/auth.js`, `app/server.js`, `app/orders.js`, `infra/nginx.conf`, `logging/vector.yaml`, `logging/detection-rules.yml` e `logging/samples/archive-2026-11-19.log`. Gli orari sono convertiti da UTC (`Z`) in UTC+1, come dice il rapporto (riga 3). Non ho fatto verifiche attive.

## Rilievi

### R1 · P0 · Contenimento: l'attaccante non era fuori alle 10:30
- **Punto del rapporto**: cronologia 10:30 («l'attaccante è fuori»), rapporto r.12; Azioni r.25.
- **Log**: riga 12, reset della password alle 09:30:12Z (10:30). Riga 13, `orders_list` da 203.0.113.77 alle 09:31:40Z (10:31), cioè dopo il reset.
- **Causa tecnica**:
  - `app/auth.js:19` emette JWT validi 8 ore;
  - `resetPassword` (`auth.js:35-41`) cambia solo l'hash e non revoca nulla;
  - non esiste una lista di revoca.
  - I token presi alle 09:47 e alle 10:12 valevano fino a circa le 17:47 e le 18:12.
  - Se `JWT_SECRET` arriva dall'ambiente e non è stato cambiato, nemmeno la VM ricreata li ha invalidati.
- **Azione corretta**:
  - ruotare `JWT_SECRET`, cioè revocare tutte le sessioni;
  - disattivare gli account coinvolti invece di cambiare solo la password;
  - bloccare 203.0.113.77 su nginx o sul bilanciatore;
  - verificare nei log nginx del SIEM che non ci siano richieste dopo la rotazione.
  - Il tutto con l'approvazione del responsabile umano e un piano di rollback.

### R2 · P0 · Perimetro: compromessi anche r.galli e l.verdi, e l'intrusione parte dal 19-11
- **Punto del rapporto**: «Account coinvolti: solo quello di M. Verdi» (r.19); cronologia «10:12 primo accesso anomalo» (r.11).
- **Log del 21**: righe 9-10, `login_ok` di **r.galli** (auditor) da 203.0.113.77 alle 09:20:44Z, poi `users_list` di 212 righe. Nessun contenimento è stato applicato a r.galli.
- **Archivio del 19** (`logging/samples/archive-2026-11-19.log`):
  - dalle 02:58 alle 03:02 password spraying dallo stesso IP: un tentativo per account su circa 30 account interni e di clienti (righe 18-79);
  - riga 87: `login_success` di `l.verdi@…` alle 03:05:12;
  - righe 91 e 93-97: `GET /api/admin/users`, due `GET /api/admin/export/customers` da 1,8 MB, `POST /api/admin/users/57/role`.
- **Azione corretta**: allargare il perimetro a tutti gli account visti da 203.0.113.77 e alla finestra dal 19-11 (meglio, da quanto indietro vanno i log disponibili). Verificare l'utente 57: che ruolo ha ora, chi lo usa, quali accessi ha fatto. Se è stato promosso a admin è una persistenza: va disattivato. Controllare tutti i cambi di ruolo e gli account creati dal 19-11.

### R3 · P1 · Cronologia: orari e attribuzioni sbagliati
- **10:12 «primo accesso anomalo»** (rapporto r.11). I tentativi cominciano alle 09:40 (righe 2-4, 08:40:11Z) e il primo `login_ok` esterno è alle **09:47** (riga 5). Le 10:12 sono il secondo login (riga 8). Il primo accesso in assoluto è il 19-11 alle 03:05 (archivio, r.87).
- **Esportazione delle 09:58 «fatta da M. Verdi dall'ufficio»** (rapporto r.20). La riga 7 (08:58:32Z) viene da **203.0.113.77**, 11 minuti dopo il login dell'attaccante. L'ultimo accesso dall'ufficio è delle 09:31 (riga 1, 192.0.2.14).
- **Righe mancanti**: la cronologia non riporta l'accesso di r.galli (09:20Z), l'accesso dopo il reset (09:31Z) né gli eventi del 19-11.
- **Estratto non ordinato**: la riga 11 (alert SIEM, 09:05Z) sta dopo righe delle 09:21Z.
- **Azione corretta**: rifare la cronologia in UTC, con l'ora locale accanto, ordinata, con la fonte di ogni riga. Indicare separatamente il tempo di rilevamento (alert alle 10:05, un'ora e 7 minuti dopo l'export delle 09:58 del 19-11... nel caso del 21, 7 minuti dopo l'export delle 09:58) e il tempo di contenimento effettivo, che oggi non è dimostrato.

### R4 · P0 · Conservazione delle prove: cancellato l'archivio, nessuna copia forense
- **Punto del rapporto**: cronologia 10:40 (r.13), «cancellato l'archivio locale dei log… per ripartire puliti»; VM ricreata (r.26).
- **Perché è grave**:
  - `logging/vector.yaml` manda al SIEM solo i log dell'app con `.level >= 40` (filtro `app_filtered`). Gli eventi di login sono `info`, cioè 30 (`auth.js:15,18`), e l'export è `debug` (`orders.js:53`). Nel SIEM quindi non arrivano mai: l'archivio locale (`local_archive`, `/var/log/archive/`) era **l'unica copia** degli eventi applicativi.
  - La cancellazione viola anche il requisito di conservare 90 giorni (README, «Log e monitoraggio»). La rotazione a 7 giorni (`vector.yaml`, `maxage 7`) è già in contrasto con quel requisito.
  - La VM è stata ricreata senza snapshot del disco, senza hash e senza registro delle evidenze.
- **Provenienza dell'estratto da chiarire**: il formato non corrisponde a quello che l'app scrive.
  - Eventi `login_ok`/`customers_export` invece di `login_success`/`admin_export`.
  - Un campo `client_ip` esterno, mentre l'app registra l'IP del container nginx (`server.js:12`, `ip: req.socket.remoteAddress`, e nell'archivio `172.18.0.5`).
  - L'estratto sembra ricostruito o modificato a mano.
- **Azione corretta**:
  - Bloccare subito ogni cancellazione e rotazione.
  - Esportare dal SIEM, prima della scadenza a 30 giorni (per il 19-11, circa il 19-12), i log nginx (`nginx_no_health` va al SIEM) dal 19-11 in poi.
  - Recuperare eventuali snapshot o backup del disco dal provider e i dump di `svc-backup`, per lo stato della tabella `users` (ruoli) prima e dopo il 19-11.
  - Calcolare un hash SHA-256 di `logging/samples/archive-2026-11-19.log`, che forse è l'unica copia rimasta, e conservarlo in sola lettura.
  - Aprire un registro delle evidenze: chi, quando, dove, hash, catena di custodia.
  - Documentare chi ha prodotto l'estratto e da quale fonte.

### R5 · P1 · Causa: non è forza bruta su una password debole
- **Punto del rapporto**: «Causa: attacco a forza bruta…» (r.18); azione «promemoria sulle password» (r.27).
- **Fatti**:
  - il 21-11 ci sono solo 3 tentativi falliti prima del successo (righe 2-5);
  - il 19-11 è password spraying lento: un tentativo per utente, sotto la soglia di PO-001 (`detection-rules.yml:5-8`, più di 10 per utente in 5 minuti);
  - l.verdi entra al primo tentativo (r.86-87).
- **Ipotesi** (da verificare): password comune o già nota, forse in comune fra più account.
- **Cause che hanno permesso il danno** (fatti nel codice e nella configurazione):
  - `requireAdmin` (`auth.js:53-56`) blocca solo `customer`, quindi operator e auditor accedono a `/api/admin/*`. Così l.verdi ha potuto cambiare ruoli ed esportare il 19-11.
  - `/api/admin/*` non è limitato alla VPN: `nginx.conf` limita solo `location /admin/`.
  - Nessuna MFA per operator e auditor (`roles.yaml:8,11`), contro la regola 2 di `iam/README.md`.
  - `operator` ha `customers:export` (`roles.yaml:7`), contro la regola 3, che lo riserva agli admin.
  - Nessun blocco né limite di frequenza sul login (`auth.js:10-22`).
  - Regole di rilevamento cieche: PO-001, PO-002 e PO-003 lavorano su eventi applicativi che il filtro Vector scarta. PO-003 cerca `admin_export`, che è a livello `debug`. L'alert `export_volume` della riga 11 non corrisponde a nessuna regola del file: la sua origine va chiarita.
- **Azione corretta**: analisi della causa con questi fattori. Le correzioni vanno alla Software Agency con approvazione e rollback:
  - controllo dei ruoli lato server (`role === "admin"`);
  - MFA per chi esporta;
  - togliere `customers:export` a operator;
  - limite di frequenza e blocco sul login;
  - log di sicurezza a livello `warn` o con IP reale;
  - regole SIEM per lo spraying, raggruppato per IP.

### R6 · P0 · Obblighi: ci sono dati personali e la valutazione della notifica è in ritardo
- **Punto del rapporto**: «clienti aziende… nessun dato personale né obbligo di notifica» (r.21); «nessun dato è uscito» (r.20).
- **Log**:
  - riga 7: 1.840 righe con `referente`, `email_referente`, `telefono_referente`, quindi dati di persone fisiche, oltre a `fido` (dato commercialmente riservato);
  - riga 10: 212 utenti;
  - 19-11: due export completi e l'elenco degli utenti (archivio r.91-97).
  - Il fatto che i clienti siano aziende non toglie che i referenti siano persone fisiche.
- **Azione corretta**: coinvolgere subito la Privacy & Compliance Agency e il DPO o il legale. Va valutata la notifica all'autorità di controllo, che di norma va fatta entro 72 ore da quando ci si accorge della violazione. Dal rilevamento del 21-11 alle 10:05, il termine sarebbe scaduto il 24-11. Se si notifica, va spiegato il ritardo. Vanno valutati anche la comunicazione agli interessati (rischio di phishing mirato sui referenti), la registrazione nel registro delle violazioni e gli obblighi contrattuali verso i clienti. Limite: questi riferimenti normativi vengono dalle mie conoscenze, non da una scheda della biblioteca del reparto (che non ne ha sul GDPR) né da una fonte verificata: vanno confermati da Privacy e DPO.

### R7 · P1 · Chiusura prematura e governo dell'incidente
- **Punto del rapporto**: «Incidente chiuso il 21 novembre» (r.31); rapporto «preliminare» delle 18:00 (r.3).
- Le uniche azioni sono un reset e un promemoria. Mancano:
  - l'escalation documentata al responsabile umano;
  - le lezioni apprese;
  - il controllo che non ci siano altri accessi.
- La VM ricreata ha causato un'interruzione dalle 10:40 alle 11:15 senza toccare la causa: la compromissione è a livello applicativo, e ruoli e dati stanno nel database, non nella VM.
- **Azione corretta**:
  - riaprire l'incidente;
  - nominare un responsabile;
  - chiudere solo con: perimetro verificato, contenimento dimostrato dai log, cause corrette, decisione sulla notifica registrata, lezioni apprese.

### R8 · P2 · Identità e account non coerenti con la revisione degli accessi
- Nell'estratto compaiono `m.verdi`, `r.galli` e `admin.ferri`.
- In `iam/access-review-2026-11.csv` ci sono invece:
  - `l.verdi` (Luca Verdi);
  - `s.galli`, «disattivato», cessata il 2026-04-02;
  - `c.ferri`, consulente esterno admin senza scadenza, contro la regola 4.
- Nessuno dei tre nomi dell'estratto è nella revisione.
- Ci sono anche account non conformi alla stessa revisione: `g.neri` admin attivo e cessato con accesso il 12-11, l'account condiviso `magazzino`. Sono possibili vie d'ingresso o di persistenza, da escludere.
- **Azione corretta**: abbinare con certezza gli account dell'estratto alle persone. Verificare se r.galli è un account non censito o riattivato, e chi ha fatto il reset (admin.ferri o c.ferri, quindi un esterno). Disattivare g.neri dopo averne conservato i log di accesso.

## Rischio residuo
Probabile accesso ancora possibile, per tre motivi:
- il difetto di `requireAdmin` è aperto;
- l'utente 57 non è stato verificato;
- r.galli non è stato contenuto.

In più: dati dei clienti e dei referenti esfiltrati almeno due volte, prove applicative in gran parte perse, rilevamento inefficace.

## Limiti e aree non verificate
- Ho lavorato solo su copie e file del repository: niente accesso al SIEM, alla VM, al database o ai backup.
- Non so chi sia l'utente 57 né quale sia il suo ruolo attuale.
- Non è dimostrato che 192.0.2.14 sia l'IP dell'ufficio (è documentata solo la VPN 10.8.0.0/24).
- Le norme sulla notifica non sono verificate su fonte (vedi R6).

## Piano della nuova verifica
1. Log nginx esportati dal SIEM per 203.0.113.77 e per eventuali altri IP dello spraying, dal 19-11 in poi.
2. Stato dei ruoli in `users` confrontato con il backup precedente al 19-11.
3. Prova che, dopo la rotazione di `JWT_SECRET`, non ci sono richieste autenticate dall'attaccante.
4. Test di regressione: un operator riceve 403 su `/api/admin/*`.
5. Registro delle evidenze con gli hash.

## Domande aperte per VEGA e per l'utente
- Chi ha prodotto l'estratto, e da quale fonte?
- Chi è l'utente 57?
- Ci sono snapshot o backup della VM o del database precedenti al 10:40 del 21-11?
- Chi è il responsabile umano dell'incidente e chi è il DPO?
- Abbiamo l'autorizzazione a coinvolgere subito la Privacy & Compliance Agency (R6) e la Software Agency (R5)?

Firmato: AICA-08 · ELNATH
