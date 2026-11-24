AICA-09 · WEZEN — Senior Vulnerability Management Engineer, reparto AICA (AI Cybersecurity)

# Registro delle vulnerabilità: Portale ordini, scansione del 2026-11-20

## 1. Sintesi per la direzione

Il rapporto contiene 9 rilievi. Due ID sono duplicati, quindi le vulnerabilità distinte sono 8. Le severità dello scanner non corrispondono al rischio reale di questo progetto:

- **Da alzare.** `multipart-lite` (FNSA-2026-0287): lo scanner la dà "medium" (CVSS 5.3), ma è sfruttata in rete (EPSS 0.71) e raggiungibile da `/api/files`. Basta un account cliente per bloccare l'intero portale, che gira su un solo processo Node → **P1**.
- **Da declassare.** `docgen-lite` (CVSS 9.8, "critical") è solo di sviluppo, non è nell'immagine e lavora su template del repository → **P3**. Anche `minimatch` è solo di sviluppo → **P3**.
- **Da unire.** Le due voci `xml-mapper` (FNSA-2026-0254) diventano un solo rilievo **P1**, con due interventi distinti.
- **Da verificare.** `express` (FNSA-2026-0198) sembra superato: il lockfile attuale ha 4.21.2. Anche `libssl3` va verificato: Node potrebbe non usare la libreria di sistema, e lo scanner non controlla l'OpenSSL incluso in Node.
- **Eccezioni.** Quella di `pino-abstract-transport` è **scaduta il 2026-09-30** e il rilievo risulta ancora soppresso. La sua condizione ("appena esce pino 9.6") si è avverata il 2026-10-07. Quella di `minimatch` regge.
- **Problema di processo.** La scansione delle dipendenze legge il lockfile del commit `3f2a9c1` (2026-08-14), non quello attuale. Lo scanner inoltre non applica le scadenze delle eccezioni. Finché non si corregge, il registro non è affidabile.

Nessun rilievo dello scanner è P0. Una delle osservazioni fuori dal rapporto (§9, porta 8081 del pannello admin aperta su Internet) va però guardata subito.

## 2. Perimetro e autorizzazioni

- **Esaminato:** `security/scan-2026-11-20.json`, `security/scanner-ignore.yml`, `security/README.md`, `README.md`, `app/*` (sorgenti, `package.json`, `package-lock.json`, `Dockerfile`), `infra/*`, `logging/*`. Tutti i percorsi sono relativi alla copia del progetto.
- **Modalità:** sola lettura, analisi documentale e del codice. Nessuna scansione attiva, exploit, build o processo avviato.
- **SLA** (`security/README.md`), calcolati dalla data del rapporto 2026-11-20: P0 entro il 2026-11-22, P1 entro il 2026-11-27, P2 entro il 2026-12-20, P3 entro il 2027-02-18.

## 3. Metodologia

Per ogni rilievo ho controllato quattro cose:
1. la versione installata nel lockfile attuale;
2. se il pacchetto finisce in produzione (`npm ci --omit=dev`, Dockerfile);
3. se il codice raggiunge la parte vulnerabile;
4. l'esposizione (autenticazione, rete) e i controlli compensativi.

Il CVSS l'ho usato come dato di partenza, non come decisione. La biblioteca del reparto (schede `cvss-4`, `owasp-top-10-2025`) non era disponibile in questa prova e non avevo accesso al web. Per questo le nozioni su CVSS e il comportamento di Node con OpenSSL vengono dalle mie conoscenze e vanno verificate.

## 4. Registro delle vulnerabilità

| # | ID | Pacchetto | Scanner | Priorità contestualizzata | Azione sul rilievo | Scadenza |
|---|---|---|---|---|---|---|
| V1 | FNSA-2026-0287 | multipart-lite 2.3.0 → 2.3.4 | 5.3 medium | **P1** | Alzare | 2026-11-27 |
| V2 | FNSA-2026-0254 (×2) | xml-mapper 1.8.2 → 2.0.0 | 7.5 high | **P1** (copia diretta); copia transitiva da verificare | Unire | 2026-11-27 |
| V3 | IMG-2026-4471 | libssl3 deb12u1 → deb12u2 | 7.4 high | **P2**, da verificare (sale a P1 se Node usa un OpenSSL vulnerabile) | Verificare | 2026-12-20 |
| V4 | FNSA-2026-0102 | pino-abstract-transport 2.0.0 → 2.0.1 | 7.1 high, soppresso | **P3** per la vulnerabilità, **P2** per l'eccezione scaduta | Riaprire | 2026-12-20 (correzione insieme a V1) |
| V5 | FNSA-2026-0198 | express 4.19.2 → 4.20.0 | 6.1 medium | Probabile falso positivo; **P3** se confermato in produzione | Verificare, poi chiudere | nuova scansione entro il 2026-11-27 |
| V6 | FNSA-2026-0311 | docgen-lite 0.9.4 → 0.9.6 | 9.8 critical | **P3** | Declassare | 2027-02-18 |
| V7 | FNSA-2026-0140 | minimatch 9.0.4 → 9.0.6 | 7.5 high, soppresso | **P3** | Declassare; eccezione valida | 2027-02-18, prima della scadenza dell'eccezione (2027-02-28) |
| V8 | IMG-2026-3902 | perl-base, nessuna correzione | 3.3 low | **P3** | Accettare con un'eccezione a scadenza | da rivedere alla correzione |
| V9 | — (processo) | scansione di un commit vecchio, scadenze non applicate | — | **P2** | Nuovo | 2026-12-20, nuova scansione subito |

