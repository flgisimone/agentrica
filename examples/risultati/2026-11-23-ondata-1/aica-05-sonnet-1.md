AICA-05 · ALNITAK — Senior Network Security Engineer, reparto AICA (AI Cybersecurity)

# Revisione sicurezza di rete di `infra/`, portale ordini «Ferramenta Nord»

## Sintesi per la direzione
Ho trovato quattro esposizioni importanti (P1). Le prime due rendono inefficace la regola del README «`/admin` e SSH solo da VPN»: il pannello admin si raggiunge da Internet senza passare dalla VPN e SSH è aperto a tutti. In più i documenti dei clienti sono pubblici e la restrizione di nginx su `/admin` si aggira con un header falsificato. Nessun rilievo è P0 sui soli file; il rilievo 1 diventerebbe P0 se il pannello `admin` avesse autenticazione debole o assente (non verificato).

Sono rilievi P1 formulati da un modello più piccolo di Opus: propongo il riesame del direttore AICA-01 o di un revisore su Opus prima che diventino definitivi.

## Perimetro e metodo
- Perimetro: `infra/security-group.json`, `infra/wg0.conf`, `infra/docker-compose.yml`, `infra/nginx.conf`, confrontati con la sezione Architettura di `README.md`.
- Metodo: analisi documentale in sola lettura. Nessuna scansione, nessun processo avviato, nessun file modificato. Biblioteca e direttore AICA-01 non disponibili in questa prova.

## Rilievi

### 1. P1 — Pannello admin raggiungibile da Internet senza VPN
- Dove: `infra/security-group.json:9`, `infra/docker-compose.yml:24-25`.
- Fatto: `admin` pubblica `8081:8081` sull'host e il security group apre `8000-8100` a `0.0.0.0/0` («servizi applicativi»), intervallo che include 8081.
- Effetto: chi raggiunge la 8081 non passa da nginx e dal suo `allow 10.8.0.0/24`. Il README dice che `/admin` è solo da VPN. Il pannello gestisce utenti, ruoli, listini, esportazioni.
- Correzione: togliere `ports` da `admin` (raggiungibile solo da `edge` sulla rete Docker) e restringere o eliminare `8000-8100`.
- Verifica: 8081 non risponde dall'esterno; `/admin/` funziona solo dalla VPN.

