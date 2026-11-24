AICA-06 · MINTAKA — Senior Identity & Access Management Engineer, reparto AICA (AI Cybersecurity)

# Valutazione IAM: portale ordini «Ferramenta Nord»

## Sintesi per la direzione
Ho trovato 1 P0, 6 P1, 3 P2 e 2 P3. I problemi più gravi sono tre:
- un account admin di un dipendente cessato è ancora attivo e risulta usato dopo la cessazione;
- in `app/auth.js` il controllo `requireAdmin` funziona al contrario: lascia passare qualunque ruolo diverso da `customer`. Operatori e revisore esterno possono quindi esportare i clienti e assegnarsi il ruolo admin;
- l'MFA richiesta per admin non viene applicata in nessun punto del login.

Il progetto è dichiarato di prova, con dati finti (README.md:3). Questi rilievi non sono una certificazione e non attestano la sicurezza del progetto nel suo insieme.

**Segnalazione immediata (P0):** l'account `g.neri` va verificato subito, prima del resto (vedi R1).

## Perimetro e autorizzazioni
Il perimetro sono `iam/` (README.md, roles.yaml, cloud-iam.json, access-review-2026-11.csv) e `app/auth.js`. Ho letto `app/server.js` e `app/orders.js` solo per vedere come sono collegati i controlli. L'analisi è stata documentale, in sola lettura, sulla copia locale: niente test attivi, niente rete, nessuna modifica. In questa prova il direttore AICA-01 e la biblioteca non erano disponibili, quindi non ho consultato le schede (OWASP ASVS 5.0.0 ecc.).

## Metodologia
Ho confrontato riga per riga le 8 regole di `iam/README.md` con:
- i ruoli applicativi;
- i ruoli cloud;
- la revisione degli accessi;
- la logica di autenticazione e autorizzazione del codice.

## Rilievi

**R1 — P0 — Account di dipendente cessato attivo, con accesso dopo la cessazione**
- **Dove:** `iam/access-review-2026-11.csv:5`. `g.neri` ha ruolo admin, stato attivo, nota «cessato il 2026-09-30 (HR)» e ultimo accesso 2026-11-12.
- **Regola violata:** n. 5 (disattivazione lo stesso giorno). L'account è orfano e privilegiato.
- **Perché è P0:** un accesso 43 giorni dopo la cessazione è un possibile uso non autorizzato, cioè una compromissione potenzialmente attiva. Inoltre la revisione di novembre ha registrato la cessazione ma non ha fatto disattivare l'account: è un difetto del processo (regola 8).
- **Correzione:** l'utente o il responsabile IT dispone la disattivazione immediata e la revoca delle sessioni. Prima si conservano i log dell'app e del SIEM sugli accessi di `g.neri` (dal 2026-09-30 a oggi), poi si fa un'analisi di cosa è stato fatto (esportazioni, cambi di ruolo) e la si scala al responsabile della risposta agli incidenti.
- **Verifica:** account disattivato, accessi successivi al 2026-09-30 spiegati.

**R2 — P1 — `requireAdmin` funziona al contrario: escalation di privilegi**
- **Dove:** `app/auth.js:55`.
  ```js
  if (req.user.role !== "customer") return next();
  ```
- **Effetto:** `operator`, `auditor` e qualunque ruolo futuro superano il controllo. Raggiungono `/api/admin/users`, `/api/admin/users/:id/role` e `/api/admin/export/customers` (`app/server.js:32-34`).
  - Un operatore, o il revisore esterno `revisore.kpmx` che non ha MFA, può assegnarsi `admin` con `setRole` (`app/auth.js:63-68`).
  - Può anche esportare i clienti, violando le regole 2 e 3.
  - Gli account senza MFA che oggi hanno questa via sono `l.verdi`, l'account condiviso `magazzino` e `revisore.kpmx`.
- **Correzione:** usare una lista di ruoli ammessi (`req.user.role === "admin"`) o un controllo per permesso. Aggiungere test negativi per operator e auditor.
- **Verifica:** 403 per tutti i ruoli diversi da admin su tutte e tre le rotte.

