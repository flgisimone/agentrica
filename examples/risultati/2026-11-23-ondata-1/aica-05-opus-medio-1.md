AICA-05 · ALNITAK — Senior Network Security Engineer, reparto AICA (AI Cybersecurity)

# Revisione della sicurezza di rete: `infra/` del portale ordini

## Sintesi per la direzione
Ho confrontato la configurazione di `infra/` con l'architettura descritta nel README e non corrispondono in diversi punti importanti. Il pannello `admin` è raggiungibile da Internet in due modi: con la porta 8081 pubblicata e aperta nel security group, oppure attraverso nginx falsificando `X-Forwarded-For`. In entrambi i casi la restrizione alla VPN non regge. Anche SSH è aperto a tutti, nonostante il README dica «solo VPN». I file caricati dai clienti sono serviti da nginx senza alcun controllo. Il database sta sulla rete `frontend`, mentre il README lo vuole solo su `backend`. `/metrics` è pubblico. L'app, che è su entrambe le reti e ha l'uscita verso tutta Internet, può essere usata tramite il test dei webhook per raggiungere servizi interni.

Ci sono 2 rilievi P0, 4 P1, 3 P2 e 4 P3. I due P0 vanno segnalati subito al responsabile della VM e chiusi prima del resto.

## Perimetro e autorizzazioni
- **Perimetro:** i file `infra/docker-compose.yml`, `infra/nginx.conf`, `infra/security-group.json` e `infra/wg0.conf`, confrontati con `README.md`. Ho letto `app/server.js`, `app/upload.js` e `app/orders.js` solo per capire che effetto ha la rete sulle rotte.
- **Autorizzazione:** analisi documentale in sola lettura sulla copia di prova, come da incarico.
- **Cosa non ho fatto:** nessuna scansione, nessuna connessione, nessuna modifica.
- **Limiti della prova:** il direttore AICA-01 e la biblioteca del reparto non erano disponibili.

## Metodologia
1. Ho ricostruito i flussi previsti dal README: chi entra, da dove e verso quale servizio.
2. Per ogni flusso ho confrontato tre livelli di controllo: il security group del cloud, le porte pubblicate e le reti di Compose, le regole `allow` e `deny` di nginx.
3. Ho cercato i punti dove un livello ne annulla un altro: header falsificabili, porte pubblicate che scavalcano il proxy, servizi collegati a più reti.

## Rilievi

### ALNITAK-01 · P0 · Pannello admin esposto direttamente su Internet
- **Dove:**
  - `infra/docker-compose.yml:24-25`: `"8081:8081"`, in ascolto su tutte le interfacce.
  - `infra/security-group.json:9`: porte tcp `8000-8100` aperte da `0.0.0.0/0` con la nota «servizi applicativi».
- **Fatto:** il README dice che `/admin` è raggiungibile solo dalla VPN `10.8.0.0/24`. In realtà la porta 8081 è pubblicata sull'host e il security group la lascia passare da qualunque indirizzo. Il pannello si raggiunge su `http://<IP-VM>:8081`, in chiaro e senza passare da nginx, quindi senza la regola `allow 10.8.0.0/24`.
- **Impatto:** il pannello interno (utenti, ruoli, listini, esportazioni) è esposto a tentativi di accesso e a sfruttamento da Internet. Il traffico è senza TLS. Le porte pubblicate da Docker scavalcano anche un eventuale firewall dell'host (ufw o iptables INPUT).
- **Correzione:**
  - Togliere `ports` da `admin`: nginx lo raggiunge già sulla rete `frontend`.
  - Togliere dal security group la regola `8000-8100`, perché nessun servizio documentato ne ha bisogno.
- **Verifica:** `docker compose config` non deve mostrare porte per `admin`. Il security group non deve avere regole oltre 80, 443 e 51820. Un controllo esterno autorizzato sulla porta 8081 deve risultare chiuso.

### ALNITAK-02 · P0 · La restrizione di `/admin` per IP si aggira con un header
- **Dove:**
  - `infra/nginx.conf:9-11`: `set_real_ip_from 0.0.0.0/0;`, `real_ip_header X-Forwarded-For;`, `real_ip_recursive on;`.
  - Righe 43-45: `allow 10.8.0.0/24; deny all;`.
- **Fatto:** nginx considera fidato qualunque indirizzo. Con `real_ip_recursive on`, `$remote_addr` diventa il primo valore di `X-Forwarded-For`, che decide il client. Chi invia `X-Forwarded-For: 10.8.0.10` da Internet viene trattato come una postazione della VPN e passa la regola `allow`.
- **Incoerenza nel README:** il README dice che il bilanciatore «passa il TCP» e insieme che «aggiunge `X-Forwarded-For`». Un bilanciatore TCP non può aggiungere header HTTP dentro una connessione TLS. È quindi probabile che l'header arrivi solo dal client.
- **Impatto:**
  - `/admin/` è accessibile da Internet anche dopo aver chiuso la porta 8081.
  - Il log di accesso (riga 13) registra IP falsificabili, quindi perde valore per indagini e rilevazione.
