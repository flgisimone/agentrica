# F51 — Misura dei modelli, quarta ondata: cyber, privacy e software

**Obiettivo**: chiudere le ondate per reparto decise in F49 con gli otto specialisti che restano di cybersecurity, privacy e software, sui tre progetti di F37 estesi. Dopo F51 ogni ruolo è misurato o è `inherit` per una decisione scritta.

> **Stato: da fare**. Perimetro e configurazioni decisi con l'utente il 2026-11-26 all'apertura di F49; le proposte e il backlog si confermano all'apertura.

**Agenzie**: software (QA per casi e conteggi, Backend per catalogo e subagent, Code Reviewer). Cybersecurity, privacy e software sono l'**oggetto** della misura, non revisori.

## Situazione di partenza

- In F37 AICA-06 e AISA-04 sono rimasti `inherit` per un falso in più su Sonnet. Le schede sono state chiarite dopo la prima ondata: questa è la nuova misura.
- Progetti di F37: [portale-ordini](../examples/progetti/portale-ordini/) (AICA), [scuola-lingue](../examples/progetti/scuola-lingue/) (AIPCA), [gestionale-magazzino](../examples/progetti/gestionale-magazzino/) (AISA), con le schede in `examples/casi/`.

## Decisioni dell'utente (2026-11-26, all'apertura di F49)

| Tema | Decisione |
|---|---|
| Perimetro | Otto ruoli. Cyber: AICA-06 IAM (di nuovo), 08 Incident Response, 12 Security Awareness. Privacy: AIPCA-03 Legal, 09 Data Breach. Software: AISA-03 Functional Analyst, 04 Backend (di nuovo), 06 Full Stack |
| Auditor e ruoli di giudizio | AICA-10 e AIPCA-10 restano `inherit` senza misura, come i direttori, Architect, Security Architect, Code Reviewer, DPIA e Pentest |
| Configurazioni | Opus 5.5 effort medio e Sonnet 5.5, due esecuzioni ciascuna: 32 esecuzioni, circa 8M token |
| Casi | Si estendono i tre progetti di F37 invece di crearne di nuovi |

## Proposte da confermare

- **Materiali nuovi per i ruoli nuovi**: per AICA-08 un incidente con log e cronologia in `portale-ordini`; per AICA-12 le regole interne per il personale; per AIPCA-03 l'informativa e la cookie policy in `scuola-lingue`; per AIPCA-09 una violazione da valutare con il registro; per AISA-03 una richiesta funzionale in `gestionale-magazzino`; per AISA-06 una funzione da capo a fondo da rivedere.
- **AICA-06 e AISA-04 sulle schede chiarite**: stessi compiti e stessi difetti di F37, così la nuova misura è confrontabile con la prima.
- **Haiku per AICA-12**: il materiale di formazione è un risultato quasi meccanico; due esecuzioni in più.
- **I difetti nuovi non toccano quelli di F37**, così le schede della prima ondata restano valide.

## Backlog

Da confermare all'apertura. Stessa forma di F49 (materiali nei progetti, schede aggiornate, esecuzioni Opus e Sonnet in gruppi di al più 7, conteggio con un valutatore per ruolo, tabella dei modelli, `models` e `model:` nei subagent, proposte ai file di ruolo, README e CHANGELOG). In più la chiusura del rilievo P2 di F24 e F37: tutti i ruoli misurati o `inherit` per una decisione scritta.

## Criteri di accettazione

Come in F49, e in più: nella riga «Modelli» di [README.md](README.md) ogni ruolo `inherit` ha il suo motivo (direttore, ruolo di giudizio, auditor o soglia non superata).