### Dettaglio dei rilievi

**V1 · multipart-lite (FNSA-2026-0287): P1, da alzare**
- **Fatto:** è in `dependencies` e quindi nell'immagine. `app/upload.js:11` chiama `multipart.single(req, …)` su `POST /api/files`. Il rapporto la dà sfruttata in rete da ottobre 2026 (`known_exploited: true`, EPSS 0.71).
- **Contesto:** la rotta richiede un account (`requireUser`, `server.js:27`), ma i clienti registrati sono circa 1.400 aziende. Quindi l'attaccante ha bisogno solo delle credenziali di un cliente qualsiasi, o di un account rubato.
- **Impatto:** c'è un solo container `app` e un solo processo Node. Bloccare il ciclo degli eventi ferma tutto il portale, compreso `/healthz`. L'impatto è solo sulla disponibilità, non su riservatezza o integrità: per questo P1 e non P0.
- **Correzione:** aggiornare a 2.3.4 e rigenerare il lockfile. La 2.3.4 potrebbe portare con sé una nuova versione di xml-mapper (vedi V2).
- **Mitigazione temporanea:** in nginx, su `/api/files`, limitare la lunghezza di `Content-Type` e la frequenza delle richieste per IP o utente.
- **Rilevamento:** nessuna regola copre questo caso. PO-004 conta i 5xx, ma un blocco di "decine di secondi" può restare sotto i 60 secondi di timeout del proxy. Va proposta al SOC una regola su latenza o timeout e su `POST /api/files`.
- **Verifica:** il lockfile mostra 2.3.4 e una nuova scansione non riporta più il rilievo.

