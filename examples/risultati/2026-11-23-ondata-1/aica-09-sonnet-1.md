AICA-09 · WEZEN — Senior Vulnerability Management Engineer, reparto AICA (AI Cybersecurity)

# Registro delle vulnerabilità e piano di correzione — portale-ordini 2.4.1
Fonte: `security/scan-2026-11-20.json`, 9 voci (8 ID distinti). Analisi documentale in sola lettura, nessuna scansione attiva, nessun file modificato. Il direttore AICA-01 e la biblioteca non erano disponibili in questa prova: non ho letto la scheda cvss-4, quindi la contestualizzazione usa il CVSS riportato dallo scanner e i dati EPSS e di sfruttamento noto che lo scanner stesso fornisce.

## Sintesi per la direzione
- Il rilievo più urgente è **FNSA-2026-0287 (multipart-lite)**. Lo scanner lo classifica medio con CVSS 5.3, ma è sfruttato attivamente in rete (EPSS 0.71) e raggiungibile da un qualsiasi account cliente, circa 1.400. Alzato a **P1**.
- **FNSA-2026-0311 (docgen-lite)** è segnalato critico ma è solo in CI, non entra nell'immagine di produzione. Declassato a P3.
- **FNSA-2026-0198 (express)** sembra un falso positivo: il lockfile attuale ha già la 4.21.2.
- **FNSA-2026-0102 (pino-abstract-transport)**: l'eccezione è scaduta il 2026-09-30, la correzione esiste dal 2026-10-07 e lo scanner continua a sopprimere il rilievo.
- **FNSA-2026-0254 (xml-mapper)** compare due volte ma è un unico intervento. È raggiungibile con XML non fidato e la correzione cambia l'API.
- Copertura incompleta: lo scanner non esamina le altre immagini del compose.

## Perimetro e autorizzazioni
Repository della copia di prova: `app/`, `infra/`, `security/`, `iam/`, `logging/`. Lo scanner indica come target `app/package-lock.json` al commit 3f2a9c1 (2026-08-14) e l'immagine `portale-ordini:2.4.1`. Il progetto è dichiarato di prova. Non ho eseguito verifiche attive né contattato servizi esterni.

## Metodologia
Ho incrociato ogni rilievo con:
- `app/package.json` e `app/package-lock.json`;
- il codice che usa il pacchetto (`server.js`, `upload.js`, `orders.js`, `auth.js`);
- `app/Dockerfile` (`npm ci --omit=dev`);
- `infra/` (nginx, compose, security group);
- `security/README.md` e `security/scanner-ignore.yml`.

Le scadenze SLA sono calcolate dalla data del rapporto, 2026-11-20 (oggi 2026-11-24): P0 48 ore, P1 7 giorni, P2 30 giorni, P3 90 giorni.

## Registro

| ID | Pacchetto / ambito | Scanner | Proposta | Azione |
|---|---|---|---|---|
| FNSA-2026-0287 | multipart-lite 2.3.0 → 2.3.4, produzione | medium 5.3 | **P1, da alzare** | correggere |
| FNSA-2026-0254 | xml-mapper 1.8.2 → 2.0.0, produzione, 2 istanze | high 7.5 | **P1 per l'istanza di primo livello; unire le due istanze**; nessun cambio di priorità | correggere con modifica di codice |
| FNSA-2026-0102 | pino-abstract-transport 2.0.0 → 2.0.1 (pino 9.6.0) | high 7.1, soppresso | **P3, riaprire** | aggiornare pino, togliere l'eccezione |
| FNSA-2026-0311 | docgen-lite 0.9.4 → 0.9.6, dev | critical 9.8 | **P3, da declassare** | aggiornare in CI |
| FNSA-2026-0198 | express 4.19.2 → 4.20.0 | medium 6.1 | **da verificare, probabile falso positivo** | verificare e chiudere |
| FNSA-2026-0140 | minimatch 9.0.4 → 9.0.6, dev | high 7.5, soppresso | **P3, eccezione ancora valida** | aggiornamento facoltativo |
| IMG-2026-4471 | libssl3 (base Debian) | high 7.4 | **P3, da declassare e verificare** | ricostruire l'immagine |
| IMG-2026-3902 | perl-base, senza correzione | low 3.3 | **P3** | accettare con eccezione datata |

## Dettaglio dei rilievi

**FNSA-2026-0287 · multipart-lite · P1 (alzato da medio)**
- Fatti:
  - `app/upload.js` usa `multipart.single(req, …)` su `POST /api/files`;
  - la rotta richiede un account, ma i clienti sono circa 1.400 aziende;
  - lo scanner riporta EPSS 0.71 e sfruttamento osservato da ottobre 2026.
