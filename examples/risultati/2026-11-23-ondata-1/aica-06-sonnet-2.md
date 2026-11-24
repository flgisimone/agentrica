AICA-06 · MINTAKA — Senior Identity & Access Management Engineer, reparto AICA (AI Cybersecurity)

## Sintesi
Esame documentale in sola lettura di `iam/` e `app/auth.js` rispetto a `iam/README.md` (regole approvate il 2026-03-02). Perimetro: solo questi file, più `app/server.js` per vedere come è applicato il controllo dei ruoli. Nessuna modifica, nessun processo avviato, nessun segreto presente nelle evidenze. Ho trovato 1 P0, 3 P1, 5 P2 e 2 P3.

Le funzioni di dettaglio sono sul modello Sonnet. Per i rilievi P0 e P1 propongo il riesame del direttore del reparto (AICA-01) o di un revisore su Opus prima che diventino definitivi. Il direttore e la biblioteca non erano disponibili in questa prova.

## Rilievi

**1. P0 — `requireAdmin` è invertito: ogni ruolo tranne `customer` passa come admin**
- File: `app/auth.js:55`. La condizione è `if (req.user.role !== "customer") return next();`.
- Fatto: operator e auditor superano il controllo, e anche `customer` non lo supera solo perché è escluso esplicitamente.
- Effetto: `server.js:32-34` usa `requireAdmin` per `/api/admin/users`, `/api/admin/users/:id/role` e `/api/admin/export/customers`. Un operator o un auditor può quindi:
  - elencare gli utenti;
  - cambiare il ruolo di qualunque utente, anche il proprio, fino ad `admin` (escalation verticale);
  - esportare i clienti, contro la regola 3, che riserva `customers:export` ad admin.
- Correzione: `if (req.user.role === "admin") return next();`. Meglio ancora, un controllo basato sui permessi di `roles.yaml`.
- Verifica: test dei tre endpoint con ciascun ruolo, con attesi 403 per tutti tranne admin.

**2. P1 — Il ruolo `operator` ha `customers:export`, contro la regola 3 e la regola 2**
- File: `iam/roles.yaml:7`.
- Fatto: operator ha `customers:export` e `mfa: false` (riga 8). La regola 3 limita l'esportazione ad `admin`. La regola 2 richiede MFA per chi può esportare i dati dei clienti.
- Effetto: ci sono due violazioni. I due operator (`l.verdi` e l'account condiviso `magazzino`) possono esportare dati dei clienti senza MFA. Questi dati sono personali, quindi coinvolgere Privacy & Compliance.
- Correzione: togliere `customers:export` da operator. In alternativa, ricostruire un ruolo dedicato con MFA, ma con la regola attuale la scelta spetta alla direzione.
- Nota: il rilievo 1 rende questa violazione concreta anche lato applicazione.

**3. P1 — L'account `magazzino` è condiviso, senza MFA, con ruolo operator**
- File: `iam/access-review-2026-11.csv:4`.
- Fatto: «turno A/B, postazione condivisa del magazzino, usata dai due turni». Ruolo operator, MFA no, ultimo accesso 2026-11-21.
- Violazione: regola 1 («niente account condivisi, nemmeno per i turni»). Con i rilievi 1 e 2 l'account condiviso può anche esportare i clienti e promuoversi admin. Nessuna tracciabilità individuale.
- Correzione: un account personale per ogni persona dei turni, poi disattivare `magazzino`. Per la postazione condivisa si può usare un accesso con identità individuale, non un account comune.

**4. P1 — Account cessato ancora attivo con ruolo admin: `g.neri`**
- File: `iam/access-review-2026-11.csv:5`.
- Fatto: cessato il 2026-09-30 (HR), stato `attivo`, ruolo admin, ultimo accesso 2026-11-12. L'accesso risulta quindi circa 6 settimane dopo la cessazione.
- Violazione: regola 5 (disattivazione lo stesso giorno). Account orfano privilegiato, e l'accesso successivo alla cessazione è un possibile indicatore di compromissione o uso improprio.
- Azione: da segnalare subito ai responsabili umani (IT, HR, direzione) e valutare se aprire un incidente. Disattivare l'account e revocarne le sessioni. I token JWT durano 8 ore, quindi non c'è revoca immediata (vedi rilievo 9). Conservare i log di accesso a partire dal 2026-09-30 prima di ogni intervento.
- Verifica anche che `g.neri` non sia tra i membri di `org-admin` nel cloud: in `cloud-iam.json:69` non c'è, ma l'elenco va riscontrato sull'IAM reale (non l'ho potuto verificare).
- Se i log confermano un uso reale dopo la cessazione, il rilievo va riclassificato P0.