**V2 · xml-mapper (FNSA-2026-0254, due voci da unire): P1**
- **Copia diretta (`node_modules/xml-mapper`):** è raggiungibile. `app/orders.js:36` esegue `xml.parse(req.body.xml, …)` su XML inviato dal cliente (`POST /api/orders/import`, serve un account). L'opzione `resolveExternal: false` non protegge: l'advisory vale "con qualunque opzione". Inquinare il prototipo in un processo condiviso può influire sui controlli fatti su oggetti, come i ruoli in `requireAdmin` e le opzioni di libreria, oltre a bloccare il servizio.
- **Correzione della copia diretta:** passare a 2.0.0, che cambia l'API, e riscrivere `importXml` con `parseDocument`, con un test sull'import. La linea 1.x non ha correzioni.
- **Mitigazione temporanea fino al rilascio:** disattivare l'import XML, oppure rifiutare in ingresso i documenti che contengono nomi `__proto__`, `constructor` o `prototype`. Valutare anche l'opzione di Node `--disable-proto=delete` come difesa in profondità: è parziale.
- **Copia transitiva (`multipart-lite/node_modules/xml-mapper`):** da verificare. Non risulta che multipart-lite chiami `parse()` su dati non fidati (non è un'evidenza). Si verifica con l'aggiornamento di V1: se la 2.3.4 non porta xml-mapper 2.x, chiedere al progetto a monte. Un `overrides` forzato verso la 2.0.0 romperebbe multipart-lite, se usa `parse`.
- **Verifica:** `npm ls xml-mapper` mostra solo versioni ≥ 2.0.0 e la nuova scansione non riporta più il rilievo.

**V3 · libssl3 (IMG-2026-4471): P2, da verificare**
- **Ipotesi da verificare:** i binari ufficiali di Node includono di norma un proprio OpenSSL e non usano la `libssl3` del sistema. Se è così, il pacchetto del sistema non è usato dal processo. Lo scanner delle immagini però non vede l'OpenSSL incluso in Node, che potrebbe avere la stessa vulnerabilità.
- **Contesto che alzerebbe la priorità:** `orders.testWebhook` (`orders.js:42-48`) permette a un cliente autenticato di far aprire all'app una connessione TLS verso un server scelto da lui. È esattamente lo scenario "certificato costruito ad arte presentato dal peer". Se l'OpenSSL usato da Node è vulnerabile, il rilievo è P1.
- **Correzione:** ricostruire l'immagine su un `node:22` bookworm-slim aggiornato, con Node e OpenSSL recenti e `libssl3` deb12u2. Costa poco e conviene farlo in ogni caso.
- **Verifica:** nell'immagine, `node -p process.versions.openssl` e un controllo con `ldd` sul binario, poi una nuova scansione.

**V4 · pino-abstract-transport (FNSA-2026-0102): eccezione da riaprire**
- **Fatto:** l'eccezione è scaduta il 2026-09-30 e la scansione del 2026-11-20 la applica ancora (`status: suppressed`). Questo va contro la regola di `security/README.md:5`. La condizione della motivazione si è avverata: pino 9.6.0 è uscito il 2026-10-07, ma `package.json` è ancora a 9.5.0.
- **Contesto:** `server.js:7` crea pino senza `transport`, con l'output su stdout. Non c'è quindi una destinazione controllata dall'esterno, e la vulnerabilità non risulta raggiungibile → **P3**. La gestione dell'eccezione è invece un rilievo di processo **P2** (vedi V9).
- **Correzione:** pino 9.6.0 e rimozione della voce da `scanner-ignore.yml`. Conviene farlo nello stesso rilascio di V1.

**V5 · express (FNSA-2026-0198): da verificare, probabile falso positivo**
- **Fatto:** `package.json` e `package-lock.json` attuali hanno express 4.21.2, già oltre la 4.20.0 che corregge. La scansione si riferisce al lockfile del commit `3f2a9c1` del 2026-08-14. Il codice non usa né `res.redirect` né `res.location`: `login` restituisce `redirect` dentro il JSON.
- **Da verificare:** con quale commit è stata costruita l'immagine `portale-ordini:2.4.1` in produzione. Il numero di versione nel `package.json` è lo stesso, ma questo non lo prova.
- **Esito:** se l'immagine contiene la 4.21.2, si chiude come superato. Se contiene la 4.19.2, è P3 (la parte vulnerabile non è raggiungibile) e si ricostruisce l'immagine.

**V6 · docgen-lite (FNSA-2026-0311): da declassare a P3**
- **Fatto:** è in `devDependencies`, quindi fuori dall'immagine (`Dockerfile:4`, `--omit=dev`). Si usa solo in CI per `build:docs` su `src`, cioè su template e sorgenti del repository e non su input esterni.
- **Ipotesi:** se la CI esegue `build:docs` anche su pull request di terzi o fork, chi apre la PR controlla i template e può eseguire codice nel runner, che ha accesso a segreti e registro. In quel caso la priorità sale a P2.
- **Correzione:** aggiornare a 0.9.6. È una patch semplice e conviene farla subito, nonostante la priorità bassa.

**V7 · minimatch (FNSA-2026-0140): P3, eccezione valida**
- Dipendenza solo di sviluppo (eslint, in CI), con pattern della configurazione decisi dal team. La motivazione dell'eccezione è coerente e la scadenza (2027-02-28) ragionevole.
- **Correzione:** aggiornare eslint o minimatch prima della scadenza. Non serve rinnovare l'eccezione.

**V8 · perl-base (IMG-2026-3902): P3, eccezione da aggiungere**
- Non c'è correzione. Lo sfruttamento richiede di eseguire script Perl con input dell'attaccante, e l'app non esegue Perl.
- **Proposta:** registrare un'eccezione in `scanner-ignore.yml` con referente e scadenza (per esempio 90 giorni), da rivedere quando esce la correzione. In alternativa, valutare un'immagine base più ridotta.

**V9 · processo di scansione: P2**
1. La scansione delle dipendenze legge un commit vecchio di tre mesi e non il lockfile attuale né l'immagine in produzione. Il registro può mostrare rilievi chiusi (express) e perdere quelli nuovi. Va scansionato il commit da cui si costruisce l'immagine, o meglio una SBOM dell'immagine.
2. Lo scanner non applica le scadenze di `scanner-ignore.yml` (vedi V4). Serve un controllo in CI che faccia fallire la pipeline se un'eccezione è scaduta.
3. La copertura è parziale. Sono scansionate solo l'immagine `portale-ordini` e il suo lockfile. Mancano `portale-admin:1.9.0`, `nginx:1.27.3-alpine`, `postgres:16.6`, `redis:7.4.1`, `prom/node-exporter:v1.8.2` e l'OpenSSL incluso in Node.

## 5. Piano di correzione

1. **Subito (entro il 2026-11-27, P1).**
   - multipart-lite 2.3.4 e pino 9.6.0 in un rilascio solo.
   - Mitigazione temporanea su `/api/orders/import`, poi xml-mapper 2.0.0 con la riscrittura di `importXml` e un test.
   - Nuova scansione sul commit della build e sull'immagine.
   - Verifica dell'OpenSSL usato da Node (V3).
2. **Entro il 2026-12-20 (P2).**
   - Ricostruzione dell'immagine sulla base aggiornata (V3).
   - Correzione del processo di scansione e del controllo sulle scadenze delle eccezioni (V9).
   - Riapertura formale di V4.
3. **Entro il 2027-02-18 (P3).** docgen-lite 0.9.6, aggiornamento di eslint/minimatch, eccezione per perl-base.

Ogni passo si chiude con una nuova scansione e con la verifica della versione nell'immagine di produzione, non solo nel lockfile.

## 6. Rischio residuo

- Fino all'aggiornamento di V1, qualunque account cliente può bloccare il portale.
- Fino a V2, l'import XML resta un vettore raggiungibile, a meno di disattivarlo.
- Lo stato reale della produzione resta incerto finché non si scansiona l'immagine effettivamente distribuita.

## 7. Limiti e aree non verificate

- La copia non è un repository git: non ho potuto controllare il commit `3f2a9c1` né confrontarlo con quello attuale.
- Non ho controllato il contenuto dell'immagine in produzione né la configurazione della CI (pipeline ed esecuzione sulle PR).
- Non ho letto il codice di multipart-lite né di xml-mapper.
- Biblioteca del reparto e web non disponibili: CVSS (lo scanner non dice quale versione usa) e il legame fra Node e OpenSSL non sono verificati sulle fonti.
- Questa analisi non è una certificazione di sicurezza del progetto.

## 8. Piano della nuova verifica

1. Nuova scansione con DepScan sul commit della build attuale e con ImageScan, più una SBOM, sull'immagine distribuita.
2. Controllo di `npm ls` per multipart-lite, xml-mapper, pino-abstract-transport ed express nell'immagine.
3. Controllo di `process.versions.openssl` nell'immagine.
4. Verifica che il controllo sulle scadenze delle eccezioni faccia fallire la CI con un'eccezione scaduta di prova.

## 9. Osservazioni fuori dal rapporto dello scanner, da passare agli specialisti

Sono osservazioni, non rilievi validati da me.

- **Rete e cloud, da guardare per primo.** `admin` pubblica la porta `8081:8081` sull'host (`infra/docker-compose.yml:24-25`) e il security group apre `8000-8100` a `0.0.0.0/0`. Il pannello admin sembra quindi raggiungibile da Internet senza passare dal filtro VPN di nginx: va verificato subito, perché potrebbe essere P1 o più. Lo stesso vale per SSH 22 aperto a `0.0.0.0/0`, nonostante il README dica "solo VPN".
- **Rete.** `db` sta anche sulla rete `frontend`, contro quanto dice il README. `/metrics` è pubblico in nginx. `set_real_ip_from 0.0.0.0/0` permette di falsificare l'IP del client.
- **AppSec.**
  - `requireAdmin` (`auth.js:55`) fa passare anche `operator` e `auditor`.
  - `orders.list` interpola `sort` nell'SQL (`orders.js:13`): viene controllata solo la prima parola.
  - `testWebhook` è un SSRF: blocca solo `localhost`.
  - Il parametro `next` del login accetta `//host` (redirect aperto lato client).
  - `resetPassword` non controlla `expires_at` e non invalida il token dopo l'uso.
  - `upload.save` usa `file.filename` così com'è nel percorso del file.
- **SOC e log.** L'archivio locale è conservato 7 giorni e il SIEM 30, contro il requisito di 90 giorni. Il filtro `level >= 40` scarta gli eventi `login_failed`, `login_success` (info) e `admin_export` (debug), da cui dipendono le regole PO-001, PO-002 e PO-003.

Questi punti vanno passati ad AICA-01 · VEGA, che li assegna agli specialisti di rete, cloud, AppSec e SOC. Le decisioni su priorità, eccezioni e scadenze restano all'utente o al responsabile umano indicato.

— AICA-09 · WEZEN
