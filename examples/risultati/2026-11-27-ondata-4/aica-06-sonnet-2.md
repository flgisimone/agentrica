AICA-06 · MINTAKA — Senior Identity & Access Management Engineer, reparto AICA (AI Cybersecurity)

Ho esaminato in sola lettura `iam/` e `app/auth.js` rispetto a `iam/README.md`. Per capire dove si applica il controllo dei ruoli ho letto anche le rotte in `app/server.js` e `orders.js:51-53`. Non ho caricato AICA-01 · VEGA: non ho il server MCP e il compito era circoscritto. Il rapporto va quindi a VEGA tramite chi mi ha lanciato.

## Esito
Ho trovato 1 P0, 5 P1, 4 P2 e 2 P3. Il rilievo più grave è il controllo dei ruoli rotto in `requireAdmin`. I percorsi sono relativi alla cartella del progetto.

## Rilievi

**1. P0 — `requireAdmin` lascia passare tutti i ruoli tranne `customer`** (`app/auth.js:55`)
- Il codice è `if (req.user.role !== "customer") return next();`. Dovrebbe ammettere solo `admin`.
- Operator e auditor passano quindi le rotte `/api/admin/*` (`app/server.js:32-34`).
- Un operatore, senza MFA, può eseguire `exportCustomers` e violare la regola 3 e in parte la 2.
- Un operatore o un auditor può chiamare `setRole` e promuovere sé stesso o altri ad `admin`. Questa è un'escalation di privilegi.
- Un auditor, che nel modello (`iam/roles.yaml:9-11`) ha solo `orders:read` e `users:read`, ottiene scrittura e export.
- Nota: la matrice ruoli in `roles.yaml` risulta non applicata dal codice. Il controllo è un solo confronto di stringa.

**2. P1 — Account cessato ancora attivo** (`iam/access-review-2026-11.csv:5`)
- `g.neri`, admin, è cessato il 2026-09-30 ma risulta attivo, con ultimo accesso il 2026-11-12, cioè dopo la cessazione.
- Viola la regola 5 e può indicare un uso non autorizzato.
- Serve disattivarlo, verificare gli accessi successivi al 30/09 e farne una segnalazione di incidente al responsabile IT.
- Dettaglio collegato: `requireUser` (`auth.js:43-52`) non verifica `active` a ogni richiesta e il JWT dura 8 ore (`auth.js:19`), quindi la disattivazione non revoca i token già emessi.

**3. P1 — Consulente esterno admin senza scadenza, anche sul cloud** (`access-review...csv:7`, `cloud-iam.json:66-72`)
- `c.ferri` è esterno, ha ruolo admin e non ha scadenza. La regola 4 prevede al massimo 90 giorni.
- È anche membro di `org-admin` con `AdministratorAccess` sull'account cloud. Per un consulente gestionale è un accesso sproporzionato (privilegio minimo, regola 7).

**4. P1 — Operatore con export clienti e senza MFA** (`roles.yaml:6-8`)
- Il ruolo `operator` ha `customers:export` e `mfa: false`.
- La regola 3 limita l'export ad `admin`. La regola 2 richiede MFA per chi può esportare.

**5. P1 — Account condiviso `magazzino`** (`access-review...csv:4`)
- È una postazione usata dai turni A e B, con ruolo `operator` e senza MFA. Viola la regola 1.
- Le azioni non sono attribuibili a una persona.
- Come operator, con il rilievo 1 raggiunge anche le funzioni admin.

**6. P1 — `svc-deploy` con permessi troppo ampi** (`cloud-iam.json:20-29`)
- Ha `ec2:RunInstances`, `TerminateInstances`, `ssm:SendCommand` e `iam:PassRole` con `Resource: "*"`.
- `iam:PassRole` su `*` insieme a `RunInstances` consente di lanciare istanze con qualunque ruolo, `org-admin` escluso perché è per utenti. È un percorso classico di escalation.
- `ssm:SendCommand` su `*` permette di eseguire comandi su qualsiasi istanza.
- Il trust OIDC è invece corretto: senza chiavi statiche e limitato al ramo `main` del repository.
- La regola 7 chiede solo i permessi del compito. Vanno ristretti con ARN specifici, condizioni sui tag e `PassRole` ai soli ruoli necessari.

**7. P2 — `resetPassword` non controlla la scadenza e non invalida il token** (`auth.js:35-41`)
- Seleziona `expires_at` ma non lo confronta. Il token resta valido a tempo indefinito.
- Non viene eliminato dopo l'uso, quindi è riutilizzabile.
- Il reset non revoca le sessioni già aperte.
- Rende inefficace il limite di 30 minuti impostato in `auth.js:28`.