### 2. P1 — SSH aperto a Internet
- Dove: `infra/security-group.json:8`. La 22 ha sorgente `0.0.0.0/0`; il README dice solo VPN `10.8.0.0/24`.
- Impatto: brute force e vulnerabilità di sshd sulla via amministrativa.
- Correzione: limitare a VPN o IP di ufficio noti (anche con firewall locale sull'host, perché il traffico VPN arriva decapsulato).
- Verifica: da un IP esterno la 22 non è raggiungibile.

### 3. P1 — `/files/` serve documenti dei clienti senza autenticazione
- Dove: `infra/nginx.conf:39-41` (`alias /srv/uploads/;`, nessun `auth_request` o `internal`). Contenuti: DDT e ordini firmati (README).
- Ipotesi da verificare: con nomi file prevedibili chiunque legge i documenti di tutti i clienti, bypassando la separazione per cliente. Non ho verificato come l'app nomina i file.
- Rischio collegato: file serviti sulla stessa origine, senza `X-Content-Type-Options` né `Content-Disposition`, quindi stored XSS se si caricano HTML o SVG (dipende dalle regole di upload dell'app, non esaminata).
- Dati personali possibili: coinvolgere la Privacy & Compliance Agency.
- Correzione: controllo di accesso nell'app (`auth_request` o `X-Accel-Redirect` con `internal`), `Content-Disposition: attachment`, `nosniff`.
- Verifica: URL `/files/...` senza sessione risponde 401 o 403; un cliente non legge i file di un altro.

### 4. P1 — Il controllo di `/admin` si aggira con `X-Forwarded-For`
- Dove: `infra/nginx.conf:9-11` e `43-47`.
- Fatto: `set_real_ip_from 0.0.0.0/0` con `real_ip_header X-Forwarded-For` e `real_ip_recursive on` fa fidare nginx di qualunque valore; `allow 10.8.0.0/24; deny all;` valuta l'indirizzo riscritto.
- Ipotesi (non provata, test attivi non ammessi): una richiesta con `X-Forwarded-For: 10.8.0.10` verrebbe trattata come VPN e supererebbe la restrizione.
- Aggravanti: il README dice che il bilanciatore «passa il TCP» e «aggiunge `X-Forwarded-For`», ma un bilanciatore TCP non aggiunge header HTTP: descrizione incoerente da chiarire. La 443 è aperta a `0.0.0.0/0` (`security-group.json:5`), quindi il bilanciatore si può bypassare.
- Correzione: `set_real_ip_from` solo con IP o subnet reali del bilanciatore (o PROXY protocol); chiudere la 443 diretta se non serve; per `/admin` non dipendere da un valore derivato da un header.
- Verifica: richiesta da Internet con XFF interno riceve 403.

### 5. P2 — `db` anche sulla rete `frontend`
- Dove: `infra/docker-compose.yml:34` (`networks: [backend, frontend]`). Il README dice solo `backend`, che è `internal: true`; `frontend` no.
- Impatto: `edge` e `admin` raggiungono Postgres, e `db` ha un percorso di uscita. Nessuna porta pubblicata, quindi non è esposto a Internet.
- Correzione: `networks: [backend]`.
- Verifica: `edge` non risolve né raggiunge `db`.

### 6. P2 — `/metrics` pubblico
- Dove: `infra/nginx.conf:54-56`, nessun `allow`/`deny`. Il README dice che è per Prometheus in ufficio.
- Impatto: metriche leggibili da chiunque (rotte, volumi, versioni).
- Correzione: `allow` ai soli IP VPN con `deny all` (senza dipendere dal solo XFF, vedi rilievo 4), oppure togliere la location dal proxy pubblico e far raccogliere le metriche via VPN.
- Verifica: da Internet `/metrics` risponde 403 o 404.

### 7. P3 — Segmentazione VPN larga
- Dove: `infra/nginx.conf:44`, `infra/wg0.conf:8-18`. `allow 10.8.0.0/24` ammette anche il peer Prometheus `10.8.0.20`. Il peer `10.8.0.11` (riga 11-13) non ha commento sul proprietario; nessuna `PresharedKey`. Gli `AllowedIPs` `/32` sono corretti.
- Correzione: `allow` solo per `10.8.0.10` e `10.8.0.11`; documentare ogni peer.

### 8. P3 — Uscita molto ampia
- Dove: `infra/security-group.json:12-16`. TCP/443, DNS e NTP verso `0.0.0.0/0` (motivazione dichiarata: webhook, registro immagini, SIEM).
- Impatto: facilita esfiltrazione e SSRF tramite i webhook se le destinazioni non sono validate.
- Correzione: proxy in uscita o liste di destinazioni; validazione delle destinazioni dei webhook nell'app.

### 9. P3 — Rafforzamenti
- `infra/nginx.conf`: mancano `X-Content-Type-Options`, CSP, `X-Frame-Options`, `limit_req`, un `server` di default per host sconosciuti; il redirect alla riga 19 usa `$host` (dal client).
- `infra/docker-compose.yml:16` e `:23`: `app` e `admin` condividono lo stesso `.env` (tutti i segreti a entrambi). Il `.env` non era tra i file esaminati.
- `infra/security-group.json:10`: la regola 9100 da `10.8.0.0/24` è probabilmente superflua (il traffico VPN arriva decapsulato). Non verificato con il provider.

## Limiti e aree non verificate
- Non ho letto `app/`, `iam/`, `logging/`: autenticazione del pannello `admin`, nomi dei file caricati e gestione di XFF nell'app non verificati.
- Non verificati: bilanciatore, firewall dell'host, comportamento reale del provider, `.env`.
- Nessun test attivo: i rilievi 1, 2 e 4 vanno confermati con una prova autorizzata per iscritto, con regole di ingaggio.

## Rischio residuo e nuova verifica
Dopo le correzioni dei punti 1-4 restano i rilievi P2 e P3. Ripetere questa revisione sui file modificati e aggiungere una verifica autorizzata dall'esterno di porte (22, 8081, 443), `/files/` e `/metrics`.

— AICA-05 · ALNITAK
