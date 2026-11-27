AICA-06 · MINTAKA — Senior Identity & Access Management Engineer, reparto AICA (AI Cybersecurity)

Nota di contesto: il tool `agent` non c'era, quindi non ho potuto caricare prima AICA-01 · VEGA. Consegno a lui questo rapporto. Ho letto le schede della biblioteca con `npm run -s agent-text -- aica-06 --cards owasp-top-10-2025,owasp-asvs-5`. Nessuna delle due è assegnata al mio ruolo e non ho il web, quindi le cito solo come riferimento di classificazione: OWASP Top 10:2025 e ASVS 5.0.0, verificate il 2026-11-19, da ricontrollare entro il 2027-05-19. L'attività è stata in sola lettura: nessun file scritto, nessun processo avviato, nessuna correzione.

## Da segnalare subito (P0)

**IAM-01 · P0: account admin di un dipendente cessato, ancora attivo e usato dopo la cessazione.**
- Evidenza: `iam/access-review-2026-11.csv:5`. `g.neri` ha ruolo admin, stato attivo e ultimo accesso il 2026-11-12, ma la nota dice «cessato il 2026-09-30 (HR)».
- Regola violata: README regola 5 (disattivazione lo stesso giorno).
- È un account orfano con privilegio massimo (`"*"`, `iam/roles.yaml:13`), con un accesso 43 giorni dopo la cessazione. Fatto: l'accesso c'è stato. Ipotesi non verificata: un uso non autorizzato, che sia l'ex dipendente o terzi con le sue credenziali.
- Azioni proposte, da far decidere al responsabile umano:
  - disattivare l'account e revocare i token, che restano validi fino a 8 h (`app/auth.js:19`);
  - conservare i log dell'app e del SIEM dal 2026-09-30, prima che il SIEM li perda (conserva 30 giorni);
  - aprire un caso con Incident Response (AICA) e Privacy (possibile violazione di dati);
  - capire quali azioni admin sono state fatte, per esempio esportazioni o cambi di ruolo.

## Esito in sintesi

Le regole di `iam/README.md` non sono rispettate in più punti:
- un difetto nel controllo dei ruoli (`requireAdmin`) dà le funzioni di amministrazione a ogni ruolo che non sia cliente;
- c'è un account condiviso;
- un consulente esterno ha accesso senza scadenza, con privilegi admin sia nell'app sia nel cloud;
- la pipeline di deploy ha permessi cloud ben oltre il suo compito;
- il login non chiede la MFA.

Questi difetti si sommano. Chiunque usi la postazione condivisa del magazzino, o il revisore esterno, può nominarsi admin.

## Rilievi

**IAM-02 · P1: `requireAdmin` è invertito e fa passare operator e auditor.**
- Evidenza: `app/auth.js:55`, `if (req.user.role !== "customer") return next();`.
- Le rotte protette sono in `app/server.js:32-34`: `/api/admin/users`, `/api/admin/users/:id/role` e `/api/admin/export/customers`.
- Impatto:
  - operator e auditor possono leggere gli utenti ed esportare i clienti, contro la regola 3;
  - con `setRole` (`app/auth.js:63-67`, nessun controllo su chi chiama né sul proprio id) possono darsi il ruolo `admin`.
- Riferimento: A01:2025 Broken Access Control. Il controllo fallisce «aperto»: ogni ruolo nuovo diventerebbe admin.
- Correzione: una lista di ruoli ammessi (`req.user.role === "admin"`) oppure il controllo del permesso specifico.
- Verifica: test con un token per ogni ruolo; solo admin deve ottenere 200.

**IAM-03 · P1: nessuna MFA nel login, nemmeno per admin.**
- Evidenza: `app/auth.js:10-21`. Il token si emette dopo la sola password. `iam/roles.yaml:14` dichiara `mfa: true` per admin, ma il codice non lo legge.
- Regola violata: README regola 2.
- Limite: non ho visto altri punti in cui la MFA possa stare, come SSO o un proxy. Da confermare con l'utente.

**IAM-04 · P1: operator ha `customers:export` e niente MFA.**
- Evidenza: `iam/roles.yaml:7-8`.
- Regole violate: la 3 (export solo per admin) e la 2 (MFA per chi esporta).
- Correzione: togliere il permesso a operator.
- Osservazione: in `app/` nessun file legge `roles.yaml` (grep senza risultati). Il commento a riga 1 dice il contrario e i permessi granulari non sono applicati dal middleware. Va chiarito dove vengono applicati.

**IAM-05 · P1: consulente esterno senza scadenza, admin nell'app e nel cloud.**
- Evidenza:
  - `iam/access-review-2026-11.csv:7`: `c.ferri`, esterno, admin, campo `scadenza` vuoto, «contratto annuale»;
  - `iam/cloud-iam.json:67-71`: membro di `org-admin` con `AdministratorAccess`.
- Regole violate: la 4 (scadenza di al massimo 90 giorni) e il privilegio minimo (regola 7 per analogia), perché un consulente gestionale ha l'amministrazione completa dell'account cloud.
- MFA: presente, e questo attenua il rischio.
- Correzione: scadenza di 90 giorni con referente interno, un ruolo applicativo ridotto al compito e l'uscita da `org-admin`.

