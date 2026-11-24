AICA-09 · WEZEN — Senior Vulnerability Management Engineer, reparto AICA (AI Cybersecurity)

# Registro delle vulnerabilità e piano di correzione: portale ordini, scansione 2026-11-20

## Sintesi per la direzione
Lo scanner riporta 9 voci, che sono 8 rilievi distinti perché FNSA-2026-0254 compare due volte. Dopo la contestualizzazione:

- **Due rilievi sono da trattare entro la scadenza di 7 giorni (27/11/2026).** Mancano 3 giorni.
  - **multipart-lite:** lo scanner dice "medium", ma lo sfruttamento è osservato in rete.
  - **xml-mapper:** è raggiungibile da qualunque cliente autenticato, perché `/api/orders/import` chiama `xml.parse` sul corpo della richiesta.
- **Un rilievo "critical" va declassato.** docgen-lite è una dipendenza solo di sviluppo e non è nell'immagine di produzione.
- **Un rilievo va chiuso come falso positivo.** Il lockfile attuale ha già express 4.21.2, mentre lo scanner vede la 4.19.2.
- **Un'eccezione è scaduta.** Quella di pino-abstract-transport è finita il 30/09/2026 e non è più valida.

Questo è un registro di priorità su evidenze documentali, non una dichiarazione di sicurezza del portale.

## Perimetro e metodo
- **Perimetro e autorizzazione.** Ho analizzato solo documenti e file di configurazione nella copia del progetto, in sola lettura. Non ho fatto scansioni attive, exploit o modifiche, e non ho avviato processi. L'autorizzazione e il proprietario delle risorse sono quelli indicati nel README del progetto.
- **File esaminati.** `security/scan-2026-11-20.json`, `scanner-ignore.yml`, `security/README.md`, `app/package.json`, `app/package-lock.json`, `Dockerfile`, `server.js`, `orders.js`, `upload.js`, `infra/*`, `iam/access-review-2026-11.csv` e il README.
- **Tempi concordati** (da `security/README.md`, dalla data del rapporto 20/11/2026): P0 48 ore, P1 7 giorni, P2 30 giorni, P3 90 giorni.
- **Criterio.** Ho pesato raggiungibilità nel codice, esposizione, sfruttamento osservato (EPSS e KEV) e controlli compensativi. Il solo CVSS non decide la priorità.
- **Schede della biblioteca.** Non ho consultato la scheda cvss-4: il tool library non è disponibile in questa prova. Uso il CVSS riportato dallo scanner come dato in ingresso. Questa nozione può essere superata.

## Registro (priorità contestualizzate)

| ID | Pacchetto | Scanner | Priorità | Azione | Scadenza |
|---|---|---|---|---|---|
| FNSA-2026-0287 | multipart-lite 2.3.0 | medium (5.3) | **P1** (alzare) | Aggiornare a 2.3.4 | 27/11/2026 |
| FNSA-2026-0254 | xml-mapper 1.8.2 (2 percorsi) | high (7.5) | **P1** (unire e confermare) | Migrare a 2.0.0 con modifica del codice | 27/11/2026 |
| IMG-2026-4471 | libssl3 (immagine) | high (7.4) | **P2** (declassare) | Ricostruire l'immagine con libssl3 3.0.15-1~deb12u2 | 20/12/2026 |
| FNSA-2026-0102 | pino-abstract-transport 2.0.0 | high (7.1), soppresso | **P3** (eccezione scaduta, riaprire) | Aggiornare pino a 9.6.0 o superiore | 18/02/2027 |
| FNSA-2026-0311 | docgen-lite 0.9.4 | critical (9.8) | **P3** (declassare) | Aggiornare a 0.9.6 | 18/02/2027 |
| FNSA-2026-0140 | minimatch 9.0.4 | high (7.5), soppresso | **P3** (eccezione da rivedere) | Mantenere l'eccezione, aggiornare con eslint | 28/02/2027 |
| IMG-2026-3902 | perl-base | low (3.3) | **P3** (accettare con eccezione) | Nessuna correzione disponibile | 18/02/2027 (nuova verifica) |
| FNSA-2026-0198 | express 4.19.2 | medium (6.1) | **Chiudere dopo verifica** | Rilievo non coerente con il lockfile | n/d |

## Dettaglio per rilievo

**1. FNSA-2026-0287, multipart-lite: alzare a P1**
- Fatti:
  - lo scanner segnala sfruttamento osservato dall'ottobre 2026 (known_exploited true) ed EPSS 0,71;
  - `app/upload.js` chiama `multipart.single(req, ...)` sulla rotta `POST /api/files`;
  - la rotta richiede un account, ma i clienti registrati sono circa 1.400 aziende;
  - Node ha un solo ciclo di eventi, quindi un blocco di decine di secondi ferma tutto il portale per tutti gli utenti.