- **Correzione:**
  - Se il bilanciatore lavora sul TCP: togliere `set_real_ip_from`, `real_ip_header` e `real_ip_recursive`. In alternativa usare il PROXY protocol (`listen 443 ssl proxy_protocol;`, `real_ip_header proxy_protocol;`), con `set_real_ip_from` limitato agli indirizzi del bilanciatore.
  - Se il bilanciatore lavora su HTTP: limitare `set_real_ip_from` alla sola subnet del bilanciatore.
  - Aggiungere al pannello admin un'autenticazione forte indipendente dall'IP, come difesa in profondità.
- **Verifica:** una richiesta da Internet a `/admin/` con `X-Forwarded-For: 10.8.0.10` deve ricevere 403 (prova solo con autorizzazione scritta). Nel log deve comparire l'IP reale del client o quello del bilanciatore, mai il valore dell'header.

### ALNITAK-03 · P1 · SSH aperto a tutta Internet
- **Dove:** `infra/security-group.json:8`, tcp `22` da `0.0.0.0/0`.
- **Fatto:** il README vuole SSH «solo dalla VPN dell'ufficio». Il security group lo apre a tutti.
- **Impatto:** la porta di amministrazione della VM è esposta a brute force e a vulnerabilità di sshd. Se la VM cade, cadono tutti i container, il database e i segreti in `.env`.
- **Correzione:** togliere la regola. SSH va raggiunto solo attraverso il tunnel, per esempio con sshd in ascolto su `10.8.0.1` o un firewall dell'host che accetta la 22 solo da `wg0`. Va tenuto un accesso di emergenza dalla console del provider.
- **Verifica:** il security group non ha la regola sulla 22. Dalla VPN SSH funziona, dall'esterno no.

### ALNITAK-04 · P1 · I file caricati dai clienti sono serviti senza autenticazione
- **Dove:**
  - `infra/nginx.conf:39-41`: `location /files/ { alias /srv/uploads/; }`.
  - `infra/docker-compose.yml:10`.
  - Il nome del file nasce in `app/upload.js:14,17`.
- **Fatto:** l'app ha una rotta protetta, `GET /api/files/:name`, che controlla il proprietario (`app/upload.js:20-24`). nginx però serve lo stesso volume sotto `/files/` a chiunque, senza nessun controllo. Il nome del file è prevedibile: `<id utente>-<timestamp in ms>-<nome originale>`.
- **Impatto:** DDT e ordini firmati di tutti i clienti si possono scaricare da Internet senza login, se si conosce o si indovina il nome. Inoltre nginx serve i file dalla stessa origine del portale, con il tipo MIME ricavato dall'estensione.
- **Correzione:** togliere la `location /files/` e il volume `uploads` da `edge`, e servire i file solo da `/api/files/:name`. In alternativa usare `internal;` con `X-Accel-Redirect` emesso dall'app dopo il controllo. Va aggiunto `X-Content-Type-Options: nosniff` e, per i download, `Content-Disposition: attachment`.
- **Verifica:** `/files/<nome>` senza sessione deve rispondere 404 o 403. Con la sessione di un altro cliente, `/api/files/<nome>` deve rispondere 404.
- **Passaggio di consegne:** il nome originale del file viene concatenato senza pulizia (`file.filename`, `app/upload.js:14-15`), con un possibile path traversal. Va alla Software Agency o all'AppSec. Il caso riguarda dati personali dei clienti, quindi va informata anche la Privacy & Compliance Agency.

### ALNITAK-05 · P1 · L'app può raggiungere servizi interni (SSRF) e ha l'uscita aperta
- **Dove:**
  - `infra/docker-compose.yml:19`: `app` su `[frontend, backend]`.
  - `infra/security-group.json:15`: uscita tcp 443 verso `0.0.0.0/0`.
  - `app/orders.js:42-48`: `testWebhook` blocca solo `localhost` e restituisce fino a 2000 caratteri della risposta.
- **Fatto:** qualunque utente autenticato, anche un cliente, può far chiamare all'app un URL a sua scelta e leggere la risposta. Dalla posizione dell'app sono raggiungibili:
  - `http://admin:8081/`: il pannello interno, senza la restrizione per IP di nginx;
  - `db` e `cache`;
  - l'host e `10.8.0.1:9100`;
  - con buona probabilità il servizio di metadati del cloud `169.254.169.254`, che di solito non è filtrato dal security group.