**5. P2 — Account esterno `c.ferri` con ruolo admin senza scadenza**
- File: `iam/access-review-2026-11.csv:7`, `iam/cloud-iam.json:69`.
- Fatto: esterno, consulente con contratto annuale, ruolo admin, scadenza vuota. È anche membro di `org-admin` nel cloud con `AdministratorAccess`.
- Violazione: regola 4 (scadenza obbligatoria, massimo 90 giorni). Inoltre privilegio non minimo: un consulente gestionale difficilmente ha bisogno di admin applicativo e di amministrazione totale del cloud.
- Correzione: scadenza a 90 giorni rinnovabile su richiesta del referente, ruolo ridotto al compito (da definire con il referente), rimozione da `org-admin` salvo giustificazione scritta.

**6. P2 — Account di servizio `svc-deploy` con permessi troppo ampi**
- File: `iam/cloud-iam.json:20-29`.
- Fatto: `ec2:RunInstances`, `ec2:TerminateInstances`, `ssm:SendCommand` e `iam:PassRole` con `Resource: "*"`.
- Violazione: regola 7 (solo i permessi del compito). `iam:PassRole` su `*` unito a `RunInstances` permette di avviare istanze con qualunque ruolo, compreso un ruolo amministrativo: percorso di escalation verso l'intero account cloud. `ssm:SendCommand` su `*` permette di eseguire comandi su qualunque istanza. Anche le azioni ECR sono su `*` (riga 18).
- Mitigazione parziale: l'autenticazione è OIDC, conforme alla regola 7, e il `sub` è limitato al ramo `main` del repository (riga 9). Il rischio dipende quindi da chi può scrivere su `main`.
- Correzione: limitare ARN delle risorse e dei ruoli passabili, con condizioni (`iam:PassedToService`), restringere `ssm:SendCommand` a documenti e istanze specifici, limitare ECR al repository del portale.

**7. P2 — `svc-backup` con `s3:*`**
- File: `iam/cloud-iam.json:41`.
- Fatto: `s3:*` sul bucket di backup. Il perimetro del bucket è corretto, ma le azioni non lo sono.
- Rischio: il ruolo può cancellare o sovrascrivere i backup (`s3:DeleteObject`, `PutBucketPolicy`). Con un'esfiltrazione delle credenziali si perdono anche i backup, il che aiuta un ransomware.
- Correzione: limitare a `s3:PutObject`, `s3:ListBucket` e simili, con versioning e Object Lock sul bucket.

**8. P2 — `resetPassword` non controlla la scadenza né l'uso del token**
- File: `app/auth.js:35-41`.
- Fatto: la query legge `expires_at` ma non lo confronta mai con l'ora attuale; il token non viene invalidato dopo l'uso. La `forgotPassword` lo genera con scadenza di 30 minuti (riga 28), quindi la scadenza è dichiarata ma non applicata.
- Effetto: un link di reset è valido a tempo indefinito e riutilizzabile; chi lo ottiene (casella email, log, cronologia) può riusarlo per prendere l'account, anche admin. Non è imposta una politica sulla password nuova.
- Correzione: rifiutare se `expires_at < now()`, cancellare il token dopo l'uso, validare la lunghezza della password, revocare le sessioni esistenti.

