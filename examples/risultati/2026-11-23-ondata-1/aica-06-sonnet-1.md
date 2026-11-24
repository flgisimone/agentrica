AICA-06 · MINTAKA — Senior Identity & Access Management Engineer, reparto AICA (AI Cybersecurity)

**Perimetro e metodo.** Analisi documentale in sola lettura di `iam/` (README, roles.yaml, cloud-iam.json, access-review-2026-11.csv) e `app/auth.js`, confrontati con le regole di `iam/README.md`. Per l'impatto di requireAdmin ho letto solo le righe di `app/server.js` che lo usano. Non ho avuto il direttore AICA-01 né la biblioteca (come da prova). Nessuna modifica e nessun processo avviato. Non ho letto i dati reali dell'app (es. la tabella `users`).

**Sintesi.** Ci sono 2 rilievi P0/P1 sul controllo dei ruoli, più account orfani, un account condiviso, regole su MFA e export non rispettate e permessi cloud eccessivi. Il rilievo 1 è P0: va segnalato subito al responsabile.

## Rilievi

**1. P0 — `requireAdmin` ammette tutti i ruoli tranne `customer`** (`app/auth.js:55`)
- Fatto: `if (req.user.role !== "customer") return next();` lascia passare operator e auditor. Un ruolo sconosciuto o vuoto passa anch'esso, perché il controllo è una deny-list.
- Le rotte `/api/admin/users`, `/api/admin/users/:id/role` e `/api/admin/export/customers` (`app/server.js:32-34`) dipendono solo da questo controllo.
- Impatto: un `operator` o un `auditor` può cambiare il ruolo di qualsiasi utente (`setRole`, `auth.js:63-67`) e quindi diventare admin. Può anche esportare i dati dei clienti, contro la regola 3 del README (export solo `admin`). L'escalation dei privilegi richiede un solo account operator, e ce ne sono due attivi senza MFA.
- Correzione: allow-list, `req.user.role === "admin"`. Per distinguere i permessi, derivarli da `iam/roles.yaml` invece di confrontare nomi di ruolo.
- Nota: P0 in base alla lettura del codice, non provato in esecuzione.

**2. P1 — Cambio ruolo senza controlli (`auth.js:63-67`)**
- `setRole` non impedisce di modificare il proprio ruolo, non registra l'azione e non richiede una conferma forte. `req.params.id` non è validato e non c'è un limite sull'ultimo admin. Combinato con il rilievo 1 amplifica l'impatto.
- Correzione: log di audit (chi, a chi, ruolo precedente e nuovo), blocco dell'auto-modifica, MFA recente per i cambi verso admin.

**3. P1 — Account cessato ancora attivo: `g.neri`** (`access-review-2026-11.csv` riga 5)
- Fatto: dipendente cessato il 2026-09-30, stato `attivo`, ruolo admin, ultimo accesso 2026-11-12, cioè 6 settimane dopo la cessazione.
- Viola la regola 5 (disattivazione lo stesso giorno). L'accesso dopo la cessazione indica un uso reale dell'account o di una sua credenziale.
- Correzione: disattivare subito con approvazione del responsabile. Verificare i log degli accessi dal 2026-09-30 e revocare sessioni e token. Se l'accesso non è riconducibile a una persona autorizzata, è un possibile incidente: va gestito dalla risposta agli incidenti. Verificare anche se `g.neri` è tra i membri cloud di `org-admin` (non risulta in `cloud-iam.json`).

**4. P1 — Consulente esterno con admin, senza scadenza: `c.ferri`** (CSV riga 7; `cloud-iam.json:69`)
- Fatto: tipo esterno, ruolo admin, scadenza vuota, "contratto annuale". È anche membro di `org-admin` con `AdministratorAccess` sull'account cloud.
- Viola la regola 4 (scadenza obbligatoria, massimo 90 giorni). Il privilegio è molto superiore al compito di consulenza gestionale: viola il privilegio minimo.
- Correzione: scadenza entro 90 giorni, ruolo ridotto a quanto serve, rimozione da `org-admin` salvo giustificazione scritta del referente.

**5. P1 — Account condiviso: `magazzino`** (CSV riga 4)
- Fatto: account unico "turno A/B", ruolo operator, senza MFA, usato da due turni. Un operator può esportare i clienti (vedi rilievo 6).
- Viola la regola 1 (account personali, "nemmeno per i turni"). Non c'è attribuibilità e un'esportazione non è riconducibile a una persona.
- Correzione: account personali per ogni operatore, disattivazione di `magazzino`. Se serve una postazione comune, usare login personale rapido (SSO o badge).

**6. P1 — `customers:export` assegnato a `operator`** (`roles.yaml:8`)
- Fatto: `operator` ha `customers:export`. La regola 3 lo riserva ad `admin`.
- Correzione: rimuovere `customers:export` da `operator`. Il codice (rilievo 1) deve poi verificarlo davvero.

**7. P1 — MFA non applicata a chi può esportare i dati** (`roles.yaml:5-11`; CSV righe 3-4)
- Fatto: `operator` ha `mfa: false` ma può esportare. I due operator (`l.verdi`, `magazzino`) hanno MFA "no". Anche `auditor` ha `mfa: false`.
- Viola la regola 2 (MFA per admin e per chiunque possa esportare). Inoltre `auth.js` non implementa alcuna MFA: `login` (righe 10-22) emette il JWT con la sola password, quindi `mfa: true` per admin in `roles.yaml:14` non ha effetto nell'app.
- Correzione: rimuovere l'export da operator (rilievo 6) e imporre il secondo fattore nel login per admin.

