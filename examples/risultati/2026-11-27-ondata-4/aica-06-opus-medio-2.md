AICA-06 · MINTAKA — Senior Identity & Access Management Engineer, reparto AICA (AI Cybersecurity)

Nota sul ruolo: il server MCP non era disponibile, quindi non ho potuto caricare il direttore AICA-01 · VEGA. Consegno direttamente a te, nel formato che userei con lui: esito, rilievi con evidenza, domande aperte. Non ho corretto nulla e non ho scritto file.

## Sintesi per la direzione
Ho esaminato in sola lettura `iam/` e `app/auth.js` confrontandoli con `iam/README.md` (regole approvate il 2026-03-02). Ho trovato 12 rilievi:
- **1 P0**: un admin cessato ha ancora l'account attivo e risulta un accesso dopo la cessazione.
- **4 P1**: il controllo admin è invertito e lascia l'escalation a operator e auditor; operator può esportare i clienti senza MFA; l'app non applica la MFA; il ruolo di deploy ha permessi eccessivi.
- **5 P2** e **2 P3**.

Il P0 lo segnalo subito, come vuole il reparto.

## Perimetro e metodo
- File esaminati: `iam/README.md`, `iam/roles.yaml`, `iam/cloud-iam.json`, `iam/access-review-2026-11.csv`, `app/auth.js`.
- Per capire dove sono usati i controlli e quanto sono esposti ho letto anche `app/server.js` e `infra/nginx.conf` (righe 32-45).
- Solo analisi documentale e del codice: nessun test attivo, nessun accesso a sistemi.
- Riferimento: OWASP Top 10:2025 (scheda di biblioteca owasp-top-10-2025, versione 2025, verificata il 2026-11-19). Nella biblioteca non ci sono schede specifiche per il ruolo AICA-06.

## Rilievi

**R1 · P0 · Account orfano con privilegi admin e accesso dopo la cessazione**
- Evidenza: `iam/access-review-2026-11.csv:5`, `g.neri;…;admin;si;attivo;;2026-11-12;cessato il 2026-09-30 (HR)`.
- Viola la regola 5 (account disattivato il giorno della cessazione).
- Fatto: l'ultimo accesso registrato è del 2026-11-12, 43 giorni dopo la cessazione.
- Ipotesi da verificare: credenziali usate da lui o da altri, quindi possibile accesso non autorizzato con ruolo admin (utenti, ruoli, esportazioni).
- Correzione, previa approvazione del responsabile umano:
  - disattivare l'account e revocare i token. Il JWT dura 8h e non c'è revoca, vedi R9;
  - preservare i log dal 2026-09-30 in poi;
  - coinvolgere Incident Response (AICA) e Privacy (possibile violazione dei dati: export dei clienti);
  - verificare la procedura HR → IT.

**R2 · P1 · `requireAdmin` invertito: chi non è customer passa (A01:2025, fail-open A10:2025)**
- Evidenza: `app/auth.js:55`, `if (req.user.role !== "customer") return next();`.
- Il controllo protegge `server.js:32-34`: lista utenti, `setRole` ed export dei clienti.
- Operator, auditor e qualunque ruolo inatteso o mancante passano il controllo. Un operator o l'esterno `revisore.kpmx` (auditor, senza MFA) può promuoversi admin con `POST /api/admin/users/:id/role` (`auth.js:63-68`, che non controlla altro) ed esportare i clienti.
- Esposizione: `/api/admin/*` passa per `location /` di nginx (`infra/nginx.conf:32`) ed è quindi pubblico. Solo `/admin/` è limitato alla VPN (righe 43-45).
- Correzione: consentire solo `role === "admin"`, meglio ancora per permesso letto da `roles.yaml`. Rifiutare per impostazione predefinita.
- Verifica: test con token operator, auditor e senza ruolo sulle tre rotte, con atteso 403.

