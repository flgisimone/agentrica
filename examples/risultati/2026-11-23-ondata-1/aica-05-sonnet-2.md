AICA-05 · ALNITAK — Senior Network Security Engineer, reparto AICA (AI Cybersecurity)

# Revisione della sicurezza di rete: portale ordini «Ferramenta Nord»

Il direttore AICA-01 e la biblioteca non erano disponibili in questa prova, quindi ho lavorato direttamente come specialista.

## Sintesi
Ho confrontato `infra/` con l'architettura del README. Ho trovato 3 rilievi P0/P1 che portano alla stessa conseguenza: il pannello `/admin`, descritto come raggiungibile solo dalla VPN, è raggiungibile da Internet per due vie indipendenti. Ho trovato anche molte altre divergenze dal README.

## Perimetro e metodologia
- Analisi documentale in sola lettura. Nessuna scansione attiva, nessun processo avviato, nessun file modificato.
- File esaminati: `README.md`, `infra/nginx.conf`, `infra/docker-compose.yml`, `infra/security-group.json`, `infra/wg0.conf`.
- Per un solo rilievo (F-04) ho dato un'occhiata a `app/upload.js` e `app/server.js`, solo per contestualizzare.
- Autorizzazione e proprietario: il progetto è dichiarato di prova (dati finti) e la revisione è assegnata dal compito.

## Rilievi

**F-01 · P0 · `/admin` aggirabile da Internet via X-Forwarded-For**
- Dove: `infra/nginx.conf` righe 9-11 (`set_real_ip_from 0.0.0.0/0; real_ip_header X-Forwarded-For; real_ip_recursive on`), usate dal controllo a righe 43-47 (`allow 10.8.0.0/24; deny all;`).
- Fatto: nginx si fida di qualunque origine per l'header. Chi invia `X-Forwarded-For: 10.8.0.10` fa sì che `$remote_addr` diventi un IP della VPN e supera `allow`. Con `real_ip_recursive on` e tutti gli indirizzi fidati, nginx prende il valore a sinistra, cioè quello scelto dal client.
- Il README (riga 8) dice che il bilanciatore passa il TCP senza terminare nulla. Un bilanciatore L4 non può aggiungere header HTTP, salvo PROXY protocol, che qui non è configurato. Ipotesi: l'header è sempre fornito dal client. Il bilanciatore reale va verificato.
- Impatto: il pannello admin (utenti, ruoli, listini, esportazioni) risulta esposto a chiunque. È un'esposizione grave, ma non l'ho provata con una richiesta reale.
- Correzione: `set_real_ip_from` solo con l'IP o la subnet del bilanciatore, oppure usare l'IP di connessione senza real_ip per `/admin`. Meglio ancora, non esporre `/admin` su nginx pubblico e servirlo solo sull'interfaccia `wg0`.
- Verifica: una richiesta con header falsificato dall'esterno deve dare 403.

**F-02 · P0 · Pannello admin pubblicato direttamente sull'host e aperto a Internet**
- Dove: `infra/docker-compose.yml` righe 24-25 (`ports: "8081:8081"`) e `infra/security-group.json` riga 9 (`tcp 8000-8100` da `0.0.0.0/0`, nota «servizi applicativi»).
- Fatto: la porta 8081 è pubblicata sull'host e il security group la lascia passare da ovunque. Il filtro nginx di F-01 è quindi irrilevante: `http://<IP-VM>:8081` raggiunge `admin` senza passare da nginx. Docker inserisce le sue regole iptables davanti a quelle dell'host.
- Contraddice il README (righe 7 e 10: nginx unico punto d'ingresso, `/admin` solo da VPN).
- Correzione: rimuovere `ports` da `admin` (nginx lo raggiunge già via rete `frontend`) e togliere il range 8000-8100 dal security group. Se serve accesso diretto, legare la porta a `10.8.0.1:8081`.
- Verifica: dall'esterno la porta 8081 deve risultare filtrata.

**F-03 · P1 · SSH aperto a Internet**
- Dove: `infra/security-group.json` riga 8 (`tcp 22` da `0.0.0.0/0`, nota «SSH amministratori»).
- Fatto: il README (riga 10) dice che SSH è raggiungibile solo dalla VPN `10.8.0.0/24`.
- Impatto: superficie esposta a brute force e a vulnerabilità del demone SSH.
- Correzione: limitare la sorgente agli IP fissi dell'ufficio, oppure chiudere la 22 e ascoltare solo su `10.8.0.1`. Aggiungere fail2ban e accesso solo con chiave.

**F-04 · P1 · `/files/` serve i documenti dei clienti senza autenticazione**
- Dove: `infra/nginx.conf` righe 39-41 (`location /files/ { alias /srv/uploads/; }`, nessun `auth_request`, nessuna restrizione).
- Fatto: il volume contiene DDT e ordini firmati (README righe 3 e 11). I nomi file sono `<id utente>-<timestamp>-<nome originale>` (`app/upload.js` riga 14), quindi prevedibili. Nessuna verifica che il richiedente sia il proprietario.
- Impatto: lettura di documenti di altri clienti (violazione di riservatezza con dati commerciali, forse personali; coinvolgere Privacy & Compliance).
- Contenuti serviti dal dominio principale senza `X-Content-Type-Options` né `Content-Disposition`: rischio di XSS persistente con file HTML o SVG caricati (da verificare lato app).
- Correzione: servire i file tramite l'app con controllo del proprietario, oppure `auth_request` / `X-Accel-Redirect` interno. Come minimo, nomi casuali non indovinabili, `X-Content-Type-Options: nosniff` e `Content-Disposition: attachment`.

**F-05 · P1 · Il database è anche sulla rete `frontend`**
- Dove: `infra/docker-compose.yml` riga 34 (`networks: [backend, frontend]`).
- Fatto: il README (riga 9) dice che il database sta solo su `backend`. Su `frontend` può essere raggiunto da `edge`, il componente esposto a Internet, e da tutto ciò che sta su quella rete. Si perde l'isolamento garantito da `backend` con `internal: true`.
- Correzione: `networks: [backend]`.
- Verifica: `edge` non deve risolvere né raggiungere `db`.

**F-06 · P2 · `/metrics` pubblico su nginx**
- Dove: `infra/nginx.conf` righe 54-56, senza `allow`/`deny`.
- Fatto: il README (riga 12) lo destina a Prometheus in ufficio. Ho trovato la route pubblica; non ho verificato cosa esponga l'app (in `app/server.js` non l'ho trovata).
- Impatto: possibile divulgazione di informazioni interne.
- Correzione: `allow 10.8.0.20; deny all;` (con F-01 risolto), oppure rimuovere la location e fare lo scrape su un'interfaccia interna.

