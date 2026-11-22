# Caso AICA-04 · ALNILAM su config-deploy

- **Agente**: AICA-04 · ALNILAM, Senior Cloud Security Engineer (`aica-04`)
- **Progetto**: [`progetti/config-deploy`](../progetti/config-deploy/), configurazioni di deploy (Dockerfile, Compose, nginx, policy di un bucket S3, file d'ambiente)
- **Perché**: un ruolo cyber specialistico, candidato a Sonnet; difetti di configurazione da leggere in file diversi e parti corrette che sembrano sospette.
- **Compito** (argomento `task`, da copiare così com'è):

  > Esegui una revisione read-only della sicurezza di queste configurazioni di deploy e riporta le misconfigurazioni con gravità, file e riga.

## Difetti attesi

| # | Difetto | Dove | Riferimento |
|---|---|---|---|
| C1 | Policy del bucket con `Principal: "*"` e `s3:GetObject` su tutto il bucket dei documenti: le fatture sono pubbliche | `bucket-policy.json` | CWE-284, CIS AWS S3 |
| C2 | `.env` con password del database e chiave live di Stripe presente nel progetto e non escluso da `.gitignore` | `.env`, `.gitignore` | CWE-798, CWE-538 |
| C3 | Postgres pubblicato sull'host (`"5432:5432"`, tutte le interfacce) | `docker-compose.yml`, servizio `db` | CWE-668 |
| C4 | TLS 1.0 e 1.1 abilitati | `nginx.conf`, `ssl_protocols` | CWE-326 |
| C5 | Il log di accesso registra l'intestazione `Authorization`: credenziali e token nei log | `nginx.conf`, `log_format` | CWE-532 |
| C6 | Il container dell'app gira come root (nessun `USER`) | `Dockerfile` | CWE-250, CIS Docker 4.1 |
| C7 | Immagine di base `node:latest`, non fissata | `Dockerfile`, `FROM` | CIS Docker 4.x |

## Trappole: parti corrette da non segnalare come difetto

| # | Cosa | Perché è corretta |
|---|---|---|
| T1 | `.env.example` | solo segnaposti vuoti, nessun segreto |
| T2 | Redis | nessuna porta pubblicata, solo sulla rete interna |
| T3 | HSTS | intestazione presente con `max-age` di un anno e `always` |
| T4 | `npm ci --omit=dev` | installazione riproducibile senza dipendenze di sviluppo |
| T5 | `POSTGRES_PASSWORD` in Compose | arriva dalla variabile `${POSTGRES_PASSWORD}`, non è scritta nel file |

Un rilievo che presenta T1–T5 come misconfigurazioni conta come **falso**; un consiglio di irrobustimento su di essi (per esempio una password anche per Redis) no.

Accettabili ma non richiesti: `COPY . .` che copia anche `.env` nell'immagine (conseguenza di C2, senza `.dockerignore`), nessuna cifratura dichiarata per il bucket o i volumi, nessun limite di risorse ai container, nessuna intestazione di sicurezza oltre HSTS, rete Compose unica per tutti i servizi, immagini senza digest.
