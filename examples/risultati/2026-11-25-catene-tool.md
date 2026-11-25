# Catene di chiamate ai tool di Agentrica — 2026-11-25

Fonte: file di sessione di Claude Code di 28 progetti (0 file saltati). Byte misurati sul testo dei risultati; token stimati come byte / 4. Nessun testo di sessione, percorso o id.

Intermedio: un risultato seguito da un'altra chiamata ad Agentrica prima del messaggio successivo dell'utente, esclusi i testi di istruzioni (`agent`, `agente`, `library`) che il modello deve leggere. È il limite superiore di ciò che Code Mode toglierebbe dal contesto.

## Esito

**Soglia non superata**: Code Mode resta rinviato.

| Misura | Valore | Soglia |
|---|---|---|
| Sessioni con almeno una catena di 4+ chiamate programmabili (senza istruzioni né `ask_user`) | 4 su 24 (16,7%) | oltre 20% |
| Quota di byte intermedi per sessione (mediana) | 4,4% | oltre 30% |

## Totali

- Sessioni con chiamate ad Agentrica: 24; catene: 36 (1 nei subagent); chiamate: 177.
- Byte dei risultati: 535,6 KB (~137.103 token); intermedi: 79,7 KB (14,9%).

## Lunghezza delle catene

Tutte le chiamate ad Agentrica della catena, comprese istruzioni e `ask_user`.

| Chiamate | Catene |
|---|---|
| 1 | 16 |
| 2 | 5 |
| 3 | 1 |
| 4–5 | 4 |
| 6+ | 10 |

## Per tool

| Tool | Chiamate | Byte | Media | Intermedi | Errori |
|---|---|---|---|---|---|
| `agent` | 50 | 371,5 KB | 7,4 KB | 0 KB | 0 |
| `list_agents` | 13 | 74,8 KB | 5,8 KB | 74,7 KB | 1 |
| `agente` | 7 | 35,3 KB | 5 KB | 0 KB | 0 |
| `library` | 13 | 29,4 KB | 2,3 KB | 0 KB | 0 |
| `elenca_agenti` | 4 | 15,6 KB | 3,9 KB | 0 KB | 0 |
| `ask_user` | 44 | 4,8 KB | 0,1 KB | 2,1 KB | 4 |
| `report` | 37 | 2,6 KB | 0,1 KB | 2,5 KB | 0 |
| `open_panel` | 6 | 1,4 KB | 0,2 KB | 0,2 KB | 0 |
| `check` | 3 | 0,1 KB | 0 KB | 0,1 KB | 0 |

## Chiamante

Il campo `caller` di Claude Code: `direct` è la chiamata del modello; un altro valore è una chiamata programmatica del client.

| Chiamante | Chiamate |
|---|---|
| `direct` | 177 |