- Impatto: indisponibilità del portale, per un attaccante con un solo account cliente. Il CVSS 5.3 sottostima il rischio.
- Controllo compensativo: non ne ho trovati. nginx non limita le richieste né filtra il Content-Type.
- Correzione: aggiornare multipart-lite a 2.3.4 e rigenerare il lockfile.
- Mitigazione temporanea fino all'aggiornamento: nginx può rifiutare i `Content-Type` multipart con boundary anomalo (lunghezza o caratteri) e limitare le richieste per IP su `/api/files`. Serve l'approvazione del responsabile e un piano di rollback.
- Verifica: una nuova scansione senza il rilievo e un test di upload valido.
- Ipotesi da confermare: la correzione 2.3.4 e la sua compatibilità con la rotta di upload vengono dallo scanner. Non le ho verificate sull'advisory.

**2. FNSA-2026-0254, xml-mapper: unire le due voci, P1**
- Fatti:
  - lo stesso ID compare per `node_modules/xml-mapper` e per la copia annidata in `multipart-lite/node_modules/xml-mapper`: è un solo rilievo con due percorsi;
  - `orders.js` esegue `xml.parse(req.body.xml, { resolveExternal: false })` sul corpo di `/api/orders/import`;
  - il commento nel codice dice che `resolveExternal: false` protegge dalle entità esterne. Questo non riguarda la prototype pollution, e lo scanner dice che il difetto vale "con qualunque opzione". L'opzione quindi non mitiga.
- Impatto: chiunque abbia un account cliente può inquinare i prototipi di Node con XML non fidato. Le conseguenze dipendono dal codice che legge poi quegli oggetti (per esempio i controlli su `role`), che non ho analizzato a fondo.
- Correzione:
  - il fix esiste solo nella 2.0.0 ed è una modifica incompatibile: `parse` diventa `parseDocument` e restituisce un oggetto senza prototipo. Va cambiato `orders.js` (e il test relativo) insieme alla versione.
  - la copia annidata sotto multipart-lite dovrebbe sparire con multipart-lite 2.3.4. In caso contrario serve un `overrides` in `package.json` oppure un riesame della dipendenza.
- Se la migrazione non è pronta entro il 27/11/2026, serve un'eccezione formale con scadenza breve e un controllo compensativo. Il controllo può essere un filtro sul XML in ingresso che rifiuta nomi di elemento `__proto__`, `constructor` e `prototype`. Il rilievo resta comunque P1.

**3. IMG-2026-4471, libssl3: declassare a P2**
- Fatti:
  - la lettura fuori dai limiti nella verifica dei certificati X.509 richiede un certificato costruito ad arte durante un handshake TLS;
  - l'app fa connessioni in uscita verso URL scelti dall'utente (`testWebhook`, `fetch(url)`), quindi un cliente autenticato può farla parlare con un server che controlla;
  - nginx usa un'immagine Alpine diversa, che questa voce non riguarda;
  - EPSS 0,04, nessuno sfruttamento osservato.
- Valutazione: lo scenario è realistico ma con esito poco chiaro (di solito crash o fuga di memoria limitata), e richiede un account. P2 è proporzionato.
- Correzione: ricostruire l'immagine con la base aggiornata (libssl3 3.0.15-1~deb12u2) o con un tag di `node:22` più recente, e ripubblicare.
- La rotta `testWebhook` ha anche un tema di SSRF: i controlli sull'host sono deboli, per esempio non fermano gli indirizzi interni oltre `localhost`. Fuori dal mio ruolo, da passare a sec-appsec-engineer.

**4. FNSA-2026-0102, pino-abstract-transport: eccezione scaduta, riaprire**
- Fatti:
  - l'eccezione scadeva il 30/09/2026, ma il rapporto del 20/11/2026 mostra ancora "suppressed (scanner-ignore.yml)";
  - secondo la regola del progetto, a scadenza il rilievo torna aperto: lo scanner non lo fa, quindi la soppressione non rispetta `expires`;
  - la correzione era attesa con pino 9.6.0, uscito il 07/10/2026 (come dice il rapporto), e l'eccezione non è stata ritirata;
  - il lockfile ha ancora pino 9.5.0 e pino-abstract-transport 2.0.0.
- Raggiungibilità: `server.js` crea `pino({ redact: [...] })` senza transport, e `logging/` non configura una destinazione scelta dall'esterno. Lo sfruttamento richiede una destinazione controllata dall'esterno, quindi per ora non è raggiungibile.
- Valutazione: P3 per rischio effettivo. È però una questione di processo: l'eccezione è scaduta da quasi due mesi e il referente (a.bianchi, ancora attivo e admin) non l'ha rinnovata né chiusa.
- Correzione: aggiornare pino a 9.6.0 o superiore e rimuovere l'eccezione. Correggere o verificare lo scanner perché rispetti `expires`.

