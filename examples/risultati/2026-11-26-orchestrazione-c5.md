# Orchestrazione: C5 ripetuto (2026-11-26, F48)

Caso: [orchestrazione-newsletter](../casi/orchestrazione-newsletter.md), rilievo P2 di F43 (C5 rosso in un'esecuzione su Opus 5.5). Client: Claude Code 2.1.332 da terminale in modo non interattivo (`claude -p`), modello Opus 5.5 (`claude-opus-5-5`), con il solo server del progetto (`--strict-mcp-config --mcp-config .mcp.json`) e il metodo del [2026-11-22](2026-11-22-orchestrazione.md): `acceptEdits` più `list_agents`, `agent`, `library`, `Read`, `Glob`, `Grep`, `Write`, `Edit`; `ask_user` e `Bash` negati. Un turno solo, la richiesta del caso: C5 si vede dal primo turno. Ogni esecuzione su un progetto nuovo da `init` (F0 «da fare»). Criteri contati con `npm run -s orchestration -- <sessione.jsonl>`.

Limite: valgono anche le regole personali di chi esegue la prova (`~/.claude/rules/`). C6 e C7 restano alla prova nel client.

## Serie 1: 0.17.0 da npm

| Esecuzione | Agenti | C2 | C5 |
|---|---|---|---|
| 1 | AISA-01 | sì | no |
| 2 | AISA-01 | sì | no |
| 3 | AISA-01 | sì | no |
| 4 | AISA-01 | sì | no |
| 5 | AISA-01 | no (`list_agents` mai chiamato) | no |

Rosse 5 su 5. Lo script le dava verdi per C5, perché con un reparto solo l'ordine fra reparti passava sempre: corretto in F48-03 (il primo reparto deve essere AIBPD). Il modello va dal direttore software perché F0, la base tecnica, è «da fare» e lo starter chiede di chiudere F0 prima di tutto; nella risposta propone l'ordine giusto (business → design → privacy → conferma → software), ma per F1, dopo F0. Con la regola decisa all'apertura (2 o più rosse) si aggiunge una frase alle istruzioni del server.

## Serie 2: frase «parte dal direttore business»

Server del branch `fase/f48-rilievi`, istruzioni con: «Una richiesta di una funzione nuova parte dal direttore business anche se il progetto non ha ancora lo stack o F0 è da fare: la base tecnica è lavoro del software, dopo la conferma.»

| Esecuzione | Agenti | C2 | C5 |
|---|---|---|---|
| 1 | AIBPD-01 | sì | sì |
| 2 | AIBPD-01 → AIWDA-01 → AIPCA-01 | no | sì |
| 3 | AIBPD-01 | no | sì |
| 4 | AIBPD-01 | no | sì |
| 5 | AIBPD-01 | no | sì |

C5 verde 5 su 5, C2 rosso 4 su 5: con il nome del direttore nella frase il modello lo carica senza chiamare prima `list_agents`.

## Serie 3: frase «parte da list_agents e poi dal direttore business»

Frase finale (it; in inglese la stessa): «Una richiesta di una funzione nuova parte da list_agents e poi dal direttore business, anche se il progetto non ha ancora lo stack o F0 è da fare: la base tecnica è lavoro del software, dopo la conferma.»

| Esecuzione | Agenti | C1–C6 |
|---|---|---|
| 1 | AIBPD-01 | verdi |
| 2 | AIBPD-01 | verdi |
| 3 | AIBPD-01 → AIWDA-01 → AIPCA-01 (poi `check`) | verdi |
| 4 | AIBPD-01 | verdi |
| 5 | AIBPD-01 | verdi |

C1–C6 verdi 5 su 5; `list_agents` sempre prima di `agent`. Istruzioni a circa 3.150 caratteri su 4.096. Le esecuzioni in cui c'è solo AIBPD-01 si fermano alle domande del direttore business: in modo non interattivo nessuno risponde, e `ask_user` è negato.
