AICA-05 · ALNITAK — Senior Network Security Engineer, reparto AICA (AI Cybersecurity)

**Nota sulla prova:** il direttore AICA-01 e la biblioteca non erano disponibili, quindi lavoro direttamente come specialista. Non ho letto le schede della biblioteca e non ho accesso al web, per cui non cito standard datati. È un esame dei file in sola lettura: non ho avviato processi né fatto scansioni. Due rilievi vanno segnalati subito all'utente: R1 (P0) e R2 (P1).

## Sintesi per la direzione
La configurazione in `infra/` non rispetta l'architettura descritta nel README in più punti:
- il pannello `admin` si raggiunge da Internet in due modi, senza passare dalla VPN;
- SSH è aperto a tutti;
- il database sta anche sulla rete `frontend`;
- i documenti dei clienti sono serviti da nginx senza alcun controllo di accesso.

Questi controlli valgono per i soli file esaminati e non sono una certificazione: non dichiaro sicura né conforme l'infrastruttura nel suo insieme.

## Perimetro e metodo
- File esaminati: `infra/docker-compose.yml`, `infra/nginx.conf`, `infra/security-group.json`, `infra/wg0.conf`, confrontati con `README.md`.
- Ho letto anche `app/server.js` e `app/upload.js`, solo per capire come l'app tratta l'IP del client, `/metrics` e `/files/`.
- Il progetto è dichiarato finto: nessun dato reale.
- Metodo: solo analisi dei documenti, nessuna verifica sul sistema in esercizio.
- Distinguo i **fatti** (cosa dice la configurazione) dalle **ipotesi** (come è l'ambiente reale).

## Rilievi

**R1 — P0 — Pannello admin esposto direttamente su Internet (8081)**
- Dove: `infra/docker-compose.yml:24-25` (`ports: "8081:8081"`) e `infra/security-group.json:9` (tcp `8000-8100` da `0.0.0.0/0`).
- Fatto: la porta del servizio `admin` è pubblicata su tutte le interfacce della VM, e il security group lascia entrare da tutto Internet un intervallo di porte che comprende la 8081.
- Effetto: chiunque raggiunge `http://<IP della VM>:8081` senza passare da nginx. Così salta l'unico controllo descritto (`allow 10.8.0.0/24` in `nginx.conf:44-45`), e il traffico è anche in chiaro, senza TLS.
- Ipotesi: la gravità dipende dall'autenticazione del pannello, che non ho verificato. Il nome `sg-portale-ordini-prod` fa pensare che sia la configurazione di produzione.
- Correzione:
  - togliere `ports` dal servizio `admin`: nginx lo raggiunge già sulla rete `frontend`;
  - togliere dal security group la regola `8000-8100`; se serve davvero un servizio, aprire solo la porta necessaria e solo dalla sorgente necessaria.
- Va considerato anche che le porte pubblicate da Docker scavalcano il firewall dell'host (iptables/ufw): sul security group del provider va controllato che non resti un'altra apertura.
- Verifica: dall'esterno, solo in modo passivo e con autorizzazione scritta, la 8081 deve risultare chiusa; `docker compose config` non deve mostrare `ports` sul servizio `admin`.

**R2 — P1 — L'IP del client si falsifica: `/admin/` si raggiunge da Internet anche via nginx**
- Dove: `infra/nginx.conf:9-11` (`set_real_ip_from 0.0.0.0/0; real_ip_header X-Forwarded-For; real_ip_recursive on;`), insieme a `nginx.conf:43-46`.
- Fatto: nginx considera fidato ogni indirizzo e quindi prende l'IP da `X-Forwarded-For`, che manda il client. Chi invia `X-Forwarded-For: 10.8.0.10` ottiene `$remote_addr = 10.8.0.10` e supera `allow 10.8.0.0/24`.
- Anche i log di accesso (`nginx.conf:13`) registrano l'IP falsificato.
- Osservazione: il README dice che il bilanciatore «passa il TCP» (non termina TLS) e insieme «aggiunge X-Forwarded-For». Un bilanciatore che passa il TCP non può inserire header HTTP dentro una connessione TLS. Quindi quell'header oggi viene dal client, oppure il bilanciatore lavora in un altro modo: va chiarito con chi gestisce il provider.
- Correzione:
  - se il bilanciatore resta TCP, usare il PROXY protocol (`listen 443 ssl proxy_protocol;`, `real_ip_header proxy_protocol;`);
  - in ogni caso `set_real_ip_from` va limitato alla sola subnet del bilanciatore;
  - per `/admin/` serve un controllo che non dipenda dagli header, cioè tenerlo su un listener raggiungibile solo dall'interfaccia `wg0`.
- Verifica: una richiesta con `X-Forwarded-For` falsificato verso `/admin/` deve ricevere 403, prova da fare solo in un ambiente autorizzato.

**R3 — P1 — SSH aperto a tutto Internet**
- Dove: `infra/security-group.json:8` (tcp `22` da `0.0.0.0/0`).
- Fatto: il README dice che SSH si raggiunge solo dalla VPN (`10.8.0.0/24`), ma la regola lo apre a chiunque.
- Correzione:
  - togliere la regola: SSH si raggiunge comunque dentro il tunnel WireGuard, su `10.8.0.1`;
  - far ascoltare `sshd` solo su `10.8.0.1` (`ListenAddress`);
  - in alternativa, accesso dalla console del provider.
- Verifica: la 22 non risulta raggiungibile dall'IP pubblico, e `sshd -T` mostra `listenaddress 10.8.0.1`.

**R4 — P1 — Documenti dei clienti serviti da `/files/` senza controllo di accesso**
- Dove: `infra/nginx.conf:39-41` (`location /files/ { alias /srv/uploads/; }`) e `infra/docker-compose.yml:10`.
- Fatto: nginx serve il volume `uploads` a chiunque, senza autenticazione.
- Il controllo sul proprietario esiste solo in `app/upload.js:20-25` (`/api/files/:name`), ma l'app stessa restituisce gli URL `/files/...` (`upload.js:17`), che non passano da quel controllo.
- I nomi dei file sono prevedibili: `<id utente>-<timestamp>-<nome originale>` (`upload.js:14`). I DDT e gli ordini firmati di tutti i clienti si possono quindi enumerare.
- Effetto aggiuntivo: nginx assegna il tipo dei file dall'estensione e li serve dallo stesso dominio dell'app. Un file con estensione `.html` caricato con un `contentType` ammesso diventerebbe XSS persistente.
- Correzione:
  - togliere `location /files/` e servire i file solo tramite `/api/files/:name`;
  - oppure usare `internal;` con `X-Accel-Redirect` dall'app;
  - aggiungere `X-Content-Type-Options: nosniff` e `Content-Disposition: attachment`.
- Da passare all'Application Security Engineer e alla Privacy & Compliance: sono dati di clienti, e il nome del file viene dal client (`upload.js:14-15`, possibile path traversal).
- Verifica: una richiesta a `/files/<nome>` senza sessione deve dare 404 o 403.

**R5 — P2 — Il database sta anche sulla rete `frontend`**
- Dove: `infra/docker-compose.yml:34` (`networks: [backend, frontend]`).
- Fatto: il README dice che il database sta solo su `backend`. Sulla rete `frontend`, che non è `internal`, `edge` (nginx, il componente esposto) può raggiungere `db:5432`, e il database ha anche accesso in uscita verso Internet.
- Correzione: `networks: [backend]`.
- Verifica: `docker network inspect` della rete `frontend` non deve elencare il database.

**R6 — P2 — `/metrics` pubblico**
- Dove: `infra/nginx.conf:54-56`.
- Fatto: il README dice che `/metrics` è per Prometheus in ufficio, ma la location non ha restrizioni.
- Oggi `app/server.js` non definisce la rotta, quindi la risposta probabilmente è un 404. Il rischio si concretizza appena la rotta viene aggiunta.
- Osservazione: Prometheus dovrebbe interrogare il servizio direttamente dalla VPN, non passare dall'ingresso pubblico.
- Correzione: togliere la location dal server pubblico, oppure `allow 10.8.0.20; deny all;`, tenendo conto di R2.

**R7 — P3 — La regola 9100 nel security group non fa nulla, e node-exporter è aperto a tutti i peer della VPN**
- Dove: `infra/security-group.json:10` e `infra/docker-compose.yml:41-44`.
- Fatto: il traffico da `10.8.0.0/24` arriva dentro il tunnel (UDP 51820 dall'IP pubblico dell'ufficio) e viene decifrato su `wg0`, quindi non passa mai per il security group: la regola è inutile e fuorviante.
- Fatto: node-exporter (`network_mode: host`, ascolto su `10.8.0.1:9100`) si raggiunge da tutti i peer della VPN, comprese le postazioni degli amministratori, non solo da Prometheus (`10.8.0.20`).
- Correzione: togliere la regola dal security group e filtrare sull'host (nftables su `wg0`): verso la 9100 solo da `10.8.0.20`.

**R8 — P3 — Uscita verso Internet troppo ampia**
- Dove: `infra/security-group.json:13-15`.
- Fatto: tcp 443 e udp 53 sono aperti verso `0.0.0.0/0`.
- Le uscite verso i webhook dei clienti (`/api/webhooks/test` in `server.js:30`) sono un vettore SSRF verso destinazioni arbitrarie. Il DNS verso qualunque server permette di far uscire dati in modo nascosto (tunneling).
- Correzione:
  - DNS solo verso il resolver del provider;
  - registro immagini e SIEM verso destinazioni note;
  - webhook tramite un proxy di uscita con blocco degli indirizzi privati e dei metadati (169.254.169.254).

**R9 — P3 — WireGuard e HTTPS accettano connessioni da qualunque sorgente**
- Dove: `infra/security-group.json:5-7`.
- Fatto: WireGuard non risponde a chi non è autenticato, quindi il rischio è basso; resta possibile limitare la porta 51820 all'IP pubblico dell'ufficio, se è fisso.
- Ipotesi: se la VM ha un IP pubblico proprio, le porte 80 e 443 da `0.0.0.0/0` permettono di scavalcare il bilanciatore. Andrebbero limitate alla subnet del bilanciatore.

**Osservazione fuori dal mio ruolo:** `app/server.js:12` registra nei log `req.socket.remoteAddress`, che è l'IP del container nginx. Nei log dell'app l'IP del client va perso. Da passare al SOC Analyst.

## Rischio residuo e limiti
- Non ho verificato:
  - lo stato reale della VM e del provider;
  - l'autenticazione del pannello `admin`;
  - i certificati;
  - il firewall dell'host;
  - le regole di inoltro e l'`AllowedIPs` lato client della VPN;
  - il contenuto di `.env`.
- Non ho valutato le immagini dei container (versioni e CVE).
- `REDIS_PASSWORD` passata sulla riga di comando (`docker-compose.yml:38`) è visibile in `docker inspect` e in `ps`: va al Cloud Security Engineer.
- Queste analisi sono state fatte senza il riesame del direttore AICA-01. Propongo il suo riesame di R1–R4 prima che diventino definitivi.

## Piano della nuova verifica
1. Dopo le correzioni, rileggere `docker compose config` e il security group esportato dal provider.
2. Con autorizzazione scritta e regole di ingaggio, fare una verifica dall'esterno limitata alle porte 22, 8000–8100 e 9100, e alle rotte `/admin/` (con `X-Forwarded-For` falsificato), `/files/` e `/metrics`.
3. Controllare `docker network inspect frontend` e la configurazione nftables su `wg0`.

— ALNITAK (AICA-05)
