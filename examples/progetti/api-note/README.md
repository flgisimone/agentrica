# api-note

API REST per le note di un piccolo team, senza dipendenze (Node 22).

```sh
npm start
```

| Metodo | Percorso | Cosa fa |
|---|---|---|
| GET | `/notes` | elenca le note |
| POST | `/notes` | crea una nota (`{ "title", "text" }`) |
| DELETE | `/notes/:id` | cancella una nota |
| GET | `/attachments?name=<file>` | scarica un allegato dalla cartella `allegati/` |

Le richieste usano l'intestazione `Authorization: Bearer <token>`.