**5. FNSA-2026-0311, docgen-lite: declassare a P3**
- Fatti:
  - è una `devDependency` (`dev: true` nel lockfile);
  - il Dockerfile usa `npm ci --omit=dev`, quindi non è nell'immagine di produzione;
  - lo script `build:docs` lo esegue in CI su `src docs`, cioè su sorgenti del repository;
  - EPSS 0,02, nessuno sfruttamento.
- Valutazione: un template ostile dovrebbe arrivare nel repository tramite una modifica approvata. Il 9,8 non descrive questo contesto. Resta un rischio per la catena di fornitura della CI (segreti della CI, se ci sono), da qui P3 e non chiusura.
- Correzione: aggiornare a 0.9.6 alla prossima manutenzione. Verificare che la CI non abbia segreti di produzione nel job di documentazione (non verificato: non ho il file della CI).

**6. FNSA-2026-0140, minimatch: eccezione ragionevole, da rivedere**
- Fatti:
  - è una devDependency usata solo da eslint in CI;
  - i pattern vengono dalla configurazione del lint, controllata dal team;
  - l'eccezione è valida fino al 28/02/2027, con referente.
- Valutazione: P3, la motivazione regge.
- Da fare: mantenere l'eccezione e verificare alla scadenza. Un aggiornamento di eslint la chiude in modo naturale.

**7. IMG-2026-3902, perl-base: accettare con eccezione**
- Fatti: nessuna correzione disponibile, serve eseguire script Perl con input dell'attaccante, e Node non usa Perl a runtime.
- Valutazione: P3.
- Azione: registrare un'eccezione con motivazione, referente e scadenza (per esempio 90 giorni), e rivederla quando esce un pacchetto corretto.

**8. FNSA-2026-0198, express: probabile falso positivo**
- Fatti: lo scanner indica express 4.19.2 con correzione 4.20.0. `app/package.json` e il lockfile attuale indicano express 4.21.2, già successiva alla correzione.
- Ipotesi: lo scanner ha letto un lockfile più vecchio. Il rapporto cita il commit `3f2a9c1` del 2026-08-14, quindi forse non è la versione in esame. Se è così, la scansione non riflette lo stato attuale.
- Azione: ripetere la scansione sul commit attuale. Se express risulta a 4.21.2, chiudere il rilievo.
- Questo vale anche per gli altri rilievi: confermare le versioni installate contro il commit corrente prima di chiuderli.

## Eccezioni da rivedere
1. FNSA-2026-0102: scaduta e non più valida. Riaprire, aggiornare pino e rimuovere la voce. Verificare perché lo scanner continua a sopprimerla.
2. FNSA-2026-0140: valida fino al 28/02/2027, da mantenere.
3. IMG-2026-3902: nuova eccezione da registrare.

## Limiti e aree non verificate
- Le immagini `edge` (nginx 1.27.3-alpine), `admin` (portale-admin 1.9.0), postgres 16.6, redis 7.4.1 e node-exporter non risultano nella scansione. Lo scanner copre solo `app/package-lock.json` e l'immagine dell'app. Chiedere se sono coperte da un altro processo.
- Il file della CI non è nella copia, quindi non so cosa vede il job `build:docs`.
- Non ho verificato gli advisory sulle fonti ufficiali: né accesso al web né biblioteca. Le versioni corrette vengono dallo scanner.
- Il lockfile nella copia è molto ridotto e non mostra tutte le dipendenze transitive: la scansione completa va rifatta su quello reale.
- Non ho eseguito alcun test attivo né provato gli sfruttamenti.

## Piano della nuova verifica
1. Subito: ripetere la scansione sul commit attuale per confermare le versioni (express, pino).
2. Entro il 27/11/2026: correggere multipart-lite e xml-mapper (con modifica del codice e dei test) e ripubblicare.
3. Entro il 20/12/2026: ricostruire l'immagine con libssl3 aggiornata.
4. Entro il 18/02/2027: aggiornare pino, docgen-lite ed eslint, e chiudere le eccezioni.
5. Dopo ogni correzione: nuova scansione completa e controllo che i rilievi siano chiusi. Lo stato "chiuso" richiede la nuova scansione, non solo la modifica del lockfile.

## Nota per la direzione del reparto
Sono un modello più piccolo (Sonnet) e ho due rilievi P1. Propongo il riesame di AICA-01 · VEGA o di un revisore su Opus prima che le priorità diventino definitive. In particolare vanno rivisti il rialzo di multipart-lite e il giudizio sul reale impatto di xml-mapper, che dipende da codice a valle che non ho letto.

Per la raccolta dei dati personali nella rotta di export e per la SSRF di `testWebhook` suggerisco il passaggio rispettivamente a Privacy & Compliance Agency e a sec-appsec-engineer.

— AICA-09 · WEZEN
