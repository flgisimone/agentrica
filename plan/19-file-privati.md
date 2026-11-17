# F19 — File di lavoro fuori dal repository pubblico

**Obiettivo**: decidere quali cartelle servono solo all'utente (piano, audit, documenti, prove) e toglierle dal repository pubblico senza perderle.

> **Stato: sospesa** il 2026-11-16, all'apertura, senza modifiche: per scelta dell'utente resta tutto com'è e tutto resta pubblico. Il pannello conta come chiuse solo le fasi «completata» e «sospesa», per questo lo stato è «sospesa» anche se la fase è abbandonata.

**Agenzie**: software (DevOps, Architect, Code Reviewer); cybersecurity (Cloud Security) per cosa resta visibile nella storia; privacy (Legal Specialist) per le note legali, che citano il repository.

## Situazione di partenza

Cosa usa ciascuna cartella oggi:

| Cartella | Chi la usa | Può uscire dal repository pubblico? |
|---|---|---|
| `agents/` | catalogo, sito, pacchetto npm (`prepack` la copia), CI di release, controllo del contenuto in `verify` | **No**: è il prodotto. Senza, il pacchetto non si costruisce dalla CI e la provenance non copre i testi |
| `packages/`, `apps/site/` | codice | No (il sito va in F17) |
| `plan/` | l'utente e le sessioni di Claude Code; il pannello lo legge nel progetto di chi lo usa, non qui; i README del pacchetto lo citano come esempio del formato | Sì, sistemando i link dei README |
| `audit/` | l'utente; evidenza pubblica delle revisioni di sicurezza e privacy di F5 e F10 | Sì, perdendo la trasparenza delle revisioni |
| `docs/` | l'utente | Sì |
| `examples/` | le prove degli agenti (rilievo P2 di F15-03); il README del pacchetto (npm e registro) la cita come prova ripetibile dei risultati | Sì, ma i risultati dichiarati nel README non sarebbero più verificabili da chi legge |
| `.claude/agents/` | i subagent delle sessioni di sviluppo; da F18 anche `init` del pacchetto, che li copia nei progetti nuovi (`prepack`) | **No** da F18, come `agents/` |
| `starter/` | da F18 il modello di progetto di `init`, copiato da `prepack` | **No**: è il prodotto. Contiene l'altra copia di `docs/AI Multi-Agency System.md` (F18-R1) |
| `AGENTS.md`, `CONVENTIONS.md`, `CLAUDE.md` | sessioni di Claude Code | Sì, con le stesse avvertenze di `plan/` |

## Proposte da confermare

- **Dove vanno**:
  - A (proposta) nel repository privato di F17, accanto al sito: restano versionate, con backup su GitHub, e le sessioni di sviluppo lavorano lì;
  - B nel `.gitignore` di questo repository: restano solo sul disco dell'utente, senza storia né backup;
  - C un repository privato a parte solo per piano e audit.
- **Storia**: ciò che è già stato pushato resta visibile nella storia pubblica; riscriverla (`git filter-repo`) rompe i tag `v*`, la provenance dei pacchetti pubblicati e i link del registro MCP. Proposta: non riscrivere, togliere dal ramo e basta.
- **Regole**: AGENTS, CONVENTIONS e la chiusura di fase (§13.7) cambiano percorsi; `tokensave` e `npm run verify` devono continuare a girare.

## Decisioni dell'utente

| Tema | Decisione |
|---|---|
| Cartelle | Prima la verifica di cosa serve al prodotto. `agents/`, `.claude/agents/`, `starter/`, `packages/`, `scripts/` e `.github/` servono al pacchetto o alla CI. `examples/` non la legge nessun codice, ma il README su npm e la landing la citano come prova ripetibile, quindi resta pubblica. `plan/`, `audit/` e `docs/` le usano solo l'utente e le sessioni |
| Cartelle vuote con `.gitkeep` | Proposta dell'utente, sconsigliata nella sessione: qui nessuno le legge e la struttura vuota per i progetti nuovi la crea già `starter/` |
| Regole | `AGENTS.md`, `CONVENTIONS.md` e `CLAUDE.md` restano pubblici |
| Esito | Fase abbandonata: resta tutto com'è e tutto resta pubblico, `plan/`, `audit/` e `docs/` compresi. Nessuna modifica a codice, link o storia |

## Backlog

Nessuno: fase abbandonata all'apertura.

## Criteri di accettazione

Non applicabili: la fase è abbandonata. Quelli scritti all'apertura erano:


- `agents/` resta nel repository pubblico; il pacchetto si costruisce e si pubblica come prima.
- Le cartelle tolte esistono ancora, nella sede scelta, con la loro storia se la sede è un repository.
- Nessun link rotto nei README pubblicati (pacchetto, registro MCP, sito).

## Fatto

- Nessuna modifica: la fase si chiude all'apertura per scelta dell'utente (2026-11-16).

## Verifiche

- `npm run verify` sul branch della fase (cambia solo `plan/`).

## Rilievi aperti

- Nessuno.