**R3 · P1 · Operator può esportare i clienti, e senza MFA**
- Evidenza: `iam/roles.yaml:7` (`customers:export` per operator) e `roles.yaml:8` (`mfa: false`).
- Viola la regola 3 (export solo per admin) e la regola 2 (MFA per chi può esportare).
- Riguarda `l.verdi` e l'account condiviso `magazzino` (csv:3-4), entrambi senza MFA.
- Correzione: togliere `customers:export` da operator.

**R4 · P1 · L'applicazione non applica la MFA né i permessi di `roles.yaml`**
- Evidenza: `app/auth.js:10-22`. `login` emette il token solo con la password, senza secondo fattore, anche per admin.
- In tutto `app/` nessun file legge `roles.yaml`: i controlli sono scritti a mano su `role`.
- Il `mfa: true` di admin (`roles.yaml:14`) e la colonna «mfa si» della revisione non hanno riscontro nel codice. Regola 2 non verificabile, probabilmente non applicata.
- Domanda aperta: la MFA è applicata altrove, per esempio da un IdP o SSO a monte?

**R5 · P1 · `svc-deploy`: privilegi eccessivi e possibile escalation (regola 7)**
- Evidenza: `iam/cloud-iam.json:22-23` concede `ec2:RunInstances`, `ec2:TerminateInstances` e `ssm:SendCommand` su `*`. Le righe 27-28 concedono `iam:PassRole` su `*`.
- Due conseguenze:
  - la pipeline può eseguire comandi su qualunque istanza, compresa la VM di produzione;
  - può lanciare istanze a cui passa qualsiasi ruolo, per esempio `vm-portale-ordini` con accesso ai segreti `prod/*`.
- Le azioni ECR di scrittura (riga 17) sono su `*`, e solo `GetAuthorizationToken` lo richiede davvero.
- Positivo: l'autenticazione via OIDC è limitata a `refs/heads/main` (righe 6-9), come chiede la regola.
- Correzione: PassRole solo sull'ARN del ruolo necessario, con condizione `iam:PassedToService`; EC2 e SSM limitati per ARN o tag; ECR limitato al repository dell'immagine.

**R6 · P2 · Account condiviso `magazzino` (regola 1)**
- Evidenza: `iam/access-review-2026-11.csv:4`, «postazione condivisa del magazzino, usata dai due turni». Ruolo operator, senza MFA.
- Non si sa chi fa cosa. Insieme a R2 e R3 diventa un admin potenziale non attribuibile.
- Fuori dal perimetro ma collegato: `formazione/regole-personale.md:9` cita gli account condivisi `magazzino1` e `magazzino2`, con la password in un gruppo WhatsApp. Questi account non compaiono nella revisione degli accessi, e `logging/samples/archive-2026-11-19.log:72` mostra un login con `magazzino2@…`. La revisione risulta quindi incompleta (regola 8).
- Correzione: un account personale per ogni addetto e cambio delle credenziali condivise.

**R7 · P2 · Consulente esterno admin senza scadenza, anche amministratore del cloud**
- Evidenza: `iam/access-review-2026-11.csv:7` (`c.ferri`, esterno, admin, colonna scadenza vuota, «contratto annuale») e `iam/cloud-iam.json:67-71` (membro di `org-admin` con `AdministratorAccess`).
- Viola la regola 4 (scadenza al massimo 90 giorni) e il privilegio minimo: un consulente «gestionale» non ha bisogno di amministrare tutto l'account cloud.
- MFA presente, ed è un controllo compensativo.
- Correzione: scadenza a 90 giorni con referente interno; ruolo applicativo ridotto; uscita da `org-admin` o accesso just-in-time.

**R8 · P2 · Token di reset della password senza scadenza effettiva e riutilizzabili**
- Evidenza: `app/auth.js:36-39`. `expires_at` viene letto ma mai confrontato, il token non viene cancellato dopo l'uso e non si controlla che l'utente sia `active`.
- Conseguenze:
  - un link di reset vecchio, anche in una casella compromessa, resta valido per sempre;
  - un account disattivato (per esempio `s.galli`, csv:6) può reimpostare la password. L'accesso resta bloccato da `AND active` in `login` (riga 12).
- Correzione: controllare la scadenza, rendere il token monouso e salvarlo come hash.