- **Impatto:** il pannello admin, i metadati della VM e le eventuali credenziali dell'istanza diventano raggiungibili dall'esterno attraverso l'app. È un'ipotesi da confermare sul provider reale.
- **Correzione dal lato rete:**
  - mettere i webhook in uscita dietro un proxy con allowlist, oppure bloccare dalla rete dei container gli indirizzi privati, link-local e loopback;
  - imporre IMDSv2 o un equivalente sul provider;
  - se possibile, separare il pannello admin dalla rete raggiungibile dall'app.
- **Correzione dal lato codice (Software Agency):** risolvere il nome DNS e validare l'IP di destinazione, permettere solo https, non restituire il corpo della risposta.
- **Verifica:** un test autorizzato verso `http://admin:8081/` e verso `169.254.169.254` deve essere rifiutato.

### ALNITAK-06 · P1 · Il database è anche sulla rete `frontend`
- **Dove:** `infra/docker-compose.yml:34`, `networks: [backend, frontend]`.
- **Fatto:** il README dice che il database sta «solo su `backend`». Stando su `frontend`, che non è `internal`, Postgres è raggiungibile da `edge` e ha accesso in uscita verso Internet. In questo modo la rete `backend` con `internal: true` (righe 48-49) non serve più a isolarlo.
- **Impatto:** se nginx viene compromesso, si arriva direttamente al database. Il database può anche aprire connessioni in uscita, il che facilita l'esfiltrazione. Non risulta pubblicato sull'host, per questo P1 e non P0.
- **Correzione:** `networks: [backend]`.
- **Verifica:** `docker network inspect` della rete `frontend` non deve elencare `db`. Da `edge` il nome `db` non deve risolversi.

### ALNITAK-07 · P2 · `/metrics` è pubblico
- **Dove:** `infra/nginx.conf:54-56`.
- **Fatto:** il README dice che `/metrics` serve a Prometheus nella rete dell'ufficio. La location non ha `allow` né `deny` ed è un prefisso, quindi copre anche `/metricsqualunque`. Oggi l'app non definisce `/metrics` (`app/server.js`) e risponde 404, ma la rotta è pronta a esporre metriche interne appena l'endpoint verrà aggiunto.
- **Correzione:** `location = /metrics { allow 10.8.0.20; deny all; ... }`, cioè solo il server Prometheus. Meglio ancora: Prometheus raccoglie le metriche dall'app passando dalla VPN, senza esporle su 443. L'`allow` regge solo dopo la correzione di ALNITAK-02.
- **Verifica:** da Internet `/metrics` risponde 403.

### ALNITAK-08 · P2 · Il traffico VPN non è separato per ruolo
- **Dove:**
  - `infra/nginx.conf:44`: `allow 10.8.0.0/24`.
  - `infra/wg0.conf:15-18`: peer Prometheus `10.8.0.20`.
- **Fatto:** gli `AllowedIPs` dei peer sono `/32`, ed è corretto. La regola di nginx però ammette tutta la `/24`, compreso il server Prometheus, che ha bisogno solo della porta 9100. Inoltre in `infra/` non c'è nessuna regola che filtri il traffico in arrivo da `wg0` verso le altre porte dell'host o verso i container.
- **Impatto:** se il server Prometheus viene compromesso, ha accesso al pannello admin e potenzialmente a SSH.
- **Correzione:**
  - ammettere su `/admin` solo `10.8.0.10` e `10.8.0.11`, oppure assegnare una sottorete dedicata agli amministratori;
  - filtrare `wg0` sull'host: Prometheus solo verso `10.8.0.1:9100`, gli amministratori verso 22 e 443;
  - documentare se l'inoltro fra i peer è disattivato.
- **Verifica:** da `10.8.0.20` `/admin/` risponde 403 e la porta 22 è chiusa.

### ALNITAK-09 · P2 · Uscite troppo larghe
- **Dove:** `infra/security-group.json:13-15`.
- **Fatto:** DNS, NTP e 443 sono aperti verso qualunque destinazione. Il README indica destinazioni precise: il registro delle immagini e il SIEM.
- **Impatto:** il DNS aperto verso ovunque permette tunnel ed esfiltrazione. Il 443 aperto verso ovunque amplia l'effetto di ALNITAK-05.
- **Correzione:**
  - DNS e NTP solo verso i resolver e i server NTP del provider;
  - 443 verso il registro e il SIEM per indirizzo o prefisso;
  - webhook dei clienti attraverso un proxy di uscita controllato.
  
  Segnalo anche che manca tcp/53, che può servire per le risposte DNS grandi.
- **Verifica:** dalla VM una risoluzione verso un resolver esterno arbitrario fallisce, mentre i flussi documentati continuano a funzionare.

### ALNITAK-10 · P3 · La regola del security group per la 9100 non ha effetto
- **Dove:**
  - `infra/security-group.json:10`: sorgente `10.8.0.0/24`.
  - `infra/docker-compose.yml:41-44`: node-exporter con `network_mode: host`.