- Impatto: Node ha un solo ciclo degli eventi. Una singola richiesta blocca per decine di secondi tutta l'API, quindi anche ordini e login di tutti. Un account cliente basta per attaccare.
- Controlli compensativi: nessuno visibile. Nginx non ha limiti di richieste (`limit_req`) né `client_max_body_size`.
- Correzione: aggiornare a 2.3.4, patch nella stessa minor, scadenza **2026-11-27**.
- Ipotesi da verificare: per la settimana prima del rilascio si può valutare un filtro nginx sul `Content-Type` multipart. Il rilascio resta la correzione vera.

**FNSA-2026-0254 · xml-mapper · P1 (livello confermato, due istanze da unire)**
- Fatti:
  - `app/orders.js` chiama `xml.parse(req.body.xml, { resolveExternal: false })` in `importXml`, raggiungibile da qualsiasi utente autenticato su `POST /api/orders/import`;
  - l'XML arriva dal client e il commento nel codice riguarda solo le entità esterne;
  - la descrizione dello scanner dice che la vulnerabilità si presenta «con qualunque opzione», quindi `resolveExternal: false` non protegge;
  - la correzione esiste solo nella 2.0.0 e non c'è backport nella 1.x.
- Istanza annidata (`multipart-lite/node_modules/xml-mapper`): da verificare se `multipart-lite` chiama davvero `parse()`. Dal lato upload non risulta, perché il codice del progetto non lo usa. Va letto il sorgente di multipart-lite 2.3.4. Se la 2.3.4 aggiorna il pacchetto annidato o accetta un `overrides` di npm, l'istanza sparisce; altrimenti si usa `overrides` nel `package.json`. Va trattata come stessa correzione dell'istanza principale.
- Impatto: prototype pollution del processo. L'effetto dipende dai gadget presenti. Nel codice letto non ne ho visti, ma non ho analizzato `db.js` né le dipendenze. Questa è un'ipotesi, non un fatto.
- Correzione: passare alla 2.0.0 e adattare `orders.js` (`parse` diventa `parseDocument`, che restituisce un oggetto senza prototipo). Servono un test dell'import con XML valido e uno con nomi di elemento ostili. Scadenza **2026-11-27**.
- Alternativa se la migrazione non è pronta in 7 giorni: disattivare la rotta di import (richiede approvazione) o limitarla a ruoli interni, con eccezione datata e motivata.

**FNSA-2026-0102 · pino-abstract-transport · P3, riaprire**
- Fatti:
  - l'eccezione in `scanner-ignore.yml` scadeva il 2026-09-30 ed è scaduta;
  - per `security/README.md` un'eccezione scaduta torna aperta, ma il rapporto la mostra ancora «suppressed»;
  - pino 9.6.0 con il pacchetto corretto è uscito il 2026-10-07;
  - il lockfile ha pino 9.5.0.
- Raggiungibilità: `server.js` usa `pino({ redact: [...] })` senza transport e senza destinazione dall'esterno. Non ho trovato percorsi controllati dall'utente. Gravità effettiva bassa, perciò P3 e non P1 come darebbe il CVSS 7.1.
- Correzione: aggiornare pino a 9.6.0 o superiore e rimuovere l'eccezione, scadenza 2027-02-18.
- Processo: lo scanner non rispetta la data di scadenza delle eccezioni. Va corretto il processo, altrimenti altri rilievi restano nascosti. Vedi i punti trasversali.

**FNSA-2026-0311 · docgen-lite · P3 (declassato da critico)**
- Fatti:
  - `scope: devDependencies`, quindi fuori dall'immagine perché `Dockerfile` usa `npm ci --omit=dev`;
  - è usato solo da `build:docs` in CI sui sorgenti del repository;
  - EPSS 0.02, nessuno sfruttamento noto.
- Rischio residuo: l'esecuzione di codice avviene in CI, non in produzione. Per un attaccante servirebbe poter modificare i template o i sorgenti documentati.
- Da verificare: chi può proporre modifiche ai template e quali segreti ha la CI. Se la CI ha segreti di rilascio, la priorità può salire a P2.
- Correzione: aggiornare a 0.9.6, scadenza 2027-02-18.

**FNSA-2026-0198 · express · da verificare, probabile falso positivo**
- Fatti: lo scanner riporta 4.19.2, ma `app/package.json` e il lockfile attuale hanno 4.21.2, già successiva alla correzione 4.20.0. Il rapporto indica il commit 3f2a9c1 del 2026-08-14, che potrebbe essere precedente al lockfile attuale.
- Raggiungibilità: nel codice non c'è `res.redirect` né `res.location`. Il campo `redirect` del login è solo JSON.
- Azione: rieseguire lo scanner sul commit corrente. Se non ricompare, chiuderlo. Se ricompare con 4.19.2, capire perché il lockfile e lo scanner divergono.
- Collegato: se il rapporto è davvero vecchio, anche altri rilievi potrebbero essere cambiati. Va ricontrollata la data del lockfile analizzato.