**8. P2 — La MFA non è applicata dal codice** (`auth.js:10-22`, `roles.yaml:14`)
- Il login emette il JWT con la sola password, anche per `admin`, per cui `mfa: true` è solo dichiarato.
- La regola 2 risulta non applicata a livello applicativo.
- Dall'evidenza non posso dire se la MFA sia gestita altrove, per esempio da un proxy o da un IdP. È da chiarire.

**9. P2 — `svc-backup` con `s3:*`** (`cloud-iam.json:41`)
- Il ruolo può cancellare o sovrascrivere i backup, anche in caso di compromissione dell'istanza.
- Per un backup notturno bastano di norma `PutObject` e `ListBucket`. Servono anche Object Lock o versioning.

**10. P2 — `setRole` e `listUsers` senza controlli e senza traccia** (`auth.js:59-68`)
- `setRole` non registra chi ha cambiato quale ruolo e non impedisce l'auto-promozione.
- Non c'è conferma né un secondo passaggio per concedere `admin`.
- Aggrava il rilievo 1.

**11. P3 — Revisione degli accessi con lacune** (`access-review-2026-11.csv`)
- La revisione di novembre non ha segnalato la cessazione di `g.neri` come anomalia: è nota solo nella colonna note.
- Mancano le colonne per l'esito e l'approvatore.
- Manca la prova della cadenza trimestrale: il repository contiene un solo file, di novembre.
- `iam/roles.yaml:17-18` dichiara `inactivity_disable_days: 60`. Non vedo un meccanismo che lo applichi.

**12. P3 — `emergency-admin`** (`access-review...csv:9`)
- È conforme alla regola 6 per quanto documentato: disattivato, MFA hardware, busta in cassaforte.
- L'ultimo controllo è del 2026-10-01 e va ripetuto nella prossima revisione.
- Non c'è evidenza di un registro dell'uso.
- Il valore è `mai`, quindi non ci sono segnali di uso.

## Conformità alle regole (per quanto verificato)

| Regola | Esito |
|---|---|
| 1 | Violata (`magazzino`) |
| 2 | Violata (operator) e non applicata dal codice |
| 3 | Violata (`roles.yaml:7` e `auth.js:55`) |
| 4 | Violata (`c.ferri`); `revisore.kpmx` è conforme (scadenza 2026-12-31) |
| 5 | Violata (`g.neri`); `s.galli` disattivata correttamente |
| 6 | Conforme per quanto documentato |
| 7 | Parziale: OIDC corretto, permessi eccessivi |
| 8 | Parziale (rilievo 11) |

## Limiti e aree non verificate
- Non ho visto lo stato reale del database `users`, gli utenti del cloud, la configurazione SSO o MFA, i log di accesso di `g.neri` né le credenziali. L'esame è solo documentale.
- Non ho verificato se le rotte non-admin applichino i permessi per risorsa, per esempio `orders:read:own`. Lo `orders.js` è stato letto solo per `exportCustomers`.
- Non ho fatto verifiche attive e non ho modificato nulla.

## Domande aperte
1. `g.neri` risulta cessato ma attivo: l'accesso del 2026-11-12 è stato un uso legittimo, per esempio di un token residuo, o è anomalo?
2. La MFA è imposta a livello di rete o di IdP?
3. Qual è il contratto di `c.ferri` e serve davvero `AdministratorAccess` sul cloud?

## Correzioni proposte (da confermare, con approvazione e rollback)
- Fare di `requireAdmin` un confronto `=== "admin"`, o un controllo basato sui permessi di `roles.yaml`, con test.
- Disattivare `g.neri`. Rendere `requireUser` consapevole di `active` e dei token revocabili, con durata del JWT più breve.
- Eliminare l'account condiviso, assegnare account personali e togliere `customers:export` da `operator`.
- Imporre una scadenza a `c.ferri` e togliergli `AdministratorAccess`.
- Restringere `svc-deploy` e `svc-backup`. Verificare la scadenza e consumare il token in `resetPassword`.

## Riesame consigliato
Il rapporto è prodotto da Sonnet e contiene un P0 e diversi P1. Propongo il riesame del direttore AICA-01 o di un revisore su Opus prima che diventi definitivo.

Schede della biblioteca consultate: NIST CSF 2.0 (2.0, verificata il 2026-11-19, da ricontrollare entro il 2027-05-19) e OWASP ASVS 5.0.0 (5.0.0, stessa verifica). Le due schede non cambiano le conclusioni. Servono come riferimento per mappare i rilievi: Govern/Protect (PR.AA) per il CSF, e requisiti ASVS da citare come v5.0.0-… Non dichiaro il progetto conforme né non conforme a nessuno dei due.

— AICA-06 · MINTAKA
