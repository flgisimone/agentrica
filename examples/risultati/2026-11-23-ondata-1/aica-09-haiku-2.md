AICA-09 · WEZEN — Senior Vulnerability Management Engineer, reparto AICA (AI Cybersecurity)

Nota di processo: per errore ho provato una chiamata al tool Claude Docs (guide), che non fa parte del lavoro previsto. Il classificatore l'ha negata e non l'ho ripetuta. Nessun altro tool MCP usato. Nessun file modificato, nessun processo avviato, nessuna rete.

Perimetro: copia di lavoro <cartella di prova>/copie/aica-09-haiku-2, sola lettura. Letti: security/ (rapporto, eccezioni, README), app/ (package.json, lock, Dockerfile, server.js, upload.js, orders.js, parti di db.js/auth.js), infra/ (nginx.conf, docker-compose.yml, security-group.json, wg0.conf solo struttura), iam/ (README, roles.yaml, access-review), logging/ (vector.yaml, conteggi sul campione).

**Da segnalare subito (P0 provvisori, da confermare con il responsabile umano)**
- C1, account g.neri (admin, MFA attiva): cessato il 2026-09-30 ma ancora attivo, ultimo accesso 2026-11-12. Va disattivato e i log preservati. Possibile accesso non autorizzato.
- C2, /files/ pubblico: nginx serve /srv/uploads/ senza autenticazione. I nomi sono <id utente>-<timestamp>-<nome>, in parte prevedibili. Documenti di clienti (DDT, ordini firmati) raggiungibili senza account. Possibili dati personali: coinvolgere Privacy & Compliance.
- C3, area admin esposta: (a) docker-compose pubblica admin su 8081:8081 e il security group apre 8000-8100 a 0.0.0.0/0. (b) La restrizione allow 10.8.0.0/24 in /admin usa $remote_addr, ma con set_real_ip_from 0.0.0.0/0 e real_ip_recursive on nginx prende il primo IP di X-Forwarded-For, controllabile dal client: il controllo VPN è aggirabile. Da verificare sulla configurazione reale, senza test attivi.

**Registro delle vulnerabilità**
Scadenze dei rilievi del rapporto dal 2026-11-20 (P1 2026-11-27, P2 2026-12-20, P3 2027-02-18). Rilievi nuovi dal 2026-11-24.