**FNSA-2026-0140 · minimatch · P3, eccezione valida**
- L'eccezione (scadenza 2027-02-28) è motivata e coerente: è una dipendenza di eslint, solo dev, con pattern controllati da noi. Non c'è nulla da riaprire.
- Aggiornamento opzionale: `eslint` richiede `^9.0.4`, quindi 9.0.6 rientra nell'intervallo con un normale `npm update`.

**IMG-2026-4471 · libssl3 · P3 (declassato da alto), da verificare**
- Fatti: il rilievo è sul pacchetto Debian della base `node:22.11.0-bookworm-slim`.
- Ipotesi: Node usa l'OpenSSL incorporato nel proprio binario, non la libssl3 di sistema, quindi l'app non dovrebbe passare per il pacchetto Debian. Va confermato, perché lo scanner non analizza l'OpenSSL interno a Node.
- Azione: ricostruire l'immagine su una base aggiornata (rilascio normale, entro 90 giorni, 2027-02-18). Se nell'immagine ci sono altri programmi che usano libssl3 (da verificare con l'elenco dei pacchetti), rivalutare.
- Segnalazione: la base Node 22.11.0 è anche vecchia di per sé. Non ho dati sulle vulnerabilità del runtime Node e lo scanner non le riporta.

**IMG-2026-3902 · perl-base · P3**
- Nessuna correzione disponibile, rischio basso (richiede script Perl con input dell'attaccante, che l'app non esegue).
- Azione: registrare un'eccezione con motivazione, referente e scadenza, e ricontrollare quando Debian pubblica la correzione.

## Eccezioni da rivedere
- `FNSA-2026-0102`: scaduta il 2026-09-30, motivazione superata dalla 9.6.0. Rimuovere dopo l'aggiornamento di pino.
- `FNSA-2026-0140`: valida fino al 2027-02-28, motivazione corretta. Mantenere.
- Da aggiungere: `IMG-2026-3902` (perl-base).

## Punti trasversali
1. Lo scanner sopprime eccezioni scadute: da correggere subito (controllo in CI, o rapporto che segnali le eccezioni scadute).
2. Il perimetro dello scanner è parziale: copre solo `app/` e l'immagine `portale-ordini`. Non coprono nginx, postgres, redis, node-exporter e l'immagine `portale-admin:1.9.0`, di cui non c'è nemmeno un lockfile. Priorità da stabilire dopo l'inventario.
3. Fuori dal mio ruolo, da passare al reparto competente: `requireAdmin` in `auth.js` ammette ogni ruolo diverso da `customer`, quindi anche `operator` e `auditor` possono chiamare `setRole` e l'esportazione clienti. Per la gestione delle vulnerabilità è rilevante perché amplifica l'impatto di un eventuale compromesso. Lo segnalo ad AICA-01 per IAM e AppSec.
4. Il security group espone 22 e 8000-8100 a `0.0.0.0/0`, contro il README che dice che SSH è solo da VPN. Anche questo va passato a cloud security.

## Piano di correzione e nuova verifica
1. Entro 2026-11-27: aggiornare multipart-lite a 2.3.4 e xml-mapper a 2.0.0 (con adattamento di `orders.js`).
2. Entro 2026-11-27: rieseguire lo scanner sul commit corrente per chiudere il caso express e confermare il pacchetto annidato.
3. Entro 2027-02-18 (P3): pino 9.6.0 o superiore, docgen-lite 0.9.6, ricostruzione dell'immagine su base aggiornata, eccezione per perl-base.
4. Nuova verifica: scanner in CI dopo ogni correzione. Per xml-mapper e multipart-lite servono anche test funzionali dell'import e dell'upload.
5. Ogni modifica a codice, dipendenze o produzione richiede approvazione dell'utente e piano di rollback.

## Limiti
- Non ho verificato i sorgenti dei pacchetti in `node_modules` (non presenti), quindi la raggiungibilità di xml-mapper annidato e libssl3 resta ipotesi.
- Non ho riscontrato in rete le informazioni su EPSS e sfruttamento: sono quelle riportate dallo scanner, al 2026-11-20.
- Non ho letto `db.js`, `mail.js` né il pannello `admin`.
- Questo registro non certifica la sicurezza del progetto.

**Proposta di riesame:** lavoro su Sonnet. Chiedo il riesame del direttore AICA-01 o di un revisore su Opus per i due rilievi P1 (multipart-lite, xml-mapper) e per i declassamenti di docgen-lite e libssl3, prima che diventino definitivi.

Firmato: AICA-09 · WEZEN
