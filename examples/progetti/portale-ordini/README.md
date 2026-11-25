# Portale ordini di «Ferramenta Nord»

Portale B2B per gli ordini dei clienti di un grossista: i clienti ordinano e caricano documenti (DDT, ordini firmati), gli operatori del magazzino gestiscono gli ordini, gli amministratori gestiscono utenti e listini. Progetto di prova: nomi, chiavi, indirizzi e log sono finti.

## Architettura

- Una VM nel cloud con Docker Compose: `edge` (nginx, unico punto d'ingresso pubblico, porte 80 e 443), `app` (API Node, porta 3000), `admin` (pannello interno, porta 8081), `db` (Postgres), `cache` (Redis).
- Davanti alla VM c'è il bilanciatore del provider, che non termina TLS: passa le connessioni TCP a nginx così come arrivano, senza aggiungere intestazioni, e nginx vede l'IP del client come indirizzo della connessione.
- Reti: `frontend` per `edge`, `app` e `admin`; `backend` per `app`, `admin`, `db` e `cache`. Il database e la cache stanno solo su `backend`.
- `/admin` e SSH sono raggiungibili solo dalla VPN dell'ufficio (WireGuard, `10.8.0.0/24`).
- I file caricati dai clienti stanno nel volume `uploads` e nginx li serve sotto `/files/`.
- `/healthz` serve al bilanciatore; `/metrics` è per Prometheus, che gira nella rete dell'ufficio.

## Utenti e ruoli

- `customer`: cliente, vede e crea solo i suoi ordini.
- `operator`: magazzino, gestisce gli ordini di tutti i clienti.
- `auditor`: revisore esterno, sola lettura su ordini e utenti.
- `admin`: utenti, ruoli, listini, esportazioni.

Le regole sugli accessi sono in [`iam/README.md`](iam/README.md).

## Log e monitoraggio

- L'app scrive log JSON; Vector li manda al SIEM (`logging/`).
- Requisito interno: log di sicurezza conservati 90 giorni. Il SIEM conserva gli eventi 30 giorni; l'archivio locale sulla VM è il secondo livello.
- Il servizio di uptime esterno (`198.51.100.20`) chiama `/healthz` e `/status` ogni 30 secondi; gli errori 404 su `/status` sono noti (la pagina è stata tolta).

## Vulnerabilità

- Scanner sulle dipendenze e sull'immagine ogni settimana (`security/`). Le eccezioni sono in `security/scanner-ignore.yml`, con motivazione e scadenza.
- In produzione va solo l'immagine dell'app, costruita con `npm ci --omit=dev`.