**IAM-06 · P1: `svc-deploy` ha permessi eccessivi.**
- Evidenza: `iam/cloud-iam.json:20-29`.
  - `iam:PassRole` su `"*"` (27-28), insieme a `ec2:RunInstances`. Si può lanciare un'istanza con qualunque ruolo, anche admin: è una scalata di privilegi.
  - `ssm:SendCommand` e `ec2:TerminateInstances` su `"*"`: esecuzione di comandi e distruzione su tutte le istanze dell'account.
- Fatto conforme: il trust OIDC è limitato a `refs/heads/main` (9) e non ci sono chiavi statiche, come chiede la regola 7.
- Correzione: `PassRole` solo sull'ARN di `vm-portale-ordini`, con la condizione `iam:PassedToService=ec2.amazonaws.com`; EC2 e SSM limitati per ARN o per tag dell'ambiente.
- Non verificabile da qui: la protezione del branch `main`, da cui dipende il trust.

**IAM-07 · P2: account condiviso `magazzino`.**
- Evidenza: `iam/access-review-2026-11.csv:4`, «postazione condivisa del magazzino, usata dai due turni», ruolo operator, senza MFA.
- Regola violata: la 1 (vieta esplicitamente gli account condivisi «nemmeno per i turni»). Le azioni non sono attribuibili a una persona.
- Insieme a IAM-02 diventa una via di scalata ad admin da una postazione condivisa.
- Correzione: un account personale per ogni addetto, o accesso nominativo rapido sulla postazione.

**IAM-08 · P2: `svc-backup` ha `s3:*` sul bucket dei backup.**
- Evidenza: `iam/cloud-iam.json:41-42`.
- Include cancellazione degli oggetti e del bucket e modifica di policy e lifecycle. Chi compromette la VM può distruggere i backup (scenario ransomware).
- Correzione: solo `s3:PutObject` (più `ListBucket` se serve), con Object Lock o versioning e una cancellazione riservata a un altro ruolo.
- Osservazione:
  - il campo `"instance": "vm-portale-ordini-prod"` (35) non è una condizione di trust che AWS fa rispettare;
  - non si vede a quale istanza sia associato il ruolo, né se convive con l'app sulla stessa VM;
  - da verificare.

**IAM-09 · P2: le revoche non hanno effetto immediato.**
- Evidenza:
  - `app/auth.js:19`: il JWT dura 8 h e porta il ruolo dentro;
  - `app/auth.js:47`: `requireUser` non ricontrolla nel database né `active` né il ruolo.
- Una disattivazione (regola 5) o un declassamento valgono solo alla scadenza del token.
- Correzione: rileggere utente e ruolo a ogni richiesta, oppure token brevi con una lista di revoca.

**IAM-10 · P2: account del revisore intestato a uno studio.**
- Evidenza: `iam/access-review-2026-11.csv:8`. `revisore.kpmx`, la «persona» è «Studio Revisori KPMX».
- È probabilmente un account usato da più persone (regola 1). Ipotesi da confermare.
- Senza MFA: la regola 2 non la impone, perché auditor non esporta. Con IAM-02 però può esportare e darsi il ruolo admin.
- Scadenza: 2026-12-31 è presente. La data di rilascio non c'è, quindi non posso verificare il limite di 90 giorni.

**IAM-11 · P2: reset della password.**
- Evidenza: `app/auth.js:36-40`.
  - `expires_at` viene letto ma non controllato: il link non scade.
  - Il token non si cancella dopo l'uso, quindi si può riusare.
  - Le sessioni attive non vengono invalidate.
  - Il token è salvato in chiaro (29), il che rende il problema P3.
- Riferimento: A07:2025.
- Esula in parte dall'IAM: è da girare ad AICA AppSec per la conferma.

**IAM-12 · P3: assenze minori.**
- `setRole` non registra chi ha cambiato quale ruolo (`app/auth.js:66`): manca la traccia per la revisione trimestrale (regola 8).
- Le azioni ECR in `cloud-iam.json:17` e `:55` hanno `Resource "*"`. Sarebbe meglio limitarle al repository dell'immagine; `GetAuthorizationToken` resta su `"*"`.

## Conformi, per quanto si vede

- `s.galli` è stata disattivata il giorno della cessazione (csv:6).
- `emergency-admin` è disattivato, con chiave hardware e busta controllata il 2026-10-01 (csv:9). Non ho visto il registro d'uso richiesto dalla regola 6.
- `vm-portale-ordini` ha i segreti limitati a `portale-ordini/prod/*` (cloud-iam.json:61).
- `org-admin` richiede la MFA (cloud-iam.json:71).

## Limiti e domande aperte

- Non ho verificato:
  - lo stato reale degli account nel provider e nel database;
  - i log degli accessi di `g.neri`;
  - le date di rilascio degli account esterni;
  - l'applicazione dei permessi granulari (`orders:read:own` ecc.) in `orders.js` e `upload.js`, fuori dal compito;
  - se la regola di inattività a 60 giorni (`roles.yaml:18`) è applicata da qualche processo.
- Domande per l'utente:
  - la MFA è gestita fuori dall'app?
  - a quale istanza è associato `svc-backup`?
  - chi è il referente interno di `c.ferri`?
- Sono rilievi su controlli e file specifici, non una certificazione del progetto.
- Gira su Opus, ma P0 e P1 vanno comunque riesaminati da AICA-01 prima di diventare definitivi.

— AICA-06 · MINTAKA