**R9 · P2 · Disattivazione e cambio di ruolo non hanno effetto sui token già emessi**
- Evidenza: `app/auth.js:19` (JWT con `role` incorporato, 8h) e righe 43-52 (`requireUser` verifica solo la firma e non rilegge `active` né `role` dal database).
- Un account disattivato o declassato mantiene i privilegi fino a 8h. Questo pesa su R1 e sulla regola 5.
- Mancano anche il log del cambio di ruolo in `setRole` (righe 63-68) e il blocco del cambio sul proprio account.

**R10 · P2 · `svc-backup` con `s3:*` sul bucket dei backup**
- Evidenza: `iam/cloud-iam.json:41-42`.
- Include cancellazione degli oggetti e del bucket e modifica di policy e ACL: un'istanza compromessa può distruggere o rendere pubblici i backup.
- Correzione: concedere solo `PutObject` (più `ListBucket` se serve), con versioning e Object Lock.
- Osservazione: il campo `"instance"` nella trust (riga 35) non è un costrutto AWS standard. Va verificata la trust policy reale, che potrebbe accettare qualunque istanza EC2. Vale lo stesso per `vm-portale-ordini` (riga 49).

**R11 · P3 · Account esterno del revisore: durata non verificabile, nessuna MFA**
- Evidenza: `iam/access-review-2026-11.csv:8` (`revisore.kpmx`, scadenza 2026-12-31, mfa no).
- La data di creazione non è nota, quindi non posso verificare il limite di 90 giorni.
- Con i permessi attuali di auditor (`roles.yaml:10`) la MFA non è obbligatoria per regola. Con R2 aperto, però, questo account può arrivare all'export.

**R12 · P3 · Regola di inattività non applicata visibilmente**
- Evidenza: `iam/roles.yaml:18` (`inactivity_disable_days: 60`).
- Non trovo né codice né job che la applichi.
- Oggi nessun account attivo supera i 60 giorni senza accessi.

## Controlli che risultano conformi (solo per queste evidenze)
- `emergency-admin` è disattivato, con MFA hardware e busta controllata il 2026-10-01 (csv:9). Non ho potuto verificare il registro d'uso né la regola delle due persone.
- `s.galli` è stata disattivata il giorno della cessazione (csv:6).
- La pipeline usa OIDC, senza chiavi statiche.
- `vm-portale-ordini` ha accesso ai segreti limitato a `portale-ordini/prod/*`.

## Rischio residuo e limiti
- Ho visto solo file e codice. Non ho verificato:
  - la configurazione reale dell'IdP e della MFA;
  - le trust policy effettive nel cloud;
  - i log di accesso di `g.neri`;
  - il pannello `admin` sulla porta 8081.
- Non ho esaminato `orders.js` e `upload.js` oltre ai controlli `role === "customer"`. Restano da verificare `exportCustomers` e `importXml`.
- Questi rilievi non sono una certificazione e non rendono il progetto conforme o sicuro nel suo insieme.

## Domande aperte
1. Chi ha usato `g.neri` il 2026-11-12, e da quale IP? Serve l'autorizzazione per analizzare i log (Incident Response).
2. La MFA è applicata da un componente esterno all'app?
3. `magazzino`, `magazzino1` e `magazzino2` sono lo stesso account o account diversi? La revisione degli accessi va completata.
4. Qual è la data di inizio dell'accesso di `revisore.kpmx` e di `c.ferri`?
5. Esistono altri ruoli IAM nel cloud oltre a quelli in `cloud-iam.json`?

## Piano della nuova verifica
- Dopo le correzioni: test negativi su `/api/admin/*` con token non admin.
- Diff di `roles.yaml` e di `cloud-iam.json` rivisti con IAM Policy Simulator o Access Analyzer, su autorizzazione.
- Nuova revisione degli accessi completa, con scadenze compilate.
- Prova di reset con un token scaduto e con un token già usato.
- Per R1 coinvolgere Privacy & Compliance, per una possibile violazione dei dati dei clienti.

— AICA-06 · MINTAKA