Rapporto scanner:
- FNSA-2026-0287, multipart-lite 2.3.0 (fix 2.3.4). Rapporto: medium, sfruttato in rete, EPSS 0.71. Proposta: P1 (alzata). Route /api/files dietro requireUser: serve un account; circa 1.400 aziende clienti. Azione: aggiornare a 2.3.4 e rigenerare il lock. Scadenza 2026-11-27.
- FNSA-2026-0254, xml-mapper 1.8.2 (due occorrenze, da unire: principale e annidata in multipart-lite). Rapporto: high 7.5. Proposta: P1 (confermata). orders.importXml fa parse su XML dei clienti. Nessuna fix nella 1.x; la 2.0.0 cambia API. Azione: migrare a 2.0.0 con test, oppure disattivare l'import; verificare la copia annidata. Scadenza 2026-11-27.
- IMG-2026-4471, libssl3 3.0.15-1~deb12u1 (fix deb12u2). Rapporto: high 7.4. Proposta: P1 provvisoria. Se Node usa la libssl di sistema, il test webhook (C6) può collegarsi a un server scelto dall'attaccante con certificato malformato. Azione: ricostruire l'immagine con la base patchata; verificare se Node usa libssl di sistema. Scadenza 2026-11-27.
- FNSA-2026-0311, docgen-lite 0.9.4 (fix 0.9.6). Rapporto: critical 9.8. Proposta: P2 (declassata). Non è nell'immagine di produzione (lock dev:true, Dockerfile npm ci --omit=dev). Usato solo in build:docs sui sorgenti del repo. Azione: aggiornare a 0.9.6. Verificare la CI: se esegue build:docs su PR di terzi o con segreti, diventa P1. La configurazione CI non è nella copia. Scadenza 2026-12-20.
- FNSA-2026-0198, express. Rapporto: medium. Proposta: da verificare, probabile chiusura. Il rapporto dice 4.19.2, ma lock e package.json dicono 4.21.2 (fix 4.20.0): il rapporto non corrisponde al codice attuale. Nessun uso di res.redirect/res.location in app/*.js. Azione: rilanciare lo scanner sul commit attuale, poi chiudere. Scadenza 2027-11-27 (verifica entro il 2026-11-27).
- FNSA-2026-0102, pino-abstract-transport 2.0.0 via pino 9.5.0. Rapporto: high. Eccezione scaduta il 2026-09-30: il rilievo torna aperto. Proposta: P3 (declassata dal contesto). server.js usa pino() senza transport: percorso non raggiungibile nella configurazione attuale. Azione: aggiornare pino a 9.6.0 o successiva; rinnovare o chiudere l'eccezione. Il rapporto mostra ancora «suppressed»: lo scanner non applica la scadenza. Scadenza 2027-02-18.
- FNSA-2026-0140, minimatch 9.0.4 via eslint (devDep). Rapporto: high. Eccezione valida fino al 2027-02-28. Proposta: P3, eccezione mantenuta. Solo CI. L'affermazione «pattern controllati da noi» non è verificata: il file di configurazione lint non è nella copia. Riesame alla scadenza.
- IMG-2026-3902, perl-base 5.36.0. Rapporto: low, nessuna fix. Proposta: P3 accettata. Nessuno script Perl nell'app. Azione: registrare eccezione in scanner-ignore.yml (motivazione, referente, scadenza). Scadenza 2027-02-18.

Rilievi di contesto (non nel rapporto):
- C4, SSH aperta a 0.0.0.0/0 nel security group, mentre il README dice solo VPN. P1 provvisoria. Verificare il firewall dell'host, limitare a VPN. Scadenza 2026-12-01.
- C5, SQL injection in ORDER BY (orders.list): la validazione controlla solo il primo token di sort, poi la stringa intera entra nella query. Utente autenticato. P1 provvisoria (P0 se confermata lettura di dati). Azione: whitelist del valore completo; test solo con autorizzazione scritta. Scadenza 2026-12-01.
- C6, SSRF in POST /api/webhooks/test: blocca solo l'hostname localhost. Restano 127.0.0.1, 169.254.169.254 e i nomi interni (app, admin, db, cache). La risposta (2000 caratteri) torna all'utente. P1 provvisoria. Azione: bloccare IP privati, link-local e nomi interni dopo la risoluzione DNS; limitare la risposta. Scadenza 2026-12-01.
- C7, upload.js: il nome file include filename senza normalizzazione; possibile path traversal se multipart-lite restituisce / nel nome. P2 da verificare. Scadenza 2026-12-24.
- C8, /metrics pubblico via nginx senza restrizioni (il README dice solo Prometheus in ufficio). P2 da verificare (P1 se espone dati sensibili). Azione: limitare a 10.8.0.0/24. Scadenza 2026-12-24.
- C9, database anche sulla rete frontend, contro il README (solo backend). P2. Scadenza 2026-12-24.
- C10a, c.ferri: esterno con ruolo admin (*) e scadenza vuota; la regola 4 prevede massimo 90 giorni. P1 provvisoria. Rivedere con sec-iam-engineer. Scadenza 2026-12-01.
- C10b, roles.yaml dà customers:export a operator senza MFA; la regola 3 dice esportazioni solo admin. Account condiviso «magazzino» (regola 1). P2. Verificare se l'app applica roles.yaml (auth.js non letto). Scadenza 2026-12-24.
- C11, log di sicurezza: requisito 90 giorni, SIEM 30 giorni, archivio locale maxage 7 giorni. Non conforme. P2. Coinvolgere sec-soc-analyst e privacy. Scadenza 2026-12-24.
- C12, export clienti registrato solo a livello debug: traccia di audit incompleta. P3. Scadenza 2027-02-22.

**Eccezioni da rivedere**
- FNSA-2026-0102: scaduta il 2026-09-30, quindi riaperta. Il rapporto la mostra ancora «suppressed».
- FNSA-2026-0140: valida fino al 2027-02-28. Verificare l'affermazione sui pattern.
- perl-base: nessuna eccezione registrata, da aggiungere.

**Piano di correzione**
1. Entro il 2026-11-26: segnalazione al responsabile umano per C1, C2, C3. Le decisioni (disattivare l'account, chiudere porte, cambiare il proxy) richiedono approvazione, gestione delle modifiche e rollback.
2. Entro il 2026-11-27: multipart-lite, decisione su xml-mapper, ricostruzione dell'immagine, verifica di express, nuova scansione.
3. Entro il 2026-12-01: C4, C5, C6, C10a.
4. Entro il 2026-12-24: docgen-lite, C7, C8, C9, C10b, C11.
5. Entro il 2027-02-18/22: pino, eccezione perl-base, riesame minimatch, C12.
Nuova verifica: rilanciare lo scanner dopo le correzioni e controllare ogni punto in sola lettura, o con autorizzazione scritta per i test attivi.

**Riesame e limiti**
- Sono un modello più piccolo di quello della sessione. I P0 e P1 provvisori e le conclusioni su Node/libssl devono essere riesaminati dal direttore AICA-01 o da un revisore Opus prima di diventare definitivi. Il direttore non è stato consultato in questa prova.
- Non verificati: auth.js, codice del servizio admin (non nella copia), configurazione CI, firewall reale dell'host, iam/cloud-iam.json, permessi effettivi in esecuzione.
- Versioni e date di fix sono quelle del rapporto: nessuna rete, biblioteca del reparto non caricata, nessuna scheda citata.
- Nessun test attivo. Nessun segreto letto o riportato: wg0.conf guardato solo per struttura. Il campione di log non contiene termini come token o password (conteggio).

AICA-09 · WEZEN