**F-07 · P2 · Spoofing dell'IP del client nei log e nell'inoltro**
- Dove: `infra/nginx.conf` righe 9-13 e 35.
- Fatto: `$remote_addr` è controllato dal client (vedi F-01), perciò `access_log` registra IP falsi e `proxy_add_x_forwarded_for` li propaga all'app. Il log non registra `$http_x_forwarded_for`.
- Impatto: log inaffidabili, rate limit e rilevamento aggirabili, elusione di eventuali regole su IP.
- Correzione: stessa di F-01, più registrare sia l'IP reale di connessione sia l'XFF grezzo.

**F-08 · P2 · Nessuna segmentazione fra i peer VPN**
- Dove: `infra/wg0.conf` righe 6-18, e `nginx.conf` riga 44 (`allow 10.8.0.0/24`).
- Fatto: tutti i peer (2 postazioni admin e il server Prometheus 10.8.0.20) stanno nella stessa `/24` e `/admin` è consentito all'intera `/24`. Il server Prometheus ottiene quindi gli stessi diritti degli amministratori.
- Il peer `10.8.0.11` non ha commento sul proprietario. Nessuna PresharedKey. Nessuna regola di filtro per peer (PostUp/iptables).
- Correzione: consentire `/admin` solo a `10.8.0.10` e `10.8.0.11`, e a Prometheus solo la porta 9100. Documentare i proprietari dei peer e revisionarli periodicamente.

**F-09 · P2 · Egress troppo ampio**
- Dove: `infra/security-group.json` righe 12-16.
- Fatto: 443 verso `0.0.0.0/0` (webhook, registro immagini, SIEM), più DNS e NTP verso ovunque.
- Impatto: un'app compromessa può esfiltrare dati su 443 e fare SSRF verso Internet. I webhook dei clienti sono per natura destinazioni arbitrarie.
- Correzione: limitare ai fornitori noti (registro, SIEM). Per i webhook usare un proxy di uscita con allowlist e blocco degli indirizzi interni e dei metadati cloud. Limitare DNS e NTP ai resolver e server scelti.

**F-10 · P3 · Rafforzamenti minori di nginx e Compose**
- `nginx.conf`: la redirect su porta 80 usa `$host` (riga 19), che riflette un Host arbitrario. Meglio il nome fisso. Mancano rate limiting, `limit_req` e `client_max_body_size` esplicito per l'upload. Mancano gli header di sicurezza oltre a HSTS (X-Content-Type-Options, X-Frame-Options/CSP). Nessun `server` di default che scarti gli Host sconosciuti.
- `docker-compose.yml`: `node-exporter` con `network_mode: host` (righe 41-44) e bind su `10.8.0.1`, che esiste solo con `wg0` attiva (rischio di avvio fallito, nessun rischio di esposizione se il bind regge). La regola SG 9100 da `10.8.0.0/24` (riga 10) è comunque ridondante rispetto a un bind solo-VPN. Immagini referenziate per tag e non per digest. `app` e `admin` condividono lo stesso `.env` con tutti i segreti (righe 16 e 23): meglio segreti per servizio.
- `/healthz` e `/status` non pongono problemi di rete. L'IP dell'uptime `198.51.100.20` non è ristretto da nessuna regola, ma l'endpoint è innocuo.

## Verificato conforme al README
- Il database `db` e la cache `cache` non hanno porte pubblicate. `cache` sta solo su `backend` con password.
- Il volume `uploads` è montato in sola lettura su `edge`.
- TLS limitato a 1.2/1.3, HSTS presente, `server_tokens off`. La porta 80 reindirizza a HTTPS.
- WireGuard: `AllowedIPs` sono tutti `/32` e la chiave privata non è nel file.

## Rischio residuo e limiti
- Non ho verificato lo stato reale del cloud, il bilanciatore, le regole del firewall dell'host, il contenuto del `.env`, i certificati né le immagini `admin`. Le conclusioni vengono solo dai file nel repository.
- Non ho provato alcuno sfruttamento (nessun test attivo autorizzato). F-01 e F-02 sono dedotti dalla configurazione e vanno confermati con una prova autorizzata.
- Non ho consultato le schede della biblioteca (non disponibile in questa prova).
- Questa revisione non è una certificazione di sicurezza.

## Piano di nuova verifica
1. Applicare F-02, F-01 e F-03, poi ripetere i controlli di raggiungibilità da una postazione esterna autorizzata.
2. Rivedere F-04 e F-05 con il team applicativo.
3. Rivalutare tutto il perimetro dopo le correzioni.

## Nota per il direttore
Sono un modello più piccolo di quello della sessione. Per i rilievi P0 (F-01, F-02) e i P1 propongo il riesame del direttore AICA-01 o di un revisore su Opus prima che diventino definitivi.

— AICA-05 · ALNITAK
