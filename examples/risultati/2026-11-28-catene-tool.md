# Catene di chiamate ai tool di Agentrica — 2026-11-28

Fonte: file di sessione di Claude Code di 43 progetti (0 file saltati). Byte misurati sul testo dei risultati; token stimati come byte / 4. Nessun testo di sessione, percorso o id.

Intermedio: un risultato seguito da un'altra chiamata ad Agentrica prima del messaggio successivo dell'utente, esclusi i testi di istruzioni (`agent`, `agente`, `library`) che il modello deve leggere. È il limite superiore di ciò che Code Mode toglierebbe dal contesto.

## Esito

**Soglia non superata**: Code Mode resta rinviato.

| Misura | Valore | Soglia |
|---|---|---|
| Sessioni con almeno una catena di 4+ chiamate programmabili (senza istruzioni né `ask_user`) | 4 su 42 (9,5%) | oltre 20% |
| Quota di byte intermedi per sessione (mediana) | 10% | oltre 30% |

## Totali

- Sessioni con chiamate ad Agentrica: 42; catene: 57 (1 nei subagent); chiamate: 230.
- Byte dei risultati: 771,2 KB (~197.418 token); intermedi: 164,6 KB (21,3%).

## Lunghezza delle catene

Tutte le chiamate ad Agentrica della catena, comprese istruzioni e `ask_user`.

| Chiamate | Catene |
|---|---|
| 1 | 22 |
| 2 | 9 |
| 3 | 10 |
| 4–5 | 5 |
| 6+ | 11 |

## Per tool

| Tool | Chiamate | Byte | Media | Intermedi | Errori |
|---|---|---|---|---|---|
| `agent` | 69 | 518,5 KB | 7,5 KB | 0 KB | 0 |
| `list_agents` | 23 | 159,6 KB | 6,9 KB | 159,5 KB | 1 |
| `agente` | 7 | 35,3 KB | 5 KB | 0 KB | 0 |
| `library` | 15 | 31,7 KB | 2,1 KB | 0 KB | 0 |
| `elenca_agenti` | 4 | 15,6 KB | 3,9 KB | 0 KB | 0 |
| `ask_user` | 44 | 4,8 KB | 0,1 KB | 2,1 KB | 4 |
| `report` | 51 | 3,8 KB | 0,1 KB | 2,7 KB | 14 |
| `open_panel` | 6 | 1,4 KB | 0,2 KB | 0,2 KB | 0 |
| `check` | 11 | 0,5 KB | 0 KB | 0,1 KB | 1 |

## Chiamante

Il campo `caller` di Claude Code: `direct` è la chiamata del modello; un altro valore è una chiamata programmatica del client.

| Chiamante | Chiamate |
|---|---|
| `direct` | 230 |