**9. P2 — Nessuna MFA applicata nel codice e sessioni non revocabili**
- File: `app/auth.js:10-22`, `iam/roles.yaml:5,8,11,14`.
- Fatto: `login` autentica solo con password. `roles.yaml` dichiara `mfa: true` per admin ma `auth.js` non lo legge né lo impone; la regola 2 non è quindi applicata nell'applicazione (nel CSV l'MFA risulta per gli admin, ma non si capisce dove sia imposta: da verificare con il responsabile IT). Il JWT dura 8 ore, con ruolo incluso nel token e nessuna revoca: una modifica di ruolo o la disattivazione dell'utente ha effetto solo alla scadenza del token. Il controllo `AND active` agisce solo al login.
- Correzione: MFA verificata al login per i ruoli che la richiedono, token più brevi con refresh, e controllo di `active` e del ruolo corrente sul database per le operazioni privilegiate.
- Limite: potrebbe esistere un'MFA a monte (SSO o proxy) che non ho visto; qui sono state esaminate solo le evidenze di `iam/` e `auth.js`.

**10. P3 — Il ruolo `auditor` ha MFA disattivata e l'account esterno `revisore.kpmx` senza MFA**
- File: `iam/roles.yaml:11`, `iam/access-review-2026-11.csv:8`.
- Fatto: è un account esterno con scadenza 2026-12-31. Il contratto è «revisione contabile 2026»: la scadenza è presente, ma supera i 90 giorni previsti dalla regola 4 se la data di rilascio era anteriore al 2026-10-02. La data di creazione non è indicata, quindi non posso verificare.
- Rischio: `auditor` ha `users:read` e `orders:read` (l'intero elenco ordini). Il ruolo legge dati personali.
- Correzione: MFA per gli esterni con accesso ai dati e prova della data di rilascio per verificare il limite dei 90 giorni.

**11. P3 — `emergency-admin`: conforme alla regola 6 sulla carta, controllo non recente**
- File: `iam/access-review-2026-11.csv:9`.
- Fatto: disattivato, MFA hardware, mai usato; l'ultimo controllo della busta è del 2026-10-01. Il comportamento atteso è rispettato. Suggerimento: controllo periodico della busta e dei registri di attivazione, e prova di ripristino.

## Non rilevato
- `svc-deploy` usa OIDC con `sub` limitato a `main` (regola 7 rispettata per l'autenticazione).
- `s.galli` (cessata) risulta disattivata il giorno della cessazione (regola 5 rispettata in questo caso).
- `a.bianchi` admin con MFA, accesso recente: conforme.
- `roles.yaml` ha `inactivity_disable_days: 60`, ma nessun account del CSV supera i 60 giorni di inattività tra quelli attivi (`g.neri` è invece cessato). Nell'applicazione non c'è alcun meccanismo che applichi la regola: non verificato.

## Limiti
- Analisi solo documentale. Non ho accesso ai sistemi reali: gli stati del CSV e il JSON cloud sono evidenze dichiarate, non verificate sull'IAM effettivo.
- Non ho letto tutta l'applicazione: `orders.js`, `upload.js` e `server.js` sono stati consultati solo per l'uso dei middleware (righe 22-34 di `server.js`). Il file `app/mail.js` importato da `auth.js` non esiste nella copia (non ho trovato `mail.js` nell'elenco dei file): da verificare, perché `forgotPassword` dipende da esso. Non conosco i controlli applicati a monte.
- Un rilievo non dichiara conforme il progetto nel suo insieme; i controlli sopra valgono solo per le evidenze indicate.
- Dati personali presenti nel CSV (nomi e ruoli): non sono stati riportati oltre il necessario. Per l'impatto sui dati dei clienti (rilievi 1 e 2) serve Privacy & Compliance.

## Priorità e nuova verifica
1. Subito: rilievi 1 (P0) e 4 (P1); informare i responsabili umani.
2. Poi: 2 e 3 (P1), quindi 5-9 (P2), infine 10-11 (P3).
3. Dopo le correzioni: test dei tre endpoint admin con tutti i ruoli, nuova revisione trimestrale degli accessi, riverifica di `cloud-iam.json` e dei log di `g.neri`.

Firmato: AICA-06 · MINTAKA