**R3 — P1 — `operator` ha `customers:export` e non ha MFA**
- **Dove:** `iam/roles.yaml:7-8`.
- **Regole violate:** n. 3 (export solo per admin) e n. 2 (MFA per chi esporta).
- **Correzione:** togliere `customers:export` dal ruolo operator.

**R4 — P1 — Account condiviso `magazzino`**
- **Dove:** `iam/access-review-2026-11.csv:4`. Account operator usato da due turni, senza MFA.
- **Regola violata:** n. 1. Le azioni non sono attribuibili a una persona e, con R2 e R3, questo account può esportare i clienti e diventare admin.
- **Correzione:** un account personale per ogni addetto, con login rapido sulla postazione se serve. Poi disattivare `magazzino`.

**R5 — P1 — Consulente esterno con admin applicativo e AdministratorAccess sul cloud, senza scadenza**
- **Dove:**
  - `iam/access-review-2026-11.csv:7`: `c.ferri`, esterno, admin, senza scadenza, «contratto annuale»;
  - `iam/cloud-iam.json:66-71`: `org-admin` con membri `a.bianchi` e `c.ferri` e `AdministratorAccess`.
- **Regola violata:** n. 4 (scadenza obbligatoria, al massimo 90 giorni).
- **Privilegio minimo:** un consulente gestionale difficilmente ha bisogno di amministrare l'intero account cloud.
- **Correzione:**
  - impostare la scadenza a 90 giorni o meno, con rinnovo su richiesta del referente;
  - togliere `c.ferri` da `org-admin`;
  - dare un ruolo applicativo limitato al suo compito, da confermare con l'utente.

**R6 — P1 — MFA per admin dichiarata ma non applicata**
- **Dove:** `iam/roles.yaml:14` dichiara `mfa: true`, ma `app/auth.js:10-22` emette il JWT dopo la sola password, senza un secondo fattore.
- **Regola violata:** n. 2.
- **Osservazione:** `roles.yaml` dice di essere letto dall'app all'avvio (riga 1), ma `auth.js` non lo legge. I permessi e l'MFA dello YAML non sono collegati al codice: lì l'autorizzazione è cablata sul nome del ruolo.
- **Ipotesi da verificare:** l'MFA potrebbe stare in un SSO o proxy esterno. Nel perimetro non ne ho trovato traccia.
- **Correzione:** secondo fattore obbligatorio per admin, e per chi esporta, prima di emettere il token, oppure un claim `amr` controllato da `requireAdmin`.

**R7 — P1 — `svc-deploy`: `iam:PassRole` su `*` insieme a `ec2:RunInstances` e `ssm:SendCommand` su `*`**
- **Dove:** `iam/cloud-iam.json:20-29`.
- **Effetto:** la pipeline può avviare istanze con qualunque ruolo passabile ed eseguire comandi su qualunque istanza. È una via di escalation verso ruoli più privilegiati, e la pipeline diventa di fatto amministratrice.
- **Regola violata:** n. 7, solo i permessi del compito.
- **Cosa va bene:** il trust OIDC è limitato a `repo:…:ref:refs/heads/main` (righe 6-9) ed è conforme alla regola 7.
- **Correzione:** `PassRole` limitato all'ARN di `vm-portale-ordini`, con condizione `iam:PassedToService=ec2.amazonaws.com`. `RunInstances`, `TerminateInstances` e `SendCommand` limitati per tag o ARN alle istanze del portale. ECR limitato al repository dell'app, tranne `GetAuthorizationToken`.

**R8 — P2 — `svc-backup` ha `s3:*` sul bucket dei backup**
- **Dove:** `iam/cloud-iam.json:39-43`.
- **Effetto:** il ruolo include `DeleteObject`, `DeleteBucket`, `PutBucketPolicy` e `PutLifecycleConfiguration`. Chi compromette la VM può cancellare o cifrare i backup.
- **Correzione:** solo `PutObject` (e `ListBucket` se serve), più versioning e Object Lock sul bucket. Il ripristino va a un ruolo distinto.

**R9 — P2 — Token di reset non controllato in scadenza e riutilizzabile**
- **Dove:** `app/auth.js:36-39`.
- **Effetto:**
  - `expires_at` viene letto ma mai confrontato con l'ora corrente;
  - il token non viene cancellato dopo l'uso;
  - è salvato in chiaro (riga 29).
  
  Un link di reset trapelato resta valido per sempre e permette di prendere l'account, anche un admin.
