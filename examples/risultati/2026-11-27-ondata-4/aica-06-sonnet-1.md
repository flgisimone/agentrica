AICA-06 · MINTAKA — Senior Identity & Access Management Engineer, reparto AICA (AI Cybersecurity)

Rapporto IAM per AICA-01 · VEGA. Non ho caricato VEGA con `agent`, perché il tool non era disponibile in questa prova.

**Perimetro e metodo.** Ho fatto un'analisi documentale in sola lettura di `iam/` (README, roles.yaml, cloud-iam.json, access-review-2026-11.csv) e di `app/auth.js`. Per i punti che toccano l'autorizzazione ho letto anche le rotte in `app/server.js` e `app/orders.js`. Non ho modificato nulla e non ho eseguito scansioni attive. Le schede della biblioteca usate sono ASVS 5.0.0 e NIST CSF 2.0, verificate il 2026-11-19. Gli id ASVS si citano come v5.0.0-x.y.z, ma non ho verificato i numeri dei singoli requisiti, quindi non li riporto.

**Sintesi.** `requireAdmin` ha il controllo invertito. Chi non è `customer` è considerato admin, quindi `operator` e `auditor` ottengono le funzioni riservate all'admin. Il resto sono violazioni delle regole `iam/README.md` nei dati di accesso: un account condiviso, un cessato ancora attivo e un esterno admin senza scadenza.

**Rilievi**

1. **P1 — Controllo dei ruoli invertito: operator e auditor diventano admin.**
   - Evidenza: `app/auth.js:55`, `if (req.user.role !== "customer") return next();`. Il codice blocca solo `customer` e lascia passare ogni altro ruolo.
   - Le rotte protette sono in `app/server.js:32-34`: elenco utenti, cambio ruolo ed export clienti. Sono quindi aperte a `operator` e `auditor`.
   - Violazione della regola 3 di `iam/README.md`, perché `customers:export` deve essere solo per `admin`.
   - `auditor` in `iam/roles.yaml:9-10` ha solo `orders:read` e `users:read`, ma di fatto può esportare i clienti.
   - Un `operator` (`roles.yaml:7`) può cambiare i ruoli con `setRole` (`auth.js:63-67`), quindi promuovere sé stesso o altri ad admin.
   - Impatto: escalation di privilegi e accesso all'export dei clienti, che contiene dati personali, senza MFA (`roles.yaml:8` e `:11`). Questo aggira anche la regola 2.
   - Correzione proposta: `if (req.user.role === "admin") return next();`, con deny di default.
   - Per il coinvolgimento di dati personali va informata la Privacy & Compliance Agency.

2. **P1 — Un operator può esportare i clienti per definizione del ruolo, e senza MFA.**
   - Evidenza: `iam/roles.yaml:7` assegna `customers:export` a `operator`, con `mfa: false` a riga 8.
   - Contraddice le regole 2 e 3 di `iam/README.md`.
   - Anche dopo la correzione del rilievo 1, la definizione del ruolo resta in conflitto con la policy.
   - Correzione proposta: togliere `customers:export` da `operator`, oppure far approvare alla direzione una modifica della regola.

3. **P1 — Account condiviso `magazzino`.**
   - Evidenza: `iam/access-review-2026-11.csv:4`. Il ruolo è `operator`, senza MFA, attivo, "turno A/B, postazione condivisa".
   - Viola la regola 1.
   - Perché è P1: ha anche l'export clienti (rilievo 2), quindi gli accessi non sono attribuibili a una persona.
   - Correzione proposta: sostituirlo con account personali. Se serve una postazione comune, usare un'identità personale per il turno.

4. **P1 — Dipendente cessato con account admin ancora attivo.**
   - Evidenza: `iam/access-review-2026-11.csv:5`. `g.neri`, ruolo admin, stato "attivo", cessato il 2026-09-30, ultimo accesso 2026-11-12.
   - Viola la regola 5. L'account è orfano da circa 2 mesi e risulta usato dopo la cessazione.
   - Dopo la cessazione l'accesso non è più legittimo.
   - Va trattato come possibile accesso non autorizzato, quindi proposta di apertura di un'indagine con `sec-incident-response` e il responsabile umano.
   - Correzione proposta: disattivare subito l'account, preservare i log degli accessi del 2026-11-12 e verificare le azioni compiute. Il disattivo richiede l'approvazione del responsabile umano.

5. **P2 — Consulente esterno admin senza scadenza.**
   - Evidenza: `iam/access-review-2026-11.csv:7`. `c.ferri` è esterno, admin, con colonna `scadenza` vuota, "contratto annuale".
   - Viola la regola 4: i 90 giorni sono il massimo.
   - Ha anche privilegi eccessivi: è anche `org-admin` con AdministratorAccess (`iam/cloud-iam.json:67-71`, membri `a.bianchi` e `c.ferri`).
   - Correzione proposta: imporre la scadenza, ridurre il ruolo al minimo necessario per la consulenza e far rinnovare il referente interno.

