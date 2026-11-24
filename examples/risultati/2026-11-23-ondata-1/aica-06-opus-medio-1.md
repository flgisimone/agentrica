«AICA-06 · MINTAKA — Senior Identity & Access Management Engineer, reparto AICA (AI Cybersecurity)»

**Segnalazione immediata, P0.** `g.neri` è un account **admin** ancora **attivo**. Secondo HR la persona è cessata il 2026-09-30, ma l'ultimo accesso è del **2026-11-12**, sei settimane dopo la cessazione (`iam/access-review-2026-11.csv:5`). Può essere un uso non autorizzato in corso. Prima di toccare l'account vanno preservati i log di login e delle azioni admin dal 2026-09-30 in poi (SIEM con 30 giorni di conservazione più l'archivio sulla VM). La decisione su disattivazione e risposta all'incidente spetta al responsabile umano. Consiglio di coinvolgere l'Incident Response.

---

## Sintesi per la direzione
Le regole di `iam/README.md` sono sensate, ma configurazione e codice non le applicano:
- **App, controllo admin rovesciato.** `requireAdmin` lascia passare chiunque non sia `customer`. Operatori, revisore esterno e account condiviso del magazzino, nessuno con MFA, possono quindi esportare i clienti e promuoversi `admin`. Le rotte `/api/admin/*` sono raggiungibili da Internet.
- **App, MFA assente.** Il login non ha nessuna MFA, nemmeno per `admin`.
- **Account.** C'è un account admin di un ex dipendente ancora in uso (P0), un account condiviso del magazzino e un consulente esterno admin senza scadenza, che è anche amministratore dell'intero account cloud.
- **Cloud.** La pipeline usa OIDC, ma ha permessi da cui si arriva a privilegi da amministratore (`iam:PassRole` su `*`, `ssm:SendCommand` su `*`). Il ruolo di backup può cancellare i backup.

Totale: 1 P0, 6 P1, 5 P2, 3 P3. Sono rilievi su file e codice, non una certificazione.

## Perimetro e autorizzazioni
- Il compito assegnato copre in sola lettura `iam/` (README, roles.yaml, cloud-iam.json, access-review-2026-11.csv) e `app/auth.js`.
- Ho consultato `app/server.js`, `app/orders.js`, `app/upload.js` e `infra/nginx.conf` solo per capire come si usano i controlli e quanto sono esposte le rotte.
- Nessuna modifica, nessun processo avviato, nessuna verifica attiva.

## Metodologia
Confronto riga per riga dei file con le 8 regole di `iam/README.md`, approvate il 2026-03-02, e analisi statica del flusso di autorizzazione: rotta → middleware → handler.

## Rilievi

| # | Gravità | File:riga | Rilievo |
|---|---|---|---|
| 1 | **P0** | `iam/access-review-2026-11.csv:5` | `g.neri`: admin attivo, cessato il 2026-09-30, ultimo accesso 2026-11-12. Viola la regola 5 (disattivazione il giorno stesso) e l'accesso dopo la cessazione è un possibile accesso non autorizzato. La revisione di novembre lo elenca senza averlo trattato. |
| 2 | P1 | `app/auth.js:55` (usato in `app/server.js:32-34`) | `requireAdmin` usa una lista di esclusione: `if (req.user.role !== "customer") return next();`. Così `operator` e `auditor` accedono a `listUsers`, `setRole` ed `exportCustomers`. Con `setRole` (`auth.js:63-68`, nessun controllo su chi modifica chi) un operatore o il revisore esterno possono darsi il ruolo `admin`. `/api/admin/*` passa da `location /` (`infra/nginx.conf:32`) ed è quindi pubblico: la restrizione VPN vale solo per `/admin/` (riga 43). Viola le regole 3 e 7 (privilegio minimo). Correzione: controllo positivo `role === "admin"`, meglio ancora basato sui permessi di `roles.yaml`. |
| 3 | P1 | `app/auth.js:10-22` e `iam/roles.yaml:14` | Il login non ha nessun fattore MFA: `mfa: true` per admin resta una dichiarazione non applicata. Viola la regola 2. Gli admin (`a.bianchi`, `c.ferri`, `g.neri`) entrano con la sola password da Internet. |
| 4 | P1 | `iam/roles.yaml:7-8` | `operator` ha `customers:export` con `mfa: false`. Viola la regola 3 (export solo per admin) e la regola 2 (MFA per chi esporta). Lo stesso vale nei fatti per `l.verdi` (csv:3) e per l'account `magazzino` (csv:4). |
| 5 | P1 | `iam/access-review-2026-11.csv:4` | `magazzino`: account condiviso fra i turni A/B, ruolo operator, senza MFA. Viola la regola 1. Le azioni non sono attribuibili a nessuno e, con i rilievi 2 e 4, l'account può esportare i clienti e diventare admin. |
| 6 | P1 | `iam/access-review-2026-11.csv:7` e `iam/cloud-iam.json:67-71` | `c.ferri`: consulente esterno, admin applicativo senza scadenza («contratto annuale»), quindi viola la regola 4 (al massimo 90 giorni). È anche membro di `org-admin` con `AdministratorAccess` sull'account cloud: privilegio eccessivo per un consulente gestionale. MFA presente, che è un controllo compensativo. |
| 7 | P1 | `iam/cloud-iam.json:20-29` | `svc-deploy`: `ec2:RunInstances`, `ec2:TerminateInstances` e `ssm:SendCommand` su `Resource: "*"`, più `iam:PassRole` su `"*"`. Con PassRole e RunInstances si può avviare un'istanza con qualunque ruolo, `AdministratorAccess` compreso se esiste un profilo di istanza adatto. Con SendCommand si eseguono comandi su qualunque istanza, compresa la VM di produzione. Viola la regola 7. OIDC e la condizione `sub` limitata a `main` (righe 6-9) sono corretti. |
| 8 | P2 | `app/auth.js:43-52` | `requireUser` verifica solo il JWT (8 h, `auth.js:19`) e non rilegge `active` né `role` dal DB. Un account disattivato o declassato resta operativo fino alla scadenza del token. Indebolisce la regola 5 e rende inefficaci le revoche immediate. |
| 9 | P2 | `app/auth.js:35-40` | Reset della password: `expires_at` viene letto ma non controllato, il token non si invalida dopo l'uso, è salvato in chiaro e le sessioni esistenti non vengono revocate. Un link trapelato permette di prendere un account, admin compresi, in qualunque momento. |
| 10 | P2 | `app/auth.js:63-67` | `setRole` non registra nessun evento di audit (chi, quando, ruolo precedente e nuovo): i cambi di privilegio non sono tracciabili. |
| 11 | P2 | `iam/cloud-iam.json:39-42` | `svc-backup`: `s3:*` sul bucket dei backup. Comprende cancellazione di oggetti e bucket e modifica di policy, versioning e lifecycle: una VM compromessa può distruggere i backup. Va ridotto a `s3:PutObject` (più `ListBucket` se serve), con il ripristino affidato a un ruolo separato. |
| 12 | P2 | `iam/access-review-2026-11.csv:8` | `revisore.kpmx`: l'intestatario è uno studio («Studio Revisori KPMX»), non una persona. È probabilmente condiviso fra più revisori (regola 1). Non ha MFA e, per il rilievo 2, ha di fatto accesso admin. La scadenza 2026-12-31 c'è, ma senza data di inizio non si può verificare il limite dei 90 giorni. |
| 13 | P3 | `iam/cloud-iam.json:17-18`, `55-56` | Push e pull ECR su `Resource: "*"`. Vanno limitati all'ARN del repository (`ecr:GetAuthorizationToken` resta su `*`). |
| 14 | P3 | `iam/cloud-iam.json:49` | Il trust di `vm-portale-ordini` è aperto a qualunque EC2, senza vincolo di istanza: con il PassRole su `*` del rilievo 7 qualunque istanza avviata dalla pipeline può riceverlo. |
| 15 | P3 | `iam/roles.yaml:1` e `app/auth.js` | Il file dice che i ruoli sono «letti da admin e app all'avvio», ma `auth.js` non usa né i permessi né il flag `mfa`. Il modello dei ruoli dichiarato e quello applicato divergono. |

## Conformi, in base alle evidenze disponibili
- `s.galli` è stata disattivata il giorno della cessazione (csv:6).
- `emergency-admin` è disattivato, con chiave hardware e busta controllata il 2026-10-01 (csv:9). La regola delle due persone e il registro d'uso non sono verificabili qui.
- `svc-deploy` usa OIDC senza chiavi statiche.
- `org-admin` ha `mfa_required: true`.
- `vm-portale-ordini` legge solo i segreti `portale-ordini/prod/*`.
- Nessun account attivo supera i 60 giorni di inattività.

## Impatto
L'impatto principale è una catena realistica di escalation da Internet: un account non-customer senza MFA (condiviso, esterno o operatore) può diventare admin ed esportare i dati dei clienti. A questo si aggiungono l'uso non spiegato di un account admin dopo la cessazione e una pipeline che può arrivare al controllo dell'account cloud. Sono coinvolti dati personali dei clienti: va coinvolta la Privacy & Compliance Agency per l'eventuale valutazione di un data breach legata al rilievo 1.

## Correzioni, da approvare e da gestire come modifiche
1. **Rilievo 1.** Preservare le evidenze, poi disattivare `g.neri` e revocarne le sessioni. Indagine sugli accessi successivi al 2026-09-30.
2. **Rilievo 2.** Correggere `requireAdmin` in una lista positiva, aggiungere test negativi per operator e auditor e controllare `setRole` (niente auto-promozione).
3. **Rilievo 3.** Introdurre la MFA (TOTP o WebAuthn) per admin e per chi esporta.
4. **Rilievi 4 e 5.** Togliere `customers:export` a operator. Sostituire `magazzino` con account personali, eventualmente con cambio rapido di utente sulla postazione.
5. **Rilievo 6.** Scadenza di 90 giorni per `c.ferri` e uscita da `org-admin`, oppure un ruolo cloud ridotto con accesso temporaneo.
6. **Rilievo 7.** PassRole limitato al solo ruolo dell'istanza con `iam:PassedToService`, RunInstances e SendCommand limitati a tag o ARN della VM.
7. **Rilievi 8-12.** Rilettura di `active` e `role` dal DB (oppure token brevi con revoca), reset monouso con controllo della scadenza e token salvato come hash, audit di `setRole`, backup in sola scrittura, account nominativi per i revisori.

## Rischio residuo
Anche dopo le correzioni restano due punti deboli: la revisione degli accessi, che non ha intercettato i rilievi 1, 5 e 6, e la dipendenza dagli admin cloud. Serve una revisione trimestrale con un esito per ogni riga (mantenere, revocare, motivare) e la firma del referente.

## Limiti e aree non verificate
- Ho analizzato solo i file: non ho visto lo stato reale dell'IdP, del cloud o del DB.
- Il csv è un'istantanea e non ho log per confermare il rilievo 1.
- Le revisioni dei trimestri precedenti non sono presenti, quindi la cadenza della regola 8 non è verificabile.
- La biblioteca del reparto (OWASP ASVS 5.0.0 e Top 10:2025) e il direttore AICA-01 non erano disponibili in questa prova, quindi i rilievi non citano requisiti ASVS.
- Le osservazioni sui comportamenti AWS e jsonwebtoken vengono dalle mie conoscenze, non da fonti verificate: possono essere superate.
- Non ho esaminato `admin` (8081), perché il suo codice non è nel repository.

## Piano della nuova verifica
- Test unitari o e2e per tutte le rotte `/api/admin/*`, con ciascuno dei 4 ruoli: atteso 403 per tutti tranne admin.
- Verifica che a un login admin senza secondo fattore venga negato l'accesso.
- Nuova lettura di `roles.yaml`, `cloud-iam.json` e del csv del trimestre successivo, con un esito per ogni account.
- Simulazione della policy IAM di `svc-deploy` su PassRole verso un ruolo admin: attesa la negazione.

Firmato: AICA-06 · MINTAKA