**8. P2 — Revisore esterno senza MFA, con scadenza oltre i 90 giorni: `revisore.kpmx`** (CSV riga 8)
- Fatto: scadenza 2026-12-31 e accesso recente 2026-11-10. Il ruolo `auditor` ha `orders:read` e `users:read`, ma `mfa: false`. La scadenza è presente, ma la data di inizio non è nel file: non posso verificare il limite di 90 giorni.
- Correzione: verificare la data di inizio e la durata. Valutare MFA e limitare `users:read` al necessario.

**9. P2 — Account di servizio `svc-deploy` con permessi eccessivi** (`cloud-iam.json:20-29`)
- `iam:PassRole` su `Resource: "*"`: permette di assegnare qualsiasi ruolo a una risorsa, anche più potente, quindi è un percorso di escalation.
- `ec2:RunInstances`, `ec2:TerminateInstances` e `ssm:SendCommand` su `*`: esecuzione di comandi su qualsiasi istanza dell'account.
- Le azioni ECR su `*` vanno limitate al repository specifico.
- Fatto positivo: l'autenticazione OIDC è corretta, con `aud` e `sub` limitato a `refs/heads/main` (regola 7 rispettata per le chiavi statiche).
- Correzione: restringere le risorse (ARN del repository, delle istanze, del solo ruolo da passare con `iam:PassedToService`).

**10. P2 — `svc-backup` con `s3:*`** (`cloud-iam.json:41`)
- Il permesso si limita al bucket `fn-portale-backups`, ma `s3:*` include la cancellazione e la modifica delle policy del bucket. Un backup compromesso potrebbe cancellare i propri backup.
- Correzione: solo `s3:PutObject` (e al massimo `ListBucket`); versioning e Object Lock sul bucket.

**11. P2 — `org-admin` con `AdministratorAccess` a due persone** (`cloud-iam.json:66-72`)
- Fatto: `mfa_required: true`, buono. Resta però un admin totale per `c.ferri` (rilievo 4). Verificare la necessità di privilegi permanenti (accesso just-in-time).

**12. P2 — Reset password senza invalidazione né scadenza controllata** (`auth.js:35-41`)
- `resetPassword` non verifica `expires_at` (selezionato ma mai controllato): un link scade solo nominalmente, oltre i 30 minuti previsti in `forgotPassword`. Il token non viene cancellato dopo l'uso, quindi è riutilizzabile. Il token è salvato in chiaro nel database. Non c'è una politica di complessità della password. Le sessioni JWT già emesse restano valide dopo il reset.
- Correzione: verificare la scadenza, eliminare il token dopo l'uso, salvarne l'hash, invalidare le sessioni.

**13. P2 — Account inattivi e criterio dei 60 giorni** (`roles.yaml:18`; CSV)
- `inactivity_disable_days: 60` è dichiarato, ma l'app non lo applica: `login` controlla solo `active`. `s.galli` è correttamente disattivata. `emergency-admin` è disattivato come da regola 6, ultimo controllo 2026-10-01 (il periodo di controllo non è definito dal README).

**14. P3 — Altro**
- `requireUser` (`auth.js:43-52`): JWT HS256 di 8 ore, senza revoca; un utente disattivato o declassato mantiene il token fino alla scadenza. Il ruolo nel token non viene riletto dal database.
- `login` (`auth.js:10-22`): nessun limite ai tentativi né blocco temporaneo; la differenza di tempo tra utente inesistente (nessun `bcrypt.compare`) e password errata permette di enumerare gli account.
- `forgotPassword` (`auth.js:24-33`): risposta uniforme (buono), ma la tempistica può rivelare se l'utente esiste.
- `auth.js:5`: `require("./mail")` — il modulo `mail` non è nell'elenco dei file di `app/` che ho visto. Il controllo di esistenza non rientra nel mio perimetro.
- La revisione trimestrale (regola 8) esiste (`access-review-2026-11.csv`) ma ha lasciato passare i rilievi 3, 4 e 5: il processo non è efficace come controllo.

## Regole rispettate (per quel controllo e quelle evidenze)
- Regola 6: `emergency-admin` disattivato, MFA hardware, mai usato.
- Regola 7: pipeline con OIDC, senza chiavi statiche (limitatamente alle policy in `cloud-iam.json`).
- Regola 5: `s.galli` disattivata il giorno della cessazione.
- `sameApiKey` (`auth.js:70-74`) usa un confronto a tempo costante.

## Rischio residuo, limiti
- Non ho verificato lo stato reale dei sistemi (tabella `users`, console cloud, log): le conclusioni valgono per i file letti. Non ho letto `server.js` per intero né gli altri file di `app/`.
- Non è una certificazione né una dichiarazione di conformità.
- Non ho consultato la biblioteca del reparto. Ho citato per memoria il privilegio minimo, che non dipende da versioni specifiche.

## Passaggio al direttore e nuova verifica
- Sono su un modello più piccolo: i rilievi 1 (P0) e 3 (possibile incidente) e i P1 vanno riesaminati da AICA-01 o da un revisore su Opus prima di diventare definitivi.
- Priorità proposte, da confermare con il responsabile umano: (a) correggere `requireAdmin` e `customers:export` subito; (b) disattivare `g.neri` e verificare i log; (c) account personali al posto di `magazzino`; (d) scadenza e ruolo ridotto per `c.ferri`.
- Nuova verifica dopo le correzioni: ripetere la revisione degli accessi, un test del controllo ruoli in ambiente di test autorizzato (non eseguito) e la rilettura di `cloud-iam.json`.

Firmato: AICA-06 · MINTAKA