- **Correzione:** controllare la scadenza, rendere il token monouso (cancellarlo o marcarlo usato), salvarne solo l'hash e invalidare le sessioni attive dopo il reset.

**R10 — P2 — Revoca non immediata: il JWT dura 8 ore e il ruolo sta nel token**
- **Dove:** `app/auth.js:19` e `app/auth.js:47`.
- **Effetto:** `requireUser` non ricontrolla `active` né il ruolo corrente nel database. Un account disattivato o declassato conserva l'accesso con il ruolo vecchio fino a 8 ore. Pesa sulla regola 5 e sulla correzione di R1.
- **Correzione:** ricontrollare stato e ruolo dell'utente a ogni richiesta, o almeno sulle rotte admin, oppure usare una versione del token da invalidare.

**R11 — P3 — Cambi di ruolo senza traccia e senza protezioni**
- **Dove:** `app/auth.js:63-68`. `setRole` non registra chi ha cambiato cosa, non controlla che l'utente di destinazione esista e non impedisce di modificare il proprio ruolo.
- **Correzione:** un evento di audit (attore, destinatario, ruolo prima e dopo) e il divieto di cambiare il proprio ruolo.

**R12 — P3 — `vm-portale-ordini` legge da ECR su `Resource: "*"` e ha un trust EC2 senza vincolo di istanza**
- **Dove:** `iam/cloud-iam.json:53-57` e `iam/cloud-iam.json:49`.
- **Correzione:** limitare la lettura al repository dell'immagine dell'app.

## Controlli conformi (solo per le evidenze viste)
- `s.galli`, cessata il 2026-04-02, è disattivata lo stesso giorno (csv:6), conforme alla regola 5.
- `emergency-admin` è disattivato, con chiave hardware e mai usato (csv:9). La regola delle due persone e la registrazione dell'uso non sono verificabili dai file.
- Il login rifiuta gli account non attivi (`auth.js:12`).
- Il confronto della chiave API è a tempo costante (`auth.js:70-74`).
- bcrypt è usato con costo 12.

## Rischio residuo e limiti
- Non ho verificato la data di inizio del rapporto di `revisore.kpmx` (scadenza 2026-12-31). Se l'accesso è stato concesso prima del 2026-10-02, supera i 90 giorni della regola 4 e il caso va confermato con il referente `a.bianchi`.
- Non ho verificato le revisioni dei trimestri precedenti (regola 8): nel perimetro c'è solo quella di novembre.
- Non ho verificato la configurazione reale del cloud: ho letto solo `cloud-iam.json`, che può non corrispondere a quanto è in produzione.
- Non ho visto un SSO o MFA esterno, né il pannello `admin` sulla porta 8081.
- Non ho esaminato `inactivity_disable_days: 60` (roles.yaml:18) rispetto ai log reali.
- Gli altri reparti vanno coinvolti per due temi:
  - **Privacy & Compliance:** l'export dei clienti potenzialmente accessibile a ruoli non autorizzati e l'eventuale accesso di `g.neri` a dati personali, per una valutazione di data breach;
  - **Software Agency:** le correzioni di R2, R6, R9, R10 e R11.

## Piano della nuova verifica
1. **Per R1:** account disattivato e analisi dei log conclusa.
2. **Per R2:** test negativi in CI che danno 403 per `operator` e `auditor` sulle tre rotte admin.
3. **Per R3, R6 e R10:** `roles.yaml` senza export per `operator`, login di un admin che senza secondo fattore non riceve il token, revoca effettiva entro una richiesta.
4. **Per R4, R5 e R7:** nuovo CSV di revisione senza l'account condiviso, con scadenze sugli esterni, e policy di `svc-deploy` e `svc-backup` limitate per ARN.
5. **Per R9:** un token scaduto o già usato restituisce 400.

Tutte le correzioni sono proposte: richiedono l'approvazione dell'utente, la gestione delle modifiche e un piano di rollback.

— MINTAKA (AICA-06)