6. **P2 — Policy di `svc-deploy` troppo ampia.**
   - Evidenza: `iam/cloud-iam.json:20-29`.
   - `ec2:RunInstances`, `ec2:TerminateInstances` e `ssm:SendCommand` valgono su `Resource: "*"`.
   - `iam:PassRole` vale su `Resource: "*"`: può passare qualunque ruolo, anche amministrativo, a risorse che crea.
   - Viola la regola 7 (solo i permessi del compito).
   - L'autenticazione OIDC è corretta, e la trust policy è limitata al ramo `main` (`cloud-iam.json:9`).
   - Correzione proposta: limitare le risorse con ARN e condizioni, e restringere `PassRole` al solo ruolo della VM.

7. **P2 — `svc-backup` con `s3:*` sul bucket.**
   - Evidenza: `iam/cloud-iam.json:41`.
   - Il backup notturno ha bisogno di scrivere (Put/List). Con `s3:*` può anche cancellare, cambiare le policy del bucket ed eliminare i backup.
   - Rischio aggiuntivo: un ransomware con questa identità potrebbe distruggere i backup.
   - Correzione proposta: ridurre ai soli `PutObject` e `ListBucket`, e valutare Object Lock o versioning.

8. **P2 — Account `auditor` esterno (`revisore.kpmx`) con MFA assente.**
   - Evidenza: `iam/access-review-2026-11.csv:8` (`mfa=no`). Ha la scadenza 2026-12-31, quindi la regola 4 è rispettata.
   - `roles.yaml:10` ha `mfa: false` per `auditor`.
   - La regola 2 richiede MFA solo per `admin` e per chi può esportare, quindi non c'è violazione formale. Però, a causa del rilievo 1, l'auditor oggi può esportare, e la MFA sarebbe una mitigazione.
   - Se si corregge il rilievo 1, il rilievo scende a P3.

9. **P3 — Revisione e disattivazione automatica non evidenti.**
   - `iam/roles.yaml:16-18` dichiara `inactivity_disable_days: 60`. Nel CSV `l.verdi` e gli altri risultano attivi, ma `s.galli` (cessata il 2026-04-02, `access-review-2026-11.csv:6`) è correttamente disattivata.
   - Nel CSV il gap sta in `g.neri` (rilievo 4): la procedura HR → IT non ha funzionato per la cessazione di settembre.
   - Il file di revisione è del 2026-11, ma non c'è evidenza che sia stato rivisto dopo la cessazione (la regola 8 chiede la revisione trimestrale).
   - Correzione proposta: aggiungere nel CSV le colonne `revisore` e `data_revisione`.

10. **P3 — `emergency-admin`.**
    - Evidenza: `iam/access-review-2026-11.csv:9`. È disattivato, con ultimo accesso "mai" e ultimo controllo della busta il 2026-10-01. È conforme alla regola 6.
    - Nota per la prossima revisione: il controllo trimestrale della busta e dell'uso è stato eseguito (2026-10-01), e va ripetuto.

**Fuori dal perimetro, segnalati senza analisi.**
- `app/auth.js:36-41`: `resetPassword` non verifica `expires_at`, e il token non viene invalidato dopo l'uso. È un problema di autenticazione, da portare a `sec-appsec-engineer`.
- `app/auth.js:25`: `forgotPassword` cerca anche utenti non attivi.
- `app/orders.js:53`: l'export clienti scrive il log con livello `debug`, quindi può non essere tracciato, in contrasto con la regola 6 sull'uso registrato.
- `app/orders.js:52-54`: nessuna correzione necessaria al CSV in questo perimetro, ma i dati personali richiedono la Privacy Agency.
- Non c'è un controllo MFA applicato al login (`app/auth.js:10-22`): la regola 2 per `admin` non è applicata dal codice.

**Aree non verificate.** Non ho potuto confrontare i dati con lo stato reale dei sistemi (l'elenco reale delle utenze, i log di accesso, la configurazione IAM in produzione). Il CSV è l'unica fonte per gli account. Non ho controllato `infra/`, `security/`, `incidente/` né `logging/`, fuori dal compito.

**Riesame.** Se questo rapporto è prodotto da un modello più piccolo di quello della sessione, i rilievi P1 (1-4) vanno riesaminati dal direttore AICA-01 o da un revisore su Opus prima di diventare definitivi. Il rilievo 4 va portato subito all'attenzione dell'utente.

Rilievi firmati: AICA-06 · MINTAKA.