- **Fatto:** il traffico della VPN arriva al security group incapsulato su UDP 51820, con l'IP pubblico dell'ufficio. Gli indirizzi `10.8.0.x` esistono solo dentro il tunnel, quindi la regola non filtra niente. È ingannevole ma innocua, perché node-exporter ascolta solo su `10.8.0.1`.
- **Nota operativa:** se `wg0` non è attiva quando il container parte, node-exporter non si avvia.
- **Correzione:** togliere la regola e documentare che il controllo sta nel binding su `10.8.0.1` e nel filtro su `wg0` (ALNITAK-08).

### ALNITAK-11 · P3 · WireGuard aperto a tutti gli indirizzi
- **Dove:** `infra/security-group.json:7`.
- **Fatto:** per una VPN d'ufficio, la porta può essere limitata agli IP pubblici dell'ufficio, se sono statici.
- **Impatto:** basso. WireGuard non risponde ai pacchetti non autenticati.
- **Correzione:** limitare la sorgente agli IP dell'ufficio, se è fattibile.

### ALNITAK-12 · P3 · Gli IP dei client non sono affidabili lungo la catena
- **Dove:**
  - `infra/nginx.conf:35`: `$proxy_add_x_forwarded_for` inoltra all'app la catena scritta dal client.
  - `app/server.js:12`: l'app registra `req.socket.remoteAddress`, cioè l'IP del container `edge`.
- **Impatto:** nei log dell'app non c'è l'IP reale del client, e quelli di nginx sono falsificabili (ALNITAK-02). Il problema riguarda anche il requisito di conservare 90 giorni i log di sicurezza.
- **Correzione:** dopo ALNITAK-02, impostare `proxy_set_header X-Forwarded-For $remote_addr;` (oppure `X-Real-IP`) e configurare l'app perché si fidi solo di `edge`.
- **Passaggio di consegne:** al SOC per la qualità dei log.

### ALNITAK-13 · P3 · Rafforzamento del proxy
- **Dove:** `infra/nginx.conf:22-57`.
- **Fatto:**
  - mancano `X-Content-Type-Options`, `X-Frame-Options` o `frame-ancestors` e CSP;
  - non ci sono limiti di frequenza su `/login` e `/password/*`;
  - `client_max_body_size` non è impostato: il valore predefinito di 1 MB è incoerente con i 10 MB di `app/upload.js:8`;
  - non c'è un `default_server` che rifiuti gli Host sconosciuti su 443.
- **Correzione:** aggiungere gli header, `limit_req` sulle rotte di autenticazione, `client_max_body_size 10m` e un server predefinito con `return 444`.

## Rischio residuo
Il rischio resta alto finché ALNITAK-01, -02, -03 e -04 non sono chiusi. Anche dopo, l'esposizione dipende da come è fatta la VM reale (firewall dell'host, inoltro su `wg0`, metadati del provider), che non ho potuto osservare. Questa revisione non dichiara sicura la rete nel suo insieme: vale per i controlli e i file esaminati.

## Limiti e aree non verificate
- Non ho visto la configurazione del bilanciatore (TCP o HTTP, PROXY protocol, indirizzi sorgente), il firewall dell'host, `sysctl net.ipv4.ip_forward`, la protezione dei metadati del provider né il pannello `admin`, che è un'immagine esterna.
- I comportamenti di nginx e Docker che cito (`real_ip_recursive`, porte pubblicate che scavalcano ufw, reti `internal`) vengono dalla mia conoscenza e non dalla biblioteca del reparto, che in questa prova non era disponibile. Vanno verificati sulla documentazione ufficiale delle versioni in uso: nginx 1.27.3 e la versione di Docker Engine installata.
- Non ho fatto nessuna prova attiva.

## Piano della nuova verifica
1. Rileggere il diff di `infra/` dopo le correzioni.
2. Controllare con `docker compose config` le porte e le reti.
3. Esportare il security group e confrontarlo con il README.
4. Con un'autorizzazione scritta e regole di ingaggio definite, fare prove esterne mirate:
   - porte 22, 8081 e 8000-8100 chiuse;
   - `/admin/` con `X-Forwarded-For` falsificato risponde 403;
   - `/files/` senza sessione risponde 404;
   - `/metrics` risponde 403;
   - il webhook verso `admin:8081` e `169.254.169.254` viene rifiutato.

## Consegne
- **AICA-01 · VEGA:** consolidamento e priorità.
- **Software Agency o AppSec:** la parte di codice di ALNITAK-04 (path traversal) e ALNITAK-05 (SSRF).
- **Privacy & Compliance Agency:** ALNITAK-04, per i documenti dei clienti accessibili senza login.
- **SOC:** ALNITAK-12.

— ALNITAK (AICA-05)
